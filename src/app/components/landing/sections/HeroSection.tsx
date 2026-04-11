"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ScrollText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef } from "react";

import { TOWER_DATA, TOWER_ACCENTS } from "../../../constants/towers";
import { TowerSprite } from "../../../sprites/towers";
import type { TowerType } from "../../../types";
import { useCrossfade } from "../hooks/useCrossfade";
import {
  LANDING_THEME,
  HERO_SLIDESHOW_IMAGES,
  CROSSFADE_INTERVAL_MS,
  CROSSFADE_TRANSITION_MS,
  LANDING_EMBERS,
  LANDING_EMBER_COLORS,
} from "../landingConstants";
import type { EmberConfig } from "../landingConstants";
import { LandingCTA } from "../LandingCTA";
import { MapWaves, MapTrails, ParchmentOverlay } from "./mapElements";
import { SpriteDisplay } from "./SpriteDisplay";

const T = LANDING_THEME;

const TOWER_ORDER: TowerType[] = [
  "cannon",
  "library",
  "lab",
  "arch",
  "club",
  "station",
  "mortar",
];

const TOWER_VIS = 120;
const TOWER_SCALE = 2.2;
const TOWER_CANVAS = Math.round(TOWER_VIS * TOWER_SCALE);

const T_CARD_W = 142;
const T_VISIBLE_HALF = 2;
const T_PAD = 20;
const T_VP_W = (T_VISIBLE_HALF * 2 + 1) * T_CARD_W + T_PAD * 2;
const T_VP_CX = T_VP_W / 2;
const T_ITEM_W = TOWER_VIS + 14;
const T_ITEM_H = TOWER_VIS + 90;
const T_EASING = "cubic-bezier(0.4, 0, 0.15, 1)";

function circularDiff(index: number, center: number, length: number): number {
  const raw = (((index - center) % length) + length) % length;
  return raw > length / 2 ? raw - length : raw;
}

function getTowerLabel(
  type: TowerType,
  tl: { level: number; upgrade?: "A" | "B" }
): string {
  const name =
    tl.level < 4
      ? TOWER_DATA[type].name
      : TOWER_DATA[type].upgrades[tl.upgrade ?? "A"].name;
  return `${name} · Lv.${tl.level}`;
}

const TOWER_BG_GRADIENT: Record<TowerType, string> = {
  arch: "linear-gradient(170deg in oklch, oklch(0.35 0.08 250) 0%, oklch(0.14 0.02 250) 100%)",
  cannon:
    "linear-gradient(170deg in oklch, oklch(0.35 0.08 25) 0%, oklch(0.14 0.02 25) 100%)",
  club: "linear-gradient(170deg in oklch, oklch(0.35 0.08 80) 0%, oklch(0.14 0.02 80) 100%)",
  lab: "linear-gradient(170deg in oklch, oklch(0.35 0.08 95) 0%, oklch(0.14 0.02 95) 100%)",
  library:
    "linear-gradient(170deg in oklch, oklch(0.35 0.08 200) 0%, oklch(0.14 0.02 200) 100%)",
  mortar:
    "linear-gradient(170deg in oklch, oklch(0.35 0.08 55) 0%, oklch(0.14 0.02 55) 100%)",
  station:
    "linear-gradient(170deg in oklch, oklch(0.35 0.08 300) 0%, oklch(0.14 0.02 300) 100%)",
};

const HERO_TOWER_SPRITE_TWEAKS: Record<
  TowerType,
  { spriteScale: number; x: number; y: number }
> = {
  arch: { spriteScale: 0.9, x: 0, y: 2 },
  cannon: { spriteScale: 0.9, x: 1, y: -1 },
  club: { spriteScale: 0.9, x: 0, y: -2 },
  lab: { spriteScale: 0.95, x: 0, y: -2 },
  library: { spriteScale: 0.9, x: 0, y: -2 },
  mortar: { spriteScale: 0.8, x: 0, y: 4 },
  station: { spriteScale: 0.9, x: 0, y: 2 },
};

