// =============================================================================
// DAMAGE NUMBER RENDERING
// Canvas-drawn floating damage numbers that appear when enemies take damage.
// Gated by the user's damageNumbers setting ("off" | "simple" | "animated").
// =============================================================================

import { ISO_Y_RATIO } from "../../constants";
import type { DamageNumberStyle } from "../../constants/settings";
import type { Position } from "../../types";
import { worldToScreen } from "../../utils";
import { drawOutlinedText } from "../helpers";

// -----------------------------------------------------------------------------
// Damage Event Queue
// -----------------------------------------------------------------------------

export interface DamageNumberEvent {
  id: string;
  worldPos: Position;
  amount: number;
  isCritical: boolean;
  source: "tower" | "hero" | "troop" | "spell" | "burn" | "aoe";
  spawnTime: number;
  duration: number;
}

const MAX_ACTIVE = 40;
const SIMPLE_DURATION = 600;
const ANIMATED_DURATION = 1000;

let eventIdCounter = 0;
const activeEvents: DamageNumberEvent[] = [];

export function emitDamageNumber(
  worldPos: Position,
  amount: number,
  source: DamageNumberEvent["source"],
  isCritical: boolean = false
): void {
  if (amount <= 0) {
    return;
  }

  const event: DamageNumberEvent = {
    amount: Math.round(amount),
    duration: ANIMATED_DURATION,
    id: `dmg-${++eventIdCounter}`,
    isCritical,
    source,
    spawnTime: performance.now(),
    worldPos: { ...worldPos },
  };

  activeEvents.push(event);
  if (activeEvents.length > MAX_ACTIVE) {
    activeEvents.splice(0, activeEvents.length - MAX_ACTIVE);
  }
}

export function clearDamageNumbers(): void {
  activeEvents.length = 0;
}

// -----------------------------------------------------------------------------
// Color mapping by source
// -----------------------------------------------------------------------------

const SOURCE_COLORS: Record<DamageNumberEvent["source"], string> = {
  aoe: "#ff4444",
  burn: "#ff6b35",
  hero: "#ffd700",
  spell: "#c084fc",
  tower: "#6db8ff",
  troop: "#ffb366",
};

const CRITICAL_COLOR = "#ff2222";

// -----------------------------------------------------------------------------
// Render
// -----------------------------------------------------------------------------

export function renderDamageNumbers(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  style: DamageNumberStyle,
  cameraOffset?: Position,
  cameraZoom?: number
): void {
  if (style === "off" || activeEvents.length === 0) {
    return;
  }

  const now = performance.now();
  const zoom = cameraZoom ?? 1;
  const isAnimated = style === "animated";
  const maxDur = isAnimated ? ANIMATED_DURATION : SIMPLE_DURATION;

  ctx.save();

  let writeIdx = 0;
  for (let i = 0; i < activeEvents.length; i++) {
    const ev = activeEvents[i];
    const elapsed = now - ev.spawnTime;
    if (elapsed >= maxDur) {
      continue;
    }

    activeEvents[writeIdx++] = ev;
    const t = elapsed / maxDur; // 0→1

    const screenPos = worldToScreen(
      ev.worldPos,
      canvasWidth,
      canvasHeight,
      dpr,
      cameraOffset,
      cameraZoom
    );

    const baseColor = ev.isCritical ? CRITICAL_COLOR : SOURCE_COLORS[ev.source];

    if (isAnimated) {
      renderAnimatedDamageNumber(ctx, screenPos, ev, t, zoom, baseColor);
    } else {
      renderSimpleDamageNumber(ctx, screenPos, ev, t, zoom, baseColor);
    }
  }
  activeEvents.length = writeIdx;

  ctx.restore();
}

function renderSimpleDamageNumber(
  ctx: CanvasRenderingContext2D,
  screen: Position,
  ev: DamageNumberEvent,
  t: number,
  zoom: number,
  color: string
): void {
  const alpha = 1 - t;
  const offsetY = -t * 25 * zoom;

  ctx.globalAlpha = alpha;
  const fontSize = (ev.isCritical ? 16 : 13) * zoom;
  drawOutlinedText(
    ctx,
    `-${ev.amount}`,
    screen.x,
    screen.y + offsetY,
    fontSize,
    color,
    "#000",
    2 * zoom
  );
  ctx.globalAlpha = 1;
}

function renderAnimatedDamageNumber(
  ctx: CanvasRenderingContext2D,
  screen: Position,
  ev: DamageNumberEvent,
  t: number,
  zoom: number,
  color: string
): void {
  // Phase 1: pop up and scale (0→0.15)
  // Phase 2: float and fade (0.15→1)
  const popPhase = Math.min(t / 0.15, 1);
  const fadePhase = Math.max(0, (t - 0.15) / 0.85);

  const scale = ev.isCritical
    ? 1 + Math.sin(popPhase * Math.PI) * 0.4
    : 1 + Math.sin(popPhase * Math.PI) * 0.2;

  const alpha = 1 - fadePhase * fadePhase;

  // Rise trajectory: fast then slow (ease-out)
  const rise = (1 - (1 - t) ** 2) * 40 * zoom;
  // Slight horizontal drift for crits
  const drift = ev.isCritical ? Math.sin(t * 4) * 6 * zoom : 0;

  const x = screen.x + drift;
  const y = screen.y - rise;

  ctx.globalAlpha = Math.max(0, alpha);

  const baseFontSize = ev.isCritical ? 18 : 14;
  const fontSize = baseFontSize * zoom * scale;
  const text = ev.isCritical ? `${ev.amount}!` : `-${ev.amount}`;

  // Glow for critical hits
  if (ev.isCritical && popPhase < 1) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * zoom * (1 - popPhase);
  }

  drawOutlinedText(ctx, text, x, y, fontSize, color, "#000", 2.5 * zoom);

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}
