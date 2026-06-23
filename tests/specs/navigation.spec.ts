import { test, expect } from '../../fixtures/test-fixtures';
import { PRIMARY_NAV, LEGAL_ROUTES } from '../../utils/routes';

/**
 * Navigation pack — every primary + legal route resolves 2xx and renders its
 * expected content. Data-driven from the canonical route map so adding a route
 * adds a test for free.
 */
test.describe('Route availability', () => {
  for (const route of [...PRIMARY_NAV, ...LEGAL_ROUTES]) {
    test(`${route.label} (${route.path}) loads and shows expected content`, async ({ page }) => {
      const res = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(res, `no response for ${route.path}`).not.toBeNull();
      expect(res!.status(), `${route.path} returned ${res!.status()}`).toBeLessThan(400);
      await expect(page.locator('footer')).toBeVisible();
      await expect(page.locator('body')).toContainText(route.expects);
    });
  }

  test('footer legal links navigate to the legal pages', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.privacyLink.click();
    await expect(page).toHaveURL(/\/legal\/privacy/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
