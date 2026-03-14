import type { SpellData, SpellType, SpellUpgradeLevels } from "../types";

// Spell data
export const SPELL_DATA: Record<SpellType, SpellData> = {
  fireball: {
    name: "Fireball Strike",
    shortName: "Fireballs",
    cost: 50,
    cooldown: 15000,
    desc: "Rains 10 meteors dealing 80 AoE damage each, burning enemies for 4s",
  },
  lightning: {
    name: "Chain Lightning",
    shortName: "Lightning",
    cost: 40,
    cooldown: 12000,
    desc: "Chains to 8 enemies, 900 total damage with stun",
  },
  freeze: {
    name: "Arctic Freeze",
    shortName: "Freeze",
    cost: 60,
    cooldown: 20000,
    desc: "Freezes ALL enemies for 3 seconds",
  },
  payday: {
    name: "Paw Point Payday",
    shortName: "Payday",
    cost: 0,
    cooldown: 30000,
    desc: "Grants 80+ Paw Points (bonus per enemy)",
  },
  reinforcements: {
    name: "Reinforcements",
    shortName: "Reinforce",
    cost: 75,
    cooldown: 25000,
    desc: "Summons 3 armored reinforcements to the battlefield",
  },
};

// Spell options for selection
export const SPELL_OPTIONS: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "payday",
  "reinforcements",
];

export const SPELL_UPGRADE_COSTS = [2, 2, 3, 3, 3, 2] as const;
export const MAX_SPELL_UPGRADE_LEVEL = SPELL_UPGRADE_COSTS.length;
export const SPELL_MAX_UPGRADE_STARS_PER_SPELL = SPELL_UPGRADE_COSTS.reduce(
  (sum, cost) => sum + cost,
  0,
);
export const SPELL_TOTAL_MAX_UPGRADE_STARS =
  SPELL_MAX_UPGRADE_STARS_PER_SPELL * SPELL_OPTIONS.length;

export interface SpellUpgradeNode {
  level: number;
  title: string;
  description: string;
  cost: number;
}

