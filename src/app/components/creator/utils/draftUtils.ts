import type { WaveGroup } from "../../../types";
import type {
  CustomLevelDefinition,
  CustomSpecialTowerConfig,
  CustomPlacedTowerConfig,
} from "../../../customLevels/types";
import type { CreatorDraftState, GridPoint } from "../types";
import { ENEMY_OPTIONS } from "../constants";

export const createDefaultWaveGroup = (): WaveGroup => ({
  type: ENEMY_OPTIONS[0] ?? "frosh",
  count: 10,
  interval: 600,
});

export const createDefaultPresetWaves = (): WaveGroup[][] => [[createDefaultWaveGroup()]];

export const createEmptyDraft = (): CreatorDraftState => ({
  slug: "",
  name: "",
  description: "",
  theme: "grassland",
  difficulty: 1,
  startingPawPoints: 450,
  waveTemplate: "default",
  customWaves: [],
  primaryPath: [],
  secondaryPath: [],
  heroSpawn: null,
  specialTowers: [],
  placedTowers: [],
  allowedTowers: [],
  decorations: [],
  hazards: [],
});

const migrateSpecialTowers = (level: CustomLevelDefinition): CustomSpecialTowerConfig[] => {
  if (level.specialTowers && level.specialTowers.length > 0) {
    return level.specialTowers.map((st) => ({ ...st, pos: { ...st.pos } }));
  }
  if (level.specialTower) {
    return [{ ...level.specialTower, pos: { ...level.specialTower.pos } }];
  }
  return [];
};

export const levelToDraft = (level: CustomLevelDefinition): CreatorDraftState => ({
  id: level.id,
  slug: level.slug,
  name: level.name,
  description: level.description,
  theme: level.theme,
  difficulty: level.difficulty,
  startingPawPoints: level.startingPawPoints,
  waveTemplate: level.waveTemplate,
  customWaves:
    level.customWaves?.map((wave) => wave.map((group) => ({ ...group }))) ?? [],
  primaryPath: [...level.primaryPath],
  secondaryPath: [...(level.secondaryPath ?? [])],
  heroSpawn: level.heroSpawn ?? null,
  specialTowers: migrateSpecialTowers(level),
  placedTowers: (level.placedTowers ?? []).map((t) => ({ ...t, pos: { ...t.pos } })),
  allowedTowers: [...(level.allowedTowers ?? [])],
  decorations: level.decorations.map((deco) => ({ ...deco, pos: { ...deco.pos } })),
  hazards: level.hazards.map((hazard) => ({ ...hazard })),
});

export const cloneDraftState = (draft: CreatorDraftState): CreatorDraftState => ({
  ...draft,
  customWaves: draft.customWaves.map((wave) => wave.map((group) => ({ ...group }))),
  primaryPath: draft.primaryPath.map((point) => ({ ...point })),
  secondaryPath: draft.secondaryPath.map((point) => ({ ...point })),
  heroSpawn: draft.heroSpawn ? { ...draft.heroSpawn } : null,
  specialTowers: draft.specialTowers.map((st) => ({ ...st, pos: { ...st.pos } })),
  placedTowers: draft.placedTowers.map((t) => ({ ...t, pos: { ...t.pos } })),
  allowedTowers: [...draft.allowedTowers],
  decorations: draft.decorations.map((deco) => ({
    ...deco,
    pos: { ...deco.pos },
  })),
  hazards: draft.hazards.map((hazard) => ({
    ...hazard,
    pos: hazard.pos ? { ...(hazard.pos as GridPoint) } : hazard.pos,
    gridPos: hazard.gridPos ? { ...hazard.gridPos } : hazard.gridPos,
  })),
});

export const validateDraft = (draft: CreatorDraftState): string[] => {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("Map name is required.");
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
