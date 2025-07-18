import fetch from 'node-fetch';

const STRAPI_URL = 'http://localhost:1337/api';
const YOUTUBE_API_KEY = 'AIzaSyBs29YdmqhmaiPPwV4jmm2uEvUr5O41mHY';
const CHANNEL_ID = 'UCCveJN9rRmW22wHRcce68ng';

async function deleteAll(endpoint: string) {
  const res = await fetch(`${STRAPI_URL}/${endpoint}?pagination[pageSize]=1000`);
  const data: any = await res.json();
  for (const item of data.data || []) {
    await fetch(`${STRAPI_URL}/${endpoint}/${item.id}`, { method: 'DELETE' });
  }
}

async function fetchPlaylists() {
  const url = `https://youtube.googleapis.com/youtube/v3/playlists?key=${YOUTUBE_API_KEY}&part=snippet&channelId=${CHANNEL_ID}&maxResults=20`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data.items || [];
}

async function fetchPlaylistItems(playlistId: string) {
  const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&part=snippet,contentDetails&playlistId=${playlistId}&maxResults=20`;
  const res = await fetch(url);
  const data: any = await res.json();
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
      slug: playlist.id, // Use YouTube playlistId as slug
    },
  };
  const res = await fetch(`${STRAPI_URL}/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: any = await res.json();
  if (!data.data) {
    console.error('Playlist creation error:', data);
  }
  return data.data;
}

async function createVideo(video: any, playlistId: string) {
  // Find the Strapi playlist by youtubeId
  const playlistRes = await fetch(`${STRAPI_URL}/playlists?filters[youtubeId][$eq]=${playlistId}`);
  const playlistData: any = await playlistRes.json();
  const strapiPlaylistId = playlistData.data?.[0]?.id;
  if (!strapiPlaylistId) {
    console.error('No playlist found for video', video, playlistId);
    return;
  }
  const payload = {
    data: {
      title: video.snippet.title,
      description: video.snippet.description,
      imageUrl300x400: video.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard: video.snippet.thumbnails?.standard?.url || video.snippet.thumbnails?.high?.url || '',
      videoId: video.contentDetails.videoId,
      slug: video.contentDetails.videoId, // Use YouTube videoId as slug
      playlist: strapiPlaylistId,
    },
  };
  const res = await fetch(`${STRAPI_URL}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data: any = await res.json();
  if (!data.data) {
    console.error('Video creation error:', data);
  }
  return data.data;
}

async function main() {
  // Clean all data
  await deleteAll('videos');
  await deleteAll('playlists');

  // Fetch and create playlists
  const playlists = await fetchPlaylists();
  for (const playlist of playlists) {
    const createdPlaylist = await createPlaylist(playlist);
    if (!createdPlaylist) continue;
    // Fetch and create videos for this playlist
    const playlistId = playlist.id;
    const videos = await fetchPlaylistItems(playlistId);
    for (const video of videos) {
      await createVideo(video, playlistId);
    }
  }
}

main().catch(console.error); 