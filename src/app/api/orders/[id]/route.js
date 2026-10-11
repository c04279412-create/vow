import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const db = await connectToDatabase();
    if (db) {
      const order = await Order.findOne({ $or: [{ _id: id }, { id: id }, { orderNumber: id }] });
      if (order) return NextResponse.json({ success: true, order }, { headers: noCacheHeaders });
    }
  } catch (err) {}

  const order = getStoreState().orders.find((o) => o.id === id || o.orderNumber === id || o._id === id);
  if (!order) {
    return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, order }, { headers: noCacheHeaders });
}

export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();

    try {
      const db = await connectToDatabase();
      if (db) {
        const updated = await Order.findOneAndUpdate(
          { $or: [{ _id: id }, { id: id }, { orderNumber: id }] },
          body,
          { new: true }
        );
        if (updated) {
          updateStoreState((state) => ({
            ...state,
            orders: state.orders.map((o) => (o.id === id || o.orderNumber === id || o._id === id ? updated.toObject() : o)),
          }));
          return NextResponse.json({ success: true, order: updated }, { headers: noCacheHeaders });
        }
      }
    } catch (err) {}

    updateStoreState((state) => {
      const nextOrders = state.orders.map((o) => {
        if (o.id === id || o.orderNumber === id || o._id === id) {
          const merged = { ...o, ...body, updatedAt: new Date().toISOString() };
          if (body.timelineEvent) {
            merged.timeline = [...(merged.timeline || []), body.timelineEvent];
          }
          return merged;
        }
        return o;
      });
      return { ...state, orders: nextOrders };
    });

    const updatedOrder = getStoreState().orders.find((o) => o.id === id || o.orderNumber === id || o._id === id);
    return NextResponse.json({ success: true, order: updatedOrder }, { headers: noCacheHeaders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
