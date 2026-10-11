import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Customer from '@/models/Customer';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { fullName, email, phone, password } = await req.json();

    if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields (Name, Gmail, Phone, and Password).' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = fullName.trim();

    // 6-digit OTP code for Gmail verification
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const customerData = {
      id: `cust-${Date.now()}`,
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: password.trim(),
      isVerified: false,
      verificationCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await connectToDatabase();
      if (db) {
        let existing = await Customer.findOne({ email: cleanEmail });
        if (existing) {
          if (existing.isVerified) {
            return NextResponse.json(
              { success: false, message: 'An account with this Gmail already exists. Please sign in.' },
              { status: 400 }
            );
          }
          existing.fullName = cleanName;
          existing.phone = cleanPhone;
          existing.password = password.trim();
          existing.verificationCode = verificationCode;
          await existing.save();
        } else {
          await Customer.create(customerData);
        }
      }
    } catch (err) {
      console.warn('DB register fallback:', err.message);
    }

    // Save to local server store
    updateStoreState((state) => {
      const existingIdx = (state.customers || []).findIndex((c) => c.email === cleanEmail);
      let updatedCustomers = [...(state.customers || [])];
      if (existingIdx >= 0) {
        if (updatedCustomers[existingIdx].isVerified) {
          // already verified
          return state;
        }
        updatedCustomers[existingIdx] = {
          ...updatedCustomers[existingIdx],
          ...customerData,
          id: updatedCustomers[existingIdx].id,
        };
      } else {
        updatedCustomers.push(customerData);
      }
      return { ...state, customers: updatedCustomers };
    });

    return NextResponse.json({
      success: true,
      message: `Verification code generated for ${cleanEmail}. Please enter the 6-digit code to activate your account.`,
      email: cleanEmail,
      code: verificationCode, // Returned for instant testing and simulated email delivery
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
