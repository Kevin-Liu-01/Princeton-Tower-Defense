import type { Tower, Enemy, Position } from "../../types";
import {
  ISO_PRISM_D_FACTOR,
} from "../../constants";
import {
  lightenColor,
  darkenColor,
} from "../../utils";
import {
  generateIsoHexVertices,
  computeHexSideNormals,
  sortSidesByDepth,
  drawHexCap,
  scaleVerts,
  type IsoOffFn,
} from "../helpers";
import {
  drawIsometricPrism,
  drawGear,
  drawSteamVent,
  drawConveyorBelt,
  drawEnergyTube,
  drawAmmoBox,
  drawWarningLight,
  draw3DAmmoBox,
  draw3DArmorShield,
  draw3DFuelTank,
  drawFuelFeedingTube,
  drawCannonAmmoBelt,
} from "./towerHelpers";

export function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  outerR: number,
  innerR: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    if (i === 0) ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    else ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
}

// CANNON TOWER - High-tech mechanical artillery platform
export function renderCannonTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
  enemies: Enemy[],
  selectedMap: string,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  cameraOffset?: Position,
  cameraZoom?: number,
) {
  void colors;
  void enemies;
  void selectedMap;
  void canvasWidth;
  void canvasHeight;
  void dpr;
  void cameraOffset;
  void cameraZoom;

  // Level 4 upgrade theme helpers
  const is4A = tower.level === 4 && tower.upgrade === "A";
  const is4B = tower.level === 4 && tower.upgrade === "B";
  const uc = <T>(a: T, b: T, def: T): T => (is4A ? a : is4B ? b : def);

  // Steel body palette (gray → dark gunmetal 4A, warm bronze 4B)
  const s = {
    s0: uc("#12121e", "#221a16", "#1a1a22"),
    s1: uc("#1e1e2a", "#322a22", "#2a2a32"),
    s2: uc("#2a2a38", "#423a2a", "#3a3a42"),
    s3: uc("#35354a", "#524a3a", "#4a4a52"),
    s4: uc("#44445a", "#625a44", "#5a5a62"),
    s5: uc("#55556a", "#726a55", "#6a6a72"),
    s6: uc("#66667a", "#827a66", "#7a7a82"),
    s7: uc("#77778a", "#928a77", "#8a8a92"),
  };
  // Tech accent (orange → amber-gold 4A, hot red 4B)
  const tAcc = uc("#ffaa22", "#ff3300", "#ff6600");
  const tRgba = uc("255, 170, 34", "255, 51, 0", "255, 102, 0");
  // Bearing/ring glow
  const bRgba = uc("255, 200, 80", "255, 80, 30", "255, 150, 50");

  ctx.save();
  const level = tower.level;
  const baseWidth = 36 + level * 5;
  const baseHeight = 24 + level * 8;

  // ========== BASE RAILING SETUP & BACK HALF (behind building body) ==========
  const canBalW = baseWidth * zoom * 0.5;
  const canBalD = baseWidth * zoom * ISO_PRISM_D_FACTOR;
  const canBalY = screenPos.y + 2 * zoom;
  const canBalRX = canBalW * 1.05;
  const canBalRY = canBalD * 1.05;
  const canBalH = 5 * zoom;
  const canBalSegs = 32;
  const canBalPosts = 16;

  ctx.strokeStyle = s.s2;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    canBalY,
    canBalRX,
    canBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = s.s4;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    canBalY - canBalH,
    canBalRX,
    canBalRY,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.strokeStyle = s.s4;
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < canBalPosts; bp++) {
    const pa = (bp / canBalPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) continue;
    const px = screenPos.x + Math.cos(pa) * canBalRX;
    const py = canBalY + Math.sin(pa) * canBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - canBalH);
    ctx.stroke();
  }
  for (let i = 0; i < canBalSegs; i++) {
    const a0 = (i / canBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / canBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) > 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * canBalRX;
    const y0b = canBalY + Math.sin(a0) * canBalRY;
    const x1 = screenPos.x + Math.cos(a1) * canBalRX;
    const y1b = canBalY + Math.sin(a1) * canBalRY;
    ctx.fillStyle = `rgba(${uc("53, 53, 74", "82, 74, 53", "74, 74, 82")}, 0.35)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - canBalH);
    ctx.lineTo(x0, y0b - canBalH);
    ctx.closePath();
    ctx.fill();
  }

  // Enhanced mechanical base with tech panels
  drawMechanicalTowerBase(
    ctx,
    screenPos.x,
    screenPos.y,
    baseWidth,
    baseHeight,
    {
      base: s.s3,
      dark: s.s1,
      light: s.s5,
      accent: tAcc,
    },
    zoom,
    time,
    level,
    s,
    tAcc,
    tRgba,
  );

  const topY = screenPos.y - baseHeight * zoom;

  // ========== BASE RAILING FRONT HALF (in front of building body) ==========
  ctx.strokeStyle = s.s2;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(screenPos.x, canBalY, canBalRX, canBalRY, 0, 0, Math.PI);
  ctx.stroke();
  ctx.strokeStyle = s.s4;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    canBalY - canBalH,
    canBalRX,
    canBalRY,
    0,
    0,
    Math.PI,
  );
  ctx.stroke();
  ctx.strokeStyle = s.s4;
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < canBalPosts; bp++) {
    const pa = (bp / canBalPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) continue;
    const px = screenPos.x + Math.cos(pa) * canBalRX;
    const py = canBalY + Math.sin(pa) * canBalRY;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - canBalH);
    ctx.stroke();
  }
  for (let i = 0; i < canBalSegs; i++) {
    const a0 = (i / canBalSegs) * Math.PI * 2;
    const a1 = ((i + 1) / canBalSegs) * Math.PI * 2;
    if (Math.sin((a0 + a1) / 2) <= 0) continue;
    const x0 = screenPos.x + Math.cos(a0) * canBalRX;
    const y0b = canBalY + Math.sin(a0) * canBalRY;
    const x1 = screenPos.x + Math.cos(a1) * canBalRX;
    const y1b = canBalY + Math.sin(a1) * canBalRY;
    ctx.fillStyle = `rgba(${uc("53, 53, 74", "82, 74, 53", "74, 74, 82")}, 0.25)`;
    ctx.beginPath();
    ctx.moveTo(x0, y0b);
    ctx.lineTo(x1, y1b);
    ctx.lineTo(x1, y1b - canBalH);
    ctx.lineTo(x0, y0b - canBalH);
    ctx.closePath();
    ctx.fill();
  }

  // ========== ENHANCED TURRET MOUNTING PLATFORM ==========

  // Outer mounting ring (heavy base)
  ctx.fillStyle = s.s1;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 4 * zoom,
    baseWidth * 0.58 * zoom,
    baseWidth * 0.29 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Tech platform on top
  ctx.fillStyle = s.s2;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    baseWidth * 0.5 * zoom,
    baseWidth * ISO_PRISM_D_FACTOR * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Inner platform detail
  ctx.fillStyle = s.s3;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 1 * zoom,
    baseWidth * 0.4 * zoom,
    baseWidth * 0.2 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing tech ring
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.strokeStyle = `rgba(${tRgba}, ${pulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    topY + 2 * zoom,
    baseWidth * 0.45 * zoom,
    baseWidth * 0.22 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Mounting bolts around platform
  ctx.fillStyle = s.s4;
  for (let i = 0; i < 8; i++) {
    const boltAngle = (i / 8) * Math.PI * 2 + time * 0.5;
    const boltX = screenPos.x + Math.cos(boltAngle) * baseWidth * 0.48 * zoom;
    const boltY =
      topY + 2 * zoom + Math.sin(boltAngle) * baseWidth * 0.24 * zoom;
    ctx.beginPath();
    ctx.arc(boltX, boltY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Power conduits to turret (level 2+)
  if (level >= 2) {
    ctx.strokeStyle = `rgba(${tRgba}, ${0.4 + Math.sin(time * 4) * 0.2})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 4; i++) {
      const conduitAngle = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const startX =
        screenPos.x + Math.cos(conduitAngle) * baseWidth * 0.5 * zoom;
      const startY =
        topY + 2 * zoom + Math.sin(conduitAngle) * baseWidth * 0.25 * zoom;
      const endX =
        screenPos.x + Math.cos(conduitAngle) * baseWidth * 0.25 * zoom;
      const endY =
        topY - 5 * zoom + Math.sin(conduitAngle) * baseWidth * 0.12 * zoom;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  // Central rotation mechanism (level 3)
  if (level >= 3) {
    // Rotation bearing
    ctx.strokeStyle = s.s5;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY - 1 * zoom,
      baseWidth * 0.25 * zoom,
      baseWidth * 0.12 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Bearing glow
    ctx.strokeStyle = `rgba(${bRgba}, ${pulse * 0.5})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      topY - 1 * zoom,
      baseWidth * 0.22 * zoom,
      baseWidth * 0.11 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Render appropriate cannon variant
  if (tower.level === 4 && tower.upgrade === "A") {
    renderGatlingGun(ctx, screenPos, topY, tower, zoom, time);
  } else if (tower.level === 4 && tower.upgrade === "B") {
    renderFlamethrower(ctx, screenPos, topY, tower, zoom, time);
  } else if (tower.level === 3) {
    renderHeavyCannon(ctx, screenPos, topY, tower, zoom, time);
  } else {
    renderStandardCannon(ctx, screenPos, topY, tower, zoom, time);
  }

  ctx.restore();
}

export function drawMechanicalFaceDetails(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: { base: string; dark: string; light: string; accent: string },
  zoom: number,
  time: number,
  level: number,
  tRgbaOverride?: string,
) {
  const _tR = tRgbaOverride ?? "255, 102, 0";
  const wFactor = 0.5;
  const dFactor = ISO_PRISM_D_FACTOR;
  const w = width * zoom * wFactor;
  const d = width * zoom * dFactor;
  const h = (height - 8) * zoom;
  const baseY = y + 4 * zoom;

  // Front-left face corners (topLeft -> topFront -> bottomFront -> bottomLeft)
  const lTL = { x: x - w, y: baseY - h };
  const lTF = { x, y: baseY - h + d };
  const lBF = { x, y: baseY + d };
  const lBL = { x: x - w, y: baseY };

  // Front-right face corners (topRight -> topFront -> bottomFront -> bottomRight)
  const rTR = { x: x + w, y: baseY - h };
  const rTF = { x, y: baseY - h + d };
  const rBF = { x, y: baseY + d };
  const rBR = { x: x + w, y: baseY };

  const lerpV = (
    a: { x: number; y: number },
    b: { x: number; y: number },
    t: number,
  ) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  // ── Weathering gradient (darker at bottom, lighter at top) ──
  const panelRows = 3 + Math.min(level, 2);
  for (let row = 0; row < panelRows; row++) {
    const t0 = row / panelRows;
    const t1 = (row + 1) / panelRows;
    const darken = (1 - t0) * 0.06;

    // Left face weathering strip
    const ls0 = lerpV(lBL, lTL, t0);
    const ls1 = lerpV(lBL, lTL, t1);
    const le0 = lerpV(lBF, lTF, t0);
    const le1 = lerpV(lBF, lTF, t1);

    if (row % 2 === 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${darken})`;
      ctx.beginPath();
      ctx.moveTo(ls1.x, ls1.y);
      ctx.lineTo(le1.x, le1.y);
      ctx.lineTo(le0.x, le0.y);
      ctx.lineTo(ls0.x, ls0.y);
      ctx.closePath();
      ctx.fill();
    }

    // Right face weathering strip
    const rs0 = lerpV(rBR, rTR, t0);
    const rs1 = lerpV(rBR, rTR, t1);
    const re0 = lerpV(rBF, rTF, t0);
    const re1 = lerpV(rBF, rTF, t1);

    if (row % 2 === 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${darken})`;
      ctx.beginPath();
      ctx.moveTo(rs1.x, rs1.y);
      ctx.lineTo(re1.x, re1.y);
      ctx.lineTo(re0.x, re0.y);
      ctx.lineTo(rs0.x, rs0.y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ── Horizontal panel seam lines ──
  ctx.lineWidth = 1 * zoom;
  for (let row = 1; row < panelRows; row++) {
    const t = row / panelRows;

    // Left face seam
    const ls = lerpV(lBL, lTL, t);
    const le = lerpV(lBF, lTF, t);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.moveTo(ls.x, ls.y);
    ctx.lineTo(le.x, le.y);
    ctx.stroke();
    // Highlight below seam
    ctx.strokeStyle = `rgba(255, 255, 255, 0.06)`;
    ctx.beginPath();
    ctx.moveTo(ls.x, ls.y + 1 * zoom);
    ctx.lineTo(le.x, le.y + 1 * zoom);
    ctx.stroke();

    // Right face seam
    const rs = lerpV(rBR, rTR, t);
    const re = lerpV(rBF, rTF, t);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.moveTo(rs.x, rs.y);
    ctx.lineTo(re.x, re.y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 255, 255, 0.04)`;
    ctx.beginPath();
    ctx.moveTo(rs.x, rs.y + 1 * zoom);
    ctx.lineTo(re.x, re.y + 1 * zoom);
    ctx.stroke();
  }

  // ── Vertical panel division (center of each face) ──
  ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
  ctx.lineWidth = 1 * zoom;
  const lMidTop = lerpV(lTL, lTF, 0.5);
  const lMidBot = lerpV(lBL, lBF, 0.5);
  ctx.beginPath();
  ctx.moveTo(lMidTop.x, lMidTop.y);
  ctx.lineTo(lMidBot.x, lMidBot.y);
  ctx.stroke();

  const rMidTop = lerpV(rTR, rTF, 0.5);
  const rMidBot = lerpV(rBR, rBF, 0.5);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
  ctx.beginPath();
  ctx.moveTo(rMidTop.x, rMidTop.y);
  ctx.lineTo(rMidBot.x, rMidBot.y);
  ctx.stroke();

  // ── Rivet/bolt details at panel intersections ──
  ctx.fillStyle = lightenColor(colors.base, 25);
  for (let row = 0; row <= panelRows; row++) {
    const t = row / panelRows;
    // Left face rivets: at edges and center
    for (const s of [0.08, 0.5, 0.92]) {
      const edgeL = lerpV(lBL, lTL, t);
      const edgeR = lerpV(lBF, lTF, t);
      const rp = lerpV(edgeL, edgeR, s);
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 1.3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    // Right face rivets
    ctx.fillStyle = lightenColor(colors.dark, 20);
    for (const s of [0.08, 0.5, 0.92]) {
      const edgeL = lerpV(rBR, rTR, t);
      const edgeR = lerpV(rBF, rTF, t);
      const rp = lerpV(edgeL, edgeR, s);
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = lightenColor(colors.base, 25);
  }

  // ── Observation slits (narrow glowing viewports) ──
  const slitCount = Math.min(level, 3);
  for (let i = 0; i < slitCount; i++) {
    const slitT = 0.3 + (i * 0.25) / Math.max(slitCount, 1);
    const slitGlow = 0.4 + Math.sin(time * 3 + i * 1.5) * 0.2;

    // Left face slit
    const slitLS = lerpV(lerpV(lBL, lTL, slitT), lerpV(lBF, lTF, slitT), 0.2);
    const slitLE = lerpV(lerpV(lBL, lTL, slitT), lerpV(lBF, lTF, slitT), 0.45);

    // Slit recess (dark)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(slitLS.x, slitLS.y);
    ctx.lineTo(slitLE.x, slitLE.y);
    ctx.stroke();

    // Slit glow
    ctx.strokeStyle = `rgba(${_tR}, ${slitGlow * 0.45})`;
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(slitLS.x, slitLS.y);
    ctx.lineTo(slitLE.x, slitLE.y);
    ctx.stroke();

    // Right face slit
    const slitRS = lerpV(lerpV(rBR, rTR, slitT), lerpV(rBF, rTF, slitT), 0.55);
    const slitRE = lerpV(lerpV(rBR, rTR, slitT), lerpV(rBF, rTF, slitT), 0.8);

    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(slitRS.x, slitRS.y);
    ctx.lineTo(slitRE.x, slitRE.y);
    ctx.stroke();

    ctx.strokeStyle = `rgba(${_tR}, ${slitGlow * 0.35})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(slitRS.x, slitRS.y);
    ctx.lineTo(slitRE.x, slitRE.y);
    ctx.stroke();
  }

  // ── Corner edge reinforcement (beveled metal strips) ──
  // Front-left edge (where left and right faces meet at front vertex)
  ctx.strokeStyle = lightenColor(colors.light, 15);
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(lTF.x, lTF.y);
  ctx.lineTo(lBF.x, lBF.y);
  ctx.stroke();

  // Left edge highlight
  ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(lTL.x + 1 * zoom, lTL.y);
  ctx.lineTo(lBL.x + 1 * zoom, lBL.y);
  ctx.stroke();

  // Right edge highlight
  ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
  ctx.beginPath();
  ctx.moveTo(rTR.x - 1 * zoom, rTR.y);
  ctx.lineTo(rBR.x - 1 * zoom, rBR.y);
  ctx.stroke();

  // ── Crenellations / battlements along the top ──
  const crenelCount = 4 + Math.min(level, 2);
  const crenelH = 4 * zoom;
  const crenelGap = 0.5;

  // Left face crenellations
  for (let i = 0; i < crenelCount; i++) {
    const t = (i + 0.25) / crenelCount;
    if (i % 2 !== 0) continue;
    const tNext = Math.min((i + crenelGap) / crenelCount, 1);
    const bl = lerpV(lTL, lTF, t);
    const br = lerpV(lTL, lTF, tNext);

    // Merlon (raised portion)
    ctx.fillStyle = lightenColor(colors.base, 8);
    ctx.beginPath();
    ctx.moveTo(bl.x, bl.y);
    ctx.lineTo(bl.x, bl.y - crenelH);
    ctx.lineTo(br.x, br.y - crenelH);
    ctx.lineTo(br.x, br.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // Right face crenellations
  for (let i = 0; i < crenelCount; i++) {
    const t = (i + 0.25) / crenelCount;
    if (i % 2 !== 0) continue;
    const tNext = Math.min((i + crenelGap) / crenelCount, 1);
    const bl = lerpV(rTR, rTF, t);
    const br = lerpV(rTR, rTF, tNext);

    ctx.fillStyle = darkenColor(colors.dark, 5);
    ctx.beginPath();
    ctx.moveTo(bl.x, bl.y);
    ctx.lineTo(bl.x, bl.y - crenelH);
    ctx.lineTo(br.x, br.y - crenelH);
    ctx.lineTo(br.x, br.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }
}

// Mechanical base with tech details - FULLY ENCLOSED isometric design
export function drawMechanicalTowerBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colors: { base: string; dark: string; light: string; accent: string },
  zoom: number,
  time: number,
  level: number,
  sp?: { s0: string; s1: string; s2: string; s3: string; s4: string; s5: string; s6: string; s7: string },
  tAcc?: string,
  tRgba?: string,
) {
  const _s = sp ?? { s0: "#1a1a22", s1: "#2a2a32", s2: "#3a3a42", s3: "#4a4a52", s4: "#5a5a62", s5: "#6a6a72", s6: "#7a7a82", s7: "#8a8a92" };
  const _tAcc = tAcc ?? "#ff6600";
  const _tRgba = tRgba ?? "255, 102, 0";
  // Stepped foundation — rough-hewn plinth (bottom tier)
  drawIsometricPrism(
    ctx,
    x,
    y + 14 * zoom,
    width + 18,
    width + 18,
    6,
    {
      top: _s.s1,
      left: darkenColor(_s.s1, 8),
      right: darkenColor(_s.s1, 16),
      leftBack: lightenColor(_s.s1, 5),
      rightBack: lightenColor(_s.s1, 2),
    },
    zoom,
  );

  // Foundation middle tier — dressed stone
  drawIsometricPrism(
    ctx,
    x,
    y + 10 * zoom,
    width + 12,
    width + 12,
    6,
    {
      top: _s.s2,
      left: _s.s1,
      right: darkenColor(_s.s1, 5),
      leftBack: lightenColor(_s.s2, 3),
      rightBack: darkenColor(_s.s2, 5),
    },
    zoom,
  );

  // Copper trim band along upper step edge
  {
    const trimW = (width + 12) * zoom * 0.5;
    const trimD = (width + 12) * zoom * ISO_PRISM_D_FACTOR;
    const trimY = y + 4 * zoom;
    ctx.strokeStyle = "#b87333";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - trimW, trimY);
    ctx.lineTo(x, trimY + trimD);
    ctx.lineTo(x + trimW, trimY);
    ctx.stroke();
    // Copper rivet dots along trim
    ctx.fillStyle = "#d4956a";
    const rivetCount = 6;
    for (let r = 0; r < rivetCount; r++) {
      const t = (r + 0.5) / rivetCount;
      if (t < 0.5) {
        const rx = x - trimW + t * 2 * trimW;
        const ry = trimY + t * 2 * trimD;
        ctx.beginPath();
        ctx.arc(rx, ry, 0.9 * zoom, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const t2 = (t - 0.5) * 2;
        const rx = x + t2 * trimW;
        const ry = trimY + trimD - t2 * trimD;
        ctx.beginPath();
        ctx.arc(rx, ry, 0.9 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Foundation mortar joints with double-line rendering (dark groove + light upper edge)
  {
    const fndW = (width + 12) * zoom * 0.5;
    const fndD = (width + 12) * zoom * ISO_PRISM_D_FACTOR;
    const fndH = 6 * zoom;
    const fndBaseY = y + 10 * zoom;
    // Left face mortar
    for (let m = 1; m <= 2; m++) {
      const mFrac = m / 3;
      const mY = fndBaseY - mFrac * fndH;
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - fndW, mY);
      ctx.lineTo(x, mY + fndD);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - fndW, mY - 0.8 * zoom);
      ctx.lineTo(x, mY + fndD - 0.8 * zoom);
      ctx.stroke();
    }
    // Right face mortar
    for (let m = 1; m <= 2; m++) {
      const mFrac = m / 3;
      const mY = fndBaseY - mFrac * fndH;
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(x, mY + fndD);
      ctx.lineTo(x + fndW, mY);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(x, mY + fndD - 0.8 * zoom);
      ctx.lineTo(x + fndW, mY - 0.8 * zoom);
      ctx.stroke();
    }
  }

  // Main tower body (middle layer) - this is the core structure
  drawIsometricPrism(
    ctx,
    x,
    y + 4 * zoom,
    width,
    width,
    height - 8,
    {
      top: colors.light,
      left: colors.base,
      right: colors.dark,
      leftBack: lightenColor(colors.base, 10),
      rightBack: lightenColor(colors.dark, 5),
    },
    zoom,
  );

  // Tech layer on top
  drawIsometricPrism(
    ctx,
    x,
    y - (height - 12) * zoom,
    width - 4,
    width - 4,
    8,
    {
      top: lightenColor(colors.base, 15),
      left: colors.base,
      right: colors.dark,
      leftBack: colors.light,
      rightBack: lightenColor(colors.dark, 8),
    },
    zoom,
  );

  // ========== FACE DETAIL OVERLAYS (panels, rivets, slits, crenellations) ==========
  drawMechanicalFaceDetails(
    ctx,
    x,
    y,
    width,
    height,
    colors,
    zoom,
    time,
    level,
    _tRgba,
  );

  // Add tech details on top of the fully enclosed base
  const topY = y - height * zoom;
  const w = width * zoom * 0.5;
  const d = width * zoom * ISO_PRISM_D_FACTOR;

  // ========== STEAM VENTS ==========
  // Left side steam vent
  drawSteamVent(
    ctx,
    x - w * 0.75,
    y - height * zoom * 0.1,
    time,
    0.8 + level * 0.2,
    zoom,
  );

  // Right side steam vent (higher levels)
  if (level >= 2) {
    drawSteamVent(
      ctx,
      x + w * 0.7,
      y - height * zoom * 0.15,
      time + 0.5,
      0.6 + level * 0.15,
      zoom,
    );
  }

  // ========== ENERGY TUBES (following isometric faces) ==========
  drawEnergyTube(
    ctx,
    x - w * 0.6,
    y + d * 0.2,
    x - w * 0.35,
    y - height * zoom * 0.6 + d * 0.1,
    2,
    time,
    zoom,
    `rgb(${_tRgba})`,
  );

  if (level >= 3) {
    drawEnergyTube(
      ctx,
      x + w * 0.6,
      y + d * 0.15,
      x + w * 0.35,
      y - height * zoom * 0.55 + d * 0.1,
      2.5,
      time + 0.3,
      zoom,
      `rgb(${_tRgba})`,
    );
  }

  // Tech panel lines on front faces (flipped orientation)
  ctx.strokeStyle = lightenColor(colors.light, 20);
  ctx.lineWidth = 1 * zoom;

  // Left face panel lines (diagonal going other direction)
  for (let i = 1; i <= Math.min(level, 3); i++) {
    const lineY = y + 4 * zoom - ((height - 8) * zoom * i) / (level + 1);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.15, lineY + d * 0.3);
    ctx.lineTo(x - w * 0.85, lineY - d * 0.4);
    ctx.stroke();
  }

  // Right face panel lines (diagonal going other direction)
  for (let i = 1; i <= Math.min(level, 3); i++) {
    const lineY = y + 4 * zoom - ((height - 8) * zoom * i) / (level + 1);
    ctx.beginPath();
    ctx.moveTo(x + w * 0.85, lineY - d * 0.3);
    ctx.lineTo(x + w * 0.15, lineY + d * 0.4);
    ctx.stroke();
  }

  // ========== LOUVERED EXHAUST VENTS WITH 3D HOUSING ==========
  const ventGlow = 0.6 + Math.sin(time * 4) * 0.3;

  // Draw a single louvered vent on an isometric face
  const drawFaceVent = (
    vx: number,
    vy: number,
    vw: number,
    vh: number,
    isoSlopeX: number,
    isoSlopeY: number,
    faceSide: number,
  ) => {
    // Vent recess
    ctx.fillStyle = _s.s0;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(vx + isoSlopeX * vw, vy + isoSlopeY * vw);
    ctx.lineTo(vx + isoSlopeX * vw, vy + isoSlopeY * vw + vh);
    ctx.lineTo(vx, vy + vh);
    ctx.closePath();
    ctx.fill();

    // Louvered slats
    const numSlats = 3;
    for (let sl = 0; sl < numSlats; sl++) {
      const sT = (sl + 0.5) / numSlats;
      const sY = vy + sT * vh;
      const sYR = vy + isoSlopeY * vw + sT * vh;
      ctx.fillStyle = faceSide > 0 ? _s.s3 : _s.s2;
      ctx.beginPath();
      ctx.moveTo(vx + 0.5 * zoom, sY - 1 * zoom);
      ctx.lineTo(vx + isoSlopeX * vw - 0.5 * zoom, sYR - 1 * zoom);
      ctx.lineTo(vx + isoSlopeX * vw - 0.5 * zoom, sYR);
      ctx.lineTo(vx + 0.5 * zoom, sY);
      ctx.closePath();
      ctx.fill();
      // Slat highlight
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.beginPath();
      ctx.moveTo(vx + 0.5 * zoom, sY - 1 * zoom);
      ctx.lineTo(vx + isoSlopeX * vw - 0.5 * zoom, sYR - 1 * zoom);
      ctx.lineTo(vx + isoSlopeX * vw - 0.5 * zoom, sYR - 0.5 * zoom);
      ctx.lineTo(vx + 0.5 * zoom, sY - 0.5 * zoom);
      ctx.closePath();
      ctx.fill();
    }

    // Inner glow between slats
    ctx.fillStyle = `rgba(${_tRgba}, ${ventGlow * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(vx + 0.8 * zoom, vy + 0.8 * zoom);
    ctx.lineTo(
      vx + isoSlopeX * vw - 0.8 * zoom,
      vy + isoSlopeY * vw + 0.8 * zoom,
    );
    ctx.lineTo(
      vx + isoSlopeX * vw - 0.8 * zoom,
      vy + isoSlopeY * vw + vh - 0.8 * zoom,
    );
    ctx.lineTo(vx + 0.8 * zoom, vy + vh - 0.8 * zoom);
    ctx.closePath();
    ctx.fill();

    // Iron frame
    ctx.strokeStyle = _s.s4;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.lineTo(vx + isoSlopeX * vw, vy + isoSlopeY * vw);
    ctx.lineTo(vx + isoSlopeX * vw, vy + isoSlopeY * vw + vh);
    ctx.lineTo(vx, vy + vh);
    ctx.closePath();
    ctx.stroke();

    // Corner rivets
    ctx.fillStyle = _s.s5;
    const corners = [
      { x: vx + 0.8 * zoom, y: vy + 0.8 * zoom },
      {
        x: vx + isoSlopeX * vw - 0.8 * zoom,
        y: vy + isoSlopeY * vw + 0.8 * zoom,
      },
      { x: vx + 0.8 * zoom, y: vy + vh - 0.8 * zoom },
      {
        x: vx + isoSlopeX * vw - 0.8 * zoom,
        y: vy + isoSlopeY * vw + vh - 0.8 * zoom,
      },
    ];
    for (const c of corners) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Right face vents (visible on front-right isometric face)
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 12 * zoom + d * 1.2;
    drawFaceVent(x + w * 0.3, ventY, w * 0.5, 5 * zoom, 1, -0.5, 1);
  }

  // Left face vents
  for (let i = 0; i < Math.min(level, 3); i++) {
    const ventY = y - height * zoom * 0.3 - i * 12 * zoom + d * 1.2;
    drawFaceVent(x - w * 0.8, ventY, w * 0.5, 5 * zoom, 1, 0.5, -1);
  }

  // ========== ROTATING GEARS ==========
  const gearRotation = 1.25;

  // Large gear on left side (visible on front face)
  drawGear(
    ctx,
    x - w * 0.7,
    y - height * zoom * 0.5,
    12 + level * 2,
    8 + level,
    8 + level * 2,
    gearRotation,
    {
      outer: _s.s3,
      inner: _s.s2,
      teeth: _s.s4,
      highlight: colors.accent,
    },
    zoom,
  );

  // Smaller gear meshing with large gear (counter-rotation)
  drawGear(
    ctx,
    x - w * 0.2,
    y - height * zoom * 0.65,
    8 + level,
    5 + level * 0.5,
    6 + level,
    gearRotation,
    {
      outer: _s.s4,
      inner: _s.s3,
      teeth: _s.s5,
      highlight: colors.accent,
    },
    zoom,
  );

  // Gear on right side
  if (level >= 2) {
    drawGear(
      ctx,
      x + w * 0.55,
      y - height * zoom * 0.55,
      10 + level,
      7,
      8 + level,
      -gearRotation,
      {
        outer: _s.s3,
        inner: _s.s2,
        teeth: _s.s4,
        highlight: colors.accent,
      },
      zoom,
    );
  }

  // ========== CONVEYOR BELT WITH AMMO ==========
  if (level >= 2) {
    drawConveyorBelt(
      ctx,
      x - w * 0.5,
      y + 6 * zoom,
      x - w * 0.5,
      y - height * zoom * 1.1,
      6,
      time,
      zoom,
      "#8b4513", // Brass ammo color
    );
  }

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    x - w * 0.85,
    y - height * zoom + 12 * zoom,
    3,
    time,
    zoom,
    "#ff4400",
    4,
  );
  if (level >= 2) {
    drawWarningLight(
      ctx,
      x + w * 0.85,
      y - height * zoom + 12 * zoom,
      3,
      time + 0.5,
      zoom,
      "#ffaa00",
      3,
    );
  }

  // ========== AMMO BOXES (skip for level 4 - turret has its own) ==========
  if (level >= 2 && level < 4) {
    drawAmmoBox(
      ctx,
      x - w * 0.5,
      y + 5 * zoom,
      12,
      6,
      12,
      { main: "#5a4a3a", accent: "#ff6600", label: "#c9a227" },
      zoom,
      time * 2,
    );
  }
  if (level >= 3 && level < 4) {
    drawAmmoBox(
      ctx,
      x - w * 0.5,
      y + 2 * zoom,
      14,
      5,
      10,
      { main: "#4a3a2a", accent: "#ffaa00", label: "#c9a227" },
      zoom,
      time * 2 + 1,
    );
  }

  // ========== SCAFFOLDING & SUPPORT STRUCTURE (Level 2+) ==========
  if (level >= 2) {
    const ws = w * 1.15;
    const ds = d * 1.15;
    const scaffBase = y + 6 * zoom;
    const scaffTop = topY + 8 * zoom;
    const scaffH = scaffBase - scaffTop;

    // 4 isometric diamond vertices at base and top
    const postBase = [
      { x: x - ws, y: scaffBase }, // left
      { x, y: scaffBase + ds }, // front
      { x: x + ws, y: scaffBase }, // right
      { x, y: scaffBase - ds }, // back
    ];
    const postTop = [
      { x: x - ws, y: scaffBase - scaffH },
      { x, y: scaffBase + ds - scaffH },
      { x: x + ws, y: scaffBase - scaffH },
      { x, y: scaffBase - ds - scaffH },
    ];

    // Horizontal frame heights (fractions of scaffH)
    const frameLevels = level >= 3 ? [0, 0.35, 0.7, 1] : [0, 0.5, 1];

    // Helper: draw an isometric beam (thick stroke with highlight)
    const drawBeam = (
      ax: number,
      ay: number,
      bx: number,
      by: number,
      thickness: number,
      color: string,
      highlightAlpha: number,
    ) => {
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = (thickness + 1.5) * zoom;
      ctx.beginPath();
      ctx.moveTo(ax, ay + 0.8 * zoom);
      ctx.lineTo(bx, by + 0.8 * zoom);
      ctx.stroke();

      ctx.strokeStyle = color;
      ctx.lineWidth = thickness * zoom;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      if (highlightAlpha > 0) {
        ctx.strokeStyle = `rgba(255,255,255,${highlightAlpha})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(ax, ay - 0.5 * zoom);
        ctx.lineTo(bx, by - 0.5 * zoom);
        ctx.stroke();
      }
    };

    // Helper: bolt/connector at a joint
    const drawJointBolt = (bx: number, by: number, radius: number) => {
      ctx.fillStyle = _s.s6;
      ctx.beginPath();
      ctx.arc(bx, by, radius * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = _s.s4;
      ctx.beginPath();
      ctx.arc(bx, by, radius * 0.55 * zoom, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw back faces first (behind tower: back-left edge [3->0] and back-right edge [3->2])
    // Back horizontal beams
    for (const frac of frameLevels) {
      const hy = scaffH * frac;
      const lv = { x: postBase[0].x, y: postBase[0].y - hy };
      const bv = { x: postBase[3].x, y: postBase[3].y - hy };
      const rv = { x: postBase[2].x, y: postBase[2].y - hy };
      drawBeam(bv.x, bv.y, lv.x, lv.y, 2.2, _s.s3, 0);
      drawBeam(bv.x, bv.y, rv.x, rv.y, 2.2, _s.s2, 0);
    }

    // Back vertical posts (left and back)
    drawBeam(
      postBase[3].x,
      postBase[3].y,
      postTop[3].x,
      postTop[3].y,
      2.5,
      _s.s3,
      0,
    );
    drawBeam(
      postBase[0].x,
      postBase[0].y,
      postTop[0].x,
      postTop[0].y,
      2.5,
      _s.s3,
      0.04,
    );

    // Back X-braces (back-left face)
    if (level >= 3) {
      const midFrac = frameLevels.length > 2 ? 1 : 0;
      const bBot = { x: postBase[3].x, y: postBase[3].y };
      const lTop = { x: postTop[0].x, y: postTop[0].y };
      const lBot = { x: postBase[0].x, y: postBase[0].y };
      const bTop = { x: postTop[3].x, y: postTop[3].y };
      void midFrac;
      ctx.strokeStyle = "rgba(80,80,90,0.5)";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(bBot.x, bBot.y);
      ctx.lineTo(lTop.x, lTop.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lBot.x, lBot.y);
      ctx.lineTo(bTop.x, bTop.y);
      ctx.stroke();
    }

    // Front vertical posts (front and right)
    drawBeam(
      postBase[1].x,
      postBase[1].y,
      postTop[1].x,
      postTop[1].y,
      3,
      _s.s5,
      0.08,
    );
    drawBeam(
      postBase[2].x,
      postBase[2].y,
      postTop[2].x,
      postTop[2].y,
      2.8,
      _s.s4,
      0.06,
    );

    // Front horizontal beams (front-left edge [0->1] and front-right edge [1->2])
    for (const frac of frameLevels) {
      const hy = scaffH * frac;
      const lv = { x: postBase[0].x, y: postBase[0].y - hy };
      const fv = { x: postBase[1].x, y: postBase[1].y - hy };
      const rv = { x: postBase[2].x, y: postBase[2].y - hy };
      drawBeam(lv.x, lv.y, fv.x, fv.y, 2.5, _s.s5, 0.07);
      drawBeam(fv.x, fv.y, rv.x, rv.y, 2.5, _s.s4, 0.05);
    }

    // Front X-braces (front-left and front-right faces)
    const xBraceColor = _s.s4;
    ctx.lineWidth = 1.5 * zoom;
    // Front-left face brace
    ctx.strokeStyle = xBraceColor;
    ctx.beginPath();
    ctx.moveTo(postBase[0].x, postBase[0].y);
    ctx.lineTo(postTop[1].x, postTop[1].y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(postBase[1].x, postBase[1].y);
    ctx.lineTo(postTop[0].x, postTop[0].y);
    ctx.stroke();
    // Front-right face brace
    ctx.beginPath();
    ctx.moveTo(postBase[1].x, postBase[1].y);
    ctx.lineTo(postTop[2].x, postTop[2].y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(postBase[2].x, postBase[2].y);
    ctx.lineTo(postTop[1].x, postTop[1].y);
    ctx.stroke();

    // Joint bolts at frame intersections
    for (const frac of frameLevels) {
      const hy = scaffH * frac;
      for (let pi = 0; pi < 4; pi++) {
        const jx = postBase[pi].x;
        const jy = postBase[pi].y - hy;
        const isFront = pi === 1 || pi === 2;
        drawJointBolt(jx, jy, isFront ? 2.2 : 1.6);
      }
    }
  }

  // ========== AMMO CHAIN/BELT FEED SYSTEM (Level 2+) ==========
  if (level >= 2) {
    // Ammo chain from side storage to turret
    const chainLinks = 8 + level * 2;
    const chainStartX = x - w * 1.0;
    const chainStartY = y - height * zoom * 0.1;
    const chainEndX = x - w * 0.3;
    const chainEndY = topY + 5 * zoom;

    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(chainStartX, chainStartY);

    // Curved chain path with sag
    const midX = (chainStartX + chainEndX) / 2;
    const midY = (chainStartY + chainEndY) / 2 + 10 * zoom;
    ctx.quadraticCurveTo(midX, midY, chainEndX, chainEndY);
    ctx.stroke();

    // Individual chain links
    ctx.fillStyle = "#cd853f";
    for (let i = 0; i < chainLinks; i++) {
      const t = i / chainLinks;
      const linkX = chainStartX + (chainEndX - chainStartX) * t;
      const linkY =
        chainStartY +
        (chainEndY - chainStartY) * t +
        Math.sin(t * Math.PI) * 10 * zoom;

      // Animate chain movement
      const chainAnim = (time * 2 + i * 0.3) % 1;
      const linkPulse = 0.6 + Math.sin(chainAnim * Math.PI * 2) * 0.2;

      ctx.fillStyle = `rgba(205, 133, 63, ${linkPulse})`;
      ctx.beginPath();
      ctx.ellipse(
        linkX,
        linkY,
        2.5 * zoom,
        1.5 * zoom,
        t * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // 3D Ammo storage drum (isometric cylinder)
    {
      const drumX = chainStartX;
      const drumY = chainStartY;
      const drumRx = 7 * zoom;
      const drumRy = 4 * zoom;
      const drumH = 18 * zoom;

      // Drum body (multi-facet cylinder - visible lower half)
      const drumFacets = 12;
      for (let f = 0; f < drumFacets; f++) {
        const a0 = (f / drumFacets) * Math.PI;
        const a1 = ((f + 1) / drumFacets) * Math.PI;
        const x0 = drumX + Math.cos(a0) * drumRx;
        const y0t = drumY - drumH + Math.sin(a0) * drumRy;
        const y0b = drumY + Math.sin(a0) * drumRy;
        const x1 = drumX + Math.cos(a1) * drumRx;
        const y1t = drumY - drumH + Math.sin(a1) * drumRy;
        const y1b = drumY + Math.sin(a1) * drumRy;
        const normalUp = Math.sin((a0 + a1) * 0.5);
        const shade = Math.round(58 + normalUp * 20);
        ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade + 10})`;
        ctx.beginPath();
        ctx.moveTo(x0, y0t);
        ctx.lineTo(x1, y1t);
        ctx.lineTo(x1, y1b);
        ctx.lineTo(x0, y0b);
        ctx.closePath();
        ctx.fill();
      }

      // Top ellipse cap
      ctx.fillStyle = _s.s4;
      ctx.beginPath();
      ctx.ellipse(drumX, drumY - drumH, drumRx, drumRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Top cap inner ring
      ctx.strokeStyle = _s.s5;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        drumX,
        drumY - drumH,
        drumRx * 0.65,
        drumRy * 0.65,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Metallic bands around drum
      for (let band = 0; band < 3; band++) {
        const bandT = (band + 0.5) / 3;
        const bandY = drumY - drumH + bandT * drumH;
        ctx.strokeStyle = _tAcc;
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(drumX, bandY, drumRx, drumRy, 0, 0, Math.PI);
        ctx.stroke();
        // Band highlight
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          drumX,
          bandY - 0.5 * zoom,
          drumRx * 0.98,
          drumRy * 0.98,
          0,
          Math.PI * 0.2,
          Math.PI * 0.8,
        );
        ctx.stroke();
      }

      // Rivets on bands
      ctx.fillStyle = _s.s6;
      for (let band = 0; band < 3; band++) {
        const bandT = (band + 0.5) / 3;
        const bandY = drumY - drumH + bandT * drumH;
        for (let rv = 0; rv < 4; rv++) {
          const rvA = (rv / 4) * Math.PI + 0.2;
          const rvX = drumX + Math.cos(rvA) * drumRx;
          const rvY = bandY + Math.sin(rvA) * drumRy;
          ctx.beginPath();
          ctx.arc(rvX, rvY, 0.8 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Bottom rim shadow
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.ellipse(drumX, drumY, drumRx, drumRy, 0, 0, Math.PI);
      ctx.stroke();

      // Specular highlight streak
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.moveTo(drumX - drumRx * 0.3, drumY - drumH);
      ctx.lineTo(drumX - drumRx * 0.1, drumY - drumH);
      ctx.lineTo(drumX - drumRx * 0.1, drumY);
      ctx.lineTo(drumX - drumRx * 0.3, drumY);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ========== ARMOR PLATING (Level 2+) ==========
  if (level >= 2) {
    // Side armor plates
    ctx.fillStyle = _s.s4;

    // Left armor plate
    ctx.beginPath();
    ctx.moveTo(x - w * 1.05, y + 2 * zoom);
    ctx.lineTo(x - w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x - w * 1.0, y - height * zoom * 0.35);
    ctx.lineTo(x - w * 0.9, y - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Right armor plate
    ctx.beginPath();
    ctx.moveTo(x + w * 1.05, y + 2 * zoom);
    ctx.lineTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1.0, y - height * zoom * 0.35);
    ctx.lineTo(x + w * 0.9, y - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Armor plate rivets
    ctx.fillStyle = _s.s6;
    const rivetPositions = [
      { x: x - w * 1.05, y: y - height * zoom * 0.1 },
      { x: x - w * 1.1, y: y - height * zoom * 0.25 },
      { x: x + w * 1.05, y: y - height * zoom * 0.1 },
      { x: x + w * 1.1, y: y - height * zoom * 0.25 },
    ];
    for (const rivet of rivetPositions) {
      ctx.beginPath();
      ctx.arc(rivet.x, rivet.y, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Armor edge highlight
    ctx.strokeStyle = _s.s7;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x - w * 1.0, y - height * zoom * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1.0, y - height * zoom * 0.35);
    ctx.stroke();
  }

  // ========== LEVEL 3 HEAVY ARMOR & EQUIPMENT ==========
  if (level >= 3) {
    // Additional heavy armor plating on front
    ctx.fillStyle = _s.s3;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.6, y + 4 * zoom);
    ctx.lineTo(x - w * 0.8, y - height * zoom * 0.5);
    ctx.lineTo(x - w * 0.5, y - height * zoom * 0.55);
    ctx.lineTo(x - w * 0.3, y + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + w * 0.6, y + 4 * zoom);
    ctx.lineTo(x + w * 0.8, y - height * zoom * 0.5);
    ctx.lineTo(x + w * 0.5, y - height * zoom * 0.55);
    ctx.lineTo(x + w * 0.3, y + 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Secondary ammo chain (right side)
    const chain2Links = 6;
    const chain2StartX = x + w * 1.0;
    const chain2StartY = y - height * zoom * 0.15;
    const chain2EndX = x + w * 0.3;
    const chain2EndY = topY + 8 * zoom;

    ctx.strokeStyle = "#8b7355";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(chain2StartX, chain2StartY);
    ctx.quadraticCurveTo(
      (chain2StartX + chain2EndX) / 2,
      (chain2StartY + chain2EndY) / 2 + 8 * zoom,
      chain2EndX,
      chain2EndY,
    );
    ctx.stroke();

    // Chain links
    ctx.fillStyle = "#cd853f";
    for (let i = 0; i < chain2Links; i++) {
      const t = i / chain2Links;
      const linkX = chain2StartX + (chain2EndX - chain2StartX) * t;
      const linkY =
        chain2StartY +
        (chain2EndY - chain2StartY) * t +
        Math.sin(t * Math.PI) * 8 * zoom;
      const chainAnim = (time * 2.5 + i * 0.4) % 1;
      ctx.fillStyle = `rgba(205, 133, 63, ${0.6 + Math.sin(chainAnim * Math.PI * 2) * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(linkX, linkY, 2 * zoom, 1.2 * zoom, t * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Secondary ammo drum (smaller)
    ctx.fillStyle = _s.s2;
    ctx.beginPath();
    ctx.ellipse(
      chain2StartX,
      chain2StartY,
      6 * zoom,
      9 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Hydraulic pistons
    ctx.fillStyle = _s.s5;
    ctx.strokeStyle = _s.s3;
    ctx.lineWidth = 2 * zoom;

    // Left piston
    const pistonExtend = Math.sin(time * 3) * 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - w * 0.85, y + 5 * zoom);
    ctx.lineTo(x - w * 0.75, topY + 18 * zoom + pistonExtend);
    ctx.stroke();
    ctx.fillStyle = _s.s7;
    ctx.beginPath();
    ctx.arc(
      x - w * 0.75,
      topY + 18 * zoom + pistonExtend,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Right piston
    ctx.strokeStyle = _s.s3;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.85, y + 5 * zoom);
    ctx.lineTo(x + w * 0.75, topY + 18 * zoom - pistonExtend);
    ctx.stroke();
    ctx.fillStyle = _s.s7;
    ctx.beginPath();
    ctx.arc(
      x + w * 0.75,
      topY + 18 * zoom - pistonExtend,
      3 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Power cables
    ctx.strokeStyle = _tAcc;
    ctx.lineWidth = 1.5 * zoom;
    for (let cable = 0; cable < 3; cable++) {
      const cableY = y - height * zoom * (0.2 + cable * 0.15);
      const sag = Math.sin(time * 2 + cable) * 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - w * 1.1, cableY);
      ctx.quadraticCurveTo(
        x - w * 0.9,
        cableY + sag,
        x - w * 0.7,
        cableY - 1 * zoom,
      );
      ctx.stroke();
    }

    // 3D Targeting sensor array housing
    {
      const sensorX = x + w * 0.5;
      const sensorY = topY + 25 * zoom;
      const sensorW = 8 * zoom;
      const sensorH = 12 * zoom;
      const sIsoSlope = 0.5;

      // Housing back shadow
      ctx.fillStyle = _s.s0;
      ctx.beginPath();
      ctx.moveTo(sensorX + 0.5 * zoom, sensorY + 0.5 * zoom);
      ctx.lineTo(
        sensorX + sensorW + 0.5 * zoom,
        sensorY - sensorW * sIsoSlope + 0.5 * zoom,
      );
      ctx.lineTo(
        sensorX + sensorW + 0.5 * zoom,
        sensorY - sensorW * sIsoSlope + sensorH + 0.5 * zoom,
      );
      ctx.lineTo(sensorX + 0.5 * zoom, sensorY + sensorH + 0.5 * zoom);
      ctx.closePath();
      ctx.fill();

      // Housing front face (isometric parallelogram)
      ctx.fillStyle = _s.s1;
      ctx.beginPath();
      ctx.moveTo(sensorX, sensorY);
      ctx.lineTo(sensorX + sensorW, sensorY - sensorW * sIsoSlope);
      ctx.lineTo(sensorX + sensorW, sensorY - sensorW * sIsoSlope + sensorH);
      ctx.lineTo(sensorX, sensorY + sensorH);
      ctx.closePath();
      ctx.fill();

      // Housing edge highlight
      ctx.strokeStyle = _s.s3;
      ctx.lineWidth = 1 * zoom;
      ctx.stroke();

      // Antenna stub on top
      ctx.strokeStyle = _s.s4;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(sensorX + sensorW * 0.5, sensorY - sensorW * sIsoSlope * 0.5);
      ctx.lineTo(
        sensorX + sensorW * 0.5,
        sensorY - sensorW * sIsoSlope * 0.5 - 5 * zoom,
      );
      ctx.stroke();
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        sensorX + sensorW * 0.5,
        sensorY - sensorW * sIsoSlope * 0.5 - 5 * zoom,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Sensor lens (recessed with glow)
      const sensorGlow = 0.5 + Math.sin(time * 5) * 0.3;
      const lensCx = sensorX + sensorW * 0.45;
      const lensCy = sensorY + sensorH * 0.45 - sensorW * sIsoSlope * 0.45;

      // Lens recess
      ctx.fillStyle = "#0a0a12";
      ctx.beginPath();
      ctx.arc(lensCx, lensCy, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Lens glow
      const lensGrad = ctx.createRadialGradient(
        lensCx - 0.5 * zoom,
        lensCy - 0.5 * zoom,
        0,
        lensCx,
        lensCy,
        3 * zoom,
      );
      lensGrad.addColorStop(0, `rgba(255, 80, 80, ${sensorGlow})`);
      lensGrad.addColorStop(0.5, `rgba(255, 0, 0, ${sensorGlow * 0.7})`);
      lensGrad.addColorStop(1, `rgba(180, 0, 0, ${sensorGlow * 0.3})`);
      ctx.fillStyle = lensGrad;
      ctx.beginPath();
      ctx.arc(lensCx, lensCy, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Lens ring
      ctx.strokeStyle = _s.s3;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.arc(lensCx, lensCy, 3.2 * zoom, 0, Math.PI * 2);
      ctx.stroke();

      // Specular highlight
      ctx.fillStyle = `rgba(255, 200, 200, ${sensorGlow * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        lensCx - 0.8 * zoom,
        lensCy - 0.8 * zoom,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Scanning sweep line
      const sweepAngle = time * 3;
      ctx.strokeStyle = `rgba(255, 0, 0, ${sensorGlow * 0.4})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(lensCx, lensCy);
      ctx.lineTo(
        lensCx + Math.cos(sweepAngle) * 2.5 * zoom,
        lensCy + Math.sin(sweepAngle) * 2.5 * zoom,
      );
      ctx.stroke();
    }

    // 3D Louvered exhaust vents (isometric)
    for (let vent = 0; vent < 2; vent++) {
      const evX = x + w * (vent === 0 ? -0.95 : 0.95);
      const evY = topY + 30 * zoom;
      const evW = 8 * zoom;
      const evH = 10 * zoom;
      const evIsoX = vent === 0 ? -1 : 1;

      // Vent recess
      ctx.fillStyle = _s.s0;
      ctx.beginPath();
      ctx.moveTo(evX - evW * 0.5, evY - evH * 0.5);
      ctx.lineTo(evX + evW * 0.5, evY - evH * 0.5 - evW * 0.25 * evIsoX);
      ctx.lineTo(evX + evW * 0.5, evY + evH * 0.5 - evW * 0.25 * evIsoX);
      ctx.lineTo(evX - evW * 0.5, evY + evH * 0.5);
      ctx.closePath();
      ctx.fill();

      // Louvered slats
      const numSlats = 4;
      for (let sl = 0; sl < numSlats; sl++) {
        const sT = (sl + 0.5) / numSlats;
        const sYL = evY - evH * 0.5 + sT * evH;
        const sYR = sYL - evW * 0.25 * evIsoX;
        ctx.fillStyle = _s.s2;
        ctx.beginPath();
        ctx.moveTo(evX - evW * 0.5 + 0.5 * zoom, sYL - 1 * zoom);
        ctx.lineTo(evX + evW * 0.5 - 0.5 * zoom, sYR - 1 * zoom);
        ctx.lineTo(evX + evW * 0.5 - 0.5 * zoom, sYR);
        ctx.lineTo(evX - evW * 0.5 + 0.5 * zoom, sYL);
        ctx.closePath();
        ctx.fill();
      }

      // Inner glow
      const evGlow = 0.4 + Math.sin(time * 4 + vent) * 0.3;
      ctx.fillStyle = `rgba(${_tRgba}, ${evGlow})`;
      ctx.beginPath();
      ctx.moveTo(evX - evW * 0.4, evY - evH * 0.35);
      ctx.lineTo(evX + evW * 0.4, evY - evH * 0.35 - evW * 0.2 * evIsoX);
      ctx.lineTo(evX + evW * 0.4, evY + evH * 0.35 - evW * 0.2 * evIsoX);
      ctx.lineTo(evX - evW * 0.4, evY + evH * 0.35);
      ctx.closePath();
      ctx.fill();

      // Iron frame
      ctx.strokeStyle = _s.s4;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(evX - evW * 0.5, evY - evH * 0.5);
      ctx.lineTo(evX + evW * 0.5, evY - evH * 0.5 - evW * 0.25 * evIsoX);
      ctx.lineTo(evX + evW * 0.5, evY + evH * 0.5 - evW * 0.25 * evIsoX);
      ctx.lineTo(evX - evW * 0.5, evY + evH * 0.5);
      ctx.closePath();
      ctx.stroke();

      // Heat shimmer wisps
      const heatAlpha = 0.15 + Math.sin(time * 3 + vent * 2) * 0.1;
      ctx.fillStyle = `rgba(200, 180, 160, ${heatAlpha})`;
      for (let p = 0; p < 2; p++) {
        const pT = ((time * 1.2 + p * 1.5 + vent) % 2.5) / 2.5;
        const pY = evY - evH * 0.6 - pT * 6 * zoom;
        const pAlpha = Math.max(0, heatAlpha * (1 - pT));
        ctx.fillStyle = `rgba(200, 180, 160, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(
          evX + Math.sin(time * 2 + p) * 2 * zoom,
          pY,
          (1.2 + pT * 0.6) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Heavy bolts/anchors
    ctx.fillStyle = _s.s4;
    const heavyBoltPositions = [
      { x: x - w * 0.95, y: y + 6 * zoom },
      { x: x + w * 0.95, y: y + 6 * zoom },
      { x: x - w * 0.95, y: topY + 35 * zoom },
      { x: x + w * 0.95, y: topY + 35 * zoom },
    ];
    for (const bolt of heavyBoltPositions) {
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Bolt highlight
      ctx.fillStyle = _s.s6;
      ctx.beginPath();
      ctx.arc(bolt.x - 1 * zoom, bolt.y - 1 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = _s.s4;
    }
  }

  // Corner reinforcement bolts
  ctx.fillStyle = _s.s4;
  const boltSize = 2.5 * zoom;
  // Front corners
  ctx.beginPath();
  ctx.arc(x - w * 0.9, y + d * 0.3 - 4 * zoom, boltSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w * 0.9, y + d * 0.3 - 4 * zoom, boltSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x - w * 0.9,
    y - height * zoom + d + 8 * zoom,
    boltSize,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x + w * 0.9,
    y - height * zoom + d + 8 * zoom,
    boltSize,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}
// Helper function to calculate pitch based on tower elevation and typical range
export function calculateBarrelPitch(
  towerElevation: number,
  barrelLength: number,
): number {
  // Towers are elevated, enemies are on ground - barrel should pitch down
  // Use a reasonable pitch based on geometry (typically 15-25 degrees)
  const typicalRange = barrelLength * 2.5;
  return Math.atan2(towerElevation, typicalRange);
}

export function renderStandardCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;
  const level = tower.level;

  // Recoil animation
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;
  let reloadPhase = 0;

  if (timeSinceFire < 400) {
    const firePhase = timeSinceFire / 400;
    if (firePhase < 0.1) {
      recoilOffset = (firePhase / 0.1) * 8 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 20) * 2 * zoom;
    } else if (firePhase < 0.4) {
      const returnPhase = (firePhase - 0.1) / 0.3;
      recoilOffset =
        8 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 2);
      turretShake =
        Math.sin(returnPhase * Math.PI * 6) * (1 - returnPhase) * 1.5 * zoom;
    } else {
      reloadPhase = (firePhase - 0.4) / 0.6;
    }
  }

  // Calculate isometric foreshortening based on rotation
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Larger barrel dimensions
  const baseBarrelLength = (38 + level * 12) * zoom;
  const barrelLength =
    baseBarrelLength * (0.4 + foreshorten * 0.6) - recoilOffset;
  const barrelWidth = (12 + level * 3) * zoom;

  // Determine if barrel is pointing "away" for draw order
  const facingAway = sinR < -0.3;

  // Apply turret shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Enhanced turret base platform with ring details
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Rotating platform ring with visible teeth/notches
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Rotating gear teeth around base (shows rotation)
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 12; i++) {
    const toothAngle = rotation + (i / 12) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 17 * zoom;
    const toothY = turretY - 4 * zoom + Math.sin(toothAngle) * 8.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Turret base
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 5 * zoom,
    17 * zoom,
    8.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // If facing away, draw barrel BEFORE turret housing
  if (facingAway) {
    drawCannonBarrel(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  // Enhanced turret housing - layered dome design
  const housingGrad = ctx.createRadialGradient(
    turretX - 4 * zoom,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    18 * zoom,
  );
  housingGrad.addColorStop(0, "#7a7a82");
  housingGrad.addColorStop(0.4, "#5a5a62");
  housingGrad.addColorStop(1, "#4a4a52");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 12 * zoom,
    16 * zoom,
    8 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ROTATING ARMOR SHIELD PLATES - 4 main shields that rotate with turret aim
  const shieldCount = 4;
  for (let i = 0; i < shieldCount; i++) {
    const baseAngle = (i / shieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);

    // Shields on the front are pushed forward
    const forwardShift = Math.cos(baseAngle) * 3 * zoom;

    // Shield visibility (back shields are darker)
    const visibility = 0.5 + shieldDepth * 0.35;

    // Only draw visible shields
    if (shieldDepth > -0.7) {
      const shieldWidth = 8 * zoom;
      const shieldPerpX = -Math.sin(shieldAngle);
      const shieldPerpY = Math.cos(shieldAngle) * 0.5;

      // Shield center position
      const shieldCenterX =
        turretX + Math.cos(shieldAngle) * (11 + forwardShift * 0.3) * zoom;
      const shieldCenterY =
        turretY -
        12 * zoom +
        Math.sin(shieldAngle) * (5.5 + forwardShift * 0.15) * zoom;

      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        shieldCenterX - shieldPerpX * shieldWidth * 0.5,
        shieldCenterY - shieldPerpY * shieldWidth * 0.5,
        shieldCenterX + shieldPerpX * shieldWidth * 0.5,
        shieldCenterY + shieldPerpY * shieldWidth * 0.5,
      );

      if (shieldSide < 0) {
        // Top/light side
        shieldGrad.addColorStop(0, `rgba(120, 120, 130, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(60, 60, 70, ${visibility})`);
      } else {
        // Bottom/dark side
        shieldGrad.addColorStop(0, `rgba(70, 70, 80, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(80, 80, 90, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(60, 60, 70, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();

      // Draw angular shield shape
      const innerR = 6 * zoom;
      const outerR = 14 * zoom;
      const angleSpan = Math.PI / 2.5;

      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY -
          12 * zoom +
          Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.5 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.closePath();
      ctx.fill();

      // Shield edge highlight
      ctx.strokeStyle = `rgba(150, 150, 160, ${visibility * 0.7})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Armor bolt/rivet detail
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 3 * zoom);
      const rivetY =
        turretY -
        12 * zoom +
        Math.sin(shieldAngle) * (outerR - 3 * zoom) * 0.5 -
        2 * zoom;
      ctx.fillStyle = `rgba(60, 60, 70, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring (between shields and core)
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 12 * zoom,
    10 * zoom,
    5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Central pivot mechanism
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pivot ring detail
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Barrel mounting collar that rotates with aim
  const collarX = turretX + cosR * 4 * zoom;
  const collarY = turretY - 12 * zoom + sinR * 2 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 5 * zoom, 3 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Glowing core with pulsing animation - smaller, more subtle
  const coreGlow = 0.5 + Math.sin(time * 5) * 0.25 + reloadPhase * 0.25;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 12 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    4 * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 180, 80, ${coreGlow})`);
  coreGrad.addColorStop(0.4, `rgba(255, 120, 30, ${coreGlow * 0.7})`);
  coreGrad.addColorStop(0.8, `rgba(255, 80, 0, ${coreGlow * 0.4})`);
  coreGrad.addColorStop(1, `rgba(255, 50, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 12 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 220, 180, ${coreGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(
    turretX - 0.5 * zoom,
    turretY - 12.5 * zoom,
    1.5 * zoom,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === AMMO BOX (LEFT) AND ARMOR SHIELD (RIGHT) ===
  const isAttacking = timeSinceFire < 100;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 100 : 0;

  const boxAngle = rotation + Math.PI * 0.55;
  const boxDist = 18 * zoom;
  const boxCenterX = turretX + Math.cos(boxAngle) * boxDist;
  const boxCenterY = turretY - 8 * zoom + Math.sin(boxAngle) * boxDist * 0.5;

  const shieldAngle = rotation - Math.PI * 0.55;
  const shieldDist = 18 * zoom;
  const shieldCenterX = turretX + Math.cos(shieldAngle) * shieldDist;
  const shieldCenterY =
    turretY - 8 * zoom + Math.sin(shieldAngle) * shieldDist * 0.5;

  const boxSide = Math.sin(boxAngle);
  const shieldSide = Math.sin(shieldAngle);
  const boxBehind = boxSide < 0;
  const shieldBehind = shieldSide < 0;
  const towerId = tower.id;

  // Draw behind-camera accessories first (furthest from viewer)
  if (boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
  }
  if (shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "small",
    );
  }

  // Hex mantlet, breech, barrel, mantlets — mantlet behind breech when facing away
  if (facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      zoom,
      1.0,
      recoilOffset,
    );
  }
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1.0,
    recoilOffset,
  );
  drawBreechFeedAnimation(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1.0,
    time,
    tower.lastAttack,
    400,
    1.0,
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1.0,
    "behind",
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      zoom,
      1.0,
      recoilOffset,
    );
  }

  if (!facingAway) {
    drawCannonBarrel(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  drawMantlets(ctx, turretX, turretY - 12 * zoom, rotation, zoom, 1.0, "front");

  // Draw in-front-of-camera accessories
  if (!boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
  }
  if (!shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "small",
    );
  }

  // Ammo belt always on top (arcs above breech/barrel)
  drawCannonAmmoBelt(
    ctx,
    boxCenterX,
    boxCenterY,
    turretX,
    turretY - 10 * zoom,
    rotation,
    zoom,
    time,
    isAttacking,
    attackPulse,
    boxSide,
    recoilOffset,
  );

  // Calculate pitch for muzzle flash positioning
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchDrop = barrelLength * Math.sin(pitch) * 0.5;

  // Muzzle flash effect — concussive single-shot cannon blast
  if (timeSinceFire < 180) {
    const flashPhase = timeSinceFire / 180;
    const turretRadius = 8 * zoom;
    const totalLength =
      turretRadius + barrelLength * Math.cos(pitch) + 5 * zoom;
    const flashX = turretX + cosR * totalLength;
    const flashY = turretY - 12 * zoom + sinR * totalLength * 0.5 + pitchDrop;
    const flashAlpha = 1 - flashPhase;

    // Concussive shockwave ring
    if (flashPhase > 0.05) {
      const ringPhase = (flashPhase - 0.05) / 0.95;
      const ringR = (12 + ringPhase * 22) * zoom;
      ctx.strokeStyle = `rgba(255, 180, 80, ${(1 - ringPhase) * 0.5})`;
      ctx.lineWidth = (3 - ringPhase * 2.5) * zoom;
      ctx.beginPath();
      ctx.arc(flashX, flashY, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Outer fire bloom
    const bloomR = (18 - flashPhase * 12) * zoom;
    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 25 * zoom * flashAlpha;
    const bloomGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      bloomR,
    );
    bloomGrad.addColorStop(0, `rgba(255, 255, 200, ${flashAlpha})`);
    bloomGrad.addColorStop(0.25, `rgba(255, 200, 80, ${flashAlpha * 0.9})`);
    bloomGrad.addColorStop(0.55, `rgba(255, 130, 30, ${flashAlpha * 0.5})`);
    bloomGrad.addColorStop(1, `rgba(200, 60, 0, 0)`);
    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, bloomR, 0, Math.PI * 2);
    ctx.fill();

    // White-hot core
    const coreR = (6 - flashPhase * 5) * zoom;
    ctx.fillStyle = `rgba(255, 255, 240, ${flashAlpha * 0.95})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Directional smoke puff (extends forward from barrel)
    if (flashPhase > 0.1) {
      const smokePhase = (flashPhase - 0.1) / 0.9;
      const smokeDist = (8 + smokePhase * 18) * zoom;
      const smokeX = flashX + cosR * smokeDist;
      const smokeY = flashY + sinR * smokeDist * 0.5 - smokePhase * 6 * zoom;
      const smokeR = (5 + smokePhase * 8) * zoom;
      ctx.fillStyle = `rgba(80, 75, 70, ${(1 - smokePhase) * 0.35})`;
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sparks (2-3 bright particles ejected from muzzle)
    if (flashPhase < 0.6) {
      const sparkAlpha = (1 - flashPhase / 0.6) * 0.8;
      for (let i = 0; i < 3; i++) {
        const sparkAngle = rotation + (i - 1) * 0.4;
        const sparkDist = (5 + flashPhase * 35 * (0.8 + i * 0.2)) * zoom;
        const sparkX = flashX + Math.cos(sparkAngle) * sparkDist;
        const sparkY =
          flashY +
          Math.sin(sparkAngle) * sparkDist * 0.5 -
          flashPhase * (4 + i * 3) * zoom;
        ctx.fillStyle = `rgba(255, 230, 120, ${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, (1.5 - flashPhase) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }
}

// Helper function to draw cannon barrel — hexagonal prism body + cylinder muzzle
export function drawCannonBarrel(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  barrelLength: number,
  barrelWidth: number,
  _foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const level = tower.level;

  // Isometric basis vectors
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;

  // Pitch
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchRate = Math.sin(pitch) * 0.5;
  const axisPoint = (dist: number) => ({
    x: pivotX + fwdX * dist,
    y: pivotY + fwdY * dist + dist * pitchRate,
  });

  // Recoil
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  if (timeSinceFire < 150) {
    const recoilPhase = timeSinceFire / 150;
    if (recoilPhase < 0.2) {
      recoilOffset = (recoilPhase / 0.2) * 8 * zoom;
    } else {
      recoilOffset = 8 * zoom * (1 - (recoilPhase - 0.2) / 0.8);
    }
  }

  const turretRadius = 8 * zoom;
  const startDist = turretRadius - recoilOffset;
  const endDist = barrelLength - recoilOffset;
  const hexLen = (endDist - startDist) * 0.78;
  const muzzleLen = (endDist - startDist) * 0.22;

  const isoOff = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat - vert,
  });

  // Barrel dimensions
  const hexR = barrelWidth * 0.3;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  const hexVerts = generateIsoHexVertices(isoOff, hexR, hexSides);
  const taperScale = 0.88;
  const taperVerts = scaleVerts(hexVerts, taperScale);

  // Key axis points
  const hexBackPt = axisPoint(startDist);
  const hexFrontPt = axisPoint(startDist + hexLen);
  const muzzleBackPt = hexFrontPt;
  const muzzleEndPt = axisPoint(startDist + hexLen + muzzleLen + 1 * zoom);

  const sideNormals = computeHexSideNormals(cosR, hexSides);

  const muzzleScale = 1.1;
  const muzzleVerts = scaleVerts(taperVerts, muzzleScale);
  const muzzleTipVerts = scaleVerts(taperVerts, muzzleScale * 1.08);

  // === BREECH HEX CAP ===
  {
    const capPt = facingFwd ? hexBackPt : hexFrontPt;
    const capVerts = facingFwd ? hexVerts : taperVerts;
    drawHexCap(
      ctx,
      capPt,
      capVerts,
      facingFwd ? "#6c6c78" : "#5c5c6a",
      "#4a4a58",
      0.6 * zoom,
    );
  }

  // === HEXAGONAL BARREL BODY — draw ALL 6 side quads, depth-sorted ===
  const sortedSides = sortSidesByDepth(sideNormals);

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];

    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];
    const tv0 = taperVerts[i];
    const tv1 = taperVerts[ni];

    // All faces rendered — lighter colors to blend with turret
    const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);
    const rc = Math.floor(55 + lit * 68);
    const gc = Math.floor(55 + lit * 66);
    const bc = Math.floor(60 + lit * 70);

    const sGrad = ctx.createLinearGradient(
      hexBackPt.x + v0.x,
      hexBackPt.y + v0.y,
      hexFrontPt.x + tv0.x,
      hexFrontPt.y + tv0.y,
    );
    sGrad.addColorStop(0, `rgb(${rc + 4}, ${gc + 4}, ${bc + 6})`);
    sGrad.addColorStop(0.5, `rgb(${rc}, ${gc}, ${bc})`);
    sGrad.addColorStop(1, `rgb(${rc - 6}, ${gc - 6}, ${bc - 3})`);
    ctx.fillStyle = sGrad;

    ctx.beginPath();
    ctx.moveTo(hexBackPt.x + v0.x, hexBackPt.y + v0.y);
    ctx.lineTo(hexBackPt.x + v1.x, hexBackPt.y + v1.y);
    ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
    ctx.lineTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
    ctx.closePath();
    ctx.fill();

    // Edge lines
    ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    // Highlight on well-lit edges
    if (normal > 0.25) {
      ctx.strokeStyle = `rgba(160, 160, 178, ${(normal - 0.25) * 0.4})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
      ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
      ctx.stroke();
    }

    // Orange energy conduit on visible faces
    if (normal > -0.3) {
      const conduitGlow = 0.5 + Math.sin(time * 6) * 0.3;
      const midV0x = (v0.x + v1.x) * 0.5;
      const midV0y = (v0.y + v1.y) * 0.5;
      const midTV0x = (tv0.x + tv1.x) * 0.5;
      const midTV0y = (tv0.y + tv1.y) * 0.5;
      ctx.strokeStyle = `rgba(255, 102, 0, ${conduitGlow * Math.max(0.15, 0.3 + normal * 0.5)})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexBackPt.x + midV0x, hexBackPt.y + midV0y);
      ctx.lineTo(hexFrontPt.x + midTV0x, hexFrontPt.y + midTV0y);
      ctx.stroke();
    }
  }

  // === GRAY HEX RING BANDS along barrel (3D — only visible faces) ===
  const bandCount = 2 + (level >= 3 ? 1 : 0);
  const bandThick = 2.5 * zoom;
  for (let b = 0; b < bandCount; b++) {
    const t = (b + 1) / (bandCount + 1);
    const bandFrontPt = axisPoint(startDist + hexLen * t + bandThick * 0.5);
    const bandBackPt = axisPoint(startDist + hexLen * t - bandThick * 0.5);
    const bScale = 1 + (taperScale - 1) * t;
    const bVerts = hexVerts.map((v) => ({
      x: v.x * bScale * 1.06,
      y: v.y * bScale * 1.06,
    }));

    const bandSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, bb) => sideNormals[a] - sideNormals[bb],
    );

    for (const i of bandSorted) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const v0 = bVerts[i];
      const v1 = bVerts[ni];

      const lit = Math.max(0.2, 0.3 + Math.max(0, normal) * 0.5);
      const gc = Math.floor(100 + lit * 50);

      ctx.fillStyle = `rgb(${gc}, ${gc}, ${gc + 6})`;
      ctx.beginPath();
      ctx.moveTo(bandBackPt.x + v0.x, bandBackPt.y + v0.y);
      ctx.lineTo(bandBackPt.x + v1.x, bandBackPt.y + v1.y);
      ctx.lineTo(bandFrontPt.x + v1.x, bandFrontPt.y + v1.y);
      ctx.lineTo(bandFrontPt.x + v0.x, bandFrontPt.y + v0.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, normal) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Orange accent line down center of each visible band face
      if (normal > -0.05) {
        const midV0x = (v0.x + v1.x) * 0.5;
        const midV0y = (v0.y + v1.y) * 0.5;
        ctx.strokeStyle = `rgba(255, 130, 30, ${0.4 + Math.max(0, normal) * 0.35})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(bandBackPt.x + midV0x, bandBackPt.y + midV0y);
        ctx.lineTo(bandFrontPt.x + midV0x, bandFrontPt.y + midV0y);
        ctx.stroke();
      }
    }

    // Front/back hex cap of the band ring (visible face only)
    const capPt = facingFwd ? bandFrontPt : bandBackPt;
    ctx.strokeStyle = `rgba(140, 140, 155, 0.4)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (
        sideNormals[i] < -0.15 &&
        sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
      )
        continue;
      ctx.moveTo(capPt.x + bVerts[i].x, capPt.y + bVerts[i].y);
      ctx.lineTo(capPt.x + bVerts[ni].x, capPt.y + bVerts[ni].y);
    }
    ctx.stroke();
  }

  // === BARREL-MUZZLE JUNCTION CAP ===
  drawHexCap(
    ctx,
    facingFwd ? hexFrontPt : hexBackPt,
    facingFwd ? taperVerts : hexVerts,
    facingFwd ? "#60606e" : "#6c6c78",
    "#4e4e5c",
    0.5 * zoom,
  );

  // === MUZZLE BACK CAP ===
  drawHexCap(
    ctx,
    facingFwd ? muzzleBackPt : muzzleEndPt,
    facingFwd ? muzzleVerts : muzzleTipVerts,
    facingFwd ? "#565664" : "#4c4c5a",
  );

  // === MUZZLE — hex prism section (wider, matching barrel projection) ===
  const muzzleSideNormals: number[] = sideNormals;
  const muzzleSorted = sortSidesByDepth(muzzleSideNormals);

  for (const i of muzzleSorted) {
    const ni = (i + 1) % hexSides;
    const normal = muzzleSideNormals[i];

    const mv0 = muzzleVerts[i];
    const mv1 = muzzleVerts[ni];
    const mtv0 = muzzleTipVerts[i];
    const mtv1 = muzzleTipVerts[ni];

    const lit = Math.max(0.1, 0.18 + Math.max(0, normal) * 0.5);
    const mc = Math.floor(48 + lit * 58);
    ctx.fillStyle = `rgb(${mc}, ${mc}, ${mc + 5})`;

    ctx.beginPath();
    ctx.moveTo(muzzleBackPt.x + mv0.x, muzzleBackPt.y + mv0.y);
    ctx.lineTo(muzzleBackPt.x + mv1.x, muzzleBackPt.y + mv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv1.x, muzzleEndPt.y + mtv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv0.x, muzzleEndPt.y + mtv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(20, 20, 30, ${0.25 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === LEVEL 3 EXTRAS: fins + muzzle orange rings ===
  if (level >= 3) {
    // Stabilizer fins
    const finDist = startDist + hexLen * 0.9;
    const finPt = axisPoint(finDist);
    const finEndPt2 = axisPoint(finDist + 6 * zoom);
    const finH = hexR * 1.8;
    const finW = 2.5 * zoom;

    for (let f = 0; f < 4; f++) {
      const fa = (f / 4) * Math.PI * 2 + Math.PI / 4;
      const fnormal = Math.cos(fa) * cosR + 0.5 * Math.sin(fa);
      if (fnormal < -0.3) continue;

      const fOuter = isoOff(Math.cos(fa) * finH, Math.sin(fa) * finH);
      const fInner = isoOff(
        Math.cos(fa) * hexR * 0.5,
        Math.sin(fa) * hexR * 0.5,
      );

      const fLit = 0.3 + Math.max(0, fnormal) * 0.5;
      const fc = Math.floor(48 + fLit * 55);

      ctx.fillStyle = `rgb(${fc}, ${fc}, ${fc + 6})`;
      ctx.beginPath();
      ctx.moveTo(
        finPt.x + fInner.x - fwdX * finW,
        finPt.y + fInner.y - fwdY * finW,
      );
      ctx.lineTo(finPt.x + fOuter.x, finPt.y + fOuter.y);
      ctx.lineTo(finEndPt2.x + fOuter.x * 0.8, finEndPt2.y + fOuter.y * 0.8);
      ctx.lineTo(
        finEndPt2.x + fInner.x + fwdX * finW,
        finEndPt2.y + fInner.y + fwdY * finW,
      );
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(30, 30, 40, ${0.3 + fnormal * 0.3})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      const finMidOuter = { x: fOuter.x * 0.85, y: fOuter.y * 0.85 };
      ctx.strokeStyle = `rgba(255, 120, 20, 0.7)`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(finPt.x + finMidOuter.x, finPt.y + finMidOuter.y);
      ctx.lineTo(
        finEndPt2.x + finMidOuter.x * 0.8,
        finEndPt2.y + finMidOuter.y * 0.8,
      );
      ctx.stroke();
    }

    // Orange hex rings on muzzle
    for (let r = 0; r < 2; r++) {
      const mt = 0.3 + r * 0.4;
      const ringPt = axisPoint(startDist + hexLen + muzzleLen * mt);
      const ringScale = 1 + (1.08 - 1) * mt;
      const rVerts = muzzleVerts.map((v) => ({
        x: v.x * ringScale,
        y: v.y * ringScale,
      }));
      ctx.strokeStyle = "rgba(255, 120, 20, 0.75)";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(ringPt.x + rVerts[0].x, ringPt.y + rVerts[0].y);
      for (let vi = 1; vi < hexSides; vi++)
        ctx.lineTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // === MUZZLE FRONT HEX CAP ===
  const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
  const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;

  drawHexCap(
    ctx,
    mCapPt,
    mCapVerts,
    facingFwd ? "#5c5c6a" : "#4c4c5a",
    "#6a6a7a",
    0.8 * zoom,
  );

  if (facingFwd) {
    drawHexCap(ctx, mCapPt, scaleVerts(mCapVerts, 0.5), "#0a0a0e");
    // Rifling ring
    ctx.strokeStyle = "#1a1a24";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    const riflingVerts = scaleVerts(mCapVerts, 0.32);
    ctx.moveTo(mCapPt.x + riflingVerts[0].x, mCapPt.y + riflingVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(mCapPt.x + riflingVerts[i].x, mCapPt.y + riflingVerts[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  // === MUZZLE FLASH — standard cannon barrel blast ===
  if (timeSinceFire < 180) {
    const flash = 1 - timeSinceFire / 180;
    const flashPt = axisPoint(endDist + 10 * zoom);
    const fX = flashPt.x;
    const fY = flashPt.y;

    ctx.shadowColor = "#ff6600";
    ctx.shadowBlur = 20 * zoom * flash;

    // Directional flame plume (elongated along barrel axis)
    const plumeLen = 20 * zoom * flash;
    const plumeTipX = fX + fwdX * plumeLen;
    const plumeTipY = fY + fwdY * plumeLen;
    const plumeGrad = ctx.createLinearGradient(fX, fY, plumeTipX, plumeTipY);
    plumeGrad.addColorStop(0, `rgba(255, 255, 200, ${flash * 0.9})`);
    plumeGrad.addColorStop(0.3, `rgba(255, 180, 60, ${flash * 0.7})`);
    plumeGrad.addColorStop(0.7, `rgba(255, 100, 10, ${flash * 0.3})`);
    plumeGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    const plumeW = 10 * zoom * flash;
    ctx.moveTo(fX + perpX * plumeW, fY + perpY * plumeW);
    ctx.quadraticCurveTo(
      plumeTipX,
      plumeTipY,
      fX - perpX * plumeW,
      fY - perpY * plumeW,
    );
    ctx.closePath();
    ctx.fill();

    // Main radial blast
    const blastR = 22 * zoom * flash;
    const blastGrad = ctx.createRadialGradient(fX, fY, 0, fX, fY, blastR);
    blastGrad.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
    blastGrad.addColorStop(0.2, `rgba(255, 210, 100, ${flash * 0.85})`);
    blastGrad.addColorStop(0.5, `rgba(255, 140, 20, ${flash * 0.5})`);
    blastGrad.addColorStop(1, `rgba(255, 60, 0, 0)`);
    ctx.fillStyle = blastGrad;
    ctx.beginPath();
    ctx.arc(fX, fY, blastR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = `rgba(255, 255, 245, ${flash * 0.9})`;
    ctx.beginPath();
    ctx.arc(fX, fY, 5 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

export function drawHexMantlet(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  recoilOffset: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const upX = 0;
  const upY = -1;

  const rX = -cosR * recoilOffset * 0.3;
  const rY = -sinR * recoilOffset * 0.15;

  const mantletDist = 6 * zoom * scale;
  const cx = pivotX + fwdX * mantletDist + rX;
  const cy = pivotY + fwdY * mantletDist + rY;

  const hexSides = 6;
  const hexR = 10 * zoom * scale;
  const plateThick = 2.5 * zoom * scale;
  const facingFwd = fwdY >= 0;

  const mantletIsoOff: IsoOffFn = (dx, dy) => ({
    x: perpX * dx + upX * dy,
    y: perpY * dx + upY * dy,
  });
  const hexVerts = generateIsoHexVertices(mantletIsoOff, hexR, hexSides);

  const frontOff = facingFwd ? plateThick : 0;
  const backOff = facingFwd ? 0 : plateThick;

  const frontPt = { x: cx + fwdX * frontOff, y: cy + fwdY * frontOff };
  const backPt = { x: cx + fwdX * backOff, y: cy + fwdY * backOff };

  const sideNormals = computeHexSideNormals(cosR, hexSides);

  // Back hex face
  drawHexCap(ctx, backPt, hexVerts, facingFwd ? "#4a4a58" : "#5a5a68");

  // Side faces (depth-sorted)
  const sortedSides = sortSidesByDepth(sideNormals);

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];
    if (normal < -0.15) continue;
    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];

    const lit = Math.max(0.15, 0.25 + Math.max(0, normal) * 0.55);
    const rc = Math.floor(50 + lit * 65);
    const gc = Math.floor(50 + lit * 62);
    const bc = Math.floor(55 + lit * 68);

    ctx.fillStyle = `rgb(${rc}, ${gc}, ${bc})`;
    ctx.beginPath();
    ctx.moveTo(backPt.x + v0.x, backPt.y + v0.y);
    ctx.lineTo(backPt.x + v1.x, backPt.y + v1.y);
    ctx.lineTo(frontPt.x + v1.x, frontPt.y + v1.y);
    ctx.lineTo(frontPt.x + v0.x, frontPt.y + v0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(25, 25, 35, ${0.25 + Math.max(0, normal) * 0.15})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    if (normal > 0.2) {
      ctx.strokeStyle = `rgba(150, 150, 168, ${(normal - 0.2) * 0.35})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(frontPt.x + v0.x, frontPt.y + v0.y);
      ctx.lineTo(frontPt.x + v1.x, frontPt.y + v1.y);
      ctx.stroke();
    }
  }

  // Front hex face
  drawHexCap(
    ctx,
    frontPt,
    hexVerts,
    facingFwd ? "#5e5e6c" : "#4e4e5c",
    "#6a6a78",
    0.8 * zoom,
  );

  // Barrel bore hole in center
  drawHexCap(ctx, frontPt, scaleVerts(hexVerts, 0.35), "#1a1a22");

  // Vertex bolts on front face
  ctx.fillStyle = "#7a7a8a";
  for (let i = 0; i < hexSides; i++) {
    ctx.beginPath();
    ctx.arc(
      frontPt.x + hexVerts[i].x * 0.78,
      frontPt.y + hexVerts[i].y * 0.78,
      1.2 * zoom * scale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Orange accent ring
  ctx.strokeStyle = "rgba(255, 130, 30, 0.55)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(frontPt.x + hexVerts[0].x * 0.6, frontPt.y + hexVerts[0].y * 0.6);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(
      frontPt.x + hexVerts[i].x * 0.6,
      frontPt.y + hexVerts[i].y * 0.6,
    );
  ctx.closePath();
  ctx.stroke();

  // Outer edge highlight
  ctx.strokeStyle = `rgba(140, 140, 158, 0.4)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(frontPt.x + hexVerts[0].x, frontPt.y + hexVerts[0].y);
  for (let i = 1; i < hexSides; i++)
    ctx.lineTo(frontPt.x + hexVerts[i].x, frontPt.y + hexVerts[i].y);
  ctx.closePath();
  ctx.stroke();
}

export function drawMantlets(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  layer: "behind" | "front" | "all" = "all",
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const fwdX = cosR;
  const fwdY = sinR * 0.5;

  const offset = 8 * zoom * scale;
  const fwdOffset = 8 * zoom * scale;
  const plateHalfW = 3.5 * zoom * scale;
  const plateH = 8 * zoom * scale;
  const plateThick = 2 * zoom * scale;

  // Depth sort: draw the mantlet farther from camera first
  const sideOrder: number[] = perpY > 0 ? [-1, 1] : [1, -1];

  for (const side of sideOrder) {
    const closerToCamera = perpY * side > 0;
    if (layer === "behind" && closerToCamera) continue;
    if (layer === "front" && !closerToCamera) continue;

    const cx = pivotX + perpX * offset * side + fwdX * fwdOffset;
    const cy = pivotY + perpY * offset * side + fwdY * fwdOffset;

    const sideDepth = perpY * side;
    const isLit = sideDepth > 0;

    const fl = { x: cx - perpX * plateHalfW, y: cy - perpY * plateHalfW };
    const fr = { x: cx + perpX * plateHalfW, y: cy + perpY * plateHalfW };

    const frontBase = isLit ? 68 : 52;
    ctx.fillStyle = `rgb(${frontBase + 10}, ${frontBase + 8}, ${frontBase + 4})`;
    ctx.beginPath();
    ctx.moveTo(fl.x, fl.y);
    ctx.lineTo(fr.x, fr.y);
    ctx.lineTo(fr.x, fr.y - plateH);
    ctx.lineTo(fl.x, fl.y - plateH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgb(${frontBase + 22}, ${frontBase + 18}, ${frontBase + 12})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    const thickBase = isLit ? 58 : 44;
    const outerEdge = side > 0 ? fr : fl;
    ctx.fillStyle = `rgb(${thickBase + 4}, ${thickBase + 2}, ${thickBase})`;
    ctx.beginPath();
    ctx.moveTo(outerEdge.x, outerEdge.y);
    ctx.lineTo(
      outerEdge.x + fwdX * plateThick,
      outerEdge.y + fwdY * plateThick,
    );
    ctx.lineTo(
      outerEdge.x + fwdX * plateThick,
      outerEdge.y + fwdY * plateThick - plateH,
    );
    ctx.lineTo(outerEdge.x, outerEdge.y - plateH);
    ctx.closePath();
    ctx.fill();

    const topBase = isLit ? 75 : 60;
    ctx.fillStyle = `rgb(${topBase + 10}, ${topBase + 8}, ${topBase + 4})`;
    ctx.beginPath();
    ctx.moveTo(fl.x, fl.y - plateH);
    ctx.lineTo(fr.x, fr.y - plateH);
    ctx.lineTo(fr.x + fwdX * plateThick, fr.y + fwdY * plateThick - plateH);
    ctx.lineTo(fl.x + fwdX * plateThick, fl.y + fwdY * plateThick - plateH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#8a8a95";
    for (const bt of [0.2, 0.8]) {
      ctx.beginPath();
      ctx.arc(cx, cy - plateH * bt, 1.3 * zoom * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = `rgba(100, 100, 115, ${isLit ? 0.5 : 0.35})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx, cy - plateH * 0.15);
    ctx.lineTo(cx, cy - plateH * 0.85);
    ctx.stroke();
  }
}

export function drawBreechMechanism(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  recoilOffset: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const lightSide = sinR < 0;

  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const backX = -cosR;
  const backY = -sinR * 0.5;

  const rX = -cosR * recoilOffset;
  const rY = -sinR * recoilOffset * 0.5;
  const bx = pivotX + rX;
  const by = pivotY + rY;

  // === RECOIL CYLINDERS ===
  const cylLen = 20 * zoom * scale;
  const cylRad = 3.2 * zoom * scale;
  const cylOff = 7 * zoom * scale;

  for (const side of [-1, 1]) {
    const sx = bx + perpX * cylOff * side;
    const sy = by + perpY * cylOff * side;
    const ex = sx + backX * cylLen;
    const ey = sy + backY * cylLen;
    const isLit = (side === 1) === lightSide;

    const cGrad = ctx.createLinearGradient(
      sx + perpX * cylRad,
      sy + perpY * cylRad,
      sx - perpX * cylRad,
      sy - perpY * cylRad,
    );
    if (isLit) {
      cGrad.addColorStop(0, "#7a7a85");
      cGrad.addColorStop(0.5, "#5a5a65");
      cGrad.addColorStop(1, "#4a4a55");
    } else {
      cGrad.addColorStop(0, "#4a4a55");
      cGrad.addColorStop(0.5, "#5a5a65");
      cGrad.addColorStop(1, "#4a4a55");
    }

    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(sx + perpX * cylRad, sy + perpY * cylRad);
    ctx.lineTo(ex + perpX * cylRad, ey + perpY * cylRad);
    ctx.lineTo(ex - perpX * cylRad, ey - perpY * cylRad);
    ctx.lineTo(sx - perpX * cylRad, sy - perpY * cylRad);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#6a6a75";
    ctx.beginPath();
    ctx.ellipse(ex, ey, cylRad * 1.3, cylRad * 0.65, rotation, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#8a8a95";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 2; i++) {
      const t = 0.3 + i * 0.4;
      const rx = sx + (ex - sx) * t;
      const ry = sy + (ey - sy) * t;
      ctx.beginPath();
      ctx.moveTo(rx + perpX * cylRad * 1.1, ry + perpY * cylRad * 1.1);
      ctx.lineTo(rx - perpX * cylRad * 1.1, ry - perpY * cylRad * 1.1);
      ctx.stroke();
    }

    const pistonLen = recoilOffset > 0 ? recoilOffset * 0.6 : 2 * zoom;
    ctx.strokeStyle = "#9a9aa5";
    ctx.lineWidth = 1.2 * zoom * scale;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx - backX * pistonLen, sy - backY * pistonLen);
    ctx.stroke();
  }

  // === BREECH BLOCK ===
  const blkLen = 12 * zoom * scale;
  const blkW = 9 * zoom * scale;
  const blkH = 6.5 * zoom * scale;

  const bf1x = bx + perpX * blkW;
  const bf1y = by + perpY * blkW;
  const bf2x = bx - perpX * blkW;
  const bf2y = by - perpY * blkW;
  const bb1x = bx + backX * blkLen + perpX * blkW * 0.85;
  const bb1y = by + backY * blkLen + perpY * blkW * 0.85;
  const bb2x = bx + backX * blkLen - perpX * blkW * 0.85;
  const bb2y = by + backY * blkLen - perpY * blkW * 0.85;

  const blkGrad = ctx.createLinearGradient(
    bx + perpX * blkW,
    by + perpY * blkW,
    bx - perpX * blkW,
    by - perpY * blkW,
  );
  if (lightSide) {
    blkGrad.addColorStop(0, "#6a6a75");
    blkGrad.addColorStop(0.4, "#555562");
    blkGrad.addColorStop(1, "#3a3a46");
  } else {
    blkGrad.addColorStop(0, "#3a3a46");
    blkGrad.addColorStop(0.6, "#555562");
    blkGrad.addColorStop(1, "#6a6a75");
  }

  ctx.fillStyle = blkGrad;
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y);
  ctx.lineTo(bb1x, bb1y);
  ctx.lineTo(bb2x, bb2y);
  ctx.lineTo(bf2x, bf2y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = lightSide ? "#757580" : "#5a5a68";
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y - blkH);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bf2x, bf2y - blkH);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = lightSide ? "#5a5a68" : "#4a4a56";
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y);
  ctx.lineTo(bf1x, bf1y - blkH);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb1x, bb1y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = lightSide ? "#4a4a56" : "#5a5a68";
  ctx.beginPath();
  ctx.moveTo(bf2x, bf2y);
  ctx.lineTo(bf2x, bf2y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bb2x, bb2y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#3a3a46";
  ctx.beginPath();
  ctx.moveTo(bb1x, bb1y);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bb2x, bb2y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#7a7a85";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(bf1x, bf1y - blkH);
  ctx.lineTo(bb1x, bb1y - blkH);
  ctx.lineTo(bb2x, bb2y - blkH);
  ctx.lineTo(bf2x, bf2y - blkH);
  ctx.closePath();
  ctx.stroke();

  // Breech locking lug detail
  const lugX = bx + backX * blkLen * 0.5;
  const lugY = by + backY * blkLen * 0.5 - blkH;
  ctx.fillStyle = "#8a8a95";
  ctx.beginPath();
  ctx.ellipse(
    lugX,
    lugY,
    2 * zoom * scale,
    1.2 * zoom * scale,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === TRUNNION BRACKETS & PINS ===
  for (const side of [-1, 1]) {
    const trX = bx + perpX * (blkW + 2 * zoom) * side;
    const trY = by + perpY * (blkW + 2 * zoom) * side;

    ctx.fillStyle = "#555562";
    const armLen = 6 * zoom * scale;
    ctx.beginPath();
    ctx.moveTo(trX, trY - blkH * 0.5);
    ctx.lineTo(trX + backX * armLen, trY + backY * armLen - blkH * 0.5);
    ctx.lineTo(trX + backX * armLen, trY + backY * armLen + 3 * zoom * scale);
    ctx.lineTo(trX, trY + 3 * zoom * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#8a8a95";
    ctx.beginPath();
    ctx.arc(trX, trY - blkH * 0.3, 2.2 * zoom * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6a6a75";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // === ELEVATION LINKAGE ===
  const lkX = bx + backX * blkLen * 0.65;
  const lkY = by + backY * blkLen * 0.65;

  ctx.strokeStyle = "#555562";
  ctx.lineWidth = 2.2 * zoom * scale;
  ctx.beginPath();
  ctx.moveTo(lkX, lkY);
  ctx.lineTo(lkX, lkY + 9 * zoom * scale);
  ctx.stroke();

  ctx.fillStyle = "#7a7a85";
  ctx.beginPath();
  ctx.arc(lkX, lkY + 9 * zoom * scale, 2.2 * zoom * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#6a6a75";
  ctx.lineWidth = 2.5 * zoom * scale;
  ctx.beginPath();
  ctx.moveTo(lkX, lkY + 4 * zoom * scale);
  ctx.lineTo(lkX + backX * 7 * zoom * scale, lkY + 6 * zoom * scale);
  ctx.stroke();

  // Hydraulic cylinder detail on elevation linkage
  ctx.fillStyle = "#4a4a56";
  ctx.beginPath();
  ctx.ellipse(
    lkX + backX * 7 * zoom * scale,
    lkY + 6 * zoom * scale,
    2.5 * zoom * scale,
    1.5 * zoom * scale,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

export function drawBreechFeedAnimation(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  zoom: number,
  scale: number,
  time: number,
  lastAttack: number,
  cycleTime: number,
  animSpeed: number,
  ejectCount: number = 1,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const backX = -cosR;
  const backY = -sinR * 0.5;

  const timeSinceFire = Date.now() - lastAttack;
  const firing = timeSinceFire < cycleTime;
  const phase = firing ? timeSinceFire / cycleTime : 0;

  // Shell ejection — multiple casings for multi-barrel weapons
  for (let shellIdx = 0; shellIdx < ejectCount; shellIdx++) {
    const phaseOffset = shellIdx * (0.4 / ejectCount);
    const shellPhase = phase - phaseOffset;
    if (!firing || shellPhase < 0.08 || shellPhase > 0.75) continue;

    const ejectPhase = (shellPhase - 0.08) / 0.67;
    const ejectDist = ejectPhase * 28 * zoom * scale;
    const ejectUp = Math.sin(ejectPhase * Math.PI) * 16 * zoom * scale;
    const ejectSpin = ejectPhase * Math.PI * 5 * animSpeed + shellIdx * 1.7;

    const sideSpread = (shellIdx - (ejectCount - 1) * 0.5) * 6 * zoom * scale;
    const ejectX =
      pivotX -
      perpX * (8 * zoom * scale + ejectDist) +
      backX * 3 * zoom * scale +
      perpX * sideSpread;
    const ejectY =
      pivotY -
      perpY * (8 * zoom * scale + ejectDist) +
      backY * 3 * zoom * scale -
      ejectUp +
      perpY * sideSpread;

    const ejectAlpha = Math.min(1, 1.2 - ejectPhase * 0.9);

    if (ejectPhase < 0.5) {
      const smokeAlpha = (0.5 - ejectPhase) * 0.6;
      const smokeR = (4 + ejectPhase * 20) * zoom * scale;
      ctx.fillStyle = `rgba(170, 165, 150, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(
        pivotX -
          perpX * 9 * zoom * scale +
          backX * 3 * zoom * scale +
          perpX * sideSpread,
        pivotY -
          perpY * 9 * zoom * scale +
          backY * 3 * zoom * scale +
          perpY * sideSpread,
        smokeR,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.globalAlpha = ejectAlpha;

    ctx.fillStyle = `rgba(230, 195, 80, ${ejectAlpha * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(
      ejectX,
      ejectY,
      5 * zoom * scale,
      7 * zoom * scale,
      ejectSpin,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = "#e8bf30";
    ctx.beginPath();
    ctx.ellipse(
      ejectX,
      ejectY,
      3 * zoom * scale,
      5.5 * zoom * scale,
      ejectSpin,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = "#8a6a12";
    ctx.lineWidth = 1.2 * zoom * scale;
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 240, 180, 0.6)";
    ctx.beginPath();
    ctx.ellipse(
      ejectX - 0.5 * zoom,
      ejectY - 0.8 * zoom,
      1.5 * zoom * scale,
      2.5 * zoom * scale,
      ejectSpin,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    const endX = ejectX + Math.cos(ejectSpin) * 3.5 * zoom * scale;
    const endY = ejectY + Math.sin(ejectSpin) * 3.5 * zoom * scale;
    ctx.fillStyle = `rgba(60, 40, 10, ${ejectAlpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(endX, endY, 1.8 * zoom * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  // Breech bolt cycling
  if (firing) {
    const boltTravel = 6 * zoom * scale;
    let boltOffset = 0;
    if (phase < 0.15) {
      boltOffset = (phase / 0.15) * boltTravel;
    } else if (phase < 0.5) {
      boltOffset = boltTravel * (1 - (phase - 0.15) / 0.35);
    }

    const boltX = pivotX + backX * (3 + boltOffset) * zoom * scale;
    const boltY = pivotY + backY * (3 + boltOffset) * zoom * scale;

    ctx.fillStyle = "#8a8a95";
    ctx.beginPath();
    ctx.ellipse(
      boltX,
      boltY - 2 * zoom * scale,
      2.5 * zoom * scale,
      1.5 * zoom * scale,
      rotation,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.strokeStyle = "#7a7a85";
    ctx.lineWidth = 2 * zoom * scale;
    ctx.beginPath();
    ctx.moveTo(boltX, boltY - 2 * zoom * scale);
    ctx.lineTo(
      boltX + perpX * 4 * zoom * scale,
      boltY + perpY * 4 * zoom * scale - 3 * zoom * scale,
    );
    ctx.stroke();
  }

  // Chamber flash
  if (firing && phase > 0.05 && phase < 0.15) {
    const chamberFlash = 1 - (phase - 0.05) / 0.1;
    ctx.fillStyle = `rgba(255, 200, 100, ${chamberFlash * 0.4})`;
    ctx.beginPath();
    ctx.arc(
      pivotX,
      pivotY - 2 * zoom * scale,
      5 * zoom * scale,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// Level 3 Heavy Cannon - reinforced barrel with stabilizers and isometric rendering
export function renderHeavyCannon(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;

  // Recoil animation - heavier recoil for heavy cannon
  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;
  let reloadPhase = 0;

  if (timeSinceFire < 600) {
    const firePhase = timeSinceFire / 600;
    if (firePhase < 0.15) {
      recoilOffset = (firePhase / 0.15) * 12 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 15) * 3 * zoom;
    } else if (firePhase < 0.5) {
      const returnPhase = (firePhase - 0.15) / 0.35;
      recoilOffset =
        12 * zoom * (1 - returnPhase) * Math.cos(returnPhase * Math.PI * 1.5);
      turretShake =
        Math.sin(returnPhase * Math.PI * 4) * (1 - returnPhase) * 2 * zoom;
    } else {
      reloadPhase = (firePhase - 0.5) / 0.5;
    }
  }

  // Calculate isometric foreshortening
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Larger barrel for heavy cannon
  const baseBarrelLength = 70 * zoom;
  const barrelLength =
    baseBarrelLength * (0.4 + foreshorten * 0.6) - recoilOffset;
  const barrelWidth = 18 * zoom;

  // Apply turret shake
  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Heavy turret base with armored rim
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 1 * zoom,
    26 * zoom,
    13 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Outer ring detail with rotating gear teeth
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 3 * zoom,
    24 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Rotating gear teeth around base
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 23 * zoom;
    const toothY = turretY - 3 * zoom + Math.sin(toothAngle) * 11.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    23 * zoom,
    11.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 6 * zoom,
    21 * zoom,
    10.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Draw barrel behind housing if facing away
  if (facingAway) {
    drawHeavyCannonBarrel(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  // Armored turret housing - base ellipse
  const housingGrad = ctx.createRadialGradient(
    turretX - 5 * zoom,
    turretY - 20 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    24 * zoom,
  );
  housingGrad.addColorStop(0, "#7a7a82");
  housingGrad.addColorStop(0.3, "#6a6a72");
  housingGrad.addColorStop(0.6, "#5a5a62");
  housingGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = housingGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 16 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ROTATING HEAVY ARMOR SHIELD PLATES - 6 main shields that rotate with turret aim
  const heavyShieldCount = 6;
  for (let i = 0; i < heavyShieldCount; i++) {
    const baseAngle = (i / heavyShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;

    // Only draw visible shields
    if (shieldDepth > -0.65) {
      const innerR = 8 * zoom;
      const outerR = 18 * zoom;
      const angleSpan = Math.PI / 3.5;

      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.5,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.5,
      );

      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(130, 130, 140, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(100, 100, 110, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(70, 70, 80, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(80, 80, 90, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(70, 70, 80, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();

      // Draw angular shield shape - heavier version
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 3 * zoom),
        turretY -
          16 * zoom +
          Math.sin(shieldAngle) * (outerR + 3 * zoom) * 0.5 -
          4 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5,
      );
      ctx.closePath();
      ctx.fill();

      // Shield edge highlight
      ctx.strokeStyle = `rgba(160, 160, 170, ${visibility * 0.7})`;
      ctx.lineWidth = 2 * zoom;
      ctx.stroke();

      // Armor rivets on each shield
      const rivet1X =
        turretX +
        Math.cos(shieldAngle - angleSpan * 0.15) * (outerR - 4 * zoom);
      const rivet1Y =
        turretY -
        16 * zoom +
        Math.sin(shieldAngle - angleSpan * 0.15) * (outerR - 4 * zoom) * 0.5 -
        2.5 * zoom;
      const rivet2X =
        turretX +
        Math.cos(shieldAngle + angleSpan * 0.15) * (outerR - 4 * zoom);
      const rivet2Y =
        turretY -
        16 * zoom +
        Math.sin(shieldAngle + angleSpan * 0.15) * (outerR - 4 * zoom) * 0.5 -
        2.5 * zoom;

      ctx.fillStyle = `rgba(50, 50, 60, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivet1X, rivet1Y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rivet2X, rivet2Y, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring (between shields and core)
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 16 * zoom,
    12 * zoom,
    6 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Heavy pivot mechanism
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 10 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Pivot ring detail
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 7 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Barrel mounting collar that rotates with aim - larger for heavy cannon
  const collarX = turretX + cosR * 5 * zoom;
  const collarY = turretY - 16 * zoom + sinR * 2.5 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 7 * zoom, 4 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Power core - smaller and more subtle
  const coreGlow = 0.6 + Math.sin(time * 4) * 0.25 + reloadPhase * 0.3;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    6 * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 220, 120, ${coreGlow})`);
  coreGrad.addColorStop(0.3, `rgba(255, 180, 80, ${coreGlow * 0.8})`);
  coreGrad.addColorStop(0.6, `rgba(255, 130, 30, ${coreGlow * 0.5})`);
  coreGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 16 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Core highlight
  ctx.fillStyle = `rgba(255, 240, 200, ${coreGlow * 0.7})`;
  ctx.beginPath();
  ctx.arc(turretX - 1 * zoom, turretY - 17 * zoom, 1.8 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === AMMO BOX (LEFT) AND ARMOR SHIELD (RIGHT) ===
  const isAttacking = timeSinceFire < 150;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 150 : 0;

  const boxAngle = rotation + Math.PI * 0.55;
  const boxDist = 24 * zoom;
  const boxCenterX = turretX + Math.cos(boxAngle) * boxDist;
  const boxCenterY = turretY - 10 * zoom + Math.sin(boxAngle) * boxDist * 0.5;

  const shieldAngle = rotation - Math.PI * 0.55;
  const shieldDist = 22 * zoom;
  const shieldCenterX = turretX + Math.cos(shieldAngle) * shieldDist;
  const shieldCenterY =
    turretY - 10 * zoom + Math.sin(shieldAngle) * shieldDist * 0.5;

  const boxSide = Math.sin(boxAngle);
  const shieldSide = Math.sin(shieldAngle);
  const boxBehind = boxSide < 0;
  const shieldBehind = shieldSide < 0;
  const towerId = tower.id;

  // Draw behind-camera accessories first
  if (boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "medium",
    );
  }
  if (shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "medium",
    );
  }

  // Hex mantlet, breech, barrel, mantlets — mantlet behind breech when facing away
  if (facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      zoom,
      1.3,
      recoilOffset,
    );
  }
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    recoilOffset,
  );
  drawBreechFeedAnimation(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    time,
    tower.lastAttack,
    600,
    1.0,
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    "behind",
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      zoom,
      1.3,
      recoilOffset,
    );
  }

  if (!facingAway) {
    drawHeavyCannonBarrel(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      barrelLength,
      barrelWidth,
      foreshorten,
      zoom,
      tower,
      time,
    );
  }

  drawMantlets(ctx, turretX, turretY - 16 * zoom, rotation, zoom, 1.3, "front");

  // Draw in-front-of-camera accessories
  if (!boxBehind) {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "medium",
    );
  }
  if (!shieldBehind) {
    draw3DArmorShield(
      ctx,
      shieldCenterX,
      shieldCenterY,
      shieldAngle,
      zoom,
      towerId,
      "medium",
    );
  }

  // Ammo belt always on top (arcs above breech/barrel)
  drawCannonAmmoBelt(
    ctx,
    boxCenterX,
    boxCenterY,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    time,
    isAttacking,
    attackPulse,
    boxSide,
    recoilOffset,
  );

  // Calculate pitch for muzzle flash positioning
  const towerElevation = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchDrop = barrelLength * Math.sin(pitch) * 0.5;

  // Muzzle flash — heavy cannon concussive blast (bigger, more dramatic)
  if (timeSinceFire < 250) {
    const flashPhase = timeSinceFire / 250;
    const turretRadius = 10 * zoom;
    const totalLength =
      turretRadius + barrelLength * Math.cos(pitch) + 8 * zoom;
    const flashX = turretX + cosR * totalLength;
    const flashY = turretY - 16 * zoom + sinR * totalLength * 0.5 + pitchDrop;
    const flashAlpha = 1 - flashPhase;

    // Double concussive shockwave rings
    if (flashPhase > 0.03) {
      const ringPhase = (flashPhase - 0.03) / 0.97;
      const ringR = (16 + ringPhase * 30) * zoom;
      ctx.strokeStyle = `rgba(255, 200, 100, ${(1 - ringPhase) * 0.55})`;
      ctx.lineWidth = (4 - ringPhase * 3) * zoom;
      ctx.beginPath();
      ctx.arc(flashX, flashY, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (flashPhase > 0.08) {
      const ring2Phase = (flashPhase - 0.08) / 0.92;
      const ring2R = (10 + ring2Phase * 20) * zoom;
      ctx.strokeStyle = `rgba(255, 160, 60, ${(1 - ring2Phase) * 0.35})`;
      ctx.lineWidth = (2.5 - ring2Phase * 2) * zoom;
      ctx.beginPath();
      ctx.arc(flashX, flashY, ring2R, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Massive outer fire bloom
    const bloomR = (28 - flashPhase * 20) * zoom;
    ctx.shadowColor = "#ff7700";
    ctx.shadowBlur = 35 * zoom * flashAlpha;
    const bloomGrad = ctx.createRadialGradient(
      flashX,
      flashY,
      0,
      flashX,
      flashY,
      bloomR,
    );
    bloomGrad.addColorStop(0, `rgba(255, 255, 210, ${flashAlpha})`);
    bloomGrad.addColorStop(0.2, `rgba(255, 210, 80, ${flashAlpha * 0.9})`);
    bloomGrad.addColorStop(0.45, `rgba(255, 140, 30, ${flashAlpha * 0.6})`);
    bloomGrad.addColorStop(0.75, `rgba(220, 70, 0, ${flashAlpha * 0.25})`);
    bloomGrad.addColorStop(1, `rgba(180, 40, 0, 0)`);
    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(flashX, flashY, bloomR, 0, Math.PI * 2);
    ctx.fill();

    // White-hot core
    const coreR = (8 - flashPhase * 7) * zoom;
    ctx.fillStyle = `rgba(255, 255, 240, ${flashAlpha * 0.95})`;
    ctx.beginPath();
    ctx.arc(flashX, flashY, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Heavy smoke cloud (two puffs drifting forward and up)
    if (flashPhase > 0.08) {
      const smokeP = (flashPhase - 0.08) / 0.92;
      for (let si = 0; si < 2; si++) {
        const spread = (si - 0.5) * 8 * zoom;
        const smokeDist = (10 + smokeP * 24) * zoom;
        const smokeX = flashX + cosR * smokeDist + -sinR * spread;
        const smokeY =
          flashY +
          sinR * smokeDist * 0.5 +
          cosR * spread * 0.5 -
          smokeP * 10 * zoom;
        const smokeR = (6 + smokeP * 12) * zoom;
        ctx.fillStyle = `rgba(70, 65, 60, ${(1 - smokeP) * 0.4})`;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Sparks shower (4 particles for heavy cannon)
    if (flashPhase < 0.7) {
      const sparkAlpha = (1 - flashPhase / 0.7) * 0.85;
      for (let i = 0; i < 4; i++) {
        const sparkAngle = rotation + (i - 1.5) * 0.35;
        const sparkSpeed = 0.7 + i * 0.2;
        const sparkDist = (6 + flashPhase * 45 * sparkSpeed) * zoom;
        const sparkX = flashX + Math.cos(sparkAngle) * sparkDist;
        const sparkY =
          flashY +
          Math.sin(sparkAngle) * sparkDist * 0.5 -
          flashPhase * (5 + i * 4) * zoom;
        ctx.fillStyle = `rgba(255, 220, 100, ${sparkAlpha})`;
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, (2 - flashPhase * 1.5) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }
}

// Heavy cannon barrel — hex prism body + hex muzzle with reinforcements and fins
export function drawHeavyCannonBarrel(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  barrelLength: number,
  _barrelWidth: number,
  _foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const upY = -1;

  const towerElevation = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLength);
  const pitchRate = Math.sin(pitch) * 0.5;
  const axisPoint = (dist: number) => ({
    x: pivotX + fwdX * dist,
    y: pivotY + fwdY * dist + dist * pitchRate,
  });

  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  if (timeSinceFire < 200) {
    const recoilPhase = timeSinceFire / 200;
    if (recoilPhase < 0.15) {
      recoilOffset = (recoilPhase / 0.15) * 10 * zoom;
    } else {
      recoilOffset = 10 * zoom * (1 - (recoilPhase - 0.15) / 0.85);
    }
  }

  const turretRadius = 10 * zoom;
  const startDist = turretRadius - recoilOffset;
  const endDist = barrelLength - recoilOffset;
  const hexLen = (endDist - startDist) * 0.76;
  const muzzleLen = (endDist - startDist) * 0.24;

  const isoOff = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat + upY * vert,
  });

  const hexR = 5.5 * zoom;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  const hexVerts = generateIsoHexVertices(isoOff, hexR, hexSides);
  const taperScale = 0.85;
  const taperVerts = scaleVerts(hexVerts, taperScale);

  const hexBackPt = axisPoint(startDist);
  const hexFrontPt = axisPoint(startDist + hexLen);
  const muzzleBackPt = hexFrontPt;
  const muzzleEndPt = axisPoint(startDist + hexLen + muzzleLen + 1 * zoom);

  const sideNormals = computeHexSideNormals(cosR, hexSides);

  const muzzleScale = 1.15;
  const muzzleVerts = scaleVerts(taperVerts, muzzleScale);
  const muzzleTipVerts = scaleVerts(taperVerts, muzzleScale * 1.1);

  // === BREECH HEX CAP ===
  {
    const capPt = facingFwd ? hexBackPt : hexFrontPt;
    const capVerts = facingFwd ? hexVerts : taperVerts;
    drawHexCap(
      ctx,
      capPt,
      capVerts,
      facingFwd ? "#5a5a68" : "#4a4a58",
      "#3a3a48",
      0.6 * zoom,
    );
  }

  // === HEX BARREL BODY — all 6 side quads, depth-sorted ===
  const sortedSides = sortSidesByDepth(sideNormals);

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];
    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];
    const tv0 = taperVerts[i];
    const tv1 = taperVerts[ni];

    const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);
    const rc = Math.floor(40 + lit * 70);
    const gc = Math.floor(40 + lit * 68);
    const bc = Math.floor(46 + lit * 72);

    const sGrad = ctx.createLinearGradient(
      hexBackPt.x + v0.x,
      hexBackPt.y + v0.y,
      hexFrontPt.x + tv0.x,
      hexFrontPt.y + tv0.y,
    );
    sGrad.addColorStop(0, `rgb(${rc + 4}, ${gc + 4}, ${bc + 6})`);
    sGrad.addColorStop(0.5, `rgb(${rc}, ${gc}, ${bc})`);
    sGrad.addColorStop(1, `rgb(${rc - 6}, ${gc - 6}, ${bc - 3})`);
    ctx.fillStyle = sGrad;

    ctx.beginPath();
    ctx.moveTo(hexBackPt.x + v0.x, hexBackPt.y + v0.y);
    ctx.lineTo(hexBackPt.x + v1.x, hexBackPt.y + v1.y);
    ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
    ctx.lineTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    if (normal > 0.25) {
      ctx.strokeStyle = `rgba(160, 160, 178, ${(normal - 0.25) * 0.4})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
      ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
      ctx.stroke();
    }

    if (normal > -0.3) {
      const conduitGlow = 0.5 + Math.sin(time * 6) * 0.3;
      const midV0x = (v0.x + v1.x) * 0.5;
      const midV0y = (v0.y + v1.y) * 0.5;
      const midTV0x = (tv0.x + tv1.x) * 0.5;
      const midTV0y = (tv0.y + tv1.y) * 0.5;
      ctx.strokeStyle = `rgba(255, 102, 0, ${conduitGlow * Math.max(0.15, 0.3 + normal * 0.5)})`;
      ctx.lineWidth = 1.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexBackPt.x + midV0x, hexBackPt.y + midV0y);
      ctx.lineTo(hexFrontPt.x + midTV0x, hexFrontPt.y + midTV0y);
      ctx.stroke();
    }
  }

  // === 3D HEX RING BANDS ===
  const bandCount = 3;
  const bandThick = 3 * zoom;
  for (let b = 0; b < bandCount; b++) {
    const t = (b + 1) / (bandCount + 1);
    const bandFrontPt = axisPoint(startDist + hexLen * t + bandThick * 0.5);
    const bandBackPt2 = axisPoint(startDist + hexLen * t - bandThick * 0.5);
    const bScale = 1 + (taperScale - 1) * t;
    const bVerts = hexVerts.map((v) => ({
      x: v.x * bScale * 1.08,
      y: v.y * bScale * 1.08,
    }));

    const bandSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, bb) => sideNormals[a] - sideNormals[bb],
    );

    for (const i of bandSorted) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const bv0 = bVerts[i];
      const bv1 = bVerts[ni];
      const lit = Math.max(0.2, 0.3 + Math.max(0, normal) * 0.5);
      const gc2 = Math.floor(100 + lit * 50);

      ctx.fillStyle = `rgb(${gc2}, ${gc2}, ${gc2 + 6})`;
      ctx.beginPath();
      ctx.moveTo(bandBackPt2.x + bv0.x, bandBackPt2.y + bv0.y);
      ctx.lineTo(bandBackPt2.x + bv1.x, bandBackPt2.y + bv1.y);
      ctx.lineTo(bandFrontPt.x + bv1.x, bandFrontPt.y + bv1.y);
      ctx.lineTo(bandFrontPt.x + bv0.x, bandFrontPt.y + bv0.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, normal) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      if (normal > -0.05) {
        const midBx = (bv0.x + bv1.x) * 0.5;
        const midBy = (bv0.y + bv1.y) * 0.5;
        ctx.strokeStyle = `rgba(255, 130, 30, ${0.45 + Math.max(0, normal) * 0.35})`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(bandBackPt2.x + midBx, bandBackPt2.y + midBy);
        ctx.lineTo(bandFrontPt.x + midBx, bandFrontPt.y + midBy);
        ctx.stroke();
      }
    }

    const capPtB = facingFwd ? bandFrontPt : bandBackPt2;
    ctx.strokeStyle = `rgba(140, 140, 155, 0.4)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (
        sideNormals[i] < -0.15 &&
        sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
      )
        continue;
      ctx.moveTo(capPtB.x + bVerts[i].x, capPtB.y + bVerts[i].y);
      ctx.lineTo(capPtB.x + bVerts[ni].x, capPtB.y + bVerts[ni].y);
    }
    ctx.stroke();
  }

  // === STABILIZER FINS ===
  const finDist = startDist + hexLen * 0.88;
  const finPt = axisPoint(finDist);
  const finEndPt2 = axisPoint(finDist + 8 * zoom);
  const finH = hexR * 2.0;
  const finW = 3 * zoom;

  for (let f = 0; f < 4; f++) {
    const fa = (f / 4) * Math.PI * 2 + Math.PI / 4;
    const fnormal = Math.cos(fa) * cosR + 0.5 * Math.sin(fa);
    if (fnormal < -0.3) continue;

    const fOuter = isoOff(Math.cos(fa) * finH, Math.sin(fa) * finH);
    const fInner = isoOff(Math.cos(fa) * hexR * 0.5, Math.sin(fa) * hexR * 0.5);

    const fLit = 0.3 + Math.max(0, fnormal) * 0.5;
    const fc = Math.floor(48 + fLit * 55);

    ctx.fillStyle = `rgb(${fc}, ${fc}, ${fc + 6})`;
    ctx.beginPath();
    ctx.moveTo(
      finPt.x + fInner.x - fwdX * finW,
      finPt.y + fInner.y - fwdY * finW,
    );
    ctx.lineTo(finPt.x + fOuter.x, finPt.y + fOuter.y);
    ctx.lineTo(finEndPt2.x + fOuter.x * 0.8, finEndPt2.y + fOuter.y * 0.8);
    ctx.lineTo(
      finEndPt2.x + fInner.x + fwdX * finW,
      finEndPt2.y + fInner.y + fwdY * finW,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(30, 30, 40, ${0.3 + fnormal * 0.3})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    const finMidOuter = { x: fOuter.x * 0.85, y: fOuter.y * 0.85 };
    ctx.strokeStyle = `rgba(255, 120, 20, 0.7)`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(finPt.x + finMidOuter.x, finPt.y + finMidOuter.y);
    ctx.lineTo(
      finEndPt2.x + finMidOuter.x * 0.8,
      finEndPt2.y + finMidOuter.y * 0.8,
    );
    ctx.stroke();
  }

  // === BARREL-MUZZLE JUNCTION CAP ===
  drawHexCap(
    ctx,
    facingFwd ? hexFrontPt : hexBackPt,
    facingFwd ? taperVerts : hexVerts,
    facingFwd ? "#4e4e5c" : "#5a5a68",
  );

  // === MUZZLE BACK CAP ===
  drawHexCap(
    ctx,
    facingFwd ? muzzleBackPt : muzzleEndPt,
    facingFwd ? muzzleVerts : muzzleTipVerts,
    facingFwd ? "#444454" : "#3a3a48",
  );

  // === MUZZLE — hex prism section ===
  const muzzleSorted = sortSidesByDepth(sideNormals);

  for (const i of muzzleSorted) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];
    const mv0 = muzzleVerts[i];
    const mv1 = muzzleVerts[ni];
    const mtv0 = muzzleTipVerts[i];
    const mtv1 = muzzleTipVerts[ni];

    const lit = Math.max(0.1, 0.18 + Math.max(0, normal) * 0.5);
    const c = Math.floor(35 + lit * 60);
    ctx.fillStyle = `rgb(${c}, ${c}, ${c + 5})`;

    ctx.beginPath();
    ctx.moveTo(muzzleBackPt.x + mv0.x, muzzleBackPt.y + mv0.y);
    ctx.lineTo(muzzleBackPt.x + mv1.x, muzzleBackPt.y + mv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv1.x, muzzleEndPt.y + mtv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv0.x, muzzleEndPt.y + mtv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(20, 20, 30, ${0.25 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === ORANGE HEX RINGS on muzzle (visible faces only) ===
  for (let r = 0; r < 2; r++) {
    const mt = 0.2 + r * 0.55;
    const ringPt = axisPoint(startDist + hexLen + muzzleLen * mt);
    const ringScale = 1 + (1.08 - 1) * mt;
    const rVerts = muzzleVerts.map((v) => ({
      x: v.x * ringScale,
      y: v.y * ringScale,
    }));
    ctx.strokeStyle = "rgba(255, 120, 20, 0.75)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    for (let vi = 0; vi < hexSides; vi++) {
      const nvi = (vi + 1) % hexSides;
      if (sideNormals[vi] < -0.1) continue;
      ctx.moveTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
      ctx.lineTo(ringPt.x + rVerts[nvi].x, ringPt.y + rVerts[nvi].y);
    }
    ctx.stroke();
  }

  // === MUZZLE FRONT HEX CAP ===
  const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
  const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;
  drawHexCap(
    ctx,
    mCapPt,
    mCapVerts,
    facingFwd ? "#4a4a58" : "#3a3a48",
    "#5a5a6a",
    0.8 * zoom,
  );

  if (facingFwd) {
    drawHexCap(ctx, mCapPt, scaleVerts(mCapVerts, 0.5), "#0a0a0e");
    // Rifling ring
    ctx.strokeStyle = "#1a1a24";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    const riflingVerts2 = scaleVerts(mCapVerts, 0.32);
    ctx.moveTo(mCapPt.x + riflingVerts2[0].x, mCapPt.y + riflingVerts2[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(mCapPt.x + riflingVerts2[i].x, mCapPt.y + riflingVerts2[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  // === MUZZLE FLASH — heavy cannon barrel blast ===
  if (timeSinceFire < 240) {
    const flash = 1 - timeSinceFire / 240;
    const flashPt = axisPoint(endDist + 12 * zoom);
    const fX = flashPt.x;
    const fY = flashPt.y;

    ctx.shadowColor = "#ff7700";
    ctx.shadowBlur = 30 * zoom * flash;

    // Directional flame plume (larger for heavy cannon)
    const plumeLen = 30 * zoom * flash;
    const plumeTipX = fX + fwdX * plumeLen;
    const plumeTipY = fY + fwdY * plumeLen;
    const plumeGrad = ctx.createLinearGradient(fX, fY, plumeTipX, plumeTipY);
    plumeGrad.addColorStop(0, `rgba(255, 255, 210, ${flash * 0.95})`);
    plumeGrad.addColorStop(0.25, `rgba(255, 190, 60, ${flash * 0.75})`);
    plumeGrad.addColorStop(0.6, `rgba(255, 110, 10, ${flash * 0.4})`);
    plumeGrad.addColorStop(1, `rgba(200, 40, 0, 0)`);
    ctx.fillStyle = plumeGrad;
    const plumeW = 14 * zoom * flash;
    ctx.beginPath();
    ctx.moveTo(fX + perpX * plumeW, fY + perpY * plumeW);
    ctx.quadraticCurveTo(
      plumeTipX,
      plumeTipY,
      fX - perpX * plumeW,
      fY - perpY * plumeW,
    );
    ctx.closePath();
    ctx.fill();

    // Main radial blast
    const blastR = 35 * zoom * flash;
    const blastGrad = ctx.createRadialGradient(fX, fY, 0, fX, fY, blastR);
    blastGrad.addColorStop(0, `rgba(255, 255, 210, ${flash})`);
    blastGrad.addColorStop(0.15, `rgba(255, 220, 100, ${flash * 0.9})`);
    blastGrad.addColorStop(0.4, `rgba(255, 150, 20, ${flash * 0.6})`);
    blastGrad.addColorStop(0.7, `rgba(220, 80, 0, ${flash * 0.3})`);
    blastGrad.addColorStop(1, `rgba(180, 30, 0, 0)`);
    ctx.fillStyle = blastGrad;
    ctx.beginPath();
    ctx.arc(fX, fY, blastR, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = `rgba(255, 255, 245, ${flash * 0.95})`;
    ctx.beginPath();
    ctx.arc(fX, fY, 7 * zoom * flash, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

export function renderGatlingGun(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;
  const spinAngle = time * 30;
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 100;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 100 : 0;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  // Recoil animation
  let recoilOffset = 0;
  let turretShake = 0;

  if (timeSinceFire < 150) {
    const firePhase = timeSinceFire / 150;
    if (firePhase < 0.2) {
      recoilOffset = (firePhase / 0.2) * 6 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 20) * 2 * zoom;
    } else {
      const returnPhase = (firePhase - 0.2) / 0.8;
      recoilOffset = 6 * zoom * (1 - returnPhase);
      turretShake =
        Math.sin(returnPhase * Math.PI * 8) * (1 - returnPhase) * 1.5 * zoom;
    }
  }

  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // === MASSIVE ARMORED BASE ===
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY + 2 * zoom,
    26 * zoom,
    13 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    22 * zoom,
    11 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 21 * zoom;
    const toothY = turretY - 2 * zoom + Math.sin(toothAngle) * 10.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing ammunition indicators
  for (let i = 0; i < 6; i++) {
    const angle = rotation + (i / 6) * Math.PI * 2;
    const indicatorX = turretX + Math.cos(angle) * 18 * zoom;
    const indicatorY = turretY - 3 * zoom + Math.sin(angle) * 9 * zoom;
    const glow = 0.4 + Math.sin(time * 8 + i * 0.5) * 0.3 + attackPulse * 0.3;

    ctx.fillStyle = `rgba(255, 180, 50, ${glow})`;
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  if (facingAway) {
    drawGatlingBarrels(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time,
      recoilOffset,
    );
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      zoom,
      1.2,
      recoilOffset,
    );
  }

  // === HEAVY GUN SHIELD ===
  const shieldGrad = ctx.createLinearGradient(
    turretX - 20 * zoom,
    turretY - 6 * zoom,
    turretX + 20 * zoom,
    turretY - 28 * zoom,
  );
  shieldGrad.addColorStop(0, "#3a3a42");
  shieldGrad.addColorStop(0.2, "#5a5a62");
  shieldGrad.addColorStop(0.5, "#6a6a72");
  shieldGrad.addColorStop(0.8, "#5a5a62");
  shieldGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(turretX - 18 * zoom, turretY - 4 * zoom);
  ctx.lineTo(turretX - 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 18 * zoom, turretY - 4 * zoom);
  ctx.closePath();
  ctx.fill();

  // Shield battle damage marks
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 3; i++) {
    const markX = turretX + (i - 1) * 8 * zoom;
    const markY = turretY - 12 * zoom - i * 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(markX - 3 * zoom, markY - 2 * zoom);
    ctx.lineTo(markX + 2 * zoom, markY + 3 * zoom);
    ctx.stroke();
  }

  ctx.strokeStyle = "#7a7a82";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 14 * zoom, turretY - 26 * zoom);
  ctx.lineTo(turretX + 14 * zoom, turretY - 26 * zoom);
  ctx.stroke();

  // Skull emblem on shield
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 15 * zoom, 6 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 50, ${0.5 + attackPulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(turretX - 2 * zoom, turretY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.arc(turretX + 2 * zoom, turretY - 16 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // Shield tech panels
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(turretX - 10 * zoom, turretY - 8 * zoom);
  ctx.lineTo(turretX - 8 * zoom, turretY - 22 * zoom);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(turretX + 10 * zoom, turretY - 8 * zoom);
  ctx.lineTo(turretX + 8 * zoom, turretY - 22 * zoom);
  ctx.stroke();

  // Heavy rivets
  ctx.fillStyle = "#8a8a92";
  for (let row = 0; row < 2; row++) {
    for (let i = -1; i <= 1; i += 2) {
      ctx.beginPath();
      ctx.arc(
        turretX + i * 11 * zoom,
        turretY - 10 * zoom - row * 8 * zoom,
        2.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === CENTRAL TURRET MECHANISM ===
  const turretGrad = ctx.createRadialGradient(
    turretX - 3 * zoom,
    turretY - 18 * zoom,
    0,
    turretX,
    turretY - 14 * zoom,
    16 * zoom,
  );
  turretGrad.addColorStop(0, "#7a7a82");
  turretGrad.addColorStop(0.5, "#5a5a62");
  turretGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = turretGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 14 * zoom,
    14 * zoom,
    12 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ROTATING HEAVY ARMOR SHIELD PLATES - 6 shields that rotate with turret aim
  const gatlingShieldCount = 6;
  for (let i = 0; i < gatlingShieldCount; i++) {
    const baseAngle = (i / gatlingShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    // Shield depth and visibility
    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;

    // Only draw visible shields
    if (shieldDepth > -0.6) {
      const innerR = 7 * zoom;
      const outerR = 13 * zoom;
      const angleSpan = Math.PI / 3.2;

      // Shield gradient based on lighting
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.8,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.8,
      );

      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(120, 120, 130, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(90, 90, 100, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(65, 65, 75, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(75, 75, 85, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(85, 85, 95, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(65, 65, 75, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();

      // Draw angular shield shape
      ctx.moveTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.8,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.8 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY -
          14 * zoom +
          Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.8 -
          3 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.8 -
          2 * zoom,
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.8,
      );
      ctx.closePath();
      ctx.fill();

      // Shield edge highlight
      ctx.strokeStyle = `rgba(140, 140, 150, ${visibility * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();

      // Armor rivet detail
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 2 * zoom);
      const rivetY =
        turretY -
        14 * zoom +
        Math.sin(shieldAngle) * (outerR - 2 * zoom) * 0.8 -
        2 * zoom;
      ctx.fillStyle = `rgba(50, 50, 60, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Inner turret ring
  ctx.strokeStyle = "#4a4a52";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 14 * zoom,
    9 * zoom,
    7.5 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // === AMMO BOX (LEFT) AND ARMOR PLATE (RIGHT) - with proper layering ===
  // Belt shake animation when firing
  const beltShakeX = isAttacking
    ? Math.sin(time * 80) * 2.5 * zoom * attackPulse
    : 0;
  const beltShakeY = isAttacking
    ? Math.cos(time * 60) * 1.8 * zoom * attackPulse
    : 0;

  // Ammo box position - rotates with turret on the LEFT side
  const boxAngle = rotation + Math.PI * 0.45;
  const boxDistance = 28 * zoom;
  const boxCenterX =
    turretX + Math.cos(boxAngle) * boxDistance + beltShakeX * 0.3;
  const boxCenterY =
    turretY -
    8 * zoom +
    Math.sin(boxAngle) * boxDistance * 0.5 +
    beltShakeY * 0.2;

  // Armor plate position - on the RIGHT side of turret
  const plateAngle = rotation - Math.PI * 0.55;
  const plateDistance = 24 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY =
    turretY - 10 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;

  // Determine layering
  const facingPlayer = sinR > 0.2;
  const boxBehindAll = facingPlayer || Math.sin(boxAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;

  const boxSide = Math.sin(boxAngle);

  // Calculate plate visibility
  const plateDepth = Math.cos(plateAngle);
  const plateSide = Math.sin(plateAngle);
  const plateVisible = true;

  const drawAmmoBox = () => {
    draw3DAmmoBox(
      ctx,
      boxCenterX,
      boxCenterY,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "large",
    );
  };

  // Helper function to draw the armor plate with number
  const drawArmorPlate = () => {
    if (!plateVisible) return;

    const plateWidth = 16 * zoom;
    const plateHeight = 20 * zoom;
    const plateDepthSize = 8 * zoom;
    const plateLightness = 0.4 + plateDepth * 0.3;

    // === ARMOR PLATE BACK FACE ===
    if (plateSide < 0.3) {
      const backColor = Math.floor(40 + plateLightness * 20);
      ctx.fillStyle = `rgb(${backColor}, ${backColor}, ${backColor + 5})`;
      ctx.beginPath();
      ctx.moveTo(
        plateCenterX - plateWidth * 0.5,
        plateCenterY - plateHeight * 0.5,
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY + plateHeight * 0.5 - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5,
        plateCenterY + plateHeight * 0.5,
      );
      ctx.closePath();
      ctx.fill();
    }

    // === ARMOR PLATE MAIN FACE ===
    const plateGrad = ctx.createLinearGradient(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
    );
    plateGrad.addColorStop(
      0,
      `rgb(${Math.floor(70 + plateLightness * 35)}, ${Math.floor(70 + plateLightness * 30)}, ${Math.floor(65 + plateLightness * 25)})`,
    );
    plateGrad.addColorStop(
      0.5,
      `rgb(${Math.floor(55 + plateLightness * 30)}, ${Math.floor(55 + plateLightness * 25)}, ${Math.floor(50 + plateLightness * 20)})`,
    );
    plateGrad.addColorStop(
      1,
      `rgb(${Math.floor(45 + plateLightness * 20)}, ${Math.floor(45 + plateLightness * 15)}, ${Math.floor(40 + plateLightness * 12)})`,
    );
    ctx.fillStyle = plateGrad;

    // Rounded rectangle shape for plate
    const radius = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.quadraticCurveTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5 + radius,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5 - radius,
    );
    ctx.quadraticCurveTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY + plateHeight * 0.5,
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY + plateHeight * 0.5,
    );
    ctx.quadraticCurveTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
      plateCenterX - plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5 - radius,
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5 + radius,
    );
    ctx.quadraticCurveTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.closePath();
    ctx.fill();

    // Plate edge
    ctx.strokeStyle = `rgb(${Math.floor(85 + plateLightness * 35)}, ${Math.floor(85 + plateLightness * 30)}, ${Math.floor(80 + plateLightness * 25)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    // === ARMOR PLATE TOP FACE ===
    const topPlateColor = Math.floor(60 + plateLightness * 30);
    ctx.fillStyle = `rgb(${topPlateColor + 15}, ${topPlateColor + 12}, ${topPlateColor + 8})`;
    ctx.beginPath();
    ctx.moveTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5 + radius - plateDepthSize * 0.4,
      plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius - plateDepthSize * 0.4,
      plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25,
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY - plateHeight * 0.5,
    );
    ctx.closePath();
    ctx.fill();

    // === PLATE RIGHT SIDE FACE ===
    if (plateSide > -0.3) {
      const sideColor = Math.floor(50 + plateLightness * 25);
      ctx.fillStyle = `rgb(${sideColor}, ${sideColor - 3}, ${sideColor - 6})`;
      ctx.beginPath();
      ctx.moveTo(
        plateCenterX + plateWidth * 0.5,
        plateCenterY - plateHeight * 0.5 + radius,
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY - plateHeight * 0.5 + radius - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY + plateHeight * 0.5 - radius - plateDepthSize * 0.25,
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5,
        plateCenterY + plateHeight * 0.5 - radius,
      );
      ctx.closePath();
      ctx.fill();
    }

    // Rivets on corners
    ctx.fillStyle = "#7a7a82";
    const rivetOffsets = [
      [-0.4, -0.4],
      [0.4, -0.4],
      [-0.4, 0.4],
      [0.4, 0.4],
    ];
    for (const [rx, ry] of rivetOffsets) {
      ctx.beginPath();
      ctx.arc(
        plateCenterX + rx * plateWidth * 0.85,
        plateCenterY + ry * plateHeight * 0.85,
        2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Inner darker area for number
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.arc(plateCenterX, plateCenterY, 6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Number on plate (stenciled style)
    ctx.font = `bold ${9 * zoom}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(220, 200, 150, ${0.7 + plateLightness * 0.3})`;
    ctx.fillText("⌖", plateCenterX, plateCenterY + 0.5 * zoom);

    // Battle damage scratches
    ctx.strokeStyle = `rgba(30, 30, 35, ${0.4 + plateLightness * 0.2})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(plateCenterX - 4 * zoom, plateCenterY - 6 * zoom);
    ctx.lineTo(plateCenterX - 1 * zoom, plateCenterY - 3 * zoom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(plateCenterX + 3 * zoom, plateCenterY + 4 * zoom);
    ctx.lineTo(plateCenterX + 5 * zoom, plateCenterY + 7 * zoom);
    ctx.stroke();
  };

  // Two belts from the same box, offset along barrel perpendicular — render behind belt first
  const beltPerpX = -sinR;
  const beltPerpY = cosR * 0.5;
  const beltSep = 8 * zoom;
  const beltLateralSign = boxSide > 0 ? -1 : 1;
  const belt2OffX = beltPerpX * beltSep * beltLateralSign;
  const belt2OffY = beltPerpY * beltSep * beltLateralSign;
  const belt2ExitX = boxCenterX + belt2OffX;
  const belt2ExitY = boxCenterY + belt2OffY;

  const drawAmmoBelts = () => {
    // In isometric, lower screen Y = further from camera.
    // The belt with the negative Y offset is behind and should be drawn first.
    const belt2Behind = belt2OffY < 0;
    if (belt2Behind) {
      drawCannonAmmoBelt(
        ctx,
        belt2ExitX,
        belt2ExitY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time + 0.15,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
      drawCannonAmmoBelt(
        ctx,
        boxCenterX,
        boxCenterY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
    } else {
      drawCannonAmmoBelt(
        ctx,
        boxCenterX,
        boxCenterY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
      drawCannonAmmoBelt(
        ctx,
        belt2ExitX,
        belt2ExitY,
        turretX,
        turretY - 14 * zoom,
        rotation,
        zoom,
        time + 0.15,
        isAttacking,
        attackPulse,
        boxSide,
        recoilOffset,
      );
    }
  };

  // Draw items that should be BEHIND the barrel first
  if (boxBehindAll) {
    drawAmmoBox();
  }
  if (plateBehindAll) {
    drawArmorPlate();
  }

  // Barrel mounting collar that rotates with aim
  const collarX = turretX + cosR * 5 * zoom;
  const collarY = turretY - 14 * zoom + sinR * 4 * zoom;
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(collarX, collarY, 6 * zoom, 4 * zoom, rotation, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // === POWER CORE - smaller and more subtle ===
  ctx.fillStyle = "#1a1a22";
  ctx.beginPath();
  ctx.arc(turretX, turretY - 14 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  const coreGlow = 0.6 + Math.sin(time * 10) * 0.25 + attackPulse * 0.25;
  const coreGrad = ctx.createRadialGradient(
    turretX,
    turretY - 14 * zoom,
    0,
    turretX,
    turretY - 14 * zoom,
    4 * zoom,
  );
  coreGrad.addColorStop(0, `rgba(255, 240, 150, ${coreGlow})`);
  coreGrad.addColorStop(0.3, `rgba(255, 200, 80, ${coreGlow * 0.7})`);
  coreGrad.addColorStop(0.7, `rgba(255, 150, 30, ${coreGlow * 0.4})`);
  coreGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);

  ctx.shadowColor = "#ff8800";
  ctx.shadowBlur = (6 + attackPulse * 6) * zoom;
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(turretX, turretY - 14 * zoom, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Spinning core indicator
  ctx.strokeStyle = `rgba(255, 200, 100, ${coreGlow * 0.8})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let i = 0; i < 4; i++) {
    const indicatorAngle = spinAngle * 0.2 + (i / 4) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      turretX,
      turretY - 14 * zoom,
      3 * zoom,
      indicatorAngle,
      indicatorAngle + 0.3,
    );
    ctx.stroke();
  }

  // Breech mechanism (hex mantlet already drawn in facing-away barrel block above)
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 14 * zoom,
    rotation,
    zoom,
    1.2,
    recoilOffset,
  );
  drawBreechFeedAnimation(
    ctx,
    turretX,
    turretY - 14 * zoom,
    rotation,
    zoom,
    1.2,
    time,
    tower.lastAttack,
    200,
    3.0,
    2,
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 14 * zoom,
    rotation,
    zoom,
    1.2,
    "behind",
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      zoom,
      1.2,
      recoilOffset,
    );
  }

  if (!facingAway) {
    drawGatlingBarrels(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      foreshorten,
      spinAngle,
      zoom,
      tower,
      time,
      recoilOffset,
    );
  }

  drawMantlets(ctx, turretX, turretY - 14 * zoom, rotation, zoom, 1.2, "front");

  // Draw in-front-of-camera accessories
  if (!boxBehindAll) {
    drawAmmoBox();
  }
  if (!plateBehindAll) {
    drawArmorPlate();
  }

  // Both ammo belts always on top (arc above breech/barrel)
  drawAmmoBelts();

  // === HEAT VENTS ===
  if (isAttacking) {
    for (let i = 0; i < 3; i++) {
      const ventX = turretX + (i - 1) * 8 * zoom;
      const ventY = turretY - 24 * zoom - Math.random() * 5 * zoom;
      const ventAlpha = attackPulse * (0.3 + Math.random() * 0.2);

      ctx.fillStyle = `rgba(255, 150, 50, ${ventAlpha})`;
      ctx.beginPath();
      ctx.ellipse(ventX, ventY, 3 * zoom, 6 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Unified isometric gatling barrel assembly: housing + barrels + muzzle
// Uses rotation-aware vectors (like ammo box / breech) so everything rotates correctly.
export function drawGatlingBarrels(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  _foreshorten: number,
  spinAngle: number,
  zoom: number,
  tower: Tower,
  time: number,
  recoilOffset: number = 0,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 100;

  // Isometric basis vectors from turret rotation
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;
  const upX = 0;
  const upY = -1;

  // Barrel geometry
  const barrelLen = (48 - recoilOffset * 0.8) * zoom;
  const housingDist = 12 * zoom - recoilOffset * 0.3;
  const barrelCount = 6;
  const barrelSpread = 7 * zoom;
  const barrelW = 3.2 * zoom;

  // Pitch — barrels aim downward at ground-level enemies
  const towerElevation = 25 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, barrelLen);
  const pitchRate = Math.sin(pitch) * 0.5;

  // Helper: get a point along barrel axis at a given forward distance, with pitch drop
  const axisPoint = (dist: number) => ({
    x: pivotX + fwdX * dist,
    y: pivotY + fwdY * dist + dist * pitchRate,
  });

  const ep = axisPoint(barrelLen);
  const ex = ep.x;
  const ey = ep.y;

  // Project a 3D offset (lateral, vertical) into isometric screen coords
  const isoOffset = (lat: number, vert: number) => ({
    x: perpX * lat + upX * vert,
    y: perpY * lat + upY * vert,
  });

  // === HOUSING — hexagonal prism where barrels attach ===
  const housingR = 10 * zoom;
  const housingDepth = 8 * zoom;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  const hVerts = generateIsoHexVertices(isoOffset, housingR, hexSides);
  const housingSideNormals = computeHexSideNormals(cosR, hexSides);

  const hFrontDist = facingFwd ? housingDepth : 0;
  const hBackDist = facingFwd ? 0 : housingDepth;
  const hFrontPt = axisPoint(housingDist + hFrontDist);
  const hBackPt = axisPoint(housingDist + hBackDist);

  // Back hex face
  const drawHousingBack = () => {
    drawHexCap(ctx, hBackPt, hVerts, "#3a3a45", "#2a2a35", 0.8 * zoom);
  };

  // Side faces of housing hex prism
  const drawHousingSides = () => {
    const fbx = hFrontPt.x;
    const fby = hFrontPt.y;
    const bbx = hBackPt.x;
    const bby = hBackPt.y;

    const sorted = sortSidesByDepth(housingSideNormals);

    for (const i of sorted) {
      const ni = (i + 1) % hexSides;
      const normal = housingSideNormals[i];
      if (normal < -0.15) continue;

      const v0 = hVerts[i];
      const v1 = hVerts[ni];

      const lit = 0.25 + Math.max(0, normal) * 0.55;
      const rc = Math.floor(45 + lit * 60);
      const gc = Math.floor(45 + lit * 58);
      const bc = Math.floor(50 + lit * 62);

      const sGrad = ctx.createLinearGradient(
        bbx + v0.x,
        bby + v0.y,
        fbx + v0.x,
        fby + v0.y,
      );
      sGrad.addColorStop(0, `rgb(${rc - 6}, ${gc - 6}, ${bc - 3})`);
      sGrad.addColorStop(0.5, `rgb(${rc}, ${gc}, ${bc})`);
      sGrad.addColorStop(1, `rgb(${rc - 10}, ${gc - 10}, ${bc - 5})`);
      ctx.fillStyle = sGrad;

      ctx.beginPath();
      ctx.moveTo(bbx + v0.x, bby + v0.y);
      ctx.lineTo(bbx + v1.x, bby + v1.y);
      ctx.lineTo(fbx + v1.x, fby + v1.y);
      ctx.lineTo(fbx + v0.x, fby + v0.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(20, 20, 28, ${0.25 + normal * 0.25})`;
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();

      // Highlight on lit edge
      if (normal > 0.2) {
        ctx.strokeStyle = `rgba(150, 150, 165, ${(normal - 0.2) * 0.4})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(fbx + v0.x, fby + v0.y);
        ctx.lineTo(fbx + v1.x, fby + v1.y);
        ctx.stroke();
      }

      // Mid-panel line
      const mf = 0.5;
      ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + normal * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        bbx + v0.x + (fbx + v0.x - bbx - v0.x) * mf,
        bby + v0.y + (fby + v0.y - bby - v0.y) * mf,
      );
      ctx.lineTo(
        bbx + v1.x + (fbx + v1.x - bbx - v1.x) * mf,
        bby + v1.y + (fby + v1.y - bby - v1.y) * mf,
      );
      ctx.stroke();
    }
  };

  // Front hex face of housing
  const drawHousingFront = () => {
    const ffx = hFrontPt.x;
    const ffy = hFrontPt.y;

    const fGrad = ctx.createRadialGradient(
      ffx - 1 * zoom,
      ffy - 0.5 * zoom,
      0,
      ffx,
      ffy,
      housingR,
    );
    if (facingFwd) {
      fGrad.addColorStop(0, "#7a7a88");
      fGrad.addColorStop(0.5, "#5e5e6c");
      fGrad.addColorStop(1, "#4a4a5a");
    } else {
      fGrad.addColorStop(0, "#55556a");
      fGrad.addColorStop(0.5, "#48485a");
      fGrad.addColorStop(1, "#3a3a4a");
    }
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(ffx + hVerts[0].x, ffy + hVerts[0].y);
    for (let i = 1; i < hexSides; i++)
      ctx.lineTo(ffx + hVerts[i].x, ffy + hVerts[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = facingFwd ? "#8a8a98" : "#5a5a6a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    // Vertex bolts
    ctx.fillStyle = facingFwd ? "#8a8a9a" : "#5a5a6a";
    for (let i = 0; i < hexSides; i++) {
      ctx.beginPath();
      ctx.arc(
        ffx + hVerts[i].x * 0.82,
        ffy + hVerts[i].y * 0.82,
        1.4 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Central hub
    ctx.fillStyle = "#2a2a35";
    ctx.beginPath();
    ctx.arc(ffx, ffy, 5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Spinning indicator
    ctx.strokeStyle = `rgba(255, 180, 50, ${0.6 + Math.sin(spinAngle * 0.5) * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(ffx, ffy, 4 * zoom, spinAngle, spinAngle + Math.PI);
    ctx.stroke();

    // Inner hub ring
    ctx.strokeStyle = "#3a3a48";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(ffx, ffy, 3 * zoom, 0, Math.PI * 2);
    ctx.stroke();
  };

  if (facingFwd) {
    drawHousingBack();
    drawHousingSides();
    drawHousingFront();
  } else {
    drawHousingFront();
    drawHousingSides();
    drawHousingBack();
  }

  // === RING BAND geometry + draw closure (order depends on facing direction) ===
  const ringBandCount = 2;
  const ringBandR = barrelSpread + barrelW * 1.2;
  const ringBandThick = 2.5 * zoom;
  const ringHexSides = 6;
  const ringBandSideNormals: number[] = [];
  for (let ri = 0; ri < ringHexSides; ri++) {
    const rmidA = ((ri + 0.5) / ringHexSides) * Math.PI * 2;
    ringBandSideNormals.push(Math.cos(rmidA) * cosR + 0.5 * Math.sin(rmidA));
  }
  const ringBandVerts: { x: number; y: number }[] = [];
  for (let ri = 0; ri < ringHexSides; ri++) {
    const ra = (ri / ringHexSides) * Math.PI * 2;
    ringBandVerts.push(
      isoOffset(Math.cos(ra) * ringBandR, Math.sin(ra) * ringBandR),
    );
  }

  const drawRingBands = () => {
    for (let rb = 0; rb < ringBandCount; rb++) {
      const rbT = (rb + 1) / (ringBandCount + 1);
      const rbDist =
        housingDist +
        housingDepth +
        (barrelLen - housingDist - housingDepth) * rbT;
      const rbFrontPt = axisPoint(rbDist + ringBandThick * 0.5);
      const rbBackPt = axisPoint(rbDist - ringBandThick * 0.5);
      const rbTaper = 1 - rbT * 0.25;
      const rbVerts = ringBandVerts.map((v) => ({
        x: v.x * rbTaper,
        y: v.y * rbTaper,
      }));

      const rbSorted = Array.from({ length: ringHexSides }, (_, i) => i).sort(
        (a, b) => ringBandSideNormals[a] - ringBandSideNormals[b],
      );

      for (const ri of rbSorted) {
        const rni = (ri + 1) % ringHexSides;
        const rnormal = ringBandSideNormals[ri];
        if (rnormal < -0.15) continue;

        const rv0 = rbVerts[ri];
        const rv1 = rbVerts[rni];
        const rlit = Math.max(0.2, 0.3 + Math.max(0, rnormal) * 0.5);
        const rgc = Math.floor(100 + rlit * 50);

        ctx.fillStyle = `rgb(${rgc}, ${rgc}, ${rgc + 6})`;
        ctx.beginPath();
        ctx.moveTo(rbBackPt.x + rv0.x, rbBackPt.y + rv0.y);
        ctx.lineTo(rbBackPt.x + rv1.x, rbBackPt.y + rv1.y);
        ctx.lineTo(rbFrontPt.x + rv1.x, rbFrontPt.y + rv1.y);
        ctx.lineTo(rbFrontPt.x + rv0.x, rbFrontPt.y + rv0.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, rnormal) * 0.15})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.stroke();

        if (rnormal > -0.05) {
          const rmidX = (rv0.x + rv1.x) * 0.5;
          const rmidY = (rv0.y + rv1.y) * 0.5;
          ctx.strokeStyle = `rgba(255, 130, 30, ${0.4 + Math.max(0, rnormal) * 0.35})`;
          ctx.lineWidth = 1 * zoom;
          ctx.beginPath();
          ctx.moveTo(rbBackPt.x + rmidX, rbBackPt.y + rmidY);
          ctx.lineTo(rbFrontPt.x + rmidX, rbFrontPt.y + rmidY);
          ctx.stroke();
        }
      }

      const rbCapPt = facingFwd ? rbFrontPt : rbBackPt;
      ctx.strokeStyle = `rgba(140, 140, 155, 0.4)`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      for (let ri = 0; ri < ringHexSides; ri++) {
        const rni = (ri + 1) % ringHexSides;
        if (
          ringBandSideNormals[ri] < -0.15 &&
          ringBandSideNormals[rni === 0 ? ringHexSides - 1 : rni - 1] < -0.15
        )
          continue;
        ctx.moveTo(rbCapPt.x + rbVerts[ri].x, rbCapPt.y + rbVerts[ri].y);
        ctx.lineTo(rbCapPt.x + rbVerts[rni].x, rbCapPt.y + rbVerts[rni].y);
      }
      ctx.stroke();
    }
  };

  // === BARRELS — each as a quad strip projected with perp + up ===
  type BarrelEntry = {
    spinA: number;
    lat: number;
    vert: number;
    sortY: number;
    idx: number;
  };
  const barrelData: BarrelEntry[] = [];
  for (let i = 0; i < barrelCount; i++) {
    const a = spinAngle + (i / barrelCount) * Math.PI * 2;
    const lat = Math.cos(a) * barrelSpread;
    const vert = Math.sin(a) * barrelSpread;
    const off = isoOffset(lat, vert);
    barrelData.push({ spinA: a, lat, vert, sortY: off.y, idx: i });
  }
  barrelData.sort((a, b) => a.sortY - b.sortY);

  // Muzzle prism position — center it so front face aligns with barrel tips
  const muzzlePt = axisPoint(barrelLen - 5 * zoom);
  const muzzleX = muzzlePt.x;
  const muzzleY = muzzlePt.y;
  const muzzleBehind = fwdY < 0;

  // Draw muzzle behind barrels if facing away
  if (muzzleBehind) {
    drawGatlingMuzzleIso(
      ctx,
      muzzleX,
      muzzleY,
      rotation,
      fwdX,
      fwdY,
      perpX,
      perpY,
      spinAngle,
      zoom,
      barrelSpread,
      barrelCount,
      isAttacking,
      timeSinceFire,
      ex,
      ey,
      pitchRate,
    );
  }

  // Ring bands behind barrels when facing away (barrel surfaces occlude them)
  if (!facingFwd) {
    drawRingBands();
  }

  for (const bd of barrelData) {
    const off = isoOffset(bd.lat, bd.vert);
    const bsx = hFrontPt.x + off.x;
    const bsy = hFrontPt.y + off.y;
    const bex = ex + off.x * 0.75;
    const bey = ey + off.y * 0.75;

    // Barrel width vector perpendicular to aim in screen space
    const bwPerp = isoOffset(
      Math.cos(bd.spinA + Math.PI * 0.5) * barrelW,
      Math.sin(bd.spinA + Math.PI * 0.5) * barrelW,
    );

    const shade = 0.3 + (bd.sortY / (barrelSpread * 1.5) + 0.5) * 0.4;
    const tint = bd.idx % 2 === 0 ? 10 : -10;
    const c = Math.max(30, Math.min(140, Math.floor(45 + shade * 65 + tint)));

    const grad = ctx.createLinearGradient(
      bsx + bwPerp.x,
      bsy + bwPerp.y,
      bsx - bwPerp.x,
      bsy - bwPerp.y,
    );
    grad.addColorStop(0, `rgb(${c + 20}, ${c + 20}, ${c + 26})`);
    grad.addColorStop(0.4, `rgb(${c + 5}, ${c + 5}, ${c + 10})`);
    grad.addColorStop(0.6, `rgb(${c - 5}, ${c - 5}, ${c})`);
    grad.addColorStop(1, `rgb(${c - 20}, ${c - 20}, ${c - 14})`);
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(bsx + bwPerp.x, bsy + bwPerp.y);
    ctx.lineTo(bex + bwPerp.x * 0.7, bey + bwPerp.y * 0.7);
    ctx.lineTo(bex - bwPerp.x * 0.7, bey - bwPerp.y * 0.7);
    ctx.lineTo(bsx - bwPerp.x, bsy - bwPerp.y);
    ctx.closePath();
    ctx.fill();

    // Edge lines
    ctx.strokeStyle = `rgba(15, 15, 20, 0.45)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bsx + bwPerp.x, bsy + bwPerp.y);
    ctx.lineTo(bex + bwPerp.x * 0.7, bey + bwPerp.y * 0.7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bsx - bwPerp.x, bsy - bwPerp.y);
    ctx.lineTo(bex - bwPerp.x * 0.7, bey - bwPerp.y * 0.7);
    ctx.stroke();

    // Muzzle flash per barrel (visible at all angles, intensity based on depth)
    if (isAttacking) {
      const flashIntensity = 1 - timeSinceFire / 100;
      const depthFade =
        bd.sortY > -barrelSpread * 0.3
          ? 1
          : 0.4 + 0.6 * Math.max(0, 1 + bd.sortY / barrelSpread);
      ctx.fillStyle = `rgba(255, 200, 80, ${flashIntensity * 0.5 * depthFade})`;
      ctx.beginPath();
      ctx.arc(bex, bey, 2.5 * zoom * depthFade, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ring bands in front of barrels when facing camera (clamp rings visible on surface)
  if (facingFwd) {
    drawRingBands();
  }

  // Draw muzzle in front of barrels if facing camera
  if (!muzzleBehind) {
    drawGatlingMuzzleIso(
      ctx,
      muzzleX,
      muzzleY,
      rotation,
      fwdX,
      fwdY,
      perpX,
      perpY,
      spinAngle,
      zoom,
      barrelSpread,
      barrelCount,
      isAttacking,
      timeSinceFire,
      ex,
      ey,
      pitchRate,
    );
  }

  // Smoke wisps
  if (timeSinceFire > 50 && timeSinceFire < 350) {
    const smokePhase = (timeSinceFire - 50) / 300;
    for (let i = 0; i < 4; i++) {
      const smokeX2 =
        ex +
        fwdX * (6 + smokePhase * 12) * zoom +
        (Math.random() - 0.5) * 10 * zoom;
      const smokeY2 = ey - smokePhase * 18 * zoom - i * 5 * zoom;
      const smokeAlpha = (1 - smokePhase) * 0.35;
      ctx.fillStyle = `rgba(100, 100, 110, ${smokeAlpha})`;
      ctx.beginPath();
      ctx.arc(smokeX2, smokeY2, (3 + smokePhase * 5) * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawGatlingMuzzleIso(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rotation: number,
  fwdX: number,
  fwdY: number,
  perpX: number,
  perpY: number,
  spinAngle: number,
  zoom: number,
  barrelSpread: number,
  barrelCount: number,
  isAttacking: boolean,
  timeSinceFire: number,
  flashCx: number,
  flashCy: number,
  pitchRate: number = 0,
) {
  const cosR = Math.cos(rotation);
  const facingCamera = fwdY >= 0;
  const hexR = barrelSpread + 2.5 * zoom;
  const prismDepth = 10 * zoom;
  const hexSides = 6;

  const isoVtx = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat - vert,
  });

  // Pitch-aware offset along barrel axis
  const axisOff = (dist: number) => ({
    x: fwdX * dist,
    y: fwdY * dist + dist * pitchRate,
  });

  const hexVerts = generateIsoHexVertices(isoVtx, hexR, hexSides);

  // Front/back face offsets along barrel axis (pitch-aware)
  const frontDist = facingCamera ? prismDepth : 0;
  const backDist = facingCamera ? 0 : prismDepth;
  const frontOffPt = axisOff(frontDist);
  const backOffPt = axisOff(backDist);

  const sideNormals = computeHexSideNormals(cosR, hexSides);

  // === BACK HEXAGONAL FACE (draw first if facing camera) ===
  const drawBackFace = () => {
    const bfx = cx + backOffPt.x;
    const bfy = cy + backOffPt.y;
    drawHexCap(
      ctx,
      { x: bfx, y: bfy },
      hexVerts,
      "#7a7a8e",
      "#6a6a7e",
      1 * zoom,
    );

    // Back face bolts at each vertex
    ctx.fillStyle = "#9a9aaa";
    for (let i = 0; i < hexSides; i++) {
      ctx.beginPath();
      ctx.arc(
        bfx + hexVerts[i].x * 0.75,
        bfy + hexVerts[i].y * 0.75,
        1.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  };

  // === SIDE FACES of hexagonal prism ===
  const drawSideFaces = () => {
    const fbx = cx + frontOffPt.x;
    const fby = cy + frontOffPt.y;
    const bbx = cx + backOffPt.x;
    const bby = cy + backOffPt.y;

    const sortedSides = sortSidesByDepth(sideNormals);

    for (const i of sortedSides) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const v0 = hexVerts[i];
      const v1 = hexVerts[ni];

      // Dynamic lighting per face — bright steel palette
      const lit = 0.3 + Math.max(0, normal) * 0.55;
      const baseR = Math.floor(90 + lit * 75);
      const baseG = Math.floor(90 + lit * 73);
      const baseB = Math.floor(98 + lit * 76);

      // Side face gradient (top to bottom for depth)
      const sGrad = ctx.createLinearGradient(
        bbx + v0.x,
        bby + v0.y,
        fbx + v0.x,
        fby + v0.y,
      );
      sGrad.addColorStop(0, `rgb(${baseR - 6}, ${baseG - 6}, ${baseB - 3})`);
      sGrad.addColorStop(0.5, `rgb(${baseR}, ${baseG}, ${baseB})`);
      sGrad.addColorStop(1, `rgb(${baseR - 10}, ${baseG - 10}, ${baseB - 5})`);

      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.moveTo(bbx + v0.x, bby + v0.y);
      ctx.lineTo(bbx + v1.x, bby + v1.y);
      ctx.lineTo(fbx + v1.x, fby + v1.y);
      ctx.lineTo(fbx + v0.x, fby + v0.y);
      ctx.closePath();
      ctx.fill();

      // Edge lines
      ctx.strokeStyle = `rgba(30, 30, 40, ${0.25 + normal * 0.25})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Horizontal panel line across middle of face
      const midFrac = 0.5;
      const panelMx0 = bbx + v0.x + (fbx + v0.x - bbx - v0.x) * midFrac;
      const panelMy0 = bby + v0.y + (fby + v0.y - bby - v0.y) * midFrac;
      const panelMx1 = bbx + v1.x + (fbx + v1.x - bbx - v1.x) * midFrac;
      const panelMy1 = bby + v1.y + (fby + v1.y - bby - v1.y) * midFrac;
      ctx.strokeStyle = `rgba(40, 40, 52, ${0.35 + normal * 0.15})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(panelMx0, panelMy0);
      ctx.lineTo(panelMx1, panelMy1);
      ctx.stroke();

      // Highlight line on top edge of lit faces
      if (normal > 0.2) {
        ctx.strokeStyle = `rgba(180, 180, 200, ${(normal - 0.2) * 0.5})`;
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(fbx + v0.x, fby + v0.y);
        ctx.lineTo(fbx + v1.x, fby + v1.y);
        ctx.stroke();
      }

      // Corner rivets on the front edge
      const rivetFrac = 0.15;
      const rivetX = fbx + v0.x * (1 - rivetFrac) + v1.x * rivetFrac;
      const rivetY = fby + v0.y * (1 - rivetFrac) + v1.y * rivetFrac;
      if (normal > 0) {
        ctx.fillStyle = `rgba(155, 155, 172, ${0.5 + normal * 0.4})`;
        ctx.beginPath();
        ctx.arc(rivetX, rivetY, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // === FRONT HEXAGONAL FACE ===
  const drawFrontFace = () => {
    const ffx = cx + frontOffPt.x;
    const ffy = cy + frontOffPt.y;

    // Outer hexagon fill with gradient
    const fGrad = ctx.createRadialGradient(
      ffx - 1.5 * zoom,
      ffy - 1 * zoom,
      0,
      ffx,
      ffy,
      hexR,
    );
    if (facingCamera) {
      fGrad.addColorStop(0, "#c0c0cc");
      fGrad.addColorStop(0.35, "#a8a8b8");
      fGrad.addColorStop(0.7, "#9090a4");
      fGrad.addColorStop(1, "#80809a");
    } else {
      fGrad.addColorStop(0, "#9a9aac");
      fGrad.addColorStop(0.5, "#8888a0");
      fGrad.addColorStop(1, "#78788e");
    }
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(ffx + hexVerts[0].x, ffy + hexVerts[0].y);
    for (let i = 1; i < hexSides; i++) {
      ctx.lineTo(ffx + hexVerts[i].x, ffy + hexVerts[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // Outer hex edge
    ctx.strokeStyle = facingCamera ? "#c8c8d4" : "#a0a0b0";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Skip detailed hex decorations when behind barrels (prevents bleed-through)
    if (facingCamera) {
      // Inner hex (concentric, smaller)
      const innerScale = 0.72;
      ctx.strokeStyle = "#6a6a80";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        ffx + hexVerts[0].x * innerScale,
        ffy + hexVerts[0].y * innerScale,
      );
      for (let i = 1; i < hexSides; i++) {
        ctx.lineTo(
          ffx + hexVerts[i].x * innerScale,
          ffy + hexVerts[i].y * innerScale,
        );
      }
      ctx.closePath();
      ctx.stroke();

      // Radial spokes from center to each vertex
      ctx.strokeStyle = "rgba(50, 50, 62, 0.5)";
      ctx.lineWidth = 0.6 * zoom;
      for (let i = 0; i < hexSides; i++) {
        ctx.beginPath();
        ctx.moveTo(ffx, ffy);
        ctx.lineTo(ffx + hexVerts[i].x * 0.9, ffy + hexVerts[i].y * 0.9);
        ctx.stroke();
      }

      // Vertex bolts on the face
      ctx.fillStyle = "#b0b0c0";
      for (let i = 0; i < hexSides; i++) {
        const bx = ffx + hexVerts[i].x * 0.88;
        const by = ffy + hexVerts[i].y * 0.88;
        ctx.beginPath();
        ctx.arc(bx, by, 1.6 * zoom, 0, Math.PI * 2);
        ctx.fill();
        // Bolt slot
        ctx.strokeStyle = "#3a3a4a";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        const slotA = (i / hexSides) * Math.PI * 2;
        ctx.moveTo(
          bx - Math.cos(slotA) * 1 * zoom,
          by - Math.sin(slotA) * 1 * zoom,
        );
        ctx.lineTo(
          bx + Math.cos(slotA) * 1 * zoom,
          by + Math.sin(slotA) * 1 * zoom,
        );
        ctx.stroke();
      }
    }

    if (facingCamera) {
      // Barrel bore holes
      const holeSpread = barrelSpread * 0.65;
      for (let i = 0; i < barrelCount; i++) {
        const a = spinAngle + (i / barrelCount) * Math.PI * 2;
        const hlat = Math.cos(a) * holeSpread;
        const hvert = Math.sin(a) * holeSpread;
        const hox = perpX * hlat;
        const hoy = perpY * hlat - hvert;

        // Outer bore ring
        ctx.fillStyle = "#2a2a35";
        ctx.beginPath();
        ctx.arc(ffx + hox, ffy + hoy, 2.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        // Bore rifling ring
        ctx.strokeStyle = "#3a3a48";
        ctx.lineWidth = 0.6 * zoom;
        ctx.stroke();
        // Dark bore hole
        ctx.fillStyle = "#0a0a0e";
        ctx.beginPath();
        ctx.arc(ffx + hox, ffy + hoy, 1.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        // Tiny highlight on bore rim
        ctx.fillStyle = "rgba(140, 140, 155, 0.3)";
        ctx.beginPath();
        ctx.arc(
          ffx + hox - 0.5 * zoom,
          ffy + hoy - 0.5 * zoom,
          0.8 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Center hub — raised boss
      ctx.fillStyle = "#2a2a35";
      ctx.beginPath();
      ctx.arc(ffx, ffy, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.arc(ffx, ffy, 2.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Hub highlight
      ctx.fillStyle = "rgba(150, 150, 165, 0.25)";
      ctx.beginPath();
      ctx.arc(ffx - 0.8 * zoom, ffy - 0.6 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Hub cross slot
      ctx.strokeStyle = "#0a0a12";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(ffx - 1.5 * zoom, ffy);
      ctx.lineTo(ffx + 1.5 * zoom, ffy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ffx, ffy - 1.5 * zoom);
      ctx.lineTo(ffx, ffy + 1.5 * zoom);
      ctx.stroke();

      // Mid-ring detail bolts (between inner hex and bore holes)
      const midRingR = hexR * 0.52;
      ctx.fillStyle = "rgba(80, 80, 95, 0.6)";
      for (let i = 0; i < hexSides; i++) {
        const a = (i / hexSides) * Math.PI * 2 + Math.PI / hexSides;
        const mb = isoVtx(Math.cos(a) * midRingR, Math.sin(a) * midRingR);
        ctx.beginPath();
        ctx.arc(ffx + mb.x, ffy + mb.y, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Back-face detail: bolts and maintenance panel lines
      ctx.fillStyle = "#5a5a68";
      for (let i = 0; i < hexSides; i++) {
        const bx = ffx + hexVerts[i].x * 0.6;
        const by = ffy + hexVerts[i].y * 0.6;
        ctx.beginPath();
        ctx.arc(bx, by, 1.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Panel cross
      ctx.strokeStyle = "rgba(45, 45, 58, 0.5)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(ffx + hexVerts[0].x * 0.5, ffy + hexVerts[0].y * 0.5);
      ctx.lineTo(ffx + hexVerts[3].x * 0.5, ffy + hexVerts[3].y * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ffx + hexVerts[1].x * 0.5, ffy + hexVerts[1].y * 0.5);
      ctx.lineTo(ffx + hexVerts[4].x * 0.5, ffy + hexVerts[4].y * 0.5);
      ctx.stroke();
    }
  };

  // === Draw in correct depth order ===
  if (facingCamera) {
    drawBackFace();
    drawSideFaces();
    drawFrontFace();
  } else {
    // When behind barrels, only draw a plain opaque hex fill (no side faces,
    // no back face details) to prevent hex geometry bleeding through barrel gaps.
    const ffx = cx + frontOffPt.x;
    const ffy = cy + frontOffPt.y;
    ctx.fillStyle = "#4a4a5a";
    ctx.beginPath();
    ctx.moveTo(ffx + hexVerts[0].x, ffy + hexVerts[0].y);
    for (let i = 1; i < hexSides; i++) {
      ctx.lineTo(ffx + hexVerts[i].x, ffy + hexVerts[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  // === Muzzle flash (always visible regardless of camera angle) ===
  if (isAttacking) {
    const flash = 1 - timeSinceFire / 100;
    const flashScale = facingCamera ? 1 : 0.7;
    const flX = flashCx + fwdX * 10 * zoom;
    const flY = flashCy + fwdY * 5 * zoom;
    const flashR = 22 * zoom * flash * flashScale;

    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 25 * zoom * flash;

    const flashGrad = ctx.createRadialGradient(flX, flY, 0, flX, flY, flashR);
    flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flash})`);
    flashGrad.addColorStop(0.15, `rgba(255, 240, 150, ${flash * 0.95})`);
    flashGrad.addColorStop(0.4, `rgba(255, 180, 80, ${flash * 0.7})`);
    flashGrad.addColorStop(0.7, `rgba(255, 120, 30, ${flash * 0.4})`);
    flashGrad.addColorStop(1, `rgba(200, 60, 0, 0)`);
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(flX, flY, flashR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.9})`;
    ctx.beginPath();
    ctx.arc(flX, flY, 6 * zoom * flash * flashScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

export function renderFlamethrower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
) {
  const rotation = tower.rotation || 0;

  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);
  const facingAway = sinR < -0.3;

  const timeSinceFire = Date.now() - tower.lastAttack;
  let recoilOffset = 0;
  let turretShake = 0;

  if (timeSinceFire < 300) {
    const firePhase = timeSinceFire / 300;
    if (firePhase < 0.1) {
      recoilOffset = (firePhase / 0.1) * 5 * zoom;
      turretShake = Math.sin(firePhase * Math.PI * 12) * 1.5 * zoom;
    } else {
      const returnPhase = (firePhase - 0.1) / 0.9;
      recoilOffset = 5 * zoom * (1 - returnPhase);
      turretShake =
        Math.sin(returnPhase * Math.PI * 3) * (1 - returnPhase) * zoom;
    }
  }

  const shakeX = turretShake * cosR;
  const shakeY = turretShake * sinR * 0.5;
  const turretX = screenPos.x + shakeX;
  const turretY = topY + shakeY;

  // Armored base platform
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    18 * zoom,
    9 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const toothAngle = rotation + (i / 16) * Math.PI * 2;
    const toothX = turretX + Math.cos(toothAngle) * 21 * zoom;
    const toothY = turretY - 2 * zoom + Math.sin(toothAngle) * 10.5 * zoom;
    ctx.beginPath();
    ctx.arc(toothX, toothY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  if (facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      turretX,
      turretY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time,
      recoilOffset,
    );
  }

  // === 3D ISOMETRIC MAIN FUEL TANK (vertical cylinder) ===
  const tankCX = turretX - 6 * zoom;
  const tankRX = 9 * zoom;
  const tankRY = tankRX * 0.45;
  const tankTopCapY = turretY - 26 * zoom;
  const tankBotCapY = turretY + 2 * zoom;

  const tankBodyGrad = ctx.createLinearGradient(
    tankCX - tankRX,
    turretY - 12 * zoom,
    tankCX + tankRX,
    turretY - 12 * zoom,
  );
  tankBodyGrad.addColorStop(0, "#661010");
  tankBodyGrad.addColorStop(0.15, "#881515");
  tankBodyGrad.addColorStop(0.35, "#cc3030");
  tankBodyGrad.addColorStop(0.5, "#dd4040");
  tankBodyGrad.addColorStop(0.7, "#aa2020");
  tankBodyGrad.addColorStop(0.85, "#881515");
  tankBodyGrad.addColorStop(1, "#551010");
  ctx.fillStyle = tankBodyGrad;
  ctx.beginPath();
  ctx.ellipse(tankCX, tankBotCapY, tankRX, tankRY, 0, 0, Math.PI, false);
  ctx.lineTo(tankCX - tankRX, tankTopCapY);
  ctx.ellipse(
    tankCX,
    tankTopCapY,
    tankRX,
    tankRY,
    0,
    Math.PI,
    Math.PI * 2,
    false,
  );
  ctx.closePath();
  ctx.fill();

  // Bottom cap edge
  ctx.strokeStyle = "#440808";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(tankCX, tankBotCapY, tankRX, tankRY, 0, 0, Math.PI, false);
  ctx.stroke();

  // Specular highlight on cylinder body
  ctx.strokeStyle = "rgba(255, 120, 100, 0.35)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(tankCX - tankRX * 0.6, tankBotCapY - 2 * zoom);
  ctx.lineTo(tankCX - tankRX * 0.6, tankTopCapY + 4 * zoom);
  ctx.stroke();

  // Hazard stripes wrapping around the cylinder (front-facing arcs)
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const stripeY = tankTopCapY + 6 * zoom + i * 7 * zoom;
    ctx.strokeStyle = "#ffcc00";
    ctx.beginPath();
    ctx.ellipse(
      tankCX,
      stripeY,
      tankRX * 0.98,
      tankRY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false,
    );
    ctx.stroke();
  }

  // Black hazard stripes between yellow
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 2; i++) {
    const stripeY = tankTopCapY + 9.5 * zoom + i * 7 * zoom;
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(
      tankCX,
      stripeY,
      tankRX * 0.98,
      tankRY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false,
    );
    ctx.stroke();
  }

  // Top cap (3D ellipse with radial gradient)
  const topCapGrad = ctx.createRadialGradient(
    tankCX - 2 * zoom,
    tankTopCapY,
    0,
    tankCX,
    tankTopCapY,
    tankRX,
  );
  topCapGrad.addColorStop(0, "#5a5a62");
  topCapGrad.addColorStop(0.4, "#4a4a52");
  topCapGrad.addColorStop(0.8, "#3a3a42");
  topCapGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = topCapGrad;
  ctx.beginPath();
  ctx.ellipse(tankCX, tankTopCapY, tankRX, tankRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Cap valve on top
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(tankCX, tankTopCapY, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a7a82";
  ctx.beginPath();
  ctx.arc(tankCX, tankTopCapY - 1 * zoom, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === MAIN TANK MOUNTING STRAPS ===
  const strapCount = 2;
  for (let s = 0; s < strapCount; s++) {
    const strapY = tankTopCapY + 10 * zoom + s * 10 * zoom;
    // Strap band (front-facing arc)
    ctx.strokeStyle = "#4a4a55";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      tankCX,
      strapY,
      tankRX + 1.5 * zoom,
      tankRY + 1 * zoom,
      0,
      -0.15,
      Math.PI + 0.15,
      false,
    );
    ctx.stroke();
    // Strap highlight
    ctx.strokeStyle = "rgba(120, 120, 135, 0.3)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      tankCX,
      strapY - 0.8 * zoom,
      tankRX + 1.5 * zoom,
      tankRY + 1 * zoom,
      0,
      0.1,
      Math.PI - 0.1,
      false,
    );
    ctx.stroke();
    // Strap bolts
    for (const boltAngle of [-0.3, Math.PI + 0.3]) {
      const bx = tankCX + Math.cos(boltAngle) * (tankRX + 1.5 * zoom);
      const by = strapY + Math.sin(boltAngle) * (tankRY + 1 * zoom);
      ctx.fillStyle = "#6a6a78";
      ctx.beginPath();
      ctx.arc(bx, by, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(140, 140, 155, 0.4)";
      ctx.beginPath();
      ctx.arc(bx - 0.3 * zoom, by - 0.3 * zoom, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === PRESSURE RELIEF VALVE (side of main tank) ===
  const prvX = tankCX + tankRX * 0.7;
  const prvY = tankTopCapY + 5 * zoom;
  // Valve body
  ctx.fillStyle = "#5a5a65";
  ctx.beginPath();
  ctx.ellipse(prvX, prvY, 2.5 * zoom, 1.8 * zoom, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a3a45";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();
  // Valve stem
  ctx.strokeStyle = "#7a7a88";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(prvX + 2 * zoom, prvY - 1 * zoom);
  ctx.lineTo(prvX + 5 * zoom, prvY - 3 * zoom);
  ctx.stroke();
  // Valve cap
  ctx.fillStyle = "#cc2020";
  ctx.beginPath();
  ctx.arc(prvX + 5 * zoom, prvY - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 100, 100, 0.4)";
  ctx.beginPath();
  ctx.arc(prvX + 4.6 * zoom, prvY - 3.4 * zoom, 0.6 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === FUEL OUTLET FITTING (bottom of main tank) ===
  const outletX = tankCX + tankRX * 0.3;
  const outletY = tankBotCapY + 1 * zoom;
  ctx.fillStyle = "#4a4a55";
  ctx.beginPath();
  ctx.ellipse(outletX, outletY, 3 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3a3a45";
  ctx.beginPath();
  ctx.ellipse(outletX, outletY, 1.8 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pressure gauge on visible side
  const gaugeX = turretX + 2 * zoom;
  const gaugeY = turretY - 6 * zoom;
  ctx.fillStyle = "#444";
  ctx.beginPath();
  ctx.ellipse(
    gaugeX,
    gaugeY + 1 * zoom,
    5.5 * zoom,
    3 * zoom,
    0,
    0,
    Math.PI,
    false,
  );
  ctx.fill();
  ctx.fillStyle = "#ddd";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 4 * zoom, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3 * zoom, Math.PI * 0.8, Math.PI * 1.2);
  ctx.stroke();
  ctx.strokeStyle = "#f00";
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 3 * zoom, Math.PI * 1.5, Math.PI * 1.8);
  ctx.stroke();

  const needleJump =
    timeSinceFire < 300 ? Math.sin(timeSinceFire * 0.05) * 0.2 : 0;
  const needleAngle = Math.PI * (0.9 + Math.sin(time * 2) * 0.15 + needleJump);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(
    gaugeX + Math.cos(needleAngle) * 3 * zoom,
    gaugeY + Math.sin(needleAngle) * 3 * zoom,
  );
  ctx.stroke();

  // Secondary fuel tank — green version
  const secCX = turretX + 8 * zoom;
  const secRX = 5.5 * zoom;
  const secRY = secRX * 0.45;
  const secTopY = turretY - 19 * zoom;
  const secBotY = turretY - 1 * zoom;

  // Green cylindrical body
  const secBodyGrad = ctx.createLinearGradient(
    secCX - secRX,
    0,
    secCX + secRX,
    0,
  );
  secBodyGrad.addColorStop(0, "#0a3310");
  secBodyGrad.addColorStop(0.15, "#155518");
  secBodyGrad.addColorStop(0.35, "#208830");
  secBodyGrad.addColorStop(0.5, "#28aa38");
  secBodyGrad.addColorStop(0.7, "#1c8828");
  secBodyGrad.addColorStop(0.85, "#155518");
  secBodyGrad.addColorStop(1, "#0a3310");
  ctx.fillStyle = secBodyGrad;
  ctx.beginPath();
  ctx.ellipse(secCX, secBotY, secRX, secRY, 0, 0, Math.PI, false);
  ctx.lineTo(secCX - secRX, secTopY);
  ctx.ellipse(secCX, secTopY, secRX, secRY, 0, Math.PI, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();

  // Bottom cap edge
  ctx.strokeStyle = "#083008";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(secCX, secBotY, secRX, secRY, 0, 0, Math.PI, false);
  ctx.stroke();

  // Specular highlight on cylinder body
  ctx.strokeStyle = "rgba(120, 255, 130, 0.35)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(secCX - secRX * 0.6, secBotY - 2 * zoom);
  ctx.lineTo(secCX - secRX * 0.6, secTopY + 3 * zoom);
  ctx.stroke();

  // Yellow hazard stripes wrapping around cylinder
  ctx.lineWidth = 1.8 * zoom;
  for (let i = 0; i < 2; i++) {
    const stripeY = secTopY + 4 * zoom + i * 5 * zoom;
    ctx.strokeStyle = "#ffcc00";
    ctx.beginPath();
    ctx.ellipse(
      secCX,
      stripeY,
      secRX * 0.98,
      secRY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false,
    );
    ctx.stroke();
  }

  // Black hazard stripes between yellow
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 1; i++) {
    const stripeY = secTopY + 6.5 * zoom + i * 5 * zoom;
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(
      secCX,
      stripeY,
      secRX * 0.98,
      secRY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false,
    );
    ctx.stroke();
  }

  // Gray top cap
  const secCapGrad = ctx.createRadialGradient(
    secCX - 1 * zoom,
    secTopY,
    0,
    secCX,
    secTopY,
    secRX,
  );
  secCapGrad.addColorStop(0, "#5a5a62");
  secCapGrad.addColorStop(0.4, "#4a4a52");
  secCapGrad.addColorStop(0.8, "#3a3a42");
  secCapGrad.addColorStop(1, "#2a2a32");
  ctx.fillStyle = secCapGrad;
  ctx.beginPath();
  ctx.ellipse(secCX, secTopY, secRX, secRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Cap valve
  ctx.fillStyle = "#6a6a72";
  ctx.beginPath();
  ctx.ellipse(secCX, secTopY, 2.5 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7a7a82";
  ctx.beginPath();
  ctx.arc(secCX, secTopY - 0.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === SECONDARY TANK MOUNTING STRAP ===
  {
    const secStrapY = secTopY + 6 * zoom;
    ctx.strokeStyle = "#4a4a55";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      secCX,
      secStrapY,
      secRX + 1 * zoom,
      secRY + 0.8 * zoom,
      0,
      -0.15,
      Math.PI + 0.15,
      false,
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(120, 120, 135, 0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      secCX,
      secStrapY - 0.6 * zoom,
      secRX + 1 * zoom,
      secRY + 0.8 * zoom,
      0,
      0.15,
      Math.PI - 0.15,
      false,
    );
    ctx.stroke();
    // Strap rivets
    for (const boltA of [-0.25, Math.PI + 0.25]) {
      const rbx = secCX + Math.cos(boltA) * (secRX + 1 * zoom);
      const rby = secStrapY + Math.sin(boltA) * (secRY + 0.8 * zoom);
      ctx.fillStyle = "#6a6a78";
      ctx.beginPath();
      ctx.arc(rbx, rby, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === SECONDARY TANK OUTLET FITTING ===
  {
    const secOutX = secCX - secRX * 0.4;
    const secOutY = secBotY + 0.5 * zoom;
    ctx.fillStyle = "#4a4a55";
    ctx.beginPath();
    ctx.ellipse(secOutX, secOutY, 2.2 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3a45";
    ctx.beginPath();
    ctx.ellipse(secOutX, secOutY, 1.3 * zoom, 0.9 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // === MULTI-TUBE FUEL SYSTEM ===
  // Shared tube endpoints
  const mainTankOutX = tankCX + tankRX * 0.3;
  const mainTankOutY = tankBotCapY + 1 * zoom;
  const secTankOutX = secCX - secRX * 0.4;
  const secTankOutY = secBotY + 0.5 * zoom;
  const igniterInX = turretX;
  const igniterInY = turretY - 10 * zoom;

  // Valve manifold block position (between tanks and igniter)
  const manifoldX = turretX + 1 * zoom;
  const manifoldY = turretY - 3 * zoom;
  const manifoldW = 8 * zoom;
  const manifoldH = 5 * zoom;
  const manifoldD = 3 * zoom;

  // --- Primary fuel tube (thick, red tint — from main tank to manifold) ---
  ctx.strokeStyle = "#3a2828";
  ctx.lineWidth = 4 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(mainTankOutX, mainTankOutY);
  ctx.quadraticCurveTo(
    mainTankOutX + 4 * zoom,
    manifoldY + 4 * zoom,
    manifoldX - manifoldW * 0.35,
    manifoldY + manifoldD * 0.5,
  );
  ctx.stroke();
  // Tube highlight
  ctx.strokeStyle = "rgba(180, 80, 70, 0.25)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(mainTankOutX + 0.5 * zoom, mainTankOutY - 0.8 * zoom);
  ctx.quadraticCurveTo(
    mainTankOutX + 4.5 * zoom,
    manifoldY + 3.2 * zoom,
    manifoldX - manifoldW * 0.35 + 0.5 * zoom,
    manifoldY + manifoldD * 0.5 - 0.8 * zoom,
  );
  ctx.stroke();

  // --- Secondary oxidizer tube (medium, green tint — from sec tank to manifold) ---
  ctx.strokeStyle = "#1a3320";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(secTankOutX, secTankOutY);
  ctx.quadraticCurveTo(
    secTankOutX - 2 * zoom,
    manifoldY + 5 * zoom,
    manifoldX + manifoldW * 0.3,
    manifoldY + manifoldD * 0.5,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(80, 180, 90, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(secTankOutX + 0.4 * zoom, secTankOutY - 0.6 * zoom);
  ctx.quadraticCurveTo(
    secTankOutX - 1.6 * zoom,
    manifoldY + 4.4 * zoom,
    manifoldX + manifoldW * 0.3 + 0.4 * zoom,
    manifoldY + manifoldD * 0.5 - 0.6 * zoom,
  );
  ctx.stroke();

  // --- Pilot gas tube (thin, blue — from main tank cap to igniter) ---
  ctx.strokeStyle = "#222838";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(tankCX + 3 * zoom, tankTopCapY + 1 * zoom);
  ctx.bezierCurveTo(
    tankCX + 10 * zoom,
    tankTopCapY - 4 * zoom,
    igniterInX - 6 * zoom,
    igniterInY - 8 * zoom,
    igniterInX - 3 * zoom,
    igniterInY - 2 * zoom,
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(80, 120, 200, 0.2)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(tankCX + 3 * zoom, tankTopCapY + 0.3 * zoom);
  ctx.bezierCurveTo(
    tankCX + 10 * zoom,
    tankTopCapY - 4.7 * zoom,
    igniterInX - 6 * zoom,
    igniterInY - 8.7 * zoom,
    igniterInX - 3 * zoom,
    igniterInY - 2.7 * zoom,
  );
  ctx.stroke();

  // --- Tube clamps on primary fuel line ---
  for (let tc = 0; tc < 2; tc++) {
    const clampT = 0.3 + tc * 0.35;
    const clX =
      (1 - clampT) * (1 - clampT) * mainTankOutX +
      2 * (1 - clampT) * clampT * (mainTankOutX + 4 * zoom) +
      clampT * clampT * (manifoldX - manifoldW * 0.35);
    const clY =
      (1 - clampT) * (1 - clampT) * mainTankOutY +
      2 * (1 - clampT) * clampT * (manifoldY + 4 * zoom) +
      clampT * clampT * (manifoldY + manifoldD * 0.5);
    ctx.fillStyle = "#5a5a68";
    ctx.beginPath();
    ctx.ellipse(clX, clY, 3 * zoom, 2.2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a3a45";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    // Clamp bolt
    ctx.fillStyle = "#7a7a88";
    ctx.beginPath();
    ctx.arc(clX + 1.5 * zoom, clY - 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Tube clamp on oxidizer line ---
  {
    const oxClampT = 0.45;
    const oxClX =
      (1 - oxClampT) * (1 - oxClampT) * secTankOutX +
      2 * (1 - oxClampT) * oxClampT * (secTankOutX - 2 * zoom) +
      oxClampT * oxClampT * (manifoldX + manifoldW * 0.3);
    const oxClY =
      (1 - oxClampT) * (1 - oxClampT) * secTankOutY +
      2 * (1 - oxClampT) * oxClampT * (manifoldY + 5 * zoom) +
      oxClampT * oxClampT * (manifoldY + manifoldD * 0.5);
    ctx.fillStyle = "#5a5a68";
    ctx.beginPath();
    ctx.ellipse(oxClX, oxClY, 2.5 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a3a45";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }

  // === VALVE MANIFOLD BLOCK ===
  {
    // 3D block: top face
    const mTopGrad = ctx.createLinearGradient(
      manifoldX - manifoldW * 0.5,
      manifoldY - manifoldH,
      manifoldX + manifoldW * 0.5,
      manifoldY - manifoldH,
    );
    mTopGrad.addColorStop(0, "#505058");
    mTopGrad.addColorStop(0.4, "#5e5e66");
    mTopGrad.addColorStop(1, "#48484f");
    ctx.fillStyle = mTopGrad;
    ctx.beginPath();
    ctx.moveTo(manifoldX, manifoldY - manifoldH - manifoldD);
    ctx.lineTo(manifoldX + manifoldW * 0.5, manifoldY - manifoldH - manifoldD * 0.4);
    ctx.lineTo(manifoldX, manifoldY - manifoldH + manifoldD * 0.2);
    ctx.lineTo(manifoldX - manifoldW * 0.5, manifoldY - manifoldH - manifoldD * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#5a5a65";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Left face
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.moveTo(manifoldX - manifoldW * 0.5, manifoldY - manifoldH - manifoldD * 0.4);
    ctx.lineTo(manifoldX, manifoldY - manifoldH + manifoldD * 0.2);
    ctx.lineTo(manifoldX, manifoldY + manifoldD * 0.2);
    ctx.lineTo(manifoldX - manifoldW * 0.5, manifoldY - manifoldD * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Right face
    ctx.fillStyle = "#44444c";
    ctx.beginPath();
    ctx.moveTo(manifoldX + manifoldW * 0.5, manifoldY - manifoldH - manifoldD * 0.4);
    ctx.lineTo(manifoldX, manifoldY - manifoldH + manifoldD * 0.2);
    ctx.lineTo(manifoldX, manifoldY + manifoldD * 0.2);
    ctx.lineTo(manifoldX + manifoldW * 0.5, manifoldY - manifoldD * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Inlet port circles on the block faces
    // Primary inlet (left face)
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.ellipse(
      manifoldX - manifoldW * 0.22,
      manifoldY - manifoldH * 0.45,
      1.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#5a5a65";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Secondary inlet (right face)
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.ellipse(
      manifoldX + manifoldW * 0.22,
      manifoldY - manifoldH * 0.45,
      1.5 * zoom,
      1.2 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.strokeStyle = "#5a5a65";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Valve handle on top
    const handleY = manifoldY - manifoldH - manifoldD * 0.8;
    ctx.strokeStyle = "#6a6a78";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(manifoldX - 2 * zoom, handleY);
    ctx.lineTo(manifoldX + 2 * zoom, handleY);
    ctx.stroke();
    // Handle knob
    ctx.fillStyle = "#dd3030";
    ctx.beginPath();
    ctx.arc(manifoldX, handleY, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 120, 120, 0.35)";
    ctx.beginPath();
    ctx.arc(manifoldX - 0.4 * zoom, handleY - 0.4 * zoom, 0.7 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Bolts on manifold top face corners
    const mBolts = [
      { x: manifoldX - manifoldW * 0.35, y: manifoldY - manifoldH - manifoldD * 0.3 },
      { x: manifoldX + manifoldW * 0.35, y: manifoldY - manifoldH - manifoldD * 0.3 },
      { x: manifoldX, y: manifoldY - manifoldH + manifoldD * 0.05 },
    ];
    for (const bolt of mBolts) {
      ctx.fillStyle = "#58585e";
      ctx.beginPath();
      ctx.arc(bolt.x, bolt.y, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(140, 140, 155, 0.3)";
      ctx.beginPath();
      ctx.arc(bolt.x - 0.2 * zoom, bolt.y - 0.2 * zoom, 0.4 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === INLINE FUEL PUMP (between manifold and igniter) ===
  {
    const pumpX = manifoldX - 1 * zoom;
    const pumpY = manifoldY - manifoldH - 3 * zoom;
    const pumpR = 4 * zoom;

    // Feed tube from manifold top to pump
    ctx.strokeStyle = "#3a2828";
    ctx.lineWidth = 3 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(manifoldX, manifoldY - manifoldH - manifoldD * 0.5);
    ctx.lineTo(pumpX, pumpY + pumpR * 0.5);
    ctx.stroke();

    // Pump cylindrical housing (bottom ellipse of body)
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(
      pumpX,
      pumpY + 2 * zoom,
      pumpR,
      pumpR * 0.5,
      0,
      0,
      Math.PI,
      false,
    );
    ctx.lineTo(pumpX - pumpR, pumpY - 1 * zoom);
    ctx.ellipse(
      pumpX,
      pumpY - 1 * zoom,
      pumpR,
      pumpR * 0.5,
      0,
      Math.PI,
      Math.PI * 2,
      false,
    );
    ctx.closePath();
    ctx.fill();

    // Pump body gradient
    const pumpGrad = ctx.createLinearGradient(
      pumpX - pumpR,
      pumpY,
      pumpX + pumpR,
      pumpY,
    );
    pumpGrad.addColorStop(0, "#353540");
    pumpGrad.addColorStop(0.35, "#4a4a55");
    pumpGrad.addColorStop(0.65, "#555560");
    pumpGrad.addColorStop(1, "#3a3a42");
    ctx.fillStyle = pumpGrad;
    ctx.beginPath();
    ctx.ellipse(
      pumpX,
      pumpY + 2 * zoom,
      pumpR,
      pumpR * 0.5,
      0,
      0,
      Math.PI,
      false,
    );
    ctx.lineTo(pumpX - pumpR, pumpY - 1 * zoom);
    ctx.ellipse(
      pumpX,
      pumpY - 1 * zoom,
      pumpR,
      pumpR * 0.5,
      0,
      Math.PI,
      Math.PI * 2,
      false,
    );
    ctx.closePath();
    ctx.fill();

    // Pump top cap
    const pTopGrad = ctx.createRadialGradient(
      pumpX - 1 * zoom,
      pumpY - 1 * zoom,
      0,
      pumpX,
      pumpY - 1 * zoom,
      pumpR,
    );
    pTopGrad.addColorStop(0, "#5a5a65");
    pTopGrad.addColorStop(0.5, "#4e4e58");
    pTopGrad.addColorStop(1, "#3a3a45");
    ctx.fillStyle = pTopGrad;
    ctx.beginPath();
    ctx.ellipse(pumpX, pumpY - 1 * zoom, pumpR, pumpR * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a68";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Motor housing (small cylinder on the side)
    const motorX = pumpX + pumpR * 0.8;
    const motorY = pumpY;
    ctx.fillStyle = "#44444c";
    ctx.beginPath();
    ctx.ellipse(motorX, motorY, 2.5 * zoom, 2 * zoom, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a65";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    // Motor shaft dot
    ctx.fillStyle = "#7a7a88";
    ctx.beginPath();
    ctx.arc(motorX, motorY, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Spinning indicator on pump cap (shows it's running)
    const pumpSpin = time * 4;
    ctx.strokeStyle = "rgba(100, 100, 115, 0.5)";
    ctx.lineWidth = 0.7 * zoom;
    for (let ps = 0; ps < 3; ps++) {
      const psAngle = pumpSpin + (ps / 3) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(pumpX, pumpY - 1 * zoom);
      ctx.lineTo(
        pumpX + Math.cos(psAngle) * pumpR * 0.7,
        pumpY - 1 * zoom + Math.sin(psAngle) * pumpR * 0.35,
      );
      ctx.stroke();
    }
    // Center hub
    ctx.fillStyle = "#4a4a55";
    ctx.beginPath();
    ctx.arc(pumpX, pumpY - 1 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Feed tube from pump to igniter
    ctx.strokeStyle = "#3a2828";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(pumpX, pumpY - 1 * zoom - pumpR * 0.5);
    ctx.quadraticCurveTo(
      pumpX - 2 * zoom,
      igniterInY + 2 * zoom,
      igniterInX,
      igniterInY + 2 * zoom,
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(180, 80, 70, 0.2)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(pumpX + 0.4 * zoom, pumpY - 1 * zoom - pumpR * 0.5 - 0.6 * zoom);
    ctx.quadraticCurveTo(
      pumpX - 1.6 * zoom,
      igniterInY + 1.4 * zoom,
      igniterInX + 0.4 * zoom,
      igniterInY + 1.4 * zoom,
    );
    ctx.stroke();

    // Oxidizer tube from manifold to igniter (goes around the other side)
    ctx.strokeStyle = "#1a3320";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(manifoldX + manifoldW * 0.25, manifoldY - manifoldH - manifoldD * 0.3);
    ctx.bezierCurveTo(
      manifoldX + manifoldW * 0.6,
      manifoldY - manifoldH - 5 * zoom,
      igniterInX + 6 * zoom,
      igniterInY + 3 * zoom,
      igniterInX + 3 * zoom,
      igniterInY + 1 * zoom,
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(80, 180, 90, 0.15)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(manifoldX + manifoldW * 0.25 + 0.3 * zoom, manifoldY - manifoldH - manifoldD * 0.3 - 0.5 * zoom);
    ctx.bezierCurveTo(
      manifoldX + manifoldW * 0.6 + 0.3 * zoom,
      manifoldY - manifoldH - 5.5 * zoom,
      igniterInX + 6.3 * zoom,
      igniterInY + 2.5 * zoom,
      igniterInX + 3.3 * zoom,
      igniterInY + 0.5 * zoom,
    );
    ctx.stroke();
  }

  // === PRESSURE REGULATOR FITTING (on output tube near igniter) ===
  {
    const regX = igniterInX - 1 * zoom;
    const regY = igniterInY + 4 * zoom;
    // Hex nut body
    ctx.fillStyle = "#50505a";
    const regR = 2.5 * zoom;
    ctx.beginPath();
    for (let rh = 0; rh < 6; rh++) {
      const a = (rh / 6) * Math.PI * 2 - Math.PI / 6;
      const rx = regX + Math.cos(a) * regR;
      const ry = regY + Math.sin(a) * regR * 0.65;
      if (rh === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a3a45";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    // Central bore
    ctx.fillStyle = "#2a2a32";
    ctx.beginPath();
    ctx.arc(regX, regY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === 3D IGNITER HOUSING (isometric cylinder) ===
  const igniterY = turretY - 10 * zoom;
  const igniterRX = 10 * zoom;
  const igniterRY = 7 * zoom;
  const igniterH = 4 * zoom;

  const ignGrad = ctx.createLinearGradient(
    turretX - igniterRX,
    igniterY,
    turretX + igniterRX,
    igniterY,
  );
  ignGrad.addColorStop(0, "#353540");
  ignGrad.addColorStop(0.3, "#4a4a52");
  ignGrad.addColorStop(0.6, "#555560");
  ignGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = ignGrad;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    igniterY + igniterH,
    igniterRX,
    igniterRY,
    0,
    0,
    Math.PI,
    false,
  );
  ctx.lineTo(turretX - igniterRX, igniterY);
  ctx.ellipse(
    turretX,
    igniterY,
    igniterRX,
    igniterRY,
    0,
    Math.PI,
    Math.PI * 2,
    false,
  );
  ctx.closePath();
  ctx.fill();

  // Bottom edge of housing
  ctx.strokeStyle = "#2a2a32";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    igniterY + igniterH,
    igniterRX,
    igniterRY,
    0,
    0,
    Math.PI,
    false,
  );
  ctx.stroke();

  // Housing top cap with radial shading
  const ignTopGrad = ctx.createRadialGradient(
    turretX - 2 * zoom,
    igniterY,
    0,
    turretX,
    igniterY,
    igniterRX,
  );
  ignTopGrad.addColorStop(0, "#5a5a62");
  ignTopGrad.addColorStop(0.5, "#4a4a52");
  ignTopGrad.addColorStop(1, "#3a3a42");
  ctx.fillStyle = ignTopGrad;
  ctx.beginPath();
  ctx.ellipse(turretX, igniterY, igniterRX, igniterRY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // === ROTATING FLAME DEFLECTOR SHIELDS with 3D plate thickness ===
  const flameShieldCount = 5;
  const shieldThickness = 2.5 * zoom;
  for (let i = 0; i < flameShieldCount; i++) {
    const baseAngle = (i / flameShieldCount) * Math.PI * 2;
    const shieldAngle = rotation + baseAngle;

    const shieldDepth = Math.cos(shieldAngle);
    const shieldSide = Math.sin(shieldAngle);
    const visibility = 0.55 + shieldDepth * 0.35;

    if (shieldDepth > -0.55) {
      const innerR = 5 * zoom;
      const outerR = 9 * zoom;
      const angleSpan = Math.PI / 2.8;

      const p0x = turretX + Math.cos(shieldAngle - angleSpan * 0.4) * innerR;
      const p0y =
        igniterY + Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.7;
      const p1x = turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR;
      const p1y =
        igniterY +
        Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.7 -
        2 * zoom;
      const p2x = turretX + Math.cos(shieldAngle) * (outerR + 1.5 * zoom);
      const p2y =
        igniterY +
        Math.sin(shieldAngle) * (outerR + 1.5 * zoom) * 0.7 -
        2.5 * zoom;
      const p3x = turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR;
      const p3y =
        igniterY +
        Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.7 -
        2 * zoom;
      const p4x = turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR;
      const p4y =
        igniterY + Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.7;

      // Side/thickness face — outer edge extends downward
      const edgeVisible = shieldSide > -0.3;
      if (edgeVisible) {
        const sideGrad = ctx.createLinearGradient(
          p2x,
          p2y,
          p2x,
          p2y + shieldThickness,
        );
        sideGrad.addColorStop(0, `rgba(70, 55, 45, ${visibility})`);
        sideGrad.addColorStop(1, `rgba(50, 40, 35, ${visibility})`);
        ctx.fillStyle = sideGrad;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p3x, p3y + shieldThickness);
        ctx.lineTo(p2x, p2y + shieldThickness);
        ctx.lineTo(p1x, p1y + shieldThickness);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(100, 75, 60, ${visibility * 0.4})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.stroke();
      }

      // Front face
      const shieldGrad = ctx.createLinearGradient(
        turretX + Math.cos(shieldAngle - angleSpan * 0.3) * outerR,
        igniterY + Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.7,
        turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
        igniterY + Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.7,
      );

      if (shieldSide < 0) {
        shieldGrad.addColorStop(0, `rgba(140, 100, 80, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(110, 80, 65, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(80, 60, 50, ${visibility})`);
      } else {
        shieldGrad.addColorStop(0, `rgba(90, 70, 55, ${visibility})`);
        shieldGrad.addColorStop(0.5, `rgba(100, 75, 60, ${visibility})`);
        shieldGrad.addColorStop(1, `rgba(80, 60, 50, ${visibility})`);
      }

      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.lineTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.lineTo(p4x, p4y);
      ctx.closePath();
      ctx.fill();

      // Heat-scorched edge
      ctx.strokeStyle = `rgba(180, 120, 80, ${visibility * 0.5})`;
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();

      // Top edge highlight for depth
      ctx.strokeStyle = `rgba(200, 160, 120, ${visibility * 0.4})`;
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(p1x, p1y);
      ctx.lineTo(p2x, p2y);
      ctx.lineTo(p3x, p3y);
      ctx.stroke();

      // Rivet with highlight
      const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 1.5 * zoom);
      const rivetY =
        igniterY +
        Math.sin(shieldAngle) * (outerR - 1.5 * zoom) * 0.7 -
        1.5 * zoom;
      ctx.fillStyle = `rgba(60, 50, 40, ${visibility})`;
      ctx.beginPath();
      ctx.arc(rivetX, rivetY, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(120, 100, 80, ${visibility * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        rivetX - 0.3 * zoom,
        rivetY - 0.3 * zoom,
        0.6 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Inner igniter ring
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(turretX, igniterY, 6 * zoom, 4.5 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();

  // === IGNITION COIL / TRANSFORMER ===
  {
    const coilX = turretX + 10 * zoom;
    const coilY = igniterY - 3 * zoom;
    const coilW = 4 * zoom;
    const coilH = 6 * zoom;

    // Coil housing (dark box)
    ctx.fillStyle = "#2a2a35";
    ctx.save();
    ctx.translate(coilX, coilY);
    ctx.beginPath();
    ctx.rect(-coilW * 0.5, -coilH * 0.5, coilW, coilH);
    ctx.fill();
    ctx.strokeStyle = "#3a3a45";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    ctx.restore();

    // Copper winding coils (visible wire loops)
    ctx.strokeStyle = "#b87333";
    ctx.lineWidth = 0.8 * zoom;
    const coilCount = 5;
    for (let cw = 0; cw < coilCount; cw++) {
      const cwY = coilY - coilH * 0.35 + (cw / (coilCount - 1)) * coilH * 0.7;
      ctx.beginPath();
      ctx.ellipse(
        coilX,
        cwY,
        coilW * 0.55,
        1.2 * zoom,
        0,
        0,
        Math.PI,
        false,
      );
      ctx.stroke();
    }
    // Copper highlight
    ctx.strokeStyle = "rgba(220, 160, 80, 0.3)";
    ctx.lineWidth = 0.4 * zoom;
    for (let cw = 0; cw < coilCount; cw++) {
      const cwY = coilY - coilH * 0.35 + (cw / (coilCount - 1)) * coilH * 0.7;
      ctx.beginPath();
      ctx.ellipse(
        coilX,
        cwY - 0.3 * zoom,
        coilW * 0.5,
        0.8 * zoom,
        0,
        0.3,
        Math.PI - 0.3,
        false,
      );
      ctx.stroke();
    }

    // Terminal posts on top
    ctx.fillStyle = "#8a8a95";
    ctx.beginPath();
    ctx.arc(coilX - 1.2 * zoom, coilY - coilH * 0.5 - 1 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(coilX + 1.2 * zoom, coilY - coilH * 0.5 - 1 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Wiring harness from coil to igniter center
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(coilX - 1.2 * zoom, coilY - coilH * 0.5 - 1 * zoom);
    ctx.quadraticCurveTo(
      turretX + 5 * zoom,
      igniterY - 5 * zoom,
      turretX + 2 * zoom,
      igniterY - 1 * zoom,
    );
    ctx.stroke();
    // Second wire
    ctx.strokeStyle = "#882222";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(coilX + 1.2 * zoom, coilY - coilH * 0.5 - 1 * zoom);
    ctx.quadraticCurveTo(
      turretX + 7 * zoom,
      igniterY - 6 * zoom,
      turretX + 3 * zoom,
      igniterY,
    );
    ctx.stroke();

    // Spark indicator near coil (flickering)
    const sparkAlpha = 0.3 + Math.sin(time * 15) * 0.2;
    ctx.fillStyle = `rgba(100, 180, 255, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(
      coilX - 1.2 * zoom,
      coilY - coilH * 0.5 - 1 * zoom,
      1.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === WIRING CONDUIT (bundled cable run along the housing) ===
  {
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(turretX - 8 * zoom, igniterY + 2 * zoom);
    ctx.quadraticCurveTo(
      turretX - 4 * zoom,
      igniterY + 5 * zoom,
      turretX + 2 * zoom,
      igniterY + 3 * zoom,
    );
    ctx.stroke();
    // Conduit highlight
    ctx.strokeStyle = "rgba(80, 80, 90, 0.3)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(turretX - 8 * zoom, igniterY + 1.4 * zoom);
    ctx.quadraticCurveTo(
      turretX - 4 * zoom,
      igniterY + 4.4 * zoom,
      turretX + 2 * zoom,
      igniterY + 2.4 * zoom,
    );
    ctx.stroke();
    // Cable ties
    for (const tieT of [0.3, 0.7]) {
      const u = 1 - tieT;
      const tieX =
        u * u * (turretX - 8 * zoom) +
        2 * u * tieT * (turretX - 4 * zoom) +
        tieT * tieT * (turretX + 2 * zoom);
      const tieY =
        u * u * (igniterY + 2 * zoom) +
        2 * u * tieT * (igniterY + 5 * zoom) +
        tieT * tieT * (igniterY + 3 * zoom);
      ctx.fillStyle = "#4a4a55";
      ctx.beginPath();
      ctx.ellipse(tieX, tieY, 1.5 * zoom, 2.2 * zoom, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Nozzle mounting collar with depth ring
  const nozzleCollarX = turretX + cosR * 4 * zoom;
  const nozzleCollarY = igniterY + sinR * 2.5 * zoom;
  ctx.fillStyle = "#333338";
  ctx.beginPath();
  ctx.ellipse(
    nozzleCollarX,
    nozzleCollarY + 1.5 * zoom,
    5.5 * zoom,
    4 * zoom,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    nozzleCollarX,
    nozzleCollarY,
    5 * zoom,
    3.5 * zoom,
    rotation,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#5a5a62";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Pilot flame indicator
  const flameGlow = timeSinceFire < 300 ? 0.8 : 0.5 + Math.sin(time * 6) * 0.2;
  const flameGrad = ctx.createRadialGradient(
    turretX,
    igniterY,
    0,
    turretX,
    igniterY,
    3.5 * zoom,
  );
  flameGrad.addColorStop(0, `rgba(255, 200, 100, ${flameGlow})`);
  flameGrad.addColorStop(0.4, `rgba(255, 140, 50, ${flameGlow * 0.7})`);
  flameGrad.addColorStop(0.8, `rgba(255, 80, 20, ${flameGlow * 0.4})`);
  flameGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.arc(turretX, igniterY, 3 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // === 3D ISOMETRIC FUEL TANK (LEFT) AND ARMOR PLATE (RIGHT) ===
  const isAttacking = timeSinceFire < 300;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 300 : 0;

  const tankAngle = rotation + Math.PI * 0.5;
  const tankDistance = 24 * zoom;
  const tankCenterX = turretX + Math.cos(tankAngle) * tankDistance;
  const tankCenterY =
    turretY - 6 * zoom + Math.sin(tankAngle) * tankDistance * 0.5;

  const plateAngle = rotation - Math.PI * 0.5;
  const plateDistance = 22 * zoom;
  const plateCenterX = turretX + Math.cos(plateAngle) * plateDistance;
  const plateCenterY =
    turretY - 8 * zoom + Math.sin(plateAngle) * plateDistance * 0.5;

  const facingPlayer = sinR > 0.2;
  const tankBehindAll = facingPlayer || Math.sin(tankAngle) < 0;
  const plateBehindAll = facingPlayer || Math.sin(plateAngle) < 0;

  const tankSide = Math.sin(tankAngle);
  const tankVisible = true;
  const plateVisible = true;

  const towerId = tower.id;

  if (tankBehindAll && tankVisible) {
    draw3DFuelTank(
      ctx,
      tankCenterX,
      tankCenterY,
      tankAngle,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
    drawFuelFeedingTube(
      ctx,
      tankCenterX,
      tankCenterY,
      turretX,
      turretY - 8 * zoom,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      tankSide,
    );
  }
  if (plateBehindAll && plateVisible) {
    draw3DArmorShield(
      ctx,
      plateCenterX,
      plateCenterY,
      plateAngle,
      zoom,
      towerId,
      "small",
    );
  }

  if (!facingAway) {
    drawFlamethrowerNozzle(
      ctx,
      turretX,
      turretY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time,
      recoilOffset,
    );
  }

  if (!tankBehindAll && tankVisible) {
    draw3DFuelTank(
      ctx,
      tankCenterX,
      tankCenterY,
      tankAngle,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small",
    );
    drawFuelFeedingTube(
      ctx,
      tankCenterX,
      tankCenterY,
      turretX,
      turretY - 8 * zoom,
      rotation,
      zoom,
      time,
      isAttacking,
      attackPulse,
      tankSide,
    );
  }
  if (!plateBehindAll && plateVisible) {
    draw3DArmorShield(
      ctx,
      plateCenterX,
      plateCenterY,
      plateAngle,
      zoom,
      towerId,
      "small",
    );
  }
}

// Helper for flamethrower nozzle — 3D hex prism barrel with heat gradient
export function drawFlamethrowerNozzle(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  rotation: number,
  foreshorten: number,
  zoom: number,
  tower: Tower,
  time: number,
  recoilOffset: number = 0,
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);

  // Isometric basis vectors
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;

  // Pitch
  const towerElevation = 25 * zoom;
  const baseLength = 35 * zoom;
  const pitch = calculateBarrelPitch(towerElevation, baseLength);
  const pitchRate = Math.sin(pitch) * 0.5;

  const totalLen = baseLength * (0.5 + foreshorten * 0.5);

  const axisPoint = (dist: number) => ({
    x: pivotX - fwdX * recoilOffset + fwdX * dist,
    y: pivotY - fwdY * recoilOffset + fwdY * dist + dist * pitchRate,
  });

  const isoOff = (lat: number, vert: number) => ({
    x: perpX * lat,
    y: perpY * lat - vert,
  });

  // Barrel geometry
  const hexR = 5 * zoom;
  const hexSides = 6;
  const facingFwd = fwdY >= 0;

  const hexVerts = generateIsoHexVertices(isoOff, hexR, hexSides);
  const taperScale = 0.85;
  const taperVerts = scaleVerts(hexVerts, taperScale);

  // Sections along barrel axis
  const startDist = 0;
  const hexLen = totalLen * 0.72;
  const muzzleLen = totalLen * 0.28;

  const hexBackPt = axisPoint(startDist);
  const hexFrontPt = axisPoint(startDist + hexLen);
  const muzzleBackPt = hexFrontPt;
  const muzzleEndPt = axisPoint(startDist + hexLen + muzzleLen);

  const sideNormals = computeHexSideNormals(cosR, hexSides);

  // Flared muzzle vertices
  const muzzleScale = 1.35;
  const muzzleVerts = scaleVerts(taperVerts, muzzleScale);
  const muzzleTipVerts = scaleVerts(taperVerts, muzzleScale * 1.15);

  // Fuel line from pivot to barrel base
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(pivotX - 4 * zoom, pivotY);
  ctx.quadraticCurveTo(
    pivotX + fwdX * 6 * zoom,
    pivotY + fwdY * 6 * zoom - 4 * zoom,
    hexBackPt.x + fwdX * 4 * zoom,
    hexBackPt.y + fwdY * 4 * zoom,
  );
  ctx.stroke();

  // === RECOILING BREECH CAGE — standalone box behind nozzle ===
  {
    const timeSinceFire = Date.now() - tower.lastAttack;
    const cageSides = 6;
    const cageLen = 8 * zoom;
    const cageR = hexR * 1.4;
    const cageGap = 3 * zoom;

    // Punchy recoil
    let cageRecoil = 0;
    if (timeSinceFire < 200) {
      const cPhase = timeSinceFire / 200;
      cageRecoil =
        cPhase < 0.12
          ? (cPhase / 0.12) * 7 * zoom
          : 7 * zoom * (1 - (cPhase - 0.12) / 0.88);
    }

    // Cage is offset behind the barrel start with a visible gap
    const cageFrontPt = {
      x: axisPoint(startDist).x - fwdX * cageGap,
      y: axisPoint(startDist).y - fwdY * cageGap,
    };
    const cageBackPt = {
      x: cageFrontPt.x - fwdX * (cageLen + cageRecoil),
      y: cageFrontPt.y - fwdY * (cageLen + cageRecoil) - cageLen * pitchRate,
    };

    const cageVerts = generateIsoHexVertices(isoOff, cageR, cageSides);
    const cageSideNormals = computeHexSideNormals(cosR, cageSides);
    const cageFacingFwd = fwdY >= 0;

    // --- Draw back face (breech cap) ---
    const drawBreechCap = () => {
      const capPt = cageFacingFwd ? cageBackPt : cageFrontPt;
      drawHexCap(
        ctx,
        capPt,
        cageVerts,
        cageFacingFwd ? "#4a4a55" : "#5a5a65",
        "#3a3a45",
        0.7 * zoom,
      );

      // Breech cap bolts at vertices
      ctx.fillStyle = "#6a6a78";
      const boltVerts = scaleVerts(cageVerts, 0.7);
      for (let i = 0; i < cageSides; i++) {
        ctx.beginPath();
        ctx.arc(
          capPt.x + boltVerts[i].x,
          capPt.y + boltVerts[i].y,
          1.3 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      // Central breech plate (smaller hex inset)
      drawHexCap(
        ctx,
        capPt,
        scaleVerts(cageVerts, 0.45),
        "#555560",
        "#48484e",
        0.5 * zoom,
      );
    };

    // --- Draw front face ---
    const drawFrontFace = () => {
      const facePt = cageFacingFwd ? cageFrontPt : cageBackPt;
      drawHexCap(
        ctx,
        facePt,
        cageVerts,
        cageFacingFwd ? "#5a5a65" : "#4a4a55",
        "#3a3a45",
        0.6 * zoom,
      );

      // Barrel opening hole (dark circle in center)
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.arc(facePt.x, facePt.y, cageR * 0.35, 0, Math.PI * 2);
      ctx.fill();
    };

    // --- Draw side faces (depth-sorted) ---
    const drawSideFaces = () => {
      const sortedSides = sortSidesByDepth(cageSideNormals);

      for (const i of sortedSides) {
        const ni = (i + 1) % cageSides;
        const normal = cageSideNormals[i];
        const v0 = cageVerts[i];
        const v1 = cageVerts[ni];

        const lit = Math.max(0.15, 0.25 + Math.max(0, normal) * 0.55);
        const rc = Math.floor(50 + lit * 55);
        const gc = Math.floor(50 + lit * 52);
        const bc = Math.floor(55 + lit * 60);

        ctx.fillStyle = `rgb(${rc}, ${gc}, ${bc})`;
        ctx.beginPath();
        ctx.moveTo(cageBackPt.x + v0.x, cageBackPt.y + v0.y);
        ctx.lineTo(cageBackPt.x + v1.x, cageBackPt.y + v1.y);
        ctx.lineTo(cageFrontPt.x + v1.x, cageFrontPt.y + v1.y);
        ctx.lineTo(cageFrontPt.x + v0.x, cageFrontPt.y + v0.y);
        ctx.closePath();
        ctx.fill();

        // Edge line
        ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.15})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.stroke();

        // Cage bar groove lines on visible faces
        if (normal > 0.1) {
          const grooveT1 = 0.33;
          const grooveT2 = 0.66;
          ctx.strokeStyle = `rgba(30, 30, 40, 0.25)`;
          ctx.lineWidth = 0.5 * zoom;
          for (const gt of [grooveT1, grooveT2]) {
            const gv = {
              x: v0.x + (v1.x - v0.x) * gt,
              y: v0.y + (v1.y - v0.y) * gt,
            };
            ctx.beginPath();
            ctx.moveTo(cageBackPt.x + gv.x, cageBackPt.y + gv.y);
            ctx.lineTo(cageFrontPt.x + gv.x, cageFrontPt.y + gv.y);
            ctx.stroke();
          }

          // Highlight edge
          if (normal > 0.3) {
            ctx.strokeStyle = `rgba(150, 150, 165, ${(normal - 0.3) * 0.3})`;
            ctx.lineWidth = 0.4 * zoom;
            ctx.beginPath();
            ctx.moveTo(cageFrontPt.x + v0.x, cageFrontPt.y + v0.y);
            ctx.lineTo(cageBackPt.x + v0.x, cageBackPt.y + v0.y);
            ctx.stroke();
          }
        }
      }
    };

    // Render faces in correct depth order
    if (cageFacingFwd) {
      drawBreechCap();
      drawSideFaces();
      drawFrontFace();
    } else {
      drawFrontFace();
      drawSideFaces();
      drawBreechCap();
    }

    // Piston rods connecting cage to nozzle (visible in the gap)
    for (const side of [-1, 1]) {
      const pistonV = isoOff(side * cageR * 0.5, 0);
      const rodFront = {
        x: cageFrontPt.x + pistonV.x,
        y: cageFrontPt.y + pistonV.y,
      };
      const rodBack = {
        x: axisPoint(startDist).x + pistonV.x,
        y: axisPoint(startDist).y + pistonV.y,
      };
      // Outer sleeve
      ctx.strokeStyle = "#6a6a75";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(rodFront.x, rodFront.y);
      ctx.lineTo(rodBack.x, rodBack.y);
      ctx.stroke();
      // Inner piston rod (bright)
      ctx.strokeStyle = "#9a9aaa";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(rodFront.x, rodFront.y);
      ctx.lineTo(rodBack.x, rodBack.y);
      ctx.stroke();
    }
  }

  // === HEXAGONAL BARREL BODY — depth-sorted side quads with heat gradient ===
  const sortedSides = sortSidesByDepth(sideNormals);

  for (const i of sortedSides) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];

    const v0 = hexVerts[i];
    const v1 = hexVerts[ni];
    const tv0 = taperVerts[i];
    const tv1 = taperVerts[ni];

    const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);

    // Heat gradient: dark steel at base → scorched orange/red near tip
    const sGrad = ctx.createLinearGradient(
      hexBackPt.x + v0.x,
      hexBackPt.y + v0.y,
      hexFrontPt.x + tv0.x,
      hexFrontPt.y + tv0.y,
    );
    const baseRC = Math.floor(55 + lit * 60);
    const baseGC = Math.floor(55 + lit * 58);
    const baseBC = Math.floor(60 + lit * 62);
    const tipRC = Math.floor(100 + lit * 80);
    const tipGC = Math.floor(50 + lit * 40);
    const tipBC = Math.floor(30 + lit * 20);

    sGrad.addColorStop(0, `rgb(${baseRC}, ${baseGC}, ${baseBC})`);
    sGrad.addColorStop(
      0.55,
      `rgb(${baseRC + 8}, ${baseGC - 4}, ${baseBC - 8})`,
    );
    sGrad.addColorStop(0.8, `rgb(${tipRC}, ${tipGC}, ${tipBC})`);
    sGrad.addColorStop(1, `rgb(${tipRC + 15}, ${tipGC - 5}, ${tipBC - 10})`);

    ctx.fillStyle = sGrad;
    ctx.beginPath();
    ctx.moveTo(hexBackPt.x + v0.x, hexBackPt.y + v0.y);
    ctx.lineTo(hexBackPt.x + v1.x, hexBackPt.y + v1.y);
    ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
    ctx.lineTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    if (normal > 0.25) {
      ctx.strokeStyle = `rgba(180, 140, 120, ${(normal - 0.25) * 0.4})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexFrontPt.x + tv0.x, hexFrontPt.y + tv0.y);
      ctx.lineTo(hexFrontPt.x + tv1.x, hexFrontPt.y + tv1.y);
      ctx.stroke();
    }

    // Heat conduit glow on visible faces
    if (normal > -0.3) {
      const conduitGlow = 0.4 + Math.sin(time * 5) * 0.2;
      const midV0x = (v0.x + v1.x) * 0.5;
      const midV0y = (v0.y + v1.y) * 0.5;
      const midTV0x = (tv0.x + tv1.x) * 0.5;
      const midTV0y = (tv0.y + tv1.y) * 0.5;
      ctx.strokeStyle = `rgba(255, 80, 20, ${conduitGlow * Math.max(0.15, 0.3 + normal * 0.5)})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(hexBackPt.x + midV0x, hexBackPt.y + midV0y);
      ctx.lineTo(hexFrontPt.x + midTV0x, hexFrontPt.y + midTV0y);
      ctx.stroke();
    }
  }

  // === 3D HEX RING BANDS along barrel ===
  const bandCount = 3;
  const bandThick = 2.5 * zoom;
  for (let b = 0; b < bandCount; b++) {
    const t = (b + 1) / (bandCount + 1);
    const bandFrontPt = axisPoint(startDist + hexLen * t + bandThick * 0.5);
    const bandBackPt2 = axisPoint(startDist + hexLen * t - bandThick * 0.5);
    const bScale = 1 + (taperScale - 1) * t;
    const bVerts = hexVerts.map((v) => ({
      x: v.x * bScale * 1.08,
      y: v.y * bScale * 1.08,
    }));

    const bandSorted = Array.from({ length: hexSides }, (_, i) => i).sort(
      (a, bb) => sideNormals[a] - sideNormals[bb],
    );

    for (const i of bandSorted) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];
      if (normal < -0.15) continue;

      const v0b = bVerts[i];
      const v1b = bVerts[ni];

      const bLit = Math.max(0.2, 0.3 + Math.max(0, normal) * 0.5);
      const gc = Math.floor(90 + bLit * 50);

      ctx.fillStyle = `rgb(${gc}, ${gc}, ${gc + 6})`;
      ctx.beginPath();
      ctx.moveTo(bandBackPt2.x + v0b.x, bandBackPt2.y + v0b.y);
      ctx.lineTo(bandBackPt2.x + v1b.x, bandBackPt2.y + v1b.y);
      ctx.lineTo(bandFrontPt.x + v1b.x, bandFrontPt.y + v1b.y);
      ctx.lineTo(bandFrontPt.x + v0b.x, bandFrontPt.y + v0b.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(25, 25, 35, ${0.2 + Math.max(0, normal) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    // Band hex cap (visible face)
    const capPt2 = facingFwd ? bandFrontPt : bandBackPt2;
    ctx.strokeStyle = "rgba(140, 140, 155, 0.4)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (
        sideNormals[i] < -0.15 &&
        sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
      )
        continue;
      ctx.moveTo(capPt2.x + bVerts[i].x, capPt2.y + bVerts[i].y);
      ctx.lineTo(capPt2.x + bVerts[ni].x, capPt2.y + bVerts[ni].y);
    }
    ctx.stroke();
  }

  // === BARREL-MUZZLE JUNCTION CAP ===
  drawHexCap(
    ctx,
    facingFwd ? hexFrontPt : hexBackPt,
    facingFwd ? taperVerts : hexVerts,
    facingFwd ? "#505058" : "#5a5a62",
    "#4e4e5c",
    0.5 * zoom,
  );

  // === MUZZLE BACK CAP ===
  drawHexCap(
    ctx,
    facingFwd ? muzzleBackPt : muzzleEndPt,
    facingFwd ? muzzleVerts : muzzleTipVerts,
    facingFwd ? "#484850" : "#404048",
  );

  // === FLARED HEXAGONAL MUZZLE — depth-sorted with heat coloring ===
  const muzzleSorted = sortSidesByDepth(sideNormals);

  for (const i of muzzleSorted) {
    const ni = (i + 1) % hexSides;
    const normal = sideNormals[i];

    const mv0 = muzzleVerts[i];
    const mv1 = muzzleVerts[ni];
    const mtv0 = muzzleTipVerts[i];
    const mtv1 = muzzleTipVerts[ni];

    const mLit = Math.max(0.1, 0.18 + Math.max(0, normal) * 0.5);
    const mr = Math.floor(60 + mLit * 70);
    const mg = Math.floor(35 + mLit * 30);
    const mb = Math.floor(25 + mLit * 20);
    ctx.fillStyle = `rgb(${mr}, ${mg}, ${mb})`;

    ctx.beginPath();
    ctx.moveTo(muzzleBackPt.x + mv0.x, muzzleBackPt.y + mv0.y);
    ctx.lineTo(muzzleBackPt.x + mv1.x, muzzleBackPt.y + mv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv1.x, muzzleEndPt.y + mtv1.y);
    ctx.lineTo(muzzleEndPt.x + mtv0.x, muzzleEndPt.y + mtv0.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = `rgba(20, 20, 30, ${0.25 + Math.max(0, normal) * 0.2})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Heat glow lines on visible muzzle faces
    if (normal > -0.1) {
      const heatGlow = 0.15 + Math.sin(time * 4) * 0.08;
      ctx.strokeStyle = `rgba(255, 80, 20, ${heatGlow * Math.max(0.2, 0.4 + normal * 0.4)})`;
      ctx.lineWidth = 1.2 * zoom;
      const midMV0x = (mv0.x + mv1.x) * 0.5;
      const midMV0y = (mv0.y + mv1.y) * 0.5;
      const midMTV0x = (mtv0.x + mtv1.x) * 0.5;
      const midMTV0y = (mtv0.y + mtv1.y) * 0.5;
      ctx.beginPath();
      ctx.moveTo(muzzleBackPt.x + midMV0x, muzzleBackPt.y + midMV0y);
      ctx.lineTo(muzzleEndPt.x + midMTV0x, muzzleEndPt.y + midMTV0y);
      ctx.stroke();
    }
  }

  // === MUZZLE FRONT HEX CAP with heat glow ===
  {
    const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
    const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;
    drawHexCap(
      ctx,
      mCapPt,
      mCapVerts,
      facingFwd ? "#4a3a30" : "#3a3035",
      "rgba(255, 80, 30, 0.4)",
      0.8 * zoom,
    );
  }

  // Orange hex rings on muzzle
  for (let r = 0; r < 2; r++) {
    const mt = 0.3 + r * 0.4;
    const ringPt = axisPoint(startDist + hexLen + muzzleLen * mt);
    const ringScale = 1 + (1.15 - 1) * mt;
    const rVerts = muzzleVerts.map((v) => ({
      x: v.x * ringScale,
      y: v.y * ringScale,
    }));
    ctx.strokeStyle = "rgba(255, 100, 20, 0.65)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(ringPt.x + rVerts[0].x, ringPt.y + rVerts[0].y);
    for (let vi = 1; vi < hexSides; vi++)
      ctx.lineTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
    ctx.closePath();
    ctx.stroke();
  }

  // === SECONDARY INJECTOR BARREL — 3D hex prism, side by side ===
  {
    const injSide = -1;
    const injOffLat = (hexR + 3.5 * zoom) * injSide;
    const injOff = isoOff(injOffLat, 0);
    const injHexR = 2.8 * zoom;
    const injSides = 6;
    const injTaper = 0.9;
    const injLen = hexLen + muzzleLen * 0.85;

    const injBack = axisPoint(startDist);
    const injFront = axisPoint(startDist + injLen);
    const injTipPt = axisPoint(startDist + injLen + muzzleLen * 0.1);

    const injVerts = generateIsoHexVertices(isoOff, injHexR, injSides);
    const injTaperVerts = scaleVerts(injVerts, injTaper);
    const injNormals = computeHexSideNormals(cosR, injSides);

    // Feed line from pivot to injector
    ctx.strokeStyle = "#4a4a55";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      pivotX + perpX * 5 * zoom * injSide,
      pivotY + perpY * 5 * zoom * injSide,
    );
    ctx.quadraticCurveTo(
      pivotX + fwdX * 5 * zoom + perpX * 6 * zoom * injSide,
      pivotY + fwdY * 5 * zoom - 3 * zoom + perpY * 6 * zoom * injSide,
      injBack.x + injOff.x,
      injBack.y + injOff.y,
    );
    ctx.stroke();
    ctx.strokeStyle = "#5a5a65";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      pivotX + perpX * 5 * zoom * injSide,
      pivotY + perpY * 5 * zoom * injSide,
    );
    ctx.quadraticCurveTo(
      pivotX + fwdX * 5 * zoom + perpX * 6 * zoom * injSide,
      pivotY + fwdY * 5 * zoom - 3 * zoom + perpY * 6 * zoom * injSide,
      injBack.x + injOff.x,
      injBack.y + injOff.y,
    );
    ctx.stroke();

    const injFacingFwd = fwdY >= 0;
    const drawInjBackCap = () => {
      const cPt = injFacingFwd ? injBack : injTipPt;
      const cVerts = injFacingFwd ? injVerts : injTaperVerts;
      const center = { x: cPt.x + injOff.x, y: cPt.y + injOff.y };
      drawHexCap(
        ctx,
        center,
        cVerts,
        injFacingFwd ? "#42424c" : "#4e4e58",
        "#35353e",
        0.5 * zoom,
      );
    };

    const drawInjFrontCap = () => {
      const cPt = injFacingFwd ? injTipPt : injBack;
      const cVerts = injFacingFwd ? injTaperVerts : injVerts;
      const center = { x: cPt.x + injOff.x, y: cPt.y + injOff.y };
      drawHexCap(
        ctx,
        center,
        cVerts,
        injFacingFwd ? "#4e4e58" : "#42424c",
        "rgba(255, 80, 30, 0.35)",
        0.6 * zoom,
      );
      // Bore hole
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.arc(
        cPt.x + injOff.x,
        cPt.y + injOff.y,
        injHexR * injTaper * 0.4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    };

    // Depth-sorted side faces with heat gradient
    const drawInjSides = () => {
      const sorted = sortSidesByDepth(injNormals);

      for (const i of sorted) {
        const ni = (i + 1) % injSides;
        const normal = injNormals[i];
        const v0 = injVerts[i];
        const v1 = injVerts[ni];
        const tv0 = injTaperVerts[i];
        const tv1 = injTaperVerts[ni];

        const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);
        const sGrad = ctx.createLinearGradient(
          injBack.x + injOff.x + v0.x,
          injBack.y + injOff.y + v0.y,
          injFront.x + injOff.x + tv0.x,
          injFront.y + injOff.y + tv0.y,
        );
        const bR = Math.floor(50 + lit * 55);
        const bG = Math.floor(50 + lit * 52);
        const bB = Math.floor(55 + lit * 58);
        const tR = Math.floor(80 + lit * 70);
        const tG = Math.floor(42 + lit * 35);
        const tB = Math.floor(28 + lit * 18);
        sGrad.addColorStop(0, `rgb(${bR}, ${bG}, ${bB})`);
        sGrad.addColorStop(0.6, `rgb(${bR + 5}, ${bG - 3}, ${bB - 6})`);
        sGrad.addColorStop(0.85, `rgb(${tR}, ${tG}, ${tB})`);
        sGrad.addColorStop(1, `rgb(${tR + 10}, ${tG - 4}, ${tB - 8})`);

        ctx.fillStyle = sGrad;
        ctx.beginPath();
        ctx.moveTo(injBack.x + injOff.x + v0.x, injBack.y + injOff.y + v0.y);
        ctx.lineTo(injBack.x + injOff.x + v1.x, injBack.y + injOff.y + v1.y);
        ctx.lineTo(
          injFront.x + injOff.x + tv1.x,
          injFront.y + injOff.y + tv1.y,
        );
        ctx.lineTo(
          injFront.x + injOff.x + tv0.x,
          injFront.y + injOff.y + tv0.y,
        );
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = `rgba(25, 25, 35, ${0.3 + Math.max(0, normal) * 0.2})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.stroke();

        // Specular edge highlight
        if (normal > 0.25) {
          ctx.strokeStyle = `rgba(170, 140, 120, ${(normal - 0.25) * 0.35})`;
          ctx.lineWidth = 0.4 * zoom;
          ctx.beginPath();
          ctx.moveTo(
            injFront.x + injOff.x + tv0.x,
            injFront.y + injOff.y + tv0.y,
          );
          ctx.lineTo(
            injFront.x + injOff.x + tv1.x,
            injFront.y + injOff.y + tv1.y,
          );
          ctx.stroke();
        }

        // Heat conduit glow
        if (normal > -0.2) {
          const cGlow = 0.3 + Math.sin(time * 5.5 + 1.3) * 0.15;
          const mx0 = (v0.x + v1.x) * 0.5;
          const my0 = (v0.y + v1.y) * 0.5;
          const mtx0 = (tv0.x + tv1.x) * 0.5;
          const mty0 = (tv0.y + tv1.y) * 0.5;
          ctx.strokeStyle = `rgba(255, 80, 20, ${cGlow * Math.max(0.12, 0.25 + normal * 0.4)})`;
          ctx.lineWidth = 0.7 * zoom;
          ctx.beginPath();
          ctx.moveTo(injBack.x + injOff.x + mx0, injBack.y + injOff.y + my0);
          ctx.lineTo(
            injFront.x + injOff.x + mtx0,
            injFront.y + injOff.y + mty0,
          );
          ctx.stroke();
        }
      }
    };

    // Render in correct depth order
    if (injFacingFwd) {
      drawInjBackCap();
      drawInjSides();
      drawInjFrontCap();
    } else {
      drawInjFrontCap();
      drawInjSides();
      drawInjBackCap();
    }

    // Ring bands along injector barrel
    for (let b = 0; b < 2; b++) {
      const bt = (b + 1) / 3;
      const bandDist = startDist + injLen * bt;
      const bPtF = axisPoint(bandDist + 1 * zoom);
      const bPtB = axisPoint(bandDist - 1 * zoom);
      const bScale = 1 + (injTaper - 1) * bt;
      const bVerts = injVerts.map((v) => ({
        x: v.x * bScale * 1.1,
        y: v.y * bScale * 1.1,
      }));

      const bSorted = sortSidesByDepth(injNormals);
      for (const i of bSorted) {
        const ni = (i + 1) % injSides;
        if (injNormals[i] < -0.15) continue;
        const bLit = Math.max(0.2, 0.3 + Math.max(0, injNormals[i]) * 0.5);
        const gc = Math.floor(85 + bLit * 45);
        ctx.fillStyle = `rgb(${gc}, ${gc}, ${gc + 5})`;
        ctx.beginPath();
        ctx.moveTo(
          bPtB.x + injOff.x + bVerts[i].x,
          bPtB.y + injOff.y + bVerts[i].y,
        );
        ctx.lineTo(
          bPtB.x + injOff.x + bVerts[ni].x,
          bPtB.y + injOff.y + bVerts[ni].y,
        );
        ctx.lineTo(
          bPtF.x + injOff.x + bVerts[ni].x,
          bPtF.y + injOff.y + bVerts[ni].y,
        );
        ctx.lineTo(
          bPtF.x + injOff.x + bVerts[i].x,
          bPtF.y + injOff.y + bVerts[i].y,
        );
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(25, 25, 35, ${0.15 + Math.max(0, injNormals[i]) * 0.1})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.stroke();
      }
    }

    // Clamp brackets connecting injector to main barrel
    const clampCount = 3;
    for (let c = 0; c < clampCount; c++) {
      const ct = (c + 1) / (clampCount + 1);
      const clampDist = startDist + injLen * ct;
      const clampPt = axisPoint(clampDist);
      const mainSurfOff = isoOff(hexR * 1.0 * injSide, 0);

      // Bracket plate (L-shaped cross section)
      const bracketW = 1.5 * zoom;
      const bFwd = { x: fwdX * bracketW, y: fwdY * bracketW };
      ctx.fillStyle = "#5a5a65";
      ctx.beginPath();
      ctx.moveTo(clampPt.x + injOff.x - bFwd.x, clampPt.y + injOff.y - bFwd.y);
      ctx.lineTo(clampPt.x + injOff.x + bFwd.x, clampPt.y + injOff.y + bFwd.y);
      ctx.lineTo(
        clampPt.x + mainSurfOff.x + bFwd.x,
        clampPt.y + mainSurfOff.y + bFwd.y,
      );
      ctx.lineTo(
        clampPt.x + mainSurfOff.x - bFwd.x,
        clampPt.y + mainSurfOff.y - bFwd.y,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a3a45";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Bolts at each end
      ctx.fillStyle = "#7a7a88";
      ctx.beginPath();
      ctx.arc(
        clampPt.x + injOff.x,
        clampPt.y + injOff.y,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        clampPt.x + mainSurfOff.x,
        clampPt.y + mainSurfOff.y,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === PILOT FLAME at nozzle tip ===
  {
    const pilotPt = axisPoint(startDist + hexLen + muzzleLen * 1.05);
    const t = time;
    const flicker1 = Math.sin(t * 12) * 0.15;
    const flicker2 = Math.sin(t * 18 + 2.3) * 0.1;
    const flicker3 = Math.sin(t * 25 + 5.1) * 0.08;
    const baseGlow = 0.65 + flicker1 + flicker2;

    // Outer ambient glow halo
    const haloR = 14 * zoom;
    const haloGrad = ctx.createRadialGradient(
      pilotPt.x,
      pilotPt.y,
      0,
      pilotPt.x,
      pilotPt.y,
      haloR,
    );
    haloGrad.addColorStop(0, `rgba(0, 160, 255, ${baseGlow * 0.3})`);
    haloGrad.addColorStop(0.4, `rgba(0, 100, 220, ${baseGlow * 0.15})`);
    haloGrad.addColorStop(1, "rgba(0, 60, 180, 0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(pilotPt.x, pilotPt.y, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Flame tongue shape — elongated along barrel direction with flickering
    const tongueLen = (10 + flicker3 * 12) * zoom;
    const tongueW = (4.5 + flicker2 * 6) * zoom;
    const tipX = pilotPt.x + fwdX * tongueLen;
    const tipY = pilotPt.y + fwdY * tongueLen + tongueLen * pitchRate;
    const wobX = perpX * Math.sin(t * 22) * 2 * zoom;
    const wobY = perpY * Math.sin(t * 22) * 2 * zoom;

    // Outer blue flame
    ctx.save();
    ctx.shadowColor = "#00aaff";
    ctx.shadowBlur = 10 * zoom;
    const outerFGrad = ctx.createLinearGradient(
      pilotPt.x,
      pilotPt.y,
      tipX + wobX,
      tipY + wobY,
    );
    outerFGrad.addColorStop(0, `rgba(0, 140, 255, ${baseGlow * 0.7})`);
    outerFGrad.addColorStop(0.5, `rgba(0, 180, 255, ${baseGlow * 0.5})`);
    outerFGrad.addColorStop(1, `rgba(80, 200, 255, 0)`);
    ctx.fillStyle = outerFGrad;
    ctx.beginPath();
    ctx.moveTo(pilotPt.x - perpX * tongueW, pilotPt.y - perpY * tongueW);
    ctx.quadraticCurveTo(
      pilotPt.x + fwdX * tongueLen * 0.5 + wobX,
      pilotPt.y +
        fwdY * tongueLen * 0.5 +
        tongueLen * 0.5 * pitchRate +
        wobY -
        perpY * tongueW * 0.7,
      tipX + wobX,
      tipY + wobY,
    );
    ctx.quadraticCurveTo(
      pilotPt.x + fwdX * tongueLen * 0.5 + wobX,
      pilotPt.y +
        fwdY * tongueLen * 0.5 +
        tongueLen * 0.5 * pitchRate +
        wobY +
        perpY * tongueW * 0.7,
      pilotPt.x + perpX * tongueW,
      pilotPt.y + perpY * tongueW,
    );
    ctx.closePath();
    ctx.fill();

    // Inner hot white-blue core
    const coreLen = tongueLen * 0.6;
    const coreW = tongueW * 0.5;
    const coreTipX = pilotPt.x + fwdX * coreLen;
    const coreTipY = pilotPt.y + fwdY * coreLen + coreLen * pitchRate;
    const coreFGrad = ctx.createLinearGradient(
      pilotPt.x,
      pilotPt.y,
      coreTipX,
      coreTipY,
    );
    coreFGrad.addColorStop(0, `rgba(200, 240, 255, ${baseGlow * 0.9})`);
    coreFGrad.addColorStop(0.5, `rgba(120, 210, 255, ${baseGlow * 0.7})`);
    coreFGrad.addColorStop(1, `rgba(0, 180, 255, 0)`);
    ctx.fillStyle = coreFGrad;
    ctx.beginPath();
    ctx.moveTo(pilotPt.x - perpX * coreW, pilotPt.y - perpY * coreW);
    ctx.quadraticCurveTo(
      pilotPt.x + fwdX * coreLen * 0.5,
      pilotPt.y +
        fwdY * coreLen * 0.5 +
        coreLen * 0.5 * pitchRate -
        perpY * coreW * 0.5,
      coreTipX,
      coreTipY,
    );
    ctx.quadraticCurveTo(
      pilotPt.x + fwdX * coreLen * 0.5,
      pilotPt.y +
        fwdY * coreLen * 0.5 +
        coreLen * 0.5 * pitchRate +
        perpY * coreW * 0.5,
      pilotPt.x + perpX * coreW,
      pilotPt.y + perpY * coreW,
    );
    ctx.closePath();
    ctx.fill();

    // Bright ignition point
    const ignGrad2 = ctx.createRadialGradient(
      pilotPt.x,
      pilotPt.y,
      0,
      pilotPt.x,
      pilotPt.y,
      4 * zoom,
    );
    ignGrad2.addColorStop(0, `rgba(255, 255, 255, ${baseGlow})`);
    ignGrad2.addColorStop(0.4, `rgba(180, 230, 255, ${baseGlow * 0.8})`);
    ignGrad2.addColorStop(1, `rgba(0, 150, 255, 0)`);
    ctx.fillStyle = ignGrad2;
    ctx.beginPath();
    ctx.arc(pilotPt.x, pilotPt.y, 4 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Micro sparks
    for (let sp = 0; sp < 4; sp++) {
      const spSeed = Math.sin(t * 15 + sp * 4.7) * 0.5 + 0.5;
      const spDist = (3 + spSeed * 7) * zoom;
      const spAngle = t * 8 + sp * 2.1;
      const spX =
        pilotPt.x + fwdX * spDist + perpX * Math.sin(spAngle) * 3 * zoom;
      const spY =
        pilotPt.y +
        fwdY * spDist +
        spDist * pitchRate +
        perpY * Math.sin(spAngle) * 3 * zoom;
      const spAlpha = (1 - spSeed) * baseGlow * 0.6;
      ctx.fillStyle = `rgba(150, 220, 255, ${spAlpha})`;
      ctx.beginPath();
      ctx.arc(spX, spY, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Flame effect along barrel axis
  const timeSinceFire = Date.now() - tower.lastAttack;
  if (timeSinceFire < 500) {
    const flameIntensity = 1 - timeSinceFire / 500;
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 25 * zoom * flameIntensity;

    for (let i = 0; i < 10; i++) {
      const flameT = totalLen + i * totalLen * 0.12;
      const flamePt = axisPoint(flameT);
      const wobble = Math.sin(time * 35 + i * 0.8) * (2 + i * 0.4) * zoom;
      const flameSize = (16 - i * 1.2) * zoom * flameIntensity;

      const flameGrad2 = ctx.createRadialGradient(
        flamePt.x,
        flamePt.y + wobble,
        0,
        flamePt.x,
        flamePt.y + wobble,
        flameSize,
      );
      flameGrad2.addColorStop(0, `rgba(255, 255, 180, ${flameIntensity})`);
      flameGrad2.addColorStop(
        0.15,
        `rgba(255, 220, 80, ${flameIntensity * 0.95})`,
      );
      flameGrad2.addColorStop(
        0.4,
        `rgba(255, 120, 0, ${flameIntensity * 0.75})`,
      );
      flameGrad2.addColorStop(
        0.7,
        `rgba(220, 60, 0, ${flameIntensity * 0.45})`,
      );
      flameGrad2.addColorStop(1, "rgba(120, 30, 0, 0)");
      ctx.fillStyle = flameGrad2;
      ctx.beginPath();
      ctx.arc(flamePt.x, flamePt.y + wobble, flameSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

// Compute parameter angles where a rotated ellipse crosses its center Y.
// Returns [backStart, backEnd, frontStart, frontEnd] for splitting into
// screen-space back (y < center, further from viewer) and front (y > center) arcs.
// A small angular overlap at the seam prevents visible gaps.
