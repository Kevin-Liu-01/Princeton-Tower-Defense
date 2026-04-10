"use client";
import {
  Star,
  Book,
  Shield,
  ChessRook,
  Zap,
  Swords,
  Crown,
  X,
  Skull,
  Flag,
  Heart,
  Target,
  Flame,
  Sparkles,
  ChevronRight,
  Wind,
  ArrowUp,
  Info,
  Timer,
  Coins,
  Gauge,
  Clock,
  Snowflake,
  Users,
  TrendingUp,
  Crosshair,
  CircleDot,
  Banknote,
  Radio,
  Volume2,
  CircleOff,
  TrendingDown,
  Music,
  Droplets,
  Ban,
  Eye,
  EyeOff,
  AlertTriangle,
  Footprints,
  Plane,
  Sun,
  Bug,
  TreePine,
  Compass,
  Bird,
  Leaf,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useRef, useCallback } from "react";

import {
  HERO_DATA,
  SPELL_DATA,
  TOWER_DATA,
  ENEMY_DATA,
  HERO_ABILITY_COOLDOWNS,
  TROOP_DATA,
  LEVEL_DATA,
  LEVEL_WAVES,
  MAP_PATHS,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getHexWardSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
  INITIAL_LIVES,
  INITIAL_PAW_POINTS,
  WAVE_TIMER_BASE,
  SENTINEL_NEXUS_STATS,
  SUNFORGE_ORRERY_STATS,
  ARMORED_THRESHOLD,
  FAST_SPEED_THRESHOLD,
  DEFAULT_ENEMY_TROOP_ATTACK_SPEED,
  DEFAULT_ENEMY_TROOP_DAMAGE,
  HERO_ROLES,
  HERO_COLOR_NAMES,
  ENEMY_TRAIT_META,
  ENEMY_ABILITY_META,
  ENEMY_CATEGORY_META,
  ENEMY_CATEGORY_ORDER,
  ENEMY_CATEGORY_ACCENTS,
  groupEnemiesByCategory,
  hasRegionalVariants,
  getRegionalVariantThemes,
  getThemeLabel,
  TOWER_CATEGORIES,
  TOWER_TAGS,
  TOWER_QUICK_SUMMARY,
} from "../../constants";
import { calculateTowerStats, TOWER_STATS } from "../../constants/towerStats";
import {
  KNIGHT_VARIANT_LABELS,
  KNIGHT_COLOR_VARIATIONS,
} from "../../rendering/troops/knightThemes";
import {
  CODEX_REINFORCEMENT_VARIANTS,
  REINFORCEMENT_TIER_COUNT,
  REINFORCEMENT_TIER_LABELS,
} from "../../rendering/troops/reinforcementThemes";
import {
  TowerSprite,
  HeroSprite,
  TroopSprite,
  EnemySprite,
  SpellSprite,
  HeroAbilityIcon,
  HeroIcon,
  SpellIcon,
  SpecialTowerSprite,
  HazardSprite,
} from "../../sprites";
import {
  buildThemeFromAccent,
  TOWER_SPRITE_FRAME_THEME,
  SPECIAL_TOWER_SPRITE_THEME,
  HAZARD_SPRITE_THEME,
  SPELL_SPRITE_FRAME_THEME,
  getEnemySpriteFrameTheme,
  FramedSprite,
} from "../../sprites/shared";
import type { SpriteFrameTheme } from "../../sprites/shared";
import type {
  HeroType,
  TroopType,
  SpellType,
  EnemyTrait,
  EnemyCategory,
  HazardType,
  SpecialTowerType,
  MapTheme,
} from "../../types";
import { BaseModal } from "../ui/primitives/BaseModal";
import { OrnateFrame } from "../ui/primitives/OrnateFrame";
import { TagBadge } from "../ui/primitives/TagBadge";
import { PANEL, GOLD, OVERLAY, panelGradient } from "../ui/system/theme";

// =============================================================================
// GAMEPLAY REGION IMAGES
// =============================================================================

const REGION_IMAGES = [
  {
    alt: "Princeton Grounds",
    label: "Grounds",
    src: "/images/new/gameplay_grounds.png",
  },
  {
    alt: "Murky Marshes",
    label: "Swamp",
    src: "/images/new/gameplay_swamp.png",
  },
  {
    alt: "Sahara Sands",
    label: "Desert",
    src: "/images/new/gameplay_desert.png",
  },
  {
    alt: "Frozen Frontier",
    label: "Winter",
    src: "/images/new/gameplay_winter.png",
  },
  {
    alt: "Volcanic Depths",
    label: "Volcanic",
    src: "/images/new/gameplay_volcano.png",
  },
] as const;

// =============================================================================
// CODEX HELPER FUNCTIONS
// =============================================================================

// Trait icon factory - icons are JSX so they must live in the component file
const TRAIT_ICONS: Record<EnemyTrait, (size: number) => React.ReactNode> = {
  aoe_attack: (s) => <Target size={s} />,
  armored: (s) => <Shield size={s} />,
  boss: (s) => <Crown size={s} />,
  breakthrough: (s) => <Zap size={s} />,
  fast: (s) => <Footprints size={s} />,
  flying: (s) => <Wind size={s} />,
  magic_resist: (s) => <Sparkles size={s} />,
  ranged: (s) => <Crosshair size={s} />,
  regenerating: (s) => <Heart size={s} />,
  summoner: (s) => <Users size={s} />,
  tower_debuffer: (s) => <TrendingDown size={s} />,
};

const getTraitInfo = (trait: EnemyTrait, iconSize = 12) => {
  const meta = ENEMY_TRAIT_META[trait] ?? {
    color: "text-gray-400",
    desc: "Unknown trait",
    label: trait,
    pillColor: "",
  };
  const iconFn = TRAIT_ICONS[trait];
  return {
    ...meta,
    icon: iconFn ? iconFn(iconSize) : <Info size={iconSize} />,
  };
};

// Ability icon factory - icons are JSX
const ABILITY_ICONS: Record<string, (size: number) => React.ReactNode> = {
  burn: (s) => <Flame size={s} />,
  poison: (s) => <Droplets size={s} />,
  slow: (s) => <Snowflake size={s} />,
  stun: (s) => <Zap size={s} />,
  tower_blind: (s) => <EyeOff size={s} />,
  tower_disable: (s) => <Ban size={s} />,
  tower_slow: (s) => <Timer size={s} />,
  tower_weaken: (s) => <TrendingDown size={s} />,
};

const getAbilityInfo = (abilityType: string, iconSize = 14) => {
  const meta =
    ENEMY_ABILITY_META[abilityType as keyof typeof ENEMY_ABILITY_META] ??
    ENEMY_ABILITY_META.default;
  const iconFn = ABILITY_ICONS[abilityType];
  return {
    ...meta,
    icon: iconFn ? iconFn(iconSize) : <AlertTriangle size={iconSize} />,
  };
};

// Hero role icons (JSX, must live locally)
const HERO_ROLE_ICONS: Record<HeroType, (size: number) => React.ReactNode> = {
  captain: (s) => <Users size={s} />,
  engineer: (s) => <CircleDot size={s} />,
  ivy: (s) => <Leaf size={s} />,
  mathey: (s) => <Shield size={s} />,
  nassau: (s) => <Bird size={s} />,
  rocky: (s) => <Target size={s} />,
  scott: (s) => <TrendingUp size={s} />,
  tenor: (s) => <Volume2 size={s} />,
  tiger: (s) => <Swords size={s} />,
};

// Category icons (JSX, must live locally)
const CATEGORY_ICONS: Record<EnemyCategory, React.ReactNode> = {
  academic: <Book size={16} />,
  campus: <Flag size={16} />,
  dark_fantasy: <Skull size={16} />,
  desert: <Sun size={16} />,
  flying: <Wind size={16} />,
  forest: <TreePine size={16} />,
  insectoid: <Bug size={16} />,
  ranged: <Crosshair size={16} />,
  region_boss: <Crown size={16} />,
  swamp: <Droplets size={16} />,
  volcanic: <Flame size={16} />,
  winter: <Snowflake size={16} />,
};

export type CodexTabId =
  | "towers"
  | "heroes"
  | "troops"
  | "enemies"
  | "spells"
  | "special_towers"
  | "hazards"
  | "guide";

const SPECIAL_TOWER_ORDER: SpecialTowerType[] = [
  "vault",
  "beacon",
  "shrine",
  "barracks",
  "chrono_relay",
  "sentinel_nexus",
  "sunforge_orrery",
];

const SPECIAL_TOWER_INFO: Record<
  SpecialTowerType,
  {
    name: string;
    role: string;
    icon: React.ReactNode;
    color: string;
    panelClass: string;
    effect: string;
    numbers: string;
    tip: string;
  }
> = {
  barracks: {
    color: "text-red-300",
    effect: "Automatically deploys knight troops onto the road.",
    icon: <Users size={16} />,
    name: "Frontier Barracks",
    numbers: "Spawns every 12s, capped at 3 active knights",
    panelClass: "bg-red-950/35 border-red-800/40",
    role: "Auto Reinforcement",
    tip: "Use rally micro to keep spawned knights at high-traffic choke points.",
  },
  beacon: {
    color: "text-cyan-300",
    effect: "Buffs nearby towers and station troop deployment distance.",
    icon: <Zap size={16} />,
    name: "Ancient Beacon",
    numbers: "+20% range/deploy in 250 radius",
    panelClass: "bg-cyan-950/35 border-cyan-800/40",
    role: "Range Aura",
    tip: "Stack splash towers so one beacon buffs multiple lanes.",
  },
  chrono_relay: {
    color: "text-indigo-300",
    effect: "Synchronizes nearby towers to faster firing cadence.",
    icon: <Clock size={16} />,
    name: "Arcane Time Crystal",
    numbers: "+25% attack speed in 220 radius",
    panelClass: "bg-indigo-950/35 border-indigo-800/40",
    role: "Attack Speed Aura",
    tip: "Best with high base DPS towers, especially chain and splash builds.",
  },
  sentinel_nexus: {
    color: "text-rose-300",
    effect: "Calls periodic lightning strikes at a locked coordinate.",
    icon: <Target size={16} />,
    name: "Imperial Sentinel",
    numbers: `Every ${SENTINEL_NEXUS_STATS.strikeIntervalMs / 1000}s: up to ${SENTINEL_NEXUS_STATS.damage} damage in ${SENTINEL_NEXUS_STATS.radius} radius + short stun`,
    panelClass: "bg-rose-950/35 border-rose-800/40",
    role: "Retargetable Strike",
    tip: "Retarget onto spawn exits or boss path corners for highest value.",
  },
  shrine: {
    color: "text-green-300",
    effect: "Pulses healing to the hero and nearby troops.",
    icon: <Sparkles size={16} />,
    name: "Eldritch Shrine",
    numbers: "+50 HP every 5s in 200 radius",
    panelClass: "bg-green-950/35 border-green-800/40",
    role: "Sustain Aura",
    tip: "Anchor your frontline near shrine radius to outlast attrition.",
  },
  sunforge_orrery: {
    color: "text-orange-300",
    effect: "Scans for dense enemy clusters and fires tri-plasma barrages.",
    icon: <Flame size={16} />,
    name: "Sunforge Orrery",
    numbers: `Every ${SUNFORGE_ORRERY_STATS.barrageIntervalMs / 1000}s: up to ${SUNFORGE_ORRERY_STATS.directDamage} direct damage + ${SUNFORGE_ORRERY_STATS.burnDps} DPS burn (${(SUNFORGE_ORRERY_STATS.burnDurationMs / 1000).toFixed(1)}s) per volley`,
    panelClass: "bg-orange-950/35 border-orange-800/40",
    role: "Cluster Erasure",
    tip: "Pair with slows and path intersections to maximize cluster density.",
  },
  vault: {
    color: "text-yellow-300",
    effect:
      "Enemies can target this structure. If it falls, you immediately lose 10 lives.",
    icon: <Banknote size={16} />,
    name: "Treasury Vault",
    numbers: "Objective HP varies by map (typically 420-1000)",
    panelClass: "bg-yellow-950/35 border-yellow-800/40",
    role: "Objective",
    tip: "Build crowd control near vault approach lanes first.",
  },
};

type CodexHazardType =
  | "poison_fog"
  | "deep_water"
  | "maelstrom"
  | "storm_field"
  | "quicksand"
  | "ice_sheet"
  | "ice_spikes"
  | "lava_geyser"
  | "volcano"
  | "swamp"
  | "fire"
  | "lightning"
  | "void"
  | "lava";

const HAZARD_ORDER: CodexHazardType[] = [
  "poison_fog",
  "deep_water",
  "maelstrom",
  "storm_field",
  "quicksand",
  "ice_sheet",
  "ice_spikes",
  "lava_geyser",
  "volcano",
  "swamp",
  "fire",
  "lightning",
  "void",
  "lava",
];

const HAZARD_INFO: Record<
  CodexHazardType,
  {
    name: string;
    icon: React.ReactNode;
    color: string;
    panelClass: string;
    effect: string;
    numbers: string;
    counterplay: string;
  }
> = {
  deep_water: {
    color: "text-blue-300",
    counterplay:
      "Cover entry/exit points so enemies stay in water longer. Keep troops clear.",
    effect: "Drags and drowns all units moving through water.",
    icon: <Droplets size={16} />,
    name: "Deep Water",
    numbers: "4-9 DPS and up to 38% slow",
    panelClass: "bg-blue-950/35 border-blue-800/40",
  },
  fire: {
    color: "text-orange-400",
    counterplay:
      "High sustained damage — keep friendlies out and let enemies burn.",
    effect: "Continuous flames scorch everything in the area.",
    icon: <Flame size={16} />,
    name: "Hellfire Zone",
    numbers: "10 fire DPS to all units",
    panelClass: "bg-orange-950/35 border-orange-700/40",
  },
  ice_sheet: {
    color: "text-cyan-300",
    counterplay:
      "Preload damage before the sheet and finish immediately after it.",
    effect: "Slick terrain that accelerates all unit movement.",
    icon: <Snowflake size={16} />,
    name: "Ice Sheet",
    numbers: "+60% movement speed",
    panelClass: "bg-cyan-950/35 border-cyan-800/40",
  },
  ice_spikes: {
    color: "text-blue-300",
    counterplay:
      "Time freezes/stuns so enemies remain on spikes during active phases.",
    effect:
      "Phase-based burst trap that damages and slows all units in cycles.",
    icon: <Snowflake size={16} />,
    name: "Ice Spikes",
    numbers: "Up to ~30 DPS and up to 45% slow when fully extended",
    panelClass: "bg-blue-950/35 border-blue-800/40",
  },
  lava: {
    color: "text-red-300",
    counterplay:
      "Low but persistent damage — avoid leaving troops on it long-term.",
    effect: "Bubbling magma periodically splashes all nearby units.",
    icon: <Flame size={16} />,
    name: "Lava Pool",
    numbers: "4 fire damage per splash tick",
    panelClass: "bg-red-950/35 border-red-700/40",
  },
  lava_geyser: {
    color: "text-orange-300",
    counterplay:
      "Treat as bonus chip damage and avoid relying on it for consistent clears.",
    effect: "Random eruptions apply burst fire damage to all units.",
    icon: <Flame size={16} />,
    name: "Lava Geyser",
    numbers: "5 fire damage per eruption tick",
    panelClass: "bg-orange-950/35 border-orange-800/40",
  },
  lightning: {
    color: "text-yellow-300",
    counterplay:
      "Unpredictable burst — avoid stationing troops in the strike zone.",
    effect: "Sporadic high-voltage strikes blast all units in the zone.",
    icon: <Zap size={16} />,
    name: "Lightning Field",
    numbers: "18 burst damage per lightning strike",
    panelClass: "bg-yellow-950/35 border-yellow-700/40",
  },
  maelstrom: {
    color: "text-cyan-300",
    counterplay:
      "Route boss pressure through maelstrom zones — but keep friendlies away.",
    effect:
      "Heavy vortex with strong crush damage and movement loss to all units.",
    icon: <Wind size={16} />,
    name: "Maelstrom",
    numbers: "8-20 DPS and up to 55% slow",
    panelClass: "bg-cyan-950/35 border-cyan-800/40",
  },
  poison_fog: {
    color: "text-green-300",
    counterplay:
      "Use slows/stuns at fog edge so enemies exit slowly while still taking damage.",
    effect: "Constant damage-over-time zone affecting all units.",
    icon: <Droplets size={16} />,
    name: "Poison Fog",
    numbers: "15 DPS while inside",
    panelClass: "bg-green-950/35 border-green-800/40",
  },
  quicksand: {
    color: "text-yellow-300",
    counterplay: "Use as pseudo-chokepoints for artillery and chain towers.",
    effect: "Movement suppression zone affecting all units.",
    icon: <TrendingDown size={16} />,
    name: "Quicksand",
    numbers: "50% movement slow",
    panelClass: "bg-yellow-950/35 border-yellow-800/40",
  },
  storm_field: {
    color: "text-sky-300",
    counterplay:
      "Place burst towers right after storm exits for fast-moving enemies.",
    effect: "Electrified air hastens movement but shocks all units.",
    icon: <Zap size={16} />,
    name: "Storm Field",
    numbers: "+15% move speed and 6 DPS",
    panelClass: "bg-sky-950/35 border-sky-800/40",
  },
  swamp: {
    color: "text-lime-300",
    counterplay:
      "Combines damage with slow — position towers to exploit the dwell time.",
    effect: "Corrosive mire poisons and bogs down all units.",
    icon: <Droplets size={16} />,
    name: "Toxic Swamp",
    numbers: "6 DPS poison + 35% movement slow",
    panelClass: "bg-lime-950/35 border-lime-800/40",
  },
  void: {
    color: "text-purple-300",
    counterplay:
      "Treat like a weaker maelstrom — towers near exits maximize damage on slowed foes.",
    effect: "Dimensional tear drains life and slows all units.",
    icon: <CircleOff size={16} />,
    name: "Void Rift",
    numbers: "8 DPS + 30% movement slow",
    panelClass: "bg-purple-950/35 border-purple-800/40",
  },
  volcano: {
    color: "text-red-400",
    counterplay:
      "Keep troops and heroes clear — this is lethal to friendlies too.",
    effect: "Devastating eruptions hurl molten rock at all nearby units.",
    icon: <Flame size={16} />,
    name: "Volcano",
    numbers: "15 fire damage per eruption burst",
    panelClass: "bg-red-950/35 border-red-800/40",
  },
};

const normalizeHazardType = (type: HazardType): CodexHazardType | null => {
  if (type === "spikes") {
    return "ice_spikes";
  }
  if (type === "eruption_zone") {
    return "lava_geyser";
  }
  if (type === "slippery_ice" || type === "ice") {
    return "ice_sheet";
  }
  if (type === "poison") {
    return "poison_fog";
  }
  if (type in HAZARD_INFO) {
    return type as CodexHazardType;
  }
  return null;
};

const getHeroSpriteFrameTheme = (type: HeroType): SpriteFrameTheme =>
  buildThemeFromAccent(HERO_DATA[type].color || "#f59e0b");

const getTroopSpriteFrameTheme = (type: TroopType): SpriteFrameTheme =>
  buildThemeFromAccent(TROOP_DATA[type]?.color || "#708090");

const TROOP_DISPLAY_ORDER: TroopType[] = [
  "footsoldier",
  "armored",
  "elite",
  "knight",
  "centaur",
  "cavalry",
  "reinforcement",
  "turret",
  "thesis",
  "rowing",
  "hexling",
  "hexseer",
];

const TROOP_CATEGORY_MAP: Record<
  string,
  { label: string; color: string; types: TroopType[] }
> = {
  station: {
    color: "text-amber-300",
    label: "Station Garrison",
    types: ["footsoldier", "armored", "elite", "knight", "centaur", "cavalry"],
  },
  summoned: {
    color: "text-purple-300",
    label: "Summoned Units",
    types: ["reinforcement", "turret"],
  },
  hex: {
    color: "text-fuchsia-300",
    label: "Hex Ward Spirits",
    types: ["thesis", "rowing", "hexling", "hexseer"],
  },
};

const FramedCodexSprite = FramedSprite;

const KNIGHT_CODEX_VISUALS: { bg: string; border: string }[] = [
  { bg: "rgba(100,107,129,0.5)", border: "rgba(172,178,198,0.5)" },
  { bg: "rgba(72,78,96,0.5)", border: "rgba(148,154,172,0.5)" },
  { bg: "rgba(106,112,136,0.5)", border: "rgba(216,220,232,0.55)" },
];

const REINFORCEMENT_CODEX_VISUALS: { bg: string; border: string }[] = [
  { bg: "rgba(91,58,112,0.5)", border: "rgba(156,108,232,0.5)" },
  { bg: "rgba(72,72,120,0.5)", border: "rgba(132,152,236,0.5)" },
  { bg: "rgba(60,80,108,0.5)", border: "rgba(104,182,236,0.5)" },
  { bg: "rgba(46,80,80,0.5)", border: "rgba(109,224,203,0.5)" },
  { bg: "rgba(78,68,55,0.5)", border: "rgba(200,170,100,0.5)" },
];

const KNIGHT_COLOR_BUTTON_VISUALS: { bg: string; border: string }[] = [
  { bg: "rgba(180,120,40,0.5)", border: "rgba(234,179,8,0.5)" },
  { bg: "rgba(40,80,160,0.5)", border: "rgba(96,165,250,0.5)" },
  { bg: "rgba(100,40,120,0.5)", border: "rgba(168,85,247,0.5)" },
  { bg: "rgba(160,40,40,0.5)", border: "rgba(248,113,113,0.5)" },
];

const REINFORCEMENT_TIER_VISUALS: { bg: string; border: string }[] = [
  { bg: "rgba(90,75,110,0.5)", border: "rgba(156,108,232,0.5)" },
  { bg: "rgba(90,94,136,0.5)", border: "rgba(132,152,236,0.5)" },
  { bg: "rgba(78,109,147,0.5)", border: "rgba(104,182,236,0.5)" },
  { bg: "rgba(77,111,121,0.5)", border: "rgba(109,224,203,0.5)" },
  { bg: "rgba(112,102,72,0.5)", border: "rgba(246,212,110,0.5)" },
  { bg: "rgba(111,94,43,0.5)", border: "rgba(255,195,88,0.5)" },
  { bg: "rgba(138,144,164,0.5)", border: "rgba(210,220,255,0.5)" },
];

// =============================================================================
// CODEX UI HELPERS
// =============================================================================

const COLOR_MAP: Record<
  string,
  {
    headerBg: string;
    headerBorder: string;
    text: string;
    statBg: string;
    statBorder: string;
    statText: string;
    barBg: string;
    chipBg: string;
    chipBorder: string;
  }
