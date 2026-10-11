'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  ShieldCheck,
  CheckCircle,
  Truck,
  Sparkles,
  Phone,
  Copy,
  Lock,
  User,
  Mail,
  MapPin,
  ChevronRight,
  AlertCircle,
  Upload,
  CreditCard,
  RefreshCw,
  ExternalLink,
  FileText,
  Check,
  X,
  Image as ImageIcon,
} from 'lucide-react';

import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import StorefrontFooter from '@/components/storefront/StorefrontFooter';
import CustomerAuthModal from '@/components/storefront/CustomerAuthModal';
import { initialProducts, initialCategories, initialSettings } from '@/lib/dataStore';

export default function CartCheckoutPage() {
  const router = useRouter();

  const [storeSettings, setStoreSettings] = useState(initialSettings);
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Customer auth state
  const [customer, setCustomer] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectMessage, setAuthRedirectMessage] = useState('');

  // Checkout form details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerCity, setCustomerCity] = useState('Lahore');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Advance Payment Transfer Slip state (Checkout Form)
  const [paymentSlipFile, setPaymentSlipFile] = useState(null);
  const [paymentSlipPreview, setPaymentSlipPreview] = useState(null);
  const [copiedIBAN, setCopiedIBAN] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);

  // Post-order receipt upload state (Order Success Screen)
  const [postOrderSlipFile, setPostOrderSlipFile] = useState(null);
  const [postOrderSlipPreview, setPostOrderSlipPreview] = useState(null);
  const [postOrderUploading, setPostOrderUploading] = useState(false);
  const [postOrderUploadSuccess, setPostOrderUploadSuccess] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load persistent cart and customer
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('vowcrafts_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch (e) {}

    const loadCustomer = () => {
      try {
        const savedCust = localStorage.getItem('vowcrafts_customer');
        if (savedCust) {
          const parsed = JSON.parse(savedCust);
          if (parsed?.email) {
            setCustomer(parsed);
            if (!customerName) setCustomerName(parsed.fullName || '');
            if (!customerEmail) setCustomerEmail(parsed.email || '');
            if (!customerPhone) setCustomerPhone(parsed.phone || '');
            if (parsed.city && !customerCity) setCustomerCity(parsed.city);
            if (parsed.address && !customerAddress) setCustomerAddress(parsed.address);
          }
        } else {
          setCustomer(null);
        }
      } catch (e) {}
    };

    loadCustomer();
    window.addEventListener('vowcrafts_customer_changed', loadCustomer);

    // Fetch dynamic store settings
    fetch('/api/settings', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) setStoreSettings(data.settings);
      })
      .catch(() => {});

    fetch('/api/categories', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories) setCategories(data.categories);
      })
      .catch(() => {});

    fetch('/api/products', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products) setProducts(data.products);
      })
      .catch(() => {});

    setIsLoaded(true);

    return () => {
      window.removeEventListener('vowcrafts_customer_changed', loadCustomer);
    };
  }, []);

  const saveCart = (items) => {
    setCartItems(items);
    try {
      localStorage.setItem('vowcrafts_cart', JSON.stringify(items));
    } catch (e) {}
  };

  const handleUpdateQuantity = (itemId, newQty) => {
    if (newQty < 1) {
      handleRemoveItem(itemId);
      return;
    }
    const updated = cartItems.map((item, idx) =>
      item.id === itemId || idx === itemId ? { ...item, quantity: newQty } : item
    );
    saveCart(updated);
  };

  const handleRemoveItem = (itemId) => {
    const updated = cartItems.filter((item, idx) => item.id !== itemId && idx !== itemId);
    saveCart(updated);
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.price || item.basePrice || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const shippingFee = cartItems.reduce((acc, item) => {
    return acc + (Number(item.deliveryCharges) || 0) * (item.quantity || 1);
  }, 0);

  const grandTotal = subtotal + shippingFee;

  const isAdvanceEnabled =
    Boolean(storeSettings?.enableAdvancePayment) &&
    (Number(storeSettings?.advancePaymentPercentage) || 0) > 0;
  const advancePercentage = storeSettings?.advancePaymentPercentage || 10;
  const advanceAmount = isAdvanceEnabled ? Math.round((grandTotal * advancePercentage) / 100) : 0;
  const remainingCOD = grandTotal - advanceAmount;

  const rawWhatsapp = (storeSettings?.whatsappNumber || '923008472910').replace(/[^0-9]/g, '');

  const handleCopyIBAN = () => {
    const iban = storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712';
    navigator.clipboard?.writeText(iban);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  // Direct WhatsApp Order
  const handleDirectWhatsAppOrder = () => {
    // Require account
    if (!customer) {
      setAuthRedirectMessage('Please sign in or create an account with Gmail to place your order.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      setErrorMessage('Please enter your full name and delivery phone number.');
      return;
    }

    let summary = `✨ *NEW BESPOKE ORDER INQUIRY - VOWCRAFTS* ✨\n---------------------------------------\n`;
    cartItems.forEach((item, idx) => {
      summary += `\n*Item ${idx + 1}:* ${item.name}\n`;
      if (item.selectedSize) summary += `• Variation/Size: ${typeof item.selectedSize === 'object' ? item.selectedSize.name : item.selectedSize}\n`;
      if (item.selectedColor) summary += `• Finish/Color: ${typeof item.selectedColor === 'object' ? item.selectedColor.name : item.selectedColor}\n`;
      if (item.customFieldValues && Object.keys(item.customFieldValues).length > 0) {
        Object.entries(item.customFieldValues).forEach(([k, v]) => {
          if (v) summary += `• ${k.replace(/_/g, ' ')}: ${v}\n`;
        });
      }
      summary += `• Qty: ${item.quantity || 1} x PKR ${(item.price || item.basePrice || 0).toLocaleString()}\n`;
    });

    summary += `\n---------------------------------------`;
    summary += `\n💰 *Subtotal:* PKR ${subtotal.toLocaleString()}`;
    summary += `\n🚚 *Delivery:* ${shippingFee === 0 ? 'FREE' : `PKR ${shippingFee.toLocaleString()}`}`;
    summary += `\n👑 *Grand Total:* PKR ${grandTotal.toLocaleString()}`;
    if (isAdvanceEnabled) {
      summary += `\n💵 *Advance (${advancePercentage}%):* PKR ${advanceAmount.toLocaleString()}`;
      summary += `\n📦 *Balance on COD:* PKR ${remainingCOD.toLocaleString()}`;
    } else {
      summary += `\n💵 *Payment Terms:* 100% Cash on Delivery (COD)`;
    }
    summary += `\n\n👤 *Customer:* ${customerName.trim()} (${customerPhone.trim()})`;
    if (customer?.email) summary += `\n📧 *Gmail:* ${customer.email}`;
    summary += `\n📍 *Delivery Address:* ${customerAddress.trim() || customerCity}, ${customerCity}`;
    if (customerNotes) summary += `\n📝 *Notes:* ${customerNotes.trim()}`;

    window.open(`https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(summary)}`, '_blank');
  };

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

  // Place Order Action
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // REQUIRE CUSTOMER ACCOUNT
    if (!customer) {
      setAuthRedirectMessage('Please sign in or create an account with Gmail to complete your order.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage('Please fill in your full name, phone number, and delivery street address.');
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
        } catch (upErr) {
          console.warn('Receipt upload in checkout failed:', upErr);
        }
      }

      const orderPayload = {
        orderNumber: `VC-${Date.now().toString().slice(-6)}`,
        customerId: customer.id || null,
        customer: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          email: (customer?.email || '').trim(),
          city: customerCity.trim(),
          address: customerAddress.trim(),
          province: 'Punjab',
          postalCode: '',
          notes: customerNotes.trim(),
        },
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          productName: item.name,
          productType: item.productType || 'TYPE_B',
          price: item.price || item.basePrice || 0,
          quantity: item.quantity || 1,
          selectedSize: typeof item.selectedSize === 'object' ? item.selectedSize?.name : (item.selectedSize || 'Standard'),
          selectedColor: typeof item.selectedColor === 'object' ? item.selectedColor?.name : (item.selectedColor || 'Gold'),
          customTextInputs: item.customFieldValues || item.customTextInputs || {},
          uploadedPhotos: item.uploadedPhotos || [],
          deliveryCharges: Number(item.deliveryCharges) || 0,
        })),
        pricing: {
          subtotal,
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
        orderStatus: 'new',
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to place order. Please try again.');
        setSubmitting(false);
        return;
      }

      setOrderComplete(data.order || orderPayload);
      saveCart([]); // Clear cart upon successful order
    } catch (err) {
      setErrorMessage('Network error while placing order. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] flex flex-col font-sans selection:bg-[#C59A27]/20 selection:text-stone-900">
      {/* 1. Global Header */}
      <StorefrontHeader
        storeSettings={storeSettings}
        categories={categories}
        products={products}
        cartCount={cartItems.length}
        onOpenCart={() => {}}
      />

      {/* 2. Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectMessage={authRedirectMessage}
        onSuccess={(loggedCustomer) => {
          setCustomer(loggedCustomer);
          if (loggedCustomer.fullName) setCustomerName(loggedCustomer.fullName);
          if (loggedCustomer.email) setCustomerEmail(loggedCustomer.email);
          if (loggedCustomer.phone) setCustomerPhone(loggedCustomer.phone);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold text-stone-900">Shopping Bag &amp; Checkout</span>
        </nav>

        {/* ORDER SUCCESS SCREEN */}
        {orderComplete ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-stone-200 shadow-xl p-6 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B5936C]">
                Artisan Booking Confirmed
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Alhamdulillah! Your Order is Placed
              </h2>
              <p className="text-stone-600 text-xs sm:text-sm max-w-md mx-auto">
                Order <span className="font-mono font-bold text-stone-900">#{orderComplete.orderNumber}</span> has been logged. Our calligraphy atelier team has initiated your drafting queue.
              </p>
            </div>

            {/* Advance payment instructions & Receipt Management */}
            {(isAdvanceEnabled || (orderComplete.pricing?.advanceAmount > 0)) && (
              <div className="space-y-4">
                {/* 1. Advance Calculation Summary */}
                <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-stone-200 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="text-xs font-bold text-stone-700">Advance Deposit ({orderComplete.pricing?.advancePercentage || advancePercentage}%):</span>
                    <span className="font-mono text-base font-bold text-[#A47A1A]">
                      PKR {(orderComplete.pricing?.advanceAmount || advanceAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span>Remaining Due on Cash on Delivery:</span>
                    <span className="font-mono font-semibold">
                      PKR {(orderComplete.pricing?.remainingBalance || remainingCOD).toLocaleString()}
                    </span>
                  </div>

                  {/* 2. Bank & Mobile Account Details */}
                  <div className="p-4 bg-stone-900 text-white rounded-xl border border-[#C59A27]/40 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-[#E3C677] flex items-center space-x-1.5">
                        <CreditCard className="w-4 h-4" />
                        <span>{storeSettings?.bankDetails?.bankName || 'Meezan Bank Limited'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712', 'iban')}
                        className="text-[10px] text-stone-300 hover:text-white flex items-center space-x-1 bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded-md transition cursor-pointer"
                      >
                        {copiedIBAN ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIBAN ? 'IBAN Copied!' : 'Copy IBAN'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-stone-300 space-y-1">
                      <div>Title: <span className="font-bold text-white">{storeSettings?.bankDetails?.accountTitle || 'VowCrafts Art Studio'}</span></div>
                      <div className="flex items-center justify-between">
                        <span>Account: <span className="text-white font-bold">{storeSettings?.bankDetails?.accountNumber || '02010103984712'}</span></span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(storeSettings?.bankDetails?.accountNumber || '02010103984712', 'account')}
                          className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                        >
                          {copiedAccount ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="text-amber-300 text-[10px]">
                        IBAN: {storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712'}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
                      <span className="text-stone-300">
                        Easypaisa / JazzCash: <span className="font-mono font-bold text-white">{storeSettings?.bankDetails?.easypaisaNumber || '0300-8472910'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(storeSettings?.bankDetails?.easypaisaNumber || '03008472910', 'mobile')}
                        className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                      >
                        {copiedMobile ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Slip Upload / Receipt Status */}
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
                      <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl text-left space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                              Payment Receipt Attached
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                            {(orderComplete.payment?.paymentStatus || 'Under Review').replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3.5 bg-white p-3 rounded-xl border border-emerald-200">
                          <img
                            src={currentSlip}
                            alt="Payment Transfer Proof"
                            className="w-16 h-16 object-cover rounded-lg border border-stone-200 shadow-xs shrink-0"
                          />
                          <div className="flex-1 text-xs space-y-1">
                            <div className="font-bold text-stone-800">Transfer screenshot uploaded</div>
                            <p className="text-[11px] text-stone-500">
                              Our accounting team will verify your receipt and commence calligraphy production.
                            </p>
                            <a
                              href={currentSlip}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-[#A47A1A] hover:underline font-bold inline-flex items-center space-x-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View uploaded receipt</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="p-5 bg-amber-50/80 border-2 border-amber-300 rounded-2xl text-left space-y-3.5 shadow-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-[#A47A1A] flex items-center justify-center shrink-0">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                            Upload Payment Transfer Receipt / Screenshot
                          </h4>
                          <p className="text-[11px] text-stone-600">
                            Please transfer PKR {(orderComplete.pricing?.advanceAmount || advanceAmount).toLocaleString()} and attach your payment screenshot below:
                          </p>
                        </div>
                      </div>

                      {postOrderUploadSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Receipt uploaded successfully! Verification in progress.</span>
                        </div>
                      )}

                      {/* File Selector & Preview */}
                      {postOrderSlipPreview ? (
                        <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={postOrderSlipPreview}
                              alt="Receipt Preview"
                              className="w-14 h-14 object-cover rounded-lg border border-stone-300 shrink-0"
                            />
                            <div className="text-xs">
                              <div className="font-bold text-stone-800 max-w-[200px] truncate">{postOrderSlipFile?.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono">
                                {(postOrderSlipFile?.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setPostOrderSlipFile(null); setPostOrderSlipPreview(null); }}
                            className="text-stone-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-stone-300 hover:border-[#C59A27] bg-white rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center group">
                          <Upload className="w-6 h-6 text-stone-400 group-hover:text-[#C59A27] transition mb-1" />
                          <span className="text-xs font-bold text-stone-800">
                            Click to select payment transfer screenshot
                          </span>
                          <span className="text-[10px] text-stone-400 mt-0.5">
                            Bank transfer screenshot, ATM receipt, or Easypaisa / JazzCash receipt
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSelectPostOrderSlip}
                          />
                        </label>
                      )}

                      {postOrderSlipFile && (
                        <button
                          type="button"
                          disabled={postOrderUploading}
                          onClick={handlePostOrderUploadSlip}
                          className="w-full py-3 bg-[#1C1917] hover:bg-stone-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#E3C677]" />
                          <span>{postOrderUploading ? 'Uploading Receipt...' : 'Submit Receipt for Verification'}</span>
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
                onClick={handleDirectWhatsAppOrder}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Send Order Receipt on WhatsApp</span>
              </button>
              <Link
                href="/categories/all"
                className="w-full sm:w-auto px-6 py-3.5 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl font-semibold text-xs transition text-center"
              >
                Continue Browsing
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* EMPTY CART VIEW */
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-12 text-center max-w-lg mx-auto space-y-5">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-xl text-stone-900">
                Your Shopping Bag is Empty
              </h3>
              <p className="text-xs text-stone-500">
                Explore our collection of bespoke 24K gold foil frames and handcrafted keepsakes.
              </p>
            </div>
            <Link
              href="/categories/all"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1C1917] hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <span>Explore All Keepsakes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* ACTIVE CART & CHECKOUT PAGE */
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Your Shopping Bag &amp; Checkout
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                Review your bespoke creations and provide delivery details for your personalized dispatch.
              </p>
            </div>

            {errorMessage && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-rose-800 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Cart Items (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
                  <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-stone-900">
                      Bag Items ({cartItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => saveCart([])}
                      className="text-xs text-stone-400 hover:text-rose-600 transition"
                    >
                      Clear Bag
                    </button>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {cartItems.map((item, idx) => (
                      <div key={item.id || idx} className="p-5 flex flex-col sm:flex-row gap-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          <img
                            src={item.image || '/images/hero_banner.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-snug">
                                {item.name}
                              </h4>
                              {item.selectedSize && (
                                <p className="text-xs text-stone-500 mt-0.5">
                                  Size: <span className="font-semibold text-stone-800">{typeof item.selectedSize === 'object' ? item.selectedSize.name : item.selectedSize}</span>
                                </p>
                              )}
                              {item.selectedColor && (
                                <p className="text-xs text-stone-500">
                                  Finish: <span className="font-semibold text-stone-800">{typeof item.selectedColor === 'object' ? item.selectedColor.name : item.selectedColor}</span>
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id || idx)}
                              className="p-1 text-stone-400 hover:text-rose-600 transition"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Customization Details Summary */}
                          {item.customFieldValues && Object.keys(item.customFieldValues).length > 0 && (
                            <div className="p-2.5 bg-stone-50 rounded-xl text-[11px] text-stone-600 border border-stone-200/80 space-y-0.5">
                              {Object.entries(item.customFieldValues).map(([k, v]) => (
                                v ? (
                                  <div key={k} className="flex gap-1.5">
                                    <span className="font-semibold text-stone-700 capitalize">{k.replace(/_/g, ' ')}:</span>
                                    <span className="text-stone-900 font-serif">{v}</span>
                                  </div>
                                ) : null
                              ))}
                            </div>
                          )}

                          {/* Delivery indicator */}
                          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
                            <Truck className="w-3.5 h-3.5 text-[#B5936C]" />
                            <span>
                              Delivery: {Number(item.deliveryCharges) > 0 ? `PKR ${Number(item.deliveryCharges).toLocaleString()}` : 'Free Express Delivery'}
                            </span>
                          </div>

                          {/* Quantity & Price */}
                          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                            <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 h-8 px-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id || idx, (item.quantity || 1) - 1)}
                                className="w-6 text-center text-stone-600 hover:text-stone-900 font-bold"
                              >
                                -
                              </button>
                              <span className="px-2 font-mono font-bold text-xs text-stone-900">
                                {item.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(item.id || idx, (item.quantity || 1) + 1)}
                                className="w-6 text-center text-stone-600 hover:text-stone-900 font-bold"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-serif font-bold text-sm sm:text-base text-stone-900">
                              PKR {((item.price || item.basePrice || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href="/categories/all"
                  className="inline-flex items-center space-x-1.5 text-xs text-stone-600 hover:text-stone-900 font-semibold transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Add More Bespoke Keepsakes</span>
                </Link>
              </div>

              {/* RIGHT COLUMN: Customer Details & Order Checkout Form (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-5">
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                      Delivery &amp; Customer Details
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Where should our courier dispatch your handcrafted piece?
                    </p>
                  </div>

                  {/* Customer Account Status Box */}
                  {customer ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-emerald-900">Signed In: {customer.fullName}</div>
                          <div className="text-[11px] text-emerald-700 font-mono">{customer.email}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-[11px] font-bold text-emerald-800 hover:underline"
                      >
                        Account
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-[#A47A1A]">
                        <Lock className="w-4 h-4" />
                        <span>Patron Account Required to Confirm Order</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Please sign in or create an account with your Gmail to verify your booking and receive draft proofs.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthRedirectMessage('Sign in or register with Gmail to complete your order.');
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-[#E3C677]" />
                        <span>Sign In or Register with Gmail</span>
                      </button>
                    </div>
                  )}

                  {/* Delivery Inputs */}
                  <form onSubmit={handlePlaceOrder} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ayesha Noor / Hamza Tariq"
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        WhatsApp Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="0300-8472910"
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-mono focus:bg-white focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-stone-800 mb-1">
                          City <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerCity}
                          onChange={(e) => setCustomerCity(e.target.value)}
                          placeholder="e.g. Lahore"
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-stone-800 mb-1">
                          Delivery Street Address <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="House #, Street #, Phase / Area"
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Special Instructions / Urgency Notes
                      </label>
                      <input
                        type="text"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="e.g. Urgent wedding delivery before Friday"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-[#C59A27] focus:outline-none"
                      />
                    </div>

                    {/* Financial Summary */}
                    <div className="pt-3 border-t border-stone-200 space-y-2">
                      <div className="flex justify-between text-stone-600">
                        <span>Items Subtotal:</span>
                        <span className="font-mono font-semibold text-stone-900">
                          PKR {subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Courier Delivery Charges:</span>
                        <span className="font-mono font-semibold text-stone-900">
                          {shippingFee === 0 ? 'FREE' : `PKR ${shippingFee.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                        <span>Grand Total:</span>
                        <span className="font-serif text-base text-stone-900">
                          PKR {grandTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Advance Deposit Notice & Slip Upload Section */}
                      {isAdvanceEnabled ? (
                        <div className="space-y-3 pt-1">
                          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] space-y-1.5">
                            <div className="flex justify-between font-bold text-[#A47A1A]">
                              <span>Required Advance ({advancePercentage}%):</span>
                              <span className="font-mono text-xs font-bold">PKR {advanceAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                              <span>Remaining Payable on Delivery (COD):</span>
                              <span className="font-mono font-semibold text-stone-800">PKR {remainingCOD.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Bank & Mobile Account Details */}
                          <div className="p-3.5 rounded-xl bg-stone-900 text-white space-y-2 border border-[#C59A27]/40 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-serif font-bold text-xs text-[#E3C677] flex items-center space-x-1.5">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{storeSettings?.bankDetails?.bankName || 'Meezan Bank Limited'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712', 'iban')}
                                className="text-[10px] text-stone-300 hover:text-white flex items-center space-x-1 bg-stone-800 hover:bg-stone-700 px-2 py-0.5 rounded transition cursor-pointer"
                              >
                                {copiedIBAN ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedIBAN ? 'Copied' : 'Copy IBAN'}</span>
                              </button>
                            </div>

                            <div className="text-[11px] font-mono text-stone-300 space-y-0.5">
                              <div>Title: <span className="font-bold text-white">{storeSettings?.bankDetails?.accountTitle || 'VowCrafts Art Studio'}</span></div>
                              <div className="flex items-center justify-between">
                                <span>Account: <span className="text-white font-bold">{storeSettings?.bankDetails?.accountNumber || '02010103984712'}</span></span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(storeSettings?.bankDetails?.accountNumber || '02010103984712', 'account')}
                                  className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                                >
                                  {copiedAccount ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                              <div className="text-amber-300 text-[10px]">
                                IBAN: {storeSettings?.bankDetails?.iban || 'PK64MEZN0002010103984712'}
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-stone-800 flex items-center justify-between text-[11px]">
                              <span className="text-stone-300">
                                Easypaisa / JazzCash: <span className="font-mono font-bold text-white">{storeSettings?.bankDetails?.easypaisaNumber || '0300-8472910'}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(storeSettings?.bankDetails?.easypaisaNumber || '03008472910', 'mobile')}
                                className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                              >
                                {copiedMobile ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                          </div>

                          {/* Upload Slip Input */}
                          <div className="space-y-1.5">
                            <label className="block font-bold text-stone-800 text-xs">
                              Attach Payment Transfer Screenshot <span className="font-normal text-stone-400">(Optional)</span>
                            </label>
                            {paymentSlipPreview ? (
                              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-300 flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                  <img
                                    src={paymentSlipPreview}
                                    alt="Preview"
                                    className="w-10 h-10 object-cover rounded-lg border border-stone-300 shrink-0"
                                  />
                                  <div className="text-[11px]">
                                    <div className="font-bold text-stone-800 max-w-[170px] truncate">{paymentSlipFile?.name}</div>
                                    <div className="text-[10px] text-stone-400 font-mono">{(paymentSlipFile?.size / 1024).toFixed(1)} KB</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => { setPaymentSlipFile(null); setPaymentSlipPreview(null); }}
                                  className="text-stone-400 hover:text-rose-600 p-1 transition cursor-pointer"
                                  title="Remove image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <label className="flex items-center justify-center p-3 border-2 border-dashed border-stone-300 hover:border-[#C59A27] rounded-xl cursor-pointer bg-stone-50 hover:bg-amber-50/30 transition text-center group">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleSelectSlip}
                                />
                                <div className="text-stone-500 text-[11px] flex items-center space-x-2">
                                  <Upload className="w-4 h-4 text-stone-400 group-hover:text-[#C59A27] transition shrink-0" />
                                  <span className="group-hover:text-stone-800 font-medium">Click to select receipt screenshot</span>
                                </div>
                              </label>
                            )}
                            <p className="text-[10px] text-stone-400">
                              You can also upload your screenshot after placing the order or send it on WhatsApp.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5 mt-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>100% Cash on Delivery (COD) across Pakistan. No advance required.</span>
                        </div>
                      )}
                    </div>

                    {/* Order Action Buttons */}
                    <div className="pt-2 space-y-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? (
                          <span>Placing Your Order...</span>
                        ) : (
                          <>
                            <span>CONFIRM &amp; PLACE ORDER (COD)</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDirectWhatsAppOrder}
                        className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
                      >
                        <Phone className="w-4 h-4" />
                        <span>ORDER DIRECTLY VIA WHATSAPP CONCIERGE</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Global Footer */}
      <StorefrontFooter storeSettings={storeSettings} />
    </div>
  );
}
