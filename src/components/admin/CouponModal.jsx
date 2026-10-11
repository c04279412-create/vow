'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

export default function CouponModal({ coupon, onClose, onSave }) {
  const isEditing = Boolean(coupon && (coupon.id || coupon._id));

  const [code, setCode] = useState(coupon?.code || '');
  const [discountType, setDiscountType] = useState(coupon?.discountType || 'percentage');
  const [discountValue, setDiscountValue] = useState(coupon?.discountValue ?? 15);
  const [maxDiscountCap, setMaxDiscountCap] = useState(coupon?.maxDiscountCap || '');
  const [minOrderValue, setMinOrderValue] = useState(coupon?.minOrderValue ?? '0.00');
  const [description, setDescription] = useState(coupon?.description || '');
  const [startDate, setStartDate] = useState(
    coupon?.startDate
      ? new Date(coupon.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [expiryDate, setExpiryDate] = useState(
    coupon?.expiryDate
      ? new Date(coupon.expiryDate).toISOString().split('T')[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [totalUsageLimit, setTotalUsageLimit] = useState(coupon?.totalUsageLimit || '');
  const [perCustomerLimit, setPerCustomerLimit] = useState(coupon?.perCustomerLimit ?? 1);
  const [active, setActive] = useState(coupon?.active !== undefined ? coupon.active : true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || '');
      setDiscountType(coupon.discountType || 'percentage');
      setDiscountValue(coupon.discountValue ?? 15);
      setMaxDiscountCap(coupon.maxDiscountCap || '');
      setMinOrderValue(coupon.minOrderValue ?? '0.00');
      setDescription(coupon.description || '');
      if (coupon.startDate) setStartDate(new Date(coupon.startDate).toISOString().split('T')[0]);
      if (coupon.expiryDate) setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
      setTotalUsageLimit(coupon.totalUsageLimit || '');
      setPerCustomerLimit(coupon.perCustomerLimit ?? 1);
      setActive(coupon.active !== undefined ? coupon.active : true);
    }
  }, [coupon]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSaving(true);
    const payload = {
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue) || 0,
      maxDiscountCap: maxDiscountCap ? Number(maxDiscountCap) : null,
      minOrderValue: Number(minOrderValue) || 0,
      description: description.trim(),
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : null,
      perCustomerLimit: Number(perCustomerLimit) || 1,
      active,
    };

    await onSave(isEditing ? coupon.id || coupon._id : null, payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-[560px] w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header - Matches image serif title and subtle close icon */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-stone-100">
          <h2 className="font-serif text-2xl font-normal text-stone-800 tracking-tight">
            {isEditing ? `Edit Coupon: ${coupon.code}` : 'Create New Coupon'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Exactly matching user screenshot */}
        <form onSubmit={handleSubmit} className="p-7 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Row 1: Coupon Code * & Discount Type * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Coupon Code <span className="text-stone-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="E.G. CRAFT10"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 font-mono text-[13px] uppercase focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Discount Type <span className="text-stone-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 text-[13px] bg-white focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C] appearance-none pr-8 cursor-pointer"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (PKR)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.292a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Discount Value * & Max Discount Cap (PKR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Discount Value * ({discountType === 'percentage' ? '%' : 'PKR'})
              </label>
              <input
                type="number"
                required
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder="15"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Max Discount Cap (PKR)
              </label>
              <input
                type="number"
                value={maxDiscountCap}
                onChange={(e) => setMaxDiscountCap(e.target.value)}
                placeholder="e.g. 2000 (Optional)"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>
          </div>

          {/* Row 3: Minimum Order Amount (PKR) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Minimum Order Amount (PKR)
              </label>
              <input
                type="number"
                step="any"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>
            <div className="hidden sm:block"></div>
          </div>

          {/* Row 4: Description / Internal Notes */}
          <div>
            <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
              Description / Internal Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 15% discount for Eid festive launch"
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
            />
          </div>

          {/* Row 5: Start Date & End / Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                End / Expiry Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Total Usage Limit & Per Customer Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Total Usage Limit
              </label>
              <input
                type="number"
                value={totalUsageLimit}
                onChange={(e) => setTotalUsageLimit(e.target.value)}
                placeholder="Leave empty for unlimited"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-stone-700 mb-1.5">
                Per Customer Limit
              </label>
              <input
                type="number"
                min="1"
                value={perCustomerLimit}
                onChange={(e) => setPerCustomerLimit(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-400 text-[13px] focus:outline-none focus:border-[#B5936C] focus:ring-1 focus:ring-[#B5936C]"
              />
            </div>
          </div>

          {/* Row 7: Checkbox: Activate this coupon immediately */}
          <div className="pt-2">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#B5936C] border-stone-300 focus:ring-[#B5936C] accent-[#B5936C]"
              />
              <span className="text-[13px] text-stone-800 font-medium">
                Activate this coupon immediately
              </span>
            </label>
          </div>

          {/* Row 8: Footer Buttons */}
          <div className="pt-5 pb-1 flex items-center justify-end space-x-3 border-t border-stone-100">
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
              className="px-6 py-2.5 bg-[#B5936C] hover:bg-[#A3825B] text-white font-medium rounded-lg transition shadow-xs disabled:opacity-60 text-[13px]"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
