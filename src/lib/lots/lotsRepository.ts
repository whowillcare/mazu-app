import fs from 'fs';
import { CanonicalLot } from '../types/lots';
import { DOMAINS } from './domains';
import { getCanonicalLotsFilePath, getCustomLotsFilePath } from '@/lib/storage/storageConfig';

export { DOMAINS };

let cachedLots: CanonicalLot[] | null = null;

/**
 * Loads canonical lots:
 * 1. Base dataset from readonly image/git asset `data/canonical/lots_compiled.json`
 * 2. Overlays any persistent custom modifications from `storage/lots_custom.json`
 */
export function getCanonicalLots(includeInternal = false): CanonicalLot[] {
  if (!cachedLots) {
    const canonicalPath = getCanonicalLotsFilePath();
    if (!fs.existsSync(canonicalPath)) {
      throw new Error(`Readonly canonical lot dataset not found at: ${canonicalPath}`);
    }

    const raw = fs.readFileSync(canonicalPath, 'utf-8');
    const data = JSON.parse(raw);
    const baseLots = data.lots as CanonicalLot[];

    // Check for custom lot overrides in persistent storage
    const customPath = getCustomLotsFilePath();
    if (fs.existsSync(customPath)) {
      try {
        const customRaw = fs.readFileSync(customPath, 'utf-8');
        const customData = JSON.parse(customRaw);
        const overrides: CanonicalLot[] = Array.isArray(customData)
          ? customData
          : (customData.customLots || customData.lots || []);

        const overrideMap = new Map<number, CanonicalLot>();
        for (const ov of overrides) {
          if (ov && typeof ov.lot_number === 'number') {
            overrideMap.set(ov.lot_number, ov);
          }
        }

        cachedLots = baseLots.map((l) =>
          overrideMap.has(l.lot_number) ? { ...l, ...overrideMap.get(l.lot_number)! } : l
        );
      } catch (err) {
        console.warn('[LotsRepository] Warning reading custom lots from storage, using canonical base:', err);
        cachedLots = baseLots;
      }
    } else {
      cachedLots = baseLots;
    }
  }

  if (includeInternal) {
    return cachedLots;
  }

  // Filter out internal-only raw temple criteria for public users
  return cachedLots.map((lot) => {
    const { internal, ...publicCriteria } = lot.criteria;
    void internal;
    return {
      ...lot,
      criteria: publicCriteria,
    };
  });
}

export function getLotByNumber(lotNumber: number, includeInternal = false): CanonicalLot | null {
  const lots = getCanonicalLots(includeInternal);
  return lots.find((l) => l.lot_number === lotNumber) || null;
}

export function getLotById(id: string, includeInternal = false): CanonicalLot | null {
  const lots = getCanonicalLots(includeInternal);
  return lots.find((l) => l.id === id) || null;
}

/**
 * Updates a lot by saving the custom modification into persistent storage (`storage/lots_custom.json`).
 * The readonly base canonical file (`data/canonical/lots_compiled.json`) remains untouched.
 */
export function updateCanonicalLot(updatedLot: CanonicalLot): void {
  const lots = getCanonicalLots(true);
  const index = lots.findIndex((l) => l.lot_number === updatedLot.lot_number);
  if (index === -1) {
    throw new Error(`Lot #${updatedLot.lot_number} not found.`);
  }

  // Update in-memory lot
  lots[index] = { ...lots[index], ...updatedLot };
  cachedLots = lots;

  // Persist custom lot override to storage/lots_custom.json
  const customPath = getCustomLotsFilePath();
  try {
    let customMap: Record<number, CanonicalLot> = {};
    if (fs.existsSync(customPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(customPath, 'utf-8'));
        const list: CanonicalLot[] = Array.isArray(existing)
          ? existing
          : (existing.customLots || existing.lots || []);
        for (const item of list) {
          if (item && typeof item.lot_number === 'number') {
            customMap[item.lot_number] = item;
          }
        }
      } catch {}
    }

    customMap[updatedLot.lot_number] = updatedLot;

    const payload = {
      updated_at: new Date().toISOString(),
      total_custom_lots: Object.keys(customMap).length,
      customLots: Object.values(customMap),
    };

    fs.writeFileSync(customPath, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LotsRepository] Failed persisting custom lot to storage:', err);
    throw new Error(`Failed to persist lot customizations to storage: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Reverts custom modifications for a lot back to the base canonical data.
 */
export function resetCustomLot(lotNumber: number): void {
  const customPath = getCustomLotsFilePath();
  if (!fs.existsSync(customPath)) return;

  try {
    const existing = JSON.parse(fs.readFileSync(customPath, 'utf-8'));
    const list: CanonicalLot[] = Array.isArray(existing)
      ? existing
      : (existing.customLots || existing.lots || []);
    const filtered = list.filter((l) => l.lot_number !== lotNumber);

    const payload = {
      updated_at: new Date().toISOString(),
      total_custom_lots: filtered.length,
      customLots: filtered,
    };

    fs.writeFileSync(customPath, JSON.stringify(payload, null, 2), 'utf-8');
    cachedLots = null; // Invalidate cache so it reloads fresh
  } catch (err) {
    console.error(`[LotsRepository] Failed resetting custom lot #${lotNumber}:`, err);
  }
}
