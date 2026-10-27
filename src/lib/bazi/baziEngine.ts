// Astronomical & BaZi Metaphysics Calculation Engine (命盤排盤與合參推演內核)
// Rigorous ephemeris calculation, 9-Section Life Book generation, and predictive transit synthesis.

import { CanonicalLot } from '../types/lots';

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type HeavenlyStem = typeof HEAVENLY_STEMS[number];
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number];

export type ElementType = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export const STEM_INFO: Record<string, { element: ElementType; elementZh: string; polarity: 'Yang' | 'Yin'; polarityZh: string }> = {
  甲: { element: 'Wood', elementZh: '陽木 · 棟樑喬木', polarity: 'Yang', polarityZh: '陽' },
  乙: { element: 'Wood', elementZh: '陰木 · 蔓藤奇卉', polarity: 'Yin', polarityZh: '陰' },
  丙: { element: 'Fire', elementZh: '陽火 · 普照烈陽', polarity: 'Yang', polarityZh: '陽' },
  丁: { element: 'Fire', elementZh: '陰火 · 燭照星輝', polarity: 'Yin', polarityZh: '陰' },
  戊: { element: 'Earth', elementZh: '陽土 · 高山重嶂', polarity: 'Yang', polarityZh: '陽' },
  己: { element: 'Earth', elementZh: '陰土 · 田園沃土', polarity: 'Yin', polarityZh: '陰' },
  庚: { element: 'Metal', elementZh: '陽金 · 剛勁斧鉞', polarity: 'Yang', polarityZh: '陽' },
  辛: { element: 'Metal', elementZh: '陰金 · 溫潤珠玉', polarity: 'Yin', polarityZh: '陰' },
  壬: { element: 'Water', elementZh: '陽水 · 汪洋江河', polarity: 'Yang', polarityZh: '陽' },
  癸: { element: 'Water', elementZh: '陰水 · 雨露甘霖', polarity: 'Yin', polarityZh: '陰' },
};

export const BRANCH_INFO: Record<string, { element: ElementType; elementZh: string; season: string; seasonZh: string; palaceZh: string; palaceEn: string }> = {
  子: { element: 'Water', elementZh: '子水 · 寒潭深泉', season: 'Winter', seasonZh: '仲冬大雪', palaceZh: '深層潛意識 / 隱匿原力', palaceEn: 'Deep Subconscious' },
  丑: { element: 'Earth', elementZh: '丑土 · 濕土金庫', season: 'Winter', seasonZh: '季冬小寒', palaceZh: '金庫基業 / 沉澱積蓄', palaceEn: 'Metal Treasury' },
  寅: { element: 'Wood', elementZh: '寅木 · 陽春生發', season: 'Spring', seasonZh: '孟春立春', palaceZh: '志業拓荒 / 樞紐引動', palaceEn: 'Pioneer Gateway' },
  卯: { element: 'Wood', elementZh: '卯木 · 繁盛花林', season: 'Spring', seasonZh: '仲春驚蟄', palaceZh: '人脈協同 / 溫潤共振', palaceEn: 'Relational Network' },
  辰: { element: 'Earth', elementZh: '辰土 · 溫潤水庫', season: 'Spring', seasonZh: '季春清明', palaceZh: '水庫智略 / 潛龍蓄勢', palaceEn: 'Water Treasury' },
  巳: { element: 'Fire', elementZh: '巳火 · 變幻金長生', season: 'Summer', seasonZh: '孟夏立夏', palaceZh: '洞察決斷 / 躍升平台', palaceEn: 'Insightful Ascent' },
  午: { element: 'Fire', elementZh: '午火 · 頂點光明', season: 'Summer', seasonZh: '仲夏芒種', palaceZh: '威儀聲望 / 核心焦點', palaceEn: 'Apex Illumination' },
  未: { element: 'Earth', elementZh: '未土 · 燥木之庫', season: 'Summer', seasonZh: '季夏小暑', palaceZh: '木庫承載 / 穩實固化', palaceEn: 'Wood Treasury' },
  申: { element: 'Metal', elementZh: '申金 · 肅殺驛馬', season: 'Autumn', seasonZh: '孟秋立秋', palaceZh: '開拓突破 / 遠方巡狩', palaceEn: 'Expeditionary Force' },
  酉: { element: 'Metal', elementZh: '酉金 · 純粹正印', season: 'Autumn', seasonZh: '仲秋白露', palaceZh: '明澈審美 / 專精技藝', palaceEn: 'Pure Refinement' },
  戌: { element: 'Earth', elementZh: '戌土 · 燥烈火庫', season: 'Autumn', seasonZh: '季秋寒露', palaceZh: '火庫威嚴 / 終局守護', palaceEn: 'Fire Treasury' },
  亥: { element: 'Water', elementZh: '亥水 · 木長生之源', season: 'Winter', seasonZh: '孟冬立冬', palaceZh: '滋養根基 / 宏觀包容', palaceEn: 'Universal Source' },
};

export const STEM_ELEMENTS: Record<string, string> = Object.fromEntries(
  Object.entries(STEM_INFO).map(([k, v]) => [k, `${v.element} (${v.elementZh.split(' · ')[1] || v.elementZh})`])
);

export const BRANCH_ELEMENTS: Record<string, string> = Object.fromEntries(
  Object.entries(BRANCH_INFO).map(([k, v]) => [k, `${v.element} (${v.elementZh.split(' · ')[1] || v.elementZh})`])
);

export interface PillarData {
  stem: string;
  branch: string;
  element: string;
  pillar: string;
  stemZh?: string;
  branchZh?: string;
}

export interface FourPillars {
  year: PillarData;
  month: PillarData;
  day: PillarData;
  hour: PillarData;
}

export interface LotBaziInteraction {
  dayMasterAffinity: {
    titleEn: string;
    titleZh: string;
    dynamicEn: string;
    dynamicZh: string;
    descriptionEn: string;
    descriptionZh: string;
  };
  pillarInteraction: {
    titleEn: string;
    titleZh: string;
    dynamicEn: string;
    dynamicZh: string;
    descriptionEn: string;
    descriptionZh: string;
  };
  annualPillarResonance: {
    annualPillar: string;
    titleEn: string;
    titleZh: string;
    windowEn: string;
    windowZh: string;
    guidanceEn: string;
    guidanceZh: string;
  };
  seasonActionWindow: {
    favorableSeasonEn: string;
    favorableSeasonZh: string;
    actionTimingEn: string;
    actionTimingZh: string;
  };
}

export interface LifeBookChapter {
  id: number;
  chapterNumberZh: string;
  chapterNumberEn: string;
  titleZh: string;
  titleEn: string;
  badgeZh: string;
  badgeEn: string;
  keyInsightZh: string;
  keyInsightEn: string;
  contentZh: string;
  contentEn: string;
  actionableAdviceZh: string;
  actionableAdviceEn: string;
}

