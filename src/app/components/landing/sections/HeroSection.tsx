"use client";
import { ChevronDown, ScrollText } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";

import { useCrossfade } from "../hooks/useCrossfade";
import {
  LANDING_THEME,
  LANDING_TAGLINE,
  LANDING_STATS,
  HERO_SLIDESHOW_IMAGES,
  CROSSFADE_INTERVAL_MS,
  CROSSFADE_TRANSITION_MS,
  LANDING_EMBERS,
  LANDING_EMBER_COLORS,
} from "../landingConstants";
import type { EmberConfig } from "../landingConstants";
import { LandingCTA } from "../LandingCTA";
import {
  MapGrid,
  MapBorder,
  MapWaves,
  MapTrails,
  MapLocations,
  MapCartouche,
  ParchmentOverlay,
  CompassDirections,
} from "./mapElements";

const T = LANDING_THEME;

// ─── Compass ring geometry ────────────────────────────────────────────────────

const COMPASS_R = 80;

function ringPt(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: +(Math.cos(rad) * r).toFixed(2),
    y: +(Math.sin(rad) * r).toFixed(2),
  };
}

const CARDINALS = [0, 90, 180, 270].map((d) => ({
  d,
  ...ringPt(d, COMPASS_R),
}));
const INTERCARDINALS = [45, 135, 225, 315].map((d) => ({
  d,
  ...ringPt(d, COMPASS_R),
}));
const TICKS = Array.from({ length: 36 }, (_, i) => i * 10)
  .filter((d) => d % 45 !== 0)
  .map((d) => {
    const inner = ringPt(d, COMPASS_R - 2);
    const outer = ringPt(d, COMPASS_R + 2);
    return { d, x1: inner.x, x2: outer.x, y1: inner.y, y2: outer.y };
  });

const STAR_RAYS = [0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
  const major = d % 90 === 0;
  const inner = ringPt(d, 34);
  const outer = ringPt(d, major ? 52 : 43);
  return { d, ...inner, x2: outer.x, y2: outer.y, major };
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function MapCompassRose() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height: 200, width: 200 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-[-36px] rounded-full"
        style={{
          animation: "landing-pulse 4s ease-in-out infinite",
          background: `radial-gradient(circle, rgba(${T.accentRgb},0.12) 0%, rgba(${T.accentDarkRgb},0.04) 50%, transparent 75%)`,
        }}
      />

      {/* Rotating compass ring */}
      <svg
        className="absolute animate-map-compass-glow"
        viewBox="-90 -90 180 180"
        style={{
          animation: "landing-spin 60s linear infinite",
          height: 200,
          width: 200,
        }}
        fill="none"
      >
        {/* Concentric rings */}
        <circle
          r={COMPASS_R}
          stroke={T.accentDark}
          strokeWidth="1.2"
          opacity="0.35"
        />
        <circle
          r={COMPASS_R - 4}
          stroke={T.accentDark}
          strokeWidth="0.4"
          opacity="0.15"
        />
        <circle
          r={COMPASS_R + 4}
          stroke={T.accentDark}
          strokeWidth="0.3"
          opacity="0.1"
        />
        <circle
          r={56}
          stroke={T.accentDark}
          strokeWidth="0.5"
          opacity="0.12"
          strokeDasharray="3,5"
        />

        {/* Star rays from center */}
        {STAR_RAYS.map((r) => (
          <line
            key={`ray-${r.d}`}
            x1={r.x}
            y1={r.y}
            x2={r.x2}
            y2={r.y2}
            stroke={T.accentDark}
            strokeWidth={r.major ? "1" : "0.5"}
            opacity={r.major ? "0.22" : "0.12"}
          />
        ))}

        {/* Cardinal diamond markers */}
        {CARDINALS.map((m) => (
          <g key={m.d} transform={`translate(${m.x},${m.y}) rotate(${m.d})`}>
            <path d="M0,-7 L4,0 L0,7 L-4,0 Z" fill={T.accent} opacity="0.8" />
            <path
              d="M0,-4.5 L2.5,0 L0,4.5 L-2.5,0 Z"
              fill={T.accentBright}
              opacity="0.5"
            />
          </g>
        ))}

        {/* Intercardinal dots */}
        {INTERCARDINALS.map((m) => (
          <circle
            key={m.d}
            cx={m.x}
            cy={m.y}
            r="2.5"
            fill={T.accent}
            opacity="0.4"
          />
        ))}

        {/* Fine tick marks */}
        {TICKS.map((m) => (
          <line
            key={m.d}
            x1={m.x1}
            y1={m.y1}
            x2={m.x2}
            y2={m.y2}
            stroke={T.accentDark}
            strokeWidth="0.5"
            opacity="0.22"
          />
        ))}
      </svg>

      {/* Non-rotating direction labels */}
      <div className="absolute" style={{ height: 200, width: 200 }}>
        <CompassDirections />
      </div>

      {/* Center logo medallion (stationary) */}
      <div
        className="relative w-[110px] h-[110px] flex items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(150deg, rgba(${T.accentDarkRgb},0.5) 0%, rgba(${T.bgRgb},0.92) 50%, rgba(${T.bgRgb},0.96) 100%)`,
          border: `2.5px solid rgba(${T.accentDarkRgb},0.45)`,
          boxShadow: `0 0 50px rgba(${T.accentRgb},0.2), 0 0 100px rgba(${T.accentRgb},0.06), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.3)`,
        }}
      >
        <div
          className="absolute inset-[3px] rounded-full pointer-events-none"
          style={{ border: `1px solid rgba(${T.accentDarkRgb},0.15)` }}
        />
        <Image
          src="/images/logos/princeton-td-logo.svg"
          alt="Princeton Tower Defense"
          width={65}
          height={65}
          priority
          style={{ filter: `drop-shadow(0 0 14px rgba(${T.accentRgb},0.5))` }}
        />
      </div>
    </div>
  );
}

