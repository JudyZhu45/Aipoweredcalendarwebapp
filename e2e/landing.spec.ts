import { test, expect } from '@playwright/test';

test.describe('Landing Page (Iteration 28)', () => {
  test('renders hero section with CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('smart');
    await expect(page.locator('a[href="/app"]').first()).toBeVisible();
  });

  test('nav links work', async ({ page }) => {
    await page.goto('/');
    const iterationsLink = page.locator('a[href="/iterations"]');
    if (await iterationsLink.count() > 0) {
      await iterationsLink.first().click();
      await expect(page).toHaveURL('/iterations');
    }
  });

  test('pricing section is visible after scroll', async ({ page }) => {
    await page.goto('/');
    const pricing = page.locator('text=Simple, honest pricing');
    await pricing.scrollIntoViewIfNeeded();
    await expect(pricing).toBeVisible();
  });

  test('CTA button navigates to /app', async ({ page }) => {
    await page.goto('/');
    await page.locator('a:has-text("Start for Free")').first().click();
    await expect(page).toHaveURL(/\/app/);
  });
});

test.describe('Iterations Gallery', () => {
  test('renders all iterations with sidebar', async ({ page }) => {
    await page.goto('/iterations');
    // Sidebar should list iterations
    await expect(page.locator('section#iteration-01')).toBeVisible();
    // Multiple iteration sections should exist
    const sections = page.locator('section[id^="iteration-"]');
    expect(await sections.count()).toBeGreaterThanOrEqual(25);
  });
});

test.describe('Auth Page', () => {
  test('shows login form at /app', async ({ page }) => {
    await page.goto('/app');
    // Should show auth page with email input
    await expect(page.locator('input[type="email"], input[placeholder*="email" i]').first()).toBeVisible();
  });
});
