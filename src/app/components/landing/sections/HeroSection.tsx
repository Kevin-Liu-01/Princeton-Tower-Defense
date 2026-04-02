"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronDown, ScrollText } from "lucide-react";
import {
  LANDING_THEME,
  LANDING_TAGLINE,
  HERO_SLIDESHOW_IMAGES,
  CROSSFADE_INTERVAL_MS,
  CROSSFADE_TRANSITION_MS,
  LANDING_EMBERS,
  LANDING_EMBER_COLORS,
  type EmberConfig,
} from "../landingConstants";
import { useCrossfade } from "../hooks/useCrossfade";
import { LandingCTA } from "../LandingCTA";

const T = LANDING_THEME;
const RING_R = 64;

// ─── Compass ring geometry (computed once at module level) ────────────────────

function ringPoint(deg: number, r: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: +((Math.cos(rad) * r).toFixed(2)), y: +((Math.sin(rad) * r).toFixed(2)) };
}

const CARDINAL_MARKS = [0, 90, 180, 270].map((deg) => ({ deg, ...ringPoint(deg, RING_R) }));
const INTERCARDINAL_MARKS = [45, 135, 225, 315].map((deg) => ({ deg, ...ringPoint(deg, RING_R) }));
const TICK_MARKS = [30, 60, 120, 150, 210, 240, 300, 330].map((deg) => {
  const inner = ringPoint(deg, RING_R - 2);
  const outer = ringPoint(deg, RING_R + 2);
  return { deg, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
});

// ─── Sub-components (module-level, not nested) ───────────────────────────────

function HeroLogo() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 152, height: 152 }}>
      <div
        className="absolute inset-[-28px] rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(${T.accentRgb},0.14) 0%, rgba(${T.accentDarkRgb},0.05) 50%, transparent 75%)`,
          animation: "landing-pulse 4s ease-in-out infinite",
        }}
      />
      <svg
        className="absolute"
        viewBox="-68 -68 136 136"
        style={{
          width: 152,
          height: 152,
          animation: "landing-spin 50s linear infinite",
          filter: `drop-shadow(0 0 8px rgba(${T.accentRgb},0.25))`,
        }}
        fill="none"
      >
        <circle cx="0" cy="0" r={RING_R} stroke={T.accentDark} strokeWidth="1" opacity="0.35" />
        <circle cx="0" cy="0" r={RING_R - 5} stroke={T.accentDark} strokeWidth="0.5" opacity="0.18" />
        {CARDINAL_MARKS.map((m) => (
          <g key={m.deg} transform={`translate(${m.x},${m.y}) rotate(${m.deg})`}>
            <path d="M0 -5 L3 0 L0 5 L-3 0 Z" fill={T.accent} opacity="0.75" />
            <path d="M0 -3 L1.8 0 L0 3 L-1.8 0 Z" fill={T.accentBright} opacity="0.55" />
          </g>
        ))}
        {INTERCARDINAL_MARKS.map((m) => (
          <circle key={m.deg} cx={m.x} cy={m.y} r="1.8" fill={T.accent} opacity="0.5" />
        ))}
        {TICK_MARKS.map((m) => (
          <line
            key={m.deg}
            x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
            stroke={T.accentDark} strokeWidth="0.7" opacity="0.3"
          />
        ))}
      </svg>
      <div
        className="relative w-[104px] h-[104px] flex items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(150deg, rgba(${T.accentDarkRgb},0.5) 0%, rgba(${T.bgRgb},0.9) 50%, rgba(${T.bgRgb},0.96) 100%)`,
          border: `2.5px solid rgba(${T.accentDarkRgb},0.45)`,
          boxShadow: `0 0 50px rgba(${T.accentRgb},0.22), 0 0 100px rgba(${T.accentRgb},0.06), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.3)`,
        }}
      >
        <div className="absolute inset-[3px] rounded-full pointer-events-none" style={{ border: `1px solid rgba(${T.accentDarkRgb},0.15)` }} />
        <Image
          src="/images/logos/princeton-td-logo.svg"
          alt="Princeton Tower Defense"
          width={62}
          height={62}
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
        width: 20,
        height: 20,
        transform: flip ? "scaleX(-1)" : undefined,
        filter: `drop-shadow(0 0 5px rgba(${T.accentRgb},0.35))`,
      }}
    >
      <path d="M4 12 L9 7 L12 10 L15 7 L20 12 L15 17 L12 14 L9 17 Z" fill={T.accent} opacity="0.7" />
      <path d="M6 12 L9 9 L12 12 L15 9 L18 12 L15 15 L12 12 L9 15 Z" fill={T.accentDark} opacity="0.5" />
      <path d="M12 8 L14 12 L12 16 L10 12 Z" fill={T.accentBright} opacity="0.9" />
    </svg>
  );
}

