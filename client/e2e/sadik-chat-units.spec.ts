import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { NextRequest } from 'next/server';
import { POST as feedbackPost } from '../src/app/api/sadik-chat/feedback/route';
import { POST as chatPost } from '../src/app/api/sadik-chat/route';
import { POST as sharePost } from '../src/app/api/sadik-chat/share/route';
import {
  LIMITER_CAPACITY,
  bridgeClientIp,
  clientIp,
  createRateLimiters,
  createWindowLimiter,
  crossOrigin,
  guardRequest,
  proxyGuard,
  resolveSession,
  sessionCookieName,
  withSessionCookie,
} from '../src/app/api/sadik-chat/_guards';
import { bridgeConfig } from '../src/app/api/sadik-chat/_bridge';
import { parseSSE } from '../src/components/sadik-chat/sse';
import {
  parseConversationList,
  parseConversationTurns,
  parseSharedAnswer,
  parseSseEvent,
  parseStoredConversation,
} from '../src/components/sadik-chat/validate';
import { glossLetter } from '../src/components/sadik-chat/format';
import { toJson, toMarkdown } from '../src/components/sadik-chat/export';
import { cleanParams } from '../src/components/sadik-chat/analytics';
import { sanitizeGaUrl } from '../src/lib/ga-location';
import type { BotMessage, ChatMessage, Citation } from '../src/components/sadik-chat/types';
import { FINAL, QUESTION, SHARE_ID } from './fixtures/sadik-answer.mjs';
import { parseAnswer, parseInline } from '../src/components/sadik-chat/markdown';
import { fetchBridgeStream, BridgeTimeoutError } from '../src/app/api/sadik-chat/_deadline';

/** Node-side checks of the Sadik chat helpers and route handlers (no browser, no bridge). */

function cite(n: number, source_type: string, extra: Record<string, unknown> = {}) {
  return { n, chunk_id: `c${n}`, title: `מקור ${source_type}`, url: `https://example.com/${source_type}`, source_type, speaker: 'sadik', quote: null, ...extra };
}

