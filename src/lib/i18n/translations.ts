export type SupportedLanguage = 'en' | 'zh-TW';

export interface TranslationDictionary {
  common: {
    brandName: string;
    brandSeal: string;
    cleanView: string;
    bilingualMode: string;
    preferences: string;
    english: string;
    traditionalChinese: string;
    close: string;
    back: string;
    continue: string;
    confirm: string;
    save: string;
  };
  porch: {
    subheading: string;
    heading: string;
    description: string;
    ctaDraw: string;
    ctaExplore: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
    feature3Title: string;
    feature3Desc: string;
    galleryHeading: string;
    gallerySubheading: string;
  };
  domainStep: {
    stepTag: string;
    heading: string;
    description: string;
    choosePrompt: string;
    proceedBtn: string;
  };
  questionStep: {
    stepTag: string;
    heading: string;
    description: string;
    currentDomain: string;
    changeDomain: string;
    questionLabel: string;
    placeholder: string;
    analyzeBtn: string;
    analyzing: string;
    aiInsightTitle: string;
    detectedDomainBadge: string;
    multiDomainWarningTitle: string;
    multiDomainWarningBody: string;
    focusSuggestion: string;
    fatalisticWarningTitle: string;
    applyReframingBtn: string;
    guidelinesTitle: string;
    guideline1: string;
    guideline2: string;
    guideline3: string;
    proceedBtn: string;
  };
  drawingStep: {
    title: string;
    description: string;
    cylinderText: string;
    incenseText: string;
  };
  readingStep: {
    lotNumberTag: string;
    hexagramLabel: string;
    archetypeLabel: string;
    elementLabel: string;
    favorableSeasonLabel: string;
    verseHeader: string;
    viewOriginalVerse: string;
    hideOriginalVerse: string;
    domainGuidanceHeader: string;
    favorableTag: string;
    guardedTag: string;
    historicalAllusionHeader: string;
    poemConnectionLabel: string;
    hermeneuticNotesLabel: string;
    drawAnotherBtn: string;
  };
  baziPaywall: {
    sectionTag: string;
    title: string;
    description: string;
    birthDateLabel: string;
    birthTimeLabel: string;
    locationLabel: string;
    crdWaiverText: string;
    unlockBtn: string;
    unlockingBtn: string;
  };
  heirloomReport: {
    reportHeader: string;
    titleCross: string;
    solarAdjustedLabel: string;
    fourPillarsTitle: string;
    yearPillar: string;
    monthPillar: string;
    dayMasterPillar: string;
    hourPillar: string;
    dayMasterResonance: string;
    monthInterplay: string;
    annualResonance: string;
    seasonalActionTiming: string;
    backToReadingBtn: string;
    drawNewLotBtn: string;
    tabOverview: string;
    tabLifeBook: string;
    tabSubscription: string;
    lifeBookBadge: string;
    lifeBookTitle: string;
    lifeBookSubtitle: string;
    subscriptionBadge: string;
    subscriptionTitle: string;
    subscriptionSubtitle: string;
    keyInsightLabel: string;
    actionAdviceLabel: string;
    annualTimelineTitle: string;
    solarTermTitle: string;
    lunarMonthTitle: string;
    palaceAlertTitle: string;
    favorablePracticesTitle: string;
    guardedPracticesTitle: string;
    activeSubscriptionLabel: string;
    renewalLabel: string;
    natalAnchorLabel: string;
    windowOfActionLabel: string;
  };
  preferencesModal: {
    title: string;
    languageLabel: string;
    displayModeLabel: string;
    cleanModeDesc: string;
    bilingualModeDesc: string;
    closeBtn: string;
  };
  countdown: {
    drawingInSeconds: string;
    drawNow: string;
    detectedInquiry: string;
    switchPrompt: string;
  };
  disclaimer: {
    badge: string;
    title: string;
    body: string;
  };
  rectification: {
    sectionTag: string;
    heading: string;
    subheading: string;
    exactTimeTab: string;
    roughTimeTab: string;
    selectSlotPrompt: string;
    slotMorning: string;
    slotAfternoon: string;
    slotNight: string;
    slotNotSure: string;
    startQuizBtn: string;
    quizHeading: string;
    quizSubheading: string;
    lockHourBtn: string;
    lockingHour: string;
    verifiedBadge: string;
    hookHeading: string;
    hookSubheading: string;
    unlockLifeBookBtn: string;
    subscribePredictiveBtn: string;
    predictiveBadge: string;
  };
  configManager: {
    modalTitle: string;
    modalSubtitle: string;
    tabAi: string;
    tabPayment: string;
    tabSystem: string;
    aiPresetLabel: string;
    aiEndpointLabel: string;
    aiEndpointPlaceholder: string;
    aiTokenLabel: string;
    aiTokenPlaceholder: string;
    aiModelLabel: string;
    aiModelPlaceholder: string;
    testConnectionBtn: string;
    testingConnection: string;
    connectionSuccess: string;
    connectionFailed: string;
    stripeSecretLabel: string;
    stripeWebhookLabel: string;
    paymentModeLabel: string;
    modeStripe: string;
    modeMock: string;
    defaultCurrencyLabel: string;
    enableAiQuestionGateLabel: string;
    liveReloadActive: string;
    saveAndHotReloadBtn: string;
    saving: string;
    savedSuccess: string;
    resetDefaultsBtn: string;
    resetConfirm: string;
    reloadAppBtn: string;
  };
}


