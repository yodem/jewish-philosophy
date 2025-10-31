import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyBs29YdmqhmaiPPwV4jmm2uEvUr5O41mHY';
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCCveJN9rRmW22wHRcce68ng';

console.log('STRAPI_API_TOKEN', STRAPI_API_TOKEN);
console.log('STRAPI_BASE_URL', STRAPI_BASE_URL);
console.log('YOUTUBE_API_KEY', YOUTUBE_API_KEY);
console.log('CHANNEL_ID', CHANNEL_ID);

// Helper function to get headers for Strapi API requests
const getStrapiHeaders = () => {
  if (!STRAPI_API_TOKEN) {
    console.warn('⚠️  STRAPI_API_TOKEN not found - requests may fail');
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  };
};

async function fetchPlaylists() {
  const url = `https://youtube.googleapis.com/youtube/v3/playlists?key=${YOUTUBE_API_KEY}&part=snippet&channelId=${CHANNEL_ID}&maxResults=200`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data.items || [];
}

async function fetchPlaylistItems(playlistId: string) {
  const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&part=snippet,contentDetails&playlistId=${playlistId}&maxResults=200`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data.items || [];
}

async function createOrUpdatePlaylist(playlist: any) {
  // Check if playlist already exists
  const existingRes = await fetch(`${STRAPI_URL}/playlists?filters[youtubeId][$eq]=${playlist.id}&pagination[limit]=999`, {
    headers: getStrapiHeaders()
  });
  const existingData: any = await existingRes.json();
  const existingPlaylist = existingData.data?.[0];

  console.log(`Looking for playlist with youtubeId: ${playlist.id}`);
  console.log(`Found existing playlist:`, existingPlaylist ? `ID: ${existingPlaylist.id}` : 'None');

  if (existingPlaylist) {
    console.log(`Skipping existing playlist: ${playlist.snippet.title} (ID: ${existingPlaylist.id})`);
    return existingPlaylist;
  }

  const payload = {
    data: {
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      imageUrl300x400: playlist.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard: playlist.snippet.thumbnails?.standard?.url || playlist.snippet.thumbnails?.high?.url || '',
      youtubeId: playlist.id,
      slug: `${playlist.snippet.title.replace(/[^A-Za-z0-9\s-_.~]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()}-${playlist.id}`,
    },
  };

  // Create new playlist
  console.log(`Creating playlist: ${playlist.snippet.title}`);
  const res = await fetch(`${STRAPI_URL}/playlists`, {
    method: 'POST',
    headers: getStrapiHeaders(),
    body: JSON.stringify(payload),
  });

  const data: any = await res.json();
  if (!data.data) {
    console.error('Playlist creation error:', data);
  }
  
  // Add small delay after playlist creation
  await delay(100);
  return data.data;
}

async function createOrUpdateVideo(video: any, playlistId: string) {

  // Skip private videos
  if (video.snippet.title === 'Private video') {
    console.log(`Skipping private video: ${video.contentDetails.videoId}`);
    return;
  }

  // Find the Strapi playlist by youtubeId
  const playlistRes = await fetch(`${STRAPI_URL}/playlists?filters[youtubeId][$eq]=${playlistId}&pagination[limit]=999`, {
    headers: getStrapiHeaders()
  });
  const playlistData: any = await playlistRes.json();
  const strapiPlaylistId = playlistData.data?.[0]?.id;
  if (!strapiPlaylistId) {
    console.error('No playlist found for video', video, playlistId);
    return;
  }
  console.log(`Found Strapi playlist ID: ${strapiPlaylistId} for YouTube playlist: ${playlistId}`);

  // Check if video already exists (with playlist relation populated)
  const existingRes = await fetch(`${STRAPI_URL}/videos?filters[videoId][$eq]=${video.contentDetails.videoId}&populate=playlist&pagination[limit]=999`, {
    headers: getStrapiHeaders()
  });
  const existingData: any = await existingRes.json();
  const existingVideo = existingData.data?.[0];

  if (existingVideo) {
    // Check if the video already has the correct playlist relation
    if (existingVideo.playlist?.id === strapiPlaylistId) {
      console.log(`Video already has correct playlist relation: ${video.snippet.title} (ID: ${existingVideo.id})`);
      return existingVideo;
    }

    // Update existing video with playlist relation
    // Use documentId for Strapi v5, fallback to id
    const videoIdentifier = existingVideo.documentId || existingVideo.id;
    console.log(`Updating playlist relation for existing video: ${video.snippet.title} (documentId: ${videoIdentifier})`);
    const updatePayload = {
      data: {
        playlist: strapiPlaylistId,
      },
    };

    const updateRes = await fetch(`${STRAPI_URL}/videos/${videoIdentifier}`, {
      method: 'PUT',
      headers: getStrapiHeaders(),
      body: JSON.stringify(updatePayload),
    });

    const updateData: any = await updateRes.json();
    if (!updateData.data) {
      console.error('Video update error:', updateData);
    } else {
      console.log(`Successfully updated video: ${video.snippet.title}`);
    }
    
    // Add small delay after video update
    await delay(100);
    return updateData.data;
  }

  const payload = {
    data: {
      title: video.snippet.title,
      description: video.snippet.description,
      imageUrl300x400: video.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard: video.snippet.thumbnails?.standard?.url || video.snippet.thumbnails?.high?.url || '',
      videoId: video.contentDetails.videoId,
      slug: `${video.snippet.title.replace(/[^A-Za-z0-9\s-_.~]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()}-${video.contentDetails.videoId}`,
      playlist: strapiPlaylistId,
    },
  };

  // Create new video
  console.log(`Creating video: ${video.snippet.title}`);
  const res = await fetch(`${STRAPI_URL}/videos`, {
    method: 'POST',
    headers: getStrapiHeaders(),
    body: JSON.stringify(payload),
  });

  const data: any = await res.json();
  if (!data.data) {
    console.error('Video operation error:', data);
  }
  
  // Add small delay after video creation
  await delay(100);
  return data.data;
}

async function verifyRelations() {
  console.log('\n=== Verifying Relations ===');

  // Get all playlists with their videos
  const playlistsRes = await fetch(`${STRAPI_URL}/playlists?populate=*&pagination[limit]=999`, {
    headers: getStrapiHeaders()
  });
  const playlistsData: any = await playlistsRes.json();
  
  for (const playlist of playlistsData.data || []) {
    const videoCount = playlist.videos?.length || 0;
    console.log(`Playlist "${playlist.title}" has ${videoCount} videos`);
    
    if (videoCount === 0) {
      console.warn(`⚠️  WARNING: Playlist "${playlist.title}" has no videos!`);
    }
  }
  
  // Get all videos with their playlists
  const videosRes = await fetch(`${STRAPI_URL}/videos?populate=*&pagination[limit]=999`, {
    headers: getStrapiHeaders()
  });
  const videosData: any = await videosRes.json();
  
  let orphanedVideos = 0;
  for (const video of videosData.data || []) {
    if (!video.playlist) {
      orphanedVideos++;
      console.warn(`⚠️  WARNING: Video "${video.title}" has no playlist!`);
    }
  }
  
  console.log(`\nTotal videos: ${videosData.data?.length || 0}`);
  console.log(`Orphaned videos (no playlist): ${orphanedVideos}`);
  console.log('=== End Verification ===\n');
}

async function main() {
  console.log('Starting YouTube data population...');
  
  // Fetch and create/update playlists
  const playlists = await fetchPlaylists();
  console.log(`Found ${playlists.length} playlists`);
  
  for (const playlist of playlists) {
    const createdPlaylist = await createOrUpdatePlaylist(playlist);
    if (!createdPlaylist) continue;
    
    // Fetch and create/update videos for this playlist
    const playlistId = playlist.id;
    const videos = await fetchPlaylistItems(playlistId);
    console.log(`Found ${videos.length} videos for playlist: ${playlist.snippet.title}`);
    
    for (const video of videos) {
      await createOrUpdateVideo(video, playlistId);
    }
  }
  
  console.log('YouTube data population completed!');
  
  // Verify that all relations are properly set
  await verifyRelations();
}

main().catch(console.error); 