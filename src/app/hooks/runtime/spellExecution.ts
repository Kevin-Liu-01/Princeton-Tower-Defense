import {
  SPELL_DATA,
  getFireballSpellStats,
  getLightningSpellStats,
  getFreezeSpellStats,
  getHexWardSpellStats,
  getPaydaySpellStats,
} from "../../constants";
import { getEnemyPosWithPath } from "../../game/setup";
import { getEnemyDamageTaken } from "../../game/status";
import { emitDamageNumber } from "../../rendering/ui/damageNumbers";
import type {
  Position,
  Enemy,
  Spell,
  Effect,
  SpellType,
  SpellUpgradeLevels,
  ParticleType,
  DeathCause,
} from "../../types";
import { distance, generateId, getEnemyRemainingDistance } from "../../utils";
import type { GameEventLogAPI } from "../useGameEventLog";
import { isDefined } from "./runtimeConfig";

// ---------------------------------------------------------------------------
// Params interface – everything both impl functions need from the hook scope
// ---------------------------------------------------------------------------

export interface SpellExecutionParams {
  // Current state
  spells: Spell[];
  enemies: Enemy[];
  selectedMap: string;
  gameSpeed: number;
  targetingSpell: SpellType | null;
  placingTroop: boolean;
  spellUpgradeLevels: SpellUpgradeLevels;
  spellAutoAim: Partial<Record<SpellType, boolean>>;

  // State setters
  setSpells: React.Dispatch<React.SetStateAction<Spell[]>>;
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  setEffects: React.Dispatch<React.SetStateAction<Effect[]>>;
  setTargetingSpell: React.Dispatch<React.SetStateAction<SpellType | null>>;
  setPlacingTroop: React.Dispatch<React.SetStateAction<boolean>>;
  setGoldSpellActive: React.Dispatch<React.SetStateAction<boolean>>;
  setPaydayPawPointsEarned: React.Dispatch<React.SetStateAction<number>>;
  setPaydayEndTime: React.Dispatch<React.SetStateAction<number | null>>;
  setHexWardEndTime: React.Dispatch<React.SetStateAction<number | null>>;
  setHexWardTargetCount: React.Dispatch<React.SetStateAction<number>>;
  setHexWardRaiseCap: React.Dispatch<React.SetStateAction<number>>;
  setHexWardRaisesRemaining: React.Dispatch<React.SetStateAction<number>>;
  setHexWardDamageAmpPct: React.Dispatch<React.SetStateAction<number>>;
  setHexWardBlocksHealing: React.Dispatch<React.SetStateAction<boolean>>;

  // Refs
  hexWardRaisesRemainingRef: React.MutableRefObject<number>;
  executeTargetedSpellRef: React.MutableRefObject<
    (spellType: SpellType, pos: Position) => void
  >;
  gameEventLogRef: React.MutableRefObject<GameEventLogAPI>;

  // Callbacks
  canAffordPawPoints: (amount: number) => boolean;
  spendPawPoints: (amount: number) => boolean;
  addPawPoints: (amount: number) => void;
  addParticles: (pos: Position, type: ParticleType, count: number) => void;
  onEnemyKill: (
    enemy: Enemy,
    pos: Position,
    particleCount?: number,
    deathCause?: DeathCause
  ) => void;
}

// ---------------------------------------------------------------------------
// castSpellImpl – spell activation / validation / routing
// ---------------------------------------------------------------------------

