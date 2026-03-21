"use client";
import React, { useRef, useCallback } from "react";
import type { HeroType } from "../types";
import { HERO_DATA } from "../constants";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";
import { drawHeroSprite } from "../rendering/heroes";

export const HERO_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(HERO_DATA).map(([k, v]) => [k, v.color]),
);

export const HeroSprite: React.FC<{
  type: HeroType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 48, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderHero = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = setupSpriteCanvas(canvas, size, size);
      if (!ctx) return;

      const hData = HERO_DATA[type];
      if (!hData) return;

      const gameSize = 32;
      const drawSize = size * 0.55;
      const zoom = Math.max(0.1, drawSize / gameSize);
      const cx = size / 2;
      const cy = size * 0.58;
      const t = animated ? time * 0.08 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      drawHeroSprite(ctx, 0, 0, drawSize, type, hData.color, t, zoom, 0);
      ctx.restore();
    },
    [type, size, animated],
  );

  useSpriteTicker(animated, 50, renderHero);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-label={`${HERO_DATA[type]?.name ?? type} sprite`}
    />
  );
};
