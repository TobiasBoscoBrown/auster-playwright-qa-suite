import { test, expect } from '../../fixtures/test-fixtures';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility pack — runs axe-core against key pages and fails on any
 * serious/critical WCAG 2a/2aa violation. Non-blocking minor/moderate issues
 * are still surfaced in the attached report for triage.
 */
const PAGES: { name: string; path: string }[] = [
  { name: 'Home', path: '/' },
  { name: 'Magazine', path: '/magazine' },
  { name: 'Privacy (legal)', path: '/legal/privacy' },
];

test.describe('Accessibility (axe-core)', () => {
  for (const p of PAGES) {
    test(`${p.name} has no serious/critical violations`, async ({ page }, testInfo) => {
      await page.goto(p.path, { waitUntil: 'domcontentloaded' });

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Attach the full violation set for reviewer visibility.
      await testInfo.attach(`axe-${p.name}.json`, {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });

      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      const summary = blocking.map(
        (v) => `${v.id} (${v.impact}) — ${v.nodes.length} node(s): ${v.help}`,
      );

      expect(
        blocking,
        `serious/critical a11y violations on ${p.name}:\n${summary.join('\n')}`,
      ).toHaveLength(0);
    });
  }
});
