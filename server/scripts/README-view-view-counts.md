# View All View Counts

This script displays all view counts from Strapi content types that have a `views` field.

## Supported Content Types

The script fetches view counts from:
- **blogs** - Blog posts/articles
- **videos** - YouTube video content
- **responsas** - Q&A religious content
- **writings** - Essays/written works
- **terms** - Glossary terms

## Usage

```bash
# Run from server directory
cd server
pnpm tsx scripts/view-view-counts.ts
```

### Export to CSV

To export the results to a CSV file:

```bash
pnpm tsx scripts/view-view-counts.ts --export-csv
```

The CSV file will be saved as `view-counts-export-[timestamp].csv` in the current directory.

## What It Shows

The script displays:

1. **Summary Statistics**
   - Total items across all content types
   - Items with views (non-zero)
   - Total views across all content
   - Average views per item

2. **Statistics by Content Type**
   - Count of items per type
   - Total views per type
   - Average views per type
   - Top item per type

3. **Top 20 Items**
   - Ranked list of the 20 most viewed items
   - Shows content type, view count, and title/slug

4. **Items with Zero Views**
   - List of items that have no views yet
   - Helps identify content that may need promotion

## Configuration

The script uses environment variables from `.env`:

- `STRAPI_BASE_URL` - Strapi URL (default: `http://localhost:1337`)
- `STRAPI_API_TOKEN` - Strapi API token for authentication

## CSV Export Format

When using `--export-csv`, the exported file contains:
- Content Type
- ID
- Document ID (Strapi v5)
- Slug
- Title
- Views

Items are sorted by view count (descending).

## Examples

```bash
# View all view counts
pnpm tsx scripts/view-view-counts.ts

# View and export to CSV
pnpm tsx scripts/view-view-counts.ts --export-csv
```

## Requirements

- Strapi server must be running or accessible at `STRAPI_BASE_URL`
- Valid `STRAPI_API_TOKEN` must be set in `.env`
- Node.js with TypeScript support (tsx)










