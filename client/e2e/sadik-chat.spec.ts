import { test, expect, type Page } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { parseSSE } from '../src/components/sadik-chat/sse';
import { parseSseEvent } from '../src/components/sadik-chat/validate';
import { fetchBridgeStream, BridgeTimeoutError } from '../src/app/api/sadik-chat/_deadline';

/**
 * The bridge is mocked: every test fulfils POST /api/sadik-chat with a canned
 * SSE stream, so no Strapi data or bridge service is needed for these checks.
 */

const BUTTON = 'שאלו את פרופ׳ צדיק';
const HEADER = 'שאלו את פרופ׳ צדיק (AI)';
const DISCLOSURE = 'בינה מלאכותית שנבנתה מכתביו של פרופ׳ שלום צדיק — לא פרופ׳ צדיק עצמו';

type Cite = {
  n: number;
  chunk_id: string;
  title: string;
  url: string;
  source_type: string;
  speaker: string;
  quote: string | null;
};

function sse(events: { event: string; data: unknown }[]): string {
  return events.map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`).join('');
}

function cite(n: number, source_type: string, extra: Partial<Cite> = {}): Cite {
  return {
    n,
    chunk_id: `c${n}`,
    title: `מקור ${source_type}`,
    url: `https://example.com/${source_type}`,
    source_type,
    speaker: 'sadik',
    quote: null,
    ...extra,
  };
}

async function mockChat(page: Page, body: string, status = 200) {
  await page.route('**/api/sadik-chat', (route) =>
    route.fulfill({ status, contentType: 'text/event-stream', body }),
  );
}

async function openChat(page: Page) {
  await page.getByRole('button', { name: new RegExp(BUTTON) }).click();
  return page.getByRole('dialog', { name: HEADER });
}

async function ask(page: Page, text: string) {
  const dialog = page.getByRole('dialog', { name: HEADER });
  await dialog.getByPlaceholder('כתבו שאלה…').fill(text);
  await dialog.getByRole('button', { name: 'שליחה' }).click();
}

