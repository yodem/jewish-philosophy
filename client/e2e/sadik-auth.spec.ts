import { test, expect, type Page } from '@playwright/test';
import { encode } from 'next-auth/jwt';
import { createHash } from 'node:crypto';
import { E2E_AUTH } from './fixtures/auth.mjs';
import { FINAL, QUESTION } from './fixtures/sadik-answer.mjs';

/**
 * Google sign-in against the e2e server that has Auth.js configured with throwaway values (playwright.config.ts).
 * Google is never contacted: the browser's request to accounts.google.com is intercepted and inspected. A signed-in
 * visitor is simulated with a session cookie encrypted with the throwaway AUTH_SECRET; history comes from the mock bridge.
 */

const BASE = process.env.E2E_AUTH_BASE_URL!;
test.use({ baseURL: BASE });

const DIALOG = 'שאלו את פרופ׳ צדיק (AI)';
const UID = createHash('sha256').update('e2e-google-sub').digest('hex');

async function openChat(page: Page) {
  await page.getByRole('button', { name: /שאלו את פרופ׳ צדיק/ }).click();
  return page.getByRole('dialog', { name: DIALOG });
}

async function signInAs(page: Page, uid = UID) {
  const value = await encode({ token: { uid }, secret: E2E_AUTH.AUTH_SECRET, salt: 'authjs.session-token', maxAge: 3600 });
  await page.context().addCookies([{ name: 'authjs.session-token', value, url: BASE, httpOnly: true, sameSite: 'Lax' }]);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/googletagmanager.com/**', (r) => r.abort());
  await page.route('**/linker.v3.js', (r) => r.fulfill({ contentType: 'text/javascript', body: '' }));
});

test('signed out: the header offers Google sign-in; it goes to Google with PKCE S256, state and scope openid', async ({ page }) => {
  let googleUrl: URL | null = null;
  await page.route('https://accounts.google.com/**', async (route) => {
    googleUrl = new URL(route.request().url());
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' });
  });
  await page.goto('/');
  const dialog = await openChat(page);
  const button = dialog.getByRole('button', { name: /התחברות/ });
  await expect(button).toBeVisible();
  await button.click();
  await expect.poll(() => googleUrl?.href ?? '').toContain('accounts.google.com');
  const url = googleUrl!;
  expect(url.pathname).toBe('/o/oauth2/v2/auth');
  expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  expect(url.searchParams.get('code_challenge')).toMatch(/^[\w-]{43}$/);
  expect(url.searchParams.get('state')).toBeTruthy();
  expect(url.searchParams.get('scope')).toBe('openid');
  expect(url.searchParams.get('client_id')).toBe(E2E_AUTH.AUTH_GOOGLE_ID);
  expect(url.searchParams.get('redirect_uri')).toBe(`${BASE}/api/auth/callback/google`);
  const names = (await page.context().cookies(BASE)).map((c) => c.name);
  expect(names).toEqual(expect.arrayContaining(['authjs.pkce.code_verifier', 'authjs.state', 'authjs.csrf-token']));
  for (const c of await page.context().cookies(BASE)) if (c.name.startsWith('authjs.')) expect(c.httpOnly, c.name).toBe(true);
});

test('Auth.js keeps its CSRF check and has no provider but Google', async ({ request }) => {
  const forged = await request.post('/api/auth/signin/google', { form: { callbackUrl: '/' }, maxRedirects: 0 });
  expect(forged.headers().location ?? '').not.toContain('accounts.google.com');
  const providers = await (await request.get('/api/auth/providers')).json();
  expect(Object.keys(providers)).toEqual(['google']);
});

test('the browser session object carries no user id', async ({ page }) => {
  await signInAs(page);
  await page.goto('/');
  const session = await page.evaluate(async () => (await fetch('/api/auth/session')).json());
  expect(Object.keys(session)).toEqual(['expires']);
  expect(JSON.stringify(session)).not.toContain(UID);
});

test('signed in: the rail lists the history from the bridge and opens a conversation; sign-out is offered', async ({ page }) => {
  await signInAs(page);
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.goto('/');
  const dialog = await openChat(page);
  const rail = dialog.getByRole('navigation', { name: 'שיחות' });
  await expect(rail.locator('.sc-rail-item')).toHaveCount(2);
  await rail.getByRole('button', { name: QUESTION }).click();
  await expect(dialog.locator('[data-question]')).toHaveText(QUESTION);
  await expect(dialog.locator('[data-group="quotes"] li')).toHaveCount(3);
  await expect(dialog.getByRole('button', { name: 'התנתקות' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: /התחברות/ })).toHaveCount(0);
});

