import { NextResponse, type NextRequest } from 'next/server';
import { createRateLimiter, guardRequest } from '../_guards';

const TURN_ID_RE = /^[\w.:-]{1,128}$/;
const rateLimited = createRateLimiter();

export async function POST(request: NextRequest) {
  const rejected = guardRequest(request, rateLimited);
  if (rejected) return rejected;

  const bridgeUrl = process.env.SADIK_BRIDGE_URL;
  const token = process.env.SADIK_BRIDGE_TOKEN;
  if (!bridgeUrl || !token) {
    return NextResponse.json({ error: 'sadik chat is not configured' }, { status: 503 });
  }

  let body: { turn_id?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  const { turn_id, value } = body ?? {};
  if (typeof turn_id !== 'string' || !TURN_ID_RE.test(turn_id) || (value !== 'up' && value !== 'down')) {
    return NextResponse.json({ error: 'invalid feedback' }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(new URL('/feedback', bridgeUrl), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ turn_id, value }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ error: 'bridge unreachable' }, { status: 502 });
  }
  if (upstream.status === 404) return NextResponse.json({ error: 'unknown turn' }, { status: 404 });
  if (!upstream.ok) return NextResponse.json({ error: 'bridge error' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
