import { NextRequest, NextResponse } from 'next/server';
import { MasterQuotaService } from '@/lib/masters/quotaService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'seeker_1992';
    const masterId = searchParams.get('masterId') || undefined;
    const birthDate = searchParams.get('birthDate') || undefined;
    const birthTime = searchParams.get('birthTime') || undefined;
    const birthCity = searchParams.get('birthCity') || undefined;

    const quotaStatus = MasterQuotaService.getSeekerQuotaStatus(
      userId,
      birthDate ? { birthDate, birthTime, birthCity } : undefined
    );
    const history = MasterQuotaService.getChatHistory(userId, masterId, 40);

    return NextResponse.json({
      success: true,
      quotaStatus,
      history,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch quota status';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = 'seeker_1992',
      email,
      displayName,
      isRegistered,
      birthDate,
      birthTime,
      birthCity,
      longitude,
      timezoneOffset,
    } = body;

    MasterQuotaService.upsertSeekerProfile({
      userId,
      email,
      displayName,
      isRegistered,
      birthDate,
      birthTime,
      birthCity,
      longitude,
      timezoneOffset,
    });

    const quotaStatus = MasterQuotaService.getSeekerQuotaStatus(userId);

    return NextResponse.json({
      success: true,
      quotaStatus,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update seeker profile & quota';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
