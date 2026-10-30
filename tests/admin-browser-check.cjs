const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = path.resolve(__dirname, '..');
const out = path.join(__dirname, 'artifacts/admin-browser');
fs.mkdirSync(out, { recursive: true });

async function build() {
  const mock = path.join(__dirname, 'admin-browser-mocks.cjs');
  await new Promise((resolve, reject) => webpack({
    mode: 'development', devtool: false, context: root,
    entry: path.join(__dirname, 'admin-browser-entry.cjs'),
    output: { path: out, filename: 'bundle.js' },
    resolve: { extensions: ['.tsx', '.ts', '.js', '.cjs'], alias: {
      'next/link': mock, 'next/navigation': mock, sonner: mock,
      '@/contexts/loadingContext': mock, '@/actions/auth.action': mock,
      '@/actions/to_hop_xet_tuyen.action': mock, '@': root,
    } },
    module: { rules: [{ test: /\.(tsx?|css)$/, use: [path.join(__dirname, 'admin-browser-loader.cjs')] }] },
  }, (error, stats) => {
    if (error || stats.hasErrors()) return reject(error || Error(stats.toString({ all: false, errors: true })));
    const forbidden = stats.toJson({ all: false, modules: true }).modules.filter(module =>
      /(?:^|[\\/])(?:services|actions|prisma)(?:[\\/])|pg-pool|pg-connection-string/.test(module.name || ''));
    try { assert.equal(forbidden.length, 0, 'browser must not bundle server/database code'); resolve(); }
    catch (failure) { reject(failure); }
  }));
  const requireTailwind = createRequire(require.resolve('@tailwindcss/postcss'));
  const compiler = await requireTailwind('@tailwindcss/node').compile('@import "tailwindcss";', { base: root, onDependency() {} });
  const sources = [];
  function scan(directory) {
    for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, file.name);
      if (file.isDirectory()) scan(fullPath);
      else if (/\.(tsx|css)$/.test(fullPath)) sources.push(fs.readFileSync(fullPath, 'utf8'));
    }
  }
  scan(path.join(root, 'components/admin')); scan(path.join(root, 'app/admin'));
  sources.push(fs.readFileSync(path.join(__dirname, 'admin-browser-entry.cjs'), 'utf8'));
  const css = compiler.build(sources.join('\n').match(/[^\s"'`<>]+/g));
  fs.writeFileSync(path.join(out, 'styles.css'), css + '\n' + fs.readFileSync(path.join(root, 'components/admin/admin.css'), 'utf8'));
}

(async () => {
  await build();
  const { chromium } = require('@playwright/test');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [], network = [], errors = [];
  try {
    const context = await browser.newContext();
    await context.route('**/*', route => { network.push(route.request().url()); return route.abort(); });
    for (const width of [375, 768, 1440]) {
      const page = await context.newPage();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.setContent('<!doctype html><meta charset="utf-8"><div id="root"></div>');
      await page.addStyleTag({ path: path.join(out, 'styles.css') });
      await page.addScriptTag({ path: path.join(out, 'bundle.js') });
      await page.getByRole('heading', { name: 'Quản Lý Tổ Hợp Xét Tuyển' }).waitFor();
      await page.screenshot({ path: path.join(out, `table-${width}.png`), fullPage: true });
      const closed = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, main: document.querySelector('main').getBoundingClientRect().width }));
      assert.equal(closed.document, width, `table page overflow at ${width}`);
      await page.locator('tbody tr').click();
      const modal = page.getByRole('dialog', { name: /Các Ngành Gắn/ });
      await modal.waitFor();
      await page.screenshot({ path: path.join(out, `program-modal-${width}.png`), fullPage: true });
      const program = await modal.evaluate(element => {
        const outer = element.getBoundingClientRect();
        return {
          ariaModal: element.getAttribute('aria-modal'), scrollLocked: document.body.style.overflow === 'hidden',
          focusContained: element.contains(document.activeElement),
          controlsClipped: [...element.querySelectorAll('input,select,button')].filter(control => {
            // Table actions are reached through the intentionally local horizontal scroller.
            if (control.closest('table')) return false;
            const box = control.getBoundingClientRect(); return box.width > 0 && (box.left < outer.left || box.right > outer.right + 1);
          }).length,
        };
      });
      assert.equal(program.ariaModal, 'true'); assert.equal(program.scrollLocked, true);
      assert.equal(program.focusContained, true); assert.equal(program.controlsClipped, 0, `program controls clipped at ${width}`);
      const tableActionReachable = await modal.locator('table').evaluate(table => {
        const scroller = table.parentElement; scroller.scrollLeft = scroller.scrollWidth;
        const action = table.querySelector('button').getBoundingClientRect();
        const bounds = scroller.getBoundingClientRect();
        return action.left >= bounds.left && action.right <= bounds.right + 1;
      });
      assert.equal(tableActionReachable, true, `table action unreachable at ${width}`);
      await page.keyboard.press('Escape');
      await modal.waitFor({ state: 'detached' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      await page.getByRole('button', { name: 'Thêm Tổ Hợp' }).click();
      const form = page.getByRole('dialog', { name: /Thêm Tổ Hợp/ }); await form.waitFor();
      await page.screenshot({ path: path.join(out, `shared-form-${width}.png`), fullPage: true });
      const formBounds = await form.evaluate(element => {
        const box = element.getBoundingClientRect();return [...element.querySelectorAll('button')].every(button => { const b = button.getBoundingClientRect(); return b.left >= box.left && b.right <= box.right + 1; });
      });
      assert.equal(formBounds, true, `shared form buttons clipped at ${width}`);
      await page.keyboard.press('Escape'); await form.waitFor({ state: 'detached' });
      if (width === 375) {
        const trigger = page.getByRole('button', { name: 'Mở hoặc thu gọn menu quản trị' }); await trigger.click();
        const drawer = page.getByRole('dialog', { name: 'Điều hướng quản trị' }); await drawer.waitFor();
        await page.waitForFunction(() => Math.abs(document.querySelector('[aria-label="Điều hướng quản trị"]').getBoundingClientRect().left) < 1);
        await page.screenshot({ path: path.join(out, 'mobile-drawer-375.png'), fullPage: true });
        await page.keyboard.press('Escape'); await drawer.waitFor({ state: 'hidden' });
        assert.equal(await trigger.evaluate(element => element === document.activeElement), true);
      }
      results.push({ width, closed, program, sharedFormButtonsFit: formBounds });
      await page.close();
    }
    assert.deepEqual(network, [], 'browser must make no network requests');
    assert.deepEqual(errors, [], 'browser console errors');
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ status: 'PASS', results, networkRequests: network.length }, null, 2));
    console.log(JSON.stringify({ status: 'PASS', results, networkRequests: network.length }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
