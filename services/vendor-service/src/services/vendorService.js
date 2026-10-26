import crypto from 'node:crypto';
import { Vendor } from '../models/Vendor.js';
import { conflict, notFound, forbidden, internalRequest, logger } from '@marketplace/shared';

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export async function onboardVendor({ userId, storeName, description, contactEmail, contactPhone, file }) {
  let vendor = await Vendor.findOne({ userId });

  let slug = generateSlug(storeName);
  // Ensure unique slug
  const existingSlug = await Vendor.findOne({ slug, userId: { $ne: userId } });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const kycDoc = file ? {
    docId: crypto.randomUUID(),
    filename: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    filePath: file.path,
    uploadedAt: new Date()
  } : null;

  if (vendor) {
    if (vendor.status === 'verified') {
      throw conflict('Vendor store is already verified', 'VENDOR_ALREADY_VERIFIED');
    }
    if (vendor.status === 'pending') {
      throw conflict('Vendor application is already pending review', 'APPLICATION_PENDING');
    }

    // Status was rejected: vendor re-applies
    vendor.storeName = storeName;
    vendor.slug = slug;
    vendor.description = description || '';
    vendor.contactEmail = contactEmail;
    vendor.contactPhone = contactPhone;
    vendor.status = 'pending';
    vendor.rejectionReason = null;
    if (kycDoc) {
      vendor.kycDocs.push(kycDoc);
    }
    await vendor.save();
    return vendor.toJSON();
  }

  vendor = await Vendor.create({
    userId,
    storeName,
    slug,
    description: description || '',
    contactEmail,
    contactPhone,
    status: 'pending',
    kycDocs: kycDoc ? [kycDoc] : []
  });

  return vendor.toJSON();
}

export async function getMyVendor(userId) {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw notFound('Vendor profile not found for this user', 'VENDOR_NOT_FOUND');
  }
  return vendor.toJSON();
}

export async function getVendors({ status, page = 1, limit = 12, isPublic = true }) {
  const query = {};
  if (isPublic) {
    query.status = 'verified';
  } else if (status) {
    query.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [vendors, total] = await Promise.all([
    Vendor.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Vendor.countDocuments(query)
  ]);

  const data = isPublic ? vendors.map(v => v.toPublicJSON()) : vendors.map(v => v.toJSON());
  return {
    vendors: data,
    page: Number(page),
    limit: Number(limit),
    total
  };
}

export async function getVendorById(vendorId, requestingUser = null) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw notFound('Vendor not found', 'VENDOR_NOT_FOUND');
  }

  const isOwner = requestingUser && requestingUser.id === vendor.userId.toString();
  const isAdmin = requestingUser && requestingUser.role === 'admin';

  if (!isAdmin && !isOwner && vendor.status !== 'verified') {
    throw notFound('Vendor not found or not currently active', 'VENDOR_NOT_FOUND');
  }

  return (!isAdmin && !isOwner) ? vendor.toPublicJSON() : vendor.toJSON();
}

export async function verifyVendor(vendorId, correlationId) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw notFound('Vendor not found', 'VENDOR_NOT_FOUND');
  }

  vendor.status = 'verified';
  vendor.verifiedAt = new Date();
  vendor.rejectionReason = null;
  await vendor.save();

  // Sync snapshot to Catalogue Service
  const catalogueUrl = process.env.CATALOGUE_URL || 'http://127.0.0.1:4003';
  try {
    await internalRequest(`${catalogueUrl}/internal/vendors/${vendor._id}/status-changed`, {
      method: 'POST',
      body: { status: 'verified', storeName: vendor.storeName },
      correlationId
    });
  } catch (err) {
    logger.warn({ err: err.message, vendorId }, '[Vendor-Service] Failed to notify catalogue service of status change');
  }

  return vendor.toJSON();
}

export async function rejectVendor(vendorId, reason, correlationId) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw notFound('Vendor not found', 'VENDOR_NOT_FOUND');
  }

  vendor.status = 'rejected';
  vendor.rejectionReason = reason;
  await vendor.save();

  // Sync snapshot to Catalogue Service
  const catalogueUrl = process.env.CATALOGUE_URL || 'http://127.0.0.1:4003';
  try {
    await internalRequest(`${catalogueUrl}/internal/vendors/${vendor._id}/status-changed`, {
      method: 'POST',
      body: { status: 'rejected', storeName: vendor.storeName },
      correlationId
    });
  } catch (err) {
    logger.warn({ err: err.message, vendorId }, '[Vendor-Service] Failed to notify catalogue service of status change');
  }

  return vendor.toJSON();
}

export async function getKycDoc(vendorId, docId, requestingUser) {
  if (!requestingUser) {
    throw forbidden('Authentication required to access KYC documents', 'UNAUTHORIZED');
  }

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    throw notFound('Vendor not found', 'VENDOR_NOT_FOUND');
  }

  const isOwner = requestingUser.id === vendor.userId.toString();
  const isAdmin = requestingUser.role === 'admin';

  if (!isAdmin && !isOwner) {
    throw forbidden('Not authorized to access private KYC documents', 'FORBIDDEN');
  }

  const doc = vendor.kycDocs.find(d => d.docId === docId);
  if (!doc) {
    throw notFound('KYC Document not found', 'DOCUMENT_NOT_FOUND');
  }

  return doc;
}

export async function getVendorByUserId(userId) {
  const vendor = await Vendor.findOne({ userId });
  if (!vendor) {
    throw notFound('Vendor not found for user', 'VENDOR_NOT_FOUND');
  }
  return vendor.toJSON();
}

export async function getStats() {
  const [totalVendors, pendingVendors, verifiedVendors, rejectedVendors] = await Promise.all([
    Vendor.countDocuments(),
    Vendor.countDocuments({ status: 'pending' }),
    Vendor.countDocuments({ status: 'verified' }),
    Vendor.countDocuments({ status: 'rejected' })
  ]);

  return {
    totalVendors,
    pendingVendors,
    verifiedVendors,
    rejectedVendors
  };
}
