"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  CircleAlert,
  Eraser,
  GitBranch,
  Landmark,
  Layers,
  MapPin,
  MousePointer2,
  Paintbrush,
  Play,
  Plus,
  Route,
  Save,
  Search,
  Settings2,
  Shield,
  Sparkles,
  Swords,
  Target,
  Trash2,
  Undo2,
  User,
  Wand2,
  X,
  ZoomIn,
  ZoomOut,
  Redo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ENEMY_DATA,
  GRID_HEIGHT,
  GRID_WIDTH,
  LEVEL_DATA,
  LEVEL_WAVES,
} from "../../constants";
import { LANDMARK_DECORATION_TYPES } from "../../utils";
import { WORLD_LEVELS } from "./worldMapData";
import type {
  DecorationCategory,
  EnemyType,
  HazardType,
  MapDecoration,
  MapHazard,
  MapTheme,
  SpecialTowerType,
  WaveGroup,
} from "../../types";
import type {
  CustomLevelDefinition,
  CustomLevelDraftInput,
  CustomLevelUpsertResult,
  GridPoint,
} from "../../customLevels/types";

interface CustomLevelCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLevels: CustomLevelDefinition[];
  onSaveLevel: (draft: CustomLevelDraftInput) => CustomLevelUpsertResult;
  onDeleteLevel: (levelId: string) => void;
  onPlayLevel: (levelId: string) => void;
}

interface CreatorDraftState {
  id?: string;
  slug: string;
  name: string;
  description: string;
  theme: MapTheme;
  difficulty: 1 | 2 | 3;
  startingPawPoints: number;
  waveTemplate: string;
  customWaves: WaveGroup[][];
  primaryPath: GridPoint[];
  secondaryPath: GridPoint[];
  heroSpawn: GridPoint | null;
  specialTowerEnabled: boolean;
  specialTowerType: SpecialTowerType;
  specialTowerHp: number;
  specialTowerPos: GridPoint | null;
  decorations: MapDecoration[];
  hazards: MapHazard[];
}

type ToolMode =
  | "select"
  | "path_primary"
  | "path_secondary"
  | "hero_spawn"
  | "special_tower"
  | "decoration"
  | "landmark"
  | "hazard"
  | "erase";

type SelectionTarget =
  | { kind: "primary_path"; index: number }
  | { kind: "secondary_path"; index: number }
  | { kind: "hero_spawn" }
  | { kind: "special_tower" }
  | { kind: "decoration"; index: number }
  | { kind: "hazard"; index: number };

interface PaletteDragPayload {
  kind: "decoration" | "landmark" | "hazard" | "objective";
  value: string;
}

const THEME_OPTIONS: MapTheme[] = [
  "grassland",
  "swamp",
  "desert",
  "winter",
  "volcanic",
];

const SPECIAL_TOWER_TYPES: SpecialTowerType[] = [
  "beacon",
  "shrine",
  "vault",
  "barracks",
];

const OBJECTIVE_TYPE_STATS: Record<
  SpecialTowerType,
  { title: string; effect: string; risk: string }
> = {
  beacon: {
    title: "Beacon",
    effect: "Buff aura for nearby defenders.",
    risk: "Objective falls when enemies overrun it.",
  },
  shrine: {
    title: "Shrine",
    effect: "Periodic healing pulse for allies.",
    risk: "Losing it removes sustain cadence.",
  },
  vault: {
    title: "Vault",
    effect: "Has HP and can be directly destroyed.",
    risk: "If HP reaches zero, objective fails.",
  },
  barracks: {
    title: "Barracks",
    effect: "Spawns allied troops over time.",
    risk: "Losing it cuts reinforcement pressure.",
  },
};

const MANUAL_DECORATION_OPTIONS: DecorationCategory[] = [
  "tree",
  "bush",
  "flowers",
  "statue",
  "bench",
  "fence",
  "swamp_tree",
  "lily_pads",
  "mushroom_cluster",
  "fog_patch",
  "palm",
  "cactus",
  "dune",
  "obelisk",
  "sarcophagus",
  "pine_tree",
  "ice_crystal",
  "snow_lantern",
  "frozen_pond",
  "lava_pool",
  "obsidian_spike",
  "magma_vent",
  "charred_tree",
  "fire_crystal",
];

const LANDMARK_OPTIONS = Array.from(
  LANDMARK_DECORATION_TYPES
) as DecorationCategory[];

const HAZARD_OPTIONS: HazardType[] = [
  "poison_fog",
  "quicksand",
  "ice_sheet",
  "ice_spikes",
  // Canonical volcanic hazard (eruption_zone still supported as legacy alias).
  "lava_geyser",
];

const ENEMY_OPTIONS = Object.keys(ENEMY_DATA) as EnemyType[];
const DEFAULT_PRESET_ID = "default";

const createDefaultWaveGroup = (): WaveGroup => ({
  type: ENEMY_OPTIONS[0] ?? "frosh",
  count: 10,
  interval: 600,
});

const createDefaultPresetWaves = (): WaveGroup[][] => [[createDefaultWaveGroup()]];

interface MapPresetTemplate {
  id: string;
  label: string;
  description: string;
  theme?: MapTheme;
  difficulty?: 1 | 2 | 3;
  startingPawPoints?: number;
  decorations: MapDecoration[];
  hazards: MapHazard[];
  specialTower?: {
    pos: GridPoint;
    type: SpecialTowerType;
    hp?: number;
  };
}

const cloneDecorations = (decorations: MapDecoration[] | undefined): MapDecoration[] =>
  (decorations ?? []).map((deco) => ({
    ...deco,
    pos: { ...deco.pos },
  }));

const cloneHazards = (hazards: MapHazard[] | undefined): MapHazard[] =>
  (hazards ?? []).map((hazard) => ({
    ...hazard,
    pos: hazard.pos ? { ...hazard.pos } : hazard.pos,
    gridPos: hazard.gridPos ? { ...hazard.gridPos } : hazard.gridPos,
  }));

const MAP_PRESET_TEMPLATES: MapPresetTemplate[] = [
  {
    id: DEFAULT_PRESET_ID,
    label: "Default",
    description: "Blank sandbox preset.",
    decorations: [],
    hazards: [],
  },
  ...WORLD_LEVELS.map((level) => {
    const levelData = LEVEL_DATA[level.id];
    return {
      id: level.id,
      label: levelData?.name ?? level.name,
      description: levelData?.description ?? level.description,
      theme: levelData?.theme ?? level.region,
      difficulty: levelData?.difficulty ?? level.difficulty,
      startingPawPoints: levelData?.startingPawPoints,
      decorations: cloneDecorations(levelData?.decorations),
      hazards: cloneHazards(levelData?.hazards),
      specialTower: levelData?.specialTower
        ? {
          pos: { ...levelData.specialTower.pos },
          type: levelData.specialTower.type,
          hp: levelData.specialTower.hp,
        }
        : undefined,
    };
  }),
];

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

const createEmptyDraft = (): CreatorDraftState => ({
  slug: "",
  name: "",
  description: "",
  theme: "grassland",
  difficulty: 1,
  startingPawPoints: 450,
  waveTemplate: DEFAULT_PRESET_ID,
  customWaves: [],
  primaryPath: [],
  secondaryPath: [],
  heroSpawn: null,
  specialTowerEnabled: false,
  specialTowerType: "beacon",
  specialTowerHp: 800,
  specialTowerPos: null,
  decorations: [],
  hazards: [],
});

const levelToDraft = (level: CustomLevelDefinition): CreatorDraftState => ({
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
  specialTowerEnabled: Boolean(level.specialTower),
  specialTowerType: level.specialTower?.type ?? "beacon",
  specialTowerHp: level.specialTower?.hp ?? 800,
  specialTowerPos: level.specialTower?.pos ?? null,
  decorations: level.decorations.map((deco) => ({ ...deco, pos: { ...deco.pos } })),
  hazards: level.hazards.map((hazard) => ({ ...hazard })),
});

const ISO_VIEWBOX_WIDTH = 1320;
const ISO_VIEWBOX_HEIGHT = 780;
const ISO_TILE_WIDTH = 34;
const ISO_TILE_HEIGHT = 18;
const ISO_ORIGIN_X = ISO_VIEWBOX_WIDTH / 2;
const ISO_ORIGIN_Y = 96;
const PATH_MARGIN_TILES = 4;

const gridToIso = (point: GridPoint): { x: number; y: number } => ({
  x: ISO_ORIGIN_X + (point.x - point.y) * (ISO_TILE_WIDTH / 2),
  y: ISO_ORIGIN_Y + (point.x + point.y) * (ISO_TILE_HEIGHT / 2),
});

const gridFloatToIso = (x: number, y: number): { x: number; y: number } => ({
  x: ISO_ORIGIN_X + (x - y) * (ISO_TILE_WIDTH / 2),
  y: ISO_ORIGIN_Y + (x + y) * (ISO_TILE_HEIGHT / 2),
});

const isoToGridFloat = (x: number, y: number): { x: number; y: number } => {
  const normalizedX = (x - ISO_ORIGIN_X) / (ISO_TILE_WIDTH / 2);
  const normalizedY = (y - ISO_ORIGIN_Y) / (ISO_TILE_HEIGHT / 2);
  return {
    x: (normalizedX + normalizedY) / 2,
    y: (normalizedY - normalizedX) / 2,
  };
};

const getIsoTilePolygon = (point: GridPoint, padding = 0): string => {
  const center = gridFloatToIso(point.x + 0.5, point.y + 0.5);
  const scale = Math.max(0.05, 1 + padding);
  const corners = [
    gridFloatToIso(point.x, point.y),
    gridFloatToIso(point.x + 1, point.y),
    gridFloatToIso(point.x + 1, point.y + 1),
    gridFloatToIso(point.x, point.y + 1),
  ].map((corner) => ({
    x: center.x + (corner.x - center.x) * scale,
    y: center.y + (corner.y - center.y) * scale,
  }));
  return corners.map((corner) => `${corner.x},${corner.y}`).join(" ");
};

const pathToIsoPoints = (path: GridPoint[]): string =>
  path
    .map((point) => {
      const p = gridToIso(point);
      return `${p.x},${p.y}`;
    })
    .join(" ");

