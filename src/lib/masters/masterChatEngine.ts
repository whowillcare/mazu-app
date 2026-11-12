import {
  OracleMaster,
  Stage1IntentResult,
  RagScopeKey,
  RagSourceBadge,
} from '../types/masters';
import { DomainCategory, CanonicalLot } from '../types/lots';
import { DOMAINS, normalizeDomainKey } from '../lots/domains';
import { analyzeInquiry } from '../ai/questionParser';
import { getConfig } from '../config/configManager';
import { masterRepository } from './masterRepository';
import { MasterQuotaService } from './quotaService';
import {
  calculateTrueSolarTime,
  calculateFourPillars,
  calculateLotInteraction,
  generateLifeBookChapters,
  generatePredictiveSubscriptionHub,
  getYearGanzhi,
  calculateYearTransitForChart,
  FourPillars,
  LotBaziInteraction,
  LifeBookChapter,
  PredictiveSubscriptionHub,
  PredictiveMilestoneItem,
  STEM_INFO,
  BRANCH_INFO,
} from '../bazi/baziEngine';
import { getLotByNumber } from '../lots/lotsRepository';

export interface SeekerConsultationContext {
  userId: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  longitude?: number;
  timezoneOffset?: number;
  lotNumber?: number;
  selectedDomain?: DomainCategory;
  language?: 'en' | 'zh-TW';
}

export interface RagContextBundle {
  promptContext: string;
  badges: RagSourceBadge[];
  pillars: FourPillars;
  lot: CanonicalLot;
  interaction: LotBaziInteraction;
  matchedChapter: LifeBookChapter;
  transits: PredictiveSubscriptionHub;
  solarOffsetMinutes: number;
  currentYear: number;
  endYear: number;
  queriedYearTransits: PredictiveMilestoneItem[];
}

const UNIVERSAL_OFF_TOPIC_PATTERNS = [
  'write a python',
  'write javascript',
  'write code',
  'sql query',
  'react component',
  'ignore previous instructions',
  'system prompt',
  'jailbreak',
  'bitcoin price tomorrow',
  'which stock to buy',
  'lottery numbers',
  'recipe for',
  'how to cook',
  'who won the world cup',
  '寫一段程式碼',
  '寫python',
  '忽略前面的指令',
  '大樂透號碼',
  '威力彩號碼',
  '哪支股票會漲停',
];

const METAPHYSICAL_CORE_KEYWORDS = [
  '八字', '命盤', '四柱', '日主', '日元', '十神', '用神', '喜神', '忌神', '大運', '流年', '歲君', '2026', '2027', '2028',
  '丙午', '丁未', '戊申', '夫妻宮', '日支', '月令', '月柱', '時柱', '子女宮', '年柱', '財庫', '辰', '戌', '丑', '未',
  '六衝', '六合', '三合', '刑', '害', '籤', '籤詩', '解籤', '典故', '卦象', '五行', '金', '木', '水', '火', '土', '節氣',
  'bazi', 'pillar', 'pillars', 'day master', 'natal', 'chart', 'ten gods', 'lot', 'oracle', 'verse', 'hexagram',
  'transit', 'annual', 'solar term', 'palace', 'spouse', 'treasury', 'element', 'wood', 'fire', 'earth', 'metal', 'water',
];

/**
 * STAGE 1: Lightweight Lower-Cost AI Intent Categorizer & Confined Domain Gate
 * Quickly classifies user intention before invoking the expensive Stage 2 RAG + Persona LLM.
 */
export async function classifyMasterIntent(
  question: string,
  master: OracleMaster,
  fallbackDomain?: DomainCategory
): Promise<Stage1IntentResult> {
  const startTime = Date.now();
  const q = (question || '').trim();
  const qLower = q.toLowerCase();
  const policy = MasterQuotaService.getPolicy();

  // 1. Zero-Cost Instant Guardrail for Blocked / Malicious Topics (< 1ms)
  const allBlocked = [
    ...UNIVERSAL_OFF_TOPIC_PATTERNS,
    ...(master.confinedTopics.blockedTopics || []).map((t) => t.toLowerCase()),
  ];

  const matchedBlocked = allBlocked.find((pat) => pat && qLower.includes(pat));
  if (matchedBlocked) {
    return {
      isAllowed: false,
      intentStatus: 'rejected_blocked_topic',
      detectedDomain: fallbackDomain || master.confinedTopics.allowedDomains[0] || 'general',
      intentCategory: 'off_topic',
      relevantRagScopes: [],
      confidence: 0.99,
      classifierProvider: 'deterministic_guardrail',
      classifierModel: 'zero-cost-guardrail-v1',
      latencyMs: Date.now() - startTime,
      reasonEn: `Blocked off-topic or restricted pattern detected ("${matchedBlocked}"). Stage 2 bypassed.`,
      reasonZh: `偵測到非命理/受限主題關鍵詞（「${matchedBlocked}」），已由第一階段輕量守門員直接攔截。`,
    };
  }

  // 2. Try Lightweight Low-Cost AI Classifier if enabled and API key is present
  const apiKey =
    getConfig('AI_API_KEY') ||
    process.env.AI_API_KEY ||
    process.env.FREE_LLM_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DEEPSEEK_API_KEY;

  if (policy.enableLightweightClassifier && apiKey && q.length > 2) {
    try {
      const llmStage1 = await runLightweightLlmIntentClassifier(
        q,
        master,
        apiKey,
        policy.lightweightModelName,
        policy.intentMaxTokens,
        startTime
      );
      if (llmStage1) {
        return llmStage1;
      }
    } catch (err) {
      console.warn('[MasterChatEngine] Stage 1 lightweight LLM fallback to deterministic:', err);
    }
  }

  // 3. Fast Deterministic Intent & Domain Classifier Fallback
  return runDeterministicStage1Classifier(q, master, fallbackDomain, startTime);
}

