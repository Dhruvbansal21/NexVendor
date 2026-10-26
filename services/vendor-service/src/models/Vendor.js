import mongoose from 'mongoose';

const kycDocSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    filePath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const vendorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true
    },
    storeName: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true
    },
    rejectionReason: {
      type: String,
      default: null
    },
    commissionPct: {
      type: Number,
      default: 10
    },
    kycDocs: [kycDocSchema],
    verifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.userId = ret.userId ? ret.userId.toString() : ret.userId;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Method to return safe public vendor profile
vendorSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    storeName: this.storeName,
    slug: this.slug,
    description: this.description,
    contactEmail: this.contactEmail,
    contactPhone: this.contactPhone,
    status: this.status,
    verifiedAt: this.verifiedAt,
    createdAt: this.createdAt
  };
};

export const Vendor = mongoose.model('Vendor', vendorSchema);
