# Kepegawaian Tamalate

Sistem Tata Kelola Administrasi dan Kepegawaian Digital Kecamatan Tamalate, Pemerintah Kota Makassar.

## Struktur

Tiga tingkat, satu repo.

- Tingkat 1, kernel di `apps/api/src/kernel/`. Sembilan modul, masing-masing punya `public.ts` sebagai satu-satunya pintu masuk.
- Tingkat 2, protokol lintas kernel di `apps/api/src/common/`. Outbox, idempotency, saga, DLQ, degradasi, versi kontrak.
- Tingkat 3, platform di `ops/`. Compose, Ansible, skrip verifikasi, policy pack.
- Lapis domain, 76 fitur di `manifests/features/` dan `apps/api/src/modules/`.

## Mulai cepat

```bash
cp .env.example .env
pnpm install
make dev-up
make migrate
make seed
make dev
```

Web di `http://localhost:3000`, API di `http://localhost:4000`.

## Dokumen

- `docs/BLUEPRINT.md` arsitektur tiga tingkat
- `docs/adr/` catatan keputusan
- `policy/pack-2026.1/` kebijakan berversi
- `manifests/features/` manifest per fitur