const STATS = [
  { value: "26", label: "Levels" },
  { value: "100+", label: "Enemies" },
  { value: "9", label: "Heroes" },
  { value: "7", label: "Towers" },
] as const;

interface LevelPreview {
  file: string;
  id: string;
  name: string;
}

const LEFT_PREVIEWS: LevelPreview[] = [
  { file: "nassau", id: "nassau", name: "Nassau Hall" },
  { file: "poe", id: "poe", name: "Poe Field" },
  { file: "carnegie", id: "carnegie", name: "Carnegie Lake" },
  { file: "glacier", id: "glacier", name: "Glacier Path" },
  { file: "caldera", id: "crater", name: "Caldera Basin" },
  { file: "pyramid", id: "pyramid", name: "Pyramid Pass" },
  { file: "witch_hut", id: "witch_hut", name: "Witch's Domain" },
  { file: "fortress", id: "fortress", name: "Frost Fortress" },
];

const RIGHT_PREVIEWS: LevelPreview[] = [
  { file: "lava_fields", id: "lava", name: "Lava Fields" },
  { file: "oasis", id: "oasis", name: "Desert Oasis" },
  { file: "sphinx", id: "sphinx", name: "Sphinx Gate" },
  { file: "peak", id: "peak", name: "Summit Peak" },
  { file: "throne", id: "throne", name: "Obsidian Throne" },
  { file: "sandbox", id: "sandbox", name: "Sandbox Arena" },
  { file: "sunken_temple", id: "sunken_temple", name: "Sunken Temple" },
  { file: "murky_bog", id: "bog", name: "Murky Bog" },
];

interface TowerLevel {
  level: 1 | 2 | 3 | 4;
  upgrade?: "A" | "B";
}

const LEVEL_CYCLE: TowerLevel[] = [
  { level: 1 },
  { level: 2 },
  { level: 3 },
  { level: 4, upgrade: "A" },
  { level: 4, upgrade: "B" },
];

function FrameCorner({ className }: { className: string }) {
  return (
    <div
      className={`absolute w-[7px] h-[7px] rotate-45 pointer-events-none z-10 ${className}`}
      style={{
        background:
          "radial-gradient(circle at 35% 35%, #ffe8a0, #d4aa50, #8b6914)",
        border: "1px solid #6b4f12",
        boxShadow:
          "0 0 3px rgba(0,0,0,0.5), inset 0 0 1px rgba(255,230,150,0.4)",
      }}
    />
  );
}

