import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * HomePage — the marketing landing page at '/'.
 * Hosts the hero, the about section, latest-articles/fund teasers, and the
 * primary newsletter signup that the newsletter spec exercises.
 */
export class HomePage extends BasePage {
  readonly path = '/';

  constructor(page: Page) {
    super(page);
  }

  /** The hero headline. Matched by role+name so copy tweaks to casing won't break it. */
  get heroHeading(): Locator {
    return this.page.getByRole('heading', { name: /antidote to the algorithm/i }).first();
  }

  get aboutHeading(): Locator {
    return this.page.getByRole('heading', { name: /about auster/i }).first();
  }

  get latestArticlesHeading(): Locator {
    return this.page.getByRole('heading', { name: /latest articles/i }).first();
  }

  get viewAllMagazineLink(): Locator {
    // Several "view all" links exist (magazine, fund, ...). Prefer the one that
    // actually points at /magazine; fall back to the first if markup changes.
    return this.page
      .locator('a[href="/magazine"]', { hasText: /view all/i })
      .or(this.page.getByRole('link', { name: /view all/i }))
      .first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  // --- Newsletter signup (home) --------------------------------------------

  async fillNewsletterEmail(email: string): Promise<void> {
    const input = this.newsletterEmailInput;
    // The home page hydrates late and can swap the signup node during mount,
    // which previously detached the element mid-scroll. Wait for a stable,
    // visible field (web-first) before interacting.
    await expect(input).toBeVisible({ timeout: 15_000 });
    await input.scrollIntoViewIfNeeded();
    await input.fill(email);
  }

  async submitNewsletter(): Promise<void> {
    await this.newsletterSubmit.click();
  }

  /** True if the email field uses native HTML5 validation (type=email / required). */
  async newsletterUsesNativeValidation(): Promise<boolean> {
    const type = await this.newsletterEmailInput.getAttribute('type');
    return type === 'email';
  }

  async isEmailFieldValid(): Promise<boolean> {
    return this.newsletterEmailInput.evaluate(
      (el) => (el as HTMLInputElement).checkValidity(),
    );
  }
}
