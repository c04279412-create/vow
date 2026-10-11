import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Product from '@/models/Product';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const search = searchParams.get('search');

  try {
    const db = await connectToDatabase();
    if (db) {
      let query = {};
      if (category) {
        query.$or = [
          { category: category },
          { category: { $regex: new RegExp(`^${category}$`, 'i') } },
          { additionalCategories: category },
          { additionalCategories: { $regex: new RegExp(`^${category}$`, 'i') } },
        ];
      }
      if (type) query.productType = type;
      if (search) query.name = { $regex: search, $options: 'i' };
      const products = await Product.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, products }, { headers: noCacheHeaders });
    }
  } catch (err) {
    console.warn('DB read fallback for products:', err.message);
  }

  let products = [...getStoreState().products];
  if (category) {
    const catLower = category.toLowerCase();
    products = products.filter((p) => {
      const matchPrimary = p.category && p.category.toLowerCase() === catLower;
      const matchAdditional = Array.isArray(p.additionalCategories) && p.additionalCategories.some((ac) => ac && ac.toLowerCase() === catLower);
      return matchPrimary || matchAdditional;
    });
  }
  if (type) {
    products = products.filter((p) => p.productType === type);
  }
  if (search) {
    const s = search.toLowerCase();
    products = products.filter((p) => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
  }

  return NextResponse.json({ success: true, products }, { headers: noCacheHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newProduct = {
      ...body,
      id: `prod-${Date.now()}`,
      slug,
      stock: Number(body.stock) || 10,
      simulatedViewers: Number(body.simulatedViewers) || 18,
      basePrice: Number(body.basePrice) || 0,
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      deliveryCharges: body.deliveryCharges !== undefined ? Number(body.deliveryCharges) : 0,
      minDeliveryDays: Number(body.minDeliveryDays) || 4,
      maxDeliveryDays: Number(body.maxDeliveryDays) || 10,
      customFields: body.customFields || [],
      sizeSectionTitle: body.sizeSectionTitle || 'Frame Size Variations',
      colorSectionTitle: body.colorSectionTitle || 'Frame Colors & Finishes',
      sizes: body.sizes || [],
      frameColors: body.frameColors || [],
      images: body.images && body.images.length ? body.images : [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const created = await Product.create(newProduct);
        updateStoreState((state) => ({ ...state, products: [created.toObject(), ...state.products] }));
        return NextResponse.json({ success: true, product: created }, { headers: noCacheHeaders });
      }
    } catch (err) {
      console.warn('DB write fallback for product:', err.message);
    }

    updateStoreState((state) => ({
      ...state,
      products: [newProduct, ...state.products],
    }));

    return NextResponse.json({ success: true, product: newProduct }, { headers: noCacheHeaders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
