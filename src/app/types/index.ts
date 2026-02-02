// Princeton Tower Defense - Type Definitions

// ============================================================================
// POSITION TYPES
// ============================================================================

// Grid position (tile coordinates)
export interface GridPosition {
  x: number;
  y: number;
}

// World position (pixel coordinates)
export interface Position {
  x: number;
  y: number;
}

// ============================================================================
// TOWER TYPES
// ============================================================================

export type TowerType =
  | "cannon"
  | "library"
  | "lab"
  | "arch"
  | "club"
  | "station";

export type TowerUpgrade = "A" | "B";

// Tower level stats - per-level configuration
export interface TowerLevelStats {
  damage: number;
  range: number;
  attackSpeed: number;
  targets?: number;
  special?: string;
}

// Tower upgrade stats
export interface TowerUpgradeStats {
  name: string;
  desc: string;
  effect: string;
  damage: number;
  range: number;
  attackSpeed: number;
  targets?: number;
  special?: string;
}

// Complete tower stats definition
export interface TowerStats {
  name: string;
  icon: string;
  cost: number;
  desc: string;
  spawnRange?: number;
  levels: {
    1: TowerLevelStats;
    2: TowerLevelStats;
    3: TowerLevelStats;
  };
  upgrades: {
    A: TowerUpgradeStats;
    B: TowerUpgradeStats;
  };
  levelDesc: { [key: number]: string };
}

// Tower debuff state - applied by enemies
export interface TowerDebuff {
  type: "slow" | "weaken" | "blind" | "disable";
  intensity: number;  // Percentage reduction (0-1)
  until: number;      // Timestamp when debuff expires
  sourceId?: string;  // Enemy that applied the debuff
}

// Tower entity - runtime state
export interface Tower {
  id: string;
  type: TowerType;
  pos: GridPosition;
  level: 1 | 2 | 3 | 4;
  upgrade?: TowerUpgrade;
  lastAttack: number;
  rotation: number;
  target?: string;
  targetId?: string;
  spawnRange?: number;
  // Station-specific
  trainArriving?: boolean;
  trainProgress?: number;
  trainDeparting?: boolean;
  trainAnimProgress?: number;
  currentTroopCount?: number;
  occupiedSpawnSlots?: boolean[];
  pendingRespawns?: Array<{
    slot: number;
    timer: number;
    respawnPos: Position;
    troopType: string;
  }>;
  // Combat state
  lockedTarget?: string;
  burnTargets?: string[];
  freezeCharges?: number;
  lastSpawn?: number;
  lastFreezeCheck?: number; // For Blizzard tower freeze timing
  chainTargets?: string[];
  damageAccumulator?: number;
  // Buff state
  damageBoost?: number;
  rangeBoost?: number;
  boostEnd?: number;
  isBuffed?: boolean;
  // Debuff state (from enemy abilities)
  debuffs?: TowerDebuff[];
  disabled?: boolean;
  disabledUntil?: number;
  // Temporary tower (from abilities)
  temporary?: boolean;
  expireTime?: number;
  // UI state
  selected?: boolean;
  showSpawnMarkers?: boolean;
  engaging?: boolean;
  // World position cache for rendering
  x?: number;
  y?: number;
}

// Tower colors for rendering
export interface TowerColors {
  base?: string;
  dark?: string;
  light?: string;
  accent: string;
  primary: string;
  secondary: string;
}

// ============================================================================
// ENEMY TYPES
// ============================================================================

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
  | "catapult"
  | "warlock"
  | "crossbowman"
  | "hexer"
  | "harpy"
  | "wyvern"
  | "specter"
  | "berserker"
  | "golem"
  | "necromancer"
  | "shadow_knight"
  // New enemy types
  | "cultist"
  | "plaguebearer"
  | "thornwalker"
  | "sandworm"
  | "frostling"
  | "infernal"
  | "banshee"
  | "juggernaut"
  | "assassin"
  | "dragon"
  // Region-specific common troops - Forest
  | "freshman"
  | "athlete"
  | "protestor"
  // Region-specific common troops - Swamp
  | "bog_creature"
  | "will_o_wisp"
  | "swamp_troll"
  // Region-specific common troops - Desert
  | "nomad"
  | "scorpion"
  | "scarab"
  // Region-specific common troops - Winter
  | "snow_goblin"
  | "yeti"
  | "ice_witch"
  // Region-specific common troops - Volcanic
  | "magma_spawn"
  | "fire_imp"
  | "ember_guard";

