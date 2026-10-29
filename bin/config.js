#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// scripts/manage_config.ts
var import_fs3 = __toESM(require("fs"));

// src/lib/config/configManager.ts
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));

// src/lib/db/database.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"));

// src/lib/storage/storageConfig.ts
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var resolvedStorageDir = null;
function getStorageDir() {
  if (resolvedStorageDir) {
    return resolvedStorageDir;
  }
  const envDir = process.env.STORAGE_DIR || process.env.PERSISTENCE_DIR;
  if (envDir) {
    if (!import_fs.default.existsSync(envDir)) {
      try {
        import_fs.default.mkdirSync(envDir, { recursive: true });
      } catch (e) {
        console.warn(`[StorageConfig] Warning: could not create storage directory ${envDir}:`, e);
      }
    }
    resolvedStorageDir = envDir;
    return resolvedStorageDir;
  }
  const defaultDir = import_path.default.join(process.cwd(), "storage");
  if (!import_fs.default.existsSync(defaultDir)) {
    try {
      import_fs.default.mkdirSync(defaultDir, { recursive: true });
    } catch (e) {
      console.warn(`[StorageConfig] Warning: could not create default storage directory ${defaultDir}:`, e);
    }
  }
  const legacyDataDir = import_path.default.join(process.cwd(), "data");
  try {
    const legacyDb = import_path.default.join(legacyDataDir, "user_vault.db");
    const targetDb = import_path.default.join(defaultDir, "user_vault.db");
    if (import_fs.default.existsSync(legacyDb) && !import_fs.default.existsSync(targetDb)) {
      import_fs.default.copyFileSync(legacyDb, targetDb);
      if (import_fs.default.existsSync(`${legacyDb}-wal`)) import_fs.default.copyFileSync(`${legacyDb}-wal`, `${targetDb}-wal`);
      if (import_fs.default.existsSync(`${legacyDb}-shm`)) import_fs.default.copyFileSync(`${legacyDb}-shm`, `${targetDb}-shm`);
      console.log("[StorageConfig] Successfully migrated legacy user_vault.db to storage/");
    }
    const legacyConfig = import_path.default.join(legacyDataDir, "app_config.json");
    const targetConfig = import_path.default.join(defaultDir, "app_config.json");
    if (import_fs.default.existsSync(legacyConfig) && !import_fs.default.existsSync(targetConfig)) {
      import_fs.default.copyFileSync(legacyConfig, targetConfig);
      console.log("[StorageConfig] Successfully migrated legacy app_config.json to storage/");
    }
    const legacyAstrology = import_path.default.join(legacyDataDir, "astrology_rules.json");
    const targetAstrology = import_path.default.join(defaultDir, "astrology_rules.json");
    if (import_fs.default.existsSync(legacyAstrology) && !import_fs.default.existsSync(targetAstrology)) {
      import_fs.default.copyFileSync(legacyAstrology, targetAstrology);
      console.log("[StorageConfig] Successfully migrated legacy astrology_rules.json to storage/");
    }
  } catch (err) {
    console.warn("[StorageConfig] Note during legacy data migration check:", err);
  }
  resolvedStorageDir = defaultDir;
  return resolvedStorageDir;
}
function getDatabasePath() {
  return import_path.default.join(getStorageDir(), "user_vault.db");
}
function getConfigFilePath() {
  return import_path.default.join(getStorageDir(), "app_config.json");
}

// src/lib/db/database.ts
var dbInstance = null;
function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }
  const dbPath = getDatabasePath();
  dbInstance = new import_better_sqlite3.default(dbPath);
  dbInstance.pragma("journal_mode = WAL");
  dbInstance.pragma("synchronous = NORMAL");
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      display_name TEXT,
      auth_provider TEXT DEFAULT 'anonymous',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_draws (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lot_number INTEGER NOT NULL,
      domain TEXT NOT NULL,
      question TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_entitlements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_sub_id TEXT,
      status TEXT NOT NULL,
      current_period_end INTEGER,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crd_compliance_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lot_number INTEGER,
      order_id TEXT NOT NULL,
      waiver_accepted_at INTEGER NOT NULL,
      ip_address TEXT,
      amount_cents INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_configurations (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      is_secret INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);
  return dbInstance;
}

