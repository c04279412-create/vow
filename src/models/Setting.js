import mongoose from 'mongoose';

const SettingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: true,
      default: 'VowCrafts | Bespoke Wedding Frames & Luxury Gifts',
    },
    storeLogo: {
      type: String,
      default: '/logo.svg',
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com/vowcrafts' },
      instagram: { type: String, default: 'https://instagram.com/vowcrafts' },
      tiktok: { type: String, default: 'https://tiktok.com/@vowcrafts' },
      snapchat: { type: String, default: 'https://snapchat.com/add/vowcrafts' },
      google: { type: String, default: 'https://google.com/search?q=vowcrafts' },
    },
    tagline: {
      type: String,
      default: 'Preserving Eternal Love In Handcrafted Elegance',
    },
    // Designer Credit / Footer Slogan (Audio / Image 2)
    designerCredit: {
      type: String,
      default: 'Designed for Eternal Moments',
    },
    showDesignerCredit: {
      type: Boolean,
      default: true,
    },
    // Homepage Section Arrangement & Customizer Configuration
    homeSectionOrder: {
      type: [String],
      default: ['hero', 'categories', 'madeForMoments', 'mostCherished', 'philosophy', 'newReleases', 'reviews'],
    },
    homeSectionConfig: {
      type: Object,
      default: {},
    },
    // Dynamically used by storefront WhatsApp buttons & floating chat icon
    whatsappNumber: {
      type: String,
      required: true,
      default: '+923001234567',
    },
    // Top Announcement Bar dynamic marquee/ticker
    announcementTickerText: {
      type: String,
      default: '✨ Free express delivery on orders over PKR 3,000 | Contact WhatsApp for custom orders',
    },
    // Advance Payment Settings (Optional Toggle & Dynamic Percentage)
    enableAdvancePayment: {
      type: Boolean,
      default: false,
    },
    advancePaymentPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    // Optional Footer Feature Badges Strip & Customization
    showFooterFeatures: {
      type: Boolean,
      default: false,
    },
    footerFeature1Title: {
      type: String,
      default: 'Handcrafted Quality',
    },
    footerFeature1Desc: {
      type: String,
      default: 'Carefully produced using premium quality materials.',
    },
    footerFeature2Title: {
      type: String,
      default: 'Bespoke Customization',
    },
    footerFeature2Desc: {
      type: String,
      default: 'Personalized designs customized to your instructions.',
    },
    footerFeature3Title: {
      type: String,
      default: 'Cash on Delivery',
    },
    footerFeature3Desc: {
      type: String,
      default: 'Doorstep delivery across Pakistan with verified courier dispatch.',
    },
    footerFeature4Title: {
      type: String,
      default: 'Safe & Secure Packaging',
    },
    footerFeature4Desc: {
      type: String,
      default: 'Protective packaging ensuring your orders arrive safe.',
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    currencySymbol: {
      type: String,
      default: 'Rs.',
    },
    freeShippingThreshold: {
      type: Number,
      default: 6000,
    },
    standardShippingFee: {
      type: Number,
      default: 250,
    },
    estimatedDeliveryMinDays: {
      type: Number,
      default: 4,
    },
    estimatedDeliveryMaxDays: {
      type: Number,
      default: 10,
    },
    bankDetails: {
      bankName: { type: String, default: 'Meezan Bank Limited' },
      accountTitle: { type: String, default: 'VowCrafts Luxury Studio' },
      accountNumber: { type: String, default: '01020304050607' },
      iban: { type: String, default: 'PK64MEZN0001020304050607' },
      easypaisaNumber: { type: String, default: '03001234567 (VowCrafts Studio)' },
      jazzcashNumber: { type: String, default: '03001234567 (VowCrafts Studio)' },
      paymentInstructions: {
        type: String,
        default: 'Please transfer the calculated advance amount (e.g. 30%) and upload the payment receipt screenshot to initiate bespoke artisan production.',
      },
    },
    theme: {
      fontSize: { type: String, default: 'normal' },
      headingFont: { type: String, default: 'Playfair Display' },
      bodyFont: { type: String, default: 'Inter' },
      primaryColor: { type: String, default: '#B5936C' },
      accentColor: { type: String, default: '#C59A27' },
      backgroundTone: { type: String, default: '#FAF7F2' },
      sidebarTheme: { type: String, default: 'light' },
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
