import type { Position } from "../../types";

export function drawIvyHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  const s = size;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const naturePulse = Math.sin(time * 2.5) * 0.5 + 0.5;
  const breathe = Math.sin(time * 1.8) * 2.5;
  const idleSway = Math.sin(time * 0.8) * s * 0.01;
  const vineWave = Math.sin(time * 1.2) * 0.15;
  const leafRustle = Math.sin(time * 3) * 0.1;
  const mossGlow = 0.5 + Math.sin(time * 2) * 0.2;

  drawRootSystem(ctx, x, y, s, time, zoom, naturePulse);
  drawVineTentacles(ctx, x, y, s, time, zoom, naturePulse, "back");
  drawLeafCape(ctx, x + idleSway, y, s, time, zoom, naturePulse, vineWave);
  drawBody(ctx, x + idleSway, y, s, breathe, time, zoom, naturePulse);
  drawWoodArmor(ctx, x + idleSway, y, s, time, zoom, naturePulse, mossGlow);
  drawHarness(ctx, x + idleSway, y, s, time, zoom, naturePulse);
  drawShoulderGuards(ctx, x + idleSway, y, s, time, zoom, naturePulse, mossGlow);
  drawArms(ctx, x + idleSway, y, s, time, zoom, isAttacking, attackIntensity);
  drawCrookedStaff(ctx, x + idleSway, y, s, time, zoom, naturePulse, mossGlow);
  drawHead(ctx, x + idleSway, y, s, time, zoom, naturePulse);
  drawWoodCrown(ctx, x + idleSway, y, s, time, zoom, naturePulse, leafRustle);
  drawVineTentacles(ctx, x, y, s, time, zoom, naturePulse, "front");
  drawNatureAura(ctx, x, y, s, time, naturePulse, isAttacking, zoom);
  if (isAttacking) {
    drawAttackVines(ctx, x, y, s, attackIntensity, time, zoom);
  }
}

// ─── ROOT SYSTEM ────────────────────────────────────────────────────────────

