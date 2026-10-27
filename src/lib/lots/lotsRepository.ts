import fs from 'fs';
import path from 'path';
import { CanonicalLot } from '../types/lots';
import { DOMAINS } from './domains';

export { DOMAINS };

let cachedLots: CanonicalLot[] | null = null;

export function getCanonicalLots(includeInternal = false): CanonicalLot[] {
  if (!cachedLots) {
    const filePath = path.join(process.cwd(), 'data/canonical/lots_compiled.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    cachedLots = data.lots as CanonicalLot[];
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

export function updateCanonicalLot(updatedLot: CanonicalLot): void {
  const lots = getCanonicalLots(true);
  const index = lots.findIndex((l) => l.lot_number === updatedLot.lot_number);
  if (index === -1) {
    throw new Error(`Lot #${updatedLot.lot_number} not found.`);
  }

  // Update in memory
  lots[index] = { ...lots[index], ...updatedLot };
  cachedLots = lots;

  // Persist to data/canonical/lots_compiled.json
  const filePath = path.join(process.cwd(), 'data/canonical/lots_compiled.json');
  const payload = {
    canon: 'sixty_jiazi_mazu',
    version: '1.2.0',
    updated_at: new Date().toISOString(),
    total_lots: lots.length,
    lots,
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}
