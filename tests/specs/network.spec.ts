import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Network / API pack — asserts the page navigation responses are healthy and
 * that no critical same-origin request fails while the home page loads.
 */
test.describe('Network health', () => {
  test('home navigation and same-origin requests succeed', async ({ page }) => {
    const failures: { url: string; status: number }[] = [];

    page.on('response', (res) => {
      const url = res.url();
      if (url.startsWith('https://auster.network') && res.status() >= 400) {
        failures.push({ url, status: res.status() });
      }
    });

    const nav = await page.goto('/', { waitUntil: 'networkidle' });
    expect(nav, 'navigation response').not.toBeNull();
    expect(nav!.status()).toBe(200);

    expect(
      failures,
      `same-origin requests returned errors: ${JSON.stringify(failures, null, 2)}`,
    ).toHaveLength(0);
  });

  test('static document is served with an HTML content-type', async ({ page }) => {
    const res = await page.goto('/', { waitUntil: 'domcontentloaded' });
    const ct = res?.headers()['content-type'] ?? '';
    expect(ct).toContain('text/html');
  });
});