function drawRootSystem(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number,
) {
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + time * 0.2;
    const rootLen = s * (0.28 + Math.sin(time * 0.4 + i * 0.9) * 0.06);
    const rootX = x + Math.cos(angle) * rootLen;
    const rootY = y + s * 0.32 + Math.sin(angle) * rootLen * 0.3;
    const rootAlpha = 0.2 + naturePulse * 0.12;
    const thickness = (2.5 + Math.sin(i * 1.3) * 1) * zoom;

    ctx.strokeStyle = `rgba(30, 100, 50, ${rootAlpha})`;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.26);
    ctx.bezierCurveTo(
      x + Math.cos(angle) * rootLen * 0.35, y + s * 0.3 + Math.sin(angle) * rootLen * 0.1,
      x + Math.cos(angle) * rootLen * 0.7, y + s * 0.28 + Math.sin(angle) * rootLen * 0.25,
      rootX, rootY,
    );
    ctx.stroke();

    // Root tip glow
    if (i % 2 === 0) {
      ctx.fillStyle = `rgba(52, 211, 153, ${rootAlpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(rootX, rootY, s * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── VINE TENTACLES ─────────────────────────────────────────────────────────

function drawVineTentacles(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number,
  layer: "back" | "front",
) {
  const tentacles = layer === "back"
    ? [
      { angle: 0.8, len: 0.50, phase: 0 },
      { angle: 1.4, len: 0.42, phase: 1.2 },
      { angle: 2.1, len: 0.46, phase: 2.5 },
      { angle: 2.8, len: 0.38, phase: 3.8 },
    ]
    : [
      { angle: -0.5, len: 0.48, phase: 0.6 },
      { angle: -1.2, len: 0.44, phase: 1.8 },
      { angle: -2.0, len: 0.40, phase: 3.1 },
    ];

  for (const vine of tentacles) {
    const baseAngle = vine.angle + Math.sin(time * 0.6 + vine.phase) * 0.2;
    const vineLen = s * vine.len;
    const sway1 = Math.sin(time * 1.3 + vine.phase) * s * 0.07;
    const sway2 = Math.sin(time * 1.8 + vine.phase * 1.3) * s * 0.05;

    const startX = x + Math.cos(baseAngle) * s * 0.12;
    const startY = y + Math.sin(baseAngle) * s * 0.08;
    const midX = startX + Math.cos(baseAngle) * vineLen * 0.5 + sway1;
    const midY = startY + Math.sin(baseAngle) * vineLen * 0.3 + s * 0.05;
    const endX = startX + Math.cos(baseAngle) * vineLen + sway2;
    const endY = startY + Math.sin(baseAngle) * vineLen * 0.4 + s * 0.08;

    // Main tendril body
    const vineGrad = ctx.createLinearGradient(startX, startY, endX, endY);
    vineGrad.addColorStop(0, `rgba(20, 120, 70, ${0.7 + naturePulse * 0.15})`);
    vineGrad.addColorStop(0.4, `rgba(5, 150, 105, ${0.6 + naturePulse * 0.1})`);
    vineGrad.addColorStop(0.8, `rgba(16, 185, 129, ${0.4})`);
    vineGrad.addColorStop(1, `rgba(52, 211, 153, ${0.15})`);

    ctx.strokeStyle = vineGrad;
    ctx.lineWidth = (3 - vine.len * 2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(midX, midY, endX - sway1 * 0.3, endY - s * 0.02, endX, endY);
    ctx.stroke();

    // Thorns along vine
    for (let t = 0; t < 4; t++) {
      const tFrac = 0.2 + t * 0.2;
      const tx = startX + (endX - startX) * tFrac + Math.sin(time * 1.5 + t + vine.phase) * s * 0.015;
      const ty = startY + (endY - startY) * tFrac + s * 0.03 * tFrac;
      const thornSide = t % 2 === 0 ? 1 : -1;
      const thornLen = s * 0.018;

      ctx.strokeStyle = `rgba(20, 100, 60, 0.4)`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + thornSide * thornLen * 0.7, ty - thornLen);
      ctx.stroke();
    }

    // Leaves along vine
    for (let l = 0; l < 3; l++) {
      const lFrac = 0.25 + l * 0.25;
      const lx = startX + (endX - startX) * lFrac + Math.sin(time * 2.2 + l + vine.phase) * s * 0.02;
      const ly = startY + (endY - startY) * lFrac + s * 0.03 * lFrac;
      const leafSize = s * (0.022 + l * 0.003);
      const leafAngle = baseAngle + Math.sin(time * 2.5 + l * 1.5) * 0.3;
      const lAlpha = 0.5 + naturePulse * 0.25;

      ctx.fillStyle = `rgba(34, 197, 94, ${lAlpha})`;
      ctx.beginPath();
      ctx.ellipse(lx, ly, leafSize, leafSize * 0.4, leafAngle, 0, Math.PI * 2);
      ctx.fill();

      // Leaf vein
      ctx.strokeStyle = `rgba(22, 163, 74, ${lAlpha * 0.4})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx - Math.cos(leafAngle) * leafSize * 0.7, ly - Math.sin(leafAngle) * leafSize * 0.3);
      ctx.lineTo(lx + Math.cos(leafAngle) * leafSize * 0.7, ly + Math.sin(leafAngle) * leafSize * 0.3);
      ctx.stroke();
    }

    // Curling tendril tip
    const curlAngle = baseAngle + Math.sin(time * 2 + vine.phase) * 0.6;
    const curlLen = s * 0.04;
    ctx.strokeStyle = `rgba(52, 211, 153, ${0.3 + naturePulse * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.quadraticCurveTo(
      endX + Math.cos(curlAngle) * curlLen,
      endY + Math.sin(curlAngle) * curlLen * 0.5,
      endX + Math.cos(curlAngle + 1) * curlLen * 0.6,
      endY + Math.sin(curlAngle + 1) * curlLen * 0.4,
    );
    ctx.stroke();
  }
}

// ─── LEAF CAPE ──────────────────────────────────────────────────────────────

function drawLeafCape(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, vineWave: number,
) {
  // Cape body - layered leaves
  const capeGrad = ctx.createLinearGradient(x, y - s * 0.18, x, y + s * 0.38);
  capeGrad.addColorStop(0, "#143828");
  capeGrad.addColorStop(0.25, "#0d3020");
  capeGrad.addColorStop(0.5, "#0a2818");
  capeGrad.addColorStop(0.75, "#082010");
  capeGrad.addColorStop(1, `rgba(5, 18, 10, 0.5)`);

  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.2, y - s * 0.16);
  ctx.bezierCurveTo(
    x - s * 0.32, y + s * 0.05 + vineWave * s * 0.04,
    x - s * 0.28, y + s * 0.25,
    x - s * 0.24, y + s * 0.38,
  );
  ctx.lineTo(x + s * 0.24, y + s * 0.38);
  ctx.bezierCurveTo(
    x + s * 0.28, y + s * 0.25,
    x + s * 0.32, y + s * 0.05 - vineWave * s * 0.04,
    x + s * 0.2, y - s * 0.16,
  );
  ctx.closePath();
  ctx.fill();

  // Cape edge — scalloped leaf shapes
  const edgeCount = 10;
  for (let i = 0; i < edgeCount; i++) {
    const t = i / edgeCount;
    const edgeX = x - s * 0.24 + t * s * 0.48;
    const edgeY = y + s * 0.36 + Math.sin(time * 1.5 + i * 0.8) * s * 0.015;
    const edgeSize = s * 0.025;
    const edgeAngle = Math.sin(time * 1.2 + i * 0.6) * 0.3;

    ctx.fillStyle = `rgba(20, 80, 40, ${0.4 + naturePulse * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(edgeX, edgeY, edgeSize, edgeSize * 0.55, edgeAngle, 0, Math.PI);
    ctx.fill();
  }

  // Vine embroidery on cape
  for (let i = 0; i < 5; i++) {
    const embY = y - s * 0.02 + i * s * 0.07;
    const embWidth = s * (0.14 + i * 0.025);
    const embSway = Math.sin(time * 1.3 + i * 0.7) * s * 0.01;

    ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + naturePulse * 0.08})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - embWidth + embSway, embY);
    ctx.bezierCurveTo(
      x - embWidth * 0.3, embY - s * 0.02,
      x + embWidth * 0.3, embY + s * 0.01,
      x + embWidth + embSway, embY,
    );
    ctx.stroke();
  }

  // Cape clasp at collar
  for (let side = -1; side <= 1; side += 2) {
    const claspX = x + side * s * 0.15;
    const claspY = y - s * 0.16;
    const clR = s * 0.018;
    const clGrad = ctx.createRadialGradient(claspX, claspY, 0, claspX, claspY, clR);
    clGrad.addColorStop(0, "#a7f3d0");
    clGrad.addColorStop(0.5, "#34d399");
    clGrad.addColorStop(1, "#065f46");
    ctx.fillStyle = clGrad;
    ctx.beginPath();
    ctx.arc(claspX, claspY, clR, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── BODY ───────────────────────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  breathe: number, time: number, zoom: number, naturePulse: number,
) {
  const bodyGrad = ctx.createRadialGradient(x, y - s * 0.02, s * 0.04, x, y + s * 0.02, s * 0.32);
  bodyGrad.addColorStop(0, "#2d5a3f");
  bodyGrad.addColorStop(0.2, "#1e4830");
  bodyGrad.addColorStop(0.5, "#153822");
  bodyGrad.addColorStop(0.8, "#0d2818");
  bodyGrad.addColorStop(1, "#081a10");

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, s * (0.20 + breathe * 0.002), s * (0.28 + breathe * 0.003), 0, 0, Math.PI * 2);
  ctx.fill();

  // Living edge rim light
  ctx.strokeStyle = `rgba(52, 211, 153, ${0.2 + naturePulse * 0.12})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.20, s * 0.28, 0, -0.6, Math.PI * 0.5);
  ctx.stroke();

  // Bark texture rows
  for (let row = 0; row < 7; row++) {
    const rowY = y - s * 0.18 + row * s * 0.06;
    const rowW = s * 0.17 * Math.sin(((row + 0.5) / 7) * Math.PI);
    const segments = 2 + Math.min(row, 3);
    for (let seg = 0; seg < segments; seg++) {
      const segX = x - rowW + (seg / (segments - 1)) * rowW * 2;
      const segW = (rowW * 2) / segments * 0.55;
      ctx.fillStyle = `rgba(20, 60, 35, ${0.12 + Math.sin(time * 1.5 + row + seg) * 0.03})`;
      ctx.beginPath();
      ctx.ellipse(segX, rowY, segW, s * 0.012, 0, 0, Math.PI);
      ctx.fill();
    }
  }
}

// ─── WOOD ARMOR (chest plate + belt) ────────────────────────────────────────

function drawWoodArmor(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, mossGlow: number,
) {
  // Chest plate — layered wood grain
  const plateGrad = ctx.createLinearGradient(x - s * 0.14, y - s * 0.17, x + s * 0.14, y + s * 0.06);
  plateGrad.addColorStop(0, "#4a3018");
  plateGrad.addColorStop(0.2, "#5a3e22");
  plateGrad.addColorStop(0.5, "#6b4a28");
  plateGrad.addColorStop(0.8, "#5a3e22");
  plateGrad.addColorStop(1, "#3a2510");

  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.14, y - s * 0.18);
  ctx.quadraticCurveTo(x - s * 0.17, y - s * 0.04, x - s * 0.1, y + s * 0.07);
  ctx.lineTo(x + s * 0.1, y + s * 0.07);
  ctx.quadraticCurveTo(x + s * 0.17, y - s * 0.04, x + s * 0.14, y - s * 0.18);
  ctx.closePath();
  ctx.fill();

  // Plate border — bark edge
  ctx.strokeStyle = "#2a1a08";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Wood grain lines
  for (let g = 0; g < 5; g++) {
    const gy = y - s * 0.14 + g * s * 0.04;
    const gw = s * (0.1 + g * 0.008) * Math.sin(((g + 0.5) / 5) * Math.PI);
    ctx.strokeStyle = `rgba(90, 62, 32, ${0.2 + g * 0.02})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - gw, gy);
    ctx.quadraticCurveTo(x, gy + s * 0.008 * (g % 2 === 0 ? 1 : -1), x + gw, gy);
    ctx.stroke();
  }

  // Central leaf rune
  const runeGlow = 0.4 + naturePulse * 0.6;
  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 5 * zoom;

  ctx.strokeStyle = `rgba(52, 211, 153, ${runeGlow})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.14);
  ctx.quadraticCurveTo(x + s * 0.05, y - s * 0.06, x, y - s * 0.01);
  ctx.quadraticCurveTo(x - s * 0.05, y - s * 0.06, x, y - s * 0.14);
  ctx.stroke();

  // Rune veins
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - s * 0.08);
  ctx.lineTo(x - s * 0.035, y - s * 0.04);
  ctx.moveTo(x, y - s * 0.08);
  ctx.lineTo(x + s * 0.035, y - s * 0.04);
  ctx.moveTo(x, y - s * 0.1);
  ctx.lineTo(x - s * 0.02, y - s * 0.12);
  ctx.moveTo(x, y - s * 0.1);
  ctx.lineTo(x + s * 0.02, y - s * 0.12);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Moss patches on armor
  const mossPts = [
    { dx: -0.1, dy: -0.1, r: 0.02 },
    { dx: 0.08, dy: -0.05, r: 0.015 },
    { dx: -0.06, dy: 0.03, r: 0.018 },
  ];
  for (const mp of mossPts) {
    ctx.fillStyle = `rgba(34, 197, 94, ${0.2 + mossGlow * 0.15})`;
    ctx.beginPath();
    ctx.arc(x + mp.dx * s, y + mp.dy * s, mp.r * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Belt
  const beltY = y + s * 0.06;
  ctx.fillStyle = "#3a2510";
  ctx.fillRect(x - s * 0.16, beltY, s * 0.32, s * 0.035);
  ctx.strokeStyle = "#2a1a08";
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(x - s * 0.16, beltY, s * 0.32, s * 0.035);

  // Belt vine inlay
  ctx.strokeStyle = `rgba(16, 185, 129, 0.25)`;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.14, beltY + s * 0.017);
  ctx.bezierCurveTo(x - s * 0.05, beltY + s * 0.008, x + s * 0.05, beltY + s * 0.026, x + s * 0.14, beltY + s * 0.017);
  ctx.stroke();

  // Belt buckle — wooden with emerald
  const buckleR = s * 0.022;
  const bGrad = ctx.createRadialGradient(x, beltY + s * 0.017, 0, x, beltY + s * 0.017, buckleR);
  bGrad.addColorStop(0, "#6b4a28");
  bGrad.addColorStop(0.6, "#4a3018");
  bGrad.addColorStop(1, "#2a1a08");
  ctx.fillStyle = bGrad;
  ctx.beginPath();
  ctx.arc(x, beltY + s * 0.017, buckleR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(52, 211, 153, ${0.6 + naturePulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, beltY + s * 0.017, buckleR * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

// ─── HARNESS ────────────────────────────────────────────────────────────────

function drawHarness(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number,
) {
  for (let side = -1; side <= 1; side += 2) {
    const topX = x + side * s * 0.16;
    const topY = y - s * 0.2;
    const botX = x - side * s * 0.08;
    const botY = y + s * 0.08;

    // Vine-wrapped leather strap
    ctx.strokeStyle = "#3a2510";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(botX, botY);
    ctx.stroke();

    // Tiny vine wrap
    ctx.strokeStyle = `rgba(16, 185, 129, 0.3)`;
    ctx.lineWidth = 0.7 * zoom;
    for (let v = 0; v < 4; v++) {
      const t = 0.15 + v * 0.2;
      const vx = topX + (botX - topX) * t;
      const vy = topY + (botY - topY) * t;
      ctx.beginPath();
      ctx.arc(vx + side * 1.5 * zoom, vy, s * 0.01, 0, Math.PI);
      ctx.stroke();
    }

    // Wooden rivets
    for (let r = 0; r < 3; r++) {
      const t = 0.2 + r * 0.3;
      const rx = topX + (botX - topX) * t;
      const ry = topY + (botY - topY) * t;
      ctx.fillStyle = "#5a3e22";
      ctx.beginPath();
      ctx.arc(rx, ry, s * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── SHOULDER GUARDS ────────────────────────────────────────────────────────

function drawShoulderGuards(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, mossGlow: number,
) {
  for (let side = -1; side <= 1; side += 2) {
    const sx = x + side * s * 0.23;
    const sy = y - s * 0.15;

    // Layered bark plates
    for (let plate = 0; plate < 3; plate++) {
      const px = sx - side * plate * s * 0.015;
      const py = sy + plate * s * 0.015;
      const pw = s * (0.09 - plate * 0.012);
      const ph = s * (0.06 - plate * 0.008);

      const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pw);
      pGrad.addColorStop(0, plate === 0 ? "#6b4a28" : "#5a3e22");
      pGrad.addColorStop(0.5, "#4a3018");
      pGrad.addColorStop(1, "#3a2510");
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, pw, ph, side * 0.35, 0, Math.PI * 2);
      ctx.fill();

      if (plate === 0) {
        ctx.strokeStyle = "#2a1a08";
        ctx.lineWidth = 1.2 * zoom;
        ctx.stroke();
      }
    }

    // Bark texture
    for (let line = 0; line < 4; line++) {
      const lx = sx + (line - 1.5) * s * 0.02;
      ctx.strokeStyle = `rgba(70, 50, 25, 0.3)`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, sy - s * 0.04);
      ctx.lineTo(lx + side * s * 0.008, sy + s * 0.04);
      ctx.stroke();
    }

    // Moss growth on shoulder
    ctx.fillStyle = `rgba(34, 197, 94, ${0.25 + mossGlow * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(sx + side * s * 0.02, sy - s * 0.03, s * 0.025, s * 0.012, side * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Small twig sprouting from shoulder
    const twigLen = s * 0.05;
    const twigSway = Math.sin(time * 2 + side) * s * 0.005;
    ctx.strokeStyle = "#4a3018";
    ctx.lineWidth = 1.2 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(sx, sy - s * 0.04);
    ctx.quadraticCurveTo(sx + side * s * 0.02 + twigSway, sy - s * 0.06, sx + side * s * 0.01 + twigSway, sy - s * 0.04 - twigLen);
    ctx.stroke();

    // Leaf on twig
    const leafX = sx + side * s * 0.01 + twigSway;
    const leafY = sy - s * 0.04 - twigLen;
    ctx.fillStyle = `rgba(74, 222, 128, ${0.6 + naturePulse * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(leafX, leafY, s * 0.015, s * 0.007, side * 0.5 + Math.sin(time * 3) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ARMS ───────────────────────────────────────────────────────────────────

function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, isAttacking: boolean, attackIntensity: number,
) {
  const armSwing = isAttacking ? Math.sin(attackIntensity * Math.PI * 2) * 0.6 : 0;

  for (let side = -1; side <= 1; side += 2) {
    const shoulderX = x + side * s * 0.20;
    const shoulderY = y - s * 0.1;
    const elbowX = shoulderX + side * s * 0.12;
    const elbowY = shoulderY + s * 0.12 + armSwing * side * s * 0.04;

    // Bark-armored arm
    const armGrad = ctx.createLinearGradient(shoulderX, shoulderY, elbowX, elbowY);
    armGrad.addColorStop(0, "#1e4530");
    armGrad.addColorStop(0.5, "#1a3a28");
    armGrad.addColorStop(1, "#153020");
    ctx.strokeStyle = armGrad;
    ctx.lineWidth = 5.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.stroke();

    // Bark arm guard
    ctx.strokeStyle = "#4a3018";
    ctx.lineWidth = 2 * zoom;
    const guardY = shoulderY + (elbowY - shoulderY) * 0.4;
    const guardX = shoulderX + (elbowX - shoulderX) * 0.4;
    ctx.beginPath();
    ctx.arc(guardX, guardY, s * 0.025, 0, Math.PI * 2);
    ctx.stroke();

    // Vine wraps around arm
    ctx.strokeStyle = `rgba(16, 185, 129, 0.35)`;
    ctx.lineWidth = 0.8 * zoom;
    for (let v = 0; v < 4; v++) {
      const t = v / 4;
      const vx = shoulderX + (elbowX - shoulderX) * t;
      const vy = shoulderY + (elbowY - shoulderY) * t;
      ctx.beginPath();
      ctx.arc(vx + side * s * 0.018, vy, s * 0.013, 0, Math.PI);
      ctx.stroke();
    }

    if (side === 1) {
      // Vine whip hand / right hand gauntlet
      const handX = elbowX;
      const handY = elbowY + s * 0.06;
      ctx.fillStyle = "#1e4530";
      ctx.beginPath();
      ctx.arc(handX, handY, s * 0.03, 0, Math.PI * 2);
      ctx.fill();

      // Bark gauntlet
      ctx.strokeStyle = "#3a2510";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(handX, handY, s * 0.032, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// ─── CROOKED STAFF ──────────────────────────────────────────────────────────

function drawCrookedStaff(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, mossGlow: number,
) {
  const handX = x - s * 0.30;
  const handY = y + s * 0.02;
  const staffTopY = y - s * 0.52;
  const staffBotY = y + s * 0.28;
  const staffX = handX;
  const crook = s * 0.06;

  // Staff body — crooked with bezier
  ctx.strokeStyle = "#4a3018";
  ctx.lineWidth = 4 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(staffX + s * 0.01, staffBotY);
  ctx.bezierCurveTo(
    staffX - s * 0.015, staffBotY - s * 0.2,
    staffX + s * 0.02, y - s * 0.1,
    staffX - s * 0.01, y - s * 0.25,
  );
  ctx.bezierCurveTo(
    staffX - s * 0.025, y - s * 0.35,
    staffX + crook * 0.3, y - s * 0.42,
    staffX - crook * 0.5, staffTopY,
  );
  ctx.stroke();

  // Staff secondary wood color
  ctx.strokeStyle = "#5a3e22";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(staffX + s * 0.01, staffBotY);
  ctx.bezierCurveTo(
    staffX - s * 0.015, staffBotY - s * 0.2,
    staffX + s * 0.02, y - s * 0.1,
    staffX - s * 0.01, y - s * 0.25,
  );
  ctx.stroke();

  // Wood grain on staff
  for (let g = 0; g < 6; g++) {
    const t = g / 6;
    const gy = staffBotY + (staffTopY - staffBotY) * t;
    const gx = staffX + Math.sin(t * 3) * s * 0.015;
    ctx.strokeStyle = `rgba(90, 62, 32, ${0.2})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(gx - s * 0.015, gy);
    ctx.quadraticCurveTo(gx, gy + s * 0.015, gx + s * 0.015, gy);
    ctx.stroke();
  }

  // Knots on staff
  const knots = [0.3, 0.55, 0.78];
  for (const kt of knots) {
    const ky = staffBotY + (staffTopY - staffBotY) * kt;
    const kx = staffX + Math.sin(kt * 4) * s * 0.01;
    ctx.fillStyle = "#3a2510";
    ctx.beginPath();
    ctx.ellipse(kx, ky, s * 0.012, s * 0.008, Math.sin(kt) * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vine wrapping around staff
  ctx.strokeStyle = `rgba(5, 150, 105, 0.45)`;
  ctx.lineWidth = 1.2 * zoom;
  for (let v = 0; v < 5; v++) {
    const t = 0.1 + v * 0.18;
    const vy = staffBotY + (staffTopY - staffBotY) * t;
    const vx = staffX + Math.sin(t * 4) * s * 0.01;
    ctx.beginPath();
    ctx.arc(vx, vy, s * 0.02, -0.5, Math.PI + 0.5);
    ctx.stroke();
  }

  // Staff head — gnarled fork with crystal
  const forkY = staffTopY + s * 0.02;
  const forkX = staffX - crook * 0.5;

  // Left fork
  ctx.strokeStyle = "#4a3018";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(forkX, forkY);
  ctx.quadraticCurveTo(forkX - s * 0.04, forkY - s * 0.06, forkX - s * 0.02, forkY - s * 0.1);
  ctx.stroke();

  // Right fork
  ctx.beginPath();
  ctx.moveTo(forkX, forkY);
  ctx.quadraticCurveTo(forkX + s * 0.05, forkY - s * 0.05, forkX + s * 0.04, forkY - s * 0.09);
  ctx.stroke();

  // Crystal cradled in fork
  const crystalX = forkX;
  const crystalY = forkY - s * 0.06;
  const crystalR = s * 0.04;

  // Crystal glow
  const glowAlpha = 0.3 + Math.sin(time * 3) * 0.15;
  ctx.shadowColor = "#34d399";
  ctx.shadowBlur = 10 * zoom;

  const cGrad = ctx.createRadialGradient(crystalX, crystalY, 0, crystalX, crystalY, crystalR);
  cGrad.addColorStop(0, "#d1fae5");
  cGrad.addColorStop(0.2, "#a7f3d0");
  cGrad.addColorStop(0.5, "#34d399");
  cGrad.addColorStop(0.8, "#059669");
  cGrad.addColorStop(1, "#047857");

  ctx.fillStyle = cGrad;
  ctx.beginPath();
  ctx.moveTo(crystalX, crystalY - crystalR);
  ctx.lineTo(crystalX + crystalR * 0.7, crystalY);
  ctx.lineTo(crystalX + crystalR * 0.3, crystalY + crystalR * 0.6);
  ctx.lineTo(crystalX - crystalR * 0.3, crystalY + crystalR * 0.6);
  ctx.lineTo(crystalX - crystalR * 0.7, crystalY);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Crystal outer glow
  ctx.fillStyle = `rgba(167, 243, 208, ${glowAlpha})`;
  ctx.beginPath();
  ctx.arc(crystalX, crystalY, crystalR * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Vines wrapping the fork
  ctx.strokeStyle = `rgba(5, 150, 105, 0.5)`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.arc(crystalX, crystalY + crystalR * 0.3, crystalR * 0.8, 0.3, Math.PI - 0.3);
  ctx.stroke();

  // Small leaves on fork
  const forkLeaves = [
    { dx: -0.035, dy: -0.08, angle: -0.5 },
    { dx: 0.04, dy: -0.07, angle: 0.4 },
  ];
  for (const fl of forkLeaves) {
    const lx = forkX + fl.dx * s;
    const ly = forkY + fl.dy * s;
    ctx.fillStyle = `rgba(74, 222, 128, ${0.6 + naturePulse * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(lx, ly, s * 0.014, s * 0.006, fl.angle + Math.sin(time * 2.5) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── HEAD ───────────────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number,
) {
  const headY = y - s * 0.31;

  // Hood
  const hoodGrad = ctx.createRadialGradient(x, headY + s * 0.01, 0, x, headY, s * 0.16);
  hoodGrad.addColorStop(0, "#1a4030");
  hoodGrad.addColorStop(0.4, "#0d3320");
  hoodGrad.addColorStop(0.8, "#082618");
  hoodGrad.addColorStop(1, "#051a10");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY, s * 0.14, s * 0.13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hood edge highlight
  ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + naturePulse * 0.08})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, headY, s * 0.135, s * 0.125, 0, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();

  // Face — bark textured
  const faceGrad = ctx.createRadialGradient(x, headY + s * 0.01, 0, x, headY, s * 0.1);
  faceGrad.addColorStop(0, "#8b6f47");
  faceGrad.addColorStop(0.3, "#6b5535");
  faceGrad.addColorStop(0.6, "#4a3a20");
  faceGrad.addColorStop(1, "#3a2a15");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(x, headY + s * 0.01, s * 0.095, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Deep bark texture
  for (let i = 0; i < 5; i++) {
    const ly = headY - s * 0.03 + i * s * 0.02;
    const lw = s * (0.07 - Math.abs(i - 2) * 0.01);
    ctx.strokeStyle = `rgba(70, 50, 30, ${0.2})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - lw, ly);
    ctx.bezierCurveTo(x - lw * 0.3, ly + s * 0.004, x + lw * 0.3, ly - s * 0.003, x + lw, ly);
    ctx.stroke();
  }

  // Eyes — glowing emerald
  for (let side = -1; side <= 1; side += 2) {
    const eyeX = x + side * s * 0.038;
    const eyeY = headY - s * 0.003;

    // Eye glow halo
    const egAlpha = 0.25 + naturePulse * 0.25;
    const eg = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, s * 0.035);
    eg.addColorStop(0, `rgba(167, 243, 208, ${egAlpha})`);
    eg.addColorStop(1, `rgba(52, 211, 153, 0)`);
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.035, 0, Math.PI * 2);
    ctx.fill();

    // Eye shape
    ctx.fillStyle = `rgba(52, 211, 153, ${0.8 + naturePulse * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, s * 0.02, s * 0.013, side * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#064e3b";
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, s * 0.007, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mouth — gnarled line
  ctx.strokeStyle = "rgba(50, 35, 15, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.03, headY + s * 0.04);
  ctx.bezierCurveTo(x - s * 0.01, headY + s * 0.035, x + s * 0.01, headY + s * 0.042, x + s * 0.03, headY + s * 0.038);
  ctx.stroke();
}

// ─── WOODEN CROWN ───────────────────────────────────────────────────────────

function drawWoodCrown(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, naturePulse: number, leafRustle: number,
) {
  const headY = y - s * 0.31;
  const crownBase = headY - s * 0.11;

  // Crown band — woven wood
  ctx.strokeStyle = "#5a3e20";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, crownBase + s * 0.02, s * 0.12, s * 0.035, 0, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  // Wood texture on band
  ctx.strokeStyle = `rgba(90, 62, 32, 0.3)`;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, crownBase + s * 0.02, s * 0.11, s * 0.03, 0, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();

  // Main branch antlers — gnarled, crooked
  for (let side = -1; side <= 1; side += 2) {
    const baseX = x + side * s * 0.07;
    const branchSway = Math.sin(time * 1.0 + side * 0.5) * s * 0.008;

    // Primary branch — curved and crooked
    const tip1X = baseX + side * s * 0.18 + branchSway;
    const tip1Y = crownBase - s * 0.22;
    ctx.strokeStyle = "#5a3e20";
    ctx.lineWidth = 2.8 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(baseX, crownBase);
    ctx.bezierCurveTo(
      baseX + side * s * 0.06, crownBase - s * 0.08,
      baseX + side * s * 0.12 + branchSway * 0.5, crownBase - s * 0.15,
      tip1X, tip1Y,
    );
    ctx.stroke();

    // Secondary inner branch
    const tip2X = baseX + side * s * 0.08 + branchSway * 0.7;
    const tip2Y = crownBase - s * 0.17;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(baseX + side * s * 0.04, crownBase - s * 0.06);
    ctx.quadraticCurveTo(baseX + side * s * 0.07 + branchSway * 0.3, crownBase - s * 0.12, tip2X, tip2Y);
    ctx.stroke();

    // Sub-branches with leaves
    const subBranches = [
      { t: 0.35, angle: side * 0.4, len: 0.06 },
      { t: 0.55, angle: side * 0.6, len: 0.055 },
      { t: 0.75, angle: side * 0.3, len: 0.05 },
      { t: 0.5, angle: side * -0.3, len: 0.04 },
    ];

    for (const sb of subBranches) {
      const bx = baseX + (tip1X - baseX) * sb.t + branchSway * sb.t;
      const by = crownBase + (tip1Y - crownBase) * sb.t;
      const subAngle = -Math.PI / 2 + sb.angle + Math.sin(time * 1.3 + sb.t * 3) * 0.1;
      const subLen = s * sb.len;

      ctx.strokeStyle = "#4a3018";
      ctx.lineWidth = 1.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(subAngle) * subLen, by + Math.sin(subAngle) * subLen);
      ctx.stroke();

      // Leaf cluster at sub-branch tip
      const ltx = bx + Math.cos(subAngle) * subLen;
      const lty = by + Math.sin(subAngle) * subLen;
      const leafCount = 2 + Math.floor(Math.abs(sb.angle) * 2);
      for (let l = 0; l < leafCount; l++) {
        const la = subAngle + (l - (leafCount - 1) / 2) * 0.4 + leafRustle + Math.sin(time * 3 + l + sb.t) * 0.15;
        const lSize = s * (0.02 + l * 0.003);
        const lAlpha = 0.6 + naturePulse * 0.25;

        const lGrad = ctx.createRadialGradient(ltx, lty, 0, ltx, lty, lSize);
        lGrad.addColorStop(0, `rgba(74, 222, 128, ${lAlpha})`);
        lGrad.addColorStop(1, `rgba(34, 197, 94, ${lAlpha * 0.5})`);
        ctx.fillStyle = lGrad;
        ctx.beginPath();
        ctx.ellipse(ltx + Math.cos(la) * lSize * 0.3, lty + Math.sin(la) * lSize * 0.2, lSize, lSize * 0.4, la, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Glowing tips
    const tips = [{ x: tip1X, y: tip1Y }, { x: tip2X, y: tip2Y }];
    for (const tip of tips) {
      const tGlow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, s * 0.025);
      tGlow.addColorStop(0, `rgba(167, 243, 208, ${0.45 + naturePulse * 0.3})`);
      tGlow.addColorStop(1, `rgba(52, 211, 153, 0)`);
      ctx.fillStyle = tGlow;
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, s * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Central crown bloom
  const bloomY = crownBase - s * 0.04;
  const bloomPulse = 0.7 + naturePulse * 0.3;

  // Larger multi-petal flower
  for (let ring = 0; ring < 2; ring++) {
    const petalCount = ring === 0 ? 6 : 4;
    const petalR = s * (ring === 0 ? 0.03 : 0.02);
    const ringAlpha = ring === 0 ? 0.5 : 0.7;
    for (let p = 0; p < petalCount; p++) {
      const pa = (p / petalCount) * Math.PI * 2 - Math.PI / 2 + time * (ring === 0 ? 0.3 : -0.2) + ring * 0.3;
      const px = x + Math.cos(pa) * petalR;
      const py = bloomY + Math.sin(pa) * petalR;
      ctx.fillStyle = `rgba(167, 243, 208, ${bloomPulse * ringAlpha})`;
      ctx.beginPath();
      ctx.ellipse(px, py, s * 0.015, s * 0.007, pa, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Flower center
  ctx.fillStyle = `rgba(251, 191, 36, ${bloomPulse})`;
  ctx.beginPath();
  ctx.arc(x, bloomY, s * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Center gem glow
  ctx.fillStyle = `rgba(251, 191, 36, ${bloomPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, bloomY, s * 0.025, 0, Math.PI * 2);
  ctx.fill();
}

// ─── NATURE AURA ────────────────────────────────────────────────────────────

function drawNatureAura(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, naturePulse: number, isAttacking: boolean, zoom: number,
) {
  const auraRadius = s * (0.6 + naturePulse * 0.1 + (isAttacking ? 0.15 : 0));
  const auraAlpha = 0.1 + naturePulse * 0.05;

  const auraGrad = ctx.createRadialGradient(x, y, s * 0.1, x, y, auraRadius);
  auraGrad.addColorStop(0, `rgba(52, 211, 153, ${auraAlpha})`);
  auraGrad.addColorStop(0.5, `rgba(16, 185, 129, ${auraAlpha * 0.4})`);
  auraGrad.addColorStop(1, `rgba(5, 150, 105, 0)`);
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // Floating leaves
  for (let i = 0; i < 8; i++) {
    const leafPhase = (time * 0.7 + i * 0.125) % 1;
    const leafAngle = time * 1.0 + (i * Math.PI * 2) / 8;
    const leafDist = s * (0.22 + leafPhase * 0.3);
    const leafX = x + Math.cos(leafAngle) * leafDist;
    const leafY = y - s * 0.12 + Math.sin(leafAngle * 0.7 + time) * s * 0.12;
    const leafAlpha = Math.sin(leafPhase * Math.PI) * 0.45;
    const leafSize = (1.8 + Math.sin(i * 1.2) * 0.5) * zoom;

    ctx.fillStyle = `rgba(74, 222, 128, ${leafAlpha})`;
    ctx.save();
    ctx.translate(leafX, leafY);
    ctx.rotate(time * 2 + i * 1.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, leafSize, leafSize * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Pollen / spore motes
  for (let i = 0; i < 6; i++) {
    const motePhase = (time * 0.45 + i * 0.17) % 1;
    const moteX = x + Math.sin(time * 0.7 + i * 1.8) * s * 0.35;
    const moteY = y + s * 0.15 - motePhase * s * 0.7;
    const moteAlpha = Math.sin(motePhase * Math.PI) * 0.35;

    ctx.fillStyle = `rgba(251, 191, 36, ${moteAlpha})`;
    ctx.beginPath();
    ctx.arc(moteX, moteY, zoom * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ATTACK VINES ───────────────────────────────────────────────────────────

function drawAttackVines(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  attackIntensity: number, time: number, zoom: number,
) {
  const lashPhase = Math.sin(attackIntensity * Math.PI);
  const vineCount = 6;

  for (let i = 0; i < vineCount; i++) {
    const angle = (i / vineCount) * Math.PI * 2 + time * 1.5;
    const vineLen = s * (0.45 + i * 0.03) * lashPhase;
    const sway = Math.sin(time * 5 + i * 1.2) * s * 0.04 * lashPhase;
    const midX = x + Math.cos(angle) * vineLen * 0.55 + sway;
    const midY = y + Math.sin(angle) * vineLen * 0.35 + sway * 0.3;
    const tipX = x + Math.cos(angle) * vineLen;
    const tipY = y + Math.sin(angle) * vineLen * 0.5;

    // Vine body
    ctx.strokeStyle = `rgba(5, 150, 105, ${lashPhase * 0.65})`;
    ctx.lineWidth = (3.5 - i * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(midX * 0.5 + x * 0.5, midY * 0.5 + y * 0.5, midX, midY, tipX, tipY);
    ctx.stroke();

    // Thorn tips
    const thornSize = s * 0.025 * lashPhase;
    ctx.fillStyle = `rgba(34, 197, 94, ${lashPhase * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(tipX - thornSize * 0.3, tipY - thornSize);
    ctx.lineTo(tipX + thornSize * 0.5, tipY);
    ctx.lineTo(tipX - thornSize * 0.3, tipY + thornSize);
    ctx.closePath();
    ctx.fill();

    // Leaf accents along attack vine
    if (i % 2 === 0) {
      const leafT = 0.5;
      const lx = x + (tipX - x) * leafT + Math.sin(time * 4 + i) * s * 0.02;
      const ly = y + (tipY - y) * leafT;
      ctx.fillStyle = `rgba(74, 222, 128, ${lashPhase * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(lx, ly, s * 0.018, s * 0.008, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ground eruption cracks
  const crackAlpha = lashPhase * 0.35;
  for (let c = 0; c < 8; c++) {
    const crackAngle = (c / 8) * Math.PI * 2;
    const crackLen = s * (0.18 + Math.sin(time * 2 + c) * 0.04) * lashPhase;

    ctx.strokeStyle = `rgba(16, 185, 129, ${crackAlpha})`;
    ctx.lineWidth = (2 - c * 0.1) * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.26);
    ctx.bezierCurveTo(
      x + Math.cos(crackAngle) * crackLen * 0.4, y + s * 0.27,
      x + Math.cos(crackAngle) * crackLen * 0.7, y + s * 0.26 + Math.sin(crackAngle) * crackLen * 0.2,
      x + Math.cos(crackAngle) * crackLen, y + s * 0.26 + Math.sin(crackAngle) * crackLen * 0.3,
    );
    ctx.stroke();
  }
}
