import { ISO_PRISM_D_FACTOR } from "../../constants";
import type { Tower, Enemy, Position } from "../../types";
import { lightenColor, darkenColor } from "../../utils";
import {
  generateIsoHexVertices,
  computeHexSideNormals,
  sortSidesByDepth,
  drawHexCap,
  scaleVerts,
} from "../helpers";
import type { IsoOffFn } from "../helpers";
import {
  drawIsometricPrism,
  drawIsoOctPrism,
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
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = ((i * 36 - 90) * Math.PI) / 180;
    if (i === 0) {
      ctx.moveTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    } else {
      ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    }
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
  cameraZoom?: number
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
  const { level } = tower;
  // Shift tower up to center on placement position
  screenPos = { x: screenPos.x, y: screenPos.y - (8 + level * 2) * zoom };
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
    Math.PI * 2
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
    Math.PI * 2
  );
  ctx.stroke();
  ctx.strokeStyle = s.s4;
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < canBalPosts; bp++) {
    const pa = (bp / canBalPosts) * Math.PI * 2;
    if (Math.sin(pa) > 0) {
      continue;
    }
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
    if (Math.sin((a0 + a1) / 2) > 0) {
      continue;
    }
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
      accent: tAcc,
      base: s.s3,
      dark: s.s1,
      light: s.s5,
    },
    zoom,
    time,
    level,
    s,
    tAcc,
    tRgba
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
    Math.PI
  );
  ctx.stroke();
  ctx.strokeStyle = s.s4;
  ctx.lineWidth = 1 * zoom;
  for (let bp = 0; bp < canBalPosts; bp++) {
    const pa = (bp / canBalPosts) * Math.PI * 2;
    if (Math.sin(pa) <= 0) {
      continue;
    }
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
    if (Math.sin((a0 + a1) / 2) <= 0) {
      continue;
    }
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
    Math.PI * 2
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
    Math.PI * 2
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
    Math.PI * 2
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
    Math.PI * 2
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
      Math.PI * 2
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
      Math.PI * 2
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
  tRgbaOverride?: string
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
    t: number
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
    if (i % 2 !== 0) {
      continue;
    }
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
    if (i % 2 !== 0) {
      continue;
    }
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
  sp?: {
    s0: string;
    s1: string;
    s2: string;
    s3: string;
    s4: string;
    s5: string;
    s6: string;
    s7: string;
  },
  tAcc?: string,
  tRgba?: string
) {
  const _s = sp ?? {
    s0: "#1a1a22",
    s1: "#2a2a32",
    s2: "#3a3a42",
    s3: "#4a4a52",
    s4: "#5a5a62",
    s5: "#6a6a72",
    s6: "#7a7a82",
    s7: "#8a8a92",
  };
  const _tAcc = tAcc ?? "#ff6600";
  const _tRgba = tRgba ?? "255, 102, 0";
  const fndScale = level * 4;
  // Stepped foundation — rough-hewn plinth (bottom tier)
  drawIsoOctPrism(
    ctx,
    x,
    y + (16 + level) * zoom,
    width + 24 + fndScale,
    width + 24 + fndScale,
    4 + level,
    _s.s1,
    darkenColor(_s.s1, 8),
    darkenColor(_s.s1, 16),
    zoom
  );

  // Foundation middle tier — dressed stone
  drawIsoOctPrism(
    ctx,
    x,
    y + (11 + level) * zoom,
    width + 16 + fndScale,
    width + 16 + fndScale,
    4 + level,
    _s.s2,
    _s.s1,
    darkenColor(_s.s1, 5),
    zoom
  );

  // Foundation upper tier — polished cap
  drawIsoOctPrism(
    ctx,
    x,
    y + (7 + level) * zoom,
    width + 8 + fndScale,
    width + 8 + fndScale,
    3 + level,
    _s.s3,
    _s.s2,
    darkenColor(_s.s2, 5),
    zoom
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
      left: colors.base,
      leftBack: lightenColor(colors.base, 10),
      right: colors.dark,
      rightBack: lightenColor(colors.dark, 5),
      top: colors.light,
    },
    zoom
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
      left: colors.base,
      leftBack: colors.light,
      right: colors.dark,
      rightBack: lightenColor(colors.dark, 8),
      top: lightenColor(colors.base, 15),
    },
    zoom
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
    _tRgba
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
    zoom
  );

  // Right side steam vent
  drawSteamVent(
    ctx,
    x + w * 0.7,
    y - height * zoom * 0.15,
    time + 0.5,
    0.6 + level * 0.15,
    zoom
  );

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
    `rgb(${_tRgba})`
  );

  if (level >= 2) {
    drawEnergyTube(
      ctx,
      x + w * 0.6,
      y + d * 0.15,
      x + w * 0.35,
      y - height * zoom * 0.55 + d * 0.1,
      2.5,
      time + 0.3,
      zoom,
      `rgb(${_tRgba})`
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
    faceSide: number
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
      vy + isoSlopeY * vw + 0.8 * zoom
    );
    ctx.lineTo(
      vx + isoSlopeX * vw - 0.8 * zoom,
      vy + isoSlopeY * vw + vh - 0.8 * zoom
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
      highlight: colors.accent,
      inner: _s.s2,
      outer: _s.s3,
      teeth: _s.s4,
    },
    zoom
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
      highlight: colors.accent,
      inner: _s.s3,
      outer: _s.s4,
      teeth: _s.s5,
    },
    zoom
  );

  // Gear on right side
  drawGear(
    ctx,
    x + w * 0.55,
    y - height * zoom * 0.55,
    10 + level,
    7,
    8 + level,
    -gearRotation,
    {
      highlight: colors.accent,
      inner: _s.s2,
      outer: _s.s3,
      teeth: _s.s4,
    },
    zoom
  );

  // ========== CONVEYOR BELT WITH AMMO ==========
  drawConveyorBelt(
    ctx,
    x - w * 0.5,
    y + 6 * zoom,
    x - w * 0.5,
    y - height * zoom * 1.1,
    6,
    time,
    zoom,
    "#8b4513"
  );

  // ========== WARNING LIGHTS ==========
  drawWarningLight(
    ctx,
    x - w * 0.85,
    y - height * zoom + 12 * zoom,
    3,
    time,
    zoom,
    "#ff4400",
    4
  );
  drawWarningLight(
    ctx,
    x + w * 0.85,
    y - height * zoom + 12 * zoom,
    3,
    time + 0.5,
    zoom,
    "#ffaa00",
    3
  );

  // ========== AMMO BOXES (skip for level 4 - turret has its own) ==========
  if (level < 4) {
    drawAmmoBox(
      ctx,
      x - w * 0.5,
      y + 5 * zoom,
      12,
      6,
      12,
      { accent: "#ff6600", label: "#c9a227", main: "#5a4a3a" },
      zoom,
      time * 2
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
      { accent: "#ffaa00", label: "#c9a227", main: "#4a3a2a" },
      zoom,
      time * 2 + 1
    );
  }

  // ========== SCAFFOLDING & SUPPORT STRUCTURE ==========
  {
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
      highlightAlpha: number
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
      0
    );
    drawBeam(
      postBase[0].x,
      postBase[0].y,
      postTop[0].x,
      postTop[0].y,
      2.5,
      _s.s3,
      0.04
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
      0.08
    );
    drawBeam(
      postBase[2].x,
      postBase[2].y,
      postTop[2].x,
      postTop[2].y,
      2.8,
      _s.s4,
      0.06
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

  // ========== AMMO CHAIN/BELT FEED SYSTEM ==========
  {
    // Ammo chain from side storage to turret
    const chainLinks = 8 + level * 2;
    const chainStartX = x - w * 1;
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
        Math.PI * 2
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
        Math.PI * 2
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
          Math.PI * 0.8
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

  // ========== ARMOR PLATING ==========
  {
    // Side armor plates
    ctx.fillStyle = _s.s4;

    // Left armor plate
    ctx.beginPath();
    ctx.moveTo(x - w * 1.05, y + 2 * zoom);
    ctx.lineTo(x - w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x - w * 1, y - height * zoom * 0.35);
    ctx.lineTo(x - w * 0.9, y - 2 * zoom);
    ctx.closePath();
    ctx.fill();

    // Right armor plate
    ctx.beginPath();
    ctx.moveTo(x + w * 1.05, y + 2 * zoom);
    ctx.lineTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1, y - height * zoom * 0.35);
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
    ctx.lineTo(x - w * 1, y - height * zoom * 0.35);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w * 1.15, y - height * zoom * 0.3);
    ctx.lineTo(x + w * 1, y - height * zoom * 0.35);
    ctx.stroke();
  }

  // ========== LEVEL 3 HEAVY ARMOR & EQUIPMENT ==========
  if (level >= 3) {
    // Secondary ammo chain (right side)
    const chain2Links = 6;
    const chain2StartX = x + w * 1;
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
      chain2EndY
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
      Math.PI * 2
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
      Math.PI * 2
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
      Math.PI * 2
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
        cableY - 1 * zoom
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
        sensorY - sensorW * sIsoSlope + 0.5 * zoom
      );
      ctx.lineTo(
        sensorX + sensorW + 0.5 * zoom,
        sensorY - sensorW * sIsoSlope + sensorH + 0.5 * zoom
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
        sensorY - sensorW * sIsoSlope * 0.5 - 5 * zoom
      );
      ctx.stroke();
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        sensorX + sensorW * 0.5,
        sensorY - sensorW * sIsoSlope * 0.5 - 5 * zoom,
        1 * zoom,
        0,
        Math.PI * 2
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
        3 * zoom
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
        Math.PI * 2
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
        lensCy + Math.sin(sweepAngle) * 2.5 * zoom
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
          Math.PI * 2
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
    Math.PI * 2
  );
  ctx.fill();
  ctx.beginPath();
  ctx.arc(
    x + w * 0.9,
    y - height * zoom + d + 8 * zoom,
    boltSize,
    0,
    Math.PI * 2
  );
  ctx.fill();
}
// Helper function to calculate pitch based on tower elevation and typical range
export function calculateBarrelPitch(
  towerElevation: number,
  barrelLength: number
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
  time: number
) {
  const rotation = tower.rotation || 0;
  const { level } = tower;

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
    Math.PI * 2
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
    Math.PI * 2
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
    Math.PI * 2
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
      time
    );
  }

  // Enhanced turret housing - layered dome design
  const housingGrad = ctx.createRadialGradient(
    turretX - 4 * zoom,
    turretY - 16 * zoom,
    0,
    turretX,
    turretY - 12 * zoom,
    18 * zoom
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
    Math.PI * 2
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
        shieldCenterY + shieldPerpY * shieldWidth * 0.5
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
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 -
          2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY -
          12 * zoom +
          Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.5 -
          3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 -
          2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          12 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5
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
    Math.PI * 2
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
    4 * zoom
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
    Math.PI * 2
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
      "small"
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
      "small"
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
      1,
      recoilOffset
    );
  }
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1,
    recoilOffset
  );
  drawBreechFeedAnimation(
    ctx,
    turretX,
    turretY - 12 * zoom,
    rotation,
    zoom,
    1,
    time,
    tower.lastAttack,
    400,
    1
  );
  drawMantlets(ctx, turretX, turretY - 12 * zoom, rotation, zoom, 1, "behind");
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 12 * zoom,
      rotation,
      zoom,
      1,
      recoilOffset
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
      time
    );
  }

  drawMantlets(ctx, turretX, turretY - 12 * zoom, rotation, zoom, 1, "front");

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
      "small"
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
      "small"
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
    recoilOffset
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
      bloomR
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
  time: number
) {
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const { level } = tower;

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
      0.6 * zoom
    );
  }

  // === Closures for depth-ordered drawing ===
  const drawBarrelBody = () => {
    const sortedSides = sortSidesByDepth(sideNormals);

    for (const i of sortedSides) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];

      const v0 = hexVerts[i];
      const v1 = hexVerts[ni];
      const tv0 = taperVerts[i];
      const tv1 = taperVerts[ni];

      const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);
      const rc = Math.floor(55 + lit * 68);
      const gc = Math.floor(55 + lit * 66);
      const bc = Math.floor(60 + lit * 70);

      const sGrad = ctx.createLinearGradient(
        hexBackPt.x + v0.x,
        hexBackPt.y + v0.y,
        hexFrontPt.x + tv0.x,
        hexFrontPt.y + tv0.y
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
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(hexBackPt.x + midV0x, hexBackPt.y + midV0y);
        ctx.lineTo(hexFrontPt.x + midTV0x, hexFrontPt.y + midTV0y);
        ctx.stroke();
      }
    }
  };

  const drawRingBands = () => {
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

      const bandSorted = Array.from({ length: hexSides }, (_, i) => i).toSorted(
        (a, bb) => sideNormals[a] - sideNormals[bb]
      );

      for (const i of bandSorted) {
        const ni = (i + 1) % hexSides;
        const normal = sideNormals[i];
        if (normal < -0.15) {
          continue;
        }

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

      const capPt = facingFwd ? bandFrontPt : bandBackPt;
      ctx.strokeStyle = `rgba(140, 140, 155, 0.4)`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      for (let i = 0; i < hexSides; i++) {
        const ni = (i + 1) % hexSides;
        if (
          sideNormals[i] < -0.15 &&
          sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
        ) {
          continue;
        }
        ctx.moveTo(capPt.x + bVerts[i].x, capPt.y + bVerts[i].y);
        ctx.lineTo(capPt.x + bVerts[ni].x, capPt.y + bVerts[ni].y);
      }
      ctx.stroke();
    }
  };

  const drawMuzzleSection = () => {
    drawHexCap(
      ctx,
      facingFwd ? hexFrontPt : hexBackPt,
      facingFwd ? taperVerts : hexVerts,
      facingFwd ? "#60606e" : "#6c6c78",
      "#4e4e5c",
      0.5 * zoom
    );

    drawHexCap(
      ctx,
      facingFwd ? muzzleBackPt : muzzleEndPt,
      facingFwd ? muzzleVerts : muzzleTipVerts,
      facingFwd ? "#565664" : "#4c4c5a"
    );

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

    if (level >= 3) {
      const finDist = startDist + hexLen * 0.9;
      const finPt = axisPoint(finDist);
      const finEndPt2 = axisPoint(finDist + 6 * zoom);
      const finH = hexR * 1.8;
      const finW = 2.5 * zoom;

      for (let f = 0; f < 4; f++) {
        const fa = (f / 4) * Math.PI * 2 + Math.PI / 4;
        const fnormal = Math.cos(fa) * cosR + 0.5 * Math.sin(fa);
        if (fnormal < -0.3) {
          continue;
        }

        const fOuter = isoOff(Math.cos(fa) * finH, Math.sin(fa) * finH);
        const fInner = isoOff(
          Math.cos(fa) * hexR * 0.5,
          Math.sin(fa) * hexR * 0.5
        );

        const fLit = 0.3 + Math.max(0, fnormal) * 0.5;
        const fc = Math.floor(48 + fLit * 55);

        ctx.fillStyle = `rgb(${fc}, ${fc}, ${fc + 6})`;
        ctx.beginPath();
        ctx.moveTo(
          finPt.x + fInner.x - fwdX * finW,
          finPt.y + fInner.y - fwdY * finW
        );
        ctx.lineTo(finPt.x + fOuter.x, finPt.y + fOuter.y);
        ctx.lineTo(finEndPt2.x + fOuter.x * 0.8, finEndPt2.y + fOuter.y * 0.8);
        ctx.lineTo(
          finEndPt2.x + fInner.x + fwdX * finW,
          finEndPt2.y + fInner.y + fwdY * finW
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
          finEndPt2.y + finMidOuter.y * 0.8
        );
        ctx.stroke();
      }

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
        for (let vi = 1; vi < hexSides; vi++) {
          ctx.lineTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  const drawNearCap = () => {
    const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
    const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;

    drawHexCap(
      ctx,
      mCapPt,
      mCapVerts,
      facingFwd ? "#5c5c6a" : "#4c4c5a",
      "#6a6a7a",
      0.8 * zoom
    );

    if (facingFwd) {
      drawHexCap(ctx, mCapPt, scaleVerts(mCapVerts, 0.5), "#0a0a0e");
      ctx.strokeStyle = "#1a1a24";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      const riflingVerts = scaleVerts(mCapVerts, 0.32);
      ctx.moveTo(mCapPt.x + riflingVerts[0].x, mCapPt.y + riflingVerts[0].y);
      for (let i = 1; i < hexSides; i++) {
        ctx.lineTo(mCapPt.x + riflingVerts[i].x, mCapPt.y + riflingVerts[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  };

  // Draw from farthest to nearest based on barrel direction
  if (facingFwd) {
    drawBarrelBody();
    drawRingBands();
    drawMuzzleSection();
  } else {
    drawMuzzleSection();
    drawBarrelBody();
    drawRingBands();
  }
  drawNearCap();

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
      fY - perpY * plumeW
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
  recoilOffset: number
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
    if (normal < -0.15) {
      continue;
    }
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
    0.8 * zoom
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
      Math.PI * 2
    );
    ctx.fill();
  }

  // Orange accent ring
  ctx.strokeStyle = "rgba(255, 130, 30, 0.55)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(frontPt.x + hexVerts[0].x * 0.6, frontPt.y + hexVerts[0].y * 0.6);
  for (let i = 1; i < hexSides; i++) {
    ctx.lineTo(
      frontPt.x + hexVerts[i].x * 0.6,
      frontPt.y + hexVerts[i].y * 0.6
    );
  }
  ctx.closePath();
  ctx.stroke();

  // Outer edge highlight
  ctx.strokeStyle = `rgba(140, 140, 158, 0.4)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(frontPt.x + hexVerts[0].x, frontPt.y + hexVerts[0].y);
  for (let i = 1; i < hexSides; i++) {
    ctx.lineTo(frontPt.x + hexVerts[i].x, frontPt.y + hexVerts[i].y);
  }
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
  layer: "behind" | "front" | "all" = "all"
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
    if (layer === "behind" && closerToCamera) {
      continue;
    }
    if (layer === "front" && !closerToCamera) {
      continue;
    }

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
      outerEdge.y + fwdY * plateThick
    );
    ctx.lineTo(
      outerEdge.x + fwdX * plateThick,
      outerEdge.y + fwdY * plateThick - plateH
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
  recoilOffset: number
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
      sy - perpY * cylRad
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
    by - perpY * blkW
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
    Math.PI * 2
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
    Math.PI * 2
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
  ejectCount: number = 1
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
    if (!firing || shellPhase < 0.08 || shellPhase > 0.75) {
      continue;
    }

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
        Math.PI * 2
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
      Math.PI * 2
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
      Math.PI * 2
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
      Math.PI * 2
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
      Math.PI * 2
    );
    ctx.fill();

    ctx.strokeStyle = "#7a7a85";
    ctx.lineWidth = 2 * zoom * scale;
    ctx.beginPath();
    ctx.moveTo(boltX, boltY - 2 * zoom * scale);
    ctx.lineTo(
      boltX + perpX * 4 * zoom * scale,
      boltY + perpY * 4 * zoom * scale - 3 * zoom * scale
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
      Math.PI * 2
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
  time: number
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
    Math.PI * 2
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
    Math.PI * 2
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
    Math.PI * 2
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
    Math.PI * 2
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
      time
    );
  }

  // Armored turret housing - base ellipse
  const housingGrad = ctx.createRadialGradient(
    turretX - 5 * zoom,
    turretY - 20 * zoom,
    0,
    turretX,
    turretY - 16 * zoom,
    24 * zoom
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
    Math.PI * 2
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
          Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.5
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
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.5
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.5 -
          3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 3 * zoom),
        turretY -
          16 * zoom +
          Math.sin(shieldAngle) * (outerR + 3 * zoom) * 0.5 -
          4 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.5 -
          3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          16 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.5
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
    Math.PI * 2
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
    6 * zoom
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
      "medium"
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
      "medium"
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
      recoilOffset
    );
  }
  drawBreechMechanism(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    recoilOffset
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
    1
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 16 * zoom,
    rotation,
    zoom,
    1.3,
    "behind"
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 16 * zoom,
      rotation,
      zoom,
      1.3,
      recoilOffset
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
      time
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
      "medium"
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
      "medium"
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
    recoilOffset
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
      bloomR
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
  time: number
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
      0.6 * zoom
    );
  }

  // === Closures for depth-ordered drawing ===
  const drawBarrelBody = () => {
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
        hexFrontPt.y + tv0.y
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
  };

  const drawRingBands = () => {
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

      const bandSorted = Array.from({ length: hexSides }, (_, i) => i).toSorted(
        (a, bb) => sideNormals[a] - sideNormals[bb]
      );

      for (const i of bandSorted) {
        const ni = (i + 1) % hexSides;
        const normal = sideNormals[i];
        if (normal < -0.15) {
          continue;
        }

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
        ) {
          continue;
        }
        ctx.moveTo(capPtB.x + bVerts[i].x, capPtB.y + bVerts[i].y);
        ctx.lineTo(capPtB.x + bVerts[ni].x, capPtB.y + bVerts[ni].y);
      }
      ctx.stroke();
    }
  };

  const drawMuzzleSection = () => {
    drawHexCap(
      ctx,
      facingFwd ? hexFrontPt : hexBackPt,
      facingFwd ? taperVerts : hexVerts,
      facingFwd ? "#4e4e5c" : "#5a5a68"
    );

    drawHexCap(
      ctx,
      facingFwd ? muzzleBackPt : muzzleEndPt,
      facingFwd ? muzzleVerts : muzzleTipVerts,
      facingFwd ? "#444454" : "#3a3a48"
    );

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
        if (sideNormals[vi] < -0.1) {
          continue;
        }
        ctx.moveTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
        ctx.lineTo(ringPt.x + rVerts[nvi].x, ringPt.y + rVerts[nvi].y);
      }
      ctx.stroke();
    }

    const finDist = startDist + hexLen * 0.88;
    const finPt = axisPoint(finDist);
    const finEndPt2 = axisPoint(finDist + 8 * zoom);
    const finH = hexR * 2;
    const finW = 3 * zoom;

    for (let f = 0; f < 4; f++) {
      const fa = (f / 4) * Math.PI * 2 + Math.PI / 4;
      const fnormal = Math.cos(fa) * cosR + 0.5 * Math.sin(fa);
      if (fnormal < -0.3) {
        continue;
      }

      const fOuter = isoOff(Math.cos(fa) * finH, Math.sin(fa) * finH);
      const fInner = isoOff(
        Math.cos(fa) * hexR * 0.5,
        Math.sin(fa) * hexR * 0.5
      );

      const fLit = 0.3 + Math.max(0, fnormal) * 0.5;
      const fc = Math.floor(48 + fLit * 55);

      ctx.fillStyle = `rgb(${fc}, ${fc}, ${fc + 6})`;
      ctx.beginPath();
      ctx.moveTo(
        finPt.x + fInner.x - fwdX * finW,
        finPt.y + fInner.y - fwdY * finW
      );
      ctx.lineTo(finPt.x + fOuter.x, finPt.y + fOuter.y);
      ctx.lineTo(finEndPt2.x + fOuter.x * 0.8, finEndPt2.y + fOuter.y * 0.8);
      ctx.lineTo(
        finEndPt2.x + fInner.x + fwdX * finW,
        finEndPt2.y + fInner.y + fwdY * finW
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
        finEndPt2.y + finMidOuter.y * 0.8
      );
      ctx.stroke();
    }
  };

  const drawNearCap = () => {
    const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
    const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;
    drawHexCap(
      ctx,
      mCapPt,
      mCapVerts,
      facingFwd ? "#4a4a58" : "#3a3a48",
      "#5a5a6a",
      0.8 * zoom
    );

    if (facingFwd) {
      drawHexCap(ctx, mCapPt, scaleVerts(mCapVerts, 0.5), "#0a0a0e");
      ctx.strokeStyle = "#1a1a24";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      const riflingVerts2 = scaleVerts(mCapVerts, 0.32);
      ctx.moveTo(mCapPt.x + riflingVerts2[0].x, mCapPt.y + riflingVerts2[0].y);
      for (let i = 1; i < hexSides; i++) {
        ctx.lineTo(
          mCapPt.x + riflingVerts2[i].x,
          mCapPt.y + riflingVerts2[i].y
        );
      }
      ctx.closePath();
      ctx.stroke();
    }
  };

  // Draw from farthest to nearest based on barrel direction
  if (facingFwd) {
    drawBarrelBody();
    drawRingBands();
    drawMuzzleSection();
  } else {
    drawMuzzleSection();
    drawBarrelBody();
    drawRingBands();
  }
  drawNearCap();

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
      fY - perpY * plumeW
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
  time: number
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
    Math.PI * 2
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
    Math.PI * 2
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
    Math.PI * 2
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
      recoilOffset
    );
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      zoom,
      1.2,
      recoilOffset
    );
  }

  // === HEAVY GUN SHIELD ===
  const shieldGrad = ctx.createLinearGradient(
    turretX - 20 * zoom,
    turretY - 6 * zoom,
    turretX + 20 * zoom,
    turretY - 28 * zoom
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
        Math.PI * 2
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
    16 * zoom
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
    Math.PI * 2
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
          Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.8
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
          Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.8
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.8 -
          2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle) * (outerR + 2 * zoom),
        turretY -
          14 * zoom +
          Math.sin(shieldAngle) * (outerR + 2 * zoom) * 0.8 -
          3 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.8 -
          2 * zoom
      );
      ctx.lineTo(
        turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR,
        turretY -
          14 * zoom +
          Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.8
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
    Math.PI * 2
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
      "large"
    );
  };

  // Helper function to draw the armor plate with number
  const drawArmorPlate = () => {
    if (!plateVisible) {
      return;
    }

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
        plateCenterY - plateHeight * 0.5
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY + plateHeight * 0.5 - plateDepthSize * 0.25
      );
      ctx.lineTo(
        plateCenterX - plateWidth * 0.5,
        plateCenterY + plateHeight * 0.5
      );
      ctx.closePath();
      ctx.fill();
    }

    // === ARMOR PLATE MAIN FACE ===
    const plateGrad = ctx.createLinearGradient(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5
    );
    plateGrad.addColorStop(
      0,
      `rgb(${Math.floor(70 + plateLightness * 35)}, ${Math.floor(70 + plateLightness * 30)}, ${Math.floor(65 + plateLightness * 25)})`
    );
    plateGrad.addColorStop(
      0.5,
      `rgb(${Math.floor(55 + plateLightness * 30)}, ${Math.floor(55 + plateLightness * 25)}, ${Math.floor(50 + plateLightness * 20)})`
    );
    plateGrad.addColorStop(
      1,
      `rgb(${Math.floor(45 + plateLightness * 20)}, ${Math.floor(45 + plateLightness * 15)}, ${Math.floor(40 + plateLightness * 12)})`
    );
    ctx.fillStyle = plateGrad;

    // Rounded rectangle shape for plate
    const radius = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY - plateHeight * 0.5
    );
    ctx.quadraticCurveTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5 + radius
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5 - radius
    );
    ctx.quadraticCurveTo(
      plateCenterX + plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY + plateHeight * 0.5
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY + plateHeight * 0.5
    );
    ctx.quadraticCurveTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5,
      plateCenterX - plateWidth * 0.5,
      plateCenterY + plateHeight * 0.5 - radius
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5 + radius
    );
    ctx.quadraticCurveTo(
      plateCenterX - plateWidth * 0.5,
      plateCenterY - plateHeight * 0.5,
      plateCenterX - plateWidth * 0.5 + radius,
      plateCenterY - plateHeight * 0.5
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
      plateCenterY - plateHeight * 0.5
    );
    ctx.lineTo(
      plateCenterX - plateWidth * 0.5 + radius - plateDepthSize * 0.4,
      plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius - plateDepthSize * 0.4,
      plateCenterY - plateHeight * 0.5 - plateDepthSize * 0.25
    );
    ctx.lineTo(
      plateCenterX + plateWidth * 0.5 - radius,
      plateCenterY - plateHeight * 0.5
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
        plateCenterY - plateHeight * 0.5 + radius
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY - plateHeight * 0.5 + radius - plateDepthSize * 0.25
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5 - plateDepthSize * 0.4,
        plateCenterY + plateHeight * 0.5 - radius - plateDepthSize * 0.25
      );
      ctx.lineTo(
        plateCenterX + plateWidth * 0.5,
        plateCenterY + plateHeight * 0.5 - radius
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
        Math.PI * 2
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
        recoilOffset
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
        recoilOffset
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
        recoilOffset
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
        recoilOffset
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
    4 * zoom
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
      indicatorAngle + 0.3
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
    recoilOffset
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
    3,
    2
  );
  drawMantlets(
    ctx,
    turretX,
    turretY - 14 * zoom,
    rotation,
    zoom,
    1.2,
    "behind"
  );
  if (!facingAway) {
    drawHexMantlet(
      ctx,
      turretX,
      turretY - 14 * zoom,
      rotation,
      zoom,
      1.2,
      recoilOffset
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
      recoilOffset
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
  recoilOffset: number = 0
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
      if (normal < -0.15) {
        continue;
      }

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
        fby + v0.y
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
        bby + v0.y + (fby + v0.y - bby - v0.y) * mf
      );
      ctx.lineTo(
        bbx + v1.x + (fbx + v1.x - bbx - v1.x) * mf,
        bby + v1.y + (fby + v1.y - bby - v1.y) * mf
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
      housingR
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
    for (let i = 1; i < hexSides; i++) {
      ctx.lineTo(ffx + hVerts[i].x, ffy + hVerts[i].y);
    }
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
        Math.PI * 2
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
      isoOffset(Math.cos(ra) * ringBandR, Math.sin(ra) * ringBandR)
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

      const rbSorted = Array.from(
        { length: ringHexSides },
        (_, i) => i
      ).toSorted((a, b) => ringBandSideNormals[a] - ringBandSideNormals[b]);

      for (const ri of rbSorted) {
        const rni = (ri + 1) % ringHexSides;
        const rnormal = ringBandSideNormals[ri];
        if (rnormal < -0.15) {
          continue;
        }

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
        ) {
          continue;
        }
        ctx.moveTo(rbCapPt.x + rbVerts[ri].x, rbCapPt.y + rbVerts[ri].y);
        ctx.lineTo(rbCapPt.x + rbVerts[rni].x, rbCapPt.y + rbVerts[rni].y);
      }
      ctx.stroke();
    }
  };

  // === BARRELS — each as a quad strip projected with perp + up ===
  interface BarrelEntry {
    spinA: number;
    lat: number;
    vert: number;
    sortY: number;
    idx: number;
  }
  const barrelData: BarrelEntry[] = [];
  for (let i = 0; i < barrelCount; i++) {
    const a = spinAngle + (i / barrelCount) * Math.PI * 2;
    const lat = Math.cos(a) * barrelSpread;
    const vert = Math.sin(a) * barrelSpread;
    const off = isoOffset(lat, vert);
    barrelData.push({ idx: i, lat, sortY: off.y, spinA: a, vert });
  }
  barrelData.sort((a, b) => a.sortY - b.sortY);

  // Muzzle prism position — center it so front face aligns with barrel tips
  const muzzlePt = axisPoint(barrelLen - 5 * zoom);
  const muzzleX = muzzlePt.x;
  const muzzleY = muzzlePt.y;

  const drawMuzzle = () => {
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
      pitchRate
    );
  };

  const drawBarrels = () => {
    for (const bd of barrelData) {
      const off = isoOffset(bd.lat, bd.vert);
      const bsx = hFrontPt.x + off.x;
      const bsy = hFrontPt.y + off.y;
      const bex = ex + off.x * 0.75;
      const bey = ey + off.y * 0.75;

      const bwPerp = isoOffset(
        Math.cos(bd.spinA + Math.PI * 0.5) * barrelW,
        Math.sin(bd.spinA + Math.PI * 0.5) * barrelW
      );

      const shade = 0.3 + (bd.sortY / (barrelSpread * 1.5) + 0.5) * 0.4;
      const tint = bd.idx % 2 === 0 ? 10 : -10;
      const c = Math.max(30, Math.min(140, Math.floor(45 + shade * 65 + tint)));

      const grad = ctx.createLinearGradient(
        bsx + bwPerp.x,
        bsy + bwPerp.y,
        bsx - bwPerp.x,
        bsy - bwPerp.y
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
  };

  // Draw from farthest to nearest based on barrel direction
  if (facingFwd) {
    drawBarrels();
    drawRingBands();
    drawMuzzle();
  } else {
    drawMuzzle();
    drawBarrels();
    drawRingBands();
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
  pitchRate: number = 0
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
      1 * zoom
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
        Math.PI * 2
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
      if (normal < -0.15) {
        continue;
      }

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
        fby + v0.y
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
      hexR
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
        ffy + hexVerts[0].y * innerScale
      );
      for (let i = 1; i < hexSides; i++) {
        ctx.lineTo(
          ffx + hexVerts[i].x * innerScale,
          ffy + hexVerts[i].y * innerScale
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
          by - Math.sin(slotA) * 1 * zoom
        );
        ctx.lineTo(
          bx + Math.cos(slotA) * 1 * zoom,
          by + Math.sin(slotA) * 1 * zoom
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
          Math.PI * 2
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

  // === Draw in correct depth order (back-to-front painter's algorithm) ===
  // frontOffPt/backOffPt swap based on facingCamera, so the order is always
  // back (farthest) → sides → front (closest to camera).
  // When facing away, the near face is behind the barrel cluster and would
  // bleed through the gaps between individual barrel tubes.
  drawBackFace();
  drawSideFaces();
  if (facingCamera) {
    drawFrontFace();
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
  time: number
) {
  const rotation = tower.rotation || 0;
  const cosR = Math.cos(rotation);
  const sinR = Math.sin(rotation);
  const foreshorten = Math.abs(cosR);

  // Isometric basis vectors for turret-local positioning
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;

  const timeSinceFire = Date.now() - tower.lastAttack;
  const isAttacking = timeSinceFire < 300;
  const attackPulse = isAttacking ? 1 - timeSinceFire / 300 : 0;
  let recoilOffset = 0;
  let turretShake = 0;
  if (isAttacking) {
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

  // Turret-local positioning: forward, lateral, vertical offset
  const tp = (f: number, l: number, v: number = 0) => ({
    x: turretX + fwdX * f * zoom + perpX * l * zoom,
    y: turretY + fwdY * f * zoom + perpY * l * zoom - v * zoom,
  });

  // Rotation-aware anchor positions for all components
  const mainTank = tp(-9, -9, 12);
  const secTank = tp(-7, 9, 8);
  const manifold = tp(-4, 0, 4);
  const pumpPos = tp(-2, -4, 7);
  const coilPos = tp(1, 10, 5);

  // ════════════════════════════════════════════════════════════
  // STATIC BASE PLATFORM (bearing ring — does not rotate)
  // ════════════════════════════════════════════════════════════
  ctx.fillStyle = "#2a2a32";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 2 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
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
    Math.PI * 2
  );
  ctx.fill();

  // Gear teeth on bearing edge (rotate with turret)
  ctx.fillStyle = "#5a5a62";
  for (let i = 0; i < 16; i++) {
    const a = rotation + (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      turretX + Math.cos(a) * 21 * zoom,
      turretY - 2 * zoom + Math.sin(a) * 10.5 * zoom,
      2.5 * zoom,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Top bearing surface
  ctx.fillStyle = "#3a3a42";
  ctx.beginPath();
  ctx.ellipse(
    turretX,
    turretY - 4 * zoom,
    20 * zoom,
    10 * zoom,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ════════════════════════════════════════════════════════════
  // REAR GROUP: fuel tanks, manifold, pump, plumbing
  // ════════════════════════════════════════════════════════════
  const drawRearComponents = () => {
    // ── Main fuel tank (red, large) — rotates to rear-left ──
    const mt = mainTank;
    const mtRX = 9 * zoom;
    const mtRY = mtRX * 0.45;
    const mtTop = mt.y - 14 * zoom;
    const mtBot = mt.y + 10 * zoom;

    const mtGrad = ctx.createLinearGradient(
      mt.x - mtRX,
      mt.y,
      mt.x + mtRX,
      mt.y
    );
    mtGrad.addColorStop(0, "#661010");
    mtGrad.addColorStop(0.15, "#881515");
    mtGrad.addColorStop(0.35, "#cc3030");
    mtGrad.addColorStop(0.5, "#dd4040");
    mtGrad.addColorStop(0.7, "#aa2020");
    mtGrad.addColorStop(0.85, "#881515");
    mtGrad.addColorStop(1, "#551010");
    ctx.fillStyle = mtGrad;
    ctx.beginPath();
    ctx.ellipse(mt.x, mtBot, mtRX, mtRY, 0, 0, Math.PI, false);
    ctx.lineTo(mt.x - mtRX, mtTop);
    ctx.ellipse(mt.x, mtTop, mtRX, mtRY, 0, Math.PI, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#440808";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(mt.x, mtBot, mtRX, mtRY, 0, 0, Math.PI, false);
    ctx.stroke();

    // Specular highlight
    ctx.strokeStyle = "rgba(255, 120, 100, 0.35)";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(mt.x - mtRX * 0.6, mtBot - 2 * zoom);
    ctx.lineTo(mt.x - mtRX * 0.6, mtTop + 4 * zoom);
    ctx.stroke();

    // Hazard stripes
    ctx.lineWidth = 2.5 * zoom;
    for (let i = 0; i < 3; i++) {
      const sy = mtTop + 6 * zoom + i * 7 * zoom;
      ctx.strokeStyle = "#ffcc00";
      ctx.beginPath();
      ctx.ellipse(
        mt.x,
        sy,
        mtRX * 0.98,
        mtRY * 0.98,
        0,
        -0.1,
        Math.PI + 0.1,
        false
      );
      ctx.stroke();
    }
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < 2; i++) {
      const sy = mtTop + 9.5 * zoom + i * 7 * zoom;
      ctx.strokeStyle = "#222";
      ctx.beginPath();
      ctx.ellipse(
        mt.x,
        sy,
        mtRX * 0.98,
        mtRY * 0.98,
        0,
        -0.1,
        Math.PI + 0.1,
        false
      );
      ctx.stroke();
    }

    // Top cap
    const mtCapG = ctx.createRadialGradient(
      mt.x - 2 * zoom,
      mtTop,
      0,
      mt.x,
      mtTop,
      mtRX
    );
    mtCapG.addColorStop(0, "#5a5a62");
    mtCapG.addColorStop(0.4, "#4a4a52");
    mtCapG.addColorStop(0.8, "#3a3a42");
    mtCapG.addColorStop(1, "#2a2a32");
    ctx.fillStyle = mtCapG;
    ctx.beginPath();
    ctx.ellipse(mt.x, mtTop, mtRX, mtRY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Cap valve
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.ellipse(mt.x, mtTop, 4 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(mt.x, mtTop - 1 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Mounting straps with rivets
    for (let s = 0; s < 2; s++) {
      const sy = mtTop + 10 * zoom + s * 10 * zoom;
      ctx.strokeStyle = "#4a4a55";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        mt.x,
        sy,
        mtRX + 1.5 * zoom,
        mtRY + 1 * zoom,
        0,
        -0.15,
        Math.PI + 0.15,
        false
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(120, 120, 135, 0.3)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        mt.x,
        sy - 0.8 * zoom,
        mtRX + 1.5 * zoom,
        mtRY + 1 * zoom,
        0,
        0.1,
        Math.PI - 0.1,
        false
      );
      ctx.stroke();
      for (const ba of [-0.3, Math.PI + 0.3]) {
        ctx.fillStyle = "#6a6a78";
        ctx.beginPath();
        ctx.arc(
          mt.x + Math.cos(ba) * (mtRX + 1.5 * zoom),
          sy + Math.sin(ba) * (mtRY + 1 * zoom),
          1.5 * zoom,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.fillStyle = "rgba(140, 140, 155, 0.4)";
        ctx.beginPath();
        ctx.arc(
          mt.x + Math.cos(ba) * (mtRX + 1.5 * zoom) - 0.3 * zoom,
          sy + Math.sin(ba) * (mtRY + 1 * zoom) - 0.3 * zoom,
          0.7 * zoom,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Pressure relief valve (side of main tank)
    const prX = mt.x + mtRX * 0.7;
    const prY = mtTop + 5 * zoom;
    ctx.fillStyle = "#5a5a65";
    ctx.beginPath();
    ctx.ellipse(prX, prY, 2.5 * zoom, 1.8 * zoom, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a3a45";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#7a7a88";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(prX + 2 * zoom, prY - 1 * zoom);
    ctx.lineTo(prX + 5 * zoom, prY - 3 * zoom);
    ctx.stroke();
    ctx.fillStyle = "#cc2020";
    ctx.beginPath();
    ctx.arc(prX + 5 * zoom, prY - 3 * zoom, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 100, 100, 0.4)";
    ctx.beginPath();
    ctx.arc(prX + 4.6 * zoom, prY - 3.4 * zoom, 0.6 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Fuel outlet fitting (bottom of main tank)
    const outX = mt.x + mtRX * 0.3;
    const outY = mtBot + 1 * zoom;
    ctx.fillStyle = "#4a4a55";
    ctx.beginPath();
    ctx.ellipse(outX, outY, 3 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3a45";
    ctx.beginPath();
    ctx.ellipse(outX, outY, 1.8 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Secondary fuel tank (green, small) — rotates to rear-right ──
    const st = secTank;
    const stRX = 5.5 * zoom;
    const stRY = stRX * 0.45;
    const stTop = st.y - 10 * zoom;
    const stBot = st.y + 5 * zoom;

    const stGrad = ctx.createLinearGradient(
      st.x - stRX,
      st.y,
      st.x + stRX,
      st.y
    );
    stGrad.addColorStop(0, "#0a3310");
    stGrad.addColorStop(0.15, "#155518");
    stGrad.addColorStop(0.35, "#208830");
    stGrad.addColorStop(0.5, "#28aa38");
    stGrad.addColorStop(0.7, "#1c8828");
    stGrad.addColorStop(0.85, "#155518");
    stGrad.addColorStop(1, "#0a3310");
    ctx.fillStyle = stGrad;
    ctx.beginPath();
    ctx.ellipse(st.x, stBot, stRX, stRY, 0, 0, Math.PI, false);
    ctx.lineTo(st.x - stRX, stTop);
    ctx.ellipse(st.x, stTop, stRX, stRY, 0, Math.PI, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#083008";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(st.x, stBot, stRX, stRY, 0, 0, Math.PI, false);
    ctx.stroke();

    ctx.strokeStyle = "rgba(120, 255, 130, 0.35)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(st.x - stRX * 0.6, stBot - 2 * zoom);
    ctx.lineTo(st.x - stRX * 0.6, stTop + 3 * zoom);
    ctx.stroke();

    // Hazard stripes
    ctx.lineWidth = 1.8 * zoom;
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = "#ffcc00";
      ctx.beginPath();
      ctx.ellipse(
        st.x,
        stTop + 4 * zoom + i * 5 * zoom,
        stRX * 0.98,
        stRY * 0.98,
        0,
        -0.1,
        Math.PI + 0.1,
        false
      );
      ctx.stroke();
    }
    ctx.lineWidth = 1 * zoom;
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    ctx.ellipse(
      st.x,
      stTop + 6.5 * zoom,
      stRX * 0.98,
      stRY * 0.98,
      0,
      -0.1,
      Math.PI + 0.1,
      false
    );
    ctx.stroke();

    // Top cap
    const stCapG = ctx.createRadialGradient(
      st.x - 1 * zoom,
      stTop,
      0,
      st.x,
      stTop,
      stRX
    );
    stCapG.addColorStop(0, "#5a5a62");
    stCapG.addColorStop(0.4, "#4a4a52");
    stCapG.addColorStop(0.8, "#3a3a42");
    stCapG.addColorStop(1, "#2a2a32");
    ctx.fillStyle = stCapG;
    ctx.beginPath();
    ctx.ellipse(st.x, stTop, stRX, stRY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Cap valve
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.ellipse(st.x, stTop, 2.5 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#7a7a82";
    ctx.beginPath();
    ctx.arc(st.x, stTop - 0.5 * zoom, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Mounting strap
    const secStrapY = stTop + 6 * zoom;
    ctx.strokeStyle = "#4a4a55";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      st.x,
      secStrapY,
      stRX + 1 * zoom,
      stRY + 0.8 * zoom,
      0,
      -0.15,
      Math.PI + 0.15,
      false
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(120, 120, 135, 0.25)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      st.x,
      secStrapY - 0.6 * zoom,
      stRX + 1 * zoom,
      stRY + 0.8 * zoom,
      0,
      0.15,
      Math.PI - 0.15,
      false
    );
    ctx.stroke();
    for (const ba of [-0.25, Math.PI + 0.25]) {
      ctx.fillStyle = "#6a6a78";
      ctx.beginPath();
      ctx.arc(
        st.x + Math.cos(ba) * (stRX + 1 * zoom),
        secStrapY + Math.sin(ba) * (stRY + 0.8 * zoom),
        1.2 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Secondary tank outlet fitting
    const soX = st.x - stRX * 0.4;
    const soY = stBot + 0.5 * zoom;
    ctx.fillStyle = "#4a4a55";
    ctx.beginPath();
    ctx.ellipse(soX, soY, 2.2 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#3a3a45";
    ctx.beginPath();
    ctx.ellipse(soX, soY, 1.3 * zoom, 0.9 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Fuel tubes from tanks to manifold (rotation-aware routing) ──
    const mf = manifold;

    // Primary fuel tube (thick red — main tank to manifold)
    ctx.strokeStyle = "#3a2828";
    ctx.lineWidth = 4 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(outX, outY);
    ctx.quadraticCurveTo(
      (outX + mf.x) * 0.5 + perpX * 3 * zoom,
      (outY + mf.y) * 0.5 + 4 * zoom,
      mf.x - fwdX * 3 * zoom,
      mf.y + 2 * zoom
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(180, 80, 70, 0.25)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(outX + 0.5 * zoom, outY - 0.8 * zoom);
    ctx.quadraticCurveTo(
      (outX + mf.x) * 0.5 + perpX * 3 * zoom + 0.5 * zoom,
      (outY + mf.y) * 0.5 + 3 * zoom,
      mf.x - fwdX * 3 * zoom + 0.5 * zoom,
      mf.y + 1.2 * zoom
    );
    ctx.stroke();

    // Secondary oxidizer tube (green — sec tank to manifold)
    ctx.strokeStyle = "#1a3320";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.moveTo(soX, soY);
    ctx.quadraticCurveTo(
      (soX + mf.x) * 0.5 - perpX * 2 * zoom,
      (soY + mf.y) * 0.5 + 5 * zoom,
      mf.x + fwdX * 2 * zoom,
      mf.y + 2 * zoom
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(80, 180, 90, 0.2)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(soX + 0.4 * zoom, soY - 0.6 * zoom);
    ctx.quadraticCurveTo(
      (soX + mf.x) * 0.5 - perpX * 2 * zoom + 0.4 * zoom,
      (soY + mf.y) * 0.5 + 4.4 * zoom,
      mf.x + fwdX * 2 * zoom + 0.4 * zoom,
      mf.y + 1.4 * zoom
    );
    ctx.stroke();

    // Pilot gas tube (thin blue — main tank cap to igniter)
    ctx.strokeStyle = "#222838";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(mt.x + 3 * zoom, mtTop + 1 * zoom);
    ctx.bezierCurveTo(
      mt.x + 10 * zoom,
      mtTop - 4 * zoom,
      turretX - fwdX * 6 * zoom,
      turretY - 18 * zoom,
      turretX - fwdX * 3 * zoom,
      turretY - 12 * zoom
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(80, 120, 200, 0.2)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(mt.x + 3 * zoom, mtTop + 0.3 * zoom);
    ctx.bezierCurveTo(
      mt.x + 10 * zoom,
      mtTop - 4.7 * zoom,
      turretX - fwdX * 6 * zoom,
      turretY - 18.7 * zoom,
      turretX - fwdX * 3 * zoom,
      turretY - 12.7 * zoom
    );
    ctx.stroke();

    // Tube clamps on primary fuel line
    for (let tc = 0; tc < 2; tc++) {
      const clampT = 0.3 + tc * 0.35;
      const u = 1 - clampT;
      const clX =
        u * u * outX +
        2 * u * clampT * ((outX + mf.x) * 0.5 + perpX * 3 * zoom) +
        clampT * clampT * (mf.x - fwdX * 3 * zoom);
      const clY =
        u * u * outY +
        2 * u * clampT * ((outY + mf.y) * 0.5 + 4 * zoom) +
        clampT * clampT * (mf.y + 2 * zoom);
      ctx.fillStyle = "#5a5a68";
      ctx.beginPath();
      ctx.ellipse(clX, clY, 3 * zoom, 2.2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a3a45";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#7a7a88";
      ctx.beginPath();
      ctx.arc(clX + 1.5 * zoom, clY - 0.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tube clamp on oxidizer line
    {
      const t2 = 0.45;
      const u2 = 1 - t2;
      const oxX =
        u2 * u2 * soX +
        2 * u2 * t2 * ((soX + mf.x) * 0.5 - perpX * 2 * zoom) +
        t2 * t2 * (mf.x + fwdX * 2 * zoom);
      const oxY =
        u2 * u2 * soY +
        2 * u2 * t2 * ((soY + mf.y) * 0.5 + 5 * zoom) +
        t2 * t2 * (mf.y + 2 * zoom);
      ctx.fillStyle = "#5a5a68";
      ctx.beginPath();
      ctx.ellipse(oxX, oxY, 2.5 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#3a3a45";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    // ── Valve manifold block (rotation-aware position) ──
    {
      const mfW = 8 * zoom;
      const mfH = 5 * zoom;
      const mfD = 3 * zoom;

      // Top face
      const mTopG = ctx.createLinearGradient(
        mf.x - mfW * 0.5,
        mf.y - mfH,
        mf.x + mfW * 0.5,
        mf.y - mfH
      );
      mTopG.addColorStop(0, "#505058");
      mTopG.addColorStop(0.4, "#5e5e66");
      mTopG.addColorStop(1, "#48484f");
      ctx.fillStyle = mTopG;
      ctx.beginPath();
      ctx.moveTo(mf.x, mf.y - mfH - mfD);
      ctx.lineTo(mf.x + mfW * 0.5, mf.y - mfH - mfD * 0.4);
      ctx.lineTo(mf.x, mf.y - mfH + mfD * 0.2);
      ctx.lineTo(mf.x - mfW * 0.5, mf.y - mfH - mfD * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a5a65";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Left face
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.moveTo(mf.x - mfW * 0.5, mf.y - mfH - mfD * 0.4);
      ctx.lineTo(mf.x, mf.y - mfH + mfD * 0.2);
      ctx.lineTo(mf.x, mf.y + mfD * 0.2);
      ctx.lineTo(mf.x - mfW * 0.5, mf.y - mfD * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Right face
      ctx.fillStyle = "#44444c";
      ctx.beginPath();
      ctx.moveTo(mf.x + mfW * 0.5, mf.y - mfH - mfD * 0.4);
      ctx.lineTo(mf.x, mf.y - mfH + mfD * 0.2);
      ctx.lineTo(mf.x, mf.y + mfD * 0.2);
      ctx.lineTo(mf.x + mfW * 0.5, mf.y - mfD * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Inlet ports
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.ellipse(
        mf.x - mfW * 0.22,
        mf.y - mfH * 0.45,
        1.5 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = "#5a5a65";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.ellipse(
        mf.x + mfW * 0.22,
        mf.y - mfH * 0.45,
        1.5 * zoom,
        1.2 * zoom,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.strokeStyle = "#5a5a65";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Valve handle on top
      const hY = mf.y - mfH - mfD * 0.8;
      ctx.strokeStyle = "#6a6a78";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(mf.x - 2 * zoom, hY);
      ctx.lineTo(mf.x + 2 * zoom, hY);
      ctx.stroke();
      ctx.fillStyle = "#dd3030";
      ctx.beginPath();
      ctx.arc(mf.x, hY, 1.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 120, 120, 0.35)";
      ctx.beginPath();
      ctx.arc(mf.x - 0.4 * zoom, hY - 0.4 * zoom, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Bolts on manifold top
      const mBolts = [
        { x: mf.x - mfW * 0.35, y: mf.y - mfH - mfD * 0.3 },
        { x: mf.x + mfW * 0.35, y: mf.y - mfH - mfD * 0.3 },
        { x: mf.x, y: mf.y - mfH + mfD * 0.05 },
      ];
      for (const bolt of mBolts) {
        ctx.fillStyle = "#58585e";
        ctx.beginPath();
        ctx.arc(bolt.x, bolt.y, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(140, 140, 155, 0.3)";
        ctx.beginPath();
        ctx.arc(
          bolt.x - 0.2 * zoom,
          bolt.y - 0.2 * zoom,
          0.4 * zoom,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // ── Inline fuel pump (rotation-aware) ──
      const pp = pumpPos;
      const pR = 4 * zoom;

      // Feed tube from manifold top to pump
      ctx.strokeStyle = "#3a2828";
      ctx.lineWidth = 3 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(mf.x, mf.y - mfH - mfD * 0.5);
      ctx.lineTo(pp.x, pp.y + pR * 0.5);
      ctx.stroke();

      // Pump body
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.ellipse(pp.x, pp.y + 2 * zoom, pR, pR * 0.5, 0, 0, Math.PI, false);
      ctx.lineTo(pp.x - pR, pp.y - 1 * zoom);
      ctx.ellipse(
        pp.x,
        pp.y - 1 * zoom,
        pR,
        pR * 0.5,
        0,
        Math.PI,
        Math.PI * 2,
        false
      );
      ctx.closePath();
      ctx.fill();

      const pGrad = ctx.createLinearGradient(pp.x - pR, pp.y, pp.x + pR, pp.y);
      pGrad.addColorStop(0, "#353540");
      pGrad.addColorStop(0.35, "#4a4a55");
      pGrad.addColorStop(0.65, "#555560");
      pGrad.addColorStop(1, "#3a3a42");
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.ellipse(pp.x, pp.y + 2 * zoom, pR, pR * 0.5, 0, 0, Math.PI, false);
      ctx.lineTo(pp.x - pR, pp.y - 1 * zoom);
      ctx.ellipse(
        pp.x,
        pp.y - 1 * zoom,
        pR,
        pR * 0.5,
        0,
        Math.PI,
        Math.PI * 2,
        false
      );
      ctx.closePath();
      ctx.fill();

      // Pump top cap
      const pCapG = ctx.createRadialGradient(
        pp.x - 1 * zoom,
        pp.y - 1 * zoom,
        0,
        pp.x,
        pp.y - 1 * zoom,
        pR
      );
      pCapG.addColorStop(0, "#5a5a65");
      pCapG.addColorStop(0.5, "#4e4e58");
      pCapG.addColorStop(1, "#3a3a45");
      ctx.fillStyle = pCapG;
      ctx.beginPath();
      ctx.ellipse(pp.x, pp.y - 1 * zoom, pR, pR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a5a68";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Motor housing
      const motorX = pp.x + pR * 0.8;
      const motorY = pp.y;
      ctx.fillStyle = "#44444c";
      ctx.beginPath();
      ctx.ellipse(motorX, motorY, 2.5 * zoom, 2 * zoom, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a5a65";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#7a7a88";
      ctx.beginPath();
      ctx.arc(motorX, motorY, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Spinning indicator
      const pumpSpin = time * 4;
      ctx.strokeStyle = "rgba(100, 100, 115, 0.5)";
      ctx.lineWidth = 0.7 * zoom;
      for (let ps = 0; ps < 3; ps++) {
        const psA = pumpSpin + (ps / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(pp.x, pp.y - 1 * zoom);
        ctx.lineTo(
          pp.x + Math.cos(psA) * pR * 0.7,
          pp.y - 1 * zoom + Math.sin(psA) * pR * 0.35
        );
        ctx.stroke();
      }
      ctx.fillStyle = "#4a4a55";
      ctx.beginPath();
      ctx.arc(pp.x, pp.y - 1 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Feed tube from pump to igniter
      ctx.strokeStyle = "#3a2828";
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(pp.x, pp.y - 1 * zoom - pR * 0.5);
      ctx.quadraticCurveTo(
        (pp.x + turretX) * 0.5,
        turretY - 12 * zoom,
        turretX,
        turretY - 10 * zoom
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(180, 80, 70, 0.2)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(pp.x + 0.4 * zoom, pp.y - 1 * zoom - pR * 0.5 - 0.6 * zoom);
      ctx.quadraticCurveTo(
        (pp.x + turretX) * 0.5 + 0.4 * zoom,
        turretY - 12.6 * zoom,
        turretX + 0.4 * zoom,
        turretY - 10.6 * zoom
      );
      ctx.stroke();

      // Oxidizer tube from manifold to igniter (opposite side)
      ctx.strokeStyle = "#1a3320";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(mf.x + mfW * 0.25, mf.y - mfH - mfD * 0.3);
      ctx.bezierCurveTo(
        mf.x + fwdX * 8 * zoom + perpX * 5 * zoom,
        mf.y - 10 * zoom,
        turretX + perpX * 6 * zoom,
        turretY - 13 * zoom,
        turretX + perpX * 3 * zoom,
        turretY - 11 * zoom
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(80, 180, 90, 0.15)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        mf.x + mfW * 0.25 + 0.3 * zoom,
        mf.y - mfH - mfD * 0.3 - 0.5 * zoom
      );
      ctx.bezierCurveTo(
        mf.x + fwdX * 8 * zoom + perpX * 5 * zoom + 0.3 * zoom,
        mf.y - 10.5 * zoom,
        turretX + perpX * 6 * zoom + 0.3 * zoom,
        turretY - 13.5 * zoom,
        turretX + perpX * 3 * zoom + 0.3 * zoom,
        turretY - 11.5 * zoom
      );
      ctx.stroke();
    }

    // Pressure regulator fitting (on output tube near igniter)
    {
      const regPos = tp(-1, -2, 6);
      const regR = 2.5 * zoom;
      ctx.fillStyle = "#50505a";
      ctx.beginPath();
      for (let rh = 0; rh < 6; rh++) {
        const a = (rh / 6) * Math.PI * 2 - Math.PI / 6;
        const rx = regPos.x + Math.cos(a) * regR;
        const ry = regPos.y + Math.sin(a) * regR * 0.65;
        if (rh === 0) {
          ctx.moveTo(rx, ry);
        } else {
          ctx.lineTo(rx, ry);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#3a3a45";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#2a2a32";
      ctx.beginPath();
      ctx.arc(regPos.x, regPos.y, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // ════════════════════════════════════════════════════════════
  // CENTER GROUP: igniter housing, deflectors, coil, gauge
  // ════════════════════════════════════════════════════════════
  const drawCenterComponents = () => {
    // ── Igniter housing (armored combustion chamber) ──
    const ignY = turretY - 10 * zoom;
    const ignRX = 11 * zoom;
    const ignRY = 7.5 * zoom;
    const ignH = 7 * zoom;

    // Cylinder body with hot-metal gradient
    const ignGrad = ctx.createLinearGradient(
      turretX - ignRX,
      ignY,
      turretX + ignRX,
      ignY
    );
    ignGrad.addColorStop(0, "#2a2530");
    ignGrad.addColorStop(0.2, "#3e3842");
    ignGrad.addColorStop(0.45, "#504850");
    ignGrad.addColorStop(0.55, "#585058");
    ignGrad.addColorStop(0.8, "#3e3842");
    ignGrad.addColorStop(1, "#2a2530");
    ctx.fillStyle = ignGrad;
    ctx.beginPath();
    ctx.ellipse(turretX, ignY + ignH, ignRX, ignRY, 0, 0, Math.PI, false);
    ctx.lineTo(turretX - ignRX, ignY);
    ctx.ellipse(turretX, ignY, ignRX, ignRY, 0, Math.PI, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    // Bottom rim edge
    ctx.strokeStyle = "#1a1a22";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(turretX, ignY + ignH, ignRX, ignRY, 0, 0, Math.PI, false);
    ctx.stroke();

    // Reinforcement ribs (3 horizontal bands)
    for (let rb = 0; rb < 3; rb++) {
      const ribY = ignY + ignH * (0.2 + rb * 0.3);
      ctx.strokeStyle = "#4a4550";
      ctx.lineWidth = 1.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        turretX,
        ribY,
        ignRX + 0.5 * zoom,
        ignRY + 0.3 * zoom,
        0,
        -0.05,
        Math.PI + 0.05,
        false
      );
      ctx.stroke();
      ctx.strokeStyle = "rgba(100, 95, 110, 0.3)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        turretX,
        ribY - 0.6 * zoom,
        ignRX + 0.5 * zoom,
        ignRY + 0.3 * zoom,
        0,
        0.1,
        Math.PI - 0.1,
        false
      );
      ctx.stroke();
    }

    // Heat vents (glowing slits in the cylinder wall)
    for (let hv = 0; hv < 6; hv++) {
      const hvAngle = (hv / 6) * Math.PI * 2;
      const hvDepth = Math.cos(hvAngle);
      if (hvDepth > -0.2) {
        const hvX = turretX + Math.cos(hvAngle) * ignRX * 0.98;
        const hvY1 = ignY + ignH * 0.3 + Math.sin(hvAngle) * ignRY * 0.98;
        const hvY2 = hvY1 + ignH * 0.35;
        const hvVis = 0.4 + hvDepth * 0.4;

        // Vent slit
        ctx.strokeStyle = `rgba(20, 18, 25, ${hvVis})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(hvX, hvY1);
        ctx.lineTo(hvX, hvY2);
        ctx.stroke();

        // Inner combustion glow
        const ventGlow = isAttacking
          ? 0.6 + attackPulse * 0.4
          : 0.25 + Math.sin(time * 4 + hv) * 0.1;
        ctx.strokeStyle = `rgba(255, 120, 30, ${ventGlow * hvVis})`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(hvX, hvY1 + 1 * zoom);
        ctx.lineTo(hvX, hvY2 - 1 * zoom);
        ctx.stroke();
      }
    }

    // Specular highlight on cylinder body
    ctx.strokeStyle = "rgba(120, 115, 130, 0.25)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(turretX - ignRX * 0.55, ignY + ignH - 2 * zoom);
    ctx.lineTo(turretX - ignRX * 0.55, ignY + 3 * zoom);
    ctx.stroke();

    // Armored top plate with hex bolt pattern
    const ignTopG = ctx.createRadialGradient(
      turretX - 2 * zoom,
      ignY,
      0,
      turretX,
      ignY,
      ignRX
    );
    ignTopG.addColorStop(0, "#626068");
    ignTopG.addColorStop(0.35, "#555058");
    ignTopG.addColorStop(0.7, "#484350");
    ignTopG.addColorStop(1, "#3a3540");
    ctx.fillStyle = ignTopG;
    ctx.beginPath();
    ctx.ellipse(turretX, ignY, ignRX, ignRY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raised rim ring
    ctx.strokeStyle = "#5a5560";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      turretX,
      ignY,
      ignRX - 1 * zoom,
      ignRY - 0.7 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(100, 95, 110, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      turretX,
      ignY - 0.5 * zoom,
      ignRX - 1.5 * zoom,
      ignRY - 1 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Hex bolt pattern on top plate
    for (let hb = 0; hb < 6; hb++) {
      const hbA = rotation * 0.5 + (hb / 6) * Math.PI * 2;
      const hbR = ignRX * 0.6;
      const hbX = turretX + Math.cos(hbA) * hbR;
      const hbY = ignY + Math.sin(hbA) * hbR * 0.65;
      ctx.fillStyle = "#48444e";
      ctx.beginPath();
      ctx.arc(hbX, hbY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(130, 125, 140, 0.35)";
      ctx.beginPath();
      ctx.arc(hbX - 0.3 * zoom, hbY - 0.3 * zoom, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central combustion glow through top plate
    const combGlow = isAttacking
      ? 0.7 + attackPulse * 0.3
      : 0.3 + Math.sin(time * 5) * 0.1;
    const combGrad = ctx.createRadialGradient(
      turretX,
      ignY,
      0,
      turretX,
      ignY,
      5 * zoom
    );
    combGrad.addColorStop(0, `rgba(255, 160, 60, ${combGlow * 0.6})`);
    combGrad.addColorStop(0.5, `rgba(255, 100, 20, ${combGlow * 0.3})`);
    combGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
    ctx.fillStyle = combGrad;
    ctx.beginPath();
    ctx.ellipse(turretX, ignY, 4.5 * zoom, 3 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── Rotating flame deflector shields ──
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
          ignY + Math.sin(shieldAngle - angleSpan * 0.4) * innerR * 0.7;
        const p1x = turretX + Math.cos(shieldAngle - angleSpan * 0.35) * outerR;
        const p1y =
          ignY +
          Math.sin(shieldAngle - angleSpan * 0.35) * outerR * 0.7 -
          2 * zoom;
        const p2x = turretX + Math.cos(shieldAngle) * (outerR + 1.5 * zoom);
        const p2y =
          ignY +
          Math.sin(shieldAngle) * (outerR + 1.5 * zoom) * 0.7 -
          2.5 * zoom;
        const p3x = turretX + Math.cos(shieldAngle + angleSpan * 0.35) * outerR;
        const p3y =
          ignY +
          Math.sin(shieldAngle + angleSpan * 0.35) * outerR * 0.7 -
          2 * zoom;
        const p4x = turretX + Math.cos(shieldAngle + angleSpan * 0.4) * innerR;
        const p4y =
          ignY + Math.sin(shieldAngle + angleSpan * 0.4) * innerR * 0.7;

        // Side thickness face
        if (shieldSide > -0.3) {
          const sideGrad = ctx.createLinearGradient(
            p2x,
            p2y,
            p2x,
            p2y + shieldThickness
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
          ignY + Math.sin(shieldAngle - angleSpan * 0.3) * outerR * 0.7,
          turretX + Math.cos(shieldAngle + angleSpan * 0.3) * outerR,
          ignY + Math.sin(shieldAngle + angleSpan * 0.3) * outerR * 0.7
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
        ctx.strokeStyle = `rgba(180, 120, 80, ${visibility * 0.5})`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.stroke();

        // Top edge highlight
        ctx.strokeStyle = `rgba(200, 160, 120, ${visibility * 0.4})`;
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.stroke();

        // Rivet
        const rivetX = turretX + Math.cos(shieldAngle) * (outerR - 1.5 * zoom);
        const rivetY =
          ignY +
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
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Inner igniter ring
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(turretX, ignY, 6 * zoom, 4.5 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();

    // ── Ignition coil / transformer (rotation-aware position) ──
    {
      const cl = coilPos;
      const clW = 4 * zoom;
      const clH = 6 * zoom;

      ctx.fillStyle = "#2a2a35";
      ctx.save();
      ctx.translate(cl.x, cl.y);
      ctx.beginPath();
      ctx.rect(-clW * 0.5, -clH * 0.5, clW, clH);
      ctx.fill();
      ctx.strokeStyle = "#3a3a45";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      ctx.restore();

      // Copper windings
      ctx.strokeStyle = "#b87333";
      ctx.lineWidth = 0.8 * zoom;
      const coilCount = 5;
      for (let cw = 0; cw < coilCount; cw++) {
        const cwY = cl.y - clH * 0.35 + (cw / (coilCount - 1)) * clH * 0.7;
        ctx.beginPath();
        ctx.ellipse(cl.x, cwY, clW * 0.55, 1.2 * zoom, 0, 0, Math.PI, false);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(220, 160, 80, 0.3)";
      ctx.lineWidth = 0.4 * zoom;
      for (let cw = 0; cw < coilCount; cw++) {
        const cwY = cl.y - clH * 0.35 + (cw / (coilCount - 1)) * clH * 0.7;
        ctx.beginPath();
        ctx.ellipse(
          cl.x,
          cwY - 0.3 * zoom,
          clW * 0.5,
          0.8 * zoom,
          0,
          0.3,
          Math.PI - 0.3,
          false
        );
        ctx.stroke();
      }

      // Terminal posts
      ctx.fillStyle = "#8a8a95";
      ctx.beginPath();
      ctx.arc(
        cl.x - 1.2 * zoom,
        cl.y - clH * 0.5 - 1 * zoom,
        0.8 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        cl.x + 1.2 * zoom,
        cl.y - clH * 0.5 - 1 * zoom,
        0.8 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Wiring to igniter (rotation-aware routing)
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(cl.x - 1.2 * zoom, cl.y - clH * 0.5 - 1 * zoom);
      ctx.quadraticCurveTo(
        (cl.x + turretX) * 0.5,
        turretY - 15 * zoom,
        turretX + perpX * 2 * zoom,
        turretY - 11 * zoom
      );
      ctx.stroke();
      ctx.strokeStyle = "#882222";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(cl.x + 1.2 * zoom, cl.y - clH * 0.5 - 1 * zoom);
      ctx.quadraticCurveTo(
        (cl.x + turretX) * 0.5 + perpX * 2 * zoom,
        turretY - 16 * zoom,
        turretX + perpX * 3 * zoom,
        turretY - 10 * zoom
      );
      ctx.stroke();

      // Spark glow
      const sparkA = 0.3 + Math.sin(time * 15) * 0.2;
      ctx.fillStyle = `rgba(100, 180, 255, ${sparkA})`;
      ctx.beginPath();
      ctx.arc(
        cl.x - 1.2 * zoom,
        cl.y - clH * 0.5 - 1 * zoom,
        1.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // ── Wiring conduit (rotation-aware path) ──
    {
      const wStart = tp(-3, -6, 2);
      const wMid = tp(0, -2, 4);
      const wEnd = tp(1, 3, 3);
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(wStart.x, wStart.y);
      ctx.quadraticCurveTo(wMid.x, wMid.y, wEnd.x, wEnd.y);
      ctx.stroke();
      ctx.strokeStyle = "rgba(80, 80, 90, 0.3)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(wStart.x, wStart.y - 0.6 * zoom);
      ctx.quadraticCurveTo(
        wMid.x,
        wMid.y - 0.6 * zoom,
        wEnd.x,
        wEnd.y - 0.6 * zoom
      );
      ctx.stroke();
      // Cable ties
      for (const tieT of [0.3, 0.7]) {
        const u = 1 - tieT;
        const tieX =
          u * u * wStart.x + 2 * u * tieT * wMid.x + tieT * tieT * wEnd.x;
        const tieY =
          u * u * wStart.y + 2 * u * tieT * wMid.y + tieT * tieT * wEnd.y;
        ctx.fillStyle = "#4a4a55";
        ctx.beginPath();
        ctx.ellipse(tieX, tieY, 1.5 * zoom, 2.2 * zoom, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Pilot flame indicator (center glow)
    const flameGlow = isAttacking ? 0.8 : 0.5 + Math.sin(time * 6) * 0.2;
    const flameGrad = ctx.createRadialGradient(
      turretX,
      ignY,
      0,
      turretX,
      ignY,
      3.5 * zoom
    );
    flameGrad.addColorStop(0, `rgba(255, 200, 100, ${flameGlow})`);
    flameGrad.addColorStop(0.4, `rgba(255, 140, 50, ${flameGlow * 0.7})`);
    flameGrad.addColorStop(0.8, `rgba(255, 80, 20, ${flameGlow * 0.4})`);
    flameGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.arc(turretX, ignY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  };

  // ════════════════════════════════════════════════════════════
  // FRONT GROUP: blast shield, nozzle collar, heat ring
  // ════════════════════════════════════════════════════════════
  const drawFrontComponents = () => {
    // ── BLAST SHIELD — curved welded-steel heat deflector ──
    // Arc of heavy plates in front of the igniter, shielding the mechanism
    const shieldFwd = 5;
    const shieldSpread = 13;
    const shieldH = 14 * zoom;
    const segments = 7;
    const arcSpread = Math.PI * 0.7;

    for (let i = 0; i < segments; i++) {
      const t0 = (i / segments - 0.5) * arcSpread;
      const t1 = ((i + 1) / segments - 0.5) * arcSpread;

      // Outer edge of plate (facing enemy)
      const o0 = tp(
        shieldFwd + Math.cos(t0) * 3,
        Math.sin(t0) * shieldSpread,
        0
      );
      const o1 = tp(
        shieldFwd + Math.cos(t1) * 3,
        Math.sin(t1) * shieldSpread,
        0
      );
      // Inner edge (toward turret)
      const i0 = tp(
        shieldFwd + Math.cos(t0) * 3 - 1.5,
        Math.sin(t0) * shieldSpread * 0.8,
        0
      );
      const i1 = tp(
        shieldFwd + Math.cos(t1) * 3 - 1.5,
        Math.sin(t1) * shieldSpread * 0.8,
        0
      );

      // Depth-based shading
      const segAngle = (t0 + t1) * 0.5;
      const segDepth = Math.cos(rotation + segAngle);
      const lit = 0.25 + Math.max(0, segDepth) * 0.35;
      const r = Math.floor(45 + lit * 45);
      const g = Math.floor(40 + lit * 38);
      const b = Math.floor(35 + lit * 32);

      // Front face (vertical wall)
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(o0.x, o0.y - shieldH * 0.3);
      ctx.lineTo(o1.x, o1.y - shieldH * 0.3);
      ctx.lineTo(o1.x, o1.y + shieldH * 0.7);
      ctx.lineTo(o0.x, o0.y + shieldH * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(30, 25, 20, 0.5)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Top edge (thickness visible from above)
      ctx.fillStyle = `rgb(${r + 18}, ${g + 15}, ${b + 12})`;
      ctx.beginPath();
      ctx.moveTo(o0.x, o0.y - shieldH * 0.3);
      ctx.lineTo(o1.x, o1.y - shieldH * 0.3);
      ctx.lineTo(i1.x, i1.y - shieldH * 0.3);
      ctx.lineTo(i0.x, i0.y - shieldH * 0.3);
      ctx.closePath();
      ctx.fill();

      // Heat tempering discoloration bands (straw → gold → blue)
      const heatBand = i / segments;
      let heatColor: string;
      if (heatBand < 0.25) {
        heatColor = `rgba(120, 100, 180, ${0.15 + Math.sin(time * 1.5 + i) * 0.04})`;
      } else if (heatBand < 0.5) {
        heatColor = `rgba(100, 80, 160, ${0.12 + Math.sin(time * 1.5 + i) * 0.04})`;
      } else if (heatBand < 0.75) {
        heatColor = `rgba(180, 150, 60, ${0.12 + Math.sin(time * 1.5 + i) * 0.04})`;
      } else {
        heatColor = `rgba(200, 180, 80, ${0.15 + Math.sin(time * 1.5 + i) * 0.04})`;
      }
      ctx.fillStyle = heatColor;
      ctx.beginPath();
      ctx.moveTo(o0.x, o0.y);
      ctx.lineTo(o1.x, o1.y);
      ctx.lineTo(o1.x, o1.y + shieldH * 0.4);
      ctx.lineTo(o0.x, o0.y + shieldH * 0.4);
      ctx.closePath();
      ctx.fill();

      // Rivets along top and bottom edges
      const rvX = (o0.x + o1.x) * 0.5;
      const rvY = (o0.y + o1.y) * 0.5;
      ctx.fillStyle = "#5a5a65";
      ctx.beginPath();
      ctx.arc(rvX, rvY - shieldH * 0.2, 1.3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(140, 140, 155, 0.35)";
      ctx.beginPath();
      ctx.arc(
        rvX - 0.3 * zoom,
        rvY - shieldH * 0.2 - 0.3 * zoom,
        0.5 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.fillStyle = "#5a5a65";
      ctx.beginPath();
      ctx.arc(rvX, rvY + shieldH * 0.55, 1.3 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Weld seam between plates
      if (i > 0) {
        ctx.strokeStyle = `rgba(80, 70, 60, ${lit * 0.6})`;
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(o0.x, o0.y - shieldH * 0.3);
        ctx.lineTo(o0.x, o0.y + shieldH * 0.7);
        ctx.stroke();
      }
    }

    // Blast shield support brackets (angled struts from igniter to shield)
    for (const side of [-1, 0, 1]) {
      const bStart = tp(2, side * 5, 0);
      const bEnd = tp(shieldFwd, side * shieldSpread * 0.35, 0);
      ctx.strokeStyle = "#4a4a55";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(bStart.x, bStart.y + 2 * zoom);
      ctx.lineTo(bEnd.x, bEnd.y + 2 * zoom);
      ctx.stroke();
      ctx.strokeStyle = "rgba(100, 100, 110, 0.3)";
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(bStart.x, bStart.y + 1 * zoom);
      ctx.lineTo(bEnd.x, bEnd.y + 1 * zoom);
      ctx.stroke();
      // Bracket mounting bolts
      ctx.fillStyle = "#7a7a88";
      ctx.beginPath();
      ctx.arc(bEnd.x, bEnd.y + 2 * zoom, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#7a7a88";
      ctx.beginPath();
      ctx.arc(bStart.x, bStart.y + 2 * zoom, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Mixing chamber + nozzle collar (barrel transition) ──
    const mcFwd = 4;
    const mcX = turretX + cosR * mcFwd * zoom;
    const mcY = turretY - 10 * zoom + sinR * mcFwd * 0.5 * zoom;
    const mcRX = 8 * zoom;
    const mcRY = 5.5 * zoom;
    const mcH = 5 * zoom;

    // Chamber cylinder body
    const mcGrad = ctx.createLinearGradient(mcX - mcRX, mcY, mcX + mcRX, mcY);
    mcGrad.addColorStop(0, "#2e2a32");
    mcGrad.addColorStop(0.25, "#403a45");
    mcGrad.addColorStop(0.5, "#4a4450");
    mcGrad.addColorStop(0.75, "#403a45");
    mcGrad.addColorStop(1, "#2e2a32");
    ctx.fillStyle = mcGrad;
    ctx.beginPath();
    ctx.ellipse(mcX, mcY + mcH * 0.5, mcRX, mcRY, 0, 0, Math.PI, false);
    ctx.lineTo(mcX - mcRX, mcY - mcH * 0.5);
    ctx.ellipse(
      mcX,
      mcY - mcH * 0.5,
      mcRX,
      mcRY,
      0,
      Math.PI,
      Math.PI * 2,
      false
    );
    ctx.closePath();
    ctx.fill();

    // Bottom edge
    ctx.strokeStyle = "#1e1a22";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(mcX, mcY + mcH * 0.5, mcRX, mcRY, 0, 0, Math.PI, false);
    ctx.stroke();

    // Chamber reinforcement band
    ctx.strokeStyle = "#555060";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      mcX,
      mcY,
      mcRX + 0.8 * zoom,
      mcRY + 0.5 * zoom,
      0,
      -0.05,
      Math.PI + 0.05,
      false
    );
    ctx.stroke();

    // Top cap
    const mcTopG = ctx.createRadialGradient(
      mcX - 1 * zoom,
      mcY - mcH * 0.5,
      0,
      mcX,
      mcY - mcH * 0.5,
      mcRX
    );
    mcTopG.addColorStop(0, "#5a5560");
    mcTopG.addColorStop(0.5, "#4a4550");
    mcTopG.addColorStop(1, "#3a3540");
    ctx.fillStyle = mcTopG;
    ctx.beginPath();
    ctx.ellipse(mcX, mcY - mcH * 0.5, mcRX, mcRY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5560";
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // Heat glow ring around mixing chamber
    const heatAlpha = isAttacking
      ? 0.5 + attackPulse * 0.3
      : 0.15 + Math.sin(time * 3) * 0.06;
    ctx.strokeStyle = `rgba(220, 110, 30, ${heatAlpha})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      mcX,
      mcY - mcH * 0.5,
      mcRX + 2 * zoom,
      mcRY + 1.5 * zoom,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    // Fuel injector array around chamber body
    for (let ni = 0; ni < 8; ni++) {
      const niAngle = rotation + (ni / 8) * Math.PI * 2;
      const niDepth = Math.cos(niAngle);
      if (niDepth > -0.2) {
        const niX = mcX + Math.cos(niAngle) * mcRX * 0.95;
        const niY = mcY + Math.sin(niAngle) * mcRY * 0.95;
        const niVis = 0.4 + niDepth * 0.4;

        // Injector port
        ctx.fillStyle = `rgba(25, 22, 30, ${niVis})`;
        ctx.beginPath();
        ctx.arc(niX, niY, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Glow when firing
        if (isAttacking) {
          ctx.fillStyle = `rgba(255, 140, 40, ${attackPulse * niVis * 0.5})`;
          ctx.beginPath();
          ctx.arc(niX, niY, 2 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Nozzle collar (inner opening where barrel connects)
    const ncX = mcX + cosR * 2 * zoom;
    const ncY = mcY - mcH * 0.5 + sinR * 1 * zoom;
    ctx.fillStyle = "#333338";
    ctx.beginPath();
    ctx.ellipse(
      ncX,
      ncY + 1.5 * zoom,
      5.5 * zoom,
      4 * zoom,
      rotation,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.ellipse(ncX, ncY, 5 * zoom, 3.5 * zoom, rotation, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Bore opening
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.ellipse(ncX, ncY, 3 * zoom, 2 * zoom, rotation, 0, Math.PI * 2);
    ctx.fill();
    // Inner bore glow
    if (isAttacking) {
      const boreGlow = attackPulse * 0.6;
      ctx.fillStyle = `rgba(255, 140, 40, ${boreGlow})`;
      ctx.beginPath();
      ctx.ellipse(ncX, ncY, 2.5 * zoom, 1.8 * zoom, rotation, 0, Math.PI * 2);
      ctx.fill();
    }

    // Spark electrodes flanking the nozzle
    const sparkBase = tp(7, 0, 10);
    for (const side of [-1, 1]) {
      const eOff = perpX * 3.5 * zoom * side;
      const eOffY = perpY * 3.5 * zoom * side;
      ctx.strokeStyle = "#7a7a88";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(sparkBase.x + eOff, sparkBase.y + eOffY);
      ctx.lineTo(
        sparkBase.x + eOff + fwdX * 5 * zoom,
        sparkBase.y + eOffY + fwdY * 5 * zoom
      );
      ctx.stroke();
      ctx.fillStyle = "#aaaabc";
      ctx.beginPath();
      ctx.arc(
        sparkBase.x + eOff + fwdX * 5 * zoom,
        sparkBase.y + eOffY + fwdY * 5 * zoom,
        0.8 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Spark arc between electrodes
    if (isAttacking || Math.sin(time * 12) > 0.6) {
      const sparkAlpha = isAttacking
        ? 0.6 + attackPulse * 0.4
        : 0.3 + Math.sin(time * 20) * 0.15;
      ctx.strokeStyle = `rgba(150, 200, 255, ${sparkAlpha})`;
      ctx.lineWidth = 0.8 * zoom;
      const seTip = {
        x: sparkBase.x + fwdX * 5 * zoom,
        y: sparkBase.y + fwdY * 5 * zoom,
      };
      ctx.beginPath();
      ctx.moveTo(seTip.x - perpX * 3.5 * zoom, seTip.y - perpY * 3.5 * zoom);
      ctx.quadraticCurveTo(
        seTip.x + Math.sin(time * 30) * zoom,
        seTip.y - 1.5 * zoom + Math.cos(time * 25) * zoom,
        seTip.x + perpX * 3.5 * zoom,
        seTip.y + perpY * 3.5 * zoom
      );
      ctx.stroke();
    }
  };

  // ════════════════════════════════════════════════════════════
  // DEPTH-ORDERED RENDERING
  // Rear (tanks, tubes, plumbing) always draws first — they sit
  // at base elevation below the barrel and housing.
  // Then the upper components (housing, nozzle, front) sort by Y.
  // ════════════════════════════════════════════════════════════
  drawRearComponents();

  const drawNozzle = () => {
    drawFlamethrowerNozzle(
      ctx,
      turretX,
      turretY - 10 * zoom,
      rotation,
      foreshorten,
      zoom,
      tower,
      time,
      recoilOffset
    );
  };

  // ════════════════════════════════════════════════════════════
  // SATELLITE FUEL TANK (left) AND ARMOR PLATE (right)
  // These orbit the turret — included in the upper layer sort
  // so they depth-sort correctly against the nozzle barrel.
  // ════════════════════════════════════════════════════════════
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

  const tankSide = Math.sin(tankAngle);
  const towerId = tower.id;

  const drawSatelliteTank = () => {
    draw3DFuelTank(
      ctx,
      tankCenterX,
      tankCenterY,
      tankAngle,
      zoom,
      time,
      isAttacking,
      attackPulse,
      "small"
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
      tankSide
    );
  };

  const drawArmorPlate = () => {
    draw3DArmorShield(
      ctx,
      plateCenterX,
      plateCenterY,
      plateAngle,
      zoom,
      towerId,
      "small"
    );
  };

  const upperLayers: { y: number; fn: () => void }[] = [
    { y: turretY - 10 * zoom, fn: drawCenterComponents },
    {
      y: turretY - 10 * zoom + fwdY * 5 * zoom,
      fn: drawFrontComponents,
    },
    {
      y: turretY - 10 * zoom + fwdY * 8 * zoom,
      fn: drawNozzle,
    },
    { y: tankCenterY, fn: drawSatelliteTank },
    { y: plateCenterY, fn: drawArmorPlate },
  ];
  upperLayers.sort((a, b) => a.y - b.y);
  for (const l of upperLayers) {
    l.fn();
  }

  // ════════════════════════════════════════════════════════════
  // PRESSURE GAUGE — 3D isometric dial on main tank body
  // Faces outward in the turret's lateral direction, tilts with rotation
  // ════════════════════════════════════════════════════════════
  {
    // Gauge mounted on the near side of the main tank, offset in lateral direction
    const gaugeOrbitAngle = rotation - Math.PI * 0.35;
    const gaugeDist = 10 * zoom;
    const gaX = mainTank.x + Math.cos(gaugeOrbitAngle) * gaugeDist;
    const gaY =
      mainTank.y + Math.sin(gaugeOrbitAngle) * gaugeDist * 0.5 + 1 * zoom;
    const gaR = 6.5 * zoom;

    // Face normal: gauge points outward from tank (along orbit angle)
    const gaNx = Math.cos(gaugeOrbitAngle);
    const gaNy = Math.sin(gaugeOrbitAngle) * 0.5;
    const gaNLen = Math.sqrt(gaNx * gaNx + gaNy * gaNy);

    // Foreshortening: how much face is visible vs edge-on
    // faceDot > 0 = facing toward camera, < 0 = facing away
    const faceDot = gaNy / gaNLen;
    const faceVis = Math.max(0.2, (faceDot + 1) * 0.5);

    // Ellipse: major axis perpendicular to face normal, minor foreshortened
    const gaRot = Math.atan2(gaNy, gaNx) + Math.PI * 0.5;
    const gaRX = gaR;
    const gaRY = gaR * Math.max(0.2, faceVis * 0.7);
    const cosE = Math.cos(gaRot);
    const sinE = Math.sin(gaRot);

    // Rim depth (housing protrudes from tank surface)
    const rimD = 2.5 * zoom;
    const rimNx = gaNx / gaNLen;
    const rimNy = gaNy / gaNLen;
    const rimBX = gaX - rimNx * rimD;
    const rimBY = gaY - rimNy * rimD;

    // Map circular face coords → tilted ellipse screen coords
    const gaFace = (a: number, r: number) => {
      const lx = Math.cos(a) * r;
      const ly = Math.sin(a) * r * (gaRY / gaRX);
      return { x: gaX + lx * cosE - ly * sinE, y: gaY + lx * sinE + ly * cosE };
    };

    // Back plate (depth shadow behind gauge)
    ctx.fillStyle = "#1a1a22";
    ctx.beginPath();
    ctx.ellipse(
      rimBX,
      rimBY,
      gaRX + 2 * zoom,
      gaRY + 1.2 * zoom,
      gaRot,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Rim wall (visible edge thickness)
    ctx.fillStyle = "#4a4a55";
    ctx.beginPath();
    ctx.ellipse(
      rimBX,
      rimBY,
      gaRX + 1.2 * zoom,
      gaRY + 0.8 * zoom,
      gaRot,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Rim highlight on camera-near edge
    ctx.strokeStyle = `rgba(130, 130, 145, ${0.2 + faceVis * 0.3})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      gaX + rimNx * 0.3 * zoom,
      gaY + rimNy * 0.3 * zoom,
      gaRX + 1 * zoom,
      gaRY + 0.7 * zoom,
      gaRot,
      Math.PI + 0.3,
      Math.PI * 2 - 0.3
    );
    ctx.stroke();

    // Chrome bezel (front face outer ring)
    const bezelGrad = ctx.createLinearGradient(
      gaX - gaRX,
      gaY - gaRY,
      gaX + gaRX,
      gaY + gaRY
    );
    bezelGrad.addColorStop(0, "#888");
    bezelGrad.addColorStop(0.4, "#aaa");
    bezelGrad.addColorStop(0.6, "#999");
    bezelGrad.addColorStop(1, "#666");
    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.ellipse(
      gaX,
      gaY,
      gaRX + 0.8 * zoom,
      gaRY + 0.5 * zoom,
      gaRot,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Dial face
    ctx.fillStyle = "#141414";
    ctx.beginPath();
    ctx.ellipse(gaX, gaY, gaRX, gaRY, gaRot, 0, Math.PI * 2);
    ctx.fill();

    // Colored arc zones
    const arcW = 1.8 * zoom;
    ctx.lineWidth = arcW;
    const zones: { s: number; e: number; c: string }[] = [
      { s: 0, e: 0.6, c: "#0a5a0a" },
      { s: 0.6, e: 0.8, c: "#5a5a0a" },
      { s: 0.8, e: 1, c: "#5a0a0a" },
    ];
    for (const z of zones) {
      ctx.strokeStyle = z.c;
      ctx.beginPath();
      ctx.ellipse(
        gaX,
        gaY,
        gaRX * 0.82,
        gaRY * 0.82,
        gaRot,
        Math.PI * 0.75 + z.s * Math.PI * 1.5,
        Math.PI * 0.75 + z.e * Math.PI * 1.5
      );
      ctx.stroke();
    }

    // Tick marks (projected onto the tilted face)
    for (let m = 0; m < 10; m++) {
      const mA = Math.PI * 0.75 + (m / 9) * Math.PI * 1.5;
      const isMajor = m % 5 === 0;
      const inner = gaFace(mA, gaR * (isMajor ? 0.6 : 0.68));
      const outer = gaFace(mA, gaR * 0.88);
      ctx.strokeStyle = m < 6 ? "#2d2" : m < 8 ? "#dd2" : "#d22";
      ctx.lineWidth = (isMajor ? 1.5 : 0.7) * zoom;
      ctx.beginPath();
      ctx.moveTo(inner.x, inner.y);
      ctx.lineTo(outer.x, outer.y);
      ctx.stroke();
    }

    // Needle (projected onto the tilted face)
    const gaNJump = isAttacking ? Math.sin(timeSinceFire * 0.05) * 0.3 : 0;
    const gaNAngle =
      Math.PI * 0.75 +
      Math.PI * 1.5 * (0.4 + Math.sin(time * 2) * 0.1 + gaNJump * 0.3);
    const nTip = gaFace(gaNAngle, gaR * 0.72);
    const nTail = gaFace(gaNAngle + Math.PI, gaR * 0.12);
    ctx.strokeStyle = "#ee2222";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(nTail.x, nTail.y);
    ctx.lineTo(nTip.x, nTip.y);
    ctx.stroke();

    // Center hub (tilted ellipse)
    const hubR = 1.8 * zoom;
    const hubRY = hubR * (gaRY / gaRX);
    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.ellipse(gaX, gaY, hubR, hubRY, gaRot, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.ellipse(gaX, gaY, hubR * 0.45, hubRY * 0.45, gaRot, 0, Math.PI * 2);
    ctx.fill();

    // Glass reflection
    const reflP = gaFace(Math.PI * 1.25, gaR * 0.4);
    ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
    ctx.beginPath();
    ctx.ellipse(
      reflP.x,
      reflP.y,
      gaR * 0.32,
      gaRY * 0.28,
      gaRot + 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // (satellite tank, tube, and armor plate are drawn in the upper layer sort above)
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
  recoilOffset: number = 0
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
    hexBackPt.y + fwdY * 4 * zoom
  );
  ctx.stroke();

  // Breech ring at barrel base (small detail, doesn't extend backward)
  {
    const breechPt = axisPoint(startDist);
    const breechR = hexR * 1.15;
    const breechVerts = generateIsoHexVertices(isoOff, breechR, 6);
    drawHexCap(
      ctx,
      breechPt,
      breechVerts,
      facingFwd ? "#4a4a55" : "#555560",
      "#3a3a45",
      0.6 * zoom
    );
  }

  // === Closures for depth-ordered drawing ===
  const drawBarrelBody = () => {
    const sortedSides = sortSidesByDepth(sideNormals);

    for (const i of sortedSides) {
      const ni = (i + 1) % hexSides;
      const normal = sideNormals[i];

      const v0 = hexVerts[i];
      const v1 = hexVerts[ni];
      const tv0 = taperVerts[i];
      const tv1 = taperVerts[ni];

      const lit = Math.max(0.12, 0.2 + Math.max(0, normal) * 0.6);

      const sGrad = ctx.createLinearGradient(
        hexBackPt.x + v0.x,
        hexBackPt.y + v0.y,
        hexFrontPt.x + tv0.x,
        hexFrontPt.y + tv0.y
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
        `rgb(${baseRC + 8}, ${baseGC - 4}, ${baseBC - 8})`
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
  };

  const drawRingBands = () => {
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

      const bandSorted = Array.from({ length: hexSides }, (_, i) => i).toSorted(
        (a, bb) => sideNormals[a] - sideNormals[bb]
      );

      for (const i of bandSorted) {
        const ni = (i + 1) % hexSides;
        const normal = sideNormals[i];
        if (normal < -0.15) {
          continue;
        }

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

      const capPt2 = facingFwd ? bandFrontPt : bandBackPt2;
      ctx.strokeStyle = "rgba(140, 140, 155, 0.4)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      for (let i = 0; i < hexSides; i++) {
        const ni = (i + 1) % hexSides;
        if (
          sideNormals[i] < -0.15 &&
          sideNormals[ni === 0 ? hexSides - 1 : ni - 1] < -0.15
        ) {
          continue;
        }
        ctx.moveTo(capPt2.x + bVerts[i].x, capPt2.y + bVerts[i].y);
        ctx.lineTo(capPt2.x + bVerts[ni].x, capPt2.y + bVerts[ni].y);
      }
      ctx.stroke();
    }
  };

  const drawMuzzleSection = () => {
    drawHexCap(
      ctx,
      facingFwd ? hexFrontPt : hexBackPt,
      facingFwd ? taperVerts : hexVerts,
      facingFwd ? "#505058" : "#5a5a62",
      "#4e4e5c",
      0.5 * zoom
    );

    drawHexCap(
      ctx,
      facingFwd ? muzzleBackPt : muzzleEndPt,
      facingFwd ? muzzleVerts : muzzleTipVerts,
      facingFwd ? "#484850" : "#404048"
    );

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

    {
      const mCapPt = facingFwd ? muzzleEndPt : muzzleBackPt;
      const mCapVerts = facingFwd ? muzzleTipVerts : muzzleVerts;
      drawHexCap(
        ctx,
        mCapPt,
        mCapVerts,
        facingFwd ? "#4a3a30" : "#3a3035",
        "rgba(255, 80, 30, 0.4)",
        0.8 * zoom
      );
    }

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
      for (let vi = 1; vi < hexSides; vi++) {
        ctx.lineTo(ringPt.x + rVerts[vi].x, ringPt.y + rVerts[vi].y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  };

  // === SECONDARY INJECTOR BARREL — 3D hex prism, side by side ===
  // Pick the side that is BEHIND the main barrel (further from camera)
  // perpX points in the lateral direction; positive perpY = that side is
  // closer to camera, so we want the side with LOWER screen-Y (further).
  const injSide = perpY > 0 ? -1 : 1;

  const drawInjector = () => {
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
      pivotY + perpY * 5 * zoom * injSide
    );
    ctx.quadraticCurveTo(
      pivotX + fwdX * 5 * zoom + perpX * 6 * zoom * injSide,
      pivotY + fwdY * 5 * zoom - 3 * zoom + perpY * 6 * zoom * injSide,
      injBack.x + injOff.x,
      injBack.y + injOff.y
    );
    ctx.stroke();
    ctx.strokeStyle = "#5a5a65";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      pivotX + perpX * 5 * zoom * injSide,
      pivotY + perpY * 5 * zoom * injSide
    );
    ctx.quadraticCurveTo(
      pivotX + fwdX * 5 * zoom + perpX * 6 * zoom * injSide,
      pivotY + fwdY * 5 * zoom - 3 * zoom + perpY * 6 * zoom * injSide,
      injBack.x + injOff.x,
      injBack.y + injOff.y
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
        0.5 * zoom
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
        0.6 * zoom
      );
      // Bore hole
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.arc(
        cPt.x + injOff.x,
        cPt.y + injOff.y,
        injHexR * injTaper * 0.4,
        0,
        Math.PI * 2
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
          injFront.y + injOff.y + tv0.y
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
          injFront.y + injOff.y + tv1.y
        );
        ctx.lineTo(
          injFront.x + injOff.x + tv0.x,
          injFront.y + injOff.y + tv0.y
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
            injFront.y + injOff.y + tv0.y
          );
          ctx.lineTo(
            injFront.x + injOff.x + tv1.x,
            injFront.y + injOff.y + tv1.y
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
            injFront.y + injOff.y + mty0
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
        if (injNormals[i] < -0.15) {
          continue;
        }
        const bLit = Math.max(0.2, 0.3 + Math.max(0, injNormals[i]) * 0.5);
        const gc = Math.floor(85 + bLit * 45);
        ctx.fillStyle = `rgb(${gc}, ${gc}, ${gc + 5})`;
        ctx.beginPath();
        ctx.moveTo(
          bPtB.x + injOff.x + bVerts[i].x,
          bPtB.y + injOff.y + bVerts[i].y
        );
        ctx.lineTo(
          bPtB.x + injOff.x + bVerts[ni].x,
          bPtB.y + injOff.y + bVerts[ni].y
        );
        ctx.lineTo(
          bPtF.x + injOff.x + bVerts[ni].x,
          bPtF.y + injOff.y + bVerts[ni].y
        );
        ctx.lineTo(
          bPtF.x + injOff.x + bVerts[i].x,
          bPtF.y + injOff.y + bVerts[i].y
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
      const mainSurfOff = isoOff(hexR * 1 * injSide, 0);

      // Bracket plate (L-shaped cross section)
      const bracketW = 1.5 * zoom;
      const bFwd = { x: fwdX * bracketW, y: fwdY * bracketW };
      ctx.fillStyle = "#5a5a65";
      ctx.beginPath();
      ctx.moveTo(clampPt.x + injOff.x - bFwd.x, clampPt.y + injOff.y - bFwd.y);
      ctx.lineTo(clampPt.x + injOff.x + bFwd.x, clampPt.y + injOff.y + bFwd.y);
      ctx.lineTo(
        clampPt.x + mainSurfOff.x + bFwd.x,
        clampPt.y + mainSurfOff.y + bFwd.y
      );
      ctx.lineTo(
        clampPt.x + mainSurfOff.x - bFwd.x,
        clampPt.y + mainSurfOff.y - bFwd.y
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
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        clampPt.x + mainSurfOff.x,
        clampPt.y + mainSurfOff.y,
        1.2 * zoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };

  const drawMainBarrel = () => {
    drawBarrelBody();
    drawRingBands();
    drawMuzzleSection();
  };

  // Depth-ordered draw: injector behind main barrel when on the far side
  // The injector's lateral offset produces a screen-Y; compare to main barrel
  const injTestOff = isoOff((hexR + 3.5 * zoom) * injSide, 0);
  const injScreenY = pivotY + injTestOff.y;
  const mainScreenY = pivotY;

  if (injScreenY < mainScreenY) {
    drawInjector();
    drawMainBarrel();
  } else {
    drawMainBarrel();
    drawInjector();
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
      haloR
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
      tipY + wobY
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
      tipY + wobY
    );
    ctx.quadraticCurveTo(
      pilotPt.x + fwdX * tongueLen * 0.5 + wobX,
      pilotPt.y +
        fwdY * tongueLen * 0.5 +
        tongueLen * 0.5 * pitchRate +
        wobY +
        perpY * tongueW * 0.7,
      pilotPt.x + perpX * tongueW,
      pilotPt.y + perpY * tongueW
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
      coreTipY
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
      coreTipY
    );
    ctx.quadraticCurveTo(
      pilotPt.x + fwdX * coreLen * 0.5,
      pilotPt.y +
        fwdY * coreLen * 0.5 +
        coreLen * 0.5 * pitchRate +
        perpY * coreW * 0.5,
      pilotPt.x + perpX * coreW,
      pilotPt.y + perpY * coreW
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
      4 * zoom
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

  // Fire blobs projecting from the nozzle when firing
  const timeSinceFire = Date.now() - tower.lastAttack;
  if (timeSinceFire < 500) {
    const intensity = 1 - timeSinceFire / 500;
    const muzzlePt = axisPoint(totalLen);

    ctx.save();
    ctx.shadowColor = "#ff4400";
    ctx.shadowBlur = 20 * zoom * intensity;

    for (let i = 0; i < 8; i++) {
      const t = i / 8;
      const dist = (4 + i * 5) * zoom;
      const wobX = Math.sin(time * 30 + i * 1.7) * (1.5 + t * 3) * zoom;
      const wobY = Math.cos(time * 25 + i * 2.3) * (1 + t * 2) * zoom;

      const bx = muzzlePt.x + fwdX * dist + perpX * wobX;
      const by =
        muzzlePt.y + fwdY * dist + dist * pitchRate + perpY * wobX + wobY * 0.3;

      const size = (12 - i * 1.1) * zoom * intensity * (1 - t * 0.3);
      const fade = intensity * (1 - t * 0.5);

      const g = ctx.createRadialGradient(bx, by, 0, bx, by, size);
      g.addColorStop(0, `rgba(255, 255, 200, ${fade * 0.95})`);
      g.addColorStop(0.15, `rgba(255, 230, 100, ${fade * 0.9})`);
      g.addColorStop(0.35, `rgba(255, 160, 30, ${fade * 0.7})`);
      g.addColorStop(0.6, `rgba(240, 80, 0, ${fade * 0.4})`);
      g.addColorStop(0.85, `rgba(180, 30, 0, ${fade * 0.15})`);
      g.addColorStop(1, "rgba(100, 10, 0, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hot white-yellow core streak along barrel direction
    for (let c = 0; c < 4; c++) {
      const cd = (2 + c * 6) * zoom;
      const cWob = Math.sin(time * 35 + c * 3.1) * 1.5 * zoom;
      const cx = muzzlePt.x + fwdX * cd + perpX * cWob;
      const cy = muzzlePt.y + fwdY * cd + cd * pitchRate + perpY * cWob;
      const cr = (5 - c * 0.8) * zoom * intensity;
      const ca = intensity * (1 - c * 0.2) * 0.85;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      cg.addColorStop(0, `rgba(255, 255, 245, ${ca})`);
      cg.addColorStop(0.4, `rgba(255, 240, 150, ${ca * 0.6})`);
      cg.addColorStop(1, `rgba(255, 180, 50, 0)`);
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Compute parameter angles where a rotated ellipse crosses its center Y.
// Returns [backStart, backEnd, frontStart, frontEnd] for splitting into
// screen-space back (y < center, further from viewer) and front (y > center) arcs.
// A small angular overlap at the seam prevents visible gaps.
