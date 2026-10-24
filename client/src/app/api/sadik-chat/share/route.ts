import { NextResponse, type NextRequest } from 'next/server';
import { createRateLimiters, guardRequest, proxyGuard } from '../_guards';
import { SHARE_ID_RE, TURN_ID_RE, bridgeConfig, bridgeFetch, failureResponse, notConfigured } from '../_bridge';
import { resolveUser } from '../_identity';

const rateLimited = createRateLimiters(30, 10);

/**
 * POST {turn_id} → bridge POST /share {turn_id, kind, id} → {id}. The bridge creates the share only when the turn
 * belongs to the caller (a miss and a foreign turn are the same 404). The page lives at /sadik/share/{id}.
 */
export async function POST(request: NextRequest) {
  const misconfigured = proxyGuard();
  if (misconfigured) return misconfigured;
  const { session, rejection } = guardRequest(request, rateLimited, { requireSession: true });
  if (rejection) return rejection;

  const config = bridgeConfig();
  if (!config) return notConfigured();

  let turnId: unknown;
  try {
    ({ turn_id: turnId } = await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (typeof turnId !== 'string' || !TURN_ID_RE.test(turnId)) return NextResponse.json({ error: 'invalid turn' }, { status: 400 });

  const user = await resolveUser(session);
  let upstream: Response;
  try {
    upstream = await bridgeFetch(config, '/share', { method: 'POST', body: { turn_id: turnId, kind: user.kind, id: user.id } }, request.signal);
  } catch (err) {
    return failureResponse(err);
  }
  if (upstream.status === 404) return NextResponse.json({ error: 'unknown turn' }, { status: 404 });
  if (!upstream.ok) return NextResponse.json({ error: 'bridge error' }, { status: 502 });
  let shareId: unknown;
  try {
    ({ share_id: shareId } = await upstream.json());
  } catch {
    return NextResponse.json({ error: 'bridge error' }, { status: 502 });
  }
  if (typeof shareId !== 'string' || !SHARE_ID_RE.test(shareId)) return NextResponse.json({ error: 'bridge error' }, { status: 502 });
  return NextResponse.json({ id: shareId });
}