test('signed in: a chat turn goes to the bridge as the google user, whatever the browser claims', async ({ page, request }) => {
  await signInAs(page);
  await page.goto('/');
  const dialog = await openChat(page);
  await page.route('**/api/sadik-chat', async (route) => {
    const body = route.request().postDataJSON();
    await route.continue({ postData: JSON.stringify({ ...body, user: { kind: 'google', id: 'f'.repeat(64) } }) });
  });
  await dialog.getByRole('textbox').fill('שאלה מחוברת');
  await dialog.getByRole('button', { name: 'שליחה', exact: true }).click();
  await expect(dialog.locator('[data-answer]')).toContainText(FINAL.text.slice(0, 20));
  const last = await (await request.get(`${process.env.E2E_BRIDGE_URL}/__last?path=/chat`)).json();
  expect(last.body.user).toEqual({ kind: 'google', id: UID });
  expect(last.body.message).toBe('שאלה מחוברת');
});

test('signed out on the configured server: history routes are 401', async ({ request }) => {
  const res = await request.post('/api/sadik-chat/history', { headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' }, data: {} });
  expect(res.status()).toBe(401);
});

test('sign-out clears the conversations kept in this browser', async ({ page }) => {
  await signInAs(page);
  await page.goto('/');
  const dialog = await openChat(page);
  await dialog.getByRole('textbox').fill('שאלה לפני יציאה');
  await dialog.getByRole('button', { name: 'שליחה', exact: true }).click();
  await expect(dialog.locator('[data-answer]')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('sadik-chat-v2'))).toContain('שאלה לפני יציאה');
  await dialog.getByRole('button', { name: 'התנתקות' }).click();
  await page.waitForLoadState('load');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sadik-chat-v2'))).toBeNull();
  await expect.poll(async () => (await page.context().cookies(BASE)).some((c) => c.name === 'authjs.session-token')).toBe(false);
});

test('a per-commit preview host starts sign-in on the canonical AUTH_URL origin (top-level navigation, no cross-origin fetch)', async ({ page }) => {
  let googleUrl: URL | null = null;
  await page.route('https://accounts.google.com/**', async (route) => {
    googleUrl = new URL(route.request().url());
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>stub</p>' });
  });
  const preview = BASE.replace('localhost', '127.0.0.1'); // not the AUTH_URL host
  await page.goto(`${preview}/`);
  const dialog = await openChat(page);
  await dialog.getByRole('button', { name: /התחברות/ }).click();
  await expect.poll(() => googleUrl?.href ?? '', { timeout: 15000 }).toContain('accounts.google.com');
  expect(googleUrl!.searchParams.get('redirect_uri')).toBe(`${BASE}/api/auth/callback/google`);
  expect(googleUrl!.searchParams.get('code_challenge_method')).toBe('S256');
});

test('the gate still redirects other Auth.js paths on a foreign host to the canonical origin', async ({ request }) => {
  const preview = BASE.replace('localhost', '127.0.0.1');
  const res = await request.get(`${preview}/api/auth/providers`, { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers().location).toBe(`${BASE}/api/auth/providers`);
});

test('sign-out discards in-flight work: a late answer neither shows nor restores the private conversation', async ({ page }) => {
  await signInAs(page);
  let releaseChat!: () => void;
  const chatGate = new Promise<void>((res) => (releaseChat = res));
  await page.route('**/api/sadik-chat', async (route) => {
    await chatGate;
    await route.fulfill({ status: 200, contentType: 'text/event-stream', body: `event: final\ndata: ${JSON.stringify(FINAL)}\n\n` });
  });
  let signOutSeen!: () => void;
  const signOutRequested = new Promise<void>((res) => (signOutSeen = res));
  await page.route('**/api/auth/signout', async (route) => {
    signOutSeen();
    await new Promise(() => {}); // keep the page here: the redirect after sign-out is not under test
  });
  await page.goto('/');
  const dialog = await openChat(page);
  await dialog.getByRole('textbox').fill('שאלה פרטית באמצע יציאה');
  await dialog.getByRole('button', { name: 'שליחה', exact: true }).click();
  await dialog.getByRole('button', { name: 'התנתקות' }).click();
  await signOutRequested;
  releaseChat();
  await page.waitForTimeout(800);
  await expect(dialog.locator('[data-answer]')).toHaveCount(0);
  await expect(dialog.getByText('שאלה פרטית באמצע יציאה')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('sadik-chat-v2'))).toBeNull();
});
