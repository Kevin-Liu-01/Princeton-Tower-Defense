import type { MutableRefObject, RefObject } from "react";
import type { LevelStars } from "../../../../types";
import type { LevelNode } from "../worldMapData";

export interface StaticBgCache {
  canvas: HTMLCanvasElement | null;
  w: number;
  h: number;
}

export interface DecorationCache {
  groundCanvas: HTMLCanvasElement | null;
  structureCanvas: HTMLCanvasElement | null;
  w: number;
  h: number;
  timeBucket: number;
}

export interface FogOverlayCache {
  canvas: HTMLCanvasElement | null;
  w: number;
  h: number;
}

export interface PathCache {
  canvas: HTMLCanvasElement | null;
  w: number;
  h: number;
  timeBucket: number;
  unlockedKey: string;
}

export interface NodeCache {
  canvas: HTMLCanvasElement | null;
  w: number;
  h: number;
  timeBucket: number;
  hoveredLevel: string | null;
  selectedLevel: string | null;
  starsKey: string;
  unlockedKey: string;
}

export interface DrawWorldMapParams {
  canvasRef: RefObject<HTMLCanvasElement>;
  mapHeight: number;
  containerWidth: number;
  hoveredLevel: string | null;
  selectedLevel: string | null;
  levelStars: LevelStars;
  unlockedMaps: string[];
  imageCache: MutableRefObject<Record<string, HTMLImageElement>>;
  lastCanvasSizeRef: MutableRefObject<{ w: number; h: number }>;
  animTimeRef: MutableRefObject<number>;
  levels?: LevelNode[];
  isMobile?: boolean;
  staticBgCache?: MutableRefObject<StaticBgCache>;
  decorationCache?: MutableRefObject<DecorationCache>;
  fogOverlayCache?: MutableRefObject<FogOverlayCache>;
  pathCache?: MutableRefObject<PathCache>;
  nodeCache?: MutableRefObject<NodeCache>;
}
