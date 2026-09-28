import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.PERFORMANCE_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "dashboard.performance.spec.ts",
  timeout: 60_000,
  reporter: [["list"]],
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: externalBaseUrl ?? "http://127.0.0.1:8790",
    viewport: { width: 1440, height: 1000 }
  },
  webServer: externalBaseUrl ? undefined : {
    command: "npm run build && npm run proxy",
    env: { ...process.env, HOST: "127.0.0.1", PORT: "8790" },
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://127.0.0.1:8790/api/health"
  }
});
