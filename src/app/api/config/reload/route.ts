import { NextRequest, NextResponse } from 'next/server';
import { configManager } from '@/lib/config/configManager';
import { verifyAdminSession } from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // 1. Verify authorization: either admin session cookie or local loopback caller
  const token = req.cookies.get('mazu_admin_session')?.value;
  const isAuth = token && verifyAdminSession(token).valid;

  const host = req.headers.get('host') || '';
  const xForwardedFor = req.headers.get('x-forwarded-for') || '';
  const isLoopback =
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    xForwardedFor === '127.0.0.1' ||
    xForwardedFor === '::1';

  if (!isAuth && !isLoopback) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin session or local loopback required.' },
      { status: 401 }
    );
  }

  try {
    const result = configManager.reload();
    return NextResponse.json({
      success: true,
      message: 'Configuration reloaded lively from persistent storage and database.',
      version: result.version,
      count: result.count,
      keys: result.keys,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('[API /api/config/reload POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to reload configuration' },
      { status: 500 }
    );
  }
}
