import { DomainMetadata, CanonicalDomainKey } from '../types/lots';

export const DOMAINS: DomainMetadata[] = [
  {
    key: 'general',
    titleEn: 'General & Overall',
    titleZh: '综合运势 · 凡事',
    traditionalMainZh: '凡事',
    icon: '🔮',
    description: 'Overall fortunes, life transitions, and holistic guidance.',
    requiresDisclaimer: false,
    tier: 1,
  },
  {
    key: 'relationships',
    titleEn: 'Love & Partnership',
    titleZh: '感情婚姻 · 姻緣',
    traditionalMainZh: '婚姻',
    icon: '🕊️',
    description: 'Partnership harmony, emotional accord, courtship, and reconciliation.',
    requiresDisclaimer: false,
    tier: 1,
  },
  {
    key: 'career',
    titleEn: 'Career & Study',
    titleZh: '事业学业 · 功名',
    traditionalMainZh: '功名',
    icon: '💼',
    description: 'Vocation, promotions, examinations, academic study, and leadership.',
    requiresDisclaimer: false,
    tier: 1,
  },
  {
    key: 'money',
    titleEn: 'Money & Business',
    titleZh: '财运生意 · 求財',
    traditionalMainZh: '求財',
    icon: '💰',
    description: 'Financial prudence, commerce, trade, investments, and cashflow.',
    requiresDisclaimer: true,
    disclaimerType: 'financial',
    tier: 1,
  },
  {
    key: 'health',
    titleEn: 'Health & Vitality',
    titleZh: '健康身心 · 治病',
    traditionalMainZh: '治病',
    icon: '🌿',
    description: 'Physical vitality, mental serenity, recovery, and medical patience.',
    requiresDisclaimer: true,
    disclaimerType: 'medical',
    tier: 1,
  },
  {
    key: 'family_home',
    titleEn: 'Home & Family',
    titleZh: '家庭家宅 · 家運',
    traditionalMainZh: '家運',
    icon: '🏡',
    description: 'Domestic tranquility, family relationships, residence, and ancestral roots.',
    requiresDisclaimer: false,
    tier: 1,
  },
  {
    key: 'travel_moving',
    titleEn: 'Travel & Moving',
    titleZh: '出行搬迁 · 出外',
    traditionalMainZh: '出外',
    icon: '🧭',
    description: 'Journeys, trips, moving residence, emigration, and foreign endeavors.',
    requiresDisclaimer: false,
    tier: 2,
  },
  {
    key: 'sea_and_voyage',
    titleEn: 'Sea & Voyage',
    titleZh: '出海舟行 · 討海',
    traditionalMainZh: '討海',
    icon: '🌊',
    description: 'Maritime voyages, overseas commerce, seafaring, and Mazu divine shelter.',
    requiresDisclaimer: false,
    tier: 2,
  },
  {
    key: 'the_absent_one',
    titleEn: 'Lost Items & News',
    titleZh: '寻人失物 · 音信',
    traditionalMainZh: '失物',
    icon: '🔍',
    description: 'Missing property, searching for persons, expected visitors, and letters from afar.',
    requiresDisclaimer: false,
    tier: 2,
  },
  {
    key: 'legal',
    titleEn: 'Legal & Disputes',
    titleZh: '官事纠纷 · 官事',
    traditionalMainZh: '官事',
    icon: '⚖️',
    description: 'Integrity in disputes, mediation, lawsuits, and arbitration.',
    requiresDisclaimer: true,
    disclaimerType: 'legal',
    tier: 2,
  },
  {
    key: 'conception',
    titleEn: 'Fertility & Children',
    titleZh: '求子添丁 · 六甲',
    traditionalMainZh: '求兒',
    icon: '👶',
    description: 'Conception, pregnancy encouragement, and children.',
    requiresDisclaimer: true,
    disclaimerType: 'conception',
    tier: 2,
  },
  {
    key: 'timing',
    titleEn: 'This Year\'s Timing',
    titleZh: '时机流年 · 歲君',
    traditionalMainZh: '歲君',
    icon: '⏳',
    description: 'Annual transits, seasonal cycles, monthly orders, and opportune windows.',
    requiresDisclaimer: true,
    disclaimerType: 'timing',
    tier: 2,
  },
  {
    key: 'livelihood_and_seasons',
    titleEn: 'Livelihood & Agriculture',
    titleZh: '农渔生计 · 耕作',
    traditionalMainZh: '耕作',
    icon: '🌾',
    description: 'Farming, aquaculture, livestock, harvests, and seasonal crafts.',
    requiresDisclaimer: false,
    tier: 2,
  },
];

// Helper to resolve canonical domain key from legacy keys
export function normalizeDomainKey(key: string): CanonicalDomainKey {
  switch (key) {
    case 'wealth':
    case 'business':
      return 'money';
    case 'family':
      return 'family_home';
    case 'travel':
      return 'travel_moving';
    case 'sea_voyage':
      return 'sea_and_voyage';
    case 'general':
    case 'relationships':
    case 'career':
    case 'money':
    case 'health':
    case 'family_home':
    case 'travel_moving':
    case 'sea_and_voyage':
    case 'the_absent_one':
    case 'legal':
    case 'conception':
    case 'timing':
    case 'livelihood_and_seasons':
      return key as CanonicalDomainKey;
    default:
      return 'general';
  }
}

export function getDomainByKey(key: string): DomainMetadata {
  const normalized = normalizeDomainKey(key);
  return DOMAINS.find((d) => d.key === normalized) || DOMAINS[0];
}
