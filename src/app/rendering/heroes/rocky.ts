import { ISO_Y_RATIO } from "../../constants";

const SCALE = 1.35;

export function drawRockyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const s = size * SCALE;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const hop = Math.abs(Math.sin(time * 5)) * 4;
  const breathe = Math.sin(time * 2) * 0.018;

  const tossPhase = (time * 1.1) % 1;
  const tossY = -Math.sin(tossPhase * Math.PI) * s * 0.65;
  const tossX = Math.sin(tossPhase * Math.PI) * s * 0.06;

  drawAura(ctx, x, y, s, hop, time, isAttacking, attackIntensity);
  drawDebrisParticles(ctx, x, y, s, hop, time);

  if (isAttacking) {
    drawAttackShockwaves(ctx, x, y, s, hop, attackPhase, attackIntensity, zoom);
  }

  drawShadow(ctx, x, y, s);
  drawSquirrelTail(ctx, x, y, s, hop, time, zoom, isAttacking, attackPhase);
  drawBody(ctx, x, y, s, hop, breathe, zoom, time);
  drawShoulderPads(ctx, x, y, s, hop, time, zoom);
  drawStoneArms(ctx, x, y, s, hop, time, zoom, isAttacking, attackPhase, tossPhase);
  drawHead(ctx, x, y, s, hop, time, zoom, isAttacking, attackIntensity);
  drawIdleStoneToss(ctx, x, y, s, hop, tossX, tossY, time, zoom, isAttacking);

  if (isAttacking) {
    drawGroundCracks(ctx, x, y, s, time, attackIntensity, zoom);
  }
}

// ─── AURA ────────────────────────────────────────────────────────────────────

