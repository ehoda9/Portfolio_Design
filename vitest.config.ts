import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      all: true,
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 70,
        branches: 55,
      },
    },
  },
});
