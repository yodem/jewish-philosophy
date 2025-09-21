# Scripts

This folder contains utility scripts for the Strapi backend.

## Available Scripts

### categorize-videos.ts
Automatically categorizes uncategorized videos using Gemini AI.

```bash
# Run from server directory
cd server
npx tsx scripts/categorize-videos.ts
```

**What it does:**
1. Fetches all uncategorized videos from Strapi
2. Sends video descriptions to Gemini proxy service (localhost:4000)
3. Gets AI-suggested categories
4. Updates videos in Strapi with categories
5. Shows progress and statistics

**Configuration:**
- `STRAPI_BASE_URL` - Strapi URL (default: localhost:1337)
- `GEMINI_PROXY_URL` - Gemini proxy URL (default: localhost:4000)
- `BATCH_SIZE` - Videos per batch (default: 5)
- `DELAY_MS` - Delay between requests (default: 2000ms)

### youtube-populate.ts
Populates Strapi with YouTube data.

```bash
# Run from server directory
cd server
npx tsx src/youtube-populate.ts
```

**What it does:**
1. Fetches playlists and videos from YouTube API
2. Creates/updates playlists in Strapi
3. Creates/updates videos with playlist relations
4. Verifies all relations are properly set

### analyze-videos.ts
Analyzes YouTube videos using AI and updates them with descriptions and categories.

```bash
# Run from server directory
cd server
npx tsx scripts/analyze-videos.ts
```

**What it does:**
1. Fetches all videos from Strapi CMS
2. Sends videos to YouTube Analysis API (localhost:4000)
3. Gets AI-generated Hebrew descriptions and category matches
4. Updates videos in Strapi with new data
5. Handles Strapi v5 API with proper document IDs

**Configuration:**
- `STRAPI_BASE_URL` - Strapi URL (default: localhost:1337)
- `DELAY_MS` - Delay between requests (default: 2000ms)
- `TEST_MODE` - Process only 1 video for testing

### analyze-terms.ts
Analyzes terms using AI and updates them with category classifications.

```bash
# Run from server directory
cd server
npx tsx scripts/analyze-terms.ts
```

**What it does:**
1. Fetches all terms from Strapi CMS
2. Fetches genre and term categories from Strapi (type=genre OR type=term)
3. Sends terms to Static Data Analysis API (localhost:4000)
4. Gets AI-suggested category matches based on title and description
5. Updates terms in Strapi with matched genre categories
6. Handles Strapi v5 API with proper document IDs

**Configuration:**
- `STRAPI_BASE_URL` - Strapi URL (default: localhost:1337)
- `DELAY_MS` - Delay between requests (default: 2000ms)
- `TEST_MODE` - Process only 1 term for testing
