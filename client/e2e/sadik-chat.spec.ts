import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { FINAL, QUESTION, SHARE_ID } from './fixtures/sadik-answer.mjs';

/**
 * The Sadik chat in the browser. The site server talks to the mock bridge (e2e/mock-bridge.mjs, see
 * playwright.config.ts), so these tests never reach the real bridge. Tests that need a specific payload fulfil
 * POST /api/sadik-chat themselves.
 */

const BUTTON = 'שאלו את פרופ׳ צדיק';
const DIALOG = 'שאלו את פרופ׳ צדיק (AI)';
const DISCLOSURE = 'בינה מלאכותית שנבנתה מכתביו של פרופ׳ שלום צדיק — לא פרופ׳ צדיק עצמו';
const QUOTA_TEXT = 'שאלה אחת ביום ללא התחברות — התחברו כדי להמשיך';
const HEX32 = /^[0-9a-f]{32}$/;

type Cite = Record<string, unknown> & { n: number; source_type: string };

function sse(events: { event: string; data: unknown }[]): string {
  return events.map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`).join('');
}

function cite(n: number, source_type: string, extra: Record<string, unknown> = {}): Cite {
  return { n, chunk_id: `c${n}`, title: `מקור ${source_type}`, url: `https://example.com/${source_type}`, source_type, speaker: 'sadik', quote: null, ...extra };
}

async function mockChat(page: Page, body: string, status = 200) {
  const posted: { message: string; conversation_id: string }[] = [];
  await page.route('**/api/sadik-chat', async (route) => {
    posted.push(route.request().postDataJSON());
    await route.fulfill({ status, contentType: 'text/event-stream', body });
  });
  return posted;
}

async function mockAuth(page: Page, auth: 'disabled' | 'signed_out' | 'signed_in') {
  await page.route('**/api/sadik-chat/me', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ auth }) }));
}

async function openChat(page: Page) {
  await page.getByRole('button', { name: new RegExp(BUTTON) }).click();
  return page.getByRole('dialog', { name: DIALOG });
}

async function ask(page: Page, text: string) {
  const dialog = page.getByRole('dialog', { name: DIALOG });
  await dialog.getByRole('textbox').fill(text);
  await dialog.getByRole('button', { name: 'שליחה', exact: true }).click();
}

let ipSeq = 0;
test.beforeEach(async ({ page }, info) => {
  await page.route('**/googletagmanager.com/**', (r) => r.abort());
  // Each test is its own client for the per-IP limiter (the e2e server trusts x-forwarded-for).
  ipSeq += 1;
  await page.setExtraHTTPHeaders({ 'x-forwarded-for': `10.${100 + info.workerIndex}.${Math.floor(ipSeq / 250)}.${ipSeq % 250}` });
});

