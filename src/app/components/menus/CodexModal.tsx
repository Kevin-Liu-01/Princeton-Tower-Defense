"use client";
import React, { useState } from "react";
import Image from "next/image";
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
  EyeOff,
  AlertTriangle,
  Footprints,
  Plane,
} from "lucide-react";
import type {
  HeroType,
  SpellType,
  EnemyTrait,
  EnemyCategory,
  HazardType,
  SpecialTowerType,
} from "../../types";
import { OrnateFrame } from "../ui/OrnateFrame";
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
  groupEnemiesByCategory,
  TOWER_CATEGORIES,
  TOWER_TAGS,
} from "../../constants";
import { TagBadge } from "../ui/TagBadge";
import { calculateTowerStats, TOWER_STATS } from "../../constants/towerStats";
import {
  TowerSprite,
  HeroSprite,
  EnemySprite,
  SpellSprite,
  HeroAbilityIcon,
  HeroIcon,
  SpellIcon,
} from "../../sprites";
import {
  buildThemeFromAccent,
  TOWER_SPRITE_FRAME_THEME,
  SPELL_SPRITE_FRAME_THEME,
  getEnemySpriteFrameTheme,
  FramedSprite,
  type SpriteFrameTheme,
} from "../../sprites/shared";
import { PANEL, GOLD, OVERLAY, panelGradient } from "../ui/theme";
import { BaseModal } from "../ui/BaseModal";

// =============================================================================
// GAMEPLAY REGION IMAGES
// =============================================================================

const REGION_IMAGES = [
  { src: "/images/new/gameplay_grounds.png", alt: "Princeton Grounds", label: "Grounds" },
  { src: "/images/new/gameplay_swamp.png", alt: "Murky Marshes", label: "Swamp" },
  { src: "/images/new/gameplay_desert.png", alt: "Sahara Sands", label: "Desert" },
  { src: "/images/new/gameplay_winter.png", alt: "Frozen Frontier", label: "Winter" },
  { src: "/images/new/gameplay_volcano.png", alt: "Volcanic Depths", label: "Volcanic" },
] as const;

// =============================================================================
// CODEX HELPER FUNCTIONS
// =============================================================================

// Trait icon factory - icons are JSX so they must live in the component file
const TRAIT_ICONS: Record<EnemyTrait, (size: number) => React.ReactNode> = {
  flying: (s) => <Wind size={s} />,
  ranged: (s) => <Crosshair size={s} />,
  armored: (s) => <Shield size={s} />,
  fast: (s) => <Footprints size={s} />,
  boss: (s) => <Crown size={s} />,
  summoner: (s) => <Users size={s} />,
  regenerating: (s) => <Heart size={s} />,
  aoe_attack: (s) => <Target size={s} />,
  magic_resist: (s) => <Sparkles size={s} />,
  tower_debuffer: (s) => <TrendingDown size={s} />,
  breakthrough: (s) => <Zap size={s} />,
};

const getTraitInfo = (trait: EnemyTrait, iconSize = 12) => {
  const meta = ENEMY_TRAIT_META[trait] ?? { label: trait, color: "text-gray-400", desc: "Unknown trait", pillColor: "" };
  const iconFn = TRAIT_ICONS[trait];
  return { ...meta, icon: iconFn ? iconFn(iconSize) : <Info size={iconSize} /> };
};

// Ability icon factory - icons are JSX
const ABILITY_ICONS: Record<string, (size: number) => React.ReactNode> = {
  burn: (s) => <Flame size={s} />,
  slow: (s) => <Snowflake size={s} />,
  poison: (s) => <Droplets size={s} />,
  stun: (s) => <Zap size={s} />,
  tower_slow: (s) => <Timer size={s} />,
  tower_weaken: (s) => <TrendingDown size={s} />,
  tower_blind: (s) => <EyeOff size={s} />,
  tower_disable: (s) => <Ban size={s} />,
};

const getAbilityInfo = (abilityType: string, iconSize = 14) => {
  const meta = ENEMY_ABILITY_META[abilityType as keyof typeof ENEMY_ABILITY_META] ?? ENEMY_ABILITY_META.default;
  const iconFn = ABILITY_ICONS[abilityType];
  return { ...meta, icon: iconFn ? iconFn(iconSize) : <AlertTriangle size={iconSize} /> };
};

// Hero role icons (JSX, must live locally)
const HERO_ROLE_ICONS: Record<HeroType, (size: number) => React.ReactNode> = {
  tiger: (s) => <Swords size={s} />,
  tenor: (s) => <Volume2 size={s} />,
  mathey: (s) => <Shield size={s} />,
  rocky: (s) => <Target size={s} />,
  scott: (s) => <TrendingUp size={s} />,
  captain: (s) => <Users size={s} />,
  engineer: (s) => <CircleDot size={s} />,
};

// Category icons (JSX, must live locally)
const CATEGORY_ICONS: Record<EnemyCategory, React.ReactNode> = {
  academic: <Book size={16} />,
  campus: <Flag size={16} />,
  ranged: <Crosshair size={16} />,
  flying: <Wind size={16} />,
  boss: <Crown size={16} />,
  nature: <Sparkles size={16} />,
  swarm: <Users size={16} />,
};

export type CodexTabId =
  | "towers"
  | "heroes"
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
  vault: {
    name: "Treasury Vault",
    role: "Objective",
    icon: <Banknote size={16} />,
    color: "text-yellow-300",
    panelClass: "bg-yellow-950/35 border-yellow-800/40",
    effect: "Enemies can target this structure. If it falls, you immediately lose 10 lives.",
    numbers: "Objective HP varies by map (typically 420-1000)",
    tip: "Build crowd control near vault approach lanes first.",
  },
  beacon: {
    name: "Ancient Beacon",
    role: "Range Aura",
    icon: <Zap size={16} />,
    color: "text-cyan-300",
    panelClass: "bg-cyan-950/35 border-cyan-800/40",
    effect: "Buffs nearby towers and station troop deployment distance.",
    numbers: "+20% range/deploy in 250 radius",
    tip: "Stack splash towers so one beacon buffs multiple lanes.",
  },
  shrine: {
    name: "Eldritch Shrine",
    role: "Sustain Aura",
    icon: <Sparkles size={16} />,
    color: "text-green-300",
    panelClass: "bg-green-950/35 border-green-800/40",
    effect: "Pulses healing to the hero and nearby troops.",
    numbers: "+50 HP every 5s in 200 radius",
    tip: "Anchor your frontline near shrine radius to outlast attrition.",
  },
  barracks: {
    name: "Frontier Barracks",
    role: "Auto Reinforcement",
    icon: <Users size={16} />,
    color: "text-red-300",
    panelClass: "bg-red-950/35 border-red-800/40",
    effect: "Automatically deploys knight troops onto the road.",
    numbers: "Spawns every 12s, capped at 3 active knights",
    tip: "Use rally micro to keep spawned knights at high-traffic choke points.",
  },
  chrono_relay: {
    name: "Arcane Time Crystal",
    role: "Attack Speed Aura",
    icon: <Clock size={16} />,
    color: "text-indigo-300",
    panelClass: "bg-indigo-950/35 border-indigo-800/40",
    effect: "Synchronizes nearby towers to faster firing cadence.",
    numbers: "+25% attack speed in 220 radius",
    tip: "Best with high base DPS towers, especially chain and splash builds.",
  },
  sentinel_nexus: {
    name: "Imperial Sentinel",
    role: "Retargetable Strike",
    icon: <Target size={16} />,
    color: "text-rose-300",
    panelClass: "bg-rose-950/35 border-rose-800/40",
    effect: "Calls periodic lightning strikes at a locked coordinate.",
    numbers: `Every ${SENTINEL_NEXUS_STATS.strikeIntervalMs / 1000}s: up to ${SENTINEL_NEXUS_STATS.damage} damage in ${SENTINEL_NEXUS_STATS.radius} radius + short stun`,
    tip: "Retarget onto spawn exits or boss path corners for highest value.",
  },
  sunforge_orrery: {
    name: "Sunforge Orrery",
    role: "Cluster Erasure",
    icon: <Flame size={16} />,
    color: "text-orange-300",
    panelClass: "bg-orange-950/35 border-orange-800/40",
    effect: "Scans for dense enemy clusters and fires tri-plasma barrages.",
    numbers: `Every ${SUNFORGE_ORRERY_STATS.barrageIntervalMs / 1000}s: up to ${SUNFORGE_ORRERY_STATS.directDamage} direct damage + ${SUNFORGE_ORRERY_STATS.burnDps} DPS burn (${(SUNFORGE_ORRERY_STATS.burnDurationMs / 1000).toFixed(1)}s) per volley`,
    tip: "Pair with slows and path intersections to maximize cluster density.",
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
  poison_fog: {
    name: "Poison Fog",
    icon: <Droplets size={16} />,
    color: "text-green-300",
    panelClass: "bg-green-950/35 border-green-800/40",
    effect: "Constant damage-over-time zone affecting all units.",
    numbers: "15 DPS while inside",
    counterplay: "Use slows/stuns at fog edge so enemies exit slowly while still taking damage.",
  },
  deep_water: {
    name: "Deep Water",
    icon: <Droplets size={16} />,
    color: "text-blue-300",
    panelClass: "bg-blue-950/35 border-blue-800/40",
    effect: "Drags and drowns all units moving through water.",
    numbers: "4-9 DPS and up to 38% slow",
    counterplay: "Cover entry/exit points so enemies stay in water longer. Keep troops clear.",
  },
  maelstrom: {
    name: "Maelstrom",
    icon: <Wind size={16} />,
    color: "text-cyan-300",
    panelClass: "bg-cyan-950/35 border-cyan-800/40",
    effect: "Heavy vortex with strong crush damage and movement loss to all units.",
    numbers: "8-20 DPS and up to 55% slow",
    counterplay: "Route boss pressure through maelstrom zones — but keep friendlies away.",
  },
  storm_field: {
    name: "Storm Field",
    icon: <Zap size={16} />,
    color: "text-sky-300",
    panelClass: "bg-sky-950/35 border-sky-800/40",
    effect: "Electrified air hastens movement but shocks all units.",
    numbers: "+15% move speed and 6 DPS",
    counterplay: "Place burst towers right after storm exits for fast-moving enemies.",
  },
  quicksand: {
    name: "Quicksand",
    icon: <TrendingDown size={16} />,
    color: "text-yellow-300",
    panelClass: "bg-yellow-950/35 border-yellow-800/40",
    effect: "Movement suppression zone affecting all units.",
    numbers: "50% movement slow",
    counterplay: "Use as pseudo-chokepoints for artillery and chain towers.",
  },
  ice_sheet: {
    name: "Ice Sheet",
    icon: <Snowflake size={16} />,
    color: "text-cyan-300",
    panelClass: "bg-cyan-950/35 border-cyan-800/40",
    effect: "Slick terrain that accelerates all unit movement.",
    numbers: "+60% movement speed",
    counterplay: "Preload damage before the sheet and finish immediately after it.",
  },
  ice_spikes: {
    name: "Ice Spikes",
    icon: <Snowflake size={16} />,
    color: "text-blue-300",
    panelClass: "bg-blue-950/35 border-blue-800/40",
    effect: "Phase-based burst trap that damages and slows all units in cycles.",
    numbers: "Up to ~30 DPS and up to 45% slow when fully extended",
    counterplay: "Time freezes/stuns so enemies remain on spikes during active phases.",
  },
  lava_geyser: {
    name: "Lava Geyser",
    icon: <Flame size={16} />,
    color: "text-orange-300",
    panelClass: "bg-orange-950/35 border-orange-800/40",
    effect: "Random eruptions apply burst fire damage to all units.",
    numbers: "5 fire damage per eruption tick",
    counterplay: "Treat as bonus chip damage and avoid relying on it for consistent clears.",
  },
  volcano: {
    name: "Volcano",
    icon: <Flame size={16} />,
    color: "text-red-400",
    panelClass: "bg-red-950/35 border-red-800/40",
    effect: "Devastating eruptions hurl molten rock at all nearby units.",
    numbers: "15 fire damage per eruption burst",
    counterplay: "Keep troops and heroes clear — this is lethal to friendlies too.",
  },
  swamp: {
    name: "Toxic Swamp",
    icon: <Droplets size={16} />,
    color: "text-lime-300",
    panelClass: "bg-lime-950/35 border-lime-800/40",
    effect: "Corrosive mire poisons and bogs down all units.",
    numbers: "6 DPS poison + 35% movement slow",
    counterplay: "Combines damage with slow — position towers to exploit the dwell time.",
  },
  fire: {
    name: "Hellfire Zone",
    icon: <Flame size={16} />,
    color: "text-orange-400",
    panelClass: "bg-orange-950/35 border-orange-700/40",
    effect: "Continuous flames scorch everything in the area.",
    numbers: "10 fire DPS to all units",
    counterplay: "High sustained damage — keep friendlies out and let enemies burn.",
  },
  lightning: {
    name: "Lightning Field",
    icon: <Zap size={16} />,
    color: "text-yellow-300",
    panelClass: "bg-yellow-950/35 border-yellow-700/40",
    effect: "Sporadic high-voltage strikes blast all units in the zone.",
    numbers: "18 burst damage per lightning strike",
    counterplay: "Unpredictable burst — avoid stationing troops in the strike zone.",
  },
  void: {
    name: "Void Rift",
    icon: <CircleOff size={16} />,
    color: "text-purple-300",
    panelClass: "bg-purple-950/35 border-purple-800/40",
    effect: "Dimensional tear drains life and slows all units.",
    numbers: "8 DPS + 30% movement slow",
    counterplay: "Treat like a weaker maelstrom — towers near exits maximize damage on slowed foes.",
  },
  lava: {
    name: "Lava Pool",
    icon: <Flame size={16} />,
    color: "text-red-300",
    panelClass: "bg-red-950/35 border-red-700/40",
    effect: "Bubbling magma periodically splashes all nearby units.",
    numbers: "4 fire damage per splash tick",
    counterplay: "Low but persistent damage — avoid leaving troops on it long-term.",
  },
};

const normalizeHazardType = (type: HazardType): CodexHazardType | null => {
  if (type === "spikes") return "ice_spikes";
  if (type === "eruption_zone") return "lava_geyser";
  if (type === "slippery_ice" || type === "ice") return "ice_sheet";
  if (type === "poison") return "poison_fog";
  if (type in HAZARD_INFO) return type as CodexHazardType;
  return null;
};

const SpriteShell: React.FC<{
  size: number;
  background: string;
  border: string;
  glow: string;
  children: React.ReactNode;
}> = ({ size, background, border, glow, children }) => (
  <div
    className="relative overflow-hidden rounded-xl shrink-0"
    style={{
      width: size,
      height: size,
      background,
      border: `1.5px solid ${border}`,
      boxShadow: `0 0 20px ${glow}, inset 0 0 18px rgba(6,6,10,0.72)`,
    }}
  >
    <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: "1px solid rgba(255,255,255,0.14)" }} />
    <div
      className="absolute inset-[2px] rounded-[10px] pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at 26% 22%, rgba(255,255,255,0.22), rgba(255,255,255,0.03) 38%, rgba(0,0,0,0.25) 90%)",
      }}
    />
    <svg viewBox="0 0 64 64" className="w-full h-full">
      <ellipse cx="32" cy="50" rx="17" ry="5.8" fill="rgba(0,0,0,0.36)" />
      <circle cx="22" cy="18" r="18" fill="rgba(255,255,255,0.09)" />
      <g transform="translate(0 -1)">
        {children}
      </g>
    </svg>
  </div>
);

const SPECIAL_TOWER_SPRITE_THEME: Record<
  SpecialTowerType,
  { background: string; border: string; glow: string }
> = {
  vault: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,240,138,0.3), rgba(120,80,18,0.18) 42%, rgba(60,41,12,0.95) 100%)",
    border: "rgba(250,204,21,0.7)",
    glow: "rgba(250,204,21,0.42)",
  },
  beacon: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(165,243,252,0.28), rgba(18,92,112,0.18) 42%, rgba(12,48,60,0.96) 100%)",
    border: "rgba(34,211,238,0.7)",
    glow: "rgba(34,211,238,0.4)",
  },
  shrine: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(187,247,208,0.28), rgba(20,105,70,0.18) 42%, rgba(12,64,44,0.96) 100%)",
    border: "rgba(34,197,94,0.7)",
    glow: "rgba(34,197,94,0.38)",
  },
  barracks: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,202,202,0.25), rgba(158,42,42,0.2) 42%, rgba(74,22,22,0.96) 100%)",
    border: "rgba(248,113,113,0.72)",
    glow: "rgba(248,113,113,0.4)",
  },
  chrono_relay: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(199,210,254,0.28), rgba(91,94,197,0.2) 42%, rgba(38,34,96,0.96) 100%)",
    border: "rgba(129,140,248,0.72)",
    glow: "rgba(129,140,248,0.42)",
  },
  sentinel_nexus: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,205,211,0.28), rgba(160,46,78,0.2) 42%, rgba(78,24,46,0.96) 100%)",
    border: "rgba(251,113,133,0.72)",
    glow: "rgba(251,113,133,0.4)",
  },
  sunforge_orrery: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,215,170,0.27), rgba(174,87,30,0.2) 42%, rgba(94,38,20,0.96) 100%)",
    border: "rgba(251,146,60,0.74)",
    glow: "rgba(251,146,60,0.43)",
  },
};

const HAZARD_SPRITE_THEME: Record<
  CodexHazardType,
  { background: string; border: string; glow: string }
