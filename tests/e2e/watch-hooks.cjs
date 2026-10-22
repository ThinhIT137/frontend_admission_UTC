const { test,expect } = require('@playwright/test');
const { vietnamese } = require('./watch-labels.cjs');

// Chỉ thử lại phần cuộn khi document bị thay trong lúc điều hướng; không nuốt lỗi app.
function documentChanged(error) {
  return /Execution context was destroyed|Cannot find context with specified id/.test(String(error?.message));
}
async function scrollForViewer(page) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await page.waitForLoadState('domcontentloaded');
      for (let step = 0; step < 12; step++) {
        const moved = await page.evaluate(() => {
          const before = window.scrollY;
          window.scrollBy(0, Math.round(window.innerHeight * 0.7));
          return before !== window.scrollY;
        });
        // Đợi phía Node để một lần reload không hủy promise đang chạy trong trang.
        await page.waitForTimeout(220);
        if (!moved) break;
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      return;
    } catch (error) {
      if (!documentChanged(error) || attempt === 1 || page.isClosed()) throw error;
    }
  }
}

test.beforeEach(async ({ page }, info) => {
  page.__watchRuntime=[];
  page.on('pageerror',error=>page.__watchRuntime.push({type:'runtime',message:error.message}));
  page.on('console',message=>{if(['error','warning'].includes(message.type()))page.__watchRuntime.push({type:message.type(),message:message.text()});});
  const title = vietnamese(info.title);
  console.log(`\nBOT ĐANG LÀM: ${title}`);
  const prototype = Object.getPrototypeOf(page.locator('body'));
  if (!prototype.__vietnameseWatch) {
    prototype.__vietnameseWatch = true;
    for (const [method, verb] of Object.entries({ fill: 'Nhập dữ liệu', click: 'Nhấn', selectOption: 'Chọn mục', setInputFiles: 'Tải minh chứng', check: 'Đánh dấu' })) {
      const original = prototype[method];
      prototype[method] = async function (...args) {
        const current = this.page();
        // File inputs can be hidden intentionally; scroll their visible container.
        if (method !== 'setInputFiles') await this.scrollIntoViewIfNeeded();
        const field = await this.evaluate(el => el.getAttribute('aria-label') || el.getAttribute('placeholder') || el.textContent?.trim().slice(0, 100) || el.getAttribute('name') || 'trường dữ liệu');
        await current.evaluate(({ verb, field }) => {
          const badge = document.getElementById('test-bot-status');
          if (badge) badge.textContent = `${verb}: ${field}`;
        }, { verb, field });
        console.log(`  ${verb}: ${field}`);
        if(process.env.ADMISSION_WATCH_FAST!=='1')await current.waitForTimeout(600);
        const value = await original.apply(this, args);
        if(process.env.ADMISSION_WATCH_FAST!=='1')await current.waitForTimeout(600);
        return value;
      };
    }
  }
  // Mỗi Page có wrapper riêng: không giữ hàm goto đã bind với Page của test đầu.
  const originalGoto = page.goto.bind(page);
  page.goto = async (...args) => {
    const response = await originalGoto(...args);
    if (process.env.ADMISSION_WATCH_FAST !== '1') {
      await scrollForViewer(page);
    }
    return response;
  };
  await page.addInitScript(title => {
    const mount = () => {
      if (document.getElementById('test-bot-status')) return;
      const badge = document.createElement('div');
      badge.id = 'test-bot-status';
      badge.textContent = `ĐANG KIỂM THỬ • DỮ LIỆU THỬ NGHIỆM • ${title}`;
      badge.style.cssText = 'position:fixed;bottom:8px;left:8px;max-width:85vw;padding:10px 16px;background:#172554;color:white;border:2px solid #38bdf8;border-radius:10px;z-index:2147483647;font:14px sans-serif;pointer-events:none';
      document.body.appendChild(badge);
    };
    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount, { once: true });
  }, title);
  page.on('domcontentloaded', () => {
    // Give the viewer time to read each page, including pages visited inside a test.
    console.log(`  ĐANG MỞ TRANG: ${new URL(page.url()).pathname}`);
  });
});

test.afterEach(async ({ page }, info) => {
  const entries=page.__watchRuntime||[];
  await info.attach('Nhật ký trình duyệt',{body:Buffer.from(JSON.stringify(entries,null,2)),contentType:'application/json'});
  if (!page.isClosed()) {
    try {
      await info.attach('Ảnh toàn trang sau kiểm thử', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
    } catch {}
    await page.evaluate(status => {
      const badge = document.getElementById('test-bot-status');
      if (badge) badge.textContent = `${status} • ${badge.textContent}`;
    }, ({ passed: 'ĐẠT', failed: 'LỖI', timedOut: 'QUÁ THỜI GIAN', skipped: 'BỎ QUA', interrupted: 'ĐÃ DỪNG' })[info.status] || 'ĐÃ KẾT THÚC').catch(() => {});
    if(process.env.ADMISSION_WATCH_FAST!=='1')await page.waitForTimeout(3500);
  }
  if(info.status!=='skipped')expect(entries.filter(item=>item.type==='runtime'),'Lỗi JavaScript chưa được xử lý trong trình duyệt').toEqual([]);
});

