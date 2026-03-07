"use client";

import React from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Check,
  CircleDot,
  Clock,
  Coins,
  Crosshair,
  Crown,
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
  Users,
  X,
  Zap,
} from "lucide-react";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import {
  SPELL_DATA,
  SPELL_OPTIONS,
  SPELL_TOTAL_MAX_UPGRADE_STARS,
  MAX_SPELL_UPGRADE_LEVEL,
  getSpellUpgradeNodes,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getPaydaySpellStats,
  getReinforcementSpellStats,
} from "../../constants";
import { SpellSprite } from "../../sprites";
import { OrnateFrame } from "./OrnateFrame";

// ── Types ──────────────────────────────────────────────────────────────────

interface SpellUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStars: number;
  totalStarsEarned: number;
  spentStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  onUpgradeSpell: (spellType: SpellType) => void;
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
    glow: "#fb923c",
    boardBg: "linear-gradient(180deg, rgba(78,36,18,0.55), rgba(28,14,10,0.72))",
    connector: "#f97316",
  },
  lightning: {
    accent: "#facc15",
    glow: "#fde047",
    boardBg: "linear-gradient(180deg, rgba(80,60,20,0.54), rgba(20,16,22,0.72))",
    connector: "#facc15",
  },
  freeze: {
    accent: "#22d3ee",
    glow: "#67e8f9",
    boardBg: "linear-gradient(180deg, rgba(24,62,80,0.56), rgba(12,22,44,0.74))",
    connector: "#22d3ee",
  },
  payday: {
    accent: "#f59e0b",
    glow: "#fcd34d",
    boardBg: "linear-gradient(180deg, rgba(76,56,18,0.55), rgba(26,20,10,0.72))",
    connector: "#f59e0b",
  },
  reinforcements: {
    accent: "#34d399",
    glow: "#6ee7b7",
    boardBg: "linear-gradient(180deg, rgba(16,70,50,0.56), rgba(10,24,16,0.74))",
    connector: "#34d399",
  },
};

const LEVEL_ICON_MAP: Record<number, { Icon: LucideIcon; label: string }> = {
  1: { Icon: CircleDot, label: "Initiate" },
  2: { Icon: Shield, label: "Bulwark" },
  3: { Icon: Swords, label: "Surge" },
  4: { Icon: Sparkles, label: "Apex" },
  5: { Icon: Crown, label: "Mastery" },
};

const UPGRADE_ICON_MAP: Record<string, LucideIcon> = {
  "fireball-1": Flame,
  "fireball-2": Crosshair,
  "fireball-3": Clock,
  "fireball-4": Zap,
  "fireball-5": Crown,

  "lightning-1": GitBranch,
  "lightning-2": Crosshair,
  "lightning-3": Clock,
  "lightning-4": Link2,
  "lightning-5": Zap,

  "freeze-1": Clock,
  "freeze-2": Snowflake,
  "freeze-3": Zap,
  "freeze-4": Shield,
  "freeze-5": Globe,

  "payday-1": Banknote,
  "payday-2": TrendingUp,
  "payday-3": Clock,
  "payday-4": Gem,
  "payday-5": Crown,

  "reinforcements-1": Swords,
  "reinforcements-2": Heart,
  "reinforcements-3": Flag,
  "reinforcements-4": Shield,
  "reinforcements-5": Target,
};

