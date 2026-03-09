import type { Position } from "../../types";
import { resolveWeaponRotation, WEAPON_LIMITS } from "./helpers";

export function drawFScottHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const breathe = Math.sin(time * 2) * 1;
  const goldPulse = Math.sin(time * 3) * 0.3 + 0.7;

  // Cursive writing animation with word breaks and varied pen pressure
  const writeCycle = (time * 0.5) % 1;
  const wordPhase = (writeCycle * 5) % 1;
  const betweenWords = wordPhase > 0.88;
  const penStrokeX = isAttacking
    ? 0
    : betweenWords
      ? Math.sin(time * 3) * size * 0.005
      : Math.sin(wordPhase * Math.PI * 3) * size * 0.04 +
        Math.cos(wordPhase * Math.PI * 7) * size * 0.012;
  const penStrokeY = isAttacking
    ? 0
    : betweenWords
      ? -size * 0.012
      : Math.sin(wordPhase * Math.PI * 5) * size * 0.02 +
        Math.cos(wordPhase * Math.PI * 2) * size * 0.008;

  drawAura(
    ctx,
    x,
    y,
    size,
    time,
    isAttacking,
    attackIntensity,
    goldPulse,
    zoom,
  );
  drawFloatingLetters(ctx, x, y, size, time, goldPulse, zoom, "behind");

  if (isAttacking) {
    drawAttackRings(ctx, x, y, size, attackPhase, attackIntensity, zoom);
  }

  drawShadow(ctx, x, y, size);
  drawCape(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawSuit(ctx, x, y, size, breathe, zoom);
  drawScottSkirtArmor(ctx, x, y, size, time, zoom, isAttacking, attackIntensity, goldPulse);
  drawEpaulettes(ctx, x, y, size, time, zoom);
  drawAiguillette(ctx, x, y, size, time, zoom);
  drawVest(ctx, x, y, size, zoom);
  drawShirtAndTie(ctx, x, y, size, isAttacking, attackIntensity, zoom);
  drawArms(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    isAttacking,
    attackPhase,
    penStrokeX,
    penStrokeY,
  );
  drawHead(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
  drawStormCollar(ctx, x, y, size, zoom);
  drawFloatingLetters(ctx, x, y, size, time, goldPulse, zoom, "front");
  drawBook(ctx, x, y, size, time, zoom, isAttacking, writeCycle);
  drawPen(
    ctx,
    x,
    y,
    size,
    time,
    zoom,
    isAttacking,
    attackPhase,
    attackIntensity,
    penStrokeX,
    penStrokeY,
    targetPos,
  );
  drawFloatingWords(ctx, x, y, size, time, zoom, isAttacking, attackIntensity);
}

// ─── AURA ────────────────────────────────────────────────────────────────────

function drawAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  isAttacking: boolean,
  attackIntensity: number,
  goldPulse: number,
  zoom: number,
) {
  const auraBase = isAttacking ? 0.4 : 0.22;
  const auraPulse = 0.85 + Math.sin(time * 3) * 0.15;
  for (let layer = 0; layer < 4; layer++) {
    const off = layer * 0.08;
    const g = ctx.createRadialGradient(
      x,
      y - size * 0.1,
      size * (0.1 + off),
      x,
      y - size * 0.1,
      size * (0.95 + off * 0.3),
    );
    const a = (auraBase - layer * 0.04) * auraPulse;
    g.addColorStop(0, `rgba(130, 185, 220, ${a * 0.5})`);
    g.addColorStop(0.3, `rgba(100, 155, 190, ${a * 0.35})`);
    g.addColorStop(0.6, `rgba(80, 130, 170, ${a * 0.2})`);
    g.addColorStop(1, "rgba(130, 185, 220, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.1,
      size * (0.85 + off * 0.15),
      size * (0.75 + off * 0.12),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawFloatingLetters(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  goldPulse: number,
  zoom: number,
  layer: "behind" | "front",
) {
  const letters = "GATSBY";
  for (let p = 0; p < 10; p++) {
    const pAngle = (time * 1.5 + (p * Math.PI * 2) / 10) % (Math.PI * 2);
    const depth = Math.sin(pAngle);

    if (layer === "behind" && depth >= 0) continue;
    if (layer === "front" && depth < 0) continue;

    const depthScale = 0.85 + depth * 0.2;
    const depthAlpha = 0.7 + depth * 0.3;

    const pDist = size * 0.6 + Math.sin(time * 2 + p * 0.7) * size * 0.1;
    const pRise = ((time * 0.5 + p * 0.4) % 1) * size * 0.25;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y - size * 0.1 + depth * pDist * 0.4 - pRise;
    const pAlpha = (0.6 - (pRise / (size * 0.25)) * 0.4) * goldPulse * depthAlpha;
    ctx.fillStyle = `rgba(80, 210, 210, ${pAlpha})`;
    ctx.font = `italic ${Math.round(8 * zoom * depthScale)}px Georgia`;
    ctx.textAlign = "center";
    ctx.fillText(letters[p % letters.length], px, py);
  }
}

// ─── ATTACK RINGS ────────────────────────────────────────────────────────────

function drawAttackRings(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  attackPhase: number,
  attackIntensity: number,
  zoom: number,
) {
  for (let ring = 0; ring < 4; ring++) {
    const phase = (attackPhase * 2 + ring * 0.12) % 1;
    const alpha = (1 - phase) * 0.5 * attackIntensity;
    ctx.strokeStyle = `rgba(80, 210, 210, ${alpha})`;
    ctx.lineWidth = (3.5 - ring * 0.6) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y - size * 0.12,
      size * (0.55 + phase * 0.5),
      size * (0.65 + phase * 0.5),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
}

// ─── SHADOW ──────────────────────────────────────────────────────────────────

function drawShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const g = ctx.createRadialGradient(
    x,
    y + size * 0.52,
    0,
    x,
    y + size * 0.52,
    size * 0.45,
  );
  g.addColorStop(0, "rgba(0,0,0,0.45)");
  g.addColorStop(0.6, "rgba(0,0,0,0.2)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.52, size * 0.42, size * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
}

// ─── CAPE (3-panel, connected to epaulettes, wraps & flutters) ──────────────

function drawCape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const windStr = isAttacking ? 1.4 : 1.0;
  const epY = y - size * 0.22;

  // [topLeftX, topLeftY, topRightX, topRightY, length, flutterOffset, side]
  const panels: [number, number, number, number, number, number, number][] = [
    [x - size * 0.38, epY, x + size * 0.38, epY, size * 0.72, 0, 0],
    [
      x - size * 0.56,
      epY + size * 0.02,
      x - size * 0.3,
      epY,
      size * 0.65,
      0.9,
      -1,
    ],
    [
      x + size * 0.3,
      epY,
      x + size * 0.56,
      epY + size * 0.02,
      size * 0.65,
      1.8,
      1,
    ],
  ];

  for (const [tlX, tlY, trX, trY, len, fOff, side] of panels) {
    const wt = time * 2.5 + fOff;
    const f1 = Math.sin(wt) * size * 0.04 * windStr;
    const f2 = Math.sin(wt + 1.2) * size * 0.06 * windStr;
    const f3 = Math.sin(wt + 2.4) * size * 0.05 * windStr;
    const hemWave = Math.sin(wt + 0.5) * size * 0.025 * windStr;
    const sideSpread = side * size * 0.04;

    const blX = tlX + sideSpread + f3 * 0.5;
    const blY = tlY + len;
    const brX = trX + sideSpread + f3 * 0.5;
    const brY = trY + len;
    const hemMidX = (blX + brX) / 2 + f2 * 0.5;
    const hemMidY = Math.max(blY, brY) + size * 0.02 + hemWave;

    // Reusable path for fill, stroke, and glow
    const capePath = new Path2D();
    capePath.moveTo(tlX, tlY);
    capePath.lineTo(trX, trY);
    capePath.bezierCurveTo(
      trX + f1 * 0.3 + sideSpread * 0.3,
      trY + len * 0.35 + f2 * 0.2,
      brX + f2 * 0.4,
      brY - len * 0.3 + f1 * 0.3,
      brX,
      brY,
    );
    capePath.bezierCurveTo(
      (hemMidX + brX) / 2,
      hemMidY,
      (hemMidX + blX) / 2,
      hemMidY,
      blX,
      blY,
    );
    capePath.bezierCurveTo(
      blX + f2 * 0.4,
      blY - len * 0.3 + f1 * 0.3,
      tlX + f1 * 0.3 + sideSpread * 0.3,
      tlY + len * 0.35 + f2 * 0.2,
      tlX,
      tlY,
    );
    capePath.closePath();

    const capeG = ctx.createLinearGradient(
      (tlX + trX) / 2,
      tlY,
      (blX + brX) / 2,
      blY,
    );
    if (side === 0) {
      capeG.addColorStop(0, "#2a2518");
      capeG.addColorStop(0.3, "#353020");
      capeG.addColorStop(0.6, "#302a1c");
      capeG.addColorStop(1, "#252018");
    } else {
      capeG.addColorStop(0, "#2a2518");
      capeG.addColorStop(0.4, "#353020");
      capeG.addColorStop(0.7, "#354050");
      capeG.addColorStop(1, "#405868");
    }

    ctx.fillStyle = capeG;
    ctx.fill(capePath);
    ctx.strokeStyle = "rgba(20, 18, 12, 0.45)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke(capePath);

    // Fabric fold creases
    const foldCount = side === 0 ? 4 : 2;
    ctx.strokeStyle = "rgba(50, 45, 30, 0.25)";
    ctx.lineWidth = 0.7 * zoom;
    for (let fold = 0; fold < foldCount; fold++) {
      const t = (fold + 1) / (foldCount + 1);
      const ftX = tlX + (trX - tlX) * t;
      const ftY = tlY + (trY - tlY) * t + size * 0.02;
      const fbX =
        blX +
        (brX - blX) * t +
        Math.sin(wt + fold * 0.8) * size * 0.012;
      const fbY = blY + (brY - blY) * t - size * 0.02;
      const fmX =
        (ftX + fbX) / 2 + Math.sin(wt + fold) * size * 0.01;
      const fmY = (ftY + fbY) / 2;
      ctx.beginPath();
      ctx.moveTo(ftX, ftY);
      ctx.quadraticCurveTo(fmX, fmY, fbX, fbY);
      ctx.stroke();
    }

    // Hem lining shimmer (blue inner lining visible at fluttering edges)
    ctx.strokeStyle =
      side === 0
        ? "rgba(80, 100, 120, 0.15)"
        : "rgba(100, 150, 180, 0.25)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(blX, blY);
    ctx.bezierCurveTo(
      (hemMidX + blX) / 2,
      hemMidY,
      (hemMidX + brX) / 2,
      hemMidY,
      brX,
      brY,
    );
    ctx.stroke();

    // Top rail (shoulder bar the cape hangs from)
    ctx.strokeStyle = "rgba(100, 140, 170, 0.3)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(tlX + size * 0.01, tlY);
    ctx.lineTo(trX - size * 0.01, trY);
    ctx.stroke();

    // Clasp hardware on side panels connecting to epaulettes
    if (side !== 0) {
      const clX = side === -1 ? trX : tlX;
      const clY = side === -1 ? trY : tlY;
      const cg = ctx.createRadialGradient(
        clX,
        clY,
        0,
        clX,
        clY,
        size * 0.015,
      );
      cg.addColorStop(0, "#d0e8f5");
      cg.addColorStop(0.5, "#a0c0d8");
      cg.addColorStop(1, "#7098b0");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(clX, clY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6088a0";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    if (isAttacking) {
      const ga = 0.08 * attackIntensity;
      const ag = ctx.createLinearGradient(
        (tlX + trX) / 2,
        tlY,
        (blX + brX) / 2,
        blY,
      );
      ag.addColorStop(0, `rgba(80, 210, 210, ${ga * 0.3})`);
      ag.addColorStop(0.5, `rgba(130, 185, 220, ${ga})`);
      ag.addColorStop(1, `rgba(80, 210, 210, ${ga * 0.5})`);
      ctx.fillStyle = ag;
      ctx.fill(capePath);
    }
  }
}

// ─── SUIT JACKET ─────────────────────────────────────────────────────────────

function drawSuit(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  breathe: number,
  zoom: number,
) {
  // Trench coat body
  const coatG = ctx.createLinearGradient(
    x - size * 0.45,
    y - size * 0.1,
    x + size * 0.45,
    y + size * 0.4,
  );
  coatG.addColorStop(0, "#3a3528");
  coatG.addColorStop(0.25, "#4a4535");
  coatG.addColorStop(0.5, "#555040");
  coatG.addColorStop(0.75, "#4a4535");
  coatG.addColorStop(1, "#3a3528");
  ctx.fillStyle = coatG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.44, y + size * 0.55 + breathe);
  ctx.bezierCurveTo(
    x - size * 0.46,
    y + size * 0.35,
    x - size * 0.44,
    y,
    x - size * 0.42,
    y - size * 0.1,
  );
  ctx.quadraticCurveTo(x - size * 0.35, y - size * 0.28, x, y - size * 0.32);
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y - size * 0.28,
    x + size * 0.42,
    y - size * 0.1,
  );
  ctx.bezierCurveTo(
    x + size * 0.44,
    y,
    x + size * 0.46,
    y + size * 0.35,
    x + size * 0.44,
    y + size * 0.55 + breathe,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2518";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();

  // GUN FLAP (right side — extra fabric panel overlapping right chest)
  const gfG = ctx.createLinearGradient(
    x + size * 0.04,
    y - size * 0.22,
    x + size * 0.28,
    y + size * 0.08,
  );
  gfG.addColorStop(0, "#4e4938");
  gfG.addColorStop(0.5, "#585342");
  gfG.addColorStop(1, "#4a4535");
  ctx.fillStyle = gfG;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.06, y - size * 0.24);
  ctx.lineTo(x + size * 0.28, y - size * 0.2);
  ctx.lineTo(x + size * 0.26, y + size * 0.08);
  ctx.lineTo(x + size * 0.06, y + size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(35, 30, 20, 0.35)";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Gun flap stitch line
  ctx.strokeStyle = "rgba(80, 75, 60, 0.3)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.setLineDash([2 * zoom, 2 * zoom]);
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.22);
  ctx.lineTo(x + size * 0.08, y + size * 0.08);
  ctx.stroke();
  ctx.setLineDash([]);

  // Coat hem flare detail
  ctx.strokeStyle = "rgba(35, 30, 20, 0.4)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.44, y + size * 0.54 + breathe);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.58 + breathe,
    x + size * 0.44,
    y + size * 0.54 + breathe,
  );
  ctx.stroke();

  // Coat stitching lines
  ctx.strokeStyle = "rgba(60, 55, 40, 0.2)";
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 6; i++) {
    const sx = x - size * 0.3 + i * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(sx, y - size * 0.12);
    ctx.lineTo(sx - size * 0.01, y + size * 0.5);
    ctx.stroke();
  }

  // LAPELS (drawn before the head — lower portion of the collar)
  for (let side = -1; side <= 1; side += 2) {
    const lapG = ctx.createLinearGradient(
      x + side * size * 0.08,
      y - size * 0.26,
      x + side * size * 0.28,
      y + size * 0.08,
    );
    lapG.addColorStop(0, "#4a4535");
    lapG.addColorStop(0.5, "#555040");
    lapG.addColorStop(1, "#3a3528");
    ctx.fillStyle = lapG;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.08, y - size * 0.24);
    ctx.lineTo(x + side * size * 0.26, y - size * 0.18);
    ctx.lineTo(x + side * size * 0.24, y + size * 0.06);
    ctx.lineTo(x + side * size * 0.08, y + size * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(35, 30, 20, 0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // BELT (wider, with D-rings and hanging tail)
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.16);
  ctx.lineTo(x + size * 0.42, y + size * 0.16);
  ctx.lineTo(x + size * 0.42, y + size * 0.22);
  ctx.lineTo(x - size * 0.42, y + size * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2015";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Belt keeper loops
  for (const lx of [-0.22, -0.08, 0.08, 0.22]) {
    ctx.fillStyle = "#332a1a";
    ctx.beginPath();
    ctx.roundRect(
      x + lx * size - size * 0.012,
      y + size * 0.155,
      size * 0.024,
      size * 0.072,
      size * 0.003,
    );
    ctx.fill();
    ctx.strokeStyle = "#2a2015";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }

  // Belt buckle (silvery blue)
  const buckG = ctx.createLinearGradient(
    x - size * 0.04,
    y + size * 0.16,
    x + size * 0.04,
    y + size * 0.22,
  );
  buckG.addColorStop(0, "#8ab0c8");
  buckG.addColorStop(0.3, "#a0c8e0");
  buckG.addColorStop(0.5, "#c0ddf0");
  buckG.addColorStop(0.7, "#a0c8e0");
  buckG.addColorStop(1, "#8ab0c8");
  ctx.fillStyle = buckG;
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.04,
    y + size * 0.155,
    size * 0.08,
    size * 0.07,
    size * 0.008,
  );
  ctx.fill();
  ctx.strokeStyle = "#6a90a8";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  // Buckle prong
  ctx.strokeStyle = "#b0d0e8";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.165);
  ctx.lineTo(x, y + size * 0.215);
  ctx.stroke();

  // Belt hanging tail (excess strap hanging down)
  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.04, y + size * 0.19);
  ctx.lineTo(x + size * 0.14, y + size * 0.2);
  ctx.lineTo(x + size * 0.15, y + size * 0.28);
  ctx.lineTo(x + size * 0.13, y + size * 0.29);
  ctx.lineTo(x + size * 0.12, y + size * 0.21);
  ctx.lineTo(x + size * 0.04, y + size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2015";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();
  // Tail tip hardware
  ctx.fillStyle = "#8ab0c8";
  ctx.beginPath();
  ctx.roundRect(
    x + size * 0.125,
    y + size * 0.275,
    size * 0.02,
    size * 0.018,
    size * 0.003,
  );
  ctx.fill();

  // D-rings (silvery blue, on left hip)
  for (let d = 0; d < 2; d++) {
    const dx = x - size * (0.32 + d * 0.06);
    const dy = y + size * 0.19;
    ctx.strokeStyle = "#90b8d0";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.arc(dx, dy, size * 0.018, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.lineTo(dx - size * 0.015, dy + size * 0.018);
    ctx.lineTo(dx - size * 0.015, dy - size * 0.018);
    ctx.closePath();
    ctx.stroke();
  }

  // BUTTONS (silvery blue, double-breasted)
  for (let row = 0; row < 3; row++) {
    for (let col = -1; col <= 1; col += 2) {
      const bx = x + col * size * 0.1;
      const by2 = y - size * 0.06 + row * size * 0.1;
      const bg = ctx.createRadialGradient(
        bx - size * 0.003,
        by2 - size * 0.003,
        0,
        bx,
        by2,
        size * 0.018,
      );
      bg.addColorStop(0, "#d0e8f5");
      bg.addColorStop(0.5, "#a0c0d8");
      bg.addColorStop(1, "#7098b0");
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, by2, size * 0.018, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#6088a0";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      // Button highlight
      ctx.fillStyle = "rgba(220, 240, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(
        bx - size * 0.005,
        by2 - size * 0.005,
        size * 0.007,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

// ─── ARMORED SIDE TASSETS (split parallelogram skirt, captain structure) ───────

function drawScottSkirtArmor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
  goldPulse: number,
) {
  const skirtTop = y + size * 0.22;
  const bandCount = 4;
  const totalHeight = size * 0.30;
  const bandHeight = totalHeight / bandCount;
  const gapHalf = size * 0.10;

  drawScottCenterBanner(ctx, x, y, size, time, zoom, skirtTop, totalHeight, gapHalf, goldPulse);

  for (let side = -1; side <= 1; side += 2) {
    drawScottTassetSide(ctx, x, y, size, time, zoom, side, skirtTop, bandCount, bandHeight, totalHeight, gapHalf, goldPulse, isAttacking, attackIntensity);
  }

  drawScottSkirtChain(ctx, x, size, zoom, skirtTop, gapHalf, goldPulse, time);
  drawScottSkirtBelt(ctx, x, size, zoom, skirtTop, goldPulse);
}

function drawScottTassetSide(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
  size: number,
  time: number,
  zoom: number,
  side: number,
  skirtTop: number,
  bandCount: number,
  bandHeight: number,
  totalHeight: number,
  gapHalf: number,
  goldPulse: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const shear = size * -0.10;

  for (let band = 0; band < bandCount; band++) {
    const innerTopY = skirtTop + band * bandHeight;
    const innerBotY = innerTopY + bandHeight;
    const outerTopY = innerTopY + shear;
    const outerBotY = innerBotY + shear;

    const outerW = size * (0.42 + band * 0.035);
    const innerGap = gapHalf + band * size * 0.008;
    const sway =
      Math.sin(time * 1.5 + band * 0.7 + side * 0.4) * size * 0.003 * (band + 1);

    const innerX = x + side * innerGap + sway;
    const outerX = x + side * outerW + sway;

    const plateG = ctx.createLinearGradient(innerX, innerTopY, outerX, outerBotY);
    if (side === -1) {
      plateG.addColorStop(0, "#5a7a90");
      plateG.addColorStop(0.25, "#7098b0");
      plateG.addColorStop(0.55, "#8ab0c8");
      plateG.addColorStop(1, "#9cc0d8");
    } else {
      plateG.addColorStop(0, "#9cc0d8");
      plateG.addColorStop(0.45, "#8ab0c8");
      plateG.addColorStop(0.75, "#7098b0");
      plateG.addColorStop(1, "#5a7a90");
    }

    ctx.fillStyle = plateG;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(130, 185, 220, ${0.35 + goldPulse * 0.2})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX + side * size * 0.005, innerTopY + size * 0.002);
    ctx.lineTo(outerX - side * size * 0.005, outerTopY + size * 0.002);
    ctx.stroke();

    ctx.strokeStyle = "#3a5060";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX - side * size * 0.002, innerBotY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.stroke();

    ctx.strokeStyle = "#3a5060";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(innerX, innerTopY);
    ctx.lineTo(outerX, outerTopY);
    ctx.lineTo(outerX + side * size * 0.004, outerBotY);
    ctx.lineTo(innerX - side * size * 0.002, innerBotY);
    ctx.closePath();
    ctx.stroke();

    const rivetMidT = 0.75;
    const rivetX = innerX + rivetMidT * (outerX - innerX);
    const rivetY = innerTopY + rivetMidT * (outerTopY - innerTopY) + bandHeight * 0.45;
    const rg = ctx.createRadialGradient(
      rivetX - size * 0.002, rivetY - size * 0.002, 0,
      rivetX, rivetY, size * 0.009,
    );
    rg.addColorStop(0, "#d0e8f5");
    rg.addColorStop(0.4, "#a0c0d8");
    rg.addColorStop(1, "#6898b0");
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(rivetX, rivetY, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    const etchCount = 2 + Math.floor(band / 2);
    for (let e = 0; e < etchCount; e++) {
      const t = (e + 0.5) / etchCount;
      const etchX = innerX + t * (outerX - innerX);
      const etchYBase = innerTopY + t * (outerTopY - innerTopY) + bandHeight * 0.4;
      ctx.strokeStyle = "rgba(58, 80, 96, 0.4)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(etchX - size * 0.02, etchYBase);
      ctx.lineTo(etchX + size * 0.02, etchYBase);
      ctx.stroke();
    }

    const midT = 0.5;
    const accentInnerX = innerX + side * size * 0.015;
    const accentOuterX = outerX - side * size * 0.015;
    const accentInnerY = innerTopY + bandHeight * midT;
    const accentOuterY = outerTopY + bandHeight * midT;
    ctx.strokeStyle = `rgba(130, 185, 220, ${0.25 + goldPulse * 0.15})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(accentInnerX, accentInnerY);
    ctx.lineTo(accentOuterX, accentOuterY);
    ctx.stroke();
  }

  if (isAttacking) {
    const glowAlpha = 0.12 * attackIntensity;
    const gx = x + side * size * 0.3;
    const gy = skirtTop + totalHeight * 0.5;
    const gg = ctx.createRadialGradient(
      gx,
      gy,
      0,
      gx,
      gy,
      size * 0.18,
    );
    gg.addColorStop(0, `rgba(80, 210, 210, ${glowAlpha})`);
    gg.addColorStop(0.5, `rgba(130, 185, 220, ${glowAlpha * 0.6})`);
    gg.addColorStop(1, "rgba(80, 210, 210, 0)");
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.ellipse(
      gx,
      gy,
      size * 0.14,
      size * 0.17,
      side * 0.12,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

function drawScottCenterBanner(
  ctx: CanvasRenderingContext2D,
  x: number,
  _y: number,
  size: number,
  time: number,
  zoom: number,
  skirtTop: number,
  totalHeight: number,
  gapHalf: number,
  goldPulse: number,
) {
  const bannerTop = skirtTop + size * 0.04;
  const bannerBottom = skirtTop + totalHeight * 0.92;
  const bannerHalfW = gapHalf * 0.75;
  const wave = Math.sin(time * 2.5) * size * 0.008;
  const wave2 = Math.sin(time * 3.2 + 0.5) * size * 0.005;

  const bannerGrad = ctx.createLinearGradient(x, bannerTop, x, bannerBottom);
  bannerGrad.addColorStop(0, "#3a3020");
  bannerGrad.addColorStop(0.15, "#4a4030");
  bannerGrad.addColorStop(0.4, "#5a5040");
  bannerGrad.addColorStop(0.7, "#4a4030");
  bannerGrad.addColorStop(1, "#3a3020");
  ctx.fillStyle = bannerGrad;
  ctx.beginPath();
  ctx.moveTo(x - bannerHalfW, bannerTop);
  ctx.lineTo(x + bannerHalfW, bannerTop);
  ctx.bezierCurveTo(
    x + bannerHalfW + wave, bannerTop + (bannerBottom - bannerTop) * 0.35,
    x + bannerHalfW * 0.9 + wave2, bannerTop + (bannerBottom - bannerTop) * 0.65,
    x + bannerHalfW * 0.85, bannerBottom,
  );
  ctx.lineTo(x + size * 0.015, bannerBottom - size * 0.04);
  ctx.lineTo(x - size * 0.015, bannerBottom - size * 0.04);
  ctx.lineTo(x - bannerHalfW * 0.85, bannerBottom);
  ctx.bezierCurveTo(
    x - bannerHalfW * 0.9 - wave2, bannerTop + (bannerBottom - bannerTop) * 0.65,
    x - bannerHalfW - wave, bannerTop + (bannerBottom - bannerTop) * 0.35,
    x - bannerHalfW, bannerTop,
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#a0c8e0";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  const emblemY = (bannerTop + bannerBottom) * 0.5 - size * 0.03;
  ctx.strokeStyle = "#a0c8e0";
  ctx.lineWidth = 1.2 * zoom;
  ctx.shadowColor = "#a0c8e0";
  ctx.shadowBlur = 4 * zoom * goldPulse;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, emblemY + size * 0.02);
  ctx.lineTo(x + size * 0.025, emblemY - size * 0.03);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#daa520";
  ctx.beginPath();
  ctx.arc(x + size * 0.028, emblemY - size * 0.035, size * 0.006, 0, Math.PI * 2);
  ctx.fill();
}

function drawScottSkirtChain(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  zoom: number,
  skirtTop: number,
  gapHalf: number,
  goldPulse: number,
  time: number,
) {
  const chainY = skirtTop + size * 0.025;
  const leftAnchor = x - gapHalf + size * 0.01;
  const rightAnchor = x + gapHalf - size * 0.01;
  const sag = size * 0.035 + Math.sin(time * 2) * size * 0.004;
  const linkCount = 7;

  for (let i = 0; i <= linkCount; i++) {
    const t = i / linkCount;
    const lx = leftAnchor + t * (rightAnchor - leftAnchor);
    const sagT = 4 * t * (1 - t);
    const ly = chainY + sag * sagT;

    const linkGrad = ctx.createRadialGradient(
      lx - size * 0.002, ly - size * 0.002, 0,
      lx, ly, size * 0.012,
    );
    linkGrad.addColorStop(0, "#a0c0d8");
    linkGrad.addColorStop(0.5, "#80a8c0");
    linkGrad.addColorStop(1, "#6090a8");
    ctx.fillStyle = linkGrad;
    ctx.beginPath();
    const linkW = size * 0.011;
    const linkH = size * 0.007;
    const angle = i % 2 === 0 ? 0.3 : -0.3;
    ctx.ellipse(lx, ly, linkW, linkH, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a5060";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(130, 185, 220, ${0.5 + goldPulse * 0.2})`;
  ctx.lineWidth = 1.8 * zoom;
  ctx.shadowColor = "#a0c8e0";
  ctx.shadowBlur = 3 * zoom * goldPulse;
  ctx.beginPath();
  ctx.moveTo(leftAnchor, chainY);
  ctx.quadraticCurveTo(x, chainY + sag, rightAnchor, chainY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  for (let side = -1; side <= 1; side += 2) {
    const anchorX = side === -1 ? leftAnchor : rightAnchor;
    ctx.fillStyle = "#80a8c0";
    ctx.shadowColor = "#a0c8e0";
    ctx.shadowBlur = 3 * zoom * goldPulse;
    ctx.beginPath();
    ctx.arc(anchorX, chainY, size * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a5060";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawScottSkirtBelt(
  ctx: CanvasRenderingContext2D,
  x: number,
  size: number,
  zoom: number,
  skirtTop: number,
  goldPulse: number,
) {
  const beltHalfW = size * 0.43;
  const beltThick = size * 0.048;
  const vDip = size * 0.08;

  const beltGrad = ctx.createLinearGradient(
    x - beltHalfW, skirtTop, x + beltHalfW, skirtTop,
  );
  beltGrad.addColorStop(0, "#2a2518");
  beltGrad.addColorStop(0.2, "#4a4535");
  beltGrad.addColorStop(0.4, "#555040");
  beltGrad.addColorStop(0.5, "#555040");
  beltGrad.addColorStop(0.6, "#4a4535");
  beltGrad.addColorStop(0.8, "#4a4535");
  beltGrad.addColorStop(1, "#2a2518");

  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop - beltThick * 0.5);
  ctx.lineTo(x + beltHalfW, skirtTop + beltThick * 0.5);
  ctx.lineTo(x, skirtTop + beltThick * 0.5 + vDip);
  ctx.lineTo(x - beltHalfW, skirtTop + beltThick * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#2a2015";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  ctx.strokeStyle = "rgba(160, 200, 230, 0.5)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - beltHalfW + size * 0.01, skirtTop - beltThick * 0.5 + size * 0.004);
  ctx.lineTo(x + beltHalfW - size * 0.01, skirtTop - beltThick * 0.5 + size * 0.004);
  ctx.stroke();

  ctx.fillStyle = "#a0c8e0";
  ctx.shadowColor = "#a0c8e0";
  ctx.shadowBlur = 6 * zoom * goldPulse;
  ctx.beginPath();
  ctx.arc(x, skirtTop + vDip * 0.35, size * 0.032, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#d0e8f5";
  ctx.beginPath();
  ctx.arc(x - size * 0.008, skirtTop + vDip * 0.35 - size * 0.008, size * 0.013, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── STORM COLLAR (drawn after head so it overlaps the jaw/cheeks) ──────────

function drawStormCollar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
) {
  const headY = y - size * 0.5;

  for (let side = -1; side <= 1; side += 2) {
    // Turned-up collar flap — narrow strip that hugs the jawline
    const colG = ctx.createLinearGradient(
      x + side * size * 0.14,
      headY + size * 0.18,
      x + side * size * 0.3,
      headY - size * 0.08,
    );
    colG.addColorStop(0, "#4a4535");
    colG.addColorStop(0.4, "#585248");
    colG.addColorStop(0.7, "#605a48");
    colG.addColorStop(1, "#555040");
    ctx.fillStyle = colG;
    ctx.beginPath();
    // Bottom inner edge (near neck)
    ctx.moveTo(x + side * size * 0.12, headY + size * 0.22);
    // Up along the jaw, curving outward
    ctx.bezierCurveTo(
      x + side * size * 0.14,
      headY + size * 0.1,
      x + side * size * 0.18,
      headY - size * 0.02,
      x + side * size * 0.2,
      headY - size * 0.1,
    );
    // Collar peak (pointed tip)
    ctx.lineTo(x + side * size * 0.24, headY - size * 0.14);
    // Outer edge going back down
    ctx.bezierCurveTo(
      x + side * size * 0.28,
      headY - size * 0.04,
      x + side * size * 0.3,
      headY + size * 0.08,
      x + side * size * 0.28,
      headY + size * 0.2,
    );
    // Bottom outer edge
    ctx.lineTo(x + side * size * 0.24, headY + size * 0.24);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2a2518";
    ctx.lineWidth = 1.3 * zoom;
    ctx.stroke();

    // Fold crease — diagonal line where the collar turns over
    ctx.strokeStyle = "rgba(80, 75, 55, 0.45)";
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.14, headY + size * 0.18);
    ctx.bezierCurveTo(
      x + side * size * 0.18,
      headY + size * 0.06,
      x + side * size * 0.22,
      headY - size * 0.04,
      x + side * size * 0.23,
      headY - size * 0.1,
    );
    ctx.stroke();

    // Lighter inner lining visible above the fold
    const innerG = ctx.createLinearGradient(
      x + side * size * 0.18,
      headY - size * 0.12,
      x + side * size * 0.28,
      headY + size * 0.06,
    );
    innerG.addColorStop(0, "#6a6455");
    innerG.addColorStop(0.5, "#73705e");
    innerG.addColorStop(1, "#605a48");
    ctx.fillStyle = innerG;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.2, headY - size * 0.1);
    ctx.lineTo(x + side * size * 0.24, headY - size * 0.14);
    ctx.bezierCurveTo(
      x + side * size * 0.28,
      headY - size * 0.04,
      x + side * size * 0.3,
      headY + size * 0.08,
      x + side * size * 0.28,
      headY + size * 0.2,
    );
    ctx.lineTo(x + side * size * 0.26, headY + size * 0.18);
    ctx.bezierCurveTo(
      x + side * size * 0.27,
      headY + size * 0.06,
      x + side * size * 0.26,
      headY - size * 0.02,
      x + side * size * 0.23,
      headY - size * 0.1,
    );
    ctx.closePath();
    ctx.fill();

    // Top edge highlight
    ctx.strokeStyle = "rgba(120, 115, 95, 0.35)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.2, headY - size * 0.1);
    ctx.lineTo(x + side * size * 0.24, headY - size * 0.14);
    ctx.stroke();
  }
}

// ─── EPAULETTES (silvery blue) ──────────────────────────────────────────────

function drawEpaulettes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
) {
  for (let side = -1; side <= 1; side += 2) {
    const epX = x + side * size * 0.4;
    const epY = y - size * 0.22;

    ctx.save();
    ctx.translate(epX, epY);
    ctx.rotate(side * 0.15);

    const epW = size * 0.18;
    const epH = size * 0.08;

    // Base pad
    const padG = ctx.createLinearGradient(-epW, -epH, epW, epH);
    padG.addColorStop(0, "#1a2530");
    padG.addColorStop(0.3, "#253545");
    padG.addColorStop(0.5, "#2a3a4a");
    padG.addColorStop(0.7, "#253545");
    padG.addColorStop(1, "#1a2530");
    ctx.fillStyle = padG;
    ctx.beginPath();
    ctx.ellipse(0, 0, epW, epH, side * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Silvery blue border
    ctx.strokeStyle = "#80b8d0";
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // Inner trim ring
    ctx.strokeStyle = "#6898b0";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(0, 0, epW * 0.75, epH * 0.65, side * 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Silvery blue fringe strands
    const fringeCount = 9;
    for (let f = 0; f < fringeCount; f++) {
      const fAngle =
        (side === -1 ? 0.2 : -0.2) +
        Math.PI * 0.3 +
        f * ((Math.PI * 0.5) / (fringeCount - 1));
      const fx = Math.cos(fAngle) * epW;
      const fy = Math.sin(fAngle) * epH;
      const fLen = size * (0.06 + Math.sin(f * 1.3) * 0.015);
      const fWave = Math.sin(time * 3 + f * 0.6) * size * 0.008;

      const fringeG = ctx.createLinearGradient(fx, fy, fx + fWave, fy + fLen);
      fringeG.addColorStop(0, "#90c0d8");
      fringeG.addColorStop(0.4, "#b0d8e8");
      fringeG.addColorStop(0.7, "#80b0c8");
      fringeG.addColorStop(1, "#608898");
      ctx.strokeStyle = fringeG;
      ctx.lineWidth = 1.8 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(
        fx + fWave * 0.6,
        fy + fLen * 0.5,
        fx + fWave,
        fy + fLen,
      );
      ctx.stroke();

      ctx.fillStyle = "#b0d8e8";
      ctx.beginPath();
      ctx.arc(fx + fWave, fy + fLen, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center star emblem (silvery blue)
    ctx.fillStyle = "#b0d8f0";
    ctx.shadowColor = "#80b8d8";
    ctx.shadowBlur = 5 * zoom;
    ctx.beginPath();
    for (let s = 0; s < 5; s++) {
      const sa = (s * Math.PI * 2) / 5 - Math.PI / 2;
      const sa2 = sa + Math.PI / 5;
      const outerR = size * 0.035;
      const innerR = size * 0.015;
      if (s === 0) ctx.moveTo(Math.cos(sa) * outerR, Math.sin(sa) * outerR);
      else ctx.lineTo(Math.cos(sa) * outerR, Math.sin(sa) * outerR);
      ctx.lineTo(Math.cos(sa2) * innerR, Math.sin(sa2) * innerR);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#d8f0ff";
    ctx.beginPath();
    ctx.arc(-size * 0.005, -size * 0.008, size * 0.008, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// ─── AIGUILLETTE & DECORATIONS (silvery blue) ──────────────────────────────

function drawAiguillette(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
) {
  const startX = x + size * 0.35;
  const startY = y - size * 0.18;
  const sway = Math.sin(time * 2) * size * 0.01;

  // Three braided loops draping across the chest
  for (let loop = 0; loop < 3; loop++) {
    const loopDepth = size * (0.12 + loop * 0.06);
    const loopWidth = size * (0.2 + loop * 0.05);
    const alpha = 0.7 - loop * 0.12;

    ctx.strokeStyle = `rgba(130, 180, 210, ${alpha})`;
    ctx.lineWidth = (2 - loop * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(startX, startY + loop * size * 0.03);
    ctx.quadraticCurveTo(
      startX - loopWidth * 0.5 + sway,
      startY + loopDepth + loop * size * 0.02,
      startX - loopWidth + sway * 0.5,
      startY + loop * size * 0.04,
    );
    ctx.stroke();

    ctx.strokeStyle = `rgba(160, 200, 230, ${alpha * 0.25})`;
    ctx.lineWidth = (3.5 - loop * 0.4) * zoom;
    ctx.stroke();
  }

  // Tip ferrule
  ctx.fillStyle = "#90c0d8";
  ctx.beginPath();
  ctx.arc(
    startX - size * 0.35,
    startY + size * 0.04,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Pocket square (silvery blue, peeking from left breast pocket)
  const pqX = x - size * 0.2;
  const pqY = y + size * 0.02;
  ctx.fillStyle = "#7ab0c8";
  ctx.beginPath();
  ctx.moveTo(pqX - size * 0.03, pqY);
  ctx.lineTo(pqX - size * 0.015, pqY - size * 0.06);
  ctx.lineTo(pqX + size * 0.005, pqY - size * 0.05);
  ctx.lineTo(pqX + size * 0.02, pqY - size * 0.065);
  ctx.lineTo(pqX + size * 0.035, pqY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#5a8898";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Decorative piping along jacket hem
  ctx.strokeStyle = "rgba(130, 180, 210, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y + size * 0.48);
  ctx.quadraticCurveTo(x, y + size * 0.52, x + size * 0.36, y + size * 0.48);
  ctx.stroke();

  // Pocket watch chain across vest
  ctx.strokeStyle = "#80b0c8";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, y + size * 0.05);
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y + size * 0.12,
    x + size * 0.14,
    y + size * 0.08,
  );
  ctx.stroke();
  // Watch fob
  ctx.fillStyle = "#90c0d8";
  ctx.shadowColor = "#80b8d8";
  ctx.shadowBlur = 3 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.14, y + size * 0.08, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#c8e0f0";
  ctx.beginPath();
  ctx.arc(x + size * 0.136, y + size * 0.075, size * 0.005, 0, Math.PI * 2);
  ctx.fill();

  // SHOULDER RANK PINS (silvery blue small bars on left collar)
  for (let pin = 0; pin < 3; pin++) {
    const px = x - size * 0.14;
    const py = y - size * 0.2 + pin * size * 0.025;
    ctx.fillStyle = "#a0c8e0";
    ctx.beginPath();
    ctx.roundRect(px, py, size * 0.04, size * 0.008, size * 0.002);
    ctx.fill();
    ctx.strokeStyle = "#7aa0b8";
    ctx.lineWidth = 0.4 * zoom;
    ctx.stroke();
  }

  // THROAT LATCH button (small silvery blue button at collar)
  const bg = ctx.createRadialGradient(
    x,
    y - size * 0.31,
    0,
    x,
    y - size * 0.31,
    size * 0.012,
  );
  bg.addColorStop(0, "#d0e8f5");
  bg.addColorStop(0.5, "#a0c0d8");
  bg.addColorStop(1, "#7098b0");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#6088a0";
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();

  // MEDAL RIBBON (small rectangular ribbon on left chest)
  const medX = x - size * 0.28;
  const medY = y - size * 0.08;
  const stripeW = size * 0.008;
  const ribbonColors = ["#708898", "#a0c0d8", "#e0f0ff", "#a0c0d8", "#708898"];
  for (let ri = 0; ri < ribbonColors.length; ri++) {
    ctx.fillStyle = ribbonColors[ri];
    ctx.fillRect(medX + ri * stripeW, medY, stripeW, size * 0.025);
  }
  ctx.strokeStyle = "#506878";
  ctx.lineWidth = 0.4 * zoom;
  ctx.strokeRect(medX, medY, stripeW * ribbonColors.length, size * 0.025);

  // BACK VENT DETAIL (subtle V at the bottom of coat)
  ctx.strokeStyle = "rgba(55, 50, 35, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y + size * 0.55);
  ctx.lineTo(x, y + size * 0.48);
  ctx.lineTo(x + size * 0.04, y + size * 0.55);
  ctx.stroke();
}

// ─── VEST ────────────────────────────────────────────────────────────────────

function drawVest(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
) {
  const vestGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y - size * 0.18,
    x + size * 0.15,
    y + size * 0.3,
  );
  vestGrad.addColorStop(0, "#5a4530");
  vestGrad.addColorStop(0.3, "#7a6545");
  vestGrad.addColorStop(0.5, "#8b7555");
  vestGrad.addColorStop(0.7, "#7a6545");
  vestGrad.addColorStop(1, "#5a4530");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.lineTo(x + size * 0.14, y - size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Brocade pattern
  ctx.strokeStyle = "rgba(180, 150, 100, 0.3)";
  ctx.lineWidth = 0.8;
  for (let p = 0; p < 4; p++) {
    const py = y - size * 0.1 + p * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.1, py);
    ctx.quadraticCurveTo(x, py - size * 0.02, x + size * 0.1, py);
    ctx.stroke();
  }

  // Vest border
  ctx.strokeStyle = "#4a3520";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.2);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.2);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.stroke();

  // Silvery blue buttons
  for (let i = 0; i < 4; i++) {
    const by = y - size * 0.1 + i * size * 0.095;
    ctx.fillStyle = "#607888";
    ctx.beginPath();
    ctx.arc(x + size * 0.005, by + size * 0.005, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    const bg = ctx.createRadialGradient(
      x - size * 0.005,
      by - size * 0.005,
      0,
      x,
      by,
      size * 0.022,
    );
    bg.addColorStop(0, "#d0e8f5");
    bg.addColorStop(0.5, "#a0c0d8");
    bg.addColorStop(1, "#7098b0");
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(x, by, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(220, 240, 255, 0.4)";
    ctx.beginPath();
    ctx.arc(x - size * 0.008, by - size * 0.008, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── SHIRT & TIE ────────────────────────────────────────────────────────────

function drawShirtAndTie(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isAttacking: boolean,
  attackIntensity: number,
  zoom: number,
) {
  // Shirt
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.2, y - size * 0.08);
  ctx.quadraticCurveTo(x, y - size * 0.14, x + size * 0.2, y - size * 0.08);
  ctx.lineTo(x + size * 0.14, y - size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Collar points
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.22);
  ctx.lineTo(x - size * 0.18, y - size * 0.16);
  ctx.lineTo(x - size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.22);
  ctx.lineTo(x + size * 0.18, y - size * 0.16);
  ctx.lineTo(x + size * 0.1, y - size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Tie (silvery blue)
  ctx.shadowColor = "#80b8d8";
  ctx.shadowBlur = isAttacking ? 10 * zoom * attackIntensity : 4 * zoom;
  const tG = ctx.createLinearGradient(x, y - size * 0.18, x, y + size * 0.22);
  tG.addColorStop(0, "#80b8d0");
  tG.addColorStop(0.2, "#6898b0");
  tG.addColorStop(0.5, "#507898");
  tG.addColorStop(0.8, "#3a6080");
  tG.addColorStop(1, "#2a4860");
  ctx.fillStyle = tG;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18);
  ctx.lineTo(x - size * 0.07, y + size * 0.14);
  ctx.lineTo(x, y + size * 0.22);
  ctx.lineTo(x + size * 0.07, y + size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Tie stripes
  ctx.strokeStyle = "rgba(30, 60, 80, 0.4)";
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 5; s++) {
    const sy = y - size * 0.1 + s * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04, sy);
    ctx.lineTo(x + size * 0.04, sy + size * 0.03);
    ctx.stroke();
  }

  // Tie knot
  ctx.fillStyle = "#90c0d8";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.16,
    size * 0.045,
    size * 0.028,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
}

// ─── ARMS (two-segment with articulated elbows) ─────────────────────────────

function drawArms(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackPhase: number,
  penStrokeX: number,
  penStrokeY: number,
) {
  const upperLen = size * 0.16;
  const forearmLen = size * 0.16;

  // === LEFT ARM (holds book — gentle elbow sway) ===
  const leftShoulder = isAttacking
    ? -0.7 - Math.sin(attackPhase * Math.PI) * 0.08
    : -0.7 - Math.sin(time * 1.2) * 0.04 - Math.sin(time * 0.8) * 0.02;
  const leftElbow = isAttacking
    ? -0.95 - Math.sin(attackPhase * Math.PI) * 0.25
    : -1.0 + Math.sin(time * 1.2) * 0.08 + Math.sin(time * 0.6) * 0.04;

  ctx.save();
  ctx.translate(x - size * 0.36, y - size * 0.08);
  ctx.rotate(leftShoulder);

  drawUpperSleeve(ctx, size, zoom, 1);

  ctx.translate(0, upperLen);
  drawElbowJoint(ctx, size, zoom);
  ctx.rotate(leftElbow);

  drawForearmSleeve(ctx, size, zoom, 1);

  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.01,
    forearmLen + size * 0.01,
    size * 0.04,
    size * 0.045,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(
    size * 0.01,
    forearmLen + size * 0.04,
    size * 0.022,
    0.2 * Math.PI,
    0.8 * Math.PI,
  );
  ctx.stroke();

  ctx.restore();

  // === RIGHT ARM (writing arm — elbow bends with cursive pen strokes) ===
  const writeBend = isAttacking ? 0 : penStrokeX / (size * 0.06);
  const rightShoulder = isAttacking
    ? 0.7 + Math.sin(attackPhase * Math.PI * 1.5) * 0.12
    : 0.72 + Math.sin(time * 2) * 0.05 + writeBend * 0.04;
  const rightElbow = isAttacking
    ? 0.95 + Math.sin(attackPhase * Math.PI * 1.5) * 0.35
    : 0.85 + Math.sin(time * 2.5) * 0.18 + writeBend * 0.12;

  ctx.save();
  ctx.translate(x + size * 0.36, y - size * 0.1);
  ctx.rotate(rightShoulder);

  drawUpperSleeve(ctx, size, zoom, -1);

  ctx.translate(0, upperLen);
  drawElbowJoint(ctx, size, zoom);
  ctx.rotate(rightElbow);

  drawForearmSleeve(ctx, size, zoom, -1);

  const hx = -size * 0.01 + (isAttacking ? 0 : penStrokeX * 0.15);
  const hy = forearmLen + size * 0.01 + (isAttacking ? 0 : penStrokeY * 0.15);
  ctx.fillStyle = "#ffe0bd";
  ctx.beginPath();
  ctx.ellipse(hx, hy, size * 0.04, size * 0.045, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#f5d0a8";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hx - size * 0.015, hy - size * 0.015);
  ctx.quadraticCurveTo(
    hx - size * 0.035,
    hy,
    hx - size * 0.03,
    hy + size * 0.03,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hx - size * 0.005, hy + size * 0.025);
  ctx.lineTo(hx - size * 0.015, hy + size * 0.055);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    hx + size * 0.015,
    hy + size * 0.035,
    size * 0.025,
    0.2 * Math.PI,
    0.7 * Math.PI,
  );
  ctx.stroke();

  ctx.restore();
}

function drawUpperSleeve(
  ctx: CanvasRenderingContext2D,
  size: number,
  zoom: number,
  dir: number,
) {
  const len = size * 0.16;
  const sg = ctx.createLinearGradient(0, 0, dir * size * 0.06, len);
  sg.addColorStop(0, "#4a4535");
  sg.addColorStop(0.5, "#555040");
  sg.addColorStop(1, "#3a3528");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.04, 0);
  ctx.quadraticCurveTo(dir * size * 0.065, len * 0.4, dir * size * 0.04, len);
  ctx.lineTo(-dir * size * 0.055, len);
  ctx.quadraticCurveTo(-dir * size * 0.07, len * 0.4, -dir * size * 0.04, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2518";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawElbowJoint(
  ctx: CanvasRenderingContext2D,
  size: number,
  _zoom: number,
) {
  ctx.fillStyle = "#4e4838";
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.048, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2a2518";
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = "rgba(70, 65, 50, 0.35)";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.005);
  ctx.quadraticCurveTo(0, size * 0.008, size * 0.03, -size * 0.005);
  ctx.stroke();
}

function drawForearmSleeve(
  ctx: CanvasRenderingContext2D,
  size: number,
  zoom: number,
  dir: number,
) {
  const len = size * 0.16;
  const sg = ctx.createLinearGradient(0, 0, dir * size * 0.04, len);
  sg.addColorStop(0, "#4a4535");
  sg.addColorStop(0.5, "#555040");
  sg.addColorStop(1, "#3a3528");
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.045, 0);
  ctx.quadraticCurveTo(dir * size * 0.05, len * 0.4, dir * size * 0.03, len);
  ctx.lineTo(-dir * size * 0.05, len - size * 0.01);
  ctx.quadraticCurveTo(
    -dir * size * 0.06,
    len * 0.4,
    -dir * size * 0.045,
    0,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2518";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = "#3a3020";
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.05, len - size * 0.035);
  ctx.lineTo(dir * size * 0.035, len - size * 0.035);
  ctx.lineTo(dir * size * 0.035, len - size * 0.015);
  ctx.lineTo(-dir * size * 0.05, len - size * 0.015);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2015";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.strokeStyle = "rgba(80, 70, 50, 0.35)";
  ctx.lineWidth = 0.5;
  ctx.setLineDash([1.5, 1.5]);
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.048, len - size * 0.032);
  ctx.lineTo(dir * size * 0.033, len - size * 0.032);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.048, len - size * 0.018);
  ctx.lineTo(dir * size * 0.033, len - size * 0.018);
  ctx.stroke();
  ctx.setLineDash([]);

  const buckleG = ctx.createRadialGradient(
    -dir * size * 0.005,
    len - size * 0.025,
    0,
    -dir * size * 0.005,
    len - size * 0.025,
    size * 0.01,
  );
  buckleG.addColorStop(0, "#d0e8f5");
  buckleG.addColorStop(0.5, "#a0c0d8");
  buckleG.addColorStop(1, "#7098b0");
  ctx.fillStyle = buckleG;
  ctx.beginPath();
  ctx.roundRect(
    -dir * size * 0.015,
    len - size * 0.03,
    size * 0.02,
    size * 0.018,
    size * 0.002,
  );
  ctx.fill();
  ctx.strokeStyle = "#6088a0";
  ctx.lineWidth = 0.4;
  ctx.stroke();
  ctx.strokeStyle = "#b0d0e8";
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(-dir * size * 0.005, len - size * 0.028);
  ctx.lineTo(-dir * size * 0.005, len - size * 0.017);
  ctx.stroke();
}

// ─── HEAD ────────────────────────────────────────────────────────────────────

function drawHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const headY = y - size * 0.5;

  // Face (bezier shaped — slightly narrower chin)
  const fg = ctx.createRadialGradient(
    x - size * 0.04,
    headY - size * 0.04,
    0,
    x,
    headY,
    size * 0.28,
  );
  fg.addColorStop(0, "#ffe8d0");
  fg.addColorStop(0.4, "#ffe0bd");
  fg.addColorStop(0.8, "#f5d0a8");
  fg.addColorStop(1, "#e8c098");
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.27);
  ctx.bezierCurveTo(
    x + size * 0.18,
    headY - size * 0.27,
    x + size * 0.28,
    headY - size * 0.14,
    x + size * 0.27,
    headY + size * 0.02,
  );
  ctx.bezierCurveTo(
    x + size * 0.26,
    headY + size * 0.14,
    x + size * 0.14,
    headY + size * 0.25,
    x,
    headY + size * 0.28,
  );
  ctx.bezierCurveTo(
    x - size * 0.14,
    headY + size * 0.25,
    x - size * 0.26,
    headY + size * 0.14,
    x - size * 0.27,
    headY + size * 0.02,
  );
  ctx.bezierCurveTo(
    x - size * 0.28,
    headY - size * 0.14,
    x - size * 0.18,
    headY - size * 0.27,
    x,
    headY - size * 0.27,
  );
  ctx.closePath();
  ctx.fill();

  // Jawline definition
  ctx.strokeStyle = "rgba(180, 140, 100, 0.15)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY + size * 0.1);
  ctx.bezierCurveTo(
    x - size * 0.12,
    headY + size * 0.22,
    x + size * 0.12,
    headY + size * 0.22,
    x + size * 0.2,
    headY + size * 0.1,
  );
  ctx.stroke();

  // Cheekbone shadows
  ctx.fillStyle = "rgba(200, 160, 120, 0.18)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    headY + size * 0.02,
    size * 0.06,
    size * 0.035,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.15,
    headY + size * 0.02,
    size * 0.06,
    size * 0.035,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Temple shadow (adds depth near hairline)
  ctx.fillStyle = "rgba(190, 150, 110, 0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.2,
    headY - size * 0.08,
    size * 0.04,
    size * 0.06,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.2,
    headY - size * 0.08,
    size * 0.04,
    size * 0.06,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  drawHair(ctx, x, headY, size, zoom);
  drawEyes(ctx, x, headY, size, time, zoom, isAttacking, attackIntensity);
  drawNoseAndMouth(ctx, x, headY, size, zoom);
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  size: number,
  zoom: number,
) {
  // Slicked-back 1920s pompadour with volume on top
  // Back/base layer
  const baseG = ctx.createLinearGradient(
    x - size * 0.2,
    headY - size * 0.3,
    x + size * 0.15,
    headY,
  );
  baseG.addColorStop(0, "#1a0e08");
  baseG.addColorStop(0.4, "#2a1810");
  baseG.addColorStop(0.8, "#3a2515");
  baseG.addColorStop(1, "#2a1810");
  ctx.fillStyle = baseG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.27, headY + size * 0.04);
  ctx.bezierCurveTo(
    x - size * 0.3,
    headY - size * 0.08,
    x - size * 0.28,
    headY - size * 0.2,
    x - size * 0.18,
    headY - size * 0.28,
  );
  ctx.bezierCurveTo(
    x - size * 0.08,
    headY - size * 0.34,
    x + size * 0.05,
    headY - size * 0.36,
    x + size * 0.15,
    headY - size * 0.3,
  );
  ctx.bezierCurveTo(
    x + size * 0.24,
    headY - size * 0.24,
    x + size * 0.28,
    headY - size * 0.14,
    x + size * 0.26,
    headY + size * 0.02,
  );
  ctx.bezierCurveTo(
    x + size * 0.24,
    headY + size * 0.08,
    x + size * 0.2,
    headY + size * 0.1,
    x + size * 0.16,
    headY + size * 0.06,
  );
  ctx.closePath();
  ctx.fill();

  // Pompadour volume on top (swept right)
  const pompG = ctx.createLinearGradient(
    x - size * 0.1,
    headY - size * 0.35,
    x + size * 0.12,
    headY - size * 0.18,
  );
  pompG.addColorStop(0, "#3a2515");
  pompG.addColorStop(0.4, "#4a3520");
  pompG.addColorStop(1, "#2a1810");
  ctx.fillStyle = pompG;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, headY - size * 0.22);
  ctx.bezierCurveTo(
    x - size * 0.18,
    headY - size * 0.32,
    x - size * 0.06,
    headY - size * 0.38,
    x + size * 0.06,
    headY - size * 0.36,
  );
  ctx.bezierCurveTo(
    x + size * 0.16,
    headY - size * 0.34,
    x + size * 0.22,
    headY - size * 0.28,
    x + size * 0.2,
    headY - size * 0.2,
  );
  ctx.bezierCurveTo(
    x + size * 0.15,
    headY - size * 0.24,
    x + size * 0.02,
    headY - size * 0.26,
    x - size * 0.08,
    headY - size * 0.24,
  );
  ctx.closePath();
  ctx.fill();

  // Side-swept wave strands (slicked texture)
  ctx.strokeStyle = "#1a0e08";
  ctx.lineWidth = 1.4 * zoom;
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const startX = x - size * (0.22 - t * 0.12);
    const startY = headY - size * (0.18 + t * 0.05);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + size * 0.12,
      startY - size * 0.06,
      startX + size * 0.24,
      startY - size * 0.02,
      startX + size * 0.32,
      startY + size * 0.04,
    );
    ctx.stroke();
  }

  // Hair shine highlights (pomade sheen)
  ctx.strokeStyle = "rgba(120, 90, 60, 0.35)";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, headY - size * 0.28);
  ctx.bezierCurveTo(
    x - size * 0.02,
    headY - size * 0.33,
    x + size * 0.08,
    headY - size * 0.32,
    x + size * 0.16,
    headY - size * 0.26,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(140, 110, 70, 0.25)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, headY - size * 0.25);
  ctx.bezierCurveTo(
    x + size * 0.02,
    headY - size * 0.29,
    x + size * 0.1,
    headY - size * 0.28,
    x + size * 0.18,
    headY - size * 0.22,
  );
  ctx.stroke();

  // Sideburn left
  ctx.fillStyle = "#2a1810";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26, headY - size * 0.02);
  ctx.bezierCurveTo(
    x - size * 0.28,
    headY + size * 0.02,
    x - size * 0.27,
    headY + size * 0.1,
    x - size * 0.24,
    headY + size * 0.14,
  );
  ctx.lineTo(x - size * 0.22, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();

  // Sideburn right
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, headY - size * 0.02);
  ctx.bezierCurveTo(
    x + size * 0.26,
    headY + size * 0.02,
    x + size * 0.25,
    headY + size * 0.1,
    x + size * 0.22,
    headY + size * 0.14,
  );
  ctx.lineTo(x + size * 0.2, headY + size * 0.08);
  ctx.closePath();
  ctx.fill();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  // Socket shadows
  ctx.fillStyle = "rgba(180, 140, 100, 0.25)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    size * 0.08,
    size * 0.05,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    size * 0.08,
    size * 0.05,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Whites
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    size * 0.065,
    size * 0.055,
    -0.08,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    size * 0.065,
    size * 0.055,
    0.08,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Irises
  if (isAttacking) {
    ctx.shadowColor = "#80b8d8";
    ctx.shadowBlur = 8 * zoom * attackIntensity;
    ctx.fillStyle = `rgba(130, 185, 220, ${0.85 + attackIntensity * 0.15})`;
  } else {
    ctx.fillStyle = "#4a6080";
  }
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.042, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Iris detail ring
  ctx.strokeStyle = isAttacking ? "#5a8898" : "#3a5070";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.035, 0, Math.PI * 2);
  ctx.stroke();

  // Pupils
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(x - size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.1, headY - size * 0.02, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Highlights
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x - size * 0.115, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.085, headY - size * 0.035, size * 0.015, 0, Math.PI * 2);
  ctx.fill();

  // ── GLASSES ──
  const glassColor = isAttacking
    ? "rgba(130, 185, 220, 0.15)"
    : "rgba(180, 200, 220, 0.12)";
  const frameColor = isAttacking ? "#6898b0" : "#3a3a3a";
  const glassR = size * 0.08;

  // Lens fill (subtle tint)
  ctx.fillStyle = glassColor;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    -0.05,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    0.05,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Lens glare
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    headY - size * 0.04,
    glassR * 0.4,
    glassR * 0.25,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    headY - size * 0.04,
    glassR * 0.4,
    glassR * 0.25,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Frames
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    -0.05,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    headY - size * 0.02,
    glassR,
    glassR * 0.85,
    0.05,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Bridge
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.02, headY - size * 0.025);
  ctx.bezierCurveTo(
    x - size * 0.008,
    headY - size * 0.04,
    x + size * 0.008,
    headY - size * 0.04,
    x + size * 0.02,
    headY - size * 0.025,
  );
  ctx.stroke();

  // Temple arms (sides going to ears)
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.02);
  ctx.lineTo(x - size * 0.24, headY + size * 0.01);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.02);
  ctx.lineTo(x + size * 0.24, headY + size * 0.01);
  ctx.stroke();

  // Eyebrows (above the glasses)
  ctx.strokeStyle = "#2a1810";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, headY - size * 0.1);
  ctx.bezierCurveTo(
    x - size * 0.14,
    headY - size * 0.13,
    x - size * 0.08,
    headY - size * 0.13,
    x - size * 0.04,
    headY - size * 0.1,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, headY - size * 0.1);
  ctx.bezierCurveTo(
    x + size * 0.14,
    headY - size * 0.13,
    x + size * 0.08,
    headY - size * 0.13,
    x + size * 0.04,
    headY - size * 0.1,
  );
  ctx.stroke();
}

