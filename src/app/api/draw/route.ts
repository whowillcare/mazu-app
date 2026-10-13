import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getLotByNumber } from '@/lib/lots/lotsRepository';
import { evaluateQuestionGate } from '@/lib/questionGate/questionGate';
import { getDatabase } from '@/lib/db/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain = 'career', question = '', userId = 'guest_user' } = body;

    // 1. Question Gate Governance
    const gateResult = evaluateQuestionGate(question, domain);

    // 2. Cryptographic Random Draw (1 to 60)
    // crypto.randomInt is cryptographically secure pseudorandom number generator
    const lotNumber = crypto.randomInt(1, 61);

    // 3. Load Lot
    const lot = getLotByNumber(lotNumber);
    if (!lot) {
      return NextResponse.json({ error: 'Failed to retrieve drawn lot' }, { status: 500 });
    }

    // 4. Log Draw into SQLite
    try {
      const db = getDatabase();
      const drawId = `draw_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      db.prepare(`
        INSERT INTO user_draws (id, user_id, lot_number, domain, question, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(drawId, userId, lotNumber, domain, gateResult.reframedQuestion, Date.now());
    } catch (dbErr) {
      console.warn('Could not log draw to database:', dbErr);
    }

    // 5. Extract Domain Guidance
    const domainGuidance = lot.guidance[domain] || lot.guidance.general;

    return NextResponse.json({
      success: true,
      lotNumber,
      lot,
      domain,
      domainGuidance,
      questionGate: gateResult,
      drawnAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error drawing lot:', error);
    return NextResponse.json({ error: 'Failed to draw lot' }, { status: 500 });
  }
}
