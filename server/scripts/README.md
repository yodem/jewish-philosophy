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
