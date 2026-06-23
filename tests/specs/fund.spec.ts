import { test, expect } from '../../fixtures/test-fixtures';
import { FundProjectPage } from '../../pages/FundProjectPage';

/** Fund journey — listing renders project cards and a detail page loads. */
test.describe('Fund', () => {
  test('project cards render on the listing', async ({ fundPage }) => {
    await fundPage.open();
    await fundPage.expectListingLoaded();
  });

  test('opening a project shows a detail page with a title', async ({ fundPage, page }) => {
    await fundPage.open();
    const href = await fundPage.firstProjectHref();
    const slug = href.replace(/^https?:\/\/[^/]+/, '');

    const project = new FundProjectPage(page, slug);
    const res = await project.open();
    expect(res.status()).toBeLessThan(400);
    await project.expectDetailLoaded();
  });
});
