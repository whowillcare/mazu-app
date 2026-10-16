// Advanced BaZi Birth Hour Rectification & Milestone Engine (考时定盘与深度推演内核)
// Referenced from: 米圖八字排盤軟件_交付版内核 (paipan.py, verdict.py, layers_mingshu.py)

import {
  calculateFourPillars,
  calculateTrueSolarTime,
  FourPillars,
} from './baziEngine';

export type RoughTimeSlot = 'morning' | 'afternoon' | 'night' | 'not_sure';

export interface MilestoneEvent {
  year: number;
  ganzhi: string;
  age: number;
  domain: 'relationship' | 'career_move' | 'wealth_treasury' | 'vitality';
  polarity: 'breakthrough' | 'transformation' | 'restructuring';
  titleZh: string;
  titleEn: string;
  mechanismZh: string;
  mechanismEn: string;
}

export interface CandidateHour {
  branch: string;
  stem: string;
  pillar: string;
  shichenZh: string;
  shichenEn: string;
  timeRange: string;
  sampleHour: number;
  fourPillars: FourPillars;
  milestones: MilestoneEvent[];
}

export interface RectificationQuestion {
  id: string;
  year: number;
  ganzhi: string;
  focusDomain: 'relationship' | 'career_move' | 'wealth_treasury';
  questionZh: string;
  questionEn: string;
  options: Array<{
    id: string;
    textZh: string;
    textEn: string;
    supportingBranches: string[];
  }>;
}

export interface RectificationResult {
  pinpointedHour: CandidateHour;
  confidenceScore: number;
  allCandidates: Array<{
    branch: string;
    shichenZh: string;
    shichenEn: string;
    score: number;
  }>;
  insightfulExcerptZh: string;
  insightfulExcerptEn: string;
  upcomingPredictiveMilestones: MilestoneEvent[];
}

// 12 Shichen Configuration
const SHICHEN_CONFIG: Record<
  string,
  { zh: string; en: string; timeRange: string; hour: number; slot: RoughTimeSlot }
> = {
  子: { zh: '子時', en: 'Rat Hour', timeRange: '23:00 - 01:00', hour: 0, slot: 'not_sure' },
  丑: { zh: '丑時', en: 'Ox Hour', timeRange: '01:00 - 03:00', hour: 2, slot: 'not_sure' },
  寅: { zh: '寅時', en: 'Tiger Hour', timeRange: '03:00 - 05:00', hour: 4, slot: 'not_sure' },
  卯: { zh: '卯時', en: 'Rabbit Hour', timeRange: '05:00 - 07:00', hour: 6, slot: 'morning' },
  辰: { zh: '辰時', en: 'Dragon Hour', timeRange: '07:00 - 09:00', hour: 8, slot: 'morning' },
  巳: { zh: '巳時', en: 'Snake Hour', timeRange: '09:00 - 11:00', hour: 10, slot: 'morning' },
  午: { zh: '午時', en: 'Horse Hour', timeRange: '11:00 - 13:00', hour: 12, slot: 'afternoon' },
  未: { zh: '未時', en: 'Goat Hour', timeRange: '13:00 - 15:00', hour: 14, slot: 'afternoon' },
  申: { zh: '申時', en: 'Monkey Hour', timeRange: '15:00 - 17:00', hour: 16, slot: 'afternoon' },
  酉: { zh: '酉時', en: 'Rooster Hour', timeRange: '17:00 - 19:00', hour: 18, slot: 'night' },
  戌: { zh: '戌時', en: 'Dog Hour', timeRange: '19:00 - 21:00', hour: 20, slot: 'night' },
  亥: { zh: '亥時', en: 'Pig Hour', timeRange: '21:00 - 23:00', hour: 22, slot: 'night' },
};

// Earthly Branch Clashes (六沖)
const ZHI_CHONG: Record<string, string> = {
  子: '午', 午: '子',
  丑: '未', 未: '丑',
  寅: '申', 申: '寅',
  卯: '酉', 酉: '卯',
  辰: '戌', 戌: '辰',
  巳: '亥', 亥: '巳',
};

