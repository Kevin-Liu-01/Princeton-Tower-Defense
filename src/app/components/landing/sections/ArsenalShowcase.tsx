"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useCallback } from "react";

import { HERO_DATA, HERO_ROLES } from "../../../constants/heroes";
import { SPELL_DATA } from "../../../constants/spells";
import {
  TOWER_DATA,
  TOWER_CATEGORIES,
  TOWER_ACCENTS,
} from "../../../constants/towers";
import { HeroSprite } from "../../../sprites/heroes";
import { SpellSprite } from "../../../sprites/spells";
import { TowerSprite } from "../../../sprites/towers";
import type { HeroType, SpellType, TowerType } from "../../../types";
import { LANDING_THEME } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import { MapSectionHeader, MapSectionBg } from "./mapElements";
import { SpriteDisplay } from "./SpriteDisplay";

const T = LANDING_THEME;

const TOWER_ORDER: TowerType[] = [
  "station",
  "cannon",
  "lab",
  "arch",
  "library",
  "mortar",
  "club",
];

const HERO_ORDER: HeroType[] = [
  "tiger",
  "mathey",
  "captain",
  "nassau",
  "tenor",
  "rocky",
  "scott",
  "engineer",
  "ivy",
];

const SPELL_ORDER: SpellType[] = [
  "fireball",
  "lightning",
  "freeze",
  "hex_ward",
  "payday",
  "reinforcements",
];

const CARD_VIS = 64;
const CARD_SCALE = 2;
const CARD_CANVAS = Math.round(CARD_VIS * CARD_SCALE);

const EVO_VIS = 56;
const EVO_SCALE = 2;
const EVO_CANVAS = Math.round(EVO_VIS * EVO_SCALE);

const SPOTLIGHT_VIS = 140;
const SPOTLIGHT_SCALE = 2.4;
const SPOTLIGHT_CANVAS = Math.round(SPOTLIGHT_VIS * SPOTLIGHT_SCALE);

const HERO_SPOTLIGHT_VIS = 160;
const HERO_SPOTLIGHT_SCALE = 2.4;
const HERO_SPOTLIGHT_CANVAS = Math.round(
  HERO_SPOTLIGHT_VIS * HERO_SPOTLIGHT_SCALE
);

const SPELL_CARD_VIS = 52;
const SPELL_CARD_SCALE = 2;
const SPELL_CARD_CANVAS = Math.round(SPELL_CARD_VIS * SPELL_CARD_SCALE);

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${T.accentRgb},0.15))`,
        }}
      />
      <p
        className="text-[10px] font-bold uppercase tracking-[0.35em]"
        style={{ color: `rgba(${T.accentRgb},0.35)` }}
      >
        {children}
      </p>
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, rgba(${T.accentRgb},0.15), transparent)`,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tower strip thumbnail
// ---------------------------------------------------------------------------

