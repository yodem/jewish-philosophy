# Strapi content backup

`backup-strapi.sh` pulls all content from the Strapi REST API into JSON files and mirrors the media library. Needs only `bash` and `python3` (stdlib), on Linux or macOS.

## What it backs up

- Collection types, published and drafts: authors, blogs, categories, comments, email-issue-categories, newsletter-signups, pages, playlists, responsas, terms, threads, videos, writings. Each gets `<type>.json` (published) and `<type>.draft.json` (`status=draft`).
- Single types: banner, global, home-page (`<type>.json`). A 404 means the single type has no content yet and is not an error.
- Media: every media object (`url` plus `mime` or `hash`) found in the JSON is downloaded to `<BACKUP_OUT_DIR>/media/<path-from-url>`. The folder is shared by all runs; files that already exist with non-zero size are skipped.
- `_metadata.json`: timestamp, source, per-type counts (published and draft), media counts, `status` (`ok`/`failed`) and the error list.

The output contains emails and other personal data. Directories are created with umask 077; keep it private.

## Configuration

Set in the environment or in `backup/.env` (see `.env.example`):

| Variable | Meaning |
|---|---|
| `STRAPI_BASE_URL` | Strapi URL (also accepted as first argument) |
| `STRAPI_API_TOKEN` | Dedicated read-only API token; never printed |
| `BACKUP_OUT_DIR` | Output root, default `<script dir>/data` |
| `BACKUP_KEEP_DAYS` | After a successful run, delete run dirs older than this, default 30 |

## Run

```bash
cd backup && ./backup-strapi.sh
```

Output goes to `$BACKUP_OUT_DIR/<YYYY-MM-DD_HH-MM-SS>/`. The last line is `BACKUP OK <dir>` (exit 0) or `BACKUP FAILED <n> errors` (exit 1). Any HTTP error on any page of any type, or any media download failure, fails the run; the remaining types are still attempted, and a failed type is never written as an empty file. Requests time out after 60 s and are retried 3 times with backoff. Retention only runs after a successful run, only removes directories named like a timestamp, and never touches `media/`. A failed run leaves its partial directory (with `_metadata.json` listing the errors) for inspection; it is pruned by a later successful run once it ages out.

## Cron (daily)

```cron
15 4 * * * cd /path/to/repo/backup && ./backup-strapi.sh >> /var/log/strapi-backup.log 2>&1 || echo "strapi backup failed" | logger -t strapi-backup
```

Keep credentials in `backup/.env` (git-ignored) rather than the crontab. Monitor on the exit code or the last log line.

## Reading a backup to restore

Each `<type>.json` is a plain JSON array of entries as returned by `GET /api/<type>?populate=*` (Strapi v5, with `documentId`, fields and one level of relations); single types are the raw `{"data": ...}` response. Inspect with `python3 -m json.tool` or `jq`:

```bash
jq 'length' data/<run>/videos.json
jq '.[] | {documentId, title}' data/<run>/blogs.json
```

Media files sit at the same path as in the media URL, so `media/<path>` matches an entry's `url`. This is a read-oriented backup: re-importing means creating entries through the REST API or the Strapi admin from these files, using `<type>.draft.json` to recover unpublished edits. Comparing `_metadata.json` counts with the Strapi admin confirms completeness.
