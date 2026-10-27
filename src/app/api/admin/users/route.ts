import { NextRequest, NextResponse } from 'next/server';
import { 
  verifyAdminSession, 
  getAdminUsers, 
  createAdminUser, 
  updateAdminPassword, 
  deleteAdminUser 
} from '@/lib/auth/adminAuth';

function checkAuth(req: NextRequest): boolean {
  const token = req.cookies.get('mazu_admin_session')?.value;
  if (!token) return false;
  const session = verifyAdminSession(token);
  return session.valid;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const users = getAdminUsers();
  return NextResponse.json({ success: true, users });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { action, username, password, newPassword } = await req.json();

    if (action === 'create') {
      const res = createAdminUser(username, password);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Admin '${username}' created.` });
    }

    if (action === 'passwd') {
      const res = updateAdminPassword(username, newPassword);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Password updated for '${username}'.` });
    }

    if (action === 'del') {
      const res = deleteAdminUser(username);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: `Admin '${username}' removed.` });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
