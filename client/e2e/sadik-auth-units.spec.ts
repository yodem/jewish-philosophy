import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { NextRequest } from 'next/server';
import { encode } from 'next-auth/jwt';
import { safeRedirect, userIdFromSub } from '../src/lib/auth-utils';
import { authState, googleUserId, resolveUser } from '../src/app/api/sadik-chat/_identity';
import { POST as chatPost } from '../src/app/api/sadik-chat/route';
import { POST as historyPost } from '../src/app/api/sadik-chat/history/route';
import { POST as conversationPost } from '../src/app/api/sadik-chat/history/conversation/route';
import { secureAuthCookies } from '../src/app/api/sadik-chat/_identity';

/**
 * The signed-in identity and the history routes, checked in Node with throwaway secrets. (Auth.js's own handlers
 * import `next/server` the bundler way, so the sign-in flow itself is tested against a running server in
 * sadik-auth.spec.ts.)
 */

const SECRET = 'e2e-auth-secret-0123456789abcdef0123456789abcdef';
const COOKIE = 'authjs.session-token';
const UID = userIdFromSub('google-sub-123');
const sid = 'ab'.repeat(16);
const saved: Record<string, string | undefined> = {};
const ENV = {
  AUTH_SECRET: SECRET,
  AUTH_GOOGLE_ID: 'e2e-client-id.apps.googleusercontent.com',
  AUTH_GOOGLE_SECRET: 'e2e-client-secret',
  AUTH_URL: undefined as string | undefined,
  VERCEL: undefined as string | undefined,
  SADIK_TRUST_PROXY: '1',
};

test.beforeAll(() => {
  for (const [k, v] of Object.entries(ENV)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});
test.afterAll(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

async function sessionCookie(claims: Record<string, unknown>, opts: { secret?: string; maxAge?: number } = {}) {
  const token = await encode({ token: claims, secret: opts.secret ?? SECRET, salt: COOKIE, maxAge: opts.maxAge ?? 3600 });
  return `${COOKIE}=${token}`;
}

const post = (path: string, body: unknown, cookie: string, headers: Record<string, string> = {}) =>
  new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', cookie, ...headers },
    body: JSON.stringify(body),
  });

test.describe('Auth.js configuration (M3)', () => {
  test('redirects accept same-origin relative paths only', () => {
    const base = 'https://alias.vercel.app';
    expect(safeRedirect('/responsa?x=1', base)).toBe('https://alias.vercel.app/responsa?x=1');
    expect(safeRedirect('https://alias.vercel.app/blog', base)).toBe('https://alias.vercel.app/blog');
    for (const evil of ['https://evil.example', '//evil.example', '/\\evil.example', 'https://alias.vercel.app.evil.example/x', 'javascript:alert(1)']) {
      expect(safeRedirect(evil, base), evil).toBe(base);
    }
  });

  test('the identity is sha256(sub), never the email', () => {
    expect(UID).toMatch(/^[0-9a-f]{64}$/);
    expect(UID).not.toContain('google-sub-123');
  });

  test('Auth.js cookies are secure on Vercel and with an https AUTH_URL', () => {
    expect(secureAuthCookies({})).toBe(false);
    expect(secureAuthCookies({ VERCEL: '1' })).toBe(true);
    expect(secureAuthCookies({ AUTH_URL: 'https://alias.vercel.app' })).toBe(true);
  });
});

test.describe('signed-in identity', () => {
  test('a valid session cookie yields the google user; tampered, expired, foreign-secret and bearer tokens do not', async () => {
    const good = await sessionCookie({ uid: UID });
    const req = (cookie: string, headers: Record<string, string> = {}) => new NextRequest('http://localhost/x', { headers: { cookie, ...headers } });
    expect(await googleUserId(req(good))).toBe(UID);
    expect(await resolveUser(req(good), { id: sid })).toEqual({ kind: 'google', id: UID });
    expect(await authState(req(good))).toBe('signed_in');
    expect(await googleUserId(req(`${good.slice(0, -4)}AAAA`))).toBeNull();
    expect(await googleUserId(req(await sessionCookie({ uid: UID }, { maxAge: -60 })))).toBeNull();
    expect(await googleUserId(req(await sessionCookie({ uid: UID }, { secret: 'another-secret-0123456789abcdef0123' })))).toBeNull();
    expect(await googleUserId(req(await sessionCookie({ uid: 'not-a-hash' })))).toBeNull();
    const bearer = good.split('=')[1];
    expect(await googleUserId(req('', { authorization: `Bearer ${bearer}` }))).toBeNull();
    expect(await resolveUser(req(''), { id: sid })).toEqual({ kind: 'anon', id: sid });
    expect(await authState(req(''))).toBe('signed_out');
  });

  test('without AUTH_* the state is disabled and nobody is a google user', async () => {
    const secret = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    try {
      const req = new NextRequest('http://localhost/x', { headers: { cookie: await sessionCookie({ uid: UID }) } });
      expect(await authState(req)).toBe('disabled');
      expect(await googleUserId(req)).toBeNull();
    } finally {
      process.env.AUTH_SECRET = secret;
    }
  });
});

