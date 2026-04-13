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
import { FrameCorner } from "../CardFrame";
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

const SPOTLIGHT_VIS = 200;
const SPOTLIGHT_SCALE = 2.4;
const SPOTLIGHT_CANVAS = Math.round(SPOTLIGHT_VIS * SPOTLIGHT_SCALE);

const NODE_VIS = 52;
const NODE_SCALE = 2;
const NODE_CANVAS = Math.round(NODE_VIS * NODE_SCALE);

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
        className="relative p-[3px] rounded-xl transition-all duration-300"
        style={{
          background: active
            ? `linear-gradient(160deg, #d4aa50, ${accent}60, #8b6914, ${accent}50, #d4aa50)`
            : "transparent",
          boxShadow: active
            ? `0 0 24px ${accent}30, 0 4px 16px rgba(0,0,0,0.5)`
            : "none",
        }}
      >
        <div
          className="relative rounded-lg flex items-center justify-center transition-all duration-300 overflow-hidden"
          style={{
            background: active
              ? `linear-gradient(180deg, ${accent}20, ${accent}08)`
              : "rgba(255,255,255,0.03)",
            border: active ? "none" : "1.5px solid rgba(255,255,255,0.06)",
            boxShadow: active
              ? `inset 0 0 0 1px rgba(40,28,8,0.5), inset 0 0 8px rgba(0,0,0,0.4)`
              : "0 2px 8px rgba(0,0,0,0.3)",
            height: CARD_VIS + 16,
            width: CARD_VIS + 8,
          }}
        >
          {active && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${accent}20, transparent 70%)`,
              }}
            />
          )}
          <SpriteDisplay visualSize={CARD_VIS} canvasScale={CARD_SCALE}>
            <TowerSprite type={type} size={CARD_CANVAS} level={1} />
          </SpriteDisplay>
          {!active && (
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-200" />
          )}
        </div>
        {active && (
          <>
            <FrameCorner className="top-[-2px] left-[-2px]" />
            <FrameCorner className="top-[-2px] right-[-2px]" />
            <FrameCorner className="bottom-[-2px] left-[-2px]" />
            <FrameCorner className="bottom-[-2px] right-[-2px]" />
          </>
        )}
      </div>
      <span
        className="text-[8px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-200"
        style={{
          color: active ? accent : "rgba(255,255,255,0.25)",
          textShadow: active ? `0 0 8px ${accent}40` : "none",
        }}
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
// Shared tree node button
// ---------------------------------------------------------------------------

function TreeNode({
  active,
  accent,
  label,
  onClick,
  children,
}: {
  active: boolean;
  accent: string;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 p-[2px] rounded-lg cursor-pointer transition-all duration-300 flex-shrink-0"
      style={{
        background: active
          ? `linear-gradient(160deg, #d4aa50, ${accent}60, #8b6914, ${accent}50, #d4aa50)`
          : "transparent",
        boxShadow: active ? `0 0 14px ${accent}25` : "none",
      }}
    >
      <div
        className="relative rounded flex items-center justify-center overflow-hidden"
        style={{
          width: NODE_VIS + 8,
          height: NODE_VIS + 8,
          background: active
            ? `linear-gradient(180deg, ${accent}18, ${accent}06)`
            : "rgba(255,255,255,0.03)",
          border: active ? "none" : "1.5px solid rgba(255,255,255,0.06)",
          boxShadow: active
            ? `inset 0 0 0 1px rgba(40,28,8,0.4)`
            : "0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        {children}
        {!active && <div className="absolute inset-0 bg-black/25" />}
      </div>
      <span
        className="text-[7px] font-bold uppercase tracking-wider whitespace-nowrap"
        style={{ color: active ? accent : "rgba(255,255,255,0.3)" }}
      >
        {label}
      </span>
      {active && (
        <>
          <FrameCorner className="top-[-1px] left-[-1px]" />
          <FrameCorner className="top-[-1px] right-[-1px]" />
          <FrameCorner className="bottom-[-1px] left-[-1px]" />
          <FrameCorner className="bottom-[-1px] right-[-1px]" />
        </>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tower profile — full evolution tree with large preview
// ---------------------------------------------------------------------------

type Selection =
  | { level: 1 | 2 | 3; upgrade?: undefined }
  | { level: 4; upgrade: "A" | "B" };

function TowerProfile({ type }: { type: TowerType }) {
  const data = TOWER_DATA[type];
  const accent = TOWER_ACCENTS[type];
  const cat = TOWER_CATEGORIES[type];
  const [sel, setSel] = useState<Selection>({ level: 1 });

  const selDesc =
    sel.level === 4
      ? data.upgrades[sel.upgrade].effect
      : data.levelDesc[sel.level];

  const lineColor = `${accent}40`;
  const litLine = `${accent}70`;

  const nodeH = NODE_VIS + 8 + 4 + 12;
  const stackH = nodeH * 2 + 8;
  const pathACenter = nodeH / 2;
  const pathBCenter = nodeH + 8 + nodeH / 2;

  return (
    <div
      className="mt-8"
      style={{ animation: "landing-tower-enter 0.4s ease-out" }}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-8 max-w-3xl mx-auto">
        {/* Info + tech tree panel */}
        <div className="flex flex-col gap-4 flex-1 min-w-0 text-center sm:text-left order-2 sm:order-1">
          <div className="flex flex-col gap-2">
            <h3
              className="text-2xl sm:text-3xl font-black font-cinzel tracking-wide"
              style={{ color: accent, textShadow: `0 0 24px ${accent}25` }}
            >
              {data.name}
            </h3>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
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
            <p
              className="text-xs sm:text-sm leading-relaxed max-w-md"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {data.desc}
            </p>
          </div>

          <div
            className="h-px w-full max-w-xs mx-auto sm:mx-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${accent}25, transparent)`,
            }}
          />

          {/* Tech tree */}
          <div className="flex flex-col gap-0 items-center sm:items-start">
            <span
              className="text-[8px] font-bold uppercase tracking-[0.3em] mb-2"
              style={{ color: `rgba(${T.accentRgb},0.35)` }}
            >
              Evolution Tree
            </span>

            <div className="flex items-center justify-center sm:justify-start">
              {/* Lv1 → Lv2 → Lv3 */}
              {([1, 2, 3] as const).map((lv, i) => (
                <React.Fragment key={lv}>
                  {i > 0 && (
                    <div
                      className="h-[2px] rounded-full flex-shrink-0"
                      style={{
                        width: 20,
                        background: sel.level >= lv ? litLine : lineColor,
                        boxShadow:
                          sel.level >= lv ? `0 0 6px ${accent}30` : "none",
                      }}
                    />
                  )}
                  <TreeNode
                    active={sel.level === lv}
                    accent={accent}
                    label={`Lv ${lv}`}
                    onClick={() => setSel({ level: lv })}
                  >
                    <SpriteDisplay
                      visualSize={NODE_VIS}
                      canvasScale={NODE_SCALE}
                    >
                      <TowerSprite type={type} size={NODE_CANVAS} level={lv} />
                    </SpriteDisplay>
                  </TreeNode>
                </React.Fragment>
              ))}

              {/* Bracket + stacked paths — uses items-center so
                  the SVG midpoint aligns with Lv1-3 centers */}
              <div
                className="flex items-center flex-shrink-0"
                style={{ height: stackH }}
              >
                <svg width="24" height={stackH} className="flex-shrink-0">
                  <line
                    x1="0"
                    y1={stackH / 2}
                    x2="10"
                    y2={stackH / 2}
                    stroke={sel.level === 4 ? litLine : lineColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="10"
                    y1={pathACenter}
                    x2="10"
                    y2={pathBCenter}
                    stroke={sel.level === 4 ? litLine : lineColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="10"
                    y1={pathACenter}
                    x2="24"
                    y2={pathACenter}
                    stroke={
                      sel.level === 4 && sel.upgrade === "A"
                        ? litLine
                        : lineColor
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <line
                    x1="10"
                    y1={pathBCenter}
                    x2="24"
                    y2={pathBCenter}
                    stroke={
                      sel.level === 4 && sel.upgrade === "B"
                        ? litLine
                        : lineColor
                    }
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {(["A", "B"] as const).map((path) => (
                    <TreeNode
                      key={path}
                      active={sel.level === 4 && sel.upgrade === path}
                      accent={accent}
                      label={data.upgrades[path].name}
                      onClick={() => setSel({ level: 4, upgrade: path })}
                    >
                      <SpriteDisplay
                        visualSize={NODE_VIS}
                        canvasScale={NODE_SCALE}
                      >
                        <TowerSprite
                          type={type}
                          size={NODE_CANVAS}
                          level={4}
                          upgrade={path}
                        />
                      </SpriteDisplay>
                    </TreeNode>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <p
            className="text-[10px] sm:text-xs leading-relaxed max-w-sm text-center sm:text-left"
            style={{ color: `${accent}90` }}
          >
            {selDesc}
          </p>
        </div>

        {/* Large animated sprite — stretches to match left panel */}
        <div className="relative flex-1 order-1 sm:order-2 flex flex-col items-center min-w-0">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${accent}30, transparent 70%)`,
            }}
          />
          <div
            className="relative rounded-lg flex items-center justify-center flex-1 w-full"
            style={{
              minHeight: SPOTLIGHT_VIS + 40,
              background: `linear-gradient(170deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`,
              border: `1.5px solid rgba(255,255,255,0.08)`,
              boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 0 30px rgba(0,0,0,0.15)`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 60%, ${accent}08, transparent 70%)`,
              }}
            />
            <SpriteDisplay
              visualSize={SPOTLIGHT_VIS}
              canvasScale={SPOTLIGHT_SCALE}
            >
              <TowerSprite
                type={type}
                size={SPOTLIGHT_CANVAS}
                level={sel.level}
                upgrade={sel.level === 4 ? sel.upgrade : undefined}
                animated
              />
            </SpriteDisplay>
          </div>
          <div
            className="mt-2 text-center text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            {sel.level === 4
              ? data.upgrades[sel.upgrade].name
              : `Level ${sel.level}`}
          </div>
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
          <TowerProfile
            key={TOWER_ORDER[selTower]}
            type={TOWER_ORDER[selTower]}
          />
        </div>
      </div>
    </section>
  );
}
