import type { Dispatch, SetStateAction } from "react";

import { getReinforcementSpellStats } from "../../constants";
import type { Troop } from "../../types";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function syncReinforcementTroops(
  reinforcementLevel: number,
  setTroops: Setter<Troop[]>
): void {
  const reinforcementStats = getReinforcementSpellStats(reinforcementLevel);
  setTroops((prev) => {
    let changed = false;
    const next = prev.map((troop) => {
      if (!troop.ownerId.startsWith("spell") || troop.type !== "knight") {
        return troop;
      }
      const hpPercent = troop.maxHp > 0 ? troop.hp / troop.maxHp : 1;
      const nextMaxHp = reinforcementStats.knightHp;
      const nextHp = Math.max(
        1,
        Math.min(nextMaxHp, Math.round(nextMaxHp * hpPercent))
      );
      const shouldUpdate =
        troop.overrideDamage !== reinforcementStats.knightDamage ||
        troop.overrideAttackSpeed !== reinforcementStats.knightAttackSpeedMs ||
        troop.overrideIsRanged !== reinforcementStats.rangedUnlocked ||
        (troop.overrideRange ?? 0) !==
          (reinforcementStats.rangedUnlocked
            ? reinforcementStats.rangedRange
            : 0) ||
        troop.overrideCanTargetFlying !== reinforcementStats.rangedUnlocked ||
        troop.overrideHybridMelee !== reinforcementStats.rangedUnlocked ||
        troop.visualTier !== reinforcementStats.visualTier ||
        troop.maxHp !== nextMaxHp ||
        troop.moveRadius !== reinforcementStats.moveRadius;

      if (!shouldUpdate) {
        return troop;
      }
      changed = true;
      return {
        ...troop,
        hp: nextHp,
        maxHp: nextMaxHp,
        moveRadius: reinforcementStats.moveRadius,
        overrideAttackSpeed: reinforcementStats.knightAttackSpeedMs,
        overrideCanTargetFlying: reinforcementStats.rangedUnlocked,
        overrideDamage: reinforcementStats.knightDamage,
        overrideHybridMelee: reinforcementStats.rangedUnlocked,
        overrideIsRanged: reinforcementStats.rangedUnlocked,
        overrideRange: reinforcementStats.rangedUnlocked
          ? reinforcementStats.rangedRange
          : undefined,
        visualTier: reinforcementStats.visualTier,
      };
    });
    return changed ? next : prev;
  });
}
