"use client";
import Image from "next/image";
import React, { useState, useCallback } from "react";

import {
  TOWER_DATA,
  TOWER_CATEGORIES,
  TOWER_ACCENTS,
} from "../../../constants/towers";
import { TowerSprite } from "../../../sprites/towers";
import type { TowerType } from "../../../types";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { LANDING_THEME, oklchBg } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import { MapSectionHeader } from "./mapElements";
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

const CARD_VIS = 64;
const CARD_SCALE = 2;
const CARD_CANVAS = Math.round(CARD_VIS * CARD_SCALE);

const EVO_VIS = 56;
const EVO_SCALE = 2;
const EVO_CANVAS = Math.round(EVO_VIS * EVO_SCALE);

const SPOTLIGHT_VIS = 140;
const SPOTLIGHT_SCALE = 2.4;
const SPOTLIGHT_CANVAS = Math.round(SPOTLIGHT_VIS * SPOTLIGHT_SCALE);

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
// Main section
// ---------------------------------------------------------------------------

export function ArsenalShowcase() {
  const [selTower, setSelTower] = useState(0);
  const handleTower = useCallback((i: number) => setSelTower(i), []);
  const activeAccent = TOWER_ACCENTS[TOWER_ORDER[selTower]];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/new/gameplay_grounds.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover"
          style={{
            filter: "brightness(0.3) saturate(0.6) blur(1px)",
            transform: "scale(1.05)",
          }}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg in oklch, ${oklchBg(0.85)} 0%, ${oklchBg(0.35)} 20%, ${oklchBg(0.25)} 50%, ${oklchBg(0.35)} 80%, ${oklchBg(0.85)} 100%),
            radial-gradient(in oklch, transparent 20%, ${oklchBg(0.5)} 100%)
          `,
        }}
      />
      <div className="absolute inset-0 landing-texture-crosshatch pointer-events-none opacity-30" />
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <OrnateFrame
          className="w-full h-full"
          cornerSize={40}
          borderVariant="compact"
        >
          <div className="w-full h-full" />
        </OrnateFrame>
      </div>
      <div className="relative z-10">
        <SectionFlourish />
        <MapSectionHeader title="The Arsenal" />

        <div className="max-w-5xl mx-auto px-4 sm:px-8">
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
      </div>
    </section>
  );
}
