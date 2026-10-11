'use client';

import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderKanban,
  ShoppingBag,
  Boxes,
  Users,
  TicketPercent,
  Image as ImageIcon,
  Sliders,
  MessageSquare,
  FolderOpen,
  Store,
  Palette,
  UsersRound,
  FileClock,
  LogOut,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export default function AdminSidebar({
  currentTab,
  setTab,
  storeSettings,
  pendingOrdersCount = 0,
  onLogout,
}) {
  const isLight = storeSettings?.theme?.sidebarTheme !== 'dark';

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Reach & Analytics', icon: BarChart3, badge: 'Insights' },
      ],
    },
    {
      title: 'CATALOG',
      items: [
        { id: 'products', label: 'Products', icon: Package },
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'collections', label: 'Collections', icon: FolderKanban },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          id: 'orders',
          label: 'Orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : null,
        },
        { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
        { id: 'customers', label: 'Customers', icon: Users },
      ],
    },
    {
      title: 'MARKETING & CONTENT',
      items: [
        { id: 'coupons', label: 'Coupons', icon: TicketPercent },
        { id: 'banners', label: 'Hero Banners', icon: ImageIcon },
        { id: 'homepage_builder', label: 'Homepage Builder', icon: Sliders },
        { id: 'reviews', label: 'Review Moderation', icon: MessageSquare },
        { id: 'media_library', label: 'Media Library', icon: FolderOpen },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'settings', label: 'Store Settings', icon: Store },
        { id: 'theme', label: 'Theme & Styling', icon: Palette, badge: 'New' },
        { id: 'users', label: 'Admin Users & Roles', icon: UsersRound },
        { id: 'audit_logs', label: 'Activity Audit Logs', icon: FileClock },
      ],
    },
  ];

  return (
    <aside
      className={`w-64 flex flex-col h-screen sticky top-0 border-r select-none z-30 transition-colors duration-200 ${
        isLight
          ? 'bg-white text-stone-800 border-stone-200 shadow-xs'
          : 'bg-[#1C1917] text-stone-200 border-[#C59A27]/20 shadow-2xl'
      }`}
    >
      {/* Brand Header matching user screenshot */}
      <div className={`p-4 border-b flex items-center space-x-2.5 ${isLight ? 'border-stone-100' : 'border-stone-800 bg-[#171514]'}`}>
        <div className="w-8 h-8 rounded-lg bg-[#1C1917] text-[#E3C677] flex items-center justify-center font-serif font-black text-sm shadow-xs">
          V
        </div>
        <div>
          <h1 className="font-serif text-sm font-bold tracking-wider text-stone-900 leading-none uppercase">
            VOWCRAFTS
          </h1>
          <p className="text-[9px] font-sans tracking-widest text-stone-400 uppercase font-semibold mt-0.5">
            ADMIN CONSOLE
          </p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div
              className={`px-3 text-[9px] tracking-wider uppercase font-bold font-sans ${
                isLight ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              {section.title}
            </div>

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1C1917] text-white shadow-xs font-semibold'
                      : isLight
                      ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive
                          ? 'text-white'
                          : isLight
                          ? 'text-stone-400'
                          : 'text-stone-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#B5936C] text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer User Info matching screenshot */}
      <div
        className={`p-3.5 border-t flex items-center justify-between ${
          isLight ? 'border-stone-100 bg-[#FAF7F2]' : 'border-stone-800 bg-[#171514]'
        }`}
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold text-stone-900 leading-tight">
            VowCrafts Super Admin
          </span>
          <span className="text-[9px] font-mono uppercase text-amber-700 font-semibold">
            SUPER ADMIN
          </span>
        </div>
        <button
          onClick={() => {
            if (confirm('Sign out of VowCrafts Admin Console?')) {
              if (onLogout) {
                onLogout();
              } else {
                window.location.href = '/';
              }
            }
          }}
          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
