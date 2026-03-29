import type {
  Position,
  Tower,
  Enemy,
  EnemyType,
  Hero,
  Troop,
  Spell,
  Projectile,
  Effect,
  EffectType,
  Particle,
  ParticleType,
  TowerType,
  TroopType,
  GameState,
  LevelStars,
  SpecialTower,
  DeathCause,
  EnemyAbilityType,
} from "../../types";
import { type GameEventLogAPI } from "../useGameEventLog";
import {
  TILE_SIZE,
  GRID_WIDTH,
  GRID_HEIGHT,
  TOWER_DATA,
  ENEMY_DATA,
  HERO_DATA,
  SPELL_DATA,
  MAP_PATHS,
  HERO_RESPAWN_TIME,
  PARTICLE_COLORS,
  TROOP_DATA,
  LEVEL_DATA,
  REGION_THEMES,
  MAX_STATION_TROOPS,
  HERO_COMBAT_STATS,
  HERO_HEAL_DELAY_MS,
  HERO_HEAL_RATE,
  TROOP_HEAL_DELAY_MS,
  TROOP_HEAL_RATE,
  ENEMY_REGEN_RATE,
  ENEMY_REGEN_DELAY_MS,
  HERO_COMBAT_RADIUS,
  DAMAGE_FLASH_MS,
  DAMAGE_FLASH_SHORT_MS,
  DEFAULT_TROOP_HP,
  DEFAULT_TROOP_DAMAGE,
  DEFAULT_TROOP_ATTACK_SPEED,
  DEFAULT_TROOP_MOVE_SPEED,
  DEFAULT_TROOP_MELEE_RANGE,
  DEFAULT_TROOP_RANGED_RANGE,
  DEFAULT_ENEMY_TROOP_DAMAGE,
  DEFAULT_ENEMY_HERO_DAMAGE,
  DEFAULT_ENEMY_RANGE,
  DEFAULT_ENEMY_PROJECTILE_DAMAGE,
  DEFAULT_ENEMY_BURN_DAMAGE,
  DEFAULT_ENEMY_TROOP_ATTACK_SPEED,
  DEFAULT_ENEMY_FLYING_ATTACK_RANGE,
  DEFAULT_PROJECTILE_DAMAGE,
  SCOTT_RANGE_BUFF,
  SCOTT_DAMAGE_BUFF,
  BEACON_RANGE_BUFF,
  BEACON_BUFF_RANGE,
  INVESTMENT_BANK_RANGE_BUFF,
  INVESTMENT_BANK_BUFF_RANGE,
  RECRUITMENT_CENTER_DAMAGE_BUFF,
  RECRUITMENT_CENTER_BUFF_RANGE,
  CHRONO_RELAY_SPEED_BUFF,
  CHRONO_RELAY_BUFF_RANGE,
  RANGE_BUFF_CAP,
  DAMAGE_BUFF_CAP,
  ATTACK_SPEED_BUFF_CAP,
  STATION_TROOP_RANGE,
  BARRACKS_TROOP_RANGE,
  HERO_SUMMON_RANGE,
  SENTINEL_NEXUS_STATS,
  SUNFORGE_ORRERY_STATS,
  SPECIAL_TOWER_WARMUP_MS,
  WAVE_TIMER_BASE,
  SUMMON_COOLDOWN,
  SUMMON_CHANNEL_DURATION,
  SUMMON_MINION_FADE_DURATION,
} from "../../constants";
import {
  gridToWorld,
  gridToWorldPath,
  screenToWorld,
  distance,
  generateId,
  getPathSegmentLength,
  findClosestPathPoint,
  getMortarBarrelOrigin,
} from "../../utils";
import { calculateTowerStats, TOWER_STATS } from "../../constants/towerStats";
import {
  clampLaneOffset,
  clampLaneIndex,
  getNearestLaneIndex,
  ENEMY_LANE_OFFSETS,
  ENEMY_CENTER_LANE_INDEX,
  ENEMY_SPAWN_LANE_JITTER,
  ENEMY_REPULSION_PROGRESS_RADIUS,
  ENEMY_REPULSION_LATERAL_STRENGTH,
  ENEMY_FORMATION_PULL_STRENGTH,
  ENEMY_LANE_SHIFT_MS,
} from "../../game/spatial";
import {
  findClosestRoadPoint,
  getBarracksOwnerId,
  getImpactEffect,
  clampPositionToRadius,
  computeSeparationForces,
  constrainToNearPath,
  getFacingRightFromDelta,
  stepTowardTarget,
  findAllyAlertTarget,
} from "../../game/movement";
import {
  getPrioritizedEnemiesInRange,
  getClosestEnemyInRange,
  getChainTargets,
  getTroopCellKey,
  findNearestTroopInRange,
  getVaultImpactPos,
  type VaultEntry,
  createEnemyPosCache,
} from "../../game/spatial";
import {
  applyEnemyAbilities,
  buildAbilityCooldowns,
  addOrRefreshDebuff,
  getEnemyDamageTaken,
} from "../../game/status";
import {
  CAMPAIGN_LEVEL_UNLOCKS,
  REGION_CAMPAIGN_LEVELS,
  REGION_CHALLENGE_UNLOCKS,
  CHALLENGE_LEVEL_UNLOCKS,
  isRegionCleared,
  type RegionKey,
} from "../../game/progression";
import { calculateCategoryRatings } from "../../components/menus/VictoryScreen";
import { calculateHazardEffects, applyHazardEffect, calculateFriendlyHazardEffects, applyHazardEffectToTroop, applyHazardEffectToHero } from "../../game/hazards";
import { emitDamageNumber } from "../../rendering/ui/damageNumbers";
import {
  TROOP_RESPAWN_TIME,
  TROOP_SEPARATION_DIST,
  TROOP_SIGHT_RANGE,
  TROOP_RANGED_SIGHT_RANGE,
  HERO_SIGHT_RANGE,
  HERO_RANGED_SIGHT_RANGE,
  MELEE_RANGE,
  ENEMY_SPEED_MODIFIER,
  ALLY_ALERT_RANGE,
  MAX_TROOP_PATH_DISTANCE,
  MAX_HERO_PATH_DISTANCE,
  UNIT_SETTLE_DISTANCE,
  getEnemyPosWithPath,
  getFormationOffsets,
  getLevelWaves,
  getLevelSpecialTowers,
  getVaultHpMap,
  vaultPosKey,
} from "../../game/setup";
import { isSandboxLevel, ensureSandboxWaves } from "../../game/sandboxWaves";
import { updateParticlePool, enforceParticleCap } from "../../rendering";
import { getSentinelBoltColor, SENTINEL_CRYSTAL_Y_OFFSET, SUNFORGE_GEM_Y_OFFSET } from "../../rendering/towers/sentinelTheme";
import { getGameSettings } from "../useSettings";
import { isDefined, FRIENDLY_SEPARATION_MULT } from "./runtimeConfig";

type BattleOutcome = "victory" | "defeat";

type SetStateFn<T> = React.Dispatch<React.SetStateAction<T>>;

export interface UpdateGameParams {
  // === State values ===
  gameSpeed: number;
  selectedMap: string;
  isFreeplay: boolean;
  waveInProgress: boolean;
  currentWave: number;
  vaultFlash: Record<string, number>;
  hero: Hero | null;
  lives: number;
  gameState: GameState;
  battleOutcome: BattleOutcome | null;
  enemies: Enemy[];
  nextWaveTimer: number;
  specialTowerHp: Record<string, number>;
  troops: Troop[];
  towers: Tower[];
  levelStartTime: number;
  levelStars: LevelStars;
  totalWaves: number;
  unlockedMaps: string[];
  activeWaveSpawnPaths: string[];
  cameraOffset: Position;
  cameraZoom: number;

  // === Setters ===
  setTimeSpent: SetStateFn<number>;
  setWaveInProgress: SetStateFn<boolean>;
  setHoveredWaveBubblePathKey: SetStateFn<string | null>;
  setNextWaveTimer: SetStateFn<number>;
  setGameSpeed: SetStateFn<number>;
  setBattleOutcome: SetStateFn<BattleOutcome | null>;
  setStarsEarned: SetStateFn<number>;
  setTowers: SetStateFn<Tower[]>;
  setEnemies: SetStateFn<Enemy[]>;
  setHero: SetStateFn<Hero | null>;
  setTroops: SetStateFn<Troop[]>;
  setSpells: SetStateFn<Spell[]>;
  setEffects: SetStateFn<Effect[]>;
  setProjectiles: SetStateFn<Projectile[]>;
  setSentinelTargets: SetStateFn<Record<string, Position>>;
  setLives: SetStateFn<number>;
  setSpecialTowerHp: SetStateFn<Record<string, number>>;
  setVaultFlash: SetStateFn<Record<string, number>>;
  setLeakedBountyEvents: SetStateFn<Array<{ id: string; amount: number }>>;
  setEatingClubIncomeEvents: SetStateFn<Array<{ id: string; amount: number }>>;

  // === Callbacks ===
  startWave: () => void;
  addParticles: (pos: Position, type: ParticleType, count: number) => void;
  clearAllTimers: () => void;
  updateLevelStats: (map: string, time: number, lives: number, won: boolean) => void;
  updateLevelStars: (map: string, stars: number) => void;
  unlockLevel: (level: string) => void;
  awardBounty: (baseBounty: number, hasGoldAura: boolean, sourceId?: string) => void;
  killHero: (fallenHero: Hero, respawnTimerMs: number, lastCombatTime?: number) => Hero;
  onEnemyKill: (enemy: Enemy, pos: Position, particleCount?: number, deathCause?: DeathCause) => void;
  addPawPoints: (amount: number) => void;
  addEffectEntities: (effects: Effect[]) => void;
  addProjectileEntities: (projectiles: Projectile[]) => void;
  addTroopEntities: (troops: Troop[]) => void;
  getSpecialTowerKey: (tower: Pick<SpecialTower, "type" | "pos">) => string;
  getRandomMapTarget: () => Position;
  raiseHexWardGhostFromTroopDeath: (troop: Troop, deathPos: Position) => void;
  getCanvasDimensions: () => { width: number; height: number; dpr: number };

  // === Refs (as { current: T }) ===
  handledEnemyIdsRef: { current: Set<string> };
  handledHexGhostSourceIdsRef: { current: Set<string> };
  gameEndHandledRef: { current: boolean };
  totalPausedTimeRef: { current: number };
  gameResetTimeRef: { current: number };
  gameEventLogRef: { current: GameEventLogAPI };
  enemiesFirstAppearedRef: { current: number };
  lastSentinelStrikeRef: { current: Map<string, number> };
  lastSunforgeBarrageRef: { current: Map<string, number> };
  sunforgeAimRef: { current: Map<string, Position> };
  lastBarracksSpawnRef: { current: Map<string, number> };
  entityCountsRef: { current: { projectiles: number; enemies: number; effects: number; towers: number; troops: number; particles: number } };
  projectileUpdateAccumulator: { current: number };
  effectsUpdateAccumulator: { current: number };
  particleUpdateAccumulator: { current: number };
  tutorialBlockingRef: { current: boolean };
  activeTimeoutsRef: { current: ReturnType<typeof setTimeout>[] };
  sentinelTargetsRef: { current: Record<string, Position> };
  missileMortarTargetingIdRef: { current: string | null };
  mousePosRef: { current: Position };
  missileAutoAimRef: { current: Map<string, Position> };
}

const MAX_PARTICLES = 300;
const MAX_EFFECTS = 80;

