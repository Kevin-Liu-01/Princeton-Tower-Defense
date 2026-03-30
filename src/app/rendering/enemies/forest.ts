import { setShadowBlur, clearShadow } from "../performance";
import { ISO_Y_RATIO } from "../../constants/isometric";
import {
  drawLeafSwirl,
  drawShiftingSegments,
  drawOrbitingDebris,
  getBreathScale,
  getIdleSway,
  drawEmberSparks,
} from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";
import type { MapTheme } from "../../types";
import { getRegionMaterials, drawRegionBodyAccent } from "./regionVariants";

const TAU = Math.PI * 2;

// ============================================================================
// 1. ATHLETE — GLADIATOR SPRINTER
//    Minimal gladiator armor (harness, greaves, arm guards), winged headband
// ============================================================================

export function drawAthleteEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  region: MapTheme = "grassland",
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackBoost = isAttacking ? 1.35 : 1;
  const breath = getBreathScale(time, 1.8, 0.012);
  const sway = getIdleSway(time, 1.0, size * 0.003, size * 0.002);
  const runCycle = time * 14 * attackBoost;
  const armSwing = Math.sin(runCycle) * 0.45;
  const bounce = Math.abs(Math.sin(runCycle)) * 4 * zoom;
  const leanForward = 0.15 + (isAttacking ? 0.1 : 0);
  const cx = x + sway.dx;
  const bodyBob = bounce + sway.dy;

  const skinTone = "#c9a882";
  const skinDark = "#a08060";
  let bronze = "#b8860b";
  let bronzeDark = "#8b6508";
  let bronzeLight = "#daa520";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    bronze = rm.metal.base;
    bronzeDark = rm.metal.dark;
    bronzeLight = rm.metal.bright;
  }

  // Speed afterimage trail
  for (let ai = 4; ai >= 1; ai--) {
    const aiAlpha = 0.08 - ai * 0.015;
    const aiOffset =
      ai * size * 0.1 + Math.sin(runCycle + ai * 0.8) * size * 0.015;
    const aiBounce = Math.abs(Math.sin(runCycle - ai * 0.5)) * 4 * zoom;
    ctx.save();
    ctx.globalAlpha = aiAlpha;
    ctx.translate(cx - aiOffset, y - aiBounce);
    ctx.fillStyle = skinDark;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -size * 0.1,
      size * 0.12,
      size * 0.24,
      leanForward * 0.3,
      0,
      TAU,
    );
    ctx.fill();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -size * 0.42, size * 0.1, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Magic speed aura
  const auraInt = 0.14 + Math.sin(time * 6) * 0.05 + (isAttacking ? 0.1 : 0);
  const motionGrad = ctx.createRadialGradient(
    cx - size * 0.15,
    y - size * 0.08 - bodyBob,
    size * 0.04,
    cx - size * 0.15,
    y - size * 0.08 - bodyBob,
    size * 0.6,
  );
  motionGrad.addColorStop(0, `rgba(249, 160, 50, ${auraInt})`);
  motionGrad.addColorStop(0.4, `rgba(249, 115, 22, ${auraInt * 0.3})`);
  motionGrad.addColorStop(1, "rgba(249, 115, 22, 0)");
  ctx.fillStyle = motionGrad;
  ctx.beginPath();
  ctx.ellipse(
    cx - size * 0.2,
    y - size * 0.08 - bodyBob,
    size * 0.7,
    size * 0.28,
    0,
    0,
    TAU,
  );
  ctx.fill();

  // Speed lines (attack mode)
  if (isAttacking) {
    ctx.lineWidth = 1.5 * zoom;
    for (let sl = 0; sl < 6; sl++) {
      const slPhase = (time * 5 + sl * 0.35) % 1;
      const slY = y - size * 0.38 + sl * size * 0.12 - bodyBob;
      ctx.strokeStyle = `rgba(255, 220, 120, ${(1 - slPhase) * 0.4})`;
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.25 - slPhase * size * 0.35, slY);
      ctx.lineTo(cx - size * 0.25 - slPhase * size * 0.35 - size * 0.28, slY);
      ctx.stroke();
    }
  }

  // Short billowing cape
  const capeWave = Math.sin(time * 5) * size * 0.03;
  const capeGrad = ctx.createLinearGradient(
    cx,
    y - size * 0.28,
    cx + capeWave,
    y + size * 0.1,
  );
  capeGrad.addColorStop(0, bodyColorDark);
  capeGrad.addColorStop(0.4, bodyColor);
  capeGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.14, y - size * 0.26 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.2 + capeWave,
    y + size * 0.0,
    cx - size * 0.22 + capeWave,
    y + size * 0.12 - bodyBob,
  );
  ctx.lineTo(cx + size * 0.06 + capeWave * 0.5, y + size * 0.08 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.04,
    y - size * 0.08 - bodyBob,
    cx + size * 0.14,
    y - size * 0.26 - bodyBob,
  );
  ctx.closePath();
  ctx.fill();

  // Legs — gladiator greaves (armored shins, bare thighs)
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: bronze,
    colorDark: bronzeDark,
    footColor: bronzeDark,
    trimColor: bodyColor,
    strideSpeed: 14 * attackBoost,
    strideAmt: 0.4,
    legLen: 0.24,
    width: 0.08,
    footLen: 0.12,
    style: "armored",
  });

  // Dust sparks from boots
  drawEmberSparks(ctx, cx, y + size * 0.45 - bodyBob, size * 0.2, time, zoom, {
    color: "rgba(255, 180, 60, 0.6)",
    coreColor: "rgba(255, 220, 100, 0.3)",
    count: isAttacking ? 6 : 3,
    speed: 2,
    maxAlpha: 0.5,
    sparkSize: 0.08,
  });

  // Gladiator body — exposed muscular torso with harness (NOT plate cuirass)
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.rotate(leanForward * 0.2);
  ctx.scale(breath, breath);

  // Muscular torso (skin)
  const torsoGrad = ctx.createLinearGradient(
    -size * 0.2,
    -size * 0.22,
    size * 0.2,
    size * 0.16,
  );
  torsoGrad.addColorStop(0, skinDark);
  torsoGrad.addColorStop(0.3, skinTone);
  torsoGrad.addColorStop(0.6, skinTone);
  torsoGrad.addColorStop(1, skinDark);
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.14);
  ctx.bezierCurveTo(
    -size * 0.24,
    size * 0.04,
    -size * 0.22,
    -size * 0.1,
    -size * 0.18,
    -size * 0.22,
  );
  ctx.bezierCurveTo(
    -size * 0.1,
    -size * 0.26,
    size * 0.1,
    -size * 0.26,
    size * 0.18,
    -size * 0.22,
  );
  ctx.bezierCurveTo(
    size * 0.22,
    -size * 0.1,
    size * 0.24,
    size * 0.04,
    size * 0.2,
    size * 0.14,
  );
  ctx.closePath();
  ctx.fill();

  // Muscle definition lines
  ctx.strokeStyle = "rgba(100,70,40,0.2)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.22);
  ctx.lineTo(0, size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.12);
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.04, -size * 0.08, size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.12);
  ctx.quadraticCurveTo(size * 0.12, -size * 0.04, size * 0.08, size * 0.04);
  ctx.stroke();

  // Leather cross-harness over chest
  ctx.strokeStyle = bronzeDark;
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, -size * 0.18);
  ctx.lineTo(size * 0.08, size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.18, -size * 0.18);
  ctx.lineTo(-size * 0.08, size * 0.1);
  ctx.stroke();
  // Center buckle
  ctx.fillStyle = bronzeLight;
  ctx.beginPath();
  ctx.arc(0, -size * 0.04, size * 0.03, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = bronzeDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Orange tabard sash (one-shoulder)
  ctx.fillStyle = bodyColor;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.22);
  ctx.lineTo(size * 0.02, -size * 0.22);
  ctx.lineTo(size * 0.06, size * 0.14);
  ctx.lineTo(-size * 0.12, size * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // "XXIII" on sash
  ctx.fillStyle = "#fff";
  ctx.font = `bold ${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("XXIII", -size * 0.03, -size * 0.04);
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.strokeText("XXIII", -size * 0.03, -size * 0.04);

  ctx.restore();

  // Bronze arm guards (NOT plate pauldrons)
  for (const side of [-1, 1]) {
    const agX = cx + side * size * 0.22;
    const agY = y - size * 0.22 - bodyBob;
    const agGrad = ctx.createLinearGradient(
      agX - size * 0.03,
      agY,
      agX + size * 0.03,
      agY + size * 0.08,
    );
    agGrad.addColorStop(0, bronzeLight);
    agGrad.addColorStop(0.5, bronze);
    agGrad.addColorStop(1, bronzeDark);
    ctx.fillStyle = agGrad;
    ctx.beginPath();
    ctx.ellipse(
      agX,
      agY + size * 0.01,
      size * 0.04,
      size * 0.035,
      side * 0.3,
      0,
      TAU,
    );
    ctx.fill();
  }

  // Leather waist guard (NOT armor skirt)
  ctx.fillStyle = bronzeDark;
  ctx.fillRect(
    cx - size * 0.16,
    y + size * 0.0 - bodyBob,
    size * 0.32,
    size * 0.025,
  );
  ctx.fillStyle = bronzeLight;
  ctx.fillRect(
    cx - size * 0.02,
    y - size * 0.005 - bodyBob,
    size * 0.04,
    size * 0.035,
  );

  // Arms (pumping while running)
  drawPathArm(
    ctx,
    cx - size * 0.24,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: skinTone,
      colorDark: skinDark,
      handColor: skinDark,
      trimColor: bodyColor,
      upperLen: 0.16,
      foreLen: 0.14,
      width: 0.075,
      shoulderAngle: leanForward - armSwing * 0.7,
      elbowAngle: 0.35 + armSwing * 0.2,
      attackExtra: isAttacking ? 0.2 : 0,
      style: "fleshy",
    },
  );
  drawPathArm(
    ctx,
    cx + size * 0.24,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: skinTone,
      colorDark: skinDark,
      handColor: skinDark,
      trimColor: bodyColor,
      upperLen: 0.16,
      foreLen: 0.14,
      width: 0.075,
      shoulderAngle: leanForward + armSwing * 0.7,
      elbowAngle: 0.35 - armSwing * 0.2,
      attackExtra: isAttacking ? 0.2 : 0,
      style: "fleshy",
    },
  );

  // HEAD — Winged bronze headband (NOT full armored helm)
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;

  // Face
  const faceGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.02,
    0,
    headX,
    headY,
    size * 0.14,
  );
  faceGrad.addColorStop(0, skinTone);
  faceGrad.addColorStop(0.7, skinDark);
  faceGrad.addColorStop(1, "#8a6848");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.14, 0, TAU);
  ctx.fill();

  // Intense focused eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(
      headX + side * size * 0.05,
      headY - size * 0.015,
      size * 0.022,
      size * 0.016,
      0,
      0,
      TAU,
    );
    ctx.fill();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.05,
      headY - size * 0.015,
      size * 0.01,
      0,
      TAU,
    );
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.05,
      headY - size * 0.015,
      size * 0.005,
      0,
      TAU,
    );
    ctx.fill();
  }
  // War paint stripe across eyes
  ctx.fillStyle = bodyColorDark;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(
    headX - size * 0.12,
    headY - size * 0.03,
    size * 0.24,
    size * 0.025,
  );
  ctx.globalAlpha = 1;
  // Determined jaw
  ctx.strokeStyle = skinDark;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.04, headY + size * 0.06);
  ctx.lineTo(headX + size * 0.04, headY + size * 0.06);
  ctx.stroke();

  // Bronze headband
  const hbGrad = ctx.createLinearGradient(
    headX - size * 0.14,
    headY - size * 0.06,
    headX + size * 0.14,
    headY - size * 0.06,
  );
  hbGrad.addColorStop(0, bronzeDark);
  hbGrad.addColorStop(0.3, bronzeLight);
  hbGrad.addColorStop(0.5, bronze);
  hbGrad.addColorStop(0.7, bronzeLight);
  hbGrad.addColorStop(1, bronzeDark);
  ctx.fillStyle = hbGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, headY - size * 0.04);
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.08,
    headX + size * 0.14,
    headY - size * 0.04,
  );
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.05,
    headX - size * 0.14,
    headY - size * 0.04,
  );
  ctx.fill();

  // Center gem on headband
  setShadowBlur(ctx, 3 * zoom, bodyColor);
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.065, size * 0.015, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Wing crests on headband
  for (const ws of [-1, 1]) {
    const wingX = headX + ws * size * 0.14;
    const wingY = headY - size * 0.05;
    const wingFlutter = Math.sin(time * 6 + ws) * size * 0.005;
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(wingX, wingY + size * 0.02);
    ctx.bezierCurveTo(
      wingX + ws * size * 0.06,
      wingY - size * 0.02 + wingFlutter,
      wingX + ws * size * 0.12,
      wingY - size * 0.08 + wingFlutter,
      wingX + ws * size * 0.14,
      wingY - size * 0.15 + wingFlutter,
    );
    ctx.bezierCurveTo(
      wingX + ws * size * 0.1,
      wingY - size * 0.06 + wingFlutter,
      wingX + ws * size * 0.05,
      wingY + size * 0.0,
      wingX,
      wingY + size * 0.02,
    );
    ctx.fill();
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(wingX + ws * size * 0.03, wingY);
    ctx.lineTo(wingX + ws * size * 0.1, wingY - size * 0.1 + wingFlutter);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(wingX + ws * size * 0.02, wingY + size * 0.01);
    ctx.lineTo(wingX + ws * size * 0.08, wingY - size * 0.05 + wingFlutter);
    ctx.stroke();
  }

  // Short swept-back hair
  ctx.fillStyle = "#3a2a18";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY - size * 0.08);
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.18,
    headX + size * 0.1,
    headY - size * 0.08,
  );
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.12,
    headX - size * 0.1,
    headY - size * 0.08,
  );
  ctx.fill();

  // Effects
  drawLeafSwirl(ctx, cx, y + size * 0.35 - bodyBob, size * 0.2, time, zoom, {
    color: "rgba(255, 180, 60, 0.5)",
    colorAlt: "rgba(255, 220, 80, 0.4)",
    count: 5,
    speed: 3,
    maxAlpha: isAttacking ? 0.55 : 0.35,
    leafSize: 0.1,
  });

  drawOrbitingDebris(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(255, 200, 80, 0.55)",
    glowColor: "rgba(255, 220, 100, 0.25)",
    count: isAttacking ? 8 : 5,
    speed: isAttacking ? 4 : 2.5,
    particleSize: 0.014,
    minRadius: 0.3,
    maxRadius: 0.5,
    trailLen: 3,
  });

  drawShiftingSegments(ctx, cx, y - size * 0.15 - bodyBob, size, time, zoom, {
    color: bodyColor,
    colorAlt: bodyColorLight,
    count: 5,
    orbitRadius: 0.35,
    segmentSize: 0.022,
    orbitSpeed: 2.0,
    shape: "diamond",
  });

  // Eye glow
  setShadowBlur(ctx, 8 * zoom, bodyColor);
  ctx.fillStyle = bodyColor;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.05,
      headY - size * 0.015,
      size * 0.008,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Attack: Sprint burst
  if (isAttacking) {
    const force = attackPhase;
    const burstR = size * 0.2 + (1 - force) * size * 0.5;
    ctx.strokeStyle = `rgba(255, 200, 60, ${force * 0.4})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.35, burstR, burstR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    for (let rb = 0; rb < 8; rb++) {
      const rbAngle = (rb / 8) * TAU + time * 3;
      const rbInner = size * 0.15;
      const rbOuter = size * 0.15 + (1 - force) * size * 0.35;
      ctx.strokeStyle = `rgba(255, 220, 100, ${force * 0.25})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(rbAngle) * rbInner,
        y + size * 0.1 + Math.sin(rbAngle) * rbInner * ISO_Y_RATIO,
      );
      ctx.lineTo(
        cx + Math.cos(rbAngle) * rbOuter,
        y + size * 0.1 + Math.sin(rbAngle) * rbOuter * ISO_Y_RATIO,
      );
      ctx.stroke();
    }
  }

  drawRegionBodyAccent(ctx, cx, y - bodyBob, size, region, time, zoom);
}

// ============================================================================
// 2. TIGER FAN — BARBARIAN HERALD
//    Fur-trimmed barbarian vest, tiger cowl/mask, war banner + shield
// ============================================================================

export function drawTigerFanEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  region: MapTheme = "grassland",
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = isAttacking ? 1.4 : 1;
  const breath = getBreathScale(time, 1.4, 0.015);
  const sway = getIdleSway(time, 0.9, size * 0.004, size * 0.003);
  const marchBob = Math.abs(Math.sin(time * 7 * attackIntensity)) * 3 * zoom;
  const armRaise =
    0.1 +
    Math.abs(Math.sin(time * 4 * attackIntensity)) *
      (isAttacking ? 0.25 : 0.15);
  const cx = x + sway.dx;
  const bodyBob = marchBob + sway.dy;

  let fur = "#c4a060";
  let furDark = "#8a6830";
  let leather = "#5a3a20";
  let leatherDark = "#3e2815";
  const bannerForeLen = 0.14;

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    fur = rm.cloth.base;
    furDark = rm.cloth.dark;
    leather = rm.leather.base;
    leatherDark = rm.leather.dark;
  }

  // Legs — leather-wrapped barbarian
  drawPathLegs(ctx, cx, y + size * 0.12 - bodyBob, size, time, zoom, {
    color: leather,
    colorDark: leatherDark,
    footColor: leatherDark,
    trimColor: bodyColor,
    strideSpeed: 7 * attackIntensity,
    strideAmt: 0.25,
    legLen: 0.22,
    width: 0.09,
    footLen: 0.11,
    style: "fleshy",
    garb: false,
  });

  // Fur loincloth / waist wrap (NOT armor skirt)
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.18, y + size * 0.02 - bodyBob);
  for (let f = 0; f < 7; f++) {
    const fx = cx - size * 0.18 + f * size * 0.06;
    const fy =
      y +
      size * 0.02 +
      size * 0.08 +
      Math.sin(time * 3 + f * 1.4) * size * 0.01 +
      (f % 2) * size * 0.02;
    ctx.lineTo(fx, fy - bodyBob);
  }
  ctx.lineTo(cx + size * 0.18, y + size * 0.02 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Fur texture dashes
  ctx.strokeStyle = furDark;
  ctx.lineWidth = 0.8 * zoom;
  for (let d = 0; d < 8; d++) {
    const dx = cx - size * 0.14 + d * size * 0.04;
    const dy = y + size * 0.04 - bodyBob;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + size * 0.01, dy + size * 0.04);
    ctx.stroke();
  }

  // Barbarian fur vest body (NOT plate cuirass)
  ctx.save();
  ctx.translate(cx, y - size * 0.08 - bodyBob);
  ctx.scale(breath, breath);
  ctx.translate(-cx, -(y - size * 0.08 - bodyBob));

  // Muscular torso base
  const torsoGrad = ctx.createLinearGradient(
    cx - size * 0.2,
    y - size * 0.3,
    cx + size * 0.2,
    y + size * 0.06,
  );
  torsoGrad.addColorStop(0, "#a08060");
  torsoGrad.addColorStop(0.4, "#c4a878");
  torsoGrad.addColorStop(0.6, "#c4a878");
  torsoGrad.addColorStop(1, "#a08060");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, y + size * 0.06 - bodyBob);
  ctx.bezierCurveTo(
    cx - size * 0.26,
    y - size * 0.05 - bodyBob,
    cx - size * 0.24,
    y - size * 0.2 - bodyBob,
    cx - size * 0.18,
    y - size * 0.3 - bodyBob,
  );
  ctx.bezierCurveTo(
    cx - size * 0.1,
    y - size * 0.34 - bodyBob,
    cx + size * 0.1,
    y - size * 0.34 - bodyBob,
    cx + size * 0.18,
    y - size * 0.3 - bodyBob,
  );
  ctx.bezierCurveTo(
    cx + size * 0.24,
    y - size * 0.2 - bodyBob,
    cx + size * 0.26,
    y - size * 0.05 - bodyBob,
    cx + size * 0.22,
    y + size * 0.06 - bodyBob,
  );
  ctx.closePath();
  ctx.fill();

  // Open-front fur vest over torso
  const vestGrad = ctx.createLinearGradient(
    cx - size * 0.25,
    y,
    cx + size * 0.25,
    y,
  );
  vestGrad.addColorStop(0, furDark);
  vestGrad.addColorStop(0.15, fur);
  vestGrad.addColorStop(0.35, furDark);
  vestGrad.addColorStop(0.65, furDark);
  vestGrad.addColorStop(0.85, fur);
  vestGrad.addColorStop(1, furDark);
  ctx.fillStyle = vestGrad;
  // Left panel
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, y + size * 0.05 - bodyBob);
  ctx.lineTo(cx - size * 0.2, y - size * 0.28 - bodyBob);
  ctx.lineTo(cx - size * 0.04, y - size * 0.28 - bodyBob);
  ctx.lineTo(cx - size * 0.06, y + size * 0.04 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Right panel
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.22, y + size * 0.05 - bodyBob);
  ctx.lineTo(cx + size * 0.2, y - size * 0.28 - bodyBob);
  ctx.lineTo(cx + size * 0.04, y - size * 0.28 - bodyBob);
  ctx.lineTo(cx + size * 0.06, y + size * 0.04 - bodyBob);
  ctx.closePath();
  ctx.fill();

  // Fur trim along vest edges
  ctx.fillStyle = fur;
  for (const side of [-1, 1]) {
    for (let ft = 0; ft < 6; ft++) {
      const ftx = cx + side * size * 0.05;
      const fty = y - size * 0.26 + ft * size * 0.06 - bodyBob;
      ctx.beginPath();
      ctx.ellipse(ftx, fty, size * 0.015, size * 0.01, 0, 0, TAU);
      ctx.fill();
    }
  }

  // Tiger stripe paint on vest
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (const side of [-1, 1]) {
    const baseX = cx + side * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(baseX, y - size * 0.22 - bodyBob);
    ctx.quadraticCurveTo(
      baseX + side * size * 0.02,
      y - size * 0.12 - bodyBob,
      baseX,
      y - size * 0.04 - bodyBob,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(baseX + side * size * 0.04, y - size * 0.18 - bodyBob);
    ctx.quadraticCurveTo(
      baseX + side * size * 0.05,
      y - size * 0.1 - bodyBob,
      baseX + side * size * 0.03,
      y - size * 0.02 - bodyBob,
    );
    ctx.stroke();
  }

  // Tiger emblem on chest (bone medallion)
  const embY = y - size * 0.1 - bodyBob;
  ctx.fillStyle = "#e8d8c0";
  ctx.beginPath();
  ctx.arc(cx, embY, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = furDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  // Tiger face on medallion
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(cx, embY, size * 0.025, 0, TAU);
  ctx.stroke();
  for (const es of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + es * size * 0.015, embY - size * 0.015);
    ctx.lineTo(cx + es * size * 0.02, embY - size * 0.025);
    ctx.stroke();
  }

  ctx.restore();

  // Bone / fur shoulder pads (NOT plate pauldrons)
  for (const side of [-1, 1]) {
    const spX = cx + side * size * 0.22;
    const spY = y - size * 0.28 - bodyBob;
    // Fur base
    ctx.fillStyle = fur;
    ctx.beginPath();
    ctx.ellipse(spX, spY, size * 0.06, size * 0.04, side * 0.3, 0, TAU);
    ctx.fill();
    // Bone spikes
    ctx.fillStyle = "#e8d8c0";
    for (let sp = 0; sp < 2; sp++) {
      const sAngle = side * (0.3 + sp * 0.6) - Math.PI * 0.3;
      ctx.beginPath();
      ctx.moveTo(
        spX + Math.cos(sAngle) * size * 0.04,
        spY + Math.sin(sAngle) * size * 0.03,
      );
      ctx.lineTo(
        spX + Math.cos(sAngle) * size * 0.08,
        spY + Math.sin(sAngle) * size * 0.04 - size * 0.02,
      );
      ctx.lineTo(
        spX + Math.cos(sAngle) * size * 0.05,
        spY + Math.sin(sAngle) * size * 0.035,
      );
      ctx.fill();
    }
  }

  // Leather belt with bone buckle
  ctx.fillStyle = leatherDark;
  ctx.fillRect(
    cx - size * 0.18,
    y + size * 0.0 - bodyBob,
    size * 0.36,
    size * 0.025,
  );
  ctx.fillStyle = "#e8d8c0";
  ctx.beginPath();
  ctx.arc(cx, y + size * 0.012 - bodyBob, size * 0.018, 0, TAU);
  ctx.fill();

  // Left arm — kite shield
  drawPathArm(
    ctx,
    cx - size * 0.26,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: leather,
      colorDark: leatherDark,
      handColor: "#c4a878",
      trimColor: bodyColor,
      upperLen: 0.16,
      foreLen: bannerForeLen,
      width: 0.08,
      shoulderAngle:
        0.3 +
        Math.sin(time * 3) * 0.04 +
        (isAttacking ? -attackIntensity * 0.25 : 0),
      elbowAngle: 0.4 + (isAttacking ? -attackIntensity * 0.2 : 0),
      style: "fleshy",
      onWeapon: (wCtx) => {
        const handY = bannerForeLen * size;
        wCtx.translate(0, handY * 0.6);
        const shW = size * 0.15;
        const shH = size * 0.22;
        const shGrad = wCtx.createLinearGradient(
          -shW,
          -shH * 0.3,
          shW,
          shH * 0.3,
        );
        shGrad.addColorStop(0, leatherDark);
        shGrad.addColorStop(0.3, leather);
        shGrad.addColorStop(0.7, leather);
        shGrad.addColorStop(1, leatherDark);
        wCtx.fillStyle = shGrad;
        wCtx.beginPath();
        wCtx.moveTo(0, -shH);
        wCtx.quadraticCurveTo(shW, -shH * 0.6, shW * 0.9, 0);
        wCtx.quadraticCurveTo(shW * 0.6, shH * 0.7, 0, shH);
        wCtx.quadraticCurveTo(-shW * 0.6, shH * 0.7, -shW * 0.9, 0);
        wCtx.quadraticCurveTo(-shW, -shH * 0.6, 0, -shH);
        wCtx.closePath();
        wCtx.fill();
        wCtx.strokeStyle = furDark;
        wCtx.lineWidth = size * 0.012;
        wCtx.stroke();
        // Tiger stripe on shield
        wCtx.fillStyle = bodyColor;
        wCtx.beginPath();
        wCtx.moveTo(-shW * 0.8, -shH * 0.1);
        wCtx.quadraticCurveTo(0, -shH * 0.2, shW * 0.8, -shH * 0.1);
        wCtx.quadraticCurveTo(0, shH * 0.0, -shW * 0.8, -shH * 0.1);
        wCtx.fill();
        // Paw print boss
        const bossGrad = wCtx.createRadialGradient(0, 0, 0, 0, 0, size * 0.05);
        bossGrad.addColorStop(0, bodyColorLight);
        bossGrad.addColorStop(0.7, bodyColor);
        bossGrad.addColorStop(1, bodyColorDark);
        wCtx.fillStyle = bossGrad;
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.05, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = "#fff";
        wCtx.beginPath();
        wCtx.arc(0, size * 0.005, size * 0.02, 0, TAU);
        wCtx.fill();
        for (let toe = 0; toe < 3; toe++) {
          const tAngle = -0.8 + toe * 0.5;
          wCtx.beginPath();
          wCtx.arc(
            Math.cos(tAngle) * size * 0.028,
            Math.sin(tAngle) * size * 0.028 - size * 0.005,
            size * 0.009,
            0,
            TAU,
          );
          wCtx.fill();
        }
      },
    },
  );

  // HEAD — Tiger cowl/mask (drawn before banner so flag overlaps head)
  const headX = cx;
  const headY = y - size * 0.5 - bodyBob;

  // Base face
  const faceGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.02,
    0,
    headX,
    headY,
    size * 0.14,
  );
  faceGrad.addColorStop(0, "#e0c498");
  faceGrad.addColorStop(0.7, "#c4a070");
  faceGrad.addColorStop(1, "#a08050");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.14, 0, TAU);
  ctx.fill();

  // War paint stripes (orange tiger stripes across face)
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 2.5 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.03, headY - size * 0.06);
    ctx.quadraticCurveTo(
      headX + side * size * 0.08,
      headY - size * 0.02,
      headX + side * size * 0.1,
      headY + size * 0.04,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.05, headY - size * 0.04);
    ctx.lineTo(headX + side * size * 0.12, headY + size * 0.0);
    ctx.stroke();
  }

  // Fierce eyes
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(
      headX + side * size * 0.05,
      headY - size * 0.015,
      size * 0.022,
      size * 0.016,
      0,
      0,
      TAU,
    );
    ctx.fill();
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.05,
      headY - size * 0.015,
      size * 0.01,
      0,
      TAU,
    );
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(
      headX + side * size * 0.05,
      headY - size * 0.015,
      size * 0.005,
      0,
      TAU,
    );
    ctx.fill();
  }

  // War cry open mouth
  ctx.fillStyle = "#4a2020";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.06, size * 0.035, size * 0.02, 0, 0, TAU);
  ctx.fill();

  // Tiger fur cowl/hood draped over head
  const cowlGrad = ctx.createRadialGradient(
    headX,
    headY - size * 0.08,
    0,
    headX,
    headY,
    size * 0.22,
  );
  cowlGrad.addColorStop(0, bodyColor);
  cowlGrad.addColorStop(0.5, bodyColorDark);
  cowlGrad.addColorStop(1, "#3a2010");
  ctx.fillStyle = cowlGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.16, headY + size * 0.04);
  ctx.quadraticCurveTo(
    headX - size * 0.2,
    headY - size * 0.08,
    headX - size * 0.14,
    headY - size * 0.16,
  );
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.24,
    headX + size * 0.14,
    headY - size * 0.16,
  );
  ctx.quadraticCurveTo(
    headX + size * 0.2,
    headY - size * 0.08,
    headX + size * 0.16,
    headY + size * 0.04,
  );
  ctx.quadraticCurveTo(
    headX + size * 0.1,
    headY - size * 0.02,
    headX + size * 0.08,
    headY - size * 0.06,
  );
  ctx.quadraticCurveTo(
    headX,
    headY - size * 0.1,
    headX - size * 0.08,
    headY - size * 0.06,
  );
  ctx.quadraticCurveTo(
    headX - size * 0.1,
    headY - size * 0.02,
    headX - size * 0.16,
    headY + size * 0.04,
  );
  ctx.fill();

  // Tiger stripes on cowl
  ctx.strokeStyle = "#3a2010";
  ctx.lineWidth = 2 * zoom;
  for (const ps of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + ps * size * 0.06, headY - size * 0.18);
    ctx.quadraticCurveTo(
      headX + ps * size * 0.1,
      headY - size * 0.12,
      headX + ps * size * 0.08,
      headY - size * 0.04,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headX + ps * size * 0.04, headY - size * 0.2);
    ctx.lineTo(headX + ps * size * 0.06, headY - size * 0.14);
    ctx.stroke();
  }

  // Tiger ears on cowl
  for (const side of [-1, 1]) {
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.1, headY - size * 0.14);
    ctx.lineTo(headX + side * size * 0.14, headY - size * 0.24);
    ctx.lineTo(headX + side * size * 0.16, headY - size * 0.14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#e8c0a0";
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.11, headY - size * 0.15);
    ctx.lineTo(headX + side * size * 0.14, headY - size * 0.21);
    ctx.lineTo(headX + side * size * 0.15, headY - size * 0.15);
    ctx.closePath();
    ctx.fill();
  }

  // Eye glow
  setShadowBlur(ctx, 6 * zoom, bodyColor);
  ctx.fillStyle = bodyColor;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.05,
      headY - size * 0.015,
      size * 0.008,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Right arm — war banner (drawn after head so flag overlaps)
  const bannerSwing =
    Math.sin(time * 4.5 * attackIntensity) * (isAttacking ? 0.08 : 0.05);
  drawPathArm(
    ctx,
    cx + size * 0.26,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: leather,
      colorDark: leatherDark,
      handColor: "#c4a878",
      trimColor: bodyColor,
      upperLen: 0.16,
      foreLen: bannerForeLen,
      width: 0.08,
      shoulderAngle:
        -(armRaise + 0.55) + Math.sin(time * 4 * attackIntensity) * 0.06,
      elbowAngle: -0.25,
      style: "fleshy",
      onWeapon: (wCtx) => {
        const handY = bannerForeLen * size;
        wCtx.translate(0, handY * 0.7);
        const poleLen = size * 0.6;
        const pGrad = wCtx.createLinearGradient(
          -size * 0.015,
          0,
          size * 0.015,
          0,
        );
        pGrad.addColorStop(0, "#4a3728");
        pGrad.addColorStop(0.4, "#8b6e5a");
        pGrad.addColorStop(1, "#4a3728");
        wCtx.strokeStyle = pGrad;
        wCtx.lineWidth = 4 * zoom;
        wCtx.lineCap = "round";
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.1);
        wCtx.lineTo(bannerSwing * size * 2, -poleLen);
        wCtx.stroke();
        wCtx.lineCap = "butt";
        const tipX = bannerSwing * size * 2;
        const tipY = -poleLen;
        wCtx.fillStyle = "#e8d8c0";
        wCtx.beginPath();
        wCtx.moveTo(tipX, tipY - size * 0.06);
        wCtx.lineTo(tipX - size * 0.02, tipY);
        wCtx.lineTo(tipX + size * 0.02, tipY);
        wCtx.closePath();
        wCtx.fill();
        const bTopY = -poleLen + size * 0.08;
        const bBotY = -poleLen + size * 0.32;
        const bW = -size * 0.24;
        const wave1 = Math.sin(time * 4.5 * attackIntensity) * size * 0.04;
        const wave2 =
          Math.sin(time * 4.5 * attackIntensity + 1.5) * size * 0.05;
        const bGrad = wCtx.createLinearGradient(0, bTopY, bW, bBotY);
        bGrad.addColorStop(0, bodyColorDark);
        bGrad.addColorStop(0.3, bodyColor);
        bGrad.addColorStop(0.7, bodyColor);
        bGrad.addColorStop(1, bodyColorDark);
        wCtx.fillStyle = bGrad;
        wCtx.beginPath();
        wCtx.moveTo(bannerSwing * size * 0.5, bTopY);
        wCtx.bezierCurveTo(
          bW * 0.3 - wave1 * 0.5,
          bTopY + (bBotY - bTopY) * 0.3,
          bW * 0.7 - wave1,
          bTopY + (bBotY - bTopY) * 0.5,
          bW - wave2,
          bTopY + (bBotY - bTopY) * 0.5,
        );
        wCtx.bezierCurveTo(
          bW * 0.8 - wave2,
          bTopY + (bBotY - bTopY) * 0.75,
          bW * 0.4 - wave1,
          bBotY - size * 0.02,
          bannerSwing * size * 0.5,
          bBotY,
        );
        wCtx.closePath();
        wCtx.fill();
        wCtx.strokeStyle = bodyColorLight;
        wCtx.lineWidth = 2 * zoom;
        wCtx.stroke();
        wCtx.save();
        const textCx = bW * 0.45 - wave1 * 0.5;
        const textCy = (bTopY + bBotY) * 0.5;
        wCtx.translate(textCx, textCy);
        wCtx.rotate(Math.atan2(-wave2, -bW) * 0.3);
        wCtx.fillStyle = "#fff";
        wCtx.font = `bold ${size * 0.05}px serif`;
        wCtx.textAlign = "center";
        wCtx.textBaseline = "middle";
        wCtx.fillText("GO", 0, -size * 0.04);
        wCtx.font = `bold ${size * 0.04}px serif`;
        wCtx.fillText("TIGERS", 0, size * 0.02);
        wCtx.restore();
        wCtx.strokeStyle = bodyColorLight;
        wCtx.lineWidth = 1.2 * zoom;
        for (let fr = 0; fr < 5; fr++) {
          const t = (fr + 0.5) / 5;
          const frX =
            bannerSwing * size * 0.5 * (1 - t) + (bW * 0.4 - wave1) * t;
          const frY = bBotY - size * 0.01 + t * size * 0.02;
          const frDangle = Math.sin(time * 5 + fr * 1.3) * size * 0.01;
          wCtx.beginPath();
          wCtx.moveTo(frX, frY);
          wCtx.lineTo(frX + frDangle, frY + size * 0.04);
          wCtx.stroke();
        }
      },
    },
  );

  // War cry aura waves (drawn after banner)
  ctx.lineWidth = 1.8 * zoom;
  for (let wave = 0; wave < 3; wave++) {
    const wavePhase = (time * 0.7 + wave * 0.45) % 1.5;
    const waveR = size * 0.08 + wavePhase * size * 0.22;
    const waveAlpha = 0.22 * (1 - wavePhase / 1.5);
    ctx.strokeStyle = `rgba(239, 68, 68, ${waveAlpha})`;
    ctx.beginPath();
    ctx.arc(headX, headY + size * 0.1, waveR, Math.PI * 0.6, Math.PI * 1.4);
    ctx.stroke();
  }

  // Crowd energy aura
  ctx.lineWidth = 1.5 * zoom;
  for (let aura = 0; aura < 2; aura++) {
    const auraPhase = (time * 0.55 + aura * 0.6) % 1.5;
    const auraR = size * 0.25 + auraPhase * size * 0.35;
    ctx.globalAlpha = 0.18 * (1 - auraPhase / 1.5);
    ctx.strokeStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.1, auraR, auraR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Attack: War cry slam
  if (isAttacking) {
    const slamForce = attackPhase;
    ctx.strokeStyle = `rgba(239, 68, 68, ${slamForce * 0.45})`;
    ctx.lineWidth = 2.5 * zoom;
    const impactR = size * 0.3 + (1 - slamForce) * size * 0.45;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.3, impactR, impactR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
    for (let sl = 0; sl < 6; sl++) {
      const slAngle = (sl / 6) * TAU;
      const slInner = size * 0.2;
      const slOuter = size * 0.2 + (1 - slamForce) * size * 0.3;
      ctx.strokeStyle = `rgba(239, 68, 68, ${slamForce * 0.25})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        cx + Math.cos(slAngle) * slInner,
        y + size * 0.3 + Math.sin(slAngle) * slInner * ISO_Y_RATIO,
      );
      ctx.lineTo(
        cx + Math.cos(slAngle) * slOuter,
        y + size * 0.3 + Math.sin(slAngle) * slOuter * ISO_Y_RATIO,
      );
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(249, 115, 22, ${slamForce * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      y + size * 0.1,
      size * 0.2 * slamForce,
      size * 0.25 * slamForce,
      0,
      0,
      TAU,
    );
    ctx.fill();
  }

  drawRegionBodyAccent(ctx, cx, y - bodyBob, size, region, time, zoom);
}
