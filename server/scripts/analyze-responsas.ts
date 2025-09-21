import axios from 'axios'

// Configuration
const ANALYSIS_API_URL = 'http://localhost:4000/analyzeStaticData'
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'https://gorgeous-power-cb8382b5a9.strapiapp.com';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`
const DELAY_MS = parseInt(process.env.DELAY_MS || '2000')

// Categories will be fetched from Strapi dynamically

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchAllResponsas() {
  console.log('🔍 Fetching all responsas from Strapi...')
  try {
    // Use pagination[pageSize]=100 to get more than default 25 items
    const res = await axios.get(`${STRAPI_URL}/responsas?populate=*&pagination[pageSize]=100`)
    const responsas = res.data.data || []
    console.log(`❓ Found ${responsas.length} responsas`)
    return responsas
  } catch (error: any) {
    console.error('❌ Failed to fetch responsas:', error.message)
    throw error
  }
}

async function fetchCategories() {
  console.log('📂 Fetching all categories from Strapi...')
  try {
    // Use pagination[pageSize]=100 to get more than default 25 items
    // Fetch all categories (term, person, genre)
    const res = await axios.get(`${STRAPI_URL}/categories?populate=*&pagination[pageSize]=100`)
    const categories = res.data.data || []
    console.log(`🏷️  Found ${categories.length} categories`)
    return categories
  } catch (error: any) {
    console.error('❌ Failed to fetch categories:', error.message)
    throw error
  }
}

async function analyzeResponsaWithAI(responsa: any, categoryNames: string[]) {
  const title = responsa.title
  const content = responsa.content

  if (!title || !content) {
    console.log(`⚠️  Skipping responsa - missing title or content`)
    return null
  }

  console.log(`❓ Analyzing responsa: ${responsa.title}`)
  console.log(`🏷️  Using category names: ${categoryNames.join(', ')}`)

  try {
    // Send to Static Data Analysis API
    const response = await axios.post(ANALYSIS_API_URL, {
      title: title,
      description: content, // Using content as description for analysis
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
    console.error(`❌ Error analyzing responsa: ${error.message}`)
    return null
  }
}

async function updateResponsaInStrapi(responsa: any, analysisResult: any, categories: any[]) {
  try {
    console.log(`🔍 Responsa data:`, {
      id: responsa.id,
      documentId: responsa.documentId,
      title: responsa.title
    })

    // Filter categories to match only the returned array names
    const matchingCategories = categories.filter(cat =>
      analysisResult.categories.includes(cat.name)
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

    // Prepare update payload
    const updatePayload: any = {
      data: {}
    }

    // Update categories if any were found using the connect syntax
    if (categoryDocumentIds.length > 0) {
      updatePayload.data.categories = {
        connect: categoryDocumentIds
      }
    }

    // Only update if there's something to update
    if (Object.keys(updatePayload.data).length === 0) {
      console.log(`⚠️  No updates needed for this responsa`)
      return responsa
    }

    // Only log the data being updated to Strapi
    console.log(`💾 Updating responsa with data:`, JSON.stringify(updatePayload, null, 2))

    // Try updating with documentId first (Strapi v5), then fallback to id
    let updateUrl = `${STRAPI_URL}/responsas/${responsa.documentId || responsa.id}`
    console.log(`🔗 Update URL: ${updateUrl}`)
    try {
      const updateResponse = await axios.put(updateUrl, updatePayload)
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated responsa!`)
        return updateResponse.data.data
      }
    } catch (docError: any) {
      console.log(`⚠️  Document ID update failed (${docError.response?.status}), trying with regular ID...`)
      updateUrl = `${STRAPI_URL}/responsas/${responsa.id}`
      console.log(`🔗 Fallback Update URL: ${updateUrl}`)

      const updateResponse = await axios.put(updateUrl, updatePayload)
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated responsa with fallback!`)
        return updateResponse.data.data
      }
    }

    console.log(`❌ Failed to update responsa`)
    return null

  } catch (error: any) {
    console.error(`❌ Error updating responsa in Strapi: ${error.message}`)
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Data:`, error.response.data)
    }
    return null
  }
}

async function processResponsa(responsa: any, categories: any[], categoryNames: string[]) {
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

async function main() {
  console.log(`🚀 Starting Responsa Analysis & Update Script...`)
  console.log('🔗 Analysis API:', ANALYSIS_API_URL)
  console.log('🗄️  Strapi URL:', STRAPI_URL)

  try {
    // Fetch data
    const categories = await fetchCategories()
    const responsas = await fetchAllResponsas()

    if (categories.length === 0) {
      console.log('❌ No categories found in Strapi')
      return
    }

    if (responsas.length === 0) {
      console.log('✅ No responsas found to analyze')
      return
    }

    // Extract category names for the API (send names to AI)
    const categoryNames = categories.map(cat => cat.name).filter(name => name)
    console.log('📋 Using category names from Strapi:', categoryNames.join(', '))

    console.log(`\n📊 Processing ${responsas.length} responsas`)

    let processedCount = 0
    let successCount = 0

    // Process responsas one by one
    for (const responsa of responsas) {
      processedCount++
      console.log(`\n❓ Processing responsa ${processedCount}/${responsas.length}: ${responsa.title}`)

      const result = await processResponsa(responsa, categories, categoryNames)
      if (result) {
        successCount++
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
    console.log(`❌ Failed: ${processedCount - successCount} responsas`)

  } catch (error: any) {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