test.describe('Sadik chat: panel and empty state', () => {
  for (const path of ['/', '/responsa']) {
    test(`opens from any page (${path}); no always-visible disclaimer; the info button holds the disclosure`, async ({ page }) => {
      await page.goto(path);
      const dialog = await openChat(page);
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('heading', { name: 'שאלו את פרופ׳ צדיק' })).toBeVisible();
      await expect(dialog.getByText(DISCLOSURE)).toHaveCount(0);
      await dialog.getByRole('button', { name: 'אודות' }).click();
      await expect(dialog.getByRole('dialog', { name: 'אודות' }).getByText(DISCLOSURE, { exact: true })).toBeVisible();
      await expect(dialog.getByText('איך נבנות התשובות')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog.getByText(DISCLOSURE)).toHaveCount(0);
      await expect(dialog).toBeVisible();
    });
  }

  test('an empty conversation offers six starter questions; a click sends that question', async ({ page }) => {
    const posted = await mockChat(page, sse([{ event: 'final', data: FINAL }]));
    await page.goto('/');
    const dialog = await openChat(page);
    const starters = dialog.locator('[data-starter]');
    await expect(starters).toHaveCount(6);
    await starters.nth(1).click();
    await expect(dialog.locator('[data-question]')).toHaveText(QUESTION);
    await expect(dialog.locator('[data-answer]')).toContainText('הרמב״ם קובע כעיקרון');
    expect(posted).toHaveLength(1);
    expect(posted[0].message).toBe(QUESTION);
    expect(posted[0].conversation_id).toMatch(HEX32);
    await expect(dialog.locator('[data-starter]')).toHaveCount(0);
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

  test('sign-in is hidden when it is not configured and shown when it is', async ({ page }) => {
    await mockAuth(page, 'disabled');
    await page.goto('/');
    let dialog = await openChat(page);
    await expect(dialog.locator('[data-empty]')).toBeVisible();
    await expect(dialog.getByRole('button', { name: /התחברות/ })).toHaveCount(0);
    await page.unroute('**/api/sadik-chat/me');
    await mockAuth(page, 'signed_out');
    await page.reload();
    dialog = await openChat(page);
    await expect(dialog.getByRole('button', { name: /התחברות/ })).toBeVisible();
  });
});

test.describe('Sadik chat: the answer page and its glosses', () => {
  test('three groups, Hebrew letters matching the [n] markers, kinds and locators (through the mock bridge)', async ({ page }) => {
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, QUESTION);
    const answer = dialog.locator('[data-answer]');
    await expect(answer).toContainText('הרמב״ם קובע כעיקרון');
    await expect(dialog.getByText('טיוטה')).toHaveCount(0); // the final answer replaces the streamed draft
    await expect(dialog.locator('[data-group="quotes"] li')).toHaveCount(3);
    await expect(dialog.locator('[data-group="sources"] li')).toHaveCount(4);
    await expect(dialog.locator('[data-group="further"] li')).toHaveCount(3);
    for (const [n, letter] of [[1, 'א'], [4, 'ד'], [7, 'ז']] as const) {
      await expect(answer.locator(`[data-cite-marker="${n}"]`)).toHaveText(letter);
      await expect(dialog.locator(`[data-n="${n}"] .sc-gloss-mark`)).toHaveText(letter);
    }
    const quote = dialog.locator('[data-n="1"]');
    await expect(quote.locator('blockquote')).toContainText('רשות כל אדם נתונה לו');
    await expect(quote).toContainText('הרמב״ם');
    await expect(dialog.locator('[data-n="3"] [data-locator]')).toHaveText('עמ׳ 7');
    await expect(dialog.locator('[data-n="4"] [data-locator]')).toHaveText('▶ 05:14');
    await expect(dialog.locator('[data-n="4"]')).toContainText('הרצאה');
    await expect(dialog.locator('[data-n="5"]')).toContainText('שו״ת');
    await expect(dialog.locator('[data-group="further"] [data-locator]')).toHaveText('▶ 1:11:16');
  });

  test('a letter in the text scrolls to its gloss, focuses and highlights it', async ({ page }) => {
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, QUESTION);
    const marker = dialog.locator('[data-cite-marker="6"]');
    await expect(marker).toHaveAccessibleName(/הערה ו: קרשקש ושאלת ההכרח/);
    await marker.click();
    const gloss = dialog.locator('[data-n="6"]');
    await expect(gloss).toBeFocused();
    await expect(gloss).toHaveAttribute('data-flash', 'true');
    expect(new URL(page.url()).hash).toBe('');
  });

  test('source preview: click unfolds it in place with the snippet and the outbound link; close and Esc fold it; hover does not open it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, QUESTION);
    const src = dialog.locator('[data-n="4"] .sc-src');
    await src.click();
    const preview = dialog.locator('[data-preview]');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText('בשיעור הזה אנחנו עוברים');
    const link = preview.getByRole('link', { name: 'לפתיחת המקור' });
    await expect(link).toHaveAttribute('href', 'https://www.youtube.com/watch?v=abc123&t=314');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    // in place: it pushes the next entry down instead of covering it
    const pv = (await preview.boundingBox())!;
    const next = (await dialog.locator('[data-n="5"]').boundingBox())!;
    expect(next.y).toBeGreaterThanOrEqual(pv.y + pv.height - 1);
    expect(await preview.evaluate((el) => getComputedStyle(el).position)).toBe('static');
    await preview.getByRole('button', { name: 'סגירת התצוגה המקדימה' }).click();
    await expect(preview).toHaveCount(0);
    await expect(src).toBeFocused();
    await src.click();
    await page.keyboard.press('Escape');
    await expect(dialog.locator('[data-preview]')).toHaveCount(0);
    await expect(dialog).toBeVisible(); // Esc folded the preview, not the panel
    await dialog.locator('[data-n="7"] .sc-src').hover();
    await expect(dialog.locator('[data-preview]')).toHaveCount(0);
    // keyboard: Enter unfolds it, Tab reaches its close button and then the link
    await dialog.locator('[data-n="5"] .sc-src').focus();
    await page.keyboard.press('Enter');
    await expect(dialog.locator('[data-preview]')).toContainText('השואל מבקש להבין');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('לפתיחת המקור');
  });

  test('on a phone each paragraph is followed by its gloss strip; a letter unfolds the gloss in place', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, QUESTION);
    await expect(dialog.locator('[data-group="quotes"]')).toBeHidden();
    await expect(dialog.locator('[data-strip]')).toHaveCount(3);
    await expect(dialog.locator('[data-strip]').first().locator('[data-strip-n]')).toHaveCount(2);
    await dialog.locator('[data-cite-marker="3"]').click();
    const body = dialog.locator('[data-strip-body]');
    await expect(body).toBeVisible();
    await expect(body.locator('blockquote')).toContainText('ידיעת האל אינה תכונה');
    await expect(body.getByRole('link', { name: 'לפתיחת המקור' })).toHaveAttribute('href', /page=7/);
    await expect(body).toBeFocused();
    // the further-reading preview unfolds in place, not over the composer
    await dialog.locator('[data-group="further"] .sc-src').first().click();
    const preview = dialog.locator('[data-preview]');
    await expect(preview).toBeVisible();
    expect(await preview.evaluate((el) => getComputedStyle(el).position)).toBe('static');
  });

  test('on a phone the info opens as a bottom sheet inside the screen', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const dialog = await openChat(page);
    await dialog.getByRole('button', { name: 'אודות' }).click();
    const sheet = dialog.getByRole('dialog', { name: 'אודות' });
    await expect(sheet.getByText(DISCLOSURE, { exact: true })).toBeVisible();
    const box = (await sheet.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(375);
    expect(box.y + box.height).toBeLessThanOrEqual(812 + 1);
    await sheet.getByRole('button', { name: 'סגירה' }).click();
    await expect(sheet).toHaveCount(0);
  });

  test('a non-http source link is not rendered as a link; corpus HTML stays text', async ({ page }) => {
    await mockChat(
      page,
      sse([
        {
          event: 'final',
          data: {
            text: 'טענה[1]',
            citations: [cite(1, 'blog', { url: 'javascript:alert(1)', title: '<img src=x onerror=alert(1)>', snippet: '<b>לא תגית</b>' })],
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
    await dialog.locator('[data-n="1"] .sc-src').click();
    const preview = dialog.locator('[data-preview]');
    await expect(preview.getByRole('link')).toHaveCount(0);
    await expect(preview).toContainText('<b>לא תגית</b>');
    await expect(dialog.locator('img, b, script')).toHaveCount(0);
    await expect(dialog.locator('[data-n="1"] .sc-src')).toHaveText('<img src=x onerror=alert(1)>');
  });

  test('error event shows the Hebrew error as an alert', async ({ page }) => {
    await mockChat(page, sse([{ event: 'error', data: { message: 'אירעה שגיאה, נסו שוב מאוחר יותר' } }]));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.getByRole('alert')).toContainText('אירעה שגיאה, נסו שוב מאוחר יותר');
  });

  test('a malformed final event shows the controlled error and the panel survives', async ({ page }) => {
    await mockChat(page, sse([{ event: 'final', data: { text: 'x', citations: [null, { n: 1, title: { a: 1 } }], abstained: false } }]));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.getByRole('alert')).toContainText('אירעה שגיאה');
    await expect(dialog.getByRole('textbox')).toBeVisible();
  });

  test('markdown: paragraphs, bullets and bold as elements; no HTML passthrough; an uncited [n] stays a plain letter', async ({ page }) => {
    const text = '**הרמב״ם** קובע [1].\nשורה שנייה.\n\n- נקודה [1]\n- <b>לא תגית</b> ו-[9]\n\nסיום';
    await mockChat(page, sse([{ event: 'final', data: { text, citations: [cite(1, 'responsa')], abstained: false, flags: [] } }]));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    const answer = dialog.locator('[data-answer]');
    await expect(answer.locator('strong')).toHaveText('הרמב״ם');
    await expect(answer.locator(':scope > p')).toHaveCount(2);
    await expect(answer.locator(':scope > ul > li')).toHaveCount(2);
    await expect(answer).toContainText('<b>לא תגית</b>');
    await expect(answer.locator('b')).toHaveCount(0);
    await expect(answer.locator('[data-marker="9"]')).toHaveText('ט');
    await expect(answer.locator('button[data-cite-marker="9"]')).toHaveCount(0);
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

test.describe('Sadik chat: conversations', () => {
  test('follow-ups share the conversation id; a new conversation gets a new one', async ({ page }) => {
    const posted = await mockChat(page, sse([{ event: 'final', data: { ...FINAL, turn_id: undefined } }]));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'ראשונה');
    await expect(dialog.locator('[data-turn]')).toHaveCount(1);
    await expect(dialog.locator('[data-answer]')).toBeVisible();
    await ask(page, 'שנייה');
    await expect(dialog.locator('[data-turn]')).toHaveCount(2);
    await expect(dialog.locator('[data-answer]')).toHaveCount(2);
    expect(posted[0].conversation_id).toMatch(HEX32);
    expect(posted[1].conversation_id).toBe(posted[0].conversation_id);
    await dialog.getByRole('button', { name: 'שיחה חדשה' }).click();
    await expect(dialog.locator('[data-starter]')).toHaveCount(6);
    await ask(page, 'שלישית');
    await expect(dialog.locator('[data-answer]')).toBeVisible();
    expect(posted[2].conversation_id).toMatch(HEX32);
    expect(posted[2].conversation_id).not.toBe(posted[0].conversation_id);
  });

  test('the conversation persists across navigation and reload (localStorage, content only)', async ({ page }) => {
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה לשמירה');
    await expect(dialog.locator('[data-answer]')).toContainText('הרמב״ם קובע');
    // the panel is modal: close it, navigate client-side, reopen; the component stayed mounted
    await page.keyboard.press('Escape');
    await page.locator('a[href="/responsa"]').first().click();
    await page.waitForURL('**/responsa');
    await expect((await openChat(page)).getByText('שאלה לשמירה')).toBeVisible();
    const stored = await page.evaluate(() => localStorage.getItem('sadik-chat-v2'));
    expect(stored).toContain('שאלה לשמירה');
    expect(stored).not.toMatch(/token|session|sub|email/i);
    await page.reload();
    const reopened = await openChat(page);
    await expect(reopened.getByText('שאלה לשמירה')).toBeVisible();
    await expect(reopened.locator('[data-group="quotes"] li')).toHaveCount(3);
  });

  test('a round-1 transcript is migrated; malformed and non-JSON storage do not break the panel', async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      localStorage.setItem(
        'sadik-chat-v1',
        JSON.stringify([null, 5, { role: 'bot', text: 'x' }, { role: 'bot', text: 'y', citations: [null] }, { role: 'user', text: 'שאלה ישנה' }]),
      );
    });
    await page.goto('/');
    const dialog = await openChat(page);
    await expect(dialog.getByText('שאלה ישנה')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('sadik-chat-v2', '{not json'));
    await page.reload();
    await expect(await openChat(page)).toBeVisible();
    await page.evaluate(() =>
      localStorage.setItem(
        'sadik-chat-v2',
        JSON.stringify({
          current: 'e'.repeat(32),
          conversations: [
            { id: '../../x', title: 't', updated: 1, messages: [{ role: 'user', text: 'זדוני' }] },
            { id: 'e'.repeat(32), title: 't', updated: 1, messages: [{ role: 'user', text: 'תקין' }, { role: 'bot', text: '<img src=x onerror=alert(1)>', citations: [] }] },
          ],
        }),
      ),
    );
    await page.reload();
    const again = await openChat(page);
    await expect(again.getByText('תקין')).toBeVisible();
    await expect(again.getByText('זדוני')).toHaveCount(0);
    await expect(again.locator('img')).toHaveCount(0);
  });

  test('anonymous daily quota: the sign-in prompt replaces the answer and the composer locks', async ({ page }) => {
    await mockAuth(page, 'signed_out');
    await page.route('**/api/sadik-chat', (r) =>
      r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ reason: 'anon_daily_quota' }) }),
    );
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה שנייה היום');
    const prompt = dialog.locator('[data-quota]');
    await expect(prompt).toContainText(QUOTA_TEXT);
    await expect(prompt.getByRole('button', { name: 'התחברות עם Google' })).toBeVisible();
    // the field gives way to a sentence: the slip's button is the one action
    await expect(dialog.getByRole('textbox')).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'שליחה', exact: true })).toHaveCount(0);
    await expect(dialog.locator('[data-composer-locked]')).toHaveText('שאלות נוספות היום יתאפשרו אחרי התחברות.');
  });

  test('the quota through the real route and mock bridge; other 429s show the bridge message', async ({ page }) => {
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'RATE please');
    await expect(dialog.getByRole('alert')).toContainText('יותר מדי הודעות בדקה');
    await ask(page, 'QUOTA please');
    await expect(dialog.locator('[data-quota]')).toContainText(QUOTA_TEXT);
    await expect(dialog.locator('[data-quota]')).toContainText('אפשר לשאול שוב מחר.'); // sign-in not configured in e2e
    await dialog.getByRole('button', { name: 'שיחה חדשה' }).click();
    await expect(dialog.getByRole('textbox')).toHaveCount(0);
    await expect(dialog.locator('[data-composer-locked]')).toHaveText('אפשר לשאול שוב מחר.');
    await expect(dialog.locator('[data-starter="0"]')).toBeDisabled();
  });

  test('signed in: the rail lists conversations from history and opens one', async ({ page }) => {
    await mockAuth(page, 'signed_in');
    const calls: string[] = [];
    await page.route('**/api/sadik-chat/history', async (r) => {
      calls.push(r.request().url());
      await r.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { conversation_id: 'a'.repeat(32), title: QUESTION, last_ts: '2026-10-24T10:00:00Z', n_turns: 1 },
          { conversation_id: 'b'.repeat(32), title: 'שיחה שנייה', last_ts: '2026-10-23T10:00:00Z', n_turns: 2 },
          { conversation_id: 'bad', title: 'נפסלת' },
        ]),
      });
    });
    let opened: unknown = null;
    await page.route('**/api/sadik-chat/history/conversation', async (r) => {
      opened = r.request().postDataJSON();
      await r.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([{ turn_id: FINAL.turn_id, ts: '2026-10-24T10:00:00Z', question: QUESTION, final: FINAL }]),
      });
    });
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.goto('/');
    const dialog = await openChat(page);
    const rail = dialog.getByRole('navigation', { name: 'שיחות' });
    await expect(rail.locator('.sc-rail-item')).toHaveCount(2);
    await expect(rail.getByText('נפסלת')).toHaveCount(0);
    await rail.getByRole('button', { name: QUESTION }).click();
    await expect(dialog.locator('[data-question]')).toHaveText(QUESTION);
    await expect(dialog.locator('[data-group="sources"] li')).toHaveCount(4);
    expect(opened).toEqual({ conversation_id: 'a'.repeat(32) });
    await expect(rail.getByRole('button', { name: QUESTION })).toHaveAttribute('aria-current', 'true');
    await expect(dialog.getByRole('button', { name: 'התנתקות' })).toBeVisible();
    expect(calls.length).toBeGreaterThan(0);
  });
});

