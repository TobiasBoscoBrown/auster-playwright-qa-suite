# Test Plan — auster.network E2E Suite

**Scope:** End-to-end validation of the auster.network production web app across desktop (Chromium, Firefox, WebKit) and mobile (Pixel 5, iPhone 13) viewports.
**Out of scope:** Strapi CMS admin, payment processing, email deliverability (interception only), third-party embeds (Instagram/Mixcloud render).
**Environments:** Production (`https://auster.network`); overridable via `BASE_URL`.
**Entry criteria:** Site reachable, deploy completed. **Exit criteria:** Zero failed tests in the regression pack; zero serious/critical a11y violations.

---

## TC-SMOKE — Sanity pack (`@smoke`)

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| SMOKE-01 | Home loads | GET `/` | HTTP < 400 | P0 |
| SMOKE-02 | Title & description | Load `/`; read `<title>` | Matches "auster network … creatives thrive" | P1 |
| SMOKE-03 | Hero visible | Load `/` | "the antidote to the algorithm" heading visible | P0 |
| SMOKE-04 | Content sections | Load `/` | "about auster" + "latest articles" headings visible | P1 |
| SMOKE-05 | Footer integrity | Load `/` | Footer visible; privacy/terms/Instagram hrefs correct | P1 |
| SMOKE-06 | Canonical | Load `/`; read canonical | Points to `https://auster.network` | P2 |

## TC-NAV — Route availability

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| NAV-01..08 | Each route loads | GET each of `/`, `/fund`, `/magazine`, `/opportunities`, `/bazaar`, `/events`, `/legal/privacy`, `/legal/terms` | HTTP < 400; footer visible; expected content present | P0 |
| NAV-09 | Footer → legal | Click "privacy policy" in footer | URL becomes `/legal/privacy`; H1 visible | P1 |

## TC-NEWS — Newsletter signup

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| NEWS-01 | Empty blocked | Submit with empty email | Field invalid; no navigation; field still visible | P0 |
| NEWS-02 | Malformed blocked | Enter each of 5 malformed emails | `checkValidity()` false for each | P1 |
| NEWS-03 | Valid happy path | Intercept POST; enter valid email; submit | Field valid; outbound request intercepted + fulfilled (no real record) | P0 |

## TC-MAG — Magazine journey

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| MAG-01 | Cards render | Load `/magazine` | ≥1 article card link present | P0 |
| MAG-02 | Article opens | Open first article slug | HTTP < 400; H1 title visible + non-empty; "Share" visible | P0 |
| MAG-03 | Home deep-link | Click "view all" on home | URL contains `/magazine` | P2 |

## TC-FUND — Fund journey

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| FUND-01 | Cards render | Load `/fund` | ≥1 project card link present | P0 |
| FUND-02 | Detail opens | Open first project slug | HTTP < 400; H1 title + footer visible | P1 |

## TC-RESP — Responsive

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| RESP-01 | No overflow | Load `/` on mobile | `scrollWidth - clientWidth` ≤ 2px | P1 |
| RESP-02 | Nav reachable | Load `/` on mobile | magazine/fund links present with valid href | P2 |

## TC-SEO — SEO & social metadata

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| SEO-01..03 | OG/Twitter/canonical | For `/`, `/magazine`, `/fund` | og:title/description/image/type, twitter:card, canonical, viewport all present | P1 |
| SEO-04 | Handles | Load `/` | twitter:site `@auster…`; og:site_name contains "auster" | P2 |

## TC-LINK — Link health

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| LINK-01 | No broken internal links | Crawl all in-domain links across main routes; GET each | None return 4xx/5xx | P0 |

## TC-NET — Network health

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| NET-01 | Clean home load | Load `/` to networkidle; watch responses | Nav 200; no same-origin 4xx/5xx | P1 |
| NET-02 | Content-type | Load `/` | `text/html` content-type | P2 |

## TC-A11Y — Accessibility (axe-core, WCAG 2a/2aa)

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| A11Y-01 | Home | Run axe on `/` | 0 serious/critical violations (full report attached) | P0 |
| A11Y-02 | Magazine | Run axe on `/magazine` | 0 serious/critical violations | P1 |
| A11Y-03 | Legal | Run axe on `/legal/privacy` | 0 serious/critical violations | P1 |

## TC-VIS — Visual regression (opt-in)

| ID | Title | Steps | Expected | Priority |
|----|-------|-------|----------|----------|
| VIS-01 | Hero baseline | Screenshot home (video masked) | Matches committed baseline within 2% pixel ratio | P2 |
