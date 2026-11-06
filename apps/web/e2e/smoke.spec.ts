import { test, expect, type Page } from '@playwright/test';

async function assertNoMobileOverflow(page: Page, screenLabel: string) {
  const metrics = await page.evaluate(() => {
    const frame = document.getElementById('frame');
    const body = document.getElementById('appBody');
    return {
      docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      frameOverflow: frame ? frame.scrollWidth - frame.clientWidth : 0,
      bodyOverflow: body ? body.scrollWidth - body.clientWidth : 0,
    };
  });
  expect(
    metrics.docOverflow,
    `Document overflow pada layar ${screenLabel}: ${metrics.docOverflow}px`,
  ).toBeLessThanOrEqual(1);
  expect(
    metrics.frameOverflow,
    `#frame overflow pada layar ${screenLabel}: ${metrics.frameOverflow}px`,
  ).toBeLessThanOrEqual(1);
  expect(
    metrics.bodyOverflow,
    `#appBody overflow pada layar ${screenLabel}: ${metrics.bodyOverflow}px`,
  ).toBeLessThanOrEqual(1);
}

test.describe('Simulasi End-to-End Sistem Kepegawaian Kecamatan Tamalate (:3100 & :4000)', () => {
  test('1. Public Landing Page (/) menampilkan desain asli, Anatomi Mekanisme, dan bebas istilah teknis/port', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1.display')).toContainText('Administrasi kepegawaian yang tersusun rapi');
    await expect(page.locator('a[href="/dashboard"]').first()).toBeVisible();
    await expect(page.locator('a[href="/mobile"]').first()).toBeVisible();
    await expect(page.locator('#anatomi')).toContainText('Meja Kendali Persuratan, Stempel Disposisi, dan Dossier Vault');
    await expect(page.locator('body')).not.toContainText('PostgreSQL');
    await expect(page.locator('body')).not.toContainText('Live Port');
  });

  test('2. Dasbor Desktop (/dashboard) memuat Buku Agenda 8 Kolom, Lembar Disposisi 2 Tertanda, Formulir Cuti 8 Tabel, & Kostumisasi Template', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1.page-title')).toContainText('Pengendalian Surat & Lembar Disposisi');
    await expect(page.locator('#opsTable tbody tr').first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText('PostgreSQL');
    await expect(page.locator('body')).not.toContainText('Live Port');

    // Uji Buku Agenda 8 Kolom
    await page.locator('#tabModeBukuAgenda').click();
    await expect(page.locator('#viewBukuAgenda .buku-agenda-table')).toBeVisible();
    await expect(page.locator('#viewBukuAgenda .buku-agenda-table thead')).toContainText('INSTANSI YG DI TUJUKAN');

    // Uji Tahap 2 Lembar Disposisi Fisik (Tertanda 1 Sekcam & Tertanda 2 Camat)
    await page.locator('.ops-tab[data-ops="disposisi"]').click();
    await expect(page.locator('#inlineDisposisiContainer .disposisi-top-title')).toContainText('LEMBAR DISPOSISI');
    await expect(page.locator('#inlineDisposisiContainer .lembar-disposisi-card')).toContainText('TERTANDA 1: SEKRETARIS CAMAT');
    await expect(page.locator('#inlineDisposisiContainer .lembar-disposisi-card')).toContainText('TERTANDA 2: CAMAT TAMALATE');

    // Uji Modul Kepegawaian (Formulir Surat Cuti 2026 - 8 Tabel Resmi via Tombol Cek Formulir)
    await page.locator('.nav-item[data-nav="cuti"]').click();
    await expect(page.locator('#kpgHost')).toBeVisible();
    await page.getByRole('button', { name: /Cek Formulir Cuti/i }).click();
    await expect(page.locator('.ct-formulir')).toContainText('JENIS CUTI YANG DIAMBIL');
    await expect(page.locator('.ct-formulir .ct-tabel')).toHaveCount(8);
  });

  test('3. Dasbor Mobile PWA (/mobile) bebas overflow mendatar di seluruh layar (Home, Kerja, Surat, Detail Disposisi, Agenda, Ekspor, Cuti 8 Tabel, Vault, Profil)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/mobile');
    await expect(page.locator('#topName')).toContainText('Kasubag Umum');
    await expect(page.locator('#appNav')).toBeVisible();
    await expect(page.locator('.nav-cam')).toBeVisible();
    await expect(page.locator('.hero-card .hero-chip')).toHaveCount(2);
    await expect(page.locator('body')).not.toContainText('PostgreSQL');
    await expect(page.locator('body')).not.toContainText('Live Port');
    await assertNoMobileOverflow(page, 'home');

    // Buka Ruang Kerja (.kisi-kartu)
    await page.locator('#appNav button[data-go="kerja"]').click();
    await expect(page.locator('.kisi-kartu').first()).toBeVisible();
    await assertNoMobileOverflow(page, 'kerja');

    // Buka Surat dan Disposisi (.sr-row)
    await page.locator('.kisi-kartu').first().click();
    await expect(page.locator('.sr-metrics .sr-metric')).toHaveCount(4);
    await expect(page.locator('.sr-row').first()).toBeVisible();
    await assertNoMobileOverflow(page, 'surat');

    // Buka Detail Surat & Panel Disposisi (.sr-alur, .lihat-meta, .sr-kartu, .sr-panel)
    await page.locator('.sr-row').first().click();
    await expect(page.locator('.sr-alur .sr-step')).toHaveCount(5);
    await expect(page.locator('.sr-panel')).toBeVisible();
    await assertNoMobileOverflow(page, 'suratDetail');

    // Buka Pratinjau Cetak Kertas dari Detail Surat (ekspor)
    await page.getByRole('button', { name: /Pratinjau Kertas Disposisi/i }).click();
    await expect(page.locator('.ekspor-bingkai')).toBeVisible();
    await assertNoMobileOverflow(page, 'ekspor-disposisi');

    // Pindah ke Buku Agenda di Ekspor
    await page.locator('.ekspor-opsi').first().click();
    await expect(page.locator('.ekspor-bingkai.is-agenda')).toBeVisible();
    await assertNoMobileOverflow(page, 'ekspor-agenda');

    // Kembali ke Kerja lalu buka Cuti dan Izin (8 tabel .ct-formulir)
    await page.locator('#appNav button[data-go="kerja"]').click();
    await page.getByRole('button', { name: /Cuti dan izin/i }).click();
    await expect(page.locator('.ct-formulir .ct-tabel')).toHaveCount(8);
    await assertNoMobileOverflow(page, 'kpgCuti');

    // Buka Vault & Profil
    await page.locator('#appNav button[data-go="vault"]').click();
    await expect(page.locator('.vault-seal')).toBeVisible();
    await expect(page.locator('.partition')).toHaveCount(6);
    await assertNoMobileOverflow(page, 'vault');

    await page.locator('#appNav button[data-go="profil"]').click();
    await assertNoMobileOverflow(page, 'profil');

    // Buka Bottom Sheet Simulasi Peran
    await page.locator('#roleBtn').click();
    await expect(page.locator('#sheet')).toHaveClass(/is-on/);
    await expect(page.locator('.role-opt[data-role="operator"]')).toBeVisible();
  });

  test('4. Integrasi API 21 Tools Lingkar Dalam: Template Registry (PostgreSQL + Redis + MinIO S3 + Zod) & Pencarian Meilisearch', async ({ request }) => {
    const tplRes = await request.get('http://127.0.0.1:4000/api/v1/simulation/templates');
    expect(tplRes.ok()).toBeTruthy();
    const tplRaw = await tplRes.json();
    const tplJson = tplRaw.data ?? tplRaw.templates ?? tplRaw;
    expect(tplJson.lembarDisposisi.id).toBe('lembar-disposisi');
    expect(tplJson.bukuAgenda.id).toBe('buku-agenda');
    expect(tplJson.suratCuti.id).toBe('surat-cuti');
    expect(tplJson.lembarDisposisi.onlyOffice.s3Bucket).toBe('tamalate-vault');

    const searchRes = await request.get('http://127.0.0.1:4000/api/v1/simulation/search?q=Tamalate');
    expect(searchRes.ok()).toBeTruthy();
    const searchRaw = await searchRes.json();
    const searchJson = searchRaw.data ?? searchRaw;
    expect(['meilisearch', 'fallback']).toContain(searchJson.engine);
  });
});