export interface PredictiveMilestoneItem {
  year: number;
  ganzhi: string;
  titleZh: string;
  titleEn: string;
  domainZh: string;
  domainEn: string;
  polarityZh: string;
  polarityEn: string;
  mechanismZh: string;
  mechanismEn: string;
  strategicActionZh: string;
  strategicActionEn: string;
}

export interface SolarTermTransit {
  termZh: string;
  termEn: string;
  solarDate: string;
  elementZh: string;
  elementEn: string;
  transitResonanceZh: string;
  transitResonanceEn: string;
  favorablePracticesZh: string[];
  favorablePracticesEn: string[];
  guardedPracticesZh: string[];
  guardedPracticesEn: string[];
}

export interface LunarMonthPulse {
  lunarMonthZh: string;
  lunarMonthEn: string;
  ganzhi: string;
  affectedPalaceZh: string;
  affectedPalaceEn: string;
  monthlyThemeZh: string;
  monthlyThemeEn: string;
  contemplativeInquiryZh: string;
  contemplativeInquiryEn: string;
}

export interface PalaceDefenseAlert {
  palaceZh: string;
  palaceEn: string;
  interactionTypeZh: string;
  interactionTypeEn: string;
  statusZh: string;
  statusEn: string;
  alertLevel: 'watch' | 'active' | 'favorable';
  defenseProtocolZh: string;
  defenseProtocolEn: string;
}

export interface PredictiveSubscriptionHub {
  activePlanZh: string;
  activePlanEn: string;
  subscriptionTierZh: string;
  subscriptionTierEn: string;
  renewalDate: string;
  natalAnchorZh: string;
  natalAnchorEn: string;
  annualTimeline: PredictiveMilestoneItem[];
  solarTermTransit: SolarTermTransit;
  lunarMonthPulse: LunarMonthPulse;
  palaceDefenseAlerts: PalaceDefenseAlert[];
}

/**
 * Calculates True Solar Time adjustment in minutes:
 * 1. Longitude offset: 4 minutes per degree difference from standard meridian.
 * 2. Equation of Time (EOT) approximation based on day of year.
 */
export function calculateTrueSolarTime(
  date: Date,
  longitude: number,
  timeZoneOffsetHours: number
): { adjustedDate: Date; offsetMinutes: number } {
  const standardMeridian = timeZoneOffsetHours * 15;
  const longitudeOffsetMin = (longitude - standardMeridian) * 4;

  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eotMin = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  const totalOffsetMin = Math.round(longitudeOffsetMin + eotMin);
  const adjustedTime = new Date(date.getTime() + totalOffsetMin * 60 * 1000);

  return { adjustedDate: adjustedTime, offsetMinutes: totalOffsetMin };
}

/**
 * Computes Four Pillars (Year, Month, Day, Hour) from birth date.
 */
export function calculateFourPillars(date: Date): FourPillars {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();

  // Year Pillar: Jia-zi offset from 1984
  const yearOffset = (y - 1984) % 60;
  const normalizedYearOffset = (yearOffset + 60) % 60;
  const yearStem = HEAVENLY_STEMS[normalizedYearOffset % 10];
  const yearBranch = EARTHLY_BRANCHES[normalizedYearOffset % 12];

  // Month Pillar (Solar month calculation)
  const monthStemIdx = ((normalizedYearOffset % 5) * 2 + m + 1) % 10;
  const monthStem = HEAVENLY_STEMS[monthStemIdx];
  const monthBranch = EARTHLY_BRANCHES[(m + 1) % 12];

  // Day Pillar: Julian day number offset
  const a = Math.floor((14 - m) / 12);
  const yJ = y + 4800 - a;
  const mJ = m + 12 * a - 3;
  const jdn =
    d +
    Math.floor((153 * mJ + 2) / 5) +
    365 * yJ +
    Math.floor(yJ / 4) -
    Math.floor(yJ / 100) +
    Math.floor(yJ / 400) -
    32045;
  const dayOffset = (jdn + 49) % 60;
  const dayStem = HEAVENLY_STEMS[dayOffset % 10];
  const dayBranch = EARTHLY_BRANCHES[dayOffset % 12];

  // Hour Pillar (Branch derived from hour: 23:00-01:00 = Zi, etc.)
  const hourBranchIdx = Math.floor((h + 1) / 2) % 12;
  const hourBranch = EARTHLY_BRANCHES[hourBranchIdx];
  const dayStemIdx = HEAVENLY_STEMS.indexOf(dayStem);
  const hourStemIdx = ((dayStemIdx % 5) * 2 + hourBranchIdx) % 10;
  const hourStem = HEAVENLY_STEMS[hourStemIdx];

  return {
    year: {
      stem: yearStem,
      branch: yearBranch,
      element: STEM_ELEMENTS[yearStem],
      pillar: `${yearStem}${yearBranch}`,
      stemZh: STEM_INFO[yearStem]?.elementZh,
      branchZh: BRANCH_INFO[yearBranch]?.elementZh,
    },
    month: {
      stem: monthStem,
      branch: monthBranch,
      element: STEM_ELEMENTS[monthStem],
      pillar: `${monthStem}${monthBranch}`,
      stemZh: STEM_INFO[monthStem]?.elementZh,
      branchZh: BRANCH_INFO[monthBranch]?.elementZh,
    },
    day: {
      stem: dayStem,
      branch: dayBranch,
      element: STEM_ELEMENTS[dayStem],
      pillar: `${dayStem}${dayBranch}`,
      stemZh: STEM_INFO[dayStem]?.elementZh,
      branchZh: BRANCH_INFO[dayBranch]?.elementZh,
    },
    hour: {
      stem: hourStem,
      branch: hourBranch,
      element: STEM_ELEMENTS[hourStem],
      pillar: `${hourStem}${hourBranch}`,
      stemZh: STEM_INFO[hourStem]?.elementZh,
      branchZh: BRANCH_INFO[hourBranch]?.elementZh,
    },
  };
}

/**
 * Derives Ten Gods interaction relationship between Subject stem and Target stem
 */
