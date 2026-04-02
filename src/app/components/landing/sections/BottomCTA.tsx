"use client";
import React, { useState, useEffect } from "react";
import { LANDING_THEME, LANDING_LORE } from "../landingConstants";
import { LandingCTA } from "../LandingCTA";

const T = LANDING_THEME;

function LoreQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * LANDING_LORE.length));
  }, []);

  return (
    <p
      className="text-[11px] sm:text-xs italic text-center leading-relaxed max-w-sm"
      style={{ color: `rgba(${T.accentRgb},0.28)` }}
    >
      {LANDING_LORE[quoteIndex]}
    </p>
  );
}

function Divider() {
  return (
    <div
      className="h-px w-40 mx-auto"
      style={{
        background: `linear-gradient(90deg, transparent, rgba(${T.accentDarkRgb},0.3), transparent)`,
      }}
    />
  );
}

interface BottomCTAProps {
  onPlay: () => void;
  exiting: boolean;
}

export function BottomCTA({ onPlay, exiting }: BottomCTAProps) {
  return (
    <section className="py-16 sm:py-24 px-6 flex flex-col items-center gap-6">
      <Divider />

      <LoreQuote />

      <div className="mt-2">
        <LandingCTA onClick={onPlay} disabled={exiting} label="Play Now" />
      </div>

      <div
        className="flex flex-wrap justify-center items-center gap-x-1.5 gap-y-0.5 text-[10px] mt-4"
        style={{ color: `rgba(${T.accentRgb},0.2)` }}
      >
        <span>Free</span>
        <span>·</span>
        <span>Browser</span>
        <span>·</span>
        <span>No Download</span>
        <span className="mx-1">|</span>
        <span>Created by Kevin Liu</span>
      </div>
    </section>
  );
}
