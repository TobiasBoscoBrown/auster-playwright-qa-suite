import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** FundProjectPage — a single project detail page at '/fund/<slug>'. */
export class FundProjectPage extends BasePage {
  readonly path: string;

  constructor(page: Page, path: string) {
    super(page);
    this.path = path;
  }

  get title(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  async expectDetailLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.footer).toBeVisible();
  }
}
