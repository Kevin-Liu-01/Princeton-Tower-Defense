// Princeton Tower Defense - Tower Management System
// Handles tower placement, upgrades, and special towers

import type { Tower, TowerType, TowerUpgrade, Position, GridPosition, Enemy, Troop } from "../../types";
import { TOWER_DATA, LEVEL_DATA } from "../../constants";
import { TOWER_STATS, calculateTowerStats, getUpgradeCost, getUpgradePath } from "../../constants/towerStats";
import { gridToWorld, distance, isValidBuildPosition } from "../../utils";

// ============================================================================
// TOWER CREATION
// ============================================================================

/**
 * Create a new tower
 */
export function createTower(
  type: TowerType,
  pos: GridPosition,
  towerId: string
): Tower {
  const towerData = TOWER_DATA[type];
  
  return {
    id: towerId,
    type,
    pos,
    level: 1,
    lastAttack: 0,
    rotation: 0,
    spawnRange: towerData.spawnRange || (type === "station" ? 80 : undefined),
    damageBoost: 1,
    rangeBoost: 1,
    isBuffed: false,
  };
}

/**
 * Get the cost to build a tower
 */
export function getTowerBuildCost(type: TowerType): number {
  return TOWER_DATA[type]?.cost || 0;
}

/**
 * Check if a tower can be built at a position
 */
export function canBuildTower(
  pos: GridPosition,
  selectedMap: string,
  existingTowers: Tower[],
  gridWidth: number,
  gridHeight: number,
  minPathDistance: number = 40
): boolean {
  return isValidBuildPosition(pos, selectedMap, existingTowers, gridWidth, gridHeight, minPathDistance);
}

// ============================================================================
// TOWER UPGRADES
// ============================================================================

/**
 * Get the cost to upgrade a tower
 */
export function getTowerUpgradeCost(tower: Tower): number {
  if (tower.level >= 4) return 0; // Already max level
  return getUpgradeCost(tower.type, tower.level);
}

/**
 * Check if a tower can be upgraded
 */
export function canUpgradeTower(tower: Tower, currentGold: number): boolean {
  if (tower.level >= 4) return false;
  const cost = getTowerUpgradeCost(tower);
  return currentGold >= cost;
}

/**
 * Upgrade a tower to the next level
 */
export function upgradeTower(tower: Tower): number {
  if (tower.level >= 4) return 0;
  
  const cost = getTowerUpgradeCost(tower);
  tower.level = Math.min(tower.level + 1, 3) as 1 | 2 | 3 | 4;
  
  return cost;
}

/**
 * Apply a level 4 specialization upgrade
 */
export function applySpecialization(tower: Tower, path: TowerUpgrade): void {
  if (tower.level !== 3) return;
  
  tower.level = 4;
  tower.upgrade = path;
}

/**
 * Get upgrade info for display
 */
export function getUpgradeInfo(tower: Tower): {
  currentStats: ReturnType<typeof calculateTowerStats>;
  nextStats?: ReturnType<typeof calculateTowerStats>;
  cost: number;
  description: string;
} {
  const currentStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
  let nextStats = undefined;
  let description = "";

  if (tower.level < 3) {
    nextStats = calculateTowerStats(tower.type, tower.level + 1);
    const towerDef = TOWER_STATS[tower.type];
    description = towerDef?.levels[(tower.level + 1) as 1 | 2 | 3]?.description || "";
  }

  return {
    currentStats,
    nextStats,
    cost: getTowerUpgradeCost(tower),
    description,
  };
}

/**
 * Get specialization options for level 3 towers
 */
export function getSpecializationOptions(tower: Tower): {
  A: { name: string; description: string; effect: string };
  B: { name: string; description: string; effect: string };
} | null {
  if (tower.level !== 3) return null;

  const pathA = getUpgradePath(tower.type, "A");
  const pathB = getUpgradePath(tower.type, "B");

  if (!pathA || !pathB) return null;

  return {
    A: { name: pathA.name, description: pathA.description, effect: pathA.effect },
    B: { name: pathB.name, description: pathB.description, effect: pathB.effect },
  };
}

// ============================================================================
// TOWER SELLING
// ============================================================================

/**
 * Calculate sell value for a tower
 */
export function getTowerSellValue(tower: Tower): number {
  let totalInvested = getTowerBuildCost(tower.type);
  
  // Add upgrade costs
  const towerDef = TOWER_STATS[tower.type];
  if (towerDef) {
    for (let level = 2; level <= Math.min(tower.level, 3); level++) {
      totalInvested += towerDef.levels[level as 1 | 2 | 3]?.cost || 0;
    }
    
    // Level 4 specialization cost
    if (tower.level === 4) {
      totalInvested += 400; // Standard specialization cost
    }
  }

  // Return 60% of invested value
  return Math.floor(totalInvested * 0.6);
}

/**
 * Sell a tower and return its value
 */
export function sellTower(tower: Tower): number {
  return getTowerSellValue(tower);
}

// ============================================================================
// STATION TOWER MANAGEMENT
// ============================================================================

/**
 * Get spawn positions for a station tower
 */
