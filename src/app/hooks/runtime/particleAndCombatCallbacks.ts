import type { MutableRefObject } from "react";

import {
  PARTICLE_COLORS,
  ENEMY_DATA,
  LEVEL_DATA,
  REGION_THEMES,
  SPELL_TROOP_RANGE,
} from "../../constants";
import {
  findClosestRoadPoint,
  getFacingRightFromDelta,
} from "../../game/movement";
import {
  getHexWardGhostProfile,
  getHexWardGhostStrengthFromEnemy,
  getHexWardGhostStrengthFromHero,
  getHexWardGhostStrengthFromTroop,
  isHexWardGhostHarvestActive,
} from "../../game/status";
import { acquireParticle, enforceParticleCap } from "../../rendering";
import { getPerformanceSettings } from "../../rendering/performance";
import type {
  Position,
  Enemy,
  Hero,
  Troop,
  Effect,
  Particle,
  DeathCause,
} from "../../types";
import { distance, generateId } from "../../utils";
import type { GameEventLogAPI } from "../useGameEventLog";
import type { EntityCounts } from "./renderScene";

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
      prev: { id: string; amount: number; isGoldBoosted: boolean }[]
    ) => { id: string; amount: number; isGoldBoosted: boolean }[]
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
  >
): void {
  const now = Date.now();
  const posKey = `${Math.round(pos.x / 20)}_${Math.round(pos.y / 20)}_${type}`;
  const lastSpawn = refs.lastParticleSpawn.current.get(posKey) || 0;
  if (now - lastSpawn < PARTICLE_THROTTLE_MS) {
    return;
  }
  refs.lastParticleSpawn.current.set(posKey, now);

  if (refs.lastParticleSpawn.current.size > 100) {
    const entries = [...refs.lastParticleSpawn.current.entries()];
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
    Math.floor(Math.max(1, count) * pressureScale)
  );

  if (
    refs.pendingParticleBurstsRef.current.length > 220 &&
    adjustedCount <= 3 &&
    type !== "explosion"
  ) {
    return;
  }

  refs.pendingParticleBurstsRef.current.push({
    count: adjustedCount,
    pos: { ...pos },
    type,
  });
  if (refs.pendingParticleBurstsRef.current.length > 320) {
    refs.pendingParticleBurstsRef.current.splice(
      0,
      refs.pendingParticleBurstsRef.current.length - 320
    );
  }
}

// ── Particle burst profiles ──────────────────────────────────────────────────
// In iso space, decreasing both world vx/vy moves the particle UP on screen.
// Horizontal screen movement: increase vx + decrease vy (or vice versa).

function getParticleBurstProfile(
  type: Particle["type"],
  index: number,
  total: number
): { vx: number; vy: number; life: number; maxLife: number; size: number } {
  const angle = (Math.PI * 2 * index) / total + Math.random() * 0.5;
  const radialX = Math.cos(angle);
  const radialY = Math.sin(angle);

  switch (type) {
    case "gold": {
      const upSpeed = -(1.2 + Math.random() * 1.5);
      const spread = (Math.random() - 0.5) * 1.4;
      const life = 500 + Math.random() * 400;
      return {
        life,
        maxLife: 900,
        size: 3 + Math.random() * 2,
        vx: upSpeed + spread,
        vy: upSpeed - spread,
      };
    }
    case "smoke": {
      const upDrift = -(0.3 + Math.random() * 0.6);
      const drift = (Math.random() - 0.5) * 0.8;
      const life = 500 + Math.random() * 400;
      return {
        life,
        maxLife: 900,
        size: 6 + Math.random() * 4,
        vx: upDrift + drift,
        vy: upDrift - drift,
      };
    }
    case "glow": {
      const upFloat = -(0.5 + Math.random() * 0.8);
      const spread = radialX * (0.6 + Math.random() * 0.6);
      const life = 500 + Math.random() * 400;
      return {
        life,
        maxLife: 900,
        size: 4 + Math.random() * 2,
        vx: upFloat + spread * 0.5,
        vy: upFloat - spread * 0.5,
      };
    }
    case "spark": {
      const speed = 1.5 + Math.random() * 2;
      const upBias = -(0.4 + Math.random() * 0.4);
      const life = 300 + Math.random() * 250;
      return {
        life,
        maxLife: 550,
        size: 3 + Math.random() * 2,
        vx: radialX * speed + upBias,
        vy: radialY * speed + upBias,
      };
    }
    case "explosion": {
      const speed = 2 + Math.random() * 3;
      const upBias = -(0.5 + Math.random() * 0.5);
      const life = 350 + Math.random() * 300;
      return {
        life,
        maxLife: 650,
        size: 5 + Math.random(),
        vx: radialX * speed + upBias,
        vy: radialY * speed + upBias,
      };
    }
    default: {
      const speed = 1 + Math.random() * 2;
      const life = 400 + Math.random() * 300;
      return {
        life,
        maxLife: 700,
        size: 4,
        vx: radialX * speed,
        vy: radialY * speed,
      };
    }
  }
}

