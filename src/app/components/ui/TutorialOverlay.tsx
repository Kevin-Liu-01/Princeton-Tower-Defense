"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ChevronRight, SkipForward, BookOpen } from "lucide-react";
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
import { TOWER_DATA, HERO_DATA } from "../../constants";
import { TOWER_STATS } from "../../constants/towerStats";
import type { TowerType, SpellType, HeroType } from "../../types";

// =============================================================================
// PROPS
// =============================================================================

export interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
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
// TOWER CATALOG CARDS (for the build-towers step)
// =============================================================================

interface TowerCardInfo {
  type: TowerType;
  role: string;
  tagline: string;
  detail: string;
  roleColor: string;
}

const TOWER_CARDS: TowerCardInfo[] = [
  {
    type: "cannon",
    role: "DPS",
    tagline: "Heavy single-target artillery",
    detail: "High damage cannonballs punish ground enemies. Evolves into rapid-fire Gatling Gun or devastating Flamethrower.",
    roleColor: "bg-red-900/60 text-red-300 border-red-700/40",
  },
  {
    type: "library",
    role: "Control",
    tagline: "Slows enemies with arcane knowledge",
    detail: "Reduces enemy speed in a wide area. Upgrades into the earth-shattering EQ Smasher or the icy Blizzard.",
    roleColor: "bg-cyan-900/60 text-cyan-300 border-cyan-700/40",
  },
  {
    type: "lab",
    role: "DPS",
    tagline: "Fast electric zaps, hits air & ground",
    detail: "Rapid lightning attacks chain between foes. Becomes a lock-on Focused Beam or multi-target Chain Lightning.",
    roleColor: "bg-red-900/60 text-red-300 border-red-700/40",
  },
  {
    type: "arch",
    role: "Anti-Air",
    tagline: "Sonic waves hit flying & ground",
    detail: "The only tower that naturally targets air. Evolves into stunning Shockwave Siren or multi-hit Symphony Hall.",
    roleColor: "bg-purple-900/60 text-purple-300 border-purple-700/40",
  },
  {
    type: "club",
    role: "Economy",
    tagline: "Generates Paw Points passively",
    detail: "Your income engine — earns PP over time. Becomes an Investment Bank (range aura) or Recruitment Center (damage aura).",
    roleColor: "bg-amber-900/60 text-amber-300 border-amber-700/40",
  },
  {
    type: "station",
    role: "Blocker",
    tagline: "Spawns troops to block the path",
    detail: "Soldiers physically block enemies, buying time for your towers. Upgrades to ranged Centaur Stables or tanky Royal Cavalry.",
    roleColor: "bg-emerald-900/60 text-emerald-300 border-emerald-700/40",
  },
  {
    type: "mortar",
    role: "AoE",
    tagline: "Long-range bombardment, splash damage",
    detail: "Lobs explosive shells into crowds. Evolves into the precision Missile Battery or fire-spreading Ember Foundry.",
    roleColor: "bg-orange-900/60 text-orange-300 border-orange-700/40",
  },
];

