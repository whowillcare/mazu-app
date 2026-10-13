import { NextResponse } from 'next/server';
import { calculateTrueSolarTime, calculateFourPillars, calculateLotInteraction } from '@/lib/bazi/baziEngine';
import { getLotByNumber } from '@/lib/lots/lotsRepository';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      birthDate, // "1992-10-14"
      birthTime = '12:00', // "09:30"
      longitude = 121.5, // Taipei ~121.5, San Francisco ~-122.4, New York ~-74.0
      timeZoneOffset = 8, // UTC+8
      lotNumber = 1,
    } = body;

    if (!birthDate) {
      return NextResponse.json({ error: 'Birth date is required' }, { status: 400 });
    }

    const [hours, minutes] = birthTime.split(':').map((s: string) => parseInt(s, 10) || 0);
    const dateObj = new Date(birthDate);
    dateObj.setHours(hours, minutes, 0, 0);

    // 1. True Solar Time adjustment
    const { adjustedDate, offsetMinutes } = calculateTrueSolarTime(dateObj, longitude, timeZoneOffset);

    // 2. Four Pillars computation
    const pillars = calculateFourPillars(adjustedDate);

    // 3. Load Lot
    const lot = getLotByNumber(lotNumber);
    const lotGanzhi = lot?.ganzhi.zh || '甲子';

    // 4. Compute interaction matrix
    const interaction = calculateLotInteraction(pillars, lotGanzhi);

    return NextResponse.json({
      success: true,
      input: {
        rawBirthDate: birthDate,
        rawBirthTime: birthTime,
        longitude,
        timeZoneOffset,
      },
      solarAdjustment: {
        trueSolarTime: adjustedDate.toISOString(),
        offsetMinutes,
      },
      pillars,
      lotNumber,
      lotGanzhi,
      interaction,
    });
  } catch (error) {
    console.error('Error calculating BaZi:', error);
    return NextResponse.json({ error: 'Failed to calculate personalized BaZi' }, { status: 500 });
  }
}
