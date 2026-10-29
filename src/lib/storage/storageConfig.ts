import path from 'path';
import fs from 'fs';

/**
 * Storage Configuration & Path Resolver
 * 
 * Cleanly separates:
 * 1. Readonly Canonical Data: `data/canonical/lots_compiled.json` (baked into container image / git)
 * 2. Persistent User & Custom Data: `storage/` (SQLite vault, custom configs, astrology rules, lot customizations)
 */

let resolvedStorageDir: string | null = null;

export function ensureProperOwnership(targetPath: string): void {
  try {
    if (typeof process.getuid === 'function' && process.getuid() === 0) {
      if (fs.existsSync(targetPath)) {
        fs.chownSync(targetPath, 1001, 1001);
      }
    }
  } catch {}
}

export function getStorageDir(): string {
  if (resolvedStorageDir) {
    return resolvedStorageDir;
  }

  // 1. Environment variable priority
  const envDir = process.env.STORAGE_DIR || process.env.PERSISTENCE_DIR;
  if (envDir) {
    if (!fs.existsSync(envDir)) {
      try {
        fs.mkdirSync(envDir, { recursive: true });
      } catch (e) {
        console.warn(`[StorageConfig] Warning: could not create storage directory ${envDir}:`, e);
      }
    }
    resolvedStorageDir = envDir;
    ensureProperOwnership(resolvedStorageDir);
    return resolvedStorageDir;
  }

  // 2. Default to <cwd>/storage
  const defaultDir = path.join(process.cwd(), 'storage');
  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch (e) {
      console.warn(`[StorageConfig] Warning: could not create default storage directory ${defaultDir}:`, e);
    }
  }

  // 3. Graceful migration: check if legacy files exist in <cwd>/data and auto-copy if storage is empty
  const legacyDataDir = path.join(process.cwd(), 'data');
  try {
    const legacyDb = path.join(legacyDataDir, 'user_vault.db');
    const targetDb = path.join(defaultDir, 'user_vault.db');
    if (fs.existsSync(legacyDb) && !fs.existsSync(targetDb)) {
      fs.copyFileSync(legacyDb, targetDb);
      // Copy WAL files if present
      if (fs.existsSync(`${legacyDb}-wal`)) fs.copyFileSync(`${legacyDb}-wal`, `${targetDb}-wal`);
      if (fs.existsSync(`${legacyDb}-shm`)) fs.copyFileSync(`${legacyDb}-shm`, `${targetDb}-shm`);
      console.log('[StorageConfig] Successfully migrated legacy user_vault.db to storage/');
    }

    const legacyConfig = path.join(legacyDataDir, 'app_config.json');
    const targetConfig = path.join(defaultDir, 'app_config.json');
    if (fs.existsSync(legacyConfig) && !fs.existsSync(targetConfig)) {
      fs.copyFileSync(legacyConfig, targetConfig);
      console.log('[StorageConfig] Successfully migrated legacy app_config.json to storage/');
    }

    const legacyAstrology = path.join(legacyDataDir, 'astrology_rules.json');
    const targetAstrology = path.join(defaultDir, 'astrology_rules.json');
    if (fs.existsSync(legacyAstrology) && !fs.existsSync(targetAstrology)) {
      fs.copyFileSync(legacyAstrology, targetAstrology);
      console.log('[StorageConfig] Successfully migrated legacy astrology_rules.json to storage/');
    }
  } catch (err) {
    console.warn('[StorageConfig] Note during legacy data migration check:', err);
  }

  resolvedStorageDir = defaultDir;
  ensureProperOwnership(resolvedStorageDir);
  return resolvedStorageDir;
}

export function getDatabasePath(): string {
  return path.join(getStorageDir(), 'user_vault.db');
}

export function getConfigFilePath(): string {
  return path.join(getStorageDir(), 'app_config.json');
}

export function getAstrologyRulesFilePath(): string {
  return path.join(getStorageDir(), 'astrology_rules.json');
}

export function getCustomLotsFilePath(): string {
  return path.join(getStorageDir(), 'lots_custom.json');
}

export function getCanonicalLotsFilePath(): string {
  // Readonly canonical dataset shipped with the codebase/image
  return path.join(process.cwd(), 'data', 'canonical', 'lots_compiled.json');
}
