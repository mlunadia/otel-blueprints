import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5177',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }],
  outputDir: 'test-results/',
});
