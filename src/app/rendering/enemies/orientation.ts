import type { EnemyType } from "../../types";

export type HorizontalFacing = "left" | "right";

/**
 * Enemy construction contract: sprite renderers face left unless registered
 * here. Keeping native art direction separate from gameplay direction avoids
 * scattered double-mirror exceptions in the scene renderer.
 */
const ENEMY_NATIVE_FACING: Partial<Record<EnemyType, HorizontalFacing>> = {
  catapult: "right",
  crossbowman: "right",
  dire_wolf: "right",
  mammoth: "right",
  salamander: "right",
  timber_wolf: "right",
  vine_serpent: "right",
  volcanic_drake: "right",
};

const DEFAULT_ENEMY_NATIVE_FACING: HorizontalFacing = "left";
const ATTACK_EFFECT_NATIVE_FACING: HorizontalFacing = "left";

const getHorizontalFacingScale = (
  nativeFacing: HorizontalFacing,
  facingRight: boolean
): 1 | -1 => {
  const desiredFacing: HorizontalFacing = facingRight ? "right" : "left";
  return nativeFacing === desiredFacing ? 1 : -1;
};

export const getEnemySpriteFacingScale = (
  enemyType: EnemyType,
  facingRight: boolean
): 1 | -1 =>
  getHorizontalFacingScale(
    ENEMY_NATIVE_FACING[enemyType] ?? DEFAULT_ENEMY_NATIVE_FACING,
    facingRight
  );

export const getEnemyAttackEffectFacingScale = (facingRight: boolean): 1 | -1 =>
  getHorizontalFacingScale(ATTACK_EFFECT_NATIVE_FACING, facingRight);
