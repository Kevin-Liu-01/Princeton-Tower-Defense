import type { MutableRefObject } from "react";
import type {
  Position,
  Enemy,
  Hero,
  Troop,
  Effect,
  Particle,
  DeathCause,
} from "../../types";
import type { EntityCounts } from "./renderScene";
import type { GameEventLogAPI } from "../useGameEventLog";
import {
  PARTICLE_COLORS,
  ENEMY_DATA,
  LEVEL_DATA,
  REGION_THEMES,
  SPELL_TROOP_RANGE,
} from "../../constants";
import { distance, generateId } from "../../utils";
import { acquireParticle, enforceParticleCap } from "../../rendering";
import { getPerformanceSettings } from "../../rendering/performance";
import {
  getHexWardGhostProfile,
  getHexWardGhostStrengthFromEnemy,
  getHexWardGhostStrengthFromHero,
  getHexWardGhostStrengthFromTroop,
  isHexWardGhostHarvestActive,
} from "../../game/status";
import {
  findClosestRoadPoint,
  getFacingRightFromDelta,
} from "../../game/movement";

// ── Constants ────────────────────────────────────────────────────────────────

export const MAX_PARTICLES = 300;
export const PARTICLE_THROTTLE_MS = 50;

// ── Shared types ─────────────────────────────────────────────────────────────

export interface ParticleBurstRequest {
  pos: Position;
  type: Particle["type"];
  count: number;
}

export interface ParticleCombatRefs {
  lastParticleSpawn: MutableRefObject<Map<string, number>>;
  pendingParticleBurstsRef: MutableRefObject<ParticleBurstRequest[]>;
  entityCountsRef: MutableRefObject<EntityCounts>;
  handledEnemyIdsRef: MutableRefObject<Set<string>>;
  handledHexGhostSourceIdsRef: MutableRefObject<Set<string>>;
  hexWardRaisesRemainingRef: MutableRefObject<number>;
  pendingDeathEffectsRef: MutableRefObject<Effect[]>;
  gameEventLogRef: MutableRefObject<GameEventLogAPI>;
}

export interface ParticleCombatActions {
  setBountyIncomeEvents: (
    updater: (
      prev: Array<{ id: string; amount: number; isGoldBoosted: boolean }>,
    ) => Array<{ id: string; amount: number; isGoldBoosted: boolean }>,
  ) => void;
  addPawPoints: (amount: number) => void;
  setPaydayPawPointsEarned: (updater: (prev: number) => number) => void;
  addTroopEntities: (troops: Troop[]) => void;
  addEffectEntity: (effect: Effect) => void;
  setHexWardRaisesRemaining: (value: number) => void;
}

// ── addParticles impl ────────────────────────────────────────────────────────

export function addParticlesImpl(
  pos: Position,
  type: Particle["type"],
  count: number,
  refs: Pick<
    ParticleCombatRefs,
    "lastParticleSpawn" | "pendingParticleBurstsRef" | "entityCountsRef"
  >,
): void {
  const now = Date.now();
  const posKey = `${Math.round(pos.x / 20)}_${Math.round(pos.y / 20)}_${type}`;
  const lastSpawn = refs.lastParticleSpawn.current.get(posKey) || 0;
  if (now - lastSpawn < PARTICLE_THROTTLE_MS) {
    return;
  }
  refs.lastParticleSpawn.current.set(posKey, now);

  if (refs.lastParticleSpawn.current.size > 100) {
    const entries = Array.from(refs.lastParticleSpawn.current.entries());
    entries
      .slice(0, 50)
      .forEach(([key]) => refs.lastParticleSpawn.current.delete(key));
  }

  const counts = refs.entityCountsRef.current;
  const pressure =
    counts.enemies + counts.projectiles * 0.8 + counts.effects * 0.6;
  const pressureScale =
    pressure > 260
      ? 0.2
      : pressure > 180
        ? 0.35
        : pressure > 120
          ? 0.5
          : pressure > 80
            ? 0.7
            : 1;
  const adjustedCount = Math.max(
    1,
    Math.floor(Math.max(1, count) * pressureScale),
  );

  if (
    refs.pendingParticleBurstsRef.current.length > 220 &&
    adjustedCount <= 3 &&
    type !== "explosion"
  ) {
    return;
  }

  refs.pendingParticleBurstsRef.current.push({
    pos: { ...pos },
    type,
    count: adjustedCount,
  });
  if (refs.pendingParticleBurstsRef.current.length > 320) {
    refs.pendingParticleBurstsRef.current.splice(
      0,
      refs.pendingParticleBurstsRef.current.length - 320,
    );
  }
}

// ── flushQueuedParticles impl ────────────────────────────────────────────────

