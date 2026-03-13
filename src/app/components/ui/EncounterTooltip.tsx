"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { ENEMY_DATA, ENEMY_TRAIT_META } from "../../constants/enemies";

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

const TRAIT_LABELS: Record<string, { label: string; color: string }> = Object.fromEntries(
  Object.entries(ENEMY_TRAIT_META).map(([k, v]) => [k, { label: v.label, color: v.pillColor }])
);

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
    <div className="px-3 sm:px-4 py-2 sm:py-2.5 space-y-2 sm:space-y-2.5 max-h-[38dvh] sm:max-h-[45dvh] overflow-y-auto">
      {members.map((type) => {
        const data = ENEMY_DATA[type];
        if (!data) return null;
        const theme = getEnemySpriteFrameTheme(type);
        const traits = data.traits?.filter((t) => TRAIT_LABELS[t]) || [];
        const abilities = data.abilities || [];

        return (
          <div
            key={type}
            className="relative flex items-start gap-2.5 sm:gap-3 rounded-xl p-2.5 sm:p-3 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(10,10,16,0.7), rgba(16,14,20,0.55))`,
              border: `1px solid ${theme.border}`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.04)`,
            }}
          >
            {/* Accent bar on the left edge */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[2px]"
              style={{ background: theme.border.replace("0.5)", "0.8)") }}
            />

            <div className="flex-shrink-0 mt-0.5">
              <FramedSprite size={40} theme={theme}>
                <EnemySprite type={type} size={30} animated />
              </FramedSprite>
            </div>
            <div className="flex-1 min-w-0">
              {/* Name + traits */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mb-0.5 sm:mb-1">
                <span className="text-xs sm:text-sm font-bold text-amber-200">{data.name}</span>
                {data.isBoss && <Crown size={12} className="text-red-400" />}
                {traits.map((t) => (
                  <span key={t} className={`text-[8px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-[2px] rounded-full border ${TRAIT_LABELS[t].color}`}>
                    {TRAIT_LABELS[t].label}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-[10px] sm:text-xs text-amber-100/60 leading-snug mb-1.5 sm:mb-2">{data.desc}</p>

              {/* Stats row */}
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap mb-1 sm:mb-1.5">
                <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-red-300">
                  <Heart size={10} /> {data.hp}
                </span>
                <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-green-300">
                  <Wind size={10} /> {data.speed.toFixed(2)}
                </span>
                {data.armor > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-blue-300">
                    <ShieldAlert size={10} /> {Math.round(data.armor * 100)}%
                  </span>
                )}
                {data.flying && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-cyan-300">
                    <Feather size={10} /> Flies
                  </span>
                )}
                {data.isRanged && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-green-300">
                    <Swords size={10} /> Ranged
                  </span>
                )}
                {data.breakthrough && (
                  <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-amber-300">
                    <Zap size={10} /> Bypass
                  </span>
                )}
              </div>

              {/* Abilities */}
              {abilities.length > 0 && (
                <div
                  className="space-y-0.5 pt-1 mt-0.5"
                  style={{ borderTop: "1px solid rgba(180,140,60,0.1)" }}
                >
                  {abilities.map((ab, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <Zap size={10} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] sm:text-[11px] text-amber-200/60">
                        <span className="font-semibold text-amber-300/80">{ab.name}</span> — {ab.desc}
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
              <div className="px-3 sm:px-5 py-2.5 sm:py-3 max-h-[35dvh] sm:max-h-[40dvh] overflow-y-auto">
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

// =============================================================================
// INLINE ENCOUNTER PANEL — no modal, sits in the HUD layout
// =============================================================================

const INLINE_PANEL_WIDTH = 380;
const INLINE_PANEL_MAX_HEIGHT = 260;

interface InlineEncounterPanelProps extends EncounterTooltipProps {
  autoDismissMs?: number;
  exiting?: boolean;
}

export const InlineEncounterPanel: React.FC<InlineEncounterPanelProps> = ({
  encounters,
  currentIndex,
  onAcknowledge,
  autoDismissMs = 8000,
  exiting = false,
}) => {
  const encounter = encounters[currentIndex];
  const [paused, setPaused] = useState(false);

  const onAcknowledgeRef = useRef(onAcknowledge);
  onAcknowledgeRef.current = onAcknowledge;

  const remainingRef = useRef(autoDismissMs);
  const timerStartRef = useRef(Date.now());

  // Reset remaining time when the encounter changes
  useEffect(() => {
    remainingRef.current = autoDismissMs;
    timerStartRef.current = Date.now();
  }, [currentIndex, encounters.length, autoDismissMs]);

  // Auto-dismiss timer — pauses on hover, resumes with remaining time
  useEffect(() => {
    if (paused || exiting || encounters.length === 0) return;
    timerStartRef.current = Date.now();
    const timer = setTimeout(() => {
      onAcknowledgeRef.current();
    }, remainingRef.current);
    return () => {
      clearTimeout(timer);
      const elapsed = Date.now() - timerStartRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [paused, exiting, currentIndex, encounters.length]);

  const handleAcknowledge = useCallback(() => {
    onAcknowledgeRef.current();
  }, []);

  if (!encounter) return null;

  const style = getCategoryStyle(encounter.category);
  const remaining = encounters.length - currentIndex - 1;

  const categoryGlow = style.borderColor.replace("0.5)", "0.15)");
  const categoryTint = style.borderColor.replace("0.5)", "0.06)");

  return (
    <div
      className="flex flex-col pointer-events-auto ml-2 mb-1 rounded-xl overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        width: INLINE_PANEL_WIDTH,
        maxWidth: "calc(100vw - 16px)",
        maxHeight: INLINE_PANEL_MAX_HEIGHT,
        background: panelGradient,
        border: `1.5px solid ${style.borderColor}`,
        boxShadow: `0 4px 32px rgba(0,0,0,0.6), 0 0 20px ${categoryGlow}, inset 0 1px 0 ${GOLD.innerBorder08}`,
        animation: exiting
          ? "encounterSlideOut 300ms ease-in forwards"
          : "encounterSlideIn 350ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2 shrink-0"
        style={{
          borderBottom: `1px solid ${GOLD.border25}`,
          background: `linear-gradient(135deg, ${categoryTint}, transparent 60%)`,
        }}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{
            background: style.iconBg,
            border: `1px solid ${GOLD.innerBorder12}`,
            boxShadow: `0 0 8px ${categoryGlow}`,
          }}
        >
          {React.cloneElement(style.icon as React.ReactElement, { size: 14 })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] uppercase tracking-widest text-amber-200/40 font-medium leading-tight">
            {style.label}
          </p>
          <h3 className={`text-sm font-bold ${style.accentClass} tracking-wide leading-tight`}>
            {encounter.name}
          </h3>
        </div>
        {remaining > 0 && (
          <span className="text-[9px] text-amber-200/40 shrink-0">
            +{remaining} more
          </span>
        )}
        <button
          onClick={handleAcknowledge}
          className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-amber-100 transition-all hover:brightness-125 active:scale-95 shrink-0 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(180,125,30,0.9), rgba(120,75,15,0.95))",
            border: `1px solid ${GOLD.border40}`,
            boxShadow: `0 0 12px ${GOLD.glow07}, 0 2px 4px rgba(0,0,0,0.3)`,
          }}
        >
          <div
            key={`countdown-${currentIndex}-${encounters.length}`}
            className="absolute inset-0 origin-left"
            style={{
              background: "rgba(255,255,255,0.12)",
              animation: `encounterCountdown ${autoDismissMs}ms linear forwards`,
              animationPlayState: paused ? "paused" : "running",
            }}
          />
          <Check size={12} className="relative z-10" />
          <span className="relative z-10">{remaining > 0 ? "Next" : "Got it"}</span>
        </button>
      </div>
      <style>{`
        @keyframes encounterCountdown {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
        @keyframes encounterSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes encounterSlideOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(16px) scale(0.97); }
        }
        @keyframes encounterContentSwap {
          0% { opacity: 0.3; transform: translateX(6px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {/* Content — scrollable, animates on encounter switch */}
      <div
        key={`content-${currentIndex}`}
        className="flex-1 overflow-y-auto min-h-0"
        style={{ animation: "encounterContentSwap 250ms ease-out" }}
      >
        {encounter.category === "enemy" && encounter.members && encounter.members.length > 0 ? (
          <EnemyCardList members={encounter.members} />
        ) : (
          <div className="flex items-start gap-3 px-3 py-2.5">
            {encounter.entityType && (
              <div className="flex-shrink-0 mt-0.5">
                {encounter.category === "special_tower" ? (
                  <SpecialTowerSprite type={encounter.entityType as SpecialTowerType} size={48} />
                ) : encounter.category === "hazard" ? (
                  <HazardSprite type={encounter.entityType as HazardType} size={48} />
                ) : null}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {encounter.description.split("\n").filter(Boolean).map((line, i) => (
                <p
                  key={i}
                  className="text-[11px] text-amber-100/80 leading-relaxed"
                  style={{ marginTop: i > 0 ? 4 : 0 }}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EncounterTooltip;
