"use client";

import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Check,
  CircleDot,
  Clock,
  Coins,
  Crosshair,
  Crown,
  Eye,
  Flag,
  Flame,
  Gem,
  GitBranch,
  Globe,
  Heart,
  Link2,
  Lock,
  Shield,
  Snowflake,
  Sparkles,
  Star,
  Swords,
  Target,
  Timer,
  TrendingUp,
  Undo2,
  Users,
  X,
  Zap,
} from "lucide-react";
import React from "react";

import {
  SPELL_DATA,
  SPELL_OPTIONS,
  SPELL_TOTAL_MAX_UPGRADE_STARS,
  MAX_SPELL_UPGRADE_LEVEL,
  TILE_SIZE,
  getSpellUpgradeNodes,
  getSpellDowngradeRefund,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getHexWardSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
} from "../../constants";
import { SpellSprite } from "../../sprites";
import { SpellOrbIcon, EnchantedAnvilIcon } from "../../sprites/custom-icons";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import { BaseModal } from "./primitives/BaseModal";
import { OrnateFrame } from "./primitives/OrnateFrame";
import { panelGradient, GOLD, ORNAMENT } from "./system/theme";

// ── Types ──────────────────────────────────────────────────────────────────

interface SpellUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStars: number;
  totalStarsEarned: number;
  spentStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  onUpgradeSpell: (spellType: SpellType) => void;
  onDowngradeSpell: (spellType: SpellType) => void;
}

interface SelectedNode {
  spellType: SpellType;
  tier: number;
}

interface SpellTheme {
  accent: string;
  glow: string;
  boardBg: string;
  connector: string;
}

type NodeState = "unlocked" | "next" | "locked";

interface UpgradeTag {
  label: string;
  icon: LucideIcon;
  accent: string;
  special?: boolean;
}

// ── Theme & Icon Constants ─────────────────────────────────────────────────

const SPELL_THEMES: Record<SpellType, SpellTheme> = {
  fireball: {
    accent: "#f97316",
    boardBg:
      "linear-gradient(180deg, rgba(78,36,18,0.55), rgba(28,14,10,0.72))",
    connector: "#f97316",
    glow: "#fb923c",
  },
  freeze: {
    accent: "#22d3ee",
    boardBg:
      "linear-gradient(180deg, rgba(24,62,80,0.56), rgba(12,22,44,0.74))",
    connector: "#22d3ee",
    glow: "#67e8f9",
  },
  hex_ward: {
    accent: "#a855f7",
    boardBg:
      "linear-gradient(180deg, rgba(64,28,92,0.56), rgba(24,10,44,0.74))",
    connector: "#c084fc",
    glow: "#d8b4fe",
  },
  lightning: {
    accent: "#facc15",
    boardBg:
      "linear-gradient(180deg, rgba(80,60,20,0.54), rgba(20,16,22,0.72))",
    connector: "#facc15",
    glow: "#fde047",
  },
  payday: {
    accent: "#f59e0b",
    boardBg:
      "linear-gradient(180deg, rgba(76,56,18,0.55), rgba(26,20,10,0.72))",
    connector: "#f59e0b",
    glow: "#fcd34d",
  },
  reinforcements: {
    accent: "#34d399",
    boardBg:
      "linear-gradient(180deg, rgba(16,70,50,0.56), rgba(10,24,16,0.74))",
    connector: "#34d399",
    glow: "#6ee7b7",
  },
};

const LEVEL_ICON_MAP: Record<number, { Icon: LucideIcon; label: string }> = {
  1: { Icon: CircleDot, label: "Initiate" },
  2: { Icon: Shield, label: "Bulwark" },
  3: { Icon: Swords, label: "Surge" },
  4: { Icon: Sparkles, label: "Apex" },
  5: { Icon: Crown, label: "Mastery" },
  6: { Icon: Star, label: "Supremacy" },
};

const UPGRADE_ICON_MAP: Record<string, LucideIcon> = {
  "fireball-1": Flame,
  "fireball-2": Crosshair,
  "fireball-3": Clock,
  "fireball-4": Zap,
  "fireball-5": Crown,
  "fireball-6": Flame,

  "freeze-1": Clock,
  "freeze-2": Snowflake,
  "freeze-3": Zap,
  "freeze-4": Shield,
  "freeze-5": Globe,
  "freeze-6": Snowflake,

  "hex_ward-1": Users,
  "hex_ward-2": Users,
  "hex_ward-3": Sparkles,
  "hex_ward-4": Users,
  "hex_ward-5": Shield,
  "hex_ward-6": Crown,

  "lightning-1": GitBranch,
  "lightning-2": Crosshair,
  "lightning-3": Clock,
  "lightning-4": Link2,
  "lightning-5": Zap,
  "lightning-6": GitBranch,

  "payday-1": Banknote,
  "payday-2": TrendingUp,
  "payday-3": Clock,
  "payday-4": Gem,
  "payday-5": Crown,
  "payday-6": Gem,

  "reinforcements-1": Swords,
  "reinforcements-2": Heart,
  "reinforcements-3": Flag,
  "reinforcements-4": Shield,
  "reinforcements-5": Target,
  "reinforcements-6": Crown,
};

const UPGRADE_TAGS: Record<string, UpgradeTag[]> = {
  "fireball-1": [
    { accent: "#fb923c", icon: Flame, label: "+15 Meteor Damage" },
  ],
  "fireball-2": [
    { accent: "#fb923c", icon: Flame, label: "+2 Meteors" },
    {
      accent: "#fbbf24",
      icon: Crosshair,
      label: "Manual Targeting",
      special: true,
    },
  ],
  "fireball-3": [
    { accent: "#fb923c", icon: Clock, label: "+1s Burn Duration" },
  ],
  "fireball-4": [
    { accent: "#fb923c", icon: Zap, label: "+15 Meteor Damage" },
    { accent: "#f87171", icon: Shield, label: "Armor Piercing", special: true },
  ],
  "fireball-5": [{ accent: "#fb923c", icon: Crown, label: "+3 Meteors" }],
  "fireball-6": [
    { accent: "#f87171", icon: Flame, label: "2× Burn DPS" },
    { accent: "#fb923c", icon: Flame, label: "Searing Trails", special: true },
  ],

  "freeze-1": [
    { accent: "#67e8f9", icon: Clock, label: "+0.6s Freeze" },
    { accent: "#67e8f9", icon: Users, label: "+3 Max Targets" },
  ],
  "freeze-2": [
    { accent: "#67e8f9", icon: Snowflake, label: "+0.6s Freeze" },
    { accent: "#67e8f9", icon: Users, label: "+4 Max Targets" },
  ],
  "freeze-3": [
    { accent: "#67e8f9", icon: Zap, label: "+0.6s Freeze" },
    { accent: "#67e8f9", icon: Users, label: "+4 Max Targets" },
  ],
  "freeze-4": [
    { accent: "#67e8f9", icon: Shield, label: "+0.6s Freeze" },
    { accent: "#67e8f9", icon: Users, label: "+6 Max Targets" },
  ],
  "freeze-5": [
    { accent: "#67e8f9", icon: Snowflake, label: "+0.6s Freeze" },
    {
      accent: "#06b6d4",
      icon: Globe,
      label: "Full Map Lockdown",
      special: true,
    },
  ],
  "freeze-6": [
    { accent: "#67e8f9", icon: Snowflake, label: "+0.6s Freeze" },
    { accent: "#06b6d4", icon: Clock, label: "Lingering Slow", special: true },
  ],

  "hex_ward-1": [{ accent: "#d8b4fe", icon: Users, label: "+1 Reanimation" }],
  "hex_ward-2": [{ accent: "#d8b4fe", icon: Users, label: "+1 Reanimation" }],
  "hex_ward-3": [
    { accent: "#f0abfc", icon: Sparkles, label: "+15% Damage Amp" },
  ],
  "hex_ward-4": [{ accent: "#d8b4fe", icon: Users, label: "+2 Reanimations" }],
  "hex_ward-5": [
    { accent: "#f0abfc", icon: Shield, label: "No Healing" },
    { accent: "#a855f7", icon: Eye, label: "Mortality Seal", special: true },
  ],
  "hex_ward-6": [
    { accent: "#d8b4fe", icon: Users, label: "+2 Reanimations" },
    { accent: "#c084fc", icon: Clock, label: "+2s Duration", special: true },
  ],

  "lightning-1": [
    { accent: "#fde047", icon: GitBranch, label: "+2 Chain Bolts" },
  ],
  "lightning-2": [
    { accent: "#fde047", icon: Zap, label: "+120 Total Damage" },
    {
      accent: "#fbbf24",
      icon: Crosshair,
      label: "Manual Targeting",
      special: true,
    },
  ],
  "lightning-3": [
    { accent: "#fde047", icon: Clock, label: "+0.25s Stun per Arc" },
  ],
  "lightning-4": [{ accent: "#fde047", icon: Link2, label: "+2 Chain Bolts" }],
  "lightning-5": [
    { accent: "#fde047", icon: Zap, label: "+120 Damage" },
    { accent: "#fde047", icon: Clock, label: "+0.35s Stun" },
  ],
  "lightning-6": [
    { accent: "#fde047", icon: GitBranch, label: "+2 Chain Bolts" },
    { accent: "#fde047", icon: Zap, label: "+100 Damage" },
  ],

  "payday-1": [{ accent: "#fcd34d", icon: Banknote, label: "+10 Base Payout" }],
  "payday-2": [
    { accent: "#fcd34d", icon: TrendingUp, label: "+2 per Enemy" },
    { accent: "#fcd34d", icon: Gem, label: "+15 Max Bonus" },
  ],
  "payday-3": [{ accent: "#fcd34d", icon: Clock, label: "+2s Aura Duration" }],
  "payday-4": [{ accent: "#fcd34d", icon: Gem, label: "+10 Base Payout" }],
  "payday-5": [
    { accent: "#fcd34d", icon: TrendingUp, label: "+2 per Enemy" },
    { accent: "#fcd34d", icon: Clock, label: "+3s Aura Duration" },
  ],
  "payday-6": [
    { accent: "#fcd34d", icon: Gem, label: "+10 Base Payout" },
    { accent: "#fcd34d", icon: TrendingUp, label: "+20 Max Bonus" },
  ],

  "reinforcements-1": [
    { accent: "#6ee7b7", icon: Swords, label: "+10 Knight Damage" },
  ],
  "reinforcements-2": [
    { accent: "#6ee7b7", icon: Heart, label: "+150 Knight Health" },
  ],
  "reinforcements-3": [
    { accent: "#6ee7b7", icon: Flag, label: "+10 Knight Damage" },
  ],
  "reinforcements-4": [
    { accent: "#6ee7b7", icon: Shield, label: "+150 Knight Health" },
  ],
  "reinforcements-5": [
    {
      accent: "#a78bfa",
      icon: Target,
      label: "Ranged Formation",
      special: true,
    },
  ],
  "reinforcements-6": [
    { accent: "#6ee7b7", icon: Heart, label: "+150 Knight Health" },
    { accent: "#6ee7b7", icon: Swords, label: "+10 Knight Damage" },
  ],
};

