import type { TowerDebuff } from "../types";

/**
 * Adds a debuff or refreshes an existing one of the same type.
 * Returns a new array (does not mutate the input).
 */
export function addOrRefreshDebuff(
  debuffs: TowerDebuff[],
  debuffType: TowerDebuff["type"],
  intensity: number,
  until: number,
  sourceId: string,
  now: number
): TowerDebuff[] {
  const filtered = (debuffs || []).filter(
    (d) => d.until > now && d.type !== debuffType
  );
  filtered.push({ type: debuffType, intensity, until, sourceId });
  return filtered;
}