> = {
  poison_fog: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(187,247,208,0.28), rgba(28,120,71,0.18) 42%, rgba(14,66,42,0.96) 100%)",
    border: "rgba(74,222,128,0.7)",
    glow: "rgba(74,222,128,0.4)",
  },
  deep_water: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(191,219,254,0.28), rgba(35,96,176,0.18) 42%, rgba(17,52,98,0.96) 100%)",
    border: "rgba(96,165,250,0.7)",
    glow: "rgba(96,165,250,0.42)",
  },
  maelstrom: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(186,230,253,0.27), rgba(34,124,159,0.18) 42%, rgba(12,56,77,0.96) 100%)",
    border: "rgba(56,189,248,0.72)",
    glow: "rgba(56,189,248,0.42)",
  },
  storm_field: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(219,234,254,0.26), rgba(76,107,202,0.18) 42%, rgba(31,43,100,0.96) 100%)",
    border: "rgba(125,211,252,0.72)",
    glow: "rgba(125,211,252,0.42)",
  },
  quicksand: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,249,195,0.27), rgba(188,146,47,0.18) 42%, rgba(108,78,28,0.96) 100%)",
    border: "rgba(250,204,21,0.72)",
    glow: "rgba(250,204,21,0.42)",
  },
  ice_sheet: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(224,242,254,0.28), rgba(99,159,214,0.18) 42%, rgba(32,68,98,0.96) 100%)",
    border: "rgba(125,211,252,0.72)",
    glow: "rgba(125,211,252,0.4)",
  },
  ice_spikes: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(219,234,254,0.28), rgba(90,130,218,0.18) 42%, rgba(32,58,112,0.96) 100%)",
    border: "rgba(96,165,250,0.72)",
    glow: "rgba(96,165,250,0.43)",
  },
  lava_geyser: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,215,170,0.28), rgba(218,99,41,0.18) 42%, rgba(110,37,22,0.96) 100%)",
    border: "rgba(251,146,60,0.74)",
    glow: "rgba(251,146,60,0.45)",
  },
  volcano: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,202,202,0.28), rgba(220,38,38,0.18) 42%, rgba(127,29,29,0.96) 100%)",
    border: "rgba(248,113,113,0.74)",
    glow: "rgba(248,113,113,0.45)",
  },
  swamp: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(217,249,157,0.26), rgba(101,163,13,0.18) 42%, rgba(54,83,20,0.96) 100%)",
    border: "rgba(163,230,53,0.7)",
    glow: "rgba(163,230,53,0.38)",
  },
  fire: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,215,170,0.3), rgba(234,88,12,0.2) 42%, rgba(124,45,18,0.96) 100%)",
    border: "rgba(251,146,60,0.76)",
    glow: "rgba(251,146,60,0.48)",
  },
  lightning: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,249,195,0.28), rgba(202,138,4,0.18) 42%, rgba(113,63,18,0.96) 100%)",
    border: "rgba(250,204,21,0.74)",
    glow: "rgba(250,204,21,0.44)",
  },
  void: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(233,213,255,0.26), rgba(147,51,234,0.18) 42%, rgba(59,7,100,0.96) 100%)",
    border: "rgba(192,132,252,0.72)",
    glow: "rgba(192,132,252,0.42)",
  },
  lava: {
    background:
      "radial-gradient(circle at 28% 24%, rgba(254,202,202,0.26), rgba(185,28,28,0.18) 42%, rgba(99,18,18,0.96) 100%)",
    border: "rgba(239,68,68,0.72)",
    glow: "rgba(239,68,68,0.42)",
  },
};

const getHeroSpriteFrameTheme = (type: HeroType): SpriteFrameTheme =>
  buildThemeFromAccent(HERO_DATA[type].color || "#f59e0b");

const FramedCodexSprite = FramedSprite;

const renderSpecialTowerGlyph = (type: SpecialTowerType): React.ReactNode => {
  switch (type) {
    case "vault":
      return (
        <>
          <rect x="16" y="42" width="32" height="5" rx="2.5" fill="#3f2a0e" />
          <rect x="16" y="23" width="32" height="21" rx="5" fill="#5e4217" stroke="#f59e0b" strokeWidth="1.8" />
          <rect x="15" y="19" width="34" height="8" rx="3" fill="#9a6b23" stroke="#fcd34d" strokeWidth="1.4" />
          <rect x="18" y="27" width="28" height="14" rx="3.5" fill="#6b4a18" />
          <circle cx="32" cy="34" r="5.5" fill="#2f1f09" stroke="#fcd34d" strokeWidth="1.4" />
          <rect x="31" y="34" width="2" height="7.5" rx="1" fill="#fcd34d" />
          <circle cx="44.5" cy="18.5" r="2.2" fill="#fef3c7" />
          <path d="M44.5 14.8 L45.4 17.4 L48 18.5 L45.4 19.6 L44.5 22.2 L43.6 19.6 L41 18.5 L43.6 17.4 Z" fill="#fde68a" />
        </>
      );
    case "beacon":
      return (
        <>
          <g transform="translate(0 10)">
            <ellipse cx="32" cy="44" rx="15" ry="4.4" fill="rgba(6,182,212,0.22)" />
            <rect x="26.5" y="18" width="11" height="26" rx="3" fill="#155e75" stroke="#67e8f9" strokeWidth="1.6" />
            <polygon points="32,10 38.2,20 25.8,20" fill="#a5f3fc" stroke="#e0f2fe" strokeWidth="1.2" />
            <circle cx="32" cy="13.4" r="4.2" fill="#67e8f9" />
            <circle cx="32" cy="13.4" r="10" fill="none" stroke="rgba(103,232,249,0.75)" strokeWidth="1.5" strokeDasharray="2.4 2.6" />
            <circle cx="32" cy="13.4" r="15" fill="none" stroke="rgba(103,232,249,0.35)" strokeWidth="1.2" />
            <path d="M22 30 L42 30" stroke="#a5f3fc" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </>
      );
    case "shrine":
      return (
        <>
          <rect x="15" y="42" width="34" height="5" rx="2.5" fill="#0f3f2c" />
          <rect x="18" y="25" width="7" height="18" rx="2" fill="#166534" stroke="#86efac" strokeWidth="1.1" />
          <rect x="39" y="25" width="7" height="18" rx="2" fill="#166534" stroke="#86efac" strokeWidth="1.1" />
          <path d="M20 24 Q32 15 44 24" fill="none" stroke="#86efac" strokeWidth="1.5" />
          <polygon points="32,15 38,24 32,33 26,24" fill="#86efac" stroke="#dcfce7" strokeWidth="1.3" />
          <circle cx="32" cy="23.8" r="12" fill="none" stroke="rgba(134,239,172,0.38)" strokeWidth="1.3" />
          <circle cx="32" cy="23.8" r="2.1" fill="#dcfce7" />
        </>
      );
    case "barracks":
      return (
        <>
          <rect x="14" y="42" width="36" height="5" rx="2.5" fill="#3f1616" />
          <rect x="14" y="24" width="36" height="19" rx="4" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.6" />
          <path d="M14 24 L18 20 L22 24 L26 20 L30 24 L34 20 L38 24 L42 20 L46 24 L50 20 L50 24 Z" fill="#991b1b" />
          <rect x="27" y="31" width="10" height="12" rx="2.5" fill="#450a0a" stroke="#fecaca" strokeWidth="1" />
          <path d="M20 41 L24 31 M44 41 L40 31" stroke="#fecaca" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M32 31 L32 21" stroke="#fca5a5" strokeWidth="1.3" />
          <polygon points="32,20 38,23 32,26" fill="#f87171" />
        </>
      );
    case "chrono_relay":
      return (
        <>
          <circle cx="32" cy="31" r="17" fill="none" stroke="#818cf8" strokeWidth="1.8" />
          <circle cx="32" cy="31" r="12" fill="none" stroke="#c7d2fe" strokeWidth="1.3" />
          <polygon points="32,14 42,31 32,48 22,31" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="1.4" />
          <circle cx="32" cy="31" r="5.5" fill="#1e1b4b" stroke="#a5b4fc" strokeWidth="1.2" />
          <path d="M32 31 L32 23 M32 31 L38 34.5" stroke="#e0e7ff" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M32 14 L32 11 M49 31 L52 31 M15 31 L12 31 M32 48 L32 51" stroke="#a5b4fc" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="45" cy="19" r="1.8" fill="#e0e7ff" />
        </>
      );
    case "sentinel_nexus":
      return (
        <>
          <circle cx="32" cy="31" r="17" fill="none" stroke="#fb7185" strokeWidth="1.8" />
          <circle cx="32" cy="31" r="10" fill="none" stroke="#fecdd3" strokeWidth="1.2" />
          <path d="M32 10 L32 17 M32 45 L32 52 M11 31 L18 31 M46 31 L53 31" stroke="#fda4af" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="32" cy="31" r="4.2" fill="#9f1239" stroke="#ffe4e6" strokeWidth="1.1" />
          <path d="M36.5 20 L30.8 30.8 L35.4 30.8 L28.8 42" stroke="#ffe4e6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21 Q32 14 43 21" fill="none" stroke="rgba(251,113,133,0.5)" strokeWidth="1.2" />
        </>
      );
    case "sunforge_orrery":
      return (
        <>
          <circle cx="32" cy="31" r="7.2" fill="#fb923c" stroke="#ffedd5" strokeWidth="1.3" />
          <circle cx="32" cy="31" r="15" fill="none" stroke="#fdba74" strokeWidth="1.3" />
          <ellipse cx="32" cy="31" rx="20" ry="8.2" fill="none" stroke="#fb923c" strokeWidth="1.35" />
          <ellipse cx="32" cy="31" rx="8.2" ry="20" fill="none" stroke="#fb923c" strokeWidth="1.35" />
          <path d="M22 21 L26 25 M42 21 L38 25 M22 41 L26 37 M42 41 L38 37" stroke="#fed7aa" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="46.5" cy="31" r="2.3" fill="#ffedd5" />
          <circle cx="24.5" cy="17.8" r="2" fill="#ffedd5" />
        </>
      );
    default:
      return null;
  }
};

const renderHazardGlyph = (type: CodexHazardType): React.ReactNode => {
  switch (type) {
    case "poison_fog":
      return (
        <>
          <circle cx="21" cy="36" r="10.5" fill="rgba(74,222,128,0.42)" />
          <circle cx="33" cy="33" r="12" fill="rgba(74,222,128,0.52)" />
          <circle cx="43" cy="39" r="9" fill="rgba(34,197,94,0.44)" />
          <circle cx="30.5" cy="40" r="8" fill="rgba(22,163,74,0.36)" />
          <circle cx="32" cy="34" r="4.9" fill="#052e16" />
          <circle cx="30.3" cy="33" r="1.15" fill="#bbf7d0" />
          <circle cx="33.7" cy="33" r="1.15" fill="#bbf7d0" />
          <path d="M30.8 36.1 Q32 37.2 33.2 36.1" fill="none" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" />
        </>
      );
    case "deep_water":
      return (
        <>
          <ellipse cx="32" cy="33" rx="16.5" ry="9" fill="rgba(56,189,248,0.22)" />
          <path d="M14 32 Q20 27 26 32 T38 32 T50 32" fill="none" stroke="#bae6fd" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M11 38 Q18 33 25 38 T39 38 T53 38" fill="none" stroke="#7dd3fc" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M9 44 Q17 39 25 44 T41 44 T57 44" fill="none" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M32 15 C29 21 27 24 27 27 C27 30 29.2 32.4 32 32.4 C34.8 32.4 37 30 37 27 C37 24 35 21 32 15 Z" fill="#dbeafe" />
        </>
      );
    case "maelstrom":
      return (
        <>
          <path d="M32 12 C45 12 52 23 49 32 C46 41 36 46 27 42 C20 39 18 32 22 27 C26 22 34 22 36 27 C37.4 30.2 35.6 34 32 34" fill="none" stroke="#bae6fd" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M18 18 C14 30 18 46 32 50" fill="none" stroke="#38bdf8" strokeWidth="2.1" strokeLinecap="round" />
          <path d="M46 19 C50 26 49 39 40 46" fill="none" stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="32" cy="34" r="2.7" fill="#e0f2fe" />
        </>
      );
    case "storm_field":
      return (
        <>
          <ellipse cx="32" cy="42" rx="16" ry="5" fill="rgba(125,211,252,0.24)" />
          <circle cx="24" cy="26" r="7.5" fill="#dbeafe" />
          <circle cx="32" cy="23" r="9" fill="#e0f2fe" />
          <circle cx="40" cy="27" r="7" fill="#dbeafe" />
          <path d="M30 28 L25 38 L31.5 38 L27.8 47 L39.2 34.2 L32.4 34.2 L36.2 28 Z" fill="#fde68a" stroke="#facc15" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M15 36 Q22 32 29 36 M35 36 Q42 32 49 36" stroke="#93c5fd" strokeWidth="1.3" strokeLinecap="round" />
        </>
      );
    case "quicksand":
      return (
        <>
          <ellipse cx="32" cy="38" rx="17.5" ry="11" fill="rgba(202,138,4,0.46)" />
          <ellipse cx="32" cy="38" rx="12" ry="7" fill="rgba(253,224,71,0.3)" />
          <path d="M22 36 C26 32 34 32 38 36 C40 38.2 37 40.5 34.5 40.3 C32.6 40.2 31 38.3 32 36.8 C33 35.4 35.4 35.8 36.2 37" fill="none" stroke="#fde047" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="23.5" cy="43" r="2.1" fill="#facc15" />
          <circle cx="39.5" cy="44" r="2.4" fill="#facc15" />
          <circle cx="32" cy="46" r="1.6" fill="#fde68a" />
        </>
      );
    case "ice_sheet":
      return (
        <>
          <polygon points="15,43 25,19 46,20 52,35 37,50 20,48" fill="rgba(147,197,253,0.5)" stroke="#e0f2fe" strokeWidth="1.5" />
          <path d="M25 26 L40 34 M31 22 L29 45 M20 36 L44 30 M24 41 L37 26" stroke="#e0f2fe" strokeWidth="1.25" strokeLinecap="round" />
          <circle cx="44.5" cy="22.5" r="1.7" fill="#f0f9ff" />
        </>
      );
    case "ice_spikes":
      return (
        <>
          <path d="M14 48 H50" stroke="#dbeafe" strokeWidth="1.6" />
          <polygon points="15,48 22,25 28,48" fill="#93c5fd" stroke="#dbeafe" strokeWidth="1" />
          <polygon points="24,48 32,16 40,48" fill="#bfdbfe" stroke="#e0f2fe" strokeWidth="1.1" />
          <polygon points="35,48 43,27 50,48" fill="#93c5fd" stroke="#dbeafe" strokeWidth="1" />
          <path d="M18 44 Q32 38 46 44" fill="none" stroke="rgba(186,230,253,0.6)" strokeWidth="1.2" />
        </>
      );
    case "lava_geyser":
      return (
        <>
          <ellipse cx="32" cy="45.5" rx="16.5" ry="6.2" fill="rgba(239,68,68,0.34)" />
          <ellipse cx="32" cy="44" rx="11.2" ry="4" fill="rgba(153,27,27,0.5)" />
          <path d="M23.5 44 C22 35 26 29 29.5 19 C31.5 24 33.2 26.6 34.8 19.5 C39 30 42.8 35.5 40.6 44 Z" fill="#fb923c" stroke="#f97316" strokeWidth="1.5" />
          <path d="M29.6 44 C29.6 37 31.3 32.2 32 27.8 C32.7 32.2 34.4 37 34.4 44 Z" fill="#fde68a" opacity={0.86} />
          <circle cx="22.3" cy="21.8" r="2.2" fill="#fdba74" />
          <circle cx="40.8" cy="17.8" r="2.5" fill="#fdba74" />
          <circle cx="46.2" cy="25.2" r="1.9" fill="#fca5a5" />
        </>
      );
    case "volcano":
      return (
        <>
          <polygon points="16,50 32,14 48,50" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.4" />
          <polygon points="24,50 32,26 40,50" fill="#991b1b" />
          <ellipse cx="32" cy="24" rx="6" ry="4" fill="#ef4444" />
          <path d="M28 24 C27 18 30 13 32 10 C34 13 37 18 36 24" fill="#fb923c" />
          <path d="M30 24 C30 20 31 16 32 14 C33 16 34 20 34 24" fill="#fde68a" opacity={0.8} />
          <circle cx="24" cy="16" r="2" fill="#fdba74" />
          <circle cx="40" cy="14" r="2.4" fill="#fca5a5" />
          <circle cx="38" cy="20" r="1.5" fill="#fdba74" />
        </>
      );
    case "swamp":
      return (
        <>
          <ellipse cx="32" cy="40" rx="18" ry="10" fill="rgba(101,163,13,0.35)" />
          <ellipse cx="32" cy="40" rx="12" ry="6.5" fill="rgba(163,230,53,0.25)" />
          <circle cx="24" cy="38" r="2.8" fill="rgba(163,230,53,0.4)" />
          <circle cx="38" cy="36" r="2.2" fill="rgba(163,230,53,0.35)" />
          <circle cx="32" cy="42" r="1.8" fill="rgba(217,249,157,0.5)" />
          <path d="M22 30 C24 25 26 28 28 24 C30 28 30 26 32 22" fill="none" stroke="#a3e635" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M36 28 C38 24 40 27 42 23" fill="none" stroke="#84cc16" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="26" cy="44" r="1.2" fill="#d9f99d" />
          <circle cx="40" cy="43" r="1.4" fill="#d9f99d" />
        </>
      );
    case "fire":
      return (
        <>
          <ellipse cx="32" cy="46" rx="16" ry="5.5" fill="rgba(234,88,12,0.32)" />
          <path d="M20 46 C18 36 24 28 28 20 C30 26 32 22 34 18 C36 24 40 28 44 36 C46 42 42 46 32 46 C22 46 20 44 20 46 Z" fill="#f97316" stroke="#fb923c" strokeWidth="1.2" />
          <path d="M26 46 C26 38 30 30 32 24 C34 30 38 38 38 46 Z" fill="#fde68a" opacity={0.75} />
          <path d="M30 46 C30 40 31 34 32 30 C33 34 34 40 34 46 Z" fill="#fef3c7" opacity={0.6} />
        </>
      );
    case "lightning":
      return (
        <>
          <ellipse cx="32" cy="44" rx="14" ry="4.5" fill="rgba(250,204,21,0.2)" />
          <circle cx="24" cy="20" r="8" fill="#e0e7ff" />
          <circle cx="32" cy="17" r="9.5" fill="#f1f5f9" />
          <circle cx="40" cy="21" r="7.5" fill="#e0e7ff" />
          <path d="M30 22 L24 34 L31 34 L26 48 L40 30 L33 30 L37 22 Z" fill="#facc15" stroke="#eab308" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M18 15 L20 17 M44 15 L42 17 M32 8 L32 11" stroke="#fde68a" strokeWidth="1.4" strokeLinecap="round" />
        </>
      );
    case "void":
      return (
        <>
          <ellipse cx="32" cy="34" rx="16" ry="16" fill="rgba(88,28,135,0.3)" />
          <circle cx="32" cy="34" r="12" fill="none" stroke="rgba(192,132,252,0.5)" strokeWidth="1.5" />
          <circle cx="32" cy="34" r="7" fill="none" stroke="rgba(216,180,254,0.6)" strokeWidth="1.2" />
          <circle cx="32" cy="34" r="3" fill="#581c87" stroke="#c084fc" strokeWidth="1" />
          <path d="M20 22 Q26 18 32 22 Q38 18 44 22" fill="none" stroke="rgba(192,132,252,0.4)" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M20 46 Q26 50 32 46 Q38 50 44 46" fill="none" stroke="rgba(192,132,252,0.4)" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="22" cy="28" r="1.5" fill="#d8b4fe" />
          <circle cx="42" cy="40" r="1.3" fill="#d8b4fe" />
        </>
      );
    case "lava":
      return (
        <>
          <ellipse cx="32" cy="40" rx="17" ry="10" fill="rgba(239,68,68,0.3)" />
          <ellipse cx="32" cy="40" rx="12" ry="6.5" fill="rgba(185,28,28,0.45)" />
          <circle cx="25" cy="38" r="3.5" fill="rgba(251,146,60,0.5)" />
          <circle cx="38" cy="36" r="3" fill="rgba(251,146,60,0.45)" />
          <circle cx="32" cy="42" r="2.5" fill="rgba(253,224,71,0.4)" />
          <circle cx="28" cy="40" r="1.2" fill="#fde68a" />
          <circle cx="36" cy="39" r="1" fill="#fde68a" />
          <circle cx="32" cy="36" r="0.9" fill="#fef3c7" />
        </>
      );
    default:
      return null;
  }
};

