import axios, { AxiosResponse } from 'axios'
import dotenv from 'dotenv'
import qs from 'qs'

// Load environment variables
dotenv.config()

// Types
interface StrapiResponse<T> {
  data: T
  meta: {
    pagination?: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

interface ResponsaData {
  id: number
  documentId: string
  title: string
  content: string
  questioneer: string
  slug: string
  views?: number
  categories?: CategoryData[]
  comments?: CommentData[]
}

interface CommentData {
  id: number
  documentId: string
  answer: string
  answerer: string
  responsa?: ResponsaData
}

interface CategoryData {
  id: number
  documentId: string
  name: string
}

interface AnalysisResult {
  success: boolean
  message?: string
  categories?: string[]
}

interface AnalysisRequest {
  title: string
  description: string
  clarificationParagraph?: string
  categories: string[]
}

// Configuration
const ANALYSIS_API_URL = 'http://localhost:4000/analyzeStaticData'
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'https://gorgeous-power-cb8382b5a9.strapiapp.com'
const STRAPI_URL = `${STRAPI_BASE_URL}/api`
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
const DELAY_MS = parseInt(process.env.DELAY_MS || '2000')
const PAGINATION_SIZE = 100

// Helper function to add delay between API calls
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

async function fetchAllResponsas(): Promise<ResponsaData[]> {
  console.log('🔍 Fetching responsas without categories from Strapi...')
  
  try {
    const query = qs.stringify({
      filters: {
        categories: {
          $null: true
        }
      },
      populate: {
        comments: {
          filters: {
            publishedAt: { $notNull: true }
          },
          sort: ['createdAt:asc']
        }
      },
      pagination: {
        pageSize: PAGINATION_SIZE
      },
      sort: ['createdAt:desc']
    })
    
    const response: AxiosResponse<StrapiResponse<ResponsaData[]>> = await axios.get(
      `${STRAPI_URL}/responsas?${query}`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      }
    )
    
    const allResponsas = response.data.data || []
    
    // Filter to only include responsas that have at least one comment
    const responsasWithComments = allResponsas.filter(responsa => 
      responsa.comments && responsa.comments.length > 0
    )
    
    console.log(`❓ Found ${allResponsas.length} responsas without categories`)
    console.log(`💬 ${responsasWithComments.length} of them have comments`)
    
    return responsasWithComments
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to fetch responsas:', errorMessage)
    throw error
  }
}

async function fetchCategories(): Promise<CategoryData[]> {
  console.log('📂 Fetching all categories from Strapi...')
  
  try {
    const query = qs.stringify({
      populate: '*',
      pagination: {
        pageSize: PAGINATION_SIZE
      }
    })
    
    const response: AxiosResponse<StrapiResponse<CategoryData[]>> = await axios.get(
      `${STRAPI_URL}/categories?${query}`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      }
    )
    
    const categories = response.data.data || []
    console.log(`🏷️  Found ${categories.length} categories`)
    
    return categories
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to fetch categories:', errorMessage)
    throw error
  }
}

function getFirstComment(responsa: ResponsaData): string | undefined {
  if (!responsa.comments || responsa.comments.length === 0) {
    return undefined
  }
  
  // Comments are already sorted by ID ascending, so first one is the oldest
  const firstComment = responsa.comments[0]
  return firstComment.answer
}

