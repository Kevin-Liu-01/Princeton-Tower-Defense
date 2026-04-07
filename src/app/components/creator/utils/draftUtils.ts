import type {
  CustomLevelDefinition,
  CustomSpecialTowerConfig,
  CustomPlacedTowerConfig,
} from "../../../customLevels/types";
import type { WaveGroup } from "../../../types";
import { ENEMY_OPTIONS } from "../constants";
import type { CreatorDraftState, GridPoint } from "../types";

export const createDefaultWaveGroup = (): WaveGroup => ({
  count: 10,
  interval: 600,
  type: ENEMY_OPTIONS[0] ?? "frosh",
});

export const createDefaultPresetWaves = (): WaveGroup[][] => [
  [createDefaultWaveGroup()],
];

export const createEmptyDraft = (): CreatorDraftState => ({
  allowedTowers: [],
  customWaves: [],
  decorations: [],
  description: "",
  difficulty: 1,
  hazards: [],
  heroSpawn: null,
  name: "",
  placedTowers: [],
  primaryPath: [],
  secondaryPath: [],
  slug: "",
  specialTowers: [],
  startingPawPoints: 450,
  theme: "grassland",
  waveTemplate: "default",
});

const migrateSpecialTowers = (
  level: CustomLevelDefinition
): CustomSpecialTowerConfig[] => {
  if (level.specialTowers && level.specialTowers.length > 0) {
    return level.specialTowers.map((st) => ({ ...st, pos: { ...st.pos } }));
  }
  if (level.specialTower) {
    return [{ ...level.specialTower, pos: { ...level.specialTower.pos } }];
  }
  return [];
};

export const levelToDraft = (
  level: CustomLevelDefinition
): CreatorDraftState => ({
  allowedTowers: [...(level.allowedTowers ?? [])],
  customWaves:
    level.customWaves?.map((wave) => wave.map((group) => ({ ...group }))) ?? [],
  decorations: level.decorations.map((deco) => ({
    ...deco,
    pos: { ...deco.pos },
  })),
  description: level.description,
  difficulty: level.difficulty,
  hazards: level.hazards.map((hazard) => ({ ...hazard })),
  heroSpawn: level.heroSpawn ?? null,
  id: level.id,
  name: level.name,
  placedTowers: (level.placedTowers ?? []).map((t) => ({
    ...t,
    pos: { ...t.pos },
  })),
  primaryPath: [...level.primaryPath],
  secondaryPath: [...(level.secondaryPath ?? [])],
  slug: level.slug,
  specialTowers: migrateSpecialTowers(level),
  startingPawPoints: level.startingPawPoints,
  theme: level.theme,
  waveTemplate: level.waveTemplate,
});

export const cloneDraftState = (
  draft: CreatorDraftState
): CreatorDraftState => ({
  ...draft,
  allowedTowers: [...draft.allowedTowers],
  customWaves: draft.customWaves.map((wave) =>
    wave.map((group) => ({ ...group }))
  ),
  decorations: draft.decorations.map((deco) => ({
    ...deco,
    pos: { ...deco.pos },
  })),
  hazards: draft.hazards.map((hazard) => ({
    ...hazard,
    gridPos: hazard.gridPos ? { ...hazard.gridPos } : hazard.gridPos,
    pos: hazard.pos ? { ...(hazard.pos as GridPoint) } : hazard.pos,
  })),
  heroSpawn: draft.heroSpawn ? { ...draft.heroSpawn } : null,
  placedTowers: draft.placedTowers.map((t) => ({ ...t, pos: { ...t.pos } })),
  primaryPath: draft.primaryPath.map((point) => ({ ...point })),
  secondaryPath: draft.secondaryPath.map((point) => ({ ...point })),
  specialTowers: draft.specialTowers.map((st) => ({
    ...st,
    pos: { ...st.pos },
  })),
});

export const validateDraft = (draft: CreatorDraftState): string[] => {
  const errors: string[] = [];
  if (!draft.name.trim()) {
    errors.push("Map name is required.");
  }
  if (draft.primaryPath.length < 4) {
    errors.push("Primary path needs at least 4 nodes.");
  }
  if (draft.secondaryPath.length > 0 && draft.secondaryPath.length < 4) {
    errors.push("Secondary path needs at least 4 nodes when enabled.");
  }
  if (!draft.heroSpawn) {
    errors.push("Hero spawn is required.");
  }
  return errors;
};