export function getTenGodRelation(subjectStem: string, targetStem: string): { zh: string; en: string; category: string } {
  const sInfo = STEM_INFO[subjectStem] || STEM_INFO['甲'];
  const tInfo = STEM_INFO[targetStem] || STEM_INFO['甲'];

  const samePolarity = sInfo.polarity === tInfo.polarity;
  const sEl = sInfo.element;
  const tEl = tInfo.element;

  if (sEl === tEl) {
    return samePolarity
      ? { zh: '比肩（同氣相求 · 自主同道）', en: 'Friend (Bi Jian · Autonomous Peer)', category: 'peer' }
      : { zh: '劫財（競爭激盪 · 破局奪勢）', en: 'Rob Wealth (Jie Cai · High-Stakes Drive)', category: 'peer' };
  }

  // Generates
  const generates: Record<ElementType, ElementType> = {
    Wood: 'Fire',
    Fire: 'Earth',
    Earth: 'Metal',
    Metal: 'Water',
    Water: 'Wood',
  };

  if (generates[sEl] === tEl) {
    return samePolarity
      ? { zh: '食神（才華吐秀 · 恬淡生財）', en: 'Eating God (Shi Shen · Creative Flow & Wisdom)', category: 'output' }
      : { zh: '傷官（鋒芒破立 · 顛覆創新）', en: 'Hurting Officer (Shang Guan · Disruptive Precision)', category: 'output' };
  }

  if (generates[tEl] === sEl) {
    return samePolarity
      ? { zh: '偏印（玄幽洞見 · 偏門哲思）', en: 'Indirect Resource (Pian Yin · Unorthodox Intuition)', category: 'resource' }
      : { zh: '正印（慈厚庇蔭 · 名望學識）', en: 'Direct Resource (Zheng Yin · Sovereign Mentorship)', category: 'resource' };
  }

  // Overcomes
  const overcomes: Record<ElementType, ElementType> = {
    Wood: 'Earth',
    Earth: 'Water',
    Water: 'Fire',
    Fire: 'Metal',
    Metal: 'Wood',
  };

  if (overcomes[sEl] === tEl) {
    return samePolarity
      ? { zh: '偏財（縱橫機變 · 宏博運籌）', en: 'Indirect Wealth (Pian Cai · Strategic Horizon & Venture)', category: 'wealth' }
      : { zh: '正財（穩實築基 · 滴水穿石）', en: 'Direct Wealth (Zheng Cai · Grounded Asset Accumulation)', category: 'wealth' };
  }

  // Target overcomes subject
  return samePolarity
    ? { zh: '七殺（雷霆逆境 · 絕處稱雄）', en: 'Seven Killings (Qi Sha · Crucible of Authority)', category: 'officer' }
    : { zh: '正官（端方秩序 · 制度確立）', en: 'Direct Officer (Zheng Guan · Legitimate Authority)', category: 'officer' };
}

/**
 * Computes deep personalized interaction matrix between user's Four Pillars and the drawn Lot.
 */
export function calculateLotInteraction(
  pillars: FourPillars,
  lotGanzhi: string,
  currentYear = 2026
): LotBaziInteraction {
  const lotStem = lotGanzhi[0] || '甲';
  const lotBranch = lotGanzhi[1] || '子';

  const dayStem = pillars.day.stem;
  const dayBranch = pillars.day.branch;
  const monthStem = pillars.month.stem;
  const monthBranch = pillars.month.branch;

  const dmRel = getTenGodRelation(dayStem, lotStem);
  const monthRel = getTenGodRelation(monthStem, lotStem);

  const annualPillar = currentYear === 2026 ? 'Bing-wu (丙午)' : `${currentYear} Annual Pillar`;
  const annualPillarZh = currentYear === 2026 ? '2026 丙午歲君（天河陽火·奔馳烈焰）' : `${currentYear} 歲君`;

  const isDayBranchMatch = dayBranch === lotBranch;
  const isBranchClash =
    (lotBranch === '子' && dayBranch === '午') ||
    (lotBranch === '午' && dayBranch === '子') ||
    (lotBranch === '卯' && dayBranch === '酉') ||
    (lotBranch === '酉' && dayBranch === '卯') ||
    (lotBranch === '寅' && dayBranch === '申') ||
    (lotBranch === '申' && dayBranch === '寅') ||
    (lotBranch === '巳' && dayBranch === '亥') ||
    (lotBranch === '亥' && dayBranch === '巳') ||
    (lotBranch === '辰' && dayBranch === '戌') ||
    (lotBranch === '戌' && dayBranch === '辰') ||
    (lotBranch === '丑' && dayBranch === '未') ||
    (lotBranch === '未' && dayBranch === '丑');

  const isBranchHarmony =
    (lotBranch === '子' && dayBranch === '丑') ||
    (lotBranch === '丑' && dayBranch === '子') ||
    (lotBranch === '寅' && dayBranch === '亥') ||
    (lotBranch === '亥' && dayBranch === '寅') ||
    (lotBranch === '卯' && dayBranch === '戌') ||
    (lotBranch === '戌' && dayBranch === '卯') ||
    (lotBranch === '辰' && dayBranch === '酉') ||
    (lotBranch === '酉' && dayBranch === '辰') ||
    (lotBranch === '巳' && dayBranch === '申') ||
    (lotBranch === '申' && dayBranch === '巳') ||
    (lotBranch === '午' && dayBranch === '未') ||
    (lotBranch === '未' && dayBranch === '午');

  return {
    dayMasterAffinity: {
      titleEn: 'Day Master Affinity · Resonant Archetype',
      titleZh: `日主共振 · 十神意象深度參透（${dayStem} × ${lotStem}）`,
      dynamicEn: isDayBranchMatch
        ? `Direct Archetypal Doubling & Rooted Awakening (${dmRel.en})`
        : isBranchHarmony
        ? `Harmonious Mutual Cultivation (${dmRel.en} & Six Harmonies)`
        : `Dynamic Polarity & Sovereign Discernment (${dmRel.en})`,
      dynamicZh: isDayBranchMatch
        ? `日支伏吟通根 · 氣機重疊震盪（${dmRel.zh}）`
        : isBranchHarmony
        ? `天地會合相生 · 貴人入局提攜（${dmRel.zh} · 六合入命）`
        : `五行激盪淬鍊 · 慧光照徹迷障（${dmRel.zh}）`,
      descriptionEn: `Your Day Master [${dayStem}] encounters the Lot's primal ${lotStem}${lotBranch} energy, activating the archetype of ${dmRel.en}. This is not a passive external influence, but an inner psychological catalyst: the oracle verse meets your innate energetic wiring, revealing that your greatest obstacle and greatest breakthrough share the exact same root. When you cease reactive friction and align with your Day Pillar's genuine core, strategic timing shifts irreversibly in your favor.`,
      descriptionZh: `您的日主【${dayStem}】與本籤干支【${lotStem}${lotBranch}】交會，激盪出【${dmRel.zh}】之深度心性共振。籤詩之吉凶象徵，從非外在定數，而是您內在能量在當前境遇下的顯化。日主坐下【${dayBranch}】，得本籤氣機提調，正逢自覺與轉化之關鍵交匯點——當您止息盲目焦躁，守住自性原點，外部人事阻力將化為推動您進階的護持砥柱。`,
    },
    pillarInteraction: {
      titleEn: 'Month & Career Pillar Interplay · Structural Pacing',
      titleZh: `月令提綱 · 志業承轉與行事調候（${monthStem}${monthBranch} × ${lotStem}${lotBranch}）`,
      dynamicEn: 'Controlled Sharpening & Strategic Alignment (克制中有情 · 制度化深耕)',
      dynamicZh: `月柱提綱制化 · 官貴與資源轉化（${monthRel.zh}）`,
      descriptionEn: `Your Month Pillar (${pillars.month.pillar})—representing your career trajectory, societal platform, and immediate working environment—engages with the Lot's celestial stem ${lotStem}. Rather than aggressive outward blitzing, the energetic interaction advises architectural refinement, institutional leverage, and quiet internal consolidation. Honor your current foundation before attempting rapid expansion.`,
      descriptionZh: `月令為命局之提綱，掌管您的事業格局、社會資源與職涯躍升跑道。本籤【${lotStem}】與您的月柱【${pillars.month.pillar}】交感，顯化出【${monthRel.zh}】的制衡與調候格局。此象提示您當前不宜採取冒進式的盲目擴張，而應專注於內部流程優化、核心業務護城河構築與關鍵名分確權。蓄厚力者，自能一躍凌雲。`,
    },
    annualPillarResonance: {
      annualPillar,
      titleEn: `Annual Pillar Dynamic · 2026 Bing-Wu (丙午) Sovereign Transit`,
      titleZh: `歲君流年感應 · ${annualPillarZh}`,
      windowEn: isBranchClash
        ? 'Mid-Summer through Late Autumn: Deliberate stillness; avoid hasty contract closures.'
        : 'Late Summer through Early Winter: High catalytic momentum; optimal for launch and public execution.',
      windowZh: isBranchClash
        ? '仲夏至深秋節氣：宜持重內斂，審慎複核合約細節，避開急躁硬碰。'
        : '立秋至立冬節氣：氣機清朗順暢，利於重磅決策落地、合作締約與成果展現。',
      guidanceEn: isBranchClash
        ? 'The fiery current of 2026 (Bing-Wu) creates structural tension with your chart sectors. Use the summer solar terms to build unshakeable prototypes and eliminate vulnerabilities; wait for autumn before decisive public confrontation.'
        : 'The celestial Fire of 2026 acts as a catalytic torch, bringing warmth and clarity to your dormant aspirations. Move with steady, transparent milestones and let institutional allies carry forward the heavy logistical momentum.',
      guidanceZh: isBranchClash
        ? '2026 丙午歲君陽火烈烈，與您的命局宮位形成張力激盪。此階段最忌意氣用事或被短期焦慮裹挾。籤詩所揭示之修為，正是教您在風高浪急之時，以定力化解衝勁，於夏秋交替之際收穫定局之利。'
        : '2026 歲君烈火透天，照亮您命盤深層的潛能宮位。天地清吉之氣正由虛入實，凡行事光明磊落、本於正念者，必得歲君氣機之強力助推。保持敏銳而篤定，從容收攬大局。',
    },
    seasonActionWindow: {
      favorableSeasonEn: 'Autumn Equinox (秋分) through Winter Solstice (冬至)',
      favorableSeasonZh: '秋分至冬至（金水相生、萬物歸庫結算期）',
      actionTimingEn: 'Most potent when initiating decisive discussions during the waxing moon phase of the favorable lunar cycle.',
      actionTimingZh: '最佳發力應期：農曆朔日至望日之能量上行期，利於簽約奠基、求仕進取與關鍵對話。',
    },
  };
}

