// Princeton Tower Defense - Wave Management System
// Handles enemy wave spawning and progression

import type { Enemy, WaveGroup, EnemyType, Position } from "../../types";
import { ENEMY_DATA, MAP_PATHS, LEVEL_WAVES } from "../../constants";

// ============================================================================
// WAVE STATE
// ============================================================================

export interface WaveState {
  currentWave: number;
  totalWaves: number;
  waveStarted: boolean;
  waveComplete: boolean;
  spawnQueue: SpawnEntry[];
  spawnTimer: number;
  enemiesSpawned: number;
  enemiesKilled: number;
  bossWave: boolean;
}

export interface SpawnEntry {
  type: EnemyType;
  delay: number;
  spawnedAt?: number;
  pathKey?: string;
}

// ============================================================================
// WAVE INITIALIZATION
// ============================================================================

/**
 * Initialize wave state for a level
 */
export function initializeWaveState(levelId: string): WaveState {
  const waves = LEVEL_WAVES[levelId] || [];
  
  return {
    currentWave: 0,
    totalWaves: waves.length,
    waveStarted: false,
    waveComplete: false,
    spawnQueue: [],
    spawnTimer: 0,
    enemiesSpawned: 0,
    enemiesKilled: 0,
    bossWave: false,
  };
}

/**
 * Get wave data for a specific wave
 */
export function getWaveData(levelId: string, waveNumber: number): WaveGroup[] | null {
  const waves = LEVEL_WAVES[levelId];
  if (!waves || waveNumber < 1 || waveNumber > waves.length) {
    return null;
  }
  return waves[waveNumber - 1];
}

// ============================================================================
// SPAWN QUEUE MANAGEMENT
// ============================================================================

/**
 * Build spawn queue from wave groups
 */
export function buildSpawnQueue(
  waveGroups: WaveGroup[],
  dualPath: boolean = false,
  primaryPathKey: string = "default",
  secondaryPathKey: string = "secondary"
): SpawnEntry[] {
  const queue: SpawnEntry[] = [];
  let currentDelay = 0;

  for (const group of waveGroups) {
    const groupDelay = group.delay || 0;
    currentDelay += groupDelay;

    for (let i = 0; i < group.count; i++) {
      // Determine path for dual-path levels
      let pathKey = primaryPathKey;
      if (dualPath) {
        pathKey = i % 2 === 0 ? primaryPathKey : secondaryPathKey;
      }

      queue.push({
        type: group.type,
        delay: currentDelay + i * group.interval,
        pathKey,
      });
    }

    currentDelay += (group.count - 1) * group.interval;
  }

  return queue;
}

/**
 * Check if wave contains boss enemies
 */
export function isBossWave(waveGroups: WaveGroup[]): boolean {
  const bossTypes: EnemyType[] = ["dean", "trustee", "golem", "shadow_knight", "necromancer"];
  return waveGroups.some((group) => bossTypes.includes(group.type));
}

// ============================================================================
// ENEMY SPAWNING
// ============================================================================

/**
 * Create a new enemy from spawn entry
 */
export function createEnemy(
  entry: SpawnEntry,
  selectedMap: string,
  enemyId: string
): Enemy {
  const enemyData = ENEMY_DATA[entry.type];
  
  return {
    id: enemyId,
    type: entry.type,
    pathIndex: 0,
    progress: 0,
    hp: enemyData.hp,
    maxHp: enemyData.hp,
    speed: enemyData.speed,
    slowEffect: 0,
    stunUntil: 0,
    frozen: false,
    damageFlash: 0,
    inCombat: false,
    lastTroopAttack: 0,
    lastHeroAttack: 0,
    lastRangedAttack: 0,
    spawnProgress: 0,
    laneOffset: (Math.random() - 0.5) * 20,
    pathKey: entry.pathKey || selectedMap,
  };
}

/**
 * Process spawn queue and spawn due enemies
 */
export function processSpawnQueue(
  waveState: WaveState,
  selectedMap: string,
  deltaTime: number,
  generateId: () => string
): Enemy[] {
  const spawnedEnemies: Enemy[] = [];
  
  waveState.spawnTimer += deltaTime;

  // Find entries ready to spawn
  const readyToSpawn = waveState.spawnQueue.filter(
    (entry) => !entry.spawnedAt && entry.delay <= waveState.spawnTimer
  );

  for (const entry of readyToSpawn) {
    entry.spawnedAt = waveState.spawnTimer;
    waveState.enemiesSpawned++;
    
    const enemy = createEnemy(entry, selectedMap, generateId());
    spawnedEnemies.push(enemy);
  }

  return spawnedEnemies;
}

/**
 * Check if wave spawning is complete
 */
export function isSpawningComplete(waveState: WaveState): boolean {
  return waveState.spawnQueue.every((entry) => entry.spawnedAt !== undefined);
}

/**
 * Check if wave is complete (all enemies spawned and killed)
 */
export function isWaveComplete(waveState: WaveState, activeEnemies: number): boolean {
  return isSpawningComplete(waveState) && activeEnemies === 0;
}

// ============================================================================
// WAVE PROGRESSION
// ============================================================================

/**
 * Start the next wave
 */
export function startNextWave(
  waveState: WaveState,
  levelId: string,
  dualPath: boolean = false,
  primaryPathKey: string = "default",
  secondaryPathKey: string = "secondary"
): boolean {
  if (waveState.currentWave >= waveState.totalWaves) {
    return false;
  }

  waveState.currentWave++;
  waveState.waveStarted = true;
  waveState.waveComplete = false;
  waveState.spawnTimer = 0;
  waveState.enemiesSpawned = 0;
  waveState.enemiesKilled = 0;

  const waveData = getWaveData(levelId, waveState.currentWave);
  if (!waveData) return false;

  waveState.spawnQueue = buildSpawnQueue(waveData, dualPath, primaryPathKey, secondaryPathKey);
  waveState.bossWave = isBossWave(waveData);

  return true;
}

/**
 * Mark wave as complete
 */
export function completeWave(waveState: WaveState): void {
  waveState.waveComplete = true;
  waveState.waveStarted = false;
}

/**
 * Check if all waves are complete
 */
export function isLevelComplete(waveState: WaveState): boolean {
  return waveState.currentWave >= waveState.totalWaves && waveState.waveComplete;
}

// ============================================================================
// WAVE INFO
// ============================================================================

/**
 * Get preview of upcoming wave
 */
export function getWavePreview(
  levelId: string,
  waveNumber: number
): { type: EnemyType; count: number }[] {
  const waveData = getWaveData(levelId, waveNumber);
  if (!waveData) return [];

  return waveData.map((group) => ({
    type: group.type,
    count: group.count,
  }));
}

/**
 * Get total enemy count for a wave
 */
export function getWaveEnemyCount(levelId: string, waveNumber: number): number {
  const waveData = getWaveData(levelId, waveNumber);
  if (!waveData) return 0;

  return waveData.reduce((total, group) => total + group.count, 0);
}

/**
 * Calculate wave progress (0-1)
 */
export function getWaveProgress(waveState: WaveState): number {
  if (!waveState.waveStarted) return 0;
  if (waveState.spawnQueue.length === 0) return 1;

  const spawned = waveState.spawnQueue.filter((e) => e.spawnedAt !== undefined).length;
  return spawned / waveState.spawnQueue.length;
}
