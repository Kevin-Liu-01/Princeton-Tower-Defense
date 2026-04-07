import type { Troop, Enemy, Position } from "../../types";
import { getEnemyPosition } from "../../utils";

const TAU = Math.PI * 2;

type WorldToScreenFn = (pos: Position) => Position;

// ============================================================================
// TETHER RENDERERS — per-flavor visual connections
// ============================================================================

function renderSilkTether(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  now: number
): void {
  const sway = Math.sin(now * 0.003) * 3 * zoom;
  const midX = (from.x + to.x) / 2 + sway;
  const midY = (from.y + to.y) / 2 - 5 * zoom;

  ctx.strokeStyle = `rgba(220, 215, 200, ${alpha * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(midX, midY, to.x, to.y);
  ctx.stroke();

  // Silk droplets along the thread
  for (let t = 0.2; t <= 0.8; t += 0.3) {
    const px =
      from.x + (to.x - from.x) * t + sway * (1 - Math.abs(t - 0.5) * 2);
    const py = from.y + (to.y - from.y) * t - 3 * zoom * Math.sin(t * Math.PI);
    ctx.fillStyle = `rgba(240, 235, 220, ${alpha * 0.25})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.2 * zoom, 0, TAU);
    ctx.fill();
  }
}

function renderVineTether(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  now: number
): void {
  const sway = Math.sin(now * 0.002) * 4 * zoom;

  ctx.strokeStyle = `rgba(50, 130, 50, ${alpha * 0.3})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  const cp1x = from.x + (to.x - from.x) * 0.3 + sway;
  const cp1y = from.y + (to.y - from.y) * 0.3 - 8 * zoom;
  const cp2x = from.x + (to.x - from.x) * 0.7 - sway;
  const cp2y = from.y + (to.y - from.y) * 0.7 - 6 * zoom;
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);
  ctx.stroke();

  // Tiny leaves
  for (let t = 0.3; t <= 0.7; t += 0.2) {
    const lx = from.x + (to.x - from.x) * t;
    const ly = from.y + (to.y - from.y) * t - 4 * zoom;
    ctx.fillStyle = `rgba(80, 180, 60, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 2 * zoom, 1.2 * zoom, t * 2, 0, TAU);
    ctx.fill();
  }
}

function renderNecroticTether(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  now: number
): void {
  // Soul wisps flowing along a bezier path
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  ctx.strokeStyle = `rgba(100, 40, 160, ${alpha * 0.15})`;
  ctx.lineWidth = 1.5 * zoom;
  const sway = Math.sin(now * 0.002) * 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(
    from.x + dx * 0.5 + sway,
    from.y + dy * 0.5 - 10 * zoom,
    to.x,
    to.y
  );
  ctx.stroke();

  // Flowing wisps
  for (let i = 0; i < 4; i++) {
    const t = (now * 0.001 + i * 0.25) % 1;
    const px = from.x + dx * t + sway * Math.sin(t * Math.PI);
    const py = from.y + dy * t - 8 * zoom * Math.sin(t * Math.PI);
    ctx.fillStyle = `rgba(160, 80, 220, ${alpha * 0.3 * (1 - Math.abs(t - 0.5) * 2)})`;
    ctx.beginPath();
    ctx.arc(px, py, 2 * zoom, 0, TAU);
    ctx.fill();
  }
}

function renderPoisonArcTether(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  now: number
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Green dripping arc
  ctx.strokeStyle = `rgba(60, 160, 40, ${alpha * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(
    from.x + dx * 0.5,
    from.y + dy * 0.5 - 12 * zoom,
    to.x,
    to.y
  );
  ctx.stroke();

  // Dripping particles
  for (let i = 0; i < 3; i++) {
    const t = (now * 0.0015 + i * 0.33) % 1;
    const px = from.x + dx * t;
    const py =
      from.y +
      dy * t -
      10 * zoom * Math.sin(t * Math.PI) +
      Math.sin(now * 0.004 + i) * 3 * zoom;
    ctx.fillStyle = `rgba(100, 200, 60, ${alpha * 0.3 * (1 - Math.abs(t - 0.5) * 2)})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.5 * zoom, 0, TAU);
    ctx.fill();
  }
}

