"use client";
import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useImagePreloader } from "../../hooks/useImagePreloader";
import { getWorldMapAssets, getBattleAssets } from "../../constants/loadingAssets";
import { LANDING_THEME, getLandingImageUrls } from "./landingConstants";
import { SectionReveal } from "./SectionReveal";
import { HeroSection } from "./sections/HeroSection";
import { GameplayShowcase } from "./sections/GameplayShowcase";
import { FeatureGrid } from "./sections/FeatureGrid";
import { HeroSpellGallery } from "./sections/HeroSpellGallery";
import { BattlePreview } from "./sections/BattlePreview";
import { BottomCTA } from "./sections/BottomCTA";

const T = LANDING_THEME;

interface LandingPageProps {
  onPlay: () => void;
}

export function LandingPage({ onPlay }: LandingPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [exiting, setExiting] = useState(false);

  // Preload ALL game assets in background while user browses the landing page
  const allAssets = useMemo(() => {
    const set = new Set([
      ...getWorldMapAssets(),
      ...getBattleAssets(),
      ...getLandingImageUrls(),
    ]);
    return Array.from(set);
  }, []);
  useImagePreloader(allAssets);

  const handlePlay = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    setTimeout(onPlay, 700);
  }, [exiting, onPlay]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !exiting) handlePlay();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  return (
    <div
      ref={scrollRef}
      className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden no-scrollbar"
      style={{
        background: T.bg,
        opacity: exiting ? 0 : 1,
        transform: exiting ? "scale(1.02)" : "scale(1)",
        transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
      }}
    >
      <HeroSection onPlay={handlePlay} exiting={exiting} />

      <SectionReveal scrollRoot={scrollRef}>
        <GameplayShowcase />
      </SectionReveal>

      <SectionReveal scrollRoot={scrollRef} delay={100}>
        <FeatureGrid />
      </SectionReveal>

      <SectionReveal scrollRoot={scrollRef}>
        <HeroSpellGallery />
      </SectionReveal>

      <SectionReveal scrollRoot={scrollRef} delay={100}>
        <BattlePreview />
      </SectionReveal>

      <SectionReveal scrollRoot={scrollRef}>
        <BottomCTA onPlay={handlePlay} exiting={exiting} />
      </SectionReveal>
    </div>
  );
}
