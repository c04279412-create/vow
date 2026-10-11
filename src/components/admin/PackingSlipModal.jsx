'use client';

import React from 'react';
import { Printer, X, MapPin, User, Phone, Mail, FileText, Sparkles, Truck, CheckCircle2 } from 'lucide-react';

function getCustomDetails(item) {
  const raw = item.customTextInputs || item.customFieldValues || item.customInputs || {};
  if (raw instanceof Map) {
    return Object.fromEntries(raw);
  }
  if (typeof raw === 'object' && raw !== null) {
    return raw;
  }
  return {};
}

export default function PackingSlipModal({ order, storeSettings, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const customer = order.customer || {};
  const customerName = customer.fullName || order.customerName || 'Valued Customer';
  const customerPhone = customer.phone || order.customerPhone || 'N/A';
  const customerEmail = customer.email || order.customerEmail || 'N/A';
  const customerAddress = customer.address || order.customerAddress || 'N/A';
  const customerCity = customer.city || order.customerCity || '';
  const customerProvince = customer.province || order.customerProvince || 'Pakistan';
  const customerPostalCode = customer.postalCode || order.customerPostalCode || '';
  const customerNotes = customer.notes || order.customerNotes || '';

  const pricing = order.pricing || {};
  const subtotal = Number(pricing.subtotal) || 0;
  const shippingFee = Number(pricing.shippingFee) || 0;
  const totalAmount = Number(pricing.totalAmount) || (subtotal + shippingFee);
  const advanceAmount = Number(pricing.advanceAmount) || 0;
  const advancePercentage = Number(pricing.advancePercentage) || 0;
  const remainingBalance = Number(pricing.remainingBalance) || (totalAmount - advanceAmount);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Modal Action Bar */}
        <div className="px-6 py-3.5 bg-stone-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center space-x-2.5">
            <Printer className="w-5 h-5 text-[#E3C677]" />
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base">Order Dispatch & Packing Slip</h3>
              <p className="text-[11px] text-stone-400 font-mono">Invoice #{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#C59A27] hover:bg-[#A47A1A] text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div
          id="printable-packing-slip"
          className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 bg-white text-stone-900 font-sans print:p-4 print:space-y-4 print:text-black"
        >
          {/* 1. Header with Store Branding & Order Bar */}
          <div className="flex items-start justify-between border-b-2 border-stone-900 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                {storeSettings?.storeLogo && (
                  <img
                    src={storeSettings.storeLogo}
                    alt={storeSettings.storeName}
                    className="w-12 h-12 object-cover rounded-lg border border-amber-300 print:w-10 print:h-10"
                  />
                )}
                <div>
                  <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                    {storeSettings?.storeName?.split('|')[0]?.trim() || 'VOWCRAFTS'}
                  </h1>
                  <p className="text-[11px] uppercase tracking-widest text-[#C59A27] font-bold">
                    {storeSettings?.tagline || 'Bespoke Wedding Frames & Luxury Keepsakes'}
                  </p>
                </div>
              </div>
              <div className="text-xs text-stone-600 space-y-0.5 pt-1.5 font-mono">
                <div>WhatsApp Concierge: {storeSettings?.whatsappNumber || '+92 300 8472910'}</div>
                <div>Web: www.vowcrafts.com</div>
              </div>
            </div>

            <div className="text-right space-y-1 font-mono">
              <div className="text-xs text-stone-500 uppercase tracking-widest font-sans font-bold">
                OFFICIAL PACKING SLIP
              </div>
              <div className="text-2xl font-extrabold text-stone-900 tracking-tight">
                {order.orderNumber}
              </div>
              <div className="text-xs text-stone-600">
                Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' }) : new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
              </div>
              <div className="inline-block mt-1 px-3 py-0.5 bg-stone-100 rounded text-[11px] font-bold border border-stone-300 text-stone-800 uppercase">
                {order.orderStatus?.replace(/_/g, ' ') || 'NEW ORDER'}
              </div>
            </div>
          </div>

          {/* 2. Side-by-Side Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2">
            
            {/* SIDE A: DELIVERY & CUSTOMER PROFILE */}
            <div className="p-4 rounded-xl border border-stone-300 bg-stone-50/60 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#C59A27]" />
                  <span>Delivery Address & Customer Info</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                  Recipient Side
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Recipient Customer Name:</span>
                  <span className="text-sm font-bold text-stone-900 block">{customerName}</span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Delivery Street Address:</span>
                  <span className="font-medium text-stone-800 text-xs leading-snug block">
                    {customerAddress}
                  </span>
                  {(customerCity || customerProvince) && (
                    <span className="text-xs font-semibold text-stone-700 block mt-0.5">
                      {customerCity ? `${customerCity}, ` : ''}{customerProvince} {customerPostalCode}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/80">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Phone / WhatsApp:</span>
                    <span className="font-mono font-bold text-stone-900 text-xs block">{customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Email / Gmail:</span>
                    <span className="font-mono font-medium text-stone-900 text-xs block truncate" title={customerEmail}>
                      {customerEmail}
                    </span>
                  </div>
                </div>

                {customerNotes && (
                  <div className="pt-2 border-t border-stone-200/80">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Courier & Delivery Instructions:</span>
                    <span className="text-stone-700 italic block">{customerNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* SIDE B: CUSTOMIZED DETAILS & ARTISAN INPUTS */}
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C59A27]" />
                  <span>Customized Details (Customer Specifications)</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                  Customization Side
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {(order.items || []).map((item, idx) => {
                  const customDetails = getCustomDetails(item);
                  const hasCustomFields = Object.keys(customDetails).length > 0;
                  const hasPhotos = Array.isArray(item.uploadedPhotos) && item.uploadedPhotos.length > 0;

                  return (
                    <div key={idx} className="space-y-2 pb-2.5 last:pb-0 last:border-b-0 border-b border-amber-200/80">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">
                          {item.productName || item.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-bold">
                          Qty: {item.quantity || 1}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-3 text-[11px] text-stone-600">
                        {item.selectedSize && (
                          <span>Size: <strong className="text-stone-800">{item.selectedSize}</strong></span>
                        )}
                        {item.selectedColor && (
                          <span>Finish: <strong className="text-stone-800">{item.selectedColor}</strong></span>
                        )}
                      </div>

                      {/* Customized Names & Specific Text Fields */}
                      {hasCustomFields ? (
                        <div className="bg-white/90 p-2.5 rounded-lg border border-amber-300/80 space-y-1.5 shadow-2xs">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#A47A1A]">
                            Customer Written Details:
                          </div>
                          <div className="space-y-1">
                            {Object.entries(customDetails).map(([key, val]) => {
                              if (!val) return null;
                              return (
                                <div key={key} className="flex items-baseline text-xs">
                                  <span className="font-semibold text-stone-600 capitalize w-36 shrink-0 text-[11px]">
                                    {key.replace(/_/g, ' ')}:
                                  </span>
                                  <span className="font-bold text-stone-900">{String(val)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-stone-500 italic bg-white/70 p-2 rounded border border-amber-200">
                          No text customization required for this item.
                        </div>
                      )}

                      {/* Photo upload status */}
                      {hasPhotos && (
                        <div className="text-[11px] text-stone-700 bg-white/80 p-2 rounded border border-amber-200 flex items-center gap-1.5">
                          <span>📷</span>
                          <span><strong>{item.uploadedPhotos.length} Custom Photos</strong> submitted for frame composition.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 3. Itemized Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ordered Keepsakes & Delivery Summary
            </h4>
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-700 text-[11px] font-bold uppercase border-b border-stone-300">
                  <tr>
                    <th className="p-3">Product Name & Variation</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-center">Courier Fee</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {(order.items || []).map((item, idx) => {
                    const itemPrice = Number(item.price || item.unitPrice || 0);
                    const itemQty = Number(item.quantity) || 1;
                    const itemDel = Number(item.deliveryCharges) || 0;
                    return (
                      <tr key={idx} className="align-middle">
                        <td className="p-3">
                          <div className="font-bold text-stone-900">{item.productName || item.name}</div>
                          <div className="text-[11px] text-stone-500">
                            {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                            {item.selectedSize && item.selectedColor ? ' | ' : ''}
                            {item.selectedColor ? `Finish: ${item.selectedColor}` : ''}
                          </div>
                        </td>
                        <td className="p-3 text-center font-bold text-stone-800">{itemQty}</td>
                        <td className="p-3 text-center font-mono">
                          {itemDel > 0 ? `Rs. ${itemDel.toLocaleString()}` : <span className="text-emerald-700 font-semibold">FREE</span>}
                        </td>
                        <td className="p-3 text-right font-mono">
                          Rs. {itemPrice.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-stone-900">
                          Rs. {(itemPrice * itemQty).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Financial Calculation & Cash on Delivery (COD) Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-3 border-t border-stone-300">
            <div className="max-w-sm text-xs text-stone-500 space-y-1.5">
              <div className="font-bold text-stone-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quality Inspected & Dispatched with Fragile Care:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Handcrafted bespoke piece protected with optical acrylic, multi-layer cushioning, and reinforced protective casing for nationwide transit.
              </p>
            </div>

            <div className="w-full sm:w-80 space-y-2 text-xs font-mono ml-auto">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Courier Delivery Charges:</span>
                <span>{shippingFee === 0 ? <span className="text-emerald-700 font-bold">FREE DELIVERY</span> : `Rs. ${shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-300 pt-1.5">
                <span>Total Amount:</span>
                <span>Rs. {totalAmount.toLocaleString()}</span>
              </div>

              {advanceAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <span>Advance Deposit Paid ({advancePercentage}%):</span>
                  <span>- Rs. {advanceAmount.toLocaleString()}</span>
                </div>
              )}

              {/* High Visibility Cash on Delivery Collection Amount */}
              <div className="p-3 rounded-xl bg-amber-50 border-2 border-[#C59A27] text-stone-900 mt-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  <span>Balance Due on Delivery:</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#C59A27] text-white text-[10px]">CASH ON DELIVERY</span>
                </div>
                <div className="flex items-baseline justify-between mt-1 pt-1 border-t border-amber-200">
                  <span className="text-xs text-stone-600 font-sans">Collect from Customer:</span>
                  <span className="font-sans font-extrabold text-xl text-stone-900">
                    Rs. {remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Footer */}
          <div className="pt-4 border-t border-stone-300 text-center text-[11px] text-stone-500 font-serif">
            Thank you for choosing {storeSettings?.storeName?.split('|')[0]?.trim() || 'VowCrafts'}. For queries, reach us on WhatsApp: {storeSettings?.whatsappNumber || '+92 300 8472910'}.
          </div>

        </div>
      </div>
    </div>
  );
}
