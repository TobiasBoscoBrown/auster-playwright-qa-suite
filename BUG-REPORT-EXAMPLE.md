# Bug Report — Magazine article meta tags collapse to generic site title (SEO/social regression)

| Field | Value |
|-------|-------|
| **ID** | AUS-QA-014 |
| **Severity** | Major (S2) |
| **Priority** | High (P1) |
| **Component** | Magazine — article detail (`/magazine/<slug>`) |
| **Environment** | Production — `https://auster.network`, Next.js (Vercel), Strapi CMS |
| **Discovered by** | Automated SEO/social-meta pack + manual triage |
| **Status** | Open |
| **Affects** | Organic search ranking, social link-preview cards (LinkedIn, X, WhatsApp, iMessage) |

---

## Summary

On magazine **article** pages, the OpenGraph/Twitter `og:title`, `og:image:alt`, and `twitter:title` collapse to the generic site title **"auster network"** instead of the specific article title, while `og:description` and the canonical URL *are* correctly article-specific. The result is a mismatched social card: a unique description under a generic, branded-only title, with a generic OG image. This is the kind of partial-correctness defect that passes a casual eyeball check (the page renders fine, the `<title>`-ish text looks plausible) but silently degrades every shared link and rich result.

---

## Why it's difficult to catch

1. **The page looks perfect to a user** — the H1, byline, and body all render the right content. Nothing visually wrong.
2. **It's partially correct** — `og:description` and `canonical` *are* article-specific, so a quick "is OG present?" check passes. Only a field-by-field comparison against the listing exposes the title/image mismatch.
3. **It only surfaces off-site** — the damage shows in Google's SERP snippet and third-party unfurlers, never in the app itself. No console error, no failed request, no 4xx.
4. **It's data-shaped** — likely a fallback in the metadata resolver firing when a Strapi field (article `seoTitle` / `ogImage`) is empty, so it reproduces only for *some* articles, making it look intermittent.

---

## Steps to reproduce

1. Open the magazine listing: `https://auster.network/magazine`.
2. Note an article's listing title, e.g. *"The creative's exit: When to walk away from the 'great opportunity'"*.
3. Open that article: `/magazine/the-creatives-exit-when-to-walk-away-from-the-great-opportunity`.
4. View source / inspect `<head>`, or paste the URL into a social debugger (e.g. opengraph.xyz, LinkedIn Post Inspector).
5. Compare `og:title` / `twitter:title` against the article's real title.

---

## Expected

`og:title` and `twitter:title` equal the **article's** title; `og:image` is the **article's** hero image (with a matching `og:image:alt`). The social card and the SERP result identify the specific piece of content.

## Actual

`og:title` = `auster network` (generic), `og:image` = the default site image, `og:image:alt` = `auster network`. `og:description` and `canonical` are correctly article-specific — producing an inconsistent, generic-titled card for unique content.

```
title:                 auster network
meta og:title:         auster network            ← should be the article title
meta twitter:title:    auster network            ← should be the article title
meta og:image:         https://auster.network/images/auster.webp   ← should be the article image
meta og:description:   In a world obsessed with networking, we're constantly tempted…  ← correct
canonical:             https://auster.network/magazine/the-creatives-exit-…           ← correct
```

---

## Evidence

- **Automated:** the SEO pack asserts social-meta *presence* across key pages (green), and the regression that would have caught this is the stricter **per-article title-equality** assertion proposed below. The raw `<head>` capture above is attached to the run.
- **Manual:** social-debugger screenshot showing the generic card. (Attach in tracker.)

---

## Suspected root cause

The article route's `generateMetadata()` resolves `description` and `canonical` from the article record but falls back to the **layout-level default** for `title` and `openGraph.images` when the Strapi `seoTitle` / `ogImage` fields are unset — so the per-article values never override the site default for those keys.

---

## Suggested fix

In the article route's metadata resolver, derive `title`, `openGraph.title`, `twitter.title` from the article's headline (falling back to the headline, *not* the site name), and set `openGraph.images` to the article hero with a descriptive `alt`. Backfill empty Strapi `ogImage` fields.

## Regression test to add (Playwright)

```ts
test('article OG/Twitter title equals the article title', async ({ page }) => {
  await page.goto('/magazine');
  const card = page.locator('a[href*="/magazine/"]').first();
  const expected = (await card.innerText()).split('\n')[0].trim();
  await card.click();
  await expect(page).toHaveURL(/\/magazine\/.+/);
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  expect(ogTitle?.toLowerCase()).toContain(expected.slice(0, 20).toLowerCase());
});
```

This converts a silent, off-site SEO leak into a hard, repeatable gate.

---

## Additional live-site findings

A full set of accessibility findings from running this suite against production
(`https://auster.network`) is documented in **[FINDINGS.md](./FINDINGS.md)**, including:

- **High** — icon-only navigation buttons with no accessible name (`button-name`, WCAG 4.1.2).
- **Medium** — sub-headline and "view all" link colour contrast below AA (`color-contrast`, WCAG 1.4.3).
- **Low** — multiple `<h1>` per page (logo marked up as `<h1>`); newsletter email field missing a programmatic label.

These are surfaced as non-blocking annotations in the suite (baselined in
`tests/specs/accessibility.spec.ts`) so CI stays green on third-party defects while
any **new** regression beyond the documented baseline still fails the build.
