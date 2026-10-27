import fs from 'fs';
import path from 'path';
import { getConfig, configManager } from '@/lib/config/configManager';

export interface ChapterRule {
  chapterIndex: number;
  titleZh: string;
  titleEn: string;
  badgeZh: string;
  badgeEn: string;
  focusZh: string;
  focusEn: string;
  sampleInsightZh: string;
  sampleInsightEn: string;
  sampleActionZh: string;
  sampleActionEn: string;
}

export interface SolarTermRule {
  term: string;
  nameEn: string;
  windowZh: string;
  windowEn: string;
  themeZh: string;
  themeEn: string;
  favorableZh: string[];
  favorableEn: string[];
  guardedZh: string[];
  guardedEn: string[];
}

export interface AstrologyRules {
  version: number;
  updatedAt: number;
  chapters: ChapterRule[];
  solarTerms: SolarTermRule[];
}

const DEFAULT_CHAPTER_RULES: ChapterRule[] = [
  {
    chapterIndex: 1,
    titleZh: '命局定性與原力本質',
    titleEn: 'Core Archetype & Cosmic Blueprint',
    badgeZh: '格局本質',
    badgeEn: 'Core Archetype',
    focusZh: '日元格局、五行旺衰與氣候調候用神',
    focusEn: 'Day Master balance, seasonal climate balance, and elemental affinity',
    sampleInsightZh: '日主秉賦天然原力，得月令真氣生扶，性格堅定沈毅，具破浪開拓之象。',
    sampleInsightEn: 'The Day Master carries profound elemental stamina, fortified by seasonal energy.',
    sampleActionZh: '順應天時五行生化，遇金水順勢蓄養，遇木火乘勢而起。',
    sampleActionEn: 'Align with cyclical element shifts; cultivate reserves during Metal-Water seasons.',
  },
  {
    chapterIndex: 2,
    titleZh: '事業官祿與職途破局',
    titleEn: 'Career Trajectory & Vocation',
    badgeZh: '破局之道',
    badgeEn: 'Strategic Vocation',
    focusZh: '十神職途配置、官煞化解之道與行事基調',
    focusEn: 'Ten Gods career structure, mitigating power clashes, and leadership style',
    sampleInsightZh: '命帶官印相生，宜在具架構性體系中掌舵，不宜陷入細瑣纏鬥。',
    sampleInsightEn: 'Endowed with structural leadership; flourish by navigating institutional clarity.',
    sampleActionZh: '專注核心戰略布局，遇人事阻滯以柔克剛，靜待氣機轉化。',
    sampleActionEn: 'Focus on macro-strategy over minor friction; deploy patience until seasonal shift.',
  },
  {
    chapterIndex: 3,
    titleZh: '財帛機制與資產防禦',
    titleEn: 'Wealth Generation & Capital Defense',
    badgeZh: '藏庫固本',
    badgeEn: 'Asset Fortification',
    focusZh: '正偏財流轉、財庫開合與現金流風險預防',
    focusEn: 'Direct vs Indirect Wealth channels, treasury vault opens, and cash flow risk controls',
    sampleInsightZh: '財源來自深耕體系與穩健積累，最忌盲目追高或投機冒進。',
    sampleInsightEn: 'Wealth generates through systematic compounding rather than reckless speculation.',
    sampleActionZh: '定期清算隱性負債，建立防禦性現金護城河，固守財庫根基。',
    sampleActionEn: 'Build defensive capital reserves and audit counterparty liabilities regularly.',
  },
  {
    chapterIndex: 4,
    titleZh: '婚戀姻緣與親密宮位',
    titleEn: 'Intimate Bonds & Relationship Dynamics',
    badgeZh: '同舟共濟',
    badgeEn: 'Harmonious Alliance',
    focusZh: '夫妻宮位生剋互動、情感信任與親密共鳴',
    focusEn: 'Spouse Palace interactions, emotional transparency, and partner alignment',
    sampleInsightZh: '夫妻宮靜謐而有情，雙方皆重實質擔當，唯需提防因工作忙碌缺乏深層交流。',
    sampleInsightEn: 'The Spouse Palace anchors mutual loyalty, yet requires active emotional cultivation.',
    sampleActionZh: '以坦誠化解隔閡，在重大決策前保持共鳴與尊重，切忌獨斷專行。',
    sampleActionEn: 'Prioritize genuine vulnerability and joint deliberation on major life decisions.',
  },
  {
    chapterIndex: 5,
    titleZh: '六親家庭與宿緣化解',
    titleEn: 'Ancestral Roots & Family Harmony',
    badgeZh: '寬容化育',
    badgeEn: 'Ancestral Healing',
    focusZh: '父母及子息宮位之宿命牽絆與世代邊界劃定',
    focusEn: 'Parental and children palace ties, ancestral boundaries, and generational healing',
    sampleInsightZh: '長輩寄託厚望，家庭關係深重，學會溫和而堅定地樹立個人邊界乃立命關鍵。',
    sampleInsightEn: 'Ancestral roots exert strong expectations; healthy personal boundaries are vital.',
    sampleActionZh: '盡孝道而不失自主，以包容心消解代際觀念差異。',
    sampleActionEn: 'Honor heritage while asserting emotional autonomy without defensiveness.',
  },
  {
    chapterIndex: 6,
    titleZh: '身心元氣與節氣養生',
    titleEn: 'Vitality, Health & Energy Rhythm',
    badgeZh: '養真固元',
    badgeEn: 'Holistic Vitality',
    focusZh: '五行氣機偏頗對應臟腑體質與身心壓力釋放',
    focusEn: 'Five elements physiological balance, stress dissipation, and solar term tuning',
    sampleInsightZh: '水木氣盛而火土微弱時，需著重氣血循環與消化系統調理，避免思慮過度。',
    sampleInsightEn: 'Guard digestion and emotional stress during damp-cold seasonal transitions.',
    sampleActionZh: '順應二十四節氣調息，起居有節，勞逸平衡以養真氣。',
    sampleActionEn: 'Synchronize daily rhythm with solar cycles; avoid chronic cognitive fatigue.',
  },
  {
    chapterIndex: 7,
    titleZh: '執念化解與認知重塑',
    titleEn: 'Psychological Blindspots & Metacognition',
    badgeZh: '破執頓悟',
    badgeEn: 'Cognitive Liberation',
    focusZh: '命格底層心理偏執、盲區警示與認知破局心法',
    focusEn: 'Core psychological blindspots, self-limiting biases, and paradigm reframing',
    sampleInsightZh: '凡事追求絕對掌控往往形成心靈枷鎖，適度臣服與接納無常方能看見新機。',
    sampleInsightEn: 'Over-indexing on control breeds paralysis; surrender to natural flow unlocks breakthrough.',
    sampleActionZh: '修煉「行到水窮處，坐看雲起時」之從容，化危機為轉向契機。',
    sampleActionEn: 'Embrace ambiguity with serenity; view disruptions as catalysts for evolution.',
  },
  {
    chapterIndex: 8,
    titleZh: '大運流轉與時機窗口',
    titleEn: 'Decennial Macro-Cycles & Turning Points',
    badgeZh: '順時應變',
    badgeEn: 'Macro Timing',
    focusZh: '當前十年大運之起伏階段、轉折節點與行動視窗',
    focusEn: 'Decennial major pillar trajectory, pivotal inflection nodes, and high-leverage windows',
    sampleInsightZh: '當前大運正值承先啟後之過渡期，宜沉潛蓄力，不可在黎明前夕輕言放棄。',
    sampleInsightEn: 'The current 10-year cycle marks a threshold transition; persist through foundation-building.',
    sampleActionZh: '把握 2026-2027 氣運交會之關鍵年，深耕核心實力，以待大成。',
    sampleActionEn: 'Leverage the 2026-2027 astrological pivot to consolidate competitive mastery.',
  },
  {
    chapterIndex: 9,
    titleZh: '籤命合參與終極行止',
    titleEn: 'Oracle-Natal Synthesis & Ultimate Guidance',
    badgeZh: '天人合一',
    badgeEn: 'Sacred Synthesis',
    focusZh: '所抽得媽祖靈籤與本命八字天時之共振印證',
    focusEn: 'Confluence of drawn Mazu oracle verse with natal chart dynamics',
    sampleInsightZh: '靈籤詩意與八字格局在此刻高度印證：凡事需敬慎存心，自有神明暗中扶持。',
    sampleInsightEn: 'The oracle quatrain confirms your natal chart: proceed with reverent integrity.',
    sampleActionZh: '銘記籤詩戒律，進退有度，順天應人，必得吉祥成就。',
    sampleActionEn: 'Heed the sacred verse guidance; maintain poise and alignment with cosmic timing.',
  },
];

