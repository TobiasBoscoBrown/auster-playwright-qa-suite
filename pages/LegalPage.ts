import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/** LegalPage — privacy ('/legal/privacy') or terms ('/legal/terms'). */
export class LegalPage extends BasePage {
  readonly path: string;

  constructor(page: Page, path: '/legal/privacy' | '/legal/terms') {
    super(page);
    this.path = path;
  }

  get heading(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.footer).toBeVisible();
  }
}
