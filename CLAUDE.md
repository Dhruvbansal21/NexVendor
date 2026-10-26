# Marketplace (BEE-II milestone)
Monorepo: frontend (React/Vite/TS), services/* (Express ESM), packages/shared.
Full spec: docs/BUILD_SPEC.md — re-read the relevant Part before each phase.

## Commands
- npm run dev:all  -> start gateway + 4 services + frontend (concurrently)
- docker compose up -d mongo
- npm run seed  -> idempotent seed
- npm test  -> Vitest + Supertest in each service
- cd frontend && npm run build

## Non-negotiables
- No service reads another service's DB. Cross-service = HTTP with x-internal-key.
- Money = integer paise. Server computes all totals.
- Orders require Idempotency-Key. Compensate (release stock) on failure.
- Public catalogue = active product AND verified vendor.
- Gateway route /api/vendors/me/orders must be declared before /api/vendors/*.
- Never claim a test passed without running it. Record results in docs/STATUS.md.
- Commit after every phase: feat(Pn): summary.
