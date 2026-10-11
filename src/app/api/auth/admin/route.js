import { NextResponse } from 'next/server';
import { getStoreState, updateStoreState } from '@/lib/serverStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_ADMIN_EMAIL = 'admin@vowcrafts.com';
const DEFAULT_ADMIN_PASS = 'admin@vowcrafts2026';

// Helper to get active credentials
function getAdminCredentials() {
  const state = getStoreState();
  const configured = state?.settings?.adminAuth;
  return {
    email: configured?.email || DEFAULT_ADMIN_EMAIL,
    password: configured?.password || DEFAULT_ADMIN_PASS,
  };
}

// GET: Check active session (Strict, no auto-login cookie bypass)
export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';

    if (authHeader.startsWith('Bearer vow_')) {
      const creds = getAdminCredentials();
      return NextResponse.json({
        authenticated: true,
        user: {
          email: creds.email,
          name: 'Master Artisan Asad',
          role: 'Super Admin',
        },
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (err) {
    return NextResponse.json({ authenticated: false, error: err.message });
  }
}

// POST: Log in with Gmail and Password
export async function POST(req) {
  try {
    const body = await req.json();
    const inputEmail = (body.email || '').trim().toLowerCase();
    const inputPassword = (body.password || '').trim();

    if (!inputEmail || !inputPassword) {
      return NextResponse.json(
        { success: false, error: 'Please enter both Gmail / Email address and Password.' },
        { status: 400 }
      );
    }

    const creds = getAdminCredentials();
    const credsEmail = creds.email.trim().toLowerCase();
    const credsPass = creds.password.trim();

    // Check primary master credentials
    const isMasterMatch = inputEmail === credsEmail && inputPassword === credsPass;

    // Also check secondary registered admin staff accounts if any
    const state = getStoreState();
    const staffMatch = (state.users || []).find(
      (u) =>
        (u.email || '').trim().toLowerCase() === inputEmail &&
        (u.password ? u.password.trim() === inputPassword : inputPassword === credsPass)
    );

    if (isMasterMatch || staffMatch) {
      const matchedUser = staffMatch || {
        email: creds.email,
        name: 'Master Artisan Asad',
        role: 'Super Admin',
      };

      const token = `vow_sec_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      const response = NextResponse.json({
        success: true,
        token,
        user: {
          email: matchedUser.email,
          name: matchedUser.name || 'Store Administrator',
          role: matchedUser.role || 'Super Admin',
        },
        message: 'Authentication successful',
      });

      // Clear any persistent cookie to enforce fresh login on refresh / browser reopen
      response.cookies.delete('vowcrafts_admin_session');

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid Gmail address or Password. Access denied.' },
      { status: 401 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Authentication error: ${err.message}` },
      { status: 500 }
    );
  }
}

// PUT: Change Admin Login Credentials
export async function PUT(req) {
  try {
    const body = await req.json();
    const { currentPassword, newEmail, newPassword } = body;

    const creds = getAdminCredentials();

    if (currentPassword !== creds.password) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect. Unable to update credentials.' },
        { status: 400 }
      );
    }

    if (!newEmail || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'New Email and Password must be provided.' },
        { status: 400 }
      );
    }

    // Save updated adminAuth
    updateStoreState((state) => ({
      ...state,
      settings: {
        ...state.settings,
        adminAuth: {
          email: newEmail.trim().toLowerCase(),
          password: newPassword.trim(),
          updatedAt: new Date().toISOString(),
        },
      },
    }));

    return NextResponse.json({
      success: true,
      message: 'Admin Gmail and Password updated successfully!',
      credentials: {
        email: newEmail.trim().toLowerCase(),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `Update failed: ${err.message}` },
      { status: 500 }
    );
  }
}

// DELETE: Sign Out / Invalidate Session
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('vowcrafts_admin_session', '', {
    path: '/',
    maxAge: 0,
  });
  return response;
}
