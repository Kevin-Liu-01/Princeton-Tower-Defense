"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";

import { LandingPage } from "../components/landing/LandingPage";

const preloadGame = () => import("./GameRuntime");
const GameRuntime = dynamic(preloadGame, {
  loading: () => (
    <div
      role="status"
      className="fixed inset-0 grid place-items-center bg-stone-950 text-amber-100"
    >
      Opening the realm…
    </div>
  ),
});

export function GamePage({ showLanding = false }: { showLanding?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const handlePlay = useCallback(() => setPlaying(true), []);

  if (showLanding && !playing) {
    return (
      <LandingPage
        onPlay={handlePlay}
        onPlayIntent={() => {
          void preloadGame();
        }}
      />
    );
  }

  return <GameRuntime />;
}