test.describe('rate-limit helpers', () => {
  const h = (xff: string) => new Headers({ 'x-forwarded-for': xff, 'x-real-ip': '9.9.9.9' });

  test('forwarding headers are ignored unless the proxy is trusted', () => {
    expect(clientIp(h('1.2.3.4'), false)).toBe('direct');
    expect(clientIp(h('1.2.3.5'), false)).toBe('direct');
  });

  test('trusted proxy mode uses first hop', () => {
    expect(clientIp(h('1.2.3.4, 10.0.0.1'), true)).toBe('1.2.3.4');
    expect(clientIp(new Headers({ 'x-real-ip': '9.9.9.9' }), true)).toBe('9.9.9.9');
    expect(clientIp(new Headers(), true)).toBe('direct');
  });

  test('session limit applies', () => {
    const { session } = createRateLimiters(1000, 3);
    const a = 'a'.repeat(32);
    expect([1, 2, 3, 4].map(() => session(a))).toEqual([false, false, false, true]);
    expect(session('b'.repeat(32))).toBe(false);
  });

  const req = (cookie?: string, headers: Record<string, string> = {}) =>
    new NextRequest('http://localhost/x', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', ...(cookie ? { cookie } : {}), ...headers },
    });

  test('resolveSession keeps a valid cookie and mints a fresh id otherwise', () => {
    expect(resolveSession(req(`sadik_session=${'c'.repeat(32)}`))).toEqual({ id: 'c'.repeat(32), fresh: false });
    const bad = resolveSession(req('sadik_session=bad'));
    const none = resolveSession(req());
    expect(bad.fresh && none.fresh).toBe(true);
    expect(bad.id).toMatch(/^[0-9a-f]{32}$/);
    expect(bad.id).not.toBe(none.id);
  });

  test('distinct new visitors each get their own session bucket', () => {
    const prev = process.env.SADIK_TRUST_PROXY;
    process.env.SADIK_TRUST_PROXY = '1';
    try {
      const limiters = createRateLimiters(1000, 10);
      const statuses = Array.from({ length: 11 }, (_, i) =>
        guardRequest(req(undefined, { 'x-forwarded-for': `10.9.0.${i}` }), limiters).rejection?.status ?? 200,
      );
      expect(statuses.filter((st) => st === 429)).toEqual([]);
    } finally {
      if (prev === undefined) delete process.env.SADIK_TRUST_PROXY;
      else process.env.SADIK_TRUST_PROXY = prev;
    }
  });

  test('a cookie-dropping client is still stopped by the per-IP limiter', () => {
    const limiters = createRateLimiters(3, 1000);
    const statuses = Array.from({ length: 4 }, () => guardRequest(req(), limiters).rejection?.status ?? 200);
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});

test.describe('parseSSE equivalence across chunkings', () => {
  const streams: Record<string, string> = {
    'CRLF data with LF delimiters': 'event: delta\r\ndata: {"text":"a"}\r\n\nevent: final\r\ndata: {"text":"b"}\r\n\n',
    'pure CRLF': 'event: delta\r\ndata: {"text":"a"}\r\n\r\nevent: final\r\ndata: {"text":"b"}\r\n\r\n',
    'pure LF': 'event: delta\ndata: {"text":"a"}\n\nevent: final\ndata: {"text":"b"}\n\n',
    'lone CR': 'event: delta\rdata: {"text":"a"}\r\revent: final\rdata: {"text":"b"}\r\r',
  };
  const run = (chunks: string[]) => {
    const buf: { rest: string; skipLf?: boolean } = { rest: '' };
    return chunks.flatMap((c) => parseSSE(c, buf));
  };
  for (const [name, stream] of Object.entries(streams)) {
    test(`${name}: whole == every split == one char per chunk`, () => {
      const whole = run([stream]);
      expect(whole).toHaveLength(2);
      for (let i = 0; i <= stream.length; i++) {
        expect(run([stream.slice(0, i), stream.slice(i)]), `split at ${i}`).toEqual(whole);
      }
      expect(run([...stream])).toEqual(whole);
    });
  }

  test('CR, LF, LF delivered separately clears the CR flag', () => {
    const buf: { rest: string; skipLf?: boolean } = { rest: '' };
    const out = ['event: final\r', '\n', 'data: {"text":"x"}\r', '\n', '\n'].flatMap((c) => parseSSE(c, buf));
    expect(out).toEqual([{ event: 'final', data: { text: 'x' } }]);
  });
});

test.describe('rate limiter capacity', () => {
  test('IP-rejected requests allocate no session bucket; 6,001 cookieless requests stay within capacity', () => {
    const limiters = createRateLimiters(10, 1000);
    let rejected = 0;
    for (let i = 0; i < 6001; i++) {
      const r = guardRequest(
        new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' } }),
        limiters,
      );
      if (r.rejection?.status === 429) rejected++;
    }
    expect(rejected).toBe(5991);
    expect(limiters.sizes().session).toBe(10);
    expect(limiters.sizes().session).toBeLessThanOrEqual(LIMITER_CAPACITY);
    expect(limiters.sizes().ip).toBe(1);
  });

  test('size never exceeds capacity and eviction work per call is bounded', () => {
    const cap = 100;
    const lim = createWindowLimiter(5, cap);
    let maxWork = 0;
    for (let i = 0; i < cap * 20; i++) {
      lim.check(`k${i}`);
      maxWork = Math.max(maxWork, lim.lastWork());
      expect(lim.size()).toBeLessThanOrEqual(cap);
    }
    expect(lim.size()).toBe(cap);
    expect(maxWork).toBeLessThanOrEqual(9);
  });

  test('expired entries are evicted first and the limit still applies to live keys', () => {
    const lim = createWindowLimiter(2, 3, 20);
    const t0 = Date.now();
    lim.check('a'); lim.check('b'); lim.check('c');
    while (Date.now() - t0 < 25) { /* wait out the 20 ms window */ }
    lim.check('d');
    expect(lim.size()).toBe(1);
    expect([lim.check('d'), lim.check('d')]).toEqual([false, true]);
  });
});

test.describe('parseSSE', () => {
  test('handles split chunks and CRLF', () => {
    const buf = { rest: '' };
    expect(parseSSE('event: delta\r\ndata: {"te', buf)).toEqual([]);
    const out = parseSSE('xt":"a"}\r\n\r\nevent: final\ndata: {"text":"b"}\n\n', buf);
    expect(out).toEqual([
      { event: 'delta', data: { text: 'a' } },
      { event: 'final', data: { text: 'b' } },
    ]);
    expect(buf.rest).toBe('');
  });
});

test.describe('parseSSE across chunk boundaries', () => {
  const stream = 'event: delta\r\ndata: {"text":"a"}\r\n\r\nevent: final\r\ndata: {"text":"b"}\r\n\r\n';
  const expected = [
    { event: 'delta', data: { text: 'a' } },
    { event: 'final', data: { text: 'b' } },
  ];

  test('CRLF split at every position yields the same events', () => {
    for (let i = 0; i <= stream.length; i++) {
      const buf: { rest: string; skipLf?: boolean } = { rest: '' };
      const out = [...parseSSE(stream.slice(0, i), buf), ...parseSSE(stream.slice(i), buf)];
      expect(out, `split at ${i}`).toEqual(expected);
    }
  });

  test('one character per chunk yields the same events', () => {
    const buf: { rest: string; skipLf?: boolean } = { rest: '' };
    const out = [...stream].flatMap((ch) => parseSSE(ch, buf));
    expect(out).toEqual(expected);
  });

  test('a lone CR is a line ending and LF after a CR chunk is not a second one', () => {
    const buf: { rest: string; skipLf?: boolean } = { rest: '' };
    const out = [
      ...parseSSE('event: final\rdata: {"text":"x"}\r\r', buf),
      ...parseSSE('\nevent: delta\ndata: {"text":"y"}\n\n', buf),
    ];
    expect(out).toEqual([
      { event: 'final', data: { text: 'x' } },
      { event: 'delta', data: { text: 'y' } },
    ]);
  });
});

test.describe('parseSseEvent validation', () => {
  const good = cite(1, 'responsa');
  const final = (over: Record<string, unknown> = {}) => ({
    event: 'final',
    data: { text: 't', citations: [good], abstained: false, ...over },
  });

  test('accepts valid delta, final and error events', () => {
    expect(parseSseEvent({ event: 'delta', data: { text: 'x' } })).toEqual({ kind: 'delta', text: 'x' });
    expect(parseSseEvent({ event: 'error', data: { message: 'm' } })).toEqual({ kind: 'error', message: 'm' });
    const f = parseSseEvent(final({ turn_id: 'tid' }));
    expect(f).toMatchObject({ kind: 'final', text: 't', turn_id: 'tid' });
  });

  test('accepts the optional locator_label, kind and further_reading', () => {
    const c = { ...good, locator_label: '02:05', kind: 'reference' };
    const f = parseSseEvent(final({ citations: [c], further_reading: [{ title: 'x', url: 'https://e.com', locator_label: null, source_type: 'blog' }] }));
    expect(f).toMatchObject({ kind: 'final' });
    expect((f as { citations: { locator_label: string | null }[] }).citations[0].locator_label).toBe('02:05');
    expect((f as { further_reading: unknown[] }).further_reading).toHaveLength(1);
    expect(parseSseEvent(final({ citations: [{ ...good, locator_label: null }] }))).toMatchObject({ kind: 'final' });
    expect((parseSseEvent(final()) as { further_reading: unknown[] }).further_reading).toEqual([]);
  });

  test('ignores unknown events', () => {
    expect(parseSseEvent({ event: 'ping', data: {} })).toBeNull();
  });

  test('rejects invalid payloads', () => {
    const bad = [
      { event: 'delta', data: { text: 5 } },
      { event: 'delta', data: null },
      { event: 'error', data: { message: 5 } },
      final({ text: 5 }),
      final({ citations: 'x' }),
      final({ citations: [null] }),
      final({ citations: [{ ...good, title: { a: 1 } }] }),
      final({ citations: [{ ...good, quote: { a: 1 } }] }),
      final({ citations: [{ ...good, n: '1' }] }),
      final({ citations: [{ ...good, source_type: 'nope' }] }),
      final({ citations: [{ ...good, speaker: 'nope' }] }),
      final({ citations: [{ ...good, chunk_id: 3 }] }),
      final({ citations: [{ ...good, locator_label: 5 }] }),
      final({ citations: [{ ...good, kind: 'nope' }] }),
      final({ further_reading: 'x' }),
      final({ further_reading: [null] }),
      final({ further_reading: [{ title: 'x', url: 5, source_type: 'blog' }] }),
      final({ further_reading: [{ title: 'x', url: 'https://e.com', source_type: 'nope' }] }),
      final({ abstained: 'no' }),
      final({ abstained: undefined }),
      final({ turn_id: 7 }),
    ];
    for (const ev of bad) expect(parseSseEvent(ev), JSON.stringify(ev)).toEqual({ kind: 'invalid' });
  });
});

test.describe('bridge deadlines', () => {
  let server: Server;
  let base: string;
  const sockets = new Set<import('node:net').Socket>();

  test.beforeEach(async () => {
    server = createServer((req, res) => {
      if (req.url === '/silent') return; // never answers
      res.writeHead(req.url === '/bad' ? 500 : 200, { 'Content-Type': 'text/event-stream' });
      if (req.url === '/ok') {
        res.end('event: final\ndata: {}\n\n');
        return;
      }
      if (req.url === '/bad') {
        res.end('x');
        return;
      }
      res.write('event: delta\ndata: {"text":"a"}\n\n'); // then stall
    });
    server.on('connection', (s) => {
      sockets.add(s);
      s.on('close', () => sockets.delete(s));
    });
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  test.afterEach(async () => {
    for (const s of sockets) s.destroy();
    await new Promise((r) => server.close(r));
  });

  const read = async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader();
    const dec = new TextDecoder();
    let out = '';
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return out;
      out += dec.decode(value);
    }
  };

  test('passes a normal stream through', async () => {
    const { response, body } = await fetchBridgeStream(`${base}/ok`, {}, new AbortController().signal, {
      headersMs: 1000,
      totalMs: 2000,
    });
    expect(response.ok).toBe(true);
    expect(await read(body!)).toBe('event: final\ndata: {}\n\n');
  });

  test('throws BridgeTimeoutError when headers do not arrive in time', async () => {
    const t0 = Date.now();
    await expect(
      fetchBridgeStream(`${base}/silent`, {}, new AbortController().signal, { headersMs: 150, totalMs: 5000 }),
    ).rejects.toBeInstanceOf(BridgeTimeoutError);
    expect(Date.now() - t0).toBeLessThan(2000);
  });

  test('a stalled stream ends with a Hebrew SSE error event after the total deadline', async () => {
    const { body } = await fetchBridgeStream(`${base}/stall`, {}, new AbortController().signal, {
      headersMs: 1000,
      totalMs: 300,
    });
    const text = await read(body!);
    expect(text).toContain('event: delta');
    const events = parseSSE(text, { rest: '' });
    expect(events.at(-1)?.event).toBe('error');
    expect(JSON.stringify(events.at(-1)?.data)).toMatch(/[\u0590-\u05ff]/);
  });

  test('client abort is not reported as a timeout', async () => {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 100);
    const err = await fetchBridgeStream(`${base}/silent`, {}, ctrl.signal, { headersMs: 3000, totalMs: 5000 }).catch((e) => e);
    expect(err).not.toBeInstanceOf(BridgeTimeoutError);
    expect(err).toBeInstanceOf(Error);
  });

  test('non-ok responses return no body', async () => {
    const { response, body } = await fetchBridgeStream(`${base}/bad`, {}, new AbortController().signal, {
      headersMs: 1000,
      totalMs: 2000,
    });
    expect(response.status).toBe(500);
    expect(body).toBeNull();
  });
});

