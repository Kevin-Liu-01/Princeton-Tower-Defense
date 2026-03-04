"use client";

import React from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import {
  CircleDot,
  Coins,
  Crown,
  Lock,
  Shield,
  Sparkles,
  Star,
  Swords,
  X,
} from "lucide-react";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import {
  SPELL_DATA,
  SPELL_OPTIONS,
  SPELL_TOTAL_MAX_UPGRADE_STARS,
  MAX_SPELL_UPGRADE_LEVEL,
  getSpellUpgradeNodes,
} from "../../constants";
import { SpellSprite } from "../../sprites";
import { OrnateFrame } from "./OrnateFrame";

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

const SPELL_THEMES: Record<SpellType, SpellTheme> = {
  fireball: {
    accent: "#f97316",
    glow: "#fb923c",
    boardBg: "linear-gradient(180deg, rgba(78,36,18,0.55), rgba(28,14,10,0.72))",
    connector: "rgba(249, 115, 22, 0.45)",
  },
  lightning: {
    accent: "#facc15",
    glow: "#fde047",
    boardBg: "linear-gradient(180deg, rgba(80,60,20,0.54), rgba(20,16,22,0.72))",
    connector: "rgba(250, 204, 21, 0.42)",
  },
  freeze: {
    accent: "#22d3ee",
    glow: "#67e8f9",
    boardBg: "linear-gradient(180deg, rgba(24,62,80,0.56), rgba(12,22,44,0.74))",
    connector: "rgba(34, 211, 238, 0.4)",
  },
  payday: {
    accent: "#f59e0b",
    glow: "#fcd34d",
    boardBg: "linear-gradient(180deg, rgba(76,56,18,0.55), rgba(26,20,10,0.72))",
    connector: "rgba(245, 158, 11, 0.43)",
  },
  reinforcements: {
    accent: "#34d399",
    glow: "#6ee7b7",
    boardBg: "linear-gradient(180deg, rgba(16,70,50,0.56), rgba(10,24,16,0.74))",
    connector: "rgba(52, 211, 153, 0.4)",
  },
};

const LEVEL_ICON_MAP: Record<number, { Icon: LucideIcon; label: string }> = {
  1: { Icon: CircleDot, label: "Initiate" },
  2: { Icon: Shield, label: "Bulwark" },
  3: { Icon: Swords, label: "Surge" },
  4: { Icon: Sparkles, label: "Apex" },
  5: { Icon: Crown, label: "Mastery" },
};

const TILE_SIZE = 104;
const TILE_GAP = 12;
const ROOT_GAP = 18;
const ROOT_SIZE = TILE_SIZE;

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
    return {
      line1,
      line2,
      compact: Math.max(line1.length, line2.length) >= 11,
    };
  }

  let bestSplitIndex = 1;
  let bestPenalty = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i += 1) {
    const line1 = words.slice(0, i).join(" ");
    const line2 = words.slice(i).join(" ");
    const lengthDelta = Math.abs(line1.length - line2.length);
    const overflowPenalty =
      Math.max(0, line1.length - 13) * 5 + Math.max(0, line2.length - 13) * 5;
    const penalty = lengthDelta + overflowPenalty;
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestSplitIndex = i;
    }
  }

  const line1 = words.slice(0, bestSplitIndex).join(" ");
  const line2 = words.slice(bestSplitIndex).join(" ");
  return {
    line1,
    line2,
    compact: Math.max(line1.length, line2.length) >= 13,
  };
};

const getNodeState = (
  currentLevel: number,
  nodeTier: number
): "unlocked" | "next" | "locked" => {
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

  return {
    spellType: SPELL_OPTIONS[0],
    tier: MAX_SPELL_UPGRADE_LEVEL,
  };
};

