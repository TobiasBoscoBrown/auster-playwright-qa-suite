import { test, expect } from '../../fixtures/test-fixtures';
import { assertSocialMeta, canonicalHref, metaContent } from '../../utils/seo';
import { PRIMARY_NAV } from '../../utils/routes';

/**
 * SEO / social-meta pack — OpenGraph + Twitter card + canonical present on the
 * key indexable pages. Data-driven across the primary nav.
 */
test.describe('SEO & social metadata', () => {
  for (const route of PRIMARY_NAV.filter((r) => ['/', '/magazine', '/fund'].includes(r.path))) {
    test(`${route.label} exposes OpenGraph + Twitter + canonical`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await assertSocialMeta(page);

      const canonical = await canonicalHref(page);
      expect(canonical, `${route.path} should have a canonical`).toMatch(/^https:\/\/auster\.network/);

      const viewport = await metaContent(page, 'viewport');
      expect(viewport, 'responsive viewport meta should be present').toContain('width=device-width');
    });
  }

  test('Twitter handle + site name are configured', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(await metaContent(page, 'twitter:site')).toMatch(/@auster/i);
    expect(await metaContent(page, 'og:site_name')).toMatch(/auster/i);
  });
});
