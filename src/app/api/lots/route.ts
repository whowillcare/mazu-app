import { NextResponse } from 'next/server';
import { getCanonicalLots } from '@/lib/lots/lotsRepository';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeInternal = searchParams.get('includeInternal') === 'true';
  const role = request.headers.get('x-user-role');

  // RBAC: Only admin role can request internal criteria
  const allowInternal = includeInternal && role === 'admin';

  try {
    const lots = getCanonicalLots(allowInternal);
    return NextResponse.json({
      total: lots.length,
      lots,
    });
  } catch (error) {
    console.error('Error fetching lots:', error);
    return NextResponse.json({ error: 'Failed to load canonical lots' }, { status: 500 });
  }
}