// ── Layout Constants ───────────────────────────────────────────────────────

const NODE_SIZE = 100;
const TILE_GAP = 12;
const CORE_GAP = 22;
const LABEL_WIDTH = 64;

// ── Node Visual Constants ──────────────────────────────────────────────────

interface NodeVisuals {
  background: string;
  borderColor: string;
  textColor: string;
}

const NODE_VISUALS: Record<NodeState, NodeVisuals> = {
  locked: {
    background: "rgba(38, 34, 30, 0.78)",
    borderColor: "rgba(100, 93, 88, 0.35)",
    textColor: "#a8a29e",
  },
  next: {
    background: "rgba(90, 68, 20, 0.85)",
    borderColor: "rgba(250, 204, 21, 0.6)",
    textColor: "#fde68a",
  },
  unlocked: {
    background: "rgba(16, 56, 36, 0.85)",
    borderColor: "rgba(74, 222, 128, 0.55)",
    textColor: "#bbf7d0",
  },
};

// ── CSS Animations ─────────────────────────────────────────────────────────

const ANIMATIONS_CSS = `
@keyframes spellNodePulse {
  0%, 100% {
    box-shadow: inset 0 0 12px rgba(0,0,0,0.35), 0 0 0 2px rgba(250, 204, 21, 0.3), 0 0 8px rgba(250, 204, 21, 0.12);
  }
  50% {
    box-shadow: inset 0 0 10px rgba(0,0,0,0.25), 0 0 0 2px rgba(250, 204, 21, 0.65), 0 0 18px rgba(250, 204, 21, 0.28);
  }
}
@keyframes connectorFlow {
  0% { stroke-dashoffset: 8; }
  100% { stroke-dashoffset: 0; }
}
@keyframes upgradeFlash {
  0% { box-shadow: 0 0 0 0 rgba(74,222,128,0.9), inset 0 0 30px rgba(74,222,128,0.4); }
  25% { box-shadow: 0 0 0 8px rgba(74,222,128,0.4), inset 0 0 20px rgba(74,222,128,0.15); }
  100% { box-shadow: 0 0 0 0 rgba(74,222,128,0), inset 0 0 0 rgba(74,222,128,0); }
}
@keyframes celebrateBounce {
  0% { transform: scale(0.95); opacity: 0; }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes statSlideIn {
  0% { opacity: 0; transform: translateX(-6px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes slideUpSheet {
  from { transform: translateY(100%); opacity: 0.5; }
  to { transform: translateY(0); opacity: 1; }
}
.spell-detail-sheet {
  animation: slideUpSheet 0.3s ease-out;
  box-shadow: 0 -8px 32px rgba(0,0,0,0.6), 0 -2px 8px rgba(0,0,0,0.3);
}
@media (min-width: 1024px) {
  .spell-detail-sheet {
    animation: none;
    box-shadow: none;
  }
}
`;

// ── Helper Functions ───────────────────────────────────────────────────────

const fmtDelta = (n: number): string =>
  Number.isInteger(n) ? `${n}` : `${Number.parseFloat(n.toFixed(2))}`;

const computeStatDeltaText = (fromValue: string, toValue: string): string => {
  const compFrom = fromValue.match(/^([\d.]+)×([\d.]+)$/);
  const compTo = toValue.match(/^([\d.]+)×([\d.]+)$/);
  if (compFrom && compTo) {
    const dA = Number.parseFloat(compTo[1]) - Number.parseFloat(compFrom[1]);
    const dB = Number.parseFloat(compTo[2]) - Number.parseFloat(compFrom[2]);
    if (dA !== 0 && dB === 0) {
      return `+${fmtDelta(dA)}`;
    }
    if (dA === 0 && dB !== 0) {
      return `+${fmtDelta(dB)}`;
    }
    return `→ ${toValue}`;
  }

  const numFrom = fromValue.match(/^([+-]?[\d.]+)(.*)$/);
  const numTo = toValue.match(/^([+-]?[\d.]+)(.*)$/);
  if (numFrom && numTo && numFrom[2] === numTo[2]) {
    const delta = Number.parseFloat(numTo[1]) - Number.parseFloat(numFrom[1]);
    if (delta !== 0) {
      return `+${fmtDelta(delta)}${numFrom[2]}`;
    }
  }

  return `→ ${toValue}`;
};

const tierTop = (tier: number): number =>
  NODE_SIZE + CORE_GAP + (tier - 1) * (NODE_SIZE + TILE_GAP);

interface LabelLines {
  line1: string;
  line2: string;
  compact: boolean;
}

const splitSingleToken = (token: string): [string, string] => {
  if (token.length <= 11) {
    return [token, ""];
  }
  const midpoint = Math.ceil(token.length / 2);
  return [token.slice(0, midpoint), token.slice(midpoint)];
};

