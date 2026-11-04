#!/bin/bash
#
# Strapi Content Backup Script
# Downloads all content (published + drafts) from Strapi as JSON, and mirrors media files.
#
# Usage:
#   ./backup-strapi.sh                        # settings from env or backup/.env
#   ./backup-strapi.sh http://localhost:1337  # override STRAPI_BASE_URL
#
# Env (or backup/.env next to this script):
#   STRAPI_BASE_URL    Strapi instance URL (required)
#   STRAPI_API_TOKEN   read-only API token (required)
#   BACKUP_OUT_DIR     output root (default: <script dir>/data)
#   BACKUP_KEEP_DAYS   delete run dirs older than N days after a good run (default: 30)
#
# Exit code: 0 only if every type and every media file was backed up.

set -euo pipefail
umask 077   # output contains emails / PII

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env"
  set +a
fi

STRAPI_BASE_URL="${1:-${STRAPI_BASE_URL:-}}"
STRAPI_BASE_URL="${STRAPI_BASE_URL%/}"
STRAPI_API_TOKEN="${STRAPI_API_TOKEN:-}"
BACKUP_OUT_DIR="${BACKUP_OUT_DIR:-$SCRIPT_DIR/data}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-30}"

if [ -z "$STRAPI_BASE_URL" ]; then
  echo "Error: STRAPI_BASE_URL not set. Pass as argument or set in .env" >&2
  exit 1
fi
if [ -z "$STRAPI_API_TOKEN" ]; then
  echo "Error: STRAPI_API_TOKEN not set. Set in .env file" >&2
  exit 1
fi
case "$BACKUP_KEEP_DAYS" in
  ''|*[!0-9]*) echo "Error: BACKUP_KEEP_DAYS must be a non-negative integer" >&2; exit 1 ;;
esac
command -v python3 >/dev/null || { echo "Error: python3 not found" >&2; exit 1; }

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
mkdir -p "$BACKUP_OUT_DIR"
BACKUP_OUT_DIR="$(cd "$BACKUP_OUT_DIR" && pwd)"
BACKUP_DIR="$BACKUP_OUT_DIR/$TIMESTAMP"
mkdir -p "$BACKUP_DIR" "$BACKUP_OUT_DIR/media"

# Content types, by REST API id. Keep in sync with server/src/api/ (contact-email and search are not content).
COLLECTION_TYPES="authors blogs categories comments email-issue-categories newsletter-signups pages playlists responsas terms threads videos writings"
SINGLE_TYPES="banner global home-page"

echo "=== Strapi Backup ==="
echo "Source:  $STRAPI_BASE_URL"
echo "Output:  $BACKUP_DIR"
echo ""

# The token travels via the environment, never argv or output.
export STRAPI_API_TOKEN STRAPI_BASE_URL BACKUP_OUT_DIR BACKUP_DIR TIMESTAMP BACKUP_KEEP_DAYS \
       COLLECTION_TYPES SINGLE_TYPES

rc=0
python3 -I - <<'PYEOF' || rc=$?
import json, os, re, shutil, sys, time, datetime
import urllib.request, urllib.error, urllib.parse

TOKEN = os.environ["STRAPI_API_TOKEN"]
BASE = os.environ["STRAPI_BASE_URL"]
OUT = os.environ["BACKUP_OUT_DIR"]
RUN = os.environ["BACKUP_DIR"]
TS = os.environ["TIMESTAMP"]
KEEP_DAYS = int(os.environ["BACKUP_KEEP_DAYS"])
COLLECTIONS = os.environ["COLLECTION_TYPES"].split()
SINGLES = os.environ["SINGLE_TYPES"].split()
PAGE_SIZE = 100
TIMEOUT = 60
RETRIES = 3

os.umask(0o077)
errors = []
base_host = urllib.parse.urlparse(BASE).netloc


def fail(msg):
    errors.append(msg)
    print(f"  ERROR: {msg}", flush=True)


def open_url(url, auth):
    """GET with timeout and retries. Returns bytes. Raises last error."""
    headers = {"User-Agent": "strapi-backup/2"}
    if auth:
        headers["Authorization"] = f"Bearer {TOKEN}"
    last = None
    for attempt in range(1, RETRIES + 1):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                return resp.read()
        except urllib.error.HTTPError as e:
            last = e
            # client errors (except 408/429) will not fix themselves
            if 400 <= e.code < 500 and e.code not in (408, 429):
                raise
        except Exception as e:  # URLError, timeout, connection reset, short read
            last = e
        if attempt < RETRIES:
            time.sleep(2 ** attempt)  # 2s, 4s
    raise last


def describe(e):
    if isinstance(e, urllib.error.HTTPError):
        return f"HTTP {e.code} {e.reason}"
    return f"{type(e).__name__}: {e}"


def fetch_json(path_and_query):
    return json.loads(open_url(f"{BASE}/api/{path_and_query}", True))


def write_json(path, obj):
    tmp = path + ".part"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
    os.replace(tmp, path)


