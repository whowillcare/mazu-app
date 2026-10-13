import { DomainCategory } from '../types/lots';
import { DOMAINS } from '../lots/domains';

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

const DOMAIN_KEYWORD_MAP: Record<DomainCategory, { en: string[]; zh: string[] }> = {
  career: {
    en: ['job', 'career', 'promotion', 'promoted', 'boss', 'interview', 'work', 'working', 'resign', 'resigned', 'resigning', 'fired', 'director', 'manager', 'offer', 'vocation', 'profession', 'colleague', 'employment'],
    zh: ['事業', '工作', '升職', '升遷', '轉職', '跳槽', '離職', '辭職', '面試', '考公', '功名', '考試', '考取', '職位', '上司', '主管', '求職', '換工作'],
  },
  wealth: {
    en: ['money', 'wealth', 'wealthy', 'invest', 'investing', 'investment', 'stock', 'crypto', 'debt', 'salary', 'income', 'property', 'real estate', 'profit', 'financial', 'finance', 'funds', 'cash'],
    zh: ['求財', '金錢', '財運', '投資', '股票', '買房', '買屋', '理財', '發財', '收入', '偏財', '正財', '債務', '薪資', '薪水', '賺錢', '資金'],
  },
  relationships: {
    en: ['love', 'marry', 'married', 'marriage', 'partner', 'boyfriend', 'girlfriend', 'divorce', 'divorced', 'breakup', 'dating', 'date', 'crush', 'wedding', 'relationship', 'spouse', 'husband', 'wife', 'lover'],
    zh: ['婚姻', '感情', '愛情', '結婚', '婚事', '復合', '分手', '對象', '戀愛', '伴侶', '桃花', '男友', '女友', '老婆', '老公', '離婚', '另一半', '交往', '談戀愛'],
  },
  health: {
    en: ['health', 'healthy', 'sick', 'illness', 'doctor', 'hospital', 'surgery', 'operation', 'disease', 'recovery', 'cure', 'medical', 'pain', 'symptom', 'recovering'],
    zh: ['健康', '生病', '治病', '醫院', '醫生', '開刀', '手術', '身體', '疾病', '康復', '求醫', '病情', '病痛', '痊癒'],
  },
  legal: {
    en: ['sue', 'suing', 'sued', 'court', 'lawsuit', 'lawyer', 'attorney', 'legal', 'dispute', 'contract', 'trial', 'judge', 'police', 'settlement', 'lawsuits'],
    zh: ['官司', '訴訟', '打官司', '法院', '合約', '合同', '律師', '糾紛', '爭訟', '勝訴', '和解', '判決', '告人', '被告'],
  },
  family: {
    en: ['family', 'mother', 'father', 'mom', 'dad', 'parents', 'children', 'child', 'household', 'sister', 'brother', 'in-law', 'ancestor', 'relatives'],
    zh: ['家運', '家庭', '父母', '父親', '母親', '孩子', '長輩', '家人', '門風', '婆媳', '手足', '兄弟', '姊妹'],
  },
  conception: {
    en: ['pregnant', 'pregnancy', 'baby', 'child', 'conceive', 'conceiving', 'conception', 'fertility', 'ivf', 'birth', 'giving birth'],
    zh: ['求兒', '求子', '懷孕', '備孕', '添丁', '試管', '保胎', '生小孩', '生兒', '懷胎', '求嗣'],
  },
  travel: {
    en: ['travel', 'traveling', 'trip', 'flight', 'visa', 'abroad', 'overseas', 'move', 'moving', 'relocate', 'relocating', 'emigrate', 'journey'],
    zh: ['遠行', '出外', '旅行', '移居', '搬家', '出國', '簽證', '移民', '行期', '尋人', '旅遊', '出差'],
  },
  business: {
    en: ['business', 'store', 'shop', 'startup', 'starting a business', 'client', 'deal', 'commerce', 'trade', 'enterprise', 'partnership', 'venture'],
    zh: ['經商', '做生意', '開店', '合夥', '創業', '買賣', '商業', '客戶', '貿易', '開店面', '生意'],
  },
  sea_voyage: {
    en: ['sea', 'ocean', 'ship', 'shipping', 'sail', 'sailing', 'vessel', 'cargo', 'voyage', 'maritime', 'harbor', 'port'],
    zh: ['出海', '航行', '舟楫', '航運', '海運', '水路', '漁業', '跑船', '出洋'],
  },
};

export async function analyzeInquiry(
  question: string,
  userSelectedDomain?: DomainCategory
): Promise<QuestionAnalysisResult> {
  const q = (question || '').trim();

  // Try LLM parsing if an API key is available
  const apiKey =
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
  const matchedScores: Record<DomainCategory, number> = {
    career: 0,
    wealth: 0,
    relationships: 0,
    health: 0,
    legal: 0,
    family: 0,
    conception: 0,
    travel: 0,
    business: 0,
    sea_voyage: 0,
  };

  (Object.keys(DOMAIN_KEYWORD_MAP) as DomainCategory[]).forEach((domain) => {
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
    matchedScores[userSelectedDomain] += 1;
  }

  // Sort domains by matched score
  const detected = (Object.keys(matchedScores) as DomainCategory[])
    .filter((d) => matchedScores[d] > 1)
    .sort((a, b) => matchedScores[b] - matchedScores[a]);

  const primaryDomain = detected[0] || userSelectedDomain || 'career';
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
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.AI_MODEL || 'gpt-4o-mini';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const prompt = `You are a wise Mazu temple divination scholar. Analyze the seeker's inquiry question.
Valid Domains: career, wealth, relationships, health, legal, family, conception, travel, business, sea_voyage.
User Question: "${question}"
User Selected Domain: "${userSelectedDomain || 'none'}"

Analyze:
1. Which domains from the list above are present?
2. Is it asking across MULTIPLE different domains at once?
3. Is it fatalistic/passive (e.g. "Will I pass", "Will she marry me") vs agency-centered?
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

    const detectedDomains: DomainCategory[] = (parsed.detectedDomains || []).filter((d: any) =>
      DOMAINS.some((m) => m.key === d)
    );

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
      suggestedQuestions: (parsed.suggestedQuestions || []).map((s: any) => {
        const d = (s.domain as DomainCategory) || primaryDomain;
        const meta = DOMAINS.find((m) => m.key === d) || DOMAINS[0];
        return {
          domain: d,
          domainTitleEn: meta.titleEn,
          domainTitleZh: meta.titleZh,
          questionEn: s.questionEn,
          questionZh: s.questionZh,
        };
      }),
      confidence: 0.95,
      provider: 'llm',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}
