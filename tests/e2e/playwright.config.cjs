const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: __dirname, testMatch: /(?:sprints|integration|lifecycle|sessions|academic-forms)\.spec\.cjs$/, timeout: 60000, expect: { timeout: 15000 },
  workers: 1, retries: 0, outputDir: '../artifacts/browser',
  reporter: [['list'], ['json', { outputFile: require('node:path').resolve(__dirname, '../artifacts/browser-results.json') }]],
  use: { baseURL: 'http://127.0.0.1:3300', channel: 'chrome', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node tests/e2e/server.cjs', cwd: require('node:path').resolve(__dirname, '../..'), url: 'http://127.0.0.1:3300/admin/login', reuseExistingServer: false, timeout: 300000 },
});
