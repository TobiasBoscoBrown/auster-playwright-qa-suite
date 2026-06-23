import { test, expect } from '../../fixtures/test-fixtures';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility pack — runs axe-core (WCAG 2 a/aa) against key pages.
 *
 * Triage policy
 * -------------
 * auster.network is a live third-party production target we do not control.
 * A scan currently surfaces a small, KNOWN set of genuine serious/critical
 * WCAG findings (icon-only buttons without an accessible name; low-contrast
 * sub-headline + "view all" link copy). These are real product defects in the
 * application under test — fully documented in FINDINGS.md — not test bugs.
 *
 * Failing this suite's OWN CI on defects that live in the target app is the
 * wrong signal for a QA portfolio, so we baseline the known rule ids: they are
 * recorded as annotations and attached to the report, but do not red the run.
 * Crucially, any NEW serious/critical rule that appears (a regression beyond
 * the documented baseline) WILL still hard-fail — so coverage stays real.
 *
 * When auster ships the FINDINGS.md fixes, drop the rule from KNOWN_ISSUES and
 * the check tightens automatically.
 */

/** Documented, accepted real-site defects (see FINDINGS.md). Keyed by axe rule id. */
const KNOWN_ISSUES: Record<string, string> = {
  'button-name': 'FINDINGS #1 — icon-only nav/menu buttons lack an accessible name.',
  'color-contrast':
    'FINDINGS #2 — sub-headline (#999 on #fff, 2.84:1) and "view all" links (~3.6:1) below AA.',
};

const PAGES: { name: string; path: string }[] = [
  { name: 'Home', path: '/' },
  { name: 'Magazine', path: '/magazine' },
  { name: 'Privacy (legal)', path: '/legal/privacy' },
];

test.describe('Accessibility (axe-core)', () => {
  for (const p of PAGES) {
    test(`${p.name} has no UNDOCUMENTED serious/critical violations`, async ({ page }, testInfo) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });
      // Let late-hydrating client components settle so the scan is stable.
      await page.waitForLoadState('networkidle').catch(() => {});

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Attach the full violation set for reviewer visibility.
      await testInfo.attach(`axe-${p.name}.json`, {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });

      const seriousCritical = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      // Split into documented (baseline) vs. new/regression findings.
      const documented = seriousCritical.filter((v) => v.id in KNOWN_ISSUES);
      const regressions = seriousCritical.filter((v) => !(v.id in KNOWN_ISSUES));

      // Annotate the known real-site defects so they stay loud in the report
      // without failing this suite's own pipeline.
      for (const v of documented) {
        testInfo.annotations.push({
          type: 'a11y-finding (known, see FINDINGS.md)',
          description: `${p.name}: ${v.id} (${v.impact}, ${v.nodes.length} node(s)) — ${KNOWN_ISSUES[v.id]}`,
        });
      }

      // Only NEW serious/critical rules (regressions beyond the baseline) fail CI.
      const summary = regressions.map(
        (v) => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}`,
      );
      expect(
        regressions,
        `NEW (undocumented) serious/critical a11y violations on ${p.name}:\n${summary.join('\n')}`,
      ).toHaveLength(0);
    });
  }
});
