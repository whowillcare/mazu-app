#!/usr/bin/env tsx
/**
 * ==============================================================================
 * Mazu Lots System - Live Configuration Manager CLI
 * ==============================================================================
 * Usage:
 *   npm run config -- <command> [options]
 *   npx tsx scripts/manage_config.ts <command> [options]
 * ==============================================================================
 */

import fs from 'fs';
import {
  configManager,
  getConfig,
  setConfig,
  deleteConfig,
  reloadConfig,
  getAllConfigs,
  ConfigItem,
} from '../src/lib/config/configManager';
import { getConfigFilePath } from '../src/lib/storage/storageConfig';

const DEFAULT_SERVER_URL = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;

function printBanner() {
  console.log(`
┌────────────────────────────────────────────────────────┐
│   ✦ MAZU SIXTY JIAZI LOTS · CONFIGURATION MANAGER ✦    │
│   Dynamic Settings, Secret Vault & Live Hot-Reload     │
└────────────────────────────────────────────────────────┘
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

function maskSecret(val: string): string {
  if (!val) return '(empty)';
  if (val.length <= 8) return '••••••••';
  return `${val.slice(0, 4)}••••••••${val.slice(-4)}`;
}

function parseArgValue(args: string[], flag: string, shortFlag?: string): string | undefined {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag || (shortFlag && args[i] === shortFlag)) {
      return args[i + 1];
    }
    if (args[i].startsWith(`${flag}=`)) {
      return args[i].split('=')[1];
    }
  }
  return undefined;
}

function hasFlag(args: string[], flag: string, shortFlag?: string): boolean {
  return args.some((a) => a === flag || (shortFlag && a === shortFlag));
}

async function triggerLiveReload(serverUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${serverUrl}/api/config/reload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      console.log(`⚡ Live Reload: Running app at ${serverUrl} refreshed lively! (Config v${data.version}, ${data.count} keys active)`);
      return true;
    }
    return false;
  } catch {
    // Server is offline or unreachable
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  printBanner();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }

  const showSecrets = hasFlag(args, '--show-secrets', '-s');
  const asJson = hasFlag(args, '--json');
  const noReload = hasFlag(args, '--no-reload');
  const serverUrl = parseArgValue(args, '--url') || DEFAULT_SERVER_URL;

  switch (command) {
    case 'list':
    case 'ls': {
      const filterCategory = parseArgValue(args, '--category', '-c')?.toLowerCase();
      let configs = getAllConfigs();

      if (filterCategory) {
        configs = configs.filter((c) => c.category === filterCategory);
      }

      // Sort alphabetically by category, then key
      configs.sort((a, b) => a.category.localeCompare(b.category) || a.key.localeCompare(b.key));

      if (asJson) {
        const out = configs.map((c) => ({
          ...c,
          value: c.isSecret && !showSecrets ? maskSecret(c.value) : c.value,
        }));
        console.log(JSON.stringify(out, null, 2));
        return;
      }

      console.log(`📋 Active Configuration Settings (Total: ${configs.length})${filterCategory ? ` [Category: ${filterCategory}]` : ''}:`);
      console.log(`📁 File Backup: ${getConfigFilePath()}`);
      console.log('-'.repeat(105));
      console.log(
        `${'KEY'.padEnd(30)} ${'CATEGORY'.padEnd(10)} ${'SECRET'.padEnd(8)} ${'VALUE'.padEnd(32)} ${'UPDATED'}`
      );
      console.log('-'.repeat(105));

      for (const item of configs) {
        const valDisplay = item.isSecret && !showSecrets ? maskSecret(item.value) : item.value || '(empty)';
        const dateStr = item.updatedAt ? new Date(item.updatedAt).toISOString().replace('T', ' ').slice(0, 19) : '-';
        const truncatedVal = valDisplay.length > 30 ? `${valDisplay.slice(0, 27)}...` : valDisplay;

        console.log(
          `${item.key.padEnd(30)} ${item.category.padEnd(10)} ${(item.isSecret ? 'YES' : 'no').padEnd(8)} ${truncatedVal.padEnd(32)} ${dateStr}`
        );
        if (item.description) {
          console.log(`   ↳ \x1b[90m${item.description}\x1b[0m`);
        }
      }
      console.log('-'.repeat(105));
      if (!showSecrets) {
        console.log('💡 Tip: Sensitive tokens are masked with ••••. Use --show-secrets (-s) to reveal plain values.\n');
      }
      break;
    }

    case 'get': {
      const key = args[1]?.trim();
      if (!key) {
        console.error('❌ Error: Missing configuration key.');
        console.log('Usage: npm run config -- get <KEY> [--show-secrets]');
        process.exit(1);
      }

      const all = getAllConfigs();
      const item = all.find((c) => c.key.toUpperCase() === key.toUpperCase());

      if (!item) {
        console.error(`❌ Setting '${key}' not found in active configuration.`);
        process.exit(1);
      }

      if (asJson) {
        console.log(
          JSON.stringify(
            {
              ...item,
              value: item.isSecret && !showSecrets ? maskSecret(item.value) : item.value,
            },
            null,
            2
          )
        );
        return;
      }

      console.log(`\n🔍 Configuration Key: \x1b[36m${item.key}\x1b[0m`);
      console.log(`   Category:    ${item.category}`);
      console.log(`   Is Secret:   ${item.isSecret ? 'Yes (encrypted/masked)' : 'No (public)'}`);
      console.log(
        `   Value:       ${item.isSecret && !showSecrets ? maskSecret(item.value) : item.value || '(empty)'}`
      );
      console.log(
        `   Last Update: ${item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'System default'}`
      );
      if (item.description) {
        console.log(`   Description: ${item.description}`);
      }
      console.log();
      break;
    }

    case 'set': {
      const key = args[1]?.trim();
      const value = args[2]?.trim();

      if (!key || value === undefined) {
        console.error('❌ Error: Both <key> and <value> are required.');
        console.log('Usage: npm run config -- set <KEY> <VALUE> [--category <cat>] [--secret] [--desc <description>]');
        process.exit(1);
      }

      const categoryArg = parseArgValue(args, '--category', '-c') as 'ai' | 'payment' | 'system' | undefined;
      const descArg = parseArgValue(args, '--desc', '-d');
      const isSecretFlag = hasFlag(args, '--secret');
      const isNoSecretFlag = hasFlag(args, '--no-secret');

      let isSecret: boolean | undefined = undefined;
      if (isSecretFlag) isSecret = true;
      else if (isNoSecretFlag) isSecret = false;
      else if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN') || key.includes('PASS')) {
        isSecret = true;
      }

      const existingValue = getConfig(key);
      setConfig(key, value, categoryArg, isSecret, descArg);

      console.log(`✅ Setting updated successfully:`);
      console.log(`   Key:         \x1b[32m${key}\x1b[0m`);
      console.log(`   Value:       ${isSecret && !showSecrets ? maskSecret(value) : value}`);
      if (existingValue !== undefined) {
        console.log(`   Previous:    ${isSecret && !showSecrets ? maskSecret(existingValue) : existingValue}`);
      }
      if (categoryArg) console.log(`   Category:    ${categoryArg}`);
      if (descArg) console.log(`   Description: ${descArg}`);

      // Attempt live reload
      if (!noReload) {
        const reloaded = await triggerLiveReload(serverUrl);
        if (!reloaded) {
          console.log(`ℹ️  Persisted to persistent vault & file. (Server at ${serverUrl} is not running; will apply automatically on start)`);
        }
      }
      break;
    }

    case 'del':
    case 'rm':
    case 'delete':
    case 'remove': {
      const key = args[1]?.trim();
      if (!key) {
        console.error('❌ Error: Missing configuration key to delete.');
        console.log('Usage: npm run config -- del <KEY>');
        process.exit(1);
      }

      const existing = getConfig(key);
      if (existing === undefined) {
        console.warn(`⚠️ Warning: Setting '${key}' does not exist.`);
        process.exit(0);
      }

      const deleted = deleteConfig(key);
      if (deleted) {
        console.log(`🗑️  Successfully removed configuration setting: \x1b[33m${key}\x1b[0m`);
        if (!noReload) {
          const reloaded = await triggerLiveReload(serverUrl);
          if (!reloaded) {
            console.log(`ℹ️  Removed from persistent vault & file.`);
          }
        }
      } else {
        console.error(`❌ Failed to delete setting '${key}'.`);
      }
      break;
    }

    case 'reload': {
      console.log(`🔄 Triggering live configuration reload...`);
      const localResult = reloadConfig();
      console.log(`✅ Local configuration cache reloaded (v${localResult.version}, ${localResult.count} items).`);

      // Touch config file to trigger fs.watch in external running processes
      try {
        const filePath = getConfigFilePath();
        const time = new Date();
        fs.utimesSync(filePath, time, time);
      } catch {}

      // Trigger HTTP live reload on running server
      const reloaded = await triggerLiveReload(serverUrl);
      if (reloaded) {
        console.log(`🎉 Live application hot-reload confirmed successfully!`);
      } else {
        console.log(`ℹ️  Local persistent storage refreshed. Running server at ${serverUrl} was not detected or is offline.`);
      }
      break;
    }

    case 'reset': {
      const force = hasFlag(args, '--force');
      if (!force) {
        console.log(`⚠️  CAUTION: This will reset all configuration settings to system factory defaults.`);
        console.log(`   To proceed, re-run with: npm run config -- reset --force\n`);
        process.exit(0);
      }

      const res = configManager.resetToDefaults();
      console.log(`♻️  Configuration reset to factory defaults (v${res.version}).`);
      if (!noReload) {
        await triggerLiveReload(serverUrl);
      }
      break;
    }

    default: {
      console.error(`❌ Unknown command: '${command}'`);
      printUsage();
      process.exit(1);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Fatal CLI Error:', err);
  process.exit(1);
});