// src/lib/config/configManager.ts
var ConfigManager = class {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.isInitialized = false;
    this.version = 1;
    this.listeners = /* @__PURE__ */ new Set();
    this.configFilePath = getConfigFilePath();
    this.watcherInitialized = false;
  }
  getDefaultConfigs() {
    const now = Date.now();
    return [
      {
        key: "AI_API_ENDPOINT",
        value: process.env.AI_API_ENDPOINT || process.env.AI_BASE_URL || "http://localhost:3001/v1",
        category: "ai",
        isSecret: false,
        description: "AI Inference Endpoint URL (e.g. http://localhost:3001/v1, https://api.openai.com/v1)",
        updatedAt: now
      },
      {
        key: "AI_API_KEY",
        value: process.env.AI_API_KEY || process.env.FREE_LLM_API_KEY || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || "",
        category: "ai",
        isSecret: true,
        description: "Authentication API Token / Secret Key for AI LLM gateway",
        updatedAt: now
      },
      {
        key: "AI_MODEL_NAME",
        value: process.env.AI_MODEL_NAME || process.env.AI_MODEL || "auto",
        category: "ai",
        isSecret: false,
        description: "Model Identifier (e.g. auto, deepseek-chat, gpt-4o-mini)",
        updatedAt: now
      },
      {
        key: "AI_PROVIDER_TYPE",
        value: process.env.AI_PROVIDER_TYPE || "freellmapi",
        category: "ai",
        isSecret: false,
        description: "Provider preset type (freellmapi, deepseek, openai, custom)",
        updatedAt: now
      },
      {
        key: "STRIPE_SECRET_KEY",
        value: process.env.STRIPE_SECRET_KEY || "",
        category: "payment",
        isSecret: true,
        description: "Stripe Secret API Key (sk_live_... or sk_test_...)",
        updatedAt: now
      },
      {
        key: "STRIPE_WEBHOOK_SECRET",
        value: process.env.STRIPE_WEBHOOK_SECRET || "",
        category: "payment",
        isSecret: true,
        description: "Stripe Webhook Signing Secret (whsec_...)",
        updatedAt: now
      },
      {
        key: "PAYMENT_MODE",
        value: process.env.STRIPE_SECRET_KEY ? "stripe" : "mock",
        category: "payment",
        isSecret: false,
        description: "Payment operational mode (stripe = real gateway, mock = dev test simulator)",
        updatedAt: now
      },
      {
        key: "DEFAULT_CURRENCY",
        value: process.env.DEFAULT_CURRENCY || "USD",
        category: "system",
        isSecret: false,
        description: "Default transaction and presentation currency (USD, TWD, EUR, JPY)",
        updatedAt: now
      },
      {
        key: "ENABLE_AI_QUESTION_GATE",
        value: process.env.ENABLE_AI_QUESTION_GATE ?? "true",
        category: "system",
        isSecret: false,
        description: "Enable AI semantic parser & agency re-framing gate",
        updatedAt: now
      },
      {
        key: "ADMIN_URL_PATH",
        value: process.env.ADMIN_URL_PATH || "/mod",
        category: "system",
        isSecret: false,
        description: "Secret location directive for the protected Admin Portal (e.g. /mod, /console)",
        updatedAt: now
      },
      {
        key: "ADMIN_SESSION_TTL_HOURS",
        value: process.env.ADMIN_SESSION_TTL_HOURS || "4",
        category: "system",
        isSecret: false,
        description: "Admin session cookie expiration timeout in hours (e.g. 2, 4, 12, 24)",
        updatedAt: now
      }
    ];
  }
  init() {
    if (this.isInitialized) return;
    const defaults = this.getDefaultConfigs();
    for (const item of defaults) {
      this.cache.set(item.key, item);
    }
    try {
      if (import_fs2.default.existsSync(this.configFilePath)) {
        const raw = import_fs2.default.readFileSync(this.configFilePath, "utf-8");
        const fileConfigs = JSON.parse(raw);
        for (const [key, item] of Object.entries(fileConfigs)) {
          if (item && item.value !== void 0) {
            const current = this.cache.get(key);
            this.cache.set(key, {
              key,
              value: item.value,
              category: item.category || current?.category || "system",
              isSecret: item.isSecret ?? current?.isSecret ?? false,
              description: item.description || current?.description,
              updatedAt: item.updatedAt || Date.now()
            });
          }
        }
      }
    } catch (err) {
      console.warn("[ConfigManager] Failed reading file backup config:", err);
    }
    try {
      const db = getDatabase();
      const rows = db.prepare("SELECT key, value, category, is_secret, description, updated_at FROM app_configurations").all();
      for (const row of rows) {
        this.cache.set(row.key, {
          key: row.key,
          value: row.value,
          category: row.category,
          isSecret: row.is_secret === 1,
          description: row.description,
          updatedAt: row.updated_at
        });
      }
    } catch (err) {
      console.warn("[ConfigManager] Failed querying app_configurations from DB:", err);
    }
    this.isInitialized = true;
    this.setupFileWatcher();
  }
  get(key) {
    this.init();
    const item = this.cache.get(key);
    return item?.value;
  }
  getBoolean(key, defaultValue = false) {
    const val = this.get(key);
    if (!val) return defaultValue;
    return val.toLowerCase() === "true" || val === "1";
  }
  set(key, value, category, isSecret, description) {
    this.init();
    const existing = this.cache.get(key);
    const now = Date.now();
    const resolvedItem = {
      key,
      value,
      category: category || existing?.category || "system",
      isSecret: isSecret ?? existing?.isSecret ?? false,
      description: description || existing?.description,
      updatedAt: now
    };
    this.cache.set(key, resolvedItem);
    this.version += 1;
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
        updated_at: resolvedItem.updatedAt
      });
    } catch (err) {
      console.error("[ConfigManager] DB persistence error:", err);
    }
    this.persistToFile();
    this.notifyListeners([key]);
  }
  setMultiple(updates) {
    this.init();
    const updatedKeys = [];
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
          if (value === void 0 || value === null) continue;
          const existing = this.cache.get(key);
          if (existing?.isSecret && (value === "" || value.startsWith("\u2022\u2022\u2022\u2022") || value.includes("****"))) {
            continue;
          }
          const resolvedItem = {
            key,
            value: value.trim(),
            category: existing?.category || "system",
            isSecret: existing?.isSecret ?? (key.includes("KEY") || key.includes("SECRET") || key.includes("TOKEN")),
            description: existing?.description,
            updatedAt: now
          };
          this.cache.set(key, resolvedItem);
          updatedKeys.push(key);
          stmt.run({
            key: resolvedItem.key,
            value: resolvedItem.value,
            category: resolvedItem.category,
            is_secret: resolvedItem.isSecret ? 1 : 0,
            description: resolvedItem.description || null,
            updated_at: resolvedItem.updatedAt
          });
        }
      });
      tx();
    } catch (err) {
      console.error("[ConfigManager] Transaction error during setMultiple:", err);
    }
    if (updatedKeys.length > 0) {
      this.version += 1;
      this.persistToFile();
      this.notifyListeners(updatedKeys);
    }
    return { updated: updatedKeys, version: this.version };
  }
  resetToDefaults() {
    this.init();
    const defaults = this.getDefaultConfigs();
    const keys = [];
    try {
      const db = getDatabase();
      db.prepare("DELETE FROM app_configurations").run();
      this.cache.clear();
      for (const item of defaults) {
        this.cache.set(item.key, item);
        keys.push(item.key);
      }
    } catch (err) {
      console.error("[ConfigManager] Reset error:", err);
    }
    this.version += 1;
    this.persistToFile();
    this.notifyListeners(keys);
    return { version: this.version };
  }
  delete(key) {
    this.init();
    const existing = this.cache.get(key);
    if (!existing) return false;
    this.cache.delete(key);
    this.version += 1;
    try {
      const db = getDatabase();
      db.prepare("DELETE FROM app_configurations WHERE key = ?").run(key);
    } catch (err) {
      console.error("[ConfigManager] Delete error in DB:", err);
    }
    this.persistToFile();
    this.notifyListeners([key]);
    return true;
  }
  reload() {
    this.isInitialized = false;
    this.cache.clear();
    this.init();
    this.version += 1;
    const allKeys = Array.from(this.cache.keys());
    this.notifyListeners(allKeys);
    return {
      reloaded: true,
      count: this.cache.size,
      version: this.version,
      keys: allKeys
    };
  }
  getAllConfigs() {
    this.init();
    return Array.from(this.cache.values());
  }
  setupFileWatcher() {
    if (this.watcherInitialized) return;
    this.watcherInitialized = true;
    try {
      if (typeof import_fs2.default !== "undefined" && import_fs2.default.existsSync && import_fs2.default.existsSync(this.configFilePath)) {
        let debounceTimer = null;
        const watcher = import_fs2.default.watch(this.configFilePath, (eventType) => {
          if (eventType === "change") {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              console.log("[ConfigManager] Detected external update to config file, performing live reload...");
              this.reload();
            }, 150);
            if (debounceTimer.unref) debounceTimer.unref();
          }
        });
        if (watcher.unref) {
          watcher.unref();
        }
      }
    } catch (err) {
      console.warn("[ConfigManager] Note on file watcher:", err);
    }
  }
  persistToFile() {
    try {
      const dir = import_path2.default.dirname(this.configFilePath);
      if (!import_fs2.default.existsSync(dir)) {
        import_fs2.default.mkdirSync(dir, { recursive: true });
      }
      const data = {};
      this.cache.forEach((val, k) => {
        data[k] = val;
      });
      import_fs2.default.writeFileSync(this.configFilePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.warn("[ConfigManager] Failed persisting file backup:", err);
    }
  }
  maskSecret(value) {
    if (!value) return "";
    if (value.length <= 8) return "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
    const prefix = value.slice(0, 4);
    const suffix = value.slice(-4);
    return `${prefix}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${suffix}`;
  }
  getClientConfigs() {
    this.init();
    const configs = {};
    let maxUpdated = 0;
    this.cache.forEach((item, key) => {
      const hasValue = Boolean(item.value && item.value.trim().length > 0);
      configs[key] = {
        key: item.key,
        value: item.isSecret ? void 0 : item.value,
        maskedValue: item.isSecret ? this.maskSecret(item.value) : void 0,
        hasValue,
        category: item.category,
        isSecret: item.isSecret,
        description: item.description,
        updatedAt: item.updatedAt
      };
      if (item.updatedAt > maxUpdated) {
        maxUpdated = item.updatedAt;
      }
    });
    return {
      configs,
      version: this.version,
      lastUpdated: maxUpdated
    };
  }
  getVersion() {
    return this.version;
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  notifyListeners(updatedKeys) {
    for (const listener of this.listeners) {
      try {
        listener(updatedKeys, this.version);
      } catch (e) {
        console.error("[ConfigManager] Listener callback error:", e);
      }
    }
  }
};
var globalForConfig = global;
var configManager = globalForConfig.configManagerInstance ?? new ConfigManager();
if (process.env.NODE_ENV !== "production") {
  globalForConfig.configManagerInstance = configManager;
}
function getConfig(key) {
  return configManager.get(key);
}
function setConfig(key, value, category, isSecret, description) {
  configManager.set(key, value, category, isSecret, description);
}
function deleteConfig(key) {
  return configManager.delete(key);
}
function reloadConfig() {
  return configManager.reload();
}
function getAllConfigs() {
  return configManager.getAllConfigs();
}

// scripts/manage_config.ts
var DEFAULT_SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3e3}`;
function printBanner() {
  console.log(`
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   \u2726 MAZU SIXTY JIAZI LOTS \xB7 CONFIGURATION MANAGER \u2726    \u2502
\u2502   Dynamic Settings, Secret Vault & Live Hot-Reload     \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
`);
}
function printUsage() {
  console.log(`
