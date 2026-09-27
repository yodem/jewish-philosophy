import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const STRAPI_BASE_URL =
  process.env.STRAPI_BASE_URL || 'https://gorgeous-power-cb8382b5a9.strapiapp.com';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

const getStrapiHeaders = () => {
  if (!STRAPI_API_TOKEN) {
    console.warn('⚠️  STRAPI_API_TOKEN not found - requests may fail');
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  };
};

/** Strapi uid only allows /^[A-Za-z0-9-_.~]*$/ — Hebrew titles fall back to the YouTube id. */
function generateSlug(title: string, id: string): string {
  const asciiPart = title
    .replace(/[^A-Za-z0-9\s-_.~]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return asciiPart ? `${asciiPart}-${id}` : id;
}

function extractPlaylistId(url: string): string | null {
  const playlistMatch = url.match(/[?&]list=([^#&?]*)/);
  return playlistMatch?.[1] || null;
}

function extractYoutubeDescription(html: string): string {
  const markerIndex = html.indexOf('ytInitialPlayerResponse');
  if (markerIndex === -1) return '';
  const braceStart = html.indexOf('{', markerIndex);
  if (braceStart === -1) return '';

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = braceStart; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try {
          const player = JSON.parse(html.slice(braceStart, i + 1));
          return player?.videoDetails?.shortDescription || '';
        } catch {
          return '';
        }
      }
    }
  }
  return '';
}

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function fetchPlaylist(playlistId: string) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is required to import a full playlist from YouTube');
  }
  const url = `https://youtube.googleapis.com/youtube/v3/playlists?key=${YOUTUBE_API_KEY}&part=snippet&id=${playlistId}`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data.items?.[0] || null;
}

