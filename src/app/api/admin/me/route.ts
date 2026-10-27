import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession, hasAnyAdminUser } from '@/lib/auth/adminAuth';
import { getConfig } from '@/lib/config/configManager';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('mazu_admin_session')?.value;
  const adminUrlPath = getConfig('ADMIN_URL_PATH') || '/mod';
  const hasAdmins = hasAnyAdminUser();

  if (!token) {
    return NextResponse.json({
      authenticated: false,
      hasAdmins,
      adminUrlPath,
    });
  }

  const session = verifyAdminSession(token);
  if (!session.valid) {
    return NextResponse.json({
      authenticated: false,
      hasAdmins,
      adminUrlPath,
    });
  }

  return NextResponse.json({
    authenticated: true,
    username: session.username,
    hasAdmins,
    adminUrlPath,
  });
}
