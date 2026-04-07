import type { SpellData, SpellType, SpellUpgradeLevels } from "../types";

// Spell data
export const SPELL_DATA: Record<SpellType, SpellData> = {
  fireball: {
    cooldown: 15_000,
    cost: 50,
    desc: "Rains 10 meteors dealing 80 AoE damage each, burning enemies for 4s",
    name: "Fireball Strike",
    shortName: "Fireballs",
  },
  freeze: {
    cooldown: 20_000,
    cost: 60,
    desc: "Freezes up to 5 enemies for 3 seconds",
    name: "Arctic Freeze",
    shortName: "Freeze",
  },
  hex_ward: {
    cooldown: 18_000,
    cost: 55,
    desc: "Marks dangerous enemies for 8s and reanimates fallen units as ghost allies during the ward",
    name: "Hex Ward",
    shortName: "Hex Ward",
  },
  lightning: {
    cooldown: 12_000,
    cost: 40,
    desc: "Chains to 8 enemies, 900 total damage with stun",
    name: "Chain Lightning",
    shortName: "Lightning",
  },
  payday: {
    cooldown: 30_000,
    cost: 0,
    desc: "Grants 80+ Paw Points (bonus per enemy)",
    name: "Paw Point Payday",
    shortName: "Payday",
  },
  reinforcements: {
    cooldown: 25_000,
    cost: 75,
    desc: "Summons 3 armored reinforcements to the battlefield",
    name: "Reinforcements",
    shortName: "Reinforce",
  },
};

// Spell options for selection
export const SPELL_OPTIONS: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "hex_ward",
  "payday",
  "reinforcements",
];

const SPELL_ACTION_IMAGE_NAMES: Record<SpellType, string> = {
  fireball: "fireball",
  freeze: "freeze",
  hex_ward: "hex-ward",
  lightning: "lightning",
  payday: "payday",
  reinforcements: "reinforcements",
};

export function getSpellActionImagePath(spellType: SpellType): string {
  return `/images/spells/${SPELL_ACTION_IMAGE_NAMES[spellType]}-action.png`;
}

export const SPELL_UPGRADE_COSTS = [2, 2, 2, 2, 2, 2] as const;
export const MAX_SPELL_UPGRADE_LEVEL = SPELL_UPGRADE_COSTS.length;
const SPELL_MAJOR_UPGRADE_COST = 3;

export interface SpellUpgradeNode {
  level: number;
  title: string;
  description: string;
  cost: number;
}

