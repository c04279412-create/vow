'use client';

import React from 'react';
import { ExternalLink, Palette, Settings, LogOut, Bell } from 'lucide-react';

export default function AdminHeader({
  storeSettings,
  pendingOrdersCount = 0,
  onOpenSettings,
  onOpenTheme,
  onLogout,
}) {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-20 select-none">
      <div className="px-8 py-3 flex items-center justify-between">
        {/* Left Title matching user screenshot */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-stone-500 font-sans tracking-wide">
            Atelier Management System
          </span>
          {pendingOrdersCount > 0 && (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>{pendingOrdersCount} Pending Receipts</span>
            </span>
          )}
        </div>

        {/* Right Actions matching user screenshot */}
        <div className="flex items-center space-x-3">
          {/* Theme & Styling button */}
          <button
            type="button"
            onClick={onOpenTheme}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-[#B5936C] text-stone-700 hover:text-stone-900 text-xs font-medium transition bg-stone-50/60"
            title="Customize Fonts, Font Sizes and Colors"
          >
            <Palette className="w-3.5 h-3.5 text-[#B5936C]" />
            <span>Theme & Fonts</span>
          </button>

          {/* Storefront Link button matching user screenshot */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-700 hover:text-stone-900 text-xs font-medium transition bg-stone-50/60"
          >
            <span>Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>

          {/* Sign out */}
          <button
            type="button"
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                window.location.href = '/';
              }
            }}
            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
            title="Logout & Lock Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
