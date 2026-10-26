import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer paise price'
      }
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer quantity'
      }
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer paise line total'
      }
    }
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const subOrderSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    storeName: {
      type: String,
      required: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer paise subtotal'
      }
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true
    },
    statusHistory: [statusHistorySchema]
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret.id;
        ret.vendorId = ret.vendorId ? ret.vendorId.toString() : ret.vendorId;
        return ret;
      }
    }
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    idempotencyKey: {
      type: String,
      required: true
    },
    subOrders: [subOrderSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer paise total'
      }
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentStatus: {
      type: String,
      default: 'demo_paid'
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret._id = ret.id;
        ret.customerId = ret.customerId ? ret.customerId.toString() : ret.customerId;
        delete ret.__v;
        return ret;
      }
    }
  }
);

orderSchema.index({ customerId: 1, idempotencyKey: 1 }, { unique: true });

export const Order = mongoose.model('Order', orderSchema);