async function runLightweightLlmIntentClassifier(
  question: string,
  master: OracleMaster,
  apiKey: string,
  lightweightModelConfig: string,
  maxTokens: number,
  startTime: number
): Promise<Stage1IntentResult | null> {
  const baseUrl = (
    getConfig('AI_API_ENDPOINT') ||
    process.env.AI_API_ENDPOINT ||
    process.env.AI_BASE_URL ||
    'https://api.openai.com/v1'
  ).replace(/\/+$/, '');

  const resolvedModel =
    lightweightModelConfig && lightweightModelConfig !== 'auto'
      ? lightweightModelConfig
      : getConfig('AI_MODEL_NAME') || process.env.AI_MODEL_NAME || 'gpt-4o-mini';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3800);

  try {
    const allowedDomainsStr = master.confinedTopics.allowedDomains.join(', ');
    const prompt = `Categorize user question for Oracle Master "${master.nameEn}" (${master.nameZh}).
Valid 13 domains: general, relationships, career, money, health, family_home, travel_moving, sea_and_voyage, the_absent_one, legal, conception, timing, livelihood_and_seasons.
Master's Allowed Domains: [${allowedDomainsStr}].
Question: "${question}"

Return ONLY compact JSON:
{"isOffTopic":false,"domain":"career","intentCategory":"domain_strategy","inMasterScope":true,"ragScopes":["bazi_pillars","drawn_lot"],"reason":"brief"}`;

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: resolvedModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const cleanJson = content.replace(/^```json\s*|```\s*$/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const detectedDomain = normalizeDomainKey(parsed.domain || 'general');
    const isOffTopic = Boolean(parsed.isOffTopic || parsed.intentCategory === 'off_topic');
    const inMasterScope =
      !isOffTopic &&
      (Boolean(parsed.inMasterScope) ||
        master.confinedTopics.allowedDomains.includes(detectedDomain));

    if (isOffTopic) {
      return {
        isAllowed: false,
        intentStatus: 'rejected_off_topic',
        detectedDomain,
        intentCategory: 'off_topic',
        relevantRagScopes: [],
        confidence: 0.94,
        classifierProvider: 'lightweight_llm',
        classifierModel: resolvedModel,
        latencyMs: Date.now() - startTime,
        reasonEn: parsed.reason || 'Question is unrelated to BaZi metaphysics or the 13 oracle domains.',
        reasonZh: '此提問與八字命理、六十甲子靈籤或十三事類無關，已於第一階段輕量分類器攔截。',
      };
    }

    if (!inMasterScope) {
      const altMaster = findBestMatchingMasterForDomain(detectedDomain, master.id);
      return {
        isAllowed: false,
        intentStatus: 'rejected_outside_master_domain',
        detectedDomain,
        intentCategory: parsed.intentCategory || 'domain_strategy',
        relevantRagScopes: [],
        confidence: 0.92,
        classifierProvider: 'lightweight_llm',
        classifierModel: resolvedModel,
        latencyMs: Date.now() - startTime,
        reasonEn: `Topic belongs to "${detectedDomain}", which is outside ${master.nameEn}'s confined domains.`,
        reasonZh: `此提問屬於「${getDomainTitleZh(detectedDomain)}」，超出【${master.nameZh}】設定之限定討論範疇。`,
        suggestedMasterId: altMaster?.id,
        suggestedMasterNameZh: altMaster?.nameZh,
        suggestedMasterNameEn: altMaster?.nameEn,
      };
    }

    const ragScopes: RagScopeKey[] = Array.isArray(parsed.ragScopes) && parsed.ragScopes.length > 0
      ? parsed.ragScopes
      : selectOptimalRagScopes(detectedDomain, question);

    return {
      isAllowed: true,
      intentStatus: 'allowed',
      detectedDomain,
      intentCategory: parsed.intentCategory || 'domain_strategy',
      relevantRagScopes: ragScopes,
      confidence: 0.95,
      classifierProvider: 'lightweight_llm',
      classifierModel: resolvedModel,
      latencyMs: Date.now() - startTime,
      reasonEn: `Verified within ${master.nameEn}'s confined category (${detectedDomain}).`,
      reasonZh: `已通過第一階段輕量意圖審核：歸入【${getDomainTitleZh(detectedDomain)}】範疇。`,
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

async function runDeterministicStage1Classifier(
  question: string,
  master: OracleMaster,
  fallbackDomain?: DomainCategory,
  startTime = Date.now()
): Promise<Stage1IntentResult> {
  const qLower = question.toLowerCase();

  // Check if it contains any metaphysical or life domain keywords
  const analysis = await analyzeInquiry(question, fallbackDomain);
  const hasMetaphysicalKw = METAPHYSICAL_CORE_KEYWORDS.some((kw) => qLower.includes(kw.toLowerCase()));
  const hasMasterAllowedKw = (master.confinedTopics.allowedKeywords || []).some((kw) =>
    qLower.includes(kw.toLowerCase())
  );

  // Detect obvious off-topic chatter (e.g. weather, math, celebrity gossip, sports) when no domain or metaphysical keyword matched
  const offTopicIndicators = [
    'weather today', 'capital of ', 'president of ', 'who is ', 'math problem', 'calculate 2+', 'football', 'basketball', 'movie review',
    '今天天氣', '首都', '總統是誰', '數學題', '籃球', '足球', '電影推薦', '食譜', '怎麼做菜',
  ];
  const isExplicitOffTopic = offTopicIndicators.some((ind) => qLower.includes(ind));

  if (isExplicitOffTopic && !hasMetaphysicalKw && !hasMasterAllowedKw) {
    return {
      isAllowed: false,
      intentStatus: 'rejected_off_topic',
      detectedDomain: analysis.primaryDomain,
      intentCategory: 'off_topic',
      relevantRagScopes: [],
      confidence: 0.93,
      classifierProvider: 'deterministic_guardrail',
      classifierModel: 'intent-gate-deterministic-v2',
      latencyMs: Date.now() - startTime,
      reasonEn: 'Inquiry is off-topic chatter outside oracle & BaZi domains.',
      reasonZh: '提問內容屬於日常閒聊或非命理範疇，不在聖殿宗師論道範圍之內。',
    };
  }

  let detectedDomain: DomainCategory = analysis.primaryDomain;

  // If the user didn't use a specific domain keyword but used general metaphysical terms (like "我的八字日主", "解讀這支籤", "my bazi chart", "explain my lot"), map to a domain allowed by this master
  if (
    analysis.confidence < 0.75 &&
    (hasMetaphysicalKw || hasMasterAllowedKw) &&
    !master.confinedTopics.allowedDomains.includes(detectedDomain)
  ) {
    detectedDomain = master.confinedTopics.allowedDomains[0] || 'general';
  }

  const isDomainAllowed =
    master.confinedTopics.allowedDomains.includes(detectedDomain) ||
    (hasMasterAllowedKw && analysis.detectedDomains.some((d) => master.confinedTopics.allowedDomains.includes(d)));

  if (!isDomainAllowed) {
    const altMaster = findBestMatchingMasterForDomain(detectedDomain, master.id);
    return {
      isAllowed: false,
      intentStatus: 'rejected_outside_master_domain',
      detectedDomain,
      intentCategory: 'domain_strategy',
      relevantRagScopes: [],
      confidence: 0.91,
      classifierProvider: 'deterministic_guardrail',
      classifierModel: 'intent-gate-deterministic-v2',
      latencyMs: Date.now() - startTime,
      reasonEn: `Inquiry touches "${getDomainTitleEn(detectedDomain)}", which is outside ${master.nameEn}'s confined domains (${master.confinedTopics.allowedDomains.join(', ')}).`,
      reasonZh: `您的叩問聚焦於「${getDomainTitleZh(detectedDomain)}」，不在【${master.nameZh}】設定之限定範疇內。`,
      suggestedMasterId: altMaster?.id,
      suggestedMasterNameZh: altMaster?.nameZh,
      suggestedMasterNameEn: altMaster?.nameEn,
    };
  }

  // Determine intent sub-category
  let intentCategory: Stage1IntentResult['intentCategory'] = 'domain_strategy';
  if (qLower.includes('籤') || qLower.includes('詩') || qLower.includes('lot') || qLower.includes('verse')) {
    intentCategory = 'lot_hermeneutics';
  } else if (
    qLower.includes('八字') ||
    qLower.includes('日主') ||
    qLower.includes('四柱') ||
    qLower.includes('十神') ||
    qLower.includes('夫妻宮') ||
    qLower.includes('bazi') ||
    qLower.includes('pillar') ||
    qLower.includes('day master')
  ) {
    intentCategory = 'bazi_natal';
  } else if (
    qLower.includes('流年') ||
    /\b(19\d{2}|20\d{2})\b/.test(qLower) ||
    qLower.includes('明年') ||
    qLower.includes('今年') ||
    qLower.includes('後年') ||
    qLower.includes('何時') ||
    qLower.includes('節氣') ||
    qLower.includes('when') ||
    qLower.includes('timing') ||
    qLower.includes('transit')
  ) {
    intentCategory = 'transit_timing';
  }

  const ragScopes = selectOptimalRagScopes(detectedDomain, question);

  return {
    isAllowed: true,
    intentStatus: 'allowed',
    detectedDomain,
    intentCategory,
    relevantRagScopes: ragScopes,
    confidence: 0.92,
    classifierProvider: 'deterministic_guardrail',
    classifierModel: 'intent-gate-deterministic-v2',
    latencyMs: Date.now() - startTime,
    reasonEn: `Verified intent: ${getDomainTitleEn(detectedDomain)} (${intentCategory})`,
    reasonZh: `意圖核准：歸入「${getDomainTitleZh(detectedDomain)}」（${intentCategory}）`,
  };
}

function selectOptimalRagScopes(domain: DomainCategory, question: string): RagScopeKey[] {
  const scopes: Set<RagScopeKey> = new Set(['bazi_pillars', 'drawn_lot', 'custom_docs']);
  const qLower = question.toLowerCase();

  if (
    ['relationships', 'career', 'money', 'family_home', 'conception'].includes(domain) ||
    qLower.includes('宮') ||
    qLower.includes('十神') ||
    qLower.includes('庫') ||
    qLower.includes('palace') ||
    qLower.includes('treasury')
  ) {
    scopes.add('ten_gods_palaces');
  }

  if (
    ['timing', 'career', 'money', 'travel_moving', 'sea_and_voyage'].includes(domain) ||
    /\b(19\d{2}|20\d{2})\b/.test(qLower) ||
    qLower.includes('流年') ||
    qLower.includes('明年') ||
    qLower.includes('今年') ||
    qLower.includes('節氣') ||
    qLower.includes('何時') ||
    qLower.includes('when') ||
    qLower.includes('year') ||
    qLower.includes('month')
  ) {
    scopes.add('annual_transits');
  }

  scopes.add('lifebook_chapter');
  return Array.from(scopes);
}

function findBestMatchingMasterForDomain(
  domain: DomainCategory,
  excludeMasterId: string
): OracleMaster | null {
  const activeMasters = masterRepository.getActiveMasters();
  return (
    activeMasters.find(
      (m) => m.id !== excludeMasterId && m.confinedTopics.allowedDomains.includes(domain)
    ) ||
    activeMasters.find((m) => m.id !== excludeMasterId) ||
    null
  );
}

function getDomainTitleZh(domain: DomainCategory): string {
  return DOMAINS.find((d) => d.key === domain)?.titleZh || '綜合運勢';
}

function getDomainTitleEn(domain: DomainCategory): string {
  return DOMAINS.find((d) => d.key === domain)?.titleEn || 'General Guidance';
}

/**
 * STAGE 2A: Convert Personalization Engine into Structured RAG Context Bundle
 * Knows the seeker's BaZi Four Pillars, True Solar Time, Drawn Lot, 9-Section Life Book,
 * Dynamic Rolling Annual Transits (`currentYear` through `currentYear + futureYears`, plus any specific year asked in the question),
 * and Master's Custom RAG Knowledge Docs inside out.
 */
export function buildPersonalizationRagContext(
  master: OracleMaster,
  context: SeekerConsultationContext,
  stage1: Stage1IntentResult,
  question: string
): RagContextBundle {
  const birthDateStr = context.birthDate || '1992-10-14';
  const birthTimeStr = context.birthTime || '09:30';
  const longitude = typeof context.longitude === 'number' ? context.longitude : 121.57;
  const tzOffset = typeof context.timezoneOffset === 'number' ? context.timezoneOffset : 8;
  const lotNumber = context.lotNumber || 1;

  const currentYear = new Date().getFullYear();
  const policy = MasterQuotaService.getPolicy();
  const futureYears = policy.futureYearsHorizon ?? 2; // Default rolling horizon: currentYear + future 2 years
  const endYear = currentYear + futureYears;

  const [hours, minutes] = birthTimeStr.split(':').map((s) => parseInt(s, 10) || 0);
  const dateObj = new Date(birthDateStr);
  dateObj.setHours(hours, minutes, 0, 0);

  // 1. Ephemeris & Four Pillars
  const { adjustedDate, offsetMinutes } = calculateTrueSolarTime(dateObj, longitude, tzOffset);
  const pillars = calculateFourPillars(adjustedDate);

  // 2. Canonical Lot
  const lot = getLotByNumber(lotNumber, true) || getLotByNumber(1, true)!;
  const lotGanzhi = lot.ganzhi.zh || '甲子';

  // 3. Cross-Matrix Interaction (Dynamic current solar year)
  const interaction = calculateLotInteraction(pillars, lotGanzhi, currentYear);

  // 4. 9-Section Life Book (Select targeted chapter based on detected domain)
  const lifeBookChapters = generateLifeBookChapters(pillars, lot, currentYear, futureYears);
  const domainToChapterIdx: Partial<Record<DomainCategory, number>> = {
    general: 1,
    career: 2,
    money: 3,
    wealth: 3,
    business: 3,
    relationships: 4,
    family_home: 5,
    family: 5,
    conception: 5,
    the_absent_one: 5,
    health: 6,
    legal: 7,
    livelihood_and_seasons: 3,
    travel_moving: 8,
    travel: 8,
    sea_and_voyage: 8,
    sea_voyage: 8,
    timing: 9,
  };
  const targetChId = domainToChapterIdx[stage1.detectedDomain] || 9;
  const matchedChapter =
    lifeBookChapters.find((c) => c.id === targetChId) || lifeBookChapters[0];

  // 5. Dynamic Rolling Predictive Transits Hub + On-Demand Year Extraction from Seeker's Question
  const transits = generatePredictiveSubscriptionHub(pillars, lot, currentYear, futureYears);
  const explicitYearMatches = Array.from(question.matchAll(/\b(19\d{2}|20\d{2})\b/g)).map((m) =>
    parseInt(m[1], 10)
  );
  const birthYear = dateObj.getFullYear();
  const queriedYears = Array.from(new Set(explicitYearMatches)).filter(
    (y) => y !== birthYear && y >= 1924 && y <= 2100
  );
  const queriedYearTransits: PredictiveMilestoneItem[] = queriedYears.map((y) =>
    calculateYearTransitForChart(pillars, y)
  );

  const badges: RagSourceBadge[] = [];
  const promptSections: string[] = [];

  // Assemble selective RAG slices according to master.ragConfig & stage1.relevantRagScopes
  if (master.ragConfig.includeBaziChart) {
    const dmInfo = STEM_INFO[pillars.day.stem] || STEM_INFO['甲'];
    const dbInfo = BRANCH_INFO[pillars.day.branch] || BRANCH_INFO['子'];
    badges.push({
      key: 'bazi_chart',
      labelZh: `四柱八字：日主${pillars.day.pillar}（${dmInfo.elementZh.split(' · ')[0]}）`,
      labelEn: `Four Pillars: Day Master ${pillars.day.pillar} (${dmInfo.element})`,
      summaryZh: `年柱${pillars.year.pillar} · 月柱${pillars.month.pillar} · 日柱${pillars.day.pillar} · 時柱${pillars.hour.pillar}（真太陽時校準 ${offsetMinutes >= 0 ? `+${offsetMinutes}` : offsetMinutes} 分）`,
      summaryEn: `Year ${pillars.year.pillar} · Month ${pillars.month.pillar} · Day ${pillars.day.pillar} · Hour ${pillars.hour.pillar} (Solar Offset ${offsetMinutes}m)`,
    });
    promptSections.push(
      `[RAG SLICE 1: SEEKER NATAL BAZI CHART]
- Birth Info: ${birthDateStr} ${birthTimeStr} (${context.birthCity || 'Longitude ' + longitude}), True Solar Time Offset: ${offsetMinutes} min
- Four Pillars (四柱): Year=${pillars.year.pillar} (${pillars.year.element}), Month=${pillars.month.pillar} (${pillars.month.element}), Day Master (日主)=${pillars.day.pillar} (${dmInfo.elementZh}), Hour=${pillars.hour.pillar} (${pillars.hour.element})
- Spouse Palace (日支夫妻宮): ${pillars.day.branch} (${dbInfo.palaceZh} / ${dbInfo.palaceEn})`
    );
  }

  if (master.ragConfig.includeTenGodsAndPalaces) {
    badges.push({
      key: 'ten_gods_palaces',
      labelZh: `十神宮位：${interaction.dayMasterAffinity.dynamicZh.split('（')[0]}`,
      labelEn: `Ten Gods & Palaces: ${interaction.dayMasterAffinity.dynamicEn.split('(')[0].trim()}`,
      summaryZh: interaction.dayMasterAffinity.titleZh,
      summaryEn: interaction.dayMasterAffinity.titleEn,
    });
    promptSections.push(
      `[RAG SLICE 2: TEN GODS & PALACE INTERACTION MATRIX]
- Day Master × Lot Resonance: ${interaction.dayMasterAffinity.dynamicZh} | ${interaction.dayMasterAffinity.descriptionZh}
- Month Career Pillar (${pillars.month.pillar}): ${interaction.pillarInteraction.dynamicZh} | ${interaction.pillarInteraction.descriptionZh}`
    );
  }

  if (master.ragConfig.includeDrawnLot) {
    const poemZh = lot.verse.lines.map((l) => l.zh).join('，');
    const poemEn = lot.verse.lines.map((l) => l.en).join(' / ');
    const domainGuidanceZh =
      lot.guidance?.[stage1.detectedDomain]?.zh ||
      lot.guidance?.general?.zh ||
      lot.plain_meaning?.zh ||
      '';
    const domainGuidanceEn =
      lot.guidance?.[stage1.detectedDomain]?.en ||
      lot.guidance?.general?.en ||
      lot.plain_meaning?.en ||
      '';
    const storyTitleZh = lot.stories?.[0]?.title?.zh || '';
    const storyNarrZh = lot.stories?.[0]?.narrative?.zh || '';

    badges.push({
      key: 'drawn_lot',
      labelZh: `第 ${lot.lot_number} 籤（${lotGanzhi} · ${lot.title.zh}）`,
      labelEn: `Lot #${lot.lot_number} (${lotGanzhi} · ${lot.title.en})`,
      summaryZh: `籤詩：${poemZh} | 典故：${storyTitleZh}`,
      summaryEn: `Verse: ${poemEn}`,
    });

    promptSections.push(
      `[RAG SLICE 3: DRAWN MAZU CANON LOT #${lot.lot_number} (${lotGanzhi})]
- Title: ${lot.title.zh} (${lot.title.en}) | Hexagram: ${lot.hexagram.name_zh} ${lot.hexagram.symbol}
- 7-Char Classical Verse: ${poemZh}
- English Verse: ${poemEn}
- Historical Story Allusion: ${storyTitleZh} — ${storyNarrZh}
- Canonical Guidance for [${stage1.detectedDomain}]: ZH="${domainGuidanceZh}" | EN="${domainGuidanceEn}"
- Favorable Keywords: ${(lot.keywords?.favourable?.zh || []).join('、')} | Guarded Keywords: ${(lot.keywords?.guarded?.zh || []).join('、')}`
    );
  }

  if (master.ragConfig.includeLifeBook) {
    badges.push({
      key: 'lifebook',
      labelZh: `九章命書：${matchedChapter.chapterNumberZh}《${matchedChapter.badgeZh}》`,
      labelEn: `Life Book: ${matchedChapter.chapterNumberEn} (${matchedChapter.badgeEn})`,
      summaryZh: matchedChapter.keyInsightZh,
      summaryEn: matchedChapter.keyInsightEn,
    });

    promptSections.push(
      `[RAG SLICE 4: TARGETED 9-SECTION LIFE BOOK CHAPTER (${matchedChapter.chapterNumberZh}: ${matchedChapter.titleZh})]
- Key Insight: ${matchedChapter.keyInsightZh}
- Synthesis: ${matchedChapter.contentZh}
- Strategic Action: ${matchedChapter.actionableAdviceZh}`
    );
  }

  if (master.ragConfig.includeTransits) {
    const y0 = getYearGanzhi(currentYear);
    const activeMilestone = queriedYearTransits[0] || transits.annualTimeline[0];
    const badgeYearInfo = queriedYearTransits[0]
      ? getYearGanzhi(queriedYearTransits[0].year)
      : y0;
    const spanZh = `${currentYear}–${endYear}`;

    badges.push({
      key: 'annual_transits',
      labelZh: `歲運應期：${badgeYearInfo.year} ${badgeYearInfo.ganzhi}（${spanZh} 滾動推演）× 節氣【${transits.solarTermTransit.termZh}】`,
      labelEn: `${badgeYearInfo.year} ${badgeYearInfo.pinyin} Transit (${spanZh} Rolling Window) × Solar Term [${transits.solarTermTransit.termEn}]`,
      summaryZh: activeMilestone?.mechanismZh || interaction.annualPillarResonance.windowZh,
      summaryEn: activeMilestone?.mechanismEn || interaction.annualPillarResonance.windowEn,
    });

    const timelineLines = transits.annualTimeline
      .map((item) => `  * ${item.titleZh} — ${item.mechanismZh} | Action: ${item.strategicActionZh}`)
      .join('\n');

    const extraQueriedLines = queriedYearTransits
      .filter((qItem) => !transits.annualTimeline.some((t) => t.year === qItem.year))
      .map((qItem) => `  * [Queried Year ${qItem.year}] ${qItem.titleZh} — ${qItem.mechanismZh} | Action: ${qItem.strategicActionZh}`)
      .join('\n');

    promptSections.push(
      `[RAG SLICE 5: DYNAMIC ROLLING ANNUAL TRANSITS (${spanZh}) & 24 SOLAR TERMS]
- Current Year (${currentYear} ${y0.ganzhi}) Resonance: ${interaction.annualPillarResonance.guidanceZh} | Action Window: ${interaction.annualPillarResonance.windowZh}
- Rolling ${spanZh} Annual Timeline:
${timelineLines}${extraQueriedLines ? `\n- Specifically Queried Year Transit(s):\n${extraQueriedLines}` : ''}
- Active Solar Term (${transits.solarTermTransit.termZh}): ${transits.solarTermTransit.transitResonanceZh}
- Palace Defense Alert: ${transits.palaceDefenseAlerts[0]?.palaceZh}: ${transits.palaceDefenseAlerts[0]?.defenseProtocolZh}`
    );
  }

  // 6. Custom Knowledge Base Documents (Semantic/Keyword Matching)
  const qLower = question.toLowerCase();
  const customDocs = (master.ragConfig.customKnowledgeDocs || []).filter(
    (doc) =>
      doc.domain === 'all' ||
      doc.domain === stage1.detectedDomain ||
      doc.keywords.some((kw) => qLower.includes(kw.toLowerCase()))
  );

  if (customDocs.length > 0) {
    badges.push({
      key: 'custom_rag_docs',
      labelZh: `宗師秘傳典籍：《${customDocs[0].titleZh}》`,
      labelEn: `Master Canon Lore: "${customDocs[0].titleEn}"`,
      summaryZh: customDocs[0].contentZh.slice(0, 60) + '...',
      summaryEn: customDocs[0].contentEn.slice(0, 60) + '...',
    });

    promptSections.push(
      `[RAG SLICE 6: MASTER'S PREDEFINED DOCTRINAL KNOWLEDGE BASE]
${customDocs.map((d) => `- 《${d.titleZh} / ${d.titleEn}》: ${d.contentZh} (${d.contentEn})`).join('\n')}`
    );
  }

  return {
    promptContext: promptSections.join('\n\n'),
    badges,
    pillars,
    lot,
    interaction,
    matchedChapter,
    transits,
    solarOffsetMinutes: offsetMinutes,
    currentYear,
    endYear,
    queriedYearTransits,
  };
}

/**
 * STAGE 2B: Master Persona Generation (Live LLM with Chart-Accurate Deterministic Fallback)
 */
export async function generateMasterConsultationReply(params: {
  master: OracleMaster;
  question: string;
  context: SeekerConsultationContext;
  stage1: Stage1IntentResult;
  history?: Array<{ role: 'user' | 'master'; content: string }>;
}): Promise<{
  reply: string;
  ragBadges: RagSourceBadge[];
  provider: 'llm' | 'personalization_engine_synthesis';
}> {
  const { master, question, context, stage1, history = [] } = params;
  const lang = context.language || (/[a-zA-Z]{4,}/.test(question) && !/[\u4e00-\u9fa5]/.test(question) ? 'en' : 'zh-TW');

  // If Stage 1 rejected the query, return the Master's confined-topic refusal immediately (Zero Stage-2 LLM cost!)
  if (!stage1.isAllowed) {
    let refusal =
      lang === 'zh-TW'
        ? master.confinedTopics.refusalMessageZh
        : master.confinedTopics.refusalMessageEn;

    if (stage1.suggestedMasterNameZh && stage1.intentStatus === 'rejected_outside_master_domain') {
      const domainLabelZh = getDomainTitleZh(stage1.detectedDomain);
      const domainLabelEn = getDomainTitleEn(stage1.detectedDomain);
      if (lang === 'zh-TW') {
        refusal += `\n\n💡 **聖殿智能分流指引**：偵測到您的問題屬於「**${domainLabelZh}**」範疇，建議您點擊上方宗師席位切換至專司此門的【**${stage1.suggestedMasterNameZh}**】進行請益（本次攔截不扣除您的提問額度）。`;
      } else {
        refusal += `\n\n💡 **Sanctuary Routing Tip**: Your inquiry touches upon **${domainLabelEn}**. We recommend switching to **${stage1.suggestedMasterNameEn}** above, who specializes in this domain (no question quota was deducted for this message).`;
      }
    }

    return {
      reply: refusal,
      ragBadges: [],
      provider: 'personalization_engine_synthesis',
    };
  }

  // Build Personalization Engine RAG Context
  const ragBundle = buildPersonalizationRagContext(master, context, stage1, question);

  // Try Primary LLM if API key is available
  const apiKey =
    getConfig('AI_API_KEY') ||
    process.env.AI_API_KEY ||
    process.env.FREE_LLM_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DEEPSEEK_API_KEY;

  if (apiKey) {
    try {
      const llmReply = await invokeMasterPersonaLlm({
        master,
        question,
        ragBundle,
        stage1,
        lang,
        apiKey,
        history,
      });
      if (llmReply) {
        return {
          reply: llmReply,
          ragBadges: ragBundle.badges,
          provider: 'llm',
        };
      }
    } catch (err) {
      console.warn('[MasterChatEngine] Stage 2 LLM failed, using Personalization Engine synthesis:', err);
    }
  }

  // Rich Chart-Accurate Personalization Engine Synthesis Fallback
  const synthesizedReply = synthesizeDeterministicMasterCounsel({
    master,
    question,
    ragBundle,
    stage1,
    lang,
  });

  return {
    reply: synthesizedReply,
    ragBadges: ragBundle.badges,
    provider: 'personalization_engine_synthesis',
  };
}

async function invokeMasterPersonaLlm(params: {
  master: OracleMaster;
  question: string;
  ragBundle: RagContextBundle;
  stage1: Stage1IntentResult;
  lang: 'en' | 'zh-TW';
  apiKey: string;
  history: Array<{ role: 'user' | 'master'; content: string }>;
}): Promise<string | null> {
  const { master, question, ragBundle, stage1, lang, apiKey, history } = params;
  const baseUrl = (
    getConfig('AI_API_ENDPOINT') ||
    process.env.AI_API_ENDPOINT ||
    process.env.AI_BASE_URL ||
    'https://api.openai.com/v1'
  ).replace(/\/+$/, '');
  const model =
    getConfig('AI_MODEL_NAME') || process.env.AI_MODEL_NAME || 'deepseek-chat';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const systemPrompt = `You are ${master.nameZh} (${master.nameEn}), ${master.titleZh} (${master.titleEn}) in the Mazu Sixty Jiazi Sacred Sanctuary.
[PREDEFINED CHARACTERISTICS]
- Personality: ${lang === 'zh-TW' ? master.characteristics.personalityZh : master.characteristics.personalityEn}
- Tone: ${lang === 'zh-TW' ? master.characteristics.toneZh : master.characteristics.toneEn}
- Speaking Style: ${lang === 'zh-TW' ? master.characteristics.speakingStyleZh : master.characteristics.speakingStyleEn}
${master.characteristics.systemPromptOverride ? `- Admin Custom Directive: ${master.characteristics.systemPromptOverride}` : ''}

[CONFINED TOPIC BOUNDARIES]
- You ONLY discuss topics within: ${master.confinedTopics.allowedDomains.join(', ')}.
- Verified Active Inquiry Domain: ${stage1.detectedDomain} (${getDomainTitleZh(stage1.detectedDomain)}).
- Never make fatalistic or superstitious threats; empower human agency, ethical discipline, and strategic timing.

[PERSONALIZATION ENGINE RAG KNOWLEDGE BASE (SEEKER'S LIVE BAZI & LOT)]
${ragBundle.promptContext}

Respond in ${lang === 'zh-TW' ? 'Traditional Chinese (繁體中文)' : 'English'}. Explicitly reference the seeker's exact Day Master (${ragBundle.pillars.day.pillar}), relevant Pillars (${ragBundle.pillars.month.pillar} / ${ragBundle.pillars.hour.pillar}), and Drawn Lot #${ragBundle.lot.lot_number} (${ragBundle.lot.ganzhi.zh}) so they feel your complete mastery of their chart.`;

    const recentMessages = history.slice(-6).map((m) => ({
      role: m.role === 'master' ? ('assistant' as const) : ('user' as const),
      content: m.content,
    }));

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages,
          { role: 'user', content: question },
        ],
        temperature: 0.5,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply || null;
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

function synthesizeDeterministicMasterCounsel(params: {
  master: OracleMaster;
  question: string;
  ragBundle: RagContextBundle;
  stage1: Stage1IntentResult;
  lang: 'en' | 'zh-TW';
}): string {
  const { master, ragBundle, stage1, lang } = params;
  const {
    pillars,
    lot,
    interaction,
    matchedChapter,
    transits,
    solarOffsetMinutes,
    currentYear,
    endYear,
    queriedYearTransits,
  } = ragBundle;
  const domainKey = stage1.detectedDomain;
  const domainZh = getDomainTitleZh(domainKey);
  const domainEn = getDomainTitleEn(domainKey);

  const y0 = getYearGanzhi(currentYear);
  const focusTransit = queriedYearTransits[0] || transits.annualTimeline[0];
  const focusYearInfo = queriedYearTransits[0] ? getYearGanzhi(queriedYearTransits[0].year) : y0;
  const spanLabel = `${currentYear}–${endYear}`;

  const poemLine12Zh = lot.verse.lines.slice(0, 2).map((l) => l.zh).join('，');
  const poemLine34Zh = lot.verse.lines.slice(2, 4).map((l) => l.zh).join('，');
  const domainGuideZh =
    lot.guidance?.[domainKey]?.zh ||
    lot.guidance?.general?.zh ||
    lot.plain_meaning?.zh ||
    '審時度勢，守正待時。';
  const domainGuideEn =
    lot.guidance?.[domainKey]?.en ||
    lot.guidance?.general?.en ||
    lot.plain_meaning?.en ||
    'Move with poised discernment and align with seasonal timing.';

  const customDoc =
    master.ragConfig.customKnowledgeDocs.find((d) => d.domain === domainKey) ||
    master.ragConfig.customKnowledgeDocs[0];

  if (lang === 'zh-TW') {
    if (master.id === 'master_cihang') {
      return `【${master.nameZh} · 拈花觀盤】

善信大德，吾已將您的生辰四柱（**年柱${pillars.year.pillar}、月柱${pillars.month.pillar}、日主${pillars.day.pillar}、時柱${pillars.hour.pillar}**，真太陽時校準 ${solarOffsetMinutes >= 0 ? `+${solarOffsetMinutes}` : solarOffsetMinutes} 分）與您虔誠求得之**第 ${lot.lot_number} 籤【${lot.ganzhi.zh} · ${lot.title.zh}】**深度合參，針對您所問之「**${domainZh}**」為您剖析如下：

1. **夫妻宮與時支心性映照（${pillars.day.pillar} × ${lot.ganzhi.zh}）**  
   您的日主為【**${pillars.day.stem}**】，坐下夫妻宮為【**${pillars.day.branch}**】（${BRANCH_INFO[pillars.day.branch]?.palaceZh || '內在情感核心'}），時柱子女/晚運宮為【**${pillars.hour.pillar}**】。本籤干支【${lot.ganzhi.zh}】與您日主形成「**${interaction.dayMasterAffinity.dynamicZh}**」。${matchedChapter.keyInsightZh}
   ${customDoc ? `\n   > 📜 *《${customDoc.titleZh}》秘要*：${customDoc.contentZh}` : ''}

2. **靈籤詩意與事類真詮**  
   籤詩有云：『**${poemLine12Zh}；${poemLine34Zh}**』。在「${domainZh}」面向，聖籤正統解曰為：「**${domainGuideZh}**」。配合典故《${lot.stories?.[0]?.title?.zh || lot.title.zh}》，此事切忌急躁強求或冷戰內耗，當以溫潤共情化開緊繃心結。

3. **慈航三味修持與應期處方（${spanLabel} 滾動推演）**  
   - **節氣調神（${transits.solarTermTransit.termZh}）**：${transits.solarTermTransit.transitResonanceZh}
   - **流年應期（${focusYearInfo.year} ${focusYearInfo.ganzhi}）**：${focusTransit ? focusTransit.mechanismZh : interaction.annualPillarResonance.windowZh}
   - **宮位守護**：${matchedChapter.actionableAdviceZh}`;
    }

    if (master.id === 'master_tianji') {
      return `【${master.nameZh} · 帷幄決策簡報】

閣下之真太陽時四柱（**${pillars.year.pillar} / ${pillars.month.pillar} / ${pillars.day.pillar} / ${pillars.hour.pillar}**）與**第 ${lot.lot_number} 籤【${lot.ganzhi.zh} · ${lot.title.zh}】**已入天機盤。針對閣下叩問之「**${domainZh}**」，本座直陳利害與攻守方略：

1. **月令提綱與財官籌碼（月柱 ${pillars.month.pillar} × 籤支 ${lot.ganzhi.zh}）**  
   閣下日元【**${pillars.day.stem}**】，月令事業提綱立於【**${pillars.month.pillar}**】，與本籤交感顯化「**${interaction.pillarInteraction.dynamicZh}**」。${matchedChapter.keyInsightZh}
   ${customDoc ? `\n   > ⚔️ *《${customDoc.titleZh}》兵法*：${customDoc.contentZh}` : ''}

2. **籤詩戰術定調（第 ${lot.lot_number} 籤 · ${lot.hexagram.name_zh}卦 ${lot.hexagram.symbol}）**  
   詩云：『**${poemLine12Zh}；${poemLine34Zh}**』。「${domainZh}」斷曰：「**${domainGuideZh}**」。當前宜取【${(lot.keywords?.favourable?.zh || ['守正', '蓄勢']).join('、')}】之策，嚴避【${(lot.keywords?.guarded?.zh || ['冒進', '輕信']).join('、')}】之險。

3. **${spanLabel} 戰略發力窗口與護城河**  
   - **歲君應期（${focusYearInfo.year} ${focusYearInfo.ganzhi}）**：${focusTransit ? `${focusTransit.mechanismZh} ${focusTransit.strategicActionZh}` : interaction.annualPillarResonance.windowZh}
   - **核心破局行動**：${matchedChapter.actionableAdviceZh}
   - **最佳發力時點**：${interaction.seasonActionWindow.actionTimingZh}`;
    }

    // Default / Master Xuanzhen or Custom Master
    return `【${master.nameZh} · 籤命合參法語】

善哉居士，貧道已據您所立真太陽時四柱（**年柱${pillars.year.pillar}、月柱${pillars.month.pillar}、日柱${pillars.day.pillar}、時柱${pillars.hour.pillar}**）與所抽**第 ${lot.lot_number} 籤【${lot.ganzhi.zh} · ${lot.title.zh}】**推演氣機。就您所問之「**${domainZh}**」，謹呈三層剖析：

1. **本命日主與靈籤十神共振（${pillars.day.pillar} × ${lot.ganzhi.zh}）**  
   居士日主為【**${pillars.day.stem}**】（${STEM_INFO[pillars.day.stem]?.elementZh || ''}），遇本籤【${lot.ganzhi.zh}】激盪出「**${interaction.dayMasterAffinity.dynamicZh}**」。月柱提綱【${pillars.month.pillar}】則呈現「${interaction.pillarInteraction.dynamicZh}」。${matchedChapter.keyInsightZh}
   ${customDoc ? `\n   > 📜 *《${customDoc.titleZh}》綱要*：${customDoc.contentZh}` : ''}

2. **六十甲子靈籤訓詁與典故印證**  
   本籤詩曰：『**${poemLine12Zh}；${poemLine34Zh}**』，取象於《${lot.stories?.[0]?.title?.zh || lot.title.zh}》。針對「${domainZh}」，籤本解曰：「**${domainGuideZh}**」。此象明示外境之起伏實為內心定力之試金石。

3. **歲君流年應期（${spanLabel} 滾動推演）與君子行止方略**  
   - **${focusYearInfo.year} ${focusYearInfo.ganzhi}歲君感應**：${queriedYearTransits[0] ? `${queriedYearTransits[0].mechanismZh} ${queriedYearTransits[0].strategicActionZh}` : interaction.annualPillarResonance.guidanceZh}
   - **應期視窗**：${interaction.annualPillarResonance.windowZh}
   - **修持要訣**：${matchedChapter.actionableAdviceZh}`;
  }

  // English Persona Synthesis
  return `[${master.nameEn} · ${master.titleEn}]

Noble Seeker, I have cross-calculated your True Solar Four Pillars (**Year ${pillars.year.pillar}, Month ${pillars.month.pillar}, Day Master ${pillars.day.pillar}, Hour ${pillars.hour.pillar}**; solar offset ${solarOffsetMinutes}m) with **Lot #${lot.lot_number} (${lot.ganzhi.zh} · "${lot.title.en}")** regarding your inquiry on **${domainEn}**:

1. **Day Master & Natal Palace Resonance (${pillars.day.pillar} × ${lot.ganzhi.zh})**  
   Your Day Master **[${pillars.day.stem}]** seated on **[${pillars.day.branch}]** (${BRANCH_INFO[pillars.day.branch]?.palaceEn || 'Core Palace'}) engages Lot ${lot.ganzhi.zh} through **${interaction.dayMasterAffinity.dynamicEn}**, while your Month Pillar **[${pillars.month.pillar}]** reflects **${interaction.pillarInteraction.dynamicEn}**. ${matchedChapter.keyInsightEn}
   ${customDoc ? `\n   > 📜 *From "${customDoc.titleEn}"*: ${customDoc.contentEn}` : ''}

2. **Oracle Quatrain & Domain Hermeneutics**  
   For **${domainEn}**, the canonical temple guidance states: *"${domainGuideEn}"* Anchored by the historical allusion of **${lot.stories?.[0]?.title?.en || lot.title.en}**, the oracle advises cultivating **${(lot.keywords?.favourable?.en || ['patience', 'clarity']).join(', ')}** while guarding against **${(lot.keywords?.guarded?.en || ['impulsiveness']).join(', ')}**.

3. **${spanLabel} Rolling Strategic Timing & Action Protocol**  
   - **${focusYearInfo.year} (${focusYearInfo.pinyin}) Annual Window**: ${queriedYearTransits[0] ? `${queriedYearTransits[0].mechanismEn} ${queriedYearTransits[0].strategicActionEn}` : interaction.annualPillarResonance.windowEn}
   - **Active Solar Term (${transits.solarTermTransit.termEn})**: ${transits.solarTermTransit.transitResonanceEn}
   - **Sovereign Counsel**: ${matchedChapter.actionableAdviceEn}`;
}
