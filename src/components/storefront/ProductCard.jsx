'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

const DEFAULT_FRAME_COLORS = [
  { name: 'Sky Blue', hex: '#8EB1CD' },
  { name: 'Blush Pink', hex: '#F6C1CC' },
];

export default function ProductCard({
  product,
  storeSettings,
  onToast = () => {},
  className = '',
}) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  if (!product) return null;

  // Determine pricing
  const currentPrice =
    typeof product.salePrice === 'number' && product.salePrice > 0
      ? product.salePrice
      : typeof product.basePrice === 'number' && product.basePrice > 0
      ? product.basePrice
      : 3700;

  const originalPrice =
    typeof product.basePrice === 'number' && product.basePrice > currentPrice
      ? product.basePrice
      : Math.round(currentPrice * 1.31);

  // Format with .00 as shown in the screenshot
  const formatPrice = (amount) => {
    return `Rs.${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Extract or fallback colors
  let colors = [];
  if (Array.isArray(product.frameColors) && product.frameColors.length > 0) {
    colors = product.frameColors;
  } else if (Array.isArray(product.colors) && product.colors.length > 0) {
    colors = product.colors;
  } else {
    // Elegant baby / frame palette
    const catLower = (product.category || '').toLowerCase();
    if (catLower.includes('newborn') || catLower.includes('baby') || catLower.includes('footprint')) {
      colors = [
        { name: 'Sky Blue', hex: '#8EB1CD' },
        { name: 'Blush Pink', hex: '#F6C1CC' },
      ];
    } else {
      colors = [
        { name: 'Brushed Gold', hex: '#D4AF37' },
        { name: 'Matte Black', hex: '#1C1917' },
        { name: 'Pure White', hex: '#FFFFFF' },
      ];
    }
  }

  // Active color
  const activeColor = colors[selectedColorIndex] || colors[0];

  // Image handling: if multiple images exist, switch image when selecting color
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/images/floral_box.jpg'];
  const displayImage = images[selectedColorIndex % images.length] || images[0];

  const productUrl = `/products/${product.slug || product.id || product._id}${
    activeColor ? `?color=${encodeURIComponent(activeColor.name)}` : ''
  }`;

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onToast(!isFavorite ? `Saved "${product.name}" to wishlist!` : `Removed from wishlist`);
  };

  return (
    <div
      className={`group flex flex-col bg-transparent transition-all duration-300 ${className}`}
    >
      <Link href={productUrl} className="block relative aspect-[4/5] bg-[#E8E8E8] rounded-xl overflow-hidden cursor-pointer">
        {/* Main Product Image */}
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />

        {/* Wishlist Star in Top Right */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-1.5 text-stone-800 hover:text-stone-900 transition-colors z-10 cursor-pointer"
          title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist"
        >
          <Star
            className={`w-5 h-5 stroke-[1.4] transition-all ${
              isFavorite ? 'fill-[#C59A27] text-[#C59A27]' : 'fill-none text-stone-800 hover:scale-110'
            }`}
          />
        </button>
      </Link>

      {/* Card Details: Title, Price (Current + Cut Original), Color Swatches */}
      <div className="pt-3 pb-2 flex flex-col items-center text-center">
        {/* Product Title */}
        <Link href={productUrl} className="block">
          <h3 className="font-sans font-semibold text-stone-900 text-[15px] sm:text-base leading-snug line-clamp-2 px-1 hover:text-[#8C6D42] transition-colors cursor-pointer">
            {product.name}
          </h3>
        </Link>

        {/* Pricing: Cut Original Price + Bold Discount Price (Matches Reference Screenshot) */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="font-sans font-normal text-stone-400 line-through text-xs sm:text-sm">
            {formatPrice(originalPrice)}
          </span>
          <span className="font-sans font-bold text-[#D92D20] text-sm sm:text-base">
            {formatPrice(currentPrice)}
          </span>
        </div>

        {/* Frame Color Swatches */}
        {colors.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2.5">
            {colors.map((color, idx) => {
              const isSelected = selectedColorIndex === idx;
              return (
                <button
                  key={color.name || idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColorIndex(idx);
                  }}
                  title={color.name}
                  className="group/swatch relative flex items-center justify-center cursor-pointer transition-transform"
                >
                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full border border-stone-800 flex items-center justify-center p-[2px] shadow-2xs">
                      <span
                        className="w-full h-full rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex || '#8EB1CD' }}
                      />
                    </span>
                  ) : (
                    <span
                      className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.hex || '#8EB1CD' }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