const UPGRADE_TAGS: Record<string, UpgradeTag[]> = {
  "fireball-1": [
    { label: "+15 Meteor Damage", icon: Flame, accent: "#fb923c" },
  ],
  "fireball-2": [
    { label: "+2 Meteors", icon: Flame, accent: "#fb923c" },
    { label: "Manual Targeting", icon: Crosshair, accent: "#fbbf24", special: true },
  ],
  "fireball-3": [
    { label: "+1s Burn Duration", icon: Clock, accent: "#fb923c" },
  ],
  "fireball-4": [
    { label: "+15 Meteor Damage", icon: Zap, accent: "#fb923c" },
    { label: "Armor Piercing", icon: Shield, accent: "#f87171", special: true },
  ],
  "fireball-5": [
    { label: "+3 Meteors", icon: Crown, accent: "#fb923c" },
  ],

  "lightning-1": [
    { label: "+2 Chain Bolts", icon: GitBranch, accent: "#fde047" },
  ],
  "lightning-2": [
    { label: "+120 Total Damage", icon: Zap, accent: "#fde047" },
    { label: "Manual Targeting", icon: Crosshair, accent: "#fbbf24", special: true },
  ],
  "lightning-3": [
    { label: "+0.25s Stun per Arc", icon: Clock, accent: "#fde047" },
  ],
  "lightning-4": [
    { label: "+2 Chain Bolts", icon: Link2, accent: "#fde047" },
  ],
  "lightning-5": [
    { label: "+120 Damage", icon: Zap, accent: "#fde047" },
    { label: "+0.35s Stun", icon: Clock, accent: "#fde047" },
  ],

  "freeze-1": [
    { label: "+0.6s Freeze", icon: Clock, accent: "#67e8f9" },
  ],
  "freeze-2": [
    { label: "+0.6s Freeze", icon: Snowflake, accent: "#67e8f9" },
  ],
  "freeze-3": [
    { label: "+0.6s Freeze", icon: Zap, accent: "#67e8f9" },
  ],
  "freeze-4": [
    { label: "+0.6s Freeze", icon: Shield, accent: "#67e8f9" },
  ],
  "freeze-5": [
    { label: "+0.6s Freeze", icon: Snowflake, accent: "#67e8f9" },
    { label: "Full Map Lockdown", icon: Globe, accent: "#06b6d4", special: true },
  ],

  "payday-1": [
    { label: "+10 Base Payout", icon: Banknote, accent: "#fcd34d" },
  ],
  "payday-2": [
    { label: "+2 per Enemy", icon: TrendingUp, accent: "#fcd34d" },
    { label: "+15 Max Bonus", icon: Gem, accent: "#fcd34d" },
  ],
  "payday-3": [
    { label: "+2s Aura Duration", icon: Clock, accent: "#fcd34d" },
  ],
  "payday-4": [
    { label: "+10 Base Payout", icon: Gem, accent: "#fcd34d" },
  ],
  "payday-5": [
    { label: "+2 per Enemy", icon: TrendingUp, accent: "#fcd34d" },
    { label: "+3s Aura Duration", icon: Clock, accent: "#fcd34d" },
  ],

  "reinforcements-1": [
    { label: "+10 Knight Damage", icon: Swords, accent: "#6ee7b7" },
  ],
  "reinforcements-2": [
    { label: "+150 Knight Health", icon: Heart, accent: "#6ee7b7" },
  ],
  "reinforcements-3": [
    { label: "+10 Knight Damage", icon: Flag, accent: "#6ee7b7" },
  ],
  "reinforcements-4": [
    { label: "+150 Knight Health", icon: Shield, accent: "#6ee7b7" },
  ],
  "reinforcements-5": [
    { label: "Ranged Formation", icon: Target, accent: "#a78bfa", special: true },
  ],
};

// ── Layout Constants ───────────────────────────────────────────────────────

