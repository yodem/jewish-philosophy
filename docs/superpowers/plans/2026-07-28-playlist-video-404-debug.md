# Playlist/Video 404 Root Cause Fix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore working `/playlists/[slug]` and `/playlists/[slug]/[videoSlug]` pages (and the same by-slug failure mode on blog/writings/terms/responsa).

**Architecture:** Treat this as a production data-fetch + cache failure on Next.js detail routes, not as missing YouTube CMS rows. Confirm Vercel→Strapi auth and live `getXBySlug` responses first; then stop mapping upstream failures to `notFound()`, stop caching 404 shells, purge/redeploy, and only then harden `youtube-populate` / slug fallbacks.

**Tech Stack:** Next.js 16.2 (`cacheComponents`), Strapi v5.46 on Strapi Cloud, Vercel, pnpm

## Global Constraints

- Use `pnpm` only
- Do not commit secrets (`.env`, tokens)
- Prefer server-only `STRAPI_API_TOKEN` over `NEXT_PUBLIC_STRAPI_API_TOKEN`
- No exploit/debug endpoints that leak tokens
- Keep Hebrew/RTL behavior unchanged

---

## Investigation Verdict (Phase 1 evidence)

### What the user saw
- `religousphilosophy.com/playlists/PLT10N_...` → Next.js 404
- Listing page shows playlists and links to `/playlists/PLTI0N_...` (note: user URL used `1`/`l`; live slugs use `I`/`J`)

### What is / is not broken

| Layer | Status | Evidence |
|-------|--------|----------|
| YouTube data in Strapi | **Present** | Live API: playlist `יהדות רציונלית` slug=`PLTI0N_DfAqBt3BGU0psH_Jt1haMdbL3Fk`, 55 videos |
| Listing `/playlists` | **Works** | Renders cards; counts match Strapi (12/55/17/…) |
| Detail `/playlists/[slug]` | **404** | Title `סדרה לא נמצאה`; even sitemap slugs 404 |
| Other details (blog/writing/term/responsa) | **Also 404** | Breadcrumb/`לא נמצא` on multiple types |
| Strapi Public (no token) | **403 Forbidden** | All content types require API token |
| Strapi + token + exact app query | **Works** | `getPlaylistBySlug` query returns playlist + 12 videos |
| Full Route Cache | **Poisoned for playlists** | Detail response `date: 2026-06-29`, `x-nextjs-prerender: 1`, still HIT |

### Verdict

**This is a general production issue, not “youtube-populate failed to import the playlist.”**

`youtube-populate` is only a **secondary** contributor (Hebrew slug = `youtubeId`, skip-existing, late publish fix, some orphans). The user-facing 404 happens because `getPlaylistBySlug` / `getVideoBySlug` return `null` in the Vercel runtime (or a cached `notFound()` shell), then `notFound()` runs.

Primary failure chain:

```
Strapi requires auth (Public=403)
  → Vercel fetch for by-slug returns empty/error
  → fetchAPI soft-fails to { data: [] } on network errors
  → getXBySlug returns null
  → page calls notFound()
  → Next 16 cacheComponents / fetch revalidate caches the 404 shell
```

Known related prior art in-repo: term/writing stale-404 fixes (`revalidate: 0`) in `docs/superpowers/plans/2026-05-24-strapi-upgrade-and-term-slugs.md`. Playlists still use **7-day** revalidate and were never given that treatment.

---

## File Map

| File | Responsibility |
|------|----------------|
| `client/src/utils/fetchApi.ts` | Distinguish upstream errors from empty results; never return fake `{ data: [] }` for auth failures |
| `client/src/data/loaders.ts` | `getPlaylistBySlug` / `getVideoBySlug` (+ other by-slug): caching, optional `youtubeId` fallback |
| `client/src/app/playlists/[playlistSlug]/page.tsx` | Detail UI; only `notFound()` on confirmed missing |
| `client/src/app/playlists/[playlistSlug]/[videoSlug]/page.tsx` | Video detail; same |
| `client/src/app/api/revalidate/route.ts` | Add playlist/video/blog/term revalidation paths |
| `server/scripts/youtube-populate.ts` | Align slug generation with `fix-slugs.ts`; don’t skip slug repair forever |
| `server/scripts/fix-slugs.ts` | Already correct Hebrew→id slug helper; run against prod if needed |
| Vercel project env | `STRAPI_API_TOKEN`, `NEXT_PUBLIC_STRAPI_BASE_URL`, `REVALIDATE_SECRET` |

---

## Task 1: Confirm root cause on Vercel (no product fix yet)

**Goal:** Prove whether by-slug fails due to missing/invalid token, silent fetch failure, or cache-only.

