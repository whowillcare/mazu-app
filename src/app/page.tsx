'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DOMAINS } from '@/lib/lots/domains';
import { CanonicalLot, DomainCategory } from '@/lib/types/lots';
import { FourPillars, LotBaziInteraction } from '@/lib/bazi/baziEngine';
import { translations, SupportedLanguage } from '@/lib/i18n/translations';
import { QuestionAnalysisResult } from '@/lib/ai/questionParser';
import { SvgLotCard } from '@/components/cards/SvgLotCard';
import { RectificationQuestion, RectificationResult } from '@/lib/bazi/hourRectification';
import { MAJOR_CITIES, MajorCity, formatLongitude } from '@/lib/geo/cities';
import { CityLocationPicker } from '@/components/geo/CityLocationPicker';

type JourneyStep = 'porch' | 'domain' | 'question' | 'drawing' | 'reading' | 'report';

export default function MazuLotApp() {
  // Navigation & Step State
  const [currentStep, setCurrentStep] = useState<JourneyStep>('porch');

  // Preferences State
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mazu_lang') as SupportedLanguage;
      if (saved === 'en' || saved === 'zh-TW') return saved;
    }
    return 'en';
  });
  const [displayMode, setDisplayMode] = useState<'clean' | 'bilingual'>('clean');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAlternativeVerse, setShowAlternativeVerse] = useState(false);

  // User Inquiry State
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>('career');
  const [userQuestion, setUserQuestion] = useState(
    'Will I get the senior director promotion next month, and how should I position my leadership?'
  );

  // AI Inquiry Analysis State
  const [analysis, setAnalysis] = useState<QuestionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 5-Second Override Countdown State
  const [countdown, setCountdown] = useState<number>(5);
  const [countdownActive, setCountdownActive] = useState<boolean>(false);

  // Draw State
  const [drawnLot, setDrawnLot] = useState<CanonicalLot | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // BaZi & Location & Rectification State
  const [timeBranch, setTimeBranch] = useState<'exact' | 'rough'>('exact');
  const [birthDate, setBirthDate] = useState('1992-10-14');
  const [birthTime, setBirthTime] = useState('09:30');
  const [selectedCity, setSelectedCity] = useState<MajorCity>(MAJOR_CITIES[0]); // Default: Taipei (121.57°E, UTC+8)
  const [roughSlot, setRoughSlot] = useState<'morning' | 'afternoon' | 'night' | 'not_sure'>('morning');
  const [rectificationQuestions, setRectificationQuestions] = useState<RectificationQuestion[] | null>(null);
  const [rectificationAnswers, setRectificationAnswers] = useState<Record<string, string>>({});
  const [isRectifying, setIsRectifying] = useState(false);
  const [rectifiedResult, setRectifiedResult] = useState<RectificationResult | null>(null);

  // Commercial Checkout State
  const [purchasePlan, setPurchasePlan] = useState<'single' | 'subscription'>('single');
  const [crdWaiverAccepted, setCrdWaiverAccepted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [unlockedReport, setUnlockedReport] = useState<{
    pillars: FourPillars;
    interaction: LotBaziInteraction;
    solarAdjustment: { offsetMinutes: number; trueSolarTime: string };
  } | null>(null);

  const t = translations[language];

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    localStorage.setItem('mazu_lang', newLang);
  };

  // AI Question Analysis Handler
  const runAiAnalysis = useCallback(async (q: string, domain: DomainCategory) => {
    if (!q || q.trim().length < 3) {
      setAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, selectedDomain: domain }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        if (data.analysis.primaryDomain) {
          setSelectedDomain(data.analysis.primaryDomain as DomainCategory);
        }
      }
    } catch (err) {
      console.warn('AI analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Debounced auto-analysis when question or domain changes
  useEffect(() => {
    const timer = setTimeout(() => {
      runAiAnalysis(userQuestion, selectedDomain);
    }, 800);
    return () => clearTimeout(timer);
  }, [userQuestion, selectedDomain, runAiAnalysis]);

  // Actual Draw Execution
  const executeLotDraw = useCallback(async () => {
    setCountdownActive(false);
    setCurrentStep('drawing');
    setIsDrawing(true);

    try {
      const res = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: selectedDomain,
          question: userQuestion,
        }),
      });
      const data = await res.json();
      if (data.success && data.lot) {
        setDrawnLot(data.lot);
      }
    } catch (err) {
      console.error('Error drawing lot:', err);
    }

    setTimeout(() => {
      setIsDrawing(false);
      setCurrentStep('reading');
    }, 2400);
  }, [selectedDomain, userQuestion]);

  // Trigger Draw with 5-Second Override Countdown Buffer
  const startDrawWithCountdown = () => {
    if (analysis?.isMultiDomain) {
      return;
    }
    setCountdown(5);
    setCountdownActive(true);
  };

  // Countdown Timer Loop (5s -> auto proceed)
  useEffect(() => {
    if (!countdownActive) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          executeLotDraw();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownActive, executeLotDraw]);

  // Fetch Rectification Questionnaire
  const handleFetchRectificationQuiz = async () => {
    setIsRectifying(true);
    try {
      const res = await fetch('/api/bazi/rectify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_questionnaire',
          birthDate,
          timeSlot: roughSlot,
          location: `${selectedCity.nameZh} (${formatLongitude(selectedCity.longitude)})`,
        }),
      });
      const data = await res.json();
      if (data.success && data.questions) {
        setRectificationQuestions(data.questions);
      }
    } catch (err) {
      console.error('Failed to load questionnaire:', err);
    } finally {
      setIsRectifying(false);
    }
  };

  // Solve Rectification from User Answers
  const handleSolveRectification = async () => {
    setIsRectifying(true);
    try {
      const res = await fetch('/api/bazi/rectify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'solve',
          birthDate,
          timeSlot: roughSlot,
          answers: rectificationAnswers,
          location: `${selectedCity.nameZh} (${formatLongitude(selectedCity.longitude)})`,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setRectifiedResult(data.result);
        const resolvedBranch = data.result.pinpointedHour?.branch;
        const branchHourMap: Record<string, string> = {
          子: '00:00',
          丑: '02:00',
          寅: '04:00',
          卯: '06:00',
          辰: '08:00',
          巳: '10:00',
          午: '12:00',
          未: '14:00',
          申: '16:00',
          酉: '18:00',
          戌: '20:00',
          亥: '22:00',
        };
        if (resolvedBranch && branchHourMap[resolvedBranch]) {
          setBirthTime(branchHourMap[resolvedBranch]);
        }
      }
    } catch (err) {
      console.error('Failed to solve rectification:', err);
    } finally {
      setIsRectifying(false);
    }
  };

  // Handle BaZi Calculation & Report Checkout
  const handleUnlockReport = async () => {
    if (!crdWaiverAccepted) {
      alert(
        language === 'zh-TW'
          ? '請先勾選確認歐盟數位商品猶豫期放棄條款。'
          : 'Please acknowledge the EU CRD Art. 16(m) digital content waiver to proceed.'
      );
      return;
    }

    setIsCheckingOut(true);
    try {
      const baziRes = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          longitude: selectedCity.longitude,
          timeZoneOffset: selectedCity.timeZoneOffset,
          lotNumber: drawnLot?.lot_number || 1,
        }),
      });
      const baziData = await baziRes.json();

      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'seeker_1992',
          userEmail: 'alex@example.com',
          lotNumber: drawnLot?.lot_number || 1,
          itemType: purchasePlan === 'single' ? 'single_report' : 'subscription',
          crdWaiverAccepted: true,
        }),
      });
      const checkoutData = await checkoutRes.json();

      if (baziData.success && checkoutData.success) {
        setUnlockedReport({
          pillars: baziData.pillars,
          interaction: baziData.interaction,
          solarAdjustment: baziData.solarAdjustment,
        });
        setCurrentStep('report');
      }
    } catch (err) {
      console.error('Error in checkout:', err);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const domainMeta = DOMAINS.find((d) => d.key === selectedDomain) || DOMAINS[0];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── SITE HEADER (MOBILE FRIENDLY) ──────────────────────── */}
      <header className="site-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setCurrentStep('porch');
            }}
            className="brand-badge"
          >
            <span className="brand-seal">{t.common.brandSeal}</span>
            <span className="brand-title-full">{t.common.brandName}</span>
            <span className="brand-title-compact">
              {language === 'zh-TW' ? (
                '媽祖靈籤'
              ) : (
                <span className="brand-title-compact-bilingual">
                  <span className="brand-title-compact-en">MAZU</span>
                  <span className="brand-title-compact-zh">靈籤</span>
                </span>
              )}
            </span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Direct Language Switcher */}
            <button
              onClick={() => handleLanguageChange(language === 'en' ? 'zh-TW' : 'en')}
              className="btn-outline header-btn"
              title="Click to Switch Language / 點擊切換語言"
              style={{
                borderColor: 'var(--gold-primary)',
                color: 'var(--gold-light)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span>🌐</span>
              <span className="header-btn-text-full">{language === 'en' ? 'English' : '繁體中文'}</span>
              <span className="header-btn-text-compact">{language === 'en' ? 'EN' : '繁中'}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>⇄</span>
            </button>

            {/* Bilingual Study Mode Toggle */}
            <button
              onClick={() => setDisplayMode(displayMode === 'clean' ? 'bilingual' : 'clean')}
              className="btn-outline header-btn"
              title="Toggle Clean vs. Bilingual Study Mode"
            >
              <span>{displayMode === 'clean' ? '✦' : '☯'}</span>
              <span className="header-btn-text-full">{displayMode === 'clean' ? t.common.cleanView : t.common.bilingualMode}</span>
              <span className="header-btn-text-compact">{displayMode === 'clean' ? (language === 'zh-TW' ? '純淨' : 'Clean') : (language === 'zh-TW' ? '雙語' : 'Dual')}</span>
            </button>

            {/* Preferences Modal Trigger */}
            <button
              onClick={() => setShowPreferences(true)}
              className="btn-outline header-btn"
              title={t.common.preferences}
            >
              <span>⚙️</span>
              <span className="header-btn-text-full">{t.common.preferences}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────── */}
      <main style={{ flex: 1, padding: 'clamp(24px, 4vw, 48px) 0' }}>
        <div className="container">
          {/* ════ SCREEN 1: THE PORCH / HERO + DIRECT QUESTION ═════ */}
          {currentStep === 'porch' && (
            <div style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto', paddingTop: '10px' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '12px', color: 'var(--gold-primary)' }}>✦</div>
              <div
                style={{
                  color: 'var(--gold-primary)',
                  letterSpacing: '0.22em',
                  fontSize: '0.92rem',
                  marginBottom: '12px',
                  fontWeight: 600,
                }}
              >
                {t.porch.subheading}
              </div>
              <h1
                className="font-serif gold-gradient-text"
                style={{ fontSize: 'clamp(1.9rem, 4.5vw, 2.7rem)', letterSpacing: '0.08em', lineHeight: 1.28, marginBottom: '18px' }}
              >
                {t.porch.heading}
              </h1>
              <p
                style={{
                  fontSize: 'clamp(0.98rem, 2vw, 1.12rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '32px',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {t.porch.description}
              </p>

              {/* ─── DIRECT INQUIRY CARD ON LANDING PAGE ──────────── */}
              <div
                className="glass-panel"
                style={{
                  padding: 'clamp(20px, 3.5vw, 32px)',
                  textAlign: 'left',
                  marginBottom: '44px',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
                  border: '1px solid var(--border-gold)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '0.98rem', color: 'var(--gold-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✦</span>
                    <span>{language === 'zh-TW' ? '心誠叩問 · 虔誠請示' : 'SINCERE INQUIRY & INNER CONTEMPLATION'}</span>
                  </label>
                  {isAnalyzing && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--gold-primary)' }}>
                      ✦ {t.questionStep.analyzing}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  {language === 'zh-TW'
                    ? '寫下您當前的抉擇或困惑，AI 語意引擎將依「一籤斷一事」自動識別 13 大事類門類：'
                    : 'Describe your question or dilemma. Our intent engine maps your inquiry to the 13 canonical oracle domains:'}
                </p>

                <textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(7, 11, 17, 0.85)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '1.02rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: 1.6,
                  }}
                  placeholder={t.questionStep.placeholder}
                />

                {/* AI Multi-Domain Detection Banner */}
                {analysis?.isMultiDomain && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px 18px',
                      background: 'rgba(194, 59, 34, 0.12)',
                      border: '1px solid rgba(194, 59, 34, 0.65)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#E87A68',
                        fontWeight: 700,
                        fontSize: '0.96rem',
                        marginBottom: '6px',
                      }}
                    >
                      <span>⚠️</span>
                      <span>{t.questionStep.multiDomainWarningTitle}</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '12px' }}>
                      {language === 'zh-TW' ? analysis.multiDomainWarningZh : analysis.multiDomainWarningEn}
                    </p>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {t.questionStep.focusSuggestion}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {analysis.suggestedQuestions.map((sq, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDomain(sq.domain);
                            setUserQuestion(language === 'zh-TW' ? sq.questionZh : sq.questionEn);
                          }}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid var(--gold-primary)',
                            borderRadius: '6px',
                            color: 'var(--gold-light)',
                            fontSize: '0.82rem',
                            padding: '6px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✦ {language === 'zh-TW' ? `聚焦於：${sq.domainTitleZh}` : `Focus on: ${sq.domainTitleEn}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fatalistic Question Reframing */}
                {analysis?.isFatalistic && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '14px 18px',
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid var(--border-gold)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                      {t.questionStep.fatalisticWarningTitle}
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontStyle: 'italic', fontSize: '0.94rem', marginBottom: '10px' }}>
                      &ldquo;{language === 'zh-TW' ? analysis.reframedQuestionZh : analysis.reframedQuestionEn}&rdquo;
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setUserQuestion(language === 'zh-TW' ? analysis.reframedQuestionZh : analysis.reframedQuestionEn)
                      }
                      className="btn-outline"
                      style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    >
                      {t.questionStep.applyReframingBtn}
                    </button>
                  </div>
                )}

                {/* Detected Domain Indicator & Primary Actions */}
                <div
                  style={{
                    marginTop: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {t.questionStep.currentDomain}:
                    </span>
                    <span
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid var(--border-gold)',
                        borderRadius: '20px',
                        color: 'var(--gold-light)',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                      }}
                    >
                      {domainMeta.icon} {language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setCurrentStep('domain')}
                      className="btn-outline"
                      style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                    >
                      {t.questionStep.changeDomain}
                    </button>
                    <button
                      id="btn-direct-draw"
                      onClick={startDrawWithCountdown}
                      disabled={!!analysis?.isMultiDomain}
                      className="btn-primary"
                      style={{
                        padding: '12px 26px',
                        fontSize: '0.98rem',
                        opacity: analysis?.isMultiDomain ? 0.5 : 1,
                        cursor: analysis?.isMultiDomain ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ✦ {t.questionStep.proceedBtn}
                    </button>
                  </div>
                </div>
              </div>

              {/* Three Core Pillars */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                  textAlign: 'left',
                }}
              >
                <div className="glass-panel" style={{ padding: '22px' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    {t.porch.feature1Title}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {t.porch.feature1Desc}
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '22px' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    {t.porch.feature2Title}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {t.porch.feature2Desc}
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '22px' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    {t.porch.feature3Title}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {t.porch.feature3Desc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ════ SCREEN 2: 13-DOMAIN MANUAL PICKER ═══════════════ */}
          {currentStep === 'domain' && (
            <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem', marginBottom: '8px' }}>
                {t.domainStep.stepTag}
              </div>
              <h2 className="font-serif gold-gradient-text" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '12px' }}>
                {t.domainStep.heading}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: '0.95rem' }}>
                {t.domainStep.description}
              </p>

              <div className="domain-grid">
                {DOMAINS.map((dom) => (
                  <div
                    key={dom.key}
                    onClick={() => setSelectedDomain(dom.key)}
                    className={`domain-tile ${selectedDomain === dom.key ? 'active' : ''}`}
                  >
                    <div className="domain-icon">{dom.icon}</div>
                    <div className="domain-title">
                      {language === 'zh-TW' ? dom.titleZh : dom.titleEn}
                    </div>
                    <div className="domain-sub">{dom.description}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
                <button onClick={() => setCurrentStep('porch')} className="btn-outline">
                  ◄ {t.common.back}
                </button>
                <button
                  onClick={() => setCurrentStep('question')}
                  className="btn-primary"
                  style={{ padding: '14px 32px' }}
                >
                  {t.domainStep.proceedBtn}: {language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn} ►
                </button>
              </div>
            </div>
          )}

          {/* ════ SCREEN 3: QUESTION REFINE GATE ═══════════════════ */}
          {currentStep === 'question' && (
            <div style={{ maxWidth: '740px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem', marginBottom: '8px' }}>
                  {t.questionStep.stepTag}
                </div>
                <h2 className="font-serif gold-gradient-text" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)', marginBottom: '10px' }}>
                  {t.questionStep.heading}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {t.questionStep.currentDomain}:{' '}
                  <strong style={{ color: 'var(--gold-light)' }}>
                    {domainMeta.icon} {language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn}
                  </strong>
                </p>
              </div>

              <div className="glass-panel" style={{ marginBottom: '24px', padding: 'clamp(20px, 3.5vw, 30px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {t.questionStep.questionLabel}:
                  </label>
                  {isAnalyzing && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--gold-primary)' }}>
                      ✦ {t.questionStep.analyzing}
                    </span>
                  )}
                </div>

                <textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    background: 'rgba(7, 11, 17, 0.75)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px',
                    color: 'var(--text-primary)',
                    fontSize: '1.02rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: 1.6,
                  }}
                  placeholder={t.questionStep.placeholder}
                />

                {/* AI Multi-Domain Warning */}
                {analysis?.isMultiDomain && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px 18px',
                      background: 'rgba(194, 59, 34, 0.12)',
                      border: '1px solid rgba(194, 59, 34, 0.65)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E87A68', fontWeight: 700, fontSize: '0.96rem', marginBottom: '6px' }}>
                      <span>⚠️</span>
                      <span>{t.questionStep.multiDomainWarningTitle}</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '12px' }}>
                      {language === 'zh-TW' ? analysis.multiDomainWarningZh : analysis.multiDomainWarningEn}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {analysis.suggestedQuestions.map((sq, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDomain(sq.domain);
                            setUserQuestion(language === 'zh-TW' ? sq.questionZh : sq.questionEn);
                          }}
                          style={{
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid var(--gold-primary)',
                            borderRadius: '6px',
                            color: 'var(--gold-light)',
                            fontSize: '0.82rem',
                            padding: '6px 12px',
                            cursor: 'pointer',
                          }}
                        >
                          ✦ {language === 'zh-TW' ? `聚焦：${sq.domainTitleZh}` : `Focus: ${sq.domainTitleEn}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Guidelines */}
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(7, 11, 17, 0.5)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--gold-primary)',
                  }}
                >
                  <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '6px' }}>
                    ✦ {t.questionStep.guidelinesTitle}:
                  </div>
                  <ul style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
                    <li>{t.questionStep.guideline1}</li>
                    <li>{t.questionStep.guideline2}</li>
                    <li>{t.questionStep.guideline3}</li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button onClick={() => setCurrentStep('domain')} className="btn-outline">
                  ◄ {t.questionStep.changeDomain}
                </button>
                <button onClick={startDrawWithCountdown} className="btn-primary" style={{ padding: '14px 34px' }}>
                  {t.questionStep.proceedBtn}
                </button>
              </div>
            </div>
          )}

          {/* ════ SCREEN 4: RITUAL DRAW ANIMATION ═════════════════ */}
          {currentStep === 'drawing' && (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div
                className={isDrawing ? 'anim-shaking' : ''}
                style={{
                  display: 'inline-block',
                  width: '140px',
                  height: '220px',
                  background: 'linear-gradient(180deg, #8E2B25 0%, #3D1010 100%)',
                  borderRadius: '16px 16px 24px 24px',
                  border: '3px solid var(--gold-primary)',
                  position: 'relative',
                  boxShadow: '0 16px 48px rgba(194, 59, 34, 0.4)',
                  paddingTop: '20px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-32px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '16px',
                    height: '70px',
                    background: 'var(--gold-gradient)',
                    borderRadius: '4px',
                    boxShadow: '0 0 16px var(--gold-primary)',
                  }}
                />
                <div style={{ color: 'var(--gold-light)', fontFamily: 'var(--font-chinese)', fontSize: '1.4rem', fontWeight: 700 }}>
                  媽祖<br />靈籤
                </div>
              </div>

              <h3 className="font-serif gold-gradient-text" style={{ fontSize: '1.8rem', marginTop: '40px' }}>
                {t.drawingStep.cylinderText}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                {t.drawingStep.incenseText}
              </p>
            </div>
          )}

          {/* ════ SCREEN 5 & 6: LOT REVEAL, READING & RECTIFICATION ════ */}
          {currentStep === 'reading' && drawnLot && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 40px)' }}>
                {/* Responsive Reading Layout */}
                <div className="reading-layout">
                  {/* Left Column: SvgLotCard Component (Canonical lot_01 Standard Layout) */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ margin: '0 auto', maxWidth: '300px' }}>
                      <SvgLotCard
                        lotNumber={drawnLot.lot_number}
                        ganzhiZh={drawnLot.ganzhi.zh}
                        titleZh={drawnLot.title.zh}
                        titleEn={drawnLot.title.en}
                        language={displayMode === 'bilingual' ? 'mixed' : language === 'zh-TW' ? 'zh-TW' : 'en'}
                      />
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {language === 'zh-TW'
                        ? `第 ${drawnLot.lot_number} 籤 · 正統秦篆印鑑（${drawnLot.ganzhi.zh}）`
                        : `Card #${drawnLot.lot_number} · 2×2 Qin Seal (${drawnLot.ganzhi.zh})`}
                    </div>
                  </div>

                  {/* Right Column: Cultural Details, Verse & Guidance */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ color: 'var(--gold-primary)', letterSpacing: '0.15em', fontWeight: 700 }}>
                        {language === 'zh-TW'
                          ? `第 ${String(drawnLot.lot_number).padStart(2, '0')} 籤 · ${drawnLot.ganzhi.zh}`
                          : `LOT ${String(drawnLot.lot_number).padStart(2, '0')} · ${drawnLot.ganzhi.zh} (${drawnLot.ganzhi.pinyin})`}
                      </span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        {t.readingStep.hexagramLabel}: {drawnLot.hexagram.name_zh} {drawnLot.hexagram.symbol}
                      </span>
                    </div>

                    <h2
                      className="font-serif gold-gradient-text"
                      style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.1rem)', margin: '8px 0 16px', lineHeight: 1.25 }}
                    >
                      {displayMode === 'bilingual' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span>{drawnLot.title.zh}</span>
                          <span style={{ fontSize: '0.62em', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.04em' }}>
                            {drawnLot.title.en}
                          </span>
                        </div>
                      ) : language === 'zh-TW' ? (
                        drawnLot.title.zh
                      ) : (
                        drawnLot.title.en
                      )}
                    </h2>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--gold-light)' }}>
                        {t.readingStep.archetypeLabel}: <strong>{language === 'zh-TW' ? drawnLot.title.zh : `${drawnLot.title.zh} · ${drawnLot.title.en}`}</strong>
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {t.readingStep.elementLabel}: <strong>{language === 'zh-TW' ? drawnLot.element_and_direction?.zh || drawnLot.element_and_direction?.element : drawnLot.element_and_direction?.en || drawnLot.element_and_direction?.element}</strong>
                      </span>
                    </div>

                    {/* Poetic Verse Display */}
                    <div
                      style={{
                        background: 'rgba(7, 11, 17, 0.65)',
                        border: '1px solid var(--border-gold)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'clamp(16px, 3vw, 24px)',
                        marginBottom: '20px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '14px',
                        }}
                      >
                        <span style={{ color: 'var(--gold-primary)', fontSize: '0.88rem', letterSpacing: '0.12em', fontWeight: 600 }}>
                          {t.readingStep.verseHeader}
                        </span>
                        <button
                          onClick={() => setShowAlternativeVerse(!showAlternativeVerse)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gold-light)',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {showAlternativeVerse
                            ? language === 'zh-TW'
                              ? '收起英譯對照'
                              : 'Hide Classical Verse'
                            : language === 'zh-TW'
                            ? '📜 展開英文 Cadence 對照'
                            : '📜 View Original 7-Char Verse'}
                        </button>
                      </div>

                      {displayMode === 'bilingual' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                          <div style={{ fontFamily: 'var(--font-chinese)', fontSize: '1.2rem', letterSpacing: '0.2em', color: 'var(--gold-light)', lineHeight: 1.9 }}>
                            {drawnLot.verse?.lines?.map((line) => (
                              <p key={line.line_number} style={{ marginBottom: '4px' }}>{line.zh}</p>
                            ))}
                          </div>
                          <div style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '0.98rem' }}>
                            {drawnLot.verse?.lines?.map((line) => (
                              <p key={line.line_number} style={{ marginBottom: '4px' }}>&ldquo;{line.en}&rdquo;</p>
                            ))}
                          </div>
                        </div>
                      ) : language === 'zh-TW' ? (
                        <div style={{ fontFamily: 'var(--font-chinese)', fontSize: '1.25rem', letterSpacing: '0.22em', color: 'var(--gold-light)', lineHeight: 1.9 }}>
                          {drawnLot.verse?.lines?.map((line) => (
                            <p key={line.line_number} style={{ marginBottom: '4px' }}>{line.zh}</p>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '1.02rem' }}>
                          {drawnLot.verse?.lines?.map((line) => (
                            <p key={line.line_number} style={{ marginBottom: '6px' }}>
                              &ldquo;{line.en}&rdquo;
                            </p>
                          ))}
                        </div>
                      )}

                      {showAlternativeVerse && displayMode !== 'bilingual' && (
                        <div
                          style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px dashed var(--border-gold)',
                          }}
                        >
                          {language === 'zh-TW' ? (
                            <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.96rem' }}>
                              {drawnLot.verse?.lines?.map((line) => (
                                <p key={line.line_number} style={{ marginBottom: '4px' }}>&ldquo;{line.en}&rdquo;</p>
                              ))}
                            </div>
                          ) : (
                            <div style={{ fontFamily: 'var(--font-chinese)', fontSize: '1.2rem', letterSpacing: '0.22em', color: 'var(--gold-light)', lineHeight: 1.9 }}>
                              {drawnLot.verse?.lines?.map((line) => (
                                <p key={line.line_number}>{line.zh}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Domain Guidance Line */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '6px' }}>
                        {t.readingStep.domainGuidanceHeader}{' '}
                        {language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn.toUpperCase()}:
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                        &ldquo;
                        {language === 'zh-TW'
                          ? drawnLot.guidance?.[selectedDomain]?.zh || drawnLot.guidance?.general?.zh || drawnLot.plain_meaning?.zh
                          : drawnLot.guidance?.[selectedDomain]?.en || drawnLot.guidance?.general?.en || drawnLot.plain_meaning?.en}
                        &rdquo;
                      </p>
                    </div>

                    {/* Prominent General Interpretation Disclaimer Box */}
                    <div
                      style={{
                        margin: '20px 0',
                        padding: '16px 20px',
                        background: 'rgba(212, 175, 55, 0.06)',
                        border: '1px solid rgba(212, 175, 55, 0.28)',
                        borderRadius: 'var(--radius-sm)',
                        borderLeft: '4px solid var(--gold-primary)',
                      }}
                    >
                      <div style={{ color: 'var(--gold-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '4px' }}>
                        {t.disclaimer.badge} · {t.disclaimer.title}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.6, margin: 0 }}>
                        {t.disclaimer.body}
                      </p>
                    </div>

                    {/* Historical Allusion Story Card */}
                    {drawnLot.stories && drawnLot.stories.length > 0 && (
                      <div
                        style={{
                          marginBottom: '20px',
                          padding: '16px',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(212, 175, 55, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.15)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                            {t.readingStep.historicalAllusionHeader} · {drawnLot.stories[0].title.zh}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {language === 'zh-TW' ? '' : drawnLot.stories[0].title.en}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                          {language === 'zh-TW' ? drawnLot.stories[0].narrative.zh : drawnLot.stories[0].narrative.en}
                        </p>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gold-light)', fontStyle: 'italic' }}>
                          {t.readingStep.poemConnectionLabel}: &ldquo;{language === 'zh-TW' ? drawnLot.stories[0].poem_connection.zh : drawnLot.stories[0].poem_connection.en}&rdquo;
                        </div>
                      </div>
                    )}

                    {/* Favorable vs Guarded Keywords */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                      <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                          {t.readingStep.favorableTag}
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {(language === 'zh-TW'
                            ? drawnLot.keywords?.favourable?.zh || drawnLot.keywords?.favourable?.en || []
                            : drawnLot.keywords?.favourable?.en || drawnLot.keywords?.favourable?.zh || []
                          ).join(' · ')}
                        </p>
                      </div>
                      <div style={{ background: 'rgba(194, 59, 34, 0.08)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ color: '#E87A68', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                          {t.readingStep.guardedTag}
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {(language === 'zh-TW'
                            ? drawnLot.keywords?.guarded?.zh || drawnLot.keywords?.guarded?.en || []
                            : drawnLot.keywords?.guarded?.en || drawnLot.keywords?.guarded?.zh || []
                          ).join(' · ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── DUAL-BRANCH BAZI RECTIFICATION & CONVERSION BRIDGE ─── */}
                <div
                  style={{
                    marginTop: '44px',
                    paddingTop: '36px',
                    borderTop: '1px solid var(--border-gold)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.15em', fontWeight: 700, fontSize: '0.92rem' }}>
                    {t.rectification.sectionTag}
                  </div>
                  <h3 className="font-serif gold-gradient-text" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.8rem)', margin: '8px 0 12px' }}>
                    {language === 'zh-TW'
                      ? `第 ${drawnLot.lot_number} 籤（${drawnLot.ganzhi.zh}）如何與您的個人八字深度合參？`
                      : `How Does Lot ${drawnLot.lot_number} (${drawnLot.ganzhi.zh}) Resonate With YOUR Natal Chart?`}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto 28px', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    {t.rectification.subheading}
                  </p>

                  {/* Dual Branch Selector Tabs */}
                  <div style={{ display: 'inline-flex', background: 'rgba(7, 11, 17, 0.9)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-gold)', marginBottom: '28px', maxWidth: '100%' }}>
                    <button
                      onClick={() => setTimeBranch('exact')}
                      style={{
                        background: timeBranch === 'exact' ? 'var(--gold-primary)' : 'transparent',
                        color: timeBranch === 'exact' ? '#070B11' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      ⏱️ {t.rectification.exactTimeTab}
                    </button>
                    <button
                      onClick={() => setTimeBranch('rough')}
                      style={{
                        background: timeBranch === 'rough' ? 'var(--gold-primary)' : 'transparent',
                        color: timeBranch === 'rough' ? '#070B11' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontWeight: 600,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      🔮 {t.rectification.roughTimeTab}
                    </button>
                  </div>

                  {/* Branch A: Exact Time Inputs with City Location Autocomplete & GPS */}
                  {timeBranch === 'exact' && (
                    <div className="birth-inputs-row">
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'left' }}>
                          {t.baziPaywall.birthDateLabel}
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          style={{
                            background: 'rgba(7, 11, 17, 0.8)',
                            border: '1px solid var(--border-gold)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: 'var(--text-primary)',
                            fontSize: '0.92rem',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'left' }}>
                          {t.baziPaywall.birthTimeLabel}
                        </label>
                        <input
                          type="time"
                          value={birthTime}
                          onChange={(e) => setBirthTime(e.target.value)}
                          style={{
                            background: 'rgba(7, 11, 17, 0.8)',
                            border: '1px solid var(--border-gold)',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            color: 'var(--text-primary)',
                            fontSize: '0.92rem',
                          }}
                        />
                      </div>
                      <CityLocationPicker
                        language={language === 'zh-TW' ? 'zh-TW' : 'en'}
                        selectedCity={selectedCity}
                        onCityChange={setSelectedCity}
                      />
                    </div>
                  )}

                  {/* Branch B: Rough Time Interval & Milestone Questionnaire */}
                  {timeBranch === 'rough' && (
                    <div style={{ maxWidth: '720px', margin: '0 auto 24px', textAlign: 'left' }}>
                      <div className="birth-inputs-row" style={{ marginBottom: '20px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            {t.baziPaywall.birthDateLabel}
                          </label>
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            style={{
                              background: 'rgba(7, 11, 17, 0.8)',
                              border: '1px solid var(--border-gold)',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              color: 'var(--text-primary)',
                              fontSize: '0.92rem',
                            }}
                          />
                        </div>
                        <CityLocationPicker
                          language={language === 'zh-TW' ? 'zh-TW' : 'en'}
                          selectedCity={selectedCity}
                          onCityChange={setSelectedCity}
                        />
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '8px' }}>
                          {t.rectification.selectSlotPrompt}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                          {[
                            { key: 'morning', label: t.rectification.slotMorning },
                            { key: 'afternoon', label: t.rectification.slotAfternoon },
                            { key: 'night', label: t.rectification.slotNight },
                            { key: 'not_sure', label: t.rectification.slotNotSure },
                          ].map((slot) => (
                            <button
                              key={slot.key}
                              type="button"
                              onClick={() => setRoughSlot(slot.key as typeof roughSlot)}
                              style={{
                                padding: '10px 12px',
                                background: roughSlot === slot.key ? 'rgba(212, 175, 55, 0.2)' : 'rgba(7, 11, 17, 0.6)',
                                border: roughSlot === slot.key ? '2px solid var(--gold-primary)' : '1px solid var(--border-gold)',
                                borderRadius: '8px',
                                color: roughSlot === slot.key ? 'var(--gold-light)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                textAlign: 'center',
                                fontWeight: roughSlot === slot.key ? 700 : 400,
                              }}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Launch Questionnaire Trigger */}
                      {!rectificationQuestions && !rectifiedResult && (
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                          <button
                            type="button"
                            onClick={handleFetchRectificationQuiz}
                            disabled={isRectifying}
                            className="btn-outline"
                            style={{ padding: '12px 28px', color: 'var(--gold-light)', borderColor: 'var(--gold-primary)' }}
                          >
                            {isRectifying ? t.rectification.lockingHour : t.rectification.startQuizBtn}
                          </button>
                        </div>
                      )}

                      {/* Render Historical Milestone Questionnaire */}
                      {rectificationQuestions && !rectifiedResult && (
                        <div
                          style={{
                            background: 'rgba(7, 11, 17, 0.7)',
                            border: '1px solid var(--border-gold)',
                            borderRadius: '12px',
                            padding: 'clamp(16px, 3vw, 24px)',
                            marginTop: '20px',
                          }}
                        >
                          <div style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                            {t.rectification.quizHeading}
                          </div>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                            {t.rectification.quizSubheading}
                          </p>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {rectificationQuestions.map((q) => (
                              <div
                                key={q.id}
                                style={{
                                  padding: '14px 16px',
                                  background: 'rgba(20, 28, 43, 0.6)',
                                  borderRadius: '8px',
                                  borderLeft: '3px solid var(--gold-primary)',
                                }}
                              >
                                <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '10px' }}>
                                  {language === 'zh-TW' ? q.questionZh : q.questionEn}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {q.options.map((opt) => (
                                    <label
                                      key={opt.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '0.86rem',
                                        color: rectificationAnswers[q.id] === opt.id ? 'var(--gold-light)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={q.id}
                                        value={opt.id}
                                        checked={rectificationAnswers[q.id] === opt.id}
                                        onChange={() =>
                                          setRectificationAnswers((prev) => ({
                                            ...prev,
                                            [q.id]: opt.id,
                                          }))
                                        }
                                      />
                                      <span>{language === 'zh-TW' ? opt.textZh : opt.textEn}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <button
                              type="button"
                              onClick={handleSolveRectification}
                              disabled={isRectifying}
                              className="btn-primary"
                              style={{ padding: '12px 32px' }}
                            >
                              {isRectifying ? t.rectification.lockingHour : t.rectification.lockHourBtn}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Converged Rectification Badge (Guaranteed Integer Percentage) */}
                      {rectifiedResult && (
                        <div
                          style={{
                            marginTop: '20px',
                            padding: '18px 22px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            border: '2px solid var(--gold-primary)',
                            borderRadius: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                            <span style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.96rem' }}>
                              {t.rectification.verifiedBadge}
                            </span>
                            <span style={{ fontSize: '0.84rem', color: 'var(--gold-light)', background: 'rgba(7, 11, 17, 0.6)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              Confidence: {rectifiedResult.confidenceScore > 1 ? Math.round(rectifiedResult.confidenceScore) : Math.round(rectifiedResult.confidenceScore * 100)}%
                            </span>
                          </div>
                          <div style={{ fontSize: '1.2rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                            {rectifiedResult.pinpointedHour?.shichenZh} ({rectifiedResult.pinpointedHour?.timeRange}) · 時柱 {rectifiedResult.pinpointedHour?.pillar}
                          </div>
                          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            {language === 'zh-TW'
                              ? `經米圖排盤內核矩陣運算，該時辰之子女宮與晚年宮位動象最能嚴密吻合您過往人生里程碑應期。系統已自動校準出生時間為 ${birthTime}。`
                              : `Verified by MiTu core matrix convergence. This hour pillar aligns with your historical milestone trajectories. Clock time set to ${birthTime}.`}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─── INSIGHTFUL EXCERPT HOOK (FREE CONVINCING TEASER) ─── */}
                  <div
                    style={{
                      maxWidth: '720px',
                      margin: '24px auto',
                      padding: 'clamp(18px, 3.5vw, 26px)',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(13, 20, 31, 0.85) 100%)',
                      border: '1px solid var(--gold-primary)',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--gold-primary)', fontSize: '1.1rem' }}>✦</span>
                        <span style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.96rem' }}>
                          {t.rectification.hookHeading}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          background: 'rgba(212, 175, 55, 0.25)',
                          color: 'var(--gold-light)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}
                      >
                        FREE PREVIEW
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.93rem', lineHeight: 1.68, margin: '8px 0 10px' }}>
                      {language === 'zh-TW'
                        ? rectifiedResult?.insightfulExcerptZh ||
                          `【結構診斷試讀】您所抽得之第 ${drawnLot.lot_number} 籤（${drawnLot.ganzhi.zh}）五行屬${drawnLot.element_and_direction.element}。此干支氣機與您日主五行交感，引動事業與決策宮位。即將到來之 2026 丙午歲君流年，天干透出比劫/食傷，構成個人自主權與職涯重組之關鍵窗口。完整解讀包含大運順序、十神喜忌與趨避時機。`
                        : rectifiedResult?.insightfulExcerptEn ||
                          `[Structural Diagnostic Teaser] Lot ${drawnLot.lot_number} (${drawnLot.ganzhi.zh}) carries ${drawnLot.element_and_direction.element} elemental energy, interacting directly with your Day Master palace. The upcoming 2026 Bing Wu annual transit activates a pivotal realignment window for leadership and personal sovereignty. Unlock the full report for your 10-God balances and auspicious seasonal timing windows.`}
                    </p>
                  </div>

                  {/* ─── COMMERCIAL MONETIZATION PLANS (RESPONSIVE) ──── */}
                  <div className="monetization-grid" style={{ maxWidth: '680px', margin: '0 auto 24px' }}>
                    {/* Plan A: Single Life Book */}
                    <div
                      onClick={() => setPurchasePlan('single')}
                      style={{
                        padding: '18px',
                        background: purchasePlan === 'single' ? 'rgba(212, 175, 55, 0.16)' : 'rgba(7, 11, 17, 0.6)',
                        border: purchasePlan === 'single' ? '2px solid var(--gold-primary)' : '1px solid var(--border-gold)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.92rem' }}>
                          {language === 'zh-TW' ? '九章全案命書' : '9-Section Life Book'}
                        </span>
                        <span style={{ color: 'var(--gold-primary)', fontWeight: 800, fontSize: '1.05rem' }}>$2.99</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                        {language === 'zh-TW' ? '限時體驗價（原價 $19.99）。包含真太陽時四柱排盤、十神喜忌、流年合參及終生典藏 PDF。' : 'Launch special (Reg. $19.99). Full True Solar BaZi chart, 10-God affinity, and heirloom report.'}
                      </p>
                    </div>

                    {/* Plan B: Predictive Subscription */}
                    <div
                      onClick={() => setPurchasePlan('subscription')}
                      style={{
                        padding: '18px',
                        background: purchasePlan === 'subscription' ? 'rgba(212, 175, 55, 0.16)' : 'rgba(7, 11, 17, 0.6)',
                        border: purchasePlan === 'subscription' ? '2px solid var(--gold-primary)' : '1px solid var(--border-gold)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.92rem' }}>
                          {language === 'zh-TW' ? '流年事件驅動預測' : 'Annual Predictive Transits'}
                        </span>
                        <span style={{ color: 'var(--gold-primary)', fontWeight: 800, fontSize: '1.05rem' }}>$9.99<span style={{ fontSize: '0.74rem' }}>/mo</span></span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>
                        {language === 'zh-TW' ? '主動監控流年流月引動宮位，逢天克地衝、歲運並臨等關鍵氣機提前推送提醒。' : 'Proactive alerts on annual & monthly transits clashing or combining with your natal palaces.'}
                      </p>
                    </div>
                  </div>

                  {/* EU CRD Art. 16(m) Waiver Checkbox */}
                  <div
                    style={{
                      maxWidth: '580px',
                      margin: '0 auto 24px',
                      textAlign: 'left',
                      background: 'rgba(20, 28, 43, 0.6)',
                      padding: '14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                    }}
                  >
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={crdWaiverAccepted}
                        onChange={(e) => setCrdWaiverAccepted(e.target.checked)}
                        style={{ marginTop: '3px' }}
                      />
                      <span>{t.baziPaywall.crdWaiverText}</span>
                    </label>
                  </div>

                  <button
                    onClick={handleUnlockReport}
                    disabled={isCheckingOut}
                    className="btn-primary"
                    style={{ padding: '16px 44px', fontSize: '1.02rem', width: '100%', maxWidth: '420px' }}
                  >
                    {isCheckingOut
                      ? t.baziPaywall.unlockingBtn
                      : purchasePlan === 'single'
                      ? t.rectification.unlockLifeBookBtn
                      : t.rectification.subscribePredictiveBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ SCREEN 7 & 8: PERSONALIZED UNLOCKED REPORT ════════ */}
          {currentStep === 'report' && unlockedReport && drawnLot && (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: 'clamp(20px, 4vw, 44px)' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem' }}>
                    {t.heirloomReport.reportHeader}
                  </div>
                  <h2 className="font-serif gold-gradient-text" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', margin: '10px 0' }}>
                    {language === 'zh-TW'
                      ? `第 ${drawnLot.lot_number} 籤（${drawnLot.ganzhi.zh}）${t.heirloomReport.titleCross}`
                      : `LOT ${drawnLot.lot_number} (${drawnLot.ganzhi.zh}) × YOUR NATAL BA-ZI`}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
                    {t.heirloomReport.solarAdjustedLabel}: {new Date(unlockedReport.solarAdjustment.trueSolarTime).toLocaleDateString()} ·
                    Offset: {unlockedReport.solarAdjustment.offsetMinutes > 0 ? '+' : ''}
                    {unlockedReport.solarAdjustment.offsetMinutes} mins · {selectedCity.nameZh || selectedCity.nameEn}
                  </p>
                </div>

                {/* Four Pillars Table (Responsive 4-col or 2x2) */}
                <div style={{ marginBottom: '36px' }}>
                  <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: '12px' }}>
                    {t.heirloomReport.fourPillarsTitle}
                  </div>
                  <div className="four-pillars-grid">
                    <div style={{ background: 'rgba(7, 11, 17, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-gold)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.heirloomReport.yearPillar}</div>
                      <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                        {unlockedReport.pillars.year.pillar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unlockedReport.pillars.year.element}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(7, 11, 17, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-gold)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.heirloomReport.monthPillar}</div>
                      <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                        {unlockedReport.pillars.month.pillar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unlockedReport.pillars.month.element}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '16px', borderRadius: '10px', border: '2px solid var(--gold-primary)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 700 }}>{t.heirloomReport.dayMasterPillar}</div>
                      <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                        {unlockedReport.pillars.day.pillar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unlockedReport.pillars.day.element}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(7, 11, 17, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-gold)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.heirloomReport.hourPillar}</div>
                      <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                        {unlockedReport.pillars.hour.pillar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unlockedReport.pillars.hour.element}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interaction Analysis Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: 'rgba(7, 11, 17, 0.6)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                      1. {language === 'zh-TW' ? unlockedReport.interaction.dayMasterAffinity.titleZh : unlockedReport.interaction.dayMasterAffinity.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      {unlockedReport.interaction.dayMasterAffinity.dynamicEn}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                      {unlockedReport.interaction.dayMasterAffinity.descriptionEn}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 17, 0.6)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                      2. {language === 'zh-TW' ? unlockedReport.interaction.pillarInteraction.titleZh : unlockedReport.interaction.pillarInteraction.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      {unlockedReport.interaction.pillarInteraction.dynamicEn}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                      {unlockedReport.interaction.pillarInteraction.descriptionEn}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 17, 0.6)', padding: 'clamp(16px, 3vw, 24px)', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                      3. {unlockedReport.interaction.annualPillarResonance.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      Window of Action: {unlockedReport.interaction.annualPillarResonance.windowEn}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.92rem' }}>
                      {unlockedReport.interaction.annualPillarResonance.guidanceEn}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '36px', flexWrap: 'wrap' }}>
                  <button onClick={() => setCurrentStep('reading')} className="btn-outline">
                    ◄ {t.heirloomReport.backToReadingBtn}
                  </button>
                  <button onClick={() => setCurrentStep('porch')} className="btn-primary">
                    {t.heirloomReport.drawNewLotBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── 5-SECOND DOMAIN OVERRIDE COUNTDOWN MODAL ───────────── */}
      {countdownActive && (
        <div className="modal-backdrop">
          <div
            className="modal-content"
            style={{
              maxWidth: '560px',
              textAlign: 'center',
              border: '2px solid var(--gold-primary)',
              background: 'rgba(10, 16, 26, 0.96)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px var(--gold-glow)',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.15)',
                border: '2px solid var(--gold-primary)',
                fontSize: '1.8rem',
                color: 'var(--gold-primary)',
                fontWeight: 800,
                marginBottom: '16px',
              }}
            >
              {countdown}
            </div>

            <h3 className="font-serif gold-gradient-text" style={{ fontSize: '1.6rem', marginBottom: '6px' }}>
              {t.countdown.detectedInquiry}
            </h3>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                background: 'rgba(212, 175, 55, 0.2)',
                border: '1px solid var(--gold-primary)',
                borderRadius: '24px',
                color: 'var(--gold-light)',
                fontWeight: 700,
                fontSize: '1.1rem',
                margin: '8px 0 16px',
              }}
            >
              <span>{domainMeta.icon}</span>
              <span>{language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn}</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '20px' }}>
              {t.countdown.drawingInSeconds.replace('{n}', String(countdown))}
            </p>

            {/* Quick 13-Domain Override Chips */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '12px',
                background: 'rgba(7, 11, 17, 0.6)',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '1px solid var(--border-gold)',
              }}
            >
              {DOMAINS.map((dom) => (
                <button
                  key={dom.key}
                  type="button"
                  onClick={() => setSelectedDomain(dom.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '0.82rem',
                    background: selectedDomain === dom.key ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedDomain === dom.key ? '#070B11' : 'var(--text-secondary)',
                    border: selectedDomain === dom.key ? '1px solid var(--gold-primary)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    fontWeight: selectedDomain === dom.key ? 700 : 400,
                  }}
                >
                  {dom.icon} {language === 'zh-TW' ? dom.titleZh : dom.titleEn}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setCountdownActive(false)}
                className="btn-outline"
                style={{ padding: '12px 20px', fontSize: '0.9rem' }}
              >
                ✕ {t.common.back}
              </button>
              <button
                type="button"
                onClick={executeLotDraw}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.98rem' }}
              >
                ⚡ {t.countdown.drawNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PREFERENCES MODAL DRAWER ───────────────────────────── */}
      {showPreferences && (
        <div className="modal-backdrop" onClick={() => setShowPreferences(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="font-serif gold-gradient-text" style={{ fontSize: '1.5rem' }}>
                {t.preferencesModal.title}
              </h3>
              <button
                onClick={() => setShowPreferences(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '8px' }}>
                {t.preferencesModal.languageLabel}:
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                style={{
                  width: '100%',
                  background: 'rgba(7, 11, 17, 0.9)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                }}
              >
                <option value="en">English (Global)</option>
                <option value="zh-TW">繁體中文 (Traditional Chinese - 媽祖靈籤正體)</option>
              </select>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '8px' }}>
                {t.preferencesModal.displayModeLabel}:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    checked={displayMode === 'clean'}
                    onChange={() => setDisplayMode('clean')}
                  />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <strong>{t.common.cleanView}</strong>: {t.preferencesModal.cleanModeDesc}
                  </span>
                </label>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    checked={displayMode === 'bilingual'}
                    onChange={() => setDisplayMode('bilingual')}
                  />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <strong>{t.common.bilingualMode}</strong>: {t.preferencesModal.bilingualModeDesc}
                  </span>
                </label>
              </div>
            </div>

            <button onClick={() => setShowPreferences(false)} className="btn-primary" style={{ width: '100%' }}>
              {t.preferencesModal.closeBtn}
            </button>
          </div>
        </div>
      )}

      {/* ─── SITE FOOTER ────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '28px 0',
          textAlign: 'center',
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
        }}
      >
        <div className="container">
          <p style={{ marginBottom: '8px' }}>
            {language === 'zh-TW'
              ? '文化遺產與心靈省思 · 非宿命式預測 · 敬慎存心'
              : 'Cultural heritage and reflective guidance — not a prediction of deterministic events.'}
          </p>
          <p>© 2026 Mazu Heritage Project · Philological Sixty Jiazi Canon · CRD Art. 16(m) Verified</p>
        </div>
      </footer>
    </div>
  );
}
