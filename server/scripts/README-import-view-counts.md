# Import View Counts from Excel

This script imports view count data from an Excel file into Strapi content types that have a `views` field.

## Supported Content Types

The script can update view counts for the following content types:
- **Blogs** (`/blog/[slug]`)
- **Videos** (`/video/[slug]`)  
- **Responsas** (`/responsa/[slug]`)
- **Writings** (`/writings/[slug]`)
- **Terms** (`/terms/[slug]`)

## Excel File Format

Your Excel file should have the following columns:

| Column A | Column B | Column C |
|----------|----------|----------|
| page     | visitors | total    |
| /blog/example-post | 45 | 150 |
| /video/example-video | 23 | 89 |
| /responsa/example-qa | 67 | 234 |

- **Column A (page)**: The page path/slug (with or without leading/trailing slashes)
- **Column B (visitors)**: Number of unique visitors (not used by script, but can be present)
- **Column C (total)**: Total view count - **this value will be set as the `views` field**

## Usage

1. **Prepare your Excel file** with the format above
2. **Navigate to the server directory**:
   ```bash
   cd server
   ```
3. **Run the import script**:
   ```bash
   pnpm tsx scripts/import-view-counts.ts /path/to/your/excel-file.xlsx
   ```

## Example

```bash
# Example with Excel file in Downloads folder
pnpm tsx scripts/import-view-counts.ts ~/Downloads/analytics-data.xlsx
```

## What the Script Does

1. **Reads the Excel file** and parses the data
2. **Cleans the slugs** by removing leading/trailing slashes
3. **Searches each content type** to find matching content by slug
4. **Updates the views field** with the total count from your Excel file
5. **Provides detailed logging** of the import process

## Output Example

```
🚀 Starting view counts import...
📊 Reading Excel file: /Users/user/Downloads/analytics.xlsx
📋 Found 150 rows to process
🔧 Initializing Strapi...
🔄 Processing rows...
✅ Row 1: Updated api::blog.blog "introduction-to-philosophy" views: 0 → 245
✅ Row 2: Updated api::video.video "weekly-shiur-1" views: 12 → 156
❓ Row 3: No content found for slug "old-deleted-post"
✅ Row 4: Updated api::responsa.responsa "kashrut-question" views: 5 → 89

📈 Import Summary:
   Total rows processed: 150
   Successfully updated: 147
   Content not found: 3
   Errors: 0
✨ Import completed!
```

## Important Notes

- **Backup your database** before running the import
- The script will **overwrite existing view counts** with the values from your Excel file
- **Slug matching is exact** - make sure your Excel slugs match the actual content slugs in Strapi
- The script handles **multiple content types automatically** - no need to specify which type each slug belongs to
- **Case sensitive** - slugs must match exactly (including capitalization)

## Troubleshooting

### "No content found for slug"
- Check that the slug in your Excel file matches exactly with the slug in Strapi
- Remove any leading/trailing slashes or spaces from the Excel data
- Verify the content is published in Strapi

### "Error updating content"
- Check Strapi database permissions
- Ensure the content type has a `views` field of type `integer`
- Verify Strapi is not running while the script executes

### Excel file parsing errors
- Ensure your Excel file has data in columns A, B, and C
- Check that the first row contains headers
- Verify the file is a valid Excel format (.xlsx, .xls)

## Dependencies

The script requires:
- `xlsx` - for reading Excel files
- `tsx` - for running TypeScript files
- `@types/node` - for Node.js types

These are automatically installed when you run the script for the first time.
