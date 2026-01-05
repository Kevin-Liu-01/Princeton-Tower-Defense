// Princeton Tower Defense - Type Definitions

// Grid position
export interface GridPosition {
  x: number;
  y: number;
}

// World position
export interface Position {
  x: number;
  y: number;
}

// Tower types
export type TowerType =
  | "cannon"
  | "library"
  | "lab"
  | "arch"
  | "club"
  | "station";

// Enemy types - matches ENEMY_DATA keys
export type EnemyType =
  | "frosh"
  | "sophomore"
  | "junior"
  | "senior"
  | "gradstudent"
  | "professor"
  | "dean"
  | "trustee"
  | "mascot"
  | "archer"
  | "mage"
  | "catapult";

// Hero types
export type HeroType =
  | "tiger"
  | "tenor"
  | "mathey"
  | "rocky"
  | "scott"
  | "captain"
  | "engineer";

// Spell types
export type SpellType =
  | "fireball"
  | "lightning"
  | "freeze"
  | "payday"
  | "reinforcements";

// Troop types - includes "elite" for Level 3 station
export type TroopType =
  | "footsoldier"
  | "armored"
  | "elite"
  | "knight"
  | "centaur"
  | "cavalry"
  | "thesis"
  | "rowing"
  | "turret";

// Tower upgrade paths
export type TowerUpgrade = "A" | "B";

// Maximum troops per station
export const MAX_STATION_TROOPS = 3;

// Spawn positions relative to station world position
export const STATION_SPAWN_OFFSETS = [
  { x: -1.5, y: 1.5 }, // Slot 0: Left position
  { x: 0, y: 2 }, // Slot 1: Center position
  { x: 1.5, y: 1.5 }, // Slot 2: Right position
];

// Tower entity - supports 4 levels
export interface Tower {
  id: string;
  type: TowerType;
  pos: GridPosition;
  level: 1 | 2 | 3 | 4;
  upgrade?: TowerUpgrade;
  lastAttack: number;
  rotation: number;
  target?: string;
  spawnRange?: number;
  trainArriving?: boolean;
  trainProgress?: number;
  trainDeparting?: boolean;
  trainAnimProgress?: number;
  currentTroopCount?: number;
  occupiedSpawnSlots?: boolean[];
  selected?: boolean;
  showSpawnMarkers?: boolean;
  pendingRespawns?: Array<{
    slot: number;
    timer: number;
    respawnPos: Position;
    troopType: string;
  }>;
  lockedTarget?: string;
  burnTargets?: string[];
  freezeCharges?: number;
  lastSpawn?: number;
  chainTargets?: string[];
  damageAccumulator?: number;
  damageBoost?: number;
  boostEnd?: number;
  temporary?: boolean;
  expireTime?: number;
}

// Enemy entity
export interface Enemy {
  id: string;
  type: EnemyType;
  pathIndex: number;
  progress: number;
  hp: number;
  maxHp: number;
  speed: number;
  slowEffect: number;
  stunUntil: number;
  frozen: boolean;
  damageFlash: number;
  inCombat: boolean;
  combatTarget?: string;
  lastTroopAttack: number;
  lastHeroAttack: number;
  lastRangedAttack: number;
  spawnProgress: number;
  laneOffset: number;
  burning?: boolean;
  burnDamage?: number;
  burnUntil?: number;
  slowed?: boolean;
  slowIntensity?: number;
  taunted?: boolean;
  tauntTarget?: string;
}

// Hero entity
export interface Hero {
  id: string;
  type: HeroType;
  pos: Position;
  targetPos?: Position;
  hp: number;
  maxHp: number;
  moving: boolean;
  lastAttack: number;
  abilityReady: boolean;
  abilityCooldown: number;
  revived: boolean;
  rotation: number;
  attackAnim: number;
  selected: boolean;
  dead: boolean;
  respawnTimer: number;
  homePos?: Position;
  aggroTarget?: string;
  returning?: boolean;
  shieldActive?: boolean;
  shieldEnd?: number;
}

