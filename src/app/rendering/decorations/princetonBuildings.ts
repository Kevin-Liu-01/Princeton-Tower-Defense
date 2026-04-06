import { ISO_COS, ISO_SIN } from "../../constants";
import { drawIsometricPrism } from "../helpers";
import { setShadowBlur, clearShadow } from "../performance";
import { drawDirectionalShadow } from "./shadowHelpers";
import type { LandmarkParams } from "./landmarkBuildings";
import {
  type BuildingPalette,
  drawBuildingSection,
  drawGabledRoof,
  drawHipRoof,
  drawCylindricalTower,
  drawConicalRoof,
  drawCircularBattlements,
  drawDome,
  drawColumnPortico,
  drawPediment,
  drawMortarLines,
  drawIsoFaceQuad,
  drawWindowOnFace,
  drawRoundWindowOnCylinder,
  drawFlyingButtress,
  drawBrickTexture,
  drawStoneBlockTexture,
  drawTowerFoundation,
  drawIsoFaceArch,
  drawFaceShading,
  drawBaseAO,
  drawQuoins,
  drawStringCourse,
  drawWindowGlows,
  drawEntrance,
  drawWeatherStains,
  drawRidgeCap,
  drawRoofShingles,
  drawFlagPole,
  drawPinnacle,
  drawChimney,
} from "./princetonBuildingHelpers";

// Helper: evenly space N front-facing angles on [marginπ, (1-margin)π]
function frontAngles(n: number, margin: number = 0.15): number[] {
  const out: number[] = [];
  if (n <= 1) return [Math.PI * 0.5];
  for (let i = 0; i < n; i++) {
    out.push(Math.PI * (margin + (i * (1 - 2 * margin)) / (n - 1)));
  }
  return out;
}

// =========================================================================
// GRASSLAND — Princeton Chapel
// =========================================================================

const CHAPEL_PAL: BuildingPalette = {
  wallTop: "#E8DCC8",
  wallLeft: "#D4C8B0",
  wallRight: "#B8A888",
  roofFront: "#5A8A6A",
  roofSide: "#4A7A5A",
  roofTop: "#6A9A7A",
  roofDark: "#3A6A4A",
  trim: "#8A7A60",
  trimLight: "#F0E8D8",
  cornice: "#F8F0E4",
  glass: "#1a1830",
  foundTop: "#A09888",
  foundLeft: "#908878",
  foundRight: "#706858",
  door: "#3A2818",
  accent: "#C49A3C",
};

