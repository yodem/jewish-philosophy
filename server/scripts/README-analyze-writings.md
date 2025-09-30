# Writing Analysis Script

This script analyzes writing content in Strapi and automatically categorizes them using AI analysis.

## Overview

The script fetches all writings from Strapi, analyzes their title and description using an AI service, and then updates them with relevant categories based on the analysis results.

## Prerequisites

1. **Strapi Server**: Must be running with writings and categories content types
2. **Analysis API**: Local analysis service must be running on `http://localhost:4000/analyzeStaticData`
3. **Environment**: Proper environment variables configured

## Configuration

### Environment Variables

Create a `.env` file in the server directory with:

```env
STRAPI_BASE_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token_here
# Or alternatively use:
# NEXT_PUBLIC_STRAPI_API_TOKEN=your_strapi_api_token_here
DELAY_MS=2000
```

### Required Content Types

- **Writings**: Must have `title`, `description` (richtext), and `categories` relation
- **Categories**: Must exist with proper names for categorization

## Usage

### Running the Script

```bash
# Navigate to server directory
cd server

# Install dependencies (if not already installed)
pnpm install

# Run the analysis script
npx tsx scripts/analyze-writings.ts
```

### What the Script Does

1. **Fetches Data**: Retrieves all writings and categories from Strapi
2. **Extracts Content**: Processes richtext description to plain text
3. **AI Analysis**: Sends title and description to analysis API
4. **Category Matching**: Maps AI-returned category names to Strapi categories
5. **Updates Content**: Updates writings with matched categories in Strapi

## Script Workflow

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Fetch Data    │    │   AI Analysis    │    │  Update Strapi  │
│                 │    │                  │    │                 │
│ • All writings  │───▶│ • Extract text   │───▶│ • Match cats    │
│ • All categories│    │ • Send to API    │    │ • Update writing│
│                 │    │ • Get categories │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Features

### Content Processing
- **Rich Text Handling**: Extracts plain text from richtext description field
- **Type Information**: Includes writing type (book/article) as context
- **Comprehensive Analysis**: Uses both title and description for categorization

### Error Handling
- **Graceful Failures**: Continues processing if individual writings fail
- **API Fallbacks**: Tries both documentId and regular id for updates
- **Detailed Logging**: Comprehensive status reporting throughout

### Rate Limiting
- **Configurable Delays**: Prevents overwhelming the analysis API
- **Sequential Processing**: Processes one writing at a time

## Output

The script provides detailed console output including:
- ✅ Successfully analyzed and updated writings
- ⚠️  Skipped writings (missing data or analysis failures)
- 📊 Final statistics and completion summary

## Troubleshooting

### Common Issues

1. **Analysis API Not Running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:4000
   ```
   Solution: Start the analysis API service

2. **Strapi Connection Issues**
   ```
   Error: Request failed with status code 404
   ```
   Solution: Verify Strapi is running and STRAPI_BASE_URL is correct

3. **No Categories Found**
   ```
   ❌ No categories found in Strapi
   ```
   Solution: Ensure categories exist in your Strapi instance

### Debug Mode

For more detailed output, you can modify the script to log request/response data or add additional console.log statements.

## Related Scripts

- `analyze-blogs.ts` - Similar script for blog content
- `analyze-responsas.ts` - Similar script for responsa content  
- `analyze-videos.ts` - Similar script for video content

## Notes

- **Data Safety**: Script only updates category relations, doesn't modify content
- **Idempotent**: Safe to run multiple times on the same content
- **Performance**: Processing time depends on number of writings and AI API response time
