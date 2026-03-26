import { ISO_COS, ISO_SIN } from "../../constants";
import { drawIsometricPrism } from "../helpers";
import {
  type BuildingPalette,
  drawBuildingSection,
  drawGabledRoof,
  drawConicalRoof,
  drawColumnPortico,
  drawPediment,
  drawMortarLines,
  drawTowerFoundation,
  drawIsoFaceArch,
  drawFaceShading,
  drawBaseAO,
  drawQuoins,
  drawStringCourse,
  drawEntrance,
  drawWeatherStains,
  drawRoofShingles,
  drawRidgeCap,
  drawChimney,
} from "./princetonBuildingHelpers";
import { drawIsoGothicWindow } from "../isoFlush";

const ISO_Y_RATIO = ISO_SIN / ISO_COS;

function frontAngles(n: number, margin: number = 0.15): number[] {
  const out: number[] = [];
  if (n <= 1) return [Math.PI * 0.5];
  for (let i = 0; i < n; i++) {
    out.push(Math.PI * (margin + (i * (1 - 2 * margin)) / (n - 1)));
  }
  return out;
}

// ─── Palettes ────────────────────────────────────────────────────────────

const BOATHOUSE_PAL: BuildingPalette = {
  wallTop: "#D8C8A8",
  wallLeft: "#C0A880",
  wallRight: "#D8C4A0",
  roofFront: "#5A3A18",
  roofSide: "#4A2A10",
  roofTop: "#6B4A28",
  roofDark: "#3A2008",
  trim: "#3A2008",
  trimLight: "#C8B898",
  cornice: "#5A4030",
  glass: "#1A0A00",
  foundTop: "#5A4A38",
  foundLeft: "#4A3A28",
  foundRight: "#3A2A1A",
  door: "#2A1808",
  accent: "#C8A860",
};

const PAVILION_PAL: BuildingPalette = {
  wallTop: "#8A7A65",
  wallLeft: "#6A5A48",
  wallRight: "#7A6A55",
  roofFront: "#6A5A48",
  roofSide: "#5A4A38",
  roofTop: "#7A6A55",
  roofDark: "#4A3A2D",
  trim: "#8A7A65",
  trimLight: "#9A8A72",
  cornice: "#9A8A72",
  glass: "#2A1A08",
  foundTop: "#7A6A55",
  foundLeft: "#5A4A38",
  foundRight: "#6A5A48",
  door: "#0A0500",
  accent: "#C8A860",
};

const TOWER_PAL: BuildingPalette = {
  wallTop: "#7A6A55",
  wallLeft: "#4A3A2A",
  wallRight: "#6A5A48",
  roofFront: "#4A6A58",
  roofSide: "#3A5A48",
  roofTop: "#3A5A4A",
  roofDark: "#1A3A2A",
  trim: "#7A6A55",
  trimLight: "#8A7A65",
  cornice: "#7A6A55",
  glass: "#1A1008",
  foundTop: "#5A4A38",
  foundLeft: "#3A2A1A",
  foundRight: "#4A3A28",
  door: "#1A0A00",
  accent: "#C4A040",
};

// ─── Boathouse (Tudor style) ─────────────────────────────────────────────