function LevelCard({
  preview,
  side,
}: {
  preview: LevelPreview;
  side: "left" | "right";
}) {
  return (
    <Link
      href={`/${preview.id}`}
      className="relative w-full flex-shrink-0 block group transition-all duration-300 hover:scale-[1.06] hover:z-10 p-[3px] rounded-lg"
      style={{
        aspectRatio: "21/9",
        background:
          "linear-gradient(160deg, #d4aa50 0%, #8b6914 25%, #dbb860 50%, #6b4f12 75%, #c9a048 100%)",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,220,120,0.3), 0 0 0 1px rgba(40,28,8,0.8)",
      }}
    >
      <div
        className="relative w-full h-full rounded overflow-hidden"
        style={{
          boxShadow:
            "inset 0 0 0 1px rgba(40,28,8,0.6), inset 0 0 4px rgba(0,0,0,0.4)",
        }}
      >
        <Image
          src={`/images/previews/${preview.file}.png`}
          alt={preview.name}
          fill
          sizes="220px"
          loading="lazy"
          className="object-cover transition-all duration-300 group-hover:brightness-125"
        />
        <div
          className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 16px rgba(${T.accentRgb},0.3), 0 0 20px rgba(${T.accentRgb},0.3)`,
          }}
        />
        <div
          className={`absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent ${side === "left" ? "text-right" : "text-left"}`}
        >
          <span className="text-[8px] sm:text-[9px] font-bold text-white/80 tracking-wider uppercase">
            {preview.name}
          </span>
        </div>
      </div>
      <FrameCorner className="top-[-2px] left-[-2px]" />
      <FrameCorner className="top-[-2px] right-[-2px]" />
      <FrameCorner className="bottom-[-2px] left-[-2px]" />
      <FrameCorner className="bottom-[-2px] right-[-2px]" />
      <div
        className="absolute top-[2px] left-1/2 -translate-x-1/2 w-[14px] h-[3px] pointer-events-none z-10 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #d4aa50, transparent)",
        }}
      />
      <div
        className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[14px] h-[3px] pointer-events-none z-10 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, #d4aa50, transparent)",
        }}
      />
    </Link>
  );
}

function ScrollColumn({
  levels,
  direction,
}: {
  levels: LevelPreview[];
  direction: "up" | "down";
}) {
  const doubled = [...levels, ...levels];
  const side = direction === "up" ? "left" : "right";
  return (
    <div
      className="hero-rail absolute top-0 bottom-0 w-[180px] lg:w-[220px] hidden md:block"
      style={{ [side]: 0, overflowX: "visible", overflowY: "clip" }}
    >
      <div className="hero-rail-slide relative" data-side={side}>
        <div
          className="hero-rail-track flex flex-col gap-3 py-3"
          style={{
            animation: `hero-scroll-${direction} ${levels.length * 5}s linear infinite`,
          }}
        >
          {doubled.map((preview, i) => (
            <LevelCard
              key={`${preview.file}-${i}`}
              preview={preview}
              side={side}
            />
          ))}
        </div>
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(180deg, ${T.bg} 0%, transparent 10%, transparent 90%, ${T.bg} 100%)`,
          }}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            side === "left"
              ? `linear-gradient(270deg, transparent 60%, ${T.bg} 100%)`
              : `linear-gradient(90deg, transparent 60%, ${T.bg} 100%)`,
        }}
      />
    </div>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 sm:px-5">
      <span
        className="text-2xl sm:text-4xl font-black tabular-nums leading-none"
        style={{
          color: T.princeton,
          textShadow: `0 0 24px rgba(${T.princetonRgb},0.4)`,
        }}
      >
        {value}
      </span>
      <span
        className="text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em]"
        style={{ color: `rgba(${T.accentRgb},0.35)` }}
      >
        {label}
      </span>
    </div>
  );
}

function EmberParticle({ ember }: { ember: EmberConfig }) {
  const color = LANDING_EMBER_COLORS[ember.variant];
  const hexOp = Math.round(ember.opacity * 0.4 * 255)
    .toString(16)
    .padStart(2, "0");
  return (
    <div
      className="absolute rounded-full"
      style={{
        animation: `landing-ember${ember.variant} ${ember.duration}s ${ember.delay}s linear infinite`,
        background: `radial-gradient(circle, rgba(${T.accentRgb},${ember.opacity}) 0%, ${color}${hexOp} 60%, transparent 100%)`,
        bottom: "-4%",
        boxShadow: `0 0 ${(ember.size * 2).toFixed(1)}px rgba(${T.accentRgb},${(ember.opacity * 0.35).toFixed(3)})`,
        height: `${ember.size}px`,
        left: `${ember.x}%`,
        width: `${ember.size}px`,
      }}
    />
  );
}

function HeroEmbers() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" />
    );
  }
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {LANDING_EMBERS.map((e) => (
        <EmberParticle key={e.id} ember={e} />
      ))}
    </div>
  );
}

function CreditsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-1.5 px-4 py-1.5 rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.03] active:scale-95"
      style={{
        background: `rgba(${T.accentDarkRgb},0.12)`,
        border: `1px solid rgba(${T.accentDarkRgb},0.2)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `rgba(${T.accentDarkRgb},0.22)`;
        e.currentTarget.style.borderColor = `rgba(${T.accentDarkRgb},0.35)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `rgba(${T.accentDarkRgb},0.12)`;
        e.currentTarget.style.borderColor = `rgba(${T.accentDarkRgb},0.2)`;
      }}
    >
      <ScrollText
        size={13}
        style={{ color: `rgba(${T.accentRgb},0.35)` }}
        className="group-hover:text-amber-400/60 transition-colors"
      />
      <span
        className="text-[10px] sm:text-[11px] font-medium tracking-[0.15em] uppercase"
        style={{ color: `rgba(${T.accentRgb},0.35)` }}
      >
        Credits
      </span>
    </button>
  );
}

