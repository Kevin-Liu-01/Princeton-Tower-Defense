import type { Tower, Position } from "../../types";
import { ISO_Y_RATIO } from "../../constants";
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
import { drawIsometricPrism } from "./towerHelpers";

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

  // ========== GROUND SHADOW (multi-layered, soft edge) ==========
  {
    const shX = screenPos.x + 1.5 * zoom;
    const shY = screenPos.y + 10 * zoom;
    const shW = baseW * 0.65 * zoom;
    const shH = baseW * 0.3 * zoom;
    // Outer soft penumbra
    const penGrad = ctx.createRadialGradient(
      shX,
      shY,
      shW * 0.4,
      shX,
      shY,
      shW * 1.15,
    );
    penGrad.addColorStop(0, "rgba(0,0,0,0.22)");
    penGrad.addColorStop(0.6, "rgba(0,0,0,0.12)");
    penGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = penGrad;
    ctx.beginPath();
    ctx.ellipse(shX, shY, shW * 1.15, shH * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    // Core umbra
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(shX, shY, shW * 0.85, shH * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    // Fire-time ground illumination (warm tint when firing)
    if (timeSinceFire < 600) {
      const fGlow = (1 - timeSinceFire / 600) * 0.06;
      ctx.fillStyle = `rgba(255,140,40,${fGlow})`;
      ctx.beginPath();
      ctx.ellipse(shX, shY - 2 * zoom, shW * 1.3, shH * 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

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
    // Wall face gradient (lighter top to darker bottom for depth)
    const wallGrad = ctx.createLinearGradient(
      wallTop.x + (wallVerts[i].x + wallVerts[ni].x) * 0.5,
      wallTop.y + (wallVerts[i].y + wallVerts[ni].y) * 0.5,
      wallBot.x + (wallVerts[i].x + wallVerts[ni].x) * 0.5,
      wallBot.y + (wallVerts[i].y + wallVerts[ni].y) * 0.5,
    );
    wallGrad.addColorStop(
      0,
      `rgb(${Math.min(255, r + 8)},${Math.min(255, g + 6)},${Math.min(255, b + 5)})`,
    );
    wallGrad.addColorStop(0.6, `rgb(${r},${g},${b})`);
    wallGrad.addColorStop(
      1,
      `rgb(${Math.max(0, r - 10)},${Math.max(0, g - 8)},${Math.max(0, b - 6)})`,
    );
    ctx.fillStyle = wallGrad;
    ctx.beginPath();
    ctx.moveTo(wallBot.x + wallVerts[i].x, wallBot.y + wallVerts[i].y);
    ctx.lineTo(wallBot.x + wallVerts[ni].x, wallBot.y + wallVerts[ni].y);
    ctx.lineTo(wallTop.x + wallVerts[ni].x, wallTop.y + wallVerts[ni].y);
    ctx.lineTo(wallTop.x + wallVerts[i].x, wallTop.y + wallVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(0,0,0,${0.1 + bright * 0.06})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    if (n < -0.5) continue;
    const mx = (wallVerts[i].x + wallVerts[ni].x) * 0.5;
    const my = (wallVerts[i].y + wallVerts[ni].y) * 0.5;

    // Face interpolation helper for placing details on any wall face
    const wallFacePt = (u: number, v: number) => ({
      x:
        wallBot.x +
        wallVerts[i].x * (1 - u) +
        wallVerts[ni].x * u +
        (wallTop.x - wallBot.x + (wallVerts[i].x - wallVerts[i].x) * 0) * v,
      y:
        wallBot.y +
        wallVerts[i].y * (1 - u) +
        wallVerts[ni].y * u +
        (wallTop.y - wallBot.y) * v,
    });

    if (level === 1) {
      // L1: Hessian sandbag wall — layered bags with bulge, stitching, frayed edges
      const midY = (wallBot.y + wallTop.y) * 0.5;
      // Two bag rows (top and bottom)
      for (const rowVf of [0.25, 0.75]) {
        const rowY = wallBot.y + (wallTop.y - wallBot.y) * rowVf;
        // Bag outline seam (horizontal divide between rows)
        ctx.strokeStyle = `rgba(40,35,20,${0.14 + bright * 0.06})`;
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(
          wallBot.x + wallVerts[i].x,
          rowY + wallVerts[i].y * (1 - rowVf),
        );
        ctx.lineTo(
          wallBot.x + wallVerts[ni].x,
          rowY + wallVerts[ni].y * (1 - rowVf),
        );
        ctx.stroke();
        // Subtle bag bulge highlight
        ctx.strokeStyle = `rgba(160,140,100,${0.05 + bright * 0.04})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(
          wallBot.x + wallVerts[i].x,
          rowY + wallVerts[i].y * (1 - rowVf) - 0.8 * zoom,
        );
        ctx.lineTo(
          wallBot.x + wallVerts[ni].x,
          rowY + wallVerts[ni].y * (1 - rowVf) - 0.8 * zoom,
        );
        ctx.stroke();
      }
      // Vertical seam (offset brick pattern)
      ctx.strokeStyle = `rgba(0,0,0,${0.08 + bright * 0.05})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + mx, midY + my * 0.5);
      ctx.lineTo(wallTop.x + mx, wallTop.y + my);
      ctx.stroke();
      // Offset vertical seam in lower row
      const offsetMx = wallVerts[i].x * 0.75 + wallVerts[ni].x * 0.25;
      const offsetMy = wallVerts[i].y * 0.75 + wallVerts[ni].y * 0.25;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + offsetMx, wallBot.y + offsetMy);
      ctx.lineTo(wallBot.x + offsetMx, midY + offsetMy * 0.5);
      ctx.stroke();
      // Cross-stitch pattern on seam
      ctx.strokeStyle = `rgba(70,60,35,${0.12 + bright * 0.08})`;
      ctx.lineWidth = 0.35 * zoom;
      for (let st = 0; st < 5; st++) {
        const stVf = (st + 0.5) / 5;
        const sy = wallTop.y + my + (wallBot.y - wallTop.y) * stVf;
        const sx = wallBot.x + mx;
        ctx.beginPath();
        ctx.moveTo(sx - 0.8 * zoom, sy - 0.6 * zoom);
        ctx.lineTo(sx + 0.8 * zoom, sy + 0.6 * zoom);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx + 0.8 * zoom, sy - 0.6 * zoom);
        ctx.lineTo(sx - 0.8 * zoom, sy + 0.6 * zoom);
        ctx.stroke();
      }
      // Sand grain speckle texture (scattered)
      const seed = i * 31 + 17;
      ctx.fillStyle = `rgba(150,130,85,${0.05 + bright * 0.04})`;
      for (let sd = 0; sd < 5; sd++) {
        const sdu = ((seed * (sd + 1) * 7) % 100) / 100;
        const sdv = ((seed * (sd + 3) * 13) % 100) / 100;
        const pt = wallFacePt(sdu, sdv);
        ctx.beginPath();
        ctx.arc(
          pt.x,
          pt.y,
          (0.3 + ((seed * sd) % 3) * 0.15) * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      // Frayed edge fibers at top
      ctx.strokeStyle = `rgba(120,100,60,${0.06 + bright * 0.04})`;
      ctx.lineWidth = 0.25 * zoom;
      for (let f = 0; f < 3; f++) {
        const fu = (f + 0.5) / 3;
        const fx = wallTop.x + wallVerts[i].x * (1 - fu) + wallVerts[ni].x * fu;
        const fy = wallTop.y + wallVerts[i].y * (1 - fu) + wallVerts[ni].y * fu;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + ((f % 2) * 2 - 1) * 0.5 * zoom, fy - 1.2 * zoom);
        ctx.stroke();
      }
    } else if (level === 2) {
      // L2: Heavy riveted steel armor plate — welded seams, bolt rows, plate numbering
      const midY = (wallBot.y + wallTop.y) * 0.5;
      // Horizontal weld bead (raised, slightly irregular)
      ctx.strokeStyle = `rgba(0,0,0,${0.14 + bright * 0.06})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + wallVerts[i].x, midY + wallVerts[i].y * 0.5);
      ctx.lineTo(wallBot.x + wallVerts[ni].x, midY + wallVerts[ni].y * 0.5);
      ctx.stroke();
      // Weld bead highlight (specular)
      ctx.strokeStyle = `rgba(170,175,190,${0.1 + bright * 0.06})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        wallBot.x + wallVerts[i].x,
        midY + wallVerts[i].y * 0.5 - 0.6 * zoom,
      );
      ctx.lineTo(
        wallBot.x + wallVerts[ni].x,
        midY + wallVerts[ni].y * 0.5 - 0.6 * zoom,
      );
      ctx.stroke();
      // Weld heat tint (faint blue/purple along bead)
      ctx.strokeStyle = `rgba(100,80,160,${0.04 + bright * 0.03})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        wallBot.x + wallVerts[i].x,
        midY + wallVerts[i].y * 0.5 + 0.3 * zoom,
      );
      ctx.lineTo(
        wallBot.x + wallVerts[ni].x,
        midY + wallVerts[ni].y * 0.5 + 0.3 * zoom,
      );
      ctx.stroke();
      // Two rivet rows (top + bottom border)
      ctx.fillStyle = `rgba(140,145,160,${0.4 + bright * 0.3})`;
      for (const vf of [0.12, 0.88]) {
        for (let rv = 0; rv < 3; rv++) {
          const rvU = (rv + 0.5) / 3;
          const rvx =
            wallBot.x + wallVerts[i].x * (1 - rvU) + wallVerts[ni].x * rvU;
          const rvy =
            wallBot.y +
            (wallTop.y - wallBot.y) * vf +
            (wallVerts[i].y * (1 - rvU) + wallVerts[ni].y * rvU) * (1 - vf);
          ctx.beginPath();
          ctx.arc(rvx, rvy, 0.85 * zoom, 0, Math.PI * 2);
          ctx.fill();
          // Rivet highlight
          ctx.fillStyle = `rgba(200,200,210,${0.15 + bright * 0.1})`;
          ctx.beginPath();
          ctx.arc(
            rvx - 0.2 * zoom,
            rvy - 0.2 * zoom,
            0.35 * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = `rgba(140,145,160,${0.4 + bright * 0.3})`;
        }
      }
      // Vertical center seam
      ctx.strokeStyle = `rgba(0,0,0,${0.09 + bright * 0.04})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(wallBot.x + mx, wallBot.y + my);
      ctx.lineTo(wallTop.x + mx, wallTop.y + my);
      ctx.stroke();
      // Scratch/wear mark (diagonal)
      ctx.strokeStyle = `rgba(80,80,90,${0.06 + bright * 0.03})`;
      ctx.lineWidth = 0.3 * zoom;
      const scrPt0 = wallFacePt(0.2, 0.3);
      const scrPt1 = wallFacePt(0.6, 0.7);
      ctx.beginPath();
      ctx.moveTo(scrPt0.x, scrPt0.y);
      ctx.lineTo(scrPt1.x, scrPt1.y);
      ctx.stroke();
    } else {
      // L3+: Polished ceremonial armor with gold filigree, beveled edges, engraving
      // Beveled inset border (creates depth illusion)
      const inset = 0.1;
      const p0 = {
        x: wallBot.x + wallVerts[i].x * (1 - inset) + wallVerts[ni].x * inset,
        y:
          wallBot.y +
          wallVerts[i].y * (1 - inset) +
          wallVerts[ni].y * inset -
          0.4 * zoom,
      };
      const p1 = {
        x: wallBot.x + wallVerts[ni].x * (1 - inset) + wallVerts[i].x * inset,
        y:
          wallBot.y +
          wallVerts[ni].y * (1 - inset) +
          wallVerts[i].y * inset -
          0.4 * zoom,
      };
      const p2 = {
        x: wallTop.x + wallVerts[ni].x * (1 - inset) + wallVerts[i].x * inset,
        y:
          wallTop.y +
          wallVerts[ni].y * (1 - inset) +
          wallVerts[i].y * inset +
          0.4 * zoom,
      };
      const p3 = {
        x: wallTop.x + wallVerts[i].x * (1 - inset) + wallVerts[ni].x * inset,
        y:
          wallTop.y +
          wallVerts[i].y * (1 - inset) +
          wallVerts[ni].y * inset +
          0.4 * zoom,
      };
      // Outer bevel shadow
      ctx.strokeStyle = `rgba(0,0,0,${0.08 + bright * 0.04})`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.stroke();
      // Inner bevel highlight
      ctx.strokeStyle = `rgba(201,162,39,${0.22 + bright * 0.14})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.stroke();
      // Decorative center filigree line (ornamental engraving)
      ctx.strokeStyle = `rgba(201,162,39,${0.15 + bright * 0.1})`;
      ctx.lineWidth = 0.4 * zoom;
      const cMidBot = { x: (p0.x + p1.x) * 0.5, y: (p0.y + p1.y) * 0.5 };
      const cMidTop = { x: (p2.x + p3.x) * 0.5, y: (p2.y + p3.y) * 0.5 };
      ctx.beginPath();
      ctx.moveTo(cMidBot.x, cMidBot.y);
      ctx.lineTo(cMidTop.x, cMidTop.y);
      ctx.stroke();
      // Diamond filigree accents along center
      for (const vf of [0.3, 0.7]) {
        const dx = cMidBot.x + (cMidTop.x - cMidBot.x) * vf;
        const dy = cMidBot.y + (cMidTop.y - cMidBot.y) * vf;
        const ds = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(dx, dy - ds * 0.8);
        ctx.lineTo(dx + ds * 0.5, dy);
        ctx.lineTo(dx, dy + ds * 0.8);
        ctx.lineTo(dx - ds * 0.5, dy);
        ctx.closePath();
        ctx.stroke();
      }
      // Corner gold rosette rivets (with faceted hex heads)
      ctx.fillStyle = `rgba(201,162,39,${0.55 + bright * 0.3})`;
      for (const pp of [p0, p1, p2, p3]) {
        ctx.beginPath();
        ctx.arc(pp.x, pp.y, 0.9 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(230,200,80,${0.3 + bright * 0.2})`;
        ctx.beginPath();
        ctx.arc(
          pp.x - 0.15 * zoom,
          pp.y - 0.15 * zoom,
          0.4 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = `rgba(201,162,39,${0.55 + bright * 0.3})`;
      }
      // Polished specular highlight strip (long vertical)
      ctx.strokeStyle = `rgba(255,255,255,${0.035 + bright * 0.03})`;
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        wallTop.x + wallVerts[i].x * 0.92 + wallVerts[ni].x * 0.08,
        wallTop.y + wallVerts[i].y * 0.92 + wallVerts[ni].y * 0.08 + 1 * zoom,
      );
      ctx.lineTo(
        wallTop.x + wallVerts[i].x * 0.92 + wallVerts[ni].x * 0.08,
        wallBot.y + wallVerts[i].y * 0.92 + wallVerts[ni].y * 0.08 - 1 * zoom,
      );
      ctx.stroke();
      // Secondary shorter highlight (reflection break)
      ctx.strokeStyle = `rgba(255,255,255,${0.02 + bright * 0.015})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        wallBot.x + wallVerts[i].x * 0.2 + wallVerts[ni].x * 0.8,
        wallTop.y + (wallVerts[i].y * 0.2 + wallVerts[ni].y * 0.8) + 2 * zoom,
      );
      ctx.lineTo(
        wallBot.x + wallVerts[i].x * 0.2 + wallVerts[ni].x * 0.8,
        (wallBot.y + wallTop.y) * 0.5 +
          (wallVerts[i].y * 0.2 + wallVerts[ni].y * 0.8) * 0.5,
      );
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
    // Depot face gradient (top-lit for volume)
    const depotGrad = ctx.createLinearGradient(
      depotTop.x + (depotVerts[i].x + depotVerts[ni].x) * 0.5,
      depotTop.y + (depotVerts[i].y + depotVerts[ni].y) * 0.5,
      depotBot.x + (depotVerts[i].x + depotVerts[ni].x) * 0.5,
      depotBot.y + (depotVerts[i].y + depotVerts[ni].y) * 0.5,
    );
    depotGrad.addColorStop(
      0,
      `rgb(${Math.min(255, dr + 10)},${Math.min(255, dg + 8)},${Math.min(255, db + 5)})`,
    );
    depotGrad.addColorStop(0.5, `rgb(${dr},${dg},${db})`);
    depotGrad.addColorStop(
      1,
      `rgb(${Math.max(0, dr - 12)},${Math.max(0, dg - 10)},${Math.max(0, db - 6)})`,
    );
    ctx.fillStyle = depotGrad;
    ctx.beginPath();
    ctx.moveTo(depotBot.x + depotVerts[i].x, depotBot.y + depotVerts[i].y);
    ctx.lineTo(depotBot.x + depotVerts[ni].x, depotBot.y + depotVerts[ni].y);
    ctx.lineTo(depotTop.x + depotVerts[ni].x, depotTop.y + depotVerts[ni].y);
    ctx.lineTo(depotTop.x + depotVerts[i].x, depotTop.y + depotVerts[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = `rgba(0,0,0,${0.1 + bright * 0.06})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    if (n < -0.2) continue;

    // Depot face detail helper
    const depotFacePt = (u: number, v: number) => ({
      x:
        depotBot.x +
        depotVerts[i].x * (1 - u) +
        depotVerts[ni].x * u +
        (depotTop.x - depotBot.x) * v,
      y:
        depotBot.y +
        depotVerts[i].y * (1 - u) +
        depotVerts[ni].y * u +
        (depotTop.y - depotBot.y) * v,
    });

    // Horizontal panel seam with shadow/highlight pair
    const seamY = (depotBot.y + depotTop.y) * 0.5;
    ctx.strokeStyle = `rgba(0,0,0,${0.12 + bright * 0.05})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(depotBot.x + depotVerts[i].x, seamY + depotVerts[i].y * 0.3);
    ctx.lineTo(depotBot.x + depotVerts[ni].x, seamY + depotVerts[ni].y * 0.3);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${Math.min(255, dr + 20)},${Math.min(255, dg + 16)},${Math.min(255, db + 10)},0.08)`;
    ctx.lineWidth = 0.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      depotBot.x + depotVerts[i].x,
      seamY + depotVerts[i].y * 0.3 - 0.6 * zoom,
    );
    ctx.lineTo(
      depotBot.x + depotVerts[ni].x,
      seamY + depotVerts[ni].y * 0.3 - 0.6 * zoom,
    );
    ctx.stroke();

    if (level === 1) {
      // L1: Wooden ammo crate look — plank lines, grain, iron strap
      const mx = (depotVerts[i].x + depotVerts[ni].x) * 0.5;
      const my = (depotVerts[i].y + depotVerts[ni].y) * 0.5;
      // Vertical plank seam
      ctx.strokeStyle = `rgba(30,22,10,${0.1 + bright * 0.06})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(depotBot.x + mx, depotBot.y + my);
      ctx.lineTo(depotTop.x + mx, depotTop.y + my);
      ctx.stroke();
      // Wood grain lines (horizontal, subtle)
      ctx.strokeStyle = `rgba(80,60,30,${0.04 + bright * 0.03})`;
      ctx.lineWidth = 0.3 * zoom;
      for (let wg = 0; wg < 4; wg++) {
        const wgV = (wg + 0.5) / 4;
        const wgPt0 = depotFacePt(0.05, wgV);
        const wgPt1 = depotFacePt(0.95, wgV);
        ctx.beginPath();
        ctx.moveTo(wgPt0.x, wgPt0.y);
        ctx.lineTo(wgPt1.x, wgPt1.y);
        ctx.stroke();
      }
      // Iron reinforcement strap
      ctx.strokeStyle = `rgba(60,60,70,${0.25 + bright * 0.15})`;
      ctx.lineWidth = 1.2 * zoom;
      const strapPt0 = depotFacePt(0, 0.35);
      const strapPt1 = depotFacePt(1, 0.35);
      ctx.beginPath();
      ctx.moveTo(strapPt0.x, strapPt0.y);
      ctx.lineTo(strapPt1.x, strapPt1.y);
      ctx.stroke();
      // Strap nails
      ctx.fillStyle = `rgba(90,90,100,${0.35 + bright * 0.2})`;
      for (const su of [0.15, 0.5, 0.85]) {
        const nPt = depotFacePt(su, 0.35);
        ctx.beginPath();
        ctx.arc(nPt.x, nPt.y, 0.5 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Stenciled hazard mark
      ctx.fillStyle = `rgba(180,140,20,${0.15 + bright * 0.08})`;
      const hazPt = depotFacePt(0.5, 0.65);
      const hazS = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(hazPt.x, hazPt.y - hazS);
      ctx.lineTo(hazPt.x + hazS * 0.87, hazPt.y + hazS * 0.5);
      ctx.lineTo(hazPt.x - hazS * 0.87, hazPt.y + hazS * 0.5);
      ctx.closePath();
      ctx.fill();
    } else if (level >= 2) {
      // L2+: Armored magazine — panel seams, access hatch, vent slits, rivet grid
      const mx = (depotVerts[i].x + depotVerts[ni].x) * 0.5;
      const my = (depotVerts[i].y + depotVerts[ni].y) * 0.5;
      // Vertical panel seam
      ctx.strokeStyle = `rgba(0,0,0,${0.1 + bright * 0.05})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(depotBot.x + mx, depotBot.y + my);
      ctx.lineTo(depotTop.x + mx, depotTop.y + my);
      ctx.stroke();
      // Rivet grid (4 corners + 2 mid-edges)
      const rivetCol =
        level >= 3
          ? `rgba(201,162,39,${0.4 + bright * 0.3})`
          : `rgba(130,130,140,${0.35 + bright * 0.25})`;
      ctx.fillStyle = rivetCol;
      const rivetPositions = [
        [0.15, 0.15],
        [0.85, 0.15],
        [0.15, 0.85],
        [0.85, 0.85],
        [0.5, 0.12],
        [0.5, 0.88],
      ];
      for (const [ru, rv] of rivetPositions) {
        const rPt = depotFacePt(ru, rv);
        ctx.beginPath();
        ctx.arc(rPt.x, rPt.y, (level >= 3 ? 0.7 : 0.6) * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
      // Access hatch (recessed rectangle)
      if (i % 2 === 0) {
        const hPt = depotFacePt(0.5, 0.55);
        const hW = 2.5 * zoom;
        const hH = 2 * zoom;
        ctx.fillStyle = `rgba(${Math.max(0, dr - 15)},${Math.max(0, dg - 12)},${Math.max(0, db - 8)},0.6)`;
        ctx.fillRect(hPt.x - hW, hPt.y - hH, hW * 2, hH * 2);
        ctx.strokeStyle = `rgba(0,0,0,${0.15 + bright * 0.08})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.strokeRect(hPt.x - hW, hPt.y - hH, hW * 2, hH * 2);
        // Hatch handle
        ctx.strokeStyle =
          level >= 3
            ? `rgba(201,162,39,${0.3 + bright * 0.2})`
            : `rgba(120,120,130,${0.3 + bright * 0.2})`;
        ctx.lineWidth = 0.7 * zoom;
        ctx.beginPath();
        ctx.moveTo(hPt.x - hW * 0.3, hPt.y);
        ctx.lineTo(hPt.x + hW * 0.3, hPt.y);
        ctx.stroke();
      }
      // Ventilation slits (L2+)
      if (i % 3 === 1) {
        ctx.fillStyle = `rgba(0,0,0,${0.2 + bright * 0.1})`;
        for (let vs = 0; vs < 3; vs++) {
          const vPt = depotFacePt(0.2 + vs * 0.3, 0.78);
          ctx.fillRect(
            vPt.x - 0.8 * zoom,
            vPt.y - 0.3 * zoom,
            1.6 * zoom,
            0.6 * zoom,
          );
        }
      }
    }
    // L3: gold accent corner rivets at depot vertices
    if (level >= 3) {
      ctx.fillStyle = `rgba(201,162,39,${0.45 + bright * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        depotTop.x + depotVerts[i].x * 0.97,
        depotTop.y + depotVerts[i].y * 0.97 + 1 * zoom,
        0.7 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Gold highlight dot
      ctx.fillStyle = `rgba(240,210,90,${0.25 + bright * 0.15})`;
      ctx.beginPath();
      ctx.arc(
        depotTop.x + depotVerts[i].x * 0.97 - 0.15 * zoom,
        depotTop.y + depotVerts[i].y * 0.97 + 1 * zoom - 0.15 * zoom,
        0.3 * zoom,
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
    const cSize = 6 - c;
    const cH = 5;
    drawIsometricPrism(
      ctx,
      crateX,
      crateY,
      cSize,
      cSize,
      cH,
      {
        top: c === 0 ? "#5a6a3a" : "#4a5a32",
        left: c === 0 ? "#4a5a2a" : "#3a4a22",
        right: "#3a4a1a",
      },
      zoom,
    );

    const cW = cSize * zoom * 0.5; // half-width in screen space
    const cD = cSize * zoom * 0.25; // half-depth in screen space
    const cHp = cH * zoom;

    // Iron corner straps (diagonal lines on front-right face)
    ctx.strokeStyle = "rgba(60,55,40,0.5)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(crateX + cW, crateY - cHp * 0.15);
    ctx.lineTo(crateX + cW, crateY - cHp * 0.85);
    ctx.stroke();

    // Horizontal iron band across front-right face
    ctx.strokeStyle = "rgba(80,75,55,0.45)";
    ctx.lineWidth = 1.2 * zoom;
    const bandY = crateY - cHp * 0.5;
    ctx.beginPath();
    ctx.moveTo(crateX, bandY + cD);
    ctx.lineTo(crateX + cW, bandY);
    ctx.stroke();

    // Stencil marking (colored label)
    const labelColor = isMissile ? "#cc2200" : isEmber ? "#ff6600" : "#ffaa00";
    ctx.fillStyle = labelColor;
    const labelCx = crateX + cW * 0.5;
    const labelCy = crateY - cHp * 0.65 + cD * 0.25;
    ctx.fillRect(
      labelCx - 1.5 * zoom,
      labelCy - 0.6 * zoom,
      3 * zoom,
      1.2 * zoom,
    );

    // Wood plank lines on front-left face
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 0.4 * zoom;
    for (let pl = 1; pl <= 2; pl++) {
      const plY = crateY - cHp * (pl / 3);
      ctx.beginPath();
      ctx.moveTo(crateX - cW, plY);
      ctx.lineTo(crateX, plY + cD);
      ctx.stroke();
    }

    // Corner rivets
    ctx.fillStyle = "rgba(100,95,75,0.6)";
    const rivetR = 0.5 * zoom;
    for (const ry of [0.12, 0.88]) {
      ctx.beginPath();
      ctx.arc(crateX + cW * 0.9, crateY - cHp * ry, rivetR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== PROPELLANT TANKS (level 2+, isometric cylinders) ==========
  if (level >= 2) {
    for (let t = 0; t < Math.min(level - 1, 2); t++) {
      const tankAngle = -Math.PI * 0.35 - t * 0.5;
      const tankR = depotR * 0.75;
      const tankX = screenPos.x + Math.cos(tankAngle) * tankR;
      const tankY = depotBot.y + Math.sin(tankAngle) * tankR * ISO_Y_RATIO;
      const tRx = 4 * zoom;
      const tRy = tRx * ISO_Y_RATIO;
      const tH = 7 * zoom;

      // Cylinder body (gradient for volume)
      const tankGrad = ctx.createLinearGradient(tankX - tRx, 0, tankX + tRx, 0);
      tankGrad.addColorStop(0, t === 0 ? "#3a1a0a" : "#2a2a1a");
      tankGrad.addColorStop(0.35, t === 0 ? "#6a3a1a" : "#5a4a32");
      tankGrad.addColorStop(0.65, t === 0 ? "#5a2a14" : "#4a3a2a");
      tankGrad.addColorStop(1, t === 0 ? "#2a1008" : "#1a1a0a");
      ctx.fillStyle = tankGrad;
      ctx.beginPath();
      ctx.ellipse(tankX, tankY, tRx, tRy, 0, 0, Math.PI);
      ctx.lineTo(tankX - tRx, tankY - tH);
      ctx.ellipse(tankX, tankY - tH, tRx, tRy, 0, Math.PI, 0, true);
      ctx.closePath();
      ctx.fill();

      // Top cap (ellipse with highlight)
      const capGrad = ctx.createRadialGradient(
        tankX - 0.5 * zoom,
        tankY - tH - 0.5 * zoom,
        0,
        tankX,
        tankY - tH,
        tRx,
      );
      capGrad.addColorStop(0, t === 0 ? "#7a4a2a" : "#6a5a3a");
      capGrad.addColorStop(0.7, t === 0 ? "#5a2a14" : "#4a3a28");
      capGrad.addColorStop(1, t === 0 ? "#3a1a0a" : "#2a2a18");
      ctx.fillStyle = capGrad;
      ctx.beginPath();
      ctx.ellipse(tankX, tankY - tH, tRx, tRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Metal band rings
      ctx.strokeStyle = t === 0 ? "#8a5a3a" : "#6a5a42";
      ctx.lineWidth = 0.8 * zoom;
      for (const bandFrac of [0.25, 0.75]) {
        const bY = tankY - tH * bandFrac;
        ctx.beginPath();
        ctx.ellipse(tankX, bY, tRx * 1.02, tRy * 1.02, 0, 0, Math.PI);
        ctx.stroke();
      }

      // Pressure valve cap on top
      ctx.fillStyle = t === 0 ? "#cc4400" : "#aa6600";
      ctx.beginPath();
      ctx.ellipse(
        tankX + 1.5 * zoom,
        tankY - tH - 0.5 * zoom,
        1.2 * zoom,
        0.7 * zoom,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = t === 0 ? "#ff6620" : "#cc8830";
      ctx.beginPath();
      ctx.arc(
        tankX + 1.5 * zoom,
        tankY - tH - 0.5 * zoom,
        0.5 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Feed hose to depot
      ctx.strokeStyle = "#5a4a3a";
      ctx.lineWidth = 1.2 * zoom;
      ctx.setLineDash([2 * zoom, 1.5 * zoom]);
      ctx.beginPath();
      ctx.moveTo(tankX, tankY - tH);
      ctx.quadraticCurveTo(
        tankX + (screenPos.x - tankX) * 0.3,
        tankY - tH - 4 * zoom,
        screenPos.x,
        topY + 3 * zoom,
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight stripe (cylindrical light reflection)
      ctx.strokeStyle = `rgba(255,200,140,0.08)`;
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(tankX + tRx * 0.3, tankY - 1 * zoom);
      ctx.lineTo(tankX + tRx * 0.3, tankY - tH + 1 * zoom);
      ctx.stroke();
    }
  }

  // ========== SHELL RACK ==========
  {
    const rackAngle = Math.PI * 0.75;
    const rackDist = depotR * 0.6;
    const rackX = screenPos.x + Math.cos(rackAngle) * rackDist;
    const rackY = depotBot.y + Math.sin(rackAngle) * rackDist * ISO_Y_RATIO;
    const rackW = 5;
    const rackD = 8;
    const rackH = 12;
    drawIsometricPrism(
      ctx,
      rackX,
      rackY,
      rackW,
      rackD,
      rackH,
      { top: "#4a3a28", left: "#3a2818", right: "#2a1808" },
      zoom,
    );

    // Rack shelf dividers (horizontal lines on front face)
    const rW = rackW * zoom * 0.5;
    const rD = rackD * zoom * 0.25;
    const rH = rackH * zoom;
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.5 * zoom;
    for (let div = 1; div <= 3; div++) {
      const divY = rackY - rH * (div / 4);
      ctx.beginPath();
      ctx.moveTo(rackX - rW, divY);
      ctx.lineTo(rackX, divY + rD);
      ctx.stroke();
    }

    // Shells (proper artillery rounds with casing, band, and nose cone)
    const shellCount = level + 1;
    const loadingIdx =
      timeSinceFire < 800 ? Math.floor((timeSinceFire / 800) * shellCount) : -1;
    for (let sh = 0; sh < shellCount; sh++) {
      if (sh === loadingIdx) continue;
      const shellY = rackY - (3 + sh * 3.5) * zoom;
      const sRx = 2.2 * zoom;
      const sRy = 1.3 * zoom;

      // Shell casing body (gradient for metallic volume)
      const shellGrad = ctx.createLinearGradient(
        rackX - sRx,
        shellY,
        rackX + sRx,
        shellY,
      );
      const shellBase = isMissile ? "#aa1100" : isEmber ? "#cc5500" : "#7a6a50";
      const shellLight = isMissile
        ? "#cc3322"
        : isEmber
          ? "#ee7722"
          : "#9a8a68";
      const shellDark = isMissile ? "#881100" : isEmber ? "#aa4400" : "#5a4a38";
      shellGrad.addColorStop(0, shellDark);
      shellGrad.addColorStop(0.4, shellLight);
      shellGrad.addColorStop(0.7, shellBase);
      shellGrad.addColorStop(1, shellDark);
      ctx.fillStyle = shellGrad;
      ctx.beginPath();
      ctx.ellipse(rackX, shellY, sRx, sRy, 0, 0, Math.PI * 2);
      ctx.fill();

      // Driving band (copper ring on the shell)
      ctx.strokeStyle = isMissile ? "#cc5533" : isEmber ? "#dd8844" : "#b09060";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        rackX + sRx * 0.15,
        shellY,
        sRx * 0.2,
        sRy * 0.85,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Nose cone (pointed tip, darker)
      ctx.fillStyle = isMissile ? "#661100" : isEmber ? "#884400" : "#4a4a52";
      ctx.beginPath();
      ctx.ellipse(
        rackX - sRx * 0.7,
        shellY,
        sRx * 0.35,
        sRy * 0.6,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Highlight glint
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.ellipse(
        rackX - sRx * 0.2,
        shellY - sRy * 0.3,
        sRx * 0.35,
        sRy * 0.2,
        -0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Loading arm mechanism (L2+)
    if (level >= 2 && timeSinceFire < 1200) {
      const loadT = Math.min(1, timeSinceFire / 1200);
      const armSwing =
        loadT < 0.4
          ? (loadT / 0.4) * Math.PI * 0.35
          : Math.PI * 0.35 * Math.max(0, 1 - (loadT - 0.4) / 0.6);
      const armLen = 10 * zoom;
      const pivotX = rackX + 3 * zoom;
      const pivotY = rackY - 10 * zoom;
      const armEndX = pivotX + Math.cos(-Math.PI * 0.4 + armSwing) * armLen;
      const armEndY = pivotY + Math.sin(-Math.PI * 0.4 + armSwing) * armLen;

      // Arm body (thicker with gradient)
      ctx.strokeStyle = "#6a5a4a";
      ctx.lineWidth = 2.5 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(armEndX, armEndY);
      ctx.stroke();
      // Arm highlight edge
      ctx.strokeStyle = "#8a7a6a";
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(armEndX, armEndY);
      ctx.stroke();
      ctx.lineCap = "butt";

      // Pivot bolt (beveled)
      ctx.fillStyle = "#8a8a90";
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 2 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b0b0b8";
      ctx.beginPath();
      ctx.arc(
        pivotX - 0.3 * zoom,
        pivotY - 0.3 * zoom,
        1.2 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Grabber claw at arm tip
      ctx.fillStyle = "#5a5a62";
      ctx.beginPath();
      ctx.arc(armEndX, armEndY, 1.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ========== SHELL FEEDER (conveyor from depot to turret ring) ==========
  if (level >= 2) {
    const convStartX = screenPos.x - baseW * 0.18 * zoom;
    const convStartY = depotBot.y - depotH * zoom * 0.3;
    const convEndX = screenPos.x;
    const convEndY = topY + 3 * zoom;
    const ctrlX = convStartX + 4 * zoom;
    const ctrlY = convEndY + 3 * zoom;
    const feedW = (level >= 3 ? 3.2 : 2.6) * zoom;

    // Feed tray channel (U-shaped guide rail)
    ctx.strokeStyle = level >= 3 ? "#4a4a52" : "#4a3e32";
    ctx.lineWidth = feedW + 1.2 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(convStartX, convStartY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, convEndX, convEndY);
    ctx.stroke();
    // Inner channel (lighter groove)
    ctx.strokeStyle = level >= 3 ? "#5e5e68" : "#5a4e42";
    ctx.lineWidth = feedW - 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(convStartX, convStartY);
    ctx.quadraticCurveTo(ctrlX, ctrlY, convEndX, convEndY);
    ctx.stroke();
    // Rail edge highlights
    for (const railSide of [-1, 1]) {
      ctx.strokeStyle = `rgba(${level >= 3 ? "160,160,170" : "120,110,90"},0.12)`;
      ctx.lineWidth = 0.4 * zoom;
      const railOff = railSide * feedW * 0.4;
      ctx.beginPath();
      ctx.moveTo(convStartX + railOff, convStartY);
      ctx.quadraticCurveTo(
        ctrlX + railOff,
        ctrlY,
        convEndX + railOff,
        convEndY,
      );
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    // Guide ribs along channel
    const ribCount = level >= 3 ? 5 : 3;
    for (let ri = 0; ri < ribCount; ri++) {
      const rt = (ri + 0.5) / ribCount;
      const rtInv = 1 - rt;
      const ribX =
        convStartX * rtInv * rtInv +
        2 * ctrlX * rtInv * rt +
        convEndX * rt * rt;
      const ribY =
        convStartY * rtInv * rtInv +
        2 * ctrlY * rtInv * rt +
        convEndY * rt * rt;
      ctx.fillStyle = level >= 3 ? "rgba(80,80,88,0.25)" : "rgba(60,50,40,0.2)";
      ctx.beginPath();
      ctx.arc(ribX, ribY, feedW * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shell being fed (animated travel during reload cycle)
    if (timeSinceFire < 1000) {
      const shellT = Math.min(1, timeSinceFire / 1000);
      const stInv = 1 - shellT;
      const sx =
        convStartX * stInv * stInv +
        2 * ctrlX * stInv * shellT +
        convEndX * shellT * shellT;
      const sy =
        convStartY * stInv * stInv +
        2 * ctrlY * stInv * shellT +
        convEndY * shellT * shellT;
      const tangentX =
        2 * stInv * (ctrlX - convStartX) + 2 * shellT * (convEndX - ctrlX);
      const tangentY =
        2 * stInv * (ctrlY - convStartY) + 2 * shellT * (convEndY - ctrlY);
      const shellAng = Math.atan2(tangentY, tangentX);
      const shellLen = (level >= 3 ? 2.8 : 2.2) * zoom;
      const shellRad = (level >= 3 ? 1.4 : 1.1) * zoom;

      // Shell casing body
      ctx.fillStyle = isMissile
        ? "#cc2200"
        : isEmber
          ? "#ff6600"
          : level >= 3
            ? "#c9a227"
            : "#8a7a5a";
      ctx.beginPath();
      ctx.ellipse(sx, sy, shellLen, shellRad, shellAng, 0, Math.PI * 2);
      ctx.fill();
      // Casing band
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.3 * zoom;
      ctx.stroke();
      // Shell nose cone
      const noseX = sx + Math.cos(shellAng) * shellLen * 0.8;
      const noseY = sy + Math.sin(shellAng) * shellLen * 0.8;
      ctx.fillStyle = isMissile ? "#881100" : isEmber ? "#cc4400" : "#5a5a62";
      ctx.beginPath();
      ctx.arc(noseX, noseY, shellRad * 0.65, 0, Math.PI * 2);
      ctx.fill();
      // Casing rim
      const rimX = sx - Math.cos(shellAng) * shellLen * 0.75;
      const rimY = sy - Math.sin(shellAng) * shellLen * 0.75;
      ctx.strokeStyle =
        level >= 3 ? "rgba(180,150,50,0.3)" : "rgba(100,90,70,0.25)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.arc(rimX, rimY, shellRad * 0.9, 0, Math.PI * 2);
      ctx.stroke();
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

export function isoQuadPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  hw: number,
  hh: number,
  uX: number,
  uY: number,
  vX: number,
  vY: number,
) {
  ctx.moveTo(cx - hw * uX - hh * vX, cy - hw * uY - hh * vY);
  ctx.lineTo(cx + hw * uX - hh * vX, cy + hw * uY - hh * vY);
  ctx.lineTo(cx + hw * uX + hh * vX, cy + hw * uY + hh * vY);
  ctx.lineTo(cx - hw * uX + hh * vX, cy - hw * uY + hh * vY);
  ctx.closePath();
}

function parseHexColor(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

export function drawMortarCradleArm(
  ctx: CanvasRenderingContext2D,
  p: CradleArmParams,
) {
  const {
    side,
    level,
    zoom,
    sinR,
    cosR,
    perpX,
    perpY,
    tiers,
    tierRecoils,
    totalRecoil,
    posAtFrac,
    cradleW,
    metalDark,
    metalMid,
    metalLight,
    accent,
    time,
    timeSinceFire,
  } = p;

  const hexSides = 8;
  const isoOff: IsoOffFn = (dx, dy) => ({ x: dx, y: dy * ISO_Y_RATIO });
  const sideVis = side * (-sinR + 0.5 * cosR);
  const isFront = sideVis > 0;

  const armR = (level >= 3 ? 7.5 : level >= 2 ? 6.5 : 5.5) * zoom;

  // Smoothly interpolated barrel radius at a given fractional position.
  // Linear taper from tiers[0].r to tiers[2].r avoids sharp offR jumps
  // at tier boundaries that create jarring lateral jogs in the arm.
  const barrelRAtFrac = (frac: number) => {
    const t = Math.min(1, Math.max(0, frac * 2));
    return tiers[0].r + (tiers[1].r - tiers[0].r) * t;
  };

  // L-shaped arm: vertical uprights from the base, then a sharp bend
  // inward to hug the barrel.  offR is computed from the actual barrel
  // radius + arm cross-section + a gap, with extra padding at the base
  // to create the straight vertical section.
  const armGap = (level >= 3 ? 3.5 : level >= 2 ? 3 : 2.5) * zoom;
  const trunnionFrac = 0.32;
  const trunnionRecoil = tierRecoils[0] * 0.7 + tierRecoils[1] * 0.25;
  const shelfEndFrac = 0.5;
  const shelfEndRecoil = tierRecoils[0] + tierRecoils[1] * 0.55;

  const armDefRaw = [
    {
      frac: 0.01,
      recoil: tierRecoils[0] * 0.03,
      r: armR * 1.05,
      yOff: 5 * zoom,
      pad: armGap * 1.0,
    },
    {
      frac: 0.1,
      recoil: tierRecoils[0] * 0.25,
      r: armR * 0.92,
      yOff: 0,
      pad: armGap * 1.0,
    },
    {
      frac: 0.2,
      recoil: tierRecoils[0] * 0.5,
      r: armR * 0.78,
      yOff: 0,
      pad: armGap * 0.7,
    },
    {
      frac: trunnionFrac,
      recoil: trunnionRecoil,
      r: armR * 0.55,
      yOff: 0,
      pad: armGap * 0.15,
    },
    {
      frac: 0.42,
      recoil: trunnionRecoil + (shelfEndRecoil - trunnionRecoil) * 0.5,
      r: armR * 0.4,
      yOff: 0,
      pad: 0,
    },
    {
      frac: shelfEndFrac,
      recoil: shelfEndRecoil,
      r: armR * 0.28,
      yOff: 0,
      pad: 0,
    },
  ];
  const armDef = armDefRaw.map((a) => ({
    ...a,
    offR: barrelRAtFrac(a.frac) + a.r + armGap + a.pad,
  }));

  const pts = armDef.map((a) => {
    const ap = posAtFrac(a.frac, a.recoil);
    return {
      center: {
        x: ap.x + side * perpX * a.offR,
        y: ap.y + side * perpY * a.offR + a.yOff,
      } as Pt,
      verts: generateIsoHexVertices(isoOff, a.r, hexSides),
      r: a.r,
      frac: a.frac,
      offR: a.offR,
    };
  });

  const sideNormals = computeHexSideNormals(cosR, hexSides);
  const sorted = sortSidesByDepth(sideNormals);
  const dk = parseHexColor(metalDark);
  const md = parseHexColor(metalMid);
  const lt = parseHexColor(metalLight);

  // ── BASE MOUNTING FLANGE ──
  {
    const flangeScale = 1.3;
    const flangeVerts = pts[0].verts.map((v) => ({
      x: v.x * flangeScale,
      y: v.y * flangeScale,
    }));
    const flangeH = (level >= 3 ? 3 : 2.5) * zoom;
    const flangeBot: Pt = { x: pts[0].center.x, y: pts[0].center.y + flangeH };
    const flangeTop: Pt = pts[0].center;

    for (const i of sorted) {
      const ni = (i + 1) % hexSides;
      const n = sideNormals[i];
      if (n < -0.6) continue;
      const bright = Math.max(0, Math.min(1, 0.25 + (n + 1) * 0.3));
      const fR = Math.floor(dk.r + (md.r - dk.r) * bright);
      const fG = Math.floor(dk.g + (md.g - dk.g) * bright);
      const fB = Math.floor(dk.b + (md.b - dk.b) * bright);
      ctx.fillStyle = `rgb(${fR},${fG},${fB})`;
      ctx.beginPath();
      ctx.moveTo(
        flangeBot.x + flangeVerts[i].x,
        flangeBot.y + flangeVerts[i].y,
      );
      ctx.lineTo(
        flangeBot.x + flangeVerts[ni].x,
        flangeBot.y + flangeVerts[ni].y,
      );
      ctx.lineTo(
        flangeTop.x + flangeVerts[ni].x,
        flangeTop.y + flangeVerts[ni].y,
      );
      ctx.lineTo(
        flangeTop.x + flangeVerts[i].x,
        flangeTop.y + flangeVerts[i].y,
      );
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(0,0,0,${0.1 + bright * 0.05})`;
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
    }
    drawHexCap(ctx, flangeTop, flangeVerts, metalMid, metalDark, 0.5 * zoom);

    ctx.fillStyle = accent;
    for (let fi = 0; fi < hexSides; fi++) {
      if (sideNormals[fi] < -0.2) continue;
      const ni = (fi + 1) % hexSides;
      const bx =
        flangeTop.x + (flangeVerts[fi].x + flangeVerts[ni].x) * 0.5 * 0.85;
      const by =
        flangeTop.y + (flangeVerts[fi].y + flangeVerts[ni].y) * 0.5 * 0.85;
      ctx.beginPath();
      ctx.arc(bx, by, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── BOTTOM CAP ──
  drawHexCap(
    ctx,
    pts[0].center,
    pts[0].verts,
    metalDark,
    metalDark,
    0.5 * zoom,
  );

  // ── TAPERED OCTAGONAL PRISM SEGMENTS ──
  for (let si = 0; si < pts.length - 1; si++) {
    const bot = pts[si];
    const top = pts[si + 1];
    const isBaseSeg = si === 0;
    const isTrunnionSeg = si === 2;

    for (const i of sorted) {
      const ni = (i + 1) % hexSides;
      const n = sideNormals[i];
      const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
      const fR = Math.floor(dk.r + (lt.r - dk.r) * bright);
      const fG = Math.floor(dk.g + (lt.g - dk.g) * bright);
      const fB = Math.floor(dk.b + (lt.b - dk.b) * bright);

      const faceMidX = (bot.verts[i].x + bot.verts[ni].x) * 0.5;
      const faceMidY = (bot.verts[i].y + bot.verts[ni].y) * 0.5;
      const faceGrad = ctx.createLinearGradient(
        top.center.x + faceMidX,
        top.center.y + faceMidY,
        bot.center.x + faceMidX,
        bot.center.y + faceMidY,
      );
      faceGrad.addColorStop(
        0,
        `rgb(${Math.min(255, fR + 12)},${Math.min(255, fG + 10)},${Math.min(255, fB + 8)})`,
      );
      faceGrad.addColorStop(0.4, `rgb(${fR},${fG},${fB})`);
      faceGrad.addColorStop(
        1,
        `rgb(${Math.max(0, fR - 14)},${Math.max(0, fG - 12)},${Math.max(0, fB - 10)})`,
      );

      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.moveTo(bot.center.x + bot.verts[i].x, bot.center.y + bot.verts[i].y);
      ctx.lineTo(
        bot.center.x + bot.verts[ni].x,
        bot.center.y + bot.verts[ni].y,
      );
      ctx.lineTo(
        top.center.x + top.verts[ni].x,
        top.center.y + top.verts[ni].y,
      );
      ctx.lineTo(top.center.x + top.verts[i].x, top.center.y + top.verts[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(0,0,0,${0.06 + bright * 0.08})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();

      if (n < -0.5) continue;

      // Horizontal stiffener rib on base segment
      if (isBaseSeg && n > -0.1) {
        const ribT = 0.5;
        for (const vi of [i, ni]) {
          const vLerp = {
            x: bot.verts[vi].x + (top.verts[vi].x - bot.verts[vi].x) * ribT,
            y: bot.verts[vi].y + (top.verts[vi].y - bot.verts[vi].y) * ribT,
          };
          const ribPt = {
            x: bot.center.x + (top.center.x - bot.center.x) * ribT + vLerp.x,
            y: bot.center.y + (top.center.y - bot.center.y) * ribT + vLerp.y,
          };
          if (vi === i) {
            ctx.beginPath();
            ctx.moveTo(ribPt.x, ribPt.y);
          } else {
            ctx.lineTo(ribPt.x, ribPt.y);
          }
        }
        ctx.strokeStyle = `rgba(${Math.max(0, fR - 20)},${Math.max(0, fG - 18)},${Math.max(0, fB - 16)},0.4)`;
        ctx.lineWidth = 0.8 * zoom;
        ctx.stroke();
      }

      // Highlight edge
      if (bright > 0.55) {
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + (bright - 0.55) * 0.2})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(
          bot.center.x + bot.verts[ni].x,
          bot.center.y + bot.verts[ni].y,
        );
        ctx.lineTo(
          top.center.x + top.verts[ni].x,
          top.center.y + top.verts[ni].y,
        );
        ctx.stroke();
      }

      // Rivets on base and trunnion segments
      if ((isBaseSeg || isTrunnionSeg) && n > 0) {
        const rivetCount = isBaseSeg ? 2 : 1;
        for (let ri = 0; ri < rivetCount; ri++) {
          const t = (ri + 1) / (rivetCount + 1);
          const vL = {
            x: bot.verts[i].x + (top.verts[i].x - bot.verts[i].x) * t,
            y: bot.verts[i].y + (top.verts[i].y - bot.verts[i].y) * t,
          };
          const vR = {
            x: bot.verts[ni].x + (top.verts[ni].x - bot.verts[ni].x) * t,
            y: bot.verts[ni].y + (top.verts[ni].y - bot.verts[ni].y) * t,
          };
          const cx =
            bot.center.x +
            (top.center.x - bot.center.x) * t +
            (vL.x + vR.x) * 0.5 * 0.85;
          const cy =
            bot.center.y +
            (top.center.y - bot.center.y) * t +
            (vL.y + vR.y) * 0.5 * 0.85;
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(cx, cy, 0.6 * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.15)";
          ctx.beginPath();
          ctx.arc(cx, cy, 0.25 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Band ring at segment joints
    drawHexBand(
      ctx,
      bot.verts,
      sideNormals,
      { x: bot.center.x, y: bot.center.y + 1.2 * zoom },
      { x: bot.center.x, y: bot.center.y - 1.2 * zoom },
      1.08,
      (n) => {
        const b = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
        if (level >= 3) return accent;
        return `rgb(${52 + Math.floor(b * 40)},${48 + Math.floor(b * 36)},${62 + Math.floor(b * 28)})`;
      },
      "rgba(0,0,0,0.18)",
      0.4 * zoom,
      -0.4,
    );
  }

  // ── TOP CAP ──
  const tipPt = pts[pts.length - 1];
  drawHexCap(
    ctx,
    tipPt.center,
    tipPt.verts,
    isFront ? metalLight : metalMid,
    metalDark,
    0.5 * zoom,
  );

  // ── BARREL-CONNECTING STRUTS (short bolted bars from arm shelf to barrel) ──
  {
    const strutW = (level >= 3 ? 3.5 : level >= 2 ? 3 : 2.5) * zoom;
    const strutIndices = [3, pts.length - 1];
    for (const si of strutIndices) {
      const armPt = pts[si];
      const bR = barrelRAtFrac(armDef[si].frac);
      const barrelPt = posAtFrac(armDef[si].frac, armDef[si].recoil);
      const barrelSurfX = barrelPt.x + side * perpX * (bR + 1 * zoom);
      const barrelSurfY = barrelPt.y + side * perpY * (bR + 1 * zoom);

      const strutGrad = ctx.createLinearGradient(
        armPt.center.x,
        armPt.center.y - strutW * 0.5,
        armPt.center.x,
        armPt.center.y + strutW * 0.5,
      );
      strutGrad.addColorStop(0, isFront ? metalLight : metalMid);
      strutGrad.addColorStop(0.5, metalMid);
      strutGrad.addColorStop(1, metalDark);
      ctx.strokeStyle = strutGrad;
      ctx.lineWidth = strutW;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(armPt.center.x, armPt.center.y);
      ctx.lineTo(barrelSurfX, barrelSurfY);
      ctx.stroke();
      ctx.lineCap = "butt";

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(armPt.center.x, armPt.center.y, strutW * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(barrelSurfX, barrelSurfY, strutW * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── TRUNNION PIVOT (at barrel-contact point — arm key-point 3, after bend) ──
  {
    const pivIdx = 3;
    const piv = pts[pivIdx].center;
    const pinR = (level >= 3 ? 6.5 : level >= 2 ? 5.5 : 4.5) * zoom;
    const pLen = Math.hypot(perpX, perpY) || 1;
    const pNx = perpX / pLen;
    const pNy = perpY / pLen;
    const pTx = -pNy;
    const pTy = pNx;
    const fS = 0.55;
    const fAng = Math.atan2(pTy, pTx);

    const pivHex = (r: number, a: number) => ({
      x: piv.x + (Math.cos(a) * pTx + Math.sin(a) * fS * pNx) * r,
      y: piv.y + (Math.cos(a) * pTy + Math.sin(a) * fS * pNy) * r,
    });

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(
      piv.x,
      piv.y + 1.5 * zoom,
      pinR * 1.1,
      pinR * fS * 1.1,
      fAng,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Housing depth ring
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = (level >= 3 ? 4 : 3) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      piv.x,
      piv.y + 1 * zoom,
      pinR * 0.95,
      pinR * 0.95 * fS,
      fAng,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Hex housing face
    const housingGrad = ctx.createRadialGradient(
      piv.x - pTx * pinR * 0.15,
      piv.y - pTy * pinR * 0.15,
      0,
      piv.x,
      piv.y,
      pinR,
    );
    housingGrad.addColorStop(0, isFront ? metalLight : metalMid);
    housingGrad.addColorStop(0.6, metalMid);
    housingGrad.addColorStop(1, metalDark);
    ctx.fillStyle = housingGrad;
    ctx.beginPath();
    for (let hi = 0; hi < 6; hi++) {
      const hp = pivHex(pinR, (hi * Math.PI) / 3);
      hi === 0 ? ctx.moveTo(hp.x, hp.y) : ctx.lineTo(hp.x, hp.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();

    // Inset face plate
    ctx.fillStyle = isFront ? metalMid : metalDark;
    ctx.beginPath();
    for (let hi = 0; hi < 6; hi++) {
      const hp = pivHex(pinR * 0.78, (hi * Math.PI) / 3);
      hi === 0 ? ctx.moveTo(hp.x, hp.y) : ctx.lineTo(hp.x, hp.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.stroke();

    // Bearing race
    ctx.strokeStyle = accent;
    ctx.lineWidth = (level >= 3 ? 1.6 : 1.1) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      piv.x,
      piv.y,
      pinR * 0.55,
      pinR * 0.55 * fS,
      fAng,
      0,
      Math.PI * 2,
    );
    ctx.stroke();

    // Ball bearings (L2+)
    if (level >= 2) {
      const bearingCount = level >= 3 ? 8 : 6;
      for (let bi = 0; bi < bearingCount; bi++) {
        const ba = (bi / bearingCount) * Math.PI * 2 + time * 0.3;
        const bp = pivHex(pinR * 0.55, ba);
        ctx.fillStyle = level >= 3 ? "#d0c060" : "#b0b0b8";
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 0.65 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.beginPath();
        ctx.arc(
          bp.x - 0.2 * zoom,
          bp.y - 0.2 * zoom,
          0.25 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }

    // Pin shaft
    const shaftGrad = ctx.createRadialGradient(
      piv.x - pTx * pinR * 0.05,
      piv.y - pTy * pinR * 0.05,
      0,
      piv.x,
      piv.y,
      pinR * 0.35,
    );
    shaftGrad.addColorStop(0, level >= 3 ? "#f0d860" : "#d0d0d8");
    shaftGrad.addColorStop(0.5, level >= 3 ? "#e8c840" : "#b0b0b8");
    shaftGrad.addColorStop(1, level >= 3 ? "#a08020" : "#808088");
    ctx.fillStyle = shaftGrad;
    ctx.beginPath();
    ctx.ellipse(
      piv.x,
      piv.y,
      pinR * 0.3,
      pinR * 0.3 * fS,
      fAng,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Keyway slot
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 0.9 * zoom;
    ctx.beginPath();
    ctx.moveTo(piv.x - pTx * pinR * 0.14, piv.y - pTy * pinR * 0.14);
    ctx.lineTo(piv.x + pTx * pinR * 0.14, piv.y + pTy * pinR * 0.14);
    ctx.stroke();

    // Specular highlight
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.ellipse(
      piv.x - pTx * pinR * 0.08 - pNx * pinR * 0.04,
      piv.y - pTy * pinR * 0.08 - pNy * pinR * 0.04,
      pinR * 0.1,
      pinR * 0.06,
      fAng,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Corner bolts
    ctx.fillStyle = accent;
    for (let hi = 0; hi < 6; hi++) {
      const bp = pivHex(pinR * 0.72, (hi * Math.PI) / 3);
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, 0.75 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.12)";
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, 0.3 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = accent;
    }

    // Grease fitting (L2+)
    if (level >= 2) {
      const gfP = pivHex(pinR * 0.88, Math.PI * 0.25);
      ctx.fillStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
      ctx.beginPath();
      ctx.arc(gfP.x, gfP.y, 0.7 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = level >= 3 ? "#e0c040" : "#b0b0b8";
      ctx.beginPath();
      ctx.arc(gfP.x, gfP.y - 0.7 * zoom, 0.45 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── HYDRAULIC CYLINDER (L2+) ──
  if (level >= 2) {
    const hydOff = side * 3 * zoom;
    const hydBase: Pt = {
      x: pts[0].center.x + perpX * hydOff,
      y: pts[0].center.y + perpY * hydOff - 0.5 * zoom,
    };
    const hydEnd: Pt = {
      x: pts[4].center.x + perpX * hydOff * 0.7,
      y: pts[4].center.y + perpY * hydOff * 0.7,
    };
    const recoilPhase = timeSinceFire < 800 ? 1 - timeSinceFire / 800 : 0;
    const hydSplit = 0.45 + recoilPhase * 0.08;
    const hydMid: Pt = {
      x: hydBase.x + (hydEnd.x - hydBase.x) * hydSplit,
      y: hydBase.y + (hydEnd.y - hydBase.y) * hydSplit,
    };
    const cylW = (level >= 3 ? 3.5 : 2.8) * zoom;
    const rodW = cylW * 0.5;
    const cylAng = Math.atan2(hydEnd.y - hydBase.y, hydEnd.x - hydBase.x);
    const cylNx = Math.cos(cylAng + Math.PI * 0.5);
    const cylNy = Math.sin(cylAng + Math.PI * 0.5);

    const cylGrad = ctx.createLinearGradient(
      hydBase.x - cylNx * cylW,
      hydBase.y - cylNy * cylW,
      hydBase.x + cylNx * cylW,
      hydBase.y + cylNy * cylW,
    );
    cylGrad.addColorStop(0, metalDark);
    cylGrad.addColorStop(0.3, isFront ? metalLight : metalMid);
    cylGrad.addColorStop(0.7, metalMid);
    cylGrad.addColorStop(1, metalDark);
    ctx.strokeStyle = cylGrad;
    ctx.lineWidth = cylW;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(hydBase.x, hydBase.y);
    ctx.lineTo(hydMid.x, hydMid.y);
    ctx.stroke();

    ctx.strokeStyle = level >= 3 ? "#d0c840" : "#c0c0c8";
    ctx.lineWidth = rodW;
    ctx.beginPath();
    ctx.moveTo(hydMid.x, hydMid.y);
    ctx.lineTo(hydEnd.x, hydEnd.y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = rodW * 0.25;
    ctx.beginPath();
    ctx.moveTo(hydMid.x + cylNx * rodW * 0.2, hydMid.y + cylNy * rodW * 0.2);
    ctx.lineTo(hydEnd.x + cylNx * rodW * 0.2, hydEnd.y + cylNy * rodW * 0.2);
    ctx.stroke();
    ctx.lineCap = "butt";

    ctx.fillStyle = "rgba(20,20,25,0.45)";
    ctx.beginPath();
    ctx.ellipse(
      hydMid.x,
      hydMid.y,
      cylW * 0.5,
      cylW * 0.32,
      cylAng,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = metalDark;
    ctx.beginPath();
    ctx.arc(hydBase.x, hydBase.y, cylW * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = metalMid;
    ctx.beginPath();
    ctx.arc(hydBase.x, hydBase.y, cylW * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(hydEnd.x, hydEnd.y, 1.1 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.beginPath();
    ctx.arc(
      hydEnd.x - 0.2 * zoom,
      hydEnd.y - 0.2 * zoom,
      0.35 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = isFront ? metalMid : metalDark;
    const brkW = 2.5 * zoom;
    const brkH = 1.5 * zoom;
    ctx.fillRect(hydBase.x - brkW, hydBase.y - brkH, brkW * 2, brkH * 2);
    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.strokeRect(hydBase.x - brkW, hydBase.y - brkH, brkW * 2, brkH * 2);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(hydBase.x, hydBase.y, 0.8 * zoom, 0, Math.PI * 2);
    ctx.fill();

    if (level >= 3) {
      for (const ls of [-1, 1]) {
        const lsx =
          hydBase.x + (hydMid.x - hydBase.x) * 0.7 + ls * cylNx * cylW * 0.5;
        const lsy =
          hydBase.y + (hydMid.y - hydBase.y) * 0.7 + ls * cylNy * cylW * 0.5;
        ctx.strokeStyle = "#2a2a2a";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(lsx, lsy);
        ctx.quadraticCurveTo(
          lsx + ls * 2 * zoom,
          lsy + 3 * zoom,
          lsx + ls * 1 * zoom,
          lsy + 5 * zoom,
        );
        ctx.stroke();
        ctx.fillStyle = "#5a5a62";
        ctx.beginPath();
        ctx.arc(lsx, lsy, 0.55 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ── DIAGONAL BRACE (L2+) ──
  if (level >= 2) {
    const brOff = side * -1.5 * zoom;
    const brStart: Pt = {
      x:
        pts[0].center.x +
        perpX * brOff +
        (pts[1].center.x - pts[0].center.x) * 0.3,
      y:
        pts[0].center.y +
        perpY * brOff +
        (pts[1].center.y - pts[0].center.y) * 0.3,
    };
    const brEnd: Pt = {
      x:
        pts[3].center.x +
        (pts[4].center.x - pts[3].center.x) * 0.5 +
        perpX * brOff,
      y:
        pts[3].center.y +
        (pts[4].center.y - pts[3].center.y) * 0.5 +
        perpY * brOff,
    };
    ctx.strokeStyle = level >= 3 ? "#6a6a72" : "#5a5a68";
    ctx.lineWidth = (level >= 3 ? 2 : 1.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(brStart.x, brStart.y);
    ctx.lineTo(brEnd.x, brEnd.y);
    ctx.stroke();

    if (level >= 3) {
      const tbX = (brStart.x + brEnd.x) * 0.5;
      const tbY = (brStart.y + brEnd.y) * 0.5;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.ellipse(
        tbX,
        tbY,
        2 * zoom,
        1.2 * zoom,
        Math.atan2(brEnd.y - brStart.y, brEnd.x - brStart.x),
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = metalDark;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
    }

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(brStart.x, brStart.y, 0.9 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(brEnd.x, brEnd.y, 0.9 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── STATUS LIGHT (L2+) ──
  if (level >= 2) {
    const lightPt: Pt = {
      x: pts[0].center.x + (pts[1].center.x - pts[0].center.x) * 0.45,
      y:
        pts[0].center.y +
        (pts[1].center.y - pts[0].center.y) * 0.45 -
        1.5 * zoom,
    };
    const isFlash = timeSinceFire < 400;
    ctx.fillStyle = "#2a2a30";
    ctx.beginPath();
    ctx.arc(lightPt.x, lightPt.y, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isFlash
      ? level >= 3
        ? "#ff4400"
        : "#ff8800"
      : level >= 3
        ? "#44aa44"
        : "#448844";
    ctx.beginPath();
    ctx.arc(lightPt.x, lightPt.y, 1 * zoom, 0, Math.PI * 2);
    ctx.fill();
    if (isFlash) {
      ctx.fillStyle = `rgba(255,${level >= 3 ? 68 : 136},0,0.15)`;
      ctx.beginPath();
      ctx.arc(lightPt.x, lightPt.y, 3.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
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

  // Barrel-axis direction in screen space (normalized)
  const bLen = Math.hypot(maxTiltX, -totalH + maxTiltY);
  const bAx = bLen > 0 ? maxTiltX / bLen : 0;
  const bAy = bLen > 0 ? (-totalH + maxTiltY) / bLen : -1;
  // Perpendicular to barrel axis on screen (90° CCW)
  const bNx = -bAy;
  const bNy = bAx;

  // Isometric depth for an offset direction: matches the camera model
  // used by computeHexSideNormals (cos(a) * cosR + 0.5 * sin(a)).
  // Positive = closer to camera (draw later), negative = farther (draw earlier).
  const isoDepthOfAngle = (a: number) => Math.cos(a) + 0.5 * Math.sin(a);
  // Which perpendicular side is closer to the camera?
  const perpAngle = Math.atan2(cosR, -sinR);
  const perpDepth = isoDepthOfAngle(perpAngle);
  // side that is NEARER to camera (draw later):  sign matches perpDepth sign
  const nearSide = perpDepth >= 0 ? 1 : -1;
  const farSide = -nearSide;

  // ===== QUADPOD / TRIPOD SUPPORTS =====
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

  // Sort legs by isometric depth (back-to-front)
  const legDepths = legAngles.map((la) => isoDepthOfAngle(la));
  const legOrder = Array.from({ length: legCount }, (_, i) => i).sort(
    (a, b) => legDepths[a] - legDepths[b],
  );
  // Median depth for splitting back vs front (legs behind barrel vs in front)
  const medianDepth = legDepths[legOrder[Math.floor(legCount / 2)]];

  // Helper to draw a single leg (extracted for split back/front rendering)
  const drawLeg = (li: number) => {
    const la = legAngles[li];
    const footX = Math.cos(la) * baseR;
    const footY = Math.sin(la) * baseR * ISO_Y_RATIO + 4 * zoom;
    const kneeX = (footX + attachPt.x) * (level >= 2 ? 0.45 : 0.5);
    const kneeY = (footY + attachPt.y) * (level >= 2 ? 0.55 : 0.6);

    ctx.strokeStyle =
      level >= 3 ? "#484050" : level >= 2 ? "#3e424e" : "#444448";
    ctx.lineWidth = legThick * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(footX, footY);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    ctx.strokeStyle =
      level >= 3 ? "#6a6270" : level >= 2 ? "#586068" : "#606066";
    ctx.lineWidth = rodThick * zoom;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(attachPt.x + (li % 2 === 0 ? -3 : 3) * zoom, attachPt.y);
    ctx.stroke();

    ctx.fillStyle = level >= 3 ? "#484050" : level >= 2 ? "#3e4248" : "#444448";
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

    ctx.fillStyle = level >= 3 ? "#6a6270" : level >= 2 ? "#5a5e68" : "#585860";
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, (level >= 2 ? 2.8 : 2) * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = level >= 3 ? "#9a9098" : level >= 2 ? "#8a8e96" : "#78787e";
    ctx.beginPath();
    ctx.arc(kneeX, kneeY, (level >= 2 ? 1.2 : 0.8) * zoom, 0, Math.PI * 2);
    ctx.fill();

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

    if (level >= 2) {
      const shockX = (footX + kneeX) * 0.55;
      const shockY = (footY + kneeY) * 0.55;
      const shockEndX = (kneeX + attachPt.x) * 0.6;
      const shockEndY = (kneeY + attachPt.y) * 0.6;
      const shockMidX = (shockX + shockEndX) * 0.5;
      const shockMidY = (shockY + shockEndY) * 0.5;
      const shockAng = Math.atan2(shockEndY - shockY, shockEndX - shockX);
      const sNx = -Math.sin(shockAng);
      const sNy = Math.cos(shockAng);
      const cylR = (level >= 3 ? 2.8 : 2.4) * zoom;
      const sCylGrad = ctx.createLinearGradient(
        shockX + sNx * cylR,
        shockY + sNy * cylR,
        shockX - sNx * cylR,
        shockY - sNy * cylR,
      );
      sCylGrad.addColorStop(0, "#5a5a62");
      sCylGrad.addColorStop(0.3, "#8a8a92");
      sCylGrad.addColorStop(0.5, "#7a7a82");
      sCylGrad.addColorStop(1, "#4a4a52");
      ctx.strokeStyle = sCylGrad;
      ctx.lineWidth = cylR;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(shockX, shockY);
      ctx.lineTo(shockMidX, shockMidY);
      ctx.stroke();
      const rodGrd = ctx.createLinearGradient(
        shockMidX + sNx * cylR * 0.5,
        shockMidY + sNy * cylR * 0.5,
        shockMidX - sNx * cylR * 0.5,
        shockMidY - sNy * cylR * 0.5,
      );
      rodGrd.addColorStop(0, "#9898a0");
      rodGrd.addColorStop(0.35, "#d0d0d8");
      rodGrd.addColorStop(0.5, "#e0e0e4");
      rodGrd.addColorStop(0.65, "#c8c8d0");
      rodGrd.addColorStop(1, "#8888a0");
      ctx.strokeStyle = rodGrd;
      ctx.lineWidth = (level >= 3 ? 1.4 : 1.1) * zoom;
      ctx.beginPath();
      ctx.moveTo(shockMidX, shockMidY);
      ctx.lineTo(shockEndX, shockEndY);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(shockMidX + sNx * 0.3 * zoom, shockMidY + sNy * 0.3 * zoom);
      ctx.lineTo(shockEndX + sNx * 0.3 * zoom, shockEndY + sNy * 0.3 * zoom);
      ctx.stroke();
      ctx.lineCap = "butt";
      ctx.fillStyle = "#4a4a52";
      ctx.beginPath();
      ctx.arc(shockX, shockY, cylR * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#5a5a60";
      ctx.beginPath();
      ctx.arc(shockEndX, shockEndY, 0.9 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }

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
    ctx.lineCap = "butt";
  };

  // Draw BACK legs (farther from camera) first
  for (const li of legOrder) {
    if (legDepths[li] < medianDepth) drawLeg(li);
  }

  // L3: stabilizer ring (draw between back legs and barrel)
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

    // Carriage rails — draw far rail first, near rail second for correct layering
    for (const side of [farSide, nearSide]) {
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
      const shade = side === nearSide ? metalLight : metalMid;
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
      ctx.fillStyle = side === nearSide ? metalMid : metalDark;
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
    for (const side of [farSide, nearSide]) {
      const bracketX = trunPt.x + side * perpX * carrW * 0.85;
      const bracketY = trunPt.y + side * perpY * carrW * 0.85;
      const bracketW = (level >= 3 ? 6 : level >= 2 ? 5 : 4) * zoom;
      const bracketH = (level >= 3 ? 8 : level >= 2 ? 7 : 6) * zoom;

      // Cheek plate (trapezoidal, thicker at base)
      ctx.fillStyle = side === nearSide ? metalLight : metalMid;
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
      ctx.fillStyle = side === nearSide ? metalMid : metalDark;
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
      for (const side of [farSide, nearSide]) {
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
    const metalDarkB =
      level >= 3 ? "#28242e" : level >= 2 ? "#262a32" : "#2c2c30";
    const metalMidB =
      level >= 3 ? "#48424e" : level >= 2 ? "#3e4450" : "#484850";
    const metalLightB =
      level >= 3 ? "#6a6270" : level >= 2 ? "#5a6270" : "#606068";
    const accentB = level >= 3 ? "#c9a227" : level >= 2 ? "#8a4428" : "#6a3a28";
    const totalRecoilEst = tierRecoils[0] + tierRecoils[1] + tierRecoils[2];
    drawMortarCradleArm(ctx, {
      side: farSide,
      level,
      zoom,
      sinR,
      cosR,
      perpX: -sinR,
      perpY: cosR * ISO_Y_RATIO,
      tiers,
      tierRecoils,
      totalRecoil: totalRecoilEst,
      posAtFrac,
      cradleW,
      cradleThick,
      metalDark: metalDarkB,
      metalMid: metalMidB,
      metalLight: metalLightB,
      accent: accentB,
      time,
      timeSinceFire,
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

      // Barrel face gradient: lighter at top (illuminated), darker at bottom (shadow)
      const faceMidX = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
      const faceMidY = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
      const faceGrad = ctx.createLinearGradient(
        topCenter.x + faceMidX,
        topCenter.y + faceMidY,
        botCenter.x + faceMidX,
        botCenter.y + faceMidY,
      );
      faceGrad.addColorStop(
        0,
        `rgb(${Math.min(255, fR + 12)},${Math.min(255, fG + 10)},${Math.min(255, fB + 8)})`,
      );
      faceGrad.addColorStop(0.4, `rgb(${fR},${fG},${fB})`);
      faceGrad.addColorStop(
        1,
        `rgb(${Math.max(0, fR - 15)},${Math.max(0, fG - 12)},${Math.max(0, fB - 10)})`,
      );
      ctx.fillStyle = faceGrad;
      ctx.beginPath();
      ctx.moveTo(botCenter.x + hexVerts[i].x, botCenter.y + hexVerts[i].y);
      ctx.lineTo(botCenter.x + hexVerts[ni].x, botCenter.y + hexVerts[ni].y);
      ctx.lineTo(topCenter.x + hexVerts[ni].x, topCenter.y + hexVerts[ni].y);
      ctx.lineTo(topCenter.x + hexVerts[i].x, topCenter.y + hexVerts[i].y);
      ctx.closePath();
      ctx.fill();
      // Edge lines with variable opacity based on facing
      ctx.strokeStyle = `rgba(0,0,0,${0.1 + bright * 0.08})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.stroke();

      // Heat tint on barrel faces (subtle orange toward the muzzle end)
      if (ti >= 1) {
        const heatTint =
          (ti / 3) *
          (0.04 +
            (timeSinceFire < 3000 ? (1 - timeSinceFire / 3000) * 0.08 : 0));
        if (heatTint > 0.01) {
          ctx.fillStyle = `rgba(255,80,20,${heatTint})`;
          ctx.beginPath();
          ctx.moveTo(botCenter.x + hexVerts[i].x, botCenter.y + hexVerts[i].y);
          ctx.lineTo(
            botCenter.x + hexVerts[ni].x,
            botCenter.y + hexVerts[ni].y,
          );
          ctx.lineTo(
            topCenter.x + hexVerts[ni].x,
            topCenter.y + hexVerts[ni].y,
          );
          ctx.lineTo(topCenter.x + hexVerts[i].x, topCenter.y + hexVerts[i].y);
          ctx.closePath();
          ctx.fill();
        }
      }

      if (n < -0.85) continue;

      // Face interpolation helper
      const barrelFacePt = (u: number, v: number) => ({
        x:
          botCenter.x +
          hexVerts[i].x * (1 - u) +
          hexVerts[ni].x * u +
          (topCenter.x - botCenter.x) * v,
        y:
          botCenter.y +
          hexVerts[i].y * (1 - u) +
          hexVerts[ni].y * u +
          (topCenter.y - botCenter.y) * v,
      });

      // L1: Cast iron — sand-casting texture, sprue marks, heavy bolt heads
      if (level === 1) {
        const mx = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
        const my = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
        // Casting seam (vertical)
        ctx.strokeStyle = `rgba(0,0,0,${0.13 + bright * 0.06})`;
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(botCenter.x + mx, botCenter.y + my);
        ctx.lineTo(topCenter.x + mx, topCenter.y + my);
        ctx.stroke();
        // Sand-casting pitting texture (irregular dots)
        const pitSeed = ti * 37 + i * 13;
        ctx.fillStyle = `rgba(0,0,0,${0.04 + bright * 0.03})`;
        for (let p = 0; p < 4; p++) {
          const pu = ((pitSeed * (p + 1) * 7) % 100) / 100;
          const pv = ((pitSeed * (p + 3) * 11) % 100) / 100;
          const pt = barrelFacePt(pu, pv);
          ctx.beginPath();
          ctx.arc(
            pt.x,
            pt.y,
            (0.2 + ((pitSeed * p) % 5) * 0.1) * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        // Surface scratch lines (machining marks)
        ctx.strokeStyle = `rgba(80,80,90,${0.05 + bright * 0.04})`;
        ctx.lineWidth = 0.25 * zoom;
        for (let g = 0; g < 2; g++) {
          const gf = 0.3 + g * 0.35;
          const gx1 = hexVerts[i].x * (1 - gf) + hexVerts[ni].x * gf;
          const gy1 = hexVerts[i].y * (1 - gf) + hexVerts[ni].y * gf;
          ctx.beginPath();
          ctx.moveTo(botCenter.x + gx1, botCenter.y + gy1);
          ctx.lineTo(topCenter.x + gx1, topCenter.y + gy1);
          ctx.stroke();
        }
        // Heavy hex bolt heads (raised, with specular)
        ctx.fillStyle = `rgba(80,80,88,${0.45 + bright * 0.3})`;
        for (const nf of [0.25, 0.75]) {
          const bPt = barrelFacePt(0.65, nf);
          ctx.beginPath();
          ctx.arc(bPt.x, bPt.y, 0.7 * zoom, 0, Math.PI * 2);
          ctx.fill();
          // Bolt specular
          ctx.fillStyle = `rgba(160,160,170,${0.15 + bright * 0.1})`;
          ctx.beginPath();
          ctx.arc(
            bPt.x - 0.15 * zoom,
            bPt.y - 0.15 * zoom,
            0.3 * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.fillStyle = `rgba(80,80,88,${0.45 + bright * 0.3})`;
        }
      }

      // L2: Milled steel — weld beads, rivet rows, inspection stencils
      if (level === 2) {
        const mx = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
        const my = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
        // Horizontal weld bead
        const midX1 = (botCenter.x + topCenter.x) * 0.5 + hexVerts[i].x;
        const midY1 = (botCenter.y + topCenter.y) * 0.5 + hexVerts[i].y;
        const midX2 = (botCenter.x + topCenter.x) * 0.5 + hexVerts[ni].x;
        const midY2 = (botCenter.y + topCenter.y) * 0.5 + hexVerts[ni].y;
        ctx.strokeStyle = `rgba(0,0,0,${0.14 + bright * 0.06})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(midX1, midY1);
        ctx.lineTo(midX2, midY2);
        ctx.stroke();
        // Weld bead highlight
        ctx.strokeStyle = `rgba(150,155,170,${0.12 + bright * 0.08})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(midX1, midY1 - 0.6 * zoom);
        ctx.lineTo(midX2, midY2 - 0.6 * zoom);
        ctx.stroke();
        // Weld heat-affected zone (faint blue tint)
        ctx.strokeStyle = `rgba(90,70,150,${0.03 + bright * 0.02})`;
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(midX1, midY1 + 0.3 * zoom);
        ctx.lineTo(midX2, midY2 + 0.3 * zoom);
        ctx.stroke();
        // Rivet rows (top and bottom edges + center)
        ctx.fillStyle = `rgba(140,148,168,${0.5 + bright * 0.3})`;
        for (let rv = 0; rv < 3; rv++) {
          const t = (rv + 0.5) / 3;
          for (const vFrac of [0.18, 0.82]) {
            const rvPt = barrelFacePt(t, vFrac);
            ctx.beginPath();
            ctx.arc(rvPt.x, rvPt.y, 0.75 * zoom, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        // Vertical center seam
        ctx.strokeStyle = `rgba(0,0,0,${0.09 + bright * 0.05})`;
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
          ctx.strokeRect(
            markX - 1.5 * zoom,
            markY - 1 * zoom,
            3 * zoom,
            2 * zoom,
          );
        }
      }

      // L3: Masterwork barrel — polished blued steel, gold inlay, precision engraving
      if (level >= 3) {
        const fInset = 0.15;
        const bl = barrelFacePt(fInset, fInset);
        const br = barrelFacePt(1 - fInset, fInset);
        const tl = barrelFacePt(fInset, 1 - fInset);
        const tr = barrelFacePt(1 - fInset, 1 - fInset);
        // Outer bevel shadow
        ctx.strokeStyle = `rgba(0,0,0,${0.06 + bright * 0.04})`;
        ctx.lineWidth = 0.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(bl.x, bl.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(tl.x, tl.y);
        ctx.closePath();
        ctx.stroke();
        // Gold filigree inset border
        ctx.strokeStyle = `rgba(201,162,39,${0.24 + bright * 0.14})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.moveTo(bl.x, bl.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(tl.x, tl.y);
        ctx.closePath();
        ctx.stroke();
        // Center decorative gold line with diamond accents
        const cBot = barrelFacePt(0.5, 0.2);
        const cTop = barrelFacePt(0.5, 0.8);
        ctx.strokeStyle = `rgba(201,162,39,${0.18 + bright * 0.12})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.beginPath();
        ctx.moveTo(cBot.x, cBot.y);
        ctx.lineTo(cTop.x, cTop.y);
        ctx.stroke();
        // Diamond flourishes on center line
        for (const vf of [0.35, 0.65]) {
          const dp = barrelFacePt(0.5, vf);
          const ds = 1 * zoom;
          ctx.beginPath();
          ctx.moveTo(dp.x, dp.y - ds * 0.7);
          ctx.lineTo(dp.x + ds * 0.4, dp.y);
          ctx.lineTo(dp.x, dp.y + ds * 0.7);
          ctx.lineTo(dp.x - ds * 0.4, dp.y);
          ctx.closePath();
          ctx.stroke();
        }
        // Polished specular highlight (long, subtle reflection)
        ctx.strokeStyle = `rgba(255,255,255,${0.04 + bright * 0.035})`;
        ctx.lineWidth = 0.7 * zoom;
        const hlx1 = hexVerts[i].x * 0.82 + hexVerts[ni].x * 0.18;
        const hly1 = hexVerts[i].y * 0.82 + hexVerts[ni].y * 0.18;
        ctx.beginPath();
        ctx.moveTo(botCenter.x + hlx1, botCenter.y + hly1);
        ctx.lineTo(topCenter.x + hlx1, topCenter.y + hly1);
        ctx.stroke();
        // Secondary highlight (shorter, dimmer)
        ctx.strokeStyle = `rgba(255,255,255,${0.02 + bright * 0.02})`;
        ctx.lineWidth = 0.4 * zoom;
        const hlx2 = hexVerts[i].x * 0.25 + hexVerts[ni].x * 0.75;
        const hly2 = hexVerts[i].y * 0.25 + hexVerts[ni].y * 0.75;
        ctx.beginPath();
        ctx.moveTo(topCenter.x + hlx2, topCenter.y + hly2);
        ctx.lineTo(
          (botCenter.x + topCenter.x) * 0.5 + hlx2,
          (botCenter.y + topCenter.y) * 0.5 + hly2,
        );
        ctx.stroke();
        // Gold rosette rivets at face corners (with raised highlight)
        ctx.fillStyle = `rgba(201,162,39,${0.6 + bright * 0.3})`;
        for (const vIdx of [i, ni]) {
          for (const center of [topCenter, botCenter]) {
            const rx = center.x + hexVerts[vIdx].x * 0.92;
            const ry = center.y + hexVerts[vIdx].y * 0.92;
            ctx.beginPath();
            ctx.arc(rx, ry, 0.85 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(240,210,80,${0.3 + bright * 0.2})`;
            ctx.beginPath();
            ctx.arc(
              rx - 0.15 * zoom,
              ry - 0.15 * zoom,
              0.35 * zoom,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.fillStyle = `rgba(201,162,39,${0.6 + bright * 0.3})`;
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
          if (sideNormals[ri] < -0.85) continue;
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
        if (sideNormals[i] < -0.85) continue;
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
          if (sideNormals[hi] < -0.85) continue;
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
        // Injector nozzle — iso ellipse on front face
        const injAng = Math.atan2(sinR * ISO_Y_RATIO, cosR);
        ctx.fillStyle = level >= 3 ? "#7a5a3a" : "#6a4a2a";
        ctx.beginPath();
        ctx.ellipse(injX, injY, 2.8 * zoom, 1.5 * zoom, injAng, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = level >= 3 ? "#9a7a5a" : "#8a6a4a";
        ctx.lineWidth = 1 * zoom;
        ctx.stroke();
        // Feed pipe — along aim direction projected
        const aimDirX = cosR;
        const aimDirY = sinR * ISO_Y_RATIO;
        ctx.strokeStyle = "#5a4a3a";
        ctx.lineWidth = 1.2 * zoom;
        ctx.beginPath();
        ctx.moveTo(injX, injY);
        ctx.lineTo(injX + aimDirX * 8 * zoom, injY + aimDirY * 8 * zoom);
        ctx.stroke();
        // L3: second feed pipe — offset along perpendicular
        if (level >= 3) {
          const perpOX = -sinR * 2 * zoom;
          const perpOY = cosR * ISO_Y_RATIO * 2 * zoom;
          ctx.strokeStyle = "#4a3a2a";
          ctx.lineWidth = 0.8 * zoom;
          ctx.beginPath();
          ctx.moveTo(injX + perpOX, injY + perpOY);
          ctx.lineTo(
            injX + aimDirX * 6 * zoom + perpOX,
            injY + aimDirY * 6 * zoom + perpOY,
          );
          ctx.stroke();
        }
      }

      // L1: rope handle — iso projected on rear face
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
        ctx.moveTo(hx - bNx * 2 * zoom, hy - bNy * 2 * zoom);
        ctx.quadraticCurveTo(
          hx - bAx * 4 * zoom,
          hy - bAy * 4 * zoom,
          hx + bNx * 2 * zoom,
          hy + bNy * 2 * zoom,
        );
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
        // Screw shaft — along barrel axis
        const shaftEnd = {
          x: screwX - bAx * tier.h * 0.6,
          y: screwY - bAy * tier.h * 0.6,
        };
        ctx.strokeStyle = "#9a9aa0";
        ctx.lineWidth = 1.8 * zoom;
        ctx.beginPath();
        ctx.moveTo(shaftEnd.x, shaftEnd.y);
        ctx.lineTo(screwX, screwY);
        ctx.stroke();
        // Thread marks along barrel axis
        ctx.fillStyle = "#c9a227";
        for (let s = 0; s < 5; s++) {
          const t = s / 5;
          ctx.beginPath();
          ctx.arc(
            screwX + (shaftEnd.x - screwX) * t,
            screwY + (shaftEnd.y - screwY) * t,
            0.9 * zoom,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        // Handwheel at bottom — iso ellipse on barrel rear face
        const hwX = screwX;
        const hwY = screwY + tier.h * 0.65;
        const hwAng = Math.atan2(-sinR * ISO_Y_RATIO, -cosR);
        ctx.strokeStyle = "#7a7a82";
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.ellipse(hwX, hwY, 2.5 * zoom, 1.5 * zoom, hwAng, 0, Math.PI * 2);
        ctx.stroke();
      }

      // L2: side-mounted handles — iso projected along barrel axis
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
          ctx.moveTo(hx - bAx * 2 * zoom, hy - bAy * 2 * zoom);
          ctx.lineTo(hx + bAx * 2 * zoom, hy + bAy * 2 * zoom);
          ctx.stroke();
        }
      }

      // L2+: external gauge — iso ellipse on front face
      if (level >= 2 && cosR + 0.5 * sinR > -0.3) {
        const gaugePt = posAtFrac(
          botFrac + (topFrac - botFrac) * 0.7,
          cumRecoil - tierRecoils[ti] * 0.3,
        );
        const gx = gaugePt.x + cosR * tier.r * 0.85;
        const gy = gaugePt.y + sinR * tier.r * ISO_Y_RATIO * 0.85;
        const gaugeR = 2.5 * zoom;
        const gAngle = Math.atan2(sinR * ISO_Y_RATIO, cosR);
        ctx.fillStyle = "#2a2a30";
        ctx.beginPath();
        ctx.ellipse(gx, gy, gaugeR, gaugeR * 0.55, gAngle, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
        ctx.lineWidth = 0.8 * zoom;
        ctx.stroke();
        // Needle — iso projected within gauge ellipse
        const needleAngle = time * 0.5 + rot;
        const nCos = Math.cos(needleAngle);
        const nSin = Math.sin(needleAngle);
        const needleLen = 1.8 * zoom;
        ctx.strokeStyle = "#ff4400";
        ctx.lineWidth = 0.6 * zoom;
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(
          gx + (nCos * bNx + nSin * bAx) * needleLen,
          gy + (nCos * bNy + nSin * bAy) * needleLen,
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

      // L3: exhaust pipes — iso projected with barrel surface axes
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
          const pipeOutX = side * bNx;
          const pipeOutY = side * bNy;
          const tipX = epx + pipeOutX * 4 * zoom + bAx * 3 * zoom;
          const tipY = epy + pipeOutY * 4 * zoom + bAy * 3 * zoom;
          ctx.strokeStyle = "#5a5a5a";
          ctx.lineWidth = 2 * zoom;
          ctx.beginPath();
          ctx.moveTo(epx, epy);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
          // Pipe opening — iso ellipse oriented with pipe direction
          const pipeAng = Math.atan2(tipY - epy, tipX - epx);
          ctx.fillStyle = "#3a3a3a";
          ctx.beginPath();
          ctx.ellipse(
            tipX,
            tipY,
            1.5 * zoom,
            0.9 * zoom,
            pipeAng,
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
    const scopeSide = nearSide;
    const scopeVis = scopeSide * (-sinR + 0.5 * cosR);
    if (scopeVis > -0.25) {
      const mountR = tiers[1].r * 0.85;
      const scopeBaseX = scopePt.x + scopeSide * sinR * mountR;
      const scopeBaseY =
        scopePt.y - scopeSide * cosR * mountR * ISO_Y_RATIO * 0.4;

      // Scope tube geometry
      const tubeStartX = scopeBaseX + scopeSide * 3 * zoom;
      const tubeStartY = scopeBaseY - 0.5 * zoom;
      const scopeEndPt = posAtFrac(scopeFrac + 0.28, scopeRecoil * 1.1);
      const tubeEndX =
        scopeEndPt.x + scopeSide * sinR * mountR * 0.6 + cosR * 4 * zoom;
      const tubeEndY =
        scopeEndPt.y -
        scopeSide * cosR * mountR * ISO_Y_RATIO * 0.25 +
        sinR * 2 * zoom;
      const tubeAng = Math.atan2(tubeEndY - tubeStartY, tubeEndX - tubeStartX);
      const tubeNx = -Math.sin(tubeAng);
      const tubeNy = Math.cos(tubeAng);
      const tDx = Math.cos(tubeAng);
      const tDy = Math.sin(tubeAng);
      const tubeW = (level >= 3 ? 4.5 : level >= 2 ? 4 : 3) * zoom;

      // Scope mount bracket (Picatinny-style rail clamp) — isometric projected
      const outX = scopeSide * bNx;
      const outY = scopeSide * bNy;
      const bracketColor =
        level >= 3 ? "#5a5a62" : level >= 2 ? "#404868" : "#4a4a4a";
      ctx.fillStyle = bracketColor;
      ctx.beginPath();
      ctx.moveTo(scopeBaseX - 2 * zoom * bAx, scopeBaseY - 2 * zoom * bAy);
      ctx.lineTo(
        scopeBaseX + 3.5 * zoom * outX - 2 * zoom * bAx,
        scopeBaseY + 3.5 * zoom * outY - 2 * zoom * bAy,
      );
      ctx.lineTo(
        scopeBaseX + 3.5 * zoom * outX + 3.5 * zoom * bAx,
        scopeBaseY + 3.5 * zoom * outY + 3.5 * zoom * bAy,
      );
      ctx.lineTo(
        scopeBaseX + 1 * zoom * outX + 3.5 * zoom * bAx,
        scopeBaseY + 1 * zoom * outY + 3.5 * zoom * bAy,
      );
      ctx.lineTo(scopeBaseX + 1 * zoom * outX, scopeBaseY + 1 * zoom * outY);
      ctx.lineTo(scopeBaseX, scopeBaseY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
      // Bracket bevel highlight
      ctx.strokeStyle = `rgba(180,180,190,${0.08 + (level >= 3 ? 0.05 : 0)})`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        scopeBaseX + 3.5 * zoom * outX + 3.5 * zoom * bAx,
        scopeBaseY + 3.5 * zoom * outY + 3.5 * zoom * bAy,
      );
      ctx.lineTo(
        scopeBaseX + 1 * zoom * outX + 3.5 * zoom * bAx,
        scopeBaseY + 1 * zoom * outY + 3.5 * zoom * bAy,
      );
      ctx.stroke();
      // Mount cross-bolt clamp — positioned along barrel axis
      ctx.fillStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
      for (const vOff of [-1.5, 0.5]) {
        const boltX = scopeBaseX + 0.6 * zoom * outX + vOff * zoom * bAx;
        const boltY = scopeBaseY + 0.6 * zoom * outY + vOff * zoom * bAy;
        ctx.beginPath();
        ctx.arc(boltX, boltY, 0.6 * zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.25)";
        ctx.lineWidth = 0.2 * zoom;
        ctx.beginPath();
        for (let h = 0; h < 6; h++) {
          const ha = (h * Math.PI) / 3;
          const hx = boltX + Math.cos(ha) * 0.3 * zoom;
          const hy = boltY + Math.sin(ha) * 0.3 * zoom;
          h === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Scope tube shadow
      ctx.strokeStyle = "rgba(0,0,0,0.08)";
      ctx.lineWidth = tubeW + 2 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tubeStartX, tubeStartY + 1 * zoom);
      ctx.lineTo(tubeEndX, tubeEndY + 1 * zoom);
      ctx.stroke();

      // Scope tube body (gradient cylinder)
      const tubeGrad = ctx.createLinearGradient(
        tubeStartX + tubeNx * tubeW * 0.5,
        tubeStartY + tubeNy * tubeW * 0.5,
        tubeStartX - tubeNx * tubeW * 0.5,
        tubeStartY - tubeNy * tubeW * 0.5,
      );
      const tubeDark =
        level >= 3 ? "#252530" : level >= 2 ? "#1e2238" : "#252525";
      const tubeMid =
        level >= 3 ? "#3a3a45" : level >= 2 ? "#303850" : "#3a3a3a";
      const tubeLight =
        level >= 3 ? "#50505a" : level >= 2 ? "#404868" : "#4a4a4a";
      tubeGrad.addColorStop(0, tubeDark);
      tubeGrad.addColorStop(0.3, tubeLight);
      tubeGrad.addColorStop(0.55, tubeMid);
      tubeGrad.addColorStop(1, tubeDark);
      ctx.strokeStyle = tubeGrad;
      ctx.lineWidth = tubeW;
      ctx.beginPath();
      ctx.moveTo(tubeStartX, tubeStartY);
      ctx.lineTo(tubeEndX, tubeEndY);
      ctx.stroke();
      // Specular band along tube
      ctx.strokeStyle = `rgba(200,200,220,${0.1 + (level >= 3 ? 0.06 : 0)})`;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        tubeStartX + tubeNx * tubeW * 0.25,
        tubeStartY + tubeNy * tubeW * 0.25,
      );
      ctx.lineTo(
        tubeEndX + tubeNx * tubeW * 0.25,
        tubeEndY + tubeNy * tubeW * 0.25,
      );
      ctx.stroke();
      ctx.lineCap = "butt";

      // Scope rings (precision mounting bands) — iso projected parallelograms
      const ringCount = level >= 3 ? 3 : 2;
      for (let ri = 0; ri < ringCount; ri++) {
        const t = (ri + 0.5) / (ringCount + 0.5);
        const rx = tubeStartX + (tubeEndX - tubeStartX) * t;
        const ry = tubeStartY + (tubeEndY - tubeStartY) * t;
        const ringW = (level >= 3 ? 3 : 2.5) * zoom;
        const ringH = 5 * zoom;
        const rhw = ringW * 0.5;
        const rhh = ringH * 0.5;
        // Ring body gradient — along tube normal
        const ringGrad = ctx.createLinearGradient(
          rx - rhh * tubeNx,
          ry - rhh * tubeNy,
          rx + rhh * tubeNx,
          ry + rhh * tubeNy,
        );
        const ringBase =
          level >= 3 ? "#5a5a65" : level >= 2 ? "#404868" : "#4a4a4a";
        ringGrad.addColorStop(0, ringBase);
        ringGrad.addColorStop(0.5, level >= 3 ? "#6a6a72" : "#505868");
        ringGrad.addColorStop(1, ringBase);
        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        isoQuadPath(ctx, rx, ry, rhw, rhh, tDx, tDy, tubeNx, tubeNy);
        ctx.fill();
        // Ring border
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 0.35 * zoom;
        ctx.stroke();
        // Ring split line along tube direction
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.beginPath();
        ctx.moveTo(rx - rhw * tDx, ry - rhw * tDy);
        ctx.lineTo(rx + rhw * tDx, ry + rhw * tDy);
        ctx.stroke();
        // Ring screws — positioned along tube normal
        const screwColor = level >= 3 ? "#c9a227" : "#8a8a90";
        for (const nFrac of [-0.7, 0.7]) {
          const sx = rx + nFrac * rhh * tubeNx;
          const sy = ry + nFrac * rhh * tubeNy;
          ctx.fillStyle = screwColor;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.55 * zoom, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${0.08 + (level >= 3 ? 0.06 : 0)})`;
          ctx.beginPath();
          ctx.arc(sx - 0.1 * zoom, sy - 0.1 * zoom, 0.2 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Objective lens (front — multi-coated glass with AR coating reflections)
      const objR = (level >= 3 ? 3 : 2.5) * zoom;
      ctx.fillStyle = level >= 3 ? "#1a1a24" : "#121218";
      ctx.beginPath();
      ctx.ellipse(
        tubeEndX,
        tubeEndY,
        objR,
        objR * 0.65,
        tubeAng,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Anti-reflection coating shimmer (color-shifting)
      const lensPhase = time * 2.5;
      const lensR = 50 + Math.sin(lensPhase) * 50 + 50;
      const lensG = 120 + Math.sin(lensPhase + 2) * 80 + 80;
      const lensB = 180 + Math.sin(lensPhase + 4) * 40 + 40;
      const lensAlpha = 0.18 + Math.sin(lensPhase * 0.7) * 0.08;
      ctx.fillStyle = `rgba(${Math.floor(lensR)},${Math.floor(lensG)},${Math.floor(lensB)},${lensAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        tubeEndX,
        tubeEndY,
        objR * 0.75,
        objR * 0.5,
        tubeAng,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Lens rim ring
      ctx.strokeStyle =
        level >= 3 ? "rgba(100,100,110,0.3)" : "rgba(60,60,70,0.25)";
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        tubeEndX,
        tubeEndY,
        objR,
        objR * 0.65,
        tubeAng,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      // Specular highlight (crescent reflection)
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.ellipse(
        tubeEndX - 0.5 * zoom,
        tubeEndY - 0.5 * zoom,
        0.7 * zoom,
        0.45 * zoom,
        tubeAng - 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Eyepiece (rear ocular bell — stepped wider diameter)
      const eyeR = (level >= 3 ? 3 : 2.5) * zoom;
      ctx.fillStyle = level >= 3 ? "#2a2a34" : "#1a1a22";
      ctx.beginPath();
      ctx.ellipse(
        tubeStartX,
        tubeStartY,
        eyeR,
        eyeR * 0.7,
        tubeAng,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      // Rubber eye cup
      ctx.strokeStyle = "#1a1a1a";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        tubeStartX,
        tubeStartY,
        eyeR * 0.92,
        eyeR * 0.65,
        tubeAng,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      // Eye relief aperture
      ctx.fillStyle = "#060608";
      ctx.beginPath();
      ctx.ellipse(
        tubeStartX,
        tubeStartY,
        eyeR * 0.5,
        eyeR * 0.35,
        tubeAng,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // L2+: elevation turret — iso ellipse on barrel surface
      if (level >= 2) {
        const turBase = 0.4;
        const turretX =
          tubeStartX + (tubeEndX - tubeStartX) * turBase - tubeNx * 3.2 * zoom;
        const turretY =
          tubeStartY + (tubeEndY - tubeStartY) * turBase - tubeNy * 3.2 * zoom;
        const turretR = (level >= 3 ? 2.2 : 1.8) * zoom;
        const turSqueeze = 0.6;
        const turAngle = tubeAng;
        // Turret body gradient
        const turGrad = ctx.createRadialGradient(
          turretX,
          turretY,
          0,
          turretX,
          turretY,
          turretR,
        );
        turGrad.addColorStop(0, level >= 3 ? "#5a5a62" : "#444a58");
        turGrad.addColorStop(0.7, level >= 3 ? "#4a4a52" : "#3a3a48");
        turGrad.addColorStop(1, level >= 3 ? "#3a3a42" : "#2a2a38");
        ctx.fillStyle = turGrad;
        ctx.beginPath();
        ctx.ellipse(
          turretX,
          turretY,
          turretR,
          turretR * turSqueeze,
          turAngle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 0.35 * zoom;
        ctx.stroke();
        // Knurling marks (iso-projected ticks around turret ellipse)
        const tickCount = 12;
        ctx.strokeStyle = `rgba(180,180,190,${0.08 + (level >= 3 ? 0.04 : 0)})`;
        ctx.lineWidth = 0.2 * zoom;
        for (let tk = 0; tk < tickCount; tk++) {
          const ta = (tk / tickCount) * Math.PI * 2;
          const tkCos = Math.cos(ta);
          const tkSin = Math.sin(ta);
          const inR = 0.7,
            outR = 0.95;
          ctx.beginPath();
          ctx.moveTo(
            turretX +
              (tkCos * tDx - tkSin * tubeNx * turSqueeze) * turretR * inR,
            turretY +
              (tkCos * tDy - tkSin * tubeNy * turSqueeze) * turretR * inR,
          );
          ctx.lineTo(
            turretX +
              (tkCos * tDx - tkSin * tubeNx * turSqueeze) * turretR * outR,
            turretY +
              (tkCos * tDy - tkSin * tubeNy * turSqueeze) * turretR * outR,
          );
          ctx.stroke();
        }
        // Turret cap
        ctx.fillStyle = level >= 3 ? "#c9a227" : "#6a6a72";
        ctx.beginPath();
        ctx.ellipse(
          turretX,
          turretY,
          turretR * 0.35,
          turretR * 0.35 * turSqueeze,
          turAngle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        // Pointer line along tube normal
        ctx.strokeStyle = level >= 3 ? "#f0d060" : "#9a9aa0";
        ctx.lineWidth = 0.25 * zoom;
        ctx.beginPath();
        ctx.moveTo(turretX, turretY);
        ctx.lineTo(
          turretX - tubeNx * turretR * 0.35,
          turretY - tubeNy * turretR * 0.35,
        );
        ctx.stroke();

        // Windage turret — offset along tube dir and normal
        const windX = turretX + 2.2 * tDx * zoom + 1.8 * tubeNx * zoom;
        const windY = turretY + 2.2 * tDy * zoom + 1.8 * tubeNy * zoom;
        const windR = (level >= 3 ? 1.4 : 1.1) * zoom;
        ctx.fillStyle = level >= 3 ? "#4a4a55" : "#3a3a48";
        ctx.beginPath();
        ctx.ellipse(
          windX,
          windY,
          windR,
          windR * turSqueeze,
          turAngle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.18)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.stroke();
        // Windage knurling
        for (let wk = 0; wk < 8; wk++) {
          const wa = (wk / 8) * Math.PI * 2;
          const wCos = Math.cos(wa);
          const wSin = Math.sin(wa);
          ctx.strokeStyle = "rgba(180,180,190,0.06)";
          ctx.lineWidth = 0.15 * zoom;
          ctx.beginPath();
          ctx.moveTo(
            windX + (wCos * tDx - wSin * tubeNx * turSqueeze) * windR * 0.6,
            windY + (wCos * tDy - wSin * tubeNy * turSqueeze) * windR * 0.6,
          );
          ctx.lineTo(
            windX + (wCos * tDx - wSin * tubeNx * turSqueeze) * windR * 0.9,
            windY + (wCos * tDy - wSin * tubeNy * turSqueeze) * windR * 0.9,
          );
          ctx.stroke();
        }
      }

      // L3: laser rangefinder module — iso projected box below scope
      if (level >= 3) {
        const lrfFrac = 0.6;
        const lrfBaseX = tubeStartX + (tubeEndX - tubeStartX) * lrfFrac;
        const lrfBaseY = tubeStartY + (tubeEndY - tubeStartY) * lrfFrac;
        const lrfX = lrfBaseX + tubeNx * 4 * zoom;
        const lrfY = lrfBaseY + tubeNy * 4 * zoom;
        const lrfW = 6.5 * zoom;
        const lrfH = 3.2 * zoom;
        // Housing body — gradient along tube direction
        const lrfGrad = ctx.createLinearGradient(
          lrfX - lrfW * 0.5 * tDx,
          lrfY - lrfW * 0.5 * tDy,
          lrfX + lrfW * 0.5 * tDx,
          lrfY + lrfW * 0.5 * tDy,
        );
        lrfGrad.addColorStop(0, "#222228");
        lrfGrad.addColorStop(0.5, "#2e2e36");
        lrfGrad.addColorStop(1, "#1e1e24");
        ctx.fillStyle = lrfGrad;
        ctx.beginPath();
        isoQuadPath(
          ctx,
          lrfX,
          lrfY,
          lrfW * 0.5,
          lrfH * 0.5,
          tDx,
          tDy,
          tubeNx,
          tubeNy,
        );
        ctx.fill();
        // Housing border (gold accent)
        ctx.strokeStyle = "rgba(201,162,39,0.45)";
        ctx.lineWidth = 0.5 * zoom;
        ctx.stroke();
        // Mounting bracket to scope tube — projected
        ctx.fillStyle = "#3a3a42";
        ctx.beginPath();
        isoQuadPath(
          ctx,
          lrfX - tubeNx * (lrfH * 0.5 + 0.75 * zoom),
          lrfY - tubeNy * (lrfH * 0.5 + 0.75 * zoom),
          1 * zoom,
          0.75 * zoom,
          tDx,
          tDy,
          tubeNx,
          tubeNy,
        );
        ctx.fill();

        // Laser emitter aperture — offset along tube direction
        const laserPulse = 0.3 + Math.sin(time * 4) * 0.2;
        const emitterX = lrfX + lrfW * 0.35 * tDx;
        const emitterY = lrfY + lrfW * 0.35 * tDy;
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.ellipse(
          emitterX,
          emitterY,
          1 * zoom,
          0.6 * zoom,
          tubeAng,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = `rgba(255, 20, 20, ${laserPulse})`;
        ctx.beginPath();
        ctx.ellipse(
          emitterX,
          emitterY,
          0.6 * zoom,
          0.36 * zoom,
          tubeAng,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        if (laserPulse > 0.35) {
          ctx.fillStyle = `rgba(255,0,0,${(laserPulse - 0.35) * 0.3})`;
          ctx.beginPath();
          ctx.arc(emitterX, emitterY, 2.5 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }

        // Digital readout display — projected on LRF surface
        const readoutW = 3.5 * zoom;
        const readoutH = 2 * zoom;
        const readoutX = lrfX - lrfW * 0.3 * tDx;
        const readoutY = lrfY - lrfW * 0.3 * tDy;
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        isoQuadPath(
          ctx,
          readoutX,
          readoutY,
          readoutW * 0.5,
          readoutH * 0.5,
          tDx,
          tDy,
          tubeNx,
          tubeNy,
        );
        ctx.fill();
        const readGlow = 0.35 + Math.sin(time * 2) * 0.1;
        ctx.fillStyle = `rgba(0, 255, 100, ${readGlow})`;
        ctx.beginPath();
        isoQuadPath(
          ctx,
          readoutX,
          readoutY,
          readoutW * 0.45,
          readoutH * 0.4,
          tDx,
          tDy,
          tubeNx,
          tubeNy,
        );
        ctx.fill();

        // Status LED
        ctx.fillStyle =
          timeSinceFire < 1500 ? "rgba(255,100,0,0.6)" : "rgba(0,200,100,0.5)";
        ctx.beginPath();
        const ledX = lrfX - lrfW * 0.38 * tDx + lrfH * 0.28 * tubeNx;
        const ledY = lrfY - lrfW * 0.38 * tDy + lrfH * 0.28 * tubeNy;
        ctx.arc(ledX, ledY, 0.4 * zoom, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ===== BARREL BORE GLOW (inner heat that intensifies toward the top) =====
  {
    const glowIntensity = level >= 3 ? 0.35 : level >= 2 ? 0.25 : 0.15;
    const fireBoost =
      timeSinceFire < 3000 ? (1 - timeSinceFire / 3000) * 0.5 : 0;
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
      const mGrad = ctx.createRadialGradient(
        mouthPt.x,
        mouthPt.y,
        0,
        mouthPt.x,
        mouthPt.y,
        mouthR,
      );
      mGrad.addColorStop(
        0,
        `rgba(255, 200, 80, ${Math.min(mouthGlow * 0.7, 0.55)})`,
      );
      mGrad.addColorStop(
        0.3,
        `rgba(255, 140, 40, ${Math.min(mouthGlow * 0.45, 0.35)})`,
      );
      mGrad.addColorStop(
        0.6,
        `rgba(255, 80, 10, ${Math.min(mouthGlow * 0.2, 0.2)})`,
      );
      mGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.ellipse(
        mouthPt.x,
        mouthPt.y,
        mouthR,
        mouthR * 0.5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Heat shimmer effect above barrel mouth (distortion illusion via oscillating transparent blobs)
    if (totalGlow > 0.12 || timeSinceFire < 4000) {
      const shimmerStr = Math.min(
        0.05,
        totalGlow * 0.12 +
          (timeSinceFire < 4000 ? (1 - timeSinceFire / 4000) * 0.04 : 0),
      );
      const shimmerCount = level >= 3 ? 5 : level >= 2 ? 4 : 3;
      for (let si = 0; si < shimmerCount; si++) {
        const shimPhase = time * (1.5 + si * 0.4) + si * 2.7;
        const shimX = mouthPt.x + Math.sin(shimPhase) * 3 * zoom;
        const shimY =
          mouthPt.y - (3 + si * 3) * zoom + Math.cos(shimPhase * 0.7) * zoom;
        const shimR = (2 + si * 0.8) * zoom;
        ctx.fillStyle = `rgba(255,200,100,${shimmerStr * (1 - si / shimmerCount)})`;
        ctx.beginPath();
        ctx.ellipse(shimX, shimY, shimR, shimR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ===== AMMO BELT / SHELL FEED (visible chain of shells with feed tray and links) =====
  if (level >= 2 && cosR + 0.5 * sinR > -0.3) {
    const feedPt = posAtFrac(0.08, tierRecoils[0] * 0.2);
    const feedX = feedPt.x + cosR * tiers[0].r * 0.6;
    const feedY = feedPt.y + sinR * tiers[0].r * ISO_Y_RATIO * 0.6;
    const shellCount = level >= 3 ? 5 : 3;
    const shellSpacing = (level >= 3 ? 3.8 : 4.2) * zoom;
    const feedDirX = cosR;
    const feedDirY = sinR * ISO_Y_RATIO;
    const feedNormX = -feedDirY;
    const feedNormY = feedDirX;
    const trayLen = shellCount * shellSpacing + 2 * zoom;

    // Feed tray base (angled metal channel)
    const trayStartX = feedX - feedDirX * 1 * zoom;
    const trayStartY = feedY - feedDirY * 1 * zoom + 2 * zoom;
    const trayEndX = feedX + feedDirX * trayLen;
    const trayEndY =
      feedY + feedDirY * trayLen + (shellCount - 1) * 1.2 * zoom + 2 * zoom;
    ctx.strokeStyle = level >= 3 ? "#4e4e58" : "#3e3e44";
    ctx.lineWidth = (level >= 3 ? 2.2 : 1.8) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(trayStartX, trayStartY);
    ctx.lineTo(trayEndX, trayEndY);
    ctx.stroke();
    // Tray rail edges
    for (const rs of [-1, 1]) {
      ctx.strokeStyle = `rgba(${level >= 3 ? "100,100,110" : "80,80,88"},0.15)`;
      ctx.lineWidth = 0.4 * zoom;
      const ro = rs * 1.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(trayStartX + feedNormX * ro, trayStartY + feedNormY * ro);
      ctx.lineTo(trayEndX + feedNormX * ro, trayEndY + feedNormY * ro);
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    // Shell chain links (connecting links between rounds)
    const linkColor =
      level >= 3 ? "rgba(160,150,100,0.35)" : "rgba(100,100,90,0.3)";
    for (let si = 0; si < shellCount - 1; si++) {
      const lx1 =
        feedX + feedDirX * (si + 0.7) * shellSpacing + si * 0.8 * zoom;
      const ly1 =
        feedY + feedDirY * (si + 0.7) * shellSpacing + si * 1.2 * zoom;
      const lx2 =
        feedX + feedDirX * (si + 1.3) * shellSpacing + (si + 1) * 0.8 * zoom;
      const ly2 =
        feedY + feedDirY * (si + 1.3) * shellSpacing + (si + 1) * 1.2 * zoom;
      ctx.strokeStyle = linkColor;
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx1, ly1);
      ctx.lineTo(lx2, ly2);
      ctx.stroke();
    }

    // Individual shells (detailed rounds with casing, band, and ogive tip)
    for (let si = 0; si < shellCount; si++) {
      const sx = feedX + feedDirX * si * shellSpacing + si * 0.8 * zoom;
      const sy = feedY + feedDirY * si * shellSpacing + si * 1.2 * zoom;
      const shellLen = (level >= 3 ? 2.6 : 2.2) * zoom;
      const shellRad = (level >= 3 ? 1.3 : 1.1) * zoom;
      const shellAng = Math.atan2(feedNormY, feedNormX);

      // Shell casing body (brass/steel)
      const casingGrad = ctx.createLinearGradient(
        sx + feedNormX * shellRad,
        sy + feedNormY * shellRad,
        sx - feedNormX * shellRad,
        sy - feedNormY * shellRad,
      );
      const casingBase = level >= 3 ? [201, 162, 39] : [138, 122, 80];
      casingGrad.addColorStop(
        0,
        `rgb(${casingBase[0] - 30},${casingBase[1] - 20},${casingBase[2] - 10})`,
      );
      casingGrad.addColorStop(
        0.35,
        `rgb(${Math.min(255, casingBase[0] + 20)},${Math.min(255, casingBase[1] + 15)},${Math.min(255, casingBase[2] + 10)})`,
      );
      casingGrad.addColorStop(
        1,
        `rgb(${casingBase[0] - 20},${casingBase[1] - 15},${casingBase[2] - 8})`,
      );
      ctx.fillStyle = casingGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, shellLen, shellRad, shellAng, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.25 * zoom;
      ctx.stroke();

      // Driving band (copper ring near base of projectile)
      const bandX = sx + Math.cos(shellAng) * shellLen * 0.3;
      const bandY = sy + Math.sin(shellAng) * shellLen * 0.3;
      ctx.strokeStyle =
        level >= 3 ? "rgba(180,120,50,0.35)" : "rgba(140,100,60,0.3)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        bandX,
        bandY,
        0.3 * zoom,
        shellRad * 0.95,
        shellAng,
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Ogive tip (pointed nose) — iso ellipse
      const tipX = sx - Math.cos(shellAng) * shellLen * 0.7;
      const tipY = sy - Math.sin(shellAng) * shellLen * 0.7;
      const feedAng = Math.atan2(feedDirY, feedDirX);
      ctx.fillStyle = level >= 3 ? "#4a4a55" : "#5a5a60";
      ctx.beginPath();
      ctx.ellipse(
        tipX,
        tipY,
        shellRad * 0.55,
        shellRad * 0.35,
        feedAng,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Casing primer (small circle at base)
      const primerX = sx + Math.cos(shellAng) * shellLen * 0.85;
      const primerY = sy + Math.sin(shellAng) * shellLen * 0.85;
      ctx.fillStyle =
        level >= 3 ? "rgba(180,150,60,0.3)" : "rgba(120,110,80,0.25)";
      ctx.beginPath();
      ctx.arc(primerX, primerY, shellRad * 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight on casing
      ctx.fillStyle = `rgba(255,255,255,0.08)`;
      ctx.beginPath();
      ctx.ellipse(
        sx + feedNormX * shellRad * 0.3,
        sy + feedNormY * shellRad * 0.3,
        shellLen * 0.5,
        shellRad * 0.2,
        shellAng,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Feed tray stop bracket (at end of chain)
    const stopX = feedX + feedDirX * trayLen;
    const stopY = feedY + feedDirY * trayLen + shellCount * 1.2 * zoom;
    ctx.fillStyle = level >= 3 ? "#5a5a62" : "#4a4a50";
    ctx.beginPath();
    ctx.arc(stopX, stopY, 1.5 * zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.3 * zoom;
    ctx.stroke();
  }

  // ===== BARREL REINFORCING RINGS (extra hex bands between tiers) =====
  {
    const ringPositions = [0.35, 0.7];
    for (const ringFrac of ringPositions) {
      const ringRecoil = cumRecoil * ringFrac;
      const ringPt = posAtFrac(ringFrac, ringRecoil);
      const tierIdx =
        ringFrac < tiers[0].h / totalH
          ? 0
          : ringFrac < (tiers[0].h + tiers[1].h) / totalH
            ? 1
            : 2;
      const ringR = tiers[tierIdx].r * 1.04;
      const ringVerts = generateIsoHexVertices(isoOff, ringR, hexSides);
      const ringNormals = computeHexSideNormals(cosR, hexSides);
      const ringH = 1.5 * zoom;
      const ringBot: Pt = { x: ringPt.x, y: ringPt.y + ringH * 0.5 };
      const ringTop: Pt = { x: ringPt.x, y: ringPt.y - ringH * 0.5 };
      const ringColor =
        level >= 3 ? "#8a7a52" : level >= 2 ? "#606878" : "#5a5048";
      drawHexBand(
        ctx,
        ringVerts,
        ringNormals,
        ringBot,
        ringTop,
        1.0,
        (n) => {
          const b = Math.max(0, Math.min(1, 0.4 + (n + 1) * 0.3));
          const rc = parseInt(ringColor.slice(1, 3), 16);
          const gc = parseInt(ringColor.slice(3, 5), 16);
          const bc = parseInt(ringColor.slice(5, 7), 16);
          return `rgb(${Math.floor(rc * (0.6 + b * 0.4))},${Math.floor(gc * (0.6 + b * 0.4))},${Math.floor(bc * (0.6 + b * 0.4))})`;
        },
        "rgba(0,0,0,0.12)",
        0.3 * zoom,
        -0.85,
      );
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

  // ===== L2: instrument panel mounted on leg — iso projected =====
  if (level === 2 && nearSide * (-sinR + 0.5 * cosR) > -0.3) {
    const panelX = nearSide * -sinR * tiers[0].r * 1.0;
    const panelY =
      nearSide * cosR * tiers[0].r * ISO_Y_RATIO * 0.5 - totalH * 0.2;
    const pHW = 3 * zoom;
    const pHH = 2 * zoom;
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    isoQuadPath(ctx, panelX, panelY, pHW, pHH, bNx, bNy, bAx, bAy);
    ctx.fill();
    ctx.strokeStyle = "#5a5a62";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    // LED indicators — positioned along barrel-perp axis
    const colors = [
      "#00ff44",
      "#ffaa00",
      timeSinceFire < 1000 ? "#ff2200" : "#004400",
    ];
    for (let ci = 0; ci < 3; ci++) {
      const ledOff = (ci - 1) * 1.5 * zoom;
      ctx.fillStyle = colors[ci];
      ctx.beginPath();
      ctx.arc(
        panelX + ledOff * bNx,
        panelY + ledOff * bNy,
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

    for (const side of [farSide, nearSide]) {
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

  // ===== RECOIL RETURN SPRINGS (helical coils parallel to hydraulics) =====
  if (level >= 2) {
    const sPerpX = -sinR;
    const sPerpY = cosR * ISO_Y_RATIO;
    const sCarrW = tiers[0].r * (level >= 3 ? 0.85 : level >= 2 ? 0.78 : 0.7);
    const recoilCompress =
      timeSinceFire < 800 ? (1 - timeSinceFire / 800) * 0.15 : 0;
    for (const side of [farSide, nearSide]) {
      const springOX = side * sPerpX * sCarrW * 0.45;
      const springOY = side * sPerpY * sCarrW * 0.45;
      const sStartPt = posAtFrac(0.08, tierRecoils[0] * 0.15);
      const sEndPt = posAtFrac(0.3, tierRecoils[0] * 0.8);
      const coilCount = level >= 3 ? 10 : 7;
      const coilW = (level >= 3 ? 2.2 : 1.8) * zoom;
      const wireThick = (level >= 3 ? 1.0 : 0.8) * zoom;
      const springLen = Math.hypot(
        sEndPt.x - sStartPt.x,
        sEndPt.y - sStartPt.y,
      );
      const springDirX =
        springLen > 0 ? (sEndPt.x - sStartPt.x) / springLen : 0;
      const springDirY =
        springLen > 0 ? (sEndPt.y - sStartPt.y) / springLen : 0;
      const springNx = -springDirY;
      const springNy = springDirX;

      // Spring guide rod (thin center line)
      ctx.strokeStyle =
        level >= 3 ? "rgba(140,140,148,0.2)" : "rgba(100,100,110,0.15)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.beginPath();
      ctx.moveTo(sStartPt.x + springOX, sStartPt.y + springOY);
      ctx.lineTo(sEndPt.x + springOX, sEndPt.y + springOY);
      ctx.stroke();

      // Spring end caps (retention collars)
      for (const endPt of [sStartPt, sEndPt]) {
        ctx.fillStyle = level >= 3 ? "#5a5a62" : "#4a4a52";
        ctx.beginPath();
        ctx.ellipse(
          endPt.x + springOX,
          endPt.y + springOY,
          coilW * 0.55,
          coilW * 0.35,
          Math.atan2(springDirY, springDirX),
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 0.3 * zoom;
        ctx.stroke();
      }

      // Helical coils (drawn as overlapping elliptical segments for 3D feel)
      const segments = coilCount * 4;
      for (let s = 0; s <= segments; s++) {
        const t = s / segments;
        const tComp = t * (1 - recoilCompress) + recoilCompress * t * t;
        const cx = sStartPt.x + springOX + (sEndPt.x - sStartPt.x) * tComp;
        const cy = sStartPt.y + springOY + (sEndPt.y - sStartPt.y) * tComp;
        const coilAngle = t * coilCount * Math.PI * 2;
        const wobbleX = Math.sin(coilAngle) * coilW * 0.45;
        const wobbleY = Math.cos(coilAngle) * coilW * 0.25;
        const px = cx + springNx * wobbleX;
        const py = cy + springNy * wobbleX + wobbleY;

        if (s > 0) {
          const prevT = (s - 1) / segments;
          const prevTComp =
            prevT * (1 - recoilCompress) + recoilCompress * prevT * prevT;
          const prevCx =
            sStartPt.x + springOX + (sEndPt.x - sStartPt.x) * prevTComp;
          const prevCy =
            sStartPt.y + springOY + (sEndPt.y - sStartPt.y) * prevTComp;
          const prevAngle = prevT * coilCount * Math.PI * 2;
          const prevWobX = Math.sin(prevAngle) * coilW * 0.45;
          const prevWobY = Math.cos(prevAngle) * coilW * 0.25;
          const prevPx = prevCx + springNx * prevWobX;
          const prevPy = prevCy + springNy * prevWobX + prevWobY;

          // Wire brightness varies with coil phase (front vs back of helix)
          const faceFactor = Math.cos(coilAngle) * 0.5 + 0.5;
          const wireR =
            level >= 3
              ? 155 + Math.round(faceFactor * 40)
              : 120 + Math.round(faceFactor * 30);
          const wireG = wireR;
          const wireB = wireR + 8;
          ctx.strokeStyle = `rgb(${wireR},${wireG},${wireB})`;
          ctx.lineWidth = wireThick * (0.7 + faceFactor * 0.3);
          ctx.beginPath();
          ctx.moveTo(prevPx, prevPy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
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
      -0.85,
    );
    ctx.fillStyle = level >= 3 ? "#c9a227" : "#8a8a8a";
    for (let ci = 0; ci < hexSides; ci++) {
      if (collarNormals[ci] < -0.85) continue;
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

  // ===== OCTAGONAL RECOIL SPRINGS (paired, mounted on one side of barrel) =====
  {
    const springPerp = { x: -sinR, y: cosR * ISO_Y_RATIO };
    const springSide = farSide;
    const springR = (level >= 3 ? 3.5 : level >= 2 ? 3 : 2.5) * zoom;
    const springSides = 8;
    const springDk = parseHexColor(
      level >= 3 ? "#2a2832" : level >= 2 ? "#282c34" : "#2e2e32",
    );
    const springLt = parseHexColor(
      level >= 3 ? "#6a6270" : level >= 2 ? "#5a6270" : "#606068",
    );
    const springNormals = computeHexSideNormals(cosR, springSides);
    const springSorted = sortSidesByDepth(springNormals);
    const recoilCompress =
      timeSinceFire < 800 ? (1 - timeSinceFire / 800) * 0.12 : 0;

    for (let sp = 0; sp < 2; sp++) {
      const springSpacing = (sp - 0.5) * 6 * zoom;
      const springBaseOff = tiers[0].r + springR * 0.4;
      const springOffX =
        springSide *
        springPerp.x *
        (springBaseOff + springSpacing * Math.abs(springPerp.x) * 0.3);
      const springOffY =
        springSide *
        springPerp.y *
        (springBaseOff + springSpacing * Math.abs(springPerp.y) * 0.3);
      const barrelDirOff = springSpacing * bAx * 0.15;
      const barrelDirOffY = springSpacing * bAy * 0.15;

      const springBaseFrac = 0.06 + sp * 0.04;
      const springTipFrac = 0.35 + sp * 0.03 - recoilCompress;
      const springBaseRecoil = tierRecoils[0] * (0.1 + sp * 0.05);
      const springTipRecoil = tierRecoils[0] * 0.7 + tierRecoils[1] * 0.2;

      const sBase = posAtFrac(springBaseFrac, springBaseRecoil);
      const sTip = posAtFrac(springTipFrac, springTipRecoil);

      const segCount = 4;
      const springPts: { center: Pt; verts: Pt[] }[] = [];
      for (let si = 0; si <= segCount; si++) {
        const t = si / segCount;
        const cx = sBase.x + (sTip.x - sBase.x) * t + springOffX + barrelDirOff;
        const cy =
          sBase.y + (sTip.y - sBase.y) * t + springOffY + barrelDirOffY;
        const taper = 1.0 - t * 0.15;
        springPts.push({
          center: { x: cx, y: cy },
          verts: generateIsoHexVertices(isoOff, springR * taper, springSides),
        });
      }

      // Bottom cap
      drawHexCap(
        ctx,
        springPts[0].center,
        springPts[0].verts,
        level >= 3 ? "#3a3440" : "#3a3a3e",
        level >= 3 ? "#2a2430" : "#2a2a2e",
        0.4 * zoom,
      );

      // Prism segments
      for (let si = 0; si < segCount; si++) {
        const bot = springPts[si];
        const top = springPts[si + 1];
        for (const i of springSorted) {
          const ni = (i + 1) % springSides;
          const n = springNormals[i];
          const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
          const fR = Math.floor(
            springDk.r + (springLt.r - springDk.r) * bright,
          );
          const fG = Math.floor(
            springDk.g + (springLt.g - springDk.g) * bright,
          );
          const fB = Math.floor(
            springDk.b + (springLt.b - springDk.b) * bright,
          );

          ctx.fillStyle = `rgb(${fR},${fG},${fB})`;
          ctx.beginPath();
          ctx.moveTo(
            bot.center.x + bot.verts[i].x,
            bot.center.y + bot.verts[i].y,
          );
          ctx.lineTo(
            bot.center.x + bot.verts[ni].x,
            bot.center.y + bot.verts[ni].y,
          );
          ctx.lineTo(
            top.center.x + top.verts[ni].x,
            top.center.y + top.verts[ni].y,
          );
          ctx.lineTo(
            top.center.x + top.verts[i].x,
            top.center.y + top.verts[i].y,
          );
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = `rgba(0,0,0,${0.06 + bright * 0.06})`;
          ctx.lineWidth = 0.4 * zoom;
          ctx.stroke();

          if (n < -0.85) continue;

          // Highlight on bright edges
          if (bright > 0.55) {
            ctx.strokeStyle = `rgba(255,255,255,${0.04 + (bright - 0.55) * 0.15})`;
            ctx.lineWidth = 0.5 * zoom;
            ctx.beginPath();
            ctx.moveTo(
              bot.center.x + bot.verts[ni].x,
              bot.center.y + bot.verts[ni].y,
            );
            ctx.lineTo(
              top.center.x + top.verts[ni].x,
              top.center.y + top.verts[ni].y,
            );
            ctx.stroke();
          }
        }

        // Coil ring at each segment joint (spring detail)
        if (si > 0) {
          const ringScale = 1.12;
          drawHexBand(
            ctx,
            bot.verts,
            springNormals,
            { x: bot.center.x, y: bot.center.y + 0.8 * zoom },
            { x: bot.center.x, y: bot.center.y - 0.8 * zoom },
            ringScale,
            (n) => {
              const b = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
              return level >= 3
                ? `rgb(${140 + Math.floor(b * 50)},${120 + Math.floor(b * 45)},${30 + Math.floor(b * 20)})`
                : `rgb(${80 + Math.floor(b * 40)},${80 + Math.floor(b * 40)},${90 + Math.floor(b * 30)})`;
            },
            "rgba(0,0,0,0.12)",
            0.3 * zoom,
            -0.85,
          );
        }
      }

      // Top cap
      const sTop = springPts[segCount];
      drawHexCap(
        ctx,
        sTop.center,
        sTop.verts,
        level >= 3 ? "#5a5260" : "#505058",
        level >= 3 ? "#3a3440" : "#3a3a3e",
        0.4 * zoom,
      );

      // End mounting bolts
      const sAccent = level >= 3 ? "#c9a227" : "#8a8a90";
      ctx.fillStyle = sAccent;
      ctx.beginPath();
      ctx.arc(
        springPts[0].center.x,
        springPts[0].center.y,
        1 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sTop.center.x, sTop.center.y, 0.8 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== OCTAGONAL SCOPE (mounted on opposite side of barrel from springs) =====
  {
    const scopePerp = { x: -sinR, y: cosR * ISO_Y_RATIO };
    const scopeSide = -farSide;
    const scopeR = (level >= 3 ? 4 : level >= 2 ? 3.5 : 3) * zoom;
    const scopeSides = 8;
    const scopeDk = parseHexColor(
      level >= 3 ? "#1e1a24" : level >= 2 ? "#222630" : "#28282c",
    );
    const scopeLt = parseHexColor(
      level >= 3 ? "#5a4e5a" : level >= 2 ? "#4a5060" : "#505058",
    );
    const scopeNormals = computeHexSideNormals(cosR, scopeSides);
    const scopeSorted = sortSidesByDepth(scopeNormals);

    const scopeOffR = tiers[1].r + scopeR * 0.4;
    const scopeBaseFrac = 0.22;
    const scopeTipFrac = 0.52;
    const scopeBaseRecoil = tierRecoils[0] * 0.4;
    const scopeTipRecoil = tierRecoils[0] + tierRecoils[1] * 0.5;

    const scBase = posAtFrac(scopeBaseFrac, scopeBaseRecoil);
    const scTip = posAtFrac(scopeTipFrac, scopeTipRecoil);
    const scopeOX = scopeSide * scopePerp.x * scopeOffR;
    const scopeOY = scopeSide * scopePerp.y * scopeOffR;

    const scopeSegCount = 3;
    const scopePts: { center: Pt; verts: Pt[] }[] = [];
    for (let si = 0; si <= scopeSegCount; si++) {
      const t = si / scopeSegCount;
      const cx = scBase.x + (scTip.x - scBase.x) * t + scopeOX;
      const cy = scBase.y + (scTip.y - scBase.y) * t + scopeOY;
      const taper = si === 0 ? 0.85 : si === scopeSegCount ? 1.1 : 1.0;
      scopePts.push({
        center: { x: cx, y: cy },
        verts: generateIsoHexVertices(isoOff, scopeR * taper, scopeSides),
      });
    }

    // Rear cap (eyepiece end — narrower)
    drawHexCap(
      ctx,
      scopePts[0].center,
      scopePts[0].verts,
      level >= 3 ? "#2a2430" : "#2a2a30",
      level >= 3 ? "#1a1420" : "#1e1e22",
      0.4 * zoom,
    );

    // Scope body segments
    for (let si = 0; si < scopeSegCount; si++) {
      const bot = scopePts[si];
      const top = scopePts[si + 1];
      const isObjectiveEnd = si === scopeSegCount - 1;

      for (const i of scopeSorted) {
        const ni = (i + 1) % scopeSides;
        const n = scopeNormals[i];
        const bright = Math.max(0, Math.min(1, 0.3 + (n + 1) * 0.35));
        const fR = Math.floor(scopeDk.r + (scopeLt.r - scopeDk.r) * bright);
        const fG = Math.floor(scopeDk.g + (scopeLt.g - scopeDk.g) * bright);
        const fB = Math.floor(scopeDk.b + (scopeLt.b - scopeDk.b) * bright);

        const faceGrad = ctx.createLinearGradient(
          top.center.x,
          top.center.y,
          bot.center.x,
          bot.center.y,
        );
        faceGrad.addColorStop(
          0,
          `rgb(${Math.min(255, fR + 8)},${Math.min(255, fG + 6)},${Math.min(255, fB + 5)})`,
        );
        faceGrad.addColorStop(0.5, `rgb(${fR},${fG},${fB})`);
        faceGrad.addColorStop(
          1,
          `rgb(${Math.max(0, fR - 10)},${Math.max(0, fG - 8)},${Math.max(0, fB - 6)})`,
        );
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.moveTo(
          bot.center.x + bot.verts[i].x,
          bot.center.y + bot.verts[i].y,
        );
        ctx.lineTo(
          bot.center.x + bot.verts[ni].x,
          bot.center.y + bot.verts[ni].y,
        );
        ctx.lineTo(
          top.center.x + top.verts[ni].x,
          top.center.y + top.verts[ni].y,
        );
        ctx.lineTo(
          top.center.x + top.verts[i].x,
          top.center.y + top.verts[i].y,
        );
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(0,0,0,${0.07 + bright * 0.06})`;
        ctx.lineWidth = 0.4 * zoom;
        ctx.stroke();

        if (n < -0.85) continue;

        // Edge highlight
        if (bright > 0.5) {
          ctx.strokeStyle = `rgba(255,255,255,${0.05 + (bright - 0.5) * 0.15})`;
          ctx.lineWidth = 0.5 * zoom;
          ctx.beginPath();
          ctx.moveTo(
            bot.center.x + bot.verts[ni].x,
            bot.center.y + bot.verts[ni].y,
          );
          ctx.lineTo(
            top.center.x + top.verts[ni].x,
            top.center.y + top.verts[ni].y,
          );
          ctx.stroke();
        }

        // Scope markings on the main body (middle segment)
        if (si === 1 && n > 0) {
          ctx.strokeStyle =
            level >= 3 ? "rgba(200,160,40,0.2)" : "rgba(180,180,190,0.15)";
          ctx.lineWidth = 0.4 * zoom;
          for (let mk = 0; mk < 3; mk++) {
            const mt = (mk + 1) / 4;
            const mBot = {
              x: bot.verts[i].x + (top.verts[i].x - bot.verts[i].x) * mt,
              y: bot.verts[i].y + (top.verts[i].y - bot.verts[i].y) * mt,
            };
            const mTop = {
              x: bot.verts[ni].x + (top.verts[ni].x - bot.verts[ni].x) * mt,
              y: bot.verts[ni].y + (top.verts[ni].y - bot.verts[ni].y) * mt,
            };
            const mcx = bot.center.x + (top.center.x - bot.center.x) * mt;
            const mcy = bot.center.y + (top.center.y - bot.center.y) * mt;
            ctx.beginPath();
            ctx.moveTo(mcx + mBot.x, mcy + mBot.y);
            ctx.lineTo(mcx + mTop.x, mcy + mTop.y);
            ctx.stroke();
          }
        }
      }

      // Band ring at joints
      drawHexBand(
        ctx,
        bot.verts,
        scopeNormals,
        { x: bot.center.x, y: bot.center.y + 1 * zoom },
        { x: bot.center.x, y: bot.center.y - 1 * zoom },
        isObjectiveEnd ? 1.15 : 1.06,
        (n) => {
          const b = Math.max(0, Math.min(1, 0.35 + (n + 1) * 0.3));
          if (level >= 3)
            return `rgb(${140 + Math.floor(b * 50)},${115 + Math.floor(b * 45)},${28 + Math.floor(b * 18)})`;
          return `rgb(${60 + Math.floor(b * 35)},${60 + Math.floor(b * 35)},${68 + Math.floor(b * 25)})`;
        },
        "rgba(0,0,0,0.15)",
        0.4 * zoom,
        -0.85,
      );
    }

    // Objective lens (front cap — glass effect)
    const objPt = scopePts[scopeSegCount];
    const objVerts = objPt.verts;
    drawHexCap(
      ctx,
      objPt.center,
      objVerts,
      level >= 3 ? "#3a3040" : "#2e2e36",
      level >= 3 ? "#1e1824" : "#1e1e24",
      0.4 * zoom,
    );

    // Lens glass (inner octagon with blue tint)
    const lensVerts = objVerts.map((v) => ({ x: v.x * 0.7, y: v.y * 0.7 }));
    ctx.fillStyle = level >= 3 ? "rgba(60,80,140,0.35)" : "rgba(40,60,120,0.3)";
    ctx.beginPath();
    ctx.moveTo(
      objPt.center.x + lensVerts[0].x,
      objPt.center.y + lensVerts[0].y,
    );
    for (let li = 1; li < scopeSides; li++)
      ctx.lineTo(
        objPt.center.x + lensVerts[li].x,
        objPt.center.y + lensVerts[li].y,
      );
    ctx.closePath();
    ctx.fill();

    // Lens reflection highlight
    ctx.fillStyle = "rgba(180,200,255,0.18)";
    ctx.beginPath();
    ctx.ellipse(
      objPt.center.x - scopeR * 0.15,
      objPt.center.y - scopeR * 0.1 * ISO_Y_RATIO,
      scopeR * 0.3,
      scopeR * 0.2 * ISO_Y_RATIO,
      -0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Scope mount brackets (connecting scope to barrel body)
    const mountAccent = level >= 3 ? "#c9a227" : "#7a7a82";
    const mountDark = level >= 3 ? "#3a3440" : "#3a3a40";
    for (let mi = 0; mi < 2; mi++) {
      const mt = mi === 0 ? 0.15 : 0.7;
      const mPt = {
        x: scBase.x + (scTip.x - scBase.x) * mt + scopeOX,
        y: scBase.y + (scTip.y - scBase.y) * mt + scopeOY,
      };
      const barrelPt = {
        x: scBase.x + (scTip.x - scBase.x) * mt,
        y: scBase.y + (scTip.y - scBase.y) * mt,
      };

      // Mount arm
      ctx.strokeStyle = mountDark;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        barrelPt.x + scopeSide * scopePerp.x * tiers[1].r * 0.9,
        barrelPt.y + scopeSide * scopePerp.y * tiers[1].r * 0.9,
      );
      ctx.lineTo(mPt.x, mPt.y);
      ctx.stroke();

      // Mount clamp ring
      ctx.strokeStyle = mountDark;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        mPt.x,
        mPt.y,
        scopeR * 1.2,
        scopeR * 0.6 * ISO_Y_RATIO,
        Math.atan2(scTip.y - scBase.y, scTip.x - scBase.x),
        0,
        Math.PI * 2,
      );
      ctx.stroke();

      // Clamp bolt
      ctx.fillStyle = mountAccent;
      ctx.beginPath();
      ctx.arc(
        mPt.x + scopeSide * scopePerp.x * scopeR * 0.8,
        mPt.y + scopeSide * scopePerp.y * scopeR * 0.8,
        0.8 * zoom,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Eyepiece rubber guard (rear cap detail)
    const eyePt = scopePts[0];
    ctx.strokeStyle = "#1a1a1e";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      eyePt.center.x,
      eyePt.center.y,
      scopeR * 0.9,
      scopeR * 0.45 * ISO_Y_RATIO,
      Math.atan2(scTip.y - scBase.y, scTip.x - scBase.x),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // ===== FRONT CRADLE ARM (drawn late for proper layering on top of barrel) =====
  {
    const carrWF = tiers[0].r * (level >= 3 ? 1.15 : level >= 2 ? 1.08 : 1.0);
    const cradleThickF = (level >= 3 ? 10 : level >= 2 ? 9 : 7.5) * zoom;
    const cradleWF = carrWF * (level >= 3 ? 1.35 : level >= 2 ? 1.28 : 1.2);
    const metalDarkF =
      level >= 3 ? "#28242e" : level >= 2 ? "#262a32" : "#2c2c30";
    const metalMidF =
      level >= 3 ? "#48424e" : level >= 2 ? "#3e4450" : "#484850";
    const metalLightF =
      level >= 3 ? "#6a6270" : level >= 2 ? "#5a6270" : "#606068";
    const accentF = level >= 3 ? "#c9a227" : level >= 2 ? "#8a4428" : "#6a3a28";
    const totalRecoilF = tierRecoils[0] + tierRecoils[1] + tierRecoils[2];
    drawMortarCradleArm(ctx, {
      side: nearSide,
      level,
      zoom,
      sinR,
      cosR,
      perpX: -sinR,
      perpY: cosR * ISO_Y_RATIO,
      tiers,
      tierRecoils,
      totalRecoil: totalRecoilF,
      posAtFrac,
      cradleW: cradleWF,
      cradleThick: cradleThickF,
      metalDark: metalDarkF,
      metalMid: metalMidF,
      metalLight: metalLightF,
      accent: accentF,
      time,
      timeSinceFire,
    });
  }

  // ===== FRONT LEGS (closer to camera, drawn over barrel) =====
  for (const li of legOrder) {
    if (legDepths[li] >= medianDepth) drawLeg(li);
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
    const boreFireGlow =
      timeSinceFire < 3000 ? (1 - timeSinceFire / 3000) * 0.5 : 0;
    const borePulse = Math.sin(time * 1.5) * 0.03;
    const boreTotal = boreGlowBase + boreFireGlow + borePulse;

    // Outer bore ring (charred dark)
    drawHexCap(
      ctx,
      rimPt,
      rimInnerVerts,
      "#0a0804",
      "rgba(0,0,0,0.3)",
      0.8 * zoom,
    );

    // Inner heat glow rings (concentric, getting brighter toward center)
    if (boreTotal > 0.02) {
      const glowLayers = 4;
      for (let gl = glowLayers; gl >= 1; gl--) {
        const scaleFactor = gl / glowLayers;
        const layerAlpha = boreTotal * (1 - scaleFactor + 0.2) * 0.6;
        const r = Math.floor(255);
        const g = Math.floor(60 + (1 - scaleFactor) * 140);
        const b = Math.floor(10 + (1 - scaleFactor) * 30);
        drawHexCap(
          ctx,
          rimPt,
          scaleVerts(rimInnerVerts, scaleFactor * 0.85),
          `rgba(${r}, ${g}, ${b}, ${Math.min(layerAlpha, 0.45)})`,
        );
      }
    }

    // Hot core after firing
    if (timeSinceFire < 2500) {
      const coreT = timeSinceFire / 2500;
      const coreAlpha = (1 - coreT) * 0.55;
      const coreR = tiers[2].r * 0.5 * (1 + coreT * 0.3);
      const coreGrad = ctx.createRadialGradient(
        rimPt.x,
        rimPt.y,
        0,
        rimPt.x,
        rimPt.y,
        coreR,
      );
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

  // ===== MUZZLE FLASH (multi-stage with directional streaks and concussion ring) =====
  if (timeSinceFire < 500) {
    const fT = timeSinceFire / 500;
    const fA = (1 - fT) * 0.85;
    const fSize = (12 + level * 4) * zoom * (1 + fT * 0.4);
    const flashCx = rimPt.x;
    const flashCy = rimPt.y - fSize * 0.3;

    // Concussion ring (expands outward)
    if (fT < 0.6) {
      const ringT = fT / 0.6;
      const ringR = fSize * (0.8 + ringT * 1.2);
      const ringA = (1 - ringT) * 0.12;
      ctx.strokeStyle = `rgba(255,200,120,${ringA})`;
      ctx.lineWidth = (1.5 - ringT * 1) * zoom;
      ctx.beginPath();
      ctx.ellipse(flashCx, flashCy, ringR, ringR * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Core flash (bright white-yellow center)
    const coreGrad = ctx.createRadialGradient(
      flashCx,
      flashCy,
      0,
      flashCx,
      flashCy,
      fSize,
    );
    coreGrad.addColorStop(0, `rgba(255, 250, 200, ${fA * 0.9})`);
    coreGrad.addColorStop(0.15, `rgba(255, 240, 140, ${fA * 0.8})`);
    coreGrad.addColorStop(0.35, `rgba(255, 180, 60, ${fA * 0.6})`);
    coreGrad.addColorStop(0.6, `rgba(255, 80, 10, ${fA * 0.25})`);
    coreGrad.addColorStop(1, "rgba(255, 40, 0, 0)");
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(flashCx, flashCy, fSize, 0, Math.PI * 2);
    ctx.fill();

    // Directional streaks (radial flare lines)
    if (fT < 0.4) {
      const streakA = (1 - fT / 0.4) * 0.35;
      ctx.strokeStyle = `rgba(255,220,100,${streakA})`;
      const streakCount = level >= 3 ? 8 : 6;
      for (let s = 0; s < streakCount; s++) {
        const sa = (s / streakCount) * Math.PI * 2 + fT * 2;
        const innerR = fSize * 0.3;
        const outerR = fSize * (0.8 + fT * 0.6);
        ctx.lineWidth = (0.8 + (level - 1) * 0.3) * zoom;
        ctx.beginPath();
        ctx.moveTo(
          flashCx + Math.cos(sa) * innerR,
          flashCy + Math.sin(sa) * innerR * 0.55,
        );
        ctx.lineTo(
          flashCx + Math.cos(sa) * outerR,
          flashCy + Math.sin(sa) * outerR * 0.55,
        );
        ctx.stroke();
      }
    }

    // Smoke puffs (expanding, rising, fading)
    for (let p = 0; p < 5; p++) {
      const pA = fT * 3.5 + p * 1.26;
      const pDist = fSize * (0.25 + fT * 0.6);
      const pAlpha = Math.max(0, 1 - fT * 1.3) * (0.3 - p * 0.04);
      const pSize = (2 + fT * 5 + p * 0.5) * zoom;
      ctx.fillStyle = `rgba(${80 + p * 10}, ${75 + p * 8}, ${70 + p * 6}, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(
        flashCx + Math.cos(pA) * pDist * 0.5,
        flashCy + Math.sin(pA) * pDist * 0.3 - fT * 12 * zoom - p * 2 * zoom,
        pSize,
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
  const underGlow = ctx.createRadialGradient(
    0,
    ePlatBot.y + 2 * zoom,
    0,
    0,
    ePlatBot.y + 2 * zoom,
    platR * 0.9,
  );
  underGlow.addColorStop(
    0,
    `rgba(255,100,20,${0.12 + Math.sin(time * 2) * 0.04})`,
  );
  underGlow.addColorStop(1, "rgba(255,40,0,0)");
  ctx.fillStyle = underGlow;
  ctx.beginPath();
  ctx.ellipse(
    0,
    ePlatBot.y + 2 * zoom,
    platR * 0.9,
    platR * 0.45,
    0,
    0,
    Math.PI * 2,
  );
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
      const cx =
        (ePlatBot.x + ePlatTop.x) * 0.5 +
        (ePlatVerts[i].x + ePlatVerts[ni].x) * 0.5;
      const cy =
        (ePlatBot.y + ePlatTop.y) * 0.5 +
        (ePlatVerts[i].y + ePlatVerts[ni].y) * 0.5;
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
  const capGlow = ctx.createRadialGradient(
    0,
    ePlatTop.y,
    0,
    0,
    ePlatTop.y,
    platR * 0.6,
  );
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
    const tpA = (tp * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(tpA) * platR * 0.2,
      ePlatTop.y + Math.sin(tpA) * platR * 0.1,
    );
    ctx.lineTo(
      Math.cos(tpA) * platR * 0.7,
      ePlatTop.y + Math.sin(tpA) * platR * 0.35,
    );
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
    if (
      ePlatNormals[i] < -0.7 &&
      ePlatNormals[(i + hexSides - 1) % hexSides] < -0.7
    )
      continue;
    ctx.fillStyle = "#4a3020";
    ctx.beginPath();
    ctx.arc(
      ePlatTop.x + ePlatVerts[i].x,
      ePlatTop.y + ePlatVerts[i].y,
      1.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#8a6040";
    ctx.beginPath();
    ctx.arc(
      ePlatTop.x + ePlatVerts[i].x,
      ePlatTop.y + ePlatVerts[i].y,
      1 * zoom,
      0,
      Math.PI * 2,
    );
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
  ctx.ellipse(
    spindleBase.x,
    spindleBase.y,
    8 * zoom,
    4 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#5a4030";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  // Flange ring detail
  ctx.strokeStyle = "#6a5040";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    spindleBase.x,
    spindleBase.y,
    6.5 * zoom,
    3.2 * zoom,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  // Flange bolts
  ctx.fillStyle = "#8a6a48";
  for (let fb = 0; fb < 6; fb++) {
    const fba = (fb * Math.PI) / 3;
    ctx.beginPath();
    ctx.arc(
      Math.cos(fba) * 7 * zoom,
      spindleBase.y + Math.sin(fba) * 3.5 * zoom,
      0.8 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Spindle body (multi-strip gradient cylinder for volumetric lighting)
  const spDx = spindleTop.x - spindleBase.x;
  const spDy = spindleTop.y - spindleBase.y;
  const spLen = Math.hypot(spDx, spDy);
  const spNx = -spDy / spLen;
  const spNy = spDx / spLen;
  const spindleStrips = 6;
  for (let s = 0; s < spindleStrips; s++) {
    const a0 = (s / spindleStrips - 0.5) * Math.PI;
    const a1 = ((s + 1) / spindleStrips - 0.5) * Math.PI;
    const nx0 = Math.sin(a0);
    const nx1 = Math.sin(a1);
    const bright0 = Math.max(0, Math.min(1, 0.3 + (nx0 + 1) * 0.35));
    const bright1 = Math.max(0, Math.min(1, 0.3 + (nx1 + 1) * 0.35));
    const bright = (bright0 + bright1) * 0.5;
    const cr = Math.floor(42 + bright * 58);
    const cg = Math.floor(24 + bright * 40);
    const cb = Math.floor(14 + bright * 22);
    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
    ctx.beginPath();
    ctx.moveTo(
      spindleBase.x + spNx * spindleR * nx0,
      spindleBase.y + spNy * spindleR * nx0,
    );
    ctx.lineTo(
      spindleBase.x + spNx * spindleR * nx1,
      spindleBase.y + spNy * spindleR * nx1,
    );
    ctx.lineTo(
      spindleTop.x + spNx * spindleR * nx1,
      spindleTop.y + spNy * spindleR * nx1,
    );
    ctx.lineTo(
      spindleTop.x + spNx * spindleR * nx0,
      spindleTop.y + spNy * spindleR * nx0,
    );
    ctx.closePath();
    ctx.fill();
  }
  // Specular highlight band
  ctx.strokeStyle = "rgba(220,170,90,0.14)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    spindleBase.x + spNx * spindleR * 0.35,
    spindleBase.y + spNy * spindleR * 0.35,
  );
  ctx.lineTo(
    spindleTop.x + spNx * spindleR * 0.35,
    spindleTop.y + spNy * spindleR * 0.35,
  );
  ctx.stroke();
  // Edge darkening
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
  // Heat glow on spindle body (pulsing orange band)
  const spHeatAlpha = 0.06 + Math.sin(time * 2.5) * 0.03;
  ctx.strokeStyle = `rgba(255,100,20,${spHeatAlpha})`;
  ctx.lineWidth = spindleR * 1.6;
  ctx.beginPath();
  ctx.moveTo(spindleMid.x - spNx * 0.5, spindleMid.y - spNy * 0.5);
  ctx.lineTo(spindleMid.x + spNx * 0.5, spindleMid.y + spNy * 0.5);
  ctx.stroke();

  // Spindle bearing rings (bronze bands with shadow/highlight)
  for (const bf of [0.2, 0.5, 0.8]) {
    const bx = spindleBase.x + spDx * bf;
    const by = spindleBase.y + spDy * bf;
    // Ring shadow
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 2.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      bx - spNx * spindleR * 1.12 + 0.3 * zoom,
      by - spNy * spindleR * 1.12 + 0.3 * zoom,
    );
    ctx.lineTo(
      bx + spNx * spindleR * 1.12 + 0.3 * zoom,
      by + spNy * spindleR * 1.12 + 0.3 * zoom,
    );
    ctx.stroke();
    // Ring body
    ctx.strokeStyle = "#8a6a48";
    ctx.lineWidth = 1.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(bx - spNx * spindleR * 1.12, by - spNy * spindleR * 1.12);
    ctx.lineTo(bx + spNx * spindleR * 1.12, by + spNy * spindleR * 1.12);
    ctx.stroke();
    // Ring highlight
    ctx.strokeStyle = "rgba(200,160,80,0.12)";
    ctx.lineWidth = 0.4 * zoom;
    ctx.beginPath();
    ctx.moveTo(
      bx - spNx * spindleR * 1.08,
      by - spNy * spindleR * 1.08 - 0.3 * zoom,
    );
    ctx.lineTo(
      bx + spNx * spindleR * 1.08,
      by + spNy * spindleR * 1.08 - 0.3 * zoom,
    );
    ctx.stroke();
  }

  // Top cap (gradient for convex surface look)
  const capGrd = ctx.createRadialGradient(
    spindleTop.x,
    spindleTop.y,
    0,
    spindleTop.x,
    spindleTop.y,
    spindleR * 1.3,
  );
  capGrd.addColorStop(0, "#7a5a40");
  capGrd.addColorStop(0.5, "#5a4030");
  capGrd.addColorStop(1, "#3a2818");
  ctx.fillStyle = capGrd;
  ctx.beginPath();
  ctx.ellipse(
    spindleTop.x,
    spindleTop.y,
    spindleR * 1.3,
    spindleR * 0.65,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.4 * zoom;
  ctx.stroke();
  // Inner cap ring
  ctx.fillStyle = "#6a5040";
  ctx.beginPath();
  ctx.ellipse(
    spindleTop.x,
    spindleTop.y,
    spindleR * 0.7,
    spindleR * 0.35,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Cap highlight
  ctx.fillStyle = "rgba(200,160,80,0.1)";
  ctx.beginPath();
  ctx.ellipse(
    spindleTop.x - 0.5 * zoom,
    spindleTop.y - 0.3 * zoom,
    spindleR * 0.35,
    spindleR * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Ratchet gear (at base)
  const ratchetR = 10 * zoom;
  ctx.strokeStyle = "#7a5a3a";
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    spindleBase.x,
    spindleBase.y,
    ratchetR,
    ratchetR * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  const ratchetTeeth = 16;
  for (let t = 0; t < ratchetTeeth; t++) {
    const ta = (t / ratchetTeeth) * Math.PI * 2 + smoothAngle;
    const toothInner = ratchetR * 0.9;
    const toothOuter = ratchetR * 1.12;
    ctx.fillStyle = "#8a6a48";
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(ta) * toothInner,
      spindleBase.y + Math.sin(ta) * toothInner * 0.5,
    );
    ctx.lineTo(
      Math.cos(ta + 0.1) * toothOuter,
      spindleBase.y + Math.sin(ta + 0.1) * toothOuter * 0.5,
    );
    ctx.lineTo(
      Math.cos(ta + 0.2) * toothInner,
      spindleBase.y + Math.sin(ta + 0.2) * toothInner * 0.5,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Furnace core glow (much more dramatic)
  const furnPulse = 0.55 + Math.sin(time * 3) * 0.3;
  const furnCx = spindleMid.x;
  const furnCy = spindleMid.y;
  const furnGrad = ctx.createRadialGradient(
    furnCx,
    furnCy,
    0,
    furnCx,
    furnCy,
    16 * zoom,
  );
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
    ctx.moveTo(
      spindleBase.x + Math.cos(pa) * spindleR,
      spindleBase.y + Math.sin(pa) * spindleR * 0.5,
    );
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

        // Gradient fill for each barrel face (lit top, shadow bottom)
        const eFaceMidX = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
        const eFaceMidY = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
        const eFaceGrad = ctx.createLinearGradient(
          topC.x + eFaceMidX,
          topC.y + eFaceMidY,
          botC.x + eFaceMidX,
          botC.y + eFaceMidY,
        );
        eFaceGrad.addColorStop(
          0,
          `rgb(${Math.min(255, fR + 10)},${Math.min(255, fG + 8)},${Math.min(255, fB + 5)})`,
        );
        eFaceGrad.addColorStop(0.5, `rgb(${fR},${fG},${fB})`);
        eFaceGrad.addColorStop(
          1,
          `rgb(${Math.max(0, fR - 12)},${Math.max(0, fG - 10)},${Math.max(0, fB - 6)})`,
        );
        ctx.fillStyle = eFaceGrad;
        ctx.beginPath();
        ctx.moveTo(botC.x + hexVerts[i].x, botC.y + hexVerts[i].y);
        ctx.lineTo(botC.x + hexVerts[ni].x, botC.y + hexVerts[ni].y);
        ctx.lineTo(topC.x + hexVerts[ni].x, topC.y + hexVerts[ni].y);
        ctx.lineTo(topC.x + hexVerts[i].x, topC.y + hexVerts[i].y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(0,0,0,${0.12 + bright * 0.06})`;
        ctx.lineWidth = 0.5 * zoom;
        ctx.stroke();

        if (n > -0.5) {
          // Heat scorch gradient (intensifies toward muzzle end)
          const heatBase = 0.05 + (ti / 2) * 0.04;
          const heatPulse = Math.sin(time * 2.5 + bi * 2 + i * 0.5) * 0.03;
          const heatAlpha =
            heatBase +
            heatPulse +
            (isActiveBarrel && shotProgress < 0.4
              ? (1 - shotProgress / 0.4) * 0.1
              : 0);
          ctx.fillStyle = `rgba(255,80,0,${heatAlpha})`;
          ctx.beginPath();
          ctx.moveTo(botC.x + hexVerts[i].x, botC.y + hexVerts[i].y);
          ctx.lineTo(botC.x + hexVerts[ni].x, botC.y + hexVerts[ni].y);
          ctx.lineTo(topC.x + hexVerts[ni].x, topC.y + hexVerts[ni].y);
          ctx.lineTo(topC.x + hexVerts[i].x, topC.y + hexVerts[i].y);
          ctx.closePath();
          ctx.fill();

          // Ember crack lines (glowing fissures on face)
          const crackSeed = bi * 31 + i * 7 + ti * 13;
          const crackAlpha = 0.04 + Math.sin(time * 1.8 + crackSeed) * 0.025;
          ctx.strokeStyle = `rgba(255,120,20,${crackAlpha})`;
          ctx.lineWidth = 0.4 * zoom;
          const eFacePt = (u: number, v: number) => ({
            x:
              botC.x +
              hexVerts[i].x * (1 - u) +
              hexVerts[ni].x * u +
              (topC.x - botC.x) * v,
            y:
              botC.y +
              hexVerts[i].y * (1 - u) +
              hexVerts[ni].y * u +
              (topC.y - botC.y) * v,
          });
          const c1 = eFacePt(0.2, 0.3);
          const c2 = eFacePt(0.5, 0.6);
          const c3 = eFacePt(0.8, 0.4);
          ctx.beginPath();
          ctx.moveTo(c1.x, c1.y);
          ctx.lineTo(c2.x, c2.y);
          ctx.lineTo(c3.x, c3.y);
          ctx.stroke();

          // Bronze rivets with raised specular
          ctx.fillStyle = `rgba(160,100,50,${0.45 + bright * 0.3})`;
          const mx = (hexVerts[i].x + hexVerts[ni].x) * 0.5;
          const my = (hexVerts[i].y + hexVerts[ni].y) * 0.5;
          for (const vf of [0.3, 0.7]) {
            const rx = botC.x * (1 - vf) + topC.x * vf + mx;
            const ry = botC.y * (1 - vf) + topC.y * vf + my;
            ctx.beginPath();
            ctx.arc(rx, ry, 0.65 * zoom, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(220,170,80,${0.1 + bright * 0.08})`;
            ctx.beginPath();
            ctx.arc(
              rx - 0.12 * zoom,
              ry - 0.12 * zoom,
              0.25 * zoom,
              0,
              Math.PI * 2,
            );
            ctx.fill();
            ctx.fillStyle = `rgba(160,100,50,${0.45 + bright * 0.3})`;
          }
        }
      }
      drawHexCap(
        ctx,
        topC,
        hexVerts,
        tier.light,
        "rgba(0,0,0,0.1)",
        0.5 * zoom,
      );

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
    const innerVerts = generateIsoHexVertices(
      isoOff,
      barrelTiers[1].r * 0.65,
      hexSides,
    );
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
      ctx.lineTo(
        rimBandBot.x + rimVerts[rni].x,
        rimBandBot.y + rimVerts[rni].y,
      );
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
      drawHexCap(
        ctx,
        rimC,
        scaleVerts(innerVerts, sf * 0.8),
        `rgba(255, ${60 + (1 - sf) * 100}, ${(1 - sf) * 20}, ${Math.min(alpha, 0.5)})`,
      );
    }

    if (isActiveBarrel && shotProgress < 0.2) {
      const fA = (1 - shotProgress / 0.2) * 0.8;
      const fSize = 12 * zoom;
      const fGrad = ctx.createRadialGradient(
        rimC.x,
        rimC.y - 4 * zoom,
        0,
        rimC.x,
        rimC.y - 4 * zoom,
        fSize,
      );
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
          rimC.y -
            4 * zoom -
            shotProgress * 8 * zoom +
            Math.sin(spA) * spDist * 0.3,
          (2 + shotProgress * 3) * zoom,
          0,
          Math.PI * 2,
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
    if (
      mPlatNormals[i] < -0.7 &&
      mPlatNormals[(i + hexSides - 1) % hexSides] < -0.7
    )
      continue;
    ctx.fillStyle = "#3a3a42";
    ctx.beginPath();
    ctx.arc(
      mPlatTop.x + mPlatVerts[i].x,
      mPlatTop.y + mPlatVerts[i].y,
      2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#6a6a72";
    ctx.beginPath();
    ctx.arc(
      mPlatTop.x + mPlatVerts[i].x,
      mPlatTop.y + mPlatVerts[i].y,
      1.2 * zoom,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Tread plate texture on platform cap
  ctx.strokeStyle = "rgba(80,80,90,0.08)";
  ctx.lineWidth = 0.4 * zoom;
  for (let tp = 0; tp < 8; tp++) {
    const tpA = (tp * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(tpA) * platR * 0.15,
      mPlatTop.y + Math.sin(tpA) * platR * 0.075,
    );
    ctx.lineTo(
      Math.cos(tpA) * platR * 0.75,
      mPlatTop.y + Math.sin(tpA) * platR * 0.375,
    );
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

  // Bilinear point on a quad face
  const quadPt = (
    bl: Pt,
    br: Pt,
    tl: Pt,
    tr: Pt,
    u: number,
    v: number,
  ): Pt => ({
    x:
      bl.x +
      (br.x - bl.x) * u +
      (tl.x - bl.x) * v +
      (tr.x - br.x - tl.x + bl.x) * u * v,
    y:
      bl.y +
      (br.y - bl.y) * u +
      (tl.y - bl.y) * v +
      (tr.y - br.y - tl.y + bl.y) * u * v,
  });

  // Helper: draw panel detail on a side face (seams, rivets, warning stripe)
  const drawSidePanelDetail = (bl: Pt, br: Pt, tl: Pt, tr: Pt, vis: number) => {
    // Horizontal panel seams (2 seams dividing face into 3 panels)
    for (const hf of [0.33, 0.66]) {
      const sl = quadPt(bl, br, tl, tr, 0, hf);
      const sr = quadPt(bl, br, tl, tr, 1, hf);
      // Seam groove shadow
      ctx.strokeStyle = "rgba(0,0,0,0.14)";
      ctx.lineWidth = 0.6 * zoom;
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(sr.x, sr.y);
      ctx.stroke();
      // Seam highlight (upper edge catch light)
      ctx.strokeStyle = `rgba(180,180,195,0.07)`;
      ctx.lineWidth = 0.3 * zoom;
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y - 0.5 * zoom);
      ctx.lineTo(sr.x, sr.y - 0.5 * zoom);
      ctx.stroke();
    }
    // Vertical center seam
    const midB = quadPt(bl, br, tl, tr, 0.5, 0);
    const midT = quadPt(bl, br, tl, tr, 0.5, 1);
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(midB.x, midB.y);
    ctx.lineTo(midT.x, midT.y);
    ctx.stroke();

    // Rivet rows (top and bottom edges + center row)
    const rivetAlpha = 0.4 + vis * 0.3;
    ctx.fillStyle = `rgba(130,130,142,${rivetAlpha})`;
    for (const vf of [0.06, 0.5, 0.94]) {
      for (let rv = 0; rv < 5; rv++) {
        const t = (rv + 0.5) / 5;
        const rp = quadPt(bl, br, tl, tr, t, vf);
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 0.65 * zoom, 0, Math.PI * 2);
        ctx.fill();
        // Rivet specular
        ctx.fillStyle = `rgba(200,200,210,${0.06 + vis * 0.04})`;
        ctx.beginPath();
        ctx.arc(
          rp.x - 0.1 * zoom,
          rp.y - 0.1 * zoom,
          0.22 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.fillStyle = `rgba(130,130,142,${rivetAlpha})`;
      }
    }

    // Warning stripe (diagonal caution band at 40% height)
    const stripeVf = 0.4;
    const s0 = quadPt(bl, br, tl, tr, 0, stripeVf);
    const s1 = quadPt(bl, br, tl, tr, 1, stripeVf);
    const s2 = quadPt(bl, br, tl, tr, 1, stripeVf + 0.06);
    const s3 = quadPt(bl, br, tl, tr, 0, stripeVf + 0.06);
    ctx.fillStyle = `rgba(200,160,0,0.15)`;
    ctx.beginPath();
    ctx.moveTo(s0.x, s0.y);
    ctx.lineTo(s1.x, s1.y);
    ctx.lineTo(s2.x, s2.y);
    ctx.lineTo(s3.x, s3.y);
    ctx.closePath();
    ctx.fill();
    // Stripe diagonal hash marks
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 0.3 * zoom;
    for (let sh = 0; sh < 6; sh++) {
      const su = (sh + 0.5) / 6;
      const shp1 = quadPt(bl, br, tl, tr, su, stripeVf);
      const shp2 = quadPt(
        bl,
        br,
        tl,
        tr,
        Math.min(1, su + 0.08),
        stripeVf + 0.06,
      );
      ctx.beginPath();
      ctx.moveTo(shp1.x, shp1.y);
      ctx.lineTo(shp2.x, shp2.y);
      ctx.stroke();
    }

    // Access hatch (recessed panel with handle)
    const hatchC = quadPt(bl, br, tl, tr, 0.5, 0.68);
    const hatchW = 2.5 * zoom;
    const hatchH = 2 * zoom;
    // Hatch recess shadow
    ctx.fillStyle = `rgba(0,0,0,${0.06 + vis * 0.03})`;
    ctx.fillRect(
      hatchC.x - hatchW - 0.3 * zoom,
      hatchC.y - hatchH - 0.3 * zoom,
      (hatchW + 0.3 * zoom) * 2,
      (hatchH + 0.3 * zoom) * 2,
    );
    // Hatch panel
    ctx.fillStyle = `rgba(80,82,90,${0.12 + vis * 0.06})`;
    ctx.fillRect(hatchC.x - hatchW, hatchC.y - hatchH, hatchW * 2, hatchH * 2);
    // Hatch border
    ctx.strokeStyle = `rgba(120,120,132,${0.18 + vis * 0.1})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(
      hatchC.x - hatchW,
      hatchC.y - hatchH,
      hatchW * 2,
      hatchH * 2,
    );
    // Handle
    ctx.strokeStyle = `rgba(160,160,170,${0.2 + vis * 0.1})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(hatchC.x - 0.8 * zoom, hatchC.y);
    ctx.lineTo(hatchC.x + 0.8 * zoom, hatchC.y);
    ctx.stroke();
    // Hatch corner screws
    ctx.fillStyle = `rgba(140,140,150,${0.2 + vis * 0.1})`;
    for (const hcx of [-1, 1]) {
      for (const hcy of [-1, 1]) {
        ctx.beginPath();
        ctx.arc(
          hatchC.x + hcx * (hatchW - 0.5 * zoom),
          hatchC.y + hcy * (hatchH - 0.5 * zoom),
          0.35 * zoom,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  };

  // Draw faces back-to-front (with gradient fills for depth)
  // Back face
  if (backVis > -0.3) {
    const b = Math.max(0, Math.min(1, backVis * 0.5 + 0.5));
    const backMidB = { x: (bb_l.x + bb_r.x) * 0.5, y: (bb_l.y + bb_r.y) * 0.5 };
    const backMidT = { x: (tb_l.x + tb_r.x) * 0.5, y: (tb_l.y + tb_r.y) * 0.5 };
    const backGrad = ctx.createLinearGradient(
      backMidT.x,
      backMidT.y,
      backMidB.x,
      backMidB.y,
    );
    const bv = Math.floor(38 + b * 28);
    backGrad.addColorStop(0, `rgb(${bv + 8},${bv + 14},${bv + 6})`);
    backGrad.addColorStop(0.4, `rgb(${bv + 2},${bv + 6},${bv})`);
    backGrad.addColorStop(1, `rgb(${bv - 6},${bv},${bv - 4})`);
    ctx.fillStyle = backGrad;
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
    // Exhaust vents on back (with depth and heat glow)
    for (const ef of [0.3, 0.7]) {
      const ep = quadPt(bb_l, bb_r, tb_l, tb_r, ef, 0.5);
      ctx.fillStyle = "#1a1a22";
      ctx.beginPath();
      ctx.ellipse(ep.x, ep.y, 1.8 * zoom, 1.1 * zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(80,80,90,0.2)";
      ctx.lineWidth = 0.4 * zoom;
      ctx.stroke();
      // Vent grille lines
      for (let vl = -1; vl <= 1; vl++) {
        ctx.strokeStyle = "rgba(30,30,35,0.3)";
        ctx.lineWidth = 0.25 * zoom;
        ctx.beginPath();
        ctx.moveTo(ep.x - 1.2 * zoom, ep.y + vl * 0.5 * zoom);
        ctx.lineTo(ep.x + 1.2 * zoom, ep.y + vl * 0.5 * zoom);
        ctx.stroke();
      }
      // Heat glow from exhaust
      const exGlow = 0.03 + Math.sin(time * 2 + ef * 5) * 0.02;
      ctx.fillStyle = `rgba(255,80,20,${exGlow})`;
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, 3 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Left face
  if (leftVis > -0.3) {
    const b = Math.max(0, Math.min(1, leftVis * 0.5 + 0.5));
    const leftMidB = { x: (bb_l.x + bf_l.x) * 0.5, y: (bb_l.y + bf_l.y) * 0.5 };
    const leftMidT = { x: (tb_l.x + tf_l.x) * 0.5, y: (tb_l.y + tf_l.y) * 0.5 };
    const leftGrad = ctx.createLinearGradient(
      leftMidT.x,
      leftMidT.y,
      leftMidB.x,
      leftMidB.y,
    );
    const lv = Math.floor(33 + b * 28);
    leftGrad.addColorStop(0, `rgb(${lv + 8},${lv + 12},${lv + 5})`);
    leftGrad.addColorStop(0.4, `rgb(${lv + 2},${lv + 6},${lv})`);
    leftGrad.addColorStop(1, `rgb(${lv - 5},${lv},${lv - 3})`);
    ctx.fillStyle = leftGrad;
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
    const rightMidB = {
      x: (bb_r.x + bf_r.x) * 0.5,
      y: (bb_r.y + bf_r.y) * 0.5,
    };
    const rightMidT = {
      x: (tb_r.x + tf_r.x) * 0.5,
      y: (tb_r.y + tf_r.y) * 0.5,
    };
    const rightGrad = ctx.createLinearGradient(
      rightMidT.x,
      rightMidT.y,
      rightMidB.x,
      rightMidB.y,
    );
    const rv = Math.floor(33 + b * 28);
    rightGrad.addColorStop(0, `rgb(${rv + 8},${rv + 12},${rv + 5})`);
    rightGrad.addColorStop(0.4, `rgb(${rv + 2},${rv + 6},${rv})`);
    rightGrad.addColorStop(1, `rgb(${rv - 5},${rv},${rv - 3})`);
    ctx.fillStyle = rightGrad;
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
      const lp = {
        x: tb_l.x + (tf_l.x - tb_l.x) * t,
        y: tb_l.y + (tf_l.y - tb_l.y) * t,
      };
      const rp = {
        x: tb_r.x + (tf_r.x - tb_r.x) * t,
        y: tb_r.y + (tf_r.y - tb_r.y) * t,
      };
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
      const tl = {
        x: tb_l.x + (tf_l.x - tb_l.x) * t,
        y: tb_l.y + (tf_l.y - tb_l.y) * t,
      };
      const tr = {
        x: tb_r.x + (tf_r.x - tb_r.x) * t,
        y: tb_r.y + (tf_r.y - tb_r.y) * t,
      };
      const halfW = Math.hypot(tr.x - tl.x, tr.y - tl.y) * 0.15;
      const perpDx =
        (tr.x - tl.x) / (Math.hypot(tr.x - tl.x, tr.y - tl.y) || 1);
      const perpDy =
        (tr.y - tl.y) / (Math.hypot(tr.x - tl.x, tr.y - tl.y) || 1);
      ctx.beginPath();
      ctx.moveTo(cx - perpDx * halfW, cy - perpDy * halfW);
      ctx.lineTo(
        cx + (topMidF.x - topMidB.x) * 0.03,
        cy + (topMidF.y - topMidB.y) * 0.03 - 1.5 * zoom,
      );
      ctx.lineTo(cx + perpDx * halfW, cy + perpDy * halfW);
      ctx.stroke();
    }

    // Corner rivets on top face
    ctx.fillStyle = "rgba(100,100,110,0.35)";
    for (const corner of [tb_l, tb_r, tf_l, tf_r]) {
      const toCenter = {
        x: (topMidB.x + topMidF.x) * 0.5,
        y: (topMidB.y + topMidF.y) * 0.5,
      };
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

        // Tube outer shroud (raised collar with gradient)
        const tubeCollarGrad = ctx.createRadialGradient(
          tubeX,
          tubeY,
          0,
          tubeX,
          tubeY,
          tubeR * 1.3,
        );
        tubeCollarGrad.addColorStop(0, "#4a4a56");
        tubeCollarGrad.addColorStop(0.6, "#3a3a44");
        tubeCollarGrad.addColorStop(1, "#2a2a34");
        ctx.fillStyle = tubeCollarGrad;
        ctx.beginPath();
        ctx.ellipse(
          tubeX,
          tubeY,
          tubeR * 1.28,
          tubeR * 0.72,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        // Collar edge ring
        ctx.strokeStyle = "#5a5a68";
        ctx.lineWidth = 0.8 * zoom;
        ctx.stroke();
        // Inner tube wall
        ctx.strokeStyle = "#4a4a54";
        ctx.lineWidth = 0.5 * zoom;
        ctx.beginPath();
        ctx.ellipse(
          tubeX,
          tubeY,
          tubeR * 1.05,
          tubeR * 0.59,
          0,
          0,
          Math.PI * 2,
        );
        ctx.stroke();

        // Tube bore (deep dark opening with depth gradient)
        const boreGradTube = ctx.createRadialGradient(
          tubeX,
          tubeY,
          0,
          tubeX,
          tubeY,
          tubeR * 0.88,
        );
        boreGradTube.addColorStop(0, "#040303");
        boreGradTube.addColorStop(0.7, "#0a0808");
        boreGradTube.addColorStop(1, "#161214");
        ctx.fillStyle = boreGradTube;
        ctx.beginPath();
        ctx.ellipse(tubeX, tubeY, tubeR * 0.88, tubeR * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rifling grooves inside bore (subtle radial lines)
        ctx.strokeStyle = "rgba(30,30,35,0.3)";
        ctx.lineWidth = 0.2 * zoom;
        for (let rg = 0; rg < 6; rg++) {
          const ra = (rg / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(
            tubeX + Math.cos(ra) * tubeR * 0.2,
            tubeY + Math.sin(ra) * tubeR * 0.11,
          );
          ctx.lineTo(
            tubeX + Math.cos(ra) * tubeR * 0.82,
            tubeY + Math.sin(ra) * tubeR * 0.46,
          );
          ctx.stroke();
        }

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
