export interface WorldMapDrawContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  isMobile: boolean;
  time: number;
  getY: (pct: number) => number;
  getLevelY: (pct: number) => number;
  seededRandom: (seed: number) => number;
}
