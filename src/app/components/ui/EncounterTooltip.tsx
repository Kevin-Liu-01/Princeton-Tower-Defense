"use client";

import React, { useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  Skull,
  Check,
  Heart,
  Zap,
  ShieldAlert,
  Wind,
  Feather,
  Swords,
  Crown,
} from "lucide-react";
import { OrnateFrame } from "./OrnateFrame";
import {
  GOLD,
  OVERLAY,
  PURPLE_CARD,
  RED_CARD,
  AMBER_CARD,
  panelGradient,
} from "./theme";
import { BaseModal } from "./BaseModal";
import type { EncounterQueueItem } from "../../hooks/useTutorial";
import type { EnemyType, SpecialTowerType, HazardType } from "../../types";
import {
  EnemySprite,
  FramedSprite,
  SpecialTowerSprite,
  HazardSprite,
  getEnemySpriteFrameTheme,
} from "../../sprites";
import { ENEMY_DATA } from "../../constants/enemies";

// =============================================================================
// PROPS
// =============================================================================

export interface EncounterTooltipProps {
  encounters: EncounterQueueItem[];
  currentIndex: number;
  onAcknowledge: () => void;
}

// =============================================================================
// CATEGORY STYLING
// =============================================================================

interface CategoryStyle {
  icon: React.ReactNode;
  label: string;
  borderColor: string;
  iconBg: string;
  accentClass: string;
}

function getCategoryStyle(category: EncounterQueueItem["category"]): CategoryStyle {
  switch (category) {
    case "special_tower":
      return {
        icon: <Shield size={18} className="text-purple-300" />,
        label: "Special Structure",
        borderColor: PURPLE_CARD.border,
        iconBg: `linear-gradient(135deg, ${PURPLE_CARD.bgLight}, ${PURPLE_CARD.bgDark})`,
        accentClass: "text-purple-200",
      };
    case "hazard":
      return {
        icon: <AlertTriangle size={18} className="text-red-300" />,
        label: "Map Hazard",
        borderColor: RED_CARD.border,
        iconBg: `linear-gradient(135deg, ${RED_CARD.bgLight}, ${RED_CARD.bgDark})`,
        accentClass: "text-red-200",
      };
    case "enemy":
      return {
        icon: <Skull size={18} className="text-amber-300" />,
        label: "New Enemy",
        borderColor: AMBER_CARD.border,
        iconBg: `linear-gradient(135deg, ${AMBER_CARD.bgBase}, ${AMBER_CARD.bgDark})`,
        accentClass: "text-amber-200",
      };
  }
}

// =============================================================================
// TRAIT DISPLAY
// =============================================================================

const TRAIT_LABELS: Record<string, { label: string; color: string }> = {
  flying: { label: "Flying", color: "bg-cyan-900/60 text-cyan-300 border-cyan-700/40" },
  ranged: { label: "Ranged", color: "bg-green-900/60 text-green-300 border-green-700/40" },
  armored: { label: "Armored", color: "bg-blue-900/60 text-blue-300 border-blue-700/40" },
  fast: { label: "Fast", color: "bg-yellow-900/60 text-yellow-300 border-yellow-700/40" },
  boss: { label: "Boss", color: "bg-red-900/60 text-red-300 border-red-700/40" },
  summoner: { label: "Summoner", color: "bg-purple-900/60 text-purple-300 border-purple-700/40" },
  regenerating: { label: "Regen", color: "bg-emerald-900/60 text-emerald-300 border-emerald-700/40" },
  aoe_attack: { label: "AoE", color: "bg-orange-900/60 text-orange-300 border-orange-700/40" },
  magic_resist: { label: "Magic Resist", color: "bg-indigo-900/60 text-indigo-300 border-indigo-700/40" },
  tower_debuffer: { label: "Debuffs Towers", color: "bg-rose-900/60 text-rose-300 border-rose-700/40" },
  breakthrough: { label: "Breakthrough", color: "bg-amber-900/60 text-amber-300 border-amber-700/40" },
};

// =============================================================================
// SPRITE ROW COMPONENTS (for non-enemy encounters)
// =============================================================================

function NonEnemySpriteRow({ encounter }: { encounter: EncounterQueueItem }) {
  if (encounter.category === "special_tower" && encounter.entityType) {
    return (
      <div className="flex justify-center py-2">
        <SpecialTowerSprite type={encounter.entityType as SpecialTowerType} size={64} />
      </div>
    );
  }

  if (encounter.category === "hazard" && encounter.entityType) {
    return (
      <div className="flex justify-center py-2">
        <HazardSprite type={encounter.entityType as HazardType} size={64} />
      </div>
    );
  }

  return null;
}

// =============================================================================
// ENEMY CARD LIST (rich per-enemy cards)
// =============================================================================

