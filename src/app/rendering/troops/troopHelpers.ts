import type { Position } from "../../types";

export {
  normalizeSignedAngle,
  resolveWeaponRotation,
  WEAPON_LIMITS,
} from "../weaponRotation";

import { resolveWeaponRotation as _resolveWeaponRotation } from "../weaponRotation";

export interface AnchoredWeapon {
  handX: number;
  handY: number;
  weaponX: number;
  weaponY: number;
  weaponAngle: number;
  armAngle: number;
}

/**
 * Anchor a weapon so its grip is always locked to the hand (end of the arm).
 *
 * Flow:
 *   1. armSwingAngle → hand position (fixed distance from shoulder)
 *   2. weaponBaseAngle + target → final weapon angle
 *   3. weapon origin derived so that gripLocalY lands exactly on the hand
 */
export function anchorWeaponToHand(
  shoulderX: number,
  shoulderY: number,
  armLength: number,
  armSwingAngle: number,
  gripLocalY: number,
  weaponBaseAngle: number,
  targetPos: Position | undefined,
  forwardOffset: number,
  maxTurn: number,
  limits: readonly [number, number],
): AnchoredWeapon {
  const handX = shoulderX + Math.cos(armSwingAngle) * armLength;
  const handY = shoulderY + Math.sin(armSwingAngle) * armLength;

  const weaponAngle = _resolveWeaponRotation(
    targetPos, handX, handY, weaponBaseAngle,
    forwardOffset, maxTurn, limits,
  );

  const weaponX = handX + Math.sin(weaponAngle) * gripLocalY;
  const weaponY = handY - Math.cos(weaponAngle) * gripLocalY;

  return { handX, handY, weaponX, weaponY, weaponAngle, armAngle: armSwingAngle };
}

export interface TroopMasterworkStyle {
  rimLight: string;
  aura: string;
  rune: string;
  metalSheen: string;
  crest: string;
}

export const TROOP_MASTERWORK_STYLES: Record<
  | "soldier"
  | "armored"
  | "elite"
  | "cavalry"
  | "centaur"
  | "thesis"
  | "rowing"
  | "knight",
  TroopMasterworkStyle
> = {
  soldier: {
    rimLight: "rgba(255, 190, 120, 0.65)",
    aura: "rgba(255, 126, 40, ",
    rune: "rgba(255, 181, 116, ",
    metalSheen: "rgba(255, 240, 220, ",
    crest: "#f27f2f",
  },
  armored: {
    rimLight: "rgba(230, 210, 160, 0.62)",
    aura: "rgba(230, 160, 70, ",
    rune: "rgba(240, 200, 140, ",
    metalSheen: "rgba(240, 235, 215, ",
    crest: "#d9a040",
  },
  elite: {
    rimLight: "rgba(255, 227, 162, 0.72)",
    aura: "rgba(255, 163, 74, ",
    rune: "rgba(255, 213, 143, ",
    metalSheen: "rgba(255, 244, 213, ",
    crest: "#f5b04b",
  },
  cavalry: {
    rimLight: "rgba(255, 215, 148, 0.72)",
    aura: "rgba(247, 145, 52, ",
    rune: "rgba(255, 213, 136, ",
    metalSheen: "rgba(255, 240, 198, ",
    crest: "#f7aa42",
  },
  centaur: {
    rimLight: "rgba(242, 210, 158, 0.66)",
    aura: "rgba(210, 143, 74, ",
    rune: "rgba(246, 212, 168, ",
    metalSheen: "rgba(255, 229, 204, ",
    crest: "#d79f56",
  },
  thesis: {
    rimLight: "rgba(219, 182, 255, 0.75)",
    aura: "rgba(184, 121, 250, ",
    rune: "rgba(221, 186, 255, ",
    metalSheen: "rgba(241, 224, 255, ",
    crest: "#ba84ff",
  },
  rowing: {
    rimLight: "rgba(255, 194, 132, 0.72)",
    aura: "rgba(247, 130, 52, ",
    rune: "rgba(255, 205, 148, ",
    metalSheen: "rgba(255, 232, 205, ",
    crest: "#ff9548",
  },
  knight: {
    rimLight: "rgba(170, 212, 255, 0.62)",
    aura: "rgba(86, 141, 224, ",
    rune: "rgba(181, 220, 255, ",
    metalSheen: "rgba(231, 242, 255, ",
    crest: "#78b2ff",
  },
};

