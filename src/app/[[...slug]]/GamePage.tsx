"use client";

import { useState, useCallback } from "react";
import { LandingPage } from "../components/landing/LandingPage";
import { usePrincetonTowerDefenseRuntime } from "../hooks/usePrincetonTowerDefenseRuntime";

function GameRuntime() {
  return usePrincetonTowerDefenseRuntime();
}

export function GamePage({ showLanding = false }: { showLanding?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const handlePlay = useCallback(() => setPlaying(true), []);

  if (showLanding && !playing) {
    return <LandingPage onPlay={handlePlay} />;
  }

  return <GameRuntime />;
}
