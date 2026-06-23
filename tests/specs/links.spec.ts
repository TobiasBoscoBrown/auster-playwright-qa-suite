import { test, expect } from '../../fixtures/test-fixtures';
import { ALL_ROUTES } from '../../utils/routes';

/**
 * Broken-link crawler — gathers every in-domain link reachable from the main
 * routes and HEADs/GETs each one, asserting none return 4xx/5xx.
 *
 * Runs single-project (chromium) to avoid hammering production 5x over.
 */
test.describe('Internal link health', () => {
  test('no internal link returns 4xx/5xx', async ({ page, request }, testInfo) => {
    // Crawl once on chromium only to avoid hammering production across 5 projects.
    test.skip(testInfo.project.name !== 'chromium', 'link crawl runs once on chromium only');
    test.slow(); // crawling is inherently slower than a single page assertion.

    const discovered = new Set<string>();
    for (const route of ALL_ROUTES) {
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      const links = await page.locator('a[href]').evaluateAll((els) =>
        els.map((e) => (e as HTMLAnchorElement).href),
      );
      for (const href of links) {
        if (href.startsWith('https://auster.network') && !href.includes('#')) {
          discovered.add(href.split('?')[0]);
        }
      }
    }

    const urls = [...discovered];
    expect(urls.length, 'should have discovered internal links').toBeGreaterThan(3);

    const broken: { url: string; status: number }[] = [];
    for (const url of urls) {
      const res = await request.get(url, { maxRedirects: 3, timeout: 20_000 });
      if (res.status() >= 400) broken.push({ url, status: res.status() });
    }

    expect(broken, `broken internal links: ${JSON.stringify(broken, null, 2)}`).toHaveLength(0);
  });
});
