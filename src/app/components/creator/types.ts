import type {
  DecorationCategory,
  EnemyType,
  HazardType,
  MapDecoration,
  MapHazard,
  MapTheme,
  SpecialTowerType,
  TowerType,
  WaveGroup,
} from "../../types";
import type {
  CustomLevelDefinition,
  CustomLevelDraftInput,
  CustomLevelUpsertResult,
  CustomPlacedTowerConfig,
  CustomSpecialTowerConfig,
  GridPoint,
} from "../../customLevels/types";
import type { LucideIcon } from "lucide-react";

export type { GridPoint };

export interface CreatorDraftState {
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
  specialTowers: CustomSpecialTowerConfig[];
  placedTowers: CustomPlacedTowerConfig[];
  allowedTowers: TowerType[];
  decorations: MapDecoration[];
  hazards: MapHazard[];
}

export type ToolMode =
  | "select"
  | "path_primary"
  | "path_secondary"
  | "hero_spawn"
  | "special_tower"
  | "tower"
  | "decoration"
  | "landmark"
  | "hazard"
  | "erase";

export type SelectionTarget =
  | { kind: "primary_path"; index: number }
  | { kind: "secondary_path"; index: number }
  | { kind: "hero_spawn" }
  | { kind: "special_tower"; index: number }
  | { kind: "tower"; index: number }
  | { kind: "decoration"; index: number }
  | { kind: "hazard"; index: number };

export interface PaletteDragPayload {
  kind: "decoration" | "landmark" | "hazard" | "objective" | "tower";
  value: string;
}

export interface ToolOption {
  key: ToolMode;
  label: string;
  icon: LucideIcon;
}

export interface MapPresetTemplate {
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

export interface ObjectiveTypeStats {
  title: string;
  effect: string;
  risk: string;
}

export interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customLevels: CustomLevelDefinition[];
  onSaveLevel: (draft: CustomLevelDraftInput) => CustomLevelUpsertResult;
  onDeleteLevel: (levelId: string) => void;
  onPlayLevel: (levelId: string) => void;
}

export interface BoardRenderMetrics {
  rect: DOMRect;
  renderWidth: number;
  renderHeight: number;
  offsetX: number;
  offsetY: number;
}
