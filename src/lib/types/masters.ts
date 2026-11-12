import { DomainCategory } from './lots';

export interface MasterKnowledgeDoc {
  id: string;
  titleZh: string;
  titleEn: string;
  domain: DomainCategory | 'all';
  keywords: string[];
  contentZh: string;
  contentEn: string;
}

export interface MasterRagConfig {
  includeBaziChart: boolean;
  includeTenGodsAndPalaces: boolean;
  includeDrawnLot: boolean;
  includeLifeBook: boolean;
  includeTransits: boolean;
  customKnowledgeDocs: MasterKnowledgeDoc[];
}

export interface MasterCharacteristics {
  personalityZh: string;
  personalityEn: string;
  toneZh: string;
  toneEn: string;
  speakingStyleZh: string;
  speakingStyleEn: string;
  greetingZh: string;
  greetingEn: string;
  systemPromptOverride?: string;
}

export interface MasterConfinedTopics {
  allowedDomains: DomainCategory[];
  allowedKeywords: string[];
  blockedTopics: string[];
  refusalMessageZh: string;
  refusalMessageEn: string;
}

export interface OracleMaster {
  id: string;
  nameZh: string;
  nameEn: string;
  titleZh: string;
  titleEn: string;
  sealCharacter: string;
  taglineZh: string;
  taglineEn: string;
  avatarGradient: string;
  isActive: boolean;
  sortOrder: number;
  characteristics: MasterCharacteristics;
  confinedTopics: MasterConfinedTopics;
  ragConfig: MasterRagConfig;
  updatedAt: number;
}

export interface MasterQuotaPolicy {
  requireBirthOrRegistration: boolean;
  unpaidQuota: number; // default: 1
  paidSinglePaymentQuota: number; // default: 3 per payment
  monthlySubscriberQuota: number; // default: 30 per month
  chargeOnRejectedIntent: boolean; // default: false
  enableLightweightClassifier: boolean; // default: true
  lightweightModelName: string; // default: 'auto'
  intentMaxTokens: number; // default: 120
  futureYearsHorizon?: number; // default: 2 (currentYear + 2 future years rolling window)
}

export interface SeekerProfile {
  userId: string;
  email?: string;
  displayName?: string;
  isRegistered: boolean;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  longitude?: number;
  timezoneOffset?: number;
  updatedAt: number;
}

export interface SeekerQuotaStatus {
  userId: string;
  isRegistered: boolean;
  hasBirthInfo: boolean;
  isEligibleToChat: boolean;
  eligibilityReasonEn: string;
  eligibilityReasonZh: string;
  tier: 'uneligible' | 'unpaid' | 'paid_single' | 'monthly_subscriber';
  tierLabelEn: string;
  tierLabelZh: string;
  singlePaymentCount: number;
  isMonthlySubscriber: boolean;
  totalAllowedQuestions: number;
  usedQuestions: number;
  remainingQuestions: number;
  policy: MasterQuotaPolicy;
  profile: SeekerProfile | null;
}

export type RagScopeKey =
  | 'bazi_pillars'
  | 'ten_gods_palaces'
  | 'drawn_lot'
  | 'lifebook_chapter'
  | 'annual_transits'
  | 'transits_2026'
  | 'custom_docs';

export interface Stage1IntentResult {
  isAllowed: boolean;
  intentStatus: 'allowed' | 'rejected_off_topic' | 'rejected_outside_master_domain' | 'rejected_blocked_topic';
  detectedDomain: DomainCategory;
  intentCategory: 'lot_hermeneutics' | 'bazi_natal' | 'transit_timing' | 'domain_strategy' | 'off_topic';
  relevantRagScopes: RagScopeKey[];
  confidence: number;
  classifierProvider: 'lightweight_llm' | 'deterministic_guardrail';
  classifierModel: string;
  latencyMs: number;
  reasonEn: string;
  reasonZh: string;
  suggestedMasterId?: string;
  suggestedMasterNameZh?: string;
  suggestedMasterNameEn?: string;
}

export interface RagSourceBadge {
  key: string;
  labelZh: string;
  labelEn: string;
  summaryZh: string;
  summaryEn: string;
}

export interface MasterChatMessage {
  id: string;
  userId: string;
  masterId: string;
  role: 'user' | 'master';
  content: string;
  detectedDomain?: DomainCategory;
  intentStatus: 'allowed' | 'rejected_off_topic' | 'rejected_outside_master_domain' | 'rejected_blocked_topic';
  quotaCharged: boolean;
  ragSources?: RagSourceBadge[];
  stage1Meta?: Stage1IntentResult;
  createdAt: number;
}

