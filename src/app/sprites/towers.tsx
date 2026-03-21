"use client";
import React, { useRef, useCallback } from "react";
import type { TowerType, TowerUpgrade } from "../types";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";
import { drawTowerSprite } from "../rendering/towers";

export const TowerSprite: React.FC<{
  type: TowerType;
  size?: number;
  level?: number;
  upgrade?: "A" | "B";
  animated?: boolean;
}> = ({ type, size = 48, level = 1, upgrade, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback(
    (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupSpriteCanvas(canvas, size, size);
      if (!ctx || size <= 0) return;

    const cx = size / 2;
    const cy = size / 2;
      const t = animated ? time * 0.08 : 0;

        ctx.save();
      drawTowerSprite(
        ctx,
        cx,
        cy,
        size,
        type,
        (level as 1 | 2 | 3 | 4),
        upgrade as TowerUpgrade | undefined,
        t,
      );
        ctx.restore();
    },
    [type, size, level, upgrade, animated],
  );

  useSpriteTicker(animated, 50, render);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-label={`${type} tower sprite`}
    />
  );
};
