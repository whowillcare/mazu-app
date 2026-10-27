import crypto from 'crypto';
import { getDatabase } from '@/lib/db/database';
import { getConfig } from '@/lib/config/configManager';

export interface AdminUser {
  id: string;
  username: string;
  createdAt: number;
  updatedAt: number;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
  } catch {
    return false;
  }
}

export function hasAnyAdminUser(): boolean {
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
    return row.count > 0;
  } catch {
    return false;
  }
}

export function getAdminUsers(): AdminUser[] {
  try {
    const db = getDatabase();
    const rows = db.prepare('SELECT id, username, created_at, updated_at FROM admin_users ORDER BY created_at ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  } catch {
    return [];
  }
}

export function createAdminUser(username: string, password: string): { success: boolean; error?: string } {
  const cleanUsername = (username || '').trim().toLowerCase();
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const db = getDatabase();
    const id = `admin_${crypto.randomBytes(8).toString('hex')}`;
    const passwordHash = hashPassword(password);
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO admin_users (id, username, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, cleanUsername, passwordHash, now, now);
    return { success: true };
  } catch (err: any) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return { success: false, error: `Admin user '${cleanUsername}' already exists.` };
    }
    return { success: false, error: err.message || 'Failed to create admin user.' };
  }
}

export function updateAdminPassword(username: string, newPassword: string): { success: boolean; error?: string } {
  const cleanUsername = (username || '').trim().toLowerCase();
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  try {
    const db = getDatabase();
    const passwordHash = hashPassword(newPassword);
    const now = Date.now();
    const stmt = db.prepare('UPDATE admin_users SET password_hash = ?, updated_at = ? WHERE username = ?');
    const result = stmt.run(passwordHash, now, cleanUsername);
    if (result.changes === 0) {
      return { success: false, error: `Admin user '${cleanUsername}' not found.` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update password.' };
  }
}

export function deleteAdminUser(username: string): { success: boolean; error?: string } {
  const cleanUsername = (username || '').trim().toLowerCase();
  try {
    const db = getDatabase();
    const countRow = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
    if (countRow.count <= 1) {
      return { success: false, error: 'Cannot delete the only remaining admin account.' };
    }
    const stmt = db.prepare('DELETE FROM admin_users WHERE username = ?');
    const result = stmt.run(cleanUsername);
    if (result.changes === 0) {
      return { success: false, error: `Admin user '${cleanUsername}' not found.` };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete admin.' };
  }
}

export function authenticateAdmin(username: string, password: string): { success: boolean; error?: string } {
  const cleanUsername = (username || '').trim().toLowerCase();
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT password_hash FROM admin_users WHERE username = ?').get(cleanUsername) as { password_hash: string } | undefined;
    if (!row) {
      return { success: false, error: 'Invalid admin username or credentials.' };
    }
    const isValid = verifyPassword(password, row.password_hash);
    if (!isValid) {
      return { success: false, error: 'Invalid admin username or credentials.' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Authentication error.' };
  }
}

export function createAdminSession(username: string): { token: string; maxAgeSeconds: number; expiresAt: number } {
  const cleanUsername = (username || '').trim().toLowerCase();
  const token = `session_${crypto.randomBytes(32).toString('hex')}`;
  const now = Date.now();

  let ttlHours = 4;
  try {
    const rawTtl = getConfig('ADMIN_SESSION_TTL_HOURS');
    if (rawTtl) {
      const parsed = parseFloat(rawTtl);
      if (!isNaN(parsed) && parsed > 0) {
        ttlHours = parsed;
      }
    }
  } catch {
    ttlHours = 4;
  }

  const maxAgeSeconds = Math.round(ttlHours * 3600);
  const expiresAt = now + maxAgeSeconds * 1000;

  try {
    const db = getDatabase();
    // Clean up expired sessions periodically
    db.prepare('DELETE FROM admin_sessions WHERE expires_at < ?').run(now);

    const stmt = db.prepare('INSERT INTO admin_sessions (token, username, created_at, expires_at) VALUES (?, ?, ?, ?)');
    stmt.run(token, cleanUsername, now, expiresAt);
  } catch (err) {
    console.error('[AdminAuth] Failed saving session:', err);
  }

  return { token, maxAgeSeconds, expiresAt };
}

export function verifyAdminSession(token: string): { valid: boolean; username?: string } {
  if (!token) return { valid: false };
  try {
    const db = getDatabase();
    const now = Date.now();
    const row = db.prepare('SELECT username, expires_at FROM admin_sessions WHERE token = ?').get(token) as { username: string; expires_at: number } | undefined;
    if (!row) return { valid: false };
    if (row.expires_at < now) {
      db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
      return { valid: false };
    }
    return { valid: true, username: row.username };
  } catch {
    return { valid: false };
  }
}

export function destroyAdminSession(token: string): void {
  if (!token) return;
  try {
    const db = getDatabase();
    db.prepare('DELETE FROM admin_sessions WHERE token = ?').run(token);
  } catch (err) {
    console.error('[AdminAuth] Error destroying session:', err);
  }
}
