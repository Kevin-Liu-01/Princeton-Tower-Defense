import { STATION_TROOP_RANGE, TROOP_DATA } from "../constants";
import { calculateTowerStats } from "../constants/towerStats";
import type { Tower } from "../types";

/** The same effective defender stats are used by the simulation and UI. */
export function getTowerGarrison(tower: Tower) {
  const stats = calculateTowerStats(
    tower.type,
    tower.level,
    tower.upgrade,
    tower.rangeBoost || 1,
    tower.damageBoost || 1,
    tower.capstone
  );
  if (!stats.spawnTroopType || !stats.maxTroops) {
    return null;
  }
  const troop = TROOP_DATA[stats.spawnTroopType];
  const veteran = tower.type === "station" && tower.capstone;
  return {
    type: stats.spawnTroopType,
    name: troop.name,
    description: troop.desc,
    hp: Math.round(troop.hp * (veteran ? 1.35 : 1)),
    damage: Math.round(troop.damage * (veteran ? 1.3 : 1)),
    attackSpeed: troop.attackSpeed,
    maxTroops: stats.maxTroops,
    spawnInterval: stats.spawnInterval ?? 15_000,
    moveRadius: STATION_TROOP_RANGE * (tower.rangeBoost || 1),
  };
}

/** Cooldowns use simulation milliseconds, so pause and game speed stay correct. */
export function advanceSummonRespawns(tower: Tower, deltaTime: number) {
  return tower.pendingRespawns?.map((respawn) => ({
    ...respawn,
    timer: Math.max(0, respawn.timer - deltaTime),
  }));
}
