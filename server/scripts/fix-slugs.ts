import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const STRAPI_BASE_URL = process.env.STRAPI_BASE_URL || 'http://localhost:1337';
const STRAPI_URL = `${STRAPI_BASE_URL}/api`;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getStrapiHeaders = () => {
  if (!STRAPI_API_TOKEN) {
    console.warn('⚠️  STRAPI_API_TOKEN not found - requests may fail');
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
  };
};

function generateSlug(title: string, id: string): string {
  // Strapi uid field only allows /^[A-Za-z0-9-_.~]*$/ — no Hebrew
  const asciiPart = title
    .replace(/[^A-Za-z0-9\s-_.~]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  // If title is pure Hebrew (no ASCII left), use the id alone
  return asciiPart ? `${asciiPart}-${id}` : id;
}

async function fetchAll(endpoint: string, extraQuery = '') {
  const items: any[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const url = `${STRAPI_URL}/${endpoint}?pagination[page]=${page}&pagination[pageSize]=${pageSize}${extraQuery}`;
    const res = await fetch(url, { headers: getStrapiHeaders() });
    const json: any = await res.json();
    const data = json.data || [];
    items.push(...data);
    if (data.length < pageSize) break;
    page++;
  }

  return items;
}

async function fixPlaylists() {
  console.log('=== Fixing playlist slugs ===');
  const playlists = await fetchAll('playlists');
  let fixed = 0;

  for (const playlist of playlists) {
    if (!playlist.youtubeId) {
      console.log(`Skipping playlist "${playlist.title}" — no youtubeId`);
      continue;
    }

    const newSlug = generateSlug(playlist.title, playlist.youtubeId);
    if (playlist.slug === newSlug) continue;

    const identifier = playlist.documentId || playlist.id;
    console.log(`Updating playlist "${playlist.title}": "${playlist.slug}" → "${newSlug}"`);

    const res = await fetch(`${STRAPI_URL}/playlists/${identifier}`, {
      method: 'PUT',
      headers: getStrapiHeaders(),
      body: JSON.stringify({ data: { slug: newSlug } }),
    });

    const json: any = await res.json();
    if (!json.data) {
      console.error(`  Error:`, json);
    } else {
      fixed++;
    }
    await delay(100);
  }

  console.log(`Fixed ${fixed}/${playlists.length} playlist slugs\n`);
}

async function fixVideos() {
  console.log('=== Fixing video slugs ===');
  const videos = await fetchAll('videos');
  let fixed = 0;

  for (const video of videos) {
    if (!video.videoId) {
      console.log(`Skipping video "${video.title}" — no videoId`);
      continue;
    }

    const newSlug = generateSlug(video.title, video.videoId);
    if (video.slug === newSlug) continue;

    const identifier = video.documentId || video.id;
    console.log(`Updating video "${video.title}": "${video.slug}" → "${newSlug}"`);

    const res = await fetch(`${STRAPI_URL}/videos/${identifier}`, {
      method: 'PUT',
      headers: getStrapiHeaders(),
      body: JSON.stringify({ data: { slug: newSlug } }),
    });

    const json: any = await res.json();
    if (!json.data) {
      console.error(`  Error:`, json);
    } else {
      fixed++;
    }
    await delay(100);
  }

  console.log(`Fixed ${fixed}/${videos.length} video slugs\n`);
}

async function main() {
  console.log('Starting slug fix migration...\n');
  await fixPlaylists();
  await fixVideos();
  console.log('Done!');
}

main().catch(console.error);
