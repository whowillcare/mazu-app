import { DomainCategory, CanonicalDomainKey } from '../types/lots';
import { DOMAINS, normalizeDomainKey } from '../lots/domains';

export interface QuestionAnalysisResult {
  originalQuestion: string;
  detectedDomains: DomainCategory[];
  primaryDomain: DomainCategory;
  isMultiDomain: boolean;
  multiDomainWarningEn: string | null;
  multiDomainWarningZh: string | null;
  isFatalistic: boolean;
  reframedQuestionEn: string;
  reframedQuestionZh: string;
  suggestedQuestions: Array<{
    domain: DomainCategory;
    domainTitleEn: string;
    domainTitleZh: string;
    questionEn: string;
    questionZh: string;
  }>;
  confidence: number;
  provider: 'llm' | 'deterministic_fallback';
}

const DOMAIN_KEYWORD_MAP: Record<CanonicalDomainKey, { en: string[]; zh: string[] }> = {
  general: {
    en: ['overall', 'life', 'general', 'future', 'path', 'destiny', 'guidance', 'everything', 'prospect'],
    zh: ['综合', '運勢', '凡事', '全面', '未來', '指引', '近況', '前程', '大局', '人生'],
  },
  relationships: {
    en: ['love', 'marry', 'married', 'marriage', 'partner', 'boyfriend', 'girlfriend', 'divorce', 'breakup', 'dating', 'date', 'crush', 'wedding', 'relationship', 'spouse', 'husband', 'wife'],
    zh: ['婚姻', '感情', '愛情', '結婚', '婚事', '復合', '分手', '對象', '戀愛', '伴侶', '桃花', '男友', '女友', '老婆', '老公', '離婚', '相親', '訂婚', '另一半'],
  },
  career: {
    en: ['job', 'career', 'promotion', 'promoted', 'boss', 'interview', 'work', 'working', 'resign', 'fired', 'director', 'manager', 'offer', 'vocation', 'profession', 'colleague', 'exam', 'study'],
    zh: ['事業', '工作', '升職', '晉升', '轉職', '跳槽', '離職', '辭職', '面試', '考公', '考研', '考試', '學業', '功名', '錄取', '求職', '職位', '上級', '主管'],
  },
  money: {
    en: ['money', 'wealth', 'wealthy', 'invest', 'investment', 'stock', 'crypto', 'debt', 'salary', 'income', 'property', 'profit', 'financial', 'finance', 'business', 'commerce', 'trade'],
    zh: ['求財', '金錢', '財運', '投資', '股票', '生意', '買賣', '理財', '發財', '收入', '賺錢', '虧損', '債務', '貸款', '薪資', '薪水', '經商', '合夥', '分紅', '客戶'],
  },
  health: {
    en: ['health', 'healthy', 'sick', 'illness', 'doctor', 'hospital', 'surgery', 'operation', 'disease', 'recovery', 'cure', 'medical', 'pain', 'symptom', 'sleep', 'mental'],
    zh: ['健康', '身體', '生病', '治病', '醫院', '醫生', '開刀', '手術', '疾病', '康復', '就醫', '吃藥', '失眠', '體檢', '病痛', '精神', '情緒'],
  },
  family_home: {
    en: ['family', 'mother', 'father', 'mom', 'dad', 'parents', 'children', 'child', 'household', 'house', 'home', 'relatives', 'property'],
    zh: ['家宅', '家庭', '家運', '家事', '房子', '房產', '裝修', '父母', '父親', '母親', '孩子', '長輩', '家人', '築室', '親戚', '手足'],
  },
  travel_moving: {
    en: ['travel', 'traveling', 'trip', 'flight', 'visa', 'abroad', 'overseas', 'move', 'moving', 'relocate', 'relocating', 'emigrate', 'journey'],
    zh: ['出行', '搬家', '搬遷', '出差', '旅遊', '旅行', '移居', '遷居', '落戶', '外地', '出外', '回鄉', '移民', '出國'],
  },
  sea_and_voyage: {
    en: ['sea', 'ocean', 'ship', 'shipping', 'sail', 'sailing', 'vessel', 'cargo', 'voyage', 'maritime', 'harbor', 'port', 'crossborder'],
    zh: ['出海', '航運', '船', '海運', '外貿', '跨境', '港口', '遠洋', '討海', '行舟', '赴海'],
  },
  the_absent_one: {
    en: ['lost', 'missing', 'lost item', 'find someone', 'news', 'contact', 'reconnect', 'disappeared', 'belongings'],
    zh: ['失物', '丟失', '遺失', '找不到', '尋人', '音信', '聯繫不上', '遠信', '下落', '失聯', '杳無', '來人'],
  },
  legal: {
    en: ['sue', 'suing', 'sued', 'court', 'lawsuit', 'lawyer', 'attorney', 'legal', 'dispute', 'contract', 'trial', 'judge', 'arbitration'],
    zh: ['官司', '訴訟', '糾紛', '法律', '開庭', '仲裁', '打官司', '合同', '上訴', '官事', '律師', '判決'],
  },
  conception: {
    en: ['pregnant', 'pregnancy', 'baby', 'child', 'conceive', 'conception', 'fertility', 'ivf', 'birth', 'giving birth'],
    zh: ['求子', '求兒', '懷孕', '生育', '生孩', '備孕', '試管', '保胎', '六甲', '子嗣', '添丁'],
  },
  timing: {
    en: ['timing', 'when', 'which year', 'season', 'auspicious time', 'transit', 'cycle', 'this year'],
    zh: ['流年', '今年', '什麼時候', '時機', '運程', '歲君', '月令', '哪年', '本命年', '吉時'],
  },
  livelihood_and_seasons: {
    en: ['farming', 'agriculture', 'harvest', 'crop', 'livestock', 'fishery', 'breeding', 'seasonal work'],
    zh: ['耕作', '農作', '漁獲', '養殖', '種植', '畜牧', '收成', '魚苗', '求雨', '六畜', '作塭', '種地'],
  },
};


