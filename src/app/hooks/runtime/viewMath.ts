import type { MutableRefObject, RefObject } from "react";
import type { Position, SpecialTower } from "../../types";
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from "../../constants";

export function getSpecialTowerKeyImpl(
  selectedMap: string,
  tower: Pick<SpecialTower, "type" | "pos">,
): string {
  return `${selectedMap}:${tower.type}:${tower.pos.x.toFixed(2)}:${tower.pos.y.toFixed(2)}`;
}

export function clampWorldToMapBoundsImpl(worldPos: Position): Position {
  const min = TILE_SIZE * 0.5;
  const maxX = GRID_WIDTH * TILE_SIZE - TILE_SIZE * 0.5;
  const maxY = GRID_HEIGHT * TILE_SIZE - TILE_SIZE * 0.5;
  return {
    x: Math.max(min, Math.min(maxX, worldPos.x)),
    y: Math.max(min, Math.min(maxY, worldPos.y)),
  };
}

export function getRandomMapTargetImpl(): Position {
  const margin = TILE_SIZE;
  const minX = margin;
  const minY = margin;
  const maxX = GRID_WIDTH * TILE_SIZE - margin;
  const maxY = GRID_HEIGHT * TILE_SIZE - margin;
  return {
    x: minX + Math.random() * Math.max(1, maxX - minX),
    y: minY + Math.random() * Math.max(1, maxY - minY),
  };
}

export function getRenderDprImpl(renderDprCap: number): number {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio || 1, renderDprCap);
}

export function getCanvasDimensionsImpl(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  renderDprCap: number,
): { width: number; height: number; dpr: number } {
  const canvas = canvasRef.current;
  const dpr = getRenderDprImpl(renderDprCap);
  return {
    width: canvas ? canvas.width : 1000,
    height: canvas ? canvas.height : 600,
    dpr,
  };
}
