# Daily YouTube sync

Imports new lectures from the YouTube channel into Strapi, then refreshes the Vercel playlist cache so the homepage shows the latest series dates.

**Run this on your local/dev machine**, not on Strapi Cloud. The script needs `YOUTUBE_API_KEY` and a write-capable `STRAPI_API_TOKEN` from `server/.env`.

## One-off

```bash
cd server
pnpm youtube-sync
```

Populate only (do not hit the frontend webhook):

```bash
pnpm youtube-sync -- --skip-revalidate
```

## Environment

Set these in `server/.env` (the same file used for `youtube-populate`):

| Variable | Purpose |
|----------|---------|
| `STRAPI_BASE_URL` | Production Strapi URL (or local if you are syncing a local CMS) |
| `STRAPI_API_TOKEN` | Strapi API token with playlist/video write + publish |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `YOUTUBE_CHANNEL_ID` | Channel to sync (defaults in the populate script if omitted) |
| `FRONTEND_URL` | Site origin, e.g. `https://religousphilosophy.com/` |
| `REVALIDATE_SECRET` | Same value as Vercel `REVALIDATE_SECRET` |

Without `REVALIDATE_SECRET`, new videos still land in Strapi, but the homepage can stay cached for up to an hour.

## Cron on the dev server

Asia/Hebron is UTC+2 in winter. This runs at 06:00 Hebron time (04:00 UTC):

```cron
0 4 * * * cd /path/to/repo/server && /usr/bin/pnpm youtube-sync >> /var/log/youtube-sync.log 2>&1
```

Install:

```bash
crontab -e
```

Use an absolute path to `pnpm` (`which pnpm`) if cron's PATH does not include it. Keep `server/.env` on that machine; do not commit secrets.

## What it does

1. Runs `youtube-populate.ts` (creates missing playlists/videos, skips existing ones)
2. `POST /api/revalidate` with `model: playlist` so `/`, `/playlists`, and the `playlists` cache tag refresh