> = {
  amber: {
    barBg: "bg-amber-500/70",
    chipBg: "bg-amber-950/50",
    chipBorder: "border-amber-900/40",
    headerBg: "bg-amber-950/50",
    headerBorder: "border-amber-800/30",
    statBg: "bg-amber-950/40",
    statBorder: "border-amber-800/30",
    statText: "text-amber-300",
    text: "text-amber-400",
  },
  blue: {
    barBg: "bg-blue-500/70",
    chipBg: "bg-blue-950/50",
    chipBorder: "border-blue-900/40",
    headerBg: "bg-blue-950/50",
    headerBorder: "border-blue-800/30",
    statBg: "bg-blue-950/40",
    statBorder: "border-blue-800/30",
    statText: "text-blue-300",
    text: "text-blue-400",
  },
  cyan: {
    barBg: "bg-cyan-500/70",
    chipBg: "bg-cyan-950/50",
    chipBorder: "border-cyan-900/40",
    headerBg: "bg-cyan-950/50",
    headerBorder: "border-cyan-800/30",
    statBg: "bg-cyan-950/40",
    statBorder: "border-cyan-800/30",
    statText: "text-cyan-300",
    text: "text-cyan-400",
  },
  green: {
    barBg: "bg-green-500/70",
    chipBg: "bg-green-950/50",
    chipBorder: "border-green-900/40",
    headerBg: "bg-green-950/50",
    headerBorder: "border-green-800/30",
    statBg: "bg-green-950/40",
    statBorder: "border-green-800/30",
    statText: "text-green-300",
    text: "text-green-400",
  },
  orange: {
    barBg: "bg-orange-500/70",
    chipBg: "bg-orange-950/50",
    chipBorder: "border-orange-900/40",
    headerBg: "bg-orange-950/50",
    headerBorder: "border-orange-800/30",
    statBg: "bg-orange-950/40",
    statBorder: "border-orange-800/30",
    statText: "text-orange-300",
    text: "text-orange-400",
  },
  purple: {
    barBg: "bg-purple-500/70",
    chipBg: "bg-purple-950/50",
    chipBorder: "border-purple-900/40",
    headerBg: "bg-purple-950/50",
    headerBorder: "border-purple-800/30",
    statBg: "bg-purple-950/40",
    statBorder: "border-purple-800/30",
    statText: "text-purple-300",
    text: "text-purple-400",
  },
  red: {
    barBg: "bg-red-500/70",
    chipBg: "bg-red-950/50",
    chipBorder: "border-red-900/40",
    headerBg: "bg-red-950/50",
    headerBorder: "border-red-800/30",
    statBg: "bg-red-950/40",
    statBorder: "border-red-800/30",
    statText: "text-red-300",
    text: "text-red-400",
  },
  stone: {
    barBg: "bg-stone-500/70",
    chipBg: "bg-stone-950/50",
    chipBorder: "border-stone-900/40",
    headerBg: "bg-stone-950/50",
    headerBorder: "border-stone-800/30",
    statBg: "bg-stone-950/40",
    statBorder: "border-stone-800/30",
    statText: "text-stone-300",
    text: "text-stone-400",
  },
  yellow: {
    barBg: "bg-yellow-500/70",
    chipBg: "bg-yellow-950/50",
    chipBorder: "border-yellow-900/40",
    headerBg: "bg-yellow-950/50",
    headerBorder: "border-yellow-800/30",
    statBg: "bg-yellow-950/40",
    statBorder: "border-yellow-800/30",
    statText: "text-yellow-300",
    text: "text-yellow-400",
  },
};

const getColorClasses = (color: string) => COLOR_MAP[color] || COLOR_MAP.amber;

const TOWER_COLOR: Record<string, string> = Object.fromEntries(
  Object.entries(TOWER_CATEGORIES).map(([k, v]) => [k, v.colorName])
);

const calculateDPS = (damage: number, attackSpeed: number): number => {
  if (attackSpeed <= 0 || damage <= 0) {
    return 0;
  }
  return damage / (attackSpeed / 1000);
};

const StatBar: React.FC<{
  value: number;
  max: number;
  color: string;
  label: string;
  displayValue: string;
  icon: React.ReactNode;
}> = ({ value, max, color, label, displayValue, icon }) => {
  const pct = Math.min(100, Math.max(3, (value / max) * 100));
  const cc = getColorClasses(color);
  return (
    <div className="flex items-center gap-2.5">
      <div className={`flex items-center gap-1.5 w-[68px] shrink-0 ${cc.text}`}>
        {icon}
        <span className="text-xs uppercase tracking-wide font-semibold">
          {label}
        </span>
      </div>
      <div className="flex-1 h-2 rounded-full bg-stone-800/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${cc.barBg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-12 text-right font-bold text-sm ${cc.statText}`}>
        {displayValue}
      </span>
    </div>
  );
};

