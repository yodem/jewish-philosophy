# Terms Analysis Script

This script analyzes terms from your Jewish philosophy content platform using AI and updates them with category classifications based on their title and description.

## Features

- ✅ Fetches all terms from Strapi CMS
- ✅ Uses categories from Strapi for AI analysis
- ✅ Sends terms to Static Data Analysis API for content analysis
- ✅ Updates terms with AI-suggested categories
- ✅ Handles Strapi v5 API with proper document IDs
- ✅ Batch processing with configurable delays
- ✅ Test mode for safe testing

## Prerequisites

1. **Strapi Server**: Must be running on `http://localhost:1337`
2. **Static Data Analysis API**: Must be running on `http://localhost:4000`
3. **Terms in Strapi**: Terms must have `title` and `description` fields populated
4. **Genre and Term Categories in Strapi**: Categories with type "genre" or "term" must exist for classification

## Usage

### Test Mode (Recommended First)
Process only the first term to test the integration:

```bash
cd server
TEST_MODE=true npx tsx scripts/analyze-terms.ts
```

### Production Mode
Process all terms:

```bash
cd server
npx tsx scripts/analyze-terms.ts
```

Or explicitly set production mode:

```bash
cd server
TEST_MODE=false npx tsx scripts/analyze-terms.ts
```

## Configuration

### Environment Variables

- `STRAPI_BASE_URL`: Strapi server URL (default: `http://localhost:1337`)
- `STRAPI_API_TOKEN` or `NEXT_PUBLIC_STRAPI_API_TOKEN`: Strapi authentication token
- `DELAY_MS`: Delay between term processing in milliseconds (default: `2000`)
- `TEST_MODE`: Set to `true` for test mode, `false` for production (default: `false`)

**Note:** Environment variables are automatically loaded from `.env` file using `dotenv`.

### API Endpoints

- **Strapi API**: `http://localhost:1337/api`
- **Analysis API**: `http://localhost:4000/analyzeStaticData`

## What the Script Does

1. **Fetch Categories**: Gets all categories from Strapi
2. **Fetch Terms**: Gets all terms from Strapi
3. **Extract Category Names**: Prepares Hebrew category names for AI analysis
4. **Process Each Term**:
   - Sends title and description to analysis API with categories
   - Receives AI-suggested category matches
   - Updates term in Strapi with matched categories

## Output Example

```
🚀 Starting Term Analysis & Update Script (TEST MODE)...
📂 Fetching genre and term categories from Strapi...
🏷️  Found 5 genre and term categories
📋 Using categories from Strapi: פילוסופיה, הישארות הנפש, רמב״ם, בעיית הרוע, דת

📝 Processing term: [Term Title] (ID: 5)
📝 Analyzing term: [Term Title]
🏷️  Using category names: פילוסופיה,תורה,חסידות,קבלה,מחשבה יהודית
✨ AI Analysis Results:
🏷️  Returned category names: פילוסופיה,מחשבה יהודית
✅ Successfully updated term!

🎉 Analysis and update completed!
📊 Processed: 1 terms
✅ Successfully analyzed and updated: 1 terms
❌ Failed: 0 terms
```

## Error Handling

- **API Unavailable**: Script will fail gracefully with error messages
- **Invalid Terms**: Terms without title or description are skipped
- **Analysis Failures**: Individual term failures don't stop the batch
- **Network Issues**: Automatic retry with document ID fallback for Strapi v5

## Troubleshooting

### Common Issues

1. **"No categories found"**: Ensure categories exist in Strapi
2. **"API not available"**: Check if analysis service is running on port 4000
3. **"Strapi not responding"**: Ensure Strapi is running on port 1337
4. **"Term update failed"**: Check term permissions and API structure

### Debug Mode

Add console.log statements or check the detailed output for:
- Term data structure
- API request/response payloads
- Update URLs and payloads

## Integration Details

### Static Data Analysis API Format

**Request:**
```json
{
  "title": "מחשבות על הקבלה והפילוסופיה היהודית",
  "description": "הסרטון דן ברעיונות הפילוסופיים של הרב קוק בעניין התחייה הלאומית והקשר בין האומה לטבע",
  "categories": ["פילוסופיה יהודית", "תורה", "חסידות", "קבלה", "מחשבה יהודית"]
}
```

**Response:**
```json
{
  "success": true,
  "categories": ["פילוסופיה יהודית", "מחשבה יהודית"]
}
```

### Strapi Update Format

**Request:**
```json
{
  "data": {
    "categories": {
      "set": ["document_id_1", "document_id_2"]
    }
  }
}
```

**Note:** The script uses `set` instead of `connect` to **override** existing categories rather than adding to them.

## Safety Features

- **Test Mode**: Process only 1 term first
- **Batch Processing**: Avoid overwhelming APIs
- **Error Recovery**: Continue processing after individual failures
- **Rate Limiting**: Built-in delays between requests
- **Data Validation**: Skip terms with missing required fields

## Performance

- **Delays**: 2 seconds between terms
- **Expected Rate**: ~30 terms per minute in production
- **Memory Usage**: Minimal, processes terms sequentially

## Key Differences from Video Analysis

- **Input**: Uses `title` and `description` instead of YouTube URLs
- **API Endpoint**: Uses `/analyzeStaticData` instead of `/analyzeYouTubeVideo`
- **No Video ID**: Works with static content rather than video URLs
- **Categories Only**: Updates categories but not descriptions (terms already have descriptions)