export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    common: {
      brandName: 'MAZU SIXTY JIAZI · 靈籤',
      brandSeal: '媽',
      cleanView: '✦ Clean View',
      bilingualMode: '☯ Bilingual Mode',
      preferences: '⚙️ Preferences',
      english: 'English',
      traditionalChinese: '繁體中文',
      close: 'Close',
      back: 'Back',
      continue: 'Continue',
      confirm: 'Confirm',
      save: 'Save Changes',
    },
    porch: {
      subheading: 'CULTURAL ORACLE & INNER DISCERNMENT',
      heading: 'The Ancient Hexagram Oracle & Mazu Divination Sanctuary',
      description:
        'A contemplative sanctuary rooted in the sixty Jiazi cycles, authentic Qin seal stamps, and classical temple allusions. Seek counsel for your life seasons without deterministic fatalism.',
      ctaDraw: 'DRAW A LOT · 卜問靈籤',
      ctaExplore: 'Explore All 60 Cards · 六十籤品鑑',
      feature1Title: 'Non-Fatalistic Hermeneutics',
      feature1Desc:
        'Replaces superstitious fatalism with reflective mirror guidance and sovereign personal agency.',
      feature2Title: 'Authentic Qin Seal Script',
      feature2Desc:
        'Handcrafted 2×2 seal script stamps and verified historical literary allusions with zero hallucination.',
      feature3Title: 'Natal BaZi Synchronization',
      feature3Desc:
        'Harmonizes lot Heavenly Stems and Earthly Branches with your True Solar Time Four Pillars.',
      galleryHeading: 'GALLERY PREVIEW · 典藏籤卡圖鑑',
      gallerySubheading:
        'Experience the visual elegance of our sixty Jiazi oracle cards, featuring cinnabar stamps and gold leaf accents.',
    },
    domainStep: {
      stepTag: 'STEP 1 · CHOOSE AN INQUIRY DOMAIN',
      heading: 'Select the Core Matter of Your Inquiry',
      description:
        'Traditional temple divination counsels asking about one specific facet of life to preserve contemplative focus.',
      choosePrompt: 'Choose a life domain to direct your contemplation:',
      proceedBtn: 'Continue with Domain',
    },
    questionStep: {
      stepTag: 'STEP 2 · FRAME YOUR INQUIRY',
      heading: 'Formulate Your Contemplation Question',
      description:
        'Sincerity and clarity are the bridge between the seeker and ancient wisdom. State your dilemma with honesty.',
      currentDomain: 'Current Domain',
      changeDomain: 'Change Domain',
      questionLabel: 'Your Question or Contemplation',
      placeholder: 'e.g. How should I navigate the leadership transition in my career this autumn?',
      analyzeBtn: '✦ AI Intent Analysis',
      analyzing: 'Analyzing inquiry semantics...',
      aiInsightTitle: 'AI Intent & Domain Classification',
      detectedDomainBadge: 'Detected Domain',
      multiDomainWarningTitle: '⚠️ Multi-Domain Inquiry Detected',
      multiDomainWarningBody:
        'Your question mentions multiple life facets ({domains}). Temple wisdom holds that "One lot answers one matter". We recommend focusing on a single inquiry per draw.',
      focusSuggestion: 'Quick Select Focus:',
      fatalisticWarningTitle: '✦ Agency-Centered Reframing Suggestion:',
      applyReframingBtn: 'Apply Suggested Question',
      guidelinesTitle: 'Ethical Divination Principles',
      guideline1: 'One inquiry per draw to avoid split discernment and confusion.',
      guideline2: 'Ask "How can I prepare or act?" rather than passive "Will it happen?".',
      guideline3: 'Sincerity (心誠則靈) grounds intuition in calm self-reflection.',
      proceedBtn: 'Begin Sacred Draw · 搖籤',
    },
    drawingStep: {
      title: 'DIVINATION RITUAL IN PROGRESS',
      description: 'Quiet your breath, steady your heart, and hold your question in gentle focus.',
      cylinderText: '搖籤中 · SHAKING BAMBOO CYLINDER...',
      incenseText: 'Pure incense rises, aligning your intent with celestial rhythm.',
    },
    readingStep: {
      lotNumberTag: 'LOT',
      hexagramLabel: 'Hexagram',
      archetypeLabel: 'Historical Archetype',
      elementLabel: 'Five Elements',
      favorableSeasonLabel: 'Favorable Timing',
      verseHeader: 'POETIC VERSE (UNRHYMED CADENCE)',
      viewOriginalVerse: '📜 View Original 7-Char Classical Verse',
      hideOriginalVerse: 'Hide Classical Verse',
      domainGuidanceHeader: '✦ GUIDANCE FOR',
      favorableTag: '• FAVOURABLE (吉)',
      guardedTag: '• GUARDED (忌)',
      historicalAllusionHeader: '📜 HISTORICAL ALLUSION',
      poemConnectionLabel: 'Poem Connection',
      hermeneuticNotesLabel: 'Hermeneutic Nuances',
      drawAnotherBtn: 'Consult Another Matter · 另問他事',
    },
    baziPaywall: {
      sectionTag: '✦ CROSS-CALCULATE WITH YOUR PERSONAL NATAL CHART',
      title: 'What Does This Lot Say About YOUR Four Pillars?',
      description:
        'Every lot carries Heavenly Stem and Earthly Branch energies. Enter your birth details below to calculate True Solar Time adjustments and uncover Day Master resonance (十神), branch interactions (刑衝合害), and 2026 Annual Pillar timing.',
      birthDateLabel: 'Birth Date (Gregorian)',
      birthTimeLabel: 'Birth Time (Local Clock)',
      locationLabel: 'City / Longitude',
      crdWaiverText:
        'I expressly request immediate delivery of my personalized digital report and acknowledge that I waive my statutory 14-day right of withdrawal under EU Consumer Rights Directive (CRD Art. 16(m)).',
      unlockBtn: 'Unlock Personalized Deep Report · $2.99',
      unlockingBtn: 'Calculating Solar Natal Chart...',
    },
    heirloomReport: {
      reportHeader: 'PERSONALIZED HEIRLOOM REPORT · 解籤合參',
      titleCross: '× YOUR NATAL BA-ZI',
      solarAdjustedLabel: 'True Solar Adjusted Time',
      fourPillarsTitle: 'YOUR FOUR PILLARS (命盤四柱):',
      yearPillar: 'YEAR (年柱)',
      monthPillar: 'MONTH (月柱)',
      dayMasterPillar: 'DAY MASTER (日主)',
      hourPillar: 'HOUR (時柱)',
      dayMasterResonance: 'Day Master Affinity · Resonant Archetype',
      monthInterplay: 'Month & Career Pillar Interplay',
      annualResonance: 'Annual Pillar Dynamic',
      seasonalActionTiming: 'Seasonal Execution Timing Window',
      backToReadingBtn: '← Back to Lot Reading',
      drawNewLotBtn: 'Begin New Inquiry · 另起一問',
      tabOverview: '✦ Triad Synthesis',
      tabLifeBook: '📜 9-Section Life Book',
      tabSubscription: '🔮 Predictive Transits Hub (LEG 3)',
      lifeBookBadge: 'HEIRLOOM AUDIT · 9 SECTIONS',
      lifeBookTitle: 'The Complete 9-Section Life Book (九章全案命書)',
      lifeBookSubtitle: 'A comprehensive metaphysical audit synthesizing your True Solar BaZi chart, Ten Gods dynamics, Four Treasuries, and the sacred Mazu oracle.',
      subscriptionBadge: 'ANNUAL PREDICTIVE TRANSITS · LEG 3',
      subscriptionTitle: 'Predictive Transits & Event Alerts Hub (流年事件預測中樞)',
      subscriptionSubtitle: 'Continuous event-driven monitoring of active annual stems, 24 Solar Terms transitions, and lunar monthly palace interactions.',
      keyInsightLabel: '✦ Core Archetypal Insight',
      actionAdviceLabel: '⚖️ Strategic Action Guidance',
      annualTimelineTitle: 'Chronological Milestones & Trigger Windows (2026–2028)',
      solarTermTitle: 'Active 24 Solar Term Energy Transit',
      lunarMonthTitle: 'Lunar Monthly Palace Pulse & Contemplative Prompt',
      palaceAlertTitle: 'Proactive Palace Defense Protocols (刑衝合害預警)',
      favorablePracticesTitle: 'Favorable Timing & Practices',
      guardedPracticesTitle: 'Guarded Activities to Avoid',
      activeSubscriptionLabel: 'Active Membership Status',
      renewalLabel: 'Auto-Renewal Window',
      natalAnchorLabel: 'Natal Palace Anchor',
      windowOfActionLabel: 'Window of Sovereign Action',
    },
    preferencesModal: {
      title: 'SANCTUARY PREFERENCES · 偏好設定',
      languageLabel: 'Primary Interface Language',
      displayModeLabel: 'Display & Study Mode',
      cleanModeDesc:
        'Clean single-language presentation. Cultural anchors (Lot name, Ganzhi, Hexagram) maintain dual titles without clutter.',
      bilingualModeDesc:
        'Complete bilingual presentation with English translations and Classical Chinese verses displayed side-by-side.',
      closeBtn: 'Apply & Close',
    },
    countdown: {
      drawingInSeconds: 'Auto-drawing in {n}s... Not what you meant? Click below to change:',
      drawNow: 'Draw Now · 立即起籤',
      detectedInquiry: 'Detected Inquiry Focus',
      switchPrompt: 'Tap any domain to override before drawing:',
    },
    disclaimer: {
      badge: '✦ PHILOLOGICAL & HERMENEUTIC BOUNDARY',
      title: 'General Lot Interpretation Disclaimer',
      body: 'This interpretation offers general philosophical reflection grounded in classical Mazu temple literature, historical allusions, and poetic archetypes. It provides contemplative counsel rather than deterministic fortune-telling. For personal resonance and strategic timing, personalized birth chart analysis is required.',
    },
    rectification: {
      sectionTag: '✦ ADVANCED BAZI KERNEL · HOUR RECTIFICATION',
      heading: 'Personalized Chart Synthesis & Birth Hour Pinpointing',
      subheading: 'Connect this lot with your Four Pillars. If you do not remember your exact minute, our engine evaluates historical milestone convergence to pinpoint your birth hour.',
      exactTimeTab: 'I Know Exact Birth Time',
      roughTimeTab: "Rough Time / Don't Know",
      selectSlotPrompt: 'Select your approximate birth time of day:',
      slotMorning: '🌅 Morning (05:00 - 11:00)',
      slotAfternoon: '☀️ Afternoon (11:00 - 17:00)',
      slotNight: '🌙 Night (17:00 - 23:00)',
      slotNotSure: '❓ Not Sure (All 12 Hours)',
      startQuizBtn: 'Begin Milestone Verification Questionnaire ►',
      quizHeading: 'Verify Historical Milestone Events',
      quizSubheading: 'Select the options that match your real past life experiences to mathematically lock your birth hour:',
      lockHourBtn: 'Lock Verified Birth Hour · 考時定盤',
      lockingHour: 'Converging Milestone Matrices...',
      verifiedBadge: '✓ Birth Hour Converged & Verified',
      hookHeading: 'Structural Diagnostic Insight (Free Hook)',
      hookSubheading: 'A diagnostic summary derived directly from your chart structure and past milestone trajectory:',
      unlockLifeBookBtn: 'Unlock Full 9-Section Life Book ($2.99 Launch Trial)',
      subscribePredictiveBtn: 'Subscribe to Event-Triggered Annual Transits ($9.99/mo)',
      predictiveBadge: '✦ PROACTIVE PREDICTIVE TRIGGER',
    },
    configManager: {
      modalTitle: 'Configuration Manager',
      modalSubtitle: 'Manage runtime API tokens, inference endpoints, payment secrets, and live hot-reloading parameters.',
      tabAi: 'AI & Inference Gateway',
      tabPayment: 'Payments & E-Commerce',
      tabSystem: 'System & Preferences',
      aiPresetLabel: 'Quick Gateway Presets:',
      aiEndpointLabel: 'AI Inference Endpoint URL',
      aiEndpointPlaceholder: 'e.g. http://localhost:3001/v1 or https://api.openai.com/v1',
      aiTokenLabel: 'AI API Token / Secret Key',
      aiTokenPlaceholder: 'Enter API Token or Secret Key',
      aiModelLabel: 'Model Identifier',
      aiModelPlaceholder: 'e.g. auto, deepseek-chat, gpt-4o-mini',
      testConnectionBtn: 'Test AI Connection',
      testingConnection: 'Pinging AI Gateway...',
      connectionSuccess: 'Connection Verified',
      connectionFailed: 'Connection Error',
      stripeSecretLabel: 'Stripe Secret Key (sk_live_... / sk_test_...)',
      stripeWebhookLabel: 'Stripe Webhook Signing Secret (whsec_...)',
      paymentModeLabel: 'Payment Operation Mode',
      modeStripe: 'Live Stripe Gateway',
      modeMock: 'Development Simulator (Mock Testing)',
      defaultCurrencyLabel: 'Default Transaction Currency',
      enableAiQuestionGateLabel: 'Enable AI Semantic Question Classifier Gate',
      liveReloadActive: 'Live Hot-Reload Active',
      saveAndHotReloadBtn: 'Save & Hot-Reload',
      saving: 'Saving & Broadcasting...',
      savedSuccess: 'Configuration saved and hot-reloaded successfully!',
      resetDefaultsBtn: 'Reset to .env Defaults',
      resetConfirm: 'Are you sure you want to reset all configurations to environment defaults?',
      reloadAppBtn: 'Reload App Page',
    },
  },


  'zh-TW': {
    common: {
      brandName: '媽祖六十甲子靈籤 · 智慧叩問聖殿',
      brandSeal: '媽',
      cleanView: '✦ 純淨視圖',
      bilingualMode: '☯ 雙語對照模式',
      preferences: '⚙️ 偏好設定',
      english: 'English',
      traditionalChinese: '繁體中文',
      close: '關閉',
      back: '返回',
      continue: '繼續',
      confirm: '確認',
      save: '儲存設定',
    },
    porch: {
      subheading: '非宿命論 · 敬慎存心 · 文化智慧',
      heading: '媽祖六十甲子靈籤 · 沉浸式心靈指引',
      description:
        '根植於六十甲子干支循環、秦代小篆與正統典故的沉浸式叩問聖殿。不妄言吉凶禍福，以詩入道，照見內心，啟迪行事抉擇。',
      ctaDraw: '誠心叩問 · 卜問靈籤',
      ctaExplore: '品鑑六十靈籤圖錄 · 典藏卡冊',
      feature1Title: '非宿命論哲思解籤',
      feature1Desc: '摒棄迷信恐懼，以籤詩為行事鏡照，引導主動抉擇與道德自律。',
      feature2Title: '純正秦篆方印與正史典故',
      feature2Desc: '全套六十張籤卡均配備嚴謹考據之2×2秦代小篆印鑑，剔除AI亂碼與訛誤。',
      feature3Title: '個人八字命盤真太陽時合參',
      feature3Desc: '結合出生地經度校準真太陽時，精算籤詩天干地支與個人日主之生剋感應。',
      galleryHeading: '典藏籤卡圖鑑 · 雅緻古風',
      gallerySubheading: '結合黑曜玄金、朱砂古印與宋瓷雅緻，呈現典雅傳世之六十甲子靈籤圖錄。',
    },
    domainStep: {
      stepTag: '第一步 · 選擇叩問範疇',
      heading: '請選擇您所求事項之核心面向',
      description: '媽祖聖籤講究「一事一問、心誠則靈」。請選擇您當下最需指引之核心範疇。',
      choosePrompt: '請點選欲叩問的生活面向：',
      proceedBtn: '確認此範疇 · 進入叩問',
    },
    questionStep: {
      stepTag: '第二步 · 凝思叩問心念',
      heading: '釐清您的困惑與心念問句',
      description: '誠敬為感應之本。請在心中沉澱思緒，清晰寫下您目前面臨的抉擇或行事考量。',
      currentDomain: '當前叩問範疇',
      changeDomain: '更換範疇',
      questionLabel: '您的叩問心念或行事困惑',
      placeholder: '例如：今年秋季面臨升遷與轉職機會，我應如何審慎決策與安頓身心？',
      analyzeBtn: '✦ AI 智慧意圖解析',
      analyzing: '正在解析問句語意與範疇...',
      aiInsightTitle: 'AI 語意解析與範疇預測',
      detectedDomainBadge: '預測契合範疇',
      multiDomainWarningTitle: '⚠️ 偵測到跨範疇提問',
      multiDomainWarningBody:
        '您的問句中同時涉及了多個面向（{domains}）。媽祖靈籤講究「一籤斷一事」，建議您先聚焦單一核心面向，或分次獨立求籤。',
      focusSuggestion: '建議聚焦方向：',
      fatalisticWarningTitle: '✦ 主動行事之建議反思問句：',
      applyReframingBtn: '採用此建議問句',
      guidelinesTitle: '求籤心法與原則',
      guideline1: '一事一問：避免將事業與感情混雜，以免心念散漫。',
      guideline2: '正向行事：與其問「會不會成」，不如問「我應如何自處與努力？」。',
      guideline3: '心誠則靈：平靜呼吸，虔誠祝禱，方能照見籤詩真實意涵。',
      proceedBtn: '凝心入靜 · 虔誠搖籤',
    },
    drawingStep: {
      title: '聖籤卜問儀軌進行中',
      description: '平息雜念，凝思所問，靜心感受竹筒震顫與神意感應。',
      cylinderText: '心誠意篤 · 籤筒搖動中...',
      incenseText: '清香一炷，上達天聽，天地靈動，感應道交。',
    },
    readingStep: {
      lotNumberTag: '第',
      hexagramLabel: '卦象',
      archetypeLabel: '歷史典故',
      elementLabel: '五行局',
      favorableSeasonLabel: '吉利時節',
      verseHeader: '籤詩七言絕句',
      viewOriginalVerse: '📜 展開古典七言原詩',
      hideOriginalVerse: '收起古典原詩',
      domainGuidanceHeader: '✦ 叩問指引：',
      favorableTag: '• 吉意吉祥 (吉)',
      guardedTag: '• 戒慎警惕 (忌)',
      historicalAllusionHeader: '📜 典故背景與事跡',
      poemConnectionLabel: '籤詩映照',
      hermeneuticNotesLabel: '籤詩語義探賾',
      drawAnotherBtn: '重整心念 · 另求靈籤',
    },
    baziPaywall: {
      sectionTag: '✦ 命盤八字合參 · 真太陽時深入解讀',
      title: '本籤干支如何與您的生辰八字深度感應？',
      description:
        '每首靈籤干支均蘊含天干地支五行氣機。輸入您的生辰資訊，系統將校準真太陽時，解析籤詩干支與您日主之十神意象、地支刑衝合害與2026歲君流年應期。',
      birthDateLabel: '出生公曆日期',
      birthTimeLabel: '出生時辰 (當地鐘錶時間)',
      locationLabel: '出生城市 / 經度',
      crdWaiverText:
        '我明確要求立即交付個人客製化數位報告，並知悉依歐盟消費者權益指令（CRD Art. 16(m)）放棄法定14天猶豫期解約權。',
      unlockBtn: '解鎖八字合參深度報告 · $2.99',
      unlockingBtn: '正在精算真太陽時命盤...',
    },
    heirloomReport: {
      reportHeader: '八字命盤與靈籤合參 · 典藏深研報告',
      titleCross: '× 個人命盤合參',
      solarAdjustedLabel: '真太陽時校準',
      fourPillarsTitle: '您的個人四柱命盤：',
      yearPillar: '年柱',
      monthPillar: '月柱',
      dayMasterPillar: '日主 (日柱)',
      hourPillar: '時柱',
      dayMasterResonance: '日主共振 · 十神意象深度解析',
      monthInterplay: '月令提綱 · 事業與行事調候',
      annualResonance: '歲君流年感應應期',
      seasonalActionTiming: '吉利應期與行動視窗',
      backToReadingBtn: '← 返回靈籤解讀',
      drawNewLotBtn: '重整心念 · 另求靈籤',
      tabOverview: '✦ 三柱合參總覽',
      tabLifeBook: '📜 九章全案命書',
      tabSubscription: '🔮 流年預測訂閱中樞（LEG 3）',
      lifeBookBadge: '九大章節 · 終生典藏長篇命書',
      lifeBookTitle: '九章全案深度命書（Life Book）',
      lifeBookSubtitle: '融匯真太陽時四柱排盤、十神心性格局、四大庫支、夫妻宮交感與媽祖靈籤玄機之深度人生全案。',
      subscriptionBadge: '事件驅動型流年預測 · LEG 3 旗艦訂閱',
      subscriptionTitle: '流年預測訂閱中樞與事件預警系統',
      subscriptionSubtitle: '全時主動監控歲君引動、二十四節氣交運、流月宮位震盪與刑衝破害之高階預測體系。',
      keyInsightLabel: '✦ 核心心性啟迪',
      actionAdviceLabel: '⚖️ 戰略行動指引',
      annualTimelineTitle: '歲運引動與應期時間軸（2026–2028）',
      solarTermTitle: '二十四節氣交運矩陣與調候能量',
      lunarMonthTitle: '流月宮位震盪與本月修持叩問',
      palaceAlertTitle: '歲運宮位預警與防禦協議（刑衝合害）',
      favorablePracticesTitle: '宜行事象 · 能量順應之道',
      guardedPracticesTitle: '戒慎規避 · 避凶防漏指南',
      activeSubscriptionLabel: '當前訂閱會員狀態',
      renewalLabel: '次期週期結算日',
      natalAnchorLabel: '全時命盤宮位錨定',
      windowOfActionLabel: '天時行動發力視窗',
    },
    preferencesModal: {
      title: '聖殿偏好設定',
      languageLabel: '介面主語言',
      displayModeLabel: '瀏覽與研讀模式',
      cleanModeDesc: '純淨單一語言呈現。籤卡名稱、干支、卦象等文化錨定詞保留典雅對照。',
      bilingualModeDesc: '中英完整雙語並列研讀模式，適合深入對照籤詩古典原文與現代英譯。',
      closeBtn: '完成並關閉',
    },
    countdown: {
      drawingInSeconds: '即將於 {n} 秒後自動起籤…若意向不符，可點擊下方直接切換：',
      drawNow: '立即起籤 · Draw Now',
      detectedInquiry: 'AI 意圖解析問事焦點',
      switchPrompt: '點擊任一事類即可快速變更：',
    },
    disclaimer: {
      badge: '✦ 經典詮釋與哲學邊界',
      title: '通用解籤哲理免責聲明',
      body: '本靈籤解曰為基於古典文獻、籤詩故事與易象象徵之通用哲理指引，旨在提供行事省思與心靈啟迪，非宿命定數預測。具體吉凶應期、宮位感應與決策時機，須結合個人生辰八字與流年氣機深入合參。',
    },
    rectification: {
      sectionTag: '✦ 米圖八字排盤核心 · 考時定盤',
      heading: '個人八字命盤合參與真實時辰逆推',
      subheading: '將本靈籤與您的四柱深度鏈接。若您不記得精確出生分鐘，米圖內核可藉由回溯您過往人生重大事件年份，逆推鎖定真實時辰。',
      exactTimeTab: '我記得精確出生時刻',
      roughTimeTab: '我只知粗略時段 / 不確定',
      selectSlotPrompt: '請粗略選擇出生時段：',
      slotMorning: '🌅 早晨（05:00 - 11:00 · 卯辰巳時）',
      slotAfternoon: '☀️ 午間（11:00 - 17:00 · 午未申時）',
      slotNight: '🌙 晚間（17:00 - 23:00 · 酉戌亥時）',
      slotNotSure: '❓ 不清楚（全部 12 時辰考盤）',
      startQuizBtn: '進入歷史驗證問卷 ►',
      quizHeading: '驗證個人歷史里程碑年份',
      quizSubheading: '請勾選符合您過往真實人生經歷的選項，以進行數學收斂定盤：',
      lockHourBtn: '確認並鎖定出生時辰 · 考時定盤',
      lockingHour: '正在收斂里程碑矩陣...',
      verifiedBadge: '✓ 考時定盤完成 · 真實時柱已鎖定',
      hookHeading: '命局結構深度診斷（免費試讀）',
      hookSubheading: '由米圖八字內核直接由命局結構與歷史應期軌跡提煉之深度診斷：',
      unlockLifeBookBtn: '解鎖全案 9 大章節長篇命書（$2.99 體驗價）',
      subscribePredictiveBtn: '訂閱事件驅動型流年預測報告（$9.99/月）',
      predictiveBadge: '✦ 主動事件驅動型預測',
    },
    configManager: {
      modalTitle: '系統運行配置管理中心',
      modalSubtitle: '管理動態運行環境參數、AI 推理網關端點、密鑰 Token、支付配置與熱更新機制。',
      tabAi: 'AI 推理網關與密鑰',
      tabPayment: '支付商務配置 (Stripe)',
      tabSystem: '全局系統與參數偏好',
      aiPresetLabel: '常用網關預設快捷切換：',
      aiEndpointLabel: 'AI 推理網關端點 URL',
      aiEndpointPlaceholder: '例：http://localhost:3001/v1 或 https://api.openai.com/v1',
      aiTokenLabel: 'AI 訪問 Token / 密鑰 (API Key)',
      aiTokenPlaceholder: '請輸入 API Token 或密鑰',
      aiModelLabel: '模型標識符 (Model ID)',
      aiModelPlaceholder: '例：auto, deepseek-chat, gpt-4o-mini',
      testConnectionBtn: '測試 AI 網關連通性',
      testingConnection: '正在測試連線中...',
      connectionSuccess: '連線驗證成功',
      connectionFailed: '連線失敗',
      stripeSecretLabel: 'Stripe Secret Key (sk_live_... / sk_test_...)',
      stripeWebhookLabel: 'Stripe Webhook 簽名密鑰 (whsec_...)',
      paymentModeLabel: '支付運行模式',
      modeStripe: '正式 Stripe 支付網關',
      modeMock: '開發模擬器模式 (免密鑰測試)',
      defaultCurrencyLabel: '系統默認結算幣種',
      enableAiQuestionGateLabel: '啟用 AI 意向語意解析與提問重構閘門',
      liveReloadActive: '即時熱更新監聽中',
      saveAndHotReloadBtn: '立即保存並熱更新',
      saving: '正在保存並廣播...',
      savedSuccess: '配置已成功保存並即時熱更新至服務端與客戶端！',
      resetDefaultsBtn: '重置為 .env 默認值',
      resetConfirm: '確定要將所有配置重置為系統環境變量默認值嗎？',
      reloadAppBtn: '刷新應用狀態',
    },
  },

};
