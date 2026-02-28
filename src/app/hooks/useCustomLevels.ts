import { useCallback, useEffect, useMemo } from "react";
import {
  ENEMY_DATA,
  GRID_HEIGHT,
  GRID_WIDTH,
  LEVEL_DATA,
  LEVEL_WAVES,
  MAP_PATHS,
} from "../constants";
import type {
  MapDecoration,
  MapHazard,
  MapTheme,
  WaveGroup,
} from "../types";
import { useLocalStorage } from "../useLocalStorage";
import type {
  CustomLevelDefinition,
  CustomLevelDraftInput,
  CustomLevelUpsertResult,
  GridPoint,
} from "../customLevels/types";

export const CUSTOM_LEVELS_STORAGE_KEY = "princeton-td-custom-levels";
export const CUSTOM_LEVEL_PREFIX = "custom_";
const DEFAULT_WAVE_TEMPLATE = "default";
const PATH_MARGIN_TILES = 4;

const registeredCustomLevelIds = new Set<string>();

const THEME_DEFAULT_CAMERA: Record<MapTheme, { x: number; y: number; zoom: number }> =
  {
    grassland: { x: -100, y: -340, zoom: 0.95 },
    swamp: { x: -120, y: -340, zoom: 0.9 },
    desert: { x: -90, y: -330, zoom: 0.9 },
    winter: { x: -130, y: -340, zoom: 0.88 },
    volcanic: { x: -110, y: -330, zoom: 0.9 },
  };

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const sanitizeSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const normalizeGridPoint = (point: GridPoint): GridPoint => ({
  x: clamp(Math.round(point.x), 0, GRID_WIDTH - 1),
  y: clamp(Math.round(point.y), 0, GRID_HEIGHT - 1),
});

const normalizePathPoint = (point: GridPoint): GridPoint => ({
  x: clamp(Math.round(point.x), -PATH_MARGIN_TILES, GRID_WIDTH - 1 + PATH_MARGIN_TILES),
  y: clamp(Math.round(point.y), -PATH_MARGIN_TILES, GRID_HEIGHT - 1 + PATH_MARGIN_TILES),
});

const normalizePath = (points: GridPoint[] | undefined): GridPoint[] => {
  if (!points || points.length === 0) return [];
  const normalized: GridPoint[] = [];
  for (const point of points) {
    const next = normalizePathPoint(point);
    const prev = normalized[normalized.length - 1];
    if (!prev || prev.x !== next.x || prev.y !== next.y) {
      normalized.push(next);
    }
  }
  return normalized;
};

const cloneWaveGroups = (waves: WaveGroup[][]): WaveGroup[][] =>
  waves.map((wave) => wave.map((group) => ({ ...group })));

const createDefaultWaveTemplate = (): WaveGroup[][] => [
  [
    {
      type: "frosh",
      count: 10,
      interval: 600,
    },
  ],
];

const normalizeCustomWaves = (waves: WaveGroup[][] | undefined): WaveGroup[][] | undefined => {
  if (!waves || waves.length === 0) return undefined;

  const normalized = waves
    .map((wave) =>
      wave
        .map((group) => {
          if (!group || !group.type || !(group.type in ENEMY_DATA)) return null;
          const count = Math.max(1, Math.round(group.count));
          const interval = clamp(Math.round(group.interval), 80, 5000);
          const delay =
            typeof group.delay === "number"
              ? clamp(Math.round(group.delay), 0, 15000)
              : undefined;
          return {
            type: group.type,
            count,
            interval,
            delay,
          } as WaveGroup;
        })
        .filter((group): group is WaveGroup => Boolean(group))
    )
    .filter((wave) => wave.length > 0);

  return normalized.length > 0 ? normalized : undefined;
};

const normalizeDecorations = (decorations: MapDecoration[] | undefined): MapDecoration[] => {
  if (!decorations) return [];
  const normalized: MapDecoration[] = [];
  for (const decoration of decorations) {
    const type = decoration.type ?? decoration.category;
    if (!type) continue;
    normalized.push({
      ...decoration,
      type,
      category: type,
      pos: normalizeGridPoint(decoration.pos),
      size:
        typeof decoration.size === "number"
          ? clamp(decoration.size, 0.5, 8)
          : undefined,
      scale:
        typeof decoration.scale === "number"
          ? clamp(decoration.scale, 0.4, 4)
          : undefined,
    });
  }
  return normalized;
};