export function drawCarnegieLakeBoathouse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
): void {
  const pal = BOATHOUSE_PAL;
  const bx = cx + 18 * s;
  const by = cy - 16 * s;

  const bodyW = 10;
  const bodyD = 10;
  const bodyH = 13;
  const Ws = bodyW * s;
  const Ds = bodyD * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;

  // Foundation
  drawBaseAO(ctx, bx, by, Ws, Ds, 0.15);
  drawBuildingSection(ctx, bx, by, bodyW, bodyD, bodyH, s, pal, {
    rows: 2,
    leftCols: 2,
    rightCols: 2,
    wu: 0.1,
    wv: 0.2,
    arched: true,
  });

  // Tudor timber frame overlay on left face
  drawTimberFrame(ctx, bx, by, Ws, Ds, Hs, "left", s);
  // Tudor timber frame overlay on right face
  drawTimberFrame(ctx, bx, by, Ws, Ds, Hs, "right", s);

  // Face shading for depth
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "left", 0.12);
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "right", 0.08);

  // Weather staining
  drawWeatherStains(ctx, bx, by, Ws, Ds, Hs, s, "left");
  drawWeatherStains(ctx, bx, by, Ws, Ds, Hs, s, "right");

  // Quoins at corners
  drawQuoins(ctx, bx, by, Ws, Ds, Hs, s, pal.trim, 5);

  // String course at mid-height
  drawStringCourse(ctx, bx, by, Ws, Ds, Hs, 0.5, s, pal.trim);

  // Entrance door on front face
  drawEntrance(ctx, bx, by, Ws, Ds, Hs, s, "right", pal.door, pal.trim);

  // Gabled roof
  const roofH = 7;
  drawGabledRoof(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal);
  drawRoofShingles(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal.roofDark, 5);
  drawRidgeCap(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal.cornice);

  // Chimney on the roof
  drawChimney(ctx, bx + 3 * s, by - Hs - 3 * s, s, pal.trim, pal.trimLight);

  // Animated smoke puffs
  for (let sm = 0; sm < 4; sm++) {
    const smPhase = (time * 0.8 + sm * 0.7) % 3.5;
    const smAlpha = Math.max(0, 0.25 - smPhase * 0.08);
    if (smAlpha > 0) {
      const smX =
        bx + 3 * s +
        Math.sin(time * 0.5 + sm * 1.3) * 2 * s * (1 + smPhase * 0.4);
      const smY = by - Hs - 6 * s - smPhase * 5 * s;
      const smR = (1.5 + smPhase * 2) * s;
      ctx.fillStyle = `rgba(180,170,160,${smAlpha})`;
      ctx.beginPath();
      ctx.arc(smX, smY, smR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dock/pier extending into water
  drawDock(ctx, bx, by, Ds, s, time);
}

function drawTimberFrame(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number,
  face: "left" | "right",
  s: number,
): void {
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;
  const dir = face === "left" ? -1 : 1;

  const tl = { x: bx + dir * iW, y: wt + iD };
  const tr = { x: bx, y: wt + 2 * iD };
  const bl = { x: bx + dir * iW, y: by + iD };
  const br = { x: bx, y: by + 2 * iD };

  ctx.strokeStyle = "#3A2008";
  ctx.lineWidth = 1.8 * s;

  // Horizontal beam at mid-height
  const midL = { x: (tl.x + bl.x) / 2, y: (tl.y + bl.y) / 2 };
  const midR = { x: (tr.x + br.x) / 2, y: (tr.y + br.y) / 2 };
  ctx.beginPath();
  ctx.moveTo(midL.x, midL.y);
  ctx.lineTo(midR.x, midR.y);
  ctx.stroke();

  // Vertical center beam
  const cTop = { x: (tl.x + tr.x) / 2, y: (tl.y + tr.y) / 2 };
  const cBot = { x: (bl.x + br.x) / 2, y: (bl.y + br.y) / 2 };
  ctx.beginPath();
  ctx.moveTo(cTop.x, cTop.y);
  ctx.lineTo(cBot.x, cBot.y);
  ctx.stroke();

  // Diagonal braces
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(cBot.x, cBot.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tr.x, tr.y);
  ctx.lineTo(midL.x + (cBot.x - midL.x) * 0.5, midL.y + (cBot.y - midL.y) * 0.5);
  ctx.stroke();

  // Border frame
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(tl.x, tl.y);
  ctx.lineTo(tr.x, tr.y);
  ctx.lineTo(br.x, br.y);
  ctx.lineTo(bl.x, bl.y);
  ctx.closePath();
  ctx.stroke();
}

function drawDock(
  ctx: CanvasRenderingContext2D,
  bhx: number, bhy: number,
  Ds: number, s: number,
  time: number,
): void {
  const iD = Ds * ISO_SIN;
  const dockStartX = bhx - 2 * s;
  const dockStartY = bhy + 2 * iD + 2 * s;
  const dockEndX = bhx - 10 * s;
  const dockEndY = bhy + 2 * iD + 14 * s;
  const dockW = 2.5 * s;

  // Dock shadow
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.moveTo(dockStartX - dockW, dockStartY + 2 * s);
  ctx.lineTo(dockEndX - dockW, dockEndY + 2 * s);
  ctx.lineTo(dockEndX + dockW, dockEndY + 2 * s);
  ctx.lineTo(dockStartX + dockW, dockStartY + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Dock top surface
  const dockTopG = ctx.createLinearGradient(dockStartX, dockStartY, dockEndX, dockEndY);
  dockTopG.addColorStop(0, "#7A5A35");
  dockTopG.addColorStop(0.5, "#6D5030");
  dockTopG.addColorStop(1, "#5A4025");
  ctx.fillStyle = dockTopG;
  ctx.beginPath();
  ctx.moveTo(dockStartX - dockW, dockStartY);
  ctx.lineTo(dockEndX - dockW, dockEndY);
  ctx.lineTo(dockEndX + dockW, dockEndY - 1.5 * s);
  ctx.lineTo(dockStartX + dockW, dockStartY - 1.5 * s);
  ctx.closePath();
  ctx.fill();

  // Dock front edge thickness
  ctx.fillStyle = "#5A4020";
  ctx.beginPath();
  ctx.moveTo(dockEndX - dockW, dockEndY);
  ctx.lineTo(dockStartX - dockW, dockStartY);
  ctx.lineTo(dockStartX - dockW, dockStartY + 2 * s);
  ctx.lineTo(dockEndX - dockW, dockEndY + 2 * s);
  ctx.closePath();
  ctx.fill();

  // Plank lines
  ctx.strokeStyle = "rgba(60,40,20,0.35)";
  ctx.lineWidth = 0.5 * s;
  for (let dp = 1; dp < 8; dp++) {
    const dpf = dp / 8;
    const dpx = dockStartX + (dockEndX - dockStartX) * dpf;
    const dpy = dockStartY + (dockEndY - dockStartY) * dpf;
    ctx.beginPath();
    ctx.moveTo(dpx - dockW, dpy + 0.5 * s);
    ctx.lineTo(dpx + dockW, dpy - 1 * s);
    ctx.stroke();
  }

  // Dock posts with water rings
  for (let dp = 0; dp < 3; dp++) {
    const dpf = (dp + 0.5) / 3;
    const dpx = dockStartX + (dockEndX - dockStartX) * dpf - dockW;
    const dpy = dockStartY + (dockEndY - dockStartY) * dpf;

    // Water ring
    ctx.strokeStyle = "rgba(140,200,230,0.15)";
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.ellipse(dpx, dpy + 2 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Post as isometric cylinder
    const postH = 7 * s;
    const postR = 1 * s;
    const postRy = postR * ISO_Y_RATIO;
    const postTop = dpy - postH + 2 * s;

    ctx.fillStyle = "#4A3018";
    ctx.beginPath();
    ctx.ellipse(dpx, dpy + 2 * s, postR, postRy, 0, 0, Math.PI);
    ctx.lineTo(dpx - postR, postTop);
    ctx.ellipse(dpx, postTop, postR, postRy, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Top cap ellipse
    ctx.fillStyle = "#3A2008";
    ctx.beginPath();
    ctx.ellipse(dpx, postTop, postR, postRy, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rope on end post
    if (dp === 2) {
      ctx.strokeStyle = "#A08060";
      ctx.lineWidth = 0.8 * s;
      ctx.beginPath();
      ctx.moveTo(dpx, postTop + 2 * s);
      ctx.quadraticCurveTo(dpx - 3 * s, postTop + 6 * s, dpx - 2 * s, dpy + 1 * s);
      ctx.stroke();
    }
  }
}

// ─── Grandstand / Columned Pavilion (Neoclassical) ────────────────────────

export function drawCarnegieLakePavilion(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
): void {
  const pal = PAVILION_PAL;
  const bx = cx - 15 * s;
  const by = cy - 18 * s;

  const bodyW = 11;
  const bodyD = 11;
  const bodyH = 15;
  const Ws = bodyW * s;
  const Ds = bodyD * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;

  // Stepped stone platform (3 steps)
  for (let st = 0; st < 3; st++) {
    const stepW = bodyW + (2 - st) * 2;
    const stepD = bodyD + (2 - st) * 1;
    const stepH = 1.5;
    const stepY = by + (2 - st) * stepH * s;
    drawIsometricPrism(
      ctx,
      bx, stepY,
      stepW * s, stepD * s, stepH * s,
      st % 2 === 0 ? "#7A6A55" : "#8A7A65",
      st % 2 === 0 ? "#5A4A38" : "#6A5A48",
      st % 2 === 0 ? "#6A5A48" : "#7A6A58",
    );
  }

  // Base AO shadow
  drawBaseAO(ctx, bx, by, Ws, Ds, 0.15);

  // Back wall (recessed interior — left face acts as back wall for colonnade)
  const interiorGrad = ctx.createLinearGradient(bx - iW, wt + iD, bx, wt + 2 * iD);
  interiorGrad.addColorStop(0, "#3A3028");
  interiorGrad.addColorStop(1, "#4A4038");
  ctx.fillStyle = interiorGrad;
  ctx.beginPath();
  ctx.moveTo(bx - iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx - iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Stone coursing on back wall
  drawMortarLines(ctx, bx, by, Ws, Hs, 8, "rgba(0,0,0,0.12)", s);

  // Right wall (lit stone)
  const rwGrad = ctx.createLinearGradient(bx, wt + 2 * iD, bx + iW, wt + iD);
  rwGrad.addColorStop(0, "#7A6A55");
  rwGrad.addColorStop(0.4, "#8A7A65");
  rwGrad.addColorStop(1, "#6A5A48");
  ctx.fillStyle = rwGrad;
  ctx.beginPath();
  ctx.moveTo(bx + iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx + iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Face shading
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "right", 0.10);

  // Quoins on right wall
  drawQuoins(ctx, bx, by, Ws, Ds, Hs, s, pal.trim, 6);

  // Stone block texture on right wall
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.3 * s;
  for (let row = 1; row < 8; row++) {
    const rf = row / 8;
    const ry1 = wt + iD + Hs * rf;
    const ry2 = wt + 2 * iD + Hs * rf;
    ctx.beginPath();
    ctx.moveTo(bx + iW, ry1);
    ctx.lineTo(bx, ry2);
    ctx.stroke();
  }

  // Gothic windows on right wall using flush system
  for (let w = 0; w < 3; w++) {
    const wf = (w + 1) / 4;
    const wCx = bx + iW * wf;
    const wCy = wt + iD + Hs * 0.45 + iD * wf;
    drawIsoGothicWindow(
      ctx, wCx, wCy,
      2.5, 5, "right", s,
      "rgba(210,160,80",
      0.35 + Math.sin(time * 1.2 + w * 0.8) * 0.1,
      { frame: "#5A4A38", void: "#2A1A08", sill: "#6A5A48" },
    );
  }

  // Grand entrance door on right face
  drawEntrance(ctx, bx, by, Ws, Ds, Hs, s, "right", pal.door, pal.trim);

  // Classical columns on right face (using drawColumnPortico)
  const porticoH = bodyH - 3;
  const porticoSpan = bodyW * 0.9;
  const colAnchorX = bx + iW * 0.5;
  const colAnchorY = by + iD * 0.5;
  drawColumnPortico(
    ctx, colAnchorX, colAnchorY,
    4, porticoH, porticoSpan, s,
    "#8A7A65", "#9A8A72",
    "right",
  );

  // Entablature above columns
  const entW = bodyW + 1;
  const entD = 2;
  const entH = 2;
  const entY = wt + 2 * iD + 1 * s;
  drawIsometricPrism(
    ctx, bx + 0.5 * s, entY,
    entW * s, entD * s, entH * s,
    pal.cornice, pal.wallLeft, pal.wallRight,
  );

  // Gable roof
  const roofH = 5;
  drawGabledRoof(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal);
  drawRoofShingles(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal.roofDark, 5);
  drawRidgeCap(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal.cornice);

  // Pediment on right gable end
  const gableRR = {
    x: (bx + iW + bx) / 2 + (bodyW + 1.5) * ISO_COS * s * 0.5,
    y: wt + iD + (2 * iD - iD) / 2 - 1 * s,
  };
  drawPediment(ctx, gableRR.x, gableRR.y - roofH * s * 0.3, bodyD * 0.8, 3, s, "right", pal.wallRight, pal.cornice);

  // Balustrade along front (left) edge using isometric posts
  drawBalustrade(ctx, bx, by, iW, iD, s);
}

function drawBalustrade(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  iW: number, iD: number,
  s: number,
): void {
  const balCount = 6;
  for (let bl = 0; bl < balCount; bl++) {
    const blf = (bl + 0.5) / balCount;
    const blx = bx - iW + iW * blf;
    const bly = by + iD + (2 * iD - iD) * blf;
    const postR = 0.6 * s;
    const postRy = postR * ISO_Y_RATIO;
    const postH = 4 * s;
    const postTop = bly - postH;

    // Baluster as tapered isometric cylinder
    ctx.fillStyle = "#7A6A55";
    ctx.beginPath();
    ctx.ellipse(blx, bly, postR, postRy, 0, 0, Math.PI);
    ctx.lineTo(blx - postR * 0.7, postTop);
    ctx.ellipse(blx, postTop, postR * 0.7, postRy * 0.7, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();

    // Baluster bulge (vase shape)
    const bulgeY = bly - postH * 0.6;
    ctx.fillStyle = "#8A7A65";
    ctx.beginPath();
    ctx.ellipse(blx, bulgeY, postR * 1.3, postRy * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Top cap
    ctx.fillStyle = "#9A8A72";
    ctx.beginPath();
    ctx.ellipse(blx, postTop, postR * 0.7, postRy * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Top rail — isometric parallelogram
  ctx.fillStyle = "#8A7A65";
  ctx.beginPath();
  ctx.moveTo(bx - iW, by + iD - 4 * s);
  ctx.lineTo(bx, by + 2 * iD - 4 * s);
  ctx.lineTo(bx, by + 2 * iD - 3 * s);
  ctx.lineTo(bx - iW, by + iD - 3 * s);
  ctx.closePath();
  ctx.fill();
}

// ─── Clock Tower (Gothic) ──────────────────────────────────────────────────

export function drawCarnegieLakeClockTower(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
): void {
  const pal = TOWER_PAL;
  const bx = cx;
  const by = cy - 24 * s;

  const bodyW = 5;
  const bodyD = 5;
  const bodyH = 20;
  const Ws = bodyW * s;
  const Ds = bodyD * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;

  // Tower foundation
  drawTowerFoundation(ctx, bx, by, bodyW + 1, s, pal.foundTop, pal.foundLeft, pal.foundRight);

  // Main tower body using drawBuildingSection
  drawBaseAO(ctx, bx, by, Ws, Ds, 0.12);
  drawBuildingSection(ctx, bx, by, bodyW, bodyD, bodyH, s, pal, {
    rows: 3,
    leftCols: 1,
    rightCols: 1,
    wu: 0.15,
    wv: 0.18,
    arched: true,
  });

  // Face shading
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "left", 0.15);
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "right", 0.08);

  // Quoins
  drawQuoins(ctx, bx, by, Ws, Ds, Hs, s, pal.trim, 8);

  // String courses
  drawStringCourse(ctx, bx, by, Ws, Ds, Hs, 0.25, s, pal.trimLight);
  drawStringCourse(ctx, bx, by, Ws, Ds, Hs, 0.75, s, pal.trimLight);

  // Weather staining
  drawWeatherStains(ctx, bx, by, Ws, Ds, Hs, s, "left");
  drawWeatherStains(ctx, bx, by, Ws, Ds, Hs, s, "right");

  // Belfry openings near top (arched louver windows)
  drawBelfryOpening(ctx, bx, by, Ws, Ds, Hs, s, "right");

  // Clock face on right wall (properly foreshortened)
  drawClockFace(ctx, bx, by, Ws, Ds, Hs, s, time);

  // Parapet with crenellations
  const crenelH = 3;
  drawIsometricPrism(
    ctx, bx, wt,
    (bodyW + 0.5) * s, (bodyD + 0.5) * s, 1.5 * s,
    pal.cornice, pal.wallLeft, pal.wallRight,
  );
  drawCrenellations(ctx, bx, wt - 1.5 * s, bodyW + 0.5, bodyD + 0.5, s, pal.trim);

  // Pointed spire with copper patina
  const spireH = 11;
  drawConicalRoof(ctx, bx, wt - 1.5 * s, bodyW * 0.85, spireH, s, pal.roofFront, pal.roofDark);

  // Finial (gold sphere + cross)
  const spireTipY = wt - 1.5 * s - spireH * s;
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.arc(bx, spireTipY, 1.5 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#D4B050";
  ctx.beginPath();
  ctx.arc(bx + 0.3 * s, spireTipY - 0.3 * s, 0.7 * s, 0, Math.PI * 2);
  ctx.fill();

  // Weathervane
  ctx.strokeStyle = "#8A7050";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(bx, spireTipY - 1.5 * s);
  ctx.lineTo(bx, spireTipY - 5 * s);
  ctx.stroke();

  const vaneAngle = Math.sin(time * 0.3) * 0.4;
  ctx.save();
  ctx.translate(bx, spireTipY - 5 * s);
  ctx.rotate(vaneAngle);
  ctx.fillStyle = "#8A7050";
  ctx.beginPath();
  ctx.moveTo(3 * s, 0);
  ctx.lineTo(-2 * s, -0.8 * s);
  ctx.lineTo(-1.5 * s, 0);
  ctx.lineTo(-2 * s, 0.8 * s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBelfryOpening(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number,
  s: number,
  face: "left" | "right",
): void {
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;
  const dir = face === "right" ? 1 : -1;

  const belCx = bx + dir * iW * 0.5;
  const belCy = wt + iD * (face === "right" ? 0.5 : 1.5) + 3 * s;
  const belW = 2 * s;
  const belH = 3 * s;

  // Dark opening
  drawIsoFaceArch(ctx, belCx, belCy + belH, belW / s, belH / s + 2, s, face, "#1A1008", true);

  // Louver slats
  ctx.strokeStyle = "#3A2A1A";
  ctx.lineWidth = 0.5 * s;
  for (let lv = 0; lv < 3; lv++) {
    const dx = face === "left" ? ISO_COS : -ISO_COS;
    const dy = ISO_SIN;
    const lvy = belCy + lv * 1 * s;
    ctx.beginPath();
    ctx.moveTo(belCx + belW * 0.8 * dx, lvy + belW * 0.8 * dy);
    ctx.lineTo(belCx - belW * 0.8 * dx, lvy - belW * 0.8 * dy);
    ctx.stroke();
  }

  // Stone archivolt
  ctx.strokeStyle = "#6A5A48";
  ctx.lineWidth = 0.8 * s;
  const archCx = belCx;
  const archCy = belCy;
  ctx.beginPath();
  ctx.ellipse(archCx, archCy, belW * 1.1, belW * 0.5, face === "right" ? -0.46 : 0.46, Math.PI, 0);
  ctx.stroke();
}

function drawClockFace(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  Ws: number, Ds: number, Hs: number,
  s: number,
  time: number,
): void {
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;

  // Clock positioned on right face, mid-height
  const clkCx = bx + iW * 0.5;
  const clkCy = wt + iD * 0.5 + Hs * 0.52;
  const clkR = 2.5 * s;

  // Foreshortened for right isometric face: narrower horizontally, tilted
  const fX = clkR * 0.75;
  const fY = clkR;
  const tiltAngle = -Math.atan2(ISO_SIN, ISO_COS);

  ctx.save();
  ctx.translate(clkCx, clkCy);
  ctx.rotate(tiltAngle);

  // Clock face plate
  const clkG = ctx.createRadialGradient(0, 0, 0, 0, 0, fX);
  clkG.addColorStop(0, "#F0E8D8");
  clkG.addColorStop(0.7, "#E8DCC8");
  clkG.addColorStop(1, "#D0C4A8");
  ctx.fillStyle = clkG;
  ctx.beginPath();
  ctx.ellipse(0, 0, fX, fY, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer rim
  ctx.strokeStyle = "#5A4A30";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, fX, fY, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner rim
  ctx.strokeStyle = "#8A7A58";
  ctx.lineWidth = 0.4 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, fX - 1 * s, fY - 1 * s, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Hour markers (12 ticks)
  ctx.strokeStyle = "#3A2A18";
  for (let h = 0; h < 12; h++) {
    const ha = (h / 12) * Math.PI * 2 - Math.PI * 0.5;
    const isCardinal = h % 3 === 0;
    const innerR = isCardinal ? 0.4 : 0.6;
    ctx.lineWidth = (isCardinal ? 0.7 : 0.4) * s;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ha) * fX * innerR, Math.sin(ha) * fY * innerR);
    ctx.lineTo(Math.cos(ha) * fX * 0.85, Math.sin(ha) * fY * 0.85);
    ctx.stroke();
  }

  // Hour hand
  const clockAngle = (time * 0.1) % (Math.PI * 2);
  ctx.strokeStyle = "#1A100A";
  ctx.lineWidth = 0.8 * s;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(
    Math.cos(clockAngle - Math.PI * 0.5) * fX * 0.55,
    Math.sin(clockAngle - Math.PI * 0.5) * fY * 0.55,
  );
  ctx.stroke();

  // Minute hand
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(
    Math.cos(clockAngle * 12 - Math.PI * 0.5) * fX * 0.7,
    Math.sin(clockAngle * 12 - Math.PI * 0.5) * fY * 0.7,
  );
  ctx.stroke();
  ctx.lineCap = "butt";

  // Center pin
  ctx.fillStyle = "#3A2A18";
  ctx.beginPath();
  ctx.arc(0, 0, 0.5 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawCrenellations(
  ctx: CanvasRenderingContext2D,
  bx: number, by: number,
  W: number, D: number,
  s: number,
  color: string,
): void {
  const Ws = W * s;
  const Ds = D * s;
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const merlonH = 2.5 * s;
  const merlonW = 1.6 * s;

  // Merlons on right edge
  const count = 3;
  for (let m = 0; m < count; m++) {
    const mf = (m + 0.3) / count;
    const mx = bx + iW * mf;
    const my = by + iD * mf;

    drawIsometricPrism(
      ctx, mx, my,
      merlonW, merlonW, merlonH,
      color, "#5A4A38", "#6A5A48",
    );
  }

  // Merlons on left edge
  for (let m = 0; m < count; m++) {
    const mf = (m + 0.3) / count;
    const mx = bx - iW * mf;
    const my = by + iD * mf;

    drawIsometricPrism(
      ctx, mx, my,
      merlonW, merlonW, merlonH,
      color, "#4A3A28", "#5A4A38",
    );
  }
}
