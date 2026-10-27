import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/adminAuth';
import { astrologyRulesService } from '@/lib/bazi/astrologyRules';

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

  try {
    const rules = astrologyRulesService.getRules();
    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = astrologyRulesService.updateRules(body.rules || {});
    return NextResponse.json({
      success: true,
      message: 'Astrology and transit logic rules updated successfully.',
      rules: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update rules' }, { status: 500 });
  }
}
