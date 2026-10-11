'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  LogOut,
  ShoppingBag,
  Clock,
  Eye,
  EyeOff,
  Truck,
  ExternalLink,
  Package,
  PackageCheck,
  AlertCircle,
  RefreshCw,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
} from 'lucide-react';

export default function CustomerAuthModal({
  isOpen,
  onClose,
  initialView = 'signin', // 'signin' | 'signup' | 'profile' | 'track'
  onSuccess,
  redirectMessage = '',
}) {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState(initialView); // 'signin' | 'signup' | 'verify' | 'profile' | 'track'
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // Direct order search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Status states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Track expanded order cards
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initial view and check logged in status
  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setSuccessMessage('');
      setSearchError('');
      try {
        const saved = localStorage.getItem('vowcrafts_customer');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.email || parsed?.phone) {
            setCustomer(parsed);
            setView('profile');
            fetchCustomerOrders(parsed.email, parsed.phone);
            return;
          }
        }
      } catch (e) {}
      setView(initialView || 'signin');
    }
  }, [isOpen, initialView]);

  const fetchCustomerOrders = async (custEmail, custPhone) => {
    setLoadingOrders(true);
    try {
      const q = custEmail ? `email=${encodeURIComponent(custEmail)}` : `phone=${encodeURIComponent(custPhone || '')}`;
      const res = await fetch(`/api/auth/customer/me?${q}`);
      const data = await res.json();
      if (data.success) {
        if (data.customer) setCustomer(data.customer);
        const ords = data.orders || [];
        setOrders(ords);
        // Automatically expand the first order
        if (ords.length > 0) {
          setExpandedOrders({ [ords[0].orderNumber || ords[0].id]: true });
        }
      }
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleDirectSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchedOrder(null);

    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to search orders');
      const data = await res.json();
      const allOrders = data.orders || [];
      const query = searchQuery.trim().toLowerCase();
      const cleanPhone = query.replace(/[^0-9]/g, '');

      const match = allOrders.find(
        (o) =>
          o.orderNumber?.toLowerCase() === query ||
          o.id?.toLowerCase() === query ||
          (cleanPhone && cleanPhone.length >= 7 && o.customer?.phone?.replace(/[^0-9]/g, '').includes(cleanPhone)) ||
          o.customer?.email?.toLowerCase() === query ||
          o.tracking?.trackingId?.toLowerCase() === query
      );

      if (match) {
        setSearchedOrder(match);
      } else {
        setSearchError(`No order found matching "${searchQuery}". Please check your Order ID or phone number.`);
      }
    } catch (err) {
      setSearchError('Error searching order. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      setGeneratedCode(data.code || '');
      setSuccessMessage(`Verification code generated for ${data.email}.`);
      setView('verify');
    } catch (err) {
      setErrorMessage('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!verificationCode.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/customer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Verification failed.');
        setLoading(false);
        return;
      }

      localStorage.setItem('vowcrafts_customer', JSON.stringify(data.customer));
      window.dispatchEvent(new Event('vowcrafts_customer_changed'));

      setCustomer(data.customer);
      setSuccessMessage('Account verified successfully!');
      if (onSuccess) onSuccess(data.customer);

      setView('profile');
      fetchCustomerOrders(data.customer.email, data.customer.phone);
    } catch (err) {
      setErrorMessage('Verification request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.needsVerification) {
          setView('verify');
          setErrorMessage(data.message);
        } else {
          setErrorMessage(data.message || 'Login failed.');
        }
        setLoading(false);
        return;
      }

      localStorage.setItem('vowcrafts_customer', JSON.stringify(data.customer));
      window.dispatchEvent(new Event('vowcrafts_customer_changed'));

      setCustomer(data.customer);
      setSuccessMessage('Welcome back!');
      if (onSuccess) onSuccess(data.customer);

      setView('profile');
      fetchCustomerOrders(data.customer.email, data.customer.phone);
    } catch (err) {
      setErrorMessage('Login request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vowcrafts_customer');
    window.dispatchEvent(new Event('vowcrafts_customer_changed'));
    setCustomer(null);
    setOrders([]);
    setView('signin');
  };

  // Helper for Order Status Stepper
  const getStepNumber = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped' || s === 'in_transit' || s === 'dispatched') return 3;
    if (s === 'processing' || s === 'in_production' || s === 'framing') return 2;
    return 1; // 'new', 'pending', etc.
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case 'delivered':
        return { label: 'Delivered to Doorstep', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' };
      case 'shipped':
      case 'in_transit':
      case 'dispatched':
        return { label: 'Dispatched / In Courier Transit', bg: 'bg-sky-50 text-sky-800 border-sky-300', dot: 'bg-sky-500' };
      case 'processing':
      case 'in_production':
      case 'framing':
        return { label: 'In Production & Archival Framing', bg: 'bg-amber-50 text-[#8C6D42] border-amber-300', dot: 'bg-amber-500' };
      case 'cancelled':
        return { label: 'Order Cancelled', bg: 'bg-rose-50 text-rose-800 border-rose-300', dot: 'bg-rose-500' };
      default:
        return { label: 'Order Confirmed • In Queue', bg: 'bg-stone-100 text-stone-800 border-stone-300', dot: 'bg-stone-500' };
    }
  };

  if (!isOpen || !mounted) return null;

  // Single Order Card Renderer
  const renderOrderCard = (ord) => {
    const orderKey = ord.orderNumber || ord.id;
    const isExpanded = Boolean(expandedOrders[orderKey]);
    const currentStep = getStepNumber(ord.orderStatus);
    const badge = getStatusBadge(ord.orderStatus);
    const items = ord.items || [];
    const pricing = ord.pricing || {};
    const payment = ord.payment || {};
    const tracking = ord.tracking || {};
    const isAdvanceVerified = payment.paymentStatus === 'advance_verified';
    const isSlipUploaded = payment.paymentStatus === 'pending_verification' || payment.paymentScreenshotUrl;

    return (
      <div
        key={orderKey}
        className="rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden transition hover:border-[#B5936C]/60"
      >
        {/* Order Card Top Bar */}
        <div
          onClick={() => toggleOrderExpand(orderKey)}
          className="p-4 bg-stone-50/80 hover:bg-stone-100/60 transition cursor-pointer flex flex-wrap items-center justify-between gap-3 border-b border-stone-100"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1917] text-[#E3C677] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-stone-900 text-sm">
                  #{ord.orderNumber || ord.id}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Placed on {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'} • {items.length} {items.length === 1 ? 'keepsake' : 'keepsakes'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-auto">
            <div className="text-right">
              <div className="font-serif font-bold text-stone-900 text-sm">
                PKR {(pricing.totalAmount || ord.totalAmount || 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-stone-500">
                {isAdvanceVerified ? (
                  <span className="text-emerald-700 font-semibold">✓ Advance Paid</span>
                ) : isSlipUploaded ? (
                  <span className="text-amber-700 font-semibold">Slip Under Review</span>
                ) : (
                  <span>{payment.method === 'bank_transfer' ? 'Advance Required' : '100% COD'}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition"
              aria-label="Toggle details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Visual 4-Step Progress Bar */}
        <div className="p-4 bg-[#FAF7F2]/50 border-b border-stone-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center justify-between">
            <span>Live Production &amp; Delivery Progress</span>
            <span className="text-[#8C6D42] font-semibold">Stage {currentStep} of 4</span>
          </div>

          <div className="relative pb-1">
            {/* Connecting Track */}
            <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-stone-200 -z-0 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C59A27] to-[#8C6D42] transition-all duration-700"
                style={{
                  width:
                    currentStep === 4 ? '100%' :
                    currentStep === 3 ? '66%' :
                    currentStep === 2 ? '33%' : '0%'
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-1 sm:gap-2 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  ✓
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-stone-900 mt-1.5 leading-tight">
                  Order Confirmed
                </span>
                <span className="text-[9px] text-stone-500 hidden sm:inline">Logged in System</span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${
                    currentStep >= 2
                      ? 'bg-[#8C6D42] text-white ring-2 ring-[#B5936C]/40'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {currentStep > 2 ? '✓' : <Sparkles className="w-4 h-4 text-white" />}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold mt-1.5 leading-tight ${
                    currentStep >= 2 ? 'text-[#8C6D42]' : 'text-stone-400'
                  }`}
                >
                  Hand Framing
                </span>
                <span className="text-[9px] text-stone-500 hidden sm:inline">Archival Gilding</span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${
                    currentStep >= 3
                      ? 'bg-[#8C6D42] text-white ring-2 ring-[#B5936C]/40'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {currentStep > 3 ? '✓' : <Truck className="w-4 h-4 text-white" />}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold mt-1.5 leading-tight ${
                    currentStep >= 3 ? 'text-[#8C6D42]' : 'text-stone-400'
                  }`}
                >
                  Dispatched
                </span>
                <span className="text-[9px] text-stone-500 hidden sm:inline">
                  {tracking.courierName || 'In Transit'}
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${
                    currentStep >= 4
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {currentStep >= 4 ? '✓' : <PackageCheck className="w-4 h-4 text-stone-400" />}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-bold mt-1.5 leading-tight ${
                    currentStep >= 4 ? 'text-emerald-700' : 'text-stone-400'
                  }`}
                >
                  Delivered
                </span>
                <span className="text-[9px] text-stone-500 hidden sm:inline">Doorstep</span>
              </div>
            </div>
          </div>

          {/* Courier Details Banner (if active/shipped) */}
          {(tracking.trackingId || tracking.trackingUrl) && (
            <div className="mt-3 p-3 bg-sky-50/80 rounded-xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-950">
                    Courier: <span className="text-sky-800 font-semibold">{tracking.courierName || 'TCS Express'}</span>
                  </div>
                  <div className="text-[11px] font-mono text-sky-800">
                    Tracking ID: <span className="font-bold select-all">{tracking.trackingId}</span>
                  </div>
                </div>
              </div>
              {tracking.trackingUrl && (
                <a
                  href={tracking.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shrink-0 shadow-xs"
                >
                  <span>Open Live Courier Tracking</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Expanded Order Items & Breakdown */}
        {isExpanded && (
          <div className="p-4 sm:p-5 space-y-4 bg-white animate-in fade-in duration-150">
            {/* Items List */}
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                Keepsakes in this Order
              </div>
              <div className="space-y-2.5">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-serif font-bold text-stone-900 text-sm">
                        {it.productName || it.name}
                      </div>
                      <div className="text-stone-500 text-[11px] flex flex-wrap items-center gap-2">
                        {it.selectedSize && <span>Size: <strong>{it.selectedSize}</strong></span>}
                        {it.selectedColor && <span>Color: <strong>{it.selectedColor}</strong></span>}
                        <span>Qty: <strong>{it.quantity || 1}</strong></span>
                      </div>

                      {/* Customization Details */}
                      {it.customTextInputs && Object.keys(it.customTextInputs).length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-200/60 text-[11px] text-stone-600 space-y-0.5">
                          {Object.entries(it.customTextInputs).map(([k, v]) => {
                            if (!v) return null;
                            const formattedKey = k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                            return (
                              <div key={k} className="flex items-baseline space-x-1.5">
                                <span className="text-stone-400 font-medium">{formattedKey}:</span>
                                <span className="font-semibold text-stone-800">{String(v)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-serif font-bold text-stone-900">
                        PKR {((it.price || 0) * (it.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown & Advance Payment Slip Status */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#C59A27]/20 text-xs space-y-2">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>PKR {(pricing.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Courier Express Shipping</span>
                <span>PKR {(pricing.shippingFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-stone-900 pt-1.5 border-t border-stone-200 text-sm">
                <span>Total Order Amount</span>
                <span>PKR {(pricing.totalAmount || 0).toLocaleString()}</span>
              </div>

              {/* Advance vs Remaining Balance */}
              {pricing.advanceAmount > 0 && (
                <div className="pt-2 border-t border-stone-200/80 space-y-1 text-[11px]">
                  <div className="flex justify-between items-center text-stone-700">
                    <span>
                      Advance Payment ({pricing.advancePercentage || 15}%):
                    </span>
                    <span className="font-bold">
                      PKR {(pricing.advanceAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-stone-700 font-semibold">
                    <span>Remaining COD Doorstep Balance:</span>
                    <span className="text-[#8C6D42] font-bold">
                      PKR {(pricing.remainingBalance || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                    <span className="text-stone-500 font-medium">Payment Verification:</span>
                    {isAdvanceVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Advance Verified
                      </span>
                    ) : isSlipUploaded ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Deposit Slip Uploaded • Under Verification
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                        Deposit Awaiting
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Destination */}
            {ord.customer && (
              <div className="text-[11px] text-stone-600 space-y-0.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                <div className="font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#B5936C]" />
                  <span>Delivery Destination</span>
                </div>
                <div className="font-semibold text-stone-900">{ord.customer.fullName}</div>
                <div>{ord.customer.address}, {ord.customer.city}</div>
                <div>Phone / WhatsApp: <strong className="font-mono text-stone-800">{ord.customer.phone}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#1C1917] text-white flex items-center justify-between border-b border-[#C59A27]/30 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-[#FAF7F2]/10 border border-[#C59A27]/50 flex items-center justify-center text-[#E3C677]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#FAF7F2] leading-tight">
                {customer ? 'Patron Keepsake Portal & Tracking' : 'VowCrafts Patron Access'}
              </h3>
              <p className="text-[10px] text-stone-400 font-sans">
                {customer ? 'Live Order Progress • Tracking • Account' : 'Sign in to track bespoke handcrafted keepsakes'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Redirect notice if triggered during add to cart or checkout */}
        {redirectMessage && !customer && (
          <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-medium shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#A47A1A] shrink-0" />
            <span>{redirectMessage}</span>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium animate-in fade-in shrink-0">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* ========================================= */}
          {/* VIEW 1: LOGGED IN PROFILE & ORDER TRACKING */}
          {/* ========================================= */}
          {view === 'profile' && customer && (
            <div className="space-y-6">
              {/* Customer Profile Header Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-stone-50 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#1C1917] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-xl border border-[#C59A27]/50 shadow-xs shrink-0">
                    {customer.fullName?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                        {customer.fullName}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 font-mono mt-0.5">
                      {customer.email || 'Email Verified'}
                    </p>
                    {customer.phone && (
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        WhatsApp: <strong className="font-mono text-stone-900">{customer.phone}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Log Out Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ml-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Order History & Tracking Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-serif font-bold text-sm sm:text-base text-stone-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8C6D42]" />
                      <span>Your Keepsake Orders ({orders.length})</span>
                    </h5>
                    <p className="text-[11px] text-stone-500">
                      Live status, production progress &amp; courier tracking
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchCustomerOrders(customer.email, customer.phone)}
                    disabled={loadingOrders}
                    className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs flex items-center space-x-1 transition cursor-pointer"
                    title="Refresh Orders"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-xs text-stone-500 space-y-2">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#8C6D42]" />
                    <p>Loading your orders &amp; live progress...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 rounded-2xl border-2 border-dashed border-stone-200 text-center space-y-3 bg-stone-50/50">
                    <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <h6 className="font-serif font-bold text-stone-800 text-sm">
                        No orders found under this account yet
                      </h6>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        If you placed an order using a different phone number or as a guest, search below to track it live!
                      </p>
                    </div>

                    {/* Direct Search Bar */}
                    <form onSubmit={handleDirectSearch} className="max-w-md mx-auto pt-2 flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter Order # (e.g. VC-77727) or Phone"
                        className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono focus:border-[#C59A27] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={searchLoading}
                        className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        {searchLoading ? 'Searching...' : 'Find Order'}
                      </button>
                    </form>

                    {searchError && (
                      <p className="text-xs text-rose-600 font-medium">{searchError}</p>
                    )}
                    {searchedOrder && (
                      <div className="pt-3 text-left">
                        {renderOrderCard(searchedOrder)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => renderOrderCard(ord))}
                  </div>
                )}
              </div>

              {/* Quick Action Footer */}
              <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/categories/all"
                  onClick={onClose}
                  className="text-xs text-[#8C6D42] hover:underline font-semibold flex items-center space-x-1"
                >
                  <span>Explore Bespoke Collections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-bold text-xs flex items-center space-x-2 transition shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-[#E3C677]" />
                  <span>View Shopping Bag</span>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* VIEW 2: SIGN IN FORM */}
          {/* ========================================= */}
          {view === 'signin' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
                  Welcome to VowCrafts
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Sign in with your verified Gmail to track orders and save bespoke keepsakes.
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setView('signin');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg bg-white text-stone-900 shadow-xs font-bold transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('signup');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('track');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Truck className="w-3.5 h-3.5 text-[#B5936C]" />
                  <span>Track Order</span>
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Gmail Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Signing in...</span>
                  ) : (
                    <>
                      <span>Sign In &amp; View Orders</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================= */}
          {/* VIEW 3: CREATE ACCOUNT */}
          {/* ========================================= */}
          {view === 'signup' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900">
                  Create Patron Account
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Register with your Gmail &amp; WhatsApp for instant order tracking.
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setView('signin');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('signup');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg bg-white text-stone-900 shadow-xs font-bold transition cursor-pointer"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('track');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Truck className="w-3.5 h-3.5 text-[#B5936C]" />
                  <span>Track Order</span>
                </button>
              </div>

              <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Gmail Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    WhatsApp Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Sending code...</span>
                  ) : (
                    <>
                      <span>Continue &amp; Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ========================================= */}
          {/* VIEW 4: VERIFY CODE */}
          {/* ========================================= */}
          {view === 'verify' && (
            <div className="space-y-5 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-[#8C6D42] flex items-center justify-center mx-auto border border-amber-300">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  Verify Your Gmail
                </h3>
                <p className="text-xs text-stone-500">
                  Please enter the 6-digit code sent to <strong className="text-stone-800">{email}</strong>
                </p>
              </div>

              {generatedCode && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-stone-700 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Verification Code:</span>
                    <span className="font-mono font-bold text-base text-[#8C6D42] tracking-widest">{generatedCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(generatedCode)}
                    className="px-2.5 py-1 bg-white border border-[#C59A27] text-[#8C6D42] text-[11px] font-bold rounded-lg hover:bg-amber-100 transition cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center py-3 bg-stone-50 border-2 border-stone-300 rounded-xl text-xl font-mono font-bold tracking-[0.4em] focus:bg-white focus:border-[#C59A27] focus:outline-none"
                />

                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 4}
                  className="w-full py-3 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? <span>Verifying...</span> : <span>Verify &amp; Activate Account</span>}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs text-stone-500">
                <button
                  type="button"
                  onClick={() => setView('signup')}
                  className="hover:text-stone-900 transition cursor-pointer"
                >
                  ← Edit Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                    setGeneratedCode(newCode);
                    setSuccessMessage(`New code sent: ${newCode}`);
                  }}
                  className="text-[#B5936C] font-semibold hover:underline cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* VIEW 5: DIRECT TRACK ORDER (WITHOUT LOGIN) */}
          {/* ========================================= */}
          {view === 'track' && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-900 flex items-center justify-center gap-2">
                  <Truck className="w-5 h-5 text-[#8C6D42]" />
                  <span>Instant Order Tracking</span>
                </h3>
                <p className="text-xs text-stone-500 font-sans">
                  Track your bespoke keepsake live without logging in.
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setView('signin');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('signup');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg text-stone-500 hover:text-stone-900 transition cursor-pointer"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView('track');
                    setErrorMessage('');
                  }}
                  className="flex-1 py-2 rounded-lg bg-white text-stone-900 shadow-xs font-bold transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Truck className="w-3.5 h-3.5 text-[#B5936C]" />
                  <span>Track Order</span>
                </button>
              </div>

              <form onSubmit={handleDirectSearch} className="space-y-3">
                <div>
                  <label className="block font-bold text-stone-800 text-xs mb-1">
                    Order ID, Courier Tracking #, or WhatsApp Phone:
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. VC-77727 or 0300 1234567"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono font-medium focus:bg-white focus:border-[#C59A27] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={searchLoading}
                  className="w-full py-2.5 bg-[#1C1917] hover:bg-stone-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {searchLoading ? <span>Searching order records...</span> : <span>Track Live Status</span>}
                </button>
              </form>

              {searchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                  {searchError}
                </div>
              )}

              {searchedOrder && (
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Order Found! Live Tracking Details:</span>
                  </div>
                  {renderOrderCard(searchedOrder)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
