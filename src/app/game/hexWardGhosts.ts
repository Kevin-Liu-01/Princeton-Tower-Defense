import { ENEMY_DATA, HERO_DATA, TROOP_DATA } from "../constants";
import type { Enemy, Hero, Troop, TroopType } from "../types";

export type HexWardGhostStrength = "weak" | "medium" | "strong" | "apex";

export interface HexWardGhostProfile {
  troopType: TroopType;
  hp: number;
  damage: number;
  attackSpeed: number;
  lifetimeMs: number;
  decayPerSecond: number;
  isRanged?: boolean;
  range?: number;
  canTargetFlying?: boolean;
}

const WEAK_ENEMY_SCORE = 520;
const STRONG_ENEMY_SCORE = 2400;
const APEX_ENEMY_SCORE = 4200;
const WEAK_TROOP_SCORE = 700;
const STRONG_TROOP_SCORE = 1850;
const APEX_TROOP_SCORE = 2900;

function getEnemyStrengthScore(enemy: Enemy): number {
  const enemyData = ENEMY_DATA[enemy.type];
  const traitCount = enemyData.traits?.length ?? 0;
  const bossBonus =
    enemyData.isBoss || enemyData.traits?.includes("boss") ? 1600 : 0;
  const rangedBonus = enemyData.isRanged ? 140 : 0;
  const flyingBonus = enemyData.flying ? 110 : 0;
  return (
    enemyData.hp +
    enemyData.bounty * 45 +
    enemyData.armor * 900 +
    traitCount * 85 +
    bossBonus +
    rangedBonus +
    flyingBonus
  );
}

function getTroopStrengthScore(troop: Troop): number {
  const troopType = troop.type ?? "footsoldier";
  const troopData = TROOP_DATA[troopType];
  const damage = troop.overrideDamage ?? troopData.damage;
  const attackSpeed = troop.overrideAttackSpeed ?? troopData.attackSpeed;
  const isRanged = troop.overrideIsRanged ?? troopData.isRanged ?? false;
  const rangedBonus = isRanged ? 160 : 0;
  const mountedBonus = troopData.isMounted ? 180 : 0;
  const stationaryPenalty = troopData.isStationary ? -220 : 0;
  const speedScore = Math.max(0, 1250 - attackSpeed) * 0.25;
  return (
    troop.maxHp +
    damage * 14 +
    speedScore +
    rangedBonus +
    mountedBonus +
    stationaryPenalty
  );
}

function classifyStrength(
  score: number,
  weakThreshold: number,
  strongThreshold: number,
  apexThreshold: number
): HexWardGhostStrength {
  if (score >= apexThreshold) {
    return "apex";
  }
  if (score >= strongThreshold) {
    return "strong";
  }
  if (score >= weakThreshold) {
    return "medium";
  }
  return "weak";
}

export function getHexWardGhostStrengthFromEnemy(
  enemy: Enemy
): HexWardGhostStrength {
  return classifyStrength(
    getEnemyStrengthScore(enemy),
    WEAK_ENEMY_SCORE,
    STRONG_ENEMY_SCORE,
    APEX_ENEMY_SCORE
  );
}

export function getHexWardGhostStrengthFromTroop(
  troop: Troop
): HexWardGhostStrength {
  return classifyStrength(
    getTroopStrengthScore(troop),
    WEAK_TROOP_SCORE,
    STRONG_TROOP_SCORE,
    APEX_TROOP_SCORE
  );
}

export function getHexWardGhostStrengthFromHero(
  hero: Hero
): HexWardGhostStrength {
  const heroData = HERO_DATA[hero.type];
  const heroScore =
    hero.maxHp + heroData.damage * 18 + (heroData.isRanged ? 220 : 0) + 1200;
  return classifyStrength(heroScore, 900, 2200, 3200);
}

export function getHexWardGhostProfile(
  strength: HexWardGhostStrength
): HexWardGhostProfile {
  switch (strength) {
    case "weak": {
      return {
        attackSpeed: 1220,
        damage: 8,
        decayPerSecond: 24,
        hp: 420,
        lifetimeMs: 14_000,
        troopType: "rowing",
      };
    }
    case "medium": {
      return {
        attackSpeed: 1020,
        damage: 13,
        decayPerSecond: 30,
        hp: 640,
        lifetimeMs: 17_000,
        troopType: "thesis",
      };
    }
    case "strong": {
      return {
        attackSpeed: 940,
        canTargetFlying: true,
        damage: 18,
        decayPerSecond: 38,
        hp: 860,
        isRanged: true,
        lifetimeMs: 19_000,
        range: 225,
        troopType: "hexling",
      };
    }
    case "apex": {
      return {
        attackSpeed: 820,
        canTargetFlying: true,
        damage: 25,
        decayPerSecond: 46,
        hp: 1180,
        isRanged: true,
        lifetimeMs: 22_000,
        range: 260,
        troopType: "hexseer",
      };
    }
  }
}

export function isHexWardGhostHarvestActive(
  endTime: number | null | undefined,
  now: number
): boolean {
  return !!endTime && endTime > now;
}
