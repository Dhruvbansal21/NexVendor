import { Product } from '../models/Product.js';
import { notFound, forbidden, conflict, badRequest, internalRequest, logger } from '@marketplace/shared';

const VENDOR_URL = process.env.VENDOR_URL || 'http://127.0.0.1:4002';

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

export async function getPublicProducts({
  search,
  category,
  vendorId,
  page = 1,
  limit = 12,
  sort = '-createdAt'
}) {
  // CRITICAL Rule R7: Public catalogue only returns status: active AND vendorStatus: verified
  const query = {
    status: 'active',
    vendorStatus: 'verified'
  };

  if (category) {
    query.category = category;
  }

  if (vendorId) {
    query.vendorId = vendorId;
  }

  if (search && search.trim() !== '') {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: regex }, { description: regex }];
  }

  const sortOption = {};
  if (sort === 'price_asc') sortOption.price = 1;
  else if (sort === 'price_desc') sortOption.price = -1;
  else if (sort === 'title') sortOption.title = 1;
  else sortOption.createdAt = -1;

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
    Product.countDocuments(query)
  ]);

  return {
    products: products.map(p => p.toJSON()),
    page: Number(page),
    limit: Number(limit),
    total
  };
}

export async function getProductById(id, requestingUserId = null, correlationId = null) {
  const product = await Product.findById(id);
  if (!product) {
    throw notFound('Product not found', 'PRODUCT_NOT_FOUND');
  }

  // Check if publicly visible
  if (product.status === 'active' && product.vendorStatus === 'verified') {
    return product.toJSON();
  }

  // If not publicly visible, check if requesting user is the vendor owner
  if (requestingUserId) {
    const vendor = await getVendorByUserId(requestingUserId, correlationId);
    if (vendor && vendor.id === product.vendorId.toString()) {
      return product.toJSON();
    }
  }

  throw notFound('Product not found or not active', 'PRODUCT_NOT_FOUND');
}

export async function getCategories() {
  const categories = await Product.aggregate([
    {
      $match: {
        status: 'active',
        vendorStatus: 'verified'
      }
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        count: 1
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return categories;
}

export async function getVendorProducts(userId, { search, status, page = 1, limit = 12 }, correlationId) {
  const vendor = await getVendorByUserId(userId, correlationId);
  if (!vendor) {
    return {
      products: [],
      page: Number(page),
      limit: Number(limit),
      total: 0
    };
  }

  const query = { vendorId: vendor.id };
  if (status) {
    query.status = status;
  }
  if (search && search.trim() !== '') {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(query)
  ]);

  return {
    products: products.map(p => p.toJSON()),
    page: Number(page),
    limit: Number(limit),
    total
  };
}

export async function createProduct(userId, data, correlationId) {
  const vendor = await getVendorByUserId(userId, correlationId);
  if (!vendor) {
    throw badRequest('Please complete vendor onboarding before creating products', [], 'VENDOR_NOT_FOUND');
  }

  // Unverified vendor rule: forced draft, active rejected with 403
  let finalStatus = data.status || 'draft';
  if (vendor.status !== 'verified') {
    if (finalStatus === 'active') {
      throw forbidden('Unverified vendor cannot publish active products. Status must be draft.', 'VENDOR_NOT_VERIFIED');
    }
    finalStatus = 'draft';
  }

  const product = await Product.create({
    vendorId: vendor.id,
    storeName: vendor.storeName,
    vendorStatus: vendor.status,
    title: data.title,
    description: data.description,
    price: data.price,
    category: data.category,
    stock: data.stock,
    imageUrl: data.imageUrl,
    status: finalStatus
  });

  return product.toJSON();
}

export async function updateProduct(userId, productId, data, correlationId) {
  const vendor = await getVendorByUserId(userId, correlationId);
  if (!vendor) {
    throw forbidden('Vendor profile required', 'VENDOR_NOT_FOUND');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw notFound('Product not found', 'PRODUCT_NOT_FOUND');
  }

  // Ownership check
  if (product.vendorId.toString() !== vendor.id) {
    throw forbidden('Cannot modify products owned by another vendor', 'FORBIDDEN');
  }

  if (data.status === 'active' && vendor.status !== 'verified') {
    throw forbidden('Unverified vendor cannot publish active products', 'VENDOR_NOT_VERIFIED');
  }

  if (data.title !== undefined) product.title = data.title;
  if (data.description !== undefined) product.description = data.description;
  if (data.price !== undefined) product.price = data.price;
  if (data.category !== undefined) product.category = data.category;
  if (data.stock !== undefined) product.stock = data.stock;
  if (data.imageUrl !== undefined) product.imageUrl = data.imageUrl;
  if (data.status !== undefined) product.status = data.status;

  await product.save();
  return product.toJSON();
}

export async function deleteProduct(userId, productId, correlationId) {
  const vendor = await getVendorByUserId(userId, correlationId);
  if (!vendor) {
    throw forbidden('Vendor profile required', 'VENDOR_NOT_FOUND');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw notFound('Product not found', 'PRODUCT_NOT_FOUND');
  }

  if (product.vendorId.toString() !== vendor.id) {
    throw forbidden('Cannot delete products owned by another vendor', 'FORBIDDEN');
  }

  await Product.deleteOne({ _id: productId });
  return { message: 'Product deleted successfully' };
}

export async function reserveStock(items, correlationId) {
  const reserved = [];

  for (const item of items) {
    // Atomic conditional decrement: stock must be >= requested qty and product active
    const updated = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        status: 'active',
        vendorStatus: 'verified',
        stock: { $gte: item.qty }
      },
      {
        $inc: { stock: -item.qty }
      },
      { new: true }
    );

    if (!updated) {
      // Roll back all already-reserved items in this transaction
      for (const r of reserved) {
        await Product.updateOne(
          { _id: r.productId },
          { $inc: { stock: r.qty } }
        );
      }
      throw conflict(
        `Insufficient stock or product inactive for productId: ${item.productId}`,
        'STOCK_UNAVAILABLE',
        [{ productId: item.productId, requestedQty: item.qty }]
      );
    }

    reserved.push({
      productId: updated._id.toString(),
      title: updated.title,
      unitPrice: updated.price, // Trusted server-side price in paise
      vendorId: updated.vendorId.toString(),
      storeName: updated.storeName,
      qty: item.qty,
      lineTotal: updated.price * item.qty
    });
  }

  return reserved;
}

export async function releaseStock(items, correlationId) {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: item.qty } }
    );
  }

  return { message: 'Stock released successfully', count: items.length };
}

export async function syncVendorStatus(vendorId, { status, storeName }, correlationId) {
  const updateFields = { vendorStatus: status };
  if (storeName) {
    updateFields.storeName = storeName;
  }

  const result = await Product.updateMany(
    { vendorId },
    { $set: updateFields }
  );

  return { updatedCount: result.modifiedCount };
}

export async function getStats() {
  const [totalProducts, activeProducts, draftProducts, outOfStockProducts, categories] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'draft' }),
    Product.countDocuments({ stock: 0 }),
    Product.distinct('category')
  ]);

  return {
    totalProducts,
    activeProducts,
    draftProducts,
    outOfStockProducts,
    categoriesCount: categories.length
  };
}
