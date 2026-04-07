import type { Dispatch, SetStateAction } from "react";

import {
  DEFAULT_SPELL_UPGRADES,
  MAX_SPELL_UPGRADE_LEVEL,
  normalizeSpellUpgradeLevels,
  getNextSpellUpgradeCost,
  getSpentSpellUpgradeStars,
} from "../../constants";
import type { SpellType } from "../../types";
import type { GameProgress } from "../useLocalStorage";

type Setter<T> = Dispatch<SetStateAction<T>>;

export function upgradeSpellImpl(
  spellType: SpellType,
  setProgress: Setter<GameProgress>
): void {
  setProgress((prev) => {
    const normalizedUpgrades = normalizeSpellUpgradeLevels(
      prev.spellUpgrades ?? DEFAULT_SPELL_UPGRADES
    );
    const currentLevel = normalizedUpgrades[spellType] ?? 0;
    if (currentLevel >= MAX_SPELL_UPGRADE_LEVEL) {
      return prev;
    }

    const nextUpgradeCost = getNextSpellUpgradeCost(spellType, currentLevel);
    if (nextUpgradeCost <= 0) {
      return prev;
    }

    const totalEarned =
      prev.totalStarsEarned ??
      Object.values(prev.levelStars || {}).reduce(
        (sum, stars) => sum + (Number.isFinite(stars) ? stars : 0),
        0
      );
    const spent = getSpentSpellUpgradeStars(normalizedUpgrades);
    const available = Math.max(0, totalEarned - spent);
    if (available < nextUpgradeCost) {
      return prev;
    }

    return {
      ...prev,
      spellUpgrades: {
        ...normalizedUpgrades,
        [spellType]: currentLevel + 1,
      },
    };
  });
}

export function downgradeSpellImpl(
  spellType: SpellType,
  setProgress: Setter<GameProgress>
): void {
  setProgress((prev) => {
    const normalizedUpgrades = normalizeSpellUpgradeLevels(
      prev.spellUpgrades ?? DEFAULT_SPELL_UPGRADES
    );
    const currentLevel = normalizedUpgrades[spellType] ?? 0;
    if (currentLevel <= 0) {
      return prev;
    }

    return {
      ...prev,
      spellUpgrades: {
        ...normalizedUpgrades,
        [spellType]: currentLevel - 1,
      },
    };
  });
}
