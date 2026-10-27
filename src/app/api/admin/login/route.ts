import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createAdminSession } from '@/lib/auth/adminAuth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const authRes = authenticateAdmin(username, password);
    if (!authRes.success) {
      return NextResponse.json(
        { success: false, error: authRes.error || 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const sessionToken = createAdminSession(username);

    const response = NextResponse.json({
      success: true,
      username: username.trim().toLowerCase(),
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'mazu_admin_session',
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('[API Admin Login] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
