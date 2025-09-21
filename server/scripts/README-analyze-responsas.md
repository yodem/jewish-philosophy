# Responsa Analysis Script

## Overview

This script analyzes responsas (Q&A content) and automatically assigns categories based on AI analysis. It fetches all responsas from Strapi, analyzes their content using an AI service, and updates them with appropriate categories.

## Features

- **AI-Powered Analysis**: Uses the Static Data Analysis API to analyze responsa content and suggest relevant categories
- **All Category Types**: Works with all category types (term, person, genre) unlike the terms script which only uses genre and term
- **Batch Processing**: Processes responsas one by one with configurable delays between requests
- **Error Handling**: Robust error handling with fallback mechanisms for Strapi updates
- **Progress Tracking**: Detailed logging and progress tracking throughout the process

## Usage

### Prerequisites

1. **Environment Variables**:
   - `STRAPI_BASE_URL`: Your Strapi backend URL (defaults to production URL)
   - `DELAY_MS`: Delay between API calls in milliseconds (default: 2000)

2. **AI Analysis Service**: The script expects an AI service running at `http://localhost:4000/analyzeStaticData`

### Running the Script

```bash
# From the server directory
cd server

# Run with default settings
npx ts-node scripts/analyze-responsas.ts

# Run with custom delay
DELAY_MS=3000 npx ts-node scripts/analyze-responsas.ts

# Run with custom Strapi URL
STRAPI_BASE_URL=http://localhost:1337 npx ts-node scripts/analyze-responsas.ts
```

## How It Works

1. **Data Fetching**:
   - Fetches all responsas from Strapi with full population
   - Fetches all categories from Strapi (term, person, genre types)

2. **AI Analysis**:
   - Sends each responsa's title and content to the AI analysis API
   - Receives suggested category names from the AI
   - Matches AI suggestions with existing categories in Strapi

3. **Strapi Updates**:
   - Updates responsas with matched categories using Strapi's connect syntax
   - Handles both documentId (Strapi v5) and id fallbacks for updates

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `STRAPI_BASE_URL` | Production URL | Strapi backend base URL |
| `DELAY_MS` | 2000 | Delay between API calls in milliseconds |
| `ANALYSIS_API_URL` | http://localhost:4000/analyzeStaticData | AI analysis service endpoint |

## Output

The script provides detailed console output including:
- Number of responsas found and processed
- AI analysis results for each responsa
- Category matching information
- Success/failure counts
- Error details if any occur

## Error Handling

- **Missing Data**: Skips responsas without title or content
- **API Failures**: Continues processing other responsas if one fails
- **No Matches**: Logs warnings when no categories match AI suggestions
- **Update Failures**: Provides detailed error information and continues processing

## Categories Used

Unlike the terms analysis script which only uses "genre" and "term" categories, this script uses ALL available category types:
- **term**: Jewish terminology and concepts
- **person**: Rabbis, scholars, and historical figures
- **genre**: Content types and thematic categories

## Integration

This script integrates with:
- **Strapi CMS**: For fetching and updating responsa content
- **AI Analysis Service**: For content analysis and category suggestions
- **Category System**: Uses all available category types for maximum flexibility

## Best Practices

1. **Test First**: Run on a small subset of data before processing all responsas
2. **Backup Data**: Consider backing up your Strapi database before running
3. **Monitor Progress**: Watch the console output for any issues
4. **Adjust Delays**: Increase `DELAY_MS` if you encounter rate limiting
5. **Review Results**: Check the updated responsas in Strapi to verify category assignments

## Troubleshooting

### Common Issues

1. **AI Service Unavailable**: Ensure the analysis service is running on port 4000
2. **Strapi Connection Issues**: Verify `STRAPI_BASE_URL` is correct
3. **Permission Errors**: Ensure your Strapi user has update permissions for responsas
4. **Rate Limiting**: Increase `DELAY_MS` if you hit API limits

### Debug Mode

For more detailed logging, you can modify the script to add additional console.log statements or use a debugging tool like `node --inspect`.
