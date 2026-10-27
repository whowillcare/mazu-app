'use client';

import React, { useState, useEffect } from 'react';
import { translations, SupportedLanguage } from '@/lib/i18n/translations';
import { 
  Settings, Key, Cpu, CreditCard, RefreshCw, CheckCircle, 
  AlertCircle, Eye, EyeOff, Radio, Zap, ShieldCheck, Database
} from 'lucide-react';

interface ConfigManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: SupportedLanguage;
}

interface ConfigItemState {
  key: string;
  value?: string;
  maskedValue?: string;
  hasValue: boolean;
  category: 'ai' | 'payment' | 'system';
  isSecret: boolean;
  description?: string;
}

export function ConfigManagerModal({ isOpen, onClose, language }: ConfigManagerModalProps) {
  const t = translations[language].configManager;
  const [activeTab, setActiveTab] = useState<'ai' | 'payment' | 'system'>('ai');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverVersion, setServerVersion] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form values
  const [configs, setConfigs] = useState<Record<string, ConfigItemState>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});

  // Testing AI connection state
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
    error?: string;
    model?: string;
  } | null>(null);

  // Fetch configs from server
  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.configs) {
        setConfigs(data.configs);
        setServerVersion(data.version || 1);
        const initialForm: Record<string, string> = {};
        for (const [k, v] of Object.entries(data.configs as Record<string, ConfigItemState>)) {
          if (v.isSecret) {
            initialForm[k] = ''; // Keep empty unless edited by user
          } else {
            initialForm[k] = v.value || '';
          }
        }
        setFormValues(initialForm);
      }
    } catch (err: any) {
      console.error('Failed to load configs:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to fetch configuration' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfigs();
      setStatusMessage(null);
      setTestResult(null);
    }
  }, [isOpen]);

  // Listen to live Server-Sent Events (SSE) for hot-reloads
  useEffect(() => {
    if (!isOpen) return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/config/live');
      eventSource.addEventListener('update', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setServerVersion(payload.version);
          setStatusMessage({
            type: 'success',
            text: `[Live Hot-Reload] Config updated externally (v${payload.version})`,
          });
        } catch {}
      });
    } catch (err) {
      console.warn('SSE connection failed:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen]);

  const handleInputChange = (key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const toggleShowSecret = (key: string) => {
    setShowSecret((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (endpoint: string, model: string, provider: string) => {
    setFormValues((prev) => ({
      ...prev,
      AI_API_ENDPOINT: endpoint,
      AI_MODEL_NAME: model,
      AI_PROVIDER_TYPE: provider,
    }));
  };

  const handleTestConnection = async () => {
    setTestingAi(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: formValues.AI_API_ENDPOINT,
          apiKey: formValues.AI_API_KEY,
          model: formValues.AI_MODEL_NAME,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Connection test failed',
      });
    } finally {
      setTestingAi(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setStatusMessage(null);
    try {
      const updates: Record<string, string> = {};
      for (const [key, val] of Object.entries(formValues)) {
        // If it's a secret and value is empty string, don't overwrite with empty
        const item = configs[key];
        if (item?.isSecret && (!val || val.trim() === '')) {
          continue;
        }
        updates[key] = val;
      }

      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();

      if (data.success) {
        setServerVersion(data.version);
        setConfigs(data.configs);
        setStatusMessage({
          type: 'success',
          text: `${t.savedSuccess} (v${data.version})`,
        });

        // Trigger client-side window event for live state updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mazu:config_updated', { detail: data }));
        }

        // Clear out raw secret inputs while marking configured
        const newForm = { ...formValues };
        for (const [k, v] of Object.entries(data.configs as Record<string, ConfigItemState>)) {
          if (v.isSecret) {
            newForm[k] = '';
          }
        }
        setFormValues(newForm);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Save failed' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm(t.resetConfirm)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToDefaults: true }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchConfigs();
        setStatusMessage({
          type: 'success',
          text: 'Configuration successfully reset to environment defaults (.env).',
        });
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mazu:config_updated', { detail: data }));
        }
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Reset failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#070b11] border border-[#d4af37]/40 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d4af37]/20 bg-gradient-to-r from-[#0d1420] to-[#070b11]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif tracking-wider text-[#e6c687] font-semibold">
                  {t.modalTitle}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  v{serverVersion} · {t.liveReloadActive}
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                {t.modalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 pt-3 border-b border-white/10 gap-2 bg-[#090e17]">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'ai'
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-4 h-4" />
            {t.tabAi}
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'payment'
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            {t.tabPayment}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'system'
                ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-semibold'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            {t.tabSystem}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Message Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 text-xs border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-white/50">
              <RefreshCw className="w-6 h-6 animate-spin text-[#d4af37]" />
              <span className="text-xs">Loading persistent configuration...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: AI & INFERENCE */}
              {activeTab === 'ai' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Preset Buttons */}
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-2">
                      {t.aiPresetLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => applyPreset('http://localhost:3001/v1', 'auto', 'freellmapi')}
                        className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 text-white/80 transition-all text-left"
                      >
                        <div className="font-semibold text-[#e6c687]">FreeLLMAPI</div>
                        <div className="text-[10px] text-white/40">localhost:3001</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('https://api.deepseek.com/v1', 'deepseek-chat', 'deepseek')}
                        className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 text-white/80 transition-all text-left"
                      >
                        <div className="font-semibold text-blue-400">DeepSeek</div>
                        <div className="text-[10px] text-white/40">deepseek-chat</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('https://api.openai.com/v1', 'gpt-4o-mini', 'openai')}
                        className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 text-white/80 transition-all text-left"
                      >
                        <div className="font-semibold text-emerald-400">OpenAI</div>
                        <div className="text-[10px] text-white/40">gpt-4o-mini</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('http://localhost:11434/v1', 'llama3', 'ollama')}
                        className="px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 hover:border-[#d4af37]/60 hover:bg-[#d4af37]/10 text-white/80 transition-all text-left"
                      >
                        <div className="font-semibold text-purple-400">Ollama Local</div>
                        <div className="text-[10px] text-white/40">localhost:11434</div>
                      </button>
                    </div>
                  </div>

                  {/* AI Endpoint */}
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5 flex justify-between">
                      <span>{t.aiEndpointLabel}</span>
                      <span className="text-[10px] text-white/40 font-mono">AI_API_ENDPOINT</span>
                    </label>
                    <input
                      type="text"
                      value={formValues.AI_API_ENDPOINT || ''}
                      onChange={(e) => handleInputChange('AI_API_ENDPOINT', e.target.value)}
                      placeholder={t.aiEndpointPlaceholder}
                      className="w-full px-3.5 py-2.5 text-xs bg-black/50 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* AI Token / API Key */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-white/80 flex items-center gap-2">
                        <span>{t.aiTokenLabel}</span>
                        {configs.AI_API_KEY?.hasValue && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ {configs.AI_API_KEY.maskedValue || 'Configured'}
                          </span>
                        )}
                      </label>
                      <span className="text-[10px] text-white/40 font-mono">AI_API_KEY</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showSecret.AI_API_KEY ? 'text' : 'password'}
                        value={formValues.AI_API_KEY || ''}
                        onChange={(e) => handleInputChange('AI_API_KEY', e.target.value)}
                        placeholder={configs.AI_API_KEY?.hasValue ? '•••••••••••••••• (Leave blank to keep current)' : t.aiTokenPlaceholder}
                        className="w-full px-3.5 py-2.5 pr-10 text-xs bg-black/50 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('AI_API_KEY')}
                        className="absolute right-3 top-2.5 text-white/40 hover:text-white"
                      >
                        {showSecret.AI_API_KEY ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* AI Model Name */}
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-1.5 flex justify-between">
                      <span>{t.aiModelLabel}</span>
                      <span className="text-[10px] text-white/40 font-mono">AI_MODEL_NAME</span>
                    </label>
                    <input
                      type="text"
                      value={formValues.AI_MODEL_NAME || ''}
                      onChange={(e) => handleInputChange('AI_MODEL_NAME', e.target.value)}
                      placeholder={t.aiModelPlaceholder}
                      className="w-full px-3.5 py-2.5 text-xs bg-black/50 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Test Connection Button & Result */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testingAi}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/20 flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {testingAi ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#d4af37]" />
                            {t.testingConnection}
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-[#d4af37]" />
                            {t.testConnectionBtn}
                          </>
                        )}
                      </button>

                      {testResult && (
                        <div
                          className={`flex-1 p-2 rounded-lg text-xs flex items-center gap-2 border ${
                            testResult.success
                              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                              : 'bg-red-950/40 border-red-500/30 text-red-300'
                          }`}
                        >
                          {testResult.success ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                          )}
                          <span className="truncate">
                            {testResult.success
                              ? `${t.connectionSuccess} · ${testResult.latencyMs}ms (${testResult.model || 'ok'})`
                              : `${t.connectionFailed}: ${testResult.error}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PAYMENTS */}
              {activeTab === 'payment' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Payment Mode Selector */}
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      {t.paymentModeLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleInputChange('PAYMENT_MODE', 'stripe')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          formValues.PAYMENT_MODE === 'stripe'
                            ? 'bg-[#d4af37]/10 border-[#d4af37] text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-white">{t.modeStripe}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">Live Stripe Checkout sessions & webhooks</div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange('PAYMENT_MODE', 'mock')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          formValues.PAYMENT_MODE === 'mock'
                            ? 'bg-[#d4af37]/10 border-[#d4af37] text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        <Radio className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-semibold text-white">{t.modeMock}</div>
                          <div className="text-[10px] text-white/40 mt-0.5">Instant simulated transactions for local test</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Stripe Secret Key */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-white/80 flex items-center gap-2">
                        <span>{t.stripeSecretLabel}</span>
                        {configs.STRIPE_SECRET_KEY?.hasValue && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ {configs.STRIPE_SECRET_KEY.maskedValue || 'Configured'}
                          </span>
                        )}
                      </label>
                      <span className="text-[10px] text-white/40 font-mono">STRIPE_SECRET_KEY</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showSecret.STRIPE_SECRET_KEY ? 'text' : 'password'}
                        value={formValues.STRIPE_SECRET_KEY || ''}
                        onChange={(e) => handleInputChange('STRIPE_SECRET_KEY', e.target.value)}
                        placeholder={configs.STRIPE_SECRET_KEY?.hasValue ? '•••••••••••••••• (Leave blank to keep current)' : 'sk_live_... / sk_test_...'}
                        className="w-full px-3.5 py-2.5 pr-10 text-xs bg-black/50 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('STRIPE_SECRET_KEY')}
                        className="absolute right-3 top-2.5 text-white/40 hover:text-white"
                      >
                        {showSecret.STRIPE_SECRET_KEY ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Stripe Webhook Secret */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-white/80 flex items-center gap-2">
                        <span>{t.stripeWebhookLabel}</span>
                        {configs.STRIPE_WEBHOOK_SECRET?.hasValue && (
                          <span className="px-1.5 py-0.5 text-[9px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ {configs.STRIPE_WEBHOOK_SECRET.maskedValue || 'Configured'}
                          </span>
                        )}
                      </label>
                      <span className="text-[10px] text-white/40 font-mono">STRIPE_WEBHOOK_SECRET</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showSecret.STRIPE_WEBHOOK_SECRET ? 'text' : 'password'}
                        value={formValues.STRIPE_WEBHOOK_SECRET || ''}
                        onChange={(e) => handleInputChange('STRIPE_WEBHOOK_SECRET', e.target.value)}
                        placeholder={configs.STRIPE_WEBHOOK_SECRET?.hasValue ? '•••••••••••••••• (Leave blank to keep current)' : 'whsec_...'}
                        className="w-full px-3.5 py-2.5 pr-10 text-xs bg-black/50 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-[#d4af37]"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('STRIPE_WEBHOOK_SECRET')}
                        className="absolute right-3 top-2.5 text-white/40 hover:text-white"
                      >
                        {showSecret.STRIPE_WEBHOOK_SECRET ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SYSTEM */}
              {activeTab === 'system' && (
                <div className="space-y-5 animate-fade-in">
                  {/* Default Currency */}
                  <div>
                    <label className="block text-xs font-medium text-white/80 mb-2">
                      {t.defaultCurrencyLabel}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['USD', 'TWD', 'EUR', 'JPY'].map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => handleInputChange('DEFAULT_CURRENCY', curr)}
                          className={`py-2 px-3 text-xs rounded-lg border font-mono transition-all ${
                            formValues.DEFAULT_CURRENCY === curr
                              ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#e6c687] font-bold'
                              : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enable AI Question Gate */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-white/5">
                    <div>
                      <div className="text-xs font-medium text-white">{t.enableAiQuestionGateLabel}</div>
                      <div className="text-[10px] text-white/40">Multi-domain warning & non-predictive agency re-framing</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formValues.ENABLE_AI_QUESTION_GATE !== 'false'}
                        onChange={(e) => handleInputChange('ENABLE_AI_QUESTION_GATE', e.target.checked ? 'true' : 'false')}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
                    </label>
                  </div>

                  {/* Reset Defaults Action */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70">Revert Environment Overrides</div>
                      <div className="text-[10px] text-white/40">Clears SQLite override table and reloads from .env files</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetToDefaults}
                      className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 rounded-lg transition-all"
                    >
                      {t.resetDefaultsBtn}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#090e17]">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t.reloadAppBtn}
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-white/70 hover:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#d4af37] to-[#e6c687] text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  {t.saveAndHotReloadBtn}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
