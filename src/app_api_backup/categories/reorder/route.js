import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req) {
  try {
    const body = await req.json();
    let orderedIds = [];

    if (Array.isArray(body)) {
      orderedIds = body.map((item) => (typeof item === 'string' ? item : item.id || item._id || item.slug));
    } else if (Array.isArray(body.orderedIds)) {
      orderedIds = body.orderedIds.map((item) => (typeof item === 'string' ? item : item.id || item._id || item.slug));
    } else if (Array.isArray(body.categories)) {
      orderedIds = body.categories.map((item) => (typeof item === 'string' ? item : item.id || item._id || item.slug));
    }

    if (!orderedIds || orderedIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No category order provided' }, { status: 400 });
    }

    // 1. Try updating MongoDB if connected
    try {
      const db = await connectToDatabase();
      if (db) {
        const updatePromises = orderedIds.map((id, index) =>
          Category.updateOne(
            { $or: [{ _id: id }, { id: id }, { slug: id }] },
            { $set: { displayOrder: index + 1 } }
          )
        );
        await Promise.all(updatePromises);
      }
    } catch (dbErr) {
      console.warn('MongoDB reorder update warning:', dbErr.message);
    }

    // 2. Update local serverStore (data/store_state.json)
    const updatedStore = updateStoreState((state) => {
      const currentCats = [...(state.categories || [])];
      
      // Map existing categories with new displayOrder based on orderedIds index
      const reordered = [];
      const remaining = [];

      orderedIds.forEach((id, index) => {
        const found = currentCats.find((c) => c.id === id || c._id === id || c.slug === id);
        if (found) {
          reordered.push({
            ...found,
            displayOrder: index + 1,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      // Include any categories not mentioned in orderedIds at the end
      currentCats.forEach((c) => {
        const inReordered = reordered.some((r) => r.id === c.id || r._id === c._id || r.slug === c.slug);
        if (!inReordered) {
          remaining.push({
            ...c,
            displayOrder: reordered.length + remaining.length + 1,
          });
        }
      });

      const finalCategories = [...reordered, ...remaining];
      return {
        ...state,
        categories: finalCategories,
      };
    });

    const sortedCats = [...(updatedStore.categories || [])].sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    return NextResponse.json(
      { success: true, categories: sortedCats },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err) {
    console.error('Error reordering categories:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  return POST(req);
}