import { getConfig } from '@/lib/config/configManager';

export async function analyzeInquiry(
  question: string,
  userSelectedDomain?: DomainCategory
): Promise<QuestionAnalysisResult> {
  const q = (question || '').trim();

  // Try LLM parsing if an API key is available
  const apiKey =
    getConfig('AI_API_KEY') ||
    process.env.AI_API_KEY ||
    process.env.FREE_LLM_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.DEEPSEEK_API_KEY;

  if (apiKey && q.length > 3) {
    try {
      const llmResult = await queryLlmClassifier(q, apiKey, userSelectedDomain);
      if (llmResult) {
        return llmResult;
      }
    } catch (err) {
      console.warn('AI LLM classification failed, falling back to deterministic parser:', err);
    }
  }

  // Fallback to sophisticated deterministic parser
  return runDeterministicParser(q, userSelectedDomain);
}

function runDeterministicParser(
  question: string,
  userSelectedDomain?: DomainCategory
): QuestionAnalysisResult {
  const qLower = question.toLowerCase();
  const matchedScores: Record<CanonicalDomainKey, number> = {
    general: 0,
    relationships: 0,
    career: 0,
    money: 0,
    health: 0,
    family_home: 0,
    travel_moving: 0,
    sea_and_voyage: 0,
    the_absent_one: 0,
    legal: 0,
    conception: 0,
    timing: 0,
    livelihood_and_seasons: 0,
  };

  (Object.keys(DOMAIN_KEYWORD_MAP) as CanonicalDomainKey[]).forEach((domain) => {
    const { en, zh } = DOMAIN_KEYWORD_MAP[domain];
    en.forEach((kw) => {
      if (qLower.includes(kw)) matchedScores[domain] += 2;
    });
    zh.forEach((kw) => {
      if (question.includes(kw)) matchedScores[domain] += 3;
    });
  });

  // If user already had a selected domain, give it a baseline boost
  if (userSelectedDomain) {
    const norm = normalizeDomainKey(userSelectedDomain);
    matchedScores[norm] += 1;
  }


  // Sort domains by matched score
  const detected = (Object.keys(matchedScores) as CanonicalDomainKey[])
    .filter((d) => matchedScores[d] > 1)
    .sort((a, b) => matchedScores[b] - matchedScores[a]);

  const primaryDomain: DomainCategory = detected[0] || userSelectedDomain || 'career';
  const isMultiDomain = detected.length >= 2;

  // Fatalistic pattern detection
  const fatalisticIndicators = [
    'will i ',
    'is it going to',
    'am i going to',
    'can i get',
    'will he',
    'will she',
    '會不會',
    '能不能',
    '能否',
    '到底會不會',
    '是不是',
    '可不可能',
  ];
  const isFatalistic = fatalisticIndicators.some((pat) => qLower.includes(pat));

  // Multi-domain warning localized messages
  let multiDomainWarningEn: string | null = null;
  let multiDomainWarningZh: string | null = null;

  if (isMultiDomain) {
    const domainNamesEn = detected.map((d) => DOMAINS.find((m) => m.key === d)?.titleEn || d).join(' and ');
    const domainNamesZh = detected.map((d) => DOMAINS.find((m) => m.key === d)?.titleZh || d).join('與');

    multiDomainWarningEn = `Your question touches upon both ${domainNamesEn}. Traditional temple wisdom counsels "One lot answers one matter". We advise focusing on one inquiry first.`;
    multiDomainWarningZh = `您的叩問同時涉及「${domainNamesZh}」多個面向。媽祖靈籤講究「一籤斷一事」，建議您先聚焦單一面向以得明晰指引。`;
  }

  // Agency-centered reframing
  const reframedQuestionEn = isFatalistic
    ? `Regarding this matter: What discernment, discipline, and timing are mine to cultivate?`
    : question;

  const reframedQuestionZh = isFatalistic
    ? `面對此事，我應如何審慎安頓心緒、蓄積實力並妥善應對時機？`
    : question;

  // Generate suggested questions
  const suggestedQuestions = detected.slice(0, 3).map((d) => {
    const meta = DOMAINS.find((m) => m.key === d) || DOMAINS[0];
    return {
      domain: d,
      domainTitleEn: meta.titleEn,
      domainTitleZh: meta.titleZh,
      questionEn: `Regarding my ${meta.titleEn.toLowerCase()}: What is the most principled and grounded step I can take now?`,
      questionZh: `關於我的${meta.titleZh}：當前時節我應如何審慎行事並把握轉機？`,
    };
  });

  return {
    originalQuestion: question,
    detectedDomains: detected.length > 0 ? detected : [primaryDomain],
    primaryDomain,
    isMultiDomain,
    multiDomainWarningEn,
    multiDomainWarningZh,
    isFatalistic,
    reframedQuestionEn,
    reframedQuestionZh,
    suggestedQuestions:
      suggestedQuestions.length > 0
        ? suggestedQuestions
        : [
            {
              domain: primaryDomain,
              domainTitleEn: DOMAINS.find((m) => m.key === primaryDomain)?.titleEn || 'Career',
              domainTitleZh: DOMAINS.find((m) => m.key === primaryDomain)?.titleZh || '事業功名',
              questionEn: `What is the most principled and grounded course of action for this season?`,
              questionZh: `在此人生時節，我應如何自處與穩健行事？`,
            },
          ],
    confidence: detected.length > 0 ? 0.88 : 0.65,
    provider: 'deterministic_fallback',
  };
}