test.describe('Sadik chat: feedback, share, export', () => {
  async function mockFeedback(page: Page, status = 200) {
    const posted: unknown[] = [];
    await page.route('**/api/sadik-chat/feedback', async (route) => {
      posted.push(route.request().postDataJSON());
      await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ ok: status === 200 }) });
    });
    return posted;
  }
  const answer = sse([{ event: 'final', data: { text: 'תשובה לדירוג', citations: [], abstained: false, flags: [], turn_id: 't-123' } }]);

  test('thumbs post turn_id and value once; the vote survives a reload', async ({ page }) => {
    await mockChat(page, answer);
    const posted = await mockFeedback(page);
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await dialog.getByRole('button', { name: 'תשובה לא טובה' }).click();
    await expect(dialog.getByRole('button', { name: 'תשובה לא טובה' })).toHaveAttribute('aria-pressed', 'true');
    expect(posted).toEqual([{ turn_id: 't-123', value: 'down' }]);
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toBeDisabled();
    await page.reload();
    const reopened = await openChat(page);
    await expect(reopened.getByRole('button', { name: 'תשובה לא טובה' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('a failed vote leaves the answer unrated; answers without turn_id have no actions', async ({ page }) => {
    await mockChat(page, answer);
    await mockFeedback(page, 502);
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await dialog.getByRole('button', { name: 'תשובה טובה' }).click();
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toHaveAttribute('aria-pressed', 'false');
    await expect(dialog.getByRole('button', { name: 'תשובה טובה' })).toBeEnabled();
    await page.unroute('**/api/sadik-chat');
    await mockChat(page, sse([{ event: 'final', data: { text: 'ללא מזהה', citations: [], abstained: false, flags: [] } }]));
    await ask(page, 'עוד');
    await expect(dialog.getByText('ללא מזהה')).toBeVisible();
    await expect(dialog.locator('[data-turn]').nth(1).getByRole('button', { name: 'שיתוף' })).toHaveCount(0);
  });

  test('share: shows what becomes public, then a link to /sadik/share/{id} (through the mock bridge)', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, QUESTION);
    await dialog.getByRole('button', { name: 'שיתוף' }).click();
    const panel = dialog.locator('[data-share]');
    await expect(panel).toContainText('שאר השיחה ופרטים מזהים לא ייכללו בו');
    await panel.getByRole('button', { name: 'יצירת קישור' }).click();
    const link = panel.getByRole('textbox', { name: 'קישור לתשובה' });
    await expect(link).toHaveValue(new RegExp(`/sadik/share/${SHARE_ID}$`));
    await panel.getByRole('button', { name: 'העתקת הקישור' }).click();
    await expect(panel.getByRole('button', { name: 'הקישור הועתק' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(new RegExp(`/sadik/share/${SHARE_ID}$`));
  });

  test('export writes the conversation as Markdown and as JSON files', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, QUESTION);
    await expect(dialog.locator('[data-answer]')).toBeVisible();
    await dialog.getByRole('button', { name: 'ייצוא' }).click();
    const [md] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('menuitem', { name: /Markdown/ }).click()]);
    expect(md.suggestedFilename()).toBe('sadik-conversation.md');
    const mdText = readFileSync((await md.path())!, 'utf8');
    expect(mdText).toContain(`## ${QUESTION}`);
    expect(mdText).toContain('### ציטוטים');
    expect(mdText).toContain('[1]');
    await dialog.getByRole('button', { name: 'ייצוא' }).click();
    const [js] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('menuitem', { name: /JSON/ }).click()]);
    expect(js.suggestedFilename()).toBe('sadik-conversation.json');
    const data = JSON.parse(readFileSync((await js.path())!, 'utf8'));
    expect(data.turns[0].question).toBe(QUESTION);
    expect(data.turns[0].citations).toHaveLength(7);
  });

  test('on a phone the export sits in the "עוד" menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, QUESTION);
    await expect(dialog.locator('[data-answer]')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'ייצוא' })).toBeHidden();
    await dialog.getByRole('button', { name: 'עוד' }).click();
    const [md] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('menuitem', { name: /Markdown/ }).click()]);
    expect(md.suggestedFilename()).toBe('sadik-conversation.md');
  });
});

