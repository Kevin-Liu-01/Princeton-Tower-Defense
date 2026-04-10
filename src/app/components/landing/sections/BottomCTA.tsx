"use client";
import Image from "next/image";
import React, { useState, useEffect, useMemo } from "react";

import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import {
  LANDING_THEME,
  LANDING_LORE,
  LANDING_STATS,
  DEFEND_REALM_BG_IMAGE,
} from "../landingConstants";
import { LandingCTA } from "../LandingCTA";
import { SectionFlourish } from "./LoadoutUI";
import { MapSectionBg, MapCartouche } from "./mapElements";

const T = LANDING_THEME;

const CTA_EMBERS = Array.from({ length: 22 }, (_, i) => ({
  delay: (i * 0.9) % 10,
  duration: 5 + (i % 5) * 2,
  id: i,
  opacity: 0.15 + (i % 3) * 0.1,
  size: 2 + (i % 4) * 1.2,
  x: 5 + ((i * 29 + 7) % 90),
}));

function LoreQuote() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    setIdx(Math.floor(Math.random() * LANDING_LORE.length));
  }, []);

  return (
    <p
      className="text-xs sm:text-sm italic text-center leading-relaxed max-w-lg"
      style={{ color: `rgba(${T.accentRgb},0.3)` }}
    >
      {LANDING_LORE[idx]}
    </p>
  );
}

function MapLegendStats() {
  const stats = LANDING_STATS;
  return (
    <div
      className="relative px-6 sm:px-10 py-4 sm:py-5 rounded-sm"
      style={{
        background: `rgba(${T.bgRgb},0.6)`,
        border: `1px solid rgba(${T.accentRgb},0.1)`,
      }}
    >
      <div
        className="absolute inset-[3px] rounded-[1px] pointer-events-none"
        style={{ border: `0.5px solid rgba(${T.accentRgb},0.05)` }}
      />
      <div className="flex gap-5 sm:gap-8 flex-wrap justify-center">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={14} style={{ color: `rgba(${T.accentRgb},0.3)` }} />
            <span
              className="text-lg sm:text-xl font-black tabular-nums"
              style={{ color: T.accent }}
            >
              {value}
            </span>
            <span
              className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: `rgba(${T.accentRgb},0.25)` }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase tracking-[0.3em] px-3 py-0.5"
        style={{
          background: T.bg,
          border: `0.5px solid rgba(${T.accentRgb},0.1)`,
          color: `rgba(${T.accentRgb},0.25)`,
        }}
      >
        Legend
      </div>
    </div>
  );
}

interface BottomCTAProps {
  onPlay: () => void;
  exiting: boolean;
}

export function BottomCTA({ onPlay, exiting }: BottomCTAProps) {
  return (
    <section className="relative py-28 sm:py-36 px-6 flex flex-col items-center overflow-hidden">
      <MapSectionBg tint={`rgba(${T.accentDarkRgb},0.16)`} gridOpacity={0.04} />
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={DEFEND_REALM_BG_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          style={{
            filter: "brightness(0.4) saturate(0.7)",
            transform: "scale(1.04)",
          }}
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 50%, rgba(${T.princetonRgb},0.08), rgba(${T.bgRgb},0.86) 72%), linear-gradient(180deg, rgba(${T.bgRgb},0.68) 0%, rgba(${T.bgRgb},0.92) 100%)`,
        }}
      />
      <div className="absolute inset-x-3 inset-y-2 sm:inset-x-5 sm:inset-y-3 lg:inset-x-8 lg:inset-y-4 pointer-events-none z-[1]">
        <OrnateFrame
          className="w-full h-full"
          cornerSize={40}
          borderVariant="compact"
        >
          <div className="w-full h-full" />
        </OrnateFrame>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 35% 45%, rgba(${T.princetonRgb},0.04), transparent 50%), radial-gradient(circle at 65% 55%, rgba(${T.accentRgb},0.04), transparent 50%)`,
        }}
      />

      {/* Ember particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {CTA_EMBERS.map((e) => (
          <div
            key={e.id}
            className="absolute rounded-full"
            style={{
              animation: `landing-cta-ember ${e.duration}s ease-out ${e.delay}s infinite`,
              background: T.accent,
              bottom: "-8px",
              height: e.size,
              left: `${e.x}%`,
              opacity: e.opacity,
              width: e.size,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10">
        <SectionFlourish />

        {/* Epic heading in cartouche */}
        <MapCartouche>
          <div className="text-center px-4 sm:px-8 flex flex-col items-center">
            <h2
              className="text-4xl sm:text-6xl lg:text-7xl font-black font-cinzel tracking-wider uppercase"
              style={{
                color: T.accent,
                textShadow: `0 0 70px rgba(${T.accentRgb},0.4), 0 0 140px rgba(${T.accentRgb},0.14), 0 4px 16px rgba(0,0,0,0.78)`,
              }}
            >
              Defend the Realm
            </h2>
            <p
              className="text-xs sm:text-sm mt-4 tracking-[0.16em] uppercase font-semibold"
              style={{ color: `rgba(${T.accentRgb},0.52)` }}
            >
              Command heroes. Build towers. Break the siege.
            </p>
          </div>
        </MapCartouche>

        {/* Map legend stats */}
        {/* <MapLegendStats /> */}

        <div
          className="w-56 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${T.accentRgb},0.26), transparent)`,
          }}
        />

        {/* <LoreQuote /> */}

        {/* CTA */}
        <div
          className=" px-6 py-5 rounded-xl flex flex-col items-center gap-2"
          style={{
            background: `linear-gradient(180deg, rgba(${T.bgRgb},0.62), rgba(${T.bgRgb},0.8))`,
            border: `1px solid rgba(${T.accentRgb},0.16)`,
            boxShadow: `0 14px 36px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          <LandingCTA onClick={onPlay} disabled={exiting} label="Play Now" />
          <span
            className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold"
            style={{ color: `rgba(${T.accentRgb},0.38)` }}
          >
            Jump straight into battle
          </span>
        </div>

        {/* Footer */}
        <div
          className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px] mt-6"
          style={{ color: `rgba(${T.accentRgb},0.2)` }}
        >
          <span>Free to Play</span>
          <span style={{ color: `rgba(${T.accentRgb},0.1)` }}>&middot;</span>
          <span>Browser-Based</span>
          <span style={{ color: `rgba(${T.accentRgb},0.1)` }}>&middot;</span>
          <span>No Download Required</span>
          <span className="mx-2" style={{ color: `rgba(${T.accentRgb},0.08)` }}>
            |
          </span>
          <span>Created by Kevin Liu</span>
        </div>
      </div>
    </section>
  );
}
