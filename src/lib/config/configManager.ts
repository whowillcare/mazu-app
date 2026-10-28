import fs from 'fs';
import path from 'path';
import { getDatabase } from '@/lib/db/database';
import { getConfigFilePath } from '@/lib/storage/storageConfig';

export interface ConfigItem {
  key: string;
  value: string;
  category: 'ai' | 'payment' | 'system';
  isSecret: boolean;
  description?: string;
  updatedAt: number;
}

export interface ClientConfigItem {
  key: string;
  value?: string;
  maskedValue?: string;
  hasValue: boolean;
  category: 'ai' | 'payment' | 'system';
  isSecret: boolean;
  description?: string;
  updatedAt: number;
}

export interface ConfigState {
  configs: Record<string, ClientConfigItem>;
  version: number;
  lastUpdated: number;
}

type ConfigListener = (updatedKeys: string[], version: number) => void;

class ConfigManager {
  private cache: Map<string, ConfigItem> = new Map();
  private isInitialized = false;
  private version = 1;
  private listeners: Set<ConfigListener> = new Set();
  private readonly configFilePath = getConfigFilePath();

  constructor() {
    // Lazily initialized on first access
  }

  private getDefaultConfigs(): ConfigItem[] {
    const now = Date.now();
    return [
      {
        key: 'AI_API_ENDPOINT',
        value: process.env.AI_API_ENDPOINT || process.env.AI_BASE_URL || 'http://localhost:3001/v1',
        category: 'ai',
        isSecret: false,
        description: 'AI Inference Endpoint URL (e.g. http://localhost:3001/v1, https://api.openai.com/v1)',
        updatedAt: now,
      },
      {
        key: 'AI_API_KEY',
        value: process.env.AI_API_KEY || process.env.FREE_LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '',
        category: 'ai',
        isSecret: true,
        description: 'Authentication API Token / Secret Key for AI LLM gateway',
        updatedAt: now,
      },
      {
        key: 'AI_MODEL_NAME',
        value: process.env.AI_MODEL_NAME || process.env.AI_MODEL || 'auto',
        category: 'ai',
        isSecret: false,
        description: 'Model Identifier (e.g. auto, deepseek-chat, gpt-4o-mini)',
        updatedAt: now,
      },
      {
        key: 'AI_PROVIDER_TYPE',
        value: process.env.AI_PROVIDER_TYPE || 'freellmapi',
        category: 'ai',
        isSecret: false,
        description: 'Provider preset type (freellmapi, deepseek, openai, custom)',
        updatedAt: now,
      },
      {
        key: 'STRIPE_SECRET_KEY',
        value: process.env.STRIPE_SECRET_KEY || '',
        category: 'payment',
        isSecret: true,
        description: 'Stripe Secret API Key (sk_live_... or sk_test_...)',
        updatedAt: now,
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        value: process.env.STRIPE_WEBHOOK_SECRET || '',
        category: 'payment',
        isSecret: true,
        description: 'Stripe Webhook Signing Secret (whsec_...)',
        updatedAt: now,
      },
      {
        key: 'PAYMENT_MODE',
        value: process.env.STRIPE_SECRET_KEY ? 'stripe' : 'mock',
        category: 'payment',
        isSecret: false,
        description: 'Payment operational mode (stripe = real gateway, mock = dev test simulator)',
        updatedAt: now,
      },
      {
        key: 'DEFAULT_CURRENCY',
        value: process.env.DEFAULT_CURRENCY || 'USD',
        category: 'system',
        isSecret: false,
        description: 'Default transaction and presentation currency (USD, TWD, EUR, JPY)',
        updatedAt: now,
      },
      {
        key: 'ENABLE_AI_QUESTION_GATE',
        value: process.env.ENABLE_AI_QUESTION_GATE ?? 'true',
        category: 'system',
        isSecret: false,
        description: 'Enable AI semantic parser & agency re-framing gate',
        updatedAt: now,
      },
      {
        key: 'ADMIN_URL_PATH',
        value: process.env.ADMIN_URL_PATH || '/mod',
        category: 'system',
        isSecret: false,
        description: 'Secret location directive for the protected Admin Portal (e.g. /mod, /console)',
        updatedAt: now,
      },
      {
        key: 'ADMIN_SESSION_TTL_HOURS',
        value: process.env.ADMIN_SESSION_TTL_HOURS || '4',
        category: 'system',
        isSecret: false,
        description: 'Admin session cookie expiration timeout in hours (e.g. 2, 4, 12, 24)',
        updatedAt: now,
      },
    ];
  }

