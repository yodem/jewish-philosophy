# Responsa Analysis Script

## Overview

The `analyze-responsas.ts` script analyzes responsa content using AI to automatically categorize them based on their content and comments.

## Features

### ✨ **Refactored Features**
- **Type Safety**: Full TypeScript interfaces for all data structures
- **Comment Integration**: Fetches and includes the first comment as clarification for better AI analysis
- **Enhanced API**: Uses new StaticDataAnalysis API with clarificationParagraph parameter
- **Better Error Handling**: Comprehensive error handling with proper type checking
- **Optimized API Calls**: Parallel data fetching for better performance
- **Enhanced Logging**: Detailed progress tracking and error reporting

### 🔧 **Technical Improvements**
- **Strapi v5 Support**: Proper handling of `documentId` and fallback to `id`
- **Pagination**: Configurable pagination size (default: 100 items)
- **Rate Limiting**: Configurable delay between API calls (default: 2 seconds)
- **Memory Management**: Better resource handling and cleanup

## Configuration

### Environment Variables
- `STRAPI_BASE_URL`: Base URL for Strapi instance (default: production URL)
- `DELAY_MS`: Delay between API calls in milliseconds (default: 2000)

**Note:** Environment variables are automatically loaded from `.env` file using `dotenv`.

### API Configuration
- **Analysis API**: `http://localhost:4000/analyzeStaticData`
- **Pagination Size**: 100 items per request
- **Population**: Categories and comments are populated with sorting

## Data Flow

1. **Fetch Data**: Parallel fetching of categories and responsas
2. **Process Each Responsa**:
   - Extract title, content, and first comment
   - Send to AI analysis API with first comment as clarification
   - Update Strapi with returned categories
3. **Error Handling**: Comprehensive error tracking and reporting

## API Payload Structure

### Request to Analysis API
```typescript
{
  title: string,
  description: string,           // responsa content
  clarificationParagraph?: string, // first comment as clarification
  categories: string[]           // available category names
}
```

### Response from Analysis API
```typescript
{
  success: boolean,
  message?: string,
  categories?: string[] // suggested category names
}
```

## Usage

```bash
cd server
pnpm ts-node scripts/analyze-responsas.ts
```

## Error Handling

The script handles various error scenarios:
- **Network Errors**: Retry logic with fallback URLs
- **Missing Data**: Graceful handling of missing title/content
- **API Failures**: Detailed error logging with status codes
- **Category Mismatches**: Logging when AI categories don't match Strapi categories

## Logging

The script provides detailed logging:
- 🔍 Data fetching progress
- ❓ Responsa processing status
- 💬 Comment availability
- 🏷️ Category matching results
- ✅ Success/failure tracking
- ⏱️ Timing information

## Strapi Update Format

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

## Performance

- **Parallel Fetching**: Categories and responsas fetched simultaneously
- **Batch Processing**: Configurable pagination for large datasets
- **Rate Limiting**: Prevents API overload with configurable delays
- **Memory Efficient**: Processes items individually to manage memory usage

## Dependencies

- `axios`: HTTP client for API calls
- `qs`: Query string formatting for Strapi API calls
- `dotenv`: Environment variable loading
- `@types/node`: Node.js type definitions
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution environment

## Troubleshooting

### Common Issues
1. **Module Not Found**: Ensure dependencies are installed (`pnpm add axios qs dotenv`)
2. **Connection Errors**: Check Strapi URL and network connectivity
3. **Analysis API Errors**: Verify the analysis service is running on port 4000
4. **Category Mismatches**: Ensure category names in Strapi match expected format
5. **Query Format Errors**: Script now uses proper `qs` formatting for Strapi API calls

### Debug Mode
Enable detailed logging by checking console output for:
- API response status codes
- Category matching results
- Error details and stack traces