export function updateGameTick(params: UpdateGameParams, deltaTime: number): void {
  const {
    gameSpeed,
    selectedMap,
    isFreeplay,
    waveInProgress,
    currentWave,
    vaultFlash,
    hero,
    lives,
    gameState,
    battleOutcome,
    enemies,
    nextWaveTimer,
    specialTowerHp,
    troops,
    towers,
    levelStartTime,
    levelStars,
    totalWaves,
    unlockedMaps,
    activeWaveSpawnPaths,
    cameraOffset,
    cameraZoom,
    setTimeSpent,
    setWaveInProgress,
    setHoveredWaveBubblePathKey,
    setNextWaveTimer,
    setGameSpeed,
    setBattleOutcome,
    setStarsEarned,
    setTowers,
    setEnemies,
    setHero,
    setTroops,
    setSpells,
    setEffects,
    setProjectiles,
    setSentinelTargets,
    setLives,
    setSpecialTowerHp,
    setVaultFlash,
    setLeakedBountyEvents,
    setEatingClubIncomeEvents,
    startWave,
    addParticles,
    clearAllTimers,
    updateLevelStats,
    updateLevelStars,
    unlockLevel,
    awardBounty,
    killHero,
    onEnemyKill,
    addPawPoints,
    addEffectEntities,
    addProjectileEntities,
    addTroopEntities,
    getSpecialTowerKey,
    getRandomMapTarget,
    raiseHexWardGhostFromTroopDeath,
    getCanvasDimensions,
    handledEnemyIdsRef,
    handledHexGhostSourceIdsRef,
    gameEndHandledRef,
    totalPausedTimeRef,
    gameResetTimeRef,
    gameEventLogRef,
    enemiesFirstAppearedRef,
    lastSentinelStrikeRef,
    lastSunforgeBarrageRef,
    sunforgeAimRef,
    lastBarracksSpawnRef,
    entityCountsRef,
    projectileUpdateAccumulator,
    effectsUpdateAccumulator,
    particleUpdateAccumulator,
    tutorialBlockingRef,
    activeTimeoutsRef,
    sentinelTargetsRef,
    missileMortarTargetingIdRef,
    mousePosRef,
    missileAutoAimRef,
  } = params;

  handledEnemyIdsRef.current.clear();
  handledHexGhostSourceIdsRef.current.clear();
  const now = Date.now();
  const isPaused = gameSpeed === 0;
  const sandboxMode = isSandboxLevel(selectedMap);
  if (sandboxMode) {
    ensureSandboxWaves(currentWave);
  }
  const levelWaves = getLevelWaves(selectedMap);

  // Win/lose checks run before the isPaused guard so they can't be blocked
  // by a pause that coincides with the condition becoming true (stale closure race).
  if (
    lives <= 0 &&
    gameState === "playing" &&
    !battleOutcome &&
    !gameEndHandledRef.current
  ) {
    gameEndHandledRef.current = true;

    const finalTime = Math.floor((Date.now() - levelStartTime - totalPausedTimeRef.current) / 1000);
    setTimeSpent(finalTime);

    clearAllTimers();
    setWaveInProgress(false);
    setHoveredWaveBubblePathKey(null);
    setNextWaveTimer(0);
    setGameSpeed(0);

    if (!isFreeplay) {
      updateLevelStats(selectedMap, finalTime, lives, false);
    }
    gameEventLogRef.current.log("defeat", `Defeat on ${selectedMap} — ${lives} lives remaining, ${finalTime}s elapsed`, { map: selectedMap, livesLeft: lives, time: finalTime, freeplay: isFreeplay });
    setBattleOutcome("defeat");
  }
  if (
    !sandboxMode &&
    gameState === "playing" &&
    !battleOutcome &&
    currentWave >= levelWaves.length &&
    enemies.length === 0 &&
    !waveInProgress &&
    !gameEndHandledRef.current
  ) {
    gameEndHandledRef.current = true;

    const finalTime = Math.floor((Date.now() - levelStartTime - totalPausedTimeRef.current) / 1000);
    setTimeSpent(finalTime);

    const { overall: stars } = calculateCategoryRatings(
      finalTime,
      lives,
      totalWaves,
    );
    setStarsEarned(stars);

    clearAllTimers();
    setWaveInProgress(false);
    setHoveredWaveBubblePathKey(null);
    setNextWaveTimer(0);
    setGameSpeed(0);
    gameEventLogRef.current.log("victory", `Victory on ${selectedMap}! ${lives} lives remaining`, { map: selectedMap, livesLeft: lives, freeplay: isFreeplay });
    setBattleOutcome("victory");

    if (!isFreeplay) {
      const mapToSave = selectedMap;
      updateLevelStars(mapToSave, stars);
      updateLevelStats(mapToSave, finalTime, lives, true);

      const nextLevel = CAMPAIGN_LEVEL_UNLOCKS[mapToSave];
      if (nextLevel && !unlockedMaps.includes(nextLevel)) {
        unlockLevel(nextLevel);
      }

      const projectedLevelStars = {
        ...levelStars,
        [mapToSave]: Math.max(levelStars[mapToSave] || 0, stars),
      };
      (Object.keys(REGION_CAMPAIGN_LEVELS) as Array<
        RegionKey
      >).forEach((regionKey) => {
        if (!isRegionCleared(regionKey, projectedLevelStars)) return;
        REGION_CHALLENGE_UNLOCKS[regionKey].forEach((challengeLevel) => {
          if (!unlockedMaps.includes(challengeLevel)) {
            unlockLevel(challengeLevel);
          }
        });
      });

      const nextChallengeLevel = CHALLENGE_LEVEL_UNLOCKS[mapToSave];
      if (
        nextChallengeLevel &&
        (projectedLevelStars[mapToSave] || 0) > 0 &&
        !unlockedMaps.includes(nextChallengeLevel)
      ) {
        unlockLevel(nextChallengeLevel);
      }
    }
  }

  // Skip ALL game logic when paused.
  // This prevents Date.now() based timers from advancing (status effects, healing, buffs)
  // and ensures enemies/troops/heroes don't move or act while paused.
  // Rendering still happens via the render() call in the game loop.
  if (isPaused) {
    return;
  }

  // Skip spawning logic during game reset transition to prevent race conditions
  // where stale state might cause double spawns
  const timeSinceReset = now - gameResetTimeRef.current;
  const isInResetTransition = timeSinceReset < 100; // 100ms grace period
  const specialTowers = getLevelSpecialTowers(selectedMap);
  const beacons = specialTowers.filter((tower) => tower.type === "beacon");
  const chronoRelays = specialTowers.filter(
    (tower) => tower.type === "chrono_relay"
  );
  const shrines = specialTowers.filter((tower) => tower.type === "shrine");
  const sentinelNexuses = specialTowers.filter(
    (tower) => tower.type === "sentinel_nexus"
  );
  const sunforgeOrreries = specialTowers.filter(
    (tower) => tower.type === "sunforge_orrery"
  );
  const barracksTowers = specialTowers.filter(
    (tower) => tower.type === "barracks"
  );
  const vaultEntries: VaultEntry[] = specialTowers
    .filter((tower) => tower.type === "vault")
    .map((tower) => ({ worldPos: gridToWorld(tower.pos), key: vaultPosKey(tower.pos) }));
  // Wave timer - check outside setState to avoid race conditions
  // Freeze the timer while tutorial or encounter overlays are active
  if (!waveInProgress && currentWave < levelWaves.length && !tutorialBlockingRef.current) {
    const autoSend = getGameSettings().ui.autoSendWaves;
    const shouldStartWave = nextWaveTimer - deltaTime <= 0;
    if (shouldStartWave && autoSend) {
      startWave();
      setNextWaveTimer(WAVE_TIMER_BASE);
    } else if (!shouldStartWave) {
      setNextWaveTimer((prev) => Math.max(0, prev - deltaTime));
    }
  }

  // Cache enemy positions for this tick (keyed by object reference, not id).
  const enemyPosCache = createEnemyPosCache(getEnemyPosWithPath, selectedMap);
  const getEnemyPosCached = enemyPosCache.getPos;
  const getEnemyAimPosCached = enemyPosCache.getAimPos;

  const enemiesByProgress = [...enemies].sort(
    (a, b) => b.pathIndex + b.progress - (a.pathIndex + a.progress)
  );

  const troopCellSize = 120;
  const troopBuckets = new Map<string, Troop[]>();
  for (const troop of troops) {
    const cellKey = getTroopCellKey(troop.pos.x, troop.pos.y, troopCellSize);
    const bucket = troopBuckets.get(cellKey);
    if (bucket) {
      bucket.push(troop);
    } else {
      troopBuckets.set(cellKey, [troop]);
    }
  }

  // Bind extracted helpers to this tick's data so call sites stay clean
  const getEnemiesInRange = (
    origin: Position,
    range: number,
    limit?: number,
    predicate?: (e: Enemy) => boolean,
  ) =>
    getPrioritizedEnemiesInRange(origin, range, enemiesByProgress, getEnemyPosCached, limit, predicate);
  const getClosestEnemy = (
    origin: Position,
    range: number,
    predicate?: (e: Enemy) => boolean,
  ) =>
    getClosestEnemyInRange(origin, range, enemies, getEnemyPosCached, predicate);
  const getNearestTroop = (
    origin: Position,
    range: number,
    predicate?: (t: Troop) => boolean,
  ) =>
    findNearestTroopInRange(origin, range, troopBuckets, troopCellSize, predicate);
  const getClosestVault = (enemyPos: Position, maxDistance: number) =>
    getVaultImpactPos(enemyPos, vaultEntries, maxDistance);

  // =========================================================================
  // DYNAMIC BUFF REGISTRATION
  // Compute buffs from all sources: Beacon, Investment Bank, Recruitment Center, F. Scott
  // =========================================================================
  setTowers((prev) =>
    prev.map((t) => {
      if (t.type === "club") return t; // Clubs don't receive buffs

      const tWorldPos = gridToWorld(t.pos);

      // Calculate RANGE buffs (multiplicative stacking)
      let rangeMultiplier = 1.0;

      // F. Scott's Inspiration buff check (used for both range and damage)
      const isScottActive = t.boostEnd ? now < t.boostEnd : false;

      // F. Scott's Inspiration range buff (time-limited)
      if (isScottActive && t.isBuffed) {
        rangeMultiplier *= SCOTT_RANGE_BUFF;
      }

      // Beacon range buff
      for (const beacon of beacons) {
        const beaconPos = gridToWorld(beacon.pos);
        if (distance(tWorldPos, beaconPos) < BEACON_BUFF_RANGE) {
          rangeMultiplier *= BEACON_RANGE_BUFF;
        }
      }

      // Investment Bank range buff (from nearby level 4A clubs)
      prev.forEach((club) => {
        if (club.type === "club" && club.level === 4 && club.upgrade === "A" && club.id !== t.id) {
          const clubPos = gridToWorld(club.pos);
          if (distance(tWorldPos, clubPos) <= INVESTMENT_BANK_BUFF_RANGE) {
            rangeMultiplier *= INVESTMENT_BANK_RANGE_BUFF;
          }
        }
      });

      rangeMultiplier = Math.min(rangeMultiplier, RANGE_BUFF_CAP);

      // Calculate DAMAGE buffs (multiplicative stacking)
      let damageMultiplier = 1.0;

      // F. Scott's Inspiration damage buff (time-limited)
      if (isScottActive && t.isBuffed) {
        damageMultiplier *= SCOTT_DAMAGE_BUFF;
      }

      // Recruitment Center damage buff (from nearby level 4B clubs)
      prev.forEach((club) => {
        if (club.type === "club" && club.level === 4 && club.upgrade === "B" && club.id !== t.id) {
          const clubPos = gridToWorld(club.pos);
          if (distance(tWorldPos, clubPos) <= RECRUITMENT_CENTER_BUFF_RANGE) {
            damageMultiplier *= RECRUITMENT_CENTER_DAMAGE_BUFF;
          }
        }
      });

      damageMultiplier = Math.min(damageMultiplier, DAMAGE_BUFF_CAP);

      // Calculate ATTACK SPEED buffs (multiplicative stacking)
      let attackSpeedMultiplier = 1.0;
      for (const relay of chronoRelays) {
        const relayPos = gridToWorld(relay.pos);
        if (distance(tWorldPos, relayPos) < CHRONO_RELAY_BUFF_RANGE) {
          attackSpeedMultiplier *= CHRONO_RELAY_SPEED_BUFF;
        }
      }
      attackSpeedMultiplier = Math.min(attackSpeedMultiplier, ATTACK_SPEED_BUFF_CAP);

      const hasAnyBuff =
        rangeMultiplier > 1.0 ||
        damageMultiplier > 1.0 ||
        attackSpeedMultiplier > 1.0;

      return {
        ...t,
        rangeBoost: rangeMultiplier,
        damageBoost: damageMultiplier,
        attackSpeedBoost: attackSpeedMultiplier,
        isBuffed: hasAnyBuff,
        // Clear boostEnd if Scott's buff expired
        boostEnd: isScottActive ? t.boostEnd : undefined,
      };
    })
  );

  // =========================================================================
  // HAZARD LOGIC - Using imported hazard game logic functions
  // =========================================================================
  const levelDataForHazards = LEVEL_DATA[selectedMap];
  const hazards = levelDataForHazards?.hazards;
  if (hazards && hazards.length > 0) {

    // Calculate hazard effects using the imported function
    const { effects: hazardEffects, particles: hazardParticles } = calculateHazardEffects(
      hazards,
      enemies,
      deltaTime,
      (enemy) => getEnemyPosCached(enemy)
    );

    // Single batched update for all hazard effects
    if (hazardEffects.size > 0) {
      setEnemies((prev) =>
        prev.map((e) => {
          const effect = hazardEffects.get(e.id);
          if (!effect) return e;
          return applyHazardEffect(e, effect, ENEMY_DATA[e.type].speed);
        })
      );

      // Fire particles for lava damage
      hazardEffects.forEach((effect) => {
        if (effect.fireParticlePos) {
          addParticles(effect.fireParticlePos, "fire", 6);
        }
      });
    }

    // Spawn hazard environment particles (throttled)
    hazardParticles.forEach((p) => addParticles(p.pos, p.type, p.count));

    // Friendly unit hazard effects (troops + hero)
    const friendlyResult = calculateFriendlyHazardEffects(
      hazards,
      troops,
      hero,
      deltaTime,
    );

    if (friendlyResult.troopEffects.size > 0) {
      setTroops((prev) =>
        prev.map((t) => {
          const effect = friendlyResult.troopEffects.get(t.id);
          if (!effect) return t;
          return applyHazardEffectToTroop(t, effect);
        })
      );

      friendlyResult.troopEffects.forEach((effect) => {
        if (effect.fireParticlePos) {
          addParticles(effect.fireParticlePos, "fire", 4);
        }
      });
    }

    if (friendlyResult.heroEffect) {
      setHero((prev) => {
        if (!prev) return null;
        return applyHazardEffectToHero(prev, friendlyResult.heroEffect!);
      });
      if (friendlyResult.heroEffect.fireParticlePos) {
        addParticles(friendlyResult.heroEffect.fireParticlePos, "fire", 4);
      }
    }

    friendlyResult.particles.forEach((p) => addParticles(p.pos, p.type, p.count));
  }

  // =========================================================================
  // SPECIAL TOWER LOGIC
  // =========================================================================
  // A. BEACON: Range buff is handled in dynamic tower buff registration above.

  // B. SHRINE: Periodic HP pulse for hero and troops.
  if (shrines.length > 0 && now % 5000 < deltaTime) {
    const healRadius = 200;
    const healAmount = 50;
    const shrineWorldPositions = shrines.map((tower) => gridToWorld(tower.pos));

    if (hero && !hero.dead) {
      const isHeroInShrineRange = shrineWorldPositions.some(
        (pos) => distance(hero.pos, pos) < healRadius
      );
      if (isHeroInShrineRange) {
        setHero((prev) =>
          prev
            ? {
              ...prev,
              hp: Math.min(prev.maxHp, prev.hp + healAmount),
              healFlash: Date.now(),
            }
            : null
        );
        addParticles(hero.pos, "heal", 10);
      }
    }

    setTroops((prev) =>
      prev.map((troop) => {
        const isInShrineRange = shrineWorldPositions.some(
          (pos) => distance(troop.pos, pos) < healRadius
        );
        if (!isInShrineRange || troop.isHexGhost) return troop;
        return {
          ...troop,
          hp: Math.min(troop.maxHp, troop.hp + healAmount),
          healFlash: Date.now(),
        };
      })
    );

    shrineWorldPositions.forEach((pos) => {
      setEffects((ef) => [
        ...ef,
        {
          id: generateId("shrine"),
          pos,
          type: "arcaneField",
          progress: 0,
          size: healRadius,
        },
      ]);
    });
  }

  // Track when enemies first appear on the field for special tower warmup
  if (enemies.length > 0 && enemiesFirstAppearedRef.current === 0) {
    enemiesFirstAppearedRef.current = now;
  }
  const specialTowerWarmedUp =
    enemiesFirstAppearedRef.current > 0 &&
    now - enemiesFirstAppearedRef.current >= SPECIAL_TOWER_WARMUP_MS;

  // B2. SENTINEL NEXUS: Locked-coordinate lightning strike.
  if (sentinelNexuses.length > 0) {
    const baseStrikeIntervalMs = SENTINEL_NEXUS_STATS.strikeIntervalMs;
    const strikeIntervalMs = gameSpeed > 0 ? baseStrikeIntervalMs / gameSpeed : baseStrikeIntervalMs;
    const strikeRadius = SENTINEL_NEXUS_STATS.radius;
    const strikeDamage = SENTINEL_NEXUS_STATS.damage;
    const sentinelKeys = new Set<string>();
    const nextTargets = { ...sentinelTargetsRef.current };
    let targetsChanged = false;
    const pendingDamage = new Map<string, number>();
    const strikeEffects: Effect[] = [];

    for (const nexus of sentinelNexuses) {
      const strikeKey = getSpecialTowerKey(nexus);
      sentinelKeys.add(strikeKey);
      if (!nextTargets[strikeKey]) {
        nextTargets[strikeKey] = gridToWorld(nexus.pos);
        targetsChanged = true;
      }
    }

    Object.keys(nextTargets).forEach((key) => {
      if (!sentinelKeys.has(key)) {
        delete nextTargets[key];
        targetsChanged = true;
      }
    });

    if (targetsChanged) {
      setSentinelTargets(nextTargets);
      sentinelTargetsRef.current = nextTargets;
    }

    for (const nexus of sentinelNexuses) {
      const strikeKey = getSpecialTowerKey(nexus);
      const lastStrike = lastSentinelStrikeRef.current.get(strikeKey) ?? 0;
      if (now - lastStrike < strikeIntervalMs) continue;
      if (!specialTowerWarmedUp) continue;

      const targetPos = nextTargets[strikeKey];
      if (!targetPos) continue;

      lastSentinelStrikeRef.current.set(strikeKey, now);
      const nexusWorldPos = gridToWorld(nexus.pos);
      const mapTheme = LEVEL_DATA[selectedMap]?.theme;
      strikeEffects.push({
        id: generateId("sentinel_strike"),
        pos: nexusWorldPos,
        type: "lightning",
        progress: 0,
        size: distance(nexusWorldPos, targetPos),
        targetPos,
        intensity: 1.55,
        duration: 240,
        color: getSentinelBoltColor(mapTheme),
        sourceYOffset: SENTINEL_CRYSTAL_Y_OFFSET,
      });
      strikeEffects.push({
        id: generateId("sentinel_impact"),
        pos: targetPos,
        type: "sentinel_impact",
        progress: 0,
        size: strikeRadius,
        duration: 560,
      });
      addParticles(targetPos, "spark", 18);
      addParticles(targetPos, "light", 8);
      addParticles(nexusWorldPos, "light", 6);

      for (const enemy of enemies) {
        if (enemy.dead || enemy.hp <= 0) continue;
        const enemyPos = getEnemyPosCached(enemy);
        const distToStrike = distance(enemyPos, targetPos);
        if (distToStrike > strikeRadius) continue;
        const falloff = Math.max(0.45, 1 - distToStrike / strikeRadius);
        const damage = strikeDamage * falloff;
        pendingDamage.set(enemy.id, (pendingDamage.get(enemy.id) ?? 0) + damage);
      }
    }

    if (pendingDamage.size > 0) {
      setEnemies((prev) =>
        prev
          .map((enemy) => {
            const incoming = pendingDamage.get(enemy.id);
            if (!incoming) return enemy;
            const enemyPos = getEnemyPosCached(enemy);
            const hp = enemy.hp - getEnemyDamageTaken(enemy, incoming);
            if (hp <= 0) {
              onEnemyKill(enemy, enemyPos, 14, "lightning");
              return null;
            }
            return {
              ...enemy,
              hp,
              damageFlash: SENTINEL_NEXUS_STATS.damageFlash,
              stunUntil: Math.max(enemy.stunUntil || 0, now + SENTINEL_NEXUS_STATS.stunDuration),
              lastDamageTaken: now,
            };
          })
          .filter(isDefined)
      );
    }

    if (strikeEffects.length > 0) {
      setEffects((prev) => {
        const combined = [...prev, ...strikeEffects];
        return combined.length > MAX_EFFECTS
          ? combined.slice(combined.length - MAX_EFFECTS)
          : combined;
      });
    }

    if (lastSentinelStrikeRef.current.size > 96) {
      lastSentinelStrikeRef.current.forEach((_value, key) => {
        if (!sentinelKeys.has(key)) {
          lastSentinelStrikeRef.current.delete(key);
        }
      });
    }
  }

  // B3. SUNFORGE ORRERY: Offensive tri-plasma barrage on dense enemy clusters.
  if (sunforgeOrreries.length > 0 && enemies.length === 0) {
    sunforgeAimRef.current.clear();
  }
  if (sunforgeOrreries.length > 0 && enemies.length > 0) {
    const { barrageIntervalMs, clusterScanRadius, strikeRadius, directDamage, burnDps, burnDurationMs, stunDuration: sunforgeStunMs } = SUNFORGE_ORRERY_STATS;
    const sunforgeKeys = new Set<string>();
    const pendingDamage = new Map<
      string,
      { damage: number; burnDamage: number; burnUntil: number; stunUntil: number }
    >();
    const strikeEffects: Effect[] = [];

    for (const orrery of sunforgeOrreries) {
      const key = getSpecialTowerKey(orrery);
      sunforgeKeys.add(key);

      // Always compute best cluster target for the reticle tracking
      let bestTarget: Position | null = null;
      let bestScore = -Infinity;
      for (const pivotEnemy of enemiesByProgress) {
        if (pivotEnemy.dead || pivotEnemy.hp <= 0) continue;
        const pivotPos = getEnemyPosCached(pivotEnemy);
        let score = 0;
        for (const candidate of enemies) {
          if (candidate.dead || candidate.hp <= 0) continue;
          const candidatePos = getEnemyPosCached(candidate);
          const dist = distance(pivotPos, candidatePos);
          if (dist > clusterScanRadius) continue;
          const proximityWeight = 1 - dist / clusterScanRadius;
          const progressWeight = 1 + (candidate.pathIndex + candidate.progress) * 0.06;
          score += 1 + proximityWeight * 1.35 + progressWeight * 0.22;
        }
        if (score > bestScore) {
          bestScore = score;
          bestTarget = pivotPos;
        }
      }

      if (bestTarget) {
        sunforgeAimRef.current.set(key, bestTarget);
      }

      const lastBarrage = lastSunforgeBarrageRef.current.get(key) ?? 0;
      if (now - lastBarrage < barrageIntervalMs) continue;
      if (!specialTowerWarmedUp) continue;
      if (!bestTarget) continue;
      const fireTarget = bestTarget;
      lastSunforgeBarrageRef.current.set(key, now);

      const orreryWorldPos = gridToWorld(orrery.pos);
      const spinPhase = now * 0.0012 + orrery.pos.x * 0.17 + orrery.pos.y * 0.09;
      const sfVolley = SUNFORGE_ORRERY_STATS.volleyOffsets;
      const volleyOffsets = [
        { x: 0, y: 0, multiplier: sfVolley[0].multiplier, radiusScale: sfVolley[0].radiusScale },
        {
          x: Math.cos(spinPhase) * 70,
          y: Math.sin(spinPhase * 1.2) * 42,
          multiplier: sfVolley[1].multiplier,
          radiusScale: sfVolley[1].radiusScale,
        },
        {
          x: Math.cos(spinPhase + Math.PI * 0.78) * 68,
          y: Math.sin(spinPhase * 1.28 + Math.PI * 0.52) * 40,
          multiplier: sfVolley[2].multiplier,
          radiusScale: sfVolley[2].radiusScale,
        },
      ];

      volleyOffsets.forEach((offset, volleyIndex) => {
        const targetPos = {
          x: Math.max(
            TILE_SIZE,
            Math.min(
              GRID_WIDTH * TILE_SIZE - TILE_SIZE,
              fireTarget.x + offset.x
            )
          ),
          y: Math.max(
            TILE_SIZE,
            Math.min(
              GRID_HEIGHT * TILE_SIZE - TILE_SIZE,
              fireTarget.y + offset.y
            )
          ),
        };
        const volleyRadius = strikeRadius * offset.radiusScale;
        const volleyDamage = directDamage * offset.multiplier;

        strikeEffects.push({
          id: generateId("sunforge_beam"),
          pos: orreryWorldPos,
          type: "sunforge_beam",
          progress: 0,
          size: distance(orreryWorldPos, targetPos),
          targetPos,
          intensity: 1.25 + volleyIndex * 0.12,
          duration: 260,
          sourceYOffset: SUNFORGE_GEM_Y_OFFSET,
        });
        strikeEffects.push({
          id: generateId("sunforge_impact"),
          pos: targetPos,
          type: "sunforge_impact",
          progress: 0,
          size: volleyRadius,
          intensity: 1.0 + volleyIndex * 0.08,
          duration: 640,
        });
        addParticles(targetPos, "fire", 16 - volleyIndex * 2);
        addParticles(targetPos, "spark", 12 - volleyIndex);
        addParticles(targetPos, "light", 6);

        for (const enemy of enemies) {
          if (enemy.dead || enemy.hp <= 0) continue;
          const enemyPos = getEnemyPosCached(enemy);
          const distToBlast = distance(enemyPos, targetPos);
          if (distToBlast > volleyRadius) continue;
          const falloff = Math.max(0.35, 1 - distToBlast / volleyRadius);
          const hitDamage = volleyDamage * falloff;
          const burnDamage = burnDps * Math.max(0.25, falloff * 0.8);
          const existing = pendingDamage.get(enemy.id);
          const update = existing ?? {
            damage: 0,
            burnDamage: 0,
            burnUntil: now + burnDurationMs,
            stunUntil: now + sunforgeStunMs,
          };
          update.damage += hitDamage;
          update.burnDamage = Math.max(update.burnDamage, burnDamage);
          update.burnUntil = Math.max(update.burnUntil, now + burnDurationMs);
          update.stunUntil = Math.max(update.stunUntil, now + sunforgeStunMs);
          pendingDamage.set(enemy.id, update);
        }
      });
      addParticles(orreryWorldPos, "light", 9);
    }

    if (pendingDamage.size > 0) {
      setEnemies((prev) =>
        prev
          .map((enemy) => {
            const incoming = pendingDamage.get(enemy.id);
            if (!incoming) return enemy;
            const enemyPos = getEnemyPosCached(enemy);
            const hp = enemy.hp - getEnemyDamageTaken(enemy, incoming.damage);
            if (hp <= 0) {
              onEnemyKill(enemy, enemyPos, 12, "fire");
              return null;
            }
            return {
              ...enemy,
              hp,
              damageFlash: SUNFORGE_ORRERY_STATS.damageFlash,
              burning: true,
              burnDamage: Math.max(enemy.burnDamage || 0, incoming.burnDamage),
              burnUntil: Math.max(enemy.burnUntil || 0, incoming.burnUntil),
              stunUntil: Math.max(enemy.stunUntil || 0, incoming.stunUntil),
              lastDamageTaken: now,
            };
          })
          .filter(isDefined)
      );
    }

    if (strikeEffects.length > 0) {
      setEffects((prev) => {
        const combined = [...prev, ...strikeEffects];
        return combined.length > MAX_EFFECTS
          ? combined.slice(combined.length - MAX_EFFECTS)
          : combined;
      });
    }

    if (lastSunforgeBarrageRef.current.size > 96) {
      lastSunforgeBarrageRef.current.forEach((_value, key) => {
        if (!sunforgeKeys.has(key)) {
          lastSunforgeBarrageRef.current.delete(key);
        }
      });
    }
    // Clean stale aim entries
    sunforgeAimRef.current.forEach((_value, key) => {
      if (!sunforgeKeys.has(key)) {
        sunforgeAimRef.current.delete(key);
      }
    });
  }

  // C. BARRACKS: Capped & spread deployment (max 3 knights per barracks).
  if (barracksTowers.length > 0 && !isInResetTransition) {
    const spawnTimings = lastBarracksSpawnRef.current;

    for (const barracks of barracksTowers) {
      const bOwnerId = getBarracksOwnerId(barracks.pos);
      const bWorldPos = gridToWorld(barracks.pos);
      const bTroops = troops.filter((t) => t.ownerId === bOwnerId);
      const lastSpawn = spawnTimings.get(bOwnerId) ?? 0;

      const spawnCycle = now % 12000;
      const isInSpawnWindow = spawnCycle < 1500;
      const wasInSpawnWindow =
        lastSpawn > 0 && (lastSpawn % 12000) < 1500;

      const justEnteredSpawnWindow =
        isInSpawnWindow &&
        (lastSpawn === 0 || !wasInSpawnWindow || now - lastSpawn > 10500);

      if (justEnteredSpawnWindow && bTroops.length < 3) {
        spawnTimings.set(bOwnerId, now);

        const existingRallyTroop = bTroops.find((t) => t.userTargetPos);
        const rallyPoint =
          existingRallyTroop?.userTargetPos || findClosestRoadPoint(bWorldPos, activeWaveSpawnPaths, selectedMap);

        const occupiedSlots = new Set(bTroops.map((t) => t.spawnSlot ?? 0));
        const availableSlot =
          [0, 1, 2].find((slot) => !occupiedSlots.has(slot)) ?? bTroops.length;

        const futureCount = bTroops.length + 1;
        const formationOffsets = getFormationOffsets(futureCount);
        const slotOffset = formationOffsets[availableSlot] || { x: 0, y: 0 };
        const targetPos = {
          x: rallyPoint.x + slotOffset.x,
          y: rallyPoint.y + slotOffset.y,
        };

        const newTroop: Troop = {
          id: generateId("barracks_unit"),
          ownerId: bOwnerId,
          ownerType: "barracks",
          type: "knight",
          pos: { ...bWorldPos },
          hp: TROOP_DATA.knight.hp,
          maxHp: TROOP_DATA.knight.hp,
          moving: true,
          targetPos,
          userTargetPos: targetPos,
          lastAttack: 0,
          rotation: Math.atan2(
            targetPos.y - bWorldPos.y,
            targetPos.x - bWorldPos.x,
          ),
          facingRight: getFacingRightFromDelta(
            targetPos.x - bWorldPos.x,
            targetPos.y - bWorldPos.y,
          ),
          attackAnim: 0,
          selected: false,
          spawnPoint: rallyPoint,
          moveRadius: BARRACKS_TROOP_RANGE,
          spawnSlot: availableSlot,
        };

        setTroops((prev) => {
          const currentBTroops = prev.filter(
            (troop) => troop.ownerId === bOwnerId
          );
          const troopIdToFormationIndex = new Map<string, number>();
          currentBTroops.forEach((troop, idx) => {
            troopIdToFormationIndex.set(troop.id, idx);
          });

          const updated = prev.map((troop) => {
            if (troop.ownerId !== bOwnerId) return troop;
            const newFormation = getFormationOffsets(futureCount);
            const formationIndex = troopIdToFormationIndex.get(troop.id) ?? 0;
            const offset = newFormation[formationIndex] || { x: 0, y: 0 };
            const newTarget = {
              x: rallyPoint.x + offset.x,
              y: rallyPoint.y + offset.y,
            };
            if (troop.engaging) return troop;
            return {
              ...troop,
              targetPos: newTarget,
              moving: true,
              userTargetPos: newTarget,
              spawnPoint: rallyPoint,
              facingRight: getFacingRightFromDelta(
                newTarget.x - troop.pos.x,
                newTarget.y - troop.pos.y,
              ),
            };
          });
          return [...updated, newTroop];
        });
        addParticles(bWorldPos, "smoke", 12);
      }
    }
  }

  // D. VAULT: targetable objective (per-vault HP).
  const anyVaultAlive = vaultEntries.some((v) => (specialTowerHp[v.key] ?? 0) > 0);
  if (vaultEntries.length > 0 && anyVaultAlive) {
    enemies.forEach((enemy) => {
      const enemyPos = getEnemyPosCached(enemy);
      const vaultHit = getClosestVault(enemyPos, 60);
      if (!vaultHit) return;
      const vaultHp = specialTowerHp[vaultHit.key] ?? 0;
      if (vaultHp <= 0) return;
      const effectiveEnemyAttackInterval =
        gameSpeed > 0 ? 1000 / gameSpeed : 1000;
      if (
        isPaused ||
        now - (enemy.lastTroopAttack || 0) <= effectiveEnemyAttackInterval
      ) {
        return;
      }

      const dmg = 20;
      setSpecialTowerHp((prev) => {
        const cur = prev[vaultHit.key] ?? 0;
        if (cur <= 0) return prev;
        const newVal = Math.max(0, cur - dmg);
        if (newVal <= 0) {
          setLives((life) => Math.max(0, life - 5));
          addParticles(vaultHit.worldPos, "explosion", 40);
        }
        return { ...prev, [vaultHit.key]: newVal };
      });
      setEnemies((prev) =>
        prev.map((entry) =>
          entry.id === enemy.id
            ? {
              ...entry,
              inCombat: true,
              lastTroopAttack: now,
              facingRight: getFacingRightFromDelta(
                vaultHit.worldPos.x - enemyPos.x,
                vaultHit.worldPos.y - enemyPos.y,
                entry.facingRight,
              ),
            }
            : entry
        )
      );
    });
  }

  // =========================================================================
  // ENEMY AI: VAULT TARGETING & COMBAT
  // =========================================================================
  setVaultFlash((prev) => {
    let changed = false;
    const next: Record<string, number> = {};
    for (const key in prev) {
      if (prev[key] > 0) {
        next[key] = Math.max(0, prev[key] - deltaTime);
        changed = true;
      } else {
        next[key] = 0;
      }
    }
    return changed ? next : prev;
  });

  setEnemies((prev) =>
    prev
      .map((enemy) => {
        // Fade in newly-summoned minions
        if (enemy.spawnProgress < 1) {
          enemy = { ...enemy, spawnProgress: Math.min(1, enemy.spawnProgress + deltaTime / SUMMON_MINION_FADE_DURATION) };
        }
        if (enemy.frozen || now < enemy.stunUntil) return enemy;
        const enemyPos = getEnemyPosWithPath(enemy, selectedMap);

        // 1. TAUNT LOGIC (Highest Priority)
        // If the enemy is taunted, they ignore the path and troops to hit the hero
        if (enemy.taunted && hero && !hero.dead) {
          const distToHero = distance(enemyPos, hero.pos);
          if (distToHero < 80) {
            // Slightly larger engagement for taunt - skip attacks when paused
            const effectiveEnemyAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
            if (!isPaused && now - (enemy.lastHeroAttack || 0) > effectiveEnemyAttackInterval) {
              const tauntAbilities = hero.shieldActive ? null : applyEnemyAbilities(enemy, 'hero', now);
              if (hero.shieldActive) {
                addParticles(hero.pos, "spark", 5);
              } else {
                setHero((h) => {
                  if (!h) return null;
                  const updated = { ...h, hp: Math.max(0, h.hp - HERO_COMBAT_STATS.tauntDamage), lastCombatTime: Date.now() };

                  if (tauntAbilities) {
                    if (tauntAbilities.burn) {
                      updated.burning = true;
                      updated.burnDamage = tauntAbilities.burn.damage;
                      updated.burnUntil = now + tauntAbilities.burn.duration;
                      updated.burnFlavor = tauntAbilities.flavor;
                      updated.burnSourceId = tauntAbilities.sourceId;
                    }
                    if (tauntAbilities.slow) {
                      updated.slowed = true;
                      updated.slowIntensity = tauntAbilities.slow.intensity;
                      updated.slowUntil = now + tauntAbilities.slow.duration;
                      updated.slowFlavor = tauntAbilities.flavor;
                      updated.slowSourceId = tauntAbilities.sourceId;
                    }
                    if (tauntAbilities.poison) {
                      updated.poisoned = true;
                      updated.poisonDamage = tauntAbilities.poison.damage;
                      updated.poisonUntil = now + tauntAbilities.poison.duration;
                      updated.poisonFlavor = tauntAbilities.flavor;
                      updated.poisonSourceId = tauntAbilities.sourceId;
                    }
                    if (tauntAbilities.stun) {
                      updated.stunned = true;
                      updated.stunUntil = now + tauntAbilities.stun.duration;
                      updated.stunFlavor = tauntAbilities.flavor;
                      updated.stunSourceId = tauntAbilities.sourceId;
                    }
                  }

                  return updated;
                });
              }
              return {
                ...enemy,
                inCombat: true,
                combatTarget: hero.id,
                lastHeroAttack: now,
                lastAbilityUse: tauntAbilities ? now : enemy.lastAbilityUse,
                lastAbilityType: tauntAbilities?.activatedTypes[0] ?? enemy.lastAbilityType,
                abilityCooldowns: tauntAbilities ? buildAbilityCooldowns(enemy.abilityCooldowns, tauntAbilities.activatedTypes, now) : enemy.abilityCooldowns,
                facingRight: getFacingRightFromDelta(
                  hero.pos.x - enemyPos.x,
                  hero.pos.y - enemyPos.y,
                  enemy.facingRight,
                ),
              };
            }
            return {
              ...enemy,
              inCombat: true,
              combatTarget: hero.id,
              facingRight: getFacingRightFromDelta(
                hero.pos.x - enemyPos.x,
                hero.pos.y - enemyPos.y,
                enemy.facingRight,
              ),
            };
          } else {
            // TAUNTED MOVEMENT: Enemy moves toward hero instead of following path
            const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
            const moveSpeed = enemy.speed * speedMult * deltaTime * HERO_COMBAT_STATS.tauntMoveSpeedMult;
            const dx = hero.pos.x - enemyPos.x;
            const dy = hero.pos.y - enemyPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
              const moveX = (dx / dist) * moveSpeed;
              const moveY = (dy / dist) * moveSpeed;
              // Update enemy position by adjusting progress along current path segment
              // This is a workaround since enemies use path-based positioning
              // We'll store an offset that gets applied in getEnemyPosWithPath
              return {
                ...enemy,
                tauntOffset: {
                  x: (enemy.tauntOffset?.x || 0) + moveX,
                  y: (enemy.tauntOffset?.y || 0) + moveY,
                },
                inCombat: false, // Not in melee range yet
              };
            }
          }
        }

        // 2. CHECK FOR VAULT LOGIC (Second Priority) – per-vault HP
        if (vaultEntries.length > 0 && anyVaultAlive) {
          const vaultHit = getClosestVault(enemyPos, 70);
          if (vaultHit && (specialTowerHp[vaultHit.key] ?? 0) > 0) {
            const effectiveVaultAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
            if (!isPaused && now - (enemy.lastTroopAttack || 0) > effectiveVaultAttackInterval) {
              setSpecialTowerHp((prev) => {
                const cur = prev[vaultHit.key] ?? 0;
                if (cur <= 0) return prev;
                const newVal = Math.max(0, cur - 25);
                if (newVal <= 0) {
                  setLives((l) => Math.max(0, l - 5));
                  addParticles(vaultHit.worldPos, "explosion", 40);
                }
                return { ...prev, [vaultHit.key]: newVal };
              });
              setVaultFlash((prev) => ({ ...prev, [vaultHit.key]: 150 }));
              addParticles(vaultHit.worldPos, "smoke", 3);
              return {
                ...enemy,
                inCombat: true,
                combatTarget: "vault_objective",
                lastTroopAttack: now,
                facingRight: getFacingRightFromDelta(
                  vaultHit.worldPos.x - enemyPos.x,
                  vaultHit.worldPos.y - enemyPos.y,
                  enemy.facingRight,
                ),
              };
            }
            return {
              ...enemy,
              inCombat: true,
              combatTarget: "vault_objective",
              facingRight: getFacingRightFromDelta(
                vaultHit.worldPos.x - enemyPos.x,
                vaultHit.worldPos.y - enemyPos.y,
                enemy.facingRight,
              ),
            };
          }
        }
        // Hero Combat Check - skip attacks when paused
        const nearbyHero =
          hero &&
            !hero.dead &&
            distance(enemyPos, hero.pos) < 60 &&
            !ENEMY_DATA[enemy.type].flying
            ? hero
            : null;
        if (nearbyHero) {
          // Scale enemy attack interval with game speed
          const effectiveHeroAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
          if (!isPaused && now - enemy.lastHeroAttack > effectiveHeroAttackInterval) {
            const heroAbilities = nearbyHero.shieldActive ? null : applyEnemyAbilities(enemy, 'hero', now);
            if (!nearbyHero.shieldActive) {
              setHero((h) => {
                if (!h) return null;
                const updated = { ...h, hp: Math.max(0, h.hp - HERO_COMBAT_STATS.tauntDamage), lastCombatTime: Date.now() };

                if (heroAbilities) {
                  if (heroAbilities.burn) {
                    updated.burning = true;
                    updated.burnDamage = heroAbilities.burn.damage;
                    updated.burnUntil = now + heroAbilities.burn.duration;
                    updated.burnFlavor = heroAbilities.flavor;
                    updated.burnSourceId = heroAbilities.sourceId;
                  }
                  if (heroAbilities.slow) {
                    updated.slowed = true;
                    updated.slowIntensity = heroAbilities.slow.intensity;
                    updated.slowUntil = now + heroAbilities.slow.duration;
                    updated.slowFlavor = heroAbilities.flavor;
                    updated.slowSourceId = heroAbilities.sourceId;
                  }
                  if (heroAbilities.poison) {
                    updated.poisoned = true;
                    updated.poisonDamage = heroAbilities.poison.damage;
                    updated.poisonUntil = now + heroAbilities.poison.duration;
                    updated.poisonFlavor = heroAbilities.flavor;
                    updated.poisonSourceId = heroAbilities.sourceId;
                  }
                  if (heroAbilities.stun) {
                    updated.stunned = true;
                    updated.stunUntil = now + heroAbilities.stun.duration;
                    updated.stunFlavor = heroAbilities.flavor;
                    updated.stunSourceId = heroAbilities.sourceId;
                  }
                }

                return updated;
              });
              const attackAngle = Math.atan2(
                nearbyHero.pos.y - enemyPos.y,
                nearbyHero.pos.x - enemyPos.x
              );
              const effectType: EffectType =
                ["golem", "juggernaut", "dean", "trustee"].includes(enemy.type)
                  ? "melee_smash"
                  : ["berserker", "shadow_knight"].includes(enemy.type)
                    ? "melee_slash"
                    : "melee_swipe";
              setEffects((ef) => [
                ...ef,
                {
                  id: generateId("eff"),
                  pos: {
                    x: (enemyPos.x + nearbyHero.pos.x) / 2,
                    y: (enemyPos.y + nearbyHero.pos.y) / 2,
                  },
                  type: effectType,
                  progress: 0,
                  size: 40,
                  slashAngle: attackAngle,
                  attackerType: "enemy",
                },
              ]);
            } else {
              addParticles(nearbyHero.pos, "spark", 5);
            }
            return {
              ...enemy,
              inCombat: true,
              combatTarget: nearbyHero.id,
              lastHeroAttack: now,
              lastAbilityUse: heroAbilities ? now : enemy.lastAbilityUse,
              lastAbilityType: heroAbilities?.activatedTypes[0] ?? enemy.lastAbilityType,
              abilityCooldowns: heroAbilities ? buildAbilityCooldowns(enemy.abilityCooldowns, heroAbilities.activatedTypes, now) : enemy.abilityCooldowns,
              facingRight: getFacingRightFromDelta(
                nearbyHero.pos.x - enemyPos.x,
                nearbyHero.pos.y - enemyPos.y,
                enemy.facingRight,
              ),
            };
          }

          return {
            ...enemy,
            inCombat: true,
            combatTarget: nearbyHero.id,
            facingRight: getFacingRightFromDelta(
              nearbyHero.pos.x - enemyPos.x,
              nearbyHero.pos.y - enemyPos.y,
              enemy.facingRight,
            ),
          };
        }

        // Troop Combat Check - skip if enemy has breakthrough or is flying
        const enemyData = ENEMY_DATA[enemy.type];
        const canEngageTroops = !enemyData.flying && !enemyData.breakthrough;
        const nearbyTroop = canEngageTroops
          ? getNearestTroop(enemyPos, 60)
          : null;
        if (nearbyTroop) {
          return {
            ...enemy,
            inCombat: true,
            combatTarget: nearbyTroop.id,
            facingRight: getFacingRightFromDelta(
              nearbyTroop.pos.x - enemyPos.x,
              nearbyTroop.pos.y - enemyPos.y,
              enemy.facingRight,
            ),
          };
        }

        // Movement logic - normalize speed by segment length for consistent world-space speed
        if (!enemy.inCombat && !enemy.summoning) {
          const pathKey = enemy.pathKey || selectedMap;
          const path = MAP_PATHS[pathKey];
          if (!path || path.length < 2) return { ...enemy, inCombat: false };
          const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
          const segmentLength = getPathSegmentLength(enemy.pathIndex, pathKey);
          const worldAdvance =
            (enemy.speed * speedMult * deltaTime * TILE_SIZE) / 200;
          let nextPathIndex = enemy.pathIndex;
          let currentSegmentLength = Math.max(1, segmentLength);
          let segmentDistance =
            enemy.progress * currentSegmentLength + worldAdvance;

          while (
            segmentDistance >= currentSegmentLength &&
            nextPathIndex < path.length - 1
          ) {
            segmentDistance -= currentSegmentLength;
            nextPathIndex += 1;
            currentSegmentLength = Math.max(
              1,
              getPathSegmentLength(nextPathIndex, pathKey)
            );
          }

          if (nextPathIndex >= path.length - 1) {
            if (!handledEnemyIdsRef.current.has(enemy.id)) {
              handledEnemyIdsRef.current.add(enemy.id);
              const eData = ENEMY_DATA[enemy.type];
              const liveCost = eData.liveCost || 1;
              setLives((l) => Math.max(0, l - liveCost));

              const leakedBounty = eData.bounty;
              addPawPoints(leakedBounty);
              const leakEventId = `leaked-${Date.now()}-${enemy.id}`;
              setLeakedBountyEvents((prev) => {
                if (prev.some(e => e.id === leakEventId)) return prev;
                return [...prev, { id: leakEventId, amount: leakedBounty }];
              });

              gameEventLogRef.current.log("enemy_leaked", `${eData.name || enemy.type} reached the end (-${liveCost} life, +${leakedBounty} PP)`, { enemyType: enemy.type, liveCost, bounty: leakedBounty });
            }
            return null;
          }

          const segIdx = Math.min(nextPathIndex, path.length - 2);
          const segStart = path[segIdx];
          const segEnd = path[segIdx + 1] || segStart;

          return {
            ...enemy,
            pathIndex: nextPathIndex,
            progress: Math.max(
              0,
              Math.min(0.999, segmentDistance / currentSegmentLength)
            ),
            facingRight: getFacingRightFromDelta(
              segEnd.x - segStart.x,
              segEnd.y - segStart.y,
              enemy.facingRight,
            ),
          };
        }
        return { ...enemy, inCombat: false };
      })
      .filter(isDefined)
  );

  // Hero death check & shield maintainance
  if (hero && !hero.dead) {
    if (hero.hp <= 0) {
      setHero((prev) =>
        prev ? killHero(prev, HERO_RESPAWN_TIME) : null
      );
      // Clear taunts when hero dies
      setEnemies((prev) =>
        prev.map((e) => ({ ...e, taunted: false, tauntTarget: undefined, tauntOffset: undefined }))
      );
    }
    // Shield Expiration Logic
    if (hero.shieldActive && now > (hero.shieldEnd || 0)) {
      setHero((prev) => (prev ? { ...prev, shieldActive: false } : null));
      // Clear taunts from all enemies (including taunt offset)
      setEnemies((prev) =>
        prev.map((e) => ({ ...e, taunted: false, tauntTarget: undefined, tauntOffset: undefined }))
      );
    }
    // Ability Transform Expiration (Blue Inferno, etc.) — Ivy uses toggle, not timed expiry
    if (hero.abilityActive && hero.type !== "ivy" && now > (hero.abilityEnd || 0)) {
      setHero((prev) => (prev ? { ...prev, abilityActive: false, abilityEnd: undefined } : null));
    }

    // Ivy Warden healing aura — heals nearby troops when in Warden form
    if (
      hero.type === "ivy" &&
      !hero.abilityActive &&
      Math.floor(now / HERO_COMBAT_STATS.ivyWardenHealInterval) !==
        Math.floor((now - deltaTime) / HERO_COMBAT_STATS.ivyWardenHealInterval)
    ) {
      const healRadius = HERO_COMBAT_STATS.ivyWardenHealRadius;
      const healAmt = HERO_COMBAT_STATS.ivyWardenHealAmount;
      setTroops((prev) =>
        prev.map((troop) => {
          if (!troop.type || troop.hp >= troop.maxHp) return troop;
          if (distance(hero.pos, troop.pos) > healRadius) return troop;
          return {
            ...troop,
            hp: Math.min(troop.maxHp, troop.hp + healAmt),
            healFlash: now,
          };
        }),
      );
    }
  }

  // Hero respawn timer
  if (hero && hero.dead && hero.respawnTimer > 0) {
    setHero((prev) => {
      if (!prev) return null;
      const newTimer = prev.respawnTimer - deltaTime;
      if (newTimer <= 0) {
        const levelSettings = LEVEL_DATA[selectedMap];
        const defaultPathKey = activeWaveSpawnPaths[0] ?? selectedMap;
        const path = MAP_PATHS[defaultPathKey] ?? MAP_PATHS.poe ?? [];
        if (path.length === 0) return { ...prev, respawnTimer: 0 };
        // Respawn at end of path (same as initial spawn)
        const defaultRespawnNode = path[Math.max(0, path.length - 4)] ?? path[path.length - 1];
        const respawnNode = levelSettings?.heroSpawn ?? defaultRespawnNode;
        if (!respawnNode) return { ...prev, respawnTimer: 0 };
        const startPos = gridToWorldPath(respawnNode);
        return {
          ...prev,
          dead: false,
          respawnTimer: 0,
          hp: prev.maxHp,
          pos: startPos,
          rotation: Math.PI, // Face towards enemies
          facingRight: false,
        };
      }
      return { ...prev, respawnTimer: newTimer };
    });
  }

  // First pass: Calculate troop damage from enemies - skip when paused
  const troopDamage: { [id: string]: number } = {};
  const enemiesAttackingTroops: { [enemyId: string]: string } = {};
  const troopAbilityEffects: {
    [troopId: string]: {
      burn?: { damage: number; until: number };
      slow?: { intensity: number; until: number };
      poison?: { damage: number; until: number };
      stun?: { until: number };
      flavor?: string;
      sourceId?: string;
    }
  } = {};
  const troopCombatAbilityUpdates: { [enemyId: string]: {
    lastAbilityUse: number;
    lastAbilityType: EnemyAbilityType;
    abilityCooldowns: Record<string, number>;
    lastTroopAttack?: number;
  } } = {};

  if (!isPaused) {
    // Scale enemy attack interval with game speed
    const effectiveTroopAttackInterval = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
    enemies.forEach((enemy) => {
      if (enemy.frozen || now < enemy.stunUntil) return;
      const eData = ENEMY_DATA[enemy.type];
      // Skip flying enemies and breakthrough enemies (they don't stop for troops)
      if (eData.flying || eData.breakthrough) return;
      if (now - enemy.lastTroopAttack <= effectiveTroopAttackInterval) return;

      const enemyPos = getEnemyPosCached(enemy);

      // Check if hero is nearby (hero takes combat priority over troops)
      const heroNearby =
        hero && !hero.dead && distance(enemyPos, hero.pos) < 60;
      if (heroNearby) return; // Hero will handle this enemy

      // Check for nearby troop
      const nearbyTroop = getNearestTroop(enemyPos, 60);
      if (nearbyTroop) {
        const damage = eData.troopDamage ?? DEFAULT_ENEMY_TROOP_DAMAGE;
        troopDamage[nearbyTroop.id] = (troopDamage[nearbyTroop.id] || 0) + damage;
        enemiesAttackingTroops[enemy.id] = nearbyTroop.id;

        const troopAbils = applyEnemyAbilities(enemy, 'troop', now);
        if (troopAbils) {
          const existing = troopAbilityEffects[nearbyTroop.id] || {};
          if (troopAbils.burn) {
            existing.burn = { damage: troopAbils.burn.damage, until: now + troopAbils.burn.duration };
          }
          if (troopAbils.slow) {
            existing.slow = { intensity: troopAbils.slow.intensity, until: now + troopAbils.slow.duration };
          }
          if (troopAbils.poison) {
            existing.poison = { damage: troopAbils.poison.damage, until: now + troopAbils.poison.duration };
          }
          if (troopAbils.stun) {
            existing.stun = { until: now + troopAbils.stun.duration };
          }
          existing.flavor = troopAbils.flavor;
          existing.sourceId = troopAbils.sourceId;
          troopAbilityEffects[nearbyTroop.id] = existing;

          troopCombatAbilityUpdates[enemy.id] = {
            lastAbilityUse: now,
            lastAbilityType: troopAbils.activatedTypes[0],
            abilityCooldowns: buildAbilityCooldowns(enemy.abilityCooldowns, troopAbils.activatedTypes, now),
          };
        }
      }
    });

    // Flying enemies with targetsTroops can attack troops while passing by (without stopping)
    enemies.forEach((enemy) => {
      if (enemy.frozen || now < enemy.stunUntil) return;
      const flyingData = ENEMY_DATA[enemy.type];
      if (!flyingData.flying || !flyingData.targetsTroops || flyingData.isRanged) return;

      const attackSpeed = flyingData.troopAttackSpeed || DEFAULT_ENEMY_TROOP_ATTACK_SPEED;
      const effectiveAttackInterval = gameSpeed > 0 ? attackSpeed / gameSpeed : attackSpeed;
      if (now - enemy.lastTroopAttack <= effectiveAttackInterval) return;

      const enemyPos = getEnemyPosCached(enemy);

      const attackRange = DEFAULT_ENEMY_FLYING_ATTACK_RANGE;
      const nearbyTroop = getNearestTroop(enemyPos, attackRange);
      if (nearbyTroop) {
        const damage = flyingData.troopDamage || DEFAULT_ENEMY_TROOP_DAMAGE;
        troopDamage[nearbyTroop.id] = (troopDamage[nearbyTroop.id] || 0) + damage;
        enemiesAttackingTroops[enemy.id] = nearbyTroop.id;

        const flyAbils = applyEnemyAbilities(enemy, 'troop', now);
        if (flyAbils) {
          const existing = troopAbilityEffects[nearbyTroop.id] || {};
          if (flyAbils.burn) {
            existing.burn = { damage: flyAbils.burn.damage, until: now + flyAbils.burn.duration };
          }
          if (flyAbils.slow) {
            existing.slow = { intensity: flyAbils.slow.intensity, until: now + flyAbils.slow.duration };
          }
          if (flyAbils.poison) {
            existing.poison = { damage: flyAbils.poison.damage, until: now + flyAbils.poison.duration };
          }
          if (flyAbils.stun) {
            existing.stun = { until: now + flyAbils.stun.duration };
          }
          existing.flavor = flyAbils.flavor;
          existing.sourceId = flyAbils.sourceId;
          troopAbilityEffects[nearbyTroop.id] = existing;

          troopCombatAbilityUpdates[enemy.id] = {
            lastAbilityUse: now,
            lastAbilityType: flyAbils.activatedTypes[0],
            abilityCooldowns: buildAbilityCooldowns(enemy.abilityCooldowns, flyAbils.activatedTypes, now),
            lastTroopAttack: now,
          };
        } else {
          troopCombatAbilityUpdates[enemy.id] = {
            ...(troopCombatAbilityUpdates[enemy.id] || {}),
            lastTroopAttack: now,
          } as typeof troopCombatAbilityUpdates[string];
        }
      }
    });
  } // End of !isPaused check for enemy attacks on troops

  // Calculate which troops will die based on damage
  const deathsToQueue: Array<{
    ownerId: string;
    slot: number;
    respawnPos: Position;
    troopType: string;
    troopId: string;
  }> = [];
  const troopsThatWillDie = new Set<string>();

  for (const troop of troops) {
    const damage = troopDamage[troop.id] || 0;
    if (damage > 0 && troop.hp - damage <= 0) {
      troopsThatWillDie.add(troop.id);
      raiseHexWardGhostFromTroopDeath(troop, troop.pos);
      addParticles(troop.pos, "explosion", 8);
      if (troop.ownerId && !troop.ownerId.startsWith("spell")) {
        deathsToQueue.push({
          ownerId: troop.ownerId,
          slot: troop.spawnSlot ?? 0,
          respawnPos: troop.userTargetPos || troop.spawnPoint || troop.pos,
          troopType: troop.type || "footsoldier",
          troopId: troop.id,
        });
      }
    }
  }

  // Apply troop damage, status effects, and remove dead troops
  if (Object.keys(troopDamage).length > 0 || Object.keys(troopAbilityEffects).length > 0) {
    setTroops((prevTroops) => {
      return prevTroops
        .filter((troop) => !troopsThatWillDie.has(troop.id))
        .map((troop) => {
          const damage = troopDamage[troop.id] || 0;
          const effects = troopAbilityEffects[troop.id];

          const updatedTroop = { ...troop };

          if (damage > 0) {
            updatedTroop.hp = troop.hp - damage;
            updatedTroop.lastCombatTime = Date.now();
          }

          // Apply ability effects
          if (effects) {
            if (effects.burn) {
              updatedTroop.burning = true;
              updatedTroop.burnDamage = effects.burn.damage;
              updatedTroop.burnUntil = effects.burn.until;
              updatedTroop.burnFlavor = effects.flavor;
              updatedTroop.burnSourceId = effects.sourceId;
            }
            if (effects.slow) {
              updatedTroop.slowed = true;
              updatedTroop.slowIntensity = effects.slow.intensity;
              updatedTroop.slowUntil = effects.slow.until;
              updatedTroop.slowFlavor = effects.flavor;
              updatedTroop.slowSourceId = effects.sourceId;
            }
            if (effects.poison) {
              updatedTroop.poisoned = true;
              updatedTroop.poisonDamage = effects.poison.damage;
              updatedTroop.poisonUntil = effects.poison.until;
              updatedTroop.poisonFlavor = effects.flavor;
              updatedTroop.poisonSourceId = effects.sourceId;
            }
            if (effects.stun) {
              updatedTroop.stunned = true;
              updatedTroop.stunUntil = effects.stun.until;
              updatedTroop.stunFlavor = effects.flavor;
              updatedTroop.stunSourceId = effects.sourceId;
            }
          }

          return updatedTroop;
        });
    });
  }

  // Queue respawns on towers
  if (deathsToQueue.length > 0) {
    const deathsByOwner = new Map<string, (typeof deathsToQueue)[number][]>();
    deathsToQueue.forEach((death) => {
      const ownerDeaths = deathsByOwner.get(death.ownerId);
      if (ownerDeaths) {
        ownerDeaths.push(death);
      } else {
        deathsByOwner.set(death.ownerId, [death]);
      }
    });

    setTowers((prevTowers) =>
      prevTowers.map((t) => {
        const deaths = deathsByOwner.get(t.id);
        if (!deaths || deaths.length === 0) return t;

        const existing = t.pendingRespawns || [];
        const newRespawns = deaths.filter(
          (d) => !existing.some((e) => e.slot === d.slot)
        );

        if (newRespawns.length === 0) return t;

        return {
          ...t,
          pendingRespawns: [
            ...existing,
            ...newRespawns.map((d) => ({
              slot: d.slot,
              timer: TROOP_RESPAWN_TIME,
              respawnPos: d.respawnPos,
              troopType: d.troopType,
            })),
          ],
        };
      })
    );
  }

  // Update enemies
  setEnemies((prev) =>
    prev
      .map((enemy) => {
        // Process burning damage (skip when paused so effects freeze)
        if (!isPaused) {
          if (enemy.burning && enemy.burnUntil && now < enemy.burnUntil) {
            const burnDmg = getEnemyDamageTaken(
              enemy,
              ((enemy.burnDamage || DEFAULT_ENEMY_BURN_DAMAGE) * deltaTime) / 1000,
              "fire"
            );
            const newHp = enemy.hp - burnDmg;
            if (newHp <= 0) {
              onEnemyKill(enemy, getEnemyPosCached(enemy), 8, "fire");
              return null;
            }
            enemy = { ...enemy, hp: newHp, lastDamageTaken: now };
          } else if (
            enemy.burning &&
            enemy.burnUntil &&
            now >= enemy.burnUntil
          ) {
            enemy = { ...enemy, burning: false, burnDamage: 0, burnUntil: 0 };
          }
        }
        if (
          !isPaused &&
          enemy.hexWard &&
          enemy.hexWardUntil &&
          now >= enemy.hexWardUntil
        ) {
          enemy = {
            ...enemy,
            hexWard: false,
            hexWardUntil: 0,
            hexWardDamageAmp: 0,
            hexWardBlocksHealing: false,
          };
        }
        // Regenerating enemies heal 1.5% max HP/sec when not in combat
        // and haven't taken damage recently (mirrors hero/troop heal delay)
        const eTraits = ENEMY_DATA[enemy.type].traits;
        if (
          eTraits?.includes("regenerating") &&
          !enemy.inCombat &&
          enemy.hp < enemy.maxHp &&
          !enemy.hexWardBlocksHealing &&
          now - (enemy.lastDamageTaken ?? 0) > ENEMY_REGEN_DELAY_MS
        ) {
          const regenAmount = (enemy.maxHp * ENEMY_REGEN_RATE * deltaTime) / 1000;
          enemy = { ...enemy, hp: Math.min(enemy.maxHp, enemy.hp + regenAmount) };
        }
        // Clear frozen state when stun duration expires (skip when paused)
        if (!isPaused && enemy.frozen && enemy.stunUntil && now >= enemy.stunUntil) {
          enemy = { ...enemy, frozen: false };
        }
        if (enemy.frozen || now < enemy.stunUntil) {
          return {
            ...enemy,
            damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
          };
        }
        if (enemy.taunted) {
          const decayedSlow = Math.max(0, enemy.slowEffect - deltaTime / 5000);
          return {
            ...enemy,
            slowEffect: decayedSlow,
            slowSource: decayedSlow > 0 ? enemy.slowSource : undefined,
            slowed: enemy.slowEffect > 0,
            slowIntensity: enemy.slowEffect,
            damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
          };
        }
        const enemyPosForCombat = getEnemyPosCached(enemy);
        // Check for nearby hero combat
        // Flying enemies can only melee with a flying hero (nassau)
        const enemyIsFlying = ENEMY_DATA[enemy.type].flying;
        const heroCanMelee = hero && !hero.dead && distance(enemyPosForCombat, hero.pos) < 60;
        const flyingMeleeAllowed = !enemyIsFlying || (HERO_DATA[hero?.type ?? "tiger"].isFlying ?? false);
        const nearbyHero = heroCanMelee && flyingMeleeAllowed ? hero : null;
        if (nearbyHero) {
          // Scale enemy attack interval with game speed - skip when paused
          const effectiveHeroAttackInterval2 = gameSpeed > 0 ? 1000 / gameSpeed : 1000;
          if (!isPaused && now - enemy.lastHeroAttack > effectiveHeroAttackInterval2) {
            setHero((prevHero) => {
              if (!prevHero || prevHero.dead) return prevHero;
              const heroDamage = ENEMY_DATA[enemy.type].troopDamage ?? DEFAULT_ENEMY_HERO_DAMAGE;
              const newHp = prevHero.hp - heroDamage;
              if (newHp <= 0) {
                return killHero(prevHero, HERO_RESPAWN_TIME);
              }
              return { ...prevHero, hp: newHp };
            });
            return {
              ...enemy,
              inCombat: true,
              combatTarget: nearbyHero.id,
              lastHeroAttack: now,
              damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
              facingRight: getFacingRightFromDelta(
                nearbyHero.pos.x - enemyPosForCombat.x,
                nearbyHero.pos.y - enemyPosForCombat.y,
                enemy.facingRight,
              ),
            };
          }
          return {
            ...enemy,
            inCombat: true,
            combatTarget: nearbyHero.id,
            damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
            facingRight: getFacingRightFromDelta(
              nearbyHero.pos.x - enemyPosForCombat.x,
              nearbyHero.pos.y - enemyPosForCombat.y,
              enemy.facingRight,
            ),
          };
        }
        // Check for nearby troop combat (damage already applied above)
        // Skip if enemy is flying or has breakthrough
        const enemyDataCheck = ENEMY_DATA[enemy.type];
        const nearbyTroop =
          !enemyDataCheck.flying && !enemyDataCheck.breakthrough
            ? getNearestTroop(enemyPosForCombat, 60)
            : null;
        if (nearbyTroop) {
          // Check if this enemy attacked this frame
          const attackedThisFrame =
            enemiesAttackingTroops[enemy.id] === nearbyTroop.id;
          const troopFacing = getFacingRightFromDelta(
            nearbyTroop.pos.x - enemyPosForCombat.x,
            nearbyTroop.pos.y - enemyPosForCombat.y,
            enemy.facingRight,
          );
          if (attackedThisFrame) {
            const abilityPatch = troopCombatAbilityUpdates[enemy.id];
            return {
              ...enemy,
              inCombat: true,
              combatTarget: nearbyTroop.id,
              lastTroopAttack: now,
              damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
              facingRight: troopFacing,
              ...(abilityPatch && {
                lastAbilityUse: abilityPatch.lastAbilityUse,
                lastAbilityType: abilityPatch.lastAbilityType,
                abilityCooldowns: abilityPatch.abilityCooldowns,
              }),
            };
          }
          return {
            ...enemy,
            inCombat: true,
            combatTarget: nearbyTroop.id,
            damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
            facingRight: troopFacing,
          };
        }
        if (enemy.inCombat && !nearbyTroop && !nearbyHero) {
          // Ranged enemies: let the ranged targeting path manage their combat state
          if (!ENEMY_DATA[enemy.type].isRanged) {
            return {
              ...enemy,
              inCombat: false,
              combatTarget: undefined,
              damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
            };
          }
        }
        // Ranged enemy attacks - they stop and attack when target in range
        const enemyData = ENEMY_DATA[enemy.type];
        if (
          enemyData.isRanged &&
          enemyData.range &&
          enemyData.attackSpeed
        ) {
          const enemyPos = enemyPosForCombat;
          // Check for targets in range (hero and troops)
          let rangedTarget: {
            type: "hero" | "troop";
            pos: Position;
            id: string;
          } | null = null;
          if (
            hero &&
            !hero.dead &&
            distance(enemyPos, hero.pos) <= enemyData.range
          ) {
            rangedTarget = { type: "hero", pos: hero.pos, id: hero.id };
          } else {
            const targetTroop = getNearestTroop(
              enemyPos,
              enemyData.range || DEFAULT_ENEMY_RANGE
            );
            if (targetTroop) {
              rangedTarget = {
                type: "troop",
                pos: targetTroop.pos,
                id: targetTroop.id,
              };
            }
          }

          // If ranged enemy has a target in range, stop and attack
          if (rangedTarget) {
            enemy = {
              ...enemy,
              inCombat: true,
              combatTarget: rangedTarget.id,
              facingRight: getFacingRightFromDelta(
                rangedTarget.pos.x - enemyPos.x,
                rangedTarget.pos.y - enemyPos.y,
                enemy.facingRight,
              ),
            };

            // Scale ranged enemy attack speed with game speed - skip when paused
            const effectiveRangedAttackSpeed = gameSpeed > 0 ? enemyData.attackSpeed / gameSpeed : enemyData.attackSpeed;
            if (!isPaused && now - enemy.lastRangedAttack > effectiveRangedAttackSpeed) {
              // Create projectile with enemy-specific type
              const projType = (() => {
                switch (enemy.type) {
                  case "mage":
                    return "fireball";
                  case "warlock":
                    return "magicBolt";
                  case "hexer":
                    return "poisonBolt";
                  case "necromancer":
                    return "darkBolt";
                  case "catapult":
                    return "rock";
                  case "crossbowman":
                    return "bolt";
                  case "harpy":
                    return "arrow";
                  case "wyvern":
                    return "wyvernBolt";
                  case "frostling":
                    return "frostBolt";
                  case "infernal":
                    return "infernalFire";
                  case "banshee":
                    return "bansheeScream";
                  case "dragon":
                    return "fireball";
                  default:
                    return "arrow";
                }
              })();

              // Determine if this is an AoE attack
              const isAoEAttack = ["catapult", "dragon", "infernal", "wyvern"].includes(enemy.type);
              const aoeRadius = isAoEAttack
                ? (enemy.type === "dragon" ? 80 : enemy.type === "wyvern" ? 70 : enemy.type === "catapult" ? 60 : 50)
                : 0;

              // Calculate arc height for projectiles that should arc
              const arcHeight = ["rock", "fireball"].includes(projType) ? 50 : 0;

              // Flying enemies shoot from above — projectile starts elevated and descends
              const elevation = enemyData.flying ? 30 : 0;

              setProjectiles((proj) => [
                ...proj,
                {
                  id: generateId("eproj"),
                  from: { x: enemyPos.x, y: enemyPos.y - 15 },
                  to: rangedTarget!.pos,
                  progress: 0,
                  type: projType,
                  rotation: Math.atan2(
                    rangedTarget!.pos.y - enemyPos.y,
                    rangedTarget!.pos.x - enemyPos.x
                  ),
                  damage: enemyData.projectileDamage || DEFAULT_ENEMY_PROJECTILE_DAMAGE,
                  targetType: rangedTarget!.type,
                  targetId: rangedTarget!.id,
                  arcHeight: arcHeight,
                  elevation: elevation,
                  isAoE: isAoEAttack,
                  aoeRadius: aoeRadius,
                  scale: enemy.type === "dragon" ? 1.5 : undefined,
                },
              ]);
              return {
                ...enemy,
                lastRangedAttack: now,
                damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
                // Don't move - attacking from range
              };
            }
            // Has target but on cooldown - still stop and face target
            return {
              ...enemy,
              damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
              // Don't move - waiting for attack cooldown
            };
          }
          // Ranged enemy lost its target — clear combat state
          if (enemy.inCombat) {
            enemy = { ...enemy, inCombat: false, combatTarget: undefined };
          }
        }
        // Update slowed visual indicator
        const slowedVisual = enemy.slowEffect > 0;
        const slowIntensity = enemy.slowEffect;
        const decayedSlow = Math.max(0, enemy.slowEffect - deltaTime / 5000);
        const decayedSlowSource = decayedSlow > 0 ? enemy.slowSource : undefined;
        // Move enemy along path - normalize speed by segment length for consistent world-space speed
        if (!enemy.inCombat) {
          // Use enemy's pathKey for dual-path support
          const pathKey = enemy.pathKey || selectedMap;
          const path = MAP_PATHS[pathKey];
          if (!path || path.length < 2) {
            return {
              ...enemy,
              slowEffect: decayedSlow,
              slowSource: decayedSlowSource,
              slowed: slowedVisual,
              slowIntensity: slowIntensity,
              damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
            };
          }
          const speedMult = (1 - enemy.slowEffect) * ENEMY_SPEED_MODIFIER;
          const segmentLength = getPathSegmentLength(enemy.pathIndex, pathKey);
          const worldAdvance =
            (ENEMY_DATA[enemy.type].speed * speedMult * deltaTime * TILE_SIZE) / 1000;
          let nextPathIndex = enemy.pathIndex;
          let currentSegmentLength = Math.max(1, segmentLength);
          let segmentDistance =
            enemy.progress * currentSegmentLength + worldAdvance;

          while (
            segmentDistance >= currentSegmentLength &&
            nextPathIndex < path.length - 1
          ) {
            segmentDistance -= currentSegmentLength;
            nextPathIndex += 1;
            currentSegmentLength = Math.max(
              1,
              getPathSegmentLength(nextPathIndex, pathKey)
            );
          }

          // Compute facing direction from destination segment
          const segIdx = Math.min(nextPathIndex, path.length - 2);
          const segStart = path[segIdx];
          const segEnd = path[segIdx + 1] || segStart;
          const facingRight = getFacingRightFromDelta(
            segEnd.x - segStart.x,
            segEnd.y - segStart.y,
          );

          if (nextPathIndex >= path.length - 1) {
            if (!handledEnemyIdsRef.current.has(enemy.id)) {
              handledEnemyIdsRef.current.add(enemy.id);
              const liveCost = ENEMY_DATA[enemy.type].liveCost || 1;
              setLives((l) => Math.max(0, l - liveCost));
              gameEventLogRef.current.log("enemy_leaked", `${ENEMY_DATA[enemy.type].name || enemy.type} (flying) reached the end (-${liveCost} life)`, { enemyType: enemy.type, liveCost });
            }
            return null;
          }

          return {
            ...enemy,
            pathIndex: nextPathIndex,
            progress: Math.max(
              0,
              Math.min(0.999, segmentDistance / currentSegmentLength)
            ),
            slowEffect: decayedSlow,
            slowSource: decayedSlowSource,
            slowed: slowedVisual,
            slowIntensity: slowIntensity,
            damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
            facingRight,
          };
        }
        return {
          ...enemy,
          slowed: slowedVisual,
          slowIntensity: slowIntensity,
          damageFlash: Math.max(0, enemy.damageFlash - deltaTime),
        };
      })
      .filter(isDefined)
  );
  // Apply deferred ability cooldown updates for flying enemies attacking troops
  // (ground enemies already had their updates applied in the attackedThisFrame path)
  const flyingAbilityIds = Object.keys(troopCombatAbilityUpdates).filter(
    (id) => {
      const e = enemies.find((en) => en.id === id);
      return e && ENEMY_DATA[e.type].flying;
    }
  );
  if (flyingAbilityIds.length > 0) {
    setEnemies((prev) =>
      prev.map((enemy) => {
        const update = troopCombatAbilityUpdates[enemy.id];
        if (!update || !ENEMY_DATA[enemy.type].flying) return enemy;
        return {
          ...enemy,
          ...(update.lastTroopAttack !== undefined && { lastTroopAttack: update.lastTroopAttack }),
          ...(update.lastAbilityUse && {
            lastAbilityUse: update.lastAbilityUse,
            lastAbilityType: update.lastAbilityType,
            abilityCooldowns: update.abilityCooldowns,
          }),
        };
      })
    );
  }
  // Soft-repulsion lane spreading: push nearby same-layer enemies apart
  // laterally instead of hard blocking. Enemies always move forward at
  // their natural speed; only the lateral (perpendicular) offset changes.
  setEnemies((prev) => {
    if (prev.length <= 1) return prev;

    type LaneEntry = {
      index: number;
      pathKey: string;
      isFlying: boolean;
      progressMetric: number;
      laneOffset: number;
      formationOffset: number;
    };

    const layerBuckets = new Map<string, LaneEntry[]>();
    const entries: LaneEntry[] = new Array(prev.length);

    for (let i = 0; i < prev.length; i++) {
      const enemy = prev[i];
      const pathKey = enemy.pathKey || selectedMap;
      const isFlying = ENEMY_DATA[enemy.type].flying;
      const preferredLane = clampLaneIndex(
        typeof enemy.formationLane === "number"
          ? enemy.formationLane
          : ENEMY_CENTER_LANE_INDEX
      );
      const entry: LaneEntry = {
        index: i,
        pathKey,
        isFlying,
        progressMetric: enemy.pathIndex + enemy.progress,
        laneOffset: enemy.laneOffset,
        formationOffset: ENEMY_LANE_OFFSETS[preferredLane] ?? 0,
      };
      entries[i] = entry;
      const layerKey = `${pathKey}:${isFlying ? "f" : "g"}`;
      const bucket = layerBuckets.get(layerKey);
      if (bucket) bucket.push(entry);
      else layerBuckets.set(layerKey, [entry]);
    }

    layerBuckets.forEach((bucket) =>
      bucket.sort((a, b) => a.progressMetric - b.progressMetric)
    );

    let hasChanges = false;
    const updated = prev.map((enemy, i) => {
      const entry = entries[i];
      if (
        enemy.inCombat ||
        enemy.taunted ||
        enemy.frozen ||
        now < enemy.stunUntil
      )
        return enemy;

      const layerKey = `${entry.pathKey}:${entry.isFlying ? "f" : "g"}`;
      const bucket = layerBuckets.get(layerKey);
      if (!bucket || bucket.length <= 1) return enemy;

      let lateralPush = 0;
      for (const other of bucket) {
        if (other.index === i) continue;
        const progressDist = Math.abs(
          other.progressMetric - entry.progressMetric
        );
        if (progressDist > ENEMY_REPULSION_PROGRESS_RADIUS) continue;

        const lateralDiff = entry.laneOffset - other.laneOffset;
        const absLateral = Math.abs(lateralDiff);
        const proximityFactor =
          1 - progressDist / ENEMY_REPULSION_PROGRESS_RADIUS;

        if (absLateral < 0.05) {
          const sign = enemy.id > prev[other.index].id ? 1 : -1;
          lateralPush +=
            sign * ENEMY_REPULSION_LATERAL_STRENGTH * proximityFactor;
        } else {
          const sign = lateralDiff > 0 ? 1 : -1;
          lateralPush +=
            (sign * ENEMY_REPULSION_LATERAL_STRENGTH * proximityFactor) /
            (1 + absLateral * 4);
        }
      }

      const formationPull =
        (entry.formationOffset - entry.laneOffset) *
        ENEMY_FORMATION_PULL_STRENGTH;

      const totalForce = lateralPush + formationPull;
      const laneBlend = Math.min(1, deltaTime / ENEMY_LANE_SHIFT_MS);
      const nextLaneOffset = clampLaneOffset(
        entry.laneOffset + totalForce * laneBlend
      );

      const preferredLane = clampLaneIndex(
        typeof enemy.formationLane === "number"
          ? enemy.formationLane
          : ENEMY_CENTER_LANE_INDEX
      );

      if (
        Math.abs(nextLaneOffset - enemy.laneOffset) > 0.0005 ||
        enemy.formationLane !== preferredLane
      ) {
        hasChanges = true;
        return {
          ...enemy,
          laneOffset: nextLaneOffset,
          formationLane: preferredLane,
        };
      }
      return enemy;
    });
    return hasChanges ? updated : prev;
  });
  // Summoner enemies: 2-phase channeling system
  // Phase 1: summoner stops moving and channels for SUMMON_CHANNEL_DURATION
  // Phase 2: minions spawn and summoner resumes movement
  setEnemies((prev) => {
    const summoned: Enemy[] = [];
    let hasChanges = false;
    const updated = prev.map((enemy) => {
      const eData = ENEMY_DATA[enemy.type];
      if (!eData.traits?.includes("summoner")) return enemy;

      // Cancel channel if interrupted by combat, freeze, or stun
      if (enemy.summoning && (enemy.inCombat || enemy.frozen || now < enemy.stunUntil)) {
        hasChanges = true;
        return { ...enemy, summoning: false, summonStartTime: undefined };
      }

      // Phase 2: channeling complete — spawn minions
      if (enemy.summoning && enemy.summonStartTime) {
        const elapsed = now - enemy.summonStartTime;
        if (elapsed >= SUMMON_CHANNEL_DURATION) {
          const minionType = (eData.summonType || "cultist") as EnemyType;
          const minionData = ENEMY_DATA[minionType];
          const count = eData.summonCount || 1;
          for (let i = 0; i < count; i++) {
            const minion: Enemy = {
              id: generateId("minion"),
              type: minionType,
              pathIndex: Math.max(0, enemy.pathIndex - 1),
              progress: enemy.progress,
              hp: minionData.hp,
              maxHp: minionData.hp,
              speed: minionData.speed,
              slowEffect: 0,
              stunUntil: 0,
              frozen: false,
              damageFlash: 0,
              inCombat: false,
              lastTroopAttack: 0,
              lastHeroAttack: 0,
              lastRangedAttack: 0,
              spawnProgress: 0,
              laneOffset: clampLaneOffset(
                enemy.laneOffset + (Math.random() - 0.5) * ENEMY_SPAWN_LANE_JITTER * 2
              ),
              formationLane:
                typeof enemy.formationLane === "number"
                  ? clampLaneIndex(enemy.formationLane + (i % 2 === 0 ? 1 : -1))
                  : getNearestLaneIndex(enemy.laneOffset),
              slowed: false,
              slowIntensity: 0,
              pathKey: enemy.pathKey,
            };
            summoned.push(minion);
          }
          addParticles(getEnemyPosCached(enemy), "summon", 8);
          hasChanges = true;
          return { ...enemy, summoning: false, summonStartTime: undefined, lastSummon: now };
        }
        // Still channeling — emit periodic particles
        if (elapsed % 400 < deltaTime) {
          addParticles(getEnemyPosCached(enemy), "summon", 3);
        }
        return enemy;
      }

      // Phase 1: check if ready to begin channeling
      if (enemy.lastSummon && now - enemy.lastSummon < SUMMON_COOLDOWN) return enemy;
      if (enemy.inCombat || enemy.frozen || now < enemy.stunUntil) return enemy;
      hasChanges = true;
      addParticles(getEnemyPosCached(enemy), "summon", 4);
      return { ...enemy, summoning: true, summonStartTime: now };
    });
    if (!hasChanges && summoned.length === 0) return prev;
    return summoned.length > 0 ? [...updated, ...summoned] : updated;
  });

  // Unified separation forces for all friendly units (hero + troops).
  // Computed once, applied to both hero and troops for consistent behaviour.
  const friendlyUnits: { id: string; pos: Position }[] = troops
    .filter((t) => !t.dead)
    .map((t) => ({ id: t.id, pos: t.pos }));
  if (hero && !hero.dead) {
    friendlyUnits.push({ id: hero.id, pos: hero.pos });
  }
  const friendlySeparation = computeSeparationForces(
    friendlyUnits,
    TROOP_SEPARATION_DIST,
    1.35
  );

  // Update hero movement - with sight-based engagement
  if (hero && !hero.dead) {
    setHero((prev) => {
      if (!prev || prev.dead) return prev;

      if (prev.stunned && prev.stunUntil && now < prev.stunUntil) {
        return { ...prev, moving: false, aggroTarget: undefined };
      }

      const heroData = HERO_DATA[prev.type];
      const slowMultiplier =
        prev.slowed && prev.slowIntensity ? 1 - prev.slowIntensity : 1;
      const isIvyColossusMove = prev.type === "ivy" && prev.abilityActive;
      const baseSpeed = isIvyColossusMove ? HERO_COMBAT_STATS.ivyColossusSpeed : heroData.speed;
      const speed = baseSpeed * slowMultiplier;
      const isRanged = isIvyColossusMove ? false : (heroData.isRanged || false);
      const attackRange = heroData.range;
      const sightRange = isRanged
        ? HERO_RANGED_SIGHT_RANGE
        : HERO_SIGHT_RANGE;

      const heroIsFlying = HERO_DATA[prev.type].isFlying ?? false;
      const heroTargetPredicate = heroIsFlying
        ? undefined
        : (enemy: Enemy) => !ENEMY_DATA[enemy.type].flying;

      let closestEnemy = getClosestEnemy(
        prev.pos,
        sightRange,
        heroTargetPredicate,
      );
      let closestDist = closestEnemy
        ? distance(prev.pos, getEnemyPosCached(closestEnemy))
        : Number.POSITIVE_INFINITY;

      // Ally alert: if no enemy in direct sight and not player-moving,
      // check if nearby troops are in combat and join the fight
      if (!closestEnemy && !prev.moving) {
        const troopAllies = troops
          .filter((t) => !t.dead)
          .map((t) => ({ pos: t.pos, engaging: !!t.engaging }));

        const alertResult = findAllyAlertTarget(
          prev.pos, troopAllies, enemies, getEnemyPosCached,
          sightRange + ALLY_ALERT_RANGE, heroTargetPredicate,
        );
        if (alertResult) {
          closestEnemy = alertResult.enemy;
          closestDist = alertResult.dist;
        }
      }

      // Determine home position (where the hero should return to)
      const homePos = prev.homePos || prev.pos;

      // If player is commanding movement, prioritize that
      if (prev.moving && prev.targetPos) {
        const step = stepTowardTarget({
          current: prev.pos,
          target: prev.targetPos,
          speed,
          deltaTime,
          stopDistance: 5,
        });

        if (step.reached) {
          return {
            ...prev,
            pos: prev.targetPos,
            moving: false,
            targetPos: undefined,
            homePos: prev.targetPos, // Update home position when reaching destination
            aggroTarget: undefined,
            returning: false,
            rotation: step.rotation,
            facingRight: getFacingRightFromDelta(
              prev.targetPos.x - prev.pos.x,
              prev.targetPos.y - prev.pos.y,
              prev.facingRight ?? true,
            ),
          };
        }
        return {
          ...prev,
          pos: step.pos,
          rotation: step.rotation,
          facingRight: step.facingRight,
          homePos: prev.targetPos,
          aggroTarget: undefined,
          returning: false,
        };
      }

      if (closestEnemy) {
        // Enemy in sight - engage!
        const enemyPos = getEnemyPosCached(closestEnemy);

        // Ranged heroes: stay at attack range and don't rush in
        // Melee heroes: rush in to melee range
        // Ranged heroes will switch to melee if enemy gets too close
        const effectiveAttackRange = isRanged
          ? closestDist <= MELEE_RANGE
            ? MELEE_RANGE
            : attackRange
          : MELEE_RANGE;

        if (closestDist > effectiveAttackRange) {
          // Enemy in sight but out of attack range
          // Melee heroes: always move toward enemy
          // Ranged heroes: only move if enemy is beyond attack range
          const shouldMove = !isRanged || closestDist > attackRange;

          if (shouldMove) {
            // For ranged heroes, stop at attack range - 20 (safe distance)
            // For melee heroes, get as close as possible
            const targetDist = isRanged
              ? Math.max(MELEE_RANGE, attackRange - 20)
              : MELEE_RANGE;
            const step = stepTowardTarget({
              current: prev.pos,
              target: enemyPos,
              speed,
              deltaTime,
              stopDistance: targetDist,
            });

            if (!step.reached) {
              let heroChasePos = step.pos;
              const heroPathCheck = findClosestPathPoint(heroChasePos, selectedMap);
              if (heroPathCheck) {
                heroChasePos = constrainToNearPath(
                  heroChasePos, heroPathCheck.point,
                  heroPathCheck.distance, MAX_HERO_PATH_DISTANCE,
                );
              }
              return {
                ...prev,
                pos: heroChasePos,
                rotation: step.rotation,
                facingRight: step.facingRight,
                aggroTarget: closestEnemy.id,
                returning: false,
              };
            }
          }

          // Ranged hero at attack range - face enemy but don't move
          const dx = enemyPos.x - prev.pos.x;
          const dy = enemyPos.y - prev.pos.y;
          return {
            ...prev,
            rotation: Math.atan2(dy, dx),
            facingRight: getFacingRightFromDelta(dx, dy, prev.facingRight ?? true),
            aggroTarget: closestEnemy.id,
            returning: false,
          };
        } else {
          // Within attack range - face enemy but don't move
          const dx = enemyPos.x - prev.pos.x;
          const dy = enemyPos.y - prev.pos.y;
          return {
            ...prev,
            rotation: Math.atan2(dy, dx),
            facingRight: getFacingRightFromDelta(dx, dy, prev.facingRight ?? true),
            aggroTarget: closestEnemy.id,
            returning: false,
          };
        }
      } else if (homePos) {
        // No enemy in sight but was in combat - return home
        const step = stepTowardTarget({
          current: prev.pos,
          target: homePos,
          speed,
          deltaTime,
          stopDistance: 8,
        });

        if (!step.reached) {
          return {
            ...prev,
            pos: step.pos,
            rotation: step.rotation,
            facingRight: step.facingRight,
            aggroTarget: undefined,
            returning: true,
          };
        } else {
          // At home - stop
          return {
            ...prev,
            aggroTarget: undefined,
            returning: false,
            moving: false,
          };
        }
      }

      return prev;
    });
    // Apply unified separation force to hero (suppress when settled at home)
    setHero((prev) => {
      if (!prev || prev.dead) return prev;
      const heroHome = prev.homePos || prev.pos;
      const heroSettled = !prev.aggroTarget && !prev.moving
        && distance(prev.pos, heroHome) < UNIT_SETTLE_DISTANCE;
      if (heroSettled) return prev;

      const force = friendlySeparation.get(prev.id);
      if (
        !force ||
        (Math.abs(force.x) < 0.0001 && Math.abs(force.y) < 0.0001)
      )
        return prev;
      return {
        ...prev,
        pos: {
          x: prev.pos.x + force.x * deltaTime * FRIENDLY_SEPARATION_MULT,
          y: prev.pos.y + force.y * deltaTime * FRIENDLY_SEPARATION_MULT,
        },
      };
    });
  }
  // Update troop movement - with sight-based engagement
  const dotDeaths: Array<{
    ownerId: string;
    slot: number;
    respawnPos: Position;
    troopType: string;
    troopId: string;
    pos: Position;
  }> = [];
  setTroops((prev) => {
    // Update positions with sight-based engagement
    return prev.filter((troop) => {
      if (!troop.type) return true;
      if (troop.hp > 0) return true;
      raiseHexWardGhostFromTroopDeath(troop, troop.pos);
      addParticles(troop.pos, "explosion", 8);
      if (troop.ownerId && !troop.ownerId.startsWith("spell")) {
        dotDeaths.push({
          ownerId: troop.ownerId,
          slot: troop.spawnSlot ?? 0,
          respawnPos: troop.userTargetPos || troop.spawnPoint || troop.pos,
          troopType: troop.type || "footsoldier",
          troopId: troop.id,
          pos: troop.pos,
        });
      }
      return false;
    }).map((troop) => {
      const updated = { ...troop };
      if (!troop.type) return updated;
      const troopData = TROOP_DATA[troop.type];
      if (!troopData) return updated;

      // ========== PROCESS STATUS EFFECTS ==========
      // Skip expiry and DoT when paused so effects freeze in place
      if (!isPaused) {
        const currentTime = Date.now();
        if (updated.burnUntil && currentTime > updated.burnUntil) {
          updated.burning = false;
          updated.burnDamage = undefined;
          updated.burnUntil = undefined;
          updated.burnFlavor = undefined;
          updated.burnSourceId = undefined;
        }
        if (updated.slowUntil && currentTime > updated.slowUntil) {
          updated.slowed = false;
          updated.slowIntensity = undefined;
          updated.slowUntil = undefined;
          updated.slowFlavor = undefined;
          updated.slowSourceId = undefined;
        }
        if (updated.poisonUntil && currentTime > updated.poisonUntil) {
          updated.poisoned = false;
          updated.poisonDamage = undefined;
          updated.poisonUntil = undefined;
          updated.poisonFlavor = undefined;
          updated.poisonSourceId = undefined;
        }
        if (updated.stunUntil && currentTime > updated.stunUntil) {
          updated.stunned = false;
          updated.stunUntil = undefined;
          updated.stunFlavor = undefined;
          updated.stunSourceId = undefined;
        }

        const dotTick = deltaTime / 1000;
        if (updated.burning && updated.burnDamage) {
          updated.hp = Math.max(0, updated.hp - updated.burnDamage * dotTick);
        }
        if (updated.poisoned && updated.poisonDamage) {
          updated.hp = Math.max(0, updated.hp - updated.poisonDamage * dotTick);
        }
        if (updated.isHexGhost) {
          if (updated.hexGhostDecayPerSecond) {
            updated.hp = Math.max(
              0,
              updated.hp - updated.hexGhostDecayPerSecond * dotTick
            );
          }
          if (
            updated.hexGhostExpireTime &&
            currentTime >= updated.hexGhostExpireTime
          ) {
            updated.hp = 0;
          }
        }
      }

      // If stunned, skip movement/engagement
      if (updated.stunned && updated.stunUntil && Date.now() < updated.stunUntil) {
        // Stunned - can't move or attack, just stand there
        updated.engaging = false;
        updated.moving = false;
        return updated;
      }

      const isRanged = troop.overrideIsRanged ?? troopData.isRanged;
      const isStationary = troopData.isStationary || troop.moveRadius === 0; // Turrets can't move
      const attackRange = isRanged
        ? troop.overrideRange ?? troopData.range ?? DEFAULT_TROOP_RANGED_RANGE
        : MELEE_RANGE;
      const sightRange = isRanged
        ? TROOP_RANGED_SIGHT_RANGE
        : TROOP_SIGHT_RANGE;

      const canHitFlying =
        troop.overrideCanTargetFlying ?? troopData.canTargetFlying ?? false;
      let enemiesInSightCount = 0;
      let closestEnemy: Enemy | null = null;
      let closestDist = Infinity;
      for (const enemy of enemies) {
        if (!canHitFlying && ENEMY_DATA[enemy.type].flying) continue;
        const enemyPos = getEnemyPosCached(enemy);
        const dist = distance(troop.pos, enemyPos);
        if (dist > sightRange) continue;
        enemiesInSightCount += 1;
        if (dist < closestDist) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      }

      // Ally alert: if no enemy in direct sight and not player-moving,
      // check if nearby allies are in combat and join the fight
      if (!closestEnemy && !troop.moving) {
        const flyingFilter = canHitFlying
          ? undefined
          : (e: Enemy) => !ENEMY_DATA[e.type].flying;

        const allies: { pos: Position; engaging: boolean }[] = [];
        for (const other of prev) {
          if (other.id === troop.id || other.dead) continue;
          allies.push({ pos: other.pos, engaging: !!other.engaging });
        }
        if (hero && !hero.dead) {
          allies.push({ pos: hero.pos, engaging: !!hero.aggroTarget });
        }

        const alertResult = findAllyAlertTarget(
          troop.pos, allies, enemies, getEnemyPosCached,
          sightRange + ALLY_ALERT_RANGE, flyingFilter,
        );
        if (alertResult) {
          closestEnemy = alertResult.enemy;
          closestDist = alertResult.dist;
        }
      }

      // Determine home position (where the troop should return to)
      const homePos = troop.userTargetPos || troop.spawnPoint;
      const maxChaseRange = troop.moveRadius || HERO_SUMMON_RANGE;

      // Skip engagement logic if player has commanded this troop to move
      // This allows troops to disengage from combat and follow orders
      if (closestEnemy && !troop.moving) {
        // Enemy in sight - engage!
        const enemyPos = getEnemyPosCached(closestEnemy);

        // Check if chasing would take us too far from home
        const distFromHome = homePos ? distance(updated.pos, homePos) : 0;
        const wouldBeTooFar = distFromHome >= maxChaseRange;

        // Ranged units: stop at attack range and throw projectiles
        // Melee units: get close to attack
        // Ranged units go melee if enemy is too close
        const effectiveAttackRange =
          isRanged && closestDist > MELEE_RANGE ? attackRange : MELEE_RANGE;

        // Stationary units (turrets) never move - they just rotate to face enemies
        if (isStationary) {
          // Just face the enemy but don't move
          const dx = enemyPos.x - troop.pos.x;
          const dy = enemyPos.y - troop.pos.y;
          updated.rotation = Math.atan2(dy, dx);
          updated.facingRight = getFacingRightFromDelta(
            dx,
            dy,
            troop.facingRight ?? true,
          );
          updated.engaging = closestDist <= attackRange;
        } else if (closestDist > effectiveAttackRange && !wouldBeTooFar) {
          // Enemy in sight but out of attack range - move toward it
          // Move toward enemy, but stop at attack range
          const targetDist = effectiveAttackRange - 10; // Stop a bit before attack range
          const baseSpeed = 2.0; // Slightly faster when engaging
          const slowMult =
            updated.slowed && updated.slowIntensity
              ? 1 - updated.slowIntensity
              : 1;
          const moveStep = stepTowardTarget({
            current: troop.pos,
            target: enemyPos,
            speed: baseSpeed * slowMult,
            deltaTime,
            stopDistance: targetDist,
          });

          if (!moveStep.reached) {
            let chasePos = clampPositionToRadius(
              moveStep.pos, homePos, maxChaseRange,
            );
            const chasePathCheck = findClosestPathPoint(chasePos, selectedMap);
            if (chasePathCheck) {
              chasePos = constrainToNearPath(
                chasePos, chasePathCheck.point,
                chasePathCheck.distance, MAX_TROOP_PATH_DISTANCE,
              );
            }
            updated.pos = chasePos;
            updated.rotation = moveStep.rotation;
            updated.facingRight = moveStep.facingRight;
            updated.engaging = true;
          }
        } else if (closestDist <= effectiveAttackRange) {
          // Within attack range - face enemy but don't move
          const dx = enemyPos.x - troop.pos.x;
          const dy = enemyPos.y - troop.pos.y;
          updated.rotation = Math.atan2(dy, dx);
          updated.facingRight = getFacingRightFromDelta(
            dx,
            dy,
            troop.facingRight ?? true,
          );
          updated.engaging = true;
        } else {
          // Too far from home to chase - face enemy but stay put
          const dx = enemyPos.x - troop.pos.x;
          const dy = enemyPos.y - troop.pos.y;
          updated.rotation = Math.atan2(dy, dx);
          updated.facingRight = getFacingRightFromDelta(
            dx,
            dy,
            troop.facingRight ?? true,
          );
          updated.engaging = false; // Will return home
        }
      } else {
        // No enemy in sight OR player commanded movement - disengage
        updated.engaging = false;

        // Only return home if not being moved by player and not stationary
        if (homePos && !isStationary && !troop.moving) {
          const baseReturnSpeed = 1.5;
          const slowMult =
            updated.slowed && updated.slowIntensity
              ? 1 - updated.slowIntensity
              : 1;
          const returnStep = stepTowardTarget({
            current: troop.pos,
            target: homePos,
            speed: baseReturnSpeed * slowMult,
            deltaTime,
            stopDistance: 8,
          });

          if (!returnStep.reached) {
            updated.pos = returnStep.pos;
            updated.rotation = returnStep.rotation;
            updated.facingRight = returnStep.facingRight;
          }
        }
      }

      const troopSettled = !closestEnemy && !troop.moving && homePos
        && distance(updated.pos, homePos) < UNIT_SETTLE_DISTANCE;

      if (!troopSettled && !isStationary) {
        const force = friendlySeparation.get(troop.id);
        if (force) {
          updated.pos = {
            x: updated.pos.x + force.x * deltaTime * FRIENDLY_SEPARATION_MULT,
            y: updated.pos.y + force.y * deltaTime * FRIENDLY_SEPARATION_MULT,
          };
        }
      }

      if (homePos && !isStationary) {
        const leash = maxChaseRange + (troop.moving ? 12 : 0);
        updated.pos = clampPositionToRadius(updated.pos, homePos, leash);
      }

      // HP regeneration - regenerate 2% max HP per second when out of combat for 3+ seconds
      const inCombat = enemiesInSightCount > 0 || updated.engaging;
      const now = Date.now();
      // Update lastCombatTime if in combat
      if (inCombat) {
        updated.lastCombatTime = now;
        updated.healFlash = undefined;
      }

      const timeSinceCombat = now - (updated.lastCombatTime || 0);
      if (
        !updated.isHexGhost &&
        !inCombat &&
        troop.hp < troop.maxHp &&
        timeSinceCombat >= TROOP_HEAL_DELAY_MS
      ) {
        updated.hp = Math.min(
          troop.maxHp,
          troop.hp + (troop.maxHp * TROOP_HEAL_RATE * deltaTime) / 1000
        );
        // Show healing aura while regenerating (only set once to avoid constant state updates)
        if (!updated.healFlash || now - updated.healFlash > 800) {
          updated.healFlash = now;
        }
      }

      // Handle player-commanded movement (overrides engagement, but not for stationary)
      if (troop.moving && troop.targetPos && !isStationary) {
        const moveStep = stepTowardTarget({
          current: updated.pos,
          target: troop.targetPos,
          speed: DEFAULT_TROOP_MOVE_SPEED,
          deltaTime,
          stopDistance: 5,
        });
        if (moveStep.reached) {
          return {
            ...updated,
            pos: troop.targetPos,
            moving: false,
            targetPos: undefined,
            userTargetPos: troop.targetPos, // Update home position
            rotation: moveStep.rotation,
            facingRight: getFacingRightFromDelta(
              troop.targetPos.x - updated.pos.x,
              troop.targetPos.y - updated.pos.y,
              troop.facingRight ?? true,
            ),
          };
        }
        return {
          ...updated,
          pos: moveStep.pos,
          rotation: moveStep.rotation,
          facingRight: moveStep.facingRight,
        };
      }

      return updated;
    });
  });
  // Queue respawns for troops killed by DoT (burn/poison)
  if (dotDeaths.length > 0) {
    const dotDeathsByOwner = new Map<string, (typeof dotDeaths)[number][]>();
    dotDeaths.forEach((death) => {
      const ownerDeaths = dotDeathsByOwner.get(death.ownerId);
      if (ownerDeaths) {
        ownerDeaths.push(death);
      } else {
        dotDeathsByOwner.set(death.ownerId, [death]);
      }
    });
    setTowers((prevTowers) =>
      prevTowers.map((t) => {
        const deaths = dotDeathsByOwner.get(t.id);
        if (!deaths || deaths.length === 0) return t;
        const existing = t.pendingRespawns || [];
        const newRespawns = deaths.filter(
          (d) => !existing.some((e) => e.slot === d.slot)
        );
        if (newRespawns.length === 0) return t;
        return {
          ...t,
          pendingRespawns: [
            ...existing,
            ...newRespawns.map((d) => ({
              slot: d.slot,
              timer: TROOP_RESPAWN_TIME,
              respawnPos: d.respawnPos,
              troopType: d.troopType,
            })),
          ],
        };
      })
    );
  }
  // ========== HERO STATUS EFFECTS PROCESSING ==========
  // Skip expiry and DoT when paused so effects freeze in place
  if (hero && !hero.dead && !isPaused) {
    setHero((prev) => {
      if (!prev || prev.dead) return prev;
      const updated = { ...prev };

      if (updated.burnUntil && now > updated.burnUntil) {
        updated.burning = false;
        updated.burnDamage = undefined;
        updated.burnUntil = undefined;
        updated.burnFlavor = undefined;
        updated.burnSourceId = undefined;
      }
      if (updated.slowUntil && now > updated.slowUntil) {
        updated.slowed = false;
        updated.slowIntensity = undefined;
        updated.slowUntil = undefined;
        updated.slowFlavor = undefined;
        updated.slowSourceId = undefined;
      }
      if (updated.poisonUntil && now > updated.poisonUntil) {
        updated.poisoned = false;
        updated.poisonDamage = undefined;
        updated.poisonUntil = undefined;
        updated.poisonFlavor = undefined;
        updated.poisonSourceId = undefined;
      }
      if (updated.stunUntil && now > updated.stunUntil) {
        updated.stunned = false;
        updated.stunUntil = undefined;
        updated.stunFlavor = undefined;
        updated.stunSourceId = undefined;
      }

      const dotTick = deltaTime / 1000;
      if (updated.burning && updated.burnDamage) {
        updated.hp = Math.max(0, updated.hp - updated.burnDamage * dotTick);
      }
      if (updated.poisoned && updated.poisonDamage) {
        updated.hp = Math.max(0, updated.hp - updated.poisonDamage * dotTick);
      }

      return updated;
    });
  }

  // Hero HP regeneration - with combat buffer
  // Uses prev state inside setHero so hazard damage (which also sets
  // lastCombatTime via setHero) is correctly visible through React batching.
  if (hero && !hero.dead && hero.hp < hero.maxHp) {
    const now = Date.now();

    const inCombat =
      enemies.some(
        (e) =>
          distance(hero.pos, getEnemyPosCached(e)) <= HERO_COMBAT_RADIUS
      ) || enemies.some((e) => e.combatTarget === hero.id) || (hero.attackAnim > 0);

    if (inCombat) {
      setHero((prev) => prev ? { ...prev, lastCombatTime: now, healFlash: undefined } : null);
    } else {
      setHero((prev) => {
        if (!prev || prev.dead || prev.hp >= prev.maxHp) return prev;
        const timeSinceCombat = now - (prev.lastCombatTime || 0);
        if (timeSinceCombat < HERO_HEAL_DELAY_MS) return prev;
        const needsNewHealFlash = !prev.healFlash || now - prev.healFlash > 800;
        return {
          ...prev,
          hp: Math.min(
            prev.maxHp,
            prev.hp + (prev.maxHp * HERO_HEAL_RATE * deltaTime) / 1000
          ),
          healFlash: needsNewHealFlash ? now : prev.healFlash,
        };
      });
    }
  }
  // ========== PROCESS TOWER DEBUFFS FROM ENEMIES ==========
  // Collect enemy ability mutations to apply via setEnemies (avoid direct mutation)
  const towerDebuffEnemyUpdates = new Map<string, {
    lastAbilityUse: number;
    lastAbilityType: EnemyAbilityType;
    activatedTypes: EnemyAbilityType[];
  }>();

  setTowers((prevTowers) => prevTowers.map((tower) => {
    const towerWorldPos = gridToWorld(tower.pos);
    const updated = { ...tower };

    // Clear expired debuffs (skip when paused so effects freeze)
    if (!isPaused) {
      if (updated.debuffs && updated.debuffs.length > 0) {
        updated.debuffs = updated.debuffs.filter((d) => now < d.until);
      }
      if (updated.disabledUntil && now > updated.disabledUntil) {
        updated.disabled = false;
        updated.disabledUntil = undefined;
      }
    }

    // Check for enemies with tower debuff abilities nearby
    for (const enemy of enemies) {
      const eData = ENEMY_DATA[enemy.type];
      if (!eData.abilities) continue;

      const enemyPos = getEnemyPosCached(enemy);
      const distToTower = distance(enemyPos, towerWorldPos);

      for (const ability of eData.abilities) {
        if (!ability.type.startsWith('tower_')) continue;

        const abilityRange = ability.radius || 80;
        if (distToTower > abilityRange) continue;

        // Use per-type cooldowns instead of global lastAbilityUse
        const abilityCooldown = ability.cooldown || 3000;
        const cooldowns = enemy.abilityCooldowns || {};
        const priorUpdates = towerDebuffEnemyUpdates.get(enemy.id);
        const lastUse = priorUpdates?.activatedTypes.includes(ability.type)
          ? now
          : cooldowns[ability.type] || 0;
        if (now - lastUse < abilityCooldown) continue;

        const chance = ability.chance || 0.15;
        if (Math.random() > chance) continue;

        const duration = ability.duration || 2000;
        const intensity = ability.intensity || 0.25;

        const applyDebuff = (debuffType: 'slow' | 'weaken' | 'blind') => {
          updated.debuffs = addOrRefreshDebuff(
            updated.debuffs || [], debuffType, intensity, now + duration, enemy.id, now
          );
        };

        switch (ability.type) {
          case 'tower_slow':
            applyDebuff('slow');
            break;
          case 'tower_weaken':
            applyDebuff('weaken');
            break;
          case 'tower_blind':
            applyDebuff('blind');
            break;
          case 'tower_disable': {
            updated.disabled = true;
            updated.disabledUntil = now + duration;
            updated.debuffs = updated.debuffs || [];
            updated.debuffs = updated.debuffs.filter(d =>
              d.until > now && d.type !== 'disable'
            );
            const flavor = ability.name.toLowerCase().includes('freeze') ? 'freeze' as const
              : ability.name.toLowerCase().includes('gaze') || ability.name.toLowerCase().includes('stone') ? 'petrify' as const
                : ability.name.toLowerCase().includes('hold') || ability.name.toLowerCase().includes('admin') ? 'hold' as const
                  : 'stun' as const;
            updated.debuffs.push({
              type: 'disable',
              intensity: 1,
              until: now + duration,
              sourceId: enemy.id,
              disableFlavor: flavor,
              abilityName: ability.name,
            });
            break;
          }
        }

        // Collect mutation instead of mutating directly
        const existing = towerDebuffEnemyUpdates.get(enemy.id);
        if (existing) {
          existing.lastAbilityType = ability.type;
          existing.activatedTypes.push(ability.type);
        } else {
          towerDebuffEnemyUpdates.set(enemy.id, {
            lastAbilityUse: now,
            lastAbilityType: ability.type,
            activatedTypes: [ability.type],
          });
        }
      }
    }

    return updated;
  }));

  // Apply collected enemy ability mutations immutably
  if (towerDebuffEnemyUpdates.size > 0) {
    setEnemies((prev) => prev.map((enemy) => {
      const update = towerDebuffEnemyUpdates.get(enemy.id);
      if (!update) return enemy;
      return {
        ...enemy,
        lastAbilityUse: update.lastAbilityUse,
        lastAbilityType: update.lastAbilityType,
        abilityCooldowns: buildAbilityCooldowns(enemy.abilityCooldowns, update.activatedTypes, now),
      };
    }));
  }

  const queuedTowerPatches = new Map<string, Partial<Tower>>();
  const queueTowerPatch = (towerId: string, patch: Partial<Tower>) => {
    const existing = queuedTowerPatches.get(towerId);
    queuedTowerPatches.set(
      towerId,
      existing ? { ...existing, ...patch } : patch
    );
  };

  type EnemyMutation = {
    enemyId: string;
    mutate: (enemy: Enemy) => Enemy | null;
  };
  const queuedTowerEnemyMutations: EnemyMutation[] = [];
  const queueTowerEnemyMutation = (
    enemyId: string,
    mutate: (enemy: Enemy) => Enemy | null
  ) => {
    queuedTowerEnemyMutations.push({ enemyId, mutate });
  };

  const queuedTowerEffects: Effect[] = [];
  const queuedTowerProjectiles: Projectile[] = [];

  // Tower attacks - skip when paused
  if (!isPaused) {
    towers.forEach((tower) => {
      // Skip disabled towers
      if (tower.disabled && tower.disabledUntil && now < tower.disabledUntil) {
        return;
      }

      const towerData = TOWER_DATA[tower.type];
      const towerWorldPos = gridToWorld(tower.pos);

      // Calculate debuff modifiers
      let attackSpeedMod = 1.0;
      let damageMod = 1.0;
      let rangeMod = 1.0;

      if (tower.debuffs && tower.debuffs.length > 0) {
        for (const debuff of tower.debuffs) {
          if (now >= debuff.until) continue;
          switch (debuff.type) {
            case 'slow':
              attackSpeedMod *= (1 - debuff.intensity);
              break;
            case 'weaken':
              damageMod *= (1 - debuff.intensity);
              break;
            case 'blind':
              rangeMod *= (1 - debuff.intensity);
              break;
          }
        }
      }
      const attackSpeedMultiplier = Math.max(
        0.12,
        attackSpeedMod * (tower.attackSpeedBoost || 1)
      );

      // Final Buffed Stats for this tick - use calculateTowerStats for proper level-based range
      const towerStats = calculateTowerStats(
        tower.type,
        tower.level,
        tower.upgrade,
        tower.rangeBoost || 1,
        tower.damageBoost || 1
      );
      const finalRange = towerStats.range * rangeMod;
      const finalDamageMult = (tower.damageBoost || 1.0) * damageMod;

      if (tower.type === "club") {
        // ENHANCED CLUB TOWER - More useful income generator
        // Level 1: Basic Club - 8 PP every 8s
        // Level 2: Popular Club - 15 PP every 7s + bonus on kills nearby
        // Level 3: Grand Club - 25 PP every 6s
        // Level 4A: Investment Bank - 40 PP every 5s + 10% bonus on all income
        // Level 4B: Recruitment Center - 20 PP every 6s + 15% damage buff to nearby towers

        const incomeInterval =
          tower.level === 1
            ? 8000
            : tower.level === 2
              ? 7000
              : tower.level === 3
                ? 6000
                : tower.upgrade === "A"
                  ? 5000
                  : 6000;

        const baseAmount =
          tower.level === 1
            ? 8
            : tower.level === 2
              ? 15
              : tower.level === 3
                ? 25
                : tower.upgrade === "A"
                  ? 40
                  : 20;

        // Scale income interval with game speed (faster at higher speeds)
        const effectiveIncomeInterval = gameSpeed > 0 ? incomeInterval / gameSpeed : incomeInterval;
        if (now - tower.lastAttack > effectiveIncomeInterval) {
          // Base income
          let amount = baseAmount;

          // Investment Bank bonus: 10% bonus on income
          if (tower.level === 4 && tower.upgrade === "A") {
            amount = Math.floor(amount * 1.1);
          }

          addPawPoints(amount);
          // Add eating club income event for HUD animation
          setEatingClubIncomeEvents((prev) => [...prev, { id: `${tower.id}-${now}`, amount }]);
          addParticles(gridToWorld(tower.pos), "gold", 20);

          // Level 3+ Grand Club: Create gold particle fountain effect
          if (tower.level >= 3) {
            for (let i = 0; i < 5; i++) {
              const burstTimeout = setTimeout(() => {
                addParticles(gridToWorld(tower.pos), "gold", 3);
              }, i * 100);
              activeTimeoutsRef.current.push(burstTimeout);
            }
          }

          queueTowerPatch(tower.id, { lastAttack: now });
        }

        // Level 4B Recruitment Center and Level 4A Investment Bank buffs
        // are now handled in the DYNAMIC BUFF REGISTRATION section above
        // which runs every frame and properly calculates stacking buffs
      } else if (tower.type === "library") {
        let appliedSlow = false;
        let appliedDamage = false;

        // OPTIMIZED: Batch all library slow/damage effects into a single setEnemies call
        const slowAmount =
          tower.level === 1
            ? 0.2
            : tower.level === 2
              ? 0.35
              : tower.level === 3
                ? 0.45 // Arcane Library
                : 0.5; // Both Earthquake and Blizzard cap at 50%

        // Scale library damage intervals with game speed
        const libraryDamageInterval = gameSpeed > 0 ? 500 / gameSpeed : 500;
        const shouldApplyArcaneDamage = tower.level === 3 && now - tower.lastAttack > libraryDamageInterval;
        // Blizzard freeze: 25% chance every 2 seconds (scaled with game speed, uses separate timer)
        const blizzardFreezeInterval = gameSpeed > 0 ? 2000 / gameSpeed : 2000;
        const lastFreezeCheck = tower.lastFreezeCheck || 0;
        const shouldCheckBlizzardFreeze = tower.level === 4 && tower.upgrade === "B" && now - lastFreezeCheck > blizzardFreezeInterval;
        const shouldApplyBlizzardFreeze = shouldCheckBlizzardFreeze && Math.random() < 0.25;
        const shouldApplyEarthquakeDamage = tower.level === 4 && tower.upgrade === "A" && now - tower.lastAttack > libraryDamageInterval;
        const arcaneDamage = 8 * finalDamageMult;
        const earthquakeDamage = 35;

        // Collect enemy IDs affected by this tower for batched update
        const affectedEnemyIds = new Set<string>();
        const enemyDistances = new Map<string, { dist: number; pos: Position }>();

        for (const e of enemies) {
          const enemyPos = getEnemyPosCached(e);
          const dist = distance(towerWorldPos, enemyPos);
          if (dist <= finalRange) {
            affectedEnemyIds.add(e.id);
            enemyDistances.set(e.id, { dist, pos: enemyPos });
            appliedSlow = true;
          }
        }

        // Single batched update for all affected enemies
        if (affectedEnemyIds.size > 0) {
          let bountyEarned = 0;
          let bountyHadGoldAura = false;
          const particlePositions: Position[] = [];
          const sparkPositions: Position[] = [];

          setEnemies((prev) =>
            prev
              .map((enemy) => {
                if (!affectedEnemyIds.has(enemy.id)) return enemy;
                const info = enemyDistances.get(enemy.id)!;

                const newEnemy = { ...enemy };

                // Apply slow
                newEnemy.slowEffect = slowAmount;
                newEnemy.slowed = true;
                newEnemy.slowIntensity = slowAmount;
                newEnemy.slowSource = "library";

                // Blizzard freeze
                if (shouldApplyBlizzardFreeze) {
                  newEnemy.frozen = true;
                  newEnemy.stunUntil = now + 2000;
                  newEnemy.slowIntensity = 1;
                }

                // Arcane damage
                if (shouldApplyArcaneDamage) {
                  newEnemy.hp -= getEnemyDamageTaken(newEnemy, arcaneDamage);
                  newEnemy.damageFlash = 80;
                  newEnemy.lastDamageTaken = now;
                  appliedDamage = true;
                  if (newEnemy.hp <= 0) {
                    const baseBounty = ENEMY_DATA[enemy.type].bounty;
                    const goldBonus = enemy.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                    bountyEarned += baseBounty + goldBonus;
                    bountyHadGoldAura = bountyHadGoldAura || !!enemy.goldAura;
                    sparkPositions.push(info.pos);
                    const eDeathData = ENEMY_DATA[enemy.type];
                    const arcaneRegionColors = REGION_THEMES[LEVEL_DATA[selectedMap]?.theme || "grassland"]?.ground;
                    setEffects((prev) => [...prev, { id: generateId("fx"), pos: info.pos, type: "enemy_death" as const, progress: 0, size: eDeathData.size, duration: 1500, color: eDeathData.color, enemyType: enemy.type, enemySize: eDeathData.size, isFlying: eDeathData.flying, deathCause: "default" as const, regionGroundColors: arcaneRegionColors }]);
                    return null;
                  }
                }

                // Earthquake damage
                if (shouldApplyEarthquakeDamage) {
                  newEnemy.hp -= getEnemyDamageTaken(
                    newEnemy,
                    earthquakeDamage
                  );
                  newEnemy.damageFlash = 150;
                  newEnemy.lastDamageTaken = now;
                  newEnemy.slowIntensity = 0.8;
                  appliedDamage = true;
                  if (newEnemy.hp <= 0) {
                    const baseBounty = ENEMY_DATA[enemy.type].bounty;
                    const goldBonus = enemy.goldAura ? Math.floor(baseBounty * 0.5) : 0;
                    bountyEarned += baseBounty + goldBonus;
                    bountyHadGoldAura = bountyHadGoldAura || !!enemy.goldAura;
                    particlePositions.push(info.pos);
                    const eDeathData2 = ENEMY_DATA[enemy.type];
                    const quakeRegionColors = REGION_THEMES[LEVEL_DATA[selectedMap]?.theme || "grassland"]?.ground;
                    setEffects((prev) => [...prev, { id: generateId("fx"), pos: info.pos, type: "enemy_death" as const, progress: 0, size: eDeathData2.size, duration: 1500, color: eDeathData2.color, enemyType: enemy.type, enemySize: eDeathData2.size, isFlying: eDeathData2.flying, deathCause: "default" as const, regionGroundColors: quakeRegionColors }]);
                    return null;
                  }
                }

                return newEnemy;
              })
              .filter(isDefined)
          );

          // Apply bounties and particles outside of setEnemies
          if (bountyEarned > 0) {
            awardBounty(bountyEarned, bountyHadGoldAura, `library-${tower.id}`);
          }
          // Track kills for wave progress
          particlePositions.forEach((pos) => addParticles(pos, "explosion", 8));
          sparkPositions.forEach((pos) => addParticles(pos, "spark", 6));
        }
        // Continuous slow field visual effect
        if (
          enemies.some(
            (e) =>
              distance(towerWorldPos, getEnemyPosCached(e)) <=
              finalRange
          )
        ) {
          const effectType =
            tower.level === 4 && tower.upgrade === "B"
              ? "freezeField"
              : tower.level === 4 && tower.upgrade === "A"
                ? "earthquakeField"
                : tower.level === 3
                  ? "arcaneField"
                  : "slowField";
          // Update or add slow field effect (only add if doesn't exist, avoid resetting progress every frame)
          setEffects((ef) => {
            const existingField = ef.find(
              (e) => e.type === effectType && e.towerId === tower.id
            );
            if (existingField) {
              // Only reset progress if it's about to expire (> 0.8), otherwise let it continue
              if (existingField.progress > 0.8) {
                return ef.map((e) =>
                  e.id === existingField.id ? { ...e, progress: 0 } : e
                );
              }
              return ef; // No change needed
            }
            return [
              ...ef,
              {
                id: generateId("field"),
                pos: towerWorldPos,
                type: effectType,
                progress: 0,
                size: finalRange,
                towerId: tower.id,
                intensity:
                  tower.level >= 3 ? 1 : tower.level === 2 ? 0.7 : 0.5,
              },
            ];
          });
        }
        // Update tower timers
        const shouldUpdateLastAttack = (appliedSlow || appliedDamage) && now - tower.lastAttack > libraryDamageInterval;
        const shouldUpdateFreezeCheck = shouldCheckBlizzardFreeze;
        if (shouldUpdateLastAttack || shouldUpdateFreezeCheck) {
          queueTowerPatch(tower.id, {
            lastAttack: shouldUpdateLastAttack ? now : tower.lastAttack,
            lastFreezeCheck: shouldUpdateFreezeCheck
              ? now
              : tower.lastFreezeCheck,
          });
        }
      } else if (tower.type === "station") {
        // Count living troops belonging to this station
        const stationTroops = troops.filter((t) => t.ownerId === tower.id);
        const pendingRespawns = tower.pendingRespawns || [];

        // Process pending respawns - decrement timers and spawn when ready
        const troopsToSpawn: Troop[] = [];
        const remainingRespawns: typeof pendingRespawns = [];
        const stationPos = gridToWorld(tower.pos);

        // Find rally point from existing troops or use road near station
        const existingRallyTroop = stationTroops.find((t) => t.userTargetPos);
        const rallyPoint =
          existingRallyTroop?.userTargetPos || findClosestRoadPoint(stationPos, activeWaveSpawnPaths, selectedMap);

        for (const r of pendingRespawns) {
          const newTimer = r.timer - deltaTime;
          if (newTimer <= 0 && stationTroops.length + troopsToSpawn.length < MAX_STATION_TROOPS) {
            const futureCount =
              stationTroops.length + troopsToSpawn.length + 1;
            const formationOffsets = getFormationOffsets(futureCount);
            const slotOffset = formationOffsets[r.slot] || { x: 0, y: 0 };

            const targetPos = {
              x: rallyPoint.x + slotOffset.x,
              y: rallyPoint.y + slotOffset.y,
            };

            const troopHP =
              TROOP_DATA[r.troopType as keyof typeof TROOP_DATA]?.hp || DEFAULT_TROOP_HP;
            troopsToSpawn.push({
              id: generateId("troop"),
              ownerId: tower.id,
              ownerType: "station" as const, // Orange themed (Princeton station)
              pos: stationPos, // Spawn at station
              hp: troopHP,
              maxHp: troopHP,
              moving: true, // Walk to target
              targetPos: targetPos,
              lastAttack: 0,
              type: r.troopType as TroopType,
              rotation: Math.atan2(
                targetPos.y - stationPos.y,
                targetPos.x - stationPos.x,
              ),
              facingRight: getFacingRightFromDelta(
                targetPos.x - stationPos.x,
                targetPos.y - stationPos.y,
              ),
              attackAnim: 0,
              selected: false,
              spawnPoint: rallyPoint,
              moveRadius: (TOWER_DATA.station.spawnRange || STATION_TROOP_RANGE) * (tower.rangeBoost || 1),
              spawnSlot: r.slot,
              userTargetPos: targetPos,
            });
            addParticles(stationPos, "glow", 12);
            // Don't add to remaining (remove from pending)
          } else {
            // Keep in pending with updated timer
            remainingRespawns.push({ ...r, timer: newTimer });
          }
        }

        // Spawn any respawning troops
        if (troopsToSpawn.length > 0) {
          addTroopEntities(troopsToSpawn);
        }

        const totalOccupied = stationTroops.length + troopsToSpawn.length + remainingRespawns.length;
        const canSpawn = totalOccupied < MAX_STATION_TROOPS;

        const occupiedSlots = new Set([
          ...stationTroops.map((t) => t.spawnSlot ?? 0),
          ...troopsToSpawn.map((t) => t.spawnSlot ?? 0),
          ...remainingRespawns.map((r) => r.slot),
        ]);
        const availableSlot =
          [0, 1, 2].find((slot) => !occupiedSlots.has(slot)) ?? -1;

        // Train animation
        const currentProgress = tower.trainAnimProgress || 0;

        if (canSpawn && availableSlot !== -1) {
          // Train is running - animate it
          const newProgress = currentProgress + deltaTime / 3000;

          // Check if train just arrived at platform
          const arrivedAtPlatform =
            currentProgress < 0.3 && newProgress >= 0.3;

          // Scale station spawn interval with game speed
          const stationSpawnInterval = gameSpeed > 0 ? 8000 / gameSpeed : 8000;
          if (arrivedAtPlatform && now - tower.lastAttack > stationSpawnInterval && !isInResetTransition) {
            // Spawn troop at station, it will walk to formation position
            const stationPos = gridToWorld(tower.pos);

            // Find rally point from existing troops or use road near station
            const existingRallyTroop = stationTroops.find(
              (t) => t.userTargetPos
            );
            const rallyPoint =
              existingRallyTroop?.userTargetPos || findClosestRoadPoint(stationPos, activeWaveSpawnPaths, selectedMap);

            const futureCount = stationTroops.length + troopsToSpawn.length + 1;
            const formationOffsets = getFormationOffsets(futureCount);
            const slotOffset = formationOffsets[availableSlot] || {
              x: 0,
              y: 0,
            };

            const targetPos = {
              x: rallyPoint.x + slotOffset.x,
              y: rallyPoint.y + slotOffset.y,
            };

            // Determine troop type based on tower level
            // Level 1: footsoldier, Level 2: armored, Level 3: elite, Level 4A: centaur, Level 4B: cavalry
            const troopType =
              tower.level === 1
                ? "footsoldier"
                : tower.level === 2
                  ? "armored"
                  : tower.level === 3
                    ? "elite"
                    : tower.upgrade === "A"
                      ? "centaur"
                      : "cavalry";
            const troopHP = TROOP_DATA[troopType]?.hp || DEFAULT_TROOP_HP;

            const newTroop: Troop = {
              id: generateId("troop"),
              ownerId: tower.id,
              ownerType: "station" as const, // Orange themed (Princeton station)
              pos: stationPos, // Start at station
              hp: troopHP,
              maxHp: troopHP,
              moving: true, // Walk to target
              targetPos: targetPos,
              lastAttack: 0,
              type: troopType,
              rotation: Math.atan2(
                targetPos.y - stationPos.y,
                targetPos.x - stationPos.x,
              ),
              facingRight: getFacingRightFromDelta(
                targetPos.x - stationPos.x,
                targetPos.y - stationPos.y,
              ),
              attackAnim: 0,
              selected: false,
              spawnPoint: rallyPoint,
              moveRadius: (TOWER_DATA.station.spawnRange || STATION_TROOP_RANGE) * (tower.rangeBoost || 1),
              spawnSlot: availableSlot,
              userTargetPos: targetPos,
            };

            // Also update existing troops to reposition in new formation
            setTroops((prev) => {
              // Get current troops for this tower to create sequential formation indices
              const currentTowerTroops = prev.filter((t) => t.ownerId === tower.id);
              const troopIdToFormationIndex = new Map<string, number>();
              currentTowerTroops.forEach((t, idx) => {
                troopIdToFormationIndex.set(t.id, idx);
              });

              const updated = prev.map((t) => {
                if (t.ownerId === tower.id) {
                  const newFormation = getFormationOffsets(futureCount);
                  // Use sequential formation index, not spawnSlot which may have gaps
                  const formationIndex = troopIdToFormationIndex.get(t.id) ?? 0;
                  const offset = newFormation[formationIndex] || { x: 0, y: 0 };
                  const newTarget = {
                    x: rallyPoint.x + offset.x,
                    y: rallyPoint.y + offset.y,
                  };
                  // Only reposition if not engaging enemies
                  if (!t.engaging) {
                    return {
                      ...t,
                      targetPos: newTarget,
                      moving: true,
                      userTargetPos: newTarget,
                      facingRight: getFacingRightFromDelta(
                        newTarget.x - t.pos.x,
                        newTarget.y - t.pos.y,
                      ),
                    };
                  }
                }
                return t;
              });
              return [...updated, newTroop];
            });
            addParticles(stationPos, "spark", 10);

            queueTowerPatch(tower.id, {
              lastAttack: now,
              trainAnimProgress: newProgress >= 1 ? 0.01 : newProgress,
              currentTroopCount: stationTroops.length + troopsToSpawn.length + 1,
              pendingRespawns: remainingRespawns,
            });
          } else {
            queueTowerPatch(tower.id, {
              trainAnimProgress: newProgress >= 1 ? 0.01 : newProgress,
              currentTroopCount: stationTroops.length + troopsToSpawn.length,
              pendingRespawns: remainingRespawns,
            });
          }
        } else {
          queueTowerPatch(tower.id, {
            trainAnimProgress: 0.35,
            currentTroopCount: stationTroops.length + troopsToSpawn.length,
            pendingRespawns: remainingRespawns,
          });
        }
      } else if (tower.type === "cannon") {
        // Level 3: Heavy Cannon - increased damage and minor splash
        // Level 4A: Gatling gun - rapid fire
        // Level 4B: Flamethrower - continuous damage with burn
        const isGatling = tower.level === 4 && tower.upgrade === "A";
        const isFlamethrower = tower.level === 4 && tower.upgrade === "B";

        // Get all valid enemies in range for targeting
        const validEnemies = getEnemiesInRange(
          towerWorldPos,
          finalRange
        );

        // Continuously track target even when not firing
        if (validEnemies.length > 0) {
          const trackTarget = validEnemies[0];
          const trackTargetPos = getEnemyAimPosCached(trackTarget);
          const trackDx = trackTargetPos.x - towerWorldPos.x;
          const trackDy = trackTargetPos.y - towerWorldPos.y;
          // Account for isometric projection: screen direction
          const trackRotation = Math.atan2(trackDx + trackDy, trackDx - trackDy);

          // Update rotation to track enemy continuously
          queueTowerPatch(tower.id, {
            rotation: trackRotation,
            targetId: trackTarget.id,
          });
        }

        const cannonStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
        const attackCooldown = cannonStats.attackSpeed;
        const effectiveAttackCooldown =
          gameSpeed > 0
            ? attackCooldown / gameSpeed / attackSpeedMultiplier
            : attackCooldown;
        if (now - tower.lastAttack > effectiveAttackCooldown && validEnemies.length > 0) {
          const target = validEnemies[0];
          const targetPos = getEnemyPosCached(target);
          const targetAimPos = getEnemyAimPosCached(target);
          const damage = cannonStats.damage * finalDamageMult;
          queueTowerEnemyMutation(target.id, (enemy) => {
            const actualDmg = getEnemyDamageTaken(enemy, damage);
            emitDamageNumber(targetPos, actualDmg, "tower");
            const newHp = enemy.hp - actualDmg;
            if (newHp <= 0) {
              onEnemyKill(enemy, targetPos, 12, isFlamethrower ? "fire" : "default");
              return null;
            }
            const updates: Partial<Enemy> = {
              hp: newHp,
              damageFlash: DAMAGE_FLASH_SHORT_MS,
            };
            if (isFlamethrower) {
              const flameStats = TOWER_STATS.cannon.upgrades.B.stats;
              updates.burning = true;
              updates.burnDamage = flameStats.burnDamage ?? 15;
              updates.burnUntil = now + (flameStats.burnDuration ?? 3000);
            }
            return { ...enemy, ...updates };
          });
          // Update lastAttack timestamp (rotation already tracked continuously above)
          const dx = targetAimPos.x - towerWorldPos.x;
          const dy = targetAimPos.y - towerWorldPos.y;
          // Account for isometric projection
          const rotation = Math.atan2(dx + dy, dx - dy);
          queueTowerPatch(tower.id, { lastAttack: now });
          // Create cannon shot effect - renderer will position from turret
          const effectType = isFlamethrower
            ? "flame_burst"
            : isGatling
              ? "bullet_stream"
              : "cannon_shot";
          queuedTowerEffects.push({
            id: generateId("cannon"),
            pos: towerWorldPos, // Use tower base, renderer adjusts to turret
            type: effectType,
            progress: 0,
            size: distance(towerWorldPos, targetAimPos),
            targetPos: targetAimPos,
            towerId: tower.id,
            towerLevel: tower.level,
            towerUpgrade: tower.upgrade,
            rotation,
          });
          // Add particles at tower position
          if (!isFlamethrower) {
            addParticles(towerWorldPos, "smoke", 2);
          }
        }
      } else if (tower.type === "lab") {
        // All levels chain; L4A (Focused Beam) is the only non-chain path
        const isFocusedBeam = tower.level === 4 && tower.upgrade === "A";
        const labStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
        const attackCooldown = labStats.attackSpeed;
        const effectiveLabCooldown =
          gameSpeed > 0
            ? attackCooldown / gameSpeed / attackSpeedMultiplier
            : attackCooldown;

        // Focused Beam lock-on ramp: decay stacks if idle too long
        const lockOnDecayTime = labStats.lockOnDecayTime || 600;
        const currentLockOnStacks = tower.lockOnStacks || 0;
        if (isFocusedBeam && currentLockOnStacks > 0) {
          const effectiveDecay = gameSpeed > 0 ? lockOnDecayTime / gameSpeed : lockOnDecayTime;
          if (now - tower.lastAttack > effectiveDecay) {
            queueTowerPatch(tower.id, { lockOnStacks: 0, lockedTarget: undefined });
          }
        }

        if (now - tower.lastAttack > effectiveLabCooldown) {
          const validEnemies = getEnemiesInRange(
            towerWorldPos,
            finalRange
          );
          if (validEnemies.length > 0) {
            const target = validEnemies[0];
            const targetAimPos = getEnemyAimPosCached(target);

            // Focused Beam ramp: stacks build when hitting the same target
            let lockOnStacks = 0;
            if (isFocusedBeam) {
              const maxStacks = labStats.lockOnMaxStacks || 20;
              const sameTarget = tower.lockedTarget === target.id;
              lockOnStacks = sameTarget
                ? Math.min(currentLockOnStacks + 1, maxStacks)
                : 0;
            }
            const lockOnDamageMult = isFocusedBeam
              ? 1 + lockOnStacks * (labStats.lockOnDamageMult || 0.15)
              : 1;

            const baseDamage = labStats.damage * finalDamageMult;
            const damage = baseDamage * lockOnDamageMult;
            const numChainTargets = labStats.chainTargets || 1;
            const chainRange = labStats.chainRange || 150;
            const shouldChain = !isFocusedBeam && numChainTargets > 1;
            const chainTargets = shouldChain
              ? getChainTargets(
                target,
                numChainTargets,
                chainRange,
                enemies,
                getEnemyPosCached
              )
              : [target];
            const chainDamage = shouldChain ? damage * 0.7 : damage;
            chainTargets.forEach((chainTarget) => {
              queueTowerEnemyMutation(chainTarget.id, (enemy) => {
                const actualDmg = getEnemyDamageTaken(enemy, chainDamage);
                emitDamageNumber(getEnemyPosCached(enemy), actualDmg, "tower");
                const newHp = enemy.hp - actualDmg;
                if (newHp <= 0) {
                  onEnemyKill(enemy, getEnemyPosCached(enemy), 8, "lightning");
                  return null;
                }
                return { ...enemy, hp: newHp, damageFlash: DAMAGE_FLASH_MS };
              });
            });
            const dx = targetAimPos.x - towerWorldPos.x;
            const dy = targetAimPos.y - towerWorldPos.y;
            const rotation = Math.atan2(dy, dx);
            const towerPatch: Partial<Tower> = {
              lastAttack: now,
              rotation,
              target: target.id,
            };
            if (isFocusedBeam) {
              towerPatch.lockedTarget = target.id;
              towerPatch.lockOnStacks = lockOnStacks;
            }
            queueTowerPatch(tower.id, towerPatch);
            const isLevel4 = tower.level === 4;
            const lightningVisualPressure =
              entityCountsRef.current.effects +
              entityCountsRef.current.projectiles * 0.7 +
              entityCountsRef.current.enemies * 0.35;
            const maxVisualChainLinks = isLevel4
              ? numChainTargets
              : lightningVisualPressure > 240
                ? 1
                : lightningVisualPressure > 180
                  ? 2
                  : lightningVisualPressure > 120
                    ? 3
                    : numChainTargets;
            const visualChainTargets = chainTargets.slice(
              0,
              maxVisualChainLinks
            );
            const desiredRealMs = isFocusedBeam ? 250 : 420;
            const gsCompensation = Math.max(1, gameSpeed);
            const lightningFxDuration = desiredRealMs * gsCompensation;
            const lightningIntensityScale = isLevel4
              ? 1
              : lightningVisualPressure > 240
                ? 0.7
                : lightningVisualPressure > 180
                  ? 0.82
                  : 1;
            if (shouldChain) {
              visualChainTargets.forEach((chainTarget, i) => {
                const chainPos = getEnemyAimPosCached(chainTarget);
                const fromPos =
                  i === 0
                    ? towerWorldPos
                    : getEnemyAimPosCached(visualChainTargets[i - 1]);
                queuedTowerEffects.push({
                  id: generateId("chain"),
                  pos: fromPos,
                  type: "chain",
                  progress: 0,
                  size: distance(fromPos, chainPos),
                  targetPos: chainPos,
                  intensity: Math.max(0.1, (1 - i * 0.15)) * lightningIntensityScale,
                  duration: lightningFxDuration,
                  towerId: i === 0 ? tower.id : undefined,
                  towerLevel: tower.level,
                  towerUpgrade: tower.upgrade,
                  color: tower.level === 4 && tower.upgrade === "B" ? "violet" : undefined,
                });
              });
            } else {
              const lockOnRatio = isFocusedBeam
                ? lockOnStacks / (labStats.lockOnMaxStacks || 20)
                : 0;
              queuedTowerEffects.push({
                id: generateId("zap"),
                pos: towerWorldPos,
                type: isFocusedBeam ? "beam" : "lightning",
                progress: 0,
                size: distance(towerWorldPos, targetAimPos),
                targetPos: targetAimPos,
                intensity:
                  (isFocusedBeam ? 0.5 + lockOnRatio * 0.5 : 1) * lightningIntensityScale,
                duration: lightningFxDuration,
                towerId: tower.id,
                towerLevel: tower.level,
                towerUpgrade: tower.upgrade,
                color: isFocusedBeam ? "yellow" : undefined,
              });
            }
            const sparkCount = isLevel4
              ? 3
              : lightningVisualPressure > 240
                ? 0
                : lightningVisualPressure > 180
                  ? 1
                  : lightningVisualPressure > 120
                    ? 2
                    : 3;
            if (sparkCount > 0) {
              addParticles(towerWorldPos, "spark", sparkCount);
            }
          }
        }
      } else if (tower.type === "arch") {
        // Arch tower - sonic attacks
        // Crescendo mechanic: builds stacks on consecutive attacks
        const isShockwave = tower.level === 4 && tower.upgrade === "A";
        const archStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
        const maxStacks = archStats.crescendoMaxStacks || 4;
        const speedMult = archStats.crescendoSpeedMult || 0.92;
        const damageMult = archStats.crescendoDamageMult || 0.05;
        const decayTime = archStats.crescendoDecayTime || 2500;
        const currentStacks = tower.crescendoStacks || 0;

        // Decay: gradually lose stacks one at a time when idle
        const effectiveDecay = gameSpeed > 0 ? decayTime / gameSpeed : decayTime;
        if (currentStacks > 0 && now - tower.lastAttack > effectiveDecay) {
          const decayInterval = effectiveDecay / maxStacks;
          const decayStartTime = tower.lastAttack + effectiveDecay;
          const lastDecay =
            tower.lastCrescendoDecay && tower.lastCrescendoDecay >= decayStartTime
              ? tower.lastCrescendoDecay
              : decayStartTime - decayInterval;
          if (now - lastDecay >= decayInterval) {
            queueTowerPatch(tower.id, {
              crescendoStacks: currentStacks - 1,
              lastCrescendoDecay: now,
            });
          }
        }

        // Crescendo-adjusted cooldown: base * speedMult^stacks
        const crescendoCooldown = archStats.attackSpeed * Math.pow(speedMult, currentStacks);
        const effectiveArcherSpeed =
          gameSpeed > 0
            ? crescendoCooldown / gameSpeed / attackSpeedMultiplier
            : crescendoCooldown;
        if (now - tower.lastAttack > effectiveArcherSpeed) {
          const validEnemies = getEnemiesInRange(
            towerWorldPos,
            finalRange
          );
          if (validEnemies.length > 0) {
            const target = validEnemies[0];
            const targetAimPos = getEnemyAimPosCached(target);
            // Crescendo-adjusted damage: base * (1 + damageMult * stacks)
            const damage = archStats.damage * (1 + damageMult * currentStacks) * finalDamageMult;
            queueTowerEnemyMutation(target.id, (enemy) => {
              const targetEnemyPos = getEnemyPosCached(enemy);
              const actualDmg = getEnemyDamageTaken(enemy, damage);
              emitDamageNumber(targetEnemyPos, actualDmg, "tower");
              const newHp = enemy.hp - actualDmg;
              if (newHp <= 0) {
                onEnemyKill(enemy, targetEnemyPos, 10, "sonic");
                return null;
              }
              const updates: Partial<Enemy> = {
                hp: newHp,
                damageFlash: DAMAGE_FLASH_MS,
              };
              if (isShockwave && Math.random() < (archStats.stunChance ?? 0)) {
                updates.stunUntil = now + (archStats.stunDuration ?? 1000);
              }
              return { ...enemy, ...updates };
            });
            const nextStacks = Math.min(currentStacks + 1, maxStacks);
            const dx = targetAimPos.x - towerWorldPos.x;
            const dy = targetAimPos.y - towerWorldPos.y;
            const rotation = Math.atan2(dy, dx);
            queueTowerPatch(tower.id, {
              lastAttack: now,
              rotation,
              target: target.id,
              crescendoStacks: nextStacks,
            });
            const crescendoRatio = nextStacks / maxStacks;
            queuedTowerEffects.push({
              id: generateId("sonic"),
              pos: towerWorldPos,
              type: "sonic",
              progress: 0,
              size: finalRange,
              intensity: 0.5 + crescendoRatio * 0.5,
            });
            const targetPos = getEnemyAimPosCached(target);
            const noteCount = 3 + Math.floor(crescendoRatio * 4);
            for (let n = 0; n < noteCount; n++) {
              queuedTowerEffects.push({
                id: generateId("note"),
                pos: towerWorldPos,
                type: "music_notes",
                progress: 0,
                size: distance(towerWorldPos, targetPos),
                targetPos,
                intensity: 0.5 + crescendoRatio * 0.5,
                towerId: tower.id,
                towerLevel: tower.level,
                towerUpgrade: tower.upgrade,
                noteIndex: n,
              });
            }
          }
        }
      } else if (tower.type === "mortar") {
        const isMissileBattery = tower.level === 4 && tower.upgrade === "A";
        const isEmberFoundry = tower.level === 4 && tower.upgrade === "B";

        const mortarStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
        const attackCooldown = mortarStats.attackSpeed;
        const effectiveAttackCooldown =
          gameSpeed > 0
            ? attackCooldown / gameSpeed / attackSpeedMultiplier
            : attackCooldown;

        const splashRadius = mortarStats.splashRadius || mortarStats.range * 0.33;
        const damage = mortarStats.damage * finalDamageMult;

        // Missile Battery: defaults to auto-aim; manual uses stored position
        if (isMissileBattery && missileMortarTargetingIdRef.current === tower.id) {
          const cursorScreen = mousePosRef.current;
          if (cursorScreen.x > 0 && cursorScreen.y > 0) {
            const { width: cW, height: cH, dpr: cDpr } = getCanvasDimensions();
            const cursorWorld = screenToWorld(cursorScreen, cW, cH, cDpr, cameraOffset, cameraZoom);
            const cDx = cursorWorld.x - towerWorldPos.x;
            const cDy = cursorWorld.y - towerWorldPos.y;
            queueTowerPatch(tower.id, { rotation: Math.atan2(cDx + cDy, cDx - cDy) });
          }
        } else if (isMissileBattery && tower.mortarAutoAim === false && tower.mortarTarget) {
          const missileTarget = tower.mortarTarget;
          const tDx = missileTarget.x - towerWorldPos.x;
          const tDy = missileTarget.y - towerWorldPos.y;
          const trackRotation = Math.atan2(tDx + tDy, tDx - tDy);
          queueTowerPatch(tower.id, { rotation: trackRotation });

          if (now - tower.lastAttack > effectiveAttackCooldown) {
            const missileCount = 6;
            const barrelOrigin = getMortarBarrelOrigin(towerWorldPos, missileTarget, tower.level, tower.upgrade);
            const impactRadius = splashRadius * 0.6;
            const podStaggerMs = 150;
            for (let i = 0; i < missileCount; i++) {
              const circleAngle = (i / missileCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
              const radiusJitter = impactRadius * (0.4 + Math.random() * 0.6);
              const targetPos = {
                x: missileTarget.x + Math.cos(circleAngle) * radiusJitter,
                y: missileTarget.y + Math.sin(circleAngle) * radiusJitter,
              };
              const dx = targetPos.x - towerWorldPos.x;
              const dy = targetPos.y - towerWorldPos.y;
              const rotation = Math.atan2(dy, dx);
              queuedTowerProjectiles.push({
                id: generateId("msl"),
                from: barrelOrigin.from,
                to: targetPos,
                progress: 0,
                type: "missile",
                rotation,
                arcHeight: 130 + i * 15,
                elevation: barrelOrigin.elevation,
                damage: damage * 0.35,
                targetType: "enemy",
                isAoE: true,
                aoeRadius: splashRadius * 0.75,
                speed: 0.16 + i * 0.02,
                color: "#ff2200",
                trailColor: "#ffaa00",
                spawnDelay: i * podStaggerMs,
              });
            }
            queueTowerPatch(tower.id, { lastAttack: now });
            addParticles(barrelOrigin.from, "smoke", 6);
          }
        } else if (isMissileBattery) {
          const autoEnemies = getEnemiesInRange(towerWorldPos, finalRange);
          if (autoEnemies.length > 0) {
            const autoTarget = autoEnemies[0];
            const autoPos = getEnemyAimPosCached(autoTarget);
            missileAutoAimRef.current.set(tower.id, { x: autoPos.x, y: autoPos.y });
            const aDx = autoPos.x - towerWorldPos.x;
            const aDy = autoPos.y - towerWorldPos.y;
            const aRot = Math.atan2(aDx + aDy, aDx - aDy);
            queueTowerPatch(tower.id, { rotation: aRot, targetId: autoTarget.id });

            if (now - tower.lastAttack > effectiveAttackCooldown) {
              const missileCount = 6;
              const barrelOrigin = getMortarBarrelOrigin(towerWorldPos, autoPos, tower.level, tower.upgrade);
              const impactRadius = splashRadius * 0.6;
              const podStaggerMs = 150;
              for (let i = 0; i < missileCount; i++) {
                const circleAngle = (i / missileCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
                const radiusJitter = impactRadius * (0.4 + Math.random() * 0.6);
                const targetPos = {
                  x: autoPos.x + Math.cos(circleAngle) * radiusJitter,
                  y: autoPos.y + Math.sin(circleAngle) * radiusJitter,
                };
                const dx = targetPos.x - towerWorldPos.x;
                const dy = targetPos.y - towerWorldPos.y;
                const rotation = Math.atan2(dy, dx);
                queuedTowerProjectiles.push({
                  id: generateId("msl"),
                  from: barrelOrigin.from,
                  to: targetPos,
                  progress: 0,
                  type: "missile",
                  rotation,
                  arcHeight: 130 + i * 15,
                  elevation: barrelOrigin.elevation,
                  damage: damage * 0.35,
                  targetType: "enemy",
                  isAoE: true,
                  aoeRadius: splashRadius * 0.75,
                  speed: 0.16 + i * 0.02,
                  color: "#ff2200",
                  trailColor: "#ffaa00",
                  spawnDelay: i * podStaggerMs,
                });
              }
              queueTowerPatch(tower.id, { lastAttack: now });
              addParticles(barrelOrigin.from, "smoke", 6);
            }
          } else {
            missileAutoAimRef.current.delete(tower.id);
          }
        } else {
          // Non-missile mortar types need enemies in range (cannot hit flying)
          const validEnemies = getEnemiesInRange(
            towerWorldPos,
            finalRange,
            undefined,
            (e) => !ENEMY_DATA[e.type as EnemyType]?.flying
          );

          // Track target for barrel rotation
          if (validEnemies.length > 0) {
            const trackTarget = validEnemies[0];
            const trackTargetPos = getEnemyAimPosCached(trackTarget);
            const trackDx = trackTargetPos.x - towerWorldPos.x;
            const trackDy = trackTargetPos.y - towerWorldPos.y;
            const trackRotation = Math.atan2(trackDx + trackDy, trackDx - trackDy);
            queueTowerPatch(tower.id, {
              rotation: trackRotation,
              targetId: trackTarget.id,
            });
          }

          if (now - tower.lastAttack > effectiveAttackCooldown && validEnemies.length > 0) {
            if (isEmberFoundry) {
              const emberTarget = validEnemies[0];
              const emberAimPos = getEnemyAimPosCached(emberTarget);
              const emberBarrel = getMortarBarrelOrigin(towerWorldPos, emberAimPos, tower.level, tower.upgrade);
              const spread = 35;
              for (let i = 0; i < 3; i++) {
                const offsetX = (Math.random() - 0.5) * spread * 2;
                const offsetY = (Math.random() - 0.5) * spread * 2;
                const targetPos = { x: emberAimPos.x + offsetX, y: emberAimPos.y + offsetY };
                const dx = targetPos.x - towerWorldPos.x;
                const dy = targetPos.y - towerWorldPos.y;
                const rotation = Math.atan2(dy, dx);
                queuedTowerProjectiles.push({
                  id: generateId("emb"),
                  from: emberBarrel.from,
                  to: targetPos,
                  progress: 0,
                  type: "ember",
                  rotation,
                  arcHeight: 100 + i * 15,
                  elevation: emberBarrel.elevation,
                  damage: damage * 0.55,
                  targetType: "enemy",
                  isAoE: true,
                  aoeRadius: splashRadius * 0.8,
                  speed: 0.22 + i * 0.03,
                  color: "#ff4400",
                  trailColor: "#ff8800",
                });
              }
              queueTowerPatch(tower.id, { lastAttack: now });
              addParticles(emberBarrel.from, "fire", 5);
            } else {
              // Base mortar: single high-arc explosive shell
              const target = validEnemies[0];
              const targetAimPos = getEnemyAimPosCached(target);
              const shellBarrel = getMortarBarrelOrigin(towerWorldPos, targetAimPos, tower.level, tower.upgrade);
              const dx = targetAimPos.x - towerWorldPos.x;
              const dy = targetAimPos.y - towerWorldPos.y;
              const rotation = Math.atan2(dx + dy, dx - dy);
              queuedTowerProjectiles.push({
                id: generateId("mrt"),
                from: shellBarrel.from,
                to: targetAimPos,
                progress: 0,
                type: "mortarShell",
                rotation,
                arcHeight: 120,
                elevation: shellBarrel.elevation,
                damage,
                targetType: "enemy",
                isAoE: true,
                aoeRadius: splashRadius,
                speed: 0.3,
              });
              queueTowerPatch(tower.id, { lastAttack: now });
              queuedTowerEffects.push({
                id: generateId("mrt"),
                pos: shellBarrel.from,
                type: "mortar_launch",
                progress: 0,
                size: 40,
                towerId: tower.id,
                towerLevel: tower.level,
                rotation,
              });
              addParticles(shellBarrel.from, "smoke", 4);
            }
          }
        }
      } else if (
        towerData.attackSpeed > 0 &&
        now - tower.lastAttack >
        (gameSpeed > 0
          ? towerData.attackSpeed / gameSpeed / attackSpeedMultiplier
          : towerData.attackSpeed)
      ) {
        // Generic tower attack (fallback)
        const validEnemies = getEnemiesInRange(
          towerWorldPos,
          finalRange
        );
        if (validEnemies.length > 0) {
          const target = validEnemies[0];
          const targetPos = getEnemyPosCached(target);
          const targetAimPos = getEnemyAimPosCached(target);
          const genericStats = calculateTowerStats(tower.type, tower.level, tower.upgrade);
          const damage = genericStats.damage * finalDamageMult;
          queueTowerEnemyMutation(target.id, (enemy) => {
            const newHp = enemy.hp - getEnemyDamageTaken(enemy, damage);
            if (newHp <= 0) {
              onEnemyKill(enemy, targetPos, 12);
              return null;
            }
            return { ...enemy, hp: newHp, damageFlash: DAMAGE_FLASH_MS };
          });
          const dx = targetAimPos.x - towerWorldPos.x;
          const dy = targetAimPos.y - towerWorldPos.y;
          const rotation = Math.atan2(dy, dx);
          queueTowerPatch(tower.id, {
            lastAttack: now,
            rotation,
            target: target.id,
          });
          queuedTowerProjectiles.push({
            id: generateId("proj"),
            from: towerWorldPos,
            to: targetAimPos,
            progress: 0,
            type: tower.type,
            rotation,
          });
          addParticles(towerWorldPos, "smoke", 3);
        }
      }
    });
  } // End of !isPaused check for tower attacks

  if (queuedTowerEnemyMutations.length > 0) {
    setEnemies((prev) => {
      const enemyById = new Map(prev.map((enemy) => [enemy.id, enemy]));
      for (const mutation of queuedTowerEnemyMutations) {
        const current = enemyById.get(mutation.enemyId);
        if (!current) continue;
        const updated = mutation.mutate(current);
        if (updated) {
          enemyById.set(mutation.enemyId,
            updated.hp < current.hp ? { ...updated, lastDamageTaken: now } : updated
          );
        } else {
          enemyById.delete(mutation.enemyId);
        }
      }
      const nextEnemies: Enemy[] = [];
      for (const enemy of prev) {
        const updated = enemyById.get(enemy.id);
        if (updated) nextEnemies.push(updated);
      }
      return nextEnemies;
    });
  }
  if (queuedTowerPatches.size > 0) {
    setTowers((prev) =>
      prev.map((tower) => {
        const patch = queuedTowerPatches.get(tower.id);
        return patch ? { ...tower, ...patch } : tower;
      })
    );
  }
  if (queuedTowerEffects.length > 0) {
    addEffectEntities(queuedTowerEffects);
  }
  if (queuedTowerProjectiles.length > 0) {
    addProjectileEntities(queuedTowerProjectiles);
  }

  // Hero attacks - skip when paused or stunned
  if (!isPaused && hero && !hero.dead && !hero.stunned && hero.attackAnim === 0) {
    const heroData = HERO_DATA[hero.type];
    const isNassauBlueInferno = hero.type === "nassau" && hero.abilityActive;
    const isIvyColossus = hero.type === "ivy" && hero.abilityActive;
    const heroAttackSpeed = isNassauBlueInferno
      ? HERO_COMBAT_STATS.nassauBlueFireballSpeed
      : isIvyColossus
        ? HERO_COMBAT_STATS.ivyColossusAttackSpeed
        : heroData.attackSpeed;
    const heroRange = isIvyColossus ? HERO_COMBAT_STATS.ivyColossusAoeRadius : heroData.range;
    // Scale hero attack speed with game speed
    const effectiveHeroAttackSpeed = gameSpeed > 0 ? heroAttackSpeed / gameSpeed : heroAttackSpeed;
    if (now - hero.lastAttack > effectiveHeroAttackSpeed) {
      const validEnemies = getEnemiesInRange(
        hero.pos,
        heroRange
      );
      if (validEnemies.length > 0) {
        const target = validEnemies[0];
        const targetPos = getEnemyPosCached(target);
        const targetAimPos = getEnemyAimPosCached(target);
        const dx = targetAimPos.x - hero.pos.x;
        const dy = targetAimPos.y - hero.pos.y;
        const rotation = Math.atan2(dy, dx);

        // Determine attack type based on hero
        const isAoEHero = hero.type === "mathey" || hero.type === "scott" || hero.type === "ivy";
        const isMultiTargetHero = hero.type === "tenor";
        const isProjectileAoEHero = hero.type === "nassau";
        const aoeDamageRadius = hero.type === "mathey" ? HERO_COMBAT_STATS.matheyAoeRadius : hero.type === "scott" ? HERO_COMBAT_STATS.scottAoeRadius : hero.type === "ivy" ? HERO_COMBAT_STATS.ivyAoeRadius : 0;
        const maxTargets = hero.type === "tenor" ? 3 : 1;

        // Get targets for multi-target heroes (Tenor hits up to 3)
        const attackTargets = isMultiTargetHero
          ? validEnemies.slice(0, maxTargets)
          : [target];

        // Nassau fireball: damage is delayed to projectile impact (skip instant damage)
        if (!isProjectileAoEHero) {
        // Apply damage to all targets
        setEnemies((prev) => {
          let updatedEnemies: Array<Enemy | null> = [...prev];
          const killedEnemyIds: string[] = [];

          // Primary target damage
          for (const attackTarget of attackTargets) {
            const attackTargetPos = getEnemyPosCached(attackTarget);

            updatedEnemies = updatedEnemies.map((e) => {
              if (!e) return e;
              if (e.id === attackTarget.id) {
                const actualDmg = getEnemyDamageTaken(e, heroData.damage);
                emitDamageNumber(attackTargetPos, actualDmg, "hero");
                const newHp = e.hp - actualDmg;
                if (newHp <= 0) {
                  killedEnemyIds.push(e.id);
                  onEnemyKill(e, attackTargetPos, 10);
                  if (hero.type === "scott") addPawPoints(1);
                  return null;
                }
                return { ...e, hp: newHp, damageFlash: 200, lastDamageTaken: now };
              }
              return e;
            });
          }

          // AoE damage for Mathey Knight and F. Scott
          if (isAoEHero && aoeDamageRadius > 0) {
            const aoeDamage = Math.floor(heroData.damage * HERO_COMBAT_STATS.heroAoeDamageMult);
            updatedEnemies = updatedEnemies.map((e) => {
              if (!e || killedEnemyIds.includes(e.id)) return e;
              if (attackTargets.some(t => t.id === e.id)) return e; // Already hit as primary

              const enemyPos = getEnemyPosCached(e);
              const distToTarget = distance(targetPos, enemyPos);

              if (distToTarget <= aoeDamageRadius) {
                const newHp = e.hp - getEnemyDamageTaken(e, aoeDamage);
                if (newHp <= 0) {
                  onEnemyKill(e, enemyPos);
                  return null;
                }
                return { ...e, hp: newHp, damageFlash: 150, lastDamageTaken: now };
              }
              return e;
            });
          }

          return updatedEnemies.filter(isDefined);
        });
        } // end !isProjectileAoEHero

        // Create hero-specific attack effects
        const heroEffectType: EffectType = (() => {
          switch (hero.type) {
            case "tiger": return "tiger_slash";
            case "mathey": return "knight_cleave";
            case "scott": return "scott_quill";
            case "tenor": return "sonic_blast";
            case "rocky": return "rock_impact";
            case "nassau": return "phoenix_inferno";
            case "ivy": return "vine_lash";
            default: return "impact_hit";
          }
        })();

        // Add attack visual effect (skip for nassau — explosion comes from projectile impact)
        if (!isProjectileAoEHero) {
          setEffects((ef) => [
            ...ef,
            {
              id: generateId("eff"),
              pos: isAoEHero ? targetPos : { x: (hero.pos.x + targetPos.x) / 2, y: (hero.pos.y + targetPos.y) / 2 },
              type: heroEffectType,
              progress: 0,
              size: isAoEHero ? aoeDamageRadius : 50,
              slashAngle: rotation,
              sourceId: hero.id,
              attackerType: "hero",
            },
          ]);
        }

        // For multi-target Tenor, add effects to each target
        if (isMultiTargetHero && attackTargets.length > 1) {
          attackTargets.slice(1).forEach((extraTarget) => {
            const extraAimPos = getEnemyAimPosCached(extraTarget);
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("eff"),
                pos: extraAimPos,
                type: "impact_hit",
                progress: 0,
                size: 30,
                color: "139, 92, 246",
              },
            ]);
            // Add projectile to extra targets
            setProjectiles((prev) => [
              ...prev,
              {
                id: generateId("proj"),
                from: hero.pos,
                to: extraAimPos,
                progress: 0,
                type: "sonicWave",
                rotation: Math.atan2(
                  extraAimPos.y - hero.pos.y,
                  extraAimPos.x - hero.pos.x
                ),
              },
            ]);
          });
        }

        setHero((prev) =>
          prev
            ? { ...prev, lastAttack: now, lastCombatTime: now, rotation, attackAnim: 300 }
            : null
        );

        // Nassau fireballs (normal orange or blue inferno rapid-fire)
        if (isProjectileAoEHero) {
          const blueActive = isNassauBlueInferno;
          setProjectiles((prev) => [
            ...prev,
            {
              id: generateId("proj"),
              from: hero.pos,
              to: targetAimPos,
              progress: 0,
              type: blueActive ? "phoenixFlameBlue" : "phoenixFlame",
              rotation,
              arcHeight: blueActive ? 25 : 55,
              speed: blueActive ? 1.2 : 0.4,
              isAoE: true,
              aoeRadius: blueActive
                ? HERO_COMBAT_STATS.nassauBlueFireballAoeRadius
                : HERO_COMBAT_STATS.nassauFireballAoeRadius,
              damage: blueActive
                ? HERO_COMBAT_STATS.nassauBlueFireballDamage
                : heroData.damage,
              targetType: "enemy",
              color: blueActive ? "#3b82f6" : "#e67e22",
              trailColor: blueActive ? "#60a5fa" : "#ff6600",
              scale: blueActive ? 1.0 : 1.4,
            },
          ]);
        }

        // Ivy: vine barbs normally, massive melee AoE stomp when Colossus active
        if (hero.type === "ivy") {
          if (isIvyColossus) {
            const colossusDmg = HERO_COMBAT_STATS.ivyColossusDamage;
            const colossusRadius = HERO_COMBAT_STATS.ivyColossusAoeRadius;
            setEnemies((prev) => {
              const updated: Array<Enemy | null> = prev.map((e) => {
                if (!e || e.dead) return e;
                const ePos = getEnemyPosCached(e);
                if (distance(hero.pos, ePos) > colossusRadius) return e;
                const actualDmg = getEnemyDamageTaken(e, colossusDmg);
                emitDamageNumber(ePos, actualDmg, "hero");
                const newHp = e.hp - actualDmg;
                if (newHp <= 0) {
                  onEnemyKill(e, ePos, 12);
                  return null;
                }
                return { ...e, hp: newHp, damageFlash: 250, stunUntil: Math.max(e.stunUntil, now + 400), lastDamageTaken: now };
              });
              return updated.filter(isDefined);
            });
            setEffects((ef) => [
              ...ef,
              {
                id: generateId("colossus-smash"),
                pos: hero.pos,
                type: "ground_crack",
                progress: 0,
                size: colossusRadius,
                color: "#059669",
                sourceId: hero.id,
                attackerType: "hero",
              },
            ]);
            addParticles(hero.pos, "glow", 8);
          } else {
            setProjectiles((prev) => [
              ...prev,
              {
                id: generateId("proj"),
                from: hero.pos,
                to: targetAimPos,
                progress: 0,
                type: "vineBarb",
                rotation,
                speed: 2.5,
                color: "#059669",
                trailColor: "#34d399",
              },
            ]);
          }
        }

        // Create projectile for other ranged heroes
        if (!isProjectileAoEHero && hero.type !== "ivy" && (heroData.isRanged || heroData.range > 80)) {
          const projType = (() => {
            switch (hero.type) {
              case "tenor": return "sonicWave";
              case "rocky": return "rock";
              case "scott": return "magicBolt";
              default: return "hero";
            }
          })();

          const projColor = (() => {
            switch (hero.type) {
              case "scott": return "#c9a227";
              case "tenor": return "#a855f7";
              default: return undefined;
            }
          })();

          setProjectiles((prev) => [
            ...prev,
            {
              id: generateId("proj"),
              from: hero.pos,
              to: targetAimPos,
              progress: 0,
              type: projType,
              rotation,
              arcHeight: hero.type === "rocky" ? 60 : 0,
              color: projColor,
            },
          ]);
        }
      }
    }
  }
  if (hero && hero.attackAnim > 0) {
    setHero((prev) =>
      prev
        ? { ...prev, attackAnim: Math.max(0, prev.attackAnim - deltaTime) }
        : null
    );
  }
  const queuedTroopEnemyMutations: EnemyMutation[] = [];
  const queueTroopEnemyMutation = (
    enemyId: string,
    mutate: (enemy: Enemy) => Enemy | null
  ) => {
    queuedTroopEnemyMutations.push({ enemyId, mutate });
  };
  const queuedTroopEffects: Effect[] = [];
  const queuedTroopProjectiles: Projectile[] = [];
  const queuedTroopPatches = new Map<string, Partial<Troop>>();

  // Troop attacks - with ranged support for centaurs and turrets - skip when paused
  if (!isPaused) {
    troops.forEach((troop) => {
      if (!troop.type) return;
      if (troop.stunned && troop.stunUntil && now < troop.stunUntil) return;
      const troopData = TROOP_DATA[troop.type];
      if (!troopData) return;
      const isRanged = troop.overrideIsRanged ?? troopData.isRanged ?? false;
      const attackRange = isRanged
        ? troop.overrideRange ?? troopData.range ?? DEFAULT_TROOP_RANGED_RANGE
        : DEFAULT_TROOP_MELEE_RANGE;
      const attackCooldown =
        troop.overrideAttackSpeed ?? troopData.attackSpeed ?? DEFAULT_TROOP_ATTACK_SPEED;
      // Scale troop attack cooldown with game speed
      const effectiveTroopCooldown = gameSpeed > 0 ? attackCooldown / gameSpeed : attackCooldown;
      const lastAttack = troop.lastAttack ?? 0; // Default to 0 if undefined
      if (
        (troop.attackAnim ?? 0) === 0 &&
        now - lastAttack > effectiveTroopCooldown
      ) {
        const canHitFlying =
          troop.overrideCanTargetFlying ?? troopData.canTargetFlying ?? false;
        const validEnemies = getEnemiesInRange(
          troop.pos,
          attackRange,
          Number.POSITIVE_INFINITY,
          (enemy) => !ENEMY_DATA[enemy.type].flying || canHitFlying
        );
        if (validEnemies.length > 0) {
          const target = validEnemies[0];
          const targetPos = getEnemyPosCached(target);
          const targetAimPos = getEnemyAimPosCached(target);
          const troopDamage = troop.overrideDamage ?? troopData.damage ?? DEFAULT_TROOP_DAMAGE;
          const dx = targetAimPos.x - troop.pos.x;
          const dy = targetAimPos.y - troop.pos.y;
          const rotation = Math.atan2(dy, dx);
          const targetDistance = distance(troop.pos, targetPos);
          const useRangedAttack =
            isRanged &&
            (!(troop.overrideHybridMelee ?? false) ||
              targetDistance > MELEE_RANGE * 1.05);
          const isReinforcementLancer =
            troop.type === "reinforcement" &&
            troop.ownerType === "spell" &&
            (troop.visualTier ?? 0) >= 5;
          // Apply damage immediately (projectile is just visual)
          queueTroopEnemyMutation(target.id, (enemy) => {
            const actualDmg = getEnemyDamageTaken(enemy, troopDamage);
            emitDamageNumber(targetPos, actualDmg, "troop");
            const newHp = enemy.hp - actualDmg;
            if (newHp <= 0) {
              onEnemyKill(enemy, targetPos);
              return null;
            }
            return { ...enemy, hp: newHp, damageFlash: 200 };
          });

          // Add melee attack visual effect for non-ranged troops
          if (!useRangedAttack) {
            const troopEffectType: EffectType =
              isReinforcementLancer
                ? "impact_hit"
                : troop.type === "knight" ||
                  troop.type === "reinforcement" ||
                  troop.type === "cavalry"
                  ? "melee_slash"
                  : troop.type === "armored" || troop.type === "elite"
                    ? "melee_swipe"
                    : "impact_hit";
            queuedTroopEffects.push({
              id: generateId("eff"),
              pos: { x: (troop.pos.x + targetPos.x) / 2, y: (troop.pos.y + targetPos.y) / 2 },
              type: troopEffectType,
              progress: 0,
              size: 35,
              slashAngle: rotation,
              attackerType: "troop",
            });
          }
          if (useRangedAttack) {
            const projType =
              troop.type === "turret"
                ? "bullet"
                : troop.type === "knight" || troop.type === "reinforcement"
                  ? isReinforcementLancer
                    ? "spear"
                    : "bolt"
                  : "spear";
            const spawnOffset =
              troop.type === "centaur"
                ? { x: 0, y: -20 }
                : troop.type === "knight" || troop.type === "reinforcement"
                  ? isReinforcementLancer
                    ? { x: 0, y: -16 }
                    : { x: 0, y: -12 }
                  : { x: 0, y: 0 };
            queuedTroopProjectiles.push({
              id: generateId("proj"),
              from: {
                x: troop.pos.x + spawnOffset.x,
                y: troop.pos.y + spawnOffset.y,
              },
              to: targetAimPos,
              progress: 0,
              type: projType,
              rotation,
              scale: isReinforcementLancer ? 1.1 : undefined,
              color: isReinforcementLancer ? "#d6c07f" : undefined,
              trailColor: isReinforcementLancer ? "#f4e3aa" : undefined,
            });
          }
          queuedTroopPatches.set(troop.id, {
            lastAttack: now,
            lastCombatTime: now,
            attackAnim: useRangedAttack ? 400 : 300,
            rotation,
            targetEnemy: target.id,
          });
        }
      }
    });
  } // End of !isPaused check for troop attacks
  if (queuedTroopEnemyMutations.length > 0) {
    setEnemies((prev) => {
      const enemyById = new Map(prev.map((enemy) => [enemy.id, enemy]));
      for (const mutation of queuedTroopEnemyMutations) {
        const current = enemyById.get(mutation.enemyId);
        if (!current) continue;
        const updated = mutation.mutate(current);
        if (updated) {
          enemyById.set(mutation.enemyId,
            updated.hp < current.hp ? { ...updated, lastDamageTaken: now } : updated
          );
        } else {
          enemyById.delete(mutation.enemyId);
        }
      }
      const nextEnemies: Enemy[] = [];
      for (const enemy of prev) {
        const updated = enemyById.get(enemy.id);
        if (updated) nextEnemies.push(updated);
      }
      return nextEnemies;
    });
  }
  if (queuedTroopEffects.length > 0) {
    addEffectEntities(queuedTroopEffects);
  }
  if (queuedTroopProjectiles.length > 0) {
    addProjectileEntities(queuedTroopProjectiles);
  }
  if (queuedTroopPatches.size > 0) {
    setTroops((prev) =>
      prev.map((troop) => {
        const patch = queuedTroopPatches.get(troop.id);
        return patch ? { ...troop, ...patch } : troop;
      })
    );
  }
  setTroops((prev) =>
    prev.map((t) => {
      const attackAnim = t.attackAnim ?? 0;
      return attackAnim > 0
        ? { ...t, attackAnim: Math.max(0, attackAnim - deltaTime) }
        : t;
    })
  );

  const troopCountByOwner = new Map<string, number>();
  troops.forEach((troop) => {
    troopCountByOwner.set(
      troop.ownerId,
      (troopCountByOwner.get(troop.ownerId) ?? 0) + 1
    );
  });

  setTowers((prev) =>
    prev.map((t) => {
      if (t.type === "station") {
        const troopCount = troopCountByOwner.get(t.id) ?? 0;
        if (t.currentTroopCount === troopCount) return t;
        return { ...t, currentTroopCount: troopCount };
      }
      return t;
    })
  );
  // Update cooldowns
  if (hero && hero.abilityCooldown > 0) {
    setHero((prev) =>
      prev
        ? {
          ...prev,
          abilityCooldown: Math.max(0, prev.abilityCooldown - deltaTime),
          abilityReady: prev.abilityCooldown - deltaTime <= 0,
        }
        : null
    );
  }
  // Update projectiles with a throttled simulation step and batched impact handling.
  projectileUpdateAccumulator.current += deltaTime;
  const projectilePressure =
    entityCountsRef.current.projectiles + entityCountsRef.current.enemies * 0.35;
  const projectileUpdateInterval =
    projectilePressure > 260
      ? 42
      : projectilePressure > 180
        ? 32
        : projectilePressure > 110
          ? 24
          : 16;
  if (projectileUpdateAccumulator.current >= projectileUpdateInterval) {
    const projectileDelta = projectileUpdateAccumulator.current;
    projectileUpdateAccumulator.current = 0;

    setProjectiles((prev) => {
      if (prev.length === 0) return prev;

      const nextProjectiles: Projectile[] = [];
      const completingProjectiles: Projectile[] = [];
      const baseProgressStep = projectileDelta / 300;
      for (const proj of prev) {
        if (proj.spawnDelay && proj.spawnDelay > 0) {
          const remaining = proj.spawnDelay - projectileDelta;
          nextProjectiles.push(remaining > 0
            ? { ...proj, spawnDelay: remaining }
            : { ...proj, spawnDelay: 0 });
          continue;
        }
        const progressStep = baseProgressStep * (proj.speed ?? 1);
        const nextProgress = Math.min(1, proj.progress + progressStep);
        if (nextProgress >= 1) {
          if (proj.targetType && proj.damage) {
            completingProjectiles.push(proj);
          } else if (proj.isAoE && proj.damage) {
            completingProjectiles.push(proj);
          }
        } else {
          nextProjectiles.push({ ...proj, progress: nextProgress });
        }
      }

      if (completingProjectiles.length === 0) return nextProjectiles;

      const nowMs = Date.now();
      let heroDamageTotal = 0;
      let shouldDeflectOnHero = false;
      const directTroopDamage = new Map<string, number>();
      const aoeEvents: Array<{ center: Position; radius: number; damage: number }> = [];
      const mortarAoEEvents: Array<{ center: Position; radius: number; damage: number; isBurning: boolean }> = [];
      const queuedImpactParticles: Array<{ pos: Position; type: string }> = [];
      const queuedImpactEffects: Effect[] = [];

      for (const proj of completingProjectiles) {
        if (proj.targetType === "hero" && proj.targetId && hero && hero.id === proj.targetId && !hero.dead) {
          if (hero.shieldActive) {
            shouldDeflectOnHero = true;
            continue;
          }
          heroDamageTotal += proj.damage || DEFAULT_PROJECTILE_DAMAGE;
          queuedImpactEffects.push({
            id: generateId("eff"),
            pos: proj.to,
            type: getImpactEffect(proj.type),
            progress: 0,
            size: 35,
            rotation: proj.rotation,
          });
          if (proj.isAoE && proj.aoeRadius) {
            const aoeEffectType: EffectType =
              proj.type === "rock" ? "shockwave" : "fire_nova";
            queuedImpactEffects.push({
              id: generateId("eff"),
              pos: proj.to,
              type: aoeEffectType,
              progress: 0,
              size: proj.aoeRadius || 50,
            });
            aoeEvents.push({
              center: proj.to,
              radius: proj.aoeRadius,
              damage: Math.floor((proj.damage || DEFAULT_PROJECTILE_DAMAGE) * 0.5),
            });
          }
          continue;
        }

        if (proj.targetType === "troop" && proj.targetId) {
          directTroopDamage.set(
            proj.targetId,
            (directTroopDamage.get(proj.targetId) ?? 0) + (proj.damage || DEFAULT_PROJECTILE_DAMAGE)
          );
          queuedImpactEffects.push({
            id: generateId("eff"),
            pos: proj.to,
            type: getImpactEffect(proj.type),
            progress: 0,
            size: 30,
            rotation: proj.rotation,
          });
        }

        // AoE projectiles targeting enemies (mortars, hero fireballs) - batch processing
        if (proj.targetType === "enemy" && proj.isAoE && proj.aoeRadius && proj.damage) {
          const isPhoenixFireball = proj.type === "phoenixFlame" || proj.type === "phoenixFlameBlue";
          const impactEffectType: EffectType = isPhoenixFireball
            ? "fire_nova"
            : proj.type === "ember" ? "ember_impact" : "mortar_impact";
          queuedImpactEffects.push({
            id: generateId("eff"),
            pos: proj.to,
            type: impactEffectType,
            progress: 0,
            size: proj.aoeRadius,
            duration: isPhoenixFireball ? 700 : proj.type === "ember" ? 900 : 800,
            color: proj.type === "phoenixFlameBlue" ? "#3b82f6" : undefined,
          });
          mortarAoEEvents.push({
            center: proj.to,
            radius: proj.aoeRadius,
            damage: proj.damage,
            isBurning: proj.type === "ember" || isPhoenixFireball,
          });
          queuedImpactParticles.push({
            pos: proj.to,
            type: isPhoenixFireball ? "spark" : proj.type === "ember" ? "fire" : "explosion",
          });
        }
      }

      if (heroDamageTotal > 0) {
        setHero((prevHero) => {
          if (!prevHero || prevHero.dead) return prevHero;
          const newHp = prevHero.hp - heroDamageTotal;
          if (newHp <= 0) {
            return killHero(prevHero, 15000, nowMs);
          }
          return { ...prevHero, hp: newHp, lastCombatTime: nowMs };
        });
      } else if (shouldDeflectOnHero && hero?.shieldActive) {
        addParticles(hero.pos, "spark", 8);
      }

      if (directTroopDamage.size > 0 || aoeEvents.length > 0) {
        setTroops((prevTroops) =>
          prevTroops
            .map((troop) => {
              let totalDamage = directTroopDamage.get(troop.id) ?? 0;
              if (aoeEvents.length > 0) {
                for (const aoe of aoeEvents) {
                  if (distance(troop.pos, aoe.center) <= aoe.radius) {
                    totalDamage += aoe.damage;
                  }
                }
              }
              if (totalDamage <= 0) return troop;
              const newHp = troop.hp - totalDamage;
              if (newHp <= 0) {
                addParticles(troop.pos, "explosion", 6);
                return null;
              }
              return { ...troop, hp: newHp, lastCombatTime: nowMs };
            })
            .filter(isDefined)
        );
      }

      // Mortar AoE damage against enemies
      if (mortarAoEEvents.length > 0) {
        setEnemies((prevEnemies) => {
          const nextEnemies: Enemy[] = [];
          for (const enemy of prevEnemies) {
            const enemyPos = getEnemyPosWithPath(enemy, selectedMap);
            let totalDamage = 0;
            let shouldBurn = false;
            for (const aoe of mortarAoEEvents) {
              const dist = distance(enemyPos, aoe.center);
              if (dist <= aoe.radius) {
                const falloff = 1 - (dist / aoe.radius) * 0.4;
                totalDamage += getEnemyDamageTaken(enemy, aoe.damage * falloff);
                if (aoe.isBurning) shouldBurn = true;
              }
            }
            if (totalDamage <= 0) {
              nextEnemies.push(enemy);
              continue;
            }
            emitDamageNumber(enemyPos, totalDamage, "aoe");
            const newHp = enemy.hp - totalDamage;
            if (newHp <= 0) {
              onEnemyKill(enemy, enemyPos, 12, shouldBurn ? "fire" : "default");
              continue;
            }
            const updates: Partial<Enemy> = { hp: newHp, damageFlash: 200, lastDamageTaken: nowMs };
            if (shouldBurn) {
              const emberStats = TOWER_STATS.mortar.upgrades.B.stats;
              updates.burning = true;
              updates.burnDamage = emberStats.burnDamage ?? 25;
              updates.burnUntil = nowMs + (emberStats.burnDuration ?? 4000);
            }
            nextEnemies.push({ ...enemy, ...updates });
          }
          return nextEnemies;
        });
      }

      if (queuedImpactEffects.length > 0) {
        setEffects((ef) => {
          const combined = [...ef, ...queuedImpactEffects];
          if (combined.length > MAX_EFFECTS) {
            return combined.slice(combined.length - MAX_EFFECTS);
          }
          return combined;
        });
      }

      // Mortar impact particles (called from within updater for batching)
      for (const p of queuedImpactParticles) {
        addParticles(p.pos, p.type as "fire" | "explosion", 8);
      }

      return nextProjectiles;
    });
  }
  // Update effects - with hard cap (throttled to reduce state updates)
  effectsUpdateAccumulator.current += deltaTime;
  if (effectsUpdateAccumulator.current >= 32) { // Update every ~32ms instead of every frame
    const accumulatedDelta = effectsUpdateAccumulator.current;
    effectsUpdateAccumulator.current = 0;

    setEffects((prev) => {
      if (prev.length === 0) return prev;

      const updated = prev
        .map((eff) => {
          const next = { ...eff, progress: eff.progress + accumulatedDelta / (eff.duration || 500) };
          if (next.type === "fortress_shield" && hero && !hero.dead) {
            next.pos = { ...hero.pos };
          }
          return next;
        })
        .filter((e) => e.progress < 1);

      // Hard cap on effects
      if (updated.length > MAX_EFFECTS) {
        return updated.slice(updated.length - MAX_EFFECTS);
      }
      return updated;
    });
  }
  // Update particles via pool (no React state — avoids GC and re-renders)
  particleUpdateAccumulator.current += deltaTime;
  const liveEnemyCount = entityCountsRef.current.enemies;
  const particleUpdateInterval =
    liveEnemyCount > 180 ? 48 : liveEnemyCount > 120 ? 40 : 32;
  if (particleUpdateAccumulator.current >= particleUpdateInterval) {
    const accumulatedDelta = particleUpdateAccumulator.current;
    particleUpdateAccumulator.current = 0;
    updateParticlePool(accumulatedDelta);
    const dynamicParticleCap =
      liveEnemyCount > 180 ? 180 : liveEnemyCount > 120 ? 220 : MAX_PARTICLES;
    enforceParticleCap(dynamicParticleCap);
  }
  // Update spell cooldowns
  setSpells((prev) =>
    prev.map((spell) => ({
      ...spell,
      cooldown: Math.max(0, spell.cooldown - deltaTime),
    }))
  );
}
