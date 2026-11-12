import { getDatabase } from '../db/database';
import { getConfig, getBooleanConfig, configManager } from '../config/configManager';
import {
  MasterQuotaPolicy,
  SeekerProfile,
  SeekerQuotaStatus,
  MasterChatMessage,
  RagSourceBadge,
  Stage1IntentResult,
} from '../types/masters';
import { DomainCategory } from '../types/lots';

export class MasterQuotaService {
  public static getPolicy(): MasterQuotaPolicy {
    const requireBirthOrRegistration = getBooleanConfig('MASTER_REQUIRE_BIRTH_OR_REG', true);
    const unpaidQuota = Math.max(0, parseInt(getConfig('MASTER_QUOTA_UNPAID') ?? '1', 10) || 0);
    const paidSinglePaymentQuota = Math.max(
      1,
      parseInt(getConfig('MASTER_QUOTA_PAID_PER_PAYMENT') ?? '3', 10) || 3
    );
    const monthlySubscriberQuota = Math.max(
      1,
      parseInt(getConfig('MASTER_QUOTA_SUBSCRIBER_MONTHLY') ?? '30', 10) || 30
    );
    const chargeOnRejectedIntent = getBooleanConfig('MASTER_CHARGE_ON_REJECTED', false);
    const enableLightweightClassifier = getBooleanConfig('MASTER_ENABLE_LIGHTWEIGHT_CLASSIFIER', true);
    const lightweightModelName = getConfig('AI_LIGHTWEIGHT_MODEL_NAME') || 'auto';
    const intentMaxTokens = Math.max(
      50,
      parseInt(getConfig('MASTER_INTENT_MAX_TOKENS') ?? '120', 10) || 120
    );
    const futureYearsHorizon = Math.max(
      1,
      Math.min(10, parseInt(getConfig('MASTER_FUTURE_YEARS_HORIZON') ?? '2', 10) || 2)
    );

    return {
      requireBirthOrRegistration,
      unpaidQuota,
      paidSinglePaymentQuota,
      monthlySubscriberQuota,
      chargeOnRejectedIntent,
      enableLightweightClassifier,
      lightweightModelName,
      intentMaxTokens,
      futureYearsHorizon,
    };
  }

  public static updatePolicy(updates: Partial<MasterQuotaPolicy>): MasterQuotaPolicy {
    const map: Record<string, string> = {};
    if (updates.requireBirthOrRegistration !== undefined) {
      map.MASTER_REQUIRE_BIRTH_OR_REG = String(updates.requireBirthOrRegistration);
    }
    if (updates.unpaidQuota !== undefined) {
      map.MASTER_QUOTA_UNPAID = String(Math.max(0, updates.unpaidQuota));
    }
    if (updates.paidSinglePaymentQuota !== undefined) {
      map.MASTER_QUOTA_PAID_PER_PAYMENT = String(Math.max(1, updates.paidSinglePaymentQuota));
    }
    if (updates.monthlySubscriberQuota !== undefined) {
      map.MASTER_QUOTA_SUBSCRIBER_MONTHLY = String(Math.max(1, updates.monthlySubscriberQuota));
    }
    if (updates.chargeOnRejectedIntent !== undefined) {
      map.MASTER_CHARGE_ON_REJECTED = String(updates.chargeOnRejectedIntent);
    }
    if (updates.enableLightweightClassifier !== undefined) {
      map.MASTER_ENABLE_LIGHTWEIGHT_CLASSIFIER = String(updates.enableLightweightClassifier);
    }
    if (updates.lightweightModelName !== undefined) {
      map.AI_LIGHTWEIGHT_MODEL_NAME = updates.lightweightModelName.trim() || 'auto';
    }
    if (updates.intentMaxTokens !== undefined) {
      map.MASTER_INTENT_MAX_TOKENS = String(Math.max(50, updates.intentMaxTokens));
    }
    if (updates.futureYearsHorizon !== undefined) {
      map.MASTER_FUTURE_YEARS_HORIZON = String(Math.max(1, Math.min(10, updates.futureYearsHorizon)));
    }

    configManager.setMultiple(map);
    return this.getPolicy();
  }