// Enemy categories for organization
export type EnemyCategory =
  | "academic"      // Academic progression: writing sem, thesis, grad apps, etc.
  | "campus"        // Campus life: athletes, protestors, recruiters, etc.
  | "ranged"        // Ranged attackers
  | "flying"        // Flying enemies
  | "boss"          // Major boss enemies
  | "nature"        // Environmental/biome enemies
  | "swarm";        // Fast, weak, numerous enemies

// Enemy ability types - special effects enemies can apply
export type EnemyAbilityType = 
  | "burn"      // Deals damage over time to troops/heroes
  | "slow"      // Reduces movement/attack speed of troops/heroes
  | "poison"    // Deals damage over time and reduces healing
  | "stun"      // Temporarily disables troops/heroes
  | "tower_slow"      // Reduces tower attack speed
  | "tower_weaken"    // Reduces tower damage
  | "tower_blind"     // Reduces tower range
  | "tower_disable";  // Completely disables tower temporarily

export interface EnemyAbility {
  type: EnemyAbilityType;
  name: string;
  desc: string;
  chance: number;      // Chance to apply on attack (0-1)
  duration: number;    // Duration in ms
  intensity?: number;  // For slow: percentage (0-1), for damage: DPS
  radius?: number;     // For AoE abilities
  cooldown?: number;   // Cooldown before can apply again
}

// Enemy special traits for display
export type EnemyTrait = 
  | "flying"
  | "ranged"
  | "armored"
  | "fast"
  | "boss"
  | "summoner"
  | "regenerating"
  | "aoe_attack"
  | "magic_resist"
  | "tower_debuffer"
  | "breakthrough"; // Fast enemies that bypass troops without stopping

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
  category?: EnemyCategory; // Enemy category for organization
  isRanged?: boolean;
  range?: number;
  attackSpeed?: number;
  projectileDamage?: number;
  // New ability system
  abilities?: EnemyAbility[];
  traits?: EnemyTrait[];
  isBoss?: boolean;
  aoeRadius?: number;
  aoeDamage?: number;
  // Flying troop targeting
  targetsTroops?: boolean;
  troopDamage?: number;
  troopAttackSpeed?: number; // ms between attacks on troops
  // Breakthrough - ground enemies that bypass barracks troops without stopping
  breakthrough?: boolean;
  // Lives cost when enemy escapes
  liveCost?: number; // default 1
}

// Enemy entity - runtime state
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
  // Status effects
  burning?: boolean;
  burnDamage?: number;
  burnUntil?: number;
  slowed?: boolean;
  slowIntensity?: number;
  taunted?: boolean;
  tauntTarget?: string;
  tauntOffset?: Position; // Offset from path position when moving toward taunt target
  goldAura?: boolean; // Gold Rush spell glowing effect
  // Ability cooldowns (tracks when enemy can use abilities again)
  abilityCooldowns?: Record<string, number>;
  lastAbilityUse?: number;
  // Dual-path support
  pathKey?: string;
  // Mark as dead for cleanup
  dead?: boolean;
}

// ============================================================================
// HERO TYPES
// ============================================================================

export type HeroType =
  | "tiger"
  | "tenor"
  | "mathey"
  | "rocky"
  | "scott"
  | "captain"
  | "engineer";

// Hero data definition
export interface HeroData {
  name: string;
  icon: string;
  description: string;
  hp: number;
  damage: number;
  range: number;
  attackSpeed: number;
  speed: number;
  ability: string;
  abilityDesc: string;
  color: string;
  isRanged?: boolean;
}

// Status effect applied by enemies
export interface StatusEffect {
  type: "burn" | "slow" | "poison" | "stun";
  intensity: number;  // For burn/poison: DPS, for slow: percentage (0-1)
  until: number;      // Timestamp when effect expires
  sourceId?: string;  // Enemy that applied the effect
}

// Hero entity - runtime state
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
  healFlash?: number; // Visual effect when healed (timestamp when healed)
  lastCombatTime?: number; // Timestamp of last attack given or received (for heal delay)
  // Status effects from enemies
  statusEffects?: StatusEffect[];
  burning?: boolean;
  burnDamage?: number;
  burnUntil?: number;
  slowed?: boolean;
  slowIntensity?: number;
  slowUntil?: number;
  poisoned?: boolean;
  poisonDamage?: number;
  poisonUntil?: number;
  stunned?: boolean;
  stunUntil?: number;
}

// ============================================================================
// TROOP TYPES
// ============================================================================

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
  isStationary?: boolean;
  canTargetFlying?: boolean;
}

