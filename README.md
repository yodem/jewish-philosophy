# Jewish Philosophy Platform

A full-stack content platform dedicated to Jewish philosophy, featuring Hebrew/RTL support and modern web technologies.

## 🌟 Project Overview

This platform provides educational content on Jewish philosophy, including articles, videos, terms, and responsa. The project consists of a Next.js frontend with a Strapi CMS backend, designed to handle both Hebrew and English content with proper RTL support.

## 🏗️ Architecture

```
jewish-philosophy/
├── client/          # Next.js 15.4.4 Frontend (App Router)
├── server/          # Strapi v5.17.0 CMS Backend
└── README.md
```

## 🚀 Technology Stack

### Frontend (`/client`)
- **Framework**: Next.js 15.4.4 with App Router
- **React**: v19.0.0 with latest features
- **Styling**: Tailwind CSS v4 (PostCSS setup, no config file)
- **UI Components**: Radix UI primitives + custom components
- **Icons**: Lucide React
- **TypeScript**: Strict mode with bundler module resolution
- **Build Tool**: Turbopack for development
- **Analytics**: Vercel Analytics

### Backend (`/server`)
- **CMS**: Strapi 5.17.0
- **Database**: SQLite with better-sqlite3
- **Email**: Resend provider
- **Node.js**: 18.0.0 - 22.x.x supported
- **TypeScript**: CommonJS modules

## 📋 Content Types

The platform manages several content types:

- **Blog Posts** - Articles and essays on Jewish philosophy
- **Videos** - YouTube video content with metadata
- **Playlists** - Collections of related videos
- **Responsa** - Q&A religious content
- **Writings** - Books and longer-form content
- **Terms** - Philosophical concepts and definitions
- **Authors** - Content creators and philosophers
- **Categories** - Content organization system

## 🛠️ Development Setup

### Prerequisites

- Node.js (18.0.0 - 22.x.x)
- pnpm (required - do not use npm or yarn)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jewish-philosophy
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd client
   pnpm install
   
   # Install backend dependencies
   cd ../server
   pnpm install
   ```

3. **Environment Setup**
   
   **Frontend** (`client/.env.local`):
   ```env
   NEXT_PUBLIC_STRAPI_BASE_URL=http://localhost:1337
   # Add other environment variables as needed
   ```
   
   **Backend** (`server/.env`):
   ```env
   # Database
   DATABASE_CLIENT=sqlite
   DATABASE_FILENAME=.tmp/data.db
   
   # Strapi
   HOST=0.0.0.0
   PORT=1337
   
   # Security Keys (generate new ones)
   APP_KEYS=["myKeyA","myKeyB"]
   JWT_SECRET="mySecret"
   ADMIN_JWT_SECRET=tobemodified
   API_TOKEN_SALT=tobemodified
   TRANSFER_TOKEN_SALT=tobemodified
   ENCRYPTION_KEY=tobemodified
   
   # Email Configuration (add your keys)
   RESEND_API_KEY=your_resend_api_key
   RESEND_DEFAULT_FROM_EMAIL=your_email@domain.com
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start Development Servers**
   
   **Backend (Terminal 1)**:
   ```bash
   cd server
   pnpm develop
   ```
   
   **Frontend (Terminal 2)**:
   ```bash
   cd client
   pnpm dev
   ```

5. **Access the Applications**
   - Frontend: http://localhost:3000
   - Strapi Admin: http://localhost:1337/admin

## 📝 Development Commands

### Frontend Commands
```bash
cd client

pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### Backend Commands
```bash
cd server

pnpm develop      # Start Strapi in development mode
pnpm build        # Build Strapi
pnpm start        # Start Strapi in production mode
pnpm strapi       # Run Strapi CLI commands
```

## 🌐 Deployment

### Frontend (Vercel)
The frontend is deployed on Vercel with automatic deployments from the main branch.

**Environment Variables for Production:**
- `NEXT_PUBLIC_STRAPI_BASE_URL` - Your production Strapi URL

### Backend (Strapi Cloud)
The backend is deployed on Strapi Cloud.

**Required Environment Variables:**
- Database configuration
- Security keys (generate new ones for production)
- Email service credentials
- Frontend URL for CORS

## 🎨 Styling Guidelines

- **Tailwind CSS v4**: No config file needed, uses PostCSS setup
- **RTL Support**: Built-in for Hebrew content
- **Component Variants**: Use `class-variance-authority` (cva)
- **Conditional Classes**: Use `tailwind-merge` + `clsx` utilities
- **Typography**: Uses `@tailwindcss/typography` for rich content

## 🔒 Security

- All sensitive files are excluded via `.gitignore`
- Environment variables must be properly configured
- API keys should never be committed to version control
- Regular security audits are recommended

## 📁 Key Directories

### Frontend Structure
```
client/src/
├── app/                 # Next.js App Router pages
├── components/         
│   ├── ui/             # Base UI components
│   ├── blocks/         # Content blocks
│   └── [Feature].tsx   # Feature components
├── lib/                # Utilities and helpers
├── hooks/              # Custom React hooks
├── data/               # Data fetching logic
└── types.ts           # Global TypeScript types
```

### Backend Structure
```
server/src/
├── api/                # Strapi content types
├── components/         # Reusable Strapi components
├── extensions/         # Strapi extensions
└── services/          # Custom services
```

## 🌍 Internationalization

The platform primarily supports Hebrew content with English fallbacks:
- **Primary Language**: Hebrew (RTL)
- **Secondary Language**: English (LTR)
- **Typography**: Hebrew font support
- **UI Components**: RTL-compatible design

## 🤝 Contributing

1. Follow the existing code patterns and conventions
2. Use TypeScript with proper typing (avoid `any`)
3. Use pnpm for all package management
4. Follow Tailwind CSS v4 patterns
5. Ensure RTL compatibility for UI components
6. Write meaningful commit messages
7. Test both Hebrew and English content

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

---

**Built with ❤️ for Jewish Philosophy Education**