function TowerThumb({
  type,
  active,
  onClick,
}: {
  type: TowerType;
  active: boolean;
  onClick: () => void;
}) {
  const accent = TOWER_ACCENTS[type];
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-300 group flex-shrink-0 relative"
      style={{
        transform: active ? "scale(1.12) translateY(-4px)" : "scale(1)",
      }}
    >
      <div
        className="relative rounded-xl flex items-center justify-center transition-all duration-300"
        style={{
          background: active
            ? `linear-gradient(180deg, ${accent}30, ${accent}08)`
            : "rgba(255,255,255,0.03)",
          border: active
            ? `2px solid ${accent}`
            : "1.5px solid rgba(255,255,255,0.06)",
          boxShadow: active
            ? `0 0 24px ${accent}35, 0 4px 16px rgba(0,0,0,0.5)`
            : "0 2px 8px rgba(0,0,0,0.3)",
          height: CARD_VIS + 16,
          width: CARD_VIS + 8,
        }}
      >
        {active && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${accent}20, transparent 70%)`,
            }}
          />
        )}
        <SpriteDisplay visualSize={CARD_VIS} canvasScale={CARD_SCALE}>
          <TowerSprite type={type} size={CARD_CANVAS} level={1} />
        </SpriteDisplay>
        {!active && (
          <div className="absolute inset-0 rounded-xl bg-black/30 group-hover:bg-black/10 transition-colors duration-200" />
        )}
      </div>
      <span
        className="text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200"
        style={{ color: active ? accent : `rgba(255,255,255,0.25)` }}
      >
        {TOWER_DATA[type].name.split(" ").pop()}
      </span>
      {active && (
        <div
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Evolution tree nodes + connectors (restyled)
// ---------------------------------------------------------------------------

function EvoNode({
  type,
  level,
  upgrade,
  active,
  accent,
  label,
  onClick,
}: {
  type: TowerType;
  level: 1 | 2 | 3 | 4;
  upgrade?: "A" | "B";
  active: boolean;
  accent: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-300"
      style={{ transform: active ? "scale(1.1)" : "scale(1)" }}
    >
      <div
        className="relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{
          width: 56,
          height: 56,
          background: active
            ? `radial-gradient(circle at 40% 35%, ${accent}25, ${accent}0a)`
            : "rgba(255,255,255,0.03)",
          border: active
            ? `2.5px solid ${accent}`
            : "1.5px solid rgba(255,255,255,0.08)",
          boxShadow: active
            ? `0 0 20px ${accent}30, inset 0 0 14px ${accent}0a`
            : "0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        <SpriteDisplay visualSize={EVO_VIS} canvasScale={EVO_SCALE}>
          <TowerSprite
            type={type}
            size={EVO_CANVAS}
            level={level}
            upgrade={upgrade}
          />
        </SpriteDisplay>
      </div>
      <span
        className="text-[8px] font-bold tracking-wider text-center leading-tight max-w-[76px] mt-0.5 transition-colors duration-200"
        style={{ color: active ? accent : `${accent}40` }}
      >
        {label}
      </span>
    </button>
  );
}

function EvoConnector({ accent, lit }: { accent: string; lit: boolean }) {
  return (
    <div className="flex items-center self-center mx-1">
      <div
        className="w-5 sm:w-7 h-[2px] rounded-full"
        style={{ background: lit ? `${accent}55` : `${accent}12` }}
      />
      <svg width="6" height="10" viewBox="0 0 6 10" className="-ml-px">
        <path d="M0,0 L6,5 L0,10" fill={lit ? `${accent}65` : `${accent}15`} />
      </svg>
    </div>
  );
}

function EvolutionLevelCard({
  type,
  level,
  accent,
  active,
  onClick,
}: {
  type: TowerType;
  level: 1 | 2 | 3;
  accent: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative group rounded-xl p-2 sm:p-2.5 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: active
          ? `linear-gradient(180deg, ${accent}22, ${accent}08)`
          : "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        border: active
          ? `1.5px solid ${accent}`
          : "1.5px solid rgba(255,255,255,0.08)",
        boxShadow: active
          ? `0 0 18px ${accent}35, inset 0 0 10px ${accent}12`
          : "0 2px 10px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: active ? accent : "rgba(255,255,255,0.45)" }}
        >
          Level {level}
        </div>
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <SpriteDisplay visualSize={EVO_VIS} canvasScale={EVO_SCALE}>
            <TowerSprite type={type} size={EVO_CANVAS} level={level} />
          </SpriteDisplay>
        </div>
      </div>
    </button>
  );
}

function EvolutionBranchCard({
  type,
  accent,
  upgrade,
  name,
  active,
  onClick,
}: {
  type: TowerType;
  accent: string;
  upgrade: "A" | "B";
  name: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl p-2 sm:p-2.5 transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: active
          ? `linear-gradient(180deg, ${accent}24, ${accent}08)`
          : "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        border: active
          ? `1.5px solid ${accent}`
          : "1.5px solid rgba(255,255,255,0.08)",
        boxShadow: active
          ? `0 0 20px ${accent}35, inset 0 0 12px ${accent}10`
          : "0 2px 10px rgba(0,0,0,0.35)",
      }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[8px] font-black uppercase tracking-[0.18em] px-1.5 py-0.5 rounded"
            style={{
              color: active ? accent : "rgba(255,255,255,0.5)",
              background: active ? `${accent}20` : "rgba(255,255,255,0.07)",
            }}
          >
            Path {upgrade}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: active ? accent : "rgba(255,255,255,0.45)" }}
          >
            Level 4
          </span>
        </div>
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <SpriteDisplay visualSize={EVO_VIS} canvasScale={EVO_SCALE}>
            <TowerSprite
              type={type}
              size={EVO_CANVAS}
              level={4}
              upgrade={upgrade}
            />
          </SpriteDisplay>
        </div>
        <span
          className="text-[9px] font-semibold tracking-wide text-center leading-tight max-w-[120px]"
          style={{ color: active ? accent : `${accent}75` }}
        >
          {name}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tower spotlight + evolution tree
// ---------------------------------------------------------------------------

function TowerSpotlight({ type }: { type: TowerType }) {
  const data = TOWER_DATA[type];
  const accent = TOWER_ACCENTS[type];
  const cat = TOWER_CATEGORIES[type];
  const [selLevel, setSelLevel] = useState(1);
  const [selUpgrade, setSelUpgrade] = useState<"A" | "B">("A");

  return (
    <div
      className="flex flex-col items-center gap-6 pt-6"
      style={{ animation: "landing-tower-enter 0.4s ease-out" }}
    >
      {/* Large sprite */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${accent}40, transparent 70%)`,
          }}
        />
        <SpriteDisplay visualSize={SPOTLIGHT_VIS} canvasScale={SPOTLIGHT_SCALE}>
          <TowerSprite
            type={type}
            size={SPOTLIGHT_CANVAS}
            level={selLevel as 1 | 2 | 3 | 4}
            upgrade={selLevel === 4 ? selUpgrade : undefined}
            animated
          />
        </SpriteDisplay>
      </div>

      {/* Name + category */}
      <div className="flex flex-col items-center gap-2">
        <h3
          className="text-2xl sm:text-3xl font-black font-cinzel tracking-wide"
          style={{ color: accent, textShadow: `0 0 24px ${accent}25` }}
        >
          {data.name}
        </h3>
        <div className="flex items-center gap-3">
          <span
            className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-md"
            style={{
              background: `${accent}12`,
              border: `1px solid ${accent}25`,
              color: accent,
            }}
          >
            {cat.label}
          </span>
          <span
            className="text-[9px] font-semibold tabular-nums"
            style={{ color: `${accent}60` }}
          >
            {data.cost} PP
          </span>
        </div>
      </div>

      {/* Carded progression */}
      <div className="w-full max-w-4xl mt-1">
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {([1, 2, 3] as const).map((lv, i) => (
            <React.Fragment key={lv}>
              {i > 0 && <EvoConnector accent={accent} lit={selLevel >= lv} />}
              <EvolutionLevelCard
                type={type}
                level={lv}
                accent={accent}
                active={selLevel === lv}
                onClick={() => {
                  setSelLevel(lv);
                  setSelUpgrade("A");
                }}
              />
            </React.Fragment>
          ))}
        </div>

        <div className="flex justify-center mt-2.5">
          <div
            className="h-6 w-[2px] rounded-full"
            style={{
              background:
                selLevel === 4 ? `${accent}55` : "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        <div className="flex justify-center -mt-0.5">
          <div
            className="text-[8px] font-bold uppercase tracking-[0.24em] px-2 py-1 rounded"
            style={{
              color: selLevel === 4 ? accent : "rgba(255,255,255,0.45)",
              background:
                selLevel === 4 ? `${accent}18` : "rgba(255,255,255,0.05)",
              border:
                selLevel === 4
                  ? `1px solid ${accent}55`
                  : "1px solid rgba(255,255,255,0.09)",
            }}
          >
            Choose Branch
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap mt-2.5">
          <EvolutionBranchCard
            type={type}
            accent={accent}
            upgrade="A"
            name={data.upgrades.A.name}
            active={selLevel === 4 && selUpgrade === "A"}
            onClick={() => {
              setSelLevel(4);
              setSelUpgrade("A");
            }}
          />
          <EvolutionBranchCard
            type={type}
            accent={accent}
            upgrade="B"
            name={data.upgrades.B.name}
            active={selLevel === 4 && selUpgrade === "B"}
            onClick={() => {
              setSelLevel(4);
              setSelUpgrade("B");
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hero cinematic stage (large hero + left/right arrows)
// ---------------------------------------------------------------------------

function HeroStage({
  type,
  onPrev,
  onNext,
}: {
  type: HeroType;
  onPrev: () => void;
  onNext: () => void;
}) {
  const data = HERO_DATA[type];
  const role = HERO_ROLES[type];

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(8,6,3,0.95) 0%, rgba(15,12,8,0.98) 40%, rgba(5,4,2,0.99) 100%)",
        border: "1.5px solid rgba(255,255,255,0.06)",
        boxShadow:
          "0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Atmospheric backdrop glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 50% 60%, ${data.color}12, transparent 70%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
        }}
      />

      <div className="relative flex items-center justify-center px-4 py-8 sm:py-12 min-h-[280px] sm:min-h-[340px]">
        {/* Left arrow */}
        <button
          onClick={onPrev}
          className="absolute left-3 sm:left-6 z-20 p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <ChevronLeft size={24} />
        </button>

        {/* Hero sprite + info */}
        <div
          key={type}
          className="flex flex-col items-center gap-4"
          style={{ animation: "landing-tower-enter 0.4s ease-out" }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 blur-3xl opacity-30 pointer-events-none scale-150"
              style={{
                background: `radial-gradient(circle, ${data.color}35, transparent 60%)`,
              }}
            />
            <SpriteDisplay
              visualSize={HERO_SPOTLIGHT_VIS}
              canvasScale={HERO_SPOTLIGHT_SCALE}
            >
              <HeroSprite type={type} size={HERO_SPOTLIGHT_CANVAS} animated />
            </SpriteDisplay>
          </div>

          <div className="flex flex-col items-center gap-2 relative z-10">
            <h3
              className="text-2xl sm:text-3xl font-black font-cinzel tracking-wide"
              style={{
                color: data.color,
                textShadow: `0 2px 20px ${data.color}30`,
              }}
            >
              {data.name}
            </h3>
            <span
              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-md"
              style={{
                background: role.bg,
                border: `1px solid ${role.border}`,
                color: data.color,
              }}
            >
              {role.label}
            </span>
            <p
              className="text-xs sm:text-sm text-center max-w-sm leading-relaxed mt-1"
              style={{ color: `${data.color}70` }}
            >
              {data.ability}
            </p>
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={onNext}
          className="absolute right-3 sm:right-6 z-20 p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom dot indicators */}
      <div className="flex justify-center gap-1.5 pb-4">
        {HERO_ORDER.map((h) => (
          <div
            key={h}
            className="rounded-full transition-all duration-300"
            style={{
              width: h === type ? 16 : 4,
              height: 4,
              background: h === type ? data.color : "rgba(255,255,255,0.12)",
              boxShadow: h === type ? `0 0 6px ${data.color}60` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spell card (grid item)
// ---------------------------------------------------------------------------

function SpellGridCard({ type }: { type: SpellType }) {
  const data = SPELL_DATA[type];
  const accent = T.accent;

  return (
    <div
      className="group relative flex flex-col items-center gap-2.5 rounded-xl px-3 py-4 transition-all duration-300 hover:scale-[1.03]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: "1.5px solid rgba(255,255,255,0.06)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accent}12, transparent 70%)`,
          border: `1.5px solid ${accent}20`,
          borderRadius: "0.75rem",
        }}
      />
      <div className="relative">
        <SpriteDisplay
          visualSize={SPELL_CARD_VIS}
          canvasScale={SPELL_CARD_SCALE}
        >
          <SpellSprite type={type} size={SPELL_CARD_CANVAS} animated />
        </SpriteDisplay>
      </div>
      <div className="flex flex-col items-center gap-1 relative">
        <span
          className="text-[11px] sm:text-xs font-bold font-cinzel tracking-wide"
          style={{ color: accent }}
        >
          {data.name}
        </span>
        <p
          className="text-[9px] sm:text-[10px] text-center leading-snug max-w-[140px]"
          style={{ color: `rgba(${T.accentRgb},0.4)` }}
        >
          {data.desc}
        </p>
        <span
          className="text-[8px] font-semibold uppercase tracking-widest mt-1 px-2 py-0.5 rounded-full"
          style={{
            background: `rgba(${T.accentRgb},0.06)`,
            border: `1px solid rgba(${T.accentRgb},0.1)`,
            color: `rgba(${T.accentRgb},0.35)`,
          }}
        >
          {(data.cooldown / 1000).toFixed(0)}s cooldown
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section
// ---------------------------------------------------------------------------

export function ArsenalShowcase() {
  const [selTower, setSelTower] = useState(0);
  const [selHero, setSelHero] = useState(0);

  const handleTower = useCallback((i: number) => setSelTower(i), []);
  const heroPrev = useCallback(
    () => setSelHero((i) => (i - 1 + HERO_ORDER.length) % HERO_ORDER.length),
    []
  );
  const heroNext = useCallback(
    () => setSelHero((i) => (i + 1) % HERO_ORDER.length),
    []
  );

  const activeAccent = TOWER_ACCENTS[TOWER_ORDER[selTower]];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <MapSectionBg tint={`${activeAccent}04`} gridOpacity={0.03} />
      <div className="absolute inset-0 landing-texture-crosshatch pointer-events-none" />
      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader
          subtitle="Towers · Heroes · Spells"
          title="The Arsenal"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-8 space-y-20 sm:space-y-24">
          {/* ──── TOWERS: Spotlight Carousel ──── */}
          <div>
            <RowLabel>Towers</RowLabel>
            <div className="flex justify-center gap-2.5 sm:gap-3 flex-wrap">
              {TOWER_ORDER.map((type, i) => (
                <TowerThumb
                  key={type}
                  type={type}
                  active={i === selTower}
                  onClick={() => handleTower(i)}
                />
              ))}
            </div>
            <TowerSpotlight
              key={TOWER_ORDER[selTower]}
              type={TOWER_ORDER[selTower]}
            />
          </div>

          {/* ──── HEROES: Cinematic Stage ──── */}
          <div>
            <RowLabel>Heroes</RowLabel>
            <HeroStage
              type={HERO_ORDER[selHero]}
              onPrev={heroPrev}
              onNext={heroNext}
            />
          </div>

          {/* ──── SPELLS: Card Grid ──── */}
          <div>
            <RowLabel>Spells</RowLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {SPELL_ORDER.map((type) => (
                <SpellGridCard key={type} type={type} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