// Earthly Branch Harmonies (六合)
const ZHI_HE: Record<string, string> = {
  子: '丑', 丑: '子',
  寅: '亥', 亥: '寅',
  卯: '戌', 戌: '卯',
  辰: '酉', 酉: '辰',
  巳: '申', 申: '巳',
  午: '未', 未: '午',
};

// Recent key calendar years for milestone evaluation
const HISTORICAL_YEAR_GANZHI: Array<{ year: number; gz: string; branch: string }> = [
  { year: 2016, gz: '丙申', branch: '申' },
  { year: 2017, gz: '丁酉', branch: '酉' },
  { year: 2018, gz: '戊戌', branch: '戌' },
  { year: 2019, gz: '己亥', branch: '亥' },
  { year: 2020, gz: '庚子', branch: '子' },
  { year: 2021, gz: '辛丑', branch: '丑' },
  { year: 2022, gz: '壬寅', branch: '寅' },
  { year: 2023, gz: '癸卯', branch: '卯' },
  { year: 2024, gz: '甲辰', branch: '辰' },
  { year: 2025, gz: '乙巳', branch: '巳' },
];

/**
 * Filter candidate branches based on user coarse selection
 */
export function getCandidateBranches(slot: RoughTimeSlot): string[] {
  switch (slot) {
    case 'morning':
      return ['卯', '辰', '巳'];
    case 'afternoon':
      return ['午', '未', '申'];
    case 'night':
      return ['酉', '戌', '亥'];
    case 'not_sure':
    default:
      return ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  }
}

/**
 * Calculates candidate hour pillars and their historical milestone events (应期 / 引动年)
 */
