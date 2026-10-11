'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  CreditCard,
  Truck,
  Heart,
  ExternalLink,
} from 'lucide-react';
import SocialLinksBar from './SocialLinksBar';

export default function StorefrontFooter({ storeSettings }) {
  const rawWhatsapp = (storeSettings?.whatsappNumber || '+923008472910').replace(/[^0-9]/g, '');

  return (
    <footer className="bg-[#1C1917] text-stone-300 pt-16 pb-12 border-t border-[#C59A27]/30 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Feature Pillars (Optional & Aligned with Real Catalog) */}
        {Boolean(storeSettings?.showFooterFeatures) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#E3C677] flex items-center justify-center shrink-0 border border-[#C59A27]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-sm">
                  {storeSettings?.footerFeature1Title || 'Premium Quality'}
                </div>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  {storeSettings?.footerFeature1Desc || 'Carefully produced using premium quality materials.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#E3C677] flex items-center justify-center shrink-0 border border-[#C59A27]/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-sm">
                  {storeSettings?.footerFeature2Title || 'Custom Personalization'}
                </div>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  {storeSettings?.footerFeature2Desc || 'Personalized designs customized to your instructions.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#E3C677] flex items-center justify-center shrink-0 border border-[#C59A27]/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-sm">
                  {storeSettings?.footerFeature3Title || (
                    storeSettings?.enableAdvancePayment && (Number(storeSettings?.advancePaymentPercentage) || 0) > 0
                      ? `${storeSettings.advancePaymentPercentage}% Deposit, Rest on COD`
                      : 'Cash on Delivery'
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  {storeSettings?.footerFeature3Desc || 'Doorstep delivery across Pakistan with verified courier dispatch.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#E3C677] flex items-center justify-center shrink-0 border border-[#C59A27]/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-white text-sm">
                  {storeSettings?.footerFeature4Title || 'Safe & Secure Packaging'}
                </div>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">
                  {storeSettings?.footerFeature4Desc || 'Protective packaging ensuring your orders arrive safe.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Middle Columns: Clean E-Commerce Footer Navigation (Matches Reference Design) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs sm:text-sm">
          {/* Col 1: QUICK LINKS */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/categories/all" className="hover:text-white transition">
                  All Collections
                </Link>
              </li>
              <li>
                <a href="#atelier-story" className="hover:text-white transition">
                  About Us
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${rawWhatsapp}?text=Hi!%20I%20have%20an%20inquiry.`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition flex items-center gap-1 text-stone-400">
                  <span>Admin Portal</span>
                  <ExternalLink className="w-3 h-3 text-[#E3C677]" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: WEDDING CATEGORIES */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              Wedding Categories
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <Link href="/categories/wedding" className="hover:text-white transition">
                  Nikkah Nama Frames
                </Link>
              </li>
              <li>
                <Link href="/categories/wedding?subcategory=Floral%20Preservation%20Boxes" className="hover:text-white transition">
                  Floral Preservation Boxes
                </Link>
              </li>
              <li>
                <Link href="/categories/wedding?subcategory=Fingerprint%20Guestbooks" className="hover:text-white transition">
                  Fingerprint Guestbooks
                </Link>
              </li>
              <li>
                <Link href="/categories/wedding?subcategory=Velvet%20Nikkah%20Booklets%20%26%20Folios" className="hover:text-white transition">
                  Velvet Nikkah Booklets
                </Link>
              </li>
              <li>
                <Link href="/categories/wedding?subcategory=Mirror%20%26%20Acrylic%20Welcome%20Boards" className="hover:text-white transition">
                  Welcome Boards
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: GIFT CATEGORIES */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              Gift Categories
            </h4>
            <ul className="space-y-2 text-stone-400 text-xs">
              <li>
                <Link href="/categories/newborn" className="hover:text-white transition">
                  Birth Announcement Plaques
                </Link>
              </li>
              <li>
                <Link href="/categories/occasions" className="hover:text-white transition">
                  Anniversary Photo Mosaics
                </Link>
              </li>
              <li>
                <Link href="/categories/occasions" className="hover:text-white transition">
                  Spotify Music Plaques
                </Link>
              </li>
              <li>
                <Link href="/categories/customized-frame" className="hover:text-white transition">
                  Customized Frames
                </Link>
              </li>
              <li>
                <Link href="/categories/all" className="hover:text-white transition">
                  Couple Keepsakes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: CONNECT & ORDER CONCIERGE */}
          <div className="space-y-3 col-span-2 md:col-span-1">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-white">
              Connect With Us
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Have a custom request or inquiry? Reach out directly via WhatsApp for quick assistance.
            </p>
            <div className="pt-1 space-y-3">
              <a
                href={`https://wa.me/${rawWhatsapp}?text=Hi%20VowCrafts!%20I%20have%20an%20order%20inquiry.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp: {storeSettings?.whatsappNumber || '+92 300 8472910'}</span>
              </a>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Follow Our Social Channels
                </span>
                <SocialLinksBar socialLinks={storeSettings?.socialLinks} variant="footer" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} {storeSettings?.storeName?.trim() || 'VowCrafts'}. All Rights Reserved.
          </div>
          {storeSettings?.showDesignerCredit !== false && (
            <div className="flex items-center space-x-2 text-[11px] text-stone-400">
              <span>{storeSettings?.designerCredit || 'Designed for Eternal Moments'}</span>
              <Heart className="w-3 h-3 text-rose-500 fill-current" />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
