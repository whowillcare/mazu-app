import { NextResponse } from 'next/server';
import { masterRepository } from '@/lib/masters/masterRepository';
import { MasterQuotaService } from '@/lib/masters/quotaService';

export async function GET() {
  try {
    const masters = masterRepository.getActiveMasters();
    const policy = MasterQuotaService.getPolicy();

    return NextResponse.json({
      success: true,
      masters,
      policy,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load Oracle Masters';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