const normalizeHazards = (hazards: MapHazard[] | undefined): MapHazard[] => {
  if (!hazards) return [];
  const normalized: MapHazard[] = [];
  for (const hazard of hazards) {
    const basePos = hazard.pos ?? hazard.gridPos;
    if (!basePos) continue;
    normalized.push({
      ...hazard,
      pos: normalizeGridPoint(basePos),
      radius:
        typeof hazard.radius === "number"
          ? clamp(hazard.radius, 0.5, 10)
          : hazard.radius,
    });
  }
  return normalized;
};

const buildLevelId = (slugOrName: string): string => {
  const fallback = sanitizeSlug(slugOrName) || "level";
  return `${CUSTOM_LEVEL_PREFIX}${fallback}`;
};

const validateAndBuildLevel = (
  draft: CustomLevelDraftInput,
  existing: CustomLevelDefinition[]
): CustomLevelUpsertResult => {
  const errors: string[] = [];
  const name = draft.name.trim();
  if (!name) errors.push("Map name is required.");

  const slugSource = draft.slug || name;
  const slug = sanitizeSlug(slugSource);
  if (!slug) errors.push("Slug must contain at least one letter or number.");
  const levelId = draft.id?.startsWith(CUSTOM_LEVEL_PREFIX)
    ? draft.id
    : buildLevelId(slug || name);

  if (
    !draft.id &&
    existing.some((level) => level.id === levelId)
  ) {
    errors.push("Another custom map already uses this slug.");
  }
  if (
    draft.id &&
    draft.id !== levelId &&
    existing.some((level) => level.id === levelId)
  ) {
    errors.push("Another custom map already uses this slug.");
  }
  if (levelId in LEVEL_DATA && !levelId.startsWith(CUSTOM_LEVEL_PREFIX)) {
    errors.push("Slug conflicts with a built-in campaign map.");
  }

  const primaryPath = normalizePath(draft.primaryPath);
  if (primaryPath.length < 4) {
    errors.push("Primary path needs at least 4 points.");
  }

  const secondaryPath = normalizePath(draft.secondaryPath);
  const hasSecondaryPath = secondaryPath.length > 0;
  if (hasSecondaryPath && secondaryPath.length < 4) {
    errors.push("Secondary path needs at least 4 points when enabled.");
  }

  const heroSpawn = draft.heroSpawn
    ? normalizeGridPoint(draft.heroSpawn)
    : primaryPath.length > 0
      ? normalizeGridPoint(primaryPath[Math.max(0, primaryPath.length - 2)])
      : undefined;
  if (!heroSpawn) {
    errors.push("Hero spawn is required.");
  }

  const specialTower = draft.specialTower
    ? {
        ...draft.specialTower,
        pos: normalizeGridPoint(draft.specialTower.pos),
        hp:
          typeof draft.specialTower.hp === "number"
            ? Math.max(1, Math.round(draft.specialTower.hp))
            : undefined,
      }
    : undefined;

  const startingPawPoints = Math.round(
    clamp(draft.startingPawPoints, 150, 2500)
  );
  const requestedWaveTemplate = draft.waveTemplate?.trim();
  const waveTemplate =
    requestedWaveTemplate &&
    (requestedWaveTemplate === DEFAULT_WAVE_TEMPLATE ||
      Boolean(LEVEL_WAVES[requestedWaveTemplate]))
      ? requestedWaveTemplate
      : DEFAULT_WAVE_TEMPLATE;
  const customWaves = normalizeCustomWaves(draft.customWaves);
  const description = draft.description.trim() || "Custom map created in sandbox mode.";
  const decorations = normalizeDecorations(draft.decorations);
  const hazards = normalizeHazards(draft.hazards);

  if (errors.length > 0) return { ok: false, errors };

  const now = Date.now();
  const existingEntry = existing.find((level) => level.id === draft.id);
  const level: CustomLevelDefinition = {
    id: levelId,
    slug,
    name,
    description,
    theme: draft.theme,
    difficulty: draft.difficulty,
    startingPawPoints,
    waveTemplate,
    customWaves: customWaves ? cloneWaveGroups(customWaves) : undefined,
    primaryPath,
    secondaryPath: hasSecondaryPath ? secondaryPath : undefined,
    heroSpawn,
    specialTower,
    decorations,
    hazards,
    createdAt: existingEntry?.createdAt ?? now,
    updatedAt: now,
  };

  return { ok: true, level };
};