const DEFAULT_SOLAR_TERMS: SolarTermRule[] = [
  {
    term: '立冬',
    nameEn: 'Start of Winter',
    windowZh: '陽曆 11月07日 — 11月21日',
    windowEn: 'Nov 07 — Nov 21',
    themeZh: '天地肅殺，水氣漸凝，萬物伏藏',
    themeEn: 'Atmosphere cools into crystallization; energy retreats inward',
    favorableZh: ['內省沉澱', '盤點財務', '溫補固元'],
    favorableEn: ['Strategic reflection', 'Asset audit', 'Restorative sleep'],
    guardedZh: ['大額投機', '情緒衝動', '耗損真氣'],
    guardedEn: ['Reckless speculation', 'Impulsive commitments', 'Chronic fatigue'],
  },
  {
    term: '小雪',
    nameEn: 'Minor Snow',
    windowZh: '陽曆 11月22日 — 12月06日',
    windowEn: 'Nov 22 — Dec 06',
    themeZh: '氣寒而將雪，地氣閉塞，守正安泰',
    themeEn: 'Thermal contraction deepens; consolidate core alliances',
    favorableZh: ['結盟協商', '鞏固舊業', '靜心冥想'],
    favorableEn: ['Consolidate alliances', 'Deepen fundamentals', 'Mindfulness'],
    guardedZh: ['孤注一擲', '對立訴訟', '過度擴張'],
    guardedEn: ['All-or-nothing wagers', 'Combative litigation', 'Premature expansion'],
  },
  {
    term: '大雪',
    nameEn: 'Major Snow',
    windowZh: '陽曆 12月07日 — 12月21日',
    windowEn: 'Dec 07 — Dec 21',
    themeZh: '陰極之盛，陽氣潛萌，蓄積潛力',
    themeEn: 'Peak Yin threshold; silent emergence of new Yang seed',
    favorableZh: ['沉潛備戰', '研析趨勢', '涵養元神'],
    favorableEn: ['Deep preparation', 'Market research', 'Vitality replenishment'],
    guardedZh: ['輕舉妄動', '盲目外求', '熬夜耗力'],
    guardedEn: ['Frenzied overactivity', 'Scattered focus', 'Burnout habits'],
  },
  {
    term: '冬至',
    nameEn: 'Winter Solstice',
    windowZh: '陽曆 12月22日 — 01月05日',
    windowEn: 'Dec 22 — Jan 05',
    themeZh: '一陽初生，乾坤交泰，歲序更新',
    themeEn: 'Rebirth of light; pivotal reset of cosmic cycle',
    favorableZh: ['許願立志', '規劃年度', '感恩祈福'],
    favorableEn: ['Vision crafting', 'Annual architecture', 'Sacred alignment'],
    guardedZh: ['破舊立新急躁', '殺伐決斷過苛', '心浮氣躁'],
    guardedEn: ['Rushed overhauls', 'Harsh confrontations', 'Impatience'],
  },
];

