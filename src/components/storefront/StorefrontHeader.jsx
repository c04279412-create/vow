'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Sparkles,
  Phone,
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Heart,
  User,
  ArrowRight,
  PackageSearch,
  ExternalLink,
} from 'lucide-react';
import CustomerAuthModal from '@/components/storefront/CustomerAuthModal';
import SocialLinksBar from './SocialLinksBar';

const MAIN_NAV_ITEMS = [
  {
    name: 'Wedding',
    slug: 'wedding',
    badge: 'Popular',
    desc: 'Nikkah Namas, floral preservation & folios',
    subcategories: [
      { name: 'Nikkah Nama Frames', slug: 'nikkah-nama-frames' },
      { name: 'Floral Preservation Boxes', slug: 'floral-preservation' },
      { name: 'Fingerprint Guestbooks', slug: 'fingerprint-guestbooks' },
      { name: 'Velvet Nikkah Booklets & Folios', slug: 'nikkah-folios' },
      { name: 'Mirror & Acrylic Welcome Boards', slug: 'welcome-boards' },
    ],
  },
  {
    name: 'CUSTOMIZED FRAME',
    slug: 'customized-frame',
    badge: 'Popular',
    desc: 'Personalized Elegance for Every Wall',
    subcategories: [
      { name: 'ISLAIMC FRAMES', slug: 'islaimc-frames' },
      { name: 'NIKHA FRAMES', slug: 'nikha-frames' },
      { name: 'BIRTHDAY FRAME', slug: 'birthday-frame' },
      { name: 'COLLAGE FRAMES', slug: 'collage-frames' },
    ],
  },
  {
    name: 'Newborn',
    slug: 'newborn',
    badge: 'New',
    desc: 'Baby birth plaques & keepsake boxes',
    subcategories: [
      { name: 'Birth Announcement Plaques', slug: 'birth-plaques' },
      { name: 'Baby Keepsake Wooden Boxes', slug: 'baby-keepsake-boxes' },
      { name: 'First Year Milestone Collages', slug: 'milestone-collages' },
    ],
  },
  {
    name: 'Occasions',
    slug: 'occasions',
    badge: 'Trending',
    desc: 'Anniversary mosaics & Spotify plaques',
    subcategories: [
      { name: 'Anniversary Photo Mosaics', slug: 'photo-mosaics' },
      { name: 'Spotify Scannable Music Plaques', slug: 'spotify-plaques' },
      { name: 'Birthday & Couple Keepsakes', slug: 'couple-keepsakes' },
    ],
  },
]; 

const DEFAULT_CATEGORIES = MAIN_NAV_ITEMS;

