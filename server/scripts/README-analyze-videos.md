# YouTube Video Analysis Script

This script analyzes YouTube videos from your Jewish philosophy content platform using AI and updates them with Hebrew descriptions and category classifications.

## Features

- ✅ Fetches all videos from Strapi CMS
- ✅ Uses categories from Strapi for AI analysis
- ✅ Sends videos to YouTube Analysis API for content analysis
- ✅ Updates videos with AI-generated descriptions and categories
- ✅ Handles Strapi v5 API with proper document IDs
- ✅ Batch processing with configurable delays
- ✅ Test mode for safe testing

## Prerequisites

1. **Strapi Server**: Must be running on `http://localhost:1337`
2. **YouTube Analysis API**: Must be running on `http://localhost:4000`
3. **Videos in Strapi**: Videos must have `videoId` field populated
4. **Categories in Strapi**: Categories must exist for classification

## Usage

### Test Mode (Recommended First)
Process only the first video to test the integration:

```bash
cd server
TEST_MODE=true npx tsx scripts/analyze-videos.ts
```

### Production Mode
Process all videos:

```bash
cd server
npx tsx scripts/analyze-videos.ts
```

Or explicitly set production mode:

```bash
cd server
TEST_MODE=false npx tsx scripts/analyze-videos.ts
```

## Configuration

### Environment Variables

- `STRAPI_BASE_URL`: Strapi server URL (default: `http://localhost:1337`)
- `BATCH_SIZE`: Number of videos to process per batch (default: `5`)
- `DELAY_MS`: Delay between video processing in milliseconds (default: `2000`)
- `TEST_MODE`: Set to `true` for test mode, `false` for production (default: `false`)

### API Endpoints

- **Strapi API**: `http://localhost:1337/api`
- **Analysis API**: `http://localhost:4000/analyzeYouTubeVideo`

## What the Script Does

1. **Fetch Categories**: Gets all categories from Strapi
2. **Fetch Videos**: Gets all videos from Strapi
3. **Extract Category Names**: Prepares Hebrew category names for AI analysis
4. **Process Each Video**:
   - Constructs YouTube URL from `videoId`
   - Sends to analysis API with categories
   - Receives AI-generated description and category matches
   - Updates video in Strapi with new data

## Output Example

```
🚀 Starting YouTube Video Analysis & Update Script (TEST MODE)...
📂 Fetching categories from Strapi...
🏷️  Found 5 categories
📋 Using categories from Strapi: פילוסופיה, הישארות הנפש, רמב״ם, בעיית הרוע, דת

🎬 Processing video: [Video Title] (ID: 5)
🎥 Analyzing video: [Video Title]
🔗 YouTube URL: https://www.youtube.com/watch?v=[VIDEO_ID]
✨ AI Analysis Results:
📝 Description: [Hebrew description from AI]...
🏷️  Categories: [Matched categories]
✅ Successfully updated video!

🎉 Analysis and update completed!
📊 Processed: 1 videos
✅ Successfully analyzed and updated: 1 videos
❌ Failed: 0 videos
```

## Error Handling

- **API Unavailable**: Script will fail gracefully with error messages
- **Invalid Video IDs**: Videos without `videoId` are skipped
- **Analysis Failures**: Individual video failures don't stop the batch
- **Network Issues**: Automatic retry with document ID fallback for Strapi v5

## Troubleshooting

### Common Issues

1. **"No categories found"**: Ensure categories exist in Strapi
2. **"API not available"**: Check if analysis service is running on port 4000
3. **"Strapi not responding"**: Ensure Strapi is running on port 1337
4. **"Video update failed"**: Check video permissions and API structure

### Debug Mode

Add console.log statements or check the detailed output for:
- Video data structure
- API request/response payloads
- Update URLs and payloads

## Integration Details

### YouTube Analysis API Format

**Request:**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "categories": ["פילוסופיה", "תורה", "חסידות"]
}
```

**Response:**
```json
{
  "success": true,
  "description": "תיאור בעברית...",
  "categories": ["פילוסופיה"]
}
```

### Strapi Update Format

**Request:**
```json
{
  "data": {
    "description": "AI-generated description",
    "categories": [1, 3, 5]
  }
}
```

## Safety Features

- **Test Mode**: Process only 1 video first
- **Batch Processing**: Avoid overwhelming APIs
- **Error Recovery**: Continue processing after individual failures
- **Rate Limiting**: Built-in delays between requests
- **Data Validation**: Skip videos with missing required fields

## Performance

- **Batch Size**: 5 videos per batch (configurable)
- **Delays**: 2 seconds between videos, 4 seconds between batches
- **Expected Rate**: ~15 videos per minute in production
- **Memory Usage**: Minimal, processes videos sequentially
