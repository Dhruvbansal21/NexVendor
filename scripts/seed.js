import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo@12345';
const MONGO_BASE = 'mongodb://127.0.0.1:27017';

async function seed() {
  console.log('--- Starting Idempotent Database Seed ---');
  console.log('Connecting to microservice databases...');

  const connAuth = await mongoose.createConnection(`${MONGO_BASE}/marketplace_auth`).asPromise();
  const connVendor = await mongoose.createConnection(`${MONGO_BASE}/marketplace_vendor`).asPromise();
  const connCat = await mongoose.createConnection(`${MONGO_BASE}/marketplace_catalogue`).asPromise();
  const connOrders = await mongoose.createConnection(`${MONGO_BASE}/marketplace_orders`).asPromise();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1. AUTH USERS (Upsert by email)
  console.log('Seeding Auth users...');
  const usersData = [
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000001'),
      name: 'Platform Admin',
      email: 'admin@demo.test',
      passwordHash,
      role: 'admin',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000002'),
      name: 'Aarav Sharma',
      email: 'customer1@demo.test',
      passwordHash,
      role: 'customer',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000003'),
      name: 'Priya Patel',
      email: 'customer2@demo.test',
      passwordHash,
      role: 'customer',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000004'),
      name: 'Rohan Gupta',
      email: 'customer3@demo.test',
      passwordHash,
      role: 'customer',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000010'),
      name: 'Vikram Mehta (TechNest)',
      email: 'vendor1@demo.test',
      passwordHash,
      role: 'vendor',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000020'),
      name: 'Ananya Rao (Desi Threads)',
      email: 'vendor2@demo.test',
      passwordHash,
      role: 'vendor',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000030'),
      name: 'Sunil Kumar (Green Basket)',
      email: 'vendor3@demo.test',
      passwordHash,
      role: 'vendor',
      createdAt: new Date()
    }
  ];

  for (const u of usersData) {
    await connAuth.collection('users').updateOne(
      { email: u.email },
      { $set: u },
      { upsert: true }
    );
  }

  // 2. VENDORS (Upsert by slug)
  console.log('Seeding Vendors...');
  const vendorsData = [
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000101'),
      userId: new mongoose.Types.ObjectId('000000000000000000000010'),
      storeName: 'TechNest',
      slug: 'technest',
      description: 'Premium gaming gear, workspace accessories, and smart devices.',
      contactEmail: 'vendor1@demo.test',
      contactPhone: '+919811122233',
      status: 'verified',
      commissionPct: 10,
      kycDocs: [
        {
          docId: 'doc-technest-01',
          filename: 'technest_gst.pdf',
          originalName: 'TechNest_GST_Certificate.pdf',
          mimeType: 'application/pdf',
          size: 142500,
          filePath: './private_uploads/technest_gst.pdf',
          uploadedAt: new Date()
        }
      ],
      verifiedAt: new Date(),
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000102'),
      userId: new mongoose.Types.ObjectId('000000000000000000000020'),
      storeName: 'Desi Threads',
      slug: 'desi-threads',
      description: 'Handcrafted apparel, pure khadi, Kashmiri pashminas, and authentic artisan home decor.',
      contactEmail: 'vendor2@demo.test',
      contactPhone: '+919844455566',
      status: 'verified',
      commissionPct: 10,
      kycDocs: [
        {
          docId: 'doc-threads-01',
          filename: 'desithreads_pan.pdf',
          originalName: 'DesiThreads_Business_License.pdf',
          mimeType: 'application/pdf',
          size: 198000,
          filePath: './private_uploads/desithreads_pan.pdf',
          uploadedAt: new Date()
        }
      ],
      verifiedAt: new Date(),
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000103'),
      userId: new mongoose.Types.ObjectId('000000000000000000000030'),
      storeName: 'Green Basket',
      slug: 'green-basket',
      description: 'Farm-fresh organic cold-pressed oils and natural kitchen essentials.',
      contactEmail: 'vendor3@demo.test',
      contactPhone: '+919877788899',
      status: 'pending',
      commissionPct: 10,
      kycDocs: [
        {
          docId: 'doc-basket-01',
          filename: 'greenbasket_fssai.pdf',
          originalName: 'FSSAI_License_Application.pdf',
          mimeType: 'application/pdf',
          size: 92400,
          filePath: './private_uploads/greenbasket_fssai.pdf',
          uploadedAt: new Date()
        }
      ],
      verifiedAt: null,
      createdAt: new Date()
    }
  ];

  for (const v of vendorsData) {
    await connVendor.collection('vendors').updateOne(
      { slug: v.slug },
      { $set: v },
      { upsert: true }
    );
  }

  // 3. CATALOGUE PRODUCTS (Upsert by title + vendorId)
  console.log('Seeding Catalogue Products...');
  const v1Id = new mongoose.Types.ObjectId('000000000000000000000101'); // TechNest
  const v2Id = new mongoose.Types.ObjectId('000000000000000000000102'); // Desi Threads
  const v3Id = new mongoose.Types.ObjectId('000000000000000000000103'); // Green Basket

  const productsData = [
    // TechNest
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000201'),
      vendorId: v1Id,
      storeName: 'TechNest',
      vendorStatus: 'verified',
      title: 'ANC Wireless Headphones Over-Ear',
      description: 'Active Noise Cancelling Bluetooth 5.3 headphones with 40-hour battery life and memory foam earcups.',
      price: 299900, // ₹2,999.00
      category: 'Electronics',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000202'),
      vendorId: v1Id,
      storeName: 'TechNest',
      vendorStatus: 'verified',
      title: 'Mechanical Gaming Keyboard RGB',
      description: 'Tenkeyless custom linear switches, hot-swappable PCB, double-shot PBT keycaps and per-key RGB backlighting.',
      price: 189900, // ₹1,899.00
      category: 'Electronics',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000203'),
      vendorId: v1Id,
      storeName: 'TechNest',
      vendorStatus: 'verified',
      title: 'Ergonomic Vertical Wireless Mouse',
      description: 'Natural handshake position 57° ergonomic optical mouse designed to reduce wrist strain during long sessions.',
      price: 84900, // ₹849.00
      category: 'Electronics',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000204'),
      vendorId: v1Id,
      storeName: 'TechNest',
      vendorStatus: 'verified',
      title: 'High-Speed USB-C Thunderbolt 4 Dock',
      description: '12-in-1 aluminium docking station with dual 4K 60Hz HDMI, 100W Power Delivery, and Gigabit Ethernet.',
      price: 349900, // ₹3,499.00
      category: 'Electronics',
      stock: 0, // OUT OF STOCK TEST CASE
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000205'),
      vendorId: v1Id,
      storeName: 'TechNest',
      vendorStatus: 'verified',
      title: 'Prototype Smart Glass v2',
      description: 'Experimental heads-up display prototype for developers. Not yet released for public purchase.',
      price: 999900, // ₹9,999.00
      category: 'Electronics',
      stock: 5,
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=80',
      status: 'draft', // DRAFT TEST CASE
      createdAt: new Date()
    },

    // Desi Threads
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000206'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Handwoven Pure Khadi Cotton Shirt',
      description: 'Breathable, sustainable handspun organic cotton casual shirt with natural coconut shell buttons.',
      price: 129900, // ₹1,299.00
      category: 'Fashion & Apparel',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000207'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Embroidered Kashmiri Pashmina Shawl',
      description: 'Authentic 100% fine Cashmere wool shawl featuring delicate Sozni needlework embroidery by master weavers.',
      price: 449900, // ₹4,499.00
      category: 'Fashion & Apparel',
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000208'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Jaipur Indigo Hand Block-Print Kurta',
      description: 'Handcrafted knee-length ethnic kurta made using traditional natural vegetable indigo dyes.',
      price: 89900, // ₹899.00
      category: 'Fashion & Apparel',
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000209'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Handmade Terracotta Clay Water Dispenser',
      description: 'Natural clay pot with brass tap that cools drinking water naturally through micro-porous evaporation.',
      price: 74900, // ₹749.00
      category: 'Home & Living',
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000210'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Hand-Carved Sheesham Wood Serving Tray',
      description: 'Solid Indian rosewood decorative serving tray with traditional brass inlay work and protective food-safe oil finish.',
      price: 119900, // ₹1,199.00
      category: 'Handicrafts',
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000211'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Handmade Brass Diya Oil Lamp Set',
      description: 'Heavy solid brass traditional oil lamps for festive and home decor, hand-polished to a golden sheen.',
      price: 64900, // ₹649.00
      category: 'Handicrafts',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000212'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Organic Soy Wax Lavender Scented Candle',
      description: 'Clean-burning aromatherapy soy candle infused with natural essential oils in a recyclable glass amber jar.',
      price: 49900, // ₹499.00
      category: 'Home & Living',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000213'),
      vendorId: v2Id,
      storeName: 'Desi Threads',
      vendorStatus: 'verified',
      title: 'Ayurvedic Kumkumadi Face Glow Oil',
      description: 'Traditional 100% natural facial oil formulation infused with pure saffron and 16 therapeutic herbs.',
      price: 99900, // ₹999.00
      category: 'Beauty & Wellness',
      stock: 22,
      imageUrl: 'https://images.unsplash.com/photo-1608248597359-299317540212?w=800&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date()
    },

    // Green Basket (Pending vendor -> product status draft & vendorStatus pending)
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000214'),
      vendorId: v3Id,
      storeName: 'Green Basket',
      vendorStatus: 'pending',
      title: 'Cold-Pressed Wood-Churned Mustard Oil',
      description: 'Kachi Ghani unfiltered mustard oil with natural pungency and antioxidants.',
      price: 34900,
      category: 'Home & Living',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
      status: 'draft',
      createdAt: new Date()
    }
  ];

  for (const p of productsData) {
    await connCat.collection('products').updateOne(
      { title: p.title, vendorId: p.vendorId },
      { $set: p },
      { upsert: true }
    );
  }

  // 4. ORDERS & SUB-ORDERS (Upsert by idempotencyKey)
  console.log('Seeding Multi-Vendor Orders & Sub-Orders...');
  const c1Id = new mongoose.Types.ObjectId('000000000000000000000002');
  const c2Id = new mongoose.Types.ObjectId('000000000000000000000003');

  const ordersData = [
    // Order 1: Multi-vendor order (TechNest + Desi Threads)
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000301'),
      customerId: c1Id,
      idempotencyKey: 'seed-idempotency-key-001',
      totalAmount: 429800, // ₹4,298.00
      currency: 'INR',
      paymentStatus: 'demo_paid',
      shippingAddress: {
        fullName: 'Aarav Sharma',
        street: '42 MG Road, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        phone: '+919876543210'
      },
      subOrders: [
        {
          _id: new mongoose.Types.ObjectId('000000000000000000000401'),
          vendorId: v1Id,
          storeName: 'TechNest',
          subtotal: 299900,
          status: 'shipped',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 2), updatedBy: c1Id.toString() },
            { status: 'confirmed', timestamp: new Date(Date.now() - 86400000), updatedBy: '000000000000000000000010' },
            { status: 'packed', timestamp: new Date(Date.now() - 43200000), updatedBy: '000000000000000000000010' },
            { status: 'shipped', timestamp: new Date(Date.now() - 21600000), updatedBy: '000000000000000000000010' }
          ],
          items: [
            {
              productId: new mongoose.Types.ObjectId('000000000000000000000201'),
              title: 'ANC Wireless Headphones Over-Ear',
              unitPrice: 299900,
              qty: 1,
              lineTotal: 299900
            }
          ]
        },
        {
          _id: new mongoose.Types.ObjectId('000000000000000000000402'),
          vendorId: v2Id,
          storeName: 'Desi Threads',
          subtotal: 129900,
          status: 'confirmed',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 2), updatedBy: c1Id.toString() },
            { status: 'confirmed', timestamp: new Date(Date.now() - 86400000), updatedBy: '000000000000000000000020' }
          ],
          items: [
            {
              productId: new mongoose.Types.ObjectId('000000000000000000000206'),
              title: 'Handwoven Pure Khadi Cotton Shirt',
              unitPrice: 129900,
              qty: 1,
              lineTotal: 129900
            }
          ]
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 2)
    },

    // Order 2: Single vendor order (Desi Threads) delivered
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000302'),
      customerId: c2Id,
      idempotencyKey: 'seed-idempotency-key-002',
      totalAmount: 119900,
      currency: 'INR',
      paymentStatus: 'demo_paid',
      shippingAddress: {
        fullName: 'Priya Patel',
        street: '15 Nehru Nagar',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380015',
        country: 'India',
        phone: '+919822233344'
      },
      subOrders: [
        {
          _id: new mongoose.Types.ObjectId('000000000000000000000403'),
          vendorId: v2Id,
          storeName: 'Desi Threads',
          subtotal: 119900,
          status: 'delivered',
          statusHistory: [
            { status: 'pending', timestamp: new Date(Date.now() - 86400000 * 5), updatedBy: c2Id.toString() },
            { status: 'confirmed', timestamp: new Date(Date.now() - 86400000 * 4), updatedBy: '000000000000000000000020' },
            { status: 'packed', timestamp: new Date(Date.now() - 86400000 * 3), updatedBy: '000000000000000000000020' },
            { status: 'shipped', timestamp: new Date(Date.now() - 86400000 * 2), updatedBy: '000000000000000000000020' },
            { status: 'delivered', timestamp: new Date(Date.now() - 86400000), updatedBy: '000000000000000000000020' }
          ],
          items: [
            {
              productId: new mongoose.Types.ObjectId('000000000000000000000210'),
              title: 'Hand-Carved Sheesham Wood Serving Tray',
              unitPrice: 119900,
              qty: 1,
              lineTotal: 119900
            }
          ]
        }
      ],
      createdAt: new Date(Date.now() - 86400000 * 5)
    },

    // Order 3: TechNest pending order
    {
      _id: new mongoose.Types.ObjectId('000000000000000000000303'),
      customerId: c1Id,
      idempotencyKey: 'seed-idempotency-key-003',
      totalAmount: 189900,
      currency: 'INR',
      paymentStatus: 'demo_paid',
      shippingAddress: {
        fullName: 'Aarav Sharma',
        street: '42 MG Road, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        phone: '+919876543210'
      },
      subOrders: [
        {
          _id: new mongoose.Types.ObjectId('000000000000000000000404'),
          vendorId: v1Id,
          storeName: 'TechNest',
          subtotal: 189900,
          status: 'pending',
          statusHistory: [
            { status: 'pending', timestamp: new Date(), updatedBy: c1Id.toString() }
          ],
          items: [
            {
              productId: new mongoose.Types.ObjectId('000000000000000000000202'),
              title: 'Mechanical Gaming Keyboard RGB',
              unitPrice: 189900,
              qty: 1,
              lineTotal: 189900
            }
          ]
        }
      ],
      createdAt: new Date()
    }
  ];

  for (const o of ordersData) {
    await connOrders.collection('orders').updateOne(
      { customerId: o.customerId, idempotencyKey: o.idempotencyKey },
      { $set: o },
      { upsert: true }
    );
  }

  // Count summaries
  const [totalUsers, totalVendors, totalProducts, totalOrders] = await Promise.all([
    connAuth.collection('users').countDocuments(),
    connVendor.collection('vendors').countDocuments(),
    connCat.collection('products').countDocuments(),
    connOrders.collection('orders').countDocuments()
  ]);

  await Promise.all([
    connAuth.close(),
    connVendor.close(),
    connCat.close(),
    connOrders.close()
  ]);

  console.log('\n======================================================');
  console.log('✅ SEED COMPLETED SUCCESSFULLY (Idempotent Reruns Safe)');
  console.log('======================================================');
  console.log(`• Total Users:    ${totalUsers}`);
  console.log(`• Total Vendors:  ${totalVendors} (2 verified, 1 pending)`);
  console.log(`• Total Products: ${totalProducts} (12 active, 1 out-of-stock, 1 draft)`);
  console.log(`• Total Orders:   ${totalOrders} (multi-vendor sub-orders across statuses)`);
  console.log('------------------------------------------------------');
  console.log('DEMO CREDENTIALS:');
  console.log(`Password for all demo accounts: "${DEMO_PASSWORD}"`);
  console.log('• Admin:    admin@demo.test');
  console.log('• Customer: customer1@demo.test');
  console.log('• Customer: customer2@demo.test');
  console.log('• Customer: customer3@demo.test');
  console.log('• Vendor 1: vendor1@demo.test (TechNest - Verified)');
  console.log('• Vendor 2: vendor2@demo.test (Desi Threads - Verified)');
  console.log('• Vendor 3: vendor3@demo.test (Green Basket - Pending Review)');
  console.log('======================================================\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