export const SPELL_TECH_TREE: Record<SpellType, SpellUpgradeNode[]> = {
  fireball: [
    {
      level: 1,
      title: "Ignition Sigil",
      description: "+15 meteor damage and hotter impact core",
      cost: SPELL_UPGRADE_COSTS[0],
    },
    {
      level: 2,
      title: "Twinfall Pattern",
      description:
        "+2 meteors with wider strike lanes. Unlocks manual targeting.",
      cost: SPELL_UPGRADE_COSTS[1],
    },
    {
      level: 3,
      title: "Pyre Veil",
      description: "Burn lasts +1.0s with denser scorch trails",
      cost: SPELL_UPGRADE_COSTS[2],
    },
    {
      level: 4,
      title: "Core Compression",
      description: "+15 meteor impact damage through armor",
      cost: SPELL_UPGRADE_COSTS[3],
    },
    {
      level: 5,
      title: "Heavenfall Constellation",
      description: "+3 meteors and tighter terminal spread",
      cost: SPELL_UPGRADE_COSTS[4],
    },
    {
      level: 6,
      title: "Inferno Dominion",
      description: "Burn DPS doubled with searing ground trails",
      cost: SPELL_UPGRADE_COSTS[5],
    },
  ],
  lightning: [
    {
      level: 1,
      title: "Forking Capacitors",
      description: "+2 chain bolts per cast",
      cost: SPELL_UPGRADE_COSTS[0],
    },
    {
      level: 2,
      title: "Storm Battery",
      description: "+120 total split damage. Unlocks manual targeting.",
      cost: SPELL_UPGRADE_COSTS[1],
    },
    {
      level: 3,
      title: "Synapse Clamp",
      description: "Stun duration +0.25s per arc",
      cost: SPELL_UPGRADE_COSTS[2],
    },
    {
      level: 4,
      title: "Conductive Lattice",
      description: "+2 chain bolts with tighter jump cadence",
      cost: SPELL_UPGRADE_COSTS[3],
    },
    {
      level: 5,
      title: "Tempest Mandate",
      description: "+120 damage and +0.35s stun",
      cost: SPELL_UPGRADE_COSTS[4],
    },
    {
      level: 6,
      title: "Thunderlord's Decree",
      description: "+2 chain bolts and +100 total damage",
      cost: SPELL_UPGRADE_COSTS[5],
    },
  ],
  freeze: [
    {
      level: 1,
      title: "Rime Seal",
      description: "Freeze duration +0.6s",
      cost: SPELL_UPGRADE_COSTS[0],
    },
    {
      level: 2,
      title: "Permafrost Channel",
      description: "Freeze duration +0.6s and stronger chill lock",
      cost: SPELL_UPGRADE_COSTS[1],
    },
    {
      level: 3,
      title: "Glacial Vectors",
      description: "Freeze duration +0.6s, wave reaches sooner",
      cost: SPELL_UPGRADE_COSTS[2],
    },
    {
      level: 4,
      title: "Hail Bastion",
      description: "Freeze duration +0.6s with longer ice linger",
      cost: SPELL_UPGRADE_COSTS[3],
    },
    {
      level: 5,
      title: "Absolute Zero Covenant",
      description: "Freeze duration +0.6s and full map lockdown",
      cost: SPELL_UPGRADE_COSTS[4],
    },
    {
      level: 6,
      title: "Eternal Winter",
      description: "Freeze duration +0.6s with lingering slow aura",
      cost: SPELL_UPGRADE_COSTS[5],
    },
  ],
  payday: [
    {
      level: 1,
      title: "Minted Ledger",
      description: "+10 base payout each cast",
      cost: SPELL_UPGRADE_COSTS[0],
    },
    {
      level: 2,
      title: "Aggressive Yield",
      description: "+2 payout per enemy and higher cap",
      cost: SPELL_UPGRADE_COSTS[1],
    },
    {
      level: 3,
      title: "Bullish Aura",
      description: "Bounty aura lasts +2s",
      cost: SPELL_UPGRADE_COSTS[2],
    },
    {
      level: 4,
      title: "Royal Treasury",
      description: "+10 additional base payout",
      cost: SPELL_UPGRADE_COSTS[3],
    },
    {
      level: 5,
      title: "Golden Cascade",
      description: "+2 payout per enemy and +3s aura",
      cost: SPELL_UPGRADE_COSTS[4],
    },
    {
      level: 6,
      title: "Infinite Dividend",
      description: "+10 base payout and +20 max bonus",
      cost: SPELL_UPGRADE_COSTS[5],
    },
  ],
  reinforcements: [
    {
      level: 1,
      title: "Drillmaster Oath",
      description: "Knights gain +10 damage",
      cost: SPELL_UPGRADE_COSTS[0],
    },
    {
      level: 2,
      title: "Fortress Harness",
      description: "Knights gain +150 health",
      cost: SPELL_UPGRADE_COSTS[1],
    },
    {
      level: 3,
      title: "Banner of Valor",
      description: "Knights gain +10 damage",
      cost: SPELL_UPGRADE_COSTS[2],
    },
    {
      level: 4,
      title: "Bastion Plating",
      description: "Knights gain +150 health",
      cost: SPELL_UPGRADE_COSTS[3],
    },
    {
      level: 5,
      title: "Warhost Doctrine",
      description: "Unlocks mixed melee and ranged formation",
      cost: SPELL_UPGRADE_COSTS[4],
    },
    {
      level: 6,
      title: "Legion Commander",
      description: "Knights gain +150 health and +10 damage",
      cost: SPELL_UPGRADE_COSTS[5],
    },
  ],
};

export const SPELL_ACCENTS: Record<SpellType, string> = {
  fireball: "#ea580c",
  lightning: "#eab308",
  freeze: "#06b6d4",
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
    trait: "AoE Burn",
    color: "text-red-300/80",
    bg: "rgba(127,29,29,0.25)",
    border: "rgba(127,29,29,0.2)",
  },
  lightning: {
    trait: "Chain Stun",
    color: "text-cyan-300/80",
    bg: "rgba(22,78,99,0.25)",
    border: "rgba(22,78,99,0.2)",
  },
  freeze: {
    trait: "Global Freeze",
    color: "text-indigo-300/80",
    bg: "rgba(49,46,129,0.25)",
    border: "rgba(49,46,129,0.2)",
  },
  payday: {
    trait: "Gold Boost",
    color: "text-yellow-300/80",
    bg: "rgba(113,63,18,0.25)",
    border: "rgba(113,63,18,0.2)",
  },
  reinforcements: {
    trait: "Summon Units",
    color: "text-emerald-300/80",
    bg: "rgba(6,78,59,0.25)",
    border: "rgba(6,78,59,0.2)",
  },
};

