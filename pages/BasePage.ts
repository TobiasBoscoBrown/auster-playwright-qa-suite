import { type Page, type Locator, type Response, expect } from '@playwright/test';

/**
 * BasePage — shared behaviour for every page object.
 *
 * Encapsulates the global chrome that appears on every auster.network route
 * (footer nav, social links, newsletter signup) and exposes safe navigation
 * helpers that return the HTTP Response so specs can assert on status codes.
 */
export abstract class BasePage {
  readonly page: Page;
  /** Relative path this page lives at, e.g. '/magazine'. */
  abstract readonly path: string;

  constructor(page: Page) {
    this.page = page;
  }

  // --- Global landmarks (present site-wide) ---------------------------------

  get footer(): Locator {
    return this.page.locator('footer');
  }

  get newsletterHeading(): Locator {
    return this.page.getByText(/join our newsletter/i).first();
  }

  get newsletterEmailInput(): Locator {
    return this.page.getByRole('textbox', { name: /email/i }).or(
      this.page.locator('input[type="email"]'),
    ).first();
  }

  get newsletterSubmit(): Locator {
    return this.page.getByRole('button', { name: /^join$/i }).first();
  }

  get privacyLink(): Locator {
    return this.page.getByRole('link', { name: /privacy policy/i }).first();
  }

  get termsLink(): Locator {
    return this.page.getByRole('link', { name: /terms of service/i }).first();
  }

  get instagramLink(): Locator {
    return this.page.getByRole('link', { name: /instagram/i }).first();
  }

  // --- Navigation -----------------------------------------------------------

  /** Navigate to this page's path and return the main document Response. */
  async goto(): Promise<Response | null> {
    const res = await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    return res;
  }

  /** Navigate and assert a 2xx status in one call. */
  async open(): Promise<Response> {
    const res = await this.goto();
    expect(res, `Expected a navigation response for ${this.path}`).not.toBeNull();
    expect(res!.status(), `${this.path} should respond 2xx`).toBeLessThan(400);
    return res!;
  }

  // --- Shared assertions ----------------------------------------------------

  async expectFooterVisible(): Promise<void> {
    await expect(this.footer).toBeVisible();
  }

  /** Footer links to legal pages + social. */
  async expectFooterIntegrity(): Promise<void> {
    await expect(this.privacyLink).toHaveAttribute('href', /\/legal\/privacy/);
    await expect(this.termsLink).toHaveAttribute('href', /\/legal\/terms/);
    await expect(this.instagramLink).toHaveAttribute('href', /instagram\.com/);
  }

  /** Collect every in-domain href on the current page (deduped, no fragments/mailto). */
  async internalLinks(origin = 'https://auster.network'): Promise<string[]> {
    const hrefs = await this.page.locator('a[href]').evaluateAll(
      (els) => els.map((e) => (e as HTMLAnchorElement).href),
    );
    const set = new Set<string>();
    for (const href of hrefs) {
      if (!href.startsWith(origin)) continue;
      if (href.includes('#')) continue;
      set.add(href.split('?')[0]);
    }
    return [...set];
  }
}
