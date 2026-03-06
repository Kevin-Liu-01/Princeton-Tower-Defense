import type { Tower, Position } from "../../types";
import {
  ISO_Y_RATIO,
} from "../../constants";
import {
  generateIsoHexVertices,
  computeHexSideNormals,
  sortSidesByDepth,
  drawHexCap,
  drawHexBand,
  scaleVerts,
  type IsoOffFn,
  type Pt,
} from "../helpers";
import {
  drawIsometricPrism,
} from "./towerHelpers";

export function renderMortarTower(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  tower: Tower,
  zoom: number,
  time: number,
  colors: { base: string; dark: string; light: string; accent: string },
) {
  void colors;
  ctx.save();
  const level = tower.level;
  const isMissile = level === 4 && tower.upgrade === "A";
  const isEmber = level === 4 && tower.upgrade === "B";
  const baseW = 38 + level * 5;
  const depotH = (22 + level * 10) * 0.35;
  const rot = tower.rotation || 0;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  const hexSides = 8;
  const isoOff: IsoOffFn = (dx, dy) => ({ x: dx, y: dy * ISO_Y_RATIO });

  const timeSinceFire = Date.now() - tower.lastAttack;
  const recoilDur = 600;
  let recoilBase = 0,
    recoilMid = 0,
    recoilTip = 0;
  if (timeSinceFire < recoilDur) {
    const t = timeSinceFire / recoilDur;
    recoilBase =
      t < 0.15
        ? (t / 0.15) * 3 * zoom
        : 3 * zoom * Math.pow(1 - (t - 0.15) / 0.85, 2);
    recoilMid =
      t < 0.1
        ? (t / 0.1) * 6 * zoom
        : 6 * zoom * Math.pow(1 - (t - 0.1) / 0.9, 1.8);
    recoilTip =
      t < 0.06
        ? (t / 0.06) * 14 * zoom
        : 14 * zoom * Math.pow(1 - (t - 0.06) / 0.94, 1.5);
  }

  // ========== GROUND SHADOW ==========
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.ellipse(
    screenPos.x,
    screenPos.y + 10 * zoom,
    baseW * 0.65 * zoom,
    baseW * 0.3 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ========== HEX-PRISM FOUNDATION WALL (sandbag replacement) ==========
  const wallR = (baseW + 12) * 0.5 * zoom;
  const wallH = 6 * zoom;
  const wallBaseY = screenPos.y + 6 * zoom;
  const wallVerts = generateIsoHexVertices(isoOff, wallR, hexSides);
  const wallNormals = computeHexSideNormals(0, hexSides);
  const wallSorted = sortSidesByDepth(wallNormals);
  const wallBot: Pt = { x: screenPos.x, y: wallBaseY };
  const wallTop: Pt = { x: screenPos.x, y: wallBaseY - wallH };

  for (const i of wallSorted) {
    const ni = (i + 1) % hexSides;
    const n = wallNormals[i];
    const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
    // Level-dependent wall material (dark iron/gunmetal base)
    let r: number, g: number, b: number;
    if (level >= 3) {
      r = Math.floor(48 + bright * 35);
      g = Math.floor(44 + bright * 32);
      b = Math.floor(52 + bright * 30);
    } else if (level >= 2) {
      r = Math.floor(44 + bright * 38);
      g = Math.floor(46 + bright * 40);
      b = Math.floor(52 + bright * 36);
    } else {
      r = Math.floor(50 + bright * 40);
      g = Math.floor(50 + bright * 38);
      b = Math.floor(54 + bright * 34);
    }
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.beginPath();
    ctx.moveTo(wallBot.x + wallVerts[i].x, wallBot.y + wallVerts[i].y);
    ctx.lineTo(wallBot.x + wallVerts[ni].x, wallBot.y + wallVerts[ni].y);
    ctx.lineTo(wallTop.x + wallVerts[ni].x, wallTop.y + wallVerts[ni].y);
    ctx.lineTo(wallTop.x + wallVerts[i].x, wallTop.y + wallVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    if (n < -0.5) continue;
    const mx = (wallVerts[i].x + wallVerts[ni].x) * 0.5;
    const my = (wallVerts[i].y + wallVerts[ni].y) * 0.5;
    if (level === 1) {
      // L1: sandbag texture with stitching
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.5 * zoom;
      // Horizontal bag seam
      const midY = (wallBot.y + wallTop.y) * 0.5;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + wallVerts[i].x, midY + wallVerts[i].y * 0.5);
      ctx.lineTo(wallBot.x + wallVerts[ni].x, midY + wallVerts[ni].y * 0.5);
      ctx.stroke();
      // Vertical seam
      ctx.beginPath();
      ctx.moveTo(wallBot.x + mx, wallBot.y + my);
      ctx.lineTo(wallTop.x + mx, wallTop.y + my);
      ctx.stroke();
      // Stitch marks
      ctx.strokeStyle = `rgba(60,50,30,${0.1 + bright * 0.08})`;
      ctx.lineWidth = 0.3 * zoom;
      for (let st = 0; st < 4; st++) {
        const sy = wallTop.y + my + (wallBot.y - wallTop.y) * (st + 0.5) / 4;
        ctx.beginPath();
        ctx.moveTo(wallBot.x + mx - 1 * zoom, sy - 0.5 * zoom);
        ctx.lineTo(wallBot.x + mx + 1 * zoom, sy + 0.5 * zoom);
        ctx.stroke();
      }
      // Sand grain texture dots
      ctx.fillStyle = `rgba(140,120,80,${0.06 + bright * 0.04})`;
      for (let sd = 0; sd < 3; sd++) {
        const sdf = (sd + 0.5) / 3;
        const sdx = wallBot.x + wallVerts[i].x * (1 - sdf) + wallVerts[ni].x * sdf;
        const sdy = (wallBot.y + wallTop.y) * 0.5 + wallVerts[i].y * (1 - sdf) + wallVerts[ni].y * sdf;
        ctx.beginPath();
        ctx.arc(sdx + mx * 0.2, sdy + my * 0.2, 0.4 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (level === 2) {
      // L2: reinforced steel plates with weld seams and rivet rows
      // Horizontal weld seam
      const midY = (wallBot.y + wallTop.y) * 0.5;
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + wallVerts[i].x, midY + wallVerts[i].y * 0.5);
      ctx.lineTo(wallBot.x + wallVerts[ni].x, midY + wallVerts[ni].y * 0.5);
      ctx.stroke();
      // Weld highlight
      ctx.strokeStyle = `rgba(160,165,180,0.08)`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + wallVerts[i].x, midY + wallVerts[i].y * 0.5 - 0.5 * zoom);
      ctx.lineTo(wallBot.x + wallVerts[ni].x, midY + wallVerts[ni].y * 0.5 - 0.5 * zoom);
      ctx.stroke();
      // Top and bottom rivet rows
      ctx.fillStyle = `rgba(130,135,150,${0.35 + bright * 0.3})`;
      for (const vf of [0.15, 0.85]) {
        const rvx = wallBot.x + mx + (wallTop.x - wallBot.x) * vf;
        const rvy = wallBot.y + my + (wallTop.y - wallBot.y) * vf;
        ctx.beginPath();
        ctx.arc(rvx, rvy, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Vertical seam
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + mx, wallBot.y + my);
      ctx.lineTo(wallTop.x + mx, wallTop.y + my);
      ctx.stroke();
    } else {
      // L3+: polished armored plating with gold filigree
      // Center seam
      ctx.strokeStyle = `rgba(201,162,39,${0.12 + bright * 0.08})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + mx, wallBot.y + my);
      ctx.lineTo(wallTop.x + mx, wallTop.y + my);
      ctx.stroke();
      // Inset border rectangle
      const inset = 0.12;
      const p0 = { x: wallBot.x + wallVerts[i].x * (1 - inset) + wallVerts[ni].x * inset, y: wallBot.y + wallVerts[i].y * (1 - inset) + wallVerts[ni].y * inset - 0.5 * zoom };
      const p1 = { x: wallBot.x + wallVerts[ni].x * (1 - inset) + wallVerts[i].x * inset, y: wallBot.y + wallVerts[ni].y * (1 - inset) + wallVerts[i].y * inset - 0.5 * zoom };
      const p2 = { x: wallTop.x + wallVerts[ni].x * (1 - inset) + wallVerts[i].x * inset, y: wallTop.y + wallVerts[ni].y * (1 - inset) + wallVerts[i].y * inset + 0.5 * zoom };
      const p3 = { x: wallTop.x + wallVerts[i].x * (1 - inset) + wallVerts[ni].x * inset, y: wallTop.y + wallVerts[i].y * (1 - inset) + wallVerts[ni].y * inset + 0.5 * zoom };
      ctx.strokeStyle = `rgba(201,162,39,${0.2 + bright * 0.12})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.stroke();
      // Corner gold rivets
      ctx.fillStyle = `rgba(201,162,39,${0.5 + bright * 0.3})`;
      for (const pp of [p0, p1, p2, p3]) {
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Polished highlight line
      ctx.strokeStyle = `rgba(255,255,255,${0.04 + bright * 0.03})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallTop.x + wallVerts[i].x * 0.95 + wallVerts[ni].x * 0.05, wallTop.y + wallVerts[i].y * 0.95 + wallVerts[ni].y * 0.05 + 1.5 * zoom);
      ctx.lineTo(wallTop.x + wallVerts[i].x * 0.95 + wallVerts[ni].x * 0.05, wallBot.y + wallVerts[i].y * 0.95 + wallVerts[ni].y * 0.05 - 1.5 * zoom);
      ctx.stroke();
    }
  }
  const wallCapColor =
    level >= 3 ? "#5a5662" : level >= 2 ? "#585c64" : "#606268";
  drawHexCap(
    ctx,
    wallTop,
    wallVerts,
    wallCapColor,
    "rgba(0,0,0,0.1)",
    0.6 * zoom,
  );

  // ========== HEX-PRISM CONCRETE PLATFORM ==========
  const platR = (baseW + 4) * 0.48 * zoom;
  const platH = 5 * zoom;
  const platBaseY = wallBaseY - wallH + 1 * zoom;
  const platVerts = generateIsoHexVertices(isoOff, platR, hexSides);
  const platNormals = computeHexSideNormals(0, hexSides);
  const platSorted = sortSidesByDepth(platNormals);
  const platBot: Pt = { x: screenPos.x, y: platBaseY };
  const platTop: Pt = { x: screenPos.x, y: platBaseY - platH };

  for (const i of platSorted) {
    const ni = (i + 1) % hexSides;
    const n = platNormals[i];
    const bright = Math.max(0, Math.min(1, 0.35 + (n + 1) * 0.32));
    ctx.fillStyle = `rgb(${Math.floor(50 + bright * 30)},${Math.floor(50 + bright * 30)},${Math.floor(58 + bright * 24)})`;
    ctx.beginPath();
    ctx.moveTo(platBot.x + platVerts[i].x, platBot.y + platVerts[i].y);
    ctx.lineTo(platBot.x + platVerts[ni].x, platBot.y + platVerts[ni].y);
    ctx.lineTo(platTop.x + platVerts[ni].x, platTop.y + platVerts[ni].y);
    ctx.lineTo(platTop.x + platVerts[i].x, platTop.y + platVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }
  drawHexCap(ctx, platTop, platVerts, "#4a4a52", "rgba(0,0,0,0.1)", 0.5 * zoom);

  // ========== ANCHOR BOLTS at hex vertices ==========
  ctx.fillStyle = "#7a7a82";
  for (let i = 0; i < hexSides; i++) {
    if (
      platNormals[i] < -0.3 &&
      platNormals[(i + hexSides - 1) % hexSides] < -0.3
    )
      continue;
    ctx.beginPath();
    ctx.arc(
      platTop.x + platVerts[i].x,
      platTop.y + platVerts[i].y,
      1.5 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#aaa";
    ctx.beginPath();
    ctx.arc(
      platTop.x + platVerts[i].x,
      platTop.y + platVerts[i].y,
      0.7 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#7a7a82";
  }

  // ========== SUPPORT STRUTS from hex vertices to ground ==========
  {
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 2.5 * zoom;
    for (let i = 0; i < hexSides; i++) {
      if (
        wallNormals[i] < -0.7 &&
        wallNormals[(i + hexSides - 1) % hexSides] < -0.7
      )
        continue;
      const vx = wallVerts[i].x;
      const vy = wallVerts[i].y;
      // Diagonal brace from wall vertex down
      ctx.beginPath();
      ctx.moveTo(wallTop.x + vx, wallTop.y + vy);
      ctx.lineTo(wallBot.x + vx * 1.12, wallBot.y + vy * 1.12 + 3 * zoom);
      ctx.stroke();
    }
  }

  // ========== CROSS-BRACES between wall faces (level 2+) ==========
  if (level >= 2) {
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (wallNormals[i] < -0.7) continue;
      const mx1 = (wallVerts[i].x + wallVerts[ni].x) * 0.5;
      const my1 = (wallVerts[i].y + wallVerts[ni].y) * 0.5;
      // X-brace on visible faces
      ctx.beginPath();
      ctx.moveTo(wallBot.x + wallVerts[i].x, wallBot.y + wallVerts[i].y);
      ctx.lineTo(wallTop.x + wallVerts[ni].x, wallTop.y + wallVerts[ni].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wallBot.x + wallVerts[ni].x, wallBot.y + wallVerts[ni].y);
      ctx.lineTo(wallTop.x + wallVerts[i].x, wallTop.y + wallVerts[i].y);
      ctx.stroke();
      // Center bolt
      ctx.fillStyle = "#8a8a8a";
      ctx.beginPath();
      ctx.arc(
        wallBot.x + mx1,
        (wallBot.y + wallTop.y) * 0.5 + my1,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // ========== HEX-PRISM AMMUNITION DEPOT ==========
  const depotR = (baseW - 4) * 0.45 * zoom;
  const depotBaseY = platBaseY - platH;
  const depotVerts = generateIsoHexVertices(isoOff, depotR, hexSides);
  const depotNormals = computeHexSideNormals(0, hexSides);
  const depotSorted = sortSidesByDepth(depotNormals);
  const depotBot: Pt = { x: screenPos.x, y: depotBaseY };
  const depotTop: Pt = { x: screenPos.x, y: depotBaseY - depotH * zoom };
  const topY = depotTop.y;

  for (const i of depotSorted) {
    const ni = (i + 1) % hexSides;
    const n = depotNormals[i];
    const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
    let dr: number, dg: number, db: number;
    if (level >= 3) {
      dr = Math.floor(48 + bright * 42);
      dg = Math.floor(42 + bright * 38);
      db = Math.floor(30 + bright * 24);
    } else if (level >= 2) {
      dr = Math.floor(52 + bright * 45);
      dg = Math.floor(44 + bright * 38);
      db = Math.floor(28 + bright * 22);
    } else {
      dr = Math.floor(58 + bright * 48);
      dg = Math.floor(48 + bright * 38);
      db = Math.floor(28 + bright * 22);
    }
    ctx.fillStyle = `rgb(${dr},${dg},${db})`;
    ctx.beginPath();
    ctx.moveTo(depotBot.x + depotVerts[i].x, depotBot.y + depotVerts[i].y);
    ctx.lineTo(depotBot.x + depotVerts[ni].x, depotBot.y + depotVerts[ni].y);
    ctx.lineTo(depotTop.x + depotVerts[ni].x, depotTop.y + depotVerts[ni].y);
    ctx.lineTo(depotTop.x + depotVerts[i].x, depotTop.y + depotVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    if (n < -0.2) continue;
    // Horizontal seam
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.5 * zoom;
    const seamY = (depotBot.y + depotTop.y) * 0.5;
    ctx.beginPath();
    ctx.moveTo(depotBot.x + depotVerts[i].x, seamY + depotVerts[i].y * 0.3);
    ctx.lineTo(depotBot.x + depotVerts[ni].x, seamY + depotVerts[ni].y * 0.3);
    ctx.stroke();
    // L2+: additional detail per depot face
    if (level >= 2) {
      const mx = (depotVerts[i].x + depotVerts[ni].x) * 0.5;
      const my = (depotVerts[i].y + depotVerts[ni].y) * 0.5;
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.beginPath();
      ctx.moveTo(depotBot.x + mx, depotBot.y + my);
      ctx.lineTo(depotTop.x + mx, depotTop.y + my);
      ctx.stroke();
    }
    // L3: gold accent rivets on depot
    if (level >= 3) {
      ctx.fillStyle = `rgba(201,162,39,${0.35 + bright * 0.25})`;
      ctx.beginPath();
      ctx.arc(
        depotTop.x + depotVerts[i].x * 0.97,
        depotTop.y + depotVerts[i].y * 0.97 + 1 * zoom,
        0.6 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  const depotCapColor =
    level >= 3 ? "#5a5240" : level >= 2 ? "#605840" : "#6a5a40";
  drawHexCap(
    ctx,
    depotTop,
    depotVerts,
    depotCapColor,
    "rgba(0,0,0,0.1)",
    0.5 * zoom,
  );

  // Depot metal band at top
  drawHexBand(
    ctx,
    depotVerts,
    depotNormals,
    { x: depotTop.x, y: depotTop.y + 2 * zoom },
    depotTop,
    1.04,
    (n) => {
      const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
      return `rgb(${Math.floor(70 * (0.6 + b * 0.4))},${Math.floor(60 * (0.6 + b * 0.4))},${Math.floor(40 * (0.6 + b * 0.4))})`;
    },
    "rgba(0,0,0,0.15)",
    0.4 * zoom,
    -0.3,
  );

  // ========== HYDRAULIC ACTUATORS (platform to depot, animated) ==========
  {
    const hydCount = level >= 3 ? 4 : level >= 2 ? 3 : 2;
    const hydSpacing = hexSides / hydCount;
    for (let h = 0; h < hydCount; h++) {
      const hi = Math.floor(h * hydSpacing + 1) % hexSides;
      const n = platNormals[hi];
      if (n < -0.3) continue;
      const footX = screenPos.x + platVerts[hi].x * 0.95;
      const footY = platTop.y + platVerts[hi].y * 0.95;
      const attachX = screenPos.x + depotVerts[hi].x * 0.85;
      const attachY = depotTop.y + depotVerts[hi].y * 0.85 + 3 * zoom;
      const midX = (footX + attachX) * 0.5;
      const midY = (footY + attachY) * 0.55;
      // Outer cylinder
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.moveTo(footX, footY);
      ctx.lineTo(midX, midY);
      ctx.stroke();
      // Inner piston rod
      ctx.strokeStyle = "#9a9aa0";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(attachX, attachY);
      ctx.stroke();
      // Pivot bolts
      ctx.fillStyle = "#7a7a82";
      ctx.beginPath();
      ctx.arc(footX, footY, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#aaa";
      ctx.beginPath();
      ctx.arc(footX, footY, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== CABLE CONDUITS along hex edges (level 2+) ==========
  if (level >= 2) {
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1 * zoom;
    for (let i = 0; i < 3; i++) {
      const ci = (i * 2 + 1) % hexSides;
      const cni = (ci + 1) % hexSides;
      if (platNormals[ci] < -0.7) continue;
      const startX = platTop.x + platVerts[ci].x * 0.9;
      const startY = platTop.y + platVerts[ci].y * 0.9;
      const endX = platTop.x + platVerts[cni].x * 0.9;
      const endY = platTop.y + platVerts[cni].y * 0.9;
      const sagY = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(
        (startX + endX) * 0.5,
        (startY + endY) * 0.5 + sagY,
        endX,
        endY,
      );
      ctx.stroke();
    }
  }

  // ========== RAILING POSTS on hex vertices ==========
  {
    const railH = 7 * zoom;
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 1.5 * zoom;
    for (let i = 0; i < hexSides; i++) {
      if (
        wallNormals[i] < -0.7 &&
        wallNormals[(i + hexSides - 1) % hexSides] < -0.7
      )
        continue;
      const px = wallTop.x + wallVerts[i].x * 1.02;
      const py = wallTop.y + wallVerts[i].y * 1.02;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - railH);
      ctx.stroke();
      // Post cap
      ctx.fillStyle = "#6a5a4a";
      ctx.beginPath();
      ctx.arc(px, py - railH, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    // Rail between posts
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 1.2 * zoom;
    for (let i = 0; i < hexSides; i++) {
      const ni = (i + 1) % hexSides;
      if (wallNormals[i] < -0.7) continue;
      ctx.beginPath();
      ctx.moveTo(
        wallTop.x + wallVerts[i].x * 1.02,
        wallTop.y + wallVerts[i].y * 1.02 - railH,
      );
      ctx.lineTo(
        wallTop.x + wallVerts[ni].x * 1.02,
        wallTop.y + wallVerts[ni].y * 1.02 - railH,
      );
      ctx.stroke();
      // Mid rail
      ctx.beginPath();
      ctx.moveTo(
        wallTop.x + wallVerts[i].x * 1.02,
        wallTop.y + wallVerts[i].y * 1.02 - railH * 0.5,
      );
      ctx.lineTo(
        wallTop.x + wallVerts[ni].x * 1.02,
        wallTop.y + wallVerts[ni].y * 1.02 - railH * 0.5,
      );
      ctx.stroke();
    }
  }

  // ========== AMMO CRATES ==========
  for (let c = 0; c < Math.min(level, 3); c++) {
    const crateAngle = Math.PI * 0.3 + c * 0.4;
    const crateR = depotR * 0.7;
    const crateX = screenPos.x + Math.cos(crateAngle) * crateR;
    const crateY = depotBot.y + Math.sin(crateAngle) * crateR * ISO_Y_RATIO;
    drawIsometricPrism(
      ctx,
      crateX,
      crateY,
      6 - c,
      6 - c,
      5,
      {
        top: c === 0 ? "#5a6a3a" : "#4a5a32",
        left: c === 0 ? "#4a5a2a" : "#3a4a22",
        right: "#3a4a1a",
      },
      zoom,
    );
    ctx.fillStyle = isMissile ? "#cc2200" : isEmber ? "#ff6600" : "#ffaa00";
    ctx.fillRect(crateX - 2 * zoom, crateY - 4 * zoom, 4 * zoom, 1.2 * zoom);
  }

  // ========== PROPELLANT TANKS (level 2+) ==========
  if (level >= 2) {
    for (let t = 0; t < Math.min(level - 1, 2); t++) {
      const tankAngle = -Math.PI * 0.35 - t * 0.5;
      const tankR = depotR * 0.75;
      const tankX = screenPos.x + Math.cos(tankAngle) * tankR;
      const tankY = depotBot.y + Math.sin(tankAngle) * tankR * ISO_Y_RATIO;
      ctx.fillStyle = t === 0 ? "#5a2a1a" : "#4a3a2a";
      ctx.beginPath();
      ctx.ellipse(tankX, tankY, 4 * zoom, 2.2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7a5a4a";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = t === 0 ? "#cc4400" : "#aa6600";
      ctx.beginPath();
      ctx.arc(tankX + 3 * zoom, tankY - 1 * zoom, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(tankX, tankY - 2 * zoom);
      ctx.lineTo(screenPos.x, topY + 3 * zoom);
      ctx.stroke();
    }
  }

  // ========== SHELL RACK ==========
  {
    const rackAngle = Math.PI * 0.75;
    const rackDist = depotR * 0.6;
    const rackX = screenPos.x + Math.cos(rackAngle) * rackDist;
    const rackY = depotBot.y + Math.sin(rackAngle) * rackDist * ISO_Y_RATIO;
    drawIsometricPrism(
      ctx,
      rackX,
      rackY,
      5,
      8,
      12,
      { top: "#4a3a28", left: "#3a2818", right: "#2a1808" },
      zoom,
    );
    const shellCount = level + 1;
    const loadingIdx =
      timeSinceFire < 800 ? Math.floor((timeSinceFire / 800) * shellCount) : -1;
    for (let sh = 0; sh < shellCount; sh++) {
      if (sh === loadingIdx) continue;
      const shellY = rackY - (3 + sh * 3.5) * zoom;
      ctx.fillStyle = isMissile ? "#aa1100" : isEmber ? "#cc5500" : "#7a6a50";
      ctx.beginPath();
      ctx.ellipse(rackX, shellY, 2.2 * zoom, 1.3 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (level >= 2 && timeSinceFire < 1200) {
      const loadT = Math.min(1, timeSinceFire / 1200);
      const armSwing =
        loadT < 0.4
          ? (loadT / 0.4) * Math.PI * 0.35
          : Math.PI * 0.35 * Math.max(0, 1 - (loadT - 0.4) / 0.6);
      const armLen = 10 * zoom;
      const pivotX = rackX + 3 * zoom;
      const pivotY = rackY - 10 * zoom;
      ctx.strokeStyle = "#7a6a5a";
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(
        pivotX + Math.cos(-Math.PI * 0.4 + armSwing) * armLen,
        pivotY + Math.sin(-Math.PI * 0.4 + armSwing) * armLen,
      );
      ctx.stroke();
      ctx.fillStyle = "#aaa";
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== SHELL FEEDER ==========
  if (level >= 2) {
    const convStartX = screenPos.x - baseW * 0.18 * zoom;
    const convStartY = depotBot.y - depotH * zoom * 0.3;
    const convEndX = screenPos.x;
    const convEndY = topY + 3 * zoom;
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(convStartX, convStartY);
    ctx.quadraticCurveTo(
      convStartX + 4 * zoom,
      convEndY + 3 * zoom,
      convEndX,
      convEndY,
    );
    ctx.stroke();
    if (timeSinceFire < 1000) {
      const shellT = Math.min(1, timeSinceFire / 1000);
      const sx = convStartX + (convEndX - convStartX) * shellT;
      const sy = convStartY + (convEndY - convStartY) * shellT;
      ctx.fillStyle = isMissile ? "#cc2200" : isEmber ? "#ff6600" : "#8a7a5a";
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2 * zoom, 1.2 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== HEX GEAR RING on depot top ==========
  {
    const gearR = depotR * 0.9;
    const gearVerts = generateIsoHexVertices(isoOff, gearR, hexSides);
    const gearNormals = computeHexSideNormals(0, hexSides);
    const gearBot: Pt = { x: screenPos.x, y: topY + 2 * zoom };
    const gearTop: Pt = { x: screenPos.x, y: topY };

    drawHexBand(
      ctx,
      gearVerts,
      gearNormals,
      gearBot,
      gearTop,
      1.0,
      (n) => {
        const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
        return `rgb(${Math.floor(70 + b * 30)},${Math.floor(70 + b * 30)},${Math.floor(78 + b * 22)})`;
      },
      "rgba(0,0,0,0.15)",
      0.4 * zoom,
      -0.3,
    );
    drawHexCap(
      ctx,
      gearTop,
      gearVerts,
      "#5a5a62",
      "rgba(0,0,0,0.1)",
      0.4 * zoom,
    );

    // Gear teeth
    const toothCount = 16 + level * 2;
    ctx.fillStyle = "#6a6a6a";
    for (let i = 0; i < toothCount; i++) {
      const a = (i / toothCount) * Math.PI * 2 + time * 0.3;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + Math.cos(a) * gearR * 1.06,
        topY + Math.sin(a) * gearR * ISO_Y_RATIO * 1.06,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Inner bearing ring
    const bearingVerts = generateIsoHexVertices(isoOff, gearR * 0.55, hexSides);
    drawHexCap(
      ctx,
      gearTop,
      bearingVerts,
      "#4a4a50",
      "rgba(0,0,0,0.12)",
      0.5 * zoom,
    );
  }

  // ========== DRIVE SHAFT ==========
  if (level >= 2) {
    const shaftIdx = 2;
    const shaftStartX = screenPos.x + depotVerts[shaftIdx].x * 0.8;
    const shaftStartY = depotBot.y + depotVerts[shaftIdx].y * 0.6;
    const shaftEndX = screenPos.x + depotVerts[shaftIdx].x * 0.5;
    const shaftEndY = topY + 1 * zoom;
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(shaftStartX, shaftStartY);
    ctx.lineTo(shaftEndX, shaftEndY);
    ctx.stroke();
    ctx.fillStyle = "#7a7a7a";
    ctx.beginPath();
    ctx.arc(shaftStartX, shaftStartY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(shaftEndX, shaftEndY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== AIMING SYSTEMS ==========
  if (level >= 2) {
    const rfX = screenPos.x + depotR * 0.55;
    const rfY = topY;
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rfX, rfY + 2 * zoom);
    ctx.lineTo(rfX, rfY - 8 * zoom);
    ctx.stroke();
    ctx.strokeStyle = "#6a6a6a";
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(rfX - 4 * zoom, rfY - 8 * zoom);
    ctx.lineTo(rfX + 4 * zoom, rfY - 8 * zoom);
    ctx.stroke();
    const lensGlow = 0.35 + Math.sin(time * 2.5) * 0.15;
    ctx.fillStyle = `rgba(80, 200, 255, ${lensGlow})`;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(
        rfX + side * 4 * zoom,
        rfY - 8 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  if (level >= 3) {
    const compY = topY + 1 * zoom;
    const compR = depotR * 0.35;
    ctx.strokeStyle = "rgba(201,162,39,0.5)";
    // Compass is always visible on top (isometric overhead)
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      screenPos.x,
      compY,
      compR,
      compR * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.strokeStyle = "#ff4400";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, compY);
    ctx.lineTo(
      screenPos.x + cosR * compR * 0.65,
      compY + sinR * compR * ISO_Y_RATIO * 0.65,
    );
    ctx.stroke();
  }

  // Control panel
  {
    const cpAngle = -Math.PI * 0.6;
    const cpDist = depotR * 0.55;
    const cpX = screenPos.x + Math.cos(cpAngle) * cpDist;
    const cpY = depotBot.y + Math.sin(cpAngle) * cpDist * ISO_Y_RATIO;
    drawIsometricPrism(
      ctx,
      cpX,
      cpY,
      6,
      5,
      6,
      { top: "#3a3a42", left: "#2a2a32", right: "#1a1a28" },
      zoom,
    );
    const dp = 0.3 + Math.sin(time * 2.5) * 0.15;
    ctx.fillStyle = `rgba(40, 180, 80, ${dp})`;
    ctx.fillRect(cpX - 2 * zoom, cpY - 5 * zoom, 4 * zoom, 2.5 * zoom);
    ctx.fillStyle = timeSinceFire < 1500 ? "#ff2200" : "#00ff44";
    ctx.beginPath();
    ctx.arc(cpX, cpY - 2 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========== LEVEL-DEPENDENT BASE ACCESSORIES ==========

  // L1: sandbag pile and targeting flag
  if (level === 1) {
    const sbX = screenPos.x + wallR * 0.5;
    const sbY = wallBaseY - wallH * 0.5;
    for (let sb = 0; sb < 3; sb++) {
      ctx.fillStyle = sb === 0 ? "#8a7a60" : "#7a6a50";
      ctx.beginPath();
      ctx.ellipse(
        sbX + sb * 3 * zoom,
        sbY - sb * 2 * zoom,
        4 * zoom,
        2 * zoom,
        0.2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    }
  }

  // L2: warning lights on wall vertices
  if (level === 2) {
    for (let wi = 0; wi < hexSides; wi += 2) {
      if (wallNormals[wi] < -0.7) continue;
      const lx = wallTop.x + wallVerts[wi].x * 1.02;
      const ly = wallTop.y + wallVerts[wi].y * 1.02 - 8 * zoom;
      const lightOn = Math.sin(time * 3 + wi) > 0.3;
      ctx.fillStyle = lightOn ? "#ffaa00" : "#553300";
      ctx.beginPath();
      ctx.arc(lx, ly, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      if (lightOn) {
        ctx.fillStyle = "rgba(255,170,0,0.15)";
        ctx.beginPath();
        ctx.arc(lx, ly, 3 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // L3: searchlight on one wall vertex, warning stripes, antenna
  if (level >= 3) {
    const slIdx = 1;
    if (wallNormals[slIdx] > -0.7) {
      const slx = wallTop.x + wallVerts[slIdx].x * 1.05;
      const sly = wallTop.y + wallVerts[slIdx].y * 1.05 - 8 * zoom;
      ctx.strokeStyle = "#6a6a6e";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(slx, sly + 5 * zoom);
      ctx.lineTo(slx, sly);
      ctx.stroke();
      ctx.fillStyle = "#4a4a50";
      ctx.beginPath();
      ctx.ellipse(slx, sly, 2.5 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      const slGlow = 0.5 + Math.sin(time * 2) * 0.2;
      ctx.fillStyle = `rgba(200, 230, 255, ${slGlow})`;
      ctx.beginPath();
      ctx.arc(
        slx + cosR * 1 * zoom,
        sly + sinR * 0.5 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Antenna
    const antIdx = 5 % hexSides;
    if (
      wallNormals[antIdx] > -0.3 ||
      wallNormals[(antIdx + hexSides - 1) % hexSides] > -0.3
    ) {
      const ax = wallTop.x + wallVerts[antIdx].x * 0.95;
      const ay = wallTop.y + wallVerts[antIdx].y * 0.95;
      ctx.strokeStyle = "#6a6a6e";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax, ay - 12 * zoom);
      ctx.stroke();
      ctx.fillStyle = Math.sin(time * 5) > 0 ? "#ff0000" : "#880000";
      ctx.beginPath();
      ctx.arc(ax, ay - 12 * zoom, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    // Warning stripes on one depot face
    const warnIdx = 3;
    if (depotNormals[warnIdx] > 0) {
      const wni = (warnIdx + 1) % hexSides;
      ctx.strokeStyle = "rgba(200,160,0,0.2)";
      ctx.lineWidth = 1.5 * zoom;
      for (let ch = 0; ch < 3; ch++) {
        const t = (ch + 0.5) / 3;
        const cx =
          depotBot.x +
          depotVerts[warnIdx].x +
          (depotVerts[wni].x - depotVerts[warnIdx].x) * t;
        const cy =
          depotBot.y +
          depotVerts[warnIdx].y +
          (depotVerts[wni].y - depotVerts[warnIdx].y) * t;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx,
          depotTop.y +
            depotVerts[warnIdx].y +
            (depotVerts[wni].y - depotVerts[warnIdx].y) * t,
        );
        ctx.stroke();
      }
    }
  }

  // ========== VARIANT-SPECIFIC BARREL ==========
  if (isEmber) {
    renderMortarEmberTurret(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      recoilBase,
      recoilMid,
      recoilTip,
      timeSinceFire,
    );
  } else if (isMissile) {
    renderMortarMissileSilo(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      timeSinceFire,
    );
  } else {
    renderMortarStandardBarrel(
      ctx,
      screenPos,
      topY,
      tower,
      zoom,
      time,
      recoilBase,
      recoilMid,
      recoilTip,
      timeSinceFire,
    );
  }

  // ========== SMOKE ==========
  const steamCount = 1 + level;
  for (let s = 0; s < steamCount; s++) {
    const st = time * 0.8 + s * 1.7;
    const sx = screenPos.x + Math.sin(st * 1.3) * 5 * zoom;
    const sy = topY - 15 * zoom - (st % 3) * 6 * zoom;
    const sa = Math.max(0, 0.1 - ((st % 3) / 3) * 0.1);
    ctx.fillStyle = `rgba(180, 160, 140, ${sa})`;
    ctx.beginPath();
    ctx.arc(sx, sy, (2 + (st % 3) * 1.5) * zoom, 0, Math.PI * 2);
    ctx.fill();
  }
  if (timeSinceFire < 2000) {
    const smokeT = timeSinceFire / 2000;
    for (let p = 0; p < 3; p++) {
      const ang = time * 2 + p * 2.09;
      const dist = (5 + smokeT * 12) * zoom;
      const smokeA = Math.max(0, (1 - smokeT) * 0.12);
      ctx.fillStyle = `rgba(140, 130, 120, ${smokeA})`;
      ctx.beginPath();
      ctx.arc(
        screenPos.x + Math.cos(ang) * dist * 0.4,
        topY - 8 * zoom - smokeT * 10 * zoom + Math.sin(ang) * dist * 0.2,
        (3 + smokeT * 3) * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.restore();
}

export interface CradleArmParams {
  side: number;
  level: number;
  zoom: number;
  sinR: number;
  cosR: number;
  perpX: number;
  perpY: number;
  tiers: Array<{ r: number; h: number }>;
  tierRecoils: number[];
  totalRecoil: number;
  posAtFrac: (frac: number, recoilOffset: number) => Pt;
  cradleW: number;
  cradleThick: number;
  metalDark: string;
  metalMid: string;
  metalLight: string;
  accent: string;
  time: number;
  timeSinceFire: number;
}

export function drawCradlePlateSegment(
  ctx: CanvasRenderingContext2D,
  x0: number, y0: number, x1: number, y1: number,
  plateW: number, plateH: number,
  side: number, perpX: number, perpY: number,
  topColor: string, sideColor: string, edgeColor: string,
  zoom: number,
) {
  const hw = plateW * 0.5;
  // Top face (isometric parallelogram along the arm direction)
  const t0ox = x0 + side * perpX * hw;
  const t0oy = y0 + side * perpY * hw;
  const t0ix = x0 - side * perpX * hw;
  const t0iy = y0 - side * perpY * hw;
  const t1ox = x1 + side * perpX * hw;
  const t1oy = y1 + side * perpY * hw;
  const t1ix = x1 - side * perpX * hw;
  const t1iy = y1 - side * perpY * hw;

  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(t0ix, t0iy);
  ctx.lineTo(t0ox, t0oy);
  ctx.lineTo(t1ox, t1oy);
  ctx.lineTo(t1ix, t1iy);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();

  // Outer side face (visible depth, drops down from outer edge)
  ctx.fillStyle = sideColor;
  ctx.beginPath();
  ctx.moveTo(t0ox, t0oy);
  ctx.lineTo(t1ox, t1oy);
  ctx.lineTo(t1ox, t1oy + plateH);
  ctx.lineTo(t0ox, t0oy + plateH);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bottom edge (darker underside hint)
  ctx.fillStyle = edgeColor;
  ctx.beginPath();
  ctx.moveTo(t0ix, t0iy + plateH);
  ctx.lineTo(t0ox, t0oy + plateH);
  ctx.lineTo(t1ox, t1oy + plateH);
  ctx.lineTo(t1ix, t1iy + plateH);
  ctx.closePath();
  ctx.fill();

  // Top face highlight line
  ctx.strokeStyle = `rgba(255,255,255,0.08)`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(t0ix + (t0ox - t0ix) * 0.15, t0iy + (t0oy - t0iy) * 0.15);
  ctx.lineTo(t1ix + (t1ox - t1ix) * 0.15, t1iy + (t1oy - t1iy) * 0.15);
  ctx.stroke();
}

export function drawMortarCradleArm(ctx: CanvasRenderingContext2D, p: CradleArmParams) {
  const { side, level, zoom, sinR, cosR, perpX, perpY, tiers, tierRecoils,
    totalRecoil, posAtFrac, cradleW, cradleThick, metalDark, metalMid,
    metalLight, accent, time, timeSinceFire } = p;

  const sideVis = side * (-sinR + 0.5 * cosR);
  const isFront = sideVis > 0;
  const topCol = isFront ? metalLight : metalMid;
  const sideCol = isFront ? metalMid : metalDark;
  const edgeCol = metalDark;
  const plateH = (level >= 3 ? 4 : level >= 2 ? 3.5 : 3) * zoom;
  const plateW = cradleThick;

  // Key points along the arm that follow barrel tilt & recoil
  const baseFrac = 0.02;
  const baseRecoil = tierRecoils[0] * 0.05;
  const basePt = posAtFrac(baseFrac, baseRecoil);
  const baseX = basePt.x + side * perpX * cradleW * 1.0;
  const baseY = basePt.y + side * perpY * cradleW * 1.0 + 4 * zoom;

  const pivotFrac = 0.18;
  const pivotRecoil = tierRecoils[0] * 0.45;
  const pivotPt = posAtFrac(pivotFrac, pivotRecoil);
  const pivotX = pivotPt.x + side * perpX * cradleW;
  const pivotY = pivotPt.y + side * perpY * cradleW;

  const midFrac = 0.42;
  const midRecoil = (tierRecoils[0] + tierRecoils[1]) * 0.55;
  const midPt = posAtFrac(midFrac, midRecoil);
  const midX = midPt.x + side * perpX * tiers[1].r * 1.05;
  const midY = midPt.y + side * perpY * tiers[1].r * 1.05;

  const tipFrac = 0.68;
  const tipRecoil = totalRecoil * 0.72;
  const tipPt = posAtFrac(tipFrac, tipRecoil);
  const tipX = tipPt.x + side * perpX * tiers[2].r * 0.85;
  const tipY = tipPt.y + side * perpY * tiers[2].r * 0.85;

  // ── OUTER GUIDE RAIL (I-beam profile that the arm slides along) ──
  {
    const railOff = side * 2.5 * zoom;
    const rBaseX = baseX + perpX * railOff;
    const rBaseY = baseY + perpY * railOff;
    const rMidX = midX + perpX * railOff * 0.8;
    const rMidY = midY + perpY * railOff * 0.8;
    const railPlateW = (level >= 3 ? 3.5 : 3) * zoom;
    const railPlateH = (level >= 3 ? 5 : 4.5) * zoom;

    // Rail web (vertical part of I-beam)
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(rBaseX, rBaseY + plateH * 0.5);
    ctx.lineTo(rMidX, rMidY + plateH * 0.5);
    ctx.stroke();

    // Rail top flange
    drawCradlePlateSegment(ctx,
      rBaseX, rBaseY, rMidX, rMidY,
      railPlateW, 1.5 * zoom,
      side, perpX, perpY, metalMid, metalDark, edgeCol, zoom,
    );
    // Rail bottom flange
    drawCradlePlateSegment(ctx,
      rBaseX, rBaseY + railPlateH, rMidX, rMidY + railPlateH,
      railPlateW, 1.5 * zoom,
      side, perpX, perpY, metalDark, metalDark, edgeCol, zoom,
    );

    // Rail groove (sliding channel)
    ctx.strokeStyle = `rgba(0,0,0,0.3)`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(rBaseX, rBaseY + railPlateH * 0.5);
    ctx.lineTo(rMidX, rMidY + railPlateH * 0.5);
    ctx.stroke();
    ctx.strokeStyle = `rgba(180,180,200,0.12)`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(rBaseX, rBaseY + railPlateH * 0.5 + 0.6 * zoom);
    ctx.lineTo(rMidX, rMidY + railPlateH * 0.5 + 0.6 * zoom);
    ctx.stroke();

    // Rail rivets
    ctx.fillStyle = accent;
    const railLen = Math.hypot(rMidX - rBaseX, rMidY - rBaseY);
    const rivetCount = Math.max(3, Math.round(railLen / (8 * zoom)));
    for (let ri = 0; ri < rivetCount; ri++) {
      const t = (ri + 0.5) / rivetCount;
      const rx = rBaseX + (rMidX - rBaseX) * t;
      const ry = rBaseY + (rMidY - rBaseY) * t;
      ctx.beginPath();
      ctx.arc(rx, ry - 0.3 * zoom, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── MAIN ARM PLATES (3D isometric slabs: base→pivot, pivot→mid, mid→tip) ──
  const segments: [number, number, number, number][] = [
    [baseX, baseY, pivotX, pivotY],
    [pivotX, pivotY, midX, midY],
    [midX, midY, tipX, tipY],
  ];
  for (let si = 0; si < segments.length; si++) {
    const [sx, sy, ex, ey] = segments[si];
    const segW = plateW * (si === 2 ? 0.8 : si === 1 ? 0.95 : 1.0);
    const segH = plateH * (si === 2 ? 0.8 : 1.0);
    drawCradlePlateSegment(ctx, sx, sy, ex, ey, segW, segH, side, perpX, perpY, topCol, sideCol, edgeCol, zoom);

    // Rivets along each segment
    ctx.fillStyle = accent;
    const segLen = Math.hypot(ex - sx, ey - sy);
    const segRivets = Math.max(2, Math.round(segLen / (7 * zoom)));
    for (let ri = 0; ri < segRivets; ri++) {
      const t = (ri + 0.5) / segRivets;
      const rx = sx + (ex - sx) * t;
      const ry = sy + (ey - sy) * t;
      ctx.beginPath();
      ctx.arc(rx, ry, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Weld seam on outer edge
    ctx.strokeStyle = `rgba(100,100,110,0.25)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx + side * perpX * segW * 0.48, sy + side * perpY * segW * 0.48 + segH * 0.3);
    ctx.lineTo(ex + side * perpX * segW * 0.48, ey + side * perpY * segW * 0.48 + segH * 0.3);
    ctx.stroke();
  }

  // ── GUSSET PLATES at joints (triangular reinforcement) ──
  const joints: [number, number, number, number, number, number][] = [
    [baseX, baseY, pivotX, pivotY, pivotX, pivotY],
    [pivotX, pivotY, midX, midY, midX, midY],
  ];
  for (let ji = 0; ji < joints.length; ji++) {
    const [, , jx, jy, nx, ny] = joints[ji];
    const prevSeg = segments[ji];
    const nextSeg = segments[ji + 1];
    const gussetSize = (level >= 3 ? 5 : level >= 2 ? 4.5 : 3.5) * zoom;

    // Direction vectors of incoming and outgoing segments
    const inDx = jx - prevSeg[0];
    const inDy = jy - prevSeg[1];
    const inLen = Math.hypot(inDx, inDy) || 1;
    const outDx = nextSeg[2] - nx;
    const outDy = nextSeg[3] - ny;
    const outLen = Math.hypot(outDx, outDy) || 1;

    const g0x = jx - (inDx / inLen) * gussetSize;
    const g0y = jy - (inDy / inLen) * gussetSize;
    const g1x = jx + (outDx / outLen) * gussetSize;
    const g1y = jy + (outDy / outLen) * gussetSize;

    ctx.fillStyle = sideCol;
    ctx.beginPath();
    ctx.moveTo(jx + side * perpX * plateW * 0.3, jy + side * perpY * plateW * 0.3);
    ctx.lineTo(g0x + side * perpX * plateW * 0.3, g0y + side * perpY * plateW * 0.3);
    ctx.lineTo(g1x + side * perpX * plateW * 0.3, g1y + side * perpY * plateW * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Gusset bolt
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(jx + side * perpX * plateW * 0.2, jy + side * perpY * plateW * 0.2, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── BARREL SADDLE CLAMPS (U-shaped embraces where arm meets barrel) ──
  const clampPoints = [
    { frac: 0.30, recoil: (tierRecoils[0] + tierRecoils[1] * 0.3), barrelR: tiers[0].r * 0.95 },
    { frac: 0.52, recoil: (tierRecoils[0] + tierRecoils[1]) * 0.7, barrelR: tiers[1].r * 0.92 },
  ];
  if (level >= 2) {
    clampPoints.push({ frac: 0.62, recoil: totalRecoil * 0.65, barrelR: tiers[2].r * 0.88 });
  }
  for (const cp of clampPoints) {
    const clampPt = posAtFrac(cp.frac, cp.recoil);
    const cx = clampPt.x + side * perpX * cp.barrelR;
    const cy = clampPt.y + side * perpY * cp.barrelR;
    const clampW = (level >= 3 ? 4 : 3.5) * zoom;
    const clampH = (level >= 3 ? 3 : 2.5) * zoom;

    // Clamp body (curved U-shape wrapping barrel)
    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.moveTo(cx - clampW * 0.5, cy - clampH * 0.3);
    ctx.quadraticCurveTo(cx, cy + clampH * 0.6, cx + clampW * 0.5, cy - clampH * 0.3);
    ctx.lineTo(cx + clampW * 0.5, cy - clampH);
    ctx.lineTo(cx - clampW * 0.5, cy - clampH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    // Clamp side face
    ctx.fillStyle = sideCol;
    ctx.beginPath();
    ctx.moveTo(cx + side * clampW * 0.5, cy - clampH);
    ctx.lineTo(cx + side * clampW * 0.5, cy - clampH + plateH * 0.5);
    ctx.quadraticCurveTo(cx, cy + clampH * 0.6 + plateH * 0.5, cx - side * clampW * 0.1, cy - clampH * 0.3 + plateH * 0.5);
    ctx.lineTo(cx - side * clampW * 0.1, cy - clampH * 0.3);
    ctx.closePath();
    ctx.fill();

    // Clamp bolts (2 on each side)
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx - clampW * 0.3, cy - clampH * 0.6, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + clampW * 0.3, cy - clampH * 0.6, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── TRUNNION PIVOT ASSEMBLY (detailed bearing housing) ──
  {
    const pinR = (level >= 3 ? 5.5 : level >= 2 ? 5 : 4.5) * zoom;
    // Bearing housing plate (hexagonal outline)
    ctx.fillStyle = metalDark;
    ctx.beginPath();
    for (let hi = 0; hi < 6; hi++) {
      const a = hi * Math.PI / 3;
      const hx = pivotX + Math.cos(a) * pinR;
      const hy = pivotY + Math.sin(a) * pinR * 0.7;
      if (hi === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Housing face plate
    ctx.fillStyle = isFront ? metalMid : metalDark;
    ctx.beginPath();
    for (let hi = 0; hi < 6; hi++) {
      const a = hi * Math.PI / 3;
      const hx = pivotX + Math.cos(a) * pinR * 0.82;
      const hy = pivotY + Math.sin(a) * pinR * 0.82 * 0.7;
      if (hi === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.fill();

    // Bearing ring
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(pivotX, pivotY, pinR * 0.55, pinR * 0.55 * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Shaft center
    const shaftCol = level >= 3 ? "#e8c840" : level >= 2 ? "#b0b0b8" : "#9a9a9a";
    ctx.fillStyle = shaftCol;
    ctx.beginPath();
    ctx.ellipse(pivotX, pivotY, pinR * 0.3, pinR * 0.3 * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shaft keyway slot
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(pivotX - pinR * 0.15, pivotY);
    ctx.lineTo(pivotX + pinR * 0.15, pivotY);
    ctx.stroke();
    // Shaft highlight
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.ellipse(pivotX - pinR * 0.08, pivotY - pinR * 0.08, pinR * 0.12, pinR * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Housing hex bolts at each corner
    ctx.fillStyle = accent;
    for (let hi = 0; hi < 6; hi++) {
      const a = hi * Math.PI / 3;
      const bx = pivotX + Math.cos(a) * pinR * 0.72;
      const by = pivotY + Math.sin(a) * pinR * 0.72 * 0.7;
      ctx.beginPath();
      ctx.arc(bx, by, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── BASE ANCHOR (structural mount plate) ──
  {
    const anchorW = plateW * 1.3;
    const anchorH = plateH * 1.2;
    // Anchor plate
    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.moveTo(baseX - anchorW * 0.5, baseY - anchorH * 0.4);
    ctx.lineTo(baseX + anchorW * 0.5, baseY - anchorH * 0.4);
    ctx.lineTo(baseX + anchorW * 0.5, baseY + anchorH * 0.4);
    ctx.lineTo(baseX - anchorW * 0.5, baseY + anchorH * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    // Plate thickness
    ctx.fillStyle = sideCol;
    ctx.fillRect(baseX - anchorW * 0.5, baseY + anchorH * 0.4, anchorW, plateH * 0.6);
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 0.4 * zoom;
    ctx.strokeRect(baseX - anchorW * 0.5, baseY + anchorH * 0.4, anchorW, plateH * 0.6);
    // Anchor bolts (4 corners)
    ctx.fillStyle = accent;
    for (const dx of [-0.35, 0.35]) {
      for (const dy of [-0.25, 0.25]) {
        ctx.beginPath();
        ctx.arc(baseX + anchorW * dx, baseY + anchorH * dy, 0.9 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ── TIP CRADLE END CAP (rounded end with barrel lip) ──
  {
    const capR = plateW * 0.6;
    ctx.fillStyle = topCol;
    ctx.beginPath();
    ctx.ellipse(tipX, tipY, capR, capR * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = edgeCol;
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
    ctx.fillStyle = sideCol;
    ctx.beginPath();
    ctx.ellipse(tipX, tipY, capR * 0.55, capR * 0.55 * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(tipX, tipY, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── HYDRAULIC ELEVATION CYLINDER (L2+: runs parallel to arm, reacts to recoil) ──
  if (level >= 2) {
    const hydOff = side * 3 * zoom;
    const hydBaseX = baseX + perpX * hydOff;
    const hydBaseY = baseY + perpY * hydOff - 0.5 * zoom;
    const hydEndX = midX + perpX * hydOff * 0.7;
    const hydEndY = midY + perpY * hydOff * 0.7;
    const hydSplit = 0.45 + (timeSinceFire < 800 ? (1 - timeSinceFire / 800) * 0.08 : 0);
    const hydMidX = hydBaseX + (hydEndX - hydBaseX) * hydSplit;
    const hydMidY = hydBaseY + (hydEndY - hydBaseY) * hydSplit;

    // Cylinder body (thick dark tube)
    const cylW = (level >= 3 ? 3.5 : 3) * zoom;
    ctx.strokeStyle = level >= 3 ? "#3a3a42" : "#2e3648";
    ctx.lineWidth = cylW;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(hydBaseX, hydBaseY);
    ctx.lineTo(hydMidX, hydMidY);
    ctx.stroke();
    // Cylinder highlight stripe
    ctx.strokeStyle = `rgba(160,160,170,0.15)`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(hydBaseX + perpX * cylW * 0.15, hydBaseY + perpY * cylW * 0.15);
    ctx.lineTo(hydMidX + perpX * cylW * 0.15, hydMidY + perpY * cylW * 0.15);
    ctx.stroke();

    // Piston rod (polished steel)
    ctx.strokeStyle = level >= 3 ? "#c0c0c8" : "#9098a8";
    ctx.lineWidth = (level >= 3 ? 1.8 : 1.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(hydMidX, hydMidY);
    ctx.lineTo(hydEndX, hydEndY);
    ctx.stroke();
    // Rod highlight
    ctx.strokeStyle = `rgba(255,255,255,0.12)`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(hydMidX, hydMidY - 0.5 * zoom);
    ctx.lineTo(hydEndX, hydEndY - 0.5 * zoom);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Cylinder end caps
    ctx.fillStyle = metalDark;
    ctx.beginPath();
    ctx.arc(hydBaseX, hydBaseY, cylW * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = metalMid;
    ctx.beginPath();
    ctx.arc(hydBaseX, hydBaseY, cylW * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Piston end clevis pin
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(hydEndX, hydEndY, 1.3 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Cylinder mounting bracket
    ctx.fillStyle = sideCol;
    ctx.fillRect(hydBaseX - 2 * zoom, hydBaseY - 1 * zoom, 4 * zoom, 2 * zoom);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(hydBaseX, hydBaseY, 0.7 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── DIAGONAL TENSION BRACE (L2+: from base to mid for rigidity) ──
  if (level >= 2) {
    const brOff = side * -1.5 * zoom;
    const brStartX = baseX + perpX * brOff + (pivotX - baseX) * 0.3;
    const brStartY = baseY + perpY * brOff + (pivotY - baseY) * 0.3;
    const brEndX = pivotX + (midX - pivotX) * 0.6 + perpX * brOff;
    const brEndY = pivotY + (midY - pivotY) * 0.6 + perpY * brOff;
    ctx.strokeStyle = level >= 3 ? "#6a6a72" : "#5a5a68";
    ctx.lineWidth = (level >= 3 ? 2 : 1.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(brStartX, brStartY);
    ctx.lineTo(brEndX, brEndY);
    ctx.stroke();
    // Turnbuckle in center of brace (L3)
    if (level >= 3) {
      const tbX = (brStartX + brEndX) * 0.5;
      const tbY = (brStartY + brEndY) * 0.5;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.ellipse(tbX, tbY, 2 * zoom, 1.2 * zoom, Math.atan2(brEndY - brStartY, brEndX - brStartX), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = metalDark;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }
    // Brace end pins
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(brStartX, brStartY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(brEndX, brEndY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── L3: SECONDARY LOWER BRACE (X-pattern with top brace) ──
  if (level >= 3) {
    const br2Off = side * -1.5 * zoom;
    const br2StartX = baseX + perpX * br2Off + (pivotX - baseX) * 0.6;
    const br2StartY = baseY + perpY * br2Off + (pivotY - baseY) * 0.6 + 2 * zoom;
    const br2EndX = pivotX + (midX - pivotX) * 0.3 + perpX * br2Off;
    const br2EndY = pivotY + (midY - pivotY) * 0.3 + perpY * br2Off + 2 * zoom;
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(br2StartX, br2StartY);
    ctx.lineTo(br2EndX, br2EndY);
    ctx.stroke();
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(br2StartX, br2StartY, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(br2EndX, br2EndY, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── RECOIL-REACTIVE STATUS LIGHT (blinks on fire) ──
  if (level >= 2) {
    const lightX = baseX + (pivotX - baseX) * 0.5 + side * perpX * plateW * 0.3;
    const lightY = baseY + (pivotY - baseY) * 0.5 + side * perpY * plateW * 0.3 - 1.5 * zoom;
    const isFlash = timeSinceFire < 400;
    const lightCol = isFlash
      ? (level >= 3 ? "#ff4400" : "#ff8800")
      : (level >= 3 ? "#44aa44" : "#448844");
    // Housing
    ctx.fillStyle = "#2a2a30";
    ctx.beginPath();
    ctx.arc(lightX, lightY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Bulb
    ctx.fillStyle = lightCol;
    ctx.beginPath();
    ctx.arc(lightX, lightY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    if (isFlash) {
      ctx.fillStyle = `rgba(255,${level >= 3 ? 68 : 136},0,0.15)`;
      ctx.beginPath();
      ctx.arc(lightX, lightY, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── CABLE CONDUIT (wire running along arm, sways slightly) ──
  {
    const cableOff = side * perpX * plateW * -0.2;
    const cableOffY = side * perpY * plateW * -0.2 + plateH * 0.7;
    const sway = Math.sin(time * 1.5) * 0.8 * zoom;
    const recoilSway = timeSinceFire < 600 ? (1 - timeSinceFire / 600) * 2 * zoom : 0;
    ctx.strokeStyle = level >= 3 ? "#2a2a30" : "#3a3a3a";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(baseX + cableOff, baseY + cableOffY);
    ctx.quadraticCurveTo(
      (baseX + pivotX) * 0.5 + cableOff, (baseY + pivotY) * 0.5 + cableOffY + sway + recoilSway,
      pivotX + cableOff, pivotY + cableOffY,
    );
    ctx.quadraticCurveTo(
      (pivotX + midX) * 0.5 + cableOff, (pivotY + midY) * 0.5 + cableOffY + sway * 0.7,
      midX + cableOff * 0.7, midY + cableOffY * 0.7,
    );
    ctx.stroke();
    // Cable clips
    ctx.fillStyle = metalMid;
    for (const t of [0.25, 0.55, 0.8]) {
      const clipX = baseX + (midX - baseX) * t + cableOff * (1 - t * 0.3);
      const clipY = baseY + (midY - baseY) * t + cableOffY * (1 - t * 0.3);
      ctx.fillRect(clipX - 1 * zoom, clipY - 0.5 * zoom, 2 * zoom, 1 * zoom);
    }
  }
}

// Standard mortar barrel (L1-3): rigid-body tilt, quadpod, sights, propellant injectors
// Standard mortar barrel (L1-3): rich per-level detail, rigid-body tilt
export function renderMortarStandardBarrel(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  recoilBase: number,
  recoilMid: number,
  recoilTip: number,
  timeSinceFire: number,
) {
  const level = tower.level;
  const rot = tower.rotation || 0;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);

  ctx.save();
  ctx.translate(screenPos.x, topY);

  const hexSides = 8;
  const isoOff: IsoOffFn = (dx, dy) => ({ x: dx, y: dy * ISO_Y_RATIO });

  const fireTiltBoost =
    timeSinceFire < 600 ? (1 - timeSinceFire / 600) * 0.12 : 0;
  const tiltStr = 0.25 + level * 0.03 + fireTiltBoost;
  const tierRecoils = [recoilBase * 0.15, recoilMid * 0.35, recoilTip * 0.65];

  const tiers = [
    {
      r: (17 + level * 2.5) * zoom,
      h: (8 + level) * zoom,
      dark: level >= 3 ? "#28222a" : level >= 2 ? "#262a30" : "#2a2a2e",
      mid: level >= 3 ? "#4a4048" : level >= 2 ? "#3e4450" : "#48484e",
      light: level >= 3 ? "#6a5a60" : level >= 2 ? "#586070" : "#686870",
    },
    {
      r: (13 + level * 2) * zoom,
      h: (8 + level) * zoom,
      dark: level >= 3 ? "#2e2830" : level >= 2 ? "#2a2e36" : "#303034",
      mid: level >= 3 ? "#524850" : level >= 2 ? "#444a58" : "#505056",
      light: level >= 3 ? "#786870" : level >= 2 ? "#666e80" : "#747478",
    },
    {
      r: (10 + level * 1.5) * zoom,
      h: (6 + level * 0.5) * zoom,
      dark: level >= 3 ? "#342e38" : level >= 2 ? "#30343c" : "#35353a",
      mid: level >= 3 ? "#5e5460" : level >= 2 ? "#4e5466" : "#5a5a60",
      light: level >= 3 ? "#887880" : level >= 2 ? "#767e90" : "#808086",
    },
  ];

  const totalH = tiers[0].h + tiers[1].h + tiers[2].h;
  const maxTiltX = cosR * tiltStr * 12 * zoom;
  const maxTiltY = sinR * tiltStr * ISO_Y_RATIO * 12 * zoom;

  const posAtFrac = (frac: number, recoilOffset: number): Pt => ({
    x: frac * maxTiltX,
    y: -frac * totalH + frac * maxTiltY + recoilOffset,
  });

  // ===== QUADPOD / TRIPOD SUPPORTS =====
  {
    const legCount = level >= 2 ? 4 : 3;
    const legAngles =
      level >= 2
        ? [Math.PI * 0.2, Math.PI * 0.8, -Math.PI * 0.2, -Math.PI * 0.8]
        : [Math.PI * 0.5, -Math.PI * 0.25, -Math.PI * 0.75];
    const baseR = tiers[0].r * (level >= 3 ? 1.2 : level >= 2 ? 1.1 : 1.0);
    const attachFrac = level >= 3 ? 0.6 : level >= 2 ? 0.55 : 0.45;
    const attachRecoil = tierRecoils[0] + tierRecoils[1] * 0.5;
    const attachPt = posAtFrac(attachFrac, attachRecoil);

    const legThick = level >= 3 ? 5 : level >= 2 ? 4 : 3;
    const rodThick = level >= 3 ? 2.5 : level >= 2 ? 2 : 1.5;

    for (let li = 0; li < legCount; li++) {
      const la = legAngles[li];
      const footX = Math.cos(la) * baseR;
      const footY = Math.sin(la) * baseR * ISO_Y_RATIO + 4 * zoom;
      const kneeX = (footX + attachPt.x) * (level >= 2 ? 0.45 : 0.5);
      const kneeY = (footY + attachPt.y) * (level >= 2 ? 0.55 : 0.6);

      // Lower leg (thick)
      ctx.strokeStyle =
        level >= 3 ? "#484050" : level >= 2 ? "#3e424e" : "#444448";
      ctx.lineWidth = legThick * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(footX, footY);
      ctx.lineTo(kneeX, kneeY);
      ctx.stroke();

      // Upper leg (thinner rod)
      ctx.strokeStyle =
        level >= 3 ? "#6a6270" : level >= 2 ? "#586068" : "#606066";
      ctx.lineWidth = rodThick * zoom;
      ctx.beginPath();
      ctx.moveTo(kneeX, kneeY);
      ctx.lineTo(attachPt.x + (li % 2 === 0 ? -3 : 3) * zoom, attachPt.y);
      ctx.stroke();

      // Foot pad
      ctx.fillStyle =
        level >= 3 ? "#484050" : level >= 2 ? "#3e4248" : "#444448";
      ctx.beginPath();
      ctx.ellipse(
        footX,
        footY,
        (level >= 2 ? 3.5 : 2.5) * zoom,
        (level >= 2 ? 1.8 : 1.3) * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Knee joint
      ctx.fillStyle =
        level >= 3 ? "#6a6270" : level >= 2 ? "#5a5e68" : "#585860";
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, (level >= 2 ? 2.8 : 2) * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = level >= 3 ? "#9a9098" : level >= 2 ? "#8a8e96" : "#78787e";
      ctx.beginPath();
      ctx.arc(kneeX, kneeY, (level >= 2 ? 1.2 : 0.8) * zoom, 0, Math.PI * 2);
      ctx.fill();

      // L1: chain wrap at knee
      if (level === 1) {
        ctx.strokeStyle = "#505058";
        ctx.lineWidth = 0.9 * zoom;
        for (let rp = 0; rp < 3; rp++) {
          const ry = kneeY - 1 * zoom + rp * 0.8 * zoom;
          ctx.beginPath();
          ctx.ellipse(kneeX, ry, 3 * zoom, 1.5 * zoom, 0, 0, Math.PI);
          ctx.stroke();
        }
        ctx.fillStyle = "#606068";
        ctx.beginPath();
        ctx.arc(kneeX + 2 * zoom, kneeY - 0.5 * zoom, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // L2+: hydraulic shock absorber on each leg
      if (level >= 2) {
        const shockX = (footX + kneeX) * 0.55;
        const shockY = (footY + kneeY) * 0.55;
        const shockEndX = (kneeX + attachPt.x) * 0.6;
        const shockEndY = (kneeY + attachPt.y) * 0.6;
        ctx.strokeStyle = "#7a7a82";
        ctx.lineWidth = 2.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(shockX, shockY);
        ctx.lineTo((shockX + shockEndX) * 0.5, (shockY + shockEndY) * 0.5);
        ctx.stroke();
        ctx.strokeStyle = "#b0b0b8";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo((shockX + shockEndX) * 0.5, (shockY + shockEndY) * 0.5);
        ctx.lineTo(shockEndX, shockEndY);
        ctx.stroke();
      }

      // L2+: cross-braces
      if (level >= 2 && li < Math.min(legCount - 2, 2)) {
        const otherLa = legAngles[li + (level >= 2 ? 2 : 1)];
        const otherFx = Math.cos(otherLa) * baseR;
        const otherFy = Math.sin(otherLa) * baseR * ISO_Y_RATIO + 4 * zoom;
        ctx.strokeStyle = level >= 3 ? "#6a6a6e" : "#5a5a5a";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo((footX + kneeX) * 0.5, (footY + kneeY) * 0.5);
        const otherKneeX = (otherFx + attachPt.x) * 0.45;
        const otherKneeY = (otherFy + attachPt.y) * 0.55;
        ctx.lineTo((otherFx + otherKneeX) * 0.5, (otherFy + otherKneeY) * 0.5);
        ctx.stroke();
      }

      // L3: power conduit along leg
      if (level >= 3) {
        ctx.strokeStyle = "#3a3a44";
        ctx.lineWidth = 0.8 * zoom;
        const condStartX = footX * 0.95 + kneeX * 0.05;
        const condStartY = footY * 0.95 + kneeY * 0.05;
        const condEndX = kneeX * 0.5 + attachPt.x * 0.5;
        const condEndY = kneeY * 0.5 + attachPt.y * 0.5;
        ctx.beginPath();
        ctx.moveTo(condStartX + 2 * zoom, condStartY);
        ctx.quadraticCurveTo(
          kneeX + 3 * zoom,
          kneeY + 1 * zoom,
          condEndX + 2 * zoom,
          condEndY,
        );
        ctx.stroke();
      }
    }
    ctx.lineCap = "butt";

    // L3: stabilizer ring connecting all legs at mid-height
    if (level >= 3) {
      ctx.strokeStyle = "#7a7a82";
      ctx.lineWidth = 1.5 * zoom;
      for (let li = 0; li < legCount; li++) {
        const la1 = legAngles[li];
        const la2 = legAngles[(li + 1) % legCount];
        const r1 = baseR * 0.55;
        const r2 = baseR * 0.55;
        const p1x = Math.cos(la1) * r1;
        const p1y = Math.sin(la1) * r1 * ISO_Y_RATIO + 2 * zoom;
        const p2x = Math.cos(la2) * r2;
        const p2y = Math.sin(la2) * r2 * ISO_Y_RATIO + 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(p1x, p1y + attachPt.y * 0.4);
        ctx.lineTo(p2x, p2y + attachPt.y * 0.4);
        ctx.stroke();
      }
    }
  }

  // ===== GUN CARRIAGE (isometric 3D frame that holds the barrel) =====
  {
    const carrFrac = 0.1;
    const carrRecoil = tierRecoils[0] * 0.3;
    const carrPt = posAtFrac(carrFrac, carrRecoil);
    const carrW = tiers[0].r * (level >= 3 ? 0.85 : level >= 2 ? 0.78 : 0.7);
    const carrD = (level >= 3 ? 6 : level >= 2 ? 5 : 4) * zoom;
    const platThick = (level >= 3 ? 3 : 2.5) * zoom;
    const metalDark =
      level >= 3 ? "#28242e" : level >= 2 ? "#262a32" : "#2c2c30";
    const metalMid =
      level >= 3 ? "#48424e" : level >= 2 ? "#3e4450" : "#484850";
    const metalLight =
      level >= 3 ? "#6a6270" : level >= 2 ? "#5a6270" : "#606068";
    const accent = level >= 3 ? "#c9a227" : level >= 2 ? "#8a4428" : "#6a3a28";

    // Perpendicular direction to barrel aim for carriage width
    const perpX = -sinR;
    const perpY = cosR * ISO_Y_RATIO;

    // Carriage rails (thick isometric beams on each side, parallel to aim)
    for (const side of [-1, 1]) {
      const railOffX = side * perpX * carrW;
      const railOffY = side * perpY * carrW;

      // Rail rear (grounded)
      const rearX = carrPt.x + railOffX - cosR * carrD * 0.8;
      const rearY =
        carrPt.y + railOffY - sinR * carrD * ISO_Y_RATIO * 0.8 + 3 * zoom;
      // Rail front (follows tilt slightly)
      const frontPt = posAtFrac(0.35, tierRecoils[0] + tierRecoils[1] * 0.2);
      const frontX = frontPt.x + railOffX + cosR * carrD * 0.3;
      const frontY = frontPt.y + railOffY + sinR * carrD * ISO_Y_RATIO * 0.3;

      const railW = (level >= 3 ? 4 : level >= 2 ? 3.5 : 3) * zoom;
      const railH = (level >= 3 ? 3.5 : 3) * zoom;

      // Rail top face (isometric parallelogram)
      const shade = side > 0 ? metalLight : metalMid;
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.moveTo(rearX - perpX * railW * 0.5, rearY - perpY * railW * 0.5);
      ctx.lineTo(rearX + perpX * railW * 0.5, rearY + perpY * railW * 0.5);
      ctx.lineTo(frontX + perpX * railW * 0.5, frontY + perpY * railW * 0.5);
      ctx.lineTo(frontX - perpX * railW * 0.5, frontY - perpY * railW * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Rail outer side face
      ctx.fillStyle = side > 0 ? metalMid : metalDark;
      ctx.beginPath();
      ctx.moveTo(
        rearX + side * perpX * railW * 0.5,
        rearY + side * perpY * railW * 0.5,
      );
      ctx.lineTo(
        frontX + side * perpX * railW * 0.5,
        frontY + side * perpY * railW * 0.5,
      );
      ctx.lineTo(
        frontX + side * perpX * railW * 0.5,
        frontY + side * perpY * railW * 0.5 + railH,
      );
      ctx.lineTo(
        rearX + side * perpX * railW * 0.5,
        rearY + side * perpY * railW * 0.5 + railH,
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rail rivets along top
      ctx.fillStyle = accent;
      const rivetCount = level >= 3 ? 5 : level >= 2 ? 4 : 3;
      for (let rv = 0; rv < rivetCount; rv++) {
        const t = (rv + 0.5) / rivetCount;
        const rx = rearX + (frontX - rearX) * t;
        const ry = rearY + (frontY - rearY) * t;
        ctx.beginPath();
        ctx.arc(rx, ry, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Rail groove (sliding channel for recoil)
      ctx.strokeStyle = "rgba(0,0,0,0.25)";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(rearX, rearY + railH * 0.4);
      ctx.lineTo(frontX, frontY + railH * 0.4);
      ctx.stroke();
      // Bright edge for the groove
      ctx.strokeStyle = `rgba(200,200,210,0.15)`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(rearX, rearY + railH * 0.4 + 0.6 * zoom);
      ctx.lineTo(frontX, frontY + railH * 0.4 + 0.6 * zoom);
      ctx.stroke();
    }

    // Cross-beams connecting the two rails
    const beamCount = level >= 3 ? 3 : 2;
    for (let b = 0; b < beamCount; b++) {
      const t = (b + 0.5) / beamCount;
      const bFrac = carrFrac + (0.35 - carrFrac) * t;
      const bRecoil =
        carrRecoil + (tierRecoils[0] + tierRecoils[1] * 0.2 - carrRecoil) * t;
      const bPt = posAtFrac(bFrac, bRecoil);
      const leftX = bPt.x - perpX * carrW;
      const leftY = bPt.y - perpY * carrW;
      const rightX = bPt.x + perpX * carrW;
      const rightY = bPt.y + perpY * carrW;
      // Beam top
      ctx.fillStyle = metalMid;
      ctx.fillRect(
        Math.min(leftX, rightX) - 0.5 * zoom,
        Math.min(leftY, rightY) - 1 * zoom,
        Math.abs(rightX - leftX) + 1 * zoom,
        2 * zoom,
      );
      // Draw as a line for clarity
      ctx.strokeStyle = metalLight;
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(leftX, leftY);
      ctx.lineTo(rightX, rightY);
      ctx.stroke();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      // Bolts at connections
      ctx.fillStyle = accent;
      for (const x of [leftX, rightX]) {
        const y = x === leftX ? leftY : rightY;
        ctx.beginPath();
        ctx.arc(x, y, 1 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // TRUNNION BRACKETS (thick shaped brackets that hold the barrel pivot)
    const trunFrac = 0.18;
    const trunRecoil = tierRecoils[0] * 0.5;
    const trunPt = posAtFrac(trunFrac, trunRecoil);
    for (const side of [-1, 1]) {
      const bracketX = trunPt.x + side * perpX * carrW * 0.85;
      const bracketY = trunPt.y + side * perpY * carrW * 0.85;
      const bracketW = (level >= 3 ? 6 : level >= 2 ? 5 : 4) * zoom;
      const bracketH = (level >= 3 ? 8 : level >= 2 ? 7 : 6) * zoom;

      // Cheek plate (trapezoidal, thicker at base)
      ctx.fillStyle = side > 0 ? metalLight : metalMid;
      ctx.beginPath();
      ctx.moveTo(bracketX - bracketW * 0.6, bracketY + bracketH * 0.5);
      ctx.lineTo(bracketX + bracketW * 0.6, bracketY + bracketH * 0.5);
      ctx.lineTo(bracketX + bracketW * 0.4, bracketY - bracketH * 0.5);
      ctx.lineTo(bracketX - bracketW * 0.4, bracketY - bracketH * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Side thickness (3D depth)
      ctx.fillStyle = side > 0 ? metalMid : metalDark;
      ctx.beginPath();
      ctx.moveTo(bracketX + side * bracketW * 0.6, bracketY + bracketH * 0.5);
      ctx.lineTo(
        bracketX + side * bracketW * 0.6 + side * platThick * 0.5,
        bracketY + bracketH * 0.5 + platThick * 0.3,
      );
      ctx.lineTo(
        bracketX + side * bracketW * 0.4 + side * platThick * 0.5,
        bracketY - bracketH * 0.5 + platThick * 0.3,
      );
      ctx.lineTo(bracketX + side * bracketW * 0.4, bracketY - bracketH * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Trunnion bearing hole (concentric circles)
      const pinX = bracketX;
      const pinY = bracketY - bracketH * 0.05;
      // Bearing housing
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.arc(pinX, pinY, (level >= 2 ? 3.5 : 2.8) * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Bearing ring
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(pinX, pinY, (level >= 2 ? 2.8 : 2.2) * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Pin shaft
      ctx.fillStyle = level >= 3 ? "#e8c840" : "#ccc";
      ctx.beginPath();
      ctx.arc(pinX, pinY, (level >= 2 ? 1.5 : 1.2) * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Pin highlight
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(pinX - 0.5 * zoom, pinY - 0.5 * zoom, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Bracket reinforcement ribs
      if (level >= 2) {
        ctx.strokeStyle = metalLight;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(bracketX - bracketW * 0.2, bracketY + bracketH * 0.4);
        ctx.lineTo(pinX, pinY);
        ctx.lineTo(bracketX + bracketW * 0.2, bracketY + bracketH * 0.4);
        ctx.stroke();
      }

      // Cap screws on bracket face
      ctx.fillStyle = accent;
      const screwPositions = [
        { dx: -bracketW * 0.3, dy: bracketH * 0.3 },
        { dx: bracketW * 0.3, dy: bracketH * 0.3 },
        { dx: -bracketW * 0.2, dy: -bracketH * 0.3 },
        { dx: bracketW * 0.2, dy: -bracketH * 0.3 },
      ];
      for (const sp of screwPositions) {
        ctx.beginPath();
        ctx.arc(bracketX + sp.dx, bracketY + sp.dy, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Carriage base plate (flat isometric plate under the rails)
    {
      const basePt = posAtFrac(0.08, carrRecoil * 0.2);
      const bpW = carrW * 1.15;
      const bpD = carrD * 1.2;
      ctx.fillStyle = metalMid;
      ctx.beginPath();
      ctx.moveTo(
        basePt.x - perpX * bpW - cosR * bpD,
        basePt.y - perpY * bpW - sinR * bpD * ISO_Y_RATIO + 4 * zoom,
      );
      ctx.lineTo(
        basePt.x + perpX * bpW - cosR * bpD,
        basePt.y + perpY * bpW - sinR * bpD * ISO_Y_RATIO + 4 * zoom,
      );
      ctx.lineTo(
        basePt.x + perpX * bpW + cosR * bpD,
        basePt.y + perpY * bpW + sinR * bpD * ISO_Y_RATIO + 4 * zoom,
      );
      ctx.lineTo(
        basePt.x - perpX * bpW + cosR * bpD,
        basePt.y - perpY * bpW + sinR * bpD * ISO_Y_RATIO + 4 * zoom,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
      // Plate edge thickness
      ctx.fillStyle = metalDark;
      ctx.beginPath();
      ctx.moveTo(
        basePt.x - perpX * bpW + cosR * bpD,
        basePt.y - perpY * bpW + sinR * bpD * ISO_Y_RATIO + 4 * zoom,
      );
      ctx.lineTo(
        basePt.x + perpX * bpW + cosR * bpD,
        basePt.y + perpY * bpW + sinR * bpD * ISO_Y_RATIO + 4 * zoom,
      );
      ctx.lineTo(
        basePt.x + perpX * bpW + cosR * bpD,
        basePt.y +
          perpY * bpW +
          sinR * bpD * ISO_Y_RATIO +
          4 * zoom +
          platThick,
      );
      ctx.lineTo(
        basePt.x - perpX * bpW + cosR * bpD,
        basePt.y -
          perpY * bpW +
          sinR * bpD * ISO_Y_RATIO +
          4 * zoom +
          platThick,
      );
      ctx.closePath();
      ctx.fill();
    }

    // Recoil slide blocks (visible on rails, move with barrel)
    {
      const slideFrac = 0.18;
      const slideRecoil = tierRecoils[0] * 0.5 + tierRecoils[1] * 0.1;
      const slidePt = posAtFrac(slideFrac, slideRecoil);
      for (const side of [-1, 1]) {
        const slideX = slidePt.x + side * perpX * carrW;
        const slideY = slidePt.y + side * perpY * carrW;
        ctx.fillStyle = level >= 3 ? "#7a7a82" : "#5a5a62";
        ctx.fillRect(
          slideX - 2.5 * zoom,
          slideY - 1.5 * zoom,
          5 * zoom,
          3 * zoom,
        );
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.4 * zoom;
        ctx.strokeRect(
          slideX - 2.5 * zoom,
          slideY - 1.5 * zoom,
          5 * zoom,
          3 * zoom,
        );
        ctx.fillStyle = "#9a9a9a";
        ctx.beginPath();
        ctx.arc(slideX, slideY, 0.6 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

  }

  // ===== BACK CRADLE ARM (behind barrel, drawn first for depth) =====
  {
    const carrWB = tiers[0].r * (level >= 3 ? 1.15 : level >= 2 ? 1.08 : 1.0);
    const cradleThick = (level >= 3 ? 10 : level >= 2 ? 9 : 7.5) * zoom;
    const cradleW = carrWB * (level >= 3 ? 1.35 : level >= 2 ? 1.28 : 1.2);
    const metalDarkB = level >= 3 ? "#28242e" : level >= 2 ? "#262a32" : "#2c2c30";
    const metalMidB = level >= 3 ? "#48424e" : level >= 2 ? "#3e4450" : "#484850";
    const metalLightB = level >= 3 ? "#6a6270" : level >= 2 ? "#5a6270" : "#606068";
    const accentB = level >= 3 ? "#c9a227" : level >= 2 ? "#8a4428" : "#6a3a28";
    const totalRecoilEst = tierRecoils[0] + tierRecoils[1] + tierRecoils[2];
    const backSide = sinR > 0 ? 1 : -1;
    drawMortarCradleArm(ctx, {
      side: backSide, level, zoom, sinR, cosR,
      perpX: -sinR, perpY: cosR * ISO_Y_RATIO,
      tiers, tierRecoils, totalRecoil: totalRecoilEst, posAtFrac,
      cradleW, cradleThick,
      metalDark: metalDarkB, metalMid: metalMidB, metalLight: metalLightB, accent: accentB,
      time, timeSinceFire,
    });
  }

  // ===== 3 STACKED HEX-PRISM TIERS (rigid-body tilt) =====
  let cumH = 0;
  let cumRecoil = 0;
  for (let ti = 0; ti < 3; ti++) {
    const tier = tiers[ti];
    cumRecoil += tierRecoils[ti];

    const botFrac = cumH / totalH;
    const topFrac = (cumH + tier.h) / totalH;
    const botCenter = posAtFrac(botFrac, cumRecoil - tierRecoils[ti]);
    const topCenter = posAtFrac(topFrac, cumRecoil);

    const hexVerts = generateIsoHexVertices(isoOff, tier.r, hexSides);
    const sideNormals = computeHexSideNormals(cosR, hexSides);
    const sorted = sortSidesByDepth(sideNormals);

    // Draw hex faces with per-level surface detail
    for (const i of sorted) {
      const ni = (i + 1) % hexSides;
      const n = sideNormals[i];
      const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
      const dr = parseInt(tier.dark.slice(1, 3), 16);
      const dg = parseInt(tier.dark.slice(3, 5), 16);
      const db = parseInt(tier.dark.slice(5, 7), 16);
      const lr = parseInt(tier.light.slice(1, 3), 16);
      const lg = parseInt(tier.light.slice(3, 5), 16);
      const lb = parseInt(tier.light.slice(5, 7), 16);
      const fR = Math.floor(dr + (lr - dr) * bright);
      const fG = Math.floor(dg + (lg - dg) * bright);
      const fB = Math.floor(db + (lb - db) * bright);
      ctx.fillStyle = `rgb(${fR},${fG},${fB})`;
      ctx.beginPath();
      ctx.moveTo(botCenter.x + hexVerts[i].x, botCenter.y + hexVerts[i].y);
      ctx.lineTo(botCenter.x + hexVerts[ni].x, botCenter.y + hexVerts[ni].y);
      ctx.lineTo(topCenter.x + hexVerts[ni].x, topCenter.y + hexVerts[ni].y);
      ctx.lineTo(topCenter.x + hexVerts[i].x, topCenter.y + hexVerts[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Skip only truly hidden backfaces
      if (n < -0.7) continue;

      // L1: cast iron plates with seams and bolt heads
      if (level === 1) {
        // Vertical plate seam
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 0.5 * zoom;
        const mx = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
        const my = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
        ctx.beginPath();
        ctx.moveTo(botCenter.x + mx, botCenter.y + my);
        ctx.lineTo(topCenter.x + mx, topCenter.y + my);
        ctx.stroke();
        // Surface scratch lines
        ctx.strokeStyle = `rgba(80,80,90,${0.05 + bright * 0.04})`;
        ctx.lineWidth = 0.3 * zoom;
        for (let g = 0; g < 2; g++) {
          const gf = 0.3 + g * 0.35;
          const gx1 = hexVerts[i].x * (1 - gf) + hexVerts[ni].x * gf;
          const gy1 = hexVerts[i].y * (1 - gf) + hexVerts[ni].y * gf;
          ctx.beginPath();
          ctx.moveTo(botCenter.x + gx1, botCenter.y + gy1);
          ctx.lineTo(topCenter.x + gx1, topCenter.y + gy1);
          ctx.stroke();
        }
        // Iron bolt heads
        ctx.fillStyle = `rgba(80,80,88,${0.4 + bright * 0.25})`;
        const bx = botCenter.x + hexVerts[i].x * 0.7 + hexVerts[ni].x * 0.3;
        const by = botCenter.y + hexVerts[i].y * 0.7 + hexVerts[ni].y * 0.3;
        const tbx = topCenter.x + hexVerts[i].x * 0.7 + hexVerts[ni].x * 0.3;
        const tby = topCenter.y + hexVerts[i].y * 0.7 + hexVerts[ni].y * 0.3;
        for (const nf of [0.25, 0.75]) {
          const boltX = bx + (tbx - bx) * nf;
          const boltY = by + (tby - by) * nf;
          ctx.beginPath();
          ctx.arc(boltX, boltY, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // L2: steel plates with weld seams, rivets, and inspection marks
      if (level === 2) {
        // Horizontal weld seam at mid-height
        const midX1 = (botCenter.x + topCenter.x) * 0.5 + hexVerts[i].x;
        const midY1 = (botCenter.y + topCenter.y) * 0.5 + hexVerts[i].y;
        const midX2 = (botCenter.x + topCenter.x) * 0.5 + hexVerts[ni].x;
        const midY2 = (botCenter.y + topCenter.y) * 0.5 + hexVerts[ni].y;
        // Weld shadow
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(midX1, midY1);
        ctx.lineTo(midX2, midY2);
        ctx.stroke();
        // Weld highlight
        ctx.strokeStyle = `rgba(140,145,160,${0.15 + bright * 0.1})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(midX1, midY1 - 0.5 * zoom);
        ctx.lineTo(midX2, midY2 - 0.5 * zoom);
        ctx.stroke();
        // Rivets in a grid pattern
        ctx.fillStyle = `rgba(130,140,160,${0.45 + bright * 0.3})`;
        for (let rv = 0; rv < 3; rv++) {
          const t = (rv + 0.5) / 3;
          for (const vFrac of [0.25, 0.75]) {
            const rvX = botCenter.x * (1 - vFrac) + topCenter.x * vFrac + hexVerts[i].x * (1 - t) + hexVerts[ni].x * t;
            const rvY = botCenter.y * (1 - vFrac) + topCenter.y * vFrac + hexVerts[i].y * (1 - t) + hexVerts[ni].y * t;
            ctx.beginPath();
            ctx.arc(rvX, rvY, 0.7 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Vertical center seam
        const mx = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
        const my = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(botCenter.x + mx, botCenter.y + my);
        ctx.lineTo(topCenter.x + mx, topCenter.y + my);
        ctx.stroke();
        // Inspection stencil mark (small rectangle on some faces)
        if (i % 3 === 0 && ti === 0) {
          const markX = (botCenter.x + topCenter.x) * 0.5 + mx * 0.7;
          const markY = (botCenter.y + topCenter.y) * 0.5 + my * 0.7;
          ctx.strokeStyle = `rgba(180,180,200,${0.1 + bright * 0.05})`;
          ctx.lineWidth = 0.3 * zoom;
          ctx.strokeRect(markX - 1.5 * zoom, markY - 1 * zoom, 3 * zoom, 2 * zoom);
        }
      }

      // L3: polished plates with gold filigree, accent rivets, and engraved border
      if (level >= 3) {
        const inset = 0.12;
        const il = hexVerts[i].x * (1 - inset) + hexVerts[ni].x * inset;
        const ir = hexVerts[i].x * inset + hexVerts[ni].x * (1 - inset);
        const ily = hexVerts[i].y * (1 - inset) + hexVerts[ni].y * inset;
        const iry = hexVerts[i].y * inset + hexVerts[ni].y * (1 - inset);
        const bx = (botCenter.x + topCenter.x) * 0.5;
        const by = (botCenter.y + topCenter.y) * 0.5;
        // Inset border (engraved rectangle on face)
        ctx.strokeStyle = `rgba(201,162,39,${0.2 + bright * 0.12})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        const fInset = 0.2;
        const bl = { x: botCenter.x + hexVerts[i].x * (1 - fInset) + hexVerts[ni].x * fInset,
          y: botCenter.y + hexVerts[i].y * (1 - fInset) + hexVerts[ni].y * fInset };
        const br = { x: botCenter.x + hexVerts[i].x * fInset + hexVerts[ni].x * (1 - fInset),
          y: botCenter.y + hexVerts[i].y * fInset + hexVerts[ni].y * (1 - fInset) };
        const tl = { x: topCenter.x + hexVerts[i].x * (1 - fInset) + hexVerts[ni].x * fInset,
          y: topCenter.y + hexVerts[i].y * (1 - fInset) + hexVerts[ni].y * fInset };
        const tr = { x: topCenter.x + hexVerts[i].x * fInset + hexVerts[ni].x * (1 - fInset),
          y: topCenter.y + hexVerts[i].y * fInset + hexVerts[ni].y * (1 - fInset) };
        ctx.moveTo(bl.x, bl.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(tl.x, tl.y);
        ctx.closePath();
        ctx.stroke();
        // Center engraved line
        ctx.beginPath();
        ctx.moveTo(bx + il, by + ily);
        ctx.lineTo(bx + ir, by + iry);
        ctx.stroke();
        // Polished highlight line
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + bright * 0.04})`;
        ctx.lineWidth = 0.6 * zoom;
        const hlx1 = hexVerts[i].x * 0.8 + hexVerts[ni].x * 0.2;
        const hly1 = hexVerts[i].y * 0.8 + hexVerts[ni].y * 0.2;
        ctx.beginPath();
        ctx.moveTo(botCenter.x + hlx1, botCenter.y + hly1);
        ctx.lineTo(topCenter.x + hlx1, topCenter.y + hly1);
        ctx.stroke();
        // Gold rivets at corners
        ctx.fillStyle = `rgba(201,162,39,${0.55 + bright * 0.3})`;
        for (const vIdx of [i, ni]) {
          for (const center of [topCenter, botCenter]) {
            ctx.beginPath();
            ctx.arc(center.x + hexVerts[vIdx].x * 0.93, center.y + hexVerts[vIdx].y * 0.93, 0.8 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Cap
    drawHexCap(
      ctx,
      topCenter,
      hexVerts,
      tier.light,
      "rgba(0,0,0,0.12)",
      0.8 * zoom,
    );

    // Metal band at tier top
    const bandH = (level >= 3 ? 2.5 : 2) * zoom;
    const bandBot: Pt = { x: topCenter.x, y: topCenter.y + bandH };
    const bandColor =
      level >= 3 ? "#c9a227" : level >= 2 ? "#7a8090" : "#6a5a4a";
    drawHexBand(
      ctx,
      hexVerts,
      sideNormals,
      bandBot,
      topCenter,
      1.03,
      (n) => {
        const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
        const bR = parseInt(bandColor.slice(1, 3), 16);
        const bG = parseInt(bandColor.slice(3, 5), 16);
        const bB = parseInt(bandColor.slice(5, 7), 16);
        return `rgb(${Math.floor(bR * (0.6 + b * 0.4))},${Math.floor(bG * (0.6 + b * 0.4))},${Math.floor(bB * (0.6 + b * 0.4))})`;
      },
      "rgba(0,0,0,0.2)",
      0.5 * zoom,
      -0.3,
    );

    // L1: rope bindings between tiers
    if (level === 1 && ti < 2) {
      ctx.strokeStyle = "#8a7a5a";
      ctx.lineWidth = 0.8 * zoom;
      for (let rp = 0; rp < 2; rp++) {
        const ropeFrac = rp === 0 ? 0.25 : 0.75;
        const rpPt: Pt = {
          x: botCenter.x + (topCenter.x - botCenter.x) * ropeFrac,
          y: botCenter.y + (topCenter.y - botCenter.y) * ropeFrac,
        };
        for (let ri = 0; ri < hexSides; ri++) {
          if (sideNormals[ri] < -0.7) continue;
          const rni = (ri + 1) % hexSides;
          ctx.beginPath();
          ctx.moveTo(
            rpPt.x + hexVerts[ri].x * 1.01,
            rpPt.y + hexVerts[ri].y * 1.01,
          );
          ctx.lineTo(
            rpPt.x + hexVerts[rni].x * 1.01,
            rpPt.y + hexVerts[rni].y * 1.01,
          );
          ctx.stroke();
        }
      }
    }

    // L2+: band rivets
    if (level >= 2) {
      ctx.fillStyle = level >= 3 ? "#e8c840" : "#8090a0";
      for (let i = 0; i < hexSides; i++) {
        if (sideNormals[i] < -0.7) continue;
        ctx.beginPath();
        ctx.arc(
          topCenter.x + hexVerts[i].x * 1.03,
          topCenter.y + hexVerts[i].y * 1.03,
          (level >= 3 ? 1.1 : 0.9) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Per-tier accessories
    if (ti === 0) {
      // L1: iron hoop reinforcement at bottom
      if (level === 1) {
        const hoopFrac = 0.2;
        const hoopPt: Pt = {
          x: botCenter.x + (topCenter.x - botCenter.x) * hoopFrac,
          y: botCenter.y + (topCenter.y - botCenter.y) * hoopFrac,
        };
        ctx.strokeStyle = "#5a5a5a";
        ctx.lineWidth = 1.5 * zoom;
        for (let hi = 0; hi < hexSides; hi++) {
          if (sideNormals[hi] < -0.7) continue;
          const hni = (hi + 1) % hexSides;
          ctx.beginPath();
          ctx.moveTo(
            hoopPt.x + hexVerts[hi].x * 1.02,
            hoopPt.y + hexVerts[hi].y * 1.02,
          );
          ctx.lineTo(
            hoopPt.x + hexVerts[hni].x * 1.02,
            hoopPt.y + hexVerts[hni].y * 1.02,
          );
          ctx.stroke();
        }
      }

      // L2+: propellant injector nozzle (only when front faces camera)
      if (level >= 2 && cosR + 0.5 * sinR > -0.3) {
        const injPt = posAtFrac(
          botFrac + (topFrac - botFrac) * 0.5,
          cumRecoil - tierRecoils[ti] * 0.5,
        );
        const injX = injPt.x + cosR * tier.r * 0.9;
        const injY = injPt.y + sinR * tier.r * ISO_Y_RATIO * 0.9;
        ctx.fillStyle = level >= 3 ? "#7a5a3a" : "#6a4a2a";
        ctx.beginPath();
        ctx.ellipse(injX, injY, 2.8 * zoom, 1.8 * zoom, rot, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = level >= 3 ? "#9a7a5a" : "#8a6a4a";
        ctx.lineWidth = 1 * zoom;
        ctx.stroke();
        ctx.strokeStyle = "#5a4a3a";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(injX, injY);
        ctx.lineTo(injX + cosR * 8 * zoom, injY + sinR * 4 * zoom);
        ctx.stroke();
        // L3: second feed pipe
        if (level >= 3) {
          ctx.strokeStyle = "#4a3a2a";
          ctx.lineWidth = 0.8 * zoom;
          ctx.beginPath();
          ctx.moveTo(injX + sinR * 2 * zoom, injY - cosR * 1 * zoom);
          ctx.lineTo(
            injX + cosR * 6 * zoom + sinR * 2 * zoom,
            injY + sinR * 3 * zoom - cosR * 1 * zoom,
          );
          ctx.stroke();
        }
      }

      // L1: rope handle (only when rear faces camera)
      if (level === 1 && -cosR - 0.5 * sinR > -0.3) {
        const handlePt = posAtFrac(
          botFrac + (topFrac - botFrac) * 0.6,
          cumRecoil - tierRecoils[ti] * 0.4,
        );
        const hx = handlePt.x - cosR * tier.r * 0.8;
        const hy = handlePt.y - sinR * tier.r * ISO_Y_RATIO * 0.8;
        ctx.strokeStyle = "#8a7a5a";
        ctx.lineWidth = 1.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(hx - 2 * zoom, hy);
        ctx.quadraticCurveTo(hx, hy + 4 * zoom, hx + 2 * zoom, hy);
        ctx.stroke();
      }
    }

    if (ti === 1) {
      // L3: elevation screw jack (only when rear faces camera)
      if (level >= 3 && -cosR - 0.5 * sinR > -0.3) {
        const screwPt = posAtFrac(
          botFrac + (topFrac - botFrac) * 0.3,
          cumRecoil - tierRecoils[ti] * 0.7,
        );
        const screwX = screwPt.x - cosR * tier.r * 0.7;
        const screwY = screwPt.y - sinR * tier.r * ISO_Y_RATIO * 0.7;
        ctx.strokeStyle = "#9a9aa0";
        ctx.lineWidth = 1.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(screwX, screwY + tier.h * 0.6);
        ctx.lineTo(screwX, screwY);
        ctx.stroke();
        ctx.fillStyle = "#c9a227";
        for (let s = 0; s < 5; s++) {
          ctx.beginPath();
          ctx.arc(
            screwX,
            screwY + s * tier.h * 0.12,
            0.9 * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        // Handwheel at bottom
        ctx.strokeStyle = "#7a7a82";
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          screwX,
          screwY + tier.h * 0.65,
          2.5 * zoom,
          1.5 * zoom,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }

      // L2: side-mounted handles (per-side camera visibility)
      if (level === 2) {
        for (const side of [-1, 1]) {
          const sideVis = side * (-sinR + 0.5 * cosR);
          if (sideVis < -0.3) continue;
          const hPt = posAtFrac(
            botFrac + (topFrac - botFrac) * 0.5,
            cumRecoil - tierRecoils[ti] * 0.5,
          );
          const hx = hPt.x + side * sinR * tier.r * 0.85;
          const hy = hPt.y - side * cosR * tier.r * ISO_Y_RATIO * 0.4;
          ctx.strokeStyle = "#6a6a6a";
          ctx.lineWidth = 1.5 * zoom;
          ctx.beginPath();
          ctx.moveTo(hx - side * 1 * zoom, hy - 2 * zoom);
          ctx.lineTo(hx - side * 1 * zoom, hy + 2 * zoom);
          ctx.stroke();
        }
      }

      // L2+: external gauge (only when front faces camera)
      if (level >= 2 && cosR + 0.5 * sinR > -0.3) {
        const gaugePt = posAtFrac(
          botFrac + (topFrac - botFrac) * 0.7,
          cumRecoil - tierRecoils[ti] * 0.3,
        );
        const gx = gaugePt.x + cosR * tier.r * 0.85;
        const gy = gaugePt.y + sinR * tier.r * ISO_Y_RATIO * 0.85;
        ctx.fillStyle = "#2a2a30";
        ctx.beginPath();
        ctx.arc(gx, gy, 2.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
        ctx.lineWidth = 0.8 * zoom;
        ctx.stroke();
        // Needle
        const needleAngle = time * 0.5 + rot;
        ctx.strokeStyle = "#ff4400";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(
          gx + Math.cos(needleAngle) * 1.8 * zoom,
          gy + Math.sin(needleAngle) * 1.8 * zoom,
        );
        ctx.stroke();
      }
    }

    if (ti === 2) {
      // L2+: vent holes near top
      if (level >= 2) {
        const ventPt = posAtFrac(
          botFrac + (topFrac - botFrac) * 0.4,
          cumRecoil - tierRecoils[ti] * 0.6,
        );
        for (let vi = 0; vi < 3; vi++) {
          const va = rot + vi * Math.PI * 0.5;
          const vx = ventPt.x + Math.cos(va) * tier.r * 0.85;
          const vy = ventPt.y + Math.sin(va) * tier.r * ISO_Y_RATIO * 0.85;
          if (Math.cos(va) * cosR + Math.sin(va) * sinR < -0.3) continue;
          ctx.fillStyle = "#1a1a1a";
          ctx.beginPath();
          ctx.ellipse(vx, vy, 1.2 * zoom, 0.6 * zoom, rot, 0, Math.PI * 2);
          ctx.fill();
          // Steam from vents after firing
          if (timeSinceFire < 1500) {
            const steamA = (1 - timeSinceFire / 1500) * 0.2;
            ctx.fillStyle = `rgba(200,200,200,${steamA})`;
            ctx.beginPath();
            ctx.arc(
              vx,
              vy - (timeSinceFire / 1500) * 5 * zoom,
              (1 + (timeSinceFire / 1500) * 2) * zoom,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        }
      }

      // L3: exhaust pipes (per-side camera visibility)
      if (level >= 3) {
        for (const side of [-1, 1]) {
          const epSideVis = side * (-sinR + 0.5 * cosR);
          if (epSideVis < -0.3) continue;
          const epPt = posAtFrac(
            botFrac + (topFrac - botFrac) * 0.3,
            cumRecoil - tierRecoils[ti] * 0.7,
          );
          const epx = epPt.x + side * sinR * tier.r * 0.9;
          const epy = epPt.y - side * cosR * tier.r * ISO_Y_RATIO * 0.5;
          ctx.strokeStyle = "#5a5a5a";
          ctx.lineWidth = 2 * zoom;
          ctx.beginPath();
          ctx.moveTo(epx, epy);
          ctx.lineTo(
            epx + side * sinR * 4 * zoom,
            epy - side * cosR * 2 * zoom - 3 * zoom,
          );
          ctx.stroke();
          ctx.fillStyle = "#3a3a3a";
          ctx.beginPath();
          ctx.ellipse(
            epx + side * sinR * 4 * zoom,
            epy - side * cosR * 2 * zoom - 3 * zoom,
            1.5 * zoom,
            1 * zoom,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
    }

    cumH += tier.h;
  }

  // ===== TELESCOPIC SCOPE (mounted on side of barrel, follows tilt+recoil) =====
  {
    const scopeFrac = 0.55;
    const scopeRecoil = cumRecoil * 0.7;
    const scopePt = posAtFrac(scopeFrac, scopeRecoil);
    // Scope on the side perpendicular to aim
    const scopeSide = -1;
    const scopeVis = scopeSide * (-sinR + 0.5 * cosR);
    if (scopeVis > -0.4) {
      const mountR = tiers[1].r * 0.85;
      const scopeBaseX = scopePt.x + scopeSide * sinR * mountR;
      const scopeBaseY = scopePt.y - scopeSide * cosR * mountR * ISO_Y_RATIO * 0.4;

      // Scope mount bracket (thick L-shaped bracket clamped to barrel)
      const bracketColor = level >= 3 ? "#5a5a62" : level >= 2 ? "#404868" : "#4a4a4a";
      ctx.fillStyle = bracketColor;
      ctx.beginPath();
      ctx.moveTo(scopeBaseX, scopeBaseY + 2 * zoom);
      ctx.lineTo(scopeBaseX + scopeSide * 3 * zoom, scopeBaseY + 2 * zoom);
      ctx.lineTo(scopeBaseX + scopeSide * 3 * zoom, scopeBaseY - 3 * zoom);
      ctx.lineTo(scopeBaseX + scopeSide * 1 * zoom, scopeBaseY - 3 * zoom);
      ctx.lineTo(scopeBaseX + scopeSide * 1 * zoom, scopeBaseY);
      ctx.lineTo(scopeBaseX, scopeBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
      // Mount bolts
      ctx.fillStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
      ctx.beginPath();
      ctx.arc(scopeBaseX + scopeSide * 0.5 * zoom, scopeBaseY + 1 * zoom, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(scopeBaseX + scopeSide * 0.5 * zoom, scopeBaseY - 1 * zoom, 0.6 * zoom, 0, Math.PI * 2);
      ctx.fill();

      // Scope tube body
      const tubeStartX = scopeBaseX + scopeSide * 3 * zoom;
      const tubeStartY = scopeBaseY - 0.5 * zoom;
      const scopeEndPt = posAtFrac(scopeFrac + 0.28, scopeRecoil * 1.1);
      const tubeEndX = scopeEndPt.x + scopeSide * sinR * mountR * 0.6 + cosR * 4 * zoom;
      const tubeEndY = scopeEndPt.y - scopeSide * cosR * mountR * ISO_Y_RATIO * 0.25 + sinR * 2 * zoom;

      // Shadow tube
      ctx.strokeStyle = level >= 3 ? "#2a2a30" : level >= 2 ? "#1e2238" : "#2a2a2a";
      ctx.lineWidth = (level >= 3 ? 5 : level >= 2 ? 4.5 : 3.5) * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tubeStartX, tubeStartY + 0.5 * zoom);
      ctx.lineTo(tubeEndX, tubeEndY + 0.5 * zoom);
      ctx.stroke();
      // Main tube body
      ctx.strokeStyle = level >= 3 ? "#3a3a42" : level >= 2 ? "#2e3448" : "#3a3a3a";
      ctx.lineWidth = (level >= 3 ? 4.5 : level >= 2 ? 4 : 3) * zoom;
      ctx.beginPath();
      ctx.moveTo(tubeStartX, tubeStartY);
      ctx.lineTo(tubeEndX, tubeEndY);
      ctx.stroke();
      // Top highlight line
      ctx.strokeStyle = `rgba(200,200,220,${0.12 + (level >= 3 ? 0.06 : 0)})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(tubeStartX, tubeStartY - 1.5 * zoom);
      ctx.lineTo(tubeEndX, tubeEndY - 1.5 * zoom);
      ctx.stroke();
      ctx.lineCap = "butt";

      // Scope rings (bands clamping the tube)
      const ringCount = level >= 3 ? 3 : 2;
      for (let ri = 0; ri < ringCount; ri++) {
        const t = (ri + 0.5) / (ringCount + 0.5);
        const rx = tubeStartX + (tubeEndX - tubeStartX) * t;
        const ry = tubeStartY + (tubeEndY - tubeStartY) * t;
        const ringW = (level >= 3 ? 3 : 2.5) * zoom;
        ctx.fillStyle = level >= 3 ? "#5a5a62" : level >= 2 ? "#404868" : "#4a4a4a";
        ctx.fillRect(rx - ringW * 0.5, ry - 2.5 * zoom, ringW, 5 * zoom);
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.strokeRect(rx - ringW * 0.5, ry - 2.5 * zoom, ringW, 5 * zoom);
        // Ring screws
        ctx.fillStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
        ctx.beginPath();
        ctx.arc(rx, ry - 2 * zoom, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rx, ry + 2 * zoom, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // Objective lens (front)
      ctx.fillStyle = level >= 3 ? "#2a2a32" : "#1a1a22";
      ctx.beginPath();
      ctx.ellipse(tubeEndX, tubeEndY, (level >= 3 ? 3 : 2.5) * zoom, (level >= 3 ? 2 : 1.5) * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      const lensGlow = 0.25 + Math.sin(time * 2.5) * 0.15;
      const lensColor = level >= 3 ? `rgba(100, 200, 255, ${lensGlow})` :
        level >= 2 ? `rgba(80, 255, 120, ${lensGlow})` : `rgba(200, 180, 100, ${lensGlow})`;
      ctx.fillStyle = lensColor;
      ctx.beginPath();
      ctx.ellipse(tubeEndX, tubeEndY, (level >= 3 ? 2 : 1.5) * zoom, (level >= 3 ? 1.3 : 1) * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      // Lens reflection
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.beginPath();
      ctx.ellipse(tubeEndX - 0.5 * zoom, tubeEndY - 0.5 * zoom, 0.6 * zoom, 0.4 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyepiece (rear, slightly wider)
      ctx.fillStyle = level >= 3 ? "#2a2a32" : "#1a1a22";
      ctx.beginPath();
      ctx.ellipse(tubeStartX, tubeStartY, 2.5 * zoom, 1.8 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.ellipse(tubeStartX, tubeStartY, 1.5 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();

      // L2+: elevation turret (knob on top of scope)
      if (level >= 2) {
        const turretX = tubeStartX + (tubeEndX - tubeStartX) * 0.4;
        const turretY = tubeStartY + (tubeEndY - tubeStartY) * 0.4 - 3 * zoom;
        ctx.fillStyle = level >= 3 ? "#4a4a52" : "#3a3a48";
        ctx.beginPath();
        ctx.arc(turretX, turretY, 1.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = level >= 3 ? "#6a6a72" : "#5a5a68";
        ctx.lineWidth = 0.5 * zoom;
        ctx.stroke();
        // Turret cap
        ctx.fillStyle = level >= 3 ? "#c9a227" : "#6a6a72";
        ctx.beginPath();
        ctx.arc(turretX, turretY, 0.8 * zoom, 0, Math.PI * 2);
        ctx.fill();
        // Windage turret (side)
        const windX = turretX + 2 * zoom;
        const windY = turretY + 1.5 * zoom;
        ctx.fillStyle = level >= 3 ? "#4a4a52" : "#3a3a48";
        ctx.beginPath();
        ctx.arc(windX, windY, 1.2 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }

      // L3: laser rangefinder module below scope
      if (level >= 3) {
        const lrfX = tubeStartX + (tubeEndX - tubeStartX) * 0.6;
        const lrfY = tubeStartY + (tubeEndY - tubeStartY) * 0.6 + 3.5 * zoom;
        ctx.fillStyle = "#2a2a32";
        ctx.fillRect(lrfX - 3 * zoom, lrfY - 1.5 * zoom, 6 * zoom, 3 * zoom);
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 0.5 * zoom;
        ctx.strokeRect(lrfX - 3 * zoom, lrfY - 1.5 * zoom, 6 * zoom, 3 * zoom);
        // Laser emitter
        const laserPulse = 0.3 + Math.sin(time * 4) * 0.2;
        ctx.fillStyle = `rgba(255, 0, 0, ${laserPulse})`;
        ctx.beginPath();
        ctx.arc(lrfX + 2.5 * zoom, lrfY, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
        if (laserPulse > 0.35) {
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = "#ff0000";
          ctx.beginPath();
          ctx.arc(lrfX + 2.5 * zoom, lrfY, 2.5 * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        // Digital readout
        const readoutGlow = 0.4 + Math.sin(time * 2) * 0.15;
        ctx.fillStyle = `rgba(0, 255, 100, ${readoutGlow})`;
        ctx.fillRect(lrfX - 2 * zoom, lrfY - 0.8 * zoom, 3 * zoom, 1.6 * zoom);
      }
    }
  }

  // ===== BARREL BORE GLOW (inner heat that intensifies toward the top) =====
  {
    const glowIntensity = level >= 3 ? 0.35 : level >= 2 ? 0.25 : 0.15;
    const fireBoost = timeSinceFire < 3000 ? (1 - timeSinceFire / 3000) * 0.5 : 0;
    const pulse = Math.sin(time * 1.5) * 0.05;
    const totalGlow = glowIntensity + fireBoost + pulse;

    // Glow on each tier's inner face (gradient from bottom faint to top bright)
    let glowCumH = 0;
    let glowCumRecoil = 0;
    for (let ti = 0; ti < 3; ti++) {
      const tier = tiers[ti];
      glowCumRecoil += tierRecoils[ti];
      const botFrac = glowCumH / totalH;
      const topFrac = (glowCumH + tier.h) / totalH;
      const botCenter = posAtFrac(botFrac, glowCumRecoil - tierRecoils[ti]);
      const topCenter = posAtFrac(topFrac, glowCumRecoil);
      const tierGlowTop = ((ti + 1) / 3) * totalGlow;

      if (tierGlowTop > 0.02) {
        const gcx = (botCenter.x + topCenter.x) * 0.5;
        const gcy = (botCenter.y + topCenter.y) * 0.5;
        const glowR = tier.r * 0.6;
        const grad = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, glowR);
        grad.addColorStop(0, `rgba(255, 140, 40, ${tierGlowTop * 0.4})`);
        grad.addColorStop(0.5, `rgba(255, 80, 10, ${tierGlowTop * 0.2})`);
        grad.addColorStop(1, `rgba(255, 40, 0, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(gcx, gcy, glowR, glowR * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      glowCumH += tier.h;
    }

    // Bright core glow at barrel mouth
    const mouthPt = posAtFrac(1.0, cumRecoil);
    const mouthR = tiers[2].r * 0.7;
    const mouthGlow = totalGlow * 1.2;
    if (mouthGlow > 0.05) {
      const mGrad = ctx.createRadialGradient(mouthPt.x, mouthPt.y, 0, mouthPt.x, mouthPt.y, mouthR);
      mGrad.addColorStop(0, `rgba(255, 180, 60, ${Math.min(mouthGlow * 0.6, 0.5)})`);
      mGrad.addColorStop(0.4, `rgba(255, 100, 20, ${Math.min(mouthGlow * 0.3, 0.3)})`);
      mGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.ellipse(mouthPt.x, mouthPt.y, mouthR, mouthR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== AMMO BELT / SHELL FEED (visible chain of shells going into barrel base) =====
  if (level >= 2 && cosR + 0.5 * sinR > -0.3) {
    const feedPt = posAtFrac(0.08, tierRecoils[0] * 0.2);
    const feedX = feedPt.x + cosR * tiers[0].r * 0.6;
    const feedY = feedPt.y + sinR * tiers[0].r * ISO_Y_RATIO * 0.6;
    const shellCount = level >= 3 ? 4 : 3;
    for (let si = 0; si < shellCount; si++) {
      const sx = feedX + cosR * si * 4 * zoom + si * 1 * zoom;
      const sy = feedY + sinR * si * 2 * zoom + si * 1.5 * zoom;
      // Shell casing
      ctx.fillStyle = level >= 3 ? "#c9a227" : "#8a7a50";
      ctx.beginPath();
      ctx.ellipse(sx, sy, 1.5 * zoom, 2.5 * zoom, rot + Math.PI * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.3 * zoom;
      ctx.stroke();
      // Shell tip
      ctx.fillStyle = level >= 3 ? "#4a4a52" : "#5a5a5a";
      ctx.beginPath();
      ctx.arc(sx - sinR * 1.5 * zoom, sy + cosR * 0.8 * zoom, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
    // Feed tray
    ctx.strokeStyle = level >= 3 ? "#5a5a62" : "#4a4a4a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(feedX - 1 * zoom, feedY + 2 * zoom);
    ctx.lineTo(feedX + cosR * shellCount * 4 * zoom + shellCount * 1 * zoom, feedY + sinR * shellCount * 2 * zoom + shellCount * 1.5 * zoom + 2 * zoom);
    ctx.stroke();
  }

  // ===== BARREL REINFORCING RINGS (extra hex bands between tiers) =====
  {
    const ringPositions = [0.35, 0.7];
    for (const ringFrac of ringPositions) {
      const ringRecoil = cumRecoil * ringFrac;
      const ringPt = posAtFrac(ringFrac, ringRecoil);
      const tierIdx = ringFrac < tiers[0].h / totalH ? 0 : ringFrac < (tiers[0].h + tiers[1].h) / totalH ? 1 : 2;
      const ringR = tiers[tierIdx].r * 1.04;
      const ringVerts = generateIsoHexVertices(isoOff, ringR, hexSides);
      const ringNormals = computeHexSideNormals(cosR, hexSides);
      const ringH = 1.5 * zoom;
      const ringBot: Pt = { x: ringPt.x, y: ringPt.y + ringH * 0.5 };
      const ringTop: Pt = { x: ringPt.x, y: ringPt.y - ringH * 0.5 };
      const ringColor = level >= 3 ? "#8a7a52" : level >= 2 ? "#606878" : "#5a5048";
      drawHexBand(ctx, ringVerts, ringNormals, ringBot, ringTop, 1.0,
        (n) => {
          const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
          const rc = parseInt(ringColor.slice(1, 3), 16);
          const gc = parseInt(ringColor.slice(3, 5), 16);
          const bc = parseInt(ringColor.slice(5, 7), 16);
          return `rgb(${Math.floor(rc * (0.6 + b * 0.4))},${Math.floor(gc * (0.6 + b * 0.4))},${Math.floor(bc * (0.6 + b * 0.4))})`;
        }, "rgba(0,0,0,0.12)", 0.3 * zoom, -0.7);
    }
  }

  // ===== L1: targeting stake planted in ground (front-facing) =====
  if (level === 1 && cosR + 0.5 * sinR > -0.3) {
    const stakeX = cosR * tiers[0].r * 1.6;
    const stakeY = sinR * tiers[0].r * ISO_Y_RATIO * 1.6 + 4 * zoom;
    ctx.strokeStyle = "#6a5a4a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(stakeX, stakeY + 2 * zoom);
    ctx.lineTo(stakeX, stakeY - 6 * zoom);
    ctx.stroke();
    // Flag
    ctx.fillStyle = "#cc4400";
    ctx.beginPath();
    ctx.moveTo(stakeX, stakeY - 6 * zoom);
    ctx.lineTo(stakeX + 3 * zoom, stakeY - 5 * zoom);
    ctx.lineTo(stakeX, stakeY - 4 * zoom);
    ctx.closePath();
    ctx.fill();
  }

  // ===== L2: instrument panel mounted on leg (side-facing) =====
  if (level === 2 && -sinR + 0.5 * cosR > -0.3) {
    const panelX = -sinR * tiers[0].r * 1.0;
    const panelY = cosR * tiers[0].r * ISO_Y_RATIO * 0.5 - totalH * 0.2;
    ctx.fillStyle = "#3a3a42";
    ctx.fillRect(panelX - 3 * zoom, panelY - 2 * zoom, 6 * zoom, 4 * zoom);
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(panelX - 3 * zoom, panelY - 2 * zoom, 6 * zoom, 4 * zoom);
    // LED indicators
    const colors = [
      "#00ff44",
      "#ffaa00",
      timeSinceFire < 1000 ? "#ff2200" : "#004400",
    ];
    for (let ci = 0; ci < 3; ci++) {
      ctx.fillStyle = colors[ci];
      ctx.beginPath();
      ctx.arc(
        panelX - 1.5 * zoom + ci * 1.5 * zoom,
        panelY,
        0.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Scaffolding (level 3+)
  if (level >= 3) {
    const scaffR = tiers[0].r * 0.9;
    ctx.strokeStyle = "#7a7a80";
    ctx.lineWidth = 1.2 * zoom;
    const scaffAngles = [
      rot * 0.1,
      rot * 0.1 + Math.PI * 0.6,
      rot * 0.1 + Math.PI * 1.2,
    ];
    for (let s = 0; s < 3; s++) {
      const sa = scaffAngles[s];
      if (Math.cos(sa) + 0.5 * Math.sin(sa) < -0.3) continue;
      const footX = Math.cos(sa) * scaffR;
      const footY = Math.sin(sa) * scaffR * ISO_Y_RATIO + 4 * zoom;
      const topPt = posAtFrac(0.4, tierRecoils[0]);
      // Vertical pole
      ctx.beginPath();
      ctx.moveTo(footX, footY);
      ctx.lineTo(topPt.x + footX * 0.2, topPt.y);
      ctx.stroke();
      // Horizontal platform beam
      const nextS = (s + 1) % 3;
      const nsa = scaffAngles[nextS];
      if (Math.sin(nsa) >= -0.3) {
        const nfx = Math.cos(nsa) * scaffR;
        const nfy = Math.sin(nsa) * scaffR * ISO_Y_RATIO + 4 * zoom;
        const beamY = (footY + topPt.y) * 0.5;
        ctx.strokeStyle = "#6a6a6e";
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo((footX + topPt.x + footX * 0.2) * 0.5, beamY);
        ctx.lineTo((nfx + topPt.x + nfx * 0.2) * 0.5, (nfy + topPt.y) * 0.5);
        ctx.stroke();
        ctx.strokeStyle = "#7a7a80";
        ctx.lineWidth = 1.2 * zoom;
      }
    }

    // L3: small power generator box (only when rear faces camera)
    if (-cosR - 0.5 * sinR > -0.3) {
      const genX = -cosR * tiers[0].r * 1.4;
      const genY = -sinR * tiers[0].r * ISO_Y_RATIO * 1.4 + 4 * zoom;
      drawIsometricPrism(
        ctx,
        genX,
        genY,
        5,
        4,
        5,
        { top: "#3a3a42", left: "#2a2a32", right: "#1a1a28" },
        zoom,
      );
      const pulse = 0.3 + Math.sin(time * 4) * 0.2;
      ctx.fillStyle = `rgba(0, 180, 255, ${pulse})`;
      ctx.beginPath();
      ctx.arc(genX, genY - 4 * zoom, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      // Power cable to barrel
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(genX, genY - 3 * zoom);
      ctx.quadraticCurveTo(
        genX + cosR * 5 * zoom,
        genY - 8 * zoom,
        0,
        -totalH * 0.5,
      );
      ctx.stroke();
    }
  }

  // ===== RECOIL HYDRAULIC CYLINDERS (mounted on carriage rails) =====
  {
    const perpX = -sinR;
    const perpY = cosR * ISO_Y_RATIO;
    const hCarrW = tiers[0].r * (level >= 3 ? 0.85 : level >= 2 ? 0.78 : 0.7);
    const cylDia = (level >= 3 ? 3.5 : level >= 2 ? 3 : 2.5) * zoom;
    const rodDia = (level >= 3 ? 1.8 : level >= 2 ? 1.5 : 1.2) * zoom;
    const hAccent = level >= 3 ? "#c9a227" : level >= 2 ? "#8a8a8a" : "#6a5a4a";

    for (const side of [-1, 1]) {
      const railOX = side * perpX * hCarrW * 0.7;
      const railOY = side * perpY * hCarrW * 0.7;
      const fixedPt = posAtFrac(0.05, tierRecoils[0] * 0.1);
      const cylStartX = fixedPt.x + railOX;
      const cylStartY = fixedPt.y + railOY + 1 * zoom;
      const rodPt = posAtFrac(0.35, tierRecoils[0] + tierRecoils[1] * 0.2);
      const rodEndX = rodPt.x + railOX;
      const rodEndY = rodPt.y + railOY + 1 * zoom;

      // Cylinder body
      ctx.strokeStyle = level >= 3 ? "#5a5a62" : "#4a4a52";
      ctx.lineWidth = cylDia;
      ctx.lineCap = "round";
      ctx.beginPath();
      const cylEndX = cylStartX + (rodEndX - cylStartX) * 0.55;
      const cylEndY = cylStartY + (rodEndY - cylStartY) * 0.55;
      ctx.moveTo(cylStartX, cylStartY);
      ctx.lineTo(cylEndX, cylEndY);
      ctx.stroke();
      // Highlight
      ctx.strokeStyle = "rgba(200,200,210,0.15)";
      ctx.lineWidth = cylDia * 0.3;
      ctx.beginPath();
      ctx.moveTo(cylStartX, cylStartY - cylDia * 0.15);
      ctx.lineTo(cylEndX, cylEndY - cylDia * 0.15);
      ctx.stroke();

      // Piston rod
      ctx.strokeStyle = level >= 3 ? "#c0c0c8" : "#a0a0a8";
      ctx.lineWidth = rodDia;
      ctx.beginPath();
      ctx.moveTo(cylEndX, cylEndY);
      ctx.lineTo(rodEndX, rodEndY);
      ctx.stroke();
      ctx.lineCap = "butt";

      // End caps
      ctx.fillStyle = level >= 3 ? "#6a6a72" : "#4a4a52";
      ctx.beginPath();
      ctx.arc(cylStartX, cylStartY, cylDia * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hAccent;
      ctx.beginPath();
      ctx.arc(rodEndX, rodEndY, 1.2 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== RECOIL RETURN SPRINGS (zig-zag coils parallel to hydraulics) =====
  if (level >= 2) {
    const sPerpX = -sinR;
    const sPerpY = cosR * ISO_Y_RATIO;
    const sCarrW = tiers[0].r * (level >= 3 ? 0.85 : level >= 2 ? 0.78 : 0.7);
    for (const side of [-1, 1]) {
      const springOX = side * sPerpX * sCarrW * 0.45;
      const springOY = side * sPerpY * sCarrW * 0.45;
      const sStartPt = posAtFrac(0.08, tierRecoils[0] * 0.15);
      const sEndPt = posAtFrac(0.3, tierRecoils[0] * 0.8);
      const coilCount = level >= 3 ? 8 : 6;
      ctx.strokeStyle = level >= 3 ? "#9a9aa0" : "#7a7a82";
      ctx.lineWidth = 1.2 * zoom;
      const coilW = 2 * zoom;
      for (let c = 1; c <= coilCount; c++) {
        const t = c / coilCount;
        const prevT = (c - 1) / coilCount;
        const cx = sStartPt.x + springOX + (sEndPt.x - sStartPt.x) * t;
        const cy = sStartPt.y + springOY + (sEndPt.y - sStartPt.y) * t;
        const prevCx = sStartPt.x + springOX + (sEndPt.x - sStartPt.x) * prevT;
        const prevCy = sStartPt.y + springOY + (sEndPt.y - sStartPt.y) * prevT;
        const wobble = (c % 2 === 0 ? 1 : -1) * coilW * 0.4;
        const prevWobble = ((c - 1) % 2 === 0 ? 1 : -1) * coilW * 0.4;
        ctx.beginPath();
        ctx.moveTo(prevCx + prevWobble, prevCy);
        ctx.lineTo(cx + wobble, cy);
        ctx.stroke();
      }
    }
  }

  // ===== CABLES & WIRES (camera-visible only, with gravity+recoil sag) =====
  {
    const wireCount = level >= 3 ? 3 : level >= 2 ? 2 : 1;
    const wireColors = ["#2a2a2a", "#3a2a1a", "#1a2a3a"];
    for (let w = 0; w < wireCount; w++) {
      const wireAngle = rot + Math.PI * 0.5 + w * Math.PI * 0.25;
      const wireVis = Math.cos(wireAngle) + 0.5 * Math.sin(wireAngle);
      if (wireVis < -0.3) continue;
      const startR = tiers[0].r * (0.6 + w * 0.1);
      const startX = Math.cos(wireAngle) * startR;
      const startY = Math.sin(wireAngle) * startR * ISO_Y_RATIO + 3 * zoom;
      const endFrac = 0.45 + w * 0.12;
      const endRecoil = cumRecoil * (0.35 + w * 0.15);
      const endPt = posAtFrac(endFrac, endRecoil);
      const sagX = (startX + endPt.x) * 0.5 + recoilBase * 0.15;
      const sagY = (startY + endPt.y) * 0.5 + 4 * zoom;
      ctx.strokeStyle = wireColors[w];
      ctx.lineWidth = (0.8 + w * 0.15) * zoom;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(sagX, sagY, endPt.x, endPt.y);
      ctx.stroke();
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      ctx.arc(startX, startY, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(endPt.x, endPt.y, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== STATUS LIGHTS (on barrel tiers, camera-visible only) =====
  {
    const lightCount = level >= 3 ? 3 : level >= 2 ? 2 : 1;
    for (let li = 0; li < lightCount; li++) {
      const lightFrac = 0.25 + li * 0.22;
      const lightRecoil = cumRecoil * (0.25 + li * 0.2);
      const lightPt = posAtFrac(lightFrac, lightRecoil);
      const lightAngle = rot + Math.PI * 0.55 + li * Math.PI * 0.35;
      const lightVis = Math.cos(lightAngle) + 0.5 * Math.sin(lightAngle);
      if (lightVis < -0.3) continue;
      const lightR = tiers[Math.min(li, 2)].r;
      const lx = lightPt.x + Math.cos(lightAngle) * lightR * 0.98;
      const ly = lightPt.y + Math.sin(lightAngle) * lightR * ISO_Y_RATIO * 0.98;

      const recoilFlash = timeSinceFire < 800;
      const lightOn = recoilFlash || Math.sin(time * 3 + li * 2.1) > 0.3;
      const color =
        li === 0
          ? recoilFlash
            ? "#ff2200"
            : "#00ff44"
          : li === 1
            ? recoilFlash
              ? "#ff6600"
              : "#ffaa00"
            : "#0088ff";

      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.arc(lx, ly, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = lightOn ? color : "rgba(40,40,40,0.6)";
      ctx.beginPath();
      ctx.arc(lx, ly, 1 * zoom, 0, Math.PI * 2);
      ctx.fill();
      if (lightOn) {
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(lx, ly, 4 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  // ===== BARREL COLLAR (hex ring at tier 0→1 junction, moves with recoil) =====
  {
    const collarFrac = tiers[0].h / totalH;
    const collarRecoil = tierRecoils[0];
    const collarPt = posAtFrac(collarFrac, collarRecoil);
    const collarR = (tiers[0].r + tiers[1].r) * 0.5;
    const collarVerts = generateIsoHexVertices(
      isoOff,
      collarR * 1.05,
      hexSides,
    );
    const collarNormals = computeHexSideNormals(cosR, hexSides);
    const collarBotPt: Pt = { x: collarPt.x, y: collarPt.y + 1.2 * zoom };
    const collarTopPt: Pt = { x: collarPt.x, y: collarPt.y - 1.2 * zoom };
    drawHexBand(
      ctx,
      collarVerts,
      collarNormals,
      collarBotPt,
      collarTopPt,
      1.0,
      (n) => {
        const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
        return level >= 3
          ? `rgb(${Math.floor(180 * (0.6 + b * 0.4))},${Math.floor(150 * (0.6 + b * 0.4))},${Math.floor(40 * (0.6 + b * 0.4))})`
          : `rgb(${Math.floor(90 + b * 30)},${Math.floor(90 + b * 30)},${Math.floor(100 + b * 22)})`;
      },
      "rgba(0,0,0,0.15)",
      0.4 * zoom,
      -0.7,
    );
    ctx.fillStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
    for (let ci = 0; ci < hexSides; ci++) {
      if (collarNormals[ci] < -0.7) continue;
      ctx.beginPath();
      ctx.arc(
        collarPt.x + collarVerts[ci].x,
        collarPt.y + collarVerts[ci].y,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // ===== FRONT CRADLE ARM (drawn late for proper layering on top of barrel) =====
  {
    const carrWF = tiers[0].r * (level >= 3 ? 1.15 : level >= 2 ? 1.08 : 1.0);
    const cradleThickF = (level >= 3 ? 10 : level >= 2 ? 9 : 7.5) * zoom;
    const cradleWF = carrWF * (level >= 3 ? 1.35 : level >= 2 ? 1.28 : 1.2);
    const metalDarkF = level >= 3 ? "#28242e" : level >= 2 ? "#262a32" : "#2c2c30";
    const metalMidF = level >= 3 ? "#48424e" : level >= 2 ? "#3e4450" : "#484850";
    const metalLightF = level >= 3 ? "#6a6270" : level >= 2 ? "#5a6270" : "#606068";
    const accentF = level >= 3 ? "#c9a227" : level >= 2 ? "#8a4428" : "#6a3a28";
    const totalRecoilF = tierRecoils[0] + tierRecoils[1] + tierRecoils[2];
    const frontSide = sinR > 0 ? -1 : 1;
    drawMortarCradleArm(ctx, {
      side: frontSide, level, zoom, sinR, cosR,
      perpX: -sinR, perpY: cosR * ISO_Y_RATIO,
      tiers, tierRecoils, totalRecoil: totalRecoilF, posAtFrac,
      cradleW: cradleWF, cradleThick: cradleThickF,
      metalDark: metalDarkF, metalMid: metalMidF, metalLight: metalLightF, accent: accentF,
      time, timeSinceFire,
    });
  }

  // ===== TOP RIM =====
  const topTier = tiers[2];
  const rimPt = posAtFrac(1.0, cumRecoil);
  const rimR = (topTier.r / zoom + (level >= 3 ? 2.5 : 2)) * zoom;
  const rimVerts = generateIsoHexVertices(isoOff, rimR, hexSides);
  const rimInnerVerts = generateIsoHexVertices(
    isoOff,
    topTier.r * 0.92,
    hexSides,
  );
  const rimNormals = computeHexSideNormals(cosR, hexSides);
  const rimBandH = (level >= 3 ? 3 : 2.5) * zoom;
  const rimBotPt: Pt = { x: rimPt.x, y: rimPt.y + rimBandH };
  const rimColor = level >= 3 ? "#c9a227" : level >= 2 ? "#6a7080" : "#585860";
  const rimSorted = sortSidesByDepth(rimNormals);
  for (const i of rimSorted) {
    const ni = (i + 1) % hexSides;
    const n = rimNormals[i];
    const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
    const bR = parseInt(rimColor.slice(1, 3), 16);
    const bG = parseInt(rimColor.slice(3, 5), 16);
    const bB = parseInt(rimColor.slice(5, 7), 16);
    ctx.fillStyle = `rgb(${Math.floor(bR * (0.6 + b * 0.4))},${Math.floor(bG * (0.6 + b * 0.4))},${Math.floor(bB * (0.6 + b * 0.4))})`;
    ctx.beginPath();
    ctx.moveTo(rimBotPt.x + rimVerts[i].x, rimBotPt.y + rimVerts[i].y);
    ctx.lineTo(rimBotPt.x + rimVerts[ni].x, rimBotPt.y + rimVerts[ni].y);
    ctx.lineTo(rimPt.x + rimVerts[ni].x, rimPt.y + rimVerts[ni].y);
    ctx.lineTo(rimPt.x + rimVerts[i].x, rimPt.y + rimVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }
  drawHexCap(
    ctx,
    rimPt,
    rimVerts,
    level >= 3 ? "#d4aa30" : level >= 2 ? "#727a8a" : "#64646a",
    "rgba(0,0,0,0.1)",
    0.6 * zoom,
  );
  // Inner bore (dark with gradient glow)
  {
    const boreGlowBase = level >= 3 ? 0.12 : level >= 2 ? 0.08 : 0.04;
    const boreFireGlow = timeSinceFire < 3000 ? (1 - timeSinceFire / 3000) * 0.5 : 0;
    const borePulse = Math.sin(time * 1.5) * 0.03;
    const boreTotal = boreGlowBase + boreFireGlow + borePulse;

    // Outer bore ring (charred dark)
    drawHexCap(ctx, rimPt, rimInnerVerts, "#0a0804", "rgba(0,0,0,0.3)", 0.8 * zoom);

    // Inner heat glow rings (concentric, getting brighter toward center)
    if (boreTotal > 0.02) {
      const glowLayers = 4;
      for (let gl = glowLayers; gl >= 1; gl--) {
        const scaleFactor = gl / glowLayers;
        const layerAlpha = boreTotal * (1 - scaleFactor + 0.2) * 0.6;
        const r = Math.floor(255);
        const g = Math.floor(60 + (1 - scaleFactor) * 140);
        const b = Math.floor(10 + (1 - scaleFactor) * 30);
        drawHexCap(ctx, rimPt, scaleVerts(rimInnerVerts, scaleFactor * 0.85),
          `rgba(${r}, ${g}, ${b}, ${Math.min(layerAlpha, 0.45)})`);
      }
    }

    // Hot core after firing
    if (timeSinceFire < 2500) {
      const coreT = timeSinceFire / 2500;
      const coreAlpha = (1 - coreT) * 0.55;
      const coreR = tiers[2].r * 0.5 * (1 + coreT * 0.3);
      const coreGrad = ctx.createRadialGradient(rimPt.x, rimPt.y, 0, rimPt.x, rimPt.y, coreR);
      coreGrad.addColorStop(0, `rgba(255, 240, 140, ${coreAlpha})`);
      coreGrad.addColorStop(0.3, `rgba(255, 160, 40, ${coreAlpha * 0.6})`);
      coreGrad.addColorStop(0.7, `rgba(255, 60, 0, ${coreAlpha * 0.2})`);
      coreGrad.addColorStop(1, "rgba(200, 30, 0, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.ellipse(rimPt.x, rimPt.y, coreR, coreR * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== MUZZLE FLASH =====
  if (timeSinceFire < 400) {
    const fT = timeSinceFire / 400;
    const fA = (1 - fT) * 0.85;
    const fSize = (12 + level * 4) * zoom * (1 + fT * 0.4);
    const fGrad = ctx.createRadialGradient(
      rimPt.x,
      rimPt.y - fSize * 0.3,
      0,
      rimPt.x,
      rimPt.y - fSize * 0.3,
      fSize,
    );
    fGrad.addColorStop(0, `rgba(255, 240, 140, ${fA})`);
    fGrad.addColorStop(0.3, `rgba(255, 180, 60, ${fA * 0.7})`);
    fGrad.addColorStop(0.6, `rgba(255, 80, 10, ${fA * 0.3})`);
    fGrad.addColorStop(1, "rgba(255, 40, 0, 0)");
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.arc(rimPt.x, rimPt.y - fSize * 0.3, fSize, 0, Math.PI * 2);
    ctx.fill();
    for (let p = 0; p < 4; p++) {
      const pA = fT * 3 + p * 1.57;
      const pDist = fSize * (0.3 + fT * 0.5);
      ctx.fillStyle = `rgba(100, 90, 80, ${Math.max(0, 1 - fT * 1.5) * 0.35})`;
      ctx.beginPath();
      ctx.arc(
        rimPt.x + Math.cos(pA) * pDist * 0.5,
        rimPt.y - fSize * 0.3 + Math.sin(pA) * pDist * 0.3 - fT * 10 * zoom,
        (2.5 + fT * 4) * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.restore();
}

// Ember Foundry (4B): aimed revolver triple barrel with rigid-body tilt
export function renderMortarEmberTurret(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  recoilBase: number,
  recoilMid: number,
  recoilTip: number,
  timeSinceFire: number,
) {
  const rot = tower.rotation || -Math.PI / 4;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);
  const hexSides = 8;
  const isoOff: IsoOffFn = (dx, dy) => ({ x: dx, y: dy * ISO_Y_RATIO });
  const totalRecoil = (recoilBase + recoilMid + recoilTip) * 0.25;

  ctx.save();
  ctx.translate(screenPos.x, topY);

  // Rigid-body tilt toward target
  const fireTiltBoost =
    timeSinceFire < 600 ? (1 - timeSinceFire / 600) * 0.1 : 0;
  const tiltStr = 0.2 + fireTiltBoost;
  const maxTiltX = cosR * tiltStr * 10 * zoom;
  const maxTiltY = sinR * tiltStr * ISO_Y_RATIO * 10 * zoom;

  // === HEX-PRISM ROTATING PLATFORM ===
  const platR = 24 * zoom;
  const platH = 5 * zoom;
  const ePlatVerts = generateIsoHexVertices(isoOff, platR, hexSides);
  const ePlatNormals = computeHexSideNormals(0, hexSides);
  const ePlatSorted = sortSidesByDepth(ePlatNormals);
  const ePlatBot: Pt = { x: 0, y: 3 * zoom };
  const ePlatTop: Pt = { x: 0, y: 3 * zoom - platH };

  // Molten underglow beneath platform
  const underGlow = ctx.createRadialGradient(0, ePlatBot.y + 2 * zoom, 0, 0, ePlatBot.y + 2 * zoom, platR * 0.9);
  underGlow.addColorStop(0, `rgba(255,100,20,${0.12 + Math.sin(time * 2) * 0.04})`);
  underGlow.addColorStop(1, "rgba(255,40,0,0)");
  ctx.fillStyle = underGlow;
  ctx.beginPath();
  ctx.ellipse(0, ePlatBot.y + 2 * zoom, platR * 0.9, platR * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  for (const i of ePlatSorted) {
    const ni = (i + 1) % hexSides;
    const n = ePlatNormals[i];
    const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
    const cr = Math.floor(58 + bright * 50);
    const cg = Math.floor(28 + bright * 22);
    const cb = Math.floor(12 + bright * 10);
    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
    ctx.beginPath();
    ctx.moveTo(ePlatBot.x + ePlatVerts[i].x, ePlatBot.y + ePlatVerts[i].y);
    ctx.lineTo(ePlatBot.x + ePlatVerts[ni].x, ePlatBot.y + ePlatVerts[ni].y);
    ctx.lineTo(ePlatTop.x + ePlatVerts[ni].x, ePlatTop.y + ePlatVerts[ni].y);
    ctx.lineTo(ePlatTop.x + ePlatVerts[i].x, ePlatTop.y + ePlatVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();

    if (n > -0.5) {
      // Heat glow cracks on platform face
      const cx = (ePlatBot.x + ePlatTop.x) * 0.5 + (ePlatVerts[i].x + ePlatVerts[ni].x) * 0.5;
      const cy = (ePlatBot.y + ePlatTop.y) * 0.5 + (ePlatVerts[i].y + ePlatVerts[ni].y) * 0.5;
      const crackAlpha = 0.08 + Math.sin(time * 2.5 + i * 1.1) * 0.04;
      ctx.strokeStyle = `rgba(255,80,10,${crackAlpha})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(cx - 2 * zoom, cy + 1 * zoom);
      ctx.lineTo(cx + 1 * zoom, cy - 0.5 * zoom);
      ctx.lineTo(cx + 3 * zoom, cy + 0.5 * zoom);
      ctx.stroke();

      // Rivet pairs
      ctx.fillStyle = `rgba(180,120,60,${0.4 + bright * 0.3})`;
      const mx = (ePlatVerts[i].x + ePlatVerts[ni].x) * 0.5;
      const my = (ePlatVerts[i].y + ePlatVerts[ni].y) * 0.5;
      for (const vf of [0.3, 0.7]) {
        const rx = ePlatBot.x * (1 - vf) + ePlatTop.x * vf + mx;
        const ry = ePlatBot.y * (1 - vf) + ePlatTop.y * vf + my;
        ctx.beginPath();
        ctx.arc(rx, ry, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  drawHexCap(
    ctx,
    ePlatTop,
    ePlatVerts,
    "#7a4a28",
    "rgba(0,0,0,0.12)",
    0.5 * zoom,
  );

  // Heat glow on cap surface
  const capGlow = ctx.createRadialGradient(0, ePlatTop.y, 0, 0, ePlatTop.y, platR * 0.6);
  capGlow.addColorStop(0, `rgba(255,80,0,${0.06 + Math.sin(time * 3) * 0.03})`);
  capGlow.addColorStop(1, "rgba(255,40,0,0)");
  ctx.fillStyle = capGlow;
  ctx.beginPath();
  ctx.ellipse(0, ePlatTop.y, platR * 0.6, platR * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tread plate texture on cap
  ctx.strokeStyle = "rgba(100,60,30,0.12)";
  ctx.lineWidth = 0.4 * zoom;
  for (let tp = 0; tp < 6; tp++) {
    const tpA = tp * Math.PI / 3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(tpA) * platR * 0.2, ePlatTop.y + Math.sin(tpA) * platR * 0.1);
    ctx.lineTo(Math.cos(tpA) * platR * 0.7, ePlatTop.y + Math.sin(tpA) * platR * 0.35);
    ctx.stroke();
  }

  // Hex gear ring on platform
  {
    const gR = platR * 0.92;
    const gVerts = generateIsoHexVertices(isoOff, gR, hexSides);
    const gNormals = computeHexSideNormals(0, hexSides);
    drawHexBand(
      ctx,
      gVerts,
      gNormals,
      { x: 0, y: ePlatTop.y + 2 * zoom },
      ePlatTop,
      1.0,
      (n) => {
        const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
        return `rgb(${Math.floor(110 * (0.6 + b * 0.4))},${Math.floor(70 * (0.6 + b * 0.4))},${Math.floor(35 * (0.6 + b * 0.4))})`;
      },
      "rgba(0,0,0,0.15)",
      0.5 * zoom,
      -0.3,
    );
    const gearTeeth = 20;
    for (let g = 0; g < gearTeeth; g++) {
      const ga = (g / gearTeeth) * Math.PI * 2 + time * 0.3;
      const toothR = gR + 1.5 * zoom;
      ctx.fillStyle = "#8a6040";
      ctx.beginPath();
      ctx.arc(
        Math.cos(ga) * toothR,
        Math.sin(ga) * toothR * ISO_Y_RATIO + ePlatTop.y * 0.1,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Anchor bolts on platform vertices
  for (let i = 0; i < hexSides; i++) {
    if (ePlatNormals[i] < -0.7 && ePlatNormals[(i + hexSides - 1) % hexSides] < -0.7) continue;
    ctx.fillStyle = "#4a3020";
    ctx.beginPath();
    ctx.arc(ePlatTop.x + ePlatVerts[i].x, ePlatTop.y + ePlatVerts[i].y, 1.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a6040";
    ctx.beginPath();
    ctx.arc(ePlatTop.x + ePlatVerts[i].x, ePlatTop.y + ePlatVerts[i].y, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Support struts (thicker, structural)
  for (let i = 0; i < hexSides; i++) {
    if (ePlatNormals[i] < -0.7) continue;
    const ni = (i + 1) % hexSides;
    const mx = (ePlatVerts[i].x + ePlatVerts[ni].x) * 0.5;
    const my = (ePlatVerts[i].y + ePlatVerts[ni].y) * 0.5;
    ctx.strokeStyle = "#5a3a22";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ePlatTop.x + mx, ePlatTop.y + my);
    ctx.lineTo(ePlatBot.x + mx * 1.18, ePlatBot.y + my * 1.18 + 2 * zoom);
    ctx.stroke();
    // Cross-brace
    if (i % 2 === 0) {
      ctx.strokeStyle = "#4a2a18";
      ctx.lineWidth = 1 * zoom;
      const nextNi = (ni + 1) % hexSides;
      const mx2 = (ePlatVerts[ni].x + ePlatVerts[nextNi].x) * 0.5;
      const my2 = (ePlatVerts[ni].y + ePlatVerts[nextNi].y) * 0.5;
      ctx.beginPath();
      ctx.moveTo(ePlatBot.x + mx * 1.1, ePlatBot.y + my * 1.1 + 1 * zoom);
      ctx.lineTo(ePlatTop.x + mx2, ePlatTop.y + my2);
      ctx.stroke();
    }
  }
  ctx.lineCap = "butt";

  // Aim indicator line (fiery)
  ctx.strokeStyle = `rgba(255,80,0,${0.25 + Math.sin(time * 4) * 0.1})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cosR * platR * 0.3, sinR * platR * ISO_Y_RATIO * 0.3);
  ctx.lineTo(cosR * platR * 0.9, sinR * platR * ISO_Y_RATIO * 0.9);
  ctx.stroke();
  // Arrow tip
  const aimTipX = cosR * platR * 0.9;
  const aimTipY = sinR * platR * ISO_Y_RATIO * 0.9;
  ctx.fillStyle = `rgba(255,80,0,${0.3 + Math.sin(time * 4) * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(aimTipX + cosR * 3 * zoom, aimTipY + sinR * 1.5 * zoom);
  ctx.lineTo(aimTipX - sinR * 2 * zoom, aimTipY + cosR * 1 * zoom);
  ctx.lineTo(aimTipX + sinR * 2 * zoom, aimTipY - cosR * 1 * zoom);
  ctx.closePath();
  ctx.fill();

  // === QUADPOD FRAME ===
  {
    const legAngles = [
      Math.PI * 0.15,
      Math.PI * 0.85,
      -Math.PI * 0.15,
      -Math.PI * 0.85,
    ];
    const footR = platR * 0.85;
    const topAttachX = maxTiltX * 0.5;
    const topAttachY = -8 * zoom + maxTiltY * 0.5;
    for (let li = 0; li < 4; li++) {
      const la = legAngles[li];
      const fx = Math.cos(la) * footR;
      const fy = Math.sin(la) * footR * ISO_Y_RATIO + 2 * zoom;
      ctx.strokeStyle = "#5a4a38";
      ctx.lineWidth = 3.5 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(topAttachX + fx * 0.15, topAttachY);
      ctx.stroke();
      ctx.fillStyle = "#4a3a28";
      ctx.beginPath();
      ctx.ellipse(fx, fy, 2.5 * zoom, 1.3 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.lineCap = "butt";
    ctx.strokeStyle = "#5a4a38";
    ctx.lineWidth = 1.5 * zoom;
    for (let li = 0; li < 2; li++) {
      const x1 = Math.cos(legAngles[li]) * footR * 0.5;
      const y1 = Math.sin(legAngles[li]) * footR * ISO_Y_RATIO * 0.5;
      const x2 = Math.cos(legAngles[li + 2]) * footR * 0.5;
      const y2 = Math.sin(legAngles[li + 2]) * footR * ISO_Y_RATIO * 0.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

  // === REVOLVER MECHANISM ===
  const attackSpeed = 2500;
  const barrelCount = 3;
  const shotInterval = attackSpeed / barrelCount;
  const cyclePos = timeSinceFire % attackSpeed;
  const activeBarrel = Math.floor(cyclePos / shotInterval);
  const shotProgress = (cyclePos % shotInterval) / shotInterval;
  const smoothAngle = (timeSinceFire / attackSpeed) * Math.PI * 2;

  // Central spindle (tilted) - proper isometric cylinder
  const spindleBase: Pt = { x: 0, y: -2 * zoom };
  const spindleTop: Pt = { x: maxTiltX * 0.8, y: -14 * zoom + maxTiltY * 0.8 };
  const spindleR = 4.5 * zoom;
  const spindleMid: Pt = {
    x: (spindleBase.x + spindleTop.x) * 0.5,
    y: (spindleBase.y + spindleTop.y) * 0.5,
  };

  // Base flange (wide disc)
  ctx.fillStyle = "#3a2818";
  ctx.beginPath();
  ctx.ellipse(spindleBase.x, spindleBase.y, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Flange ring detail
  ctx.strokeStyle = "#6a5040";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.ellipse(spindleBase.x, spindleBase.y, 6.5 * zoom, 3.2 * zoom, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Flange bolts
  ctx.fillStyle = "#8a6a48";
  for (let fb = 0; fb < 6; fb++) {
    const fba = fb * Math.PI / 3;
    ctx.beginPath();
    ctx.arc(Math.cos(fba) * 7 * zoom, spindleBase.y + Math.sin(fba) * 3.5 * zoom, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Spindle body (drawn as shaded cylinder - left dark, right light)
  const spDx = spindleTop.x - spindleBase.x;
  const spDy = spindleTop.y - spindleBase.y;
  const spLen = Math.hypot(spDx, spDy);
  const spNx = -spDy / spLen;
  const spNy = spDx / spLen;
  // Dark side (left)
  ctx.fillStyle = "#2a1a0e";
  ctx.beginPath();
  ctx.moveTo(spindleBase.x - spNx * spindleR, spindleBase.y - spNy * spindleR);
  ctx.lineTo(spindleBase.x, spindleBase.y);
  ctx.lineTo(spindleTop.x, spindleTop.y);
  ctx.lineTo(spindleTop.x - spNx * spindleR, spindleTop.y - spNy * spindleR);
  ctx.closePath();
  ctx.fill();
  // Light side (right)
  ctx.fillStyle = "#5a4030";
  ctx.beginPath();
  ctx.moveTo(spindleBase.x, spindleBase.y);
  ctx.lineTo(spindleBase.x + spNx * spindleR, spindleBase.y + spNy * spindleR);
  ctx.lineTo(spindleTop.x + spNx * spindleR, spindleTop.y + spNy * spindleR);
  ctx.lineTo(spindleTop.x, spindleTop.y);
  ctx.closePath();
  ctx.fill();
  // Center highlight
  ctx.strokeStyle = "rgba(200,150,80,0.12)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(spindleBase.x + spNx * spindleR * 0.3, spindleBase.y + spNy * spindleR * 0.3);
  ctx.lineTo(spindleTop.x + spNx * spindleR * 0.3, spindleTop.y + spNy * spindleR * 0.3);
  ctx.stroke();
  // Edges
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(spindleBase.x - spNx * spindleR, spindleBase.y - spNy * spindleR);
  ctx.lineTo(spindleTop.x - spNx * spindleR, spindleTop.y - spNy * spindleR);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(spindleBase.x + spNx * spindleR, spindleBase.y + spNy * spindleR);
  ctx.lineTo(spindleTop.x + spNx * spindleR, spindleTop.y + spNy * spindleR);
  ctx.stroke();

  // Spindle bearing rings (3 bands)
  for (const bf of [0.2, 0.5, 0.8]) {
    const bx = spindleBase.x + spDx * bf;
    const by = spindleBase.y + spDy * bf;
    ctx.strokeStyle = "#8a6a48";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bx - spNx * spindleR * 1.1, by - spNy * spindleR * 1.1);
    ctx.lineTo(bx + spNx * spindleR * 1.1, by + spNy * spindleR * 1.1);
    ctx.stroke();
  }

  // Top cap
  ctx.fillStyle = "#5a4030";
  ctx.beginPath();
  ctx.ellipse(spindleTop.x, spindleTop.y, spindleR * 1.3, spindleR * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6a5040";
  ctx.beginPath();
  ctx.ellipse(spindleTop.x, spindleTop.y, spindleR * 0.7, spindleR * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ratchet gear (at base)
  const ratchetR = 10 * zoom;
  ctx.strokeStyle = "#7a5a3a";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(spindleBase.x, spindleBase.y, ratchetR, ratchetR * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  const ratchetTeeth = 16;
  for (let t = 0; t < ratchetTeeth; t++) {
    const ta = (t / ratchetTeeth) * Math.PI * 2 + smoothAngle;
    const toothInner = ratchetR * 0.9;
    const toothOuter = ratchetR * 1.12;
    ctx.fillStyle = "#8a6a48";
    ctx.beginPath();
    ctx.moveTo(Math.cos(ta) * toothInner, spindleBase.y + Math.sin(ta) * toothInner * 0.5);
    ctx.lineTo(Math.cos(ta + 0.1) * toothOuter, spindleBase.y + Math.sin(ta + 0.1) * toothOuter * 0.5);
    ctx.lineTo(Math.cos(ta + 0.2) * toothInner, spindleBase.y + Math.sin(ta + 0.2) * toothInner * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Furnace core glow (much more dramatic)
  const furnPulse = 0.55 + Math.sin(time * 3) * 0.3;
  const furnCx = spindleMid.x;
  const furnCy = spindleMid.y;
  const furnGrad = ctx.createRadialGradient(furnCx, furnCy, 0, furnCx, furnCy, 16 * zoom);
  furnGrad.addColorStop(0, `rgba(255, 180, 40, ${furnPulse * 0.5})`);
  furnGrad.addColorStop(0.3, `rgba(255, 100, 0, ${furnPulse * 0.35})`);
  furnGrad.addColorStop(0.6, `rgba(255, 50, 0, ${furnPulse * 0.15})`);
  furnGrad.addColorStop(1, "rgba(200, 30, 0, 0)");
  ctx.fillStyle = furnGrad;
  ctx.beginPath();
  ctx.ellipse(furnCx, furnCy, 16 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  // Propellant feed pipes (thicker, with connectors)
  for (let p = 0; p < 3; p++) {
    const pa = smoothAngle + p * ((Math.PI * 2) / 3);
    const px = spindleBase.x + Math.cos(pa) * 7 * zoom;
    const py = spindleBase.y + Math.sin(pa) * 3.5 * zoom;
    ctx.strokeStyle = "#5a3a22";
    ctx.lineWidth = 2 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(spindleBase.x + Math.cos(pa) * spindleR, spindleBase.y + Math.sin(pa) * spindleR * 0.5);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.lineCap = "butt";
    // Connector fitting
    ctx.fillStyle = "#8a5a30";
    ctx.beginPath();
    ctx.arc(px, py, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Heat glow at pipe junction
    ctx.fillStyle = `rgba(255,80,0,${0.15 + Math.sin(time * 3 + p * 2) * 0.08})`;
    ctx.beginPath();
    ctx.arc(px, py, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === THREE BARRELS (revolving, tilted toward target) ===
  const barrelSpread = 14 * zoom;
  const barrelTiers = [
    { r: 8 * zoom, h: 6.5 * zoom, dark: "#3a1a08", light: "#8a5a30" },
    { r: 6.5 * zoom, h: 6 * zoom, dark: "#4a2818", light: "#9a6a40" },
  ];
  const barrelTotalH = barrelTiers[0].h + barrelTiers[1].h;

  const barrelAngles = [0, 1, 2].map(
    (i) => smoothAngle + i * ((Math.PI * 2) / 3),
  );
  const barrelOrder = [0, 1, 2].sort(
    (a, b) => Math.sin(barrelAngles[a]) - Math.sin(barrelAngles[b]),
  );

  for (const bi of barrelOrder) {
    const bAngle = smoothAngle + bi * ((Math.PI * 2) / 3);
    // Barrel center orbits the spindle (tilted)
    const orbitCx = (spindleBase.x + spindleTop.x) * 0.5;
    const orbitCy = (spindleBase.y + spindleTop.y) * 0.5;
    const bx = orbitCx + Math.cos(bAngle) * barrelSpread;
    const by = orbitCy + Math.sin(bAngle) * barrelSpread * ISO_Y_RATIO;

    // Support arm (thicker, structural with joint)
    const armMidX = (spindleTop.x + bx) * 0.5;
    const armMidY = (spindleTop.y + by - barrelTotalH * 0.5) * 0.5 + 1 * zoom;
    ctx.strokeStyle = "#4a3220";
    ctx.lineWidth = 4 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(spindleTop.x, spindleTop.y);
    ctx.lineTo(armMidX, armMidY);
    ctx.lineTo(bx, by - barrelTotalH * 0.5);
    ctx.stroke();
    // Arm highlight
    ctx.strokeStyle = "#6a4a30";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(spindleTop.x, spindleTop.y - 1 * zoom);
    ctx.lineTo(armMidX, armMidY - 1 * zoom);
    ctx.lineTo(bx, by - barrelTotalH * 0.5 - 1 * zoom);
    ctx.stroke();
    ctx.lineCap = "butt";
    // Arm joint
    ctx.fillStyle = "#5a3a22";
    ctx.beginPath();
    ctx.arc(armMidX, armMidY, 2.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a6a48";
    ctx.beginPath();
    ctx.arc(armMidX, armMidY, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Barrel mount pin
    ctx.fillStyle = "#4a2a18";
    ctx.beginPath();
    ctx.arc(bx, by - barrelTotalH * 0.5, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#8a6a48";
    ctx.beginPath();
    ctx.arc(bx, by - barrelTotalH * 0.5, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();

    const isActiveBarrel = bi === activeBarrel;
    const barrelRecoil =
      isActiveBarrel && shotProgress < 0.3
        ? (1 - shotProgress / 0.3) * totalRecoil
        : 0;

    // Per-barrel rigid-body tilt (same direction as main tilt)
    const bMaxTiltX = maxTiltX * 0.4;
    const bMaxTiltY = maxTiltY * 0.4;

    let bCumH = 0;
    for (let ti = 0; ti < 2; ti++) {
      const tier = barrelTiers[ti];
      const botFrac = bCumH / barrelTotalH;
      const topFrac = (bCumH + tier.h) / barrelTotalH;

      const botC: Pt = {
        x: bx + botFrac * bMaxTiltX,
        y: by - bCumH + botFrac * bMaxTiltY + barrelRecoil,
      };
      const topC: Pt = {
        x: bx + topFrac * bMaxTiltX,
        y: by - (bCumH + tier.h) + topFrac * bMaxTiltY + barrelRecoil,
      };

      const hexVerts = generateIsoHexVertices(isoOff, tier.r, hexSides);
      const sideNormals = computeHexSideNormals(cosR, hexSides);
      const sorted = sortSidesByDepth(sideNormals);

      for (const i of sorted) {
        const ni = (i + 1) % hexSides;
        const n = sideNormals[i];
        const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
        const dr = parseInt(tier.dark.slice(1, 3), 16);
        const dg = parseInt(tier.dark.slice(3, 5), 16);
        const db = parseInt(tier.dark.slice(5, 7), 16);
        const lr = parseInt(tier.light.slice(1, 3), 16);
        const lg = parseInt(tier.light.slice(3, 5), 16);
        const lb = parseInt(tier.light.slice(5, 7), 16);
        const fR = Math.floor(dr + (lr - dr) * bright);
        const fG = Math.floor(dg + (lg - dg) * bright);
        const fB = Math.floor(db + (lb - db) * bright);
        ctx.fillStyle = `rgb(${fR},${fG},${fB})`;
        ctx.beginPath();
        ctx.moveTo(botC.x + hexVerts[i].x, botC.y + hexVerts[i].y);
        ctx.lineTo(botC.x + hexVerts[ni].x, botC.y + hexVerts[ni].y);
        ctx.lineTo(topC.x + hexVerts[ni].x, topC.y + hexVerts[ni].y);
        ctx.lineTo(topC.x + hexVerts[i].x, topC.y + hexVerts[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.stroke();

        if (n > -0.5) {
          // Heat scorch marks (subtle orange gradient on barrel faces)
          const heatAlpha = 0.06 + Math.sin(time * 2 + bi * 2 + i * 0.5) * 0.03;
          const faceCx = (botC.x + topC.x) * 0.5 + (hexVerts[i].x + hexVerts[ni].x) * 0.5;
          const faceCy = (botC.y + topC.y) * 0.5 + (hexVerts[i].y + hexVerts[ni].y) * 0.5;
          ctx.fillStyle = `rgba(255,80,0,${heatAlpha})`;
          ctx.beginPath();
          ctx.arc(faceCx, faceCy, tier.r * 0.5, 0, Math.PI * 2);
          ctx.fill();

          // Rivets on each face
          ctx.fillStyle = `rgba(160,100,50,${0.4 + bright * 0.3})`;
          const mx = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
          const my = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
          for (const vf of [0.3, 0.7]) {
            const rx = botC.x * (1 - vf) + topC.x * vf + mx;
            const ry = botC.y * (1 - vf) + topC.y * vf + my;
            ctx.beginPath();
            ctx.arc(rx, ry, 0.6 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      drawHexCap(ctx, topC, hexVerts, tier.light, "rgba(0,0,0,0.1)", 0.5 * zoom);

      // Metal band with heat tint
      const bandBot: Pt = { x: topC.x, y: topC.y + 1.8 * zoom };
      drawHexBand(
        ctx,
        hexVerts,
        sideNormals,
        bandBot,
        topC,
        1.08,
        (n) => {
          const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
          return `rgb(${Math.floor(160 * (0.6 + b * 0.4))},${Math.floor(100 * (0.6 + b * 0.4))},${Math.floor(45 * (0.6 + b * 0.4))})`;
        },
        "rgba(0,0,0,0.18)",
        0.5 * zoom,
        -0.3,
      );
      bCumH += tier.h;
    }

    // Rim + bore (enhanced)
    const rimR = barrelTiers[1].r * 1.2;
    const rimVerts = generateIsoHexVertices(isoOff, rimR, hexSides);
    const innerVerts = generateIsoHexVertices(isoOff, barrelTiers[1].r * 0.65, hexSides);
    const rimC: Pt = {
      x: bx + bMaxTiltX,
      y: by - barrelTotalH + bMaxTiltY + barrelRecoil,
    };

    // Rim band (visible depth)
    const rimBandH = 1.5 * zoom;
    const rimBandBot: Pt = { x: rimC.x, y: rimC.y + rimBandH };
    const rimNorms = computeHexSideNormals(cosR, hexSides);
    const rimSort = sortSidesByDepth(rimNorms);
    for (const ri of rimSort) {
      const rni = (ri + 1) % hexSides;
      const rn = rimNorms[ri];
      const rb = Math.max(0, Math.min(1, 0.4 + (rn + 1) * 0.3));
      ctx.fillStyle = `rgb(${Math.floor(180 * (0.6 + rb * 0.4))},${Math.floor(130 * (0.6 + rb * 0.4))},${Math.floor(30 * (0.6 + rb * 0.4))})`;
      ctx.beginPath();
      ctx.moveTo(rimBandBot.x + rimVerts[ri].x, rimBandBot.y + rimVerts[ri].y);
      ctx.lineTo(rimBandBot.x + rimVerts[rni].x, rimBandBot.y + rimVerts[rni].y);
      ctx.lineTo(rimC.x + rimVerts[rni].x, rimC.y + rimVerts[rni].y);
      ctx.lineTo(rimC.x + rimVerts[ri].x, rimC.y + rimVerts[ri].y);
      ctx.closePath();
      ctx.fill();
    }

    drawHexCap(ctx, rimC, rimVerts, "#d4aa30", "rgba(0,0,0,0.15)", 0.6 * zoom);
    drawHexCap(ctx, rimC, innerVerts, "#0a0804", "rgba(0,0,0,0.4)", 0.6 * zoom);

    // Bore glow (concentric heat rings)
    const mPulse = 0.45 + Math.sin(time * 3 + bi * 2.1) * 0.3;
    for (let gl = 3; gl >= 1; gl--) {
      const sf = gl / 3;
      const alpha = mPulse * (1 - sf + 0.3) * 0.5;
      drawHexCap(ctx, rimC, scaleVerts(innerVerts, sf * 0.8),
        `rgba(255, ${60 + (1 - sf) * 100}, ${(1 - sf) * 20}, ${Math.min(alpha, 0.5)})`);
    }

    if (isActiveBarrel && shotProgress < 0.2) {
      const fA = (1 - shotProgress / 0.2) * 0.8;
      const fSize = 12 * zoom;
      const fGrad = ctx.createRadialGradient(rimC.x, rimC.y - 4 * zoom, 0, rimC.x, rimC.y - 4 * zoom, fSize);
      fGrad.addColorStop(0, `rgba(255, 240, 120, ${fA})`);
      fGrad.addColorStop(0.3, `rgba(255, 140, 20, ${fA * 0.6})`);
      fGrad.addColorStop(0.6, `rgba(255, 60, 0, ${fA * 0.25})`);
      fGrad.addColorStop(1, "rgba(200, 30, 0, 0)");
      ctx.fillStyle = fGrad;
      ctx.beginPath();
      ctx.arc(rimC.x, rimC.y - 4 * zoom, fSize, 0, Math.PI * 2);
      ctx.fill();
      // Smoke puffs
      for (let sp = 0; sp < 3; sp++) {
        const spA = shotProgress * 5 + sp * 2.1;
        const spDist = fSize * (0.3 + shotProgress * 0.6);
        ctx.fillStyle = `rgba(80,60,40,${Math.max(0, fA * 0.3 - sp * 0.08)})`;
        ctx.beginPath();
        ctx.arc(
          rimC.x + Math.cos(spA) * spDist * 0.5,
          rimC.y - 4 * zoom - shotProgress * 8 * zoom + Math.sin(spA) * spDist * 0.3,
          (2 + shotProgress * 3) * zoom, 0, Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  // === HEAT SHIELDS (between barrels and platform) ===
  {
    for (let hs = 0; hs < 3; hs++) {
      const hsA = smoothAngle + hs * ((Math.PI * 2) / 3) + Math.PI / 3;
      const hsx = Math.cos(hsA) * barrelSpread * 0.6;
      const hsy = Math.sin(hsA) * barrelSpread * ISO_Y_RATIO * 0.6 - 4 * zoom;
      if (Math.sin(hsA) > 0.5) continue;
      ctx.fillStyle = "#3a2218";
      ctx.beginPath();
      ctx.moveTo(hsx - 3 * zoom, hsy);
      ctx.lineTo(hsx + 3 * zoom, hsy);
      ctx.lineTo(hsx + 2 * zoom, hsy - 5 * zoom);
      ctx.lineTo(hsx - 2 * zoom, hsy - 5 * zoom);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#5a3a28";
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();
    }
  }

  // === FUEL LINES (from platform edge to spindle) ===
  {
    ctx.strokeStyle = "#5a3a20";
    ctx.lineWidth = 1.2 * zoom;
    for (let fl = 0; fl < 3; fl++) {
      const fla = fl * ((Math.PI * 2) / 3) + Math.PI * 0.5;
      const startX = Math.cos(fla) * platR * 0.75;
      const startY = Math.sin(fla) * platR * ISO_Y_RATIO * 0.75;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(
        startX * 0.4,
        startY * 0.4 - 3 * zoom,
        spindleBase.x,
        spindleBase.y,
      );
      ctx.stroke();
      ctx.fillStyle = "#8a5a3a";
      ctx.beginPath();
      ctx.arc(startX, startY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === EXHAUST VENTS (on spindle sides) ===
  {
    for (const side of [-1, 1]) {
      const vx = spindleBase.x + side * 8 * zoom;
      const vy = spindleBase.y + side * 2 * zoom;
      ctx.fillStyle = "#2a1a10";
      ctx.beginPath();
      ctx.ellipse(vx, vy, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      if (timeSinceFire < 1200) {
        const ventA = (1 - timeSinceFire / 1200) * 0.35;
        ctx.fillStyle = `rgba(255, 100, 20, ${ventA})`;
        ctx.beginPath();
        ctx.arc(
          vx + side * 2 * zoom,
          vy - (1 - timeSinceFire / 1200) * 4 * zoom,
          (1.5 + (1 - timeSinceFire / 1200) * 2) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  // === AMMO HOPPER (near platform edge) ===
  {
    const hopX = cosR * platR * 0.65;
    const hopY = sinR * platR * ISO_Y_RATIO * 0.65;
    drawIsometricPrism(
      ctx,
      hopX,
      hopY,
      5,
      4,
      5,
      { top: "#4a3a20", left: "#3a2a14", right: "#2a1a0a" },
      zoom,
    );
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(hopX - 1.5 * zoom, hopY - 4 * zoom, 3 * zoom, 1 * zoom);
    // Shells visible on top
    for (let sh = 0; sh < 2; sh++) {
      ctx.fillStyle = "#cc5500";
      ctx.beginPath();
      ctx.ellipse(
        hopX + (sh - 0.5) * 2 * zoom,
        hopY - 4.5 * zoom,
        1.2 * zoom,
        0.7 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === SIGHT UNIT with targeting display ===
  {
    const sightX = spindleTop.x + 5 * zoom;
    const sightY = spindleTop.y - 7 * zoom;
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(spindleTop.x, spindleTop.y);
    ctx.lineTo(sightX, sightY);
    ctx.stroke();
    ctx.fillStyle = "#2a2a32";
    ctx.fillRect(sightX - 3 * zoom, sightY - 2 * zoom, 6 * zoom, 4 * zoom);
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(sightX - 3 * zoom, sightY - 2 * zoom, 6 * zoom, 4 * zoom);
    const sGlow = 0.5 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 80, 0, ${sGlow})`;
    ctx.fillRect(sightX - 2 * zoom, sightY - 1 * zoom, 4 * zoom, 2 * zoom);
    // Crosshair
    ctx.strokeStyle = `rgba(255, 200, 0, ${sGlow})`;
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(sightX - 1.5 * zoom, sightY);
    ctx.lineTo(sightX + 1.5 * zoom, sightY);
    ctx.moveTo(sightX, sightY - 0.8 * zoom);
    ctx.lineTo(sightX, sightY + 0.8 * zoom);
    ctx.stroke();
  }

  // === TEMPERATURE GAUGE ===
  {
    const gx = -cosR * platR * 0.5;
    const gy = -sinR * platR * ISO_Y_RATIO * 0.5 - 2 * zoom;
    ctx.fillStyle = "#1a1a20";
    ctx.beginPath();
    ctx.arc(gx, gy, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    const heatLevel = 0.5 + Math.sin(time * 0.8) * 0.3;
    ctx.strokeStyle = `rgb(${Math.floor(255 * heatLevel)}, ${Math.floor(80 * (1 - heatLevel))}, 0)`;
    ctx.lineWidth = 0.6 * zoom;
    const needleA = -Math.PI * 0.5 + heatLevel * Math.PI;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(
      gx + Math.cos(needleA) * 2 * zoom,
      gy + Math.sin(needleA) * 2 * zoom,
    );
    ctx.stroke();
  }

  // === EMBER SPARKS (enhanced) ===
  for (let sp = 0; sp < 8; sp++) {
    const sa = time * 1.5 + sp * Math.PI * 0.25;
    const sr = 12 * zoom + Math.sin(sa * 2) * 5 * zoom;
    const sparkR = (1 + Math.sin(sa * 2) * 0.4) * zoom;
    ctx.fillStyle = `rgba(255, ${80 + Math.floor(Math.sin(sa) * 80)}, 0, ${0.4 + Math.sin(sa * 3) * 0.3})`;
    ctx.beginPath();
    ctx.arc(
      spindleTop.x + Math.cos(sa) * sr,
      spindleTop.y - 6 * zoom - Math.abs(Math.sin(sa * 1.3)) * 10 * zoom,
      sparkR,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Trailing glow
    ctx.fillStyle = `rgba(255, 60, 0, ${0.1 + Math.sin(sa * 3) * 0.08})`;
    ctx.beginPath();
    ctx.arc(
      spindleTop.x + Math.cos(sa) * sr * 0.8,
      spindleTop.y - 4 * zoom - Math.abs(Math.sin(sa * 1.3)) * 8 * zoom,
      sparkR * 1.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === HEAT SHIMMER ===
  {
    const shimmerA = 0.06 + Math.sin(time * 4) * 0.03;
    ctx.fillStyle = `rgba(255, 150, 50, ${shimmerA})`;
    ctx.beginPath();
    ctx.ellipse(
      spindleTop.x,
      spindleTop.y - 15 * zoom,
      18 * zoom,
      8 * zoom,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
}

// Missile Battery (4A): proper 3D isometric launcher rack with visible tubes
export function renderMortarMissileSilo(
  ctx: CanvasRenderingContext2D,
  screenPos: Position,
  topY: number,
  tower: Tower,
  zoom: number,
  time: number,
  timeSinceFire: number,
) {
  const rot = tower.rotation || -Math.PI / 4;
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);

  ctx.save();
  ctx.translate(screenPos.x, topY);

  // Directional vectors (screen-space)
  const fwdX = cosR;
  const fwdY = sinR * 0.5;
  const perpX = -sinR;
  const perpY = cosR * 0.5;

  // === HEX-PRISM TURNTABLE ===
  const hexSides = 8;
  const isoOff: IsoOffFn = (dx, dy) => ({ x: dx, y: dy * ISO_Y_RATIO });
  const platR = 24 * zoom;
  const mPlatH = 5 * zoom;
  const mPlatVerts = generateIsoHexVertices(isoOff, platR, hexSides);
  const mPlatNormals = computeHexSideNormals(0, hexSides);
  const mPlatSorted = sortSidesByDepth(mPlatNormals);
  const mPlatBot: Pt = { x: 0, y: 4 * zoom };
  const mPlatTop: Pt = { x: 0, y: 4 * zoom - mPlatH };

  for (const i of mPlatSorted) {
    const ni = (i + 1) % hexSides;
    const n = mPlatNormals[i];
    const bright = Math.max(0, Math.min(1, 0.35 + (n + 1) * 0.32));
    const cv = Math.floor(36 + bright * 36);
    ctx.fillStyle = `rgb(${cv},${cv + 6},${cv + 2})`;
    ctx.beginPath();
    ctx.moveTo(mPlatBot.x + mPlatVerts[i].x, mPlatBot.y + mPlatVerts[i].y);
    ctx.lineTo(mPlatBot.x + mPlatVerts[ni].x, mPlatBot.y + mPlatVerts[ni].y);
    ctx.lineTo(mPlatTop.x + mPlatVerts[ni].x, mPlatTop.y + mPlatVerts[ni].y);
    ctx.lineTo(mPlatTop.x + mPlatVerts[i].x, mPlatTop.y + mPlatVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }
  drawHexCap(
    ctx,
    mPlatTop,
    mPlatVerts,
    "#3a4238",
    "rgba(0,0,0,0.1)",
    0.5 * zoom,
  );

  // Hex gear ring
  {
    const gR = platR * 0.9;
    const gVerts = generateIsoHexVertices(isoOff, gR, hexSides);
    const gNormals = computeHexSideNormals(0, hexSides);
    drawHexBand(
      ctx,
      gVerts,
      gNormals,
      { x: 0, y: mPlatTop.y + 1.5 * zoom },
      mPlatTop,
      1.0,
      (n) => {
        const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
        return `rgb(${Math.floor(70 + b * 32)},${Math.floor(70 + b * 32)},${Math.floor(82 + b * 24)})`;
      },
      "rgba(0,0,0,0.12)",
      0.4 * zoom,
      -0.3,
    );
    for (let g = 0; g < 20; g++) {
      const ga = (g / 20) * Math.PI * 2 + time * 0.15;
      ctx.fillStyle = "#6a6a72";
      ctx.beginPath();
      ctx.arc(
        Math.cos(ga) * gR,
        Math.sin(ga) * gR * ISO_Y_RATIO,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Anchor bolts on platform vertices (larger, detailed)
  for (let i = 0; i < hexSides; i++) {
    if (mPlatNormals[i] < -0.7 && mPlatNormals[(i + hexSides - 1) % hexSides] < -0.7) continue;
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(mPlatTop.x + mPlatVerts[i].x, mPlatTop.y + mPlatVerts[i].y, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(mPlatTop.x + mPlatVerts[i].x, mPlatTop.y + mPlatVerts[i].y, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tread plate texture on platform cap
  ctx.strokeStyle = "rgba(80,80,90,0.08)";
  ctx.lineWidth = 0.4 * zoom;
  for (let tp = 0; tp < 8; tp++) {
    const tpA = tp * Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(tpA) * platR * 0.15, mPlatTop.y + Math.sin(tpA) * platR * 0.075);
    ctx.lineTo(Math.cos(tpA) * platR * 0.75, mPlatTop.y + Math.sin(tpA) * platR * 0.375);
    ctx.stroke();
  }

  // Warning ring on platform cap
  ctx.strokeStyle = "rgba(200,160,0,0.15)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, mPlatTop.y, platR * 0.65, platR * 0.325, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Support struts (thicker, structural)
  for (let i = 0; i < hexSides; i++) {
    if (mPlatNormals[i] < -0.7) continue;
    const ni = (i + 1) % hexSides;
    const mx = (mPlatVerts[i].x + mPlatVerts[ni].x) * 0.5;
    const my = (mPlatVerts[i].y + mPlatVerts[ni].y) * 0.5;
    ctx.strokeStyle = "#3a3a42";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(mPlatTop.x + mx, mPlatTop.y + my);
    ctx.lineTo(mPlatBot.x + mx * 1.15, mPlatBot.y + my * 1.15 + 2 * zoom);
    ctx.stroke();
    // Diagonal cross-brace
    if (i % 2 === 0) {
      const nextNi = (ni + 1) % hexSides;
      const mx2 = (mPlatVerts[ni].x + mPlatVerts[nextNi].x) * 0.5;
      const my2 = (mPlatVerts[ni].y + mPlatVerts[nextNi].y) * 0.5;
      ctx.strokeStyle = "#2a2a32";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(mPlatBot.x + mx * 1.1, mPlatBot.y + my * 1.1 + 1 * zoom);
      ctx.lineTo(mPlatTop.x + mx2, mPlatTop.y + my2);
      ctx.stroke();
    }
  }
  ctx.lineCap = "butt";

  // Aim indicator (pulsing red arrow)
  const aimPulse = 0.3 + Math.sin(time * 3) * 0.1;
  ctx.strokeStyle = `rgba(255,34,0,${aimPulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(fwdX * platR * 0.3, fwdY * platR * 0.3);
  ctx.lineTo(fwdX * platR * 0.88, fwdY * platR * 0.88);
  ctx.stroke();
  const aTipX = fwdX * platR * 0.88;
  const aTipY = fwdY * platR * 0.88;
  ctx.fillStyle = `rgba(255,34,0,${aimPulse})`;
  ctx.beginPath();
  ctx.moveTo(aTipX + fwdX * 3 * zoom, aTipY + fwdY * 3 * zoom);
  ctx.lineTo(aTipX - perpX * 2 * zoom, aTipY - perpY * 2 * zoom);
  ctx.lineTo(aTipX + perpX * 2 * zoom, aTipY + perpY * 2 * zoom);
  ctx.closePath();
  ctx.fill();

  // === LAUNCHER HOUSING (3D isometric box) ===
  // Housing sits on the turntable, tilts forward/up toward target
  const hW = 11 * zoom; // half-width (perpendicular to aim)
  const hL = 20 * zoom; // length (along aim direction)
  const hBackH = 8 * zoom; // height at rear
  const hFrontH = 20 * zoom; // height at front (tilted upward)

  // Offset: housing center is slightly behind turntable center
  const hOx = -fwdX * 3 * zoom;
  const hOy = -fwdY * 3 * zoom;

  // 8 corners of the tilted box
  // Bottom face (on turntable plane)
  const bb_l = {
    x: hOx - perpX * hW - fwdX * hL * 0.3,
    y: hOy - perpY * hW - fwdY * hL * 0.3,
  };
  const bb_r = {
    x: hOx + perpX * hW - fwdX * hL * 0.3,
    y: hOy + perpY * hW - fwdY * hL * 0.3,
  };
  const bf_l = {
    x: hOx - perpX * hW + fwdX * hL * 0.7,
    y: hOy - perpY * hW + fwdY * hL * 0.7,
  };
  const bf_r = {
    x: hOx + perpX * hW + fwdX * hL * 0.7,
    y: hOy + perpY * hW + fwdY * hL * 0.7,
  };
  // Top face (elevated, front higher due to tilt)
  const tb_l = { x: bb_l.x, y: bb_l.y - hBackH };
  const tb_r = { x: bb_r.x, y: bb_r.y - hBackH };
  const tf_l = { x: bf_l.x, y: bf_l.y - hFrontH };
  const tf_r = { x: bf_r.x, y: bf_r.y - hFrontH };

  // Determine face visibility based on rotation
  // Left face normal in screen space ~ perpX, perpY (points left of aim)
  const leftVis = -perpX * 0.7 + perpY * 0.5; // dot with ~(−1,1) camera dir
  const rightVis = perpX * 0.7 - perpY * 0.5;
  const frontVis = -fwdX * 0.7 + fwdY * 0.5;
  const backVis = fwdX * 0.7 - fwdY * 0.5;

  // Color helper: shade based on visibility/lighting (military olive-drab tint)
  const shadeGray = (base: number, bright: number) => {
    const v = Math.floor(base + bright * 28);
    return `rgb(${v + 2},${v + 6},${v})`;
  };

  // Helper: draw panel detail on a side face (seams, rivets, warning stripe)
  const drawSidePanelDetail = (
    bl: Pt, br: Pt, tl: Pt, tr: Pt, vis: number,
  ) => {
    // Horizontal panel seams (2 seams dividing face into 3 panels)
    for (const hf of [0.33, 0.66]) {
      const sl = { x: bl.x + (tl.x - bl.x) * hf, y: bl.y + (tl.y - bl.y) * hf };
      const sr = { x: br.x + (tr.x - br.x) * hf, y: br.y + (tr.y - br.y) * hf };
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(sr.x, sr.y);
      ctx.stroke();
      ctx.strokeStyle = `rgba(180,180,190,0.06)`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y - 0.5 * zoom);
      ctx.lineTo(sr.x, sr.y - 0.5 * zoom);
      ctx.stroke();
    }
    // Vertical center seam
    const midB = { x: (bl.x + br.x) * 0.5, y: (bl.y + br.y) * 0.5 };
    const midT = { x: (tl.x + tr.x) * 0.5, y: (tl.y + tr.y) * 0.5 };
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(midB.x, midB.y);
    ctx.lineTo(midT.x, midT.y);
    ctx.stroke();

    // Rivet rows (top and bottom edges)
    const rivetAlpha = 0.4 + vis * 0.3;
    ctx.fillStyle = `rgba(130,130,140,${rivetAlpha})`;
    for (const vf of [0.05, 0.95]) {
      for (let rv = 0; rv < 4; rv++) {
        const t = (rv + 0.5) / 4;
        const rx = bl.x + (br.x - bl.x) * t + (tl.x - bl.x) * vf + (tr.x - br.x - tl.x + bl.x) * t * vf;
        const ry = bl.y + (br.y - bl.y) * t + (tl.y - bl.y) * vf + (tr.y - br.y - tl.y + bl.y) * t * vf;
        ctx.beginPath();
        ctx.arc(rx, ry, 0.7 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Warning stripe (diagonal caution band at 40% height)
    const stripeVf = 0.4;
    const s0 = {
      x: bl.x + (tl.x - bl.x) * stripeVf,
      y: bl.y + (tl.y - bl.y) * stripeVf,
    };
    const s1 = {
      x: br.x + (tr.x - br.x) * stripeVf,
      y: br.y + (tr.y - br.y) * stripeVf,
    };
    const s2 = {
      x: br.x + (tr.x - br.x) * (stripeVf + 0.06),
      y: br.y + (tr.y - br.y) * (stripeVf + 0.06),
    };
    const s3 = {
      x: bl.x + (tl.x - bl.x) * (stripeVf + 0.06),
      y: bl.y + (tl.y - bl.y) * (stripeVf + 0.06),
    };
    ctx.fillStyle = `rgba(200,160,0,0.15)`;
    ctx.beginPath();
    ctx.moveTo(s0.x, s0.y);
    ctx.lineTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.lineTo(s3.x, s3.y);
    ctx.closePath();
    ctx.fill();

    // Access hatch outline
    const hatchCx = bl.x + (br.x - bl.x) * 0.5 + (tl.x - bl.x) * 0.65 + (tr.x - br.x - tl.x + bl.x) * 0.325;
    const hatchCy = bl.y + (br.y - bl.y) * 0.5 + (tl.y - bl.y) * 0.65 + (tr.y - br.y - tl.y + bl.y) * 0.325;
    ctx.strokeStyle = `rgba(120,120,130,${0.15 + vis * 0.1})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.strokeRect(hatchCx - 2 * zoom, hatchCy - 1.5 * zoom, 4 * zoom, 3 * zoom);
    ctx.fillStyle = `rgba(80,80,90,${0.1 + vis * 0.05})`;
    ctx.fillRect(hatchCx - 1.5 * zoom, hatchCy - 1 * zoom, 3 * zoom, 2 * zoom);
  };

  // Draw faces back-to-front
  // Back face
  if (backVis > -0.3) {
    const b = Math.max(0, Math.min(1, backVis * 0.5 + 0.5));
    ctx.fillStyle = shadeGray(38, b);
    ctx.beginPath();
    ctx.moveTo(bb_l.x, bb_l.y);
    ctx.lineTo(bb_r.x, bb_r.y);
    ctx.lineTo(tb_r.x, tb_r.y);
    ctx.lineTo(tb_l.x, tb_l.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    drawSidePanelDetail(bb_l, bb_r, tb_l, tb_r, b);
    // Exhaust vents on back
    for (const ef of [0.3, 0.7]) {
      const ex = bb_l.x + (bb_r.x - bb_l.x) * ef + (tb_l.x - bb_l.x) * 0.5;
      const ey = bb_l.y + (bb_r.y - bb_l.y) * ef + (tb_l.y - bb_l.y) * 0.5;
      ctx.fillStyle = "#1a1a20";
      ctx.beginPath();
      ctx.ellipse(ex, ey, 1.5 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Left face
  if (leftVis > -0.3) {
    const b = Math.max(0, Math.min(1, leftVis * 0.5 + 0.5));
    ctx.fillStyle = shadeGray(33, b);
    ctx.beginPath();
    ctx.moveTo(bb_l.x, bb_l.y);
    ctx.lineTo(bf_l.x, bf_l.y);
    ctx.lineTo(tf_l.x, tf_l.y);
    ctx.lineTo(tb_l.x, tb_l.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    drawSidePanelDetail(bb_l, bf_l, tb_l, tf_l, b);
  }

  // Right face
  if (rightVis > -0.3) {
    const b = Math.max(0, Math.min(1, rightVis * 0.5 + 0.5));
    ctx.fillStyle = shadeGray(33, b);
    ctx.beginPath();
    ctx.moveTo(bb_r.x, bb_r.y);
    ctx.lineTo(bf_r.x, bf_r.y);
    ctx.lineTo(tf_r.x, tf_r.y);
    ctx.lineTo(tb_r.x, tb_r.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    drawSidePanelDetail(bb_r, bf_r, tb_r, tf_r, b);
  }

  // Bottom face
  ctx.fillStyle = shadeGray(28, 0.3);
  ctx.beginPath();
  ctx.moveTo(bb_l.x, bb_l.y);
  ctx.lineTo(bb_r.x, bb_r.y);
  ctx.lineTo(bf_r.x, bf_r.y);
  ctx.lineTo(bf_l.x, bf_l.y);
  ctx.closePath();
  ctx.fill();

  // Top face (always visible in iso view)
  ctx.fillStyle = shadeGray(52, 0.85);
  ctx.beginPath();
  ctx.moveTo(tb_l.x, tb_l.y);
  ctx.lineTo(tb_r.x, tb_r.y);
  ctx.lineTo(tf_r.x, tf_r.y);
  ctx.lineTo(tf_l.x, tf_l.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Top face detail: center seam, tread plate, warning stripes, stencil markings
  {
    const topMidB = { x: (tb_l.x + tb_r.x) * 0.5, y: (tb_l.y + tb_r.y) * 0.5 };
    const topMidF = { x: (tf_l.x + tf_r.x) * 0.5, y: (tf_l.y + tf_r.y) * 0.5 };
    // Center seam
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(topMidB.x, topMidB.y);
    ctx.lineTo(topMidF.x, topMidF.y);
    ctx.stroke();

    // Tread plate cross-hatch
    ctx.strokeStyle = "rgba(80,80,90,0.08)";
    ctx.lineWidth = 0.4 * zoom;
    for (let tp = 0; tp < 6; tp++) {
      const t = (tp + 0.5) / 6;
      const lp = { x: tb_l.x + (tf_l.x - tb_l.x) * t, y: tb_l.y + (tf_l.y - tb_l.y) * t };
      const rp = { x: tb_r.x + (tf_r.x - tb_r.x) * t, y: tb_r.y + (tf_r.y - tb_r.y) * t };
      ctx.beginPath();
      ctx.moveTo(lp.x, lp.y);
      ctx.lineTo(rp.x, rp.y);
      ctx.stroke();
    }

    // Warning chevrons (more prominent)
    ctx.strokeStyle = "rgba(200,160,0,0.25)";
    ctx.lineWidth = 1.8 * zoom;
    for (let ch = 0; ch < 4; ch++) {
      const t = (ch + 1) / 5;
      const cx = topMidB.x + (topMidF.x - topMidB.x) * t;
      const cy = topMidB.y + (topMidF.y - topMidB.y) * t;
      const tl = { x: tb_l.x + (tf_l.x - tb_l.x) * t, y: tb_l.y + (tf_l.y - tb_l.y) * t };
      const tr = { x: tb_r.x + (tf_r.x - tb_r.x) * t, y: tb_r.y + (tf_r.y - tb_r.y) * t };
      const halfW = Math.hypot(tr.x - tl.x, tr.y - tl.y) * 0.15;
      const perpDx = (tr.x - tl.x) / (Math.hypot(tr.x - tl.x, tr.y - tl.y) || 1);
      const perpDy = (tr.y - tl.y) / (Math.hypot(tr.x - tl.x, tr.y - tl.y) || 1);
      ctx.beginPath();
      ctx.moveTo(cx - perpDx * halfW, cy - perpDy * halfW);
      ctx.lineTo(cx + (topMidF.x - topMidB.x) * 0.03, cy + (topMidF.y - topMidB.y) * 0.03 - 1.5 * zoom);
      ctx.lineTo(cx + perpDx * halfW, cy + perpDy * halfW);
      ctx.stroke();
    }

    // Corner rivets on top face
    ctx.fillStyle = "rgba(100,100,110,0.35)";
    for (const corner of [tb_l, tb_r, tf_l, tf_r]) {
      const toCenter = { x: (topMidB.x + topMidF.x) * 0.5, y: (topMidB.y + topMidF.y) * 0.5 };
      const rx = corner.x + (toCenter.x - corner.x) * 0.12;
      const ry = corner.y + (toCenter.y - corner.y) * 0.12;
      ctx.beginPath();
      ctx.arc(rx, ry, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lift ring (center of top)
    const ringX = (topMidB.x + topMidF.x) * 0.5;
    const ringY = (topMidB.y + topMidF.y) * 0.5;
    ctx.strokeStyle = "rgba(120,120,130,0.25)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(ringX, ringY, 2 * zoom, 1 * zoom, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Front face (tube openings) — always draw, it's the business end
  {
    const fb = Math.max(0, Math.min(1, frontVis * 0.5 + 0.6));
    ctx.fillStyle = shadeGray(32, fb);
    ctx.beginPath();
    ctx.moveTo(bf_l.x, bf_l.y);
    ctx.lineTo(bf_r.x, bf_r.y);
    ctx.lineTo(tf_r.x, tf_r.y);
    ctx.lineTo(tf_l.x, tf_l.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    // === MISSILE TUBES (2x3 grid on the front face) ===
    const podRows = 3;
    const podCols = 2;
    const tubeR = 3.2 * zoom;

    for (let row = 0; row < podRows; row++) {
      for (let col = 0; col < podCols; col++) {
        const podIdx = row * podCols + col;
        // Parametric position on the front face
        const u = (col + 0.5) / podCols; // 0..1 across width
        const v = (row + 0.5) / podRows; // 0..1 across height

        // Bilinear interpolation of front face corners
        const tubeX =
          bf_l.x +
          (bf_r.x - bf_l.x) * u +
          (tf_l.x - bf_l.x + (tf_r.x - bf_r.x - tf_l.x + bf_l.x) * u) * v;
        const tubeY =
          bf_l.y +
          (bf_r.y - bf_l.y) * u +
          (tf_l.y - bf_l.y + (tf_r.y - bf_r.y - tf_l.y + bf_l.y) * u) * v;

        // Tube ring
        ctx.fillStyle = "#3a3a44";
        ctx.beginPath();
        ctx.ellipse(tubeX, tubeY, tubeR * 1.25, tubeR * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5a5a64";
        ctx.lineWidth = 1 * zoom;
        ctx.stroke();

        // Tube bore (dark opening)
        ctx.fillStyle = "#0a0808";
        ctx.beginPath();
        ctx.ellipse(
          tubeX,
          tubeY,
          tubeR * 0.85,
          tubeR * 0.48,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // === MISSILE STATE ===
        const fireDelay = podIdx * 200;
        const mSince = timeSinceFire - fireDelay;
        const isLaunching = mSince >= 0 && mSince < 400;
        const isEmpty = mSince >= 400 && mSince < 1500;
        const isReloading = mSince >= 1500 && mSince < 2200;
        const isReady = mSince < 0 || mSince >= 2200;

        // Missile warhead visible in tube
        if (isReady || isReloading) {
          const reloadT = isReloading ? (mSince - 1500) / 700 : 1;
          // Missile nose pokes out
          const noseProtrude = reloadT * 3 * zoom;
          const noseX = tubeX + fwdX * noseProtrude;
          const noseY = tubeY + fwdY * noseProtrude - noseProtrude * 0.1;
          ctx.fillStyle = "#cc2200";
          ctx.beginPath();
          ctx.ellipse(
            noseX,
            noseY,
            tubeR * 0.55,
            tubeR * 0.32,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          // Warhead tip
          ctx.fillStyle = "#ff4400";
          ctx.beginPath();
          ctx.arc(
            noseX + fwdX * 2 * zoom,
            noseY + fwdY * 2 * zoom,
            tubeR * 0.22,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          // Fin marks at bore edge
          if (reloadT > 0.8) {
            ctx.strokeStyle = "#8a8a8a";
            ctx.lineWidth = 0.6 * zoom;
            for (let f = 0; f < 4; f++) {
              const fa = (f / 4) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(
                tubeX + Math.cos(fa) * tubeR * 0.5,
                tubeY + Math.sin(fa) * tubeR * 0.28,
              );
              ctx.lineTo(
                tubeX + Math.cos(fa) * tubeR * 0.85,
                tubeY + Math.sin(fa) * tubeR * 0.48,
              );
              ctx.stroke();
            }
          }
        }

        if (isEmpty) {
          // Deeper bore when empty
          const boreGrad = ctx.createRadialGradient(
            tubeX,
            tubeY,
            0,
            tubeX,
            tubeY,
            tubeR * 0.8,
          );
          boreGrad.addColorStop(0, "#050404");
          boreGrad.addColorStop(1, "#1a1515");
          ctx.fillStyle = boreGrad;
          ctx.beginPath();
          ctx.ellipse(
            tubeX,
            tubeY,
            tubeR * 0.8,
            tubeR * 0.45,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }

        // Launching missile
        if (isLaunching) {
          const launchT = mSince / 400;
          const mRiseY = -launchT * 25 * zoom;
          const mFwdDist = launchT * launchT * 18 * zoom;
          const mAlpha = Math.max(0, 1 - launchT);
          const mX = tubeX + fwdX * mFwdDist;
          const mY = tubeY + mRiseY + fwdY * mFwdDist;

          ctx.globalAlpha = mAlpha;
          // Missile body (elongated diamond)
          const mLen = 6 * zoom;
          const mWid = 1.8 * zoom;
          ctx.fillStyle = "#cc2200";
          ctx.beginPath();
          ctx.moveTo(mX + fwdX * mLen, mY + fwdY * mLen);
          ctx.lineTo(mX + perpX * mWid, mY + perpY * mWid);
          ctx.lineTo(mX - fwdX * mLen * 0.4, mY - fwdY * mLen * 0.4);
          ctx.lineTo(mX - perpX * mWid, mY - perpY * mWid);
          ctx.closePath();
          ctx.fill();
          // Warhead
          ctx.fillStyle = "#ff5500";
          ctx.beginPath();
          ctx.arc(
            mX + fwdX * mLen * 1.15,
            mY + fwdY * mLen * 1.15,
            1.2 * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          // Fins
          ctx.strokeStyle = `rgba(150,150,150,${mAlpha})`;
          ctx.lineWidth = 0.8 * zoom;
          for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(mX - fwdX * mLen * 0.3, mY - fwdY * mLen * 0.3);
            ctx.lineTo(
              mX - fwdX * mLen * 0.4 + perpX * s * 3 * zoom,
              mY - fwdY * mLen * 0.4 + perpY * s * 3 * zoom,
            );
            ctx.stroke();
          }
          // Exhaust plume
          const exhaust1 = `rgba(255, 200, 60, ${mAlpha * 0.7})`;
          const exhaust2 = `rgba(255, 120, 20, ${mAlpha * 0.4})`;
          const exhaust3 = `rgba(180, 180, 180, ${mAlpha * 0.25})`;
          ctx.fillStyle = exhaust1;
          ctx.beginPath();
          ctx.arc(
            mX - fwdX * mLen * 0.5,
            mY - fwdY * mLen * 0.5,
            (1.5 + launchT * 2) * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = exhaust2;
          ctx.beginPath();
          ctx.arc(
            mX - fwdX * mLen * 0.8,
            mY - fwdY * mLen * 0.8 + zoom,
            (2 + launchT * 3) * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = exhaust3;
          ctx.beginPath();
          ctx.arc(
            mX - fwdX * mLen * 1.2,
            mY - fwdY * mLen * 1.2 + 2 * zoom,
            (3 + launchT * 4) * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.globalAlpha = 1;

          // Muzzle flash at tube opening
          if (mSince < 180) {
            const flashA = (1 - mSince / 180) * 0.5;
            const flashR = tubeR * 2.5;
            const flashGrad = ctx.createRadialGradient(
              tubeX,
              tubeY,
              0,
              tubeX,
              tubeY,
              flashR,
            );
            flashGrad.addColorStop(0, `rgba(255, 220, 120, ${flashA})`);
            flashGrad.addColorStop(0.5, `rgba(255, 140, 40, ${flashA * 0.5})`);
            flashGrad.addColorStop(1, `rgba(255, 80, 0, 0)`);
            ctx.fillStyle = flashGrad;
            ctx.beginPath();
            ctx.arc(tubeX, tubeY, flashR, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  // === SUPPORT FRAME (connects turntable to housing) ===
  // Rear support arch
  {
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 3.5 * zoom;
    ctx.lineCap = "round";
    // Left rear strut
    ctx.beginPath();
    ctx.moveTo(
      -perpX * platR * 0.7 - fwdX * platR * 0.3,
      -perpY * platR * 0.7 - fwdY * platR * 0.3,
    );
    ctx.lineTo(bb_l.x, bb_l.y - hBackH * 0.5);
    ctx.stroke();
    // Right rear strut
    ctx.beginPath();
    ctx.moveTo(
      perpX * platR * 0.7 - fwdX * platR * 0.3,
      perpY * platR * 0.7 - fwdY * platR * 0.3,
    );
    ctx.lineTo(bb_r.x, bb_r.y - hBackH * 0.5);
    ctx.stroke();
    ctx.lineCap = "butt";
  }

  // Hydraulic elevation pistons (from platform to underside of housing)
  for (const side of [-1, 1]) {
    const pistonBaseX = perpX * side * 8 * zoom - fwdX * 8 * zoom;
    const pistonBaseY = perpY * side * 8 * zoom - fwdY * 8 * zoom + 1 * zoom;
    // Piston attaches to mid-underside of housing
    const pistonTopX =
      (bb_l.x + bf_l.x) * 0.5 * (side < 0 ? 1 : 0) +
      (bb_r.x + bf_r.x) * 0.5 * (side > 0 ? 1 : 0);
    const pistonTopY =
      (bb_l.y + bf_l.y) * 0.5 * (side < 0 ? 1 : 0) +
      (bb_r.y + bf_r.y) * 0.5 * (side > 0 ? 1 : 0) -
      3 * zoom;

    const pistonMidX = (pistonBaseX + pistonTopX) * 0.5;
    const pistonMidY = (pistonBaseY + pistonTopY) * 0.55;

    // Outer cylinder
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 3.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(pistonBaseX, pistonBaseY);
    ctx.lineTo(pistonMidX, pistonMidY);
    ctx.stroke();
    // Inner rod
    ctx.strokeStyle = "#9a9aa0";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(pistonMidX, pistonMidY);
    ctx.lineTo(pistonTopX, pistonTopY);
    ctx.stroke();
    // Pivot joints
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(pistonBaseX, pistonBaseY, 3 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#bbb";
    ctx.beginPath();
    ctx.arc(pistonBaseX, pistonBaseY, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5a5a62";
    ctx.beginPath();
    ctx.arc(pistonTopX, pistonTopY, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // === AMMO STORAGE BOX (beside the launcher) ===
  {
    const boxX = -perpX * 16 * zoom - fwdX * 2 * zoom;
    const boxY = -perpY * 16 * zoom - fwdY * 2 * zoom;
    drawIsometricPrism(
      ctx,
      boxX,
      boxY,
      6,
      8,
      6,
      { top: "#4a5a3a", left: "#3a4a2a", right: "#2a3a1a" },
      zoom,
    );
    // Warning label
    ctx.fillStyle = "#cc2200";
    ctx.fillRect(boxX - 2 * zoom, boxY - 4.5 * zoom, 4 * zoom, 1.2 * zoom);
  }

  // === RADAR + SENSORS ===
  {
    // Radar mast from back of housing
    const radarBaseX = (tb_l.x + tb_r.x) * 0.5;
    const radarBaseY = (tb_l.y + tb_r.y) * 0.5;
    const radarTopY = radarBaseY - 10 * zoom;
    ctx.strokeStyle = "#6a6a72";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(radarBaseX, radarBaseY);
    ctx.lineTo(radarBaseX, radarTopY);
    ctx.stroke();

    // Dish
    const dishAngle = time * 2;
    const dishW = 6 * zoom * Math.abs(Math.cos(dishAngle));
    ctx.fillStyle = "#8a8a92";
    ctx.beginPath();
    ctx.ellipse(radarBaseX, radarTopY, dishW, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = Math.sin(time * 6) > 0 ? "#ff2200" : "#880000";
    ctx.beginPath();
    ctx.arc(radarBaseX, radarTopY, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();

    // Side-mounted sensor pod
    const sensorX = perpX * 14 * zoom + fwdX * 2 * zoom;
    const sensorY = perpY * 14 * zoom + fwdY * 2 * zoom - 6 * zoom;
    ctx.fillStyle = "#3a3a44";
    ctx.beginPath();
    ctx.ellipse(sensorX, sensorY, 3 * zoom, 2 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a5a64";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    const sensorGlow = 0.35 + Math.sin(time * 3) * 0.2;
    ctx.fillStyle = `rgba(255, 60, 0, ${sensorGlow})`;
    ctx.beginPath();
    ctx.arc(sensorX, sensorY, 1.2 * zoom, 0, Math.PI * 2);
    ctx.fill();
    // Sensor arm
    ctx.strokeStyle = "#5a5a5a";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(sensorX, sensorY);
    ctx.lineTo((tb_r.x + tf_r.x) * 0.5, (tb_r.y + tf_r.y) * 0.5);
    ctx.stroke();
  }

  // === CABLE RUNS (from ammo box to housing) ===
  {
    const cableStartX = -perpX * 12 * zoom - fwdX * 2 * zoom;
    const cableStartY = -perpY * 12 * zoom - fwdY * 2 * zoom - 3 * zoom;
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(cableStartX, cableStartY);
    ctx.quadraticCurveTo(
      cableStartX + perpX * 5 * zoom,
      cableStartY - 4 * zoom,
      (bb_l.x + tb_l.x) * 0.5,
      (bb_l.y + tb_l.y) * 0.5,
    );
    ctx.stroke();
    // Second cable (power)
    ctx.strokeStyle = "#2a2a32";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(cableStartX + 2 * zoom, cableStartY + 1 * zoom);
    ctx.quadraticCurveTo(
      cableStartX + perpX * 5 * zoom + 2 * zoom,
      cableStartY - 3 * zoom,
      (bb_r.x + tb_r.x) * 0.5,
      (bb_r.y + tb_r.y) * 0.5,
    );
    ctx.stroke();
  }

  // === TARGETING COMPUTER (behind launcher) ===
  {
    const tcX = -fwdX * platR * 0.65 + perpX * 6 * zoom;
    const tcY = -fwdY * platR * 0.65 + perpY * 6 * zoom;
    drawIsometricPrism(
      ctx,
      tcX,
      tcY,
      5,
      5,
      7,
      { top: "#2a2a32", left: "#1a1a24", right: "#151520" },
      zoom,
    );
    const screenG = 0.5 + Math.sin(time * 2.5) * 0.2;
    ctx.fillStyle = `rgba(0, 200, 80, ${screenG})`;
    ctx.fillRect(tcX - 1.5 * zoom, tcY - 5.5 * zoom, 3 * zoom, 2 * zoom);
    // Blinking status LEDs
    for (let led = 0; led < 3; led++) {
      const ledOn = Math.sin(time * 4 + led * 2) > 0.3;
      ctx.fillStyle =
        led === 0
          ? ledOn
            ? "#00ff44"
            : "#003310"
          : led === 1
            ? ledOn
              ? "#ffaa00"
              : "#332200"
            : timeSinceFire < 1000
              ? "#ff0000"
              : ledOn
                ? "#00ff44"
                : "#003310";
      ctx.beginPath();
      ctx.arc(
        tcX + (led - 1) * 1.5 * zoom,
        tcY - 3 * zoom,
        0.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === COUNTERMEASURE LAUNCHERS (on housing sides) ===
  {
    for (const side of [-1, 1]) {
      const cmVis = side < 0 ? leftVis : rightVis;
      if (cmVis < -0.2) continue;
      const cmX =
        (side < 0 ? tb_l.x + tf_l.x : tb_r.x + tf_r.x) * 0.5 +
        perpX * side * 3 * zoom;
      const cmY =
        (side < 0 ? tb_l.y + tf_l.y : tb_r.y + tf_r.y) * 0.5 +
        perpY * side * 3 * zoom -
        2 * zoom;
      ctx.fillStyle = "#3a3a42";
      ctx.beginPath();
      ctx.ellipse(cmX, cmY, 2 * zoom, 1.5 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#5a5a62";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
      // Mini tubes
      for (let mt = 0; mt < 2; mt++) {
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(cmX + (mt - 0.5) * 1.5 * zoom, cmY, 0.6 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // === FRONT STABILIZER BRACES ===
  {
    ctx.strokeStyle = "#4a4a52";
    ctx.lineWidth = 2 * zoom;
    for (const side of [-1, 1]) {
      const braceStartX = perpX * side * platR * 0.5 + fwdX * platR * 0.4;
      const braceStartY =
        perpY * side * platR * 0.5 + fwdY * platR * 0.4 + 1 * zoom;
      const braceEndX = side < 0 ? bf_l.x : bf_r.x;
      const braceEndY = (side < 0 ? bf_l.y : bf_r.y) - 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(braceStartX, braceStartY);
      ctx.lineTo(braceEndX, braceEndY);
      ctx.stroke();
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      ctx.arc(braceStartX, braceStartY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === RELOAD STATUS DISPLAY (on platform) ===
  {
    const rdX = -fwdX * platR * 0.4 - perpX * 8 * zoom;
    const rdY = -fwdY * platR * 0.4 - perpY * 8 * zoom - 1 * zoom;
    ctx.fillStyle = "#1a1a20";
    ctx.fillRect(rdX - 2.5 * zoom, rdY - 1.5 * zoom, 5 * zoom, 3 * zoom);
    ctx.strokeStyle = "#3a3a44";
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(rdX - 2.5 * zoom, rdY - 1.5 * zoom, 5 * zoom, 3 * zoom);
    for (let ri = 0; ri < 6; ri++) {
      const mSince = timeSinceFire - ri * 200;
      const isReady = mSince < 0 || mSince >= 2200;
      ctx.fillStyle = isReady
        ? "#00cc44"
        : mSince >= 0 && mSince < 400
          ? "#ff2200"
          : "#553300";
      ctx.fillRect(
        rdX - 2 * zoom + ri * 0.7 * zoom,
        rdY - 0.8 * zoom,
        0.5 * zoom,
        1.6 * zoom,
      );
    }
  }

  // === AUTO-AIM INDICATOR (hex outline) ===
  if (tower.mortarAutoAim) {
    const pulseA = 0.3 + Math.sin(time * 4) * 0.15;
    ctx.strokeStyle = `rgba(0, 200, 100, ${pulseA})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.setLineDash([3 * zoom, 2 * zoom]);
    const aiVerts = scaleVerts(mPlatVerts, 1.06);
    ctx.beginPath();
    for (let i = 0; i <= hexSides; i++) {
      const v = aiVerts[i % hexSides];
      if (i === 0) ctx.moveTo(mPlatTop.x + v.x, mPlatTop.y + v.y);
      else ctx.lineTo(mPlatTop.x + v.x, mPlatTop.y + v.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // === STATUS LIGHTS (on hex platform edges) ===
  for (let li = 0; li < 6; li++) {
    const mSince = timeSinceFire - li * 200;
    const isLaunching = mSince >= 0 && mSince < 400;
    ctx.fillStyle = isLaunching
      ? "#ff2200"
      : Math.sin(time * 4 + li) > 0.5
        ? "#00ff44"
        : "#004410";
    const lightIdx = Math.floor((li / 6) * hexSides) % hexSides;
    const lni = (lightIdx + 1) % hexSides;
    const lx = (mPlatVerts[lightIdx].x + mPlatVerts[lni].x) * 0.5 * 0.85;
    const ly = (mPlatVerts[lightIdx].y + mPlatVerts[lni].y) * 0.5 * 0.85;
    ctx.beginPath();
    ctx.arc(
      mPlatTop.x + lx,
      mPlatTop.y + ly - 1 * zoom,
      1.2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
}

// ============================================================================
// TOWER RENDERING
// ============================================================================
