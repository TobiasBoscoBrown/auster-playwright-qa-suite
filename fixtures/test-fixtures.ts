import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { MagazinePage } from '../pages/MagazinePage';
import { FundPage } from '../pages/FundPage';

/**
 * Custom fixtures wire page objects into the test signature so specs read as
 * user journeys rather than locator soup. Extend here as new POMs are added.
 */
type Fixtures = {
  homePage: HomePage;
  magazinePage: MagazinePage;
  fundPage: FundPage;
};

export const test = base.extend<Fixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  magazinePage: async ({ page }, use) => {
    await use(new MagazinePage(page));
  },
  fundPage: async ({ page }, use) => {
    await use(new FundPage(page));
  },
});

export { expect };