test.describe('production proxy guard', () => {
  test('production without SADIK_TRUST_PROXY=1 is 503 proxy not configured', async () => {
    const res = proxyGuard({ NODE_ENV: 'production' });
    expect(res?.status).toBe(503);
    expect(await res?.json()).toEqual({ error: 'proxy not configured' });
    expect(proxyGuard({ NODE_ENV: 'production', SADIK_TRUST_PROXY: '0' })?.status).toBe(503);
  });
  test('production with the proxy trusted, and non-production, pass', () => {
    expect(proxyGuard({ NODE_ENV: 'production', SADIK_TRUST_PROXY: '1' })).toBeNull();
    expect(proxyGuard({ NODE_ENV: 'development' })).toBeNull();
    expect(proxyGuard({})).toBeNull();
  });
});

test.describe('feedback forwards the server-resolved user', () => {
  let bridge: Server;
  let received: { auth?: string; body?: unknown } = {};
  const env = { SADIK_BRIDGE_URL: process.env.SADIK_BRIDGE_URL, SADIK_BRIDGE_TOKEN: process.env.SADIK_BRIDGE_TOKEN };

  test.beforeAll(async () => {
    bridge = createServer((req, res) => {
      let data = '';
      req.on('data', (c) => (data += c));
      req.on('end', () => {
        received = { auth: req.headers.authorization, body: JSON.parse(data) };
        res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}');
      });
    });
    await new Promise<void>((r) => bridge.listen(0, '127.0.0.1', r));
    process.env.SADIK_BRIDGE_URL = `http://127.0.0.1:${(bridge.address() as AddressInfo).port}`;
    process.env.SADIK_BRIDGE_TOKEN = 'test-token';
  });
  test.afterAll(async () => {
    await new Promise((r) => bridge.close(r));
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  test('the cookie session id is sent to the bridge as an anonymous user; a browser-sent user is ignored', async () => {
    const sid = 'ab'.repeat(16);
    const res = await feedbackPost(
      new NextRequest('http://localhost:4000/api/sadik-chat/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', cookie: `sadik_session=${sid}` },
        body: JSON.stringify({ turn_id: 't-1', value: 'up', user: { kind: 'google', id: 'f'.repeat(64) } }),
      }),
    );
    expect(res.status).toBe(200);
    expect(received.body).toEqual({ user: { kind: 'anon', id: sid }, turn_id: 't-1', value: 'up' });
    expect(received.auth).toBe('Bearer test-token');
  });
});


