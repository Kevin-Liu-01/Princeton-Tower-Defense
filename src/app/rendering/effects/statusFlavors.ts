import type { Position } from "../../types";
import { ISO_Y_RATIO } from "../../constants/isometric";

const TAU = Math.PI * 2;

// ============================================================================
// SHARED HELPERS
// ============================================================================

function drawIsometricEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry * ISO_Y_RATIO, 0, 0, TAU);
}

// ============================================================================
// COCOON (insectoid) — silk threads wrapping the target
// ============================================================================

export function renderCocoonStun(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  const wrap = (now * 0.003) % TAU;

  // Silk cocoon base ellipse on ground
  ctx.fillStyle = `rgba(220, 210, 190, ${alpha * 0.12})`;
  drawIsometricEllipse(ctx, pos.x, pos.y + s * 0.2, s * 0.9, s * 0.9);
  ctx.fill();

  // Spiraling silk threads wrapping around the unit
  ctx.lineWidth = 1.4 * zoom;
  for (let i = 0; i < 8; i++) {
    const phase = wrap + i * 0.78;
    const yOff = ((phase * 0.3) % 1) * s * 2 - s;
    const rx = s * 0.55 * (1 - Math.abs(yOff) / (s * 1.2));
    if (rx < 1) continue;
    const threadAlpha = alpha * 0.5 * (1 - Math.abs(yOff) / (s * 1.2));
    ctx.strokeStyle = `rgba(245, 240, 230, ${threadAlpha})`;
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y - yOff, rx, rx * 0.3, phase * 0.5, 0, Math.PI);
    ctx.stroke();
  }

  // Silk strands dangling
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * TAU + now * 0.001;
    const sx = pos.x + Math.cos(angle) * s * 0.4;
    const sy = pos.y - s * 0.1 + Math.sin(now * 0.002 + i) * s * 0.15;
    ctx.strokeStyle = `rgba(200, 190, 170, ${alpha * 0.35})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + Math.sin(now * 0.003 + i) * s * 0.2, sy + s * 0.4, sx, sy + s * 0.6);
    ctx.stroke();
  }
}

export function renderCocoonSlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Web patch on the ground slowing movement
  ctx.strokeStyle = `rgba(200, 195, 180, ${alpha * 0.3})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * TAU + now * 0.0005;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    const ex = pos.x + Math.cos(angle) * s * 1.1;
    const ey = pos.y + Math.sin(angle) * s * 0.55;
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }
  // Concentric web rings
  for (let r = 0.3; r <= 1.0; r += 0.35) {
    ctx.strokeStyle = `rgba(210, 205, 190, ${alpha * 0.2 * (1.1 - r)})`;
    drawIsometricEllipse(ctx, pos.x, pos.y, s * r, s * r);
    ctx.stroke();
  }
}

