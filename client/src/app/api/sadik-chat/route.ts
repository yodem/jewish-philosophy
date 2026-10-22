import { randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createRateLimiters, guardRequest } from './_guards';
import { BridgeTimeoutError, fetchBridgeStream } from './_deadline';

const COOKIE = 'sadik_session';
const SESSION_RE = /^[0-9a-f]{32}$/;
const MAX_MESSAGE = 2000;

function sessionCookie(id: string, secure: boolean): string {
  const parts = [`${COOKIE}=${id}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${60 * 60 * 24 * 30}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

const rateLimited = createRateLimiters(10, 10);

export async function POST(request: NextRequest) {
  const rejected = guardRequest(request, rateLimited);
  if (rejected) return rejected;

  const bridgeUrl = process.env.SADIK_BRIDGE_URL;
  const token = process.env.SADIK_BRIDGE_TOKEN;
  if (!bridgeUrl || !token) {
    return NextResponse.json({ error: 'sadik chat is not configured' }, { status: 503 });
  }

  let message: unknown;
  try {
    ({ message } = await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'invalid message' }, { status: 400 });
  }

  const existing = request.cookies.get(COOKIE)?.value;
  const session = existing && SESSION_RE.test(existing) ? existing : randomBytes(16).toString('hex');

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
        body: JSON.stringify({ session, message }),
        cache: 'no-store',
      },
      request.signal,
    ));
  } catch (err) {
    if (err instanceof BridgeTimeoutError) return NextResponse.json({ error: 'bridge timed out' }, { status: 504 });
    return NextResponse.json({ error: 'bridge unreachable' }, { status: 502 });
  }

  if (!stream) {
    return NextResponse.json({ error: 'bridge error' }, { status: upstream.status === 429 ? 429 : 502 });
  }

  const headers = new Headers({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-store, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  headers.append('Set-Cookie', sessionCookie(session, (request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '')) === 'https'));
  return new Response(stream, { status: 200, headers });
}