// Troop entity
export interface Troop {
  id: string;
  ownerId: string;
  type?: TroopType;
  pos: Position;
  targetPos?: Position;
  hp: number;
  maxHp: number;
  moving: boolean;
  lastAttack?: number;
  rotation?: number;
  attackAnim?: number;
  selected: boolean;
  spawnPoint?: Position;
  moveRadius?: number;
  spawnSlot?: number;
  userTargetPos?: Position;
  dead?: boolean;
  respawnTimer?: number;
  rallyPoint?: Position | null;
  targetEnemy?: string | null;
  attackCooldown?: number;
}

// Projectile
export interface Projectile {
  id: string;
  from: Position;
  to: Position;
  progress: number;
  type: string;
  rotation: number;
  arcHeight?: number;
  elevation?: number;
  isFlamethrower?: boolean;
  damage?: number;
  targetType?: "hero" | "troop" | "enemy";
  targetId?: string;
}

// Visual effect
export interface Effect {
  id: string;
  pos: Position;
  type:
    | "explosion"
    | "slow"
    | "zap"
    | "lightning"
    | "freeze"
    | "earthquake"
    | "fire"
    | "beam"
    | "chain"
    | "sonic"
    | "slowField"
    | "freezeField"
    | "earthquakeField"
    | "arcaneField"
    | "music_notes"
    | "cannon_shot"
    | "bullet_stream"
    | "flame_burst";
  progress: number;
  size: number;
  targetPos?: Position;
  towerId?: string;
  towerLevel?: number;
  towerUpgrade?: "A" | "B";
  intensity?: number;
  noteIndex?: number;
  rotation?: number;
}

// Particle
export interface Particle {
  id: string;
  pos: Position;
  velocity: Position;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type:
    | "spark"
    | "glow"
    | "smoke"
    | "explosion"
    | "light"
    | "magic"
    | "gold"
    | "fire"
    | "ice";
}

// Spell state
export interface Spell {
  type: SpellType;
  cooldown: number;
  maxCooldown: number;
}

// Wave group
export interface WaveGroup {
  type: EnemyType;
  count: number;
  interval: number;
  delay?: number;
}

// Enemy data definition
export interface EnemyData {
  name: string;
  hp: number;
  speed: number;
  bounty: number;
  armor: number;
  flying: boolean;
  desc: string;
  color: string;
  size: number;
  isRanged?: boolean;
  range?: number;
  attackSpeed?: number;
  projectileDamage?: number;
}

// Hero data definition
export interface HeroData {
  name: string;
  hp: number;
  damage: number;
  range: number;
  attackSpeed: number;
  speed: number;
  ability: string;
  abilityDesc: string;
  color: string;
  icon: string;
  description: string;
}

// Spell data definition
export interface SpellData {
  name: string;
  cost: number;
  cooldown: number;
  desc: string;
  icon: string;
}

// Troop data definition
export interface TroopData {
  name: string;
  hp: number;
  damage: number;
  attackSpeed: number;
  desc: string;
  color: string;
  isMounted?: boolean;
  isRanged?: boolean;
  range?: number;
  isStationary?: boolean; // For turrets that cannot move
}

// Tower dragging state
export interface DraggingTower {
  type: TowerType;
  pos: Position;
}

// Renderable for depth sorting
export interface Renderable {
  type:
    | "tower"
    | "enemy"
    | "hero"
    | "troop"
    | "projectile"
    | "effect"
    | "particle"
    | "tower-preview"
    | "station-range"
    | "tower-range";
  data: any;
  isoY: number;
}

// Game state
export type GameState =
  | "menu"
  | "worldmap"
  | "setup"
  | "playing"
  | "paused"
  | "victory"
  | "defeat";

// Level stars tracking
export interface LevelStars {
  [mapId: string]: number;
}

// Completed levels tracking
export interface CompletedLevels {
  [mapId: string]: boolean;
}

// Codex tabs
export type CodexTab = "towers" | "enemies" | "heroes" | "spells";

// Tower upgrade info
export interface TowerUpgradeInfo {
  name: string;
  desc: string;
  effect: string;
  special?: string;
}

// Camera state
export interface CameraState {
  offset: Position;
  zoom: number;
}