test.describe('shared answer page', () => {
  test('renders the question, answer and glosses read-only, noindex, no-store, no-referrer', async ({ page, request }) => {
    const res = await request.get(`/sadik/share/${SHARE_ID}`);
    expect(res.headers()['x-robots-tag']).toContain('noindex');
    expect(res.headers()['referrer-policy']).toBe('no-referrer');
    expect(res.headers()['cache-control']).toContain('no-store');
    await page.goto(`/sadik/share/${SHARE_ID}`);
    const main = page.locator('[data-shared-answer]');
    await expect(main.getByRole('heading', { name: QUESTION })).toBeVisible();
    await expect(main.locator('[data-answer]')).toContainText('הרמב״ם קובע כעיקרון');
    await expect(main.locator('[data-group="quotes"] li')).toHaveCount(3);
    await expect(main.getByText(DISCLOSURE)).toBeVisible();
    await expect(main.getByRole('button', { name: 'תשובה טובה' })).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('an unknown or malformed share id is not found', async ({ page }) => {
    for (const id of ['Zz99Zz99Zz99Zz99Zz99Zz', 'short', '..%2F..%2Fhistory']) {
      await page.goto(`/sadik/share/${id}`);
      await expect(page.locator('[data-shared-answer]')).toHaveCount(0);
    }
  });

  test('GA page_location carries no share id', async ({ page }) => {
    await page.goto(`/sadik/share/${SHARE_ID}?_vercel_share=secret-token`);
    const entries = await page.evaluate(() => JSON.stringify(((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>))));
    expect(entries).toContain('/sadik/share/_');
    expect(entries).not.toContain(SHARE_ID);
    expect(entries).not.toContain('secret-token');
  });
});

test.describe('GA4 events', () => {
  test('events carry names and numbers only: no message text, ids or share URLs', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width: 1280, height: 860 });
    await page.route('**/api/sadik-chat/feedback', (r) => r.fulfill({ contentType: 'application/json', body: '{"ok":true}' }));
    await page.goto('/');
    const dialog = await openChat(page);
    await dialog.locator('[data-starter="1"]').click();
    await expect(dialog.locator('[data-answer]')).toBeVisible();
    await dialog.getByRole('button', { name: 'תשובה טובה' }).click();
    await dialog.locator('[data-n="4"] .sc-src').click();
    await dialog.locator('[data-preview]').getByRole('link').evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await dialog.locator('[data-preview]').getByRole('link').click();
    await page.keyboard.press('Escape');
    await dialog.getByRole('button', { name: 'שיתוף' }).click();
    await dialog.getByRole('button', { name: 'יצירת קישור' }).click();
    await dialog.getByRole('button', { name: 'העתקת הקישור' }).click();
    await dialog.getByRole('button', { name: 'ייצוא' }).click();
    await Promise.all([page.waitForEvent('download'), dialog.getByRole('menuitem', { name: /JSON/ }).click()]);
    await dialog.getByRole('button', { name: 'שיחה חדשה' }).click();

    const events = await page.evaluate(() =>
      ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [])
        .map((a) => Array.from(a as ArrayLike<unknown>))
        .filter((a) => a[0] === 'event'),
    );
    const names = events.map((e) => e[1]);
    for (const name of ['chat_open', 'starter_click', 'message_send', 'answer_received', 'feedback', 'source_click', 'share', 'export', 'new_conversation']) {
      expect(names, name).toContain(name);
    }
    const received = events.find((e) => e[1] === 'answer_received')![2] as Record<string, number>;
    expect(received).toMatchObject({ n_quotes: 3, n_refs: 4, n_further: 3 });
    expect(typeof received.latency_ms).toBe('number');
    const dump = JSON.stringify(events);
    for (const secret of [QUESTION, 'רשות כל אדם', FINAL.turn_id, SHARE_ID, '/sadik/share', 'youtube.com']) {
      expect(dump, secret).not.toContain(secret);
    }
    for (const e of events) {
      for (const v of Object.values((e[2] as Record<string, unknown>) ?? {})) {
        expect(typeof v === 'number' || /^[a-z_]{1,16}$/.test(String(v)), JSON.stringify(e)).toBe(true);
      }
    }
  });

  test('quota_hit fires on the anonymous daily limit', async ({ page }) => {
    await page.route('**/api/sadik-chat', (r) => r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ reason: 'anon_daily_quota' }) }));
    await page.goto('/');
    const dialog = await openChat(page);
    await ask(page, 'שאלה');
    await expect(dialog.locator('[data-quota]')).toBeVisible();
    const names = await page.evaluate(() =>
      ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? []).map((a) => Array.from(a as ArrayLike<unknown>)).filter((a) => a[0] === 'event').map((a) => a[1]),
    );
    expect(names).toContain('quota_hit');
  });
});

