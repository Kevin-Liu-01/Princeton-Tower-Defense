"use client";
import React, { useRef, useCallback } from "react";

import { ENEMY_DATA } from "../constants";
import { drawEnemySprite } from "../rendering/enemies";
import type { EnemyType, MapTheme } from "../types";
import { setupSpriteCanvas, useSpriteTicker, SPRITE_PAD } from "./hooks";

export type { EnemyType } from "../types";

export const ENEMY_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(ENEMY_DATA).map(([k, v]) => [k, v.color])
);

/**
 * Compensates for internal `size *=` multipliers inside each enemy's draw
 * function so codex sprites render at the correct scale and vertical position.
 * scale ≈ 1 / internalMultiplier;  offsetY shifts down (fraction of canvas).
 */
const CODEX_SPRITE_ADJUSTMENTS: Partial<
  Record<EnemyType, { scale: number; offsetY: number }>
> = {
  // academic.ts — all 1.7×
  frosh: { offsetY: 0.1, scale: 0.59 },
  sophomore: { offsetY: 0.05, scale: 0.59 },
  junior: { offsetY: 0.1, scale: 0.59 },
  senior: { offsetY: 0.1, scale: 0.59 },
  gradstudent: { offsetY: 0.1, scale: 0.59 },
  professor: { offsetY: 0.1, scale: 0.59 },
  dean: { offsetY: 0.1, scale: 0.59 },

  // special.ts — trustee 1.7×
  trustee: { offsetY: 0.1, scale: 0.59 },

  // ranged.ts — 1.7× (catapult has no multiplier)
  archer: { offsetY: 0.15, scale: 0.5 },
  mage: { offsetY: 0.1, scale: 0.67 },
  warlock: { offsetY: 0.05, scale: 0.63 },
  crossbowman: { offsetY: 0.05, scale: 0.79 },
  hexer: { offsetY: 0.15, scale: 0.7 },

  // forest.ts — 1.7×
  athlete: { offsetY: 0, scale: 0.59 },
  tiger_fan: { offsetY: 0.05, scale: 0.71 },

  // darkfantasy.ts — 1.75×–2.1×
  skeleton_footman: { offsetY: -0.05, scale: 0.8 },
  skeleton_knight: { offsetY: -0.05, scale: 0.74 },
  skeleton_archer: { offsetY: -0.05, scale: 0.67 },
  skeleton_king: { offsetY: -0.05, scale: 0.7 },
  zombie_shambler: { offsetY: -0.1, scale: 0.86 },
  zombie_brute: { offsetY: -0.05, scale: 0.6 },
  zombie_spitter: { offsetY: -0.1, scale: 0.86 },
  ghoul: { offsetY: -0.1, scale: 0.86 },
  dark_knight: { offsetY: 0, scale: 0.63 },
  death_knight: { offsetY: 0, scale: 0.58 },

  // darkfantasyB.ts — 1.8×–2.15×
  fallen_paladin: { offsetY: 0, scale: 0.63 },
  black_guard: { offsetY: 0, scale: 0.74 },
  lich: { offsetY: 0, scale: 0.74 },
  wraith: { offsetY: 0, scale: 0.76 },
  bone_mage: { offsetY: 0, scale: 0.76 },
  dark_priest: { offsetY: 0, scale: 0.74 },
  revenant: { offsetY: 0, scale: 0.73 },
  abomination: { offsetY: -0.05, scale: 0.57 },
  hellhound: { offsetY: 0, scale: 0.54 },
  doom_herald: { offsetY: 0, scale: 0.68 },

  // fantasy.ts — 1.15×–2.2×
  dire_bear: { offsetY: 0, scale: 0.77 },
  ancient_ent: { offsetY: 0, scale: 0.7 },
  forest_troll: { offsetY: 0, scale: 0.91 },
  timber_wolf: { offsetY: 0, scale: 0.77 },
  giant_eagle: { offsetY: 0, scale: 0.87 },
  swamp_hydra: { offsetY: 0, scale: 0.63 },
  giant_toad: { offsetY: 0, scale: 0.74 },
  vine_serpent: { offsetY: 0, scale: 0.77 },
  marsh_troll: { offsetY: 0, scale: 0.71 },
  phoenix: { offsetY: 0, scale: 0.67 },
  basilisk: { offsetY: 0, scale: 0.69 },
  djinn: { offsetY: 0, scale: 0.74 },
  manticore: { offsetY: 0, scale: 0.71 },
  frost_troll: { offsetY: 0, scale: 0.71 },
  dire_wolf: { offsetY: 0, scale: 0.69 },
  wendigo: { offsetY: 0, scale: 0.71 },
  mammoth: { offsetY: 0, scale: 0.6 },
  lava_golem: { offsetY: 0, scale: 0.67 },
  volcanic_drake: { offsetY: 0, scale: 0.71 },
  salamander: { offsetY: 0, scale: 0.83 },

  // desert.ts — 1.35×–1.8×
  nomad: { offsetY: 0, scale: 0.74 },
  scorpion: { offsetY: 0, scale: 0.67 },
  scarab: { offsetY: 0, scale: 0.56 },

  // winter.ts — 1.25×–1.6×
  snow_goblin: { offsetY: 0, scale: 0.63 },
  yeti: { offsetY: 0, scale: 0.8 },
  ice_witch: { offsetY: 0, scale: 0.74 },

  // volcanic.ts — 1.4×–1.7×
  magma_spawn: { offsetY: 0, scale: 0.67 },
  fire_imp: { offsetY: 0, scale: 0.59 },
  ember_guard: { offsetY: 0, scale: 0.71 },

  // swamp.ts — 1.3×–1.5×
  bog_creature: { offsetY: 0, scale: 0.71 },
  will_o_wisp: { offsetY: -0.1, scale: 0.37 },
  swamp_troll: { offsetY: 0, scale: 0.77 },

  // bugs.ts — 1.1×–1.8×
  orb_weaver: { offsetY: 0, scale: 0.71 },
  mantis: { offsetY: 0, scale: 0.77 },
  bombardier_beetle: { offsetY: 0, scale: 0.8 },
  mosquito: { offsetY: 0, scale: 0.83 },
  centipede: { offsetY: 0, scale: 0.71 },
  dragonfly: { offsetY: 0, scale: 0.87 },
  silk_moth: { offsetY: 0, scale: 0.83 },
  ant_soldier: { offsetY: 0, scale: 0.77 },
  locust: { offsetY: 0, scale: 0.91 },
  trapdoor_spider: { offsetY: 0, scale: 0.74 },
  ice_beetle: { offsetY: 0, scale: 0.77 },
  frost_tick: { offsetY: 0, scale: 0.87 },
  snow_moth: { offsetY: 0, scale: 0.83 },
  fire_ant: { offsetY: 0, scale: 0.71 },
  magma_beetle: { offsetY: 0, scale: 0.74 },
  ash_moth: { offsetY: 0, scale: 0.83 },
  brood_mother: { offsetY: 0, scale: 0.56 },
};

export const EnemySprite: React.FC<{
  type: EnemyType;
  size?: number;
  animated?: boolean;
  region?: MapTheme;
}> = ({ type, size = 40, animated = false, region }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasSize = Math.ceil(size * SPRITE_PAD);

  const renderEnemy = useCallback(
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

      const eData = ENEMY_DATA[type];
      if (!eData) {
        return;
      }

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
        drawEnemySprite(
          ctx,
          0,
          0,
          gameSize * zoom,
          type,
          eData.color,
          0,
          t,
          !!eData.flying,
          zoom,
          0,
          region
        );
      } catch {
        // Silently handle rendering errors at very small sprite sizes
      }
      ctx.restore();
    },
    [type, size, canvasSize, animated, region]
  );

  useSpriteTicker(animated, 50, renderEnemy);

  return (
    <canvas
      ref={canvasRef}
      style={{ height: canvasSize, width: canvasSize }}
      aria-label={`${ENEMY_DATA[type]?.name ?? type} sprite`}
    />
  );
};
