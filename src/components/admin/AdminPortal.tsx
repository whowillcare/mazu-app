'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Lock, LogOut, CheckCircle, AlertCircle, RefreshCw, 
  Search, Edit3, BookOpen, Compass, Cpu, Settings, Users, Save, Eye, EyeOff, Zap, ExternalLink
} from 'lucide-react';
import type { CanonicalLot, VerseLine, StoryInfo } from '@/lib/types/lots';
import type { ChapterRule, SolarTermRule, AstrologyRules } from '@/lib/bazi/astrologyRules';

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
  const [activeTab, setActiveTab] = useState<'lots' | 'astrology' | 'config' | 'admins'>('lots');

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

  useEffect(() => {
    if (authenticated) {
      if (lots.length === 0) {
        fetchLots();
      }
      fetchRules();
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

        {/* ═══════════ TAB 3: SYSTEM DIRECTIVES & CONFIG ═══════════ */}
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
