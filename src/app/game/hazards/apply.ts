import type { Enemy, Hero, Troop } from "../../types";
import type { HazardEffect } from "./types";

function getUpdatedSlowState(
  currentSlow: number,
  effectSlow: number,
  slowed: boolean | undefined,
  slowUntil: number | undefined,
  slowIntensity: number | undefined,
) {
  const now = Date.now();
  const activeSlow =
    slowed && slowUntil && slowUntil > now ? (slowIntensity ?? 0) : 0;

  if (effectSlow <= 0 || effectSlow <= activeSlow) {
    return null;
  }

  return {
    slowed: true,
    slowIntensity: effectSlow,
    slowUntil: now + 500,
  };
}

export function applyHazardEffect(
  enemy: Enemy,
  effect: HazardEffect,
  baseSpeed: number,
): Enemy {
  let newHp = enemy.hp;
  let damageFlash = enemy.damageFlash;

  if (effect.poisonDamage > 0) {
    newHp = Math.max(0, newHp - effect.poisonDamage);
    damageFlash = 200;
  }
  if (effect.lavaDamage > 0) {
    newHp = Math.max(0, newHp - effect.lavaDamage);
    damageFlash = 200;
  }

  const newSlowEffect = Math.max(enemy.slowEffect, effect.environmentalSlow);
  const slowSource =
    effect.environmentalSlow > enemy.slowEffect && effect.environmentalSlowSource
      ? effect.environmentalSlowSource
      : enemy.slowSource;

  const tookDamage = newHp < enemy.hp;
  return {
    ...enemy,
    hp: newHp,
    damageFlash,
    slowEffect: newSlowEffect,
    slowSource,
    speed: baseSpeed * effect.environmentalSpeed,
    dead: newHp <= 0,
    lastDamageTaken: tookDamage ? Date.now() : enemy.lastDamageTaken,
  };
}

export function applyHazardEffectToTroop(
  troop: Troop,
  effect: HazardEffect,
): Troop {
  let newHp = troop.hp;

  if (effect.poisonDamage > 0) {
    newHp = Math.max(0, newHp - effect.poisonDamage);
  }
  if (effect.lavaDamage > 0) {
    newHp = Math.max(0, newHp - effect.lavaDamage);
  }

  const tookDamage = newHp < troop.hp;
  const now = Date.now();

  const updated: Troop = {
    ...troop,
    hp: newHp,
    dead: newHp <= 0 ? true : troop.dead,
    lastCombatTime: tookDamage ? now : troop.lastCombatTime,
    healFlash: tookDamage ? undefined : troop.healFlash,
  };

  const slowState = getUpdatedSlowState(
    troop.slowIntensity ?? 0,
    effect.environmentalSlow,
    troop.slowed,
    troop.slowUntil,
    troop.slowIntensity,
  );
  if (slowState) {
    updated.slowed = slowState.slowed;
    updated.slowIntensity = slowState.slowIntensity;
    updated.slowUntil = slowState.slowUntil;
  }

  return updated;
}

export function applyHazardEffectToHero(
  hero: Hero,
  effect: HazardEffect,
): Hero {
  let newHp = hero.hp;

  if (effect.poisonDamage > 0) {
    newHp = Math.max(0, newHp - effect.poisonDamage);
  }
  if (effect.lavaDamage > 0) {
    newHp = Math.max(0, newHp - effect.lavaDamage);
  }

  const tookDamage = newHp < hero.hp;
  const now = Date.now();

  const updated: Hero = {
    ...hero,
    hp: newHp,
    dead: newHp <= 0 ? true : hero.dead,
    lastCombatTime: tookDamage ? now : hero.lastCombatTime,
    healFlash: tookDamage ? undefined : hero.healFlash,
  };

  const slowState = getUpdatedSlowState(
    hero.slowIntensity ?? 0,
    effect.environmentalSlow,
    hero.slowed,
    hero.slowUntil,
    hero.slowIntensity,
  );
  if (slowState) {
    updated.slowed = slowState.slowed;
    updated.slowIntensity = slowState.slowIntensity;
    updated.slowUntil = slowState.slowUntil;
  }

  return updated;
}
