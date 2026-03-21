"use client";
import React, { useRef, useCallback } from "react";
import type { EnemyType } from "../types";
import { ENEMY_DATA } from "../constants";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";
import { drawEnemySprite } from "../rendering/enemies";

export type { EnemyType } from "../types";

export const ENEMY_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(ENEMY_DATA).map(([k, v]) => [k, v.color]),
);

export const EnemySprite: React.FC<{
  type: EnemyType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 40, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderEnemy = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = setupSpriteCanvas(canvas, size, size);
      if (!ctx || size <= 0) return;

      const eData = ENEMY_DATA[type];
      if (!eData) return;

      const gameSize = eData.size || 24;
      const zoom = Math.max(0.1, (size * 0.65) / gameSize);
      const cx = size / 2;
      const cy = size * 0.55;
      const t = animated ? time * 0.08 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      drawEnemySprite(ctx, 0, 0, gameSize * zoom, type, eData.color, 0, t, !!eData.flying, zoom, 0);
      ctx.restore();
    },
    [type, size, animated],
  );

  useSpriteTicker(animated, 50, renderEnemy);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-label={`${ENEMY_DATA[type]?.name ?? type} sprite`}
    />
  );
};
