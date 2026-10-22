import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'sadik_session';
const SESSION_RE = /^[0-9a-f]{32}$/;
const MAX_MESSAGE = 2000;

function sessionCookie(id: string, secure: boolean): string {
  const parts = [`${COOKIE}=${id}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${60 * 60 * 24 * 30}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'local';
}

// In-memory and per-instance: a cheap guard against cookie-dropping floods, not a global quota.
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

function crossOrigin(request: NextRequest): boolean {
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return true;
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin) {
    try {
      if (new URL(origin).host !== host) return true;
    } catch {
      return true;
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  if (crossOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'content type must be application/json' }, { status: 415 });
  }
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  const bridgeUrl = process.env.SADIK_BRIDGE_URL;
  const token = process.env.SADIK_BRIDGE_TOKEN;
  if (!bridgeUrl || !token) {
    return NextResponse.json({ error: 'sadik chat is not configured' }, { status: 503 });
  }

  let message: unknown;
  try {
    ({ message } = await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'invalid message' }, { status: 400 });
  }

  const existing = request.cookies.get(COOKIE)?.value;
  const session = existing && SESSION_RE.test(existing) ? existing : randomBytes(16).toString('hex');

  let upstream: Response;
  try {
    upstream = await fetch(new URL('/chat', bridgeUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ session, message }),
      signal: request.signal,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'bridge unreachable' }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: 'bridge error' }, { status: upstream.status === 429 ? 429 : 502 });
  }

  const headers = new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  headers.append('Set-Cookie', sessionCookie(session, (request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')) === 'https'));
  return new Response(upstream.body, { status: 200, headers });
}