export function flushQueuedParticlesImpl(
  refs: Pick<
    ParticleCombatRefs,
    "pendingParticleBurstsRef" | "entityCountsRef"
  >,
): void {
  const bursts = refs.pendingParticleBurstsRef.current;
  if (bursts.length === 0) return;
  refs.pendingParticleBurstsRef.current = [];

  const counts = refs.entityCountsRef.current;
  const pressure =
    counts.enemies + counts.projectiles * 0.8 + counts.effects * 0.6;
  const budget =
    pressure > 260 ? 24 : pressure > 180 ? 36 : pressure > 120 ? 56 : 84;
  let remaining = budget;

  for (const burst of bursts) {
    if (remaining <= 0) break;
    const colors = PARTICLE_COLORS[burst.type] || PARTICLE_COLORS.spark;
    const spawnCount = Math.max(1, Math.min(burst.count, remaining));
    remaining -= spawnCount;
    const isExplosion = burst.type === "explosion";
    const particleSize = burst.type === "smoke" ? 8 : isExplosion ? 6 : 4;
    const resolvedType = isExplosion ? ("spark" as const) : burst.type;

    for (let i = 0; i < spawnCount; i++) {
      const angle = (Math.PI * 2 * i) / spawnCount + Math.random() * 0.5;
      const speed = isExplosion ? 2 + Math.random() * 3 : 1 + Math.random() * 2;
      const colorIndex = Math.floor(Math.random() * colors.length);
      acquireParticle(
        { x: burst.pos.x, y: burst.pos.y },
        {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed - (isExplosion ? 1 : 0),
        },
        400 + Math.random() * 300,
        700,
        particleSize,
        colors[colorIndex] ?? colors[0] ?? "#ffffff",
        resolvedType,
      );
    }
  }

  const dynamicCap =
    pressure > 260
      ? 180
      : pressure > 180
        ? 220
        : pressure > 120
          ? 260
          : MAX_PARTICLES;
  enforceParticleCap(dynamicCap);
}

// ── awardBounty impl ────────────────────────────────────────────────────────

export function awardBountyImpl(
  baseBounty: number,
  hasGoldAura: boolean,
  sourceId: string | undefined,
  actions: Pick<
    ParticleCombatActions,
    "setBountyIncomeEvents" | "addPawPoints" | "setPaydayPawPointsEarned"
  >,
): number {
  const goldBonus = hasGoldAura ? Math.floor(baseBounty * 0.5) : 0;
  const totalBounty = baseBounty + goldBonus;
  const eventId = `bounty-${Date.now()}-${sourceId || Math.random().toString(36).slice(2)}`;
  actions.setBountyIncomeEvents((prev) => {
    if (prev.some((e) => e.id === eventId)) return prev;
    return [
      ...prev,
      { id: eventId, amount: totalBounty, isGoldBoosted: hasGoldAura },
    ];
  });
  actions.addPawPoints(totalBounty);
  if (hasGoldAura && goldBonus > 0) {
    actions.setPaydayPawPointsEarned((prev) => prev + goldBonus);
  }
  return totalBounty;
}

// ── spawnHexWardGhostTroop impl ──────────────────────────────────────────────

export function spawnHexWardGhostTroopImpl(
  sourceKey: string,
  strength: "weak" | "medium" | "strong" | "apex",
  deathPos: Position,
  hexWardEndTime: number | null,
  activeWaveSpawnPaths: string[],
  selectedMap: string,
  refs: Pick<
    ParticleCombatRefs,
    "hexWardRaisesRemainingRef" | "handledHexGhostSourceIdsRef"
  >,
  actions: Pick<
    ParticleCombatActions,
    "addTroopEntities" | "setHexWardRaisesRemaining"
  >,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void,
): void {
  const now = Date.now();
  if (!isHexWardGhostHarvestActive(hexWardEndTime, now)) return;
  if (refs.hexWardRaisesRemainingRef.current <= 0) return;
  if (refs.handledHexGhostSourceIdsRef.current.has(sourceKey)) return;
  refs.handledHexGhostSourceIdsRef.current.add(sourceKey);
  refs.hexWardRaisesRemainingRef.current -= 1;
  actions.setHexWardRaisesRemaining(refs.hexWardRaisesRemainingRef.current);

  const profile = getHexWardGhostProfile(strength);
  const anchorPos = findClosestRoadPoint(
    deathPos,
    activeWaveSpawnPaths,
    selectedMap,
  );
  const shouldMoveToAnchor = distance(deathPos, anchorPos) > 18;
  const ghostTroop: Troop = {
    id: generateId("troop"),
    ownerId: generateId("spell-hexghost"),
    ownerType: "spell",
    type: profile.troopType,
    isHexGhost: true,
    pos: deathPos,
    targetPos: shouldMoveToAnchor ? anchorPos : undefined,
    hp: profile.hp,
    maxHp: profile.hp,
    moving: shouldMoveToAnchor,
    lastAttack: 0,
    overrideDamage: profile.damage,
    overrideAttackSpeed: profile.attackSpeed,
    overrideIsRanged: profile.isRanged,
    overrideRange: profile.range,
    overrideCanTargetFlying: profile.canTargetFlying,
    hexGhostDecayPerSecond: profile.decayPerSecond,
    hexGhostExpireTime: now + profile.lifetimeMs,
    rotation: 0,
    facingRight: getFacingRightFromDelta(
      anchorPos.x - deathPos.x,
      anchorPos.y - deathPos.y,
      true,
    ),
    attackAnim: 0,
    selected: false,
    spawnPoint: anchorPos,
    moveRadius: SPELL_TROOP_RANGE + 40,
    userTargetPos: anchorPos,
  };

  actions.addTroopEntities([ghostTroop]);
  addParticles(deathPos, "magic", 14);
  addParticles(anchorPos, "glow", 8);
}

