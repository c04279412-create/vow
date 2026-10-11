'use client';

import React, { useState } from 'react';
import { Download, CheckCircle2, XCircle, X, ExternalLink, ShieldCheck, Clock, Upload, Image as ImageIcon, MessageCircle, RefreshCw } from 'lucide-react';

export default function PaymentProofModal({ order, storeSettings, onClose, onUpdateStatus }) {
  if (!order) return null;

  const rawUrl = order.payment?.paymentScreenshotUrl;
  const initialValidScreenshot = Boolean(
    rawUrl &&
    rawUrl !== 'pending_customer_upload' &&
    rawUrl.trim() !== '' &&
    (rawUrl.startsWith('http') || rawUrl.startsWith('/uploads/') || rawUrl.startsWith('data:image'))
  );

  const [screenshotUrl, setScreenshotUrl] = useState(initialValidScreenshot ? rawUrl : '');
  const [notes, setNotes] = useState(order.payment?.notes || '');
  const [updating, setUpdating] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleAdminFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Failed to upload image');
      }

      const newUrl = data.url;
      setScreenshotUrl(newUrl);

      // Persist to order
      await onUpdateStatus(order.id, {
        payment: {
          ...order.payment,
          paymentScreenshotUrl: newUrl,
          notes,
        },
        timelineEvent: {
          status: order.payment.paymentStatus,
          message: 'Admin attached advance payment receipt screenshot.',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Error uploading receipt.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onUpdateStatus(order.id, {
      payment: {
        ...order.payment,
        paymentScreenshotUrl: screenshotUrl || '',
        paymentStatus: newStatus,
        verifiedAt: newStatus === 'advance_verified' ? new Date().toISOString() : null,
        verifiedBy: newStatus === 'advance_verified' ? 'Admin' : null,
        notes,
      },
      timelineEvent: {
        status: newStatus,
        message: newStatus === 'advance_verified'
          ? `Advance payment of ${storeSettings?.currencySymbol || 'PKR'} ${order.pricing.advanceAmount} verified.`
          : `Payment status changed to ${newStatus}. Note: ${notes}`,
        timestamp: new Date().toISOString(),
      },
    });
    setUpdating(false);
    onClose();
  };

  const cleanCustomerPhone = (order.customer?.phone || '').replace(/[^0-9]/g, '');
  const whatsAppMessage = encodeURIComponent(
    `Assalam o Alaikum ${order.customer?.fullName || 'Customer'}! Thank you for ordering with VowCrafts (Order #${order.orderNumber}). We noticed your advance deposit receipt of PKR ${order.pricing?.advanceAmount?.toLocaleString() || '0'} has not been received yet. Kindly send your payment screenshot here to start your order drafting. JazakAllah!`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#C59A27] flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base">Advance Payment Receipt Verification</h3>
              <p className="text-xs text-[#E3C677] font-mono">
                Order #{order.orderNumber} • Customer: {order.customer.fullName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF7F2]">
          {/* Left: Receipt Screenshot Viewer or Empty State with Admin Upload */}
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Customer Uploaded Screenshot
              </h4>
              {screenshotUrl && (
                <div className="flex items-center space-x-3 text-xs">
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-[#A47A1A] hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Full Size</span>
                  </a>
                  <a
                    href={screenshotUrl}
                    download={`receipt-${order.orderNumber}.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-stone-600 hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              )}
            </div>

            <div className="rounded-xl border-2 border-stone-300 bg-white p-3 shadow-inner min-h-[340px] flex-1 flex flex-col items-center justify-center overflow-hidden">
              {screenshotUrl ? (
                <div className="relative group w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={screenshotUrl}
                    alt={`Payment proof for ${order.orderNumber}`}
                    className="max-h-[380px] w-auto object-contain rounded-lg shadow-sm group-hover:scale-[1.02] transition-transform duration-200"
                    onError={() => setScreenshotUrl('')}
                  />
                  <div className="mt-3 flex items-center justify-center w-full">
                    <label className="text-[11px] text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg border border-stone-300 font-semibold cursor-pointer transition flex items-center space-x-1.5">
                      <RefreshCw className="w-3 h-3 text-[#A47A1A]" />
                      <span>{uploadingReceipt ? 'Uploading...' : 'Replace Receipt / Upload New'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingReceipt}
                        onChange={handleAdminFileUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-4 max-w-sm">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-[#C59A27] flex items-center justify-center mx-auto shadow-xs">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-serif font-bold text-stone-800 text-sm">
                      No Screenshot Uploaded by Customer
                    </h5>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Customer has not submitted their bank transfer screenshot on the website yet.
                    </p>
                  </div>

                  {uploadError && (
                    <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {uploadError}
                    </div>
                  )}

                  {/* Admin Direct Receipt Upload */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <p className="text-[11px] font-semibold text-stone-600">
                      Did the customer send proof on WhatsApp or Email?
                    </p>
                    <label className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-[#E3C677]" />
                      <span>{uploadingReceipt ? 'Uploading...' : 'Attach Receipt Screenshot (Admin)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingReceipt}
                        onChange={handleAdminFileUpload}
                      />
                    </label>

                    {cleanCustomerPhone && (
                      <a
                        href={`https://wa.me/${cleanCustomerPhone}?text=${whatsAppMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Request Receipt on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Payment Breakdown & Verification Actions */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Financial Box */}
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Required Advance Calculation
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-stone-600">Total Order Amount:</div>
                  <div className="font-mono font-bold text-right text-stone-900">
                    {storeSettings?.currencySymbol || 'PKR'} {order.pricing.totalAmount?.toLocaleString()}
                  </div>
                  <div className="text-stone-600">Required Advance ({order.pricing.advancePercentage || 10}%):</div>
                  <div className="font-mono font-bold text-right text-[#C59A27] text-base">
                    {storeSettings?.currencySymbol || 'PKR'} {order.pricing.advanceAmount?.toLocaleString()}
                  </div>
                  <div className="text-stone-600">Remaining Due on Delivery:</div>
                  <div className="font-mono font-semibold text-right text-stone-700">
                    {storeSettings?.currencySymbol || 'PKR'} {order.pricing.remainingBalance?.toLocaleString()}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-500">Payment Gateway/Method:</span>
                  <span className="font-bold uppercase font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                    {order.payment?.method || 'Bank Transfer'}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-500 uppercase tracking-wider">Current Verification State:</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      order.payment?.paymentStatus === 'advance_verified'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : order.payment?.paymentStatus === 'rejected'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {(order.payment?.paymentStatus || 'pending').replace(/_/g, ' ')}
                  </span>
                </div>
                {order.payment?.verifiedAt && (
                  <div className="text-[11px] text-stone-500 font-mono">
                    Verified on: {new Date(order.payment.verifiedAt).toLocaleString()} by {order.payment.verifiedBy || 'Admin'}
                  </div>
                )}
              </div>

              {/* Admin Internal Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Accounting Verification Note
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Bank statement transaction ID confirmed by Meezan online banking..."
                  rows={3}
                  className="w-full text-xs p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#C59A27] focus:border-[#C59A27] bg-white text-stone-800"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone-200 flex items-center justify-between space-x-3">
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusChange('rejected')}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Flag Invalid</span>
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusChange('advance_verified')}
                className="flex-1 flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify &amp; Approve Advance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
