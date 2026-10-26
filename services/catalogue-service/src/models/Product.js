import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    storeName: {
      type: String,
      required: true,
      trim: true
    },
    vendorStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer paise price'
      }
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer stock value'
      }
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'active'],
      default: 'draft',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.vendorId = ret.vendorId ? ret.vendorId.toString() : ret.vendorId;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

productSchema.index({ status: 1, vendorStatus: 1, category: 1 });
productSchema.index({ title: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
