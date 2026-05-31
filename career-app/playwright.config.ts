import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    headless: false,
    launchOptions: { slowMo: 600 },
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'zh-CN',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // 已在跑的 dev server 直接复用
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
