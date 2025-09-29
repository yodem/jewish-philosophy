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

async function fetchAllVideos() {
  console.log('🔍 Fetching all videos from Strapi...')
  try {
    const query = qs.stringify({
      pagination: {
        pageSize: 200
      }
    })
    
    const res = await axios.get(`${STRAPI_URL}/videos?${query}`)
    const videos = res.data.data || []
    console.log(`📹 Found ${videos.length} videos`)
    return videos
  } catch (error: any) {
    console.error('❌ Failed to fetch videos:', error.message)
    throw error
  }
}

async function fetchCategories() {
  console.log('📂 Fetching categories from Strapi...')
  try {
    const query = qs.stringify({
      populate: '*',
      pagination: {
        pageSize: 100
      }
    })
    
    const res = await axios.get(`${STRAPI_URL}/categories?${query}`)
    const categories = res.data.data || []
    console.log(`🏷️  Found ${categories.length} categories`)
    return categories
  } catch (error: any) {
    console.error('❌ Failed to fetch categories:', error.message)
    throw error
  }
}

async function analyzeVideoWithAI(video: any, categoryNames: string[]) {
  const title = video.title
  const description = video.description

  if (!title) {
    console.log(`⚠️  Skipping video - no title`)
    return null
  }

  console.log(`🎥 Analyzing video: ${title}`)
  if (description) {
    console.log(`📝 Description available (${description.length} chars)`)
  } else {
    console.log(`📝 No description available`)
  }
  console.log(`🏷️  Using category names: ${categoryNames.join(', ')}`)

  try {
    // Send to Static Data Analysis API using title and description
    const response = await axios.post(ANALYSIS_API_URL, {
      title: title,
      description: description || '', // Use empty string if no description
      categories: categoryNames,
      isYoutube: true,
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
    console.error(`❌ Error analyzing video: ${error.message}`)
    return null
  }
}

async function updateVideoInStrapi(video: any, analysisResult: any, categories: any[]) {
  try {
    console.log(`🔍 Video data:`, {
      id: video.id,
      documentId: video.documentId,
      title: video.title
    })

    if (!analysisResult.categories || analysisResult.categories.length === 0) {
      console.log(`⚠️  No categories returned from analysis`)
      return video
    }

    // Filter categories to match only the returned array names
    const matchingCategories = categories.filter(cat =>
      analysisResult.categories.includes(cat.name)
    )

    if (matchingCategories.length === 0) {
      console.log(`⚠️  No matching categories found in Strapi`)
      return video
    }

    // Use the documentIds of the remaining categories for connection
    const categoryDocumentIds = matchingCategories.map(cat => cat.documentId)
    const matchedNames = matchingCategories.map(cat => cat.name)

    console.log(`🔗 Found ${categoryDocumentIds.length} matching categories in Strapi by name`)
    console.log(`🏷️  Matched category names: ${matchedNames.join(', ')}`)

    // Prepare update payload - use 'set' to override existing categories
    const updatePayload = {
      data: {
        categories: {
          set: categoryDocumentIds
        }
      }
    }

    console.log(`💾 Updating video with data:`, JSON.stringify(updatePayload, null, 2))

    // Try updating with documentId first (Strapi v5), then fallback to id
    let updateUrl = `${STRAPI_URL}/videos/${video.documentId || video.id}`
    console.log(`🔗 Update URL: ${updateUrl}`)
    try {
      const updateResponse = await axios.put(updateUrl, updatePayload)
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated video!`)
        return updateResponse.data.data
      }
    } catch (docError: any) {
      console.log(`⚠️  Document ID update failed (${docError.response?.status}), trying with regular ID...`)
      updateUrl = `${STRAPI_URL}/videos/${video.id}`
      console.log(`🔗 Fallback Update URL: ${updateUrl}`)

      const updateResponse = await axios.put(updateUrl, updatePayload)
      if (updateResponse.data?.data) {
        console.log(`✅ Successfully updated video with fallback!`)
        return updateResponse.data.data
      }
    }

    console.log(`❌ Failed to update video`)
    return null

  } catch (error: any) {
    console.error(`❌ Error updating video in Strapi: ${error.message}`)
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Data:`, error.response.data)
    }
    return null
  }
}

async function processVideo(video: any, categories: any[], categoryNames: string[]) {
  console.log(`\n🎬 Processing video: ${video.title} (ID: ${video.id})`)

  // Analyze video with AI
  const analysisResult = await analyzeVideoWithAI(video, categoryNames)
  if (!analysisResult) {
    return null
  }

  // Update video in Strapi
  const updatedVideo = await updateVideoInStrapi(video, analysisResult, categories)
  return updatedVideo
}

async function main() {
  console.log(`🚀 Starting Video Static Data Analysis & Update Script...`)
  console.log('🔗 Analysis API:', ANALYSIS_API_URL)
  console.log('🗄️  Strapi URL:', STRAPI_URL)
  console.log('⏱️  Delay between requests:', `${DELAY_MS}ms`)

  try {
    // Fetch data
    const categories = await fetchCategories()
    const videos = await fetchAllVideos()

    if (categories.length === 0) {
      console.log('❌ No categories found in Strapi')
      return
    }

    if (videos.length === 0) {
      console.log('✅ No videos found to analyze')
      return
    }

    // Extract category names for the API (send names to AI)
    const categoryNames = categories.map(cat => cat.name).filter(name => name)
    console.log('📋 Using category names from Strapi:', categoryNames.join(', '))

    console.log(`\n📊 Processing ${videos.length} videos`)

    let processedCount = 0
    let successCount = 0
    let skippedCount = 0

    // Process videos one by one
    for (const video of videos) {
      processedCount++
      console.log(`\n🎬 Processing video ${processedCount}/${videos.length}: ${video.title}`)
      
      const result = await processVideo(video, categories, categoryNames)
      if (result) {
        successCount++
      } else {
        skippedCount++
      }

      // Delay between videos
      if (processedCount < videos.length) {
        console.log(`⏱️  Waiting before next video...`)
        await delay(DELAY_MS)
      }
    }

    console.log(`\n🎉 Analysis and update completed!`)
    console.log(`📊 Processed: ${processedCount} videos`)
    console.log(`✅ Successfully analyzed and updated: ${successCount} videos`)
    console.log(`⚠️  Skipped/Failed: ${skippedCount} videos`)

  } catch (error: any) {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
