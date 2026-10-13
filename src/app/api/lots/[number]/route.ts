import { NextResponse } from 'next/server';
import { getLotByNumber } from '@/lib/lots/lotsRepository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;
  const lotNum = parseInt(number, 10);

  if (isNaN(lotNum) || lotNum < 1 || lotNum > 60) {
    return NextResponse.json({ error: 'Lot number must be between 1 and 60' }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const includeInternal = searchParams.get('includeInternal') === 'true';
  const role = request.headers.get('x-user-role');
  const allowInternal = includeInternal && role === 'admin';

  const lot = getLotByNumber(lotNum, allowInternal);
  if (!lot) {
    return NextResponse.json({ error: 'Lot not found' }, { status: 404 });
  }

  return NextResponse.json(lot);
}
