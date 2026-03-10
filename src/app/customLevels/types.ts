import type {
  MapDecoration,
  MapHazard,
  MapTheme,
  TowerType,
  WaveGroup,
  SpecialTowerType,
} from "../types";

export interface GridPoint {
  x: number;
  y: number;
}

export interface CustomSpecialTowerConfig {
  pos: GridPoint;
  type: SpecialTowerType;
  hp?: number;
}

export interface CustomPlacedTowerConfig {
  pos: GridPoint;
  type: TowerType;
}

export interface CustomLevelDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  theme: MapTheme;
  difficulty: 1 | 2 | 3;
  startingPawPoints: number;
  waveTemplate: string;
  customWaves?: WaveGroup[][];
  primaryPath: GridPoint[];
  secondaryPath?: GridPoint[];
  heroSpawn?: GridPoint;
  specialTower?: CustomSpecialTowerConfig;
  specialTowers?: CustomSpecialTowerConfig[];
  placedTowers?: CustomPlacedTowerConfig[];
  allowedTowers?: TowerType[];
  decorations: MapDecoration[];
  hazards: MapHazard[];
  createdAt: number;
  updatedAt: number;
}

export interface CustomLevelDraftInput {
  id?: string;
  slug: string;
  name: string;
  description: string;
  theme: MapTheme;
  difficulty: 1 | 2 | 3;
  startingPawPoints: number;
  waveTemplate: string;
  customWaves?: WaveGroup[][];
  primaryPath: GridPoint[];
  secondaryPath?: GridPoint[];
  heroSpawn?: GridPoint;
  specialTower?: CustomSpecialTowerConfig;
  specialTowers?: CustomSpecialTowerConfig[];
  placedTowers?: CustomPlacedTowerConfig[];
  allowedTowers?: TowerType[];
  decorations?: MapDecoration[];
  hazards?: MapHazard[];
}

export interface CustomLevelUpsertResult {
  ok: boolean;
  level?: CustomLevelDefinition;
  errors?: string[];
}