const toLabelLines = (rawText: string): LabelLines => {
  const text = rawText.trim().replaceAll(/\s+/g, " ");
  if (!text) {
    return { compact: false, line1: "", line2: "" };
  }

  const words = text.split(" ");
  if (words.length === 1) {
    const [line1, line2] = splitSingleToken(words[0]);
    return {
      compact: Math.max(line1.length, line2.length) >= 11,
      line1,
      line2,
    };
  }

  let bestSplitIndex = 1;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i += 1) {
    const l1 = words.slice(0, i).join(" ");
    const l2 = words.slice(i).join(" ");
    const lengthDelta = Math.abs(l1.length - l2.length);
    const overflowPenalty =
      Math.max(0, l1.length - 13) * 5 + Math.max(0, l2.length - 13) * 5;
    const penalty = lengthDelta + overflowPenalty;
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestSplitIndex = i;
    }
  }

  const line1 = words.slice(0, bestSplitIndex).join(" ");
  const line2 = words.slice(bestSplitIndex).join(" ");
  return { compact: Math.max(line1.length, line2.length) >= 13, line1, line2 };
};

const getNodeState = (currentLevel: number, nodeTier: number): NodeState => {
  if (currentLevel >= nodeTier) {
    return "unlocked";
  }
  if (currentLevel + 1 === nodeTier) {
    return "next";
  }
  return "locked";
};

const getDefaultSelection = (levels: SpellUpgradeLevels): SelectedNode => {
  for (const spellType of SPELL_OPTIONS) {
    const level = levels[spellType] ?? 0;
    if (level < MAX_SPELL_UPGRADE_LEVEL) {
      return { spellType, tier: level + 1 };
    }
  }
  return { spellType: SPELL_OPTIONS[0], tier: MAX_SPELL_UPGRADE_LEVEL };
};

const getNodeBoxShadow = (
  state: NodeState,
  selected: boolean,
  theme: SpellTheme
): string => {
  if (selected) {
    return `0 0 0 2px ${theme.glow}, 0 0 18px ${theme.glow}66`;
  }
  if (state === "unlocked") {
    return `inset 0 0 10px rgba(0,0,0,0.25), 0 0 6px rgba(74, 222, 128, 0.12)`;
  }
  if (state === "next") {
    return `inset 0 0 12px rgba(0,0,0,0.35), 0 0 0 2px rgba(250, 204, 21, 0.3), 0 0 8px rgba(250, 204, 21, 0.12)`;
  }
  return `inset 0 0 14px rgba(0,0,0,0.45)`;
};

const renderConnector = (
  cx: number,
  fromY: number,
  toY: number,
  state: NodeState,
  accentColor: string,
  key: string
): React.ReactNode => {
  const midY = (fromY + toY) / 2;
  const chev = 4;

  let stroke: string;
  let strokeWidth: number;
  let opacity: number;
  let dashArray: string | undefined;
  let animate = false;

  if (state === "unlocked") {
    stroke = accentColor;
    strokeWidth = 2.5;
    opacity = 0.7;
  } else if (state === "next") {
    stroke = "#facc15";
    strokeWidth = 2;
    opacity = 0.55;
    dashArray = "4 4";
    animate = true;
  } else {
    stroke = "#57534e";
    strokeWidth = 1.5;
    opacity = 0.22;
    dashArray = "2 4";
  }

  return (
    <g key={key}>
      <line
        x1={cx}
        y1={fromY + 2}
        x2={cx}
        y2={toY - 2}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        opacity={opacity}
        strokeDasharray={dashArray}
        style={
          animate
            ? { animation: "connectorFlow 0.8s linear infinite" }
            : undefined
        }
      />
      <path
        d={`M${cx - chev} ${midY - 2} L${cx} ${midY + 3} L${cx + chev} ${midY - 2}`}
        fill="none"
        stroke={stroke}
        strokeWidth={state === "locked" ? 1 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={state === "locked" ? 0.18 : opacity * 0.9}
      />
    </g>
  );
};

const getUpgradeIcon = (spellType: SpellType, tier: number): LucideIcon =>
  UPGRADE_ICON_MAP[`${spellType}-${tier}`] ?? CircleDot;

const getUpgradeTags = (spellType: SpellType, tier: number): UpgradeTag[] =>
  UPGRADE_TAGS[`${spellType}-${tier}`] ?? [];

// ── Spell Stat Display ────────────────────────────────────────────────────

interface StatEntry {
  label: string;
  value: string;
  Icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

const getSpellStatsForDisplay = (
  spellType: SpellType,
  level: number
): StatEntry[] => {
  switch (spellType) {
    case "fireball": {
      const s = getFireballSpellStats(level);
      return [
        {
          Icon: Swords,
          bg: "rgba(127,29,29,0.3)",
          border: "rgba(127,29,29,0.2)",
          color: "text-red-300",
          label: "Damage",
          value: `${s.damagePerMeteor}×${s.meteorCount}`,
        },
        {
          Icon: Flame,
          bg: "rgba(124,45,18,0.3)",
          border: "rgba(124,45,18,0.2)",
          color: "text-orange-300",
          label: "Meteors",
          value: `${s.meteorCount}`,
        },
        {
          Icon: Target,
          bg: "rgba(120,53,15,0.3)",
          border: "rgba(120,53,15,0.2)",
          color: "text-amber-300",
          label: "Radius",
          value: `${(s.impactRadius / TILE_SIZE).toFixed(1)}`,
        },
        {
          Icon: Flame,
          bg: "rgba(120,53,15,0.3)",
          border: "rgba(120,53,15,0.2)",
          color: "text-amber-300",
          label: "Burn",
          value: `${(s.burnDurationMs / 1000).toFixed(1)}s`,
        },
        {
          Icon: Flame,
          bg: "rgba(127,29,29,0.3)",
          border: "rgba(127,29,29,0.2)",
          color: "text-red-300",
          label: "Burn DPS",
          value: `${s.burnDamagePerSecond}/s`,
        },
        {
          Icon: Timer,
          bg: "rgba(68,64,60,0.3)",
          border: "rgba(68,64,60,0.2)",
          color: "text-stone-300",
          label: "Fall Time",
          value: `${(s.fallDurationMs / 1000).toFixed(1)}s`,
        },
      ];
    }
    case "lightning": {
      const s = getLightningSpellStats(level);
      return [
        {
          Icon: Zap,
          bg: "rgba(113,63,18,0.3)",
          border: "rgba(113,63,18,0.2)",
          color: "text-yellow-300",
          label: "Total DMG",
          value: `${s.totalDamage}`,
        },
        {
          Icon: GitBranch,
          bg: "rgba(22,78,99,0.3)",
          border: "rgba(22,78,99,0.2)",
          color: "text-cyan-300",
          label: "Chains",
          value: `${s.chainCount}`,
        },
        {
          Icon: Timer,
          bg: "rgba(30,58,138,0.3)",
          border: "rgba(30,58,138,0.2)",
          color: "text-blue-300",
          label: "Stun",
          value: `${(s.stunDurationMs / 1000).toFixed(2)}s`,
        },
      ];
    }
    case "freeze": {
      const s = getFreezeSpellStats(level);
      return [
        {
          Icon: Timer,
          bg: "rgba(22,78,99,0.3)",
          border: "rgba(22,78,99,0.2)",
          color: "text-cyan-300",
          label: "Duration",
          value: `${(s.freezeDurationMs / 1000).toFixed(1)}s`,
        },
        {
          Icon: s.isGlobal ? Globe : Users,
          bg: "rgba(30,58,138,0.3)",
          border: "rgba(30,58,138,0.2)",
          color: "text-blue-300",
          label: "Targets",
          value: s.isGlobal ? "Global" : `${s.maxTargets}`,
        },
        {
          Icon: Snowflake,
          bg: "rgba(49,46,129,0.3)",
          border: "rgba(49,46,129,0.2)",
          color: "text-indigo-300",
          label: "Slow",
          value: "100%",
        },
      ];
    }
    case "hex_ward": {
      const s = getHexWardSpellStats(level);
      return [
        {
          Icon: Users,
          bg: "rgba(88,28,135,0.3)",
          border: "rgba(88,28,135,0.2)",
          color: "text-fuchsia-300",
          label: "Raises",
          value: `${s.maxReanimations}`,
        },
        {
          Icon: Eye,
          bg: "rgba(76,29,149,0.3)",
          border: "rgba(76,29,149,0.2)",
          color: "text-purple-300",
          label: "Marked",
          value: `${s.maxTargets}`,
        },
        {
          Icon: Timer,
          bg: "rgba(91,33,182,0.3)",
          border: "rgba(91,33,182,0.2)",
          color: "text-violet-300",
          label: "Duration",
          value: `${(s.durationMs / 1000).toFixed(0)}s`,
        },
        {
          Icon: s.blocksHealing ? Shield : Sparkles,
          bg: "rgba(112,26,117,0.3)",
          border: "rgba(112,26,117,0.2)",
          color: "text-pink-300",
          label: "Debuff",
          value: s.blocksHealing
            ? s.damageAmp > 0
              ? `+${Math.round(s.damageAmp * 100)}% + No Heal`
              : "No Heal"
            : s.damageAmp > 0
              ? `+${Math.round(s.damageAmp * 100)}%`
              : "Harvest Only",
        },
      ];
    }
    case "payday": {
      const s = getPaydaySpellStats(level);
      return [
        {
          Icon: Coins,
          bg: "rgba(120,53,15,0.3)",
          border: "rgba(120,53,15,0.2)",
          color: "text-amber-300",
          label: "Base PP",
          value: `${s.basePayout}`,
        },
        {
          Icon: TrendingUp,
          bg: "rgba(20,83,45,0.3)",
          border: "rgba(20,83,45,0.2)",
          color: "text-green-300",
          label: "Per Enemy",
          value: `+${s.bonusPerEnemy}`,
        },
        {
          Icon: Gem,
          bg: "rgba(113,63,18,0.3)",
          border: "rgba(113,63,18,0.2)",
          color: "text-yellow-300",
          label: "Max Bonus",
          value: `+${s.maxBonus}`,
        },
        {
          Icon: Sparkles,
          bg: "rgba(113,63,18,0.3)",
          border: "rgba(113,63,18,0.2)",
          color: "text-yellow-200",
          label: "Max Total",
          value: `${s.basePayout + s.maxBonus}`,
        },
        {
          Icon: Timer,
          bg: "rgba(120,53,15,0.3)",
          border: "rgba(120,53,15,0.2)",
          color: "text-amber-300",
          label: "Aura",
          value: `${(s.auraDurationMs / 1000).toFixed(0)}s`,
        },
      ];
    }
    case "reinforcements": {
      const s = getReinforcementSpellStats(level);
      const entries: StatEntry[] = [
        {
          Icon: Users,
          bg: "rgba(6,78,59,0.3)",
          border: "rgba(6,78,59,0.2)",
          color: "text-emerald-300",
          label: "Knights",
          value: `${s.knightCount}`,
        },
        {
          Icon: Heart,
          bg: "rgba(127,29,29,0.3)",
          border: "rgba(127,29,29,0.2)",
          color: "text-red-300",
          label: "HP Each",
          value: `${s.knightHp}`,
        },
        {
          Icon: Swords,
          bg: "rgba(124,45,18,0.3)",
          border: "rgba(124,45,18,0.2)",
          color: "text-orange-300",
          label: "DMG Each",
          value: `${s.knightDamage}`,
        },
        {
          Icon: Timer,
          bg: "rgba(68,64,60,0.3)",
          border: "rgba(68,64,60,0.2)",
          color: "text-stone-300",
          label: "Atk Speed",
          value: `${(s.knightAttackSpeedMs / 1000).toFixed(1)}s`,
        },
        {
          Icon: Target,
          bg: "rgba(13,148,136,0.2)",
          border: "rgba(13,148,136,0.15)",
          color: "text-teal-300",
          label: "Patrol",
          value: `${(s.moveRadius / TILE_SIZE).toFixed(1)}`,
        },
        s.rangedUnlocked
          ? {
              Icon: Crosshair,
              bg: "rgba(88,28,135,0.3)",
              border: "rgba(88,28,135,0.2)",
              color: "text-purple-300",
              label: "Atk Range",
              value: "Ranged",
            }
          : {
              Icon: Swords,
              bg: "rgba(68,64,60,0.3)",
              border: "rgba(68,64,60,0.2)",
              color: "text-stone-300",
              label: "Atk Range",
              value: "Melee",
            },
      ];
      return entries;
    }
    default: {
      return [];
    }
  }
};

// ── Stat Diff ──────────────────────────────────────────────────────────────

interface StatDiff {
  label: string;
  fromValue: string;
  toValue: string;
  changed: boolean;
  Icon: LucideIcon;
  color: string;
  isNew?: boolean;
}

const computeStatDiff = (
  spellType: SpellType,
  fromLevel: number,
  toLevel: number
): StatDiff[] => {
  const clampedFrom = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, fromLevel));
  const clampedTo = Math.max(0, Math.min(MAX_SPELL_UPGRADE_LEVEL, toLevel));
  if (clampedFrom === clampedTo) {
    return [];
  }

  const fromStats = getSpellStatsForDisplay(spellType, clampedFrom);
  const toStats = getSpellStatsForDisplay(spellType, clampedTo);
  const maxLen = Math.max(fromStats.length, toStats.length);
  const diffs: StatDiff[] = [];

  for (let i = 0; i < maxLen; i++) {
    const from = fromStats[i];
    const to = toStats[i];
    if (from && to) {
      diffs.push({
        Icon: from.Icon,
        changed: from.value !== to.value,
        color: from.color,
        fromValue: from.value,
        label: from.label,
        toValue: to.value,
      });
    } else if (to && !from) {
      diffs.push({
        Icon: to.Icon,
        changed: true,
        color: to.color,
        fromValue: "—",
        isNew: true,
        label: to.label,
        toValue: to.value,
      });
    }
  }

  return diffs;
};