  private init() {
    if (this.isInitialized) return;

    // 1. Populate defaults
    const defaults = this.getDefaultConfigs();
    for (const item of defaults) {
      this.cache.set(item.key, item);
    }

    // 2. Load from file backup if exists
    try {
      if (fs.existsSync(this.configFilePath)) {
        const raw = fs.readFileSync(this.configFilePath, 'utf-8');
        const fileConfigs: Record<string, Partial<ConfigItem>> = JSON.parse(raw);
        for (const [key, item] of Object.entries(fileConfigs)) {
          if (item && item.value !== undefined) {
            const current = this.cache.get(key);
            this.cache.set(key, {
              key,
              value: item.value,
              category: (item.category as any) || current?.category || 'system',
              isSecret: item.isSecret ?? current?.isSecret ?? false,
              description: item.description || current?.description,
              updatedAt: item.updatedAt || Date.now(),
            });
          }
        }
      }
    } catch (err) {
      console.warn('[ConfigManager] Failed reading file backup config:', err);
    }

    // 3. Load from SQLite database (highest authority)
    try {
      const db = getDatabase();
      const rows = db.prepare('SELECT key, value, category, is_secret, description, updated_at FROM app_configurations').all() as any[];
      for (const row of rows) {
        this.cache.set(row.key, {
          key: row.key,
          value: row.value,
          category: row.category,
          isSecret: row.is_secret === 1,
          description: row.description,
          updatedAt: row.updated_at,
        });
      }
    } catch (err) {
      console.warn('[ConfigManager] Failed querying app_configurations from DB:', err);
    }

    this.isInitialized = true;
  }

  public get(key: string): string | undefined {
    this.init();
    const item = this.cache.get(key);
    return item?.value;
  }

  public getBoolean(key: string, defaultValue = false): boolean {
    const val = this.get(key);
    if (!val) return defaultValue;
    return val.toLowerCase() === 'true' || val === '1';
  }

