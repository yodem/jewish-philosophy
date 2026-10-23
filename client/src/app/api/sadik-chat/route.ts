import { NextResponse, type NextRequest } from 'next/server';
import { createRateLimiters, guardRequest, proxyGuard, withSessionCookie } from './_guards';
import { BridgeTimeoutError, fetchBridgeStream } from './_deadline';

const MAX_MESSAGE = 2000;

const rateLimited = createRateLimiters(10, 10);

export async function POST(request: NextRequest) {
  const misconfigured = proxyGuard();
  if (misconfigured) return misconfigured;
  const { session, rejection } = guardRequest(request, rateLimited);
  if (rejection) return rejection;
  // Every response below carries the session cookie, success or failure.
  const reply = <T extends Response>(res: T): T => withSessionCookie(res, request, session);

  const bridgeUrl = process.env.SADIK_BRIDGE_URL;
  const token = process.env.SADIK_BRIDGE_TOKEN;
  if (!bridgeUrl || !token) {
    return reply(NextResponse.json({ error: 'sadik chat is not configured' }, { status: 503 }));
  }

  let message: unknown;
  try {
    ({ message } = await request.json());
  } catch {
    return reply(NextResponse.json({ error: 'invalid JSON' }, { status: 400 }));
  }
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE) {
    return reply(NextResponse.json({ error: 'invalid message' }, { status: 400 }));
  }

  let upstream: Response;
  let stream: ReadableStream<Uint8Array> | null;
  try {
    ({ response: upstream, body: stream } = await fetchBridgeStream(
      new URL('/chat', bridgeUrl),
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ session: session.id, message }),
        cache: 'no-store',
      },
      request.signal,
    ));
  } catch (err) {
    if (err instanceof BridgeTimeoutError) return reply(NextResponse.json({ error: 'bridge timed out' }, { status: 504 }));
    return reply(NextResponse.json({ error: 'bridge unreachable' }, { status: 502 }));
  }

  if (!stream) {
    return reply(NextResponse.json({ error: 'bridge error' }, { status: upstream.status === 429 ? 429 : 502 }));
  }

  const headers = new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  return reply(new Response(stream, { status: 200, headers }));
}
