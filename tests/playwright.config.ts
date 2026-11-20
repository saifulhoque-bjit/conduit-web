import { defineConfig } from '@playwright/test';

// Tests of this app's own code; the RealWorld suite runs from playwright.config.ts.
export default defineConfig({
  testDir: '.',
  use: { baseURL: 'http://localhost:8080' },
  webServer: {
    command: 'bun run serve',
    url: 'http://127.0.0.1:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