  public static getSeekerProfile(userId: string): SeekerProfile | null {
    const db = getDatabase();
    const row = db
      .prepare(
        `SELECT user_id, email, display_name, is_registered, birth_date, birth_time, birth_city, longitude, timezone_offset, updated_at
         FROM seeker_profiles WHERE user_id = ?`
      )
      .get(userId) as
      | {
          user_id: string;
          email?: string;
          display_name?: string;
          is_registered: number;
          birth_date?: string;
          birth_time?: string;
          birth_city?: string;
          longitude?: number;
          timezone_offset?: number;
          updated_at: number;
        }
      | undefined;

    if (!row) return null;
    return {
      userId: row.user_id,
      email: row.email || undefined,
      displayName: row.display_name || undefined,
      isRegistered: row.is_registered === 1,
      birthDate: row.birth_date || undefined,
      birthTime: row.birth_time || undefined,
      birthCity: row.birth_city || undefined,
      longitude: typeof row.longitude === 'number' ? row.longitude : undefined,
      timezoneOffset: typeof row.timezone_offset === 'number' ? row.timezone_offset : undefined,
      updatedAt: row.updated_at,
    };
  }

  public static upsertSeekerProfile(input: {
    userId: string;
    email?: string;
    displayName?: string;
    isRegistered?: boolean;
    birthDate?: string;
    birthTime?: string;
    birthCity?: string;
    longitude?: number;
    timezoneOffset?: number;
  }): SeekerProfile {
    const db = getDatabase();
    const existing = this.getSeekerProfile(input.userId);
    const now = Date.now();

    const email = input.email !== undefined ? input.email.trim() : existing?.email;
    const displayName = input.displayName !== undefined ? input.displayName.trim() : existing?.displayName;
    const isRegistered =
      input.isRegistered !== undefined
        ? input.isRegistered
        : Boolean(existing?.isRegistered || (email && email.length > 0));
    const birthDate = input.birthDate !== undefined ? input.birthDate.trim() : existing?.birthDate;
    const birthTime = input.birthTime !== undefined ? input.birthTime.trim() : existing?.birthTime;
    const birthCity = input.birthCity !== undefined ? input.birthCity.trim() : existing?.birthCity;
    const longitude = input.longitude !== undefined ? input.longitude : existing?.longitude;
    const timezoneOffset =
      input.timezoneOffset !== undefined ? input.timezoneOffset : existing?.timezoneOffset;

    db.prepare(
      `INSERT INTO seeker_profiles (
         user_id, email, display_name, is_registered, birth_date, birth_time, birth_city, longitude, timezone_offset, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         email = excluded.email,
         display_name = excluded.display_name,
         is_registered = excluded.is_registered,
         birth_date = excluded.birth_date,
         birth_time = excluded.birth_time,
         birth_city = excluded.birth_city,
         longitude = excluded.longitude,
         timezone_offset = excluded.timezone_offset,
         updated_at = excluded.updated_at`
    ).run(
      input.userId,
      email || null,
      displayName || null,
      isRegistered ? 1 : 0,
      birthDate || null,
      birthTime || null,
      birthCity || null,
      longitude ?? null,
      timezoneOffset ?? null,
      now,
      now
    );

    if (isRegistered) {
      db.prepare(
        `INSERT INTO users (id, email, display_name, auth_provider, created_at)
         VALUES (?, ?, ?, 'registered', ?)
         ON CONFLICT(id) DO UPDATE SET
           email = COALESCE(excluded.email, users.email),
           display_name = COALESCE(excluded.display_name, users.display_name),
           auth_provider = 'registered'`
      ).run(input.userId, email || null, displayName || null, now);
    }

    return this.getSeekerProfile(input.userId)!;
  }

