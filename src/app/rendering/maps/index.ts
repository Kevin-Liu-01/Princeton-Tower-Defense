import type { Position } from "../../types";

// Legacy export kept for compatibility with the rendering barrel.
// Path rendering now happens in the runtime static-layer pipeline.
export function renderPath(
  _ctx: CanvasRenderingContext2D,
  _points: Position[]
): void {
  void _ctx;
  void _points;
}

export { renderStaticMapLayer, type StaticMapFogEndpoint } from "./staticLayer";
