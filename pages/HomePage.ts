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
    // TWO "view all" links exist on the home page (one -> /magazine, one -> /fund),
    // so we anchor strictly on the /magazine anchor carrying "view all" text.
    return this.page.locator('a[href="/magazine"]', { hasText: /view all/i }).first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  // --- Newsletter signup (home) --------------------------------------------

  async fillNewsletterEmail(email: string): Promise<void> {
    const input = this.newsletterEmailInput;
    // auster's home page hydrates continuously and swaps the signup node during
    // mount, so an explicit scrollIntoViewIfNeeded() races and throws
    // "element is not attached". We rely on Playwright's auto-waiting fill(),
    // which auto-scrolls AND auto-retries on detachment, after a web-first
    // visibility gate. No manual scroll.
    await expect(input).toBeVisible({ timeout: 15_000 });
    await input.fill(email);
    // Hydration can re-render and clear the field right after fill(), which made
    // checkValidity() read an empty value on WebKit. Web-first assert the value
    // actually stuck before any caller reads validity; re-fill once if it didn't.
    if (email !== '') {
      try {
        await expect(input).toHaveValue(email, { timeout: 5_000 });
      } catch {
        await input.fill(email);
        await expect(input).toHaveValue(email, { timeout: 5_000 });
      }
    }
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
