// Princeton Tower Defense - Landmark Rendering Wrappers
// Provides standalone landmark render functions used by decorations/index.ts.
// The actual rendering logic lives in renderDecorationItem.ts switch cases;
// these wrappers delegate to it with the appropriate params.

import { renderDecorationItem } from "./renderDecorationItem";
import type { DecorationType } from "../../types";

function renderLandmark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  type: DecorationType,
  variant: number,
  time: number,
): void {
  renderDecorationItem({
    ctx,
    screenPos: { x, y },
    scale,
    type,
    rotation: 0,
    variant,
    decorTime: time,
    decorX: x,
    decorY: y,
    selectedMap: "",
  });
}

export function drawPyramid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  variant: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "pyramid", variant, time);
}

export function drawSphinx(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  isGiant: boolean,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, isGiant ? "giant_sphinx" : "sphinx", 0, time);
}

export function drawNassauHall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "nassau_hall", 0, time);
}

export function drawGlacier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "glacier", 0, time);
}

export function drawFortress(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "fortress", 0, time);
}

export function drawIceThrone(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "ice_throne", 0, time);
}

export function drawObsidianCastle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "obsidian_castle", 0, time);
}

export function drawWitchCottage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "witch_cottage", 0, time);
}

export function drawCannonCrest(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "cannon_crest", 0, time);
}

export function drawIvyCrossroads(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "ivy_crossroads", 0, time);
}

export function drawBlightBasin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "blight_basin", 0, time);
}

export function drawTriadKeep(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "triad_keep", 0, time);
}

export function drawSunscorchLabyrinth(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "sunscorch_labyrinth", 0, time);
}

export function drawFrontierOutpost(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "frist_outpost", 0, time);
}

export function drawAshenSpiral(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number,
): void {
  renderLandmark(ctx, x, y, scale, "ashen_spiral", 0, time);
}