// ── flushQueuedParticles impl ────────────────────────────────────────────────

export function flushQueuedParticlesImpl(
  refs: Pick<ParticleCombatRefs, "pendingParticleBurstsRef" | "entityCountsRef">
): void {
  const bursts = refs.pendingParticleBurstsRef.current;
  if (bursts.length === 0) {
    return;
  }
  refs.pendingParticleBurstsRef.current = [];

  const counts = refs.entityCountsRef.current;
  const pressure =
    counts.enemies + counts.projectiles * 0.8 + counts.effects * 0.6;
  const budget =
    pressure > 260 ? 24 : pressure > 180 ? 36 : pressure > 120 ? 56 : 84;
  let remaining = budget;

  for (const burst of bursts) {
    if (remaining <= 0) {
      break;
    }
    const colors = PARTICLE_COLORS[burst.type] || PARTICLE_COLORS.spark;
    const spawnCount = Math.max(1, Math.min(burst.count, remaining));
    remaining -= spawnCount;
    const isExplosion = burst.type === "explosion";
    const resolvedType = isExplosion ? ("spark" as const) : burst.type;

    for (let i = 0; i < spawnCount; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex] ?? colors[0] ?? "#ffffff";
      const jitterX = (Math.random() - 0.5) * 6;
      const jitterY = (Math.random() - 0.5) * 6;
      const px = burst.pos.x + jitterX;
      const py = burst.pos.y + jitterY;

      const { vx, vy, life, maxLife, size } = getParticleBurstProfile(
        burst.type,
        i,
        spawnCount
      );

      acquireParticle(
        { x: px, y: py },
        { x: vx, y: vy },
        life,
        maxLife,
        size,
        color,
        resolvedType
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
  >
): number {
  const goldBonus = hasGoldAura ? Math.floor(baseBounty * 0.5) : 0;
  const totalBounty = baseBounty + goldBonus;
  const eventId = `bounty-${Date.now()}-${sourceId || Math.random().toString(36).slice(2)}`;
  actions.setBountyIncomeEvents((prev) => {
    if (prev.some((e) => e.id === eventId)) {
      return prev;
    }
    return [
      ...prev,
      { amount: totalBounty, id: eventId, isGoldBoosted: hasGoldAura },
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
  addParticles: (pos: Position, type: Particle["type"], count: number) => void
): void {
  const now = Date.now();
  if (!isHexWardGhostHarvestActive(hexWardEndTime, now)) {
    return;
  }
  if (refs.hexWardRaisesRemainingRef.current <= 0) {
    return;
  }
  if (refs.handledHexGhostSourceIdsRef.current.has(sourceKey)) {
    return;
  }
  refs.handledHexGhostSourceIdsRef.current.add(sourceKey);
  refs.hexWardRaisesRemainingRef.current -= 1;
  actions.setHexWardRaisesRemaining(refs.hexWardRaisesRemainingRef.current);

  const profile = getHexWardGhostProfile(strength);
  const anchorPos = findClosestRoadPoint(
    deathPos,
    activeWaveSpawnPaths,
    selectedMap
  );
  const shouldMoveToAnchor = distance(deathPos, anchorPos) > 18;
  const ghostTroop: Troop = {
    attackAnim: 0,
    facingRight: getFacingRightFromDelta(
      anchorPos.x - deathPos.x,
      anchorPos.y - deathPos.y,
      true
    ),
    hexGhostDecayPerSecond: profile.decayPerSecond,
    hexGhostExpireTime: now + profile.lifetimeMs,
    hp: profile.hp,
    id: generateId("troop"),
    isHexGhost: true,
    lastAttack: 0,
    maxHp: profile.hp,
    moveRadius: SPELL_TROOP_RANGE + 40,
    moving: shouldMoveToAnchor,
    overrideAttackSpeed: profile.attackSpeed,
    overrideCanTargetFlying: profile.canTargetFlying,
    overrideDamage: profile.damage,
    overrideIsRanged: profile.isRanged,
    overrideRange: profile.range,
    ownerId: generateId("spell-hexghost"),
    ownerType: "spell",
    pos: deathPos,
    rotation: 0,
    selected: false,
    spawnPoint: anchorPos,
    targetPos: shouldMoveToAnchor ? anchorPos : undefined,
    type: profile.troopType,
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
    deathPos: Position
  ) => void
): void {
  spawnHexWardGhostTroop(
    `enemy:${enemy.id}`,
    getHexWardGhostStrengthFromEnemy(enemy),
    deathPos
  );
}

export function raiseHexWardGhostFromTroopDeathImpl(
  troop: Troop,
  deathPos: Position,
  spawnHexWardGhostTroop: (
    sourceKey: string,
    strength: "weak" | "medium" | "strong" | "apex",
    deathPos: Position
  ) => void
): void {
  if (troop.isHexGhost) {
    return;
  }
  spawnHexWardGhostTroop(
    `troop:${troop.id}`,
    getHexWardGhostStrengthFromTroop(troop),
    deathPos
  );
}

export function raiseHexWardGhostFromHeroDeathImpl(
  fallenHero: Hero,
  spawnHexWardGhostTroop: (
    sourceKey: string,
    strength: "weak" | "medium" | "strong" | "apex",
    deathPos: Position
  ) => void
): void {
  spawnHexWardGhostTroop(
    `hero:${fallenHero.id}`,
    getHexWardGhostStrengthFromHero(fallenHero),
    fallenHero.pos
  );
}

// ── killHero impl ────────────────────────────────────────────────────────────

export function killHeroImpl(
  fallenHero: Hero,
  respawnTimerMs: number,
  lastCombatTime: number | undefined,
  raiseHexWardGhostFromHeroDeath: (hero: Hero) => void,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void,
  selectedMap?: string,
  refs?: Pick<ParticleCombatRefs, "pendingDeathEffectsRef">,
  actions?: Pick<ParticleCombatActions, "addEffectEntity">
): Hero {
  raiseHexWardGhostFromHeroDeath(fallenHero);
  if (selectedMap && refs && actions) {
    onHeroDeathImpl(
      fallenHero,
      fallenHero.pos,
      selectedMap,
      refs,
      actions,
      addParticles
    );
  } else {
    addParticles(fallenHero.pos, "explosion", 20);
    addParticles(fallenHero.pos, "smoke", 10);
  }
  return {
    ...fallenHero,
    dead: true,
    hp: 0,
    lastCombatTime: lastCombatTime ?? fallenHero.lastCombatTime,
    moving: false,
    respawnTimer: respawnTimerMs,
    selected: false,
  };
}

// ── onEnemyKill impl ────────────────────────────────────────────────────────

const DEATH_DURATIONS: Record<DeathCause, number> = {
  default: 1500,
  fire: 2000,
  freeze: 800,
  lightning: 1800,
  poison: 1200,
  sonic: 1800,
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
    sourceId?: string
  ) => number,
  raiseHexWardGhostFromEnemyDeath: (enemy: Enemy, pos: Position) => void,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void
): void {
  if (refs.handledEnemyIdsRef.current.has(enemy.id)) {
    return;
  }
  refs.handledEnemyIdsRef.current.add(enemy.id);

  const eData = ENEMY_DATA[enemy.type];
  const baseBounty = eData.bounty;
  awardBounty(baseBounty, enemy.goldAura || false, enemy.id);
  raiseHexWardGhostFromEnemyDeath(enemy, pos);
  addParticles(pos, "explosion", particleCount);
  refs.gameEventLogRef.current.log(
    "enemy_killed",
    `${eData.name || enemy.type} killed (${deathCause}) +${baseBounty} PP`,
    { bounty: baseBounty, deathCause, enemyType: enemy.type }
  );
  if (enemy.goldAura) {
    addParticles(pos, "gold", 6);
  }

  const mapThemeKey = LEVEL_DATA[selectedMap]?.theme || "grassland";
  const regionColors = REGION_THEMES[mapThemeKey]?.ground;

  if (getPerformanceSettings().deathAnimations) {
    const deathEffect: Effect = {
      color: eData.color,
      deathCause,
      duration: DEATH_DURATIONS[deathCause],
      enemySize: eData.size,
      enemyType: enemy.type,
      id: generateId("fx"),
      isFlying: eData.flying,
      pos,
      progress: 0,
      regionGroundColors: regionColors,
      size: eData.size,
      type: "enemy_death" as const,
    };
    (deathEffect as Effect & { _spawnedAt: number })._spawnedAt =
      performance.now();
    refs.pendingDeathEffectsRef.current.push(deathEffect);
    actions.addEffectEntity(deathEffect);
  }
}

// ── onTroopDeath / onHeroDeath impl ──────────────────────────────────────────
// Reuse the same "enemy_death" dust animation so allies crumble the same way.

export function onTroopDeathImpl(
  troop: Troop,
  pos: Position,
  selectedMap: string,
  refs: Pick<ParticleCombatRefs, "pendingDeathEffectsRef">,
  actions: Pick<ParticleCombatActions, "addEffectEntity">,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void
): void {
  addParticles(pos, "explosion", 8);

  if (getPerformanceSettings().deathAnimations) {
    const mapThemeKey = LEVEL_DATA[selectedMap]?.theme || "grassland";
    const regionColors = REGION_THEMES[mapThemeKey]?.ground;
    const deathEffect: Effect = {
      deathCause: "default",
      duration: DEATH_DURATIONS["default"],
      id: generateId("fx"),
      pos,
      progress: 0,
      regionGroundColors: regionColors,
      size: 16,
      type: "enemy_death" as const,
    };
    (deathEffect as Effect & { _spawnedAt: number })._spawnedAt =
      performance.now();
    refs.pendingDeathEffectsRef.current.push(deathEffect);
    actions.addEffectEntity(deathEffect);
  }
}

export function onHeroDeathImpl(
  hero: Hero,
  pos: Position,
  selectedMap: string,
  refs: Pick<ParticleCombatRefs, "pendingDeathEffectsRef">,
  actions: Pick<ParticleCombatActions, "addEffectEntity">,
  addParticles: (pos: Position, type: Particle["type"], count: number) => void
): void {
  addParticles(pos, "explosion", 20);
  addParticles(pos, "smoke", 10);

  if (getPerformanceSettings().deathAnimations) {
    const mapThemeKey = LEVEL_DATA[selectedMap]?.theme || "grassland";
    const regionColors = REGION_THEMES[mapThemeKey]?.ground;
    const deathEffect: Effect = {
      deathCause: "default",
      duration: DEATH_DURATIONS["default"],
      id: generateId("fx"),
      pos,
      progress: 0,
      regionGroundColors: regionColors,
      size: 22,
      type: "enemy_death" as const,
    };
    (deathEffect as Effect & { _spawnedAt: number })._spawnedAt =
      performance.now();
    refs.pendingDeathEffectsRef.current.push(deathEffect);
    actions.addEffectEntity(deathEffect);
  }
}