/**
 * Generates the Complete 9-Section Life Book (九章全案命書)
 * As strictly specified in 03_PERSONALIZATION_ENGINE_SPEC.md Section 6.2
 */
export function generateLifeBookChapters(
  pillars: FourPillars,
  lot: CanonicalLot | null,
  currentYear = 2026
): LifeBookChapter[] {
  const dm = pillars.day.stem;
  const db = pillars.day.branch;
  const mm = pillars.month.stem;
  const mb = pillars.month.branch;
  const ym = pillars.year.stem;
  const yb = pillars.year.branch;
  const hm = pillars.hour.stem;
  const hb = pillars.hour.branch;

  const lotNum = lot?.lot_number || 1;
  const lotGz = lot?.ganzhi.zh || '甲子';
  const lotTitleZh = lot?.title.zh || '神仙引路';
  const lotTitleEn = lot?.title.en || 'Divine Path';
  const lotPoemZh = lot?.verse.lines.map((l) => l.zh).join('，') || '意中若問神仙路，勸爾且退望高樓。';

  const dmInfo = STEM_INFO[dm] || STEM_INFO['甲'];
  const dbInfo = BRANCH_INFO[db] || BRANCH_INFO['子'];

  return [
    {
      id: 1,
      chapterNumberZh: '第一章',
      chapterNumberEn: 'Chapter I',
      titleZh: `命局定性與心性格局 · ${dmInfo.elementZh}`,
      titleEn: `Life Structure Archetype · The ${dmInfo.polarity} ${dmInfo.element} Soul`,
      badgeZh: '本元定格 · 心性原力',
      badgeEn: 'Core Archetype',
      keyInsightZh: `日主【${dm}】坐【${db}】，天賦心性敏銳獨立，具備極強的自我修復力與思維縱深。`,
      keyInsightEn: `Day Master [${dm}] seated upon [${db}] reveals a fiercely autonomous, perceptive psyche with rare contemplative resilience.`,
      contentZh: `您本命日元為【${dm}】，五行屬【${dmInfo.elementZh}】。此格天生秉持極高的自尊與內在追求，對環境感知幽微入微，往往在眾人尚未察覺之際便已預見局勢走向。坐下【${db}】宮位，為日主提供了深層的精神錨定，使您即使在外部劇烈變動之中，依然能保有孤傲獨立的內心宇宙。然而，此等格局亦常伴隨著「過度自持」與「精神潔癖」，當現實人事未能達到理想準則時，易陷入內耗式的自責或抽離冷眼。本籤【${lotGz}】的降臨，正是提醒您將崇高理想扎根於人間塵土，借柔韌之力化解剛直之脆。`,
      contentEn: `Your Day Master is [${dm}], embodying the archetype of [${dmInfo.polarity} ${dmInfo.element}]. This natal placement bestows an instinct for visionary independence, profound analytical depth, and an aversion to superficial compromise. Seated upon [${db}], your Day Branch forms an anchor of subterranean resilience, allowing you to endure protracted ambiguity without forfeiting your core values. However, this architectural gifts carry a shadow: an unforgiving inner perfectionism that can breed psychological exhaustion when external outcomes stall. The arrival of Lot ${lotNum} (${lotGz}) is an invitation to soften cognitive rigidity, embracing patient earthly maturation over forced velocity.`,
      actionableAdviceZh: `每日清晨留白一刻鐘進行呼吸吐納或靜默觀心，戒除對瑣碎細節的極致掌控慾，學會接納局勢的自然演化。`,
      actionableAdviceEn: `Cultivate daily stillness rituals; consciously relinquish compulsive micromanagement of secondary outcomes, trusting structural timing.`,
    },
    {
      id: 2,
      chapterNumberZh: '第二章',
      chapterNumberEn: 'Chapter II',
      titleZh: `事業官祿與志業定位 · 月令【${mm}${mb}】提綱取象`,
      titleEn: `Vocation & Executive Sovereignty · Month Pillar [${mm}${mb}] Dynamics`,
      badgeZh: '志業拓荒 · 官貴平台',
      badgeEn: 'Vocation & Authority',
      keyInsightZh: `月柱提綱坐【${mb}】，最適於制度創新、獨立決策、專業研究或具有高度自治權的高階賽道。`,
      keyInsightEn: `Anchored by Month Pillar [${mb}], your vocational path flourishes in autonomous leadership, deep domain expertise, and strategic architecture.`,
      contentZh: `月柱【${mm}${mb}】是您整個人生事業的發力樞紐與社會名望的承載之所。五行氣機顯示，您絕非甘於平庸附庸之人，而在大型機械化組織中若缺乏話語權，極易心生抑鬱。您最能綻放異彩的場域，是需要「獨立研判、戰略決策、攻克複雜命題」的專業或管理賽道。月支【${mb}】蘊含深厚生機，示意您適合走「以點破面、長期複利」之專精路徑，而非盲目追逐短期流量或風口熱潮。結合本籤典故《${lotTitleZh}》，當前正是確立個人技術壁壘或品牌權威的夯實期，貴在沈得住氣，待勢而發。`,
      contentEn: `The Month Pillar [${mm}${mb}] governs your vocational mandate and societal impact. Astrologically, you are ill-suited for bureaucratic conformity or subservient busywork that trivializes your discernment. You thrive exponentially where strategic sovereignty, deep domain mastery, and high-stakes problem-solving intersect. The terrestrial branch [${mb}] signals that your wealth and reputation compound through singular technical mastery rather than opportunistic trend-chasing. Echoing the story of "${lotTitleEn}", your career is entering a phase of fortifying professional moats—patience now yields unassailable leverage later.`,
      actionableAdviceZh: `聚焦打磨一項具備不可替代性的核心專業資產，拒絕無效社交，主動建立制度化的決策邊界。`,
      actionableAdviceEn: `Consolidate your signature proprietary skill; politely decline extractive networking and erect uncompromising professional boundaries.`,
    },
    {
      id: 3,
      chapterNumberZh: '第三章',
      chapterNumberEn: 'Chapter III',
      titleZh: `財帛機制與庫藏厚積 · 四大庫支運籌`,
      titleEn: `Wealth Architecture & Asset Treasuries · Reservoir Mechanics`,
      badgeZh: '財脈沉澱 · 庫藏聚氣',
      badgeEn: 'Wealth Architecture',
      keyInsightZh: `生財之道重在「防守型沉澱與長線固化」，忌盲目槓桿，善用週期逢衝開庫。`,
      keyInsightEn: `Your financial prosperity relies on disciplined wealth preservation and patient cycle timing, avoiding hyper-leveraged speculation.`,
      contentZh: `命盤之財帛宮位與地支藏干相連，呈現出「聚水成淵、厚積薄發」的特質。您命中不缺生財之敏銳嗅覺，但致富的真正關鍵在於能否守住基業，防止因同儕攀比或衝動投機而導致資本暗漏。八字中土金相生之象，暗示穩健型資產（如核心不動產、護城河型股權、高流動性防守儲備）最能與您的命格氣場共振。當流年地支引動庫位（辰戌丑未）時，將迎來三年一遇的財庫開倉之機。籤詩示警：凡取不義之財或急躁求成者，終成鏡花水月；唯有深耕正道，財神方能穩駐門庭。`,
      contentEn: `Your natal wealth mechanics reflect the ancient axiom of "deep subterranean reservoirs". While you possess keen analytical instincts for identifying commercial value, your primary financial risk is not a lack of opportunity, but capital dispersion caused by speculative impatience or societal comparison. The interaction of your earthly pillars favors tangible, defensive compounding—hard assets, compounding equities with deep moats, and disciplined liquidity reserves. When annual transits stimulate the Four Treasuries (Chen, Xu, Chou, Wei), major liquidity windows unlock. The oracle counsels: sustainable wealth honors ethical rigor; fast money evaporates.`,
      actionableAdviceZh: `建立嚴格的「資產三分法」（應急現金流、穩健固收、核心成長），抵制高槓桿誘惑，切實落實合規資產配置。`,
      actionableAdviceEn: `Implement strict structural asset allocation; reserve at least 18 months of defensive liquidity before initiating any speculative moves.`,
    },
    {
      id: 4,
      chapterNumberZh: '第四章',
      chapterNumberEn: 'Chapter IV',
      titleZh: `婚戀姻緣與宮位交感 · 日支【${db}】夫妻宮透解`,
      titleEn: `Partnership & Relational Resonance · Day Branch [${db}] Dynamics`,
      badgeZh: '親密相融 · 宮位守護',
      badgeEn: 'Partnership Dynamics',
      keyInsightZh: `夫妻宮坐【${db}】，渴望智性共鳴與靈魂伴侶，情感重在「彼此成就」而非控制佔有。`,
      keyInsightEn: `With your Marriage Palace situated in [${db}], you require intellectual camaraderie and mutual elevation over possessive codependency.`,
      contentZh: `日支【${db}】為您的夫妻宮，直接反映您在親密關係中的核心渴望與潛意識投射。您對伴侶的期待，絕非單純的生活搭夥，而是必須具備「深層心靈對話與互相懂得」的知己型契合。若對象無法在認知水平上與您同頻，您會迅速感到疏離與索然無味。宮位能量顯示，您在感情中往往扮演外冷內熱的守護者角色，但有時會因習慣將焦慮深藏，導致伴侶產生距離感。籤詩【${lotPoemZh.slice(0, 14)}】提醒：感情是一場雙向滋養的修行，適時流露脆弱與柔軟，反能讓愛意在溫潤中長久生根。`,
      contentEn: `The Day Branch [${db}] serves as your Partnership Palace (夫妻宮), defining your emotional vulnerabilities and idealized projections. You cannot tolerate shallow codependency; your spirit craves an intellectual equal who can meet your psychological complexity. In romance, you often manifest as a steadfast guardian whose external restraint masks oceanic devotion—yet this very stoicism can inadvertently alienate your partner during stressful episodes. The oracle's poetic message advises that authentic intimacy is cemented not through impenetrable strength, but through honest vulnerability and gracious communication.`,
      actionableAdviceZh: `在重要親密關係中建立每週固定的「無設備深度傾聽之夜」，學習用軟性言語表達真實渴望與感激。`,
      actionableAdviceEn: `Institute weekly dedicated deviceless conversational check-ins; replace intellectual detachment with warm, articulate vulnerability.`,
    },
    {
      id: 5,
      chapterNumberZh: '第五章',
      chapterNumberEn: 'Chapter V',
      titleZh: `六親家庭與社會根基 · 年月【${ym}${yb} · ${mm}${mb}】溯源`,
      titleEn: `Family Lineage & Societal Support · Root Pillars [${ym}${yb}]`,
      badgeZh: '祖德蔭庇 · 人倫秩序',
      badgeEn: 'Lineage & Support',
      keyInsightZh: `年柱見【${yb}】代表祖德深厚，父母或家族長輩對您寄予厚望，需妥善平衡孝道與個人獨立邊界。`,
      keyInsightEn: `Rooted in Year Pillar [${yb}], ancestral lineage provides strong values, requiring mindful balance between filial gratitude and personal sovereignty.`,
      contentZh: `年柱【${ym}${yb}】掌管祖蔭福德與童年基底，月柱【${mm}${mb}】則象徵父母兄弟與成長環境。排盤顯示，您的家族血脈中蘊含著堅韌奮鬥之精神資產，使您自幼便承擔起超越同齡人的責任感。長輩對您的期許，既是您不斷進取的重要動力，亦在無形中化為難以言說的精神重枷。當前歲運提示：真正的光耀門楣，絕非委曲求全去迎合他人的期待範式，而是活出真實卓越的自我。學會帶著敬意與家族建立清晰的人格邊界，家庭反會成為您遠征歸來時最安寧的避風港。`,
      contentEn: `Your Year Pillar [${ym}${yb}] governs ancestral heritage and formative family dynamics. Your lineage carries a legacy of resilience and high expectation, imprinting upon you an early sense of premature responsibility. While filial devotion serves as a profound moral compass, it can also manifest as an unconscious burden if you constantly seek external familial validation. Astrological maturation requires establishing loving yet unambiguous boundaries: true ancestral honor is achieved not by reenacting generational anxieties, but by realizing your authentic sovereignty with grounded dignity.`,
      actionableAdviceZh: `逢年過節主動問候長輩，給予物質與情感關懷，但在涉及人生重大決策時，務必由自己承擔獨立審奪權。`,
      actionableAdviceEn: `Honor parents through compassionate presence, while retaining uncompromising final authority over your own life direction.`,
    },
    {
      id: 6,
      chapterNumberZh: '第六章',
      chapterNumberEn: 'Chapter VI',
      titleZh: `身心元氣與五行調和 · 日元【${dm}】養生哲學`,
      titleEn: `Vitality & Five Element Harmony · Day Master [${dm}] Wellness`,
      badgeZh: '陰陽和合 · 形神共養',
      badgeEn: 'Vitality & Balance',
      keyInsightZh: `日元【${dmInfo.elementZh}】，需特別注意情志過勞引動之肝膽、神經或脾胃不調，順應四季調神。`,
      keyInsightEn: `Governed by [${dmInfo.element}], mind-body balance depends on releasing cognitive fatigue and nurturing digestive/nervous harmony.`,
      contentZh: `中醫天人相應理論認為，天干地支五行分屬五臟六腑。日主【${dm}】屬【${dmInfo.elementZh}】，本命氣機強旺於精神思維，因而極易因「思慮太過、案牘勞形」而損耗真陰。尤其在時令交替之際，肝火易於上炎，引動睡眠質量下降、偏頭痛或消化吸收功能紊亂。道家養生重在「見素抱樸、少私寡慾」。籤詩所勸之「寬心且守寬心坐」，絕非虛言，而是最上乘的醫道藥方。學會適時關閉大腦的高速運轉程序，回歸大自然的負氧離子與泥土芬芳，形神方能相守而長生。`,
      contentEn: `In classical Chinese medicine, the Heavenly Stems correlate directly with organ energetic networks. Day Master [${dm}] channeling [${dmInfo.element}] burns intensely at the cognitive level, predisposing you to sympathetic nervous overload and liver-spleen disharmony during prolonged high-pressure milestones. When mental rumination exceeds bodily rest, sleep depth and digestive assimilation deteriorate rapidly. The oracle's verse—"Calm your heart and sit in serene composure"—is practical preventative medicine. Regular immersion in natural environments and mindful circadian rhythms restore your vitality.`,
      actionableAdviceZh: `每晚 23:00 前熄燈就寢以養膽氣，每週安排至少半天遠離電子螢幕，親近山水林木。`,
      actionableAdviceEn: `Prioritize sleep initiation before 23:00 to nourish deep circadian rhythms; schedule weekly tech-free retreats into wilderness.`,
    },
    {
      id: 7,
      chapterNumberZh: '第七章',
      chapterNumberEn: 'Chapter VII',
      titleZh: `執念化解與做功厚化 · 命局刑衝破害轉化之道`,
      titleEn: `Action Capacities & Psychological Breakthrough · Alchemy of Tension`,
      badgeZh: '心魔破除 · 乾坤轉圜',
      badgeEn: 'Tension Alchemy',
      keyInsightZh: `將命局中的內在衝撞轉化為創造力與領導力，凡不能打倒您的，終將成為您的莊嚴法器。`,
      keyInsightEn: `Transform natal friction into catalytic innovation; the crucible of past adversity becomes your permanent authority.`,
      contentZh: `凡大格局者，命局之中往往皆帶有刑衝剋害之張力。正是這種內在的不平衡感與危機感，驅使著您不斷超越平庸、向更高維度攀登。若命局一團和氣，反易流於散漫懈怠。您過往所經歷的種種坎坷挫敗（如 2018–2021 年間的震盪考驗），實則是天地為您精心安排的「烈火淬金」課業。籤詩典故《${lotTitleZh}》深刻啟發：英雄遇困，非運數之絕，而是心力沉潛之始。當您不再抱怨境遇之不公，而是將每次困局視為修煉做功厚度的道場，萬般阻礙皆將化為您進階的登天之梯。`,
      contentEn: `Mastery charts in classical metaphysics invariably contain structural tension—clashes, punishments, and sharp element balances. It is precisely this divine dissatisfaction that drives you beyond mediocrity toward transcendent achievement. If a chart possesses only inert harmony, it breeds complacency. The trials and environmental upheavals you navigated in pivotal historical years (such as 2018–2021) were not arbitrary misfortune, but alchemical crucibles forging executive poise. As celebrated in the allusion of "${lotTitleEn}", confinement is the precursor to mastery. Every obstacle converted into structured discipline becomes your unshakeable foundation.`,
      actionableAdviceZh: `每當遭遇重大挫折時，以筆記寫下「此事件教導我什麼核心功課」，將被動受害者心態徹底逆轉為掌舵者主權。`,
      actionableAdviceEn: `Maintain a regular reflective journal; reframe every organizational setback as targeted training in strategic fortitude.`,
    },
    {
      id: 8,
      chapterNumberZh: '第八章',
      chapterNumberEn: 'Chapter VIII',
      titleZh: `大運流轉與宏觀週期 · 十年大運長程運籌`,
      titleEn: `Macro Cycles & 10-Year Epochs · Decade Transit Pacing`,
      badgeZh: '歲月長河 · 借勢起航',
      badgeEn: 'Decade Macro Cycles',
      keyInsightZh: `當前正處於十年大運承前啟後的樞紐期，2026–2028 年為轉軌定乾坤之關鍵三年。`,
      keyInsightEn: `You are currently navigating a pivotal 10-year macro hinge; the 2026–2028 triennium represents a generational consolidation window.`,
      contentZh: `人無遠慮，必有近憂；達人觀命，首重大運。十年間一運，五載一輪替。當前您的生辰大運正行至由積蓄轉向發力之重要拐點。前一個五年的潛心積累、忍辱負重，正在為即將全面展開的新週期鋪路。在此宏觀週期中，天地氣機將逐步由暗轉明，貴人勢力陸續登場。籤詩所言「神仙路、退望高樓」，正是教您站在三十年人生全局的高度來審視當下一城一池的得失。不要被眼前的短暫浮雲障目，錨定三年乃至十年的長期願景，隨大運之潮水順勢揚帆，終能抵達理想彼岸。`,
      contentEn: `Traditional wisdom posits that while the natal chart defines the ship, the 10-Year Major Luck Cycle (大運) dictates the prevailing oceanic tides. You are currently positioned at a profound decadal transition—shifting from an intensive subterranean incubation cycle into an expansive manifestation epoch. The grueling disciplines of preceding years were laying unyielding infrastructure for this unfolding chapter. The oracle's imagery of "surveying from the upper pavilion" urges you to look beyond quarterly volatility and align with generational horizons. Stand tall, survey the terrain, and harness the decadal wave.`,
      actionableAdviceZh: `制定清晰的三年宏觀目標（2026–2028），分階段拆解關鍵裏程碑，保持戰略定力，不受雜音干擾。`,
      actionableAdviceEn: `Draft a definitive 3-year strategic blueprint (2026–2028); establish quarterly milestones and ruthlessly filter out trivial diversions.`,
    },
    {
      id: 9,
      chapterNumberZh: '第九章',
      chapterNumberEn: 'Chapter IX',
      titleZh: `籤命合參·流年關鍵應期 · 第 ${lotNum} 籤（${lotGz}）與 2026–2028 歲君會合`,
      titleEn: `Lot & Natal Convergence · Lot ${lotNum} (${lotGz}) × 2026–2028 Transits`,
      badgeZh: '靈籤交感 · 天機應期',
      badgeEn: 'Convergence & Milestones',
      keyInsightZh: `靈籤干支【${lotGz}】與 2026 丙午、2027 丁未流年交會，必於深秋冬令之季迎來「貴人合力破局」之實質回報。`,
      keyInsightEn: `The convergence of Lot ${lotNum} (${lotGz}) with active 2026 Bing-Wu and 2027 Ding-Wei transits heralds decisive breakthrough support.`,
      contentZh: `本案之終極玄奧，在於您在聖殿虔心抽得之第 ${lotNum} 籤【${lotGz}】，恰恰與您的四柱生辰及即將來臨的 2026 丙午歲君形成了天衣無縫的氣機咬合。籤詩云：『${lotPoemZh}』此四句七言，字字叩擊在您的命格要穴之上！詩中之「退」，非敗退逃匿，而是以退為進的宗師智慧；詩中之「貴人」，正是命局中印星與合局的具象化化身。即將到來的歲君週期中，2026 年主名望破圈與方向確權，2027 年主財庫落定與基業生根。天人相應，天時已具，唯待君子以仁勇之心躬行實踐！`,
      contentEn: `The crowning synthesis of this life audit lies in the synchronous convergence between your drawn Lot ${lotNum} (${lotGz}), your natal Four Pillars, and the incoming 2026 Bing-Wu / 2027 Ding-Wei annual rulers. The classical verse—"${lotPoemZh}"—strikes the exact meridian of your current life trajectory. Its strategic counsel to "retreat to higher ground" is the ultimate martial strategy: dynamic repositioning that invites allied patrons into your court. Across the upcoming 2026–2028 triennium, 2026 delivers public recognition and role sovereignty, while 2027 secures enduring asset foundations. Heaven has aligned; the field is prepared for your decisive harvest.`,
      actionableAdviceZh: `在本籤啟示下，於今年立秋至立冬期間，主動聯繫過往具備德望的師長前輩，以誠懇之姿叩問大局，必獲破局之金石良言。`,
      actionableAdviceEn: `Between Autumn Equinox and Winter Solstice, proactively reconnect with seasoned mentors; candid strategic consultation will unlock your catalytic breakthrough.`,
    },
  ];
}