function renderFireStreamTether(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  now: number
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Orange fire trail
  ctx.strokeStyle = `rgba(255, 120, 30, ${alpha * 0.15})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  // Ember particles along the trail
  for (let i = 0; i < 4; i++) {
    const t = (now * 0.002 + i * 0.25) % 1;
    const px = from.x + dx * t + Math.sin(now * 0.006 + i * 1.5) * 2 * zoom;
    const py = from.y + dy * t - Math.sin(t * Math.PI) * 4 * zoom;
    ctx.fillStyle = `rgba(255, ${160 - Math.floor(t * 80)}, 40, ${alpha * 0.35 * (1 - t * 0.5)})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.5 * zoom, 0, TAU);
    ctx.fill();
  }
}

function renderIceBeamTether(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  _now: number
): void {
  // Translucent blue-white ray
  const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  grad.addColorStop(0, `rgba(160, 210, 255, ${alpha * 0.12})`);
  grad.addColorStop(0.5, `rgba(180, 220, 255, ${alpha * 0.2})`);
  grad.addColorStop(1, `rgba(160, 210, 255, ${alpha * 0.12})`);

  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  // Core bright line
  ctx.strokeStyle = `rgba(220, 240, 255, ${alpha * 0.15})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function renderSandStreamTether(
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  now: number
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  // Sand particles flowing along path
  for (let i = 0; i < 6; i++) {
    const t = (now * 0.0015 + i * 0.167) % 1;
    const px = from.x + dx * t + Math.sin(now * 0.004 + i * 1.2) * 2 * zoom;
    const py = from.y + dy * t;
    ctx.fillStyle = `rgba(200, 180, 130, ${alpha * 0.25 * (1 - Math.abs(t - 0.5) * 2)})`;
    ctx.beginPath();
    ctx.arc(px, py, 1.2 * zoom, 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// FLAVOR -> TETHER RENDERER MAP
// ============================================================================

type TetherRenderer = (
  ctx: CanvasRenderingContext2D,
  from: Position,
  to: Position,
  zoom: number,
  alpha: number,
  now: number
) => void;

const TETHER_RENDERERS: Record<string, TetherRenderer> = {
  cocoon: renderSilkTether,
  frost: renderIceBeamTether,
  magma: renderFireStreamTether,
  mire: renderPoisonArcTether,
  necrotic: renderNecroticTether,
  sand: renderSandStreamTether,
  vine: renderVineTether,
};

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

export function renderAbilityTethers(
  ctx: CanvasRenderingContext2D,
  troops: Troop[],
  enemies: Enemy[],
  worldToScreenFn: WorldToScreenFn,
  selectedMap: string,
  zoom: number,
  now: number
): void {
  const enemyMap = new Map<string, Enemy>();
  for (const e of enemies) {
    enemyMap.set(e.id, e);
  }

  for (const troop of troops) {
    const sources: { sourceId: string; flavor: string }[] = [];

    if (troop.stunned && troop.stunSourceId && troop.stunFlavor) {
      sources.push({ flavor: troop.stunFlavor, sourceId: troop.stunSourceId });
    }
    if (troop.burning && troop.burnSourceId && troop.burnFlavor) {
      sources.push({ flavor: troop.burnFlavor, sourceId: troop.burnSourceId });
    }
    if (troop.slowed && troop.slowSourceId && troop.slowFlavor) {
      sources.push({ flavor: troop.slowFlavor, sourceId: troop.slowSourceId });
    }
    if (troop.poisoned && troop.poisonSourceId && troop.poisonFlavor) {
      sources.push({
        flavor: troop.poisonFlavor,
        sourceId: troop.poisonSourceId,
      });
    }

    if (sources.length === 0) {
      continue;
    }

    const troopScreen = worldToScreenFn(troop.pos);
    const seen = new Set<string>();

    for (const { sourceId, flavor } of sources) {
      const key = `${sourceId}-${flavor}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const renderer = TETHER_RENDERERS[flavor];
      if (!renderer) {
        continue;
      }

      const enemy = enemyMap.get(sourceId);
      if (!enemy) {
        continue;
      }

      const pathKey = enemy.pathKey || selectedMap;
      const enemyWorldPos = getEnemyPosition(enemy, pathKey);
      const enemyScreen = worldToScreenFn(enemyWorldPos);

      renderer(ctx, enemyScreen, troopScreen, zoom, 1, now);
    }
  }
}
