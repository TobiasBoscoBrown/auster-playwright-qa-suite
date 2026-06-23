import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Visual-regression pack (opt-in).
 *
 * Lives in its own Playwright project ("visual") so it never reds the main
 * pipeline before baselines exist. Seed locally with:
 *   npm run test:update-snapshots
 * then commit the generated playwright snapshots.
 */
test.describe('Visual regression @visual', () => {
  test('home hero matches baseline', async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.heroHeading).toBeVisible();
    // Mask the autoplaying hero video so it doesn't cause flaky diffs.
    await expect(homePage.page).toHaveScreenshot('home-full.png', {
      fullPage: false,
      mask: [homePage.page.locator('video')],
    });
  });
});
