"use client";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ScrollText,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef } from "react";

import { TOWER_DATA, TOWER_ACCENTS } from "../../../constants/towers";
import { TowerSprite } from "../../../sprites/towers";
import type { TowerType } from "../../../types";
import { FrameCorner } from "../CardFrame";
import { useCrossfade } from "../hooks/useCrossfade";
import {
  LANDING_THEME,
  HERO_SLIDESHOW_IMAGES,
  CROSSFADE_INTERVAL_MS,
  CROSSFADE_TRANSITION_MS,
  LANDING_EMBERS,
  LANDING_EMBER_COLORS,
  oklchBg,
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

const TOWER_VIS = 158;
const TOWER_SCALE = 2;
const TOWER_CANVAS = Math.round(TOWER_VIS * TOWER_SCALE);

const T_CARD_W = 122;
const T_VISIBLE_HALF = 2;
const T_VP_W = 720;
const T_ITEM_W = TOWER_VIS + 14;
const T_ITEM_H = TOWER_VIS + 90;
const T_EASING = "cubic-bezier(0.4, 0, 0.15, 1)";

function circularDiff(index: number, center: number, length: number): number {
  const raw = (((index - center) % length) + length) % length;
  return raw > length / 2 ? raw - length : raw;
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

const HERO_COUNTS = [
  { value: "26", label: "Maps" },
  { value: "7", label: "Towers" },
  { value: "9", label: "Heroes" },
  { value: "6", label: "Spells" },
  { value: "100+", label: "Enemies" },
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
          "linear-gradient(160deg in oklch, oklch(0.76 0.12 85) 0%, oklch(0.48 0.1 80) 25%, oklch(0.8 0.13 88) 50%, oklch(0.4 0.08 78) 75%, oklch(0.73 0.11 83) 100%)",
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
            background: `linear-gradient(180deg, ${T.bg} 0%, transparent 22%, transparent 78%, ${T.bg} 100%)`,
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

function HeroTagline({ show }: { show: boolean }) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 px-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] tabular-nums"
      aria-label="Game contents"
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(12px)",
        transition: "all 700ms ease-out",
      }}
    >
      {HERO_COUNTS.map((s, i) => (
        <React.Fragment key={s.label}>
          {i > 0 && (
            <span
              aria-hidden
              className="select-none"
              style={{ color: `rgba(${T.accentRgb},0.22)` }}
            >
              ·
            </span>
          )}
          <span className="inline-flex items-baseline gap-1.5">
            <span
              className="text-[14px] sm:text-[16px] font-black"
              style={{
                color: T.princeton,
                textShadow: `0 0 14px rgba(${T.princetonRgb},0.35)`,
              }}
            >
              {s.value}
            </span>
            <span style={{ color: `rgba(${T.accentRgb},0.55)` }}>
              {s.label}
            </span>
          </span>
        </React.Fragment>
      ))}
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
      className="group inline-flex items-center gap-2 px-2 py-1 cursor-pointer bg-transparent border-0 transition-all duration-200"
      style={{ color: `rgba(${T.accentRgb},0.42)` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = `rgba(${T.accentRgb},0.9)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = `rgba(${T.accentRgb},0.42)`;
      }}
    >
      <ScrollText
        size={12}
        strokeWidth={2}
        className="transition-transform duration-200 group-hover:-translate-y-0.5"
      />
      <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.28em] uppercase relative">
        Credits
        <span
          className="absolute left-0 right-0 -bottom-0.5 h-px origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
          style={{ background: "currentColor" }}
        />
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
            filter: "saturate(0.78) brightness(0.88) contrast(1.06)",
            opacity: i === activeSlide ? 0.4 : 0,
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
          background: `linear-gradient(180deg in oklch, ${oklchBg(0.7)} 0%, ${oklchBg(0.1)} 30%, ${oklchBg(0.1)} 70%, ${oklchBg(0.95)} 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45% in oklch, transparent 0%, ${oklchBg(0.35)} 60%, ${oklchBg(0.85)} 100%)`,
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
          className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3"
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
            width={64}
            height={64}
            priority
            className="sm:w-[104px] sm:h-[104px] "
            style={{
              filter: `drop-shadow(0 0 18px rgba(${T.accentRgb},0.55)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))`,
            }}
          />
          <div className="flex flex-col items-center sm:items-start">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-black leading-[0.85]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, #fef3c7 0%, #fcd34d 38%, #d97706 78%, #92400e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                filter: `drop-shadow(0 2px 0 rgba(0,0,0,0.45)) drop-shadow(0 0 28px rgba(${T.accentRgb},0.4))`,
                letterSpacing: "-0.01em",
              }}
            >
              PRINCETON
            </h1>
            <h2
              className="self-stretch flex items-center justify-between gap-[0.06em] text-[0.88rem] sm:text-[1.42rem] md:text-[1.72rem] font-bold uppercase -mt-1 sm:-mt-2 w-full"
              style={{
                color: `rgba(${T.accentRgb},0.78)`,
                textShadow: `0 1px 3px rgba(0,0,0,0.6), 0 0 18px rgba(${T.accentRgb},0.22)`,
              }}
              aria-label="Tower Defense"
            >
              {[..."TOWER DEFENSE"].map((ch, i) =>
                ch === " " ? (
                  <span
                    key={i}
                    aria-hidden
                    className="inline-block w-[0.25em]"
                  />
                ) : (
                  <span key={i} aria-hidden>
                    {ch}
                  </span>
                )
              )}
            </h2>
          </div>
        </div>

        <HeroTagline show={stages[1]} />

        <div
          className="flex items-center justify-center w-full"
          style={{
            opacity: stages[2] ? 1 : 0,
            transform: stages[2] ? "translateY(0)" : "translateY(20px)",
            transition: "all 800ms ease-out",
          }}
        >
          <div className="relative w-full" style={{ maxWidth: T_VP_W + 4 }}>
            <button
              onClick={() => {
                advanceCarousel(-1);
                resetAutoRotate();
              }}
              className="group/arrow absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-30 p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                color: `rgba(${T.accentRgb},0.55)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.accentBright;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = `rgba(${T.accentRgb},0.55)`;
              }}
              aria-label="Previous towers"
            >
              <ChevronLeft size={28} strokeWidth={2.2} />
            </button>
            <div
              className="relative w-full"
              style={{
                height: T_ITEM_H,
                perspective: "1400px",
                perspectiveOrigin: "50% 55%",
              }}
            >
              {/* Center spotlight (radial bloom behind the focused card) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 26% 65% at 50% 50%, rgba(${T.accentBrightRgb},0.12) 0%, rgba(${T.princetonRgb},0.05) 40%, transparent 75%)`,
                }}
              />

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
                const towerName =
                  tl.level < 4
                    ? TOWER_DATA[type].name
                    : TOWER_DATA[type].upgrades[tl.upgrade ?? "A"].name;

                const rotY = diff * -18;
                const scale = isCenter ? 1.08 : absDiff === 1 ? 0.88 : 0.74;
                const cardOpacity = isCenter ? 1 : absDiff === 1 ? 0.88 : 0.55;

                return (
                  <div
                    key={type}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: "50%",
                      opacity: isVisible ? cardOpacity : 0,
                      pointerEvents: isVisible ? "auto" : "none",
                      top: 16,
                      transform: `translateX(${diff * T_CARD_W - T_ITEM_W / 2}px) perspective(900px) rotateY(${rotY}deg) scale(${scale})`,
                      transformOrigin: "50% 50%",
                      transition: `transform 0.45s ${T_EASING}, opacity 0.4s ease`,
                      width: T_ITEM_W,
                      zIndex: isCenter ? 3 : 2 - absDiff,
                    }}
                  >
                    {/* Tower card — click center to cycle level, click side to focus */}
                    <button
                      onClick={() => {
                        if (isCenter) {
                          cycleTower(idx, 1);
                        } else {
                          setCarouselStart(idx);
                          resetAutoRotate();
                        }
                      }}
                      className="cursor-pointer"
                      aria-label={
                        isCenter
                          ? `Cycle ${TOWER_DATA[type].name} level`
                          : `Focus ${TOWER_DATA[type].name}`
                      }
                    >
                      <div
                        className="relative p-[3px] rounded-lg transition-all duration-300"
                        style={{
                          background: isCenter
                            ? `linear-gradient(160deg in oklch, oklch(0.82 0.14 85), color-mix(in oklch, ${accent} 60%, transparent), oklch(0.52 0.11 80), color-mix(in oklch, ${accent} 52%, transparent), oklch(0.82 0.14 85))`
                            : `linear-gradient(160deg in oklch, oklch(0.7 0.09 85), color-mix(in oklch, ${accent} 28%, transparent), oklch(0.42 0.07 80), color-mix(in oklch, ${accent} 22%, transparent), oklch(0.7 0.09 85))`,
                          boxShadow: isCenter
                            ? `0 10px 28px rgba(0,0,0,0.65), 0 0 ${18 + tl.level * 10}px ${accent}55, 0 0 80px ${accent}22`
                            : `0 4px 12px rgba(0,0,0,0.5)`,
                        }}
                      >
                        <div
                          className="relative flex items-center justify-center rounded overflow-hidden"
                          style={{
                            background: TOWER_BG_GRADIENT[type],
                            boxShadow: `inset 0 0 0 1px ${accent}24, inset 0 0 14px rgba(0,0,0,0.45)`,
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
                          {/* Level pip row — only on center card */}
                          {isCenter && (
                            <div
                              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 pointer-events-none"
                              aria-hidden
                            >
                              {[1, 2, 3, 4].map((n) => (
                                <span
                                  key={n}
                                  className="block rounded-full transition-all duration-300"
                                  style={{
                                    background:
                                      n <= tl.level
                                        ? accent
                                        : `rgba(${T.accentRgb},0.18)`,
                                    boxShadow:
                                      n <= tl.level
                                        ? `0 0 6px ${accent}`
                                        : "none",
                                    height: 4,
                                    width: n <= tl.level ? 10 : 4,
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <FrameCorner className="top-[-2px] left-[-2px]" />
                        <FrameCorner className="top-[-2px] right-[-2px]" />
                        <FrameCorner className="bottom-[-2px] left-[-2px]" />
                        <FrameCorner className="bottom-[-2px] right-[-2px]" />
                      </div>
                    </button>

                    {/* Label */}
                    <div
                      className="flex flex-col items-center transition-all duration-300"
                      style={{
                        marginTop: isCenter ? 14 : 8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        className={`font-bold uppercase text-center transition-all duration-300 ${
                          isCenter
                            ? "text-[12px] sm:text-[14px] tracking-[0.16em]"
                            : "text-[9px] sm:text-[10px] tracking-[0.1em]"
                        }`}
                        style={{
                          color: isCenter ? accent : `${accent}99`,
                          textShadow: isCenter
                            ? `0 0 16px ${accent}80, 0 1px 2px rgba(0,0,0,0.7)`
                            : `0 0 6px ${accent}40, 0 1px 2px rgba(0,0,0,0.6)`,
                        }}
                      >
                        {towerName}
                      </span>
                      {isCenter && (
                        <span
                          className="mt-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black tabular-nums tracking-[0.15em]"
                          style={{
                            background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                            border: `1px solid ${accent}55`,
                            color: accent,
                            textShadow: `0 0 8px ${accent}90`,
                          }}
                        >
                          LV.{tl.level}
                          {tl.level === 4 && (tl.upgrade === "B" ? " B" : " A")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                advanceCarousel(1);
                resetAutoRotate();
              }}
              className="group/arrow absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-30 p-2 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
              style={{
                color: `rgba(${T.accentRgb},0.55)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.accentBright;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = `rgba(${T.accentRgb},0.55)`;
              }}
              aria-label="Next towers"
            >
              <ChevronRight size={28} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        <div
          className="flex flex-col items-center gap-5 mt-3 sm:mt-5"
          style={{
            opacity: stages[3] ? 1 : 0,
            transform: stages[3]
              ? "translateY(0) scale(1)"
              : "translateY(16px) scale(0.94)",
            transition: "all 700ms ease-out",
          }}
        >
          <div className="relative isolate">
            <div
              aria-hidden
              className="absolute inset-0 -m-8 rounded-full animate-landing-glow-breathe pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 80% at 50% 50%, rgba(${T.princetonRgb},0.22) 0%, rgba(${T.accentRgb},0.14) 40%, transparent 70%)`,
                filter: "blur(18px)",
              }}
            />
            <LandingCTA onClick={onPlay} disabled={exiting} />
          </div>
          <CreditsButton onClick={onCredits} />
        </div>
      </div>

      <div
        className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-landing-scroll-bounce"
        style={{
          opacity: stages[4] ? 1 : 0,
          transition: "opacity 1s ease-out",
        }}
        aria-hidden
      >
        <ChevronDown
          size={16}
          strokeWidth={2.2}
          style={{ color: `rgba(${T.accentRgb},0.22)`, marginBottom: -9 }}
        />
        <ChevronDown
          size={16}
          strokeWidth={2.2}
          style={{ color: `rgba(${T.accentRgb},0.4)` }}
        />
      </div>
    </section>
  );
}
