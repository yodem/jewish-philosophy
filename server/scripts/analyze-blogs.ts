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

interface BlogData {
  id: number
  documentId: string
  title: string
  content: string
  description?: string
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

async function fetchAllBlogs(): Promise<BlogData[]> {
  console.log('🔍 Fetching blogs without categories from Strapi...')
  
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
    
    const response: AxiosResponse<StrapiResponse<BlogData[]>> = await axios.get(
      `${STRAPI_URL}/blogs?${query}`,
      {
        headers: {
          'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
      }
    )
    
    const blogs = response.data.data || []
    console.log(`📄 Found ${blogs.length} blogs without categories`)
    
    return blogs
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Failed to fetch blogs:', errorMessage)
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

async function analyzeBlogWithAI(
  blog: BlogData, 
  categoryNames: string[]
): Promise<AnalysisResult | null> {
  const { title, content, description } = blog

  if (!title || !content) {
    console.log(`⚠️  Skipping blog - missing title or content`)
    return null
  }

  // Extract meaningful text from rich content
  const extractedContent = extractTextFromRichContent(content)
  
  console.log(`📄 Analyzing blog: ${title}`)
  console.log(`📝 Content length: ${content.length} chars`)
  if (description) {
    console.log(`📋 Description available (${description.length} chars)`)
  } else {
    console.log(`📋 No description available`)
  }
  console.log(`🏷️  Using category names: ${categoryNames.join(', ')}`)

  try {
    const requestPayload: AnalysisRequest = {
      title,
      description: description || extractedContent, // Use description if available, otherwise extracted content
      categories: categoryNames
    }

    // Add extracted content as clarification if we have a separate description
    if (description && extractedContent) {
      requestPayload.clarificationParagraph = extractedContent
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
    console.error(`❌ Error analyzing blog: ${errorMessage}`)
    return null
  }
}

async function updateBlogInStrapi(
  blog: BlogData, 
  analysisResult: AnalysisResult, 
  categories: CategoryData[]
): Promise<BlogData | null> {
  try {
    console.log(`🔍 Blog data:`, {
      id: blog.id,
      documentId: blog.documentId,
      title: blog.title
    })

    if (!analysisResult.categories || analysisResult.categories.length === 0) {
      console.log(`⚠️  No categories returned from analysis`)
      return blog
    }

    // Filter categories to match only the returned array names
    const matchingCategories = categories.filter(cat =>
      analysisResult.categories!.includes(cat.name)
    )

    if (matchingCategories.length === 0) {
      console.log(`⚠️  No matching categories found in Strapi`)
      return blog
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
    if (blog.views !== undefined && blog.views !== null) {
      updatePayload.data.views = blog.views
    }

    console.log(`💾 Updating blog with data:`, JSON.stringify(updatePayload, null, 2))

    // Try updating with documentId first (Strapi v5), then fallback to id
    let updateUrl = `${STRAPI_URL}/blogs/${blog.documentId || blog.id}`
    console.log(`🔗 Update URL: ${updateUrl}`)
    
    try {
      const updateResponse: AxiosResponse<StrapiResponse<BlogData>> = await axios.put(
        updateUrl, 
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          }
        }
      )
      
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated blog!`)
        return updateResponse.data.data
      }
    } catch (docError: unknown) {
      const statusCode = (docError as any)?.response?.status
      console.log(`⚠️  Document ID update failed (${statusCode}), trying with regular ID...`)
      
      updateUrl = `${STRAPI_URL}/blogs/${blog.id}`
      console.log(`🔗 Fallback Update URL: ${updateUrl}`)

      const updateResponse: AxiosResponse<StrapiResponse<BlogData>> = await axios.put(
        updateUrl, 
        updatePayload,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          }
        }
      )
      
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated blog with fallback!`)
        return updateResponse.data.data
      }
    }

    console.log(`❌ Failed to update blog`)
    return null

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Error updating blog in Strapi: ${errorMessage}`)
    
    if ((error as any)?.response) {
      console.error(`   Status: ${(error as any).response.status}`)
      console.error(`   Data:`, (error as any).response.data)
    }
    
    return null
  }
}

async function processBlog(
  blog: BlogData, 
  categories: CategoryData[], 
  categoryNames: string[]
): Promise<BlogData | null> {
  console.log(`\n📄 Processing blog: ${blog.title} (ID: ${blog.id})`)

  // Analyze blog with AI
  const analysisResult = await analyzeBlogWithAI(blog, categoryNames)
  if (!analysisResult) {
    return null
  }

  // Update blog in Strapi
  const updatedBlog = await updateBlogInStrapi(blog, analysisResult, categories)
  return updatedBlog
}

async function main(): Promise<void> {
  console.log(`🚀 Starting Blog Analysis & Update Script...`)
  console.log('🔗 Analysis API:', ANALYSIS_API_URL)
  console.log('🗄️  Strapi URL:', STRAPI_URL)
  console.log('⏱️  Delay between requests:', `${DELAY_MS}ms`)

  try {
    // Fetch data
    const [categories, blogs] = await Promise.all([
      fetchCategories(),
      fetchAllBlogs()
    ])

    if (categories.length === 0) {
      console.log('❌ No categories found in Strapi')
      return
    }

    if (blogs.length === 0) {
      console.log('✅ No blogs found to analyze')
      return
    }

    // Extract category names for the API (send names to AI)
    const categoryNames = categories
      .map(cat => cat.name)
      .filter((name): name is string => Boolean(name))
    
    console.log('📋 Using category names from Strapi:', categoryNames.join(', '))
    console.log(`\n📊 Processing ${blogs.length} blogs`)

    let processedCount = 0
    let successCount = 0
    let skippedCount = 0

    // Process blogs one by one
    for (const blog of blogs) {
      processedCount++
      console.log(`\n📄 Processing blog ${processedCount}/${blogs.length}: ${blog.title}`)

      const result = await processBlog(blog, categories, categoryNames)
      
      if (result) {
        successCount++
      } else {
        skippedCount++
      }

      // Delay between blogs
      if (processedCount < blogs.length) {
        console.log(`⏱️  Waiting before next blog...`)
        await delay(DELAY_MS)
      }
    }

    console.log(`\n🎉 Analysis and update completed!`)
    console.log(`📊 Processed: ${processedCount} blogs`)
    console.log(`✅ Successfully analyzed and updated: ${successCount} blogs`)
    console.log(`⚠️  Skipped/Failed: ${skippedCount} blogs`)

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('💥 Script failed:', errorMessage)
    process.exit(1)
  }
}

main().catch(console.error)
