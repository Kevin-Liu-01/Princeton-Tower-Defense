import { ISO_COS, ISO_SIN } from "../../constants";
import { drawIsometricPrism } from "../helpers";
import {
  type BuildingPalette,
  drawGabledRoof,
  drawConicalRoof,
  drawColumnPortico,
  drawTowerFoundation,
  drawIsoFaceArch,
  drawFaceShading,
  drawBaseAO,
  drawQuoins,
  drawStringCourse,
  drawWeatherStains,
  drawRoofShingles,
  drawChimney,
} from "./princetonBuildingHelpers";
import { drawIsoGothicWindow, drawIsoFlushDoor } from "../isoFlush";

const ISO_Y_RATIO = ISO_SIN / ISO_COS;

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

  // Foundation prism
  const fndH = 3 * s;
  drawIsometricPrism(ctx, bx, by + fndH, (bodyW + 2) * s, (bodyD + 2) * s, fndH, pal.foundTop, pal.foundLeft, pal.foundRight);

  // Base AO shadow
  drawBaseAO(ctx, bx, by, Ws, Ds, 0.15);

  // Main body — walls drawn manually so we can overlay timber frames + flush windows
  // Left wall (shadowed)
  const lwG = ctx.createLinearGradient(bx - iW, wt + iD, bx, wt + 2 * iD);
  lwG.addColorStop(0, pal.wallLeft);
  lwG.addColorStop(1, "#B89870");
  ctx.fillStyle = lwG;
  ctx.beginPath();
  ctx.moveTo(bx - iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx - iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Right wall (lit)
  const rwG = ctx.createLinearGradient(bx, wt + 2 * iD, bx + iW, wt + iD);
  rwG.addColorStop(0, pal.wallRight);
  rwG.addColorStop(1, "#C8B490");
  ctx.fillStyle = rwG;
  ctx.beginPath();
  ctx.moveTo(bx + iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx + iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Top face
  ctx.fillStyle = pal.wallTop;
  ctx.beginPath();
  ctx.moveTo(bx, wt);
  ctx.lineTo(bx + iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx - iW, wt + iD);
  ctx.closePath();
  ctx.fill();

  // Tudor timber frame overlay on both faces
  drawTimberFrame(ctx, bx, by, Ws, Ds, Hs, "left", s);
  drawTimberFrame(ctx, bx, by, Ws, Ds, Hs, "right", s);

  // Face shading for depth
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "left", 0.12);
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "right", 0.06);

  // Weather staining
  drawWeatherStains(ctx, bx, by, Ws, Ds, Hs, s, "left");
  drawWeatherStains(ctx, bx, by, Ws, Ds, Hs, s, "right");

  // Gothic windows flush with walls
  const bhWinPositions: Array<{ x: number; y: number; face: "left" | "right" }> = [
    { x: bx + iW * 0.35, y: wt + iD * 0.35 + Hs * 0.35, face: "right" },
    { x: bx + iW * 0.7, y: wt + iD * 0.7 + Hs * 0.35, face: "right" },
    { x: bx - iW * 0.35, y: wt + iD * 1.65 + Hs * 0.35, face: "left" },
    { x: bx - iW * 0.65, y: wt + iD * 1.35 + Hs * 0.35, face: "left" },
  ];
  for (const w of bhWinPositions) {
    drawIsoGothicWindow(
      ctx, w.x, w.y, 2.5, 3.5, w.face, s,
      "rgba(220,160,70", 0.4,
      { frame: "#3A2008", void: "#1A0A00", sill: "#4A3A28" },
    );
  }

  // Arched doorway flush with front face
  const doorCx = bx;
  const doorBaseY = by + 2 * iD - 3 * s;
  drawIsoFlushDoor(ctx, doorCx, doorBaseY - 3.5 * s, 4.5, 7, "front", s, {
    frameColor: "#4A3828",
    bodyDark: "#1A0A00",
    bodyMid: "#2A1808",
    bodyLight: "#3A2210",
    handleColor: "#C8A860",
    hasStep: true,
    stepColor: "#4A3A28",
    plankLines: 3,
  });

  // Gabled roof
  const roofH = 7;
  drawGabledRoof(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal);
  drawRoofShingles(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal.roofDark, 5);

  // Chimney on the roof
  drawChimney(ctx, bx + 3 * s, by - Hs - 3 * s, s, pal.trim, pal.trimLight);

  // Animated smoke puffs
  for (let sm = 0; sm < 4; sm++) {
    const smPhase = (time * 0.8 + sm * 0.7) % 3.5;
    const smAlpha = Math.max(0, 0.25 - smPhase * 0.08);
    if (smAlpha > 0) {
      const smX = bx + 3 * s + Math.sin(time * 0.5 + sm * 1.3) * 2 * s * (1 + smPhase * 0.4);
      const smY = by - Hs - 6 * s - smPhase * 5 * s;
      const smR = (1.5 + smPhase * 2) * s;
      ctx.fillStyle = `rgba(180,170,160,${smAlpha})`;
      ctx.beginPath();
      ctx.arc(smX, smY, smR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Dock/pier extending into water
  drawDock(ctx, bx, by, Ds, s);
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

  // Dock posts as isometric cylinders
  for (let dp = 0; dp < 3; dp++) {
    const dpf = (dp + 0.5) / 3;
    const dpx = dockStartX + (dockEndX - dockStartX) * dpf - dockW;
    const dpy = dockStartY + (dockEndY - dockStartY) * dpf;

    ctx.strokeStyle = "rgba(140,200,230,0.15)";
    ctx.lineWidth = 0.6 * s;
    ctx.beginPath();
    ctx.ellipse(dpx, dpy + 2 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.stroke();

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

    ctx.fillStyle = "#3A2008";
    ctx.beginPath();
    ctx.ellipse(dpx, postTop, postR, postRy, 0, 0, Math.PI * 2);
    ctx.fill();

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

  // Stepped stone platform (3 isometric steps)
  for (let st = 0; st < 3; st++) {
    const stepW = bodyW + (2 - st) * 2;
    const stepD = bodyD + (2 - st) * 1;
    const stepH = 1.5;
    const stepY = by + (2 - st) * stepH * s;
    drawIsometricPrism(
      ctx, bx, stepY,
      stepW * s, stepD * s, stepH * s,
      st % 2 === 0 ? "#7A6A55" : "#8A7A65",
      st % 2 === 0 ? "#5A4A38" : "#6A5A48",
      st % 2 === 0 ? "#6A5A48" : "#7A6A58",
    );
  }

  drawBaseAO(ctx, bx, by, Ws, Ds, 0.15);

  // Back wall (left face — recessed interior behind colonnade)
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
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.4 * s;
  for (let row = 1; row < 8; row++) {
    const rf = row / 8;
    ctx.beginPath();
    ctx.moveTo(bx - iW, wt + iD + Hs * rf);
    ctx.lineTo(bx, wt + 2 * iD + Hs * rf);
    ctx.stroke();
  }

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

  // Top face
  ctx.fillStyle = pal.wallTop;
  ctx.beginPath();
  ctx.moveTo(bx, wt);
  ctx.lineTo(bx + iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx - iW, wt + iD);
  ctx.closePath();
  ctx.fill();

  // Face shading
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "right", 0.10);

  // Quoins
  drawQuoins(ctx, bx, by, Ws, Ds, Hs, s, pal.trim, 6);

  // Stone block texture on right wall
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.3 * s;
  for (let row = 1; row < 8; row++) {
    const rf = row / 8;
    ctx.beginPath();
    ctx.moveTo(bx + iW, wt + iD + Hs * rf);
    ctx.lineTo(bx, wt + 2 * iD + Hs * rf);
    ctx.stroke();
  }

  // Gothic windows on right wall (flush with wall)
  for (let w = 0; w < 3; w++) {
    const wf = (w + 1) / 4;
    const wCx = bx + iW * wf;
    const wCy = wt + iD + iD * wf + Hs * 0.38;
    drawIsoGothicWindow(
      ctx, wCx, wCy,
      2.5, 5, "right", s,
      "rgba(210,160,80",
      0.35 + Math.sin(time * 1.2 + w * 0.8) * 0.1,
      { frame: "#5A4A38", void: "#2A1A08", sill: "#6A5A48" },
    );
  }

  // Grand entrance door flush with right face
  const archCx = bx + iW * 0.3;
  const archBaseY = wt + iD * 1.3 + Hs * 0.65;
  drawIsoFlushDoor(ctx, archCx, archBaseY, 5, 8, "right", s, {
    frameColor: "#5A4A38",
    bodyDark: "#0A0500",
    bodyMid: "#1A0A00",
    bodyLight: "#2A1808",
    handleColor: "#C8A860",
    hasStep: true,
    stepColor: "#5A4A38",
    plankLines: 2,
  });

  // Entablature (horizontal band above columns) — on right face only
  const entH = 2 * s;
  ctx.fillStyle = pal.cornice;
  ctx.beginPath();
  ctx.moveTo(bx + iW + 0.5 * s, wt + iD - entH);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD - entH);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD);
  ctx.lineTo(bx + iW + 0.5 * s, wt + iD);
  ctx.closePath();
  ctx.fill();

  // Frieze with triglyph marks
  ctx.fillStyle = "#7A6A55";
  ctx.beginPath();
  ctx.moveTo(bx + iW + 0.5 * s, wt + iD - entH * 2);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD - entH * 2);
  ctx.lineTo(bx - 0.5 * s, wt + 2 * iD - entH);
  ctx.lineTo(bx + iW + 0.5 * s, wt + iD - entH);
  ctx.closePath();
  ctx.fill();

  // Triglyph marks
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.6 * s;
  for (let tg = 0; tg < 6; tg++) {
    const tgf = (tg + 0.5) / 6;
    const tgx = bx + iW * tgf + 0.5 * s * (1 - tgf);
    const tgy1 = wt + iD + iD * tgf - entH * 2;
    const tgy2 = tgy1 + entH;
    ctx.beginPath();
    ctx.moveTo(tgx - 0.3 * s, tgy1);
    ctx.lineTo(tgx - 0.3 * s, tgy2);
    ctx.moveTo(tgx + 0.3 * s, tgy1);
    ctx.lineTo(tgx + 0.3 * s, tgy2);
    ctx.stroke();
  }

  // Cornice (projecting top)
  ctx.fillStyle = "#9A8A72";
  ctx.beginPath();
  ctx.moveTo(bx + (iW + 1 * s), wt + iD - entH * 2 - 1.5 * s);
  ctx.lineTo(bx - 1 * s, wt + 2 * iD - entH * 2 - 1.5 * s);
  ctx.lineTo(bx, wt + 2 * iD - entH * 2);
  ctx.lineTo(bx + iW, wt + iD - entH * 2);
  ctx.closePath();
  ctx.fill();

  // Gable roof
  const roofH = 5;
  drawGabledRoof(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal);
  drawRoofShingles(ctx, bx, by, bodyW, bodyD, bodyH, roofH, s, pal.roofDark, 5);

  // Classical columns on left (front) face — drawn LAST so they layer in front
  const porticoH = bodyH - 3;
  const porticoSpan = bodyD * 0.9;
  const colAnchorX = bx - iW * 0.5;
  const colAnchorY = by + iD * 1.5;
  drawColumnPortico(
    ctx, colAnchorX, colAnchorY,
    4, porticoH, porticoSpan, s,
    "#8A7A65", "#9A8A72",
    "left",
  );

  // Balustrade along front (left) edge — drawn after columns
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
    const bly = by + iD + iD * blf;
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

    // Bulge
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

  // Top rail — isometric parallelogram along left face
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

  drawBaseAO(ctx, bx, by, Ws, Ds, 0.12);

  // Left wall (shadowed stone)
  const twlG = ctx.createLinearGradient(bx - iW, wt + iD, bx, wt + 2 * iD);
  twlG.addColorStop(0, pal.wallLeft);
  twlG.addColorStop(0.5, "#5A4A3A");
  twlG.addColorStop(1, pal.wallLeft);
  ctx.fillStyle = twlG;
  ctx.beginPath();
  ctx.moveTo(bx - iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx - iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Stone coursing on left
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 0.3 * s;
  for (let row = 1; row < 10; row++) {
    const rf = row / 10;
    ctx.beginPath();
    ctx.moveTo(bx - iW, wt + iD + Hs * rf);
    ctx.lineTo(bx, wt + 2 * iD + Hs * rf);
    ctx.stroke();
  }

  // Right wall (lit stone)
  const twrG = ctx.createLinearGradient(bx, wt + 2 * iD, bx + iW, wt + iD);
  twrG.addColorStop(0, pal.wallRight);
  twrG.addColorStop(0.5, "#7A6A55");
  twrG.addColorStop(1, pal.wallRight);
  ctx.fillStyle = twrG;
  ctx.beginPath();
  ctx.moveTo(bx + iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx, by + 2 * iD);
  ctx.lineTo(bx + iW, by + iD);
  ctx.closePath();
  ctx.fill();

  // Stone coursing on right
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.3 * s;
  for (let row = 1; row < 10; row++) {
    const rf = row / 10;
    ctx.beginPath();
    ctx.moveTo(bx + iW, wt + iD + Hs * rf);
    ctx.lineTo(bx, wt + 2 * iD + Hs * rf);
    ctx.stroke();
  }

  // Top face
  ctx.fillStyle = pal.wallTop;
  ctx.beginPath();
  ctx.moveTo(bx, wt);
  ctx.lineTo(bx + iW, wt + iD);
  ctx.lineTo(bx, wt + 2 * iD);
  ctx.lineTo(bx - iW, wt + iD);
  ctx.closePath();
  ctx.fill();

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

  // Gothic windows flush on right wall (3 rows)
  for (let tw = 0; tw < 3; tw++) {
    const wf = 0.45;
    const vf = 0.2 + tw * 0.25;
    const wCx = bx + iW * wf;
    const wCy = wt + iD + iD * wf + Hs * vf;
    const glowA = tw === 1 ? 0.4 : 0.2;
    drawIsoGothicWindow(
      ctx, wCx, wCy,
      2.8, 4.5, "right", s,
      "rgba(200,150,70",
      glowA + Math.sin(time * 1.5 + tw) * 0.04,
      { frame: "#5A4A38", void: "#1A1008", sill: "#6A5A48" },
    );
  }

  // Belfry openings near top
  drawBelfryOpening(ctx, bx, by, Ws, Ds, Hs, s, "right");

  // Clock face on right wall (properly foreshortened)
  drawClockFace(ctx, bx, by, Ws, Ds, Hs, s, time);

  // Parapet with crenellations
  drawIsometricPrism(
    ctx, bx, wt,
    (bodyW + 0.5) * s, (bodyD + 0.5) * s, 1.5 * s,
    pal.cornice, pal.wallLeft, pal.wallRight,
  );
  drawCrenellations(ctx, bx, wt - 1.5 * s, bodyW + 0.5, bodyD + 0.5, s, pal.trim);

  // Pointed spire
  const spireH = 11;
  drawConicalRoof(ctx, bx, wt - 1.5 * s, bodyW * 0.85, spireH, s, pal.roofFront, pal.roofDark);

  // Finial
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

  // Position on the face near the top
  const faceF = 0.5;
  const vertF = 0.08;
  const belCx = bx + (face === "right" ? 1 : -1) * iW * faceF;
  const belCy = wt + iD + iD * faceF + Hs * vertF;

  drawIsoFaceArch(ctx, belCx, belCy + 3 * s, 2, 5, s, face, "#1A1008", true);

  // Louver slats
  ctx.strokeStyle = "#3A2A1A";
  ctx.lineWidth = 0.5 * s;
  const dx = face === "left" ? ISO_COS : -ISO_COS;
  const dy = ISO_SIN;
  for (let lv = 0; lv < 3; lv++) {
    const lvy = belCy + lv * 1 * s;
    ctx.beginPath();
    ctx.moveTo(belCx + 1.5 * s * dx, lvy + 1.5 * s * dy);
    ctx.lineTo(belCx - 1.5 * s * dx, lvy - 1.5 * s * dy);
    ctx.stroke();
  }

  // Stone archivolt frame
  ctx.strokeStyle = "#6A5A48";
  ctx.lineWidth = 0.8 * s;
  ctx.beginPath();
  ctx.ellipse(belCx, belCy, 2 * s * 0.8, 1.5 * s, face === "right" ? -0.46 : 0.46, Math.PI, 0);
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

  // Clock on right face at ~48% height
  const clkCx = bx + iW * 0.5;
  const clkCy = wt + iD * 0.5 + Hs * 0.48;
  const clkR = 2.5 * s;

  // Foreshortened ellipse tilted to match right isometric face
  const fX = clkR * 0.75;
  const fY = clkR;
  const tiltAngle = -Math.atan2(ISO_SIN, ISO_COS);

  ctx.save();
  ctx.translate(clkCx, clkCy);
  ctx.rotate(tiltAngle);

  // Face plate
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

  // Hour markers
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

  const count = 3;

  // Right edge merlons
  for (let m = 0; m < count; m++) {
    const mf = (m + 0.3) / count;
    const mx = bx + iW * mf;
    const my = by + iD * mf;
    drawIsometricPrism(ctx, mx, my, merlonW, merlonW, merlonH, color, "#5A4A38", "#6A5A48");
  }

  // Left edge merlons
  for (let m = 0; m < count; m++) {
    const mf = (m + 0.3) / count;
    const mx = bx - iW * mf;
    const my = by + iD * mf;
    drawIsometricPrism(ctx, mx, my, merlonW, merlonW, merlonH, color, "#4A3A28", "#5A4A38");
  }
}

// ─── Rowboat ──────────────────────────────────────────────────────────────

export function drawCarnegieLakeRowboat(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  s: number,
  time: number,
): void {
  const bob = Math.sin(time * 1.1) * 1.5 * s;
  const bx = cx + 7 * s;
  const by = cy + 4 * s + bob;
  const tilt = Math.sin(time * 0.8) * 0.03;

  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(tilt);

  const hullLen = 6 * s;
  const hullW = 2.2 * s;
  const hullH = 1.8 * s;
  const hullWy = hullW * ISO_Y_RATIO;

  // Water shadow beneath hull
  ctx.fillStyle = "rgba(0,40,60,0.18)";
  ctx.beginPath();
  ctx.ellipse(0, 1.5 * s, hullLen * 1.05, hullWy * 1.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hull bottom (dark, submerged)
  ctx.fillStyle = "#3A2210";
  ctx.beginPath();
  ctx.ellipse(0, 0.5 * s, hullLen, hullWy, 0, 0, Math.PI);
  ctx.fill();

  // Hull left side (shadowed)
  const hullLG = ctx.createLinearGradient(-hullLen, 0, 0, 0);
  hullLG.addColorStop(0, "#4A2A10");
  hullLG.addColorStop(1, "#5A3A18");
  ctx.fillStyle = hullLG;
  ctx.beginPath();
  ctx.moveTo(-hullLen, 0);
  ctx.quadraticCurveTo(-hullLen * 0.9, -hullH, -hullLen * 0.3, -hullH);
  ctx.lineTo(hullLen * 0.3, -hullH);
  ctx.quadraticCurveTo(hullLen * 0.9, -hullH, hullLen, 0);
  ctx.ellipse(0, 0, hullLen, hullWy * 0.6, 0, 0, Math.PI, true);
  ctx.closePath();
  ctx.fill();

  // Hull right side (lit)
  const hullRG = ctx.createLinearGradient(0, 0, hullLen, 0);
  hullRG.addColorStop(0, "#6D4C2A");
  hullRG.addColorStop(1, "#7A5A30");
  ctx.fillStyle = hullRG;
  ctx.beginPath();
  ctx.moveTo(-hullLen, 0);
  ctx.quadraticCurveTo(-hullLen * 0.9, -hullH, -hullLen * 0.3, -hullH);
  ctx.lineTo(hullLen * 0.3, -hullH);
  ctx.quadraticCurveTo(hullLen * 0.9, -hullH, hullLen, 0);
  ctx.ellipse(0, 0, hullLen, hullWy * 0.6, 0, 0, -Math.PI, false);
  ctx.closePath();
  ctx.fill();

  // Gunwale (top edge of hull)
  ctx.strokeStyle = "#8B7355";
  ctx.lineWidth = 0.7 * s;
  ctx.beginPath();
  ctx.moveTo(-hullLen, 0);
  ctx.quadraticCurveTo(-hullLen * 0.9, -hullH, -hullLen * 0.3, -hullH);
  ctx.lineTo(hullLen * 0.3, -hullH);
  ctx.quadraticCurveTo(hullLen * 0.9, -hullH, hullLen, 0);
  ctx.stroke();

  // Interior visible (dark)
  ctx.fillStyle = "#3A2818";
  ctx.beginPath();
  ctx.ellipse(0, -0.4 * s, hullLen * 0.85, hullWy * 0.45, 0, Math.PI, 0);
  ctx.fill();

  // Plank lines inside hull
  ctx.strokeStyle = "rgba(90,60,30,0.3)";
  ctx.lineWidth = 0.3 * s;
  for (let p = -2; p <= 2; p++) {
    const px = p * hullLen * 0.22;
    ctx.beginPath();
    ctx.moveTo(px, -hullH * 0.9);
    ctx.lineTo(px, 0.3 * s);
    ctx.stroke();
  }

  // Seat (isometric parallelogram)
  const seatW = 2.5 * s;
  const seatD = hullWy * 0.7;
  ctx.fillStyle = "#7A5A30";
  ctx.beginPath();
  ctx.moveTo(-seatW * 0.5 * ISO_COS, -0.6 * s + seatD * 0.5);
  ctx.lineTo(seatW * 0.5 * ISO_COS, -0.6 * s - seatD * 0.5);
  ctx.lineTo(seatW * 0.5 * ISO_COS, -0.6 * s - seatD * 0.5 + 0.5 * s);
  ctx.lineTo(-seatW * 0.5 * ISO_COS, -0.6 * s + seatD * 0.5 + 0.5 * s);
  ctx.closePath();
  ctx.fill();

  // Oars
  const oarSway = Math.sin(time * 1.5) * 0.15;
  const oarSwayY = Math.sin(time * 1.5) * 0.7 * s;

  ctx.strokeStyle = "#A08060";
  ctx.lineWidth = 0.5 * s;
  // Left oar
  ctx.beginPath();
  ctx.moveTo(-1.2 * s, -0.3 * s);
  ctx.lineTo(-6.5 * s, 3 * s + oarSwayY);
  ctx.stroke();
  // Right oar
  ctx.beginPath();
  ctx.moveTo(1.2 * s, -0.3 * s);
  ctx.lineTo(6.5 * s, 3 * s - oarSwayY);
  ctx.stroke();

  // Oar blades (isometric ellipses)
  ctx.fillStyle = "#A08060";
  ctx.beginPath();
  ctx.ellipse(-6.5 * s, 3 * s + oarSwayY, 1.4 * s, 0.6 * s, 0.5 + oarSway, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#806040";
  ctx.lineWidth = 0.3 * s;
  ctx.stroke();
  ctx.fillStyle = "#A08060";
  ctx.beginPath();
  ctx.ellipse(6.5 * s, 3 * s - oarSwayY, 1.4 * s, 0.6 * s, -0.5 - oarSway, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#806040";
  ctx.stroke();

  // Water ripples around hull
  ctx.strokeStyle = "rgba(140,220,240,0.12)";
  ctx.lineWidth = 0.4 * s;
  for (let r = 0; r < 3; r++) {
    const rPhase = ((time * 0.5 + r * 0.4) % 2) / 2;
    const rAlpha = 0.12 * (1 - rPhase);
    if (rAlpha > 0.02) {
      ctx.strokeStyle = `rgba(140,220,240,${rAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        0, 0.5 * s,
        hullLen * (1.05 + rPhase * 0.3),
        hullWy * (1.1 + rPhase * 0.3),
        0, 0, Math.PI * 2,
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}
