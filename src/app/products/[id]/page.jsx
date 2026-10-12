import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';
import { initialProducts } from '@/lib/dataStore';

export async function generateStaticParams() {
  const params = initialProducts.map((p) => ({
    id: p.id || p.slug,
  }));
  return params;
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-serif text-[#C59A27]">Loading Keepsake Details...</div>}>
      <ProductDetailClient />
    </Suspense>
  );
}