async function queryLlmClassifier(
  question: string,
  apiKey: string,
  userSelectedDomain?: DomainCategory
): Promise<QuestionAnalysisResult | null> {
  const baseUrl = (
    getConfig('AI_API_ENDPOINT') ||
    process.env.AI_API_ENDPOINT ||
    process.env.AI_BASE_URL ||
    'https://api.openai.com/v1'
  ).replace(/\/+$/, '');
  const model =
    getConfig('AI_MODEL_NAME') ||
    process.env.AI_MODEL_NAME ||
    process.env.AI_MODEL ||
    'deepseek-chat';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const prompt = `You are a wise Mazu temple divination scholar. Analyze the seeker's inquiry question.
Valid Domains: general, relationships, career, money, health, family_home, travel_moving, sea_and_voyage, the_absent_one, legal, conception, timing, livelihood_and_seasons.
User Question: "${question}"
User Selected Domain: "${userSelectedDomain || 'none'}"

Analyze:
1. Which domains from the 13 valid domains above are present?
2. Is it asking across MULTIPLE different domains at once (violating "One lot answers one matter / 一籤斷一事")?
3. Is it fatalistic/passive (e.g. "Will I pass", "Will she marry me", "会不会") vs agency-centered?
4. Provide a wise, agency-centered reframing in English and Traditional Chinese.
5. Provide 2 targeted questions if multiple domains are detected.

Output strictly valid JSON with no markdown fences:
{
  "detectedDomains": ["career"],
  "primaryDomain": "career",
  "isMultiDomain": false,
  "multiDomainReason": null,
  "isFatalistic": false,
  "reframedQuestionEn": "string",
  "reframedQuestionZh": "string",
  "suggestedQuestions": [
    {
      "domain": "career",
      "questionEn": "string",
      "questionZh": "string"
    }
  ]
}`;


    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const cleanJson = content.replace(/^```json\s*|```\s*$/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const detectedDomains: DomainCategory[] = (parsed.detectedDomains || []).filter((d: unknown) =>
      typeof d === 'string' && DOMAINS.some((m) => m.key === d)
    ) as DomainCategory[];

    const primaryDomain = (parsed.primaryDomain && DOMAINS.some((m) => m.key === parsed.primaryDomain))
      ? (parsed.primaryDomain as DomainCategory)
      : detectedDomains[0] || userSelectedDomain || 'career';

    const isMultiDomain = Boolean(parsed.isMultiDomain || detectedDomains.length > 1);

    const domainNamesEn = detectedDomains.map((d) => DOMAINS.find((m) => m.key === d)?.titleEn || d).join(' and ');
    const domainNamesZh = detectedDomains.map((d) => DOMAINS.find((m) => m.key === d)?.titleZh || d).join('與');

    return {
      originalQuestion: question,
      detectedDomains: detectedDomains.length > 0 ? detectedDomains : [primaryDomain],
      primaryDomain,
      isMultiDomain,
      multiDomainWarningEn: isMultiDomain
        ? `Your question touches upon both ${domainNamesEn}. Traditional temple wisdom counsels "One lot answers one matter". We advise focusing on one inquiry first.`
        : null,
      multiDomainWarningZh: isMultiDomain
        ? `您的叩問同時涉及「${domainNamesZh}」多個面向。媽祖靈籤講究「一籤斷一事」，建議您先聚焦單一面向以得明晰指引。`
        : null,
      isFatalistic: Boolean(parsed.isFatalistic),
      reframedQuestionEn: parsed.reframedQuestionEn || question,
      reframedQuestionZh: parsed.reframedQuestionZh || question,
      suggestedQuestions: (parsed.suggestedQuestions || []).map((s: { domain?: unknown; questionEn?: string; questionZh?: string }) => {
        const d = (s.domain as DomainCategory) || primaryDomain;
        const meta = DOMAINS.find((m) => m.key === d) || DOMAINS[0];
        return {
          domain: d,
          domainTitleEn: meta.titleEn,
          domainTitleZh: meta.titleZh,
          questionEn: s.questionEn || '',
          questionZh: s.questionZh || '',
        };
      }),
      confidence: 0.95,
      provider: 'llm',
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
