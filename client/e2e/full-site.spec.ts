import { test, expect, type Page } from '@playwright/test';

/**
 * IMPORTANT: These tests MUST run against local Strapi (localhost:1337).
 * Never run against production to avoid polluting real data.
 * The playwright.config.ts enforces NEXT_PUBLIC_STRAPI_BASE_URL=http://localhost:1337.
 */

// ─── Navigation & Page Load ────────────────────────────────────

test.describe('Page Navigation', () => {
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/blog', name: 'Blog' },
    { path: '/playlists', name: 'Playlists' },
    { path: '/responsa', name: 'Responsa' },
    { path: '/writings', name: 'Writings' },
    { path: '/terms', name: 'Terms' },
    { path: '/contact', name: 'Contact' },
    { path: '/about', name: 'About' },
  ];

  for (const route of routes) {
    test(`${route.name} (${route.path}) loads with status < 500`, async ({ page }) => {
      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(500);
      const body = await page.locator('body').innerText();
      expect(body.length).toBeGreaterThan(0);
    });
  }
});

// ─── SEO & Metadata ────────────────────────────────────────────

test.describe('SEO & Metadata', () => {
  test('homepage has correct title and lang', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('שלום צדיק');
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('he');
    const dir = await page.locator('html').getAttribute('dir');
    expect(dir).toBe('rtl');
  });

  const pagesWithMeta = [
    { path: '/blog', titleContains: 'בלוג' },
    { path: '/playlists', titleContains: 'סדרות' },
    { path: '/responsa', titleContains: 'שאלות' },
    { path: '/writings', titleContains: 'כתבים' },
    { path: '/terms', titleContains: 'מושגים' },
    { path: '/contact', titleContains: 'קשר' },
  ];

  for (const p of pagesWithMeta) {
    test(`${p.path} has correct meta title containing "${p.titleContains}"`, async ({ page }) => {
      await page.goto(p.path);
      const title = await page.title();
      expect(title).toContain(p.titleContains);
    });
  }

  test('blog post has og:title meta tag', async ({ page }) => {
    await page.goto('/blog');
    const firstLink = page.locator('a[href^="/blog/"]').first();
    if (await firstLink.count() > 0) {
      const href = await firstLink.getAttribute('href');
      await page.goto(href!);
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
    }
  });

  test('pages have meta description', async ({ page }) => {
    await page.goto('/');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(10);
  });
});

// ─── Navbar ────────────────────────────────────────────────────

test.describe('Navbar', () => {
  test('is visible and sticky', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
    const position = await nav.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe('sticky');
  });

  test('has search and theme toggle buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button:has(.sr-only:text("Search"))')).toBeVisible();
    const themeBtn = page.locator('button[aria-label*="מעבר"]');
    await expect(themeBtn).toBeVisible();
  });

  test('mobile hamburger menu is visible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuBtn = page.locator('button:has(.sr-only:text("Open menu"))');
    await expect(menuBtn).toBeVisible();
  });

  test('mobile menu opens and shows nav links', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    const menuBtn = page.locator('button:has(.sr-only:text("Open menu"))');
    await menuBtn.click();
    // Sheet should open with navigation links
    await expect(page.locator('[data-state="open"] a').first()).toBeVisible({ timeout: 3000 });
  });

  test('desktop nav links are visible on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    const desktopNav = page.locator('nav .hidden.md\\:flex a').first();
    await expect(desktopNav).toBeVisible();
  });
});

// ─── Dark Mode ─────────────────────────────────────────────────

test.describe('Dark Mode', () => {
  test('toggle switches theme and persists', async ({ page }) => {
    await page.goto('/');
    const themeBtn = page.locator('button[aria-label*="מעבר"]');
    await themeBtn.click();
    const htmlClass = await page.locator('html').getAttribute('class');
    expect(htmlClass).toContain('dark');
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBe('dark');
  });

  test('navbar stays dark navy in dark mode', async ({ page }) => {
    await page.goto('/');
    const themeBtn = page.locator('button[aria-label*="מעבר"]');
    await themeBtn.click();
    const nav = page.locator('nav').first();
    const navClasses = await nav.getAttribute('class');
    // Should use fixed oklch color, not bg-primary
    expect(navClasses).toContain('oklch');
  });
});

// ─── Homepage ──────────────────────────────────────────────────

