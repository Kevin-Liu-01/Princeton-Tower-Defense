"use client";

import React, { useRef, useCallback } from "react";
import type { TroopType } from "../types";
import { TROOP_DATA } from "../constants";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";
import { drawTroopSprite } from "../rendering/troops";

export const TROOP_COLORS: Record<TroopType, string> = {
  footsoldier: "#6b8e23",
  armored: "#708090",
  elite: "#c0c0c0",
  knight: "#c0c0c0",
  reinforcement: "#a78bfa",
  centaur: "#8b4513",
  cavalry: "#daa520",
  thesis: "#a855f7",
  rowing: "#8b5cf6",
  hexling: "#c026d3",
  hexseer: "#f472b6",
  turret: "#f59e0b",
};

export const TroopSprite: React.FC<{
  type: TroopType;
  size?: number;
  animated?: boolean;
}> = ({ type, size = 48, animated = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderTroop = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = setupSpriteCanvas(canvas, size, size);
      if (!ctx) return;

      const tData = TROOP_DATA[type];
      if (!tData) return;

      const TROOP_SPRITE_SCALES: Record<string, number> = {
        footsoldier: 1.15, soldier: 1.25, rowing: 0.9, hexling: 1.2,
        armored: 1.15, elite: 1.15, thesis: 1.35, hexseer: 1.28,
        reinforcement: 1, cavalry: 1.6, centaur: 1.6, knight: 1.15, turret: 1.35,
      };
      const internalScale = TROOP_SPRITE_SCALES[type] ?? 1.0;
      const gameSize = 22;
      const zoom = Math.max(0.1, (size * 0.55) / (gameSize * internalScale));
      const cx = size / 2;
      const cy = size * 0.55;
      const t = animated ? time * 0.08 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      drawTroopSprite(ctx, 0, 0, gameSize * zoom, type, tData.color, t, zoom, 0);
      ctx.restore();
    },
    [type, size, animated],
  );

  useSpriteTicker(animated, 50, renderTroop);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-label={`${TROOP_DATA[type]?.name ?? type} sprite`}
    />
  );
};
