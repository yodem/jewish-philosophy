# Scripts

This folder contains utility scripts for the Strapi backend.

## Available Scripts

### analyze-blogs.ts
Analyzes blog posts using AI and updates them with category classifications.

```bash
# Run from server directory
cd server
npx tsx scripts/analyze-blogs.ts
```

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
6. **Overrides existing categories** (doesn't add to them)

**Configuration:**
- `STRAPI_BASE_URL` - Strapi URL (default: localhost:1337)
- `DELAY_MS` - Delay between requests (default: 2000ms)
- `TEST_MODE` - Process only 1 video for testing

**Environment:** All scripts automatically load `.env` file using `dotenv`. See `../.env.example` for available variables.

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
7. **Overrides existing categories** (doesn't add to them)

**Configuration:**
- `STRAPI_BASE_URL` - Strapi URL (default: localhost:1337)
- `DELAY_MS` - Delay between requests (default: 2000ms)
- `TEST_MODE` - Process only 1 term for testing

**Environment:** All scripts automatically load `.env` file using `dotenv`. See `../.env.example` for available variables.

### analyze-responsas.ts
Analyzes responsas using AI and updates them with category classifications.

```bash
# Run from server directory
cd server
npx tsx scripts/analyze-responsas.ts
```

**What it does:**
1. Fetches all responsas from Strapi CMS
2. Fetches categories from Strapi
3. Sends responsas to Static Data Analysis API (localhost:4000) with first comment as clarification
4. Gets AI-suggested category matches based on title, content, and clarification
5. Updates responsas in Strapi with matched categories
6. Handles Strapi v5 API with proper document IDs
7. **Overrides existing categories** (doesn't add to them)

**Configuration:**
- `STRAPI_BASE_URL` - Strapi URL (default: production URL)
- `DELAY_MS` - Delay between requests (default: 2000ms)

**Environment:** All scripts automatically load `.env` file using `dotenv`. See `../.env.example` for available variables.

### analyze-blogs.ts
Analyzes blog posts using AI and updates them with category classifications.

```bash
# Run from server directory
cd server
npx tsx scripts/analyze-blogs.ts
```

**What it does:**
1. Fetches all blogs from Strapi CMS
2. Fetches categories from Strapi
3. Extracts meaningful text from rich content (HTML)
4. Sends blogs to Static Data Analysis API (localhost:4000) with content as clarification
5. Gets AI-suggested category matches based on title, description, and content
6. Updates blogs in Strapi with matched categories
7. Handles Strapi v5 API with proper document IDs
8. **Overrides existing categories** (doesn't add to them)

**Configuration:**
- `STRAPI_BASE_URL` - Strapi URL (default: production URL)
- `DELAY_MS` - Delay between requests (default: 2000ms)

**Environment:** All scripts automatically load `.env` file using `dotenv`. See `../.env.example` for available variables.