  public static getSeekerQuotaStatus(
    userId: string,
    contextUpdate?: {
      email?: string;
      displayName?: string;
      isRegistered?: boolean;
      birthDate?: string;
      birthTime?: string;
      birthCity?: string;
      longitude?: number;
      timezoneOffset?: number;
    }
  ): SeekerQuotaStatus {
    if (
      contextUpdate &&
      (contextUpdate.birthDate ||
        contextUpdate.email ||
        contextUpdate.displayName ||
        contextUpdate.isRegistered !== undefined)
    ) {
      this.upsertSeekerProfile({ userId, ...contextUpdate });
    }

    const policy = this.getPolicy();
    const profile = this.getSeekerProfile(userId);
    const db = getDatabase();

    const isRegistered = Boolean(profile?.isRegistered || (profile?.email && profile.email.length > 0));
    const hasBirthInfo = Boolean(profile?.birthDate && profile.birthDate.length > 0);
    const isEligibleToChat = !policy.requireBirthOrRegistration || isRegistered || hasBirthInfo;

    // Inspect active entitlements
    const entitlements = db
      .prepare(
        `SELECT plan_id, updated_at FROM user_entitlements WHERE user_id = ? AND status = 'active' ORDER BY updated_at ASC`
      )
      .all(userId) as Array<{ plan_id: string; updated_at: number }>;

    const singlePayments = entitlements.filter(
      (e) =>
        e.plan_id === 'single_report' ||
        e.plan_id === 'master_pack' ||
        e.plan_id.startsWith('lot_report_') ||
        e.plan_id.startsWith('master_pack_')
    );
    const subscriptionEntitlements = entitlements.filter(
      (e) => e.plan_id === 'subscription' || e.plan_id.startsWith('sub_')
    );

    const singlePaymentCount = singlePayments.length;
    const isMonthlySubscriber = subscriptionEntitlements.length > 0;

    // Count charged questions
    let usedQuestions = 0;
    if (singlePaymentCount > 0 || isMonthlySubscriber) {
      // Count questions since first paid entitlement so any prior free question doesn't eat into paid quota
      const firstPaidTimestamp = Math.min(
        ...[...singlePayments, ...subscriptionEntitlements].map((e) => e.updated_at)
      );
      const row = db
        .prepare(
          `SELECT COUNT(*) as cnt FROM master_chat_messages
           WHERE user_id = ? AND role = 'user' AND quota_charged = 1 AND created_at >= ?`
        )
        .get(userId, firstPaidTimestamp) as { cnt: number };
      usedQuestions = row?.cnt || 0;
    } else {
      const row = db
        .prepare(
          `SELECT COUNT(*) as cnt FROM master_chat_messages
           WHERE user_id = ? AND role = 'user' AND quota_charged = 1`
        )
        .get(userId) as { cnt: number };
      usedQuestions = row?.cnt || 0;
    }

    let tier: SeekerQuotaStatus['tier'] = 'uneligible';
    let tierLabelEn = 'Verification Required';
    let tierLabelZh = '需填寫生辰或註冊';
    let totalAllowedQuestions = 0;

    if (!isEligibleToChat) {
      tier = 'uneligible';
      totalAllowedQuestions = 0;
    } else if (isMonthlySubscriber) {
      tier = 'monthly_subscriber';
      tierLabelEn = 'Monthly Subscriber (流年訂閱會員)';
      tierLabelZh = '流年預測月費訂閱會員';
      totalAllowedQuestions =
        policy.monthlySubscriberQuota + singlePaymentCount * policy.paidSinglePaymentQuota;
    } else if (singlePaymentCount > 0) {
      tier = 'paid_single';
      tierLabelEn = `Paid Seeker (${singlePaymentCount}× Payment · +${policy.paidSinglePaymentQuota} Qs/Pay)`;
      tierLabelZh = `已付費善信（累計 ${singlePaymentCount} 次解鎖 · 每次 ${policy.paidSinglePaymentQuota} 問）`;
      totalAllowedQuestions = singlePaymentCount * policy.paidSinglePaymentQuota;
    } else {
      tier = 'unpaid';
      tierLabelEn = `Registered / Birth-Verified Seeker (Free Trial: ${policy.unpaidQuota} Q)`;
      tierLabelZh = `已立生辰/註冊善信（免費體驗：${policy.unpaidQuota} 問）`;
      totalAllowedQuestions = policy.unpaidQuota;
    }

    const remainingQuestions = Math.max(0, totalAllowedQuestions - usedQuestions);

    let eligibilityReasonEn = 'Eligible for Master Consultation.';
    let eligibilityReasonZh = '已具備宗師叩問資格。';

    if (!isEligibleToChat) {
      eligibilityReasonEn =
        'Only registered seekers or those who have specified their birth information (Birth Date, Time & City) can consult the Masters.';
      eligibilityReasonZh =
        '聖殿立規：唯有「已完成帳號註冊」或「已填寫生辰八字資訊（出生年月日、時辰、出生地）」之善信，方可向宗師請益。';
    } else if (remainingQuestions <= 0) {
      if (tier === 'unpaid') {
        eligibilityReasonEn = `You have used your ${policy.unpaidQuota} free consultation question(s). Unlock a Single Payment (+${policy.paidSinglePaymentQuota} questions) or Monthly Subscription (${policy.monthlySubscriberQuota} questions/mo) to continue.`;
        eligibilityReasonZh = `您的免費體驗叩問額度（${policy.unpaidQuota} 問）已圓滿使用。請解鎖單次命書/問答包（每次獲贈 +${policy.paidSinglePaymentQuota} 問）或升級月費訂閱會員（每月 ${policy.monthlySubscriberQuota} 問）以繼續請益。`;
      } else {
        eligibilityReasonEn = `You have used all ${totalAllowedQuestions} questions in your current tier. Make another single payment (+${policy.paidSinglePaymentQuota} questions) or upgrade to Monthly Subscription (${policy.monthlySubscriberQuota} questions/mo).`;
        eligibilityReasonZh = `您當前的 ${totalAllowedQuestions} 次宗師叩問額度已用罄。可再次加購單次問答（+${policy.paidSinglePaymentQuota} 問）或升級流年月費訂閱會員（每月 ${policy.monthlySubscriberQuota} 問）。`;
      }
    }

    return {
      userId,
      isRegistered,
      hasBirthInfo,
      isEligibleToChat,
      eligibilityReasonEn,
      eligibilityReasonZh,
      tier,
      tierLabelEn,
      tierLabelZh,
      singlePaymentCount,
      isMonthlySubscriber,
      totalAllowedQuestions,
      usedQuestions,
      remainingQuestions,
      policy,
      profile,
    };
  }

