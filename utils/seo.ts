import { type Page, expect } from '@playwright/test';

/** Read a <meta> content value by name or property. */
export async function metaContent(page: Page, key: string): Promise<string | null> {
  const byName = page.locator(`meta[name="${key}"]`);
  if (await byName.count()) return byName.first().getAttribute('content');
  const byProp = page.locator(`meta[property="${key}"]`);
  if (await byProp.count()) return byProp.first().getAttribute('content');
  return null;
}

export async function canonicalHref(page: Page): Promise<string | null> {
  const link = page.locator('link[rel="canonical"]');
  if (await link.count()) return link.first().getAttribute('href');
  return null;
}

/** Assert the core OpenGraph + Twitter card tags are present and non-empty. */
export async function assertSocialMeta(page: Page): Promise<void> {
  const ogTitle = await metaContent(page, 'og:title');
  const ogDesc = await metaContent(page, 'og:description');
  const ogImage = await metaContent(page, 'og:image');
  const ogType = await metaContent(page, 'og:type');
  const twCard = await metaContent(page, 'twitter:card');

  expect(ogTitle, 'og:title should be present').toBeTruthy();
  expect(ogDesc, 'og:description should be present').toBeTruthy();
  expect(ogImage, 'og:image should be present').toMatch(/^https?:\/\//);
  expect(ogType, 'og:type should be present').toBeTruthy();
  expect(twCard, 'twitter:card should be present').toBeTruthy();
}
