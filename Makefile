.PHONY: help dev-up dev-down dev logs migrate seed test test-e2e test-security test-authz backup verify-all

help:
	@echo "Target: dev-up dev-down dev logs migrate seed test test-e2e test-security test-authz backup verify-all"

dev-up:
	cd ops/compose && docker compose -f compose.data.yml up -d
	cd ops/compose && docker compose -f compose.app.yml up -d --build

dev-down:
	cd ops/compose && docker compose -f compose.app.yml down
	cd ops/compose && docker compose -f compose.data.yml down

dev:
	pnpm dev

logs:
	cd ops/compose && docker compose -f compose.app.yml logs -f --tail=200

migrate:
	pnpm --filter @tamalate/api prisma migrate dev

seed:
	pnpm --filter @tamalate/api prisma db seed

test:
	pnpm test

test-e2e:
	pnpm --filter @tamalate/web test:e2e

test-security:
	bash ops/scripts/security-gate.sh

test-authz:
	bash ops/scripts/authz-matrix.sh

backup:
	bash ops/scripts/backup.sh

verify-all:
	bash ops/scripts/verify-all.sh