test.describe('answer markdown parsing', () => {
  const MARKDOWN =
    '**הרמב״ם** קובע שיש בחירה [1].\nשורה שנייה באותה פסקה.\n\nפסקה שנייה עם **הדגשה [2]** ועם **כוכבית פתוחה\n\n- נקודה ראשונה [1]\n- נקודה **שנייה**\n- <b>לא תגית</b> ו-[9]\n\nסיום';

  test('parseAnswer builds paragraphs, line breaks, bullets and bold; everything else stays text', async () => {
    const blocks = parseAnswer(MARKDOWN);
    expect(blocks.map((b) => b.t)).toEqual(['p', 'p', 'ul', 'p']);
    expect(blocks[0]).toMatchObject({ t: 'p', lines: [expect.any(Array), expect.any(Array)] });
    expect(blocks[2]).toMatchObject({ t: 'ul', items: [expect.any(Array), expect.any(Array), expect.any(Array)] });
    expect(parseInline('א **ב** [3]')).toEqual([
      { t: 'text', v: 'א ' },
      { t: 'bold', c: [{ t: 'text', v: 'ב' }] },
      { t: 'text', v: ' ' },
      { t: 'cite', n: 3, raw: '[3]' },
    ]);
    // unclosed, spaced or empty emphasis is literal; a lone hyphen is not a bullet; CRLF is a line break
    expect(parseInline('**פתוח')).toEqual([{ t: 'text', v: '**פתוח' }]);
    expect(parseInline('** רווח **')).toEqual([{ t: 'text', v: '** רווח **' }]);
    expect(parseInline('****')).toEqual([{ t: 'text', v: '****' }]);
    expect(parseAnswer('-\n-x')).toEqual([{ t: 'p', lines: [[{ t: 'text', v: '-' }], [{ t: 'text', v: '-x' }]] }]);
    expect(parseAnswer('א\r\nב')).toMatchObject([{ t: 'p', lines: [expect.any(Array), expect.any(Array)] }]);
    expect(parseAnswer('   \n\n')).toEqual([]);
  });

});

