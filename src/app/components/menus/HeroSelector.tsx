"use client";
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
import React, { useEffect, useCallback } from "react";

import { HERO_DATA, HERO_ABILITY_COOLDOWNS, HERO_ROLES } from "../../constants";
import { HeroSprite, HeroAbilityIcon, HeroIcon } from "../../sprites";
import { HeroHelmetIcon } from "../../sprites/custom-icons";
import type { HeroType } from "../../types";
import { heroFrameElements } from "../ui/primitives/ornateFrameHelpers";
import { HudTooltip } from "../ui/tooltips/HudTooltip";
import { HallOfHeroesModal } from "./HallOfHeroesModal";
import { hexToRgba } from "./shared/colorUtils";
import { HERO_OPTIONS } from "./shared/loadoutOptions";
import { circularDiff } from "./shared/menuMath";

const CIRCLE = 42;
const GAP = 6;
const STEP = CIRCLE + GAP;
const VISIBLE_COUNT = 3;
const VP_W = VISIBLE_COUNT * CIRCLE + (VISIBLE_COUNT - 1) * GAP;
const VP_H = CIRCLE + 20;
const VP_CX = VP_W / 2;
const VP_CY = VP_H / 2;

const SEL_FRAME = 58;
const SEL_CX = SEL_FRAME / 2;

