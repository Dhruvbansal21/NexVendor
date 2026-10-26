import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { badRequest } from '@marketplace/shared';

const uploadDir = process.env.KYC_UPLOAD_DIR
  ? path.resolve(process.cwd(), process.env.KYC_UPLOAD_DIR)
  : path.resolve(process.cwd(), 'private_uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(16).toString('hex');
    cb(null, `kyc-${Date.now()}-${unique}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(badRequest(`Unsupported file type: ${ext}. Allowed: PDF, JPG, PNG`, [], 'INVALID_FILE_TYPE'), false);
  }
};

export const kycUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export { uploadDir };
