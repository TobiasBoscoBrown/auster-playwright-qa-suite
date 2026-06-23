import { test, expect } from '../../fixtures/test-fixtures';
import { ArticlePage } from '../../pages/ArticlePage';

/**
 * Magazine journey — listing renders cards; opening a card lands on a real
 * article with a title and a working "Share" affordance.
 */
test.describe('Magazine', () => {
  test('article cards render on the listing', async ({ magazinePage }) => {
    await magazinePage.open();
    await magazinePage.expectListingLoaded();
  });

  test('opening an article shows a title and byline', async ({ magazinePage, page }) => {
    await magazinePage.open();
    const href = await magazinePage.firstArticleHref();
    const slug = href.replace(/^https?:\/\/[^/]+/, '');

    const article = new ArticlePage(page, slug);
    const res = await article.open();
    expect(res.status()).toBeLessThan(400);
    await article.expectArticleLoaded();
  });

  test('home "view all" links into the magazine', async ({ homePage, page }) => {
    await homePage.open();
    await homePage.viewAllMagazineLink.click();
    await expect(page).toHaveURL(/\/magazine/);
  });
});
