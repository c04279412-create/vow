import mongoose from 'mongoose';

// Coupon Schema
const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    maxDiscountCap: { type: Number, default: null },
    minOrderValue: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: null },
    totalUsageLimit: { type: Number, default: null },
    perCustomerLimit: { type: Number, default: 1 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hero Banner Schema
const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Collection' },
    buttonLink: { type: String, default: '/categories/wedding-frames' },
    imageUrl: { type: String, required: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Review Moderation Schema
const ReviewSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    productName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    verified: { type: Boolean, default: true },
    approved: { type: Boolean, default: true },
    reviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Admin User Schema (RBAC)
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ['super_admin', 'store_manager', 'order_processor', 'support'],
      default: 'super_admin',
    },
    active: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', UserSchema);
