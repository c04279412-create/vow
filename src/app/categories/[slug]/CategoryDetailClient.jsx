'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Crown,
  Star,
  Eye,
  ShoppingBag,
  Filter,
  Phone,
} from 'lucide-react';

import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import StorefrontFooter from '@/components/storefront/StorefrontFooter';
import ProductCard from '@/components/storefront/ProductCard';
import CartDrawer from '@/components/storefront/CartDrawer';
import ProductQuickOrderModal from '@/components/storefront/ProductQuickOrderModal';
import { initialProducts, initialCategories, initialSettings } from '@/lib/dataStore';

export default function CategoryDetailClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug = params?.slug;
  const initialSubcat = searchParams?.get('subcategory') || 'ALL';

  const [storeSettings, setStoreSettings] = useState(initialSettings);
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);

  const [selectedSubcategory, setSelectedSubcategory] = useState(initialSubcat);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('FEATURED');

  useEffect(() => {
    setSelectedSubcategory(searchParams?.get('subcategory') || 'ALL');
  }, [slug, searchParams]);

  // Cart & Modal states
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load persistent cart
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

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setStoreSettings(data.settings);
      })
      .catch(() => {});

    try {
      const cachedCats = localStorage.getItem('vowcrafts_categories');
      if (cachedCats) {
        const parsed = JSON.parse(cachedCats);
        if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
      }
      const cachedProds = localStorage.getItem('vowcrafts_products');
      if (cachedProds) {
        const parsedP = JSON.parse(cachedProds);
        if (Array.isArray(parsedP) && parsedP.length > 0) setProducts(parsedP);
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
        if (data?.products?.length > 0) {
          setProducts(data.products);
          try {
            localStorage.setItem('vowcrafts_products', JSON.stringify(data.products));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Find active category
  const activeCategory = useMemo(() => {
    if (!slug) return null;
    const clean = slug.toLowerCase();
    if (clean === 'all') {
      return {
        name: 'All Keepsakes',
        slug: 'all',
        description: 'Explore the complete VowCrafts collection of bespoke wedding frames, newborn keepsakes, and luxury gifts.',
        subcategories: [
          { name: 'Wedding', slug: 'wedding' },
          { name: 'Newborn', slug: 'newborn' },
          { name: 'Occasions', slug: 'occasions' },
          { name: 'Luxury Frames', slug: 'luxury-frames' },
        ],
      };
    }
    return (
      categories.find(
        (c) =>
          c.slug?.toLowerCase() === clean ||
          c.id?.toLowerCase() === clean ||
          c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === clean ||
          (clean === 'frames' && (c.slug === 'luxury-frames' || c.name === 'Luxury Frames'))
      ) || {
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        slug,
        description: 'Bespoke heirloom handcrafted keepsakes tailored for timeless moments.',
        subcategories: [],
      }
    );
  }, [slug, categories]);

  // Filter products for this category
  const categoryProducts = useMemo(() => {
    if (!activeCategory) return [];

    let list = products.filter((p) => {
      if (p.isActive === false) return false;
      const isAll = activeCategory.slug === 'all';
      const matchesCategory =
        isAll ||
        p.category?.toLowerCase() === activeCategory.name.toLowerCase() ||
        p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === activeCategory.slug?.toLowerCase() ||
        (Array.isArray(p.additionalCategories) && p.additionalCategories.some(ac => 
          ac?.toLowerCase() === activeCategory.name.toLowerCase() ||
          ac?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === activeCategory.slug?.toLowerCase()
        )) ||
        (activeCategory.slug === 'wedding' && (p.category?.toLowerCase().includes('wedding') || p.category?.toLowerCase().includes('nikkah'))) ||
        (activeCategory.slug === 'newborn' && (p.category?.toLowerCase().includes('newborn') || p.category?.toLowerCase().includes('baby'))) ||
        (activeCategory.slug === 'occasions' && (p.category?.toLowerCase().includes('occasion') || p.category?.toLowerCase().includes('anniversary'))) ||
        (activeCategory.slug === 'luxury-frames' && (p.category?.toLowerCase().includes('frame')));

      if (!matchesCategory) return false;

      // Subcategory filter
      if (selectedSubcategory !== 'ALL') {
        const subLow = selectedSubcategory.toLowerCase();
        const matchesSubcat =
          p.subcategory?.toLowerCase() === subLow ||
          p.subcategory?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === subLow ||
          (Array.isArray(p.additionalSubcategories) && p.additionalSubcategories.some(as => 
            as?.toLowerCase() === subLow ||
            as?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === subLow
          )) ||
          (isAll && (
            p.category?.toLowerCase() === subLow ||
            p.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === subLow ||
            (Array.isArray(p.additionalCategories) && p.additionalCategories.some(ac => 
              ac?.toLowerCase() === subLow ||
              ac?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === subLow
            )) ||
            (subLow === 'wedding' && (p.category?.toLowerCase().includes('wedding') || p.category?.toLowerCase().includes('nikkah'))) ||
            (subLow === 'newborn' && (p.category?.toLowerCase().includes('newborn') || p.category?.toLowerCase().includes('baby'))) ||
            (subLow === 'occasions' && (p.category?.toLowerCase().includes('occasion') || p.category?.toLowerCase().includes('anniversary'))) ||
            (subLow.includes('frame') && p.category?.toLowerCase().includes('frame'))
          ));
        if (!matchesSubcat) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesDesc = p.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });

    if (sortBy === 'PRICE_LOW') {
      list = [...list].sort(
        (a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice)
      );
    } else if (sortBy === 'PRICE_HIGH') {
      list = [...list].sort(
        (a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice)
      );
    }

    return list;
  }, [products, activeCategory, selectedSubcategory, searchQuery, sortBy]);

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
    showToast(`Added ${product.name} to your Keepsake Box!`);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans selection:bg-[#C59A27]/20 selection:text-stone-900">
      <StorefrontHeader
        storeSettings={storeSettings}
        categories={categories}
        products={products}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={(catName) => {
          const target = categories.find((c) => c.name === catName);
          if (target?.slug) {
            router.push(`/categories/${target.slug}`);
          } else {
            router.push(`/?category=${encodeURIComponent(catName)}#vault-catalog`);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#1C1917] text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-[#C59A27]/40 flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-[#E3C677]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="bg-white border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center space-x-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <Link href="/#categories" className="hover:text-stone-900 transition">
            Categories
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className="text-[#8C6D42] font-semibold">{activeCategory?.name}</span>
        </div>
      </div>

      <section className="bg-gradient-to-b from-white to-[#FAF7F2] border-b border-stone-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#C59A27]/40 text-[#8C6D42] text-xs font-mono font-bold uppercase tracking-widest">
            <Crown className="w-3.5 h-3.5" />
            <span>Curated Category Vault</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            {activeCategory?.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-serif italic max-w-xl mx-auto leading-relaxed">
            {activeCategory?.description ||
              'Heirloom quality handcrafted creations designed for weddings, vows, and treasured memories.'}
          </p>

          {activeCategory?.subcategories?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSubcategory('ALL')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  selectedSubcategory === 'ALL'
                    ? 'bg-[#1C1917] text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                All {activeCategory.name}
              </button>
              {activeCategory.subcategories.map((sub) => (
                <button
                  key={sub.id || sub.slug || sub.name}
                  type="button"
                  onClick={() => setSelectedSubcategory(sub.name)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                    selectedSubcategory === sub.name
                      ? 'bg-[#1C1917] text-white shadow-md'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 text-xs">
          <div className="text-stone-500 font-medium">
            Showing <strong className="text-stone-900">{categoryProducts.length}</strong>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-stone-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#C59A27] cursor-pointer"
            >
              <option value="FEATURED">Featured Artistry</option>
              <option value="PRICE_LOW">Price: Low to High</option>
              <option value="PRICE_HIGH">Price: High to Low</option>
            </select>
          </div>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-300 p-8 space-y-4">
            <Crown className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-800">
              No Products in this Subcategory Yet
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Our master artisans are actively crafting new designs. View all other products in this category.
            </p>
            <button
              type="button"
              onClick={() => setSelectedSubcategory('ALL')}
              className="px-5 py-2.5 rounded-xl bg-[#1C1917] text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition"
            >
              Show All {activeCategory?.name}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {categoryProducts.map((product, idx) => (
              <ProductCard
                key={product.id || product.slug || idx}
                product={product}
                storeSettings={storeSettings}
                onToast={showToast}
              />
            ))}
          </div>
        )}
      </main>

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

      <StorefrontFooter storeSettings={storeSettings} />
    </div>
  );
}
