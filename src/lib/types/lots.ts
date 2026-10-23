export interface BilingualText {
  zh: string;
  en: string;
}

export interface GanzhiInfo {
  zh: string;
  pinyin: string;
}

export interface HexagramInfo {
  name_zh: string;
  pinyin: string;
  upper_trigram: string;
  lower_trigram: string;
  symbol: string;
}

export interface ElementInfo {
  element?: string;
  favorable_season?: string;
  favorable_direction?: string;
  zh?: string;
  en?: string;
}

export interface VerseLine {
  line_number: number;
  zh: string;
  en: string;
}

export interface VerseInfo {
  classical_form: string;
  english_style: string;
  lines: VerseLine[];
}

export interface KeywordsInfo {
  favourable: {
    en: string[];
    zh: string[];
  };
  guarded: {
    en: string[];
    zh: string[];
  };
}

export interface ReadingNoteItem {
  term: string;
  pinyin: string;
  en: string;
  zh: string;
}

export interface StoryInfo {
  title: BilingualText;
  is_primary: boolean;
  is_variant: boolean;
  cross_reference_lot: string | null;
  narrative: BilingualText;
  poem_connection: BilingualText;
}

export interface GuidanceItem {
  en: string;
  zh: string;
  compliance_tag: string | null;
}

export interface CanonicalLot {
  id: string;
  lot_number: number;
  ganzhi: GanzhiInfo;
  title: BilingualText;
  hexagram: HexagramInfo;
  element_and_direction: ElementInfo;
  story_group_summary: string;
  register: string;
  criteria: {
    public_summary?: BilingualText;
    internal?: {
      raw_temple_text?: Record<string, string>;
      visibility?: string;
    };
    [key: string]: unknown;
  };
  provenance: string;
  verse: VerseInfo;
  keywords: KeywordsInfo;
  reading_notes: ReadingNoteItem[];
  plain_meaning: BilingualText;
  guidance: Record<string, GuidanceItem>;
  stories: StoryInfo[];
}

export type CanonicalDomainKey =
  | 'general'
  | 'relationships'
  | 'career'
  | 'money'
  | 'health'
  | 'family_home'
  | 'travel_moving'
  | 'sea_and_voyage'
  | 'the_absent_one'
  | 'legal'
  | 'conception'
  | 'timing'
  | 'livelihood_and_seasons';

export type DomainCategory =
  | CanonicalDomainKey
  // Legacy aliases
  | 'wealth'
  | 'family'
  | 'travel'
  | 'business'
  | 'sea_voyage';

export interface DomainMetadata {
  key: DomainCategory;
  titleEn: string;
  titleZh: string;
  traditionalMainZh?: string;
  icon: string;
  description: string;
  requiresDisclaimer: boolean;
  disclaimerType?: 'medical' | 'financial' | 'legal' | 'conception' | 'timing';
  tier?: 1 | 2;
}

