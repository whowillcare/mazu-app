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

// src/lib/auth/adminAuth.ts
var import_crypto = __toESM(require("crypto"));

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
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
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

// src/lib/auth/adminAuth.ts
function hashPassword(password) {
  const salt = import_crypto.default.randomBytes(16).toString("hex");
  const hash = import_crypto.default.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function getAdminUsers() {
  try {
    const db = getDatabase();
    const rows = db.prepare("SELECT id, username, created_at, updated_at FROM admin_users ORDER BY created_at ASC").all();
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  } catch {
    return [];
  }
}
function createAdminUser(username, password) {
  const cleanUsername = (username || "").trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: "Username must be at least 3 characters." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  try {
    const db = getDatabase();
    const id = `admin_${import_crypto.default.randomBytes(8).toString("hex")}`;
    const passwordHash = hashPassword(password);
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, cleanUsername, passwordHash, now, now);
    return { success: true };
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE constraint failed")) {
      return { success: false, error: `Admin user '${cleanUsername}' already exists.` };
    }
    return { success: false, error: err.message || "Failed to create admin user." };
  }
}
function updateAdminPassword(username, newPassword) {
  const cleanUsername = (username || "").trim().toLowerCase();
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }
  try {
    const db = getDatabase();
    const passwordHash = hashPassword(newPassword);
    const now = Date.now();
    const stmt = db.prepare("UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE username = ?");
    const result = stmt.run(passwordHash, now, cleanUsername);
    if (result.changes === 0) {
      return { success: false, error: `Admin user '${cleanUsername}' not found.` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Failed to update password." };
  }
}
function deleteAdminUser(username) {
  const cleanUsername = (username || "").trim().toLowerCase();
  try {
    const db = getDatabase();
    const countRow = db.prepare("SELECT COUNT(*) as count FROM admin_users").get();
    if (countRow.count <= 1) {
      return { success: false, error: "Cannot delete the only remaining admin account." };
    }
    const stmt = db.prepare("DELETE FROM admin_users WHERE username = ?");
    const result = stmt.run(cleanUsername);
    if (result.changes === 0) {
      return { success: false, error: `Admin user '${cleanUsername}' not found.` };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || "Failed to delete admin." };
  }
}

// scripts/manage_admin.ts
function printBanner() {
  console.log(`
\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502   \u2726 MAZU SIXTY JIAZI LOTS \xB7 ADMIN CLI MANAGER \u2726        \u2502
\u2502   Secure Admin Account & Route Directive Control       \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
`);
}
function printUsage() {
  console.log(`
Commands:
  add <username> <password>       Create a new admin account with salted scrypt hash
  passwd <username> <new_pass>    Change password for an existing admin user
  list                            List all active admin user accounts
  del <username>                  Remove an admin user account
  get-path                        Show current secret Admin URL directive (default: /mod)
  set-path <directive>            Set new Admin URL directive (e.g. /mod, /console, /portal)
  get-ttl                         Show current admin session expiration TTL (default: 4 hours)
  set-ttl <hours>                 Set admin session expiration TTL in hours (e.g. 2, 4, 12, 24)
  help                            Show this help message

Examples:
  npx tsx scripts/manage_admin.ts add master s3cretP@ssw0rd!
  npx tsx scripts/manage_admin.ts set-path /mod
  npx tsx scripts/manage_admin.ts set-ttl 4
  npx tsx scripts/manage_admin.ts list
`);
}
async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  printBanner();
  if (!command || command === "help" || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }
  switch (command) {
    case "add": {
      const username = args[1];
      const password = args[2];
      if (!username || !password) {
        console.error("\u274C Error: Both <username> and <password> are required.");
        console.log("Usage: npx tsx scripts/manage_admin.ts add <username> <password>");
        process.exit(1);
      }
      const res = createAdminUser(username, password);
      if (res.success) {
        console.log(`\u2705 Admin user '${username.toLowerCase()}' successfully created.`);
        const adminPath = getConfig("ADMIN_URL_PATH") || "/mod";
        console.log(`\u{1F510} Access your protected Admin Portal at: http://localhost:3000${adminPath}`);
      } else {
        console.error(`\u274C Error creating admin user: ${res.error}`);
        process.exit(1);
      }
      break;
    }
    case "passwd": {
      const username = args[1];
      const newPassword = args[2];
      if (!username || !newPassword) {
        console.error("\u274C Error: Both <username> and <new_password> are required.");
        console.log("Usage: npx tsx scripts/manage_admin.ts passwd <username> <new_password>");
        process.exit(1);
      }
      const res = updateAdminPassword(username, newPassword);
      if (res.success) {
        console.log(`\u2705 Password successfully updated for admin '${username.toLowerCase()}'.`);
      } else {
        console.error(`\u274C Error updating password: ${res.error}`);
        process.exit(1);
      }
      break;
    }
    case "list": {
      const users = getAdminUsers();
      if (users.length === 0) {
        console.log("\u26A0\uFE0F  No admin accounts found in database.");
        console.log("\u{1F449} Create your first admin: npx tsx scripts/manage_admin.ts add <username> <password>");
      } else {
        console.log(`\u{1F4CB} Total Registered Admins: ${users.length}
`);
        console.log("------------------------------------------------------------");
        console.log("Username".padEnd(20) + "Created Date".padEnd(25) + "ID");
        console.log("------------------------------------------------------------");
        for (const u of users) {
          const d = new Date(u.createdAt).toISOString().replace("T", " ").substring(0, 19);
          console.log(u.username.padEnd(20) + d.padEnd(25) + u.id);
        }
        console.log("------------------------------------------------------------");
      }
      const adminPath = getConfig("ADMIN_URL_PATH") || "/mod";
      console.log(`
\u{1F4CD} Active Admin URL Directive: ${adminPath}`);
      break;
    }
    case "del": {
      const username = args[1];
      if (!username) {
        console.error("\u274C Error: <username> is required.");
        console.log("Usage: npx tsx scripts/manage_admin.ts del <username>");
        process.exit(1);
      }
      const res = deleteAdminUser(username);
      if (res.success) {
        console.log(`\u2705 Admin user '${username.toLowerCase()}' successfully deleted.`);
      } else {
        console.error(`\u274C Error deleting admin: ${res.error}`);
        process.exit(1);
      }
      break;
    }
    case "get-path": {
      const adminPath = getConfig("ADMIN_URL_PATH") || "/mod";
      console.log(`\u{1F4CD} Current Admin URL Directive: ${adminPath}`);
      console.log(`\u{1F517} Portal URL: http://localhost:3000${adminPath}`);
      break;
    }
    case "set-path": {
      let newPath = args[1];
      if (!newPath) {
        console.error("\u274C Error: <directive> path is required.");
        console.log("Usage: npx tsx scripts/manage_admin.ts set-path <url_path>");
        process.exit(1);
      }
      if (!newPath.startsWith("/")) {
        newPath = "/" + newPath;
      }
      newPath = newPath.trim().replace(/\/+$/, "");
      if (newPath === "" || newPath === "/") {
        console.error('\u274C Error: Admin URL directive cannot be root "/" (reserved for seeker oracle view).');
        process.exit(1);
      }
      configManager.set("ADMIN_URL_PATH", newPath, "system", false, "Secret location directive for protected Admin Portal");
      console.log(`\u2705 Admin URL Directive updated to: ${newPath}`);
      console.log(`\u{1F517} Portal URL: http://localhost:3000${newPath}`);
      break;
    }
    case "get-ttl": {
      const ttl = getConfig("ADMIN_SESSION_TTL_HOURS") || "4";
      console.log(`\u23F1\uFE0F Current Admin Session TTL: ${ttl} hour(s)`);
      break;
    }
    case "set-ttl": {
      const hours = args[1];
      if (!hours || isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
        console.error("\u274C Error: <hours> must be a positive number.");
        console.log("Usage: npx tsx scripts/manage_admin.ts set-ttl <hours>");
        process.exit(1);
      }
      configManager.set("ADMIN_SESSION_TTL_HOURS", hours, "system", false, "Admin session cookie expiration timeout in hours");
      console.log(`\u2705 Admin Session Expiration TTL updated to: ${hours} hour(s)`);
      break;
    }
    default: {
      console.error(`\u274C Unknown command: '${command}'`);
      printUsage();
      process.exit(1);
    }
  }
}
main().catch((err) => {
  console.error("Unhandled CLI error:", err);
  process.exit(1);
});