interface HeroSectionProps {
  onPlay: () => void;
  exiting: boolean;
  onCredits: () => void;
}

const CAROUSEL_INTERVAL_MS = 3500;

export function HeroSection({ onPlay, exiting, onCredits }: HeroSectionProps) {
  const activeSlide = useCrossfade(
    HERO_SLIDESHOW_IMAGES.length,
    CROSSFADE_INTERVAL_MS
  );
  const [stages, setStages] = useState<boolean[]>(new Array(6).fill(false));
  const [towerLevels, setTowerLevels] = useState<number[]>(() =>
    new Array(TOWER_ORDER.length).fill(0)
  );

  const [carouselStart, setCarouselStart] = useState(0);
  const autoTimer = useRef(0 as unknown as ReturnType<typeof setInterval>);

  const advanceCarousel = useCallback((dir: 1 | -1) => {
    setCarouselStart(
      (prev) => (prev + dir + TOWER_ORDER.length) % TOWER_ORDER.length
    );
  }, []);

  useEffect(() => {
    autoTimer.current = setInterval(
      () => advanceCarousel(1),
      CAROUSEL_INTERVAL_MS
    );
    return () => clearInterval(autoTimer.current);
  }, [advanceCarousel]);

  const resetAutoRotate = useCallback(() => {
    clearInterval(autoTimer.current);
    autoTimer.current = setInterval(
      () => advanceCarousel(1),
      CAROUSEL_INTERVAL_MS
    );
  }, [advanceCarousel]);

  useEffect(() => {
    const delays = [100, 300, 500, 700, 900, 1200];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setStages((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const cycleTower = useCallback((idx: number, dir: 1 | -1) => {
    setTowerLevels((prev) => {
      const next = [...prev];
      next[idx] = (next[idx] + dir + LEVEL_CYCLE.length) % LEVEL_CYCLE.length;
      return next;
    });
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {HERO_SLIDESHOW_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-[-6%]"
          style={{
            animation: "landing-ken-burns 25s ease-in-out infinite alternate",
            filter: "sepia(0.2) saturate(0.85) brightness(0.95)",
            opacity: i === activeSlide ? 0.38 : 0,
            transition: `opacity ${CROSSFADE_TRANSITION_MS}ms ease-in-out`,
            willChange: "opacity",
          }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="115vw"
            className="object-cover"
            priority={i < 2}
          />
        </div>
      ))}

      <ParchmentOverlay />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(${T.bgRgb},0.7) 0%, rgba(${T.bgRgb},0.1) 30%, rgba(${T.bgRgb},0.1) 70%, rgba(${T.bgRgb},0.95) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, transparent 0%, rgba(${T.bgRgb},0.35) 60%, rgba(${T.bgRgb},0.85) 100%)`,
        }}
      />

      <MapWaves />
      <MapTrails />

      {/* Scrolling level columns — z-0 behind frame */}
      <ScrollColumn levels={LEFT_PREVIEWS} direction="up" />
      <ScrollColumn levels={RIGHT_PREVIEWS} direction="down" />

      <HeroEmbers />

      {/* Content — z-10 above everything */}
      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-4 w-full max-w-4xl">
        <div
          className="flex items-center gap-4 sm:gap-6"
          style={{
            opacity: stages[0] ? 1 : 0,
            transform: stages[0]
              ? "translateY(0) scale(1)"
              : "translateY(24px) scale(0.88)",
            transition: "all 800ms ease-out",
          }}
        >
          <Image
            src="/images/logos/princeton-td-logo.svg"
            alt="Princeton Tower Defense"
            width={72}
            height={72}
            priority
            className="sm:w-[90px] sm:h-[90px]"
            style={{ filter: `drop-shadow(0 0 14px rgba(${T.accentRgb},0.5))` }}
          />
          <div className="flex flex-col">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none"
              style={{
                color: "#fbbf24",
                textShadow: `0 0 40px rgba(${T.accentRgb},0.4), 0 2px 6px rgba(0,0,0,0.7)`,
              }}
            >
              PRINCETON
            </h1>
            <h2
              className="text-base sm:text-xl md:text-2xl font-bold tracking-[0.25em] uppercase mt-1"
              style={{
                color: "rgba(255,255,255,0.7)",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
            >
              Tower Defense
            </h2>
          </div>
        </div>

        <div
          className="flex items-center justify-center gap-1 sm:gap-2"
          style={{
            opacity: stages[1] ? 1 : 0,
            transform: stages[1] ? "translateY(0)" : "translateY(20px)",
            transition: "all 800ms ease-out",
          }}
        >
          <button
            onClick={() => {
              advanceCarousel(-1);
              resetAutoRotate();
            }}
            className="p-2 rounded-lg cursor-pointer flex-shrink-0 transition-all hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(160deg, rgba(${T.accentDarkRgb},0.2), rgba(0,0,0,0.3))`,
              border: `1px solid rgba(${T.accentDarkRgb},0.35)`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              color: T.accent,
            }}
            aria-label="Previous towers"
          >
            <ChevronLeft size={18} />
          </button>
          <div
            className="relative rounded-xl p-[2px]"
            style={{
              background: `linear-gradient(160deg, rgba(${T.accentDarkRgb},0.4), rgba(${T.accentDarkRgb},0.12), rgba(${T.accentDarkRgb},0.4))`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(${T.accentRgb},0.1)`,
            }}
          >
            <div
              className="relative rounded-[10px] overflow-hidden"
              style={{
                background: "rgba(6,4,2,0.65)",
                width: T_VP_W,
                maxWidth: "80vw",
                height: T_ITEM_H,
              }}
            >
              {TOWER_ORDER.map((type, idx) => {
                const diff = circularDiff(
                  idx,
                  carouselStart,
                  TOWER_ORDER.length
                );
                const absDiff = Math.abs(diff);
                const isCenter = diff === 0;
                const isVisible = absDiff <= T_VISIBLE_HALF;
                const accent = TOWER_ACCENTS[type];
                const tweak = HERO_TOWER_SPRITE_TWEAKS[type];
                const tl = LEVEL_CYCLE[towerLevels[idx]];
                const label = getTowerLabel(type, tl);
                const x = T_VP_CX + diff * T_CARD_W - T_ITEM_W / 2;

                return (
                  <div
                    key={type}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: 0,
                      opacity: isVisible ? 1 : 0,
                      pointerEvents: isVisible ? "auto" : "none",
                      top: 6,
                      transform: `translateX(${x}px)`,
                      transition: `transform 0.4s ${T_EASING}, opacity 0.35s ease`,
                      width: T_ITEM_W,
                      zIndex: isCenter ? 2 : 1,
                    }}
                  >
                    {/* Level up arrow */}
                    <button
                      onClick={() => cycleTower(idx, 1)}
                      className="cursor-pointer p-0.5 transition-all hover:opacity-100 opacity-50 hover:scale-110"
                      aria-label="Next level"
                    >
                      <ChevronUp size={14} style={{ color: accent }} />
                    </button>

                    {/* Tower card — click to navigate */}
                    <button
                      onClick={() => {
                        if (!isCenter) {
                          setCarouselStart(idx);
                          resetAutoRotate();
                        }
                      }}
                      className="cursor-pointer"
                      style={{ cursor: isCenter ? "default" : "pointer" }}
                    >
                      <div
                        className="relative p-[3px] rounded-lg"
                        style={{
                          background: `linear-gradient(160deg, #d4aa50, ${accent}60, #8b6914, ${accent}50, #d4aa50)`,
                          boxShadow: isCenter
                            ? `0 4px 14px rgba(0,0,0,0.5), 0 0 ${10 + tl.level * 8}px ${accent}25`
                            : `0 2px 8px rgba(0,0,0,0.4)`,
                        }}
                      >
                        <div
                          className="relative flex items-center justify-center rounded overflow-hidden"
                          style={{
                            background: TOWER_BG_GRADIENT[type],
                            boxShadow: `inset 0 0 0 1px ${accent}20, inset 0 0 12px rgba(0,0,0,0.4)`,
                            height: TOWER_VIS + 16,
                            width: TOWER_VIS + 8,
                          }}
                        >
                          <div
                            style={{
                              transform: `translate(${tweak.x}px, ${tweak.y}px) scale(${tweak.spriteScale})`,
                              transformOrigin: "50% 58%",
                            }}
                          >
                            <SpriteDisplay
                              visualSize={TOWER_VIS}
                              canvasScale={TOWER_SCALE}
                            >
                              <TowerSprite
                                type={type}
                                size={TOWER_CANVAS}
                                level={tl.level}
                                upgrade={tl.upgrade}
                              />
                            </SpriteDisplay>
                          </div>
                        </div>
                        <FrameCorner className="top-[-2px] left-[-2px]" />
                        <FrameCorner className="top-[-2px] right-[-2px]" />
                        <FrameCorner className="bottom-[-2px] left-[-2px]" />
                        <FrameCorner className="bottom-[-2px] right-[-2px]" />
                      </div>
                    </button>

                    {/* Level down arrow */}
                    <button
                      onClick={() => cycleTower(idx, -1)}
                      className="cursor-pointer p-0.5 transition-all hover:opacity-100 opacity-50 hover:scale-110"
                      aria-label="Previous level"
                    >
                      <ChevronDown size={14} style={{ color: accent }} />
                    </button>

                    {/* Level label */}
                    <span
                      className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-center truncate max-w-[100px]"
                      style={{
                        color: `${accent}c0`,
                        textShadow: `0 0 8px ${accent}40`,
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => {
              advanceCarousel(1);
              resetAutoRotate();
            }}
            className="p-2 rounded-lg cursor-pointer flex-shrink-0 transition-all hover:scale-110 active:scale-95"
            style={{
              background: `linear-gradient(160deg, rgba(${T.accentDarkRgb},0.2), rgba(0,0,0,0.3))`,
              border: `1px solid rgba(${T.accentDarkRgb},0.35)`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              color: T.accent,
            }}
            aria-label="Next towers"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex justify-center gap-1.5 -mt-1">
          {TOWER_ORDER.map((t, i) => {
            const active = i === carouselStart;
            return (
              <div
                key={t}
                className="rounded-full transition-all duration-300"
                style={{
                  width: active ? 14 : 4,
                  height: 4,
                  background: active
                    ? `rgba(${T.accentRgb},0.5)`
                    : `rgba(${T.accentRgb},0.12)`,
                }}
              />
            );
          })}
        </div>

        <div
          className="flex items-center justify-center"
          style={{
            opacity: stages[2] ? 1 : 0,
            transform: stages[2] ? "translateY(0)" : "translateY(14px)",
            transition: "all 700ms ease-out",
          }}
        >
          {STATS.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <div
                  className="w-px h-8 mx-1 sm:mx-2"
                  style={{ background: `rgba(${T.accentRgb},0.15)` }}
                />
              )}
              <StatBadge value={s.value} label={s.label} />
            </React.Fragment>
          ))}
        </div>

        <div
          className="flex flex-col items-center gap-3"
          style={{
            opacity: stages[3] ? 1 : 0,
            transform: stages[3]
              ? "translateY(0) scale(1)"
              : "translateY(16px) scale(0.94)",
            transition: "all 700ms ease-out",
          }}
        >
          <LandingCTA onClick={onPlay} disabled={exiting} />
          <CreditsButton onClick={onCredits} />
        </div>
      </div>

      <div
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-landing-scroll-bounce"
        style={{
          opacity: stages[4] ? 1 : 0,
          transition: "opacity 1s ease-out",
        }}
      >
        <span
          className="text-[10px] uppercase tracking-[0.2em] font-medium"
          style={{ color: `rgba(${T.accentRgb},0.25)` }}
        >
          Scroll
        </span>
        <ChevronDown size={18} style={{ color: `rgba(${T.accentRgb},0.3)` }} />
      </div>
    </section>
  );
}
