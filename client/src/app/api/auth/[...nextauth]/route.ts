import { NextResponse, type NextRequest } from 'next/server';
import { handlers } from '@/auth';
import { authConfigured } from '@/app/api/sadik-chat/_identity';

/**
 * Auth.js endpoints. 404 when Google sign-in is not configured. With AUTH_URL set, every other hostname (e.g. a
 * per-commit preview URL) is redirected to it, so the OAuth flow and its cookies live on the one registered origin.
 * That redirect is for top-level navigations only: a cross-origin fetch would fail CORS, so the browser asks
 * GET /api/auth/canonical-origin (answered on any host, never redirected) and navigates there before it starts sign-in.
 */
function gate(request: NextRequest): NextResponse | null {
  if (!authConfigured()) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (request.method === 'GET' && request.nextUrl.pathname === '/api/auth/canonical-origin') {
    const origin = process.env.AUTH_URL ? new URL(process.env.AUTH_URL).origin : null;
    return NextResponse.json({ origin }, { headers: { 'Cache-Control': 'no-store' } });
  }
  const authUrl = process.env.AUTH_URL;
  if (authUrl) {
    const canonical = new URL(authUrl);
    const host = request.headers.get('host');
    if (host && host !== canonical.host) {
      return NextResponse.redirect(new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, canonical.origin), 307);
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  return gate(request) ?? handlers.GET(request);
}

export async function POST(request: NextRequest) {
  return gate(request) ?? handlers.POST(request);
}
