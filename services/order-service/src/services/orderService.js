import { Order } from '../models/Order.js';
import { notFound, forbidden, conflict, badRequest, internalRequest, logger, AppError } from '@marketplace/shared';

const CATALOGUE_URL = process.env.CATALOGUE_URL || 'http://127.0.0.1:4003';
const VENDOR_URL = process.env.VENDOR_URL || 'http://127.0.0.1:4002';

const VALID_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

async function getVendorByUserId(userId, correlationId) {
  try {
    const res = await internalRequest(`${VENDOR_URL}/internal/vendors/by-user/${userId}`, {
      method: 'GET',
      correlationId
    });
    return res.data;
  } catch (err) {
    if (err.statusCode === 404) return null;
    throw err;
  }
}

async function releaseStock(items, correlationId) {
  try {
    await internalRequest(`${CATALOGUE_URL}/internal/stock/release`, {
      method: 'POST',
      body: { items: items.map(i => ({ productId: i.productId, qty: i.qty })) },
      correlationId
    });
  } catch (err) {
    logger.error({ err: err.message, items }, '[Order-Service] Compensating stock release failed');
  }
}

export async function createOrder({
  customerId,
  idempotencyKey,
  items,
  shippingAddress,
  correlationId
}) {
  // Step A: Check DB for existing order by customerId + idempotencyKey
  const existing = await Order.findOne({ customerId, idempotencyKey });
  if (existing) {
    logger.info({ customerId, idempotencyKey }, '[Order-Service] Idempotent order replay detected');
    return {
      order: existing.toJSON(),
      isReplay: true
    };
  }

  // Step B: Atomically reserve stock via Catalogue Service internal API
  const reserveResult = await internalRequest(`${CATALOGUE_URL}/internal/stock/reserve`, {
    method: 'POST',
    body: { items },
    correlationId
  });
  const reservedLines = reserveResult.data;

  // Step C: Group reserved items by vendor into subOrders
  const vendorMap = new Map();
  for (const line of reservedLines) {
    const vId = line.vendorId.toString();
    if (!vendorMap.has(vId)) {
      vendorMap.set(vId, {
        vendorId: line.vendorId,
        storeName: line.storeName,
        items: [],
        subtotal: 0,
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(),
            updatedBy: customerId
          }
        ]
      });
    }

    const group = vendorMap.get(vId);
    group.items.push({
      productId: line.productId,
      title: line.title,
      unitPrice: line.unitPrice,
      qty: line.qty,
      lineTotal: line.lineTotal
    });
    group.subtotal += line.lineTotal;
  }

  const subOrders = Array.from(vendorMap.values());
  const totalAmount = subOrders.reduce((acc, sub) => acc + sub.subtotal, 0);

  // Step D: Insert Order into DB with compensation on failure
  try {
    const order = await Order.create({
      customerId,
      idempotencyKey,
      subOrders,
      totalAmount,
      currency: 'INR',
      paymentStatus: 'demo_paid',
      shippingAddress
    });

    return {
      order: order.toJSON(),
      isReplay: false
    };
  } catch (err) {
    // Duplicate key race condition
    if (err.code === 11000) {
      await releaseStock(items, correlationId);
      const wonOrder = await Order.findOne({ customerId, idempotencyKey });
      if (wonOrder) {
        return {
          order: wonOrder.toJSON(),
          isReplay: true
        };
      }
    }

    // Insert failed -> call compensating action to release reserved stock!
    await releaseStock(items, correlationId);
    throw new AppError('Order creation failed, stock released', 500, 'ORDER_CREATE_FAILED', [err.message]);
  }
}

export async function getCustomerOrders(customerId, { page = 1, limit = 10 }) {
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find({ customerId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments({ customerId })
  ]);

  return {
    orders: orders.map(o => o.toJSON()),
    page: Number(page),
    limit: Number(limit),
    total
  };
}

export async function getOrderById(orderId, requestingUser) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw notFound('Order not found', 'ORDER_NOT_FOUND');
  }

  const isOwner = requestingUser && requestingUser.id === order.customerId.toString();
  const isAdmin = requestingUser && requestingUser.role === 'admin';

  if (!isAdmin && !isOwner) {
    throw notFound('Order not found', 'ORDER_NOT_FOUND');
  }

  return order.toJSON();
}

