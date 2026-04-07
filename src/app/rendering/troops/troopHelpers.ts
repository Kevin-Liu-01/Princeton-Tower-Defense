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
  limits: readonly [number, number]
): AnchoredWeapon {
  const handX = shoulderX + Math.cos(armSwingAngle) * armLength;
  const handY = shoulderY + Math.sin(armSwingAngle) * armLength;

  const weaponAngle = _resolveWeaponRotation(
    targetPos,
    handX,
    handY,
    weaponBaseAngle,
    forwardOffset,
    maxTurn,
    limits
  );

  const weaponX = handX + Math.sin(weaponAngle) * gripLocalY;
  const weaponY = handY - Math.cos(weaponAngle) * gripLocalY;

  return {
    armAngle: armSwingAngle,
    handX,
    handY,
    weaponAngle,
    weaponX,
    weaponY,
  };
}

// ── Detailed arm drawing ─────────────────────────────────────

export interface ArmColors {
  upper: string;
  upperLight: string;
  upperDark: string;
  vambrace: string;
  vambraceLight: string;
  elbow: string;
  hand: string;
  trim: string;
}

/**
 * Draws a detailed articulated arm along the positive X-axis.
 * Call inside a save/translate(shoulder)/rotate(armAngle) block.
 * The arm extends from x=0 to x=armLength.
 */