const unregisterCustomLevels = (): void => {
  registeredCustomLevelIds.forEach((levelId) => {
    delete LEVEL_DATA[levelId];
    delete LEVEL_WAVES[levelId];
    delete MAP_PATHS[levelId];
    delete MAP_PATHS[`${levelId}_b`];
  });
  registeredCustomLevelIds.clear();
};

const registerCustomLevels = (levels: CustomLevelDefinition[]): void => {
  unregisterCustomLevels();

  for (const level of levels) {
    if (level.primaryPath.length < 2) continue;

    MAP_PATHS[level.id] = level.primaryPath.map((point) => ({ ...point }));
    if (level.secondaryPath && level.secondaryPath.length >= 2) {
      MAP_PATHS[`${level.id}_b`] = level.secondaryPath.map((point) => ({
        ...point,
      }));
    }

    const camera = THEME_DEFAULT_CAMERA[level.theme];
    LEVEL_DATA[level.id] = {
      name: level.name,
      position: { x: 120, y: 200 },
      description: level.description,
      camera: {
        offset: { x: camera.x, y: camera.y },
        zoom: camera.zoom,
      },
      region: level.theme,
      theme: level.theme,
      difficulty: level.difficulty,
      startingPawPoints: level.startingPawPoints,
      dualPath: Boolean(level.secondaryPath && level.secondaryPath.length >= 2),
      secondaryPath:
        level.secondaryPath && level.secondaryPath.length >= 2
          ? `${level.id}_b`
          : undefined,
      heroSpawn: level.heroSpawn,
      specialTower: level.specialTower
        ? {
            pos: { ...level.specialTower.pos },
            type: level.specialTower.type,
            hp: level.specialTower.hp,
          }
        : undefined,
      decorations: level.decorations,
      hazards: level.hazards,
    };

    const levelWaves =
      level.customWaves && level.customWaves.length > 0
        ? level.customWaves
        : level.waveTemplate === DEFAULT_WAVE_TEMPLATE
          ? createDefaultWaveTemplate()
          : LEVEL_WAVES[level.waveTemplate] ?? LEVEL_WAVES.poe ?? createDefaultWaveTemplate();
    if (levelWaves) {
      LEVEL_WAVES[level.id] = cloneWaveGroups(levelWaves);
    }

    registeredCustomLevelIds.add(level.id);
  }
};

export const isCustomLevelId = (levelId: string): boolean =>
  levelId.startsWith(CUSTOM_LEVEL_PREFIX);

export function useCustomLevels() {
  const [customLevels, setCustomLevels] = useLocalStorage<CustomLevelDefinition[]>(
    CUSTOM_LEVELS_STORAGE_KEY,
    []
  );

  const sortedCustomLevels = useMemo(
    () =>
      [...customLevels].sort((a, b) => {
        if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
        return a.name.localeCompare(b.name);
      }),
    [customLevels]
  );

  useEffect(() => {
    registerCustomLevels(sortedCustomLevels);
    return () => {
      unregisterCustomLevels();
    };
  }, [sortedCustomLevels]);

  const upsertCustomLevel = useCallback(
    (draft: CustomLevelDraftInput): CustomLevelUpsertResult => {
      const result = validateAndBuildLevel(draft, customLevels);
      if (!result.ok || !result.level) return result;

      setCustomLevels((prev) => {
        const existingIndex = prev.findIndex((level) => level.id === result.level!.id);
        if (existingIndex === -1) return [...prev, result.level!];
        const next = [...prev];
        next[existingIndex] = result.level!;
        return next;
      });

      return result;
    },
    [customLevels, setCustomLevels]
  );

  const deleteCustomLevel = useCallback(
    (levelId: string) => {
      setCustomLevels((prev) => prev.filter((level) => level.id !== levelId));
    },
    [setCustomLevels]
  );

  return {
    customLevels: sortedCustomLevels,
    upsertCustomLevel,
    deleteCustomLevel,
  };
}