test.describe('round-2 payload validation', () => {
  test('snippets, articles and other speakers are accepted; snippets are capped', () => {
    const f = parseSseEvent({
      event: 'final',
      data: { ...FINAL, citations: [...FINAL.citations, cite(8, 'article', { speaker: 'other', snippet: 'x'.repeat(5000) })] },
    });
    expect(f).toMatchObject({ kind: 'final' });
    const cites = (f as { citations: { snippet?: string; source_type: string }[] }).citations;
    expect(cites[0].snippet).toContain('רשות כל אדם');
    expect(cites.at(-1)!.snippet!.length).toBe(600);
    expect(parseSseEvent({ event: 'final', data: { ...FINAL, citations: [cite(1, 'blog', { snippet: 5 })] } })).toEqual({ kind: 'invalid' });
    // a further-reading row without a type reads as a generic source instead of failing the whole answer
    const typeless = parseSseEvent({ event: 'final', data: { ...FINAL, further_reading: [{ title: 'x', url: '/x', locator_label: null, source_type: '' }] } });
    expect((typeless as { further_reading: { source_type: string }[] }).further_reading[0].source_type).toBe('primary');
  });

  test('stored conversations need a uuid4-hex id and at least one valid message', () => {
    const good = { id: 'a'.repeat(32), title: 't', updated: 1, messages: [{ role: 'user', text: 'q' }] };
    expect(parseStoredConversation(good)).toMatchObject({ id: 'a'.repeat(32), messages: [{ role: 'user', text: 'q' }] });
    expect(parseStoredConversation({ ...good, id: 'not-an-id' })).toBeNull();
    expect(parseStoredConversation({ ...good, messages: [{ role: 'bot', text: '<img onerror=x>' }] })).toBeNull();
    expect(parseStoredConversation({ ...good, title: { a: 1 } })).toMatchObject({ title: '' });
  });

  test('history and share payloads from the bridge are validated', () => {
    expect(parseConversationList([{ conversation_id: 'a'.repeat(32), title: 'x', last_ts: 't', n_turns: 2 }, { conversation_id: '../x' }, null])).toEqual([
      { id: 'a'.repeat(32), title: 'x', last_ts: 't', n_turns: 2 },
    ]);
    const turns = parseConversationTurns([{ turn_id: 't', ts: 'x', question: QUESTION, final: FINAL }, { question: 'bad', final: { text: 5 } }]);
    expect(turns).toHaveLength(2);
    expect(turns[1]).toMatchObject({ role: 'bot', turn_id: FINAL.turn_id });
    const shared = parseSharedAnswer({ question: QUESTION, text: FINAL.text, citations: FINAL.citations, further_reading: FINAL.further_reading, ts: 'x' });
    expect(shared?.citations).toHaveLength(7);
    expect(parseSharedAnswer({ question: 5 })).toBeNull();
  });
});

