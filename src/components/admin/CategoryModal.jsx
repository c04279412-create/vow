'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  Sparkles,
  Layers,
  Package,
  Search,
  Check,
  ArrowRight,
  Copy,
} from 'lucide-react';

export default function CategoryModal({
  category,
  allCategories = [],
  allProducts = [],
  onClose,
  onSave,
}) {
  const isEditing = Boolean(category && (category.id || category._id));

  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || '');
  const [subcategories, setSubcategories] = useState(
    category?.subcategories ? category.subcategories.map((s) => ({ ...s })) : []
  );
  const [newSubName, setNewSubName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Subcategory import from another category
  const [selectedImportCategory, setSelectedImportCategory] = useState('');

  // Products assignment state: map of productId -> { selected: boolean, subcategory: string, mode: 'additional' | 'primary' }
  const [assignedProductsMap, setAssignedProductsMap] = useState({});
  const [productSearch, setProductSearch] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'products'

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setImageUrl(category.imageUrl || '');
      setSubcategories(category.subcategories ? category.subcategories.map((s) => ({ ...s })) : []);

      // Pre-populate products already in this category
      const initialMap = {};
      if (allProducts && allProducts.length > 0) {
        allProducts.forEach((p) => {
          const isPrimary = p.category?.toLowerCase() === category.name?.toLowerCase();
          const isAdditional =
            Array.isArray(p.additionalCategories) &&
            p.additionalCategories.some((ac) => ac?.toLowerCase() === category.name?.toLowerCase());

          if (isPrimary || isAdditional) {
            initialMap[p.id || p._id] = {
              selected: true,
              subcategory: p.subcategory || '',
              mode: isPrimary ? 'primary' : 'additional',
            };
          }
        });
      }
      setAssignedProductsMap(initialMap);
      setActiveTab(category.initialTab || 'details');
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setSubcategories([]);
      setAssignedProductsMap({});
      setActiveTab('details');
    }
  }, [category, allProducts]);

  // Categories available for subcategory importing (excluding this category)
  const otherCategories = useMemo(() => {
    return allCategories.filter(
      (c) =>
        c.name &&
        c.subcategories &&
        c.subcategories.length > 0 &&
        (!category || (c.id !== category.id && c.name !== category.name))
    );
  }, [allCategories, category]);

  const selectedImportCatObj = useMemo(() => {
    return otherCategories.find((c) => c.name === selectedImportCategory || c.id === selectedImportCategory);
  }, [otherCategories, selectedImportCategory]);

  // Handle Image Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert(`Error uploading image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Add new subcategory to list
  const handleAddSubcategory = () => {
    if (!newSubName.trim()) return;
    const slug = newSubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (subcategories.some((s) => s.name.toLowerCase() === newSubName.trim().toLowerCase())) {
      alert('This subcategory already exists.');
      return;
    }
    setSubcategories([
      ...subcategories,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: newSubName.trim(),
        slug,
      },
    ]);
    setNewSubName('');
  };

  // Import one subcategory from another category
  const handleImportSingleSub = (sub) => {
    if (subcategories.some((s) => s.name.toLowerCase() === sub.name.toLowerCase())) return;
    setSubcategories([
      ...subcategories,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: sub.name,
        slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
    ]);
  };

  // Import all subcategories from chosen category
  const handleImportAllSubs = () => {
    if (!selectedImportCatObj?.subcategories) return;
    const toAdd = [];
    selectedImportCatObj.subcategories.forEach((sub) => {
      if (!subcategories.some((s) => s.name.toLowerCase() === sub.name.toLowerCase())) {
        toAdd.push({
          id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: sub.name,
          slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        });
      }
    });
    setSubcategories([...subcategories, ...toAdd]);
  };

  // Remove subcategory
  const handleRemoveSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  // Edit subcategory name inline
  const handleEditSubcategory = (index, newName) => {
    const updated = [...subcategories];
    updated[index].name = newName;
    updated[index].slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSubcategories(updated);
  };

  // Toggle product assignment
  const handleToggleProduct = (product) => {
    const pId = product.id || product._id;
    setAssignedProductsMap((prev) => {
      const next = { ...prev };
      if (next[pId]?.selected) {
        delete next[pId];
      } else {
        next[pId] = {
          selected: true,
          subcategory: subcategories[0]?.name || '',
          mode: 'additional', // Default to multi-category so original stays intact
        };
      }
      return next;
    });
  };

  const handleUpdateProductSubcategory = (productId, subName) => {
    setAssignedProductsMap((prev) => {
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          subcategory: subName,
        },
      };
    });
  };

  const handleUpdateProductMode = (productId, mode) => {
    setAssignedProductsMap((prev) => {
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          mode,
        },
      };
    });
  };

  // Filtered products list for assignment
  const filteredProducts = useMemo(() => {
    if (!allProducts || !allProducts.length) return [];
    if (!productSearch.trim()) return allProducts;
    const q = productSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  const selectedProductsCount = useMemo(() => {
    return Object.values(assignedProductsMap).filter((item) => item.selected).length;
  }, [assignedProductsMap]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a Category Title');
      return;
    }

    setSaving(true);
    const slug =
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ||
      category?.slug ||
      'category';

    const payload = {
      name: name.trim(),
      slug,
      description: description.trim(),
      imageUrl:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
      subcategories,
    };

    // Prepare product assignment updates
    const productUpdates = Object.entries(assignedProductsMap)
      .filter(([_, info]) => info.selected)
      .map(([prodId, info]) => ({
        productId: prodId,
        categoryName: name.trim(),
        subcategoryName: info.subcategory || '',
        mode: info.mode || 'additional', // 'primary' or 'additional'
      }));

    await onSave(isEditing ? category.id || category._id : null, payload, productUpdates);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-[#E3C677]" />
            <div>
              <h3 className="font-serif font-bold text-base">
                {isEditing ? `Edit Category: ${category.name}` : 'Create New Category & Sub-categories'}
              </h3>
              <p className="text-[11px] text-stone-400">
                Organize collections, import existing subcategories, and link products.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Category Info & Subs vs Product Linking */}
        <div className="flex items-center border-b border-stone-200 bg-stone-100 px-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'details'
                ? 'border-[#C59A27] text-stone-900 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C59A27]" />
            <span>Category Details & Sub-Categories</span>
            <span className="ml-1 px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded-full text-[10px] font-mono">
              {subcategories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'products'
                ? 'border-[#C59A27] text-stone-900 bg-white rounded-t-lg'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#C59A27]" />
            <span>Link Existing Products</span>
            {selectedProductsCount > 0 && (
              <span className="ml-1 px-2 py-0.2 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono font-bold">
                {selectedProductsCount}
              </span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1 bg-[#FAF7F2]">
          {activeTab === 'details' ? (
            <>
              {/* 1. Category Name & Description */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-xs">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Category Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. LED Frames, Customized Frames, Wedding Keepsakes"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-sm font-semibold focus:ring-1 focus:ring-[#C59A27] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Category Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description displayed on category catalog pages..."
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:ring-1 focus:ring-[#C59A27] focus:bg-white"
                  />
                </div>
              </div>

              {/* 2. Category Picture Upload */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-xs">
                <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                  Category Picture (Displayed alongside category title on storefront)
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#C59A27]/40 overflow-hidden bg-stone-100 flex items-center justify-center shrink-0 relative group">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2 text-stone-400 text-[10px]">
                        <ImageIcon className="w-6 h-6 mx-auto mb-1 text-stone-300" />
                        <span>No Image</span>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                        Uploading...
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg font-bold flex items-center space-x-1.5 transition text-xs shadow-xs">
                        <Upload className="w-3.5 h-3.5 text-[#E3C677]" />
                        <span>Upload Picture</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="text-stone-500 hover:text-rose-600 p-1.5"
                          title="Clear image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-500 pt-1">
                      {imageUrl ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Picture uploaded and attached</span>
                        </span>
                      ) : (
                        <span className="text-stone-400">Click &ldquo;Upload Picture&rdquo; to select a photo from your computer.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Sub-categories Section with Quick-Import from other categories */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                      Sub-Categories ({subcategories.length})
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Customers can filter products by these subcategories in header navigation.
                    </p>
                  </div>
                </div>

                {/* FEATURE: Quick Import from existing categories (e.g. Customized Frame) */}
                {otherCategories.length > 0 && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 flex items-center gap-1.5 text-[11px]">
                        <Copy className="w-3.5 h-3.5 text-[#8C6D42]" />
                        <span>Add Sub-Categories from existing categories:</span>
                      </span>
                      <span className="text-[10px] text-amber-800 font-medium">Click chip to add</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={selectedImportCategory}
                        onChange={(e) => setSelectedImportCategory(e.target.value)}
                        className="p-1.5 border border-amber-300 rounded-lg bg-white text-xs font-semibold text-stone-800"
                      >
                        <option value="">Choose category to copy from...</option>
                        {otherCategories.map((c) => (
                          <option key={c.id || c.name} value={c.name}>
                            {c.name} ({c.subcategories.length} subs)
                          </option>
                        ))}
                      </select>

                      {selectedImportCatObj && (
                        <button
                          type="button"
                          onClick={handleImportAllSubs}
                          className="px-2.5 py-1.5 bg-[#8C6D42] hover:bg-stone-900 text-white rounded-lg text-[11px] font-bold shadow-2xs transition"
                        >
                          + Add All ({selectedImportCatObj.subcategories.length})
                        </button>
                      )}
                    </div>

                    {selectedImportCatObj?.subcategories?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedImportCatObj.subcategories.map((sub) => {
                          const alreadyAdded = subcategories.some(
                            (s) => s.name.toLowerCase() === sub.name.toLowerCase()
                          );
                          return (
                            <button
                              key={sub.name}
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => handleImportSingleSub(sub)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 border transition ${
                                alreadyAdded
                                  ? 'bg-stone-200/80 text-stone-500 border-stone-300 cursor-not-allowed'
                                  : 'bg-white hover:bg-amber-100 text-stone-800 border-amber-300 hover:border-amber-400 cursor-pointer shadow-2xs'
                              }`}
                            >
                              <span>{alreadyAdded ? '✓' : '+'}</span>
                              <span>{sub.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* List of current subcategories */}
                <div className="space-y-2">
                  {subcategories.map((sub, idx) => (
                    <div
                      key={sub.id || idx}
                      className="flex items-center space-x-2 p-2 bg-stone-50 rounded-lg border border-stone-200"
                    >
                      <span className="font-mono text-stone-400 text-[10px] w-6">#{idx + 1}</span>
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => handleEditSubcategory(idx, e.target.value)}
                        className="flex-1 p-1.5 border border-stone-300 rounded bg-white text-xs font-semibold focus:ring-1 focus:ring-[#C59A27]"
                        placeholder="Subcategory Name"
                      />
                      <span className="text-[10px] font-mono text-stone-400 px-2 truncate max-w-[120px]">
                        /{sub.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubcategory(idx)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                        title="Remove subcategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {subcategories.length === 0 && (
                    <p className="text-[11px] text-stone-400 italic py-1">
                      No sub-categories yet. Add custom names below or copy from existing categories above.
                    </p>
                  )}
                </div>

                {/* Add new subcategory input */}
                <div className="flex items-center space-x-2 pt-2 border-t border-stone-100">
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubcategory();
                      }
                    }}
                    placeholder="Type new subcategory name (e.g. LED Frames, Birthday Frames)..."
                    className="flex-1 p-2 border border-stone-300 rounded-lg bg-stone-50 text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="px-3.5 py-2 bg-[#C59A27] hover:bg-[#A47A1A] text-white rounded-lg font-bold flex items-center space-x-1 transition text-xs shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sub</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: LINK EXISTING PRODUCTS TO THIS CATEGORY */
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3.5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#C59A27]" />
                    <span>Link Products to &ldquo;{name || 'This Category'}&rdquo;</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Check existing products from other collections to also include them in this category.
                  </p>
                </div>
                <div className="text-xs font-bold text-stone-800 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                  {selectedProductsCount} Selected
                </div>
              </div>

              {/* Product search */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title or category..."
                  className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg bg-stone-50 text-xs font-medium focus:bg-white focus:border-[#C59A27]"
                />
              </div>

              {/* Products list */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100 border border-stone-200 rounded-xl bg-stone-50/50 p-2 space-y-1">
                {filteredProducts.map((p) => {
                  const pId = p.id || p._id;
                  const assignInfo = assignedProductsMap[pId];
                  const isChecked = Boolean(assignInfo?.selected);

                  return (
                    <div
                      key={pId}
                      className={`p-2.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isChecked
                          ? 'bg-amber-50/50 border-[#C59A27]/60 shadow-2xs'
                          : 'bg-white border-stone-200/80 hover:border-stone-300'
                      }`}
                    >
                      {/* Product Thumbnail & Title */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProduct(p)}
                          className="w-4 h-4 rounded text-[#C59A27] focus:ring-[#C59A27] shrink-0 cursor-pointer"
                        />
                        <img
                          src={p.images?.[0] || '/images/hero_banner.jpg'}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-900 truncate text-xs">{p.name}</div>
                          <div className="text-[10px] text-stone-500 mt-0.5">
                            Category: <span className="font-bold text-stone-700">{p.category}</span>
                            {p.subcategory ? ` • ${p.subcategory}` : ''}
                          </div>
                          <div className="font-mono text-[10px] text-[#8C6D42] font-bold">
                            PKR {Number(p.salePrice || p.basePrice || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Subcategory & Placement options if checked */}
                      {isChecked && (
                        <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
                          {subcategories.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-semibold text-stone-500">Sub:</span>
                              <select
                                value={assignInfo?.subcategory || ''}
                                onChange={(e) => handleUpdateProductSubcategory(pId, e.target.value)}
                                className="p-1.5 border border-stone-300 rounded-lg bg-white text-[11px] font-medium"
                              >
                                <option value="">General (No sub)</option>
                                {subcategories.map((sub) => (
                                  <option key={sub.name} value={sub.name}>
                                    {sub.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <select
                            value={assignInfo?.mode || 'additional'}
                            onChange={(e) => handleUpdateProductMode(pId, e.target.value)}
                            className="p-1.5 border border-stone-300 rounded-lg bg-white text-[10px] font-semibold text-stone-700"
                            title="Choose how product is linked"
                          >
                            <option value="additional">Multi-Category (Keep in both)</option>
                            <option value="primary">Move as Primary Category</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="p-6 text-center text-stone-400 text-xs">
                    No products matched your search.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-200 shrink-0">
            <div className="text-[11px] text-stone-500">
              {activeTab === 'details' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="font-bold text-[#8C6D42] hover:underline flex items-center gap-1"
                >
                  <span>Link products to this category</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="font-semibold text-stone-600">
                  {selectedProductsCount} products will be updated upon saving.
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold text-stone-600 hover:text-stone-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-[#C59A27] hover:bg-[#A47A1A] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : isEditing ? 'Update Category' : 'Save Category'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
