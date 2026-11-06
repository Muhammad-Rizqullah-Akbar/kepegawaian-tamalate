import { test, expect, type Page } from '@playwright/test';

/**
 * Audit overflow menyeluruh. Mendeteksi:
 * 1. Elemen yang tepinya keluar dari viewport (di luar pemindai horizontal yang disengaja).
 * 2. Elemen anak yang keluar dari kotak induk (kartu) yang overflow-nya visible.
 * 3. Teks yang terpotong/meluap pada elemen bertepi (scrollWidth > clientWidth).
 */
async function collectOverflow(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const vw = document.documentElement.clientWidth;
    const isScroller = (el: Element | null): boolean => {
      for (let n = el; n && n !== document.body; n = n.parentElement) {
        const cs = getComputedStyle(n);
        if (n !== el && /(auto|scroll)/.test(cs.overflowX) && (n as HTMLElement).scrollWidth > (n as HTMLElement).clientWidth) return true;
        if (n !== el && /(auto|scroll|hidden)/.test(cs.overflowX) && n !== document.documentElement) {
          const r = n.getBoundingClientRect();
          const er = (el as Element).getBoundingClientRect();
          if (er.right > r.right + 1 || er.left < r.left - 1) return true;
        }
      }
      return false;
    };
    const desc = (el: Element) => {
      const h = el as HTMLElement;
      const cls = typeof h.className === 'string' ? h.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
      const txt = (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28);
      return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}[${txt}]`;
    };
    const all = Array.from(document.body.querySelectorAll<HTMLElement>('*'));
    for (const el of all) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
      if (el.closest('.no-print') && false) continue;
      // 1. keluar viewport
      if ((r.right > vw + 1 || r.left < -1) && !isScroller(el)) {
        out.push(`VIEWPORT ${desc(el)} L${Math.round(r.left)} R${Math.round(r.right)} vw${vw}`);
        continue;
      }
      // 3. isi meluap dari kotaknya sendiri
      if (el.scrollWidth > el.clientWidth + 1 && cs.overflowX === 'visible' && el.clientWidth > 0 && !['TABLE', 'TBODY', 'TR', 'THEAD', 'HTML', 'BODY'].includes(el.tagName)) {
        if (!isScroller(el)) out.push(`CONTENT ${desc(el)} sw${el.scrollWidth} cw${el.clientWidth}`);
      }
      // 2. anak keluar dari induk bertepi
      const p = el.parentElement;
      if (p && p !== document.body) {
        const pcs = getComputedStyle(p);
        const hasBox = pcs.borderTopWidth !== '0px' || pcs.backgroundColor !== 'rgba(0, 0, 0, 0)';
        if (hasBox && pcs.overflowX === 'visible' && pcs.display !== 'contents') {
          const pr = p.getBoundingClientRect();
          if (r.right > pr.right + 1 && !isScroller(el) && cs.position !== 'absolute' && cs.position !== 'fixed') {
            out.push(`CHILD ${desc(el)} keluar dari ${desc(p)} (+${Math.round(r.right - pr.right)}px)`);
          }
        }
      }
    }
    return Array.from(new Set(out));
  });
}

test.setTimeout(180_000);

const DESKTOP_NAV = ['ringkas', 'surat', 'apel', 'rekap', 'kgb', 'pangkat', 'cuti', 'pensiun', 'pegawai', 'dossier', 'threshold', 'profil', 'bina'];

for (const width of [1440, 1024, 768, 390]) {
  test(`audit desktop ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/dashboard');
    await page.waitForSelector('#opsTable tbody tr');
    const report: string[] = [];
    const tabs = ['masuk', 'disposisi', 'tindak-lanjut', 'arsip', 'audit'];
    for (const nav of DESKTOP_NAV) {
      if (width <= 1024) await page.locator('#menuBtn').click().catch(() => undefined);
      const link = page.locator(`.nav-item[data-nav="${nav}"], .side-user[data-nav="${nav}"]`).first();
      if ((await link.count()) === 0) {
        if (nav === 'bina') {
          // halaman Pembinaan tidak punya item sidebar; lewati
          continue;
        }
        continue;
      }
      await link.click({ force: true });
      await page.waitForTimeout(150);
      if (nav === 'surat') {
        for (const t of tabs) {
          await page.locator(`.ops-tab[data-ops="${t}"]`).click();
          await page.waitForTimeout(150);
          report.push(...(await collectOverflow(page)).map((x) => `[surat/${t}] ${x}`));
        }
        await page.locator('#tabModeBukuAgenda').click().catch(() => undefined);
        report.push(...(await collectOverflow(page)).map((x) => `[surat/buku-agenda] ${x}`));
      } else {
        report.push(...(await collectOverflow(page)).map((x) => `[${nav}] ${x}`));
      }
    }
    console.log(`DESKTOP ${width}\n` + report.join('\n'));
    expect(report, report.join('\n')).toEqual([]);
  });
}

for (const width of [360, 390, 430]) {
  test(`audit mobile ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/mobile');
    await page.waitForSelector('.hero-card');
    const report: string[] = [];
    const snap = async (label: string) => {
      await page.waitForTimeout(150);
      report.push(...(await collectOverflow(page)).map((x) => `[${label}] ${x}`));
    };
    const go = async (tab: string) => page.locator(`#appNav button[data-go="${tab}"]`).click();
    const pickRole = async (role: string) => {
      await page.locator('#roleBtn').click();
      await page.locator(`.role-opt[data-role="${role}"]`).click();
    };

    for (const role of ['pelaksana', 'admin', 'operator', 'pegawai']) {
      await pickRole(role);
      await go('home');
      await snap(`home/${role}`);
    }
    await pickRole('pelaksana');

    await go('kerja');
    await snap('kerja');
    const cards = await page.locator('.kisi-kartu').count();
    for (let i = 0; i < cards; i++) {
      await go('kerja');
      const card = page.locator('.kisi-kartu').nth(i);
      const label = ((await card.locator('.kisi-judul').textContent()) || `kartu${i}`).trim();
      await card.click();
      await snap(`kerja/${label}`);
      // masuk ke detail pertama bila ada daftar
      const row = page.locator('.sr-row, .kpg-baris, .agenda-kartu').first();
      if ((await row.count()) > 0) {
        await row.click();
        await snap(`kerja/${label}/detail`);
      }
      await page.getByRole('button', { name: /Pratinjau/i }).first().click().catch(() => undefined);
    }

    // ekspor tiga jenis
    await go('kerja');
    await page.locator('.kisi-kartu', { hasText: 'Ekspor laporan' }).click();
    for (const k of ['agenda', 'disposisi', 'cuti']) {
      await page.locator('.ekspor-opsi').nth(['agenda', 'disposisi', 'cuti'].indexOf(k)).click();
      await snap(`ekspor/${k}`);
    }

    await go('presensi');
    await snap('presensi');
    await go('vault');
    await snap('vault');
    await page.locator('.row.row-tap').first().click();
    await snap('dokumen');
    await go('profil');
    await snap('profil');
    await page.locator('#roleBtn').click();
    await snap('sheet-peran');

    console.log(`MOBILE ${width}\n` + report.join('\n'));
    expect(report, report.join('\n')).toEqual([]);
  });
}
