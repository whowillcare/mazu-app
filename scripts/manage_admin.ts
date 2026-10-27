#!/usr/bin/env tsx
/**
 * ==============================================================================
 * Mazu Lots System - Local Admin & Configuration CLI Manager
 * ==============================================================================
 * Usage:
 *   npx tsx scripts/manage_admin.ts add <username> <password>
 *   npx tsx scripts/manage_admin.ts passwd <username> <new_password>
 *   npx tsx scripts/manage_admin.ts list
 *   npx tsx scripts/manage_admin.ts del <username>
 *   npx tsx scripts/manage_admin.ts set-path <url_path>
 *   npx tsx scripts/manage_admin.ts get-path
 * ==============================================================================
 */

import {
  createAdminUser,
  getAdminUsers,
  updateAdminPassword,
  deleteAdminUser,
  hasAnyAdminUser,
} from '../src/lib/auth/adminAuth';
import { configManager, getConfig } from '../src/lib/config/configManager';

function printBanner() {
  console.log(`
┌────────────────────────────────────────────────────────┐
│   ✦ MAZU SIXTY JIAZI LOTS · ADMIN CLI MANAGER ✦        │
│   Secure Admin Account & Route Directive Control       │
└────────────────────────────────────────────────────────┘
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
  help                            Show this help message

Examples:
  npx tsx scripts/manage_admin.ts add master s3cretP@ssw0rd!
  npx tsx scripts/manage_admin.ts set-path /mod
  npx tsx scripts/manage_admin.ts list
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  printBanner();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    printUsage();
    process.exit(0);
  }

  switch (command) {
    case 'add': {
      const username = args[1];
      const password = args[2];
      if (!username || !password) {
        console.error('❌ Error: Both <username> and <password> are required.');
        console.log('Usage: npx tsx scripts/manage_admin.ts add <username> <password>');
        process.exit(1);
      }
      const res = createAdminUser(username, password);
      if (res.success) {
        console.log(`✅ Admin user '${username.toLowerCase()}' successfully created.`);
        const adminPath = getConfig('ADMIN_URL_PATH') || '/mod';
        console.log(`🔐 Access your protected Admin Portal at: http://localhost:3000${adminPath}`);
      } else {
        console.error(`❌ Error creating admin user: ${res.error}`);
        process.exit(1);
      }
      break;
    }

    case 'passwd': {
      const username = args[1];
      const newPassword = args[2];
      if (!username || !newPassword) {
        console.error('❌ Error: Both <username> and <new_password> are required.');
        console.log('Usage: npx tsx scripts/manage_admin.ts passwd <username> <new_password>');
        process.exit(1);
      }
      const res = updateAdminPassword(username, newPassword);
      if (res.success) {
        console.log(`✅ Password successfully updated for admin '${username.toLowerCase()}'.`);
      } else {
        console.error(`❌ Error updating password: ${res.error}`);
        process.exit(1);
      }
      break;
    }

    case 'list': {
      const users = getAdminUsers();
      if (users.length === 0) {
        console.log('⚠️  No admin accounts found in database.');
        console.log('👉 Create your first admin: npx tsx scripts/manage_admin.ts add <username> <password>');
      } else {
        console.log(`📋 Total Registered Admins: ${users.length}\n`);
        console.log('------------------------------------------------------------');
        console.log('Username'.padEnd(20) + 'Created Date'.padEnd(25) + 'ID');
        console.log('------------------------------------------------------------');
        for (const u of users) {
          const d = new Date(u.createdAt).toISOString().replace('T', ' ').substring(0, 19);
          console.log(u.username.padEnd(20) + d.padEnd(25) + u.id);
        }
        console.log('------------------------------------------------------------');
      }
      const adminPath = getConfig('ADMIN_URL_PATH') || '/mod';
      console.log(`\n📍 Active Admin URL Directive: ${adminPath}`);
      break;
    }

    case 'del': {
      const username = args[1];
      if (!username) {
        console.error('❌ Error: <username> is required.');
        console.log('Usage: npx tsx scripts/manage_admin.ts del <username>');
        process.exit(1);
      }
      const res = deleteAdminUser(username);
      if (res.success) {
        console.log(`✅ Admin user '${username.toLowerCase()}' successfully deleted.`);
      } else {
        console.error(`❌ Error deleting admin: ${res.error}`);
        process.exit(1);
      }
      break;
    }

    case 'get-path': {
      const adminPath = getConfig('ADMIN_URL_PATH') || '/mod';
      console.log(`📍 Current Admin URL Directive: ${adminPath}`);
      console.log(`🔗 Portal URL: http://localhost:3000${adminPath}`);
      break;
    }

    case 'set-path': {
      let newPath = args[1];
      if (!newPath) {
        console.error('❌ Error: <directive> path is required.');
        console.log('Usage: npx tsx scripts/manage_admin.ts set-path <url_path>');
        process.exit(1);
      }
      if (!newPath.startsWith('/')) {
        newPath = '/' + newPath;
      }
      newPath = newPath.trim().replace(/\/+$/, '');
      if (newPath === '' || newPath === '/') {
        console.error('❌ Error: Admin URL directive cannot be root "/" (reserved for seeker oracle view).');
        process.exit(1);
      }

      configManager.set('ADMIN_URL_PATH', newPath, 'system', false, 'Secret location directive for protected Admin Portal');
      console.log(`✅ Admin URL Directive updated to: ${newPath}`);
      console.log(`🔗 Portal URL: http://localhost:3000${newPath}`);
      break;
    }

    default: {
      console.error(`❌ Unknown command: '${command}'`);
      printUsage();
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error('Unhandled CLI error:', err);
  process.exit(1);
});
