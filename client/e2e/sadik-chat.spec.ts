import { test, expect, type Page } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { NextRequest } from 'next/server';
import { POST as feedbackPost } from '../src/app/api/sadik-chat/feedback/route';
import { LIMITER_CAPACITY, clientIp, createRateLimiters, createWindowLimiter, guardRequest, proxyGuard, resolveSession } from '../src/app/api/sadik-chat/_guards';
import { parseSSE } from '../src/components/sadik-chat/sse';
import { parseSseEvent } from '../src/components/sadik-chat/validate';
import { parseAnswer, parseInline } from '../src/components/sadik-chat/markdown';
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
  locator_label?: string | null;
  kind?: 'quote' | 'reference';
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

  test('quote citation shows a prominent blockquote, a link to the place and the page badge; reference shows the moment badge', async ({ page }) => {
    await mockChat(
      page,
      sse([
        {
          event: 'final',
          data: {
            text: 'הרמב״ם כתב[1] וגם נאמר בהרצאה[2]',
            citations: [
              cite(1, 'primary', {
                speaker: 'maimonides',
                title: 'מורה הנבוכים ג, כ',
                url: 'https://example.com/guide#page=3',
                quote: 'לא יתכן שתתחדש לו ידיעה עד שידע עתה',
                locator_label: 'עמ׳ 3',
                kind: 'quote',
              }),
              cite(2, 'video', {
                title: 'הרצאה על בחירה',
                url: 'https://www.youtube.com/watch?v=abc&t=125',
                locator_label: '02:05',
                kind: 'reference',
              }),
            ],
            further_reading: [
              { title: 'שו״ת על ידיעה', url: 'https://example.com/responsa/1', locator_label: null, source_type: 'responsa' },
              { title: 'הרצאה נוספת', url: 'https://www.youtube.com/watch?v=def&t=60', locator_label: '01:00', source_type: 'video' },
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
    const quote = dialog.locator('[data-source-type="primary"]');
    await expect(quote.locator('blockquote')).toHaveText('לא יתכן שתתחדש לו ידיעה עד שידע עתה');
    await expect(quote.getByRole('link')).toHaveAttribute('href', 'https://example.com/guide#page=3');
    await expect(quote.locator('[data-locator]')).toHaveText('עמ׳ 3');
    await expect(quote.getByText('הרמב״ם', { exact: true })).toBeVisible();
    const ref = dialog.locator('[data-source-type="video"]').first();
    await expect(ref.locator('blockquote')).toHaveCount(0);
    await expect(ref.getByRole('link')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abc&t=125');
    await expect(ref.locator('[data-locator]')).toHaveText('▶ 02:05');
    const further = dialog.locator('[data-further-reading]');
    await expect(further.getByText('להעמקה')).toBeVisible();
    await expect(further.getByRole('link')).toHaveCount(2);
    await expect(further.getByRole('link').nth(1)).toHaveAttribute('href', 'https://www.youtube.com/watch?v=def&t=60');
    await expect(further.locator('[data-locator]')).toHaveText('▶ 01:00');
  });

  test('a non-http link is not rendered as a link and further reading survives a reload', async ({ page }) => {
    await mockChat(
      page,
      sse([
        {
          event: 'final',
          data: {
            text: 'טענה[1]',
            citations: [cite(1, 'blog', { url: 'javascript:alert(1)' })],
            further_reading: [{ title: 'קריאה', url: 'https://example.com/r', locator_label: null, source_type: 'blog' }],
            abstained: false,
            flags: [],
          },
        },
      ]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.locator('[id$="-cite-1"]').getByRole('link')).toHaveCount(0); // the citation itself: no link for a javascript: url
    await expect(dialog.locator('[data-further-reading]').getByRole('link')).toHaveCount(1);
    await page.reload();
    const again = await openChat(page);
    await expect(again.locator('[data-further-reading]').getByRole('link')).toHaveAttribute('href', 'https://example.com/r');
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

  test('rejected request still sets a session cookie', async ({ request }) => {
    const res = await request.post('/api/sadik-chat', {
      headers: { 'content-type': 'text/plain' },
      data: 'hi',
    });
    expect(res.status()).toBe(415);
    expect(res.headers()['set-cookie']).toMatch(/^sadik_session=[0-9a-f]{32}; Path=\/; HttpOnly; SameSite=Lax/);
  });

  test('feedback without session cookie is 403', async ({ request }) => {
    const res = await request.post('/api/sadik-chat/feedback', {
      headers: json,
      data: { turn_id: 't', value: 'up' },
    });
    expect(res.status()).toBe(403);
    expect(await res.json()).toEqual({ error: 'no session' });
  });

  // Empty messages are rejected with 400 after the rate guards, so no real bridge turn is started.
  test('spoofed forwarded headers do not bypass the limit', async ({ request }) => {
    let limited = 0;
    for (let i = 0; i < 11; i++) {
      const res = await request.post('/api/sadik-chat', {
        headers: { ...json, 'x-forwarded-for': `10.2.0.${i}`, 'x-real-ip': `10.3.0.${i}` },
        data: { message: '' },
      });
      if (res.status() === 429) limited++;
    }
    expect(limited).toBe(1);
  });
});

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
    new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...headers } });

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
        new NextRequest('http://localhost/x', { method: 'POST', headers: { 'content-type': 'application/json' } }),
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

test.describe('feedback forwards the session', () => {
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

  test('the cookie session id is sent to the bridge as `session`', async () => {
    const sid = 'ab'.repeat(16);
    const res = await feedbackPost(
      new NextRequest('http://localhost:4000/api/sadik-chat/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `sadik_session=${sid}` },
        body: JSON.stringify({ turn_id: 't-1', value: 'up' }),
      }),
    );
    expect(res.status).toBe(200);
    expect(received.body).toEqual({ turn_id: 't-1', value: 'up', session: sid });
    expect(received.auth).toBe('Bearer test-token');
  });
});

test.describe('answer markdown', () => {
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

  test('renders bold, paragraphs, line breaks and bullets as elements, with no literal ** and no HTML passthrough', async ({ page }) => {
    await mockChat(
      page,
      sse([
        {
          event: 'final',
          data: { text: MARKDOWN, citations: [cite(1, 'responsa'), cite(2, 'writing', { kind: 'quote', quote: 'ציטוט מילה מילה מילה מילה' })], abstained: false, flags: [] },
        },
      ]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    const answer = dialog.locator('[data-answer]');
    await expect(answer.locator('strong').first()).toHaveText('הרמב״ם');
    await expect(answer.locator('strong')).toHaveCount(3);
    await expect(answer.locator('p')).toHaveCount(3);
    await expect(answer.locator('p').first().locator('br')).toHaveCount(1);
    await expect(answer.locator('ul > li')).toHaveCount(3);
    const text = (await answer.innerText()).replace(/\s+/g, ' ');
    expect(text).toContain('**כוכבית פתוחה'); // an unclosed emphasis is shown as written
    expect(text.match(/\*\*/g)).toHaveLength(1);
    expect(text).toContain('<b>לא תגית</b>');
    await expect(answer.locator('b, script, img')).toHaveCount(0);
    await expect(answer.getByText('[9]')).toBeVisible(); // a marker without a citation stays plain text
    await expect(answer.locator('a[data-cite-marker="9"]')).toHaveCount(0);
  });

  test('a [n] marker links to its citation and moves focus there', async ({ page }) => {
    await mockChat(
      page,
      sse([{ event: 'final', data: { text: 'טענה [2].', citations: [cite(1, 'responsa'), cite(2, 'blog')], abstained: false, flags: [] } }]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    const marker = dialog.locator('a[data-cite-marker="2"]');
    await expect(marker).toHaveText('[2]');
    const href = await marker.getAttribute('href');
    expect(href).toMatch(/^#sadik-m\d+-cite-2$/);
    await marker.click();
    await expect(dialog.locator(`[data-source-type="blog"]`)).toBeFocused();
    expect(new URL(page.url()).hash).toBe('');
    await expect(dialog.locator('[data-source-type="blog"]')).toHaveAttribute('id', href!.slice(1));
  });

  test('markdown inside a streaming delta renders as it grows and survives the final replace', async ({ page }) => {
    await mockChat(
      page,
      sse([
        { event: 'delta', data: { text: 'תחילה **מודג' } },
        { event: 'delta', data: { text: 'ש** וסוף' } },
        { event: 'final', data: { text: 'תחילה **מודגש** וסוף', citations: [], abstained: false, flags: [] } },
      ]),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.locator('[data-answer] strong')).toHaveText('מודגש');
  });
});