async function fetchPlaylistVideos(playlistId: string) {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is required to import a full playlist from YouTube');
  }
  const url = `https://youtube.googleapis.com/youtube/v3/playlistItems?key=${YOUTUBE_API_KEY}&part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data.items || [];
}

type VideoDetails = {
  videoId: string;
  title: string;
  description: string;
  imageUrl300x400: string;
  imageUrlStandard: string;
};

async function fetchVideoDetails(videoId: string): Promise<VideoDetails | null> {
  if (YOUTUBE_API_KEY) {
    const url = `https://youtube.googleapis.com/youtube/v3/videos?key=${YOUTUBE_API_KEY}&part=snippet&id=${videoId}`;
    const res = await fetch(url);
    const data: any = await res.json();
    const item = data.items?.[0];
    if (!item) return null;
    const snippet = item.snippet;
    return {
      videoId,
      title: snippet.title,
      description: snippet.description || '',
      imageUrl300x400: snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      imageUrlStandard:
        snippet.thumbnails?.standard?.url ||
        snippet.thumbnails?.high?.url ||
        `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    };
  }

  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
  const oembedRes = await fetch(oembedUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  if (!oembedRes.ok) {
    console.error(`oEmbed failed for ${videoId}: ${oembedRes.status}`);
    return null;
  }
  const oembed: any = await oembedRes.json();

  let description = '';
  try {
    const watchRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const html = await watchRes.text();
    description = extractYoutubeDescription(html);
  } catch (error) {
    console.warn(`Could not scrape description for ${videoId}:`, error);
  }

  return {
    videoId,
    title: oembed.title,
    description,
    imageUrl300x400: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    imageUrlStandard: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
  };
}

async function findStrapiPlaylist(identifier: string) {
  const queries = [
    `filters[youtubeId][$eq]=${encodeURIComponent(identifier)}`,
    `filters[slug][$eq]=${encodeURIComponent(identifier)}`,
  ];
  for (const query of queries) {
    const res = await fetch(`${STRAPI_URL}/playlists?${query}&pagination[limit]=1`, {
      headers: getStrapiHeaders(),
    });
    const data: any = await res.json();
    if (data.error) {
      console.error('Playlist lookup error:', data.error);
      continue;
    }
    if (data.data?.[0]) return data.data[0];
  }
  return null;
}

async function createOrUpdatePlaylist(playlist: any) {
  const existing = await findStrapiPlaylist(playlist.id);
  const desiredSlug = generateSlug(playlist.snippet.title, playlist.id);

  if (existing) {
    const identifier = existing.documentId || existing.id;
    if (existing.slug !== desiredSlug) {
      console.log(`Repairing playlist slug "${existing.slug}" → "${desiredSlug}"`);
      await fetch(`${STRAPI_URL}/playlists/${identifier}`, {
        method: 'PUT',
        headers: getStrapiHeaders(),
        body: JSON.stringify({ data: { slug: desiredSlug } }),
      });
    } else {
      console.log(`Playlist already exists: ${playlist.snippet.title}`);
    }
    if (!existing.publishedAt) {
      await fetch(`${STRAPI_URL}/playlists/${identifier}/actions/publish`, {
        method: 'POST',
        headers: getStrapiHeaders(),
      });
    }
    await delay(100);
    return existing;
  }

  const payload = {
    data: {
      title: playlist.snippet.title,
      description: playlist.snippet.description,
      imageUrl300x400: playlist.snippet.thumbnails?.medium?.url || '',
      imageUrlStandard:
        playlist.snippet.thumbnails?.standard?.url || playlist.snippet.thumbnails?.high?.url || '',
      youtubeId: playlist.id,
      slug: desiredSlug,
    },
  };

  console.log(`Creating playlist: ${playlist.snippet.title}`);
  const res = await fetch(`${STRAPI_URL}/playlists`, {
    method: 'POST',
    headers: getStrapiHeaders(),
    body: JSON.stringify(payload),
  });
  const data: any = await res.json();
  if (!data.data) {
    console.error('Playlist creation error:', data);
    return null;
  }
  const docId = data.data.documentId || data.data.id;
  await fetch(`${STRAPI_URL}/playlists/${docId}/actions/publish`, {
    method: 'POST',
    headers: getStrapiHeaders(),
  });
  await delay(100);
  return data.data;
}

async function createOrUpdateVideo(details: VideoDetails, strapiPlaylistId: string) {
  const existingRes = await fetch(
    `${STRAPI_URL}/videos?filters[videoId][$eq]=${details.videoId}&populate=playlist&pagination[limit]=1`,
    { headers: getStrapiHeaders() }
  );
  const existingData: any = await existingRes.json();
  if (existingData.error) {
    console.error('Video lookup error:', existingData.error);
    return null;
  }
  const existingVideo = existingData.data?.[0];
  const desiredSlug = generateSlug(details.title, details.videoId);

  if (existingVideo) {
    const videoIdentifier = existingVideo.documentId || existingVideo.id;
    const currentPlaylistId = existingVideo.playlist?.id;
    const needsPlaylistFix = currentPlaylistId !== strapiPlaylistId;
    const needsSlugFix = existingVideo.slug !== desiredSlug;
    const needsMetaFix =
      existingVideo.title !== details.title ||
      (details.description && existingVideo.description !== details.description);

    if (!needsPlaylistFix && !needsSlugFix && !needsMetaFix) {
      console.log(`Video already linked: ${details.title} (${details.videoId})`);
      return existingVideo;
    }

    console.log(
      `Updating video ${details.videoId}: playlist=${needsPlaylistFix} slug=${needsSlugFix} meta=${needsMetaFix}`
    );
    const updateRes = await fetch(`${STRAPI_URL}/videos/${videoIdentifier}`, {
      method: 'PUT',
      headers: getStrapiHeaders(),
      body: JSON.stringify({
        data: {
          playlist: strapiPlaylistId,
          slug: desiredSlug,
          title: details.title,
          description: details.description || existingVideo.description,
          imageUrl300x400: details.imageUrl300x400,
          imageUrlStandard: details.imageUrlStandard,
        },
      }),
    });
    const updateData: any = await updateRes.json();
    if (!updateData.data) {
      console.error('Video update error:', updateData);
      return null;
    }
    if (!existingVideo.publishedAt) {
      await fetch(`${STRAPI_URL}/videos/${videoIdentifier}/actions/publish`, {
        method: 'POST',
        headers: getStrapiHeaders(),
      });
    }
    await delay(100);
    return updateData.data;
  }

  console.log(`Creating video: ${details.title} (${details.videoId})`);
  const res = await fetch(`${STRAPI_URL}/videos`, {
    method: 'POST',
    headers: getStrapiHeaders(),
    body: JSON.stringify({
      data: {
        title: details.title,
        description: details.description,
        imageUrl300x400: details.imageUrl300x400,
        imageUrlStandard: details.imageUrlStandard,
        videoId: details.videoId,
        slug: desiredSlug,
        playlist: strapiPlaylistId,
      },
    }),
  });
  const data: any = await res.json();
  if (!data.data) {
    console.error('Video creation error:', data);
    return null;
  }
  const docId = data.data.documentId || data.data.id;
  await fetch(`${STRAPI_URL}/videos/${docId}/actions/publish`, {
    method: 'POST',
    headers: getStrapiHeaders(),
  });
  await delay(100);
  return data.data;
}

async function verifyPlaylist(identifier: string, expectedVideoIds: string[] = []) {
  console.log('\n=== Verifying Playlist ===');
  const playlist = await findStrapiPlaylist(identifier);
  if (!playlist) {
    console.log(`Playlist ${identifier} not found`);
    console.log('=== End Verification ===\n');
    return;
  }
  const populated = await fetch(
    `${STRAPI_URL}/playlists?filters[documentId][$eq]=${playlist.documentId || playlist.id}&populate[videos][fields][0]=videoId&populate[videos][fields][1]=title&pagination[limit]=1`,
    { headers: getStrapiHeaders() }
  );
  const populatedData: any = await populated.json();
  const full = populatedData.data?.[0] || playlist;
  const videos = full.videos || [];
  console.log(`Playlist "${full.title}" has ${videos.length} videos`);
  for (const videoId of expectedVideoIds) {
    const found = videos.some((video: any) => video.videoId === videoId);
    console.log(`  ${found ? '✅' : '❌'} ${videoId}`);
  }
  console.log('=== End Verification ===\n');
}

function printUsage() {
  console.log('Usage:');
  console.log('  pnpm tsx scripts/youtube-single.ts --playlist|-p PLAYLIST_ID');
  console.log('  pnpm tsx scripts/youtube-single.ts --url|-u PLAYLIST_OR_VIDEO_URL');
  console.log('  pnpm tsx scripts/youtube-single.ts --into PLAYLIST_YOUTUBE_ID --video|-v VIDEO_ID [--video VIDEO_ID]');
  console.log('  pnpm tsx scripts/youtube-single.ts --into PLAYLIST_YOUTUBE_ID --url VIDEO_URL [--url VIDEO_URL]');
}

async function importVideosIntoPlaylist(playlistIdentifier: string, videoIds: string[]) {
  const strapiPlaylist = await findStrapiPlaylist(playlistIdentifier);
  if (!strapiPlaylist) {
    console.error(`Strapi playlist not found for ${playlistIdentifier}`);
    process.exit(1);
  }
  const strapiPlaylistId = strapiPlaylist.id;
  console.log(`Assigning ${videoIds.length} video(s) to playlist "${strapiPlaylist.title}" (id ${strapiPlaylistId})`);

  for (const videoId of videoIds) {
    const details = await fetchVideoDetails(videoId);
    if (!details) {
      console.error(`Video not found or not accessible: ${videoId}`);
      continue;
    }
    await createOrUpdateVideo(details, strapiPlaylistId);
  }

  await verifyPlaylist(playlistIdentifier, videoIds);
}

async function importYoutubePlaylist(playlistId: string) {
  console.log(`\nProcessing playlist: ${playlistId}`);
  const playlist = await fetchPlaylist(playlistId);
  if (!playlist) {
    console.error('Playlist not found or not accessible');
    process.exit(1);
  }

  const createdPlaylist = await createOrUpdatePlaylist(playlist);
  if (!createdPlaylist) {
    console.error('Failed to create playlist');
    process.exit(1);
  }

  console.log('\nFetching videos from playlist...');
  const videos = await fetchPlaylistVideos(playlistId);
  console.log(`Found ${videos.length} videos`);

  for (const video of videos) {
    const videoId = video.contentDetails?.videoId;
    if (!videoId || video.snippet?.title === 'Private video') {
      console.log(`Skipping video ${videoId || '(unknown)'}`);
      continue;
    }
    await createOrUpdateVideo(
      {
        videoId,
        title: video.snippet.title,
        description: video.snippet.description || '',
        imageUrl300x400: video.snippet.thumbnails?.medium?.url || '',
        imageUrlStandard:
          video.snippet.thumbnails?.standard?.url || video.snippet.thumbnails?.high?.url || '',
      },
      createdPlaylist.id
    );
  }

  console.log('\nPlaylist processing completed!');
  await verifyPlaylist(playlistId);
}

async function main() {
  const args = process.argv.slice(2);
  let playlistId: string | undefined;
  let intoPlaylist: string | undefined;
  const videoIds: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--playlist':
      case '-p':
        playlistId = args[++i];
        break;
      case '--into':
        intoPlaylist = args[++i];
        break;
      case '--video':
      case '-v': {
        const videoId = extractVideoId(args[++i] || '');
        if (!videoId) {
          console.error('Could not parse video id:', args[i]);
          process.exit(1);
        }
        videoIds.push(videoId);
        break;
      }
      case '--url':
      case '-u': {
        const url = args[++i];
        const extractedPlaylist = extractPlaylistId(url);
        const extractedVideo = extractVideoId(url);
        if (extractedPlaylist && !extractedVideo) {
          playlistId = extractedPlaylist;
        } else if (extractedVideo) {
          videoIds.push(extractedVideo);
        } else {
          console.error('Could not extract playlist or video ID from URL:', url);
          process.exit(1);
        }
        break;
      }
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          printUsage();
          process.exit(1);
        }
    }
  }

  console.log('YouTube Single Item Import Script');
  console.log('=================================');
  console.log(`STRAPI_BASE_URL=${STRAPI_BASE_URL}`);
  console.log(`YOUTUBE_API_KEY=${YOUTUBE_API_KEY ? 'set' : 'missing (oEmbed fallback)'}`);
  console.log(`STRAPI_API_TOKEN=${STRAPI_API_TOKEN ? 'set' : 'missing'}`);

  if (videoIds.length && (intoPlaylist || playlistId)) {
    await importVideosIntoPlaylist(intoPlaylist || playlistId!, [...new Set(videoIds)]);
    return;
  }

  if (playlistId) {
    await importYoutubePlaylist(playlistId);
    return;
  }

  printUsage();
  process.exit(1);
}

main().catch((error) => {
  console.error('Error during processing:', error);
  process.exit(1);
});