export function renderCocoonPoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Venom drip from above
  for (let i = 0; i < 4; i++) {
    const seed = (now * 0.002 + i * 1.23) % 1;
    const dx = pos.x + Math.sin(i * 2.5 + now * 0.001) * s * 0.4;
    const dy = pos.y - s * 0.8 + seed * s * 1.6;
    const sz = (1.5 + i * 0.3) * zoom * (1 - seed * 0.4);
    ctx.fillStyle = `rgba(120, 200, 80, ${alpha * 0.6 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(dx, dy, sz, 0, TAU);
    ctx.fill();
  }
}

export function renderCocoonBurn(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Acid burn — greenish-yellow corrosive drip
  const glowGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s);
  glowGrad.addColorStop(0, `rgba(180, 220, 40, ${alpha * 0.2})`);
  glowGrad.addColorStop(1, "rgba(120, 180, 20, 0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, s, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const seed = (now * 0.003 + i * 0.9) % 1;
    const bx = pos.x + Math.sin(i * 2.1) * s * 0.35;
    const by = pos.y - seed * s * 1.2;
    ctx.fillStyle = `rgba(200, 240, 60, ${alpha * 0.5 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(bx, by, 2 * zoom, 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// VINE (forest) — green vines entangling the target
// ============================================================================

export function renderVineStun(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  const sway = Math.sin(now * 0.002) * 0.1;

  // Ground roots
  ctx.fillStyle = `rgba(34, 120, 40, ${alpha * 0.15})`;
  drawIsometricEllipse(ctx, pos.x, pos.y + s * 0.15, s * 0.8, s * 0.8);
  ctx.fill();

  // Vines wrapping upward
  ctx.lineWidth = 2.2 * zoom;
  for (let i = 0; i < 5; i++) {
    const baseAngle = (i / 5) * TAU;
    const vineAlpha = alpha * 0.55;
    ctx.strokeStyle = `rgba(40, 140, 50, ${vineAlpha})`;
    ctx.beginPath();
    const bx = pos.x + Math.cos(baseAngle) * s * 0.5;
    const by = pos.y + s * 0.2;
    ctx.moveTo(bx, by);
    for (let j = 1; j <= 4; j++) {
      const t = j / 4;
      const spiralAngle = baseAngle + t * Math.PI * 1.2 + sway;
      const r = s * 0.45 * (1 - t * 0.3);
      const vx = pos.x + Math.cos(spiralAngle) * r;
      const vy = pos.y + s * 0.2 - t * s * 1.5;
      ctx.lineTo(vx, vy);
    }
    ctx.stroke();

    // Tiny leaves on each vine
    if (i % 2 === 0) {
      const lx = pos.x + Math.cos(baseAngle + 0.6 + sway) * s * 0.35;
      const ly = pos.y - s * 0.4;
      ctx.fillStyle = `rgba(80, 180, 60, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 2.5 * zoom, 1.5 * zoom, baseAngle, 0, TAU);
      ctx.fill();
    }
  }
}

export function renderVineSlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Root tangle on ground
  ctx.strokeStyle = `rgba(60, 130, 50, ${alpha * 0.35})`;
  ctx.lineWidth = 1.8 * zoom;
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * TAU + now * 0.0004;
    const len = s * (0.6 + Math.sin(i * 1.7) * 0.3);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.quadraticCurveTo(
      pos.x + Math.cos(angle + 0.4) * len * 0.6,
      pos.y + Math.sin(angle + 0.4) * len * 0.3 * ISO_Y_RATIO,
      pos.x + Math.cos(angle) * len,
      pos.y + Math.sin(angle) * len * ISO_Y_RATIO,
    );
    ctx.stroke();
  }
}

export function renderVineBurn(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Thorn bleed — red thorn pricks
  for (let i = 0; i < 5; i++) {
    const seed = (now * 0.003 + i * 1.1) % 1;
    const bx = pos.x + Math.sin(i * 2.3 + now * 0.001) * s * 0.5;
    const by = pos.y - seed * s * 1.3;
    ctx.fillStyle = `rgba(200, 40, 40, ${alpha * 0.5 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(bx, by, 1.8 * zoom * (1 - seed * 0.5), 0, TAU);
    ctx.fill();
  }
}

export function renderVinePoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Spore cloud
  for (let i = 0; i < 5; i++) {
    const seed = (now * 0.0015 + i * 0.8) % 1;
    const angle = (i / 5) * TAU + now * 0.0008;
    const dist = s * 0.5 * seed;
    const sx = pos.x + Math.cos(angle) * dist;
    const sy = pos.y - s * 0.4 + Math.sin(angle) * dist * 0.3;
    ctx.fillStyle = `rgba(100, 180, 60, ${alpha * 0.4 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, (2 + i * 0.5) * zoom * (1 - seed * 0.3), 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// MIRE (swamp) — bubbling mud and toxic miasma
// ============================================================================

export function renderMireStun(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Mud grip — thick mud rising around the unit
  const grad = ctx.createRadialGradient(pos.x, pos.y + s * 0.1, 0, pos.x, pos.y + s * 0.1, s);
  grad.addColorStop(0, `rgba(80, 65, 40, ${alpha * 0.35})`);
  grad.addColorStop(0.6, `rgba(60, 50, 30, ${alpha * 0.2})`);
  grad.addColorStop(1, "rgba(50, 40, 25, 0)");
  ctx.fillStyle = grad;
  drawIsometricEllipse(ctx, pos.x, pos.y + s * 0.1, s, s);
  ctx.fill();

  // Mud tendrils wrapping upward
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + now * 0.001;
    ctx.strokeStyle = `rgba(90, 70, 40, ${alpha * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(pos.x + Math.cos(a) * s * 0.4, pos.y + s * 0.1);
    ctx.quadraticCurveTo(
      pos.x + Math.cos(a + 0.3) * s * 0.35,
      pos.y - s * 0.3,
      pos.x + Math.cos(a + 0.6) * s * 0.2,
      pos.y - s * 0.6,
    );
    ctx.stroke();
  }
}

export function renderMireSlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Bubbling mud pool
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 0.9);
  grad.addColorStop(0, `rgba(70, 55, 30, ${alpha * 0.3})`);
  grad.addColorStop(1, "rgba(50, 40, 20, 0)");
  ctx.fillStyle = grad;
  drawIsometricEllipse(ctx, pos.x, pos.y, s * 0.9, s * 0.9);
  ctx.fill();

  // Rising bubbles
  for (let i = 0; i < 4; i++) {
    const seed = (now * 0.002 + i * 1.3) % 1;
    const bx = pos.x + Math.sin(i * 2.1 + now * 0.001) * s * 0.5;
    const by = pos.y - seed * s * 0.4;
    const bSize = (2 + i * 0.5) * zoom * (1 - seed * 0.5);
    ctx.fillStyle = `rgba(100, 85, 50, ${alpha * 0.4 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(bx, by, bSize, 0, TAU);
    ctx.fill();
  }
}

export function renderMirePoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Toxic miasma cloud
  const pulse = Math.sin(now * 0.003) * 0.15 + 0.85;
  const grad = ctx.createRadialGradient(pos.x, pos.y - s * 0.3, 0, pos.x, pos.y - s * 0.3, s * 0.9);
  grad.addColorStop(0, `rgba(80, 160, 40, ${alpha * 0.25 * pulse})`);
  grad.addColorStop(0.5, `rgba(60, 140, 30, ${alpha * 0.12})`);
  grad.addColorStop(1, "rgba(40, 120, 20, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y - s * 0.3, s * 0.9, 0, TAU);
  ctx.fill();

  // Miasma wisps
  for (let i = 0; i < 5; i++) {
    const seed = (now * 0.0018 + i * 0.9) % 1;
    const wx = pos.x + Math.sin(now * 0.002 + i * 1.7) * s * 0.6;
    const wy = pos.y - s * 0.3 - seed * s * 0.7;
    ctx.fillStyle = `rgba(100, 180, 50, ${alpha * 0.3 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(wx, wy, (2 + i * 0.4) * zoom, 0, TAU);
    ctx.fill();
  }
}

export function renderMireBurn(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Swamp acid — brownish-green corrosion
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s);
  grad.addColorStop(0, `rgba(140, 160, 40, ${alpha * 0.2})`);
  grad.addColorStop(1, "rgba(100, 120, 30, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, s, 0, TAU);
  ctx.fill();
  for (let i = 0; i < 3; i++) {
    const seed = (now * 0.003 + i * 1.1) % 1;
    ctx.fillStyle = `rgba(160, 180, 50, ${alpha * 0.5 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(
      pos.x + Math.sin(i * 2.3) * s * 0.3,
      pos.y - seed * s * 1.1,
      1.8 * zoom,
      0, TAU,
    );
    ctx.fill();
  }
}

// ============================================================================
// SAND (desert) — sand vortex, heat shimmer, petrification
// ============================================================================

export function renderSandStun(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Petrification — unit turning to stone from bottom up
  const petrifyHeight = s * 1.6;
  const grad = ctx.createLinearGradient(pos.x, pos.y + s * 0.2, pos.x, pos.y - petrifyHeight);
  grad.addColorStop(0, `rgba(160, 150, 130, ${alpha * 0.5})`);
  grad.addColorStop(0.5, `rgba(140, 130, 120, ${alpha * 0.25})`);
  grad.addColorStop(1, `rgba(130, 120, 110, 0)`);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(pos.x - s * 0.4, pos.y - petrifyHeight, s * 0.8, petrifyHeight + s * 0.2, 3 * zoom);
  ctx.fill();

  // Stone crack lines
  ctx.strokeStyle = `rgba(100, 90, 80, ${alpha * 0.4})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 3; i++) {
    const cx = pos.x + (i - 1) * s * 0.25;
    const cy = pos.y - s * 0.3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + s * 0.1, cy - s * 0.3);
    ctx.lineTo(cx - s * 0.05, cy - s * 0.5);
    ctx.stroke();
  }
}

export function renderSandSlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Swirling sand vortex around feet
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * TAU + now * 0.003;
    const dist = s * (0.3 + Math.sin(now * 0.004 + i * 0.7) * 0.15);
    const sx = pos.x + Math.cos(angle) * dist;
    const sy = pos.y + Math.sin(angle) * dist * ISO_Y_RATIO;
    const pSize = (1.5 + Math.sin(i * 1.3) * 0.5) * zoom;
    ctx.fillStyle = `rgba(210, 185, 140, ${alpha * 0.45 * (0.5 + Math.sin(now * 0.005 + i) * 0.3)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, pSize, 0, TAU);
    ctx.fill();
  }

  // Ground sand ring
  ctx.strokeStyle = `rgba(190, 170, 130, ${alpha * 0.25})`;
  ctx.lineWidth = 1.5 * zoom;
  drawIsometricEllipse(ctx, pos.x, pos.y, s * 0.8, s * 0.8);
  ctx.stroke();
}

export function renderSandBurn(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Heat shimmer
  const shimmer = Math.sin(now * 0.01) * 0.15 + 0.85;
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 1.1);
  grad.addColorStop(0, `rgba(255, 200, 100, ${alpha * 0.18 * shimmer})`);
  grad.addColorStop(0.5, `rgba(255, 160, 60, ${alpha * 0.08})`);
  grad.addColorStop(1, "rgba(200, 120, 40, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, s * 1.1, 0, TAU);
  ctx.fill();

  // Rising heat distortion particles
  for (let i = 0; i < 4; i++) {
    const seed = (now * 0.002 + i * 0.8) % 1;
    const hx = pos.x + Math.sin(now * 0.005 + i * 2.1) * s * 0.4;
    const hy = pos.y - seed * s * 1.5;
    ctx.fillStyle = `rgba(255, 220, 150, ${alpha * 0.3 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(hx, hy, 1.5 * zoom, 0, TAU);
    ctx.fill();
  }
}

export function renderSandPoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  renderMirePoison(ctx, pos, zoom, alpha, now);
}

// ============================================================================
// FROST (winter) — ice crystals and frozen encasement
// ============================================================================

export function renderFrostStun(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Frozen solid — ice shell around unit
  const iceGrad = ctx.createRadialGradient(pos.x, pos.y - s * 0.3, 0, pos.x, pos.y - s * 0.3, s * 1.1);
  iceGrad.addColorStop(0, `rgba(180, 220, 255, ${alpha * 0.3})`);
  iceGrad.addColorStop(0.5, `rgba(120, 180, 240, ${alpha * 0.15})`);
  iceGrad.addColorStop(1, "rgba(80, 140, 220, 0)");
  ctx.fillStyle = iceGrad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y - s * 0.3, s * 1.1, 0, TAU);
  ctx.fill();

  // Hexagonal ice facets
  ctx.strokeStyle = `rgba(200, 230, 255, ${alpha * 0.5})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 6; i++) {
    const a1 = (i / 6) * TAU + now * 0.0005;
    const a2 = ((i + 1) / 6) * TAU + now * 0.0005;
    const r = s * 0.7;
    const cy = pos.y - s * 0.3;
    ctx.beginPath();
    ctx.moveTo(pos.x + Math.cos(a1) * r, cy + Math.sin(a1) * r * 0.6);
    ctx.lineTo(pos.x + Math.cos(a2) * r, cy + Math.sin(a2) * r * 0.6);
    ctx.stroke();
  }

  // Frost sparkles
  for (let i = 0; i < 4; i++) {
    const sparkle = Math.sin(now * 0.008 + i * 1.5) * 0.5 + 0.5;
    const sx = pos.x + Math.cos(i * 1.6 + now * 0.001) * s * 0.6;
    const sy = pos.y - s * 0.3 + Math.sin(i * 2.1) * s * 0.4;
    ctx.fillStyle = `rgba(220, 240, 255, ${alpha * 0.7 * sparkle})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5 * zoom, 0, TAU);
    ctx.fill();
  }
}

export function renderFrostSlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  const pulse = Math.sin(now * 0.003) * 0.2 + 0.8;

  // Enhanced frost aura
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 1.1);
  grad.addColorStop(0, `rgba(147, 197, 253, ${alpha * 0.35 * pulse})`);
  grad.addColorStop(0.5, `rgba(96, 165, 250, ${alpha * 0.18})`);
  grad.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, s * 1.1, 0, TAU);
  ctx.fill();

  // Ice crystal growth on ground
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * TAU + now * 0.0003;
    const len = s * 0.7 * (0.7 + Math.sin(i * 1.1) * 0.3);
    ctx.strokeStyle = `rgba(180, 215, 255, ${alpha * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    const ex = pos.x + Math.cos(angle) * len;
    const ey = pos.y + Math.sin(angle) * len * ISO_Y_RATIO;
    ctx.lineTo(ex, ey);
    // Branch
    const mid = 0.6;
    const mx = pos.x + Math.cos(angle) * len * mid;
    const my = pos.y + Math.sin(angle) * len * ISO_Y_RATIO * mid;
    ctx.moveTo(mx, my);
    ctx.lineTo(mx + Math.cos(angle + 0.8) * len * 0.3, my + Math.sin(angle + 0.8) * len * 0.15);
    ctx.stroke();
  }

  // Orbiting ice diamonds
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + now * 0.0013;
    const d = s * 0.75;
    const cx = pos.x + Math.cos(a) * d;
    const cy = pos.y + Math.sin(a) * d * ISO_Y_RATIO - s * 0.3;
    const cSz = 3.5 * zoom;
    ctx.fillStyle = `rgba(200, 230, 255, ${alpha * 0.4})`;
    ctx.strokeStyle = `rgba(191, 219, 254, ${alpha * 0.7})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx, cy - cSz);
    ctx.lineTo(cx + cSz * 0.7, cy);
    ctx.lineTo(cx, cy + cSz);
    ctx.lineTo(cx - cSz * 0.7, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export function renderFrostBurn(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Frostbite — icy blue particles rising
  for (let i = 0; i < 5; i++) {
    const seed = (now * 0.003 + i * 1.2) % 1;
    const fx = pos.x + Math.sin(now * 0.005 + i * 2.0) * s * 0.5;
    const fy = pos.y - seed * s * 1.3;
    const fSize = (2 + i * 0.3) * zoom * (1 - seed * 0.5);
    ctx.fillStyle = `rgba(160, 200, 255, ${alpha * 0.5 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(fx, fy, fSize, 0, TAU);
    ctx.fill();
  }
}

export function renderFrostPoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  renderFrostBurn(ctx, pos, zoom, alpha, now);
}

// ============================================================================
// MAGMA (volcanic) — lava cracks and ember effects
// ============================================================================

export function renderMagmaBurn(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  const flicker = Math.sin(now * 0.01) * 0.15 + 0.85;

  // Magma crack glow on ground
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 0.9);
  grad.addColorStop(0, `rgba(255, 100, 20, ${alpha * 0.35 * flicker})`);
  grad.addColorStop(0.4, `rgba(200, 60, 10, ${alpha * 0.18})`);
  grad.addColorStop(1, "rgba(150, 30, 0, 0)");
  ctx.fillStyle = grad;
  drawIsometricEllipse(ctx, pos.x, pos.y, s * 0.9, s * 0.9);
  ctx.fill();

  // Lava crack lines
  ctx.strokeStyle = `rgba(255, 140, 40, ${alpha * 0.5 * flicker})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * TAU + 0.3;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    const len = s * (0.5 + Math.sin(i * 2.3) * 0.2);
    ctx.lineTo(
      pos.x + Math.cos(angle) * len,
      pos.y + Math.sin(angle) * len * ISO_Y_RATIO,
    );
    ctx.stroke();
  }

  // Rising ember sparks
  for (let i = 0; i < 6; i++) {
    const seed = (now * 0.004 + i * 0.95) % 1;
    const ex = pos.x + Math.sin(now * 0.006 + i * 1.8) * s * 0.5;
    const ey = pos.y - seed * s * 1.5;
    const eSize = (2 + (i % 3)) * zoom * (1 - seed * 0.6);
    ctx.fillStyle = `rgba(255, ${180 - Math.floor(seed * 120)}, ${60 - Math.floor(seed * 50)}, ${alpha * (1 - seed) * flicker})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, TAU);
    ctx.fill();
  }
}

export function renderMagmaStun(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Ember cage — ring of flame pillars
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + now * 0.001;
    const cx = pos.x + Math.cos(a) * s * 0.6;
    const cy = pos.y + Math.sin(a) * s * 0.3;
    const pillarH = s * 0.8 + Math.sin(now * 0.008 + i * 1.2) * s * 0.2;
    const grad = ctx.createLinearGradient(cx, cy, cx, cy - pillarH);
    grad.addColorStop(0, `rgba(255, 120, 20, ${alpha * 0.5})`);
    grad.addColorStop(0.5, `rgba(255, 80, 10, ${alpha * 0.3})`);
    grad.addColorStop(1, `rgba(200, 50, 0, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - 2 * zoom, cy);
    ctx.lineTo(cx - 1 * zoom, cy - pillarH);
    ctx.lineTo(cx + 1 * zoom, cy - pillarH);
    ctx.lineTo(cx + 2 * zoom, cy);
    ctx.closePath();
    ctx.fill();
  }
}

export function renderMagmaSlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Lava puddle
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 0.8);
  grad.addColorStop(0, `rgba(200, 60, 10, ${alpha * 0.3})`);
  grad.addColorStop(0.5, `rgba(150, 40, 5, ${alpha * 0.15})`);
  grad.addColorStop(1, "rgba(100, 20, 0, 0)");
  ctx.fillStyle = grad;
  drawIsometricEllipse(ctx, pos.x, pos.y, s * 0.8, s * 0.8);
  ctx.fill();

  // Bubbling lava
  for (let i = 0; i < 3; i++) {
    const seed = (now * 0.002 + i * 1.5) % 1;
    const bx = pos.x + Math.sin(i * 2.5 + now * 0.001) * s * 0.4;
    const by = pos.y + Math.sin(i * 1.3) * s * 0.2 * ISO_Y_RATIO - seed * s * 0.2;
    ctx.fillStyle = `rgba(255, 120, 30, ${alpha * 0.4 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(bx, by, (2 + i * 0.5) * zoom, 0, TAU);
    ctx.fill();
  }
}

export function renderMagmaPoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  renderMagmaBurn(ctx, pos, zoom, alpha, now);
}

// ============================================================================
// NECROTIC (dark_fantasy) — dark tendrils and soul siphon
// ============================================================================

export function renderNecroticStun(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Dark tendrils coiling around the unit
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s);
  grad.addColorStop(0, `rgba(60, 20, 80, ${alpha * 0.3})`);
  grad.addColorStop(1, "rgba(30, 10, 50, 0)");
  ctx.fillStyle = grad;
  drawIsometricEllipse(ctx, pos.x, pos.y, s, s);
  ctx.fill();

  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const phase = now * 0.002 + i * 1.26;
    const baseA = (i / 5) * TAU;
    ctx.strokeStyle = `rgba(120, 50, 180, ${alpha * 0.45})`;
    ctx.beginPath();
    const bx = pos.x + Math.cos(baseA) * s * 0.5;
    ctx.moveTo(bx, pos.y + s * 0.15);
    for (let j = 1; j <= 5; j++) {
      const t = j / 5;
      const spiralA = baseA + t * Math.PI + Math.sin(phase) * 0.3;
      const r = s * 0.4 * (1 - t * 0.2);
      ctx.lineTo(
        pos.x + Math.cos(spiralA) * r,
        pos.y + s * 0.15 - t * s * 1.4,
      );
    }
    ctx.stroke();
  }

  // Ghostly wisps
  for (let i = 0; i < 3; i++) {
    const seed = (now * 0.0015 + i * 1.1) % 1;
    const wx = pos.x + Math.sin(now * 0.003 + i * 2.3) * s * 0.5;
    const wy = pos.y - seed * s * 1.2;
    ctx.fillStyle = `rgba(160, 80, 220, ${alpha * 0.3 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(wx, wy, 2 * zoom, 0, TAU);
    ctx.fill();
  }
}

export function renderNecroticSlow(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Spectral chains orbiting
  ctx.strokeStyle = `rgba(140, 70, 200, ${alpha * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * TAU + now * 0.0015;
    const r = s * 0.7;
    // Chain links as small arcs
    for (let j = 0; j < 4; j++) {
      const la = a + (j / 4) * Math.PI * 0.8;
      const lx = pos.x + Math.cos(la) * r;
      const ly = pos.y + Math.sin(la) * r * ISO_Y_RATIO;
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5 * zoom, 0, TAU);
      ctx.stroke();
    }
  }

  // Dark aura base
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s);
  grad.addColorStop(0, `rgba(50, 20, 70, ${alpha * 0.2})`);
  grad.addColorStop(1, "rgba(30, 10, 50, 0)");
  ctx.fillStyle = grad;
  drawIsometricEllipse(ctx, pos.x, pos.y, s, s);
  ctx.fill();
}

export function renderNecroticBurn(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Soul siphon — purple flame-like wisps rising
  const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s);
  grad.addColorStop(0, `rgba(100, 40, 160, ${alpha * 0.25})`);
  grad.addColorStop(1, "rgba(60, 20, 100, 0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, s, 0, TAU);
  ctx.fill();

  for (let i = 0; i < 5; i++) {
    const seed = (now * 0.003 + i * 1.3) % 1;
    const wx = pos.x + Math.sin(now * 0.005 + i * 2.0) * s * 0.4;
    const wy = pos.y - seed * s * 1.4;
    const wSize = (2 + i * 0.3) * zoom * (1 - seed * 0.5);
    ctx.fillStyle = `rgba(180, 100, 255, ${alpha * 0.5 * (1 - seed)})`;
    ctx.beginPath();
    ctx.moveTo(wx, wy - wSize * 1.5);
    ctx.quadraticCurveTo(wx + wSize, wy, wx, wy + wSize * 0.5);
    ctx.quadraticCurveTo(wx - wSize, wy, wx, wy - wSize * 1.5);
    ctx.fill();
  }
}

export function renderNecroticPoison(
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
): void {
  const s = 15 * zoom;
  // Necrotic decay — dark green-purple corruption
  for (let i = 0; i < 5; i++) {
    const seed = (now * 0.002 + i * 0.9) % 1;
    const dx = pos.x + Math.sin(i * 2.1 + now * 0.001) * s * 0.5;
    const dy = pos.y - seed * s * 1.0;
    ctx.fillStyle = `rgba(100, 60, 140, ${alpha * 0.4 * (1 - seed)})`;
    ctx.beginPath();
    ctx.arc(dx, dy, (2 + i * 0.4) * zoom, 0, TAU);
    ctx.fill();
  }
}

// ============================================================================
// DISPATCH — maps flavor string to the correct renderer
// ============================================================================

type FlavorRenderer = (
  ctx: CanvasRenderingContext2D,
  pos: Position,
  zoom: number,
  alpha: number,
  now: number,
) => void;

const STUN_FLAVORS: Record<string, FlavorRenderer> = {
  cocoon: renderCocoonStun,
  vine: renderVineStun,
  mire: renderMireStun,
  sand: renderSandStun,
  frost: renderFrostStun,
  magma: renderMagmaStun,
  necrotic: renderNecroticStun,
};

const BURN_FLAVORS: Record<string, FlavorRenderer> = {
  cocoon: renderCocoonBurn,
  vine: renderVineBurn,
  mire: renderMireBurn,
  sand: renderSandBurn,
  frost: renderFrostBurn,
  magma: renderMagmaBurn,
  necrotic: renderNecroticBurn,
};

const SLOW_FLAVORS: Record<string, FlavorRenderer> = {
  cocoon: renderCocoonSlow,
  vine: renderVineSlow,
  mire: renderMireSlow,
  sand: renderSandSlow,
  frost: renderFrostSlow,
  magma: renderMagmaSlow,
  necrotic: renderNecroticSlow,
};

const POISON_FLAVORS: Record<string, FlavorRenderer> = {
  cocoon: renderCocoonPoison,
  vine: renderVinePoison,
  mire: renderMirePoison,
  sand: renderSandPoison,
  frost: renderFrostPoison,
  magma: renderMagmaPoison,
  necrotic: renderNecroticPoison,
};

export function getFlavoredStunRenderer(flavor?: string): FlavorRenderer | null {
  return (flavor && STUN_FLAVORS[flavor]) || null;
}

export function getFlavoredBurnRenderer(flavor?: string): FlavorRenderer | null {
  return (flavor && BURN_FLAVORS[flavor]) || null;
}

export function getFlavoredSlowRenderer(flavor?: string): FlavorRenderer | null {
  return (flavor && SLOW_FLAVORS[flavor]) || null;
}

export function getFlavoredPoisonRenderer(flavor?: string): FlavorRenderer | null {
  return (flavor && POISON_FLAVORS[flavor]) || null;
}
