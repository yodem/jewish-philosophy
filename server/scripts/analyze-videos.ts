import axios from 'axios'

// Configuration
const ANALYSIS_API_URL = 'http://localhost:4000/analyzeYouTubeVideo'
const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337'
const STRAPI_URL = `${STRAPI_BASE_URL}/api`
const DELAY_MS = parseInt(process.env.DELAY_MS || '2000')

// Categories will be fetched from Strapi dynamically

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Construct YouTube URL from video ID
function constructYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

async function fetchAllVideos() {
  console.log('🔍 Fetching all videos from Strapi...')
  try {
    const res = await axios.get(`${STRAPI_URL}/videos?populate=*`)
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
    const res = await axios.get(`${STRAPI_URL}/categories`)
    const categories = res.data.data || []
    console.log(`🏷️  Found ${categories.length} categories`)
    return categories
  } catch (error: any) {
    console.error('❌ Failed to fetch categories:', error.message)
    throw error
  }
}

async function analyzeVideoWithAI(video: any, categoryNames: string[]) {
  const videoId = video.videoId
  if (!videoId) {
    console.log(`⚠️  Skipping video - no videoId`)
    return null
  }

  const youtubeUrl = constructYouTubeUrl(videoId)
  console.log(`🎥 Analyzing video: ${video.title}`)
  console.log(`🔗 YouTube URL: ${youtubeUrl}`)
  console.log(`🏷️  Using category names: ${categoryNames.join(', ')}`)

  try {
    // Send to YouTube Analysis API using NAMES for AI processing
    const response = await axios.post(ANALYSIS_API_URL, {
      youtubeUrl: youtubeUrl,
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
    console.log(`📝 Description: ${result.description?.substring(0, 100)}...`)
    console.log(`🏷️  Returned category names: ${result.categories?.join(', ')}`)

    return {
      description: result.description,
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

    // Filter categories to match only the returned array names
    const matchingCategories = categories.filter(cat =>
      analysisResult.categories.includes(cat.name)
    )

    if (matchingCategories.length === 0) {
      console.log(`⚠️  No matching categories found in Strapi`)
      return video
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

    // Update description if provided and different from current
    const currentDescription = video.description || ''
    if (analysisResult.description && analysisResult.description !== currentDescription) {
      updatePayload.data.description = analysisResult.description
    }

    // Update categories if any were found using the connect syntax
    if (categoryDocumentIds.length > 0) {
      updatePayload.data.categories = {
        connect: categoryDocumentIds
      }
    }

    // Only update if there's something to update
    if (Object.keys(updatePayload.data).length === 0) {
      console.log(`⚠️  No updates needed for this video`)
      return video
    }

    // Only log the data being updated to Strapi
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

async function processVideo(video: any, categories: any[], categorySlugs: string[]) {
  console.log(`\n🎬 Processing video: ${video.title} (ID: ${video.id})`)

  // Analyze video with AI
  const analysisResult = await analyzeVideoWithAI(video, categorySlugs)
  if (!analysisResult) {
    return null
  }

  // Update video in Strapi
  const updatedVideo = await updateVideoInStrapi(video, analysisResult, categories)
  return updatedVideo
}

async function main() {
  console.log(`🚀 Starting YouTube Video Analysis & Update Script...`)
  console.log('🔗 Analysis API:', ANALYSIS_API_URL)
  console.log('🗄️  Strapi URL:', STRAPI_URL)

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

    // Process videos one by one
    for (const video of videos) {
      processedCount++
      console.log(`\n🎬 Processing video ${processedCount}/${videos.length}: ${video.title}`)
      
      const result = await processVideo(video, categories, categoryNames)
      if (result) {
        successCount++
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
    console.log(`❌ Failed: ${processedCount - successCount} videos`)

  } catch (error: any) {
    console.error('💥 Script failed:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)
