import { test, expect } from '../../fixtures/test-fixtures';
import { canonicalHref } from '../../utils/seo';

/**
 * Smoke pack — the fastest signal that the site is alive and core chrome renders.
 * Tagged @smoke so CI can run a sanity subset via `npm run test:smoke`.
 */
test.describe('Smoke @smoke', () => {
  test('home page loads with a 2xx status', async ({ homePage }) => {
    const res = await homePage.open();
    expect(res.status()).toBeLessThan(400);
  });

  test('document title and description are correct', async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveTitle(/auster network/i);
    await expect(page).toHaveTitle(/creatives thrive/i);
  });

  test('hero headline is visible', async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.heroHeading).toBeVisible();
  });

  test('about + latest-articles sections render', async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.aboutHeading).toBeVisible();
    await expect(homePage.latestArticlesHeading).toBeVisible();
  });

  test('footer is present with legal + social links intact', async ({ homePage }) => {
    await homePage.open();
    await homePage.expectFooterVisible();
    await homePage.expectFooterIntegrity();
  });

  test('canonical URL points at the production origin', async ({ homePage, page }) => {
    await homePage.open();
    const canonical = await canonicalHref(page);
    expect(canonical).toMatch(/^https:\/\/auster\.network/);
  });
});