const SpecialTowerSprite: React.FC<{ type: SpecialTowerType; size?: number }> = ({
  type,
  size = 64,
}) => {
  const theme = SPECIAL_TOWER_SPRITE_THEME[type];
  return (
    <SpriteShell
      size={size}
      background={theme.background}
      border={theme.border}
      glow={theme.glow}
    >
      {renderSpecialTowerGlyph(type)}
    </SpriteShell>
  );
};

const HazardSprite: React.FC<{ type: CodexHazardType; size?: number }> = ({
  type,
  size = 64,
}) => {
  const theme = HAZARD_SPRITE_THEME[type];
  return (
    <SpriteShell
      size={size}
      background={theme.background}
      border={theme.border}
      glow={theme.glow}
    >
      {renderHazardGlyph(type)}
    </SpriteShell>
  );
};

// =============================================================================
// CODEX UI HELPERS
// =============================================================================

const COLOR_MAP: Record<string, {
  headerBg: string; headerBorder: string; text: string;
  statBg: string; statBorder: string; statText: string;
  barBg: string; chipBg: string; chipBorder: string;
}> = {
  purple: { headerBg: "bg-purple-950/50", headerBorder: "border-purple-800/30", text: "text-purple-400", statBg: "bg-purple-950/40", statBorder: "border-purple-800/30", statText: "text-purple-300", barBg: "bg-purple-500/70", chipBg: "bg-purple-950/50", chipBorder: "border-purple-900/40" },
  red: { headerBg: "bg-red-950/50", headerBorder: "border-red-800/30", text: "text-red-400", statBg: "bg-red-950/40", statBorder: "border-red-800/30", statText: "text-red-300", barBg: "bg-red-500/70", chipBg: "bg-red-950/50", chipBorder: "border-red-900/40" },
  cyan: { headerBg: "bg-cyan-950/50", headerBorder: "border-cyan-800/30", text: "text-cyan-400", statBg: "bg-cyan-950/40", statBorder: "border-cyan-800/30", statText: "text-cyan-300", barBg: "bg-cyan-500/70", chipBg: "bg-cyan-950/50", chipBorder: "border-cyan-900/40" },
  yellow: { headerBg: "bg-yellow-950/50", headerBorder: "border-yellow-800/30", text: "text-yellow-400", statBg: "bg-yellow-950/40", statBorder: "border-yellow-800/30", statText: "text-yellow-300", barBg: "bg-yellow-500/70", chipBg: "bg-yellow-950/50", chipBorder: "border-yellow-900/40" },
  blue: { headerBg: "bg-blue-950/50", headerBorder: "border-blue-800/30", text: "text-blue-400", statBg: "bg-blue-950/40", statBorder: "border-blue-800/30", statText: "text-blue-300", barBg: "bg-blue-500/70", chipBg: "bg-blue-950/50", chipBorder: "border-blue-900/40" },
  amber: { headerBg: "bg-amber-950/50", headerBorder: "border-amber-800/30", text: "text-amber-400", statBg: "bg-amber-950/40", statBorder: "border-amber-800/30", statText: "text-amber-300", barBg: "bg-amber-500/70", chipBg: "bg-amber-950/50", chipBorder: "border-amber-900/40" },
  orange: { headerBg: "bg-orange-950/50", headerBorder: "border-orange-800/30", text: "text-orange-400", statBg: "bg-orange-950/40", statBorder: "border-orange-800/30", statText: "text-orange-300", barBg: "bg-orange-500/70", chipBg: "bg-orange-950/50", chipBorder: "border-orange-900/40" },
  green: { headerBg: "bg-green-950/50", headerBorder: "border-green-800/30", text: "text-green-400", statBg: "bg-green-950/40", statBorder: "border-green-800/30", statText: "text-green-300", barBg: "bg-green-500/70", chipBg: "bg-green-950/50", chipBorder: "border-green-900/40" },
  stone: { headerBg: "bg-stone-950/50", headerBorder: "border-stone-800/30", text: "text-stone-400", statBg: "bg-stone-950/40", statBorder: "border-stone-800/30", statText: "text-stone-300", barBg: "bg-stone-500/70", chipBg: "bg-stone-950/50", chipBorder: "border-stone-900/40" },
};

const getCC = (color: string) => COLOR_MAP[color] || COLOR_MAP.amber;

const TOWER_COLOR: Record<string, string> = Object.fromEntries(
  Object.entries(TOWER_CATEGORIES).map(([k, v]) => [k, v.colorName])
);

const calculateDPS = (damage: number, attackSpeed: number): number => {
  if (attackSpeed <= 0 || damage <= 0) return 0;
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
  const cc = getCC(color);
  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1 w-[60px] shrink-0 ${cc.text}`}>
        {icon}
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <div className="flex-1 h-[6px] rounded-full bg-stone-800/60 overflow-hidden">
        <div className={`h-full rounded-full ${cc.barBg}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`w-10 text-right font-bold text-xs ${cc.statText}`}>{displayValue}</span>
    </div>
  );
};

const DPSBadge: React.FC<{ dps: number; size?: "sm" | "md" }> = ({ dps, size = "md" }) => (
  <div className={`flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-950/60 to-orange-950/40 border border-red-800/40 ${size === "sm" ? "px-1.5 py-0.5" : "px-2.5 py-1"}`}>
    <Flame size={size === "sm" ? 10 : 12} className="text-orange-400" />
    <span className={`text-stone-400 uppercase ${size === "sm" ? "text-[8px]" : "text-[10px]"}`}>DPS</span>
    <span className={`font-bold text-orange-300 ${size === "sm" ? "text-[10px]" : "text-sm"}`}>{dps.toFixed(1)}</span>
  </div>
);

