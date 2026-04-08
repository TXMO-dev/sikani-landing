// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:4000';

test.describe('Sikani Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for loader to disappear
    await page.waitForSelector('#loader', { state: 'hidden', timeout: 10000 });
  });

  // ── Content Tests ─────────────────────────────────────────────────────

  test('has correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Sikani Technologies/);
  });

  test('hero section displays company name', async ({ page }) => {
    await expect(page.locator('.hero-badge')).toContainText('Sikani Technologies');
  });

  test('hero title contains key messaging', async ({ page }) => {
    await expect(page.locator('.hero-title')).toContainText('payments');
  });

  test('hero subtitle mentions Smart POS', async ({ page }) => {
    await expect(page.locator('.hero-subtitle')).toContainText('Smart POS');
  });

  test('navigation logo is visible', async ({ page }) => {
    await expect(page.locator('.nav-logo-text')).toBeVisible();
    await expect(page.locator('.nav-logo-text')).toContainText('SIKANI');
  });

  test('all navigation links are present', async ({ page }) => {
    const links = ['Product', 'Features', 'How it works', 'Security'];
    for (const text of links) {
      await expect(page.locator(`.nav-link:has-text("${text}")`)).toBeVisible();
    }
  });

  test('Get Started CTA is visible', async ({ page }) => {
    await expect(page.locator('.nav-cta')).toBeVisible();
  });

  // ── Product Section ───────────────────────────────────────────────────

  test('product section shows seller and buyer cards', async ({ page }) => {
    await expect(page.locator('.seller-card h3')).toContainText('Seller App');
    await expect(page.locator('.buyer-card h3')).toContainText('Buyer App');
  });

  // ── Features Section ──────────────────────────────────────────────────

  test('features section has 6 features', async ({ page }) => {
    const features = page.locator('.feature');
    await expect(features).toHaveCount(6);
  });

  // ── How It Works ──────────────────────────────────────────────────────

  test('how it works has 3 steps', async ({ page }) => {
    const steps = page.locator('.step');
    await expect(steps).toHaveCount(3);
  });

  // ── Security Section ──────────────────────────────────────────────────

  test('security section has 4 items', async ({ page }) => {
    const items = page.locator('.security-item');
    await expect(items).toHaveCount(4);
  });

  test('mentions AES-256 encryption', async ({ page }) => {
    await expect(page.locator('.security-item:first-child h4')).toContainText('AES-256');
  });

  // ── Download Section ──────────────────────────────────────────────────

  test('download section has app store buttons', async ({ page }) => {
    await expect(page.locator('.store-btn')).toHaveCount(2);
    await expect(page.locator('.store-name:has-text("App Store")')).toBeVisible();
    await expect(page.locator('.store-name:has-text("Google Play")')).toBeVisible();
  });

  // ── Footer ────────────────────────────────────────────────────────────

  test('footer contains company name', async ({ page }) => {
    await expect(page.locator('.footer-brand')).toContainText('Sikani Technologies');
  });

  test('footer has legal links', async ({ page }) => {
    await expect(page.locator('.footer-col:has-text("Legal")')).toBeVisible();
  });

  // ── SEO ───────────────────────────────────────────────────────────────

  test('has meta description', async ({ page }) => {
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('Sikani');
  });

  test('has Open Graph tags', async ({ page }) => {
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('Sikani');
  });

  test('has Twitter Card tags', async ({ page }) => {
    const card = await page.locator('meta[name="twitter:card"]').getAttribute('content');
    expect(card).toBe('summary_large_image');
  });

  // ── Responsive ────────────────────────────────────────────────────────

  test('mobile menu button visible on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('.nav-menu-btn')).toBeVisible();
  });

  test('desktop nav links hidden on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('.nav-links')).not.toBeVisible();
  });

  // ── Accessibility ─────────────────────────────────────────────────────

  test('images have alt attributes', async ({ page }) => {
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('menu button has aria-label', async ({ page }) => {
    const label = await page.locator('.nav-menu-btn').getAttribute('aria-label');
    expect(label).toBe('Menu');
  });

  // ── Performance ───────────────────────────────────────────────────────

  test('page loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(5000);
  });

  test('no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    // Filter out known non-critical errors (CORS, favicon, etc.)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('CORS') && !e.includes('404')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
