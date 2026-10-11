import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Order from '@/models/Order';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('paymentStatus');

  try {
    const db = await connectToDatabase();
    if (db) {
      let query = {};
      if (status) query.orderStatus = status;
      if (paymentStatus) query['payment.paymentStatus'] = paymentStatus;
      const orders = await Order.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, orders }, { headers: noCacheHeaders });
    }
  } catch (err) {
    console.warn('DB read fallback for orders:', err.message);
  }

  let orders = [...getStoreState().orders];
  if (status) {
    orders = orders.filter((o) => o.orderStatus === status);
  }
  if (paymentStatus) {
    orders = orders.filter((o) => o.payment?.paymentStatus === paymentStatus);
  }

  return NextResponse.json({ success: true, orders }, { headers: noCacheHeaders });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const storeSettings = getStoreState().settings;

    // Dynamically calculate Advance Payment from Admin Settings
    const dynamicAdvancePercent = Number(storeSettings.advancePaymentPercentage) || 30;
    const subtotal = Number(body.pricing?.subtotal) || 0;
    const discount = Number(body.pricing?.discount) || 0;
    const shippingFee = Number(body.pricing?.shippingFee) || 0;
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    const advanceAmount = Math.round((totalAmount * dynamicAdvancePercent) / 100);
    const remainingBalance = totalAmount - advanceAmount;

    // Order number generator e.g. VC-89215
    const orderNumber = `VC-${Math.floor(10000 + Math.random() * 90000)}`;

    const customerObj = body.customer || {};
    const fullName = customerObj.fullName || body.customerName || 'Valued Customer';
    const phone = customerObj.phone || body.customerPhone || '';
    const email = customerObj.email || body.customerEmail || '';
    const address = customerObj.address || body.customerAddress || '';
    const city = customerObj.city || body.customerCity || '';
    const province = customerObj.province || body.customerProvince || 'Punjab';
    const postalCode = customerObj.postalCode || body.customerPostalCode || '';
    const notes = customerObj.notes || body.customerNotes || '';

    const normalizedItems = (body.items || []).map((item) => ({
      productId: item.productId || item.id || `item-${Date.now()}`,
      productName: item.productName || item.name || 'Bespoke Keepsake',
      productType: item.productType || 'TYPE_B',
      price: Number(item.price || item.unitPrice || item.basePrice) || 0,
      quantity: Number(item.quantity) || 1,
      selectedSize: typeof item.selectedSize === 'object' ? item.selectedSize?.name : (item.selectedSize || 'Standard'),
      selectedColor: typeof item.selectedColor === 'object' ? item.selectedColor?.name : (item.selectedColor || 'Standard'),
      customTextInputs: item.customTextInputs || item.customFieldValues || item.customInputs || {},
      uploadedPhotos: Array.isArray(item.uploadedPhotos) ? item.uploadedPhotos : [],
      deliveryCharges: Number(item.deliveryCharges) || 0,
    }));

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customer: {
        fullName,
        phone,
        email,
        address,
        city,
        province,
        postalCode,
        notes,
      },
      items: normalizedItems,
      pricing: {
        subtotal,
        discount,
        shippingFee,
        totalAmount,
        advancePercentage: dynamicAdvancePercent,
        advanceAmount,
        remainingBalance,
      },
      payment: {
        method: body.payment?.method || 'bank_transfer',
        paymentScreenshotUrl: body.payment?.paymentScreenshotUrl || '',
        paymentStatus: 'pending_verification',
        verifiedAt: null,
        verifiedBy: null,
        notes: body.payment?.notes || '',
      },
      orderStatus: 'new',
      timeline: [
        {
          status: 'new',
          message: `Order submitted with ${dynamicAdvancePercent}% advance payment slip. Awaiting verification.`,
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        const created = await Order.create(newOrder);
        updateStoreState((state) => ({ ...state, orders: [created.toObject(), ...state.orders] }));
        return NextResponse.json({ success: true, order: created }, { headers: noCacheHeaders });
      }
    } catch (err) {
      console.warn('DB write fallback for order:', err.message);
    }

    updateStoreState((state) => ({
      ...state,
      orders: [newOrder, ...state.orders],
    }));

    return NextResponse.json({ success: true, order: newOrder }, { headers: noCacheHeaders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
