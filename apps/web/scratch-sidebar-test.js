const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:3100/dashboard');
  await page.waitForSelector('#opsTable');

  let allPassed = true;

  for (const nav of ['kgb', 'pangkat', 'pensiun', 'surat', 'pegawai', 'ringkas', 'threshold']) {
    await page.evaluate((target) => {
      document.querySelector(`[data-nav="${target}"]`)?.click();
    }, nav);
    await page.waitForTimeout(150);

    for (const scrollY of [200, 500, 800]) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(50);

      const res = await page.evaluate(() => {
        const sb = document.querySelector('.sidebar').getBoundingClientRect();
        const tb = document.querySelector('.topbar').getBoundingClientRect();
        return {
          scrollY: window.scrollY,
          sbTop: Math.round(sb.top),
          sbBottom: Math.round(sb.bottom),
          sbHeight: Math.round(sb.height),
          tbTop: Math.round(tb.top),
        };
      });

      const ok = res.sbTop === 0 && res.sbBottom === 900 && res.tbTop === 0;
      if (!ok && res.scrollY > 0) {
        console.log(`[FAIL] ${nav} @ ${scrollY}px:`, res);
        allPassed = false;
      } else {
        console.log(`[OK] ${nav} (scrollY=${res.scrollY}px) -> sbTop=${res.sbTop}, sbBottom=${res.sbBottom}, tbTop=${res.tbTop}`);
      }
    }
  }

  console.log('=== TEST RESULT ===');
  console.log('All tests passed:', allPassed);
  await browser.close();
})();