export const SPELL_TECH_TREE: Record<SpellType, SpellUpgradeNode[]> = {
  fireball: [
    {
      cost: SPELL_UPGRADE_COSTS[0],
      description: "+15 meteor damage and hotter impact core",
      level: 1,
      title: "Ignition Sigil",
    },
    {
      cost: SPELL_UPGRADE_COSTS[1],
      description:
        "+2 meteors with wider strike lanes. Unlocks manual targeting.",
      level: 2,
      title: "Twinfall Pattern",
    },
    {
      cost: SPELL_UPGRADE_COSTS[2],
      description: "Burn lasts +1.0s with denser scorch trails",
      level: 3,
      title: "Pyre Veil",
    },
    {
      cost: SPELL_UPGRADE_COSTS[3],
      description: "+15 meteor impact damage through armor",
      level: 4,
      title: "Core Compression",
    },
    {
      cost: SPELL_UPGRADE_COSTS[4],
      description: "+3 meteors and tighter terminal spread",
      level: 5,
      title: "Heavenfall Constellation",
    },
    {
      cost: SPELL_UPGRADE_COSTS[5],
      description: "Burn DPS doubled with searing ground trails",
      level: 6,
      title: "Inferno Dominion",
    },
  ],
  freeze: [
    {
      cost: SPELL_UPGRADE_COSTS[0],
      description: "Freeze duration +0.6s, max targets 5→8",
      level: 1,
      title: "Rime Seal",
    },
    {
      cost: SPELL_UPGRADE_COSTS[1],
      description: "Freeze duration +0.6s, max targets 8→12",
      level: 2,
      title: "Permafrost Channel",
    },
    {
      cost: SPELL_UPGRADE_COSTS[2],
      description: "Freeze duration +0.6s, max targets 12→16",
      level: 3,
      title: "Glacial Vectors",
    },
    {
      cost: SPELL_UPGRADE_COSTS[3],
      description: "Freeze duration +0.6s, max targets 16→22",
      level: 4,
      title: "Hail Bastion",
    },
    {
      cost: SPELL_MAJOR_UPGRADE_COST,
      description:
        "Freeze duration +0.6s and full map lockdown — freezes ALL enemies",
      level: 5,
      title: "Absolute Zero Covenant",
    },
    {
      cost: SPELL_UPGRADE_COSTS[5],
      description: "Freeze duration +0.6s with lingering slow aura",
      level: 6,
      title: "Eternal Winter",
    },
  ],
  hex_ward: [
    {
      cost: SPELL_UPGRADE_COSTS[0],
      description: "Hex Ward can reanimate +1 additional ghost",
      level: 1,
      title: "Grave Tithe",
    },
    {
      cost: SPELL_UPGRADE_COSTS[1],
      description: "Hex Ward can reanimate +1 additional ghost",
      level: 2,
      title: "Mass Recall",
    },
    {
      cost: SPELL_UPGRADE_COSTS[2],
      description: "Hexed enemies take +15% more damage",
      level: 3,
      title: "Ruin Brand",
    },
    {
      cost: SPELL_UPGRADE_COSTS[3],
      description: "Hex Ward can reanimate +2 additional ghosts",
      level: 4,
      title: "Open Sepulcher",
    },
    {
      cost: SPELL_MAJOR_UPGRADE_COST,
      description: "Hexed enemies cannot heal or regenerate",
      level: 5,
      title: "Mortality Seal",
    },
    {
      cost: SPELL_UPGRADE_COSTS[5],
      description: "+2 reanimations and +2s ward duration",
      level: 6,
      title: "Black Procession",
    },
  ],
  lightning: [
    {
      cost: SPELL_UPGRADE_COSTS[0],
      description: "+2 chain bolts per cast",
      level: 1,
      title: "Forking Capacitors",
    },
    {
      cost: SPELL_UPGRADE_COSTS[1],
      description: "+120 total split damage. Unlocks manual targeting.",
      level: 2,
      title: "Storm Battery",
    },
    {
      cost: SPELL_UPGRADE_COSTS[2],
      description: "Stun duration +0.25s per arc",
      level: 3,
      title: "Synapse Clamp",
    },
    {
      cost: SPELL_UPGRADE_COSTS[3],
      description: "+2 chain bolts with tighter jump cadence",
      level: 4,
      title: "Conductive Lattice",
    },
    {
      cost: SPELL_UPGRADE_COSTS[4],
      description: "+120 damage and +0.35s stun",
      level: 5,
      title: "Tempest Mandate",
    },
    {
      cost: SPELL_UPGRADE_COSTS[5],
      description: "+2 chain bolts and +100 total damage",
      level: 6,
      title: "Thunderlord's Decree",
    },
  ],
  payday: [
    {
      cost: SPELL_UPGRADE_COSTS[0],
      description: "+10 base payout each cast",
      level: 1,
      title: "Minted Ledger",
    },
    {
      cost: SPELL_UPGRADE_COSTS[1],
      description: "+2 payout per enemy and higher cap",
      level: 2,
      title: "Aggressive Yield",
    },
    {
      cost: SPELL_UPGRADE_COSTS[2],
      description: "Bounty aura lasts +2s",
      level: 3,
      title: "Bullish Aura",
    },
    {
      cost: SPELL_UPGRADE_COSTS[3],
      description: "+10 additional base payout",
      level: 4,
      title: "Royal Treasury",
    },
    {
      cost: SPELL_UPGRADE_COSTS[4],
      description: "+2 payout per enemy and +3s aura",
      level: 5,
      title: "Golden Cascade",
    },
    {
      cost: SPELL_UPGRADE_COSTS[5],
      description: "+10 base payout and +20 max bonus",
      level: 6,
      title: "Infinite Dividend",
    },
  ],
  reinforcements: [
    {
      cost: SPELL_UPGRADE_COSTS[0],
      description: "Knights gain +10 damage",
      level: 1,
      title: "Drillmaster Oath",
    },
    {
      cost: SPELL_UPGRADE_COSTS[1],
      description: "Knights gain +150 health",
      level: 2,
      title: "Fortress Harness",
    },
    {
      cost: SPELL_UPGRADE_COSTS[2],
      description: "Knights gain +10 damage",
      level: 3,
      title: "Banner of Valor",
    },
    {
      cost: SPELL_UPGRADE_COSTS[3],
      description: "Knights gain +150 health",
      level: 4,
      title: "Bastion Plating",
    },
    {
      cost: SPELL_MAJOR_UPGRADE_COST,
      description: "Unlocks mixed melee and ranged formation",
      level: 5,
      title: "Warhost Doctrine",
    },
    {
      cost: SPELL_UPGRADE_COSTS[5],
      description: "Knights gain +150 health and +10 damage",
      level: 6,
      title: "Legion Commander",
    },
  ],
};

