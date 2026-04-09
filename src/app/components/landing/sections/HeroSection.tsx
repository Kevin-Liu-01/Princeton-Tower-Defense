"use client";
import { ChevronDown, ChevronUp, ScrollText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";

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
import { MapGrid, MapWaves, MapTrails, ParchmentOverlay } from "./mapElements";
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
      className="relative w-full rounded-lg overflow-hidden flex-shrink-0 block group transition-all duration-300 hover:scale-[1.06] hover:z-10"
      style={{ aspectRatio: "21/9" }}
    >
      <Image
        src={`/images/previews/${preview.file}.png`}
        alt={preview.name}
        fill
        sizes="220px"
        className="object-cover transition-all duration-300 group-hover:brightness-125"
      />
      <div
        className="absolute inset-0 transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none rounded-lg"
        style={{
          boxShadow: `inset 0 0 16px rgba(${T.accentRgb},0.2), 0 0 16px rgba(${T.accentRgb},0.25)`,
          border: `1.5px solid rgba(${T.accentRgb},0.35)`,
        }}
      />
      <div
        className={`absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent ${side === "left" ? "text-right" : "text-left"}`}
      >
        <span className="text-[8px] sm:text-[9px] font-bold text-white/80 tracking-wider uppercase">
          {preview.name}
        </span>
      </div>
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
      <div className="hero-rail-slide" data-side={side}>
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
      </div>
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: [
            `linear-gradient(180deg, ${T.bg} 0%, transparent 10%, transparent 90%, ${T.bg} 100%)`,
            side === "left"
              ? `linear-gradient(270deg, transparent 60%, ${T.bg} 100%)`
              : `linear-gradient(90deg, transparent 60%, ${T.bg} 100%)`,
          ].join(", "),
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
  onNext,
  onPrev,
}: {
  type: TowerType;
  towerLevel: TowerLevel;
  onNext: () => void;
  onPrev: () => void;
}) {
  const accent = TOWER_ACCENTS[type];
  const label = getTowerLabel(type, towerLevel);
  const glowIntensity = 8 + towerLevel.level * 6;
  const tweak = HERO_TOWER_SPRITE_TWEAKS[type];

  return (
    <div className="flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1.5">
      <button
        onClick={onNext}
        className="cursor-pointer p-1 transition-opacity hover:opacity-100 opacity-40"
        aria-label="Next level"
      >
        <ChevronUp size={14} style={{ color: accent }} />
      </button>
      <div
        className="relative flex items-center justify-center rounded-lg overflow-hidden transition-all duration-300"
        style={{
          background: `linear-gradient(160deg, ${accent}12, rgba(6,6,10,0.6))`,
          border: `1.5px solid ${accent}35`,
          boxShadow: `0 0 ${glowIntensity}px ${accent}20`,
          height: TOWER_VIS + 16,
          width: TOWER_VIS + 8,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${accent}10, transparent 70%)`,
          }}
        />
        <div
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
        </div>
      </div>
      <button
        onClick={onPrev}
        className="cursor-pointer p-1 transition-opacity hover:opacity-100 opacity-40"
        aria-label="Previous level"
      >
        <ChevronDown size={14} style={{ color: accent }} />
      </button>
      <span
        className="text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-center w-[88px] h-4 leading-4 truncate"
        style={{ color: `${accent}80` }}
      >
        {label}
      </span>
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

export function HeroSection({ onPlay, exiting, onCredits }: HeroSectionProps) {
  const activeSlide = useCrossfade(
    HERO_SLIDESHOW_IMAGES.length,
    CROSSFADE_INTERVAL_MS
  );
  const [stages, setStages] = useState<boolean[]>(new Array(6).fill(false));
  const [towerLevels, setTowerLevels] = useState<number[]>(() =>
    new Array(TOWER_ORDER.length).fill(0)
  );

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
            filter: "sepia(0.25) saturate(0.75) brightness(0.85)",
            opacity: i === activeSlide ? 0.28 : 0,
            transition: `opacity ${CROSSFADE_TRANSITION_MS}ms ease-in-out`,
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
          background: `linear-gradient(180deg, rgba(${T.bgRgb},0.85) 0%, rgba(${T.bgRgb},0.18) 30%, rgba(${T.bgRgb},0.18) 70%, rgba(${T.bgRgb},1) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, transparent 0%, rgba(${T.bgRgb},0.5) 60%, rgba(${T.bgRgb},0.95) 100%)`,
        }}
      />

      <MapGrid />
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
          className="flex items-start justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl"
          style={{
            background: "rgba(0,0,0,0.18)",
            border: "1px solid rgba(255,255,255,0.05)",
            opacity: stages[1] ? 1 : 0,
            transform: stages[1] ? "translateY(0)" : "translateY(20px)",
            transition: "all 800ms ease-out",
          }}
        >
          {TOWER_ORDER.map((type, idx) => (
            <TowerCard
              key={type}
              type={type}
              towerLevel={LEVEL_CYCLE[towerLevels[idx]]}
              onNext={() => cycleTower(idx, 1)}
              onPrev={() => cycleTower(idx, -1)}
            />
          ))}
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
