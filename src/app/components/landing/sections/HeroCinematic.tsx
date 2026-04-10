"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState, useCallback, useRef, useEffect } from "react";

import { HERO_DATA, HERO_ROLES } from "../../../constants/heroes";
import { HeroSprite } from "../../../sprites/heroes";
import type { HeroType } from "../../../types";
import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { LANDING_THEME } from "../landingConstants";
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

const CENTER_VIS = 200;
const CENTER_SCALE = 2.4;
const CENTER_CANVAS = Math.round(CENTER_VIS * CENTER_SCALE);

const FLANK_VIS = 120;
const FLANK_SCALE = 2.2;
const FLANK_CANVAS = Math.round(FLANK_VIS * FLANK_SCALE);

const FAR_VIS = Math.round(FLANK_VIS * 0.65);
const FAR_CANVAS = Math.round(FAR_VIS * FLANK_SCALE);

const SLOT_WIDTH = 180;
const AUTO_INTERVAL_MS = 4500;

function OrganicBlob({ color, size }: { color: string; size: number }) {
  return (
    <svg
      viewBox="0 0 200 70"
      className="pointer-events-none"
      style={{ width: size, height: size * 0.35, marginTop: -12 }}
      fill="none"
    >
      <ellipse
        cx="100"
        cy="45"
        rx="95"
        ry="22"
        fill={`${color}15`}
        stroke={`${color}25`}
        strokeWidth="0.8"
      />
      <ellipse cx="100" cy="42" rx="80" ry="16" fill={`${color}0a`} />
      <ellipse cx="100" cy="50" rx="70" ry="8" fill={`${color}08`} />
    </svg>
  );
}

function HeroSlot({ type, offset }: { type: HeroType; offset: number }) {
  const data = HERO_DATA[type];
  const absOff = Math.abs(offset);
  const isCenter = absOff < 0.5;
  const isNear = absOff >= 0.5 && absOff < 1.5;

  const vis = isCenter ? CENTER_VIS : isNear ? FLANK_VIS : FAR_VIS;
  const canvas = isCenter ? CENTER_CANVAS : isNear ? FLANK_CANVAS : FAR_CANVAS;
  const scale = isCenter ? CENTER_SCALE : FLANK_SCALE;
  const opacity = isCenter ? 1 : isNear ? 0.55 : 0.3;

  return (
    <div
      className="flex flex-col items-center flex-shrink-0 transition-opacity duration-500"
      style={{ width: SLOT_WIDTH, opacity }}
    >
      <div className="relative">
        {isCenter && (
          <div
            className="absolute inset-0 blur-3xl pointer-events-none scale-150"
            style={{
              background: `radial-gradient(circle, ${data.color}30, transparent 60%)`,
            }}
          />
        )}
        <SpriteDisplay visualSize={vis} canvasScale={scale}>
          <HeroSprite type={type} size={canvas} animated={isCenter} />
        </SpriteDisplay>
      </div>
      <OrganicBlob color={data.color} size={vis * 1.4} />
      {!isCenter && (
        <span
          className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider -mt-1"
          style={{ color: `${data.color}60` }}
        >
          {data.name}
        </span>
      )}
    </div>
  );
}

function useAutoRotate(cb: () => void, intervalMs: number, paused: boolean) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (paused) {
      return;
    }
    timer.current = setInterval(cb, intervalMs);
    return () => clearInterval(timer.current);
  }, [cb, intervalMs, paused]);
}

export function HeroCinematic() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback((d: 1 | -1) => {
    setActiveIdx((prev) => (prev + d + HERO_ORDER.length) % HERO_ORDER.length);
    setUserInteracted(true);
    clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setUserInteracted(false), 8000);
  }, []);

  const autoAdvance = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % HERO_ORDER.length);
  }, []);

  useAutoRotate(autoAdvance, AUTO_INTERVAL_MS, userInteracted);

  const goTo = useCallback((idx: number) => {
    setActiveIdx(idx);
    setUserInteracted(true);
    clearTimeout(pauseTimer.current);
    pauseTimer.current = setTimeout(() => setUserInteracted(false), 8000);
  }, []);

  const len = HERO_ORDER.length;
  const visibleSlots = 5;
  const slots = Array.from({ length: visibleSlots }, (_, i) => {
    const offset = i - Math.floor(visibleSlots / 2);
    const heroIdx = (((activeIdx + offset) % len) + len) % len;
    return { type: HERO_ORDER[heroIdx], offset };
  });

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
            linear-gradient(180deg, rgba(${T.bgRgb},0.88) 0%, rgba(${T.bgRgb},0.3) 25%, rgba(${T.bgRgb},0.2) 60%, rgba(${T.bgRgb},0.85) 100%),
            radial-gradient(ellipse 80% 60% at 50% 55%, transparent 20%, rgba(${T.bgRgb},0.5) 100%)
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
        <MapSectionHeader
          subtitle="9 Champions of the Realm"
          title="The Heroes"
        />

        {/* Carousel strip */}
        <div className="relative mt-4">
          {/* Edge fades */}
          <div
            className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to right, rgba(${T.bgRgb},0.8), transparent)`,
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
            style={{
              background: `linear-gradient(to left, rgba(${T.bgRgb},0.8), transparent)`,
            }}
          />

          <div
            className="flex items-end justify-center"
            style={{
              minHeight: 340,
              transition: "none",
            }}
          >
            {slots.map(({ type, offset }) => (
              <div
                key={`${activeIdx}-${offset}`}
                className="transition-all duration-500 ease-out"
                style={{
                  transform: `scale(${Math.abs(offset) === 0 ? 1 : Math.abs(offset) === 1 ? 0.85 : 0.7})`,
                }}
              >
                <HeroSlot type={type} offset={offset} />
              </div>
            ))}
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
