import { ISO_COS, ISO_SIN, ISO_Y_RATIO } from "../../constants";
import type { DecorationType, Position } from "../../types";
import {
  drawOrganicBlobAt,
  drawIsometricPrism,
  drawIsometricPyramid,
} from "../helpers";
import { traceIsoFlushRect } from "../isoFlush";
import { clearShadow, setShadowBlur } from "../performance";
import { drawDirectionalShadow } from "./shadowHelpers";

export interface ChallengeLandmarkRenderParams {
  ctx: CanvasRenderingContext2D;
  screenPos: Position;
  scale: number;
  type: DecorationType;
  decorTime: number;
  decorX: number;
  decorY: number;
  shadowOnly?: boolean;
  skipShadow?: boolean;
  zoom?: number;
}

export const CHALLENGE_LANDMARK_TYPES = new Set<DecorationType>([
  "cannon_crest",
  "ivy_crossroads",
  "blight_basin",
  "triad_keep",
  "sunscorch_labyrinth",
  "frist_outpost",
  "ashen_spiral",
  "mirage_dunes",
]);

type CannonDirection = "left" | "center" | "right";

// ---------------------------------------------------------------------------
// Shared micro-helpers
// ---------------------------------------------------------------------------

function fillIsoEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number = radiusX * ISO_Y_RATIO,
  rotation: number = 0
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.fill();
}

function strokeIsoEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX: number,
  radiusY: number = radiusX * ISO_Y_RATIO,
  rotation: number = 0
): void {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, rotation, 0, Math.PI * 2);
  ctx.stroke();
}

function getIsoOrbitPoint(
  x: number,
  y: number,
  angle: number,
  radiusX: number,
  radiusY: number = radiusX * ISO_Y_RATIO
): Position {
  return {
    x: x + Math.cos(angle) * radiusX,
    y: y + Math.sin(angle) * radiusY,
  };
}

function drawStoneRows(
  ctx: CanvasRenderingContext2D,
  ox: number,
  baseY: number,
  isoW: number,
  isoD: number,
  height: number,
  rows: number,
  alpha: number = 0.15
): void {
  ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
  ctx.lineWidth = 0.4;
  for (let r = 1; r < rows; r++) {
    const ry = baseY - height * (r / rows);
    ctx.beginPath();
    ctx.moveTo(ox - isoW, ry + isoD);
    ctx.lineTo(ox, ry + isoD * 2);
    ctx.lineTo(ox + isoW, ry + isoD);
    ctx.stroke();
  }
}

function drawEdgeHighlights(
  ctx: CanvasRenderingContext2D,
  ox: number,
  baseY: number,
  isoW: number,
  isoD: number,
  height: number,
  color: string
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(ox, baseY + isoD * 2);
  ctx.lineTo(ox, baseY - height + isoD * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox - isoW, baseY + isoD);
  ctx.lineTo(ox - isoW, baseY - height + isoD);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox + isoW, baseY + isoD);
  ctx.lineTo(ox + isoW, baseY - height + isoD);
  ctx.stroke();
}

