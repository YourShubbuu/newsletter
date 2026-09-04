# [NEWS BRAND NAME] — Phase 1

Foundation for a next-generation digital news platform.

## Stack

- Next.js 15 + React + TypeScript
- Tailwind CSS 4
- NestJS + TypeScript
- PostgreSQL 17
- Drizzle ORM + drizzle-kit
- Redis 7
- Better Auth
- Zod
- Vitest / Playwright
- Docker Compose

## Monorepo

```text
apps/
  web/          public reader
  newsroom/     editorial app
services/
  api/          NestJS API
packages/
  db/           Drizzle schema, migrations, seed
  auth/         authentication contract
  ui/           shared UI primitives
  design-tokens/
  validation/
  types/
infra/
  docker/
docs/
scripts/
tests/
```

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres redis
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Web: http://localhost:3000  
API: http://localhost:4000/health

## Environment

See `.env.example`. Never commit real secrets.

## Database

Generate migrations after schema changes:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

Seed data:

```bash
pnpm db:seed
```

## Authentication

Authentication is intentionally isolated behind an `AuthService` boundary. The production implementation uses Better Auth with database-backed sessions, secure cookies, email verification, password reset, and OAuth provider configuration.

Server-side authorization must always be checked independently of UI visibility.

## Security baseline

- HttpOnly/Secure/SameSite cookies
- Zod request validation
- Argon2id-compatible password hashing through the auth provider
- RBAC
- rate-limit boundary
- strict upload validation boundary
- security headers
- audit log
- no secrets in client bundles

## Phase 1 scope

This foundation establishes the production boundaries. Public pages, the full CMS, realtime delivery, search indexing, analytics, and recommendation engines are intentionally left for later phases.

## Phase 2: Editorial newsroom

The repository now includes a functional newsroom slice at `/admin/editor`: development session auth, server-side RBAC, article CRUD, a block editor, debounced autosave, revision snapshots, audit logging, and guarded workflow transitions. See `docs/phase-2-editorial.md`.
