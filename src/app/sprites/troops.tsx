"use client";

import React, { useRef, useCallback } from "react";

import { TROOP_DATA } from "../constants";
import { drawTroopSprite } from "../rendering/troops";
import type { TroopType, TroopOwnerType, MapTheme } from "../types";
import { setupSpriteCanvas, useSpriteTicker, SPRITE_PAD } from "./hooks";

export const TROOP_COLORS: Record<TroopType, string> = {
  armored: "#708090",
  cavalry: "#daa520",
  centaur: "#8b4513",
  elite: "#c0c0c0",
  footsoldier: "#6b8e23",
  hexling: "#c026d3",
  hexseer: "#f472b6",
  knight: "#c0c0c0",
  reinforcement: "#a78bfa",
  rowing: "#8b5cf6",
  thesis: "#a855f7",
  turret: "#f59e0b",
};

export const TroopSprite: React.FC<{
  type: TroopType;
  size?: number;
  animated?: boolean;
  knightVariant?: number;
  ownerType?: TroopOwnerType;
  visualTier?: number;
  troopId?: string;
  mapTheme?: MapTheme;
}> = ({
  type,
  size = 48,
  animated = false,
  knightVariant,
  ownerType,
  visualTier,
  troopId,
  mapTheme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = Math.ceil(size * SPRITE_PAD);

  const renderTroop = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const ctx = setupSpriteCanvas(canvas, canvasSize, canvasSize);
      if (!ctx) {
        return;
      }

      const offset = (canvasSize - size) / 2;
      ctx.translate(offset, offset);

      const tData = TROOP_DATA[type];
      if (!tData) {
        return;
      }

      const TROOP_SPRITE_SCALES: Record<string, number> = {
        armored: 1.4,
        cavalry: 1.85,
        centaur: 1.85,
        elite: 1.4,
        footsoldier: 1.15,
        hexling: 1.2,
        hexseer: 1.28,
        knight: 1.45,
        reinforcement: 1.25,
        rowing: 0.9,
        soldier: 1.55,
        thesis: 1.35,
        turret: 1.35,
      };
      const TROOP_SPRITE_CY: Record<string, number> = {
        armored: 0.6,
        cavalry: 0.61,
        centaur: 0.61,
        elite: 0.62,
        footsoldier: 0.6,
        hexling: 0.55,
        hexseer: 0.55,
        knight: 0.6,
        reinforcement: 0.64,
        rowing: 0.55,
        soldier: 0.54,
        thesis: 0.55,
        turret: 0.35,
      };
      const internalScale = TROOP_SPRITE_SCALES[type] ?? 1;
      const gameSize = 22;
      const zoom = Math.max(0.1, (size * 0.55) / (gameSize * internalScale));
      const cx = size / 2;
      const cy = size * (TROOP_SPRITE_CY[type] ?? 0.55);
      const t = animated ? time * 0.08 : 0;

      ctx.save();
      ctx.translate(cx, cy);
      drawTroopSprite(
        ctx,
        0,
        0,
        gameSize * zoom,
        type,
        tData.color,
        t,
        zoom,
        0,
        undefined,
        ownerType,
        visualTier,
        mapTheme,
        troopId,
        knightVariant
      );
      ctx.restore();
    },
    [
      type,
      size,
      canvasSize,
      animated,
      knightVariant,
      ownerType,
      visualTier,
      troopId,
      mapTheme,
    ]
  );

  useSpriteTicker(animated, 50, renderTroop);

  return (
    <canvas
      ref={canvasRef}
      style={{ height: canvasSize, width: canvasSize }}
      aria-label={`${TROOP_DATA[type]?.name ?? type} sprite`}
    />
  );
};