// ── Component ──────────────────────────────────────────────────────────────

export const SpellUpgradeModal: React.FC<SpellUpgradeModalProps> = ({
  isOpen,
  onClose,
  availableStars,
  totalStarsEarned,
  spentStars,
  spellUpgradeLevels,
  onUpgradeSpell,
  onDowngradeSpell,
}) => {
  const [selectedNode, setSelectedNode] = React.useState<SelectedNode>(() =>
    getDefaultSelection(spellUpgradeLevels)
  );
  const [justUpgraded, setJustUpgraded] = React.useState<SelectedNode | null>(
    null
  );
  const [confirmingSell, setConfirmingSell] =
    React.useState<SelectedNode | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    setSelectedNode((current) => {
      const currentTier = Math.max(
        1,
        Math.min(MAX_SPELL_UPGRADE_LEVEL, current.tier)
      );
      const nodes = getSpellUpgradeNodes(current.spellType);
      if (!nodes[currentTier - 1]) {
        return getDefaultSelection(spellUpgradeLevels);
      }
      return { spellType: current.spellType, tier: currentTier };
    });
  }, [isOpen, spellUpgradeLevels]);

  React.useEffect(() => {
    if (!justUpgraded) {
      return;
    }
    const timer = setTimeout(() => setJustUpgraded(null), 2200);
    return () => clearTimeout(timer);
  }, [justUpgraded]);

  React.useEffect(() => {
    setConfirmingSell(null);
  }, [selectedNode.spellType, selectedNode.tier]);

  if (!isOpen) {
    return null;
  }

  const columnCount = SPELL_OPTIONS.length;
  const boardWidth = columnCount * NODE_SIZE + (columnCount - 1) * TILE_GAP;
  const boardHeight =
    NODE_SIZE +
    CORE_GAP +
    MAX_SPELL_UPGRADE_LEVEL * (NODE_SIZE + TILE_GAP) -
    TILE_GAP;

  const selectedSpellLevel = spellUpgradeLevels[selectedNode.spellType] ?? 0;
  const selectedNodeDef = getSpellUpgradeNodes(selectedNode.spellType)[
    selectedNode.tier - 1
  ];
  const selectedState = getNodeState(selectedSpellLevel, selectedNode.tier);
  const canBuySelected =
    selectedState === "next" && availableStars >= selectedNodeDef.cost;
  const canSellSelected =
    selectedState === "unlocked" && selectedNode.tier === selectedSpellLevel;
  const sellRefund = canSellSelected
    ? getSpellDowngradeRefund(selectedNode.spellType, selectedSpellLevel)
    : 0;
  const isConfirmingSellThisNode =
    confirmingSell?.spellType === selectedNode.spellType &&
    confirmingSell?.tier === selectedNode.tier;
  const selectedTheme = SPELL_THEMES[selectedNode.spellType];
  const selectedTags = getUpgradeTags(
    selectedNode.spellType,
    selectedNode.tier
  );
  const selectedSpellData = SPELL_DATA[selectedNode.spellType];
  const selectedSpellStats = getSpellStatsForDisplay(
    selectedNode.spellType,
    selectedNode.tier - 1
  );
  const statDiffByLabel = new Map(
    computeStatDiff(
      selectedNode.spellType,
      selectedNode.tier - 1,
      selectedNode.tier
    )
      .filter((s) => s.changed)
      .map((s) => [s.label, s])
  );

  const handleUpgrade = () => {
    if (!canBuySelected) {
      return;
    }
    const upgradedSpell = selectedNode.spellType;
    const upgradedTier = selectedNode.tier;
    onUpgradeSpell(upgradedSpell);
    setJustUpgraded({ spellType: upgradedSpell, tier: upgradedTier });
    setConfirmingSell(null);
    setTimeout(() => {
      if (upgradedTier < MAX_SPELL_UPGRADE_LEVEL) {
        setSelectedNode({ spellType: upgradedSpell, tier: upgradedTier + 1 });
      }
    }, 800);
  };

  const handleSell = () => {
    if (!canSellSelected) {
      return;
    }
    if (!isConfirmingSellThisNode) {
      setConfirmingSell({
        spellType: selectedNode.spellType,
        tier: selectedNode.tier,
      });
      return;
    }
    onDowngradeSpell(selectedNode.spellType);
    setConfirmingSell(null);
    if (selectedNode.tier > 1) {
      setSelectedNode({
        spellType: selectedNode.spellType,
        tier: selectedNode.tier - 1,
      });
    }
  };

  return (
    <BaseModal
      isOpen
      onClose={onClose}
      usePortal
      zClass="z-[1300]"
      blurClass=""
      backdropBg="rgba(0,0,0,0.85)"
      paddingClass="p-2 sm:p-4"
      className="isolate pointer-events-auto"
    >
      <style>{ANIMATIONS_CSS}</style>

      <OrnateFrame
        className="relative z-10 w-full max-w-[1280px] max-h-[94dvh] overflow-hidden rounded-xl sm:rounded-2xl flex flex-col"
        style={{ border: `1px solid ${GOLD.accentBorder40}` }}
        cornerSize={36}
        showSideBorders={false}
        decorationClassName="hidden sm:contents"
      >
        {/* ── Header ── */}
        <div
          className="shrink-0 z-20 border-b border-amber-700/25 px-3 sm:px-6 py-2 sm:py-3"
          style={{ background: panelGradient }}
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-amber-300">
              <EnchantedAnvilIcon size={20} />
              <h2 className="text-base sm:text-xl font-extrabold tracking-wide">
                Spell Upgrades
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <div className="rounded-lg border border-yellow-500/35 bg-yellow-900/20 px-2.5 py-1 text-yellow-200 font-semibold inline-flex items-center gap-1.5">
                  <Star size={14} className="fill-yellow-300 text-yellow-300" />
                  Available: {availableStars}
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-950/35 px-2.5 py-1 text-amber-200 inline-flex items-center gap-1.5">
                  <Coins size={13} />
                  Spent: {spentStars}/{totalStarsEarned}
                </div>
                <div className="rounded-lg border border-stone-500/35 bg-stone-900/60 px-2.5 py-1 text-stone-200">
                  Earned: {totalStarsEarned}/{SPELL_TOTAL_MAX_UPGRADE_STARS}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-md sm:rounded-lg border border-amber-500/30 bg-amber-900/20 p-1.5 sm:p-2 text-amber-200 hover:bg-amber-800/30"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="mt-1.5 flex sm:hidden flex-wrap items-center gap-1.5 text-[11px]">
            <div className="rounded-md border border-yellow-500/35 bg-yellow-900/20 px-2 py-0.5 text-yellow-200 font-semibold inline-flex items-center gap-1">
              <Star size={12} className="fill-yellow-300 text-yellow-300" />
              {availableStars}
            </div>
            <div className="rounded-md border border-amber-500/30 bg-amber-950/35 px-2 py-0.5 text-amber-200 inline-flex items-center gap-1">
              <Coins size={11} />
              {spentStars}/{totalStarsEarned}
            </div>
            <div className="rounded-md border border-stone-500/35 bg-stone-900/60 px-2 py-0.5 text-stone-200">
              {totalStarsEarned}/{SPELL_TOTAL_MAX_UPGRADE_STARS}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 min-h-0 relative lg:grid lg:grid-cols-[minmax(0,1fr)_332px] lg:grid-rows-[minmax(0,1fr)]">
          {/* ── Grid Panel ── */}
          <OrnateFrame
            className="h-full lg:min-h-0 lg:overflow-hidden"
            style={{ border: `1px solid ${GOLD.border25}` }}
            cornerSize={28}
            cornerVariant="compact"
            borderVariant="compact"
            decorationClassName="hidden lg:contents"
          >
            <div
              className="relative p-2 sm:p-4 h-full overflow-y-auto overscroll-y-contain"
              style={{ background: "rgba(16, 12, 10, 0.86)" }}
            >
              {/* Faint gameplay background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 40%, transparent 85%)",
                  backgroundImage: "url('/images/new/gameplay_grounds.png')",
                  backgroundPosition: "center 40%",
                  backgroundSize: "cover",
                  maskImage:
                    "radial-gradient(ellipse at center, black 40%, transparent 85%)",
                  opacity: 0.2,
                }}
              />
              <div className="mb-2 sm:mb-3 flex items-center justify-end gap-2">
                <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-amber-200/60">
                  <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400/90" />
                  <span>Unlocked</span>
                  <span className="ml-1.5 sm:ml-2 inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-400/90" />
                  <span>Next</span>
                  <span className="ml-1.5 sm:ml-2 inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-stone-600" />
                  <span>Locked</span>
                </div>
              </div>

              <div className="pb-[40dvh] lg:pb-2">
                <div
                  className="relative mx-auto"
                  style={{ width: boardWidth + LABEL_WIDTH + 10 }}
                >
                  {/* Left-side tier labels */}
                  <div
                    className="absolute left-0 top-0"
                    style={{ width: LABEL_WIDTH }}
                  >
                    <div
                      className="absolute right-0 text-right text-[10px] font-semibold text-amber-200/50"
                      style={{ top: NODE_SIZE / 2 - 7 }}
                    >
                      Base
                    </div>
                    {Array.from(
                      { length: MAX_SPELL_UPGRADE_LEVEL },
                      (_, i) => i + 1
                    ).map((tier) => (
                      <div
                        key={tier}
                        className="absolute right-0 text-right text-[10px] font-semibold text-amber-300/65"
                        style={{ top: tierTop(tier) + NODE_SIZE / 2 - 7 }}
                      >
                        Tier {tier}
                      </div>
                    ))}
                  </div>

                  {/* Board area */}
                  <div
                    className="relative"
                    style={{
                      height: boardHeight,
                      marginLeft: LABEL_WIDTH + 10,
                      width: boardWidth,
                    }}
                  >
                    {/* SVG connector layer */}
                    <svg
                      className="absolute inset-0 pointer-events-none"
                      viewBox={`0 0 ${boardWidth} ${boardHeight}`}
                      preserveAspectRatio="none"
                    >
                      {SPELL_OPTIONS.map((spellType, colIndex) => {
                        const theme = SPELL_THEMES[spellType];
                        const spellLevel = spellUpgradeLevels[spellType] ?? 0;
                        const cx =
                          colIndex * (NODE_SIZE + TILE_GAP) + NODE_SIZE / 2;

                        const segments: React.ReactNode[] = [];

                        segments.push(
                          renderConnector(
                            cx,
                            NODE_SIZE,
                            tierTop(1),
                            getNodeState(spellLevel, 1),
                            theme.connector,
                            `${spellType}-c-1`
                          )
                        );

                        for (let t = 1; t < MAX_SPELL_UPGRADE_LEVEL; t++) {
                          segments.push(
                            renderConnector(
                              cx,
                              tierTop(t) + NODE_SIZE,
                              tierTop(t + 1),
                              getNodeState(spellLevel, t + 1),
                              theme.connector,
                              `${spellType}-${t}-${t + 1}`
                            )
                          );
                        }

                        return (
                          <React.Fragment key={`${spellType}-conn`}>
                            {segments}
                          </React.Fragment>
                        );
                      })}
                    </svg>

                    {/* Core/base spell tiles (top row) */}
                    {SPELL_OPTIONS.map((spellType, colIndex) => {
                      const spellData = SPELL_DATA[spellType];
                      const spellLevel = spellUpgradeLevels[spellType] ?? 0;
                      const theme = SPELL_THEMES[spellType];
                      const left = colIndex * (NODE_SIZE + TILE_GAP);

                      return (
                        <button
                          key={`${spellType}-core`}
                          type="button"
                          onClick={() =>
                            setSelectedNode({
                              spellType,
                              tier: Math.max(
                                1,
                                Math.min(
                                  MAX_SPELL_UPGRADE_LEVEL,
                                  spellLevel + 1
                                )
                              ),
                            })
                          }
                          className="absolute rounded-xl border transition-all hover:brightness-110"
                          style={{
                            background: theme.boardBg,
                            borderColor: `${theme.accent}8a`,
                            boxShadow: `inset 0 0 14px rgba(0,0,0,0.35), 0 0 10px ${theme.glow}33`,
                            height: NODE_SIZE,
                            left,
                            top: 0,
                            width: NODE_SIZE,
                          }}
                          title={spellData.name}
                        >
                          <div className="flex h-full flex-col items-center px-1.5 py-1.5">
                            <div
                              className="text-[10px] font-bold text-center leading-tight truncate w-full"
                              style={{
                                color: theme.glow,
                                textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                              }}
                            >
                              {spellData.name}
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                              <SpellSprite
                                type={spellType}
                                size={38}
                                animated
                              />
                            </div>
                            <div className="w-full text-center">
                              <div
                                className="text-[9px] text-amber-200/45"
                                style={{
                                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                                }}
                              >
                                {Math.round(spellData.cooldown / 1000)}s
                                cooldown
                              </div>
                              <div className="flex justify-center gap-[3px] mt-1">
                                {Array.from(
                                  { length: MAX_SPELL_UPGRADE_LEVEL },
                                  (_, i) => (
                                    <div
                                      key={i}
                                      className="rounded-full"
                                      style={{
                                        background:
                                          i < spellLevel
                                            ? "#4ade80"
                                            : i === spellLevel
                                              ? "#facc15"
                                              : "#57534e",
                                        boxShadow:
                                          i < spellLevel
                                            ? "0 0 3px #4ade8055"
                                            : i === spellLevel
                                              ? "0 0 3px #facc1555"
                                              : "none",
                                        height: 5,
                                        width: 5,
                                      }}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Tier upgrade nodes */}
                    {SPELL_OPTIONS.map((spellType, colIndex) => {
                      const nodes = getSpellUpgradeNodes(spellType);
                      const spellLevel = spellUpgradeLevels[spellType] ?? 0;
                      const theme = SPELL_THEMES[spellType];

                      return nodes.map((node) => {
                        const top = tierTop(node.level);
                        const left = colIndex * (NODE_SIZE + TILE_GAP);
                        const state = getNodeState(spellLevel, node.level);
                        const selected =
                          selectedNode.spellType === spellType &&
                          selectedNode.tier === node.level;
                        const TierIcon = LEVEL_ICON_MAP[node.level].Icon;
                        const UpgradeIcon = getUpgradeIcon(
                          spellType,
                          node.level
                        );
                        const nodeTitle = toLabelLines(node.title);
                        const visuals = NODE_VISUALS[state];
                        const isNodeJustUpgraded =
                          justUpgraded?.spellType === spellType &&
                          justUpgraded?.tier === node.level;

                        return (
                          <button
                            key={`${spellType}-${node.level}`}
                            type="button"
                            onClick={() =>
                              setSelectedNode({ spellType, tier: node.level })
                            }
                            className="absolute rounded-xl border text-left transition-all hover:brightness-110"
                            style={{
                              animation: isNodeJustUpgraded
                                ? "upgradeFlash 1.5s ease-out"
                                : state === "next" && !selected
                                  ? "spellNodePulse 2.5s ease-in-out infinite"
                                  : undefined,
                              background: visuals.background,
                              borderColor: isNodeJustUpgraded
                                ? "rgba(74, 222, 128, 0.7)"
                                : visuals.borderColor,
                              borderStyle:
                                state === "next" ? "dashed" : "solid",
                              boxShadow: isNodeJustUpgraded
                                ? `0 0 0 2px rgba(74,222,128,0.5), 0 0 16px rgba(74,222,128,0.3)`
                                : getNodeBoxShadow(state, selected, theme),
                              height: NODE_SIZE,
                              left,
                              top,
                              transform: isNodeJustUpgraded
                                ? "scale(1.03)"
                                : selected
                                  ? "translateY(-1px)"
                                  : undefined,
                              width: NODE_SIZE,
                            }}
                          >
                            <div className="flex h-full flex-col p-1.5">
                              {/* Header: tier badge + state indicator */}
                              <div className="flex items-center justify-between gap-0.5">
                                <div
                                  className="inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px] font-bold"
                                  style={{
                                    background: "rgba(8,8,10,0.4)",
                                    borderColor: visuals.borderColor,
                                    color: visuals.textColor,
                                  }}
                                >
                                  <TierIcon size={9} />
                                  {node.level}
                                </div>
                                {state === "unlocked" && (
                                  <div
                                    className="inline-flex items-center justify-center rounded-full"
                                    style={{
                                      background: "rgba(34, 197, 94, 0.2)",
                                      border:
                                        "1.5px solid rgba(74, 222, 128, 0.65)",
                                      height: 17,
                                      width: 17,
                                    }}
                                  >
                                    <Check
                                      size={10}
                                      strokeWidth={3}
                                      className="text-emerald-300"
                                    />
                                  </div>
                                )}
                                {state === "next" && (
                                  <div className="rounded border border-yellow-500/45 bg-yellow-900/45 px-1 py-0.5 text-[9px] font-bold text-yellow-200">
                                    {node.cost}★
                                  </div>
                                )}
                                {state === "locked" && (
                                  <Lock
                                    size={11}
                                    className="text-stone-500/70"
                                  />
                                )}
                              </div>

                              {/* Spell sprite with corner upgrade icon */}
                              <div className=" flex justify-center">
                                <div
                                  className="relative h-10 w-10 rounded-md border flex items-center justify-center"
                                  style={{
                                    background: "rgba(0,0,0,0.36)",
                                    borderColor:
                                      state === "locked"
                                        ? "rgba(100,93,88,0.25)"
                                        : `${theme.glow}44`,
                                    opacity: state === "locked" ? 0.4 : 1,
                                  }}
                                >
                                  <SpellSprite
                                    type={spellType}
                                    size={26}
                                    animated={false}
                                  />
                                  <div
                                    className="absolute -bottom-1 -right-1 z-10 flex items-center justify-center rounded-full"
                                    style={{
                                      background: "rgba(0,0,0,0.75)",
                                      border: `1.5px solid ${state === "locked" ? "rgba(100,93,88,0.4)" : theme.glow + "55"}`,
                                      height: 18,
                                      width: 18,
                                    }}
                                  >
                                    <UpgradeIcon
                                      size={10}
                                      style={{
                                        color:
                                          state === "locked"
                                            ? "#78716c"
                                            : theme.glow,
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Title label */}
                              <div
                                className={`mt-1 flex flex-col items-center justify-center text-center font-bold leading-[1.15] ${
                                  nodeTitle.compact
                                    ? "text-[8.5px]"
                                    : "text-[10px]"
                                }`}
                                style={{
                                  color:
                                    state === "locked" ? "#a8a29e" : theme.glow,
                                  opacity: state === "locked" ? 0.5 : 1,
                                  textShadow:
                                    state === "locked"
                                      ? "0 1px 2px rgba(0,0,0,0.6)"
                                      : `0 0 6px ${theme.glow}55, 0 1px 2px rgba(0,0,0,0.8)`,
                                }}
                                title={node.title}
                              >
                                <span>{nodeTitle.line1}</span>
                                {nodeTitle.line2 ? (
                                  <span>{nodeTitle.line2}</span>
                                ) : null}
                              </div>
                            </div>
                          </button>
                        );
                      });
                    })}
                  </div>
                </div>
              </div>
            </div>
          </OrnateFrame>

          {/* ── Detail Panel (bottom sheet on mobile, sidebar on desktop) ── */}
          <div className="spell-detail-sheet absolute bottom-0 inset-x-0 z-20 max-h-[62dvh] rounded-t-xl lg:relative lg:inset-auto lg:z-auto lg:max-h-none lg:rounded-none lg:min-h-0 lg:overflow-hidden">
            <OrnateFrame
              className="h-full flex flex-col overflow-hidden rounded-t-xl lg:rounded-none"
              style={{ border: `1px solid ${GOLD.border25}` }}
              cornerSize={30}
              color={selectedTheme.accent}
              glowColor={selectedTheme.glow}
              decorationClassName="hidden lg:contents"
            >
              {/* Mobile drag handle */}
              <div
                className="lg:hidden shrink-0 flex justify-center pt-2 pb-1"
                style={{ background: "rgba(20, 14, 10, 0.95)" }}
              >
                <div className="w-10 h-1 rounded-full bg-stone-600/80" />
              </div>

              {/* Mobile compact spell header */}
              <div
                className="lg:hidden shrink-0 flex items-center gap-2.5 px-3 pb-2"
                style={{ background: "rgba(20, 14, 10, 0.95)" }}
              >
                <div
                  className="h-10 w-10 rounded-md border flex items-center justify-center shrink-0"
                  style={{
                    background: selectedTheme.boardBg,
                    borderColor: `${selectedTheme.glow}55`,
                  }}
                >
                  <SpellSprite
                    type={selectedNode.spellType}
                    size={26}
                    animated
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-amber-100 truncate">
                      {selectedSpellData.name}
                    </span>
                    <span className="shrink-0 inline-flex items-center gap-0.5 rounded border border-amber-500/30 bg-amber-900/25 px-1.5 py-0.5 text-[10px] text-amber-200">
                      Lv {selectedSpellLevel}/{MAX_SPELL_UPGRADE_LEVEL}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-amber-300/60">
                      Tier {selectedNode.tier}
                    </span>
                    <span className="text-stone-600 text-[10px]">·</span>
                    <span
                      className="text-[11px] font-semibold truncate"
                      style={{
                        color:
                          selectedState === "locked"
                            ? "#a8a29e"
                            : selectedTheme.glow,
                      }}
                    >
                      {selectedNodeDef.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable detail content */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-2.5 sm:px-4 pb-2 sm:pb-4 lg:pt-4"
                style={{ background: "rgba(20, 14, 10, 0.9)" }}
              >
                {/* Spell identity — desktop only (mobile shows compact header above) */}
                <div className="hidden lg:flex items-center gap-3 rounded-xl border border-amber-700/25 bg-amber-950/30 p-3">
                  <div
                    className="h-12 w-12 rounded-lg border flex items-center justify-center shrink-0"
                    style={{
                      background: selectedTheme.boardBg,
                      borderColor: `${selectedTheme.glow}66`,
                    }}
                  >
                    <SpellSprite
                      type={selectedNode.spellType}
                      size={32}
                      animated
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-amber-100 leading-tight truncate">
                      {selectedSpellData.name}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-stone-500">
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-900/25 px-1.5 py-0.5 text-amber-200 font-medium">
                        Lv {selectedSpellLevel}/{MAX_SPELL_UPGRADE_LEVEL}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Coins size={9} />
                        {selectedSpellData.cost > 0
                          ? `${selectedSpellData.cost} PP`
                          : "Free"}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Clock size={9} />
                        {selectedSpellData.cooldown / 1000}s
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Upgrade Hero Card ── */}
                <div
                  className="lg:mt-3 rounded-lg sm:rounded-xl border overflow-hidden"
                  style={{
                    background:
                      selectedState === "next"
                        ? selectedTheme.boardBg
                        : selectedState === "unlocked"
                          ? "rgba(16, 56, 36, 0.25)"
                          : "rgba(38, 34, 30, 0.4)",
                    borderColor:
                      selectedState === "next"
                        ? `${selectedTheme.accent}55`
                        : selectedState === "unlocked"
                          ? "rgba(74, 222, 128, 0.25)"
                          : "rgba(100, 93, 88, 0.3)",
                  }}
                >
                  <div
                    className="px-3 py-1.5 flex items-center gap-2 border-b"
                    style={{
                      background: "rgba(0,0,0,0.2)",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70 font-medium">
                      Tier {selectedNode.tier} Upgrade
                    </span>
                    <span className="text-[10px] text-amber-300/40">
                      {LEVEL_ICON_MAP[selectedNode.tier].label}
                    </span>
                  </div>

                  <div className="p-3">
                    <div
                      className="font-bold text-base leading-snug"
                      style={{
                        color:
                          selectedState === "locked"
                            ? "#a8a29e"
                            : selectedTheme.glow,
                        textShadow:
                          selectedState === "locked"
                            ? undefined
                            : `0 0 12px ${selectedTheme.glow}44`,
                      }}
                    >
                      {selectedNodeDef.title}
                    </div>
                    <p className="mt-0.5 mb-3 text-[11px] leading-relaxed text-stone-500 italic">
                      &ldquo;{selectedNodeDef.description}&rdquo;
                    </p>

                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {selectedTags.map((tag, i) =>
                          tag.special ? (
                            <div
                              key={i}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12px] font-bold"
                              style={{
                                background: `linear-gradient(135deg, ${tag.accent}22, ${tag.accent}08)`,
                                borderColor: `${tag.accent}66`,
                                boxShadow: `0 0 16px ${tag.accent}25, inset 0 1px 0 ${tag.accent}15`,
                              }}
                            >
                              <SpellOrbIcon
                                size={15}
                                style={{
                                  filter: `drop-shadow(0 0 3px ${tag.accent})`,
                                }}
                              />
                              <span
                                style={{
                                  color: "#fef9c3",
                                  textShadow: `0 0 8px ${tag.accent}44`,
                                }}
                              >
                                {tag.label}
                              </span>
                            </div>
                          ) : (
                            <div
                              key={i}
                              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold"
                              style={{
                                background: `${tag.accent}15`,
                                borderColor: `${tag.accent}45`,
                                color: tag.accent,
                              }}
                            >
                              <tag.icon size={11} />
                              {tag.label}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Spell stats with upgrade annotations */}
                <div className="mt-2 sm:mt-3 rounded-lg sm:rounded-xl border border-stone-700/45 bg-stone-900/50 p-2 sm:p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70 mb-1.5 sm:mb-2">
                    Spell Stats
                  </div>
                  <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
                    {selectedSpellStats.map((stat) => {
                      const diff = statDiffByLabel.get(stat.label);
                      const hasUpgrade = !!diff;
                      return (
                        <div
                          key={stat.label}
                          className="relative rounded sm:rounded-md px-1 sm:px-1.5 py-1 sm:py-1.5 text-center"
                          style={{
                            background: hasUpgrade
                              ? `linear-gradient(180deg, ${stat.bg}, rgba(90,68,20,0.25))`
                              : stat.bg,
                            border: hasUpgrade
                              ? `1px solid rgba(250,204,21,0.25)`
                              : `1px solid ${stat.border}`,
                          }}
                        >
                          <div className="flex items-center justify-center mb-0.5">
                            <stat.Icon size={11} className={stat.color} />
                          </div>
                          <div className="text-[7px] text-stone-400 font-medium uppercase leading-tight">
                            {stat.label}
                          </div>
                          <div
                            className={`font-bold text-[11px] sm:text-[12px] leading-tight ${stat.color}`}
                          >
                            {stat.value}
                          </div>
                          {hasUpgrade && (
                            <div className="mt-0.5 text-[9px] font-bold leading-tight text-emerald-400">
                              {diff.isNew
                                ? "+NEW"
                                : computeStatDeltaText(
                                    diff.fromValue,
                                    diff.toValue
                                  )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Compact cost + progress */}
                <div className="mt-2 sm:mt-3 flex items-center gap-3 rounded-lg border border-stone-700/30 bg-stone-900/30 px-3 py-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Star
                      size={12}
                      className="fill-yellow-300 text-yellow-300"
                    />
                    <span className="text-xs font-bold text-yellow-200">
                      {selectedNodeDef.cost}
                    </span>
                    <span className="text-[10px] text-stone-500">stars</span>
                  </div>
                  <div className="h-3 w-px bg-stone-700/50" />
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: `linear-gradient(90deg, ${selectedTheme.accent}, ${selectedTheme.glow})`,
                          boxShadow:
                            selectedSpellLevel > 0
                              ? `0 0 6px ${selectedTheme.glow}55`
                              : undefined,
                          width: `${(selectedSpellLevel / MAX_SPELL_UPGRADE_LEVEL) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium shrink-0">
                      {selectedSpellLevel}/{MAX_SPELL_UPGRADE_LEVEL}
                    </span>
                  </div>
                </div>

                {/* Desktop-only: status + buttons inline in scroll area */}
                <div className="hidden lg:block">
                  {/* Status indicator */}
                  <div
                    className={`mt-3 rounded-lg border px-3 py-2 text-xs flex items-center gap-2 ${
                      selectedState === "unlocked"
                        ? "border-emerald-500/30 bg-emerald-950/30"
                        : selectedState === "next"
                          ? "border-yellow-500/30 bg-yellow-950/30"
                          : "border-stone-600/30 bg-stone-950/40"
                    }`}
                  >
                    {selectedState === "unlocked" && (
                      <>
                        <Check
                          size={12}
                          className="text-emerald-400 shrink-0"
                        />
                        <span className="text-emerald-300">
                          {canSellSelected
                            ? "Unlocked. Sell to recover stars."
                            : "Already unlocked for this spell."}
                        </span>
                      </>
                    )}
                    {selectedState === "next" && (
                      <>
                        <Star size={12} className="text-yellow-400 shrink-0" />
                        <span className="text-yellow-200">
                          {canBuySelected
                            ? "Ready to upgrade!"
                            : `Need ${selectedNodeDef.cost - availableStars} more star${selectedNodeDef.cost - availableStars === 1 ? "" : "s"}.`}
                        </span>
                      </>
                    )}
                    {selectedState === "locked" && (
                      <>
                        <Lock size={12} className="text-stone-400 shrink-0" />
                        <span className="text-stone-300">
                          Upgrade previous tiers first.
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleUpgrade}
                      disabled={!canBuySelected}
                      className={`w-full rounded-lg border px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${
                        canBuySelected
                          ? "border-yellow-500/60 bg-yellow-700/30 text-yellow-100 hover:bg-yellow-700/45 hover:border-yellow-400/70 hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]"
                          : "border-stone-600/40 bg-stone-800/40 text-stone-500 cursor-not-allowed"
                      }`}
                    >
                      {selectedState === "unlocked"
                        ? "Unlocked"
                        : selectedState === "locked"
                          ? "Tier Locked"
                          : canBuySelected
                            ? `Upgrade · ${selectedNodeDef.cost} ★`
                            : `Need ${selectedNodeDef.cost - availableStars} more ★`}
                    </button>

                    {canSellSelected && (
                      <button
                        type="button"
                        onClick={handleSell}
                        className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold tracking-wide transition-all inline-flex items-center justify-center gap-1.5 ${
                          isConfirmingSellThisNode
                            ? "border-red-500/60 bg-red-900/35 text-red-200 hover:bg-red-900/50"
                            : "border-stone-500/40 bg-stone-800/30 text-stone-300 hover:bg-stone-700/40 hover:border-stone-400/50"
                        }`}
                      >
                        <Undo2 size={12} />
                        {isConfirmingSellThisNode
                          ? `Confirm Sell · Refund ${sellRefund} ★`
                          : `Sell Tier ${selectedNode.tier} · +${sellRefund} ★`}
                      </button>
                    )}
                  </div>

                  {/* Upgrade celebration banner */}
                  {justUpgraded && (
                    <div
                      className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-2.5 text-center"
                      style={{ animation: "celebrateBounce 0.5s ease-out" }}
                    >
                      <div className="text-xs text-emerald-300 font-bold">
                        <SpellOrbIcon size={14} className="inline" />{" "}
                        {getSpellUpgradeNodes(justUpgraded.spellType)[
                          justUpgraded.tier - 1
                        ]?.title ?? `Tier ${justUpgraded.tier}`}{" "}
                        Unlocked!
                      </div>
                      <div className="text-[10px] text-emerald-400/60 mt-0.5">
                        {SPELL_DATA[justUpgraded.spellType].name} upgraded to Lv{" "}
                        {justUpgraded.tier}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Mobile sticky action footer ── */}
              <div
                className="lg:hidden shrink-0 border-t border-amber-800/25 px-3 pt-2 pb-3"
                style={{ background: "rgba(16, 12, 10, 0.95)" }}
              >
                {/* Celebration banner */}
                {justUpgraded && (
                  <div
                    className="mb-2 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1.5 text-center"
                    style={{ animation: "celebrateBounce 0.5s ease-out" }}
                  >
                    <div className="text-[11px] text-emerald-300 font-bold">
                      <SpellOrbIcon size={13} className="inline" />{" "}
                      {getSpellUpgradeNodes(justUpgraded.spellType)[
                        justUpgraded.tier - 1
                      ]?.title ?? `Tier ${justUpgraded.tier}`}{" "}
                      Unlocked!
                    </div>
                  </div>
                )}

                {/* Status line */}
                <div
                  className={`rounded-md border px-2.5 py-1.5 text-[11px] flex items-center gap-1.5 mb-2 ${
                    selectedState === "unlocked"
                      ? "border-emerald-500/30 bg-emerald-950/30"
                      : selectedState === "next"
                        ? "border-yellow-500/30 bg-yellow-950/30"
                        : "border-stone-600/30 bg-stone-950/40"
                  }`}
                >
                  {selectedState === "unlocked" && (
                    <>
                      <Check size={11} className="text-emerald-400 shrink-0" />
                      <span className="text-emerald-300">
                        {canSellSelected
                          ? "Sell to recover stars"
                          : "Already unlocked"}
                      </span>
                    </>
                  )}
                  {selectedState === "next" && (
                    <>
                      <Star size={11} className="text-yellow-400 shrink-0" />
                      <span className="text-yellow-200">
                        {canBuySelected
                          ? "Ready to upgrade!"
                          : `Need ${selectedNodeDef.cost - availableStars} more ★`}
                      </span>
                    </>
                  )}
                  {selectedState === "locked" && (
                    <>
                      <Lock size={11} className="text-stone-400 shrink-0" />
                      <span className="text-stone-300">
                        Upgrade previous tiers first
                      </span>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={!canBuySelected}
                    className={`flex-1 rounded-md border px-3 py-2.5 text-[13px] font-bold uppercase tracking-wide transition-all ${
                      canBuySelected
                        ? "border-yellow-500/60 bg-yellow-700/30 text-yellow-100 active:bg-yellow-700/50"
                        : "border-stone-600/40 bg-stone-800/40 text-stone-500 cursor-not-allowed"
                    }`}
                  >
                    {selectedState === "unlocked"
                      ? "Unlocked"
                      : selectedState === "locked"
                        ? "Tier Locked"
                        : canBuySelected
                          ? `Upgrade · ${selectedNodeDef.cost} ★`
                          : `Need ${selectedNodeDef.cost - availableStars} more ★`}
                  </button>
                  {canSellSelected && (
                    <button
                      type="button"
                      onClick={handleSell}
                      className={`shrink-0 rounded-md border px-3 py-2.5 text-[11px] font-semibold tracking-wide transition-all inline-flex items-center gap-1 ${
                        isConfirmingSellThisNode
                          ? "border-red-500/60 bg-red-900/35 text-red-200 active:bg-red-900/50"
                          : "border-stone-500/40 bg-stone-800/30 text-stone-300 active:bg-stone-700/40"
                      }`}
                    >
                      <Undo2 size={11} />
                      {isConfirmingSellThisNode
                        ? `Confirm · ${sellRefund} ★`
                        : `Sell · +${sellRefund} ★`}
                    </button>
                  )}
                </div>
              </div>
            </OrnateFrame>
          </div>
        </div>
      </OrnateFrame>
    </BaseModal>
  );
};