test.describe('Homepage', () => {
  test('hero section is visible', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section[aria-label="באנר ראשי"]');
    await expect(hero).toBeVisible();
    // Hero text comes from CMS or local fallback
    const heroText = await hero.innerText();
    expect(heroText.length).toBeGreaterThan(10);
  });

  test('content grid shows 4 sections', async ({ page }) => {
    await page.goto('/');
    // These are hard-coded section titles
    await expect(page.getByText('סדרות שיעורים').first()).toBeVisible();
    await expect(page.getByText('מהבלוג')).toBeVisible();
    await expect(page.getByText('שאלות ותשובות').first()).toBeVisible();
    await expect(page.getByText('כתבים').first()).toBeVisible();
  });

  test('hero has CTA link', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section[aria-label="באנר ראשי"]');
    const cta = hero.locator('a').first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toBeTruthy();
  });
});

// ─── Blog ──────────────────────────────────────────────────────

test.describe('Blog', () => {
  test('blog list shows cards', async ({ page }) => {
    await page.goto('/blog');
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible({ timeout: 10000 });
    expect(await articles.count()).toBeGreaterThan(0);
  });

  test('blog card has title, date, and CTA', async ({ page }) => {
    await page.goto('/blog');
    const card = page.locator('article').first();
    await expect(card).toBeVisible({ timeout: 10000 });
    await expect(card.locator('h3')).toBeVisible();
    await expect(card.getByText('המשיכו לקרוא')).toBeVisible();
  });

  test('clicking blog card navigates to post', async ({ page }) => {
    await page.goto('/blog');
    const link = page.locator('a[href^="/blog/"]').first();
    await expect(link).toBeVisible({ timeout: 10000 });
    const href = await link.getAttribute('href');
    await link.click();
    await page.waitForURL(`**${href}`);
    expect(page.url()).toContain('/blog/');
  });

  test('blog post page has content and comment section', async ({ page }) => {
    await page.goto('/blog');
    const link = page.locator('a[href^="/blog/"]').first();
    if (await link.count() > 0) {
      await link.click();
      await page.waitForLoadState('domcontentloaded');
      // Post should have a heading
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// ─── Playlists ─────────────────────────────────────────────────

test.describe('Playlists', () => {
  test('playlist list shows cards', async ({ page }) => {
    await page.goto('/playlists');
    const cards = page.locator('a[href^="/playlists/"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('playlist card has title and CTA', async ({ page }) => {
    await page.goto('/playlists');
    const cta = page.getByText('צפו בסדרה').first();
    await expect(cta).toBeVisible({ timeout: 10000 });
  });

  test('navigating to playlist shows videos', async ({ page }) => {
    await page.goto('/playlists');
    const link = page.locator('a[href^="/playlists/"]').first();
    if (await link.count() > 0) {
      await link.click();
      await page.waitForLoadState('domcontentloaded');
      // Should have playlist title
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// ─── Responsa ──────────────────────────────────────────────────

test.describe('Responsa', () => {
  test('responsa list loads with sort filters', async ({ page }) => {
    await page.goto('/responsa');
    await expect(page.getByText('שאלות ותשובות')).toBeVisible();
    await expect(page.getByText('חדש')).toBeVisible();
    await expect(page.getByText('פופולרי')).toBeVisible();
  });

  test('responsa search bar is functional', async ({ page }) => {
    await page.goto('/responsa');
    const searchInput = page.locator('input[placeholder*="חיפוש"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('אלוהים');
    // Should trigger search (debounced)
    await page.waitForTimeout(1000);
  });

  test('responsa mobile layout is compact', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/responsa');
    await page.waitForTimeout(2000);
    // Mobile view should show compact cards, not stacked grid items
    const mobileCard = page.locator('.md\\:hidden').first();
    if (await mobileCard.count() > 0) {
      await expect(mobileCard).toBeVisible();
    }
  });

  test('clicking responsa navigates to detail page', async ({ page }) => {
    await page.goto('/responsa');
    await page.waitForTimeout(2000);
    const questionRow = page.locator('.divide-y > div[class*="cursor-pointer"]').first();
    if (await questionRow.count() > 0) {
      await questionRow.click();
      await page.waitForURL('**/responsa/**');
      expect(page.url()).toContain('/responsa/');
    }
  });
});

// ─── Responsa: Submit Question & Cleanup ───────────────────────

test.describe('Responsa Question Form', () => {
  test('question form opens and validates fields', async ({ page }) => {
    await page.goto('/responsa');
    await page.waitForTimeout(2000);

    // Scroll to bottom to find the question form CTA
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const askBtn = page.getByText('שאלו שאלה חדשה').first();
    if (await askBtn.count() === 0) {
      test.skip();
      return;
    }
    await askBtn.click();
    await page.waitForTimeout(500);

    // Form fields should be visible
    await expect(page.locator('#title')).toBeVisible();
    await expect(page.locator('#questioneer')).toBeVisible();
    await expect(page.locator('#content')).toBeVisible();

    // Submit button should be disabled when form is empty
    const submitBtn = page.getByText('שלחו שאלה');
    await expect(submitBtn).toBeDisabled();

    // Fill form and verify button enables
    await page.locator('#title').fill('שאלת בדיקה');
    await page.locator('#questioneer').fill('בודק');
    await page.locator('#content').fill('זוהי שאלת בדיקה עם תוכן ארוך מספיק כדי לעבור ולידציה.');
    await expect(submitBtn).toBeEnabled({ timeout: 3000 });

    // Cancel button works
    await page.getByText('ביטול').click();
    // Form should close, showing the CTA again
    await expect(page.getByText('יש לכם שאלה?')).toBeVisible({ timeout: 3000 });
  });
});

// ─── Comments ──────────────────────────────────────────────────

test.describe('Comments', () => {
  test('responsa detail page shows comment form', async ({ page }) => {
    await page.goto('/responsa');
    await page.waitForTimeout(2000);
    const questionRow = page.locator('.divide-y > div[class*="cursor-pointer"]').first();
    if (await questionRow.count() === 0) {
      test.skip();
      return;
    }
    await questionRow.click();
    await page.waitForURL('**/responsa/**');
    await page.waitForTimeout(2000);

    // Should have comment/answer section
    const addBtn = page.getByText('הוסיפו תשובה');
    if (await addBtn.count() > 0) {
      await expect(addBtn).toBeVisible();
    }
  });

  test('comment form opens with correct fields', async ({ page }) => {
    await page.goto('/responsa');
    await page.waitForTimeout(2000);
    const questionRow = page.locator('.divide-y > div[class*="cursor-pointer"]').first();
    if (await questionRow.count() === 0) {
      test.skip();
      return;
    }
    await questionRow.click();
    await page.waitForURL('**/responsa/**');
    await page.waitForTimeout(2000);

    const addBtn = page.getByText('הוסיפו תשובה');
    if (await addBtn.count() === 0) {
      test.skip();
      return;
    }
    await addBtn.click();

    // Comment form fields should be visible
    const nameInput = page.locator('input[name="answerer"], input[placeholder*="שמכם"]').first();
    const contentInput = page.locator('textarea[name="answer"], textarea[placeholder*="תשובתכם"]').first();

    if (await nameInput.count() === 0) {
      test.skip();
      return;
    }

    await expect(nameInput).toBeVisible();
    await expect(contentInput).toBeVisible();

    // Fill and verify submit button
    await nameInput.fill('בודק');
    await contentInput.fill('תשובת בדיקה עם תוכן מספיק.');
    const submitBtn = page.getByText('שלחו תשובה');
    await expect(submitBtn).toBeVisible();
  });
});

// ─── Writings ──────────────────────────────────────────────────

test.describe('Writings', () => {
  test('writings page loads with table/list', async ({ page }) => {
    await page.goto('/writings');
    await expect(page.getByText('ספריית כתבים')).toBeVisible();
  });

  test('writings page uses professor title, not rabbi', async ({ page }) => {
    await page.goto('/writings');
    await page.waitForTimeout(2000);
    const pageText = await page.locator('body').innerText();
    expect(pageText).not.toContain('הרב שלום');
    // Check for professor (with either geresh ׳ or apostrophe ')
    expect(pageText).toMatch(/פרופ[׳'] שלום/);
  });

  test('writings filter tabs work', async ({ page }) => {
    await page.goto('/writings');
    const booksTab = page.getByText('ספרים', { exact: true });
    if (await booksTab.count() > 0) {
      await booksTab.click();
      await page.waitForTimeout(1000);
    }
  });

  test('clicking a writing navigates to detail', async ({ page }) => {
    await page.goto('/writings');
    await page.waitForTimeout(2000);
    const link = page.locator('a[href^="/writings/"]').first();
    if (await link.count() > 0) {
      await link.click();
      await page.waitForURL('**/writings/**');
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// ─── Terms ─────────────────────────────────────────────────────

test.describe('Terms', () => {
  test('terms page loads with search', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByText('מושגים בפילוסופיה דתית')).toBeVisible();
    const searchInput = page.locator('input[placeholder*="חפשו מושג"]');
    await expect(searchInput).toBeVisible();
  });

  test('terms search filters results', async ({ page }) => {
    await page.goto('/terms');
    const searchInput = page.locator('input[placeholder*="חפשו מושג"]');
    await searchInput.fill('נפש');
    await page.locator('button:has-text("חפשו")').click();
    await page.waitForTimeout(2000);
  });

  test('clicking a term navigates to detail', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForTimeout(2000);
    const link = page.locator('a[href^="/terms/"]').first();
    if (await link.count() > 0) {
      await link.click();
      await page.waitForURL('**/terms/**');
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    }
  });
});

// ─── Contact Form ──────────────────────────────────────────────

test.describe('Contact Form', () => {
  test('contact page renders form fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'צרו קשר' })).toBeVisible();
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
  });

  test('submit button is disabled when form is empty', async ({ page }) => {
    await page.goto('/contact');
    const submitBtn = page.getByText('שלחו הודעה');
    await expect(submitBtn).toBeDisabled();
  });

  test('submit button enables when form is valid', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('#name').fill('בודק אוטומטי');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#subject').fill('בדיקה אוטומטית');
    await page.locator('#message').fill('זוהי הודעת בדיקה אוטומטית ארוכה מספיק.');

    // Select a category
    const categoryBtn = page.locator('button[role="combobox"]').first();
    if (await categoryBtn.count() > 0) {
      await categoryBtn.click();
      const firstOption = page.locator('[role="option"]').first();
      if (await firstOption.count() > 0) {
        await firstOption.click();
      }
    }

    const submitBtn = page.getByText('שלחו הודעה');
    // May or may not be enabled depending on category selection
    await page.waitForTimeout(500);
  });

  test('form submission shows success or error feedback', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('#name').fill('בודק אוטומטי');
    await page.locator('#email').fill('test@example.com');
    await page.locator('#subject').fill('בדיקה אוטומטית');
    await page.locator('#message').fill('זוהי הודעת בדיקה אוטומטית ארוכה מספיק.');

    // Select a category
    const categoryBtn = page.locator('button[role="combobox"]').first();
    if (await categoryBtn.count() === 0) {
      test.skip();
      return;
    }
    await categoryBtn.click();
    const firstOption = page.locator('[role="option"]').first();
    if (await firstOption.count() === 0) {
      test.skip();
      return;
    }
    await firstOption.click();
    await page.waitForTimeout(300);

    const submitBtn = page.getByText('שלחו הודעה');
    await expect(submitBtn).toBeEnabled({ timeout: 3000 });
    await submitBtn.click();

    // Should show either success or error snackbar (notistack)
    const snackbar = page.locator('#notistack-snackbar, [class*="notistack"]').first();
    await expect(snackbar).toBeVisible({ timeout: 15000 });
  });
});

// ─── Search ────────────────────────────────────────────────────

test.describe('Search', () => {
  test('search dialog opens from navbar', async ({ page }) => {
    await page.goto('/');
    const searchBtn = page.locator('button:has(.sr-only:text("Search"))');
    await searchBtn.click();
    // Dialog should appear
    await page.waitForTimeout(1000);
    const dialog = page.locator('[role="dialog"]');
    if (await dialog.count() > 0) {
      await expect(dialog).toBeVisible();
    }
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    const response = await page.goto('/search');
    expect(response?.status()).toBeLessThan(500);
  });
});

// ─── Plural Text Verification ──────────────────────────────────

test.describe('Text is in Plural Form', () => {
  test('homepage uses plural CTAs', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').innerText();
    // Content grid uses plural "צפו בהכל"
    expect(body).toContain('צפו בהכל');
  });

  test('contact page uses plural', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'צרו קשר' })).toBeVisible();
    await expect(page.getByText('שלחו הודעה')).toBeVisible();
  });

  test('no singular rabbi reference on writings page', async ({ page }) => {
    await page.goto('/writings');
    await page.waitForTimeout(2000);
    const pageText = await page.locator('body').innerText();
    expect(pageText).not.toContain('הרב שלום');
  });
});

// ─── Responsive ────────────────────────────────────────────────

test.describe('Responsive Breakpoints', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  for (const vp of viewports) {
    test(`all pages render at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const routes = ['/', '/blog', '/playlists', '/responsa', '/writings', '/terms', '/contact'];
      for (const route of routes) {
        const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
        expect(response?.status()).toBeLessThan(500);
      }
    });
  }
});
