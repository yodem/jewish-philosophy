import { test, expect, type Page } from '@playwright/test';

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