const HPBar: React.FC<{ hp: number; maxHp: number; isBoss?: boolean }> = ({ hp, maxHp, isBoss }) => {
  const pct = Math.min(100, Math.max(3, (hp / maxHp) * 100));
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Heart size={10} className={isBoss ? "text-purple-400" : "text-red-400"} />
          <span className={`text-[10px] font-medium ${isBoss ? "text-purple-400" : "text-red-400"}`}>HP</span>
        </div>
        <span className={`text-xs font-bold ${isBoss ? "text-purple-300" : "text-red-300"}`}>{hp.toLocaleString()}</span>
      </div>
      <div className="h-[5px] rounded-full bg-stone-800/60 overflow-hidden">
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

export interface CodexModalProps {
  onClose: () => void;
  defaultTab?: CodexTabId;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onClose, defaultTab }) => {
  const [activeTab, setActiveTab] = useState<CodexTabId>(defaultTab ?? "towers");
  const [selectedTower, setSelectedTower] = useState<string | null>(null);
  const [selectedHeroDetail, setSelectedHeroDetail] = useState<string | null>(
    null
  );
  const towerTypes = Object.keys(TOWER_DATA) as (keyof typeof TOWER_DATA)[];
  const heroTypes = Object.keys(HERO_DATA) as HeroType[];
  const enemyTypes = Object.keys(ENEMY_DATA) as (keyof typeof ENEMY_DATA)[];
  const spellTypes = Object.keys(SPELL_DATA) as SpellType[];
  const levelEntries = Object.entries(LEVEL_DATA);
  const challengeLevelCount = levelEntries.filter(
    ([, level]) => level.levelKind === "challenge"
  ).length;
  const campaignLevelCount = levelEntries.length - challengeLevelCount;
  const dualPathLevelCount = levelEntries.filter(([, level]) => level.dualPath).length;

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
      if (!normalizedType) return;
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
  const hazardTypesInUse = HAZARD_ORDER.filter((type) => hazardLevels.has(type));
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
        (hazardZoneCounts.get(current) ?? 0) > (hazardZoneCounts.get(best) ?? 0)
          ? current
          : best
      )
      : null;
  const averageHazardsPerHazardMap =
    levelsWithHazards > 0 ? totalHazardZones / levelsWithHazards : 0;

  const formatKeyLabel = (value: string) =>
    LEVEL_DATA[value]?.name ||
    value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const towersByCost = towerTypes
    .map((type) => ({ type, cost: TOWER_DATA[type].cost }))
    .sort((a, b) => a.cost - b.cost);
  const cheapestTower = towersByCost[0];
  const priciestTower = towersByCost[towersByCost.length - 1];
  const averageTowerCost =
    towersByCost.length > 0
      ? towersByCost.reduce((sum, tower) => sum + tower.cost, 0) / towersByCost.length
      : 0;
  const level4UpgradeCosts = towerTypes.map((type) => ({
    type,
    cost: TOWER_STATS[type]?.level4Cost ?? 0,
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
    type,
    cooldown: HERO_ABILITY_COOLDOWNS[type] ?? 0,
  }));
  const averageHeroHp =
    heroTypes.length > 0
      ? heroTypes.reduce((sum, type) => sum + HERO_DATA[type].hp, 0) / heroTypes.length
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
  const rangedHeroCount = heroTypes.filter((type) => HERO_DATA[type].range >= 170).length;

  // ── Stat bar scaling maximums (derived from actual game data) ──
  const heroMaxHp = Math.max(...heroTypes.map(t => HERO_DATA[t].hp), 1);
  const heroMaxDmg = Math.max(...heroTypes.map(t => HERO_DATA[t].damage), 1);
  const heroMaxRange = Math.max(...heroTypes.map(t => HERO_DATA[t].range), 1);
  const heroMaxSpeed = Math.max(...heroTypes.map(t => HERO_DATA[t].speed), 1);
  const heroMaxAtkRate = Math.max(...heroTypes.map(t => 1000 / HERO_DATA[t].attackSpeed), 0.1);

  const towerBaseStats = towerTypes.map(t => calculateTowerStats(t, 1, undefined, 1, 1));
  const towerMaxDmg = Math.max(...towerBaseStats.map(s => s.damage), 1);
  const towerMaxRange = Math.max(...towerBaseStats.filter(s => s.range > 0).map(s => s.range), 1);
  const towerMaxSlow = Math.max(...towerBaseStats.map(s => (s.slowAmount || 0) * 100), 1);
  const towerMaxIncome = Math.max(...towerBaseStats.map(s => s.income || 0), 1);

  const towerAllLevelStats = towerTypes.flatMap(t =>
    [1, 2, 3].map(lvl => calculateTowerStats(t, lvl, undefined, 1, 1))
      .concat(["A", "B"].map(p => calculateTowerStats(t, 4, p as "A" | "B", 1, 1)))
  );
  const towerGlobalMaxDmg = Math.max(...towerAllLevelStats.map(s => s.damage), 1);
  const towerGlobalMaxRange = Math.max(...towerAllLevelStats.filter(s => s.range > 0).map(s => s.range), 1);
  const towerGlobalMaxAtkRate = Math.max(...towerAllLevelStats.filter(s => s.attackSpeed > 0).map(s => 1000 / s.attackSpeed), 0.1);
  const towerGlobalMaxIncome = Math.max(...towerAllLevelStats.map(s => s.income || 0), 1);
  const towerGlobalMaxIncomeRate = Math.max(...towerAllLevelStats.filter(s => s.incomeInterval && s.incomeInterval > 0).map(s => 1000 / (s.incomeInterval || 8000)), 0.05);
  const towerGlobalMaxSlow = Math.max(...towerAllLevelStats.map(s => (s.slowAmount || 0) * 100), 1);

  const troopTypes = Object.values(TROOP_DATA);
  const troopMaxHp = Math.max(...troopTypes.map(t => t.hp), 1);
  const troopMaxDmg = Math.max(...troopTypes.map(t => t.damage), 1);
  const troopMaxAtkRate = Math.max(...troopTypes.map(t => 1000 / t.attackSpeed), 0.1);

  const enemyMaxBounty = Math.max(...enemyTypes.map(t => ENEMY_DATA[t].bounty), 1);
  const enemyMaxSpeed = Math.max(...enemyTypes.map(t => ENEMY_DATA[t].speed), 0.1);
  const enemyMaxArmor = Math.max(...enemyTypes.map(t => ENEMY_DATA[t].armor * 100), 1);

  const spellEntries = spellTypes.map((type) => ({
    type,
    cost: SPELL_DATA[type].cost,
    cooldown: SPELL_DATA[type].cooldown,
  }));
  const freeSpellCount = spellEntries.filter((spell) => spell.cost === 0).length;
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
      ? spellEntries.reduce((sum, spell) => sum + spell.cost, 0) / spellEntries.length
      : 0;
  const controlSpellCount = spellTypes.filter(
    (type) => type === "freeze" || type === "reinforcements"
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
  const bossEnemyCount = enemyTypes.filter((type) => {
    const enemy = ENEMY_DATA[type];
    return enemy.isBoss || enemy.traits?.includes("boss");
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
      ? enemyTypes.reduce((sum, type) => sum + (ENEMY_DATA[type].liveCost ?? 1), 0) /
      enemyTypes.length
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
    mapWaveEntries.length > 0 ? totalConfiguredWaves / mapWaveEntries.length : 0;
  const waveSummaries = mapWaveEntries.flatMap(([mapKey, waves]) =>
    waves.map((groups, index) => ({
      mapKey,
      waveNumber: index + 1,
      groupCount: groups.length,
      enemyCount: groups.reduce((sum, group) => sum + group.count, 0),
      leadType: groups[0]?.type ?? null,
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
          icon: <Flame size={14} />,
          stats: [
            { label: "Meteors", value: `${stats.meteorCount}`, icon: <Users size={12} /> },
            {
              label: "Damage",
              value: `${stats.damagePerMeteor}`,
              icon: <Swords size={12} />,
            },
            { label: "Burn", value: `${stats.burnDamagePerSecond}/s`, icon: <Flame size={12} /> },
          ],
          details: [
            `Impact radius: ${stats.impactRadius}`,
            `Burn duration: ${(stats.burnDurationMs / 1000).toFixed(1)}s`,
            `Cast delay: ${(stats.fallDurationMs / 1000).toFixed(1)}s`,
          ],
          tip: "Drop on clustered elites near chokepoints.",
        };
      }
      case "lightning": {
        const stats = getLightningSpellStats(0);
        return {
          category: "Chain",
          color: "yellow",
          icon: <Zap size={14} />,
          stats: [
            { label: "Targets", value: `${stats.chainCount}`, icon: <Users size={12} /> },
            {
              label: "Total DMG",
              value: `${stats.totalDamage}`,
              icon: <Swords size={12} />,
            },
            {
              label: "Stun",
              value: `${(stats.stunDurationMs / 1000).toFixed(2)}s`,
              icon: <CircleOff size={12} />,
            },
          ],
          details: [
            "Chains from the initial strike target to nearby enemies.",
            "Good for deleting backline casters and fliers together.",
            "Stun helps buy breathing room during leaks.",
          ],
          tip: "Use after enemies bunch up at turns.",
        };
      }
      case "freeze": {
        const stats = getFreezeSpellStats(0);
        return {
          category: "Control",
          color: "cyan",
          icon: <Snowflake size={14} />,
          stats: [
            {
              label: "Duration",
              value: `${(stats.freezeDurationMs / 1000).toFixed(1)}s`,
              icon: <Timer size={12} />,
            },
            { label: "Range", value: "Global", icon: <Radio size={12} /> },
            { label: "Targets", value: "All", icon: <Users size={12} /> },
          ],
          details: [
            "Fully immobilizes enemies for the duration.",
            "Resets tempo when multiple lanes start leaking.",
            "Pairs well with Sunforge, Sentinel, and Barracks bursts.",
          ],
          tip: "Cast right before your burst windows.",
        };
      }
      case "payday": {
        const stats = getPaydaySpellStats(0);
        return {
          category: "Economy",
          color: "amber",
          icon: <Banknote size={14} />,
          stats: [
            { label: "Base", value: `${stats.basePayout} PP`, icon: <Coins size={12} /> },
            {
              label: "Per Enemy",
              value: `+${stats.bonusPerEnemy} PP`,
              icon: <TrendingUp size={12} />,
            },
            {
              label: "Max Bonus",
              value: `+${stats.maxBonus} PP`,
              icon: <Star size={12} />,
            },
          ],
          details: [
            `Aura duration: ${(stats.auraDurationMs / 1000).toFixed(1)}s`,
            "Value spikes when many enemies are already on map.",
            "Lets you accelerate level 4 timing in long waves.",
          ],
          tip: "Hold until wave density is high for max value.",
        };
      }
      case "reinforcements": {
        const stats = getReinforcementSpellStats(0);
        return {
          category: "Summon",
          color: "green",
          icon: <Users size={14} />,
          stats: [
            { label: "Units", value: `${stats.knightCount}`, icon: <Users size={12} /> },
            { label: "Unit HP", value: `${stats.knightHp}`, icon: <Heart size={12} /> },
            {
              label: "Unit DMG",
              value: `${stats.knightDamage}`,
              icon: <Swords size={12} />,
            },
          ],
          details: [
            `Move radius: ${stats.moveRadius}`,
            "Can be dropped on demand to block sudden leaks.",
            "Great for stalling while cooldown-heavy towers reset.",
          ],
          tip: "Use to pin bosses in overlapping tower fire.",
        };
      }
      default:
        return {
          category: "Spell",
          color: "purple",
          icon: <Sparkles size={14} />,
          stats: [],
          details: [],
          tip: "",
        };
    }
  };

  // Get dynamic tower stats using the centralized calculation
  const getDynamicStats = (type: string, level: number, upgrade?: "A" | "B") => {
    return calculateTowerStats(type, level, upgrade, 1, 1);
  };

  // Get tower upgrade costs
  const getUpgradeCost = (type: string, level: number) => {
    const towerDef = TOWER_STATS[type];
    if (!towerDef) return 0;
    if (level <= 3) {
      return towerDef.levels[level as 1 | 2 | 3]?.cost || 0;
    }
    return towerDef.level4Cost; // Level 4 cost from tower definition
  };

  // Get troop for station display
  const getTroopForLevel = (level: number, upgrade?: "A" | "B") => {
    if (level === 1) return TROOP_DATA.footsoldier;
    if (level === 2) return TROOP_DATA.armored;
    if (level === 3) return TROOP_DATA.elite;
    if (level === 4) {
      if (upgrade === "A") return TROOP_DATA.centaur;
      if (upgrade === "B") return TROOP_DATA.cavalry;
      return TROOP_DATA.knight;
    }
    return TROOP_DATA.footsoldier;
  };

  // Tower type icons
  const towerIcons: Record<string, React.ReactNode> = {
    station: <Users size={16} className="text-purple-400" />,
    cannon: <CircleDot size={16} className="text-red-400" />,
    library: <Snowflake size={16} className="text-cyan-400" />,
    lab: <Zap size={16} className="text-yellow-400" />,
    arch: <Volume2 size={16} className="text-blue-400" />,
    club: <Banknote size={16} className="text-amber-400" />,
  };

  const towerCategories = Object.fromEntries(
    Object.entries(TOWER_CATEGORIES).map(([k, v]) => [k, { category: v.label, color: v.colorName }])
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
          color="#d97706"
          glowColor="#f59e0b"
          showSideBorders={false}
        >
          {/* Inner ghost border */}
          <div className="absolute inset-[3px] rounded-[14px] pointer-events-none z-20" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
          <Image
            src="/images/new/gameplay_volcano.png"
            alt="Battle Scene"
            fill
            sizes="100vw"
            className="z-5 object-bottom object-cover opacity-[0.05] pointer-events-none select-none"
          />

          {/* Header */}
          <div className="sticky top-0 z-10 backdrop-blur px-9 py-4 flex items-center justify-between" style={{
            background: `linear-gradient(90deg, ${PANEL.bgDark}, ${PANEL.bgLight}, ${PANEL.bgDark})`,
            borderBottom: `2px solid ${GOLD.border30}`,
            boxShadow: `0 2px 12px ${OVERLAY.black40}`
          }}>
            <div className="flex items-center gap-3">
              <Book className="text-amber-400 drop-shadow-lg" size={28} />
              <h2 className="text-3xl font-bold text-amber-100 drop-shadow-lg tracking-wide">CODEX</h2>
              <span className="text-xs text-amber-400/60 ml-2 font-medium tracking-wider uppercase">
                Battle Encyclopedia
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all hover:scale-110"
              style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
            >
              <X size={20} className="text-amber-400" />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex z-10 overflow-scroll relative" style={{
            background: PANEL.bgDeep,
            borderBottom: `1px solid ${GOLD.border25}`,
          }}>
            {[
              {
                id: "towers",
                label: "Towers",
                icon: <ChessRook size={16} />,
                count: towerTypes.length,
              },
              {
                id: "heroes",
                label: "Heroes",
                icon: <Crown size={16} />,
                count: heroTypes.length,
              },
              {
                id: "enemies",
                label: "Enemies",
                icon: <Skull size={16} />,
                count: enemyTypes.length,
              },
              {
                id: "spells",
                label: "Spells",
                icon: <Zap size={16} />,
                count: spellTypes.length,
              },
              {
                id: "special_towers",
                label: "Structures",
                icon: <Sparkles size={16} />,
                count: specialTowerTypesInUse.length,
              },
              {
                id: "hazards",
                label: "Hazards",
                icon: <AlertTriangle size={16} />,
                count: hazardTypesInUse.length,
              },
              {
                id: "guide",
                label: "FAQ",
                icon: <Info size={16} />,
                count: 5,
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
                style={activeTab === tab.id ? {
                  background: `linear-gradient(180deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                  color: "rgb(252,211,77)",
                  borderBottom: `2px solid ${GOLD.accentBorder50}`,
                  boxShadow: `inset 0 -4px 12px ${GOLD.accentGlow08}`
                } : {
                  color: "rgba(180,140,60,0.5)",
                }}
              >
                {activeTab === tab.id && (
                  <div className="absolute inset-[2px] rounded-sm pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                )}
                {tab.icon}
                <span>{tab.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{
                  background: activeTab === tab.id ? PANEL.bgDeep : PANEL.bgWarmMid,
                  color: activeTab === tab.id ? "rgb(252,211,77)" : "rgba(180,140,60,0.6)",
                  border: `1px solid ${activeTab === tab.id ? GOLD.border25 : "transparent"}`
                }}>
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
                  <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
                  <div className="p-4 flex flex-col xl:flex-row gap-4 xl:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 text-amber-300">
                        <Crown size={15} />
                        <h3 className="text-lg font-bold">Tower Arsenal</h3>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">
                        Towers decide your lane DPS curve. Open for coverage, then spike with path upgrades.
                        Treat level-4 branching like a build commit, not a cosmetic choice.
                      </p>
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="rounded-lg border border-amber-800/35 bg-amber-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-amber-400 uppercase tracking-wider">Tower Types</div>
                          <div className="text-lg font-bold text-amber-200">{towerTypes.length}</div>
                        </div>
                        <div className="rounded-lg border border-sky-800/35 bg-sky-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-sky-400 uppercase tracking-wider">Damage Towers</div>
                          <div className="text-lg font-bold text-sky-200">{damageTowerCount}</div>
                        </div>
                        <div className="rounded-lg border border-purple-800/35 bg-purple-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-purple-400 uppercase tracking-wider">Support / Control</div>
                          <div className="text-lg font-bold text-purple-200">{supportTowerCount}</div>
                        </div>
                        <div className="rounded-lg border border-rose-800/35 bg-rose-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-rose-400 uppercase tracking-wider">Max L4 Cost</div>
                          <div className="text-sm font-bold text-rose-200 leading-tight">
                            {priciestLevel4Upgrade
                              ? `${TOWER_DATA[priciestLevel4Upgrade.type].name} ${priciestLevel4Upgrade.cost} PP`
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-[280px] rounded-xl border border-amber-700/35 bg-stone-950/45 p-3">
                      <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-2">Lane Build Diagram</div>
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        {featuredTowerTypes.slice(0, 4).map((type, index) => (
                          <React.Fragment key={`tower-diagram-${type}`}>
                            <FramedCodexSprite size={42} theme={TOWER_SPRITE_FRAME_THEME[type]}>
                              <TowerSprite type={type} size={33} level={2} />
                            </FramedCodexSprite>
                            {index < Math.min(3, featuredTowerTypes.length - 1) && (
                              <ChevronRight size={13} className="text-amber-300/70" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-[11px] text-stone-400 leading-relaxed">
                        Cost curve: {Math.round(averageTowerCost)} PP avg entry,{" "}
                        {cheapestTower ? `${TOWER_DATA[cheapestTower.type].name}` : "N/A"} at{" "}
                        {cheapestTower ? `${cheapestTower.cost}` : "-"} PP to{" "}
                        {priciestTower ? `${TOWER_DATA[priciestTower.type].name}` : "N/A"} at{" "}
                        {priciestTower ? `${priciestTower.cost}` : "-"} PP.
                      </div>
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
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        {(() => {
                          const cc = getCC(TOWER_COLOR[type]);
                          const dps = calculateDPS(stats.damage, stats.attackSpeed);

                          const cardRows: { value: number; max: number; color: string; label: string; displayValue: string; icon: React.ReactNode }[] = [];
                          if (stats.damage > 0)
                            cardRows.push({ value: stats.damage, max: towerMaxDmg, color: "red", label: "DMG", displayValue: `${Math.floor(stats.damage)}`, icon: <Swords size={10} /> });
                          if (stats.range > 0 && type !== "club")
                            cardRows.push({ value: stats.range, max: towerMaxRange, color: "blue", label: "RNG", displayValue: `${Math.floor(stats.range)}`, icon: <Target size={10} /> });
                          if (stats.slowAmount != null && stats.slowAmount > 0)
                            cardRows.push({ value: stats.slowAmount * 100, max: towerMaxSlow, color: "cyan", label: "SLOW", displayValue: `${Math.round(stats.slowAmount * 100)}%`, icon: <Snowflake size={10} /> });
                          if (stats.income != null && stats.income > 0)
                            cardRows.push({ value: stats.income, max: towerMaxIncome, color: "amber", label: "EARN", displayValue: `+${stats.income} PP`, icon: <Banknote size={10} /> });
                          if (type === "station")
                            cardRows.push({ value: TROOP_DATA.footsoldier.hp, max: troopMaxHp, color: "purple", label: "TROOP", displayValue: `${TROOP_DATA.footsoldier.hp} HP`, icon: <Users size={10} /> });

                          return (
                            <>
                              <div className={`px-4 py-2 border-b flex items-center justify-between relative z-10 ${cc.headerBg} ${cc.headerBorder}`}>
                                <div className="flex items-center gap-2">
                                  {towerIcons[type]}
                                  <span className={`text-xs font-medium uppercase tracking-wider ${cc.text}`}>
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
                                    size={56}
                                    theme={TOWER_SPRITE_FRAME_THEME[type]}
                                    className="group-hover:scale-105 transition-transform"
                                  >
                                    <TowerSprite type={type} size={44} level={1} />
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
                                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                                      {tower.desc}
                                    </p>
                                    <div className="flex flex-wrap gap-0.5 mt-1.5">
                                      {TOWER_TAGS[type].map((tag) => (
                                        <TagBadge key={tag} tag={tag} size={9} />
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-lg bg-stone-950/40 border border-stone-700/25 p-2.5 mb-3 flex-1">
                                  <div className="space-y-2">
                                    {cardRows.map((row, i) => (
                                      <StatBar key={i} value={row.value} max={row.max} color={row.color} label={row.label} displayValue={row.displayValue} icon={row.icon} />
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
                                        <Users size={10} className="text-purple-400" />
                                        <span className="text-[10px] text-stone-400 uppercase">Spawn</span>
                                        <span className="text-[10px] font-bold text-purple-300">1 troop / {(stats.spawnInterval || 5000) / 1000}s</span>
                                      </div>
                                    </div>
                                  )}
                                  {type === "club" && (
                                    <div className="mt-2 pt-2 border-t border-stone-700/25">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-800/30">
                                        <Timer size={10} className="text-amber-400" />
                                        <span className="text-[10px] text-stone-400 uppercase">Every</span>
                                        <span className="text-[10px] font-bold text-amber-300">{(stats.incomeInterval || 8000) / 1000}s</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-auto">
                                  <div className="px-2.5 py-2 bg-red-950/30 rounded-lg border border-red-900/30 group-hover:border-red-700/50 transition-colors">
                                    <div className="text-[8px] text-red-500/70 uppercase mb-0.5 tracking-wider font-medium">Path A</div>
                                    <div className="text-[11px] text-red-300 font-semibold truncate">{tower.upgrades.A.name}</div>
                                  </div>
                                  <div className="px-2.5 py-2 bg-blue-950/30 rounded-lg border border-blue-900/30 group-hover:border-blue-700/50 transition-colors">
                                    <div className="text-[8px] text-blue-500/70 uppercase mb-0.5 tracking-wider font-medium">Path B</div>
                                    <div className="text-[11px] text-blue-300 font-semibold truncate">{tower.upgrades.B.name}</div>
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
                const tower = TOWER_DATA[selectedTower as keyof typeof TOWER_DATA];
                const towerDef = TOWER_STATS[selectedTower]; // Used in renderUniqueFeatures
                const cat = towerCategories[selectedTower];
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                void towerDef; // Explicitly mark as used in closure

                // Render unique features for a tower upgrade
                const renderUniqueFeatures = (stats: ReturnType<typeof getDynamicStats>, path: "A" | "B", type: string) => {
                  const features: React.ReactNode[] = [];
                  const upgradeStats = towerDef?.upgrades?.[path]?.stats;

                  // Combat stats
                  if (stats.damage > 0) {
                    features.push(
                      <div key="dmg" className="bg-red-950/50 rounded-lg p-2 text-center border border-red-800/40">
                        <Swords size={14} className="mx-auto text-red-400 mb-1" />
                        <div className="text-[9px] text-red-500">Damage</div>
                        <div className="text-red-300 font-bold">{Math.floor(stats.damage)}</div>
                      </div>
                    );
                  }

                  if (stats.range > 0 && type !== "club") {
                    features.push(
                      <div key="rng" className="bg-blue-950/50 rounded-lg p-2 text-center border border-blue-800/40">
                        <Target size={14} className="mx-auto text-blue-400 mb-1" />
                        <div className="text-[9px] text-blue-500">Range</div>
                        <div className="text-blue-300 font-bold">{Math.floor(stats.range)}</div>
                      </div>
                    );
                  }

                  if (stats.attackSpeed > 0) {
                    features.push(
                      <div key="spd" className="bg-green-950/50 rounded-lg p-2 text-center border border-green-800/40">
                        <Gauge size={14} className="mx-auto text-green-400 mb-1" />
                        <div className="text-[9px] text-green-500">Speed</div>
                        <div className="text-green-300 font-bold">{(stats.attackSpeed / 1000).toFixed(1)}s</div>
                      </div>
                    );
                  }

                  // Unique features
                  if (stats.chainTargets && stats.chainTargets > 1) {
                    const isLabChain = type === "lab";
                    features.push(
                      <div key="chain" className={isLabChain
                        ? "bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40"
                        : "bg-yellow-950/50 rounded-lg p-2 text-center border border-yellow-800/40"}>
                        {isLabChain
                          ? <Zap size={14} className="mx-auto text-cyan-400 mb-1" />
                          : <Users size={14} className="mx-auto text-yellow-400 mb-1" />}
                        <div className={isLabChain ? "text-[9px] text-cyan-500" : "text-[9px] text-yellow-500"}>
                          {isLabChain ? "Chains" : "Targets"}
                        </div>
                        <div className={isLabChain ? "text-cyan-300 font-bold" : "text-yellow-300 font-bold"}>
                          {stats.chainTargets}
                        </div>
                      </div>
                    );
                  }

                  if (stats.crescendoMaxStacks && stats.crescendoMaxStacks > 0) {
                    features.push(
                      <div key="crescendo" className="bg-emerald-950/50 rounded-lg p-2 text-center border border-emerald-800/40">
                        <Music size={14} className="mx-auto text-emerald-400 mb-1" />
                        <div className="text-[9px] text-emerald-500">Crescendo</div>
                        <div className="text-emerald-300 font-bold">{stats.crescendoMaxStacks}</div>
                      </div>
                    );
                  }

                  if (stats.splashRadius && stats.splashRadius > 0) {
                    features.push(
                      <div key="splash" className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40">
                        <Radio size={14} className="mx-auto text-orange-400 mb-1" />
                        <div className="text-[9px] text-orange-500">Splash</div>
                        <div className="text-orange-300 font-bold">{stats.splashRadius}</div>
                      </div>
                    );
                  }

                  if (stats.slowAmount && stats.slowAmount > 0) {
                    features.push(
                      <div key="slow" className="bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40">
                        <Snowflake size={14} className="mx-auto text-cyan-400 mb-1" />
                        <div className="text-[9px] text-cyan-500">Slow</div>
                        <div className="text-cyan-300 font-bold">{Math.round(stats.slowAmount * 100)}%</div>
                      </div>
                    );
                  }

                  if (stats.stunChance && stats.stunChance > 0) {
                    features.push(
                      <div key="stun" className="bg-indigo-950/50 rounded-lg p-2 text-center border border-indigo-800/40">
                        <CircleOff size={14} className="mx-auto text-indigo-400 mb-1" />
                        <div className="text-[9px] text-indigo-500">Freeze</div>
                        <div className="text-indigo-300 font-bold">{Math.round(stats.stunChance * 100)}%</div>
                      </div>
                    );
                  }

                  if (stats.burnDamage && stats.burnDamage > 0) {
                    features.push(
                      <div key="burn" className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40">
                        <Flame size={14} className="mx-auto text-orange-400 mb-1" />
                        <div className="text-[9px] text-orange-500">Burn</div>
                        <div className="text-orange-300 font-bold">{stats.burnDamage}/s</div>
                      </div>
                    );
                  }

                  // Economy features
                  if (stats.income && stats.income > 0) {
                    features.push(
                      <div key="income" className="bg-amber-950/50 rounded-lg p-2 text-center border border-amber-800/40">
                        <Banknote size={14} className="mx-auto text-amber-400 mb-1" />
                        <div className="text-[9px] text-amber-500">Income</div>
                        <div className="text-amber-300 font-bold">+{stats.income} PP</div>
                      </div>
                    );
                  }

                  if (stats.incomeInterval && stats.incomeInterval > 0) {
                    features.push(
                      <div key="interval" className="bg-amber-950/50 rounded-lg p-2 text-center border border-amber-800/40">
                        <Timer size={14} className="mx-auto text-amber-400 mb-1" />
                        <div className="text-[9px] text-amber-500">Interval</div>
                        <div className="text-amber-300 font-bold">{stats.incomeInterval / 1000}s</div>
                      </div>
                    );
                  }

                  // Aura features
                  if (upgradeStats?.rangeBuff) {
                    features.push(
                      <div key="rangeAura" className="bg-cyan-950/50 rounded-lg p-2 text-center border border-cyan-800/40">
                        <TrendingUp size={14} className="mx-auto text-cyan-400 mb-1" />
                        <div className="text-[9px] text-cyan-500">Range Aura</div>
                        <div className="text-cyan-300 font-bold">+{Math.round(upgradeStats.rangeBuff * 100)}%</div>
                      </div>
                    );
                  }

                  if (upgradeStats?.damageBuff) {
                    features.push(
                      <div key="dmgAura" className="bg-orange-950/50 rounded-lg p-2 text-center border border-orange-800/40">
                        <TrendingUp size={14} className="mx-auto text-orange-400 mb-1" />
                        <div className="text-[9px] text-orange-500">DMG Aura</div>
                        <div className="text-orange-300 font-bold">+{Math.round(upgradeStats.damageBuff * 100)}%</div>
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
                      style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
                    >
                      <ChevronRight size={16} className="rotate-180" />
                      <span>Back to all towers</span>
                    </button>

                    <div className="space-y-6">
                      {/* Header Section */}
                      <div className="rounded-xl overflow-hidden relative" style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border30}`,
                        boxShadow: `inset 0 0 12px ${GOLD.glow04}`,
                      }}>
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        {(() => {
                          const tcc = getCC(TOWER_COLOR[selectedTower]);
                          const baseStats = getDynamicStats(selectedTower, 1);
                          const baseDps = calculateDPS(baseStats.damage, baseStats.attackSpeed);
                          return (
                            <>
                              <div className={`px-6 py-3 border-b flex items-center gap-3 ${tcc.headerBg} ${tcc.headerBorder}`}>
                                {towerIcons[selectedTower]}
                                <span className={`text-sm font-medium uppercase tracking-wider ${tcc.text}`}>
                                  {cat.category}
                                </span>
                              </div>
                              <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
                                <FramedCodexSprite
                                  size={112}
                                  theme={TOWER_SPRITE_FRAME_THEME[selectedTower as keyof typeof TOWER_DATA]}
                                >
                                  <TowerSprite
                                    type={selectedTower as keyof typeof TOWER_DATA}
                                    size={96}
                                    level={4}
                                  />
                                </FramedCodexSprite>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-3xl font-bold text-amber-200 mb-1">
                                    {tower.name}
                                  </h3>
                                  <p className="text-stone-400 mb-2 text-sm leading-relaxed">{tower.desc}</p>
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {TOWER_TAGS[selectedTower as keyof typeof TOWER_DATA].map((tag) => (
                                      <TagBadge key={tag} tag={tag} size={10} />
                                    ))}
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2.5 bg-amber-950/50 rounded-lg border border-amber-800/40">
                                      <div className="text-[10px] text-amber-500 uppercase tracking-wider">Base Cost</div>
                                      <div className="text-amber-300 font-bold text-lg">{tower.cost} PP</div>
                                    </div>
                                    {baseStats.damage > 0 && (
                                      <div className="px-4 py-2.5 bg-red-950/50 rounded-lg border border-red-800/40">
                                        <div className="text-[10px] text-red-500 uppercase tracking-wider">Base Damage</div>
                                        <div className="text-red-300 font-bold text-lg">{Math.floor(baseStats.damage)}</div>
                                      </div>
                                    )}
                                    {baseStats.range > 0 && selectedTower !== "club" && (
                                      <div className="px-4 py-2.5 bg-blue-950/50 rounded-lg border border-blue-800/40">
                                        <div className="text-[10px] text-blue-500 uppercase tracking-wider">Base Range</div>
                                        <div className="text-blue-300 font-bold text-lg">{Math.floor(baseStats.range)}</div>
                                      </div>
                                    )}
                                    {baseDps > 0 && (
                                      <div className="px-4 py-2.5 bg-gradient-to-r from-red-950/50 to-orange-950/40 rounded-lg border border-red-800/40">
                                        <div className="text-[10px] text-orange-500 uppercase tracking-wider">Base DPS</div>
                                        <div className="text-orange-300 font-bold text-lg">{baseDps.toFixed(1)}</div>
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
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
                          <h4 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                            <ArrowUp size={18} className="text-amber-400" />
                            Level Progression
                          </h4>
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((level) => {
                            const stats = getDynamicStats(selectedTower, level);
                            const cost = getUpgradeCost(selectedTower, level);
                            const isStation = selectedTower === "station";
                            const troop = isStation ? getTroopForLevel(level) : null;

                            return (
                              <div
                                key={level}
                                className={`rounded-xl border overflow-hidden ${level === 4
                                  ? "bg-gradient-to-br from-purple-950/60 to-stone-950 border-purple-700/50"
                                  : "bg-stone-900/80 border-stone-700/40"
                                  }`}
                              >
                                <div className={`px-3 py-2 flex items-center justify-between ${level === 4 ? "bg-purple-900/30" : "bg-stone-800/50"}`}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,0,0,0.3)" }}>
                                      <TowerSprite type={selectedTower as keyof typeof TOWER_DATA} size={28} level={level} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1">
                                        <div className="flex">
                                          {[...Array(level)].map((_, i) => (
                                            <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
                                          ))}
                                        </div>
                                        <span className={`font-bold text-sm ${level === 4 ? "text-purple-300" : "text-amber-300"}`}>
                                          Lvl {level}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-amber-400 text-xs flex items-center gap-1">
                                    <Coins size={10} /> {cost} PP
                                  </span>
                                </div>
                                <div className="p-3">
                                  {level === 4 ? (
                                    <div className="space-y-2">
                                      {(["A", "B"] as const).map((path) => {
                                        const pathStats = getDynamicStats(selectedTower, 4, path);
                                        const pathTroop = isStation ? getTroopForLevel(4, path) : null;
                                        const pathDps = calculateDPS(pathStats.damage, pathStats.attackSpeed);

                                        return (
                                          <div
                                            key={path}
                                            className={`rounded-lg border overflow-hidden ${path === "A"
                                              ? "bg-red-950/30 border-red-800/40"
                                              : "bg-blue-950/30 border-blue-800/40"
                                              }`}
                                          >
                                            <div className={`px-2 py-1.5 flex items-center justify-between ${path === "A" ? "text-red-300 bg-red-900/30" : "text-blue-300 bg-blue-900/30"}`}>
                                              <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,0,0,0.3)" }}>
                                                  <TowerSprite type={selectedTower as keyof typeof TOWER_DATA} size={22} level={4} upgrade={path as "A" | "B"} />
                                                </div>
                                                <span className="text-[10px] font-bold">{tower.upgrades[path].name}</span>
                                              </div>
                                              {pathDps > 0 && <DPSBadge dps={pathDps} size="sm" />}
                                            </div>

                                            <div className="p-1.5 space-y-1">
                                              {isStation && pathTroop && (
                                                <div className="grid grid-cols-3 gap-1 text-[9px]">
                                                  <div className="bg-red-950/50 rounded p-1 text-center border border-red-900/30">
                                                    <div className="text-red-500 text-[7px]">HP</div>
                                                    <div className="text-red-300 font-bold">{pathTroop.hp}</div>
                                                  </div>
                                                  <div className="bg-orange-950/50 rounded p-1 text-center border border-orange-900/30">
                                                    <div className="text-orange-500 text-[7px]">DMG</div>
                                                    <div className="text-orange-300 font-bold">{pathTroop.damage}</div>
                                                  </div>
                                                  <div className="bg-green-950/50 rounded p-1 text-center border border-green-900/30">
                                                    <div className="text-green-500 text-[7px]">SPD</div>
                                                    <div className="text-green-300 font-bold">{(pathTroop.attackSpeed / 1000).toFixed(1)}s</div>
                                                  </div>
                                                </div>
                                              )}

                                              {!isStation && selectedTower !== "club" && (
                                                <div className="grid grid-cols-3 gap-1 text-[9px]">
                                                  {pathStats.damage > 0 && (
                                                    <div className="bg-red-950/50 rounded p-1 text-center border border-red-900/30">
                                                      <div className="text-red-500 text-[7px]">DMG</div>
                                                      <div className="text-red-300 font-bold">{Math.floor(pathStats.damage)}</div>
                                                    </div>
                                                  )}
                                                  {pathStats.range > 0 && (
                                                    <div className="bg-blue-950/50 rounded p-1 text-center border border-blue-900/30">
                                                      <div className="text-blue-500 text-[7px]">RNG</div>
                                                      <div className="text-blue-300 font-bold">{Math.floor(pathStats.range)}</div>
                                                    </div>
                                                  )}
                                                  {pathStats.attackSpeed > 0 && (
                                                    <div className="bg-green-950/50 rounded p-1 text-center border border-green-900/30">
                                                      <div className="text-green-500 text-[7px]">SPD</div>
                                                      <div className="text-green-300 font-bold">{(pathStats.attackSpeed / 1000).toFixed(1)}s</div>
                                                    </div>
                                                  )}
                                                </div>
                                              )}

                                              {selectedTower === "club" && (
                                                <div className="grid grid-cols-2 gap-1 text-[9px]">
                                                  <div className="bg-amber-950/50 rounded p-1 text-center border border-amber-900/30">
                                                    <div className="text-amber-500 text-[7px]">Income</div>
                                                    <div className="text-amber-300 font-bold">+{pathStats.income} PP</div>
                                                  </div>
                                                  <div className="bg-amber-950/50 rounded p-1 text-center border border-amber-900/30">
                                                    <div className="text-amber-500 text-[7px]">Interval</div>
                                                    <div className="text-amber-300 font-bold">{(pathStats.incomeInterval || 8000) / 1000}s</div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-xs text-stone-400 mb-3 line-clamp-2 leading-relaxed">
                                        {tower.levelDesc[level as 1 | 2 | 3]}
                                      </p>

                                      {isStation && troop && (
                                        <div className="space-y-1.5">
                                          <StatBar value={troop.hp} max={troopMaxHp} color="red" label="HP" displayValue={`${troop.hp}`} icon={<Heart size={10} />} />
                                          <StatBar value={troop.damage} max={troopMaxDmg} color="orange" label="DMG" displayValue={`${troop.damage}`} icon={<Swords size={10} />} />
                                          <StatBar value={1000 / troop.attackSpeed} max={troopMaxAtkRate} color="green" label="SPD" displayValue={`${(troop.attackSpeed / 1000).toFixed(1)}s`} icon={<Gauge size={10} />} />
                                        </div>
                                      )}

                                      {!isStation && selectedTower !== "club" && (
                                        <div className="space-y-1.5">
                                          {stats.damage > 0 && (
                                            <StatBar value={stats.damage} max={towerGlobalMaxDmg} color="red" label="DMG" displayValue={`${Math.floor(stats.damage)}`} icon={<Swords size={10} />} />
                                          )}
                                          {stats.range > 0 && (
                                            <StatBar value={stats.range} max={towerGlobalMaxRange} color="blue" label="RNG" displayValue={`${Math.floor(stats.range)}`} icon={<Target size={10} />} />
                                          )}
                                          {stats.attackSpeed > 0 && (
                                            <StatBar value={1000 / stats.attackSpeed} max={towerGlobalMaxAtkRate} color="green" label="SPD" displayValue={`${(stats.attackSpeed / 1000).toFixed(1)}s`} icon={<Gauge size={10} />} />
                                          )}
                                          {(() => {
                                            const levelDps = calculateDPS(stats.damage, stats.attackSpeed);
                                            return levelDps > 0 ? (
                                              <div className="mt-1"><DPSBadge dps={levelDps} size="sm" /></div>
                                            ) : null;
                                          })()}
                                        </div>
                                      )}

                                      {selectedTower === "club" && (
                                        <div className="space-y-1.5">
                                          <StatBar value={stats.income || 0} max={towerGlobalMaxIncome} color="amber" label="PP" displayValue={`+${stats.income}`} icon={<Banknote size={10} />} />
                                          <StatBar value={1000 / (stats.incomeInterval || 8000)} max={towerGlobalMaxIncomeRate} color="amber" label="INT" displayValue={`${(stats.incomeInterval || 8000) / 1000}s`} icon={<Timer size={10} />} />
                                        </div>
                                      )}

                                      {selectedTower === "library" && (
                                        <div className="mt-1.5">
                                          <StatBar value={(stats.slowAmount || 0) * 100} max={towerGlobalMaxSlow} color="cyan" label="SLOW" displayValue={`${Math.round((stats.slowAmount || 0) * 100)}%`} icon={<Snowflake size={10} />} />
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Evolution Paths */}
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${GOLD.border25}, transparent)` }} />
                          <h4 className="text-lg font-bold text-amber-200 flex items-center gap-2">
                            <Sparkles size={18} className="text-amber-400" />
                            Evolution Paths (Level 4)
                          </h4>
                          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.border25})` }} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                          {(["A", "B"] as const).map((path) => {
                            const upgrade = tower.upgrades[path];
                            const stats = getDynamicStats(selectedTower, 4, path);
                            const isStation = selectedTower === "station";
                            const troop = isStation ? getTroopForLevel(4, path) : null;
                            const pathLabel = path === "A" ? "Offensive" : "Utility";

                            return (
                              <div
                                key={path}
                                className={`rounded-xl border overflow-hidden ${path === "A"
                                  ? "bg-gradient-to-br from-red-950/40 to-stone-950 border-red-700/50"
                                  : "bg-gradient-to-br from-blue-950/40 to-stone-950 border-blue-700/50"
                                  }`}
                              >
                                {/* Path header */}
                                <div className={`px-4 py-3 ${path === "A" ? "bg-red-900/30" : "bg-blue-900/30"} flex items-center gap-4`}>
                                  <FramedCodexSprite
                                    size={56}
                                    theme={TOWER_SPRITE_FRAME_THEME[selectedTower as keyof typeof TOWER_DATA]}
                                  >
                                    <TowerSprite
                                      type={selectedTower as keyof typeof TOWER_DATA}
                                      size={48}
                                      level={4}
                                      upgrade={path as "A" | "B"}
                                    />
                                  </FramedCodexSprite>
                                  <div className="flex-1">
                                    <div className={`text-[10px] uppercase tracking-wider ${path === "A" ? "text-red-400" : "text-blue-400"}`}>
                                      Path {path} • {pathLabel}
                                    </div>
                                    <h5 className={`text-xl font-bold ${path === "A" ? "text-red-200" : "text-blue-200"}`}>
                                      {upgrade.name}
                                    </h5>
                                  </div>
                                </div>

                                <div className="p-4 space-y-4">
                                  {/* Description */}
                                  <p className="text-stone-400 text-sm">{upgrade.desc}</p>

                                  {/* Special Effect Box */}
                                  <div className={`rounded-lg p-3 ${path === "A" ? "bg-red-950/40 border border-red-800/40" : "bg-blue-950/40 border border-blue-800/40"}`}>
                                    <div className={`text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 ${path === "A" ? "text-red-400" : "text-blue-400"}`}>
                                      <Sparkles size={12} />
                                      Special Effect
                                    </div>
                                    <p className={`text-sm ${path === "A" ? "text-red-200" : "text-blue-200"}`}>
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
                                      <p className="text-xs text-stone-400 mb-2">{troop.desc}</p>
                                      <div className="grid grid-cols-4 gap-2 text-[10px]">
                                        <div className="bg-red-950/50 rounded p-1.5 text-center border border-red-900/30">
                                          <Heart size={12} className="mx-auto text-red-400 mb-0.5" />
                                          <div className="text-red-300 font-bold">{troop.hp}</div>
                                        </div>
                                        <div className="bg-orange-950/50 rounded p-1.5 text-center border border-orange-900/30">
                                          <Swords size={12} className="mx-auto text-orange-400 mb-0.5" />
                                          <div className="text-orange-300 font-bold">{troop.damage}</div>
                                        </div>
                                        <div className="bg-green-950/50 rounded p-1.5 text-center border border-green-900/30">
                                          <Gauge size={12} className="mx-auto text-green-400 mb-0.5" />
                                          <div className="text-green-300 font-bold">{(troop.attackSpeed / 1000).toFixed(1)}s</div>
                                        </div>
                                        {troop.isRanged && (
                                          <div className="bg-blue-950/50 rounded p-1.5 text-center border border-blue-900/30">
                                            <Crosshair size={12} className="mx-auto text-blue-400 mb-0.5" />
                                            <div className="text-blue-300 font-bold">{troop.range}</div>
                                          </div>
                                        )}
                                      </div>
                                      {(troop.isMounted || troop.isRanged || troop.canTargetFlying) && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          {troop.isMounted && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-amber-900/50 rounded text-amber-300 border border-amber-700/50">
                                              <Wind size={10} className="inline" /> Mounted
                                            </span>
                                          )}
                                          {troop.isRanged && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-blue-900/50 rounded text-blue-300 border border-blue-700/50">
                                              <Crosshair size={10} className="inline" /> Ranged
                                            </span>
                                          )}
                                          {troop.canTargetFlying && (
                                            <span className="text-[9px] px-1.5 py-0.5 bg-cyan-900/50 rounded text-cyan-300 border border-cyan-700/50">
                                              <Plane size={10} className="inline" /> Anti-Air
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Stats Grid */}
                                  <div className="grid grid-cols-4 gap-2">
                                    {renderUniqueFeatures(stats, path, selectedTower)}
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
                  <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
                  <div className="p-4 flex flex-col xl:flex-row gap-4 xl:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 text-indigo-300">
                        <Shield size={15} />
                        <h3 className="text-lg font-bold">Hero Roster</h3>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">
                        Heroes are your mobile utility layer. They plug leaks, hold lanes, and convert cooldown timing
                        into tempo advantage on top of static tower defense.
                      </p>
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="rounded-lg border border-indigo-800/35 bg-indigo-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-indigo-400 uppercase tracking-wider">Hero Count</div>
                          <div className="text-lg font-bold text-indigo-200">{heroTypes.length}</div>
                        </div>
                        <div className="rounded-lg border border-red-800/35 bg-red-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-red-400 uppercase tracking-wider">Highest HP</div>
                          <div className="text-sm font-bold text-red-200 leading-tight">
                            {highestHpHero ? `${HERO_DATA[highestHpHero].name} ${HERO_DATA[highestHpHero].hp}` : "N/A"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-blue-800/35 bg-blue-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-blue-400 uppercase tracking-wider">Longest Range</div>
                          <div className="text-sm font-bold text-blue-200 leading-tight">
                            {longestRangeHero ? `${HERO_DATA[longestRangeHero].name} ${HERO_DATA[longestRangeHero].range}` : "N/A"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-cyan-800/35 bg-cyan-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Ability Tempo</div>
                          <div className="text-sm font-bold text-cyan-200 leading-tight">
                            {shortestHeroCooldown
                              ? `${(shortestHeroCooldown.cooldown / 1000).toFixed(1)}s min / ${(averageHeroCooldown / 1000).toFixed(1)}s avg`
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-[280px] rounded-xl border border-indigo-700/35 bg-stone-950/45 p-3">
                      <div className="text-[10px] text-indigo-400 uppercase tracking-wider mb-2">Role Diagram</div>
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        {featuredHeroTypes.map((type, index) => (
                          <React.Fragment key={`hero-diagram-${type}`}>
                            <FramedCodexSprite size={44} theme={getHeroSpriteFrameTheme(type)}>
                              <HeroSprite type={type} size={34} />
                            </FramedCodexSprite>
                            {index < featuredHeroTypes.length - 1 && (
                              <ChevronRight size={13} className="text-indigo-300/70" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-[11px] text-stone-400 leading-relaxed">
                        Ranged-capable heroes: {rangedHeroCount}/{heroTypes.length}. Average hero HP is{" "}
                        {Math.round(averageHeroHp)}. Plan your hero around map length and lane split pressure.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {heroTypes.map((type) => {
                    const hero = HERO_DATA[type];
                    const cooldown = HERO_ABILITY_COOLDOWNS[type];

                    const heroRole = HERO_ROLES[type];
                    const roleInfo = { role: heroRole.label, color: HERO_COLOR_NAMES[type] };

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
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        {(() => {
                          const rcc = getCC(roleInfo.color);
                          return (
                            <div className={`px-4 py-2 border-b flex items-center justify-between ${rcc.headerBg} ${rcc.headerBorder}`}>
                              <div className={`flex items-center gap-2 ${rcc.text}`}>
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
                              size={64}
                              theme={getHeroSpriteFrameTheme(type)}
                              className="group-hover:scale-105 transition-transform"
                            >
                              <HeroSprite type={type} size={52} />
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

                          <div className="space-y-1.5 mb-3">
                            <StatBar value={hero.hp} max={heroMaxHp} color="red" label="HP" displayValue={`${hero.hp}`} icon={<Heart size={10} />} />
                            <StatBar value={hero.damage} max={heroMaxDmg} color="orange" label="DMG" displayValue={`${hero.damage}`} icon={<Swords size={10} />} />
                            <StatBar value={hero.range} max={heroMaxRange} color="blue" label="RNG" displayValue={`${hero.range}`} icon={<Target size={10} />} />
                            <StatBar value={hero.speed} max={heroMaxSpeed} color="cyan" label="SPD" displayValue={`${hero.speed}`} icon={<Wind size={10} />} />
                          </div>

                          {/* Ability preview */}
                          <div className="bg-purple-950/40 rounded-lg p-2 border border-purple-800/30">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <Sparkles size={12} className="text-purple-400" />
                                <span className="text-xs font-medium text-purple-300">{hero.ability}</span>
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
                const cooldown = HERO_ABILITY_COOLDOWNS[selectedHeroDetail as HeroType];

                const heroInfo: Record<string, {
                  role: string;
                  roleIcon: React.ReactNode;
                  roleColor: string;
                  strengths: string[];
                  weaknesses: string[];
                  abilityDetails: string[];
                  strategy: string;
                  synergies: string[];
                }> = {
                  tiger: {
                    role: "Frontline Brawler",
                    roleIcon: <Swords size={16} />,
                    roleColor: "orange",
                    strengths: ["High melee damage", "Powerful crowd control", "Good survivability"],
                    weaknesses: ["Short range", "Vulnerable during cooldowns", "Can get overwhelmed"],
                    abilityDetails: [
                      "Stuns ALL enemies within 180 range for 3 seconds",
                      "Applies 50% slow effect after stun ends",
                      "Creates orange fear shockwave visual effect",
                    ],
                    strategy: "Dive into enemy formations when clustered. Use Mighty Roar to stun groups, then retreat while they're slowed.",
                    synergies: ["Pairs well with AoE towers", "Use with Freeze spell for extended CC"],
                  },
                  tenor: {
                    role: "AoE Support",
                    roleIcon: <Volume2 size={16} />,
                    roleColor: "purple",
                    strengths: ["Large AoE damage", "Heals allied troops", "Good stun duration"],
                    weaknesses: ["Lower single-target damage", "Moderate HP", "Needs positioning"],
                    abilityDetails: [
                      "Deals 80 damage to all enemies within 250 range",
                      "Stuns affected enemies for 2 seconds",
                      "Heals nearby troops for 75 HP",
                    ],
                    strategy: "Position near chokepoints to maximize damage. Sonic Boom both damages enemies and heals your troops.",
                    synergies: ["Great with Dinky Station troops", "Combos with slow towers"],
                  },
                  mathey: {
                    role: "Tank / Protector",
                    roleIcon: <Shield size={16} />,
                    roleColor: "blue",
                    strengths: ["Highest HP in game", "Invincibility ability", "Draws enemy fire"],
                    weaknesses: ["Low damage output", "Slow movement", "Long ability cooldown"],
                    abilityDetails: [
                      "Hero becomes invincible for 5 seconds",
                      "Taunts all nearby enemies within 150 range",
                      "Enemies forced to target the hero",
                    ],
                    strategy: "Use Fortress Shield when overwhelmed to draw all enemy fire and protect your towers and troops.",
                    synergies: ["Protects squishy troops", "Pairs with high DPS towers"],
                  },
                  rocky: {
                    role: "Ranged Artillery",
                    roleIcon: <Target size={16} />,
                    roleColor: "green",
                    strengths: ["Massive ranged damage", "Large AoE", "Safe positioning"],
                    weaknesses: ["Vulnerable in melee", "Slow attack speed", "Ability has delay"],
                    abilityDetails: [
                      "Massive AoE damage in target area",
                      "Damage falls off from center of impact",
                      "Ground crater with dust cloud effect",
                    ],
                    strategy: "Position Rocky behind your front line. Use Boulder Bash on clustered enemies for devastating damage.",
                    synergies: ["Use with Dinky Station troops", "Combos with Firestone Library"],
                  },
                  scott: {
                    role: "Support Buffer",
                    roleIcon: <TrendingUp size={16} />,
                    roleColor: "cyan",
                    strengths: ["Global tower buff", "Huge DPS increase", "Low risk positioning"],
                    weaknesses: ["No direct damage ability", "Relies on towers", "Low personal DPS"],
                    abilityDetails: [
                      "Boosts ALL tower damage by 50% for 8 seconds",
                      "Golden light rays emanate from hero",
                      "Affects every tower on the map",
                    ],
                    strategy: "F. Scott is a pure support. Save Inspiration for critical waves or boss enemies to maximize tower damage.",
                    synergies: ["Best with many towers built", "Combos with high-damage towers"],
                  },
                  captain: {
                    role: "Summoner",
                    roleIcon: <Users size={16} />,
                    roleColor: "red",
                    strengths: ["Extra troops on demand", "Flexible positioning", "Good for blocking"],
                    weaknesses: ["Knights are temporary", "Moderate personal stats", "Cooldown dependent"],
                    abilityDetails: [
                      "Summons 3 knights troops near the hero",
                      "Knights have 500 HP and 30 damage each",
                      "Summoning circle with energy pillars effect",
                    ],
                    strategy: "Use Rally Knights to plug leaks in your defense or create additional blocking points.",
                    synergies: ["Works with troop-healing effects", "Pairs with high DPS towers"],
                  },
                  engineer: {
                    role: "Tactical Builder",
                    roleIcon: <CircleDot size={16} />,
                    roleColor: "amber",
                    strengths: ["Free turret placement", "Extends tower coverage", "Good DPS"],
                    weaknesses: ["Turret is fragile", "Needs good placement", "Moderate stats"],
                    abilityDetails: [
                      "Deploys a turret nearby",
                      "Turret does not self-destruct",
                      "Can spawn multiple turrets",
                    ],
                    strategy: "Place turrets strategically to cover weak points or extend your defensive line.",
                    synergies: ["Covers areas without towers", "Good for emergency defense"],
                  },
                };
                const info = heroInfo[selectedHeroDetail] || heroInfo.tiger;

                return (
                  <div>
                    <button
                      onClick={() => setSelectedHeroDetail(null)}
                      className="flex items-center gap-2 text-amber-300 hover:text-amber-100 mb-4 transition-all font-medium px-3 py-1.5 rounded-lg"
                      style={{ background: PANEL.bgWarmMid, border: `1px solid ${GOLD.border25}` }}
                    >
                      <ChevronRight size={16} className="rotate-180" />
                      <span>Back to all heroes</span>
                    </button>

                    <div className="space-y-6">
                      {/* Hero Header */}
                      <div className="rounded-xl overflow-hidden relative" style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border30}`,
                        boxShadow: `inset 0 0 12px ${GOLD.glow04}`,
                      }}>
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        {(() => {
                          const hcc = getCC(info.roleColor);
                          return (
                            <div className={`px-6 py-3 border-b flex items-center gap-3 ${hcc.headerBg} ${hcc.headerBorder}`}>
                              <span className={hcc.text}>{info.roleIcon}</span>
                              <span className={`text-sm font-medium uppercase tracking-wider ${hcc.text}`}>
                                {info.role}
                              </span>
                            </div>
                          );
                        })()}

                        <div className="p-6 flex items-start gap-6">
                          <FramedCodexSprite
                            size={112}
                            theme={getHeroSpriteFrameTheme(selectedHeroDetail as HeroType)}
                          >
                            <HeroSprite
                              type={selectedHeroDetail as HeroType}
                              size={96}
                            />
                          </FramedCodexSprite>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-3xl font-bold text-amber-200">
                                {hero.name}
                              </h3>
                              <HeroIcon type={selectedHeroDetail as HeroType} size={24} />
                            </div>
                            <p className="text-stone-400 mb-4">
                              {hero.description}
                            </p>
                            <div className="space-y-2.5 bg-stone-900/40 rounded-xl p-4 border border-stone-700/30">
                              <StatBar value={hero.hp} max={heroMaxHp} color="red" label="HP" displayValue={`${hero.hp}`} icon={<Heart size={10} />} />
                              <StatBar value={hero.damage} max={heroMaxDmg} color="orange" label="DMG" displayValue={`${hero.damage}`} icon={<Swords size={10} />} />
                              <StatBar value={hero.range} max={heroMaxRange} color="blue" label="RNG" displayValue={`${hero.range}`} icon={<Target size={10} />} />
                              <StatBar value={1000 / hero.attackSpeed} max={heroMaxAtkRate} color="green" label="ATK" displayValue={`${(hero.attackSpeed / 1000).toFixed(1)}s`} icon={<Gauge size={10} />} />
                              <StatBar value={hero.speed} max={heroMaxSpeed} color="cyan" label="SPD" displayValue={`${hero.speed}`} icon={<Wind size={10} />} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Ability Section */}
                      <div className="bg-gradient-to-br from-purple-950/40 to-stone-950 rounded-xl border border-purple-700/50 overflow-hidden">
                        <div className="px-5 py-3 bg-purple-900/30 border-b border-purple-800/40 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <HeroAbilityIcon type={selectedHeroDetail as HeroType} size={18} />
                            <span className="text-sm text-purple-400 font-medium uppercase tracking-wider">Special Ability</span>
                          </div>
                          <div className="flex items-center gap-2 bg-purple-950/50 px-3 py-1.5 rounded-lg border border-purple-700/50">
                            <Timer size={14} className="text-purple-400" />
                            <span className="text-purple-300 font-bold text-sm">{cooldown / 1000}s Cooldown</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h4 className="text-2xl font-bold text-purple-200 mb-2 flex items-center gap-2">
                            <HeroAbilityIcon type={selectedHeroDetail as HeroType} size={24} />
                            {hero.ability}
                          </h4>
                          <p className="text-purple-300 mb-4">{hero.abilityDesc}</p>
                          <div className="bg-purple-950/40 rounded-lg p-4 border border-purple-800/30">
                            <div className="text-xs text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Info size={10} /> Ability Details
                            </div>
                            <ul className="text-sm text-purple-300 space-y-1.5">
                              {info.abilityDetails.map((detail, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-0.5">•</span>
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
                      <div className="rounded-xl p-5 relative" style={{
                        background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                        border: `1.5px solid ${GOLD.border25}`,
                        boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                      }}>
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        <h4 className="text-amber-200 font-bold mb-3 flex items-center gap-2 relative z-10">
                          <Info size={16} className="text-amber-400" /> Combat Strategy
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

            {activeTab === "enemies" && (() => {
              const groupedEnemies = groupEnemiesByCategory(enemyTypes);

              return (
                <div className="space-y-6">
                  <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                      border: `1.5px solid ${GOLD.border30}`,
                      boxShadow: `inset 0 0 14px ${GOLD.glow04}`,
                    }}
                  >
                    <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
                    <div className="p-4 flex flex-col xl:flex-row gap-4 xl:gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 text-red-300">
                          <Skull size={15} />
                          <h3 className="text-lg font-bold">Enemy Compendium</h3>
                        </div>
                        <p className="text-sm text-stone-300 leading-relaxed">
                          Wave pressure comes from trait combinations, not raw HP alone. Track leak cost, movement type,
                          and backline threat density before committing your build path.
                        </p>
                        <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                          <div className="rounded-lg border border-red-800/35 bg-red-950/30 px-2.5 py-2">
                            <div className="text-[10px] text-red-400 uppercase tracking-wider">Enemy Types</div>
                            <div className="text-lg font-bold text-red-200">{enemyTypes.length}</div>
                          </div>
                          <div className="rounded-lg border border-purple-800/35 bg-purple-950/30 px-2.5 py-2">
                            <div className="text-[10px] text-purple-400 uppercase tracking-wider">Boss Units</div>
                            <div className="text-lg font-bold text-purple-200">{bossEnemyCount}</div>
                          </div>
                          <div className="rounded-lg border border-rose-800/35 bg-rose-950/30 px-2.5 py-2">
                            <div className="text-[10px] text-rose-400 uppercase tracking-wider">Max Leak Penalty</div>
                            <div className="text-sm font-bold text-rose-200 leading-tight">
                              {highestLeakEnemy
                                ? `${ENEMY_DATA[highestLeakEnemy].name} ${ENEMY_DATA[highestLeakEnemy].liveCost ?? 1}`
                                : "N/A"}
                            </div>
                          </div>
                          <div className="rounded-lg border border-cyan-800/35 bg-cyan-950/30 px-2.5 py-2">
                            <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Threat Mix</div>
                            <div className="text-sm font-bold text-cyan-200 leading-tight">
                              Fly {flyingEnemyCount} / Ranged {rangedEnemyCount}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="xl:w-[300px] rounded-xl border border-red-700/35 bg-stone-950/45 p-3">
                        <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Pressure Diagram</div>
                        <div className="flex items-center justify-center gap-1.5 mb-2">
                          {featuredEnemyTypes.map((type, index) => (
                            <React.Fragment key={`enemy-diagram-${type}`}>
                              <FramedCodexSprite size={44} theme={getEnemySpriteFrameTheme(type)}>
                                <EnemySprite type={type} size={34} animated />
                              </FramedCodexSprite>
                              {index < featuredEnemyTypes.length - 1 && (
                                <ChevronRight size={13} className="text-red-300/70" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="text-[11px] text-stone-400 leading-relaxed">
                          Average leak cost is {averageEnemyLeakCost.toFixed(1)} lives per enemy, so late-wave leaks
                          are disproportionately expensive.
                        </div>
                      </div>
                    </div>
                  </div>

                  {ENEMY_CATEGORY_ORDER.map(category => {
                    const categoryEnemies = groupedEnemies[category];
                    if (categoryEnemies.length === 0) return null;

                    const catMeta = ENEMY_CATEGORY_META[category];

                    return (
                      <div key={category}>
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-3 pb-3" style={{ borderBottom: `1px solid ${GOLD.border25}` }}>
                          <div className={`p-2 rounded-lg ${catMeta.bgColor}`} style={{ border: `1px solid ${GOLD.border25}` }}>
                            {CATEGORY_ICONS[category]}
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${catMeta.color}`}>{catMeta.name}</h3>
                            <p className="text-xs text-amber-400/50">{catMeta.desc}</p>
                          </div>
                          <div className="ml-auto text-xs font-bold px-2.5 py-1 rounded-md" style={{
                            background: PANEL.bgWarmMid,
                            color: "rgb(252,211,77)",
                            border: `1px solid ${GOLD.border25}`,
                          }}>
                            {categoryEnemies.length} {categoryEnemies.length === 1 ? "enemy" : "enemies"}
                          </div>
                        </div>

                        {/* Category Enemies Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryEnemies.map((type) => {
                            const enemy = ENEMY_DATA[type];
                            const traits = enemy.traits || [];
                            const abilities = enemy.abilities || [];
                            const hasAoE = enemy.aoeRadius && enemy.aoeDamage;
                            const maxHpInCategory = Math.max(...categoryEnemies.map(t => ENEMY_DATA[t].hp), 1);

                            const getThreatLevel = (hp: number, isBoss?: boolean) => {
                              if (isBoss || hp >= 1000) return { level: "Boss", color: "purple", icon: <Crown size={12} /> };
                              if (hp >= 500) return { level: "Elite", color: "orange", icon: <Star size={12} /> };
                              if (hp >= 200) return { level: "Standard", color: "yellow", icon: <Skull size={12} /> };
                              return { level: "Minion", color: "green", icon: <Skull size={12} /> };
                            };
                            const threat = getThreatLevel(enemy.hp, enemy.isBoss);
                            const threatCC = getCC(threat.color);

                            const getEnemyTypeClassification = () => {
                              if (enemy.flying) return { type: "Flying", icon: <Wind size={12} />, color: "cyan" };
                              if (enemy.isRanged) return { type: "Ranged", icon: <Crosshair size={12} />, color: "purple" };
                              if (enemy.armor > ARMORED_THRESHOLD) return { type: "Armored", icon: <Shield size={12} />, color: "stone" };
                              if (enemy.speed > FAST_SPEED_THRESHOLD) return { type: "Fast", icon: <Gauge size={12} />, color: "green" };
                              return { type: "Ground", icon: <Flag size={12} />, color: "red" };
                            };
                            const enemyTypeClass = getEnemyTypeClassification();
                            const typeCC = getCC(enemyTypeClass.color);

                            return (
                              <div
                                key={type}
                                className="rounded-xl overflow-hidden hover:border-red-700/50 transition-colors relative"
                                style={{
                                  background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                                  border: `1.5px solid ${GOLD.border25}`,
                                  boxShadow: `inset 0 0 10px ${GOLD.glow04}`,
                                }}
                              >
                                <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                                <div className={`px-4 py-2 border-b flex items-center justify-between ${threatCC.headerBg} ${threatCC.headerBorder}`}>
                                  <div className={`flex items-center gap-2 ${threatCC.text}`}>
                                    {threat.icon}
                                    <span className="text-xs font-medium uppercase tracking-wider">
                                      {threat.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className={`flex items-center gap-1.5 text-xs ${typeCC.text}`}>
                                      {enemyTypeClass.icon}
                                      <span>{enemyTypeClass.type}</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-950/60 rounded-lg border border-rose-800/50 flex-shrink-0">
                                      <Heart size={10} className="text-rose-400" />
                                      <span className="text-rose-300 font-bold text-[10px]">{enemy.liveCost || 1} {(enemy.liveCost || 1) > 1 ? "lives" : "life"}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4">
                                  <div className="flex items-start gap-4 mb-3">
                                    <FramedCodexSprite
                                      size={64}
                                      theme={getEnemySpriteFrameTheme(type)}
                                    >
                                      <EnemySprite type={type} size={52} animated />
                                    </FramedCodexSprite>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-lg font-bold text-red-200 truncate">
                                        {enemy.name}
                                      </h3>
                                      <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">
                                        {enemy.desc}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <HPBar hp={enemy.hp} maxHp={maxHpInCategory} isBoss={enemy.isBoss} />
                                  </div>

                                  <div className="space-y-1.5 mb-2">
                                    <StatBar value={enemy.bounty} max={enemyMaxBounty} color="amber" label="LOOT" displayValue={`${enemy.bounty} PP`} icon={<Coins size={10} />} />
                                    <StatBar value={enemy.speed} max={enemyMaxSpeed} color="green" label="SPD" displayValue={`${enemy.speed}`} icon={<Gauge size={10} />} />
                                    {enemy.armor > 0 && (
                                      <StatBar value={enemy.armor * 100} max={enemyMaxArmor} color="stone" label="ARM" displayValue={`${Math.round(enemy.armor * 100)}%`} icon={<Shield size={10} />} />
                                    )}
                                  </div>

                                  {/* Ranged Stats (if applicable) */}
                                  {enemy.isRanged && (
                                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                                      <div className="bg-purple-950/40 rounded p-1 text-center border border-purple-900/30">
                                        <div className="text-[8px] text-purple-500">Range</div>
                                        <div className="text-purple-300 font-bold text-[10px]">{enemy.range}</div>
                                      </div>
                                      <div className="bg-purple-950/40 rounded p-1 text-center border border-purple-900/30">
                                        <div className="text-[8px] text-purple-500">Atk Speed</div>
                                        <div className="text-purple-300 font-bold text-[10px]">
                                          {enemy.attackSpeed ? `${(enemy.attackSpeed / 1000).toFixed(1)}s` : "—"}
                                        </div>
                                      </div>
                                      <div className="bg-purple-950/40 rounded p-1 text-center border border-purple-900/30">
                                        <div className="text-[8px] text-purple-500">Proj Dmg</div>
                                        <div className="text-purple-300 font-bold text-[10px]">{enemy.projectileDamage}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* AoE Stats (if applicable) */}
                                  {hasAoE && (
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                      <div className="bg-orange-950/40 rounded p-1 text-center border border-orange-900/30">
                                        <div className="text-[8px] text-orange-500">AoE Radius</div>
                                        <div className="text-orange-300 font-bold text-[10px]">{enemy.aoeRadius}</div>
                                      </div>
                                      <div className="bg-orange-950/40 rounded p-1 text-center border border-orange-900/30">
                                        <div className="text-[8px] text-orange-500">AoE Damage</div>
                                        <div className="text-orange-300 font-bold text-[10px]">{enemy.aoeDamage}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Flying Troop Attack Stats (if applicable) */}
                                  {enemy.targetsTroops && enemy.troopDamage && (
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                      <div className="bg-cyan-950/40 rounded p-1 text-center border border-cyan-900/30">
                                        <Wind size={12} className="mx-auto text-cyan-400 mb-0.5" />
                                        <div className="text-[8px] text-cyan-500">Swoop Dmg</div>
                                        <div className="text-cyan-300 font-bold text-[10px]">{enemy.troopDamage}</div>
                                      </div>
                                      <div className="bg-cyan-950/40 rounded p-1 text-center border border-cyan-900/30">
                                        <Timer size={12} className="mx-auto text-cyan-400 mb-0.5" />
                                        <div className="text-[8px] text-cyan-500">Atk Speed</div>
                                        <div className="text-cyan-300 font-bold text-[10px]">{((enemy.troopAttackSpeed || DEFAULT_ENEMY_TROOP_ATTACK_SPEED) / 1000).toFixed(1)}s</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Melee Combat Stats (for ground enemies that engage troops) */}
                                  {!enemy.flying && !enemy.breakthrough && !enemy.isRanged && (
                                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                                      <div className="bg-red-950/40 rounded p-1 text-center border border-red-900/30">
                                        <Swords size={12} className="mx-auto text-red-400 mb-0.5" />
                                        <div className="text-[8px] text-red-500">Melee Dmg</div>
                                        <div className="text-red-300 font-bold text-[10px]">{enemy.troopDamage ?? DEFAULT_ENEMY_TROOP_DAMAGE}</div>
                                      </div>
                                      <div className="bg-red-950/40 rounded p-1 text-center border border-red-900/30">
                                        <Timer size={12} className="mx-auto text-red-400 mb-0.5" />
                                        <div className="text-[8px] text-red-500">Atk Speed</div>
                                        <div className="text-red-300 font-bold text-[10px]">1.0s</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Breakthrough indicator */}
                                  {enemy.breakthrough && (
                                    <div className="mb-2">
                                      <div className="bg-sky-950/40 rounded p-1 text-center border border-sky-900/30">
                                        <div className="text-sky-300 font-bold text-[10px] flex items-center justify-center gap-1">
                                          <Zap size={10} className="text-sky-400" />
                                          Bypasses Troops
                                        </div>
                                        {enemy.troopDamage != null && (
                                          <div className="text-[9px] text-sky-300/90 mt-0.5">
                                            Hero Dmg: <span className="font-bold text-sky-200">{enemy.troopDamage}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Dynamic Traits */}
                                  {traits.length > 0 && (
                                    <div className="mb-2">
                                      <div className="text-[9px] text-stone-500 uppercase font-bold mb-1">Traits</div>
                                      <div className="flex flex-wrap gap-1">
                                        {traits.map((trait, i) => {
                                          const traitInfo = getTraitInfo(trait);
                                          return (
                                            <span
                                              key={i}
                                              className={`text-[9px] px-1.5 py-0.5 bg-stone-800/60 rounded border border-stone-700/50 flex items-center gap-1 ${traitInfo.color}`}
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
                                          const abilityInfo = getAbilityInfo(ability.type);
                                          return (
                                            <div
                                              key={i}
                                              className={`p-1.5 rounded border ${abilityInfo.bgColor}`}
                                            >
                                              <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className={abilityInfo.color}>{abilityInfo.icon}</span>
                                                <span className="text-[10px] font-bold text-white">{ability.name}</span>
                                                <span className="text-[8px] px-1 py-0.5 bg-black/30 rounded text-white/70 ml-auto">
                                                  {Math.round(ability.chance * 100)}%
                                                </span>
                                              </div>
                                              <p className="text-[9px] text-white/60 mb-1">{ability.desc}</p>
                                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[8px]">
                                                <span className="text-white/50">
                                                  Duration: <span className="text-white/80">{(ability.duration / 1000).toFixed(1)}s</span>
                                                </span>
                                                {ability.intensity !== undefined && (
                                                  <span className="text-white/50">
                                                    {ability.type === "slow" || ability.type.includes("tower") ? "Effect: " : "DPS: "}
                                                    <span className="text-white/80">
                                                      {ability.type === "slow" || ability.type.includes("tower")
                                                        ? `${Math.round(ability.intensity * 100)}%`
                                                        : ability.intensity}
                                                    </span>
                                                  </span>
                                                )}
                                                {ability.radius && (
                                                  <span className="text-white/50">
                                                    Radius: <span className="text-white/80">{ability.radius}</span>
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
                                  {abilities.length === 0 && traits.length === 0 && (
                                    <div className="text-center text-[9px] text-stone-500 py-1">
                                      Standard enemy - no special abilities
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
                  <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
                  <div className="p-4 flex flex-col xl:flex-row gap-4 xl:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 text-purple-300">
                        <Zap size={15} />
                        <h3 className="text-lg font-bold">Spellbook Overview</h3>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">
                        Spells are your tempo and recovery lever. Build loadouts around wave control, burst conversion,
                        and economy acceleration instead of stacking overlapping effects.
                      </p>
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="rounded-lg border border-purple-800/35 bg-purple-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-purple-400 uppercase tracking-wider">Spell Types</div>
                          <div className="text-lg font-bold text-purple-200">{spellTypes.length}</div>
                        </div>
                        <div className="rounded-lg border border-emerald-800/35 bg-emerald-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Free Casts</div>
                          <div className="text-lg font-bold text-emerald-200">{freeSpellCount}</div>
                        </div>
                        <div className="rounded-lg border border-blue-800/35 bg-blue-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-blue-400 uppercase tracking-wider">Cooldown Avg</div>
                          <div className="text-sm font-bold text-blue-200 leading-tight">
                            {(averageSpellCooldown / 1000).toFixed(1)}s
                          </div>
                        </div>
                        <div className="rounded-lg border border-cyan-800/35 bg-cyan-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Loadout Utility</div>
                          <div className="text-sm font-bold text-cyan-200 leading-tight">
                            3 slots • {controlSpellCount} control spells
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-[300px] rounded-xl border border-purple-700/35 bg-stone-950/45 p-3">
                      <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-2">Cast Flow Diagram</div>
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        {spellTypes.map((type, index) => (
                          <React.Fragment key={`spell-diagram-${type}`}>
                            <FramedCodexSprite size={38} theme={SPELL_SPRITE_FRAME_THEME[type]}>
                              <SpellSprite type={type} size={28} />
                            </FramedCodexSprite>
                            {index < spellTypes.length - 1 && (
                              <ChevronRight size={12} className="text-purple-300/70" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-[11px] text-stone-400 leading-relaxed">
                        Average spell cost: {averageSpellCost.toFixed(1)} PP. Most expensive:{" "}
                        {priciestSpell ? `${SPELL_DATA[priciestSpell.type].name} (${priciestSpell.cost} PP)` : "N/A"}.
                      </div>
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
                        <div className="absolute inset-[2px] rounded-[10px] pointer-events-none z-10" style={{ border: `1px solid ${GOLD.innerBorder08}` }} />
                        {(() => {
                          const scc = getCC(info.color);
                          return (
                            <div className={`px-4 py-2.5 border-b flex items-center justify-between ${scc.headerBg} ${scc.headerBorder}`}>
                              <div className={`flex items-center gap-2 ${scc.text}`}>
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
                              size={72}
                              theme={SPELL_SPRITE_FRAME_THEME[type]}
                            >
                              <SpellSprite type={type} size={56} />
                            </FramedCodexSprite>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-purple-200">
                                  {spell.name}
                                </h3>
                                <SpellIcon type={type} size={20} />
                              </div>
                              <p className="text-sm text-stone-400">{spell.desc}</p>
                            </div>
                          </div>

                          {(() => {
                            const scc = getCC(info.color);
                            return (
                              <>
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                  {info.stats.map((stat, i) => (
                                    <div key={i} className={`rounded-lg p-2.5 text-center border ${scc.statBg} ${scc.statBorder}`}>
                                      <div className={`flex items-center justify-center mb-1 ${scc.text}`}>
                                        {stat.icon}
                                      </div>
                                      <div className="text-[9px] text-stone-500 uppercase tracking-wider">{stat.label}</div>
                                      <div className={`font-bold text-sm ${scc.statText}`}>{stat.value}</div>
                                    </div>
                                  ))}
                                </div>

                                <div className="bg-stone-800/40 rounded-lg p-3 border border-stone-700/40 mb-3">
                                  <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <Info size={10} /> Details
                                  </div>
                                  <ul className="text-xs text-stone-300 space-y-1.5">
                                    {info.details.map((detail, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className={`mt-0.5 ${scc.text}`}>•</span>
                                        <span className="leading-relaxed">{detail}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className={`rounded-lg px-3 py-2.5 text-xs flex items-start gap-2 border ${scc.statBg} ${scc.statBorder}`}>
                                  <Sparkles size={12} className={`mt-0.5 shrink-0 ${scc.text}`} />
                                  <div>
                                    <span className={`font-semibold ${scc.statText}`}>Pro Tip: </span>
                                    <span className="text-stone-400">{info.tip}</span>
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
                  <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
                  <div className="p-4 flex flex-col xl:flex-row gap-4 xl:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 text-amber-300">
                        <Sparkles size={15} />
                        <h3 className="text-lg font-bold">Special Structure Deck</h3>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">
                        Special structures are map-authored power pieces. Their uptime and geometry create free
                        tempo swings, so route waves around them like a permanent extra tower slot.
                      </p>
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="rounded-lg border border-amber-800/35 bg-amber-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-amber-400 uppercase tracking-wider">Placements</div>
                          <div className="text-lg font-bold text-amber-200">{totalSpecialTowerInstances}</div>
                        </div>
                        <div className="rounded-lg border border-cyan-800/35 bg-cyan-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Unique Types</div>
                          <div className="text-lg font-bold text-cyan-200">{specialTowerTypesInUse.length}</div>
                        </div>
                        <div className="rounded-lg border border-purple-800/35 bg-purple-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-purple-400 uppercase tracking-wider">Most Common</div>
                          <div className="text-sm font-bold text-purple-200 leading-tight">
                            {mostCommonSpecialTowerType
                              ? `${SPECIAL_TOWER_INFO[mostCommonSpecialTowerType].name} ${specialTowerInstanceCounts.get(mostCommonSpecialTowerType) ?? 0
                              }`
                              : "N/A"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-rose-800/35 bg-rose-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-rose-400 uppercase tracking-wider">Avg / Special Map</div>
                          <div className="text-sm font-bold text-rose-200 leading-tight">
                            {levelsWithSpecialStructures > 0
                              ? `${averageSpecialTowersPerSpecialMap.toFixed(1)} • ${levelsWithSpecialStructures} maps`
                              : "No special maps"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-[320px] rounded-xl border border-amber-700/35 bg-stone-950/45 p-3">
                      <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-2">Structure Flow</div>
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        {featuredSpecialTowers.map((type, index) => (
                          <React.Fragment key={`special-diagram-${type}`}>
                            <SpecialTowerSprite type={type} size={44} />
                            {index < featuredSpecialTowers.length - 1 && (
                              <ChevronRight size={13} className="text-amber-300/70" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-[11px] text-stone-400 leading-relaxed">
                        Coverage is {levelsWithSpecialStructures} maps total, with{" "}
                        {averageSpecialTowersPerSpecialMap.toFixed(1)} structures on average where they appear.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {specialTowerTypesInUse.map((type) => {
                    const info = SPECIAL_TOWER_INFO[type];
                    const levels = Array.from(specialTowerLevels.get(type) || []);
                    return (
                      <div key={type} className={`rounded-2xl border p-4 ${info.panelClass}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <SpecialTowerSprite type={type} size={72} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className={`text-lg font-bold ${info.color}`}>{info.name}</h3>
                              <span className="rounded-full border border-white/10 bg-stone-900/45 px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-300">
                                {info.role}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-stone-400">
                              <span className="inline-flex items-center gap-1">
                                {info.icon}
                                Active Tooling
                              </span>
                              <span>
                                {levels.length} level{levels.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          <div className="rounded-lg border border-stone-700/50 bg-stone-900/45 p-2.5">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Effect</div>
                            <p className="text-xs text-stone-200 leading-relaxed">{info.effect}</p>
                          </div>
                          <div className="rounded-lg border border-stone-700/50 bg-stone-900/45 p-2.5">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Numbers</div>
                            <p className="text-xs text-stone-200 leading-relaxed">{info.numbers}</p>
                          </div>
                          <div className="rounded-lg border border-stone-700/50 bg-stone-900/45 p-2.5">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Tactical Use</div>
                            <p className="text-xs text-stone-300 leading-relaxed">{info.tip}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5">Appears On</div>
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
                  <div className="absolute inset-[2px] rounded-[14px] pointer-events-none" style={{ border: `1px solid ${GOLD.innerBorder10}` }} />
                  <div className="p-4 flex flex-col xl:flex-row gap-4 xl:gap-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 text-red-300">
                        <AlertTriangle size={15} />
                        <h3 className="text-lg font-bold">Hazard Control Room</h3>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">
                        Hazards are map-level force multipliers. Push enemies through damage fields and debuff zones
                        to turn pathing decisions into free damage and safer tower uptime.
                      </p>
                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                        <div className="rounded-lg border border-red-800/35 bg-red-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-red-400 uppercase tracking-wider">Hazard Zones</div>
                          <div className="text-lg font-bold text-red-200">{totalHazardZones}</div>
                        </div>
                        <div className="rounded-lg border border-orange-800/35 bg-orange-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-orange-400 uppercase tracking-wider">Unique Hazards</div>
                          <div className="text-lg font-bold text-orange-200">{hazardTypesInUse.length}</div>
                        </div>
                        <div className="rounded-lg border border-cyan-800/35 bg-cyan-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-cyan-400 uppercase tracking-wider">Most Common</div>
                          <div className="text-sm font-bold text-cyan-200 leading-tight">
                            {mostCommonHazardType
                              ? `${HAZARD_INFO[mostCommonHazardType].name} ${hazardZoneCounts.get(mostCommonHazardType) ?? 0
                              }`
                              : "N/A"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-rose-800/35 bg-rose-950/30 px-2.5 py-2">
                          <div className="text-[10px] text-rose-400 uppercase tracking-wider">Avg / Hazard Map</div>
                          <div className="text-sm font-bold text-rose-200 leading-tight">
                            {levelsWithHazards > 0
                              ? `${averageHazardsPerHazardMap.toFixed(1)} • ${levelsWithHazards} maps`
                              : "No hazard maps"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="xl:w-[320px] rounded-xl border border-red-700/35 bg-stone-950/45 p-3">
                      <div className="text-[10px] text-red-400 uppercase tracking-wider mb-2">Hazard Flow</div>
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        {featuredHazards.map((type, index) => (
                          <React.Fragment key={`hazard-diagram-${type}`}>
                            <HazardSprite type={type} size={44} />
                            {index < featuredHazards.length - 1 && (
                              <ChevronRight size={13} className="text-red-300/70" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="text-[11px] text-stone-400 leading-relaxed">
                        Hazards appear on {levelsWithHazards} maps, averaging{" "}
                        {averageHazardsPerHazardMap.toFixed(1)} zones where enabled.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {hazardTypesInUse.map((type) => {
                    const info = HAZARD_INFO[type];
                    const levels = Array.from(hazardLevels.get(type) || []);
                    return (
                      <div key={type} className={`rounded-2xl border p-4 ${info.panelClass}`}>
                        <div className="flex items-start gap-3 mb-3">
                          <HazardSprite type={type} size={72} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <h3 className={`text-lg font-bold ${info.color}`}>{info.name}</h3>
                              <span className="rounded-full border border-white/10 bg-stone-900/45 px-2 py-0.5 text-[10px] uppercase tracking-wider text-stone-300">
                                Hazard
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[11px] text-stone-400">
                              <span className="inline-flex items-center gap-1">
                                {info.icon}
                                Env Modifier
                              </span>
                              <span>
                                {levels.length} level{levels.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                          <div className="rounded-lg border border-stone-700/50 bg-stone-900/45 p-2.5">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Effect</div>
                            <p className="text-xs text-stone-200 leading-relaxed">{info.effect}</p>
                          </div>
                          <div className="rounded-lg border border-stone-700/50 bg-stone-900/45 p-2.5">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Numbers</div>
                            <p className="text-xs text-stone-200 leading-relaxed">{info.numbers}</p>
                          </div>
                          <div className="rounded-lg border border-stone-700/50 bg-stone-900/45 p-2.5">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1">Counterplay</div>
                            <p className="text-xs text-stone-300 leading-relaxed">{info.counterplay}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1.5">Appears On</div>
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
                        <h3 className="text-xl font-bold">How To Play: Full Battle Loop</h3>
                      </div>
                      <p className="text-sm text-stone-300 leading-relaxed">
                        Start with <span className="text-amber-300 font-semibold">{INITIAL_PAW_POINTS} PP</span>,
                        defend <span className="text-rose-300 font-semibold">{INITIAL_LIVES} lives</span>, and pace
                        your economy against escalating wave density. Auto-wave cadence begins at{" "}
                        <span className="text-cyan-300 font-semibold">{Math.round(WAVE_TIMER_BASE / 1000)}s</span>,
                        but you can launch early when your setup is ready.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {featuredTowerTypes.slice(0, 2).map((type) => (
                          <FramedCodexSprite key={`guide-tower-${type}`} size={42} theme={TOWER_SPRITE_FRAME_THEME[type]}>
                            <TowerSprite type={type} size={33} level={2} />
                          </FramedCodexSprite>
                        ))}
                        {featuredEnemyTypes.slice(0, 2).map((type) => (
                          <FramedCodexSprite key={`guide-enemy-${type}`} size={42} theme={getEnemySpriteFrameTheme(type)}>
                            <EnemySprite type={type} size={33} animated />
                          </FramedCodexSprite>
                        ))}
                        {featuredHeroTypes.slice(0, 1).map((type) => (
                          <FramedCodexSprite key={`guide-hero-${type}`} size={42} theme={getHeroSpriteFrameTheme(type)}>
                            <HeroSprite type={type} size={33} />
                          </FramedCodexSprite>
                        ))}
                        {spellTypes.slice(0, 1).map((type) => (
                          <FramedCodexSprite key={`guide-spell-${type}`} size={42} theme={SPELL_SPRITE_FRAME_THEME[type]}>
                            <SpellSprite type={type} size={31} />
                          </FramedCodexSprite>
                        ))}
                        {featuredSpecialTowers.slice(0, 1).map((type) => (
                          <SpecialTowerSprite key={`guide-special-${type}`} type={type} size={42} />
                        ))}
                        {featuredHazards.slice(0, 1).map((type) => (
                          <HazardSprite key={`guide-hazard-${type}`} type={type} size={42} />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 lg:w-[430px]">
                      <div className="rounded-lg border border-purple-700/30 bg-purple-950/25 p-2.5">
                        <div className="text-[10px] text-purple-300 uppercase tracking-wider mb-1">Maps</div>
                        <div className="text-xl font-bold text-purple-200">{campaignLevelCount + challengeLevelCount}</div>
                        <div className="text-[10px] text-stone-400">Campaign + Challenge</div>
                      </div>
                      <div className="rounded-lg border border-sky-700/30 bg-sky-950/25 p-2.5">
                        <div className="text-[10px] text-sky-300 uppercase tracking-wider mb-1">Dual Paths</div>
                        <div className="text-xl font-bold text-sky-200">{dualPathLevelCount}</div>
                        <div className="text-[10px] text-stone-400">Split-lane pressure maps</div>
                      </div>
                      <div className="rounded-lg border border-orange-700/30 bg-orange-950/25 p-2.5">
                        <div className="text-[10px] text-orange-300 uppercase tracking-wider mb-1">Tower Types</div>
                        <div className="text-xl font-bold text-orange-200">{towerTypes.length}</div>
                        <div className="text-[10px] text-stone-400">Core build arsenal</div>
                      </div>
                      <div className="rounded-lg border border-red-700/30 bg-red-950/25 p-2.5">
                        <div className="text-[10px] text-red-300 uppercase tracking-wider mb-1">Enemy Types</div>
                        <div className="text-xl font-bold text-red-200">{enemyTypes.length}</div>
                        <div className="text-[10px] text-stone-400">Unique unit profiles</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 relative rounded-lg overflow-hidden border border-amber-700/25" style={{ height: 80 }}>
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
                      <span className="text-sm font-semibold">1) Enemies and Threat Traits</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredEnemyTypes.map((type) => (
                        <FramedCodexSprite key={`enemy-guide-${type}`} size={44} theme={getEnemySpriteFrameTheme(type)}>
                          <EnemySprite type={type} size={34} animated />
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
                      Read trait badges in the enemy codex and pre-build counters. Flying ignores ground blocks,
                      armored needs sustained DPS, ranged enemies punish weak backline coverage, and bosses consume
                      multiple lives if they leak.
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-800/35 bg-amber-950/20 p-4">
                    <div className="flex items-center gap-2 text-amber-300 mb-2">
                      <Crown size={14} />
                      <span className="text-sm font-semibold">2) Towers and Upgrade Priorities</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {towerTypes.map((type) => (
                        <FramedCodexSprite key={`tower-guide-${type}`} size={42} theme={TOWER_SPRITE_FRAME_THEME[type]}>
                          <TowerSprite type={type} size={33} level={2} />
                        </FramedCodexSprite>
                      ))}
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-amber-700/25 mb-3" style={{ height: 90 }}>
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
                      Cost range: {cheapestTower ? `${TOWER_DATA[cheapestTower.type].name} (${cheapestTower.cost} PP)` : "-"}{" "}
                      to {priciestTower ? `${TOWER_DATA[priciestTower.type].name} (${priciestTower.cost} PP)` : "-"}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Open with lane coverage first, then stack level 2-3 upgrades on towers that already have strong
                      uptime. Don&apos;t over-expand level 1 towers; concentrated upgrades beat thin spread damage.
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-800/35 bg-blue-950/20 p-4">
                    <div className="flex items-center gap-2 text-blue-300 mb-2">
                      <Flag size={14} />
                      <span className="text-sm font-semibold">3) Maps, Paths, and Lane Geometry</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                      {REGION_IMAGES.map((region) => (
                        <div key={region.label} className="relative rounded-md overflow-hidden border border-blue-700/25 aspect-[16/10]">
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
                        <FramedCodexSprite size={34} theme={getEnemySpriteFrameTheme(featuredEnemyTypes[0])}>
                          <EnemySprite type={featuredEnemyTypes[0]} size={26} animated />
                        </FramedCodexSprite>
                        <ChevronRight size={14} className="text-blue-300/80" />
                        <FramedCodexSprite size={34} theme={getEnemySpriteFrameTheme(featuredEnemyTypes[1] || featuredEnemyTypes[0])}>
                          <EnemySprite type={featuredEnemyTypes[1] || featuredEnemyTypes[0]} size={26} animated />
                        </FramedCodexSprite>
                        <ChevronRight size={14} className="text-blue-300/80" />
                        <FramedCodexSprite size={34} theme={TOWER_SPRITE_FRAME_THEME[featuredTowerTypes[0]]}>
                          <TowerSprite type={featuredTowerTypes[0]} size={26} level={2} />
                        </FramedCodexSprite>
                        <ChevronRight size={14} className="text-blue-300/80" />
                        <FramedCodexSprite size={34} theme={TOWER_SPRITE_FRAME_THEME[featuredTowerTypes[1] || featuredTowerTypes[0]]}>
                          <TowerSprite type={featuredTowerTypes[1] || featuredTowerTypes[0]} size={26} level={3} />
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
                      Long turns are best for DOT and slows; short straights favor burst. Dual-path maps require independent
                      leak control on each lane. Longest path is{" "}
                      <span className="text-blue-200 font-medium">
                        {longestPathEntry ? `${formatKeyLabel(longestPathEntry[0])} (${longestPathEntry[1].length} nodes)` : "N/A"}
                      </span>
                      , shortest is{" "}
                      <span className="text-blue-200 font-medium">
                        {shortestPathEntry ? `${formatKeyLabel(shortestPathEntry[0])} (${shortestPathEntry[1].length} nodes)` : "N/A"}
                      </span>.
                    </p>
                  </div>

                  <div className="rounded-xl border border-fuchsia-800/35 bg-fuchsia-950/20 p-4">
                    <div className="flex items-center gap-2 text-fuchsia-300 mb-2">
                      <Timer size={14} />
                      <span className="text-sm font-semibold">4) Wave Design and Spawn Rhythm</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredEnemyTypes.slice(0, 3).map((type) => (
                        <FramedCodexSprite key={`wave-enemy-${type}`} size={38} theme={getEnemySpriteFrameTheme(type)}>
                          <EnemySprite type={type} size={30} animated />
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
                      Waves are layered into staggered groups by delay + interval, so lane pressure can spike before
                      the timer ends. Peak grouped wave:{" "}
                      <span className="text-fuchsia-200 font-medium">
                        {peakGroupWave ? `${formatKeyLabel(peakGroupWave.mapKey)} W${peakGroupWave.waveNumber} (${peakGroupWave.groupCount} groups)` : "N/A"}
                      </span>
                      . Densest wave by raw bodies:{" "}
                      <span className="text-fuchsia-200 font-medium">
                        {densestWave ? `${formatKeyLabel(densestWave.mapKey)} W${densestWave.waveNumber} (${densestWave.enemyCount} enemies)` : "N/A"}
                      </span>.
                    </p>
                  </div>

                  <div className="rounded-xl border border-green-800/35 bg-green-950/20 p-4">
                    <div className="flex items-center gap-2 text-green-300 mb-2">
                      <Gauge size={14} />
                      <span className="text-sm font-semibold">5) Tempo Controls: Speed + Early Start</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      <span className="rounded border border-green-800/35 bg-green-950/30 px-2 py-1 text-green-200">Speed presets: 0.5x / 1x / 2x</span>
                      <span className="rounded border border-green-800/35 bg-green-950/30 px-2 py-1 text-green-200">Fine tuning: +/- 0.25x</span>
                      <span className="rounded border border-amber-800/35 bg-amber-950/30 px-2 py-1 text-amber-200">Pause: 0x</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      The top HUD lets you control simulation speed instantly. To launch early, click a lane&apos;s skull wave
                      bubble once to preview enemies, then click the same bubble again to confirm and start immediately.
                      Early starts are high-value when your cooldowns are up and build order is stable.
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-800/35 bg-purple-950/20 p-4">
                    <div className="flex items-center gap-2 text-purple-300 mb-2">
                      <Shield size={14} />
                      <span className="text-sm font-semibold">6) Heroes and Ability Windows</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredHeroTypes.map((type) => (
                        <FramedCodexSprite key={`hero-guide-${type}`} size={42} theme={getHeroSpriteFrameTheme(type)}>
                          <HeroSprite type={type} size={33} />
                        </FramedCodexSprite>
                      ))}
                      {featuredHeroTypes[0] && (
                        <div className="rounded-lg border border-purple-700/40 bg-purple-950/30 p-1.5 flex items-center justify-center">
                          <HeroAbilityIcon type={featuredHeroTypes[0]} size={26} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Pick one hero before deployment and reposition them to live lanes. Ability timing matters more than raw
                      cooldown uptime: hold abilities for stacked groups, boss entries, or leak-recovery moments where one cast
                      can preserve multiple lives.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-800/35 bg-cyan-950/20 p-4">
                    <div className="flex items-center gap-2 text-cyan-300 mb-2">
                      <Zap size={14} />
                      <span className="text-sm font-semibold">7) Spells, Cooldowns, and Economy</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {spellTypes.map((type) => (
                        <FramedCodexSprite key={`spell-guide-${type}`} size={40} theme={SPELL_SPRITE_FRAME_THEME[type]}>
                          <SpellSprite type={type} size={30} />
                        </FramedCodexSprite>
                      ))}
                    </div>
                    <div className="rounded border border-cyan-800/35 bg-cyan-950/25 px-2 py-1.5 text-xs text-cyan-200 mb-2">
                      Pre-match loadout requires 1 hero + 3 spells.
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Cast proactively to shape wave tempo, not only for panic cleanup. Fireball/Lightning delete clusters,
                      Freeze resets global pressure, Payday funds greed-to-power spikes, and Reinforcements create emergency
                      frontline anchors.
                    </p>
                  </div>

                  <div className="rounded-xl border border-sky-800/35 bg-sky-950/20 p-4">
                    <div className="flex items-center gap-2 text-sky-300 mb-2">
                      <Crosshair size={14} />
                      <span className="text-sm font-semibold">8) Ranged Combat and Target Priority</span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-sky-700/25 mb-3" style={{ height: 80 }}>
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
                      <FramedCodexSprite size={40} theme={TOWER_SPRITE_FRAME_THEME.arch}>
                        <TowerSprite type="arch" size={31} level={3} />
                      </FramedCodexSprite>
                      <FramedCodexSprite size={40} theme={TOWER_SPRITE_FRAME_THEME.lab}>
                        <TowerSprite type="lab" size={31} level={3} />
                      </FramedCodexSprite>
                      <FramedCodexSprite size={40} theme={getEnemySpriteFrameTheme("archer")}>
                        <EnemySprite type="archer" size={31} animated />
                      </FramedCodexSprite>
                      <FramedCodexSprite size={40} theme={getEnemySpriteFrameTheme("crossbowman")}>
                        <EnemySprite type="crossbowman" size={31} animated />
                      </FramedCodexSprite>
                      <FramedCodexSprite size={40} theme={getEnemySpriteFrameTheme("warlock")}>
                        <EnemySprite type="warlock" size={31} animated />
                      </FramedCodexSprite>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Ranged enemies and flying units demand earlier interception than melee packs. Keep at least one anti-air /
                      ranged-ready lane package, and remember that Reinforcement troops can gain ranged volleys at higher spell
                      levels (current preview: {reinforcementGuideStats.knightCount} units, {reinforcementGuideStats.knightDamage} DMG each).
                    </p>
                  </div>

                  <div className="rounded-xl border border-rose-800/35 bg-rose-950/20 p-4">
                    <div className="flex items-center gap-2 text-rose-300 mb-2">
                      <Sparkles size={14} />
                      <span className="text-sm font-semibold">9) Special Towers + Hazards as Multipliers</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {featuredSpecialTowers.slice(0, 3).map((type) => (
                        <SpecialTowerSprite key={`mix-special-${type}`} type={type} size={40} />
                      ))}
                      {featuredHazards.slice(0, 3).map((type) => (
                        <HazardSprite key={`mix-hazard-${type}`} type={type} size={40} />
                      ))}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Treat map mechanics as part of your build. Aura structures amplify nearby towers, objective structures
                      create forced-defense lanes, and hazards can either stall for free damage or accelerate enemy leaks.
                      Overlay these systems with hero and spell windows for high-efficiency clears.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-blue-800/35 bg-blue-950/20 p-4">
                  <div className="flex items-center gap-2 mb-2 text-blue-300">
                    <Info size={14} />
                    <span className="text-sm font-semibold">Match Checklist (Start to Finish)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-stone-300">
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">Lock 1 hero + 3 spells before launch</div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">Cover every active path before greed upgrades</div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">Use early-wave bubble starts when cooldowns are ready</div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">Reserve one recovery tool for unexpected leaks</div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">Protect objective lanes on vault/special maps</div>
                    <div className="rounded border border-blue-800/30 bg-blue-950/20 px-2 py-1.5">Exploit hazard zones with stuns, slows, and burst</div>
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
