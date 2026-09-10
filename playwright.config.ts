import { defineConfig, devices } from "@playwright/test";

/** E2E critical paths (PRD §81). webServer memakai build prod + start. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { PORT: "3100" },
  },
});