function TitleOrnament({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      style={{
        filter: `drop-shadow(0 0 5px rgba(${T.accentRgb},0.35))`,
        height: 20,
        transform: flip ? "scaleX(-1)" : undefined,
        width: 20,
      }}
    >
      <path
        d="M4 12 L9 7 L12 10 L15 7 L20 12 L15 17 L12 14 L9 17 Z"
        fill={T.accent}
        opacity="0.7"
      />
      <path
        d="M6 12 L9 9 L12 12 L15 9 L18 12 L15 15 L12 12 L9 15 Z"
        fill={T.accentDark}
        opacity="0.5"
      />
      <path
        d="M12 8 L14 12 L12 16 L10 12 Z"
        fill={T.accentBright}
        opacity="0.9"
      />
    </svg>
  );
}

function MapFlourish() {
  return (
    <svg
      viewBox="0 0 360 24"
      fill="none"
      className="w-full"
      style={{ height: 24, maxWidth: 360 }}
    >
      {/* Left arm */}
      <path
        d="M0 12 L130 12"
        stroke={T.accentDark}
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M20 9 L120 9"
        stroke={T.accentDark}
        strokeWidth="0.4"
        opacity="0.2"
      />
      <path
        d="M10 15 L115 15"
        stroke={T.accentDark}
        strokeWidth="0.3"
        opacity="0.12"
      />
      {/* Right arm */}
      <path
        d="M230 12 L360 12"
        stroke={T.accentDark}
        strokeWidth="1"
        opacity="0.5"
      />
      <path
        d="M240 9 L340 9"
        stroke={T.accentDark}
        strokeWidth="0.4"
        opacity="0.2"
      />
      <path
        d="M245 15 L350 15"
        stroke={T.accentDark}
        strokeWidth="0.3"
        opacity="0.12"
      />
      {/* Center diamond cluster */}
      <path
        d="M180 2 L190 12 L180 22 L170 12 Z"
        fill={T.accent}
        opacity="0.2"
        stroke={T.accent}
        strokeWidth="0.8"
      />
      <path
        d="M180 5 L186 12 L180 19 L174 12 Z"
        fill="none"
        stroke={T.accentBright}
        strokeWidth="0.6"
        opacity="0.5"
      />
      <circle cx="180" cy="12" r="3" fill={T.accent} opacity="0.85" />
      <circle cx="180" cy="12" r="1.5" fill={T.accentDark} opacity="0.5" />
      {/* Flanking diamonds */}
      <path
        d="M148 12 L151 9 L154 12 L151 15 Z"
        fill={T.accent}
        opacity="0.45"
      />
      <path
        d="M206 12 L209 9 L212 12 L209 15 Z"
        fill={T.accent}
        opacity="0.45"
      />
      {/* Accent dots */}
      <circle cx="55" cy="12" r="1.3" fill={T.accentBright} opacity="0.35" />
      <circle cx="90" cy="12" r="0.9" fill={T.accentBright} opacity="0.25" />
      <circle cx="270" cy="12" r="0.9" fill={T.accentBright} opacity="0.25" />
      <circle cx="305" cy="12" r="1.3" fill={T.accentBright} opacity="0.35" />
    </svg>
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

function MapLegend() {
  return (
    <div
      className="hidden md:flex gap-3 sm:gap-5 flex-wrap justify-center px-4 py-2 rounded-sm"
      style={{
        background: `rgba(${T.bgRgb},0.5)`,
        border: `0.5px solid rgba(${T.accentRgb},0.08)`,
      }}
    >
      {LANDING_STATS.slice(0, 4).map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <Icon size={12} style={{ color: `rgba(${T.accentRgb},0.3)` }} />
          <span
            className="text-xs font-black tabular-nums"
            style={{ color: T.accent }}
          >
            {value}
          </span>
          <span
            className="text-[7px] font-bold uppercase tracking-[0.12em]"
            style={{ color: `rgba(${T.accentRgb},0.25)` }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────

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
  const [stages, setStages] = useState<boolean[]>(new Array(7).fill(false));

  useEffect(() => {
    const delays = [100, 300, 550, 750, 1000, 1300, 1600];
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

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* ── Layer 1: Crossfading biome backgrounds (sepia-aged) ── */}
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

      {/* ── Layer 2: Parchment texture ── */}
      <ParchmentOverlay />

      {/* ── Layer 3: Gradient overlays ── */}
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

      {/* ── Layer 4: Cartographic grid ── */}
      <MapGrid />

      {/* ── Layer 5: Terrain silhouettes ── */}
      <MapWaves />

      {/* ── Layer 6: Adventure trails ── */}
      <MapTrails />

      {/* ── Layer 7: Ornate border frame ── */}
      <MapBorder />

      {/* ── Layer 8: Location markers ── */}
      <MapLocations />

      {/* ── Layer 9: Ember particles ── */}
      <HeroEmbers />

      {/* ── Layer 10: Content ── */}
      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-5 px-6 w-full max-w-lg">
        {/* Compass Rose + Logo */}
        <div
          style={{
            opacity: stages[0] ? 1 : 0,
            transform: stages[0]
              ? "translateY(0) scale(1)"
              : "translateY(24px) scale(0.88)",
            transition: "all 800ms ease-out",
          }}
        >
          <MapCompassRose />
        </div>

        {/* Title in Cartouche */}
        <div
          style={{
            opacity: stages[1] ? 1 : 0,
            transform: stages[1] ? "translateY(0)" : "translateY(18px)",
            transition: "all 700ms ease-out",
          }}
        >
          <MapCartouche>
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <TitleOrnament />
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.22em] uppercase text-center"
                  style={{
                    color: T.accent,
                    textShadow: `0 0 40px rgba(${T.accentRgb},0.4), 0 0 80px rgba(${T.accentRgb},0.12), 0 2px 4px rgba(0,0,0,0.6)`,
                  }}
                >
                  Princeton
                </h1>
                <TitleOrnament flip />
              </div>
              <h2
                className="text-lg sm:text-2xl md:text-3xl font-bold tracking-[0.35em] uppercase"
                style={{
                  color: `rgba(${T.accentRgb},0.65)`,
                  textShadow: `0 0 20px rgba(${T.accentRgb},0.18), 0 2px 4px rgba(0,0,0,0.5)`,
                }}
              >
                Tower Defense
              </h2>
            </div>
          </MapCartouche>
        </div>

        {/* Flourish */}
        <div
          className="w-full flex justify-center"
          style={{
            opacity: stages[2] ? 1 : 0,
            transform: stages[2]
              ? "translateY(0) scaleX(1)"
              : "translateY(6px) scaleX(0.7)",
            transition: "all 700ms ease-out",
          }}
        >
          <MapFlourish />
        </div>

        {/* Tagline */}
        <p
          className="text-xs sm:text-sm font-medium tracking-wider text-center italic"
          style={{
            color: `rgba(${T.accentRgb},0.42)`,
            opacity: stages[3] ? 1 : 0,
            transform: stages[3] ? "translateY(0)" : "translateY(12px)",
            transition: "all 700ms ease-out",
          }}
        >
          {LANDING_TAGLINE}
        </p>

        {/* Map Legend stats */}
        <div
          style={{
            opacity: stages[4] ? 1 : 0,
            transform: stages[4] ? "translateY(0)" : "translateY(10px)",
            transition: "all 600ms ease-out",
          }}
        >
          <MapLegend />
        </div>

        {/* CTA */}
        <div
          className="mt-1 sm:mt-2 flex flex-col items-center gap-3"
          style={{
            opacity: stages[5] ? 1 : 0,
            transform: stages[5]
              ? "translateY(0) scale(1)"
              : "translateY(16px) scale(0.94)",
            transition: "all 700ms ease-out",
          }}
        >
          <LandingCTA onClick={onPlay} disabled={exiting} />
          <CreditsButton onClick={onCredits} />
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-landing-scroll-bounce"
        style={{
          opacity: stages[6] ? 1 : 0,
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