// Owner type for determining troop visual theme
export type TroopOwnerType = 'station' | 'barracks' | 'hero_summon' | 'spell' | 'default';

// Troop entity - runtime state
export interface Troop {
  id: string;
  ownerId: string;
  ownerType?: TroopOwnerType; // For determining visual theme (blue barracks, red mercer, purple spell)
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
  engaging?: boolean;
  healFlash?: number; // Visual effect when healed (timestamp when healed)
  lastCombatTime?: number; // Timestamp of last attack given or received (for heal delay)
  // Status effects from enemies
  statusEffects?: StatusEffect[];
  burning?: boolean;
  burnDamage?: number;
  burnUntil?: number;
  slowed?: boolean;
  slowIntensity?: number;
  slowUntil?: number;
  poisoned?: boolean;
  poisonDamage?: number;
  poisonUntil?: number;
  stunned?: boolean;
  stunUntil?: number;
}

// ============================================================================
// SPELL TYPES
// ============================================================================

export type SpellType =
  | "fireball"
  | "lightning"
  | "freeze"
  | "payday"
  | "reinforcements";

// Spell data definition
export interface SpellData {
  name: string;
  cost: number;
  cooldown: number;
  desc: string;
  icon: string;
}

// Spell state
export interface Spell {
  type: SpellType;
  cooldown: number;
  maxCooldown: number;
}

// ============================================================================
// PROJECTILE & EFFECT TYPES
// ============================================================================

// Projectile types for visual variety
export type ProjectileType =
  | "arrow"          // Basic arrow (archers, crossbowmen)
  | "bolt"           // Crossbow bolt
  | "spear"          // Centaur spear/javelin
  | "rock"           // Catapult boulder
  | "fireball"       // Mage fire attack
  | "magicBolt"      // Generic magic projectile (warlocks, hexers)
  | "darkBolt"       // Dark magic (necromancers, shadow knights)
  | "frostBolt"      // Ice projectile (frostlings)
  | "poisonBolt"     // Poison magic (plaguebearers)
  | "energyBlast"    // Generic energy (lab towers)
  | "sonicWave"      // Sound wave (tenor, arch tower)
  | "lightningOrb"   // Lightning projectile
  | "flame"          // Flamethrower
  | "bullet"         // Modern bullets (station turrets)
  | "cannon"         // Cannonball
  | "hero"           // Hero ranged attack
  | "lab"            // Lab tower projectile
  | "lightning"      // Lightning bolt
  | "arch"           // Arch tower music note
  | "infernalFire"   // Infernal demon fire
  | "bansheeScream"  // Banshee wail
  | "dragonBreath";  // Dragon fire

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
  // AoE properties
  isAoE?: boolean;
  aoeRadius?: number;
  // Visual customization
  color?: string;
  scale?: number;
  trailColor?: string;
}

// Visual effect types
export type EffectType =
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
  | "flame_burst"
  | "payday_aura"
  | "roar_wave"
  | "meteor_strike"
  | "boulder_strike"
  | "inspiration"
  | "knight_summon"
  | "turret_deploy"
  | "fortress_shield"
  | "high_note"
  | "meteor_incoming"
  | "meteor_falling"
  | "meteor_impact"
  | "lightning_bolt"
  | "freeze_wave"
  // Physical attack effects
  | "melee_slash"       // Sword/claw slash arc
  | "melee_smash"       // Heavy ground pound
  | "melee_swipe"       // Quick claw swipe
  | "impact_hit"        // Generic hit impact
  | "ground_crack"      // Ground crack from heavy attack
  | "dust_cloud"        // Dust from ground impact
  // AoE attack effects  
  | "aoe_ring"          // Expanding damage ring
  | "shockwave"         // Ground shockwave
  | "magic_burst"       // Magic AoE burst
  | "fire_nova"         // Fire explosion ring
  | "ice_nova"          // Ice explosion ring
  | "dark_nova"         // Dark magic burst
  // Projectile impact effects
  | "arrow_hit"         // Arrow stuck in ground
  | "magic_impact"      // Magic projectile impact
  | "fire_impact"       // Fireball explosion
  | "rock_impact"       // Boulder crash
  | "poison_splash"     // Poison splatter
  | "frost_impact"      // Ice shatter
  // Hero special effects
  | "tiger_slash"       // Tiger claw attack
  | "knight_cleave"     // Mathey Knight sword swing
  | "scott_quill"       // F Scott pen/quill attack
  | "sonic_blast"       // Tenor multi-target blast
  // Tower debuff effects
  | "tower_debuff_slow"     // Tower attack speed reduced
  | "tower_debuff_weaken"   // Tower damage reduced
  | "tower_debuff_blind"    // Tower range reduced
  | "tower_debuff_disable"  // Tower completely disabled
  // Unit status effect visuals (troops/heroes)
  | "status_burning"        // On-fire effect
  | "status_slowed"         // Slowed/frozen effect
  | "status_poisoned"       // Poison dripping effect
  | "status_stunned";       // Stunned/dazed effect

