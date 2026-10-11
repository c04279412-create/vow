'use client';

import React, { useState, useEffect } from 'react';
import { X, Star, Upload, Trash2, Image as ImageIcon, Sparkles, CheckCircle, MessageSquare } from 'lucide-react';

export default function ReviewModal({ review, onClose, onSave }) {
  const isEditing = Boolean(review && (review.id || review._id));

  const [customerName, setCustomerName] = useState(review?.customerName || '');
  const [productName, setProductName] = useState(review?.productName || '');
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment || '');
  const [screenshotUrl, setScreenshotUrl] = useState(review?.screenshotUrl || review?.imageUrl || '');
  const [verified, setVerified] = useState(review?.verified !== undefined ? review.verified : true);
  const [approved, setApproved] = useState(review?.approved !== undefined ? review.approved : true);
  const [reviewDate, setReviewDate] = useState(
    review?.reviewDate || new Date().toISOString().split('T')[0]
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (review) {
      setCustomerName(review.customerName || '');
      setProductName(review.productName || '');
      setRating(review.rating ?? 5);
      setComment(review.comment || '');
      setScreenshotUrl(review.screenshotUrl || review.imageUrl || '');
      setVerified(review.verified !== undefined ? review.verified : true);
      setApproved(review.approved !== undefined ? review.approved : true);
      setReviewDate(review.reviewDate || new Date().toISOString().split('T')[0]);
    } else {
      setCustomerName('');
      setProductName('');
      setRating(5);
      setComment('');
      setScreenshotUrl('');
      setVerified(true);
      setApproved(true);
      setReviewDate(new Date().toISOString().split('T')[0]);
    }
  }, [review]);

  // Handle Screenshot Upload via /api/upload
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
        setScreenshotUrl(data.url);
      } else {
        alert(data.message || 'Image upload failed');
      }
    } catch (err) {
      alert(`Error uploading review screenshot: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    setSaving(true);
    const payload = {
      customerName: customerName.trim(),
      productName: productName.trim() || 'Bespoke Keepsake Frame',
      rating: Number(rating) || 5,
      comment: comment.trim(),
      screenshotUrl: screenshotUrl.trim(),
      imageUrl: screenshotUrl.trim(),
      verified,
      approved,
      reviewDate: reviewDate || new Date().toISOString().split('T')[0],
    };

    await onSave(isEditing ? review.id || review._id : null, payload);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <MessageSquare className="w-5 h-5 text-[#E3C677]" />
            <h3 className="font-serif font-bold text-base">
              {isEditing ? `Edit Customer Review` : 'Add Real Customer Review & Screenshot'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1 bg-[#FAF7F2]">
          {/* Customer Name & Product Name */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ayesha & Daniyal, Fatima Z."
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs font-semibold focus:ring-1 focus:ring-[#C59A27]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Product Purchased</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Royal Nikkah Nama Frame"
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-1 focus:ring-[#C59A27]"
                />
              </div>
            </div>

            {/* Rating Stars & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Rating</label>
                <div className="flex items-center space-x-1 p-2 bg-stone-50 rounded-lg border border-stone-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 hover:scale-110 transition"
                      title={`${star} Stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-[11px] font-bold text-stone-600 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Review Date</label>
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Review Text / Customer Feedback */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 shadow-xs">
            <label className="block font-bold text-stone-700">
              Customer Feedback / Quote <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Paste or write the customer's real feedback e.g. 'The frame arrived safely in Lahore, the gold foil quality is exceptional!'..."
              className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 text-xs focus:ring-1 focus:ring-[#C59A27]"
            />
          </div>

          {/* Customer Review Screenshot / Photo Upload */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                Original Screenshot / Photo (WhatsApp / Delivery / Product)
              </label>
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                Shows on Frontpage Carousel
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Image Preview Box */}
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-[#C59A27]/40 overflow-hidden bg-stone-100 flex items-center justify-center shrink-0 relative group shadow-inner">
                {screenshotUrl ? (
                  <img
                    src={screenshotUrl}
                    alt="Review screenshot"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2 text-stone-400 text-[10px]">
                    <ImageIcon className="w-7 h-7 mx-auto mb-1 text-stone-300" />
                    <span>No Screenshot</span>
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-bold">
                    Uploading...
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg font-bold flex items-center space-x-1.5 transition text-xs shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-[#E3C677]" />
                    <span>Upload Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {screenshotUrl && (
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl('')}
                      className="text-stone-500 hover:text-rose-600 p-1.5"
                      title="Clear image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-stone-500">Or paste an image URL:</span>
                  <input
                    type="url"
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 text-[11px] font-mono mt-0.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Display Options */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
                className="w-4 h-4 text-[#B5936C] rounded-sm focus:ring-[#C59A27]"
              />
              <span className="font-semibold text-stone-800 text-xs">
                Verified Customer Badge
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={approved}
                onChange={(e) => setApproved(e.target.checked)}
                className="w-4 h-4 text-[#B5936C] rounded-sm focus:ring-[#C59A27]"
              />
              <span className="font-semibold text-stone-800 text-xs">
                Show on Storefront Live
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-lg font-semibold text-stone-600 hover:bg-stone-100 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-5 py-2 bg-[#B5936C] hover:bg-[#8C6D42] text-white rounded-lg font-bold flex items-center space-x-1.5 transition text-xs shadow-md disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FAF7F2]" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Review' : 'Save Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
