'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, LogOut, CheckCircle, AlertCircle, RefreshCw, 
  Search, Edit3, BookOpen, Compass, Cpu, Settings, Users, Save, Eye, EyeOff, Zap, ExternalLink
} from 'lucide-react';
import type { CanonicalLot, VerseLine, StoryInfo, DomainCategory } from '@/lib/types/lots';
import type { ChapterRule, SolarTermRule, AstrologyRules } from '@/lib/bazi/astrologyRules';
import type { OracleMaster, MasterQuotaPolicy, MasterKnowledgeDoc } from '@/lib/types/masters';
import { DOMAINS } from '@/lib/lots/domains';

interface AdminPortalProps {
  currentDirective: string;
  initialAuthenticated?: boolean;
  initialUsername?: string | null;
  initialHasAdmins?: boolean;
  initialLots?: CanonicalLot[];
}

export function AdminPortal({ 
  currentDirective = '/mod',
  initialAuthenticated = false,
  initialUsername = null,
  initialHasAdmins = true,
  initialLots = [],
}: AdminPortalProps) {
  // Auth state
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [username, setUsername] = useState<string | null>(initialUsername);
  const [hasAdmins, setHasAdmins] = useState(initialHasAdmins);

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Dashboard active tab
  const [activeTab, setActiveTab] = useState<'lots' | 'astrology' | 'masters' | 'config' | 'admins'>('lots');

  // AI Oracle Masters & Quotas state
  const [masters, setMasters] = useState<OracleMaster[]>([]);
  const [masterPolicy, setMasterPolicy] = useState<MasterQuotaPolicy>({
    requireBirthOrRegistration: true,
    unpaidQuota: 1,
    paidSinglePaymentQuota: 3,
    monthlySubscriberQuota: 30,
    chargeOnRejectedIntent: false,
    enableLightweightClassifier: true,
    lightweightModelName: 'auto',
    intentMaxTokens: 120,
  });
  const [masterStats, setMasterStats] = useState<{ totalMessages: number; chargedQuestions: number; rejectedByStage1: number }>({
    totalMessages: 0,
    chargedQuestions: 0,
    rejectedByStage1: 0,
  });
  const [editingMaster, setEditingMaster] = useState<OracleMaster | null>(null);
  const [savingMaster, setSavingMaster] = useState(false);
  const [masterMsg, setMasterMsg] = useState<string | null>(null);
  const [activeMasterSubTab, setActiveMasterSubTab] = useState<'personas' | 'quotas' | 'simulator'>('personas');

  // Master Sandbox Simulator state
  const [simMasterId, setSimMasterId] = useState('master_xuanzhen');
  const [simQuestion, setSimQuestion] = useState('2026年丙午流年，我的事業晉升與財庫運籌應如何把握時機？');
  const [simLotNumber, setSimLotNumber] = useState(1);
  const [simBirthDate, setSimBirthDate] = useState('1992-10-14');
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<any>(null);

  // Lots state
  const [lots, setLots] = useState<CanonicalLot[]>(initialLots);
  const [loadingLots, setLoadingLots] = useState(false);
  const [selectedLot, setSelectedLot] = useState<CanonicalLot | null>(null);
  const [lotSearch, setLotSearch] = useState('');
  const [savingLot, setSavingLot] = useState(false);
  const [lotSuccessMsg, setLotSuccessMsg] = useState<string | null>(null);

  // Astrology rules state
  const [rules, setRules] = useState<AstrologyRules | null>(null);
  const [loadingRules, setLoadingRules] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [rulesSuccessMsg, setRulesSuccessMsg] = useState<string | null>(null);
  const [activeAstroSubTab, setActiveAstroSubTab] = useState<'chapters' | 'terms'>('chapters');

  // Directive & System Config state
  const [adminUrlPath, setAdminUrlPath] = useState(currentDirective || '/mod');
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [formConfigs, setFormConfigs] = useState<Record<string, string>>({});
  const [showConfigSecret, setShowConfigSecret] = useState<Record<string, boolean>>({});
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccessMsg, setConfigSuccessMsg] = useState<string | null>(null);
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<any>(null);

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUnauthorized = () => {
    setAuthenticated(false);
    setUsername(null);
    setLoginError('Your admin session has expired. Please log in again.');
  };

  // Check auth on mount if initial state was unverified
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/me');
      const data = await res.json();
      setAuthenticated(data.authenticated === true);
      setUsername(data.username || null);
      setHasAdmins(data.hasAdmins ?? true);
      if (data.adminUrlPath) {
        setAdminUrlPath(data.adminUrlPath);
      }
    } catch {
      setAuthenticated(false);
    }
  };

  useEffect(() => {
    if (!initialAuthenticated) {
      checkAuth();
    }
  }, [initialAuthenticated]);

  // Fetch Lots
  const fetchLots = async () => {
    setLoadingLots(true);
    try {
      const res = await fetch('/api/admin/lots');
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success && data.lots) {
        setLots(data.lots);
      }
    } catch (err) {
      console.error('Failed fetching lots:', err);
    } finally {
      setLoadingLots(false);
    }
  };

  // Fetch Astrology Rules
  const fetchRules = async () => {
    setLoadingRules(true);
    try {
      const res = await fetch('/api/admin/astrology');
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success && data.rules) {
        setRules(data.rules);
      }
    } catch (err) {
      console.error('Failed fetching rules:', err);
    } finally {
      setLoadingRules(false);
    }
  };

  // Fetch Config
  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success && data.configs) {
        setConfigs(data.configs);
        const initialForm: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.configs as Record<string, any>)) {
          initialForm[k] = v.isSecret ? '' : (v.value || '');
        }
        setFormConfigs(initialForm);
        if (data.configs.ADMIN_URL_PATH?.value) {
          setAdminUrlPath(data.configs.ADMIN_URL_PATH.value);
        }
      }
    } catch (err) {
      console.error('Failed fetching configs:', err);
    }
  };

  // Fetch Admin Users
  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success && data.users) {
        setAdminUsers(data.users);
      }
    } catch (err) {
      console.error('Failed fetching admin users:', err);
    }
  };

  // Fetch AI Oracle Masters & Quota Policy
  const fetchMastersAdmin = async () => {
    try {
      const res = await fetch('/api/admin/masters');
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        if (data.masters) setMasters(data.masters);
        if (data.policy) setMasterPolicy(data.policy);
        if (data.stats) setMasterStats(data.stats);
      }
    } catch (err) {
      console.error('Failed fetching masters admin:', err);
    }
  };

  useEffect(() => {
    if (authenticated) {
      if (lots.length === 0) {
        fetchLots();
      }
      fetchRules();
      fetchMastersAdmin();
      fetchConfigs();
      fetchAdminUsers();
    }
  }, [authenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
        setUsername(data.username);
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setUsername(null);
  };

  const handleSaveLot = async () => {
    if (!selectedLot) return;
    setSavingLot(true);
    setLotSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lot: selectedLot }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setLotSuccessMsg(`✓ Lot #${selectedLot.lot_number} saved and compiled successfully.`);
        // Update in list
        setLots((prev) => prev.map((l) => (l.lot_number === selectedLot.lot_number ? selectedLot : l)));
        setTimeout(() => setLotSuccessMsg(null), 3500);
      } else {
        alert(data.error || 'Failed to save lot.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed saving lot.');
    } finally {
      setSavingLot(false);
    }
  };

  const handleSaveRules = async () => {
    if (!rules) return;
    setSavingRules(true);
    setRulesSuccessMsg(null);
    try {
      const res = await fetch('/api/admin/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRulesSuccessMsg('✓ Astrological Life Book and Transit rules successfully updated.');
        setTimeout(() => setRulesSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed saving rules');
    } finally {
      setSavingRules(false);
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setConfigSuccessMsg(null);
    try {
      const updates: Record<string, string> = { ...formConfigs, ADMIN_URL_PATH: adminUrlPath };
      // Filter empty secrets
      for (const [k, v] of Object.entries(updates)) {
        if (configs[k]?.isSecret && (!v || v.trim() === '')) {
          delete updates[k];
        }
      }
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setConfigSuccessMsg(`✓ Configuration & Directive saved (v${data.version}). Live hot-reloaded.`);
        await fetchConfigs();
        setTimeout(() => setConfigSuccessMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed saving configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestAi = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: formConfigs.AI_API_ENDPOINT,
          apiKey: formConfigs.AI_API_KEY,
          model: formConfigs.AI_MODEL_NAME,
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      setAiTestResult(data);
    } catch (err: any) {
      setAiTestResult({ success: false, error: err.message });
    } finally {
      setTestingAi(false);
    }
  };

  const handleAddAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', username: newAdminUser, password: newAdminPass }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setUserMsg({ type: 'success', text: data.message });
        setNewAdminUser('');
        setNewAdminPass('');
        await fetchAdminUsers();
      } else {
        setUserMsg({ type: 'error', text: data.error || 'Failed to add admin.' });
      }
    } catch (err: any) {
      setUserMsg({ type: 'error', text: err.message });
    }
  };

  const handleCreateNewMaster = () => {
    const newId = `master_${Date.now().toString(36)}`;
    const blank: OracleMaster = {
      id: newId,
      nameZh: '太乙真人',
      nameEn: 'Master Taiyi',
      titleZh: '奇門造化與流年轉運宗師',
      titleEn: 'Master of Cosmic Transitions & Destiny Alignment',
      sealCharacter: '乙',
      taglineZh: '專司奇門擇吉、流年氣機轉化與人生破局指引。',
      taglineEn: 'Specializing in auspicious timing, annual energy shifts, and strategic breakthroughs.',
      avatarGradient: 'linear-gradient(135deg, #A855F7 0%, #4C1D95 100%)',
      isActive: true,
      sortOrder: masters.length + 1,
      characteristics: {
        personalityZh: '超然物外、洞徹玄機、語帶禪意而切中要害。',
        personalityEn: 'Transcendent, perceptive, speaking with Zen-like clarity and practical precision.',
        toneZh: '清朗玄妙、直指人心',
        toneEn: 'Lucid, contemplative, and directly actionable',
        speakingStyleZh: '結合求測者八字日主與所求靈籤爻象，點破執念並指明行動節氣。',
        speakingStyleEn: 'Synthesizes the seeker’s Day Master and Lot hexagram to dissolve blindspots and highlight seasonal timing.',
        greetingZh: '貧道太乙，見居士骨骼清奇、誠心叩問，凡本命流年與行止抉擇，皆可道來。',
        greetingEn: 'Greetings, Seeker. I am Master Taiyi. Share your contemplation within my confined domains, and we shall illuminate your chart.',
        systemPromptOverride: '',
      },
      confinedTopics: {
        allowedDomains: ['general', 'timing', 'career', 'travel_moving'],
        allowedKeywords: ['八字', '日主', '流年', '籤詩', '時機', 'bazi', 'lot', 'timing', 'career'],
        blockedTopics: ['coding', 'programming', 'stock ticker', 'lottery numbers', 'medical prescription'],
        refusalMessageZh: '【太乙真人拂塵輕揮】居士所問之事不在貧道所司範疇之內，請聚焦於本命時機、事業或出行大局。',
        refusalMessageEn: '[Master Taiyi waves his whisk] Your question lies outside my confined sanctuary domains. Please focus on Destiny, Timing, Career, or Travel.',
      },
      ragConfig: {
        includeBaziChart: true,
        includeTenGodsAndPalaces: true,
        includeDrawnLot: true,
        includeLifeBook: true,
        includeTransits: true,
        customKnowledgeDocs: [
          {
            id: `doc_${Date.now()}`,
            titleZh: '太乙流年交運心法',
            titleEn: 'Taiyi Annual Transit Alignment Doctrine',
            domain: 'all',
            keywords: ['流年', '轉運', '時機', 'timing', 'transit'],
            contentZh: '凡逢歲運交接，必先固守日主元神，借月令與靈籤喜神方位順勢而為。',
            contentEn: 'During annual transitions, fortify the Day Master first and align actions with the favorable seasonal element of the drawn Lot.',
          },
        ],
      },
      updatedAt: Date.now(),
    };
    setEditingMaster(blank);
  };

  const handleSaveMaster = async () => {
    if (!editingMaster) return;
    setSavingMaster(true);
    setMasterMsg(null);
    try {
      const res = await fetch('/api/admin/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_master', master: editingMaster }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMasters(data.masters);
        setMasterMsg(`✓ ${data.message}`);
        setEditingMaster(null);
        setTimeout(() => setMasterMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to save Master');
      }
    } catch (err: any) {
      alert(err.message || 'Failed saving Master');
    } finally {
      setSavingMaster(false);
    }
  };

  const handleDeleteMaster = async (masterId: string) => {
    if (!confirm('Are you sure you want to delete this Oracle Master?')) return;
    try {
      const res = await fetch('/api/admin/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_master', masterId }),
      });
      const data = await res.json();
      if (data.success) {
        setMasters(data.masters);
        setMasterMsg('✓ Master deleted.');
      } else {
        alert(data.error || 'Could not delete Master');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveMasterPolicy = async () => {
    setSavingMaster(true);
    setMasterMsg(null);
    try {
      const res = await fetch('/api/admin/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_policy', policy: masterPolicy }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setMasterPolicy(data.policy);
        setMasterMsg('✓ Access Gate, Question Quotas & Stage-1 AI Optimizer Policy saved and hot-reloaded!');
        setTimeout(() => setMasterMsg(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed updating policy');
    } finally {
      setSavingMaster(false);
    }
  };

  const handleRunMasterSimulation = async () => {
    setSimRunning(true);
    setSimResult(null);
    try {
      const res = await fetch('/api/admin/masters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_simulation',
          masterId: simMasterId,
          question: simQuestion,
          lotNumber: simLotNumber,
          birthDate: simBirthDate,
          birthTime: '09:30',
        }),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSimResult(data);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimRunning(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#05080e] flex flex-col items-center justify-center text-white/50 gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37]" />
        <span className="text-xs tracking-widest font-mono uppercase">Verifying Sacred Seal Credentials...</span>
      </div>
    );
  }

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen relative z-10 bg-[#05080e] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#070b11] border border-[#d4af37]/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(212,175,55,0.12)]">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-serif text-[#e6c687] font-semibold tracking-wider">
              Mazu Canon Admin Portal
            </h1>
            <p className="text-xs text-white/50 mt-1">
              智慧聖殿 · 典籍釋義與核心推演後台
            </p>
          </div>

          {!hasAdmins && (
            <div className="mb-5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                No Admin Accounts Initialized
              </div>
              <p className="text-[11px] text-amber-300/80">
                Please create your first admin using the local CLI tool:
              </p>
              <code className="block bg-black/60 p-1.5 rounded font-mono text-[10px] text-[#e6c687]">
                {'npx tsx scripts/manage_admin.ts add admin <password>'}
              </code>
            </div>
          )}

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-white/70 mb-1.5 font-medium">
                Admin Username (帳號)
              </label>
              <input
                type="text"
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="e.g. master / admin"
                className="w-full px-3.5 py-2.5 text-xs bg-black/60 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs text-white/70 mb-1.5 font-medium">
                Password (密碼)
              </label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-black/60 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c687] text-black font-semibold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Unlock Admin Portal
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-[10px] text-white/30 font-mono" suppressHydrationWarning>
              {`Directive: ${currentDirective || '/mod'} · Mazu Sixtieth Jiazi`}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED ADMIN DASHBOARD ──────────────────────────────────────────
  const filteredLots = lots.filter((l) => {
    if (!lotSearch) return true;
    const term = lotSearch.toLowerCase();
    const titleZh = l.title?.zh || '';
    const titleEn = l.title?.en || '';
    const linesZh = (l.verse?.lines || []).map((line) => line.zh).join(' ');
    const storyProtagonist = l.stories?.[0]?.title?.zh || '';

    return (
      l.lot_number.toString().includes(term) ||
      titleZh.includes(term) ||
      titleEn.toLowerCase().includes(term) ||
      linesZh.includes(term) ||
      storyProtagonist.includes(term)
    );
  });

  return (
    <div className="min-h-screen relative z-10 bg-[#05080e] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-[#d4af37]/25 bg-[#070b11] px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-serif font-semibold text-[#e6c687] tracking-wider">
                Mazu Canon Admin Studio
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ● Live
              </span>
            </div>
            <p className="text-[11px] text-white/40">
              {`Logged in as `}
              <strong className="text-white/80">{username || 'admin'}</strong>
              {` · Path Directive: `}
              <code className="text-[#e6c687] font-mono">{adminUrlPath || currentDirective || '/mod'}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white/80 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Seeker View</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/20 hover:bg-red-950/40 text-xs text-red-300 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="border-b border-white/10 bg-[#090e17] px-6 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('lots')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'lots'
              ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          60 Lots Canon Manager (六十甲子籤本)
        </button>

        <button
          onClick={() => setActiveTab('astrology')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'astrology'
              ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          Life-Book & Transit Logic Studio (九章命書與流年)
        </button>

        <button
          onClick={() => setActiveTab('masters')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'masters'
              ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          AI Oracle Masters & Quotas (宗師問答與配額引擎)
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'config'
              ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          System Directives & Configuration (運行配置與端點指令)
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'admins'
              ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
              : 'border-transparent text-white/60 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          Admin Accounts (管理員權限)
        </button>
      </div>

      {/* Main Container */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* ═══════════ TAB 1: 60 LOTS CANON MANAGER ═══════════ */}
        {activeTab === 'lots' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif text-[#e6c687] font-semibold">
                  Canonical Sixty Jiazi Lots Inventory (六十甲子靈籤寶典)
                </h2>
                <p className="text-xs text-white/50">
                  {`Total canon lots loaded: ${lots.length} / 60 · Click any card to edit verse, English translation, story, or domain guidance.`}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                <input
                  type="text"
                  value={lotSearch}
                  onChange={(e) => setLotSearch(e.target.value)}
                  placeholder="Search lot #, title, verse, or protagonist..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-black/50 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {loadingLots ? (
              <div className="py-20 flex flex-col items-center justify-center text-white/40 gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#d4af37]" />
                <span className="text-xs">Loading Canon Lots...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLots.map((lot) => (
                  <div
                    key={lot.lot_number}
                    onClick={() => setSelectedLot(JSON.parse(JSON.stringify(lot)))}
                    className="p-4 rounded-xl border border-white/10 bg-[#070b11] hover:border-[#d4af37]/60 hover:bg-[#0c1320] cursor-pointer transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-[#d4af37]/15 text-[#e6c687] border border-[#d4af37]/30">
                          #{lot.lot_number < 10 ? `0${lot.lot_number}` : lot.lot_number}
                        </span>
                        <span className="text-xs text-white/40 font-mono">
                          {lot.ganzhi?.zh || ''}
                        </span>
                      </div>

                      <div className="font-serif text-sm font-semibold text-white group-hover:text-[#e6c687] transition-colors mb-2">
                        {lot.title?.zh || `Lot ${lot.lot_number}`}
                      </div>

                      <div className="p-2.5 rounded bg-black/40 border border-white/5 text-xs font-serif text-white/70 space-y-1 mb-3">
                        {(lot.verse?.lines || []).slice(0, 2).map((l, idx) => (
                          <div key={idx} className="truncate">{l.zh}</div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                      <span>{lot.stories?.[0]?.title?.zh || '歷史典故'}</span>
                      <span className="text-[#d4af37] flex items-center gap-1 group-hover:underline">
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 2: ASTROLOGY LOGIC STUDIO ═══════════ */}
        {activeTab === 'astrology' && rules && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif text-[#e6c687] font-semibold">
                  Life-Book & Transit Engine Logic (九章命書與流年預測邏輯)
                </h2>
                <p className="text-xs text-white/50">
                  Tune narrative tone, archetypal guidelines, and solar term action directives for paid heirloom reports.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {rulesSuccessMsg && (
                  <span className="text-xs text-emerald-400 font-medium">{rulesSuccessMsg}</span>
                )}
                <button
                  onClick={handleSaveRules}
                  disabled={savingRules}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#d4af37] text-black hover:brightness-110 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {savingRules ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Astrological Rules
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10">
              <button
                onClick={() => setActiveAstroSubTab('chapters')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                  activeAstroSubTab === 'chapters'
                    ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                9 Canonical Chapters (九章全案命書規則)
              </button>
              <button
                onClick={() => setActiveAstroSubTab('terms')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-all ${
                  activeAstroSubTab === 'terms'
                    ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                24 Solar Terms Transit Matrix (二十四節氣能量指南)
              </button>
            </div>

            {activeAstroSubTab === 'chapters' && (
              <div className="space-y-4">
                {rules.chapters.map((ch, idx) => (
                  <div key={ch.chapterIndex} className="p-4 rounded-xl border border-white/10 bg-[#070b11] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#e6c687] text-xs font-bold">
                          Chapter {ch.chapterIndex}
                        </span>
                        <span className="font-serif font-semibold text-sm text-white">{ch.titleZh}</span>
                        <span className="text-xs text-white/50">({ch.titleEn})</span>
                      </div>
                      <span className="text-xs text-white/40 font-mono">Badge: {ch.badgeZh}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-white/60 mb-1">Traditional Chinese Focus (核心面向):</label>
                        <input
                          type="text"
                          value={ch.focusZh}
                          onChange={(e) => {
                            const newChs = [...rules.chapters];
                            newChs[idx].focusZh = e.target.value;
                            setRules({ ...rules, chapters: newChs });
                          }}
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 mb-1">English Focus:</label>
                        <input
                          type="text"
                          value={ch.focusEn}
                          onChange={(e) => {
                            const newChs = [...rules.chapters];
                            newChs[idx].focusEn = e.target.value;
                            setRules({ ...rules, chapters: newChs });
                          }}
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 mb-1">Sample Archetypal Insight (核心透視):</label>
                        <textarea
                          rows={2}
                          value={ch.sampleInsightZh}
                          onChange={(e) => {
                            const newChs = [...rules.chapters];
                            newChs[idx].sampleInsightZh = e.target.value;
                            setRules({ ...rules, chapters: newChs });
                          }}
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white/60 mb-1">Strategic Action Guideline (行止策略):</label>
                        <textarea
                          rows={2}
                          value={ch.sampleActionZh}
                          onChange={(e) => {
                            const newChs = [...rules.chapters];
                            newChs[idx].sampleActionZh = e.target.value;
                            setRules({ ...rules, chapters: newChs });
                          }}
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeAstroSubTab === 'terms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.solarTerms.map((st, idx) => (
                  <div key={st.term} className="p-4 rounded-xl border border-white/10 bg-[#070b11] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#e6c687]">{st.term}</span>
                        <span className="text-xs text-white/50">{st.nameEn}</span>
                      </div>
                      <span className="text-[11px] text-white/40">{st.windowZh}</span>
                    </div>

                    <div className="text-xs space-y-2">
                      <div>
                        <label className="block text-white/50 mb-1">Seasonal Theme (氣候氣機):</label>
                        <input
                          type="text"
                          value={st.themeZh}
                          onChange={(e) => {
                            const newTerms = [...rules.solarTerms];
                            newTerms[idx].themeZh = e.target.value;
                            setRules({ ...rules, solarTerms: newTerms });
                          }}
                          className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-emerald-400 mb-1">宜 (Favorable, comma-separated):</label>
                          <input
                            type="text"
                            value={st.favorableZh.join(', ')}
                            onChange={(e) => {
                              const newTerms = [...rules.solarTerms];
                              newTerms[idx].favorableZh = e.target.value.split(',').map((s) => s.trim());
                              setRules({ ...rules, solarTerms: newTerms });
                            }}
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-red-400 mb-1">忌 (Guarded, comma-separated):</label>
                          <input
                            type="text"
                            value={st.guardedZh.join(', ')}
                            onChange={(e) => {
                              const newTerms = [...rules.solarTerms];
                              newTerms[idx].guardedZh = e.target.value.split(',').map((s) => s.trim());
                              setRules({ ...rules, solarTerms: newTerms });
                            }}
                            className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded text-white text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 3: AI ORACLE MASTERS, RAG & QUOTA STUDIO ═══════════ */}
        {activeTab === 'masters' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif text-[#e6c687] font-semibold">
                  AI Oracle Masters, Personalization RAG & Quota Engine (宗師問答、專屬知識庫與配額引擎)
                </h2>
                <p className="text-xs text-white/50">
                  Define multiple online chatbot Masters with predefined RAG knowledge bases, personalities/tones, confined categories, and customizable question quotas.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {masterMsg && (
                  <span className="text-xs text-emerald-400 font-medium">{masterMsg}</span>
                )}
                <button
                  onClick={handleCreateNewMaster}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c687] text-black hover:brightness-110 flex items-center gap-1.5 transition-all"
                >
                  + Create New Master (新增在線宗師)
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10">
              <button
                onClick={() => setActiveMasterSubTab('personas')}
                className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-all ${
                  activeMasterSubTab === 'personas'
                    ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                1. Online Masters, Personalities & RAG Knowledge Base ({masters.length})
              </button>
              <button
                onClick={() => setActiveMasterSubTab('quotas')}
                className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-all ${
                  activeMasterSubTab === 'quotas'
                    ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                2. Access Gate, Question Quotas & 2-Stage AI Optimizer (提問門檻與配額規則)
              </button>
              <button
                onClick={() => setActiveMasterSubTab('simulator')}
                className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-all ${
                  activeMasterSubTab === 'simulator'
                    ? 'border-[#d4af37] text-[#d4af37] font-semibold'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                3. Live 2-Stage Intent & RAG Simulator (二階段意圖分流與RAG實測沙盒)
              </button>
            </div>

            {/* SUB-TAB 1: MASTERS LIST */}
            {activeMasterSubTab === 'personas' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {masters.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-xl border border-white/15 bg-[#070b11] hover:border-[#d4af37]/60 flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-base text-white border border-[#d4af37]"
                            style={{ background: m.avatarGradient }}
                          >
                            {m.sealCharacter}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-base text-[#e6c687]">
                              {m.nameZh} · {m.nameEn}
                            </div>
                            <div className="text-[11px] text-white/50">{m.titleZh}</div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                            m.isActive
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          {m.isActive ? '● Active' : '○ Disabled'}
                        </span>
                      </div>

                      <p className="text-xs text-white/70 leading-relaxed">{m.taglineZh}</p>

                      <div className="p-3 rounded-lg bg-black/50 border border-white/5 space-y-1.5 text-[11px]">
                        <div>
                          <span className="text-[#d4af37] font-semibold">Personality (性格設定): </span>
                          <span className="text-white/80">{m.characteristics.personalityZh}</span>
                        </div>
                        <div>
                          <span className="text-[#d4af37] font-semibold">Tone (語調風格): </span>
                          <span className="text-white/80">{m.characteristics.toneZh}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] text-white/50 font-semibold">
                          Confined Categories (限定可討論事類 - {m.confinedTopics.allowedDomains.length} / 13):
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.confinedTopics.allowedDomains.map((d) => {
                            const dom = DOMAINS.find((item) => item.key === d);
                            return (
                              <span
                                key={d}
                                className="px-2 py-0.5 text-[10px] rounded bg-[#d4af37]/15 text-[#e6c687] border border-[#d4af37]/30"
                              >
                                {dom ? `${dom.icon} ${dom.titleZh}` : d}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-[11px] text-white/50 font-semibold">
                          Predefined RAG Knowledge Base (已掛載個人化引擎與典籍):
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          {m.ragConfig.includeBaziChart && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">✓ 四柱八字命盤</span>
                          )}
                          {m.ragConfig.includeTenGodsAndPalaces && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">✓ 十神與宮位財庫</span>
                          )}
                          {m.ragConfig.includeDrawnLot && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">✓ 靈籤詩意典故</span>
                          )}
                          {m.ragConfig.includeLifeBook && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">✓ 九章全案命書</span>
                          )}
                          {m.ragConfig.includeTransits && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                              ✓ 動態流年節氣 (+{masterPolicy.futureYearsHorizon ?? 2}年)
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300">
                            📚 {m.ragConfig.customKnowledgeDocs?.length || 0} Custom RAG Docs
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => handleDeleteMaster(m.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setEditingMaster(JSON.parse(JSON.stringify(m)))}
                        className="px-3.5 py-1.5 rounded-lg bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/50 text-xs text-[#e6c687] font-semibold flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Customize Master & RAG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SUB-TAB 2: ACCESS GATE, QUESTION QUOTAS & 2-STAGE AI OPTIMIZER */}
            {activeMasterSubTab === 'quotas' && (
              <div className="max-w-3xl space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-white/10 bg-[#070b11]">
                    <div className="text-[11px] text-white/50">Total Consultation Messages</div>
                    <div className="text-2xl font-bold text-[#e6c687] mt-1">{masterStats.totalMessages}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-[#070b11]">
                    <div className="text-[11px] text-white/50">Valid Questions Charged</div>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">{masterStats.chargedQuestions}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-[#070b11]">
                    <div className="text-[11px] text-white/50">Off-Topic Blocked by Stage-1 AI</div>
                    <div className="text-2xl font-bold text-amber-400 mt-1">{masterStats.rejectedByStage1}</div>
                  </div>
                </div>

                {/* Eligibility & Question Quota Policy Card */}
                <div className="p-5 rounded-xl border border-[#d4af37]/40 bg-[#070b11] space-y-4 text-xs">
                  <div className="text-sm font-serif font-semibold text-[#e6c687]">
                    Seeker Access Gate & Customizable Question Quotas (善信准入條件與分級提問次數配額)
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg bg-black/40 border border-white/10">
                    <input
                      type="checkbox"
                      checked={masterPolicy.requireBirthOrRegistration}
                      onChange={(e) =>
                        setMasterPolicy({ ...masterPolicy, requireBirthOrRegistration: e.target.checked })
                      }
                    />
                    <span>
                      <strong>Require User Registration OR Specified Birth Info (Date, Time, Location)</strong> before talking to any Master (僅限已註冊或已填寫生辰八字之用戶可向宗師提問)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                      <label className="block font-semibold text-white">
                        Unpaid User Quota (未付費用戶可問次數):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={masterPolicy.unpaidQuota}
                        onChange={(e) =>
                          setMasterPolicy({ ...masterPolicy, unpaidQuota: parseInt(e.target.value, 10) || 0 })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-[#d4af37]/40 rounded text-white font-mono text-sm"
                      />
                      <span className="text-[11px] text-white/40 block">Default: 1 question for unpaid users</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                      <label className="block font-semibold text-[#e6c687]">
                        Paid User Quota per Payment (單次付費獲贈次數):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={masterPolicy.paidSinglePaymentQuota}
                        onChange={(e) =>
                          setMasterPolicy({
                            ...masterPolicy,
                            paidSinglePaymentQuota: parseInt(e.target.value, 10) || 3,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-[#d4af37]/40 rounded text-white font-mono text-sm"
                      />
                      <span className="text-[11px] text-white/40 block">Default: 3 questions per payment ($2.99)</span>
                    </div>

                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5">
                      <label className="block font-semibold text-emerald-300">
                        Monthly Subscriber Quota (月費訂閱每月次數):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={masterPolicy.monthlySubscriberQuota}
                        onChange={(e) =>
                          setMasterPolicy({
                            ...masterPolicy,
                            monthlySubscriberQuota: parseInt(e.target.value, 10) || 30,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-[#d4af37]/40 rounded text-white font-mono text-sm"
                      />
                      <span className="text-[11px] text-white/40 block">Default: 30 questions/month ($9.99/mo)</span>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg bg-black/40 border border-white/10">
                    <input
                      type="checkbox"
                      checked={masterPolicy.chargeOnRejectedIntent}
                      onChange={(e) =>
                        setMasterPolicy({ ...masterPolicy, chargeOnRejectedIntent: e.target.checked })
                      }
                    />
                    <span>
                      Deduct question quota even when Stage-1 rejects an off-topic inquiry (若關閉，被第一階段攔截之非指定範疇提問不扣次數)
                    </span>
                  </label>
                </div>

                {/* Stage 1 Lightweight Low-Cost AI Optimizer Card */}
                <div className="p-5 rounded-xl border border-white/15 bg-[#070b11] space-y-4 text-xs">
                  <div className="text-sm font-serif font-semibold text-[#e6c687]">
                    Stage-1 Lightweight Lower-Cost AI Intent Categorizer (第一階段輕量低成本 AI 意圖分類優化)
                  </div>
                  <p className="text-white/50">
                    Categorizes user intention with a fast, low-cost model first. Only questions falling within the Master&apos;s predefined categories proceed to Stage-2 RAG assembly and full persona synthesis.
                  </p>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-lg bg-black/40 border border-white/10">
                    <input
                      type="checkbox"
                      checked={masterPolicy.enableLightweightClassifier}
                      onChange={(e) =>
                        setMasterPolicy({ ...masterPolicy, enableLightweightClassifier: e.target.checked })
                      }
                    />
                    <span>
                      <strong>Enable Stage-1 Lightweight AI Intent Categorizer</strong> (啟用二階段輕量 AI 意圖預審分流)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/70 mb-1">
                        Lightweight Classifier Model (`AI_LIGHTWEIGHT_MODEL_NAME`):
                      </label>
                      <input
                        type="text"
                        value={masterPolicy.lightweightModelName}
                        onChange={(e) =>
                          setMasterPolicy({ ...masterPolicy, lightweightModelName: e.target.value })
                        }
                        placeholder="auto, gpt-4o-mini, deepseek-chat"
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1">
                        Stage-1 Max Tokens Cap (`MASTER_INTENT_MAX_TOKENS`):
                      </label>
                      <input
                        type="number"
                        min={50}
                        max={500}
                        value={masterPolicy.intentMaxTokens}
                        onChange={(e) =>
                          setMasterPolicy({
                            ...masterPolicy,
                            intentMaxTokens: parseInt(e.target.value, 10) || 120,
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-white/70 mb-1">
                        Rolling Future Years Horizon (`MASTER_FUTURE_YEARS_HORIZON`):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={masterPolicy.futureYearsHorizon ?? 2}
                        onChange={(e) =>
                          setMasterPolicy({
                            ...masterPolicy,
                            futureYearsHorizon: Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 2)),
                          })
                        }
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-white font-mono"
                      />
                      <span className="text-[10px] text-white/40 block mt-1">
                        Default: 2 (Current Year + Future 2 Years rolling window)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveMasterPolicy}
                    disabled={savingMaster}
                    className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c687] text-black font-semibold text-xs uppercase tracking-wider hover:brightness-110 flex items-center gap-2"
                  >
                    {savingMaster ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Quota & Optimizer Policy (立即保存並熱更新)
                  </button>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: LIVE 2-STAGE INTENT & RAG SIMULATOR SANDBOX */}
            {activeMasterSubTab === 'simulator' && (
              <div className="max-w-4xl space-y-5 text-xs">
                <div className="p-5 rounded-xl border border-[#d4af37]/40 bg-[#070b11] space-y-4">
                  <div className="text-sm font-serif font-semibold text-[#e6c687]">
                    Live Two-Stage Intent & Personalization RAG Simulator (二階段意圖攔截與 RAG 知識庫實測沙盒)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-white/60 mb-1">Target Oracle Master:</label>
                      <select
                        value={simMasterId}
                        onChange={(e) => setSimMasterId(e.target.value)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-white"
                      >
                        {masters.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nameZh} ({m.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/60 mb-1">Sample Seeker Birth Date:</label>
                      <input
                        type="date"
                        value={simBirthDate}
                        onChange={(e) => setSimBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 mb-1">Drawn Lot Number (1-60):</label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={simLotNumber}
                        onChange={(e) => setSimLotNumber(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 bg-black/60 border border-white/15 rounded text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">Test Question (Try both valid domain questions and off-topic questions):</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={simQuestion}
                        onChange={(e) => setSimQuestion(e.target.value)}
                        className="flex-1 px-3 py-2 bg-black/60 border border-white/15 rounded text-white"
                      />
                      <button
                        onClick={handleRunMasterSimulation}
                        disabled={simRunning}
                        className="px-4 py-2 rounded bg-[#d4af37] text-black font-semibold flex items-center gap-1.5"
                      >
                        {simRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        Run 2-Stage Test
                      </button>
                    </div>
                  </div>

                  {simResult && (
                    <div className="space-y-4 pt-3 border-t border-white/10">
                      <div className="p-3.5 rounded-lg bg-black/50 border border-white/10 space-y-1">
                        <div className="font-semibold text-[#e6c687]">
                          Stage 1 Intent Classification ({simResult.stage1.classifierProvider} · {simResult.stage1.latencyMs}ms):
                        </div>
                        <div className={simResult.stage1.isAllowed ? 'text-emerald-400' : 'text-red-400'}>
                          Status: <strong>{simResult.stage1.intentStatus}</strong> | Detected Domain: <strong>{simResult.stage1.detectedDomain}</strong> | Reason: {simResult.stage1.reasonZh}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-black/50 border border-white/10 space-y-2">
                        <div className="font-semibold text-[#e6c687]">Stage 2 Master Reply ({simResult.provider}):</div>
                        <pre className="whitespace-pre-wrap text-white/90 font-sans leading-relaxed">
                          {simResult.reply}
                        </pre>
                      </div>

                      <details className="p-3 rounded-lg bg-black/40 border border-white/10">
                        <summary className="cursor-pointer text-[#d4af37] font-semibold">
                          Inspect Assembled Personalization Engine RAG Context Prompt
                        </summary>
                        <pre className="mt-2 p-3 bg-black/80 rounded text-[11px] text-white/70 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                          {simResult.ragPromptPreview}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 4: SYSTEM DIRECTIVES & CONFIG ═══════════ */}
        {activeTab === 'config' && (
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif text-[#e6c687] font-semibold">
                  System Directives & Configuration (運行配置與端點指令管理)
                </h2>
                <p className="text-xs text-white/50">
                  Manage runtime API tokens, inference models, Stripe secrets, and change the secret Admin URL directive.
                </p>
              </div>

              {configSuccessMsg && (
                <span className="text-xs text-emerald-400 font-medium">{configSuccessMsg}</span>
              )}
            </div>

            {/* Secret Admin URL Directive */}
            <div className="p-5 rounded-xl border border-[#d4af37]/40 bg-[#070b11] shadow-[0_0_30px_rgba(212,175,55,0.08)] space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#e6c687]">
                <Key className="w-4 h-4" />
                <span>Admin URL Location Directive (後台秘密存取端點指令)</span>
              </div>
              <p className="text-xs text-white/60">
                This URL directive controls the exact path where this admin area can be loaded. All other unauthorized paths will automatically trigger a 404 response. Normal users have no visible links to this page.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40 font-mono">http://localhost:3000</span>
                <input
                  type="text"
                  value={adminUrlPath}
                  onChange={(e) => setAdminUrlPath(e.target.value)}
                  placeholder="/mod"
                  className="flex-1 px-3.5 py-2 text-xs bg-black/60 border border-[#d4af37]/50 rounded-lg text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            {/* AI Inference Gateway Config */}
            <div className="p-5 rounded-xl border border-white/10 bg-[#070b11] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Cpu className="w-4 h-4 text-[#d4af37]" />
                  <span>AI Inference Provider & Tokens</span>
                </div>
                {configs.AI_API_KEY?.hasValue && (
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300">
                    ✓ Key Configured ({configs.AI_API_KEY.maskedValue})
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-white/70 mb-1">AI_API_ENDPOINT:</label>
                  <input
                    type="text"
                    value={formConfigs.AI_API_ENDPOINT || ''}
                    onChange={(e) => setFormConfigs({ ...formConfigs, AI_API_ENDPOINT: e.target.value })}
                    placeholder="http://localhost:3001/v1 or https://api.openai.com/v1"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded text-white"
                  />
                </div>

                <div>
                  <label className="block text-white/70 mb-1">AI_API_KEY / Token:</label>
                  <div className="relative">
                    <input
                      type={showConfigSecret.AI_API_KEY ? 'text' : 'password'}
                      value={formConfigs.AI_API_KEY || ''}
                      onChange={(e) => setFormConfigs({ ...formConfigs, AI_API_KEY: e.target.value })}
                      placeholder={configs.AI_API_KEY?.hasValue ? '•••••••• (Leave blank to keep current)' : 'Enter API token'}
                      className="w-full px-3 py-2 pr-10 bg-black/40 border border-white/15 rounded text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfigSecret((prev) => ({ ...prev, AI_API_KEY: !prev.AI_API_KEY }))}
                      className="absolute right-3 top-2 text-white/40 hover:text-white"
                    >
                      {showConfigSecret.AI_API_KEY ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 mb-1">AI_MODEL_NAME:</label>
                  <input
                    type="text"
                    value={formConfigs.AI_MODEL_NAME || ''}
                    onChange={(e) => setFormConfigs({ ...formConfigs, AI_MODEL_NAME: e.target.value })}
                    placeholder="auto or deepseek-chat"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded text-white"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleTestAi}
                    disabled={testingAi}
                    className="px-3.5 py-1.5 rounded bg-white/10 hover:bg-white/15 text-xs text-white border border-white/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {testingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-[#d4af37]" />}
                    Test AI Connection
                  </button>

                  {aiTestResult && (
                    <span className={`text-xs ${aiTestResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {aiTestResult.success
                        ? `✓ Verified (${aiTestResult.latencyMs}ms · ${aiTestResult.model})`
                        : `✗ ${aiTestResult.error}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Save Config Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c687] text-black font-semibold text-xs tracking-wider uppercase hover:brightness-110 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration & Directives (立即保存並熱更新)
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 4: ADMIN ACCOUNTS ═══════════ */}
        {activeTab === 'admins' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-serif text-[#e6c687] font-semibold">
                Admin Accounts & Permissions (管理員權限管理)
              </h2>
              <p className="text-xs text-white/50">
                Manage credentials with salted scrypt hashing. New admins can also be added via CLI script: <code className="text-[#e6c687] font-mono">npx tsx scripts/manage_admin.ts add &lt;user&gt; &lt;pass&gt;</code>
              </p>
            </div>

            {userMsg && (
              <div className={`p-3 rounded-lg text-xs ${userMsg.type === 'success' ? 'bg-emerald-950/40 text-emerald-300' : 'bg-red-950/40 text-red-300'}`}>
                {userMsg.text}
              </div>
            )}

            {/* Admin Users List */}
            <div className="p-4 rounded-xl border border-white/10 bg-[#070b11]">
              <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-3">
                Registered Administrators ({adminUsers.length})
              </h3>
              <div className="space-y-2">
                {adminUsers.map((u) => (
                  <div key={u.id} className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{u.username}</span>
                      <span className="text-[10px] text-white/40 block" suppressHydrationWarning>
                        {`Created: ${u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A'}`}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      Super Admin
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Admin Form */}
            <form onSubmit={handleAddAdminUser} className="p-4 rounded-xl border border-white/10 bg-[#070b11] space-y-3">
              <h3 className="text-xs font-semibold text-[#e6c687] uppercase tracking-wider">
                Create New Admin User
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-white/60 mb-1">Username:</label>
                  <input
                    type="text"
                    required
                    value={newAdminUser}
                    onChange={(e) => setNewAdminUser(e.target.value)}
                    placeholder="e.g. curator"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-white/60 mb-1">Password:</label>
                  <input
                    type="password"
                    required
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-xs text-white font-medium transition-all"
              >
                + Add Administrator
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ═══════════ MASTER EDIT DRAWER MODAL ═══════════ */}
      {editingMaster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-4xl max-h-[92vh] bg-[#070b11] border border-[#d4af37]/50 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.25)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0c1320]">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-white border border-[#d4af37]"
                  style={{ background: editingMaster.avatarGradient }}
                >
                  {editingMaster.sealCharacter}
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#e6c687]">
                    Customize Master: {editingMaster.nameZh} ({editingMaster.nameEn})
                  </h3>
                  <p className="text-[11px] text-white/40">
                    ID: {editingMaster.id} · Configure RAG Knowledge Base, Personality/Tone & Confined Categories
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveMaster}
                  disabled={savingMaster}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c687] text-black hover:brightness-110 flex items-center gap-1.5"
                >
                  {savingMaster ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Master
                </button>
                <button
                  onClick={() => setEditingMaster(null)}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* 1. Identity & Status */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#e6c687] uppercase tracking-wider">
                    1. Master Identity & Seal
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingMaster.isActive}
                      onChange={(e) =>
                        setEditingMaster({ ...editingMaster, isActive: e.target.checked })
                      }
                    />
                    <span className="text-emerald-300 font-semibold">Active in Public Sanctuary</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white/50 mb-1">Chinese Name (宗師尊號):</label>
                    <input
                      type="text"
                      value={editingMaster.nameZh}
                      onChange={(e) => setEditingMaster({ ...editingMaster, nameZh: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1">English Name:</label>
                    <input
                      type="text"
                      value={editingMaster.nameEn}
                      onChange={(e) => setEditingMaster({ ...editingMaster, nameEn: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1">Seal Character (印鑑單字):</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={editingMaster.sealCharacter}
                      onChange={(e) =>
                        setEditingMaster({ ...editingMaster, sealCharacter: e.target.value })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 mb-1">Title (ZH):</label>
                    <input
                      type="text"
                      value={editingMaster.titleZh}
                      onChange={(e) => setEditingMaster({ ...editingMaster, titleZh: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1">Title (EN):</label>
                    <input
                      type="text"
                      value={editingMaster.titleEn}
                      onChange={(e) => setEditingMaster({ ...editingMaster, titleEn: e.target.value })}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Predefined Characteristics (Personality, Tone, Speaking Style) */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <div className="font-semibold text-[#e6c687] uppercase tracking-wider">
                  2. Predefined Characteristics (性格、語氣與說話風格設定)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 mb-1">Personality (ZH):</label>
                    <textarea
                      rows={2}
                      value={editingMaster.characteristics.personalityZh}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          characteristics: {
                            ...editingMaster.characteristics,
                            personalityZh: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1">Personality (EN):</label>
                    <textarea
                      rows={2}
                      value={editingMaster.characteristics.personalityEn}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          characteristics: {
                            ...editingMaster.characteristics,
                            personalityEn: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 mb-1">Tone & Voice (ZH):</label>
                    <input
                      type="text"
                      value={editingMaster.characteristics.toneZh}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          characteristics: {
                            ...editingMaster.characteristics,
                            toneZh: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1">Tone & Voice (EN):</label>
                    <input
                      type="text"
                      value={editingMaster.characteristics.toneEn}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          characteristics: {
                            ...editingMaster.characteristics,
                            toneEn: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-white/50 mb-1">Greeting Message (ZH):</label>
                    <textarea
                      rows={2}
                      value={editingMaster.characteristics.greetingZh}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          characteristics: {
                            ...editingMaster.characteristics,
                            greetingZh: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1">Greeting Message (EN):</label>
                    <textarea
                      rows={2}
                      value={editingMaster.characteristics.greetingEn}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          characteristics: {
                            ...editingMaster.characteristics,
                            greetingEn: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Confined Topics & Allowed Categories */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <div className="font-semibold text-[#e6c687] uppercase tracking-wider">
                  3. Confined Topics & Allowed Categories (限定可討論之事類範疇)
                </div>
                <p className="text-white/50">
                  Stage-1 Lightweight AI will strictly enforce these categories and reject any question outside the checked domains below:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {DOMAINS.map((dom) => {
                    const checked = editingMaster.confinedTopics.allowedDomains.includes(dom.key);
                    return (
                      <label
                        key={dom.key}
                        className={`p-2 rounded border cursor-pointer flex items-center gap-2 ${
                          checked
                            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#e6c687] font-semibold'
                            : 'bg-black/40 border-white/10 text-white/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const current = editingMaster.confinedTopics.allowedDomains;
                            const next = e.target.checked
                              ? [...current, dom.key]
                              : current.filter((k) => k !== dom.key);
                            setEditingMaster({
                              ...editingMaster,
                              confinedTopics: {
                                ...editingMaster.confinedTopics,
                                allowedDomains: next,
                              },
                            });
                          }}
                        />
                        <span>
                          {dom.icon} {dom.titleZh}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-white/50 mb-1">Out-of-Scope Refusal Message (ZH):</label>
                    <textarea
                      rows={2}
                      value={editingMaster.confinedTopics.refusalMessageZh}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          confinedTopics: {
                            ...editingMaster.confinedTopics,
                            refusalMessageZh: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white/50 mb-1">Out-of-Scope Refusal Message (EN):</label>
                    <textarea
                      rows={2}
                      value={editingMaster.confinedTopics.refusalMessageEn}
                      onChange={(e) =>
                        setEditingMaster({
                          ...editingMaster,
                          confinedTopics: {
                            ...editingMaster.confinedTopics,
                            refusalMessageEn: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/15 rounded text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Predefined Knowledge Base (Personalization Engine RAG + Custom Docs) */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#e6c687] uppercase tracking-wider">
                    4. Predefined RAG Knowledge Base (八字、靈籤、個人化引擎與自定義知識庫)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newDoc: MasterKnowledgeDoc = {
                        id: `doc_${Date.now()}`,
                        titleZh: '新增宗師秘傳心法',
                        titleEn: 'New Master Doctrine Entry',
                        domain: 'all',
                        keywords: ['八字', '籤詩', 'bazi', 'lot'],
                        contentZh: '請在此輸入宗師專屬的命理或解籤知識庫內容...',
                        contentEn: 'Enter custom RAG knowledge content for this Master...',
                      };
                      setEditingMaster({
                        ...editingMaster,
                        ragConfig: {
                          ...editingMaster.ragConfig,
                          customKnowledgeDocs: [
                            ...(editingMaster.ragConfig.customKnowledgeDocs || []),
                            newDoc,
                          ],
                        },
                      });
                    }}
                    className="px-3 py-1 rounded bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#e6c687] font-semibold"
                  >
                    + Add Custom RAG Document
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { key: 'includeBaziChart', label: 'BaZi 4 Pillars & Solar Time' },
                    { key: 'includeTenGodsAndPalaces', label: 'Ten Gods & Palaces' },
                    { key: 'includeDrawnLot', label: '60 Lots Verse & Story' },
                    { key: 'includeLifeBook', label: '9-Section Life Book' },
                    { key: 'includeTransits', label: 'Dynamic Rolling Transits' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="p-2 rounded bg-black/60 border border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(editingMaster.ragConfig as any)[item.key]}
                        onChange={(e) =>
                          setEditingMaster({
                            ...editingMaster,
                            ragConfig: {
                              ...editingMaster.ragConfig,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                {/* Custom RAG Docs List */}
                <div className="space-y-3 pt-2">
                  {(editingMaster.ragConfig.customKnowledgeDocs || []).map((doc, idx) => (
                    <div key={doc.id} className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={doc.titleZh}
                          onChange={(e) => {
                            const docs = [...editingMaster.ragConfig.customKnowledgeDocs];
                            docs[idx] = { ...docs[idx], titleZh: e.target.value };
                            setEditingMaster({
                              ...editingMaster,
                              ragConfig: { ...editingMaster.ragConfig, customKnowledgeDocs: docs },
                            });
                          }}
                          placeholder="Document Title (ZH)"
                          className="flex-1 px-2.5 py-1 bg-black/60 border border-white/15 rounded text-[#e6c687] font-semibold"
                        />
                        <input
                          type="text"
                          value={doc.titleEn}
                          onChange={(e) => {
                            const docs = [...editingMaster.ragConfig.customKnowledgeDocs];
                            docs[idx] = { ...docs[idx], titleEn: e.target.value };
                            setEditingMaster({
                              ...editingMaster,
                              ragConfig: { ...editingMaster.ragConfig, customKnowledgeDocs: docs },
                            });
                          }}
                          placeholder="Document Title (EN)"
                          className="flex-1 px-2.5 py-1 bg-black/60 border border-white/15 rounded text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const docs = editingMaster.ragConfig.customKnowledgeDocs.filter(
                              (_, i) => i !== idx
                            );
                            setEditingMaster({
                              ...editingMaster,
                              ragConfig: { ...editingMaster.ragConfig, customKnowledgeDocs: docs },
                            });
                          }}
                          className="text-red-400 hover:underline px-2"
                        >
                          Remove
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={doc.contentZh}
                        onChange={(e) => {
                          const docs = [...editingMaster.ragConfig.customKnowledgeDocs];
                          docs[idx] = { ...docs[idx], contentZh: e.target.value };
                          setEditingMaster({
                            ...editingMaster,
                            ragConfig: { ...editingMaster.ragConfig, customKnowledgeDocs: docs },
                          });
                        }}
                        placeholder="Chinese RAG Knowledge Content"
                        className="w-full px-2.5 py-1.5 bg-black/60 border border-white/10 rounded text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ LOT EDIT DRAWER MODAL ═══════════ */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div 
            className="w-full max-w-4xl max-h-[90vh] bg-[#070b11] border border-[#d4af37]/40 rounded-2xl flex flex-col overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0c1320]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-[#d4af37] text-black">
                  Lot #{selectedLot.lot_number}
                </span>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#e6c687]">{selectedLot.title?.zh || `Lot ${selectedLot.lot_number}`}</h3>
                  <p className="text-[11px] text-white/40">{selectedLot.ganzhi?.zh || ''} · Hexagram: {selectedLot.hexagram?.name_zh || ''} {selectedLot.hexagram?.symbol || ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {lotSuccessMsg && (
                  <span className="text-xs text-emerald-400 font-medium">{lotSuccessMsg}</span>
                )}
                <button
                  type="button"
                  onClick={handleSaveLot}
                  disabled={savingLot}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c687] text-black hover:brightness-110 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {savingLot ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
                <button
                  onClick={() => setSelectedLot(null)}
                  className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Verse & English */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                  <label className="font-semibold text-white/80 block">Classical 7-Character Quatrain (詩曰):</label>
                  {(selectedLot.verse?.lines || []).map((line: VerseLine, idx: number) => (
                    <input
                      key={idx}
                      type="text"
                      value={line.zh}
                      onChange={(e) => {
                        const newLines = [...(selectedLot.verse?.lines || [])];
                        newLines[idx] = { ...newLines[idx], zh: e.target.value };
                        setSelectedLot({
                          ...selectedLot,
                          verse: { ...selectedLot.verse, lines: newLines },
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded text-white font-serif"
                    />
                  ))}
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-2">
                  <label className="font-semibold text-white/80 block">English Quatrain Translation:</label>
                  {(selectedLot.verse?.lines || []).map((line: VerseLine, idx: number) => (
                    <input
                      key={idx}
                      type="text"
                      value={line.en}
                      onChange={(e) => {
                        const newLines = [...(selectedLot.verse?.lines || [])];
                        newLines[idx] = { ...newLines[idx], en: e.target.value };
                        setSelectedLot({
                          ...selectedLot,
                          verse: { ...selectedLot.verse, lines: newLines },
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded text-white font-serif text-[11px]"
                    />
                  ))}
                </div>
              </div>

              {/* Story Allusion */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <label className="font-semibold text-white/80 block">Historical Protagonist & Story Allusion (典故故事):</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-white/40 block mb-1">Story Title (Chinese):</span>
                    <input
                      type="text"
                      value={selectedLot.stories?.[0]?.title?.zh || ''}
                      onChange={(e) => {
                        const newStories = [...(selectedLot.stories || [])];
                        if (newStories[0]) {
                          newStories[0] = {
                            ...newStories[0],
                            title: { ...newStories[0].title, zh: e.target.value },
                          };
                          setSelectedLot({ ...selectedLot, stories: newStories });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded text-white"
                    />
                  </div>
                  <div>
                    <span className="text-white/40 block mb-1">Story Title (English):</span>
                    <input
                      type="text"
                      value={selectedLot.stories?.[0]?.title?.en || ''}
                      onChange={(e) => {
                        const newStories = [...(selectedLot.stories || [])];
                        if (newStories[0]) {
                          newStories[0] = {
                            ...newStories[0],
                            title: { ...newStories[0].title, en: e.target.value },
                          };
                          setSelectedLot({ ...selectedLot, stories: newStories });
                        }
                      }}
                      className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded text-white"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-white/40 block mb-1">Narrative Summary (Chinese):</span>
                  <textarea
                    rows={2}
                    value={selectedLot.stories?.[0]?.narrative?.zh || ''}
                    onChange={(e) => {
                      const newStories = [...(selectedLot.stories || [])];
                      if (newStories[0]) {
                        newStories[0] = {
                          ...newStories[0],
                          narrative: { ...newStories[0].narrative, zh: e.target.value },
                        };
                        setSelectedLot({ ...selectedLot, stories: newStories });
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-black/60 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              {/* Guidance / Criteria */}
              <div className="p-4 rounded-xl border border-white/10 bg-black/40 space-y-3">
                <label className="font-semibold text-white/80 block">Domain Guidance Entries (各事類解曰):</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                  {Object.entries(selectedLot.guidance || {}).map(([domainKey, guidanceItem]) => (
                    <div key={domainKey} className="p-2.5 rounded bg-black/50 border border-white/5 space-y-1">
                      <span className="text-[#e6c687] font-semibold text-[11px] uppercase">{domainKey}:</span>
                      <textarea
                        rows={2}
                        value={guidanceItem.zh || ''}
                        onChange={(e) => {
                          setSelectedLot({
                            ...selectedLot,
                            guidance: {
                              ...selectedLot.guidance,
                              [domainKey]: { ...guidanceItem, zh: e.target.value },
                            },
                          });
                        }}
                        className="w-full px-2 py-1 bg-black/60 border border-white/10 rounded text-white text-[11px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
