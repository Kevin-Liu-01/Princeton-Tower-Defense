"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { useImagePreloader } from "../../hooks/useImagePreloader";
import { LANDING_THEME, getLandingImageUrls } from "./landingConstants";
import { LandingCreditsModal } from "./LandingCreditsModal";
import { SectionReveal } from "./SectionReveal";
import { ArsenalShowcase } from "./sections/ArsenalShowcase";
import { BottomCTA } from "./sections/BottomCTA";
import { EnemyBestiary } from "./sections/EnemyBestiary";
import { GameplayShowcase } from "./sections/GameplayShowcase";
import { HeroSection } from "./sections/HeroSection";
import { MapSectionDivider } from "./sections/mapElements";

const T = LANDING_THEME;

interface LandingPageProps {
  onPlay: () => void;
}

export function LandingPage({ onPlay }: LandingPageProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [exiting, setExiting] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const landingImages = useMemo(() => getLandingImageUrls(), []);
  useImagePreloader(landingImages);

  const handlePlay = useCallback(() => {
    if (exiting) {
      return;
    }
    setExiting(true);
    setTimeout(onPlay, 700);
  }, [exiting, onPlay]);

  const handleOpenCredits = useCallback(() => setShowCredits(true), []);
  const handleCloseCredits = useCallback(() => setShowCredits(false), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !exiting && !showCredits) {
        handlePlay();
      }
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
      <HeroSection
        onPlay={handlePlay}
        exiting={exiting}
        onCredits={handleOpenCredits}
      />

      <SectionReveal scrollRoot={scrollRef} delay={100}>
        <GameplayShowcase />
      </SectionReveal>

      <MapSectionDivider />

      <SectionReveal scrollRoot={scrollRef}>
        <ArsenalShowcase />
      </SectionReveal>

      <MapSectionDivider />

      <SectionReveal scrollRoot={scrollRef}>
        <EnemyBestiary />
      </SectionReveal>

      <MapSectionDivider />

      <SectionReveal scrollRoot={scrollRef}>
        <BottomCTA onPlay={handlePlay} exiting={exiting} />
      </SectionReveal>

      {showCredits && <LandingCreditsModal onClose={handleCloseCredits} />}
    </div>
  );
}
