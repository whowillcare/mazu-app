import { getDatabase } from '../db/database';

export interface UserEntitlement {
  id: string;
  userId: string;
  planId: string;
  provider: string;
  providerSubId?: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd?: number;
  updatedAt: number;
}

export class EntitlementService {
  static grantEntitlement(
    userId: string,
    planId: string,
    provider: string,
    providerSubId?: string
  ): void {
    const db = getDatabase();
    const id = `ent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO user_entitlements (id, user_id, plan_id, provider, provider_sub_id, status, updated_at)
      VALUES (?, ?, ?, ?, ?, 'active', ?)
    `);
    stmt.run(id, userId, planId, provider, providerSubId || null, now);
  }

  static hasEntitlement(userId: string, planId: string): boolean {
    const db = getDatabase();
    const row = db
      .prepare(`SELECT id FROM user_entitlements WHERE user_id = ? AND plan_id = ? AND status = 'active'`)
      .get(userId, planId);
    return !!row;
  }

  static logCrdWaiver(
    userId: string,
    orderId: string,
    lotNumber: number,
    amountCents: number,
    ipAddress?: string
  ): void {
    const db = getDatabase();
    const id = `crd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO crd_compliance_logs (id, user_id, lot_number, order_id, waiver_accepted_at, ip_address, amount_cents)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, userId, lotNumber, orderId, now, ipAddress || 'unknown', amountCents);
  }
}
