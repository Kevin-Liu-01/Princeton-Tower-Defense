"use client";
import React, { useRef, useCallback } from "react";
import type { EnemyType, MapTheme } from "../types";
import { ENEMY_DATA } from "../constants";
import { setupSpriteCanvas, useSpriteTicker } from "./hooks";
import { drawEnemySprite } from "../rendering/enemies";

export type { EnemyType } from "../types";

export const ENEMY_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(ENEMY_DATA).map(([k, v]) => [k, v.color]),
);

/**
 * Compensates for internal `size *=` multipliers inside each enemy's draw
 * function so codex sprites render at the correct scale and vertical position.
 * scale ≈ 1 / internalMultiplier;  offsetY shifts down (fraction of canvas).
 */
const CODEX_SPRITE_ADJUSTMENTS: Partial<Record<EnemyType, { scale: number; offsetY: number }>> = {
  // academic.ts — all 1.7×
  frosh: { scale: 0.59, offsetY: 0 },
  sophomore: { scale: 0.59, offsetY: 0 },
  junior: { scale: 0.59, offsetY: 0 },
  senior: { scale: 0.59, offsetY: 0 },
  gradstudent: { scale: 0.59, offsetY: 0 },
  professor: { scale: 0.59, offsetY: 0 },
  dean: { scale: 0.59, offsetY: 0 },

  // special.ts — trustee 1.7×
  trustee: { scale: 0.59, offsetY: 0 },

  // ranged.ts — 1.7× (catapult has no multiplier)
  archer: { scale: 0.59, offsetY: 0 },
  mage: { scale: 0.59, offsetY: 0 },
  warlock: { scale: 0.59, offsetY: 0 },
  crossbowman: { scale: 0.59, offsetY: 0 },
  hexer: { scale: 0.59, offsetY: 0 },

  // forest.ts — 1.7×
  athlete: { scale: 0.59, offsetY: 0 },
  tiger_fan: { scale: 0.59, offsetY: 0 },

  // darkfantasy.ts — 1.75×–2.1×
  skeleton_footman: { scale: 0.56, offsetY: 0 },
  skeleton_knight: { scale: 0.54, offsetY: 0 },
  skeleton_archer: { scale: 0.57, offsetY: 0 },
  skeleton_king: { scale: 0.50, offsetY: 0 },
  zombie_shambler: { scale: 0.56, offsetY: 0 },
  zombie_brute: { scale: 0.50, offsetY: 0 },
  zombie_spitter: { scale: 0.56, offsetY: 0 },
  ghoul: { scale: 0.56, offsetY: 0 },
  dark_knight: { scale: 0.53, offsetY: 0 },
  death_knight: { scale: 0.48, offsetY: 0 },

  // darkfantasyB.ts — 1.8×–2.15×
  fallen_paladin: { scale: 0.53, offsetY: 0 },
  black_guard: { scale: 0.54, offsetY: 0 },
  lich: { scale: 0.54, offsetY: 0 },
  wraith: { scale: 0.56, offsetY: 0 },
  bone_mage: { scale: 0.56, offsetY: 0 },
  dark_priest: { scale: 0.54, offsetY: 0 },
  revenant: { scale: 0.53, offsetY: 0 },
  abomination: { scale: 0.47, offsetY: 0 },
  hellhound: { scale: 0.54, offsetY: 0 },
  doom_herald: { scale: 0.48, offsetY: 0 },

  // fantasy.ts — 1.15×–2.2×
  dire_bear: { scale: 0.67, offsetY: 0 },
  ancient_ent: { scale: 0.59, offsetY: 0 },
  forest_troll: { scale: 0.71, offsetY: 0 },
  timber_wolf: { scale: 0.77, offsetY: 0 },
  giant_eagle: { scale: 0.87, offsetY: 0 },
  swamp_hydra: { scale: 0.63, offsetY: 0 },
  giant_toad: { scale: 0.74, offsetY: 0 },
  vine_serpent: { scale: 0.77, offsetY: 0 },
  marsh_troll: { scale: 0.71, offsetY: 0 },
  phoenix: { scale: 0.67, offsetY: 0 },
  basilisk: { scale: 0.69, offsetY: 0 },
  djinn: { scale: 0.74, offsetY: 0 },
  manticore: { scale: 0.71, offsetY: 0 },
  frost_troll: { scale: 0.71, offsetY: 0 },
  dire_wolf: { scale: 0.69, offsetY: 0 },
  wendigo: { scale: 0.71, offsetY: 0 },
  mammoth: { scale: 0.45, offsetY: 0 },
  lava_golem: { scale: 0.67, offsetY: 0 },
  volcanic_drake: { scale: 0.71, offsetY: 0 },
  salamander: { scale: 0.83, offsetY: 0 },

  // desert.ts — 1.35×–1.8×
  nomad: { scale: 0.74, offsetY: 0 },
  scorpion: { scale: 0.67, offsetY: 0 },
  scarab: { scale: 0.56, offsetY: 0 },

  // winter.ts — 1.25×–1.6×
  snow_goblin: { scale: 0.63, offsetY: 0 },
  yeti: { scale: 0.80, offsetY: 0 },
  ice_witch: { scale: 0.74, offsetY: 0 },

  // volcanic.ts — 1.4×–1.7×
  magma_spawn: { scale: 0.67, offsetY: 0 },
  fire_imp: { scale: 0.59, offsetY: 0 },
  ember_guard: { scale: 0.71, offsetY: 0 },

  // swamp.ts — 1.3×–1.5×
  bog_creature: { scale: 0.71, offsetY: 0 },
  will_o_wisp: { scale: 0.67, offsetY: 0 },
  swamp_troll: { scale: 0.77, offsetY: 0 },

  // bugs.ts — 1.1×–1.8×
  orb_weaver: { scale: 0.71, offsetY: 0 },
  mantis: { scale: 0.77, offsetY: 0 },
  bombardier_beetle: { scale: 0.80, offsetY: 0 },
  mosquito: { scale: 0.83, offsetY: 0 },
  centipede: { scale: 0.71, offsetY: 0 },
  dragonfly: { scale: 0.87, offsetY: 0 },
  silk_moth: { scale: 0.83, offsetY: 0 },
  ant_soldier: { scale: 0.77, offsetY: 0 },
  locust: { scale: 0.91, offsetY: 0 },
  trapdoor_spider: { scale: 0.74, offsetY: 0 },
  ice_beetle: { scale: 0.77, offsetY: 0 },
  frost_tick: { scale: 0.87, offsetY: 0 },
  snow_moth: { scale: 0.83, offsetY: 0 },
  fire_ant: { scale: 0.71, offsetY: 0 },
  magma_beetle: { scale: 0.74, offsetY: 0 },
  ash_moth: { scale: 0.83, offsetY: 0 },
  brood_mother: { scale: 0.56, offsetY: 0 },
};

export const EnemySprite: React.FC<{
  type: EnemyType;
  size?: number;
  animated?: boolean;
  region?: MapTheme;
}> = ({ type, size = 40, animated = false, region }) => {
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
      const baseZoom = Math.max(0.1, (size * 0.65) / gameSize);
      const cx = size / 2;
      const baseCy = size * 0.55;
      const t = animated ? time * 0.08 : 0;

      const adj = CODEX_SPRITE_ADJUSTMENTS[type];
      const zoom = baseZoom * (adj?.scale ?? 1);
      const cy = baseCy + (adj?.offsetY ?? 0) * size;

      ctx.save();
      ctx.translate(cx, cy);
      try {
        drawEnemySprite(ctx, 0, 0, gameSize * zoom, type, eData.color, 0, t, !!eData.flying, zoom, 0, region);
      } catch {
        // Silently handle rendering errors at very small sprite sizes
      }
      ctx.restore();
    },
    [type, size, animated, region],
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