const DPSBadge: React.FC<{ dps: number; size?: "sm" | "md" }> = ({
  dps,
  size = "md",
}) => (
  <div
    className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-950/60 to-orange-950/40 border border-red-800/40 ${size === "sm" ? "px-2 py-1" : "px-3 py-1.5"}`}
  >
    <Flame size={size === "sm" ? 12 : 14} className="text-orange-400" />
    <span
      className={`text-stone-400 uppercase font-medium ${size === "sm" ? "text-[10px]" : "text-xs"}`}
    >
      DPS
    </span>
    <span
      className={`font-bold text-orange-300 ${size === "sm" ? "text-xs" : "text-base"}`}
    >
      {dps.toFixed(1)}
    </span>
  </div>
);

const HPBar: React.FC<{ hp: number; maxHp: number; isBoss?: boolean }> = ({
  hp,
  maxHp,
  isBoss,
}) => {
  const pct = Math.min(100, Math.max(3, (hp / maxHp) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Heart
            size={12}
            className={isBoss ? "text-purple-400" : "text-red-400"}
          />
          <span
            className={`text-xs font-semibold ${isBoss ? "text-purple-400" : "text-red-400"}`}
          >
            HP
          </span>
        </div>
        <span
          className={`text-sm font-bold ${isBoss ? "text-purple-300" : "text-red-300"}`}
        >
          {hp.toLocaleString()}
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-800/60 overflow-hidden">
        <div
          className={`h-full rounded-full ${isBoss ? "bg-gradient-to-r from-purple-500/80 to-rose-500/80" : "bg-gradient-to-r from-red-600/70 to-red-400/70"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// =============================================================================
// CODEX MODAL
// =============================================================================

interface CodexModalProps {
  onClose: () => void;
  defaultTab?: CodexTabId;
}

export const CodexModal: React.FC<CodexModalProps> = ({
  onClose,
  defaultTab,
}) => {
  const [activeTab, setActiveTab] = useState<CodexTabId>(
    defaultTab ?? "towers"
  );
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedHeroDetail, setSelectedHeroDetail] = useState<string | null>(
    null
  );
  const [categoryNavOpen, setCategoryNavOpen] = useState(false);
  const [enemyRegionPreview, setEnemyRegionPreview] = useState<
    Record<string, MapTheme | null>
  >({});
  const [troopVariantPreview, setTroopVariantPreview] = useState<
    Record<string, number>
  >({});
  const [troopColorPreview, setTroopColorPreview] = useState<
    Record<string, number>
  >({});
  const towerTypes = Object.keys(TOWER_DATA) as (keyof typeof TOWER_DATA)[];
  const heroTypes = Object.keys(HERO_DATA) as HeroType[];
  const troopTypes = TROOP_DISPLAY_ORDER;
  const enemyTypes = Object.keys(ENEMY_DATA) as (keyof typeof ENEMY_DATA)[];
  const spellTypes = Object.keys(SPELL_DATA) as SpellType[];

  const enemyScrollRef = useRef<HTMLDivElement>(null);
  const categorySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const setCategoryRef = useCallback(
    (category: string, el: HTMLDivElement | null) => {
      categorySectionRefs.current[category] = el;
    },
    []
  );
  const scrollToCategory = useCallback((category: string) => {
    const el = categorySectionRefs.current[category];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);
  const levelEntries = Object.entries(LEVEL_DATA);
  const challengeLevelCount = levelEntries.filter(
    ([, level]) => level.levelKind === "challenge"
  ).length;
  const campaignLevelCount = levelEntries.length - challengeLevelCount;
  const dualPathLevelCount = levelEntries.filter(
    ([, level]) => level.dualPath
  ).length;

  const specialTowerLevels = new Map<SpecialTowerType, Set<string>>();
  const specialTowerInstanceCounts = new Map<SpecialTowerType, number>();
  let totalSpecialTowerInstances = 0;
  levelEntries.forEach(([, level]) => {
    const currentLevelStructures = [
      ...(level.specialTower ? [level.specialTower] : []),
      ...(level.specialTowers || []),
    ];
    currentLevelStructures.forEach((tower) => {
      totalSpecialTowerInstances += 1;
      const levelSet = specialTowerLevels.get(tower.type) ?? new Set<string>();
      levelSet.add(level.name);
      specialTowerLevels.set(tower.type, levelSet);
      specialTowerInstanceCounts.set(
        tower.type,
        (specialTowerInstanceCounts.get(tower.type) ?? 0) + 1
      );
    });
  });
  const specialTowerTypesInUse = SPECIAL_TOWER_ORDER.filter((type) =>
    specialTowerLevels.has(type)
  );

  const hazardLevels = new Map<CodexHazardType, Set<string>>();
  const hazardZoneCounts = new Map<CodexHazardType, number>();
  let totalHazardZones = 0;
  levelEntries.forEach(([, level]) => {
    (level.hazards || []).forEach((hazard) => {
      const normalizedType = normalizeHazardType(hazard.type);
      if (!normalizedType) {
        return;
      }
      totalHazardZones += 1;
      const levelSet = hazardLevels.get(normalizedType) ?? new Set<string>();
      levelSet.add(level.name);
      hazardLevels.set(normalizedType, levelSet);
      hazardZoneCounts.set(
        normalizedType,
        (hazardZoneCounts.get(normalizedType) ?? 0) + 1
      );
    });
  });
  const hazardTypesInUse = HAZARD_ORDER.filter((type) =>
    hazardLevels.has(type)
  );
  const levelsWithHazards = levelEntries.filter(
    ([, level]) => (level.hazards || []).length > 0
  ).length;
  const levelsWithSpecialStructures = levelEntries.filter(
    ([, level]) => level.specialTower || (level.specialTowers || []).length > 0
  ).length;
  const mostCommonSpecialTowerType =
    specialTowerTypesInUse.length > 0
      ? specialTowerTypesInUse.reduce((best, current) =>
          (specialTowerInstanceCounts.get(current) ?? 0) >
          (specialTowerInstanceCounts.get(best) ?? 0)
            ? current
            : best
        )
      : null;
  const averageSpecialTowersPerSpecialMap =
    levelsWithSpecialStructures > 0
      ? totalSpecialTowerInstances / levelsWithSpecialStructures
      : 0;
  const mostCommonHazardType =
    hazardTypesInUse.length > 0
      ? hazardTypesInUse.reduce((best, current) =>
          (hazardZoneCounts.get(current) ?? 0) >
          (hazardZoneCounts.get(best) ?? 0)
            ? current
            : best
        )
      : null;
  const averageHazardsPerHazardMap =
    levelsWithHazards > 0 ? totalHazardZones / levelsWithHazards : 0;

  const formatKeyLabel = (value: string) =>
    LEVEL_DATA[value]?.name ||
    value
      .replaceAll("_", " ")
      .replaceAll(/\b\w/g, (char) => char.toUpperCase());

  const towersByCost = towerTypes
    .map((type) => ({ cost: TOWER_DATA[type].cost, type }))
    .toSorted((a, b) => a.cost - b.cost);
  const cheapestTower = towersByCost[0];
  const priciestTower = towersByCost.at(-1);
  const averageTowerCost =
    towersByCost.length > 0
      ? towersByCost.reduce((sum, tower) => sum + tower.cost, 0) /
        towersByCost.length
      : 0;
  const level4UpgradeCosts = towerTypes.map((type) => ({
    cost: TOWER_STATS[type]?.level4Cost ?? 0,
    type,
  }));
  const priciestLevel4Upgrade =
    level4UpgradeCosts.length > 0
      ? level4UpgradeCosts.reduce((best, current) =>
          current.cost > best.cost ? current : best
        )
      : null;
  const supportTowerCount = towerTypes.filter((type) => {
    const stats = calculateTowerStats(type, 1, undefined, 1, 1);
    return (
      stats.damage <= 0 ||
      Boolean(stats.income && stats.income > 0) ||
      Boolean(stats.slowAmount && stats.slowAmount > 0)
    );
  }).length;
  const damageTowerCount = towerTypes.filter((type) => {
    const stats = calculateTowerStats(type, 1, undefined, 1, 1);
    return stats.damage > 0;
  }).length;

  const heroCooldownEntries = heroTypes.map((type) => ({
    cooldown: HERO_ABILITY_COOLDOWNS[type] ?? 0,
    type,
  }));
  const averageHeroHp =
    heroTypes.length > 0
      ? heroTypes.reduce((sum, type) => sum + HERO_DATA[type].hp, 0) /
        heroTypes.length
      : 0;
  const averageHeroCooldown =
    heroCooldownEntries.length > 0
      ? heroCooldownEntries.reduce((sum, hero) => sum + hero.cooldown, 0) /
        heroCooldownEntries.length
      : 0;
  const shortestHeroCooldown =
    heroCooldownEntries.length > 0
      ? heroCooldownEntries.reduce((best, current) =>
          current.cooldown < best.cooldown ? current : best
        )
      : null;
  const highestHpHero =
    heroTypes.length > 0
      ? heroTypes.reduce((best, current) =>
          HERO_DATA[current].hp > HERO_DATA[best].hp ? current : best
        )
      : null;
  const longestRangeHero =
    heroTypes.length > 0
      ? heroTypes.reduce((best, current) =>
          HERO_DATA[current].range > HERO_DATA[best].range ? current : best
        )
      : null;
  const rangedHeroCount = heroTypes.filter(
    (type) => HERO_DATA[type].range >= 170
  ).length;

  // ── Stat bar scaling maximums (derived from actual game data) ──
  const heroMaxHp = Math.max(...heroTypes.map((t) => HERO_DATA[t].hp), 1);
  const heroMaxDmg = Math.max(...heroTypes.map((t) => HERO_DATA[t].damage), 1);
  const heroMaxRange = Math.max(...heroTypes.map((t) => HERO_DATA[t].range), 1);
  const heroMaxSpeed = Math.max(...heroTypes.map((t) => HERO_DATA[t].speed), 1);
  const heroMaxAtkRate = Math.max(
    ...heroTypes.map((t) => 1000 / HERO_DATA[t].attackSpeed),
    0.1
  );

  const towerBaseStats = towerTypes.map((t) =>
    calculateTowerStats(t, 1, undefined, 1, 1)
  );
  const towerMaxDmg = Math.max(...towerBaseStats.map((s) => s.damage), 1);
  const towerMaxRange = Math.max(
    ...towerBaseStats.filter((s) => s.range > 0).map((s) => s.range),
    1
  );
  const towerMaxSlow = Math.max(
    ...towerBaseStats.map((s) => (s.slowAmount || 0) * 100),
    1
  );
  const towerMaxIncome = Math.max(
    ...towerBaseStats.map((s) => s.income || 0),
    1
  );

  const towerAllLevelStats = towerTypes.flatMap((t) =>
    [1, 2, 3]
      .map((lvl) => calculateTowerStats(t, lvl, undefined, 1, 1))
      .concat(
        ["A", "B"].map((p) => calculateTowerStats(t, 4, p as "A" | "B", 1, 1))
      )
  );
  const towerGlobalMaxDmg = Math.max(
    ...towerAllLevelStats.map((s) => s.damage),
    1
  );
  const towerGlobalMaxRange = Math.max(
    ...towerAllLevelStats.filter((s) => s.range > 0).map((s) => s.range),
    1
  );
  const towerGlobalMaxAtkRate = Math.max(
    ...towerAllLevelStats
      .filter((s) => s.attackSpeed > 0)
      .map((s) => 1000 / s.attackSpeed),
    0.1
  );
  const towerGlobalMaxIncome = Math.max(
    ...towerAllLevelStats.map((s) => s.income || 0),
    1
  );
  const towerGlobalMaxIncomeRate = Math.max(
    ...towerAllLevelStats
      .filter((s) => s.incomeInterval && s.incomeInterval > 0)
      .map((s) => 1000 / (s.incomeInterval || 8000)),
    0.05
  );
  const towerGlobalMaxSlow = Math.max(
    ...towerAllLevelStats.map((s) => (s.slowAmount || 0) * 100),
    1
  );

  const troopDataValues = Object.values(TROOP_DATA);
  const troopMaxHp = Math.max(...troopDataValues.map((t) => t.hp), 1);
  const troopMaxDmg = Math.max(...troopDataValues.map((t) => t.damage), 1);
  const troopMaxAtkRate = Math.max(
    ...troopDataValues.map((t) => 1000 / t.attackSpeed),
    0.1
  );

  const enemyMaxBounty = Math.max(
    ...enemyTypes.map((t) => ENEMY_DATA[t].bounty),
    1
  );
  const enemyMaxSpeed = Math.max(
    ...enemyTypes.map((t) => ENEMY_DATA[t].speed),
    0.1
  );
  const enemyMaxArmor = Math.max(
    ...enemyTypes.map((t) => ENEMY_DATA[t].armor * 100),
    1
  );

  const spellEntries = spellTypes.map((type) => ({
    cooldown: SPELL_DATA[type].cooldown,
    cost: SPELL_DATA[type].cost,
    type,
  }));
  const freeSpellCount = spellEntries.filter(
    (spell) => spell.cost === 0
  ).length;
  const averageSpellCooldown =
    spellEntries.length > 0
      ? spellEntries.reduce((sum, spell) => sum + spell.cooldown, 0) /
        spellEntries.length
      : 0;
  const priciestSpell =
    spellEntries.length > 0
      ? spellEntries.reduce((best, current) =>
          current.cost > best.cost ? current : best
        )
      : null;
  const averageSpellCost =
    spellEntries.length > 0
      ? spellEntries.reduce((sum, spell) => sum + spell.cost, 0) /
        spellEntries.length
      : 0;
  const controlSpellCount = spellTypes.filter(
    (type) =>
      type === "freeze" || type === "hex_ward" || type === "reinforcements"
  ).length;

  const rangedEnemyCount = enemyTypes.filter((type) => {
    const enemy = ENEMY_DATA[type];
    return enemy.category === "ranged" || enemy.traits?.includes("ranged");
  }).length;
  const flyingEnemyCount = enemyTypes.filter((type) => {
    const enemy = ENEMY_DATA[type];
    return enemy.flying || enemy.traits?.includes("flying");
  }).length;
  const armoredEnemyCount = enemyTypes.filter((type) =>
    ENEMY_DATA[type].traits?.includes("armored")
  ).length;
  const regionBossCount = enemyTypes.filter(
    (type) => ENEMY_DATA[type].category === "region_boss"
  ).length;
  const bossEnemyCount = enemyTypes.filter((type) => {
    const enemy = ENEMY_DATA[type];
    return (
      (enemy.isBoss || enemy.traits?.includes("boss")) &&
      enemy.category !== "region_boss"
    );
  }).length;
  const highestLeakEnemy =
    enemyTypes.length > 0
      ? enemyTypes.reduce((best, current) => {
          const bestCost = ENEMY_DATA[best].liveCost ?? 1;
          const currentCost = ENEMY_DATA[current].liveCost ?? 1;
          return currentCost > bestCost ? current : best;
        })
      : null;
  const averageEnemyLeakCost =
    enemyTypes.length > 0
      ? enemyTypes.reduce(
          (sum, type) => sum + (ENEMY_DATA[type].liveCost ?? 1),
          0
        ) / enemyTypes.length
      : 0;

  const mapPathEntries = Object.entries(MAP_PATHS);
  const averagePathNodes =
    mapPathEntries.length > 0
      ? mapPathEntries.reduce((sum, [, path]) => sum + path.length, 0) /
        mapPathEntries.length
      : 0;
  const longestPathEntry =
    mapPathEntries.length > 0
      ? mapPathEntries.reduce((best, current) =>
          current[1].length > best[1].length ? current : best
        )
      : null;
  const shortestPathEntry =
    mapPathEntries.length > 0
      ? mapPathEntries.reduce((best, current) =>
          current[1].length < best[1].length ? current : best
        )
      : null;

  const mapWaveEntries = Object.entries(LEVEL_WAVES);
  const totalConfiguredWaves = mapWaveEntries.reduce(
    (sum, [, waves]) => sum + waves.length,
    0
  );
  const averageWavesPerMap =
    mapWaveEntries.length > 0
      ? totalConfiguredWaves / mapWaveEntries.length
      : 0;
  const waveSummaries = mapWaveEntries.flatMap(([mapKey, waves]) =>
    waves.map((groups, index) => ({
      enemyCount: groups.reduce((sum, group) => sum + group.count, 0),
      groupCount: groups.length,
      leadType: groups[0]?.type ?? null,
      mapKey,
      waveNumber: index + 1,
    }))
  );
  const averageGroupsPerWave =
    waveSummaries.length > 0
      ? waveSummaries.reduce((sum, wave) => sum + wave.groupCount, 0) /
        waveSummaries.length
      : 0;
  const peakGroupWave =
    waveSummaries.length > 0
      ? waveSummaries.reduce((best, current) =>
          current.groupCount > best.groupCount ? current : best
        )
      : null;
  const densestWave =
    waveSummaries.length > 0
      ? waveSummaries.reduce((best, current) =>
          current.enemyCount > best.enemyCount ? current : best
        )
      : null;
  const reinforcementGuideStats = getReinforcementSpellStats(0);
  const featuredHeroTypes = heroTypes.slice(0, 3);
  const featuredEnemyTypes = enemyTypes.slice(0, 4);
  const featuredTowerTypes = towerTypes.slice(0, 4);
  const featuredSpecialTowers = specialTowerTypesInUse.slice(0, 4);
  const featuredHazards = hazardTypesInUse.slice(0, 4);

  const getSpellInfo = (
    type: SpellType
  ): {
    category: string;
    color: string;
    icon: React.ReactNode;
    stats: { label: string; value: string; icon: React.ReactNode }[];
    details: string[];
    tip: string;
  } => {
    switch (type) {
      case "fireball": {
        const stats = getFireballSpellStats(0);
        return {
          category: "Damage",
          color: "orange",
          details: [
            `Impact radius: ${stats.impactRadius}`,
            `Burn duration: ${(stats.burnDurationMs / 1000).toFixed(1)}s`,
            `Cast delay: ${(stats.fallDurationMs / 1000).toFixed(1)}s`,
          ],
          icon: <Flame size={14} />,
          stats: [
            {
              icon: <Users size={12} />,
              label: "Meteors",
              value: `${stats.meteorCount}`,
            },
            {
              icon: <Swords size={12} />,
              label: "Damage",
              value: `${stats.damagePerMeteor}`,
            },
            {
              icon: <Flame size={12} />,
              label: "Burn",
              value: `${stats.burnDamagePerSecond}/s`,
            },
          ],
          tip: "Drop on clustered elites near chokepoints.",
        };
      }
      case "lightning": {
        const stats = getLightningSpellStats(0);
        return {
          category: "Chain",
          color: "yellow",
          details: [
            "Chains from the initial strike target to nearby enemies.",
            "Good for deleting backline casters and fliers together.",
            "Stun helps buy breathing room during leaks.",
          ],
          icon: <Zap size={14} />,
          stats: [
            {
              icon: <Users size={12} />,
              label: "Targets",
              value: `${stats.chainCount}`,
            },
            {
              icon: <Swords size={12} />,
              label: "Total DMG",
              value: `${stats.totalDamage}`,
            },
            {
              icon: <CircleOff size={12} />,
              label: "Stun",
              value: `${(stats.stunDurationMs / 1000).toFixed(2)}s`,
            },
          ],
          tip: "Use after enemies bunch up at turns.",
        };
      }
      case "freeze": {
        const stats = getFreezeSpellStats(0);
        return {
          category: "Control",
          color: "cyan",
          details: [
            "Fully immobilizes enemies for the duration, prioritizing the most advanced threats.",
            "Upgrade to increase the target cap — Tier 5 unlocks full map lockdown.",
            "Pairs well with Sunforge, Sentinel, and Barracks bursts.",
          ],
          icon: <Snowflake size={14} />,
          stats: [
            {
              icon: <Timer size={12} />,
              label: "Duration",
              value: `${(stats.freezeDurationMs / 1000).toFixed(1)}s`,
            },
            {
              icon: <Users size={12} />,
              label: "Max Targets",
              value: stats.isGlobal ? "All" : `${stats.maxTargets}`,
            },
          ],
          tip: "Cast right before your burst windows.",
        };
      }
      case "hex_ward": {
        const stats = getHexWardSpellStats(0);
        return {
          category: "Necromancy",
          color: "purple",
          details: [
            "Marks the most advanced enemies with a lingering harvest sigil.",
            `Can reanimate up to ${stats.maxReanimations} fallen enemies, troops, or heroes as ghost allies during the ward.`,
            "Higher upgrade tiers add curse debuffs like damage amplification and healing denial.",
          ],
          icon: <Eye size={14} />,
          stats: [
            {
              icon: <Users size={12} />,
              label: "Raises",
              value: `${stats.maxReanimations}`,
            },
            {
              icon: <Eye size={12} />,
              label: "Marked",
              value: `${stats.maxTargets}`,
            },
            {
              icon: <Timer size={12} />,
              label: "Duration",
              value: `${(stats.durationMs / 1000).toFixed(0)}s`,
            },
          ],
          tip: "Use it before messy engagements where multiple units are likely to die quickly.",
        };
      }
      case "payday": {
        const stats = getPaydaySpellStats(0);
        return {
          category: "Economy",
          color: "amber",
          details: [
            `Aura duration: ${(stats.auraDurationMs / 1000).toFixed(1)}s`,
            "Value spikes when many enemies are already on map.",
            "Lets you accelerate level 4 timing in long waves.",
          ],
          icon: <Banknote size={14} />,
          stats: [
            {
              icon: <Coins size={12} />,
              label: "Base",
              value: `${stats.basePayout} PP`,
            },
            {
              icon: <TrendingUp size={12} />,
              label: "Per Enemy",
              value: `+${stats.bonusPerEnemy} PP`,
            },
            {
              icon: <Star size={12} />,
              label: "Max Bonus",
              value: `+${stats.maxBonus} PP`,
            },
          ],
          tip: "Hold until wave density is high for max value.",
        };
      }
      case "reinforcements": {
        const stats = getReinforcementSpellStats(0);
        return {
          category: "Summon",
          color: "green",
          details: [
            `Move radius: ${stats.moveRadius}`,
            "Can be dropped on demand to block sudden leaks.",
            "Great for stalling while cooldown-heavy towers reset.",
          ],
          icon: <Users size={14} />,
          stats: [
            {
              icon: <Users size={12} />,
              label: "Units",
              value: `${stats.knightCount}`,
            },
            {
              icon: <Heart size={12} />,
              label: "Unit HP",
              value: `${stats.knightHp}`,
            },
            {
              icon: <Swords size={12} />,
              label: "Unit DMG",
              value: `${stats.knightDamage}`,
            },
          ],
          tip: "Use to pin bosses in overlapping tower fire.",
        };
      }
      default: {
        return {
          category: "Spell",
          color: "purple",
          details: [],
          icon: <Sparkles size={14} />,
          stats: [],
          tip: "",
        };
      }
    }
  };

  // Get dynamic tower stats using the centralized calculation
  const getDynamicStats = (type: string, level: number, upgrade?: "A" | "B") =>
    calculateTowerStats(type, level, upgrade, 1, 1);

  // Get tower upgrade costs
  const getUpgradeCost = (type: string, level: number) => {
    const towerDef = TOWER_STATS[type];
    if (!towerDef) {
      return 0;
    }
    if (level <= 3) {
      return towerDef.levels[level as 1 | 2 | 3]?.cost || 0;
    }
    return towerDef.level4Cost; // Level 4 cost from tower definition
  };

  // Get troop for station display
  const getTroopForLevel = (level: number, upgrade?: "A" | "B") => {
    if (level === 1) {
      return TROOP_DATA.footsoldier;
    }
    if (level === 2) {
      return TROOP_DATA.armored;
    }
    if (level === 3) {
      return TROOP_DATA.elite;
    }
    if (level === 4) {
      if (upgrade === "A") {
        return TROOP_DATA.centaur;
      }
      if (upgrade === "B") {
        return TROOP_DATA.cavalry;
      }
      return TROOP_DATA.knight;
    }
    return TROOP_DATA.footsoldier;
  };

  // Tower type icons
  const towerIcons: Record<string, React.ReactNode> = {
    arch: <Volume2 size={16} className="text-blue-400" />,
    cannon: <CircleDot size={16} className="text-red-400" />,
    club: <Banknote size={16} className="text-amber-400" />,
    lab: <Zap size={16} className="text-yellow-400" />,
    library: <Snowflake size={16} className="text-cyan-400" />,
    station: <Users size={16} className="text-purple-400" />,
  };

  const towerCategories = Object.fromEntries(
    Object.entries(TOWER_CATEGORIES).map(([k, v]) => [
      k,
      { category: v.label, color: v.colorName },
    ])
  );

  return (
    <BaseModal isOpen onClose={onClose} backdropBg={OVERLAY.black60}>
      <div
        className="relative w-full max-w-6xl max-h-[92dvh] rounded-2xl overflow-hidden"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame
          className="relative w-full h-full overflow-hidden"
          cornerSize={48}
          showSideBorders={false}
        >
          {/* Inner ghost border */}
          <div
            className="absolute inset-[3px] rounded-[14px] pointer-events-none z-20"
            style={{ border: `1px solid ${GOLD.innerBorder10}` }}
          />
          <Image
            src="/images/new/gameplay_volcano.png"
            alt="Battle Scene"
            fill
            sizes="100vw"
            className="z-5 object-bottom object-cover opacity-[0.05] pointer-events-none select-none"
          />

          {/* Header */}
          <div
            className="sticky top-0 z-10 backdrop-blur px-9 py-4 flex items-center justify-between"
            style={{
              background: `linear-gradient(90deg, ${PANEL.bgDark}, ${PANEL.bgLight}, ${PANEL.bgDark})`,
              borderBottom: `2px solid ${GOLD.border30}`,
              boxShadow: `0 2px 12px ${OVERLAY.black40}`,
            }}
          >
            <div className="flex items-center gap-3">
              <Book className="text-amber-400 drop-shadow-lg" size={28} />
              <h2 className="text-3xl font-bold text-amber-100 drop-shadow-lg tracking-wide">
                CODEX
              </h2>
              <span className="text-xs text-amber-400/60 ml-2 font-medium tracking-wider uppercase">
                Battle Encyclopedia
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{
                background: PANEL.bgWarmMid,
                border: `1px solid ${GOLD.border25}`,
              }}
            >
              <X size={20} className="text-amber-400" />
            </button>
          </div>

          {/* Tab bar */}
          <div
            className="flex z-10 overflow-scroll relative"
            style={{
              background: PANEL.bgDeep,
              borderBottom: `1px solid ${GOLD.border25}`,
            }}
          >
            {[
              {
                count: towerTypes.length,
                icon: <ChessRook size={16} />,
                id: "towers",
                label: "Towers",
              },
              {
                count: heroTypes.length,
                icon: <Crown size={16} />,
                id: "heroes",
                label: "Heroes",
              },
              {
                count: troopTypes.length,
                icon: <Users size={16} />,
                id: "troops",
                label: "Troops",
              },
              {
                count: enemyTypes.length,
                icon: <Skull size={16} />,
                id: "enemies",
                label: "Enemies",
              },
              {
                count: spellTypes.length,
                icon: <Zap size={16} />,
                id: "spells",
                label: "Spells",
              },
              {
                count: specialTowerTypesInUse.length,
                icon: <Sparkles size={16} />,
                id: "special_towers",
                label: "Structures",
              },
              {
                count: hazardTypesInUse.length,
                icon: <AlertTriangle size={16} />,
                id: "hazards",
                label: "Hazards",
              },
              {
                count: 5,
                icon: <Info size={16} />,
                id: "guide",
                label: "FAQ",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setSelectedTower(null);
                  setSelectedHeroDetail(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all font-medium relative"
                style={
                  activeTab === tab.id
                    ? {
                        background: `linear-gradient(180deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        borderBottom: `2px solid ${GOLD.accentBorder50}`,
                        boxShadow: `inset 0 -4px 12px ${GOLD.accentGlow08}`,
                        color: "rgb(252,211,77)",
                      }
                    : {
                        color: "rgba(180,140,60,0.5)",
                      }
                }
              >
                {activeTab === tab.id && (
                  <div
                    className="absolute inset-[2px] rounded-sm pointer-events-none"
                    style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                  />
                )}
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background:
                      activeTab === tab.id ? PANEL.bgDeep : PANEL.bgWarmMid,
                    border: `1px solid ${activeTab === tab.id ? GOLD.border25 : "transparent"}`,
                    color:
                      activeTab === tab.id
                        ? "rgb(252,211,77)"
                        : "rgba(180,140,60,0.6)",
                  }}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="p-6 z-10 overflow-y-auto max-h-[calc(92dvh-140px)]">
            {activeTab === "towers" && !selectedTower && (
              <div className="space-y-5">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                    border: `1.5px solid ${GOLD.border30}`,
                    boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                  }}
                >
                  <div
                    className="absolute inset-[2px] rounded-[14px] pointer-events-none"
                    style={{ border: `1px solid ${GOLD.innerBorder10}` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-amber-300">
                      <Crown size={15} />
                      <h3 className="text-lg font-bold">Quick Reference</h3>
                      <span className="text-[10px] text-stone-500 ml-auto">
                        Click any tower below for full details
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {towerTypes.map((type) => {
                        const tower = TOWER_DATA[type];
                        const cat = TOWER_CATEGORIES[type];
                        const tags = TOWER_TAGS[type];
                        const summary = TOWER_QUICK_SUMMARY[type];
                        const antiAir = tags.includes("anti_air");
                        const stats = getDynamicStats(type, 1);
                        return (
                          <div
                            key={type}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 border border-stone-700/30 bg-stone-950/40"
                          >
                            <FramedCodexSprite
                              size={42}
                              theme={TOWER_SPRITE_FRAME_THEME[type]}
                            >
                              <TowerSprite type={type} size={34} level={1} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-amber-200 truncate">
                                  {tower.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950/50 border border-amber-800/30 text-amber-400 font-medium shrink-0">
                                  {tower.cost} PP
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-400 leading-snug mt-0.5">
                                {summary}
                              </div>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[9px] px-1.5 py-0.5 rounded border border-stone-700/40 bg-stone-800/50 text-stone-300">
                                  {cat.label}
                                </span>
                                {antiAir && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded border border-cyan-800/40 bg-cyan-950/40 text-cyan-300 flex items-center gap-0.5">
                                    <Plane size={8} /> Anti-Air
                                  </span>
                                )}
                                {stats.damage > 0 && (
                                  <span className="text-[9px] text-red-400/70">
                                    {Math.floor(stats.damage)} dmg
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                  {towerTypes.map((type) => {
                    const tower = TOWER_DATA[type];
                    const stats = getDynamicStats(type, 1);
                    const cat = towerCategories[type];

                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedTower(type)}
                        className="rounded-xl hover:scale-[1.02] text-left group transition-all overflow-hidden relative h-full flex flex-col"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border25}`,
                          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        {(() => {
                          const cc = getColorClasses(TOWER_COLOR[type]);
                          const dps = calculateDPS(
                            stats.damage,
                            stats.attackSpeed
                          );

                          const cardRows: {
                            value: number;
                            max: number;
                            color: string;
                            label: string;
                            displayValue: string;
                            icon: React.ReactNode;
                          }[] = [];
                          if (stats.damage > 0) {
                            cardRows.push({
                              color: "red",
                              displayValue: `${Math.floor(stats.damage)}`,
                              icon: <Swords size={12} />,
                              label: "DMG",
                              max: towerMaxDmg,
                              value: stats.damage,
                            });
                          }
                          if (stats.range > 0 && type !== "club") {
                            cardRows.push({
                              color: "blue",
                              displayValue: `${Math.floor(stats.range)}`,
                              icon: <Target size={12} />,
                              label: "RNG",
                              max: towerMaxRange,
                              value: stats.range,
                            });
                          }
                          if (
                            stats.slowAmount != null &&
                            stats.slowAmount > 0
                          ) {
                            cardRows.push({
                              color: "cyan",
                              displayValue: `${Math.round(stats.slowAmount * 100)}%`,
                              icon: <Snowflake size={12} />,
                              label: "SLOW",
                              max: towerMaxSlow,
                              value: stats.slowAmount * 100,
                            });
                          }
                          if (stats.income != null && stats.income > 0) {
                            cardRows.push({
                              color: "amber",
                              displayValue: `+${stats.income} PP`,
                              icon: <Banknote size={12} />,
                              label: "EARN",
                              max: towerMaxIncome,
                              value: stats.income,
                            });
                          }
                          if (type === "station") {
                            cardRows.push({
                              color: "purple",
                              displayValue: `${TROOP_DATA.footsoldier.hp} HP`,
                              icon: <Users size={12} />,
                              label: "TROOP",
                              max: troopMaxHp,
                              value: TROOP_DATA.footsoldier.hp,
                            });
                          }

                          return (
                            <>
                              <div
                                className={`px-4 py-2 border-b flex items-center justify-between relative z-10 ${cc.headerBg} ${cc.headerBorder}`}
                              >
                                <div className="flex items-center gap-2">
                                  {towerIcons[type]}
                                  <span
                                    className={`text-xs font-medium uppercase tracking-wider ${cc.text}`}
                                  >
                                    {cat.category}
                                  </span>
                                </div>
                                <span className="text-amber-400 flex items-center gap-1 text-xs font-bold">
                                  <Coins size={12} /> {tower.cost} PP
                                </span>
                              </div>

                              <div className="p-4 flex flex-col flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                  <FramedCodexSprite
                                    size={80}
                                    theme={TOWER_SPRITE_FRAME_THEME[type]}
                                    className="group-hover:scale-105 transition-transform"
                                  >
                                    <TowerSprite
                                      type={type}
                                      size={66}
                                      level={1}
                                    />
                                  </FramedCodexSprite>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                      <h3 className="text-base font-bold text-amber-200 group-hover:text-amber-100 truncate">
                                        {tower.name}
                                      </h3>
                                      <ChevronRight
                                        size={16}
                                        className="text-stone-600 group-hover:text-amber-400 transition-colors flex-shrink-0"
                                      />
                                    </div>
                                    <p className="text-xs text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                                      {tower.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {TOWER_TAGS[type].map((tag) => (
                                        <TagBadge
                                          key={tag}
                                          tag={tag}
                                          size={10}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-lg bg-stone-950/40 border border-stone-700/25 p-2.5 mb-3 flex-1">
                                  <div className="space-y-2">
                                    {cardRows.map((row, i) => (
                                      <StatBar
                                        key={i}
                                        value={row.value}
                                        max={row.max}
                                        color={row.color}
                                        label={row.label}
                                        displayValue={row.displayValue}
                                        icon={row.icon}
                                      />
                                    ))}
                                  </div>
                                  {dps > 0 && (
                                    <div className="mt-2 pt-2 border-t border-stone-700/25">
                                      <DPSBadge dps={dps} size="sm" />
                                    </div>
                                  )}
                                  {type === "station" && (
                                    <div className="mt-2 pt-2 border-t border-stone-700/25">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-950/40 border border-purple-800/30">
                                        <Users
                                          size={10}
                                          className="text-purple-400"
                                        />
                                        <span className="text-[10px] text-stone-400 uppercase">
                                          Spawn
                                        </span>
                                        <span className="text-[10px] font-bold text-purple-300">
                                          1 troop /{" "}
                                          {(stats.spawnInterval || 5000) / 1000}
                                          s
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {type === "club" && (
                                    <div className="mt-2 pt-2 border-t border-stone-700/25">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/30">
                                        <Timer
                                          size={10}
                                          className="text-amber-400"
                                        />
                                        <span className="text-[10px] text-stone-400 uppercase">
                                          Every
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-300">
                                          {(stats.incomeInterval || 8000) /
                                            1000}
                                          s
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                  <div className="px-2.5 py-2 bg-red-950/30 rounded-lg border border-red-900/30 group-hover:border-red-700/50 transition-colors">
                                    <div className="text-[10px] text-red-500/70 uppercase mb-0.5 tracking-wider font-medium">
                                      Path A
                                    </div>
                                    <div className="text-xs text-red-300 font-semibold truncate">
                                      {tower.upgrades.A.name}
                                    </div>
                                  </div>
                                  <div className="px-2.5 py-2 bg-blue-950/30 rounded-lg border border-blue-900/30 group-hover:border-blue-700/50 transition-colors">
                                    <div className="text-[10px] text-blue-500/70 uppercase mb-0.5 tracking-wider font-medium">
                                      Path B
                                    </div>
                                    <div className="text-xs text-blue-300 font-semibold truncate">
                                      {tower.upgrades.B.name}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "towers" &&
              selectedTower &&
              (() => {
                const tower =
                  TOWER_DATA[selectedTower as keyof typeof TOWER_DATA];
                const towerDef = TOWER_STATS[selectedTower]; // Used in renderUniqueFeatures
                const cat = towerCategories[selectedTower];
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                void towerDef; // Explicitly mark as used in closure

                // Render unique features for a tower upgrade
                const renderUniqueFeatures = (
                  stats: ReturnType<typeof getDynamicStats>,
                  path: "A" | "B",
                  type: string
                ) => {
                  const features: React.ReactNode[] = [];
                  const upgradeStats = towerDef?.upgrades?.[path]?.stats;

                  // Combat stats
                  if (stats.damage > 0) {
                    features.push(
                      <div
                        key="dmg"
                        className="bg-red-950/50 rounded-lg p-2 text-center border border-red-800/40"
                      >
                        <Swords
                          size={14}
                          className="mx-auto text-red-400 mb-1"
                        />
                        <div className="text-[11px] text-red-500">Damage</div>
                        <div className="text-red-300 font-bold">
                          {Math.floor(stats.damage)}
                        </div>
                      </div>
                    );
                  }

                  if (stats.range > 0 && type !== "club") {
                    features.push(
                      <div
                        key="rng"
                        className="bg-blue-950/50 rounded-lg p-2 text-center border border-blue-800/40"
                      >
                        <Target
                          size={14}
                          className="mx-auto text-blue-400 mb-1"
                        />
                        <div className="text-[11px] text-blue-500">Range</div>
                        <div className="text-blue-300 font-bold">
                          {Math.floor(stats.range)}
                        </div>
                      </div>
                    );
                  }

                  if (stats.attackSpeed > 0) {
                    features.push(
                      <div
                        key="spd"
                        className="bg-green-950/50 rounded-lg p-2 text-center border border-green-800/40"
                      >
                        <Gauge
                          size={14}
                          className="mx-auto text-green-400 mb-1"
                        />
                        <div className="text-[11px] text-green-500">Speed</div>
                        <div className="text-green-300 font-bold">
                          {(stats.attackSpeed / 1000).toFixed(1)}s
                        </div>
                      </div>
                    );
                  }

                  // Unique features
                  if (stats.chainTargets && stats.chainTargets > 1) {
                    const isLabChain = type === "lab";
                    features.push(
                      <div
                        key="chain"
                        className={
                          isLabChain
                            ? "bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40"
                            : "bg-yellow-950/50 rounded-lg p-2 text-center border border-yellow-800/40"
                        }
                      >
                        {isLabChain ? (
                          <Zap
                            size={14}
                            className="mx-auto text-cyan-400 mb-1"
                          />
                        ) : (
                          <Users
                            size={14}
                            className="mx-auto text-yellow-400 mb-1"
                          />
                        )}
                        <div
                          className={
                            isLabChain
                              ? "text-[11px] text-cyan-500"
                              : "text-[11px] text-yellow-500"
                          }
                        >
                          {isLabChain ? "Chains" : "Targets"}
                        </div>
                        <div
                          className={
                            isLabChain
                              ? "text-cyan-300 font-bold"
                              : "text-yellow-300 font-bold"
                          }
                        >
                          {stats.chainTargets}
                        </div>
                      </div>
                    );
                  }

                  if (
                    stats.crescendoMaxStacks &&
                    stats.crescendoMaxStacks > 0
                  ) {
                    features.push(
                      <div
                        key="crescendo"
                        className="bg-emerald-950/50 rounded-lg p-2 text-center border border-emerald-800/40"
                      >
                        <Music
                          size={14}
                          className="mx-auto text-emerald-400 mb-1"
                        />
                        <div className="text-[11px] text-emerald-500">
                          Crescendo
                        </div>
                        <div className="text-emerald-300 font-bold">
                          {stats.crescendoMaxStacks}
                        </div>
                      </div>
                    );
                  }

                  if (stats.splashRadius && stats.splashRadius > 0) {
                    features.push(
                      <div
                        key="splash"
                        className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40"
                      >
                        <Radio
                          size={14}
                          className="mx-auto text-orange-400 mb-1"
                        />
                        <div className="text-[11px] text-orange-500">
                          Splash
                        </div>
                        <div className="text-orange-300 font-bold">
                          {stats.splashRadius}
                        </div>
                      </div>
                    );
                  }

                  if (stats.slowAmount && stats.slowAmount > 0) {
                    features.push(
                      <div
                        key="slow"
                        className="bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40"
                      >
                        <Snowflake
                          size={14}
                          className="mx-auto text-cyan-400 mb-1"
                        />
                        <div className="text-[11px] text-cyan-500">Slow</div>
                        <div className="text-cyan-300 font-bold">
                          {Math.round(stats.slowAmount * 100)}%
                        </div>
                      </div>
                    );
                  }

                  if (stats.stunChance && stats.stunChance > 0) {
                    features.push(
                      <div
                        key="stun"
                        className="bg-indigo-950/50 rounded-lg p-2 text-center border border-indigo-800/40"
                      >
                        <CircleOff
                          size={14}
                          className="mx-auto text-indigo-400 mb-1"
                        />
                        <div className="text-[11px] text-indigo-500">
                          Freeze
                        </div>
                        <div className="text-indigo-300 font-bold">
                          {Math.round(stats.stunChance * 100)}%
                        </div>
                      </div>
                    );
                  }

                  if (stats.burnDamage && stats.burnDamage > 0) {
                    features.push(
                      <div
                        key="burn"
                        className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40"
                      >
                        <Flame
                          size={14}
                          className="mx-auto text-orange-400 mb-1"
                        />
                        <div className="text-[11px] text-orange-500">Burn</div>
                        <div className="text-orange-300 font-bold">
                          {stats.burnDamage}/s
                        </div>
                      </div>
                    );
                  }

                  // Economy features
                  if (stats.income && stats.income > 0) {
                    features.push(
                      <div
                        key="income"
                        className="bg-amber-950/50 rounded-lg p-2 text-center border border-amber-800/40"
                      >
                        <Banknote
                          size={14}
                          className="mx-auto text-amber-400 mb-1"
                        />
                        <div className="text-[11px] text-amber-500">Income</div>
                        <div className="text-amber-300 font-bold">
                          +{stats.income} PP
                        </div>
                      </div>
                    );
                  }

                  if (stats.incomeInterval && stats.incomeInterval > 0) {
                    features.push(
                      <div
                        key="interval"
                        className="bg-amber-950/50 rounded-lg p-2 text-center border border-amber-800/40"
                      >
                        <Timer
                          size={14}
                          className="mx-auto text-amber-400 mb-1"
                        />
                        <div className="text-[11px] text-amber-500">
                          Interval
                        </div>
                        <div className="text-amber-300 font-bold">
                          {stats.incomeInterval / 1000}s
                        </div>
                      </div>
                    );
                  }

                  // Aura features
                  if (upgradeStats?.rangeBuff) {
                    features.push(
                      <div
                        key="rangeAura"
                        className="bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40"
                      >
                        <TrendingUp
                          size={14}
                          className="mx-auto text-cyan-400 mb-1"
                        />
                        <div className="text-[11px] text-cyan-500">
                          Range Aura
                        </div>
                        <div className="text-cyan-300 font-bold">
                          +{Math.round(upgradeStats.rangeBuff * 100)}%
                        </div>
                      </div>
                    );
                  }

                  if (upgradeStats?.damageBuff) {
                    features.push(
                      <div
                        key="dmgAura"
                        className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40"
                      >
                        <TrendingUp
                          size={14}
                          className="mx-auto text-orange-400 mb-1"
                        />
                        <div className="text-[11px] text-orange-500">
                          DMG Aura
                        </div>
                        <div className="text-orange-300 font-bold">
                          +{Math.round(upgradeStats.damageBuff * 100)}%
                        </div>
                      </div>
                    );
                  }

                  return features;
                };

                return (
                  <div>
                    <button
                      onClick={() => setSelectedTower(null)}
                      className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-4 transition-all font-medium px-3 py-1.5 rounded-lg"
                      style={{
                        background: PANEL.bgWarmMid,
                        border: `1px solid ${GOLD.border25}`,
                      }}
                    >
                      <ChevronRight size={16} className="rotate-180" />
                      <span>Back to all towers</span>
                    </button>

                    <div className="space-y-6">
                      {/* Header Section */}
                      <div
                        className="rounded-xl overflow-hidden relative"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border30}`,
                          boxShadow: `inset 0 0 12px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        {(() => {
                          const tcc = getColorClasses(
                            TOWER_COLOR[selectedTower]
                          );
                          const baseStats = getDynamicStats(selectedTower, 1);
                          const baseDps = calculateDPS(
                            baseStats.damage,
                            baseStats.attackSpeed
                          );
                          return (
                            <>
                              <div
                                className={`px-6 py-3 border-b flex items-center gap-3 ${tcc.headerBg} ${tcc.headerBorder}`}
                              >
                                {towerIcons[selectedTower]}
                                <span
                                  className={`text-sm font-medium uppercase tracking-wider ${tcc.text}`}
                                >
                                  {cat.category}
                                </span>
                              </div>
                              <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
                                <FramedCodexSprite
                                  size={128}
                                  theme={
                                    TOWER_SPRITE_FRAME_THEME[
                                      selectedTower as keyof typeof TOWER_DATA
                                    ]
                                  }
                                >
                                  <TowerSprite
                                    type={
                                      selectedTower as keyof typeof TOWER_DATA
                                    }
                                    size={112}
                                    level={4}
                                  />
                                </FramedCodexSprite>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-3xl font-bold text-amber-200 mb-1">
                                    {tower.name}
                                  </h3>
                                  <p className="text-stone-400 mb-2 text-sm leading-relaxed">
                                    {tower.desc}
                                  </p>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {TOWER_TAGS[
                                      selectedTower as keyof typeof TOWER_DATA
                                    ].map((tag) => (
                                      <TagBadge key={tag} tag={tag} size={10} />
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    <div className="px-5 py-3 bg-amber-950/50 rounded-lg border border-amber-800/40">
                                      <div className="text-xs text-amber-500 uppercase tracking-wider font-medium">
                                        Base Cost
                                      </div>
                                      <div className="text-amber-300 font-bold text-xl">
                                        {tower.cost} PP
                                      </div>
                                    </div>
                                    {baseStats.damage > 0 && (
                                      <div className="px-5 py-3 bg-red-950/50 rounded-lg border border-red-800/40">
                                        <div className="text-xs text-red-500 uppercase tracking-wider font-medium">
                                          Base Damage
                                        </div>
                                        <div className="text-red-300 font-bold text-xl">
                                          {Math.floor(baseStats.damage)}
                                        </div>
                                      </div>
                                    )}
                                    {baseStats.range > 0 &&
                                      selectedTower !== "club" && (
                                        <div className="px-5 py-3 bg-blue-950/50 rounded-lg border border-blue-800/40">
                                          <div className="text-xs text-blue-500 uppercase tracking-wider font-medium">
                                            Base Range
                                          </div>
                                          <div className="text-blue-300 font-bold text-xl">
                                            {Math.floor(baseStats.range)}
                                          </div>
                                        </div>
                                      )}
                                    {baseDps > 0 && (
                                      <div className="px-5 py-3 bg-gradient-to-r from-red-950/50 to-orange-950/40 rounded-lg border border-red-800/40">
                                        <div className="text-xs text-orange-500 uppercase tracking-wider font-medium">
                                          Base DPS
                                        </div>
                                        <div className="text-orange-300 font-bold text-xl">
                                          {baseDps.toFixed(1)}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Level Progression */}
                      {(() => {
                        const isStation = selectedTower === "station";
                        const cost4 = getUpgradeCost(selectedTower, 4);

                        const renderLevelStats = (level: number) => {
                          const stats = getDynamicStats(selectedTower, level);
                          const troop = isStation
                            ? getTroopForLevel(level)
                            : null;

                          return (
                            <>
                              {isStation && troop && (
                                <div className="space-y-2">
                                  <StatBar
                                    value={troop.hp}
                                    max={troopMaxHp}
                                    color="red"
                                    label="HP"
                                    displayValue={`${troop.hp}`}
                                    icon={<Heart size={12} />}
                                  />
                                  <StatBar
                                    value={troop.damage}
                                    max={troopMaxDmg}
                                    color="orange"
                                    label="DMG"
                                    displayValue={`${troop.damage}`}
                                    icon={<Swords size={12} />}
                                  />
                                  <StatBar
                                    value={1000 / troop.attackSpeed}
                                    max={troopMaxAtkRate}
                                    color="green"
                                    label="SPD"
                                    displayValue={`${(troop.attackSpeed / 1000).toFixed(1)}s`}
                                    icon={<Gauge size={12} />}
                                  />
                                </div>
                              )}

                              {!isStation && selectedTower !== "club" && (
                                <div className="space-y-2">
                                  {stats.damage > 0 && (
                                    <StatBar
                                      value={stats.damage}
                                      max={towerGlobalMaxDmg}
                                      color="red"
                                      label="DMG"
                                      displayValue={`${Math.floor(stats.damage)}`}
                                      icon={<Swords size={12} />}
                                    />
                                  )}
                                  {stats.range > 0 && (
                                    <StatBar
                                      value={stats.range}
                                      max={towerGlobalMaxRange}
                                      color="blue"
                                      label="RNG"
                                      displayValue={`${Math.floor(stats.range)}`}
                                      icon={<Target size={12} />}
                                    />
                                  )}
                                  {stats.attackSpeed > 0 && (
                                    <StatBar
                                      value={1000 / stats.attackSpeed}
                                      max={towerGlobalMaxAtkRate}
                                      color="green"
                                      label="SPD"
                                      displayValue={`${(stats.attackSpeed / 1000).toFixed(1)}s`}
                                      icon={<Gauge size={12} />}
                                    />
                                  )}
                                  {(() => {
                                    const levelDps = calculateDPS(
                                      stats.damage,
                                      stats.attackSpeed
                                    );
                                    return levelDps > 0 ? (
                                      <div className="mt-2">
                                        <DPSBadge dps={levelDps} size="sm" />
                                      </div>
                                    ) : null;
                                  })()}
                                </div>
                              )}

                              {selectedTower === "club" && (
                                <div className="space-y-2">
                                  <StatBar
                                    value={stats.income || 0}
                                    max={towerGlobalMaxIncome}
                                    color="amber"
                                    label="PP"
                                    displayValue={`+${stats.income}`}
                                    icon={<Banknote size={12} />}
                                  />
                                  <StatBar
                                    value={
                                      1000 / (stats.incomeInterval || 8000)
                                    }
                                    max={towerGlobalMaxIncomeRate}
                                    color="amber"
                                    label="INT"
                                    displayValue={`${(stats.incomeInterval || 8000) / 1000}s`}
                                    icon={<Timer size={12} />}
                                  />
                                </div>
                              )}

                              {selectedTower === "library" && (
                                <div className="mt-2">
                                  <StatBar
                                    value={(stats.slowAmount || 0) * 100}
                                    max={towerGlobalMaxSlow}
                                    color="cyan"
                                    label="SLOW"
                                    displayValue={`${Math.round((stats.slowAmount || 0) * 100)}%`}
                                    icon={<Snowflake size={12} />}
                                  />
                                </div>
                              )}
                            </>
                          );
                        };

                        const renderPathStats = (path: "A" | "B") => {
                          const pathStats = getDynamicStats(
                            selectedTower,
                            4,
                            path
                          );
                          const pathTroop = isStation
                            ? getTroopForLevel(4, path)
                            : null;

                          return (
                            <>
                              {isStation && pathTroop && (
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-red-950/50 rounded-lg px-2 py-1.5 text-center border border-red-900/30">
                                    <div className="text-red-500 text-[10px] font-medium">
                                      HP
                                    </div>
                                    <div className="text-red-300 font-bold text-sm">
                                      {pathTroop.hp}
                                    </div>
                                  </div>
                                  <div className="bg-orange-950/50 rounded-lg px-2 py-1.5 text-center border border-orange-900/30">
                                    <div className="text-orange-500 text-[10px] font-medium">
                                      DMG
                                    </div>
                                    <div className="text-orange-300 font-bold text-sm">
                                      {pathTroop.damage}
                                    </div>
                                  </div>
                                  <div className="bg-green-950/50 rounded-lg px-2 py-1.5 text-center border border-green-900/30">
                                    <div className="text-green-500 text-[10px] font-medium">
                                      SPD
                                    </div>
                                    <div className="text-green-300 font-bold text-sm">
                                      {(pathTroop.attackSpeed / 1000).toFixed(
                                        1
                                      )}
                                      s
                                    </div>
                                  </div>
                                </div>
                              )}

                              {!isStation && selectedTower !== "club" && (
                                <div className="space-y-2">
                                  {pathStats.damage > 0 && (
                                    <StatBar
                                      value={pathStats.damage}
                                      max={towerGlobalMaxDmg}
                                      color="red"
                                      label="DMG"
                                      displayValue={`${Math.floor(pathStats.damage)}`}
                                      icon={<Swords size={12} />}
                                    />
                                  )}
                                  {pathStats.range > 0 && (
                                    <StatBar
                                      value={pathStats.range}
                                      max={towerGlobalMaxRange}
                                      color="blue"
                                      label="RNG"
                                      displayValue={`${Math.floor(pathStats.range)}`}
                                      icon={<Target size={12} />}
                                    />
                                  )}
                                  {pathStats.attackSpeed > 0 && (
                                    <StatBar
                                      value={1000 / pathStats.attackSpeed}
                                      max={towerGlobalMaxAtkRate}
                                      color="green"
                                      label="SPD"
                                      displayValue={`${(pathStats.attackSpeed / 1000).toFixed(1)}s`}
                                      icon={<Gauge size={12} />}
                                    />
                                  )}
                                </div>
                              )}

                              {selectedTower === "club" && (
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-amber-950/50 rounded-lg px-2 py-1.5 text-center border border-amber-900/30">
                                    <div className="text-amber-500 text-[10px] font-medium">
                                      Income
                                    </div>
                                    <div className="text-amber-300 font-bold text-sm">
                                      +{pathStats.income} PP
                                    </div>
                                  </div>
                                  <div className="bg-amber-950/50 rounded-lg px-2 py-1.5 text-center border border-amber-900/30">
                                    <div className="text-amber-500 text-[10px] font-medium">
                                      Interval
                                    </div>
                                    <div className="text-amber-300 font-bold text-sm">
                                      {(pathStats.incomeInterval || 8000) /
                                        1000}
                                      s
                                    </div>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        };

                        return (
                          <div>
                            <div className="flex items-center gap-3 mb-4">
                              <div
                                className="flex-1 h-px"
                                style={{
                                  background: `linear-gradient(90deg, ${GOLD.border25}, transparent)`,
                                }}
                              />
                              <h4 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                                <ArrowUp size={18} className="text-amber-400" />
                                Level Progression
                              </h4>
                              <div
                                className="flex-1 h-px"
                                style={{
                                  background: `linear-gradient(90deg, transparent, ${GOLD.border25})`,
                                }}
                              />
                            </div>

                            {/* Horizontal pipeline: Lvl 1 -> Lvl 2 -> Lvl 3 -> [A / B] */}
                            <div className="flex flex-col lg:flex-row items-stretch gap-0">
                              {[1, 2, 3].map((level) => {
                                const cost = getUpgradeCost(
                                  selectedTower,
                                  level
                                );
                                return (
                                  <React.Fragment key={level}>
                                    <div className="flex-1 min-w-0 rounded-xl border overflow-hidden bg-stone-900/80 border-stone-700/40">
                                      <div className="px-3 py-2.5 flex items-center justify-between bg-stone-800/50">
                                        <div className="flex items-center gap-2.5">
                                          <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{
                                              background: "rgba(0,0,0,0.3)",
                                            }}
                                          >
                                            <TowerSprite
                                              type={
                                                selectedTower as keyof typeof TOWER_DATA
                                              }
                                              size={44}
                                              level={level}
                                            />
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <div className="flex">
                                              {[...Array(level)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  size={12}
                                                  className="text-yellow-400 fill-yellow-400"
                                                />
                                              ))}
                                            </div>
                                            <span className="font-bold text-sm text-amber-300">
                                              Lvl {level}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                                          <Coins size={12} /> {cost} PP
                                        </span>
                                      </div>
                                      <div className="p-3">
                                        <p className="text-xs text-stone-400 mb-3 line-clamp-2 leading-relaxed">
                                          {tower.levelDesc[level as 1 | 2 | 3]}
                                        </p>
                                        {renderLevelStats(level)}
                                      </div>
                                    </div>

                                    {/* Arrow between level cards */}
                                    <div className="flex items-center justify-center shrink-0 px-1">
                                      <ChevronRight
                                        size={20}
                                        className="text-amber-500/60 hidden lg:block"
                                      />
                                      <ChevronRight
                                        size={20}
                                        className="text-amber-500/60 rotate-90 lg:hidden"
                                      />
                                    </div>
                                  </React.Fragment>
                                );
                              })}

                              {/* Lvl 4 branches */}
                              <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                                {(["A", "B"] as const).map((path) => {
                                  const pathDps = calculateDPS(
                                    getDynamicStats(selectedTower, 4, path)
                                      .damage,
                                    getDynamicStats(selectedTower, 4, path)
                                      .attackSpeed
                                  );
                                  return (
                                    <div
                                      key={path}
                                      className={`flex-1 rounded-xl border overflow-hidden ${
                                        path === "A"
                                          ? "bg-gradient-to-br from-red-950/40 to-stone-950 border-red-700/50"
                                          : "bg-gradient-to-br from-blue-950/40 to-stone-950 border-blue-700/50"
                                      }`}
                                    >
                                      <div
                                        className={`px-3 py-2 flex items-center justify-between ${path === "A" ? "bg-red-900/30" : "bg-blue-900/30"}`}
                                      >
                                        <div className="flex items-center gap-2.5">
                                          <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{
                                              background: "rgba(0,0,0,0.3)",
                                            }}
                                          >
                                            <TowerSprite
                                              type={
                                                selectedTower as keyof typeof TOWER_DATA
                                              }
                                              size={44}
                                              level={4}
                                              upgrade={path}
                                            />
                                          </div>
                                          <div>
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                              <div className="flex">
                                                {[...Array(4)].map((_, i) => (
                                                  <Star
                                                    key={i}
                                                    size={10}
                                                    className="text-yellow-400 fill-yellow-400"
                                                  />
                                                ))}
                                              </div>
                                              <span
                                                className={`text-xs uppercase tracking-wider font-medium ${path === "A" ? "text-red-400" : "text-blue-400"}`}
                                              >
                                                Lvl 4
                                              </span>
                                            </div>
                                            <div
                                              className={`text-sm font-bold leading-tight ${path === "A" ? "text-red-200" : "text-blue-200"}`}
                                            >
                                              {tower.upgrades[path].name}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                          <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                                            <Coins size={12} /> {cost4} PP
                                          </span>
                                          {pathDps > 0 && (
                                            <DPSBadge dps={pathDps} size="sm" />
                                          )}
                                        </div>
                                      </div>
                                      <div className="p-3">
                                        {renderPathStats(path)}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Evolution Paths */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div
                            className="flex-1 h-px"
                            style={{
                              background: `linear-gradient(90deg, ${GOLD.border25}, transparent)`,
                            }}
                          />
                          <h4 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-400" />
                            Evolution Paths (Level 4)
                          </h4>
                          <div
                            className="flex-1 h-px"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${GOLD.border25})`,
                            }}
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          {(["A", "B"] as const).map((path) => {
                            const upgrade = tower.upgrades[path];
                            const stats = getDynamicStats(
                              selectedTower,
                              4,
                              path
                            );
                            const isStation = selectedTower === "station";
                            const troop = isStation
                              ? getTroopForLevel(4, path)
                              : null;
                            const pathLabel =
                              path === "A" ? "Offensive" : "Utility";

                            return (
                              <div
                                key={path}
                                className={`rounded-xl border overflow-hidden ${
                                  path === "A"
                                    ? "bg-gradient-to-br from-red-950/40 to-stone-950 border-red-700/50"
                                    : "bg-gradient-to-br from-blue-950/40 to-stone-950 border-blue-700/50"
                                }`}
                              >
                                {/* Path header */}
                                <div
                                  className={`px-4 py-3 ${path === "A" ? "bg-red-900/30" : "bg-blue-900/30"} flex items-center gap-4`}
                                >
                                  <FramedCodexSprite
                                    size={72}
                                    theme={
                                      TOWER_SPRITE_FRAME_THEME[
                                        selectedTower as keyof typeof TOWER_DATA
                                      ]
                                    }
                                  >
                                    <TowerSprite
                                      type={
                                        selectedTower as keyof typeof TOWER_DATA
                                      }
                                      size={60}
                                      level={4}
                                      upgrade={path as "A" | "B"}
                                    />
                                  </FramedCodexSprite>
                                  <div className="flex-1">
                                    <div
                                      className={`text-xs uppercase tracking-wider font-medium ${path === "A" ? "text-red-400" : "text-blue-400"}`}
                                    >
                                      Lvl 4 • {pathLabel}
                                    </div>
                                    <h5
                                      className={`text-xl font-bold ${path === "A" ? "text-red-200" : "text-blue-200"}`}
                                    >
                                      {upgrade.name}
                                    </h5>
                                  </div>
                                </div>

                                <div className="p-4 space-y-4">
                                  {/* Description */}
                                  <p className="text-stone-400 text-sm">
                                    {upgrade.desc}
                                  </p>

                                  {/* Special Effect Box */}
                                  <div
                                    className={`rounded-lg p-3 ${path === "A" ? "bg-red-950/40 border border-red-800/40" : "bg-blue-950/40 border border-blue-800/40"}`}
                                  >
                                    <div
                                      className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${path === "A" ? "text-red-400" : "text-blue-400"}`}
                                    >
                                      <Sparkles size={12} />
                                      Special Effect
                                    </div>
                                    <p
                                      className={`text-sm ${path === "A" ? "text-red-200" : "text-blue-200"}`}
                                    >
                                      {upgrade.effect}
                                    </p>
                                  </div>

                                  {/* Troop info for Station */}
                                  {isStation && troop && (
                                    <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700/40">
                                      <div className="text-xs text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Users size={12} />
                                        Troop: {troop.name}
                                      </div>
                                      <p className="text-xs text-stone-400 mb-2">
                                        {troop.desc}
                                      </p>
                                      <div className="grid grid-cols-4 gap-2 text-xs">
                                        <div className="bg-red-950/50 rounded-lg p-2 text-center border border-red-900/30">
                                          <Heart
                                            size={14}
                                            className="mx-auto text-red-400 mb-0.5"
                                          />
                                          <div className="text-red-300 font-bold">
                                            {troop.hp}
                                          </div>
                                        </div>
                                        <div className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-900/30">
                                          <Swords
                                            size={14}
                                            className="mx-auto text-orange-400 mb-0.5"
                                          />
                                          <div className="text-orange-300 font-bold">
                                            {troop.damage}
                                          </div>
                                        </div>
                                        <div className="bg-green-950/50 rounded-lg p-2 text-center border border-green-900/30">
                                          <Gauge
                                            size={14}
                                            className="mx-auto text-green-400 mb-0.5"
                                          />
                                          <div className="text-green-300 font-bold">
                                            {(troop.attackSpeed / 1000).toFixed(
                                              1
                                            )}
                                            s
                                          </div>
                                        </div>
                                        {troop.isRanged && (
                                          <div className="bg-blue-950/50 rounded-lg p-2 text-center border border-blue-900/30">
                                            <Crosshair
                                              size={14}
                                              className="mx-auto text-blue-400 mb-0.5"
                                            />
                                            <div className="text-blue-300 font-bold">
                                              {troop.range}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      {(troop.isMounted ||
                                        troop.isRanged ||
                                        troop.canTargetFlying) && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {troop.isMounted && (
                                            <span className="text-[10px] px-2 py-1 bg-amber-900/50 rounded-md text-amber-300 border border-amber-700/50">
                                              <Wind
                                                size={11}
                                                className="inline"
                                              />{" "}
                                              Mounted
                                            </span>
                                          )}
                                          {troop.isRanged && (
                                            <span className="text-[10px] px-2 py-1 bg-blue-900/50 rounded-md text-blue-300 border border-blue-700/50">
                                              <Crosshair
                                                size={11}
                                                className="inline"
                                              />{" "}
                                              Ranged
                                            </span>
                                          )}
                                          {troop.canTargetFlying && (
                                            <span className="text-[10px] px-2 py-1 bg-cyan-900/50 rounded-md text-cyan-300 border border-cyan-700/50">
                                              <Plane
                                                size={11}
                                                className="inline"
                                              />{" "}
                                              Anti-Air
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-4 gap-2">
                                    {renderUniqueFeatures(
                                      stats,
                                      path,
                                      selectedTower
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {activeTab === "heroes" && !selectedHeroDetail && (
              <div className="space-y-5">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                    border: `1.5px solid ${GOLD.border30}`,
                    boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                  }}
                >
                  <div
                    className="absolute inset-[2px] rounded-[14px] pointer-events-none"
                    style={{ border: `1px solid ${GOLD.innerBorder10}` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-indigo-300">
                      <Shield size={15} />
                      <h3 className="text-lg font-bold">Hero Comparison</h3>
                      <span className="text-[10px] text-stone-500 ml-auto">
                        Click any hero below for full details
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {heroTypes.map((type) => {
                        const hero = HERO_DATA[type];
                        const role = HERO_ROLES[type];
                        const cooldown = HERO_ABILITY_COOLDOWNS[type];
                        const dps = hero.damage / (hero.attackSpeed / 1000);
                        return (
                          <div
                            key={type}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 border border-stone-700/30 bg-stone-950/40"
                          >
                            <FramedCodexSprite
                              size={42}
                              theme={getHeroSpriteFrameTheme(type)}
                            >
                              <HeroSprite type={type} size={34} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-amber-200 truncate">
                                  {hero.name}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${role.color}`}
                                  style={{
                                    background: role.bg,
                                    border: `1px solid ${role.border}`,
                                  }}
                                >
                                  {role.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[9px]">
                                <span className="text-red-400 flex items-center gap-0.5">
                                  <Heart size={8} />
                                  {hero.hp}
                                </span>
                                <span className="text-orange-400 flex items-center gap-0.5">
                                  <Swords size={8} />
                                  {Math.round(dps)} dps
                                </span>
                                <span className="text-purple-400 flex items-center gap-0.5">
                                  <Sparkles size={8} />
                                  {cooldown / 1000}s cd
                                </span>
                                {hero.isRanged && (
                                  <span className="text-cyan-400 flex items-center gap-0.5">
                                    <Crosshair size={8} />
                                    {hero.range}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                                {hero.ability}:{" "}
                                {hero.abilityDesc.split(".")[0].split(",")[0]}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroTypes.map((type) => {
                    const hero = HERO_DATA[type];
                    const cooldown = HERO_ABILITY_COOLDOWNS[type];

                    const heroRole = HERO_ROLES[type];
                    const roleInfo = {
                      color: HERO_COLOR_NAMES[type],
                      role: heroRole.label,
                    };

                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedHeroDetail(type)}
                        className="rounded-xl hover:scale-[1.02] text-left group transition-all overflow-hidden relative"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border25}`,
                          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        {(() => {
                          const rcc = getColorClasses(roleInfo.color);
                          return (
                            <div
                              className={`px-4 py-2 border-b flex items-center justify-between ${rcc.headerBg} ${rcc.headerBorder}`}
                            >
                              <div
                                className={`flex items-center gap-2 ${rcc.text}`}
                              >
                                {HERO_ROLE_ICONS[type](12)}
                                <span className="text-xs font-medium uppercase tracking-wider">
                                  {roleInfo.role}
                                </span>
                              </div>
                              <HeroIcon type={type} size={20} />
                            </div>
                          );
                        })()}

                        <div className="p-4">
                          <div className="flex items-start gap-4 mb-3">
                            <FramedCodexSprite
                              size={80}
                              theme={getHeroSpriteFrameTheme(type)}
                              className="group-hover:scale-105 transition-transform"
                            >
                              <HeroSprite type={type} size={66} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-amber-200 group-hover:text-amber-100 truncate">
                                {hero.name}
                              </h3>
                              <p className="text-xs text-stone-400 line-clamp-2 mt-1">
                                {hero.description}
                              </p>
                            </div>
                            <ChevronRight
                              size={20}
                              className="text-stone-600 group-hover:text-amber-400 transition-colors flex-shrink-0"
                            />
                          </div>

                          <div className="space-y-2 mb-3">
                            <StatBar
                              value={hero.hp}
                              max={heroMaxHp}
                              color="red"
                              label="HP"
                              displayValue={`${hero.hp}`}
                              icon={<Heart size={12} />}
                            />
                            <StatBar
                              value={hero.damage}
                              max={heroMaxDmg}
                              color="orange"
                              label="DMG"
                              displayValue={`${hero.damage}`}
                              icon={<Swords size={12} />}
                            />
                            <StatBar
                              value={hero.range}
                              max={heroMaxRange}
                              color="blue"
                              label="RNG"
                              displayValue={`${hero.range}`}
                              icon={<Target size={12} />}
                            />
                            <StatBar
                              value={hero.speed}
                              max={heroMaxSpeed}
                              color="cyan"
                              label="SPD"
                              displayValue={`${hero.speed}`}
                              icon={<Wind size={12} />}
                            />
                          </div>

                          {/* Ability preview */}
                          <div className="bg-purple-950/40 rounded-lg p-2 border border-purple-800/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Sparkles
                                  size={12}
                                  className="text-purple-400"
                                />
                                <span className="text-xs font-medium text-purple-300">
                                  {hero.ability}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-purple-400">
                                <Timer size={10} />
                                <span>{cooldown / 1000}s</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "heroes" &&
              selectedHeroDetail &&
              (() => {
                const hero = HERO_DATA[selectedHeroDetail as HeroType];
                const cooldown =
                  HERO_ABILITY_COOLDOWNS[selectedHeroDetail as HeroType];

                const heroInfo: Record<
                  string,
                  {
                    role: string;
                    roleIcon: React.ReactNode;
                    roleColor: string;
                    strengths: string[];
                    weaknesses: string[];
                    abilityDetails: string[];
                    strategy: string;
                    synergies: string[];
                  }
                > = {
                  captain: {
                    abilityDetails: [
                      "Summons 3 knights troops near the hero",
                      "Knights have 500 HP and 30 damage each",
                      "Summoning circle with energy pillars effect",
                    ],
                    role: "Summoner",
                    roleColor: "red",
                    roleIcon: <Users size={16} />,
                    strategy:
                      "Use Rally Knights to plug leaks in your defense or create additional blocking points.",
                    strengths: [
                      "Extra troops on demand",
                      "Flexible positioning",
                      "Good for blocking",
                    ],
                    synergies: [
                      "Works with troop-healing effects",
                      "Pairs with high DPS towers",
                    ],
                    weaknesses: [
                      "Knights are temporary",
                      "Moderate personal stats",
                      "Cooldown dependent",
                    ],
                  },
                  engineer: {
                    abilityDetails: [
                      "Deploys a turret nearby",
                      "Turret does not self-destruct",
                      "Can spawn multiple turrets",
                    ],
                    role: "Tactical Builder",
                    roleColor: "amber",
                    roleIcon: <CircleDot size={16} />,
                    strategy:
                      "Place turrets strategically to cover weak points or extend your defensive line.",
                    strengths: [
                      "Free turret placement",
                      "Extends tower coverage",
                      "Good DPS",
                    ],
                    synergies: [
                      "Covers areas without towers",
                      "Good for emergency defense",
                    ],
                    weaknesses: [
                      "Turret is fragile",
                      "Needs good placement",
                      "Moderate stats",
                    ],
                  },
                  ivy: {
                    abilityDetails: [
                      "Transforms into a massive plant mech for 8 seconds",
                      "Deals 120 AoE melee damage to all enemies within 160 range",
                      "Each hit stuns briefly — relentless ground-pound devastation",
                    ],
                    role: "Nature Controller",
                    roleColor: "emerald",
                    roleIcon: <Leaf size={16} />,
                    strategy:
                      "Wade into enemy formations and activate Verdant Colossus to transform into a massive plant mech, crushing everything in melee range. Your towers will shred what survives.",
                    strengths: [
                      "Large AoE root",
                      "High survivability",
                      "Excellent crowd control",
                    ],
                    synergies: [
                      "Devastating with AoE towers",
                      "Pairs with high DPS heroes",
                    ],
                    weaknesses: [
                      "Low personal DPS",
                      "Slow movement",
                      "Melee range attacks",
                    ],
                  },
                  mathey: {
                    abilityDetails: [
                      "Hero becomes invincible for 5 seconds",
                      "Taunts all nearby enemies within 150 range",
                      "Enemies forced to target the hero",
                    ],
                    role: "Tank / Protector",
                    roleColor: "blue",
                    roleIcon: <Shield size={16} />,
                    strategy:
                      "Use Fortress Shield when overwhelmed to draw all enemy fire and protect your towers and troops.",
                    strengths: [
                      "Highest HP in game",
                      "Invincibility ability",
                      "Draws enemy fire",
                    ],
                    synergies: [
                      "Protects squishy troops",
                      "Pairs with high DPS towers",
                    ],
                    weaknesses: [
                      "Low damage output",
                      "Slow movement",
                      "Long ability cooldown",
                    ],
                  },
                  nassau: {
                    abilityDetails: [
                      "Transforms into blue fire phoenix for 6 seconds",
                      "Shoots rapid-fire blue fireballs (35 damage each, 65 AoE radius)",
                      "Attack speed drops to 300ms — devastating DPS burst",
                    ],
                    role: "Sky Guardian",
                    roleColor: "orange",
                    roleIcon: <Bird size={16} />,
                    strategy:
                      "The only hero that can chase and fight flying enemies. Activate Blue Inferno to transform into a blazing blue phoenix, unleashing a rapid barrage of blue fireballs. Devastating burst DPS against clustered enemies.",
                    strengths: [
                      "Can engage flying enemies",
                      "High mobility",
                      "Blue Inferno transformation",
                    ],
                    synergies: [
                      "Essential against flying waves",
                      "Blue Inferno melts boss waves",
                      "Combos with slow towers for clustered hits",
                    ],
                    weaknesses: [
                      "Low base damage per fireball",
                      "Moderate HP pool",
                      "Ability-dependent burst",
                    ],
                  },
                  rocky: {
                    abilityDetails: [
                      "Massive AoE damage in target area",
                      "Damage falls off from center of impact",
                      "Ground crater with dust cloud effect",
                    ],
                    role: "Ranged Artillery",
                    roleColor: "green",
                    roleIcon: <Target size={16} />,
                    strategy:
                      "Position Rocky behind your front line. Use Boulder Bash on clustered enemies for devastating damage.",
                    strengths: [
                      "Massive ranged damage",
                      "Large AoE",
                      "Safe positioning",
                    ],
                    synergies: [
                      "Use with Dinky Station troops",
                      "Combos with Firestone Library",
                    ],
                    weaknesses: [
                      "Vulnerable in melee",
                      "Slow attack speed",
                      "Ability has delay",
                    ],
                  },
                  scott: {
                    abilityDetails: [
                      "Boosts ALL tower damage by 50% for 8 seconds",
                      "Golden light rays emanate from hero",
                      "Affects every tower on the map",
                    ],
                    role: "Support Buffer",
                    roleColor: "cyan",
                    roleIcon: <TrendingUp size={16} />,
                    strategy:
                      "F. Scott is a pure support. Save Inspiration for critical waves or boss enemies to maximize tower damage.",
                    strengths: [
                      "Global tower buff",
                      "Huge DPS increase",
                      "Low risk positioning",
                    ],
                    synergies: [
                      "Best with many towers built",
                      "Combos with high-damage towers",
                    ],
                    weaknesses: [
                      "No direct damage ability",
                      "Relies on towers",
                      "Low personal DPS",
                    ],
                  },
                  tenor: {
                    abilityDetails: [
                      "Deals 80 damage to all enemies within 250 range",
                      "Stuns affected enemies for 2 seconds",
                      "Heals nearby troops for 75 HP",
                    ],
                    role: "AoE Support",
                    roleColor: "purple",
                    roleIcon: <Volume2 size={16} />,
                    strategy:
                      "Position near chokepoints to maximize damage. Sonic Boom both damages enemies and heals your troops.",
                    strengths: [
                      "Large AoE damage",
                      "Heals allied troops",
                      "Good stun duration",
                    ],
                    synergies: [
                      "Great with Dinky Station troops",
                      "Combos with slow towers",
                    ],
                    weaknesses: [
                      "Lower single-target damage",
                      "Moderate HP",
                      "Needs positioning",
                    ],
                  },
                  tiger: {
                    abilityDetails: [
                      "Stuns ALL enemies within 180 range for 3 seconds",
                      "Applies 50% slow effect after stun ends",
                      "Creates orange fear shockwave visual effect",
                    ],
                    role: "Frontline Brawler",
                    roleColor: "orange",
                    roleIcon: <Swords size={16} />,
                    strategy:
                      "Dive into enemy formations when clustered. Use Mighty Roar to stun groups, then retreat while they're slowed.",
                    strengths: [
                      "High melee damage",
                      "Powerful crowd control",
                      "Good survivability",
                    ],
                    synergies: [
                      "Pairs well with AoE towers",
                      "Use with Freeze spell for extended CC",
                    ],
                    weaknesses: [
                      "Short range",
                      "Vulnerable during cooldowns",
                      "Can get overwhelmed",
                    ],
                  },
                };
                const info = heroInfo[selectedHeroDetail] || heroInfo.tiger;

                return (
                  <div>
                    <button
                      onClick={() => setSelectedHeroDetail(null)}
                      className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-4 transition-all font-medium px-3 py-1.5 rounded-lg"
                      style={{
                        background: PANEL.bgWarmMid,
                        border: `1px solid ${GOLD.border25}`,
                      }}
                    >
                      <ChevronRight size={16} className="rotate-180" />
                      <span>Back to all heroes</span>
                    </button>

                    <div className="space-y-6">
                      {/* Hero Header */}
                      <div
                        className="rounded-xl overflow-hidden relative"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border30}`,
                          boxShadow: `inset 0 0 12px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        {(() => {
                          const hcc = getColorClasses(info.roleColor);
                          return (
                            <div
                              className={`px-6 py-3 border-b flex items-center gap-3 ${hcc.headerBg} ${hcc.headerBorder}`}
                            >
                              <span className={hcc.text}>{info.roleIcon}</span>
                              <span
                                className={`text-sm font-medium uppercase tracking-wider ${hcc.text}`}
                              >
                                {info.role}
                              </span>
                            </div>
                          );
                        })()}

                        <div className="p-6 flex items-start gap-6">
                          <FramedCodexSprite
                            size={128}
                            theme={getHeroSpriteFrameTheme(
                              selectedHeroDetail as HeroType
                            )}
                          >
                            <HeroSprite
                              type={selectedHeroDetail as HeroType}
                              size={112}
                            />
                          </FramedCodexSprite>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-3xl font-bold text-amber-200">
                                {hero.name}
                              </h3>
                              <HeroIcon
                                type={selectedHeroDetail as HeroType}
                                size={24}
                              />
                            </div>
                            <p className="text-stone-400 mb-4">
                              {hero.description}
                            </p>
                            <div className="space-y-2.5 bg-stone-900/40 rounded-xl p-4 border border-stone-700/30">
                              <StatBar
                                value={hero.hp}
                                max={heroMaxHp}
                                color="red"
                                label="HP"
                                displayValue={`${hero.hp}`}
                                icon={<Heart size={12} />}
                              />
                              <StatBar
                                value={hero.damage}
                                max={heroMaxDmg}
                                color="orange"
                                label="DMG"
                                displayValue={`${hero.damage}`}
                                icon={<Swords size={12} />}
                              />
                              <StatBar
                                value={hero.range}
                                max={heroMaxRange}
                                color="blue"
                                label="RNG"
                                displayValue={`${hero.range}`}
                                icon={<Target size={12} />}
                              />
                              <StatBar
                                value={1000 / hero.attackSpeed}
                                max={heroMaxAtkRate}
                                color="green"
                                label="ATK"
                                displayValue={`${(hero.attackSpeed / 1000).toFixed(1)}s`}
                                icon={<Gauge size={12} />}
                              />
                              <StatBar
                                value={hero.speed}
                                max={heroMaxSpeed}
                                color="cyan"
                                label="SPD"
                                displayValue={`${hero.speed}`}
                                icon={<Wind size={12} />}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ability Section */}
                      <div className="bg-gradient-to-br from-purple-950/40 to-stone-950 rounded-xl border border-purple-700/50 overflow-hidden">
                        <div className="px-5 py-3 bg-purple-900/30 border-b border-purple-800/40 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <HeroAbilityIcon
                              type={selectedHeroDetail as HeroType}
                              size={18}
                            />
                            <span className="text-sm text-purple-400 font-medium uppercase tracking-wider">
                              Special Ability
                            </span>
                          </div>
                          <div className="flex items-center gap-2 bg-purple-950/50 px-3 py-1.5 rounded-lg border border-purple-700/50">
                            <Timer size={14} className="text-purple-400" />
                            <span className="text-purple-300 font-bold text-sm">
                              {cooldown / 1000}s Cooldown
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-2xl font-bold text-purple-200 mb-2 flex items-center gap-2">
                            <HeroAbilityIcon
                              type={selectedHeroDetail as HeroType}
                              size={24}
                            />
                            {hero.ability}
                          </h4>
                          <p className="text-purple-300 mb-4">
                            {hero.abilityDesc}
                          </p>
                          <div className="bg-purple-950/40 rounded-lg p-4 border border-purple-800/30">
                            <div className="text-xs text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Info size={10} /> Ability Details
                            </div>
                            <ul className="text-sm text-purple-300 space-y-1.5">
                              {info.abilityDetails.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-0.5">
                                    •
                                  </span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="bg-green-950/30 rounded-xl border border-green-800/40 p-4">
                          <h4 className="text-green-300 font-bold mb-3 flex items-center gap-2">
                            <TrendingUp size={16} /> Strengths
                          </h4>
                          <ul className="text-sm text-green-200/80 space-y-1.5">
                            {info.strengths.map((s, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-green-400">✓</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-950/30 rounded-xl border border-red-800/40 p-4">
                          <h4 className="text-red-300 font-bold mb-3 flex items-center gap-2">
                            <CircleOff size={16} /> Weaknesses
                          </h4>
                          <ul className="text-sm text-red-200/80 space-y-1.5">
                            {info.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-red-400">✗</span> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Strategy & Synergies */}
                      <div
                        className="rounded-xl p-5 relative"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border25}`,
                          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        <h4 className="text-amber-200 font-bold mb-3 flex items-center gap-2 relative z-10">
                          <Info size={16} className="text-amber-400" /> Combat
                          Strategy
                        </h4>
                        <p className="text-stone-300 mb-4">{info.strategy}</p>
                        <div className="bg-amber-950/30 rounded-lg p-3 border border-amber-800/30">
                          <div className="text-xs text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Sparkles size={10} /> Synergies
                          </div>
                          <ul className="text-sm text-amber-200/80 space-y-1">
                            {info.synergies.map((s, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="text-amber-400">★</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {activeTab === "troops" && (
              <div className="space-y-5">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                    border: `1.5px solid ${GOLD.border30}`,
                    boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                  }}
                >
                  <div
                    className="absolute inset-[2px] rounded-[14px] pointer-events-none"
                    style={{ border: `1px solid ${GOLD.innerBorder10}` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-blue-300">
                      <Users size={15} />
                      <h3 className="text-lg font-bold">Troop Guide</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      {Object.entries(TROOP_CATEGORY_MAP).map(
                        ([catKey, cat]) => (
                          <div
                            key={catKey}
                            className="rounded-lg border border-stone-700/30 bg-stone-950/40 p-2.5"
                          >
                            <div
                              className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${cat.color}`}
                            >
                              {cat.label}
                            </div>
                            <div className="text-[10px] text-stone-500 mb-1.5">
                              {catKey === "station"
                                ? "Spawned by Dinky Station towers (upgrades at each level)"
                                : catKey === "summoned"
                                  ? "Created by spells — temporary reinforcements"
                                  : "Reanimated by Hex Ward tower — spirit combatants"}
                            </div>
                            <div className="space-y-1">
                              {cat.types.map((type) => {
                                const troop = TROOP_DATA[type];
                                if (!troop) {
                                  return null;
                                }
                                const dps =
                                  troop.damage / (troop.attackSpeed / 1000);
                                return (
                                  <div
                                    key={type}
                                    className="flex items-center gap-1.5 py-0.5"
                                  >
                                    <FramedCodexSprite
                                      size={26}
                                      theme={getTroopSpriteFrameTheme(type)}
                                    >
                                      <TroopSprite type={type} size={20} />
                                    </FramedCodexSprite>
                                    <span className="text-stone-300 font-medium truncate flex-1">
                                      {troop.name}
                                    </span>
                                    <span className="text-red-400/70 shrink-0">
                                      {troop.hp}
                                    </span>
                                    <span className="text-stone-600">/</span>
                                    <span className="text-orange-400/70 shrink-0">
                                      {Math.round(dps)}dps
                                    </span>
                                    {troop.canTargetFlying && (
                                      <Plane
                                        size={9}
                                        className="text-cyan-400 shrink-0"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {Object.entries(TROOP_CATEGORY_MAP).map(([catKey, cat]) => (
                  <div key={catKey}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`text-sm font-bold ${cat.color}`}>
                        {cat.label}
                      </div>
                      <div
                        className="flex-1 h-px"
                        style={{ background: GOLD.border25 }}
                      />
                      <span className="text-[10px] text-stone-500">
                        {cat.types.length} units
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cat.types.map((type) => {
                        const troop = TROOP_DATA[type];
                        if (!troop) {
                          return null;
                        }
                        const troopMaxHp = Math.max(
                          ...troopTypes.map((t) => TROOP_DATA[t].hp),
                          1
                        );
                        const troopMaxDmg = Math.max(
                          ...troopTypes.map((t) => TROOP_DATA[t].damage),
                          1
                        );
                        const troopDps =
                          troop.damage / (troop.attackSpeed / 1000);
                        return (
                          <div
                            key={type}
                            className="rounded-xl overflow-hidden relative h-full flex flex-col"
                            style={{
                              background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                              border: `1.5px solid ${GOLD.border25}`,
                              boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                            }}
                          >
                            <div
                              className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                              style={{
                                border: `1px solid ${GOLD.innerBorder08}`,
                              }}
                            />
                            {(() => {
                              const troopRole = troop.isMounted
                                ? {
                                    color: "amber",
                                    icon: <Wind size={12} />,
                                    label: "Mounted",
                                  }
                                : troop.isRanged
                                  ? {
                                      color: "green",
                                      icon: <Crosshair size={12} />,
                                      label: "Ranged",
                                    }
                                  : troop.isStationary
                                    ? {
                                        color: "stone",
                                        icon: <Target size={12} />,
                                        label: "Static",
                                      }
                                    : {
                                        color: "blue",
                                        icon: <Swords size={12} />,
                                        label: "Melee",
                                      };
                              const tcc = getColorClasses(troopRole.color);
                              return (
                                <div
                                  className={`px-3 py-1.5 border-b flex items-center justify-between ${tcc.headerBg} ${tcc.headerBorder}`}
                                >
                                  <div
                                    className={`flex items-center gap-1.5 ${tcc.text}`}
                                  >
                                    {troopRole.icon}
                                    <span className="text-[10px] font-medium uppercase tracking-wider">
                                      {troopRole.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {troop.canTargetFlying && (
                                      <span className="text-[10px] px-2 py-0.5 bg-cyan-900/50 rounded text-cyan-300 border border-cyan-800/40 flex items-center gap-0.5">
                                        <Plane size={10} /> Anti-Air
                                      </span>
                                    )}
                                    <DPSBadge dps={troopDps} size="sm" />
                                  </div>
                                </div>
                              );
                            })()}
                            <div className="p-3 flex flex-col flex-1">
                              <div className="flex items-start gap-3 mb-2.5">
                                {(() => {
                                  const isKnight = type === "knight";
                                  const isReinforcement =
                                    type === "reinforcement";
                                  const hasTroopVariants =
                                    isKnight || isReinforcement;
                                  if (!hasTroopVariants) {
                                    return (
                                      <FramedCodexSprite
                                        size={80}
                                        theme={getTroopSpriteFrameTheme(type)}
                                      >
                                        <TroopSprite type={type} size={66} />
                                      </FramedCodexSprite>
                                    );
                                  }

                                  const gearIdx =
                                    troopVariantPreview[type] ?? 0;
                                  const colorIdx = troopColorPreview[type] ?? 0;
                                  const gearCount = isKnight
                                    ? KNIGHT_VARIANT_LABELS.length
                                    : CODEX_REINFORCEMENT_VARIANTS.length;
                                  const colorCount = isKnight
                                    ? KNIGHT_COLOR_VARIATIONS.length
                                    : REINFORCEMENT_TIER_COUNT;
                                  const gearLabel = isKnight
                                    ? KNIGHT_VARIANT_LABELS[gearIdx]
                                    : (CODEX_REINFORCEMENT_VARIANTS[gearIdx]
                                        ?.label ?? "");
                                  const colorLabel = isKnight
                                    ? (KNIGHT_COLOR_VARIATIONS[colorIdx]
                                        ?.label ?? "")
                                    : (REINFORCEMENT_TIER_LABELS[colorIdx] ??
                                      "");
                                  const isNonDefault =
                                    gearIdx > 0 || colorIdx > 0;

                                  const gearVisuals = isKnight
                                    ? KNIGHT_CODEX_VISUALS
                                    : REINFORCEMENT_CODEX_VISUALS;
                                  const gearVisual =
                                    gearVisuals[gearIdx] ?? gearVisuals[0];
                                  const colorVisuals = isKnight
                                    ? KNIGHT_COLOR_BUTTON_VISUALS
                                    : REINFORCEMENT_TIER_VISUALS;
                                  const colorVisual =
                                    colorVisuals[colorIdx] ?? colorVisuals[0];

                                  const knightGearIcons = [
                                    <Shield size={11} key="kg0" />,
                                    <Swords size={11} key="kg1" />,
                                    <Crown size={11} key="kg2" />,
                                  ];
                                  const reinforcementGearIcons = [
                                    <Shield size={11} key="rg0" />,
                                    <Eye size={11} key="rg1" />,
                                    <Wind size={11} key="rg2" />,
                                    <Target size={11} key="rg3" />,
                                    <Sparkles size={11} key="rg4" />,
                                  ];
                                  const gearIcon = isKnight
                                    ? knightGearIcons[gearIdx]
                                    : reinforcementGearIcons[gearIdx];

                                  const knightColorIcons = [
                                    <Flag size={11} key="kc0" />,
                                    <Shield size={11} key="kc1" />,
                                    <Flame size={11} key="kc2" />,
                                    <Crown size={11} key="kc3" />,
                                  ];
                                  const colorIcon = isKnight ? (
                                    knightColorIcons[colorIdx]
                                  ) : (
                                    <Zap size={11} />
                                  );

                                  const knightColor =
                                    KNIGHT_COLOR_VARIATIONS[colorIdx];

                                  return (
                                    <div className="relative flex-shrink-0">
                                      <FramedCodexSprite
                                        size={80}
                                        theme={getTroopSpriteFrameTheme(type)}
                                      >
                                        <TroopSprite
                                          type={type}
                                          size={66}
                                          animated={isNonDefault}
                                          knightVariant={
                                            isKnight ? gearIdx : undefined
                                          }
                                          ownerType={
                                            isKnight
                                              ? knightColor?.ownerType
                                              : undefined
                                          }
                                          mapTheme={
                                            isKnight
                                              ? knightColor?.mapTheme
                                              : undefined
                                          }
                                          troopId={
                                            isReinforcement
                                              ? CODEX_REINFORCEMENT_VARIANTS[
                                                  gearIdx
                                                ]?.troopId
                                              : undefined
                                          }
                                          visualTier={
                                            isReinforcement
                                              ? colorIdx
                                              : undefined
                                          }
                                        />
                                      </FramedCodexSprite>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTroopVariantPreview((prev) => ({
                                            ...prev,
                                            [type]: (gearIdx + 1) % gearCount,
                                          }));
                                        }}
                                        className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-[22px] h-[22px] rounded-md transition-all hover:scale-110 active:scale-95"
                                        style={{
                                          background: gearVisual.bg,
                                          border: `1.5px solid ${gearVisual.border}`,
                                          boxShadow:
                                            gearIdx > 0
                                              ? `0 0 6px ${gearVisual.border}`
                                              : "none",
                                          color:
                                            gearIdx > 0
                                              ? "white"
                                              : "rgba(200,200,220,0.8)",
                                        }}
                                        title={`${gearLabel} — click to cycle ${isKnight ? "gear" : "armor"}`}
                                      >
                                        {gearIcon}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTroopColorPreview((prev) => ({
                                            ...prev,
                                            [type]: (colorIdx + 1) % colorCount,
                                          }));
                                        }}
                                        className="absolute -bottom-1.5 -left-1.5 flex items-center justify-center w-[22px] h-[22px] rounded-md transition-all hover:scale-110 active:scale-95"
                                        style={{
                                          background: colorVisual.bg,
                                          border: `1.5px solid ${colorVisual.border}`,
                                          boxShadow:
                                            colorIdx > 0
                                              ? `0 0 6px ${colorVisual.border}`
                                              : "none",
                                          color:
                                            colorIdx > 0
                                              ? "white"
                                              : "rgba(200,200,220,0.8)",
                                        }}
                                        title={`${colorLabel} — click to cycle ${isKnight ? "theme" : "tier"}`}
                                      >
                                        {colorIcon}
                                      </button>
                                    </div>
                                  );
                                })()}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-bold text-amber-200 truncate">
                                    {troop.name}
                                  </h4>
                                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                                    {troop.desc}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-lg bg-stone-950/40 border border-stone-700/25 p-2.5 mb-2 flex-1">
                                <div className="space-y-2">
                                  <StatBar
                                    value={troop.hp}
                                    max={troopMaxHp}
                                    color="red"
                                    label="HP"
                                    displayValue={`${troop.hp}`}
                                    icon={<Heart size={12} />}
                                  />
                                  <StatBar
                                    value={troop.damage}
                                    max={troopMaxDmg}
                                    color="orange"
                                    label="DMG"
                                    displayValue={`${troop.damage}`}
                                    icon={<Swords size={12} />}
                                  />
                                  <StatBar
                                    value={1000 / troop.attackSpeed}
                                    max={troopMaxAtkRate}
                                    color="green"
                                    label="SPD"
                                    displayValue={`${(troop.attackSpeed / 1000).toFixed(1)}s`}
                                    icon={<Gauge size={12} />}
                                  />
                                  {troop.isRanged && (
                                    <StatBar
                                      value={troop.range || 0}
                                      max={200}
                                      color="blue"
                                      label="RNG"
                                      displayValue={`${troop.range}`}
                                      icon={<Target size={12} />}
                                    />
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-auto">
                                <div className="px-2.5 py-2 bg-stone-950/40 rounded-lg border border-stone-700/25">
                                  <div className="text-[10px] text-stone-500 uppercase mb-0.5 tracking-wider font-medium">
                                    Combat
                                  </div>
                                  <div className="text-xs text-stone-300 font-semibold">
                                    {troop.isStationary
                                      ? "Stationary"
                                      : troop.isMounted
                                        ? "Mobile Block"
                                        : "Path Blocker"}
                                  </div>
                                </div>
                                <div className="px-2.5 py-2 bg-stone-950/40 rounded-lg border border-stone-700/25">
                                  <div className="text-[10px] text-stone-500 uppercase mb-0.5 tracking-wider font-medium">
                                    Engagement
                                  </div>
                                  <div className="text-xs text-stone-300 font-semibold">
                                    {troop.isRanged
                                      ? `${troop.range} range`
                                      : "Close quarters"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "enemies" &&
              (() => {
                const groupedEnemies = groupEnemiesByCategory(enemyTypes);
                const variantThemes = getRegionalVariantThemes();

                return (
                  <>
                    {/* Sticky Category Jump Nav — floats top-right above all content */}
                    <div
                      className="sticky top-0 z-50 flex justify-end pointer-events-none overflow-visible"
                      style={{ height: 0 }}
                    >
                      <div className="pointer-events-auto relative">
                        <button
                          onClick={() => setCategoryNavOpen((prev) => !prev)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all hover:brightness-125 active:scale-95"
                          style={{
                            backdropFilter: "blur(8px)",
                            background: "rgba(12,10,9,0.92)",
                            border: "1px solid rgba(180,130,60,0.35)",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                            color: "#d4a44a",
                          }}
                        >
                          <Compass size={13} />
                          <span className="hidden sm:inline">Categories</span>
                        </button>
                        {categoryNavOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setCategoryNavOpen(false)}
                            />
                            <div
                              className="absolute right-0 top-full mt-1 z-50 flex flex-col gap-0.5 p-2 rounded-xl shadow-2xl min-w-[180px]"
                              style={{
                                backdropFilter: "blur(12px)",
                                background: "rgba(12,10,9,0.95)",
                                border: "1px solid rgba(180,130,60,0.3)",
                              }}
                            >
                              {ENEMY_CATEGORY_ORDER.map((cat) => {
                                const catEnemies = groupedEnemies[cat];
                                if (catEnemies.length === 0) {
                                  return null;
                                }
                                const meta = ENEMY_CATEGORY_META[cat];
                                const accent = ENEMY_CATEGORY_ACCENTS[cat];
                                return (
                                  <button
                                    key={cat}
                                    onClick={() => {
                                      scrollToCategory(cat);
                                      setCategoryNavOpen(false);
                                    }}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] font-semibold tracking-wide transition-all hover:brightness-125 text-left w-full"
                                    style={{
                                      background: `${accent}10`,
                                      color: accent,
                                    }}
                                  >
                                    <span className="text-sm">
                                      {CATEGORY_ICONS[cat]}
                                    </span>
                                    {meta.name}
                                    <span className="ml-auto text-[9px] opacity-50">
                                      {catEnemies.length}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div
                        className="relative rounded-2xl overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border30}`,
                          boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[14px] pointer-events-none"
                          style={{ border: `1px solid ${GOLD.innerBorder10}` }}
                        />
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2 text-red-300">
                            <Skull size={15} />
                            <h3 className="text-lg font-bold">
                              Threat Overview
                            </h3>
                            <span className="text-[10px] text-stone-500 ml-auto">
                              {enemyTypes.length} enemy types across{" "}
                              {ENEMY_CATEGORY_ORDER.length} categories
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                            <div className="rounded-lg border border-cyan-800/35 bg-cyan-950/30 px-2.5 py-2 text-center">
                              <Wind
                                size={14}
                                className="mx-auto text-cyan-400 mb-0.5"
                              />
                              <div className="text-lg font-bold text-cyan-200">
                                {flyingEnemyCount}
                              </div>
                              <div className="text-[10px] text-cyan-400">
                                Flying
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                Need anti-air towers
                              </div>
                            </div>
                            <div className="rounded-lg border border-stone-600/35 bg-stone-900/40 px-2.5 py-2 text-center">
                              <Shield
                                size={14}
                                className="mx-auto text-stone-400 mb-0.5"
                              />
                              <div className="text-lg font-bold text-stone-200">
                                {armoredEnemyCount}
                              </div>
                              <div className="text-[10px] text-stone-400">
                                Armored
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                Need high damage
                              </div>
                            </div>
                            <div className="rounded-lg border border-purple-800/35 bg-purple-950/30 px-2.5 py-2 text-center">
                              <Crosshair
                                size={14}
                                className="mx-auto text-purple-400 mb-0.5"
                              />
                              <div className="text-lg font-bold text-purple-200">
                                {rangedEnemyCount}
                              </div>
                              <div className="text-[10px] text-purple-400">
                                Ranged
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                Attack your troops
                              </div>
                            </div>
                            <div className="rounded-lg border border-orange-800/35 bg-orange-950/30 px-2.5 py-2 text-center">
                              <Zap
                                size={14}
                                className="mx-auto text-orange-400 mb-0.5"
                              />
                              <div className="text-lg font-bold text-orange-200">
                                {
                                  enemyTypes.filter(
                                    (t) =>
                                      (ENEMY_DATA[t].abilities?.length ?? 0) > 0
                                  ).length
                                }
                              </div>
                              <div className="text-[10px] text-orange-400">
                                With Abilities
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                Burn, slow, stun, etc
                              </div>
                            </div>
                            <div className="rounded-lg border border-red-800/35 bg-red-950/30 px-2.5 py-2 text-center">
                              <Crown
                                size={14}
                                className="mx-auto text-red-400 mb-0.5"
                              />
                              <div className="text-lg font-bold text-red-200">
                                {bossEnemyCount + regionBossCount}
                              </div>
                              <div className="text-[10px] text-red-400">
                                Bosses
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                Multi-life, high HP
                              </div>
                            </div>
                            <div className="rounded-lg border border-rose-800/35 bg-rose-950/30 px-2.5 py-2 text-center">
                              <Heart
                                size={14}
                                className="mx-auto text-rose-400 mb-0.5"
                              />
                              <div className="text-lg font-bold text-rose-200">
                                {highestLeakEnemy
                                  ? (ENEMY_DATA[highestLeakEnemy].liveCost ?? 1)
                                  : 1}
                              </div>
                              <div className="text-[10px] text-rose-400">
                                Max Leak Cost
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5 truncate">
                                {highestLeakEnemy
                                  ? ENEMY_DATA[highestLeakEnemy].name
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {ENEMY_CATEGORY_ORDER.map((category) => {
                        const categoryEnemies = groupedEnemies[category];
                        if (categoryEnemies.length === 0) {
                          return null;
                        }

                        const catMeta = ENEMY_CATEGORY_META[category];

                        const isRegionBoss = category === "region_boss";

                        return (
                          <div
                            key={category}
                            ref={(el) => setCategoryRef(category, el)}
                          >
                            {/* Category Header */}
                            <div
                              className="flex items-center gap-3 mb-3 pb-3"
                              style={{
                                borderBottom: isRegionBoss
                                  ? "2px solid rgba(239,68,68,0.5)"
                                  : `1px solid ${GOLD.border25}`,
                              }}
                            >
                              <div
                                className={`${isRegionBoss ? "p-3" : "p-2"} rounded-lg ${catMeta.bgColor}`}
                                style={{
                                  border: isRegionBoss
                                    ? "1.5px solid rgba(239,68,68,0.6)"
                                    : `1px solid ${GOLD.border25}`,
                                  boxShadow: isRegionBoss
                                    ? "0 0 12px rgba(239,68,68,0.3), inset 0 0 8px rgba(239,68,68,0.15)"
                                    : undefined,
                                }}
                              >
                                {isRegionBoss ? (
                                  <Crown size={20} className="text-red-400" />
                                ) : (
                                  CATEGORY_ICONS[category]
                                )}
                              </div>
                              <div>
                                <h3
                                  className={`font-bold ${isRegionBoss ? "text-xl" : "text-lg"} ${catMeta.color}`}
                                >
                                  {catMeta.name}
                                </h3>
                                <p
                                  className={`text-xs ${isRegionBoss ? "text-red-400/60" : "text-amber-400/50"}`}
                                >
                                  {catMeta.desc}
                                </p>
                              </div>
                              <div
                                className="ml-auto text-xs font-bold px-2.5 py-1 rounded-md"
                                style={{
                                  background: isRegionBoss
                                    ? "rgba(127,29,29,0.5)"
                                    : PANEL.bgWarmMid,
                                  border: isRegionBoss
                                    ? "1px solid rgba(239,68,68,0.4)"
                                    : `1px solid ${GOLD.border25}`,
                                  color: isRegionBoss
                                    ? "rgb(252,165,165)"
                                    : "rgb(252,211,77)",
                                }}
                              >
                                {categoryEnemies.length}{" "}
                                {categoryEnemies.length === 1
                                  ? "enemy"
                                  : "enemies"}
                              </div>
                            </div>

                            {/* Category Enemies Grid */}
                            <div
                              className={`grid gap-4 ${isRegionBoss ? "sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"}`}
                            >
                              {categoryEnemies.map((type) => {
                                const enemy = ENEMY_DATA[type];
                                const traits = enemy.traits || [];
                                const abilities = enemy.abilities || [];
                                const hasAoE =
                                  enemy.aoeRadius && enemy.aoeDamage;
                                const maxHpInCategory = Math.max(
                                  ...categoryEnemies.map(
                                    (t) => ENEMY_DATA[t].hp
                                  ),
                                  1
                                );

                                const getThreatLevel = (
                                  hp: number,
                                  isBoss?: boolean,
                                  cat?: EnemyCategory
                                ) => {
                                  if (cat === "region_boss") {
                                    return {
                                      color: "red",
                                      icon: <Crown size={12} />,
                                      level: "Region Boss",
                                    };
                                  }
                                  if (isBoss || hp >= 1000) {
                                    return {
                                      color: "purple",
                                      icon: <Crown size={12} />,
                                      level: "Boss",
                                    };
                                  }
                                  if (hp >= 500) {
                                    return {
                                      color: "orange",
                                      icon: <Star size={12} />,
                                      level: "Elite",
                                    };
                                  }
                                  if (hp >= 200) {
                                    return {
                                      color: "yellow",
                                      icon: <Skull size={12} />,
                                      level: "Standard",
                                    };
                                  }
                                  return {
                                    color: "green",
                                    icon: <Skull size={12} />,
                                    level: "Minion",
                                  };
                                };
                                const threat = getThreatLevel(
                                  enemy.hp,
                                  enemy.isBoss,
                                  category
                                );
                                const threatCC = getColorClasses(threat.color);

                                const getEnemyTypeClassification = () => {
                                  if (enemy.flying) {
                                    return {
                                      color: "cyan",
                                      icon: <Wind size={12} />,
                                      type: "Flying",
                                    };
                                  }
                                  if (enemy.isRanged) {
                                    return {
                                      color: "purple",
                                      icon: <Crosshair size={12} />,
                                      type: "Ranged",
                                    };
                                  }
                                  if (enemy.armor > ARMORED_THRESHOLD) {
                                    return {
                                      color: "stone",
                                      icon: <Shield size={12} />,
                                      type: "Armored",
                                    };
                                  }
                                  if (enemy.speed > FAST_SPEED_THRESHOLD) {
                                    return {
                                      color: "green",
                                      icon: <Gauge size={12} />,
                                      type: "Fast",
                                    };
                                  }
                                  return {
                                    color: "red",
                                    icon: <Flag size={12} />,
                                    type: "Ground",
                                  };
                                };
                                const enemyTypeClass =
                                  getEnemyTypeClassification();
                                const typeCC = getColorClasses(
                                  enemyTypeClass.color
                                );

                                return (
                                  <div
                                    key={type}
                                    className="rounded-xl overflow-hidden hover:border-red-700/50 transition-colors relative"
                                    style={{
                                      background: isRegionBoss
                                        ? "linear-gradient(135deg, rgba(127,29,29,0.25), rgba(69,10,10,0.4))"
                                        : `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                                      border: isRegionBoss
                                        ? "2px solid rgba(239,68,68,0.45)"
                                        : `1.5px solid ${GOLD.border25}`,
                                      boxShadow: isRegionBoss
                                        ? "0 0 20px rgba(239,68,68,0.15), inset 0 0 15px rgba(239,68,68,0.08)"
                                        : `inset 0 0 10px ${GOLD.glow04}`,
                                    }}
                                  >
                                    <div
                                      className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                                      style={{
                                        border: isRegionBoss
                                          ? "1px solid rgba(239,68,68,0.15)"
                                          : `1px solid ${GOLD.innerBorder08}`,
                                      }}
                                    />
                                    <div
                                      className={`px-4 py-2 border-b flex items-center justify-between ${threatCC.headerBg} ${threatCC.headerBorder}`}
                                    >
                                      <div
                                        className={`flex items-center gap-2 ${threatCC.text}`}
                                      >
                                        {threat.icon}
                                        <span className="text-xs font-medium uppercase tracking-wider">
                                          {threat.level}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`flex items-center gap-1.5 text-xs ${typeCC.text}`}
                                        >
                                          {enemyTypeClass.icon}
                                          <span>{enemyTypeClass.type}</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-950/60 rounded-lg border border-rose-800/50 flex-shrink-0">
                                          <Heart
                                            size={10}
                                            className="text-rose-400"
                                          />
                                          <span className="text-rose-300 font-bold text-[10px]">
                                            {enemy.liveCost || 1}{" "}
                                            {(enemy.liveCost || 1) > 1
                                              ? "lives"
                                              : "life"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="p-4">
                                      {(() => {
                                        const activeRegion =
                                          enemyRegionPreview[type] ?? null;
                                        const hasVariants =
                                          hasRegionalVariants(type);
                                        const spriteSize = isRegionBoss
                                          ? 80
                                          : 66;
                                        const frameSize = isRegionBoss
                                          ? 96
                                          : 80;
                                        const variantCycle: (MapTheme | null)[] =
                                          [null, ...variantThemes];
                                        const regionVisuals: Record<
                                          MapTheme | "default",
                                          {
                                            icon: React.ReactNode;
                                            bg: string;
                                            border: string;
                                            text: string;
                                            label: string;
                                          }
                                        > = {
                                          default: {
                                            bg: "rgba(22,101,52,0.45)",
                                            border: "rgba(34,197,94,0.4)",
                                            icon: <TreePine size={11} />,
                                            label: "Grassland",
                                            text: "text-green-400",
                                          },
                                          desert: {
                                            bg: "rgba(113,63,18,0.45)",
                                            border: "rgba(234,179,8,0.4)",
                                            icon: <Sun size={11} />,
                                            label: "Desert",
                                            text: "text-yellow-400",
                                          },
                                          grassland: {
                                            bg: "rgba(22,101,52,0.45)",
                                            border: "rgba(34,197,94,0.4)",
                                            icon: <TreePine size={11} />,
                                            label: "Grassland",
                                            text: "text-green-400",
                                          },
                                          swamp: {
                                            bg: "rgba(54,83,20,0.45)",
                                            border: "rgba(132,204,22,0.4)",
                                            icon: <Droplets size={11} />,
                                            label: "Swamp",
                                            text: "text-lime-400",
                                          },
                                          volcanic: {
                                            bg: "rgba(124,45,18,0.45)",
                                            border: "rgba(249,115,22,0.4)",
                                            icon: <Flame size={11} />,
                                            label: "Volcanic",
                                            text: "text-orange-400",
                                          },
                                          winter: {
                                            bg: "rgba(12,74,110,0.45)",
                                            border: "rgba(56,189,248,0.4)",
                                            icon: <Snowflake size={11} />,
                                            label: "Winter",
                                            text: "text-sky-400",
                                          },
                                        };
                                        const currentVisual =
                                          regionVisuals[
                                            activeRegion ?? "default"
                                          ];
                                        return (
                                          <div className="flex items-start gap-4 mb-3">
                                            <div className="relative flex-shrink-0">
                                              <FramedCodexSprite
                                                size={frameSize}
                                                theme={getEnemySpriteFrameTheme(
                                                  type
                                                )}
                                              >
                                                <EnemySprite
                                                  type={type}
                                                  size={spriteSize}
                                                  region={
                                                    activeRegion ?? undefined
                                                  }
                                                  animated={!!activeRegion}
                                                />
                                              </FramedCodexSprite>
                                              {hasVariants && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    const curIdx =
                                                      variantCycle.indexOf(
                                                        activeRegion
                                                      );
                                                    const nextIdx =
                                                      (curIdx + 1) %
                                                      variantCycle.length;
                                                    setEnemyRegionPreview(
                                                      (prev) => ({
                                                        ...prev,
                                                        [type]:
                                                          variantCycle[nextIdx],
                                                      })
                                                    );
                                                  }}
                                                  className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center w-[22px] h-[22px] rounded-md transition-all hover:scale-110 active:scale-95"
                                                  style={{
                                                    background:
                                                      currentVisual.bg,
                                                    border: `1.5px solid ${currentVisual.border}`,
                                                    boxShadow: activeRegion
                                                      ? `0 0 6px ${currentVisual.border}`
                                                      : "none",
                                                    color: activeRegion
                                                      ? "white"
                                                      : "rgba(134,239,172,0.8)",
                                                  }}
                                                  title={`${currentVisual.label} — click to cycle`}
                                                >
                                                  {currentVisual.icon}
                                                </button>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h3
                                                className={`font-bold truncate ${isRegionBoss ? "text-xl text-red-300" : "text-lg text-red-200"}`}
                                              >
                                                {enemy.name}
                                              </h3>
                                              <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                                                {enemy.desc}
                                              </p>
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      <div className="mb-3">
                                        <HPBar
                                          hp={enemy.hp}
                                          maxHp={maxHpInCategory}
                                          isBoss={enemy.isBoss}
                                        />
                                      </div>

                                      <div className="space-y-2 mb-2">
                                        <StatBar
                                          value={enemy.bounty}
                                          max={enemyMaxBounty}
                                          color="amber"
                                          label="LOOT"
                                          displayValue={`${enemy.bounty} PP`}
                                          icon={<Coins size={12} />}
                                        />
                                        <StatBar
                                          value={enemy.speed}
                                          max={enemyMaxSpeed}
                                          color="green"
                                          label="SPD"
                                          displayValue={`${enemy.speed}`}
                                          icon={<Gauge size={12} />}
                                        />
                                        {enemy.armor > 0 && (
                                          <StatBar
                                            value={enemy.armor * 100}
                                            max={enemyMaxArmor}
                                            color="stone"
                                            label="ARM"
                                            displayValue={`${Math.round(enemy.armor * 100)}%`}
                                            icon={<Shield size={12} />}
                                          />
                                        )}
                                      </div>

                                      {/* Ranged Stats (if applicable) */}
                                      {enemy.isRanged && (
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                          <div className="bg-purple-950/40 rounded-lg p-1.5 text-center border border-purple-900/30">
                                            <div className="text-[10px] text-purple-500 font-medium">
                                              Range
                                            </div>
                                            <div className="text-purple-300 font-bold text-xs">
                                              {enemy.range}
                                            </div>
                                          </div>
                                          <div className="bg-purple-950/40 rounded-lg p-1.5 text-center border border-purple-900/30">
                                            <div className="text-[10px] text-purple-500 font-medium">
                                              Atk Speed
                                            </div>
                                            <div className="text-purple-300 font-bold text-xs">
                                              {enemy.attackSpeed
                                                ? `${(enemy.attackSpeed / 1000).toFixed(1)}s`
                                                : "—"}
                                            </div>
                                          </div>
                                          <div className="bg-purple-950/40 rounded-lg p-1.5 text-center border border-purple-900/30">
                                            <div className="text-[10px] text-purple-500 font-medium">
                                              Proj Dmg
                                            </div>
                                            <div className="text-purple-300 font-bold text-xs">
                                              {enemy.projectileDamage}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* AoE Stats (if applicable) */}
                                      {hasAoE && (
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                          <div className="bg-orange-950/40 rounded-lg p-1.5 text-center border border-orange-900/30">
                                            <div className="text-[10px] text-orange-500 font-medium">
                                              AoE Radius
                                            </div>
                                            <div className="text-orange-300 font-bold text-xs">
                                              {enemy.aoeRadius}
                                            </div>
                                          </div>
                                          <div className="bg-orange-950/40 rounded-lg p-1.5 text-center border border-orange-900/30">
                                            <div className="text-[10px] text-orange-500 font-medium">
                                              AoE Damage
                                            </div>
                                            <div className="text-orange-300 font-bold text-xs">
                                              {enemy.aoeDamage}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Flying Troop Attack Stats (if applicable) */}
                                      {enemy.targetsTroops &&
                                        enemy.troopDamage && (
                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="bg-cyan-950/40 rounded-lg p-1.5 text-center border border-cyan-900/30">
                                              <Wind
                                                size={14}
                                                className="mx-auto text-cyan-400 mb-0.5"
                                              />
                                              <div className="text-[10px] text-cyan-500 font-medium">
                                                Swoop Dmg
                                              </div>
                                              <div className="text-cyan-300 font-bold text-xs">
                                                {enemy.troopDamage}
                                              </div>
                                            </div>
                                            <div className="bg-cyan-950/40 rounded-lg p-1.5 text-center border border-cyan-900/30">
                                              <Timer
                                                size={14}
                                                className="mx-auto text-cyan-400 mb-0.5"
                                              />
                                              <div className="text-[10px] text-cyan-500 font-medium">
                                                Atk Speed
                                              </div>
                                              <div className="text-cyan-300 font-bold text-xs">
                                                {(
                                                  (enemy.troopAttackSpeed ||
                                                    DEFAULT_ENEMY_TROOP_ATTACK_SPEED) /
                                                  1000
                                                ).toFixed(1)}
                                                s
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                      {/* Melee Combat Stats (for ground enemies that engage troops) */}
                                      {!enemy.flying &&
                                        !enemy.breakthrough &&
                                        !enemy.isRanged && (
                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div className="bg-red-950/40 rounded-lg p-1.5 text-center border border-red-900/30">
                                              <Swords
                                                size={14}
                                                className="mx-auto text-red-400 mb-0.5"
                                              />
                                              <div className="text-[10px] text-red-500 font-medium">
                                                Melee Dmg
                                              </div>
                                              <div className="text-red-300 font-bold text-xs">
                                                {enemy.troopDamage ??
                                                  DEFAULT_ENEMY_TROOP_DAMAGE}
                                              </div>
                                            </div>
                                            <div className="bg-red-950/40 rounded-lg p-1.5 text-center border border-red-900/30">
                                              <Timer
                                                size={14}
                                                className="mx-auto text-red-400 mb-0.5"
                                              />
                                              <div className="text-[10px] text-red-500 font-medium">
                                                Atk Speed
                                              </div>
                                              <div className="text-red-300 font-bold text-xs">
                                                1.0s
                                              </div>
                                            </div>
                                          </div>
                                        )}

                                      {/* Breakthrough indicator */}
                                      {enemy.breakthrough && (
                                        <div className="mb-2">
                                          <div className="bg-sky-950/40 rounded p-1 text-center border border-sky-900/30">
                                            <div className="text-sky-300 font-bold text-xs flex items-center justify-center gap-1">
                                              <Zap
                                                size={12}
                                                className="text-sky-400"
                                              />
                                              Bypasses Troops
                                            </div>
                                            {enemy.troopDamage != null && (
                                              <div className="text-[11px] text-sky-300/90 mt-0.5">
                                                Hero Dmg:{" "}
                                                <span className="font-bold text-sky-200">
                                                  {enemy.troopDamage}
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Dynamic Traits */}
                                      {traits.length > 0 && (
                                        <div className="mb-2">
                                          <div className="text-[10px] text-stone-500 uppercase font-bold mb-1">
                                            Traits
                                          </div>
                                          <div className="flex flex-wrap gap-1.5">
                                            {traits.map((trait, i) => {
                                              const traitInfo =
                                                getTraitInfo(trait);
                                              return (
                                                <span
                                                  key={i}
                                                  className={`text-[10px] px-2 py-0.5 bg-stone-800/60 rounded-md border border-stone-700/50 flex items-center gap-1 ${traitInfo.color}`}
                                                  title={traitInfo.desc}
                                                >
                                                  {traitInfo.icon}
                                                  <span>{traitInfo.label}</span>
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* Abilities */}
                                      {abilities.length > 0 && (
                                        <div>
                                          <div className="text-[9px] text-stone-500 uppercase font-bold mb-1 flex items-center gap-1">
                                            <Zap size={10} /> Abilities
                                          </div>
                                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                            {abilities.map((ability, i) => {
                                              const abilityInfo =
                                                getAbilityInfo(ability.type);
                                              return (
                                                <div
                                                  key={i}
                                                  className={`p-1.5 rounded border ${abilityInfo.bgColor}`}
                                                >
                                                  <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span
                                                      className={
                                                        abilityInfo.color
                                                      }
                                                    >
                                                      {abilityInfo.icon}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-white">
                                                      {ability.name}
                                                    </span>
                                                    <span className="text-[8px] px-1 py-0.5 bg-black/30 rounded text-white/70 ml-auto">
                                                      {Math.round(
                                                        ability.chance * 100
                                                      )}
                                                      %
                                                    </span>
                                                  </div>
                                                  <p className="text-[9px] text-white/60 mb-1">
                                                    {ability.desc}
                                                  </p>
                                                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[8px]">
                                                    <span className="text-white/50">
                                                      Duration:{" "}
                                                      <span className="text-white/80">
                                                        {(
                                                          ability.duration /
                                                          1000
                                                        ).toFixed(1)}
                                                        s
                                                      </span>
                                                    </span>
                                                    {ability.intensity !==
                                                      undefined && (
                                                      <span className="text-white/50">
                                                        {ability.type ===
                                                          "slow" ||
                                                        ability.type.includes(
                                                          "tower"
                                                        )
                                                          ? "Effect: "
                                                          : "DPS: "}
                                                        <span className="text-white/80">
                                                          {ability.type ===
                                                            "slow" ||
                                                          ability.type.includes(
                                                            "tower"
                                                          )
                                                            ? `${Math.round(ability.intensity * 100)}%`
                                                            : ability.intensity}
                                                        </span>
                                                      </span>
                                                    )}
                                                    {ability.radius && (
                                                      <span className="text-white/50">
                                                        Radius:{" "}
                                                        <span className="text-white/80">
                                                          {ability.radius}
                                                        </span>
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* No abilities/traits message */}
                                      {abilities.length === 0 &&
                                        traits.length === 0 && (
                                          <div className="text-center text-[9px] text-stone-500 py-1">
                                            Standard enemy - no special
                                            abilities
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

            {activeTab === "spells" && (
              <div className="space-y-5">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                    border: `1.5px solid ${GOLD.border30}`,
                    boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                  }}
                >
                  <div
                    className="absolute inset-[2px] rounded-[14px] pointer-events-none"
                    style={{ border: `1px solid ${GOLD.innerBorder10}` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-purple-300">
                      <Zap size={15} />
                      <h3 className="text-lg font-bold">Spell Loadout Guide</h3>
                      <span className="text-[10px] text-stone-500 ml-auto">
                        Equip 3 spells per mission
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {spellTypes.map((type) => {
                        const spell = SPELL_DATA[type];
                        const info = getSpellInfo(type);
                        const scc = getColorClasses(info.color);
                        return (
                          <div
                            key={type}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 border border-stone-700/30 bg-stone-950/40"
                          >
                            <FramedCodexSprite
                              size={42}
                              theme={SPELL_SPRITE_FRAME_THEME[type]}
                            >
                              <SpellSprite type={type} size={34} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-amber-200 truncate">
                                  {spell.name}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 ${scc.chipBg} border ${scc.chipBorder} ${scc.text}`}
                                >
                                  {info.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[9px]">
                                {spell.cost > 0 ? (
                                  <span className="text-amber-400 flex items-center gap-0.5">
                                    <Coins size={8} />
                                    {spell.cost} PP
                                  </span>
                                ) : (
                                  <span className="text-emerald-400 font-bold">
                                    FREE
                                  </span>
                                )}
                                <span className="text-blue-400 flex items-center gap-0.5">
                                  <Timer size={8} />
                                  {spell.cooldown / 1000}s
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                                {spell.desc}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {spellTypes.map((type) => {
                    const spell = SPELL_DATA[type];
                    const info = getSpellInfo(type);

                    return (
                      <div
                        key={type}
                        className="rounded-xl overflow-hidden hover:border-purple-700/50 transition-colors relative"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border25}`,
                          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        {(() => {
                          const scc = getColorClasses(info.color);
                          return (
                            <div
                              className={`px-4 py-2.5 border-b flex items-center justify-between ${scc.headerBg} ${scc.headerBorder}`}
                            >
                              <div
                                className={`flex items-center gap-2 ${scc.text}`}
                              >
                                {info.icon}
                                <span className="text-xs font-medium uppercase tracking-wider">
                                  {info.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {spell.cost > 0 ? (
                                  <span className="text-amber-400 flex items-center gap-1 text-xs font-bold">
                                    <Coins size={12} /> {spell.cost} PP
                                  </span>
                                ) : (
                                  <span className="text-emerald-400 flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 bg-emerald-950/50 rounded border border-emerald-800/40">
                                    FREE
                                  </span>
                                )}
                                <span className="text-blue-400 flex items-center gap-1 text-xs">
                                  <Timer size={12} />
                                  {spell.cooldown / 1000}s
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="p-4">
                          <div className="flex items-start gap-4 mb-4">
                            <FramedCodexSprite
                              size={80}
                              theme={SPELL_SPRITE_FRAME_THEME[type]}
                            >
                              <SpellSprite type={type} size={66} />
                            </FramedCodexSprite>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-purple-200">
                                  {spell.name}
                                </h3>
                                <SpellIcon type={type} size={20} />
                              </div>
                              <p className="text-sm text-stone-400">
                                {spell.desc}
                              </p>
                            </div>
                          </div>

                          {(() => {
                            const scc = getColorClasses(info.color);
                            return (
                              <>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  {info.stats.map((stat, i) => (
                                    <div
                                      key={i}
                                      className={`rounded-lg p-2.5 text-center border ${scc.statBg} ${scc.statBorder}`}
                                    >
                                      <div
                                        className={`flex items-center justify-center mb-1 ${scc.text}`}
                                      >
                                        {stat.icon}
                                      </div>
                                      <div className="text-[9px] text-stone-500 uppercase tracking-wider">
                                        {stat.label}
                                      </div>
                                      <div
                                        className={`font-bold text-sm ${scc.statText}`}
                                      >
                                        {stat.value}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="bg-stone-800/40 rounded-lg p-3 border border-stone-700/40 mb-3">
                                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Info size={10} /> Details
                                  </div>
                                  <ul className="text-xs text-stone-300 space-y-1.5">
                                    {info.details.map((detail, i) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2"
                                      >
                                        <span className={`mt-0.5 ${scc.text}`}>
                                          •
                                        </span>
                                        <span className="leading-relaxed">
                                          {detail}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div
                                  className={`rounded-lg px-3 py-2.5 text-xs flex items-start gap-2 border ${scc.statBg} ${scc.statBorder}`}
                                >
                                  <Sparkles
                                    size={12}
                                    className={`mt-0.5 shrink-0 ${scc.text}`}
                                  />
                                  <div>
                                    <span
                                      className={`font-semibold ${scc.statText}`}
                                    >
                                      Pro Tip:{" "}
                                    </span>
                                    <span className="text-stone-400">
                                      {info.tip}
                                    </span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "special_towers" && (
              <div className="space-y-5">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                    border: `1.5px solid ${GOLD.border30}`,
                    boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                  }}
                >
                  <div
                    className="absolute inset-[2px] rounded-[14px] pointer-events-none"
                    style={{ border: `1px solid ${GOLD.innerBorder10}` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-amber-300">
                      <Sparkles size={15} />
                      <h3 className="text-lg font-bold">Map Structures</h3>
                      <span className="text-[10px] text-stone-500 ml-auto">
                        Found on {levelsWithSpecialStructures} maps
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {specialTowerTypesInUse.map((type) => {
                        const info = SPECIAL_TOWER_INFO[type];
                        const count = specialTowerInstanceCounts.get(type) ?? 0;
                        return (
                          <div
                            key={type}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 border border-stone-700/30 bg-stone-950/40"
                          >
                            <FramedCodexSprite
                              size={42}
                              theme={SPECIAL_TOWER_SPRITE_THEME[type]}
                            >
                              <SpecialTowerSprite type={type} size={34} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-bold truncate ${info.color}`}
                                >
                                  {info.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800/50 border border-stone-700/40 text-stone-400 font-medium shrink-0">
                                  {info.role}
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-400 leading-snug mt-0.5 line-clamp-2">
                                {info.effect}
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                {count} placement{count !== 1 ? "s" : ""} across
                                maps
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {specialTowerTypesInUse.map((type) => {
                    const info = SPECIAL_TOWER_INFO[type];
                    const levels = [...(specialTowerLevels.get(type) || [])];
                    return (
                      <div
                        key={type}
                        className="rounded-xl overflow-hidden relative"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border25}`,
                          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        <div
                          className={`px-4 py-2 border-b flex items-center justify-between ${info.panelClass}`}
                        >
                          <div
                            className={`flex items-center gap-2 ${info.color}`}
                          >
                            {info.icon}
                            <span className="text-xs font-medium uppercase tracking-wider">
                              {info.role}
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900/60 text-stone-300 border border-stone-700/50 font-medium">
                            {levels.length}{" "}
                            {levels.length === 1 ? "map" : "maps"}
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start gap-4 mb-4">
                            <FramedCodexSprite
                              size={80}
                              theme={SPECIAL_TOWER_SPRITE_THEME[type]}
                            >
                              <SpecialTowerSprite type={type} size={66} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-xl font-bold ${info.color}`}>
                                {info.name}
                              </h3>
                              <p className="text-sm text-stone-400 mt-1 leading-relaxed">
                                {info.effect}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                            <div className="rounded-lg border border-stone-700/40 bg-stone-950/40 p-3">
                              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Gauge size={10} /> Numbers
                              </div>
                              <p className="text-sm text-stone-200 leading-relaxed">
                                {info.numbers}
                              </p>
                            </div>
                            <div className="rounded-lg border border-stone-700/40 bg-stone-950/40 p-3">
                              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Sparkles size={10} /> Tactical Tip
                              </div>
                              <p className="text-sm text-stone-300 leading-relaxed">
                                {info.tip}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-700/30">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5">
                              Appears On
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {levels.slice(0, 8).map((levelName) => (
                                <span
                                  key={levelName}
                                  className="rounded-full border border-stone-600/40 bg-stone-900/45 px-2 py-0.5 text-[11px] text-stone-300"
                                >
                                  {levelName}
                                </span>
                              ))}
                              {levels.length > 8 && (
                                <span className="rounded-full border border-stone-600/40 bg-stone-900/45 px-2 py-0.5 text-[11px] text-stone-400">
                                  +{levels.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "hazards" && (
              <div className="space-y-5">
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                    border: `1.5px solid ${GOLD.border30}`,
                    boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                  }}
                >
                  <div
                    className="absolute inset-[2px] rounded-[14px] pointer-events-none"
                    style={{ border: `1px solid ${GOLD.innerBorder10}` }}
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2 text-red-300">
                      <AlertTriangle size={15} />
                      <h3 className="text-lg font-bold">
                        Environmental Hazards
                      </h3>
                      <span className="text-[10px] text-stone-500 ml-auto">
                        Active on {levelsWithHazards} maps
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {hazardTypesInUse.map((type) => {
                        const info = HAZARD_INFO[type];
                        const zones = hazardZoneCounts.get(type) ?? 0;
                        return (
                          <div
                            key={type}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 border border-stone-700/30 bg-stone-950/40"
                          >
                            <FramedCodexSprite
                              size={42}
                              theme={
                                HAZARD_SPRITE_THEME[type] ??
                                buildThemeFromAccent("#f87171")
                              }
                            >
                              <HazardSprite type={type} size={34} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-bold truncate ${info.color}`}
                                >
                                  {info.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800/50 border border-stone-700/40 text-stone-400 font-medium shrink-0">
                                  {info.numbers}
                                </span>
                              </div>
                              <div className="text-[10px] text-stone-400 leading-snug mt-0.5 line-clamp-2">
                                {info.effect}
                              </div>
                              <div className="text-[9px] text-stone-500 mt-0.5">
                                {zones} zone{zones !== 1 ? "s" : ""} across maps
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {hazardTypesInUse.map((type) => {
                    const info = HAZARD_INFO[type];
                    const levels = [...(hazardLevels.get(type) || [])];
                    return (
                      <div
                        key={type}
                        className="rounded-xl overflow-hidden relative"
                        style={{
                          background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                          border: `1.5px solid ${GOLD.border25}`,
                          boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                        }}
                      >
                        <div
                          className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10"
                          style={{ border: `1px solid ${GOLD.innerBorder08}` }}
                        />
                        <div
                          className={`px-4 py-2 border-b flex items-center justify-between ${info.panelClass}`}
                        >
                          <div
                            className={`flex items-center gap-2 ${info.color}`}
                          >
                            {info.icon}
                            <span className="text-xs font-medium uppercase tracking-wider">
                              Env Hazard
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900/60 text-stone-300 border border-stone-700/50 font-medium">
                            {levels.length}{" "}
                            {levels.length === 1 ? "map" : "maps"}
                          </span>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start gap-4 mb-4">
                            <FramedCodexSprite
                              size={80}
                              theme={
                                HAZARD_SPRITE_THEME[type] ??
                                buildThemeFromAccent("#f87171")
                              }
                            >
                              <HazardSprite type={type} size={66} />
                            </FramedCodexSprite>
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-xl font-bold ${info.color}`}>
                                {info.name}
                              </h3>
                              <p className="text-sm text-stone-400 mt-1 leading-relaxed">
                                {info.effect}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
                            <div className="rounded-lg border border-stone-700/40 bg-stone-950/40 p-3">
                              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Gauge size={10} /> Numbers
                              </div>
                              <p className="text-sm text-stone-200 leading-relaxed">
                                {info.numbers}
                              </p>
                            </div>
                            <div className="rounded-lg border border-stone-700/40 bg-stone-950/40 p-3">
                              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <Shield size={10} /> Counterplay
                              </div>
                              <p className="text-sm text-stone-300 leading-relaxed">
                                {info.counterplay}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-700/30">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5">
                              Appears On
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {levels.slice(0, 8).map((levelName) => (
                                <span
                                  key={levelName}
                                  className="rounded-full border border-stone-600/40 bg-stone-900/45 px-2 py-0.5 text-[11px] text-stone-300"
                                >
                                  {levelName}
                                </span>
                              ))}
                              {levels.length > 8 && (
                                <span className="rounded-full border border-stone-600/40 bg-stone-900/45 px-2 py-0.5 text-[11px] text-stone-400">
                                  +{levels.length - 8} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "guide" && (
              <div className="space-y-5">
                <div className="rounded-2xl border border-amber-700/35 bg-gradient-to-br from-amber-950/35 via-stone-950/45 to-indigo-950/20 p-4">
                  <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-amber-200 mb-1">
                        <Info size={16} />
                        <h3 className="text-xl font-bold">
                          How To Play: Full Battle Loop
                        </h3>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">
                        Start with{" "}
                        <span className="text-amber-300 font-semibold">
                          {INITIAL_PAW_POINTS} PP
                        </span>
                        , defend{" "}
                        <span className="text-rose-300 font-semibold">
                          {INITIAL_LIVES} lives
                        </span>
                        , and pace your economy against escalating wave density.
                        Auto-wave cadence begins at{" "}
                        <span className="text-cyan-300 font-semibold">
                          {Math.round(WAVE_TIMER_BASE / 1000)}s
                        </span>
                        , but you can launch early when your setup is ready.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {featuredTowerTypes.slice(0, 2).map((type) => (
                          <FramedCodexSprite
                            key={`guide-tower-${type}`}
                            size={52}
                            theme={TOWER_SPRITE_FRAME_THEME[type]}
                          >
                            <TowerSprite type={type} size={42} level={2} />
                          </FramedCodexSprite>
                        ))}
                        {featuredEnemyTypes.slice(0, 2).map((type) => (
                          <FramedCodexSprite
                            key={`guide-enemy-${type}`}
                            size={52}
                            theme={getEnemySpriteFrameTheme(type)}
                          >
                            <EnemySprite type={type} size={42} />
                          </FramedCodexSprite>
                        ))}
                        {featuredHeroTypes.slice(0, 1).map((type) => (
                          <FramedCodexSprite
                            key={`guide-hero-${type}`}
                            size={52}
                            theme={getHeroSpriteFrameTheme(type)}
                          >
                            <HeroSprite type={type} size={42} />
                          </FramedCodexSprite>
                        ))}
                        {spellTypes.slice(0, 1).map((type) => (
                          <FramedCodexSprite
                            key={`guide-spell-${type}`}
                            size={52}
                            theme={SPELL_SPRITE_FRAME_THEME[type]}
                          >
                            <SpellSprite type={type} size={42} />
                          </FramedCodexSprite>
                        ))}
                        {featuredSpecialTowers.slice(0, 1).map((type) => (
                          <FramedCodexSprite
                            key={`guide-special-${type}`}
                            size={52}
                            theme={SPECIAL_TOWER_SPRITE_THEME[type]}
                          >
                            <SpecialTowerSprite type={type} size={42} />
                          </FramedCodexSprite>
                        ))}
                        {featuredHazards.slice(0, 1).map((type) => (
                          <FramedCodexSprite
                            key={`guide-hazard-${type}`}
                            size={52}
                            theme={
                              HAZARD_SPRITE_THEME[type] ??
                              buildThemeFromAccent("#f87171")
                            }
                          >
                            <HazardSprite type={type} size={42} />
                          </FramedCodexSprite>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-[430px]">
                      <div className="rounded-lg border border-purple-700/30 bg-purple-950/25 p-2.5">
                        <div className="text-[10px] text-purple-300 uppercase tracking-wider mb-1">
                          Maps
                        </div>
                        <div className="text-xl font-bold text-purple-200">
                          {campaignLevelCount + challengeLevelCount}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Campaign + Challenge
                        </div>
                      </div>
                      <div className="rounded-lg border border-sky-700/30 bg-sky-950/25 p-2.5">
                        <div className="text-[10px] text-sky-300 uppercase tracking-wider mb-1">
                          Dual Paths
                        </div>
                        <div className="text-xl font-bold text-sky-200">
                          {dualPathLevelCount}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Split-lane pressure maps
                        </div>
                      </div>
                      <div className="rounded-lg border border-orange-700/30 bg-orange-950/25 p-2.5">
                        <div className="text-[10px] text-orange-300 uppercase tracking-wider mb-1">
                          Tower Types
                        </div>
                        <div className="text-xl font-bold text-orange-200">
                          {towerTypes.length}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Core build arsenal
                        </div>
                      </div>
                      <div className="rounded-lg border border-red-700/30 bg-red-950/25 p-2.5">
                        <div className="text-[10px] text-red-300 uppercase tracking-wider mb-1">
                          Enemy Types
                        </div>
                        <div className="text-xl font-bold text-red-200">
                          {enemyTypes.length}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          Unique unit profiles
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="mt-3 relative rounded-lg overflow-hidden border border-amber-700/25"
                    style={{ height: 80 }}
                  >
                    <Image
                      src="/images/new/gameplay_volcano_ui.png"
                      alt="Gameplay overview"
                      fill
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-cover object-center"
                      style={{ opacity: 0.35 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-950/70 via-transparent to-amber-950/70" />
                    <div className="absolute inset-0 flex items-center justify-center gap-6 text-[10px] text-amber-300/80 uppercase tracking-widest font-semibold">
                      <span>Build</span>
                      <ChevronRight size={10} className="text-amber-400/40" />
                      <span>Defend</span>
                      <ChevronRight size={10} className="text-amber-400/40" />
                      <span>Upgrade</span>
                      <ChevronRight size={10} className="text-amber-400/40" />
                      <span>Conquer</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-red-800/35 bg-red-950/20 p-4">
                    <div className="flex items-center gap-2 text-red-300 mb-2">
                      <Skull size={14} />
                      <span className="text-sm font-semibold">
                        1) Enemies and Threat Traits
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredEnemyTypes.map((type) => (
                        <FramedCodexSprite
                          key={`enemy-guide-${type}`}
                          size={52}
                          theme={getEnemySpriteFrameTheme(type)}
                        >
                          <EnemySprite type={type} size={42} />
                        </FramedCodexSprite>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="rounded border border-red-800/35 bg-red-950/25 px-2 py-1.5 text-red-200">
                        Bosses: {bossEnemyCount}
                      </div>
                      <div className="rounded border border-cyan-800/35 bg-cyan-950/25 px-2 py-1.5 text-cyan-200">
                        Flying: {flyingEnemyCount}
                      </div>
                      <div className="rounded border border-green-800/35 bg-green-950/25 px-2 py-1.5 text-green-200">
                        Ranged: {rangedEnemyCount}
                      </div>
                      <div className="rounded border border-amber-800/35 bg-amber-950/25 px-2 py-1.5 text-amber-200">
                        Armored: {armoredEnemyCount}
                      </div>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Read trait badges in the enemy codex and pre-build
                      counters. Flying ignores ground blocks, armored needs
                      sustained DPS, ranged enemies punish weak backline
                      coverage, and bosses consume multiple lives if they leak.
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-800/35 bg-amber-950/20 p-4">
                    <div className="flex items-center gap-2 text-amber-300 mb-2">
                      <Crown size={14} />
                      <span className="text-sm font-semibold">
                        2) Towers and Upgrade Priorities
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {towerTypes.map((type) => (
                        <FramedCodexSprite
                          key={`tower-guide-${type}`}
                          size={52}
                          theme={TOWER_SPRITE_FRAME_THEME[type]}
                        >
                          <TowerSprite type={type} size={42} level={2} />
                        </FramedCodexSprite>
                      ))}
                    </div>
                    <div
                      className="relative rounded-lg overflow-hidden border border-amber-700/25 mb-3"
                      style={{ height: 90 }}
                    >
                      <Image
                        src="/images/new/all_towers.png"
                        alt="All campus towers"
                        fill
                        sizes="(max-width: 640px) 100vw, 500px"
                        className="object-cover object-center"
                        style={{ opacity: 0.45 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/80 via-transparent to-amber-950/40" />
                      <div className="absolute bottom-1.5 left-2.5 text-[10px] text-amber-300/70 font-semibold tracking-wider uppercase">
                        7 Campus Towers · 14 Upgrade Paths
                      </div>
                    </div>
                    <div className="rounded border border-amber-800/35 bg-amber-950/25 px-2 py-1.5 text-xs text-amber-200 mb-2">
                      Cost range:{" "}
                      {cheapestTower
                        ? `${TOWER_DATA[cheapestTower.type].name} (${cheapestTower.cost} PP)`
                        : "-"}{" "}
                      to{" "}
                      {priciestTower
                        ? `${TOWER_DATA[priciestTower.type].name} (${priciestTower.cost} PP)`
                        : "-"}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Open with lane coverage first, then stack level 2-3
                      upgrades on towers that already have strong uptime.
                      Don&apos;t over-expand level 1 towers; concentrated
                      upgrades beat thin spread damage.
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-800/35 bg-blue-950/20 p-4">
                    <div className="flex items-center gap-2 text-blue-300 mb-2">
                      <Flag size={14} />
                      <span className="text-sm font-semibold">
                        3) Maps, Paths, and Lane Geometry
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                      {REGION_IMAGES.map((region) => (
                        <div
                          key={region.label}
                          className="relative rounded-md overflow-hidden border border-blue-700/25 aspect-[16/10]"
                        >
                          <Image
                            src={region.src}
                            alt={region.alt}
                            fill
                            sizes="100px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <span className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] text-blue-200/90 font-semibold tracking-wider">
                            {region.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-blue-800/35 bg-blue-950/20 p-2.5 mb-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <FramedCodexSprite
                          size={42}
                          theme={getEnemySpriteFrameTheme(
                            featuredEnemyTypes[0]
                          )}
                        >
                          <EnemySprite type={featuredEnemyTypes[0]} size={34} />
                        </FramedCodexSprite>
                        <ChevronRight size={14} className="text-blue-300/80" />
                        <FramedCodexSprite
                          size={42}
                          theme={getEnemySpriteFrameTheme(
                            featuredEnemyTypes[1] || featuredEnemyTypes[0]
                          )}
                        >
                          <EnemySprite
                            type={
                              featuredEnemyTypes[1] || featuredEnemyTypes[0]
                            }
                            size={34}
                          />
                        </FramedCodexSprite>
                        <ChevronRight size={14} className="text-blue-300/80" />
                        <FramedCodexSprite
                          size={42}
                          theme={
                            TOWER_SPRITE_FRAME_THEME[featuredTowerTypes[0]]
                          }
                        >
                          <TowerSprite
                            type={featuredTowerTypes[0]}
                            size={34}
                            level={2}
                          />
                        </FramedCodexSprite>
                        <ChevronRight size={14} className="text-blue-300/80" />
                        <FramedCodexSprite
                          size={42}
                          theme={
                            TOWER_SPRITE_FRAME_THEME[
                              featuredTowerTypes[1] || featuredTowerTypes[0]
                            ]
                          }
                        >
                          <TowerSprite
                            type={
                              featuredTowerTypes[1] || featuredTowerTypes[0]
                            }
                            size={34}
                            level={3}
                          />
                        </FramedCodexSprite>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="rounded border border-blue-800/35 bg-blue-950/25 px-2 py-1.5 text-blue-200">
                        Path variants: {mapPathEntries.length}
                      </div>
                      <div className="rounded border border-purple-800/35 bg-purple-950/25 px-2 py-1.5 text-purple-200">
                        Avg nodes/path: {averagePathNodes.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Long turns are best for DOT and slows; short straights
                      favor burst. Dual-path maps require independent leak
                      control on each lane. Longest path is{" "}
                      <span className="text-blue-200 font-medium">
                        {longestPathEntry
                          ? `${formatKeyLabel(longestPathEntry[0])} (${longestPathEntry[1].length} nodes)`
                          : "N/A"}
                      </span>
                      , shortest is{" "}
                      <span className="text-blue-200 font-medium">
                        {shortestPathEntry
                          ? `${formatKeyLabel(shortestPathEntry[0])} (${shortestPathEntry[1].length} nodes)`
                          : "N/A"}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="rounded-xl border border-fuchsia-800/35 bg-fuchsia-950/20 p-4">
                    <div className="flex items-center gap-2 text-fuchsia-300 mb-2">
                      <Timer size={14} />
                      <span className="text-sm font-semibold">
                        4) Wave Design and Spawn Rhythm
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredEnemyTypes.slice(0, 3).map((type) => (
                        <FramedCodexSprite
                          key={`wave-enemy-${type}`}
                          size={48}
                          theme={getEnemySpriteFrameTheme(type)}
                        >
                          <EnemySprite type={type} size={38} />
                        </FramedCodexSprite>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div className="rounded border border-fuchsia-800/35 bg-fuchsia-950/25 px-2 py-1.5 text-fuchsia-200">
                        Configured maps: {mapWaveEntries.length}
                      </div>
                      <div className="rounded border border-violet-800/35 bg-violet-950/25 px-2 py-1.5 text-violet-200">
                        Total waves: {totalConfiguredWaves}
                      </div>
                      <div className="rounded border border-purple-800/35 bg-purple-950/25 px-2 py-1.5 text-purple-200">
                        Avg waves/map: {averageWavesPerMap.toFixed(1)}
                      </div>
                      <div className="rounded border border-pink-800/35 bg-pink-950/25 px-2 py-1.5 text-pink-200">
                        Avg groups/wave: {averageGroupsPerWave.toFixed(1)}
                      </div>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Waves are layered into staggered groups by delay +
                      interval, so lane pressure can spike before the timer
                      ends. Peak grouped wave:{" "}
                      <span className="text-fuchsia-200 font-medium">
                        {peakGroupWave
                          ? `${formatKeyLabel(peakGroupWave.mapKey)} W${peakGroupWave.waveNumber} (${peakGroupWave.groupCount} groups)`
                          : "N/A"}
                      </span>
                      . Densest wave by raw bodies:{" "}
                      <span className="text-fuchsia-200 font-medium">
                        {densestWave
                          ? `${formatKeyLabel(densestWave.mapKey)} W${densestWave.waveNumber} (${densestWave.enemyCount} enemies)`
                          : "N/A"}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-800/35 bg-green-950/20 p-4">
                    <div className="flex items-center gap-2 text-green-300 mb-2">
                      <Gauge size={14} />
                      <span className="text-sm font-semibold">
                        5) Tempo Controls: Speed + Early Start
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      <span className="rounded border border-green-800/35 bg-green-950/30 px-2 py-1 text-green-200">
                        Speed presets: 0.5x / 1x / 2x
                      </span>
                      <span className="rounded border border-green-800/35 bg-green-950/30 px-2 py-1 text-green-200">
                        Fine tuning: +/- 0.25x
                      </span>
                      <span className="rounded border border-amber-800/35 bg-amber-950/30 px-2 py-1 text-amber-200">
                        Pause: 0x
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      The top HUD lets you control simulation speed instantly.
                      To launch early, click a lane&apos;s skull wave bubble
                      once to preview enemies, then click the same bubble again
                      to confirm and start immediately. Early starts are
                      high-value when your cooldowns are up and build order is
                      stable.
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-800/35 bg-purple-950/20 p-4">
                    <div className="flex items-center gap-2 text-purple-300 mb-2">
                      <Shield size={14} />
                      <span className="text-sm font-semibold">
                        6) Heroes and Ability Windows
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredHeroTypes.map((type) => (
                        <FramedCodexSprite
                          key={`hero-guide-${type}`}
                          size={52}
                          theme={getHeroSpriteFrameTheme(type)}
                        >
                          <HeroSprite type={type} size={42} />
                        </FramedCodexSprite>
                      ))}
                      {featuredHeroTypes[0] && (
                        <div className="rounded-lg border border-purple-700/40 bg-purple-950/30 p-1.5 flex items-center justify-center">
                          <HeroAbilityIcon
                            type={featuredHeroTypes[0]}
                            size={26}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Pick one hero before deployment and reposition them to
                      live lanes. Ability timing matters more than raw cooldown
                      uptime: hold abilities for stacked groups, boss entries,
                      or leak-recovery moments where one cast can preserve
                      multiple lives.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-800/35 bg-cyan-950/20 p-4">
                    <div className="flex items-center gap-2 text-cyan-300 mb-2">
                      <Zap size={14} />
                      <span className="text-sm font-semibold">
                        7) Spells, Cooldowns, and Economy
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {spellTypes.map((type) => (
                        <FramedCodexSprite
                          key={`spell-guide-${type}`}
                          size={50}
                          theme={SPELL_SPRITE_FRAME_THEME[type]}
                        >
                          <SpellSprite type={type} size={40} />
                        </FramedCodexSprite>
                      ))}
                    </div>
                    <div className="rounded border border-cyan-800/35 bg-cyan-950/25 px-2 py-1.5 text-xs text-cyan-200 mb-2">
                      Pre-match loadout requires 1 hero + 3 spells.
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Cast proactively to shape wave tempo, not only for panic
                      cleanup. Fireball/Lightning delete clusters, Freeze resets
                      global pressure, Payday funds greed-to-power spikes, and
                      Reinforcements create emergency frontline anchors.
                    </p>
                  </div>

                  <div className="rounded-xl border border-sky-800/35 bg-sky-950/20 p-4">
                    <div className="flex items-center gap-2 text-sky-300 mb-2">
                      <Crosshair size={14} />
                      <span className="text-sm font-semibold">
                        8) Ranged Combat and Target Priority
                      </span>
                    </div>
                    <div
                      className="relative rounded-lg overflow-hidden border border-sky-700/25 mb-3"
                      style={{ height: 80 }}
                    >
                      <Image
                        src="/images/new/gameplay_missile1.png"
                        alt="Missile barrage in action"
                        fill
                        sizes="(max-width: 640px) 100vw, 500px"
                        className="object-cover object-center"
                        style={{ opacity: 0.4 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-sky-950/70 via-transparent to-sky-950/70" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <FramedCodexSprite
                        size={50}
                        theme={TOWER_SPRITE_FRAME_THEME.arch}
                      >
                        <TowerSprite type="arch" size={40} level={3} />
                      </FramedCodexSprite>
                      <FramedCodexSprite
                        size={50}
                        theme={TOWER_SPRITE_FRAME_THEME.lab}
                      >
                        <TowerSprite type="lab" size={40} level={3} />
                      </FramedCodexSprite>
                      <FramedCodexSprite
                        size={50}
                        theme={getEnemySpriteFrameTheme("archer")}
                      >
                        <EnemySprite type="archer" size={40} />
                      </FramedCodexSprite>
                      <FramedCodexSprite
                        size={50}
                        theme={getEnemySpriteFrameTheme("crossbowman")}
                      >
                        <EnemySprite type="crossbowman" size={40} />
                      </FramedCodexSprite>
                      <FramedCodexSprite
                        size={50}
                        theme={getEnemySpriteFrameTheme("warlock")}
                      >
                        <EnemySprite type="warlock" size={40} />
                      </FramedCodexSprite>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Ranged enemies and flying units demand earlier
                      interception than melee packs. Keep at least one anti-air
                      / ranged-ready lane package, and remember that
                      Reinforcement troops can gain ranged volleys at higher
                      spell levels (current preview:{" "}
                      {reinforcementGuideStats.knightCount} units,{" "}
                      {reinforcementGuideStats.knightDamage} DMG each).
                    </p>
                  </div>

                  <div className="rounded-xl border border-rose-800/35 bg-rose-950/20 p-4">
                    <div className="flex items-center gap-2 text-rose-300 mb-2">
                      <Sparkles size={14} />
                      <span className="text-sm font-semibold">
                        9) Special Towers + Hazards as Multipliers
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredSpecialTowers.slice(0, 3).map((type) => (
                        <SpecialTowerSprite
                          key={`mix-special-${type}`}
                          type={type}
                          size={50}
                        />
                      ))}
                      {featuredHazards.slice(0, 3).map((type) => (
                        <FramedCodexSprite
                          key={`mix-hazard-${type}`}
                          size={50}
                          theme={
                            HAZARD_SPRITE_THEME[type] ??
                            buildThemeFromAccent("#f87171")
                          }
                        >
                          <HazardSprite type={type} size={38} />
                        </FramedCodexSprite>
                      ))}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Treat map mechanics as part of your build. Aura structures
                      amplify nearby towers, objective structures create
                      forced-defense lanes, and hazards can either stall for
                      free damage or accelerate enemy leaks. Overlay these
                      systems with hero and spell windows for high-efficiency
                      clears.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-800/35 bg-blue-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2 text-blue-300">
                    <Info size={14} />
                    <span className="text-sm font-semibold">
                      Match Checklist (Start to Finish)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-stone-300">
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">
                      Lock 1 hero + 3 spells before launch
                    </div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">
                      Cover every active path before greed upgrades
                    </div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">
                      Use early-wave bubble starts when cooldowns are ready
                    </div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">
                      Reserve one recovery tool for unexpected leaks
                    </div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">
                      Protect objective lanes on vault/special maps
                    </div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">
                      Exploit hazard zones with stuns, slows, and burst
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </OrnateFrame>
      </div>
    </BaseModal>
  );
};
