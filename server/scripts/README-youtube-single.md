# YouTube Single Import Script

This script allows you to import individual YouTube playlists or videos into your Strapi CMS, following the same pattern as the bulk `youtube-populate.ts` script.

## Features

- ✅ Import single YouTube playlists (with all their videos)
- ✅ Import individual YouTube videos
- ✅ Smart URL parsing (supports playlist URLs, video URLs, and shortened URLs)
- ✅ Automatic creation/update of playlists and videos in Strapi
- ✅ Proper relation handling between playlists and videos
- ✅ Duplicate detection and updating
- ✅ Detailed logging and error handling

## Usage

### Prerequisites

Make sure you have the required environment variables set:
- `YOUTUBE_API_KEY` - Your YouTube Data API v3 key
- `STRAPI_BASE_URL` - Your Strapi instance URL (optional, defaults to production)

**Note:** Environment variables are automatically loaded from `.env` file using `dotenv`.

### Basic Commands

```bash
# Navigate to server directory
cd server

# Import a playlist by ID
ts-node scripts/youtube-single.ts --playlist PLxxx

# Import a single video by ID
ts-node scripts/youtube-single.ts --video dQw4w9WgXcQ

# Import using full URLs
ts-node scripts/youtube-single.ts --url "https://www.youtube.com/playlist?list=PLxxx"
ts-node scripts/youtube-single.ts --url "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
ts-node scripts/youtube-single.ts --url "https://youtu.be/dQw4w9WgXcQ"
```

### Command Line Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--playlist` | `-p` | YouTube playlist ID | `--playlist PLxxx` |
| `--video` | `-v` | YouTube video ID | `--video dQw4w9WgXcQ` |
| `--url` | `-u` | Full YouTube URL | `--url "https://..."` |

### Examples

#### Import a Playlist
```bash
# Using playlist ID
ts-node scripts/youtube-single.ts --playlist PLrAXtmRdnEQy3x3p2j9nXJDA8UKK4k3Z

# Using playlist URL
ts-node scripts/youtube-single.ts --url "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy3x3p2j9nXJDA8UKK4k3Z"
```

#### Import a Single Video
```bash
# Using video ID
ts-node scripts/youtube-single.ts --video dQw4w9WgXcQ

# Using video URL
ts-node scripts/youtube-single.ts --url "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Using shortened URL
ts-node scripts/youtube-single.ts --url "https://youtu.be/dQw4w9WgXcQ"
```

## What the Script Does

### For Playlists:
1. **Fetches playlist details** from YouTube API
2. **Creates or updates** the playlist in Strapi
3. **Fetches all videos** in the playlist (up to 50)
4. **Creates or updates** each video with proper playlist relation
5. **Verifies relations** to ensure everything is linked correctly

### For Individual Videos:
1. **Fetches video details** from YouTube API
2. **Creates or updates** the video in Strapi
3. **Note**: Individual videos need to be manually associated with playlists in Strapi admin

## Output

The script provides detailed logging:
- ✅ Successful operations
- ⚠️ Warnings for missing relations
- ❌ Errors with detailed information

Example output:
```
YouTube Single Item Import Script
=================================

Processing playlist: PLrAXtmRdnEQy3x3p2j9nXJDA8UKK4k3Z

Looking for playlist with youtubeId: PLrAXtmRdnEQy3x3p2j9nXJDA8UKK4k3Z
Found existing playlist: ID: 123
Updating existing playlist: Jewish Philosophy Series (ID: 123)
Successfully updated playlist: Jewish Philosophy Series

Fetching videos from playlist...
Found 12 videos
Creating video: Introduction to Jewish Philosophy...
Successfully created video: Introduction to Jewish Philosophy
...

Playlist processing completed!

=== Verifying Relations ===
Playlist "Jewish Philosophy Series" has 12 videos
=== End Verification ===
```

## Error Handling

The script handles various error scenarios:
- **Invalid IDs/URLs**: Clear error messages with usage examples
- **API failures**: Detailed error logging
- **Missing permissions**: Guidance on fixing YouTube API access
- **Network issues**: Retry logic with delays

## Integration with Existing System

This script integrates seamlessly with:
- Your existing Strapi content types (playlists, videos)
- The same YouTube API configuration
- The existing color-coded category system
- The same slug generation logic

## Tips

1. **Test with small playlists first** to verify everything works
2. **Check YouTube API quotas** before importing large playlists
3. **Use the verification output** to confirm all relations are correct
4. **Individual videos** will appear in your video listings but won't be automatically associated with playlists

## Troubleshooting

### "Playlist not found or not accessible"
- Verify the playlist ID is correct
- Check if the playlist is public
- Ensure your YouTube API key has the necessary permissions

### "Video not found or not accessible"
- Verify the video ID is correct
- Check if the video is public/unlisted
- Ensure the video hasn't been deleted

### "Cannot create video without playlist"
- Individual videos need to belong to a playlist
- Either provide a playlist ID or import the video as part of a playlist