export async function getVendorOrders(userId, { status, page = 1, limit = 10 }, correlationId) {
  const vendor = await getVendorByUserId(userId, correlationId);
  if (!vendor) {
    return { orders: [], page: Number(page), limit: Number(limit), total: 0 };
  }

  const query = { 'subOrders.vendorId': vendor.id };
  if (status) {
    query['subOrders.status'] = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(query)
  ]);

  const vendorSubOrders = [];
  for (const o of orders) {
    for (const sub of o.subOrders) {
      if (sub.vendorId.toString() === vendor.id && (!status || sub.status === status)) {
        vendorSubOrders.push({
          orderId: o._id.toString(),
          subOrderId: sub._id.toString(),
          storeName: sub.storeName,
          items: sub.items,
          subtotal: sub.subtotal,
          status: sub.status,
          statusHistory: sub.statusHistory,
          shippingAddress: o.shippingAddress,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt
        });
      }
    }
  }

  return {
    orders: vendorSubOrders,
    page: Number(page),
    limit: Number(limit),
    total
  };
}

export async function updateSubOrderStatus(userId, orderId, subOrderId, newStatus, correlationId) {
  const vendor = await getVendorByUserId(userId, correlationId);
  if (!vendor) {
    throw forbidden('Vendor profile required', 'VENDOR_NOT_FOUND');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw notFound('Order not found', 'ORDER_NOT_FOUND');
  }

  const subOrder = order.subOrders.id(subOrderId);
  if (!subOrder) {
    throw notFound('Sub-order not found', 'SUBORDER_NOT_FOUND');
  }

  // Ownership check: vendor can only update their own sub-order
  if (subOrder.vendorId.toString() !== vendor.id) {
    throw forbidden('Cannot update sub-orders belonging to another vendor', 'FORBIDDEN');
  }

  // State machine transition validation
  const allowed = VALID_TRANSITIONS[subOrder.status] || [];
  if (!allowed.includes(newStatus)) {
    throw conflict(
      `Invalid status transition from ${subOrder.status} to ${newStatus}. Allowed transitions: ${allowed.join(', ') || 'none'}`,
      'INVALID_STATUS_TRANSITION'
    );
  }

  // If cancelling sub-order -> release stock back to catalogue
  if (newStatus === 'cancelled') {
    await releaseStock(
      subOrder.items.map(i => ({ productId: i.productId.toString(), qty: i.qty })),
      correlationId
    );
  }

  subOrder.status = newStatus;
  subOrder.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: userId
  });

  await order.save();
  return order.toJSON();
}

export async function getAdminOrders({ status, page = 1, limit = 10 }) {
  const query = {};
  if (status) {
    query['subOrders.status'] = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(query)
  ]);

  return {
    orders: orders.map(o => o.toJSON()),
    page: Number(page),
    limit: Number(limit),
    total
  };
}

export async function getStats() {
  const [totalOrders, allOrders] = await Promise.all([
    Order.countDocuments(),
    Order.find({}, 'totalAmount subOrders')
  ]);

  let totalRevenuePaise = 0;
  let totalSubOrders = 0;
  const statusCounts = { pending: 0, confirmed: 0, packed: 0, shipped: 0, delivered: 0, cancelled: 0 };

  for (const o of allOrders) {
    totalRevenuePaise += o.totalAmount || 0;
    if (o.subOrders) {
      totalSubOrders += o.subOrders.length;
      for (const sub of o.subOrders) {
        if (statusCounts[sub.status] !== undefined) {
          statusCounts[sub.status]++;
        }
      }
    }
  }

  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

  return {
    totalOrders,
    totalSubOrders,
    totalRevenuePaise,
    statusCounts,
    recentOrders: recentOrders.map(o => o.toJSON())
  };
}

export async function getVendorStats(vendorId) {
  const orders = await Order.find({ 'subOrders.vendorId': vendorId });
  let totalSalesPaise = 0;
  let totalSubOrders = 0;
  let pendingOrders = 0;
  const recentOrders = [];

  for (const o of orders) {
    for (const sub of o.subOrders) {
      if (sub.vendorId.toString() === vendorId) {
        totalSalesPaise += sub.subtotal;
        totalSubOrders++;
        if (sub.status === 'pending') pendingOrders++;
        if (recentOrders.length < 5) {
          recentOrders.push({
            orderId: o._id.toString(),
            subOrderId: sub._id.toString(),
            subtotal: sub.subtotal,
            status: sub.status,
            createdAt: o.createdAt
          });
        }
      }
    }
  }

  return {
    totalSalesPaise,
    totalSubOrders,
    pendingOrders,
    recentOrders
  };
}

export async function getCustomerStats(customerId) {
  const orders = await Order.find({ customerId });
  let totalOrders = orders.length;
  let activeOrders = 0;

  for (const o of orders) {
    const isOrderActive = o.subOrders.some(s => s.status !== 'delivered' && s.status !== 'cancelled');
    if (isOrderActive) activeOrders++;
  }

  const recentOrders = orders.slice(0, 5).map(o => o.toJSON());
  return {
    totalOrders,
    activeOrders,
    recentOrders
  };
}
