'use client';

import React, { useState } from 'react';
import {
  Sliders,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Save,
  CheckCircle,
  ExternalLink,
  Layers,
  Crown,
  Heart,
  MessageSquare,
  Package,
  ShieldCheck,
  Image as ImageIcon,
  Layout,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';

export const DEFAULT_SECTION_ORDER = [
  'hero',
  'trustPillars',
  'categories',
  'madeForMoments',
  'mostCherished',
  'philosophy',
  'newReleases',
  'reviews',
];

export const DEFAULT_SECTION_CONFIG = {
  hero: {
    enabled: true,
    spacing: 'normal',
  },
  trustPillars: {
    enabled: true,
    spacing: 'normal',
    pillar1Title: 'Express Delivery in Pakistan',
    pillar1Desc: 'Protected courier delivery across all cities.',
    pillar2Title: 'Handcrafted Quality',
    pillar2Desc: 'Premium materials crafted with attention to detail.',
    pillar3Title: 'Cash on Delivery (COD)',
    pillar3Desc: 'Pay securely upon delivery at your doorstep.',
    pillar4Title: 'Dedicated Customer Support',
    pillar4Desc: 'Instant WhatsApp priority consultation.',
  },
  categories: {
    enabled: true,
    spacing: 'normal',
    badge: 'Curated Atelier',
    title: 'Shop by Category',
    subtitle: 'Browse handcrafted designs tailored to your special moments',
  },
  madeForMoments: {
    enabled: true,
    spacing: 'normal',
    badge: 'Curated Collection',
    title: 'Made for Moments',
    description: 'Curated keepsakes immortalizing your most cherished matrimonial memories and milestones.',
    buttonText: 'Explore Full Collection',
    buttonLink: '/categories/luxury-frames',
  },
  mostCherished: {
    enabled: true,
    spacing: 'normal',
    badge: 'Curated Collection',
    title: 'Most Cherished Creations',
    subtitle: 'Our highest rated and most requested pieces from the atelier.',
    viewAllText: 'View All Bestsellers',
  },
  philosophy: {
    enabled: false, // Default false/optional as requested by user
    spacing: 'normal',
    badge: 'The Philosophy',
    title: 'Honoring Sacred Vows Through Timeless Artistry',
    description: 'Every marriage vow represents an eternal promise. In our atelier, master calligraphers apply museum-grade acrylic protection to ensure your memories remain pristine for generations.',
    pillar1Title: 'Heritage Atelier',
    pillar1Desc: 'Master craftsmen with decades of artistic dedication.',
    pillar2Title: 'Archival Integrity',
    pillar2Desc: 'Premium materials, shatterproof optical acrylic, and lifetime quality guarantee.',
    estYear: 'EST. 2021',
    reviewQuote: 'The most precious keepsake on our wedding day. The calligraphy and backing exceeded all our expectations.',
    reviewAuthor: 'Fatima & Bilal',
    reviewLocation: 'Islamabad • Imperial Royal Frame',
    buttonText: 'Discover Our Story',
  },
  newReleases: {
    enabled: true,
    spacing: 'normal',
    badge: 'New Season Releases',
    title: 'Fresh in the Atelier',
    subtitle: 'Explore our latest contemporary designs and trending heirloom keepsakes.',
    viewAllText: 'Browse All New Additions',
  },
  reviews: {
    enabled: true,
    spacing: 'normal',
    badge: 'Real Customer Feedback & Screenshots',
    title: 'Loved by Over 1,200+ Couples & Families',
    subtitle: 'Genuine WhatsApp conversations, delivery pictures, and heartfelt thank-you notes from our cherished patrons across Pakistan. Tap any picture to read the full screenshot.',
  },
};

export const DEFAULT_PRODUCT_PAGE_CONFIG = {
  showLiveViewers: true,
  showRelatedProducts: true,
  relatedProductsBadge: 'Curated For You',
  relatedProductsTitle: 'Related Bespoke Keepsakes',
  showShippingTab: true,
  shippingTabTitle: 'Packaging & Shipping',
  showProofTab: true,
  proofTabTitle: 'WhatsApp Proof Approval',
};

const SECTION_METADATA = {
  hero: {
    title: 'Hero Carousel Banners Slider',
    description: 'Full-width top slider banner with background images, luxury headings, and action buttons.',
    icon: ImageIcon,
    hasContentEditor: false,
    bannerTabNotice: true,
  },
  trustPillars: {
    title: '4 Trust Badges Strip (Below Hero)',
    description: 'Clean white guarantee boxes below the hero slider (Delivery, Quality, COD, Atelier Support).',
    icon: ShieldCheck,
    hasContentEditor: true,
  },
  categories: {
    title: 'Category Showcase Cards Grid',
    description: 'Visual cards row displaying your active product categories with click-through to category pages.',
    icon: Layers,
    hasContentEditor: true,
  },
  madeForMoments: {
    title: '"Made for Moments" Signature Banner (Image 5)',
    description: 'Curated luxury dark banner with gold accents, custom headline, description, and explore button.',
    icon: Sparkles,
    hasContentEditor: true,
  },
  mostCherished: {
    title: '"Most Cherished Creations" Grid (Image 4)',
    description: 'Highest-rated bestsellers catalog showcase with prices, pictures, and quick-order links.',
    icon: Crown,
    hasContentEditor: true,
  },
  philosophy: {
    title: '"The Philosophy" Story Section (Image 1)',
    description: 'Atelier craftsmanship story, heritage pillars, and featured customer wedding review quote.',
    icon: Heart,
    hasContentEditor: true,
  },
  newReleases: {
    title: '"Fresh in the Atelier" Releases',
    description: 'Trending and newly launched creations grid with hover zooms and buy now buttons.',
    icon: Package,
    hasContentEditor: true,
  },
  reviews: {
    title: '"Loved by Over 1,200+" WhatsApp Reviews (Image 3)',
    description: 'Real WhatsApp chat screenshots carousel with customer thank-you quotes and ratings.',
    icon: MessageSquare,
    hasContentEditor: true,
  },
};

export default function HomepageBuilderTab({
  settings,
  setSettings,
  onSaveSettings,
  saving,
  onSwitchTab,
}) {
  const [activeTab, setActiveTab] = useState('homepage'); // 'homepage' | 'product_page'
  const [expandedSection, setExpandedSection] = useState(null);

  // Current order of sections
  const sectionOrder =
    settings?.homeSectionOrder && settings.homeSectionOrder.length > 0
      ? settings.homeSectionOrder
      : DEFAULT_SECTION_ORDER;

  // Section config dictionary
  const sectionConfig = {
    ...DEFAULT_SECTION_CONFIG,
    ...(settings?.homeSectionConfig || {}),
  };

  // Product page config dictionary
  const productPageConfig = {
    ...DEFAULT_PRODUCT_PAGE_CONFIG,
    ...(settings?.productPageConfig || {}),
  };

  // Reorder a section Up or Down
  const handleMoveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setSettings({
      ...settings,
      homeSectionOrder: newOrder,
    });
  };

  // Toggle a section Enabled / Disabled
  const handleToggleSection = (sectionKey) => {
    const currentEnabled = sectionConfig[sectionKey]?.enabled !== false;
    const nextConfig = {
      ...sectionConfig,
      [sectionKey]: {
        ...sectionConfig[sectionKey],
        enabled: !currentEnabled,
      },
    };
    setSettings({
      ...settings,
      homeSectionConfig: nextConfig,
    });
  };

  // Change section spacing / padding density
  const handleSetSpacing = (sectionKey, spacing) => {
    const nextConfig = {
      ...sectionConfig,
      [sectionKey]: {
        ...sectionConfig[sectionKey],
        spacing,
      },
    };
    setSettings({
      ...settings,
      homeSectionConfig: nextConfig,
    });
  };

  // Update specific text field of a section
  const handleUpdateSectionField = (sectionKey, field, value) => {
    const nextConfig = {
      ...sectionConfig,
      [sectionKey]: {
        ...sectionConfig[sectionKey],
        [field]: value,
      },
    };
    setSettings({
      ...settings,
      homeSectionConfig: nextConfig,
    });
  };

  // Update product page config field
  const handleUpdateProductPageField = (field, value) => {
    const nextConfig = {
      ...productPageConfig,
      [field]: value,
    };
    setSettings({
      ...settings,
      productPageConfig: nextConfig,
    });
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Homepage Layout &amp; Storefront Page Builder
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C59A27] text-white">
              Visual Software Engine
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Storefront ke sections ki arrangement (order up/down) tabdeel karein, kisi bhi section ko on/off (optional) karein, aur titles, subtitles, badges aur spacing apni marzi se customize karein.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition"
          >
            <span>Live Website Preview</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onSaveSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-[#C59A27] hover:bg-[#A47A1A] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Apply Layout'}</span>
          </button>
        </div>
      </div>

      {/* Builder Sub-Navigation: Homepage vs Product Page */}
      <div className="flex items-center space-x-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('homepage')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'homepage'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Homepage Sections Arrangement ({sectionOrder.length} Sections)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('product_page')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center space-x-2 ${
            activeTab === 'product_page'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Product Detail Page Layout Options</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: HOMEPAGE SECTIONS MANAGER */}
      {/* ======================================================== */}
      {activeTab === 'homepage' && (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-[#C59A27] shrink-0" />
              <span>
                <strong>Tip:</strong> Reorder karne ke liye <strong>Move Up (↑)</strong> ya <strong>Move Down (↓)</strong> dabayein. Section hide karne ke liye toggle ko untick karein. Text edit karne ke liye <strong>Edit Content</strong> par click karein.
              </span>
            </div>
          </div>

          {/* Draggable/Orderable Sections List */}
          <div className="space-y-3">
            {sectionOrder.map((sectionKey, index) => {
              const meta = SECTION_METADATA[sectionKey] || {
                title: sectionKey,
                description: 'Custom Storefront Section',
                icon: Layers,
                hasContentEditor: true,
              };
              const IconComponent = meta.icon;
              const cfg = sectionConfig[sectionKey] || DEFAULT_SECTION_CONFIG[sectionKey] || {};
              const isEnabled = cfg.enabled !== false;
              const isExpanded = expandedSection === sectionKey;
              const spacing = cfg.spacing || 'normal';

              return (
                <div
                  key={sectionKey}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isEnabled
                      ? 'border-stone-200 shadow-xs hover:border-[#C59A27]/50'
                      : 'border-stone-200/60 opacity-65 bg-stone-50/50'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Reorder position & info */}
                    <div className="flex items-start sm:items-center space-x-3.5 flex-1 min-w-0">
                      {/* Step Number Badge */}
                      <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-stone-200">
                        #{index + 1}
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isEnabled
                            ? 'bg-amber-50 text-[#A47A1A] border-amber-200'
                            : 'bg-stone-100 text-stone-400 border-stone-200'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Title & Subtitle */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="font-serif font-bold text-sm text-stone-900 truncate">
                            {meta.title}
                          </h3>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isEnabled
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-stone-100 text-stone-500 border-stone-200'
                            }`}
                          >
                            {isEnabled ? 'Active on Homepage' : 'Hidden / Optional'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                          {meta.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Controls (Move Up/Down, Spacing, Toggle, Expand) */}
                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto flex-wrap gap-y-2">
                      {/* Move Up Button */}
                      <button
                        type="button"
                        onClick={() => handleMoveSection(index, 'up')}
                        disabled={index === 0}
                        title="Move Section Up in Order"
                        className="p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>

                      {/* Move Down Button */}
                      <button
                        type="button"
                        onClick={() => handleMoveSection(index, 'down')}
                        disabled={index === sectionOrder.length - 1}
                        title="Move Section Down in Order"
                        className="p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Spacing Selector */}
                      <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-[10px] font-bold border border-stone-200">
                        {['compact', 'normal', 'spacious'].map((sp) => (
                          <button
                            key={sp}
                            type="button"
                            onClick={() => handleSetSpacing(sectionKey, sp)}
                            className={`px-2 py-1 rounded capitalize transition ${
                              spacing === sp
                                ? 'bg-white text-stone-900 shadow-2xs font-bold'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                          >
                            {sp}
                          </button>
                        ))}
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleSection(sectionKey)}
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                          isEnabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        {isEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-stone-400" />}
                        <span>{isEnabled ? 'Visible' : 'Hidden'}</span>
                      </button>

                      {/* Expand / Collapse Content Editor */}
                      {meta.hasContentEditor && (
                        <button
                          type="button"
                          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
                          className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                            isExpanded
                              ? 'bg-[#1C1917] text-white border-[#1C1917]'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          <span>Edit Text</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}

                      {/* Redirect to Banners tab for hero */}
                      {meta.bannerTabNotice && (
                        <button
                          type="button"
                          onClick={() => onSwitchTab?.('banners')}
                          className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center space-x-1 border border-stone-200"
                        >
                          <span>Manage Slides</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Section Content Editor Form */}
                  {isExpanded && meta.hasContentEditor && (
                    <div className="p-5 bg-stone-50/80 border-t border-stone-200 space-y-4 animate-in fade-in duration-200">
                      <div className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C59A27]" />
                        <span>Customize Section Text, Headings &amp; Badges:</span>
                      </div>

                      {/* SECTION: Philosophy Section (Image 1) */}
                      {sectionKey === 'philosophy' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={cfg.badge ?? DEFAULT_SECTION_CONFIG.philosophy.badge}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'badge', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. The VowCrafts Philosophy"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Main Heading</label>
                            <input
                              type="text"
                              value={cfg.title ?? DEFAULT_SECTION_CONFIG.philosophy.title}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif font-bold"
                              placeholder="e.g. Honoring Sacred Vows Through Timeless Artistry"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block font-semibold text-stone-700 mb-1">Story Paragraph</label>
                            <textarea
                              rows={2}
                              value={cfg.description ?? DEFAULT_SECTION_CONFIG.philosophy.description}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'description', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Pillar 1 Title &amp; Desc</label>
                            <input
                              type="text"
                              value={cfg.pillar1Title ?? DEFAULT_SECTION_CONFIG.philosophy.pillar1Title}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'pillar1Title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white mb-1.5"
                              placeholder="Pillar 1 Title"
                            />
                            <input
                              type="text"
                              value={cfg.pillar1Desc ?? DEFAULT_SECTION_CONFIG.philosophy.pillar1Desc}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'pillar1Desc', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white text-[11px]"
                              placeholder="Pillar 1 Description"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Pillar 2 Title &amp; Desc</label>
                            <input
                              type="text"
                              value={cfg.pillar2Title ?? DEFAULT_SECTION_CONFIG.philosophy.pillar2Title}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'pillar2Title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white mb-1.5"
                              placeholder="Pillar 2 Title"
                            />
                            <input
                              type="text"
                              value={cfg.pillar2Desc ?? DEFAULT_SECTION_CONFIG.philosophy.pillar2Desc}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'pillar2Desc', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white text-[11px]"
                              placeholder="Pillar 2 Description"
                            />
                          </div>
                          <div className="md:col-span-2 p-3 bg-stone-100 rounded-xl space-y-2">
                            <div className="font-bold text-stone-800 text-[11px]">Featured Wedding Review Card:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <input
                                type="text"
                                value={cfg.estYear ?? DEFAULT_SECTION_CONFIG.philosophy.estYear}
                                onChange={(e) => handleUpdateSectionField('philosophy', 'estYear', e.target.value)}
                                className="p-2 border border-stone-300 rounded-lg bg-white"
                                placeholder="e.g. EST. 2021"
                              />
                              <input
                                type="text"
                                value={cfg.reviewAuthor ?? DEFAULT_SECTION_CONFIG.philosophy.reviewAuthor}
                                onChange={(e) => handleUpdateSectionField('philosophy', 'reviewAuthor', e.target.value)}
                                className="p-2 border border-stone-300 rounded-lg bg-white"
                                placeholder="e.g. Fatima & Bilal"
                              />
                              <input
                                type="text"
                                value={cfg.reviewLocation ?? DEFAULT_SECTION_CONFIG.philosophy.reviewLocation}
                                onChange={(e) => handleUpdateSectionField('philosophy', 'reviewLocation', e.target.value)}
                                className="p-2 border border-stone-300 rounded-lg bg-white"
                                placeholder="e.g. Islamabad • Imperial Frame"
                              />
                            </div>
                            <textarea
                              rows={2}
                              value={cfg.reviewQuote ?? DEFAULT_SECTION_CONFIG.philosophy.reviewQuote}
                              onChange={(e) => handleUpdateSectionField('philosophy', 'reviewQuote', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white italic"
                              placeholder="Review quote text"
                            />
                          </div>
                        </div>
                      )}

                      {/* SECTION: Reviews Showcase (Image 3) */}
                      {sectionKey === 'reviews' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={cfg.badge ?? DEFAULT_SECTION_CONFIG.reviews.badge}
                              onChange={(e) => handleUpdateSectionField('reviews', 'badge', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. Real Customer Feedback & Screenshots"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Main Heading</label>
                            <input
                              type="text"
                              value={cfg.title ?? DEFAULT_SECTION_CONFIG.reviews.title}
                              onChange={(e) => handleUpdateSectionField('reviews', 'title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif font-bold"
                              placeholder="e.g. Loved by Over 1,200+ Couples & Families"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block font-semibold text-stone-700 mb-1">Subtitle / Description</label>
                            <textarea
                              rows={2}
                              value={cfg.subtitle ?? DEFAULT_SECTION_CONFIG.reviews.subtitle}
                              onChange={(e) => handleUpdateSectionField('reviews', 'subtitle', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* SECTION: Most Cherished Creations (Image 4) */}
                      {sectionKey === 'mostCherished' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={cfg.badge ?? DEFAULT_SECTION_CONFIG.mostCherished.badge}
                              onChange={(e) => handleUpdateSectionField('mostCherished', 'badge', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. Curated Collection"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Main Heading</label>
                            <input
                              type="text"
                              value={cfg.title ?? DEFAULT_SECTION_CONFIG.mostCherished.title}
                              onChange={(e) => handleUpdateSectionField('mostCherished', 'title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif font-bold"
                              placeholder="e.g. Most Cherished Creations"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={cfg.subtitle ?? DEFAULT_SECTION_CONFIG.mostCherished.subtitle}
                              onChange={(e) => handleUpdateSectionField('mostCherished', 'subtitle', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. Our highest rated and most requested pieces from the atelier."
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">View All Button Label</label>
                            <input
                              type="text"
                              value={cfg.viewAllText ?? DEFAULT_SECTION_CONFIG.mostCherished.viewAllText}
                              onChange={(e) => handleUpdateSectionField('mostCherished', 'viewAllText', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. View All Bestsellers"
                            />
                          </div>
                        </div>
                      )}

                      {/* SECTION: Made for Moments (Image 5) */}
                      {sectionKey === 'madeForMoments' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={cfg.badge ?? DEFAULT_SECTION_CONFIG.madeForMoments.badge}
                              onChange={(e) => handleUpdateSectionField('madeForMoments', 'badge', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. Curated Collection"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Main Heading</label>
                            <input
                              type="text"
                              value={cfg.title ?? DEFAULT_SECTION_CONFIG.madeForMoments.title}
                              onChange={(e) => handleUpdateSectionField('madeForMoments', 'title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif font-bold"
                              placeholder="e.g. Made for Moments"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block font-semibold text-stone-700 mb-1">Description Paragraph</label>
                            <textarea
                              rows={2}
                              value={cfg.description ?? DEFAULT_SECTION_CONFIG.madeForMoments.description}
                              onChange={(e) => handleUpdateSectionField('madeForMoments', 'description', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white italic"
                              placeholder="e.g. Curated keepsakes immortalizing your most cherished memories."
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Button Label</label>
                            <input
                              type="text"
                              value={cfg.buttonText ?? DEFAULT_SECTION_CONFIG.madeForMoments.buttonText}
                              onChange={(e) => handleUpdateSectionField('madeForMoments', 'buttonText', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. Explore Full Collection"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Button Link URL</label>
                            <input
                              type="text"
                              value={cfg.buttonLink ?? DEFAULT_SECTION_CONFIG.madeForMoments.buttonLink}
                              onChange={(e) => handleUpdateSectionField('madeForMoments', 'buttonLink', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono text-[11px]"
                              placeholder="e.g. /categories/luxury-frames"
                            />
                          </div>
                        </div>
                      )}

                      {/* SECTION: Categories */}
                      {sectionKey === 'categories' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={cfg.badge ?? DEFAULT_SECTION_CONFIG.categories.badge}
                              onChange={(e) => handleUpdateSectionField('categories', 'badge', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. Curated Atelier"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Main Heading</label>
                            <input
                              type="text"
                              value={cfg.title ?? DEFAULT_SECTION_CONFIG.categories.title}
                              onChange={(e) => handleUpdateSectionField('categories', 'title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif font-bold"
                              placeholder="e.g. Shop by Category"
                            />
                          </div>
                        </div>
                      )}

                      {/* SECTION: New Releases */}
                      {sectionKey === 'newReleases' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Badge Text</label>
                            <input
                              type="text"
                              value={cfg.badge ?? DEFAULT_SECTION_CONFIG.newReleases.badge}
                              onChange={(e) => handleUpdateSectionField('newReleases', 'badge', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. New Season Releases"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-stone-700 mb-1">Main Heading</label>
                            <input
                              type="text"
                              value={cfg.title ?? DEFAULT_SECTION_CONFIG.newReleases.title}
                              onChange={(e) => handleUpdateSectionField('newReleases', 'title', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif font-bold"
                              placeholder="e.g. Fresh in the Atelier"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block font-semibold text-stone-700 mb-1">Subtitle</label>
                            <input
                              type="text"
                              value={cfg.subtitle ?? DEFAULT_SECTION_CONFIG.newReleases.subtitle}
                              onChange={(e) => handleUpdateSectionField('newReleases', 'subtitle', e.target.value)}
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                              placeholder="e.g. Explore our latest contemporary designs."
                            />
                          </div>
                        </div>
                      )}

                      {/* SECTION: Trust Pillars */}
                      {sectionKey === 'trustPillars' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                            <label className="block font-bold text-[#A47A1A]">Pillar 1</label>
                            <input
                              type="text"
                              value={cfg.pillar1Title ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar1Title}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar1Title', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={cfg.pillar1Desc ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar1Desc}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar1Desc', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-[11px]"
                            />
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                            <label className="block font-bold text-[#A47A1A]">Pillar 2</label>
                            <input
                              type="text"
                              value={cfg.pillar2Title ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar2Title}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar2Title', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={cfg.pillar2Desc ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar2Desc}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar2Desc', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-[11px]"
                            />
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                            <label className="block font-bold text-[#A47A1A]">Pillar 3</label>
                            <input
                              type="text"
                              value={cfg.pillar3Title ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar3Title}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar3Title', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={cfg.pillar3Desc ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar3Desc}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar3Desc', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-[11px]"
                            />
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1.5">
                            <label className="block font-bold text-[#A47A1A]">Pillar 4</label>
                            <input
                              type="text"
                              value={cfg.pillar4Title ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar4Title}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar4Title', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-xs font-semibold"
                            />
                            <input
                              type="text"
                              value={cfg.pillar4Desc ?? DEFAULT_SECTION_CONFIG.trustPillars.pillar4Desc}
                              onChange={(e) => handleUpdateSectionField('trustPillars', 'pillar4Desc', e.target.value)}
                              className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-[11px]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PRODUCT DETAIL PAGE LAYOUT OPTIONS */}
      {/* ======================================================== */}
      {activeTab === 'product_page' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Product Detail Page (/products/[id]) Customizer
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Control which sections and indicators appear on product pages when a customer views an item.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Live Viewers Indicator */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-stone-900">Live Active Viewers Indicator</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Shows the green pulsing dot under price (e.g. &ldquo;24 people are viewing this right now&rdquo;) to generate social proof and urgency.
                </p>
              </div>
              <input
                type="checkbox"
                checked={productPageConfig.showLiveViewers !== false}
                onChange={(e) => handleUpdateProductPageField('showLiveViewers', e.target.checked)}
                className="w-5 h-5 rounded text-[#C59A27] accent-[#C59A27] cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Related Keepsakes Section */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-stone-900">&ldquo;Related Bespoke Keepsakes&rdquo; Section</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Displays related product cards at the bottom of the page (&ldquo;Curated For You&rdquo;).
                </p>
              </div>
              <input
                type="checkbox"
                checked={productPageConfig.showRelatedProducts !== false}
                onChange={(e) => handleUpdateProductPageField('showRelatedProducts', e.target.checked)}
                className="w-5 h-5 rounded text-[#C59A27] accent-[#C59A27] cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Packaging & Shipping Tab */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-stone-900">Packaging &amp; Shipping Tab</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Show or hide the shipping timeline and delivery protection information tab.
                </p>
              </div>
              <input
                type="checkbox"
                checked={productPageConfig.showShippingTab !== false}
                onChange={(e) => handleUpdateProductPageField('showShippingTab', e.target.checked)}
                className="w-5 h-5 rounded text-[#C59A27] accent-[#C59A27] cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* WhatsApp Digital Proof Tab */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-stone-900">WhatsApp Proof Approval Tab</div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Show or hide the guarantee tab explaining digital WhatsApp draft preview before framing.
                </p>
              </div>
              <input
                type="checkbox"
                checked={productPageConfig.showProofTab !== false}
                onChange={(e) => handleUpdateProductPageField('showProofTab', e.target.checked)}
                className="w-5 h-5 rounded text-[#C59A27] accent-[#C59A27] cursor-pointer shrink-0 mt-1"
              />
            </div>

            {/* Custom Titles */}
            <div className="md:col-span-2 p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
              <div className="font-bold text-stone-800">Customize Product Page Section Headings:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Related Section Title</label>
                  <input
                    type="text"
                    value={productPageConfig.relatedProductsTitle || 'Related Bespoke Keepsakes'}
                    onChange={(e) => handleUpdateProductPageField('relatedProductsTitle', e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Related Section Badge</label>
                  <input
                    type="text"
                    value={productPageConfig.relatedProductsBadge || 'Curated For You'}
                    onChange={(e) => handleUpdateProductPageField('relatedProductsBadge', e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Save Actions Bar */}
      <div className="sticky bottom-4 z-20 bg-[#1C1917] text-white p-4 rounded-2xl border border-[#C59A27]/40 shadow-2xl flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>All arrangements and custom text are live and ready to publish.</span>
        </div>

        <button
          type="button"
          onClick={onSaveSettings}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-2.5 bg-[#C59A27] hover:bg-[#A47A1A] text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save & Apply Storefront Layout'}</span>
        </button>
      </div>
    </div>
  );
}
