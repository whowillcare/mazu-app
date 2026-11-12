import { NextRequest, NextResponse } from 'next/server';
import { masterRepository } from '@/lib/masters/masterRepository';
import { MasterQuotaService } from '@/lib/masters/quotaService';
import {
  classifyMasterIntent,
  generateMasterConsultationReply,
} from '@/lib/masters/masterChatEngine';
import { DomainCategory } from '@/lib/types/lots';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId = 'seeker_1992',
      masterId = 'master_xuanzhen',
      question = '',
      email,
      displayName,
      isRegistered,
      birthDate,
      birthTime,
      birthCity,
      longitude,
      timezoneOffset,
      lotNumber = 1,
      selectedDomain = 'career',
      language = 'zh-TW',
    } = body;

    const cleanQuestion = (question || '').trim();
    if (!cleanQuestion) {
      return NextResponse.json(
        { success: false, error: 'Please enter a consultation question.' },
        { status: 400 }
      );
    }

    const master =
      masterRepository.getMasterById(masterId) || masterRepository.getActiveMasters()[0];
    if (!master) {
      return NextResponse.json(
        { success: false, error: 'Requested Oracle Master is not available.' },
        { status: 404 }
      );
    }

    // 1. Check Seeker Eligibility & Quota Gate
    const quotaStatus = MasterQuotaService.getSeekerQuotaStatus(userId, {
      email,
      displayName,
      isRegistered,
      birthDate,
      birthTime,
      birthCity,
      longitude,
      timezoneOffset,
    });

    if (!quotaStatus.isEligibleToChat) {
      return NextResponse.json(
        {
          success: false,
          code: 'ELIGIBILITY_REQUIRED',
          error:
            language === 'zh-TW'
              ? quotaStatus.eligibilityReasonZh
              : quotaStatus.eligibilityReasonEn,
          quotaStatus,
        },
        { status: 403 }
      );
    }

    if (quotaStatus.remainingQuestions <= 0) {
      return NextResponse.json(
        {
          success: false,
          code: 'QUOTA_EXHAUSTED',
          error:
            language === 'zh-TW'
              ? quotaStatus.eligibilityReasonZh
              : quotaStatus.eligibilityReasonEn,
          quotaStatus,
        },
        { status: 402 }
      );
    }

    // 2. Stage 1: Lightweight Lower-Cost AI Intent Classification & Confined Domain Gate
    const stage1 = await classifyMasterIntent(
      cleanQuestion,
      master,
      selectedDomain as DomainCategory
    );

    // 3. Stage 2: Personalization Engine RAG Synthesis & Master Persona Generation
    const priorHistory = MasterQuotaService.getChatHistory(userId, master.id, 10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const resolvedProfile = quotaStatus.profile;
    const { reply, ragBadges, provider } = await generateMasterConsultationReply({
      master,
      question: cleanQuestion,
      context: {
        userId,
        birthDate: birthDate || resolvedProfile?.birthDate || '1992-10-14',
        birthTime: birthTime || resolvedProfile?.birthTime || '09:30',
        birthCity: birthCity || resolvedProfile?.birthCity || 'Taipei',
        longitude:
          typeof longitude === 'number'
            ? longitude
            : typeof resolvedProfile?.longitude === 'number'
            ? resolvedProfile.longitude
            : 121.57,
        timezoneOffset:
          typeof timezoneOffset === 'number'
            ? timezoneOffset
            : typeof resolvedProfile?.timezoneOffset === 'number'
            ? resolvedProfile.timezoneOffset
            : 8,
        lotNumber: Number(lotNumber) || 1,
        selectedDomain: selectedDomain as DomainCategory,
        language: language === 'en' ? 'en' : 'zh-TW',
      },
      stage1,
      history: priorHistory,
    });

    // 4. Determine whether to deduct 1 question credit from seeker's quota
    const quotaCharged = stage1.isAllowed || quotaStatus.policy.chargeOnRejectedIntent;

    const logged = MasterQuotaService.logChatPair({
      userId,
      masterId: master.id,
      userQuestion: cleanQuestion,
      masterReply: reply,
      detectedDomain: stage1.detectedDomain,
      intentStatus: stage1.intentStatus,
      quotaCharged,
      ragSources: ragBadges,
      stage1Meta: stage1,
    });

    const updatedQuotaStatus = MasterQuotaService.getSeekerQuotaStatus(userId);

    return NextResponse.json({
      success: true,
      master: {
        id: master.id,
        nameZh: master.nameZh,
        nameEn: master.nameEn,
        titleZh: master.titleZh,
        titleEn: master.titleEn,
        sealCharacter: master.sealCharacter,
      },
      userMessage: logged.userMsg,
      masterMessage: logged.masterMsg,
      stage1,
      ragBadges,
      provider,
      quotaCharged,
      quotaStatus: updatedQuotaStatus,
    });
  } catch (err: unknown) {
    console.error('[MasterChatAPI] Error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to process Master consultation';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
