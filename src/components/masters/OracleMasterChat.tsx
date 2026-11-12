'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  OracleMaster,
  SeekerQuotaStatus,
  MasterChatMessage,
} from '@/lib/types/masters';
import { DOMAINS } from '@/lib/lots/domains';
import { DomainCategory } from '@/lib/types/lots';
import { SupportedLanguage } from '@/lib/i18n/translations';

interface OracleMasterChatProps {
  language: SupportedLanguage;
  userId?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  longitude?: number;
  timezoneOffset?: number;
  lotNumber?: number;
  selectedDomain?: DomainCategory;
  hasUnlockedReport?: boolean;
  onBirthInfoChange?: (birthDate: string, birthTime: string) => void;
}

export function OracleMasterChat({
  language,
  userId = 'seeker_1992',
  birthDate,
  birthTime,
  birthCity = 'Taipei',
  longitude = 121.57,
  timezoneOffset = 8,
  lotNumber = 1,
  selectedDomain = 'career',
  onBirthInfoChange,
}: OracleMasterChatProps) {
  const isZh = language === 'zh-TW';

  const [masters, setMasters] = useState<OracleMaster[]>([]);
  const [selectedMaster, setSelectedMaster] = useState<OracleMaster | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<SeekerQuotaStatus | null>(null);
  const [messages, setMessages] = useState<MasterChatMessage[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Registration & Birth Info Gate Form State
  const [showGateForm, setShowGateForm] = useState(false);
  const [gateTab, setGateTab] = useState<'birth' | 'register'>('birth');
  const [localBirthDate, setLocalBirthDate] = useState(birthDate || '');
  const [localBirthTime, setLocalBirthTime] = useState(birthTime || '09:30');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [savingGate, setSavingGate] = useState(false);

  // Top-up / Payment State
  const [isToppingUp, setIsToppingUp] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync external birthDate prop if updated in parent
  useEffect(() => {
    if (birthDate) setLocalBirthDate(birthDate);
    if (birthTime) setLocalBirthTime(birthTime);
  }, [birthDate, birthTime]);

  const fetchMastersAndQuota = useCallback(async () => {
    try {
      const [mRes, qRes] = await Promise.all([
        fetch('/api/masters'),
        fetch(
          `/api/masters/quota?userId=${encodeURIComponent(userId)}${
            localBirthDate ? `&birthDate=${encodeURIComponent(localBirthDate)}&birthTime=${encodeURIComponent(localBirthTime)}&birthCity=${encodeURIComponent(birthCity)}` : ''
          }`
        ),
      ]);
      const mData = await mRes.json();
      const qData = await qRes.json();

      if (mData.success && Array.isArray(mData.masters) && mData.masters.length > 0) {
        setMasters(mData.masters);
        setSelectedMaster((prev) => {
          if (prev) {
            return mData.masters.find((m: OracleMaster) => m.id === prev.id) || mData.masters[0];
          }
          // Pick master whose allowedDomains includes selectedDomain if possible
          const matched = mData.masters.find((m: OracleMaster) =>
            m.confinedTopics.allowedDomains.includes(selectedDomain)
          );
          return matched || mData.masters[0];
        });
      }

      if (qData.success && qData.quotaStatus) {
        setQuotaStatus(qData.quotaStatus);
        if (Array.isArray(qData.history)) {
          setMessages(qData.history);
        }
      }
    } catch (err) {
      console.error('Failed loading masters or quota:', err);
    }
  }, [userId, localBirthDate, localBirthTime, birthCity, selectedDomain]);

  useEffect(() => {
    fetchMastersAndQuota();
  }, [fetchMastersAndQuota]);

  const handleSaveEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGate(true);
    setErrorBanner(null);
    try {
      const payload: Record<string, any> = {
        userId,
        birthCity,
        longitude,
        timezoneOffset,
      };

      if (gateTab === 'birth') {
        if (!localBirthDate) {
          setErrorBanner(isZh ? '請選擇您的出生日期' : 'Please select your birth date.');
          setSavingGate(false);
          return;
        }
        payload.birthDate = localBirthDate;
        payload.birthTime = localBirthTime || '12:00';
        if (onBirthInfoChange) {
          onBirthInfoChange(localBirthDate, localBirthTime || '12:00');
        }
      } else {
        if (!regEmail.trim() || !regName.trim()) {
          setErrorBanner(
            isZh ? '請輸入您的稱呼與電子信箱以完成善信註冊' : 'Please enter your name and email to register.'
          );
          setSavingGate(false);
          return;
        }
        payload.displayName = regName.trim();
        payload.email = regEmail.trim();
        payload.isRegistered = true;
        if (localBirthDate) {
          payload.birthDate = localBirthDate;
          payload.birthTime = localBirthTime || '12:00';
        }
      }

      const res = await fetch('/api/masters/quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.quotaStatus) {
        setQuotaStatus(data.quotaStatus);
        setShowGateForm(false);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed saving profile');
    } finally {
      setSavingGate(false);
    }
  };

  const handlePurchaseTopUp = async (itemType: 'master_pack' | 'subscription') => {
    setIsToppingUp(true);
    setTopUpSuccess(null);
    setErrorBanner(null);
    try {
      // Ensure seeker is eligible first; if not, auto-save default birthDate if present
      if (!quotaStatus?.isEligibleToChat) {
        const bDate = localBirthDate || '1992-10-14';
        setLocalBirthDate(bDate);
        await fetch('/api/masters/quota', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            birthDate: bDate,
            birthTime: localBirthTime || '09:30',
            birthCity,
            longitude,
            timezoneOffset,
          }),
        });
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail: quotaStatus?.profile?.email || regEmail || 'seeker@example.com',
          lotNumber,
          itemType,
          crdWaiverAccepted: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchMastersAndQuota();
        const addedCount =
          itemType === 'subscription'
            ? quotaStatus?.policy.monthlySubscriberQuota || 30
            : quotaStatus?.policy.paidSinglePaymentQuota || 3;
        setTopUpSuccess(
          isZh
            ? itemType === 'subscription'
              ? `✓ 已成功開通流年月費訂閱會員！本月獲贈 ${addedCount} 次宗師深度問答額度。`
              : `✓ 單次付費成功！已為您累加 +${addedCount} 次宗師深度問答額度。`
            : itemType === 'subscription'
            ? `✓ Monthly Subscription Active! Granted ${addedCount} Master consultation questions/month.`
            : `✓ Payment Confirmed! Added +${addedCount} Master consultation questions to your balance.`
        );
        setTimeout(() => setTopUpSuccess(null), 5000);
      } else {
        setErrorBanner(data.error || 'Checkout failed');
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Payment failed');
    } finally {
      setIsToppingUp(false);
    }
  };

  const handleSendQuestion = async (customQ?: string) => {
    const qToSend = (customQ !== undefined ? customQ : questionInput).trim();
    if (!qToSend || !selectedMaster || isSending) return;

    setIsSending(true);
    setErrorBanner(null);

    try {
      const res = await fetch('/api/masters/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          masterId: selectedMaster.id,
          question: qToSend,
          birthDate: localBirthDate || quotaStatus?.profile?.birthDate,
          birthTime: localBirthTime || quotaStatus?.profile?.birthTime,
          birthCity,
          longitude,
          timezoneOffset,
          lotNumber,
          selectedDomain,
          language,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.quotaStatus) {
          setQuotaStatus(data.quotaStatus);
        }
        if (data.code === 'ELIGIBILITY_REQUIRED') {
          setShowGateForm(true);
        }
        setErrorBanner(data.error || (isZh ? '無法發送提問' : 'Unable to send inquiry.'));
        return;
      }

      setQuestionInput('');
      setQuotaStatus(data.quotaStatus);
      setMessages((prev) => [...prev, data.userMessage, data.masterMessage]);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    } catch (err: any) {
      setErrorBanner(err.message || 'Network error');
    } finally {
      setIsSending(false);
    }
  };

  const getDomainBadgeLabel = (domKey: DomainCategory) => {
    const meta = DOMAINS.find((d) => d.key === domKey);
    if (!meta) return domKey;
    return `${meta.icon} ${isZh ? meta.titleZh : meta.titleEn}`;
  };

  const filteredMessages = selectedMaster
    ? messages.filter((m) => m.masterId === selectedMaster.id)
    : messages;

  const currentYear = new Date().getFullYear();
  const futureHorizon = quotaStatus?.policy.futureYearsHorizon ?? 2;
  const endYear = currentYear + futureHorizon;

  // Quick sample questions tailored to selected Master's confined domains
  const getQuickPrompts = (master: OracleMaster): string[] => {
    if (master.id === 'master_cihang') {
      return isZh
        ? [
            `結合我的日支夫妻宮與第 ${lotNumber} 籤，今年感情與伴侶關係應如何增進共鳴？`,
            `依我命盤五行與時柱氣機，近期身心睡眠與家宅安寧需注意什麼？`,
          ]
        : [
            `Based on my Spouse Palace and Lot #${lotNumber}, how should I nurture my relationship this year?`,
            `According to my Five Elements and Hour Pillar, how can I restore vitality and household harmony?`,
          ];
    }
    if (master.id === 'master_tianji') {
      return isZh
        ? [
            `依我月柱提綱與第 ${lotNumber} 籤，${currentYear}–${endYear} 年我的職涯破局與財庫攻守最佳時機為何？`,
            `我近期面臨跨國發展與投資決策，命盤財庫與驛馬星有何戰略指引？`,
          ]
        : [
            `With my Month Pillar and Lot #${lotNumber}, what is my optimal ${currentYear}–${endYear} window for career and wealth?`,
            `What do my Four Treasuries and Sky Horse stars counsel regarding relocation or new ventures?`,
          ];
    }
    return isZh
      ? [
          `請玄真宗師合參我的日主八字與第 ${lotNumber} 籤，指點我今年事業功名與人生大局的行止方略。`,
          `${currentYear}–${endYear} 歲君流年與我的命盤四柱有何生剋應期？哪個節氣最適合重大決斷？`,
        ]
      : [
          `Master Xuanzhen, please synthesize my Day Master and Lot #${lotNumber} for my overarching career and life path.`,
          `How do the ${currentYear}–${endYear} annual pillars interact with my Four Pillars, and when is my best action window?`,
        ];
  };

  if (!selectedMaster) {
    return null;
  }

  return (
    <div
      className="glass-panel"
      style={{
        padding: 'clamp(18px, 3.5vw, 30px)',
        border: '1px solid var(--gold-primary)',
        background: 'linear-gradient(180deg, rgba(10, 15, 24, 0.95) 0%, rgba(5, 8, 14, 0.98) 100%)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
        textAlign: 'left',
      }}
    >
      {/* ─── HEADER & TIER QUOTA BAR ─────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '14px',
          paddingBottom: '18px',
          borderBottom: '1px solid var(--border-gold)',
          marginBottom: '20px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: 'rgba(212, 175, 55, 0.2)',
                color: 'var(--gold-primary)',
                border: '1px solid var(--gold-primary)',
                letterSpacing: '0.08em',
              }}
            >
              {isZh ? '✦ 宗師在線問答 · RAG 命理知識庫' : '✦ AI ORACLE MASTERS · RAG PERSONALIZATION ENGINE'}
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontFamily: 'monospace',
              }}
            >
              {isZh ? '二階段輕量意圖守門已啟用' : '2-Stage Intent Guardrail Active'}
            </span>
          </div>
          <h3 className="font-serif gold-gradient-text" style={{ fontSize: 'clamp(1.35rem, 3vw, 1.7rem)', margin: '4px 0' }}>
            {isZh ? '聖殿宗師親算與籤命合參問答' : 'Consult the Sanctuary Oracle Masters'}
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
            {isZh
              ? '每位宗師皆通曉您的真太陽時四柱八字、十神宮位、九章命書與所抽靈籤，並嚴格於專屬限定事類內授道解惑。'
              : 'Each Master knows your True Solar BaZi chart, Ten Gods, Drawn Lot, and 9-Section Life Book inside out, counseling strictly within their confined domains.'}
          </p>
        </div>

        {/* Live Quota & Eligibility Status Box */}
        {quotaStatus && (
          <div
            style={{
              background: 'rgba(7, 11, 17, 0.85)',
              border: '1px solid var(--border-gold)',
              borderRadius: '12px',
              padding: '12px 16px',
              minWidth: '250px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isZh ? '當前善信席位：' : 'Seeker Tier:'}
              </span>
              <span
                style={{
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: quotaStatus.isEligibleToChat ? 'var(--gold-light)' : '#E87A68',
                }}
              >
                {isZh ? quotaStatus.tierLabelZh : quotaStatus.tierLabelEn}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {isZh ? '剩餘可問次數：' : 'Questions Remaining:'}
              </span>
              <span
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: quotaStatus.remainingQuestions > 0 ? '#2ecc71' : '#e74c3c',
                  fontFamily: 'monospace',
                }}
              >
                {quotaStatus.remainingQuestions} / {quotaStatus.totalAllowedQuestions}
              </span>
            </div>

            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(212,175,55,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <span>
                {isZh
                  ? `免費:${quotaStatus.policy.unpaidQuota}問 · 單次付費:+${quotaStatus.policy.paidSinglePaymentQuota}問 · 月訂:${quotaStatus.policy.monthlySubscriberQuota}問`
                  : `Free:${quotaStatus.policy.unpaidQuota}Q · Paid:+${quotaStatus.policy.paidSinglePaymentQuota}Q/pay · Sub:${quotaStatus.policy.monthlySubscriberQuota}Q/mo`}
              </span>
              <button
                type="button"
                onClick={() => setShowGateForm(!showGateForm)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--gold-primary)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  padding: 0,
                }}
              >
                {isZh ? '生辰/註冊設定' : 'Birth / Profile'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── REGISTRATION / BIRTH INFO ELIGIBILITY GATE PANEL ──────────── */}
      {(showGateForm || (quotaStatus && !quotaStatus.isEligibleToChat)) && (
        <div
          style={{
            marginBottom: '20px',
            padding: '18px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid var(--gold-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.95rem' }}>
              🔒 {isZh ? '宗師問答准入核驗（需填寫生辰八字或註冊善信帳號）' : 'Master Sanctuary Access Gate (Specify Birth Info or Register)'}
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setGateTab('birth')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  border: '1px solid var(--gold-primary)',
                  background: gateTab === 'birth' ? 'var(--gold-primary)' : 'transparent',
                  color: gateTab === 'birth' ? '#070B11' : 'var(--gold-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isZh ? '1. 填寫生辰八字' : '1. Specify Birth Info'}
              </button>
              <button
                type="button"
                onClick={() => setGateTab('register')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  border: '1px solid var(--gold-primary)',
                  background: gateTab === 'register' ? 'var(--gold-primary)' : 'transparent',
                  color: gateTab === 'register' ? '#070B11' : 'var(--gold-light)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isZh ? '2. 善信帳號註冊' : '2. Seeker Registration'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveEligibility} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
            {gateTab === 'birth' ? (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {isZh ? '出生公曆日期 (Birth Date)：' : 'Birth Date (Gregorian):'}
                  </label>
                  <input
                    type="date"
                    required
                    value={localBirthDate}
                    onChange={(e) => setLocalBirthDate(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(7, 11, 17, 0.9)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {isZh ? '出生時間 (Birth Time)：' : 'Birth Time:'}
                  </label>
                  <input
                    type="time"
                    value={localBirthTime}
                    onChange={(e) => setLocalBirthTime(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(7, 11, 17, 0.9)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {isZh ? '善信稱呼 (Display Name)：' : 'Your Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={isZh ? '例：林居士' : 'e.g. Alex Lin'}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(7, 11, 17, 0.9)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {isZh ? '電子信箱 (Email)：' : 'Email Address:'}
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seeker@example.com"
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: 'rgba(7, 11, 17, 0.9)',
                      border: '1px solid var(--border-gold)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={savingGate}
              className="btn-primary"
              style={{ padding: '9px 20px', fontSize: '0.86rem' }}
            >
              {savingGate
                ? isZh
                  ? '正在立盤核驗...'
                  : 'Verifying...'
                : isZh
                ? '✓ 確認並開啟宗師問答'
                : '✓ Verify & Unlock Master Chat'}
            </button>
          </form>
        </div>
      )}

      {/* ─── STEP 1: CHOOSE AN ONLINE ORACLE MASTER ────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.06em' }}>
          {isZh ? '請選擇坐鎮宗師（每位宗師具專屬性格與限定論道範疇）：' : 'SELECT AN ORACLE MASTER (EACH WITH PREDEFINED PERSONA, RAG & CONFINED CATEGORIES):'}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px',
          }}
        >
          {masters.map((m) => {
            const isSelected = selectedMaster.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMaster(m)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isSelected ? 'rgba(212, 175, 55, 0.14)' : 'rgba(7, 11, 17, 0.7)',
                  border: isSelected ? '2px solid var(--gold-primary)' : '1px solid rgba(212, 175, 55, 0.25)',
                  boxShadow: isSelected ? '0 0 20px rgba(212, 175, 55, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: m.avatarGradient || 'linear-gradient(135deg, #D4AF37, #7A5C12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontFamily: 'var(--font-chinese)',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      border: '1px solid var(--gold-light)',
                      flexShrink: 0,
                    }}
                  >
                    {m.sealCharacter || '師'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--gold-light)', fontSize: '1rem' }}>
                      {isZh ? m.nameZh : m.nameEn}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {isZh ? m.titleZh : m.titleEn}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '10px' }}>
                  {isZh ? m.taglineZh : m.taglineEn}
                </p>

                {/* Confined Categories Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {m.confinedTopics.allowedDomains.map((domKey) => (
                    <span
                      key={domKey}
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 7px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--gold-light)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                      }}
                    >
                      {getDomainBadgeLabel(domKey)}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SELECTED MASTER PERSONA & RAG KNOWLEDGE SUMMARY BAR ─────── */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(7, 11, 17, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.22)',
          marginBottom: '16px',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div>
          <strong style={{ color: 'var(--gold-primary)' }}>
            {isZh ? `【${selectedMaster.nameZh} · 性格與語調】：` : `[${selectedMaster.nameEn} · Persona & Tone]: `}
          </strong>
          {isZh ? selectedMaster.characteristics.personalityZh : selectedMaster.characteristics.personalityEn}
          {' · '}
          <span style={{ color: 'var(--gold-light)' }}>
            ({isZh ? selectedMaster.characteristics.toneZh : selectedMaster.characteristics.toneEn})
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <strong style={{ color: 'var(--gold-primary)' }}>
            {isZh ? '【已掛載 RAG 命理知識庫】：' : '[Active RAG Knowledge Base]:'}
          </strong>
          {selectedMaster.ragConfig.includeBaziChart && (
            <span style={{ padding: '1px 8px', borderRadius: '6px', background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71', fontSize: '0.74rem' }}>
              ✓ {isZh ? '真太陽時四柱八字' : 'True Solar 4 Pillars'}
            </span>
          )}
          {selectedMaster.ragConfig.includeTenGodsAndPalaces && (
            <span style={{ padding: '1px 8px', borderRadius: '6px', background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71', fontSize: '0.74rem' }}>
              ✓ {isZh ? '十神與夫妻/財庫宮位' : 'Ten Gods & Palaces'}
            </span>
          )}
          {selectedMaster.ragConfig.includeDrawnLot && (
            <span style={{ padding: '1px 8px', borderRadius: '6px', background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71', fontSize: '0.74rem' }}>
              ✓ {isZh ? `第 ${lotNumber} 籤詩與典故` : `Lot #${lotNumber} Verse & Allusion`}
            </span>
          )}
          {selectedMaster.ragConfig.includeLifeBook && (
            <span style={{ padding: '1px 8px', borderRadius: '6px', background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71', fontSize: '0.74rem' }}>
              ✓ {isZh ? '九章全案命書' : '9-Section Life Book'}
            </span>
          )}
          {selectedMaster.ragConfig.includeTransits && (
            <span style={{ padding: '1px 8px', borderRadius: '6px', background: 'rgba(46, 204, 113, 0.12)', color: '#2ecc71', fontSize: '0.74rem' }}>
              ✓ {isZh ? `${currentYear}–${endYear} 動態流年與節氣` : `${currentYear}–${endYear} Dynamic Transits`}
            </span>
          )}
          {selectedMaster.ragConfig.customKnowledgeDocs?.length > 0 && (
            <span style={{ padding: '1px 8px', borderRadius: '6px', background: 'rgba(212, 175, 55, 0.18)', color: 'var(--gold-light)', fontSize: '0.74rem' }}>
              ✓ {isZh ? `${selectedMaster.ragConfig.customKnowledgeDocs.length} 部宗師秘傳典籍` : `${selectedMaster.ragConfig.customKnowledgeDocs.length} Custom Canon Docs`}
            </span>
          )}
        </div>
      </div>

      {/* ─── CHAT MESSAGE STREAM ───────────────────────────────────────── */}
      <div
        style={{
          background: 'rgba(5, 8, 14, 0.85)',
          border: '1px solid var(--border-gold)',
          borderRadius: '12px',
          padding: '18px',
          maxHeight: '460px',
          overflowY: 'auto',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Master Initial Greeting */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: selectedMaster.avatarGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontFamily: 'var(--font-chinese)',
              fontWeight: 800,
              fontSize: '0.95rem',
              flexShrink: 0,
            }}
          >
            {selectedMaster.sealCharacter}
          </div>
          <div
            style={{
              background: 'rgba(20, 28, 43, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '0 12px 12px 12px',
              padding: '12px 16px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: 1.65,
              maxWidth: '88%',
            }}
          >
            <div style={{ fontSize: '0.76rem', color: 'var(--gold-primary)', fontWeight: 700, marginBottom: '4px' }}>
              {isZh ? selectedMaster.nameZh : selectedMaster.nameEn}
            </div>
            <div>{isZh ? selectedMaster.characteristics.greetingZh : selectedMaster.characteristics.greetingEn}</div>
          </div>
        </div>

        {/* Conversation History for Selected Master */}
        {filteredMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  background: isUser
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.24) 0%, rgba(140, 105, 20, 0.25) 100%)'
                    : msg.intentStatus === 'allowed'
                    ? 'rgba(20, 28, 43, 0.9)'
                    : 'rgba(194, 59, 34, 0.14)',
                  border: isUser
                    ? '1px solid var(--gold-primary)'
                    : msg.intentStatus === 'allowed'
                    ? '1px solid rgba(212, 175, 55, 0.35)'
                    : '1px solid rgba(232, 122, 104, 0.5)',
                  borderRadius: isUser ? '12px 0 12px 12px' : '0 12px 12px 12px',
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.68,
                  maxWidth: '90%',
                  whiteSpace: 'pre-line',
                }}
              >
                {!isUser && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--gold-primary)', fontWeight: 700 }}>
                      {isZh ? selectedMaster.nameZh : selectedMaster.nameEn}
                    </span>
                    {msg.stage1Meta && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '1px 7px',
                          borderRadius: '8px',
                          background: msg.stage1Meta.isAllowed
                            ? 'rgba(46, 204, 113, 0.15)'
                            : 'rgba(231, 76, 60, 0.2)',
                          color: msg.stage1Meta.isAllowed ? '#2ecc71' : '#ff7675',
                        }}
                      >
                        {msg.stage1Meta.isAllowed
                          ? isZh
                            ? `✓ 第一階段輕量AI核准：${getDomainBadgeLabel(msg.stage1Meta.detectedDomain)} (${msg.stage1Meta.latencyMs}ms)`
                            : `✓ Stage-1 Intent Verified: ${msg.stage1Meta.detectedDomain} (${msg.stage1Meta.latencyMs}ms)`
                          : isZh
                          ? `⚠️ 限定範疇守門攔截（未扣額度）`
                          : `⚠️ Confined Topic Guardrail (0 Quota Charged)`}
                      </span>
                    )}
                  </div>
                )}

                <div>{msg.content}</div>

                {/* Quick button to switch Master if Stage 1 recommended another Master */}
                {!isUser && msg.stage1Meta?.suggestedMasterId && (
                  <div style={{ marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const target = masters.find((m) => m.id === msg.stage1Meta?.suggestedMasterId);
                        if (target) setSelectedMaster(target);
                      }}
                      className="btn-outline"
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        borderColor: 'var(--gold-primary)',
                        color: 'var(--gold-light)',
                      }}
                    >
                      ⇄ {isZh ? `立即切換至【${msg.stage1Meta.suggestedMasterNameZh}】席位` : `Switch to ${msg.stage1Meta.suggestedMasterNameEn}`}
                    </button>
                  </div>
                )}

                {/* RAG Knowledge Base Sources Used Badges */}
                {!isUser && msg.ragSources && msg.ragSources.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px dashed rgba(212, 175, 55, 0.22)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {isZh ? '📊 本次調用 RAG 引擎知識源：' : '📊 Personalization RAG Sources:'}
                    </span>
                    {msg.ragSources.map((src) => (
                      <span
                        key={src.key}
                        title={isZh ? src.summaryZh : src.summaryEn}
                        style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: 'rgba(212, 175, 55, 0.12)',
                          color: 'var(--gold-light)',
                          border: '1px solid rgba(212, 175, 55, 0.28)',
                        }}
                      >
                        {isZh ? src.labelZh : src.labelEn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={chatEndRef} />
      </div>

      {/* ─── QUICK CONFINED-CATEGORY SUGGESTION PROMPTS ────────────────── */}
      <div style={{ marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
          {isZh ? '快捷請益範例：' : 'Suggested Inquiries:'}
        </span>
        {getQuickPrompts(selectedMaster).map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuestionInput(sample)}
            style={{
              background: 'rgba(212, 175, 55, 0.1)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '14px',
              padding: '4px 10px',
              color: 'var(--gold-light)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            ✦ {sample.length > 42 ? sample.slice(0, 42) + '...' : sample}
          </button>
        ))}
      </div>

      {/* ─── ERROR / TOP-UP STATUS BANNERS ─────────────────────────────── */}
      {errorBanner && (
        <div
          style={{
            marginBottom: '12px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(194, 59, 34, 0.16)',
            border: '1px solid rgba(232, 122, 104, 0.6)',
            color: '#ff9b8a',
            fontSize: '0.84rem',
          }}
        >
          ⚠️ {errorBanner}
        </div>
      )}

      {topUpSuccess && (
        <div
          style={{
            marginBottom: '12px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(46, 204, 113, 0.15)',
            border: '1px solid rgba(46, 204, 113, 0.5)',
            color: '#2ecc71',
            fontSize: '0.84rem',
            fontWeight: 600,
          }}
        >
          {topUpSuccess}
        </div>
      )}

      {/* ─── INPUT BAR & QUOTA TOP-UP BUTTONS ──────────────────────────── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={questionInput}
          onChange={(e) => setQuestionInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendQuestion();
            }
          }}
          placeholder={
            isZh
              ? `向【${selectedMaster.nameZh}】請益（僅限：${selectedMaster.confinedTopics.allowedDomains.map(getDomainBadgeLabel).join('、')}）...`
              : `Ask ${selectedMaster.nameEn} (Confined to: ${selectedMaster.confinedTopics.allowedDomains.join(', ')})...`
          }
          style={{
            flex: 1,
            minWidth: '240px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(7, 11, 17, 0.9)',
            border: '1px solid var(--border-gold)',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={() => handleSendQuestion()}
          disabled={isSending || !questionInput.trim()}
          className="btn-primary"
          style={{
            padding: '12px 24px',
            fontSize: '0.92rem',
            opacity: isSending || !questionInput.trim() ? 0.6 : 1,
          }}
        >
          {isSending
            ? isZh
              ? '宗師推演中...'
              : 'Consulting...'
            : isZh
            ? `虔誠叩問 · 呈遞${selectedMaster.nameZh}`
            : `Ask ${selectedMaster.nameEn}`}
        </button>
      </div>

      {/* ─── QUOTA RECHARGE / SUBSCRIPTION UPGRADE BAR ─────────────────── */}
      {quotaStatus && (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '14px',
            borderTop: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {isZh
              ? `💡 提問規則：未付費善信可問 ${quotaStatus.policy.unpaidQuota} 題 · 單次付費每次獲 +${quotaStatus.policy.paidSinglePaymentQuota} 題 · 月費訂閱會員每月享 ${quotaStatus.policy.monthlySubscriberQuota} 題`
              : `💡 Quota Rules: Unpaid = ${quotaStatus.policy.unpaidQuota} Q · Paid = +${quotaStatus.policy.paidSinglePaymentQuota} Qs per payment · Monthly Subscriber = ${quotaStatus.policy.monthlySubscriberQuota} Qs/mo`}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={isToppingUp}
              onClick={() => handlePurchaseTopUp('master_pack')}
              className="btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                borderColor: 'var(--gold-primary)',
                color: 'var(--gold-light)',
              }}
            >
              {isZh
                ? `⚡ 單次付費加購 (+${quotaStatus.policy.paidSinglePaymentQuota} 問 · $2.99)`
                : `⚡ Single Pay (+${quotaStatus.policy.paidSinglePaymentQuota} Questions · $2.99)`}
            </button>

            {!quotaStatus.isMonthlySubscriber && (
              <button
                type="button"
                disabled={isToppingUp}
                onClick={() => handlePurchaseTopUp('subscription')}
                className="btn-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                }}
              >
                {isZh
                  ? `👑 升級月費訂閱 (${quotaStatus.policy.monthlySubscriberQuota} 問/月 · $9.99)`
                  : `👑 Monthly Subscriber (${quotaStatus.policy.monthlySubscriberQuota} Qs/mo · $9.99)`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

