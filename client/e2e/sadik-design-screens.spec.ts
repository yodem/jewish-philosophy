import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { FINAL, QUESTION } from './fixtures/sadik-answer.mjs';

/**
 * Design screenshots of the Sadik chat (not assertions of behaviour): run with
 *   SADIK_SCREENS_DIR=<dir> E2E_PORT=4600 pnpm exec playwright test e2e/sadik-design-screens.spec.ts
 * Files: <screen>-<theme>-<width>.png. Skipped unless SADIK_SCREENS_DIR is set.
 */
const DIR = process.env.SADIK_SCREENS_DIR;
test.skip(!DIR, 'set SADIK_SCREENS_DIR to render the design screens');

const sse = (events: { event: string; data: unknown }[]) => events.map((e) => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`).join('');

const WIDTHS = [
  { width: 375, height: 812 },
  { width: 1280, height: 860 },
];
const THEMES = ['light', 'dark'] as const;

async function setup(page: Page, theme: 'light' | 'dark', opts: { signedIn?: boolean } = {}) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
  await page.addInitScript((t) => {
    localStorage.setItem('theme', t);
    localStorage.removeItem('sadik-chat-v2');
  }, theme);
  await page.route('**/googletagmanager.com/**', (r) => r.abort());
  await page.route('**/api/sadik-chat/me', (r) =>
    r.fulfill({ contentType: 'application/json', body: JSON.stringify({ auth: opts.signedIn ? 'signed_in' : 'signed_out' }) }),
  );
  if (opts.signedIn) {
    await page.route('**/api/sadik-chat/history', (r) =>
      r.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([
          { conversation_id: 'a'.repeat(32), title: QUESTION, last_ts: '2026-10-24T10:00:00Z', n_turns: 1 },
          { conversation_id: 'b'.repeat(32), title: 'האם מותר לשנות את ההלכה כשהמציאות משתנה?', last_ts: '2026-10-23T10:00:00Z', n_turns: 2 },
          { conversation_id: 'c'.repeat(32), title: 'מדוע בחר רבי יהודה הלוי בכוזרי בחבר ולא בפילוסוף?', last_ts: '2026-10-22T10:00:00Z', n_turns: 3 },
          { conversation_id: 'd'.repeat(32), title: 'האם הקבלה והפילוסופיה סותרות זו את זו?', last_ts: '2026-10-21T10:00:00Z', n_turns: 1 },
        ]),
      }),
    );
    await page.route('**/api/sadik-chat/history/conversation', (r) =>
      r.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([{ turn_id: FINAL.turn_id, ts: '2026-10-24T10:00:00Z', question: QUESTION, final: FINAL }]),
      }),
    );
  }
  await page.route('**/api/sadik-chat', (r) =>
    r.fulfill({ contentType: 'text/event-stream', body: sse([{ event: 'final', data: FINAL }]) }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: /שאלו את פרופ׳ צדיק/ }).click();
  const dialog = page.getByRole('dialog', { name: 'שאלו את פרופ׳ צדיק (AI)' });
  await expect(dialog).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return dialog;
}

async function ask(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'שאלו את פרופ׳ צדיק (AI)' });
  await dialog.locator('[data-starter="1"]').click();
  await expect(dialog.locator('[data-answer]')).toBeVisible();
  await dialog.locator('[data-question]').first().scrollIntoViewIfNeeded();
  return dialog;
}

for (const size of WIDTHS) {
  for (const theme of THEMES) {
    test.describe(`${theme} ${size.width}`, () => {
      test.use({ viewport: size });
      const shot = async (page: Page, screen: string) => {
        mkdirSync(DIR!, { recursive: true });
        await page.mouse.move(1, 1);
        return page.screenshot({ path: `${DIR}/${screen}-${theme}-${size.width}.png` });
      };

      test('empty', async ({ page }) => {
        await setup(page, theme);
        await shot(page, 'empty');
      });

      test('answer', async ({ page }) => {
        await setup(page, theme);
        await ask(page);
        await shot(page, 'answer');
      });

      test('preview', async ({ page }) => {
        await setup(page, theme);
        const dialog = await ask(page);
        const src = dialog.locator('[data-group="sources"] .sc-src').first();
        await src.scrollIntoViewIfNeeded();
        await src.click();
        await expect(dialog.locator('[data-preview]')).toBeVisible();
        await shot(page, 'preview');
      });

      test('info', async ({ page }) => {
        await setup(page, theme);
        await page.getByTestId('sc-info').click();
        await shot(page, 'info');
      });

      test('quota', async ({ page }) => {
        const dialog = await setup(page, theme);
        await page.route('**/api/sadik-chat', (r) =>
          r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ reason: 'anon_daily_quota' }) }),
        );
        await dialog.locator('[data-starter="5"]').click();
        await expect(dialog.locator('[data-quota]')).toBeVisible();
        await shot(page, 'quota');
      });

      test('rail', async ({ page }) => {
        const dialog = await setup(page, theme, { signedIn: true });
        if (size.width < 900) await page.getByRole('button', { name: 'שיחות' }).click();
        await dialog.locator('.sc-rail-item').first().click();
        await expect(dialog.locator('[data-answer]')).toBeVisible();
        if (size.width < 900) await page.getByRole('button', { name: 'שיחות' }).click();
        await shot(page, 'rail');
      });
    });
  }
}