async function analyzeResponsaWithAI(
  responsa: ResponsaData, 
  categoryNames: string[]
): Promise<AnalysisResult | null> {
  const { title, content } = responsa

  if (!title || !content) {
    console.log(`⚠️  Skipping responsa - missing title or content`)
    return null
  }

  const firstComment = getFirstComment(responsa)
  
  console.log(`❓ Analyzing responsa: ${title}`)
  if (firstComment) {
    console.log(`💬 Using first comment as clarification (${firstComment.length} chars)`)
  } else {
    console.log(`💬 No comments found for clarification`)
  }
  console.log(`🏷️  Using category names: ${categoryNames.join(', ')}`)

  try {
    const requestPayload: AnalysisRequest = {
      title,
      description: content,
      categories: categoryNames
    }

    // Add first comment as clarificationParagraph if available
    if (firstComment) {
      requestPayload.clarificationParagraph = firstComment
    }

    const response: AxiosResponse<AnalysisResult> = await axios.post(
      ANALYSIS_API_URL, 
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const result = response.data

    if (!result.success) {
      console.error(`❌ API returned error: ${result.message || 'Unknown error'}`)
      return null
    }

    console.log(`✨ AI Analysis Results:`)
    console.log(`🏷️  Returned category names: ${result.categories?.join(', ') || 'None'}`)

    return {
      success: true,
      categories: result.categories || []
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Error analyzing responsa: ${errorMessage}`)
    return null
  }
}

async function updateResponsaInStrapi(
  responsa: ResponsaData, 
  analysisResult: AnalysisResult, 
  categories: CategoryData[]
): Promise<ResponsaData | null> {
  try {
    console.log(`🔍 Responsa data:`, {
      id: responsa.id,
      documentId: responsa.documentId,
      title: responsa.title
    })

    if (!analysisResult.categories || analysisResult.categories.length === 0) {
      console.log(`⚠️  No categories returned from analysis`)
      return responsa
    }

    // Filter categories to match only the returned array names
    const matchingCategories = categories.filter(cat =>
      analysisResult.categories!.includes(cat.name)
    )

    if (matchingCategories.length === 0) {
      console.log(`⚠️  No matching categories found in Strapi`)
      return responsa
    }

    // Use the documentIds of the remaining categories for connection
    const categoryDocumentIds = matchingCategories.map(cat => cat.documentId)
    const matchedNames = matchingCategories.map(cat => cat.name)

    console.log(`🔗 Found ${categoryDocumentIds.length} matching categories in Strapi by name`)
    console.log(`🏷️  Matched category names: ${matchedNames.join(', ')}`)

    // Prepare update payload - use 'set' to override existing categories
    // Preserve views field if it exists
    const updatePayload: any = {
      data: {
        categories: {
          set: categoryDocumentIds
        }
      }
    }
    
    // Preserve views field if it exists
    if (responsa.views !== undefined && responsa.views !== null) {
      updatePayload.data.views = responsa.views
    }

    console.log(`💾 Updating responsa with data:`, JSON.stringify(updatePayload, null, 2))

    // Try updating with documentId first (Strapi v5), then fallback to id
    let updateUrl = `${STRAPI_URL}/responsas/${responsa.documentId || responsa.id}`
    console.log(`🔗 Update URL: ${updateUrl}`)
    
    try {
      const updateResponse: AxiosResponse<StrapiResponse<ResponsaData>> = await axios.put(
        updateUrl, 
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          }
        }
      )
      
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated responsa!`)
        return updateResponse.data.data
      }
    } catch (docError: unknown) {
      const statusCode = (docError as any)?.response?.status
      console.log(`⚠️  Document ID update failed (${statusCode}), trying with regular ID...`)
      
      updateUrl = `${STRAPI_URL}/responsas/${responsa.id}`
      console.log(`🔗 Fallback Update URL: ${updateUrl}`)

      const updateResponse: AxiosResponse<StrapiResponse<ResponsaData>> = await axios.put(
        updateUrl, 
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          }
        }
      )
      
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated responsa with fallback!`)
        return updateResponse.data.data
      }
    }

    console.log(`❌ Failed to update responsa`)
    return null

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Error updating responsa in Strapi: ${errorMessage}`)
    
    if ((error as any)?.response) {
      console.error(`   Status: ${(error as any).response.status}`)
      console.error(`   Data:`, (error as any).response.data)
    }
    
    return null
  }
}

async function processResponsa(
  responsa: ResponsaData, 
  categories: CategoryData[], 
  categoryNames: string[]
): Promise<ResponsaData | null> {
  console.log(`\n❓ Processing responsa: ${responsa.title} (ID: ${responsa.id})`)

  // Analyze responsa with AI
  const analysisResult = await analyzeResponsaWithAI(responsa, categoryNames)
  if (!analysisResult) {
    return null
  }

  // Update responsa in Strapi
  const updatedResponsa = await updateResponsaInStrapi(responsa, analysisResult, categories)
  return updatedResponsa
}

async function main(): Promise<void> {
  console.log(`🚀 Starting Responsa Analysis & Update Script...`)
  console.log('🔗 Analysis API:', ANALYSIS_API_URL)
  console.log('🗄️  Strapi URL:', STRAPI_URL)
  console.log('⏱️  Delay between requests:', `${DELAY_MS}ms`)

  try {
    // Fetch data
    const [categories, responsas] = await Promise.all([
      fetchCategories(),
      fetchAllResponsas()
    ])

    if (categories.length === 0) {
      console.log('❌ No categories found in Strapi')
      return
    }

    if (responsas.length === 0) {
      console.log('✅ No responsas (without categories but with comments) found to analyze')
      return
    }

    // Extract category names for the API (send names to AI)
    const categoryNames = categories
      .map(cat => cat.name)
      .filter((name): name is string => Boolean(name))
    
    console.log('📋 Using category names from Strapi:', categoryNames.join(', '))
    console.log(`\n📊 Processing ${responsas.length} responsas`)

    let processedCount = 0
    let successCount = 0
    let skippedCount = 0

    // Process responsas one by one
    for (const responsa of responsas) {
      processedCount++
      console.log(`\n❓ Processing responsa ${processedCount}/${responsas.length}: ${responsa.title}`)

      const result = await processResponsa(responsa, categories, categoryNames)
      
      if (result) {
        successCount++
      } else {
        skippedCount++
      }

      // Delay between responsas
      if (processedCount < responsas.length) {
        console.log(`⏱️  Waiting before next responsa...`)
        await delay(DELAY_MS)
      }
    }

    console.log(`\n🎉 Analysis and update completed!`)
    console.log(`📊 Processed: ${processedCount} responsas`)
    console.log(`✅ Successfully analyzed and updated: ${successCount} responsas`)
    console.log(`⚠️  Skipped/Failed: ${skippedCount} responsas`)

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('💥 Script failed:', errorMessage)
    process.exit(1)
  }
}

main().catch(console.error)
