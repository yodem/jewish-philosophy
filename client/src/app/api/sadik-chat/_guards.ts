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

/** The sadik_session cookie when well formed, else one shared "no-session" bucket. */
export function sessionKey(request: NextRequest): string {
  const value = request.cookies.get('sadik_session')?.value;
  return value && SESSION_RE.test(value) ? value : 'no-session';
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

/** Same-origin, JSON content-type and per-IP and per-session guards; returns the rejection response, or null to proceed. */
export function guardRequest(request: NextRequest, limiters: RateLimiters): NextResponse | null {
  if (crossOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'content type must be application/json' }, { status: 415 });
  }
  // Evaluate both so each request is counted against both buckets.
  const ipLimited = limiters.ip(clientIp(request.headers));
  const sessionLimited = limiters.session(sessionKey(request));
  if (ipLimited || sessionLimited) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }
  return null;
}
