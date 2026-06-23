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

  async firstArticleHref(): Promise<string> {
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
    const count = await this.page
      .locator('a[href*="/magazine/"]')
      .count();
    expect(count, 'expected article cards to render').toBeGreaterThan(0);
  }
}
