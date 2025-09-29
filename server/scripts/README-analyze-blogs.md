# Blog Analysis Script

## Overview

The `analyze-blogs.ts` script analyzes blog content using AI to automatically categorize them based on their title, description, and content.

## Features

### ✨ **Core Features**
- **Type Safety**: Full TypeScript interfaces for all data structures
- **Rich Content Processing**: Extracts meaningful text from rich content for AI analysis
- **Smart Content Handling**: Uses description when available, falls back to content extraction
- **Enhanced API**: Uses StaticDataAnalysis API with clarificationParagraph parameter
- **Better Error Handling**: Comprehensive error handling with proper type checking
- **Optimized API Calls**: Parallel data fetching for better performance
- **Enhanced Logging**: Detailed progress tracking and error reporting

### 🔧 **Technical Improvements**
- **Strapi v5 Support**: Proper handling of `documentId` and fallback to `id`
- **Pagination**: Configurable pagination size (default: 100 items)
- **Rate Limiting**: Configurable delay between API calls (default: 2 seconds)
- **Memory Management**: Better resource handling and cleanup
- **Content Extraction**: Intelligent text extraction from rich content (HTML)

## Configuration

### Environment Variables
- `STRAPI_BASE_URL`: Base URL for Strapi instance (default: production URL)
- `DELAY_MS`: Delay between API calls in milliseconds (default: 2000)

**Note:** Environment variables are automatically loaded from `.env` file using `dotenv`.

### API Configuration
- **Analysis API**: `http://localhost:4000/analyzeStaticData`
- **Pagination Size**: 100 items per request
- **Population**: Categories are populated for relation management

## Data Flow

1. **Fetch Data**: Parallel fetching of categories and blogs
2. **Process Each Blog**:
   - Extract title, description, and content
   - Clean and extract meaningful text from rich content
   - Send to AI analysis API with content as clarification
   - Update Strapi with returned categories
3. **Error Handling**: Comprehensive error tracking and reporting

## API Payload Structure

### Request to Analysis API
```typescript
{
  title: string,
  description: string,           // blog description or extracted content
  clarificationParagraph?: string, // full content as clarification
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

## Content Processing

### Rich Content Handling
- **HTML Tag Removal**: Strips HTML tags from rich content
- **Text Extraction**: Extracts meaningful text for analysis
- **Content Limiting**: Uses first 500 characters to avoid overwhelming AI
- **Smart Fallback**: Uses description if available, otherwise extracted content

### Data Priority
1. **Primary**: Blog description (if available)
2. **Fallback**: Extracted text from rich content
3. **Clarification**: Full content text (when description exists)

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

- **Parallel Fetching**: Categories and blogs fetched simultaneously
- **Batch Processing**: Configurable pagination for large datasets
- **Rate Limiting**: Prevents API overload with configurable delays
- **Memory Efficient**: Processes items individually to manage memory usage
- **Content Optimization**: Limits content size sent to AI for better performance

## Dependencies

- `axios`: HTTP client for API calls
- `qs`: Query string formatting for Strapi API calls
- `dotenv`: Environment variable loading
- `@types/node`: Node.js type definitions
- `typescript`: TypeScript compiler
- `ts-node`: TypeScript execution environment

## Usage

```bash
cd server
pnpm ts-node scripts/analyze-blogs.ts
```

## Error Handling

The script handles various error scenarios:
- **Network Errors**: Retry logic with fallback URLs
- **Missing Data**: Graceful handling of missing title/content
- **API Failures**: Detailed error logging with status codes
- **Category Mismatches**: Logging when AI categories don't match Strapi categories
- **Rich Content Issues**: Fallback content extraction when processing fails

## Logging

The script provides detailed logging:
- 🔍 Data fetching progress
- 📄 Blog processing status
- 📝 Content extraction information
- 🏷️ Category matching results
- ✅ Success/failure tracking
- ⏱️ Timing information

## Troubleshooting

### Common Issues
1. **Module Not Found**: Ensure dependencies are installed (`pnpm add axios qs dotenv`)
2. **Connection Errors**: Check Strapi URL and network connectivity
3. **Analysis API Errors**: Verify the analysis service is running on port 4000
4. **Category Mismatches**: Ensure category names in Strapi match expected format
5. **Content Processing Errors**: Check for malformed HTML in blog content
6. **Query Format Errors**: Script uses proper `qs` formatting for Strapi API calls

### Debug Mode
Enable detailed logging by checking console output for:
- API response status codes
- Category matching results
- Content extraction details
- Error details and stack traces

## Blog Content Structure

The script expects blogs to have:
- **title**: Required string field
- **content**: Required rich text field (HTML)
- **description**: Optional text field (preferred for analysis)
- **categories**: Many-to-many relation to categories

## Content Processing Examples

```typescript
// Rich content input
"<p>This is a <strong>blog post</strong> about <em>Jewish philosophy</em>.</p>"

// Extracted for analysis
"This is a blog post about Jewish philosophy."

// API request
{
  title: "Introduction to Jewish Philosophy",
  description: "This is a blog post about Jewish philosophy.",
  categories: ["פילוסופיה יהודית", "תורה", "חסידות"]
}
```
