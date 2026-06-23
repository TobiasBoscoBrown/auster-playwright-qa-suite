import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * ArticlePage — a single magazine article at '/magazine/<slug>'.
 * The path is dynamic, so it is supplied at construction time.
 */
export class ArticlePage extends BasePage {
  readonly path: string;

  constructor(page: Page, path: string) {
    super(page);
    this.path = path;
  }

  /** The article title is the page's primary H1. */
  get title(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  /** The "Share" affordance is unique to article pages. */
  get shareControl(): Locator {
    return this.page.getByText(/^share$/i).first();
  }

  /** Author + published date sit directly under the title in the byline block. */
  get byline(): Locator {
    return this.page.locator('main, article, body').first();
  }

  async expectArticleLoaded(): Promise<void> {
    await expect(this.title).toBeVisible();
    await expect(this.title).not.toBeEmpty();
    // An article page carries the unique "Share" affordance.
    await expect(this.shareControl).toBeVisible();
  }
}