function drawNoseAndMouth(
  ctx: CanvasRenderingContext2D,
  x: number,
  headY: number,
  size: number,
  zoom: number,
) {
  // Nose bridge
  ctx.strokeStyle = "#c8a888";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, headY - size * 0.01);
  ctx.bezierCurveTo(
    x - size * 0.005,
    headY + size * 0.04,
    x - size * 0.018,
    headY + size * 0.07,
    x - size * 0.022,
    headY + size * 0.08,
  );
  ctx.stroke();

  // Nose tip and nostril curve
  ctx.strokeStyle = "#c0a080";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.025, headY + size * 0.08);
  ctx.quadraticCurveTo(
    x,
    headY + size * 0.1,
    x + size * 0.025,
    headY + size * 0.08,
  );
  ctx.stroke();

  // Nostril dots
  ctx.fillStyle = "rgba(160, 120, 80, 0.3)";
  ctx.beginPath();
  ctx.arc(x - size * 0.015, headY + size * 0.085, size * 0.006, 0, Math.PI * 2);
  ctx.arc(x + size * 0.015, headY + size * 0.085, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Philtrum (subtle line between nose and lip)
  ctx.strokeStyle = "rgba(180, 140, 100, 0.15)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x, headY + size * 0.095);
  ctx.lineTo(x, headY + size * 0.12);
  ctx.stroke();

  // Upper lip
  ctx.strokeStyle = "#b08878";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.055, headY + size * 0.14);
  ctx.bezierCurveTo(
    x - size * 0.02,
    headY + size * 0.125,
    x,
    headY + size * 0.13,
    x,
    headY + size * 0.13,
  );
  ctx.bezierCurveTo(
    x,
    headY + size * 0.13,
    x + size * 0.02,
    headY + size * 0.125,
    x + size * 0.055,
    headY + size * 0.14,
  );
  ctx.stroke();

  // Lower lip / smile
  ctx.strokeStyle = "#a08070";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, headY + size * 0.14);
  ctx.bezierCurveTo(
    x - size * 0.03,
    headY + size * 0.17,
    x + size * 0.03,
    headY + size * 0.17,
    x + size * 0.06,
    headY + size * 0.14,
  );
  ctx.stroke();

  // Chin dimple (subtle)
  ctx.strokeStyle = "rgba(180, 140, 110, 0.15)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, headY + size * 0.21, size * 0.012, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
}

