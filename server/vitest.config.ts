import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // These tests share one real Postgres database (migrate.test.ts drops
    // and recreates tables). Running test files in parallel would race
    // against that, so force them to run one at a time.
    fileParallelism: false,
  },
});
