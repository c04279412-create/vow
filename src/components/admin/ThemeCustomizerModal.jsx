'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, Sliders, Type, Palette, Monitor, Save } from 'lucide-react';

export default function ThemeCustomizerModal({ currentTheme, onClose, onSaveTheme }) {
  // Theme state
  const [fontSize, setFontSize] = useState(currentTheme?.fontSize || 'normal'); // 'compact', 'normal', 'comfortable', 'large'
  const [headingFont, setHeadingFont] = useState(currentTheme?.headingFont || 'Playfair Display');
  const [bodyFont, setBodyFont] = useState(currentTheme?.bodyFont || 'Inter');
  const [primaryColor, setPrimaryColor] = useState(currentTheme?.primaryColor || '#B5936C');
  const [accentColor, setAccentColor] = useState(currentTheme?.accentColor || '#C59A27');
  const [backgroundTone, setBackgroundTone] = useState(currentTheme?.backgroundTone || '#FAF7F2');
  const [sidebarTheme, setSidebarTheme] = useState(currentTheme?.sidebarTheme || 'light');
  const [saving, setSaving] = useState(false);

  // Available Presets
  const fontSizeOptions = [
    { id: 'compact', label: 'Compact', px: '13px', desc: 'Space-saving, dense, and clean' },
    { id: 'normal', label: 'Normal (Recommended)', px: '14px', desc: 'Balanced, standard, and elegant' },
    { id: 'comfortable', label: 'Comfortable', px: '15px', desc: 'Slightly relaxed readability' },
    { id: 'large', label: 'Large', px: '16px', desc: 'Prominent, high-visibility scale' },
  ];

  const headingFontOptions = [
    { name: 'Playfair Display', category: 'Luxury Serif', sample: 'Eternal Vows & Bespoke Frames' },
    { name: 'Cinzel', category: 'Classical Regal Serif', sample: 'Imperial Royal Artisan Editions' },
    { name: 'Cormorant Garamond', category: 'Artisan Fine Serif', sample: 'Handcrafted Heritage Keepsakes' },
    { name: 'Outfit', category: 'Modern Geometric Sans', sample: 'Contemporary Luxury Keepsakes' },
    { name: 'Plus Jakarta Sans', category: 'Modern Clean Sans', sample: 'Next-Generation Atelier Studio' },
  ];

  const bodyFontOptions = [
    { name: 'Inter', category: 'Neutral Crisp (Default)', sample: 'Designed for clean readability and balanced proportions.' },
    { name: 'Plus Jakarta Sans', category: 'Refined Modern', sample: 'Contemporary aesthetic with humanist curves.' },
    { name: 'Roboto', category: 'Standard Modern', sample: 'Utilitarian precision for administrative and customer data.' },
    { name: 'Outfit', category: 'Geometric Sans', sample: 'Warm geometric curves with modern elegance.' },
  ];

  const primaryColorPresets = [
    { name: 'Atelier Muted Gold', hex: '#B5936C' },
    { name: 'Imperial 24K Gold', hex: '#C59A27' },
    { name: 'Emerald Heritage', hex: '#0F5132' },
    { name: 'Royal Sapphire Navy', hex: '#1E3A8A' },
    { name: 'Burgundy Rose', hex: '#651C32' },
    { name: 'Obsidian Noir', hex: '#1C1917' },
  ];

  const backgroundTonePresets = [
    { name: 'Atelier Cream', hex: '#FAF7F2' },
    { name: 'Pure Snow White', hex: '#FFFFFF' },
    { name: 'Slate Mist', hex: '#F8FAFC' },
    { name: 'Warm Sand', hex: '#F5F0EB' },
  ];

  // Apply live preview to root document variables
  useEffect(() => {
    const root = document.documentElement;
    // Font size scaling
    let sizeScale = '14px';
    if (fontSize === 'compact') sizeScale = '13px';
    if (fontSize === 'normal') sizeScale = '14px';
    if (fontSize === 'comfortable') sizeScale = '15px';
    if (fontSize === 'large') sizeScale = '16px';

    root.style.setProperty('--app-base-font-size', sizeScale);
    root.style.setProperty('--color-primary', primaryColor);
    root.style.setProperty('--color-accent', accentColor);
    root.style.setProperty('--bg-creme', backgroundTone);
  }, [fontSize, primaryColor, accentColor, backgroundTone]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const themeConfig = {
      fontSize,
      headingFont,
      bodyFont,
      primaryColor,
      accentColor,
      backgroundTone,
      sidebarTheme,
    };

    // Store in localStorage for instant retrieval on page loads
    if (typeof window !== 'undefined') {
      localStorage.setItem('vowcrafts_theme', JSON.stringify(themeConfig));
    }

    await onSaveTheme(themeConfig);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-7 py-5 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-[#E3C677]" />
            <div>
              <h3 className="font-serif font-bold text-base">Theme, Font Size & Color Customizer</h3>
              <p className="text-xs text-stone-300">
                Customize typography scale, fonts, and color combinations for Frontend & Backend.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customizer Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 text-xs flex-1 bg-[#FAF7F2]">
          {/* SECTION 1: Font Size Scale (Compact / Normal / Large) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block font-bold text-stone-900 text-sm">
                  1. Global Font Size Scale
                </label>
                <p className="text-stone-500 text-[11px]">
                  Adjust typography sizing across the admin console and storefront to your preferred scale.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                Current: {fontSize.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {fontSizeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontSize(opt.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between space-y-1.5 ${
                    fontSize === opt.id
                      ? 'border-[#B5936C] bg-amber-50/60 ring-2 ring-[#B5936C]/40 text-stone-900 shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/70 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-xs">{opt.label}</span>
                    <span className="text-[10px] font-mono text-stone-400">{opt.px}</span>
                  </div>
                  <p className="text-[10px] text-stone-500 leading-tight">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: Typography Families (Headings & Body) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <label className="block font-bold text-stone-900 text-sm">
                2. Font Families (Heading & Body)
              </label>
              <p className="text-stone-500 text-[11px]">
                Choose distinctive serif or modern sans typography for titles and paragraphs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Heading Font */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5 text-xs">
                  Heading / Title Font
                </label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-medium focus:ring-1 focus:ring-[#B5936C]"
                >
                  {headingFontOptions.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-2 bg-stone-50 rounded-lg border border-stone-200 text-stone-800 text-xs truncate">
                  Preview: <span style={{ fontFamily: headingFont }} className="font-bold">VowCrafts Atelier Studio</span>
                </div>
              </div>

              {/* Body Font */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5 text-xs">
                  Body / Text Font
                </label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-medium focus:ring-1 focus:ring-[#B5936C]"
                >
                  {bodyFontOptions.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name} ({f.category})
                    </option>
                  ))}
                </select>
                <div className="mt-2 p-2 bg-stone-50 rounded-lg border border-stone-200 text-stone-600 text-xs truncate">
                  Preview: <span style={{ fontFamily: bodyFont }}>Clean, comfortable and easily readable interface text.</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Brand Colors & Background Tone */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <label className="block font-bold text-stone-900 text-sm">
                3. Color Palette & Background Tone
              </label>
              <p className="text-stone-500 text-[11px]">
                Customize the primary action colors and luxury canvas backgrounds.
              </p>
            </div>

            {/* Primary Brand Color */}
            <div className="space-y-2">
              <label className="block font-semibold text-stone-700 text-xs">
                Primary Brand Color (Buttons & Active Accents)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {primaryColorPresets.map((preset) => (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setPrimaryColor(preset.hex)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition ${
                      primaryColor === preset.hex
                        ? 'border-stone-800 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: preset.hex }}></span>
                    <span>{preset.name}</span>
                  </button>
                ))}
                {/* Custom Color Input */}
                <div className="flex items-center space-x-1.5 pl-2 border-l border-stone-200">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0.5"
                    title="Custom Primary Color"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 p-1 border border-stone-300 rounded text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Background Tone Presets */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block font-semibold text-stone-700 text-xs">
                App Canvas Background Tone
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {backgroundTonePresets.map((bg) => (
                  <button
                    key={bg.hex}
                    type="button"
                    onClick={() => setBackgroundTone(bg.hex)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1.5 transition ${
                      backgroundTone === bg.hex
                        ? 'border-stone-800 bg-stone-900 text-white shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: bg.hex }}></span>
                    <span>{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Theme (Light Studio vs Dark Obsidian) */}
            <div className="pt-2 border-t border-stone-100">
              <label className="block font-semibold text-stone-700 text-xs mb-2">
                Admin Console Sidebar Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarTheme('light')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                    sidebarTheme === 'light'
                      ? 'border-[#B5936C] bg-amber-50/70 text-stone-900 ring-2 ring-[#B5936C]/30'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  ☀️ Light Studio (Matches Dashboard Screenshot)
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTheme('dark')}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                    sidebarTheme === 'dark'
                      ? 'border-stone-900 bg-stone-900 text-white ring-2 ring-stone-700'
                      : 'border-stone-200 bg-white text-stone-600'
                  }`}
                >
                  🌙 Dark Obsidian (Classic Contrast)
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div
            className="p-4 rounded-xl border border-stone-300 shadow-xs space-y-2"
            style={{ backgroundColor: backgroundTone }}
          >
            <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Live Theme Preview:
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 style={{ fontFamily: headingFont }} className="font-bold text-stone-900 text-sm">
                  Royal Nikkah Nama Frame
                </h4>
                <p style={{ fontFamily: bodyFont }} className="text-stone-600 text-xs">
                  Handcrafted gold foil with archival glass protection.
                </p>
              </div>
              <button
                type="button"
                style={{ backgroundColor: primaryColor }}
                className="px-3.5 py-1.5 text-white rounded-lg font-bold text-xs shadow-xs"
              >
                Sample Action
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-bold text-stone-600 hover:text-stone-900 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-[#B5936C] hover:bg-[#A3825B] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Applying...' : 'Apply & Save Theme'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