export const DEFAULT_SPELL_UPGRADES: SpellUpgradeLevels = {
  fireball: 0,
  lightning: 0,
  freeze: 0,
  payday: 0,
  reinforcements: 0,
};

export const normalizeSpellUpgradeLevels = (
  raw?: Partial<SpellUpgradeLevels> | null,
): SpellUpgradeLevels =>
  SPELL_OPTIONS.reduce(
    (acc, spellType) => {
      const rawLevel = raw?.[spellType];
      const level = Number.isFinite(rawLevel)
        ? Math.max(
            0,
            Math.min(MAX_SPELL_UPGRADE_LEVEL, Math.floor(rawLevel as number)),
          )
        : 0;
      acc[spellType] = level;
      return acc;
    },
    { ...DEFAULT_SPELL_UPGRADES },
  );

export const getSpellUpgradeNodes = (
  spellType: SpellType,
): SpellUpgradeNode[] => SPELL_TECH_TREE[spellType];

export const getSpellUpgradeCost = (
  spellType: SpellType,
  targetLevel: number,
): number => {
  if (targetLevel <= 0) return 0;
  const node = SPELL_TECH_TREE[spellType][targetLevel - 1];
  return node?.cost ?? 0;
};

export const getNextSpellUpgradeCost = (
  spellType: SpellType,
  currentLevel: number,
): number => getSpellUpgradeCost(spellType, currentLevel + 1);

export const getSpentSpellUpgradeStars = (
  upgrades?: Partial<SpellUpgradeLevels> | null,
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
    meteorCount,
    damagePerMeteor,
    impactRadius: 100,
    burnDurationMs,
    burnDamagePerSecond,
    fallDurationMs: 1200,
  };
};

export const getLightningSpellStats = (level: number): LightningSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    chainCount:
      8 + (normalizedLevel >= 1 ? 2 : 0) + (normalizedLevel >= 4 ? 2 : 0) + (normalizedLevel >= 6 ? 2 : 0),
    totalDamage:
      900 + (normalizedLevel >= 2 ? 120 : 0) + (normalizedLevel >= 5 ? 120 : 0) + (normalizedLevel >= 6 ? 100 : 0),
    stunDurationMs:
      500 + (normalizedLevel >= 3 ? 250 : 0) + (normalizedLevel >= 5 ? 350 : 0),
  };
};

export const getFreezeSpellStats = (level: number): FreezeSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    freezeDurationMs: 3000 + normalizedLevel * 600,
  };
};

export const getPaydaySpellStats = (level: number): PaydaySpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    basePayout:
      80 + (normalizedLevel >= 1 ? 10 : 0) + (normalizedLevel >= 4 ? 10 : 0) + (normalizedLevel >= 6 ? 10 : 0),
    bonusPerEnemy:
      5 + (normalizedLevel >= 2 ? 2 : 0) + (normalizedLevel >= 5 ? 2 : 0),
    maxBonus:
      50 + (normalizedLevel >= 2 ? 15 : 0) + (normalizedLevel >= 5 ? 15 : 0) + (normalizedLevel >= 6 ? 20 : 0),
    auraDurationMs:
      10000 +
      (normalizedLevel >= 3 ? 2000 : 0) +
      (normalizedLevel >= 5 ? 3000 : 0),
  };
};

export const getReinforcementSpellStats = (
  level: number,
): ReinforcementSpellStats => {
  const normalizedLevel = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, level));
  return {
    knightCount: 3,
    knightHp:
      500 + (normalizedLevel >= 2 ? 150 : 0) + (normalizedLevel >= 4 ? 150 : 0) + (normalizedLevel >= 6 ? 150 : 0),
    knightDamage:
      30 + (normalizedLevel >= 1 ? 10 : 0) + (normalizedLevel >= 3 ? 10 : 0) + (normalizedLevel >= 6 ? 10 : 0),
    knightAttackSpeedMs: 1000,
    moveRadius: 200,
    rangedUnlocked: normalizedLevel >= 5,
    rangedRange: 220,
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

function hexToRgba(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const p = Number.parseInt(n, 16);
  return `rgba(${(p >> 16) & 255}, ${(p >> 8) & 255}, ${p & 255}, ${alpha})`;
}

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
    }),
  ) as Record<SpellType, SpellFullTheme>;
