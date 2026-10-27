import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/adminAuth';
import { getCanonicalLots, updateCanonicalLot } from '@/lib/lots/lotsRepository';
import { CanonicalLot } from '@/lib/types/lots';

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
    const lots = getCanonicalLots(true);
    return NextResponse.json({
      success: true,
      total: lots.length,
      lots,
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
    const lot = body.lot as CanonicalLot;

    if (!lot || typeof lot.lot_number !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid lot payload' }, { status: 400 });
    }

    updateCanonicalLot(lot);

    return NextResponse.json({
      success: true,
      message: `Lot #${lot.lot_number} successfully updated and compiled.`,
      lot,
    });
  } catch (err: any) {
    console.error('[API Admin Lots POST] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update lot' }, { status: 500 });
  }
}
