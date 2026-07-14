import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './visual',
  timeout: 30_000,
  expect: { toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.005 } },
  use: {
    baseURL: 'http://127.0.0.1:3003/astroneum/',
    colorScheme: 'dark',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'pnpm exec next start -p 3003',
    cwd: __dirname,
    port: 3003,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
