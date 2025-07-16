import fetch from 'node-fetch';

const STRAPI_URL = 'http://localhost:1337/api';
const YOUTUBE_API_KEY = 'AIzaSyBs29YdmqhmaiPPwV4jmm2uEvUr5O41mHY';
const CHANNEL_ID = 'UCCveJN9rRmW22wHRcce68ng';

function generateSlug(title: string) {
  return title
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '') // Remove non-word, non-space, non-dash
    .replace(/\s+/g, '-')      // Replace spaces with dashes
    .replace(/[^A-Za-z0-9-_.~]/g, '') // Remove all but allowed slug chars
    .replace(/-+/g, '-')        // Collapse multiple dashes
    .replace(/^-+|-+$/g, '')    // Trim leading/trailing dashes
    .toLowerCase();
}

async function deleteAll(endpoint: string) {
  const res = await fetch(`${STRAPI_URL}/${endpoint}?pagination[pageSize]=1000`);
  const data = await res.json();
  const items = data.data || [];
  for (const item of items) {
    await fetch(`${STRAPI_URL}/${endpoint}/${item.id}`, { method: 'DELETE' });
    console.log(`Deleted ${endpoint.slice(0, -1)}: ${item.id}`);
  }
}

async function fetchPlaylists() {
  const url = `https://youtube.googleapis.com/youtube/v3/playlists?key=${YOUTUBE_API_KEY}&part=snippet&channelId=${CHANNEL_ID}&maxResults=20`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

async function fetchPlaylistItems(playlistId: string) {
  const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&part=snippet,contentDetails&playlistId=${playlistId}&maxResults=20`;
  const res = await fetch(url);
  const data = await res.json();
  return data.items || [];
}

async function createPlaylist(playlist: any) {
  const payload = {
    data: {
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      imageUrl300x400: playlist.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard: playlist.snippet.thumbnails?.standard?.url || playlist.snippet.thumbnails?.high?.url || '',
      youtubeId: playlist.id,
      slug: generateSlug(playlist.snippet.title),
    },
  };
  const res = await fetch(`${STRAPI_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.data) {
    console.error('Playlist creation failed response:', data);
  }
  return data.data;
}

async function createVideo(video: any, playlistStrapiId: number) {
  const payload = {
    data: {
      title: video.snippet.title,
      description: video.snippet.description,
      imageUrl300x400: video.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard: video.snippet.thumbnails?.standard?.url || video.snippet.thumbnails?.high?.url || '',
      videoId: video.contentDetails?.videoId || video.snippet.resourceId?.videoId || '',
      playlist: playlistStrapiId,
      slug: generateSlug(video.snippet.title),
    },
  };
  const res = await fetch(`${STRAPI_URL}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.data;
}

async function patchVideoWithPlaylist(videoId: string, playlistStrapiId: number) {
  const res = await fetch(`${STRAPI_URL}/videos?filters[videoId][$eq]=${videoId}`);
  const data = await res.json();
  const video = data.data?.[0];
  if (video && (!video.playlist || video.playlist !== playlistStrapiId)) {
    await fetch(`${STRAPI_URL}/videos/${video.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { playlist: playlistStrapiId } }),
    });
    console.log(`  Patched video ${videoId} with playlist ${playlistStrapiId}`);
  }
}

async function main() {
  // Delete all videos and playlists first
  await deleteAll('videos');
  await deleteAll('playlists');

  const playlists = await fetchPlaylists();
  for (const playlist of playlists) {
    try {
      const playlistStrapi = await createPlaylist(playlist);
      console.log(`Created playlist: ${playlist.snippet.title}`);
      const playlistId = playlist.id;
      const playlistStrapiId = playlistStrapi.id;
      const videos = await fetchPlaylistItems(playlistId);
      for (const video of videos) {
        try {
          const created = await createVideo(video, playlistStrapiId);
          if (!created) {
            const videoId = video.contentDetails?.videoId || video.snippet.resourceId?.videoId || '';
            await patchVideoWithPlaylist(videoId, playlistStrapiId);
          }
          console.log(`  Added or patched video: ${video.snippet.title}`);
        } catch (err) {
          console.error(`  Failed to add/patch video: ${video.snippet.title}`, err);
        }
      }
    } catch (err) {
      console.error(`Failed to create playlist: ${playlist.snippet.title}`, err);
    }
  }
}

main().catch(console.error); 