export function castSpellImpl(
  p: SpellExecutionParams,
  spellType: SpellType
): void {
  if (p.gameSpeed === 0) {
    return;
  }

  if (p.targetingSpell === spellType) {
    p.setTargetingSpell(null);
    const refundCost = SPELL_DATA[spellType]?.cost ?? 0;
    if (refundCost > 0) {
      p.addPawPoints(refundCost);
    }
    return;
  }
  if (p.placingTroop && spellType === "reinforcements") {
    p.setPlacingTroop(false);
    const refundCost = SPELL_DATA["reinforcements"]?.cost ?? 0;
    if (refundCost > 0) {
      p.addPawPoints(refundCost);
    }
    return;
  }
  if (p.targetingSpell) {
    const prevCost = SPELL_DATA[p.targetingSpell]?.cost ?? 0;
    if (prevCost > 0) {
      p.addPawPoints(prevCost);
    }
    p.setTargetingSpell(null);
  }
  if (p.placingTroop) {
    const prevCost = SPELL_DATA["reinforcements"]?.cost ?? 0;
    if (prevCost > 0) {
      p.addPawPoints(prevCost);
    }
    p.setPlacingTroop(false);
  }

  const spell = p.spells.find((s) => s.type === spellType);
  if (!spell || spell.cooldown > 0) {
    return;
  }
  const cost = SPELL_DATA[spellType]?.cost ?? 0;
  if (!p.canAffordPawPoints(cost)) {
    return;
  }
  if (
    (spellType === "fireball" ||
      spellType === "lightning" ||
      spellType === "freeze") &&
    p.enemies.length === 0
  ) {
    return;
  }
  if (!p.spendPawPoints(cost)) {
    return;
  }
  p.gameEventLogRef.current.log(
    "spell_cast",
    `Cast ${SPELL_DATA[spellType]?.name || spellType} for ${cost} PP`,
    { cost, spellType }
  );

  let enteredTargeting = false;
  switch (spellType) {
    case "fireball":
    case "lightning": {
      const level = p.spellUpgradeLevels[spellType] ?? 0;
      const useManualTarget = level >= 2 && !p.spellAutoAim[spellType];
      if (useManualTarget) {
        p.setTargetingSpell(spellType);
        enteredTargeting = true;
      } else {
        const leadEnemy = p.enemies.reduce((best, e) => {
          const eDist = getEnemyRemainingDistance(e, p.selectedMap);
          const bestDist = getEnemyRemainingDistance(best, p.selectedMap);
          return eDist < bestDist ? e : best;
        });
        const targetPos = getEnemyPosWithPath(leadEnemy, p.selectedMap);
        p.executeTargetedSpellRef.current(spellType, targetPos);
      }
      break;
    }

    case "freeze": {
      const freezeStats = getFreezeSpellStats(p.spellUpgradeLevels.freeze);
      const freezeUntil = Date.now() + freezeStats.freezeDurationMs;

      const freezeTargetIds: Set<string> | null = freezeStats.isGlobal
        ? null
        : new Set(
            [...p.enemies]
              .toSorted(
                (a, b) =>
                  getEnemyRemainingDistance(a, p.selectedMap) -
                  getEnemyRemainingDistance(b, p.selectedMap)
              )
              .slice(0, freezeStats.maxTargets)
              .map((e) => e.id)
          );

      p.setEnemies((prev) =>
        prev.map((e) => {
          if (freezeTargetIds && !freezeTargetIds.has(e.id)) {
            return e;
          }
          return { ...e, frozen: true, stunUntil: freezeUntil };
        })
      );

      if (p.enemies.length > 0) {
        const centerEnemy = p.enemies[Math.floor(p.enemies.length / 2)];
        const centerPos = getEnemyPosWithPath(centerEnemy, p.selectedMap);
        p.setEffects((ef) => [
          ...ef,
          {
            id: generateId("freeze_wave"),
            pos: centerPos,
            progress: 0,
            size: 400,
            type: "freeze_wave",
          },
        ]);
      }

      const particleEnemies = freezeTargetIds
        ? p.enemies.filter((e) => freezeTargetIds.has(e.id))
        : p.enemies;
      particleEnemies.forEach((e) => {
        const pos = getEnemyPosWithPath(e, p.selectedMap);
        p.addParticles(pos, "ice", 8);
      });
      break;
    }

    case "hex_ward": {
      if (p.enemies.length === 0) {
        return;
      }

      const hexStats = getHexWardSpellStats(p.spellUpgradeLevels.hex_ward);
      const hexUntil = Date.now() + hexStats.durationMs;
      const targetEnemies = [...p.enemies]
        .toSorted(
          (a, b) =>
            getEnemyRemainingDistance(a, p.selectedMap) -
            getEnemyRemainingDistance(b, p.selectedMap)
        )
        .slice(0, hexStats.maxTargets);

      if (targetEnemies.length === 0) {
        return;
      }

      const targetIds = new Set(targetEnemies.map((enemy) => enemy.id));
      const centerPos =
        targetEnemies.length === 1
          ? getEnemyPosWithPath(targetEnemies[0], p.selectedMap)
          : {
              x:
                targetEnemies.reduce(
                  (sum, enemy) =>
                    sum + getEnemyPosWithPath(enemy, p.selectedMap).x,
                  0
                ) / targetEnemies.length,
              y:
                targetEnemies.reduce(
                  (sum, enemy) =>
                    sum + getEnemyPosWithPath(enemy, p.selectedMap).y,
                  0
                ) / targetEnemies.length,
            };

      p.setEnemies((prev) =>
        prev.map((enemy) =>
          targetIds.has(enemy.id)
            ? {
                ...enemy,
                hexWard: true,
                hexWardBlocksHealing: hexStats.blocksHealing,
                hexWardDamageAmp: hexStats.damageAmp,
                hexWardUntil: hexUntil,
              }
            : enemy
        )
      );

      p.hexWardRaisesRemainingRef.current = hexStats.maxReanimations;
      p.setHexWardEndTime(hexUntil);
      p.setHexWardTargetCount(targetEnemies.length);
      p.setHexWardRaiseCap(hexStats.maxReanimations);
      p.setHexWardRaisesRemaining(hexStats.maxReanimations);
      p.setHexWardDamageAmpPct(Math.round(hexStats.damageAmp * 100));
      p.setHexWardBlocksHealing(hexStats.blocksHealing);

      p.setEffects((ef) => [
        ...ef,
        {
          duration: hexStats.durationMs,
          id: generateId("hex_ward_aura"),
          pos: centerPos,
          progress: 0,
          size: 220,
          type: "hex_ward_aura",
        },
      ]);

      targetEnemies.forEach((enemy) => {
        const pos = getEnemyPosWithPath(enemy, p.selectedMap);
        p.addParticles(pos, "magic", 14);
      });
      break;
    }

    case "payday": {
      const paydayStats = getPaydaySpellStats(p.spellUpgradeLevels.payday);
      const { bonusPerEnemy } = paydayStats;
      const { basePayout } = paydayStats;
      const enemyBonus = Math.min(
        p.enemies.length * bonusPerEnemy,
        paydayStats.maxBonus
      );
      const totalPayout = basePayout + enemyBonus;

      p.addPawPoints(totalPayout);

      p.setPaydayPawPointsEarned(totalPayout);
      p.setPaydayEndTime(Date.now() + paydayStats.auraDurationMs);

      p.setEnemies((prev) => prev.map((e) => ({ ...e, goldAura: true })));
      p.setGoldSpellActive(true);

      p.setEffects((ef) => [
        ...ef,
        {
          duration: paydayStats.auraDurationMs,
          enemies: p.enemies.map((e) => e.id),
          id: generateId("payday_aura"),
          pos: { x: 0, y: 0 },
          progress: 0,
          size: 0,
          type: "payday_aura",
        },
      ]);

      p.enemies.forEach((e) => {
        const pos = getEnemyPosWithPath(e, p.selectedMap);
        p.addParticles(pos, "gold", 12);
      });

      setTimeout(() => {
        p.setEnemies((prev) => prev.map((e) => ({ ...e, goldAura: false })));
        p.setGoldSpellActive(false);
        p.setPaydayEndTime(null);
      }, paydayStats.auraDurationMs);
      break;
    }

    case "reinforcements": {
      p.setPlacingTroop(true);
      enteredTargeting = true;
      break;
    }
  }
  if (!enteredTargeting) {
    p.setSpells((prev) =>
      prev.map((s) =>
        s.type === spellType ? { ...s, cooldown: s.maxCooldown } : s
      )
    );
  }
}

