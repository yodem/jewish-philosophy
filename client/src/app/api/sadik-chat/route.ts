import { NextResponse, type NextRequest } from 'next/server';
import { bridgeClientIp, createRateLimiters, guardRequest, proxyGuard, withSessionCookie } from './_guards';
import { BridgeTimeoutError, fetchBridgeStream } from './_deadline';
import { CONVERSATION_ID_RE, QUOTA_REASON, bridgeConfig } from './_bridge';
import { resolveUser } from './_identity';

const MAX_MESSAGE = 2000;

const rateLimited = createRateLimiters(10, 10);

/**
 * POST {message, conversation_id} → bridge POST /chat {user, conversation_id, message}, streamed back as SSE.
 * `user` comes from the server (Auth.js or the session cookie); the client IP goes in X-Shalom-Client-IP only from
 * a trusted proxy header. A bridge 429 with `reason: anon_daily_quota` is passed on so the UI can ask to sign in.
 */
export async function POST(request: NextRequest) {
  const misconfigured = proxyGuard();
  if (misconfigured) return misconfigured;
  const { session, rejection } = guardRequest(request, rateLimited);
  if (rejection) return rejection;
  // Every response below carries the session cookie, success or failure.
  const reply = <T extends Response>(res: T): T => withSessionCookie(res, request, session);

  const config = bridgeConfig();
  if (!config) return reply(NextResponse.json({ error: 'sadik chat is not configured' }, { status: 503 }));

  let message: unknown;
  let conversationId: unknown;
  try {
    ({ message, conversation_id: conversationId } = await request.json());
  } catch {
    return reply(NextResponse.json({ error: 'invalid JSON' }, { status: 400 }));
  }
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE) {
    return reply(NextResponse.json({ error: 'invalid message' }, { status: 400 }));
  }
  if (typeof conversationId !== 'string' || !CONVERSATION_ID_RE.test(conversationId)) {
    return reply(NextResponse.json({ error: 'invalid conversation' }, { status: 400 }));
  }

  const user = await resolveUser(session);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.token}`,
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  const ip = bridgeClientIp(request.headers);
  if (ip) headers['X-Shalom-Client-IP'] = ip;

  let upstream: Response;
  let stream: ReadableStream<Uint8Array> | null;
  let errorJson: Record<string, unknown> | null | undefined;
  try {
    ({ response: upstream, body: stream, errorJson } = await fetchBridgeStream(
      new URL('/chat', config.url),
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ user, conversation_id: conversationId, message }),
        cache: 'no-store',
        redirect: 'error',
      },
      request.signal,
    ));
  } catch (err) {
    if (err instanceof BridgeTimeoutError) return reply(NextResponse.json({ error: 'bridge timed out' }, { status: 504 }));
    return reply(NextResponse.json({ error: 'bridge unreachable' }, { status: 502 }));
  }

  if (!stream) {
    if (upstream.status === 429 && errorJson?.reason === QUOTA_REASON) {
      return reply(NextResponse.json({ reason: QUOTA_REASON }, { status: 429 }));
    }
    if (upstream.status === 429) return reply(NextResponse.json({ error: 'too many requests' }, { status: 429 }));
    if (upstream.status === 413) return reply(NextResponse.json({ error: 'message too long' }, { status: 413 }));
    if (upstream.status === 503) return reply(NextResponse.json({ error: 'busy' }, { status: 503 }));
    return reply(NextResponse.json({ error: 'bridge error' }, { status: 502 }));
  }

  const out = new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  return reply(new Response(stream, { status: 200, headers: out }));
}
