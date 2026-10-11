'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function CollectionModal({ collection, allProducts = [], onClose, onSave }) {
  const isEditing = Boolean(collection && (collection.id || collection._id));

  const [name, setName] = useState(collection?.name || '');
  const [slug, setSlug] = useState(collection?.slug || '');
  const [isSlugManual, setIsSlugManual] = useState(Boolean(collection?.slug));
  const [description, setDescription] = useState(collection?.description || '');
  const [status, setStatus] = useState(collection?.status || 'Active');
  const [displayOrder, setDisplayOrder] = useState(collection?.displayOrder ?? 0);
  const [selectedProductIds, setSelectedProductIds] = useState(collection?.productIds || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setSlug(collection.slug || '');
      setDescription(collection.description || '');
      setStatus(collection.status || 'Active');
      setDisplayOrder(collection.displayOrder ?? 0);
      setSelectedProductIds(collection.productIds || []);
    }
  }, [collection]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManual || !slug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const toggleProduct = (prodId) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== prodId));
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const payload = {
      name: name.trim(),
      slug: (slug || name).toLowerCase().replace(/[^a-z0-9-_]+/g, ''),
      description: description.trim(),
      status,
      displayOrder: Number(displayOrder) || 0,
      productIds: selectedProductIds,
    };

    await onSave(isEditing ? collection.id || collection._id : null, payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header matching user screenshot */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-stone-100">
          <h2 className="font-serif text-2xl font-normal text-stone-800 tracking-tight">
            {isEditing ? 'Edit Collection' : 'Create Collection'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body matching screenshot fields */}
        <form onSubmit={handleSubmit} className="p-7 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Row 1: Collection Name & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Collection Name <span className="text-stone-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Made for Moments"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setIsSlugManual(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]+/g, ''));
                }}
                placeholder="made-for-moments"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Signature collection narrative..."
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C] resize-none"
            />
          </div>

          {/* Row 3: Status & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 text-[13px] bg-white focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C] appearance-none pr-8 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.292a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Display Order
              </label>
              <input
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 text-[13px] font-mono focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>
          </div>

          {/* Row 4: Attach Products to this Collection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-medium text-stone-700">
                Attach Products to this Collection
              </label>
              <span className="text-[11px] text-stone-400 font-mono">
                {selectedProductIds.length} Selected
              </span>
            </div>

            <div className="border border-stone-300 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 bg-stone-50/40">
              {allProducts.length === 0 ? (
                <p className="text-xs text-stone-400 italic p-2 text-center">No products found</p>
              ) : (
                allProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id || p._id);
                  return (
                    <label
                      key={p.id || p._id}
                      className="flex items-center space-x-2.5 p-1.5 rounded-lg hover:bg-white cursor-pointer transition select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProduct(p.id || p._id)}
                        className="w-4 h-4 rounded text-[#1C1917] border-stone-300 focus:ring-[#1C1917] accent-[#1C1917]"
                      />
                      <span className="text-[12px] text-stone-800 font-medium truncate flex-1">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        PKR {p.basePrice?.toLocaleString()}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Buttons matching screenshot */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium rounded-lg transition text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white font-bold tracking-wider uppercase rounded-lg transition shadow-xs disabled:opacity-60 text-[12px]"
            >
              {saving ? 'SAVING...' : isEditing ? 'UPDATE' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
