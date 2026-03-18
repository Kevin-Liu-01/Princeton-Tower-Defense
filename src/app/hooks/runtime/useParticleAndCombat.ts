import { useRef, useMemo, useCallback } from "react";
import type { MutableRefObject, Dispatch, SetStateAction } from "react";
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
  type ParticleBurstRequest,
  addParticlesImpl,
  flushQueuedParticlesImpl,
  awardBountyImpl,
  spawnHexWardGhostTroopImpl,
  raiseHexWardGhostFromEnemyDeathImpl,
  raiseHexWardGhostFromTroopDeathImpl,
  raiseHexWardGhostFromHeroDeathImpl,
  killHeroImpl,
  onEnemyKillImpl,
} from "./particleAndCombatCallbacks";

export interface ParticleCombatDeps {
  entityCountsRef: MutableRefObject<EntityCounts>;
  gameEventLogRef: MutableRefObject<GameEventLogAPI>;
  hexWardEndTime: number | null;
  activeWaveSpawnPaths: string[];
  selectedMap: string;
  addPawPoints: (amount: number) => void;
  setBountyIncomeEvents: Dispatch<SetStateAction<Array<{ id: string; amount: number; isGoldBoosted: boolean }>>>;
  setPaydayPawPointsEarned: Dispatch<SetStateAction<number>>;
  addTroopEntities: (troops: Troop[]) => void;
  setHexWardRaisesRemaining: Dispatch<SetStateAction<number>>;
  addEffectEntity: (effect: Effect) => void;
}

export interface ParticleCombatReturn {
  addParticles: (pos: Position, type: Particle["type"], count: number) => void;
  flushQueuedParticles: () => void;
  awardBounty: (baseBounty: number, hasGoldAura: boolean, sourceId?: string) => number;
  killHero: (fallenHero: Hero, respawnTimerMs: number, lastCombatTime?: number) => Hero;
  onEnemyKill: (enemy: Enemy, pos: Position, particleCount?: number, deathCause?: DeathCause) => void;
  raiseHexWardGhostFromTroopDeath: (troop: Troop, deathPos: Position) => void;
  pendingParticleBurstsRef: MutableRefObject<ParticleBurstRequest[]>;
  pendingDeathEffectsRef: MutableRefObject<Effect[]>;
  handledEnemyIdsRef: MutableRefObject<Set<string>>;
  handledHexGhostSourceIdsRef: MutableRefObject<Set<string>>;
  hexWardRaisesRemainingRef: MutableRefObject<number>;
  handledWaveCompletionRef: MutableRefObject<number>;
  projectileUpdateAccumulator: MutableRefObject<number>;
  particleUpdateAccumulator: MutableRefObject<number>;
  effectsUpdateAccumulator: MutableRefObject<number>;
}

