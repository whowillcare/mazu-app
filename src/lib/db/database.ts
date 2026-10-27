import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'user_vault.db');
  dbInstance = new Database(dbPath);

  // Enable WAL (Write-Ahead Logging) mode for maximum concurrency and performance
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('synchronous = NORMAL');

  // Initialize tables
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
  `);

  return dbInstance;
}