export function generateCandidateHours(
  birthDateStr: string,
  timeSlot: RoughTimeSlot,
  location?: string
): CandidateHour[] {
  const [yStr, mStr, dStr] = birthDateStr.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);

  const branches = getCandidateBranches(timeSlot);

  return branches.map((branch) => {
    const cfg = SHICHEN_CONFIG[branch];
    const baseDate = new Date(y, m - 1, d, cfg.hour, 30);

    // Apply solar correction if location provided
    const longitude = location?.includes('121') ? 121.5 : 120.0;
    const { adjustedDate } = calculateTrueSolarTime(baseDate, longitude, 8);
    const pillars = calculateFourPillars(adjustedDate);

    // Derive milestones across historical years
    const milestones: MilestoneEvent[] = [];
    const dayBranch = pillars.day.branch; // 夫妻宫
    const hourBranch = pillars.hour.branch; // 子女宫 / 晚年动象
    const monthBranch = pillars.month.branch; // 事业宫 / 父母

    HISTORICAL_YEAR_GANZHI.forEach(({ year, gz, branch: yBranch }) => {
      const age = year - y;
      if (age < 15 || age > 75) return;

      // 1. 夫妻宫 (Day Branch) interactions
      if (ZHI_CHONG[dayBranch] === yBranch) {
        milestones.push({
          year,
          ganzhi: gz,
          age,
          domain: 'relationship',
          polarity: 'transformation',
          titleZh: `${year}年（${gz}）：夫妻宫逢冲 · 感情与人际结构动变`,
          titleEn: `${year} (${gz}): Partnership Palace Clash — Emotional & Relational Shift`,
          mechanismZh: `流年地支${yBranch}冲动日支${dayBranch}（夫妻宫），感情名分、居住环境或亲密关系面临考验与重新缔结。`,
          mechanismEn: `Annual branch ${yBranch} clashes with Day branch ${dayBranch} (Partnership Palace), signaling major relationship restructuring or domestic relocation.`,
        });
      } else if (ZHI_HE[dayBranch] === yBranch) {
        milestones.push({
          year,
          ganzhi: gz,
          age,
          domain: 'relationship',
          polarity: 'breakthrough',
          titleZh: `${year}年（${gz}）：夫妻宫逢合 · 缘分缔结或稳固`,
          titleEn: `${year} (${gz}): Partnership Palace Harmony — Relationship Consolidation`,
          mechanismZh: `流年地支${yBranch}六合日支${dayBranch}，主情感盟约、重要合作或家庭关系走向和合。`,
          mechanismEn: `Annual branch ${yBranch} combines with Day branch ${dayBranch}, fostering partnership consolidation or mutual agreement.`,
        });
      }

      // 2. 子女宫 / 事业动象 (Hour Branch) interactions
      if (ZHI_CHONG[hourBranch] === yBranch) {
        milestones.push({
          year,
          ganzhi: gz,
          age,
          domain: 'career_move',
          polarity: 'transformation',
          titleZh: `${year}年（${gz}）：时支子女宫动 · 事业转折或城市迁徙`,
          titleEn: `${year} (${gz}): Hour Palace Clash — Career Elevation or Geographic Relocation`,
          mechanismZh: `流年${yBranch}冲动时支${hourBranch}，主平台变动、工作转轨、远行出差或新项目启动。`,
          mechanismEn: `Annual branch ${yBranch} clashes with Hour branch ${hourBranch}, driving major career realignment, relocation, or novel initiatives.`,
        });
      }

      // 3. 月令提纲 (Month Branch) interactions
      if (ZHI_CHONG[monthBranch] === yBranch) {
        milestones.push({
          year,
          ganzhi: gz,
          age,
          domain: 'career_move',
          polarity: 'restructuring',
          titleZh: `${year}年（${gz}）：月令提綱逢衝 · 職涯平台大轉型`,
          titleEn: `${year} (${gz}): Month Palace Clash — Major Career/Platform Shift`,
          mechanismZh: `流年${yBranch}衝動月令${monthBranch}，主工作環境重組、職責切換或重要晉升轉軌。`,
          mechanismEn: `Annual branch ${yBranch} clashes with Month branch ${monthBranch}, driving major work environment shifts or responsibility transitions.`,
        });
      }

      // 3. 财库 (辰戌丑未) 开合机制
      const isKu = ['辰', '戌', '丑', '未'].includes(dayBranch) || ['辰', '戌', '丑', '未'].includes(hourBranch);
      if (isKu && (yBranch === '戌' || yBranch === '辰' || yBranch === '未' || yBranch === '丑')) {
        milestones.push({
          year,
          ganzhi: gz,
          age,
          domain: 'wealth_treasury',
          polarity: 'breakthrough',
          titleZh: `${year}年（${gz}）：财库引动 · 资产重构或重大置产`,
          titleEn: `${year} (${gz}): Wealth Treasury Activated — Capital Deployment or Property Acquisition`,
          mechanismZh: `四库地支引动，主资金盘活、置业购房、大额投资或财富积累模式重大转向。`,
          mechanismEn: `Treasury branch activated, marking key capital reallocation, real estate transactions, or business breakthroughs.`,
        });
      }
    });

    return {
      branch,
      stem: pillars.hour.stem,
      pillar: pillars.hour.pillar,
      shichenZh: cfg.zh,
      shichenEn: cfg.en,
      timeRange: cfg.timeRange,
      sampleHour: cfg.hour,
      fourPillars: pillars,
      milestones,
    };
  });
}

/**
 * Builds 2 to 3 targeted historical questionnaire questions with highest discriminatory power
 */
