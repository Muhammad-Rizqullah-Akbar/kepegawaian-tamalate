import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: process.env.WEB_BASE_URL ?? 'http://127.0.0.1:3100',
    headless: true,
    launchOptions: {
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    },
  },
});
