const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  const checkDoc = async (page, label) => {
    return page.evaluate((lbl) => {
      const sw = document.documentElement.scrollWidth;
      const cw = document.documentElement.clientWidth;
      const diff = sw - cw;
      const bad = [];
      if (diff > 0) {
        document.querySelectorAll('*').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > cw + 1) {
            bad.push(`${el.tagName}.${el.className} (+${Math.round(r.right - cw)}px)`);
          }
        });
      }
      return { diff, bad: Array.from(new Set(bad)).slice(0, 10) };
    }, label);
  };

  console.log('=== 1. AUDIT DESKTOP (1440, 1280, 1024, 800) ===');
  for (const w of [1440, 1280, 1024, 800]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://127.0.0.1:3100/dashboard');
    await page.waitForSelector('#opsTable');

    const navs = ['ringkas', 'surat', 'apel', 'rekap', 'kgb', 'pangkat', 'cuti', 'pensiun', 'pegawai', 'dossier', 'threshold', 'profil'];
    for (const nav of navs) {
      // Direct navigation using state via JS or clicking
      await page.evaluate((targetNav) => {
        const link = document.querySelector(`[data-nav="${targetNav}"]`);
        if (link) link.click();
      }, nav);
      await page.waitForTimeout(60);
      const res = await checkDoc(page, `Desktop ${w}px [${nav}]`);
      if (res.diff > 0) {
        console.log(`[OVERFLOW] Desktop ${w}px [${nav}]: diff=${res.diff}px`, res.bad);
      } else {
        console.log(`[OK] Desktop ${w}px [${nav}]`);
      }
    }
    await page.close();
  }

  console.log('=== 2. AUDIT MOBILE (430, 390, 375, 360) ===');
  for (const w of [430, 390, 375, 360]) {
    const page = await browser.newPage({ viewport: { width: w, height: 844 } });
    await page.goto('http://127.0.0.1:3100/mobile');
    await page.waitForSelector('.hero-card');

    const checkMobile = async (screenName) => {
      const res = await page.evaluate((sName) => {
        const frame = document.getElementById('frame');
        const body = document.getElementById('appBody');
        const fDiff = frame ? frame.scrollWidth - frame.clientWidth : 0;
        const bDiff = body ? body.scrollWidth - body.clientWidth : 0;
        const bad = [];
        if (body) {
          const br = body.getBoundingClientRect();
          body.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            // Ignore scroll containers like ekspor-bingkai or table-scroll
            const cs = getComputedStyle(el);
            if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return;
            if (el.closest('.ekspor-bingkai, .data-table-scroll')) return;
            if (r.right > br.right + 1) {
              bad.push(`${el.tagName}.${el.className} (+${Math.round(r.right - br.right)}px)`);
            }
          });
        }
        return { fDiff, bDiff, bad: Array.from(new Set(bad)).slice(0, 5) };
      }, screenName);

      if (res.fDiff > 0 || res.bDiff > 0 || res.bad.length > 0) {
        console.log(`[OVERFLOW] Mobile ${w}px [${screenName}]: frame=${res.fDiff} body=${res.bDiff}`, res.bad);
      } else {
        console.log(`[OK] Mobile ${w}px [${screenName}]`);
      }
    };

    await checkMobile('home');
    
    // Ruang Kerja
    await page.evaluate(() => document.querySelector('#appNav button[data-go="kerja"]')?.click());
    await checkMobile('kerja');

    // Surat
    await page.evaluate(() => document.querySelector('.kisi-kartu, .kisi-butir')?.click());
    await checkMobile('surat');

    // Detail Surat
    await page.evaluate(() => document.querySelector('.sr-row')?.click());
    await checkMobile('suratDetail');

    // Ekspor
    await page.evaluate(() => document.querySelector('#appNav button[data-go="kerja"]')?.click());
    await page.getByRole('button', { name: /Ekspor laporan/i }).click();
    await checkMobile('ekspor-agenda');
    await page.locator('.ekspor-opsi').nth(1).click();
    await checkMobile('ekspor-disposisi');
    await page.locator('.ekspor-opsi').nth(2).click();
    await checkMobile('ekspor-cuti');

    // Cuti
    await page.evaluate(() => document.querySelector('#appNav button[data-go="kerja"]')?.click());
    await page.getByRole('button', { name: /Cuti dan izin/i }).click();
    await checkMobile('kpgCuti');

    // Presensi
    await page.evaluate(() => document.querySelector('#appNav button[data-go="presensi"]')?.click());
    await checkMobile('presensi');

    // Vault
    await page.evaluate(() => document.querySelector('#appNav button[data-go="vault"]')?.click());
    await checkMobile('vault');

    // Profil
    await page.evaluate(() => document.querySelector('#appNav button[data-go="profil"]')?.click());
    await checkMobile('profil');

    await page.close();
  }

  await browser.close();
  console.log('AUDIT SELESAI');
})();
