import fetch from 'node-fetch';

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'https://gorgeous-power-cb8382b5a9.strapiapp.com';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyBs29YdmqhmaiPPwV4jmm2uEvUr5O41mHY';

async function extractPlaylistId(url: string): Promise<string | null> {
  // Handle playlist URLs like: https://www.youtube.com/playlist?list=PLAYLIST_ID
  const playlistMatch = url.match(/[?&]list=([^#\&\?]*)/);
  if (playlistMatch) {
    return playlistMatch[1];
  }
  return null;
}

async function fetchPlaylist(playlistId: string) {
  const url = `https://youtube.googleapis.com/youtube/v3/playlists?key=${YOUTUBE_API_KEY}&part=snippet&id=${playlistId}`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data.items?.[0] || null;
}

async function fetchPlaylistVideos(playlistId: string) {
  const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data.items || [];
}

async function createPlaylist(playlist: any) {
  // Check if playlist already exists
  const existingRes = await fetch(`${STRAPI_URL}/playlists?filters[youtubeId][$eq]=${playlist.id}`);
  const existingData: any = await existingRes.json();
  const existingPlaylist = existingData.data?.[0];

  if (existingPlaylist) {
    console.log(`Playlist already exists: ${playlist.snippet.title}`);
    return existingPlaylist;
  }

  const payload = {
    data: {
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      imageUrl300x400: playlist.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard: playlist.snippet.thumbnails?.standard?.url || playlist.snippet.thumbnails?.high?.url || '',
      youtubeId: playlist.id,
      slug: playlist.id, // Use YouTube ID as slug
    },
  };

  console.log(`Creating playlist: ${playlist.snippet.title}`);
  const res = await fetch(`${STRAPI_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: any = await res.json();
  if (!data.data) {
    console.error('Playlist creation error:', data);
  }
  
  await delay(100);
  return data.data;
}

async function createVideo(video: any, strapiPlaylistId: string) {
  // Check if video already exists
  const existingRes = await fetch(`${STRAPI_URL}/videos?filters[videoId][$eq]=${video.contentDetails.videoId}`);
  const existingData: any = await existingRes.json();
  const existingVideo = existingData.data?.[0];

  if (existingVideo) {
    console.log(`Video already exists: ${video.snippet.title}`);
    return existingVideo;
  }

  const payload = {
    data: {
      title: video.snippet.title,
      description: video.snippet.description,
      imageUrl300x400: video.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard: video.snippet.thumbnails?.standard?.url || video.snippet.thumbnails?.high?.url || '',
      videoId: video.contentDetails.videoId,
      slug: video.contentDetails.videoId, // Use YouTube video ID as slug
      playlist: strapiPlaylistId,
    },
  };

  console.log(`Creating video: ${video.snippet.title}`);
  const res = await fetch(`${STRAPI_URL}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data: any = await res.json();
  if (!data.data) {
    console.error('Video creation error:', data);
  }
  
  await delay(100);
  return data.data;
}

async function verifyPlaylist(playlistId: string) {
  console.log('\n=== Verifying Playlist ===');
  
  const playlistRes = await fetch(`${STRAPI_URL}/playlists?filters[youtubeId][$eq]=${playlistId}&populate=*`);
  const playlistData: any = await playlistRes.json();
  const playlist = playlistData.data?.[0];
  
  if (playlist) {
    const videoCount = playlist.videos?.length || 0;
    console.log(`Playlist "${playlist.title}" has ${videoCount} videos`);
  } else {
    console.log(`Playlist with YouTube ID ${playlistId} not found`);
  }
  
  console.log('=== End Verification ===\n');
}

async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  let playlistId: string | undefined;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--playlist':
      case '-p':
        playlistId = args[++i];
        break;
      case '--url':
      case '-u':
        const url = args[++i];
        const extracted = await extractPlaylistId(url);
        if (extracted) {
          playlistId = extracted;
        } else {
          console.error('Could not extract playlist ID from URL:', url);
          process.exit(1);
        }
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          console.log('Usage: ts-node youtube-single.ts [--playlist|-p PLAYLIST_ID] [--url|-u URL]');
          process.exit(1);
        }
    }
  }

  console.log('YouTube Single Playlist Import Script');
  console.log('=====================================');

  if (!playlistId) {
    console.log('Usage: ts-node youtube-single.ts [--playlist|-p PLAYLIST_ID] [--url|-u URL]');
    console.log('\nExamples:');
    console.log('  ts-node youtube-single.ts --playlist PLxxx');
    console.log('  ts-node youtube-single.ts --url "https://www.youtube.com/playlist?list=PLxxx"');
    process.exit(1);
  }

  try {
    console.log(`\nProcessing playlist: ${playlistId}`);

    // Fetch playlist details
    const playlist = await fetchPlaylist(playlistId);
    if (!playlist) {
      console.error('Playlist not found or not accessible');
      process.exit(1);
    }

    // Create playlist
    const createdPlaylist = await createPlaylist(playlist);
    if (!createdPlaylist) {
      console.error('Failed to create playlist');
      process.exit(1);
    }

    // Fetch and process videos
    console.log('\nFetching videos from playlist...');
    const videos = await fetchPlaylistVideos(playlistId);
    console.log(`Found ${videos.length} videos`);

    for (const video of videos) {
      await createVideo(video, createdPlaylist.id);
    }

    console.log('\nPlaylist processing completed!');
    await verifyPlaylist(playlistId);

  } catch (error) {
    console.error('Error during processing:', error);
    process.exit(1);
  }
}

main().catch(console.error);