const tierRowFromTop = (tier: number): number => MAX_SPELL_UPGRADE_LEVEL - tier;

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
    getDefaultSelection(spellUpgradeLevels)
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
  const tierRows = MAX_SPELL_UPGRADE_LEVEL;
  const boardWidth = columnCount * TILE_SIZE + (columnCount - 1) * TILE_GAP;
  const rootRowTop = tierRows * (TILE_SIZE + TILE_GAP) + ROOT_GAP;
  const boardHeight = rootRowTop + ROOT_SIZE;

  const selectedSpellLevel = spellUpgradeLevels[selectedNode.spellType] ?? 0;
  const selectedNodeDef = getSpellUpgradeNodes(selectedNode.spellType)[selectedNode.tier - 1];
  const selectedState = getNodeState(selectedSpellLevel, selectedNode.tier);
  const canBuySelected =
    selectedState === "next" && availableStars >= selectedNodeDef.cost;
  const selectedTheme = SPELL_THEMES[selectedNode.spellType];

  const modalContent = (
    <div className="fixed inset-0 z-[1300] isolate flex items-center justify-center p-2 sm:p-4 pointer-events-auto">
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
        <div className="sticky top-0 z-20 border-b border-amber-700/25 bg-stone-950/95 px-4 sm:px-6 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles size={16} />
                <h2 className="text-lg sm:text-xl font-extrabold tracking-wide">
                  Spell Tech Tree
                </h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-amber-200/75">
                Board view tech map with tiered unlock paths. Total full tree cost: {" "}
                {SPELL_TOTAL_MAX_UPGRADE_STARS} stars.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg border border-amber-500/30 bg-amber-900/20 p-2 text-amber-200 hover:bg-amber-800/30"
            >
              <X size={16} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <div className="rounded-lg border border-yellow-500/35 bg-yellow-900/20 px-2.5 py-1 text-yellow-200 font-semibold inline-flex items-center gap-1.5">
              <Star size={14} className="fill-yellow-300 text-yellow-300" />
              Available: {availableStars}
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/35 px-2.5 py-1 text-amber-200 inline-flex items-center gap-1.5">
              <Coins size={13} />
              Spent: {spentStars}
            </div>
            <div className="rounded-lg border border-stone-500/35 bg-stone-900/60 px-2.5 py-1 text-stone-200">
              Earned: {totalStarsEarned}
            </div>
          </div>
        </div>

        <div className="h-[calc(94vh-148px)] overflow-y-auto p-3 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_332px]">
            <OrnateFrame
              className="rounded-2xl border border-amber-700/25"
              cornerSize={34}
              color="#a16207"
              glowColor="#fbbf24"
            >
              <div className="p-3 sm:p-4" style={{ background: "rgba(16, 12, 10, 0.86)" }}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
                    Arcane Grid
                  </div>
                  <div className="text-[11px] text-amber-200/70">
                    Select a tile to inspect and upgrade
                  </div>
                </div>

                <div className="overflow-x-auto pb-2">
                  <div className="relative mx-auto" style={{ width: boardWidth + 74 }}>
                    <div className="absolute left-0 top-0 w-16 text-right text-[10px] font-semibold text-amber-300/70">
                      {[5, 4, 3, 2, 1].map((tier) => {
                        const y = tierRowFromTop(tier) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 - 7;
                        return (
                          <div key={tier} className="absolute right-0" style={{ top: y }}>
                            Tier {tier}
                          </div>
                        );
                      })}
                      <div
                        className="absolute right-0 text-amber-200/60"
                        style={{ top: rootRowTop + ROOT_SIZE / 2 - 7 }}
                      >
                        Core
                      </div>
                    </div>

                    <div className="relative ml-[74px]" style={{ width: boardWidth, height: boardHeight }}>
                      <svg
                        className="absolute inset-0 pointer-events-none"
                        viewBox={`0 0 ${boardWidth} ${boardHeight}`}
                        preserveAspectRatio="none"
                      >
                        {SPELL_OPTIONS.map((spellType, colIndex) => {
                          const theme = SPELL_THEMES[spellType];
                          const x = colIndex * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

                          const tierLines = Array.from({ length: MAX_SPELL_UPGRADE_LEVEL - 1 }, (_, i) => {
                            const fromTier = i + 1;
                            const toTier = i + 2;
                            const y1 =
                              tierRowFromTop(fromTier) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;
                            const y2 =
                              tierRowFromTop(toTier) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

                            return (
                              <line
                                key={`${spellType}-line-${fromTier}`}
                                x1={x}
                                y1={y1}
                                x2={x}
                                y2={y2}
                                stroke={theme.connector}
                                strokeWidth={2}
                                strokeLinecap="round"
                              />
                            );
                          });

                          const rootY = rootRowTop + ROOT_SIZE / 2;
                          const tier1Y = tierRowFromTop(1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;

                          return (
                            <React.Fragment key={`${spellType}-connectors`}>
                              {tierLines}
                              <line
                                x1={x}
                                y1={rootY}
                                x2={x}
                                y2={tier1Y}
                                stroke={theme.connector}
                                strokeWidth={2}
                                strokeLinecap="round"
                              />
                            </React.Fragment>
                          );
                        })}

                        {SPELL_OPTIONS.slice(0, -1).map((spellType, colIndex) => {
                          const rightSpell = SPELL_OPTIONS[colIndex + 1];
                          const theme = SPELL_THEMES[spellType];
                          const rightTheme = SPELL_THEMES[rightSpell];
                          const x1 = colIndex * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;
                          const x2 = (colIndex + 1) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2;
                          const yA =
                            tierRowFromTop(3) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 - 10;
                          const yB =
                            tierRowFromTop(4) * (TILE_SIZE + TILE_GAP) + TILE_SIZE / 2 + 12;

                          return (
                            <React.Fragment key={`${spellType}-cross`}> 
                              <line
                                x1={x1}
                                y1={yA}
                                x2={x2}
                                y2={yA}
                                stroke={theme.connector}
                                strokeWidth={1.2}
                                strokeLinecap="round"
                                opacity={0.7}
                              />
                              <line
                                x1={x1}
                                y1={yB}
                                x2={x2}
                                y2={yB}
                                stroke={rightTheme.connector}
                                strokeWidth={1.2}
                                strokeLinecap="round"
                                opacity={0.65}
                              />
                            </React.Fragment>
                          );
                        })}
                      </svg>

                      {SPELL_OPTIONS.map((spellType, colIndex) => {
                        const nodes = getSpellUpgradeNodes(spellType);
                        const spellLevel = spellUpgradeLevels[spellType] ?? 0;
                        const theme = SPELL_THEMES[spellType];

                        return nodes.map((node) => {
                          const rowIndex = tierRowFromTop(node.level);
                          const top = rowIndex * (TILE_SIZE + TILE_GAP);
                          const left = colIndex * (TILE_SIZE + TILE_GAP);
                          const state = getNodeState(spellLevel, node.level);
                          const selected =
                            selectedNode.spellType === spellType && selectedNode.tier === node.level;
                          const Icon = LEVEL_ICON_MAP[node.level].Icon;
                          const nodeTitle = toLabelLines(node.title);

                          const stateStyles =
                            state === "unlocked"
                              ? {
                                  background: "rgba(26, 66, 44, 0.82)",
                                  borderColor: "rgba(74, 222, 128, 0.6)",
                                  textColor: "#bbf7d0",
                                  titleColor: "#ecfdf5",
                                }
                              : state === "next"
                                ? {
                                    background: "rgba(94, 72, 24, 0.84)",
                                    borderColor: "rgba(250, 204, 21, 0.66)",
                                    textColor: "#fde68a",
                                    titleColor: "#fef9c3",
                                  }
                                : {
                                    background: "rgba(48, 42, 38, 0.78)",
                                    borderColor: "rgba(120, 113, 108, 0.48)",
                                    textColor: "#a8a29e",
                                    titleColor: "#d6d3d1",
                                  };

                          return (
                            <button
                              key={`${spellType}-${node.level}`}
                              type="button"
                              onClick={() => setSelectedNode({ spellType, tier: node.level })}
                              className="absolute rounded-xl border text-left transition-all hover:brightness-110"
                              style={{
                                top,
                                left,
                                width: TILE_SIZE,
                                height: TILE_SIZE,
                                background: stateStyles.background,
                                borderColor: stateStyles.borderColor,
                                boxShadow: selected
                                  ? `0 0 0 2px ${theme.glow}, 0 0 18px ${theme.glow}66`
                                  : `inset 0 0 12px rgba(0,0,0,0.35)`,
                                transform: selected ? "translateY(-1px)" : undefined,
                              }}
                            >
                              <div className="flex h-full flex-col p-1.5">
                                <div className="flex items-center justify-between gap-1">
                                  <div
                                    className="inline-flex items-center gap-1 rounded border px-1 py-0.5 text-[10px] font-semibold"
                                    style={{
                                      borderColor: stateStyles.borderColor,
                                      color: stateStyles.textColor,
                                      background: "rgba(8,8,10,0.35)",
                                    }}
                                  >
                                    <Icon size={10} />
                                    {node.level}
                                  </div>
                                  <div className="rounded border border-yellow-500/35 bg-yellow-900/45 px-1 py-0.5 text-[10px] font-semibold text-yellow-200">
                                    {node.cost}★
                                  </div>
                                </div>
                                <div className="mt-1 flex justify-center">
                                  <div
                                    className="h-11 w-11 rounded-md border flex items-center justify-center"
                                    style={{
                                      borderColor: `${theme.glow}88`,
                                      background: "rgba(0,0,0,0.36)",
                                    }}
                                  >
                                    <SpellSprite type={spellType} size={29} animated={state !== "locked"} />
                                  </div>
                                </div>
                                <div
                                  className="mt-1 h-[37px] rounded-md border px-1.5 py-1"
                                  style={{
                                    borderColor: `${stateStyles.borderColor}b0`,
                                    background: "rgba(10, 8, 8, 0.62)",
                                    color: stateStyles.titleColor,
                                    textShadow: "0 1px 2px rgba(0,0,0,0.82)",
                                  }}
                                  title={node.title}
                                >
                                  <div
                                    className={`flex h-full flex-col items-center justify-center text-center font-semibold leading-[1.02] ${
                                      nodeTitle.compact ? "text-[9px]" : "text-[10px]"
                                    }`}
                                  >
                                    <span>{nodeTitle.line1}</span>
                                    {nodeTitle.line2 ? <span>{nodeTitle.line2}</span> : null}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        });
                      })}

                      {SPELL_OPTIONS.map((spellType, colIndex) => {
                        const spellData = SPELL_DATA[spellType];
                        const spellLevel = spellUpgradeLevels[spellType] ?? 0;
                        const theme = SPELL_THEMES[spellType];
                        const left =
                          colIndex * (TILE_SIZE + TILE_GAP) +
                          (TILE_SIZE - ROOT_SIZE) / 2;
                        const coreTitle = toLabelLines(spellData.shortName);

                        return (
                          <button
                            key={`${spellType}-core`}
                            type="button"
                            onClick={() =>
                              setSelectedNode({
                                spellType,
                                tier: Math.max(1, Math.min(MAX_SPELL_UPGRADE_LEVEL, spellLevel + 1)),
                              })
                            }
                            className="absolute rounded-xl border transition-all"
                            style={{
                              top: rootRowTop,
                              left,
                              width: ROOT_SIZE,
                              height: ROOT_SIZE,
                              background: theme.boardBg,
                              borderColor: `${theme.accent}8a`,
                              boxShadow: `inset 0 0 14px rgba(0,0,0,0.35), 0 0 10px ${theme.glow}33`,
                            }}
                            title={spellData.name}
                          >
                            <div className="grid h-full grid-rows-[1fr_auto] items-center px-2 pb-2.5 pt-2">
                              <div className="flex items-center justify-center">
                                <SpellSprite type={spellType} size={35} animated />
                              </div>
                              <div
                                className="h-[37px] w-full rounded-md border border-amber-600/40 bg-black/45 px-1 py-1 text-amber-100"
                                style={{
                                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                                }}
                              >
                                <div
                                  className={`flex h-full flex-col items-center justify-center gap-[1px] text-center font-semibold leading-[1.08] ${
                                    coreTitle.compact ? "text-[10px]" : "text-[11px]"
                                  }`}
                                >
                                  <span>{coreTitle.line1}</span>
                                  {coreTitle.line2 ? <span>{coreTitle.line2}</span> : null}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </OrnateFrame>

            <OrnateFrame
              className="rounded-2xl border border-amber-700/25"
              cornerSize={30}
              color={selectedTheme.accent}
              glowColor={selectedTheme.glow}
            >
              <div className="h-full p-3 sm:p-4" style={{ background: "rgba(20, 14, 10, 0.9)" }}>
                <div className="rounded-xl border border-amber-700/25 bg-amber-950/30 p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-lg border flex items-center justify-center"
                      style={{
                        borderColor: `${selectedTheme.glow}88`,
                        background: "rgba(0,0,0,0.35)",
                      }}
                    >
                      <SpellSprite type={selectedNode.spellType} size={34} animated />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-amber-100 leading-tight truncate">
                        {SPELL_DATA[selectedNode.spellType].name}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-900/25 px-1.5 py-0.5 text-[10px] text-amber-200">
                        {(() => {
                          const Icon = LEVEL_ICON_MAP[selectedNode.tier].Icon;
                          return <Icon size={10} />;
                        })()}
                        Tier {selectedNode.tier} · {LEVEL_ICON_MAP[selectedNode.tier].label}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-stone-700/45 bg-stone-900/65 p-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-amber-300/75">Upgrade</div>
                  <div className="mt-1 text-sm font-semibold text-amber-100">{selectedNodeDef.title}</div>
                  <div className="mt-2 text-xs leading-relaxed text-amber-200/80">{selectedNodeDef.description}</div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 px-2 py-1.5 text-yellow-200">
                      <div className="text-[10px] uppercase text-yellow-300/80">Cost</div>
                      <div className="font-semibold">{selectedNodeDef.cost} stars</div>
                    </div>
                    <div className="rounded-lg border border-cyan-500/30 bg-cyan-900/20 px-2 py-1.5 text-cyan-200">
                      <div className="text-[10px] uppercase text-cyan-300/80">Current</div>
                      <div className="font-semibold">Level {selectedSpellLevel}</div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-stone-600/40 bg-stone-950/50 px-2 py-1.5 text-xs">
                    {selectedState === "unlocked" && (
                      <span className="text-emerald-300">Already unlocked for this spell.</span>
                    )}
                    {selectedState === "next" && (
                      <span className="text-yellow-200">Next available upgrade tier.</span>
                    )}
                    {selectedState === "locked" && (
                      <span className="text-stone-300">
                        Locked. Upgrade previous tiers first.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!canBuySelected) return;
                    onUpgradeSpell(selectedNode.spellType);
                  }}
                  disabled={!canBuySelected}
                  className={`mt-3 w-full rounded-lg border px-3 py-2 text-sm font-bold uppercase tracking-wide transition-all ${
                    canBuySelected
                      ? "border-yellow-500/60 bg-yellow-700/30 text-yellow-100 hover:bg-yellow-700/40"
                      : "border-stone-600/45 bg-stone-800/45 text-stone-400"
                  }`}
                >
                  {selectedState === "unlocked"
                    ? "Unlocked"
                    : selectedState === "locked"
                      ? "Tier Locked"
                      : canBuySelected
                        ? `Buy Upgrade (${selectedNodeDef.cost} ★)`
                        : `Need ${selectedNodeDef.cost - availableStars} more ★`}
                </button>

                {!canBuySelected && selectedState === "next" && (
                  <div className="mt-2 text-[11px] text-stone-300/85 inline-flex items-center gap-1.5">
                    <Lock size={12} />
                    Need {selectedNodeDef.cost - availableStars} more star
                    {selectedNodeDef.cost - availableStars === 1 ? "" : "s"}.
                  </div>
                )}
              </div>
            </OrnateFrame>
          </div>
        </div>
      </OrnateFrame>
    </div>
  );

  return createPortal(modalContent, document.body);
};