- [x] **Step 1: In Vercel project `client` (`prj_aWozG4dRejb0tZaxzdvub6BpFa86`), verify env**

Check Production env for:
- `NEXT_PUBLIC_STRAPI_BASE_URL=https://gorgeous-power-cb8382b5a9.strapiapp.com`
- `NEXT_PUBLIC_STRAPI_API_TOKEN` and/or `STRAPI_API_TOKEN`
- Prefer setting **`STRAPI_API_TOKEN`** (server-only) to a known-good Strapi Cloud token that can `find` playlists/videos/blogs/…

**Status:** Local token + exact loader query confirmed (`יהדות רציונלית`, count=1). **Vercel Production env still needs a human check / `STRAPI_API_TOKEN` + cache purge after deploy.**

- [x] **Step 2: From a machine with the same token, reproduce the exact loader query**

Confirmed 2026-07-28: Strapi returns the playlist with videos when authorized.

- [ ] **Step 3: Add temporary diagnostics on a Preview deploy only**

Deferred — code fix addresses soft-fail + cache; verify via Preview/Production after deploy instead of temporary logs.

- [x] **Step 4: Record which hypothesis matched**

Primary: soft-fail `{ data: [] }` + 7-day cached `notFound` shells (playlist detail frozen since 2026-06-29). Secondary: confirm Vercel token after deploy.

---

## Task 2: Stop turning Strapi failures into cached 404s

**Goal:** Upstream errors must not look like “content missing.”

- [x] **Step 1: Write a failing unit/integration check for `fetchAPI` error mapping**

Added `client/scripts/test-fetchApi-errors.mjs` (all assertions pass).

- [x] **Step 2: Change `client/src/utils/fetchApi.ts`**

Unavailable → `{ data: null, error: { status: 503 } }`. Prefers `STRAPI_API_TOKEN`.

- [x] **Step 3: Update by-slug loaders to only `notFound` on true empty 200**

`assertNoStrapiError` on playlist/video/blog/writing/term/responsa by-slug loaders.

- [ ] **Step 4: Commit**

---

## Task 3: Fix playlist/video cache policy (match term/writing precedent)

**Goal:** Detail routes must not keep a 7-day 404 shell.

- [x] **Step 1: In `loaders.ts`, set by-slug playlist/video fetches to `revalidate: 0`**

- [x] **Step 2: Deferred tag-based revalidation**

- [x] **Step 3: Extend `client/src/app/api/revalidate/route.ts` for playlists/videos/blogs/terms**

- [ ] **Step 4: Purge production cache and redeploy `main`** — requires human in Vercel after merge

- [ ] **Step 5: Commit**

---

## Task 4: Optional resilience — resolve by `youtubeId` as well as `slug`

**Goal:** Survive slug drift and mistaken YouTube-ID URLs.

- [x] **Step 1: Extend `getPlaylistBySlug` fallback** (`youtubeId` / `videoId`)

- [ ] **Step 2: Smoke after production deploy**

- [ ] **Step 3: Commit** (bundled with other fixes)

---

## Task 5: YouTube populate hardening (secondary, after pages work)

**Goal:** Prevent future bad/unpublished/orphan imports — not required to unblock current 404s once Task 1–3 land.

- [x] **Step 1: Align slug generation in `youtube-populate.ts` with `fix-slugs.ts` `generateSlug()`**

- [x] **Step 2: When a playlist/video exists, repair slug / ensure published**

- [ ] **Step 3: Run `fix-slugs.ts` against production if any bad slugs remain** — ops, after deploy

- [ ] **Step 4: Investigate orphans** — ops, after deploy

- [ ] **Step 5: Commit** (bundled)

---

## Task 6: Verification checklist (production)

- [ ] `/playlists` listing links still work
- [ ] Click first card → detail renders title + videos (not 404)
- [ ] One video URL from sitemap works
- [ ] `/blog/<known-slug>`, `/writings/<known-slug>`, `/terms/<known-slug>` work (same class of bug)
- [ ] Strapi still 403 without token (expected); Vercel uses server token
- [ ] Vercel logs show no recurring 401/403/503 on by-slug

---

## Out of scope / do not confuse with root cause

- User typo `PLT10N` vs real slug `PLTI0N` (I vs 1) — real sitemap slug also 404s today
- Domain spelling `religousphilosophy.com` — intentional
- Preview branch `fix/duplicate-submissions-and-token-security` — not what Production serves (`main` @ `5be5837` as of investigation)

---

## Suggested implementation order

1. Task 1 (confirm token vs soft-fail vs cache)  
2. Task 2 + Task 3 (correctness + cache) + redeploy  
3. Task 6 verification  
4. Task 4 / Task 5 only if still needed