function drawSmoke(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  t: number,
  count: number,
  spread: number,
  rise: number,
  color: string,
  maxAlpha: number
): void {
  for (let sw = 0; sw < count; sw++) {
    const phase = (t * 0.3 + sw * (1 / count)) % 1;
    const sx = x + Math.sin(sw * 2.5 + t) * spread * s;
    const sy = y - phase * rise * s;
    const alpha = (1 - phase) * maxAlpha;
    ctx.fillStyle = color.includes("rgba")
      ? color
      : `rgba(${color},${alpha.toFixed(3)})`;
    if (!color.includes("rgba")) {
      ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
    }
    ctx.beginPath();
    ctx.ellipse(
      sx,
      sy,
      (2 + phase * 4) * s,
      (1.2 + phase * 2) * s,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Cannon Crest
// ---------------------------------------------------------------------------

function drawDetailedCannon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  dir: CannonDirection,
  t: number
): void {
  const d = dir === "left" ? -1 : dir === "right" ? 1 : 0;
  const muzzleX = x + d * 10 * s;
  const muzzleY = y - (9 - Math.abs(d) * 1.5) * s;

  const wheelColor1 = "#4a3220";
  const wheelColor2 = "#3a2214";
  const axleColor = "#2d1d11";

  for (const wheelOff of [-4.8, 4.8]) {
    const wx = x + wheelOff * s;
    const wy = y + 4.8 * s;
    ctx.fillStyle = wheelOff < 0 ? wheelColor1 : wheelColor2;
    fillIsoEllipse(ctx, wx, wy, 3 * s, 3 * s * ISO_Y_RATIO);

    ctx.strokeStyle = axleColor;
    ctx.lineWidth = 0.5 * s;
    strokeIsoEllipse(ctx, wx, wy, 3 * s, 3 * s * ISO_Y_RATIO);

    ctx.lineWidth = 0.55 * s;
    for (let spoke = 0; spoke < 6; spoke++) {
      const ang = (spoke / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(
        wx + Math.cos(ang) * 2.6 * s,
        wy + Math.sin(ang) * 2.6 * s * ISO_Y_RATIO
      );
      ctx.stroke();
    }
    ctx.fillStyle = "#1a1008";
    fillIsoEllipse(ctx, wx, wy, 0.8 * s, 0.8 * s * ISO_Y_RATIO);
  }

  drawIsometricPrism(
    ctx,
    x,
    y + 2 * s,
    5 * s,
    4.5 * s,
    4 * s,
    "#6a5035",
    "#3d2919",
    "#54391f"
  );

  const barrelGrad = ctx.createLinearGradient(
    x - 2.4 * s,
    y - 4 * s,
    muzzleX,
    muzzleY
  );
  barrelGrad.addColorStop(0, "#3a3a3a");
  barrelGrad.addColorStop(0.4, "#2a2a2a");
  barrelGrad.addColorStop(1, "#1a1a1a");

  ctx.fillStyle = barrelGrad;
  ctx.beginPath();
  ctx.moveTo(x - 2.4 * s, y - 4 * s);
  ctx.lineTo(x + 2.4 * s, y - 4.8 * s);
  ctx.lineTo(muzzleX + 2.2 * s, muzzleY);
  ctx.lineTo(muzzleX - 2.2 * s, muzzleY + 0.8 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.moveTo(x - 2.4 * s, y - 5.5 * s);
  ctx.lineTo(x + 2.4 * s, y - 6.3 * s);
  ctx.lineTo(muzzleX + 1.8 * s, muzzleY - 1.5 * s);
  ctx.lineTo(muzzleX - 1.8 * s, muzzleY - 0.7 * s);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0e0e0e";
  fillIsoEllipse(
    ctx,
    muzzleX,
    muzzleY - 0.5 * s,
    1.5 * s,
    1.5 * s * ISO_Y_RATIO
  );

  for (const bandT of [0.3, 0.6, 0.85]) {
    const bx = x + (muzzleX - x) * bandT;
    const by = y - 4 * s + (muzzleY - (y - 4 * s)) * bandT;
    ctx.strokeStyle = "#777";
    ctx.lineWidth = 0.8 * s;
    ctx.beginPath();
    ctx.moveTo(bx - 1.6 * s, by);
    ctx.lineTo(bx + 1.6 * s, by - 0.5 * s);
    ctx.stroke();
  }

  const smokeDrift = Math.sin(t * 3 + x * 0.01) * 2 * s;
  for (let p = 0; p < 3; p++) {
    const phase = (t * 0.5 + p * 0.35) % 1;
    if (phase < 0.6) {
      const alpha = (1 - phase / 0.6) * 0.15;
      const sx = muzzleX + d * phase * 8 * s + smokeDrift;
      const sy = muzzleY - phase * 6 * s;
      ctx.fillStyle = `rgba(120,110,100,${alpha})`;
      ctx.beginPath();
      ctx.ellipse(
        sx,
        sy,
        (2 + phase * 3) * s,
        (1 + phase * 1.5) * s,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
}

function drawCannonCrestLandmark(params: ChallengeLandmarkRenderParams): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const bermTop = "#a08860";
  const bermLeft = "#6a5838";
  const bermRight = "#826a42";
  const bermEdge = "#b49e70";
  const stoneTop = "#807058";
  const stoneLeft = "#4a3e2e";
  const stoneRight = "#5c4e38";
  const stoneHi = "#968060";

  // Berm iso geometry — square footprint for proper 2:1 iso diamond angles
  const bermSize = 26 * s;
  const bermH = 6 * s;
  const bI = bermSize * ISO_COS;
  const bD = bermSize * ISO_SIN;
  const bermBaseY = cy + bermH - bD;

  // Foundation iso geometry — square footprint, visible step below berm
  const foundSize = 28 * s;
  const foundH = 5 * s;
  const fI = foundSize * ISO_COS;
  const fD = foundSize * ISO_SIN;
  const foundBaseY = bermBaseY + 3 * s;

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 8 * s,
      s,
      40 * s,
      18 * s,
      48 * s,
      0.38,
      "0,0,0",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Ground scorch marks from cannon fire
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 8 * s,
    0,
    cx,
    cy + 8 * s,
    36 * s
  );
  gGrad.addColorStop(0, "rgba(120,95,55,0.3)");
  gGrad.addColorStop(0.4, "rgba(100,80,45,0.18)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 8 * s, 36 * s, 18 * s, 18.4, 0.14, 22);
  ctx.fill();

  for (const [sx, sy, sr] of [
    [-18, 12, 5],
    [2, 16, 6],
    [18, 13, 4.5],
  ] as const) {
    const scorchGrad = ctx.createRadialGradient(
      cx + sx * s,
      cy + sy * s,
      0,
      cx + sx * s,
      cy + sy * s,
      sr * s
    );
    scorchGrad.addColorStop(0, "rgba(30,20,10,0.25)");
    scorchGrad.addColorStop(0.6, "rgba(50,35,15,0.1)");
    scorchGrad.addColorStop(1, "transparent");
    ctx.fillStyle = scorchGrad;
    fillIsoEllipse(ctx, cx + sx * s, cy + sy * s, sr * s, sr * 0.55 * s);
  }

  // Foundation platform (square iso footprint)
  drawIsometricPrism(
    ctx,
    cx,
    foundBaseY,
    foundSize,
    foundSize,
    foundH,
    stoneTop,
    stoneLeft,
    stoneRight
  );
  drawStoneRows(ctx, cx, foundBaseY, fI, fD, foundH, 4, 0.12);
  drawEdgeHighlights(ctx, cx, foundBaseY, fI, fD, foundH, stoneHi);

  // Earthwork berm (square iso footprint)
  drawIsometricPrism(
    ctx,
    cx,
    bermBaseY,
    bermSize,
    bermSize,
    bermH,
    bermTop,
    bermLeft,
    bermRight
  );
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 0.35 * s;
  for (let r = 1; r < 5; r++) {
    const ry = bermBaseY - bermH * (r / 5);
    ctx.beginPath();
    ctx.moveTo(cx - bI, ry + bD);
    ctx.lineTo(cx, ry + bD * 2);
    ctx.lineTo(cx + bI, ry + bD);
    ctx.stroke();
  }
  drawEdgeHighlights(ctx, cx, bermBaseY, bI, bD, bermH, bermEdge);

  // Battlements (merlons) along the berm top edges
  const bermTopBackY = bermBaseY - bermH;
  const merlH = 3.5 * s;
  const merlW = 2.8 * s;
  for (let i = 0; i < 4; i++) {
    const mt = (i + 0.5) / 4;
    drawIsometricPrism(
      ctx,
      cx - bI * (1 - mt),
      bermTopBackY + bD + bD * mt,
      merlW,
      merlW,
      merlH,
      bermEdge,
      bermTop,
      bermRight
    );
  }
  for (let i = 0; i < 4; i++) {
    const mt = (i + 0.5) / 4;
    drawIsometricPrism(
      ctx,
      cx + bI * mt,
      bermTopBackY + bD * 2 - bD * mt,
      merlW,
      merlW,
      merlH,
      bermEdge,
      bermTop,
      bermRight
    );
  }

  // Sandbag perimeter — iso ellipse centered on berm surface
  for (let ring = 0; ring < 2; ring++) {
    const bagRadius = (26 - ring * 3) * s;
    const bagRadiusY = bagRadius * ISO_Y_RATIO;
    const bagCount = ring === 0 ? 14 : 10;
    for (let bag = 0; bag < bagCount; bag++) {
      const ang = Math.PI * 0.6 + (bag / bagCount) * Math.PI * 0.8;
      const pos = getIsoOrbitPoint(cx, cy + 2 * s, ang, bagRadius, bagRadiusY);
      const bagShade =
        bag % 3 === 0 ? "#9e8a5e" : bag % 3 === 1 ? "#887450" : "#78663e";
      ctx.fillStyle = bagShade;
      fillIsoEllipse(
        ctx,
        pos.x,
        pos.y + ring * 2 * s,
        3.5 * s,
        2 * s,
        ang * 0.15
      );
      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 0.3 * s;
      ctx.beginPath();
      ctx.moveTo(pos.x - 1.5 * s, pos.y + ring * 2 * s);
      ctx.lineTo(pos.x + 1.5 * s, pos.y + ring * 2 * s);
      ctx.stroke();
    }
  }

  // Three cannons — on berm surface
  drawDetailedCannon(ctx, cx - 14 * s, cy + 3 * s, s, "left", t);
  drawDetailedCannon(ctx, cx, cy - 1 * s, s, "center", t);
  drawDetailedCannon(ctx, cx + 14 * s, cy + 3 * s, s, "right", t);

  // Watchtower (rear command post) — on berm surface, back-left
  const wtX = cx - 16 * s;
  const wtY = cy + 2 * s;
  const wtW = 5.5 * s;
  const wtH = 18 * s;
  drawIsometricPrism(
    ctx,
    wtX,
    wtY,
    wtW,
    wtW,
    wtH,
    stoneTop,
    stoneLeft,
    stoneRight
  );
  const wtI = wtW * ISO_COS;
  const wtD = wtW * ISO_SIN;
  drawStoneRows(ctx, wtX, wtY, wtI, wtD, wtH, 5, 0.1);
  drawEdgeHighlights(ctx, wtX, wtY, wtI, wtD, wtH, stoneHi);
  drawIsometricPrism(
    ctx,
    wtX,
    wtY - wtH,
    wtW + 1.5 * s,
    wtW + 1.5 * s,
    2 * s,
    stoneHi,
    stoneTop,
    stoneRight
  );
  drawIsometricPyramid(
    ctx,
    wtX,
    wtY - wtH - 2 * s,
    4.5 * s,
    8 * s,
    "#5a3e28",
    "#2e1c10",
    "#3e2a18"
  );

  // Watchtower window glow
  setShadowBlur(ctx, 4 * s, "#ffaa44");
  ctx.fillStyle = `rgba(255,170,60,${0.3 + Math.sin(t * 2.8) * 0.12})`;
  traceIsoFlushRect(
    ctx,
    wtX - wtI * 0.4,
    wtY - wtH * 0.4 + wtD * 0.5,
    1.4,
    3.5,
    "left",
    s
  );
  ctx.fill();
  clearShadow(ctx);

  // Ammunition crate — on berm surface, front-right
  const crateX = cx + 10 * s;
  const crateY = cy + 6 * s;
  drawIsometricPrism(
    ctx,
    crateX,
    crateY,
    5.5 * s,
    4.5 * s,
    4.5 * s,
    "#5a4227",
    "#3c2817",
    "#4a331d"
  );
  const crateI = 5.5 * s * ISO_COS;
  const crateD = 4.5 * s * ISO_SIN;
  const crateTopY = crateY - 4.5 * s;
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.35 * s;
  ctx.beginPath();
  ctx.moveTo(crateX - crateI, crateTopY + crateD);
  ctx.lineTo(crateX, crateTopY + crateD * 2);
  ctx.lineTo(crateX + crateI, crateTopY + crateD);
  ctx.stroke();
  ctx.strokeStyle = "#3a2515";
  ctx.lineWidth = 0.6 * s;
  ctx.beginPath();
  ctx.moveTo(crateX - crateI * 0.8, crateTopY + crateD * 1.6);
  ctx.lineTo(crateX + crateI * 0.8, crateTopY + crateD * 0.4);
  ctx.stroke();

  // Powder kegs — on berm surface
  for (const [kx, ky] of [
    [-8, 5],
    [-5, 6.5],
  ] as const) {
    const kegX = cx + kx * s;
    const kegY = cy + ky * s;
    ctx.fillStyle = "#3e2818";
    fillIsoEllipse(ctx, kegX, kegY + 1 * s, 2.8 * s, 1.5 * s);
    ctx.fillStyle = "#5a3e24";
    fillIsoEllipse(ctx, kegX, kegY - 0.5 * s, 2.4 * s, 1.3 * s);
    ctx.fillStyle = "#4a3420";
    fillIsoEllipse(ctx, kegX, kegY + 0.2 * s, 2.6 * s, 1.4 * s);
    ctx.strokeStyle = "#2a1a0e";
    ctx.lineWidth = 0.4 * s;
    strokeIsoEllipse(ctx, kegX, kegY - 0.5 * s, 2.4 * s, 1.3 * s);
    ctx.strokeStyle = "#6a4e32";
    ctx.lineWidth = 0.5 * s;
    for (const bandOff of [-0.8, 0.8]) {
      strokeIsoEllipse(ctx, kegX, kegY + bandOff * s, 2.5 * s, 1.35 * s);
    }
  }

  // Cannonball pyramid stack — on berm surface
  for (let row = 0; row < 3; row++) {
    const count = 3 - row;
    for (let col = 0; col < count; col++) {
      const bx = cx - 10 * s + col * 2.6 * s + row * 1.3 * s;
      const by = cy + 6 * s + col * 0.4 * s - row * 1.8 * s;
      ctx.fillStyle = "#1a1a1a";
      fillIsoEllipse(ctx, bx, by, 1.4 * s, 1.1 * s);
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      fillIsoEllipse(ctx, bx - 0.3 * s, by - 0.4 * s, 0.45 * s, 0.35 * s);
    }
  }

  // Ember glow near crate
  setShadowBlur(ctx, 5 * s, "#ff6633");
  ctx.fillStyle = "rgba(255,100,20,0.2)";
  fillIsoEllipse(ctx, crateX, crateY - 4 * s, 3.5 * s, 2 * s);
  clearShadow(ctx);

  // Command flag pole — on berm surface, right side
  const flagX = cx + 20 * s;
  const flagY = cy + 2 * s;
  drawIsometricPrism(
    ctx,
    flagX,
    flagY + 4 * s,
    1.6 * s,
    1.6 * s,
    26 * s,
    "#5b4330",
    "#3a2818",
    "#4a3420"
  );
  const wave = Math.sin(t * 3.2 + 0.02 * flagX) * 2 * s;
  ctx.fillStyle = "#c84b36";
  ctx.beginPath();
  ctx.moveTo(flagX + 1 * s, flagY - 21 * s);
  ctx.quadraticCurveTo(
    flagX + 9 * s,
    flagY - 19 * s + wave,
    flagX + 13 * s,
    flagY - 14 * s + wave
  );
  ctx.lineTo(flagX + 1 * s, flagY - 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a83828";
  ctx.beginPath();
  ctx.moveTo(flagX + 1 * s, flagY - 20 * s);
  ctx.quadraticCurveTo(
    flagX + 7 * s,
    flagY - 18 * s + wave * 0.8,
    flagX + 10 * s,
    flagY - 14 * s + wave * 0.9
  );
  ctx.lineTo(flagX + 1 * s, flagY - 11 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#f0cb56";
  fillIsoEllipse(
    ctx,
    flagX + 6 * s,
    flagY - 15.5 * s + wave * 0.35,
    1.8 * s,
    1.2 * s
  );
  ctx.fillStyle = "#d4a840";
  fillIsoEllipse(
    ctx,
    flagX + 6 * s,
    flagY - 15.5 * s + wave * 0.35,
    1 * s,
    0.7 * s
  );

  // Gunpowder smoke rising from berm surface
  for (let p = 0; p < 8; p++) {
    const phase = (t * 0.3 + p * 0.14) % 1;
    const px = cx + Math.sin(t * 1.2 + p * 1.7) * 22 * s;
    const py = cy - 8 * s - phase * 28 * s;
    const alpha = (1 - phase) * 0.1;
    ctx.fillStyle = `rgba(140,120,90,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(
      px,
      py,
      (3 + phase * 4) * s,
      (1.5 + phase * 2) * s,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Ivy Crossroads
// ---------------------------------------------------------------------------

function drawIvyCrossroadsLandmark(
  params: ChallengeLandmarkRenderParams
): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const sTop = "#a09a88";
  const sLeft = "#5e5a4e";
  const sRight = "#787264";
  const sHi = "#b8b2a0";
  const sEdge = "#c8c0ae";
  const sDark = "#4a463e";
  const ivyDark = "#1e5518";
  const ivyMid = "#2a7a22";
  const ivyBright = "#44a838";
  const mossColor = "rgba(80,130,55,0.35)";

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 4 * s,
      s,
      30 * s,
      14 * s,
      48 * s,
      0.32,
      "0,0,0",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Ground blend
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 6 * s,
    0,
    cx,
    cy + 6 * s,
    26 * s
  );
  gGrad.addColorStop(0, "rgba(80,110,55,0.25)");
  gGrad.addColorStop(0.5, "rgba(95,75,50,0.12)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 6 * s, 26 * s, 13 * s, 33.2, 0.12, 22);
  ctx.fill();

  // Cobblestone path hints radiating from center
  ctx.fillStyle = "rgba(130,120,100,0.18)";
  for (const [pathAng, pathLen] of [
    [0.3, 28],
    [Math.PI * 0.55, 24],
    [Math.PI * 1.15, 26],
    [Math.PI * 1.7, 22],
  ] as const) {
    for (let stone = 0; stone < 8; stone++) {
      const dist = 6 + (stone * (pathLen - 6)) / 8;
      const sx =
        cx + Math.cos(pathAng) * dist * s + Math.sin(stone * 3.7) * 1.5 * s;
      const sy = cy + 4 * s + Math.sin(pathAng) * dist * s * ISO_Y_RATIO;
      const stoneSize = (1.5 + Math.sin(stone * 2.1) * 0.5) * s;
      ctx.fillStyle =
        stone % 3 === 0
          ? "rgba(140,130,110,0.2)"
          : stone % 3 === 1
            ? "rgba(120,115,95,0.18)"
            : "rgba(150,140,120,0.15)";
      fillIsoEllipse(ctx, sx, sy, stoneSize, stoneSize * 0.6, stone * 0.4);
    }
  }

  // Pillar bases (wider footing)
  const pillarW = 5.5 * s;
  const pillarH = 24 * s;
  const leftPX = cx - 12 * s;
  const leftPY = cy + 3 * s;
  const rightPX = cx + 12 * s;
  const rightPY = cy - 1 * s;

  // Left pillar footing
  drawIsometricPrism(
    ctx,
    leftPX,
    leftPY + 1 * s,
    pillarW + 2 * s,
    pillarW + 2 * s,
    2 * s,
    sDark,
    sLeft,
    sRight
  );
  drawIsometricPrism(
    ctx,
    leftPX,
    leftPY,
    pillarW,
    pillarW,
    pillarH,
    sTop,
    sLeft,
    sRight
  );
  const pI = pillarW * ISO_COS;
  const pD = pillarW * ISO_SIN;
  drawStoneRows(ctx, leftPX, leftPY, pI, pD, pillarH, 7, 0.1);
  drawEdgeHighlights(ctx, leftPX, leftPY, pI, pD, pillarH, sEdge);

  // Right pillar footing
  drawIsometricPrism(
    ctx,
    rightPX,
    rightPY + 1 * s,
    pillarW + 2 * s,
    pillarW + 2 * s,
    2 * s,
    sDark,
    sLeft,
    sRight
  );
  drawIsometricPrism(
    ctx,
    rightPX,
    rightPY,
    pillarW,
    pillarW,
    pillarH,
    sTop,
    sLeft,
    sRight
  );
  drawStoneRows(ctx, rightPX, rightPY, pI, pD, pillarH, 7, 0.1);
  drawEdgeHighlights(ctx, rightPX, rightPY, pI, pD, pillarH, sEdge);

  // Pillar capitals (ornate tops)
  drawIsometricPrism(
    ctx,
    leftPX,
    leftPY - pillarH,
    pillarW + 2 * s,
    pillarW + 2 * s,
    2.5 * s,
    sHi,
    sTop,
    sRight
  );
  drawIsometricPrism(
    ctx,
    rightPX,
    rightPY - pillarH,
    pillarW + 2 * s,
    pillarW + 2 * s,
    2.5 * s,
    sHi,
    sTop,
    sRight
  );
  // Decorative carved band on capitals
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.4 * s;
  for (const px of [leftPX, rightPX]) {
    const capI = (pillarW + 2 * s) * ISO_COS;
    const capY =
      px === leftPX ? leftPY - pillarH - 1 * s : rightPY - pillarH - 1 * s;
    ctx.beginPath();
    ctx.moveTo(px - capI, capY + pD + 0.5 * s);
    ctx.lineTo(px, capY + pD * 2 + 0.5 * s);
    ctx.lineTo(px + capI, capY + pD + 0.5 * s);
    ctx.stroke();
  }

  // Moss at pillar bases
  ctx.fillStyle = mossColor;
  fillIsoEllipse(ctx, leftPX, leftPY + 2 * s, 6 * s, 3 * s);
  fillIsoEllipse(ctx, rightPX, rightPY + 2 * s, 6 * s, 3 * s);
  ctx.fillStyle = "rgba(60,110,40,0.25)";
  fillIsoEllipse(ctx, leftPX + 2 * s, leftPY + 1 * s, 3 * s, 1.5 * s);
  fillIsoEllipse(ctx, rightPX - 2 * s, rightPY + 1 * s, 3 * s, 1.5 * s);

  // Arch with keystone detail
  const archBlocks = [
    { d: 3.2, w: 4.2, x: -9, y: -17 },
    { d: 3, w: 4, x: -5, y: -20.5 },
    { d: 3.5, w: 4.5, x: 0, y: -22.5 },
    { d: 3, w: 4, x: 5, y: -20.4 },
    { d: 3.2, w: 4.2, x: 9, y: -16.9 },
  ];
  for (let i = 0; i < archBlocks.length; i++) {
    const block = archBlocks[i];
    const shade = i === 2 ? sEdge : i % 2 === 0 ? sTop : sHi;
    const shadeL = i === 2 ? sTop : i % 2 === 0 ? sLeft : "#686258";
    const shadeR = i === 2 ? sHi : i % 2 === 0 ? sRight : "#7a7468";
    const blockH = i === 2 ? 4.5 * s : 3.5 * s;
    drawIsometricPrism(
      ctx,
      cx + block.x * s,
      cy + block.y * s,
      block.w * s,
      block.d * s,
      blockH,
      shade,
      shadeL,
      shadeR
    );
  }
  // Keystone carving mark
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(cx - 1.5 * s, cy - 24 * s);
  ctx.lineTo(cx, cy - 25 * s);
  ctx.lineTo(cx + 1.5 * s, cy - 24 * s);
  ctx.stroke();

  // Horizontal lintel beam
  drawIsometricPrism(
    ctx,
    cx,
    cy - 15 * s,
    16 * s,
    6 * s,
    3.5 * s,
    sHi,
    sLeft,
    sRight
  );
  drawStoneRows(
    ctx,
    cx,
    cy - 15 * s,
    16 * s * ISO_COS,
    6 * s * ISO_SIN,
    3.5 * s,
    2,
    0.08
  );

  // Main vines with branching
  const vines: {
    sx: number;
    sy: number;
    ex: number;
    ey: number;
    thick: number;
    branches: number;
  }[] = [
    { branches: 3, ex: -12, ey: 1, sx: -11, sy: -19, thick: 1.4 },
    { branches: 2, ex: -7, ey: 3, sx: -9, sy: -17, thick: 1 },
    { branches: 3, ex: 11, ey: -2, sx: 10, sy: -16, thick: 1.3 },
    { branches: 2, ex: 6, ey: 1, sx: 8, sy: -18, thick: 0.95 },
    { branches: 1, ex: -6, ey: -12, sx: -3, sy: -21, thick: 0.8 },
    { branches: 1, ex: 6, ey: -12, sx: 3, sy: -21, thick: 0.8 },
    { branches: 2, ex: -9, ey: -6, sx: -5, sy: -22, thick: 0.7 },
    { branches: 2, ex: 9, ey: -6, sx: 5, sy: -22, thick: 0.7 },
  ];
  for (let v = 0; v < vines.length; v++) {
    const vine = vines[v];
    const sway = Math.sin(t * 1.5 + v * 1.2) * 1.5 * s;
    ctx.strokeStyle = v % 2 === 0 ? ivyDark : ivyMid;
    ctx.lineWidth = vine.thick * s;
    const midX = cx + (vine.sx + vine.ex) * 0.5 * s + sway;
    const midY = cy + (vine.sy + vine.ey) * 0.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx + vine.sx * s, cy + vine.sy * s);
    ctx.quadraticCurveTo(
      midX,
      midY,
      cx + vine.ex * s + sway * 0.5,
      cy + vine.ey * s
    );
    ctx.stroke();

    for (let b = 0; b < vine.branches; b++) {
      const bt = 0.3 + b * 0.25;
      const bx = cx + vine.sx * s + (vine.ex - vine.sx) * bt * s + sway * bt;
      const by = cy + vine.sy * s + (vine.ey - vine.sy) * bt * s;
      const bDir = b % 2 === 0 ? -1 : 1;
      ctx.strokeStyle = ivyMid;
      ctx.lineWidth = vine.thick * 0.5 * s;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(
        bx + bDir * 3 * s,
        by + 2 * s,
        bx + bDir * 5 * s + sway * 0.3,
        by + 4 * s
      );
      ctx.stroke();
    }
  }

  // Dense ivy leaf clusters on arch
  for (let leaf = 0; leaf < 36; leaf++) {
    const ang = Math.PI * 0.65 + (leaf / 36) * Math.PI * 0.7;
    const radius = 7 + (leaf % 4) * 2.5;
    const lx = cx + Math.cos(ang) * radius * s + Math.sin(leaf * 1.7) * 3 * s;
    const ly = cy - 15 * s + Math.sin(ang) * radius * s * ISO_Y_RATIO;
    const sway = Math.sin(t * 2 + leaf * 0.8) * 0.8 * s;
    const colors = [ivyDark, ivyMid, ivyBright, "#358a2a"];
    ctx.fillStyle = colors[leaf % 4];
    const leafSize = (1.8 + Math.sin(leaf * 1.3) * 0.6) * s;
    fillIsoEllipse(ctx, lx + sway, ly, leafSize, leafSize * 0.55, ang + 0.3);
  }

  // Pillar ivy with climbing pattern
  for (let leaf = 0; leaf < 16; leaf++) {
    const pillar = leaf < 8 ? leftPX : rightPX;
    const pillarY2 = leaf < 8 ? leftPY : rightPY;
    const idx = leaf % 8;
    const ly = pillarY2 - pillarH * (0.15 + idx * 0.1);
    const side = idx % 2 === 0 ? -1 : 1;
    const sway = Math.sin(t * 1.8 + leaf) * 0.6 * s;
    ctx.fillStyle =
      leaf % 4 === 0
        ? ivyBright
        : leaf % 4 === 1
          ? ivyMid
          : leaf % 4 === 2
            ? "#358a2a"
            : ivyDark;
    fillIsoEllipse(
      ctx,
      pillar + side * 4.8 * s + sway,
      ly,
      2.2 * s,
      1.1 * s,
      0.4 * side
    );
  }

  // Flowers with petal detail
  for (let flower = 0; flower < 6; flower++) {
    const fx = cx + Math.sin(flower * 2.3) * 9 * s;
    const fy = cy - 17 * s + Math.cos(flower * 1.7) * 5 * s;
    const fSway = Math.sin(t * 1.5 + flower * 0.9) * 0.5 * s;
    const flowerColors = [
      "rgba(220,180,220,0.7)",
      "rgba(255,220,140,0.65)",
      "rgba(200,160,210,0.6)",
    ];
    ctx.fillStyle = flowerColors[flower % 3];
    for (let petal = 0; petal < 4; petal++) {
      const pAng = (petal / 4) * Math.PI * 2 + flower * 0.8;
      fillIsoEllipse(
        ctx,
        fx + fSway + Math.cos(pAng) * 0.8 * s,
        fy + Math.sin(pAng) * 0.5 * s,
        1.2 * s,
        0.7 * s,
        pAng
      );
    }
    ctx.fillStyle = "rgba(255,240,100,0.8)";
    fillIsoEllipse(ctx, fx + fSway, fy, 0.5 * s, 0.35 * s);
  }

  // Hanging lanterns from the arch
  for (const [lx, ly] of [
    [-4, -18],
    [4, -18],
  ] as const) {
    const lanternX = cx + lx * s;
    const lanternY = cy + ly * s;
    const lanSway = Math.sin(t * 1.2 + lx) * 0.8 * s;
    ctx.strokeStyle = "#3a3228";
    ctx.lineWidth = 0.3 * s;
    ctx.beginPath();
    ctx.moveTo(lanternX, lanternY - 3 * s);
    ctx.lineTo(lanternX + lanSway, lanternY);
    ctx.stroke();
    ctx.fillStyle = "#4a3e2e";
    ctx.fillRect(lanternX + lanSway - 1 * s, lanternY, 2 * s, 3 * s);
    setShadowBlur(ctx, 6 * s, "#ddcc66");
    ctx.fillStyle = `rgba(255,230,120,${0.35 + Math.sin(t * 3.5 + lx) * 0.12})`;
    fillIsoEllipse(
      ctx,
      lanternX + lanSway,
      lanternY + 1.5 * s,
      1.2 * s,
      1.5 * s
    );
    clearShadow(ctx);
  }

  // Direction signpost with more detail
  const signX = cx + 18 * s;
  const signY = cy + 2 * s;
  ctx.fillStyle = "#5b432e";
  ctx.fillRect(signX - 1 * s, signY - 11 * s, 2 * s, 14 * s);
  ctx.fillStyle = "#4a3520";
  ctx.fillRect(signX - 0.5 * s, signY - 11 * s, 1 * s, 14 * s);

  drawIsometricPrism(
    ctx,
    signX + 2.5 * s,
    signY - 6 * s,
    6.5 * s,
    2.5 * s,
    2 * s,
    "#8a7050",
    "#5c4a32",
    "#6e5840"
  );
  drawIsometricPrism(
    ctx,
    signX + 2 * s,
    signY - 1.5 * s,
    6 * s,
    2.2 * s,
    1.8 * s,
    "#907558",
    "#604e36",
    "#72593e"
  );
  drawIsometricPrism(
    ctx,
    signX + 1.5 * s,
    signY - 9 * s,
    5.5 * s,
    2 * s,
    1.5 * s,
    "#7e6548",
    "#52402c",
    "#64503a"
  );

  // Arrow carvings on sign boards
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 0.4 * s;
  for (const [ay, dir] of [
    [-6, 1],
    [-1.5, -1],
    [-9, 1],
  ] as const) {
    const arrowY = signY + ay * s;
    ctx.beginPath();
    ctx.moveTo(signX + (1 + dir) * s, arrowY);
    ctx.lineTo(signX + (3.5 + dir * 1.5) * s, arrowY);
    ctx.lineTo(signX + (3 + dir * 1.5) * s, arrowY - 0.5 * s);
    ctx.stroke();
  }

  // Atmospheric green glow
  setShadowBlur(ctx, 5 * s, "#bbdd77");
  ctx.fillStyle = "rgba(180,220,100,0.12)";
  fillIsoEllipse(ctx, cx, cy - 12 * s, 16 * s, 7 * s);
  clearShadow(ctx);

  // Floating pollen/spore particles
  for (let sp = 0; sp < 8; sp++) {
    const phase = (t * 0.25 + sp * 0.14) % 1;
    const spX = cx + Math.sin(t * 0.8 + sp * 2.1) * 16 * s;
    const spY = cy - 8 * s - phase * 20 * s;
    const alpha = Math.sin(phase * Math.PI) * 0.2;
    ctx.fillStyle = `rgba(200,230,120,${alpha})`;
    ctx.beginPath();
    ctx.arc(spX, spY, (0.8 + Math.sin(sp * 1.5) * 0.3) * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Blight Basin
// ---------------------------------------------------------------------------

function drawBlightBasinLandmark(params: ChallengeLandmarkRenderParams): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const toxicCore = "#64f53c";
  const barkDark = "#2d2018";
  const barkMid = "#3d2e1e";
  const mushroomGlow = "#78dc37";
  const boneWhite = "#cfbfab";
  const boneDark = "#b8a896";
  const altarStone = "#3a3530";

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 4 * s,
      s,
      36 * s,
      16 * s,
      35 * s,
      0.32,
      "15,30,10",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Ground corruption spread
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 2 * s,
    0,
    cx,
    cy + 2 * s,
    34 * s
  );
  gGrad.addColorStop(0, "rgba(40,80,20,0.38)");
  gGrad.addColorStop(0.35, "rgba(30,60,15,0.22)");
  gGrad.addColorStop(0.7, "rgba(20,40,10,0.1)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 2 * s, 34 * s, 17 * s, 24.5, 0.18, 22);
  ctx.fill();

  // Corrupted earth patches
  for (const [px, py, pr] of [
    [-8, 7, 6],
    [10, 6, 5],
    [-18, 4, 4],
  ] as const) {
    ctx.fillStyle = "rgba(25,35,15,0.3)";
    drawOrganicBlobAt(
      ctx,
      cx + px * s,
      cy + py * s,
      pr * s,
      pr * 0.5 * s,
      80 + px,
      0.2,
      10
    );
    ctx.fill();
  }

  // Toxic pools with more depth
  const poolLayout: [number, number, number][] = [
    [-14, 0, 10],
    [-2, -4, 12],
    [10, -1, 9],
    [17, -3, 7],
    [3, 6, 8],
  ];
  for (let idx = 0; idx < poolLayout.length; idx++) {
    const [ox, oy, radius] = poolLayout[idx];
    const px = cx + ox * s;
    const py = cy + oy * s;

    const pGrad = ctx.createRadialGradient(px, py, 0, px, py, radius * s);
    const pulse = 0.36 + Math.sin(t * 2 + idx * 1.3) * 0.12;
    pGrad.addColorStop(0, `rgba(100,245,60,${pulse})`);
    pGrad.addColorStop(0.25, `rgba(80,200,40,${pulse * 0.7})`);
    pGrad.addColorStop(0.5, `rgba(50,140,25,0.18)`);
    pGrad.addColorStop(0.75, `rgba(35,100,18,0.08)`);
    pGrad.addColorStop(1, "transparent");
    ctx.fillStyle = pGrad;
    drawOrganicBlobAt(
      ctx,
      px,
      py,
      radius * s,
      radius * s * ISO_Y_RATIO * 1.05,
      40 + idx,
      0.22,
      16
    );
    ctx.fill();

    // Pool depth (darker center)
    ctx.fillStyle = "rgba(15,40,8,0.5)";
    drawOrganicBlobAt(
      ctx,
      px,
      py,
      radius * 0.6 * s,
      radius * 0.3 * s,
      55 + idx,
      0.15,
      12
    );
    ctx.fill();

    // Surface sheen
    ctx.fillStyle = `rgba(140,255,100,${0.08 + Math.sin(t * 0.8 + idx * 2) * 0.04})`;
    drawOrganicBlobAt(
      ctx,
      px + 1 * s,
      py - 0.5 * s,
      radius * 0.4 * s,
      radius * 0.2 * s,
      62 + idx,
      0.1,
      10
    );
    ctx.fill();

    // Pool rim glow
    setShadowBlur(ctx, 6 * s, toxicCore);
    ctx.strokeStyle = `rgba(170,255,120,${0.22 + Math.sin(t * 1.5 + idx) * 0.1})`;
    ctx.lineWidth = 0.8 * s;
    strokeIsoEllipse(ctx, px, py, radius * 0.55 * s, radius * 0.28 * s);
    clearShadow(ctx);

    // Bubbles with pop effect
    for (let bubble = 0; bubble < 4; bubble++) {
      const phase = (t * 1.6 + idx * 0.7 + bubble * 0.45) % 2.5;
      if (phase < 1.5) {
        const alpha = Math.max(0, 0.4 - phase * 0.25);
        const bSize = (0.9 + bubble * 0.35) * s;
        setShadowBlur(ctx, 3 * s, toxicCore);
        ctx.fillStyle = `rgba(120,255,90,${alpha})`;
        fillIsoEllipse(
          ctx,
          px + Math.sin(t * 2.7 + idx + bubble) * 2.5 * s,
          py - phase * 5 * s,
          bSize
        );
        ctx.fillStyle = `rgba(200,255,180,${alpha * 0.4})`;
        fillIsoEllipse(
          ctx,
          px + Math.sin(t * 2.7 + idx + bubble) * 2.5 * s - 0.2 * s,
          py - phase * 5 * s - 0.3 * s,
          bSize * 0.3
        );
        clearShadow(ctx);
      }
    }

    // Twisted roots emerging from pools
    if (idx < 3) {
      ctx.strokeStyle = "rgba(60,40,20,0.55)";
      ctx.lineWidth = 1.2 * s;
      for (let root = 0; root < 3; root++) {
        const rAng = (root / 3) * Math.PI + idx * 1.5;
        const rLen = (radius * 0.8 + root * 2) * s;
        const rSway = Math.sin(t * 0.8 + root + idx) * 1 * s;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.quadraticCurveTo(
          px + Math.cos(rAng) * rLen * 0.5 + rSway,
          py + Math.sin(rAng) * rLen * 0.3 - 2 * s,
          px + Math.cos(rAng) * rLen,
          py + Math.sin(rAng) * rLen * ISO_Y_RATIO - 1 * s
        );
        ctx.stroke();
        ctx.fillStyle = "rgba(45,80,25,0.4)";
        fillIsoEllipse(
          ctx,
          px + Math.cos(rAng) * rLen,
          py + Math.sin(rAng) * rLen * ISO_Y_RATIO - 1 * s,
          1.5 * s,
          0.8 * s,
          rAng
        );
      }
    }
  }

  // Dead trees with hanging moss and knotholes
  const trees: [number, number, number, number][] = [
    [-22, -3, 1.15, 1.2],
    [1, -6, 1.05, 2.1],
    [22, -2, 0.95, 3.4],
    [-9, -8, 0.75, 4.5],
  ];
  for (const [tx, ty, treeScale, seed] of trees) {
    const treeCx = cx + tx * s;
    const treeCy = cy + ty * s;
    const lean = Math.sin(seed) * 0.18;
    const trunkH = (18 + Math.sin(seed * 1.7) * 4) * s * treeScale;

    ctx.save();
    ctx.translate(treeCx, treeCy);
    ctx.rotate(lean);

    // Trunk with gradient
    const trunkGrad = ctx.createLinearGradient(0, 4 * s, 0, -trunkH);
    trunkGrad.addColorStop(0, barkMid);
    trunkGrad.addColorStop(0.5, barkDark);
    trunkGrad.addColorStop(1, "#1e1510");
    ctx.strokeStyle = trunkGrad;
    ctx.lineWidth = 2 * s * treeScale;
    ctx.beginPath();
    ctx.moveTo(0, 4 * s);
    ctx.quadraticCurveTo(0.5 * s, -trunkH * 0.3, 0.8 * s, -trunkH);
    ctx.stroke();

    // Bark texture lines
    ctx.strokeStyle = barkDark;
    ctx.lineWidth = 0.3 * s;
    for (let mark = 0; mark < 5; mark++) {
      const my = -trunkH * (0.15 + mark * 0.16);
      ctx.beginPath();
      ctx.moveTo(-0.7 * s * treeScale, my);
      ctx.lineTo(0.7 * s * treeScale, my - 0.5 * s);
      ctx.stroke();
    }

    // Knothole
    ctx.fillStyle = "#1a1008";
    fillIsoEllipse(
      ctx,
      0.3 * s,
      -trunkH * 0.45,
      1.2 * s * treeScale,
      0.8 * s * treeScale
    );
    ctx.fillStyle = "rgba(100,200,50,0.2)";
    fillIsoEllipse(
      ctx,
      0.3 * s,
      -trunkH * 0.45,
      0.8 * s * treeScale,
      0.5 * s * treeScale
    );

    // Branches (gnarled, twisted)
    ctx.lineWidth = 0.9 * s * treeScale;
    for (let branch = 0; branch < 5; branch++) {
      const by = -trunkH * (0.25 + branch * 0.15);
      const bDir = branch % 2 === 0 ? -1 : 1;
      const bLen = (4.5 + branch * 0.9) * s * treeScale;
      ctx.strokeStyle = barkDark;
      ctx.beginPath();
      ctx.moveTo(0, by);
      ctx.bezierCurveTo(
        bDir * bLen * 0.3,
        by - 1 * s,
        bDir * bLen * 0.7,
        by - 3 * s,
        bDir * bLen,
        by - 4 * s
      );
      ctx.stroke();
    }

    ctx.restore();

    // Hanging moss strands
    ctx.strokeStyle = "rgba(55,100,35,0.35)";
    ctx.lineWidth = 0.5 * s;
    for (let moss = 0; moss < 4; moss++) {
      const mSway = Math.sin(t * 1.2 + seed + moss * 0.8) * 1.5 * s;
      const mStart = treeCx + (moss - 1.5) * 2.5 * s;
      const mY = treeCy - trunkH * (0.4 + moss * 0.1);
      ctx.beginPath();
      ctx.moveTo(mStart, mY);
      ctx.quadraticCurveTo(
        mStart + mSway,
        mY + 4 * s,
        mStart + mSway * 1.3,
        mY + 7 * s
      );
      ctx.stroke();
    }
  }

  // Corrupted altar (central feature)
  const altarX = cx + 2 * s;
  const altarY = cy - 1 * s;
  drawIsometricPrism(
    ctx,
    altarX,
    altarY + 2 * s,
    7 * s,
    7 * s,
    3 * s,
    "#3e3830",
    "#252220",
    "#302c28"
  );
  drawIsometricPrism(
    ctx,
    altarX,
    altarY,
    5 * s,
    5 * s,
    5 * s,
    altarStone,
    "#252220",
    "#302c28"
  );
  const aI = 5 * s * ISO_COS;
  const aD = 5 * s * ISO_SIN;
  drawStoneRows(ctx, altarX, altarY, aI, aD, 5 * s, 3, 0.12);

  // Altar toxic glow on top
  setShadowBlur(ctx, 8 * s, toxicCore);
  ctx.fillStyle = `rgba(100,245,60,${0.3 + Math.sin(t * 2.5) * 0.12})`;
  fillIsoEllipse(ctx, altarX, altarY - 5 * s + aD, 3 * s, 1.5 * s);
  clearShadow(ctx);

  // Skull on altar
  ctx.fillStyle = boneWhite;
  fillIsoEllipse(ctx, altarX, altarY - 6.5 * s, 2.2 * s, 2.6 * s);
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.ellipse(altarX, altarY - 5.5 * s, 1.8 * s, 1 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#0e0e0e";
  fillIsoEllipse(ctx, altarX - 0.7 * s, altarY - 6.8 * s, 0.5 * s, 0.6 * s);
  fillIsoEllipse(ctx, altarX + 0.7 * s, altarY - 6.8 * s, 0.5 * s, 0.6 * s);
  ctx.fillStyle = "#1a1210";
  fillIsoEllipse(ctx, altarX, altarY - 6 * s, 0.3 * s, 0.2 * s);
  // Skull toxic glow from eyes
  setShadowBlur(ctx, 3 * s, toxicCore);
  ctx.fillStyle = `rgba(100,245,60,${0.4 + Math.sin(t * 3) * 0.15})`;
  fillIsoEllipse(ctx, altarX - 0.7 * s, altarY - 6.8 * s, 0.35 * s, 0.4 * s);
  fillIsoEllipse(ctx, altarX + 0.7 * s, altarY - 6.8 * s, 0.35 * s, 0.4 * s);
  clearShadow(ctx);

  // Enhanced mushroom clusters with bioluminescent veins
  const mushroomClusters: [number, number, number, number][] = [
    [-20, 3, 0.8, 0],
    [-16, 5, 0.65, 1],
    [-12, 3.5, 0.9, 2],
    [14, 5, 0.75, 3],
    [18, 3, 0.85, 4],
    [22, 4.5, 0.6, 5],
    [-5, 8, 0.7, 6],
    [8, 8, 0.8, 7],
    [0, 10, 0.55, 8],
    [4, 9, 0.65, 9],
  ];
  for (const [mx, my, mScale, mSeed] of mushroomClusters) {
    const mX = cx + mx * s;
    const mY = cy + my * s;
    const ms = mScale * s;

    // Stem with slight curve
    const stemLean = Math.sin(mSeed * 2.1) * 0.5 * ms;
    ctx.fillStyle = "#6c5a46";
    ctx.beginPath();
    ctx.moveTo(mX - 0.7 * ms, mY + 3.5 * ms);
    ctx.quadraticCurveTo(mX + stemLean * 0.5, mY + 1.5 * ms, mX + stemLean, mY);
    ctx.quadraticCurveTo(
      mX + stemLean + 0.7 * ms,
      mY + 1.5 * ms,
      mX + 0.7 * ms,
      mY + 3.5 * ms
    );
    ctx.closePath();
    ctx.fill();

    // Mushroom cap (layered for depth)
    const capGlow = 0.55 + Math.sin(t * 2.2 + mSeed * 0.8) * 0.18;
    setShadowBlur(ctx, 5 * ms, mushroomGlow);
    ctx.fillStyle = `rgba(90,180,40,${capGlow * 0.7})`;
    fillIsoEllipse(ctx, mX + stemLean, mY - 0.5 * ms, 3.5 * ms, 2.2 * ms);
    ctx.fillStyle = `rgba(120,220,55,${capGlow})`;
    fillIsoEllipse(ctx, mX + stemLean, mY - 0.3 * ms, 3 * ms, 1.8 * ms);
    clearShadow(ctx);

    // Cap underside (gills)
    ctx.fillStyle = `rgba(60,140,30,${capGlow * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(
      mX + stemLean,
      mY + 0.5 * ms,
      2.5 * ms,
      0.8 * ms,
      0,
      0,
      Math.PI
    );
    ctx.fill();

    // Bioluminescent veins on cap
    setShadowBlur(ctx, 2 * ms, toxicCore);
    ctx.strokeStyle = `rgba(180,255,100,${capGlow * 0.5})`;
    ctx.lineWidth = 0.25 * ms;
    for (let vein = 0; vein < 4; vein++) {
      const vAng = -0.6 + vein * 0.4;
      ctx.beginPath();
      ctx.moveTo(mX + stemLean, mY - 0.3 * ms);
      ctx.quadraticCurveTo(
        mX + stemLean + Math.cos(vAng) * 1.5 * ms,
        mY - 0.5 * ms,
        mX + stemLean + Math.cos(vAng) * 2.5 * ms,
        mY + Math.sin(vAng) * 0.8 * ms
      );
      ctx.stroke();
    }
    clearShadow(ctx);

    // Luminous spots
    ctx.fillStyle = `rgba(200,255,100,${capGlow * 0.4})`;
    for (let dot = 0; dot < 4; dot++) {
      const dAng = dot * 1.3 + mSeed;
      fillIsoEllipse(
        ctx,
        mX + stemLean + Math.cos(dAng) * 1.5 * ms,
        mY - 0.2 * ms + Math.sin(dAng) * 0.6 * ms,
        0.4 * ms,
        0.25 * ms
      );
    }
  }

  // Bone piles with more anatomical detail
  const bonePiles: [number, number, number][] = [
    [-24, 6, 0.3],
    [24, 4, -0.2],
    [-6, 10, 0.5],
    [14, 9, -0.4],
  ];
  for (const [bx, by, rot] of bonePiles) {
    const px = cx + bx * s;
    const py = cy + by * s;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);
    // Long bone
    ctx.fillStyle = boneWhite;
    ctx.fillRect(-2.5 * s, -0.35 * s, 5 * s, 0.7 * s);
    ctx.fillStyle = boneDark;
    fillIsoEllipse(ctx, -2.8 * s, 0, 0.6 * s, 0.5 * s);
    fillIsoEllipse(ctx, 2.8 * s, 0, 0.6 * s, 0.5 * s);
    // Cross bone
    ctx.fillStyle = boneWhite;
    ctx.fillRect(-1.5 * s, -1.8 * s, 0.5 * s, 3.6 * s);
    // Rib fragments
    ctx.strokeStyle = boneDark;
    ctx.lineWidth = 0.4 * s;
    ctx.beginPath();
    ctx.arc(1 * s, -0.5 * s, 1.5 * s, -0.5, 1.2);
    ctx.stroke();
    ctx.restore();
  }

  // Detailed skull on the ground
  const skullX = cx - 16 * s;
  const skullY = cy + 8 * s;
  ctx.fillStyle = boneWhite;
  fillIsoEllipse(ctx, skullX, skullY - 1 * s, 2 * s, 2.4 * s);
  ctx.fillStyle = boneDark;
  ctx.beginPath();
  ctx.ellipse(skullX, skullY, 1.6 * s, 0.9 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#1a1210";
  fillIsoEllipse(ctx, skullX - 0.6 * s, skullY - 1.3 * s, 0.4 * s, 0.5 * s);
  fillIsoEllipse(ctx, skullX + 0.6 * s, skullY - 1.3 * s, 0.4 * s, 0.5 * s);
  ctx.fillStyle = "#1a1210";
  fillIsoEllipse(ctx, skullX, skullY - 0.6 * s, 0.25 * s, 0.15 * s);

  // Toxic mist (layered, thicker)
  for (let mist = 0; mist < 8; mist++) {
    const phase = (t * 0.12 + mist * 0.14) % 1;
    const mx2 = cx - 26 * s + mist * 7.5 * s + Math.sin(t * 0.6 + mist) * 6 * s;
    const my2 = cy - 3 * s + Math.cos(t * 0.4 + mist) * 2.5 * s;
    const alpha = 0.07 + Math.sin(t * 0.8 + mist) * 0.03;
    ctx.fillStyle = `rgba(100,220,60,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(mx2, my2 - phase * 10 * s, 12 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating toxic spores
  for (let spore = 0; spore < 10; spore++) {
    const phase = (t * 0.3 + spore * 0.11) % 1;
    const spX = cx + Math.sin(t * 0.9 + spore * 2.3) * 22 * s;
    const spY = cy - 4 * s - phase * 20 * s;
    const alpha = Math.sin(phase * Math.PI) * 0.35;
    setShadowBlur(ctx, 2 * s, mushroomGlow);
    ctx.fillStyle = `rgba(120,240,60,${alpha})`;
    ctx.beginPath();
    ctx.arc(spX, spY, (0.6 + Math.sin(spore * 1.5) * 0.2) * s, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }
}

// ---------------------------------------------------------------------------
// Triad Keep
// ---------------------------------------------------------------------------

function drawTriadKeepLandmark(params: ChallengeLandmarkRenderParams): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const wTop = "#556b56";
  const wLeft = "#29382c";
  const wRight = "#3b4c3e";
  const wHi = "#6a8268";
  const wEdge = "#7a9278";
  const wDark = "#1e2a20";
  const roofDark = "#283328";
  const roofMid = "#1a231b";
  const roofLight = "#384637";
  const torchGlow = "#ff9944";
  const mossColor = "rgba(60,90,40,0.25)";

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 2 * s,
      s,
      38 * s,
      18 * s,
      60 * s,
      0.4,
      "10,25,15",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Ground blend
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 6 * s,
    0,
    cx,
    cy + 6 * s,
    30 * s
  );
  gGrad.addColorStop(0, "rgba(25,55,35,0.3)");
  gGrad.addColorStop(0.5, "rgba(30,50,30,0.14)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 6 * s, 30 * s, 15 * s, 42.1, 0.12, 22);
  ctx.fill();

  // Moat suggestion ring (iso ellipses)
  ctx.strokeStyle = "rgba(36,75,58,0.22)";
  ctx.lineWidth = 2 * s;
  strokeIsoEllipse(ctx, cx, cy + 7 * s, 28 * s);
  ctx.strokeStyle = "rgba(20,50,35,0.12)";
  ctx.lineWidth = 4 * s;
  strokeIsoEllipse(ctx, cx, cy + 7 * s, 30 * s);

  // Foundation platform (square iso footprint for proper 2:1 diamond)
  const fSize = 30 * s;
  drawIsometricPrism(
    ctx,
    cx,
    cy - 8 * s,
    fSize,
    fSize,
    9 * s,
    wTop,
    wLeft,
    wRight
  );
  const fI = fSize * ISO_COS;
  const fD = fSize * ISO_SIN;
  drawStoneRows(ctx, cx, cy + 4 * s, fI, fD, 9 * s, 5, 0.1);
  drawEdgeHighlights(ctx, cx, cy + 4 * s, fI, fD, 9 * s, wEdge);

  // Moss weathering on lower foundation
  ctx.fillStyle = mossColor;
  for (const [mx, my] of [
    [-18, 8],
    [-8, 10],
    [6, 11],
    [16, 9],
  ] as const) {
    fillIsoEllipse(ctx, cx + mx * s, cy + my * s, 4 * s, 2 * s);
  }

  // Main keep tower
  const keepW = 14 * s;
  const keepH = 32 * s;
  const keepBase = cy - 18 * s;
  drawIsometricPrism(
    ctx,
    cx,
    keepBase,
    keepW,
    keepW,
    keepH,
    wTop,
    wLeft,
    wRight
  );
  const kI = keepW * ISO_COS;
  const kD = keepW * ISO_SIN;
  const kTop = keepBase - keepH;
  drawStoneRows(ctx, cx, keepBase, kI, kD, keepH, 8, 0.12);
  drawEdgeHighlights(ctx, cx, keepBase, kI, kD, keepH, wEdge);

  // Keep parapet with battlements
  drawIsometricPrism(
    ctx,
    cx,
    kTop,
    keepW + 3 * s,
    keepW + 3 * s,
    3.5 * s,
    wHi,
    wTop,
    wRight
  );
  const parI = (keepW + 3 * s) * ISO_COS;
  const parD = (keepW + 3 * s) * ISO_SIN;
  const parTop2 = kTop - 3.5 * s;
  const merlH2 = 4.5 * s;
  const merlW2 = 2.8 * s;
  for (let i = 0; i < 4; i++) {
    const mt = (i + 0.5) / 4;
    const mmx = cx - parI * (1 - mt);
    const mmy = parTop2 + parD + parD * mt;
    drawIsometricPrism(ctx, mmx, mmy, merlW2, merlW2, merlH2, wEdge, wHi, wTop);
  }
  for (let i = 0; i < 4; i++) {
    const mt = (i + 0.5) / 4;
    const mmx = cx + parI * mt;
    const mmy = parTop2 + parD * 2 - parD * mt;
    drawIsometricPrism(ctx, mmx, mmy, merlW2, merlW2, merlH2, wEdge, wHi, wTop);
  }

  // Keep windows with warm glow
  setShadowBlur(ctx, 7 * s, torchGlow);
  ctx.fillStyle = `rgba(255,150,50,${0.32 + Math.sin(t * 2.5) * 0.15})`;
  const winY1 = keepBase - keepH * 0.32;
  traceIsoFlushRect(
    ctx,
    cx - kI * 0.5,
    winY1 + kD * 0.5 + 3 * s,
    2.4,
    7,
    "left",
    s
  );
  ctx.fill();
  traceIsoFlushRect(
    ctx,
    cx + kI * 0.4,
    winY1 + kD * 0.5 + 1.5 * s,
    2.2,
    7,
    "right",
    s
  );
  ctx.fill();
  const winY2 = keepBase - keepH * 0.55;
  traceIsoFlushRect(
    ctx,
    cx - kI * 0.4,
    winY2 + kD * 0.5 + 2.5 * s,
    2,
    5.5,
    "left",
    s
  );
  ctx.fill();
  traceIsoFlushRect(
    ctx,
    cx + kI * 0.45,
    winY2 + kD * 0.5 + 1 * s,
    2,
    5.5,
    "right",
    s
  );
  ctx.fill();
  const winY3 = keepBase - keepH * 0.75;
  traceIsoFlushRect(
    ctx,
    cx - kI * 0.35,
    winY3 + kD * 0.5 + 2 * s,
    1.6,
    4,
    "left",
    s
  );
  ctx.fill();
  traceIsoFlushRect(
    ctx,
    cx + kI * 0.4,
    winY3 + kD * 0.5 + 0.5 * s,
    1.6,
    4,
    "right",
    s
  );
  ctx.fill();
  clearShadow(ctx);

  // Banner/tapestry on keep front face
  const bannerX = cx;
  const bannerY = keepBase - keepH * 0.5 + kD;
  const bannerSway = Math.sin(t * 2 + 0.5) * 0.8 * s;
  ctx.fillStyle = "#3f8b43";
  ctx.beginPath();
  ctx.moveTo(bannerX - 3 * s, bannerY);
  ctx.lineTo(bannerX + 3 * s, bannerY);
  ctx.lineTo(bannerX + 3 * s + bannerSway * 0.5, bannerY + 10 * s);
  ctx.lineTo(bannerX + bannerSway, bannerY + 13 * s);
  ctx.lineTo(bannerX - 3 * s + bannerSway * 0.5, bannerY + 10 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2d6630";
  ctx.beginPath();
  ctx.moveTo(bannerX - 2 * s, bannerY + 1 * s);
  ctx.lineTo(bannerX + 2 * s, bannerY + 1 * s);
  ctx.lineTo(bannerX + 2 * s + bannerSway * 0.4, bannerY + 9 * s);
  ctx.lineTo(bannerX + bannerSway * 0.8, bannerY + 11.5 * s);
  ctx.lineTo(bannerX - 2 * s + bannerSway * 0.4, bannerY + 9 * s);
  ctx.closePath();
  ctx.fill();
  // Banner emblem
  ctx.fillStyle = "#95d46c";
  fillIsoEllipse(
    ctx,
    bannerX + bannerSway * 0.3,
    bannerY + 6 * s,
    1.5 * s,
    1.2 * s
  );

  // Flanking turrets
  const turretOffsets: { x: number; y: number; side: number }[] = [
    { side: -1, x: -20 * s, y: -7 * s },
    { side: 1, x: 20 * s, y: -3 * s },
  ];
  for (let ti = 0; ti < turretOffsets.length; ti++) {
    const turret = turretOffsets[ti];
    const ttx = cx + turret.x;
    const tty = cy + turret.y;
    const tW = 8 * s;
    const tH = 18 * s;

    drawIsometricPrism(ctx, ttx, tty, tW, tW, tH, wTop, wLeft, wRight);
    const tI = tW * ISO_COS;
    const tD2 = tW * ISO_SIN;
    drawStoneRows(ctx, ttx, tty, tI, tD2, tH, 5, 0.1);
    drawEdgeHighlights(ctx, ttx, tty, tI, tD2, tH, wEdge);

    // Turret parapet
    drawIsometricPrism(
      ctx,
      ttx,
      tty - tH,
      tW + 2 * s,
      tW + 2 * s,
      2.5 * s,
      wHi,
      wTop,
      wRight
    );

    // Turret roof
    drawIsometricPyramid(
      ctx,
      ttx,
      tty - tH - 2.5 * s,
      5.5 * s,
      12 * s,
      roofLight,
      roofDark,
      roofMid
    );

    // Turret window
    setShadowBlur(ctx, 5 * s, torchGlow);
    ctx.fillStyle = `rgba(255,150,50,${0.38 + Math.sin(t * 2.2 + ti) * 0.15})`;
    const tFace = ti === 0 ? ("left" as const) : ("right" as const);
    traceIsoFlushRect(ctx, ttx, tty - tH * 0.35 + tD2 * 0.5, 1.8, 5, tFace, s);
    ctx.fill();
    traceIsoFlushRect(
      ctx,
      ttx,
      tty - tH * 0.65 + tD2 * 0.5,
      1.4,
      3.5,
      tFace,
      s
    );
    ctx.fill();
    clearShadow(ctx);

    // Turret flag (isometric pole)
    const flagX2 = ttx;
    const flagY2 = tty - tH - 2.5 * s;
    drawIsometricPrism(
      ctx,
      flagX2,
      flagY2,
      1.2 * s,
      1.2 * s,
      16 * s,
      "#5a4530",
      "#4a3520",
      "#4e3a28"
    );
    const wave2 = Math.sin(t * 3 + ti * 2) * 2 * s;
    ctx.fillStyle = "#3f8b43";
    ctx.beginPath();
    ctx.moveTo(flagX2 + 0.8 * s, flagY2 - 15 * s);
    ctx.quadraticCurveTo(
      flagX2 + 6 * s,
      flagY2 - 13 * s + wave2,
      flagX2 + 9 * s,
      flagY2 - 9 * s + wave2
    );
    ctx.lineTo(flagX2 + 0.8 * s, flagY2 - 6 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#95d46c";
    fillIsoEllipse(
      ctx,
      flagX2 + 4.5 * s,
      flagY2 - 11 * s + wave2 * 0.35,
      1.2 * s,
      0.8 * s
    );
  }

  // Curtain walls connecting turrets to keep
  for (let ti = 0; ti < turretOffsets.length; ti++) {
    const turret = turretOffsets[ti];
    const ttx = cx + turret.x;
    const tty = cy + turret.y;
    const cwX = cx + turret.x * 0.5;
    const cwY = cy + turret.y * 0.5 + 2 * s;
    const cwW = 5 * s;
    const cwH = 14 * s;
    drawIsometricPrism(ctx, cwX, cwY, cwW, cwW, cwH, wTop, wLeft, wRight);
    const cwI = cwW * ISO_COS;
    const cwD = cwW * ISO_SIN;
    drawStoneRows(ctx, cwX, cwY, cwI, cwD, cwH, 4, 0.1);
    drawIsometricPrism(
      ctx,
      cwX,
      cwY - cwH,
      cwW + 1.5 * s,
      cwW + 1.5 * s,
      2 * s,
      wHi,
      wTop,
      wRight
    );

    // Arrow slits on curtain walls
    const slitFace = ti === 0 ? ("left" as const) : ("right" as const);
    ctx.fillStyle = wDark;
    traceIsoFlushRect(
      ctx,
      cwX,
      cwY - cwH * 0.4 + cwD * 0.5,
      0.6,
      3.5,
      slitFace,
      s
    );
    ctx.fill();
    traceIsoFlushRect(
      ctx,
      cwX,
      cwY - cwH * 0.7 + cwD * 0.5,
      0.6,
      3,
      slitFace,
      s
    );
    ctx.fill();

    // Mini merlons on curtain wall
    for (let m = 0; m < 2; m++) {
      const mt = (m + 0.5) / 2;
      const mx = cwX + (ti === 0 ? -cwI * (1 - mt) : cwI * mt);
      const my =
        cwY - cwH - 2 * s + cwD + (ti === 0 ? cwD * mt : cwD * (1 - mt));
      drawIsometricPrism(ctx, mx, my, 2 * s, 2 * s, 3 * s, wEdge, wHi, wTop);
    }
  }

  // Gate
  const gateY = cy + 4 * s + fD * 0.35;
  ctx.fillStyle = wDark;
  ctx.beginPath();
  ctx.moveTo(cx - 5.5 * s, gateY + 4 * s);
  ctx.lineTo(cx - 5.5 * s, gateY - 9 * s);
  ctx.quadraticCurveTo(cx, gateY - 14 * s, cx + 5.5 * s, gateY - 9 * s);
  ctx.lineTo(cx + 5.5 * s, gateY + 4 * s);
  ctx.closePath();
  ctx.fill();

  // Portcullis bars
  ctx.strokeStyle = "#2a322d";
  ctx.lineWidth = 0.8 * s;
  for (let bar = 0; bar < 5; bar++) {
    const barX = cx - 3.8 * s + bar * 1.9 * s;
    ctx.beginPath();
    ctx.moveTo(barX, gateY + 4 * s);
    ctx.lineTo(barX, gateY - 8 * s);
    ctx.stroke();
  }
  for (let hBar = 0; hBar < 3; hBar++) {
    const hy = gateY - 1 * s - hBar * 3.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 5 * s, hy);
    ctx.lineTo(cx + 5 * s, hy);
    ctx.stroke();
  }
  // Portcullis edge highlights
  ctx.strokeStyle = wEdge;
  ctx.lineWidth = 0.4 * s;
  for (let bar = 0; bar < 5; bar++) {
    const barX = cx - 3.8 * s + bar * 1.9 * s + 0.4 * s;
    ctx.beginPath();
    ctx.moveTo(barX, gateY + 4 * s);
    ctx.lineTo(barX, gateY - 8 * s);
    ctx.stroke();
  }

  // Gate torches with multi-layer flame
  setShadowBlur(ctx, 10 * s, torchGlow);
  const torchPulse = 0.55 + Math.sin(t * 5.5) * 0.2;
  for (const side of [-1, 1]) {
    const tox = cx + side * 7.5 * s;
    const toy = gateY - 5 * s;
    ctx.fillStyle = "#5b4330";
    ctx.fillRect(tox - 0.6 * s, toy - 3.5 * s, 1.2 * s, 6 * s);
    // Outer flame
    ctx.fillStyle = `rgba(255,120,20,${torchPulse * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(tox - 1.5 * s, toy - 3.5 * s);
    ctx.quadraticCurveTo(
      tox + Math.sin(t * 8 + side) * 1 * s,
      toy - 7 * s,
      tox,
      toy - 10 * s
    );
    ctx.quadraticCurveTo(
      tox - Math.sin(t * 7 + side) * 1 * s,
      toy - 6.5 * s,
      tox + 1.5 * s,
      toy - 3.5 * s
    );
    ctx.closePath();
    ctx.fill();
    // Inner flame (brighter core)
    ctx.fillStyle = `rgba(255,200,80,${torchPulse * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(tox - 0.8 * s, toy - 4 * s);
    ctx.quadraticCurveTo(
      tox + Math.sin(t * 10 + side) * 0.5 * s,
      toy - 6.5 * s,
      tox,
      toy - 8.5 * s
    );
    ctx.quadraticCurveTo(
      tox - Math.sin(t * 9 + side) * 0.5 * s,
      toy - 6 * s,
      tox + 0.8 * s,
      toy - 4 * s
    );
    ctx.closePath();
    ctx.fill();
    // Flame tip
    ctx.fillStyle = `rgba(255,240,180,${torchPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(
      tox + Math.sin(t * 12 + side) * 0.3 * s,
      toy - 9 * s,
      0.8 * s,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Stone step before gate
  drawIsometricPrism(
    ctx,
    cx,
    gateY + 3 * s,
    8 * s,
    8 * s,
    3 * s,
    "#5a4128",
    "#3a2817",
    "#49311d"
  );

  // Rubble and debris
  const rubble: { x: number; y: number; sz: number }[] = [
    { x: -26, y: 10 },
    { x: -18, y: 12 },
    { x: 20, y: 11 },
    { x: 26, y: 9 },
    { x: -22, y: 8 },
    { x: 23, y: 7 },
  ].map((r) => ({ ...r, sz: 2 + Math.sin(r.x) * 0.6 }));
  for (let ri = 0; ri < rubble.length; ri++) {
    const rb = rubble[ri];
    const rx = cx + rb.x * s;
    const ry = cy + rb.y * s;
    const rSz = rb.sz * s;
    ctx.fillStyle = ri % 3 === 0 ? wTop : ri % 3 === 1 ? wLeft : wRight;
    ctx.beginPath();
    ctx.moveTo(rx, ry - rSz * 0.7);
    ctx.lineTo(rx + rSz, ry - rSz * 0.2);
    ctx.lineTo(rx + rSz * 0.3, ry + rSz * 0.3);
    ctx.lineTo(rx - rSz * 0.6, ry);
    ctx.closePath();
    ctx.fill();
  }

  // Moss on lower keep walls
  ctx.fillStyle = mossColor;
  fillIsoEllipse(
    ctx,
    cx - kI * 0.6,
    keepBase + kD * 0.5 - 2 * s,
    3 * s,
    1.5 * s
  );
  fillIsoEllipse(ctx, cx + kI * 0.5, keepBase + kD * 0.3, 2.5 * s, 1.2 * s);

  // Chimney smoke
  drawSmoke(ctx, cx, kTop - 6 * s, s, t, 4, 6, 28, "60,55,50", 0.1);
}

// ---------------------------------------------------------------------------
// Sunscorch Labyrinth
// ---------------------------------------------------------------------------

function drawSunscorchLabyrinthLandmark(
  params: ChallengeLandmarkRenderParams
): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const sandTop = "#c4a86a";
  const sandLeft = "#8a6e3e";
  const sandRight = "#a8884e";
  const sandHi = "#d4bc7e";
  const sandEdge = "#dcc690";
  const sandDark = "#6a5430";
  const goldGlow = "#ffcc44";
  const brassColor = "#b8952a";

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 4 * s,
      s,
      38 * s,
      16 * s,
      32 * s,
      0.3,
      "0,0,0",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Ground sand expanse
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 3 * s,
    0,
    cx,
    cy + 3 * s,
    36 * s
  );
  gGrad.addColorStop(0, "rgba(200,170,100,0.25)");
  gGrad.addColorStop(0.4, "rgba(185,148,88,0.12)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 3 * s, 36 * s, 18 * s, 17.3, 0.1, 22);
  ctx.fill();

  // Sand drifts against walls
  const drifts: [number, number, number, number][] = [
    [-20, 5, 8, 3],
    [12, 8, 7, 2.5],
    [-10, 12, 9, 3],
    [18, 2, 6, 2],
    [-16, -5, 5, 2],
    [8, -6, 6, 2.5],
  ];
  for (const [dx, dy, dw, dh] of drifts) {
    ctx.fillStyle = "rgba(210,185,130,0.25)";
    drawOrganicBlobAt(
      ctx,
      cx + dx * s,
      cy + dy * s,
      dw * s,
      dh * s,
      dx * 3.7,
      0.18,
      10
    );
    ctx.fill();
  }

  // Maze walls — tiled square-footprint blocks for correct isometric angles.
  // Each original wall run is split into square prism blocks (BLOCK × BLOCK)
  // so every diamond edge sits at the standard 26.57° iso angle.
  const BLOCK = 2;
  const blkI = BLOCK * s * ISO_COS;
  const blkD = BLOCK * s * ISO_SIN;

  const mazeWalls: {
    x: number;
    y: number;
    w: number;
    d: number;
    h: number;
  }[] = [
    // Outer perimeter (partial)
    { d: 2, h: 4.5, w: 18, x: -20, y: -11 },
    { d: 18, h: 4, w: 2, x: -20, y: -11 },
    { d: 16, h: 4.5, w: 2, x: 10, y: -10 },
    { d: 2, h: 4, w: 18, x: -6, y: 9 },
    // Interior corridors
    { d: 2, h: 3.5, w: 10, x: -14, y: -6 },
    { d: 8, h: 3.5, w: 2, x: -8, y: -6 },
    { d: 2, h: 4, w: 12, x: -4, y: -10 },
    { d: 8, h: 3.5, w: 2, x: 4, y: -4 },
    { d: 2, h: 3, w: 8, x: -14, y: 1 },
    { d: 2, h: 3.5, w: 10, x: -2, y: 4 },
    { d: 8, h: 4, w: 2, x: 14, y: -2 },
    { d: 6, h: 3, w: 2, x: -16, y: 5 },
  ];

  interface WallBlock {
    bx: number;
    by: number;
    h: number;
    wi: number;
    bi: number;
  }
  const wallBlocks: WallBlock[] = [];

  for (let wi = 0; wi < mazeWalls.length; wi++) {
    const wall = mazeWalls[wi];
    const wx = cx + wall.x * s;
    const wy = cy + wall.y * s;
    const isH = wall.w > wall.d;
    const count = Math.max(1, Math.round((isH ? wall.w : wall.d) / BLOCK));

    for (let bi = 0; bi < count; bi++) {
      wallBlocks.push({
        bi,
        bx: isH ? wx + (BLOCK * (1 + 2 * bi) - wall.w) * s * ISO_COS : wx,
        by: isH ? wy : wy + bi * 2 * BLOCK * s * ISO_SIN,
        h: wall.h * s,
        wi,
      });
    }
  }

  wallBlocks.sort((a, b) => a.by - b.by || a.bx - b.bx);

  for (const blk of wallBlocks) {
    const { bx, by, h: bh, wi, bi } = blk;
    const topShade = wi % 3 === 0 ? sandTop : wi % 3 === 1 ? sandHi : sandTop;
    const leftShade = wi % 2 === 0 ? sandLeft : sandDark;
    const rightShade = wi % 2 === 0 ? sandRight : sandLeft;

    drawIsometricPrism(
      ctx,
      bx,
      by,
      BLOCK * s,
      BLOCK * s,
      bh,
      topShade,
      leftShade,
      rightShade
    );

    // Front vertical edge highlight
    ctx.strokeStyle = sandEdge;
    ctx.lineWidth = 0.4 * s;
    ctx.beginPath();
    ctx.moveTo(bx, by + blkD * 2);
    ctx.lineTo(bx, by - bh + blkD * 2);
    ctx.stroke();

    // Sand accumulation at block base (every other block)
    if (bi % 2 === 0) {
      ctx.fillStyle = "rgba(210,180,120,0.12)";
      fillIsoEllipse(ctx, bx, by + blkD * 2 + 0.5 * s, BLOCK * 0.7 * s);
    }

    // Hieroglyph carvings on select blocks
    if ((wi * 7 + bi * 3) % 11 === 0) {
      ctx.strokeStyle = "rgba(90,70,35,0.18)";
      ctx.lineWidth = 0.5 * s;
      const midY = by - bh * 0.5 + blkD;
      ctx.beginPath();
      ctx.moveTo(bx - 0.5 * s, midY);
      ctx.lineTo(bx + 0.3 * s, midY - 1 * s);
      ctx.lineTo(bx + 1.1 * s, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bx + 0.3 * s, midY + 0.3 * s, 0.3 * s, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crumbling top on occasional blocks
    if ((wi + bi) % 9 === 3) {
      ctx.fillStyle = topShade;
      ctx.beginPath();
      ctx.moveTo(bx + blkI * 0.2, by - bh + blkD);
      ctx.lineTo(bx + blkI * 0.4, by - bh + blkD - 0.7 * s);
      ctx.lineTo(bx + blkI * 0.8, by - bh + blkD - 0.3 * s);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Central sun obelisk — proportional to walls
  const obX = cx - 1 * s;
  const obY = cy - 3 * s;
  const obSize = 4 * s;
  const obH = 12 * s;
  drawIsometricPrism(
    ctx,
    obX,
    obY + 2 * s,
    obSize + 1.5 * s,
    obSize + 1.5 * s,
    2.5 * s,
    sandHi,
    sandLeft,
    sandRight
  );
  drawIsometricPrism(
    ctx,
    obX,
    obY,
    obSize,
    obSize,
    obH,
    sandTop,
    sandDark,
    sandLeft
  );
  const obI = obSize * ISO_COS;
  const obD = obSize * ISO_SIN;
  drawStoneRows(ctx, obX, obY, obI, obD, obH, 4, 0.1);
  drawEdgeHighlights(ctx, obX, obY, obI, obD, obH, sandEdge);
  drawIsometricPyramid(
    ctx,
    obX,
    obY - obH,
    3 * s,
    5 * s,
    sandHi,
    sandDark,
    sandLeft
  );

  // Sun disc on obelisk — centered on the shaft
  const sunY = obY - obH * 0.6;
  const sunPulse = 0.5 + Math.sin(t * 1.5) * 0.2;
  setShadowBlur(ctx, 6 * s, goldGlow);
  ctx.fillStyle = `rgba(255,200,60,${0.5 + sunPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(obX, sunY, 2 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255,230,120,${0.3 + sunPulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(obX, sunY, 1.2 * s, 0, Math.PI * 2);
  ctx.fill();
  // Sun rays
  ctx.strokeStyle = `rgba(255,200,60,${0.3 + sunPulse * 0.15})`;
  ctx.lineWidth = 0.5 * s;
  for (let ray = 0; ray < 8; ray++) {
    const rayAng = (ray / 8) * Math.PI * 2 + t * 0.3;
    ctx.beginPath();
    ctx.moveTo(
      obX + Math.cos(rayAng) * 2.5 * s,
      sunY + Math.sin(rayAng) * 2.5 * s
    );
    ctx.lineTo(obX + Math.cos(rayAng) * 4 * s, sunY + Math.sin(rayAng) * 4 * s);
    ctx.stroke();
  }
  clearShadow(ctx);

  // Fire bowls at wall junctions — 3D brass bowls on pedestals
  const fireBowlPositions: [number, number][] = [
    [-18, -4],
    [10, -2],
    [-14, 6],
    [14, 8],
  ];
  for (const [fbx, fby] of fireBowlPositions) {
    const bowlX = cx + fbx * s;
    const bowlY = cy + fby * s;
    // Pedestal
    drawIsometricPrism(
      ctx,
      bowlX,
      bowlY + 1 * s,
      2 * s,
      2 * s,
      2 * s,
      sandHi,
      sandDark,
      sandLeft
    );
    // Brass bowl (layered ellipses)
    ctx.fillStyle = "#7a5a18";
    fillIsoEllipse(ctx, bowlX, bowlY - 0.8 * s, 2.2 * s);
    ctx.fillStyle = brassColor;
    fillIsoEllipse(ctx, bowlX, bowlY - 1.2 * s, 2 * s);
    ctx.fillStyle = "#1a1008";
    fillIsoEllipse(ctx, bowlX, bowlY - 1.5 * s, 1.4 * s);
    // Fire
    const firePulse = 0.5 + Math.sin(t * 5 + fbx) * 0.2;
    setShadowBlur(ctx, 5 * s, "#ff8800");
    ctx.fillStyle = `rgba(255,130,20,${firePulse * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(bowlX - 1 * s, bowlY - 1.5 * s);
    ctx.quadraticCurveTo(
      bowlX + Math.sin(t * 7 + fbx) * 0.6 * s,
      bowlY - 4.5 * s,
      bowlX,
      bowlY - 6 * s
    );
    ctx.quadraticCurveTo(
      bowlX - Math.sin(t * 8 + fbx) * 0.4 * s,
      bowlY - 3.5 * s,
      bowlX + 1 * s,
      bowlY - 1.5 * s
    );
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,200,60,${firePulse * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(bowlX - 0.5 * s, bowlY - 2 * s);
    ctx.quadraticCurveTo(bowlX, bowlY - 3.5 * s, bowlX, bowlY - 5 * s);
    ctx.quadraticCurveTo(bowlX, bowlY - 3 * s, bowlX + 0.5 * s, bowlY - 2 * s);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);
  }

  // Broken columns at labyrinth perimeter
  for (const [colX, colY, colH] of [
    [-22, 2, 6],
    [20, 0, 5],
    [-14, -8, 4],
  ] as const) {
    const cX = cx + colX * s;
    const cY = cy + colY * s;
    const colW = 2.5 * s;
    drawIsometricPrism(
      ctx,
      cX,
      cY,
      colW,
      colW,
      colH * s,
      sandHi,
      sandDark,
      sandLeft
    );
    // Broken top — short isometric stub to suggest fracture
    const cI = colW * ISO_COS;
    const cD = colW * ISO_SIN;
    const cTopY = cY - colH * s;
    ctx.fillStyle = sandTop;
    ctx.beginPath();
    ctx.moveTo(cX - cI, cTopY + cD);
    ctx.lineTo(cX, cTopY);
    ctx.lineTo(cX, cTopY - 0.8 * s);
    ctx.lineTo(cX - cI * 0.5, cTopY + cD * 0.3 - 0.4 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = sandHi;
    ctx.beginPath();
    ctx.moveTo(cX, cTopY);
    ctx.lineTo(cX + cI, cTopY + cD);
    ctx.lineTo(cX + cI * 0.6, cTopY + cD * 0.5 - 0.6 * s);
    ctx.lineTo(cX, cTopY - 0.8 * s);
    ctx.closePath();
    ctx.fill();
    // Fallen rubble
    ctx.fillStyle = sandLeft;
    fillIsoEllipse(ctx, cX + 3 * s, cY + 1 * s, 1.2 * s);
    ctx.fillStyle = sandDark;
    fillIsoEllipse(ctx, cX + 4 * s, cY + 1.8 * s, 0.7 * s);
  }

  // Skull on pole — closer to labyrinth entrance
  const skullX = cx - 22 * s;
  const skullY = cy + 6 * s;
  drawIsometricPrism(
    ctx,
    skullX,
    skullY + 1 * s,
    1 * s,
    1 * s,
    8 * s,
    "#6a5038",
    "#5b4330",
    "#4a3520"
  );
  ctx.fillStyle = "#cfbfab";
  fillIsoEllipse(ctx, skullX, skullY - 7.2 * s, 2 * s, 2.4 * s);
  ctx.fillStyle = "#b8a896";
  ctx.beginPath();
  ctx.ellipse(skullX, skullY - 6.2 * s, 1.8 * s, 1 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#121212";
  fillIsoEllipse(ctx, skullX - 0.6 * s, skullY - 7.5 * s, 0.45 * s, 0.55 * s);
  fillIsoEllipse(ctx, skullX + 0.6 * s, skullY - 7.5 * s, 0.45 * s, 0.55 * s);

  // Scattered bones
  const bones: [number, number, number][] = [
    [-18, 10, 0.3],
    [16, 11, -0.2],
    [-8, 12, 0.5],
    [20, 7, -0.4],
  ];
  for (const [bx, by, rot] of bones) {
    ctx.save();
    ctx.translate(cx + bx * s, cy + by * s);
    ctx.rotate(rot);
    ctx.fillStyle = "#cec0a8";
    ctx.fillRect(-1.8 * s, -0.25 * s, 3.6 * s, 0.5 * s);
    ctx.fillStyle = "#d8ccb4";
    fillIsoEllipse(ctx, -2 * s, 0, 0.4 * s, 0.35 * s);
    fillIsoEllipse(ctx, 2 * s, 0, 0.4 * s, 0.35 * s);
    ctx.restore();
  }

  // Heat shimmer overlay
  setShadowBlur(ctx, 8 * s, goldGlow);
  const shimmer = 0.03 + Math.sin(t * 1.8) * 0.015;
  ctx.fillStyle = `rgba(245,200,100,${shimmer})`;
  fillIsoEllipse(ctx, cx, cy - 2 * s + Math.sin(t * 0.5) * 1.5 * s, 28 * s);
  clearShadow(ctx);

  // Dust and sand particles
  for (let p = 0; p < 6; p++) {
    const phase = (t * 0.18 + p * 0.17) % 1;
    const px = cx + Math.sin(t + p * 2.1) * 22 * s;
    const py = cy - 4 * s - phase * 14 * s;
    const alpha = (1 - phase) * 0.06;
    ctx.fillStyle = `rgba(200,170,100,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(
      px,
      py,
      (2.5 + phase * 3) * s,
      (1.2 + phase * 1.5) * s,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Frist Outpost
// ---------------------------------------------------------------------------

function drawFrontierOutpostLandmark(
  params: ChallengeLandmarkRenderParams
): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const woodDark = "#3b2918";
  const woodMid = "#5a3e24";
  const woodLight = "#6e5035";
  const woodHi = "#84623e";
  const stoneDark = "#363230";
  const stoneMid = "#4a4642";
  const stoneLight = "#5e5a55";
  const stoneHi = "#706c66";
  const roofColor = "#2e1d13";
  const snowColor = "rgba(235,242,250,0.55)";
  const fireGlow = "#ff8c24";
  const iceColor = "rgba(200,225,255,0.4)";

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 4 * s,
      s,
      36 * s,
      16 * s,
      55 * s,
      0.35,
      "0,0,0",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Snowy ground
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 6 * s,
    0,
    cx,
    cy + 6 * s,
    28 * s
  );
  gGrad.addColorStop(0, "rgba(220,230,240,0.18)");
  gGrad.addColorStop(0.5, "rgba(200,210,220,0.08)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 6 * s, 28 * s, 14 * s, 55.3, 0.1, 22);
  ctx.fill();

  // Snow patches on ground
  for (const [sx, sy, sr] of [
    [-10, 10, 6],
    [8, 8, 5],
    [-4, 12, 4],
    [14, 11, 3.5],
  ] as const) {
    ctx.fillStyle = "rgba(230,238,248,0.12)";
    fillIsoEllipse(ctx, cx + sx * s, cy + sy * s, sr * s, sr * 0.5 * s);
  }

  // Palisade ring
  const palisadePosts = 18;
  const ringX = 24 * s;
  const ringY = ringX * ISO_Y_RATIO * 0.85;
  const gateAngle = Math.PI * 0.45;
  const gateWidth = 0.18;

  // Horizontal cross-beams
  ctx.strokeStyle = woodDark;
  ctx.lineWidth = 0.9 * s;
  for (const beamFactor of [0.35, 0.65]) {
    ctx.beginPath();
    let started = false;
    for (let post = 0; post <= palisadePosts; post++) {
      const angle = (post / palisadePosts) * Math.PI * 2;
      const angleDiff = Math.abs(angle - gateAngle);
      if (angleDiff < gateWidth) {
        started = false;
        continue;
      }
      const pos = getIsoOrbitPoint(cx, cy + 1.5 * s, angle, ringX, ringY);
      const postHeight = (11 + Math.sin(post * 1.3) * 2.5) * s;
      const beamY = pos.y - postHeight * beamFactor;
      if (!started) {
        ctx.moveTo(pos.x, beamY);
        started = true;
      } else {
        ctx.lineTo(pos.x, beamY);
      }
    }
    ctx.stroke();
  }

  // Palisade posts
  for (let post = 0; post < palisadePosts; post++) {
    const angle = (post / palisadePosts) * Math.PI * 2;
    const angleDiff = Math.abs(angle - gateAngle);
    if (angleDiff < gateWidth) {
      continue;
    }
    const pos = getIsoOrbitPoint(cx, cy + 1.5 * s, angle, ringX, ringY);
    const postHeight = (11 + Math.sin(post * 1.3) * 2.5) * s;
    const postW = 2.4 * s;

    const woodShade =
      post % 3 === 0 ? woodDark : post % 3 === 1 ? woodMid : woodLight;

    const pGrad = ctx.createLinearGradient(
      pos.x - postW * 0.5,
      0,
      pos.x + postW * 0.5,
      0
    );
    pGrad.addColorStop(0, woodShade);
    pGrad.addColorStop(0.4, woodHi);
    pGrad.addColorStop(1, woodDark);
    ctx.fillStyle = pGrad;
    ctx.fillRect(pos.x - postW * 0.5, pos.y - postHeight, postW, postHeight);

    // Wood grain
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 0.2 * s;
    for (let grain = 0; grain < 3; grain++) {
      const gx = pos.x - postW * 0.3 + grain * postW * 0.3;
      ctx.beginPath();
      ctx.moveTo(gx, pos.y);
      ctx.lineTo(gx + 0.2 * s, pos.y - postHeight);
      ctx.stroke();
    }

    // Sharpened tip
    ctx.fillStyle = woodHi;
    ctx.beginPath();
    ctx.moveTo(pos.x - 1.6 * s, pos.y - postHeight);
    ctx.lineTo(pos.x, pos.y - postHeight - 3.5 * s);
    ctx.lineTo(pos.x + 1.6 * s, pos.y - postHeight);
    ctx.closePath();
    ctx.fill();

    // Snow on tip
    ctx.fillStyle = snowColor;
    ctx.beginPath();
    ctx.moveTo(pos.x - 1.8 * s, pos.y - postHeight - 0.5 * s);
    ctx.quadraticCurveTo(
      pos.x,
      pos.y - postHeight - 4 * s,
      pos.x + 1.8 * s,
      pos.y - postHeight - 0.5 * s
    );
    ctx.lineTo(pos.x + 1.2 * s, pos.y - postHeight);
    ctx.quadraticCurveTo(
      pos.x,
      pos.y - postHeight - 2.5 * s,
      pos.x - 1.2 * s,
      pos.y - postHeight
    );
    ctx.closePath();
    ctx.fill();

    // Icicles hanging from cross-beams (every 3rd post)
    if (post % 3 === 0) {
      ctx.fillStyle = iceColor;
      for (let ic = 0; ic < 2; ic++) {
        const icX = pos.x + (ic - 0.5) * 1.2 * s;
        const icY = pos.y - postHeight * 0.35;
        const icLen = (2 + Math.sin(post + ic) * 1) * s;
        ctx.beginPath();
        ctx.moveTo(icX - 0.4 * s, icY);
        ctx.lineTo(icX, icY + icLen);
        ctx.lineTo(icX + 0.4 * s, icY);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // Gate opening with crossbeam
  const gatePos1 = getIsoOrbitPoint(
    cx,
    cy + 1.5 * s,
    gateAngle - gateWidth,
    ringX,
    ringY
  );
  const gatePos2 = getIsoOrbitPoint(
    cx,
    cy + 1.5 * s,
    gateAngle + gateWidth,
    ringX,
    ringY
  );
  ctx.strokeStyle = woodMid;
  ctx.lineWidth = 1.5 * s;
  ctx.beginPath();
  ctx.moveTo(gatePos1.x, gatePos1.y - 10 * s);
  ctx.lineTo(gatePos2.x, gatePos2.y - 10 * s);
  ctx.stroke();
  ctx.strokeStyle = woodDark;
  ctx.lineWidth = 0.5 * s;
  ctx.beginPath();
  ctx.moveTo(gatePos1.x, gatePos1.y - 10.5 * s);
  ctx.lineTo(gatePos2.x, gatePos2.y - 10.5 * s);
  ctx.stroke();

  // Watchtower
  const towerW = 7 * s;
  const towerH = 28 * s;
  const towerBase = cy - 3 * s;
  drawIsometricPrism(
    ctx,
    cx,
    towerBase,
    towerW,
    towerW,
    towerH,
    stoneLight,
    stoneDark,
    stoneMid
  );
  const ttI = towerW * ISO_COS;
  const ttD = towerW * ISO_SIN;
  const ttTop = towerBase - towerH;
  drawStoneRows(ctx, cx, towerBase, ttI, ttD, towerH, 7, 0.12);
  drawEdgeHighlights(ctx, cx, towerBase, ttI, ttD, towerH, stoneHi);

  // Observation platform
  drawIsometricPrism(
    ctx,
    cx,
    ttTop,
    13 * s,
    13 * s,
    3.5 * s,
    woodLight,
    woodDark,
    woodMid
  );

  // Roof
  drawIsometricPyramid(
    ctx,
    cx,
    ttTop - 3.5 * s,
    9 * s,
    13 * s,
    roofColor,
    "#100a06",
    "#1c120c"
  );

  // Snow on roof
  ctx.fillStyle = snowColor;
  ctx.beginPath();
  ctx.moveTo(cx - 7.5 * s, ttTop - 3.5 * s);
  ctx.quadraticCurveTo(cx, ttTop - 16 * s, cx + 7.5 * s, ttTop - 3.5 * s);
  ctx.lineTo(cx + 5.5 * s, ttTop - 4.5 * s);
  ctx.quadraticCurveTo(cx, ttTop - 14 * s, cx - 5.5 * s, ttTop - 4.5 * s);
  ctx.closePath();
  ctx.fill();

  // Icicles from observation platform
  ctx.fillStyle = iceColor;
  for (let ic = 0; ic < 5; ic++) {
    const icX = cx - 5 * s + ic * 2.5 * s;
    const icY = ttTop + 3.5 * s;
    const icLen = (2.5 + Math.sin(ic * 2.3) * 1.5) * s;
    ctx.beginPath();
    ctx.moveTo(icX - 0.35 * s, icY);
    ctx.lineTo(icX, icY + icLen);
    ctx.lineTo(icX + 0.35 * s, icY);
    ctx.closePath();
    ctx.fill();
  }

  // Tower windows with warm glow
  setShadowBlur(ctx, 6 * s, fireGlow);
  ctx.fillStyle = `rgba(255,150,50,${0.38 + Math.sin(t * 2.5) * 0.15})`;
  traceIsoFlushRect(
    ctx,
    cx - ttI * 0.5,
    towerBase - towerH * 0.32 + ttD * 0.5,
    2,
    5.5,
    "left",
    s
  );
  ctx.fill();
  traceIsoFlushRect(
    ctx,
    cx + ttI * 0.4,
    towerBase - towerH * 0.32 + ttD * 0.5,
    1.8,
    5.5,
    "right",
    s
  );
  ctx.fill();
  traceIsoFlushRect(
    ctx,
    cx - ttI * 0.4,
    towerBase - towerH * 0.6 + ttD * 0.5,
    1.5,
    4,
    "left",
    s
  );
  ctx.fill();
  clearShadow(ctx);

  // Tent/shelter inside compound
  const tentX = cx - 10 * s;
  const tentY = cy + 2 * s;
  ctx.fillStyle = "#6a5540";
  ctx.beginPath();
  ctx.moveTo(tentX, tentY - 8 * s);
  ctx.lineTo(tentX - 7 * s, tentY);
  ctx.lineTo(tentX - 7 * s, tentY + 2 * s);
  ctx.lineTo(tentX + 7 * s, tentY + 1 * s);
  ctx.lineTo(tentX + 7 * s, tentY - 1 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#5a4530";
  ctx.beginPath();
  ctx.moveTo(tentX, tentY - 8 * s);
  ctx.lineTo(tentX + 7 * s, tentY - 1 * s);
  ctx.lineTo(tentX + 7 * s, tentY + 1 * s);
  ctx.lineTo(tentX, tentY - 6 * s);
  ctx.closePath();
  ctx.fill();
  // Tent pole
  ctx.fillStyle = woodDark;
  ctx.fillRect(tentX - 0.4 * s, tentY - 9 * s, 0.8 * s, 11 * s);
  // Snow on tent
  ctx.fillStyle = snowColor;
  ctx.beginPath();
  ctx.moveTo(tentX - 0.5 * s, tentY - 8 * s);
  ctx.lineTo(tentX - 6 * s, tentY - 0.5 * s);
  ctx.lineTo(tentX - 5 * s, tentY - 1 * s);
  ctx.lineTo(tentX, tentY - 7 * s);
  ctx.closePath();
  ctx.fill();
  // Tent entrance
  ctx.fillStyle = "rgba(30,20,12,0.6)";
  ctx.beginPath();
  ctx.moveTo(tentX + 6.5 * s, tentY - 0.5 * s);
  ctx.lineTo(tentX + 3 * s, tentY - 4 * s);
  ctx.lineTo(tentX + 6.5 * s, tentY + 0.5 * s);
  ctx.closePath();
  ctx.fill();

  // Supply barrels
  for (const [bx, by] of [
    [13, 3],
    [15, 4.5],
    [14, 6],
  ] as const) {
    const barrelX = cx + bx * s;
    const barrelY = cy + by * s;
    ctx.fillStyle = "#4a3520";
    fillIsoEllipse(ctx, barrelX, barrelY + 1.5 * s, 2.2 * s, 1.3 * s);
    ctx.fillStyle = "#5a4228";
    ctx.fillRect(barrelX - 1.8 * s, barrelY - 2 * s, 3.6 * s, 3.5 * s);
    ctx.fillStyle = "#6a5035";
    fillIsoEllipse(ctx, barrelX, barrelY - 2 * s, 1.8 * s, 1 * s);
    ctx.strokeStyle = "#3a2515";
    ctx.lineWidth = 0.5 * s;
    strokeIsoEllipse(ctx, barrelX, barrelY - 0.5 * s, 2 * s, 1.1 * s);
    strokeIsoEllipse(ctx, barrelX, barrelY + 0.8 * s, 2 * s, 1.1 * s);
    // Snow on barrel top
    ctx.fillStyle = snowColor;
    fillIsoEllipse(ctx, barrelX, barrelY - 2.2 * s, 1.5 * s, 0.8 * s);
  }

  // Campfire with enhanced flames
  const fireX = cx + 6 * s;
  const fireY = cy + 0;
  // Fire ring stones
  for (let stone = 0; stone < 8; stone++) {
    const sAngle = (stone / 8) * Math.PI * 2;
    const sPos = getIsoOrbitPoint(
      fireX,
      fireY + 0.5 * s,
      sAngle,
      3 * s,
      1.8 * s
    );
    ctx.fillStyle = stone % 2 === 0 ? "#4f4748" : "#5a5254";
    fillIsoEllipse(ctx, sPos.x, sPos.y, 1.1 * s, 0.75 * s);
  }

  const firePulse = 0.55 + Math.sin(t * 5) * 0.2;
  setShadowBlur(ctx, 16 * s, fireGlow);
  ctx.fillStyle = `rgba(255,140,30,${0.22 + firePulse * 0.15})`;
  fillIsoEllipse(ctx, fireX, fireY - 0.5 * s, 6 * s, 3.5 * s);
  clearShadow(ctx);

  // Outer flame
  ctx.fillStyle = `rgba(255,120,15,${0.55 + firePulse * 0.2})`;
  ctx.beginPath();
  ctx.moveTo(fireX - 2 * s, fireY);
  ctx.quadraticCurveTo(
    fireX + Math.sin(t * 7) * 1.8 * s,
    fireY - 6 * s,
    fireX,
    fireY - 10 * s
  );
  ctx.quadraticCurveTo(
    fireX - Math.sin(t * 8) * 1.5 * s,
    fireY - 5 * s,
    fireX + 2 * s,
    fireY
  );
  ctx.closePath();
  ctx.fill();
  // Mid flame
  ctx.fillStyle = `rgba(255,180,40,${0.45 + firePulse * 0.15})`;
  ctx.beginPath();
  ctx.moveTo(fireX - 1.2 * s, fireY - 1 * s);
  ctx.quadraticCurveTo(
    fireX + Math.sin(t * 9) * 1 * s,
    fireY - 4.5 * s,
    fireX,
    fireY - 7 * s
  );
  ctx.quadraticCurveTo(
    fireX - Math.sin(t * 10) * 0.8 * s,
    fireY - 4 * s,
    fireX + 1.2 * s,
    fireY - 1 * s
  );
  ctx.closePath();
  ctx.fill();
  // Inner flame (bright core)
  ctx.fillStyle = `rgba(255,230,120,${0.3 + firePulse * 0.12})`;
  ctx.beginPath();
  ctx.moveTo(fireX - 0.6 * s, fireY - 1.5 * s);
  ctx.quadraticCurveTo(fireX, fireY - 3 * s, fireX, fireY - 5 * s);
  ctx.quadraticCurveTo(
    fireX,
    fireY - 2.5 * s,
    fireX + 0.6 * s,
    fireY - 1.5 * s
  );
  ctx.closePath();
  ctx.fill();

  // Fire sparks
  for (let spark = 0; spark < 8; spark++) {
    const phase = (t * 3 + spark * 0.4) % 1;
    const sparkX = fireX + Math.sin(spark * 2 + t * 4) * 3.5 * s;
    const sparkY = fireY - 2 * s - phase * 14 * s;
    const sparkAlpha = (1 - phase) * 0.8;
    ctx.fillStyle = `rgba(255,${140 + spark * 12},0,${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, (1 - phase) * 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fur drying rack
  const rackX = cx - 16 * s;
  const rackY = cy + 5 * s;
  ctx.fillStyle = woodMid;
  ctx.fillRect(rackX - 4 * s, rackY - 6 * s, 0.8 * s, 8 * s);
  ctx.fillRect(rackX + 3.2 * s, rackY - 6 * s, 0.8 * s, 8 * s);
  ctx.fillStyle = woodDark;
  ctx.fillRect(rackX - 4.5 * s, rackY - 6 * s, 8.5 * s, 0.8 * s);
  // Fur pelts hanging
  ctx.fillStyle = "#6a5a42";
  ctx.beginPath();
  ctx.moveTo(rackX - 3 * s, rackY - 5.5 * s);
  ctx.quadraticCurveTo(
    rackX - 2 * s,
    rackY - 2 * s,
    rackX - 1 * s,
    rackY - 5.5 * s
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#7a6a50";
  ctx.beginPath();
  ctx.moveTo(rackX + 0.5 * s, rackY - 5.5 * s);
  ctx.quadraticCurveTo(
    rackX + 1.5 * s,
    rackY - 1.5 * s,
    rackX + 2.5 * s,
    rackY - 5.5 * s
  );
  ctx.closePath();
  ctx.fill();

  // Lantern
  const lanternX = cx - 6 * s;
  const lanternY = cy - 5 * s;
  ctx.fillStyle = woodDark;
  ctx.fillRect(lanternX - 0.3 * s, lanternY - 7 * s, 0.6 * s, 5 * s);
  setShadowBlur(ctx, 5 * s, "#ffaa44");
  ctx.fillStyle = `rgba(255,170,50,${0.42 + Math.sin(t * 4) * 0.15})`;
  fillIsoEllipse(ctx, lanternX, lanternY - 2.5 * s, 1.4 * s, 1.7 * s);
  clearShadow(ctx);

  // Chimney smoke
  drawSmoke(ctx, cx, ttTop - 14 * s, s, t, 4, 5, 22, "80,70,65", 0.09);

  // Snowflake particles
  for (let flake = 0; flake < 10; flake++) {
    const phase = (t * 0.15 + flake * 0.11) % 1;
    const fX = cx + Math.sin(t * 0.5 + flake * 2.7) * 22 * s;
    const fY = cy - 15 * s + phase * 35 * s;
    const alpha = Math.sin(phase * Math.PI) * 0.35;
    ctx.fillStyle = `rgba(230,240,255,${alpha})`;
    ctx.beginPath();
    ctx.arc(fX, fY, (0.5 + Math.sin(flake) * 0.3) * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Ashen Spiral
// ---------------------------------------------------------------------------

function drawAshenSpiralLandmark(params: ChallengeLandmarkRenderParams): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const ashDark = "#1a1412";
  const ashMid = "#2d2420";
  const ashLight = "#3e3430";
  const ashHi = "#524840";
  const lavaCore = "#ff5a1f";
  const lavaGlow = "#ff9530";
  const obsidianDark = "#0a0810";
  const obsidianMid = "#14101e";
  const obsidianHi = "#2a2238";

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 4 * s,
      s,
      36 * s,
      16 * s,
      40 * s,
      0.38,
      "20,10,5",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Ground: scorched earth with lava underglow
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 2 * s,
    0,
    cx,
    cy + 2 * s,
    34 * s
  );
  gGrad.addColorStop(0, "rgba(255,90,30,0.2)");
  gGrad.addColorStop(0.25, "rgba(180,60,15,0.12)");
  gGrad.addColorStop(0.5, "rgba(40,20,10,0.2)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 2 * s, 34 * s, 17 * s, 62.1, 0.15, 22);
  ctx.fill();

  // Cracked earth base
  ctx.fillStyle = "rgba(30,20,15,0.45)";
  drawOrganicBlobAt(ctx, cx, cy + 3 * s, 28 * s, 14 * s, 71.3, 0.12, 18);
  ctx.fill();

  // Lava veins in cracked earth
  const spiralPulse = 0.5 + Math.sin(t * 1.2) * 0.15;
  setShadowBlur(ctx, 4 * s, lavaCore);
  ctx.strokeStyle = `rgba(255,80,20,${0.2 * spiralPulse})`;
  ctx.lineWidth = 1.2 * s;
  for (let crack = 0; crack < 8; crack++) {
    const cAng = crack * 0.8 + 0.3;
    const cLen = (12 + crack * 2) * s;
    const cX = cx + Math.cos(cAng) * 4 * s;
    const cY = cy + Math.sin(cAng) * 4 * s * ISO_Y_RATIO;
    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.quadraticCurveTo(
      cX + Math.cos(cAng + 0.3) * cLen * 0.6,
      cY + Math.sin(cAng + 0.3) * cLen * 0.6 * ISO_Y_RATIO,
      cX + Math.cos(cAng) * cLen,
      cY + Math.sin(cAng) * cLen * ISO_Y_RATIO
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Lava spiral (ground-level carved channel with flowing lava)
  setShadowBlur(ctx, 8 * s, lavaCore);
  for (let pass = 0; pass < 3; pass++) {
    if (pass === 0) {
      ctx.strokeStyle = `rgba(40,20,10,0.5)`;
      ctx.lineWidth = 5 * s;
    } else if (pass === 1) {
      ctx.strokeStyle = `rgba(255,90,24,${0.15 * spiralPulse})`;
      ctx.lineWidth = 3.5 * s;
    } else {
      ctx.strokeStyle = `rgba(255,150,60,${0.3 * spiralPulse})`;
      ctx.lineWidth = 1.5 * s;
    }
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 4.5; angle += 0.08) {
      const radius = 3 * s + angle * 2.6 * s;
      const waver = Math.sin(angle * 3 + t * 1.5) * 0.5 * s;
      const px = cx + Math.cos(angle) * (radius + waver);
      const py = cy + Math.sin(angle) * (radius + waver) * ISO_Y_RATIO;
      if (angle === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }
  // Flowing lava dots along spiral
  ctx.lineWidth = 1;
  for (let dot = 0; dot < 12; dot++) {
    const dotAngle = (t * 0.5 + dot * 0.35) % (Math.PI * 4.5);
    const dotRadius = 3 * s + dotAngle * 2.6 * s;
    const dx = cx + Math.cos(dotAngle) * dotRadius;
    const dy = cy + Math.sin(dotAngle) * dotRadius * ISO_Y_RATIO;
    const dotAlpha = 0.4 + Math.sin(t * 3 + dot) * 0.2;
    ctx.fillStyle = `rgba(255,200,80,${dotAlpha})`;
    ctx.beginPath();
    ctx.arc(dx, dy, 1.2 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  clearShadow(ctx);

  // Central altar/tower (taller, more imposing)
  const altarX = cx;
  const altarY = cy - 3 * s;
  // Foundation
  drawIsometricPrism(
    ctx,
    altarX,
    altarY + 2 * s,
    8 * s,
    8 * s,
    4 * s,
    ashLight,
    ashDark,
    ashMid
  );
  // Main tower
  drawIsometricPrism(
    ctx,
    altarX,
    altarY,
    6 * s,
    6 * s,
    16 * s,
    ashLight,
    ashDark,
    ashMid
  );
  const aI = 6 * s * ISO_COS;
  const aD = 6 * s * ISO_SIN;
  const aTop = altarY - 16 * s;
  drawStoneRows(ctx, altarX, altarY, aI, aD, 16 * s, 6, 0.15);
  drawEdgeHighlights(ctx, altarX, altarY, aI, aD, 16 * s, ashHi);

  // Runic glow on altar walls
  setShadowBlur(ctx, 6 * s, lavaCore);
  ctx.strokeStyle = `rgba(255,90,24,${0.25 + Math.sin(t * 2) * 0.1})`;
  ctx.lineWidth = 0.8 * s;
  const runeY1 = altarY - 8 * s;
  ctx.beginPath();
  ctx.moveTo(altarX - aI * 0.6, runeY1 + aD);
  ctx.lineTo(altarX - aI * 0.3, runeY1 + aD - 2 * s);
  ctx.lineTo(altarX, runeY1 + aD);
  ctx.lineTo(altarX + aI * 0.3, runeY1 + aD - 2 * s);
  ctx.lineTo(altarX + aI * 0.6, runeY1 + aD);
  ctx.stroke();
  const runeY2 = altarY - 12 * s;
  ctx.beginPath();
  ctx.arc(altarX, runeY2 + aD, 1.5 * s, 0, Math.PI * 2);
  ctx.stroke();

  // Altar windows
  ctx.fillStyle = `rgba(255,90,30,${0.35 + Math.sin(t * 2.5) * 0.15})`;
  traceIsoFlushRect(
    ctx,
    altarX - aI * 0.5,
    altarY - 10 * s + aD * 0.5,
    1.8,
    5,
    "left",
    s
  );
  ctx.fill();
  traceIsoFlushRect(
    ctx,
    altarX + aI * 0.4,
    altarY - 10 * s + aD * 0.5,
    1.6,
    5,
    "right",
    s
  );
  ctx.fill();
  clearShadow(ctx);

  // Crumbled top
  ctx.fillStyle = ashHi;
  ctx.beginPath();
  ctx.moveTo(altarX - 3 * s, aTop);
  ctx.lineTo(altarX - 4 * s, aTop - 2.5 * s);
  ctx.lineTo(altarX - 1.5 * s, aTop - 1.5 * s);
  ctx.lineTo(altarX + 0.5 * s, aTop - 3.5 * s);
  ctx.lineTo(altarX + 3 * s, aTop - 1 * s);
  ctx.lineTo(altarX + 3 * s, aTop);
  ctx.closePath();
  ctx.fill();

  // Flanking ruins
  const flanks: {
    x: number;
    y: number;
    w: number;
    d: number;
    h: number;
  }[] = [
    { d: 4, h: 9, w: 4, x: -6, y: 0 },
    { d: 4, h: 10, w: 4, x: 6, y: -1 },
  ];
  for (let ri = 0; ri < flanks.length; ri++) {
    const ruin = flanks[ri];
    const rx = cx + ruin.x * s;
    const ry = cy + ruin.y * s;
    drawIsometricPrism(
      ctx,
      rx,
      ry,
      ruin.w * s,
      ruin.d * s,
      ruin.h * s,
      ashLight,
      ashDark,
      ashMid
    );
    const rI = ruin.w * s * ISO_COS;
    const rD = ruin.d * s * ISO_SIN;
    drawStoneRows(
      ctx,
      rx,
      ry,
      rI,
      rD,
      ruin.h * s,
      Math.max(2, Math.floor(ruin.h / 2)),
      0.15
    );
    drawEdgeHighlights(ctx, rx, ry, rI, rD, ruin.h * s, ashHi);

    // Broken top jagged
    ctx.fillStyle = ashMid;
    const fTop = ry - ruin.h * s;
    ctx.beginPath();
    ctx.moveTo(rx - 1.5 * s, fTop);
    ctx.lineTo(rx - 0.5 * s, fTop - 1.5 * s);
    ctx.lineTo(rx + 1 * s, fTop - 0.5 * s);
    ctx.lineTo(rx + 1.5 * s, fTop + 0.3 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Obsidian crystal formations
  const crystals: [number, number, number, number][] = [
    [-14, 4, 1, 0],
    [16, 2, 0.9, 1],
    [-8, -7, 0.75, 2],
    [12, -5, 0.85, 3],
    [-18, -1, 0.7, 4],
    [20, -3, 0.65, 5],
  ];
  for (const [crx, cry, crScale, crSeed] of crystals) {
    const crystalX = cx + crx * s;
    const crystalY = cy + cry * s;
    const cs = crScale * s;

    // Crystal cluster (3 shards)
    for (let shard = 0; shard < 3; shard++) {
      const shardH = (6 + shard * 2 + Math.sin(crSeed + shard) * 2) * cs;
      const shardW = (1.2 + shard * 0.3) * cs;
      const lean = (shard - 1) * 0.15;
      const sx = crystalX + shard * 1.5 * cs - 1.5 * cs;

      ctx.save();
      ctx.translate(sx, crystalY);
      ctx.rotate(lean);

      // Shard body
      const shardGrad = ctx.createLinearGradient(-shardW, 0, shardW, 0);
      shardGrad.addColorStop(0, obsidianDark);
      shardGrad.addColorStop(0.3, obsidianMid);
      shardGrad.addColorStop(0.7, obsidianHi);
      shardGrad.addColorStop(1, obsidianDark);
      ctx.fillStyle = shardGrad;
      ctx.beginPath();
      ctx.moveTo(-shardW, 0);
      ctx.lineTo(-shardW * 0.3, -shardH);
      ctx.lineTo(shardW * 0.3, -shardH * 0.9);
      ctx.lineTo(shardW, 0);
      ctx.closePath();
      ctx.fill();

      // Crystal facet highlight
      ctx.fillStyle = `rgba(60,50,90,${0.3 + Math.sin(t * 1.5 + crSeed + shard) * 0.1})`;
      ctx.beginPath();
      ctx.moveTo(-shardW * 0.2, -shardH * 0.3);
      ctx.lineTo(0, -shardH * 0.85);
      ctx.lineTo(shardW * 0.3, -shardH * 0.4);
      ctx.lineTo(0, -shardH * 0.2);
      ctx.closePath();
      ctx.fill();

      // Lava reflection on crystal
      setShadowBlur(ctx, 3 * cs, lavaCore);
      ctx.fillStyle = `rgba(255,90,30,${0.1 + Math.sin(t * 2 + crSeed) * 0.05})`;
      ctx.beginPath();
      ctx.moveTo(-shardW * 0.5, -shardH * 0.1);
      ctx.lineTo(-shardW * 0.1, -shardH * 0.5);
      ctx.lineTo(shardW * 0.1, -shardH * 0.3);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      clearShadow(ctx);

      ctx.restore();
    }
  }

  // Volcanic vents
  for (let vent = 0; vent < 6; vent++) {
    const ventAngle = vent * 1.1 + 0.5;
    const ventRadius = 6 * s + ventAngle * 2.2 * s;
    const vx = cx + Math.cos(ventAngle) * ventRadius;
    const vy = cy + Math.sin(ventAngle) * ventRadius * ISO_Y_RATIO;

    // Vent rim
    ctx.fillStyle = ashDark;
    fillIsoEllipse(ctx, vx, vy, 5 * s, 2.5 * s);
    ctx.fillStyle = "#0e0806";
    fillIsoEllipse(ctx, vx, vy, 3.5 * s, 1.8 * s);

    const rimPulse = 0.3 + Math.sin(t * 3 + vent * 1.2) * 0.15;
    setShadowBlur(ctx, 5 * s, lavaCore);
    ctx.strokeStyle = `rgba(255,90,24,${rimPulse})`;
    ctx.lineWidth = 1.2 * s;
    strokeIsoEllipse(ctx, vx, vy, 4 * s, 2 * s);
    clearShadow(ctx);

    // Lava pool in vent
    const coreGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, 3 * s);
    coreGrad.addColorStop(0, `rgba(255,200,80,${rimPulse * 0.45})`);
    coreGrad.addColorStop(0.4, `rgba(255,90,24,${rimPulse * 0.25})`);
    coreGrad.addColorStop(1, "transparent");
    ctx.fillStyle = coreGrad;
    fillIsoEllipse(ctx, vx, vy, 2.8 * s, 1.4 * s);

    // Lava burst eruptions
    const burstPhase = (t * 1.6 + vent * 1.3) % 5;
    if (burstPhase < 2) {
      const burstHeight = burstPhase * 14 * s;
      const burstAlpha = 0.55 * (1 - burstPhase / 2);

      setShadowBlur(ctx, 5 * s, lavaGlow);
      ctx.fillStyle = `rgba(255,185,60,${burstAlpha})`;
      ctx.beginPath();
      ctx.moveTo(vx - 1.5 * s, vy);
      ctx.quadraticCurveTo(
        vx + Math.sin(t * 6 + vent) * 2 * s,
        vy - burstHeight * 0.5,
        vx,
        vy - burstHeight
      );
      ctx.quadraticCurveTo(
        vx - Math.sin(t * 7 + vent) * 2 * s,
        vy - burstHeight * 0.45,
        vx + 1.5 * s,
        vy
      );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = `rgba(255,220,100,${burstAlpha * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(vx - 0.8 * s, vy);
      ctx.quadraticCurveTo(
        vx,
        vy - burstHeight * 0.4,
        vx,
        vy - burstHeight * 0.7
      );
      ctx.quadraticCurveTo(vx, vy - burstHeight * 0.3, vx + 0.8 * s, vy);
      ctx.closePath();
      ctx.fill();
      clearShadow(ctx);
    }
  }

  // Broken pillars with more detail
  const brokenPillars: [number, number, number][] = [
    [-17, 6, 7],
    [19, 4, 5.5],
    [-11, -9, 4.5],
    [15, -7, 6],
  ];
  for (const [px, py, ph] of brokenPillars) {
    const pillX = cx + px * s;
    const pillY = cy + py * s;
    drawIsometricPrism(
      ctx,
      pillX,
      pillY,
      3 * s,
      3 * s,
      ph * s,
      ashLight,
      ashDark,
      ashMid
    );
    const pI = 3 * s * ISO_COS;
    const pD = 3 * s * ISO_SIN;
    drawStoneRows(
      ctx,
      pillX,
      pillY,
      pI,
      pD,
      ph * s,
      Math.max(2, Math.floor(ph / 2)),
      0.12
    );

    // Jagged broken top
    ctx.fillStyle = ashHi;
    const pTop = pillY - ph * s;
    ctx.beginPath();
    ctx.moveTo(pillX - 2 * s, pTop);
    ctx.lineTo(pillX - 0.8 * s, pTop - 1.5 * s);
    ctx.lineTo(pillX + 0.5 * s, pTop - 0.8 * s);
    ctx.lineTo(pillX + 2 * s, pTop + 0.3 * s);
    ctx.closePath();
    ctx.fill();

    // Fallen rubble nearby
    ctx.fillStyle = ashMid;
    fillIsoEllipse(ctx, pillX + 3 * s, pillY + 1 * s, 1.5 * s, 0.8 * s);
    fillIsoEllipse(ctx, pillX - 2 * s, pillY + 1.5 * s, 1 * s, 0.6 * s);
  }

  // Volcanic rock formations
  for (const [rx, ry, rScale] of [
    [-22, 1, 1.2],
    [24, -1, 1],
    [-15, -5, 0.8],
  ] as const) {
    const rockX = cx + rx * s;
    const rockY = cy + ry * s;
    ctx.fillStyle = ashDark;
    ctx.beginPath();
    ctx.moveTo(rockX - 3 * rScale * s, rockY + 1 * s);
    ctx.lineTo(rockX - 1.5 * rScale * s, rockY - 3 * rScale * s);
    ctx.lineTo(rockX + 0.5 * rScale * s, rockY - 4 * rScale * s);
    ctx.lineTo(rockX + 3 * rScale * s, rockY - 1 * rScale * s);
    ctx.lineTo(rockX + 2.5 * rScale * s, rockY + 1 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = ashMid;
    ctx.beginPath();
    ctx.moveTo(rockX - 2 * rScale * s, rockY);
    ctx.lineTo(rockX, rockY - 3.5 * rScale * s);
    ctx.lineTo(rockX + 2 * rScale * s, rockY - 0.5 * rScale * s);
    ctx.lineTo(rockX + 1 * rScale * s, rockY + 0.5 * s);
    ctx.closePath();
    ctx.fill();
  }

  // Ember particles (more dramatic)
  for (let ember = 0; ember < 16; ember++) {
    const phase = (t * 0.35 + ember * 0.07) % 1;
    const ex = cx + Math.sin(t * 1.5 + ember * 1.8) * 24 * s;
    const ey = cy - 5 * s - phase * 35 * s;
    const alpha = Math.sin(phase * Math.PI) * 0.7;
    const eSize = (1.5 - phase * 1) * s;
    // Outer glow
    ctx.fillStyle = `rgba(255,${100 + ember * 8},0,${alpha * 0.35})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize + 1 * s, 0, Math.PI * 2);
    ctx.fill();
    // Core ember
    ctx.fillStyle = `rgba(255,${140 + ember * 7},0,${alpha})`;
    ctx.beginPath();
    ctx.arc(ex, ey, eSize, 0, Math.PI * 2);
    ctx.fill();
    // Bright tip on fresh embers
    if (phase < 0.2) {
      ctx.fillStyle = `rgba(255,255,180,${(1 - phase / 0.2) * 0.6})`;
      ctx.beginPath();
      ctx.arc(ex, ey, eSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Heavy smoke plumes
  drawSmoke(ctx, cx, aTop - 4 * s, s, t, 5, 10, 30, "50,30,20", 0.12);
  drawSmoke(
    ctx,
    cx + 6 * s,
    cy - 12 * s,
    s,
    t * 1.1,
    3,
    6,
    20,
    "60,35,25",
    0.08
  );
}

// ---------------------------------------------------------------------------
// Mirage Dunes — shimmering desert mirage with heat distortion and sand vortex
// ---------------------------------------------------------------------------

function drawMirageDunesLandmark(params: ChallengeLandmarkRenderParams): void {
  const {
    ctx,
    screenPos,
    scale: s,
    decorTime: t,
    shadowOnly = false,
    skipShadow = false,
    zoom: z = 1,
  } = params;
  const cx = screenPos.x;
  const cy = screenPos.y;

  const sandTop = "#d4bc7e";
  const sandLeft = "#a8884e";
  const sandRight = "#c4a86a";
  const sandDark = "#6a5430";
  const mirageBlue = "#66aadd";
  const mirageGold = "#ffcc44";
  const heatShimmer = "#ffeebb";

  if (!skipShadow) {
    drawDirectionalShadow(
      ctx,
      cx,
      cy + 4 * s,
      s,
      34 * s,
      14 * s,
      28 * s,
      0.28,
      "0,0,0",
      z
    );
  }
  if (shadowOnly) {
    return;
  }

  // Ground sand expanse
  const gGrad = ctx.createRadialGradient(
    cx,
    cy + 2 * s,
    0,
    cx,
    cy + 2 * s,
    34 * s
  );
  gGrad.addColorStop(0, "rgba(210,185,130,0.3)");
  gGrad.addColorStop(0.5, "rgba(190,160,100,0.12)");
  gGrad.addColorStop(1, "transparent");
  ctx.fillStyle = gGrad;
  drawOrganicBlobAt(ctx, cx, cy + 2 * s, 34 * s, 16 * s, 21.7, 0.12, 20);
  ctx.fill();

  // Twin sand dunes
  for (const [dx, dy, dw, dh] of [
    [-14, 4, 12, 5],
    [12, 6, 10, 4],
    [-8, -4, 8, 3],
    [6, -6, 9, 3.5],
  ] as const) {
    ctx.fillStyle = "rgba(200,170,110,0.3)";
    drawOrganicBlobAt(
      ctx,
      cx + dx * s,
      cy + dy * s,
      dw * s,
      dh * s,
      dx * 2.3,
      0.15,
      12
    );
    ctx.fill();
  }

  // Central platform — square footprint for correct iso angles
  const platSize = 14 * s;
  drawIsometricPrism(
    ctx,
    cx,
    cy + 2 * s,
    platSize,
    platSize,
    3 * s,
    sandTop,
    sandLeft,
    sandRight
  );

  // Inner pedestal
  const pedSize = 8 * s;
  drawIsometricPrism(
    ctx,
    cx,
    cy,
    pedSize,
    pedSize,
    5 * s,
    sandTop,
    sandLeft,
    sandDark
  );

  // Mirage orb — the signature visual element
  const orbY = cy - 14 * s;
  const orbPulse = 1 + Math.sin(t * 1.8) * 0.08;
  const orbRadius = 6 * s * orbPulse;

  // Outer glow ring
  const orbGlow = ctx.createRadialGradient(
    cx,
    orbY,
    orbRadius * 0.3,
    cx,
    orbY,
    orbRadius * 2.5
  );
  orbGlow.addColorStop(0, "rgba(102,170,221,0.35)");
  orbGlow.addColorStop(0.4, "rgba(255,204,68,0.15)");
  orbGlow.addColorStop(1, "transparent");
  ctx.fillStyle = orbGlow;
  ctx.beginPath();
  ctx.arc(cx, orbY, orbRadius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Orb body
  const orbBody = ctx.createRadialGradient(
    cx - 1.5 * s,
    orbY - 1.5 * s,
    0,
    cx,
    orbY,
    orbRadius
  );
  orbBody.addColorStop(0, heatShimmer);
  orbBody.addColorStop(0.4, mirageBlue);
  orbBody.addColorStop(0.85, mirageGold);
  orbBody.addColorStop(1, "rgba(255,204,68,0.3)");
  ctx.fillStyle = orbBody;
  ctx.beginPath();
  ctx.arc(cx, orbY, orbRadius, 0, Math.PI * 2);
  ctx.fill();

  // Orb specular highlight
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(cx - 1.5 * s, orbY - 2 * s, orbRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Sand vortex particles spiraling around the orb
  for (let i = 0; i < 12; i++) {
    const angle = t * 1.2 + i * ((Math.PI * 2) / 12);
    const spiralR = (8 + Math.sin(t * 0.8 + i * 0.9) * 3) * s;
    const px = cx + Math.cos(angle) * spiralR;
    const py = orbY + Math.sin(angle) * spiralR * ISO_Y_RATIO;
    const pAlpha = 0.4 + Math.sin(t * 2 + i * 1.3) * 0.2;
    const pSize = (1.2 + Math.sin(t + i) * 0.4) * s;
    ctx.fillStyle = `rgba(210,185,130,${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, pSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Heat shimmer streaks rising from the platform
  for (let i = 0; i < 8; i++) {
    const phase = (t * 0.4 + i * 0.13) % 1;
    const sx = cx + Math.sin(t * 0.7 + i * 2.1) * 10 * s;
    const sy = cy - phase * 28 * s;
    const alpha = Math.sin(phase * Math.PI) * 0.15;
    ctx.fillStyle = `rgba(255,238,187,${alpha})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, 1.5 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Corner obelisk pillars
  for (const [ox, oy] of [
    [-8, 3],
    [8, 3],
    [-5, -4],
    [5, -4],
  ] as const) {
    const pillarX = cx + ox * s;
    const pillarY = cy + oy * s;
    const pillarSize = 2 * s;
    drawIsometricPrism(
      ctx,
      pillarX,
      pillarY,
      pillarSize,
      pillarSize,
      10 * s,
      sandTop,
      sandDark,
      sandRight
    );
    // Gold cap
    drawIsometricPyramid(
      ctx,
      pillarX,
      pillarY - 10 * s,
      pillarSize,
      3 * s,
      mirageGold,
      "#b8952a",
      "#d4aa33"
    );
  }

  // Floating sand motes
  for (let m = 0; m < 6; m++) {
    const mx = cx + Math.sin(t * 0.5 + m * 1.7) * 20 * s;
    const my = cy + Math.cos(t * 0.4 + m * 2.3) * 10 * s - 4 * s;
    const mAlpha = 0.2 + Math.sin(t * 1.5 + m) * 0.1;
    ctx.fillStyle = `rgba(220,195,140,${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

export function renderChallengeLandmark(
  params: ChallengeLandmarkRenderParams
): boolean {
  switch (params.type) {
    case "cannon_crest": {
      drawCannonCrestLandmark(params);
      return true;
    }
    case "ivy_crossroads": {
      drawIvyCrossroadsLandmark(params);
      return true;
    }
    case "blight_basin": {
      drawBlightBasinLandmark(params);
      return true;
    }
    case "triad_keep": {
      drawTriadKeepLandmark(params);
      return true;
    }
    case "sunscorch_labyrinth": {
      drawSunscorchLabyrinthLandmark(params);
      return true;
    }
    case "frist_outpost": {
      drawFrontierOutpostLandmark(params);
      return true;
    }
    case "ashen_spiral": {
      drawAshenSpiralLandmark(params);
      return true;
    }
    case "mirage_dunes": {
      drawMirageDunesLandmark(params);
      return true;
    }
    default: {
      return false;
    }
  }
}