test.describe('route guards (M4)', () => {
  const same = { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' };
  const routes = ['/api/sadik-chat', '/api/sadik-chat/feedback', '/api/sadik-chat/share'];

  test('cross-site, foreign Origin and header-less POSTs are 403; text/plain is 415', async ({ request }) => {
    for (const [i, path] of routes.entries()) {
      const ip = `10.7.${i}.1`;
      const cross = await request.post(path, { headers: { ...same, 'sec-fetch-site': 'cross-site', 'x-forwarded-for': ip }, data: {} });
      expect(cross.status(), `${path} cross-site`).toBe(403);
      const origin = await request.post(path, { headers: { 'content-type': 'application/json', origin: 'https://localhost.evil.com', 'x-forwarded-for': ip }, data: {} });
      expect(origin.status(), `${path} origin`).toBe(403);
      const bare = await request.post(path, { headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, data: {} });
      expect(bare.status(), `${path} no Origin, no Sec-Fetch-Site`).toBe(403);
      const plain = await request.post(path, { headers: { 'content-type': 'text/plain', 'sec-fetch-site': 'same-origin', 'x-forwarded-for': ip }, data: 'hi' });
      expect(plain.status(), `${path} text/plain`).toBe(415);
      expect(cross.headers()['access-control-allow-origin']).toBeUndefined();
    }
  });

  test('a rejected request still sets a session cookie; feedback and share need one', async ({ request }) => {
    const res = await request.post('/api/sadik-chat', { headers: { 'content-type': 'text/plain', 'sec-fetch-site': 'same-origin' }, data: 'hi' });
    expect(res.status()).toBe(415);
    expect(res.headers()['set-cookie']).toMatch(/^sadik_session=[0-9a-f]{32}; Path=\/; HttpOnly; SameSite=Lax/);
  });

  test('feedback and share without a session cookie are 403', async ({ playwright, baseURL }) => {
    for (const path of ['/api/sadik-chat/feedback', '/api/sadik-chat/share']) {
      const ctx = await playwright.request.newContext({ baseURL }); // fresh cookie jar: a rejection mints a session
      const res = await ctx.post(path, { headers: { ...same, 'x-forwarded-for': '10.8.0.1' }, data: { turn_id: 't', value: 'up' } });
      expect(res.status(), path).toBe(403);
      expect(await res.json()).toEqual({ error: 'no session' });
      await ctx.dispose();
    }
  });

  test('spoofed forwarded headers do not bypass the per-session limit (429)', async ({ request }) => {
    let limited = 0;
    for (let i = 0; i < 11; i++) {
      const res = await request.post('/api/sadik-chat', {
        headers: { ...same, 'x-forwarded-for': `10.2.0.${i}`, 'x-real-ip': `10.3.0.${i}` },
        data: { message: '' }, // rejected with 400 after the guards: no bridge turn
      });
      if (res.status() === 429) limited++;
    }
    expect(limited).toBe(1);
  });

  test('the sign-in state endpoint is read-only JSON with no CORS headers', async ({ request }) => {
    const res = await request.get('/api/sadik-chat/me');
    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual({ auth: 'disabled' });
    expect(res.headers()['access-control-allow-origin']).toBeUndefined();
  });
});
