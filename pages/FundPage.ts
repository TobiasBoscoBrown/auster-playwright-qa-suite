import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** FundPage — the funded-projects listing at '/fund'. */
export class FundPage extends BasePage {
  readonly path = '/fund';

  constructor(page: Page) {
    super(page);
  }

  get projectCards(): Locator {
    return this.page.locator('a[href*="/fund/"]');
  }

  async firstProjectHref(): Promise<string> {
    const links = await this.page
      .locator('a[href*="/fund/"]')
      .evaluateAll((els) =>
        els
          .map((e) => (e as HTMLAnchorElement).getAttribute('href') ?? '')
          .filter((h) => /\/fund\/[^/?#]+$/.test(h)),
      );
    expect(links.length, 'fund should list at least one project').toBeGreaterThan(0);
    return links[0];
  }

  async expectListingLoaded(): Promise<void> {
    await expect(this.footer).toBeVisible();
    const count = await this.page.locator('a[href*="/fund/"]').count();
    expect(count, 'expected project cards to render').toBeGreaterThan(0);
  }
}