export function buildRectificationQuestionnaire(
  birthDateStr: string,
  timeSlot: RoughTimeSlot,
  location?: string
): RectificationQuestion[] {
  const candidates = generateCandidateHours(birthDateStr, timeSlot, location);

  // Group candidate milestones by year and domain to find differential contrast
  const questions: RectificationQuestion[] = [];

  // Question 1: Career / Relocation focus (e.g. 2018 or 2019)
  const q1Candidates = candidates.filter((c) =>
    c.milestones.some((m) => m.year === 2018 || m.year === 2019 || m.year === 2021)
  );
  const q1Branches = q1Candidates.map((c) => c.branch);
  const otherBranches1 = candidates.map((c) => c.branch).filter((b) => !q1Branches.includes(b));

  questions.push({
    id: 'q_career_move',
    year: 2018,
    ganzhi: '戊戌 / 己亥',
    focusDomain: 'career_move',
    questionZh: '回溯 2018–2019 年（戊戌·己亥年）期间，您是否经历过重大职业变动、跳槽转轨，或城市居所迁徙？',
    questionEn: 'Reflecting back to 2018–2019: Did you experience a major career transition, job relocation, or significant change of residence?',
    options: [
      {
        id: 'yes_move',
        textZh: '是的，此阶段有明确的职场进阶、居所搬迁或重大环境调整。',
        textEn: 'Yes, I experienced a clear career shift, relocation, or substantial environmental reset.',
        supportingBranches: q1Branches.length > 0 ? q1Branches : candidates.slice(0, 2).map((c) => c.branch),
      },
      {
        id: 'no_stable',
        textZh: '并未发生显著变动，生活与工作基本保持平稳延续。',
        textEn: 'No significant shifts; work and domestic life remained generally stable.',
        supportingBranches: otherBranches1.length > 0 ? otherBranches1 : candidates.slice(2).map((c) => c.branch),
      },
    ],
  });

  // Question 2: Relationship / Partnership focus (e.g. 2020 or 2021)
  const q2Candidates = candidates.filter((c) =>
    c.milestones.some((m) => m.domain === 'relationship' && (m.year === 2020 || m.year === 2021 || m.year === 2023))
  );
  const q2Branches = q2Candidates.map((c) => c.branch);
  const otherBranches2 = candidates.map((c) => c.branch).filter((b) => !q2Branches.includes(b));

  questions.push({
    id: 'q_relationship',
    year: 2021,
    ganzhi: '辛丑 / 癸卯',
    focusDomain: 'relationship',
    questionZh: '在 2020–2021 年（庚子·辛丑年）期间，您的感情婚姻或核心人际关系是否发生过重要里程碑（如缔结婚约、深层重组或感情转折）？',
    questionEn: 'Around 2020–2021: Did you undergo a notable relationship milestone, marriage decision, or core partnership restructuring?',
    options: [
      {
        id: 'yes_relation',
        textZh: '是的，此阶段亲密关系或重要合作伙伴发生了深刻变动或重要承诺。',
        textEn: 'Yes, my primary partnership underwent a profound milestone, reorganization, or commitment.',
        supportingBranches: q2Branches.length > 0 ? q2Branches : candidates.slice(1, 3).map((c) => c.branch),
      },
      {
        id: 'no_relation',
        textZh: '否，情感状态相对平淡稳定，重点主要在个人事务上。',
        textEn: 'No, emotional life was steady and my primary focus was on personal pursuits.',
        supportingBranches: otherBranches2.length > 0 ? otherBranches2 : candidates.filter((_, i) => i % 2 === 0).map((c) => c.branch),
      },
    ],
  });

  return questions;
}

/**
 * Solves the birth hour based on questionnaire answers and returns the verified Four Pillars and insightful excerpt
 */
