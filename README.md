# NexVendor — Distributed Multi-Vendor Marketplace Platform

A production-grade, distributed multi-vendor e-commerce platform built as an event-ready microservices architecture. Implements real-world multi-vendor workflows: isolated databases per domain, role-based access control, vendor onboarding with private KYC verification, atomic multi-item stock reservation with compensating sagas, idempotent checkout grouping orders into vendor sub-orders, state machine transitions, and cross-service dashboard aggregations.

---

## 1. System Architecture

```mermaid
flowchart TB
  subgraph Client Tier
    FE["React 18 + TS + Tailwind<br/>(Port 5173)"]
  end

  subgraph Gateway Tier
    GW["API Gateway<br/>Express Proxy & Dashboards<br/>(Port 4000)"]
  end

  subgraph Microservices Tier
    AUTH["Auth Service<br/>JWT & RBAC<br/>(Port 4001)"]
    VEN["Vendor Service<br/>KYC & Verification<br/>(Port 4002)"]
    CAT["Catalogue Service<br/>Products & Stock<br/>(Port 4003)"]
    ORD["Order Service<br/>Sub-Orders & Saga<br/>(Port 4004)"]
  end

  subgraph Data Tier (MongoDB 27017)
    DB_AUTH[("marketplace_auth")]
    DB_VEN[("marketplace_vendor")]
    DB_CAT[("marketplace_catalogue")]
    DB_ORD[("marketplace_orders")]
  end

  FE -->|Public REST + JWT| GW
  GW -->|Proxy /api/auth| AUTH
  GW -->|Proxy /api/vendors| VEN
  GW -->|Proxy /api/catalogue & /api/products| CAT
  GW -->|Proxy /api/orders| ORD
  GW -->|Dashboard Aggregation| AUTH & VEN & CAT & ORD

  AUTH --> DB_AUTH
  VEN --> DB_VEN
  CAT --> DB_CAT
  ORD --> DB_ORD

  ORD -.->|Internal HTTP: /internal/stock/reserve & release| CAT
  VEN -.->|Internal HTTP: /internal/vendors/:id/status-changed| CAT
```

---

## 2. Port & Service Mapping

| Component | Port | Technology | Database / Store | Responsibilities |
|---|---|---|---|---|
| **Frontend** | `5173` | React 18, Vite, TypeScript, Tailwind CSS, RTK Query | Browser `localStorage` (Auth & Cart) | 14 responsive pages, customer catalogue, multi-vendor cart, idempotent checkout, vendor & admin portals |
| **API Gateway** | `4000` | Node.js (ESM), Express, `http-proxy-middleware`, `cors`, `helmet` | Stateless | Reverse proxy, rate limiting, JWT RBAC verification, header propagation (`x-user-id`, `x-correlation-id`), composite dashboards |
| **Auth Service** | `4001` | Node.js (ESM), Express, Mongoose, Zod, bcryptjs, jsonwebtoken | `marketplace_auth` | User registration, password hashing, JWT issue, profile lookup |
| **Vendor Service** | `4002` | Node.js (ESM), Express, Mongoose, Multer (private uploads) | `marketplace_vendor` | Store onboarding, private KYC document streaming, admin verify/reject, catalogue status synchronization |
| **Catalogue Service** | `4003` | Node.js (ESM), Express, Mongoose, Zod | `marketplace_catalogue` | Product CRUD, category aggregation, atomic stock reservation (`$inc: -qty`), compensating release, verified vendor guards |
| **Order Service** | `4004` | Node.js (ESM), Express, Mongoose, Zod | `marketplace_orders` | Idempotent checkout (`Idempotency-Key` unique index), sub-order grouping, mini-saga stock compensation, finite state machine |
| **Database Tier** | Cloud / Local | MongoDB 7.x Community / MongoDB Atlas | 4 isolated databases | Domain boundary isolation (`marketplace_auth`, `marketplace_vendor`, `marketplace_catalogue`, `marketplace_orders`) |

---

## 3. Prerequisites & Environment Setup

- **Node.js**: `v20.x` or `v22.x`
- **MongoDB**: MongoDB Atlas (Cloud Cluster) or local MongoDB on `127.0.0.1:27017`
- **npm**: `v10.x+` (uses npm workspaces)

### Cloud MongoDB Setup (MongoDB Atlas)

The platform supports MongoDB Atlas Cloud clusters out-of-the-box:

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, whitelist your IP address (or `0.0.0.0/0` for cloud deployment).
3. Under **Database Access**, create a database user and password.
4. Click **Connect** → **Drivers** (Node.js) and copy the connection string.
5. In your `.env` file, set `MONGODB_URI`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
   *Each microservice will automatically route to its isolated database (`marketplace_auth`, `marketplace_vendor`, `marketplace_catalogue`, `marketplace_orders`) on your cluster.*

### Configuration (`.env`)

Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

```env
# Cloud MongoDB (Option A - Recommended)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Or Local MongoDB (Option B - Fallback)
# MONGO_URI_AUTH=mongodb://127.0.0.1:27017/marketplace_auth
# MONGO_URI_VENDOR=mongodb://127.0.0.1:27017/marketplace_vendor
# MONGO_URI_CATALOGUE=mongodb://127.0.0.1:27017/marketplace_catalogue
# MONGO_URI_ORDERS=mongodb://127.0.0.1:27017/marketplace_orders

JWT_SECRET=change-me-production-secret-key-32chars-min
JWT_EXPIRES_IN=1d
INTERNAL_API_KEY=change-me-internal-service-secret-key

AUTH_URL=http://127.0.0.1:4001
VENDOR_URL=http://127.0.0.1:4002
CATALOGUE_URL=http://127.0.0.1:4003
ORDERS_URL=http://127.0.0.1:4004
CORS_ORIGIN=http://localhost:5173
KYC_UPLOAD_DIR=./private_uploads
SEED_DEMO_PASSWORD=Demo@12345
```

