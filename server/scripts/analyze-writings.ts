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

interface WritingData {
  id: number
  documentId: string
  title: string
  description?: string
  type?: 'book' | 'article'
  slug: string
  views?: number
  categories?: CategoryData[]
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

async function fetchAllWritings(): Promise<WritingData[]> {
  console.log('🔍 Fetching writings without categories from Strapi...')
  
  try {
    const query = qs.stringify({
      filters: {
        categories: {
          $null: true
        }
      },
      pagination: {
        pageSize: PAGINATION_SIZE
      },
      sort: ['createdAt:desc']
    })
    
    const response: AxiosResponse<StrapiResponse<WritingData[]>> = await axios.get(
      `${STRAPI_URL}/writings?${query}`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      }
    )
    
    const writings = response.data.data || []
    console.log(`📄 Found ${writings.length} writings without categories`)
    
    return writings
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to fetch writings:', errorMessage)
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

// Helper function to extract meaningful text from rich content
function extractTextFromRichContent(content: string): string {
  if (!content) return ''
  
  // Remove basic HTML tags and get first 500 characters for analysis
  const textContent = content
    .replace(/<[^>]*>/g, ' ')           // Remove HTML tags
    .replace(/\s+/g, ' ')              // Normalize whitespace
    .trim()
  
  // Return first 500 characters to avoid overwhelming the AI
  return textContent
}

async function analyzeWritingWithAI(
  writing: WritingData, 
  categoryNames: string[]
): Promise<AnalysisResult | null> {
  const { title, description, type } = writing

  if (!title || !description) {
    console.log(`⚠️  Skipping writing - missing title or description`)
    return null
  }

  // Extract meaningful text from rich content description
  const extractedDescription = extractTextFromRichContent(description)
  
  console.log(`📄 Analyzing writing: ${title}`)
  console.log(`📖 Type: ${type || 'not specified'}`)
  console.log(`📝 Description length: ${description.length} chars`)
  console.log(`🏷️  Using category names: ${categoryNames.join(', ')}`)

  try {
    const requestPayload: AnalysisRequest = {
      title,
      description: extractedDescription,
      categories: categoryNames
    }

    // Add type information as clarification if available
    if (type) {
      requestPayload.clarificationParagraph = `This is a ${type} writing.`
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
    console.error(`❌ Error analyzing writing: ${errorMessage}`)
    return null
  }
}

async function updateWritingInStrapi(
  writing: WritingData, 
  analysisResult: AnalysisResult, 
  categories: CategoryData[]
): Promise<WritingData | null> {
  try {
    console.log(`🔍 Writing data:`, {
      id: writing.id,
      documentId: writing.documentId,
      title: writing.title
    })

    if (!analysisResult.categories || analysisResult.categories.length === 0) {
      console.log(`⚠️  No categories returned from analysis`)
      return writing
    }

    // Filter categories to match only the returned array names
    const matchingCategories = categories.filter(cat =>
      analysisResult.categories!.includes(cat.name)
    )

    if (matchingCategories.length === 0) {
      console.log(`⚠️  No matching categories found in Strapi`)
      return writing
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
    if (writing.views !== undefined && writing.views !== null) {
      updatePayload.data.views = writing.views
    }

    console.log(`💾 Updating writing with data:`, JSON.stringify(updatePayload, null, 2))

    // Try updating with documentId first (Strapi v5), then fallback to id
    let updateUrl = `${STRAPI_URL}/writings/${writing.documentId || writing.id}`
    console.log(`🔗 Update URL: ${updateUrl}`)
    
    try {
      const updateResponse: AxiosResponse<StrapiResponse<WritingData>> = await axios.put(
        updateUrl, 
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          }
        }
      )
      
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated writing!`)
        return updateResponse.data.data
      }
    } catch (docError: unknown) {
      const statusCode = (docError as any)?.response?.status
      console.log(`⚠️  Document ID update failed (${statusCode}), trying with regular ID...`)
      
      updateUrl = `${STRAPI_URL}/writings/${writing.id}`
      console.log(`🔗 Fallback Update URL: ${updateUrl}`)

      const updateResponse: AxiosResponse<StrapiResponse<WritingData>> = await axios.put(
        updateUrl, 
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          }
        }
      )
      
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated writing with fallback!`)
        return updateResponse.data.data
      }
    }

    console.log(`❌ Failed to update writing`)
    return null

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Error updating writing in Strapi: ${errorMessage}`)
    
    if ((error as any)?.response) {
      console.error(`   Status: ${(error as any).response.status}`)
      console.error(`   Data:`, (error as any).response.data)
    }
    
    return null
  }
}

async function processWriting(
  writing: WritingData, 
  categories: CategoryData[], 
  categoryNames: string[]
): Promise<WritingData | null> {
  console.log(`\n📄 Processing writing: ${writing.title} (ID: ${writing.id})`)

  // Analyze writing with AI
  const analysisResult = await analyzeWritingWithAI(writing, categoryNames)
  if (!analysisResult) {
    return null
  }

  // Update writing in Strapi
  const updatedWriting = await updateWritingInStrapi(writing, analysisResult, categories)
  return updatedWriting
}

async function main(): Promise<void> {
  console.log(`🚀 Starting Writing Analysis & Update Script...`)
  console.log('🔗 Analysis API:', ANALYSIS_API_URL)
  console.log('🗄️  Strapi URL:', STRAPI_URL)
  console.log('⏱️  Delay between requests:', `${DELAY_MS}ms`)

  try {
    // Fetch data
    const [categories, writings] = await Promise.all([
      fetchCategories(),
      fetchAllWritings()
    ])

    if (categories.length === 0) {
      console.log('❌ No categories found in Strapi')
      return
    }

    if (writings.length === 0) {
      console.log('✅ No writings found to analyze')
      return
    }

    // Extract category names for the API (send names to AI)
    const categoryNames = categories
      .map(cat => cat.name)
      .filter((name): name is string => Boolean(name))
    
    console.log('📋 Using category names from Strapi:', categoryNames.join(', '))
    console.log(`\n📊 Processing ${writings.length} writings`)

    let processedCount = 0
    let successCount = 0
    let skippedCount = 0

    // Process writings one by one
    for (const writing of writings) {
      processedCount++
      console.log(`\n📄 Processing writing ${processedCount}/${writings.length}: ${writing.title}`)

      const result = await processWriting(writing, categories, categoryNames)
      
      if (result) {
        successCount++
      } else {
        skippedCount++
      }

      // Delay between writings
      if (processedCount < writings.length) {
        console.log(`⏱️  Waiting before next writing...`)
        await delay(DELAY_MS)
      }
    }

    console.log(`\n🎉 Analysis and update completed!`)
    console.log(`📊 Processed: ${processedCount} writings`)
    console.log(`✅ Successfully analyzed and updated: ${successCount} writings`)
    console.log(`⚠️  Skipped/Failed: ${skippedCount} writings`)

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('💥 Script failed:', errorMessage)
    process.exit(1)
  }
}

main().catch(console.error)
