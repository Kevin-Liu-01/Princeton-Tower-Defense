import type { Dispatch, SetStateAction, MutableRefObject } from "react";
import type { Hero, HeroType, SpellType, SpecialTowerType, HazardType } from "../../types";
import { LEVEL_DATA, HERO_DATA } from "../../constants";
import { getLevelSpecialTowers } from "../../game/setup";
import type { EncounterQueueItem, UseTutorialReturn } from "../useTutorial";

export const ENCOUNTER_AUTO_DISMISS_MS = 8000;
export const ENCOUNTER_EXIT_DURATION_MS = 300;

type Setter<T> = Dispatch<SetStateAction<T>>;

export function queueLevelEncountersImpl(
  mapKey: string,
  tutorial: Pick<UseTutorialReturn, "getLevelEncounters">,
  setEncounterExiting: Setter<boolean>,
  setEncounterQueue: Setter<EncounterQueueItem[]>,
  setEncounterIndex: Setter<number>,
): void {
  const levelData = LEVEL_DATA[mapKey];
  const specialTowerTypes = (getLevelSpecialTowers(mapKey) ?? []).map((t) => t.type);
  const hazardTypes = (levelData?.hazards ?? []).map((h) => h.type);
  const levelEncounters = tutorial.getLevelEncounters(specialTowerTypes, hazardTypes);
  if (levelEncounters.length > 0) {
    setEncounterExiting(false);
    setEncounterQueue(levelEncounters);
    setEncounterIndex(0);
  }
}

export function handleTutorialHeroChangeImpl(
  heroType: HeroType,
  setSelectedHero: (v: HeroType) => void,
  setHero: Setter<Hero | null>,
): void {
  setSelectedHero(heroType);
  const heroData = HERO_DATA[heroType];
  setHero((prev) => {
    if (!prev) return prev;
    return {
      ...prev,
      type: heroType,
      hp: heroData.hp,
      maxHp: heroData.hp,
      abilityReady: true,
      abilityCooldown: 0,
    };
  });
}

export function handleTutorialSpellToggleImpl(
  spellType: SpellType,
  setSelectedSpells: Setter<SpellType[]>,
): void {
  setSelectedSpells((prev) => {
    const isEquipped = prev.includes(spellType);
    if (isEquipped) return prev.filter((s) => s !== spellType);
    if (prev.length >= 3) return prev;
    return [...prev, spellType];
  });
}

export function handleEncounterAcknowledgeImpl(
  encounterQueueRef: MutableRefObject<EncounterQueueItem[]>,
  encounterIndexRef: MutableRefObject<number>,
  tutorialRef: MutableRefObject<Pick<UseTutorialReturn, "markLevelEncountersSeen">>,
  setEncounterExiting: Setter<boolean>,
  setEncounterIndex: Setter<number>,
): void {
  const queue = encounterQueueRef.current;
  const idx = encounterIndexRef.current;
  const nextIndex = idx + 1;
  if (nextIndex >= queue.length) {
    const specialTowerKeys = queue
      .filter((e) => e.category === "special_tower")
      .map((e) => e.key.replace("special-tower-", ""));
    const hazardKeys = queue
      .filter((e) => e.category === "hazard")
      .map((e) => e.key.replace("hazard-", ""));
    if (specialTowerKeys.length > 0 || hazardKeys.length > 0) {
      tutorialRef.current.markLevelEncountersSeen(
        specialTowerKeys as SpecialTowerType[],
        hazardKeys as HazardType[],
      );
    }
    setEncounterExiting(true);
  } else {
    setEncounterIndex(nextIndex);
  }
}

export function startWithRandomLoadoutImpl(
  selectedHero: HeroType | null,
  selectedSpells: SpellType[],
  setSelectedHero: (v: HeroType) => void,
  setSelectedSpells: Setter<SpellType[]>,
  pendingStartWithRandomRef: MutableRefObject<boolean>,
  heroOptions: readonly HeroType[],
  spellOptions: readonly SpellType[],
): void {
  if (!selectedHero) {
    const hero = heroOptions[Math.floor(Math.random() * heroOptions.length)];
    setSelectedHero(hero);
  }
  if (selectedSpells.length < 3) {
    const remaining = spellOptions.filter((s) => !selectedSpells.includes(s));
    const shuffled = remaining.sort(() => Math.random() - 0.5);
    setSelectedSpells([...selectedSpells, ...shuffled.slice(0, 3 - selectedSpells.length)]);
  }
  pendingStartWithRandomRef.current = true;
}
