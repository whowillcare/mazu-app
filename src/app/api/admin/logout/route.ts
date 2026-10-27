import { NextRequest, NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth/adminAuth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('mazu_admin_session')?.value;
  if (token) {
    destroyAdminSession(token);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('mazu_admin_session');
  return response;
}
