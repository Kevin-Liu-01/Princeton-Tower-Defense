"use client";
import React, { useRef, useCallback } from "react";

import { drawTowerSprite } from "../rendering/towers";
import type { TowerType, TowerUpgrade } from "../types";
import {
  setupSpriteCanvas,
  useSpriteTicker,
  SPRITE_PAD,
  spriteContainerStyle,
  spriteCanvasStyle,
} from "./hooks";

export const TowerSprite: React.FC<{
  type: TowerType;
  size?: number;
  level?: number;
  upgrade?: "A" | "B";
  animated?: boolean;
}> = ({ type, size = 48, level = 1, upgrade, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = Math.ceil(size * SPRITE_PAD);

  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = setupSpriteCanvas(canvas, canvasSize, canvasSize);
      if (!ctx || size <= 0) {
        return;
      }

      const offset = (canvasSize - size) / 2;
      ctx.translate(offset, offset);

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
        level as 1 | 2 | 3 | 4,
        upgrade as TowerUpgrade | undefined,
        t
      );
      ctx.restore();
    },
    [type, size, canvasSize, level, upgrade, animated]
  );

  useSpriteTicker(animated, 50, render);

  return (
    <div style={spriteContainerStyle(size, size)}>
      <canvas
        ref={canvasRef}
        style={spriteCanvasStyle(canvasSize, canvasSize)}
        aria-label={`${type} tower sprite`}
      />
    </div>
  );
};
