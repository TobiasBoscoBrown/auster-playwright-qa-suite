/** Test data factory — keeps email fixtures out of the specs. */

export const VALID_EMAIL = `qa.suite+${Date.now()}@example.com`;

export const INVALID_EMAILS: string[] = [
  'plainstring',
  'missing-at.com',
  '@no-local.com',
  'spaces in@email.com',
  'trailing@dot.',
];

export const EMPTY = '';
