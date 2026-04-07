"use client";
import React, { useRef, useCallback } from "react";

import { HERO_DATA } from "../constants";
import { drawHeroSprite } from "../rendering/heroes";
import type { HeroType } from "../types";
import { setupSpriteCanvas, useSpriteTicker, SPRITE_PAD } from "./hooks";

export const HERO_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(HERO_DATA).map(([k, v]) => [k, v.color])
);

const HERO_SPRITE_SCALE: Partial<Record<HeroType, number>> = {
  ivy: 1.5,
};

export const HeroSprite: React.FC<{
  type: HeroType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 48, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scale = HERO_SPRITE_SCALE[type] ?? 1;
  const baseW = size * scale;
  const baseH = size * scale;
  const canvasW = Math.ceil(baseW * SPRITE_PAD);
  const canvasH = Math.ceil(baseH * SPRITE_PAD);

  const renderHero = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = setupSpriteCanvas(canvas, canvasW, canvasH);
      if (!ctx) {
        return;
      }

      const offsetX = (canvasW - baseW) / 2;
      const offsetY = (canvasH - baseH) / 2;
      ctx.translate(offsetX, offsetY);

      const hData = HERO_DATA[type];
      if (!hData) {
        return;
      }

      const gameSize = 32;
      const drawSize = baseW * 0.55;
      const zoom = Math.max(0.1, drawSize / gameSize);
      const cx = baseW / 2;
      const cy = baseH * 0.58;
      const t = animated ? time * 0.08 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      drawHeroSprite(ctx, 0, 0, drawSize, type, hData.color, t, zoom, 0);
      ctx.restore();
    },
    [type, baseW, baseH, canvasW, canvasH, animated]
  );

  useSpriteTicker(animated, 50, renderHero);

  return (
    <canvas
      ref={canvasRef}
      style={{ height: canvasH, width: canvasW }}
      aria-label={`${HERO_DATA[type]?.name ?? type} sprite`}
    />
  );
};
