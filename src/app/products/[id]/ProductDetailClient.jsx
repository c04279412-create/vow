'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Phone,
  ShoppingBag,
  Star,
  CheckCircle,
  Heart,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Upload,
  Eye,
  Truck,
  Package,
} from 'lucide-react';

import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import StorefrontFooter from '@/components/storefront/StorefrontFooter';
import ProductCard from '@/components/storefront/ProductCard';
import CartDrawer from '@/components/storefront/CartDrawer';
import CustomDateInput from '@/components/storefront/CustomDateInput';
import { initialProducts, initialCategories, initialSettings, initialReviews } from '@/lib/dataStore';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productIdOrSlug = params?.id;

  const initialMatch = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('vowcrafts_products');
        if (cached) {
          const list = JSON.parse(cached);
          if (Array.isArray(list)) {
            const found = list.find((p) => p.id === productIdOrSlug || p.slug === productIdOrSlug);
            if (found) return found;
          }
        }
      } catch (e) {}
    }
    return (
      initialProducts.find(
        (p) => p.id === productIdOrSlug || p.slug === productIdOrSlug
      ) || null
    );
  }, [productIdOrSlug]);

  const [storeSettings, setStoreSettings] = useState(initialSettings);
  const [categories, setCategories] = useState(initialCategories);
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [reviews, setReviews] = useState(initialReviews || []);
  const [product, setProduct] = useState(initialMatch);
  const [loading, setLoading] = useState(!initialMatch);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant & Customization states
  const [selectedSize, setSelectedSize] = useState(initialMatch?.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState(initialMatch?.frameColors?.[0] || null);
  const [customFieldValues, setCustomFieldValues] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Cart & UI states
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [toastMessage, setToastMessage] = useState(null);

  // Live viewers simulation (social proof)
  const [liveViewers, setLiveViewers] = useState(initialMatch?.simulatedViewers || 18);

  useEffect(() => {
    if (product?.simulatedViewers) {
      setLiveViewers(product.simulatedViewers);
    } else {
      const seed = ((product?.name || '').length || 8) % 15;
      setLiveViewers(16 + seed);
    }

    const interval = setInterval(() => {
      setLiveViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + delta;
        return next < 8 ? 12 : next > 45 ? 35 : next;
      });
    }, 9000);

    return () => clearInterval(interval);
  }, [product]);

  // Load persistent cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vowcrafts_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch (e) {}
  }, []);

  // Save cart to localStorage
  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem('vowcrafts_cart', JSON.stringify(items));
    } catch (e) {}
  };

  // Fetch product data
  useEffect(() => {
    let foundFallback = initialProducts.find(
      (p) => p.id === productIdOrSlug || p.slug === productIdOrSlug
    );
    if (!foundFallback) {
      try {
        const cached = localStorage.getItem('vowcrafts_products');
        if (cached) {
          const list = JSON.parse(cached);
          if (Array.isArray(list)) {
            foundFallback = list.find((p) => p.id === productIdOrSlug || p.slug === productIdOrSlug);
          }
        }
      } catch (e) {}
    }

    if (foundFallback) {
      setProduct(foundFallback);
      if (foundFallback.sizes?.length > 0) setSelectedSize(foundFallback.sizes[0]);
      if (foundFallback.frameColors?.length > 0) setSelectedColor(foundFallback.frameColors[0]);
      setLoading(false);
    }

    // Live fetch from API in background
    fetch(`/api/products/${productIdOrSlug}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.product) {
          setProduct(data.product);
          if (data.product.sizes?.length > 0 && !selectedSize) setSelectedSize(data.product.sizes[0]);
          if (data.product.frameColors?.length > 0 && !selectedColor) setSelectedColor(data.product.frameColors[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setStoreSettings(data.settings);
      })
      .catch(() => {});

    try {
      const cached = localStorage.getItem('vowcrafts_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      }
    } catch (e) {}

    fetch('/api/categories', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
          try {
            localStorage.setItem('vowcrafts_categories', JSON.stringify(data.categories));
          } catch (e) {}
        }
      })
      .catch(() => {});

    fetch('/api/products', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products && Array.isArray(data.products)) {
          setAllProducts(data.products);
          try {
            localStorage.setItem('vowcrafts_products', JSON.stringify(data.products));
          } catch (e) {}
        }
      })
      .catch(() => {});

    fetch('/api/marketing?resource=reviews', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.reviews && Array.isArray(data.reviews)) setReviews(data.reviews);
      })
      .catch(() => {});
  }, [productIdOrSlug]);

  const rawWhatsapp = (storeSettings?.whatsappNumber || '+923008472910').replace(/[^0-9]/g, '');

  // Calculate pricing with size and color adjustments
  const computedPricing = useMemo(() => {
    if (!product) return { finalPrice: 0, originalPrice: 0, advanceDeposit: 0, savings: 0, hasDiscount: false };

    let base = Number(product.basePrice) || 3500;
    let sale = product.salePrice ? Number(product.salePrice) : null;

    if (selectedSize) {
      if (selectedSize.price !== undefined) {
        base = Number(selectedSize.price);
        sale = selectedSize.salePrice ? Number(selectedSize.salePrice) : null;
      } else if (selectedSize.priceAdjustment) {
        base += Number(selectedSize.priceAdjustment);
        if (sale) sale += Number(selectedSize.priceAdjustment);
      }
    }

    if (selectedColor && selectedColor.priceAdjustment) {
      base += Number(selectedColor.priceAdjustment);
      if (sale) sale += Number(selectedColor.priceAdjustment);
    }

    const finalPrice = sale !== null ? sale : base;
    const originalPrice = sale !== null && base > sale ? base : Math.round(finalPrice * 1.25);
    const hasDiscount = originalPrice > finalPrice;
    const savings = hasDiscount ? originalPrice - finalPrice : 0;

    return {
      finalPrice,
      originalPrice,
      savings,
      hasDiscount,
    };
  }, [product, selectedSize, selectedColor]);

  // Auto-calculated dynamic estimated delivery date range based on min/max delivery days
  const deliveryDateRangeText = useMemo(() => {
    const minDays = Number(product?.minDeliveryDays) || Number(storeSettings?.estimatedDeliveryMinDays) || 4;
    const maxDays = Number(product?.maxDeliveryDays) || Number(storeSettings?.estimatedDeliveryMaxDays) || 10;

    const now = new Date();
    const startDate = new Date(now.getTime() + minDays * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + maxDays * 24 * 60 * 60 * 1000);

    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
    const startDay = startDate.getDate();
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
    const endDay = endDate.getDate();

    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }, [product?.minDeliveryDays, product?.maxDeliveryDays, storeSettings?.estimatedDeliveryMinDays, storeSettings?.estimatedDeliveryMaxDays]);

  // Dynamic Free Shipping & Returns threshold text based on backend settings
  const freeShippingThresholdText = useMemo(() => {
    const threshold = Number(storeSettings?.freeShippingThreshold);
    const val = threshold !== undefined && !isNaN(threshold) ? threshold : 6000;
    if (val <= 0) {
      return 'On all orders across Pakistan';
    }
    return `On all orders over ${val.toLocaleString()}`;
  }, [storeSettings?.freeShippingThreshold]);

  // Check which features are enabled on this product
  const hasSizesEnabled = useMemo(() => {
    if (!product) return false;
    if (product.hasSizeVariations === false) return false;
    if (product.hasSizeVariations === true) {
      return Array.isArray(product.sizes) && product.sizes.length > 0;
    }
    return Array.isArray(product.sizes) && product.sizes.length > 0;
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!hasSizesEnabled) return [];
    return product.sizes || [];
  }, [hasSizesEnabled, product]);

  const hasTextCustomization = useMemo(() => {
    if (!product) return false;
    if (product.allowTextCustomization === false) return false;
    if (product.allowTextCustomization === true) return true;
    if (product.productType === 'TYPE_A') return false;
    if (product.productType === 'TYPE_B') return true;
    return Array.isArray(product.customFields) && product.customFields.length > 0;
  }, [product]);

  const hasPhotoUpload = useMemo(() => {
    if (!product) return false;
    if (product.allowPhotoUpload === false) return false;
    if (product.allowPhotoUpload === true) return true;
    if (product.imageUploadConfig?.enabled !== undefined) return Boolean(product.imageUploadConfig.enabled);
    return product.productType === 'TYPE_C';
  }, [product]);

  useEffect(() => {
    if (!hasSizesEnabled) {
      setSelectedSize(null);
      return;
    }
    if (!selectedSize && availableSizes.length > 0) {
      setSelectedSize(availableSizes[0]);
    }
  }, [hasSizesEnabled, availableSizes, selectedSize]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCustomFieldChange = (fieldId, val) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setUploadedPhotos((prev) => [...prev, ...newUrls]);
    showToast(`${files.length} photo(s) selected`);
  };

  // Add to cart action
  const handleAddToCart = (openDrawer = true) => {
    if (!product) return false;

    // Check required fields only if text customization is enabled
    if (hasTextCustomization && product.customFields?.length > 0) {
      for (const f of product.customFields) {
        if (f.required && !customFieldValues[f.fieldId]?.trim()) {
          showToast(`Please enter ${f.label}`);
          return false;
        }
      }
    }

    const cartItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: (product.images && product.images[0]) || '/images/hero_banner.jpg',
      price: computedPricing.finalPrice,
      quantity,
      selectedSize: hasSizesEnabled ? (selectedSize?.name || null) : null,
      selectedColor: (product.frameColors?.length > 0) ? (selectedColor?.name || null) : null,
      productType: product.productType || 'TYPE_A',
      customFieldValues: hasTextCustomization ? customFieldValues : {},
      customTextInputs: hasTextCustomization ? customFieldValues : {},
      uploadedPhotos: hasPhotoUpload ? uploadedPhotos : [],
      deliveryCharges: Number(product.deliveryCharges) || 0,
      addedAt: new Date().toISOString(),
    };

    saveCart([...cartItems, cartItem]);
    if (openDrawer) {
      setIsCartOpen(true);
      showToast(`Added ${product.name} to Cart!`);
    }
    return true;
  };

  // Direct Buy Now & Checkout without opening right-side cart drawer
  const handleBuyNow = () => {
    const success = handleAddToCart(false);
    if (success) {
      router.push('/cart');
    }
  };

  // Related products ("You May Also Like")
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts?.length) return [];
    return allProducts
      .filter((p) => (p.id !== product.id && p.slug !== product.slug) && p.isActive !== false)
      .slice(0, 4);
  }, [product, allProducts]);

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center font-sans">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
        <p className="mt-4 text-xs font-mono text-stone-500 uppercase tracking-widest">
          Loading Keepsake...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 text-center font-sans">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Keepsake Not Found</h2>
        <p className="text-sm text-stone-500 mt-2 max-w-md">
          This product may have been archived or is temporarily unavailable.
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ['/images/floral_box.jpg'];
  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col font-sans">
      {/* 1. Global Header */}
      <StorefrontHeader
        storeSettings={storeSettings}
        categories={categories}
        products={allProducts}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(catName) => {
          router.push(`/?category=${encodeURIComponent(catName)}#vault-catalog`);
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#1C1917] text-white text-xs sm:text-sm px-5 py-3 rounded-xl shadow-2xl border border-stone-700 flex items-center space-x-3 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#E3C677]" />
          <span>{toastMessage}</span>
          <Link
            href="/cart"
            className="ml-2 px-2.5 py-1 bg-[#C59A27] hover:bg-[#b0881f] text-stone-900 font-bold text-xs rounded-lg transition"
          >
            View Bag &amp; Checkout ΓåÆ
          </Link>
        </div>
      )}

      {/* Breadcrumb Navigation Bar */}
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center space-x-2 text-xs sm:text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <Link href={`/categories/${product.category?.toLowerCase() || 'all'}`} className="hover:text-stone-900 transition font-medium">
            {product.category || 'Collection'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-semibold truncate max-w-md">{product.name}</span>
        </div>
      </div>

      {/* 2. Main Product Display (Matches Reference Screenshot Layout) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-14 items-start">
          
          {/* LEFT COLUMN: Gallery with Vertical Thumbnails & Primary Image */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4 lg:sticky lg:top-24">
            {/* Vertical Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[580px] shrink-0 pb-2 sm:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-stone-900 ring-2 ring-stone-900/10 scale-[1.02]'
                        : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Primary Image Display Card */}
            <div className="flex-1 relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm group">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {product.isBestSeller && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-3 py-1 rounded-md bg-[#1C1917] text-white text-xs font-bold uppercase tracking-wider shadow">
                    Best Seller
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Info & Order Configuration (Large Bold Words) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Product Title (Large, Bold & Prominent as in Screenshot) */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Price Line: Original Cut Price + Discounted Price (Big Bold & Clear) */}
              <div className="flex items-baseline gap-3.5 mt-3.5">
                <span className="text-stone-400 line-through font-normal text-lg sm:text-xl">
                  Rs.{computedPricing.originalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#D92D20]">
                  Rs.{computedPricing.finalPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Brand Vendor Line */}
              <div className="text-sm sm:text-base text-stone-500 mt-2 font-medium">
                By <span className="text-[#D92D20] font-bold">VowCrafts</span>
              </div>
            </div>

            {/* Real-time Live Viewers Social Proof Indicator */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50/90 via-orange-50/50 to-amber-50/80 border border-amber-200/90 text-stone-800 text-xs sm:text-sm font-medium shadow-2xs">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <Eye className="w-4 h-4 text-[#A47A1A] shrink-0" />
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-stone-900">{liveViewers} people</span>
                <span className="text-stone-600">are viewing this product right now</span>
              </div>
            </div>

            {/* Variation / Deal Selector (Pill Buttons - rendered only if size variations enabled) */}
            {hasSizesEnabled && availableSizes.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-stone-200">
                <div className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wider">
                  {(product.sizeSectionTitle || 'SELECT YOUR DEAL').toUpperCase()}{selectedSize?.name ? ` - ${selectedSize.name.toUpperCase()}` : ''}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSize?.name === sz.name;
                    return (
                      <button
                        key={sz.name}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1917] text-white border-2 border-stone-900 shadow-sm'
                            : 'bg-white text-stone-800 border border-stone-300 hover:border-stone-500 hover:bg-stone-50'
                        }`}
                      >
                        {sz.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Frame Colors / Finish (rendered only if frame colors configured) */}
            {Array.isArray(product.frameColors) && product.frameColors.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="text-xs sm:text-sm font-bold text-stone-900 uppercase tracking-wide">
                  {(product.colorSectionTitle || 'SELECT FINISH').toUpperCase()}{selectedColor?.name ? ` - ${selectedColor.name.toUpperCase()}` : ''}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.frameColors.map((clr) => {
                    const isSelected = selectedColor?.name === clr.name;
                    return (
                      <button
                        key={clr.name}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center space-x-2 transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#1C1917] text-white border-2 border-stone-900 shadow-sm font-semibold'
                            : 'bg-white text-stone-700 border border-stone-300 hover:border-stone-500'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: clr.hex || '#000000' }}
                        />
                        <span>{clr.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Customization Inputs (rendered only if text customization enabled in admin) */}
            {hasTextCustomization && (
              <div className="space-y-4 pt-2 border-t border-stone-200">
                {Array.isArray(product.customFields) && product.customFields.length > 0 ? (
                  product.customFields.map((field) => (
                    <div key={field.fieldId || field.label} className="space-y-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-stone-900">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={2}
                          value={customFieldValues[field.fieldId] || ''}
                          onChange={(e) => handleCustomFieldChange(field.fieldId, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="w-full px-4 py-3 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none placeholder-stone-400"
                        />
                      ) : field.type === 'date' ? (
                        <CustomDateInput
                          value={customFieldValues[field.fieldId] || ''}
                          onChange={(val) => handleCustomFieldChange(field.fieldId, val)}
                          placeholder={field.placeholder || 'DD/MM/YYYY'}
                          className="w-full px-4 py-3.5 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none placeholder-stone-400"
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
                          value={customFieldValues[field.fieldId] || ''}
                          onChange={(e) => handleCustomFieldChange(field.fieldId, e.target.value)}
                          placeholder={field.placeholder || ''}
                          className="w-full px-4 py-3.5 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none placeholder-stone-400"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-stone-900">
                      Personalized Inscription / Names
                    </label>
                    <input
                      type="text"
                      value={customFieldValues['custom_inscription'] || ''}
                      onChange={(e) => handleCustomFieldChange('custom_inscription', e.target.value)}
                      placeholder="Enter names, date, or inscription"
                      className="w-full px-4 py-3.5 bg-white border border-stone-300 rounded-lg text-sm sm:text-base text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 focus:outline-none placeholder-stone-400"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Photo Upload (rendered only if photo upload enabled in admin) */}
            {hasPhotoUpload && (
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <label className="block text-xs sm:text-sm font-bold text-stone-900">
                  Upload Photos ({product.imageUploadConfig?.minImages || 1} to {product.imageUploadConfig?.maxImages || 50} photos)
                </label>
                {product.imageUploadConfig?.instructions && (
                  <p className="text-[11px] text-stone-500">
                    {product.imageUploadConfig.instructions}
                  </p>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-stone-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                />
                {uploadedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {uploadedPhotos.slice(0, 6).map((photo, i) => (
                      <img key={i} src={photo} alt="" className="w-12 h-12 object-cover rounded-lg border border-stone-200" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quantity, ADD TO CART & Wishlist (Exact Layout as in Screenshot) */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center gap-3">
                {/* Quantity Box */}
                <div className="h-13 sm:h-14 w-28 sm:w-32 flex items-center justify-between border border-stone-300 rounded-lg bg-white px-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-full text-stone-600 hover:text-stone-900 text-xl font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-sans font-bold text-stone-900 text-base">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-full text-stone-600 hover:text-stone-900 text-xl font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* ADD TO CART Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-13 sm:h-14 flex-1 bg-black hover:bg-stone-800 text-white font-sans font-bold text-sm sm:text-base tracking-wider uppercase rounded-lg shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 text-[#E3C677]" />
                  <span>ADD TO CART</span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFavorite(!isFavorite);
                    showToast(!isFavorite ? 'Saved to wishlist!' : 'Removed from wishlist');
                  }}
                  className="h-13 sm:h-14 w-13 sm:w-14 border border-stone-300 rounded-lg flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition shrink-0 cursor-pointer"
                  title="Wishlist"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'stroke-[1.5]'}`} />
                </button>
              </div>

              {/* Direct Buy Now & Checkout Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full h-12 bg-[#8C6D42] hover:bg-[#735832] text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>BUY NOW &amp; ENTER DETAILS (CHECKOUT)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Direct WhatsApp Order Button */}
              <a
                href={`https://wa.me/${rawWhatsapp}?text=Hi%20VowCrafts!%20I%20want%20to%20order:%20${encodeURIComponent(
                  product.name
                )}%20(Price:%20PKR%20${computedPricing.finalPrice}).`}
                target="_blank"
                rel="noreferrer"
                className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>ORDER DIRECTLY VIA WHATSAPP CONCIERGE</span>
              </a>
            </div>

            {/* Dynamic Estimated Delivery & Free Shipping / Returns (Matches Reference Screenshot) */}
            <div className="py-3.5 space-y-3 border-t border-b border-stone-200">
              {/* 1. Estimated Delivery */}
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-stone-900 shrink-0 stroke-[1.75]" />
                <div className="text-xs sm:text-sm text-stone-900 flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold">Estimated Delivery:</span>
                  <span className="text-stone-700 font-medium">{deliveryDateRangeText}</span>
                </div>
              </div>

              {/* 2. Free Shipping & Returns */}
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-stone-900 shrink-0 stroke-[1.75]" />
                <div className="text-xs sm:text-sm text-stone-900 flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold">Free Shipping &amp; Returns:</span>
                  <span className="text-stone-700 font-medium">{freeShippingThresholdText}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Centered Product Tabs: Description, Shipping, Return */}
        {(() => {
          const showShippingTab = product?.tabsConfig?.showShippingTab !== false;
          const showReturnTab = product?.tabsConfig?.showReturnTab !== false;
          const effectiveTab =
            (activeTab === 'shipping' && !showShippingTab) || (activeTab === 'return' && !showReturnTab)
              ? 'description'
              : activeTab;

          return (
            <div className="mt-16 sm:mt-24 border-t border-stone-200 pt-10">
              <div className="flex items-center justify-center space-x-8 sm:space-x-12 border-b border-stone-200 pb-3 text-sm sm:text-base font-bold tracking-wide">
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 -mb-3 transition cursor-pointer ${
                    effectiveTab === 'description'
                      ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
                      : 'text-stone-400 hover:text-stone-700 font-semibold'
                  }`}
                >
                  Description
                </button>
                {showShippingTab && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('shipping')}
                    className={`pb-3 -mb-3 transition cursor-pointer ${
                      effectiveTab === 'shipping'
                        ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
                        : 'text-stone-400 hover:text-stone-700 font-semibold'
                    }`}
                  >
                    Shipping
                  </button>
                )}
                {showReturnTab && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('return')}
                    className={`pb-3 -mb-3 transition cursor-pointer ${
                      effectiveTab === 'return'
                        ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
                        : 'text-stone-400 hover:text-stone-700 font-semibold'
                    }`}
                  >
                    Return
                  </button>
                )}
              </div>

              <div className="py-8 text-sm sm:text-base text-stone-700 leading-relaxed max-w-3xl mx-auto text-center">
                {effectiveTab === 'description' && (
                  <div className="space-y-3">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                      {product.name}
                    </h3>
                    <p className="text-stone-600 leading-relaxed whitespace-pre-line">
                      {product.details || product.description || 'Personalized wedding keepsake booklet and frame created with utmost care and heirloom quality materials for an unforgettable presentation.'}
                    </p>
                  </div>
                )}

                {effectiveTab === 'shipping' && showShippingTab && (
                  <p className="whitespace-pre-line">
                    {product?.tabsConfig?.shippingText || 'Standard delivery takes 3 to 5 working days across Pakistan. Secure protective packaging ensures your order arrives safe and undamaged.'}
                  </p>
                )}

                {effectiveTab === 'return' && showReturnTab && (
                  <p className="whitespace-pre-line">
                    {product?.tabsConfig?.returnText || 'Every customized order is digitally reviewed on WhatsApp before dispatch. In the rare case of transit damage, replacement is provided promptly.'}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* 4. "You may also like" Section (Using the new clean ProductCard layout) */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-stone-200">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 text-center mb-8 sm:mb-12">
              You may also like
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel, idx) => (
                <ProductCard
                  key={rel.id || rel.slug || idx}
                  product={rel}
                  storeSettings={storeSettings}
                  onToast={showToast}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. Customer Reviews Section (Matches Screenshot) */}
        <section className="mt-16 sm:mt-24 pt-12 border-t border-stone-200">
          <div className="text-center space-y-2 mb-8">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Customer Reviews
            </h2>
            <div className="flex items-center justify-center space-x-1 text-[#C59A27] pt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              be the first to write a review
            </p>
          </div>

          {/* Real Customer WhatsApp Screenshot Bubbles / Photo Badges */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-4 sm:gap-6 max-w-4xl mx-auto pt-2">
              {reviews.slice(0, 7).map((rev, i) => (
                <div key={rev.id || i} className="group relative flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-stone-300 group-hover:border-stone-900 transition shadow-sm cursor-pointer">
                    <img
                      src={rev.screenshotUrl || rev.imageUrl || '/images/hero_banner.jpg'}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-700 mt-1.5 truncate max-w-[90px]">
                    {rev.customerName || 'Customer'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={(itemId) => {
          const updated = cartItems.filter((it, idx) => it.id !== itemId && idx !== itemId);
          saveCart(updated);
        }}
        onUpdateQuantity={(itemId, newQty) => {
          const updated = cartItems.map((it, idx) =>
            it.id === itemId || idx === itemId ? { ...it, quantity: newQty } : it
          );
          saveCart(updated);
        }}
        onClearCart={() => saveCart([])}
        storeSettings={storeSettings}
      />

      {/* Storefront Footer */}
      <StorefrontFooter storeSettings={storeSettings} />
    </div>
  );
}