const getSpellTreeCostTotal = (spellType: SpellType): number =>
  SPELL_TECH_TREE[spellType].reduce((sum, node) => sum + node.cost, 0);

export const SPELL_MAX_UPGRADE_STARS_PER_SPELL = Math.max(
  ...SPELL_OPTIONS.map(getSpellTreeCostTotal)
);

export const SPELL_TOTAL_MAX_UPGRADE_STARS = SPELL_OPTIONS.reduce(
  (sum, spellType) => sum + getSpellTreeCostTotal(spellType),
  0
);

export const SPELL_ACCENTS: Record<SpellType, string> = {
  fireball: "#ea580c",
  freeze: "#06b6d4",
  hex_ward: "#a855f7",
  lightning: "#eab308",
  payday: "#f59e0b",
  reinforcements: "#10b981",
};

export interface SpellTrait {
  trait: string;
  color: string;
  bg: string;
  border: string;
}

export const SPELL_TRAITS: Record<SpellType, SpellTrait> = {
  fireball: {
    bg: "rgba(127,29,29,0.25)",
    border: "rgba(127,29,29,0.2)",
    color: "text-red-300/80",
    trait: "AoE Burn",
  },
  freeze: {
    bg: "rgba(49,46,129,0.25)",
    border: "rgba(49,46,129,0.2)",
    color: "text-indigo-300/80",
    trait: "Area Freeze",
  },
  hex_ward: {
    bg: "rgba(88,28,135,0.25)",
    border: "rgba(88,28,135,0.2)",
    color: "text-fuchsia-300/80",
    trait: "Hex Necromancy",
  },
  lightning: {
    bg: "rgba(22,78,99,0.25)",
    border: "rgba(22,78,99,0.2)",
    color: "text-cyan-300/80",
    trait: "Chain Stun",
  },
  payday: {
    bg: "rgba(113,63,18,0.25)",
    border: "rgba(113,63,18,0.2)",
    color: "text-yellow-300/80",
    trait: "Gold Boost",
  },
  reinforcements: {
    bg: "rgba(6,78,59,0.25)",
    border: "rgba(6,78,59,0.2)",
    color: "text-emerald-300/80",
    trait: "Summon Units",
  },
};

export const DEFAULT_SPELL_UPGRADES: SpellUpgradeLevels = {
  fireball: 0,
  freeze: 0,
  hex_ward: 0,
  lightning: 0,
  payday: 0,
  reinforcements: 0,
};