function Flourish() {
  return (
    <svg viewBox="0 0 320 20" fill="none" className="w-full" style={{ maxWidth: 320, height: 20 }}>
      <path d="M0 10 L120 10" stroke={T.accentDark} strokeWidth="1" opacity="0.5" />
      <path d="M15 7.5 L110 7.5" stroke={T.accentDark} strokeWidth="0.4" opacity="0.22" />
      <path d="M200 10 L320 10" stroke={T.accentDark} strokeWidth="1" opacity="0.5" />
      <path d="M210 7.5 L305 7.5" stroke={T.accentDark} strokeWidth="0.4" opacity="0.22" />
      <path d="M160 2 L168 10 L160 18 L152 10 Z" fill={T.accent} opacity="0.22" stroke={T.accent} strokeWidth="1" />
      <path d="M160 4.5 L165.5 10 L160 15.5 L154.5 10 Z" fill="none" stroke={T.accentBright} strokeWidth="0.7" opacity="0.55" />
      <circle cx="160" cy="10" r="2.8" fill={T.accent} opacity="0.85" />
      <circle cx="160" cy="10" r="1.4" fill={T.accentDark} opacity="0.5" />
      <path d="M135 10 L138 7.5 L141 10 L138 12.5 Z" fill={T.accent} opacity="0.5" />
      <path d="M179 10 L182 7.5 L185 10 L182 12.5 Z" fill={T.accent} opacity="0.5" />
      <circle cx="45" cy="10" r="1.2" fill={T.accentBright} opacity="0.4" />
      <circle cx="80" cy="10" r="0.9" fill={T.accentBright} opacity="0.3" />
      <circle cx="240" cy="10" r="0.9" fill={T.accentBright} opacity="0.3" />
      <circle cx="275" cy="10" r="1.2" fill={T.accentBright} opacity="0.4" />
    </svg>
  );
}

function EmberParticle({ ember }: { ember: EmberConfig }) {
  const color = LANDING_EMBER_COLORS[ember.variant];
  const hexOpacity = Math.round(ember.opacity * 0.4 * 255).toString(16).padStart(2, "0");
  return (
    <div
      className="absolute rounded-full"
      style={{
        left: `${ember.x}%`,
        bottom: "-4%",
        width: `${ember.size}px`,
        height: `${ember.size}px`,
        background: `radial-gradient(circle, rgba(${T.accentRgb},${ember.opacity}) 0%, ${color}${hexOpacity} 60%, transparent 100%)`,
        boxShadow: `0 0 ${(ember.size * 2).toFixed(1)}px rgba(${T.accentRgb},${(ember.opacity * 0.35).toFixed(3)})`,
        animation: `landing-ember${ember.variant} ${ember.duration}s ${ember.delay}s linear infinite`,
      }}
    />
  );
}

function HeroEmbers() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="absolute inset-0 overflow-hidden pointer-events-none" />;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {LANDING_EMBERS.map((e) => (
        <EmberParticle key={e.id} ember={e} />
      ))}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

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
  const activeSlide = useCrossfade(HERO_SLIDESHOW_IMAGES.length, CROSSFADE_INTERVAL_MS);
  const [stages, setStages] = useState<boolean[]>(new Array(6).fill(false));

  useEffect(() => {
    const delays = [100, 300, 550, 750, 1000, 1300];
    const timers = delays.map((delay, i) =>
      setTimeout(() => {
        setStages((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Crossfading biome backgrounds */}
      {HERO_SLIDESHOW_IMAGES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-[-6%]"
          style={{
            opacity: i === activeSlide ? 0.35 : 0,
            transition: `opacity ${CROSSFADE_TRANSITION_MS}ms ease-in-out`,
            animation: "landing-ken-burns 25s ease-in-out infinite alternate",
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

      {/* Gradient overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(${T.bgRgb},0.82) 0%, rgba(${T.bgRgb},0.2) 30%, rgba(${T.bgRgb},0.2) 70%, rgba(${T.bgRgb},1) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 45%, transparent 0%, rgba(${T.bgRgb},0.55) 60%, rgba(${T.bgRgb},0.95) 100%)`,
        }}
      />

      {/* Ember particles */}
      <HeroEmbers />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-5 px-6 w-full max-w-lg">
        {/* Logo */}
        <div
          style={{
            opacity: stages[0] ? 1 : 0,
            transform: stages[0] ? "translateY(0) scale(1)" : "translateY(24px) scale(0.88)",
            transition: "all 800ms ease-out",
          }}
        >
          <HeroLogo />
        </div>

        {/* Title */}
        <div
          className="flex flex-col items-center gap-0.5"
          style={{
            opacity: stages[1] ? 1 : 0,
            transform: stages[1] ? "translateY(0)" : "translateY(18px)",
            transition: "all 700ms ease-out",
          }}
        >
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

        {/* Flourish */}
        <div
          className="w-full flex justify-center"
          style={{
            opacity: stages[2] ? 1 : 0,
            transform: stages[2] ? "translateY(0) scaleX(1)" : "translateY(6px) scaleX(0.7)",
            transition: "all 700ms ease-out",
          }}
        >
          <Flourish />
        </div>

        {/* Tagline */}
        <p
          className="text-xs sm:text-sm font-medium tracking-wider text-center"
          style={{
            color: `rgba(${T.accentRgb},0.48)`,
            opacity: stages[3] ? 1 : 0,
            transform: stages[3] ? "translateY(0)" : "translateY(12px)",
            transition: "all 700ms ease-out",
          }}
        >
          {LANDING_TAGLINE}
        </p>

        {/* CTA */}
        <div
          className="mt-1 sm:mt-3 flex flex-col items-center gap-3"
          style={{
            opacity: stages[4] ? 1 : 0,
            transform: stages[4] ? "translateY(0) scale(1)" : "translateY(16px) scale(0.94)",
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
          opacity: stages[5] ? 1 : 0,
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
