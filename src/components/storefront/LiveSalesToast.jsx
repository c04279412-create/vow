'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle, X, Heart, ShoppingBag } from 'lucide-react';

const PAKISTANI_BUYERS = [
  { name: 'Fatima & Bilal', city: 'Lahore', avatar: 'FB' },
  { name: 'Zainab & Hamza', city: 'Islamabad', avatar: 'ZH' },
  { name: 'Ayesha & Saad', city: 'Karachi', avatar: 'AS' },
  { name: 'Maryam & Usman', city: 'Rawalpindi', avatar: 'MU' },
  { name: 'Hira & Daniyal', city: 'Faisalabad', avatar: 'HD' },
  { name: 'Mahnoor & Ali', city: 'Multan', avatar: 'MA' },
  { name: 'Sana & Farhan', city: 'Sialkot', avatar: 'SF' },
  { name: 'Anum & Talha', city: 'Peshawar', avatar: 'AT' },
  { name: 'Khadija & Zaid', city: 'Gujranwala', avatar: 'KZ' },
  { name: 'Noor & Ahmed', city: 'Quetta', avatar: 'NA' },
];

const ACTIONS = [
  { label: 'Ordered', icon: ShoppingBag, color: 'text-[#A47A1A]' },
  { label: 'Customized & Booked', icon: Sparkles, color: 'text-amber-600' },
  { label: 'Added to Wishlist', icon: Heart, color: 'text-rose-600' },
];

const TIMES = [
  '2 minutes ago',
  '5 minutes ago',
  '9 minutes ago',
  '14 minutes ago',
  '22 minutes ago',
  '35 minutes ago',
];

export default function LiveSalesToast() {
  const [products, setProducts] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 1. Fetch live active catalog products so we NEVER show unlisted/deleted items
  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          const activeOnly = data.products.filter((p) => p.isActive !== false);
          setProducts(activeOnly.length > 0 ? activeOnly : data.products);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Generate and cycle notifications
  useEffect(() => {
    if (dismissed || products.length === 0) return;

    let notificationIdx = 0;

    const generateNext = () => {
      const prod = products[notificationIdx % products.length];
      const buyer = PAKISTANI_BUYERS[notificationIdx % PAKISTANI_BUYERS.length];
      const action = ACTIONS[notificationIdx % ACTIONS.length];
      const time = TIMES[notificationIdx % TIMES.length];
      notificationIdx++;

      return {
        product: prod,
        buyer,
        action,
        time,
      };
    };

    // First appearance after 4 seconds
    const initialTimer = setTimeout(() => {
      setCurrentNotification(generateNext());
      setVisible(true);
    }, 4000);

    // Rotate notification every 14 seconds
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentNotification(generateNext());
        setVisible(true);
      }, 800);
    }, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed, products]);

  if (dismissed || !visible || !currentNotification || !currentNotification.product) {
    return null;
  }

  const { product, buyer, action, time } = currentNotification;
  const productImg = product.images?.[0] || '/images/hero_banner.jpg';
  const ActionIcon = action.icon;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm w-full bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-stone-200/90 shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5 duration-300">
      {/* Product / Buyer Avatar Thumbnail */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 shadow-2xs group cursor-pointer"
        title={`View ${product.name}`}
      >
        <img
          src={productImg}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition"
        />
        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl bg-[#1C1917] text-[#E3C677] text-[8px] font-bold flex items-center justify-center font-mono">
          {buyer.avatar}
        </div>
      </Link>

      {/* Info Body (Clickable to visit the actual live product) */}
      <Link
        href={`/products/${product.slug || product.id}`}
        className="flex-1 min-w-0 text-xs hover:opacity-90 transition cursor-pointer"
      >
        <div className="flex items-center space-x-1.5 leading-tight">
          <span className="font-bold text-stone-900 truncate">{buyer.name}</span>
          <span className="text-[10px] text-stone-400">• {buyer.city}</span>
        </div>
        <p className="text-stone-600 truncate text-[11px] font-medium mt-0.5 flex items-center space-x-1">
          <ActionIcon className={`w-3 h-3 ${action.color} shrink-0`} />
          <span>
            {action.label}{' '}
            <strong className="text-stone-900 font-semibold">{product.name}</strong>
          </span>
        </p>
        <div className="flex items-center space-x-1 text-[10px] text-stone-400 font-mono mt-0.5">
          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
          <span>Verified activity • {time}</span>
        </div>
      </Link>

      {/* Dismiss Button */}
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-stone-400 hover:text-stone-700 transition cursor-pointer shrink-0"
        title="Dismiss popup"
        aria-label="Dismiss popup"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
