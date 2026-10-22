const base = require('./playwright.config.cjs');
module.exports = {
  ...base,
  testMatch: '**/watch.spec.cjs',
  timeout: 240000,
  outputDir: '../artifacts/watch',
  reporter: [['list'], [require.resolve('./watch-reporter.cjs')], ['html', { outputFolder: require('node:path').resolve(__dirname, '../artifacts/watch-report'), open: 'never' }]],
  use: {
    ...base.use,
    headless: false,
    viewport: { width: 1366, height: 850 },
    launchOptions: { slowMo: 800 },
    video: process.env.ADMISSION_WATCH_VIDEO === '1' ? 'on' : 'off',
    trace: 'retain-on-failure',
    screenshot: 'on',
  },
};
