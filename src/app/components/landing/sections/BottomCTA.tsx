"use client";
import React from "react";

import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { LANDING_THEME, oklchBg } from "../landingConstants";
import { LandingCTA } from "../LandingCTA";
import { SectionFlourish } from "./LoadoutUI";
import { MapCartouche } from "./mapElements";

const T = LANDING_THEME;

interface BottomCTAProps {
  onPlay: () => void;
  exiting: boolean;
}

export function BottomCTA({ onPlay, exiting }: BottomCTAProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Video — in flow, determines section height */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="w-full block"
        style={{ filter: "brightness(0.85) saturate(1.05)" }}
        src="/videos/sandbox.mp4"
      />

      {/* Light vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg in oklch, ${oklchBg(0.85)} 0%, ${oklchBg(0.15)} 18%, transparent 35%, transparent 70%, ${oklchBg(0.2)} 82%, ${oklchBg(0.9)} 100%),
            radial-gradient(in oklch, transparent 30%, ${oklchBg(0.35)} 100%)
          `,
        }}
      />

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

      {/* Overlaid content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between">
        {/* Top: Defend the Realm */}
        <div className="pt-10 sm:pt-16 flex flex-col items-center gap-4">
          <SectionFlourish />
          <MapCartouche>
            <div className="text-center px-4 sm:px-8 flex flex-col items-center">
              <h2
                className="text-4xl sm:text-6xl lg:text-7xl font-black font-cinzel tracking-wider uppercase"
                style={{
                  color: T.accent,
                  textShadow: `0 0 70px rgba(${T.accentRgb},0.5), 0 0 140px rgba(${T.accentRgb},0.2), 0 4px 16px rgba(0,0,0,0.8)`,
                }}
              >
                Defend the Realm
              </h2>
            </div>
          </MapCartouche>
        </div>

        {/* Bottom: CTA + footer */}
        <div className="pb-10 sm:pb-16 pt-4 flex flex-col items-center gap-5">
          <div
            className="px-6 py-5 rounded-xl flex flex-col items-center gap-2"
            style={{
              background: `linear-gradient(180deg in oklch, ${oklchBg(0.8)}, ${oklchBg(0.92)})`,
              border: `1px solid rgba(${T.accentRgb},0.22)`,
              boxShadow: `0 14px 36px rgba(0,0,0,0.4), inset 0 1px 0 rgba(${T.accentRgb},0.08)`,
              backdropFilter: "blur(8px)",
            }}
          >
            <LandingCTA onClick={onPlay} disabled={exiting} label="Play Now" />
            <span
              className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold"
              style={{ color: `rgba(${T.accentRgb},0.45)` }}
            >
              Command heroes. Build towers. Jump straight into battle!
            </span>
          </div>

          <div
            className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] sm:text-[11px]"
            style={{ color: `rgba(${T.accentRgb},0.25)` }}
          >
            <span>Free to Play</span>
            <span style={{ color: `rgba(${T.accentRgb},0.12)` }}>&middot;</span>
            <span>Browser-Based</span>
            <span style={{ color: `rgba(${T.accentRgb},0.12)` }}>&middot;</span>
            <span>No Download Required</span>
            <span
              className="mx-2"
              style={{ color: `rgba(${T.accentRgb},0.08)` }}
            >
              |
            </span>
            <span>Created by Kevin Liu</span>
          </div>
        </div>
      </div>
    </section>
  );
}
