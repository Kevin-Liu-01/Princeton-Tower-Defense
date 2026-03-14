"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ChevronRight, SkipForward, BookOpen, ArrowRight } from "lucide-react";
import { OrnateFrame } from "./OrnateFrame";
import {
  GOLD,
  PANEL,
  panelGradient,
  dividerGradient,
} from "./theme";
import type { TutorialStep } from "../../constants/tutorial";
import { TUTORIAL_STEPS } from "../../constants/tutorial";
import {
  TowerSprite,
  SpellSprite,
  HeroSprite,
  FramedSprite,
  TOWER_SPRITE_FRAME_THEME,
} from "../../sprites";
import { TOWER_DATA, HERO_DATA, TOWER_TAGS, TOWER_QUICK_SUMMARY } from "../../constants";
import { TagBadge } from "./TagBadge";
import { TOWER_STATS } from "../../constants/towerStats";
import type { TowerType, SpellType, HeroType } from "../../types";

// =============================================================================
// PROPS
// =============================================================================

export interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
  selectedHero?: HeroType | null;
  selectedSpells?: SpellType[];
  onHeroChange?: (hero: HeroType) => void;
  onSpellToggle?: (spell: SpellType) => void;
}

// =============================================================================
// HIGHLIGHT RECT + POSITIONING
// =============================================================================

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

function getHighlightElement(step: TutorialStep): HTMLElement | null {
  if (!step.highlight) return null;
  return document.querySelector(`[data-tutorial="${step.highlight}"]`);
}

function getHighlightRect(el: HTMLElement | null): HighlightRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  };
}