// Visual effect
export interface Effect {
  id: string;
  pos: Position;
  type: EffectType;
  progress: number;
  size: number;
  targetPos?: Position;
  towerId?: string;
  towerLevel?: number;
  towerUpgrade?: TowerUpgrade;
  intensity?: number;
  noteIndex?: number;
  rotation?: number;
  duration?: number;
  strikeIndex?: number;
  meteorIndex?: number;
  // Combat effect properties
  color?: string;
  sourceId?: string;         // Who caused this effect
  damageDealt?: number;      // Visual damage number
  isCritical?: boolean;      // Critical hit indicator
  attackerType?: "enemy" | "hero" | "troop" | "tower";
  // Slash/melee effect properties
  slashAngle?: number;       // Direction of slash
  slashWidth?: number;       // Arc width of slash
}

// Particle types
export type ParticleType =
  | "spark"
  | "glow"
  | "smoke"
  | "explosion"
  | "light"
  | "magic"
  | "gold"
  | "fire"
  | "ice";

// Particle
export interface Particle {
  id: string;
  pos: Position;
  velocity: Position;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: ParticleType;
}

// ============================================================================
// WAVE & LEVEL TYPES
// ============================================================================

// Wave group
export interface WaveGroup {
  type: EnemyType;
  count: number;
  interval: number;
  delay?: number;
}

// Level stars tracking
export interface LevelStars {
  [mapId: string]: number;
}

// Completed levels tracking
export interface CompletedLevels {
  [mapId: string]: boolean;
}

// ============================================================================
// MAP & DECORATION TYPES
// ============================================================================

export type MapTheme = "grassland" | "desert" | "winter" | "volcanic" | "swamp";

// Map decoration categories
export type DecorationCategory =
  // Grassland
  | "tree"
  | "bush"
  | "rock"
  | "flowers"
  | "flower"
  | "building"
  | "lamp"
  | "fence"
  | "water"
  | "ruins"
  | "signpost"
  | "lake"
  | "dock"
  | "boat"
  | "reeds"
  | "bench"
  | "lamppost"
  | "nassau_hall"
  | "statue"
  | "fountain"
  | "hedge"
  // Desert
  | "palm"
  | "cactus"
  | "dune"
  | "skull"
  | "pottery"
  | "oasis_pool"
  | "pyramid"
  | "obelisk"
  | "sphinx"
  | "giant_sphinx"
  | "hieroglyph_wall"
  | "treasure_chest"
  | "skeleton"
  | "torch"
  | "temple_entrance"
  | "sarcophagus"
  | "cobra_statue"
  | "sand_pile"
  // Winter
  | "pine_tree"
  | "snowman"
  | "ice_crystal"
  | "frozen_pond"
  | "snow_pile"
  | "icicles"
  | "ice_fortress"
  | "frozen_gate"
  | "broken_wall"
  | "frozen_soldier"
  | "battle_crater"
  | "ice_throne"
  | "mountain_peak"
  | "ice_bridge"
  | "frozen_waterfall"
  | "aurora_crystal"
  | "snow_drift"
  // Volcanic
  | "lava_pool"
  | "obsidian_spike"
  | "magma_vent"
  | "charred_tree"
  | "skull_pile"
  | "ember_rock"
  | "volcano_rim"
  | "lava_fall"
  | "obsidian_pillar"
  | "fire_crystal"
  | "dead_adventurer"
  | "broken_weapon"
  | "obsidian_castle"
  | "dark_throne"
  | "dark_barracks"
  | "dark_spire"
  | "demon_statue"
  | "lava_moat"
  | "skull_throne"
  | "fire_pit"
  | "battle_standard"
  // Swamp
  | "swamp_tree"
  | "lily_pads"
  | "mushroom_cluster"
  | "fog_patch"
  | "broken_bridge"
  | "frog"
  | "witch_cottage"
  | "cauldron"
  | "tombstone"
  | "glowing_runes"
  | "hanging_cage"
  | "poison_pool"
  | "ruined_temple"
  | "sunken_pillar"
  | "idol_statue"
  | "algae_pool"
  | "tentacle"
  | "skeleton_pile"
  | "treasure_hoard"
  | "deep_water"
  // Additional decorations
  | "cart"
  | "tent"
  | "campfire"
  | "fishing_spot"
  | "gate"
  | "flag"
  | "bones"
  | "candles"
  | "ritual_circle"
  | "ember";