test.describe('gloss letters, export, analytics, GA location', () => {
  test('gloss letters follow Hebrew numerals', () => {
    expect([1, 2, 9, 10, 11, 15, 16, 20, 42, 99].map(glossLetter)).toEqual(['א', 'ב', 'ט', 'י', 'יא', 'טו', 'טז', 'כ', 'מב', 'צט']);
    expect(glossLetter(0)).toBe('0');
    expect(glossLetter(100)).toBe('100');
  });

  const messages: ChatMessage[] = [
    { role: 'user' as const, text: QUESTION },
    { role: 'bot' as const, text: FINAL.text, citations: FINAL.citations as Citation[], further_reading: FINAL.further_reading, turn_id: FINAL.turn_id },
    { role: 'user' as const, text: 'שאלה שנכשלה' },
    { role: 'bot' as const, text: 'שגיאה', citations: [], error: true },
  ];

  test('Markdown export: question, answer with [n], the three groups, links; failed turns left out', () => {
    const md = toMarkdown(QUESTION, messages, new Date('2026-10-24T00:00:00Z'));
    expect(md).toContain(`## ${QUESTION}`);
    expect(md).toContain('[1]');
    expect(md).toContain('### ציטוטים');
    expect(md).toContain('### מקורות');
    expect(md).toContain('### להעמקה');
    expect(md).toContain('(https://religousphilosophy.com/responsa/knowledge-and-choice)');
    expect(md).toContain('בינה מלאכותית שנבנתה מכתביו של פרופ׳ שלום צדיק');
    expect(md).not.toContain('שאלה שנכשלה');
  });

  test('JSON export: one turn with citations and links, unsafe links dropped', () => {
    const unsafe = [...messages.slice(0, 1), { ...(messages[1] as BotMessage), citations: [cite(1, 'blog', { url: 'javascript:alert(1)' }) as Citation] }];
    const data = JSON.parse(toJson('t', unsafe));
    expect(data.turns).toHaveLength(1);
    expect(data.turns[0].citations[0].url).toBeNull();
    expect(JSON.parse(toJson('t', messages)).turns[0].citations).toHaveLength(7);
  });

  test('GA params keep only numbers and allowed enums', () => {
    expect(cleanParams('answer_received', { latency_ms: 1234.6, n_quotes: 3, n_refs: 4, text: 'שאלה' } as never)).toEqual({ latency_ms: 1235, n_quotes: 3, n_refs: 4 });
    expect(cleanParams('feedback', { value: 'up', turn_id: 'turn-1' } as never)).toEqual({ value: 'up' });
    expect(cleanParams('source_click', { group: 'quote', source_type: 'https://x' })).toEqual({ group: 'quote' });
    expect(cleanParams('share', { stage: 'create', url: '/sadik/share/x' } as never)).toEqual({ stage: 'create' });
    expect(cleanParams('chat_open', { anything: 'x' })).toEqual({});
  });

  test('GA page_location loses share ids, the Vercel share token and the hash', () => {
    expect(sanitizeGaUrl(`https://preview.example/sadik/share/${SHARE_ID}?_vercel_share=tok&x=1#h`)).toBe('https://preview.example/sadik/share/_?x=1');
    expect(sanitizeGaUrl('https://preview.example/responsa?_vercel_share=tok')).toBe('https://preview.example/responsa');
    expect(sanitizeGaUrl('nonsense')).toBe('');
  });
});