export function renderPrincetonChapel(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = CHAPEL_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      38 * s,
      14 * s,
      58 * s,
      0.28,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  const bodyW = 16;
  const bodyD = 16;
  const bodyH = 28;

  // Tower foundation — drawn first so it layers behind everything
  const tDist = 18;
  const tbx = bx - tDist * ISO_COS * s;
  const tby = by + (tDist / 1.65) * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    tbx,
    tby,
    5,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Round bell tower — back-left, drawn BEFORE main body so it layers behind
  drawCylindricalTower(
    ctx,
    tbx,
    tby,
    5,
    40,
    s,
    "#E8DCC8",
    "#D4C8B0",
    "#A09080",
  );
  drawCircularBattlements(ctx, tbx, tby - 40 * s, 5, s, pal.cornice, 10);
  drawDome(
    ctx,
    tbx,
    tby - 40 * s - 2 * s,
    4.5,
    8,
    s,
    "#7DB88A",
    "#5A9A68",
    "#3A7A48",
  );
  const lanternY = tby - 40 * s - 10 * s;
  drawCylindricalTower(
    ctx,
    tbx,
    lanternY + 3 * s,
    1.5,
    3,
    s,
    "#6A9A7A",
    "#5A8A6A",
    "#4A7A5A",
  );
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.moveTo(tbx, lanternY - 4 * s);
  ctx.lineTo(tbx - 1 * s, lanternY);
  ctx.lineTo(tbx + 1 * s, lanternY);
  ctx.closePath();
  ctx.fill();
  drawFlagPole(ctx, tbx, lanternY - 4 * s, 6, s, pal.accent, "#FF8C00", time);
  const tWinAngles = frontAngles(4);
  for (let row = 0; row < 4; row++) {
    drawRoundWindowOnCylinder(
      ctx,
      tbx,
      tby,
      5,
      40,
      tWinAngles[row],
      0.2 + row * 0.18,
      1.5,
      s,
      pal.trim,
      pal.glass,
    );
  }

  const Ws = bodyW * s;
  const Ds = bodyD * s;
  const Hs = bodyH * s;
  drawBaseAO(ctx, bx, by, Ws, Ws, 0.15);

  // Main nave — drawn after back-left tower
  drawBuildingSection(ctx, bx, by, bodyW, bodyD, bodyH, s, pal, {
    rows: 3,
    leftCols: 4,
    rightCols: 3,
    wu: 0.14,
    wv: 0.18,
    arched: true,
  });
  drawGabledRoof(ctx, bx, by, bodyW, bodyD, bodyH, 10, s, pal);
  drawRidgeCap(ctx, bx, by, bodyW, bodyD, bodyH, 10, s, pal.accent);
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW,
    bodyD,
    bodyH,
    10,
    s,
    "rgba(40,80,50,0.05)",
    5,
  );
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "left", 0.12);
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "right", 0.18);
  drawStringCourse(ctx, bx, by, Ws, Ds, Hs, s, 0.65, pal.cornice);
  drawStringCourse(ctx, bx, by, Ws, Ds, Hs, s, 0.35, pal.cornice);
  drawQuoins(ctx, bx, by, Ws, Ds, Hs, s, pal.trimLight, 6);
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ds,
    Hs,
    s,
    "left",
    11,
    3,
    "rgba(80,70,50,0.04)",
  );

  const iW = Ws * ISO_COS;
  const wt = by - Hs;
  const iD = Ws * ISO_SIN;

  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ds,
    Hs,
    s,
    "left",
    4,
    3,
    "rgba(255,200,120,0.08)",
    time,
  );

  // Rose window on right face of nave — projected onto the face via canvas transform
  const roseCx = bx + iW * 0.5;
  const roseCy = wt + iD * -0.05 + Hs * 0.25;
  const roseR = 3.5 * s;
  ctx.save();
  ctx.translate(roseCx, roseCy);
  ctx.transform(-ISO_COS, ISO_SIN, 0, -1, 0, 0);

  ctx.fillStyle = pal.trim;
  ctx.beginPath();
  ctx.arc(0, 0, roseR * 1.15, 0, Math.PI * 2);
  ctx.fill();
  const roseColors = [
    "#6A2080",
    "#2050A0",
    "#A03040",
    "#206080",
    "#806020",
    "#305090",
  ];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const na = ((i + 1) / 6) * Math.PI * 2;
    ctx.fillStyle = roseColors[i];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * roseR, Math.sin(a) * roseR);
    ctx.lineTo(Math.cos(na) * roseR, Math.sin(na) * roseR);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 0.4 * s;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * roseR, Math.sin(a) * roseR);
    ctx.stroke();
  }
  ctx.restore();

  // Warm entrance glow
  const entrX = bx + iW * 0.3;
  const entrY = by + iD * 1.3;
  const glowA = 0.06 + Math.sin(time * 0.6) * 0.02;
  const glow = ctx.createRadialGradient(entrX, entrY, 0, entrX, entrY, 6 * s);
  glow.addColorStop(0, `rgba(255,200,120,${glowA})`);
  glow.addColorStop(1, "rgba(255,200,120,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(entrX, entrY, 5 * s, 2.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// GRASSLAND — Firestone Library
// =========================================================================

const LIBRARY_PAL: BuildingPalette = {
  wallTop: "#A85A48",
  wallLeft: "#944A3A",
  wallRight: "#7A3828",
  roofFront: "#4A6848",
  roofSide: "#3A5838",
  roofTop: "#5A7858",
  roofDark: "#2A4828",
  trim: "#C8B898",
  trimLight: "#E8DCC4",
  cornice: "#F0E8D4",
  glass: "#181828",
  foundTop: "#908070",
  foundLeft: "#807060",
  foundRight: "#605040",
  door: "#2A1810",
  accent: "#B8943C",
};

export function renderFirestoneLibrary(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = LIBRARY_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      48 * s,
      16 * s,
      48 * s,
      0.26,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  const bodyW = 24;
  const bodyD = 24;
  const bodyH = 18;
  const Ws = bodyW * s;
  const Hs = bodyH * s;
  const Ds_fl = bodyD * s;
  const iW = Ws * ISO_COS;
  const iD = Ds_fl * ISO_SIN;
  const wt = by - Hs;

  // Tower positions — top-right and bottom-left diagonal, pulled close to building
  const tDist = 16;
  const backTx = bx - tDist * 0.5 * ISO_COS * s;
  const backTy = by - tDist * ISO_SIN * s;
  const frontTx = bx - tDist * ISO_COS * s;
  const frontTy = by + tDist * 2.5 * ISO_SIN * s;
  const tR = 6;
  const tH = 32;

  // Foundations — drawn first behind everything
  drawTowerFoundation(
    ctx,
    backTx,
    backTy,
    tR,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );
  drawTowerFoundation(
    ctx,
    frontTx,
    frontTy,
    tR,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Back tower — drawn BEFORE main body so it layers behind
  drawCylindricalTower(
    ctx,
    backTx,
    backTy,
    tR,
    tH,
    s,
    "#A85A48",
    "#944A3A",
    "#7A3828",
  );
  drawCircularBattlements(ctx, backTx, backTy - tH * s, tR, s, pal.cornice, 10);
  drawConicalRoof(
    ctx,
    backTx,
    backTy - tH * s - 2 * s,
    tR + 0.5,
    11,
    s,
    "#4A6848",
    "#2A4828",
  );
  const backWinAngles = frontAngles(3);
  for (let row = 0; row < 3; row++) {
    drawRoundWindowOnCylinder(
      ctx,
      backTx,
      backTy,
      tR,
      tH,
      backWinAngles[row],
      0.2 + row * 0.22,
      1.5,
      s,
      pal.trim,
      pal.glass,
    );
  }

  // Main body
  drawBaseAO(ctx, bx, by, Ws, Ws, 0.15);
  drawBuildingSection(ctx, bx, by, bodyW, bodyD, bodyH, s, pal, {
    rows: 2,
    leftCols: 6,
    rightCols: 4,
    wu: 0.1,
    wv: 0.26,
    arched: true,
  });
  drawBrickTexture(
    ctx,
    bx,
    by,
    Ws,
    Hs,
    s,
    "#C06848",
    "rgba(0,0,0,0.08)",
    "left",
  );
  drawBrickTexture(
    ctx,
    bx,
    by,
    Ws,
    Hs,
    s,
    "#C06848",
    "rgba(0,0,0,0.08)",
    "right",
  );
  drawHipRoof(ctx, bx, by, bodyW, bodyD, bodyH, 7, s, pal);
  drawFaceShading(ctx, bx, by, Ws, Ds_fl, Hs, "left", 0.12);
  drawFaceShading(ctx, bx, by, Ws, Ds_fl, Hs, "right", 0.18);
  drawStringCourse(ctx, bx, by, Ws, Ds_fl, Hs, s, 0.5, pal.cornice);
  drawQuoins(ctx, bx, by, Ws, Ds_fl, Hs, s, pal.trimLight, 4);
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW,
    bodyD,
    bodyH,
    7,
    s,
    "rgba(30,60,30,0.04)",
    4,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ds_fl,
    Hs,
    s,
    "left",
    6,
    2,
    "rgba(255,224,176,0.07)",
    time,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ds_fl,
    Hs,
    s,
    "right",
    4,
    2,
    "rgba(255,224,176,0.07)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ds_fl,
    Hs,
    s,
    "left",
    22,
    4,
    "rgba(100,60,30,0.03)",
  );

  // Octagonal cupola with green dome on roof
  const cupBaseY = by - Hs - 2 * s;
  drawCylindricalTower(
    ctx,
    bx,
    cupBaseY + 8 * s,
    4,
    8,
    s,
    pal.trimLight,
    "#D8CCA8",
    pal.trim,
  );
  drawCircularBattlements(ctx, bx, cupBaseY, 4, s, pal.cornice, 8);
  const cupWinAngles = frontAngles(4);
  for (let i = 0; i < 4; i++) {
    drawRoundWindowOnCylinder(
      ctx,
      bx,
      cupBaseY + 8 * s,
      4,
      8,
      cupWinAngles[i],
      0.4,
      1.2,
      s,
      pal.trim,
      "#2838A0",
    );
  }
  drawDome(
    ctx,
    bx,
    cupBaseY - 1 * s,
    3.8,
    6,
    s,
    "#6A9A6A",
    "#4A7A4A",
    "#2A5A2A",
  );

  // Entrance portico on right face — columns supporting an entablature
  const colAnchorX = bx + iW * 0.55;
  const colAnchorY = by + iD * 1.5;
  const porticoH = 12;
  const porticoSpan = 18;

  // Entablature (horizontal beam) above columns on the right face
  const entTop = colAnchorY - porticoH * s;
  const entHw = porticoSpan * 0.5 * s;
  const fdx = -ISO_COS;
  const fdy = ISO_SIN;
  ctx.fillStyle = pal.cornice;
  ctx.beginPath();
  ctx.moveTo(colAnchorX + entHw * fdx, entTop + entHw * fdy);
  ctx.lineTo(colAnchorX - entHw * fdx, entTop - entHw * fdy);
  ctx.lineTo(colAnchorX - entHw * fdx, entTop - entHw * fdy + 2 * s);
  ctx.lineTo(colAnchorX + entHw * fdx, entTop + entHw * fdy + 2 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.trimLight;
  ctx.beginPath();
  ctx.moveTo(colAnchorX + entHw * fdx, entTop + entHw * fdy - 0.5 * s);
  ctx.lineTo(colAnchorX - entHw * fdx, entTop - entHw * fdy - 0.5 * s);
  ctx.lineTo(colAnchorX - entHw * fdx, entTop - entHw * fdy);
  ctx.lineTo(colAnchorX + entHw * fdx, entTop + entHw * fdy);
  ctx.closePath();
  ctx.fill();

  // Columns
  drawColumnPortico(
    ctx,
    colAnchorX,
    colAnchorY,
    5,
    porticoH,
    porticoSpan,
    s,
    pal.trimLight,
    pal.cornice,
    "right",
  );

  // Entrance arch below entablature
  drawEntrance(
    ctx,
    bx,
    by,
    Ws,
    Ds_fl,
    Hs,
    s,
    "right",
    pal.door,
    pal.trim,
    0.4,
    0.14,
    0.32,
  );

  // Limestone inscription band on right face
  ctx.fillStyle = pal.cornice;
  const inscY = by - Hs * 0.85;
  ctx.beginPath();
  ctx.moveTo(bx + iW + 0.5 * s, inscY + iD);
  ctx.lineTo(bx - 0.5 * s, inscY + 2 * iD);
  ctx.lineTo(bx - 0.5 * s, inscY + 2 * iD + 2.5 * s);
  ctx.lineTo(bx + iW + 0.5 * s, inscY + iD + 2.5 * s);
  ctx.closePath();
  ctx.fill();

  // Front tower — drawn AFTER main body so it layers in front
  drawCylindricalTower(
    ctx,
    frontTx,
    frontTy,
    tR,
    tH,
    s,
    "#A85A48",
    "#944A3A",
    "#7A3828",
  );
  drawCircularBattlements(
    ctx,
    frontTx,
    frontTy - tH * s,
    tR,
    s,
    pal.cornice,
    10,
  );
  drawConicalRoof(
    ctx,
    frontTx,
    frontTy - tH * s - 2 * s,
    tR + 0.5,
    11,
    s,
    "#4A6848",
    "#2A4828",
  );
  const frontWinAngles = frontAngles(3);
  for (let row = 0; row < 3; row++) {
    drawRoundWindowOnCylinder(
      ctx,
      frontTx,
      frontTy,
      tR,
      tH,
      frontWinAngles[row],
      0.2 + row * 0.22,
      1.5,
      s,
      pal.trim,
      pal.glass,
    );
  }
  drawFlagPole(
    ctx,
    frontTx,
    frontTy - tH * s - 13 * s,
    6,
    s,
    pal.trim,
    "#B8943C",
    time,
  );

  // Warm library glow
  const glA = 0.04 + Math.sin(time * 0.5) * 0.015;
  setShadowBlur(ctx, 5 * s, "#FFE0B0");
  ctx.fillStyle = `rgba(255,224,176,${glA})`;
  ctx.beginPath();
  ctx.ellipse(bx, by + iD, iW * 0.6, Hs * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

// =========================================================================
// GRASSLAND — Blair Arch
// =========================================================================

const ARCH_PAL: BuildingPalette = {
  wallTop: "#C8B090",
  wallLeft: "#B09878",
  wallRight: "#907858",
  roofFront: "#505868",
  roofSide: "#404858",
  roofTop: "#606878",
  roofDark: "#303848",
  trim: "#8A7858",
  trimLight: "#DCD0B8",
  cornice: "#EAE0CC",
  glass: "#141828",
  foundTop: "#989080",
  foundLeft: "#888070",
  foundRight: "#686058",
  door: "#1A1008",
  accent: "#D4A840",
};

export function renderBlairArch(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = ARCH_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      34 * s,
      12 * s,
      50 * s,
      0.25,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  // Turret foundations — drawn first so they layer behind everything
  const tOff = 16;
  const ltx = bx - tOff * ISO_COS * s;
  const lty = by - tOff * ISO_SIN * s;
  const rtx = bx + tOff * ISO_COS * s;
  const rty = by + tOff * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    ltx,
    lty,
    6,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );
  drawTowerFoundation(
    ctx,
    rtx,
    rty,
    6,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Back-left turret — drawn BEFORE main wall so it layers behind
  drawCylindricalTower(
    ctx,
    ltx,
    lty,
    6,
    32,
    s,
    "#C8B090",
    "#B8A480",
    "#907858",
  );
  drawCircularBattlements(ctx, ltx, lty - 32 * s, 6, s, pal.cornice, 10);
  drawConicalRoof(
    ctx,
    ltx,
    lty - 32 * s - 2 * s,
    6.5,
    12,
    s,
    "#606878",
    "#404050",
  );
  const turretWinAngles = frontAngles(3);
  for (let row = 0; row < 3; row++) {
    drawRoundWindowOnCylinder(
      ctx,
      ltx,
      lty,
      6,
      32,
      turretWinAngles[row],
      0.2 + row * 0.22,
      1.6,
      s,
      pal.trim,
      pal.glass,
    );
  }

  // Connecting wall (square footprint for proper isometric diamond)
  const wallW = 18;
  const wallH = 18;
  const Ws = wallW * s;
  const Hs = wallH * s;
  drawBaseAO(ctx, bx, by, Ws, Ws, 0.12);
  drawIsometricPrism(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    pal.wallTop,
    pal.wallLeft,
    pal.wallRight,
  );
  drawStoneBlockTexture(ctx, bx, by, Ws, Hs, s, "left", 42);
  drawMortarLines(ctx, bx, by, Ws, Hs, 5, "rgba(0,0,0,0.04)", s);
  const Ds_ba = Ws;
  drawFaceShading(ctx, bx, by, Ws, Ds_ba, Hs, "left", 0.15);
  drawFaceShading(ctx, bx, by, Ws, Ds_ba, Hs, "right", 0.2);
  drawStringCourse(ctx, bx, by, Ws, Ds_ba, Hs, s, 0.7, pal.cornice);
  drawStringCourse(ctx, bx, by, Ws, Ds_ba, Hs, s, 0.4, pal.cornice);
  drawQuoins(ctx, bx, by, Ws, Ds_ba, Hs, s, pal.trimLight, 4);
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ds_ba,
    Hs,
    s,
    "left",
    33,
    3,
    "rgba(60,50,30,0.04)",
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ds_ba,
    Hs,
    s,
    "right",
    44,
    3,
    "rgba(60,50,30,0.04)",
  );
  // Gabled roof on connecting wall
  drawGabledRoof(ctx, bx, by, wallW, wallW, wallH, 6, s, pal);
  drawRoofShingles(
    ctx,
    bx,
    by,
    wallW,
    wallW,
    wallH,
    6,
    s,
    "rgba(40,50,60,0.04)",
    4,
  );
  drawRidgeCap(ctx, bx, by, wallW, wallW, wallH, 6, s, pal.accent);

  // Small pinnacles on main wall corners
  const iW_ba = Ws * ISO_COS;
  const iD_ba = Ws * ISO_SIN;
  const wt_ba = by - Hs;
  drawPinnacle(ctx, bx - iW_ba, wt_ba + iD_ba, 5, s, pal.trim, pal.cornice);
  drawPinnacle(ctx, bx + iW_ba, wt_ba + iD_ba, 5, s, pal.trim, pal.cornice);
  drawPinnacle(ctx, bx, wt_ba, 4, s, pal.trim, pal.cornice);

  // Front-right turret — drawn AFTER main wall so it layers in front
  drawCylindricalTower(
    ctx,
    rtx,
    rty,
    6,
    32,
    s,
    "#C8B090",
    "#B8A480",
    "#907858",
  );
  drawCircularBattlements(ctx, rtx, rty - 32 * s, 6, s, pal.cornice, 10);
  drawConicalRoof(
    ctx,
    rtx,
    rty - 32 * s - 2 * s,
    6.5,
    12,
    s,
    "#606878",
    "#404050",
  );
  for (let row = 0; row < 3; row++) {
    drawRoundWindowOnCylinder(
      ctx,
      rtx,
      rty,
      6,
      32,
      turretWinAngles[row],
      0.2 + row * 0.22,
      1.6,
      s,
      pal.trim,
      pal.glass,
    );
  }

  // Grand pointed arch through the wall (on left face, isometric-aligned)
  const iW = Ws * ISO_COS;
  const iD = Ws * ISO_SIN;
  const archCx = bx - iW * 0.5;
  const archCy = by + iD * 0.5;
  const aHw = 5 * s;
  const aH = 12 * s;
  drawIsoFaceArch(ctx, archCx, archCy, aHw, aH, s, "left", "#0A0804", true);

  // Voussoir trim around arch (isometric-aligned along left face: +ISO_COS, +ISO_SIN)
  const trimHw = (5 + 1) * s;
  const vlx = archCx + trimHw * ISO_COS;
  const vly = archCy + trimHw * ISO_SIN;
  const vrx = archCx - trimHw * ISO_COS;
  const vry = archCy - trimHw * ISO_SIN;
  ctx.strokeStyle = pal.trimLight;
  ctx.lineWidth = 1 * s;
  ctx.beginPath();
  ctx.moveTo(vlx, vly - aH * 0.6);
  ctx.quadraticCurveTo(vlx, vly - aH - s, archCx, archCy - aH - 3 * s);
  ctx.quadraticCurveTo(vrx, vry - aH - s, vrx, vry - aH * 0.6);
  ctx.stroke();

  // Clock face on front-right turret
  const clockY = rty - 28 * s;
  const clockR = 3 * s;
  const clockCx = rtx + Math.cos(Math.PI * 0.5) * 6 * s * 0.5;
  const clockCyy = clockY + Math.sin(Math.PI * 0.5) * 6 * s * 0.25;
  ctx.fillStyle = "#F0E8D0";
  ctx.beginPath();
  ctx.ellipse(clockCx, clockCyy, clockR, clockR * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5A4830";
  ctx.lineWidth = 0.5 * s;
  ctx.stroke();
  const hA = (time * 0.1) % (Math.PI * 2);
  const mA = (time * 0.6) % (Math.PI * 2);
  ctx.strokeStyle = "#2A1808";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(clockCx, clockCyy);
  ctx.lineTo(
    clockCx + Math.cos(hA) * clockR * 0.5,
    clockCyy + Math.sin(hA) * clockR * 0.25,
  );
  ctx.stroke();
  ctx.lineWidth = 0.35 * s;
  ctx.beginPath();
  ctx.moveTo(clockCx, clockCyy);
  ctx.lineTo(
    clockCx + Math.cos(mA) * clockR * 0.78,
    clockCyy + Math.sin(mA) * clockR * 0.39,
  );
  ctx.stroke();

  // Iron lantern glow inside arch
  const lanA = 0.08 + Math.sin(time * 0.8) * 0.03;
  const lanGlow = ctx.createRadialGradient(
    archCx,
    archCy - aH * 0.4,
    0,
    archCx,
    archCy - aH * 0.4,
    4 * s,
  );
  lanGlow.addColorStop(0, `rgba(255,190,90,${lanA})`);
  lanGlow.addColorStop(1, "rgba(255,190,90,0)");
  ctx.fillStyle = lanGlow;
  ctx.beginPath();
  ctx.ellipse(archCx, archCy - aH * 0.4, 4 * s, 2.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// SWAMP — Whig Hall
// =========================================================================

const WHIG_PAL: BuildingPalette = {
  wallTop: "#A8B8A8",
  wallLeft: "#90A090",
  wallRight: "#688068",
  roofFront: "#2A4030",
  roofSide: "#1A3020",
  roofTop: "#3A5040",
  roofDark: "#0A2010",
  trim: "#506850",
  trimLight: "#C0D0C0",
  cornice: "#D8E8D8",
  glass: "#081810",
  foundTop: "#788878",
  foundLeft: "#687868",
  foundRight: "#506850",
  door: "#182818",
  accent: "#6AAA4A",
};

export function renderWhigHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = WHIG_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      36 * s,
      14 * s,
      46 * s,
      0.3,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  const bodyW = 16;
  const bodyD = 16;
  const bodyH = 18;
  const Ws = bodyW * s;
  const Ds = bodyD * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const iD = Ds * ISO_SIN;
  const wt = by - Hs;

  // Rotunda foundation — drawn first so it layers behind everything
  const rotDist = 14;
  const rotCx = bx - rotDist * ISO_COS * s;
  const rotCy = by - rotDist * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    rotCx,
    rotCy,
    7,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Circular rotunda wing — back-left of main hall (draw before main for z-order)
  drawCylindricalTower(
    ctx,
    rotCx,
    rotCy,
    7,
    16,
    s,
    "#A8B8A8",
    "#98A898",
    "#688068",
  );
  drawDome(
    ctx,
    rotCx,
    rotCy - 16 * s,
    7,
    6,
    s,
    "#5A8A5A",
    "#3A6A3A",
    "#1A4A1A",
  );

  const rotWinAngles = frontAngles(5);
  for (let i = 0; i < 5; i++) {
    drawRoundWindowOnCylinder(
      ctx,
      rotCx,
      rotCy,
      7,
      16,
      rotWinAngles[i],
      0.45,
      1.8,
      s,
      "#506850",
      "#081810",
    );
  }

  // Main rectangular hall (drawn after rotunda since it's in front)
  drawBaseAO(ctx, bx, by, Ws, Ds, 0.18);
  drawBuildingSection(ctx, bx, by, bodyW, bodyD, bodyH, s, pal, {
    rows: 2,
    leftCols: 3,
    rightCols: 2,
    wu: 0.18,
    wv: 0.26,
    arched: false,
  });

  // Entablature + gabled roof + pediment
  drawIsometricPrism(
    ctx,
    bx,
    wt,
    (bodyW + 2) * s,
    (bodyD + 2) * s,
    2.5 * s,
    pal.cornice,
    pal.trimLight,
    pal.trim,
  );
  drawGabledRoof(ctx, bx, by, bodyW + 2, bodyD + 2, bodyH + 2.5, 6, s, pal);
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW + 2,
    bodyD + 2,
    bodyH + 2.5,
    6,
    s,
    "rgba(10,30,10,0.04)",
    4,
  );
  drawPediment(
    ctx,
    bx + iW * 0.5,
    wt + iD * 1.5 - 2.5 * s,
    bodyW,
    8,
    s,
    "right",
    pal.wallLeft,
    pal.cornice,
  );

  // Ionic columns on right face
  drawColumnPortico(
    ctx,
    bx + iW * 0.58,
    by + iD * 1.5,
    6,
    17,
    14,
    s,
    pal.cornice,
    pal.trimLight,
    "right",
  );

  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "left", 0.14);
  drawFaceShading(ctx, bx, by, Ws, Ds, Hs, "right", 0.2);
  drawStringCourse(ctx, bx, by, Ws, Ds, Hs, s, 0.5, pal.cornice);
  drawQuoins(ctx, bx, by, Ws, Ds, Hs, s, pal.trimLight, 4);
  drawEntrance(
    ctx,
    bx,
    by,
    Ws,
    Ds,
    Hs,
    s,
    "right",
    pal.door,
    pal.trim,
    0.38,
    0.15,
    0.35,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ds,
    Hs,
    s,
    "left",
    3,
    2,
    "rgba(180,220,180,0.06)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ds,
    Hs,
    s,
    "left",
    55,
    5,
    "rgba(40,80,40,0.05)",
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ds,
    Hs,
    s,
    "right",
    66,
    4,
    "rgba(40,80,40,0.05)",
  );
  drawChimney(
    ctx,
    bx - iW * 0.3,
    wt - 2 * s,
    s,
    pal.wallLeft,
    pal.cornice,
    0.06,
  );

  // Vine growth on columns
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "#2A6A2A";
  ctx.lineWidth = 0.7 * s;
  for (let i = 0; i < 5; i++) {
    const vx = bx + iW * (0.2 + i * 0.15);
    const vy = wt + iD * (1.2 + i * 0.06);
    ctx.beginPath();
    ctx.moveTo(vx, vy);
    ctx.bezierCurveTo(
      vx + s,
      vy + 5 * s,
      vx - s,
      vy + 10 * s,
      vx + 0.5 * s,
      vy + 15 * s,
    );
    ctx.stroke();
    for (let l = 0; l < 3; l++) {
      const ly = vy + (5 + l * 4) * s;
      ctx.beginPath();
      ctx.ellipse(
        vx + (l % 2 ? 1 : -1) * s,
        ly,
        1.2 * s,
        0.6 * s,
        l * 0.5,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // Swamp fog
  const fogA = 0.05 + Math.sin(time * 0.35) * 0.02;
  ctx.fillStyle = `rgba(90,140,90,${fogA})`;
  ctx.beginPath();
  ctx.ellipse(bx, by + iD * 1.8, iW * 1.1, iD * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// SWAMP — East Pyne Hall
// =========================================================================

const PYNE_PAL: BuildingPalette = {
  wallTop: "#686868",
  wallLeft: "#585858",
  wallRight: "#404040",
  roofFront: "#384828",
  roofSide: "#283818",
  roofTop: "#485838",
  roofDark: "#182808",
  trim: "#484848",
  trimLight: "#909090",
  cornice: "#A0A0A0",
  glass: "#0A1210",
  foundTop: "#585858",
  foundLeft: "#484848",
  foundRight: "#383838",
  door: "#181818",
  accent: "#5A9A5A",
};

export function renderEastPyne(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = PYNE_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      34 * s,
      13 * s,
      50 * s,
      0.28,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  // Tower foundation — drawn first so it layers behind everything
  const tDist = 16;
  const tBx = bx + tDist * ISO_COS * s;
  const tBy = by + tDist * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    tBx,
    tBy,
    6,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  const bodyW = 18;
  const bodyH = 22;
  const Ws_ep = bodyW * s;
  const Hs_ep = bodyH * s;
  drawBaseAO(ctx, bx, by, Ws_ep, Ws_ep, 0.18);
  drawBuildingSection(ctx, bx, by, bodyW, bodyW, bodyH, s, pal, {
    rows: 2,
    leftCols: 4,
    rightCols: 3,
    wu: 0.14,
    wv: 0.24,
    arched: true,
  });
  drawStoneBlockTexture(ctx, bx, by, bodyW * s, bodyH * s, s, "left", 17);
  drawGabledRoof(ctx, bx, by, bodyW, bodyW, bodyH, 8, s, pal);

  drawFaceShading(ctx, bx, by, Ws_ep, Ws_ep, Hs_ep, "left", 0.14);
  drawFaceShading(ctx, bx, by, Ws_ep, Ws_ep, Hs_ep, "right", 0.2);
  drawStringCourse(ctx, bx, by, Ws_ep, Ws_ep, Hs_ep, s, 0.55, pal.cornice);
  drawQuoins(ctx, bx, by, Ws_ep, Ws_ep, Hs_ep, s, pal.trimLight, 5);
  drawRidgeCap(ctx, bx, by, bodyW, bodyW, bodyH, 8, s, pal.accent);
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW,
    bodyW,
    bodyH,
    8,
    s,
    "rgba(20,50,10,0.05)",
    5,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws_ep,
    Ws_ep,
    Hs_ep,
    s,
    "left",
    4,
    2,
    "rgba(180,220,180,0.06)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws_ep,
    Ws_ep,
    Hs_ep,
    s,
    "left",
    77,
    5,
    "rgba(30,70,30,0.06)",
  );

  // Round Romanesque tower — front-right
  drawCylindricalTower(
    ctx,
    tBx,
    tBy,
    6,
    34,
    s,
    "#707070",
    "#606060",
    "#404040",
  );

  // Romanesque round-arch windows on tower — front-facing
  const towerWinAngles = frontAngles(4);
  for (let row = 0; row < 4; row++) {
    const angle = towerWinAngles[row];
    const r = 6 * s;
    const wx = tBx + Math.cos(angle) * r * 0.88;
    const baseAtH = tBy - 34 * s * (0.18 + row * 0.2);
    const wy = baseAtH + Math.sin(angle) * r * 0.44;
    ctx.fillStyle = "#585858";
    ctx.beginPath();
    ctx.ellipse(wx, wy, 2 * s, 3 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = pal.glass;
    ctx.beginPath();
    ctx.ellipse(wx, wy, 1.4 * s, 2.4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.cornice;
    ctx.lineWidth = 0.5 * s;
    ctx.beginPath();
    ctx.ellipse(wx, wy - 1 * s, 1.6 * s, 1 * s, 0, Math.PI, 0);
    ctx.stroke();
  }

  // Conical roof with weathered copper band
  drawConicalRoof(ctx, tBx, tBy - 34 * s, 6.5, 14, s, "#5A8A5A", "#2A5A2A");

  ctx.strokeStyle = "#5AAA6A";
  ctx.lineWidth = 1.2 * s;
  ctx.beginPath();
  ctx.ellipse(tBx, tBy - 34 * s, 6.5 * s, 6.5 * s * 0.5, 0, 0, Math.PI);
  ctx.stroke();

  // Iron railing along front-left eave (LT → FT)
  const Ws = bodyW * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const iD_e = Ws * ISO_SIN;
  const wt = by - Hs;
  ctx.strokeStyle = "#303030";
  ctx.lineWidth = 0.4 * s;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const rx = bx - iW * (1 - t);
    const ry = wt + iD_e * (1 + t);
    ctx.beginPath();
    ctx.moveTo(rx, ry + 1.5 * s);
    ctx.lineTo(rx, ry - 2 * s);
    ctx.stroke();
  }

  // Mossy patches
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#3A7A3A";
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.ellipse(
      bx - iW * (0.4 + i * 0.15),
      by + Ws * ISO_SIN * (0.8 + i * 0.05) - Hs * (0.2 + i * 0.15),
      2.5 * s,
      1.2 * s,
      i * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// =========================================================================
// SWAMP — Prospect House
// =========================================================================

const PROSPECT_PAL: BuildingPalette = {
  wallTop: "#D8C080",
  wallLeft: "#C4AA68",
  wallRight: "#A08848",
  roofFront: "#304828",
  roofSide: "#203818",
  roofTop: "#405838",
  roofDark: "#102808",
  trim: "#887040",
  trimLight: "#E8D8A8",
  cornice: "#F0E8C0",
  glass: "#0A1808",
  foundTop: "#808060",
  foundLeft: "#706850",
  foundRight: "#585040",
  door: "#2A2010",
  accent: "#8AAA4A",
};

export function renderProspectHouse(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = PROSPECT_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      38 * s,
      14 * s,
      46 * s,
      0.28,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  const bodyW = 20;
  const bodyH = 16;
  const Ws = bodyW * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const iD = bodyW * s * ISO_SIN;

  // Wrap-around porch platform — drawn first so building renders on top
  const porchH = 0.8 * s;
  drawIsometricPrism(
    ctx,
    bx,
    by + 3 * s,
    (bodyW + 6) * s,
    (bodyW + 6) * s,
    porchH,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  drawBaseAO(ctx, bx, by, Ws, Ws, 0.15);
  drawBuildingSection(ctx, bx, by, bodyW, bodyW, bodyH, s, pal, {
    rows: 2,
    leftCols: 4,
    rightCols: 3,
    wu: 0.14,
    wv: 0.24,
    arched: false,
  });
  drawHipRoof(ctx, bx, by, bodyW, bodyW, bodyH, 6, s, pal);

  drawFaceShading(ctx, bx, by, Ws, Ws, Hs, "left", 0.12);
  drawFaceShading(ctx, bx, by, Ws, Ws, Hs, "right", 0.18);
  drawStringCourse(ctx, bx, by, Ws, Ws, Hs, s, 0.5, pal.cornice);
  drawQuoins(ctx, bx, by, Ws, Ws, Hs, s, pal.trimLight, 4);
  drawEntrance(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "right",
    pal.door,
    pal.trim,
    0.35,
    0.12,
    0.3,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "left",
    4,
    2,
    "rgba(200,220,160,0.06)",
    time,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "right",
    3,
    2,
    "rgba(200,220,160,0.06)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "left",
    88,
    4,
    "rgba(40,80,30,0.05)",
  );
  drawChimney(
    ctx,
    bx + iW * 0.25,
    by - Hs - 6 * s + 2 * s,
    s,
    pal.wallLeft,
    pal.cornice,
    0.05,
  );

  // Round belvedere tower — centered on roof ridge
  const belvBaseY = by - Hs - 6 * s;
  drawCylindricalTower(
    ctx,
    bx,
    belvBaseY + 10 * s,
    4.5,
    10,
    s,
    "#D8C080",
    "#C8B468",
    "#A08848",
  );
  drawCircularBattlements(ctx, bx, belvBaseY, 4.5, s, pal.cornice, 8);

  const belvAngles = frontAngles(6);
  for (let i = 0; i < 6; i++) {
    drawRoundWindowOnCylinder(
      ctx,
      bx,
      belvBaseY + 10 * s,
      4.5,
      10,
      belvAngles[i],
      0.4,
      1.2,
      s,
      pal.trim,
      pal.glass,
    );
  }
  drawDome(
    ctx,
    bx,
    belvBaseY - 1 * s,
    4.2,
    5,
    s,
    "#5A8A4A",
    "#3A6A2A",
    "#1A4A0A",
  );

  // Thin porch columns along V-path (LT → FT → RT), offset outward from faces
  const outDist = 2.5 * s;
  const colH = 10 * s;
  ctx.fillStyle = pal.cornice;
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    let pcx: number, pcy: number;
    if (t <= 0.5) {
      const u = t * 2;
      pcx = bx - iW * (1 - u) - ISO_SIN * outDist;
      pcy = by + iD * (1 + u) + ISO_COS * outDist;
    } else {
      const u = (t - 0.5) * 2;
      pcx = bx + iW * u + ISO_SIN * outDist;
      pcy = by + iD * (2 - u) + ISO_COS * outDist;
    }
    ctx.beginPath();
    ctx.moveTo(pcx - 0.5 * s, pcy);
    ctx.lineTo(pcx - 0.4 * s, pcy - colH);
    ctx.lineTo(pcx + 0.4 * s, pcy - colH);
    ctx.lineTo(pcx + 0.5 * s, pcy);
    ctx.closePath();
    ctx.fill();
  }

  // Iron cresting circles along front eave (V-path: LT → FT → RT, isometric foreshortened)
  ctx.strokeStyle = "#404030";
  ctx.lineWidth = 0.3 * s;
  const wt = by - Hs;
  const iD_p = Ws * ISO_SIN;
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    let crx: number, cry: number;
    if (t <= 0.5) {
      const u = t * 2;
      crx = bx - iW * (1 - u);
      cry = wt + iD_p * (1 + u) - 1 * s;
    } else {
      const u = (t - 0.5) * 2;
      crx = bx + iW * u;
      cry = wt + iD_p * (2 - u) - 1 * s;
    }
    ctx.beginPath();
    ctx.ellipse(crx, cry, 0.8 * s, 0.4 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Swamp mist
  const fogA = 0.04 + Math.sin(time * 0.3) * 0.02;
  ctx.fillStyle = `rgba(80,120,60,${fogA})`;
  ctx.beginPath();
  ctx.ellipse(bx, by + iD * 1.8, iW * 1.3, iD * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// DESERT — Clio Hall
// =========================================================================

const CLIO_PAL: BuildingPalette = {
  wallTop: "#F0E8E0",
  wallLeft: "#E0D4C8",
  wallRight: "#C8B8A8",
  roofFront: "#C49838",
  roofSide: "#B08830",
  roofTop: "#D4A848",
  roofDark: "#A08028",
  trim: "#B8A888",
  trimLight: "#F8F0E8",
  cornice: "#FFF8F0",
  glass: "#181510",
  foundTop: "#D8CCC0",
  foundLeft: "#C8BCA8",
  foundRight: "#A89878",
  door: "#604830",
  accent: "#E8B838",
};

export function renderClioHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = CLIO_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      34 * s,
      14 * s,
      44 * s,
      0.22,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  // Cella foundation — drawn first so it layers behind everything
  drawTowerFoundation(
    ctx,
    bx,
    by,
    8,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  drawBaseAO(ctx, bx, by, 11 * s, 11 * s, 0.15);

  // Three-step crepidoma
  for (let step = 0; step < 3; step++) {
    const sw = (20 + 8 - step * 3) * s;
    drawIsometricPrism(
      ctx,
      bx,
      by + (5 - step * 1.5) * s,
      sw,
      sw,
      1.5 * s,
      pal.foundTop,
      pal.foundLeft,
      pal.foundRight,
    );
  }

  // Back half of colonnade (drawn behind the cella)
  const colR = 11 * s;
  const colH = 17 * s;
  const colW = 1.2 * s;
  const colWy = colW * 0.5;

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    if (Math.sin(angle) >= 0) continue;
    const ccx = bx + Math.cos(angle) * colR;
    const ccy = by + Math.sin(angle) * colR * 0.5;
    ctx.fillStyle = pal.cornice;
    ctx.beginPath();
    ctx.ellipse(ccx, ccy - colH, colW * 1.2, colWy * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    const cGrad = ctx.createLinearGradient(ccx - colW, ccy, ccx + colW, ccy);
    cGrad.addColorStop(0, pal.trimLight);
    cGrad.addColorStop(0.5, "#FFF8F0");
    cGrad.addColorStop(1, pal.trimLight);
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(ccx - colW, ccy);
    ctx.lineTo(ccx - colW * 0.85, ccy - colH);
    ctx.lineTo(ccx + colW * 0.85, ccy - colH);
    ctx.lineTo(ccx + colW, ccy);
    ctx.closePath();
    ctx.fill();
  }

  // Central cylindrical cella
  drawCylindricalTower(ctx, bx, by, 8, 18, s, "#F0E8E0", "#E0D4C8", "#C0B098");

  // Front half of colonnade (drawn in front of cella)
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    if (Math.sin(angle) < 0) continue; // skip back columns (already drawn)
    const ccx = bx + Math.cos(angle) * colR;
    const ccy = by + Math.sin(angle) * colR * 0.5;
    ctx.fillStyle = pal.cornice;
    ctx.beginPath();
    ctx.ellipse(ccx, ccy - colH, colW * 1.2, colWy * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    const cGrad = ctx.createLinearGradient(ccx - colW, ccy, ccx + colW, ccy);
    cGrad.addColorStop(0, pal.trimLight);
    cGrad.addColorStop(0.5, "#FFF8F0");
    cGrad.addColorStop(1, pal.trimLight);
    ctx.fillStyle = cGrad;
    ctx.beginPath();
    ctx.moveTo(ccx - colW, ccy);
    ctx.lineTo(ccx - colW * 0.85, ccy - colH);
    ctx.lineTo(ccx + colW * 0.85, ccy - colH);
    ctx.lineTo(ccx + colW, ccy);
    ctx.closePath();
    ctx.fill();
  }

  drawWindowGlows(
    ctx,
    bx,
    by,
    8 * s,
    8 * s,
    18 * s,
    s,
    "left",
    3,
    1,
    "rgba(255,230,170,0.06)",
    time,
  );

  // Entablature ring
  ctx.strokeStyle = pal.accent;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.ellipse(bx, by - colH, colR * 1.05, colR * 0.5 * 1.05, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Golden dome
  drawDome(
    ctx,
    bx,
    by - colH - 1.5 * s,
    9,
    10,
    s,
    "#E8C848",
    "#D4A838",
    "#B08828",
  );

  // Acroterion finial
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.ellipse(bx, by - colH - 12 * s, 1 * s, 1 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  drawFlagPole(ctx, bx, by - colH - 12 * s, 5, s, pal.accent, "#E8C848", time);

  // Heat shimmer
  const shimA = 0.03 + Math.sin(time * 0.8) * 0.015;
  ctx.fillStyle = `rgba(255,230,170,${shimA})`;
  ctx.beginPath();
  ctx.ellipse(
    bx,
    by + colR * 0.5 + 2 * s,
    colR * 1.1,
    colR * 0.3,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

// =========================================================================
// DESERT — McCosh Hall
// =========================================================================

const MCCOSH_PAL: BuildingPalette = {
  wallTop: "#C89868",
  wallLeft: "#B88858",
  wallRight: "#986838",
  roofFront: "#8A5A18",
  roofSide: "#7A4A10",
  roofTop: "#9A6A28",
  roofDark: "#6A3A08",
  trim: "#887050",
  trimLight: "#E0C898",
  cornice: "#ECD8A8",
  glass: "#1A1508",
  foundTop: "#A88868",
  foundLeft: "#987858",
  foundRight: "#786038",
  door: "#4A3018",
  accent: "#D4A030",
};

export function renderMcCoshHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = MCCOSH_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      42 * s,
      15 * s,
      54 * s,
      0.24,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  // Tower foundations — drawn first so they layer behind everything
  const apseDist = 14;
  const apseCx = bx - apseDist * ISO_COS * s;
  const apseCy = by - apseDist * ISO_SIN * s;
  const tDist = 16;
  const tBx = bx + tDist * ISO_COS * s;
  drawTowerFoundation(
    ctx,
    apseCx,
    apseCy,
    8,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );
  drawTowerFoundation(
    ctx,
    tBx,
    by + tDist * ISO_SIN * s,
    4,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Round lecture hall apse — back-left, drawn BEFORE main body so it layers behind
  drawCylindricalTower(
    ctx,
    apseCx,
    apseCy,
    8,
    18,
    s,
    "#C89868",
    "#B88858",
    "#986838",
  );
  drawConicalRoof(
    ctx,
    apseCx,
    apseCy - 18 * s,
    8.5,
    8,
    s,
    "#9A6A28",
    "#6A3A08",
  );
  const apseAngles = frontAngles(5);
  for (let i = 0; i < 5; i++) {
    drawRoundWindowOnCylinder(
      ctx,
      apseCx,
      apseCy,
      8,
      18,
      apseAngles[i],
      0.4,
      2,
      s,
      pal.trim,
      pal.glass,
    );
  }

  const bodyW = 22;
  const bodyH = 20;
  drawBaseAO(ctx, bx, by, bodyW * s, bodyW * s, 0.14);
  drawBuildingSection(ctx, bx, by, bodyW, bodyW, bodyH, s, pal, {
    rows: 2,
    leftCols: 5,
    rightCols: 3,
    wu: 0.12,
    wv: 0.26,
    arched: true,
  });
  drawBrickTexture(
    ctx,
    bx,
    by,
    bodyW * s,
    bodyH * s,
    s,
    "#C07850",
    "rgba(0,0,0,0.06)",
    "left",
  );
  drawGabledRoof(ctx, bx, by, bodyW, bodyW, bodyH, 8, s, pal);

  const Ws_mc = bodyW * s;
  const Hs_mc = bodyH * s;
  drawFaceShading(ctx, bx, by, Ws_mc, Ws_mc, Hs_mc, "left", 0.12);
  drawFaceShading(ctx, bx, by, Ws_mc, Ws_mc, Hs_mc, "right", 0.18);
  drawStringCourse(ctx, bx, by, Ws_mc, Ws_mc, Hs_mc, s, 0.6, pal.cornice);
  drawStringCourse(ctx, bx, by, Ws_mc, Ws_mc, Hs_mc, s, 0.3, pal.cornice);
  drawQuoins(ctx, bx, by, Ws_mc, Ws_mc, Hs_mc, s, pal.trimLight, 5);
  drawRidgeCap(ctx, bx, by, bodyW, bodyW, bodyH, 8, s, pal.accent);
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW,
    bodyW,
    bodyH,
    8,
    s,
    "rgba(100,70,20,0.04)",
    5,
  );
  drawEntrance(
    ctx,
    bx,
    by,
    Ws_mc,
    Ws_mc,
    Hs_mc,
    s,
    "right",
    pal.door,
    pal.trim,
    0.35,
    0.12,
    0.3,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws_mc,
    Ws_mc,
    Hs_mc,
    s,
    "left",
    5,
    2,
    "rgba(255,220,150,0.07)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws_mc,
    Ws_mc,
    Hs_mc,
    s,
    "left",
    99,
    3,
    "rgba(140,100,50,0.04)",
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws_mc,
    Ws_mc,
    Hs_mc,
    s,
    "right",
    111,
    3,
    "rgba(140,100,50,0.04)",
  );

  // Minaret tower with circular balcony — front-right
  const tBy = by + tDist * ISO_SIN * s;
  drawCylindricalTower(
    ctx,
    tBx,
    tBy,
    4,
    38,
    s,
    "#D0A070",
    "#C09060",
    "#986838",
  );

  // Circular balcony ring at 30s height
  const balcY = tBy - 30 * s;
  const balcR = 5.5 * s;
  ctx.fillStyle = pal.cornice;
  ctx.beginPath();
  ctx.ellipse(tBx, balcY, balcR, balcR * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.trim;
  ctx.beginPath();
  ctx.ellipse(tBx, balcY, balcR * 0.9, balcR * 0.9 * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  drawCircularBattlements(ctx, tBx, balcY, 5.5, s, pal.cornice, 10);

  // Bulb dome on minaret top
  const bulbY = tBy - 38 * s;
  drawDome(ctx, tBx, bulbY, 3.5, 5, s, "#D4A838", "#B89028", "#987018");

  // Finial crescent
  ctx.fillStyle = pal.accent;
  ctx.beginPath();
  ctx.moveTo(tBx, bulbY - 6 * s);
  ctx.lineTo(tBx - 0.5 * s, bulbY - 5 * s);
  ctx.lineTo(tBx + 0.5 * s, bulbY - 5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(tBx, bulbY - 6.5 * s, 0.8 * s, 0.8 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  drawFlagPole(ctx, tBx, bulbY - 7 * s, 5, s, pal.accent, "#D4A030", time);
}

// =========================================================================
// DESERT — Robertson Hall
// =========================================================================

const ROBERTSON_PAL: BuildingPalette = {
  wallTop: "#E8E0D8",
  wallLeft: "#D8D0C8",
  wallRight: "#B8B0A8",
  roofFront: "#909090",
  roofSide: "#808080",
  roofTop: "#A0A0A0",
  roofDark: "#707070",
  trim: "#A8A098",
  trimLight: "#F0E8E0",
  cornice: "#F8F4F0",
  glass: "#2040A0",
  foundTop: "#C8C0B8",
  foundLeft: "#B8B0A8",
  foundRight: "#989088",
  door: "#404040",
  accent: "#4080C0",
};

export function renderRobertsonHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = ROBERTSON_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      38 * s,
      14 * s,
      40 * s,
      0.22,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  // Pavilion foundation — drawn first so it layers behind everything
  const pavDist = 14;
  const pavCx = bx + pavDist * ISO_COS * s;
  const pavCy = by + pavDist * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    pavCx,
    pavCy,
    5,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  drawBaseAO(ctx, bx, by, 24 * s, 24 * s, 0.12);

  // Raised platform
  drawIsometricPrism(
    ctx,
    bx,
    by + 4 * s,
    24 * s,
    24 * s,
    4 * s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Main low-slung body
  const bodyWs = 20 * s;
  const bodyHs = 14 * s;
  drawIsometricPrism(
    ctx,
    bx,
    by,
    bodyWs,
    bodyWs,
    bodyHs,
    pal.wallTop,
    pal.wallLeft,
    pal.wallRight,
  );

  const iW = bodyWs * ISO_COS;
  const iD = bodyWs * ISO_SIN;
  const wt = by - bodyHs;

  // Blue-tinted glass curtain walls
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      const u = 0.02 + col * 0.155;
      const v = 0.08 + row * 0.3;
      ctx.fillStyle = `rgba(${40 + col * 8},${80 + row * 10},${180 - col * 5},0.7)`;
      ctx.beginPath();
      drawIsoFaceQuad(
        ctx,
        bx,
        by,
        bodyWs,
        bodyWs,
        bodyHs,
        u,
        v,
        0.1,
        0.22,
        "left",
      );
      ctx.fill();
    }
  }
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const u = 0.04 + col * 0.2;
      const v = 0.08 + row * 0.3;
      ctx.fillStyle = `rgba(${30 + col * 10},${70 + row * 12},${170 - col * 8},0.65)`;
      ctx.beginPath();
      drawIsoFaceQuad(
        ctx,
        bx,
        by,
        bodyWs,
        bodyWs,
        bodyHs,
        u,
        v,
        0.12,
        0.22,
        "right",
      );
      ctx.fill();
    }
  }

  // Flat roof parapet
  drawIsometricPrism(
    ctx,
    bx,
    wt,
    21 * s,
    21 * s,
    1.5 * s,
    pal.cornice,
    pal.trimLight,
    pal.trim,
  );

  drawFaceShading(ctx, bx, by, bodyWs, bodyWs, bodyHs, "left", 0.1);
  drawFaceShading(ctx, bx, by, bodyWs, bodyWs, bodyHs, "right", 0.15);
  drawQuoins(ctx, bx, by, bodyWs, bodyWs, bodyHs, s, pal.trimLight, 3);
  drawWindowGlows(
    ctx,
    bx,
    by,
    bodyWs,
    bodyWs,
    bodyHs,
    s,
    "left",
    6,
    3,
    "rgba(100,180,255,0.05)",
    time,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    bodyWs,
    bodyWs,
    bodyHs,
    s,
    "right",
    4,
    3,
    "rgba(100,180,255,0.05)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    bodyWs,
    bodyWs,
    bodyHs,
    s,
    "left",
    123,
    2,
    "rgba(120,100,60,0.03)",
  );
  drawPinnacle(
    ctx,
    bx - bodyWs * ISO_COS,
    wt + bodyWs * ISO_SIN,
    4,
    s,
    pal.trim,
    pal.cornice,
  );
  drawPinnacle(
    ctx,
    bx + bodyWs * ISO_COS,
    wt + bodyWs * ISO_SIN,
    4,
    s,
    pal.trim,
    pal.cornice,
  );

  // Cylindrical entrance pavilion — front-right
  drawCylindricalTower(
    ctx,
    pavCx,
    pavCy,
    5,
    16,
    s,
    "#E0D8D0",
    "#D0C8C0",
    "#B0A8A0",
  );

  // Glass band on pavilion
  ctx.strokeStyle = pal.glass;
  ctx.lineWidth = 2 * s;
  ctx.beginPath();
  ctx.ellipse(pavCx, pavCy - 12 * s, 5 * s, 5 * s * 0.5, 0, 0, Math.PI);
  ctx.stroke();

  // Flat disc roof on pavilion
  ctx.fillStyle = pal.roofDark;
  ctx.beginPath();
  ctx.ellipse(pavCx, pavCy - 16 * s, 6 * s, 6 * s * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.roofTop;
  ctx.beginPath();
  ctx.ellipse(
    pavCx,
    pavCy - 16 * s - 0.5 * s,
    5.8 * s,
    5.8 * s * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Reflective pool
  const poolGrad = ctx.createRadialGradient(
    pavCx + 2 * s,
    pavCy + 8 * s,
    0,
    pavCx + 2 * s,
    pavCy + 8 * s,
    7 * s,
  );
  poolGrad.addColorStop(0, "rgba(60,120,180,0.2)");
  poolGrad.addColorStop(0.7, "rgba(60,120,180,0.08)");
  poolGrad.addColorStop(1, "rgba(60,120,180,0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(pavCx + 2 * s, pavCy + 8 * s, 7 * s, 3.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// WINTER — Holder Hall
// =========================================================================

const HOLDER_PAL: BuildingPalette = {
  wallTop: "#8898A8",
  wallLeft: "#7888A0",
  wallRight: "#586878",
  roofFront: "#2A3848",
  roofSide: "#1A2838",
  roofTop: "#3A4858",
  roofDark: "#0A1828",
  trim: "#506878",
  trimLight: "#B0C0D0",
  cornice: "#D0D8E0",
  glass: "#081018",
  foundTop: "#687888",
  foundLeft: "#586878",
  foundRight: "#405060",
  door: "#1A2838",
  accent: "#88C0D8",
};

export function renderHolderHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = HOLDER_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      40 * s,
      15 * s,
      58 * s,
      0.25,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  // Tower foundation — drawn first so it layers behind everything
  const tDist = 16;
  const tbx = bx - tDist * ISO_COS * s;
  const tby = by - tDist * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    tbx,
    tby,
    6,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Round clock tower — back-left, drawn BEFORE main body so it layers behind
  drawCylindricalTower(
    ctx,
    tbx,
    tby,
    6,
    44,
    s,
    "#8898A8",
    "#7888A0",
    "#506070",
  );
  drawCircularBattlements(ctx, tbx, tby - 44 * s, 6, s, pal.cornice, 12);
  drawConicalRoof(
    ctx,
    tbx,
    tby - 44 * s - 2 * s,
    6.5,
    14,
    s,
    "#3A4858",
    "#1A2838",
  );
  const towerAngles = frontAngles(4);
  for (let row = 0; row < 4; row++) {
    drawRoundWindowOnCylinder(
      ctx,
      tbx,
      tby,
      6,
      44,
      towerAngles[row],
      0.15 + row * 0.18,
      1.6,
      s,
      pal.trim,
      pal.glass,
    );
  }
  const clockY = tby - 38 * s;
  const clockR = 3.5 * s;
  const clockAngle = Math.PI * 0.5;
  const clockCx = tbx + Math.cos(clockAngle) * 6 * s * 0.5;
  const clockCyy = clockY + Math.sin(clockAngle) * 6 * s * 0.25;
  ctx.fillStyle = "#D8E0E8";
  ctx.beginPath();
  ctx.ellipse(clockCx, clockCyy, clockR, clockR * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = pal.trim;
  ctx.lineWidth = 0.6 * s;
  ctx.stroke();
  for (let h = 0; h < 12; h++) {
    const ha = (h / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = "#2A3848";
    ctx.beginPath();
    ctx.ellipse(
      clockCx + Math.cos(ha) * clockR * 0.8,
      clockCyy + Math.sin(ha) * clockR * 0.4,
      0.3 * s,
      0.3 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  const hA = ((time * 0.08) % (Math.PI * 2)) - Math.PI / 2;
  const mA = ((time * 0.5) % (Math.PI * 2)) - Math.PI / 2;
  ctx.strokeStyle = "#1A2838";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(clockCx, clockCyy);
  ctx.lineTo(
    clockCx + Math.cos(hA) * clockR * 0.5,
    clockCyy + Math.sin(hA) * clockR * 0.25,
  );
  ctx.stroke();
  ctx.lineWidth = 0.35 * s;
  ctx.beginPath();
  ctx.moveTo(clockCx, clockCyy);
  ctx.lineTo(
    clockCx + Math.cos(mA) * clockR * 0.72,
    clockCyy + Math.sin(mA) * clockR * 0.36,
  );
  ctx.stroke();

  const bodyW = 20;
  const bodyH = 20;
  drawBaseAO(ctx, bx, by, bodyW * s, bodyW * s, 0.16);
  drawBuildingSection(ctx, bx, by, bodyW, bodyW, bodyH, s, pal, {
    rows: 2,
    leftCols: 4,
    rightCols: 3,
    wu: 0.14,
    wv: 0.24,
    arched: true,
  });
  drawGabledRoof(ctx, bx, by, bodyW, bodyW, bodyH, 8, s, pal);

  const Ws_hh = bodyW * s;
  const Hs_hh = bodyH * s;
  drawFaceShading(ctx, bx, by, Ws_hh, Ws_hh, Hs_hh, "left", 0.14);
  drawFaceShading(ctx, bx, by, Ws_hh, Ws_hh, Hs_hh, "right", 0.2);
  drawStringCourse(ctx, bx, by, Ws_hh, Ws_hh, Hs_hh, s, 0.6, pal.cornice);
  drawStringCourse(ctx, bx, by, Ws_hh, Ws_hh, Hs_hh, s, 0.3, pal.cornice);
  drawQuoins(ctx, bx, by, Ws_hh, Ws_hh, Hs_hh, s, pal.trimLight, 5);
  drawRidgeCap(ctx, bx, by, bodyW, bodyW, bodyH, 8, s, pal.accent);
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW,
    bodyW,
    bodyH,
    8,
    s,
    "rgba(20,30,50,0.05)",
    5,
  );
  drawEntrance(
    ctx,
    bx,
    by,
    Ws_hh,
    Ws_hh,
    Hs_hh,
    s,
    "right",
    pal.door,
    pal.trim,
    0.35,
    0.14,
    0.35,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws_hh,
    Ws_hh,
    Hs_hh,
    s,
    "left",
    4,
    2,
    "rgba(255,200,120,0.09)",
    time,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws_hh,
    Ws_hh,
    Hs_hh,
    s,
    "right",
    3,
    2,
    "rgba(255,200,120,0.09)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws_hh,
    Ws_hh,
    Hs_hh,
    s,
    "left",
    141,
    3,
    "rgba(60,80,100,0.04)",
  );
  drawChimney(
    ctx,
    bx + Ws_hh * ISO_COS * 0.3,
    by - Hs_hh - 8 * s + 3 * s,
    s,
    pal.wallLeft,
    pal.cornice,
    0.04,
  );

  // Snow on roof ridge and icicles
  const Ws = bodyW * s;
  const iW = Ws * ISO_COS;
  const rH = 8 * s;
  const wt = by - bodyH * s;
  ctx.fillStyle = "rgba(230,240,250,0.6)";
  ctx.beginPath();
  ctx.moveTo(bx - iW * 0.5, wt + Ws * ISO_SIN * 0.5 - rH);
  ctx.lineTo(bx + iW * 0.5, wt + Ws * ISO_SIN * 1.5 - rH);
  ctx.lineTo(bx + iW * 0.5, wt + Ws * ISO_SIN * 1.5 - rH + 0.6 * s);
  ctx.lineTo(bx - iW * 0.5, wt + Ws * ISO_SIN * 0.5 - rH + 0.6 * s);
  ctx.closePath();
  ctx.fill();

  // Icicles along front-left eave (LT → FT)
  ctx.fillStyle = "rgba(200,220,240,0.45)";
  const iD_h = Ws * ISO_SIN;
  for (let i = 0; i < 10; i++) {
    const t = i / 9;
    const ix = bx - iW * (1 - t);
    const iy = wt + iD_h * (1 + t);
    const iLen = (1.5 + ((i * 7) % 5) * 0.4) * s;
    ctx.beginPath();
    ctx.moveTo(ix - 0.25 * s, iy + 0.5 * s);
    ctx.lineTo(ix, iy + iLen);
    ctx.lineTo(ix + 0.25 * s, iy + 0.5 * s);
    ctx.closePath();
    ctx.fill();
  }
}

// =========================================================================
// WINTER — Cleveland Tower
// =========================================================================

const CLEVE_PAL: BuildingPalette = {
  wallTop: "#6A7A88",
  wallLeft: "#5A6A78",
  wallRight: "#3A4A58",
  roofFront: "#2A3848",
  roofSide: "#1A2838",
  roofTop: "#3A4858",
  roofDark: "#0A1828",
  trim: "#405060",
  trimLight: "#98A8B8",
  cornice: "#B0C0D0",
  glass: "#060C18",
  foundTop: "#586878",
  foundLeft: "#485868",
  foundRight: "#384858",
  door: "#1A2030",
  accent: "#70A8C8",
};

export function renderClevelandTower(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = CLEVE_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      24 * s,
      10 * s,
      65 * s,
      0.28,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  drawBaseAO(ctx, bx, by, 16 * s, 16 * s, 0.18);

  // Grand foundation
  drawIsometricPrism(
    ctx,
    bx,
    by + 4 * s,
    16 * s,
    16 * s,
    4 * s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Main rectangular tower shaft
  const Ts = 12 * s;
  const THs = 40 * s;
  drawIsometricPrism(
    ctx,
    bx,
    by,
    Ts,
    Ts,
    THs,
    pal.wallTop,
    pal.wallLeft,
    pal.wallRight,
  );
  drawStoneBlockTexture(ctx, bx, by, Ts, THs, s, "left", 73);
  drawMortarLines(ctx, bx, by, Ts, THs, 8, "rgba(0,0,0,0.04)", s);

  // String courses (horizontal stone bands)
  for (let band = 0; band < 3; band++) {
    const bandY = by - THs * ((band + 1) / 4);
    drawIsometricPrism(
      ctx,
      bx,
      bandY + s,
      12.5 * s,
      12.5 * s,
      s,
      pal.cornice,
      pal.trimLight,
      pal.trim,
    );
  }

  // Windows at multiple levels on flat faces
  for (let level = 0; level < 4; level++) {
    const v = 0.05 + level * 0.22;
    drawWindowOnFace(
      ctx,
      bx,
      by,
      Ts,
      Ts,
      THs,
      s,
      0.2,
      v,
      0.4,
      0.14,
      "left",
      pal.trim,
      pal.glass,
      pal.trimLight,
      true,
    );
    drawWindowOnFace(
      ctx,
      bx,
      by,
      Ts,
      Ts,
      THs,
      s,
      0.2,
      v,
      0.4,
      0.14,
      "right",
      pal.trim,
      pal.glass,
      pal.trimLight,
      true,
    );
  }

  drawFaceShading(ctx, bx, by, Ts, Ts, THs, "left", 0.15);
  drawFaceShading(ctx, bx, by, Ts, Ts, THs, "right", 0.22);
  drawQuoins(ctx, bx, by, Ts, Ts, THs, s, pal.trimLight, 8);
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ts,
    Ts,
    THs,
    s,
    "left",
    155,
    4,
    "rgba(50,70,90,0.04)",
  );
  // Pinnacles at foundation corners
  const ciW = 16 * s * ISO_COS;
  const ciD = 16 * s * ISO_SIN;
  const cwt = by - THs;
  drawPinnacle(ctx, bx - ciW, cwt + 4 * s + ciD, 4, s, pal.trim, pal.cornice);
  drawPinnacle(ctx, bx + ciW, cwt + 4 * s + ciD, 4, s, pal.trim, pal.cornice);

  // Cylindrical belfry section atop the shaft
  const belfBaseY = by - THs;
  drawCylindricalTower(
    ctx,
    bx,
    belfBaseY + 8 * s,
    7,
    8,
    s,
    "#6A7A88",
    "#5A6A78",
    "#3A4A58",
  );

  // Arched belfry openings — front-facing
  const belfAngles = frontAngles(6);
  for (let i = 0; i < 6; i++) {
    drawRoundWindowOnCylinder(
      ctx,
      bx,
      belfBaseY + 8 * s,
      7,
      8,
      belfAngles[i],
      0.45,
      1.8,
      s,
      pal.trim,
      "#060C18",
    );
  }

  // Circular battlement crown
  drawCircularBattlements(ctx, bx, belfBaseY, 7, s, pal.cornice, 14);

  // Pinnacle spire (conical)
  const spBase = belfBaseY - 2 * s;
  drawConicalRoof(ctx, bx, spBase, 5, 16, s, "#3A4858", "#1A2838");

  // Snow cap
  ctx.fillStyle = "rgba(230,240,250,0.7)";
  ctx.beginPath();
  ctx.moveTo(bx, spBase - 16 * s);
  ctx.lineTo(bx - 2 * s, spBase - 12 * s);
  ctx.lineTo(bx + 2 * s, spBase - 12 * s);
  ctx.closePath();
  ctx.fill();
  drawFlagPole(ctx, bx, spBase - 16 * s, 7, s, pal.cornice, "#4080B0", time);

  // Frost glow
  const fA = 0.03 + Math.sin(time * 0.4) * 0.015;
  ctx.fillStyle = `rgba(170,200,230,${fA})`;
  ctx.beginPath();
  ctx.ellipse(bx, by + Ts * ISO_SIN, 8 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// WINTER — Alexander Hall
// =========================================================================

const ALEX_PAL: BuildingPalette = {
  wallTop: "#A87868",
  wallLeft: "#986858",
  wallRight: "#784838",
  roofFront: "#2A4058",
  roofSide: "#1A3048",
  roofTop: "#3A5068",
  roofDark: "#0A2038",
  trim: "#886050",
  trimLight: "#C8A898",
  cornice: "#D8B8A8",
  glass: "#081018",
  foundTop: "#887060",
  foundLeft: "#786050",
  foundRight: "#584030",
  door: "#2A1808",
  accent: "#A8C8D8",
};

export function renderAlexanderHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = ALEX_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      40 * s,
      14 * s,
      46 * s,
      0.25,
      "0,0,0",
      z,
    );
  if (shadowOnly) return;

  const bodyW = 20;
  const bodyH = 18;
  const Ws = bodyW * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;

  // All foundations — drawn first so they layer behind everything
  const apseDist = 14;
  const apseCx = bx - apseDist * ISO_COS * s;
  const apseCy = by - apseDist * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    apseCx,
    apseCy,
    9,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );
  const turretFrontRight = { dx: bodyW * 0.7, dy: bodyW * 0.3 };
  const turretBackLeft = { dx: -bodyW * 0.7, dy: -bodyW * 0.3 };
  const turretPositions = [turretFrontRight, turretBackLeft];
  for (const tp of turretPositions) {
    const turCx = bx + tp.dx * ISO_COS * s + tp.dy * (-ISO_COS * s);
    const turCy = by + tp.dx * ISO_SIN * s + tp.dy * ISO_SIN * s;
    drawTowerFoundation(
      ctx,
      turCx,
      turCy,
      3.5,
      s,
      pal.foundTop,
      pal.foundLeft,
      pal.foundRight,
    );
  }

  // Back-left turret — drawn BEFORE main body so it layers behind
  {
    const tp = turretBackLeft;
    const turCx = bx + tp.dx * ISO_COS * s + tp.dy * (-ISO_COS * s);
    const turCy = by + tp.dx * ISO_SIN * s + tp.dy * ISO_SIN * s;
    drawCylindricalTower(
      ctx,
      turCx,
      turCy,
      3.5,
      22,
      s,
      "#A87868",
      "#986858",
      "#784838",
    );
    drawCircularBattlements(ctx, turCx, turCy - 22 * s, 3.5, s, pal.cornice, 6);
    drawConicalRoof(
      ctx,
      turCx,
      turCy - 22 * s - 1.5 * s,
      4,
      7,
      s,
      "#3A5068",
      "#1A3048",
    );
  }

  drawBaseAO(ctx, bx, by, bodyW * s, bodyW * s, 0.16);

  // Semi-circular apse — back-left (draw before main for z-order)
  drawCylindricalTower(
    ctx,
    apseCx,
    apseCy,
    9,
    18,
    s,
    "#A87868",
    "#986858",
    "#784838",
  );
  drawConicalRoof(
    ctx,
    apseCx,
    apseCy - 18 * s,
    9.5,
    8,
    s,
    "#3A5068",
    "#1A3048",
  );

  // Romanesque windows on apse — front-facing
  const apseAngles = frontAngles(4, 0.2);
  for (let i = 0; i < 4; i++) {
    const angle = apseAngles[i];
    const r = 9 * s;
    const wx = apseCx + Math.cos(angle) * r * 0.9;
    const wy = apseCy - 18 * s * 0.5 + Math.sin(angle) * r * 0.45;
    const fShort = Math.sin(angle);
    ctx.fillStyle = pal.trim;
    ctx.beginPath();
    ctx.ellipse(
      wx,
      wy,
      2 * s * Math.max(0.4, fShort),
      3.5 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = pal.glass;
    ctx.beginPath();
    ctx.ellipse(
      wx,
      wy,
      1.4 * s * Math.max(0.4, fShort),
      2.8 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Main building body (drawn in front of apse)
  drawBuildingSection(ctx, bx, by, bodyW, bodyW, bodyH, s, pal, {
    rows: 2,
    leftCols: 4,
    rightCols: 3,
    wu: 0.14,
    wv: 0.24,
    arched: true,
  });
  drawStoneBlockTexture(ctx, bx, by, Ws, Hs, s, "left", 55);
  drawHipRoof(ctx, bx, by, bodyW, bodyW, bodyH, 7, s, pal);

  drawFaceShading(ctx, bx, by, Ws, Ws, Hs, "left", 0.14);
  drawFaceShading(ctx, bx, by, Ws, Ws, Hs, "right", 0.2);
  drawStringCourse(ctx, bx, by, Ws, Ws, Hs, s, 0.55, pal.cornice);
  drawQuoins(ctx, bx, by, Ws, Ws, Hs, s, pal.trimLight, 4);
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "left",
    4,
    2,
    "rgba(255,200,120,0.08)",
    time,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "right",
    3,
    2,
    "rgba(255,200,120,0.08)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "left",
    166,
    3,
    "rgba(50,60,80,0.04)",
  );
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW,
    bodyW,
    bodyH,
    7,
    s,
    "rgba(20,40,60,0.04)",
    4,
  );

  // Front-right turret — drawn AFTER main body so it layers in front
  {
    const tp = turretFrontRight;
    const turCx = bx + tp.dx * ISO_COS * s + tp.dy * (-ISO_COS * s);
    const turCy = by + tp.dx * ISO_SIN * s + tp.dy * ISO_SIN * s;
    drawCylindricalTower(
      ctx,
      turCx,
      turCy,
      3.5,
      22,
      s,
      "#A87868",
      "#986858",
      "#784838",
    );
    drawCircularBattlements(ctx, turCx, turCy - 22 * s, 3.5, s, pal.cornice, 6);
    drawConicalRoof(
      ctx,
      turCx,
      turCy - 22 * s - 1.5 * s,
      4,
      7,
      s,
      "#3A5068",
      "#1A3048",
    );
  }

  // Heavy Richardsonian entrance arch on right face (isometric-aligned)
  const archX = bx + iW * 0.38;
  const archY = by + Ws * ISO_SIN * 1.4;
  const aW = 4.5 * s;
  const aH = 8 * s;
  drawIsoFaceArch(
    ctx,
    archX,
    archY + s,
    aW + 1.5 * s,
    aH + 2 * s,
    s,
    "right",
    pal.trimLight,
    false,
  );
  drawIsoFaceArch(ctx, archX, archY, aW, aH, s, "right", pal.door, false);

  // Snow patches on apse roof and main roof
  ctx.fillStyle = "rgba(230,240,250,0.5)";
  ctx.beginPath();
  ctx.ellipse(apseCx, apseCy - 18 * s - 5 * s, 4 * s, 2 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    bx + iW * 0.2,
    by - Hs - 4 * s,
    5 * s,
    2 * s,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}

// =========================================================================
// VOLCANIC — Fine Hall
// =========================================================================

const FINE_PAL: BuildingPalette = {
  wallTop: "#383030",
  wallLeft: "#282020",
  wallRight: "#181010",
  roofFront: "#100808",
  roofSide: "#0C0606",
  roofTop: "#1C1010",
  roofDark: "#080404",
  trim: "#201818",
  trimLight: "#484040",
  cornice: "#585050",
  glass: "#402008",
  foundTop: "#302828",
  foundLeft: "#201818",
  foundRight: "#100808",
  door: "#080404",
  accent: "#FF6A00",
};

export function renderFineHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = FINE_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      32 * s,
      12 * s,
      50 * s,
      0.3,
      "20,0,0",
      z,
    );
  if (shadowOnly) return;

  // Stair tower foundation — drawn first so it layers behind everything
  const tDist_fine = 14;
  const tBx_fine = bx + tDist_fine * ISO_COS * s;
  const tBy_fine = by + tDist_fine * ISO_SIN * s;
  drawTowerFoundation(
    ctx,
    tBx_fine,
    tBy_fine,
    5,
    s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  const bodyW = 16;
  const bodyH = 22;
  drawBaseAO(ctx, bx, by, bodyW * s, bodyW * s, 0.2);
  drawBuildingSection(ctx, bx, by, bodyW, bodyW, bodyH, s, pal, {
    rows: 3,
    leftCols: 3,
    rightCols: 2,
    wu: 0.16,
    wv: 0.18,
    arched: false,
  });

  // Amber-lit window overlay on left face
  const Ws = bodyW * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const wt = by - Hs;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const u = 0.07 + col * 0.28;
      const v = 0.1 + row * 0.25;
      const emA = 0.12 + Math.sin(time * 1.0 + row + col) * 0.06;
      ctx.fillStyle = `rgba(255,120,20,${emA})`;
      ctx.beginPath();
      drawIsoFaceQuad(
        ctx,
        bx,
        by,
        Ws,
        Ws,
        Hs,
        u + 0.02,
        v + 0.02,
        0.12,
        0.14,
        "left",
      );
      ctx.fill();
    }
  }

  drawIsometricPrism(
    ctx,
    bx,
    wt,
    17 * s,
    17 * s,
    2 * s,
    pal.cornice,
    pal.trimLight,
    pal.trim,
  );

  drawFaceShading(ctx, bx, by, Ws, Ws, Hs, "left", 0.2);
  drawFaceShading(ctx, bx, by, Ws, Ws, Hs, "right", 0.25);
  drawQuoins(ctx, bx, by, Ws, Ws, Hs, s, pal.trimLight, 5);
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "left",
    177,
    4,
    "rgba(180,40,0,0.04)",
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws,
    Ws,
    Hs,
    s,
    "right",
    188,
    3,
    "rgba(180,40,0,0.04)",
  );
  drawChimney(ctx, bx - iW * 0.3, wt + 2 * s, s, "#201010", "#302020", 0.08);

  // Cylindrical stair tower — front-right (foundation already drawn at top)
  const tDist = tDist_fine;
  const tBx = tBx_fine;
  const tBy = tBy_fine;
  drawCylindricalTower(
    ctx,
    tBx,
    tBy,
    5,
    34,
    s,
    "#383030",
    "#282020",
    "#101010",
  );
  drawCircularBattlements(ctx, tBx, tBy - 34 * s, 5, s, "#585050", 8);

  // Glowing rune windows on stair tower — front-facing
  const runeAngles = frontAngles(5, 0.2);
  for (let row = 0; row < 5; row++) {
    const rA = 0.15 + Math.sin(time * 1.5 + row * 1.1) * 0.08;
    drawRoundWindowOnCylinder(
      ctx,
      tBx,
      tBy,
      5,
      34,
      runeAngles[row],
      0.1 + row * 0.16,
      1.3,
      s,
      "#201010",
      `rgba(255,100,0,${rA})`,
    );
  }

  // Flat cap on stair tower
  ctx.fillStyle = "#100808";
  ctx.beginPath();
  ctx.ellipse(
    tBx,
    tBy - 34 * s - 2 * s,
    5.5 * s,
    5.5 * s * 0.5,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing geometric rune on left wall (isometric-aligned)
  const runeAlpha = 0.1 + Math.sin(time * 0.8) * 0.05;
  ctx.strokeStyle = `rgba(255,80,0,${runeAlpha})`;
  ctx.lineWidth = 0.5 * s;
  const runeY = wt + Ws * ISO_SIN * 1.5 + Hs * 0.3;
  const runeX = bx - iW * 0.5;
  const rdx = ISO_COS;
  const rdy = ISO_SIN;
  ctx.beginPath();
  ctx.moveTo(runeX + 3 * s * rdx, runeY + 3 * s * rdy);
  ctx.lineTo(runeX, runeY - 4 * s);
  ctx.lineTo(runeX - 3 * s * rdx, runeY - 3 * s * rdy);
  ctx.lineTo(runeX, runeY + 4 * s);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    runeX,
    runeY,
    2 * s * ISO_COS,
    2 * s * ISO_SIN,
    0,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Lava cracks at base
  const crackA = 0.15 + Math.sin(time * 1.5) * 0.05;
  ctx.strokeStyle = `rgba(255,68,0,${crackA})`;
  ctx.lineWidth = 0.5 * s;
  for (let i = 0; i < 3; i++) {
    const ca = (i / 3) * Math.PI * 2 + 0.5;
    const sx = bx + Math.cos(ca) * iW * 0.7;
    const sy = by + Math.sin(ca) * Ws * ISO_SIN * 1.1 + 4 * s;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 2.5 * s, sy + 1.5 * s, sx + 5 * s, sy - 0.5 * s);
    ctx.stroke();
  }
}

// =========================================================================
// VOLCANIC — Foulke Hall
// =========================================================================

const FOULKE_PAL: BuildingPalette = {
  wallTop: "#3A2828",
  wallLeft: "#2A1818",
  wallRight: "#1A0A0A",
  roofFront: "#140606",
  roofSide: "#0E0404",
  roofTop: "#200C0C",
  roofDark: "#080202",
  trim: "#281414",
  trimLight: "#4A3030",
  cornice: "#5A3838",
  glass: "#300808",
  foundTop: "#2A1818",
  foundLeft: "#1A0A0A",
  foundRight: "#100404",
  door: "#080202",
  accent: "#FF4000",
};

export function renderFoulkeHall(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = FOULKE_PAL;
  const bx = cx;
  const by = cy - 6 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 6 * s,
      s,
      42 * s,
      15 * s,
      50 * s,
      0.32,
      "20,0,0",
      z,
    );
  if (shadowOnly) return;

  // Corner tower foundations — drawn first so they layer behind everything
  const corners = [
    { dist: 16, dir: -1 },
    { dist: 16, dir: 1 },
  ];
  for (const c of corners) {
    const tcx = bx + c.dir * c.dist * ISO_COS * s;
    const tcy = by + c.dir * c.dist * ISO_SIN * s;
    drawTowerFoundation(
      ctx,
      tcx,
      tcy,
      4,
      s,
      pal.foundTop,
      pal.foundLeft,
      pal.foundRight,
    );
  }

  // Back-left turret (dir=-1) — drawn BEFORE main body so it layers behind
  const turretWinAngles = frontAngles(3);
  {
    const c = corners[0];
    const tcx = bx + c.dir * c.dist * ISO_COS * s;
    const tcy = by + c.dir * c.dist * ISO_SIN * s;
    drawCylindricalTower(
      ctx,
      tcx,
      tcy,
      4,
      28,
      s,
      "#3A2828",
      "#2A1818",
      "#140A0A",
    );
    drawCircularBattlements(ctx, tcx, tcy - 28 * s, 4, s, pal.cornice, 8);
    drawConicalRoof(
      ctx,
      tcx,
      tcy - 28 * s - 1.5 * s,
      4.5,
      10,
      s,
      "#200C0C",
      "#0E0404",
    );
    for (let row = 0; row < 3; row++) {
      const eyeA = 0.2 + Math.sin(time * 1.3 + row * 2 + c.dir) * 0.1;
      drawRoundWindowOnCylinder(
        ctx,
        tcx,
        tcy,
        4,
        28,
        turretWinAngles[row],
        0.2 + row * 0.22,
        1.2,
        s,
        "#1A0808",
        `rgba(255,50,0,${eyeA})`,
      );
    }
  }

  const bodyW = 22;
  const bodyH = 20;
  drawBaseAO(ctx, bx, by, bodyW * s, bodyW * s, 0.22);
  drawBuildingSection(ctx, bx, by, bodyW, bodyW, bodyH, s, pal, {
    rows: 2,
    leftCols: 5,
    rightCols: 3,
    wu: 0.12,
    wv: 0.26,
    arched: true,
  });
  drawGabledRoof(ctx, bx, by, bodyW, bodyW, bodyH, 9, s, pal);

  const Ws_fh = bodyW * s;
  const Hs_fh = bodyH * s;
  drawFaceShading(ctx, bx, by, Ws_fh, Ws_fh, Hs_fh, "left", 0.2);
  drawFaceShading(ctx, bx, by, Ws_fh, Ws_fh, Hs_fh, "right", 0.25);
  drawStringCourse(ctx, bx, by, Ws_fh, Ws_fh, Hs_fh, s, 0.6, pal.cornice);
  drawQuoins(ctx, bx, by, Ws_fh, Ws_fh, Hs_fh, s, pal.trimLight, 5);
  drawEntrance(
    ctx,
    bx,
    by,
    Ws_fh,
    Ws_fh,
    Hs_fh,
    s,
    "right",
    pal.door,
    "#1A0808",
    0.38,
    0.12,
    0.3,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws_fh,
    Ws_fh,
    Hs_fh,
    s,
    "left",
    5,
    2,
    "rgba(255,80,0,0.06)",
    time,
  );
  drawWindowGlows(
    ctx,
    bx,
    by,
    Ws_fh,
    Ws_fh,
    Hs_fh,
    s,
    "right",
    3,
    2,
    "rgba(255,80,0,0.06)",
    time,
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws_fh,
    Ws_fh,
    Hs_fh,
    s,
    "left",
    199,
    5,
    "rgba(160,30,0,0.05)",
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    Ws_fh,
    Ws_fh,
    Hs_fh,
    s,
    "right",
    210,
    4,
    "rgba(160,30,0,0.05)",
  );
  drawRoofShingles(
    ctx,
    bx,
    by,
    bodyW,
    bodyW,
    bodyH,
    9,
    s,
    "rgba(100,20,0,0.05)",
    5,
  );

  const Ws = bodyW * s;
  const Hs = bodyH * s;
  const iW = Ws * ISO_COS;
  const wt = by - Hs;

  // Front-right turret (dir=1) — drawn AFTER main body so it layers in front
  {
    const c = corners[1];
    const tcx = bx + c.dir * c.dist * ISO_COS * s;
    const tcy = by + c.dir * c.dist * ISO_SIN * s;
    drawCylindricalTower(
      ctx,
      tcx,
      tcy,
      4,
      28,
      s,
      "#3A2828",
      "#2A1818",
      "#140A0A",
    );
    drawCircularBattlements(ctx, tcx, tcy - 28 * s, 4, s, pal.cornice, 8);
    drawConicalRoof(
      ctx,
      tcx,
      tcy - 28 * s - 1.5 * s,
      4.5,
      10,
      s,
      "#200C0C",
      "#0E0404",
    );
    for (let row = 0; row < 3; row++) {
      const eyeA = 0.2 + Math.sin(time * 1.3 + row * 2 + c.dir) * 0.1;
      drawRoundWindowOnCylinder(
        ctx,
        tcx,
        tcy,
        4,
        28,
        turretWinAngles[row],
        0.2 + row * 0.22,
        1.2,
        s,
        "#1A0808",
        `rgba(255,50,0,${eyeA})`,
      );
    }
  }

  // Gargoyle spouts on left face (isometric-aligned, project outward from face)
  ctx.fillStyle = "#2A1818";
  for (let i = 0; i < 3; i++) {
    const gx = bx - iW * (0.2 + i * 0.3);
    const gy = wt + Ws * ISO_SIN * (1.2 + i * 0.1) + 2 * s;
    const gdx = -ISO_SIN;
    const gdy = ISO_COS;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 3 * s * gdx, gy + 3 * s * gdy);
    ctx.lineTo(gx + 3 * s * gdx, gy + 3 * s * gdy - s);
    ctx.lineTo(gx + s * gdx, gy + s * gdy - 0.5 * s);
    ctx.closePath();
    ctx.fill();
    const geA = 0.3 + Math.sin(time * 1.8 + i * 2.3) * 0.15;
    ctx.fillStyle = `rgba(255,50,0,${geA})`;
    ctx.beginPath();
    ctx.ellipse(
      gx + 2 * s * gdx,
      gy + 2 * s * gdy,
      0.4 * s,
      0.3 * s,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#2A1818";
  }

  // Smoking chimneys on roof ridge
  for (let i = 0; i < 2; i++) {
    const chX = bx + (i - 0.5) * iW * 0.5;
    const chY = wt - 9 * s * (1 - i * 0.15);
    drawCylindricalTower(
      ctx,
      chX,
      chY + 4 * s,
      1.5,
      4,
      s,
      "#3A2828",
      "#2A1818",
      "#1A0808",
    );
    const smokeA = 0.1 + Math.sin(time * 1.0 + i * 1.5) * 0.05;
    ctx.fillStyle = `rgba(255,60,0,${smokeA})`;
    ctx.beginPath();
    ctx.ellipse(chX, chY - 1 * s, 2 * s, 1 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sinister door glow
  const glA = 0.08 + Math.sin(time * 0.8) * 0.04;
  const doorGlow = ctx.createRadialGradient(
    bx,
    by + Ws * ISO_SIN,
    0,
    bx,
    by + Ws * ISO_SIN,
    6 * s,
  );
  doorGlow.addColorStop(0, `rgba(255,50,0,${glA})`);
  doorGlow.addColorStop(1, "rgba(255,50,0,0)");
  ctx.fillStyle = doorGlow;
  ctx.beginPath();
  ctx.ellipse(bx, by + Ws * ISO_SIN, 5 * s, 2.5 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}

// =========================================================================
// VOLCANIC — Tiger Stadium
// =========================================================================

const STADIUM_PAL: BuildingPalette = {
  wallTop: "#3A2020",
  wallLeft: "#2A1010",
  wallRight: "#1A0808",
  roofFront: "#100404",
  roofSide: "#0C0202",
  roofTop: "#180808",
  roofDark: "#080202",
  trim: "#201010",
  trimLight: "#4A2828",
  cornice: "#5A3030",
  glass: "#200808",
  foundTop: "#2A1818",
  foundLeft: "#1A0A0A",
  foundRight: "#100404",
  door: "#060202",
  accent: "#FF4400",
};

export function renderTigerStadium(p: LandmarkParams): void {
  const {
    ctx,
    screenX: cx,
    screenY: cy,
    s: sRaw,
    time,
    skipShadow,
    shadowOnly,
    zoom: z = 1,
  } = p;
  const s = sRaw * 2.0;
  const pal = STADIUM_PAL;
  const bx = cx;
  const by = cy - 4 * s;

  if (!skipShadow)
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 4 * s,
      s,
      50 * s,
      20 * s,
      50 * s,
      0.32,
      "20,0,0",
      z,
    );
  if (shadowOnly) return;

  const wallWs = 26 * s;
  const wallHs = 18 * s;
  const iW = wallWs * ISO_COS;
  const iD = wallWs * ISO_SIN;
  const wt = by - wallHs;

  const cornerOffsets = [
    { x: bx - iW, y: wt + iD },
    { x: bx + iW, y: wt + iD },
    { x: bx, y: wt },
    { x: bx, y: wt + 2 * iD },
  ];

  // Tower foundations at all four corners
  for (const co of cornerOffsets) {
    drawTowerFoundation(
      ctx,
      co.x,
      co.y + wallHs,
      5,
      s,
      pal.foundTop,
      pal.foundLeft,
      pal.foundRight,
    );
  }

  // Back corner towers (top + left) — drawn BEFORE wall for z-order
  const backCorners = [cornerOffsets[2], cornerOffsets[0]];
  for (const co of backCorners) {
    renderStadiumTower(ctx, co.x, co.y + wallHs, s, pal, time);
  }

  drawBaseAO(ctx, bx, by, wallWs, wallWs, 0.22);

  // Stepped foundation platform
  drawIsometricPrism(
    ctx,
    bx,
    by + 3 * s,
    (26 + 4) * s,
    (26 + 4) * s,
    3 * s,
    pal.foundTop,
    pal.foundLeft,
    pal.foundRight,
  );

  // Main outer wall — taller and more imposing
  drawIsometricPrism(
    ctx,
    bx,
    by,
    wallWs,
    wallWs,
    wallHs,
    pal.wallTop,
    pal.wallLeft,
    pal.wallRight,
  );

  // Rich wall textures
  drawStoneBlockTexture(ctx, bx, by, wallWs, wallHs, s, "left", 91);
  drawStoneBlockTexture(ctx, bx, by, wallWs, wallHs, s, "right", 113);
  drawBrickTexture(
    ctx,
    bx,
    by,
    wallWs,
    wallHs,
    s,
    "#4A2020",
    "rgba(0,0,0,0.06)",
    "left",
  );
  drawBrickTexture(
    ctx,
    bx,
    by,
    wallWs,
    wallHs,
    s,
    "#4A2020",
    "rgba(0,0,0,0.06)",
    "right",
  );
  drawMortarLines(ctx, bx, by, wallWs, wallHs, 5, "rgba(0,0,0,0.05)", s);

  // String courses — horizontal bands for visual weight
  drawStringCourse(ctx, bx, by, wallWs, wallWs, wallHs, s, 0.35, pal.cornice);
  drawStringCourse(ctx, bx, by, wallWs, wallWs, wallHs, s, 0.7, pal.cornice);

  // Colosseum-style arched openings on both faces
  for (let i = 0; i < 5; i++) {
    const u = 0.04 + i * 0.18;
    const aX_l = bx - iW * (1 - u - 0.07);
    const aY_l = by + iD * (1 + u + 0.07);
    drawIsoFaceArch(
      ctx,
      aX_l,
      aY_l,
      2 * s,
      4.5 * s,
      s,
      "left",
      "#0A0404",
      false,
    );
  }
  for (let i = 0; i < 4; i++) {
    const u = 0.06 + i * 0.2;
    const aX_r = bx + iW * (1 - u - 0.08);
    const aY_r = by + iD * (1 + u + 0.08);
    drawIsoFaceArch(
      ctx,
      aX_r,
      aY_r,
      2 * s,
      4.5 * s,
      s,
      "right",
      "#0A0404",
      false,
    );
  }

  // Parapet crown atop the wall
  drawIsometricPrism(
    ctx,
    bx,
    wt,
    (26 + 1) * s,
    (26 + 1) * s,
    2 * s,
    pal.cornice,
    pal.trimLight,
    pal.trim,
  );

  // Tiered seating bowl — 5 tiers for depth
  for (let tier = 0; tier < 5; tier++) {
    const tierW = (26 - 2 - tier * 2.8) * s;
    const tierH = (2.5 - tier * 0.2) * s;
    const tierTop =
      tier === 0
        ? "#5A3838"
        : tier === 1
          ? "#4A2828"
          : tier === 2
            ? "#3A2020"
            : tier === 3
              ? "#2A1414"
              : "#1A0A0A";
    const tierLeft =
      tier === 0
        ? "#4A2828"
        : tier === 1
          ? "#3A1818"
          : tier === 2
            ? "#2A1010"
            : tier === 3
              ? "#1A0808"
              : "#100404";
    drawIsometricPrism(
      ctx,
      bx,
      wt + (tier + 1) * 2.8 * s,
      tierW,
      tierW,
      tierH,
      tierTop,
      tierLeft,
      pal.wallRight,
    );
  }

  // Arena floor — dark obsidian with lava veins
  const floorW = 10 * s;
  const fiW = floorW * ISO_COS;
  const fiD = floorW * ISO_SIN;
  const floorY = wt + 16 * s;
  ctx.fillStyle = "#0C0202";
  ctx.beginPath();
  ctx.moveTo(bx, floorY);
  ctx.lineTo(bx + fiW, floorY + fiD);
  ctx.lineTo(bx, floorY + fiD * 2);
  ctx.lineTo(bx - fiW, floorY + fiD);
  ctx.closePath();
  ctx.fill();

  // Glowing lava veins across the arena floor
  const veinA = 0.25 + Math.sin(time * 1.2) * 0.1;
  ctx.strokeStyle = `rgba(255,60,0,${veinA})`;
  ctx.lineWidth = 0.4 * s;
  const floorCy = floorY + fiD;
  for (let v = 0; v < 3; v++) {
    const angle = (v / 3) * Math.PI + time * 0.15;
    const vr = fiW * 0.6;
    ctx.beginPath();
    ctx.moveTo(bx, floorCy);
    ctx.quadraticCurveTo(
      bx + Math.cos(angle) * vr * 0.5,
      floorCy + Math.sin(angle) * vr * 0.25,
      bx + Math.cos(angle) * vr,
      floorCy + Math.sin(angle) * vr * 0.5,
    );
    ctx.stroke();
  }

  // Central lava glow on arena floor
  const centralA = 0.12 + Math.sin(time * 0.9) * 0.05;
  const centralGlow = ctx.createRadialGradient(
    bx,
    floorCy,
    0,
    bx,
    floorCy,
    fiW * 0.7,
  );
  centralGlow.addColorStop(0, `rgba(255,80,0,${centralA})`);
  centralGlow.addColorStop(0.5, `rgba(255,40,0,${centralA * 0.4})`);
  centralGlow.addColorStop(1, "rgba(255,20,0,0)");
  ctx.fillStyle = centralGlow;
  ctx.beginPath();
  ctx.ellipse(bx, floorCy, fiW * 0.7, fiD * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face shading and weathering
  drawFaceShading(ctx, bx, by, wallWs, wallWs, wallHs, "left", 0.2);
  drawFaceShading(ctx, bx, by, wallWs, wallWs, wallHs, "right", 0.25);
  drawQuoins(ctx, bx, by, wallWs, wallWs, wallHs, s, pal.trimLight, 5);
  drawWeatherStains(
    ctx,
    bx,
    by,
    wallWs,
    wallWs,
    wallHs,
    s,
    "left",
    222,
    5,
    "rgba(180,30,0,0.05)",
  );
  drawWeatherStains(
    ctx,
    bx,
    by,
    wallWs,
    wallWs,
    wallHs,
    s,
    "right",
    233,
    4,
    "rgba(180,30,0,0.05)",
  );

  // Grand entrance archway on right face — deep recessed arch with voussoir trim
  const gateX = bx + iW * 0.45;
  const gateY = by + iD * 1.4;
  drawIsoFaceArch(
    ctx,
    gateX,
    gateY + s,
    5 * s,
    8 * s,
    s,
    "right",
    pal.trimLight,
    false,
  );
  drawIsoFaceArch(
    ctx,
    gateX,
    gateY,
    4 * s,
    7 * s,
    s,
    "right",
    "#060202",
    true,
  );

  // Iron portcullis bars in the gate
  const gateFdx = -ISO_COS;
  const gateFdy = ISO_SIN;
  ctx.strokeStyle = "#3A1818";
  ctx.lineWidth = 0.5 * s;
  for (let bar = 0; bar < 5; bar++) {
    const t = (bar + 1) / 6;
    const barOff = (t * 2 - 1) * 4 * s;
    const barX = gateX + barOff * gateFdx;
    const barY = gateY + barOff * gateFdy;
    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX, barY - 6 * s);
    ctx.stroke();
  }
  // Horizontal bar across the gate
  ctx.lineWidth = 0.4 * s;
  const hBarY = gateY - 3 * s;
  ctx.beginPath();
  ctx.moveTo(gateX + 4 * s * gateFdx, hBarY + 4 * s * gateFdy);
  ctx.lineTo(gateX - 4 * s * gateFdx, hBarY - 4 * s * gateFdy);
  ctx.stroke();

  // Secondary gate on left face
  const gateX2 = bx - iW * 0.45;
  const gateY2 = by + iD * 0.6;
  drawIsoFaceArch(
    ctx,
    gateX2,
    gateY2,
    3 * s,
    5.5 * s,
    s,
    "left",
    "#060202",
    false,
  );

  // Pennant flags along the parapet — multiple along each face
  const flagPositions = [
    { t: 0.2, face: "left" as const },
    { t: 0.5, face: "left" as const },
    { t: 0.8, face: "left" as const },
    { t: 0.25, face: "right" as const },
    { t: 0.6, face: "right" as const },
  ];
  for (const fp of flagPositions) {
    let fx: number, fy: number;
    if (fp.face === "left") {
      fx = bx - iW * (1 - fp.t);
      fy = wt + iD * (1 + fp.t) - 2 * s;
    } else {
      fx = bx + iW * (1 - fp.t);
      fy = wt + iD * (1 + fp.t) - 2 * s;
    }
    drawFlagPole(ctx, fx, fy, 7, s, "#4A2020", "#FF4400", time + fp.t * 5);
  }

  // Tiger emblem on right wall — glowing isometric diamond shape
  const embX = bx + iW * 0.42;
  const embY = by + iD * 1.2 - wallHs * 0.5;
  const embA = 0.35 + Math.sin(time * 1.0) * 0.12;
  const embS = 3.5 * s;

  // Diamond emblem outline
  ctx.strokeStyle = `rgba(255,100,0,${embA + 0.15})`;
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(embX, embY - embS);
  ctx.lineTo(embX - embS * ISO_COS, embY - embS * 0.3);
  ctx.lineTo(embX, embY + embS * 0.4);
  ctx.lineTo(embX + embS * ISO_COS, embY - embS * 0.3);
  ctx.closePath();
  ctx.stroke();

  // Filled inner emblem
  ctx.fillStyle = `rgba(255,80,0,${embA * 0.5})`;
  ctx.fill();

  // Glowing "P" inside the diamond
  ctx.fillStyle = `rgba(255,160,40,${embA + 0.1})`;
  ctx.font = `bold ${3.2 * s}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", embX, embY - embS * 0.1);
  ctx.textBaseline = "alphabetic";

  // Second emblem on left wall
  const emb2X = bx - iW * 0.42;
  const emb2Y = by + iD * 0.8 - wallHs * 0.5;
  ctx.strokeStyle = `rgba(255,100,0,${embA + 0.1})`;
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(emb2X, emb2Y - embS * 0.8);
  ctx.lineTo(emb2X - embS * ISO_COS * 0.8, emb2Y - embS * 0.2);
  ctx.lineTo(emb2X, emb2Y + embS * 0.35);
  ctx.lineTo(emb2X + embS * ISO_COS * 0.8, emb2Y - embS * 0.2);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = `rgba(255,80,0,${embA * 0.4})`;
  ctx.fill();

  // Front corner towers (right + bottom) — drawn AFTER wall for z-order
  const frontCorners = [cornerOffsets[1], cornerOffsets[3]];
  for (const co of frontCorners) {
    renderStadiumTower(ctx, co.x, co.y + wallHs, s, pal, time);
  }

  // Lava cracks radiating from the base
  const crackA = 0.2 + Math.sin(time * 1.5) * 0.08;
  ctx.strokeStyle = `rgba(255,60,0,${crackA})`;
  ctx.lineWidth = 0.5 * s;
  for (let i = 0; i < 5; i++) {
    const ca = (i / 5) * Math.PI * 2 + 0.3;
    const sx = bx + Math.cos(ca) * iW * 0.85;
    const sy = by + Math.sin(ca) * iD * 1.3 + 3 * s;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(
      sx + 3 * s * Math.cos(ca + 0.3),
      sy + 1.5 * s * Math.sin(ca + 0.3),
      sx + 6 * s * Math.cos(ca),
      sy + 0.5 * s,
    );
    ctx.stroke();
  }

  // Volcanic haze glow around the base
  const hazeA = 0.06 + Math.sin(time * 0.5) * 0.02;
  const hazeGrad = ctx.createRadialGradient(
    bx,
    by + iD,
    0,
    bx,
    by + iD,
    iW * 1.3,
  );
  hazeGrad.addColorStop(0, `rgba(255,50,0,${hazeA})`);
  hazeGrad.addColorStop(0.6, `rgba(200,30,0,${hazeA * 0.4})`);
  hazeGrad.addColorStop(1, "rgba(150,20,0,0)");
  ctx.fillStyle = hazeGrad;
  ctx.beginPath();
  ctx.ellipse(bx, by + iD, iW * 1.3, iD * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
}

function renderStadiumTower(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  s: number,
  pal: BuildingPalette,
  time: number,
): void {
  const tR = 4;
  const tH = 26;

  drawCylindricalTower(
    ctx,
    x,
    baseY,
    tR,
    tH,
    s,
    "#3A2020",
    "#2A1010",
    "#140808",
  );

  // Round windows on the tower
  const tWinAngles = frontAngles(3);
  for (let row = 0; row < 3; row++) {
    const winA = 0.15 + Math.sin(time * 1.4 + row * 1.8) * 0.08;
    drawRoundWindowOnCylinder(
      ctx,
      x,
      baseY,
      tR,
      tH,
      tWinAngles[row],
      0.2 + row * 0.24,
      1.3,
      s,
      "#1A0808",
      `rgba(255,60,0,${winA})`,
    );
  }

  drawCircularBattlements(ctx, x, baseY - tH * s, tR, s, pal.cornice, 8);
  drawConicalRoof(
    ctx,
    x,
    baseY - tH * s - 1.5 * s,
    tR + 0.5,
    8,
    s,
    "#200C0C",
    "#0E0404",
  );

  // Brazier fire atop the tower
  const fireA =
    0.4 + Math.sin(time * 2.5 + x * 0.01 + baseY * 0.02) * 0.15;
  const fireGrad = ctx.createRadialGradient(
    x,
    baseY - tH * s - 10 * s,
    0,
    x,
    baseY - tH * s - 8 * s,
    4 * s,
  );
  fireGrad.addColorStop(0, `rgba(255,220,60,${fireA})`);
  fireGrad.addColorStop(0.35, `rgba(255,120,20,${fireA * 0.7})`);
  fireGrad.addColorStop(0.7, `rgba(255,50,0,${fireA * 0.3})`);
  fireGrad.addColorStop(1, "rgba(255,30,0,0)");
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    baseY - tH * s - 10 * s,
    3.5 * s,
    2.5 * s,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
}
