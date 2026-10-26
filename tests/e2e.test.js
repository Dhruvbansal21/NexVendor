import { describe, test, expect, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { execSync } from 'child_process';
import crypto from 'crypto';

const GATEWAY_URL = 'http://127.0.0.1:4000';
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo@12345';

let adminToken = '';
let customerToken = '';
let vendor1Token = '';
let vendor2Token = '';
let vendor3Token = '';

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(`${GATEWAY_URL}${path}`, {
    ...options,
    headers
  });
  let body = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

beforeAll(async () => {
  // Ensure fresh seed baseline
  execSync('node scripts/seed.js', { stdio: 'pipe' });

  // Login admin
  const adminRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@demo.test', password: DEMO_PASSWORD })
  });
  adminToken = adminRes.body?.data?.token;

  // Login customer1
  const custRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'customer1@demo.test', password: DEMO_PASSWORD })
  });
  customerToken = custRes.body?.data?.token;

  // Login vendor1 (TechNest)
  const v1Res = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'vendor1@demo.test', password: DEMO_PASSWORD })
  });
  vendor1Token = v1Res.body?.data?.token;

  // Login vendor2 (Desi Threads)
  const v2Res = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'vendor2@demo.test', password: DEMO_PASSWORD })
  });
  vendor2Token = v2Res.body?.data?.token;

  // Login vendor3 (Green Basket - Pending)
  const v3Res = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'vendor3@demo.test', password: DEMO_PASSWORD })
  });
  vendor3Token = v3Res.body?.data?.token;
});