class AstrologyRulesService {
  private rules: AstrologyRules | null = null;
  private filePath = typeof process !== 'undefined' && typeof process.cwd === 'function' 
    ? path.join(process.cwd(), 'data', 'astrology_rules.json') 
    : '';

  public getRules(): AstrologyRules {
    if (this.rules) return this.rules;

    // Check file
    try {
      if (this.filePath && typeof fs !== 'undefined' && typeof fs.existsSync === 'function' && fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.rules = JSON.parse(raw);
        return this.rules!;
      }
    } catch (err) {
      console.warn('[AstrologyRules] Failed reading rules file, using defaults:', err);
    }

    this.rules = {
      version: 1,
      updatedAt: Date.now(),
      chapters: DEFAULT_CHAPTER_RULES,
      solarTerms: DEFAULT_SOLAR_TERMS,
    };
    return this.rules;
  }

  public updateRules(updates: Partial<AstrologyRules>): AstrologyRules {
    const current = this.getRules();
    const updated: AstrologyRules = {
      version: (current.version || 1) + 1,
      updatedAt: Date.now(),
      chapters: updates.chapters || current.chapters,
      solarTerms: updates.solarTerms || current.solarTerms,
    };

    this.rules = updated;

    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (err) {
      console.error('[AstrologyRules] Failed persisting rules file:', err);
    }

    return updated;
  }
}

export const astrologyRulesService = new AstrologyRulesService();
