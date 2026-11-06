const fs = require('fs');
const { chromium } = require('@playwright/test');

async function test() {
  const winEdge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const executablePath = process.platform === 'win32' && fs.existsSync(winEdge) ? winEdge : undefined;
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 1280, height: 800 },
    { width: 768, height: 1024 },
    { width: 375, height: 812 }
  ];

  let passed = true;
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: vp });
    await page.goto('http://localhost:3100/dashboard', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log('Viewport ' + vp.width + 'x' + vp.height + ': horizontal overflow = ' + overflow);
    if (overflow) passed = false;
    await page.close();
  }

  await browser.close();
  if (passed) {
    console.log('ALL VIEWPORTS PASSED WITH ZERO HORIZONTAL OVERFLOW!');
  } else {
    process.exit(1);
  }
}

test().catch((e) => {
  console.error(e);
  process.exit(1);
});
