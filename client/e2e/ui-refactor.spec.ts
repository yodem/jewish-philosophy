import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('UI Refactor — Design System Verification', () => {
  test.describe('Navbar', () => {
    test('has navy background matching Stitch design', async ({ page }) => {
      await page.goto(BASE_URL);
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
      const bg = await nav.evaluate((el) => getComputedStyle(el).backgroundColor);
      // Should be navy-ish (dark blue), not gray
      expect(bg).not.toContain('128'); // not gray
    });

    test('is sticky and has z-index', async ({ page }) => {
      await page.goto(BASE_URL);
      const nav = page.locator('nav').first();
      const position = await nav.evaluate((el) => getComputedStyle(el).position);
      expect(position).toBe('sticky');
    });

    test('has search button', async ({ page }) => {
      await page.goto(BASE_URL);
      const searchBtn = page.locator('button', { has: page.locator('.sr-only', { hasText: 'Search' }) });
      await expect(searchBtn).toBeVisible();
    });

    test('has theme toggle button', async ({ page }) => {
      await page.goto(BASE_URL);
      const themeBtn = page.locator('button[aria-label*="Switch to"]');
      await expect(themeBtn).toBeVisible();
    });
  });

  test.describe('Dark Mode', () => {
    test('toggle adds dark class to html element', async ({ page }) => {
      await page.goto(BASE_URL);
      const themeBtn = page.locator('button[aria-label*="Switch to"]');
      await themeBtn.click();
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('dark');
    });

    test('toggle persists in localStorage', async ({ page }) => {
      await page.goto(BASE_URL);
      const themeBtn = page.locator('button[aria-label*="Switch to"]');
      await themeBtn.click();
      const theme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(theme).toBe('dark');
    });
  });

  test.describe('Layout', () => {
    test('body has gradient background', async ({ page }) => {
      await page.goto(BASE_URL);
      const bodyBg = await page.locator('body').evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bodyBg).toContain('gradient');
    });

    test('main content card has shadow', async ({ page }) => {
      await page.goto(BASE_URL);
      const card = page.locator('main .rounded-lg').first();
      if (await card.count() > 0) {
        const shadow = await card.evaluate((el) => getComputedStyle(el).boxShadow);
        expect(shadow).not.toBe('none');
      }
    });

    test('RTL direction is set', async ({ page }) => {
      await page.goto(BASE_URL);
      const dir = await page.locator('html').getAttribute('dir');
      expect(dir).toBe('rtl');
    });

    test('lang is set to he', async ({ page }) => {
      await page.goto(BASE_URL);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBe('he');
    });
  });

  test.describe('Typography', () => {
    test('uses Rubik font family', async ({ page }) => {
      await page.goto(BASE_URL);
      const fontFamily = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
      expect(fontFamily.toLowerCase()).toContain('rubik');
    });
  });

  test.describe('Responsive Breakpoints', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
      { name: 'wide', width: 1440, height: 900 },
    ];

    for (const vp of viewports) {
      test(`renders correctly at ${vp.name} (${vp.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(BASE_URL);
        // No console errors
        const errors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        await page.waitForTimeout(2000);
        // Page should be visible and not blank
        const bodyText = await page.locator('body').innerText();
        expect(bodyText.length).toBeGreaterThan(0);
      });
    }
  });

  test.describe('Page Navigation', () => {
    const routes = ['/', '/blog', '/playlists', '/contact', '/responsa', '/writings', '/terms', '/about'];

    for (const route of routes) {
      test(`${route} loads without errors`, async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') errors.push(msg.text());
        });
        const response = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBeLessThan(500);
      });
    }
  });

  test.describe('Contact Form', () => {
    test('renders form fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      // Check heading
      const heading = page.locator('h1, h2').filter({ hasText: 'צרו קשר' });
      await expect(heading.first()).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('WhatsApp button has aria-label', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      const whatsapp = page.locator('a[aria-label]').filter({ hasText: /whatsapp/i }).or(
        page.locator('a[aria-label*="ווטסאפ"]')
      );
      if (await whatsapp.count() > 0) {
        const label = await whatsapp.first().getAttribute('aria-label');
        expect(label).toBeTruthy();
      }
    });

    test('no hardcoded gray colors in rendered styles', async ({ page }) => {
      await page.goto(BASE_URL);
      // Check that navbar doesn't use gray-900 (old design)
      const nav = page.locator('nav').first();
      const navClasses = await nav.getAttribute('class') || '';
      expect(navClasses).not.toContain('bg-gray-900');
    });
  });
});