// ── Horse body ──────────────────────────────────────────────

export interface HorseBodyColors {
  coatLight: string;
  coatMid: string;
  coatDark: string;
  muscleHighlight: string;
  muscleShadow: string;
}

export function drawMuscularHorseBody(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  size: number,
  zoom: number,
  colors: HorseBodyColors,
) {
  const rx = radiusX;
  const ry = radiusY;

  // Base body with rich gradient — light source from upper-front
  const bodyGrad = ctx.createRadialGradient(
    centerX - rx * 0.25,
    centerY - ry * 0.35,
    0,
    centerX + rx * 0.1,
    centerY + ry * 0.1,
    Math.max(rx, ry) * 1.15,
  );
  bodyGrad.addColorStop(0, colors.coatLight);
  bodyGrad.addColorStop(0.2, colors.coatMid);
  bodyGrad.addColorStop(0.6, colors.coatDark);
  bodyGrad.addColorStop(1, colors.coatDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder muscle group — large gradient overlay
  const shX = centerX - rx * 0.5;
  const shY = centerY - ry * 0.08;
  ctx.save();
  ctx.fillStyle = colors.muscleHighlight;
  ctx.beginPath();
  ctx.ellipse(shX, shY, rx * 0.38, ry * 0.62, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Shoulder specular — bright spot at muscle peak
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    shX - rx * 0.06,
    shY - ry * 0.18,
    rx * 0.16,
    ry * 0.22,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  // Haunch muscle group
  const hhX = centerX + rx * 0.46;
  const hhY = centerY - ry * 0.03;
  ctx.fillStyle = colors.muscleHighlight;
  ctx.beginPath();
  ctx.ellipse(hhX, hhY, rx * 0.33, ry * 0.56, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Haunch specular
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    hhX + rx * 0.04,
    hhY - ry * 0.16,
    rx * 0.14,
    ry * 0.2,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  // Coat sheen — crescent highlight across the top
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    centerX - rx * 0.08,
    centerY - ry * 0.35,
    rx * 0.65,
    ry * 0.32,
    -0.08,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  // Deep belly shadow (two-layer)
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY + ry * 0.35,
    rx * 0.72,
    ry * 0.3,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
  ctx.beginPath();
  ctx.ellipse(
    centerX,
    centerY + ry * 0.5,
    rx * 0.5,
    ry * 0.18,
    0,
    0,
    Math.PI,
  );
  ctx.fill();

  // Spine ridge — bezier for natural arch
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 1.8 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(centerX - rx * 0.6, centerY - ry * 0.32);
  ctx.bezierCurveTo(
    centerX - rx * 0.2,
    centerY - ry * 0.8,
    centerX + rx * 0.2,
    centerY - ry * 0.74,
    centerX + rx * 0.6,
    centerY - ry * 0.28,
  );
  ctx.stroke();
  ctx.lineCap = "butt";

  // Shoulder definition — major arc and secondary
  ctx.strokeStyle = colors.muscleShadow;
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.arc(shX, shY, rx * 0.25, 0.2, 2.5);
  ctx.stroke();
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(shX + rx * 0.1, shY + ry * 0.22, rx * 0.19, 0.4, 2.1);
  ctx.stroke();

  // Haunch definition — major arc and secondary
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.arc(hhX, hhY, rx * 0.23, 0.3, 2.3);
  ctx.stroke();
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(hhX - rx * 0.07, hhY + ry * 0.18, rx * 0.17, 0.5, 2.1);
  ctx.stroke();

  // Ribcage hints
  ctx.lineWidth = 0.7 * zoom;
  ctx.save();
  ctx.globalAlpha = 0.65;
  for (let rib = 0; rib < 3; rib++) {
    const ribX = centerX - rx * 0.1 + rib * rx * 0.15;
    ctx.beginPath();
    ctx.arc(ribX, centerY + ry * 0.1, ry * 0.36, 0.7, 2.3);
    ctx.stroke();
  }
  ctx.restore();

  // Hip bone hint
  ctx.strokeStyle = colors.muscleHighlight;
  ctx.lineWidth = 1.0 * zoom;
  ctx.beginPath();
  ctx.arc(
    centerX + rx * 0.28,
    centerY - ry * 0.55,
    rx * 0.12,
    0.8,
    2.8,
  );
  ctx.stroke();

  // Withers notch
  ctx.strokeStyle = colors.muscleShadow;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.arc(
    centerX - rx * 0.25,
    centerY - ry * 0.6,
    rx * 0.1,
    1.2,
    2.6,
  );
  ctx.stroke();
}

// ── Horse leg ───────────────────────────────────────────────

export interface HorseLegColors {
  thighLight: string;
  thighMid: string;
  thighDark: string;
  greaveTop: string;
  greaveMid: string;
  greaveBottom: string;
  hoofColor: string;
  trimColor: string;
}

export function drawMuscularHorseLeg(
  ctx: CanvasRenderingContext2D,
  legX: number,
  legY: number,
  size: number,
  zoom: number,
  time: number,
  stride: number,
  phaseOffset: number,
  freq: number,
  colors: HorseLegColors,
) {
  const upperLen = size * 0.18;
  const lowerLen = size * 0.19;
  const kneeSwing =
    Math.sin(time * freq + phaseOffset) * size * 0.03;
  const fetlockSwing =
    Math.sin(time * freq + phaseOffset + 0.85) * size * 0.025;

  ctx.save();
  ctx.translate(legX, legY);
  ctx.rotate(stride);

  // ── Muscular thigh ──
  const hipW = size * 0.065;
  const bulgeW = size * 0.078;
  const kneeW = size * 0.042;
  const bulgeY = upperLen * 0.36;

  const upperGrad = ctx.createLinearGradient(-hipW, 0, hipW, upperLen);
  upperGrad.addColorStop(0, colors.thighLight);
  upperGrad.addColorStop(0.45, colors.thighMid);
  upperGrad.addColorStop(1, colors.thighDark);
  ctx.fillStyle = upperGrad;
  ctx.beginPath();
  ctx.moveTo(-hipW, 0);
  ctx.bezierCurveTo(
    -bulgeW,
    bulgeY * 0.5,
    -bulgeW * 0.88,
    upperLen * 0.65,
    kneeSwing - kneeW,
    upperLen,
  );
  ctx.lineTo(kneeSwing + kneeW, upperLen);
  ctx.bezierCurveTo(
    bulgeW * 0.88,
    upperLen * 0.65,
    bulgeW,
    bulgeY * 0.5,
    hipW,
    0,
  );
  ctx.closePath();
  ctx.fill();

  // Thigh highlight — front specular
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.012,
    bulgeY * 0.85,
    size * 0.018,
    size * 0.055,
    0.12,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  // Thigh muscle separator
  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.005, size * 0.01);
  ctx.bezierCurveTo(
    -size * 0.015,
    bulgeY * 0.6,
    -size * 0.008,
    bulgeY * 1.4,
    kneeSwing,
    upperLen - size * 0.01,
  );
  ctx.stroke();

  // Thigh shadow (inner)
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.024,
    bulgeY * 1.3,
    size * 0.016,
    size * 0.04,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ── Knee joint ──
  ctx.fillStyle = colors.thighDark;
  ctx.beginPath();
  ctx.ellipse(
    kneeSwing,
    upperLen,
    size * 0.048,
    size * 0.032,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Kneecap highlight
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    kneeSwing - size * 0.008,
    upperLen - size * 0.008,
    size * 0.02,
    size * 0.014,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
  // Kneecap shadow ring
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.arc(kneeSwing, upperLen, size * 0.035, 0.5, 2.6);
  ctx.stroke();

  // ── Lower leg / greave ──
  const fetlockX = kneeSwing + fetlockSwing;
  const lowerGrad = ctx.createLinearGradient(
    kneeSwing - size * 0.045,
    upperLen,
    fetlockX + size * 0.045,
    upperLen + lowerLen,
  );
  lowerGrad.addColorStop(0, colors.greaveTop);
  lowerGrad.addColorStop(0.45, colors.greaveMid);
  lowerGrad.addColorStop(1, colors.greaveBottom);
  ctx.fillStyle = lowerGrad;
  ctx.beginPath();
  ctx.moveTo(kneeSwing - size * 0.04, upperLen);
  ctx.bezierCurveTo(
    kneeSwing - size * 0.044,
    upperLen + lowerLen * 0.3,
    fetlockX - size * 0.038,
    upperLen + lowerLen * 0.7,
    fetlockX - size * 0.034,
    upperLen + lowerLen,
  );
  ctx.lineTo(fetlockX + size * 0.034, upperLen + lowerLen);
  ctx.bezierCurveTo(
    fetlockX + size * 0.038,
    upperLen + lowerLen * 0.7,
    kneeSwing + size * 0.044,
    upperLen + lowerLen * 0.3,
    kneeSwing + size * 0.04,
    upperLen,
  );
  ctx.closePath();
  ctx.fill();

  // Greave trim line
  ctx.strokeStyle = colors.trimColor;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(kneeSwing - size * 0.026, upperLen + size * 0.02);
  ctx.lineTo(
    fetlockX - size * 0.018,
    upperLen + lowerLen - size * 0.025,
  );
  ctx.stroke();

  // Tendon lines on cannon bone
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(kneeSwing + size * 0.02, upperLen + size * 0.015);
  ctx.lineTo(
    fetlockX + size * 0.015,
    upperLen + lowerLen - size * 0.02,
  );
  ctx.stroke();

  // Greave specular highlight
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    (kneeSwing + fetlockX) / 2 - size * 0.012,
    upperLen + lowerLen * 0.45,
    size * 0.012,
    lowerLen * 0.3,
    0.05,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  // ── Fetlock tuft ──
  const ftX = fetlockX;
  const ftY = upperLen + lowerLen;
  ctx.fillStyle = colors.thighDark;
  ctx.beginPath();
  ctx.moveTo(ftX - size * 0.038, ftY - size * 0.005);
  ctx.quadraticCurveTo(
    ftX - size * 0.05,
    ftY + size * 0.018,
    ftX - size * 0.03,
    ftY + size * 0.025,
  );
  ctx.lineTo(ftX + size * 0.03, ftY + size * 0.025);
  ctx.quadraticCurveTo(
    ftX + size * 0.05,
    ftY + size * 0.018,
    ftX + size * 0.038,
    ftY - size * 0.005,
  );
  ctx.closePath();
  ctx.fill();

  // ── Hoof ──
  ctx.save();
  ctx.translate(ftX, ftY);
  ctx.rotate(-0.2 + stride * 0.45);
  const hoofGrad = ctx.createLinearGradient(
    -size * 0.06,
    0,
    size * 0.06,
    size * 0.045,
  );
  hoofGrad.addColorStop(0, colors.hoofColor);
  hoofGrad.addColorStop(0.4, "#3a2a1c");
  hoofGrad.addColorStop(1, colors.hoofColor);
  ctx.fillStyle = hoofGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.062, size * 0.003);
  ctx.lineTo(size * 0.059, -size * 0.009);
  ctx.quadraticCurveTo(
    size * 0.066,
    size * 0.02,
    size * 0.054,
    size * 0.042,
  );
  ctx.lineTo(-size * 0.055, size * 0.046);
  ctx.quadraticCurveTo(
    -size * 0.067,
    size * 0.024,
    -size * 0.062,
    size * 0.003,
  );
  ctx.closePath();
  ctx.fill();

  // Horseshoe arc
  ctx.strokeStyle = colors.trimColor;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(0, size * 0.022, size * 0.042, 0.35, Math.PI - 0.35);
  ctx.stroke();

  // Hoof sole highlight
  ctx.save();
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.01,
    size * 0.015,
    size * 0.03,
    size * 0.012,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();

  ctx.restore(); // hoof transform
  ctx.restore(); // leg transform
}

// ── Horse tail ──────────────────────────────────────────────

export interface HorseTailColors {
  base: string;
  mid: string;
  highlight: string;
  accent: string;
  glowRgb: string;
}

interface TailGeo {
  rootX: number;
  rootY: number;
  cp1X: number;
  cp1Y: number;
  cp2X: number;
  cp2Y: number;
  tipX: number;
  tipY: number;
  rootHW: number;
  size: number;
}

function fillTailBody(
  ctx: CanvasRenderingContext2D,
  g: TailGeo,
  color: string,
  widthMul: number,
  dx: number,
  dy: number,
) {
  const rw = g.rootHW * widthMul * 0.65;
  const bulge = g.rootHW * widthMul * 1.5;
  const tipW = g.rootHW * widthMul * 1.1;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(g.rootX - rw + dx, g.rootY + dy);
  ctx.bezierCurveTo(
    g.cp1X - bulge + dx,
    g.cp1Y + dy,
    g.cp2X - tipW + dx,
    g.cp2Y + dy,
    g.tipX - tipW * 0.55 + dx,
    g.tipY + dy,
  );
  ctx.quadraticCurveTo(
    g.tipX + dx,
    g.tipY + tipW * 0.4 + dy,
    g.tipX + tipW * 0.55 + dx,
    g.tipY + dy,
  );
  ctx.bezierCurveTo(
    g.cp2X + tipW + dx,
    g.cp2Y + g.size * 0.006 + dy,
    g.cp1X + bulge + dx,
    g.cp1Y + g.size * 0.003 + dy,
    g.rootX + rw + dx,
    g.rootY + dy,
  );
  ctx.closePath();
  ctx.fill();
}

function drawTailStrand(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  ex: number,
  ey: number,
  color: string,
  width: number,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.bezierCurveTo(c1x, c1y, c2x, c2y, ex, ey);
  ctx.stroke();
}

export function drawHorseTail(
  ctx: CanvasRenderingContext2D,
  rootX: number,
  rootY: number,
  size: number,
  zoom: number,
  time: number,
  primaryFreq: number,
  secondaryFreq: number,
  colors: HorseTailColors,
  glowAlpha: number,
  sparkles?: { rgb: string; intensity: number; threshold: number },
) {
  const wave = Math.sin(time * primaryFreq);
  const wave2 = Math.sin(time * secondaryFreq + 0.5);
  const swish = Math.sin(time * primaryFreq * 0.68 + 0.4) * 0.6;

  const geo: TailGeo = {
    rootX,
    rootY,
    cp1X: rootX + size * 0.12 + wave * 3,
    cp1Y: rootY + size * 0.10 + wave2 * 1.5,
    cp2X: rootX + size * 0.20 + wave * 5 + swish * 2,
    cp2Y: rootY + size * 0.22 + wave2 * 2,
    tipX: rootX + size * 0.14 + wave * 6 + swish * 3,
    tipY: rootY + size * 0.36 + wave2 * 2.5,
    rootHW: size * 0.05,
    size,
  };

  // Soft outer halo for bushy volume
  ctx.save();
  ctx.globalAlpha = 0.15;
  fillTailBody(ctx, geo, colors.base, 1.4, -size * 0.004, size * 0.002);
  fillTailBody(ctx, geo, colors.base, 1.4, size * 0.004, size * 0.002);
  ctx.restore();

  // Core filled body layers
  fillTailBody(ctx, geo, colors.base, 1.0, 0, 0);
  fillTailBody(ctx, geo, colors.mid, 0.75, size * 0.002, -size * 0.001);
  fillTailBody(ctx, geo, colors.highlight, 0.4, size * 0.004, -size * 0.003);

  // Flowing hair strands fanning from root to tip
  ctx.save();
  ctx.lineCap = "round";
  const strandCount = 14;
  for (let i = 0; i < strandCount; i++) {
    const t = i / (strandCount - 1);
    const offset = (t - 0.5) * 2;
    const phase = i * 0.55 + 0.4;
    const sw = Math.sin(time * primaryFreq * 0.85 + phase);
    const sw2 = Math.sin(time * secondaryFreq * 0.9 + phase * 0.7);

    const sx = geo.rootX + offset * geo.rootHW * 0.4;
    const sy = geo.rootY + Math.abs(offset) * size * 0.003;

    const fan = offset * size * 0.04;
    const waveOff = sw * size * 0.01;

    const c1x = geo.cp1X + fan * 0.3 + waveOff * 0.4;
    const c1y = geo.cp1Y + Math.abs(offset) * size * 0.006;
    const c2x = geo.cp2X + fan * 0.7 + waveOff * 0.8;
    const c2y = geo.cp2Y + offset * size * 0.01 + sw2 * 1.5;
    const ex = geo.tipX + fan * 1.3 + waveOff;
    const ey = geo.tipY + offset * size * 0.016 + sw2 * 2;

    const thickness =
      (size * 0.004 + size * 0.003 * (1 - Math.abs(offset))) * zoom;

    const ci = i % 3;
    const strandColor =
      ci === 0 ? colors.base : ci === 1 ? colors.mid : colors.highlight;

    ctx.globalAlpha = 0.4 + (1 - Math.abs(offset)) * 0.35;
    drawTailStrand(ctx, sx, sy, c1x, c1y, c2x, c2y, ex, ey, strandColor, thickness);
  }
  ctx.restore();

  // Bright highlight strands for backlit silky look
  ctx.save();
  ctx.lineCap = "round";
  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    const offset = (t - 0.5) * 1.6;
    const phase = i * 0.9 + 1.5;
    const hw = Math.sin(time * primaryFreq * 0.7 + phase);

    const sx = geo.rootX + offset * geo.rootHW * 0.3;
    const sy = geo.rootY;
    const fan = offset * size * 0.03;
    const ex = geo.tipX + fan * 1.1 + hw * size * 0.008;
    const ey = geo.tipY + offset * size * 0.013 + hw * 2;

    ctx.globalAlpha = 0.5;
    drawTailStrand(
      ctx,
      sx,
      sy,
      geo.cp1X + fan * 0.25,
      geo.cp1Y,
      geo.cp2X + fan * 0.6,
      geo.cp2Y + offset * size * 0.006,
      ex,
      ey,
      colors.highlight,
      0.7 * zoom,
    );
  }
  ctx.restore();

  // Center spine
  ctx.save();
  ctx.strokeStyle = colors.highlight;
  ctx.lineWidth = 0.8 * zoom;
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.moveTo(rootX, rootY);
  ctx.bezierCurveTo(
    geo.cp1X,
    geo.cp1Y,
    geo.cp2X,
    geo.cp2Y,
    geo.tipX,
    geo.tipY,
  );
  ctx.stroke();
  ctx.restore();

  // Tip glow
  ctx.fillStyle = `rgba(${colors.glowRgb}, ${glowAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    geo.tipX,
    geo.tipY,
    size * 0.032,
    size * 0.02,
    wave * 0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  if (sparkles && sparkles.intensity > sparkles.threshold) {
    for (let p = 0; p < 3; p++) {
      const pt = p / 2;
      const pPhase = p * 1.1 + time * 3;
      const sX =
        geo.cp2X +
        (geo.tipX - geo.cp2X) * 0.4 +
        Math.sin(pPhase) * size * 0.08;
      const sY =
        geo.cp2Y +
        (geo.tipY - geo.cp2Y) * 0.4 +
        pt * size * 0.1 +
        Math.cos(pPhase * 1.3) * 4;
      const sA =
        (0.4 + Math.sin(pPhase * 2) * 0.3) * sparkles.intensity;
      ctx.fillStyle = `rgba(${sparkles.rgb}, ${sA})`;
      ctx.beginPath();
      ctx.arc(sX, sY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export function drawTroopFinishMotes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  glowColor: string,
  count: number,
  spreadX: number,
  rise: number,
) {
  for (let mote = 0; mote < count; mote++) {
    const phase = (time * 0.7 + mote * 0.19) % 1;
    const drift = Math.sin(time * 2.1 + mote * 1.7) * spreadX;
    const moteX = x + drift * (0.4 + phase * 0.7);
    const moteY = y - phase * rise + Math.cos(time * 2.8 + mote) * size * 0.015;
    const alpha = (1 - phase) * 0.28;
    ctx.fillStyle = `${glowColor}${alpha})`;
    ctx.beginPath();
    ctx.arc(moteX, moteY, size * (0.012 + mote * 0.0015), 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawTroopMasterworkFinish(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number,
  zoom: number,
  style: TroopMasterworkStyle,
  options: { mounted?: boolean; scholar?: boolean; vanguard?: boolean } = {},
) {
  const pulse = 0.58 + Math.sin(time * 4.1) * 0.18;
  const shimmer = 0.52 + Math.sin(time * 6.3 + 0.5) * 0.22;
  const shoulderY = y - size * (options.mounted ? 0.06 : 0.03);
  const shoulderSpan = size * (options.mounted ? 0.24 : 0.16);
  const chestY = y + size * (options.mounted ? 0.03 : 0.06);
  const chestWidth = size * (options.mounted ? 0.12 : 0.09);
  const runeY = y + size * (options.mounted ? 0.12 : 0.08);

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Subtle cold rim accents sharpen the silhouette without adding large overlays.
  ctx.strokeStyle = style.rimLight;
  ctx.lineWidth = 1.2 * zoom;
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * shoulderSpan, shoulderY);
    ctx.quadraticCurveTo(
      x + side * shoulderSpan * 0.72,
      shoulderY - size * 0.06,
      x + side * chestWidth,
      chestY - size * 0.02,
    );
    ctx.stroke();
  }

  // Chest and belt-line sheen keeps the armor readable at small scales.
  ctx.strokeStyle = `${style.metalSheen}${0.14 + shimmer * 0.18})`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - chestWidth, chestY);
  ctx.lineTo(x, chestY + size * 0.04);
  ctx.lineTo(x + chestWidth, chestY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - chestWidth * 0.82, chestY + size * 0.11);
  ctx.lineTo(x + chestWidth * 0.82, chestY + size * 0.11);
  ctx.stroke();

  // Tiny crest gem adds a focal point without brightening the whole sprite.
  ctx.fillStyle = style.crest;
  ctx.globalAlpha = 0.55 + pulse * 0.18;
  ctx.beginPath();
  ctx.moveTo(x, chestY - size * 0.03);
  ctx.lineTo(x - size * 0.018, chestY + size * 0.002);
  ctx.lineTo(x, chestY + size * 0.03);
  ctx.lineTo(x + size * 0.018, chestY + size * 0.002);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Vanguard units get harsher slash motifs; scholars get cleaner runic marks.
  ctx.strokeStyle = `${style.rune}${0.18 + pulse * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  if (options.vanguard) {
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.11, chestY + size * 0.02);
      ctx.lineTo(x + side * size * 0.07, chestY + size * 0.11);
      ctx.moveTo(x + side * size * 0.085, chestY + size * 0.01);
      ctx.lineTo(x + side * size * 0.045, chestY + size * 0.1);
      ctx.stroke();
    }
  }
  if (options.scholar) {
    for (let rune = 0; rune < 3; rune++) {
      const runeX = x - size * 0.06 + rune * size * 0.06;
      const runeLift = Math.sin(time * 3.5 + rune) * size * 0.008;
      ctx.beginPath();
      ctx.moveTo(runeX, runeY + runeLift);
      ctx.lineTo(runeX + size * 0.014, runeY - size * 0.02 + runeLift);
      ctx.lineTo(runeX + size * 0.028, runeY + size * 0.01 + runeLift);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.06, runeY);
    ctx.quadraticCurveTo(x, runeY - size * 0.028, x + size * 0.06, runeY);
    ctx.stroke();
  }

  drawTroopFinishMotes(
    ctx,
    x,
    y + size * 0.16,
    size,
    time,
    style.rune,
    options.mounted ? 4 : 3,
    size * (options.mounted ? 0.14 : 0.09),
    size * (options.mounted ? 0.18 : 0.12),
  );
  ctx.restore();
}