describe('Core Verification Test Suite (T1 - T18)', () => {

  test('T1: Register with role: admin is rejected (400/403)', async () => {
    const res = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Malicious Actor',
        email: `badadmin_${Date.now()}@test.com`,
        password: 'Password@123',
        role: 'admin'
      })
    });
    expect([400, 403]).toContain(res.status);
    expect(res.body?.error?.code).toBe('CANNOT_REGISTER_AS_ADMIN');
  });

  test('T2: Login with wrong password returns 401', async () => {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'customer1@demo.test',
        password: 'CompletelyWrongPassword!999'
      })
    });
    expect(res.status).toBe(401);
    expect(res.body?.error?.code).toBe('INVALID_CREDENTIALS');
  });

  test('T3: Customer calls PATCH /api/admin/vendors/:id/verify returns 403', async () => {
    const res = await api('/api/admin/vendors/000000000000000000000103/verify', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    expect(res.status).toBe(403);
  });

  test('T4: Pending vendor creates product with status: active returns 403 VENDOR_NOT_VERIFIED', async () => {
    const res = await api('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${vendor3Token}` },
      body: JSON.stringify({
        title: 'Pending Vendor Active Item',
        description: 'Should be rejected',
        price: 15000,
        stock: 10,
        category: 'Home & Living',
        status: 'active'
      })
    });
    expect(res.status).toBe(403);
    expect(res.body?.error?.code).toBe('VENDOR_NOT_VERIFIED');
  });

  test('T5: Admin verifies vendor, vendor publishes product -> product appears in public catalogue', async () => {
    // 1. Admin verifies vendor 3
    const verifyRes = await api('/api/admin/vendors/000000000000000000000103/verify', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(verifyRes.status).toBe(200);

    // 2. Vendor 3 publishes product now
    const uniqueTitle = `Organic Raw Honey ${Date.now()}`;
    const pubRes = await api('/api/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${vendor3Token}` },
      body: JSON.stringify({
        title: uniqueTitle,
        description: 'Pure forest organic raw honey',
        price: 54900,
        stock: 40,
        category: 'Home & Living',
        status: 'active'
      })
    });
    expect(pubRes.status).toBe(201);

    // 3. Check public catalogue
    const catRes = await api(`/api/products?search=${encodeURIComponent(uniqueTitle)}`);
    expect(catRes.status).toBe(200);
    const found = catRes.body.data.find(p => p.title === uniqueTitle);
    expect(found).toBeDefined();
    expect(found.status).toBe('active');
  });

  test('T6: Vendor B edits vendor A product returns 403', async () => {
    // Vendor 1 product: 000000000000000000000201 (TechNest Headphones)
    // Vendor 2 (Desi Threads) attempts to edit it
    const res = await api('/api/products/000000000000000000000201', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${vendor2Token}` },
      body: JSON.stringify({ title: 'Hijacked Title by Vendor 2' })
    });
    expect(res.status).toBe(403);
  });

  test('T7: POST /api/orders without Idempotency-Key returns 400', async () => {
    const res = await api('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: JSON.stringify({
        items: [{ productId: '000000000000000000000201', qty: 1 }],
        shippingAddress: {
          fullName: 'Aarav Sharma',
          street: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    expect(res.status).toBe(400);
    expect(res.body?.error?.code).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });

  test('T8: Same Idempotency-Key sent twice: one order in DB, same body, stock decremented once', async () => {
    const idempotencyKey = `idemp-test-${Date.now()}-${crypto.randomUUID()}`;

    // Get current stock
    const pRes1 = await api('/api/products/000000000000000000000202'); // Mechanical Keyboard (stock 25)
    expect(pRes1.status).toBe(200);
    const initialStock = pRes1.body.data.stock;

    const payload = {
      items: [{ productId: '000000000000000000000202', qty: 2 }],
      shippingAddress: {
        fullName: 'Aarav Sharma',
        street: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038'
      }
    };

    // First request
    const res1 = await api('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });
    expect([200, 201]).toContain(res1.status);
    const orderId1 = res1.body.data._id;

    // Verify stock decremented by 2
    const pRes2 = await api('/api/products/000000000000000000000202');
    expect(pRes2.body.data.stock).toBe(initialStock - 2);

    // Replay request with identical idempotency key
    const res2 = await api('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload)
    });
    expect([200, 201]).toContain(res2.status);
    expect(res2.headers.get('idempotent-replay')).toBe('true');
    expect(res2.body.data._id).toBe(orderId1);

    // Verify stock NOT decremented a second time
    const pRes3 = await api('/api/products/000000000000000000000202');
    expect(pRes3.body.data.stock).toBe(initialStock - 2);
  });

  test('T9: Order qty > stock returns 409, stock unchanged', async () => {
    const pRes1 = await api('/api/products/000000000000000000000203'); // Ergonomic Mouse
    expect(pRes1.status).toBe(200);
    const currentStock = pRes1.body.data.stock;

    const res = await api('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': `idemp-overflow-${Date.now()}`
      },
      body: JSON.stringify({
        items: [{ productId: '000000000000000000000203', qty: currentStock + 500 }],
        shippingAddress: {
          fullName: 'Aarav Sharma',
          street: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    expect(res.status).toBe(409);
    expect(['INSUFFICIENT_STOCK', 'STOCK_UNAVAILABLE']).toContain(res.body?.error?.code);

    // Verify stock unchanged
    const pRes2 = await api('/api/products/000000000000000000000203');
    expect(pRes2.body.data.stock).toBe(currentStock);
  });

  test('T10: Client sends fake price: ignored; total computed from DB price', async () => {
    // Product: 000000000000000000000206 (Khadi Cotton Shirt, DB price = 129900 paise)
    const res = await api('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': `idemp-fakeprice-${Date.now()}`
      },
      body: JSON.stringify({
        items: [
          {
            productId: '000000000000000000000206',
            qty: 2,
            price: 1 // Attempting to cheat: 1 paise instead of 129900
          }
        ],
        shippingAddress: {
          fullName: 'Aarav Sharma',
          street: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    expect([200, 201]).toContain(res.status);
    const order = res.body.data;
    // Expected total: 2 * 129900 = 259800 paise
    expect(order.totalAmount).toBe(259800);
    expect(order.subOrders[0].items[0].unitPrice).toBe(129900);
  });

  test('T11: Cart with 2 vendors: Order has 2 sub-orders with correct subtotals', async () => {
    // Vendor 1 product: 000000000000000000000201 (ANC Headphones, 299900 paise)
    // Vendor 2 product: 000000000000000000000206 (Khadi Cotton Shirt, 129900 paise)
    const res = await api('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': `idemp-multivendor-${Date.now()}`
      },
      body: JSON.stringify({
        items: [
          { productId: '000000000000000000000201', qty: 1 },
          { productId: '000000000000000000000206', qty: 1 }
        ],
        shippingAddress: {
          fullName: 'Aarav Sharma',
          street: 'Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    expect([200, 201]).toContain(res.status);
    const order = res.body.data;
    expect(order.subOrders).toHaveLength(2);

    const sub1 = order.subOrders.find(s => s.vendorId === '000000000000000000000101');
    const sub2 = order.subOrders.find(s => s.vendorId === '000000000000000000000102');
    expect(sub1).toBeDefined();
    expect(sub2).toBeDefined();
    expect(sub1.subtotal).toBe(299900);
    expect(sub2.subtotal).toBe(129900);
    expect(order.totalAmount).toBe(299900 + 129900);
  });

  test('T12: Vendor A updates vendor B sub-order returns 403', async () => {
    // Order: 000000000000000000000301
    // Sub-order 2 belongs to vendor2 (Desi Threads): 000000000000000000000402
    // Vendor 1 attempts to update it
    const res = await api('/api/orders/000000000000000000000301/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${vendor1Token}` },
      body: JSON.stringify({
        subOrderId: '000000000000000000000402',
        status: 'shipped'
      })
    });
    expect(res.status).toBe(403);
  });

  test('T13: Invalid status jump (pending -> delivered) returns 409', async () => {
    // Order 000000000000000000000303, sub-order 000000000000000000000404 belongs to vendor 1 and is 'pending'
    const res = await api('/api/orders/000000000000000000000303/status', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${vendor1Token}` },
      body: JSON.stringify({
        subOrderId: '000000000000000000000404',
        status: 'delivered'
      })
    });
    expect(res.status).toBe(409);
    expect(res.body?.error?.code).toBe('INVALID_STATUS_TRANSITION');
  });

  test('T14: Cancel sub-order releases stock back to catalogue', async () => {
    // 1. Check initial stock for product 000000000000000000000207 (Chanderi Silk Saree, Desi Threads)
    const p1 = await api('/api/products/000000000000000000000207');
    expect(p1.status).toBe(200);
    const initialStock = p1.body.data.stock;

    // 2. Place order for 2 items
    const orderRes = await api('/api/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': `idemp-cancel-${Date.now()}`
      },
      body: JSON.stringify({
        items: [{ productId: '000000000000000000000207', qty: 2 }],
        shippingAddress: {
          fullName: 'Aarav Sharma',
          street: 'Release St',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    expect([200, 201]).toContain(orderRes.status);
    const order = orderRes.body.data;
    const orderId = order.id || order._id;
    const subOrder = order.subOrders[0];
    const subOrderId = subOrder.id || subOrder._id;

    // Verify stock was reduced
    const p2 = await api('/api/products/000000000000000000000207');
    expect(p2.body.data.stock).toBe(initialStock - 2);

    // 3. Vendor 2 cancels the sub-order
    const cancelRes = await api(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${vendor2Token}` },
      body: JSON.stringify({
        subOrderId: subOrderId,
        status: 'cancelled'
      })
    });
    expect(cancelRes.status).toBe(200);

    // 4. Verify stock has been restored (+2)
    const p3 = await api('/api/products/000000000000000000000207');
    expect(p3.body.data.stock).toBe(initialStock);
  });

  test('T15: Admin dashboard counts equal direct DB counts', async () => {
    const dashRes = await api('/api/dashboard/admin', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    expect(dashRes.status).toBe(200);
    const summary = dashRes.body.data.summary;

    // Connect to Mongo directly to verify truth
    const authConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_auth').asPromise();
    const vendorConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_vendor').asPromise();
    const catConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_catalogue').asPromise();
    const orderConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_orders').asPromise();

    const dbUsers = await authConn.collection('users').countDocuments();
    const dbVendors = await vendorConn.collection('vendors').countDocuments();
    const dbProducts = await catConn.collection('products').countDocuments();
    const dbOrders = await orderConn.collection('orders').countDocuments();

    await authConn.close();
    await vendorConn.close();
    await catConn.close();
    await orderConn.close();

    expect(summary.totalUsers).toBe(dbUsers);
    expect(summary.totalVendors).toBe(dbVendors);
    expect(summary.totalProducts).toBe(dbProducts);
    expect(summary.totalOrders).toBe(dbOrders);
  });

  test('T16: Seed run twice produces zero duplicate records', async () => {
    // Run seed twice
    execSync('node scripts/seed.js', { stdio: 'pipe' });
    execSync('node scripts/seed.js', { stdio: 'pipe' });

    const authConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_auth').asPromise();
    const vendorConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_vendor').asPromise();
    const catConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_catalogue').asPromise();
    const orderConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/marketplace_orders').asPromise();

    const users = await authConn.collection('users').find({}).toArray();
    const emails = users.map(u => u.email);
    const uniqueEmails = new Set(emails);
    expect(emails.length).toBe(uniqueEmails.size);

    const vendors = await vendorConn.collection('vendors').find({}).toArray();
    const vendorSlugs = vendors.map(v => v.slug);
    const uniqueSlugs = new Set(vendorSlugs);
    expect(vendorSlugs.length).toBe(uniqueSlugs.size);

    const orders = await orderConn.collection('orders').find({}).toArray();
    const orderIds = orders.map(o => o._id.toString());
    const uniqueOrderIds = new Set(orderIds);
    expect(orderIds.length).toBe(uniqueOrderIds.size);

    await authConn.close();
    await vendorConn.close();
    await catConn.close();
    await orderConn.close();
  });

  test('T17: KYC URL requested without auth returns 401/403', async () => {
    const res = await api('/api/vendors/000000000000000000000101/kyc');
    expect([401, 403]).toContain(res.status);
  });

  test('T18: npm run build in frontend/ passes with no type errors', async () => {
    const buildOutput = execSync('npm run build -w frontend', { encoding: 'utf-8' });
    expect(buildOutput).toContain('built in');
  });

});
