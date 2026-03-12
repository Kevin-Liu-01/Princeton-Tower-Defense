"use client";
import React, { useEffect, useCallback } from "react";
import {
  Heart,
  Swords,
  Target,
  Gauge,
  Timer,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { HeroType } from "../../types";
import { HERO_DATA, HERO_ABILITY_COOLDOWNS } from "../../constants";
import { HeroSprite, HeroAbilityIcon, HeroIcon } from "../../sprites";
import { HeroHelmetIcon } from "../../sprites/custom-icons";
import { HudTooltip } from "../ui/HudTooltip";
import { HallOfHeroesModal } from "./HallOfHeroesModal";

const HERO_ROLES: Record<HeroType, { label: string; color: string; bg: string; border: string }> = {
  tiger: { label: "Brawler", color: "text-orange-300", bg: "rgba(60,25,5,0.85)", border: "rgba(234,88,12,0.35)" },
  tenor: { label: "Mage", color: "text-violet-300", bg: "rgba(35,20,65,0.85)", border: "rgba(139,92,246,0.35)" },
  mathey: { label: "Tank", color: "text-indigo-300", bg: "rgba(25,25,60,0.85)", border: "rgba(99,102,241,0.35)" },
  rocky: { label: "Artillery", color: "text-amber-300", bg: "rgba(45,35,10,0.85)", border: "rgba(138,112,32,0.35)" },
  scott: { label: "Support", color: "text-teal-300", bg: "rgba(8,45,42,0.85)", border: "rgba(20,184,166,0.35)" },
  captain: { label: "Summoner", color: "text-red-300", bg: "rgba(55,12,12,0.85)", border: "rgba(220,38,38,0.35)" },
  engineer: { label: "Builder", color: "text-yellow-300", bg: "rgba(50,38,5,0.85)", border: "rgba(234,179,8,0.35)" },
};

const heroOptions: HeroType[] = [
  "tiger", "tenor", "mathey", "rocky", "scott", "captain", "engineer",
];

const CIRCLE = 34;
const GAP = 3;
const STEP = CIRCLE + GAP;
const VISIBLE_COUNT = 5;
const VP_W = VISIBLE_COUNT * CIRCLE + (VISIBLE_COUNT - 1) * GAP;
const VP_H = Math.ceil(CIRCLE * 1.15) + 4;
const VP_CX = VP_W / 2;
const VP_CY = VP_H / 2;

function circularDiff(idx: number, center: number, len: number): number {
  const raw = ((idx - center) % len + len) % len;
  return raw > len / 2 ? raw - len : raw;
}

interface HeroSelectorProps {
  selectedHero: HeroType | null;
  setSelectedHero: (hero: HeroType) => void;
  hoveredHero: HeroType | null;
  setHoveredHero: (hero: HeroType | null) => void;
  onOpenCodex?: () => void;
  compact?: boolean;
}

export const HeroSelector: React.FC<HeroSelectorProps> = ({
  selectedHero,
  setSelectedHero,
  setHoveredHero,
  onOpenCodex,
  compact = false,
}) => {
  const [showHallOfHeroes, setShowHallOfHeroes] = React.useState(false);
  const [centerIdx, setCenterIdx] = React.useState(() =>
    selectedHero ? heroOptions.indexOf(selectedHero) : 0
  );

  useEffect(() => {
    if (selectedHero) setCenterIdx(heroOptions.indexOf(selectedHero));
  }, [selectedHero]);

  const navigate = useCallback((dir: -1 | 1) => {
    setCenterIdx(prev => (prev + dir + heroOptions.length) % heroOptions.length);
  }, []);

  const selectHero = useCallback((heroType: HeroType) => {
    if (heroType === selectedHero) {
      setShowHallOfHeroes(true);
      return;
    }
    setSelectedHero(heroType);
    setCenterIdx(heroOptions.indexOf(heroType));
  }, [setSelectedHero, selectedHero]);

  if (compact) {
    const centeredHero = heroOptions[centerIdx];
    const centeredData = HERO_DATA[centeredHero];

    return (
      <>
        <div
          className="flex-1 relative rounded-xl flex items-center min-w-0 gap-1.5 px-2 py-1"
          style={{
            background: 'linear-gradient(180deg, rgba(38,32,24,0.97), rgba(24,20,14,0.99))',
            border: '1.5px solid rgba(180,140,60,0.4)',
            boxShadow: 'inset 0 0 24px rgba(180,140,60,0.05), 0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.1)' }} />

          {/* Helmet icon — opens Hall of Heroes */}
          <HudTooltip label="Hall of Heroes" position="top">
            <button
              onClick={() => setShowHallOfHeroes(true)}
              className="flex-shrink-0 relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(120,85,20,0.45), rgba(20,16,10,0.8))',
                border: '1.5px solid rgba(180,140,60,0.4)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 0 8px rgba(180,140,60,0.15)',
              }}
            >
              <HeroHelmetIcon size={16} />
            </button>
          </HudTooltip>

          {/* Carousel track */}
          <div
            className="relative z-10 flex items-center gap-1 rounded-xl px-1 flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, rgba(20,17,12,0.6), rgba(28,24,16,0.5))',
              border: '1px solid rgba(120,95,50,0.18)',
              boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(180,140,60,0.08)',
              padding: '3px 4px',
            }}
          >
            {/* Left arrow */}
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
              style={{ background: 'rgba(180,140,60,0.12)', border: '1px solid rgba(180,140,60,0.2)' }}
            >
              <ChevronLeft size={11} className="text-amber-400/80" />
            </button>

            {/* Wheel viewport */}
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{ width: VP_W, height: VP_H }}
            >
              {heroOptions.map((heroType, idx) => {
                const hero = HERO_DATA[heroType];
                const diff = circularDiff(idx, centerIdx, heroOptions.length);
                const absDiff = Math.abs(diff);
                const isCenter = diff === 0;
                const halfVisible = Math.floor(VISIBLE_COUNT / 2);
                const isVisible = absDiff <= halfVisible;
                const isSel = selectedHero === heroType;
                const scale = isCenter ? 1.15 : 0.82;
                const x = VP_CX + diff * STEP - CIRCLE / 2;
                const y = VP_CY - CIRCLE / 2;

                return (
                  <button
                    key={heroType}
                    onClick={() => selectHero(heroType)}
                    title={`${hero.name} — ${HERO_ROLES[heroType].label}${isSel ? ' (Equipped)' : ''}`}
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      width: CIRCLE,
                      height: CIRCLE,
                      left: 0,
                      top: 0,
                      transform: `translate(${x}px, ${y}px) scale(${scale})`,
                      opacity: isVisible ? (isCenter ? 1 : 0.55) : 0,
                      pointerEvents: isVisible ? 'auto' : 'none',
                      background: isSel
                        ? `radial-gradient(circle at 30% 30%, ${hero.color}40, ${hero.color}12)`
                        : isCenter
                          ? `radial-gradient(circle at 30% 30%, ${hero.color}25, ${hero.color}08)`
                          : 'radial-gradient(circle at 30% 30%, rgba(38,34,28,0.9), rgba(24,20,16,0.9))',
                      border: `2px solid ${isSel ? hero.color : isCenter ? `${hero.color}80` : 'rgba(100,90,70,0.25)'}`,
                      boxShadow: isSel
                        ? `0 0 14px ${hero.color}35, inset 0 0 8px ${hero.color}15`
                        : isCenter ? `0 0 10px ${hero.color}20` : 'none',
                      transition: 'transform 0.35s cubic-bezier(0.4,0,0.15,1), opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
                      zIndex: isCenter ? 3 : 1,
                    }}
                  >
                    <HeroSprite type={heroType} size={isCenter ? 26 : 20} />
                    {isSel && (
                      <div
                        className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] text-white font-bold border-[1.5px] border-stone-900"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}
                      >
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => navigate(1)}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
              style={{ background: 'rgba(180,140,60,0.12)', border: '1px solid rgba(180,140,60,0.2)' }}
            >
              <ChevronRight size={11} className="text-amber-400/80" />
            </button>
          </div>

          {/* Hero info */}
          <div className="relative z-10 flex-1 flex items-center gap-2 min-w-0 ml-1.5 px-2 py-1.5">
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-amber-100 leading-tight truncate drop-shadow-sm">
                {centeredData.name}
              </span>
              <span className={`text-[9px] font-semibold leading-tight ${HERO_ROLES[centeredHero].color}`}>
                {HERO_ROLES[centeredHero].label}
              </span>
            </div>
            {onOpenCodex && (
              <HudTooltip label="View in Codex" position="top">
                <button
                  onClick={onOpenCodex}
                  className="flex-shrink-0 ml-auto mr-0.5 flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
                >
                  <Info size={14} className="text-amber-400/60 hover:text-amber-400" />
                </button>
              </HudTooltip>
            )}
          </div>

        </div>

        {showHallOfHeroes && (
          <HallOfHeroesModal
            isOpen
            onClose={() => setShowHallOfHeroes(false)}
            selectedHero={selectedHero}
            onSelectHero={setSelectedHero}
          />
        )}
      </>
    );
  }

  /* ── Expanded (old) layout ── */
  return (
    <div className="flex-1 relative rounded-xl flex flex-col min-w-0"
      style={{
        background: 'linear-gradient(180deg, rgba(38,32,24,0.97) 0%, rgba(24,20,14,0.99) 100%)',
        border: '1.5px solid rgba(180,140,60,0.4)',
        boxShadow: 'inset 0 0 24px rgba(180,140,60,0.05), 0 4px 24px rgba(0,0,0,0.5)',
      }}>
      <div className="absolute inset-[3px] rounded-[10px] pointer-events-none" style={{ border: '1px solid rgba(180,140,60,0.1)' }} />
      <div className="px-3 py-2 relative flex items-center justify-between"
        style={{ background: 'linear-gradient(90deg, rgba(180,130,40,0.18), rgba(120,80,20,0.08), transparent)' }}>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <HeroHelmetIcon size={18} />
          <span className="text-[9px] text-nowrap font-bold text-amber-300/90 tracking-[0.2em] uppercase">
            Select Champion
          </span>
        </div>
        {onOpenCodex && (
          <button
            onClick={onOpenCodex}
            className="flex items-center justify-center w-5 h-5 rounded-md transition-all hover:scale-110 hover:brightness-125"
            style={{
              background: 'rgba(180,140,60,0.12)',
              border: '1px solid rgba(180,140,60,0.25)',
            }}
            title="View in Codex"
          >
            <Info size={10} className="text-amber-400/70" />
          </button>
        )}
        <div className="absolute bottom-0 left-3 right-3 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,60,0.35) 20%, rgba(255,200,80,0.45) 50%, rgba(180,140,60,0.35) 80%, transparent)' }} />
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex gap-1.5 mb-2 w-full">
          {heroOptions.map((heroType) => {
            const hero = HERO_DATA[heroType];
            const isSelected = selectedHero === heroType;
            return (
              <button
                key={heroType}
                onClick={() => setSelectedHero(heroType)}
                onMouseEnter={() => setHoveredHero(heroType)}
                onMouseLeave={() => setHoveredHero(null)}
                className={`relative flex flex-col items-center w-full p-2.5 rounded-lg transition-all duration-200 ${isSelected
                  ? "scale-110 z-10"
                  : "hover:scale-105 hover:brightness-110"
                  }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${hero.color}35, ${hero.color}15)`
                    : 'linear-gradient(135deg, rgba(38, 34, 30, 0.95), rgba(24, 20, 16, 0.95))',
                  border: `1.5px solid ${isSelected ? hero.color : 'rgba(100, 90, 70, 0.25)'}`,
                  boxShadow: isSelected
                    ? `0 0 14px ${hero.color}30, inset 0 0 12px ${hero.color}10, inset 0 1px 0 rgba(255,255,255,0.08)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                  outline: isSelected ? `2px solid ${hero.color}60` : 'none',
                  outlineOffset: '1px',
                }}
              >
                <div>
                  <HeroSprite type={heroType} size={36} />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-semibold px-1.5 py-px rounded inline-block whitespace-nowrap"
                  style={{ background: HERO_ROLES[heroType].bg, border: `1px solid ${HERO_ROLES[heroType].border}` }}>
                  <span className={HERO_ROLES[heroType].color}>{HERO_ROLES[heroType].label}</span>
                </span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-stone-900 text-[8px] text-white font-bold"
                    style={{ boxShadow: '0 0 6px rgba(245,158,11,0.5)' }}>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedHero ? (
          <div className="rounded-lg p-1.5 relative"
            style={{
              background: 'linear-gradient(180deg, rgba(28,24,18,0.8), rgba(20,16,12,0.9))',
              border: '1px solid rgba(120,100,60,0.2)',
            }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] font-bold text-amber-200 whitespace-nowrap">
                  {HERO_DATA[selectedHero].name}
                </span>
                <HeroIcon type={selectedHero} size={14} />
              </div>
              <div className="flex items-center gap-0 rounded-md overflow-hidden flex-1 min-w-0"
                style={{ border: '1px solid rgba(100,80,50,0.15)' }}>
                {[
                  { icon: <Heart size={8} className="text-red-400" />, value: HERO_DATA[selectedHero].hp, color: "text-red-300", bg: "rgba(127,29,29,0.2)" },
                  { icon: <Swords size={8} className="text-orange-400" />, value: HERO_DATA[selectedHero].damage, color: "text-orange-300", bg: "rgba(124,45,18,0.2)" },
                  { icon: <Target size={8} className="text-blue-400" />, value: HERO_DATA[selectedHero].range, color: "text-blue-300", bg: "rgba(30,58,138,0.2)" },
                  { icon: <Gauge size={8} className="text-green-400" />, value: HERO_DATA[selectedHero].speed, color: "text-green-300", bg: "rgba(20,83,45,0.2)" },
                  { icon: <Timer size={8} className="text-purple-400" />, value: `${HERO_ABILITY_COOLDOWNS[selectedHero] / 1000}s`, color: "text-purple-300", bg: "rgba(88,28,135,0.2)" },
                ].map((stat, idx) => (
                  <div key={idx} className="flex-1 flex items-center justify-center gap-1 py-1"
                    style={{ background: stat.bg, borderRight: idx < 4 ? '1px solid rgba(100,80,50,0.1)' : 'none' }}>
                    {stat.icon}
                    <span className={`text-[9px] font-bold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-md"
              style={{ background: 'rgba(88,28,135,0.12)', border: '1px solid rgba(88,28,135,0.15)' }}>
              <HeroAbilityIcon type={selectedHero} size={10} />
              <span className="text-[9px] font-semibold text-purple-200">
                {HERO_DATA[selectedHero].ability}:
              </span>
              <span className="text-[9px] text-purple-300/80 truncate">
                {HERO_DATA[selectedHero].abilityDesc}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[10px] text-amber-600/50 italic">Choose your champion...</span>
          </div>
        )}
      </div>
    </div>
  );
};
