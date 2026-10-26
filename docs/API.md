# API Specification & Endpoint Contracts

This document provides contract specifications and realistic payload examples for all public, protected, and internal endpoints across the Multi-Vendor Marketplace platform.

All responses adhere to standard envelopes:
- **Success (Single Entity)**: `{ "data": { ... } }`
- **Success (Paginated List)**: `{ "data": [ ... ], "page": 1, "limit": 12, "total": 57 }`
- **Error**: `{ "error": { "code": "STRING_CODE", "message": "...", "details": [], "correlationId": "..." } }`

---

## 1. Authentication Service (`/api/auth`)

### 1.1 Register User
- **Method / Path**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Aarav Sharma",
  "email": "customer1@demo.test",
  "password": "Demo@12345",
  "role": "customer"
}
```
- **Response** (`201 Created`):
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "000000000000000000000002",
      "name": "Aarav Sharma",
      "email": "customer1@demo.test",
      "role": "customer",
      "createdAt": "2026-10-24T12:01:16.598Z"
    }
  }
}
```

### 1.2 User Login
- **Method / Path**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "vendor1@demo.test",
  "password": "Demo@12345"
}
```
- **Response** (`200 OK`):
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "000000000000000000000010",
      "name": "TechNest Store",
      "email": "vendor1@demo.test",
      "role": "vendor"
    }
  }
}
```

### 1.3 Get Current User Profile
- **Method / Path**: `GET /api/auth/me`
- **Access**: Protected (`Bearer JWT`)
- **Response** (`200 OK`):
```json
{
  "data": {
    "id": "000000000000000000000010",
    "name": "TechNest Store",
    "email": "vendor1@demo.test",
    "role": "vendor"
  }
}
```

---

## 2. Vendor Service (`/api/vendors` & `/api/admin/vendors`)

### 2.1 Submit Vendor Onboarding (with KYC)
- **Method / Path**: `POST /api/vendors/onboard`
- **Access**: Vendor (`Bearer JWT`)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `storeName`: "Green Basket"
  - `description`: "Organic pantry items and natural foods."
  - `contactEmail`: "vendor3@demo.test"
  - `contactPhone`: "+919877766554"
  - `kycDoc`: (Binary PDF/image file)
- **Response** (`201 Created`):
```json
{
  "data": {
    "id": "000000000000000000000103",
    "userId": "000000000000000000000030",
    "storeName": "Green Basket",
    "slug": "green-basket",
    "status": "pending",
    "kycDocs": [
      {
        "docId": "doc-1730000000000-abc",
        "originalName": "business_registration.pdf",
        "mimeType": "application/pdf",
        "size": 154200,
        "uploadedAt": "2026-10-26T12:00:00.000Z"
      }
    ]
  }
}
```

### 2.2 Get My Vendor Profile
- **Method / Path**: `GET /api/vendors/me`
- **Access**: Vendor (`Bearer JWT`)
- **Response** (`200 OK`):
```json
{
  "data": {
    "id": "000000000000000000000101",
    "storeName": "TechNest",
    "slug": "technest",
    "status": "verified",
    "commissionPct": 10,
    "verifiedAt": "2026-10-24T12:01:16.598Z"
  }
}
```

