import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const resource = searchParams.get('resource') || 'all';

  const state = getStoreState();
  if (resource === 'coupons') return NextResponse.json({ success: true, coupons: state.coupons }, { headers: noCacheHeaders });
  if (resource === 'banners') return NextResponse.json({ success: true, banners: state.banners }, { headers: noCacheHeaders });
  if (resource === 'reviews') return NextResponse.json({ success: true, reviews: state.reviews }, { headers: noCacheHeaders });
  if (resource === 'users') return NextResponse.json({ success: true, users: state.users }, { headers: noCacheHeaders });
  if (resource === 'collections') return NextResponse.json({ success: true, collections: state.collections }, { headers: noCacheHeaders });
  if (resource === 'auditLogs') return NextResponse.json({ success: true, auditLogs: state.auditLogs }, { headers: noCacheHeaders });

  return NextResponse.json(
    {
      success: true,
      coupons: state.coupons,
      banners: state.banners,
      reviews: state.reviews,
      users: state.users,
      collections: state.collections,
      auditLogs: state.auditLogs,
    },
    { headers: noCacheHeaders }
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { resource, data } = body;

    if (!resource || !data) {
      return NextResponse.json({ success: false, message: 'Resource and data required' }, { status: 400 });
    }

    updateStoreState((state) => {
      if (resource === 'coupons') {
        const item = { ...data, id: data.id || `cp-${Date.now()}` };
        return { ...state, coupons: [item, ...state.coupons] };
      }
      if (resource === 'banners') {
        const item = { ...data, id: data.id || `ban-${Date.now()}` };
        return { ...state, banners: [item, ...state.banners] };
      }
      if (resource === 'reviews') {
        const item = { ...data, id: data.id || `rev-${Date.now()}` };
        return { ...state, reviews: [item, ...state.reviews] };
      }
      if (resource === 'users') {
        const item = { ...data, id: data.id || `usr-${Date.now()}` };
        return { ...state, users: [item, ...state.users] };
      }
      if (resource === 'collections') {
        const item = { ...data, id: data.id || `col-${Date.now()}` };
        return { ...state, collections: [item, ...state.collections] };
      }
      if (resource === 'auditLogs') {
        const item = { ...data, id: data.id || `audit-${Date.now()}`, timestamp: new Date().toISOString() };
        return { ...state, auditLogs: [item, ...state.auditLogs] };
      }
      return state;
    });

    return NextResponse.json({ success: true, state: getStoreState() }, { headers: noCacheHeaders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { resource, id, data } = body;

    if (!resource || !id || !data) {
      return NextResponse.json({ success: false, message: 'Resource, id, and data required' }, { status: 400 });
    }

    updateStoreState((state) => {
      if (resource === 'users') {
        return {
          ...state,
          users: state.users.map((u) => (u.id === id || u._id === id ? { ...u, ...data } : u)),
        };
      }
      if (resource === 'collections') {
        return {
          ...state,
          collections: state.collections.map((c) => (c.id === id || c._id === id ? { ...c, ...data } : c)),
        };
      }
      if (resource === 'coupons') {
        return {
          ...state,
          coupons: state.coupons.map((cp) => (cp.id === id || cp._id === id ? { ...cp, ...data } : cp)),
        };
      }
      if (resource === 'banners') {
        return {
          ...state,
          banners: state.banners.map((b) => (b.id === id || b._id === id ? { ...b, ...data } : b)),
        };
      }
      if (resource === 'reviews') {
        return {
          ...state,
          reviews: state.reviews.map((r) => (r.id === id || r._id === id ? { ...r, ...data } : r)),
        };
      }
      return state;
    });

    return NextResponse.json({ success: true, state: getStoreState() }, { headers: noCacheHeaders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const resource = searchParams.get('resource');
    const id = searchParams.get('id');

    if (!resource || !id) {
      return NextResponse.json({ success: false, message: 'Resource and id required' }, { status: 400 });
    }

    updateStoreState((state) => {
      if (resource === 'users') {
        return {
          ...state,
          users: state.users.filter((u) => u.id !== id && u._id !== id),
        };
      }
      if (resource === 'collections') {
        return {
          ...state,
          collections: state.collections.filter((c) => c.id !== id && c._id !== id),
        };
      }
      if (resource === 'coupons') {
        return {
          ...state,
          coupons: state.coupons.filter((cp) => cp.id !== id && cp._id !== id),
        };
      }
      if (resource === 'banners') {
        return {
          ...state,
          banners: state.banners.filter((b) => b.id !== id && b._id !== id),
        };
      }
      if (resource === 'reviews') {
        return {
          ...state,
          reviews: state.reviews.filter((r) => r.id !== id && r._id !== id),
        };
      }
      return state;
    });

    return NextResponse.json({ success: true, state: getStoreState() }, { headers: noCacheHeaders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
