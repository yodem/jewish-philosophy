import { NextResponse, type NextRequest } from 'next/server';
import { createRateLimiters, guardRequest, proxyGuard, withSessionCookie } from '../_guards';
import { bridgeConfig, bridgeFetch, failureResponse, notConfigured } from '../_bridge';
import { googleUserId } from '../_identity';

const rateLimited = createRateLimiters(60, 60);

/**
 * Shared front half of the history routes: same guards as every chat POST, then the signed-in Google user resolved
 * from the Auth.js cookie in this handler (never only in middleware). Anonymous visitors keep history in their
 * browser and get 401 here.
 */
export async function historyRequest(
  request: NextRequest,
): Promise<{ rejection: Response } | { rejection: null; body: Record<string, unknown>; uid: string; reply: <T extends Response>(r: T) => T }> {
  const misconfigured = proxyGuard();
  if (misconfigured) return { rejection: misconfigured };
  const { session, rejection } = guardRequest(request, rateLimited);
  if (rejection) return { rejection };
  const reply = <T extends Response>(r: T): T => withSessionCookie(r, request, session);
  const uid = await googleUserId(request);
  if (!uid) return { rejection: reply(NextResponse.json({ error: 'sign in required' }, { status: 401 })) };
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { rejection: reply(NextResponse.json({ error: 'invalid JSON' }, { status: 400 })) };
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { rejection: reply(NextResponse.json({ error: 'invalid body' }, { status: 400 })) };
  return { rejection: null, body: body as Record<string, unknown>, uid, reply };
}

/** POST to the bridge with the server-resolved user; 404 stays 404 (unknown and foreign look the same). */
export async function forwardHistory(path: string, payload: unknown, reply: <T extends Response>(r: T) => T, signal: AbortSignal): Promise<Response> {
  const config = bridgeConfig();
  if (!config) return reply(notConfigured());
  let upstream: Response;
  try {
    upstream = await bridgeFetch(config, path, { method: 'POST', body: payload }, signal);
  } catch (err) {
    return reply(failureResponse(err));
  }
  if (upstream.status === 404) return reply(NextResponse.json({ error: 'not found' }, { status: 404 }));
  if (!upstream.ok) return reply(NextResponse.json({ error: 'bridge error' }, { status: 502 }));
  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    return reply(NextResponse.json({ error: 'bridge error' }, { status: 502 }));
  }
  return reply(NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } }));
}