function drawAura(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  time: number, isAttacking: boolean, attackIntensity: number
) {
  const strength = isAttacking ? 0.45 : 0.18;
  const pulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let layer = 0; layer < 3; layer++) {
    const r = s * (0.85 + layer * 0.13);
    const g = ctx.createRadialGradient(x, y - hop, s * 0.1, x, y - hop, r);
    const a = (strength - layer * 0.05) * pulse;
    g.addColorStop(0, `rgba(180, 140, 60, ${a * 0.4})`);
    g.addColorStop(0.35, `rgba(120, 90, 40, ${a * 0.3})`);
    g.addColorStop(0.65, `rgba(80, 60, 30, ${a * 0.15})`);
    g.addColorStop(1, "rgba(60, 40, 20, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - hop, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gemstone glow from left eye
  const gemGlow = 0.14 + Math.sin(time * 2.5) * 0.07 + (isAttacking ? attackIntensity * 0.18 : 0);
  const gg = ctx.createRadialGradient(
    x - s * 0.12, y - s * 0.54 - hop, 0,
    x - s * 0.12, y - s * 0.54 - hop, s * 0.4
  );
  gg.addColorStop(0, `rgba(0, 220, 255, ${gemGlow})`);
  gg.addColorStop(0.5, `rgba(0, 160, 220, ${gemGlow * 0.3})`);
  gg.addColorStop(1, "rgba(0, 100, 180, 0)");
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(x - s * 0.12, y - s * 0.54 - hop, s * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────

function drawDebrisParticles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number, time: number
) {
  for (let p = 0; p < 12; p++) {
    const angle = (time * 1.2 + p * Math.PI * 2 / 12) % (Math.PI * 2);
    const dist = s * 0.55 + Math.sin(time * 2 + p) * s * 0.12;
    const px = x + Math.cos(angle) * dist;
    const py = y - hop + Math.sin(angle) * dist * 0.5;
    const alpha = 0.35 + Math.sin(time * 2.5 + p * 0.8) * 0.2;
    const r = s * (0.012 + Math.sin(time + p) * 0.006);
    ctx.fillStyle = p % 3 === 0
      ? `rgba(160, 130, 80, ${alpha})`
      : p % 3 === 1
        ? `rgba(120, 95, 55, ${alpha})`
        : `rgba(90, 70, 40, ${alpha})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ATTACK SHOCKWAVES ──────────────────────────────────────────────────────

function drawAttackShockwaves(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  attackPhase: number, attackIntensity: number, zoom: number
) {
  for (let ring = 0; ring < 4; ring++) {
    const phase = (attackPhase * 2 + ring * 0.18) % 1;
    const alpha = (1 - phase) * 0.5 * attackIntensity;
    ctx.strokeStyle = `rgba(140, 100, 50, ${alpha})`;
    ctx.lineWidth = (3.5 - ring * 0.7) * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y - hop, s * (0.55 + phase * 0.6), s * (ISO_Y_RATIO + phase * 0.45), 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ─── SHADOW ──────────────────────────────────────────────────────────────────

function drawShadow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const g = ctx.createRadialGradient(x, y + s * 0.5, 0, x, y + s * 0.5, s * 0.52);
  g.addColorStop(0, "rgba(0,0,0,0.5)");
  g.addColorStop(0.6, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y + s * 0.5, s * 0.5, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── FLUFFY SQUIRREL TAIL ───────────────────────────────────────────────────

function drawSquirrelTail(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  time: number, zoom: number, isAttacking: boolean, attackPhase: number
) {
  const wave1 = Math.sin(time * 4) * 7;
  const wave2 = Math.sin(time * 5.2 + 0.5) * 4;
  const aggro = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 12 : 0;
  const tw = wave1 + aggro;

  // Outer shadow layer
  ctx.fillStyle = "#3a2808";
  ctx.beginPath();
  ctx.moveTo(x + s * 0.24, y + s * 0.26 - hop * 0.3);
  ctx.bezierCurveTo(
    x + s * 0.52 + tw * 0.9, y + s * 0.08 - hop * 0.35,
    x + s * 0.88 + tw, y - s * 0.22 - hop * 0.4,
    x + s * 0.65 + tw * 0.55, y - s * 0.78 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + s * 0.42 + wave2 * 0.35, y - s * 0.46 - hop * 0.35,
    x + s * 0.28, y - s * 0.14 - hop * 0.3,
    x + s * 0.18, y + s * 0.16 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Main fur layer
  const tg = ctx.createLinearGradient(
    x + s * 0.2, y - hop, x + s * 0.65 + tw * 0.4, y - s * 0.65 - hop
  );
  tg.addColorStop(0, "#c08020");
  tg.addColorStop(0.25, "#a86c18");
  tg.addColorStop(0.5, "#b87828");
  tg.addColorStop(0.75, "#9a6014");
  tg.addColorStop(1, "#8a5810");
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.22, y + s * 0.22 - hop * 0.3);
  ctx.bezierCurveTo(
    x + s * 0.48 + tw * 0.85, y + s * 0.02 - hop * 0.35,
    x + s * 0.82 + tw * 0.95, y - s * 0.26 - hop * 0.4,
    x + s * 0.6 + tw * 0.5, y - s * 0.72 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + s * 0.39 + wave2 * 0.28, y - s * 0.42 - hop * 0.35,
    x + s * 0.26, y - s * 0.1 - hop * 0.3,
    x + s * 0.19, y + s * 0.14 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();

  // Highlight stripe
  ctx.fillStyle = "#d8a840";
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.26, y + s * 0.14 - hop * 0.3);
  ctx.bezierCurveTo(
    x + s * 0.4 + tw * 0.65, y - s * 0.06 - hop * 0.35,
    x + s * 0.58 + tw * 0.75, y - s * 0.32 - hop * 0.4,
    x + s * 0.5 + tw * 0.38, y - s * 0.6 - hop * 0.45
  );
  ctx.bezierCurveTo(
    x + s * 0.37 + wave2 * 0.22, y - s * 0.35 - hop * 0.35,
    x + s * 0.27, y - s * 0.04 - hop * 0.3,
    x + s * 0.24, y + s * 0.08 - hop * 0.3
  );
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Fur strand lines
  ctx.strokeStyle = "rgba(60, 40, 10, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    const sx = x + s * 0.26 + t * (s * 0.3 + tw * 0.38);
    const sy = y + s * 0.1 - t * s * 0.6 - hop * (0.3 + t * 0.15);
    const sw = Math.sin(time * 5 + i * 0.55) * s * 0.022;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + s * 0.08 + sw, sy - s * 0.055);
    ctx.stroke();
  }

  // Tail tip glow
  const tipX = x + s * 0.6 + tw * 0.46;
  const tipY = y - s * 0.74 - hop * 0.45;
  const tipPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(220, 180, 80, ${0.4 + tipPulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(tipX, tipY, s * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 220, 120, ${0.3 + tipPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(tipX, tipY, s * 0.035, 0, Math.PI * 2);
  ctx.fill();
}

// ─── BODY ────────────────────────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  breathe: number, zoom: number, time: number
) {
  const bodyW = s * (0.42 + breathe);
  const bodyH = s * (0.46 + breathe * 0.5);

  // Main body
  const g = ctx.createRadialGradient(
    x - s * 0.05, y - hop - s * 0.04, s * 0.1,
    x, y - hop, s * 0.5
  );
  g.addColorStop(0, "#d8a840");
  g.addColorStop(0.25, "#c09030");
  g.addColorStop(0.5, "#a07020");
  g.addColorStop(0.75, "#856018");
  g.addColorStop(1, "#5a3a08");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body outline
  ctx.strokeStyle = "rgba(50, 30, 8, 0.25)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - hop, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Fur texture (more strands, wider spread)
  ctx.strokeStyle = "rgba(60, 40, 10, 0.22)";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 10; i++) {
    const a = -0.8 + i * 0.18;
    const wv = Math.sin(time * 4 + i * 0.7) * s * 0.008;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * s * 0.16, y - hop + Math.sin(a) * s * 0.22);
    ctx.lineTo(x + Math.cos(a) * s * 0.38 + wv, y - hop + Math.sin(a) * s * 0.42);
    ctx.stroke();
  }

  // Side flank fur tufts
  for (let side = -1; side <= 1; side += 2) {
    ctx.fillStyle = side === -1 ? "#9a7018" : "#b08020";
    for (let t = 0; t < 3; t++) {
      const ty = y - hop + s * (-0.15 + t * 0.14);
      const tx = x + side * s * (0.36 + t * 0.02);
      ctx.beginPath();
      ctx.moveTo(tx, ty - s * 0.03);
      ctx.quadraticCurveTo(tx + side * s * 0.06, ty, tx, ty + s * 0.03);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Cream belly
  const belly = ctx.createRadialGradient(
    x, y - hop + s * 0.06, s * 0.03,
    x, y - hop + s * 0.06, s * 0.28
  );
  belly.addColorStop(0, "#fff8e8");
  belly.addColorStop(0.4, "#f0dcc0");
  belly.addColorStop(0.8, "#d8c0a0");
  belly.addColorStop(1, "#c0a880");
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(x, y - hop + s * 0.07, s * 0.26, s * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly fur detail
  ctx.strokeStyle = "rgba(180, 150, 110, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 5; i++) {
    const by = y - hop + s * (-0.05 + i * 0.065);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.08, by);
    ctx.quadraticCurveTo(x, by + s * 0.015, x + s * 0.08, by);
    ctx.stroke();
  }

  // Chest tuft (larger, more layered)
  ctx.fillStyle = "#f0d890";
  ctx.beginPath();
  ctx.moveTo(x - s * 0.09, y - hop - s * 0.22);
  ctx.quadraticCurveTo(x, y - hop - s * 0.3, x + s * 0.09, y - hop - s * 0.22);
  ctx.quadraticCurveTo(x + s * 0.06, y - hop - s * 0.14, x, y - hop - s * 0.1);
  ctx.quadraticCurveTo(x - s * 0.06, y - hop - s * 0.14, x - s * 0.09, y - hop - s * 0.22);
  ctx.fill();
  // Inner tuft highlight
  ctx.fillStyle = "#f8e0a0";
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.05, y - hop - s * 0.21);
  ctx.quadraticCurveTo(x, y - hop - s * 0.26, x + s * 0.05, y - hop - s * 0.21);
  ctx.quadraticCurveTo(x + s * 0.03, y - hop - s * 0.16, x, y - hop - s * 0.13);
  ctx.quadraticCurveTo(x - s * 0.03, y - hop - s * 0.16, x - s * 0.05, y - hop - s * 0.21);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stone fragments
  drawBodyStoneFragments(ctx, x, y, s, hop, zoom);
}

function drawBodyStoneFragments(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number, zoom: number
) {
  const fragments = [
    { ox: -0.2, oy: 0.12, w: 0.1, h: 0.07, rot: 0.3 },
    { ox: 0.14, oy: 0.2, w: 0.085, h: 0.06, rot: -0.4 },
    { ox: -0.25, oy: -0.1, w: 0.09, h: 0.055, rot: 0.6 },
    { ox: 0.23, oy: -0.06, w: 0.08, h: 0.05, rot: -0.2 },
    { ox: -0.1, oy: 0.28, w: 0.07, h: 0.05, rot: 0.5 },
    { ox: 0.06, oy: -0.2, w: 0.065, h: 0.045, rot: -0.6 },
    { ox: -0.3, oy: 0.0, w: 0.065, h: 0.04, rot: 0.2 },
    { ox: 0.28, oy: 0.1, w: 0.06, h: 0.04, rot: -0.5 },
  ];

  for (const frag of fragments) {
    const fx = x + frag.ox * s;
    const fy = y - hop + frag.oy * s;
    const fw = frag.w * s;
    const fh = frag.h * s;

    ctx.save();
    ctx.translate(fx, fy);
    ctx.rotate(frag.rot);

    const fg = ctx.createRadialGradient(-fw * 0.15, -fh * 0.15, 0, 0, 0, fw);
    fg.addColorStop(0, "#9a9288");
    fg.addColorStop(0.4, "#807870");
    fg.addColorStop(0.8, "#605850");
    fg.addColorStop(1, "#484040");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-fw * 0.5, -fh * 0.2);
    ctx.lineTo(-fw * 0.25, -fh * 0.5);
    ctx.lineTo(fw * 0.3, -fh * 0.45);
    ctx.lineTo(fw * 0.5, -fh * 0.05);
    ctx.lineTo(fw * 0.35, fh * 0.45);
    ctx.lineTo(-fw * 0.15, fh * 0.5);
    ctx.lineTo(-fw * 0.5, fh * 0.2);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = "rgba(30, 25, 18, 0.35)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Crack
    ctx.strokeStyle = "rgba(30, 25, 18, 0.5)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(-fw * 0.3, -fh * 0.1);
    ctx.lineTo(fw * 0.15, fh * 0.2);
    ctx.stroke();

    // Highlight edge
    ctx.strokeStyle = "rgba(190, 180, 170, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-fw * 0.25, -fh * 0.48);
    ctx.lineTo(fw * 0.28, -fh * 0.43);
    ctx.stroke();

    ctx.restore();
  }
}

// ─── STONE SHOULDER PADS ────────────────────────────────────────────────────

function drawShoulderPads(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  time: number, zoom: number
) {
  for (let side = -1; side <= 1; side += 2) {
    const padX = x + side * s * 0.37;
    const padY = y - hop - s * 0.2;

    ctx.save();
    ctx.translate(padX, padY);
    ctx.rotate(side * 0.15);

    const padW = s * 0.24;
    const padH = s * 0.18;

    const pg = ctx.createRadialGradient(
      -side * padW * 0.15, -padH * 0.2, padW * 0.1,
      0, 0, padW * 1.1
    );
    pg.addColorStop(0, "#a09890");
    pg.addColorStop(0.25, "#8a8278");
    pg.addColorStop(0.5, "#706860");
    pg.addColorStop(0.75, "#585048");
    pg.addColorStop(1, "#403830");
    ctx.fillStyle = pg;

    ctx.beginPath();
    ctx.moveTo(-padW * 0.88, padH * 0.12);
    ctx.quadraticCurveTo(-padW * 0.92, -padH * 0.55, -padW * 0.42, -padH * 0.85);
    ctx.quadraticCurveTo(0, -padH * 1.05, padW * 0.42, -padH * 0.85);
    ctx.quadraticCurveTo(padW * 0.92, -padH * 0.55, padW * 0.88, padH * 0.12);
    ctx.quadraticCurveTo(padW * 0.55, padH * 0.75, 0, padH * 0.65);
    ctx.quadraticCurveTo(-padW * 0.55, padH * 0.75, -padW * 0.88, padH * 0.12);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = "rgba(30, 25, 20, 0.5)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Major crack
    ctx.strokeStyle = "rgba(25, 20, 15, 0.6)";
    ctx.lineWidth = 1.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.65, -padH * 0.45);
    ctx.lineTo(-padW * 0.12, padH * 0.15);
    ctx.lineTo(padW * 0.35, padH * 0.4);
    ctx.stroke();
    // Branch
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.12, padH * 0.15);
    ctx.lineTo(padW * 0.18, -padH * 0.4);
    ctx.stroke();
    // Secondary
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(padW * 0.38, -padH * 0.25);
    ctx.lineTo(padW * 0.65, padH * 0.08);
    ctx.stroke();
    // Extra fine cracks
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.4, padH * 0.3);
    ctx.lineTo(-padW * 0.15, padH * 0.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padW * 0.5, -padH * 0.55);
    ctx.lineTo(padW * 0.7, -padH * 0.3);
    ctx.stroke();

    // Crack edge highlights
    ctx.strokeStyle = "rgba(180, 170, 160, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.63, -padH * 0.43);
    ctx.lineTo(-padW * 0.1, padH * 0.13);
    ctx.stroke();

    // Top specular highlight
    const hl = ctx.createLinearGradient(0, -padH * 0.95, 0, -padH * 0.2);
    hl.addColorStop(0, "rgba(210, 200, 190, 0.4)");
    hl.addColorStop(1, "rgba(210, 200, 190, 0)");
    ctx.fillStyle = hl;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.38, -padH * 0.78);
    ctx.quadraticCurveTo(0, -padH * 1.0, padW * 0.38, -padH * 0.78);
    ctx.quadraticCurveTo(0, -padH * 0.45, -padW * 0.38, -padH * 0.78);
    ctx.closePath();
    ctx.fill();

    // Ridge line
    ctx.strokeStyle = "rgba(150, 140, 130, 0.4)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-padW * 0.75, -padH * 0.12);
    ctx.quadraticCurveTo(0, -padH * 0.4, padW * 0.75, -padH * 0.12);
    ctx.stroke();

    // Etched rune symbol on pad (subtle)
    ctx.strokeStyle = "rgba(140, 120, 80, 0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(0, -padH * 0.1, padW * 0.15, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -padH * 0.1 - padW * 0.12);
    ctx.lineTo(0, -padH * 0.1 + padW * 0.12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-padW * 0.12, -padH * 0.1);
    ctx.lineTo(padW * 0.12, -padH * 0.1);
    ctx.stroke();

    ctx.restore();
  }
}

// ─── STONE-ARMORED ARMS ─────────────────────────────────────────────────────

function drawStoneArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  time: number, zoom: number, isAttacking: boolean, attackPhase: number,
  tossPhase: number
) {
  const rightIdleLift = isAttacking ? 0 : Math.sin(tossPhase * Math.PI) * 0.4;
  const leftSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2) * 0.7 : Math.sin(time * 2.5) * 0.05;
  const rightSwing = isAttacking ? Math.sin(attackPhase * Math.PI * 2 + 0.5) * 0.8 : rightIdleLift;

  for (let side = -1; side <= 1; side += 2) {
    const swing = side === -1 ? leftSwing : rightSwing;
    ctx.save();
    ctx.translate(x + side * s * 0.33, y - hop - s * 0.05);
    ctx.rotate(side * (-0.85 - swing * 0.6));

    // Fur upper arm (wider)
    const armFur = ctx.createLinearGradient(0, 0, 0, s * 0.1);
    armFur.addColorStop(0, "#c09028");
    armFur.addColorStop(1, "#956818");
    ctx.fillStyle = armFur;
    ctx.beginPath();
    ctx.moveTo(-s * 0.05, 0);
    ctx.quadraticCurveTo(-s * 0.06, s * 0.05, -s * 0.055, s * 0.1);
    ctx.lineTo(s * 0.055, s * 0.09);
    ctx.quadraticCurveTo(s * 0.06, s * 0.04, s * 0.03, 0);
    ctx.closePath();
    ctx.fill();

    // Stone gauntlet (wider, more detailed)
    const stoneGrad = ctx.createLinearGradient(0, s * 0.08, 0, s * 0.26);
    stoneGrad.addColorStop(0, "#908878");
    stoneGrad.addColorStop(0.3, "#787068");
    stoneGrad.addColorStop(0.6, "#605850");
    stoneGrad.addColorStop(1, "#484038");
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.06, s * 0.08);
    ctx.lineTo(-s * 0.065, s * 0.24);
    ctx.lineTo(s * 0.065, s * 0.22);
    ctx.lineTo(s * 0.06, s * 0.08);
    ctx.closePath();
    ctx.fill();

    // Gauntlet outline
    ctx.strokeStyle = "rgba(30, 25, 18, 0.4)";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Cracks on gauntlet
    ctx.strokeStyle = "rgba(40, 30, 20, 0.5)";
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.035, s * 0.1);
    ctx.lineTo(s * 0.012, s * 0.16);
    ctx.lineTo(-s * 0.025, s * 0.22);
    ctx.stroke();
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(s * 0.025, s * 0.11);
    ctx.lineTo(s * 0.04, s * 0.19);
    ctx.stroke();

    // Ridge plate lines
    ctx.strokeStyle = "rgba(160, 150, 140, 0.4)";
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.058, s * 0.085);
    ctx.lineTo(s * 0.058, s * 0.085);
    ctx.stroke();
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-s * 0.055, s * 0.15);
    ctx.lineTo(s * 0.055, s * 0.15);
    ctx.stroke();

    // Knuckle guard
    ctx.fillStyle = "#686058";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.24, s * 0.06, s * 0.025, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(30, 25, 18, 0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Paw (larger)
    const pawG = ctx.createRadialGradient(0, s * 0.27, 0, 0, s * 0.27, s * 0.07);
    pawG.addColorStop(0, "#d8c0a0");
    pawG.addColorStop(0.6, "#c0a080");
    pawG.addColorStop(1, "#907050");
    ctx.fillStyle = pawG;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.27, s * 0.06, s * 0.05, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Paw pads
    ctx.fillStyle = "#a08070";
    ctx.beginPath();
    ctx.arc(-s * 0.022, s * 0.275, s * 0.012, 0, Math.PI * 2);
    ctx.arc(s * 0.015, s * 0.278, s * 0.01, 0, Math.PI * 2);
    ctx.arc(0, s * 0.29, s * 0.008, 0, Math.PI * 2);
    ctx.fill();

    // Claws (sharper)
    ctx.strokeStyle = "#3a2a1a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.lineCap = "round";
    for (let c = 0; c < 5; c++) {
      const ca = -0.9 + c * 0.35;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ca) * s * 0.045, s * 0.27 + Math.sin(ca) * s * 0.035);
      ctx.lineTo(Math.cos(ca) * s * 0.068, s * 0.27 + Math.sin(ca) * s * 0.055);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ─── HALF-GARGOYLE / HALF-SQUIRREL HEAD ─────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  time: number, zoom: number, isAttacking: boolean, attackIntensity: number
) {
  const headY = y - s * 0.55 - hop;
  const gemPulse = Math.sin(time * 2.5) * 0.3 + 0.7;
  const headW = s * 0.34;
  const headH = s * 0.32;

  // RIGHT HALF: squirrel fur
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, headY - s * 0.5, s * 0.6, s * 1.2);
  ctx.clip();
  const rg = ctx.createRadialGradient(
    x + s * 0.05, headY - s * 0.04, s * 0.05,
    x, headY, headW * 1.05
  );
  rg.addColorStop(0, "#d8a840");
  rg.addColorStop(0.35, "#c09030");
  rg.addColorStop(0.65, "#956818");
  rg.addColorStop(1, "#6b4904");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.ellipse(x, headY, headW, headH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // LEFT HALF: stone gargoyle
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - s * 0.6, headY - s * 0.5, s * 0.6, s * 1.2);
  ctx.clip();
  const lg = ctx.createRadialGradient(
    x - s * 0.05, headY - s * 0.04, s * 0.05,
    x, headY, headW * 1.05
  );
  lg.addColorStop(0, "#908880");
  lg.addColorStop(0.35, "#787068");
  lg.addColorStop(0.65, "#585050");
  lg.addColorStop(1, "#3a3434");
  ctx.fillStyle = lg;
  ctx.beginPath();
  ctx.ellipse(x, headY, headW, headH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Center seam
  ctx.strokeStyle = "rgba(80, 60, 40, 0.5)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, headY - headH * 0.92);
  ctx.lineTo(x, headY + headH * 0.92);
  ctx.stroke();

  // Gargoyle cracks (more elaborate)
  ctx.strokeStyle = "rgba(30, 25, 20, 0.55)";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.04, headY - s * 0.25);
  ctx.lineTo(x - s * 0.11, headY - s * 0.12);
  ctx.lineTo(x - s * 0.18, headY + s * 0.02);
  ctx.stroke();
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.11, headY - s * 0.12);
  ctx.lineTo(x - s * 0.25, headY - s * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.09, headY + s * 0.1);
  ctx.lineTo(x - s * 0.2, headY + s * 0.16);
  ctx.stroke();
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.15, headY - s * 0.02);
  ctx.lineTo(x - s * 0.28, headY + s * 0.04);
  ctx.stroke();
  // Highlight edges
  ctx.strokeStyle = "rgba(150, 140, 130, 0.3)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.038, headY - s * 0.24);
  ctx.lineTo(x - s * 0.108, headY - s * 0.11);
  ctx.stroke();

  // Fluffy right cheek
  const cG = ctx.createRadialGradient(
    x + s * 0.16, headY + s * 0.06, s * 0.02,
    x + s * 0.16, headY + s * 0.06, s * 0.13
  );
  cG.addColorStop(0, "#fff8e8");
  cG.addColorStop(0.5, "#f5deb3");
  cG.addColorStop(1, "#e0c8a0");
  ctx.fillStyle = cG;
  ctx.beginPath();
  ctx.ellipse(x + s * 0.16, headY + s * 0.06, s * 0.12, s * 0.1, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Stone cheek detail (left)
  ctx.fillStyle = "rgba(100, 90, 80, 0.2)";
  ctx.beginPath();
  ctx.ellipse(x - s * 0.16, headY + s * 0.06, s * 0.1, s * 0.08, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  drawSquirrelEar(ctx, x, headY, s, 1, zoom);
  drawGargoyleEar(ctx, x, headY, s, zoom);

  // Muzzle
  const mG = ctx.createRadialGradient(x, headY + s * 0.11, s * 0.02, x, headY + s * 0.11, s * 0.14);
  mG.addColorStop(0, "#f0e0c8");
  mG.addColorStop(0.5, "#d8c8b0");
  mG.addColorStop(1, "#b0a090");
  ctx.fillStyle = mG;
  ctx.beginPath();
  ctx.ellipse(x, headY + s * 0.11, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  drawRightEye(ctx, x, headY, s, zoom, isAttacking, attackIntensity);
  drawGemstoneLeftEye(ctx, x, headY, s, time, zoom, isAttacking, attackIntensity, gemPulse);

  // Eyebrows
  ctx.lineCap = "round";
  const browAnger = isAttacking ? s * 0.035 : s * 0.012;
  ctx.strokeStyle = "#5a4008";
  ctx.lineWidth = 2.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + s * 0.22, headY - s * 0.09);
  ctx.quadraticCurveTo(x + s * 0.13, headY - s * 0.15 - browAnger, x + s * 0.04, headY - s * 0.1);
  ctx.stroke();
  ctx.strokeStyle = "#4a4440";
  ctx.lineWidth = 2.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.22, headY - s * 0.08);
  ctx.quadraticCurveTo(x - s * 0.13, headY - s * 0.16 - browAnger, x - s * 0.04, headY - s * 0.1);
  ctx.stroke();

  // Nose
  const nG = ctx.createRadialGradient(x, headY + s * 0.09, 0, x, headY + s * 0.09, s * 0.045);
  nG.addColorStop(0, "#4a2a15");
  nG.addColorStop(0.7, "#3a1a0a");
  nG.addColorStop(1, "#2a0a00");
  ctx.fillStyle = nG;
  ctx.beginPath();
  ctx.ellipse(x, headY + s * 0.09, s * 0.045, s * 0.036, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a4a3a";
  ctx.beginPath();
  ctx.arc(x - s * 0.014, headY + s * 0.076, s * 0.014, 0, Math.PI * 2);
  ctx.fill();

  // Whiskers (right only)
  ctx.strokeStyle = "#4a3a20";
  ctx.lineWidth = 0.9 * zoom;
  ctx.globalAlpha = 0.5;
  for (let w = 0; w < 3; w++) {
    const ww = Math.sin(time * 3.5 + w * 0.5) * s * 0.012;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.12, headY + s * 0.1 + w * s * 0.028);
    ctx.lineTo(x + s * 0.32 + ww, headY + s * 0.08 + w * s * 0.038);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Mouth
  if (isAttacking) {
    ctx.fillStyle = "#2a0a00";
    ctx.beginPath();
    ctx.ellipse(x, headY + s * 0.17, s * 0.07, s * 0.045 * attackIntensity, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - s * 0.035, headY + s * 0.14);
    ctx.lineTo(x - s * 0.022, headY + s * 0.21);
    ctx.lineTo(x - s * 0.009, headY + s * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.035, headY + s * 0.14);
    ctx.lineTo(x + s * 0.022, headY + s * 0.21);
    ctx.lineTo(x + s * 0.009, headY + s * 0.14);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.strokeStyle = "#3a1a0a";
    ctx.lineWidth = 1.6 * zoom;
    ctx.beginPath();
    ctx.arc(x, headY + s * 0.15, s * 0.055, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
}

function drawSquirrelEar(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number,
  side: number, zoom: number
) {
  const earX = x + side * s * 0.25;
  const earY = headY - s * 0.25;

  ctx.fillStyle = "#956818";
  ctx.beginPath();
  ctx.ellipse(earX, earY, s * 0.1, s * 0.16, side * 0.35, 0, Math.PI * 2);
  ctx.fill();

  const inner = ctx.createRadialGradient(earX, earY + s * 0.02, 0, earX, earY + s * 0.02, s * 0.1);
  inner.addColorStop(0, "#f5d0b8");
  inner.addColorStop(0.7, "#d4a040");
  inner.addColorStop(1, "#b08020");
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.ellipse(earX, earY + s * 0.02, s * 0.068, s * 0.12, side * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Tufts (more elaborate)
  ctx.fillStyle = "#c0a040";
  ctx.beginPath();
  ctx.moveTo(earX - side * s * 0.01, earY - s * 0.14);
  ctx.lineTo(earX + side * s * 0.02, earY - s * 0.25);
  ctx.lineTo(earX + side * s * 0.04, earY - s * 0.22);
  ctx.lineTo(earX + side * s * 0.05, earY - s * 0.28);
  ctx.lineTo(earX + side * s * 0.06, earY - s * 0.24);
  ctx.lineTo(earX + side * s * 0.04, earY - s * 0.12);
  ctx.closePath();
  ctx.fill();
  // Secondary tuft
  ctx.fillStyle = "#a88830";
  ctx.beginPath();
  ctx.moveTo(earX + side * s * 0.01, earY - s * 0.12);
  ctx.lineTo(earX + side * s * 0.025, earY - s * 0.2);
  ctx.lineTo(earX + side * s * 0.04, earY - s * 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawGargoyleEar(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number, zoom: number
) {
  const earX = x - s * 0.25;
  const earY = headY - s * 0.28;

  const hG = ctx.createLinearGradient(earX, earY + s * 0.12, earX, earY - s * 0.18);
  hG.addColorStop(0, "#787068");
  hG.addColorStop(0.5, "#605850");
  hG.addColorStop(1, "#484040");
  ctx.fillStyle = hG;
  ctx.beginPath();
  ctx.moveTo(earX + s * 0.07, headY - s * 0.16);
  ctx.lineTo(earX + s * 0.02, earY - s * 0.14);
  ctx.lineTo(earX - s * 0.05, earY - s * 0.1);
  ctx.lineTo(earX - s * 0.08, headY - s * 0.12);
  ctx.closePath();
  ctx.fill();

  // Outline
  ctx.strokeStyle = "rgba(30, 25, 20, 0.45)";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Crack
  ctx.strokeStyle = "rgba(30, 25, 20, 0.5)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(earX + s * 0.03, headY - s * 0.18);
  ctx.lineTo(earX - s * 0.02, earY - s * 0.05);
  ctx.stroke();

  // Highlight
  ctx.strokeStyle = "rgba(170, 160, 150, 0.35)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(earX + s * 0.065, headY - s * 0.16);
  ctx.lineTo(earX + s * 0.015, earY - s * 0.13);
  ctx.stroke();
}

function drawRightEye(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number, zoom: number,
  isAttacking: boolean, attackIntensity: number
) {
  const eyeX = x + s * 0.12;
  const eyeY = headY - s * 0.02;
  const sc = isAttacking ? 1.15 : 1;

  const wg = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.1 * sc);
  wg.addColorStop(0, "#ffffff");
  wg.addColorStop(0.7, "#f8f8f0");
  wg.addColorStop(1, "#1a1a1a");
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, s * 0.1 * sc, s * 0.11 * sc, 0.1, 0, Math.PI * 2);
  ctx.fill();

  const irisColor = isAttacking ? `rgba(200, 140, 30, ${0.85 + attackIntensity * 0.15})` : "#b08020";
  if (isAttacking) { ctx.shadowColor = "#ffa000"; ctx.shadowBlur = 7 * zoom; }
  ctx.fillStyle = irisColor;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.06 * sc, 0, Math.PI * 2);
  ctx.fill();

  // Inner iris ring
  ctx.fillStyle = isAttacking ? "#c0a010" : "#907018";
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.04 * sc, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#1a1a1a";
  if (isAttacking) {
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, s * 0.015, s * 0.045 * sc, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.028, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(eyeX - s * 0.028, eyeY - s * 0.028, s * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(eyeX + s * 0.016, eyeY + s * 0.012, s * 0.009, 0, Math.PI * 2);
  ctx.fill();
}

function drawGemstoneLeftEye(
  ctx: CanvasRenderingContext2D,
  x: number, headY: number, s: number,
  time: number, zoom: number,
  isAttacking: boolean, attackIntensity: number, gemPulse: number
) {
  const eyeX = x - s * 0.12;
  const eyeY = headY - s * 0.02;
  const sc = isAttacking ? 1.15 : 1;

  // Stone socket
  const sG = ctx.createRadialGradient(eyeX, eyeY, s * 0.04, eyeX, eyeY, s * 0.12 * sc);
  sG.addColorStop(0, "#484040");
  sG.addColorStop(0.6, "#3a3434");
  sG.addColorStop(1, "#2a2424");
  ctx.fillStyle = sG;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, s * 0.11 * sc, s * 0.12 * sc, -0.1, 0, Math.PI * 2);
  ctx.fill();

  const glowI = isAttacking ? 1 + attackIntensity * 0.5 : gemPulse;
  ctx.shadowColor = "#00e0ff";
  ctx.shadowBlur = 12 * zoom * glowI;

  const gO = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.08 * sc);
  gO.addColorStop(0, "#80ffff");
  gO.addColorStop(0.3, "#40d0e0");
  gO.addColorStop(0.6, "#00a0c0");
  gO.addColorStop(1, "#006080");
  ctx.fillStyle = gO;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.08 * sc, 0, Math.PI * 2);
  ctx.fill();

  // Facets
  ctx.fillStyle = `rgba(180, 255, 255, ${0.4 + gemPulse * 0.25})`;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + time * 0.8;
    const r1 = s * 0.075 * sc;
    const r2 = s * 0.028 * sc;
    const px1 = eyeX + Math.cos(a) * r1;
    const py1 = eyeY + Math.sin(a) * r1;
    const px2 = eyeX + Math.cos(a + Math.PI / 6) * r2;
    const py2 = eyeY + Math.sin(a + Math.PI / 6) * r2;
    if (i === 0) ctx.moveTo(px1, py1);
    else ctx.lineTo(px1, py1);
    ctx.lineTo(px2, py2);
  }
  ctx.closePath();
  ctx.fill();

  // Core
  ctx.fillStyle = `rgba(200, 255, 255, ${0.6 + gemPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, s * 0.028 * sc, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.5 + Math.sin(time * 4) * 0.2;
  ctx.beginPath();
  ctx.arc(eyeX - s * 0.022, eyeY - s * 0.022, s * 0.016, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.shadowBlur = 0;
}

// ─── IDLE STONE TOSS ────────────────────────────────────────────────────────

function drawIdleStoneToss(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number, hop: number,
  tossX: number, tossY: number,
  time: number, zoom: number, isAttacking: boolean
) {
  if (isAttacking) return;

  const pawBaseX = x + s * 0.38;
  const pawBaseY = y - s * 0.35 - hop;
  const stoneX = pawBaseX + tossX;
  const stoneY = pawBaseY + tossY;
  const stoneRot = time * 2.2;
  const r = s * 0.15;

  // Ground shadow
  const shadowScale = 1 + (-tossY / (s * 0.65)) * 0.3;
  const shadowAlpha = 0.25 - (-tossY / (s * 0.65)) * 0.12;
  ctx.fillStyle = `rgba(0,0,0,${Math.max(shadowAlpha, 0.06)})`;
  ctx.beginPath();
  ctx.ellipse(
    pawBaseX + tossX * 0.5,
    y + s * 0.48,
    s * 0.12 * shadowScale,
    s * 0.035 * shadowScale,
    0, 0, Math.PI * 2
  );
  ctx.fill();

  ctx.save();
  ctx.translate(stoneX, stoneY);
  ctx.rotate(stoneRot);

  const sg = ctx.createRadialGradient(-r * 0.15, -r * 0.15, r * 0.05, 0, 0, r * 1.1);
  sg.addColorStop(0, "#b0a898");
  sg.addColorStop(0.25, "#908878");
  sg.addColorStop(0.5, "#787068");
  sg.addColorStop(0.75, "#605850");
  sg.addColorStop(1, "#484038");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-r * 0.85, -r * 0.25);
  ctx.lineTo(-r * 0.55, -r * 0.82);
  ctx.lineTo(-r * 0.1, -r * 0.92);
  ctx.lineTo(r * 0.4, -r * 0.78);
  ctx.lineTo(r * 0.82, -r * 0.4);
  ctx.lineTo(r * 0.9, r * 0.15);
  ctx.lineTo(r * 0.65, r * 0.7);
  ctx.lineTo(r * 0.1, r * 0.88);
  ctx.lineTo(-r * 0.45, r * 0.75);
  ctx.lineTo(-r * 0.85, r * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(30, 25, 18, 0.5)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.stroke();

  // Cracks
  ctx.strokeStyle = "rgba(25, 18, 10, 0.6)";
  ctx.lineWidth = 1.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(-r * 0.65, -r * 0.5);
  ctx.lineTo(-r * 0.1, r * 0.05);
  ctx.lineTo(r * 0.4, r * 0.5);
  ctx.stroke();
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-r * 0.1, r * 0.05);
  ctx.lineTo(r * 0.35, -r * 0.4);
  ctx.stroke();
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(r * 0.15, r * 0.25);
  ctx.lineTo(r * 0.65, r * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r * 0.35, -r * 0.2);
  ctx.lineTo(-r * 0.7, r * 0.1);
  ctx.stroke();

  // Highlights
  ctx.strokeStyle = "rgba(180, 170, 160, 0.25)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(-r * 0.63, -r * 0.48);
  ctx.lineTo(-r * 0.08, r * 0.03);
  ctx.stroke();

  const hlG = ctx.createRadialGradient(-r * 0.3, -r * 0.45, 0, -r * 0.3, -r * 0.45, r * 0.5);
  hlG.addColorStop(0, "rgba(220, 210, 200, 0.4)");
  hlG.addColorStop(0.5, "rgba(200, 190, 180, 0.15)");
  hlG.addColorStop(1, "rgba(200, 190, 180, 0)");
  ctx.fillStyle = hlG;
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.45, r * 0.4, r * 0.3, -0.4, 0, Math.PI * 2);
  ctx.fill();

  const shG = ctx.createRadialGradient(r * 0.3, r * 0.35, 0, r * 0.3, r * 0.35, r * 0.55);
  shG.addColorStop(0, "rgba(30, 25, 20, 0.25)");
  shG.addColorStop(1, "rgba(30, 25, 20, 0)");
  ctx.fillStyle = shG;
  ctx.beginPath();
  ctx.ellipse(r * 0.3, r * 0.35, r * 0.45, r * 0.35, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Speckles
  ctx.fillStyle = "rgba(60, 50, 40, 0.3)";
  const speckles = [
    [-0.4, 0.3], [0.5, -0.3], [-0.15, -0.55],
    [0.25, 0.55], [-0.55, -0.05], [0.6, -0.05],
    [0.0, -0.7], [-0.3, 0.55],
  ];
  for (const [sx, sy] of speckles) {
    ctx.beginPath();
    ctx.arc(sx * r, sy * r, r * 0.032, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ─── GROUND CRACKS ──────────────────────────────────────────────────────────

function drawGroundCracks(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, attackIntensity: number, zoom: number
) {
  ctx.strokeStyle = `rgba(100, 70, 30, ${0.5 * attackIntensity})`;
  ctx.lineWidth = 2 * zoom;
  for (let c = 0; c < 6; c++) {
    const a = c * Math.PI * 2 / 6 + time * 0.4;
    const len = s * (0.28 + attackIntensity * 0.28);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * s * 0.14, y + s * 0.48);
    ctx.lineTo(
      x + Math.cos(a) * len,
      y + s * 0.48 + Math.sin(a + 0.3) * s * 0.07
    );
    ctx.stroke();
  }
}