Commands:
  list, ls                        List all configuration settings
  get <key>                       View details for a specific configuration key
  set <key> <value> [options]     Add or modify a configuration setting & hot-reload
  del, rm, delete <key>           Remove a configuration setting & hot-reload
  reload                          Trigger live configuration reload across the running app
  reset                           Reset configurations to factory defaults
  help                            Show this help guide

Options:
  --show-secrets, -s              Display unmasked secrets/tokens in output
  --category, -c <category>       Category filter or assignment (ai, payment, system)
  --secret                        Mark setting as a sensitive secret
  --no-secret                     Mark setting as non-secret (plain text)
  --desc, -d <description>        Human-readable description for the setting
  --url <server_url>              Running application URL (default: ${DEFAULT_SERVER_URL})
  --no-reload                     Skip triggering live HTTP reload on the running app
  --json                          Output results formatted as JSON

Examples:
  # List all settings
  npm run config -- list
  npm run config -- list --show-secrets
  npm run config -- list -c ai

  # Add or update settings
  npm run config -- set AI_API_KEY "sk-ant-live-token" --secret -c ai
  npm run config -- set AI_MODEL_NAME "deepseek-chat" -c ai
  npm run config -- set ADMIN_URL_PATH "/portal" -c system
  npm run config -- set CUSTOM_BANNER "Welcome to Temple" -c system -d "Top banner text"

  # View a specific key
  npm run config -- get AI_API_KEY --show-secrets

  # Delete a custom setting
  npm run config -- del CUSTOM_BANNER

  # Force live reload across running server
  npm run config -- reload