const MAP_PLANE_POLYGON = [
  gridFloatToIso(0, 0),
  gridFloatToIso(GRID_WIDTH, 0),
  gridFloatToIso(GRID_WIDTH, GRID_HEIGHT),
  gridFloatToIso(0, GRID_HEIGHT),
]
  .map((point) => `${point.x},${point.y}`)
  .join(" ");

const normalizeMapPoint = (point: GridPoint): GridPoint => ({
  x: clamp(Math.round(point.x), 0, GRID_WIDTH - 1),
  y: clamp(Math.round(point.y), 0, GRID_HEIGHT - 1),
});

const normalizePathPoint = (point: GridPoint): GridPoint => ({
  x: clamp(Math.round(point.x), -PATH_MARGIN_TILES, GRID_WIDTH - 1 + PATH_MARGIN_TILES),
  y: clamp(Math.round(point.y), -PATH_MARGIN_TILES, GRID_HEIGHT - 1 + PATH_MARGIN_TILES),
});

const isInsideMap = (point: GridPoint): boolean =>
  point.x >= 0 &&
  point.x <= GRID_WIDTH - 1 &&
  point.y >= 0 &&
  point.y <= GRID_HEIGHT - 1;

const toolHint: Record<ToolMode, string> = {
  select: "Select and drag existing nodes/items.",
  path_primary: "Click to append nodes to primary path.",
  path_secondary: "Click to append nodes to secondary path.",
  hero_spawn: "Click a tile to place hero spawn.",
  special_tower: "Click a tile to place special objective.",
  decoration: "Click or drop to place decoration.",
  landmark: "Click or drop to place landmark.",
  hazard: "Click or drop to place hazard.",
  erase: "Click items to erase them.",
};

const TOOL_OPTIONS: Array<{
  key: ToolMode;
  label: string;
  icon: LucideIcon;
}> = [
    { key: "select", label: "Select", icon: MousePointer2 },
    { key: "path_primary", label: "Path A", icon: Route },
    { key: "path_secondary", label: "Path B", icon: GitBranch },
    { key: "hero_spawn", label: "Hero", icon: User },
    { key: "special_tower", label: "Objective", icon: Shield },
  ];

const samePoint = (a: GridPoint | null, b: GridPoint | null): boolean =>
  Boolean(a && b && a.x === b.x && a.y === b.y);

const formatPointLabel = (point: GridPoint | null): string =>
  point ? `(${point.x},${point.y})` : "(--,--)";

