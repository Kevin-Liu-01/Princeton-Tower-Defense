"use client";
import React, { useState, useEffect, useMemo } from "react";
import { LANDING_THEME, LANDING_LORE, LANDING_STATS } from "../landingConstants";
import { LandingCTA } from "../LandingCTA";
import { SectionFlourish } from "./LoadoutUI";

const T = LANDING_THEME;

const CTA_EMBERS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  x: 10 + ((i * 31 + 7) % 80),
  size: 2 + (i % 4) * 1.2,
  duration: 5 + (i % 5) * 2,
  delay: (i * 1.1) % 10,
  opacity: 0.2 + (i % 3) * 0.1,
}));

function LoreQuote() {
  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(Math.floor(Math.random() * LANDING_LORE.length)); }, []);

  return (
    <p
      className="text-xs sm:text-sm italic text-center leading-relaxed max-w-lg"
      style={{ color: `rgba(${T.accentRgb},0.3)` }}
    >
      {LANDING_LORE[idx]}
    </p>
  );
}

interface BottomCTAProps {
  onPlay: () => void;
  exiting: boolean;
}

export function BottomCTA({ onPlay, exiting }: BottomCTAProps) {
  const stats = useMemo(() => LANDING_STATS, []);

  return (
    <section className="relative py-28 sm:py-36 px-6 flex flex-col items-center overflow-hidden">
      {/* Multi-layer atmosphere */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 60% 50% at 50% 60%, rgba(${T.accentDarkRgb},0.15) 0%, transparent 70%)`,
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(circle at 35% 45%, rgba(${T.princetonRgb},0.04), transparent 50%), radial-gradient(circle at 65% 55%, rgba(${T.accentRgb},0.04), transparent 50%)`,
      }} />

      {/* Ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {CTA_EMBERS.map(e => (
          <div
            key={e.id}
            className="absolute rounded-full"
            style={{
              left: `${e.x}%`,
              bottom: "-8px",
              width: e.size,
              height: e.size,
              background: T.accent,
              opacity: e.opacity,
              animation: `landing-cta-ember ${e.duration}s ease-out ${e.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10">
        <SectionFlourish />

        {/* Big motivational heading */}
        <div className="text-center">
          <h2
            className="text-4xl sm:text-6xl lg:text-7xl font-black font-cinzel tracking-wider uppercase"
            style={{
              color: T.accent,
              textShadow: `0 0 80px rgba(${T.accentRgb},0.35), 0 0 160px rgba(${T.accentRgb},0.1), 0 4px 16px rgba(0,0,0,0.7)`,
            }}
          >
            Defend the Realm
          </h2>
          <p
            className="text-xs sm:text-sm mt-4 tracking-wider uppercase font-medium"
            style={{ color: `rgba(${T.accentRgb},0.3)` }}
          >
            Command heroes. Build towers. Master spells.
          </p>
        </div>

        {/* Stats strip */}
        <div className="flex gap-4 sm:gap-8 flex-wrap justify-center">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={16} style={{ color: `rgba(${T.accentRgb},0.35)` }} />
              <span className="text-lg sm:text-xl font-black tabular-nums" style={{ color: T.accent }}>
                {value}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: `rgba(${T.accentRgb},0.3)` }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="w-48 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${T.accentRgb},0.2), transparent)` }} />

        <LoreQuote />

        {/* CTA */}
        <div className="mt-4">
          <LandingCTA onClick={onPlay} disabled={exiting} label="Play Now" />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px] mt-6" style={{ color: `rgba(${T.accentRgb},0.2)` }}>
          <span>Free to Play</span>
          <span style={{ color: `rgba(${T.accentRgb},0.1)` }}>&middot;</span>
          <span>Browser-Based</span>
          <span style={{ color: `rgba(${T.accentRgb},0.1)` }}>&middot;</span>
          <span>No Download Required</span>
          <span className="mx-2" style={{ color: `rgba(${T.accentRgb},0.08)` }}>|</span>
          <span>Created by Kevin Liu</span>
        </div>
      </div>
    </section>
  );
}