`);
}
function maskSecret(val) {
  if (!val) return "(empty)";
  if (val.length <= 8) return "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
  return `${val.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${val.slice(-4)}`;
}
function parseArgValue(args, flag, shortFlag) {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag || shortFlag && args[i] === shortFlag) {
      return args[i + 1];
    }
    if (args[i].startsWith(`${flag}=`)) {
      return args[i].split("=")[1];
    }
  }
  return void 0;
}
function hasFlag(args, flag, shortFlag) {
  return args.some((a) => a === flag || shortFlag && a === shortFlag);
}
async function triggerLiveReload(serverUrl) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2e3);
    const res = await fetch(`${serverUrl}/api/config/reload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      console.log(`\u26A1 Live Reload: Running app at ${serverUrl} refreshed lively! (Config v${data.version}, ${data.count} keys active)`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  printBanner();
  if (!command || command === "help" || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }
  const showSecrets = hasFlag(args, "--show-secrets", "-s");
  const asJson = hasFlag(args, "--json");
  const noReload = hasFlag(args, "--no-reload");
  const serverUrl = parseArgValue(args, "--url") || DEFAULT_SERVER_URL;
  switch (command) {
    case "list":
    case "ls": {
      const filterCategory = parseArgValue(args, "--category", "-c")?.toLowerCase();
      let configs = getAllConfigs();
      if (filterCategory) {
        configs = configs.filter((c) => c.category === filterCategory);
      }
      configs.sort((a, b) => a.category.localeCompare(b.category) || a.key.localeCompare(b.key));
      if (asJson) {
        const out = configs.map((c) => ({
          ...c,
          value: c.isSecret && !showSecrets ? maskSecret(c.value) : c.value
        }));
        console.log(JSON.stringify(out, null, 2));
        return;
      }
      console.log(`\u{1F4CB} Active Configuration Settings (Total: ${configs.length})${filterCategory ? ` [Category: ${filterCategory}]` : ""}:`);
      console.log(`\u{1F4C1} File Backup: ${getConfigFilePath()}`);
      console.log("-".repeat(105));
      console.log(
        `${"KEY".padEnd(30)} ${"CATEGORY".padEnd(10)} ${"SECRET".padEnd(8)} ${"VALUE".padEnd(32)} ${"UPDATED"}`
      );
      console.log("-".repeat(105));
      for (const item of configs) {
        const valDisplay = item.isSecret && !showSecrets ? maskSecret(item.value) : item.value || "(empty)";
        const dateStr = item.updatedAt ? new Date(item.updatedAt).toISOString().replace("T", " ").slice(0, 19) : "-";
        const truncatedVal = valDisplay.length > 30 ? `${valDisplay.slice(0, 27)}...` : valDisplay;
        console.log(
          `${item.key.padEnd(30)} ${item.category.padEnd(10)} ${(item.isSecret ? "YES" : "no").padEnd(8)} ${truncatedVal.padEnd(32)} ${dateStr}`
        );
        if (item.description) {
          console.log(`   \u21B3 \x1B[90m${item.description}\x1B[0m`);
        }
      }
      console.log("-".repeat(105));
      if (!showSecrets) {
        console.log("\u{1F4A1} Tip: Sensitive tokens are masked with \u2022\u2022\u2022\u2022. Use --show-secrets (-s) to reveal plain values.\n");
      }
      break;
    }
    case "get": {
      const key = args[1]?.trim();
      if (!key) {
        console.error("\u274C Error: Missing configuration key.");
        console.log("Usage: npm run config -- get <KEY> [--show-secrets]");
        process.exit(1);
      }
      const all = getAllConfigs();
      const item = all.find((c) => c.key.toUpperCase() === key.toUpperCase());
      if (!item) {
        console.error(`\u274C Setting '${key}' not found in active configuration.`);
        process.exit(1);
      }
      if (asJson) {
        console.log(
          JSON.stringify(
            {
              ...item,
              value: item.isSecret && !showSecrets ? maskSecret(item.value) : item.value
            },
            null,
            2
          )
        );
        return;
      }
      console.log(`
\u{1F50D} Configuration Key: \x1B[36m${item.key}\x1B[0m`);
      console.log(`   Category:    ${item.category}`);
      console.log(`   Is Secret:   ${item.isSecret ? "Yes (encrypted/masked)" : "No (public)"}`);
      console.log(
        `   Value:       ${item.isSecret && !showSecrets ? maskSecret(item.value) : item.value || "(empty)"}`
      );
      console.log(
        `   Last Update: ${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "System default"}`
      );
      if (item.description) {
        console.log(`   Description: ${item.description}`);
      }
      console.log();
      break;
    }
    case "set": {
      const key = args[1]?.trim();
      const value = args[2]?.trim();
      if (!key || value === void 0) {
        console.error("\u274C Error: Both <key> and <value> are required.");
        console.log("Usage: npm run config -- set <KEY> <VALUE> [--category <cat>] [--secret] [--desc <description>]");
        process.exit(1);
      }
      const categoryArg = parseArgValue(args, "--category", "-c");
      const descArg = parseArgValue(args, "--desc", "-d");
      const isSecretFlag = hasFlag(args, "--secret");
      const isNoSecretFlag = hasFlag(args, "--no-secret");
      let isSecret = void 0;
      if (isSecretFlag) isSecret = true;
      else if (isNoSecretFlag) isSecret = false;
      else if (key.includes("KEY") || key.includes("SECRET") || key.includes("TOKEN") || key.includes("PASS")) {
        isSecret = true;
      }
      const existingValue = getConfig(key);
      setConfig(key, value, categoryArg, isSecret, descArg);
      console.log(`\u2705 Setting updated successfully:`);
      console.log(`   Key:         \x1B[32m${key}\x1B[0m`);
      console.log(`   Value:       ${isSecret && !showSecrets ? maskSecret(value) : value}`);
      if (existingValue !== void 0) {
        console.log(`   Previous:    ${isSecret && !showSecrets ? maskSecret(existingValue) : existingValue}`);
      }
      if (categoryArg) console.log(`   Category:    ${categoryArg}`);
      if (descArg) console.log(`   Description: ${descArg}`);
      if (!noReload) {
        const reloaded = await triggerLiveReload(serverUrl);
        if (!reloaded) {
          console.log(`\u2139\uFE0F  Persisted to persistent vault & file. (Server at ${serverUrl} is not running; will apply automatically on start)`);
        }
      }
      break;
    }
    case "del":
    case "rm":
    case "delete":
    case "remove": {
      const key = args[1]?.trim();
      if (!key) {
        console.error("\u274C Error: Missing configuration key to delete.");
        console.log("Usage: npm run config -- del <KEY>");
        process.exit(1);
      }
      const existing = getConfig(key);
      if (existing === void 0) {
        console.warn(`\u26A0\uFE0F Warning: Setting '${key}' does not exist.`);
        process.exit(0);
      }
      const deleted = deleteConfig(key);
      if (deleted) {
        console.log(`\u{1F5D1}\uFE0F  Successfully removed configuration setting: \x1B[33m${key}\x1B[0m`);
        if (!noReload) {
          const reloaded = await triggerLiveReload(serverUrl);
          if (!reloaded) {
            console.log(`\u2139\uFE0F  Removed from persistent vault & file.`);
          }
        }
      } else {
        console.error(`\u274C Failed to delete setting '${key}'.`);
      }
      break;
    }
    case "reload": {
      console.log(`\u{1F504} Triggering live configuration reload...`);
      const localResult = reloadConfig();
      console.log(`\u2705 Local configuration cache reloaded (v${localResult.version}, ${localResult.count} items).`);
      try {
        const filePath = getConfigFilePath();
        const time = /* @__PURE__ */ new Date();
        import_fs3.default.utimesSync(filePath, time, time);
      } catch {
      }
      const reloaded = await triggerLiveReload(serverUrl);
      if (reloaded) {
        console.log(`\u{1F389} Live application hot-reload confirmed successfully!`);
      } else {
        console.log(`\u2139\uFE0F  Local persistent storage refreshed. Running server at ${serverUrl} was not detected or is offline.`);
      }
      break;
    }
    case "reset": {
      const force = hasFlag(args, "--force");
      if (!force) {
        console.log(`\u26A0\uFE0F  CAUTION: This will reset all configuration settings to system factory defaults.`);
        console.log(`   To proceed, re-run with: npm run config -- reset --force
`);
        process.exit(0);
      }
      const res = configManager.resetToDefaults();
      console.log(`\u267B\uFE0F  Configuration reset to factory defaults (v${res.version}).`);
      if (!noReload) {
        await triggerLiveReload(serverUrl);
      }
      break;
    }
    default: {
      console.error(`\u274C Unknown command: '${command}'`);
      printUsage();
      process.exit(1);
    }
  }
  process.exit(0);
}
main().catch((err) => {
  console.error("\n\u274C Fatal CLI Error:", err);
  process.exit(1);
});
