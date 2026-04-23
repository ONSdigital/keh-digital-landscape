import { defineConfig } from 'playwright/test';

const mockTechRadarSubmissionsUrl =
  process.env.VITE_TECH_RADAR_SUBMISSIONS_URL ||
  'https://example.test/mock-tech-radar-submissions';

process.env.VITE_TECH_RADAR_SUBMISSIONS_URL = mockTechRadarSubmissionsUrl;

const localWebServer = {
  command: 'npm run dev -- --host 127.0.0.1',
  cwd: '../../frontend',
  port: 3000,
  reuseExistingServer: true,
  env: {
    ...process.env,
    VITE_TECH_RADAR_SUBMISSIONS_URL: mockTechRadarSubmissionsUrl,
  },
};

export default defineConfig({
  timeout: process.env.CI ? 60_000 : 30_000, // Increase default test timeout to 60 seconds on CI (default is 30 seconds)
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000, // Boost default expect timeout to 15 seconds on CI (default is 5 seconds)
  },
  retries: process.env.CI ? 1 : 0, // Retry failed tests once on CI to account for flakiness

  workers: process.env.CI ? 1 : undefined, // Limit to 1 worker on CI for stability
  webServer: process.env.CI ? undefined : localWebServer,
});