test.describe('Sadik side chat', () => {
  for (const path of ['/', '/responsa']) {
    test(`opens from any page (${path})`, async ({ page }) => {
      await page.goto(path);
      const dialog = await openChat(page);
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText(HEADER, { exact: true })).toBeVisible();
      await expect(dialog.getByText(DISCLOSURE)).toBeVisible();
    });
  }

  test('streams and shows citations with colours and links', async ({ page }) => {
    const types = ['responsa', 'writing', 'blog', 'term', 'video', 'playlist', 'academic', 'comment'];
    const citations = types.map((t, i) => cite(i + 1, t));
    const text = types.map((_, i) => `טענה ${i + 1}[${i + 1}]`).join(' ');
    await mockChat(
      page,
      sse([
        { event: 'delta', data: { text: 'טיוטה' } },
        { event: 'final', data: { text, citations, abstained: false, flags: [] } },
      ]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'מה דעתך על הבחירה?');
    await expect(dialog.getByText('מה דעתך על הבחירה?')).toBeVisible();
    await expect(dialog.getByText('טענה 1', { exact: false })).toBeVisible();
    await expect(dialog.getByText('טיוטה')).toHaveCount(0);

    const colour: Record<string, RegExp> = {
      responsa: /bg-orange-/,
      comment: /bg-orange-/,
      writing: /bg-teal-/,
      blog: /bg-green-/,
      term: /bg-pink-/,
      video: /bg-blue-/,
      playlist: /bg-purple-/,
      academic: /bg-slate-/,
    };
    for (const t of types) {
      const chip = dialog.locator(`[data-source-type="${t}"]`);
      await expect(chip).toHaveCount(1);
      await expect(chip.locator('[data-chip-label]')).toHaveClass(colour[t]);
      const link = chip.getByRole('link');
      await expect(link).toHaveAttribute('href', `https://example.com/${t}`);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', /noopener/);
    }
    await expect(dialog.locator('[aria-live="polite"]')).toBeVisible();
  });

  test('primary source shows מקור and visitor citation is labelled', async ({ page }) => {
    await mockChat(
      page,
      sse([
        {
          event: 'final',
          data: {
            text: 'כך כתב הרמב״ם[1] וגולש הוסיף[2]',
            citations: [
              cite(1, 'primary', { speaker: 'maimonides', title: 'מורה הנבוכים ג, כ' }),
              cite(2, 'comment', { speaker: 'visitor', title: 'תגובה' }),
            ],
            abstained: false,
            flags: [],
          },
        },
      ]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    const primary = dialog.locator('[data-source-type="primary"]');
    await expect(primary.getByText('מקור', { exact: true })).toBeVisible();
    await expect(primary.locator('[data-chip-label]')).toHaveClass(/bg-gray-|bg-neutral-|bg-zinc-/);
    const visitor = dialog.locator('[data-source-type="comment"]');
    await expect(visitor.getByText('גולש', { exact: true })).toBeVisible();
    await expect(primary.getByText('גולש')).toHaveCount(0);
  });

  test('persists across navigation', async ({ page }) => {
    await mockChat(
      page,
      sse([{ event: 'final', data: { text: 'תשובה שנשמרת', citations: [], abstained: false, flags: [] } }]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה לשמירה');
    await expect(dialog.getByText('תשובה שנשמרת')).toBeVisible();

    // client-side navigation keeps the component mounted
    await page.locator('a[href="/responsa"]').first().click();
    await page.waitForURL('**/responsa');
    await expect(page.getByRole('dialog', { name: HEADER }).getByText('תשובה שנשמרת')).toBeVisible();

    // and the transcript survives a full reload
    const stored = await page.evaluate(() => localStorage.getItem('sadik-chat-v1'));
    expect(stored).toContain('תשובה שנשמרת');
    await page.reload();
    const reopened = await openChat(page);
    await expect(reopened.getByText('תשובה שנשמרת')).toBeVisible();
  });

  test('Esc closes and refocuses the button', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: new RegExp(BUTTON) });
    const dialog = await openChat(page);
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('error event shows Hebrew error', async ({ page }) => {
    await mockChat(page, sse([{ event: 'error', data: { message: 'אירעה שגיאה, נסו שוב מאוחר יותר' } }]));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.getByRole('alert')).toContainText('אירעה שגיאה, נסו שוב מאוחר יותר');
  });
});

test.describe('Sadik chat feedback', () => {
  const answer = sse([
    { event: 'final', data: { text: 'תשובה לדירוג', citations: [], abstained: false, flags: [], turn_id: 't-123' } },
  ]);

  async function mockFeedback(page: Page, status = 200) {
    const posted: unknown[] = [];
    await page.route('**/api/sadik-chat/feedback', async (route) => {
      posted.push(route.request().postDataJSON());
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: status === 200 }) });
    });
    return posted;
  }

  test('thumbs posts turn_id and value', async ({ page }) => {
    await mockChat(page, answer);
    const posted = await mockFeedback(page);
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.getByText('תשובה לדירוג')).toBeVisible();
    await dialog.getByRole('button', { name: 'תשובה לא טובה' }).click();
    await expect(dialog.getByRole('button', { name: 'תשובה לא טובה' })).toHaveAttribute('aria-pressed', 'true');
    expect(posted).toEqual([{ turn_id: 't-123', value: 'down' }]);
    // one vote per answer
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'תשובה לא טובה' })).toBeDisabled();
  });

  test('vote is shown as chosen after reload', async ({ page }) => {
    await mockChat(page, answer);
    await mockFeedback(page);
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await dialog.getByRole('button', { name: 'תשובה טובה' }).click();
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    const reopened = await openChat(page);
    await expect(reopened.getByRole('button', { name: 'תשובה טובה' })).toHaveAttribute('aria-pressed', 'true');
    await expect(reopened.getByRole('button', { name: 'תשובה לא טובה' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('failed post leaves the answer unrated', async ({ page }) => {
    await mockChat(page, answer);
    await mockFeedback(page, 502);
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await dialog.getByRole('button', { name: 'תשובה טובה' }).click();
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toHaveAttribute('aria-pressed', 'false');
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toBeEnabled();
  });

  test('answers without turn_id show no thumbs', async ({ page }) => {
    await mockChat(page, sse([{ event: 'final', data: { text: 'ללא מזהה', citations: [], abstained: false, flags: [] } }]));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.getByText('ללא מזהה')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toHaveCount(0);
  });
});

test.describe('Sadik chat robustness', () => {
  test('malformed stored transcript does not break the page', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'sadik-chat-v1',
        JSON.stringify([null, 5, { role: 'bot', text: 'x' }, { role: 'bot', text: 'y', citations: [null] }, { role: 'user', text: 'שאלה תקינה' }]),
      );
    });
    await page.goto('/');
    const dialog = await openChat(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('שאלה תקינה')).toBeVisible();
  });

  test('non-JSON stored transcript does not break the page', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('sadik-chat-v1', '{not json'));
    await page.goto('/');
    await expect(await openChat(page)).toBeVisible();
  });
});

