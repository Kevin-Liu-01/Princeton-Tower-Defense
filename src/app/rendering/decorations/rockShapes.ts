import type { RockPalette, RegionRockConfig } from "./rockPalettes";

// ─── shared helpers ──────────────────────────────────────────────

function drawRockShadow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  s: number
): void {
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  grad.addColorStop(0, "rgba(0,0,0,0.28)");
  grad.addColorStop(0.65, "rgba(0,0,0,0.10)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawIsometricFace(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  colorStops: { offset: number; color: string }[],
  gradStart: [number, number],
  gradEnd: [number, number]
): void {
  const grad = ctx.createLinearGradient(...gradStart, ...gradEnd);
  for (const stop of colorStops) {
    grad.addColorStop(stop.offset, stop.color);
  }
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCrackLine(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  color: string,
  width: number
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
}

function drawEdgeHighlight(
  ctx: CanvasRenderingContext2D,
  points: [number, number][],
  width: number
): void {
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
  }
  ctx.stroke();
}

function drawPebble(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  color: string
): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

// ─── accent overlays ──────────────────────────────────────────────

function drawMossPatches(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette
): void {
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.ellipse(x - 3 * s, y - 5 * s, 4 * s, 2 * s, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.accentAlt;
  ctx.beginPath();
  ctx.ellipse(x + 5 * s, y - 2 * s, 3 * s, 1.5 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFrostPatches(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette
): void {
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.ellipse(x - 2 * s, y - 13 * s, 5 * s, 2 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.accentAlt;
  ctx.beginPath();
  ctx.ellipse(x + 4 * s, y - 10 * s, 3.5 * s, 1.5 * s, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Sparkle dots
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - 1 * s, y - 14 * s, 0.8 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 5 * s, y - 11 * s, 0.6 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawLavaCracks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette,
  time: number
): void {
  const pulse = 0.6 + 0.4 * Math.sin(time * 1.8);
  ctx.globalAlpha = 0.7 * pulse;
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 1.6 * s;
  ctx.shadowColor = pal.accent;
  ctx.shadowBlur = 6 * s;
  ctx.beginPath();
  ctx.moveTo(x - 4 * s, y - 10 * s);
  ctx.lineTo(x - 2 * s, y - 5 * s);
  ctx.lineTo(x - 5 * s, y - 1 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 3 * s, y - 9 * s);
  ctx.lineTo(x + 5 * s, y - 3 * s);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowColor = "transparent";
  // Hot spots at crack intersections
  ctx.globalAlpha = 0.5 * pulse;
  ctx.fillStyle = pal.accentAlt;
  ctx.beginPath();
  ctx.arc(x - 2 * s, y - 5 * s, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSlimePatches(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette
): void {
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.ellipse(x - 4 * s, y - 3 * s, 5 * s, 2.5 * s, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.accentAlt;
  ctx.beginPath();
  ctx.ellipse(x + 3 * s, y - 7 * s, 3 * s, 1.8 * s, -0.3, 0, Math.PI * 2);
  ctx.fill();
  // Drip highlight
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#90c070";
  ctx.beginPath();
  ctx.ellipse(x - 3 * s, y + 1 * s, 2 * s, 3.5 * s, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSandWear(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette
): void {
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.ellipse(x - 1 * s, y + 3 * s, 10 * s, 3 * s, 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Wind-worn streaks on face
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = pal.accentAlt;
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(x - 8 * s, y - 4 * s);
  ctx.lineTo(x - 2 * s, y - 5 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y - 1 * s);
  ctx.lineTo(x + 2 * s, y - 2 * s);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawAccent(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette,
  config: RegionRockConfig,
  time: number
): void {
  switch (config.accentType) {
    case "moss": {
      drawMossPatches(ctx, x, y, s, pal);
      break;
    }
    case "frost": {
      drawFrostPatches(ctx, x, y, s, pal);
      break;
    }
    case "lava": {
      drawLavaCracks(ctx, x, y, s, pal, time);
      break;
    }
    case "slime": {
      drawSlimePatches(ctx, x, y, s, pal);
      break;
    }
    case "sand": {
      drawSandWear(ctx, x, y, s, pal);
      break;
    }
  }
}

// ─── shape 0: chunky boulder ──────────────────────────────────────

export function drawBoulderRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette,
  config: RegionRockConfig,
  time: number
): void {
  drawRockShadow(ctx, x + 3 * s, y + 5 * s, 18 * s, 9 * s, s);

  // Top face
  drawIsometricFace(
    ctx,
    [
      [x - 9 * s, y - 12 * s],
      [x + 1 * s, y - 17 * s],
      [x + 11 * s, y - 10 * s],
      [x + 1 * s, y - 5 * s],
    ],
    [
      { color: pal.light, offset: 0 },
      { color: pal.mid, offset: 1 },
    ],
    [x - 9 * s, y - 15 * s],
    [x + 11 * s, y - 8 * s]
  );

  // Front-left face
  drawIsometricFace(
    ctx,
    [
      [x - 9 * s, y - 12 * s],
      [x + 1 * s, y - 5 * s],
      [x + 1 * s, y + 3 * s],
      [x - 13 * s, y + 3 * s],
    ],
    [
      { color: pal.mid, offset: 0 },
      { color: pal.base, offset: 0.5 },
      { color: pal.dark, offset: 1 },
    ],
    [x - 13 * s, y - 8 * s],
    [x + 4 * s, y + 4 * s]
  );

  // Right face
  drawIsometricFace(
    ctx,
    [
      [x + 11 * s, y - 10 * s],
      [x + 13 * s, y + 4 * s],
      [x + 1 * s, y + 3 * s],
      [x + 1 * s, y - 5 * s],
    ],
    [
      { color: pal.base, offset: 0 },
      { color: pal.dark, offset: 0.6 },
      { color: pal.dark, offset: 1 },
    ],
    [x, y - 10 * s],
    [x + 13 * s, y + 3 * s]
  );

  // Cracks
  drawCrackLine(
    ctx,
    [
      [x - 4 * s, y - 10 * s],
      [x - 6 * s, y - 4 * s],
      [x - 9 * s, y],
    ],
    pal.dark,
    0.8 * s
  );
  drawCrackLine(
    ctx,
    [
      [x + 7 * s, y - 8 * s],
      [x + 8 * s, y - 2 * s],
    ],
    pal.dark,
    0.8 * s
  );
  drawCrackLine(
    ctx,
    [
      [x - 2 * s, y - 13 * s],
      [x + 4 * s, y - 9 * s],
    ],
    pal.dark,
    0.7 * s
  );

  // Top edge highlight
  drawEdgeHighlight(
    ctx,
    [
      [x - 8 * s, y - 12 * s],
      [x + 1 * s, y - 17 * s],
      [x + 10 * s, y - 10 * s],
    ],
    1 * s
  );

  drawAccent(ctx, x, y, s, pal, config, time);

  // Pebbles
  drawPebble(ctx, x - 13 * s, y + 5 * s, 2 * s, 1.2 * s, 0.2, pal.mid);
  drawPebble(ctx, x + 13 * s, y + 4 * s, 1.5 * s, 1 * s, -0.3, pal.dark);
}

// ─── shape 1: flat slab / slate ───────────────────────────────────

export function drawSlabRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette,
  config: RegionRockConfig,
  time: number
): void {
  drawRockShadow(ctx, x + 2 * s, y + 4 * s, 20 * s, 8 * s, s);

  // Wide, low-profile layered slab
  // Bottom layer (widest)
  drawIsometricFace(
    ctx,
    [
      [x - 14 * s, y - 2 * s],
      [x + 2 * s, y - 6 * s],
      [x + 16 * s, y - 1 * s],
      [x + 2 * s, y + 4 * s],
    ],
    [
      { color: pal.dark, offset: 0 },
      { color: pal.base, offset: 0.5 },
      { color: pal.dark, offset: 1 },
    ],
    [x - 14 * s, y - 4 * s],
    [x + 16 * s, y + 2 * s]
  );

  // Middle layer edge (front)
  drawIsometricFace(
    ctx,
    [
      [x - 12 * s, y - 4 * s],
      [x + 1 * s, y - 8 * s],
      [x + 1 * s, y - 3 * s],
      [x - 12 * s, y + 1 * s],
    ],
    [
      { color: pal.mid, offset: 0 },
      { color: pal.dark, offset: 1 },
    ],
    [x - 12 * s, y - 6 * s],
    [x + 2 * s, y + 2 * s]
  );

  // Middle layer edge (right)
  drawIsometricFace(
    ctx,
    [
      [x + 1 * s, y - 8 * s],
      [x + 14 * s, y - 3 * s],
      [x + 14 * s, y + 1 * s],
      [x + 1 * s, y - 3 * s],
    ],
    [
      { color: pal.base, offset: 0 },
      { color: pal.dark, offset: 1 },
    ],
    [x, y - 8 * s],
    [x + 14 * s, y + 1 * s]
  );

  // Top slab face (large visible area)
  drawIsometricFace(
    ctx,
    [
      [x - 12 * s, y - 4 * s],
      [x + 1 * s, y - 8 * s],
      [x + 14 * s, y - 3 * s],
      [x + 1 * s, y + 1 * s],
    ],
    [
      { color: pal.light, offset: 0 },
      { color: pal.mid, offset: 0.6 },
      { color: pal.base, offset: 1 },
    ],
    [x - 12 * s, y - 6 * s],
    [x + 14 * s, y]
  );

  // Upper chip (small offset slab on top)
  drawIsometricFace(
    ctx,
    [
      [x - 5 * s, y - 8 * s],
      [x + 2 * s, y - 11 * s],
      [x + 9 * s, y - 7 * s],
      [x + 2 * s, y - 5 * s],
    ],
    [
      { color: pal.light, offset: 0 },
      { color: pal.mid, offset: 1 },
    ],
    [x - 5 * s, y - 10 * s],
    [x + 9 * s, y - 5 * s]
  );

  // Chip front edge
  drawIsometricFace(
    ctx,
    [
      [x - 5 * s, y - 8 * s],
      [x + 2 * s, y - 5 * s],
      [x + 2 * s, y - 3 * s],
      [x - 5 * s, y - 6 * s],
    ],
    [
      { color: pal.base, offset: 0 },
      { color: pal.dark, offset: 1 },
    ],
    [x - 5 * s, y - 8 * s],
    [x + 2 * s, y - 3 * s]
  );

  // Chip right edge
  drawIsometricFace(
    ctx,
    [
      [x + 2 * s, y - 5 * s],
      [x + 9 * s, y - 7 * s],
      [x + 9 * s, y - 5 * s],
      [x + 2 * s, y - 3 * s],
    ],
    [
      { color: pal.dark, offset: 0 },
      { color: pal.dark, offset: 1 },
    ],
    [x + 2 * s, y - 7 * s],
    [x + 9 * s, y - 4 * s]
  );

  // Stratification lines across top slab
  ctx.strokeStyle = pal.dark;
  ctx.lineWidth = 0.6 * s;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.moveTo(x - 8 * s, y - 3 * s);
  ctx.lineTo(x + 10 * s, y - 2 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6 * s, y - 5 * s);
  ctx.lineTo(x + 8 * s, y - 5 * s);
  ctx.stroke();
  ctx.globalAlpha = 1;

  drawEdgeHighlight(
    ctx,
    [
      [x - 11 * s, y - 4 * s],
      [x + 1 * s, y - 8 * s],
      [x + 13 * s, y - 3 * s],
    ],
    0.8 * s
  );

  drawAccent(ctx, x, y - 2 * s, s, pal, config, time);

  drawPebble(ctx, x - 14 * s, y + 3 * s, 1.8 * s, 1 * s, 0.4, pal.mid);
  drawPebble(ctx, x + 15 * s, y + 2 * s, 1.3 * s, 0.8 * s, -0.2, pal.dark);
  drawPebble(ctx, x + 6 * s, y + 5 * s, 1 * s, 0.7 * s, 0.1, pal.base);
}

// ─── shape 2: jagged spire / standing stone ───────────────────────

export function drawSpireRock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  pal: RockPalette,
  config: RegionRockConfig,
  time: number
): void {
  drawRockShadow(ctx, x + 2 * s, y + 5 * s, 14 * s, 7 * s, s);

  // Tall, narrow jagged spire with asymmetric peak
  // Front-left face
  drawIsometricFace(
    ctx,
    [
      [x - 3 * s, y - 22 * s],
      [x - 1 * s, y - 14 * s],
      [x - 1 * s, y + 2 * s],
      [x - 10 * s, y + 3 * s],
    ],
    [
      { color: pal.mid, offset: 0 },
      { color: pal.base, offset: 0.4 },
      { color: pal.dark, offset: 1 },
    ],
    [x - 10 * s, y - 18 * s],
    [x + 2 * s, y + 3 * s]
  );

  // Right face
  drawIsometricFace(
    ctx,
    [
      [x - 3 * s, y - 22 * s],
      [x + 7 * s, y - 16 * s],
      [x + 9 * s, y + 4 * s],
      [x - 1 * s, y + 2 * s],
    ],
    [
      { color: pal.base, offset: 0 },
      { color: pal.dark, offset: 0.5 },
      { color: pal.dark, offset: 1 },
    ],
    [x - 2 * s, y - 20 * s],
    [x + 9 * s, y + 2 * s]
  );

  // Narrow top face
  drawIsometricFace(
    ctx,
    [
      [x - 3 * s, y - 22 * s],
      [x + 2 * s, y - 20 * s],
      [x + 7 * s, y - 16 * s],
      [x - 1 * s, y - 14 * s],
    ],
    [
      { color: pal.light, offset: 0 },
      { color: pal.mid, offset: 1 },
    ],
    [x - 3 * s, y - 22 * s],
    [x + 7 * s, y - 14 * s]
  );

  // Secondary smaller spike beside main
  drawIsometricFace(
    ctx,
    [
      [x + 6 * s, y - 10 * s],
      [x + 10 * s, y - 8 * s],
      [x + 11 * s, y + 3 * s],
      [x + 6 * s, y + 2 * s],
    ],
    [
      { color: pal.base, offset: 0 },
      { color: pal.dark, offset: 1 },
    ],
    [x + 6 * s, y - 10 * s],
    [x + 11 * s, y + 3 * s]
  );

  // Secondary spike top
  drawIsometricFace(
    ctx,
    [
      [x + 6 * s, y - 10 * s],
      [x + 8 * s, y - 11 * s],
      [x + 10 * s, y - 8 * s],
      [x + 8 * s, y - 7 * s],
    ],
    [
      { color: pal.light, offset: 0 },
      { color: pal.mid, offset: 1 },
    ],
    [x + 6 * s, y - 11 * s],
    [x + 10 * s, y - 7 * s]
  );

  // Vertical cracks on tall face
  drawCrackLine(
    ctx,
    [
      [x - 5 * s, y - 16 * s],
      [x - 6 * s, y - 8 * s],
      [x - 7 * s, y - 2 * s],
    ],
    pal.dark,
    0.8 * s
  );
  drawCrackLine(
    ctx,
    [
      [x + 3 * s, y - 14 * s],
      [x + 4 * s, y - 6 * s],
    ],
    pal.dark,
    0.7 * s
  );
  // Horizontal fracture
  drawCrackLine(
    ctx,
    [
      [x - 7 * s, y - 6 * s],
      [x + 6 * s, y - 5 * s],
    ],
    pal.dark,
    0.6 * s
  );

  // Edge highlights
  drawEdgeHighlight(
    ctx,
    [
      [x - 3 * s, y - 22 * s],
      [x + 2 * s, y - 20 * s],
      [x + 7 * s, y - 16 * s],
    ],
    0.9 * s
  );

  drawAccent(ctx, x, y - 3 * s, s, pal, config, time);

  drawPebble(ctx, x - 10 * s, y + 5 * s, 1.8 * s, 1 * s, 0.3, pal.mid);
  drawPebble(ctx, x + 10 * s, y + 5 * s, 1.4 * s, 0.9 * s, -0.15, pal.dark);
}
