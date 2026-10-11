import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const db = await connectToDatabase();
    if (db) {
      const category = await Category.findOne({ $or: [{ _id: id }, { id: id }, { slug: id }] });
      if (category) {
        return NextResponse.json({ success: true, category }, {
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
        });
      }
    }
  } catch (err) {}

  const category = getStoreState().categories.find((c) => c.id === id || c.slug === id || c._id === id);
  if (!category) {
    return NextResponse.json({ success: false, message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, category }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();

    try {
      const db = await connectToDatabase();
      if (db) {
        const updated = await Category.findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }, { slug: id }] },
          body,
          { new: true }
        );
        if (updated) {
          updateStoreState((state) => ({
            ...state,
            categories: state.categories.map((c) => (c.id === id || c._id === id || c.slug === id ? updated.toObject() : c)),
          }));
          return NextResponse.json({ success: true, category: updated }, {
            headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
          });
        }
      }
    } catch (err) {
      console.warn('DB update fallback:', err.message);
    }

    updateStoreState((state) => {
      const nextCategories = state.categories.map((c) => {
        if (c.id === id || c._id === id || c.slug === id) {
          return {
            ...c,
            ...body,
            subcategories: body.subcategories !== undefined ? body.subcategories : c.subcategories,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
      return { ...state, categories: nextCategories };
    });

    const updatedCat = getStoreState().categories.find((c) => c.id === id || c._id === id || c.slug === id);
    return NextResponse.json({ success: true, category: updatedCat }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const db = await connectToDatabase();
    if (db) {
      await Category.findOneAndDelete({ $or: [{ _id: id }, { id: id }] });
    }
  } catch (err) {}

  updateStoreState((state) => ({
    ...state,
    categories: state.categories.filter((c) => c.id !== id && c._id !== id && c.slug !== id),
  }));

  return NextResponse.json(
    { success: true, message: 'Category deleted successfully' },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}