export interface MapDecoration {
  type?: DecorationCategory;
  category?: DecorationCategory;
  pos: Position;
  variant?: number | string;
  size?: number;
  scale?: number;
}

// Hazard types
export type HazardType =
  | "quicksand"
  | "ice_sheet"
  | "lava_geyser"
  | "eruption_zone"
  | "poison_fog"
  | "deep_water"
  | "slippery_ice"
  | "lava"
  | "swamp"
  | "ice"
  | "poison"
  | "fire"
  | "lightning"
  | "void"
  | "spikes";

export interface MapHazard {
  type: HazardType;
  pos?: Position;
  gridPos?: GridPosition;
  radius?: number;
  size?: number;
}

// Special tower types for map objectives
export type SpecialTowerType = "vault" | "beacon" | "shrine" | "barracks";

export interface SpecialTower {
  pos: { x: number; y: number };
  type: SpecialTowerType;
  hp?: number;
}

// Level data definition
export interface LevelData {
  name: string;
  position: { x: number; y: number };
  description: string;
  camera: {
    offset: { x: number; y: number };
    zoom: number;
  };
  region: string;
  theme: MapTheme;
  difficulty: 1 | 2 | 3;
  startingPawPoints: number;
  previewImage?: string;
  dualPath?: boolean;
  secondaryPath?: string;
  specialTower?: SpecialTower;
  decorations?: MapDecoration[];
  hazards?: MapHazard[];
}

// Region theme colors
export interface RegionTheme {
  ground: string;
  groundAlt: string;
  road: string;
  roadEdge: string;
  accent: string;
  fog?: string;
}

// ============================================================================
// UI & GAME STATE TYPES
// ============================================================================

// Game state
export type GameState =
  | "menu"
  | "worldmap"
  | "setup"
  | "playing"
  | "paused"
  | "victory"
  | "defeat";

// Codex tabs
export type CodexTab = "towers" | "enemies" | "heroes" | "spells";

// Tower upgrade info for UI
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
    | "tower-range"
    | "special-building"
    | "decoration";
  data: unknown;
  isoY: number;
}

// ============================================================================
// DECORATION TYPES
// ============================================================================

export type DecorationType =
  | "tree"
  | "rock"
  | "bush"
  | "crater"
  | "debris"
  | "cart"
  | "hut"
  | "fire"
  | "sword"
  | "arrow"
  | "skeleton"
  | "barrel"
  | "fence"
  | "gravestone"
  | "tent"
  | "grass"
  | "palm"
  | "cactus"
  | "dune"
  | "pyramid"
  | "obelisk"
  | "pine"
  | "snowman"
  | "ice_crystal"
  | "snow_pile"
  | "lava_pool"
  | "obsidian_spike"
  | "charred_tree"
  | "ember"
  | "swamp_tree"
  | "mushroom"
  | "lily_pad"
  | "fog_wisp"
  | "ruins"
  | "bones"
  | "torch"
  | "statue"
  | "nassau_hall"
  | "deep_water"
  | "flowers"
  | "signpost"
  | "fountain"
  | "bench"
  | "lamppost"
  | "witch_cottage"
  | "cauldron"
  | "tentacle"
  | "giant_sphinx"
  | "sphinx"
  | "oasis_pool"
  | "ice_fortress"
  | "ice_throne"
  | "obsidian_castle"
  | "dark_throne"
  | "dark_barracks"
  | "dark_spire"
  | "icicles"
  | "frozen_pond"
  | "frozen_gate"
  | "broken_wall"
  | "frozen_soldier"
  | "battle_crater"
  | "demon_statue"
  | "fire_pit"
  | "lily_pads"
  | "mushroom_cluster"
  | "fog_patch"
  | "ruined_temple"
  | "sunken_pillar"
  | "idol_statue"
  | "skeleton_pile"
  | "tombstone"
  | "broken_bridge"
  | "frog";

export interface Decoration {
  type: DecorationType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  variant: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Maximum troops per station
export const MAX_STATION_TROOPS = 3;

// Spawn positions relative to station world position
export const STATION_SPAWN_OFFSETS = [
  { x: -1.5, y: 1.5 }, // Slot 0: Left position
  { x: 0, y: 2 }, // Slot 1: Center position
  { x: 1.5, y: 1.5 }, // Slot 2: Right position
];
