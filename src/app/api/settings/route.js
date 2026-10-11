import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';
import { connectToDatabase } from '@/lib/db';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      let settingDoc = await Setting.findOne();
      if (!settingDoc) {
        settingDoc = await Setting.create(getStoreState().settings);
      }
      return NextResponse.json(
        { success: true, settings: settingDoc },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }
  } catch (err) {
    console.warn('DB read fallback for settings:', err.message);
  }

  return NextResponse.json(
    { success: true, settings: getStoreState().settings },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
  );
}

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate advance payment percentage (allows 0 for optional/disabled)
    if (body.advancePaymentPercentage !== undefined) {
      body.advancePaymentPercentage = Math.min(100, Math.max(0, Number(body.advancePaymentPercentage)));
    }

    const db = await connectToDatabase();
    if (db) {
      const updated = await Setting.findOneAndUpdate({}, body, { new: true, upsert: true });
      updateStoreState((state) => ({ ...state, settings: updated.toObject() }));
      return NextResponse.json(
        { success: true, settings: updated },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      );
    }

    updateStoreState((state) => ({
      ...state,
      settings: { ...state.settings, ...body },
    }));

    return NextResponse.json(
      { success: true, settings: getStoreState().settings },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