export function getStationSpawnPositions(tower: Tower): Position[] {
  if (tower.type !== "station") return [];
  
  const worldPos = gridToWorld(tower.pos);
  const spawnRange = tower.spawnRange || 80;
  
  // Spawn positions in a semicircle in front of the station
  const positions: Position[] = [];
  const maxTroops = getMaxTroopsForStation(tower);
  
  for (let i = 0; i < maxTroops; i++) {
    const angle = (Math.PI * 0.75) + (i / (maxTroops - 1 || 1)) * (Math.PI * 0.5);
    positions.push({
      x: worldPos.x + Math.cos(angle) * spawnRange,
      y: worldPos.y + Math.sin(angle) * spawnRange * 0.5, // Isometric adjustment
    });
  }
  
  return positions;
}

/**
 * Get max troops for a station based on level
 */
export function getMaxTroopsForStation(tower: Tower): number {
  if (tower.type !== "station") return 0;
  
  const stats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
  return stats.maxTroops || 1;
}

/**
 * Get troop type for a station based on level/upgrade
 */
export function getStationTroopType(tower: Tower): string {
  if (tower.type !== "station") return "footsoldier";
  
  const stats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
  return stats.spawnTroopType || "footsoldier";
}

/**
 * Check if station can spawn a new troop
 */
export function canStationSpawn(tower: Tower, currentTroopCount: number, now: number): boolean {
  if (tower.type !== "station") return false;
  
  const maxTroops = getMaxTroopsForStation(tower);
  if (currentTroopCount >= maxTroops) return false;
  
  const stats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
  const spawnInterval = stats.spawnInterval || 5000;
  
  const lastSpawn = tower.lastSpawn || 0;
  return now - lastSpawn >= spawnInterval;
}

// ============================================================================
// BUFF SYSTEM
// ============================================================================

/**
 * Apply beacon buff to nearby towers
 */
export function applyBeaconBuffs(
  towers: Tower[],
  beaconPos: Position,
  beaconRange: number = 250
): void {
  for (const tower of towers) {
    if (tower.type === "station") continue; // Stations don't benefit from beacon
    
    const towerWorldPos = gridToWorld(tower.pos);
    const dist = distance(towerWorldPos, beaconPos);
    
    if (dist <= beaconRange) {
      tower.rangeBoost = 1.2;
      tower.isBuffed = true;
    }
  }
}

/**
 * Apply Scott's damage buff to nearby towers
 */
export function applyScottDamageBuffs(
  towers: Tower[],
  scottPos: Position,
  buffRange: number = 200,
  buffDuration: number = 10000
): void {
  const now = Date.now();
  
  for (const tower of towers) {
    const towerWorldPos = gridToWorld(tower.pos);
    const dist = distance(towerWorldPos, scottPos);
    
    if (dist <= buffRange) {
      tower.damageBoost = 1.5;
      tower.boostEnd = now + buffDuration;
      tower.isBuffed = true;
    }
  }
}

/**
 * Update buff states for all towers
 */
export function updateTowerBuffs(
  towers: Tower[],
  specialTower?: { type: string; pos: Position } | null
): void {
  const now = Date.now();
  
  for (const tower of towers) {
    // Check if Scott buff expired
    if (tower.boostEnd && now >= tower.boostEnd) {
      tower.damageBoost = 1;
      tower.boostEnd = undefined;
    }
    
    // Reset beacon buff (will be re-applied if beacon still nearby)
    if (!tower.boostEnd) {
      tower.rangeBoost = 1;
    }
    
    // Update buffed state
    tower.isBuffed = (tower.damageBoost || 1) > 1 || (tower.rangeBoost || 1) > 1;
  }
  
  // Re-apply beacon buffs if beacon exists
  if (specialTower?.type === "beacon") {
    applyBeaconBuffs(towers, specialTower.pos);
  }
}

// ============================================================================
// CLUB TOWER (ECONOMY)
// ============================================================================

/**
 * Check if club tower should generate income
 */
export function shouldClubGenerateIncome(tower: Tower, now: number): boolean {
  if (tower.type !== "club") return false;
  
  const stats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
  const incomeInterval = stats.incomeInterval || 8000;
  
  const lastIncome = tower.lastSpawn || 0; // Reusing lastSpawn for income timer
  return now - lastIncome >= incomeInterval;
}

/**
 * Get income amount for club tower
 */
export function getClubIncomeAmount(tower: Tower): number {
  if (tower.type !== "club") return 0;
  
  const stats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
  return stats.income || 0;
}

/**
 * Get global income bonus from Investment Bank upgrade
 */
export function getGlobalIncomeBonus(towers: Tower[]): number {
  let bonus = 1;
  
  for (const tower of towers) {
    if (tower.type === "club" && tower.level === 4 && tower.upgrade === "A") {
      const stats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
      bonus += stats.bonusIncomeMultiplier || 0;
    }
  }
  
  return bonus;
}

/**
 * Get nearby damage buff from Recruitment Center upgrade
 */
export function getRecruitmentCenterBuff(tower: Tower, clubTowers: Tower[]): number {
  let buff = 1;
  const towerWorldPos = gridToWorld(tower.pos);
  
  for (const club of clubTowers) {
    if (club.type === "club" && club.level === 4 && club.upgrade === "B") {
      const stats = calculateTowerStats(club.type, club.level, club.upgrade);
      const clubWorldPos = gridToWorld(club.pos);
      const dist = distance(towerWorldPos, clubWorldPos);
      
      if (dist <= (stats.range || 200)) {
        buff = Math.max(buff, 1 + (stats.damageBuff || 0));
      }
    }
  }
  
  return buff;
}
