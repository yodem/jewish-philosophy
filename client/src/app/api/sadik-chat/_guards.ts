import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

const RATE_WINDOW_MS = 60_000;
const SESSION_RE = /^[0-9a-f]{32}$/;

/**
 * Forwarding headers are client-controlled unless a trusted proxy overwrites them,
 * so they are honoured only when SADIK_TRUST_PROXY=1 (set it only behind a trusted
 * proxy such as Vercel; the first hop is then the client). Otherwise every request
 * shares the single "direct" bucket.
 */
export function clientIp(headers: Headers, trustProxy = process.env.SADIK_TRUST_PROXY === '1'): string {
  if (!trustProxy) return 'direct';
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || 'direct';
}

/**
 * A production deploy without SADIK_TRUST_PROXY=1 would put every visitor in the one "direct" IP bucket.
 * Set SADIK_TRUST_PROXY=1 on Vercel (its edge overwrites x-forwarded-for); elsewhere only behind a proxy you control.
 */
export function proxyMisconfigured(env: Record<string, string | undefined> = process.env): boolean {
  return env.NODE_ENV === 'production' && env.SADIK_TRUST_PROXY !== '1';
}

let proxyWarned = false;

/** The 503 response when the proxy is not configured for production (logs once), else null. */
export function proxyGuard(env: Record<string, string | undefined> = process.env): NextResponse | null {
  if (!proxyMisconfigured(env)) return null;
  if (!proxyWarned) {
    proxyWarned = true;
    console.error('sadik-chat disabled: NODE_ENV=production requires SADIK_TRUST_PROXY=1 (behind a trusted proxy such as Vercel)');
  }
  return NextResponse.json({ error: 'proxy not configured' }, { status: 503 });
}

const COOKIE = 'sadik_session';

/** The visitor's session: the valid sadik_session cookie, else a freshly minted id (fresh = true). */
export function resolveSession(request: NextRequest): { id: string; fresh: boolean } {
  const value = request.cookies.get(COOKIE)?.value;
  if (value && SESSION_RE.test(value)) return { id: value, fresh: false };
  return { id: randomBytes(16).toString('hex'), fresh: true };
}

/** Set-Cookie on a response, so rejected requests still give a real browser its own session. */
export function withSessionCookie<T extends Response>(response: T, request: NextRequest, session: { id: string; fresh: boolean }): T {
  if (!session.fresh) return response;
  const secure = (request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')) === 'https';
  const parts = [`${COOKIE}=${session.id}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${60 * 60 * 24 * 30}`];
  if (secure) parts.push('Secure');
  response.headers.append('Set-Cookie', parts.join('; '));
  return response;
}

function createWindowLimiter(limit: number) {
  const hits = new Map<string, number[]>();
  return (key: string): boolean => {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return true;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [k, times] of hits) {
        if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
      }
    }
    return false;
  };
}

export interface RateLimiters {
  ip: (ip: string) => boolean;
  session: (session: string) => boolean;
}

// In-memory and per-instance: a cheap guard, not a global quota.
// Each route makes its own limiters so feedback votes never eat the chat budget.
export function createRateLimiters(ipLimit: number, sessionLimit: number): RateLimiters {
  return { ip: createWindowLimiter(ipLimit), session: createWindowLimiter(sessionLimit) };
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

export interface GuardResult {
  session: { id: string; fresh: boolean };
  /** The rejection response (already carrying the session cookie when one was minted), or null to proceed. */
  rejection: NextResponse | null;
}

/**
 * Same-origin, JSON content-type, session and per-IP / per-session guards.
 * The session is minted before the limiters run, so every visitor has their own session
 * bucket; the per-IP limiter is the backstop against clients that drop cookies.
 * With requireSession, a request without a valid session cookie is 403 (feedback only follows a chat turn).
 */
export function guardRequest(request: NextRequest, limiters: RateLimiters, opts: { requireSession?: boolean } = {}): GuardResult {
  const session = resolveSession(request);
  const reject = (body: object, status: number) => ({
    session,
    rejection: withSessionCookie(NextResponse.json(body, { status }), request, session),
  });
  if (crossOrigin(request)) return reject({ error: 'forbidden' }, 403);
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return reject({ error: 'content type must be application/json' }, 415);
  }
  if (opts.requireSession && session.fresh) return reject({ error: 'no session' }, 403);
  // Evaluate both so each request is counted against both buckets.
  const ipLimited = limiters.ip(clientIp(request.headers));
  const sessionLimited = limiters.session(session.id);
  if (ipLimited || sessionLimited) return reject({ error: 'too many requests' }, 429);
  return { session, rejection: null };
}
