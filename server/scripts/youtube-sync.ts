import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const skipRevalidate = process.argv.includes('--skip-revalidate');
const populateScript = path.join(__dirname, 'youtube-populate.ts');
const serverRoot = path.join(__dirname, '..');

function runPopulate(): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'pnpm',
      ['exec', 'tsx', populateScript],
      {
        cwd: serverRoot,
        stdio: 'inherit',
        env: process.env,
      }
    );
    child.on('error', reject);
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

async function revalidateFrontend() {
  const secret = process.env.REVALIDATE_SECRET;
  const siteUrl = (
    process.env.FRONTEND_URL ||
    process.env.SITE_URL ||
    'https://religousphilosophy.com/'
  ).replace(/\/?$/, '/');

  if (!secret) {
    console.warn(
      'REVALIDATE_SECRET is not set — skipping frontend cache bust. Homepage may stay stale until the 1-hour playlist cache expires.'
    );
    return;
  }

  const url = `${siteUrl}api/revalidate?secret=${encodeURIComponent(secret)}`;
  console.log(`Revalidating frontend playlists at ${siteUrl}api/revalidate`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'playlist', entry: {} }),
  });

  const body = await res.text();
  if (!res.ok) {
    throw new Error(`Revalidate failed (${res.status}): ${body}`);
  }
  console.log('Frontend revalidated:', body);
}

async function main() {
  console.log('Daily YouTube sync starting (run this on the local/dev machine, not Strapi Cloud).');
  const code = await runPopulate();
  if (code !== 0) {
    process.exit(code);
  }

  if (!skipRevalidate) {
    await revalidateFrontend();
  }

  console.log('Daily YouTube sync finished.');
}

main().catch((error) => {
  console.error('Daily YouTube sync failed:', error);
  process.exit(1);
});
