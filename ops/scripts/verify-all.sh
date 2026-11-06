#!/usr/bin/env bash
# Gerbang verifikasi Lingkar Dalam (21 Komponen). Exit 1 bila ada yang gagal.
# Aturan: langkah independen dipisah titik koma, bukan && , agar satu
# kegagalan tidak menghentikan pemeriksaan berikutnya.

set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
FAIL=0

pass() { printf '  [OK]   %s\n' "$1"; }
fail() { printf '  [FAIL] %s\n' "$1"; FAIL=$((FAIL + 1)); }

CURL_BIN="curl"
if command -v curl.exe >/dev/null 2>&1; then
  CURL_BIN="curl.exe"
fi

http_code() {
  code="$("$CURL_BIN" -s -o /dev/null -m 5 -w '%{http_code}' "$1" 2>/dev/null)"
  printf '%s' "${code:-000}"
}

echo '=== 1. DATA PLANE (5 KONTAINER LINGKAR DALAM) ==='
for svc in postgres pgbouncer redis objectstore meilisearch; do
  name="tamalate-data-${svc}-1"
  status="$(docker ps --filter "name=${name}" --format '{{.Status}}' 2>/dev/null)"
  case "$status" in
    *healthy*) pass "$svc sehat ($status)" ;;
    "")       fail "$svc tidak berjalan" ;;
    *)        fail "$svc status: $status" ;;
  esac
done

echo '=== 2. KESIAPAN POSTGRES & PGBOUNCER ==='
if docker exec tamalate-data-postgres-1 pg_isready -U app -d kepegawaian >/dev/null 2>&1; then
  pass 'pg_isready (5432) menerima koneksi'
else
  fail 'pg_isready (5432) menolak koneksi'
fi

echo '=== 3. KESIAPAN REDIS 8 & MEILISEARCH ==='
if [ "$(docker exec tamalate-data-redis-1 redis-cli ping 2>/dev/null)" = 'PONG' ]; then
  pass 'redis (6379) balas PONG'
else
  fail 'redis (6379) tidak balas PONG'
fi
code="$(http_code http://127.0.0.1:7700/health)"
[ "$code" = '200' ] && pass "meilisearch (7700) HTTP $code" || fail "meilisearch (7700) HTTP $code"

echo '=== 4. CONTROL PLANE & PORT REGISTRY (4000) ==='
code="$(http_code http://127.0.0.1:4000/api/v1/health)"
[ "$code" = '200' ] && pass "health HTTP $code" || fail "health HTTP $code"
code="$(http_code http://127.0.0.1:4000/api/v1/ready)"
[ "$code" = '200' ] && pass "ready HTTP $code" || fail "ready HTTP $code"
code="$(http_code http://127.0.0.1:4000/api/v1/health/ports)"
[ "$code" = '200' ] && pass "port-registry HTTP $code" || fail "port-registry HTTP $code"
code="$(http_code http://127.0.0.1:4000/api/v1/openapi.json)"
[ "$code" = '200' ] && pass "openapi-3.1 HTTP $code" || fail "openapi-3.1 HTTP $code"

echo '=== 5. PRESENTATION PLANE ZERO-COLLISION (3100) ==='
code="$(http_code http://127.0.0.1:3100/)"
[ "$code" = '200' ] && pass "web / (3100) HTTP $code" || fail "web / (3100) HTTP $code"
code="$(http_code http://127.0.0.1:3100/dashboard)"
[ "$code" = '200' ] && pass "web /dashboard (3100) HTTP $code" || fail "web /dashboard (3100) HTTP $code"
code="$(http_code http://127.0.0.1:3100/mobile)"
[ "$code" = '200' ] && pass "web /mobile (3100) HTTP $code" || fail "web /mobile (3100) HTTP $code"

echo '=== 6. OBJECT STORE DAN SKEMA ==='
code="$(http_code http://127.0.0.1:9000/health)"
[ "$code" = '200' ] && pass "object store (9000) HTTP $code" || fail "object store (9000) HTTP $code"
tables="$(docker exec tamalate-data-postgres-1 psql -U app -d kepegawaian -tAc \
  "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name <> '_prisma_migrations';" 2>/dev/null | tr -d '[:space:]')"
[ "$tables" = '13' ] && pass '13 tabel domain + Tier-2 aktif' || fail "jumlah tabel: ${tables:-tidak terbaca}"

echo '=== 7. KEPATUHAN EM-DASH ==='
viol="$(grep -rlP '\x{2014}|\x{2013}' --include='*.ts' --include='*.tsx' \
  --include='*.yml' --include='*.json' --include='*.prisma' --include='*.sh' \
  "$ROOT/apps" "$ROOT/packages" "$ROOT/ops" "$ROOT/policy" 2>/dev/null | wc -l | tr -d '[:space:]')"
[ "$viol" = '0' ] && pass 'nol karakter em-dash' || fail "$viol berkas melanggar"

echo
echo '=============================================='
if [ "$FAIL" -eq 0 ]; then
  echo 'HASIL: SEMUA GERBANG LULUS'
  exit 0
fi
echo "HASIL: $FAIL GERBANG GAGAL"
exit 1
