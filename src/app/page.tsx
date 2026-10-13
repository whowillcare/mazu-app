'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DOMAINS } from '@/lib/lots/domains';
import { CanonicalLot, DomainCategory } from '@/lib/types/lots';
import { FourPillars, LotBaziInteraction } from '@/lib/bazi/baziEngine';
import { translations, SupportedLanguage } from '@/lib/i18n/translations';
import { QuestionAnalysisResult } from '@/lib/ai/questionParser';

type JourneyStep = 'porch' | 'domain' | 'question' | 'drawing' | 'reading' | 'report';

export default function MazuLotApp() {
  // Navigation & Step State
  const [currentStep, setCurrentStep] = useState<JourneyStep>('porch');

  // Preferences State
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [displayMode, setDisplayMode] = useState<'clean' | 'bilingual'>('clean');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAlternativeVerse, setShowAlternativeVerse] = useState(false);

  // User Inquiry State
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>('career');
  const [userQuestion, setUserQuestion] = useState('Will I get the senior director promotion next month?');
  const [reframedQuestion, setReframedQuestion] = useState('');
  const [gateReason, setGateReason] = useState('');

  // AI Inquiry Analysis State
  const [analysis, setAnalysis] = useState<QuestionAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Draw State
  const [drawnLot, setDrawnLot] = useState<CanonicalLot | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // BaZi & Report State
  const [birthDate, setBirthDate] = useState('1992-10-14');
  const [birthTime, setBirthTime] = useState('09:30');
  const [birthLocation, setBirthLocation] = useState('Taipei (121.5°E)');
  const [crdWaiverAccepted, setCrdWaiverAccepted] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [unlockedReport, setUnlockedReport] = useState<{
    pillars: FourPillars;
    interaction: LotBaziInteraction;
    solarAdjustment: { offsetMinutes: number; trueSolarTime: string };
  } | null>(null);

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem('mazu_lang') as SupportedLanguage;
    if (saved === 'en' || saved === 'zh-TW') {
      setLanguage(saved);
    }
  }, []);

  const t = translations[language];

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    localStorage.setItem('mazu_lang', newLang);
  };

  // Debounced AI Question Analysis
  const runAiAnalysis = useCallback(async (q: string, domain: DomainCategory) => {
    if (!q || q.trim().length < 4) {
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
      }
    } catch (err) {
      console.warn('AI analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (currentStep === 'question') {
      const timer = setTimeout(() => {
        runAiAnalysis(userQuestion, selectedDomain);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [userQuestion, selectedDomain, currentStep, runAiAnalysis]);

  // Handle Question Gate Submission
  const handleProceedToDraw = async () => {
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
        setReframedQuestion(data.questionGate?.reframedQuestion || userQuestion);
        setGateReason(data.questionGate?.reason || '');
      }
    } catch (err) {
      console.error('Error drawing lot:', err);
    }

    setTimeout(() => {
      setIsDrawing(false);
      setCurrentStep('reading');
    }, 2600);
  };

  // Handle BaZi Calculation & Report Checkout
  const handleUnlockReport = async () => {
    if (!crdWaiverAccepted) {
      alert(language === 'zh-TW' ? '請先勾選確認歐盟數位商品猶豫期放棄條款。' : 'Please acknowledge the EU CRD Art. 16(m) digital content waiver to proceed.');
      return;
    }

    setIsCheckingOut(true);
    try {
      // 1. Calculate BaZi
      const baziRes = await fetch('/api/bazi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate,
          birthTime,
          longitude: 121.5,
          timeZoneOffset: 8,
          lotNumber: drawnLot?.lot_number || 1,
        }),
      });
      const baziData = await baziRes.json();

      // 2. Process Checkout
      const checkoutRes = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'seeker_1992',
          userEmail: 'alex@example.com',
          lotNumber: drawnLot?.lot_number || 1,
          itemType: 'single_report',
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
      {/* ─── SITE HEADER ────────────────────────────────────────── */}
      <header className="site-header">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" onClick={() => setCurrentStep('porch')} className="brand-badge">
            <span className="brand-seal">{t.common.brandSeal}</span>
            <span>{t.common.brandName}</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Direct Language Switcher Dropdown/Button */}
            <button
              onClick={() => handleLanguageChange(language === 'en' ? 'zh-TW' : 'en')}
              className="btn-outline"
              title="Click to Switch Language / 點擊切換語言"
              style={{
                fontSize: '0.86rem',
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderColor: 'var(--gold-primary)',
                color: 'var(--gold-light)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.05rem' }}>🌐</span>
              <span>{language === 'en' ? 'English' : '繁體中文'}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.7, marginLeft: '2px' }}>⇄</span>
            </button>

            {/* Bilingual Study Mode Toggle */}
            <button
              onClick={() => setDisplayMode(displayMode === 'clean' ? 'bilingual' : 'clean')}
              className="btn-outline"
              title="Toggle Clean vs. Bilingual Study Mode"
              style={{ fontSize: '0.84rem', padding: '7px 12px' }}
            >
              {displayMode === 'clean' ? t.common.cleanView : t.common.bilingualMode}
            </button>

            {/* Preferences Modal Trigger */}
            <button
              onClick={() => setShowPreferences(true)}
              className="btn-outline"
              style={{ padding: '7px 12px' }}
            >
              {t.common.preferences}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────── */}
      <main style={{ flex: 1, padding: '48px 0' }}>
        <div className="container">
          {/* ════ SCREEN 1: THE PORCH / HERO ══════════════════════ */}
          {currentStep === 'porch' && (
            <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto', paddingTop: '28px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--gold-primary)' }}>✦</div>
              <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.22em', fontSize: '0.92rem', marginBottom: '12px', fontWeight: 600 }}>
                {t.porch.subheading}
              </div>
              <h1
                className="font-serif gold-gradient-text"
                style={{ fontSize: '2.7rem', letterSpacing: '0.08em', lineHeight: 1.28, marginBottom: '20px' }}
              >
                {t.porch.heading}
              </h1>
              <p
                style={{
                  fontSize: '1.15rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '40px',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {t.porch.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '64px' }}>
                <button
                  id="btn-draw-start"
                  onClick={() => setCurrentStep('domain')}
                  className="btn-primary"
                  style={{ padding: '16px 38px', fontSize: '1.05rem' }}
                >
                  {t.porch.ctaDraw}
                </button>
                <button
                  onClick={() => setCurrentStep('domain')}
                  className="btn-outline"
                  style={{ padding: '16px 28px' }}
                >
                  {t.porch.ctaExplore}
                </button>
              </div>

              {/* Three Core Pillars */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', textAlign: 'left' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    {t.porch.feature1Title}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {t.porch.feature1Desc}
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    {t.porch.feature2Title}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {t.porch.feature2Desc}
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    {t.porch.feature3Title}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    {t.porch.feature3Desc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ════ SCREEN 2: DOMAIN PICKER ═════════════════════════ */}
          {currentStep === 'domain' && (
            <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem', marginBottom: '8px' }}>
                {t.domainStep.stepTag}
              </div>
              <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
                {t.domainStep.heading}
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
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

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '28px' }}>
                <button onClick={() => setCurrentStep('porch')} className="btn-outline">
                  ◄ {t.common.back}
                </button>
                <button onClick={() => setCurrentStep('question')} className="btn-primary" style={{ padding: '14px 32px' }}>
                  {t.domainStep.proceedBtn}: {language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn} ►
                </button>
              </div>
            </div>
          )}

          {/* ════ SCREEN 3: QUESTION GATE & AI PARSING ═════════════ */}
          {currentStep === 'question' && (
            <div style={{ maxWidth: '740px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem', marginBottom: '8px' }}>
                  {t.questionStep.stepTag}
                </div>
                <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
                  {t.questionStep.heading}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {t.questionStep.currentDomain}: <strong style={{ color: 'var(--gold-light)' }}>{language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn}</strong>
                </p>
              </div>

              <div className="glass-panel" style={{ marginBottom: '24px', padding: '30px' }}>
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
                    fontSize: '1.05rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: 1.6,
                  }}
                  placeholder={t.questionStep.placeholder}
                />

                {/* AI Detection & Multi-Domain Warning Banner */}
                {analysis?.isMultiDomain && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '16px 18px',
                      background: 'rgba(194, 59, 34, 0.12)',
                      border: '1px solid rgba(194, 59, 34, 0.6)',
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

                {/* Fatalistic Question Reframing Suggestion */}
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
                      onClick={() => setUserQuestion(language === 'zh-TW' ? analysis.reframedQuestionZh : analysis.reframedQuestionEn)}
                      className="btn-outline"
                      style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                    >
                      {t.questionStep.applyReframingBtn}
                    </button>
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

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => setCurrentStep('domain')} className="btn-outline">
                  ◄ {t.questionStep.changeDomain}
                </button>
                <button onClick={handleProceedToDraw} className="btn-primary" style={{ padding: '14px 34px' }}>
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
                {/* Bamboo Lot Sticks */}
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

          {/* ════ SCREEN 5 & 6: LOT REVEAL & READING ══════════════ */}
          {currentStep === 'reading' && drawnLot && (
            <div style={{ maxWidth: '980px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '40px', alignItems: 'start' }}>
                  {/* Left Column: Refactored Card Artwork */}
                  <div style={{ textAlign: 'center' }}>
                    <div className="card-frame" style={{ margin: '0 auto' }}>
                      <img
                        src={`/assets/cards/lot_${String(drawnLot.lot_number).padStart(2, '0')}_card.jpg`}
                        alt={`Lot ${drawnLot.lot_number}`}
                        className="card-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/cards/lot_01_card.jpg';
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {language === 'zh-TW'
                        ? `第 ${drawnLot.lot_number} 籤 · 秦篆方印（${drawnLot.ganzhi.zh}）`
                        : `Card #${drawnLot.lot_number} · 2×2 Qin Seal (${drawnLot.ganzhi.zh})`}
                    </div>
                  </div>

                  {/* Right Column: Cultural Details & Verse */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
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
                      style={{ fontSize: '2.1rem', margin: '8px 0 16px', lineHeight: 1.25 }}
                    >
                      {language === 'zh-TW' ? drawnLot.title.zh : drawnLot.title.en}
                    </h2>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--gold-light)' }}>
                        {t.readingStep.archetypeLabel}: <strong>{language === 'zh-TW' ? drawnLot.title.zh : drawnLot.title.zh}</strong>
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {t.readingStep.elementLabel}: <strong>{drawnLot.element_and_direction.element}</strong>
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {t.readingStep.favorableSeasonLabel}: <strong>{drawnLot.element_and_direction.favorable_season}</strong>
                      </span>
                    </div>

                    {/* Poetic Verse Display */}
                    <div
                      style={{
                        background: 'rgba(7, 11, 17, 0.65)',
                        border: '1px solid var(--border-gold)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px',
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
                            ? (language === 'zh-TW' ? '收起英譯對照' : 'Hide Classical Verse')
                            : (language === 'zh-TW' ? '📜 展開英文 Cadence 對照' : '📜 View Original 7-Char Verse')}
                        </button>
                      </div>

                      {/* Primary Verse: Chinese for zh-TW, English for en, or Dual for bilingual */}
                      {displayMode === 'bilingual' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

                      {/* On-Demand Secondary / Companion Verse */}
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
                            <div
                              style={{
                                fontFamily: 'var(--font-chinese)',
                                fontSize: '1.2rem',
                                letterSpacing: '0.22em',
                                color: 'var(--gold-light)',
                                lineHeight: 1.9,
                              }}
                            >
                              {drawnLot.verse?.lines?.map((line) => (
                                <p key={line.line_number}>{line.zh}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Domain Guidance Line (Clean Single Language) */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '6px' }}>
                        {t.readingStep.domainGuidanceHeader} {language === 'zh-TW' ? domainMeta.titleZh : domainMeta.titleEn.toUpperCase()}:
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                        &ldquo;
                        {language === 'zh-TW'
                          ? (drawnLot.guidance?.[selectedDomain]?.zh || drawnLot.guidance?.general?.zh || drawnLot.plain_meaning?.zh)
                          : (drawnLot.guidance?.[selectedDomain]?.en || drawnLot.guidance?.general?.en || drawnLot.plain_meaning?.en)}
                        &rdquo;
                      </p>
                    </div>

                    {/* Favorable vs Guarded Keywords */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                          {t.readingStep.favorableTag}
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {(language === 'zh-TW'
                            ? (drawnLot.keywords?.favourable?.zh || drawnLot.keywords?.favourable?.en || [])
                            : (drawnLot.keywords?.favourable?.en || drawnLot.keywords?.favourable?.zh || [])
                          ).join(' · ')}
                        </p>
                      </div>
                      <div style={{ background: 'rgba(194, 59, 34, 0.08)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ color: '#E87A68', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                          {t.readingStep.guardedTag}
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {(language === 'zh-TW'
                            ? (drawnLot.keywords?.guarded?.zh || drawnLot.keywords?.guarded?.en || [])
                            : (drawnLot.keywords?.guarded?.en || drawnLot.keywords?.guarded?.zh || [])
                          ).join(' · ')}
                        </p>
                      </div>
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

                    {/* Hermeneutic Nuance Notes */}
                    {drawnLot.reading_notes && drawnLot.reading_notes.length > 0 && (
                      <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--gold-light)' }}>{t.readingStep.hermeneuticNotesLabel}:</strong>{' '}
                        {drawnLot.reading_notes.map((n) =>
                          language === 'zh-TW' ? `${n.term}：${n.zh}` : `${n.term} (${n.pinyin}): ${n.en}`
                        ).join(' · ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── PAYWALL / BAZI INTEGRATION HOOK ─────────────── */}
                <div
                  style={{
                    marginTop: '44px',
                    paddingTop: '36px',
                    borderTop: '1px solid var(--border-gold)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.15em', fontWeight: 700, fontSize: '0.92rem' }}>
                    {t.baziPaywall.sectionTag}
                  </div>
                  <h3 className="font-serif gold-gradient-text" style={{ fontSize: '1.8rem', margin: '8px 0 12px' }}>
                    {language === 'zh-TW'
                      ? `第 ${drawnLot.lot_number} 籤（${drawnLot.ganzhi.zh}）如何與您的個人八字命盤相互感應？`
                      : `What Does Lot ${drawnLot.lot_number} (${drawnLot.ganzhi.zh}) Say About YOUR Four Pillars?`}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                    {t.baziPaywall.description}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      justifyContent: 'center',
                      maxWidth: '680px',
                      margin: '0 auto 24px',
                    }}
                  >
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
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
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
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        {t.baziPaywall.locationLabel}
                      </label>
                      <input
                        type="text"
                        value={birthLocation}
                        onChange={(e) => setBirthLocation(e.target.value)}
                        style={{
                          background: 'rgba(7, 11, 17, 0.8)',
                          border: '1px solid var(--border-gold)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: 'var(--text-primary)',
                          width: '180px',
                        }}
                      />
                    </div>
                  </div>

                  {/* EU CRD Art. 16(m) Waiver Checkbox */}
                  <div
                    style={{
                      maxWidth: '560px',
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
                    style={{ padding: '16px 42px' }}
                  >
                    {isCheckingOut ? t.baziPaywall.unlockingBtn : t.baziPaywall.unlockBtn}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ SCREEN 7 & 8: PERSONALIZED REPORT ═══════════════ */}
          {currentStep === 'report' && unlockedReport && drawnLot && (
            <div style={{ maxWidth: '880px', margin: '0 auto' }}>
              <div className="glass-panel" style={{ padding: '44px' }}>
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                  <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem' }}>
                    {t.heirloomReport.reportHeader}
                  </div>
                  <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2.4rem', margin: '10px 0' }}>
                    {language === 'zh-TW'
                      ? `第 ${drawnLot.lot_number} 籤（${drawnLot.ganzhi.zh}）${t.heirloomReport.titleCross}`
                      : `LOT ${drawnLot.lot_number} (${drawnLot.ganzhi.zh}) × YOUR NATAL BA-ZI`}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
                    {t.heirloomReport.solarAdjustedLabel}: {new Date(unlockedReport.solarAdjustment.trueSolarTime).toLocaleDateString()} ·
                    Offset: {unlockedReport.solarAdjustment.offsetMinutes > 0 ? '+' : ''}
                    {unlockedReport.solarAdjustment.offsetMinutes} mins
                  </p>
                </div>

                {/* Four Pillars Table */}
                <div style={{ marginBottom: '36px' }}>
                  <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: '12px' }}>
                    {t.heirloomReport.fourPillarsTitle}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
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
                  <div style={{ background: 'rgba(7, 11, 17, 0.6)', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                      1. {language === 'zh-TW' ? unlockedReport.interaction.dayMasterAffinity.titleZh : unlockedReport.interaction.dayMasterAffinity.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      {unlockedReport.interaction.dayMasterAffinity.dynamicEn}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {unlockedReport.interaction.dayMasterAffinity.descriptionEn}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 17, 0.6)', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                      2. {language === 'zh-TW' ? unlockedReport.interaction.pillarInteraction.titleZh : unlockedReport.interaction.pillarInteraction.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      {unlockedReport.interaction.pillarInteraction.dynamicEn}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {unlockedReport.interaction.pillarInteraction.descriptionEn}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 17, 0.6)', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                      3. {unlockedReport.interaction.annualPillarResonance.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      Window of Action: {unlockedReport.interaction.annualPillarResonance.windowEn}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {unlockedReport.interaction.annualPillarResonance.guidanceEn}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '36px' }}>
                  <button onClick={() => setCurrentStep('reading')} className="btn-outline">
                    ◄ {t.heirloomReport.backToReadingBtn}
                  </button>
                  <button onClick={() => setCurrentStep('domain')} className="btn-primary">
                    {t.heirloomReport.drawNewLotBtn}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

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
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '28px 0', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
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
