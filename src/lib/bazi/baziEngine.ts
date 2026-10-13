// Astronomical & BaZi Metaphysics Calculation Engine

export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export const STEM_ELEMENTS: Record<string, string> = {
  甲: 'Wood (木)',
  乙: 'Wood (木)',
  丙: 'Fire (火)',
  丁: 'Fire (火)',
  戊: 'Earth (土)',
  己: 'Earth (土)',
  庚: 'Metal (金)',
  辛: 'Metal (金)',
  壬: 'Water (水)',
  癸: 'Water (水)',
};

export const BRANCH_ELEMENTS: Record<string, string> = {
  子: 'Water (水)',
  丑: 'Earth (土)',
  寅: 'Wood (木)',
  卯: 'Wood (木)',
  辰: 'Earth (土)',
  巳: 'Fire (火)',
  午: 'Fire (火)',
  未: 'Earth (土)',
  申: 'Metal (金)',
  酉: 'Metal (金)',
  戌: 'Earth (土)',
  亥: 'Water (水)',
};

export interface FourPillars {
  year: { stem: string; branch: string; element: string; pillar: string };
  month: { stem: string; branch: string; element: string; pillar: string };
  day: { stem: string; branch: string; element: string; pillar: string };
  hour: { stem: string; branch: string; element: string; pillar: string };
}

export interface LotBaziInteraction {
  dayMasterAffinity: {
    titleEn: string;
    titleZh: string;
    dynamicEn: string;
    descriptionEn: string;
  };
  pillarInteraction: {
    titleEn: string;
    titleZh: string;
    dynamicEn: string;
    descriptionEn: string;
  };
  annualPillarResonance: {
    annualPillar: string;
    titleEn: string;
    windowEn: string;
    guidanceEn: string;
  };
  seasonActionWindow: {
    favorableSeason: string;
    actionTiming: string;
  };
}

/**
 * Calculates True Solar Time adjustment in minutes:
 * 1. Longitude offset: 4 minutes per degree difference from standard meridian (e.g. 120°E for UTC+8, -75° for UTC-5).
 * 2. Equation of Time (EOT) approximation based on day of year.
 */
export function calculateTrueSolarTime(
  date: Date,
  longitude: number,
  timeZoneOffsetHours: number
): { adjustedDate: Date; offsetMinutes: number } {
  const standardMeridian = timeZoneOffsetHours * 15;
  const longitudeOffsetMin = (longitude - standardMeridian) * 4;

  // Approximate Equation of Time (in minutes)
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

  // Year Pillar: Jia-zi offset from 1984 (Jia-zi year)
  const yearOffset = (y - 1984) % 60;
  const normalizedYearOffset = (yearOffset + 60) % 60;
  const yearStem = HEAVENLY_STEMS[normalizedYearOffset % 10];
  const yearBranch = EARTHLY_BRANCHES[normalizedYearOffset % 12];

  // Month Pillar approximation (Solar month calculation)
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
    },
    month: {
      stem: monthStem,
      branch: monthBranch,
      element: STEM_ELEMENTS[monthStem],
      pillar: `${monthStem}${monthBranch}`,
    },
    day: {
      stem: dayStem,
      branch: dayBranch,
      element: STEM_ELEMENTS[dayStem],
      pillar: `${dayStem}${dayBranch}`,
    },
    hour: {
      stem: hourStem,
      branch: hourBranch,
      element: STEM_ELEMENTS[hourStem],
      pillar: `${hourStem}${hourBranch}`,
    },
  };
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

  // Active Annual Pillar: 2026 is Bing-wu 丙午
  const annualPillar = currentYear === 2026 ? 'Bing-wu (丙午)' : `${currentYear} Annual Pillar`;

  const isDayBranchMatch = pillars.day.branch === lotBranch;
  const isBranchClash =
    (lotBranch === '子' && pillars.day.branch === '午') ||
    (lotBranch === '午' && pillars.day.branch === '子') ||
    (lotBranch === '卯' && pillars.day.branch === '酉');

  return {
    dayMasterAffinity: {
      titleEn: 'Day Master Affinity · Resonant Archetype',
      titleZh: '日主共振 · 十神意象',
      dynamicEn: isDayBranchMatch
        ? 'Direct Resource & Root Support (正印/通根)'
        : 'Auxiliary Element Guidance (相生有情)',
      descriptionEn: `Your Day Pillar (${pillars.day.pillar}) meets the Lot's ${lotStem}${lotBranch} energy. This alignment signals deep internal clarity, grounding your discernment so you act without impulsive wavering.`,
    },
    pillarInteraction: {
      titleEn: 'Month & Career Pillar Interplay',
      titleZh: '月令提綱 · 承轉制化',
      dynamicEn: 'Controlled Sharpening & Strategic Focus (克中有情)',
      descriptionEn: `The celestial influence of ${lotStem} coordinates with your Month Pillar (${pillars.month.pillar}). It encourages strategic refinement rather than aggressive overexpansion.`,
    },
    annualPillarResonance: {
      annualPillar,
      titleEn: `Annual Pillar Dynamic (${annualPillar})`,
      windowEn: 'Late Summer through Autumn solar terms',
      guidanceEn: isBranchClash
        ? 'Dynamic tension with the current year suggests deliberate pacing. Finalize groundwork before signing definitive commitments.'
        : 'Harmonious seasonal momentum. Move forward with steady, transparent milestones.',
    },
    seasonActionWindow: {
      favorableSeason: 'Mid-Autumn to Early Winter',
      actionTiming: 'Best suited for decisive execution during the second half of lunar cycles.',
    },
  };
}