// ─── BOOK ────────────────────────────────────────────────────────────────────

function drawBook(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  writeCycle: number,
) {
  // Book held at center of body, open and facing up
  const bookX = x - size * 0.02;
  const bookY = y + size * 0.28;
  const bookTilt = Math.sin(time * 1.2) * 0.015;

  ctx.save();
  ctx.translate(bookX, bookY);
  ctx.rotate(bookTilt);

  const bW = size * 0.28;
  const bH = size * 0.2;

  // Book shadow beneath
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.beginPath();
  ctx.ellipse(0, bH * 0.05, bW * 0.55, bH * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Back cover (slightly visible)
  const backG = ctx.createLinearGradient(-bW * 0.5, 0, bW * 0.5, 0);
  backG.addColorStop(0, "#5a2a10");
  backG.addColorStop(0.5, "#6b3818");
  backG.addColorStop(1, "#5a2a10");
  ctx.fillStyle = backG;
  ctx.beginPath();
  ctx.roundRect(-bW * 0.5, -bH * 0.5, bW, bH, size * 0.008);
  ctx.fill();
  ctx.strokeStyle = "#4a1a08";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Book spine (center fold line)
  ctx.strokeStyle = "#3a1a08";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -bH * 0.5);
  ctx.lineTo(0, bH * 0.5);
  ctx.stroke();

  // Left page (creamy white)
  ctx.fillStyle = "#f8f0e0";
  ctx.beginPath();
  ctx.roundRect(-bW * 0.47, -bH * 0.46, bW * 0.45, bH * 0.92, size * 0.003);
  ctx.fill();

  // Right page
  ctx.fillStyle = "#faf4ea";
  ctx.beginPath();
  ctx.roundRect(bW * 0.02, -bH * 0.46, bW * 0.45, bH * 0.92, size * 0.003);
  ctx.fill();

  // Left page writing lines (already written)
  ctx.strokeStyle = "rgba(80, 60, 40, 0.2)";
  ctx.lineWidth = 0.6;
  for (let line = 0; line < 8; line++) {
    const ly = -bH * 0.36 + line * bH * 0.1;
    ctx.beginPath();
    ctx.moveTo(-bW * 0.43, ly);
    ctx.lineTo(-bW * 0.07, ly);
    ctx.stroke();
  }

  // Right page lines + ink animation
  for (let line = 0; line < 8; line++) {
    const ly = -bH * 0.36 + line * bH * 0.1;
    ctx.strokeStyle = "rgba(80, 60, 40, 0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(bW * 0.06, ly);
    ctx.lineTo(bW * 0.43, ly);
    ctx.stroke();
  }

  if (!isAttacking) {
    const inkLine = Math.floor(writeCycle * 8);
    const inkProgress = (writeCycle * 8) % 1;

    for (let pl = 0; pl < inkLine && pl < 8; pl++) {
      const ply = -bH * 0.36 + pl * bH * 0.1;
      ctx.strokeStyle = "rgba(15, 10, 5, 0.4)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06, ply);
      ctx.lineTo(
        bW * 0.06 + bW * (0.28 + Math.sin(pl * 2.3) * 0.09),
        ply,
      );
      ctx.stroke();
    }

    if (inkLine < 8) {
      const iy = -bH * 0.36 + inkLine * bH * 0.1;
      ctx.strokeStyle = "rgba(10, 5, 0, 0.7)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06, iy);
      ctx.lineTo(bW * 0.06 + bW * 0.37 * inkProgress, iy);
      ctx.stroke();

      const shineStart = Math.max(0, inkProgress - 0.2);
      ctx.strokeStyle = "rgba(60, 80, 120, 0.15)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06 + bW * 0.37 * shineStart, iy);
      ctx.lineTo(bW * 0.06 + bW * 0.37 * inkProgress, iy);
      ctx.stroke();

      ctx.fillStyle = "rgba(20, 15, 10, 0.3)";
      ctx.beginPath();
      ctx.arc(
        bW * 0.06 + bW * 0.37 * inkProgress,
        iy,
        size * 0.004,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  } else {
    const glowPulse = 0.5 + Math.sin(time * 4) * 0.3;
    ctx.strokeStyle = `rgba(80, 200, 220, ${0.3 * glowPulse})`;
    ctx.lineWidth = 1;
    for (let gl = 0; gl < 6; gl++) {
      const gly = -bH * 0.36 + gl * bH * 0.12;
      const liftOff = Math.sin(time * 3 + gl * 0.8) * size * 0.003;
      ctx.beginPath();
      ctx.moveTo(bW * 0.06, gly + liftOff);
      ctx.lineTo(
        bW * 0.06 + bW * (0.25 + Math.sin(gl * 1.7) * 0.08),
        gly + liftOff,
      );
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(80, 200, 220, ${0.06 * glowPulse})`;
    ctx.fillRect(bW * 0.02, -bH * 0.46, bW * 0.45, bH * 0.92);
  }

  // Silvery blue corner decorations on covers
  ctx.strokeStyle = "#6898b0";
  ctx.lineWidth = 0.8;
  const corners = [
    { cx: -bW * 0.47, cy: -bH * 0.47, dx: 1, dy: 1 },
    { cx: -bW * 0.02, cy: -bH * 0.47, dx: -1, dy: 1 },
    { cx: bW * 0.47, cy: -bH * 0.47, dx: -1, dy: 1 },
    { cx: bW * 0.02, cy: -bH * 0.47, dx: 1, dy: 1 },
  ];
  for (const c of corners) {
    ctx.beginPath();
    ctx.moveTo(c.cx, c.cy + c.dy * bH * 0.04);
    ctx.lineTo(c.cx, c.cy);
    ctx.lineTo(c.cx + c.dx * bW * 0.05, c.cy);
    ctx.stroke();
  }

  // Silvery blue ribbon bookmark hanging out bottom
  ctx.strokeStyle = "#80b8d0";
  ctx.lineWidth = 1.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(bW * 0.15, bH * 0.48);
  ctx.quadraticCurveTo(bW * 0.18, bH * 0.62, bW * 0.12, bH * 0.7);
  ctx.stroke();

  ctx.restore();
}

// ─── PEN ─────────────────────────────────────────────────────────────────────

function drawPen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackPhase: number,
  attackIntensity: number,
  penStrokeX: number,
  penStrokeY: number,
  targetPos?: Position,
) {
  const attackRise = isAttacking ? Math.min(attackPhase * 3, 1) : 0;
  const quillFlourish = isAttacking
    ? Math.sin(attackPhase * Math.PI * 2) * 1.5 +
      Math.cos(attackPhase * Math.PI * 3) * 0.4
    : 0;

  // Pen lifts from book and rises during attack transition
  const penBaseX = x + size * 0.1 + (isAttacking ? 0 : penStrokeX);
  const penBaseY =
    y + size * 0.12 + (isAttacking ? -size * 0.15 * attackRise : penStrokeY);
  const penIdleRot = -0.8 + Math.sin(time * 2) * 0.04;
  const penBaseRot = isAttacking
    ? -0.3 + quillFlourish * 0.4 + attackRise * 0.6
    : penIdleRot;

  const penRot = resolveWeaponRotation(
    targetPos,
    penBaseX,
    penBaseY,
    penBaseRot,
    Math.PI / 2,
    isAttacking ? 1.2 : 0.66,
    WEAPON_LIMITS.rightMelee,
  );

  ctx.save();
  ctx.translate(penBaseX, penBaseY);
  ctx.rotate(penRot);

  if (isAttacking) {
    ctx.shadowColor = "#80b8d8";
    ctx.shadowBlur = 15 * zoom * attackIntensity;
  }

  // Pen body
  const pg = ctx.createLinearGradient(
    -size * 0.02,
    -size * 0.2,
    size * 0.02,
    -size * 0.2,
  );
  pg.addColorStop(0, "#0a0a0a");
  pg.addColorStop(0.2, "#2a2a2a");
  pg.addColorStop(0.5, "#1a1a1a");
  pg.addColorStop(0.8, "#2a2a2a");
  pg.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = pg;
  ctx.beginPath();
  ctx.roundRect(
    -size * 0.025,
    -size * 0.2,
    size * 0.05,
    size * 0.28,
    size * 0.008,
  );
  ctx.fill();

  // Body highlight
  ctx.strokeStyle = "rgba(100, 100, 100, 0.3)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-size * 0.015, -size * 0.19);
  ctx.lineTo(-size * 0.015, size * 0.06);
  ctx.stroke();

  // Silvery blue bands
  const tbg = ctx.createLinearGradient(-size * 0.03, 0, size * 0.03, 0);
  tbg.addColorStop(0, "#607898");
  tbg.addColorStop(0.3, "#80a8c0");
  tbg.addColorStop(0.5, "#b0d0e8");
  tbg.addColorStop(0.7, "#80a8c0");
  tbg.addColorStop(1, "#607898");
  ctx.fillStyle = tbg;
  ctx.fillRect(-size * 0.028, -size * 0.16, size * 0.056, size * 0.02);
  ctx.fillRect(-size * 0.028, -size * 0.09, size * 0.056, size * 0.012);
  ctx.fillRect(-size * 0.028, -size * 0.02, size * 0.056, size * 0.012);
  ctx.fillRect(-size * 0.028, size * 0.05, size * 0.056, size * 0.02);

  // Clip
  ctx.fillStyle = tbg;
  ctx.fillRect(size * 0.02, -size * 0.14, size * 0.012, size * 0.12);
  ctx.beginPath();
  ctx.arc(size * 0.026, -size * 0.14, size * 0.006, 0, Math.PI * 2);
  ctx.fill();

  // Nib section
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.2);
  ctx.lineTo(-size * 0.015, -size * 0.24);
  ctx.lineTo(size * 0.015, -size * 0.24);
  ctx.lineTo(size * 0.02, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  // Silvery blue nib
  const ng = ctx.createLinearGradient(
    -size * 0.012,
    -size * 0.24,
    size * 0.012,
    -size * 0.24,
  );
  ng.addColorStop(0, "#607898");
  ng.addColorStop(0.5, "#a0c8e0");
  ng.addColorStop(1, "#607898");
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.24);
  ctx.lineTo(-size * 0.014, -size * 0.31);
  ctx.lineTo(0, -size * 0.35);
  ctx.lineTo(size * 0.014, -size * 0.31);
  ctx.closePath();
  ctx.fill();

  // Nib slit
  ctx.strokeStyle = "#304858";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.26);
  ctx.lineTo(0, -size * 0.33);
  ctx.stroke();

  // Glowing ink energy during attack — scatters outward from pen tip
  if (isAttacking) {
    for (let d = 0; d < 6; d++) {
      const dropPhase = (attackPhase + d * 0.12) % 1;
      const dy =
        -size * 0.37 - dropPhase * size * 0.25 - d * size * 0.03;
      const dx = Math.sin(time * 8 + d * 2.1) * size * 0.025 * dropPhase;
      const da = (1 - dropPhase) * 0.7;
      const dropR = size * (0.006 + (1 - dropPhase) * 0.008);
      ctx.fillStyle = `rgba(80, 180, 210, ${da * attackIntensity})`;
      ctx.beginPath();
      ctx.arc(dx, dy, dropR, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(20, 15, 10, ${da * 0.4})`;
      ctx.beginPath();
      ctx.arc(dx * 0.5, dy + size * 0.01, dropR * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── FLOATING WORDS ──────────────────────────────────────────────────────────

const FLOAT_WORDS = [
  "dream",
  "green",
  "light",
  "hope",
  "glory",
  "jazz",
  "Gatsby",
  "beauty",
];

function drawFloatingWords(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const count = isAttacking ? 8 : 4;
  const fontPx = Math.round((isAttacking ? 12 : 9) * zoom);
  ctx.font = `italic ${fontPx}px Georgia`;
  ctx.textAlign = "center";

  for (let i = 0; i < count; i++) {
    const speed = isAttacking ? 0.8 : 0.5;
    const phase = (time * speed + i * 0.55) % 3;
    const angle =
      (i * Math.PI * 2) / count + time * (isAttacking ? 0.6 : 0.4);
    const dist = size * (isAttacking ? 0.5 + phase * 0.2 : 0.45 + phase * 0.08);
    const wx = x + Math.cos(angle) * dist;
    const wy = y - size * 0.3 - phase * size * (isAttacking ? 0.3 : 0.2);
    const alpha =
      (1 - phase / 3) * (isAttacking ? 0.85 + attackIntensity * 0.15 : 0.5);

    if (isAttacking) {
      ctx.shadowColor = "rgba(80, 210, 210, 0.5)";
      ctx.shadowBlur = 6 * zoom * attackIntensity;
    }
    ctx.fillStyle = `rgba(130, 185, 220, ${alpha})`;
    ctx.fillText(FLOAT_WORDS[i % FLOAT_WORDS.length], wx, wy);
  }
  ctx.shadowBlur = 0;
}