const TILE_SIZE = 100;
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
  unlocked: {
    background: "rgba(16, 56, 36, 0.85)",
    borderColor: "rgba(74, 222, 128, 0.55)",
    textColor: "#bbf7d0",
  },
  next: {
    background: "rgba(90, 68, 20, 0.85)",
    borderColor: "rgba(250, 204, 21, 0.6)",
    textColor: "#fde68a",
  },
  locked: {
    background: "rgba(38, 34, 30, 0.78)",
    borderColor: "rgba(100, 93, 88, 0.35)",
    textColor: "#a8a29e",
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
`;

// ── Helper Functions ───────────────────────────────────────────────────────

const tierTop = (tier: number): number =>
  TILE_SIZE + CORE_GAP + (tier - 1) * (TILE_SIZE + TILE_GAP);

interface LabelLines {
  line1: string;
  line2: string;
  compact: boolean;
}

const splitSingleToken = (token: string): [string, string] => {
  if (token.length <= 11) return [token, ""];
  const midpoint = Math.ceil(token.length / 2);
  return [token.slice(0, midpoint), token.slice(midpoint)];
};

const toLabelLines = (rawText: string): LabelLines => {
  const text = rawText.trim().replace(/\s+/g, " ");
  if (!text) return { line1: "", line2: "", compact: false };

  const words = text.split(" ");
  if (words.length === 1) {
    const [line1, line2] = splitSingleToken(words[0]);
    return { line1, line2, compact: Math.max(line1.length, line2.length) >= 11 };
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
  return { line1, line2, compact: Math.max(line1.length, line2.length) >= 13 };
};

const getNodeState = (
  currentLevel: number,
  nodeTier: number,
): NodeState => {
  if (currentLevel >= nodeTier) return "unlocked";
  if (currentLevel + 1 === nodeTier) return "next";
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
  theme: SpellTheme,
): string => {
  if (selected)
    return `0 0 0 2px ${theme.glow}, 0 0 18px ${theme.glow}66`;
  if (state === "unlocked")
    return `inset 0 0 10px rgba(0,0,0,0.25), 0 0 6px rgba(74, 222, 128, 0.12)`;
  if (state === "next")
    return `inset 0 0 12px rgba(0,0,0,0.35), 0 0 0 2px rgba(250, 204, 21, 0.3), 0 0 8px rgba(250, 204, 21, 0.12)`;
  return `inset 0 0 14px rgba(0,0,0,0.45)`;
};

const renderConnector = (
  cx: number,
  fromY: number,
  toY: number,
  state: NodeState,
  accentColor: string,
  key: string,
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
        style={animate ? { animation: "connectorFlow 0.8s linear infinite" } : undefined}
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
  level: number,
): StatEntry[] => {
  switch (spellType) {
    case "fireball": {
      const s = getFireballSpellStats(level);
      return [
        { label: "Damage", value: `${s.damagePerMeteor}×${s.meteorCount}`, Icon: Swords, color: "text-red-300", bg: "rgba(127,29,29,0.3)", border: "rgba(127,29,29,0.2)" },
        { label: "Meteors", value: `${s.meteorCount}`, Icon: Flame, color: "text-orange-300", bg: "rgba(124,45,18,0.3)", border: "rgba(124,45,18,0.2)" },
        { label: "Radius", value: `${s.impactRadius}`, Icon: Target, color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)" },
        { label: "Burn", value: `${(s.burnDurationMs / 1000).toFixed(1)}s`, Icon: Flame, color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)" },
        { label: "Burn DPS", value: `${s.burnDamagePerSecond}/s`, Icon: Flame, color: "text-red-300", bg: "rgba(127,29,29,0.3)", border: "rgba(127,29,29,0.2)" },
        { label: "Fall Time", value: `${(s.fallDurationMs / 1000).toFixed(1)}s`, Icon: Timer, color: "text-stone-300", bg: "rgba(68,64,60,0.3)", border: "rgba(68,64,60,0.2)" },
      ];
    }
    case "lightning": {
      const s = getLightningSpellStats(level);
      return [
        { label: "Total DMG", value: `${s.totalDamage}`, Icon: Zap, color: "text-yellow-300", bg: "rgba(113,63,18,0.3)", border: "rgba(113,63,18,0.2)" },
        { label: "Chains", value: `${s.chainCount}`, Icon: GitBranch, color: "text-cyan-300", bg: "rgba(22,78,99,0.3)", border: "rgba(22,78,99,0.2)" },
        { label: "Stun", value: `${(s.stunDurationMs / 1000).toFixed(2)}s`, Icon: Timer, color: "text-blue-300", bg: "rgba(30,58,138,0.3)", border: "rgba(30,58,138,0.2)" },
      ];
    }
    case "freeze": {
      const s = getFreezeSpellStats(level);
      return [
        { label: "Duration", value: `${(s.freezeDurationMs / 1000).toFixed(1)}s`, Icon: Timer, color: "text-cyan-300", bg: "rgba(22,78,99,0.3)", border: "rgba(22,78,99,0.2)" },
        { label: "Range", value: "Global", Icon: Globe, color: "text-blue-300", bg: "rgba(30,58,138,0.3)", border: "rgba(30,58,138,0.2)" },
        { label: "Slow", value: "100%", Icon: Snowflake, color: "text-indigo-300", bg: "rgba(49,46,129,0.3)", border: "rgba(49,46,129,0.2)" },
      ];
    }
    case "payday": {
      const s = getPaydaySpellStats(level);
      return [
        { label: "Base PP", value: `${s.basePayout}`, Icon: Coins, color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)" },
        { label: "Per Enemy", value: `+${s.bonusPerEnemy}`, Icon: TrendingUp, color: "text-green-300", bg: "rgba(20,83,45,0.3)", border: "rgba(20,83,45,0.2)" },
        { label: "Max Bonus", value: `+${s.maxBonus}`, Icon: Gem, color: "text-yellow-300", bg: "rgba(113,63,18,0.3)", border: "rgba(113,63,18,0.2)" },
        { label: "Max Total", value: `${s.basePayout + s.maxBonus}`, Icon: Sparkles, color: "text-yellow-200", bg: "rgba(113,63,18,0.3)", border: "rgba(113,63,18,0.2)" },
        { label: "Aura", value: `${(s.auraDurationMs / 1000).toFixed(0)}s`, Icon: Timer, color: "text-amber-300", bg: "rgba(120,53,15,0.3)", border: "rgba(120,53,15,0.2)" },
      ];
    }
    case "reinforcements": {
      const s = getReinforcementSpellStats(level);
      const entries: StatEntry[] = [
        { label: "Knights", value: `${s.knightCount}`, Icon: Users, color: "text-emerald-300", bg: "rgba(6,78,59,0.3)", border: "rgba(6,78,59,0.2)" },
        { label: "HP Each", value: `${s.knightHp}`, Icon: Heart, color: "text-red-300", bg: "rgba(127,29,29,0.3)", border: "rgba(127,29,29,0.2)" },
        { label: "DMG Each", value: `${s.knightDamage}`, Icon: Swords, color: "text-orange-300", bg: "rgba(124,45,18,0.3)", border: "rgba(124,45,18,0.2)" },
        { label: "Atk Speed", value: `${(s.knightAttackSpeedMs / 1000).toFixed(1)}s`, Icon: Timer, color: "text-stone-300", bg: "rgba(68,64,60,0.3)", border: "rgba(68,64,60,0.2)" },
        { label: "Range", value: `${s.moveRadius}`, Icon: Target, color: "text-teal-300", bg: "rgba(13,148,136,0.2)", border: "rgba(13,148,136,0.15)" },
      ];
      if (s.rangedUnlocked) {
        entries.push({ label: "Ranged", value: `${s.rangedRange}`, Icon: Crosshair, color: "text-purple-300", bg: "rgba(88,28,135,0.3)", border: "rgba(88,28,135,0.2)" });
      }
      return entries;
    }
    default:
      return [];
  }
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
}) => {
  const [mounted, setMounted] = React.useState(false);
  const [selectedNode, setSelectedNode] = React.useState<SelectedNode>(() =>
    getDefaultSelection(spellUpgradeLevels),
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    setSelectedNode((current) => {
      const currentTier = Math.max(1, Math.min(MAX_SPELL_UPGRADE_LEVEL, current.tier));
      const nodes = getSpellUpgradeNodes(current.spellType);
      if (!nodes[currentTier - 1]) {
        return getDefaultSelection(spellUpgradeLevels);
      }
      return { spellType: current.spellType, tier: currentTier };
    });
  }, [isOpen, spellUpgradeLevels]);

  if (!isOpen || !mounted) return null;

  const columnCount = SPELL_OPTIONS.length;
  const boardWidth =
    columnCount * TILE_SIZE + (columnCount - 1) * TILE_GAP;
  const boardHeight =
    TILE_SIZE + CORE_GAP + MAX_SPELL_UPGRADE_LEVEL * (TILE_SIZE + TILE_GAP) - TILE_GAP;

  const selectedSpellLevel = spellUpgradeLevels[selectedNode.spellType] ?? 0;
  const selectedNodeDef =
    getSpellUpgradeNodes(selectedNode.spellType)[selectedNode.tier - 1];
  const selectedState = getNodeState(selectedSpellLevel, selectedNode.tier);
  const canBuySelected =
    selectedState === "next" && availableStars >= selectedNodeDef.cost;
  const selectedTheme = SPELL_THEMES[selectedNode.spellType];
  const selectedTags = getUpgradeTags(selectedNode.spellType, selectedNode.tier);
  const selectedSpellStats = getSpellStatsForDisplay(selectedNode.spellType, selectedSpellLevel);
  const selectedSpellData = SPELL_DATA[selectedNode.spellType];

  const modalContent = (
    <div className="fixed inset-0 z-[1300] isolate flex items-center justify-center p-2 sm:p-4 pointer-events-auto">
      <style>{ANIMATIONS_CSS}</style>

      <button
        type="button"
        aria-label="Close upgrades"
        className="absolute inset-0 bg-black/85"
        onClick={onClose}
      />

      <OrnateFrame
        className="relative z-10 w-full max-w-[1280px] max-h-[94vh] overflow-hidden rounded-2xl border border-amber-400/45"
        cornerSize={46}
        color="#d97706"
        glowColor="#fbbf24"
      >
        {/* ── Header ── */}
        <div className="sticky top-0 z-20 border-b border-amber-700/25 bg-stone-950/95 px-4 sm:px-6 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles size={16} />
              <h2 className="text-lg sm:text-xl font-extrabold tracking-wide">
                Spell Upgrades
              </h2>
            </div>
            <div className="flex items-center gap-4">
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
                className="inline-flex items-center justify-center rounded-lg border border-amber-500/30 bg-amber-900/20 p-2 text-amber-200 hover:bg-amber-800/30"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="mt-3 flex sm:hidden flex-wrap items-center gap-2 text-xs">
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
        </div>

        {/* ── Main Content ── */}
        <div className="h-[calc(94vh-148px)] overflow-y-auto overscroll-y-contain">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_332px]">
            {/* ── Grid Panel ── */}
            <OrnateFrame
              className="rounded-2xl border border-amber-700/25"
              cornerSize={34}
              color="#a16207"
              glowColor="#fbbf24"
            >
              <div className="p-3 sm:p-4" style={{ background: "rgba(16, 12, 10, 0.86)" }}>
                <div className="mb-3 flex items-center justify-end gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-200/60">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400/90" />
                    <span>Unlocked</span>
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-yellow-400/90" />
                    <span>Next</span>
                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-stone-600" />
                    <span>Locked</span>
                  </div>
                </div>

                <div className="pb-2">
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
                        style={{ top: TILE_SIZE / 2 - 7 }}
                      >
                        Base
                      </div>
                      {[1, 2, 3, 4, 5].map((tier) => (
                        <div
                          key={tier}
                          className="absolute right-0 text-right text-[10px] font-semibold text-amber-300/65"
                          style={{ top: tierTop(tier) + TILE_SIZE / 2 - 7 }}
                        >
                          Tier {tier}
                        </div>
                      ))}
                    </div>

                    {/* Board area */}
                    <div
                      className="relative"
                      style={{
                        marginLeft: LABEL_WIDTH + 10,
                        width: boardWidth,
                        height: boardHeight,
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
                            colIndex * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

                          const segments: React.ReactNode[] = [];

                          segments.push(
                            renderConnector(
                              cx,
                              TILE_SIZE,
                              tierTop(1),
                              getNodeState(spellLevel, 1),
                              theme.connector,
                              `${spellType}-c-1`,
                            ),
                          );

                          for (let t = 1; t < MAX_SPELL_UPGRADE_LEVEL; t++) {
                            segments.push(
                              renderConnector(
                                cx,
                                tierTop(t) + TILE_SIZE,
                                tierTop(t + 1),
                                getNodeState(spellLevel, t + 1),
                                theme.connector,
                                `${spellType}-${t}-${t + 1}`,
                              ),
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
                        const left = colIndex * (TILE_SIZE + TILE_GAP);

                        return (
                          <button
                            key={`${spellType}-core`}
                            type="button"
                            onClick={() =>
                              setSelectedNode({
                                spellType,
                                tier: Math.max(
                                  1,
                                  Math.min(MAX_SPELL_UPGRADE_LEVEL, spellLevel + 1),
                                ),
                              })
                            }
                            className="absolute rounded-xl border transition-all hover:brightness-110"
                            style={{
                              top: 0,
                              left,
                              width: TILE_SIZE,
                              height: TILE_SIZE,
                              background: theme.boardBg,
                              borderColor: `${theme.accent}8a`,
                              boxShadow: `inset 0 0 14px rgba(0,0,0,0.35), 0 0 10px ${theme.glow}33`,
                            }}
                            title={spellData.name}
                          >
                            <div className="flex h-full flex-col items-center px-1.5 py-1.5">
                              <div
                                className="text-[10px] font-bold text-center leading-tight truncate w-full"
                                style={{ color: theme.glow, textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
                              >
                                {spellData.name}
                              </div>
                              <div className="flex-1 flex items-center justify-center">
                                <SpellSprite type={spellType} size={38} animated />
                              </div>
                              <div className="w-full text-center">
                                <div
                                  className="text-[9px] text-amber-200/45"
                                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                                >
                                  {Math.round(spellData.cooldown / 1000)}s cooldown
                                </div>
                                <div className="flex justify-center gap-[3px] mt-1">
                                  {Array.from(
                                    { length: MAX_SPELL_UPGRADE_LEVEL },
                                    (_, i) => (
                                      <div
                                        key={i}
                                        className="rounded-full"
                                        style={{
                                          width: 5,
                                          height: 5,
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
                                        }}
                                      />
                                    ),
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
                          const left = colIndex * (TILE_SIZE + TILE_GAP);
                          const state = getNodeState(spellLevel, node.level);
                          const selected =
                            selectedNode.spellType === spellType &&
                            selectedNode.tier === node.level;
                          const TierIcon = LEVEL_ICON_MAP[node.level].Icon;
                          const UpgradeIcon = getUpgradeIcon(spellType, node.level);
                          const nodeTitle = toLabelLines(node.title);
                          const visuals = NODE_VISUALS[state];

                          return (
                            <button
                              key={`${spellType}-${node.level}`}
                              type="button"
                              onClick={() =>
                                setSelectedNode({ spellType, tier: node.level })
                              }
                              className="absolute rounded-xl border text-left transition-all hover:brightness-110"
                              style={{
                                top,
                                left,
                                width: TILE_SIZE,
                                height: TILE_SIZE,
                                background: visuals.background,
                                borderColor: visuals.borderColor,
                                borderStyle: state === "next" ? "dashed" : "solid",
                                boxShadow: getNodeBoxShadow(state, selected, theme),
                                transform: selected ? "translateY(-1px)" : undefined,
                                animation:
                                  state === "next" && !selected
                                    ? "spellNodePulse 2.5s ease-in-out infinite"
                                    : undefined,
                              }}
                            >
                              <div className="flex h-full flex-col p-1.5">
                                {/* Header: tier badge + state indicator */}
                                <div className="flex items-center justify-between gap-0.5">
                                  <div
                                    className="inline-flex items-center gap-0.5 rounded border px-1 py-0.5 text-[9px] font-bold"
                                    style={{
                                      borderColor: visuals.borderColor,
                                      color: visuals.textColor,
                                      background: "rgba(8,8,10,0.4)",
                                    }}
                                  >
                                    <TierIcon size={9} />
                                    {node.level}
                                  </div>
                                  {state === "unlocked" && (
                                    <div
                                      className="inline-flex items-center justify-center rounded-full"
                                      style={{
                                        width: 17,
                                        height: 17,
                                        background: "rgba(34, 197, 94, 0.2)",
                                        border: "1.5px solid rgba(74, 222, 128, 0.65)",
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
                                    <Lock size={11} className="text-stone-500/70" />
                                  )}
                                </div>

                                {/* Spell sprite with corner upgrade icon */}
                                <div className=" flex justify-center">
                                  <div
                                    className="relative h-10 w-10 rounded-md border flex items-center justify-center"
                                    style={{
                                      borderColor:
                                        state === "locked"
                                          ? "rgba(100,93,88,0.25)"
                                          : `${theme.glow}44`,
                                      background: "rgba(0,0,0,0.36)",
                                      opacity: state === "locked" ? 0.4 : 1,
                                    }}
                                  >
                                    <SpellSprite type={spellType} size={26} animated={false} />
                                    <div
                                      className="absolute -bottom-1 -right-1 z-10 flex items-center justify-center rounded-full"
                                      style={{
                                        width: 18,
                                        height: 18,
                                        background: "rgba(0,0,0,0.75)",
                                        border: `1.5px solid ${state === "locked" ? "rgba(100,93,88,0.4)" : theme.glow + "55"}`,
                                      }}
                                    >
                                      <UpgradeIcon
                                        size={10}
                                        style={{
                                          color: state === "locked" ? "#78716c" : theme.glow,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Title label */}
                                <div
                                  className={`mt-1 flex flex-col items-center justify-center text-center font-bold leading-[1.15] ${nodeTitle.compact
                                    ? "text-[8.5px]"
                                    : "text-[10px]"
                                    }`}
                                  style={{
                                    color: state === "locked" ? "#a8a29e" : theme.glow,
                                    textShadow: state === "locked"
                                      ? "0 1px 2px rgba(0,0,0,0.6)"
                                      : `0 0 6px ${theme.glow}55, 0 1px 2px rgba(0,0,0,0.8)`,
                                    opacity: state === "locked" ? 0.5 : 1,
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

            {/* ── Detail Panel ── */}
            <OrnateFrame
              className="rounded-2xl border border-amber-700/25"
              cornerSize={30}
              color={selectedTheme.accent}
              glowColor={selectedTheme.glow}
            >
              <div
                className="h-full p-3 sm:p-4"
                style={{ background: "rgba(20, 14, 10, 0.9)" }}
              >
                {/* Spell identity */}
                <div className="rounded-xl border border-amber-700/25 bg-amber-950/30 p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-14 w-14 rounded-lg border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: `${selectedTheme.glow}66`,
                        background: selectedTheme.boardBg,
                      }}
                    >
                      <SpellSprite
                        type={selectedNode.spellType}
                        size={36}
                        animated
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-amber-100 leading-tight truncate">
                        {selectedSpellData.name}
                      </div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-900/25 px-1.5 py-0.5 text-[10px] text-amber-200">
                          Lv {selectedSpellLevel}/{MAX_SPELL_UPGRADE_LEVEL}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]"
                          style={{ borderColor: 'rgba(120,80,20,0.25)', background: 'rgba(120,80,20,0.15)', color: '#fcd34d' }}>
                          <Coins size={9} />
                          {selectedSpellData.cost > 0 ? `${selectedSpellData.cost} PP` : "Free"}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px]"
                          style={{ borderColor: 'rgba(30,58,138,0.25)', background: 'rgba(30,58,138,0.15)', color: '#93c5fd' }}>
                          <Clock size={9} />
                          {selectedSpellData.cooldown / 1000}s
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spell stats */}
                <div className="mt-3 rounded-xl border border-stone-700/45 bg-stone-900/50 p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70 mb-2">
                    Spell Stats
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selectedSpellStats.map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-md px-1.5 py-1.5 text-center"
                        style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
                      >
                        <div className="flex items-center justify-center mb-0.5">
                          <stat.Icon size={11} className={stat.color} />
                        </div>
                        <div className="text-[7px] text-stone-400 font-medium uppercase">{stat.label}</div>
                        <div className={`font-bold text-[12px] leading-tight ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tier upgrade tags */}
                <div className="mt-3 rounded-xl border border-stone-700/45 bg-stone-900/50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-amber-300/70">
                      Tier {selectedNode.tier} Upgrade
                    </div>
                    <span className="text-[10px] text-amber-300/45 font-medium">
                      {LEVEL_ICON_MAP[selectedNode.tier].label}
                    </span>
                  </div>
                  {selectedTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTags.map((tag, i) =>
                        tag.special ? (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-bold"
                            style={{
                              borderColor: `${tag.accent}55`,
                              background: `${tag.accent}18`,
                              boxShadow: `0 0 10px ${tag.accent}15`,
                            }}
                          >
                            <Sparkles size={11} style={{ color: tag.accent }} />
                            <span style={{ color: "#fef9c3" }}>{tag.label}</span>
                          </div>
                        ) : (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold"
                            style={{
                              borderColor: `${tag.accent}35`,
                              background: `${tag.accent}12`,
                              color: tag.accent,
                            }}
                          >
                            <tag.icon size={10} />
                            {tag.label}
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-stone-500 italic">No tags available</div>
                  )}
                </div>

                {/* Cost & progress row */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 px-2.5 py-2 text-yellow-200">
                    <div className="text-[10px] uppercase text-yellow-300/70 font-medium">
                      Upgrade Cost
                    </div>
                    <div className="mt-0.5 font-bold inline-flex items-center gap-1">
                      <Star
                        size={11}
                        className="fill-yellow-300 text-yellow-300"
                      />
                      {selectedNodeDef.cost} stars
                    </div>
                  </div>
                  <div className="rounded-lg border border-stone-500/30 bg-stone-900/40 px-2.5 py-2 text-stone-200">
                    <div className="text-[10px] uppercase text-stone-400/80 font-medium">
                      Progress
                    </div>
                    <div className="mt-0.5 font-bold">
                      {selectedSpellLevel} / {MAX_SPELL_UPGRADE_LEVEL}
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div
                  className={`mt-3 rounded-lg border px-3 py-2 text-xs flex items-center gap-2 ${selectedState === "unlocked"
                    ? "border-emerald-500/30 bg-emerald-950/30"
                    : selectedState === "next"
                      ? "border-yellow-500/30 bg-yellow-950/30"
                      : "border-stone-600/30 bg-stone-950/40"
                    }`}
                >
                  {selectedState === "unlocked" && (
                    <>
                      <Check size={13} className="text-emerald-400 shrink-0" />
                      <span className="text-emerald-300">
                        Already unlocked for this spell.
                      </span>
                    </>
                  )}
                  {selectedState === "next" && (
                    <>
                      <Star size={13} className="text-yellow-400 shrink-0" />
                      <span className="text-yellow-200">
                        {canBuySelected
                          ? "Ready to upgrade!"
                          : `Need ${selectedNodeDef.cost - availableStars} more star${selectedNodeDef.cost - availableStars === 1 ? "" : "s"}.`}
                      </span>
                    </>
                  )}
                  {selectedState === "locked" && (
                    <>
                      <Lock size={13} className="text-stone-400 shrink-0" />
                      <span className="text-stone-300">
                        Upgrade previous tiers first.
                      </span>
                    </>
                  )}
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => {
                    if (!canBuySelected) return;
                    onUpgradeSpell(selectedNode.spellType);
                  }}
                  disabled={!canBuySelected}
                  className={`mt-3 w-full rounded-lg border px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-all ${canBuySelected
                    ? "border-yellow-500/60 bg-yellow-700/30 text-yellow-100 hover:bg-yellow-700/45 hover:border-yellow-400/70"
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
              </div>
            </OrnateFrame>
          </div>
        </div>
      </OrnateFrame>
    </div>
  );

  return createPortal(modalContent, document.body);
};
