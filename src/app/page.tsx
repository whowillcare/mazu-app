'use client';

import React, { useState } from 'react';
import { DOMAINS } from '@/lib/lots/domains';
import { CanonicalLot, DomainCategory } from '@/lib/types/lots';
import { FourPillars, LotBaziInteraction } from '@/lib/bazi/baziEngine';

type JourneyStep = 'porch' | 'domain' | 'question' | 'drawing' | 'reading' | 'report';

export default function MazuLotApp() {
  // Navigation & Step State
  const [currentStep, setCurrentStep] = useState<JourneyStep>('porch');

  // Preferences State
  const [language, setLanguage] = useState<'en' | 'zh-TW'>('en');
  const [displayMode, setDisplayMode] = useState<'clean' | 'bilingual'>('clean');
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOriginalVerse, setShowOriginalVerse] = useState(false);

  // User Inquiry State
  const [selectedDomain, setSelectedDomain] = useState<DomainCategory>('career');
  const [userQuestion, setUserQuestion] = useState('Will I get the senior director promotion next month?');
  const [reframedQuestion, setReframedQuestion] = useState('');
  const [gateReason, setGateReason] = useState('');

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
      alert('Please acknowledge the EU CRD Art. 16(m) digital content waiver to proceed.');
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
            <span className="brand-seal">媽</span>
            <span>MAZU SIXTY JIAZI · 靈籤</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setDisplayMode(displayMode === 'clean' ? 'bilingual' : 'clean')}
              className="btn-outline"
              title="Toggle Clean vs. Bilingual Study Mode"
              style={{ fontSize: '0.84rem', padding: '8px 14px' }}
            >
              {displayMode === 'clean' ? '✦ Clean View' : '☯ Bilingual Mode'}
            </button>
            <button
              onClick={() => setShowPreferences(true)}
              className="btn-outline"
              style={{ padding: '8px 14px' }}
            >
              ⚙️ Preferences
            </button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT AREA ─────────────────────────────────── */}
      <main style={{ flex: 1, padding: '48px 0' }}>
        <div className="container">
          {/* ════ SCREEN 1: THE PORCH / HERO ══════════════════════ */}
          {currentStep === 'porch' && (
            <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto', paddingTop: '32px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--gold-primary)' }}>✦</div>
              <h1
                className="font-serif gold-gradient-text"
                style={{ fontSize: '2.8rem', letterSpacing: '0.12em', lineHeight: 1.25, marginBottom: '20px' }}
              >
                THE SIXTY JIAZI LOTS OF THE<br />MAZU TEMPLE TRADITION
              </h1>
              <p
                style={{
                  fontSize: '1.2rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  marginBottom: '40px',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                &ldquo;Draw a lot, then read it in the light of your own chart.&rdquo;
              </p>

              <button
                id="btn-draw-start"
                onClick={() => setCurrentStep('domain')}
                className="btn-primary"
                style={{ marginBottom: '64px' }}
              >
                DRAW A LOT · 卜問靈籤
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    PHILOLOGICAL RIGOR
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    Authentic classical verses, unrhymed exact English translations, and ancient polysemy commentaries.
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    QUESTION GATE (AI)
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    Temple governance enforcing &ldquo;One lot answers one matter&rdquo; and agency-centered inquiry reframing.
                  </p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'left' }}>
                  <div style={{ color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.08em' }}>
                    PERSONALIZED METAPHYSICS
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                    Cross-calculate the drawn Lot with your True Solar BaZi Four Pillars and the active Annual Pillar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ════ SCREEN 2: DOMAIN PICKER ═════════════════════════ */}
          {currentStep === 'domain' && (
            <div style={{ maxWidth: '880px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem', marginBottom: '8px' }}>
                STEP 1 OF 3 · 選擇事域
              </div>
              <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2.2rem', marginBottom: '12px' }}>
                WHAT IS YOUR CONTEMPLATION?
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Select the life domain you bring before the lot for focused guidance.
              </p>

              <div className="domain-grid">
                {DOMAINS.map((dom) => (
                  <div
                    key={dom.key}
                    onClick={() => setSelectedDomain(dom.key)}
                    className={`domain-tile ${selectedDomain === dom.key ? 'active' : ''}`}
                  >
                    <div className="domain-icon">{dom.icon}</div>
                    <div className="domain-title">{dom.titleEn}</div>
                    <div className="domain-sub">{dom.description}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                <button onClick={() => setCurrentStep('porch')} className="btn-outline">
                  ◄ Back
                </button>
                <button onClick={() => setCurrentStep('question')} className="btn-primary" style={{ padding: '14px 32px' }}>
                  Continue with {domainMeta.titleEn} ►
                </button>
              </div>
            </div>
          )}

          {/* ════ SCREEN 3: QUESTION GATE ═════════════════════════ */}
          {currentStep === 'question' && (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <div style={{ color: 'var(--gold-primary)', letterSpacing: '0.2em', fontSize: '0.88rem', marginBottom: '8px' }}>
                  STEP 2 OF 3 · 審問立意
                </div>
                <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2.2rem', marginBottom: '10px' }}>
                  FORMULATE YOUR CONTEMPLATION
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Domain: <strong style={{ color: 'var(--gold-light)' }}>{domainMeta.titleEn}</strong>
                </p>
              </div>

              <div className="glass-panel" style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  Your Question or Dilemma:
                </label>
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
                  }}
                  placeholder="e.g. What guidance should I keep in mind for my career transition?"
                />

                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--gold-primary)',
                  }}
                >
                  <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '4px' }}>
                    ✦ Question Gate Reframing Principle:
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', lineHeight: 1.5 }}>
                    Mazu temple lots act as reflective mirrors for sovereign agency rather than fortune-telling machines.
                    Closed binary questions (&ldquo;Will I get...&rdquo;) are gracefully reframed into action contemplations.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <button onClick={() => setCurrentStep('domain')} className="btn-outline">
                  ◄ Change Domain
                </button>
                <button onClick={handleProceedToDraw} className="btn-primary">
                  Begin Sacred Draw · 搖籤
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
                Drawing from Sixty Jiazi Lots...
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Client-assisted cryptographic entropy · Web Crypto API
              </p>
            </div>
          )}

          {/* ════ SCREEN 5 & 6: LOT REVEAL & FREE READING ═════════ */}
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
                          // Fallback to lot 01 or 17 if not yet generated
                          (e.target as HTMLImageElement).src = '/assets/cards/lot_01_card.jpg';
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      Card #{drawnLot.lot_number} · 2×2 Qin Seal ({drawnLot.ganzhi.zh})
                    </div>
                  </div>

                  {/* Right Column: Cultural Details & Verse */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--gold-primary)', letterSpacing: '0.15em', fontWeight: 700 }}>
                        LOT {String(drawnLot.lot_number).padStart(2, '0')} · {drawnLot.ganzhi.zh} ({drawnLot.ganzhi.pinyin})
                      </span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        Hexagram: {drawnLot.hexagram.name_zh}
                      </span>
                    </div>

                    <h2
                      className="font-serif gold-gradient-text"
                      style={{ fontSize: '2.1rem', margin: '8px 0 16px', lineHeight: 1.25 }}
                    >
                      {drawnLot.title.en}
                    </h2>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--gold-light)' }}>
                        Archetype: <strong>{drawnLot.title.zh}</strong>
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Element: <strong>{drawnLot.element_and_direction.element}</strong>
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Favorable: <strong>{drawnLot.element_and_direction.favorable_season}</strong>
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
                          POETIC VERSE (UNRHYMED TRANSLATION)
                        </span>
                        <button
                          onClick={() => setShowOriginalVerse(!showOriginalVerse)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--gold-light)',
                            fontSize: '0.84rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                          }}
                        >
                          {showOriginalVerse ? 'Hide 7-Char Verse' : '📜 View Original 7-Char Verse'}
                        </button>
                      </div>

                      {/* Poetic Verse Translation */}
                      <div style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.7, fontSize: '1.02rem' }}>
                        {drawnLot.verse?.lines?.map((line) => (
                          <p key={line.line_number} style={{ marginBottom: '6px' }}>
                            &ldquo;{line.en}&rdquo;
                          </p>
                        ))}
                      </div>

                      {/* On-Demand Original Chinese 7-Char Verse */}
                      {showOriginalVerse && (
                        <div
                          style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px dashed var(--border-gold)',
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

                    {/* Domain Guidance Line (Clean Single Language) */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.92rem', marginBottom: '6px' }}>
                        ✦ GUIDANCE FOR {domainMeta.titleEn.toUpperCase()}:
                      </div>
                      <p style={{ color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
                        &ldquo;
                        {drawnLot.guidance?.[selectedDomain]?.en || drawnLot.guidance?.general?.en || drawnLot.plain_meaning?.en}
                        &rdquo;
                      </p>
                    </div>

                    {/* Favorable vs Guarded Keywords */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                          • FAVOURABLE (吉)
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {((drawnLot.keywords?.favourable?.en || drawnLot.keywords?.favourable?.zh) ?? []).join(' · ')}
                        </p>
                      </div>
                      <div style={{ background: 'rgba(194, 59, 34, 0.08)', padding: '14px', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ color: '#E87A68', fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>
                          • GUARDED (忌)
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                          {((drawnLot.keywords?.guarded?.en || drawnLot.keywords?.guarded?.zh) ?? []).join(' · ')}
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
                            📜 HISTORICAL ALLUSION · {drawnLot.stories[0].title.zh}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            {drawnLot.stories[0].title.en}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
                          {drawnLot.stories[0].narrative.en}
                        </p>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gold-light)', fontStyle: 'italic' }}>
                          Poem Connection: &ldquo;{drawnLot.stories[0].poem_connection.en}&rdquo;
                        </div>
                      </div>
                    )}

                    {/* Hermeneutic Nuance Notes */}
                    {drawnLot.reading_notes && drawnLot.reading_notes.length > 0 && (
                      <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--gold-light)' }}>Hermeneutic Nuances:</strong>{' '}
                        {drawnLot.reading_notes.map((n) => `${n.term} (${n.pinyin}): ${n.en}`).join(' · ')}
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
                    ✦ CROSS-CALCULATE WITH YOUR PERSONAL NATAL CHART
                  </div>
                  <h3 className="font-serif gold-gradient-text" style={{ fontSize: '1.8rem', margin: '8px 0 12px' }}>
                    What Does Lot {drawnLot.lot_number} ({drawnLot.ganzhi.zh}) Say About YOUR Four Pillars?
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                    Every lot carries Heavenly Stem and Earthly Branch energies. Enter your birth details below to calculate
                    True Solar Time adjustments and uncover Day Master resonance (十神), branch interactions (刑衝合害), and 2026 Annual Pillar timing.
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
                        Birth Date
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
                        Birth Time
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
                        City / Longitude
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
                      <span>
                        I expressly request immediate delivery of my personalized digital report and acknowledge that I
                        waive my statutory 14-day right of withdrawal under EU Consumer Rights Directive (CRD Art. 16(m)).
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleUnlockReport}
                    disabled={isCheckingOut}
                    className="btn-primary"
                    style={{ padding: '16px 42px' }}
                  >
                    {isCheckingOut ? 'Calculating...' : 'Unlock Personalized Deep Report · $2.99'}
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
                    PERSONALIZED HEIRLOOM REPORT · 解籤合參
                  </div>
                  <h2 className="font-serif gold-gradient-text" style={{ fontSize: '2.4rem', margin: '10px 0' }}>
                    LOT {drawnLot.lot_number} ({drawnLot.ganzhi.zh}) × YOUR NATAL BA-ZI
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem' }}>
                    True Solar Adjusted Time: {new Date(unlockedReport.solarAdjustment.trueSolarTime).toLocaleDateString()} ·
                    Offset: {unlockedReport.solarAdjustment.offsetMinutes > 0 ? '+' : ''}
                    {unlockedReport.solarAdjustment.offsetMinutes} mins
                  </p>
                </div>

                {/* Four Pillars Table */}
                <div style={{ marginBottom: '36px' }}>
                  <div style={{ color: 'var(--gold-light)', fontWeight: 600, marginBottom: '12px' }}>
                    YOUR FOUR PILLARS (命盤四柱):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(7, 11, 17, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-gold)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>YEAR (年柱)</div>
                      <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                        {unlockedReport.pillars.year.pillar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unlockedReport.pillars.year.element}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(7, 11, 17, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-gold)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MONTH (月柱)</div>
                      <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                        {unlockedReport.pillars.month.pillar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unlockedReport.pillars.month.element}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '16px', borderRadius: '10px', border: '2px solid var(--gold-primary)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold-primary)', fontWeight: 700 }}>DAY MASTER (日主)</div>
                      <div style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 700, margin: '6px 0' }}>
                        {unlockedReport.pillars.day.pillar}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {unlockedReport.pillars.day.element}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(7, 11, 17, 0.7)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-gold)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>HOUR (時柱)</div>
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
                      1. {unlockedReport.interaction.dayMasterAffinity.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      Dynamic: {unlockedReport.interaction.dayMasterAffinity.dynamicEn}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                      {unlockedReport.interaction.dayMasterAffinity.descriptionEn}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 17, 0.6)', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--gold-primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px' }}>
                      2. {unlockedReport.interaction.pillarInteraction.titleEn}
                    </div>
                    <div style={{ color: 'var(--gold-light)', fontSize: '0.92rem', marginBottom: '8px' }}>
                      Dynamic: {unlockedReport.interaction.pillarInteraction.dynamicEn}
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
                    ◄ Return to Lot Card
                  </button>
                  <button onClick={() => alert('PDF generation pipeline ready (vector download).')} className="btn-primary">
                    📥 Download Heirloom PDF
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
                Preferences & Settings · 偏好設置
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
                Primary Language:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                style={{
                  width: '100%',
                  background: 'rgba(7, 11, 17, 0.9)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="en">English (US)</option>
                <option value="zh-TW">繁體中文 (Traditional - Mazu Temple)</option>
              </select>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '8px' }}>
                Text Display Mode:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    checked={displayMode === 'clean'}
                    onChange={() => setDisplayMode('clean')}
                  />
                  <span>
                    <strong>Clean Focused (Default)</strong>: Single language with key cultural anchors glossed.
                  </span>
                </label>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    checked={displayMode === 'bilingual'}
                    onChange={() => setDisplayMode('bilingual')}
                  />
                  <span>
                    <strong>Bilingual Study Mode (雙語對照)</strong>: Side-by-side Chinese verse and English translation.
                  </span>
                </label>
              </div>
            </div>

            <button onClick={() => setShowPreferences(false)} className="btn-primary" style={{ width: '100%' }}>
              Save & Apply Settings
            </button>
          </div>
        </div>
      )}

      {/* ─── SITE FOOTER ────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '28px 0', textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
        <div className="container">
          <p style={{ marginBottom: '8px' }}>
            Cultural heritage and reflective guidance — not a prediction of deterministic events.
          </p>
          <p>© 2026 Mazu Heritage Project · Philological Sixty Jiazi Canon · CRD Art. 16(m) Verified</p>
        </div>
      </footer>
    </div>
  );
}