def fetch_collection(t, status):
    """All items of a collection, or raises (nothing partial is returned)."""
    items, page = [], 1
    while True:
        q = f"{t}?populate=*&sort=id&pagination[page]={page}&pagination[pageSize]={PAGE_SIZE}"
        if status:
            q += f"&status={status}"
        body = fetch_json(q)
        data = body.get("data")
        if not isinstance(data, list):
            raise ValueError(f"unexpected response shape on page {page}")
        items.extend(data)
        meta = (body.get("meta") or {}).get("pagination") or {}
        page_count = meta.get("pageCount")
        if page_count is not None:
            if page >= page_count:
                break
        elif len(data) < PAGE_SIZE:
            break
        page += 1
    total = ((body.get("meta") or {}).get("pagination") or {}).get("total")
    if total is not None and total != len(items):
        raise ValueError(f"fetched {len(items)} items but API reports total {total}")
    return items


counts = {}
saved_files = []

print("--- Collection types ---", flush=True)
for t in COLLECTIONS:
    counts[t] = {}
    for label, status, fname in (("published", None, f"{t}.json"), ("draft", "draft", f"{t}.draft.json")):
        try:
            items = fetch_collection(t, status)
        except Exception as e:
            fail(f"{t} ({label}): {describe(e)}")
            counts[t][label] = None
            continue
        write_json(os.path.join(RUN, fname), items)
        saved_files.append(fname)
        counts[t][label] = len(items)
    print(f"{t}: published={counts[t]['published']} draft={counts[t]['draft']}", flush=True)

print("--- Single types ---", flush=True)
for t in SINGLES:
    try:
        body = fetch_json(f"{t}?populate=*")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            # Strapi answers 404 for a single type with no content yet; verify it is that and not a wrong endpoint
            counts[t] = {"published": 0, "draft": None, "note": "404 (no content)"}
            print(f"{t}: 404 (single type has no content)", flush=True)
            continue
        fail(f"{t}: {describe(e)}")
        counts[t] = {"published": None}
        continue
    except Exception as e:
        fail(f"{t}: {describe(e)}")
        counts[t] = {"published": None}
        continue
    write_json(os.path.join(RUN, f"{t}.json"), body)
    saved_files.append(f"{t}.json")
    counts[t] = {"published": 1}
    print(f"{t}: saved", flush=True)

# ---- media mirror ----
print("--- Media ---", flush=True)


def collect_media(node, found):
    if isinstance(node, dict):
        url = node.get("url")
        if isinstance(url, str) and url and ("mime" in node or "hash" in node):
            found.add(url)
        for v in node.values():
            collect_media(v, found)
    elif isinstance(node, list):
        for v in node:
            collect_media(v, found)


media_urls = set()
for fname in saved_files:
    with open(os.path.join(RUN, fname), encoding="utf-8") as f:
        collect_media(json.load(f), media_urls)

media_root = os.path.realpath(os.path.join(OUT, "media"))
new_files = existing = failed_media = 0
for url in sorted(media_urls):
    full = url if re.match(r"^https?://", url) else BASE + (url if url.startswith("/") else "/" + url)
    parsed = urllib.parse.urlparse(full)
    rel = urllib.parse.unquote(parsed.path).lstrip("/")
    dest = os.path.realpath(os.path.join(media_root, rel))
    if not rel or not dest.startswith(media_root + os.sep):
        fail(f"media: refusing unsafe path from url {url}")
        failed_media += 1
        continue
    if os.path.isfile(dest) and os.path.getsize(dest) > 0:
        existing += 1
        continue
    try:
        data = open_url(full, parsed.netloc == base_host)
        if not data:
            raise ValueError("empty response")
    except Exception as e:
        fail(f"media {url}: {describe(e)}")
        failed_media += 1
        continue
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest + ".part", "wb") as f:
        f.write(data)
    os.replace(dest + ".part", dest)
    new_files += 1

media_total = 0
for _, _, files in os.walk(media_root):
    media_total += sum(1 for n in files if not n.endswith(".part"))
print(f"media referenced={len(media_urls)} new={new_files} already_present={existing} failed={failed_media} total_on_disk={media_total}", flush=True)

# ---- metadata ----
status = "ok" if not errors else "failed"
write_json(os.path.join(RUN, "_metadata.json"), {
    "timestamp": TS,
    "source": BASE,
    "status": status,
    "counts": counts,
    "media": {"referenced": len(media_urls), "downloaded_new": new_files,
              "already_present": existing, "failed": failed_media, "total_on_disk": media_total},
    "errors": errors,
})

# ---- retention (only after a successful run) ----
if status == "ok":
    pat = re.compile(r"^(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})$")
    cutoff = datetime.datetime.now() - datetime.timedelta(days=KEEP_DAYS)
    for name in sorted(os.listdir(OUT)):
        m = pat.match(name)
        p = os.path.join(OUT, name)
        if not m or name == TS or not os.path.isdir(p) or os.path.islink(p):
            continue
        try:
            when = datetime.datetime.strptime(name, "%Y-%m-%d_%H-%M-%S")
        except ValueError:
            continue
        if when < cutoff:
            shutil.rmtree(p)
            print(f"retention: removed {name}", flush=True)

if errors:
    print(f"BACKUP FAILED {len(errors)} errors")
    sys.exit(1)
print(f"BACKUP OK {RUN}")
PYEOF

exit "$rc"
