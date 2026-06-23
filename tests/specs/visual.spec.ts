import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Visual-regression pack (opt-in, self-healing).
 *
 * Lives in its own Playwright project ("visual") so it never reds the main
 * pipeline. Pixel baselines are platform-specific (…-linux.png on CI) and are
 * intentionally NOT committed here, because a portfolio checkout shouldn't ship
 * machine-specific PNGs that drift with every Chromium release.
 *
 * Behaviour:
 *   - If a baseline for the current platform exists, the screenshot is compared
 *     (AA/render deltas tolerated via maxDiffPixelRatio in playwright.config).
 *   - If no baseline exists yet, the test SKIPS with a clear message instead of
 *     failing — so CI stays green on a fresh checkout. Seed baselines with:
 *         npm run test:update-snapshots
 *     then commit the generated tests/specs/visual.spec.ts-snapshots/*.png.
 */
test.describe('Visual regression @visual', () => {
  test('home hero matches baseline', async ({ homePage }) => {
    const snapshotDir = path.join(__dirname, 'visual.spec.ts-snapshots');
    const hasBaseline =
      fs.existsSync(snapshotDir) &&
      fs.readdirSync(snapshotDir).some((f) => f.startsWith('home-full') && f.endsWith('.png'));

    test.skip(
      !hasBaseline,
      'No visual baseline committed for this platform — seed with `npm run test:update-snapshots`.',
    );

    await homePage.open();
    await expect(homePage.heroHeading).toBeVisible();
    // Mask the autoplaying hero video so it doesn't cause flaky diffs.
    await expect(homePage.page).toHaveScreenshot('home-full.png', {
      fullPage: false,
      mask: [homePage.page.locator('video')],
    });
  });
});
