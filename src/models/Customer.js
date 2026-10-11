import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: '' },
    role: { type: String, default: 'customer' },
    city: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
