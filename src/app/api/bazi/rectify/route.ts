import { NextRequest, NextResponse } from 'next/server';
import {
  buildRectificationQuestionnaire,
  solveBirthHour,
  RoughTimeSlot,
  generateCandidateHours,
} from '@/lib/bazi/hourRectification';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, birthDate, timeSlot, timeInterval, answers, location } = body;

    if (!birthDate) {
      return NextResponse.json(
        { success: false, error: 'Birth date is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const slot: RoughTimeSlot = (timeSlot || timeInterval || 'not_sure') as RoughTimeSlot;

    // Action 1: Get Candidate Hours & Questionnaire
    if (action === 'get_questionnaire') {
      const candidates = generateCandidateHours(birthDate, slot, location);
      const questions = buildRectificationQuestionnaire(birthDate, slot, location);

      return NextResponse.json({
        success: true,
        action: 'get_questionnaire',
        candidateCount: candidates.length,
        candidates: candidates.map((c) => ({
          branch: c.branch,
          shichenZh: c.shichenZh,
          shichenEn: c.shichenEn,
          timeRange: c.timeRange,
          hourPillar: c.pillar,
        })),
        questions,
      });
    }

    // Action 2: Solve Birth Hour using user's answers
    if (action === 'solve') {
      const result = solveBirthHour(birthDate, slot, answers || {}, location);

      return NextResponse.json({
        success: true,
        action: 'solve',
        result,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Expected "get_questionnaire" or "solve"' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during hour rectification';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
