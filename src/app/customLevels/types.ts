import type {
  MapDecoration,
  MapHazard,
  MapTheme,
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
  decorations?: MapDecoration[];
  hazards?: MapHazard[];
}

export interface CustomLevelUpsertResult {
  ok: boolean;
  level?: CustomLevelDefinition;
  errors?: string[];
}
