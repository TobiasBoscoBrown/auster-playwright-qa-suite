import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** MagazinePage — the article listing at '/magazine'. */
export class MagazinePage extends BasePage {
  readonly path = '/magazine';

  constructor(page: Page) {
    super(page);
  }

  /** Article cards are links into '/magazine/<slug>'. */
  get articleCards(): Locator {
    return this.page.locator('a[href*="/magazine/"]').filter({
      hasNot: this.page.locator('a[href$="/magazine"]'),
    });
  }

  /** Links pointing at a specific article slug (excludes the listing root). */
  articleLinks(): Locator {
    return this.page
      .locator('a[href*="/magazine/"]')
      .filter({ hasText: /\S/ });
  }

  /** Article-slug links (excludes the /magazine listing root and fragments). */
  get articleSlugLinks(): Locator {
    return this.page.locator('a[href*="/magazine/"]').filter({
      hasNot: this.page.locator('a[href$="/magazine"]'),
    });
  }

  async firstArticleHref(): Promise<string> {
    // Cards hydrate client-side; wait (web-first) until at least one is attached
    // before scraping hrefs, so WebKit/mobile don't read an empty listing.
    await expect(this.articleSlugLinks.first()).toBeAttached({ timeout: 15_000 });
    const links = await this.page
      .locator('a[href*="/magazine/"]')
      .evaluateAll((els) =>
        els
          .map((e) => (e as HTMLAnchorElement).getAttribute('href') ?? '')
          .filter((h) => /\/magazine\/[^/?#]+$/.test(h)),
      );
    expect(links.length, 'magazine should list at least one article').toBeGreaterThan(0);
    return links[0];
  }

  async expectListingLoaded(): Promise<void> {
    await expect(this.footer).toBeVisible();
    // Web-first wait: article cards render after hydration. Asserting on the
    // locator (not an instantaneous count) lets Playwright poll until they exist.
    await expect(this.articleSlugLinks.first()).toBeVisible({ timeout: 15_000 });
  }
}