  public static logChatPair(params: {
    userId: string;
    masterId: string;
    userQuestion: string;
    masterReply: string;
    detectedDomain: DomainCategory;
    intentStatus: Stage1IntentResult['intentStatus'];
    quotaCharged: boolean;
    ragSources: RagSourceBadge[];
    stage1Meta: Stage1IntentResult;
  }): { userMsg: MasterChatMessage; masterMsg: MasterChatMessage } {
    const db = getDatabase();
    const now = Date.now();
    const userMsgId = `msg_u_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const masterMsgId = `msg_m_${now + 1}_${Math.random().toString(36).substring(2, 7)}`;

    const stmt = db.prepare(
      `INSERT INTO master_chat_messages (
         id, user_id, master_id, role, content, detected_domain, intent_status, quota_charged, rag_sources_json, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const metaJson = JSON.stringify({
      ragSources: params.ragSources,
      stage1Meta: params.stage1Meta,
    });

    stmt.run(
      userMsgId,
      params.userId,
      params.masterId,
      'user',
      params.userQuestion,
      params.detectedDomain,
      params.intentStatus,
      params.quotaCharged ? 1 : 0,
      metaJson,
      now
    );

    stmt.run(
      masterMsgId,
      params.userId,
      params.masterId,
      'master',
      params.masterReply,
      params.detectedDomain,
      params.intentStatus,
      0,
      metaJson,
      now + 1
    );

    return {
      userMsg: {
        id: userMsgId,
        userId: params.userId,
        masterId: params.masterId,
        role: 'user',
        content: params.userQuestion,
        detectedDomain: params.detectedDomain,
        intentStatus: params.intentStatus,
        quotaCharged: params.quotaCharged,
        ragSources: params.ragSources,
        stage1Meta: params.stage1Meta,
        createdAt: now,
      },
      masterMsg: {
        id: masterMsgId,
        userId: params.userId,
        masterId: params.masterId,
        role: 'master',
        content: params.masterReply,
        detectedDomain: params.detectedDomain,
        intentStatus: params.intentStatus,
        quotaCharged: false,
        ragSources: params.ragSources,
        stage1Meta: params.stage1Meta,
        createdAt: now + 1,
      },
    };
  }

  public static getChatHistory(userId: string, masterId?: string, limit = 30): MasterChatMessage[] {
    const db = getDatabase();
    interface RawChatMsgRow {
      id: string;
      user_id: string;
      master_id: string;
      role: string;
      content: string;
      detected_domain?: string;
      intent_status: Stage1IntentResult['intentStatus'];
      quota_charged: number;
      rag_sources_json?: string;
      created_at: number;
    }

    const rows = masterId
      ? (db
          .prepare(
            `SELECT * FROM master_chat_messages WHERE user_id = ? AND master_id = ? ORDER BY created_at ASC LIMIT ?`
          )
          .all(userId, masterId, limit) as RawChatMsgRow[])
      : (db
          .prepare(`SELECT * FROM master_chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?`)
          .all(userId, limit) as RawChatMsgRow[]);

    return rows.map((r) => {
      let parsedMeta: { ragSources?: RagSourceBadge[]; stage1Meta?: Stage1IntentResult } = {};
      try {
        if (r.rag_sources_json) {
          parsedMeta = JSON.parse(r.rag_sources_json);
        }
      } catch {}

      return {
        id: r.id,
        userId: r.user_id,
        masterId: r.master_id,
        role: r.role as 'user' | 'master',
        content: r.content,
        detectedDomain: r.detected_domain as DomainCategory,
        intentStatus: r.intent_status,
        quotaCharged: r.quota_charged === 1,
        ragSources: parsedMeta.ragSources,
        stage1Meta: parsedMeta.stage1Meta,
        createdAt: r.created_at,
      };
    });
  }
}
