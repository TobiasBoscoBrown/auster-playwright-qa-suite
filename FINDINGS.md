# auster.network — QA Findings (Live Production Audit)

> Findings from running the Playwright + axe-core suite in this repo against the
> **live** production site (`https://auster.network`). These are real, reproducible
> defects observed against the target application — **not** test-harness bugs.
>
> Per QA hygiene, the automated suite does **not** hard-fail its own CI on issues
> that live in the application under test (that would make the pipeline red for
> something outside our control). Instead, each finding below is:
> - surfaced in the HTML report (axe violation JSON is attached per page),
> - annotated on the relevant test run, and
> - baselined in `accessibility.spec.ts` (`KNOWN_ISSUES`) so any **new** regression
>   beyond this documented set still fails the build.
>
> Audited: 2026-06-23 · Tooling: Playwright 1.61, @axe-core/playwright 4.11 (WCAG 2 A/AA)

---

## 1. Icon-only buttons have no accessible name  ·  Severity: **High** (WCAG 2.1 4.1.2, A — critical)

**Where:** Home (`/`), Magazine (`/magazine`), Privacy (`/legal/privacy`) — site-wide nav/menu chrome.

**axe rule:** `button-name` (impact: *critical*).

**Detail:** One or more `<button data-slot="button">` elements in the fixed top
navigation render an icon only, with no inner text, `aria-label`, `aria-labelledby`,
or `title`. Screen-reader users hear an unlabeled "button" and cannot tell what it does.

Example node (Magazine):
`nav > … > button.h-9` — *"Element does not have inner text that is visible to screen readers; aria-label … does not exist or is empty."*

**Recommendation:** Add an `aria-label` (e.g. `aria-label="Open menu"` / `"Search"`)
to each icon-only control, or include visually-hidden text.

---

## 2. Insufficient colour contrast on key copy  ·  Severity: **Medium** (WCAG 2.1 1.4.3, AA — serious)

**Where:** Home (`/`) and Magazine (`/magazine`) hero + section headers.

**axe rule:** `color-contrast` (impact: *serious*).

**Detail (measured by axe):**
| Element | FG | BG | Ratio | Required |
|---|---|---|---|---|
| Hero sub-headline — *"auster is where creatives take back control…"* | `#999999` | `#ffffff` | **2.84:1** | 3:1 (large text) |
| *"If this speaks to you, join us"* | `#999999` | `#ffffff` | **2.84:1** | 3:1 |
| *"view all"* link | `#2b7fff` | `#ffffff` | **3.76:1** | 4.5:1 |
| *"view all"* link (alt bg) | `#2b7fff` | `#f8fafc` | **3.59:1** | 4.5:1 |
| Magazine sub-headline — *"Cultural insights and stories…"* | `#999999` | `#ffffff` | **2.84:1** | 3:1 |

**Recommendation:** Darken the grey sub-headline to ≥ `#767676` (≈ 4.5:1 on white) and
the blue link to ≥ `#1d6fff`/darker so it clears 4.5:1.

---

## 3. Multiple `<h1>` elements per page  ·  Severity: **Low** (semantics / SEO smell)

**Where:** Legal pages (`/legal/privacy`, `/legal/terms`) and others.

**Detail:** The "auster" wordmark/logo is marked up as an `<h1>` (twice, in two nav
variants) **in addition to** the document's real content `<h1>`. A page should have a
single, unique top-level heading. This also tripped Playwright strict-mode when
resolving "the page's H1" — the test was made resilient (scopes to the first match),
but the underlying markup is the issue.

**Recommendation:** Make the logo a `<div>`/`<a>` (or `role="img"` with an
`aria-label`), and reserve a single `<h1>` for the page's primary heading.

---

## 4. Newsletter email field lacks a programmatic label  ·  Severity: **Low/Medium** (WCAG 1.3.1 / 4.1.2)

**Where:** Home newsletter signup (`/`).

**Detail:** The signup input is correctly `type="email"` + `required` (native
validation works), but has **no** associated `<label>`, `aria-label`, or
`aria-labelledby` — only a `placeholder="your email here"`. Placeholders are not
accessible names. The page-object had to anchor on `input[type="email"]` rather than
an accessible-name lookup because of this.

**Recommendation:** Add `aria-label="Email address"` (or a visually-hidden `<label>`).

---

## Notes on test robustness (not auster defects)

The following were **test-side** brittleness fixed in this pass (documented for
transparency): a hydration race on the newsletter field (now web-first awaited),
client-rendered magazine cards needing an explicit wait, a strict-mode H1 collision,
a mobile nav-link lookup keyed on accessible name instead of `href`, and a serial
link-crawler that exceeded its timeout (now bounded + concurrent).
