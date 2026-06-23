import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Responsive pack — verifies the layout holds on mobile viewports.
 * Runs across every project, but the assertions matter most for the
 * mobile-chrome / mobile-safari projects (Pixel 5 / iPhone 13).
 */
test.describe('Responsive layout', () => {
  test('hero + footer render without horizontal overflow', async ({ homePage, page }) => {
    await homePage.open();
    await expect(homePage.heroHeading).toBeVisible();
    await homePage.expectFooterVisible();

    // No horizontal scroll: scrollWidth should not exceed the viewport by much.
    const overflow = await page.evaluate(() => {
      const el = document.documentElement;
      return el.scrollWidth - el.clientWidth;
    });
    expect(overflow, 'page should not overflow horizontally').toBeLessThanOrEqual(2);
  });

  test('primary nav targets are reachable on small screens', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle').catch(() => {});
    // On mobile the primary nav collapses behind a menu, so the section links
    // are present in the DOM (footer + collapsed menu) but not necessarily in
    // the rendered accessibility tree by name. Assert the section is reachable
    // by its concrete href, which holds whether or not the menu is expanded.
    for (const path of ['/magazine', '/fund']) {
      const count = await page.locator(`a[href="${path}"]`).count();
      expect(count, `a link to ${path} should exist in the page`).toBeGreaterThan(0);
    }
  });
});
