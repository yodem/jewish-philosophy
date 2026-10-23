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

/** Hard cap on keys held by each limiter map. */
export const LIMITER_CAPACITY = 10_000;
/** Entries examined for expiry per new key at capacity: bounds eviction work per request. */
const EVICT_SCAN = 8;

export interface WindowLimiter {
  /** Records a hit for the key; true when it is over the limit. */
  check: (key: string) => boolean;
  size: () => number;
  /** Map entries examined by the most recent check (eviction work). */
  lastWork: () => number;
}

/**
 * Sliding-window limiter with a hard key capacity. The Map is kept in last-hit order
 * (a hit re-inserts its key), so the oldest entries come first. A new key at capacity
 * examines at most EVICT_SCAN entries from the front, dropping expired ones, and if none
 * expired drops the oldest, so size never exceeds capacity and work per call is O(1).
 */
export function createWindowLimiter(limit: number, capacity = LIMITER_CAPACITY, windowMs = RATE_WINDOW_MS): WindowLimiter {
  const hits = new Map<string, number[]>();
  let work = 0;
  const evict = (now: number) => {
    let dropped = false;
    let scanned = 0;
    for (const [k, times] of hits) {
      if (scanned++ >= EVICT_SCAN) break;
      work++;
      if (now - times[times.length - 1] >= windowMs) {
        hits.delete(k);
        dropped = true;
      } else {
        break; // last-hit order: everything after is newer, so nothing else is expired
      }
    }
    if (!dropped && hits.size >= capacity) {
      const oldest = hits.keys().next().value;
      if (oldest !== undefined) hits.delete(oldest);
      work++;
    }
  };
  return {
    check(key) {
      work = 0;
      const now = Date.now();
      const existing = hits.get(key);
      if (existing === undefined && hits.size >= capacity) evict(now);
      const recent = (existing ?? []).filter((t) => now - t < windowMs);
      const limited = recent.length >= limit;
      if (!limited) recent.push(now);
      // A counted hit re-inserts the key so the Map stays in last-hit order; a rejected hit leaves its position.
      if (!limited && existing !== undefined) hits.delete(key);
      hits.set(key, recent);
      return limited;
    },
    size: () => hits.size,
    lastWork: () => work,
  };
}

export interface RateLimiters {
  ip: (ip: string) => boolean;
  session: (session: string) => boolean;
  sizes: () => { ip: number; session: number };
}

// In-memory and per-instance: a cheap guard, not a global quota.
// Each route makes its own limiters so feedback votes never eat the chat budget.
export function createRateLimiters(ipLimit: number, sessionLimit: number, capacity = LIMITER_CAPACITY): RateLimiters {
  const ip = createWindowLimiter(ipLimit, capacity);
  const session = createWindowLimiter(sessionLimit, capacity);
  return { ip: ip.check, session: session.check, sizes: () => ({ ip: ip.size(), session: session.size() }) };
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
  // IP first: an IP-rejected request allocates no session bucket.
  if (limiters.ip(clientIp(request.headers))) return reject({ error: 'too many requests' }, 429);
  if (limiters.session(session.id)) return reject({ error: 'too many requests' }, 429);
  return { session, rejection: null };
}
