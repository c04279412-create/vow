'use client';

import React from 'react';

export const defaultSocialLinks = {
  facebook: 'https://facebook.com/vowcrafts',
  instagram: 'https://instagram.com/vowcrafts',
  tiktok: 'https://tiktok.com/@vowcrafts',
  snapchat: 'https://snapchat.com/add/vowcrafts',
  google: 'https://google.com/search?q=vowcrafts',
};

export default function SocialLinksBar({ socialLinks = {}, variant = 'header' }) {
  const links = {
    facebook: socialLinks?.facebook || defaultSocialLinks.facebook,
    instagram: socialLinks?.instagram || defaultSocialLinks.instagram,
    tiktok: socialLinks?.tiktok || defaultSocialLinks.tiktok,
    snapchat: socialLinks?.snapchat || defaultSocialLinks.snapchat,
    google: socialLinks?.google || defaultSocialLinks.google,
  };

  const isHeader = variant === 'header';

  const channels = [
    {
      id: 'facebook',
      name: 'Facebook',
      url: links.facebook,
      hoverColor: 'hover:text-[#1877F2] hover:border-[#1877F2]/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: links.instagram,
      hoverColor: 'hover:text-[#E4405F] hover:border-[#E4405F]/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: links.tiktok,
      hoverColor: 'hover:text-[#EE1D52] hover:border-[#EE1D52]/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.1 15.69a6.34 6.34 0 0 0 10.82 4.48 6.27 6.27 0 0 0 1.86-4.48V8.75a8.28 8.28 0 0 0 5.21 1.83V7.12a4.83 4.83 0 0 1-1.4-.43z" />
        </svg>
      ),
    },
    {
      id: 'snapchat',
      name: 'Snapchat',
      url: links.snapchat,
      hoverColor: 'hover:text-[#FFFC00] hover:border-[#FFFC00]/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.003 2c-3.535 0-6.155 2.658-6.155 6.002 0 .59.135 1.448.24 1.867.042.167-.04.306-.178.406-.388.28-.979.624-1.52.891-.252.124-.396.344-.334.614.072.31.393.473.743.511.458.05.952-.08 1.408.087.27.1.378.36.278.63-.448 1.207-1.393 2.148-2.607 2.684-.282.124-.43.376-.363.674.072.325.39.467.712.443.743-.056 1.464-.326 2.18-.543.256-.077.5.013.655.234.622.887 1.542 1.45 2.584 1.62.46.075.927.094 1.395.093.468.001.935-.018 1.396-.093 1.04-.17 1.96-.733 2.583-1.62.155-.221.398-.311.655-.234.716.217 1.437.487 2.18.543.322.024.64-.118.712-.443.067-.298-.08-.55-.363-.674-1.214-.536-2.16-1.477-2.607-2.684-.1-.27.008-.53.278-.63.456-.167.95-.037 1.408-.087.35-.038.67-.201.743-.511.062-.27-.082-.49-.334-.614-.541-.267-1.132-.611-1.52-.891-.138-.1-.22-.239-.178-.406.105-.419.24-1.277.24-1.867 0-3.344-2.62-6.002-6.155-6.002z" />
        </svg>
      ),
    },
    {
      id: 'google',
      name: 'Google',
      url: links.google,
      hoverColor: 'hover:text-[#4285F4] hover:border-[#4285F4]/40',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.067 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`flex items-center gap-1.5 ${isHeader ? 'text-stone-300' : 'text-stone-400'}`}>
      {channels.map((ch) => (
        <a
          key={ch.id}
          href={ch.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          title={`Follow VowCrafts on ${ch.name}`}
          aria-label={`Follow VowCrafts on ${ch.name}`}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isHeader
              ? `bg-white/10 hover:bg-white/20 text-[#E3C677] ${ch.hoverColor} border border-white/10 hover:scale-105 shadow-2xs`
              : `bg-stone-800 hover:bg-stone-700 text-stone-300 ${ch.hoverColor} border border-stone-700/80 hover:scale-105 shadow-2xs`
          }`}
        >
          {ch.icon}
        </a>
      ))}
    </div>
  );
}
