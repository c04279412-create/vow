import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';

import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

function buildProductFilter(id) {
  const conditions = [{ id: id }, { slug: id }];
  if (mongoose.Types.ObjectId.isValid(id)) {
    conditions.push({ _id: id });
  }
  return { $or: conditions };
}

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const db = await connectToDatabase();
    if (db) {
      const product = await Product.findOne(buildProductFilter(id));
      if (product) return NextResponse.json({ success: true, product }, { headers: noCacheHeaders });
    }
  } catch (err) {
    console.warn('DB read fallback:', err.message);
  }

  const product = getStoreState().products.find((p) => p.id === id || p.slug === id || p._id === id);
  if (!product) {
    return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404, headers: noCacheHeaders });
  }
  return NextResponse.json({ success: true, product }, { headers: noCacheHeaders });
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();

    try {
      const db = await connectToDatabase();
      if (db) {
        const updated = await Product.findOneAndUpdate(
          buildProductFilter(id),
          body,
          { new: true }
        );
        if (updated) {
          updateStoreState((state) => ({
            ...state,
            products: state.products.map((p) => (p.id === id || p._id === id || p.slug === id ? updated.toObject() : p)),
          }));
          return NextResponse.json({ success: true, product: updated }, { headers: noCacheHeaders });
        }
      }
    } catch (err) {
      console.warn('DB update fallback:', err.message);
    }

    let found = false;
    updateStoreState((state) => {
      const nextProducts = state.products.map((p) => {
        if (p.id === id || p._id === id || p.slug === id) {
          found = true;
          return { ...p, ...body, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      return { ...state, products: nextProducts };
    });

    const updatedProd = getStoreState().products.find((p) => p.id === id || p._id === id || p.slug === id);
    return NextResponse.json({ success: true, product: updatedProd }, { headers: noCacheHeaders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    const db = await connectToDatabase();
    if (db) {
      await Product.findOneAndDelete(buildProductFilter(id));
    }
  } catch (err) {}

  updateStoreState((state) => ({
    ...state,
    products: state.products.filter((p) => p.id !== id && p._id !== id && p.slug !== id),
  }));

  return NextResponse.json({ success: true, message: 'Product deleted' }, { headers: noCacheHeaders });
}
