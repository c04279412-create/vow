import mongoose from 'mongoose';

const CustomFieldSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: true },
  type: { type: String, enum: ['text', 'date', 'textarea', 'number'], default: 'text' },
});

const AttributeSizeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priceAdjustment: { type: Number, default: 0 },
});

const AttributeColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, default: '#D4AF37' },
  priceAdjustment: { type: Number, default: 0 },
});

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: null },
    deliveryCharges: { type: Number, default: 0 },
    minDeliveryDays: { type: Number, default: 4 },
    maxDeliveryDays: { type: Number, default: 10 },
    
    // TYPE A: Simple
    // TYPE B: Custom Text (Bride/Groom Name, Date, Notes, etc.)
    // TYPE C: Custom Images (File upload 1 to 50+ photos)
    productType: {
      type: String,
      enum: ['TYPE_A', 'TYPE_B', 'TYPE_C'],
      default: 'TYPE_A',
      required: true,
    },

    allowTextCustomization: { type: Boolean, default: false },
    allowPhotoUpload: { type: Boolean, default: false },
    hasSizeVariations: { type: Boolean, default: false },

    // Dynamic field builder for Type B
    customFields: [CustomFieldSchema],

    // Configuration for Type C image upload
    imageUploadConfig: {
      enabled: { type: Boolean, default: false },
      minImages: { type: Number, default: 1 },
      maxImages: { type: Number, default: 50 },
      instructions: {
        type: String,
        default: 'Upload high-resolution photos (up to 50) for your bespoke frame collage.',
      },
    },

    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
    additionalCategories: [{ type: String }],
    additionalSubcategories: [{ type: String }],
    images: [{ type: String, required: true }],

    // Dropdown Attributes
    sizeSectionTitle: { type: String, default: 'Frame Size Variations' },
    colorSectionTitle: { type: String, default: 'Frame Colors & Finishes' },
    sizes: [AttributeSizeSchema],
    frameColors: [AttributeColorSchema],

    // Tabs & Storefront Content
    details: { type: String, default: '' },
    tabsConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        showShippingTab: true,
        shippingText: 'Standard delivery takes 3 to 5 working days across Pakistan. Secure protective packaging ensures your order arrives safe and undamaged.',
        showReturnTab: true,
        returnText: 'Every customized order is digitally reviewed on WhatsApp before dispatch. In the rare case of transit damage, replacement is provided promptly.',
      }),
    },

    // Urgency & Scarcity metrics
    stock: { type: Number, required: true, default: 25 },
    simulatedViewers: { type: Number, default: 14 },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
