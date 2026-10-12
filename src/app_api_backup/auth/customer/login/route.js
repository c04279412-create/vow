import { NextResponse } from 'next/server';
import { getStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/models/Customer';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please enter both your Gmail and password.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    let matchedCustomer = null;

    try {
      const db = await connectToDatabase();
      if (db) {
        const found = await Customer.findOne({ email: cleanEmail });
        if (found) {
          matchedCustomer = found.toObject();
        }
      }
    } catch (err) {
      console.warn('DB login fallback:', err.message);
    }

    if (!matchedCustomer) {
      const state = getStoreState();
      matchedCustomer = (state.customers || []).find((c) => c.email === cleanEmail);
    }

    if (!matchedCustomer) {
      return NextResponse.json(
        { success: false, message: 'No account found with this Gmail. Please create an account.' },
        { status: 404 }
      );
    }

    if (matchedCustomer.password && matchedCustomer.password !== cleanPassword) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    if (!matchedCustomer.isVerified) {
      return NextResponse.json(
        {
          success: false,
          needsVerification: true,
          email: cleanEmail,
          message: 'Your account is pending verification. Please verify your 6-digit code.',
        },
        { status: 403 }
      );
    }

    const safeCustomer = {
      id: matchedCustomer.id,
      fullName: matchedCustomer.fullName,
      email: matchedCustomer.email,
      phone: matchedCustomer.phone,
      isVerified: true,
      city: matchedCustomer.city || '',
      address: matchedCustomer.address || '',
    };

    return NextResponse.json({
      success: true,
      message: 'Sign in successful. Welcome back!',
      customer: safeCustomer,
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