export const normalizeSpellUpgradeLevels = (
  raw?: Partial<SpellUpgradeLevels> | null
): SpellUpgradeLevels =>
  SPELL_OPTIONS.reduce(
    (acc, spellType) => {
      const rawLevel = raw?.[spellType];
      const level = Number.isFinite(rawLevel)
        ? Math.max(
            0,
            Math.min(MAX_SPELL_UPGRADE_LEVEL, Math.floor(rawLevel as number))
          )
        : 0;
      acc[spellType] = level;
      return acc;
    },
    { ...DEFAULT_SPELL_UPGRADES }
  );

export const getSpellUpgradeNodes = (
  spellType: SpellType
): SpellUpgradeNode[] => SPELL_TECH_TREE[spellType];

export const getSpellUpgradeCost = (
  spellType: SpellType,
  targetLevel: number
): number => {
  if (targetLevel <= 0) {
    return 0;
  }
  const node = SPELL_TECH_TREE[spellType][targetLevel - 1];
  return node?.cost ?? 0;
};

export const getNextSpellUpgradeCost = (
  spellType: SpellType,
  currentLevel: number
): number => getSpellUpgradeCost(spellType, currentLevel + 1);

export const getSpellDowngradeRefund = (
  spellType: SpellType,
  currentLevel: number
): number => getSpellUpgradeCost(spellType, currentLevel);

export const getSpentSpellUpgradeStars = (
  upgrades?: Partial<SpellUpgradeLevels> | null
): number => {
  const normalized = normalizeSpellUpgradeLevels(upgrades);
  return SPELL_OPTIONS.reduce((totalSpent, spellType) => {
    const level = normalized[spellType];
    const spentForSpell = SPELL_TECH_TREE[spellType]
      .slice(0, level)
      .reduce((sum, node) => sum + node.cost, 0);
    return totalSpent + spentForSpell;
  }, 0);
};

export interface FireballSpellStats {
  meteorCount: number;
  damagePerMeteor: number;
  impactRadius: number;
  burnDurationMs: number;
  burnDamagePerSecond: number;
  fallDurationMs: number;
}

export interface LightningSpellStats {
  chainCount: number;
  totalDamage: number;
  stunDurationMs: number;
}

export interface FreezeSpellStats {
  freezeDurationMs: number;
  maxTargets: number;
  isGlobal: boolean;
}

export interface HexWardSpellStats {
  maxTargets: number;
  maxReanimations: number;
  damageAmp: number;
  durationMs: number;
  blocksHealing: boolean;
}

export interface PaydaySpellStats {
  basePayout: number;
  bonusPerEnemy: number;
  maxBonus: number;
  auraDurationMs: number;
}

export interface ReinforcementSpellStats {
  knightCount: number;
  knightHp: number;
  knightDamage: number;
  knightAttackSpeedMs: number;
  moveRadius: number;
  rangedUnlocked: boolean;
  rangedRange: number;
  visualTier: number;
}

export const getFireballSpellStats = (level: number): FireballSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  const damagePerMeteor =
    80 + (normalizedLevel >= 1 ? 15 : 0) + (normalizedLevel >= 4 ? 15 : 0);
  const meteorCount =
    10 + (normalizedLevel >= 2 ? 2 : 0) + (normalizedLevel >= 5 ? 3 : 0);
  const burnDurationMs = 4000 + (normalizedLevel >= 3 ? 1000 : 0);
  const burnDamagePerSecond = 30 + (normalizedLevel >= 6 ? 30 : 0);

  return {
    burnDamagePerSecond,
    burnDurationMs,
    damagePerMeteor,
    fallDurationMs: 1200,
    impactRadius: 100,
    meteorCount,
  };
};

export const getLightningSpellStats = (level: number): LightningSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    chainCount:
      8 +
      (normalizedLevel >= 1 ? 2 : 0) +
      (normalizedLevel >= 4 ? 2 : 0) +
      (normalizedLevel >= 6 ? 2 : 0),
    stunDurationMs:
      500 + (normalizedLevel >= 3 ? 250 : 0) + (normalizedLevel >= 5 ? 350 : 0),
    totalDamage:
      900 +
      (normalizedLevel >= 2 ? 120 : 0) +
      (normalizedLevel >= 5 ? 120 : 0) +
      (normalizedLevel >= 6 ? 100 : 0),
  };
};

