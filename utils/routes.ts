/**
 * Canonical route map for auster.network.
 * Single source of truth for navigation, smoke, and broken-link specs.
 */
export interface RouteDef {
  /** Relative path. */
  path: string;
  /** Human label used in test titles. */
  label: string;
  /** A heading/text fragment expected on the page (case-insensitive regex source). */
  expects: RegExp;
}

export const PRIMARY_NAV: RouteDef[] = [
  { path: '/', label: 'Home', expects: /antidote to the algorithm/i },
  { path: '/fund', label: 'Fund', expects: /fund|projects/i },
  { path: '/magazine', label: 'Magazine', expects: /articles|magazine/i },
  { path: '/opportunities', label: 'Opportunities', expects: /opportunit/i },
  { path: '/bazaar', label: 'Bazaar', expects: /bazaar|store|shop/i },
  { path: '/events', label: 'Events', expects: /event/i },
];

export const LEGAL_ROUTES: RouteDef[] = [
  { path: '/legal/privacy', label: 'Privacy Policy', expects: /privacy/i },
  { path: '/legal/terms', label: 'Terms of Service', expects: /terms/i },
];

export const ALL_ROUTES: RouteDef[] = [...PRIMARY_NAV, ...LEGAL_ROUTES];
