'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  Sparkles,
  Sliders,
  Check,
  CheckSquare,
  Square,
  Palette,
  Maximize2,
  FileText,
  Camera,
} from 'lucide-react';

export default function ProductModal({ product, categories, onClose, onSave }) {
  const isEditing = Boolean(product && (product.id || product._id));

  // Basic Information
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [isSlugCustomized, setIsSlugCustomized] = useState(Boolean(product?.slug));
  const [category, setCategory] = useState(product?.category || categories[0]?.name || 'Wedding Frames');
  const [subcategory, setSubcategory] = useState(product?.subcategory || '');
  const [additionalCategories, setAdditionalCategories] = useState(
    Array.isArray(product?.additionalCategories) ? product.additionalCategories : []
  );
  const [showAddSubInput, setShowAddSubInput] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [basePrice, setBasePrice] = useState(product?.basePrice || 4500);
  const [salePrice, setSalePrice] = useState(product?.salePrice || '');
  const [deliveryCharges, setDeliveryCharges] = useState(
    product?.deliveryCharges !== undefined ? product.deliveryCharges : 0
  );
  const [minDeliveryDays, setMinDeliveryDays] = useState(
    product?.minDeliveryDays !== undefined ? Number(product.minDeliveryDays) : 4
  );
  const [maxDeliveryDays, setMaxDeliveryDays] = useState(
    product?.maxDeliveryDays !== undefined ? Number(product.maxDeliveryDays) : 10
  );
  const [stock, setStock] = useState(product?.stock !== undefined ? product?.stock : 15);
  const [simulatedViewers, setSimulatedViewers] = useState(
    product?.simulatedViewers !== undefined ? product?.simulatedViewers : 18
  );
  const [description, setDescription] = useState(product?.description || '');
  const [details, setDetails] = useState(product?.details || product?.description || '');
  const [isBestSeller, setIsBestSeller] = useState(Boolean(product?.isBestSeller));
  const [isNewArrival, setIsNewArrival] = useState(Boolean(product?.isNewArrival));
  const [isTrending, setIsTrending] = useState(Boolean(product?.isTrending));

  // Auto-generate clean SEO slug when typing product name (unless manually customized)
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugCustomized || !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleSlugChange = (e) => {
    setIsSlugCustomized(true);
    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, ''));
  };

  // Product Images Gallery (Shown on storefront)
  const [images, setImages] = useState(
    product?.images && product.images.length > 0
      ? [...product.images]
      : ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80']
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // ==========================================
  // CUSTOMIZATION OPTIONS SECTION
  // ==========================================
  const initialAllowText = product?.allowTextCustomization !== undefined
    ? Boolean(product.allowTextCustomization)
    : (product?.productType === 'TYPE_B' || (product?.customFields && product.customFields.length > 0));

  const initialAllowImages = product?.allowPhotoUpload !== undefined
    ? Boolean(product.allowPhotoUpload)
    : (product?.productType === 'TYPE_C' || Boolean(product?.imageUploadConfig?.enabled));

  const initialHasSizes = product?.hasSizeVariations !== undefined
    ? Boolean(product.hasSizeVariations)
    : Boolean(product?.sizes && product.sizes.length > 0);

  const [allowTextCustomization, setAllowTextCustomization] = useState(initialAllowText);
  const [textFields, setTextFields] = useState(
    product?.customFields && product.customFields.length > 0
      ? product.customFields.map((f) => ({ ...f }))
      : [
          { fieldId: 'bride_name', label: 'Bride Name', placeholder: 'e.g. Ayesha Noor', required: true, type: 'text' },
          { fieldId: 'groom_name', label: 'Groom Name', placeholder: 'e.g. Hamza Tariq', required: true, type: 'text' },
          { fieldId: 'wedding_date', label: 'Wedding / Nikkah Date', placeholder: 'DD/MM/YYYY', required: true, type: 'date' },
          { fieldId: 'special_instructions', label: 'Special Instructions', placeholder: 'Calligraphy notes or gold accents...', required: false, type: 'textarea' },
        ]
  );

  const [allowPhotoUpload, setAllowPhotoUpload] = useState(initialAllowImages);
  const [minPhotos, setMinPhotos] = useState(product?.imageUploadConfig?.minImages || 1);
  const [maxPhotos, setMaxPhotos] = useState(product?.imageUploadConfig?.maxImages || 50);
  const [photoInstructions, setPhotoInstructions] = useState(
    product?.imageUploadConfig?.instructions || 'Upload 1 to 50 photos for your bespoke frame collage composition.'
  );

  // Attributes: Sizes & Frame Colors
  const [sizeSectionTitle, setSizeSectionTitle] = useState(
    product?.sizeSectionTitle || 'Frame Size Variations'
  );
  const [colorSectionTitle, setColorSectionTitle] = useState(
    product?.colorSectionTitle || 'Frame Colors & Finishes'
  );

  // Size Variations Toggle & Direct Pricing
  const [hasSizeVariations, setHasSizeVariations] = useState(initialHasSizes);

  const [sizes, setSizes] = useState(() => {
    if (product?.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      return product.sizes.map((s) => ({
        name: s.name || '',
        price: s.price !== undefined ? Number(s.price) : (Number(product.basePrice) || 4500) + (Number(s.priceAdjustment) || 0),
        salePrice: s.salePrice !== undefined && s.salePrice !== null && s.salePrice !== ''
          ? Number(s.salePrice)
          : (product.salePrice ? Number(product.salePrice) + (Number(s.priceAdjustment) || 0) : ''),
      }));
    }
    return [
      { name: '12 x 18 inches', price: Number(product?.basePrice) || 4500, salePrice: product?.salePrice ? Number(product.salePrice) : '' },
      { name: '16 x 24 inches', price: (Number(product?.basePrice) || 4500) + 1200, salePrice: product?.salePrice ? Number(product.salePrice) + 1200 : '' },
    ];
  });

  const [frameColors, setFrameColors] = useState(
    product?.frameColors && product.frameColors.length > 0
      ? product.frameColors.map((c) => ({ ...c }))
      : [
          { name: 'Imperial Brushed Gold', hex: '#D4AF37', priceAdjustment: 0 },
          { name: 'Romantic Rose Gold', hex: '#B76E79', priceAdjustment: 300 },
          { name: 'Classic Matte Black', hex: '#1C1917', priceAdjustment: 0 },
        ]
  );

  // Tabs & Additional Information Configuration (Description, Shipping, Return)
  const [showShippingTab, setShowShippingTab] = useState(
    product?.tabsConfig?.showShippingTab !== undefined ? Boolean(product?.tabsConfig?.showShippingTab) : true
  );
  const [shippingText, setShippingText] = useState(
    product?.tabsConfig?.shippingText ||
      'Standard delivery takes 3 to 5 working days across Pakistan. Secure protective packaging ensures your order arrives safe and undamaged.'
  );

  const [showReturnTab, setShowReturnTab] = useState(
    product?.tabsConfig?.showReturnTab !== undefined ? Boolean(product?.tabsConfig?.showReturnTab) : true
  );
  const [returnText, setReturnText] = useState(
    product?.tabsConfig?.returnText ||
      'Every customized order is digitally reviewed on WhatsApp before dispatch. In the rare case of transit damage, replacement is provided promptly.'
  );

  const [saving, setSaving] = useState(false);

  // Available subcategories for chosen category
  const selectedCatObj = categories.find((c) => c.name === category);
  const availableSubcategories = selectedCatObj?.subcategories || [];

  // Quick Add Subcategory directly from product modal
  const handleQuickAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCatObj) return;
    setAddingSubcategory(true);
    const subSlug = newSubcategoryName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newSubObj = { id: `sub-${Date.now()}`, name: newSubcategoryName.trim(), slug: subSlug };
    const updatedSubs = [...(selectedCatObj.subcategories || []), newSubObj];

    try {
      await fetch(`/api/categories/${selectedCatObj.id || selectedCatObj._id || selectedCatObj.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selectedCatObj, subcategories: updatedSubs }),
      });
      selectedCatObj.subcategories = updatedSubs;
      setSubcategory(newSubObj.name);
      setNewSubcategoryName('');
      setShowAddSubInput(false);
    } catch (err) {
      console.error('Error adding subcategory:', err);
    } finally {
      setAddingSubcategory(false);
    }
  };

  // Handle uploading product images via /api/upload
  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImages((prev) => [...prev, data.url]);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert(`Error uploading file: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    if (images.length === 1) {
      alert('Product must have at least one image.');
      return;
    }
    setImages(images.filter((_, i) => i !== index));
  };

  // Dynamic Text Fields handlers
  const handleAddCustomField = () => {
    const newId = `field_${Date.now()}`;
    setTextFields([
      ...textFields,
      {
        fieldId: newId,
        label: 'Custom Field Name',
        placeholder: 'Enter details...',
        required: true,
        type: 'text',
      },
    ]);
  };

  const handleUpdateCustomField = (index, key, val) => {
    const updated = [...textFields];
    updated[index] = { ...updated[index], [key]: val };
    if (key === 'label' && (!updated[index].fieldId || updated[index].fieldId.startsWith('field_'))) {
      updated[index].fieldId = val.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    }
    setTextFields(updated);
  };

  const handleRemoveCustomField = (index) => {
    setTextFields(textFields.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const slug = product?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Map customization options to productType for backward compatibility
    let derivedType = 'TYPE_A';
    if (allowTextCustomization && !allowPhotoUpload) derivedType = 'TYPE_B';
    else if (allowPhotoUpload) derivedType = 'TYPE_C';

    const activeSizes = hasSizeVariations ? sizes.filter((s) => s.name && s.name.trim()) : [];
    const firstSize = activeSizes[0];
    const finalBasePrice = hasSizeVariations && firstSize
      ? (Number(firstSize.price) || 0)
      : (Number(basePrice) || 0);
    const finalSalePrice = hasSizeVariations && firstSize
      ? (firstSize.salePrice ? Number(firstSize.salePrice) : null)
      : (salePrice ? Number(salePrice) : null);

    const payload = {
      name: name.trim(),
      slug,
      category,
      subcategory,
      additionalCategories,
      basePrice: finalBasePrice,
      salePrice: finalSalePrice,
      deliveryCharges: Number(deliveryCharges) || 0,
      minDeliveryDays: Number(minDeliveryDays) || 4,
      maxDeliveryDays: Number(maxDeliveryDays) || 10,
      stock: Number(stock) || 0,
      simulatedViewers: Number(simulatedViewers) || 18,
      description: description.trim(),
      details: details.trim() || description.trim(),
      images,
      productType: derivedType,
      allowTextCustomization: Boolean(allowTextCustomization),
      allowPhotoUpload: Boolean(allowPhotoUpload),
      hasSizeVariations: Boolean(hasSizeVariations),
      customFields: allowTextCustomization ? textFields : [],
      imageUploadConfig: {
        enabled: Boolean(allowPhotoUpload),
        minImages: Number(minPhotos) || 1,
        maxImages: Number(maxPhotos) || 50,
        instructions: photoInstructions,
      },
      sizeSectionTitle: sizeSectionTitle.trim() || 'Frame Size Variations',
      colorSectionTitle: colorSectionTitle.trim() || 'Frame Colors & Finishes',
      sizes: activeSizes,
      frameColors,
      tabsConfig: {
        showShippingTab,
        shippingText,
        showReturnTab,
        returnText,
      },
      isBestSeller,
      isNewArrival,
      isTrending,
    };

    await onSave(isEditing ? product.id || product._id : null, payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-[#E3C677]" />
            <h3 className="font-serif font-bold text-base">
              {isEditing ? `Edit Product: ${product.name}` : 'Add New Luxury Custom Gift / Wedding Frame'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1 bg-[#FAF7F2]">
          {/* SECTION 1: Basic Information */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <h4 className="font-serif font-bold text-sm text-stone-900 border-b border-stone-100 pb-2">
              1. Basic Product Information
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. Imperial Royal 24K Gold Foil Nikkah Nama Frame"
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-sm font-semibold focus:ring-1 focus:ring-[#C59A27]"
                />
              </div>

              {/* Product SEO Slug */}
              <div className="bg-[#FAF7F2] p-3 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-stone-800 text-xs">
                    SEO Slug (URL Key) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-stone-500">Auto-generated for search engine ranking & clean URL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-400 font-mono select-none">/products/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="imperial-royal-gold-frame"
                    className="flex-1 p-2 border border-stone-300 rounded-lg bg-white text-xs font-mono font-semibold text-stone-900 focus:ring-1 focus:ring-[#C59A27]"
                  />
                </div>
                <p className="text-[10px] text-stone-500 mt-1.5 flex items-center gap-1 font-mono">
                  <span className="text-emerald-700 font-semibold">Storefront Link:</span>
                  <span className="text-stone-600 truncate">https://vowcrafts.com/products/{slug || 'product-slug'}</span>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Primary Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      const cat = categories.find((c) => c.name === e.target.value);
                      if (cat?.subcategories?.length) {
                        setSubcategory(cat.subcategories[0].name);
                      } else {
                        setSubcategory('');
                      }
                    }}
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">Sub-Category</label>
                    <button
                      type="button"
                      onClick={() => setShowAddSubInput(!showAddSubInput)}
                      className="text-[11px] font-bold text-[#8C6D42] hover:text-stone-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{showAddSubInput ? '✕ Cancel' : '+ New Sub'}</span>
                    </button>
                  </div>

                  {!showAddSubInput ? (
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-medium"
                    >
                      <option value="">General (No subcategory)</option>
                      {availableSubcategories.map((sub) => (
                        <option key={sub.id || sub.slug} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        placeholder="Type subcategory name..."
                        className="flex-1 p-2 border border-stone-300 rounded-lg bg-white text-xs font-semibold"
                      />
                      <button
                        type="button"
                        disabled={addingSubcategory || !newSubcategoryName.trim()}
                        onClick={handleQuickAddSubcategory}
                        className="px-3 py-2 bg-[#C59A27] hover:bg-[#A47A1A] text-white rounded-lg text-xs font-bold shrink-0 transition cursor-pointer disabled:opacity-50"
                      >
                        {addingSubcategory ? '...' : 'Add'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Cross-Category Linking (Multiple Categories for Product) */}
              {categories.filter((c) => c.name !== category).length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C59A27]" />
                      <span>Also Show In Additional Categories (Multi-Category Linking)</span>
                    </span>
                    <span className="text-[10px] text-amber-800">
                      Product will appear in all selected categories
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories
                      .filter((c) => c.name !== category)
                      .map((c) => {
                        const isSelected = additionalCategories.includes(c.name);
                        return (
                          <button
                            key={c.id || c.name}
                            type="button"
                            onClick={() => {
                              setAdditionalCategories((prev) =>
                                isSelected ? prev.filter((item) => item !== c.name) : [...prev, c.name]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                              isSelected
                                ? 'bg-[#1C1917] text-white border-stone-900 shadow-2xs'
                                : 'bg-white text-stone-700 border-amber-300 hover:border-amber-400 hover:bg-amber-100/50'
                            }`}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{c.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">
                      Actual / Original Price (PKR) <span className="text-rose-500">*</span>
                    </label>
                    {hasSizeVariations && (
                      <span className="text-[9px] bg-amber-100 text-[#8C6D42] px-1.5 py-0.5 rounded font-mono font-semibold">
                        Auto (Size 1)
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    disabled={hasSizeVariations}
                    value={hasSizeVariations ? (sizes[0]?.price || 0) : basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="e.g. 6000"
                    className={`w-full p-2.5 border rounded-lg font-mono font-bold text-sm ${
                      hasSizeVariations
                        ? 'bg-stone-100 text-stone-500 border-stone-200 cursor-not-allowed select-none'
                        : 'bg-stone-50 text-stone-900 border-stone-300 focus:ring-1 focus:ring-[#C59A27]'
                    }`}
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    {hasSizeVariations
                      ? 'Priced per size in the "Size Variations" section below.'
                      : 'Standard price (crossed out with cut line if discount price is entered).'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">
                      Discounted / Offer Price (PKR) <span className="text-stone-400 font-normal">(Optional)</span>
                    </label>
                    {hasSizeVariations && (
                      <span className="text-[9px] bg-amber-100 text-[#8C6D42] px-1.5 py-0.5 rounded font-mono font-semibold">
                        Auto (Size 1)
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    disabled={hasSizeVariations}
                    value={hasSizeVariations ? (sizes[0]?.salePrice || '') : salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="e.g. 3500"
                    className={`w-full p-2.5 border rounded-lg font-mono font-bold text-sm ${
                      hasSizeVariations
                        ? 'bg-stone-100 text-stone-500 border-stone-200 cursor-not-allowed select-none'
                        : 'bg-stone-50 text-stone-900 border-stone-300 focus:ring-1 focus:ring-[#C59A27]'
                    }`}
                  />
                  <p className="text-[10px] text-emerald-700 font-medium mt-1">
                    {hasSizeVariations
                      ? 'Priced per size in the "Size Variations" section below.'
                      : 'Special offer price. Customer pays this amount.'}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Stock Vault <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono font-bold text-sm focus:ring-1 focus:ring-[#C59A27]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Scarcity alert triggered when stock &le; 10.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Live Viewers Count <span className="text-stone-400 font-normal">(Social Proof)</span>
                  </label>
                  <input
                    type="number"
                    value={simulatedViewers}
                    onChange={(e) => setSimulatedViewers(e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono font-bold text-sm focus:ring-1 focus:ring-[#C59A27]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Displays &ldquo;X people are viewing this right now&rdquo; badge.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700">
                      Delivery Charges (PKR)
                    </label>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                      0 = Free
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={deliveryCharges}
                    onChange={(e) => setDeliveryCharges(e.target.value)}
                    placeholder="0"
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono font-bold text-sm focus:ring-1 focus:ring-[#C59A27]"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Courier fee (weight/size based). Set 0 for free delivery.
                  </p>
                </div>
              </div>

              {/* Dynamic Estimated Delivery Days Configuration */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-800 text-[11px] mb-1">
                    Estimated Delivery Min Days (from order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={minDeliveryDays}
                    onChange={(e) => setMinDeliveryDays(Number(e.target.value))}
                    placeholder="4"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono font-bold text-xs focus:ring-1 focus:ring-[#C59A27]"
                  />
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Earliest days for arrival (e.g. 4 days from today).
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 text-[11px] mb-1">
                    Estimated Delivery Max Days (from order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={maxDeliveryDays}
                    onChange={(e) => setMaxDeliveryDays(Number(e.target.value))}
                    placeholder="10"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono font-bold text-xs focus:ring-1 focus:ring-[#C59A27]"
                  />
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Latest days for arrival (e.g. 10 days). Auto-renders on product page: &ldquo;Estimated Delivery: Oct 15 - Oct 21&rdquo;.
                  </p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Product Excerpt / Short Summary (Shown on product cards)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Handcrafted with genuine 24K gold foiling on imported velvet and archival parchment..."
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 focus:ring-1 focus:ring-[#C59A27] text-xs"
                />
              </div>

              <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#C59A27]/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C59A27]" />
                    <span>Product Craftsmanship & Detailed Description (Editable on Storefront)</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#A47A1A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Live Tab on Product Page
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Write your custom product details, materials (genuine 24K gold foil, crystal acrylic, imported German velvet, reinforced solid wood backing), framing dimensions, and artisan vows description..."
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-white focus:ring-1 focus:ring-[#C59A27] text-xs leading-relaxed"
                />
                <p className="text-[10px] text-stone-500">
                  This text appears under the product in the &ldquo;Artisan Craftsmanship & Details&rdquo; tab on the product page.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 text-[#C59A27] rounded"
                  />
                  <span className="font-semibold text-stone-800">Best Seller Badge</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="w-4 h-4 text-[#C59A27] rounded"
                  />
                  <span className="font-semibold text-stone-800">New Arrival</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 text-[#C59A27] rounded"
                  />
                  <span className="font-semibold text-stone-800">Trending Now</span>
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: Product Images Gallery (Displayed on Storefront) */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div>
                <h4 className="font-serif font-bold text-sm text-stone-900">
                  2. Product Gallery Photos (Shown on Frontend)
                </h4>
                <p className="text-[11px] text-stone-500">
                  Upload multiple product images. The first image will be used as the primary showcase picture.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#A47A1A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {images.length} Image(s)
              </span>
            </div>

            {/* Current Images Thumbnails Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-xl border-2 border-stone-200 overflow-hidden bg-stone-100 aspect-square shadow-xs hover:border-[#C59A27] transition"
                >
                  <img src={imgUrl} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <div className="absolute top-1 left-1 bg-[#1C1917]/90 text-[#E3C677] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Primary
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload Buttons & URL Input */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-stone-100">
              <label className="cursor-pointer px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg font-bold flex items-center space-x-1.5 transition text-xs shadow-xs shrink-0">
                <Upload className="w-3.5 h-3.5 text-[#E3C677]" />
                <span>Upload Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImageFile}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>

              {uploadingImage && <span className="text-xs text-[#A47A1A] font-semibold">Uploading photo...</span>}

              <div className="flex-1 flex items-center space-x-2 w-full">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Or paste external image URL (e.g. Unsplash, Cloudinary)..."
                  className="flex-1 p-2 border border-stone-300 rounded-lg bg-stone-50 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-3.5 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-bold text-xs"
                >
                  Add URL
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 3: CUSTOMIZATION OPTIONS (REQUESTED FEATURE) */}
          {/* ======================================================== */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#C59A27]/60 shadow-md space-y-5 bg-gradient-to-br from-amber-50/20 via-white to-white">
            <div className="border-b border-stone-100 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#C59A27]" />
                <h4 className="font-serif font-bold text-base text-stone-900">
                  3. Product Customization Options
                </h4>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Tick the options below to activate personalized fields for customers on the storefront.
              </p>
            </div>

            {/* OPTION 1: Text Customization Checkbox */}
            <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF7F2] space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowTextCustomization}
                    onChange={(e) => setAllowTextCustomization(e.target.checked)}
                    className="w-5 h-5 text-[#C59A27] rounded border-stone-300 focus:ring-[#C59A27]"
                  />
                  <div>
                    <span className="font-bold text-sm text-stone-900">
                      Allow Customer Text Customization
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Enable text inputs (Bride Name, Groom Name, Dates, Special Quotes) for this product.
                    </p>
                  </div>
                </label>
                <FileText className="w-5 h-5 text-[#A47A1A]" />
              </div>

              {/* Sub-fields if text customization is enabled */}
              {allowTextCustomization && (
                <div className="space-y-3 pt-3 border-t border-stone-200 pl-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Active Text Inputs For This Product:
                  </div>

                  <div className="space-y-2.5">
                    {textFields.map((field, idx) => (
                      <div
                        key={field.fieldId || idx}
                        className="p-3 bg-white rounded-lg border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center gap-3"
                      >
                        <span className="text-[10px] font-mono text-stone-400 font-bold w-6">#{idx + 1}</span>

                        <div className="flex-1 w-full sm:w-auto">
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Field Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => handleUpdateCustomField(idx, 'label', e.target.value)}
                            className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-xs font-semibold"
                            placeholder="e.g. Bride Full Name"
                          />
                        </div>

                        <div className="flex-1 w-full sm:w-auto">
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Placeholder</label>
                          <input
                            type="text"
                            value={field.placeholder}
                            onChange={(e) => handleUpdateCustomField(idx, 'placeholder', e.target.value)}
                            className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-xs"
                            placeholder="Placeholder helper"
                          />
                        </div>

                        <div className="w-full sm:w-36">
                          <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Input Type</label>
                          <select
                            value={field.type || 'text'}
                            onChange={(e) => handleUpdateCustomField(idx, 'type', e.target.value)}
                            className="w-full p-1.5 border border-stone-300 rounded bg-stone-50 text-xs font-semibold text-stone-700 focus:outline-none focus:border-[#C59A27]"
                          >
                            <option value="text">Single Line Text</option>
                            <option value="date">Date (DD/MM/YYYY)</option>
                            <option value="textarea">Paragraph</option>
                            <option value="number">Number</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-3 pt-4 sm:pt-0">
                          <label className="flex items-center space-x-1.5 text-[11px] font-semibold text-stone-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => handleUpdateCustomField(idx, 'required', e.target.checked)}
                              className="w-3.5 h-3.5 text-[#C59A27] rounded"
                            />
                            <span>Required</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(idx)}
                            className="p-1 text-stone-400 hover:text-rose-600 transition"
                            title="Remove field"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="py-2 px-3.5 border border-dashed border-[#C59A27] text-[#A47A1A] hover:bg-amber-50 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Custom Text Field</span>
                  </button>
                </div>
              )}
            </div>

            {/* OPTION 2: Customer Photo Upload Checkbox */}
            <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF7F2] space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowPhotoUpload}
                    onChange={(e) => setAllowPhotoUpload(e.target.checked)}
                    className="w-5 h-5 text-[#C59A27] rounded border-stone-300 focus:ring-[#C59A27]"
                  />
                  <div>
                    <span className="font-bold text-sm text-stone-900">
                      Allow Customer Photo Uploads (1 to 50+ Photos)
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Ideal for photo collage frames, mosaic albums, and memory shadow boxes.
                    </p>
                  </div>
                </label>
                <Camera className="w-5 h-5 text-blue-600" />
              </div>

              {allowPhotoUpload && (
                <div className="space-y-3 pt-3 border-t border-stone-200 pl-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Minimum Photos Required</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={minPhotos}
                        onChange={(e) => setMinPhotos(Number(e.target.value))}
                        className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">Maximum Photos Allowed (e.g. 50+)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={maxPhotos}
                        onChange={(e) => setMaxPhotos(Number(e.target.value))}
                        className="w-full p-2 border border-stone-300 rounded-lg bg-white font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Instructions Displayed to Customer at Upload
                    </label>
                    <input
                      type="text"
                      value={photoInstructions}
                      onChange={(e) => setPhotoInstructions(e.target.value)}
                      placeholder="e.g. Upload 1 to 50 high-resolution photos for collage composition."
                      className="w-full p-2 border border-stone-300 rounded-lg bg-white text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 3: Sizes Variations with Direct Pricing (Audio 1 Feedback) */}
            <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF7F2] space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSizeVariations}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHasSizeVariations(checked);
                      if (checked && (!sizes || sizes.length === 0)) {
                        setSizes([
                          { name: '12 x 18 inches', price: Number(basePrice) || 6000, salePrice: salePrice ? Number(salePrice) : '' },
                          { name: '16 x 24 inches', price: (Number(basePrice) || 6000) + 1200, salePrice: salePrice ? Number(salePrice) + 1200 : '' },
                        ]);
                      }
                    }}
                    className="w-5 h-5 text-[#C59A27] rounded border-stone-300 focus:ring-[#C59A27]"
                  />
                  <div>
                    <span className="font-bold text-sm text-stone-900">
                      Enable Size Variations / Custom Sizes
                    </span>
                    <p className="text-[11px] text-stone-500">
                      Check this if this product has different sizes with their own Actual and Discounted prices.
                    </p>
                  </div>
                </label>
                <Maximize2 className="w-5 h-5 text-[#A47A1A]" />
              </div>

              {hasSizeVariations && (
                <div className="space-y-3 pt-3 border-t border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider shrink-0">
                          Heading:
                        </span>
                        <input
                          type="text"
                          value={sizeSectionTitle}
                          onChange={(e) => setSizeSectionTitle(e.target.value)}
                          placeholder="e.g. Frame Size Variations..."
                          className="font-bold text-xs text-stone-900 bg-white border border-stone-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-[#C59A27] w-full max-w-sm"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSizes([
                          ...sizes,
                          { name: '', price: Number(basePrice) || 6000, salePrice: salePrice ? Number(salePrice) : '' },
                        ])
                      }
                      className="px-3 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#E3C677]" />
                      <span>+ Add Size Variation</span>
                    </button>
                  </div>

                  {/* Table Headers */}
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-stone-500 px-2 pt-1">
                    <div className="col-span-5">Size Name / Label</div>
                    <div className="col-span-3">Actual Price (PKR) *</div>
                    <div className="col-span-3">Discount Price (PKR)</div>
                    <div className="col-span-1 text-center">Del</div>
                  </div>

                  {/* Size Rows */}
                  <div className="space-y-2">
                    {sizes.map((s, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 bg-white p-2.5 rounded-lg border border-stone-200 shadow-2xs items-center">
                        <div className="col-span-5">
                          <input
                            type="text"
                            value={s.name}
                            onChange={(e) => {
                              const updated = [...sizes];
                              updated[idx].name = e.target.value;
                              setSizes(updated);
                            }}
                            className="w-full p-1.5 border border-stone-300 rounded text-xs font-semibold"
                            placeholder="e.g. 12 x 18 inches"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={s.price !== undefined ? s.price : ''}
                            onChange={(e) => {
                              const updated = [...sizes];
                              updated[idx].price = Number(e.target.value) || 0;
                              setSizes(updated);
                            }}
                            className="w-full p-1.5 border border-stone-300 rounded text-xs font-mono font-bold"
                            placeholder="6000"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            value={s.salePrice !== undefined && s.salePrice !== null ? s.salePrice : ''}
                            onChange={(e) => {
                              const updated = [...sizes];
                              updated[idx].salePrice = e.target.value ? Number(e.target.value) : '';
                              setSizes(updated);
                            }}
                            className="w-full p-1.5 border border-stone-300 rounded text-xs font-mono"
                            placeholder="3500 (Opt)"
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => setSizes(sizes.filter((_, i) => i !== idx))}
                            className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Remove size"
                          >
                            <Trash2 className="w-3.5 h-3.5 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* OPTION 4: Frame Colors & Finishes (Editable Heading) */}
            <div className="p-4 rounded-xl border border-stone-200 bg-[#FAF7F2] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Palette className="w-4 h-4 text-[#C59A27] shrink-0" />
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider shrink-0">
                      Finish Heading:
                    </span>
                    <input
                      type="text"
                      value={colorSectionTitle}
                      onChange={(e) => setColorSectionTitle(e.target.value)}
                      placeholder="e.g. Frame Colors & Finishes, Booklet Cover Finish, Binding Materials..."
                      className="font-bold text-sm text-stone-900 bg-white border border-stone-300 rounded-lg px-2.5 py-1 focus:ring-1 focus:ring-[#C59A27] w-full max-w-sm"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Editable title displayed on storefront (e.g. &ldquo;Booklet Cover &amp; Foiling&rdquo;, &ldquo;Binding Materials&rdquo;, &ldquo;Cover Finish&rdquo;).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFrameColors([...frameColors, { name: 'Custom Finish', hex: '#D4AF37', priceAdjustment: 0 }])
                  }
                  className="px-3 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition shadow-xs shrink-0 self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-[#E3C677]" />
                  <span>+ Add Finish</span>
                </button>
              </div>

              {/* Quick Heading Presets for Colors/Finishes */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] text-stone-400 font-semibold mr-1">Quick Name Presets:</span>
                {[
                  'Frame Colors & Finishes',
                  'Booklet Cover & Foiling',
                  'Binding & Velvet Finishes',
                  'Foil Colors & Calligraphy',
                  'Acrylic & Wood Finishes',
                ].map((presetName) => (
                  <button
                    key={presetName}
                    type="button"
                    onClick={() => setColorSectionTitle(presetName)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                      colorSectionTitle === presetName
                        ? 'bg-[#1C1917] text-white border-[#1C1917]'
                        : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    {presetName}
                  </button>
                ))}
              </div>

              {/* Quick Preset Chips */}
              <div className="pt-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block mb-1.5">
                  Quick Add Luxury Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { name: 'Imperial 24K Gold Foil', hex: '#D4AF37', priceAdjustment: 0 },
                    { name: 'Romantic Rose Gold', hex: '#B76E79', priceAdjustment: 350 },
                    { name: 'Classic Matte Noir Black', hex: '#1C1917', priceAdjustment: 0 },
                    { name: 'Antique Champagne Silver', hex: '#C0C0C0', priceAdjustment: 200 },
                    { name: 'Handcrafted Walnut Wood', hex: '#5C4033', priceAdjustment: 450 },
                    { name: 'Pure White Lacquer', hex: '#FFFFFF', priceAdjustment: 100 },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        const exists = frameColors.some((c) => c.name.toLowerCase() === preset.name.toLowerCase());
                        if (!exists) {
                          setFrameColors([...frameColors, { ...preset }]);
                        }
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-stone-50 text-stone-700 rounded-md border border-stone-200 text-[11px] font-medium flex items-center space-x-1.5 transition shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-stone-300" style={{ backgroundColor: preset.hex }}></span>
                      <span>+ {preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable List of Frame Colors */}
              <div className="space-y-2 pt-2">
                {frameColors.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400 bg-white rounded-lg border border-dashed border-stone-300">
                    No frame colors defined. Click "+ Add Finish" or pick a preset above.
                  </div>
                ) : (
                  frameColors.map((c, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs">
                      {/* Swatch & Color Picker */}
                      <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8 rounded-lg border border-stone-300 overflow-hidden shrink-0 shadow-xs">
                          <input
                            type="color"
                            value={c.hex}
                            onChange={(e) => {
                              const updated = [...frameColors];
                              updated[idx].hex = e.target.value;
                              setFrameColors(updated);
                            }}
                            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-none"
                            title="Click to pick color swatch"
                          />
                        </div>
                        <input
                          type="text"
                          value={c.hex}
                          onChange={(e) => {
                            const updated = [...frameColors];
                            updated[idx].hex = e.target.value;
                            setFrameColors(updated);
                          }}
                          placeholder="#D4AF37"
                          className="w-20 p-1.5 border border-stone-300 rounded text-xs font-mono font-bold text-stone-700 uppercase"
                          title="Hex Color Code"
                        />
                      </div>

                      {/* Color Finish Title */}
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...frameColors];
                          updated[idx].name = e.target.value;
                          setFrameColors(updated);
                        }}
                        className="flex-1 p-1.5 border border-stone-300 rounded text-xs font-semibold text-stone-800"
                        placeholder="Color Finish Name (e.g. Imperial Brushed Gold)"
                      />

                      {/* Price Adjustment */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <span className="text-[11px] text-stone-500 font-mono">+PKR</span>
                        <input
                          type="number"
                          value={c.priceAdjustment}
                          onChange={(e) => {
                            const updated = [...frameColors];
                            updated[idx].priceAdjustment = Number(e.target.value);
                            setFrameColors(updated);
                          }}
                          className="w-20 p-1.5 border border-stone-300 rounded text-xs font-mono font-bold"
                          placeholder="0"
                          title="Additional Price Adjustment"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => setFrameColors(frameColors.filter((_, i) => i !== idx))}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded transition hover:bg-rose-50 self-end sm:self-auto"
                        title="Remove finish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 4: STOREFRONT INFORMATION TABS (Description, Shipping, Return) */}
          {/* ======================================================== */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-2">
              <h4 className="font-serif font-bold text-sm text-stone-900">
                4. Storefront Information Tabs Customization
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Manage the deep-dive tabs (Description, Shipping, and Return) displayed under the product.
              </p>
            </div>

            {/* TAB 1: Description */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-800 uppercase tracking-wide">
                  Tab 1: Description (Always Visible)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              </div>
              <textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Write your custom product description, dimensions, materials, and artisan details..."
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-white focus:ring-1 focus:ring-[#C59A27] text-xs leading-relaxed"
              />
            </div>

            {/* TAB 2: Shipping */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF7F2] space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showShippingTab}
                  onChange={(e) => setShowShippingTab(e.target.checked)}
                  className="w-4 h-4 text-[#C59A27] rounded border-stone-300 focus:ring-[#C59A27]"
                />
                <span className="font-bold text-xs text-stone-900">
                  Enable Tab 2: &ldquo;Shipping&rdquo; Tab
                </span>
              </label>

              {showShippingTab && (
                <div className="space-y-1.5 pt-1 pl-6">
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Shipping &amp; Delivery Information Text
                  </label>
                  <textarea
                    rows={3}
                    value={shippingText}
                    onChange={(e) => setShippingText(e.target.value)}
                    placeholder="Standard delivery takes 3 to 5 working days across Pakistan. Secure protective packaging ensures your order arrives safe and undamaged."
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-white focus:ring-1 focus:ring-[#C59A27] text-xs leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* TAB 3: Return */}
            <div className="p-3.5 rounded-xl border border-stone-200 bg-[#FAF7F2] space-y-3">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReturnTab}
                  onChange={(e) => setShowReturnTab(e.target.checked)}
                  className="w-4 h-4 text-[#C59A27] rounded border-stone-300 focus:ring-[#C59A27]"
                />
                <span className="font-bold text-xs text-stone-900">
                  Enable Tab 3: &ldquo;Return&rdquo; Tab
                </span>
              </label>

              {showReturnTab && (
                <div className="space-y-1.5 pt-1 pl-6">
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Return &amp; Replacement Policy Text
                  </label>
                  <textarea
                    rows={3}
                    value={returnText}
                    onChange={(e) => setReturnText(e.target.value)}
                    placeholder="Every customized order is digitally reviewed on WhatsApp before dispatch. In the rare case of transit damage, replacement is provided promptly."
                    className="w-full p-2.5 border border-stone-300 rounded-lg bg-white focus:ring-1 focus:ring-[#C59A27] text-xs leading-relaxed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-bold text-stone-600 hover:text-stone-900 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-1.5 px-7 py-2.5 bg-[#C59A27] hover:bg-[#A47A1A] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-xs"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
