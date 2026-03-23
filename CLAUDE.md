# Jewish Philosophy Platform

Full-stack academic content platform for Jewish philosophy. Hebrew-first, RTL.

- **Frontend**: Next.js 15 (App Router, React 19) in `/client` — deployed on **Vercel**
- **Backend**: Strapi v5.17.0 in `/server` — deployed on **Strapi Cloud**
- **Database**: SQLite (dev), PostgreSQL migration in progress (`feat/psql` branch)
- **Package manager**: pnpm exclusively — never npm or yarn
- **Language**: TypeScript throughout, strict mode on frontend
- **Site URL**: https://religousphilosophy.com/

## Quick Start

```bash
# Frontend
cd client && pnpm install && pnpm dev

# Backend (Strapi)
cd server && pnpm install && pnpm develop
```

## Monorepo Layout

```
/
├── client/          # Next.js 15 frontend
├── server/          # Strapi v5 CMS backend
├── n8n/             # n8n workflow integrations
├── youtube-integ/   # YouTube integration service
└── logs/            # Application logs
```

No root package.json — client and server are independent workspaces with separate dependency trees.

## Content Types (Strapi)

| Type | Kind | Key Fields | Relations |
|------|------|-----------|-----------|
| **Blog** | Collection | title, content (richtext), slug, coverImage, views | author, categories, comments, threads |
| **Responsa** | Collection | title, content (richtext), questioneer, questioneerEmail, slug, views | categories, comments, threads, writings |
| **Video** | Collection | title, videoId, slug, imageUrl300x400, views | playlist, categories |
| **Playlist** | Collection | title, youtubeId, slug | videos |
| **Writing** | Collection | title, description (richtext), type (book/article), slug, priority, pdfFile, views | author, categories |
| **Term** | Collection | title, description, slug, views | author, categories |
| **Author** | Collection | name, email, avatar | blogs, writings |
| **Category** | Collection | name, slug, description, type (term/person/genre) | blogs, responsas, writings |
| **Comment** | Collection | answer (richtext), answerer, slug | responsa, blog, threads |
| **Thread** | Collection | answer (richtext), answerer, parentCommentSlug | parentComment, responsa, blog |
| **Page** | Collection | title, description, slug, blocks (dynamiczone) | — |
| **Banner** | Single | title, description, link, date, isActive | — |
| **HomePage** | Single | title, description, blocks (dynamiczone) | — |

All main content types (Blog, Video, Responsa, Writing, Term) have a `views` integer field with a custom `POST /:id/view` route.

## Frontend Architecture

### Tech Stack
- Next.js 15.4.8, React 19, TypeScript 5
- Tailwind CSS 4 (PostCSS, no config file) with `@tailwindcss/typography`
- Radix UI primitives + Shadcn/ui components (`/src/components/ui/`)
- Component variants via `class-variance-authority`
- Zod 4 for form validation
- React Markdown with rehype-raw & remark-gfm

### Directory Structure
```
client/src/
├── app/                    # App Router pages
│   ├── blog/              # Blog listing + [slug]
│   ├── responsa/          # Q&A listing + [slug]
│   ├── playlists/         # Playlists + [playlistSlug]/[videoSlug]
│   ├── writings/          # Writings listing + [slug]
│   ├── terms/             # Glossary + [slug]
│   ├── search/            # Search page (force-dynamic)
│   ├── contact/           # Contact form
│   ├── about/             # About page
│   ├── unsubscribe/       # Newsletter unsubscribe
│   ├── api/revalidate/    # Strapi webhook for cache invalidation
│   ├── sitemap.ts         # XML sitemap (all content types)
│   ├── robots.ts          # robots.txt
│   └── manifest.ts        # PWA manifest
├── components/
│   ├── ui/                # Shadcn/ui base components
│   ├── blocks/            # Dynamic content blocks (Hero, Info, Subscribe)
│   ├── comments/          # Threaded comment system
│   ├── Navbar.tsx         # RTL navigation with mobile Sheet
│   ├── CategoryBadge.tsx  # Color-coded category badges
│   ├── SearchDialog.tsx   # Cmd+K search dialog
│   └── ...
├── data/
│   ├── loaders.ts         # All data fetching functions (server-side)
│   ├── services.ts        # Client-side services (search, subscribe)
│   └── action.ts          # Server actions with Zod validation
├── hooks/                 # useIsMobile, useCategories, useDebouncedSearch
├── lib/
│   ├── utils.ts           # cn(), calculateReadingTime()
│   ├── metadata.ts        # generateMetadata(), structured data helpers
│   ├── json-ld.ts         # JsonLd component for schema.org
│   ├── fonts.ts           # Fredoka font (Hebrew subset)
│   └── analytics.ts       # GA event tracking
├── utils/
│   └── fetchApi.ts        # Centralized Strapi fetch with auth + revalidation
└── types.ts               # All TypeScript type definitions
```

### ISR & Caching Strategy
| Content | Revalidation |
|---------|-------------|
| Homepage | 14 days |
| Static pages | 7 days |
| Playlists/Videos | 7 days |
| Blogs | No cache (real-time view counts) |
| Responsa | 60 seconds (fresh comments) |
| Writings | 30 days |
| Terms | 24 days |
| Categories | 24 hours |
| Webhook | `/api/revalidate` for targeted invalidation |

### Key Patterns
- **Server Components** for data fetching, **Client Components** for interactivity
- **Server Actions** (`"use server"`) with Zod validation for all forms
- **Structured Data**: Organization, WebSite, Article, VideoObject, QAPage, BreadcrumbList
- **SEO**: Dynamic metadata, OG images, comprehensive sitemap
- **Analytics**: Google Analytics + GTM + Vercel Analytics + Speed Insights
- **Path alias**: `@/*` maps to `./src/*`