export function drawDetailedArm(
  ctx: CanvasRenderingContext2D,
  size: number,
  armLength: number,
  zoom: number,
  colors: ArmColors
) {
  const hw = size * 0.045;
  const elbowX = armLength * 0.48;
  const forearmStart = elbowX + size * 0.02;
  const forearmW = hw * 0.9;

  // --- Upper arm (bicep) ---
  const upperGrad = ctx.createLinearGradient(0, -hw, 0, hw);
  upperGrad.addColorStop(0, colors.upperDark);
  upperGrad.addColorStop(0.3, colors.upperLight);
  upperGrad.addColorStop(0.7, colors.upper);
  upperGrad.addColorStop(1, colors.upperDark);
  ctx.fillStyle = upperGrad;
  ctx.beginPath();
  ctx.roundRect(-size * 0.01, -hw, elbowX + size * 0.01, hw * 2, size * 0.01);
  ctx.fill();

  // Upper arm edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.01, -hw);
  ctx.lineTo(elbowX - size * 0.01, -hw);
  ctx.stroke();

  // --- Elbow cop ---
  const elbowGrad = ctx.createRadialGradient(
    elbowX,
    0,
    0,
    elbowX,
    0,
    size * 0.04
  );
  elbowGrad.addColorStop(0, colors.vambraceLight);
  elbowGrad.addColorStop(0.6, colors.elbow);
  elbowGrad.addColorStop(1, colors.upperDark);
  ctx.fillStyle = elbowGrad;
  ctx.beginPath();
  ctx.ellipse(elbowX, 0, size * 0.042, size * 0.035, 0, 0, Math.PI * 2);
  ctx.fill();

  // Elbow rivet
  ctx.fillStyle = colors.trim;
  ctx.beginPath();
  ctx.arc(elbowX, 0, size * 0.007, 0, Math.PI * 2);
  ctx.fill();

  // --- Forearm / vambrace ---
  const vambraceGrad = ctx.createLinearGradient(
    forearmStart,
    -forearmW,
    forearmStart,
    forearmW
  );
  vambraceGrad.addColorStop(0, colors.upperDark);
  vambraceGrad.addColorStop(0.2, colors.vambrace);
  vambraceGrad.addColorStop(0.5, colors.vambraceLight);
  vambraceGrad.addColorStop(0.8, colors.vambrace);
  vambraceGrad.addColorStop(1, colors.upperDark);
  ctx.fillStyle = vambraceGrad;
  ctx.beginPath();
  ctx.roundRect(
    forearmStart,
    -forearmW,
    armLength - forearmStart - size * 0.02,
    forearmW * 2,
    size * 0.008
  );
  ctx.fill();

  // Vambrace center ridge
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(forearmStart + size * 0.01, 0);
  ctx.lineTo(armLength - size * 0.04, 0);
  ctx.stroke();

  // Vambrace trim band
  ctx.fillStyle = colors.trim;
  ctx.globalAlpha = 0.35;
  ctx.fillRect(forearmStart, -forearmW, size * 0.012, forearmW * 2);
  ctx.globalAlpha = 1;

  // --- Gauntlet (hand) ---
  const handX = armLength;
  const gauntletGrad = ctx.createRadialGradient(
    handX,
    0,
    0,
    handX,
    0,
    size * 0.035
  );
  gauntletGrad.addColorStop(0, colors.vambraceLight);
  gauntletGrad.addColorStop(0.5, colors.vambrace);
  gauntletGrad.addColorStop(1, colors.upperDark);
  ctx.fillStyle = gauntletGrad;
  ctx.beginPath();
  ctx.arc(handX, 0, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Gauntlet knuckle line
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.arc(handX, 0, size * 0.025, -0.8, 0.8);
  ctx.stroke();
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
  armored: {
    aura: "rgba(230, 160, 70, ",
    crest: "#d9a040",
    metalSheen: "rgba(240, 235, 215, ",
    rimLight: "rgba(230, 210, 160, 0.62)",
    rune: "rgba(240, 200, 140, ",
  },
  cavalry: {
    aura: "rgba(247, 145, 52, ",
    crest: "#f7aa42",
    metalSheen: "rgba(255, 240, 198, ",
    rimLight: "rgba(255, 215, 148, 0.72)",
    rune: "rgba(255, 213, 136, ",
  },
  centaur: {
    aura: "rgba(210, 143, 74, ",
    crest: "#d79f56",
    metalSheen: "rgba(255, 229, 204, ",
    rimLight: "rgba(242, 210, 158, 0.66)",
    rune: "rgba(246, 212, 168, ",
  },
  elite: {
    aura: "rgba(255, 163, 74, ",
    crest: "#f5b04b",
    metalSheen: "rgba(255, 244, 213, ",
    rimLight: "rgba(255, 227, 162, 0.72)",
    rune: "rgba(255, 213, 143, ",
  },
  knight: {
    aura: "rgba(86, 141, 224, ",
    crest: "#78b2ff",
    metalSheen: "rgba(231, 242, 255, ",
    rimLight: "rgba(170, 212, 255, 0.62)",
    rune: "rgba(181, 220, 255, ",
  },
  rowing: {
    aura: "rgba(247, 130, 52, ",
    crest: "#ff9548",
    metalSheen: "rgba(255, 232, 205, ",
    rimLight: "rgba(255, 194, 132, 0.72)",
    rune: "rgba(255, 205, 148, ",
  },
  soldier: {
    aura: "rgba(255, 126, 40, ",
    crest: "#f27f2f",
    metalSheen: "rgba(255, 240, 220, ",
    rimLight: "rgba(255, 190, 120, 0.65)",
    rune: "rgba(255, 181, 116, ",
  },
  thesis: {
    aura: "rgba(184, 121, 250, ",
    crest: "#ba84ff",
    metalSheen: "rgba(241, 224, 255, ",
    rimLight: "rgba(219, 182, 255, 0.75)",
    rune: "rgba(221, 186, 255, ",
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
  colors: HorseBodyColors
) {
  const rx = radiusX;
  const ry = radiusY;

  // Angular body shape — barrel chest tapering to hindquarters
  const bodyGrad = ctx.createRadialGradient(
    centerX - rx * 0.25,
    centerY - ry * 0.3,
    0,
    centerX + rx * 0.1,
    centerY + ry * 0.1,
    Math.max(rx, ry) * 1.15
  );
  bodyGrad.addColorStop(0, colors.coatLight);
  bodyGrad.addColorStop(0.18, colors.coatMid);
  bodyGrad.addColorStop(0.55, colors.coatDark);
  bodyGrad.addColorStop(1, colors.coatDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  // Chest point (prow) — sharp angular protrusion
  ctx.moveTo(centerX - rx * 0.78, centerY - ry * 0.15);
  // Chest → withers — steep angular rise
  ctx.lineTo(centerX - rx * 0.65, centerY - ry * 0.65);
  // Withers peak — sharp angle
  ctx.lineTo(centerX - rx * 0.3, centerY - ry * 0.95);
  // Wither dip — angular saddle notch
  ctx.lineTo(centerX - rx * 0.05, centerY - ry * 0.78);
  // Back — angular line to croup
  ctx.lineTo(centerX + rx * 0.4, centerY - ry * 0.82);
  // Croup peak — sharp angle
  ctx.lineTo(centerX + rx * 0.62, centerY - ry * 0.65);
  // Rump drop — steep angular descent
  ctx.lineTo(centerX + rx * 0.85, centerY - ry * 0.2);
  // Buttock point
  ctx.lineTo(centerX + rx * 0.88, centerY + ry * 0.25);
  // Stifle angle — sharp turn into flank
  ctx.lineTo(centerX + rx * 0.6, centerY + ry * 0.72);
  // Flank → belly — angular underline
  ctx.lineTo(centerX + rx * 0.2, centerY + ry * 0.82);
  // Belly tuck-up — angular rise
  ctx.lineTo(centerX - rx * 0.15, centerY + ry * 0.7);
  // Girth — angular line
  ctx.lineTo(centerX - rx * 0.5, centerY + ry * 0.75);
  // Elbow point — sharp turn back to chest
  ctx.lineTo(centerX - rx * 0.72, centerY + ry * 0.45);
  // Chest underside → back to start
  ctx.lineTo(centerX - rx * 0.78, centerY - ry * 0.15);
  ctx.closePath();
  ctx.fill();

  // --- Shoulder muscle group (angular) ---
  const shX = centerX - rx * 0.48;
  const shY = centerY - ry * 0.05;
  const shGrad = ctx.createRadialGradient(
    shX - rx * 0.08,
    shY - ry * 0.15,
    0,
    shX,
    shY,
    rx * 0.4
  );
  shGrad.addColorStop(0, colors.muscleHighlight);
  shGrad.addColorStop(0.6, "rgba(0,0,0,0)");
  ctx.fillStyle = shGrad;
  ctx.beginPath();
  ctx.moveTo(shX - rx * 0.1, shY - ry * 0.5);
  ctx.bezierCurveTo(
    shX - rx * 0.35,
    shY - ry * 0.2,
    shX - rx * 0.35,
    shY + ry * 0.35,
    shX - rx * 0.05,
    shY + ry * 0.5
  );
  ctx.bezierCurveTo(
    shX + rx * 0.15,
    shY + ry * 0.35,
    shX + rx * 0.2,
    shY - ry * 0.15,
    shX - rx * 0.1,
    shY - ry * 0.5
  );
  ctx.fill();

  // Shoulder specular
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    shX - rx * 0.08,
    shY - ry * 0.2,
    rx * 0.14,
    ry * 0.2,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // --- Haunch muscle group (angular) ---
  const hhX = centerX + rx * 0.48;
  const hhY = centerY - ry * 0.05;
  const hhGrad = ctx.createRadialGradient(
    hhX + rx * 0.06,
    hhY - ry * 0.12,
    0,
    hhX,
    hhY,
    rx * 0.38
  );
  hhGrad.addColorStop(0, colors.muscleHighlight);
  hhGrad.addColorStop(0.6, "rgba(0,0,0,0)");
  ctx.fillStyle = hhGrad;
  ctx.beginPath();
  ctx.moveTo(hhX + rx * 0.15, hhY - ry * 0.45);
  ctx.bezierCurveTo(
    hhX + rx * 0.32,
    hhY - ry * 0.15,
    hhX + rx * 0.3,
    hhY + ry * 0.35,
    hhX + rx * 0.05,
    hhY + ry * 0.48
  );
  ctx.bezierCurveTo(
    hhX - rx * 0.12,
    hhY + ry * 0.3,
    hhX - rx * 0.15,
    hhY - ry * 0.1,
    hhX + rx * 0.15,
    hhY - ry * 0.45
  );
  ctx.fill();

  // Haunch specular
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    hhX + rx * 0.06,
    hhY - ry * 0.18,
    rx * 0.12,
    ry * 0.18,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // --- Spine ridge — sharp angular arch ---
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1.8 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(centerX - rx * 0.55, centerY - ry * 0.45);
  ctx.bezierCurveTo(
    centerX - rx * 0.2,
    centerY - ry * 0.92,
    centerX + rx * 0.25,
    centerY - ry * 0.82,
    centerX + rx * 0.62,
    centerY - ry * 0.38
  );
  ctx.stroke();
  ctx.lineCap = "butt";

  // --- Deep belly shadow ---
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.beginPath();
  ctx.moveTo(centerX - rx * 0.5, centerY + ry * 0.55);
  ctx.quadraticCurveTo(
    centerX,
    centerY + ry * 0.9,
    centerX + rx * 0.4,
    centerY + ry * 0.65
  );
  ctx.quadraticCurveTo(
    centerX,
    centerY + ry * 0.6,
    centerX - rx * 0.5,
    centerY + ry * 0.55
  );
  ctx.fill();

  // --- Shoulder definition lines ---
  ctx.strokeStyle = colors.muscleShadow;
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(shX - rx * 0.08, shY - ry * 0.42);
  ctx.bezierCurveTo(
    shX - rx * 0.3,
    shY - ry * 0.1,
    shX - rx * 0.25,
    shY + ry * 0.3,
    shX,
    shY + ry * 0.42
  );
  ctx.stroke();
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(shX + rx * 0.06, shY - ry * 0.28);
  ctx.bezierCurveTo(
    shX + rx * 0.12,
    shY + ry * 0.1,
    shX + rx * 0.08,
    shY + ry * 0.3,
    shX - rx * 0.05,
    shY + ry * 0.38
  );
  ctx.stroke();

  // --- Haunch definition lines ---
  ctx.lineWidth = 1.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(hhX + rx * 0.12, hhY - ry * 0.38);
  ctx.bezierCurveTo(
    hhX + rx * 0.26,
    hhY - ry * 0.05,
    hhX + rx * 0.2,
    hhY + ry * 0.28,
    hhX,
    hhY + ry * 0.4
  );
  ctx.stroke();
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(hhX - rx * 0.06, hhY - ry * 0.22);
  ctx.bezierCurveTo(
    hhX - rx * 0.1,
    hhY + ry * 0.12,
    hhX - rx * 0.06,
    hhY + ry * 0.3,
    hhX + rx * 0.08,
    hhY + ry * 0.36
  );
  ctx.stroke();

  // --- Ribcage hints (angular) ---
  ctx.lineWidth = 0.8 * zoom;
  ctx.save();
  ctx.globalAlpha = 0.55;
  for (let rib = 0; rib < 4; rib++) {
    const ribX = centerX - rx * 0.18 + rib * rx * 0.14;
    const ribTopY = centerY - ry * 0.1 + rib * ry * 0.04;
    ctx.beginPath();
    ctx.moveTo(ribX - rx * 0.02, ribTopY);
    ctx.bezierCurveTo(
      ribX - rx * 0.08,
      ribTopY + ry * 0.25,
      ribX - rx * 0.04,
      ribTopY + ry * 0.45,
      ribX + rx * 0.02,
      ribTopY + ry * 0.5
    );
    ctx.stroke();
  }
  ctx.restore();

  // --- Hip bone hint ---
  ctx.strokeStyle = colors.muscleHighlight;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(centerX + rx * 0.22, centerY - ry * 0.62);
  ctx.bezierCurveTo(
    centerX + rx * 0.35,
    centerY - ry * 0.68,
    centerX + rx * 0.45,
    centerY - ry * 0.55,
    centerX + rx * 0.42,
    centerY - ry * 0.4
  );
  ctx.stroke();

  // --- Withers notch ---
  ctx.strokeStyle = colors.muscleShadow;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(centerX - rx * 0.18, centerY - ry * 0.75);
  ctx.bezierCurveTo(
    centerX - rx * 0.3,
    centerY - ry * 0.65,
    centerX - rx * 0.32,
    centerY - ry * 0.5,
    centerX - rx * 0.22,
    centerY - ry * 0.4
  );
  ctx.stroke();

  // --- Girth/barrel shadow ---
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(centerX - rx * 0.15, centerY - ry * 0.65);
  ctx.bezierCurveTo(
    centerX - rx * 0.25,
    centerY + ry * 0.2,
    centerX - rx * 0.2,
    centerY + ry * 0.6,
    centerX - rx * 0.05,
    centerY + ry * 0.72
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
  colors: HorseLegColors
) {
  const upperLen = size * 0.19;
  const cannonLen = size * 0.17;
  const pasternLen = size * 0.038;
  const kneeSwing = Math.sin(time * freq + phaseOffset) * size * 0.03;
  const fetlockSwing =
    Math.sin(time * freq + phaseOffset + 0.85) * size * 0.025;

  ctx.save();
  ctx.translate(legX, legY);
  ctx.rotate(stride);

  // ── 1. Gaskin / thigh — powerful angular wedge ──
  const hipW = size * 0.08;
  const bulgeW = size * 0.095;
  const kneeW = size * 0.044;
  const gastrocBulge = upperLen * 0.32;

  const upperGrad = ctx.createLinearGradient(-hipW, 0, hipW * 0.6, upperLen);
  upperGrad.addColorStop(0, colors.thighLight);
  upperGrad.addColorStop(0.35, colors.thighMid);
  upperGrad.addColorStop(0.7, colors.thighDark);
  upperGrad.addColorStop(1, colors.thighDark);
  ctx.fillStyle = upperGrad;
  ctx.beginPath();
  ctx.moveTo(-hipW, 0);
  // Front edge — angular bulge at gastrocnemius
  ctx.lineTo(-bulgeW, gastrocBulge * 0.6);
  ctx.bezierCurveTo(
    -bulgeW * 0.95,
    gastrocBulge * 1.2,
    -kneeW * 1.6,
    upperLen * 0.75,
    kneeSwing - kneeW,
    upperLen
  );
  ctx.lineTo(kneeSwing + kneeW, upperLen);
  // Back edge — angular taper
  ctx.bezierCurveTo(
    kneeW * 1.6,
    upperLen * 0.75,
    bulgeW * 0.7,
    gastrocBulge * 1,
    bulgeW * 0.65,
    gastrocBulge * 0.5
  );
  ctx.lineTo(hipW, 0);
  ctx.closePath();
  ctx.fill();

  // Thigh — front muscle belly highlight
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(-hipW * 0.5, size * 0.01);
  ctx.bezierCurveTo(
    -bulgeW * 0.75,
    gastrocBulge * 0.5,
    -bulgeW * 0.6,
    gastrocBulge * 1.3,
    -kneeW * 0.8,
    upperLen * 0.7
  );
  ctx.lineTo(-kneeW * 0.3, upperLen * 0.7);
  ctx.bezierCurveTo(
    -bulgeW * 0.25,
    gastrocBulge * 1.1,
    -hipW * 0.15,
    gastrocBulge * 0.3,
    -hipW * 0.2,
    size * 0.01
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Thigh muscle definition lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-hipW * 0.3, size * 0.008);
  ctx.bezierCurveTo(
    -bulgeW * 0.5,
    gastrocBulge * 0.7,
    -kneeW * 1.2,
    upperLen * 0.65,
    kneeSwing - kneeW * 0.3,
    upperLen * 0.9
  );
  ctx.stroke();
  // Back muscle line
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(hipW * 0.5, size * 0.01);
  ctx.bezierCurveTo(
    bulgeW * 0.4,
    gastrocBulge * 0.8,
    kneeW * 1,
    upperLen * 0.7,
    kneeSwing + kneeW * 0.2,
    upperLen * 0.9
  );
  ctx.stroke();

  // Inner thigh shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.beginPath();
  ctx.moveTo(hipW * 0.3, gastrocBulge * 0.3);
  ctx.bezierCurveTo(
    bulgeW * 0.55,
    gastrocBulge * 0.8,
    kneeW * 1.2,
    upperLen * 0.75,
    kneeSwing + kneeW * 0.5,
    upperLen
  );
  ctx.lineTo(kneeSwing + kneeW, upperLen);
  ctx.bezierCurveTo(
    kneeW * 1.5,
    upperLen * 0.75,
    bulgeW * 0.65,
    gastrocBulge,
    hipW,
    0
  );
  ctx.lineTo(hipW * 0.3, gastrocBulge * 0.3);
  ctx.closePath();
  ctx.fill();

  // ── 2. Knee / hock joint — angular, bony ──
  const kX = kneeSwing;
  const kY = upperLen;
  const kW = size * 0.052;
  const kH = size * 0.028;

  // Bony angular joint shape
  ctx.fillStyle = colors.thighDark;
  ctx.beginPath();
  ctx.moveTo(kX - kW, kY - kH * 0.3);
  ctx.lineTo(kX - kW * 0.6, kY - kH);
  ctx.lineTo(kX + kW * 0.4, kY - kH * 0.8);
  ctx.lineTo(kX + kW, kY - kH * 0.2);
  ctx.lineTo(kX + kW * 0.8, kY + kH);
  ctx.lineTo(kX - kW * 0.7, kY + kH * 0.9);
  ctx.closePath();
  ctx.fill();

  // Kneecap specular
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    kX - kW * 0.25,
    kY - kH * 0.3,
    kW * 0.35,
    kH * 0.5,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // Bony outline accents
  ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(kX - kW * 0.6, kY - kH);
  ctx.lineTo(kX + kW * 0.4, kY - kH * 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(kX + kW, kY - kH * 0.2);
  ctx.lineTo(kX + kW * 0.8, kY + kH);
  ctx.stroke();

  // ── 3. Cannon bone — lean, angular, with prominent tendons ──
  const fetX = kX + fetlockSwing;
  const cannonTop = kY + kH;
  const cannonBot = cannonTop + cannonLen;
  const cTopW = size * 0.038;
  const cBotW = size * 0.032;

  const cannonGrad = ctx.createLinearGradient(0, cannonTop, 0, cannonBot);
  cannonGrad.addColorStop(0, colors.thighMid);
  cannonGrad.addColorStop(0.25, colors.thighLight);
  cannonGrad.addColorStop(0.6, colors.thighMid);
  cannonGrad.addColorStop(1, colors.thighDark);
  ctx.fillStyle = cannonGrad;
  ctx.beginPath();
  ctx.moveTo(kX - cTopW, cannonTop);
  // Straighter lines — bone is lean here
  ctx.lineTo(fetX - cBotW, cannonBot);
  ctx.lineTo(fetX + cBotW, cannonBot);
  ctx.lineTo(kX + cTopW, cannonTop);
  ctx.closePath();
  ctx.fill();

  // Front tendon — prominent ridge
  ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(kX - cTopW * 0.4, cannonTop + size * 0.005);
  ctx.lineTo(fetX - cBotW * 0.4, cannonBot - size * 0.01);
  ctx.stroke();

  // Back tendon — deep groove
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(kX + cTopW * 0.5, cannonTop + size * 0.005);
  ctx.lineTo(fetX + cBotW * 0.5, cannonBot - size * 0.01);
  ctx.stroke();

  // Splint bone hint (outer edge)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(kX - cTopW * 0.9, cannonTop + size * 0.01);
  ctx.lineTo((kX + fetX) * 0.5 - cBotW * 0.9, cannonTop + cannonLen * 0.55);
  ctx.stroke();

  // Cannon bone specular
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    (kX + fetX) * 0.5 - size * 0.014,
    cannonTop + cannonLen * 0.4,
    size * 0.01,
    cannonLen * 0.28,
    0.05,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // ── 4. Leg armor plates (barding) ──
  const armorTop = cannonTop + size * 0.008;
  const armorH = cannonLen * 0.42;
  const armorLX = kX - cTopW - size * 0.012;
  const armorRX = kX + cTopW + size * 0.012;
  const armorGrad = ctx.createLinearGradient(
    armorLX,
    armorTop,
    armorRX,
    armorTop
  );
  armorGrad.addColorStop(0, colors.greaveBottom);
  armorGrad.addColorStop(0.2, colors.greaveMid);
  armorGrad.addColorStop(0.5, colors.greaveTop);
  armorGrad.addColorStop(0.8, colors.greaveMid);
  armorGrad.addColorStop(1, colors.greaveBottom);
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(armorLX, armorTop);
  ctx.lineTo(armorLX + size * 0.003, armorTop + armorH);
  ctx.lineTo(armorRX - size * 0.003, armorTop + armorH);
  ctx.lineTo(armorRX, armorTop);
  ctx.closePath();
  ctx.fill();

  // Armor segmentation lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
  ctx.lineWidth = 0.7 * zoom;
  for (const t of [0.35, 0.7]) {
    const segY = armorTop + armorH * t;
    ctx.beginPath();
    ctx.moveTo(armorLX + size * 0.002, segY);
    ctx.lineTo(armorRX - size * 0.002, segY);
    ctx.stroke();
  }

  // Armor center ridge
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(kX, armorTop + size * 0.004);
  ctx.lineTo(kX, armorTop + armorH - size * 0.004);
  ctx.stroke();

  // Armor top/bottom trim
  ctx.strokeStyle = colors.trimColor;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(armorLX, armorTop);
  ctx.lineTo(armorRX, armorTop);
  ctx.stroke();
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(armorLX + size * 0.003, armorTop + armorH);
  ctx.lineTo(armorRX - size * 0.003, armorTop + armorH);
  ctx.stroke();

  // Lower shin guard
  const lATop = armorTop + armorH + cannonLen * 0.15;
  const lAH = cannonLen * 0.22;
  const lMidX = (kX + fetX) * 0.5;
  const lMidW = (cTopW + cBotW) * 0.52;
  const lArmorGrad = ctx.createLinearGradient(
    lMidX - lMidW,
    lATop,
    lMidX + lMidW,
    lATop
  );
  lArmorGrad.addColorStop(0, colors.greaveBottom);
  lArmorGrad.addColorStop(0.5, colors.greaveMid);
  lArmorGrad.addColorStop(1, colors.greaveBottom);
  ctx.fillStyle = lArmorGrad;
  ctx.beginPath();
  ctx.moveTo(lMidX - lMidW - size * 0.005, lATop);
  ctx.lineTo(lMidX - lMidW - size * 0.003, lATop + lAH);
  ctx.lineTo(lMidX + lMidW + size * 0.003, lATop + lAH);
  ctx.lineTo(lMidX + lMidW + size * 0.005, lATop);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = colors.trimColor;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(lMidX - lMidW - size * 0.005, lATop);
  ctx.lineTo(lMidX + lMidW + size * 0.005, lATop);
  ctx.stroke();

  // ── 5. Fetlock joint — small angular knob ──
  const ftX = fetX;
  const ftY = cannonBot;
  ctx.fillStyle = colors.thighDark;
  ctx.beginPath();
  ctx.moveTo(ftX - cBotW * 1.05, ftY - size * 0.006);
  ctx.lineTo(ftX - cBotW * 0.6, ftY - size * 0.012);
  ctx.lineTo(ftX + cBotW * 0.5, ftY - size * 0.01);
  ctx.lineTo(ftX + cBotW * 1.05, ftY - size * 0.004);
  ctx.lineTo(ftX + cBotW * 0.9, ftY + size * 0.008);
  ctx.lineTo(ftX - cBotW * 0.9, ftY + size * 0.007);
  ctx.closePath();
  ctx.fill();

  // ── 6. Pastern — compact, angled ──
  const pastBot = ftY + pasternLen;
  const pastW = size * 0.022;
  const pastGrad = ctx.createLinearGradient(0, ftY, 0, pastBot);
  pastGrad.addColorStop(0, colors.thighMid);
  pastGrad.addColorStop(1, colors.thighDark);
  ctx.fillStyle = pastGrad;
  ctx.beginPath();
  ctx.moveTo(ftX - pastW * 1.1, ftY + size * 0.005);
  ctx.lineTo(ftX - pastW, pastBot);
  ctx.lineTo(ftX + pastW, pastBot);
  ctx.lineTo(ftX + pastW * 1.1, ftY + size * 0.005);
  ctx.closePath();
  ctx.fill();

  // Pastern tendon highlight
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(ftX - pastW * 0.4, ftY + size * 0.008);
  ctx.lineTo(ftX - pastW * 0.35, pastBot - size * 0.005);
  ctx.stroke();

  // ── 7. Fetlock feathering — compact tuft ──
  const hairSpread = size * 0.045;
  const hairLen = size * 0.032;

  // Back feathering (darker)
  ctx.fillStyle = colors.thighDark;
  ctx.beginPath();
  ctx.moveTo(ftX - cBotW * 0.9, ftY);
  ctx.quadraticCurveTo(
    ftX - hairSpread - size * 0.01,
    ftY + hairLen * 0.3,
    ftX - hairSpread * 0.65,
    ftY + hairLen * 1.1
  );
  ctx.quadraticCurveTo(
    ftX - hairSpread * 0.25,
    ftY + hairLen * 0.8,
    ftX,
    ftY + hairLen * 0.5
  );
  ctx.quadraticCurveTo(
    ftX + hairSpread * 0.25,
    ftY + hairLen * 0.8,
    ftX + hairSpread * 0.65,
    ftY + hairLen * 1.1
  );
  ctx.quadraticCurveTo(
    ftX + hairSpread + size * 0.01,
    ftY + hairLen * 0.3,
    ftX + cBotW * 0.9,
    ftY
  );
  ctx.closePath();
  ctx.fill();

  // Front feathering (lighter)
  ctx.fillStyle = colors.thighMid;
  ctx.beginPath();
  ctx.moveTo(ftX - cBotW * 0.7, ftY + size * 0.002);
  ctx.quadraticCurveTo(
    ftX - hairSpread * 0.7,
    ftY + hairLen * 0.35,
    ftX - hairSpread * 0.4,
    ftY + hairLen * 0.8
  );
  ctx.quadraticCurveTo(
    ftX - hairSpread * 0.12,
    ftY + hairLen * 0.55,
    ftX,
    ftY + hairLen * 0.3
  );
  ctx.quadraticCurveTo(
    ftX + hairSpread * 0.12,
    ftY + hairLen * 0.55,
    ftX + hairSpread * 0.4,
    ftY + hairLen * 0.8
  );
  ctx.quadraticCurveTo(
    ftX + hairSpread * 0.7,
    ftY + hairLen * 0.35,
    ftX + cBotW * 0.7,
    ftY + size * 0.002
  );
  ctx.closePath();
  ctx.fill();

  // Hair strand lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
  ctx.lineWidth = 0.5 * zoom;
  for (let s = -2; s <= 2; s++) {
    const sx = ftX + s * hairSpread * 0.22;
    ctx.beginPath();
    ctx.moveTo(sx, ftY + size * 0.004);
    ctx.quadraticCurveTo(
      sx + s * size * 0.005,
      ftY + hairLen * 0.5,
      sx + s * size * 0.008,
      ftY + hairLen * 0.8
    );
    ctx.stroke();
  }

  // ── 8. Hoof — compact angular ──
  ctx.save();
  ctx.translate(ftX, pastBot);
  ctx.rotate(-0.18 + stride * 0.4);

  const hoofW = size * 0.048;
  const hoofH = size * 0.038;

  // Coronary band
  ctx.fillStyle = colors.thighDark;
  ctx.beginPath();
  ctx.ellipse(
    0,
    -size * 0.004,
    hoofW + size * 0.004,
    size * 0.01,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Hoof wall — angular shape
  const hoofGrad = ctx.createLinearGradient(-hoofW, 0, hoofW * 0.5, hoofH);
  hoofGrad.addColorStop(0, "#3a2a1c");
  hoofGrad.addColorStop(0.25, colors.hoofColor);
  hoofGrad.addColorStop(0.55, "#3a2a1c");
  hoofGrad.addColorStop(1, "#1a1008");
  ctx.fillStyle = hoofGrad;
  ctx.beginPath();
  ctx.moveTo(-hoofW, 0);
  ctx.lineTo(hoofW, -size * 0.008);
  ctx.lineTo(hoofW * 0.9, hoofH * 0.85);
  ctx.quadraticCurveTo(hoofW * 0.5, hoofH * 1.05, 0, hoofH);
  ctx.quadraticCurveTo(-hoofW * 0.5, hoofH * 1.05, -hoofW * 0.9, hoofH * 0.85);
  ctx.lineTo(-hoofW, 0);
  ctx.closePath();
  ctx.fill();

  // Hoof wall growth lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
  ctx.lineWidth = 0.5 * zoom;
  for (const t of [0.28, 0.52, 0.78]) {
    ctx.beginPath();
    ctx.moveTo(-hoofW * (1 - t * 0.12), hoofH * t);
    ctx.lineTo(hoofW * (1 - t * 0.12), hoofH * t - size * 0.003);
    ctx.stroke();
  }

  // Horseshoe
  ctx.strokeStyle = colors.trimColor;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(0, hoofH * 0.42, hoofW * 0.7, 0.25, Math.PI - 0.25);
  ctx.stroke();

  // Horseshoe nail dots
  ctx.fillStyle = colors.trimColor;
  for (let n = 0; n < 4; n++) {
    const nailAngle = 0.55 + n * 0.58;
    ctx.beginPath();
    ctx.arc(
      Math.cos(nailAngle) * hoofW * 0.72,
      hoofH * 0.42 + Math.sin(nailAngle) * hoofW * 0.72,
      size * 0.004,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Hoof sole highlight
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.006,
    hoofH * 0.32,
    size * 0.018,
    size * 0.009,
    0,
    0,
    Math.PI * 2
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
  dy: number
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
    g.tipY + dy
  );
  ctx.quadraticCurveTo(
    g.tipX + dx,
    g.tipY + tipW * 0.4 + dy,
    g.tipX + tipW * 0.55 + dx,
    g.tipY + dy
  );
  ctx.bezierCurveTo(
    g.cp2X + tipW + dx,
    g.cp2Y + g.size * 0.006 + dy,
    g.cp1X + bulge + dx,
    g.cp1Y + g.size * 0.003 + dy,
    g.rootX + rw + dx,
    g.rootY + dy
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
  width: number
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
  sparkles?: { rgb: string; intensity: number; threshold: number }
) {
  const wave = Math.sin(time * primaryFreq);
  const wave2 = Math.sin(time * secondaryFreq + 0.5);
  const swish = Math.sin(time * primaryFreq * 0.68 + 0.4) * 0.6;

  const geo: TailGeo = {
    cp1X: rootX + size * 0.12 + wave * 3,
    cp1Y: rootY + size * 0.1 + wave2 * 1.5,
    cp2X: rootX + size * 0.2 + wave * 5 + swish * 2,
    cp2Y: rootY + size * 0.22 + wave2 * 2,
    rootHW: size * 0.05,
    rootX,
    rootY,
    size,
    tipX: rootX + size * 0.14 + wave * 6 + swish * 3,
    tipY: rootY + size * 0.36 + wave2 * 2.5,
  };

  // Soft outer halo for bushy volume
  ctx.save();
  ctx.globalAlpha = 0.15;
  fillTailBody(ctx, geo, colors.base, 1.4, -size * 0.004, size * 0.002);
  fillTailBody(ctx, geo, colors.base, 1.4, size * 0.004, size * 0.002);
  ctx.restore();

  // Core filled body layers
  fillTailBody(ctx, geo, colors.base, 1, 0, 0);
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
    drawTailStrand(
      ctx,
      sx,
      sy,
      c1x,
      c1y,
      c2x,
      c2y,
      ex,
      ey,
      strandColor,
      thickness
    );
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
      0.7 * zoom
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
  ctx.bezierCurveTo(geo.cp1X, geo.cp1Y, geo.cp2X, geo.cp2Y, geo.tipX, geo.tipY);
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
    Math.PI * 2
  );
  ctx.fill();

  if (sparkles && sparkles.intensity > sparkles.threshold) {
    for (let p = 0; p < 3; p++) {
      const pt = p / 2;
      const pPhase = p * 1.1 + time * 3;
      const sX =
        geo.cp2X + (geo.tipX - geo.cp2X) * 0.4 + Math.sin(pPhase) * size * 0.08;
      const sY =
        geo.cp2Y +
        (geo.tipY - geo.cp2Y) * 0.4 +
        pt * size * 0.1 +
        Math.cos(pPhase * 1.3) * 4;
      const sA = (0.4 + Math.sin(pPhase * 2) * 0.3) * sparkles.intensity;
      ctx.fillStyle = `rgba(${sparkles.rgb}, ${sA})`;
      ctx.beginPath();
      ctx.arc(sX, sY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Armored skirt (tassets / fauld) — overlapping plate strips ──

export interface ArmoredSkirtColors {
  armorPeak: string;
  armorHigh: string;
  armorMid: string;
  armorDark: string;
  trimColor: string;
}

export interface ArmoredSkirtConfig {
  plateCount: number;
  widthFactor: number;
  depthFactor: number;
  topOffset: number;
}

const DEFAULT_SKIRT_CONFIG: ArmoredSkirtConfig = {
  depthFactor: 0.16,
  plateCount: 5,
  topOffset: 0.3,
  widthFactor: 0.48,
};

export function drawArmoredSkirt(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  zoom: number,
  stance: number,
  breathe: number,
  colors: ArmoredSkirtColors,
  config: Partial<ArmoredSkirtConfig> = {}
) {
  const cfg = { ...DEFAULT_SKIRT_CONFIG, ...config };
  const skirtTop = y + size * cfg.topOffset + breathe;
  const skirtWidth = size * cfg.widthFactor;
  const plateWidth = skirtWidth / cfg.plateCount;
  const skirtDepth = size * cfg.depthFactor;
  const halfCount = (cfg.plateCount - 1) / 2;

  for (let i = 0; i < cfg.plateCount; i++) {
    const px = x - skirtWidth * 0.5 + i * plateWidth;
    const distFromCenter = halfCount > 0 ? (i - halfCount) / halfCount : 0;
    const splay = distFromCenter * 0.08;
    const legMotion = stance * distFromCenter * 0.6;
    const plateDepth = skirtDepth * (1 - Math.abs(distFromCenter) * 0.15);

    ctx.save();
    ctx.translate(px + plateWidth * 0.5, skirtTop);
    ctx.rotate(splay + legMotion * 0.015);

    const plateGrad = ctx.createLinearGradient(
      -plateWidth * 0.5,
      0,
      plateWidth * 0.5,
      plateDepth
    );
    if (distFromCenter < -0.2) {
      plateGrad.addColorStop(0, colors.armorMid);
      plateGrad.addColorStop(0.4, colors.armorHigh);
      plateGrad.addColorStop(1, colors.armorDark);
    } else if (distFromCenter > 0.2) {
      plateGrad.addColorStop(0, colors.armorDark);
      plateGrad.addColorStop(0.6, colors.armorHigh);
      plateGrad.addColorStop(1, colors.armorMid);
    } else {
      plateGrad.addColorStop(0, colors.armorHigh);
      plateGrad.addColorStop(0.5, colors.armorPeak);
      plateGrad.addColorStop(1, colors.armorHigh);
    }

    const topHalf = plateWidth * 0.48;
    const botHalf = plateWidth * 0.54;
    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.moveTo(-topHalf, 0);
    ctx.lineTo(topHalf, 0);
    ctx.lineTo(botHalf, plateDepth);
    ctx.quadraticCurveTo(0, plateDepth + size * 0.02, -botHalf, plateDepth);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = colors.armorPeak;
    ctx.lineWidth = 0.8 * zoom;
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(-topHalf, 0.5);
    ctx.lineTo(topHalf, 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = colors.armorDark;
    ctx.lineWidth = 1 * zoom;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-botHalf, plateDepth);
    ctx.quadraticCurveTo(0, plateDepth + size * 0.02, botHalf, plateDepth);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = colors.trimColor;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(0, size * 0.02, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.restore();
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
  rise: number
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
  options: { mounted?: boolean; scholar?: boolean; vanguard?: boolean } = {}
) {
  const pulse = 0.58 + Math.sin(time * 4.1) * 0.18;
  const shimmer = 0.52 + Math.sin(time * 6.3 + 0.5) * 0.22;
  const breathShift = Math.sin(time * 2.4) * size * 0.003;
  const isMounted = !!options.mounted;
  const shoulderY = y - size * (isMounted ? 0.06 : 0.03);
  const shoulderSpan = size * (isMounted ? 0.24 : 0.16);
  const chestY = y + size * (isMounted ? 0.03 : 0.06) + breathShift;
  const chestWidth = size * (isMounted ? 0.12 : 0.09);
  const runeY = y + size * (isMounted ? 0.12 : 0.08) + breathShift;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // === Shoulder rim accents (glowing filigree along pauldron edges) ===
  for (let side = -1; side <= 1; side += 2) {
    // Outer glow stroke
    ctx.strokeStyle = `${style.aura}${0.12 + shimmer * 0.1})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * shoulderSpan, shoulderY);
    ctx.quadraticCurveTo(
      x + side * shoulderSpan * 0.72,
      shoulderY - size * 0.06,
      x + side * chestWidth,
      chestY - size * 0.02
    );
    ctx.stroke();

    // Bright inner rim
    ctx.strokeStyle = style.rimLight;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * shoulderSpan, shoulderY);
    ctx.quadraticCurveTo(
      x + side * shoulderSpan * 0.72,
      shoulderY - size * 0.06,
      x + side * chestWidth,
      chestY - size * 0.02
    );
    ctx.stroke();

    // Shoulder gem accent
    const gemX = x + side * shoulderSpan * 0.85;
    const gemY = shoulderY - size * 0.01;
    ctx.fillStyle = style.crest;
    ctx.globalAlpha = 0.6 + pulse * 0.2;
    ctx.beginPath();
    ctx.arc(gemX, gemY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // === Chest filigree (ornamental scrollwork on breastplate) ===
  const filigreeAlpha = 0.15 + shimmer * 0.15;
  ctx.strokeStyle = `${style.rune}${filigreeAlpha})`;
  ctx.lineWidth = 0.7 * zoom;

  // V-shaped chest filigree
  ctx.beginPath();
  ctx.moveTo(x - chestWidth, chestY - size * 0.01);
  ctx.quadraticCurveTo(
    x - chestWidth * 0.5,
    chestY + size * 0.02,
    x,
    chestY + size * 0.05
  );
  ctx.quadraticCurveTo(
    x + chestWidth * 0.5,
    chestY + size * 0.02,
    x + chestWidth,
    chestY - size * 0.01
  );
  ctx.stroke();

  // Filigree scrolls flanking the chest
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(x + side * chestWidth * 0.4, chestY + size * 0.01);
    ctx.quadraticCurveTo(
      x + side * chestWidth * 0.8,
      chestY - size * 0.02,
      x + side * chestWidth * 0.9,
      chestY + size * 0.03
    );
    ctx.quadraticCurveTo(
      x + side * chestWidth * 0.75,
      chestY + size * 0.06,
      x + side * chestWidth * 0.5,
      chestY + size * 0.04
    );
    ctx.stroke();
  }

  // === Metal sheen highlights (armor polish reflections) ===
  ctx.strokeStyle = `${style.metalSheen}${0.12 + shimmer * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  // Upper chest V sheen
  ctx.beginPath();
  ctx.moveTo(x - chestWidth * 0.6, chestY - size * 0.02);
  ctx.lineTo(x, chestY + size * 0.03);
  ctx.lineTo(x + chestWidth * 0.6, chestY - size * 0.02);
  ctx.stroke();
  // Belt-line sheen
  ctx.beginPath();
  ctx.moveTo(x - chestWidth * 0.82, chestY + size * 0.11);
  ctx.lineTo(x + chestWidth * 0.82, chestY + size * 0.11);
  ctx.stroke();

  // === Crest gem (focal centerpiece) ===
  const crestGemY = chestY - size * 0.005;

  // Gem glow halo
  ctx.fillStyle = `${style.aura}${0.15 + pulse * 0.15})`;
  ctx.beginPath();
  ctx.arc(x, crestGemY, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // Gem body (diamond shape)
  ctx.fillStyle = style.crest;
  ctx.globalAlpha = 0.65 + pulse * 0.2;
  ctx.beginPath();
  ctx.moveTo(x, crestGemY - size * 0.03);
  ctx.lineTo(x - size * 0.02, crestGemY + size * 0.002);
  ctx.lineTo(x, crestGemY + size * 0.035);
  ctx.lineTo(x + size * 0.02, crestGemY + size * 0.002);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Gem specular pip
  ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.006,
    crestGemY - size * 0.01,
    size * 0.006,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Gem setting (thin gold border)
  ctx.strokeStyle = `${style.rune}${0.4 + pulse * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, crestGemY - size * 0.032);
  ctx.lineTo(x - size * 0.022, crestGemY + size * 0.002);
  ctx.lineTo(x, crestGemY + size * 0.037);
  ctx.lineTo(x + size * 0.022, crestGemY + size * 0.002);
  ctx.closePath();
  ctx.stroke();

  // === Runic engravings (variant-dependent) ===
  const runeAlpha = 0.2 + pulse * 0.2;
  ctx.strokeStyle = `${style.rune}${runeAlpha})`;
  ctx.lineWidth = 0.8 * zoom;

  if (options.vanguard) {
    // Vanguard: aggressive slash motifs with cross-hatching
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.11, chestY + size * 0.02);
      ctx.lineTo(x + side * size * 0.06, chestY + size * 0.12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.09, chestY + size * 0.01);
      ctx.lineTo(x + side * size * 0.04, chestY + size * 0.11);
      ctx.stroke();
      // Cross-slash
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.05, chestY + size * 0.03);
      ctx.lineTo(x + side * size * 0.1, chestY + size * 0.09);
      ctx.stroke();
    }
  } else if (options.scholar) {
    // Scholar: floating runic glyphs with individual glow
    for (let rune = 0; rune < 5; rune++) {
      const runeX = x - size * 0.08 + rune * size * 0.04;
      const runeLift = Math.sin(time * 3.5 + rune * 1.2) * size * 0.008;
      const runePhase = (time * 0.8 + rune * 0.6) % (Math.PI * 2);
      const runeGlow = 0.15 + Math.sin(runePhase) * 0.1;

      // Rune glow spot
      ctx.fillStyle = `${style.aura}${runeGlow})`;
      ctx.beginPath();
      ctx.arc(
        runeX + size * 0.014,
        runeY - size * 0.005 + runeLift,
        size * 0.012,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Rune glyph
      ctx.strokeStyle = `${style.rune}${runeAlpha + 0.1})`;
      ctx.lineWidth = 0.7 * zoom;
      ctx.beginPath();
      ctx.moveTo(runeX, runeY + runeLift);
      ctx.lineTo(runeX + size * 0.008, runeY - size * 0.022 + runeLift);
      ctx.lineTo(runeX + size * 0.02, runeY - size * 0.012 + runeLift);
      ctx.lineTo(runeX + size * 0.028, runeY + size * 0.012 + runeLift);
      ctx.stroke();
    }
  } else {
    // Default: elegant arc with flanking flourishes
    ctx.beginPath();
    ctx.moveTo(x - size * 0.07, runeY);
    ctx.quadraticCurveTo(x, runeY - size * 0.03, x + size * 0.07, runeY);
    ctx.stroke();
    // Flanking curls
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.07, runeY);
      ctx.quadraticCurveTo(
        x + side * size * 0.09,
        runeY - size * 0.015,
        x + side * size * 0.085,
        runeY + size * 0.015
      );
      ctx.stroke();
    }
  }

  // === Edge gilding on plate borders ===
  ctx.strokeStyle = `${style.rune}${0.1 + shimmer * 0.08})`;
  ctx.lineWidth = 0.6 * zoom;
  // Neckline
  ctx.beginPath();
  ctx.arc(x, shoulderY + size * 0.02, size * 0.06, 0.4, Math.PI - 0.4);
  ctx.stroke();
  // Waist edge
  ctx.beginPath();
  ctx.moveTo(x - chestWidth * 0.9, chestY + size * 0.14);
  ctx.quadraticCurveTo(
    x,
    chestY + size * 0.16,
    x + chestWidth * 0.9,
    chestY + size * 0.14
  );
  ctx.stroke();

  // === Ambient motes (rising magic particles) ===
  drawTroopFinishMotes(
    ctx,
    x,
    y + size * 0.16,
    size,
    time,
    style.rune,
    isMounted ? 5 : 4,
    size * (isMounted ? 0.16 : 0.11),
    size * (isMounted ? 0.2 : 0.14)
  );

  ctx.restore();
}
