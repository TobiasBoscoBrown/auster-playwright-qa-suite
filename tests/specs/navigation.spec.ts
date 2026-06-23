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
    // The footer is below the fold and the legal link can be one of several
    // matches; scope to the footer and force the nav so the click is reliable.
    const privacy = page.locator('footer').getByRole('link', { name: /privacy policy/i }).first();
    // The footer hydrates and can swap nodes; click() auto-scrolls + auto-retries
    // on detachment, so we do NOT call scrollIntoViewIfNeeded (which races/throws).
    await expect(privacy).toBeVisible({ timeout: 15_000 });
    await privacy.click();
    await expect(page).toHaveURL(/\/legal\/privacy/);
    // NOTE: auster's legal pages expose MULTIPLE <h1>s (the "auster" logo is an
    // h1, plus the document heading) — a real markup smell logged in FINDINGS.md.
    // We assert the page rendered a visible top-level heading without tripping
    // strict mode by taking the first match.
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.locator('body')).toContainText(/privacy/i);
  });
});