// ── raiseHexWardGhost wrappers ───────────────────────────────────────────────

export function raiseHexWardGhostFromEnemyDeathImpl(
  enemy: Enemy,
  deathPos: Position,
  spawnHexWardGhostTroop: (
    sourceKey: string,
    strength: "weak" | "medium" | "strong" | "apex",
    deathPos: Position,
  ) => void,
): void {
  spawnHexWardGhostTroop(
    `enemy:${enemy.id}`,
    getHexWardGhostStrengthFromEnemy(enemy),
    deathPos,
  );
}

export function raiseHexWardGhostFromTroopDeathImpl(
  troop: Troop,
  deathPos: Position,
  spawnHexWardGhostTroop: (
    sourceKey: string,
    strength: "weak" | "medium" | "strong" | "apex",
    deathPos: Position,
  ) => void,
): void {
  if (troop.isHexGhost) return;
  spawnHexWardGhostTroop(
    `troop:${troop.id}`,
    getHexWardGhostStrengthFromTroop(troop),
    deathPos,
  );
}

export function raiseHexWardGhostFromHeroDeathImpl(
  fallenHero: Hero,
  spawnHexWardGhostTroop: (
    sourceKey: string,
    strength: "weak" | "medium" | "strong" | "apex",
    deathPos: Position,
  ) => void,
): void {
  spawnHexWardGhostTroop(
    `hero:${fallenHero.id}`,
    getHexWardGhostStrengthFromHero(fallenHero),
    fallenHero.pos,
  );
}

// ── killHero impl ────────────────────────────────────────────────────────────

export function killHeroImpl(
  fallenHero: Hero,
  respawnTimerMs: number,
  lastCombatTime: number | undefined,
  raiseHexWardGhostFromHeroDeath: (hero: Hero) => void,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void,
): Hero {
  raiseHexWardGhostFromHeroDeath(fallenHero);
  addParticles(fallenHero.pos, "explosion", 20);
  addParticles(fallenHero.pos, "smoke", 10);
  return {
    ...fallenHero,
    hp: 0,
    dead: true,
    respawnTimer: respawnTimerMs,
    selected: false,
    moving: false,
    lastCombatTime: lastCombatTime ?? fallenHero.lastCombatTime,
  };
}

// ── onEnemyKill impl ────────────────────────────────────────────────────────

const DEATH_DURATIONS: Record<DeathCause, number> = {
  lightning: 1800,
  fire: 2000,
  freeze: 800,
  sonic: 1800,
  poison: 1200,
  default: 1500,
};

export function onEnemyKillImpl(
  enemy: Enemy,
  pos: Position,
  particleCount: number,
  deathCause: DeathCause,
  selectedMap: string,
  refs: Pick<
    ParticleCombatRefs,
    "handledEnemyIdsRef" | "pendingDeathEffectsRef" | "gameEventLogRef"
  >,
  actions: Pick<ParticleCombatActions, "addEffectEntity">,
  awardBounty: (
    baseBounty: number,
    hasGoldAura: boolean,
    sourceId?: string,
  ) => number,
  raiseHexWardGhostFromEnemyDeath: (enemy: Enemy, pos: Position) => void,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void,
): void {
  if (refs.handledEnemyIdsRef.current.has(enemy.id)) return;
  refs.handledEnemyIdsRef.current.add(enemy.id);

  const eData = ENEMY_DATA[enemy.type];
  const baseBounty = eData.bounty;
  awardBounty(baseBounty, enemy.goldAura || false, enemy.id);
  raiseHexWardGhostFromEnemyDeath(enemy, pos);
  addParticles(pos, "explosion", particleCount);
  refs.gameEventLogRef.current.log(
    "enemy_killed",
    `${eData.name || enemy.type} killed (${deathCause}) +${baseBounty} PP`,
    { enemyType: enemy.type, bounty: baseBounty, deathCause },
  );
  if (enemy.goldAura) addParticles(pos, "gold", 6);

  const mapThemeKey = LEVEL_DATA[selectedMap]?.theme || "grassland";
  const regionColors = REGION_THEMES[mapThemeKey]?.ground;

  if (getPerformanceSettings().deathAnimations) {
    const deathEffect: Effect = {
      id: generateId("fx"),
      pos,
      type: "enemy_death" as const,
      progress: 0,
      size: eData.size,
      duration: DEATH_DURATIONS[deathCause],
      color: eData.color,
      enemyType: enemy.type,
      enemySize: eData.size,
      isFlying: eData.flying,
      deathCause,
      regionGroundColors: regionColors,
    };
    (deathEffect as Effect & { _spawnedAt: number })._spawnedAt =
      performance.now();
    refs.pendingDeathEffectsRef.current.push(deathEffect);
    actions.addEffectEntity(deathEffect);
  }
}