function getPanelPosition(
  step: TutorialStep,
  highlight: HighlightRect | null
): React.CSSProperties {
  if (!highlight) {
    return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  switch (step.position) {
    case "top-right":
      return { top: highlight.top + highlight.height + 12, right: 16 };
    case "top-left":
      return { top: highlight.top + highlight.height + 12, left: 16 };
    case "bottom-left": {
      const panelBottom = highlight.top - 12;
      return { bottom: vh - panelBottom, left: 16 };
    }
    case "bottom-right": {
      const panelBottom = highlight.top - 12;
      return { bottom: vh - panelBottom, right: 16 };
    }
    case "bottom-center": {
      const panelBottom = highlight.top - 12;
      return { bottom: vh - panelBottom, left: "50%", transform: "translateX(-50%)" };
    }
    case "center":
    default:
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  }
}

// =============================================================================
// TOWER CATALOG (for the build-towers step) — uses centralized tags
// =============================================================================

const TOWER_DISPLAY_ORDER: TowerType[] = ["cannon", "library", "lab", "arch", "club", "station", "mortar"];

function TowerCatalog() {
  return (
    <div className="mt-2 sm:mt-3 mb-1 space-y-1 sm:space-y-1.5">
      {TOWER_DISPLAY_ORDER.map((towerType) => {
        const theme = TOWER_SPRITE_FRAME_THEME[towerType];
        const data = TOWER_DATA[towerType];
        const tags = TOWER_TAGS[towerType];
        const summary = TOWER_QUICK_SUMMARY[towerType];
        return (
          <div
            key={towerType}
            className="flex items-center gap-2 sm:gap-2.5 rounded-lg p-1.5 sm:p-2"
            style={{
              background: "rgba(10,10,16,0.5)",
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex-shrink-0">
              <FramedSprite size={38} theme={theme}>
                <TowerSprite type={towerType} size={28} level={1} />
              </FramedSprite>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-amber-200 truncate">{data.name}</span>
                <span className="text-[10px] sm:text-xs text-amber-400/50 ml-auto flex-shrink-0">{data.cost} PP</span>
              </div>
              <p className="text-[10px] sm:text-[12px] text-amber-100/70 leading-snug">{summary}</p>
              <div className="flex flex-wrap gap-0.5 mt-1">
                {tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} size={8} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// SPELL CATALOG (for the use-spells step)
// =============================================================================

interface SpellCardInfo {
  type: SpellType;
  name: string;
  tagline: string;
  color: string;
}

const SPELL_CARDS: SpellCardInfo[] = [
  { type: "fireball", name: "Fireball", tagline: "Meteor shower dealing heavy AoE fire damage", color: "border-red-700/40" },
  { type: "lightning", name: "Lightning", tagline: "Chain lightning leaps between enemies", color: "border-blue-700/40" },
  { type: "freeze", name: "Freeze", tagline: "Freezes all enemies in a radius for several seconds", color: "border-cyan-700/40" },
  { type: "payday", name: "Payday", tagline: "Instantly grants bonus Paw Points", color: "border-amber-700/40" },
  { type: "reinforcements", name: "Reinforcements", tagline: "Drops soldiers anywhere on the map", color: "border-emerald-700/40" },
];

const MAX_SPELLS = 3;

function SpellCatalog({ selectedSpells, onSpellToggle }: { selectedSpells?: SpellType[]; onSpellToggle?: (spell: SpellType) => void }) {
  const selected = selectedSpells ?? [];
  const isFull = selected.length >= MAX_SPELLS;
  return (
    <div className="mt-2 sm:mt-3 mb-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] sm:text-xs text-amber-300/50 font-semibold uppercase tracking-wider">
          Tap to equip/unequip
        </span>
        <span className="text-[10px] sm:text-xs text-amber-200/40">
          {selected.length}/{MAX_SPELLS} equipped
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 sm:gap-1.5">
        {SPELL_CARDS.map((spell) => {
          const isSelected = selected.includes(spell.type);
          const isDisabled = !isSelected && isFull;
          return (
            <button
              key={spell.type}
              type="button"
              onClick={() => onSpellToggle?.(spell.type)}
              disabled={isDisabled}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg p-1 sm:p-1.5 relative text-left transition-all duration-150"
              style={{
                background: isSelected ? "rgba(251,191,36,0.1)" : "rgba(10,10,16,0.5)",
                border: isSelected ? "2px solid rgba(251,191,36,0.5)" : "1px solid rgba(80,80,80,0.25)",
                boxShadow: isSelected ? "0 0 10px rgba(251,191,36,0.15)" : "none",
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
              }}
            >
              {isSelected && (
                <div className="absolute top-0.5 right-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-400/80">
                  Equipped
                </div>
              )}
              <SpellSprite type={spell.type} size={30} />
              <div className="min-w-0">
                <span className="text-[11px] sm:text-[13px] font-bold text-amber-200 block">{spell.name}</span>
                <span className="text-[9px] sm:text-[11px] text-amber-200/40 leading-tight block">{spell.tagline}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// HERO CARDS (for the move-hero step)
// =============================================================================

interface HeroCardInfo {
  type: HeroType;
  role: string;
  tagline: string;
  roleColor: string;
}

const HERO_CARDS: HeroCardInfo[] = [
  { type: "tiger", role: "Brawler", tagline: "Fierce melee fighter. Roar stuns all nearby enemies.", roleColor: "bg-orange-900/60 text-orange-300 border-orange-700/40" },
  { type: "tenor", role: "Ranged", tagline: "Sonic ranged attacker. High Note stuns & heals allies.", roleColor: "bg-pink-900/60 text-pink-300 border-pink-700/40" },
  { type: "mathey", role: "Tank", tagline: "Armored defender. Goes invincible & taunts enemies.", roleColor: "bg-indigo-900/60 text-indigo-300 border-indigo-700/40" },
  { type: "rocky", role: "Artillery", tagline: "Hurls boulders from range. Massive AoE damage.", roleColor: "bg-stone-800/60 text-stone-300 border-stone-600/40" },
  { type: "scott", role: "Support", tagline: "Boosts all tower damage +50% and range +25%.", roleColor: "bg-teal-900/60 text-teal-300 border-teal-700/40" },
  { type: "captain", role: "Summoner", tagline: "Legendary commander. Summons armored knights.", roleColor: "bg-red-900/60 text-red-300 border-red-700/40" },
  { type: "engineer", role: "Tech", tagline: "Deploys automated turrets to create crossfire.", roleColor: "bg-yellow-900/60 text-yellow-300 border-yellow-700/40" },
];

function HeroCatalog({ selectedHero, onHeroChange }: { selectedHero?: HeroType | null; onHeroChange?: (hero: HeroType) => void }) {
  return (
    <div className="mt-2 sm:mt-3 mb-1 space-y-1 sm:space-y-1.5">
      {HERO_CARDS.map((card) => {
        const data = HERO_DATA[card.type];
        const heroColor = data.color;
        const isSelected = selectedHero === card.type;
        return (
          <button
            key={card.type}
            type="button"
            onClick={() => onHeroChange?.(card.type)}
            className="flex items-start gap-2 sm:gap-2.5 rounded-lg p-1.5 sm:p-2 relative w-full text-left transition-all duration-150"
            style={{
              background: isSelected ? `${heroColor}18` : "rgba(10,10,16,0.5)",
              border: isSelected ? `2px solid ${heroColor}88` : `1px solid ${heroColor}44`,
              boxShadow: isSelected ? `0 0 12px ${heroColor}30` : "none",
              cursor: "pointer",
            }}
          >
            {isSelected && (
              <div className="absolute top-1 right-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                style={{ background: `${heroColor}30`, color: heroColor, border: `1px solid ${heroColor}55` }}>
                Selected
              </div>
            )}
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden mt-0.5"
              style={{
                width: 42,
                height: 42,
                background: `radial-gradient(circle, ${heroColor}22, rgba(6,6,10,0.9))`,
                border: `1.5px solid ${heroColor}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HeroSprite type={card.type} size={34} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5">
                <span className="text-xs sm:text-sm font-bold text-amber-200">{data.name}</span>
                <span className={`text-[8px] sm:text-[10px] font-semibold px-1 sm:px-1.5 py-[1px] rounded-full border ${card.roleColor}`}>
                  {card.role}
                </span>
              </div>
              <p className="text-[11px] sm:text-[13px] text-amber-100/70 leading-snug">{card.tagline}</p>
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <span className="text-[11px] text-amber-400/50">
                  <span className="font-semibold text-amber-300/60">{data.ability}</span> — {data.abilityDesc}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// TUTORIAL UPGRADE TREE (for the upgrade-towers step)
// =============================================================================

const EXAMPLE_TOWER: TowerType = "cannon";

function TutorialUpgradeTree() {
  const towerType = EXAMPLE_TOWER;
  const theme = TOWER_SPRITE_FRAME_THEME[towerType];
  const statsDef = TOWER_STATS[towerType];
  const towerData = TOWER_DATA[towerType];
  const levels = [1, 2, 3] as const;

  return (
    <div className="mt-2 sm:mt-3 mb-1 rounded-lg border p-2 sm:p-2.5" style={{ background: "rgba(10,10,16,0.55)", borderColor: GOLD.innerBorder10 }}>
      <p className="text-[10px] sm:text-xs text-amber-300/60 font-semibold uppercase tracking-wider mb-1.5 sm:mb-2 text-center">
        Example: {towerData.name}
      </p>

      {/* Levels 1-3, then arrow to Lv4 A/B fork — all left-to-right */}
      <div className="flex items-center justify-center gap-0">
        {levels.map((lvl, i) => {
          const desc = statsDef.levels[lvl]?.description || `Level ${lvl}`;
          const shortDesc = desc.split(" - ")[0] || desc;
          return (
            <React.Fragment key={lvl}>
              <div className="flex flex-col items-center">
                <div className="rounded-lg overflow-hidden" style={{ border: `1.5px solid ${theme.border}` }}>
                  <FramedSprite size={34} theme={theme}>
                    <TowerSprite type={towerType} size={26} level={lvl} />
                  </FramedSprite>
                </div>
                <span className="text-[10px] mt-0.5 text-amber-200/50 text-center leading-tight max-w-[60px]">
                  Lv{lvl}
                </span>
              </div>
              <ArrowRight size={16} className="flex-shrink-0 mx-1 text-amber-400/50" />
            </React.Fragment>
          );
        })}

        {/* Level 4 A/B fork inline */}
        <div className="flex flex-col items-center gap-1">
          {(["A", "B"] as const).map((branch) => {
            const info = towerData.upgrades[branch];
            const borderCol = branch === "A" ? "rgba(239,68,68,0.6)" : "rgba(59,130,246,0.6)";
            const labelColor = branch === "A" ? "text-red-300" : "text-blue-300";
            return (
              <div key={branch} className="flex items-center gap-1.5">
                <div className="rounded-lg overflow-hidden" style={{ border: `1.5px solid ${borderCol}` }}>
                  <FramedSprite size={34} theme={theme}>
                    <TowerSprite type={towerType} size={26} level={4} upgrade={branch} />
                  </FramedSprite>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-semibold ${labelColor} leading-tight`}>
                    {info.name}
                  </span>
                  <span className="text-[9px] text-amber-200/30 leading-tight max-w-[80px]">
                    {info.effect}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  onComplete,
  onSkip,
  selectedHero,
  selectedSpells,
  onHeroChange,
  onSpellToggle,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
  const rafRef = useRef(0);

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const totalSteps = TUTORIAL_STEPS.length;

  // Continuously track the highlighted element's position
  useEffect(() => {
    function tick() {
      if (!step) return;
      const el = getHighlightElement(step);
      const rect = getHighlightRect(el);
      setHighlightRect((prev) => {
        if (!rect && !prev) return prev;
        if (!rect) return null;
        if (prev && prev.top === rect.top && prev.left === rect.left && prev.width === rect.width && prev.height === rect.height) return prev;
        return rect;
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step]);

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    if (isLastStep) {
      onComplete();
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsAnimating(false);
    }, 150);
  }, [isLastStep, onComplete, isAnimating]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handleSkip]);

  if (!step) return null;

  const descriptionLines = step.description.split("\n").filter(Boolean);
  const panelStyle = getPanelPosition(step, highlightRect);
  const showTowerCatalog = step.id === "build-towers";
  const showSpellCatalog = step.id === "use-spells";
  const showUpgradeTree = step.id === "upgrade-towers";
  const showHeroCatalog = step.id === "move-hero";

  // Build the box-shadow spotlight cutout mask
  const overlayStyle: React.CSSProperties = highlightRect
    ? {
      // Massive box-shadow covers everything except the cutout rect
      boxShadow: `0 0 0 9999px rgba(0,0,0,0.72)`,
      position: "fixed",
      top: highlightRect.top,
      left: highlightRect.left,
      width: highlightRect.width,
      height: highlightRect.height,
      borderRadius: 12,
      border: "2px solid rgba(251,191,36,0.45)",
      pointerEvents: "none" as const,
      zIndex: 300,
      transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    }
    : {
      position: "fixed" as const,
      inset: 0,
      background: "rgba(0,0,0,0.72)",
      pointerEvents: "none" as const,
      zIndex: 300,
    };

  return (
    <>
      {/* Spotlight cutout overlay */}
      <div style={overlayStyle} />

      {/* Glow ring around cutout */}
      {highlightRect && (
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            borderRadius: 16,
            boxShadow: "0 0 24px rgba(251,191,36,0.3), inset 0 0 24px rgba(251,191,36,0.1)",
            zIndex: 300,
            transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      )}

      {/* Click blocker (allows clicks only in the tutorial panel) */}
      <div className="fixed inset-0" style={{ zIndex: 301, pointerEvents: "none" }} />

      {/* Tutorial panel */}
      <div
        className="fixed w-[92vw] sm:w-full max-w-lg rounded-xl sm:rounded-2xl overflow-hidden"
        style={{
          ...panelStyle,
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 60px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
          pointerEvents: "auto",
          opacity: isAnimating ? 0.3 : 1,
          transition: "opacity 150ms ease",
          zIndex: 302,
        }}
      >
        <OrnateFrame className="relative w-full h-full overflow-hidden" cornerSize={40}>
          {/* Header */}
          <div
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 border-b"
            style={{ borderColor: GOLD.border25 }}
          >
            <div
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1px solid ${GOLD.innerBorder12}`,
              }}
            >
              <BookOpen size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-amber-200 tracking-wide">
                {step.title}
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-200/40 mt-0.5">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-3 sm:px-5 py-3 sm:py-4 max-h-[40dvh] sm:max-h-[50dvh] overflow-y-auto">
            {descriptionLines.map((line, i) => (
              <p
                key={i}
                className="text-xs sm:text-sm text-amber-100/80 leading-relaxed"
                style={{ marginTop: i > 0 ? 6 : 0, whiteSpace: "pre-wrap" }}
              >
                {line}
              </p>
            ))}
            {showTowerCatalog && <TowerCatalog />}
            {showSpellCatalog && <SpellCatalog selectedSpells={selectedSpells} onSpellToggle={onSpellToggle} />}
            {showUpgradeTree && <TutorialUpgradeTree />}
            {showHeroCatalog && <HeroCatalog selectedHero={selectedHero} onHeroChange={onHeroChange} />}
          </div>

          {/* Divider */}
          <div className="mx-3 sm:mx-4" style={{ height: 1, background: dividerGradient }} />

          {/* Footer */}
          <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3">
            {/* Progress dots */}
            <div className="flex gap-1 sm:gap-1.5">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === currentStep ? 12 : 5,
                    height: 5,
                    background:
                      i === currentStep
                        ? "rgba(251,191,36,0.8)"
                        : i < currentStep
                          ? "rgba(251,191,36,0.35)"
                          : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs text-amber-200/50 hover:text-amber-200/80 hover:bg-white/5 transition-colors"
              >
                <SkipForward size={11} />
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-amber-100 transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, rgba(180,125,30,0.85), rgba(120,75,15,0.9))",
                  border: `1px solid ${GOLD.border40}`,
                  boxShadow: `0 0 12px ${GOLD.glow07}`,
                }}
              >
                {isLastStep ? "Let's Go!" : "Next"}
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </>
  );
};

export default TutorialOverlay;
