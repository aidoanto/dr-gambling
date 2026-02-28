.PHONY: dev build convex-dev convex-deploy seed docker-build docker-up docker-nas typecheck

# Local development
dev:
	npx concurrently "npx convex dev" "npx vite"

# Build frontend
build:
	npx tsc --noEmit && npx vite build

# Convex
convex-dev:
	npx convex dev

convex-deploy:
	npx convex deploy

seed:
	npx convex run seed:seedWorld

# Docker — local
docker-build:
	docker compose -f docker-compose.yml build

docker-up:
	docker compose -f docker-compose.yml up --build

docker-down:
	docker compose -f docker-compose.yml down

# Docker — NAS
docker-nas:
	docker compose -f docker-compose.yml -f docker-compose.nas.yml up -d --build

docker-nas-down:
	docker compose -f docker-compose.yml -f docker-compose.nas.yml down

# Checks
typecheck:
	npx tsc --noEmit
