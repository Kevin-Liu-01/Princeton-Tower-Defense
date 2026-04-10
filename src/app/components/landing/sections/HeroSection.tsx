"use client";
import { AnimatePresence, motion } from "framer-motion";
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

function getTowerLabel(type: TowerType, tl: TowerLevel): string {
  if (tl.level < 4) {
    return `Lv.${tl.level}`;
  }
  return TOWER_DATA[type].upgrades[tl.upgrade ?? "A"].name;
}

function TowerCard({
  type,
  towerLevel,
  levelIndex,
  onNext,
  onPrev,
}: {
  type: TowerType;
  towerLevel: TowerLevel;
  levelIndex: number;
  onNext: () => void;
  onPrev: () => void;
}) {
  const accent = TOWER_ACCENTS[type];
  const label = getTowerLabel(type, towerLevel);
  const glowIntensity = 10 + towerLevel.level * 8;
  const tweak = HERO_TOWER_SPRITE_TWEAKS[type];
  const prevIdx = useRef(levelIndex);
  const dir = levelIndex >= prevIdx.current ? 1 : -1;
  useEffect(() => {
    prevIdx.current = levelIndex;
  }, [levelIndex]);

  const spriteKey = `${type}-${towerLevel.level}-${towerLevel.upgrade ?? ""}`;

  return (
    <div className="flex flex-col items-center gap-0.5 px-1 sm:px-1.5 py-1.5">
      <button
        onClick={onNext}
        className="cursor-pointer p-1 transition-all hover:opacity-100 opacity-50 hover:scale-110"
        aria-label="Next level"
      >
        <ChevronUp size={14} style={{ color: accent }} />
      </button>
      <div
        className="relative p-[3px] rounded-lg"
        style={{
          background: `linear-gradient(160deg, #d4aa50, ${accent}60, #8b6914, ${accent}50, #d4aa50)`,
          boxShadow: `0 4px 14px rgba(0,0,0,0.5), 0 0 ${glowIntensity}px ${accent}25`,
        }}
      >
        <div
          className="relative flex items-center justify-center rounded overflow-hidden"
          style={{
            background: `linear-gradient(170deg, ${accent}15, rgba(6,6,10,0.88))`,
            boxShadow: `inset 0 0 0 1px rgba(40,28,8,0.5), inset 0 0 8px rgba(0,0,0,0.5), inset 0 0 20px ${accent}08`,
            height: TOWER_VIS + 16,
            width: TOWER_VIS + 8,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% 70%, ${accent}10, transparent 70%)`,
            }}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={spriteKey}
              initial={{ y: dir * 16, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: dir * -16, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                transform: `translate(${tweak.x}px, ${tweak.y}px) scale(${tweak.spriteScale})`,
                transformOrigin: "50% 58%",
              }}
            >
              <SpriteDisplay visualSize={TOWER_VIS} canvasScale={TOWER_SCALE}>
                <TowerSprite
                  type={type}
                  size={TOWER_CANVAS}
                  level={towerLevel.level}
                  upgrade={towerLevel.upgrade}
                />
              </SpriteDisplay>
            </motion.div>
          </AnimatePresence>
        </div>
        <FrameCorner className="top-[-2px] left-[-2px]" />
        <FrameCorner className="top-[-2px] right-[-2px]" />
        <FrameCorner className="bottom-[-2px] left-[-2px]" />
        <FrameCorner className="bottom-[-2px] right-[-2px]" />
        <div
          className="absolute left-1/2 -translate-x-1/2 top-[1px] w-3 h-[2px] pointer-events-none z-10 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
          }}
        />
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[1px] w-3 h-[2px] pointer-events-none z-10 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}80, transparent)`,
          }}
        />
      </div>
      <button
        onClick={onPrev}
        className="cursor-pointer p-1 transition-all hover:opacity-100 opacity-50 hover:scale-110"
        aria-label="Previous level"
      >
        <ChevronDown size={14} style={{ color: accent }} />
      </button>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-center w-[88px] h-4 leading-4 truncate"
          style={{
            color: `${accent}c0`,
            textShadow: `0 0 8px ${accent}40`,
          }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
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

const VISIBLE_LG = 5;
const VISIBLE_SM = 3;
const CAROUSEL_INTERVAL_MS = 3500;
const CARD_WIDTH_SM = 108;
const CARD_WIDTH_LG = 140;

function useVisibleCount() {
  const [count, setCount] = useState(VISIBLE_LG);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const update = () => setCount(mq.matches ? VISIBLE_LG : VISIBLE_SM);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return count;
}

export function HeroSection({ onPlay, exiting, onCredits }: HeroSectionProps) {
  const activeSlide = useCrossfade(
    HERO_SLIDESHOW_IMAGES.length,
    CROSSFADE_INTERVAL_MS
  );
  const [stages, setStages] = useState<boolean[]>(new Array(6).fill(false));
  const [towerLevels, setTowerLevels] = useState<number[]>(() =>
    new Array(TOWER_ORDER.length).fill(0)
  );

  const visibleCount = useVisibleCount();
  const [carouselStart, setCarouselStart] = useState(0);
  const [carouselDir, setCarouselDir] = useState<1 | -1>(1);
  const autoTimer = useRef(0 as unknown as ReturnType<typeof setInterval>);

  const advanceCarousel = useCallback((dir: 1 | -1) => {
    setCarouselDir(dir);
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

  const visibleTowers = Array.from({ length: visibleCount }, (_, i) => {
    const idx = (carouselStart + i) % TOWER_ORDER.length;
    return { type: TOWER_ORDER[idx], globalIdx: idx };
  });

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
          <motion.button
            onClick={() => {
              advanceCarousel(-1);
              resetAutoRotate();
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg cursor-pointer flex-shrink-0"
            style={{
              background: `linear-gradient(160deg, rgba(${T.accentDarkRgb},0.2), rgba(0,0,0,0.3))`,
              border: `1px solid rgba(${T.accentDarkRgb},0.35)`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              color: T.accent,
            }}
            aria-label="Previous towers"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <div
            className="relative rounded-xl p-[2px]"
            style={{
              background: `linear-gradient(160deg, rgba(${T.accentDarkRgb},0.4), rgba(${T.accentDarkRgb},0.12), rgba(${T.accentDarkRgb},0.4))`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(${T.accentRgb},0.1)`,
            }}
          >
            <div
              className="relative rounded-[10px] px-2 sm:px-3 py-1.5"
              style={{
                background: "rgba(6,4,2,0.65)",
                overflowX: "clip",
                overflowY: "visible",
              }}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={carouselStart}
                  className="flex items-start justify-center"
                  initial={{ x: carouselDir * 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: carouselDir * -60, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {visibleTowers.map(({ type, globalIdx }) => (
                    <TowerCard
                      key={type}
                      type={type}
                      towerLevel={LEVEL_CYCLE[towerLevels[globalIdx]]}
                      levelIndex={towerLevels[globalIdx]}
                      onNext={() => cycleTower(globalIdx, 1)}
                      onPrev={() => cycleTower(globalIdx, -1)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <motion.button
            onClick={() => {
              advanceCarousel(1);
              resetAutoRotate();
            }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg cursor-pointer flex-shrink-0"
            style={{
              background: `linear-gradient(160deg, rgba(${T.accentDarkRgb},0.2), rgba(0,0,0,0.3))`,
              border: `1px solid rgba(${T.accentDarkRgb},0.35)`,
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              color: T.accent,
            }}
            aria-label="Next towers"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        <div className="flex justify-center gap-1.5 -mt-1">
          {TOWER_ORDER.map((t, i) => {
            const active = visibleTowers.some((v) => v.globalIdx === i);
            return (
              <motion.div
                key={t}
                className="rounded-full"
                animate={{
                  width: active ? 12 : 4,
                  background: active
                    ? `rgba(${T.accentRgb},0.5)`
                    : `rgba(${T.accentRgb},0.12)`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{ height: 4 }}
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
