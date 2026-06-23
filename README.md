# auster.network — Playwright E2E QA Automation Suite

[![Playwright E2E](https://github.com/TobiasBoscoBrown/auster-playwright-qa-suite/actions/workflows/playwright.yml/badge.svg)](https://github.com/TobiasBoscoBrown/auster-playwright-qa-suite/actions/workflows/playwright.yml)

A production-grade, end-to-end test framework for **[auster.network](https://auster.network)** — a live Next.js + Strapi product. Built with **Playwright + TypeScript** using a **Page Object Model** architecture, it runs cross-browser and on mobile viewports, checks accessibility with **axe-core**, crawls for broken links, validates SEO/social metadata, and publishes a live HTML report to GitHub Pages via **GitHub Actions**.

> The suite runs against the **real production site** — no mocks, no stubs. Mutating actions (newsletter signup) are intercepted so tests never create real records.

---

## Why this exists

This is a portfolio sample written for auster's QA Automation Engineer role. It mirrors the stack in the job description (Next.js, React, TS, Tailwind, shadcn/ui, Supabase, Vercel, Playwright, GitHub Actions) and demonstrates how I structure a maintainable, CI-driven test framework against a live target.

---

## Architecture (Page Object Model)

```
pages/            Page objects: locators + actions, one class per route type
  BasePage.ts       Shared chrome (footer, newsletter, social), navigation + link helpers
  HomePage.ts       Hero, about, newsletter signup
  MagazinePage.ts   Article listing + card discovery
  ArticlePage.ts    Single article (dynamic path)
  FundPage.ts       Project listing
  FundProjectPage.ts Single project (dynamic path)
  LegalPage.ts      Privacy / Terms
fixtures/
  test-fixtures.ts  Custom Playwright fixtures injecting page objects into specs
utils/
  routes.ts         Canonical route map (single source of truth, data-driven specs)
  data.ts           Email test-data factory (valid / invalid / empty)
  seo.ts            Meta + canonical readers and social-meta assertions
tests/specs/        Test specs, grouped by concern
.github/workflows/
  playwright.yml    CI: cross-browser run + artifacts + Pages report deploy
```

**Design principles**
- **Resilient locators** — roles, landmarks, and labels over brittle copy, so minor text changes don't break tests.
- **Data-driven** — navigation, SEO, and link specs iterate the canonical route map, so adding a route adds coverage for free.
- **Status-aware** — page objects return the HTTP `Response`, so specs assert real status codes, not just rendered DOM.
- **Safe against production** — the newsletter happy-path intercepts and fulfills the outbound request; no spam, no real signups.

---

## Coverage matrix

| Pack | Spec | What it proves |
|------|------|----------------|
| Smoke `@smoke` | `smoke.spec.ts` | Home 2xx, title/meta, hero, about/articles, footer + legal/social links, canonical |
| Navigation | `navigation.spec.ts` | Every primary + legal route returns 2xx and renders expected content; footer links navigate |
| Newsletter | `newsletter.spec.ts` | Empty + malformed email blocked by validation; valid email accepted + submit intercepted |
| Magazine | `magazine.spec.ts` | Article cards render; article page opens with title + share; "view all" deep-links |
| Fund | `fund.spec.ts` | Project cards render; project detail page loads with title |
| Responsive | `responsive.spec.ts` | No horizontal overflow on mobile; nav targets reachable on small screens |
| SEO / Social | `seo.spec.ts` | OpenGraph + Twitter card + canonical + viewport on key pages; Twitter handle configured |
| Links | `links.spec.ts` | Crawls all in-domain links across main routes — none return 4xx/5xx |
| Network | `network.spec.ts` | Home navigation 200; no same-origin request errors; HTML content-type |
| Accessibility | `accessibility.spec.ts` | axe-core (WCAG 2a/2aa) — zero serious/critical violations on home, magazine, legal |
| Visual (opt-in) | `visual.spec.ts` | `toHaveScreenshot` hero baseline — isolated `visual` project so CI stays green |

**Projects:** `chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 5), `mobile-safari` (iPhone 13), and an opt-in `visual` project. **176 tests** across 11 spec files.

---

## Running locally

```bash
npm ci
npx playwright install --with-deps

npm test                 # full suite, all projects
npm run test:chromium    # chromium only (fast feedback)
npm run test:smoke       # @smoke sanity pack
npm run test:a11y        # accessibility only
npm run test:ui          # interactive UI mode
npm run report           # open the last HTML report

# Visual regression (opt-in — seed baselines first, then commit them)
npm run test:update-snapshots
npm run test:visual
```

Target a different environment with `BASE_URL=https://staging.example.com npm test`.

---

## CI / CD

`.github/workflows/playwright.yml` runs on **push**, **PR**, **manual dispatch**, and a **nightly cron** (09:00 UTC) against production. Each run:

1. Installs deps (`npm ci`) and Playwright browsers (`--with-deps`).
2. Executes the full cross-browser + mobile suite against `https://auster.network`.
3. Uploads the **HTML report** as an artifact (30-day retention) and **traces** on failure.
4. On `main`, deploys the HTML report to **GitHub Pages** — a always-current live report URL.

**Live report:** https://tobiasboscobrown.github.io/auster-playwright-qa-suite/

---

## QA process & strategy

**Test pyramid fit.** This suite is the E2E tier — broad user-journey coverage against the deployed product. It complements (not replaces) unit/integration tests that live with the app.

**Sanity vs. regression.**
- **Sanity pack** (`@smoke`) — a sub-minute subset gating every deploy: is the site up, does core chrome render.
- **Regression pack** — the full matrix (cross-browser, a11y, SEO, link health) run nightly and on PR to catch drift in content, metadata, and dependencies.

**Risk-based prioritisation.** Coverage is weighted to the highest-impact journeys for a creative network: the newsletter conversion funnel, magazine/fund content discovery, accessibility (a public, inclusive brand), and SEO/social metadata (organic reach is core to the business).

**How AI accelerates this work.** I use AI to (1) enumerate edge cases for form validation (the malformed-email matrix in `data.ts` was generated and curated), (2) draft the first pass of data-driven specs from the route map, and (3) triage axe-core violations into actionable bug reports. Every generated case is reviewed, deduplicated, and verified against the live DOM before it lands — AI widens the net; human judgement keeps it trustworthy.

**Flake resistance.** Role/landmark locators, auto-waiting assertions, retries with trace-on-first-retry, video/screenshot on failure, and the autoplaying hero video masked out of visual diffs.

---

## Companion docs

- **[TEST-PLAN.md](./TEST-PLAN.md)** — structured test-case tables for the main workflows.
- **[BUG-REPORT-EXAMPLE.md](./BUG-REPORT-EXAMPLE.md)** — a worked write-up of a realistic, hard-to-spot defect.

---

## License

MIT © Tobias Brown