test.describe('history routes and the chat route for a signed-in user (M1, S02)', () => {
  let bridge: Server;
  let seen: { path?: string; body?: unknown } = {};
  let reply: { status: number; body: string; type?: string } = { status: 200, body: '[]' };
  const prev = { u: process.env.SADIK_BRIDGE_URL, t: process.env.SADIK_BRIDGE_TOKEN };

  test.beforeAll(async () => {
    bridge = createServer((req, res) => {
      let data = '';
      req.on('data', (c) => (data += c));
      req.on('end', () => {
        seen = { path: req.url, body: data ? JSON.parse(data) : null };
        res.writeHead(reply.status, { 'Content-Type': reply.type ?? 'application/json' }).end(reply.body);
      });
    });
    await new Promise<void>((r) => bridge.listen(0, '127.0.0.1', r));
    process.env.SADIK_BRIDGE_URL = `http://127.0.0.1:${(bridge.address() as AddressInfo).port}`;
    process.env.SADIK_BRIDGE_TOKEN = 'test-token';
  });
  test.afterAll(async () => {
    await new Promise((r) => bridge.close(r));
    for (const [k, v] of [['SADIK_BRIDGE_URL', prev.u], ['SADIK_BRIDGE_TOKEN', prev.t]] as const) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  test('anonymous callers get 401 from both history routes and the bridge is not called', async () => {
    seen = {};
    const anon = `sadik_session=${sid}`;
    expect((await historyPost(post('/api/sadik-chat/history', {}, anon))).status).toBe(401);
    expect((await conversationPost(post('/api/sadik-chat/history/conversation', { conversation_id: 'a'.repeat(32) }, anon))).status).toBe(401);
    expect(seen.path).toBeUndefined();
  });

  test('the list and one conversation go to the bridge with the server-resolved google user only', async () => {
    const cookie = `${await sessionCookie({ uid: UID })}; sadik_session=${sid}`;
    reply = { status: 200, body: JSON.stringify([{ conversation_id: 'a'.repeat(32), title: 't', last_ts: 'x', n_turns: 1 }]) };
    const list = await historyPost(post('/api/sadik-chat/history', { user: { kind: 'google', id: 'f'.repeat(64) } }, cookie));
    expect(list.status).toBe(200);
    expect(seen).toEqual({ path: '/history/conversations', body: { user: { kind: 'google', id: UID } } });
    expect(await list.json()).toHaveLength(1);
    reply = { status: 404, body: JSON.stringify({ detail: 'not found' }) };
    const foreign = await conversationPost(post('/api/sadik-chat/history/conversation', { conversation_id: 'b'.repeat(32) }, cookie));
    expect(foreign.status).toBe(404);
    expect(seen.body).toEqual({ user: { kind: 'google', id: UID }, conversation_id: 'b'.repeat(32) });
    for (const bad of ['x', { $ne: '' }, 'B'.repeat(32)]) {
      expect((await conversationPost(post('/api/sadik-chat/history/conversation', { conversation_id: bad }, cookie))).status).toBe(400);
    }
  });

  test('history routes keep the same-origin and JSON guards', async () => {
    const cookie = await sessionCookie({ uid: UID });
    expect((await historyPost(post('/api/sadik-chat/history', {}, cookie, { 'sec-fetch-site': 'cross-site' }))).status).toBe(403);
    const bare = new NextRequest('http://localhost/api/sadik-chat/history', { method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: '{}' });
    expect((await historyPost(bare)).status).toBe(403);
    expect((await historyPost(post('/api/sadik-chat/history', {}, cookie, { 'content-type': 'text/plain' }))).status).toBe(415);
  });

  test('a signed-in chat turn is sent as the google user', async () => {
    reply = { status: 200, type: 'text/event-stream', body: 'event: final\ndata: {}\n\n' };
    const cookie = `${await sessionCookie({ uid: UID })}; sadik_session=${sid}`;
    const res = await chatPost(post('/api/sadik-chat', { message: 'שאלה', conversation_id: 'c'.repeat(32) }, cookie));
    await res.text();
    expect(seen.body).toEqual({ user: { kind: 'google', id: UID }, conversation_id: 'c'.repeat(32), message: 'שאלה' });
  });
});