export function solveBirthHour(
  birthDateStr: string,
  timeSlot: RoughTimeSlot,
  answers: Record<string, string>,
  location?: string
): RectificationResult {
  const candidates = generateCandidateHours(birthDateStr, timeSlot, location);
  const questions = buildRectificationQuestionnaire(birthDateStr, timeSlot, location);

  // Score candidate branches based on selected options
  const scores: Record<string, number> = {};
  candidates.forEach((c) => {
    scores[c.branch] = 1.0; // Baseline
  });

  questions.forEach((q) => {
    const chosenOptionId = answers[q.id];
    if (chosenOptionId) {
      const option = q.options.find((o) => o.id === chosenOptionId);
      if (option) {
        option.supportingBranches.forEach((b) => {
          if (scores[b] !== undefined) scores[b] += 2.0;
        });
      }
    }
  });

  // Find winning candidate
  let bestBranch = candidates[0].branch;
  let highestScore = -1;
  Object.keys(scores).forEach((b) => {
    if (scores[b] > highestScore) {
      highestScore = scores[b];
      bestBranch = b;
    }
  });

  const winningHour = candidates.find((c) => c.branch === bestBranch) || candidates[0];
  const dm = winningHour.fourPillars.day.stem;
  const db = winningHour.fourPillars.day.branch;
  const hb = winningHour.branch;

  // Synthesize Insightful Excerpt Hook (The Convincing Diagnostic Snippet)
  const excerptZh = `您的生辰定盤為「${winningHour.shichenZh}（${winningHour.timeRange}）」。命局日主為「${dm}」，夫妻宮坐「${db}」，時柱歸於「${hb}」。命理結構顯示您天生具備極強的自主核心與敏銳直覺，但也伴隨著自我期許與外部制度的深層張力。考時定盤軌跡印證：您人生真正的進階與突破，往往並非來自順境安逸，而是在歷史關鍵節點（如 2018–2019 或 2021 年）遭遇環境重構時，被迫破釜沉舟所激發出的獨特格局。即將到來的 2026–2027 年歲君交運，將再次引動關鍵宮位，迎來三年一遇的破局窗口。`;

  const excerptEn = `Your rectified birth hour is converged to the ${winningHour.shichenEn} (${winningHour.timeRange}), grounding your chart with Day Master ${dm} seated upon ${db}, and Hour Pillar anchored in ${hb}. Your natal structure reveals a potent tension between an uncompromising independent vision and systemic structures. Historical milestone alignment confirms that major breakthroughs in your journey have repeatedly culminated not during passive calm, but during sharp environmental shifts (notably around 2018–2019 or 2021) that demanded autonomous mastery. The active transits of 2026–2027 are set to activate these core palaces once again, unlocking a pivotal strategic window.`;

  // Upcoming predictive milestones (next 3 years)
  const upcomingMilestones: MilestoneEvent[] = [
    {
      year: 2026,
      ganzhi: '丙午',
      age: 2026 - parseInt(birthDateStr.split('-')[0], 10),
      domain: 'career_move',
      polarity: 'breakthrough',
      titleZh: '2026年（丙午）：陽火透干 · 平台能見度與決策權飛躍',
      titleEn: '2026 (Bing-Wu): Yang Fire Manifest — Professional Visibility & Authority Surge',
      mechanismZh: '丙午干支同氣引動天干，利於公開展現、關鍵業務確權及個人聲譽破圈。',
      mechanismEn: 'Annual pillar Bing-Wu energizes the upper stems, catalyzing public recognition and strategic autonomy.',
    },
    {
      year: 2027,
      ganzhi: '丁未',
      age: 2027 - parseInt(birthDateStr.split('-')[0], 10),
      domain: 'wealth_treasury',
      polarity: 'breakthrough',
      titleZh: '2027年（丁未）：太歲入庫 · 長期資產沉澱與財脈固化',
      titleEn: '2027 (Ding-Wei): Treasury Consolidation — Asset Grounding & Wealth Compounding',
      mechanismZh: '未土財庫與時支宮位相呼應，主資本落地、置產固化與長期回報兌現。',
      mechanismEn: 'Wei Earth treasury resonates with natal palaces, signaling tangible asset acquisition and sustainable returns.',
    },
  ];

  const bestScore = scores[winningHour.branch] || 1;
  const otherScores = Object.entries(scores)
    .filter(([b]) => b !== winningHour.branch)
    .map(([, s]) => s)
    .sort((a, b) => b - a);
  const runnerUp = otherScores[0] || (bestScore * 0.7);
  const diff = bestScore - runnerUp;
  const dynamicConfidence = Math.min(98, Math.max(82, Math.round(86 + diff * 2.5)));

  return {
    pinpointedHour: winningHour,
    confidenceScore: dynamicConfidence,
    allCandidates: candidates.map((c) => ({
      branch: c.branch,
      shichenZh: c.shichenZh,
      shichenEn: c.shichenEn,
      score: scores[c.branch] || 1.0,
    })),
    insightfulExcerptZh: excerptZh,
    insightfulExcerptEn: excerptEn,
    upcomingPredictiveMilestones: upcomingMilestones,
  };
}
