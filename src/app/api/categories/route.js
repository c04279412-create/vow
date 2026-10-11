import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const categories = await Category.find().sort({ displayOrder: 1 });
      return NextResponse.json({ success: true, categories }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      });
    }
  } catch (err) {
    console.warn('DB read fallback for categories:', err.message);
  }

  const rawCats = getStoreState().categories || [];
  const sorted = [...rawCats].sort((a, b) => {
    const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 999;
    const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 999;
    return orderA - orderB;
  });

  return NextResponse.json(
    { success: true, categories: sorted },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existingCats = getStoreState().categories || [];
    const maxOrder = existingCats.reduce((max, c) => Math.max(max, c.displayOrder || 0), 0);
    const newCategory = {
      ...body,
      id: `cat-${Date.now()}`,
      slug,
      displayOrder: body.displayOrder !== undefined ? body.displayOrder : maxOrder + 1,
      subcategories: body.subcategories || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const created = await Category.create(newCategory);
        updateStoreState((state) => ({ ...state, categories: [...state.categories, created.toObject()] }));
        return NextResponse.json({ success: true, category: created });
      }
    } catch (err) {}

    updateStoreState((state) => ({
      ...state,
      categories: [...state.categories, newCategory],
    }));

    return NextResponse.json({ success: true, category: newCategory });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
