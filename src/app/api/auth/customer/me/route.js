import { NextResponse } from 'next/server';
import { getStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/models/Customer';
import Order from '@/models/Order';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email')?.toLowerCase()?.trim();
  const phone = searchParams.get('phone')?.replace(/[^0-9]/g, '');

  if (!email && !phone) {
    return NextResponse.json({ success: false, message: 'Email or phone required' }, { status: 400 });
  }

  try {
    let customer = null;
    let orders = [];

    try {
      const db = await connectToDatabase();
      if (db) {
        const query = [];
        if (email) query.push({ email });
        if (phone) query.push({ phone });
        if (query.length > 0) {
          const found = await Customer.findOne({ $or: query });
          if (found) customer = found.toObject();
        }

        const orderQuery = [];
        if (email) orderQuery.push({ 'customer.email': { $regex: new RegExp(`^${email}$`, 'i') } });
        if (phone) orderQuery.push({ 'customer.phone': { $regex: new RegExp(phone, 'i') } });
        if (customer?.phone) orderQuery.push({ 'customer.phone': customer.phone });
        if (customer?.email) orderQuery.push({ 'customer.email': customer.email });

        if (orderQuery.length > 0) {
          orders = await Order.find({ $or: orderQuery }).sort({ createdAt: -1 });
        }
      }
    } catch (err) {
      console.warn('DB /me fallback:', err.message);
    }

    const state = getStoreState();
    if (!customer) {
      customer = (state.customers || []).find(
        (c) => (email && c.email?.toLowerCase() === email) || (phone && c.phone?.replace(/[^0-9]/g, '') === phone)
      );
    }

    if (!orders || orders.length === 0) {
      orders = (state.orders || []).filter((o) => {
        const oEmail = o.customer?.email?.toLowerCase();
        const oPhone = (o.customer?.phone || '').replace(/[^0-9]/g, '');
        if (email && oEmail === email) return true;
        if (phone && oPhone.includes(phone)) return true;
        if (customer?.email && oEmail === customer.email.toLowerCase()) return true;
        if (customer?.phone && oPhone.includes(customer.phone.replace(/[^0-9]/g, ''))) return true;
        return false;
      });
    }

    // Fallback: If customer account not found but orders exist, create guest customer object
    if (!customer && orders && orders.length > 0) {
      const firstCust = orders[0].customer || {};
      customer = {
        id: `guest-${orders[0].orderNumber || Date.now()}`,
        fullName: firstCust.fullName || 'Valued Patron',
        email: firstCust.email || email || '',
        phone: firstCust.phone || phone || '',
        city: firstCust.city || '',
        address: firstCust.address || '',
        isVerified: true,
      };
    }

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        city: customer.city || '',
        address: customer.address || '',
        isVerified: customer.isVerified ?? true,
      },
      orders: orders || [],
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
