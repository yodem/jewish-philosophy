#!/bin/bash
#
# Strapi Content Backup Script
# Downloads all content from Strapi CMS and stores as JSON files.
#
# Usage:
#   ./backup-strapi.sh                    # Uses production URL from env
#   ./backup-strapi.sh http://localhost:1337  # Custom Strapi URL
#
# Required env vars (or set in .env file next to this script):
#   STRAPI_BASE_URL   - Strapi instance URL
#   STRAPI_API_TOKEN  - API token for authentication

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load .env if present
if [ -f "$SCRIPT_DIR/.env" ]; then
  set -a
  source "$SCRIPT_DIR/.env"
  set +a
fi

# Allow URL override via argument
STRAPI_BASE_URL="${1:-${STRAPI_BASE_URL:-}}"
STRAPI_API_TOKEN="${STRAPI_API_TOKEN:-}"

if [ -z "$STRAPI_BASE_URL" ]; then
  echo "Error: STRAPI_BASE_URL not set. Pass as argument or set in .env"
  exit 1
fi

if [ -z "$STRAPI_API_TOKEN" ]; then
  echo "Error: STRAPI_API_TOKEN not set. Set in .env file"
  exit 1
fi

# Timestamp for backup folder
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$SCRIPT_DIR/data/$TIMESTAMP"
TEMP_DIR=$(mktemp -d)
mkdir -p "$BACKUP_DIR"

cleanup() {
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# All known Strapi content types (collection + single types)
COLLECTION_TYPES=(
  "authors"
  "blogs"
  "categories"
  "comments"
  "emails"
  "email-issue-categories"
  "newsletter-signups"
  "pages"
  "playlists"
  "responsas"
  "terms"
  "threads"
  "videos"
  "writings"
)

SINGLE_TYPES=(
  "banner"
  "global"
  "home-page"
)

echo "=== Strapi Backup ==="
echo "Source:  $STRAPI_BASE_URL"
echo "Output:  $BACKUP_DIR"
echo ""

# Backup collection types (paginated) using a Python helper for robustness
for type in "${COLLECTION_TYPES[@]}"; do
  echo -n "Backing up $type..."

  python3 - "$type" "$STRAPI_BASE_URL" "$STRAPI_API_TOKEN" "$BACKUP_DIR" "$TEMP_DIR" <<'PYEOF'
import sys, json, urllib.request, urllib.error, os

content_type = sys.argv[1]
base_url = sys.argv[2]
token = sys.argv[3]
backup_dir = sys.argv[4]
temp_dir = sys.argv[5]

all_data = []
page = 1
page_size = 100

while True:
    url = f"{base_url}/api/{content_type}?populate=*&pagination[page]={page}&pagination[pageSize]={page_size}"
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req) as resp:
            body = json.loads(resp.read())
    except (urllib.error.HTTPError, urllib.error.URLError) as e:
        if page == 1:
            print(f" SKIPPED ({e})")
        break

    data = body.get("data", [])
    meta = body.get("meta", {}).get("pagination", {})
    page_count = meta.get("pageCount", 1)
    total = meta.get("total", 0)

    all_data.extend(data)

    if page >= page_count:
        break
    page += 1

out_path = os.path.join(backup_dir, f"{content_type}.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_data, f, indent=2, ensure_ascii=False)

print(f" {len(all_data)} items saved")
PYEOF

done

echo ""

# Backup single types
for type in "${SINGLE_TYPES[@]}"; do
  echo -n "Backing up $type..."

  python3 - "$type" "$STRAPI_BASE_URL" "$STRAPI_API_TOKEN" "$BACKUP_DIR" <<'PYEOF'
import sys, json, urllib.request, urllib.error, os

content_type = sys.argv[1]
base_url = sys.argv[2]
token = sys.argv[3]
backup_dir = sys.argv[4]

url = f"{base_url}/api/{content_type}?populate=*"
req = urllib.request.Request(url, headers={
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
})
try:
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read())
    out_path = os.path.join(backup_dir, f"{content_type}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(body, f, indent=2, ensure_ascii=False)
    print(" saved")
except (urllib.error.HTTPError, urllib.error.URLError) as e:
    print(f" SKIPPED ({e})")
PYEOF

done

echo ""

# Write metadata
python3 - "$TIMESTAMP" "$STRAPI_BASE_URL" "$BACKUP_DIR" <<PYEOF
import json, os, sys
timestamp = sys.argv[1]
source = sys.argv[2]
backup_dir = sys.argv[3]
collections = $(printf '%s\n' "${COLLECTION_TYPES[@]}" | python3 -c "import sys,json; print(json.dumps([l.strip() for l in sys.stdin]))")
singles = $(printf '%s\n' "${SINGLE_TYPES[@]}" | python3 -c "import sys,json; print(json.dumps([l.strip() for l in sys.stdin]))")
meta = {"timestamp": timestamp, "source": source, "collections": collections, "singles": singles}
with open(os.path.join(backup_dir, "_metadata.json"), "w") as f:
    json.dump(meta, f, indent=2)
PYEOF

echo "=== Backup complete ==="
echo "Files saved to: $BACKUP_DIR"
echo ""
ls -lh "$BACKUP_DIR"