test.describe('Sadik chat route guards', () => {
  const json = { 'content-type': 'application/json' };

  test('415 without JSON content type', async ({ request }) => {
    const res = await request.post('/api/sadik-chat', {
      headers: { 'content-type': 'text/plain', 'x-forwarded-for': '10.1.0.1' },
      data: 'hi',
    });
    expect(res.status()).toBe(415);
  });

  test('403 for cross-site requests', async ({ request }) => {
    const site = await request.post('/api/sadik-chat', {
      headers: { ...json, 'sec-fetch-site': 'cross-site', 'x-forwarded-for': '10.1.0.2' },
      data: { message: 'hi' },
    });
    expect(site.status()).toBe(403);
    const origin = await request.post('/api/sadik-chat', {
      headers: { ...json, origin: 'https://evil.example', 'x-forwarded-for': '10.1.0.2' },
      data: { message: 'hi' },
    });
    expect(origin.status()).toBe(403);
  });

  test('feedback route applies the same guards', async ({ request }) => {
    const cross = await request.post('/api/sadik-chat/feedback', {
      headers: { ...json, 'sec-fetch-site': 'cross-site', 'x-forwarded-for': '10.1.0.5' },
      data: { turn_id: 't', value: 'up' },
    });
    expect(cross.status()).toBe(403);
    const plain = await request.post('/api/sadik-chat/feedback', {
      headers: { 'content-type': 'text/plain', 'x-forwarded-for': '10.1.0.5' },
      data: 'hi',
    });
    expect(plain.status()).toBe(415);
  });

  test('429 after 10 requests per IP', async ({ request }) => {
    const headers = { ...json, 'x-forwarded-for': '10.1.0.3, 192.168.0.1' };
    for (let i = 0; i < 10; i++) {
      const res = await request.post('/api/sadik-chat', { headers, data: { message: '' } });
      expect(res.status()).not.toBe(429);
    }
    const res = await request.post('/api/sadik-chat', { headers, data: { message: '' } });
    expect(res.status()).toBe(429);
    const other = await request.post('/api/sadik-chat', {
      headers: { ...json, 'x-forwarded-for': '10.1.0.4' },
      data: { message: '' },
    });
    expect(other.status()).not.toBe(429);
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
      final({ abstained: 'no' }),
      final({ abstained: undefined }),
      final({ turn_id: 7 }),
    ];
    for (const ev of bad) expect(parseSseEvent(ev), JSON.stringify(ev)).toEqual({ kind: 'invalid' });
  });
});

test.describe('invalid payloads and stored data', () => {
  test('a final event with a malformed citation shows the controlled error and the page survives', async ({ page }) => {
    await mockChat(
      page,
      sse([{ event: 'final', data: { text: 'x', citations: [null, { n: 1, title: { a: 1 } }], abstained: false } }]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.getByRole('alert')).toContainText('אירעה שגיאה');
    await expect(dialog.getByPlaceholder('כתבו שאלה…')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'שליחה' })).toBeDisabled();
  });

  test('a delta event with a non-string text shows the controlled error', async ({ page }) => {
    await mockChat(page, sse([{ event: 'delta', data: { text: { a: 1 } } }]));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.getByRole('alert')).toContainText('אירעה שגיאה');
  });

  test('stored messages with unknown speaker or object title are dropped', async ({ page }) => {
    const bot = (c: unknown) => ({ role: 'bot', text: 'תשובה', citations: [c] });
    const ok = { n: 1, title: 'תקין', url: 'https://example.com', source_type: 'blog', speaker: 'sadik' };
    await page.addInitScript(
      (msgs) => localStorage.setItem('sadik-chat-v1', JSON.stringify(msgs)),
      [
        bot({ ...ok, speaker: 'x' }),
        bot({ ...ok, title: { a: 1 } }),
        bot({ ...ok, source_type: 'nope' }),
        { role: 'user', text: 'שאלה ישנה' },
        bot(ok),
      ],
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await expect(dialog.getByText('שאלה ישנה')).toBeVisible();
    await expect(dialog.getByText('תקין')).toHaveCount(1);
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