### 2.3 List Public Verified Vendors
- **Method / Path**: `GET /api/vendors`
- **Access**: Public (Safe fields only; excludes private KYC paths)
- **Query Params**: `page=1&limit=10&search=Tech`
- **Response** (`200 OK`):
```json
{
  "data": [
    {
      "id": "000000000000000000000101",
      "storeName": "TechNest",
      "slug": "technest",
      "description": "Premium gaming gear, workspace accessories, and smart devices.",
      "status": "verified"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

### 2.4 Stream Private KYC Document
- **Method / Path**: `GET /api/vendors/:id/kyc/:docId`
- **Access**: Protected (`Admin` or Document Owner only)
- **Response**: Binary file stream (`application/pdf` or `image/jpeg`) with `Content-Disposition: inline`

### 2.5 Admin Verify Vendor
- **Method / Path**: `PATCH /api/admin/vendors/:id/verify`
- **Access**: Admin (`Bearer JWT`)
- **Response** (`200 OK`):
```json
{
  "data": {
    "id": "000000000000000000000103",
    "storeName": "Green Basket",
    "status": "verified",
    "verifiedAt": "2026-10-26T12:30:00.000Z"
  }
}
```

### 2.6 Admin Reject Vendor
- **Method / Path**: `PATCH /api/admin/vendors/:id/reject`
- **Access**: Admin (`Bearer JWT`)
- **Request Body**:
```json
{
  "reason": "Business license document was blurry and unreadable."
}
```
- **Response** (`200 OK`):
```json
{
  "data": {
    "id": "000000000000000000000103",
    "status": "rejected",
    "rejectionReason": "Business license document was blurry and unreadable."
  }
}
```

---

## 3. Catalogue Service (`/api/catalogue` & `/api/products`)

### 3.1 Public Product Search & Filter
- **Method / Path**: `GET /api/catalogue/products` (alias `GET /api/products`)
- **Access**: Public (Enforces `status: "active"` AND `vendorStatus: "verified"`)
- **Query Params**: `category=Electronics&search=Keyboard&minPrice=100000&maxPrice=500000&page=1&limit=12&sort=-price`
- **Response** (`200 OK`):
```json
{
  "data": [
    {
      "id": "000000000000000000000202",
      "vendorId": "000000000000000000000101",
      "storeName": "TechNest",
      "title": "Mechanical Gaming Keyboard RGB",
      "description": "Hot-swappable mechanical switches with per-key RGB backlighting.",
      "price": 449900,
      "category": "Electronics",
      "stock": 25,
      "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800",
      "status": "active"
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 1
}
```

### 3.2 Category Aggregation
- **Method / Path**: `GET /api/catalogue/categories`
- **Access**: Public
- **Response** (`200 OK`):
```json
{
  "data": [
    { "category": "Electronics", "count": 5 },
    { "category": "Fashion & Apparel", "count": 4 },
    { "category": "Home & Living", "count": 4 },
    { "category": "Beauty & Wellness", "count": 3 }
  ]
}
```

### 3.3 Vendor Product Management
- **Method / Path**: `POST /api/catalogue/products`
- **Access**: Vendor (`Bearer JWT`)
- **Request Body**:
```json
{
  "title": "Wireless Gaming Mouse Ergonomic",
  "description": "Ultra-lightweight 2.4GHz wireless optical mouse.",
  "price": 149900,
  "category": "Electronics",
  "stock": 40,
  "status": "active"
}
```
- **Response** (`201 Created`):
```json
{
  "data": {
    "id": "671cc0000000000000000999",
    "vendorId": "000000000000000000000101",
    "storeName": "TechNest",
    "title": "Wireless Gaming Mouse Ergonomic",
    "price": 149900,
    "stock": 40,
    "status": "active"
  }
}
```

---

## 4. Order Service (`/api/orders` & `/api/vendors/me/orders`)

### 4.1 Idempotent Checkout (Create Order)
- **Method / Path**: `POST /api/orders`
- **Access**: Customer (`Bearer JWT`)
- **Required Header**: `Idempotency-Key: <UUID>`
- **Request Body**:
```json
{
  "items": [
    { "productId": "000000000000000000000201", "qty": 1 },
    { "productId": "000000000000000000000206", "qty": 2 }
  ],
  "shippingAddress": {
    "fullName": "Aarav Sharma",
    "street": "Indiranagar",
    "city": "Bengaluru",
    "state": "Karnataka",
    "postalCode": "560038",
    "country": "India",
    "phone": "+919876543210"
  }
}
```
- **Response** (`201 Created` or `200 OK` on replay with header `Idempotent-Replay: true`):
```json
{
  "data": {
    "id": "671cceede51797d9dd1a385",
    "customerId": "000000000000000000000002",
    "idempotencyKey": "9d1a3850-2026-4488-8250-9dd1a3852026",
    "totalAmount": 559700,
    "currency": "INR",
    "paymentStatus": "demo_paid",
    "subOrders": [
      {
        "id": "671cceede51797d9dd1a386",
        "vendorId": "000000000000000000000101",
        "storeName": "TechNest",
        "subtotal": 299900,
        "status": "pending",
        "items": [
          {
            "productId": "000000000000000000000201",
            "title": "ANC Wireless Headphones Over-Ear",
            "unitPrice": 299900,
            "qty": 1,
            "lineTotal": 299900
          }
        ]
      },
      {
        "id": "671cceede51797d9dd1a387",
        "vendorId": "000000000000000000000102",
        "storeName": "Desi Threads",
        "subtotal": 259800,
        "status": "pending",
        "items": [
          {
            "productId": "000000000000000000000206",
            "title": "Handwoven Pure Khadi Cotton Shirt",
            "unitPrice": 129900,
            "qty": 2,
            "lineTotal": 259800
          }
        ]
      }
    ]
  }
}
```

### 4.2 Vendor Sub-Order Status Transition
- **Method / Path**: `PATCH /api/orders/:id/status`
- **Access**: Vendor (`Bearer JWT`)
- **Request Body**:
```json
{
  "subOrderId": "671cceede51797d9dd1a386",
  "status": "confirmed"
}
```
- **Allowed Transitions**:
  - `pending` → `confirmed`, `cancelled`
  - `confirmed` → `packed`, `cancelled`
  - `packed` → `shipped`
  - `shipped` → `delivered`
- **Response** (`200 OK`):
```json
{
  "data": {
    "id": "671cceede51797d9dd1a385",
    "subOrders": [
      {
        "id": "671cceede51797d9dd1a386",
        "status": "confirmed",
        "statusHistory": [
          { "status": "pending", "timestamp": "2026-10-26T12:00:00.000Z" },
          { "status": "confirmed", "timestamp": "2026-10-26T12:35:00.000Z" }
        ]
      }
    ]
  }
}
```

---

## 5. Gateway Dashboard Endpoints (`/api/dashboard`)

### 5.1 Admin Global Platform Dashboard
- **Method / Path**: `GET /api/dashboard/admin`
- **Access**: Admin (`Bearer JWT`)
- **Response** (`200 OK`):
```json
{
  "data": {
    "summary": {
      "totalUsers": 13,
      "totalVendors": 6,
      "pendingVendors": 1,
      "totalProducts": 16,
      "totalOrders": 6,
      "totalRevenuePaise": 1179400
    },
    "recentOrders": [ ... ],
    "recentVendors": [ ... ]
  }
}
```

### 5.2 Vendor Business Dashboard
- **Method / Path**: `GET /api/dashboard/vendor`
- **Access**: Vendor (`Bearer JWT`)
- **Response** (`200 OK`):
```json
{
  "data": {
    "metrics": {
      "totalProducts": 5,
      "activeProducts": 4,
      "totalSubOrders": 3,
      "totalRevenue": 489800,
      "pendingOrders": 1
    },
    "vendor": {
      "storeName": "TechNest",
      "status": "verified"
    }
  }
}
```

---

## 6. Internal Service Communication (Header `x-internal-key`)

Internal endpoints are blocked at the Gateway and can only be invoked by internal microservices.

- `POST /internal/stock/reserve`: Atomically verifies and reserves stock. Returns 200 with product snapshots or 409 `STOCK_UNAVAILABLE`.
- `POST /internal/stock/release`: Compensating action releasing reserved stock upon failed checkout or sub-order cancellation.
- `GET /internal/vendors/by-user/:userId`: Resolves vendor profile and verification state by Auth User ID.
- `POST /internal/vendors/:id/status-changed`: Pushes vendor verification state updates to Catalogue Service for product visibility synchronisation.
- `GET /internal/stats`: Returns domain collection metrics used by Gateway for dashboard composition.
