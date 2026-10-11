'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Star,
  CheckCircle,
  Phone,
  Heart,
  Eye,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Truck,
  Award,
  Crown,
  Share2,
  Package,
  X,
  Maximize2,
  MessageSquare,
} from 'lucide-react';

import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import StorefrontFooter from '@/components/storefront/StorefrontFooter';
import ProductCard from '@/components/storefront/ProductCard';
import ProductQuickOrderModal from '@/components/storefront/ProductQuickOrderModal';
import CartDrawer from '@/components/storefront/CartDrawer';
import LiveSalesToast from '@/components/storefront/LiveSalesToast';

import { initialProducts, initialCategories, initialSettings, initialBanners, initialReviews } from '@/lib/dataStore';
import {
  DEFAULT_SECTION_ORDER,
  DEFAULT_SECTION_CONFIG,
} from '@/components/admin/HomepageBuilderTab';

export default function StorefrontPage() {
  const router = useRouter();
  const [storeSettings, setStoreSettings] = useState(initialSettings);
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [banners, setBanners] = useState(initialBanners);
  const [reviews, setReviews] = useState(initialReviews);
  const [activeReviewScreenshot, setActiveReviewScreenshot] = useState(null);
  const reviewsScrollRef = React.useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Search & Cart states
  const [searchQuery, setSearchQuery] = useState('');
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Load persistent cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vowcrafts_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch (e) {}
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem('vowcrafts_cart', JSON.stringify(items));
    } catch (e) {}
  };

  // Fetch live store settings, products, categories & hero banners
  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setStoreSettings(data.settings);
      })
      .catch(() => {});

    try {
      const cachedProds = localStorage.getItem('vowcrafts_products');
      if (cachedProds) {
        const parsedP = JSON.parse(cachedProds);
        if (Array.isArray(parsedP) && parsedP.length > 0) setProducts(parsedP);
      }
    } catch (e) {}

    fetch('/api/products', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          try {
            localStorage.setItem('vowcrafts_products', JSON.stringify(data.products));
          } catch (e) {}
        }
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

    fetch('/api/marketing?resource=banners', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.banners && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
        }
      })
      .catch(() => {});

    fetch('/api/marketing?resource=reviews', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
      })
      .catch(() => {});
  }, []);

  // Filter active banners
  const activeBanners = useMemo(() => {
    const list = banners.filter((b) => b.active !== false);
    return list.length > 0 ? list : banners;
  }, [banners]);

  // Safe slide index and current banner
  const safeSlideIndex = activeBanners.length > 0 ? currentSlide % activeBanners.length : 0;
  const currentBanner = activeBanners[safeSlideIndex] || initialBanners[0];

  // Auto-advance hero carousel every 6.5s
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const rawWhatsapp = (storeSettings?.whatsappNumber || '+923008472910').replace(/[^0-9]/g, '');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddToCart = (product, e) => {
    e?.stopPropagation();
    const newItem = {
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.basePrice,
      quantity: 1,
      image: product.images?.[0] || '/images/hero_banner.jpg',
      selectedSize: product.sizes?.[0]?.name,
      selectedColor: product.frameColors?.[0]?.name,
    };
    const nextCart = [...cartItems, newItem];
    saveCart(nextCart);
    setIsCartOpen(true);
    showToast(`Added ${product.name} to Cart!`);
  };

  // Curated section products
  const madeForMomentsProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  const mostCherishedProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  const freshAtelierProducts = useMemo(() => {
    return products.slice(4, 8).length >= 4 ? products.slice(4, 8) : products.slice(0, 4);
  }, [products]);

  // Layout Builder Configs
  const sectionOrder = useMemo(() => {
    return Array.isArray(storeSettings?.homeSectionOrder) && storeSettings.homeSectionOrder.length > 0
      ? storeSettings.homeSectionOrder
      : DEFAULT_SECTION_ORDER;
  }, [storeSettings?.homeSectionOrder]);

  const sectionConfig = useMemo(() => {
    return storeSettings?.homeSectionConfig || DEFAULT_SECTION_CONFIG;
  }, [storeSettings?.homeSectionConfig]);

  const getSpacingClass = (spacing) => {
    if (spacing === 'compact') return 'py-8 sm:py-10';
    if (spacing === 'spacious') return 'py-20 sm:py-28';
    return 'py-14 sm:py-18';
  };

  // Section 1: Hero Banner Slider
  const renderHero = (cfg) => {
    const minHeightClass =
      cfg.spacing === 'compact'
        ? 'min-h-[440px] sm:min-h-[500px] lg:min-h-[560px]'
        : cfg.spacing === 'spacious'
        ? 'min-h-[580px] sm:min-h-[660px] lg:min-h-[740px]'
        : 'min-h-[500px] sm:min-h-[580px] lg:min-h-[640px]';

    return (
      <section
        key="hero"
        className={`relative overflow-hidden bg-[#1C1917] text-[#FAF7F2] ${minHeightClass} flex items-center`}
      >
        <div className="absolute inset-0 z-0">
          <img
            key={currentBanner.imageUrl}
            src={currentBanner.imageUrl || '/images/hero_banner.jpg'}
            alt={currentBanner.title || 'The Art of Thoughtful Gifting'}
            onError={(e) => {
              e.target.src = '/images/hero_banner.jpg';
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.62] contrast-[1.05] transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-[#C59A27]/50 text-[#E3C677] text-xs font-mono font-bold tracking-widest uppercase shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-[#E3C677]" />
              <span>{currentBanner.badgeText || 'Artisanal Luxury Edition'}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
              {currentBanner.title || (
                <>
                  The Art of <span className="text-[#E3C677] italic font-normal">Thoughtful</span> Gifting
                </>
              )}
            </h1>

            <p className="font-serif text-sm sm:text-base text-stone-200/90 leading-relaxed max-w-xl italic drop-shadow">
              {currentBanner.subtitle ||
                'Personalized Nikkah frames, custom keepsake boxes, and artisanal gifts crafted with utmost reverence and heirloom quality.'}
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <Link
                href={currentBanner.buttonLink || '/categories/luxury-frames'}
                className="px-7 py-3.5 rounded-full bg-[#E3C677] hover:bg-[#d6b763] text-stone-900 font-serif font-bold text-xs uppercase tracking-wider transition shadow-xl hover:shadow-2xl flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <span>{currentBanner.buttonText || 'Explore All Collections'}</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  const firstProd = products[0];
                  if (firstProd) setCustomizingProduct(firstProd);
                }}
                className="px-7 py-3.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white font-serif font-bold text-xs uppercase tracking-wider border border-white/30 transition shadow-lg cursor-pointer"
              >
                Customize Your Order
              </button>
            </div>
          </div>
        </div>

        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 right-6 z-10 hidden sm:flex items-center space-x-3">
            <button
              type="button"
              onClick={() =>
                setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
              }
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 border border-white/20 transition cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 border border-white/20 transition cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1.5 pl-2">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safeSlideIndex ? 'w-6 bg-[#E3C677]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    );
  };

  // Section 2: Trust Pillars
  const renderTrustPillars = (cfg) => {
    const spacingPadding =
      cfg.spacing === 'compact' ? 'py-4' : cfg.spacing === 'spacious' ? 'py-10' : 'py-6';

    return (
      <section key="trustPillars" className={`bg-white border-b border-stone-200 ${spacingPadding}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="flex items-start space-x-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#8C6D42] border border-[#B5936C]/30 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-stone-900 uppercase tracking-wide">
                  {cfg.pillar1Title || 'Express Delivery in Pakistan'}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  {cfg.pillar1Desc || 'Safe wooden crate shipping across all cities.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#8C6D42] border border-[#B5936C]/30 flex items-center justify-center shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-stone-900 uppercase tracking-wide">
                  {cfg.pillar2Title || 'Premium Quality Materials'}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  {cfg.pillar2Desc || 'Genuine 24K gold foil & German archival velvet.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#8C6D42] border border-[#B5936C]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-serif font-bold text-stone-900 uppercase tracking-wide">
                  {cfg.pillar3Title || '30% Deposit + Doorstep COD'}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  {cfg.pillar3Desc || 'Verify digital draft on WhatsApp, pay remainder on delivery.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5 p-2">
              <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] text-[#8C6D42] border border-[#B5936C]/30 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-serif font-bold text-stone-900 uppercase tracking-wide">
                  {cfg.pillar4Title || 'Dedicated Atelier Support'}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  {cfg.pillar4Desc || 'Direct WhatsApp priority consultation with calligraphers.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Section 3: Categories
  const renderCategories = (cfg) => {
    const activeCategories = (categories || [])
      .filter((c) => c.isActive !== false)
      .sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
        return orderA - orderB;
      });
    if (activeCategories.length === 0) return null;

    return (
      <section
        key="categories"
        id="categories"
        className={`${getSpacingClass(cfg.spacing)} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8C6D42]">
              {cfg.badge || 'Explore Our Craft'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mt-1">
              {cfg.title || 'Shop by Category'}
            </h2>
            {cfg.subtitle && (
              <p className="text-xs text-stone-500 mt-1">{cfg.subtitle}</p>
            )}
          </div>
          <Link
            href="/categories/all"
            className="text-xs font-bold text-[#8C6D42] hover:text-stone-900 transition flex items-center space-x-1 uppercase tracking-wider"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeCategories.map((cat, idx) => {
            const fallbackImage =
              idx === 0
                ? '/images/floral_box.jpg'
                : idx === 1
                ? '/images/hero_banner.jpg'
                : idx === 2
                ? '/images/acrylic_welcome.jpg'
                : idx === 3
                ? '/images/nikkah_booklet.jpg'
                : 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80';

            const catMatchCount = products.filter(
              (p) =>
                p.isActive !== false &&
                ((p.category || '').toLowerCase() === cat.name.toLowerCase() ||
                  (p.category || '').toLowerCase().includes(cat.slug || ''))
            ).length;
            const count = catMatchCount > 0 ? catMatchCount : cat.name === 'Wedding' ? 6 : 2;

            return (
              <Link
                key={cat.id || cat.slug || idx}
                href={`/categories/${cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 block cursor-pointer border border-stone-200"
              >
                <img
                  src={cat.imageUrl || fallbackImage}
                  alt={cat.name}
                  className="w-full h-full object-cover product-card-zoom-img filter brightness-95 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 flex flex-col justify-end text-white">
                  <h3 className="font-serif text-base sm:text-lg font-bold group-hover:text-[#E3C677] transition leading-tight">
                    {cat.name}
                  </h3>
                  <div className="text-[11px] text-stone-300 font-mono mt-0.5 flex items-center justify-between">
                    <span>
                      {count} {count === 1 ? 'Item' : 'Items'}
                    </span>
                    <span className="text-[#E3C677] text-xs font-bold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  };

  // Section 4: Made for Moments
  const renderMadeForMoments = (cfg) => {
    return (
      <section
        key="madeForMoments"
        className={`${getSpacingClass(cfg.spacing)} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}
      >
        <div className="relative rounded-3xl bg-gradient-to-r from-[#18181b] via-[#1C1917] to-[#27211d] border border-[#C59A27]/30 p-8 sm:p-12 text-white overflow-hidden shadow-2xl mb-8">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border border-[#C59A27]/20 pointer-events-none" />
          <div className="absolute -right-8 -top-8 w-64 h-64 rounded-full border border-[#C59A27]/15 pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/10 text-[#E3C677] text-[11px] font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{cfg.badge || 'Curated Collection'}</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
              {cfg.title || 'Made for Moments'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif italic">
              {cfg.description ||
                'Curated keepsakes immortalizing your most cherished matrimonial memories and milestones.'}
            </p>
            <div className="pt-2">
              <Link
                href={cfg.buttonLink || '/categories/luxury-frames'}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white text-stone-900 font-serif font-bold text-xs uppercase tracking-wider hover:bg-[#FAF7F2] transition shadow-md"
              >
                <span>{cfg.buttonText || 'Explore Full Collection'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {madeForMomentsProducts.map((p, idx) => (
            <ProductCard
              key={p.id || p.slug || idx}
              product={p}
              storeSettings={storeSettings}
              onToast={showToast}
            />
          ))}
        </div>
      </section>
    );
  };

  // Section 5: Most Cherished Creations
  const renderMostCherished = (cfg) => {
    return (
      <section
        key="mostCherished"
        id="vault-catalog"
        className={`${getSpacingClass(cfg.spacing)} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8C6D42]">
              {cfg.badge || 'Curated Collection'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mt-1">
              {cfg.title || 'Most Cherished Creations'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {cfg.subtitle || 'Our highest rated and most requested creations.'}
            </p>
          </div>
          <Link
            href="/categories/luxury-frames"
            className="text-xs font-bold text-[#8C6D42] hover:text-stone-900 transition flex items-center space-x-1 uppercase tracking-wider"
          >
            <span>{cfg.viewAllText || 'View All Bestsellers'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {mostCherishedProducts.map((p, idx) => (
            <ProductCard
              key={p.id || p.slug || idx}
              product={p}
              storeSettings={storeSettings}
              onToast={showToast}
            />
          ))}
        </div>
      </section>
    );
  };

  // Section 6: Philosophy Section (Optional - Screenshot 1)
  const renderPhilosophy = (cfg) => {
    return (
      <section
        key="philosophy"
        id="atelier-story"
        className={`${getSpacingClass(cfg.spacing)} bg-white border-y border-stone-200`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C59A27]/40 text-[#8C6D42] text-xs font-mono font-bold uppercase tracking-widest">
                <Crown className="w-3.5 h-3.5" />
                <span>{cfg.badge || 'The VowCrafts Philosophy'}</span>
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
                {cfg.title || 'Honoring Sacred Vows Through Timeless Artistry'}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl font-serif italic">
                {cfg.description ||
                  'Every marriage vow represents an eternal promise. In our atelier, master calligraphers apply 24K genuine gold leaf and museum-grade acrylic protection to ensure your sacred memories remain pristine for generations.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200 space-y-1">
                  <div className="font-serif font-bold text-stone-900 text-sm">
                    {cfg.pillar1Title || 'Heritage Atelier'}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {cfg.pillar1Desc || 'Master craftsmen with decades of Arabic & Urdu calligraphy lineage.'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-stone-200 space-y-1">
                  <div className="font-serif font-bold text-stone-900 text-sm">
                    {cfg.pillar2Title || 'Archival Integrity'}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {cfg.pillar2Desc ||
                      'German velvet parchment, shatterproof optical acrylic, and lifetime quality guarantee.'}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${rawWhatsapp}?text=Hi%20VowCrafts%20Atelier!%20I%20want%20to%20learn%20more%20about%20your%20custom%20creations.`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full bg-[#1C1917] hover:bg-stone-800 text-white font-serif font-bold text-xs uppercase tracking-wider transition shadow-md"
                >
                  <span>{cfg.buttonText || 'Discover Our Story'}</span>
                  <ArrowRight className="w-4 h-4 text-[#E3C677]" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-3xl bg-[#1C1917] text-white p-8 sm:p-10 border border-[#C59A27]/40 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="w-12 h-12 rounded-full border border-[#C59A27] text-[#E3C677] flex items-center justify-center font-serif text-sm font-bold">
                  {cfg.estYear || 'EST. 2021'}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-[#E3C677]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="font-serif text-base sm:text-lg italic text-stone-200 leading-relaxed">
                    &ldquo;{cfg.reviewQuote ||
                      'The most precious keepsake on our wedding day. The 24K gold foil calligraphy and velvet backing exceeded all our expectations.'}&rdquo;
                  </blockquote>
                  <div className="pt-2 border-t border-white/10 text-xs">
                    <strong className="text-white">{cfg.reviewAuthor || 'Fatima & Bilal'}</strong>
                    <div className="text-stone-400 text-[11px]">
                      {cfg.reviewLocation || 'Islamabad • Imperial Royal Frame'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Section 7: New Releases
  const renderNewReleases = (cfg) => {
    return (
      <section
        key="newReleases"
        className={`${getSpacingClass(cfg.spacing)} px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full`}
      >
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#8C6D42]">
              {cfg.badge || 'New Season Releases'}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mt-1">
              {cfg.title || 'Fresh New Releases'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              {cfg.subtitle ||
                'The latest trending personalized frames and keepsake gifts.'}
            </p>
          </div>
          <Link
            href="/categories/luxury-frames"
            className="text-xs font-bold text-[#8C6D42] hover:text-stone-900 transition flex items-center space-x-1 uppercase tracking-wider"
          >
            <span>{cfg.viewAllText || 'Explore New Arrivals'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {freshAtelierProducts.map((p, idx) => (
            <ProductCard
              key={p.id || p.slug || idx}
              product={p}
              storeSettings={storeSettings}
              onToast={showToast}
            />
          ))}
        </div>
      </section>
    );
  };

  // Section 8: Reviews & Feedback Screenshots (Screenshot 3)
  const renderReviews = (cfg) => {
    return (
      <section
        key="reviews"
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${getSpacingClass(cfg.spacing)} border-t border-stone-200/80`}
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C59A27]/30 text-[#8C6D42] text-[11px] font-bold tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#E3C677]" />
              <span>{cfg.badge || 'Real Customer Feedback & Screenshots'}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight">
              {cfg.title || 'Loved by Over 1,200+ Couples & Families'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-2xl leading-relaxed">
              {cfg.subtitle ||
                'Genuine WhatsApp conversations, delivery pictures, and heartfelt thank-you notes from our cherished patrons across Pakistan. Tap any picture to read the full screenshot.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                if (reviewsScrollRef.current) {
                  reviewsScrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
                }
              }}
              className="w-10 h-10 rounded-full border border-stone-300 hover:border-[#8C6D42] bg-white hover:bg-[#FAF7F2] text-stone-700 flex items-center justify-center transition shadow-xs cursor-pointer"
              title="Scroll Left"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (reviewsScrollRef.current) {
                  reviewsScrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
                }
              }}
              className="w-10 h-10 rounded-full border border-stone-300 hover:border-[#8C6D42] bg-white hover:bg-[#FAF7F2] text-stone-700 flex items-center justify-center transition shadow-xs cursor-pointer"
              title="Scroll Right"
              aria-label="Next Reviews"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={reviewsScrollRef}
          className="flex space-x-5 overflow-x-auto pb-6 pt-2 scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'thin' }}
        >
          {reviews
            .filter((r) => r.approved !== false)
            .map((rev) => (
              <div
                key={rev.id}
                className="w-[280px] sm:w-[330px] md:w-[360px] shrink-0 snap-start bg-white rounded-2xl border border-stone-200 hover:border-[#C59A27]/60 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group"
              >
                {rev.screenshotUrl || rev.imageUrl ? (
                  <div
                    onClick={() => setActiveReviewScreenshot(rev)}
                    className="relative aspect-[4/3] bg-stone-900/5 overflow-hidden cursor-pointer group/img"
                    title="Click to view full screenshot"
                  >
                    <img
                      src={rev.screenshotUrl || rev.imageUrl}
                      alt={`Review from ${rev.customerName}`}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                      <span className="text-white text-xs font-semibold flex items-center space-x-1.5 drop-shadow">
                        <Maximize2 className="w-3.5 h-3.5 text-[#E3C677]" />
                        <span>Enlarge Screenshot</span>
                      </span>
                      <span className="text-[10px] bg-white/20 backdrop-blur-xs text-white px-2 py-0.5 rounded-full font-mono">
                        Verified
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-stone-800 shadow-xs flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Original Chat</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-br from-[#FAF7F2] to-stone-100 border-b border-stone-100 flex items-center space-x-2 text-stone-500 text-xs">
                    <Sparkles className="w-4 h-4 text-[#C59A27]" />
                    <span className="font-serif italic">Atelier Client Review</span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-[#C59A27] text-[#C59A27]" />
                        ))}
                      </div>
                      {rev.verified && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Verified Order
                        </span>
                      )}
                    </div>

                    <p className="font-sans text-xs sm:text-[13px] text-stone-700 leading-relaxed italic line-clamp-3">
                      &quot;{rev.comment}&quot;
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
                        {rev.customerName}
                      </h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5 truncate max-w-[190px]">
                        {rev.productName || 'Bespoke Keepsake'}
                      </p>
                    </div>

                    {rev.screenshotUrl && (
                      <button
                        type="button"
                        onClick={() => setActiveReviewScreenshot(rev)}
                        className="text-[11px] font-semibold text-[#8C6D42] hover:text-stone-900 transition flex items-center space-x-1"
                      >
                        <span>View Chat</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans selection:bg-[#C59A27]/20 selection:text-stone-900">
      {/* 1. Global Header with Categories dropdown & Portal Track Order modal */}
      <StorefrontHeader
        storeSettings={storeSettings}
        categories={categories}
        products={products}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#1C1917] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-[#C59A27]/40 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#E3C677]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dynamic Homepage Sections configured via Admin Homepage Builder */}
      {sectionOrder.map((sectionKey) => {
        const cfg = sectionConfig[sectionKey] || DEFAULT_SECTION_CONFIG[sectionKey] || {};
        if (cfg.enabled === false) return null;
        if (sectionKey === 'philosophy' && !cfg.enabled) return null;

        switch (sectionKey) {
          case 'hero':
            return renderHero(cfg);
          case 'trustPillars':
            return renderTrustPillars(cfg);
          case 'categories':
            return renderCategories(cfg);
          case 'madeForMoments':
            return renderMadeForMoments(cfg);
          case 'mostCherished':
            return renderMostCherished(cfg);
          case 'philosophy':
            return renderPhilosophy(cfg);
          case 'newReleases':
            return renderNewReleases(cfg);
          case 'reviews':
            return renderReviews(cfg);
          default:
            return null;
        }
      })}

      {/* Screenshot Lightbox Modal */}
      {activeReviewScreenshot && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setActiveReviewScreenshot(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#1C1917] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#E3C677]" />
                <span className="font-serif font-bold text-sm">
                  {activeReviewScreenshot.customerName}&apos;s Real Review
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveReviewScreenshot(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg transition cursor-pointer"
                aria-label="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview Container with high-res display */}
            <div className="p-3 bg-stone-950 flex items-center justify-center overflow-auto max-h-[60vh]">
              <img
                src={activeReviewScreenshot.screenshotUrl || activeReviewScreenshot.imageUrl}
                alt={activeReviewScreenshot.customerName}
                className="max-h-[58vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Footer with details */}
            <div className="p-4 bg-white border-t border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex text-amber-500">
                  {Array.from({ length: activeReviewScreenshot.rating || 5 }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-[#C59A27] text-[#C59A27]" />
                  ))}
                </div>
                <span className="text-xs text-stone-500 font-mono">
                  Product: {activeReviewScreenshot.productName}
                </span>
              </div>
              <p className="text-xs text-stone-700 italic bg-[#FAF7F2] p-3 rounded-xl border border-stone-200">
                &quot;{activeReviewScreenshot.comment}&quot;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Sales Social Proof Toast */}
      <LiveSalesToast products={products} />

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

      {/* Quick Order / Personalization Modal */}
      {customizingProduct && (
        <ProductQuickOrderModal
          product={customizingProduct}
          isOpen={!!customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={(customizedItem) => {
            const nextCart = [...cartItems, customizedItem];
            saveCart(nextCart);
            setCustomizingProduct(null);
            setIsCartOpen(true);
            showToast(`Added ${customizedItem.name} to your Keepsake Box!`);
          }}
          storeSettings={storeSettings}
        />
      )}

      {/* Storefront Footer */}
      <StorefrontFooter storeSettings={storeSettings} />
    </div>
  );
}