  public set(
    key: string,
    value: string,
    category?: 'ai' | 'payment' | 'system',
    isSecret?: boolean,
    description?: string
  ): void {
    this.init();
    const existing = this.cache.get(key);
    const now = Date.now();
    const resolvedItem: ConfigItem = {
      key,
      value,
      category: category || existing?.category || 'system',
      isSecret: isSecret ?? existing?.isSecret ?? false,
      description: description || existing?.description,
      updatedAt: now,
    };

    // Update memory cache
    this.cache.set(key, resolvedItem);
    this.version += 1;

    // Persist to SQLite
    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO app_configurations (key, value, category, is_secret, description, updated_at)
        VALUES (@key, @value, @category, @is_secret, @description, @updated_at)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          category = excluded.category,
          is_secret = excluded.is_secret,
          description = excluded.description,
          updated_at = excluded.updated_at
      `);
      stmt.run({
        key: resolvedItem.key,
        value: resolvedItem.value,
        category: resolvedItem.category,
        is_secret: resolvedItem.isSecret ? 1 : 0,
        description: resolvedItem.description || null,
        updated_at: resolvedItem.updatedAt,
      });
    } catch (err) {
      console.error('[ConfigManager] DB persistence error:', err);
    }

    // Persist to file backup
    this.persistToFile();

    // Trigger listeners
    this.notifyListeners([key]);
  }

  public setMultiple(updates: Record<string, string>): { updated: string[]; version: number } {
    this.init();
    const updatedKeys: string[] = [];
    const now = Date.now();

    try {
      const db = getDatabase();
      const stmt = db.prepare(`
        INSERT INTO app_configurations (key, value, category, is_secret, description, updated_at)
        VALUES (@key, @value, @category, @is_secret, @description, @updated_at)
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          category = excluded.category,
          is_secret = excluded.is_secret,
          description = excluded.description,
          updated_at = excluded.updated_at
      `);

      const tx = db.transaction(() => {
        for (const [key, value] of Object.entries(updates)) {
          if (value === undefined || value === null) continue;
          const existing = this.cache.get(key);
          // If secret was not modified (empty or same placeholder), skip
          if (existing?.isSecret && (value === '' || value.startsWith('••••') || value.includes('****'))) {
            continue;
          }

          const resolvedItem: ConfigItem = {
            key,
            value: value.trim(),
            category: existing?.category || 'system',
            isSecret: existing?.isSecret ?? (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')),
            description: existing?.description,
            updatedAt: now,
          };

          this.cache.set(key, resolvedItem);
          updatedKeys.push(key);

          stmt.run({
            key: resolvedItem.key,
            value: resolvedItem.value,
            category: resolvedItem.category,
            is_secret: resolvedItem.isSecret ? 1 : 0,
            description: resolvedItem.description || null,
            updated_at: resolvedItem.updatedAt,
          });
        }
      });

      tx();
    } catch (err) {
      console.error('[ConfigManager] Transaction error during setMultiple:', err);
    }

    if (updatedKeys.length > 0) {
      this.version += 1;
      this.persistToFile();
      this.notifyListeners(updatedKeys);
    }

    return { updated: updatedKeys, version: this.version };
  }

  public resetToDefaults(): { version: number } {
    this.init();
    const defaults = this.getDefaultConfigs();
    const keys: string[] = [];

    try {
      const db = getDatabase();
      db.prepare('DELETE FROM app_configurations').run();
      this.cache.clear();
      for (const item of defaults) {
        this.cache.set(item.key, item);
        keys.push(item.key);
      }
    } catch (err) {
      console.error('[ConfigManager] Reset error:', err);
    }

    this.version += 1;
    this.persistToFile();
    this.notifyListeners(keys);
    return { version: this.version };
  }

  private persistToFile() {
    try {
      const dir = path.dirname(this.configFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data: Record<string, ConfigItem> = {};
      this.cache.forEach((val, k) => {
        data[k] = val;
      });
      fs.writeFileSync(this.configFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[ConfigManager] Failed persisting file backup:', err);
    }
  }

  private maskSecret(value: string): string {
    if (!value) return '';
    if (value.length <= 8) return '••••••••';
    const prefix = value.slice(0, 4);
    const suffix = value.slice(-4);
    return `${prefix}••••••••${suffix}`;
  }

  public getClientConfigs(): ConfigState {
    this.init();
    const configs: Record<string, ClientConfigItem> = {};
    let maxUpdated = 0;

    this.cache.forEach((item, key) => {
      const hasValue = Boolean(item.value && item.value.trim().length > 0);
      configs[key] = {
        key: item.key,
        value: item.isSecret ? undefined : item.value,
        maskedValue: item.isSecret ? this.maskSecret(item.value) : undefined,
        hasValue,
        category: item.category,
        isSecret: item.isSecret,
        description: item.description,
        updatedAt: item.updatedAt,
      };
      if (item.updatedAt > maxUpdated) {
        maxUpdated = item.updatedAt;
      }
    });

    return {
      configs,
      version: this.version,
      lastUpdated: maxUpdated,
    };
  }

  public getVersion(): number {
    return this.version;
  }

  public subscribe(listener: ConfigListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(updatedKeys: string[]) {
    for (const listener of this.listeners) {
      try {
        listener(updatedKeys, this.version);
      } catch (e) {
        console.error('[ConfigManager] Listener callback error:', e);
      }
    }
  }
}

// Global Singleton
const globalForConfig = global as unknown as { configManagerInstance?: ConfigManager };
export const configManager = globalForConfig.configManagerInstance ?? new ConfigManager();
if (process.env.NODE_ENV !== 'production') {
  globalForConfig.configManagerInstance = configManager;
}

export function getConfig(key: string): string | undefined {
  return configManager.get(key);
}

export function getBooleanConfig(key: string, defaultValue = false): boolean {
  return configManager.getBoolean(key, defaultValue);
}
