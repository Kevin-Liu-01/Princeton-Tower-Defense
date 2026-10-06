import type { EnemyData, EnemyType, MapTheme, WaveGroup } from "../types";
import { ENEMY_DATA, getEnemyNativeRegion } from "./enemies";

const LEVEL_THEMES: Readonly<Record<string, MapTheme>> = {
  ashen_spiral: "volcanic",
  blight_basin: "swamp",
  bog: "swamp",
  cannon_crest: "grassland",
  carnegie: "grassland",
  crater: "volcanic",
  fortress: "winter",
  frist_outpost: "winter",
  glacier: "winter",
  infernal_gate: "volcanic",
  ivy_crossroads: "grassland",
  lava: "volcanic",
  mirage_dunes: "desert",
  nassau: "grassland",
  oasis: "desert",
  peak: "winter",
  poe: "grassland",
  pyramid: "desert",
  sphinx: "desert",
  sun_obelisk: "desert",
  sunken_temple: "swamp",
  sunscorch_labyrinth: "desert",
  throne: "volcanic",
  triad_keep: "swamp",
  whiteout_pass: "winter",
  witch_hut: "swamp",
};

const BOSS_THREAT_MULTIPLIER = 1.2;
const FLYING_THREAT_MULTIPLIER = 1.12;
const RANGED_THREAT_MULTIPLIER = 1.08;
const TRAIT_THREAT_MULTIPLIER = 0.045;
const SPEED_BASELINE = 0.25;
const SPEED_THREAT_WEIGHT = 0.55;

export const getEnemyThreatScore = (enemy: EnemyData): number => {
  const armorMultiplier = 1 / Math.max(0.2, 1 - enemy.armor);
  const speedMultiplier = Math.max(
    0.8,
    1 + (enemy.speed - SPEED_BASELINE) * SPEED_THREAT_WEIGHT
  );
  const traitMultiplier =
    1 + (enemy.traits?.length ?? 0) * TRAIT_THREAT_MULTIPLIER;

  return (
    enemy.hp *
    armorMultiplier *
    speedMultiplier *
    traitMultiplier *
    (enemy.flying ? FLYING_THREAT_MULTIPLIER : 1) *
    (enemy.isRanged ? RANGED_THREAT_MULTIPLIER : 1) *
    (enemy.isBoss ? BOSS_THREAT_MULTIPLIER : 1)
  );
};

export const getWaveThreatScore = (wave: readonly WaveGroup[]): number =>
  wave.reduce(
    (total, group) =>
      total + getEnemyThreatScore(ENEMY_DATA[group.type]) * group.count,
    0
  );

const hasRegionalBoss = (wave: readonly WaveGroup[]): boolean =>
  wave.some((group) => ENEMY_DATA[group.type].category === "region_boss");

const isComparableReplacement = (
  source: EnemyData,
  candidate: EnemyData
): boolean => {
  if (source.isBoss !== candidate.isBoss) {
    return false;
  }
  if (source.flying !== candidate.flying) {
    return false;
  }
  if ((source.isRanged ?? false) !== (candidate.isRanged ?? false)) {
    return false;
  }
  return true;
};

const getRegionalPool = (theme: MapTheme): EnemyType[] =>
  (Object.entries(ENEMY_DATA) as [EnemyType, EnemyData][])
    .filter(([enemyType]) => getEnemyNativeRegion(enemyType) === theme)
    .map(([enemyType]) => enemyType);

const chooseRegionalReplacement = (
  sourceType: EnemyType,
  theme: MapTheme,
  replacementUse: ReadonlyMap<EnemyType, number>
): EnemyType => {
  const source = ENEMY_DATA[sourceType];
  const regionalPool = getRegionalPool(theme);
  const comparablePool = regionalPool.filter((candidateType) =>
    isComparableReplacement(source, ENEMY_DATA[candidateType])
  );
  const candidates = comparablePool.length > 0 ? comparablePool : regionalPool;
  const sourceThreat = getEnemyThreatScore(source);

  return candidates.reduce((bestType, candidateType) => {
    const best = ENEMY_DATA[bestType];
    const candidate = ENEMY_DATA[candidateType];
    const bestThreatDelta = Math.abs(
      Math.log(getEnemyThreatScore(best) / sourceThreat)
    );
    const candidateThreatDelta = Math.abs(
      Math.log(getEnemyThreatScore(candidate) / sourceThreat)
    );
    const bestDiversityPenalty = (replacementUse.get(bestType) ?? 0) * 0.015;
    const candidateDiversityPenalty =
      (replacementUse.get(candidateType) ?? 0) * 0.015;

    return candidateThreatDelta + candidateDiversityPenalty <
      bestThreatDelta + bestDiversityPenalty
      ? candidateType
      : bestType;
  }, candidates[0]);
};

const regionalizeLevelWaves = (
  waves: readonly WaveGroup[][],
  theme: MapTheme
): WaveGroup[][] => {
  const replacementUse = new Map<EnemyType, number>();

  return waves.map((wave) =>
    wave.map((group) => {
      const nativeRegion = getEnemyNativeRegion(group.type);
      if (!nativeRegion || nativeRegion === theme) {
        return { ...group };
      }

      const replacement = chooseRegionalReplacement(
        group.type,
        theme,
        replacementUse
      );
      replacementUse.set(
        replacement,
        (replacementUse.get(replacement) ?? 0) + group.count
      );
      return { ...group, type: replacement };
    })
  );
};

const sequenceWavesByThreat = (waves: readonly WaveGroup[][]): WaveGroup[][] =>
  waves
    .map((wave, authoredIndex) => ({
      authoredIndex,
      regionalBoss: hasRegionalBoss(wave),
      threat: getWaveThreatScore(wave),
      wave,
    }))
    .toSorted((left, right) => {
      if (left.regionalBoss !== right.regionalBoss) {
        return left.regionalBoss ? 1 : -1;
      }
      const threatDelta = left.threat - right.threat;
      return Math.abs(threatDelta) > 1
        ? threatDelta
        : left.authoredIndex - right.authoredIndex;
    })
    .map(({ wave }) => wave.map((group) => ({ ...group })));

/**
 * Converts the authored encounter library into campaign-ready waves.
 *
 * Regional creatures are kept in their native biome and encounters are ordered
 * by effective durability/pressure. A region's capstone boss is always the final
 * wave. Generic campus, academic, aerial, and dark-fantasy invaders remain valid
 * across regions so levels retain their authored story beats.
 */
export const prepareLevelWaves = (
  authoredWaves: Readonly<Record<string, WaveGroup[][]>>
): Record<string, WaveGroup[][]> => {
  const preparedWaves: Record<string, WaveGroup[][]> = {};

  for (const [levelId, waves] of Object.entries(authoredWaves)) {
    const theme = LEVEL_THEMES[levelId];
    if (!theme) {
      preparedWaves[levelId] = waves.map((wave) =>
        wave.map((group) => ({ ...group }))
      );
      continue;
    }
    preparedWaves[levelId] = sequenceWavesByThreat(
      regionalizeLevelWaves(waves, theme)
    );
  }

  return preparedWaves;
};

export const LEVEL_WAVE_THEMES = LEVEL_THEMES;