---

## 4. Quick Start Commands

```bash
# 1. Install dependencies across all monorepo packages, services, and frontend
npm install

# 2. (Optional) Start MongoDB using Docker Compose if not running natively
docker compose up -d mongo

# 3. Seed deterministic demo data (idempotent, safe to run repeatedly)
npm run seed

# 4. Start all services and frontend concurrently
npm run dev:all

# Alternatively, start backend services only:
npm run dev:backend
```

---

## 5. Demo Accounts & Credentials

All demo accounts use the standard dev password: `Demo@12345`

| Role | Name | Email | Store / Status | Key Capabilities |
|---|---|---|---|---|
| **Admin** | Super Administrator | `admin@demo.test` | System Admin | KYC verification/rejection, global orders, platform dashboard |
| **Vendor** | TechNest | `vendor1@demo.test` | TechNest (`verified`) | Product management, sub-order fulfillment (`confirmed` → `packed` → `shipped` → `delivered`) |
| **Vendor** | Desi Threads | `vendor2@demo.test` | Desi Threads (`verified`) | Fashion & artisan catalog, sub-order order lifecycle |
| **Vendor** | Sunil Kumar | `vendor3@demo.test` | Green Basket (`pending`) | Onboarding KYC submitted, products forced to `draft` until verified |
| **Customer** | Aarav Sharma | `customer1@demo.test` | Consumer | Product search, multi-vendor cart, idempotent demo checkout, order tracking |
| **Customer** | Priya Patel | `customer2@demo.test` | Consumer | Secondary customer account |
| **Customer** | Rohan Verma | `customer3@demo.test` | Consumer | Tertiary customer account |

---

## 6. Automated Test Suite (T1 – T18)

The project includes an end-to-end integration test suite verifying all 18 core requirements defined in Part 7 of the specification:

```bash
# Run the automated test suite
npm test
```

### Test Results Summary:
- **T1**: Register with `role: admin` is rejected (400 `CANNOT_REGISTER_AS_ADMIN`) ✅
- **T2**: Login with wrong password returns 401 (`INVALID_CREDENTIALS`) ✅
- **T3**: Customer calling `PATCH /api/admin/vendors/:id/verify` is blocked (403 `FORBIDDEN`) ✅
- **T4**: Pending vendor creating product with `status: active` is blocked (403 `VENDOR_NOT_VERIFIED`) ✅
- **T5**: Admin verifies vendor, vendor publishes product → product appears in public catalogue ✅
- **T6**: Vendor B editing Vendor A's product is blocked (403 `FORBIDDEN`) ✅
- **T7**: `POST /api/orders` without `Idempotency-Key` returns 400 (`IDEMPOTENCY_KEY_REQUIRED`) ✅
- **T8**: Replayed `Idempotency-Key` returns identical order with `Idempotent-Replay: true` without double stock decrement ✅
- **T9**: Order qty > stock returns 409 (`INSUFFICIENT_STOCK`) with stock unchanged ✅
- **T10**: Client sending fake price is ignored; total computed securely from DB paise price ✅
- **T11**: Multi-vendor cart splits order into distinct sub-orders with independent subtotals ✅
- **T12**: Vendor A updating Vendor B's sub-order is blocked (403 `FORBIDDEN`) ✅
- **T13**: Invalid status jump (`pending` → `delivered`) returns 409 (`INVALID_STATUS_TRANSITION`) ✅
- **T14**: Cancelling a sub-order triggers compensating release of stock back to catalogue ✅
- **T15**: Admin composite dashboard metrics match direct database counts across all 4 microservices ✅
- **T16**: Seed script executed multiple times produces zero duplicate records ✅
- **T17**: KYC document endpoint requested without authentication returns 401/403 ✅
- **T18**: Frontend TypeScript production build (`npm run build -w frontend`) compiles cleanly with 0 errors ✅

---

## 7. Architecture Capabilities & Roadmap

### Core Implemented Capabilities:
- Monorepo with isolated microservice directories, schemas, and databases.
- Gateway reverse proxy with JWT verification, role authorization, and header propagation.
- Vendor onboarding flow with multipart KYC upload to private storage (`./private_uploads`).
- Catalogue service with atomic stock reservation/compensating rollback and category aggregation.
- Idempotent order checkout with vendor sub-order splitting and state machine transitions.
- Composite gateway dashboard endpoints (`/api/dashboard/admin`, `/vendor`, `/customer`).
- 14 responsive frontend pages with Tailwind CSS, Redux Toolkit, and RTK Query.
- Deterministic idempotent seed script and automated Vitest test suite.

### Extended Enterprise Roadmap:
- Live payment processor webhooks (Stripe / Razorpay) — currently using `DemoPaymentProvider` with integer paise.
- Automated banking settlement and payout transfers.
- Distributed message broker (RabbitMQ / Redis Streams / Kafka) — currently using internal HTTP with `eventBus` interface.
- Transactional outbox table with polling worker.
- Kubernetes deployment manifests and TLS ingress controller.
