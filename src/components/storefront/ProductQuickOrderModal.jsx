'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle,
  Truck,
  Heart,
  Clock,
  Camera,
  FileText,
  CreditCard,
  Copy,
  Upload,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import CustomDateInput from './CustomDateInput';

export default function ProductQuickOrderModal({
  product,
  storeSettings,
  onClose,
  onOrderSuccess,
}) {
  if (!product) return null;

  const [selectedImage, setSelectedImage] = useState(
    product.images?.[0] || '/images/hero_banner.jpg'
  );

  // Variant selections
  const [selectedSize, setSelectedSize] = useState(
    product.sizes?.[0] || { name: 'Standard (12x18 in)', priceAdjustment: 0 }
  );
  const [selectedColor, setSelectedColor] = useState(
    product.frameColors?.[0] || { name: 'Imperial 24K Gold Foil', hex: '#D4AF37', priceAdjustment: 0 }
  );

  // Custom text fields
  const [customTextInputs, setCustomTextInputs] = useState(() => {
    const initial = {};
    if (product.customFields && product.customFields.length > 0) {
      product.customFields.forEach((f) => {
        initial[f.fieldId || f.label] = '';
      });
    } else {
      initial['bride_name'] = '';
      initial['groom_name'] = '';
      initial['nikkah_date'] = '';
    }
    return initial;
  });

  // Customer contact info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('Lahore');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Advance Payment Transfer Slip state (Quick Order)
  const [paymentSlipFile, setPaymentSlipFile] = useState(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState(null);
  const [copiedIBAN, setCopiedIBAN] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);

  // Post-order receipt upload state
  const [postOrderSlipFile, setPostOrderSlipFile] = useState(null);
  const [postOrderSlipPreview, setPostOrderSlipPreview] = useState(null);
  const [postOrderUploading, setPostOrderUploading] = useState(false);
  const [postOrderUploadSuccess, setPostOrderUploadSuccess] = useState(false);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  // Flags for customization features
  const hasSizesEnabled = Boolean(
    product.hasSizeVariations !== false &&
    Array.isArray(product.sizes) &&
    product.sizes.length > 0
  );

  const hasTextCustomization = Boolean(
    product.allowTextCustomization === true ||
    (product.allowTextCustomization !== false && (
      product.productType === 'TYPE_B' ||
      (Array.isArray(product.customFields) && product.customFields.length > 0)
    ))
  );

  // Pricing calculations
  const basePrice = Number(product.basePrice) || 4500;
  const sizeAdjustment = hasSizesEnabled ? (Number(selectedSize?.priceAdjustment) || 0) : 0;
  const colorAdjustment = Array.isArray(product.frameColors) && product.frameColors.length > 0 ? (Number(selectedColor?.priceAdjustment) || 0) : 0;
  const itemTotal = basePrice + sizeAdjustment + colorAdjustment;
  const shippingFee = Number(product.deliveryCharges) || 0;
  const grandTotal = itemTotal + shippingFee;

  const isAdvanceEnabled = Boolean(storeSettings?.enableAdvancePayment) && (Number(storeSettings?.advancePaymentPercentage) || 0) > 0;
  const advancePercentage = storeSettings?.advancePaymentPercentage || 10;
  const advanceAmount = isAdvanceEnabled ? Math.round((grandTotal * advancePercentage) / 100) : 0;
  const remainingCOD = grandTotal - advanceAmount;

  const copyToClipboard = (text, type) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      if (type === 'iban') {
        setCopiedIBAN(true);
        setTimeout(() => setCopiedIBAN(false), 2000);
      } else if (type === 'account') {
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
      } else if (type === 'mobile') {
        setCopiedMobile(true);
        setTimeout(() => setCopiedMobile(false), 2000);
      }
    }
  };

  const handleSelectSlip = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentSlipFile(file);
      const reader = new FileReader();
      reader.onload = () => setPaymentSlipPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPostOrderSlip = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostOrderSlipFile(file);
      const reader = new FileReader();
      reader.onload = () => setPostOrderSlipPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePostOrderUploadSlip = async (e) => {
    if (e) e.preventDefault();
    if (!postOrderSlipFile) return;

    setPostOrderUploading(true);
    setPostOrderUploadSuccess(false);
    try {
      const fd = new FormData();
      fd.append('file', postOrderSlipFile);
      const upRes = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.success || !upData.url) {
        throw new Error(upData.error || 'Failed to upload receipt screenshot');
      }

      const newUrl = upData.url;
      const orderIdentifier = orderComplete.id || orderComplete.orderNumber;

      const updateRes = await fetch(`/api/orders/${orderIdentifier}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment: {
            ...(orderComplete.payment || {}),
            paymentScreenshotUrl: newUrl,
            paymentStatus: 'pending_verification',
          },
          timelineEvent: {
            status: 'receipt_uploaded',
            message: 'Customer submitted advance payment transfer screenshot.',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const updateData = await updateRes.json();
      if (updateData.success && updateData.order) {
        setOrderComplete(updateData.order);
      } else {
        setOrderComplete((prev) => ({
          ...prev,
          payment: {
            ...(prev.payment || {}),
            paymentScreenshotUrl: newUrl,
            paymentStatus: 'pending_verification',
          },
        }));
      }
      setPostOrderUploadSuccess(true);
      setPostOrderSlipFile(null);
      setPostOrderSlipPreview(null);
    } catch (err) {
      alert(err.message || 'Failed to upload receipt. Please send via WhatsApp.');
    } finally {
      setPostOrderUploading(false);
    }
  };

  const handleTextChange = (fieldKey, value) => {
    setCustomTextInputs((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleDirectWhatsApp = () => {
    const rawNumber = (storeSettings?.whatsappNumber || '923008472910').replace(/[^0-9]/g, '');
    let customTextSummary = '';
    Object.entries(customTextInputs).forEach(([k, v]) => {
      if (v) customTextSummary += `\n• ${k.replace(/_/g, ' ')}: *${v}*`;
    });

    const msg = `✨ *New Order Inquiry from VowCrafts Storefront*
---------------------------------------
💍 *Product:* ${product.name}
📐 *Size / Variation:* ${selectedSize?.name || 'Standard'}
🎨 *Finish / Color:* ${selectedColor?.name || 'Gold'}
💰 *Total Price:* PKR ${itemTotal.toLocaleString()}
${isAdvanceEnabled ? `💵 *Advance (${advancePercentage}%):* PKR ${advanceAmount.toLocaleString()}` : '💵 *Payment Terms:* 100% Cash on Delivery (COD)'}
${customTextSummary ? `\n📝 *Custom Names & Dates:*${customTextSummary}` : ''}
${customerName ? `\n👤 *Customer:* ${customerName}` : ''}
${customerCity ? `📍 *City:* ${customerCity}` : ''}

Please confirm slot availability for this bespoke creation!`;

    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your full name and WhatsApp contact number.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedSlipUrl = '';
      if (isAdvanceEnabled && paymentSlipFile) {
        try {
          const fd = new FormData();
          fd.append('file', paymentSlipFile);
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            body: fd,
          });
          const upData = await upRes.json();
          if (upData.success && upData.url) {
            uploadedSlipUrl = upData.url;
          }
        } catch (err) {
          console.warn('Slip upload failed in quick order modal:', err);
        }
      }

      const orderPayload = {
        orderNumber: `VC-${Date.now().toString().slice(-6)}`,
        customer: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          city: customerCity.trim(),
          address: customerAddress.trim() || `${customerCity}, Pakistan`,
          notes: customerNotes.trim(),
        },
        items: [
          {
            productId: product.id || product._id,
            productName: product.name,
            productType: product.productType || 'TYPE_B',
            selectedSize: selectedSize?.name,
            selectedColor: selectedColor?.name,
            quantity: 1,
            unitPrice: itemTotal,
            price: itemTotal,
            customTextInputs,
            deliveryCharges: shippingFee,
          },
        ],
        pricing: {
          subtotal: itemTotal,
          discountAmount: 0,
          shippingFee,
          totalAmount: grandTotal,
          advancePercentage,
          advanceAmount,
          remainingBalance: remainingCOD,
        },
        payment: {
          paymentMethod: isAdvanceEnabled ? 'Bank Transfer + COD' : '100% Cash on Delivery',
          paymentStatus: uploadedSlipUrl ? 'pending_verification' : (isAdvanceEnabled ? 'pending_deposit' : 'confirmed'),
          paymentScreenshotUrl: uploadedSlipUrl || '',
        },
        orderStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.success) {
        setOrderComplete(data.order || orderPayload);
        if (onOrderSuccess) onOrderSuccess(data.order || orderPayload);
      } else {
        alert(data.message || 'Could not place order. Please try again.');
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      // Fallback local completion
      setOrderComplete({
        orderNumber: `VC-${Date.now().toString().slice(-6)}`,
        pricing: { totalAmount: itemTotal, advanceAmount, remainingBalance: remainingCOD },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between border-b border-[#C59A27]/30">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-[#E3C677]" />
            <span className="font-serif font-bold text-sm sm:text-base text-[#FAF7F2]">
              Customize &amp; Order Bespoke Keepsake
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {orderComplete ? (
          <div className="p-8 text-center space-y-6 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B5936C]">
                Artisan Booking Confirmed
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Alhamdulillah! Your Order is Placed
              </h3>
              <p className="text-stone-600 text-sm max-w-md mx-auto">
                Order <span className="font-mono font-bold text-stone-900">#{orderComplete.orderNumber}</span> has been logged. Our calligraphy atelier team has initiated your drafting queue.
              </p>
            </div>

            {/* Advance payment instructions & Receipt Upload */}
            {(isAdvanceEnabled || (orderComplete.pricing?.advanceAmount > 0)) && (
              <div className="max-w-md mx-auto space-y-3.5 text-left">
                <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-stone-700">Advance Deposit ({orderComplete.pricing?.advancePercentage || advancePercentage}%):</span>
                    <span className="font-mono text-base font-bold text-[#A47A1A]">
                      PKR {(orderComplete.pricing?.advanceAmount || advanceAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>Remaining Due on Delivery (COD):</span>
                    <span className="font-mono font-semibold">
                      PKR {(orderComplete.pricing?.remainingBalance || remainingCOD).toLocaleString()}
                    </span>
                  </div>

                  {/* Bank Details with Copy IBAN */}
                  <div className="p-3.5 bg-stone-900 text-white rounded-xl border border-[#C59A27]/40 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[#E3C677] flex items-center space-x-1.5">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{storeSettings?.bankDetails?.bankName || 'Meezan Bank Limited'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712', 'iban')}
                        className="text-[10px] text-stone-300 hover:text-white flex items-center space-x-1 bg-stone-800 px-2.5 py-0.5 rounded transition cursor-pointer"
                      >
                        {copiedIBAN ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIBAN ? 'Copied' : 'Copy IBAN'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-stone-300 space-y-0.5">
                      <div>Title: <span className="font-bold text-white">{storeSettings?.bankDetails?.accountTitle || 'VowCrafts Art Studio'}</span></div>
                      <div>Account: <span className="text-white font-bold">{storeSettings?.bankDetails?.accountNumber || '02010103984712'}</span></div>
                      <div className="text-amber-300 text-[10px]">IBAN: {storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712'}</div>
                    </div>
                    <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                      Easypaisa / JazzCash: <span className="font-mono text-white font-bold">{storeSettings?.bankDetails?.easypaisaNumber || '0300-8472910'}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Upload / Status Card */}
                {(() => {
                  const currentSlip = orderComplete.payment?.paymentScreenshotUrl;
                  const hasValidSlip = Boolean(
                    currentSlip &&
                    currentSlip !== 'pending_customer_upload' &&
                    currentSlip.trim() !== '' &&
                    (currentSlip.startsWith('http') || currentSlip.startsWith('/uploads/') || currentSlip.startsWith('data:image'))
                  );

                  if (hasValidSlip) {
                    return (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center space-x-3">
                        <img
                          src={currentSlip}
                          alt="Receipt Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-stone-300 shrink-0"
                        />
                        <div className="flex-1 text-xs space-y-0.5">
                          <div className="font-bold text-emerald-950 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Payment Receipt Submitted</span>
                          </div>
                          <p className="text-[11px] text-stone-600">Pending artisan verification.</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2.5">
                      <div className="flex items-center space-x-2 text-xs font-bold text-stone-900">
                        <Upload className="w-4 h-4 text-[#A47A1A]" />
                        <span>Upload Advance Payment Slip / Screenshot</span>
                      </div>

                      {postOrderUploadSuccess && (
                        <div className="p-2 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          <span>Receipt uploaded successfully!</span>
                        </div>
                      )}

                      {postOrderSlipPreview ? (
                        <div className="bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={postOrderSlipPreview} alt="Slip" className="w-10 h-10 object-cover rounded border" />
                            <span className="text-[11px] font-bold text-stone-800 truncate max-w-[150px]">{postOrderSlipFile?.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setPostOrderSlipFile(null); setPostOrderSlipPreview(null); }}
                            className="text-stone-400 hover:text-rose-600 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center p-3 border-2 border-dashed border-stone-300 hover:border-[#C59A27] bg-white rounded-xl cursor-pointer text-xs transition">
                          <Upload className="w-4 h-4 text-stone-400 mr-2" />
                          <span className="text-stone-600 font-medium">Click to select receipt image</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleSelectPostOrderSlip} />
                        </label>
                      )}

                      {postOrderSlipFile && (
                        <button
                          type="button"
                          disabled={postOrderUploading}
                          onClick={handlePostOrderUploadSlip}
                          className="w-full py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                        >
                          {postOrderUploading ? 'Uploading...' : 'Submit Receipt'}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDirectWhatsApp}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition"
              >
                <Phone className="w-4 h-4" />
                <span>Send Receipt on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl font-semibold text-xs transition"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Visual Showcase & Gallery (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 shadow-xs relative">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-300 hover:scale-105"
                  />
                  {product.isBestSeller && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                          selectedImage === img ? 'border-[#C59A27] shadow-xs' : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Trust Pills */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1.5 text-[11px] text-stone-600">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B5936C] shrink-0" />
                    <span>Archival museum-grade paper &amp; 24K gold foil</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-3.5 h-3.5 text-[#B5936C] shrink-0" />
                    <span>Bubble-cushioned wooden crate delivery nationwide</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#B5936C] shrink-0" />
                    <span>Only {advancePercentage}% advance deposit required to start crafting</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customization & Form (7 cols) */}
              <div className="md:col-span-7 space-y-5">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#B5936C]">
                    {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-snug mt-0.5">
                    {product.name}
                  </h2>
                  <div className="flex items-baseline space-x-2 mt-1.5">
                    <span className="font-serif text-2xl font-bold text-stone-900">
                      PKR {itemTotal.toLocaleString()}
                    </span>
                    {product.salePrice && (
                      <span className="text-xs text-stone-400 line-through">
                        PKR {Number(product.salePrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. Size Variations (Uses Custom Section Title) */}
                {hasSizesEnabled && product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-800">
                      {product.sizeSectionTitle || 'Frame Size Variations'}:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {product.sizes.map((s, idx) => {
                        const isSelected = selectedSize?.name === s.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-50/60 border-[#C59A27] text-stone-900 shadow-2xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300'
                            }`}
                          >
                            <span className="text-xs font-semibold">{s.name}</span>
                            <span className="text-[10px] font-mono text-stone-500 mt-0.5">
                              {s.priceAdjustment > 0 ? `+PKR ${s.priceAdjustment.toLocaleString()}` : 'Included'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Color & Finish Variations (Uses Custom Section Title) */}
                {Array.isArray(product.frameColors) && product.frameColors.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-800">
                      {product.colorSectionTitle || 'Frame Colors & Finishes'}:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.frameColors.map((c, idx) => {
                        const isSelected = selectedColor?.name === c.name;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColor(c)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition ${
                              isSelected
                                ? 'bg-[#1C1917] text-white border-[#1C1917] shadow-xs'
                                : 'bg-white border-stone-200 text-stone-700 hover:border-stone-400'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: c.hex || '#D4AF37' }}
                            ></span>
                            <span>{c.name}</span>
                            {c.priceAdjustment > 0 && (
                              <span className="text-[10px] opacity-75 font-mono">
                                +{c.priceAdjustment}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Personalized Text Inputs (rendered only if text customization enabled in admin) */}
                {hasTextCustomization && (
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-900">
                        <FileText className="w-3.5 h-3.5 text-[#B5936C]" />
                        <span>Matrimonial &amp; Custom Inscription Details</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-semibold uppercase">Calligraphy queue</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {Array.isArray(product.customFields) && product.customFields.length > 0 ? (
                        product.customFields.map((field) => (
                          <div key={field.fieldId || field.label} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                            <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                              {field.label} {field.required && <span className="text-rose-500">*</span>}
                            </label>
                            {field.type === 'textarea' ? (
                              <textarea
                                rows={2}
                                value={customTextInputs[field.fieldId] || ''}
                                onChange={(e) => handleTextChange(field.fieldId, e.target.value)}
                                placeholder={field.placeholder || ''}
                                className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif text-xs"
                              />
                            ) : field.type === 'date' ? (
                              <CustomDateInput
                                value={customTextInputs[field.fieldId] || ''}
                                onChange={(val) => handleTextChange(field.fieldId, val)}
                                placeholder={field.placeholder || 'DD/MM/YYYY'}
                                className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif text-xs"
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={customTextInputs[field.fieldId] || ''}
                                onChange={(e) => handleTextChange(field.fieldId, e.target.value)}
                                placeholder={field.placeholder || ''}
                                className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif text-xs"
                              />
                            )}
                          </div>
                        ))
                      ) : (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                              Bride Name (Dulhan)
                            </label>
                            <input
                              type="text"
                              value={customTextInputs['bride_name'] || ''}
                              onChange={(e) => handleTextChange('bride_name', e.target.value)}
                              placeholder="e.g. Ayesha Noor"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                              Groom Name (Dulha)
                            </label>
                            <input
                              type="text"
                              value={customTextInputs['groom_name'] || ''}
                              onChange={(e) => handleTextChange('groom_name', e.target.value)}
                              placeholder="e.g. Hamza Tariq"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white font-serif"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-stone-700 mb-0.5">
                              Nikkah / Wedding Date &amp; Inscription
                            </label>
                            <input
                              type="text"
                              value={customTextInputs['nikkah_date'] || ''}
                              onChange={(e) => handleTextChange('nikkah_date', e.target.value)}
                              placeholder="e.g. 24th October 2026 | 'And We created you in pairs' (78:8)"
                              className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Customer Contact Info */}
                <div className="space-y-3 pt-1">
                  <div className="text-xs font-bold text-stone-800">
                    Your Shipping &amp; WhatsApp Details:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Your Full Name *"
                        required
                        className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="WhatsApp Number (0300...) *"
                        required
                        className="w-full p-2.5 border border-stone-300 rounded-xl bg-white font-mono"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={customerCity}
                        onChange={(e) => setCustomerCity(e.target.value)}
                        placeholder="Destination City (e.g. Lahore, Karachi)"
                        className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Delivery Street Address"
                        className="w-full p-2.5 border border-stone-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Pricing Breakdown & Action Buttons */}
                <div className="pt-3 border-t border-stone-200 space-y-3">
                  {isAdvanceEnabled ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                        <div>
                          <span className="font-bold text-stone-900 block">
                            Calculated {advancePercentage}% Advance Deposit:
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Remaining PKR {remainingCOD.toLocaleString()} paid on Cash on Delivery
                          </span>
                        </div>
                        <span className="font-mono text-lg font-bold text-[#A47A1A]">
                          PKR {advanceAmount.toLocaleString()}
                        </span>
                      </div>

                      {/* Bank Details & Copy */}
                      <div className="p-3 bg-stone-900 text-white rounded-xl border border-[#C59A27]/40 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-[#E3C677] flex items-center space-x-1">
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{storeSettings?.bankDetails?.bankName || 'Meezan Bank Limited'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712', 'iban')}
                            className="text-[10px] text-stone-300 hover:text-white flex items-center space-x-1 bg-stone-800 px-2 py-0.5 rounded transition cursor-pointer"
                          >
                            {copiedIBAN ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedIBAN ? 'Copied' : 'Copy IBAN'}</span>
                          </button>
                        </div>
                        <div className="text-[11px] font-mono text-stone-300 space-y-0.5">
                          <div>Title: <span className="text-white font-bold">{storeSettings?.bankDetails?.accountTitle || 'VowCrafts Art Studio'}</span></div>
                          <div>Account: <span className="text-white font-bold">{storeSettings?.bankDetails?.accountNumber || '02010103984712'}</span></div>
                          <div className="text-amber-300 text-[10px]">IBAN: {storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712'}</div>
                        </div>
                        <div className="text-[10px] text-stone-400 pt-1 border-t border-stone-800">
                          Easypaisa / JazzCash: <span className="font-mono text-white font-bold">{storeSettings?.bankDetails?.easypaisaNumber || '0300-8472910'}</span>
                        </div>
                      </div>

                      {/* Upload Receipt Slip */}
                      <div>
                        {paymentSlipPreview ? (
                          <div className="bg-stone-50 p-2 rounded-xl border border-stone-300 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <img src={paymentSlipPreview} alt="Preview" className="w-9 h-9 object-cover rounded-lg border shrink-0" />
                              <span className="text-[11px] font-bold text-stone-800 truncate max-w-[160px]">{paymentSlipFile?.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { setPaymentSlipFile(null); setPaymentSlipPreview(null); }}
                              className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center p-2.5 border-2 border-dashed border-stone-300 hover:border-[#C59A27] rounded-xl cursor-pointer bg-stone-50 transition text-center group">
                            <input type="file" accept="image/*" className="hidden" onChange={handleSelectSlip} />
                            <div className="text-stone-500 text-[11px] flex items-center space-x-1.5">
                              <Upload className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#C59A27]" />
                              <span>Attach payment transfer screenshot (Optional)</span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                      <div>
                        <span className="font-bold text-emerald-950 block">
                          100% Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          No advance required. Pay entire balance in cash upon delivery.
                        </span>
                      </div>
                      <span className="font-mono text-lg font-bold text-emerald-800">
                        PKR {itemTotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 bg-[#1C1917] hover:bg-stone-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-[#E3C677]" />
                      <span>{submitting ? 'Confirming Order...' : 'Confirm Bespoke Order Now'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDirectWhatsApp}
                      className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Chat on WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
