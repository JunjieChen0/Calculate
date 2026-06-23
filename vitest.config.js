import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.js'],
    environment: 'jsdom',
    testTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60
      }
    }
  }
});
