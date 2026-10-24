import { NextResponse, type NextRequest } from 'next/server';
import { createRateLimiters, guardRequest, proxyGuard } from '../_guards';
import { TURN_ID_RE, bridgeConfig, bridgeFetch, failureResponse, notConfigured } from '../_bridge';
import { resolveUser } from '../_identity';

const rateLimited = createRateLimiters(60, 30);

/** POST {turn_id, value} → bridge POST /feedback {user, turn_id, value}; the bridge checks the turn belongs to `user`. */
export async function POST(request: NextRequest) {
  const misconfigured = proxyGuard();
  if (misconfigured) return misconfigured;
  const { session, rejection } = guardRequest(request, rateLimited, { requireSession: true });
  if (rejection) return rejection;

  const config = bridgeConfig();
  if (!config) return notConfigured();

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

  const user = await resolveUser(session);
  let upstream: Response;
  try {
    upstream = await bridgeFetch(config, '/feedback', { method: 'POST', body: { user, turn_id, value } }, request.signal);
  } catch (err) {
    return failureResponse(err);
  }
  if (upstream.status === 404) return NextResponse.json({ error: 'unknown turn' }, { status: 404 });
  if (!upstream.ok) return NextResponse.json({ error: 'bridge error' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
