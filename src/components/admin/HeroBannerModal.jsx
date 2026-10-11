'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Royal Atelier Banner', url: '/images/hero_banner.jpg' },
  { label: 'Gold Foil Nikkah Frame', url: '/images/nikkah_gold.jpg' },
  { label: '3D Floral Shadow Box', url: '/images/floral_box.jpg' },
  { label: 'Mirror & Acrylic Board', url: '/images/acrylic_welcome.jpg' },
  { label: 'Velvet Nikkah Booklet', url: '/images/nikkah_booklet.jpg' },
];

export default function HeroBannerModal({ banner, onClose, onSave }) {
  const isEditing = Boolean(banner && (banner.id || banner._id));

  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [badgeText, setBadgeText] = useState(banner?.badgeText || 'Artisanal Luxury Edition');
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '/images/hero_banner.jpg');
  const [buttonText, setButtonText] = useState(banner?.buttonText || 'Explore All Collections');
  const [buttonLink, setButtonLink] = useState(banner?.buttonLink || '/categories/luxury-frames');
  const [order, setOrder] = useState(banner?.order ?? 1);
  const [active, setActive] = useState(banner?.active !== undefined ? banner.active : true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title || '');
      setSubtitle(banner.subtitle || '');
      setBadgeText(banner.badgeText || 'Artisanal Luxury Edition');
      setImageUrl(banner.imageUrl || '/images/hero_banner.jpg');
      setButtonText(banner.buttonText || 'Explore All Collections');
      setButtonLink(banner.buttonLink || '/categories/luxury-frames');
      setOrder(banner.order ?? 1);
      setActive(banner.active !== undefined ? banner.active : true);
    }
  }, [banner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      badgeText: badgeText.trim(),
      imageUrl: imageUrl.trim() || '/images/hero_banner.jpg',
      buttonText: buttonText.trim(),
      buttonLink: buttonLink.trim() || '/',
      order: Number(order) || 1,
      active,
    };

    await onSave(isEditing ? banner.id || banner._id : null, payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#C59A27]/40 flex items-center justify-center text-[#8C6D42]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {isEditing ? 'Edit Hero Banner' : 'Create New Hero Banner'}
              </h2>
              <p className="text-[11px] text-stone-500">
                Configure headline, description, background image, and call-to-action button
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Main Headline / Title */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
              Banner Headline / Main Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Art of Thoughtful Gifting"
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#C59A27] focus:ring-1 focus:ring-[#C59A27] bg-white text-stone-900 font-serif text-sm"
            />
          </div>

          {/* Subtitle / Description */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
              Banner Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Handcrafted matrimonial keepsakes, bespoke gold-leaf frames, and customized wedding gifts..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#C59A27] focus:ring-1 focus:ring-[#C59A27] bg-white text-stone-900 text-xs leading-relaxed"
            />
          </div>

          {/* Badge Tag & Slide Sequence Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
                Top Eyebrow Badge Tag
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="e.g. Artisanal Luxury Edition"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#C59A27] bg-white text-stone-900 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
                Slide Display Sequence (#)
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#C59A27] bg-white text-stone-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* Image URL & Quick Presets */}
          <div>
            <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
              Banner Image URL <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/images/hero_banner.jpg or https://..."
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#C59A27] bg-white text-stone-900 font-mono text-xs"
              />
            </div>

            {/* Quick Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-stone-400 font-serif">Quick select:</span>
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`px-2 py-0.5 rounded-md text-[10px] border transition cursor-pointer ${
                    imageUrl === preset.url
                      ? 'bg-[#1C1917] text-[#E3C677] border-stone-900'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Live Image Preview */}
            {imageUrl && (
              <div className="mt-2.5 relative aspect-[16/7] rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={imageUrl}
                  alt="Preview"
                  onError={(e) => {
                    e.target.src = '/images/hero_banner.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                  <span className="text-[10px] font-mono text-[#E3C677] uppercase tracking-wider">
                    {badgeText || 'Artisanal Luxury Edition'}
                  </span>
                  <div className="font-serif font-bold text-base line-clamp-1">
                    {title || 'Headline Preview'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Button Text & Button Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
                Primary Button Label
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Explore All Collections"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#C59A27] bg-white text-stone-900 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-serif font-bold text-stone-900 mb-1">
                Primary Button Link Target
              </label>
              <input
                type="text"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="e.g. /categories/luxury-frames"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#C59A27] bg-white text-stone-900 font-mono text-xs"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div>
              <div className="font-serif font-bold text-xs text-stone-900">
                Active &amp; Visible on Storefront
              </div>
              <p className="text-[11px] text-stone-500">
                Display this banner in the homepage hero carousel slider
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1C1917]" />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-serif font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-serif font-bold text-xs transition shadow cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
