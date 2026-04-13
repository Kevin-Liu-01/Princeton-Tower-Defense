"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState, useCallback, useRef, useEffect } from "react";

import { HERO_DATA, HERO_ROLES } from "../../../constants/heroes";
import { HeroSprite } from "../../../sprites/heroes";
import type { HeroType } from "../../../types";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { LANDING_THEME, oklchBg } from "../landingConstants";
import { SectionFlourish } from "./LoadoutUI";
import { MapSectionHeader } from "./mapElements";
import { SpriteDisplay } from "./SpriteDisplay";

const T = LANDING_THEME;

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

const SPRITE_VIS = 160;
const SPRITE_SCALE = 2.4;
const SPRITE_CANVAS = Math.round(SPRITE_VIS * SPRITE_SCALE);

const SLOT_W = 200;
const VISIBLE_HALF = 2;
const VP_W = (VISIBLE_HALF * 2 + 1) * SLOT_W;
const VP_CX = VP_W / 2;
const VP_H = 320;
const AUTO_INTERVAL_MS = 4500;

const EASING = "cubic-bezier(0.4, 0, 0.15, 1)";

function circularDiff(index: number, center: number, length: number): number {
  const raw = (((index - center) % length) + length) % length;
  return raw > length / 2 ? raw - length : raw;
}

function useAutoRotate(cb: () => void, intervalMs: number, paused: boolean) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused) {
      return;
    }
    timer.current = setInterval(cb, intervalMs);
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, [cb, intervalMs, paused]);
}

export function HeroCinematic() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback((d: 1 | -1) => {
    setActiveIdx((prev) => (prev + d + HERO_ORDER.length) % HERO_ORDER.length);
    setUserInteracted(true);
    if (pauseTimer.current) {
      clearTimeout(pauseTimer.current);
    }
    pauseTimer.current = setTimeout(() => setUserInteracted(false), 8000);
  }, []);

  const autoAdvance = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % HERO_ORDER.length);
  }, []);

  useAutoRotate(autoAdvance, AUTO_INTERVAL_MS, userInteracted);

  const goTo = useCallback((idx: number) => {
    setActiveIdx(idx);
    setUserInteracted(true);
    if (pauseTimer.current) {
      clearTimeout(pauseTimer.current);
    }
    pauseTimer.current = setTimeout(() => setUserInteracted(false), 8000);
  }, []);

  const centerData = HERO_DATA[HERO_ORDER[activeIdx]];
  const centerRole = HERO_ROLES[HERO_ORDER[activeIdx]];

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      {/* Battle scene background */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src="/images/new/gameplay_desert.png"
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
            linear-gradient(180deg in oklch, ${oklchBg(0.88)} 0%, ${oklchBg(0.3)} 25%, ${oklchBg(0.2)} 60%, ${oklchBg(0.85)} 100%),
            radial-gradient(in oklch, transparent 20%, ${oklchBg(0.5)} 100%)
          `,
        }}
      />
      <div className="absolute inset-0 landing-texture-crosshatch pointer-events-none opacity-20" />

      {/* OrnateFrame */}
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
        <MapSectionHeader title="The Heroes" />

        {/* Carousel — absolute-positioned items, world-map style */}
        <div className="relative mt-4 flex justify-center">
          {/* Edge fades */}
          <div
            className="absolute left-0 top-0 bottom-0 w-20 sm:w-40 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right in oklch, ${oklchBg(0.9)}, transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-20 sm:w-40 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left in oklch, ${oklchBg(0.9)}, transparent)`,
            }}
          />

          <div
            className="relative overflow-hidden"
            style={{ width: VP_W, maxWidth: "100%", height: VP_H }}
          >
            {HERO_ORDER.map((heroType, idx) => {
              const diff = circularDiff(idx, activeIdx, HERO_ORDER.length);
              const absDiff = Math.abs(diff);
              const isCenter = diff === 0;
              const isVisible = absDiff <= VISIBLE_HALF;

              const scale = isCenter ? 1.15 : absDiff === 1 ? 0.8 : 0.6;
              const x = VP_CX + diff * SLOT_W - SPRITE_VIS / 2;
              const y = isCenter
                ? VP_H - SPRITE_VIS - 90
                : VP_H - SPRITE_VIS * scale - 50;
              const opacity = isCenter
                ? 1
                : absDiff === 1
                  ? 0.55
                  : isVisible
                    ? 0.3
                    : 0;
              const heroData = HERO_DATA[heroType];

              return (
                <button
                  key={heroType}
                  onClick={() => {
                    if (!isCenter) {
                      goTo(idx);
                    }
                  }}
                  className="absolute flex flex-col items-center"
                  style={{
                    cursor: isCenter ? "default" : "pointer",
                    left: 0,
                    opacity,
                    pointerEvents: isVisible ? "auto" : "none",
                    top: 0,
                    transform: `translate(${x}px, ${y}px) scale(${scale})`,
                    transition: `transform 0.4s ${EASING}, opacity 0.35s ease`,
                    width: SPRITE_VIS,
                    zIndex: isCenter ? 3 : absDiff === 1 ? 2 : 1,
                  }}
                >
                  {isCenter && (
                    <div
                      className="absolute inset-0 blur-3xl pointer-events-none scale-150"
                      style={{
                        background: `radial-gradient(in oklch, color-mix(in oklch, ${heroData.color} 20%, transparent), transparent 60%)`,
                      }}
                    />
                  )}
                  <SpriteDisplay
                    visualSize={SPRITE_VIS}
                    canvasScale={SPRITE_SCALE}
                  >
                    <HeroSprite
                      type={heroType}
                      size={SPRITE_CANVAS}
                      animated={isCenter}
                    />
                  </SpriteDisplay>
                  {!isCenter && isVisible && (
                    <span
                      className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider -mt-1"
                      style={{ color: `${heroData.color}60` }}
                    >
                      {heroData.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Arrows */}
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: `rgba(${T.accentDarkRgb},0.2)`,
              border: `1px solid rgba(${T.accentDarkRgb},0.35)`,
              color: T.accent,
            }}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              background: `rgba(${T.accentDarkRgb},0.2)`,
              border: `1px solid rgba(${T.accentDarkRgb},0.35)`,
              color: T.accent,
            }}
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Center hero info — below the carousel */}
        <div
          key={HERO_ORDER[activeIdx]}
          className="flex flex-col items-center gap-2 mt-2 px-4"
          style={{ animation: "landing-tower-enter 0.35s ease-out" }}
        >
          <h3
            className="text-2xl sm:text-4xl font-black font-cinzel tracking-wide"
            style={{
              color: centerData.color,
              textShadow: `0 0 30px ${centerData.color}40, 0 4px 12px rgba(0,0,0,0.7)`,
            }}
          >
            {centerData.name}
          </h3>
          <span
            className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-md"
            style={{
              background: centerRole.bg,
              border: `1px solid ${centerRole.border}`,
              color: centerData.color,
            }}
          >
            {centerRole.label}
          </span>
          <p
            className="text-xs sm:text-sm text-center max-w-sm leading-relaxed"
            style={{ color: `${centerData.color}80` }}
          >
            {centerData.ability}
          </p>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {HERO_ORDER.map((h, i) => {
            const isActive = i === activeIdx;
            const heroColor = HERO_DATA[h].color;
            return (
              <button
                key={h}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300 cursor-pointer"
                style={{
                  width: isActive ? 20 : 6,
                  height: 6,
                  background: isActive ? heroColor : "rgba(255,255,255,0.15)",
                  boxShadow: isActive ? `0 0 8px ${heroColor}60` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