## Backend Architecture

### Directory Structure
```
server/src/
├── api/
│   └── [content-type]/
│       ├── content-types/[name]/schema.json
│       ├── controllers/[name].ts
│       ├── routes/[name].ts          # Default + custom routes
│       └── services/[name].ts
├── components/            # Reusable Strapi components (layout, blocks, elements)
├── services/
│   └── resend-audience.ts # Resend audience management
└── index.ts               # Bootstrap
```

### Custom Controllers
- **Blog/Video/Responsa/Writing/Term**: `updateViewCount` — `POST /:id/view` (no auth)
- **Responsa**: Custom `create` — sends confirmation email to questioneer
- **Comment**: Custom `create` — finds parent responsa/blog by slug, sends email notification, generates slug
- **Thread**: Custom `create` — nested reply to comment
- **Contact Email**: `sendContactEmail` — `POST /contact-email/send` (public, validates fields, sends via Resend)
- **Search**: `GET /search` — multi-content-type search with relevance scoring

### Comment Lifecycle Hook
`server/src/api/comment/content-types/comment/lifecycles.ts` — auto-categorizes responsa via Gemini AI when שלום צדיק adds a comment (see PR #11).

### Email Service
- Provider: Resend (`strapi-provider-email-resend-strapi`)
- Templates: welcomeNewsletter, questionResponse, questionConfirmation, blogComment
- All templates are RTL Hebrew with styled HTML

### Search Service
- Searches across: blog, video, playlist, responsa, writing, term
- Relevance scoring: exact title (100), title contains (50), description (30), content (10)
- Filters by published status, excludes orphan videos
- Category filtering with AND logic

### Scripts (`server/scripts/`)
| Script | Purpose |
|--------|---------|
| `analyze-responsas.ts` | AI categorization of Q&A (uses first comment as context) |
| `analyze-blogs.ts` | AI categorization of blog posts |
| `analyze-videos.ts` | AI analysis of YouTube videos |
| `analyze-writings.ts` | AI categorization of writings |
| `analyze-terms.ts` | AI categorization of glossary terms |
| `youtube-populate.ts` | Import playlists & videos from YouTube API |
| `import-view-counts.ts` | CSV import of view counts |
| `send-broadcast.ts` | Monthly newsletter (5 most recent per content type) |
| `send-event-broadcast.ts` | Event-specific broadcast |
| `sync-audience.ts` | Sync newsletter audience with Resend |

All scripts support `DELAY_MS` (rate limiting) and `TEST_MODE` env vars.

### Configuration
| File | Purpose |
|------|---------|
| `config/database.ts` | SQLite (default), MySQL, PostgreSQL support |
| `config/plugins.ts` | SEO plugin + Resend email provider |
| `config/server.ts` | Host 0.0.0.0, port 1337 |
| `config/api.ts` | Default limit 25, max 100, withCount |
| `config/middlewares.ts` | Standard Strapi middleware stack |
| `config/admin.ts` | JWT auth, API token salt, encryption key |

## Environment Variables

### Frontend (`client/.env`)
```
NEXT_PUBLIC_STRAPI_BASE_URL=http://localhost:1337
NEXT_PUBLIC_STRAPI_API_TOKEN=<token>
NEXT_PUBLIC_SITE_URL=https://religousphilosophy.com/
REVALIDATE_SECRET=<secret>
NEXT_PUBLIC_GA_ID=<ga4-id>        # optional
GTM_ID=<gtm-id>                   # optional
```

### Backend (`server/.env`)
```
# Strapi core
APP_KEYS=<keys>
ADMIN_JWT_SECRET=<secret>
API_TOKEN_SALT=<salt>
TRANSFER_TOKEN_SALT=<salt>
ENCRYPTION_KEY=<key>

# Database
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Email (Resend)
RESEND_API_KEY=<key>
RESEND_DEFAULT_FROM_EMAIL=<email>
RESEND_DEFAULT_REPLY_TO_EMAIL=<email>
RESEND_DEFAULT_AUDIENCE_ID=<id>

# Frontend URL (for email links)
FRONTEND_URL=https://religousphilosophy.com/

# Scripts
STRAPI_BASE_URL=http://localhost:1337
YOUTUBE_API_KEY=<key>              # for youtube-populate script
YOUTUBE_CHANNEL_ID=<id>

# Auto-categorization (Gemini AI)
GEMINI_API_KEY=<key>
GEMINI_MODEL=gemini-2.5-flash
```

## Hebrew/RTL

- HTML: `lang="hebrew"`, `dir="rtl"`
- Font: Fredoka (Google Fonts, Hebrew subset, weights 300–700)
- All email templates are RTL styled
- Category types have Hebrew labels: מושג (term), אדם (person), ז׳אנר (genre)
- Reading time calculation uses 200 wpm (Hebrew reading speed)
- Slug generation handles Hebrew characters (falls back to timestamp prefix)

## Deployment

- **Frontend**: Vercel — auto-deploys on push to `main`
- **Backend**: Strapi Cloud (`.strapi-cloud.json`)
- **No CI/CD pipelines** — no GitHub Actions configured
- **No Docker** — neither project is containerized

## Development Conventions

- Use `pnpm` exclusively
- PascalCase for components, camelCase for utilities
- Default exports for components, named exports for utilities
- Use `import type` for type-only imports
- Follow existing file structure when adding new content types or components
- All public API endpoints use `auth: false` in route config
- View count endpoints are `POST` with no request body
- Comments and threads use slug-based linking (not IDs)