test.describe('same-origin guard fails closed (M4)', () => {
  const req = (headers: Record<string, string>) =>
    new NextRequest('http://site.example/api/sadik-chat', { method: 'POST', headers: { host: 'site.example', 'content-type': 'application/json', ...headers } });

  test('no Origin and no Sec-Fetch-Site is cross-origin; same-origin passes', () => {
    expect(crossOrigin(req({}))).toBe(true);
    expect(crossOrigin(req({ 'sec-fetch-site': 'same-origin' }))).toBe(false);
    expect(crossOrigin(req({ origin: 'http://site.example' }))).toBe(false);
    expect(crossOrigin(req({ 'sec-fetch-site': 'same-site' }))).toBe(true);
    expect(crossOrigin(req({ origin: 'https://site.example.evil.com' }))).toBe(true);
    expect(crossOrigin(req({ origin: 'null' }))).toBe(true);
    expect(guardRequest(req({}), createRateLimiters(100, 100)).rejection?.status).toBe(403);
  });

  test('the session cookie is __Host- prefixed and Secure on HTTPS and on Vercel', () => {
    const https = req({ 'x-forwarded-proto': 'https' });
    expect(sessionCookieName(https)).toBe('__Host-sadik_session');
    const res = withSessionCookie(new Response(null), https, { id: 'c'.repeat(32), fresh: true });
    expect(res.headers.get('set-cookie')).toBe(`__Host-sadik_session=${'c'.repeat(32)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure`);
    // on HTTPS a plain (unprefixed) cookie is ignored
    const planted = new NextRequest('http://site.example/x', { headers: { 'x-forwarded-proto': 'https', cookie: `sadik_session=${'d'.repeat(32)}` } });
    expect(resolveSession(planted).id).not.toBe('d'.repeat(32));
    expect(sessionCookieName(req({}))).toBe('sadik_session');
  });

  test('the client IP for the bridge is a valid IP from a trusted proxy only', () => {
    const h = (v: string) => new Headers({ 'x-forwarded-for': v });
    expect(bridgeClientIp(h('203.0.113.9, 10.0.0.1'), true)).toBe('203.0.113.9');
    expect(bridgeClientIp(h('2001:db8::1'), true)).toBe('2001:db8::1');
    expect(bridgeClientIp(h('203.0.113.9'), false)).toBeNull();
    expect(bridgeClientIp(h('evil, 1.2.3.4'), true)).toBeNull();
  });

  test('on Vercel the bridge URL must be https', () => {
    expect(bridgeConfig({ SADIK_BRIDGE_URL: 'http://x', SADIK_BRIDGE_TOKEN: 't', VERCEL: '1' })).toBeNull();
    expect(bridgeConfig({ SADIK_BRIDGE_URL: 'https://x.ts.net', SADIK_BRIDGE_TOKEN: 't', VERCEL: '1' })).toEqual({ url: 'https://x.ts.net', token: 't' });
    expect(bridgeConfig({ SADIK_BRIDGE_URL: 'http://127.0.0.1:1', SADIK_BRIDGE_TOKEN: '' })).toBeNull();
  });
});