function EnemyCardList({ members }: { members: EnemyType[] }) {
  return (
    <div className="px-3 sm:px-4 py-1.5 sm:py-2 space-y-1.5 sm:space-y-2 max-h-[38vh] sm:max-h-[45vh] overflow-y-auto">
      {members.map((type) => {
        const data = ENEMY_DATA[type];
        if (!data) return null;
        const theme = getEnemySpriteFrameTheme(type);
        const traits = data.traits?.filter((t) => TRAIT_LABELS[t]) || [];
        const abilities = data.abilities || [];

        return (
          <div
            key={type}
            className="flex items-start gap-2 sm:gap-3 rounded-lg p-2 sm:p-2.5"
            style={{ background: "rgba(10,10,16,0.5)", border: `1px solid ${theme.border}` }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <FramedSprite size={36} theme={theme}>
                <EnemySprite type={type} size={28} animated />
              </FramedSprite>
            </div>
            <div className="flex-1 min-w-0">
              {/* Name + traits */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mb-0.5 sm:mb-1">
                <span className="text-xs sm:text-sm font-bold text-amber-200">{data.name}</span>
                {data.isBoss && <Crown size={11} className="text-red-400" />}
                {traits.map((t) => (
                  <span key={t} className={`text-[8px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-[1px] rounded-full border ${TRAIT_LABELS[t].color}`}>
                    {TRAIT_LABELS[t].label}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-[10px] sm:text-xs text-amber-100/60 leading-snug mb-1 sm:mb-1.5">{data.desc}</p>

              {/* Stats row */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
                <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-red-300">
                  <Heart size={9} /> {data.hp}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-green-300">
                  <Wind size={9} /> {data.speed.toFixed(2)}
                </span>
                {data.armor > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-blue-300">
                    <ShieldAlert size={9} /> {Math.round(data.armor * 100)}%
                  </span>
                )}
                {data.flying && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-cyan-300">
                    <Feather size={9} /> Flies
                  </span>
                )}
                {data.isRanged && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-green-300">
                    <Swords size={9} /> Ranged
                  </span>
                )}
                {data.breakthrough && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-amber-300">
                    <Zap size={9} /> Bypass
                  </span>
                )}
              </div>

              {/* Abilities */}
              {abilities.length > 0 && (
                <div className="space-y-0.5">
                  {abilities.map((ab, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <Zap size={9} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] sm:text-[11px] text-amber-200/50">
                        <span className="font-semibold text-amber-300/70">{ab.name}</span> — {ab.desc}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export const EncounterTooltip: React.FC<EncounterTooltipProps> = ({
  encounters,
  currentIndex,
  onAcknowledge,
}) => {
  const encounter = encounters[currentIndex];

  const handleAcknowledge = useCallback(() => {
    onAcknowledge();
  }, [onAcknowledge]);

  if (!encounter) return null;

  const style = getCategoryStyle(encounter.category);
  const remaining = encounters.length - currentIndex - 1;

  return (
    <BaseModal
      isOpen
      onClose={handleAcknowledge}
      zClass="z-[310]"
      blurClass=""
      backdropBg={OVERLAY.black50}
      paddingClass="p-2 sm:p-4"
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: panelGradient,
          border: `2px solid ${style.borderColor}`,
          boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 20px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame className="relative w-full h-full overflow-hidden" cornerSize={36}>
          {/* Header */}
          <div
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 border-b"
            style={{ borderColor: GOLD.border25 }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg"
              style={{
                background: style.iconBg,
                border: `1px solid ${GOLD.innerBorder12}`,
              }}
            >
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-200/40 font-medium">
                {style.label}
              </p>
              <h3 className={`text-base sm:text-lg font-bold ${style.accentClass} tracking-wide`}>
                {encounter.name}
              </h3>
            </div>
          </div>

          {/* Enemy encounters: rich card list */}
          {encounter.category === "enemy" && encounter.members && encounter.members.length > 0 ? (
            <EnemyCardList members={encounter.members} />
          ) : (
            <>
              {/* Non-enemy sprite preview */}
              <NonEnemySpriteRow encounter={encounter} />

              {/* Body text */}
              <div className="px-3 sm:px-5 py-2.5 sm:py-3 max-h-[35vh] sm:max-h-[40vh] overflow-y-auto">
                {encounter.description.split("\n").filter(Boolean).map((line, i) => (
                  <p
                    key={i}
                    className="text-xs sm:text-sm text-amber-100/80 leading-relaxed"
                    style={{ marginTop: i > 0 ? 6 : 0 }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-t"
            style={{ borderColor: GOLD.border25 }}
          >
            {remaining > 0 ? (
              <p className="text-[10px] sm:text-xs text-amber-200/40">
                +{remaining} more to show
              </p>
            ) : (
              <div />
            )}
            <button
              onClick={handleAcknowledge}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-amber-100 transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, rgba(180,125,30,0.85), rgba(120,75,15,0.9))",
                border: `1px solid ${GOLD.border40}`,
                boxShadow: `0 0 12px ${GOLD.glow07}`,
              }}
            >
              <Check size={14} />
              Got it
            </button>
          </div>
        </OrnateFrame>
      </div>
    </BaseModal>
  );
};

export default EncounterTooltip;