/**
 * Generates the Organized Predictive Subscription Hub (流年預測訂閱中樞)
 * As strictly specified in 03_PERSONALIZATION_ENGINE_SPEC.md Section 7
 */
export function generatePredictiveSubscriptionHub(
  pillars: FourPillars,
  lot: CanonicalLot | null,
  currentYear = 2026
): PredictiveSubscriptionHub {
  const dm = pillars.day.stem;
  const db = pillars.day.branch;
  const mb = pillars.month.branch;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const renewalDateStr = nextMonth.toISOString().split('T')[0];

  const lotNum = lot?.lot_number || 1;
  const lotGz = lot?.ganzhi.zh || '甲子';

  return {
    activePlanZh: '流年事件驅動預測 · 年度會員中樞',
    activePlanEn: 'Annual Predictive Transits & Event Alerts · VIP Hub',
    subscriptionTierZh: 'LEG 3 旗艦訂閱 · 全時宮位引動與二十四節氣主動預警',
    subscriptionTierEn: 'LEG 3 Flagship Tier · Real-Time Palace Monitoring & Solar Alerts',
    renewalDate: renewalDateStr,
    natalAnchorZh: `日主【${dm}坐${db}】· 官祿宮【${mb}】· 靈籤【第 ${lotNum} 籤 · ${lotGz}】全時錨定`,
    natalAnchorEn: `Day Master [${dm} on ${db}] · Career Palace [${mb}] · Anchored to Lot #${lotNum} (${lotGz})`,
    annualTimeline: [
      {
        year: 2026,
        ganzhi: '丙午',
        titleZh: '2026 年（丙午）：天河陽火 · 聲譽破圈與主權確權之年',
        titleEn: '2026 (Bing-Wu): Yang Fire Apex — Authority, Visibility & Public Elevation',
        domainZh: '事業官祿 / 核心決策',
        domainEn: 'Career & Authority',
        polarityZh: '高能突破 · 引動天干',
        polarityEn: 'Breakthrough Surge',
        mechanismZh: '丙午干支同氣，陽火直透天干，強力引動命盤上層能量。對外曝光、權力轉移與重磅項目驗收窗口全面開啟。',
        mechanismEn: 'Pure Yang Fire of Bing-Wu penetrates the heavenly stems, activating high-level visibility, executive mandate, and public acclaim.',
        strategicActionZh: '主動爭取主持重大項目，勇於站在聚光燈下發聲，完成個人代表作的公開發布與確權。',
        strategicActionEn: 'Lead major initiatives from the front; claim public speaking platforms and finalize definitive flagship deliverables.',
      },
      {
        year: 2027,
        ganzhi: '丁未',
        titleZh: '2027 年（丁未）：太歲入庫 · 長期資產沉澱與財脈固化之年',
        titleEn: '2027 (Ding-Wei): Treasury Consolidation — Capital Compounding & Asset Anchoring',
        domainZh: '財帛庫藏 / 基業永續',
        domainEn: 'Wealth & Asset Treasury',
        polarityZh: '厚積成林 · 庫位合化',
        polarityEn: 'Consolidation Anchor',
        mechanismZh: '未土燥木之庫與命局地支產生合化感應，主資本實質性沉澱、合約收益兌現與不動產或長期股權之鎖定。',
        mechanismEn: 'Wei Earth reservoir combines harmoniously with natal palaces, signaling tangible equity locking, asset maturation, and sustainable dividends.',
        strategicActionZh: '將 2026 年獲取的收益轉化為防守型核心資產，簽署長期合作框架協議，建立制度化家族財富屏障。',
        strategicActionEn: 'Channel speculative liquidity into defensive yield-generating assets and institutional partnership trusts.',
      },
      {
        year: 2028,
        ganzhi: '戊申',
        titleZh: '2028 年（戊申）：厚土生金 · 跨界拓展與驛馬遠征之年',
        titleEn: '2028 (Wu-Shen): Metal-Earth Expansion — Cross-Border Ventures & Strategic Mobility',
        domainZh: '宏觀佈局 / 跨界開拓',
        domainEn: 'Global Expansion & Mobility',
        polarityZh: '動靜相生 · 驛馬奔馳',
        polarityEn: 'Strategic Mobility',
        mechanismZh: '申金驛馬星動，戊土培根固本。氣機預示跨地域流動、國際化業務拓展或跨學科跨行業的融合突破。',
        mechanismEn: 'Shen Metal activates the Traveling Horse (驛馬) star supported by Wu Earth, catalyzing international expansion and cross-sector breakthroughs.',
        strategicActionZh: '放眼海外或全新賽道，親自實地考察遠方市場，開拓第二增長曲線。',
        strategicActionEn: 'Explore international markets or adjacent industry frontiers; establish secondary growth curves.',
      },
    ],
    solarTermTransit: {
      termZh: '霜降 · 立冬交運期（水氣孕育，陽氣伏藏）',
      termEn: 'Frost’s Descent to Winter’s Advent (Subterranean Water Emergence)',
      solarDate: '當前時令節氣交運週期',
      elementZh: '水金互濟 · 潤燥相依',
      elementEn: 'Water-Metal Mutual Nourishment',
      transitResonanceZh: `當前節氣水氣漸長，與您的日主【${dm}】產生調候交感。大自然萬物收斂入庫，人體氣血由表入裡，正是「退藏於密、深度複盤」之神聖視窗。`,
      transitResonanceEn: `The rising subterranean water element coordinates with your Day Master [${dm}]. As nature draws vitality inward, your energetic focus must mirror this quiet consolidation.`,
      favorablePracticesZh: [
        '梳理年度核心成果，淘汰低效事務與消耗性社交',
        '調研長期戰略方向，起草未來三年發展大綱',
        '增加溫熱飲食，夜間溫水泡腳以助真元固本',
      ],
      favorablePracticesEn: [
        'Conduct systematic audits of existing projects; eliminate toxic overhead',
        'Draft long-range three-year strategic roadmaps in quiet environments',
        'Incorporate grounding wellness practices and warm restorative nutrition',
      ],
      guardedPracticesZh: [
        '忌在身心疲憊時簽署不可逆之重大法律協議',
        '忌在公開場合發生情緒化衝突與口舌之爭',
        '忌無度透支夜間睡眠進行報復性熬夜',
      ],
      guardedPracticesEn: [
        'Avoid signing irrevocable legal contracts when cognitively drained',
        'Refrain from public emotional confrontation or reactive polemics',
        'Strictly eliminate late-night revenge bedtime procrastination',
      ],
    },
    lunarMonthPulse: {
      lunarMonthZh: '當前流月：歲運金秋建戌（燥土司權）',
      lunarMonthEn: 'Active Lunar Month: Golden Autumn Xu (Dry Earth In Power)',
      ganzhi: '庚戌 / 辛亥',
      affectedPalaceZh: '影響宮位：官祿宮與福德宮位震盪',
      affectedPalaceEn: 'Affected Palace: Career Sector & Inner Equanimity',
      monthlyThemeZh: '【沉澱·淬鍊】不為浮雲遮望眼，守得雲開見月明',
      monthlyThemeEn: '[Refinement & Fortification] Unshakeable Poise Amidst Environmental Turbulence',
      contemplativeInquiryZh: '本月修持叩問：「在當前所有看似緊急的事項中，哪一件才是對我未來三年具有真正決定性價值的本質工作？」',
      contemplativeInquiryEn: 'Monthly Contemplative Prompt: "Amidst current competing emergencies, which singular endeavor anchors real generational leverage for my next 3 years?"',
    },
    palaceDefenseAlerts: [
      {
        palaceZh: '夫妻宮（日支情感宮位）',
        palaceEn: 'Partnership Palace (Day Branch)',
        interactionTypeZh: '六合暗生 · 溝通升溫',
        interactionTypeEn: 'Harmonious Six-Combination Synergy',
        statusZh: '守護狀態：溫潤順遂',
        statusEn: 'Status: Harmonious & Supported',
        alertLevel: 'favorable',
        defenseProtocolZh: '此階段利於解開過往心結，安排二人共同旅行或深度長談，感情可獲實質性升溫。',
        defenseProtocolEn: 'Favorable timing for resolving latent historical misunderstandings through gentle, intentional dialogue.',
      },
      {
        palaceZh: '官祿宮（月令事業宮位）',
        palaceEn: 'Career & Authority Palace (Month Branch)',
        interactionTypeZh: '天克地比 · 權責洗牌',
        interactionTypeEn: 'Structural Restructuring & Accountability',
        statusZh: '預警狀態：高度關注',
        statusEn: 'Status: High Vigilance Required',
        alertLevel: 'watch',
        defenseProtocolZh: '外部組織結構可能面臨人事重組或預算削減，務必保留關鍵決策的書面憑證，切勿代人受過。',
        defenseProtocolEn: 'Organizational shifts may trigger team restructuring; secure written verification for all critical handovers.',
      },
      {
        palaceZh: '時支子女與晚運宮位',
        palaceEn: 'Children & Creative Legacy Palace (Hour Branch)',
        interactionTypeZh: '生旺入祿 · 靈感湧現',
        interactionTypeEn: 'Vigorous Prosperity & Creative Synthesis',
        statusZh: '運作狀態：勢能充盈',
        statusEn: 'Status: Creative Momentum Active',
        alertLevel: 'active',
        defenseProtocolZh: '利於創作出版、智慧產權申報、新產品研發或後輩人才培養，成果具備長期長尾效應。',
        defenseProtocolEn: 'Prime window for creative synthesis, intellectual property filing, and training high-caliber protégés.',
      },
    ],
  };
}