const ACT_FRAME = 54;
const ACT_CX = ACT_FRAME / 2;

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
  hoveredHero,
  setHoveredHero,
  onOpenCodex,
  compact = false,
}) => {
  const [showHallOfHeroes, setShowHallOfHeroes] = React.useState(false);
  const [hohHovered, setHohHovered] = React.useState(false);
  const [centerIdx, setCenterIdx] = React.useState(() =>
    selectedHero ? HERO_OPTIONS.indexOf(selectedHero) : 0
  );

  useEffect(() => {
    if (selectedHero) {
      setCenterIdx(HERO_OPTIONS.indexOf(selectedHero));
    }
  }, [selectedHero]);

  const navigate = useCallback((dir: -1 | 1) => {
    setCenterIdx(
      (prev) => (prev + dir + HERO_OPTIONS.length) % HERO_OPTIONS.length
    );
  }, []);

  const handleHeroClick = useCallback(
    (heroType: HeroType, isCenter: boolean) => {
      if (!isCenter) {
        setCenterIdx(HERO_OPTIONS.indexOf(heroType));
        return;
      }
      if (heroType === selectedHero) {
        setShowHallOfHeroes(true);
      } else {
        setSelectedHero(heroType);
      }
    },
    [setSelectedHero, selectedHero]
  );

  if (compact) {
    const centeredHero = HERO_OPTIONS[centerIdx];
    const centeredData = HERO_DATA[centeredHero];

    return (
      <>
        <div
          className="flex-1 relative rounded-xl flex items-center min-w-0 gap-1.5 p-2 pr-3 py-1"
          style={{
            background:
              "linear-gradient(180deg, rgba(38,32,24,0.97), rgba(24,20,14,0.99))",
            border: "1.5px solid rgba(180,140,60,0.4)",
            boxShadow:
              "inset 0 0 24px rgba(180,140,60,0.05), 0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="absolute inset-[3px] rounded-[10px] pointer-events-none"
            style={{ border: "1px solid rgba(180,140,60,0.1)" }}
          />

          {/* Carousel track */}
          <div
            className="relative z-10 flex items-center gap-1 rounded-xl px-1 flex-shrink-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(20,17,12,0.6), rgba(28,24,16,0.5))",
              border: "1px solid rgba(120,95,50,0.18)",
              boxShadow:
                "inset 0 1px 4px rgba(0,0,0,0.3), inset 0 -1px 0 rgba(180,140,60,0.08)",
              padding: "3px 4px",
            }}
          >
            {/* Left arrow */}
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110 hover:brightness-125"
              style={{
                background: "rgba(180,140,60,0.12)",
                border: "1px solid rgba(180,140,60,0.2)",
              }}
            >
              <ChevronLeft size={11} className="text-amber-400/80" />
            </button>

            {/* Wheel viewport */}
            <div
              className="relative overflow-hidden flex-shrink-0"
              style={{ height: VP_H, width: VP_W }}
            >
              {HERO_OPTIONS.map((heroType, idx) => {
                const hero = HERO_DATA[heroType];
                const diff = circularDiff(idx, centerIdx, HERO_OPTIONS.length);
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
                    onClick={() => handleHeroClick(heroType, isCenter)}
                    onMouseEnter={() => setHoveredHero(heroType)}
                    onMouseLeave={() => setHoveredHero(null)}
                    title={`${hero.name} — ${HERO_ROLES[heroType].label}${isSel ? " (Equipped)" : ""}`}
                    className="absolute flex items-center justify-center rounded-full"
                    style={{
                      background: isSel
                        ? `radial-gradient(circle at 30% 30%, ${hero.color}40, ${hero.color}12)`
                        : isCenter
                          ? `radial-gradient(circle at 30% 30%, ${hero.color}25, ${hero.color}08)`
                          : `radial-gradient(circle at 30% 30%, ${hero.color}18, ${hero.color}06)`,
                      border: `2px solid ${isSel ? hero.color : isCenter ? `${hero.color}80` : `${hero.color}30`}`,
                      boxShadow: isSel
                        ? `0 0 14px ${hero.color}35, inset 0 0 8px ${hero.color}15`
                        : isCenter
                          ? `0 0 10px ${hero.color}20`
                          : `inset 0 0 6px ${hero.color}10`,
                      height: CIRCLE,
                      left: 0,
                      opacity: isVisible ? (isCenter ? 1 : 0.55) : 0,
                      pointerEvents: isVisible ? "auto" : "none",
                      top: 0,
                      transform: `translate(${x}px, ${y}px) scale(${scale})`,
                      transition:
                        "transform 0.35s cubic-bezier(0.4,0,0.15,1), opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease",
                      width: CIRCLE,
                      zIndex: isCenter ? 3 : 1,
                    }}
                  >
                    {/* Hero frame */}
                    <svg
                      className="absolute pointer-events-none z-0"
                      style={{
                        filter:
                          hoveredHero === heroType
                            ? `drop-shadow(0 0 5px ${hexToRgba(hero.color, 0.35)})`
                            : "none",
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%)${hoveredHero === heroType ? " rotate(45deg) scale(1.06)" : ""}`,
                        transition:
                          "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                      }}
                      width={SEL_FRAME}
                      height={SEL_FRAME}
                      overflow="visible"
                    >
                      {heroFrameElements({
                        color: hexToRgba(
                          hero.color,
                          hoveredHero === heroType
                            ? 0.45
                            : isSel
                              ? 0.3
                              : isCenter
                                ? 0.2
                                : 0.14
                        ),
                        cx: SEL_CX,
                        dimColor: hexToRgba(
                          hero.color,
                          hoveredHero === heroType
                            ? 0.22
                            : isSel
                              ? 0.15
                              : isCenter
                                ? 0.1
                                : 0.07
                        ),
                        midR: SEL_CX - 4,
                        outerR: SEL_CX - 2,
                        prefix: `hc-${heroType}`,
                      })}
                    </svg>
                    <div
                      className="absolute inset-[1px] rounded-full pointer-events-none z-[1]"
                      style={{
                        borderBottom: `1px solid rgba(0,0,0,${isSel || isCenter ? "0.12" : "0.05"})`,
                        borderLeft: "1px solid transparent",
                        borderRight: "1px solid transparent",
                        borderTop: `1px solid rgba(255,255,255,${isSel || isCenter ? "0.08" : "0.03"})`,
                      }}
                    />
                    {isCenter && (
                      <div
                        className="absolute rounded-full pointer-events-none z-[1]"
                        style={{
                          background: `radial-gradient(ellipse at 50% 60%, rgba(255,255,255,${isSel ? "0.1" : "0.06"}), transparent 55%)`,
                          filter: "blur(1px)",
                          height: "30%",
                          left: 3,
                          top: 2,
                          width: "36%",
                        }}
                      />
                    )}
                    <HeroSprite type={heroType} size={isCenter ? 30 : 26} />
                    {isSel && (
                      <div
                        className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full flex items-center justify-center text-[9px] text-white font-black border-[1.5px] border-stone-900 z-20"
                        style={{
                          background:
                            "linear-gradient(135deg, #f59e0b, #d97706)",
                          boxShadow:
                            "0 0 8px rgba(245,158,11,0.6), 0 0 3px rgba(245,158,11,0.8)",
                        }}
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
              style={{
                background: "rgba(180,140,60,0.12)",
                border: "1px solid rgba(180,140,60,0.2)",
              }}
            >
              <ChevronRight size={11} className="text-amber-400/80" />
            </button>
          </div>

          {/* Hero info + Hall of Heroes button */}
          <div className="relative z-10 flex-1 flex items-center gap-1.5 min-w-0 px-1 py-1.5">
            <div className="flex flex-col justify-center gap-[3px] min-w-0 flex-1 overflow-hidden">
              {/* Row 1: Name + Role */}
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="text-[11px] font-bold leading-tight truncate drop-shadow-sm"
                  style={{ color: centeredData.color }}
                >
                  {centeredData.name}
                </span>
                <span
                  className={`text-[7px] font-semibold px-1 py-[1px] rounded flex-shrink-0 ${HERO_ROLES[centeredHero].color}`}
                  style={{
                    background: HERO_ROLES[centeredHero].bg,
                    border: `1px solid ${HERO_ROLES[centeredHero].border}`,
                  }}
                >
                  {HERO_ROLES[centeredHero].label}
                </span>
              </div>

              {/* Row 2: Ability + Cooldown */}
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className="flex items-center gap-[2px] rounded px-1 py-[1px] text-[7px] font-semibold text-purple-200 min-w-0 truncate"
                  style={{
                    background: "rgba(88,28,135,0.2)",
                    border: "1px solid rgba(88,28,135,0.2)",
                  }}
                >
                  <HeroAbilityIcon
                    type={centeredHero}
                    size={8}
                    className="flex-shrink-0"
                  />
                  <span className="truncate">{centeredData.ability}</span>
                </span>
                <span
                  className="flex items-center gap-[1px] text-[6px] font-semibold rounded px-[3px] py-[1px] flex-shrink-0"
                  style={{
                    background: "rgba(113,63,18,0.2)",
                    border: "1px solid rgba(113,63,18,0.15)",
                  }}
                >
                  <Timer size={6} className="text-amber-400" />
                  <span className="text-amber-300/90">
                    {HERO_ABILITY_COOLDOWNS[centeredHero] / 1000}s
                  </span>
                </span>
              </div>

              {/* Row 3: Stats */}
              <div className="flex items-center gap-[2px] flex-wrap">
                {(
                  [
                    {
                      bg: "rgba(127,29,29,0.2)",
                      border: "rgba(127,29,29,0.15)",
                      icon: Heart,
                      iconClass: "text-red-400",
                      valClass: "text-red-300/90",
                      value: centeredData.hp,
                    },
                    {
                      bg: "rgba(124,45,18,0.2)",
                      border: "rgba(124,45,18,0.15)",
                      icon: Swords,
                      iconClass: "text-orange-400",
                      valClass: "text-orange-300/90",
                      value: centeredData.damage,
                    },
                    {
                      bg: "rgba(30,58,138,0.2)",
                      border: "rgba(30,58,138,0.15)",
                      icon: Target,
                      iconClass: "text-blue-400",
                      valClass: "text-blue-300/90",
                      value: centeredData.range,
                    },
                    {
                      bg: "rgba(6,78,59,0.2)",
                      border: "rgba(6,78,59,0.15)",
                      icon: Gauge,
                      iconClass: "text-emerald-400",
                      valClass: "text-emerald-300/90",
                      value: centeredData.speed,
                    },
                  ] as const
                ).map((stat, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-[1px] text-[6px] font-semibold rounded px-[3px] py-[1px]"
                    style={{
                      background: stat.bg,
                      border: `1px solid ${stat.border}`,
                    }}
                  >
                    <stat.icon size={6} className={stat.iconClass} />
                    <span className={stat.valClass}>{stat.value}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Hall of Heroes button */}
            {(() => {
              const SIZE = 38;
              const STROKE = 2.5;
              return (
                <HudTooltip label="Hall of Heroes" position="top">
                  <button
                    type="button"
                    onClick={() => setShowHallOfHeroes(true)}
                    onMouseEnter={() => setHohHovered(true)}
                    onMouseLeave={() => setHohHovered(false)}
                    className="flex-shrink-0 ml-auto relative transition-all hover:scale-110 hover:brightness-110"
                    style={{ height: SIZE, width: SIZE }}
                  >
                    {/* Hero frame */}
                    <svg
                      className="absolute pointer-events-none"
                      style={{
                        filter: hohHovered
                          ? "drop-shadow(0 0 6px rgba(180,140,60,0.35))"
                          : "none",
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%)${hohHovered ? " rotate(45deg) scale(1.07)" : ""}`,
                        transition:
                          "transform 0.5s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease",
                      }}
                      width={ACT_FRAME}
                      height={ACT_FRAME}
                      overflow="visible"
                    >
                      {heroFrameElements({
                        color: hohHovered
                          ? "rgba(180,140,60,0.4)"
                          : "rgba(180,140,60,0.25)",
                        cx: ACT_CX,
                        dimColor: hohHovered
                          ? "rgba(180,140,60,0.2)"
                          : "rgba(180,140,60,0.12)",
                        midR: ACT_CX - 4,
                        outerR: ACT_CX - 2,
                        prefix: "hoh",
                      })}
                    </svg>
                    {/* Ring */}
                    <svg
                      className="absolute inset-0"
                      width={SIZE}
                      height={SIZE}
                    >
                      <circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={(SIZE - STROKE) / 2}
                        fill="none"
                        stroke="rgba(180,140,60,0.4)"
                        strokeWidth={STROKE}
                      />
                    </svg>
                    {/* Inner circle */}
                    <div
                      className="absolute rounded-full flex items-center justify-center overflow-hidden"
                      style={{
                        background:
                          "radial-gradient(circle at 32% 28%, rgba(170,125,35,0.95), rgba(95,68,16,0.9))",
                        border: "1.5px solid rgba(250,204,21,0.5)",
                        boxShadow:
                          "0 0 12px rgba(250,204,21,0.12), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.2)",
                        inset: STROKE + 1,
                      }}
                    >
                      <div
                        className="absolute rounded-full pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.14), transparent 55%)",
                          filter: "blur(1px)",
                          height: "38%",
                          left: 2,
                          top: 1,
                          width: "45%",
                        }}
                      />
                      <HeroHelmetIcon size={22} />
                    </div>
                  </button>
                </HudTooltip>
              );
            })()}
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
    <div
      className="flex-1 relative rounded-xl flex flex-col min-w-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(38,32,24,0.97) 0%, rgba(24,20,14,0.99) 100%)",
        border: "1.5px solid rgba(180,140,60,0.4)",
        boxShadow:
          "inset 0 0 24px rgba(180,140,60,0.05), 0 4px 24px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="absolute inset-[3px] rounded-[10px] pointer-events-none"
        style={{ border: "1px solid rgba(180,140,60,0.1)" }}
      />
      <div
        className="px-3 py-2 relative flex items-center justify-between"
        style={{
          background:
            "linear-gradient(90deg, rgba(180,130,40,0.18), rgba(120,80,20,0.08), transparent)",
        }}
      >
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
              background: "rgba(180,140,60,0.12)",
              border: "1px solid rgba(180,140,60,0.25)",
            }}
            title="View in Codex"
          >
            <Info size={10} className="text-amber-400/70" />
          </button>
        )}
        <div
          className="absolute bottom-0 left-3 right-3 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(180,140,60,0.35) 20%, rgba(255,200,80,0.45) 50%, rgba(180,140,60,0.35) 80%, transparent)",
          }}
        />
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div className="flex gap-1.5 mb-2 w-full">
          {HERO_OPTIONS.map((heroType) => {
            const hero = HERO_DATA[heroType];
            const isSelected = selectedHero === heroType;
            return (
              <button
                key={heroType}
                onClick={() => setSelectedHero(heroType)}
                onMouseEnter={() => setHoveredHero(heroType)}
                onMouseLeave={() => setHoveredHero(null)}
                className={`relative flex flex-col items-center w-full p-2.5 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? "scale-110 z-10"
                    : "hover:scale-105 hover:brightness-110"
                }`}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${hero.color}35, ${hero.color}15)`
                    : "linear-gradient(135deg, rgba(38, 34, 30, 0.95), rgba(24, 20, 16, 0.95))",
                  border: `1.5px solid ${isSelected ? hero.color : "rgba(100, 90, 70, 0.25)"}`,
                  boxShadow: isSelected
                    ? `0 0 14px ${hero.color}30, inset 0 0 12px ${hero.color}10, inset 0 1px 0 rgba(255,255,255,0.08)`
                    : "inset 0 1px 0 rgba(255,255,255,0.04)",
                  outline: isSelected ? `2px solid ${hero.color}60` : "none",
                  outlineOffset: "1px",
                }}
              >
                <div>
                  <HeroSprite type={heroType} size={36} />
                </div>
                <span
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[7px] font-semibold px-1.5 py-px rounded inline-block whitespace-nowrap"
                  style={{
                    background: HERO_ROLES[heroType].bg,
                    border: `1px solid ${HERO_ROLES[heroType].border}`,
                  }}
                >
                  <span className={HERO_ROLES[heroType].color}>
                    {HERO_ROLES[heroType].label}
                  </span>
                </span>
                {isSelected && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-stone-900 text-[8px] text-white font-bold"
                    style={{ boxShadow: "0 0 6px rgba(245,158,11,0.5)" }}
                  >
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>
        {selectedHero ? (
          <div
            className="rounded-lg p-1.5 relative"
            style={{
              background:
                "linear-gradient(180deg, rgba(28,24,18,0.8), rgba(20,16,12,0.9))",
              border: "1px solid rgba(120,100,60,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] font-bold text-amber-200 whitespace-nowrap">
                  {HERO_DATA[selectedHero].name}
                </span>
                <HeroIcon type={selectedHero} size={14} />
              </div>
              <div
                className="flex items-center gap-0 rounded-md overflow-hidden flex-1 min-w-0"
                style={{ border: "1px solid rgba(100,80,50,0.15)" }}
              >
                {[
                  {
                    bg: "rgba(127,29,29,0.2)",
                    color: "text-red-300",
                    icon: <Heart size={8} className="text-red-400" />,
                    value: HERO_DATA[selectedHero].hp,
                  },
                  {
                    bg: "rgba(124,45,18,0.2)",
                    color: "text-orange-300",
                    icon: <Swords size={8} className="text-orange-400" />,
                    value: HERO_DATA[selectedHero].damage,
                  },
                  {
                    bg: "rgba(30,58,138,0.2)",
                    color: "text-blue-300",
                    icon: <Target size={8} className="text-blue-400" />,
                    value: HERO_DATA[selectedHero].range,
                  },
                  {
                    bg: "rgba(20,83,45,0.2)",
                    color: "text-green-300",
                    icon: <Gauge size={8} className="text-green-400" />,
                    value: HERO_DATA[selectedHero].speed,
                  },
                  {
                    bg: "rgba(88,28,135,0.2)",
                    color: "text-purple-300",
                    icon: <Timer size={8} className="text-purple-400" />,
                    value: `${HERO_ABILITY_COOLDOWNS[selectedHero] / 1000}s`,
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex items-center justify-center gap-1 py-1"
                    style={{
                      background: stat.bg,
                      borderRight:
                        idx < 4 ? "1px solid rgba(100,80,50,0.1)" : "none",
                    }}
                  >
                    {stat.icon}
                    <span className={`text-[9px] font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-md"
              style={{
                background: "rgba(88,28,135,0.12)",
                border: "1px solid rgba(88,28,135,0.15)",
              }}
            >
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
            <span className="text-[10px] text-amber-600/50 italic">
              Choose your champion...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