export function useParticleAndCombat(deps: ParticleCombatDeps): ParticleCombatReturn {
  const {
    entityCountsRef, gameEventLogRef,
    hexWardEndTime, activeWaveSpawnPaths, selectedMap,
    addPawPoints, setBountyIncomeEvents, setPaydayPawPointsEarned,
    addTroopEntities, setHexWardRaisesRemaining, addEffectEntity,
  } = deps;

  const lastParticleSpawn = useRef<Map<string, number>>(new Map());
  const pendingParticleBurstsRef = useRef<ParticleBurstRequest[]>([]);
  const projectileUpdateAccumulator = useRef<number>(0);
  const particleUpdateAccumulator = useRef<number>(0);
  const effectsUpdateAccumulator = useRef<number>(0);
  const pendingDeathEffectsRef = useRef<Effect[]>([]);
  const handledEnemyIdsRef = useRef<Set<string>>(new Set());
  const handledHexGhostSourceIdsRef = useRef<Set<string>>(new Set());
  const hexWardRaisesRemainingRef = useRef(0);
  const handledWaveCompletionRef = useRef<number>(-1);

  const particleRefs = useMemo(() => ({
    lastParticleSpawn,
    pendingParticleBurstsRef,
    entityCountsRef,
  }), [entityCountsRef]);

  const addParticles = useCallback(
    (pos: Position, type: Particle["type"], count: number) => {
      addParticlesImpl(pos, type, count, particleRefs);
    },
    [particleRefs],
  );

  const flushQueuedParticles = useCallback(
    () => flushQueuedParticlesImpl(particleRefs),
    [particleRefs],
  );

  const awardBounty = useCallback(
    (baseBounty: number, hasGoldAura: boolean, sourceId?: string) =>
      awardBountyImpl(baseBounty, hasGoldAura, sourceId, {
        setBountyIncomeEvents,
        addPawPoints,
        setPaydayPawPointsEarned,
      }),
    [addPawPoints, setBountyIncomeEvents, setPaydayPawPointsEarned],
  );

  const spawnHexWardGhostTroop = useCallback(
    (sourceKey: string, strength: "weak" | "medium" | "strong" | "apex", deathPos: Position) => {
      spawnHexWardGhostTroopImpl(
        sourceKey, strength, deathPos,
        hexWardEndTime, activeWaveSpawnPaths, selectedMap,
        { hexWardRaisesRemainingRef, handledHexGhostSourceIdsRef },
        { addTroopEntities, setHexWardRaisesRemaining },
        addParticles,
      );
    },
    [activeWaveSpawnPaths, addParticles, addTroopEntities, hexWardEndTime, setHexWardRaisesRemaining, selectedMap],
  );

  const raiseHexWardGhostFromEnemyDeath = useCallback(
    (enemy: Enemy, deathPos: Position) =>
      raiseHexWardGhostFromEnemyDeathImpl(enemy, deathPos, spawnHexWardGhostTroop),
    [spawnHexWardGhostTroop],
  );

  const raiseHexWardGhostFromTroopDeath = useCallback(
    (troop: Troop, deathPos: Position) =>
      raiseHexWardGhostFromTroopDeathImpl(troop, deathPos, spawnHexWardGhostTroop),
    [spawnHexWardGhostTroop],
  );

  const raiseHexWardGhostFromHeroDeath = useCallback(
    (fallenHero: Hero) =>
      raiseHexWardGhostFromHeroDeathImpl(fallenHero, spawnHexWardGhostTroop),
    [spawnHexWardGhostTroop],
  );

  const killHero = useCallback(
    (fallenHero: Hero, respawnTimerMs: number, lastCombatTime?: number): Hero =>
      killHeroImpl(fallenHero, respawnTimerMs, lastCombatTime, raiseHexWardGhostFromHeroDeath, addParticles),
    [addParticles, raiseHexWardGhostFromHeroDeath],
  );

  const onEnemyKill = useCallback(
    (enemy: Enemy, pos: Position, particleCount: number = 8, deathCause: DeathCause = "default") => {
      onEnemyKillImpl(
        enemy, pos, particleCount, deathCause, selectedMap,
        { handledEnemyIdsRef, pendingDeathEffectsRef, gameEventLogRef },
        { addEffectEntity },
        awardBounty, raiseHexWardGhostFromEnemyDeath, addParticles,
      );
    },
    [awardBounty, addParticles, addEffectEntity, raiseHexWardGhostFromEnemyDeath, selectedMap, gameEventLogRef],
  );

  return {
    addParticles,
    flushQueuedParticles,
    awardBounty,
    killHero,
    onEnemyKill,
    raiseHexWardGhostFromTroopDeath,
    pendingParticleBurstsRef,
    pendingDeathEffectsRef,
    handledEnemyIdsRef,
    handledHexGhostSourceIdsRef,
    hexWardRaisesRemainingRef,
    handledWaveCompletionRef,
    projectileUpdateAccumulator,
    particleUpdateAccumulator,
    effectsUpdateAccumulator,
  };
}
