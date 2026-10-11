'use client';

import React, { useState } from 'react';
import { Truck, X, Mail, CheckCircle2, Send, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';

export default function CourierTrackingModal({ order, storeSettings, onClose, onSaveTracking }) {
  if (!order) return null;

  const [courierName, setCourierName] = useState(order.tracking?.courierName || 'TCS Express');
  const [trackingId, setTrackingId] = useState(order.tracking?.trackingId || '');
  const [trackingUrl, setTrackingUrl] = useState(order.tracking?.trackingUrl || '');
  const [orderStatus, setOrderStatus] = useState(order.orderStatus || 'shipped');
  const [customMessage, setCustomMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(Boolean(order.customer?.email));
  const [saving, setSaving] = useState(false);

  // Auto-generate courier tracking URL based on carrier name and tracking ID
  const handleTrackingIdChange = (id) => {
    setTrackingId(id);
    if (!id.trim()) return;

    if (courierName.includes('TCS')) {
      setTrackingUrl(`https://www.tcsexpress.com/track/${id.trim()}`);
    } else if (courierName.includes('Leopard')) {
      setTrackingUrl(`https://leopardscourier.com/tracking?track_id=${id.trim()}`);
    } else if (courierName.includes('Trax')) {
      setTrackingUrl(`https://trax.pk/tracking?tracking_number=${id.trim()}`);
    } else if (courierName.includes('Call Courier')) {
      setTrackingUrl(`https://callcourier.com.pk/tracking/?tc=${id.trim()}`);
    } else if (courierName.includes('M&P')) {
      setTrackingUrl(`https://mulphilog.com/tracking?cn=${id.trim()}`);
    }
  };

  const handleCourierSelect = (cName) => {
    setCourierName(cName);
    if (trackingId.trim()) {
      handleTrackingIdChange(trackingId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const trackingData = {
      courierName,
      trackingId: trackingId.trim(),
      trackingUrl: trackingUrl.trim(),
      dispatchedAt: orderStatus === 'shipped' ? new Date().toISOString() : order.tracking?.dispatchedAt || null,
      notes: customMessage,
    };

    await onSaveTracking(order.id, {
      orderStatus,
      tracking: trackingData,
      sendEmail,
      customMessage,
    });

    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Truck className="w-5 h-5 text-[#E3C677]" />
            <div>
              <h3 className="font-serif font-bold text-base">Courier Tracking & Production Status</h3>
              <p className="text-xs text-[#E3C677] font-mono">
                Order #{order.orderNumber} • Customer: {order.customer.fullName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1 bg-[#FAF7F2]">
          {/* Production Status Select */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2 shadow-xs">
            <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              Set Production / Delivery Status
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
              className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-bold uppercase text-xs"
            >
              <option value="new">New Order (Awaiting Review)</option>
              <option value="in_production">In Production (Artisan Handcrafting)</option>
              <option value="ready_to_ship">Ready To Ship (Packaging & Quality Approved)</option>
              <option value="shipped">Shipped (Dispatched with Courier)</option>
              <option value="delivered">Delivered (Handed to Customer)</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Courier Company & Consignment Bar */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-4 shadow-xs">
            <div>
              <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                Courier Partner Company
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {['TCS Express', 'Leopard Courier', 'Trax Logistics', 'Call Courier', 'M&P Express', 'Other / DHL'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCourierSelect(c)}
                    className={`py-1.5 px-2 rounded-lg text-center font-bold text-xs transition border ${
                      courierName === c
                        ? 'bg-[#1C1917] text-white border-[#C59A27]'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="Or type custom courier name..."
                className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 font-medium text-xs mt-1"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                Consignment / Tracking Number (CN #)
              </label>
              <input
                type="text"
                value={trackingId}
                onChange={(e) => handleTrackingIdChange(e.target.value)}
                placeholder="e.g. TCS-772910442 or 9283719"
                className="w-full p-2.5 border border-stone-300 rounded-lg bg-stone-50 font-mono text-sm font-bold focus:ring-1 focus:ring-[#C59A27]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                Online Tracking Web Link (URL)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 p-2 border border-stone-300 rounded-lg bg-stone-50 font-mono text-xs"
                />
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg"
                    title="Test Tracking Link"
                  >
                    <ExternalLink className="w-4 h-4 text-[#A47A1A]" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Customer Gmail Notification Card */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 text-[#C59A27] rounded border-stone-300 focus:ring-[#C59A27]"
                />
                <span className="font-bold text-stone-900 text-xs flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C59A27]" />
                  <span>Send Live Milestone Email to Customer's Gmail</span>
                </span>
              </label>
              <span className="text-[10px] font-mono text-[#A47A1A] font-bold">
                {order.customer.email ? order.customer.email : 'No email provided'}
              </span>
            </div>

            {sendEmail && (
              <div className="space-y-2 pt-2 border-t border-amber-200">
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  A luxury HTML email will be dispatched to <strong>{order.customer.email || 'customer'}</strong> containing the new status ({orderStatus.replace(/_/g, ' ')}), Courier Name ({courierName}), Tracking Number, and direct tracking link!
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-stone-700 mb-1">
                    Optional Custom Note for Customer in Email:
                  </label>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="e.g. Your bespoke frame was inspected by Master Artisan Asad. It is carefully packed with protective foam."
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
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
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-[#C59A27] hover:bg-[#A47A1A] text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 text-xs"
            >
              <Send className="w-4 h-4" />
              <span>{saving ? 'Updating & Sending...' : 'Update Status & Dispatch Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
