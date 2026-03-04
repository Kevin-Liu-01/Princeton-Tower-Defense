"use client";

import React from "react";
import { Coins, Lock, Sparkles, Star, X } from "lucide-react";
import type { SpellType, SpellUpgradeLevels } from "../../types";
import {
  SPELL_DATA,
  SPELL_OPTIONS,
  SPELL_TOTAL_MAX_UPGRADE_STARS,
  MAX_SPELL_UPGRADE_LEVEL,
  getSpellUpgradeNodes,
  getNextSpellUpgradeCost,
} from "../../constants";

interface SpellUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStars: number;
  totalStarsEarned: number;
  spentStars: number;
  spellUpgradeLevels: SpellUpgradeLevels;
  onUpgradeSpell: (spellType: SpellType) => void;
}

export const SpellUpgradeModal: React.FC<SpellUpgradeModalProps> = ({
  isOpen,
  onClose,
  availableStars,
  totalStarsEarned,
  spentStars,
  spellUpgradeLevels,
  onUpgradeSpell,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[240] flex items-center justify-center p-2 sm:p-4 pointer-events-auto">
      <button
        type="button"
        aria-label="Close upgrades"
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-amber-500/40 bg-gradient-to-b from-stone-950/95 to-black/95 text-amber-100 shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-amber-700/25 bg-stone-950/95 px-4 sm:px-6 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles size={16} />
                <h2 className="text-lg sm:text-xl font-extrabold tracking-wide">
                  Spell Tech Tree
                </h2>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-amber-200/75">
                Upgrade spells with stars. Total full tree cost:{" "}
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

        <div className="p-3 sm:p-5 space-y-4">
          {SPELL_OPTIONS.map((spellType) => {
            const spellData = SPELL_DATA[spellType];
            const nodes = getSpellUpgradeNodes(spellType);
            const level = spellUpgradeLevels[spellType] ?? 0;
            const nextCost = getNextSpellUpgradeCost(spellType, level);
            const maxed = level >= MAX_SPELL_UPGRADE_LEVEL;
            const canUpgrade = !maxed && availableStars >= nextCost;

            return (
              <div
                key={spellType}
                className="rounded-xl border border-amber-700/25 bg-gradient-to-r from-stone-900/75 to-stone-950/75 p-3 sm:p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{spellData.icon}</span>
                    <div>
                      <div className="font-bold text-amber-200 leading-tight">
                        {spellData.name}
                      </div>
                      <div className="text-[11px] text-amber-300/70">
                        Level {level}/{MAX_SPELL_UPGRADE_LEVEL}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onUpgradeSpell(spellType)}
                    disabled={!canUpgrade}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-all ${
                      canUpgrade
                        ? "border-yellow-500/50 bg-yellow-700/30 text-yellow-100 hover:bg-yellow-700/40"
                        : "border-stone-600/40 bg-stone-800/45 text-stone-400"
                    }`}
                  >
                    {maxed ? "Maxed" : `Upgrade (${nextCost} ★)`}
                  </button>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <div className="min-w-[560px] flex items-center gap-1.5 pb-1">
                    {nodes.map((node, index) => {
                      const unlocked = level >= node.level;
                      const activeNext = !unlocked && level + 1 === node.level;

                      return (
                        <React.Fragment key={node.level}>
                          <div className="flex-1 min-w-[100px]">
                            <div
                              className={`h-16 rounded-lg border p-2 ${
                                unlocked
                                  ? "border-emerald-500/45 bg-emerald-900/25"
                                  : activeNext
                                    ? "border-yellow-500/45 bg-yellow-900/20"
                                    : "border-stone-700/45 bg-stone-900/50"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span
                                  className={`font-bold ${
                                    unlocked
                                      ? "text-emerald-300"
                                      : activeNext
                                        ? "text-yellow-300"
                                        : "text-stone-400"
                                  }`}
                                >
                                  T{node.level}
                                </span>
                                <span className="text-amber-200/80">
                                  {node.cost}★
                                </span>
                              </div>
                              <div className="mt-1 text-[11px] font-semibold text-amber-100 leading-tight">
                                {node.title}
                              </div>
                              <div className="mt-1 text-[10px] text-amber-200/75 leading-tight">
                                {node.description}
                              </div>
                            </div>
                          </div>
                          {index < nodes.length - 1 && (
                            <div className="w-6 h-0.5 rounded-full bg-amber-500/35 shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {!maxed && !canUpgrade && (
                  <div className="mt-2 text-[11px] text-stone-300/85 inline-flex items-center gap-1.5">
                    <Lock size={12} />
                    Need {nextCost - availableStars} more star
                    {nextCost - availableStars === 1 ? "" : "s"}.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