const FREEZE_MAX_TARGETS_BY_LEVEL = [
  5,
  8,
  12,
  16,
  22,
  Infinity,
  Infinity,
] as const;

export const getFreezeSpellStats = (level: number): FreezeSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  const maxTargets = FREEZE_MAX_TARGETS_BY_LEVEL[normalizedLevel];
  return {
    freezeDurationMs: 3000 + normalizedLevel * 600,
    isGlobal: !Number.isFinite(maxTargets),
    maxTargets,
  };
};

export const getHexWardSpellStats = (level: number): HexWardSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    blocksHealing: normalizedLevel >= 5,
    damageAmp: normalizedLevel >= 3 ? 0.15 : 0,
    durationMs: 8000 + (normalizedLevel >= 6 ? 2000 : 0),
    maxReanimations:
      3 +
      (normalizedLevel >= 1 ? 1 : 0) +
      (normalizedLevel >= 2 ? 1 : 0) +
      (normalizedLevel >= 4 ? 2 : 0) +
      (normalizedLevel >= 6 ? 2 : 0),
    maxTargets: 5,
  };
};

export const getPaydaySpellStats = (level: number): PaydaySpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    auraDurationMs:
      10_000 +
      (normalizedLevel >= 3 ? 2000 : 0) +
      (normalizedLevel >= 5 ? 3000 : 0),
    basePayout:
      80 +
      (normalizedLevel >= 1 ? 10 : 0) +
      (normalizedLevel >= 4 ? 10 : 0) +
      (normalizedLevel >= 6 ? 10 : 0),
    bonusPerEnemy:
      5 + (normalizedLevel >= 2 ? 2 : 0) + (normalizedLevel >= 5 ? 2 : 0),
    maxBonus:
      50 +
      (normalizedLevel >= 2 ? 15 : 0) +
      (normalizedLevel >= 5 ? 15 : 0) +
      (normalizedLevel >= 6 ? 20 : 0),
  };
};

export const getReinforcementSpellStats = (
  level: number
): ReinforcementSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    knightAttackSpeedMs: 1000,
    knightCount: 3,
    knightDamage:
      20 +
      (normalizedLevel >= 1 ? 10 : 0) +
      (normalizedLevel >= 3 ? 10 : 0) +
      (normalizedLevel >= 6 ? 10 : 0),
    knightHp:
      500 +
      (normalizedLevel >= 2 ? 150 : 0) +
      (normalizedLevel >= 4 ? 150 : 0) +
      (normalizedLevel >= 6 ? 150 : 0),
    moveRadius: 200,
    rangedRange: 220,
    rangedUnlocked: normalizedLevel >= 5,
    visualTier: normalizedLevel,
  };
};

// =============================================================================
// SPELL FULL THEMES (derived from accent hex for UI theming)
// =============================================================================

export interface SpellFullTheme {
  accent: string;
  bg: string;
  border: string;
  glow: string;
}

import { hexToRgba } from "../utils/colorUtils";

function darkenHex(hex: string): string {
  const n = hex.replace("#", "");
  const p = Number.parseInt(n, 16);
  const r = Math.floor(((p >> 16) & 255) * 0.35);
  const g = Math.floor(((p >> 8) & 255) * 0.35);
  const b = Math.floor((p & 255) * 0.35);
  return `rgba(${r}, ${g}, ${b}, 0.3)`;
}

export const SPELL_FULL_THEMES: Record<SpellType, SpellFullTheme> =
  Object.fromEntries(
    SPELL_OPTIONS.map((type) => {
      const accent = SPELL_ACCENTS[type];
      return [
        type,
        {
          accent,
          bg: darkenHex(accent),
          border: hexToRgba(accent, 0.3),
          glow: hexToRgba(accent, 0.3),
        },
      ];
    })
  ) as Record<SpellType, SpellFullTheme>;
