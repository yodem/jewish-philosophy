import axios from 'axios'
import dotenv from 'dotenv'
import qs from 'qs'

// Load environment variables
dotenv.config()

// Configuration
const ANALYSIS_API_URL = 'http://localhost:4000/analyzeStaticData'
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'https://gorgeous-power-cb8382b5a9.strapiapp.com';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`
const DELAY_MS = parseInt(process.env.DELAY_MS || '2000')

// Categories will be fetched from Strapi dynamically

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchAllTerms() {
  console.log('🔍 Fetching all terms from Strapi...')
  try {
    const query = qs.stringify({
      populate: '*',
      pagination: {
        pageSize: 100
      }
    })
    
    const res = await axios.get(`${STRAPI_URL}/terms?${query}`)
    const terms = res.data.data || []
    console.log(`📝 Found ${terms.length} terms`)
    return terms
  } catch (error: any) {
    console.error('❌ Failed to fetch terms:', error.message)
    throw error
  }
}

async function fetchCategories() {
  console.log('📂 Fetching genre and term categories from Strapi...')
  try {
    const query = qs.stringify({
      filters: {
        $or: [
          { type: { $eq: 'genre' } },
          { type: { $eq: 'term' } }
        ]
      },
      populate: '*',
      pagination: {
        pageSize: 100
      }
    })
    
    const res = await axios.get(`${STRAPI_URL}/categories?${query}`)
    const categories = res.data.data || []
    console.log(`🏷️  Found ${categories.length} genre and term categories`)
    return categories
  } catch (error: any) {
    console.error('❌ Failed to fetch categories:', error.message)
    throw error
  }
}

async function analyzeTermWithAI(term: any, categoryNames: string[]) {
  const title = term.title
  const description = term.description

  if (!title || !description) {
    console.log(`⚠️  Skipping term - missing title or description`)
    return null
  }

  console.log(`📝 Analyzing term: ${term.title}`)
  console.log(`🏷️  Using category names: ${categoryNames.join(', ')}`)

  try {
    // Send to Static Data Analysis API
    const response = await axios.post(ANALYSIS_API_URL, {
      title: title,
      description: description,
      categories: categoryNames
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = response.data

    if (!result.success) {
      console.error(`❌ API returned error: ${result.message}`)
      return null
    }

    console.log(`✨ AI Analysis Results:`)
    console.log(`🏷️  Returned category names: ${result.categories?.join(', ')}`)

    return {
      categories: result.categories || [] // These are NAMES from AI
    }

  } catch (error: any) {
    console.error(`❌ Error analyzing term: ${error.message}`)
    return null
  }
}

async function updateTermInStrapi(term: any, analysisResult: any, categories: any[]) {
  try {
    console.log(`🔍 Term data:`, {
      id: term.id,
      documentId: term.documentId,
      title: term.title
    })

    // Filter categories to match only the returned array names
    const matchingCategories = categories.filter(cat =>
      analysisResult.categories.includes(cat.name)
    )

    if (matchingCategories.length === 0) {
      console.log(`⚠️  No matching categories found in Strapi`)
      return term
    }

    // Use the slugs of the remaining categories for connection
    const categoryDocumentIds = matchingCategories.map(cat => cat.documentId)
    const matchedNames = matchingCategories.map(cat => cat.name)

    console.log(`🔗 Found ${categoryDocumentIds.length} matching categories in Strapi by name`)
    console.log(`🏷️  Matched category names: ${matchedNames.join(', ')}`)

    // Prepare update payload
    const updatePayload: any = {
      data: {}
    }

    // Update categories if any were found using the set syntax (override existing)
    if (categoryDocumentIds.length > 0) {
      updatePayload.data.categories = {
        set: categoryDocumentIds
      }
    }

    // Only update if there's something to update
    if (Object.keys(updatePayload.data).length === 0) {
      console.log(`⚠️  No updates needed for this term`)
      return term
    }

    // Only log the data being updated to Strapi
    console.log(`💾 Updating term with data:`, JSON.stringify(updatePayload, null, 2))

    // Try updating with documentId first (Strapi v5), then fallback to id
    let updateUrl = `${STRAPI_URL}/terms/${term.documentId || term.id}`
    console.log(`🔗 Update URL: ${updateUrl}`)
    try {
      const updateResponse = await axios.put(updateUrl, updatePayload)
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated term!`)
        return updateResponse.data.data
      }
    } catch (docError: any) {
      console.log(`⚠️  Document ID update failed (${docError.response?.status}), trying with regular ID...`)
      updateUrl = `${STRAPI_URL}/terms/${term.id}`
      console.log(`🔗 Fallback Update URL: ${updateUrl}`)

      const updateResponse = await axios.put(updateUrl, updatePayload)
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated term with fallback!`)
        return updateResponse.data.data
      }
    }

    console.log(`❌ Failed to update term`)
    return null

  } catch (error: any) {
    console.error(`❌ Error updating term in Strapi: ${error.message}`)
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Data:`, error.response.data)
    }
    return null
  }
}

async function processTerm(term: any, categories: any[], categoryNames: string[]) {
  console.log(`\n📝 Processing term: ${term.title} (ID: ${term.id})`)

  // Analyze term with AI
  const analysisResult = await analyzeTermWithAI(term, categoryNames)
  if (!analysisResult) {
    return null
  }

  // Update term in Strapi
  const updatedTerm = await updateTermInStrapi(term, analysisResult, categories)
  return updatedTerm
}

async function main() {
  console.log(`🚀 Starting Term Analysis & Update Script...`)
  console.log('🔗 Analysis API:', ANALYSIS_API_URL)
  console.log('🗄️  Strapi URL:', STRAPI_URL)

  try {
    // Fetch data
    const categories = await fetchCategories()
    const terms = await fetchAllTerms()

    if (categories.length === 0) {
      console.log('❌ No categories found in Strapi')
      return
    }

    if (terms.length === 0) {
      console.log('✅ No terms found to analyze')
      return
    }

    // Extract category names for the API (send names to AI)
    const categoryNames = categories.map(cat => cat.name).filter(name => name)
    console.log('📋 Using category names from Strapi:', categoryNames.join(', '))

    console.log(`\n📊 Processing ${terms.length} terms`)

    let processedCount = 0
    let successCount = 0

    // Process terms one by one
    for (const term of terms) {
      processedCount++
      console.log(`\n📝 Processing term ${processedCount}/${terms.length}: ${term.title}`)

      const result = await processTerm(term, categories, categoryNames)
      if (result) {
        successCount++
      }

      // Delay between terms
      if (processedCount < terms.length) {
        console.log(`⏱️  Waiting before next term...`)
        await delay(DELAY_MS)
      }
    }

    console.log(`\n🎉 Analysis and update completed!`)
    console.log(`📊 Processed: ${processedCount} terms`)
    console.log(`✅ Successfully analyzed and updated: ${successCount} terms`)
    console.log(`❌ Failed: ${processedCount - successCount} terms`)

  } catch (error: any) {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
