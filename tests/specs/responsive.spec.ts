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
    // The footer/nav exposes links to the main sections; assert they exist and
    // are in the accessibility tree regardless of whether nav collapses.
    for (const name of [/magazine/i, /fund/i]) {
      await expect(page.getByRole('link', { name }).first()).toHaveAttribute('href', /\//);
    }
  });
});