test.describe('chat and share routes speak the round-2 bridge contract', () => {
  let bridge: Server;
  let seen: { path?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown } = {};
  let reply: { status: number; type: string; body: string } = { status: 200, type: 'text/event-stream', body: '' };
  const env = { u: process.env.SADIK_BRIDGE_URL, t: process.env.SADIK_BRIDGE_TOKEN, p: process.env.SADIK_TRUST_PROXY };
  const sid = 'ab'.repeat(16);
  const cid = 'c'.repeat(32);

  test.beforeAll(async () => {
    bridge = createServer((req, res) => {
      let data = '';
      req.on('data', (c) => (data += c));
      req.on('end', () => {
        seen = { path: req.url, headers: req.headers, body: data ? JSON.parse(data) : null };
        res.writeHead(reply.status, { 'Content-Type': reply.type }).end(reply.body);
      });
    });
    await new Promise<void>((r) => bridge.listen(0, '127.0.0.1', r));
    process.env.SADIK_BRIDGE_URL = `http://127.0.0.1:${(bridge.address() as AddressInfo).port}`;
    process.env.SADIK_BRIDGE_TOKEN = 'test-token';
    process.env.SADIK_TRUST_PROXY = '1';
  });
  test.afterAll(async () => {
    await new Promise((r) => bridge.close(r));
    const restore = (k: string, v: string | undefined) => (v === undefined ? delete process.env[k] : (process.env[k] = v));
    restore('SADIK_BRIDGE_URL', env.u);
    restore('SADIK_BRIDGE_TOKEN', env.t);
    restore('SADIK_TRUST_PROXY', env.p);
  });

  const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
    new NextRequest(`http://localhost${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'sec-fetch-site': 'same-origin',
        cookie: `sadik_session=${sid}`,
        'x-forwarded-for': '198.51.100.7',
        ...headers,
      },
      body: JSON.stringify(body),
    });

  test('chat: server-resolved user + conversation_id + message, client IP header, bearer; browser user ignored', async () => {
    reply = { status: 200, type: 'text/event-stream', body: 'event: final\ndata: {}\n\n' };
    const res = await chatPost(post('/api/sadik-chat', { message: 'שאלה', conversation_id: cid, user: { kind: 'google', id: 'f'.repeat(64) } }));
    expect(res.status).toBe(200);
    await res.text();
    expect(seen.path).toBe('/chat');
    expect(seen.body).toEqual({ user: { kind: 'anon', id: sid }, conversation_id: cid, message: 'שאלה' });
    expect(seen.headers?.['x-shalom-client-ip']).toBe('198.51.100.7');
    expect(seen.headers?.authorization).toBe('Bearer test-token');
  });

  test('chat: a browser X-Shalom-Client-IP is never forwarded as is', async () => {
    reply = { status: 200, type: 'text/event-stream', body: 'event: final\ndata: {}\n\n' };
    const res = await chatPost(post('/api/sadik-chat', { message: 'x', conversation_id: cid }, { 'x-shalom-client-ip': '6.6.6.6', 'x-forwarded-for': 'garbage' }));
    await res.text();
    expect(seen.headers?.['x-shalom-client-ip']).toBeUndefined();
  });

  test('chat: conversation_id must be 32 hex characters', async () => {
    for (const bad of [undefined, 'x', 'C'.repeat(32), `${cid}0`, { $ne: '' }]) {
      const res = await chatPost(post('/api/sadik-chat', { message: 'x', conversation_id: bad }));
      expect(res.status, JSON.stringify(bad)).toBe(400);
    }
  });

  test('chat: the anonymous quota 429 is passed on with its reason; other 429s are generic', async () => {
    reply = { status: 429, type: 'application/json', body: JSON.stringify({ reason: 'anon_daily_quota' }) };
    const quota = await chatPost(post('/api/sadik-chat', { message: 'x', conversation_id: cid }));
    expect(quota.status).toBe(429);
    expect(await quota.json()).toEqual({ reason: 'anon_daily_quota' });
    reply = { status: 429, type: 'application/json', body: JSON.stringify({ detail: 'הגעת למכסת ההודעות היומית שלך. נסו שוב מחר.' }) };
    const other = await chatPost(post('/api/sadik-chat', { message: 'x', conversation_id: cid }));
    expect(other.status).toBe(429);
    expect(await other.json()).toEqual({ error: 'too many requests', message: 'הגעת למכסת ההודעות היומית שלך. נסו שוב מחר.' });
    reply = { status: 429, type: 'application/json', body: JSON.stringify({ detail: 'not hebrew <script>' }) };
    const odd = await chatPost(post('/api/sadik-chat', { message: 'x', conversation_id: cid }));
    expect(await odd.json()).toEqual({ error: 'too many requests' });
  });

  test('share: {turn_id} → bridge {turn_id, kind, id} → {id}; a miss is 404', async () => {
    reply = { status: 200, type: 'application/json', body: JSON.stringify({ share_id: SHARE_ID }) };
    const ok = await sharePost(post('/api/sadik-chat/share', { turn_id: 'turn-1', kind: 'google', id: 'x' }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ id: SHARE_ID });
    expect(seen.body).toEqual({ turn_id: 'turn-1', kind: 'anon', id: sid });
    reply = { status: 404, type: 'application/json', body: JSON.stringify({ detail: 'not found' }) };
    expect((await sharePost(post('/api/sadik-chat/share', { turn_id: 'turn-2' }))).status).toBe(404);
    reply = { status: 200, type: 'application/json', body: JSON.stringify({ share_id: '../../etc' }) };
    expect((await sharePost(post('/api/sadik-chat/share', { turn_id: 'turn-3' }))).status).toBe(502);
    expect((await sharePost(post('/api/sadik-chat/share', { turn_id: { $ne: '' } }))).status).toBe(400);
  });

  test('share: needs a session and same-origin', async () => {
    const noSession = await sharePost(post('/api/sadik-chat/share', { turn_id: 't' }, { cookie: '' }));
    expect(noSession.status).toBe(403);
    const cross = await sharePost(post('/api/sadik-chat/share', { turn_id: 't' }, { 'sec-fetch-site': 'cross-site' }));
    expect(cross.status).toBe(403);
  });

  test('bridge redirects are never followed', async () => {
    reply = { status: 302, type: 'text/plain', body: '' };
    const res = await sharePost(post('/api/sadik-chat/share', { turn_id: 'turn-1' }));
    expect(res.status).toBe(502);
  });
});
