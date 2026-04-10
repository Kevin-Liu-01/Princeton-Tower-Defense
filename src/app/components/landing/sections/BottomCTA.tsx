"use client";
import React from "react";

import { OrnateFrame } from "../../ui/primitives/OrnateFrame";
import { LANDING_THEME } from "../landingConstants";
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
    <section className="relative flex flex-col items-center overflow-hidden">
      {/* Video background — visible, not buried */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.85) saturate(1.05)" }}
          src="/videos/sandbox.mp4"
        />
      </div>

      {/* Light vignette — just enough to ground text, not hide video */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(180deg, rgba(${T.bgRgb},0.85) 0%, rgba(${T.bgRgb},0.15) 22%, transparent 40%, transparent 65%, rgba(${T.bgRgb},0.2) 80%, rgba(${T.bgRgb},0.9) 100%),
            radial-gradient(ellipse 90% 70% at 50% 50%, transparent 30%, rgba(${T.bgRgb},0.35) 100%)
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Top: Defend the Realm */}
        <div className="pt-14 sm:pt-20 pb-6 flex flex-col items-center gap-4">
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
              {/* <p
                className="text-xs sm:text-sm mt-3 tracking-[0.16em] uppercase font-semibold"
                style={{ color: `rgba(${T.accentRgb},0.6)` }}
              >
                Command heroes. Build towers. Break the siege.
              </p> */}
            </div>
          </MapCartouche>
        </div>

        {/* Spacer so the video shows through the middle */}
        <div className="h-48 sm:h-64 lg:h-80" />

        {/* Bottom: CTA + footer */}
        <div className="pb-14 sm:pb-20 pt-6 flex flex-col items-center gap-6">
          <div
            className="px-6 py-5 rounded-xl flex flex-col items-center gap-2"
            style={{
              background: `linear-gradient(180deg, rgba(${T.bgRgb},0.8), rgba(${T.bgRgb},0.92))`,
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
