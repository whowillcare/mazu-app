import { NextRequest, NextResponse } from 'next/server';
import { configManager } from '@/lib/config/configManager';
import { verifyAdminSession } from '@/lib/auth/adminAuth';

export async function GET() {
  try {
    const clientState = configManager.getClientConfigs();
    return NextResponse.json({
      success: true,
      ...clientState,
    });
  } catch (error: any) {
    console.error('[API /api/config GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('mazu_admin_session')?.value;
  if (!token || !verifyAdminSession(token).valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (body.resetToDefaults === true) {
      configManager.resetToDefaults();
      const clientState = configManager.getClientConfigs();
      return NextResponse.json({
        success: true,
        action: 'reset',
        ...clientState,
      });
    }

    const updates = body.updates || {};
    if (typeof updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid updates payload' },
        { status: 400 }
      );
    }

    const { updated } = configManager.setMultiple(updates);
    const clientState = configManager.getClientConfigs();

    return NextResponse.json({
      success: true,
      updated,
      ...clientState,
    });
  } catch (error: any) {
    console.error('[API /api/config POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