export default function StorefrontHeader({
  storeSettings,
  categories = [],
  products = [],
  cartCount = 0,
  onOpenCart,
  onSelectCategory,
  searchQuery = '',
  setSearchQuery = () => {},
}) {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackOrderModalOpen, setTrackOrderModalOpen] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [wishlistToast, setWishlistToast] = useState(false);

  const [liveCategories, setLiveCategories] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const checkCustomer = () => {
      try {
        const saved = localStorage.getItem('vowcrafts_customer');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email) setCustomer(parsed);
          else setCustomer(null);
        } else {
          setCustomer(null);
        }
      } catch (e) {
        setCustomer(null);
      }
    };
    checkCustomer();
    window.addEventListener('vowcrafts_customer_changed', checkCustomer);
    return () => window.removeEventListener('vowcrafts_customer_changed', checkCustomer);
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const cached = localStorage.getItem('vowcrafts_categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) setLiveCategories(parsed);
      }
    } catch (e) {}

    if (!categories || categories.length === 0) {
      fetch('/api/categories', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.categories && Array.isArray(data.categories)) {
            setLiveCategories(data.categories);
            try {
              localStorage.setItem('vowcrafts_categories', JSON.stringify(data.categories));
            } catch (e) {}
          }
        })
        .catch(() => {});
    }
  }, [categories]);

  const categoriesRef = useRef(null);
  const collectionsRef = useRef(null);
  const searchInputRef = useRef(null);

  const rawWhatsapp = (storeSettings?.whatsappNumber || '+923008472910').replace(/[^0-9]/g, '');

  // Dynamic counts calculation from products
  const categoryCounts = useMemo(() => {
    const counts = {
      wedding: 0,
      newborn: 0,
      occasions: 0,
      'luxury-frames': 0,
    };
    if (products && Array.isArray(products)) {
      products.forEach((p) => {
        if (p.isActive !== false) {
          const cat = (p.category || '').toLowerCase();
          if (cat === 'wedding' || cat.includes('wedding') || cat.includes('nikkah')) {
            counts.wedding++;
          } else if (cat === 'newborn' || cat.includes('newborn') || cat.includes('baby')) {
            counts.newborn++;
          } else if (cat === 'occasions' || cat.includes('occasion') || cat.includes('personalized')) {
            counts.occasions++;
          } else if (cat === 'luxury frames' || cat.includes('frame') || cat.includes('living')) {
            counts['luxury-frames']++;
          }
        }
      });
    }
    return counts;
  }, [products]);

  // Merge categories from props (or live fetched) with defaults, strictly respecting displayOrder
  const displayCategories = useMemo(() => {
    const rawList =
      categories && categories.length > 0
        ? categories
        : liveCategories.length > 0
        ? liveCategories
        : MAIN_NAV_ITEMS;

    // Filter active categories
    const active = rawList.filter((cat) => cat.isActive !== false);

    // Sort strictly by displayOrder (1, 2, 3...)
    const sorted = [...active].sort((a, b) => {
      const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
      const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
      return orderA - orderB;
    });

    return sorted.map((cat) => {
      let displayName = cat.name;
      if (displayName?.toLowerCase() === 'luxury frames') displayName = 'Frames';
      return {
        ...cat,
        name: cat.name,
        displayName: displayName || cat.name,
        subcategories: cat.subcategories || [],
        count: categoryCounts[cat.slug] || categoryCounts[cat.name] || cat.count || 0,
      };
    });
  }, [categories, liveCategories, categoryCounts]);

    const navRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleCategoryClick = (catName) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    setMobileMenuOpen(false);
    const catalogEl = document.getElementById('vault-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTrackOrderSubmit = async (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    const query = trackingInput.trim();

    // Check if user directly provided a tracking URL
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    if (isUrl) {
      setTrackingResult({
        id: 'Custom Tracking Link',
        status: 'Dispatched & Active In Courier Network',
        trackingId: query,
        trackingUrl: query,
        note: 'Click below to open live tracking in a new tab.',
      });
      return;
    }

    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const orders = data.orders || [];
        const match = orders.find(
          (o) =>
            o.orderNumber?.toLowerCase() === query.toLowerCase() ||
            o.id?.toLowerCase() === query.toLowerCase() ||
            o.customer?.phone?.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
            o.tracking?.trackingId?.toLowerCase() === query.toLowerCase()
        );
        if (match) {
          setTrackingResult({
            id: match.orderNumber || match.id,
            status:
              match.orderStatus === 'delivered'
                ? 'Delivered to Doorstep'
                : match.orderStatus === 'shipped'
                ? 'Dispatched / In Transit'
                : 'In Production & Archival Framing',
            customerName: match.customer?.fullName,
            trackingId: match.tracking?.trackingId || query,
            trackingUrl: match.tracking?.trackingUrl || null,
            note:
              match.tracking?.notes ||
              'Your bespoke keepsake is being hand-gilded and framed with museum-grade precision.',
          });
          return;
        }
      }
    } catch (err) {}

    // Default status with link opening
    setTrackingResult({
      id: query.toUpperCase(),
      status: 'In Production & Archival Framing',
      trackingId: query.toUpperCase(),
      trackingUrl: null,
      note: 'Artwork is approved. Courier tracking link will be provided via SMS & WhatsApp upon dispatch.',
    });
  };

  const triggerWishlistToast = () => {
    setWishlistToast(true);
    setTimeout(() => setWishlistToast(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 select-none transition-all">
      {/* 1. Top Announcement Bar with Scrolling Marquee & Dismiss Button */}
      {showAnnouncement && (
        <div className="bg-[#1C1917] text-[#FAF7F2] text-[11px] sm:text-xs py-2 px-3 border-b border-[#C59A27]/20 flex items-center justify-between overflow-hidden relative select-none">
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="inline-flex items-center space-x-3 px-8 text-stone-200">
                  <Sparkles className="w-3.5 h-3.5 text-[#E3C677] shrink-0 inline-block" />
                  <span className="font-medium tracking-wide">
                    {storeSettings?.announcementTickerText ||
                      'Free Express Delivery across Pakistan on orders above PKR 3,000 | Contact WhatsApp for Custom Orders'}
                  </span>
                  <span className="text-[#C59A27] font-bold text-xs">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top-Right Social Media Channels */}
          <div className="flex items-center space-x-2 shrink-0 z-10 pl-3 border-l border-white/10 ml-2">
            <span className="hidden lg:inline text-[10px] text-[#E3C677] font-semibold tracking-wider uppercase">
              Follow:
            </span>
            <SocialLinksBar socialLinks={storeSettings?.socialLinks} variant="header" />
          </div>

          <button
            type="button"
            onClick={() => setShowAnnouncement(false)}
            className="text-stone-400 hover:text-white p-1 rounded-sm transition shrink-0 ml-2 z-10 bg-[#1C1917]/80 backdrop-blur-xs cursor-pointer"
            title="Dismiss announcement"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left Column: Brand Monogram & Title */}
        <div className="flex items-center justify-start flex-1 min-w-0">
          <Link href="/" className="flex items-center space-x-3 shrink-0 group">
            {storeSettings?.storeLogo ? (
              <div className="w-10 h-10 rounded-full border border-[#B5936C]/70 overflow-hidden flex items-center justify-center bg-white group-hover:border-[#8C6D42] transition shadow-xs shrink-0">
                <img
                  src={storeSettings.storeLogo}
                  alt={storeSettings?.storeName || 'VowCrafts Logo'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full border border-[#B5936C]/70 flex items-center justify-center bg-[#FAF7F2] text-[#8C6D42] group-hover:border-[#8C6D42] transition shadow-xs shrink-0">
                <span className="font-serif font-bold text-lg leading-none">
                  {(storeSettings?.storeName || 'VowCrafts').trim().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.2em] text-stone-900 leading-tight uppercase group-hover:text-[#8C6D42] transition">
                {storeSettings?.storeName?.split('|')[0]?.trim() || 'VOWCRAFTS'}
              </span>
              <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.25em] text-[#B5936C] uppercase font-semibold mt-0.5 max-w-[200px] truncate">
                {storeSettings?.tagline || 'GIFTS WITH A PERSONAL TOUCH'}
              </span>
            </div>
          </Link>
        </div>

        {/* Center Column: Desktop Navigation Links - Perfectly Centered */}
        <nav
          ref={navRef}
          className="hidden lg:flex items-center justify-center shrink-0 space-x-2.5 xl:space-x-4 2xl:space-x-6 text-[11px] xl:text-xs 2xl:text-sm font-medium tracking-wider text-stone-800 whitespace-nowrap px-2"
        >
          {/* Shop All */}
          <Link
            href="/categories/all"
            className="hover:text-[#B5936C] transition uppercase py-2 cursor-pointer font-semibold text-stone-800 whitespace-nowrap"
          >
            SHOP ALL
          </Link>

          {/* Primary Front Categories: Wedding, Newborn, Occasions, Frames (Directly Dynamic from Admin) */}
          {displayCategories.map((item) => {
            const count = categoryCounts[item.slug] || categoryCounts[item.name] || 0;
            const isOpen = activeDropdown === item.slug;

            return (
              <div
                key={item.slug}
                className="relative group py-2"
                onMouseEnter={() => setActiveDropdown(item.slug)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={`/categories/${item.slug}`}
                  onClick={() => setActiveDropdown(null)}
                  className={`flex items-center space-x-1 uppercase transition cursor-pointer font-semibold whitespace-nowrap ${
                    isOpen ? 'text-[#B5936C]' : 'hover:text-[#B5936C]'
                  }`}
                >
                  <span className="whitespace-nowrap">{item.displayName || item.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-400 group-hover:text-[#B5936C] transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#B5936C]' : ''
                    }`}
                  />
                </Link>

                {/* Dropdown Card */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 bg-white rounded-xl shadow-xl shadow-stone-900/10 border border-stone-100 p-3 z-50 transition-all duration-150 ${
                    isOpen
                      ? 'opacity-100 scale-100 pointer-events-auto visible'
                      : 'opacity-0 scale-95 pointer-events-none invisible'
                  }`}
                  role="menu"
                >
                  {/* Category Title & Badge */}
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-stone-400 uppercase px-2.5 pb-2 mb-1.5 border-b border-stone-100">
                    <span className="text-stone-800">{item.name} Collection</span>
                    {count > 0 && (
                      <span className="text-[10px] bg-[#FAF7F2] text-[#8C6D42] px-2 py-0.5 rounded-full border border-[#C59A27]/20 font-mono">
                        {count} items
                      </span>
                    )}
                  </div>

                  {/* Subcategories List */}
                  <div className="space-y-0.5">
                    {item.subcategories.map((sub) => (
                      <Link
                        key={sub.name}
                        href={`/categories/${item.slug}?subcategory=${encodeURIComponent(sub.name)}`}
                        onClick={() => setActiveDropdown(null)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-stone-700 hover:text-[#B5936C] hover:bg-stone-50/80 transition-colors text-left group/item cursor-pointer"
                      >
                        <span className="group-hover/item:translate-x-0.5 transition-transform font-normal">
                          {sub.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover/item:text-[#B5936C] transition-colors" />
                      </Link>
                    ))}
                  </div>

                  {/* Direct Link to View All In This Category */}
                  <div className="pt-2 mt-1.5 border-t border-stone-100 px-2.5">
                    <Link
                      href={`/categories/${item.slug}`}
                      onClick={() => setActiveDropdown(null)}
                      className="text-xs font-semibold text-[#B5936C] hover:text-[#8C6D42] flex items-center gap-1.5 transition-colors group/link cursor-pointer"
                    >
                      <span>Explore all {item.name}</span>
                      <span className="group-hover/link:translate-x-1 transition-transform">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* OUR STORY */}
          <a
            href="/#atelier-story"
            className="hover:text-[#B5936C] transition uppercase py-2 cursor-pointer font-semibold text-stone-700 whitespace-nowrap"
          >
            OUR STORY
          </a>

          {/* TRACK ORDER */}
          <button
            type="button"
            onClick={() => setTrackOrderModalOpen(true)}
            className="hover:text-[#B5936C] transition uppercase py-2 cursor-pointer font-semibold text-stone-700 whitespace-nowrap"
          >
            TRACK ORDER
          </button>
        </nav>

        {/* Right Column: Action Icons */}
        <div className="flex items-center justify-end flex-1 min-w-0 space-x-3.5 sm:space-x-4 xl:space-x-5 text-stone-700">
          {/* Search Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 hover:text-[#B5936C] transition cursor-pointer focus:outline-none rounded-lg"
              title="Search Catalog"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>

            {/* Expanding Search Input Popover */}
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-stone-200 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Nikkah frames, gifts..."
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 text-stone-400 hover:text-stone-600 focus:outline-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>Filtering by &ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="text-[#B5936C] font-semibold focus:outline-none"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User / Patron Account Button */}
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="p-1.5 hover:text-[#B5936C] transition cursor-pointer flex items-center space-x-1.5 focus:outline-none rounded-lg"
            title={customer ? `Signed in as ${customer.fullName}` : "Patron Sign In / Register"}
            aria-label="Patron Account"
          >
            <User className="w-5 h-5 stroke-[1.8]" />
            {customer && (
              <span className="hidden xl:inline text-xs font-semibold text-stone-800 max-w-[80px] truncate">
                {customer.fullName?.split(' ')[0]}
              </span>
            )}
          </button>

          {/* Heart / Wishlist Icon */}
          <button
            type="button"
            onClick={triggerWishlistToast}
            className="p-1.5 hover:text-[#B5936C] transition cursor-pointer relative focus:outline-none rounded-lg"
            title="Saved Keepsakes"
            aria-label="Saved Keepsakes"
          >
            <Heart className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Shopping Bag / Cart Button */}
          <Link
            href="/cart"
            onClick={(e) => {
              if (onOpenCart) {
                e.preventDefault();
                onOpenCart();
              }
            }}
            className="p-1.5 hover:text-[#B5936C] transition cursor-pointer relative focus:outline-none rounded-lg"
            title="Cart & Checkout"
            aria-label="Cart & Checkout"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 text-stone-800 hover:text-[#B5936C] transition"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-stone-200 px-4 py-5 space-y-5 animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search frames, keepsakes, gifts..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#C59A27]"
            />
          </div>

                    {/* Mobile Categories Direct Links */}
          <div>
            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-2">
              BROWSE DEPARTMENTS
            </div>
            <div className="space-y-1">
              <Link
                href="/categories/all"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-semibold text-stone-800 hover:bg-stone-50 text-left"
              >
                <span>✨ All Keepsakes & Catalog</span>
                <span className="text-[11px] text-stone-400 font-normal">Shop All</span>
              </Link>
              {displayCategories.map((item) => {
                const count = categoryCounts[item.slug] || categoryCounts[item.name] || 0;
                return (
                  <Link
                    key={item.slug}
                    href={`/categories/${item.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-50 text-left"
                  >
                    <span className="font-semibold text-stone-900">{item.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold">
                      {count} items
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Additional Links */}
          <div className="pt-2 border-t border-stone-100 space-y-2 text-xs font-medium text-stone-700">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="w-full flex items-center justify-between py-2 text-stone-700 hover:text-[#B5936C] text-left"
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#B5936C]" />
                <span>{customer ? `Patron Profile (${customer.fullName})` : 'Sign In / Register with Gmail'}</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Account</span>
            </button>
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between py-2 text-stone-700 hover:text-[#B5936C]"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#B5936C]" />
                <span>Shopping Bag &amp; Checkout</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">{cartCount} items</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setTrackOrderModalOpen(true);
              }}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-stone-50 flex items-center space-x-2"
            >
              <PackageSearch className="w-4 h-4 text-[#B5936C]" />
              <span>Track Your Order</span>
            </button>
            <a
              href="#atelier-story"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 rounded-lg hover:bg-stone-50"
            >
              Our Atelier Story
            </a>
            <Link
              href="/admin"
              className="py-2 px-3 rounded-lg hover:bg-stone-50 flex items-center justify-between text-stone-800 font-semibold"
            >
              <span>Admin Management Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B5936C]" />
            </Link>
          </div>

          {/* WhatsApp Direct Action */}
          <div className="pt-2 border-t border-stone-100">
            <a
              href={`https://wa.me/${rawWhatsapp}?text=Hi%20VowCrafts%20Atelier!%20I%20would%20like%20to%20discuss%20a%20custom%20order.`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Atelier Concierge</span>
            </a>
          </div>
        </div>
      )}

      {/* 4. Track Order Modal using React Portal for true viewport centering */}
      {mounted &&
        trackOrderModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative my-auto animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setTrackOrderModalOpen(false);
                  setTrackingResult(null);
                  setTrackingInput('');
                }}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                aria-label="Close tracking"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2.5 mb-2">
                <div className="w-9 h-9 rounded-full bg-[#FAF7F2] text-[#8C6D42] border border-[#B5936C]/40 flex items-center justify-center">
                  <PackageSearch className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Track Keepsake Order
                </h3>
              </div>
              <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                Enter your Order ID, tracking number, or tracking link below to check production status or open live courier tracking.
              </p>

              <form onSubmit={handleTrackOrderSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Enter Order ID, phone, or courier tracking link"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-serif font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-sm"
                >
                  Track Live Status
                </button>
              </form>

              {trackingResult && (
                <div className="mt-5 p-4 rounded-xl bg-[#FAF7F2] border border-[#C59A27]/30 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>Order: {trackingResult.id}</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                      Active
                    </span>
                  </div>

                  <div className="text-stone-700">
                    <span className="font-medium text-stone-500">Live Status: </span>
                    <span className="font-semibold text-[#8C6D42]">{trackingResult.status}</span>
                  </div>

                  {trackingResult.trackingId && (
                    <div className="text-stone-600 font-mono text-[11px] truncate">
                      <span>Tracking Code: </span>
                      <span className="font-semibold">{trackingResult.trackingId}</span>
                    </div>
                  )}

                  {/* Open in new browser tab button */}
                  {trackingResult.trackingUrl && (
                    <div className="pt-2 border-t border-stone-200/80">
                      <a
                        href={trackingResult.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-[#FAF7F2] font-semibold text-xs transition flex items-center justify-center space-x-2 text-center shadow-sm"
                      >
                        <span>Open Live Courier Tracking (New Tab)</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#E3C677]" />
                      </a>
                    </div>
                  )}

                  <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200/60 leading-relaxed">
                    {trackingResult.note}
                  </p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Wishlist Toast */}
      {wishlistToast && (
        <div className="fixed top-24 right-6 z-50 bg-[#1C1917] text-white text-xs px-4 py-2.5 rounded-xl shadow-xl border border-[#C59A27]/40 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          <span>Keepsake saved to your wishlist!</span>
        </div>
      )}
      {/* Customer Patron Auth Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(logged) => setCustomer(logged)}
      />
    </header>
  );
}