// ---------------------------------------------------------------------------
// executeTargetedSpellImpl – execute fireball / lightning at a world position
// ---------------------------------------------------------------------------

export function executeTargetedSpellImpl(
  p: SpellExecutionParams,
  spellType: SpellType,
  centerWorldPos: Position
): void {
  if (spellType === "fireball") {
    const fireballStats = getFireballSpellStats(p.spellUpgradeLevels.fireball);
    const { meteorCount } = fireballStats;
    const { damagePerMeteor } = fireballStats;
    const { impactRadius } = fireballStats;
    const burnDuration = fireballStats.burnDurationMs;
    const burnDamage = fireballStats.burnDamagePerSecond;
    const fallDuration = fireballStats.fallDurationMs;

    const meteorTargets: Position[] = [];
    for (let i = 0; i < meteorCount; i++) {
      const offsetX = (Math.random() - 0.5) * 300;
      const offsetY = (Math.random() - 0.5) * 150;
      meteorTargets.push({
        x: centerWorldPos.x + offsetX,
        y: centerWorldPos.y + offsetY,
      });
    }

    meteorTargets.forEach((targetPos, index) => {
      const staggerDelay = index * 180;

      setTimeout(() => {
        p.setEffects((ef) => [
          ...ef,
          {
            duration: fallDuration,
            id: generateId("meteor_falling"),
            meteorIndex: index,
            pos: { x: targetPos.x + 700, y: targetPos.y - 2800 },
            progress: 0,
            size: 90,
            targetPos,
            type: "meteor_falling",
          },
        ]);

        setTimeout(() => {
          const now = Date.now();
          p.setEnemies((prev) =>
            prev
              .map((e) => {
                const pos = getEnemyPosWithPath(e, p.selectedMap);
                const dist = distance(pos, targetPos);
                if (dist < impactRadius) {
                  const damageMultiplier = 1 - (dist / impactRadius) * 0.5;
                  const damage = Math.floor(damagePerMeteor * damageMultiplier);
                  const actualDmg = getEnemyDamageTaken(e, damage, "fire");
                  emitDamageNumber(pos, actualDmg, "spell");
                  const newHp = e.hp - actualDmg;
                  if (newHp <= 0) {
                    p.onEnemyKill(e, pos, 20, "fire");
                    p.addParticles(pos, "fire", 15);
                    return null;
                  }
                  return {
                    ...e,
                    burnDamage,
                    burnUntil: now + burnDuration,
                    burning: true,
                    damageFlash: 300,
                    hp: newHp,
                  };
                }
                return e;
              })
              .filter(isDefined)
          );

          p.setEffects((ef) => [
            ...ef,
            {
              id: generateId("meteor_impact"),
              pos: targetPos,
              progress: 0,
              size: impactRadius * 1.5,
              type: "meteor_impact",
            },
            {
              duration: 3000,
              id: generateId("fire_scorch"),
              pos: targetPos,
              progress: 0,
              size: impactRadius * 1.2,
              type: "fire_scorch",
            },
          ]);
          p.addParticles(targetPos, "explosion", 40);
          p.addParticles(targetPos, "fire", 35);
          p.addParticles(targetPos, "smoke", 25);
        }, fallDuration);
      }, staggerDelay);
    });
  } else if (spellType === "lightning") {
    const lightningStats = getLightningSpellStats(
      p.spellUpgradeLevels.lightning
    );
    const { totalDamage } = lightningStats;
    const targetCount = Math.min(lightningStats.chainCount, p.enemies.length);
    const damagePerTarget =
      targetCount > 0 ? Math.floor(totalDamage / targetCount) : 0;

    const sorted = [...p.enemies]
      .map((e) => ({
        dist: distance(getEnemyPosWithPath(e, p.selectedMap), centerWorldPos),
        enemy: e,
      }))
      .toSorted((a, b) => a.dist - b.dist);
    const targets = sorted.slice(0, targetCount).map((s) => s.enemy);

    targets.forEach((target, index) => {
      setTimeout(() => {
        const targetPos = getEnemyPosWithPath(target, p.selectedMap);

        p.setEffects((ef) => [
          ...ef,
          {
            id: generateId("lightning_bolt"),
            pos: { x: targetPos.x, y: targetPos.y - 700 },
            progress: 0,
            size: 120,
            strikeIndex: index,
            targetPos,
            type: "lightning_bolt",
          },
          {
            duration: 2500,
            id: generateId("lightning_scorch"),
            pos: targetPos,
            progress: 0,
            size: 80,
            type: "lightning_scorch",
          },
        ]);

        p.setEnemies((prev) =>
          prev
            .map((e) => {
              if (e.id === target.id) {
                const actualDmg = getEnemyDamageTaken(e, damagePerTarget);
                emitDamageNumber(targetPos, actualDmg, "spell");
                const newHp = e.hp - actualDmg;
                if (newHp <= 0) {
                  p.onEnemyKill(e, targetPos, 12, "lightning");
                  p.addParticles(targetPos, "spark", 25);
                  p.addParticles(targetPos, "glow", 15);
                  return null;
                }
                return {
                  ...e,
                  damageFlash: 250,
                  hp: newHp,
                  stunUntil: Date.now() + lightningStats.stunDurationMs,
                };
              }
              return e;
            })
            .filter(isDefined)
        );
        p.addParticles(targetPos, "spark", 20);
      }, index * 200);
    });
  }
}
