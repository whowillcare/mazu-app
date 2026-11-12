import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth/adminAuth';
import { masterRepository } from '@/lib/masters/masterRepository';
import { MasterQuotaService } from '@/lib/masters/quotaService';
import {
  classifyMasterIntent,
  buildPersonalizationRagContext,
  generateMasterConsultationReply,
} from '@/lib/masters/masterChatEngine';
import { getDatabase } from '@/lib/db/database';

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
    const masters = masterRepository.getAllMasters();
    const policy = MasterQuotaService.getPolicy();
    const db = getDatabase();

    const statsRow = db
      .prepare(
        `SELECT
           COUNT(*) as totalMessages,
           SUM(CASE WHEN role = 'user' AND quota_charged = 1 THEN 1 ELSE 0 END) as chargedQuestions,
           SUM(CASE WHEN role = 'user' AND intent_status != 'allowed' THEN 1 ELSE 0 END) as rejectedByStage1
         FROM master_chat_messages`
      )
      .get() as
      | {
          totalMessages?: number;
          chargedQuestions?: number;
          rejectedByStage1?: number;
        }
      | undefined;

    return NextResponse.json({
      success: true,
      masters,
      policy,
      stats: {
        totalMessages: statsRow?.totalMessages || 0,
        chargedQuestions: statsRow?.chargedQuestions || 0,
        rejectedByStage1: statsRow?.rejectedByStage1 || 0,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed fetching admin masters';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'save_master') {
      const saved = masterRepository.saveMaster(body.master);
      return NextResponse.json({
        success: true,
        message: `Master "${saved.nameZh} (${saved.nameEn})" saved successfully.`,
        master: saved,
        masters: masterRepository.getAllMasters(),
      });
    }

    if (action === 'delete_master') {
      const deleted = masterRepository.deleteMaster(body.masterId);
      if (!deleted) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete the last remaining Master or Master not found.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Master deleted.',
        masters: masterRepository.getAllMasters(),
      });
    }

    if (action === 'reset_masters') {
      const masters = masterRepository.resetToDefaults();
      return NextResponse.json({
        success: true,
        message: 'Masters reset to canonical defaults.',
        masters,
      });
    }

    if (action === 'update_policy') {
      const policy = MasterQuotaService.updatePolicy(body.policy || {});
      return NextResponse.json({
        success: true,
        message: 'Master access & quota policy updated and live hot-reloaded.',
        policy,
      });
    }

    if (action === 'test_simulation') {
      const master =
        masterRepository.getMasterById(body.masterId) || masterRepository.getAllMasters()[0];
      const question = body.question || '2026年丙午流年，我的事業晉升與財庫運籌應如何把握時機？';
      const stage1 = await classifyMasterIntent(question, master);
      const context = {
        userId: 'admin_simulator',
        birthDate: body.birthDate || '1992-10-14',
        birthTime: body.birthTime || '09:30',
        birthCity: 'Taipei',
        longitude: 121.57,
        timezoneOffset: 8,
        lotNumber: Number(body.lotNumber) || 1,
        language: (body.language || 'zh-TW') as 'en' | 'zh-TW',
      };
      const ragBundle = buildPersonalizationRagContext(master, context, stage1, question);
      const { reply, ragBadges, provider } = await generateMasterConsultationReply({
        master,
        question,
        context,
        stage1,
      });

      return NextResponse.json({
        success: true,
        stage1,
        ragPromptPreview: ragBundle.promptContext,
        ragBadges,
        reply,
        provider,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Admin Master operation failed';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