const formatAssetName = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const cloneDraftState = (draft: CreatorDraftState): CreatorDraftState => ({
  ...draft,
  customWaves: draft.customWaves.map((wave) => wave.map((group) => ({ ...group }))),
  primaryPath: draft.primaryPath.map((point) => ({ ...point })),
  secondaryPath: draft.secondaryPath.map((point) => ({ ...point })),
  heroSpawn: draft.heroSpawn ? { ...draft.heroSpawn } : null,
  specialTowerPos: draft.specialTowerPos ? { ...draft.specialTowerPos } : null,
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

const validateDraft = (draft: CreatorDraftState): string[] => {
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
  if (draft.specialTowerEnabled && !draft.specialTowerPos) {
    errors.push("Special tower is enabled but not placed.");
  }
  return errors;
};

const distanceSq = (a: GridPoint, b: GridPoint): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

const getPointFromSelection = (
  selection: SelectionTarget,
  draft: CreatorDraftState
): GridPoint | null => {
  switch (selection.kind) {
    case "primary_path":
      return draft.primaryPath[selection.index] ?? null;
    case "secondary_path":
      return draft.secondaryPath[selection.index] ?? null;
    case "hero_spawn":
      return draft.heroSpawn;
    case "special_tower":
      return draft.specialTowerPos;
    case "decoration":
      return draft.decorations[selection.index]?.pos ?? null;
    case "hazard":
      return (draft.hazards[selection.index]?.pos as GridPoint | undefined) ?? null;
    default:
      return null;
  }
};

const findSelectionNearPoint = (
  point: GridPoint,
  draft: CreatorDraftState,
  snapRadiusTiles = 1.8
): SelectionTarget | null => {
  let bestTarget: SelectionTarget | null = null;
  let bestDist = Number.POSITIVE_INFINITY;

  const tryCandidate = (candidate: SelectionTarget, p: GridPoint | null) => {
    if (!p) return;
    const dist = distanceSq(point, p);
    if (dist < bestDist) {
      bestDist = dist;
      bestTarget = candidate;
    }
  };

  draft.primaryPath.forEach((p, index) =>
    tryCandidate({ kind: "primary_path", index }, p)
  );
  draft.secondaryPath.forEach((p, index) =>
    tryCandidate({ kind: "secondary_path", index }, p)
  );
  tryCandidate({ kind: "hero_spawn" }, draft.heroSpawn);
  tryCandidate({ kind: "special_tower" }, draft.specialTowerPos);
  draft.decorations.forEach((deco, index) =>
    tryCandidate({ kind: "decoration", index }, deco.pos)
  );
  draft.hazards.forEach((hazard, index) =>
    tryCandidate({ kind: "hazard", index }, (hazard.pos as GridPoint | undefined) ?? null)
  );

  if (!bestTarget || bestDist > snapRadiusTiles * snapRadiusTiles) return null;
  return bestTarget;
};

const applySelectionPointUpdate = (
  draft: CreatorDraftState,
  target: SelectionTarget,
  point: GridPoint
): CreatorDraftState => {
  if (target.kind === "primary_path") {
    const nextPoint = normalizePathPoint(point);
    const current = draft.primaryPath[target.index];
    if (!current || (current.x === nextPoint.x && current.y === nextPoint.y)) {
      return draft;
    }
    const next = [...draft.primaryPath];
    next[target.index] = nextPoint;
    return { ...draft, primaryPath: next };
  }
  if (target.kind === "secondary_path") {
    const nextPoint = normalizePathPoint(point);
    const current = draft.secondaryPath[target.index];
    if (!current || (current.x === nextPoint.x && current.y === nextPoint.y)) {
      return draft;
    }
    const next = [...draft.secondaryPath];
    next[target.index] = nextPoint;
    return { ...draft, secondaryPath: next };
  }
  if (target.kind === "hero_spawn") {
    const nextPoint = normalizeMapPoint(point);
    if (draft.heroSpawn && samePoint(draft.heroSpawn, nextPoint)) return draft;
    return { ...draft, heroSpawn: nextPoint };
  }
  if (target.kind === "special_tower") {
    const nextPoint = normalizeMapPoint(point);
    if (draft.specialTowerPos && samePoint(draft.specialTowerPos, nextPoint)) {
      return draft;
    }
    return { ...draft, specialTowerPos: nextPoint };
  }
  if (target.kind === "decoration") {
    const nextPoint = normalizeMapPoint(point);
    const next = [...draft.decorations];
    const current = next[target.index];
    if (!current) return draft;
    if (current.pos.x === nextPoint.x && current.pos.y === nextPoint.y) {
      return draft;
    }
    next[target.index] = { ...current, pos: nextPoint };
    return { ...draft, decorations: next };
  }
  const nextPoint = normalizeMapPoint(point);
  const next = [...draft.hazards];
  const current = next[target.index];
  if (!current) return draft;
  const currentPos = (current.pos as GridPoint | undefined) ?? null;
  if (currentPos && currentPos.x === nextPoint.x && currentPos.y === nextPoint.y) {
    return draft;
  }
  next[target.index] = { ...current, pos: nextPoint };
  return { ...draft, hazards: next };
};

const removeSelection = (
  draft: CreatorDraftState,
  target: SelectionTarget
): CreatorDraftState => {
  if (target.kind === "primary_path") {
    return {
      ...draft,
      primaryPath: draft.primaryPath.filter((_, index) => index !== target.index),
    };
  }
  if (target.kind === "secondary_path") {
    return {
      ...draft,
      secondaryPath: draft.secondaryPath.filter((_, index) => index !== target.index),
    };
  }
  if (target.kind === "hero_spawn") {
    return { ...draft, heroSpawn: null };
  }
  if (target.kind === "special_tower") {
    return { ...draft, specialTowerPos: null };
  }
  if (target.kind === "decoration") {
    return {
      ...draft,
      decorations: draft.decorations.filter((_, index) => index !== target.index),
    };
  }
  return {
    ...draft,
    hazards: draft.hazards.filter((_, index) => index !== target.index),
  };
};

export const CustomLevelCreatorModal: React.FC<CustomLevelCreatorModalProps> = ({
  isOpen,
  onClose,
  customLevels,
  onSaveLevel,
  onDeleteLevel,
  onPlayLevel,
}) => {
  const [draft, setDraft] = useState<CreatorDraftState>(createEmptyDraft);
  const [tool, setTool] = useState<ToolMode>("select");
  const [selectedDecorationType, setSelectedDecorationType] =
    useState<DecorationCategory>("tree");
  const [selectedLandmarkType, setSelectedLandmarkType] =
    useState<DecorationCategory>("nassau_hall");
  const [selectedHazardType, setSelectedHazardType] = useState<HazardType>("poison_fog");
  const [paletteKind, setPaletteKind] =
    useState<PaletteDragPayload["kind"]>("decoration");
  const [paletteSearch, setPaletteSearch] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_PRESET_ID);
  const [selection, setSelection] = useState<SelectionTarget | null>(null);
  const [dragTarget, setDragTarget] = useState<SelectionTarget | null>(null);
  const [hoverPoint, setHoverPoint] = useState<GridPoint | null>(null);
  const [isBoardDragOver, setIsBoardDragOver] = useState(false);
  const [undoStack, setUndoStack] = useState<CreatorDraftState[]>([]);
  const [redoStack, setRedoStack] = useState<CreatorDraftState[]>([]);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cameraDrag, setCameraDrag] = useState<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const boardRef = useRef<SVGSVGElement>(null);
  const draftRef = useRef<CreatorDraftState>(draft);

  const waveTemplateOptions = useMemo(
    () => MAP_PRESET_TEMPLATES.map((preset) => ({ value: preset.id, label: preset.label })),
    []
  );
  const mapPresetById = useMemo(
    () =>
      new Map<string, MapPresetTemplate>(
        MAP_PRESET_TEMPLATES.map((preset) => [preset.id, preset])
      ),
    []
  );
  const paletteOptions = useMemo(() => {
    const source: string[] =
      paletteKind === "decoration"
        ? [...MANUAL_DECORATION_OPTIONS]
        : paletteKind === "landmark"
          ? [...LANDMARK_OPTIONS]
          : [...HAZARD_OPTIONS];
    const search = paletteSearch.trim().toLowerCase();
    if (!search) return source;
    return source.filter((option) => option.toLowerCase().includes(search));
  }, [paletteKind, paletteSearch]);

  const clearMessages = (): void => {
    setErrors([]);
    setNotice(null);
  };

  const resolvePresetId = (presetId: string): string =>
    mapPresetById.has(presetId) ? presetId : DEFAULT_PRESET_ID;

  const viewBoxWidth = ISO_VIEWBOX_WIDTH / zoom;
  const viewBoxHeight = ISO_VIEWBOX_HEIGHT / zoom;
  const viewBoxX = (ISO_VIEWBOX_WIDTH - viewBoxWidth) / 2 + pan.x;
  const viewBoxY = (ISO_VIEWBOX_HEIGHT - viewBoxHeight) / 2 + pan.y;

  const pushDraftHistory = (nextDraft: CreatorDraftState): void => {
    const prev = draftRef.current;
    if (nextDraft === prev) return;
    setUndoStack((stack) => [...stack.slice(-119), cloneDraftState(prev)]);
    setRedoStack([]);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  };

  const applyDraftUpdate = (
    updater: (prev: CreatorDraftState) => CreatorDraftState
  ): void => {
    const prev = draftRef.current;
    const next = updater(prev);
    if (next === prev) return;
    pushDraftHistory(next);
  };

  const undoDraft = (): void => {
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1];
      setRedoStack((future) => [...future, cloneDraftState(draftRef.current)]);
      const restored = cloneDraftState(previous);
      draftRef.current = restored;
      setDraft(restored);
      return stack.slice(0, -1);
    });
  };

  const redoDraft = (): void => {
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      setUndoStack((past) => [...past, cloneDraftState(draftRef.current)]);
      const restored = cloneDraftState(next);
      draftRef.current = restored;
      setDraft(restored);
      return stack.slice(0, -1);
    });
  };

  const handleToolSelect = (nextTool: ToolMode): void => {
    setTool(nextTool);
    if (nextTool === "decoration") setPaletteKind("decoration");
    if (nextTool === "landmark") setPaletteKind("landmark");
    if (nextTool === "hazard") setPaletteKind("hazard");
  };

  const resetDraft = (): void => {
    const empty = createEmptyDraft();
    draftRef.current = empty;
    setDraft(empty);
    setSelectedPresetId(DEFAULT_PRESET_ID);
    setSelectedDecorationType("tree");
    setSelectedLandmarkType("nassau_hall");
    setSelectedHazardType("poison_fog");
    setSelection(null);
    setTool("select");
    setPaletteKind("decoration");
    setHoverPoint(null);
    setPaletteSearch("");
    setUndoStack([]);
    setRedoStack([]);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setCameraDrag(null);
    clearMessages();
  };

  const getBoardRenderMetrics = (): {
    rect: DOMRect;
    renderWidth: number;
    renderHeight: number;
    offsetX: number;
    offsetY: number;
  } | null => {
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    const rectRatio = rect.width / rect.height;
    const viewRatio = viewBoxWidth / viewBoxHeight;

    if (rectRatio > viewRatio) {
      const renderHeight = rect.height;
      const renderWidth = renderHeight * viewRatio;
      return {
        rect,
        renderWidth,
        renderHeight,
        offsetX: (rect.width - renderWidth) / 2,
        offsetY: 0,
      };
    }

    const renderWidth = rect.width;
    const renderHeight = renderWidth / viewRatio;
    return {
      rect,
      renderWidth,
      renderHeight,
      offsetX: 0,
      offsetY: (rect.height - renderHeight) / 2,
    };
  };

  const updateHoverPoint = (point: GridPoint | null): void => {
    setHoverPoint((prev) => {
      if (!prev && !point) return prev;
      if (samePoint(prev, point)) return prev;
      return point;
    });
  };

  const getGridPointFromClient = (clientX: number, clientY: number): GridPoint | null => {
    const metrics = getBoardRenderMetrics();
    if (!metrics) return null;
    const { rect, renderWidth, renderHeight, offsetX, offsetY } = metrics;

    const localX = clientX - rect.left - offsetX;
    const localY = clientY - rect.top - offsetY;
    if (localX < 0 || localX > renderWidth || localY < 0 || localY > renderHeight) {
      return null;
    }

    const svgX = viewBoxX + (localX / renderWidth) * viewBoxWidth;
    const svgY = viewBoxY + (localY / renderHeight) * viewBoxHeight;
    const mapped = isoToGridFloat(svgX, svgY);
    if (
      mapped.x < -PATH_MARGIN_TILES - 1 ||
      mapped.x > GRID_WIDTH + PATH_MARGIN_TILES ||
      mapped.y < -PATH_MARGIN_TILES - 1 ||
      mapped.y > GRID_HEIGHT + PATH_MARGIN_TILES
    ) {
      return null;
    }
    return {
      x: Math.floor(mapped.x),
      y: Math.floor(mapped.y),
    };
  };

  const placeAtPoint = (point: GridPoint): void => {
    const mapPoint = normalizeMapPoint(point);
    const pathPoint = normalizePathPoint(point);
    clearMessages();
    applyDraftUpdate((prev) => {
      if (tool === "path_primary") {
        return { ...prev, primaryPath: [...prev.primaryPath, pathPoint] };
      }
      if (tool === "path_secondary") {
        return { ...prev, secondaryPath: [...prev.secondaryPath, pathPoint] };
      }
      if (tool === "hero_spawn") {
        if (!isInsideMap(point)) return prev;
        return { ...prev, heroSpawn: mapPoint };
      }
      if (tool === "special_tower") {
        if (!isInsideMap(point)) return prev;
        return { ...prev, specialTowerPos: mapPoint, specialTowerEnabled: true };
      }
      if (tool === "decoration") {
        if (!isInsideMap(point)) return prev;
        return {
          ...prev,
          decorations: [
            ...prev.decorations,
            { type: selectedDecorationType, pos: mapPoint, variant: 0 },
          ],
        };
      }
      if (tool === "landmark") {
        if (!isInsideMap(point)) return prev;
        return {
          ...prev,
          decorations: [
            ...prev.decorations,
            { type: selectedLandmarkType, pos: mapPoint, variant: 0, size: 1.6 },
          ],
        };
      }
      if (tool === "hazard") {
        if (!isInsideMap(point)) return prev;
        return {
          ...prev,
          hazards: [
            ...prev.hazards,
            { type: selectedHazardType, pos: mapPoint, radius: 1.5 },
          ],
        };
      }
      if (tool === "erase") {
        const target = findSelectionNearPoint(pathPoint, prev, 3.6);
        if (!target) return prev;
        return removeSelection(prev, target);
      }
      return prev;
    });

    if (tool === "select") {
      const target = findSelectionNearPoint(pathPoint, draftRef.current, 2.3);
      setSelection(target);
      return;
    }
    if (tool === "special_tower") {
      setSelection({ kind: "special_tower" });
      return;
    }
    if (tool === "hero_spawn") {
      setSelection({ kind: "hero_spawn" });
    }
  };

  const handleBoardPointerDown = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (event.button === 1 || event.altKey) {
      event.preventDefault();
      setCameraDrag({
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (event.button !== 0) return;

    const point = getGridPointFromClient(event.clientX, event.clientY);
    if (!point) return;
    updateHoverPoint(point);

    if (tool === "select") {
      const target = findSelectionNearPoint(point, draftRef.current, 2.3);
      setSelection(target);
      return;
    }

    placeAtPoint(point);
  };

  const handleBoardPointerMove = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (cameraDrag && event.pointerId === cameraDrag.pointerId) {
      const metrics = getBoardRenderMetrics();
      if (!metrics) return;
      const deltaX = event.clientX - cameraDrag.startClientX;
      const deltaY = event.clientY - cameraDrag.startClientY;
      const panDeltaX = -(deltaX / metrics.renderWidth) * viewBoxWidth;
      const panDeltaY = -(deltaY / metrics.renderHeight) * viewBoxHeight;
      setPan({
        x: cameraDrag.startPanX + panDeltaX,
        y: cameraDrag.startPanY + panDeltaY,
      });
      return;
    }

    const point = getGridPointFromClient(event.clientX, event.clientY);
    updateHoverPoint(point);
    if (!dragTarget || !point) return;

    applyDraftUpdate((prev) => applySelectionPointUpdate(prev, dragTarget, point));
  };

  const handleBoardPointerUp = (event: React.PointerEvent<SVGSVGElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setCameraDrag(null);
    setDragTarget(null);
  };

  const handleBoardPointerLeave = (): void => {
    setCameraDrag(null);
    setDragTarget(null);
    updateHoverPoint(null);
  };

  const handleBoardWheel = (event: React.WheelEvent<SVGSVGElement>): void => {
    event.preventDefault();
    const zoomDelta = event.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => clamp(Number((prev + zoomDelta).toFixed(2)), 0.55, 2.5));
  };

  const handleDropOnBoard = (event: React.DragEvent<SVGSVGElement>): void => {
    event.preventDefault();
    setIsBoardDragOver(false);
    const point = getGridPointFromClient(event.clientX, event.clientY);
    if (!point) return;
    updateHoverPoint(point);

    const rawPayload = event.dataTransfer.getData("application/princeton-td-asset");
    if (!rawPayload) return;

    let payload: PaletteDragPayload | null = null;
    try {
      payload = JSON.parse(rawPayload) as PaletteDragPayload;
    } catch {
      payload = null;
    }
    if (!payload) return;

    clearMessages();
    applyDraftUpdate((prev) => {
      if (!isInsideMap(point)) {
        if (payload.kind === "objective") {
          return prev;
        }
        return prev;
      }
      const mapPoint = normalizeMapPoint(point);
      if (payload.kind === "decoration") {
        return {
          ...prev,
          decorations: [
            ...prev.decorations,
            { type: payload.value as DecorationCategory, pos: mapPoint, variant: 0 },
          ],
        };
      }
      if (payload.kind === "landmark") {
        return {
          ...prev,
          decorations: [
            ...prev.decorations,
            {
              type: payload.value as DecorationCategory,
              pos: mapPoint,
              variant: 0,
              size: 1.6,
            },
          ],
        };
      }
      if (payload.kind === "objective") {
        return { ...prev, specialTowerPos: mapPoint, specialTowerEnabled: true };
      }
      return {
        ...prev,
        hazards: [
          ...prev.hazards,
          { type: payload.value as HazardType, pos: mapPoint, radius: 1.5 },
        ],
      };
    });

    if (payload.kind === "objective") {
      setSelection({ kind: "special_tower" });
    }
  };

  const handleBoardDragOver = (event: React.DragEvent<SVGSVGElement>): void => {
    event.preventDefault();
    if (!isBoardDragOver) setIsBoardDragOver(true);
    const point = getGridPointFromClient(event.clientX, event.clientY);
    updateHoverPoint(point);
  };

  const handleBoardDragLeave = (): void => {
    setIsBoardDragOver(false);
  };

  const startDragTarget = (
    target: SelectionTarget,
    event: React.PointerEvent
  ): void => {
    event.stopPropagation();
    setSelection(target);
    setDragTarget(target);
  };

  const selectedPoint = selection ? getPointFromSelection(selection, draft) : null;

  const selectedDecoration =
    selection?.kind === "decoration" ? draft.decorations[selection.index] : null;
  const selectedHazard = selection?.kind === "hazard" ? draft.hazards[selection.index] : null;
  const paletteIcon =
    paletteKind === "decoration"
      ? Paintbrush
      : paletteKind === "landmark"
        ? Landmark
        : AlertTriangle;
  const activeToolEntry = TOOL_OPTIONS.find((entry) => entry.key === tool) ?? TOOL_OPTIONS[0];
  const ActiveToolIcon = activeToolEntry.icon;
  const targetMatches = (
    target: SelectionTarget | null,
    kind: SelectionTarget["kind"],
    index?: number
  ): boolean => {
    if (!target || target.kind !== kind) return false;
    if (index === undefined) return true;
    return "index" in target && target.index === index;
  };
  const hoverSelectionTarget = hoverPoint
    ? findSelectionNearPoint(
      tool === "path_primary" || tool === "path_secondary"
        ? normalizePathPoint(hoverPoint)
        : hoverPoint,
      draft,
      tool === "erase" ? 3.6 : 2.3
    )
    : null;
  const primaryPathEmphasized =
    targetMatches(selection, "primary_path") ||
    targetMatches(hoverSelectionTarget, "primary_path");
  const secondaryPathEmphasized =
    targetMatches(selection, "secondary_path") ||
    targetMatches(hoverSelectionTarget, "secondary_path");
  const hoverIsErase = tool === "erase";

  const getToolAnchorPoint = (toolKey: ToolMode): GridPoint | null => {
    if (toolKey === "path_primary") return draft.primaryPath[0] ?? null;
    if (toolKey === "path_secondary") return draft.secondaryPath[0] ?? null;
    if (toolKey === "hero_spawn") return draft.heroSpawn;
    if (toolKey === "special_tower") return draft.specialTowerPos;
    return null;
  };

  const isToolComplete = (toolKey: ToolMode): boolean => {
    if (toolKey === "path_primary") return draft.primaryPath.length >= 4;
    if (toolKey === "path_secondary") {
      return draft.secondaryPath.length === 0 || draft.secondaryPath.length >= 4;
    }
    if (toolKey === "hero_spawn") return Boolean(draft.heroSpawn);
    if (toolKey === "special_tower") {
      return !draft.specialTowerEnabled || Boolean(draft.specialTowerPos);
    }
    return true;
  };

  const selectionSummary = (() => {
    if (!selection) return "none";
    if (selection.kind === "primary_path") return `Path A node ${selection.index + 1}`;
    if (selection.kind === "secondary_path") return `Path B node ${selection.index + 1}`;
    if (selection.kind === "hero_spawn") {
      return selectedPoint ? `Hero Spawn ${formatPointLabel(selectedPoint)}` : "Hero Spawn";
    }
    if (selection.kind === "special_tower") {
      const objectiveName = OBJECTIVE_TYPE_STATS[draft.specialTowerType].title;
      return selectedPoint
        ? `${objectiveName} ${formatPointLabel(selectedPoint)}`
        : objectiveName;
    }
    if (selection.kind === "hazard") {
      const point =
        (selectedHazard?.pos as GridPoint | undefined) ??
        selectedHazard?.gridPos ??
        selectedPoint;
      const hazardName = selectedHazard?.type
        ? formatAssetName(selectedHazard.type)
        : "Hazard";
      return point ? `${hazardName} ${formatPointLabel(point)}` : hazardName;
    }
    const decoType = selectedDecoration?.type ?? selectedDecoration?.category;
    const isLandmark = Boolean(decoType && LANDMARK_DECORATION_TYPES.has(decoType));
    const decorationName = decoType
      ? formatAssetName(decoType)
      : isLandmark
        ? "Landmark"
        : "Decoration";
    return selectedPoint
      ? `${decorationName} ${formatPointLabel(selectedPoint)}`
      : decorationName;
  })();

  const applyMapPreset = (presetId: string): void => {
    const nextPresetId = resolvePresetId(presetId);
    const preset = mapPresetById.get(nextPresetId);
    if (!preset) return;

    const presetDecorations = cloneDecorations(preset.decorations);
    const presetHazards = cloneHazards(preset.hazards);
    const firstDecoration = presetDecorations.find((item) =>
      MANUAL_DECORATION_OPTIONS.includes(item.type as DecorationCategory)
    );
    const firstLandmark = presetDecorations.find((item) =>
      LANDMARK_OPTIONS.includes(item.type as DecorationCategory)
    );
    const firstHazard = presetHazards.find((item) =>
      HAZARD_OPTIONS.includes(item.type as HazardType)
    );

    applyDraftUpdate((prev) => ({
      ...prev,
      theme: preset.theme ?? prev.theme,
      difficulty: preset.difficulty ?? prev.difficulty,
      startingPawPoints: preset.startingPawPoints ?? prev.startingPawPoints,
      waveTemplate: nextPresetId,
      customWaves: [],
      specialTowerEnabled: Boolean(preset.specialTower),
      specialTowerType: preset.specialTower?.type ?? "beacon",
      specialTowerHp:
        preset.specialTower?.type === "vault"
          ? Math.max(1, Math.round(preset.specialTower.hp ?? 800))
          : 800,
      specialTowerPos: preset.specialTower ? { ...preset.specialTower.pos } : null,
      decorations: presetDecorations,
      hazards: presetHazards,
    }));

    setSelectedPresetId(nextPresetId);
    setSelectedDecorationType((firstDecoration?.type as DecorationCategory) ?? "tree");
    setSelectedLandmarkType((firstLandmark?.type as DecorationCategory) ?? "nassau_hall");
    setSelectedHazardType((firstHazard?.type as HazardType) ?? "poison_fog");
    setNotice(
      nextPresetId === DEFAULT_PRESET_ID
        ? 'Applied "Default" preset: blank map + 1 starter wave.'
        : `Loaded "${preset.label}" defaults.`
    );
    setErrors([]);
  };

  const saveDraft = (): void => {
    const validationErrors = validateDraft(draft);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setNotice(null);
      return;
    }

    const payload: CustomLevelDraftInput = {
      id: draft.id,
      slug: draft.slug,
      name: draft.name,
      description: draft.description,
      theme: draft.theme,
      difficulty: draft.difficulty,
      startingPawPoints: draft.startingPawPoints,
      waveTemplate: draft.waveTemplate,
      customWaves:
        draft.customWaves.length > 0
          ? draft.customWaves.map((wave) => wave.map((group) => ({ ...group })))
          : undefined,
      primaryPath: draft.primaryPath,
      secondaryPath: draft.secondaryPath.length > 0 ? draft.secondaryPath : undefined,
      heroSpawn: draft.heroSpawn ?? undefined,
      specialTower:
        draft.specialTowerEnabled && draft.specialTowerPos
          ? {
            pos: draft.specialTowerPos,
            type: draft.specialTowerType,
            hp: draft.specialTowerType === "vault" ? draft.specialTowerHp : undefined,
          }
          : undefined,
      decorations: draft.decorations,
      hazards: draft.hazards,
    };

    const result = onSaveLevel(payload);
    if (!result.ok || !result.level) {
      setErrors(result.errors ?? ["Failed to save map."]);
      setNotice(null);
      return;
    }

    const nextDraft = levelToDraft(result.level);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    setSelectedPresetId(resolvePresetId(nextDraft.waveTemplate));
    setUndoStack([]);
    setRedoStack([]);
    setNotice(`Saved "${result.level.name}". Ready to playtest.`);
    setErrors([]);
  };

  const loadLevel = (level: CustomLevelDefinition): void => {
    const nextDraft = levelToDraft(level);
    const presetId = resolvePresetId(nextDraft.waveTemplate);
    const normalizedDraft =
      nextDraft.waveTemplate === presetId
        ? nextDraft
        : { ...nextDraft, waveTemplate: presetId };
    draftRef.current = normalizedDraft;
    setDraft(normalizedDraft);
    setSelectedPresetId(presetId);
    setUndoStack([]);
    setRedoStack([]);
    setSelection(null);
    setTool("select");
    clearMessages();
  };

  const deleteCurrentDraft = (): void => {
    if (!draft.id) return;
    if (!window.confirm(`Delete "${draft.name || draft.id}"?`)) return;
    onDeleteLevel(draft.id);
    resetDraft();
  };

  const eraseSelection = (): void => {
    if (!selection) return;
    applyDraftUpdate((prev) => removeSelection(prev, selection));
    setSelection(null);
  };

  const startCustomWaves = (): void => {
    applyDraftUpdate((prev) => {
      if (prev.customWaves.length > 0) return prev;
      return { ...prev, customWaves: [[createDefaultWaveGroup()]] };
    });
  };

  const useTemplateWaves = (): void => {
    applyDraftUpdate((prev) => {
      if (prev.customWaves.length === 0) return prev;
      return { ...prev, customWaves: [] };
    });
  };

  const addWave = (): void => {
    applyDraftUpdate((prev) => ({
      ...prev,
      customWaves: [...prev.customWaves, [createDefaultWaveGroup()]],
    }));
  };

  const removeWave = (waveIndex: number): void => {
    applyDraftUpdate((prev) => {
      const nextWaves = prev.customWaves.filter((_, index) => index !== waveIndex);
      return { ...prev, customWaves: nextWaves };
    });
  };

  const addWaveGroup = (waveIndex: number): void => {
    applyDraftUpdate((prev) => {
      const next = prev.customWaves.map((wave, index) =>
        index === waveIndex ? [...wave, createDefaultWaveGroup()] : wave
      );
      return { ...prev, customWaves: next };
    });
  };

  const updateWaveGroup = (
    waveIndex: number,
    groupIndex: number,
    patch: Partial<WaveGroup>
  ): void => {
    applyDraftUpdate((prev) => {
      const wave = prev.customWaves[waveIndex];
      if (!wave) return prev;
      const group = wave[groupIndex];
      if (!group) return prev;
      const nextWaves = [...prev.customWaves];
      const nextWave = [...wave];
      nextWave[groupIndex] = { ...group, ...patch };
      nextWaves[waveIndex] = nextWave;
      return { ...prev, customWaves: nextWaves };
    });
  };

  const removeWaveGroup = (waveIndex: number, groupIndex: number): void => {
    applyDraftUpdate((prev) => {
      const wave = prev.customWaves[waveIndex];
      if (!wave) return prev;
      const nextWave = wave.filter((_, index) => index !== groupIndex);
      const nextWaves = [...prev.customWaves];
      if (nextWave.length === 0) {
        nextWaves.splice(waveIndex, 1);
      } else {
        nextWaves[waveIndex] = nextWave;
      }
      return { ...prev, customWaves: nextWaves };
    });
  };

  const validationStatus = useMemo(() => validateDraft(draft), [draft]);
  const usingCustomWaves = draft.customWaves.length > 0;
  const templateWaves = useMemo(
    () =>
      draft.waveTemplate === DEFAULT_PRESET_ID
        ? createDefaultPresetWaves()
        : LEVEL_WAVES[draft.waveTemplate] ?? [],
    [draft.waveTemplate]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full h-full rounded-2xl border border-amber-700/60 bg-gradient-to-b from-[#20170d] to-[#110b06] text-amber-100 flex flex-col overflow-hidden shadow-[0_0_45px_rgba(0,0,0,0.65)]">
        <div className="px-4 py-3 border-b border-amber-800/50 bg-gradient-to-r from-amber-900/20 via-transparent to-amber-950/20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-wide text-amber-100 inline-flex items-center gap-2">
                <Layers size={18} />
                Creator Sandbox
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/80">
                One workspace for route drawing, drag/drop placement, and live isometric preview.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetDraft}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/60 bg-amber-900/25 px-3 py-2 text-xs hover:bg-amber-800/35"
              >
                <Plus size={14} />
                New Map
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-amber-700/50 bg-amber-900/30 hover:bg-amber-800/45 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
              <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
                <MapPin size={11} />
                Map Name
              </span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Map Name"
                className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2.5 py-1 text-xs outline-none focus:border-amber-400"
              />
            </label>

            <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
              <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
                <Compass size={11} />
                Slug
              </span>
              <input
                value={draft.slug}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, slug: event.target.value }))
                }
                placeholder="slug"
                className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2.5 py-1 text-xs outline-none focus:border-amber-400"
              />
            </label>

            <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
              <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
                <Paintbrush size={11} />
                Theme
              </span>
              <select
                value={draft.theme}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, theme: event.target.value as MapTheme }))
                }
                className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
              >
                {THEME_OPTIONS.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
                  </option>
                ))}
              </select>
            </label>

            <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
              <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
                <Target size={11} />
                Difficulty
              </span>
              <select
                value={draft.difficulty}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    difficulty: Number(event.target.value) as 1 | 2 | 3,
                  }))
                }
                className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
              >
                <option value={1}>Diff 1</option>
                <option value={2}>Diff 2</option>
                <option value={3}>Diff 3</option>
              </select>
            </label>

            <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
              <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
                <Sparkles size={11} />
                Start Points
              </span>
              <input
                type="number"
                min={150}
                max={2500}
                value={draft.startingPawPoints}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    startingPawPoints: Number(event.target.value),
                  }))
                }
                className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
                title="starting paw points"
              />
            </label>

            <label className="rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-2.5">
              <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
                <Swords size={11} />
                Wave Preset
              </span>
              <select
                value={selectedPresetId}
                onChange={(event) => applyMapPreset(event.target.value)}
                className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-2 py-1 text-xs outline-none focus:border-amber-400"
              >
                {waveTemplateOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

          </div>
          <label className="mt-2 block rounded-lg border border-amber-700/60 bg-black/20 px-2.5 pb-1">
            <span className="mb-0.5 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-amber-300/80">
              <Landmark size={11} />
              Level Description
            </span>
            <textarea
              value={draft.description}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Describe encounter flow, objective pressure, and style."
              className="w-full rounded-md border border-amber-700/60 bg-stone-900 px-3 py-1.5 text-xs outline-none focus:border-amber-400 min-h-[42px]"
            />
          </label>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)_360px] gap-3 p-3">
          <aside className="rounded-2xl border border-amber-900/60 bg-black/25 p-3 overflow-y-auto space-y-3">
            <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2 text-xs">
              <div className="text-amber-200 font-medium mb-2 inline-flex items-center gap-1.5">
                <Settings2 size={12} />
                State + Inspector
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] mb-2">
                <div className="rounded border border-amber-900/70 bg-black/25 px-2 py-1">
                  mode: {tool}
                </div>
                <div className="rounded border border-amber-900/70 bg-black/25 px-2 py-1">
                  tile: {hoverPoint ? `${hoverPoint.x},${hoverPoint.y}` : "--,--"}
                </div>
                <div className="rounded border border-amber-900/70 bg-black/25 px-2 py-1 col-span-2 inline-flex items-center gap-1.5">
                  <ActiveToolIcon size={11} />
                  {toolHint[tool]}
                </div>
              </div>

              {selection ? (
                <>
                  <div className="text-amber-300/85 mb-1 inline-flex items-center gap-1.5">
                    <Target size={11} />
                    {selection.kind}
                  </div>
                  <div className="text-amber-400/75 mb-2">
                    {selectedPoint ? `x:${selectedPoint.x}, y:${selectedPoint.y}` : "No point"}
                  </div>

                  {selection.kind === "decoration" && selectedDecoration && (
                    <div className="space-y-1.5 mb-2">
                      <div className="text-amber-300/80 inline-flex items-center gap-1.5">
                        <Paintbrush size={11} />
                        {selectedDecoration.type ?? selectedDecoration.category}
                      </div>
                      <label className="flex items-center gap-2">
                        <span className="text-amber-300/80">size</span>
                        <input
                          type="number"
                          min={0.5}
                          max={8}
                          step={0.1}
                          value={selectedDecoration.size ?? 1}
                          onChange={(event) => {
                            const size = Number(event.target.value);
                            applyDraftUpdate((prev) => {
                              const next = [...prev.decorations];
                              const current = next[selection.index];
                              if (!current) return prev;
                              next[selection.index] = { ...current, size };
                              return { ...prev, decorations: next };
                            });
                          }}
                          className="w-20 rounded border border-amber-700/60 bg-stone-950 px-2 py-1"
                        />
                      </label>
                    </div>
                  )}

                  {selection.kind === "hazard" && selectedHazard && (
                    <div className="space-y-1.5 mb-2">
                      <div className="text-amber-300/80 inline-flex items-center gap-1.5">
                        <AlertTriangle size={11} />
                        {selectedHazard.type}
                      </div>
                      <label className="flex items-center gap-2">
                        <span className="text-amber-300/80">radius</span>
                        <input
                          type="number"
                          min={0.5}
                          max={10}
                          step={0.1}
                          value={selectedHazard.radius ?? 1.5}
                          onChange={(event) => {
                            const radius = Number(event.target.value);
                            applyDraftUpdate((prev) => {
                              const next = [...prev.hazards];
                              const current = next[selection.index];
                              if (!current) return prev;
                              next[selection.index] = { ...current, radius };
                              return { ...prev, hazards: next };
                            });
                          }}
                          className="w-20 rounded border border-amber-700/60 bg-stone-950 px-2 py-1"
                        />
                      </label>
                    </div>
                  )}

                  <button
                    onClick={eraseSelection}
                    className="inline-flex items-center gap-1 rounded-md border border-red-700/60 bg-red-900/25 px-2 py-1 text-[11px]"
                  >
                    <Trash2 size={12} />
                    Remove Selection
                  </button>
                </>
              ) : (
                <div className="text-amber-400/70 inline-flex items-center gap-1.5">
                  <MousePointer2 size={11} />
                  nothing selected
                </div>
              )}
            </div>

            {(errors.length > 0 || notice) && (
              <div className="space-y-2">
                {errors.length > 0 && (
                  <div className="rounded-md border border-red-700/60 bg-red-900/20 p-2 text-xs text-red-200">
                    <div className="inline-flex items-center gap-1 mb-1">
                      <AlertTriangle size={13} />
                      safeguards
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {notice && (
                  <div className="rounded-md border border-emerald-700/60 bg-emerald-900/20 p-2 text-xs text-emerald-200 inline-flex items-center gap-1.5">
                    <Sparkles size={12} />
                    {notice}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2 text-xs">
              <div className="text-amber-200 font-medium mb-1 inline-flex items-center gap-1.5">
                <Swords size={12} />
                Build Actions
              </div>
              <div className="mb-2 inline-flex items-center gap-1.5">
                <Target size={11} />
                {validationStatus.length === 0 ? (
                  <span className="text-emerald-300/90">ready to save</span>
                ) : (
                  <span className="text-orange-300/90">
                    {validationStatus.length} safeguard(s) pending
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <button
                  onClick={saveDraft}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-600/70 bg-emerald-700/25 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-600/30"
                >
                  <Save size={14} />
                  Save Custom Map
                </button>

                <button
                  onClick={() => draft.id && onPlayLevel(draft.id)}
                  disabled={!draft.id}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-blue-600/70 bg-blue-700/25 px-3 py-2 text-sm text-blue-100 hover:bg-blue-600/30 disabled:opacity-50"
                >
                  <Play size={14} />
                  Playtest Map
                </button>

                <button
                  onClick={deleteCurrentDraft}
                  disabled={!draft.id}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-red-700/70 bg-red-900/25 px-3 py-2 text-sm text-red-100 hover:bg-red-800/30 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  Delete Current Map
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2 text-xs">
              <div className="text-amber-200 font-medium mb-1 inline-flex items-center gap-1.5">
                <MapPin size={12} />
                Saved Maps
              </div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {customLevels.length === 0 ? (
                  <div className="rounded-md border border-amber-900/70 bg-black/20 p-2 text-xs text-amber-300/70">
                    no custom maps yet.
                  </div>
                ) : (
                  customLevels.map((level) => (
                    <div
                      key={level.id}
                      className="rounded-md border border-amber-800/40 bg-black/30 p-2"
                    >
                      <div className="text-sm text-amber-100 font-medium truncate">
                        {level.name}
                      </div>
                      <div className="text-[11px] text-amber-400/70 mb-1">
                        {level.theme} • diff {level.difficulty}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => loadLevel(level)}
                          className="rounded border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-[11px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onPlayLevel(level.id)}
                          className="rounded border border-emerald-700/60 bg-emerald-900/25 px-2 py-1 text-[11px]"
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          <section className="rounded-2xl border border-amber-800/50 bg-black/20 p-3 min-h-0 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-xs text-amber-300/80 inline-flex items-center gap-1.5">
                <Compass size={13} />
                Isometric Sandbox
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-end gap-1.5 text-[11px] text-amber-300/80 whitespace-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    onClick={undoDraft}
                    disabled={undoStack.length === 0}
                    className="inline-flex h-7 items-center rounded border border-amber-700/60 bg-stone-900/80 px-2 disabled:opacity-50"
                    title="Undo"
                  >
                    <Undo2 size={12} />

                  </button>
                  <button
                    onClick={redoDraft}
                    disabled={redoStack.length === 0}
                    className="inline-flex h-7 items-center rounded border border-amber-700/60 bg-stone-900/80 px-2 disabled:opacity-50"
                    title="Redo"
                  >
                    <Redo2 size={12} />

                  </button>
                  <button
                    onClick={() => handleToolSelect("erase")}
                    className={`inline-flex h-7 items-center rounded border px-2 ${tool === "erase"
                      ? "border-red-500/80 bg-red-700/20 text-red-100"
                      : "border-amber-700/60 bg-stone-900/80"
                      }`}
                    title="Erase tool"
                  >
                    <Eraser size={12} />

                  </button>
                  <button
                    onClick={() =>
                      setZoom((prev) => clamp(Number((prev - 0.1).toFixed(2)), 0.55, 2.5))
                    }
                    className="inline-flex h-7 items-center justify-center rounded border border-amber-700/60 bg-stone-900/80 px-2"
                    title="Zoom out"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <button
                    onClick={() =>
                      setZoom((prev) => clamp(Number((prev + 0.1).toFixed(2)), 0.55, 2.5))
                    }
                    className="inline-flex h-7 items-center justify-center rounded border border-amber-700/60 bg-stone-900/80 px-2"
                    title="Zoom in"
                  >
                    <ZoomIn size={12} />
                  </button>
                  <span className="inline-flex h-7 w-[60px] items-center justify-center gap-1 rounded border border-amber-900/60 bg-stone-900/70 px-2 text-amber-200 tabular-nums">
                    <ZoomIn size={12} />
                    {Math.round(zoom * 100)}%
                  </span>
                  <span className="inline-flex h-7 items-center gap-1 rounded border border-amber-900/60 bg-stone-900/70 px-2 text-amber-200">
                    <Paintbrush size={12} />
                    {draft.decorations.length}
                  </span>
                  <span className="inline-flex h-7 items-center gap-1 rounded border border-amber-900/60 bg-stone-900/70 px-2 text-amber-200">
                    <AlertTriangle size={12} />
                    {draft.hazards.length}
                  </span>
                  <span className="inline-flex h-7 w-[60px] items-center justify-center gap-1 rounded border border-amber-900/60 bg-stone-900/70 px-2 text-amber-200 tabular-nums">
                    <MapPin size={12} />
                    {formatPointLabel(hoverPoint)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-800/50 bg-stone-950/80 p-2 min-h-0 flex flex-col flex-1">
              <div className="relative w-full flex-1 min-h-[560px]">
                <svg
                  ref={boardRef}
                  viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                  preserveAspectRatio="xMidYMid meet"
                  onPointerDown={handleBoardPointerDown}
                  onPointerMove={handleBoardPointerMove}
                  onPointerUp={handleBoardPointerUp}
                  onPointerLeave={handleBoardPointerLeave}
                  onWheel={handleBoardWheel}
                  onDragEnter={() => setIsBoardDragOver(true)}
                  onDragOver={handleBoardDragOver}
                  onDragLeave={handleBoardDragLeave}
                  onDrop={handleDropOnBoard}
                  className="w-full h-full rounded-lg border border-amber-900/40 bg-[#140f09] cursor-crosshair"
                >
                  <defs>
                    <linearGradient id="isoBoardGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(84,58,24,0.65)" />
                      <stop offset="100%" stopColor="rgba(18,10,4,0.95)" />
                    </linearGradient>
                  </defs>

                  <polygon
                    points={MAP_PLANE_POLYGON}
                    fill="url(#isoBoardGradient)"
                    stroke="rgba(255,180,90,0.35)"
                    strokeWidth={2}
                  />

                  {Array.from({ length: GRID_WIDTH + 1 }).map((_, x) => {
                    const start = gridFloatToIso(x, 0);
                    const end = gridFloatToIso(x, GRID_HEIGHT);
                    return (
                      <line
                        key={`iso-v-${x}`}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="rgba(255,220,140,0.12)"
                        strokeWidth={1}
                      />
                    );
                  })}
                  {Array.from({ length: GRID_HEIGHT + 1 }).map((_, y) => {
                    const start = gridFloatToIso(0, y);
                    const end = gridFloatToIso(GRID_WIDTH, y);
                    return (
                      <line
                        key={`iso-h-${y}`}
                        x1={start.x}
                        y1={start.y}
                        x2={end.x}
                        y2={end.y}
                        stroke="rgba(255,220,140,0.12)"
                        strokeWidth={1}
                      />
                    );
                  })}

                  {isBoardDragOver && (
                    <polygon
                      points={MAP_PLANE_POLYGON}
                      fill="rgba(251,191,36,0.06)"
                      stroke="rgba(251,191,36,0.9)"
                      strokeWidth={2.4}
                      strokeDasharray="7 4"
                    />
                  )}

                  {hoverPoint && (
                    <>
                      <polygon
                        points={getIsoTilePolygon(hoverPoint, 0.08)}
                        fill={
                          hoverIsErase
                            ? "rgba(160, 32, 32, 0.26)"
                            : "rgba(255, 245, 200, 0.18)"
                        }
                        stroke={
                          hoverIsErase
                            ? "rgba(248, 113, 113, 0.98)"
                            : "rgba(255, 255, 255, 0.95)"
                        }
                        strokeWidth={1.6}
                      />
                      <polygon
                        points={getIsoTilePolygon(hoverPoint, -0.05)}
                        fill="none"
                        stroke={
                          hoverIsErase
                            ? "rgba(252, 165, 165, 0.92)"
                            : "rgba(251, 191, 36, 0.94)"
                        }
                        strokeDasharray={hoverIsErase ? "3 2" : "4 3"}
                        strokeWidth={1.2}
                      />
                    </>
                  )}

                  {draft.primaryPath.length >= 2 && (
                    <>
                      <polyline
                        points={pathToIsoPoints(draft.primaryPath)}
                        fill="none"
                        stroke="rgba(251, 191, 36, 0.25)"
                        strokeWidth={primaryPathEmphasized ? 10 : 7.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points={pathToIsoPoints(draft.primaryPath)}
                        fill="none"
                        stroke="rgba(251, 191, 36, 0.96)"
                        strokeWidth={primaryPathEmphasized ? 6.4 : 5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}
                  {draft.secondaryPath.length >= 2 && (
                    <>
                      <polyline
                        points={pathToIsoPoints(draft.secondaryPath)}
                        fill="none"
                        stroke="rgba(34, 211, 238, 0.24)"
                        strokeWidth={secondaryPathEmphasized ? 10 : 7.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <polyline
                        points={pathToIsoPoints(draft.secondaryPath)}
                        fill="none"
                        stroke="rgba(34, 211, 238, 0.96)"
                        strokeWidth={secondaryPathEmphasized ? 6.4 : 5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  )}

                  {draft.primaryPath.map((point, index) => (
                    <IsoMarker
                      key={`p-${index}-${point.x}-${point.y}`}
                      point={point}
                      label={`A${index + 1}`}
                      fill="rgba(251, 191, 36, 0.98)"
                      stroke="rgba(40, 24, 8, 0.95)"
                      selected={targetMatches(selection, "primary_path", index)}
                      highlighted={targetMatches(
                        hoverSelectionTarget,
                        "primary_path",
                        index
                      )}
                      danger={
                        hoverIsErase &&
                        targetMatches(hoverSelectionTarget, "primary_path", index)
                      }
                      onPointerDown={(event) =>
                        startDragTarget({ kind: "primary_path", index }, event)
                      }
                    />
                  ))}

                  {draft.secondaryPath.map((point, index) => (
                    <IsoMarker
                      key={`s-${index}-${point.x}-${point.y}`}
                      point={point}
                      label={`B${index + 1}`}
                      fill="rgba(34, 211, 238, 0.98)"
                      stroke="rgba(7, 41, 52, 0.95)"
                      selected={targetMatches(selection, "secondary_path", index)}
                      highlighted={targetMatches(
                        hoverSelectionTarget,
                        "secondary_path",
                        index
                      )}
                      danger={
                        hoverIsErase &&
                        targetMatches(hoverSelectionTarget, "secondary_path", index)
                      }
                      onPointerDown={(event) =>
                        startDragTarget({ kind: "secondary_path", index }, event)
                      }
                    />
                  ))}

                  {draft.decorations.map((deco, index) => {
                    const decorationType = deco.type ?? deco.category;
                    const isLandmark = Boolean(
                      decorationType && LANDMARK_DECORATION_TYPES.has(decorationType)
                    );
                    return (
                      <IsoMarker
                        key={`d-${index}-${deco.pos.x}-${deco.pos.y}`}
                        point={deco.pos}
                        label={isLandmark ? "L" : "D"}
                        fill={
                          isLandmark
                            ? "rgba(125, 211, 252, 0.96)"
                            : "rgba(250, 244, 224, 0.96)"
                        }
                        stroke={
                          isLandmark
                            ? "rgba(8, 47, 73, 0.95)"
                            : "rgba(45, 34, 20, 0.95)"
                        }
                        selected={targetMatches(selection, "decoration", index)}
                        highlighted={targetMatches(hoverSelectionTarget, "decoration", index)}
                        danger={
                          hoverIsErase &&
                          targetMatches(hoverSelectionTarget, "decoration", index)
                        }
                        onPointerDown={(event) =>
                          startDragTarget({ kind: "decoration", index }, event)
                        }
                      />
                    );
                  })}

                  {draft.hazards.map((hazard, index) => {
                    const point = (hazard.pos as GridPoint | undefined) ?? hazard.gridPos;
                    if (!point) return null;
                    return (
                      <IsoMarker
                        key={`h-${index}-${point.x}-${point.y}`}
                        point={point}
                        label="H"
                        fill="rgba(248, 113, 113, 0.96)"
                        stroke="rgba(66, 13, 13, 0.95)"
                        selected={targetMatches(selection, "hazard", index)}
                        highlighted={targetMatches(hoverSelectionTarget, "hazard", index)}
                        danger={
                          hoverIsErase &&
                          targetMatches(hoverSelectionTarget, "hazard", index)
                        }
                        onPointerDown={(event) =>
                          startDragTarget({ kind: "hazard", index }, event)
                        }
                      />
                    );
                  })}

                  {draft.heroSpawn && (
                    <IsoMarker
                      point={draft.heroSpawn}
                      label="Hero"
                      fill="rgba(52, 211, 153, 0.98)"
                      stroke="rgba(7, 40, 30, 0.95)"
                      selected={targetMatches(selection, "hero_spawn")}
                      highlighted={targetMatches(hoverSelectionTarget, "hero_spawn")}
                      danger={hoverIsErase && targetMatches(hoverSelectionTarget, "hero_spawn")}
                      onPointerDown={(event) => startDragTarget({ kind: "hero_spawn" }, event)}
                    />
                  )}

                  {draft.specialTowerPos && (
                    <IsoMarker
                      point={draft.specialTowerPos}
                      label="OBJ"
                      fill="rgba(217, 70, 239, 0.98)"
                      stroke="rgba(60, 16, 74, 0.95)"
                      selected={targetMatches(selection, "special_tower")}
                      highlighted={targetMatches(hoverSelectionTarget, "special_tower")}
                      danger={
                        hoverIsErase && targetMatches(hoverSelectionTarget, "special_tower")
                      }
                      onPointerDown={(event) =>
                        startDragTarget({ kind: "special_tower" }, event)
                      }
                    />
                  )}
                </svg>

                <div className="absolute top-3 left-3 z-10 pointer-events-none inline-flex items-center gap-1.5 rounded-md border border-amber-700/65 bg-stone-950/80 px-2 py-1 text-[11px] text-amber-200">
                  <ActiveToolIcon size={12} />
                  {toolHint[tool]}
                </div>
                <div className="absolute top-3 right-3 z-10 pointer-events-none inline-flex items-center gap-1.5 rounded-md border border-amber-700/65 bg-stone-950/80 px-2 py-1 text-[11px] text-amber-200">
                  <Compass size={12} />
                  wheel +/- to zoom, alt+drag to pan
                </div>
              </div>
            </div>
          </section>

          <aside className="rounded-2xl border border-amber-900/60 bg-black/25 p-3 overflow-y-auto space-y-3">
            <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2">
              <div className="text-xs uppercase tracking-wider text-amber-200 mb-2 inline-flex items-center gap-1.5">
                <Compass size={12} />
                Toolbelt
              </div>
              <div className="space-y-1.5">
                {TOOL_OPTIONS.map((entry) => {
                  const Icon = entry.icon;
                  const isActive = tool === entry.key;
                  const toolComplete = isToolComplete(entry.key);
                  const toolAnchorPoint = getToolAnchorPoint(entry.key);
                  const hasCoordinates = Boolean(toolAnchorPoint);
                  const isPathTool =
                    entry.key === "path_primary" || entry.key === "path_secondary";
                  const pathNodeCount =
                    entry.key === "path_primary"
                      ? draft.primaryPath.length
                      : entry.key === "path_secondary"
                        ? draft.secondaryPath.length
                        : 0;
                  const pathReady = pathNodeCount >= 4;
                  const showPlaced =
                    !isPathTool && entry.key !== "select" && toolComplete && hasCoordinates;
                  const showRequired = !isPathTool && entry.key !== "select" && !showPlaced;
                  return (
                    <button
                      key={entry.key}
                      onClick={() => handleToolSelect(entry.key)}
                      className={`w-full rounded-lg border px-2.5 py-2 text-xs transition-colors ${isActive
                        ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
                        : "border-amber-900/60 bg-stone-900/70 text-amber-300/80 hover:bg-stone-800/80"
                        }`}
                    >
                      <span className="inline-flex w-full items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-2">
                          <Icon size={14} />
                          {entry.label}
                        </span>
                        {entry.key === "select" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-300/80">
                            <Target size={11} />
                            selecting: {selectionSummary}
                          </span>
                        ) : isPathTool ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${pathReady
                              ? "border-emerald-500/70 bg-emerald-900/25 text-emerald-200"
                              : "border-orange-500/70 bg-orange-900/30 text-orange-200"
                              }`}
                          >
                            {pathReady ? <CheckCircle2 size={11} /> : <CircleAlert size={11} />}
                            {pathReady ? `${pathNodeCount} nodes` : `${pathNodeCount}/4 nodes`}
                          </span>
                        ) : showRequired ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/70 bg-orange-900/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-orange-200">
                            <CircleAlert size={11} />
                            required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-900/25 px-2 py-0.5 text-[10px] text-emerald-200">
                            <CheckCircle2 size={11} />
                            Placed at {formatPointLabel(toolAnchorPoint)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2">
              <div className="text-xs uppercase tracking-wider text-amber-200 mb-2 inline-flex items-center gap-1.5">
                <Wand2 size={12} />
                Palette
              </div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <button
                  onClick={() => {
                    setPaletteKind("decoration");
                    handleToolSelect("decoration");
                  }}
                  className={`rounded-md border px-2 py-1 text-[11px] inline-flex items-center justify-center gap-1 ${paletteKind === "decoration"
                    ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
                    : "border-amber-900/60 bg-stone-900/70 text-amber-300/80"
                    }`}
                >
                  <Paintbrush size={11} />
                  Deco
                </button>
                <button
                  onClick={() => {
                    setPaletteKind("landmark");
                    handleToolSelect("landmark");
                  }}
                  className={`rounded-md border px-2 py-1 text-[11px] inline-flex items-center justify-center gap-1 ${paletteKind === "landmark"
                    ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
                    : "border-amber-900/60 bg-stone-900/70 text-amber-300/80"
                    }`}
                >
                  <Landmark size={11} />
                  Landmark
                </button>
                <button
                  onClick={() => {
                    setPaletteKind("hazard");
                    handleToolSelect("hazard");
                  }}
                  className={`rounded-md border px-2 py-1 text-[11px] inline-flex items-center justify-center gap-1 ${paletteKind === "hazard"
                    ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
                    : "border-amber-900/60 bg-stone-900/70 text-amber-300/80"
                    }`}
                >
                  <AlertTriangle size={11} />
                  Hazard
                </button>
              </div>

              <div className="mb-2 flex gap-2">
                <label className="relative flex-[3]">
                  <Search
                    size={12}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-400/70"
                  />
                  <input
                    value={paletteSearch}
                    onChange={(event) => setPaletteSearch(event.target.value)}
                    placeholder="search assets"
                    className="w-full rounded-md border border-amber-700/60 bg-stone-950 pl-7 pr-2 py-1.5 text-xs outline-none focus:border-amber-400"
                  />
                </label>
                <select
                  value={selectedPresetId}
                  onChange={(event) => applyMapPreset(event.target.value)}
                  className="flex-1 rounded-md border border-amber-700/60 bg-stone-950 px-2 py-1 text-xs"
                >
                  {waveTemplateOptions.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="max-h-44 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-1">
                  {paletteOptions.length === 0 ? (
                    <div className="col-span-2 rounded border border-amber-900/60 bg-black/20 p-2 text-[11px] text-amber-300/70">
                      no matches.
                    </div>
                  ) : (
                    paletteOptions.map((option) => (
                      <AssetChip
                        key={`${paletteKind}-${option}`}
                        label={option}
                        icon={React.createElement(paletteIcon, { size: 11 })}
                        active={
                          (paletteKind === "decoration" &&
                            selectedDecorationType === option) ||
                          (paletteKind === "landmark" &&
                            selectedLandmarkType === option) ||
                          (paletteKind === "hazard" && selectedHazardType === option)
                        }
                        onSelect={() => {
                          if (paletteKind === "decoration") {
                            setSelectedDecorationType(option as DecorationCategory);
                            handleToolSelect("decoration");
                          } else if (paletteKind === "landmark") {
                            setSelectedLandmarkType(option as DecorationCategory);
                            handleToolSelect("landmark");
                          } else {
                            setSelectedHazardType(option as HazardType);
                            handleToolSelect("hazard");
                          }
                        }}
                        dragPayload={{ kind: paletteKind, value: option }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2 text-xs">
              <div className="text-amber-200 font-medium mb-1 inline-flex items-center gap-1.5">
                <Sparkles size={12} />
                Objective
              </div>
              <label className="inline-flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={draft.specialTowerEnabled}
                  onChange={(event) =>
                    applyDraftUpdate((prev) => ({
                      ...prev,
                      specialTowerEnabled: event.target.checked,
                    }))
                  }
                />
                enabled
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  value={draft.specialTowerType}
                  onChange={(event) =>
                    applyDraftUpdate((prev) => ({
                      ...prev,
                      specialTowerType: event.target.value as SpecialTowerType,
                    }))
                  }
                  className="rounded border border-amber-700/60 bg-stone-950 px-2 py-1"
                >
                  {SPECIAL_TOWER_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {draft.specialTowerType === "vault" ? (
                  <input
                    type="number"
                    min={1}
                    max={3000}
                    value={draft.specialTowerHp}
                    onChange={(event) =>
                      applyDraftUpdate((prev) => ({
                        ...prev,
                        specialTowerHp: Number(event.target.value),
                      }))
                    }
                    className="rounded border border-amber-700/60 bg-stone-950 px-2 py-1"
                  />
                ) : (
                  <div className="rounded border border-amber-900/60 bg-black/25 px-2 py-1 text-amber-400/80 inline-flex items-center gap-1.5">
                    <Shield size={11} />
                    hp auto
                  </div>
                )}
              </div>
              <div className="rounded border border-amber-900/60 bg-black/25 px-2 py-1.5 mb-2 text-[11px] text-amber-300/85 space-y-1">
                <div className="inline-flex items-center gap-1.5">
                  <MapPin size={11} />
                  {draft.specialTowerPos
                    ? `placed at ${draft.specialTowerPos.x},${draft.specialTowerPos.y}`
                    : "not placed yet"}
                </div>
                <div className="inline-flex items-start gap-1.5">
                  <Sparkles size={11} className="mt-[1px]" />
                  <span>{OBJECTIVE_TYPE_STATS[draft.specialTowerType].effect}</span>
                </div>
                <div className="inline-flex items-start gap-1.5">
                  <AlertTriangle size={11} className="mt-[1px]" />
                  <span>{OBJECTIVE_TYPE_STATS[draft.specialTowerType].risk}</span>
                </div>
              </div>
              <div className="rounded border border-fuchsia-700/60 bg-fuchsia-900/20 px-2 py-1.5 text-[11px] text-fuchsia-100 inline-flex items-center gap-1.5">
                <Shield size={11} />
                Select `Objective` in toolbelt, then click map to place or move it.
              </div>
              <div className="mt-1 text-[10px] text-amber-400/80 inline-flex items-center gap-1.5">
                <AlertTriangle size={10} />
                gameplay currently supports one active objective.
              </div>
            </div>

            <div className="rounded-xl border border-amber-800/40 bg-stone-900/70 p-2 text-xs">
              <div className="text-amber-200 font-medium mb-1 inline-flex items-center gap-1.5">
                <Swords size={12} />
                Enemy / Wave Designer
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={startCustomWaves}
                  className={`rounded border px-2 py-1 text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors ${usingCustomWaves
                    ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
                    : "border-amber-700/60 bg-stone-900/70 text-amber-300/85 hover:bg-stone-800/80"
                    }`}
                >
                  <Wand2 size={11} />
                  Build Custom
                </button>
                <button
                  onClick={useTemplateWaves}
                  className={`rounded border px-2 py-1 text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors ${usingCustomWaves
                    ? "border-amber-700/60 bg-stone-900/70 text-amber-300/85 hover:bg-stone-800/80"
                    : "border-emerald-500/70 bg-emerald-600/20 text-emerald-100"
                    }`}
                >
                  <Route size={11} />
                  Use Template
                </button>
              </div>
              <div className="mb-2 rounded border border-amber-900/60 bg-black/20 px-2 py-1 text-[11px] text-amber-300/80 inline-flex items-center gap-1.5">
                <Route size={11} />
                {usingCustomWaves
                  ? `custom waves active (${draft.customWaves.length})`
                  : `template: ${draft.waveTemplate}`}
              </div>

              {!usingCustomWaves ? (
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-[11px] text-amber-400/80 inline-flex items-center gap-1.5 mb-1">
                      <Target size={11} />
                      wave template
                    </span>
                    <select
                      value={selectedPresetId}
                      onChange={(event) =>
                        applyMapPreset(event.target.value)
                      }
                      className="w-full rounded border border-amber-700/60 bg-stone-950 px-2 py-1 text-xs"
                    >
                      {waveTemplateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {templateWaves.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto pr-1 space-y-1.5">
                      {templateWaves.map((wave, waveIndex) => (
                        <div
                          key={`template-wave-${waveIndex}`}
                          className="rounded border border-amber-900/60 bg-black/20 p-2"
                        >
                          <div className="mb-1.5 text-[11px] text-amber-200 inline-flex items-center gap-1.5">
                            <Target size={11} />
                            Wave {waveIndex + 1}
                          </div>
                          <div className="space-y-1">
                            {wave.map((group, groupIndex) => (
                              <div
                                key={`template-wave-${waveIndex}-group-${groupIndex}`}
                                className="grid grid-cols-[minmax(0,1fr)_44px_62px_56px] gap-1 rounded border border-amber-900/50 bg-stone-950/60 px-1.5 py-1 text-[10px]"
                              >
                                <span className="text-amber-100 truncate">{group.type}</span>
                                <span className="text-amber-300/90 text-right">
                                  x{group.count}
                                </span>
                                <span className="text-amber-300/80 text-right">
                                  {group.interval}ms
                                </span>
                                <span className="text-amber-400/75 text-right">
                                  {group.delay ? `+${group.delay}` : "start"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded border border-amber-900/60 bg-black/20 p-2 text-[11px] text-amber-300/75 inline-flex items-center gap-1.5">
                      <AlertTriangle size={11} />
                      no wave plan found for this preset.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {draft.customWaves.map((wave, waveIndex) => (
                    <div
                      key={`wave-${waveIndex}`}
                      className="rounded border border-amber-900/60 bg-black/20 p-2"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[11px] text-amber-200 inline-flex items-center gap-1.5">
                          <Target size={11} />
                          Wave {waveIndex + 1}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => addWaveGroup(waveIndex)}
                            className="rounded border border-amber-700/60 bg-amber-900/25 px-1.5 py-0.5 text-[10px]"
                          >
                            + Group
                          </button>
                          <button
                            onClick={() => removeWave(waveIndex)}
                            className="rounded border border-red-700/60 bg-red-900/25 px-1.5 py-0.5 text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {wave.map((group, groupIndex) => (
                          <div
                            key={`wave-${waveIndex}-group-${groupIndex}`}
                            className="grid grid-cols-[minmax(0,1fr)_64px_74px_56px_24px] gap-1"
                          >
                            <select
                              value={group.type}
                              onChange={(event) =>
                                updateWaveGroup(waveIndex, groupIndex, {
                                  type: event.target.value as EnemyType,
                                })
                              }
                              className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                            >
                              {ENEMY_OPTIONS.map((enemyType) => (
                                <option key={enemyType} value={enemyType}>
                                  {enemyType}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min={1}
                              max={500}
                              value={group.count}
                              onChange={(event) =>
                                updateWaveGroup(waveIndex, groupIndex, {
                                  count: Math.max(1, Number(event.target.value)),
                                })
                              }
                              className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                              title="count"
                            />
                            <input
                              type="number"
                              min={80}
                              max={5000}
                              value={group.interval}
                              onChange={(event) =>
                                updateWaveGroup(waveIndex, groupIndex, {
                                  interval: Math.max(80, Number(event.target.value)),
                                })
                              }
                              className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                              title="interval ms"
                            />
                            <input
                              type="number"
                              min={0}
                              max={15000}
                              value={group.delay ?? 0}
                              onChange={(event) =>
                                updateWaveGroup(waveIndex, groupIndex, {
                                  delay: Math.max(0, Number(event.target.value)),
                                })
                              }
                              className="rounded border border-amber-700/60 bg-stone-950 px-1.5 py-1 text-[10px]"
                              title="delay ms"
                            />
                            <button
                              onClick={() => removeWaveGroup(waveIndex, groupIndex)}
                              className="rounded border border-red-700/60 bg-red-900/25 text-[10px]"
                              title="remove group"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addWave}
                    className="w-full rounded border border-amber-700/60 bg-amber-900/25 px-2 py-1 text-[11px]"
                  >
                    + Add Wave
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const AssetChip: React.FC<{
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onSelect: () => void;
  dragPayload: PaletteDragPayload;
}> = ({ label, icon, active, onSelect, dragPayload }) => {
  return (
    <button
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/princeton-td-asset",
          JSON.stringify(dragPayload)
        );
      }}
      onClick={onSelect}
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] cursor-grab active:cursor-grabbing ${active
        ? "border-amber-400/80 bg-amber-500/20 text-amber-100"
        : "border-amber-900/60 bg-stone-900/70 text-amber-300/80 hover:bg-stone-800/80"
        }`}
      title="drag onto sandbox"
    >
      {icon}
      {label}
    </button>
  );
};

const IsoMarker: React.FC<{
  point: GridPoint;
  label: string;
  fill: string;
  stroke: string;
  selected: boolean;
  highlighted?: boolean;
  danger?: boolean;
  onPointerDown: (event: React.PointerEvent<SVGGElement>) => void;
}> = ({
  point,
  label,
  fill,
  stroke,
  selected,
  highlighted = false,
  danger = false,
  onPointerDown,
}) => {
    const isoPoint = gridToIso(point);
    const markerRadius = label.length > 2 ? 12 : 9;
    const hasEmphasis = selected || highlighted;
    const auraFill = danger
      ? "rgba(248, 113, 113, 0.30)"
      : selected
        ? "rgba(255,255,255,0.24)"
        : "rgba(251, 191, 36, 0.22)";
    const ringStroke = danger
      ? "rgba(252, 165, 165, 0.96)"
      : selected
        ? "rgba(255,255,255,0.96)"
        : "rgba(253, 230, 138, 0.9)";
    return (
      <g
        onPointerDown={onPointerDown}
        transform={`translate(${isoPoint.x}, ${isoPoint.y - 7})`}
        className="cursor-grab active:cursor-grabbing"
        role="button"
        aria-label={label}
      >
        <circle
          cx={0}
          cy={0}
          r={markerRadius + (selected ? 4.2 : highlighted ? 3.3 : 0)}
          fill={hasEmphasis ? auraFill : "transparent"}
        />
        <circle
          cx={0}
          cy={0}
          r={markerRadius + (selected ? 2.3 : highlighted ? 1.5 : 0)}
          fill="none"
          stroke={hasEmphasis ? ringStroke : "transparent"}
          strokeWidth={1.5}
          strokeDasharray={selected ? undefined : "3 2"}
        />
        <circle
          cx={0}
          cy={0}
          r={markerRadius}
          fill={fill}
          stroke={stroke}
          strokeWidth={selected ? 2.8 : highlighted ? 2.1 : 1.6}
        />
        <text
          x={0}
          y={1}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={label.length > 2 ? 8 : 10}
          fontWeight={700}
          fill="rgba(16,10,2,0.9)"
        >
          {label}
        </text>
      </g>
    );
  };

export default CustomLevelCreatorModal;