function TowerCatalog() {
  return (
    <div className="mt-3 mb-1 space-y-1.5">
      {TOWER_CARDS.map((card) => {
        const theme = TOWER_SPRITE_FRAME_THEME[card.type];
        const data = TOWER_DATA[card.type];
        return (
          <div
            key={card.type}
            className="flex items-start gap-2.5 rounded-lg p-2 transition-colors"
            style={{
              background: "rgba(10,10,16,0.5)",
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <FramedSprite size={38} theme={theme}>
                <TowerSprite type={card.type} size={30} level={1} />
              </FramedSprite>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold text-amber-200">{data.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full border ${card.roleColor}`}>
                  {card.role}
                </span>
                <span className="text-xs text-amber-400/50 ml-auto">{data.cost} PP</span>
              </div>
              <p className="text-[13px] text-amber-100/70 leading-snug">{card.tagline}</p>
              <p className="text-xs text-amber-200/40 leading-snug mt-0.5">{card.detail}</p>
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

function SpellCatalog() {
  return (
    <div className="mt-3 mb-1 grid grid-cols-2 gap-1.5">
      {SPELL_CARDS.map((spell) => (
        <div
          key={spell.type}
          className="flex items-center gap-2 rounded-lg p-1.5"
          style={{ background: "rgba(10,10,16,0.5)", border: `1px solid rgba(80,80,80,0.25)` }}
        >
          <SpellSprite type={spell.type} size={28} />
          <div className="min-w-0">
            <span className="text-[13px] font-bold text-amber-200 block">{spell.name}</span>
            <span className="text-[11px] text-amber-200/40 leading-tight block">{spell.tagline}</span>
          </div>
        </div>
      ))}
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

function HeroCatalog() {
  return (
    <div className="mt-3 mb-1 space-y-1.5">
      {HERO_CARDS.map((card) => {
        const data = HERO_DATA[card.type];
        const heroColor = data.color;
        return (
          <div
            key={card.type}
            className="flex items-start gap-2.5 rounded-lg p-2"
            style={{
              background: "rgba(10,10,16,0.5)",
              border: `1px solid ${heroColor}44`,
            }}
          >
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden mt-0.5"
              style={{
                width: 38,
                height: 38,
                background: `radial-gradient(circle, ${heroColor}22, rgba(6,6,10,0.9))`,
                border: `1.5px solid ${heroColor}66`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HeroSprite type={card.type} size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-sm font-bold text-amber-200">{data.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-[1px] rounded-full border ${card.roleColor}`}>
                  {card.role}
                </span>
              </div>
              <p className="text-[13px] text-amber-100/70 leading-snug">{card.tagline}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-amber-400/50">
                  <span className="font-semibold text-amber-300/60">{data.ability}</span> — {data.abilityDesc}
                </span>
              </div>
            </div>
          </div>
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
    <div className="mt-3 mb-1 rounded-lg border p-2.5" style={{ background: "rgba(10,10,16,0.55)", borderColor: GOLD.innerBorder10 }}>
      <p className="text-xs text-amber-300/60 font-semibold uppercase tracking-wider mb-2 text-center">
        Example: {towerData.name}
      </p>

      {/* Levels 1-3 */}
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
                <span className="text-[11px] mt-0.5 text-amber-200/50 text-center leading-tight max-w-[70px]">
                  Lv{lvl}: {shortDesc}
                </span>
              </div>
              {i < 2 && (
                <div className="flex-shrink-0 mx-1">
                  <div style={{ width: 16, height: 2, background: "rgba(251,191,36,0.4)", borderRadius: 1 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Branch connector */}
      <div className="flex justify-center mt-1">
        <div style={{ width: 2, height: 8, background: "rgba(251,191,36,0.35)", borderRadius: 1 }} />
      </div>

      {/* Level 4 A/B fork */}
      <div className="flex items-start justify-center gap-4">
        {(["A", "B"] as const).map((branch) => {
          const info = towerData.upgrades[branch];
          const borderCol = branch === "A" ? "rgba(239,68,68,0.6)" : "rgba(59,130,246,0.6)";
          const labelColor = branch === "A" ? "text-red-300" : "text-blue-300";
          return (
            <div key={branch} className="flex flex-col items-center">
              <div className="rounded-lg overflow-hidden" style={{ border: `1.5px solid ${borderCol}` }}>
                <FramedSprite size={34} theme={theme}>
                  <TowerSprite type={towerType} size={26} level={4} upgrade={branch} />
                </FramedSprite>
              </div>
              <span className={`text-[11px] mt-0.5 font-semibold ${labelColor}`}>
                {info.name}
              </span>
              <span className="text-[10px] text-amber-200/30 text-center max-w-[90px] leading-tight">
                {info.effect}
              </span>
            </div>
          );
        })}
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
        className="fixed w-full max-w-lg rounded-2xl overflow-hidden"
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
            className="flex items-center gap-3 px-5 py-3.5 border-b"
            style={{ borderColor: GOLD.border25 }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${PANEL.bgWarmLight}, ${PANEL.bgWarmMid})`,
                border: `1px solid ${GOLD.innerBorder12}`,
              }}
            >
              <BookOpen size={16} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-amber-200 tracking-wide">
                {step.title}
              </h2>
              <p className="text-xs text-amber-200/40 mt-0.5">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
            {descriptionLines.map((line, i) => (
              <p
                key={i}
                className="text-sm text-amber-100/80 leading-relaxed"
                style={{ marginTop: i > 0 ? 8 : 0, whiteSpace: "pre-wrap" }}
              >
                {line}
              </p>
            ))}
            {showTowerCatalog && <TowerCatalog />}
            {showSpellCatalog && <SpellCatalog />}
            {showUpgradeTree && <TutorialUpgradeTree />}
            {showHeroCatalog && <HeroCatalog />}
          </div>

          {/* Divider */}
          <div className="mx-4" style={{ height: 1, background: dividerGradient }} />

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3">
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === currentStep ? 16 : 6,
                    height: 6,
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-amber-200/50 hover:text-amber-200/80 hover:bg-white/5 transition-colors"
              >
                <SkipForward size={12} />
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-amber-100 transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, rgba(180,125,30,0.85), rgba(120,75,15,0.9))",
                  border: `1px solid ${GOLD.border40}`,
                  boxShadow: `0 0 12px ${GOLD.glow07}`,
                }}
              >
                {isLastStep ? "Let's Go!" : "Next"}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </OrnateFrame>
      </div>
    </>
  );
};

export default TutorialOverlay;
