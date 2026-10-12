import { Suspense } from 'react';
import CategoryDetailClient from './CategoryDetailClient';
import { initialCategories } from '@/lib/dataStore';

export async function generateStaticParams() {
  const params = initialCategories.map((c) => ({
    slug: c.slug || c.id,
  }));
  params.push({ slug: 'all' });
  return params;
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center font-serif text-[#C59A27]">Loading Keepsakes...</div>}>
      <CategoryDetailClient />
    </Suspense>
  );
}
