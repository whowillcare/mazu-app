import { NextResponse } from 'next/server';
import { analyzeInquiry } from '@/lib/ai/questionParser';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question = '', selectedDomain } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const analysis = await analyzeInquiry(question, selectedDomain);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing inquiry question:', error);
    return NextResponse.json(
      { error: 'Failed to analyze question' },
      { status: 500 }
    );
  }
}
