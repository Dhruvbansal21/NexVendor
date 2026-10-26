# Implementation Plan — Multi-Vendor Marketplace (BEE-II Milestone)

## 1. Repository & Environment Inspection
- **Node.js**: v23.1.0 (Native ESM, Fetch API supported)
- **npm**: 10.9.0 (Supports npm workspaces)
- **Git**: 2.47.1.windows.2
- **Docker**: 29.7.2
- **MongoDB**: Active service running on `localhost:27017`. We will connect each service to its own isolated database (`marketplace_auth`, `marketplace_vendor`, `marketplace_catalogue`, `marketplace_orders`) on this instance, and also provide a complete `docker-compose.yml`.

## 2. Core Architecture & Non-Negotiables
1. **Microservices Database Isolation**:
   - `gateway` (port 4000) — stateless router, auth verifier, rate limiter, dashboard aggregator.
   - `auth-service` (port 4001) — owns `marketplace_auth` (Users).
   - `vendor-service` (port 4002) — owns `marketplace_vendor` (Vendors, KYC).
   - `catalogue-service` (port 4003) — owns `marketplace_catalogue` (Products, Categories).
   - `order-service` (port 4004) — owns `marketplace_orders` (Orders, SubOrders).
2. **Internal Communication**:
   - Direct service-to-service HTTP calls use header `x-internal-key: <INTERNAL_API_KEY>`. Blocked externally at gateway.
3. **Idempotency & Mini-Saga**:
   - Order creation requires `Idempotency-Key` header with unique index `{ customerId, idempotencyKey }`.
   - Atomic conditional stock reservation (`stock >= qty`).
   - Order creation failure triggers compensating stock release call.
4. **Data Integrity & Snapshots**:
   - Money stored strictly in integer paise (INR).
   - Snapshot fields (`storeName`, `unitPrice`, `title`) embedded in sub-order items to preserve historical accuracy.
   - Public catalogue only returns `status: active` AND `vendorStatus: verified`.
5. **Gateway Routing Precedence**:
   - `/api/vendors/me/orders` routed to Order Service BEFORE generic `/api/vendors/*` to Vendor Service.

## 3. Assumptions & Decisions
- MongoDB running locally on `localhost:27017` will be used for rapid, reliable integration tests and development, while `docker-compose.yml` provides containerized orchestration for evaluation.
- `packages/shared` will be a shared workspace package providing common error handling (`AppError`), correlation ID tracking, Pino logger, role verification middleware, internal HTTP client, and event bus stub.
- Frontend uses Vite + React 18 + TypeScript + Tailwind CSS + Redux Toolkit / RTK Query, built with full responsive design and rich UI components.
- Demo payment is simulated server-side under `DemoPaymentProvider` producing `paymentStatus: "demo_paid"` with clean UI disclaimer.

## 4. Phase-by-Phase Execution Plan & Gates

| Phase | Description | Deliverables | Verification Gate |
|---|---|---|---|
| **P0** | Planning & Setup | `docs/PLAN.md`, `CLAUDE.md`, `.gitignore` | Plan file exists and git repo initialized |
| **P1** | Monorepo & Gateway Skeleton | `package.json` workspaces, `packages/shared`, `gateway` skeleton, `docker-compose.yml` | `GET http://localhost:4000/health` returns status OK |
| **P2** | Auth Service & RBAC | `auth-service`, JWT verification, roles (`customer`, `vendor`, `admin`) | Register/login works; non-admin blocked (403) from admin endpoints |
| **P3** | Vendor Service & KYC | `vendor-service`, KYC upload, verify/reject, sync hook | Vendor starts pending; KYC private streaming; admin verify endpoint |
| **P4** | Catalogue Service | `catalogue-service`, product CRUD, stock reserve/release, status sync | Unverified vendor cannot publish active; ownership enforced; reserve/release atomic |
| **P5** | Order Service & Saga | `order-service`, idempotency key, sub-order splitting, status transitions | Duplicate key returns same order; atomic stock decrement; invalid transition 409 |
| **P6** | Dashboard Composition | Gateway dashboard routes (`/api/dashboard/*`) + `/internal/stats` | Gateway aggregates real data from microservices matching direct DB counts |
| **P7** | Frontend Setup & Base API | React + Vite + TS + Tailwind + RTK Query + Auth Slice + Route Guards | `npm run build` passes; Login & Registration UI functional |
| **P8** | Customer Journey UI | Public Catalogue, Product Detail, Cart, Checkout, My Orders | End-to-end checkout flow works in browser |
| **P9** | Vendor & Admin Portals | Vendor Onboarding, Product Mgmt, Order Status, Admin Approvals | Complete vendor & admin workflows verified in browser |
| **P10** | Seed, Tests & Final Deliverables | `scripts/seed.js`, automated test suite, docs (`STATUS.md`, `API.md`, `ARCHITECTURE.md`, `README.md`) | All 18 tests verified; seed idempotent; documentation complete |

## 5. Risk Assessment & Contingencies
- **Port conflicts**: Services default to 4000 (gateway), 4001 (auth), 4002 (vendor), 4003 (catalogue), 4004 (order), 5173 (frontend). Configurable via environment variables.
- **Microservices cold start**: Provide single command `npm run dev:all` using `concurrently` and health check validations.
- **Cross-service sync failure**: Keep internal endpoints idempotent and log correlation IDs across all service hops.
