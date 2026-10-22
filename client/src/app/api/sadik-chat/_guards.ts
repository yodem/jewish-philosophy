import { NextResponse, type NextRequest } from 'next/server';

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || 'local';
}

// In-memory and per-instance: a cheap guard against cookie-dropping floods, not a global quota.
// Each route makes its own limiter so feedback votes never eat the chat budget.
export function createRateLimiter() {
  const hits = new Map<string, number[]>();
  return (ip: string): boolean => {
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
  };
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

/** Same-origin, JSON content-type and per-IP guards; returns the rejection response, or null to proceed. */
export function guardRequest(request: NextRequest, rateLimited: (ip: string) => boolean): NextResponse | null {
  if (crossOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return NextResponse.json({ error: 'content type must be application/json' }, { status: 415 });
  }
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }
  return null;
}
