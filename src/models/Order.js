import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  productType: { type: String, enum: ['TYPE_A', 'TYPE_B', 'TYPE_C'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedSize: { type: String, default: 'Standard' },
  selectedColor: { type: String, default: 'Royal Gold' },
  
  // Custom inputs for Type B products (Bride name, Groom name, Wedding date, Instructions)
  customTextInputs: {
    type: Map,
    of: String,
    default: {},
  },

  // Uploaded photo URLs for Type C products (1 to 50+ images)
  uploadedPhotos: [{ type: String }],
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, default: '' },
      address: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, default: 'Punjab' },
      postalCode: { type: String, default: '' },
      notes: { type: String, default: '' },
    },
    items: [OrderItemSchema],
    
    // Financial & Advance Payment Logic
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      advancePercentage: { type: Number, required: true, default: 30 }, // Fetched dynamically from Admin Settings
      advanceAmount: { type: Number, required: true }, // (totalAmount * advancePercentage) / 100
      remainingBalance: { type: Number, required: true }, // totalAmount - advanceAmount (Cash on Delivery / Final Dispatch)
    },

    // Payment proof & Verification
    payment: {
      method: { type: String, default: 'bank_transfer' }, // 'bank_transfer', 'easypaisa', 'jazzcash'
      paymentScreenshotUrl: { type: String, required: true }, // Customer advance payment receipt screenshot
      paymentStatus: {
        type: String,
        enum: ['pending_verification', 'advance_verified', 'fully_paid', 'rejected'],
        default: 'pending_verification',
      },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: String, default: null },
      notes: { type: String, default: '' },
    },

    orderStatus: {
      type: String,
      enum: ['new', 'processing', 'in_production', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'],
      default: 'new',
    },

    // Courier Company & Tracking bar
    tracking: {
      courierName: { type: String, default: '' }, // e.g. TCS Express, Leopard Courier, Trax
      trackingId: { type: String, default: '' },   // e.g. TCS-98472910
      trackingUrl: { type: String, default: '' },  // direct tracking web link
      dispatchedAt: { type: Date, default: null },
      notes: { type: String, default: '' },
    },

    timeline: [
      {
        status: { type: String, required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
