import type { Position } from "../../types";

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  MORPH TRANSITION SYSTEM (Normal ↔ Blue Inferno)         ║
// ╚════════════════════════════════════════════════════════════════════════════╝

const BLUE_INFERNO_DURATION_MS = 6000;
const MORPH_DURATION_MS = 900;

function getMorphProgress(abilityEnd: number): number {
  const now = Date.now();
  const abilityStart = abilityEnd - BLUE_INFERNO_DURATION_MS;
  const elapsed = now - abilityStart;
  const remaining = abilityEnd - now;

  if (elapsed < 0) return 0;
  if (remaining < 0) return 0;

  if (elapsed < MORPH_DURATION_MS) {
    return elapsed / MORPH_DURATION_MS;
  }
  if (remaining < MORPH_DURATION_MS) {
    return remaining / MORPH_DURATION_MS;
  }
  return 1.0;
}

function drawFireMorphTransition(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, morphT: number,
  toBlue: boolean,
) {
  const coverage = morphT;

  // Fire tendrils converging from edges
  const tendrilCount = Math.floor(8 + coverage * 16);
  for (let i = 0; i < tendrilCount; i++) {
    const angle = (i / tendrilCount) * Math.PI * 2 + time * 0.8;
    const outerR = s * 0.7;
    const innerR = s * (0.7 - coverage * 0.6);
    const ox = x + Math.cos(angle) * outerR;
    const oy = y + Math.sin(angle) * outerR * 0.5;
    const ix = x + Math.cos(angle + coverage * 0.6) * innerR;
    const iy = y + Math.sin(angle + coverage * 0.6) * innerR * 0.5;
    const sway = Math.sin(time * 5 + i * 1.5) * s * 0.03 * coverage;

    const fromRGB = toBlue ? "255,140,30" : "59,130,246";
    const toRGB = toBlue ? "59,130,246" : "255,140,30";
    const mixedR = `rgba(${lerpColorStr(fromRGB, toRGB, coverage)},${0.2 + coverage * 0.5})`;

    ctx.strokeStyle = mixedR;
    ctx.lineWidth = (2 + coverage * 3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.quadraticCurveTo(
      (ox + ix) / 2 + sway, (oy + iy) / 2 + sway,
      ix, iy,
    );
    ctx.stroke();

    if (i % 2 === 0) {
      ctx.fillStyle = `rgba(${toBlue ? "147,197,253" : "255,200,80"},${0.3 + coverage * 0.4})`;
      ctx.beginPath();
      ctx.arc(ix, iy, s * 0.012 * zoom, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Converging ember particles
  const emberCount = Math.floor(coverage * 20);
  for (let i = 0; i < emberCount; i++) {
    const phase = (time * 2.0 + i * 0.2) % 1;
    const angle = (i / Math.max(emberCount, 1)) * Math.PI * 2 + time * 1.2;
    const dist = s * (0.55 * (1 - coverage * 0.85) + (1 - phase) * 0.2);
    const ex = x + Math.cos(angle) * dist;
    const ey = y + Math.sin(angle) * dist * 0.5;
    const eAlpha = coverage * Math.sin(phase * Math.PI) * 0.6;

    const emberColor = toBlue ? "191,219,254" : "255,220,100";
    ctx.fillStyle = `rgba(${emberColor},${eAlpha})`;
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(time * 4 + i * 1.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.012 * zoom, s * 0.005 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Bright flash at peak coverage
  if (coverage > 0.8) {
    const flashIntensity = (coverage - 0.8) / 0.2;
    const flashAlpha = flashIntensity * 0.55;
    const flashGrad = ctx.createRadialGradient(x, y, 0, x, y, s * 0.55);
    if (toBlue) {
      flashGrad.addColorStop(0, `rgba(224,240,255,${flashAlpha})`);
      flashGrad.addColorStop(0.4, `rgba(96,165,250,${flashAlpha * 0.5})`);
      flashGrad.addColorStop(1, "rgba(59,130,246,0)");
    } else {
      flashGrad.addColorStop(0, `rgba(255,255,220,${flashAlpha})`);
      flashGrad.addColorStop(0.4, `rgba(255,180,60,${flashAlpha * 0.5})`);
      flashGrad.addColorStop(1, "rgba(230,100,20,0)");
    }
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  // Color wash ring expanding/contracting
  const ringR = s * (0.3 + coverage * 0.35 + Math.sin(time * 6) * 0.03);
  const ringColor = toBlue ? "59,130,246" : "255,160,40";
  ctx.strokeStyle = `rgba(${ringColor},${coverage * 0.4})`;
  ctx.lineWidth = (1.5 + coverage * 2) * zoom;
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.stroke();
}

function lerpColorStr(fromRGB: string, toRGB: string, t: number): string {
  const f = fromRGB.split(",").map(Number);
  const to = toRGB.split(",").map(Number);
  const r = Math.round(f[0] + (to[0] - f[0]) * t);
  const g = Math.round(f[1] + (to[1] - f[1]) * t);
  const b = Math.round(f[2] + (to[2] - f[2]) * t);
  return `${r},${g},${b}`;
}

export function drawNassauHero(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  targetPos?: Position,
  abilityActive?: boolean,
  abilityEnd?: number,
) {
  const s = size;
  const blue = abilityActive ?? false;

  const morphT = (blue && abilityEnd != null) ? getMorphProgress(abilityEnd) : -1;

  // Transitioning between forms (morphT 0→1 on enter, 1→0 on exit)
  if (blue && morphT > 0 && morphT < 1) {
    const showBlue = morphT >= 0.5;
    drawNassauForm(ctx, x, y, s, time, zoom, attackPhase, targetPos, showBlue);
    drawFireMorphTransition(ctx, x, y, s, time, zoom, morphT, showBlue);
    return;
  }

  drawNassauForm(ctx, x, y, s, time, zoom, attackPhase, targetPos, blue);
}

function drawNassauForm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  attackPhase: number,
  targetPos: Position | undefined,
  blue: boolean,
) {
  const isAttacking = attackPhase > 0 || blue;
  const attackIntensity = blue ? Math.max(attackPhase, 0.4) : attackPhase;
  const atkPow = isAttacking ? attackIntensity : 0;
  const atkBurst = Math.sin(atkPow * Math.PI);
  const blueBoost = blue ? 0.4 : 0;
  const flamePulse =
    Math.sin(time * 4) * 0.5 + 0.5 + atkBurst * 0.3 + blueBoost;
  const wingFlap =
    Math.sin(time * 7) * (0.55 + atkBurst * 0.25 + blueBoost * 0.3);
  const breathe = Math.sin(time * 2) * (2 + atkBurst * 3 + blueBoost * 3);
  const hover = Math.sin(time * 2.5) * s * (0.04 + atkBurst * 0.02);
  const bodyGlow =
    0.6 + Math.sin(time * 3) * 0.2 + atkBurst * 0.3 + blueBoost * 0.3;
  const gemPulse = Math.sin(time * 5) * 0.5 + 0.5;
  const bodyRock = isAttacking
    ? Math.sin(attackIntensity * Math.PI) * s * 0.012
    : 0;

  const cy = y + hover;
  const bx = x + bodyRock;

  if (blue) {
    drawBlueInfernoAura(ctx, bx, cy, s, time, zoom);
  }

  drawHeatDistortion(ctx, bx, cy, s, time, zoom, atkBurst, blue);
  drawFireTrail(ctx, bx, cy, s, time, flamePulse, zoom, atkBurst, blue);
  drawWings(ctx, bx, cy, s, time, zoom, wingFlap, isAttacking, attackIntensity, "back", blue);
  drawTailPlumage(ctx, bx, cy, s, time, zoom, flamePulse, isAttacking, atkBurst, blue);
  drawCapeStraps(ctx, bx, cy, s, time, zoom, flamePulse, blue);
  drawBody(ctx, bx, cy, s, breathe, time, flamePulse, zoom, bodyGlow, isAttacking, atkBurst, blue);
  drawArmorPlates(ctx, bx, cy, s, time, zoom, flamePulse, gemPulse, blue);
  drawHarness(ctx, bx, cy, s, time, zoom, gemPulse, blue);
  drawShoulderPauldrons(ctx, bx, cy, s, time, zoom, flamePulse, gemPulse, blue);
  drawNeck(ctx, bx, cy, s, time, zoom, flamePulse, targetPos, blue);
  drawHelmet(ctx, bx, cy, s, time, zoom, flamePulse, gemPulse, isAttacking, attackIntensity, targetPos, blue);
  drawWings(ctx, bx, cy, s, time, zoom, wingFlap, isAttacking, attackIntensity, "front", blue);
  drawTalons(ctx, bx, cy, s, time, zoom, isAttacking, attackIntensity);
  drawWingFireCascade(ctx, bx, cy, s, time, zoom, wingFlap, flamePulse, blue);
  drawFireAura(ctx, bx, cy, s, time, flamePulse, isAttacking, zoom, blue);
  if (isAttacking) {
    drawAttackFlare(ctx, bx, cy, s, attackIntensity, time, zoom, blue);
  }
}

// ─── BLUE INFERNO AURA ──────────────────────────────────────────────────────

function drawBlueInfernoAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
) {
  const pulseR = s * (0.9 + Math.sin(time * 6) * 0.15);
  const grad = ctx.createRadialGradient(x, y, s * 0.1, x, y, pulseR);
  grad.addColorStop(0, "rgba(59,130,246,0.25)");
  grad.addColorStop(0.4, "rgba(96,165,250,0.12)");
  grad.addColorStop(0.7, "rgba(147,197,253,0.06)");
  grad.addColorStop(1, "rgba(59,130,246,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, pulseR, 0, Math.PI * 2);
  ctx.fill();

  const sparkCount = 12;
  for (let i = 0; i < sparkCount; i++) {
    const a = (i / sparkCount) * Math.PI * 2 + time * 3;
    const r = s * (0.5 + Math.sin(time * 5 + i * 1.3) * 0.2);
    const sx = x + Math.cos(a) * r;
    const sy = y + Math.sin(a) * r * 0.6;
    const sparkSize = (1.5 + Math.sin(time * 8 + i) * 0.8) * zoom;
    ctx.fillStyle = `rgba(224,240,255,${0.5 + Math.sin(time * 7 + i * 2) * 0.3})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── HEAT DISTORTION (subtle background shimmer) ────────────────────────────

function drawHeatDistortion(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  atkBurst: number = 0,
  blue: boolean = false,
) {
  const count = 5 + Math.floor(atkBurst * 4) + (blue ? 4 : 0);
  for (let i = 0; i < count; i++) {
    const shimmerY = y - s * 0.1 - i * s * (0.12 + atkBurst * 0.04);
    const shimmerX =
      x + Math.sin(time * 3 + i * 1.8) * s * (0.06 + atkBurst * 0.03);
    const shimmerAlpha = 0.04 + atkBurst * 0.03 - i * 0.005 + (blue ? 0.02 : 0);
    const shimmerW = s * (0.4 + atkBurst * 0.15 - i * 0.04);

    if (blue) {
      ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(shimmerAlpha, 0)})`;
    } else {
      ctx.fillStyle = `rgba(255, ${200 - Math.floor(atkBurst * 60)}, ${100 - Math.floor(atkBurst * 60)}, ${Math.max(shimmerAlpha, 0)})`;
    }
    ctx.beginPath();
    ctx.ellipse(
      shimmerX,
      shimmerY,
      shimmerW,
      s * (0.03 + atkBurst * 0.01),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

// ─── FIRE TRAIL ─────────────────────────────────────────────────────────────

function drawFireTrail(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  flamePulse: number,
  zoom: number,
  atkBurst: number = 0,
  blue: boolean = false,
) {
  const count = 15 + Math.floor(atkBurst * 10) + (blue ? 8 : 0);
  const speed = 2.5 + atkBurst * 3 + (blue ? 2 : 0);
  const spread = 0.2 + atkBurst * 0.14;
  const sizeBoost = 1.1 + atkBurst * 0.7 + (blue ? 0.4 : 0);

  for (let i = 0; i < count; i++) {
    const trailPhase = (time * speed + i * (0.22 - atkBurst * 0.05)) % 1;
    const trailY = y + s * 0.35 + trailPhase * s * (0.7 + atkBurst * 0.3);
    const trailX =
      x + Math.sin(time * (3.5 + atkBurst * 3) + i * 1.0) * s * spread;
    const trailAlpha =
      (1 - trailPhase) * (0.5 + atkBurst * 0.25) * (0.7 + flamePulse * 0.3);
    const trailSize = (1 - trailPhase) * s * 0.09 * sizeBoost;

    const grad = ctx.createRadialGradient(
      trailX,
      trailY,
      0,
      trailX,
      trailY,
      trailSize,
    );
    if (blue) {
      grad.addColorStop(0, `rgba(224, 240, 255, ${trailAlpha})`);
      grad.addColorStop(0.35, `rgba(96, 165, 250, ${trailAlpha * 0.7})`);
      grad.addColorStop(0.7, `rgba(59, 130, 246, ${trailAlpha * 0.4})`);
      grad.addColorStop(1, "rgba(29, 78, 216, 0)");
    } else {
      grad.addColorStop(
        0,
        `rgba(255, ${230 - Math.floor(atkBurst * 40)}, ${120 - Math.floor(atkBurst * 60)}, ${trailAlpha})`,
      );
      grad.addColorStop(0.35, `rgba(255, 160, 40, ${trailAlpha * 0.7})`);
      grad.addColorStop(0.7, `rgba(220, 70, 10, ${trailAlpha * 0.4})`);
      grad.addColorStop(1, "rgba(150, 30, 0, 0)");
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── WINGS ──────────────────────────────────────────────────────────────────

function drawWings(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  wingFlap: number,
  isAttacking: boolean,
  attackIntensity: number,
  layer: "back" | "front",
  blue: boolean = false,
) {
  const atkBurst = isAttacking ? Math.sin(attackIntensity * Math.PI) : 0;
  const flapAngle =
    wingFlap + (isAttacking ? Math.sin(attackIntensity * Math.PI) * 0.35 : 0);
  const wingSpread = s * (1.3 + flapAngle * 0.45 + atkBurst * 0.2);
  const side = layer === "back" ? 1 : -1;

  ctx.save();

  const wingBaseX = x + side * s * 0.14;
  const wingBaseY = y - s * 0.06;
  const wingTipX = wingBaseX + side * wingSpread;
  const wingTipY = wingBaseY - s * 0.55 + flapAngle * s * 0.5;

  // Wing glow underlay — brighter when attacking
  const glowIntensity =
    0.12 + flapAngle * 0.05 + atkBurst * 0.15 + (blue ? 0.1 : 0);
  const glowGrad = ctx.createRadialGradient(
    wingBaseX + side * wingSpread * 0.4,
    wingBaseY - s * 0.1,
    0,
    wingBaseX + side * wingSpread * 0.4,
    wingBaseY - s * 0.1,
    wingSpread * (0.6 + atkBurst * 0.2),
  );
  if (blue) {
    glowGrad.addColorStop(0, `rgba(96, 165, 250, ${glowIntensity})`);
    glowGrad.addColorStop(0.5, `rgba(59, 130, 246, ${glowIntensity * 0.5})`);
    glowGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
  } else {
    glowGrad.addColorStop(0, `rgba(255, 180, 50, ${glowIntensity})`);
    glowGrad.addColorStop(0.5, `rgba(255, 120, 30, ${glowIntensity * 0.4})`);
    glowGrad.addColorStop(1, "rgba(255, 100, 20, 0)");
  }
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(
    wingBaseX + side * wingSpread * 0.4,
    wingBaseY - s * 0.1,
    wingSpread * (0.6 + atkBurst * 0.2),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wing membrane ripple offset during attack
  const ripple = isAttacking
    ? Math.sin(attackIntensity * Math.PI + time * 3) * s * 0.008
    : 0;

  // Primary wing membrane
  const wingGrad = ctx.createLinearGradient(
    wingBaseX,
    wingBaseY,
    wingTipX,
    wingTipY,
  );
  if (blue) {
    wingGrad.addColorStop(0, "rgba(29, 78, 216, 0.95)");
    wingGrad.addColorStop(0.15, "rgba(59, 130, 246, 0.9)");
    wingGrad.addColorStop(0.35, `rgba(96, 165, 250, 0.88)`);
    wingGrad.addColorStop(0.6, `rgba(147, 197, 253, 0.78)`);
    wingGrad.addColorStop(0.85, `rgba(191, 219, 254, ${0.5 + atkBurst * 0.2})`);
    wingGrad.addColorStop(1, `rgba(224, 240, 255, ${0.3 + atkBurst * 0.3})`);
  } else {
    wingGrad.addColorStop(0, "rgba(180, 80, 15, 0.95)");
    wingGrad.addColorStop(0.15, "rgba(230, 126, 34, 0.9)");
    wingGrad.addColorStop(
      0.35,
      `rgba(255, ${170 + Math.floor(atkBurst * 40)}, ${60 + Math.floor(atkBurst * 40)}, 0.88)`,
    );
    wingGrad.addColorStop(
      0.6,
      `rgba(255, ${210 + Math.floor(atkBurst * 30)}, ${90 + Math.floor(atkBurst * 50)}, 0.78)`,
    );
    wingGrad.addColorStop(0.85, `rgba(255, 240, 150, ${0.5 + atkBurst * 0.2})`);
    wingGrad.addColorStop(1, `rgba(255, 255, 200, ${0.3 + atkBurst * 0.3})`);
  }

  ctx.fillStyle = wingGrad;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.bezierCurveTo(
    wingBaseX + side * wingSpread * 0.3,
    wingBaseY - s * 0.6 + flapAngle * s * 0.24 + ripple,
    wingBaseX + side * wingSpread * 0.65,
    wingBaseY - s * 0.58 + flapAngle * s * 0.35 + ripple * 0.7,
    wingTipX,
    wingTipY,
  );
  ctx.bezierCurveTo(
    wingBaseX + side * wingSpread * 0.85,
    wingBaseY + s * 0.04 + flapAngle * s * 0.12 + ripple * 0.5,
    wingBaseX + side * wingSpread * 0.55,
    wingBaseY + s * 0.22 + flapAngle * s * 0.08,
    wingBaseX + side * wingSpread * 0.2,
    wingBaseY + s * 0.26,
  );
  ctx.lineTo(wingBaseX, wingBaseY + s * 0.14);
  ctx.closePath();
  ctx.fill();

  // Wing bone structure
  ctx.strokeStyle = blue
    ? `rgba(30, 64, 175, ${0.5 + atkBurst * 0.15})`
    : `rgba(160, 70, 10, ${0.5 + atkBurst * 0.15})`;
  ctx.lineWidth = (2.0 + atkBurst * 0.6) * zoom;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY);
  ctx.bezierCurveTo(
    wingBaseX + side * wingSpread * 0.3,
    wingBaseY - s * 0.25 + flapAngle * s * 0.14 + ripple * 0.6,
    wingBaseX + side * wingSpread * 0.6,
    wingBaseY - s * 0.35 + flapAngle * s * 0.24 + ripple * 0.3,
    wingTipX,
    wingTipY,
  );
  ctx.stroke();

  // Secondary bone
  ctx.strokeStyle = blue
    ? `rgba(37, 99, 235, ${0.3 + atkBurst * 0.1})`
    : `rgba(140, 60, 8, ${0.3 + atkBurst * 0.1})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(wingBaseX, wingBaseY + s * 0.04);
  ctx.bezierCurveTo(
    wingBaseX + side * wingSpread * 0.25,
    wingBaseY + s * 0.02 + flapAngle * s * 0.06,
    wingBaseX + side * wingSpread * 0.55,
    wingBaseY - s * 0.05 + flapAngle * s * 0.12,
    wingBaseX + side * wingSpread * 0.75,
    wingBaseY - s * 0.1 + flapAngle * s * 0.2,
  );
  ctx.stroke();

  // Layered individual flight feathers — proper filled shapes
  const featherCount = 12;
  for (let f = 0; f < featherCount; f++) {
    const featherT = (f + 0.5) / featherCount;
    const boneT = featherT * 0.85;

    const attachX = wingBaseX + side * wingSpread * boneT;
    const attachY =
      wingBaseY -
      s * (0.12 + boneT * 0.25) +
      flapAngle * s * 0.14 * boneT +
      ripple * boneT;

    const featherLen = s * (0.13 + featherT * 0.16);
    const featherAngle = Math.PI * 0.5 + side * (0.2 + featherT * 0.35);
    const featherSway = Math.sin(time * 2 + f * 0.7) * s * 0.006;
    const tipX = attachX + Math.cos(featherAngle) * featherLen + featherSway;
    const tipY = attachY + Math.sin(featherAngle) * featherLen;

    const wideW = s * (0.024 + (1 - featherT) * 0.016);
    const narrowW = wideW * 0.45;
    const perpNx = -Math.sin(featherAngle);
    const perpNy = Math.cos(featherAngle);

    // Feather vane — asymmetric filled shape with gradient
    const q1 = 0.3;
    const q2 = 0.65;
    const p1x = attachX + (tipX - attachX) * q1 + featherSway * 0.2;
    const p1y = attachY + (tipY - attachY) * q1;
    const p2x = attachX + (tipX - attachX) * q2 + featherSway * 0.4;
    const p2y = attachY + (tipY - attachY) * q2;

    const fGrad = ctx.createLinearGradient(attachX, attachY, tipX, tipY);
    if (blue) {
      fGrad.addColorStop(0, `rgba(30, 64, 175, ${0.85 - featherT * 0.1})`);
      fGrad.addColorStop(0.3, `rgba(59, 130, 246, ${0.8 - featherT * 0.08})`);
      fGrad.addColorStop(0.65, `rgba(147, 197, 253, ${0.7 - featherT * 0.06})`);
      fGrad.addColorStop(1, `rgba(224, 240, 255, ${0.55 + atkBurst * 0.15})`);
    } else {
      fGrad.addColorStop(0, `rgba(160, 65, 10, ${0.85 - featherT * 0.1})`);
      fGrad.addColorStop(0.3, `rgba(210, 110, 25, ${0.8 - featherT * 0.08})`);
      fGrad.addColorStop(0.65, `rgba(255, 190, 70, ${0.7 - featherT * 0.06})`);
      fGrad.addColorStop(1, `rgba(255, 240, 150, ${0.55 + atkBurst * 0.15})`);
    }

    // Leading edge (wider) — curved vane shape
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(attachX, attachY);
    ctx.quadraticCurveTo(
      p1x + perpNx * wideW * side,
      p1y + perpNy * wideW,
      p2x + perpNx * wideW * 0.7 * side,
      p2y + perpNy * wideW * 0.7,
    );
    ctx.quadraticCurveTo(
      tipX + perpNx * narrowW * 0.2 * side,
      tipY + perpNy * narrowW * 0.2,
      tipX,
      tipY,
    );
    // Trailing edge (narrower)
    ctx.quadraticCurveTo(
      p2x - perpNx * narrowW * 0.5 * side,
      p2y - perpNy * narrowW * 0.5,
      p1x - perpNx * narrowW * 0.3 * side,
      p1y - perpNy * narrowW * 0.3,
    );
    ctx.closePath();
    ctx.fill();

    // Inner highlight along the leading vane — gives depth
    const hlAlpha = 0.2 + atkBurst * 0.05 - featherT * 0.06;
    ctx.fillStyle = blue
      ? `rgba(191, 219, 254, ${hlAlpha})`
      : `rgba(255, 230, 140, ${hlAlpha})`;
    ctx.beginPath();
    ctx.moveTo(
      attachX + perpNx * narrowW * 0.2 * side,
      attachY + perpNy * narrowW * 0.2,
    );
    ctx.quadraticCurveTo(
      p1x + perpNx * wideW * 0.6 * side,
      p1y + perpNy * wideW * 0.6,
      p2x + perpNx * wideW * 0.3 * side,
      p2y + perpNy * wideW * 0.3,
    );
    ctx.lineTo(
      p2x + perpNx * wideW * 0.08 * side,
      p2y + perpNy * wideW * 0.08,
    );
    ctx.quadraticCurveTo(
      p1x + perpNx * wideW * 0.15 * side,
      p1y + perpNy * wideW * 0.15,
      attachX,
      attachY,
    );
    ctx.closePath();
    ctx.fill();

    // Central rachis (shaft) — subtle dark line
    ctx.strokeStyle = blue
      ? `rgba(30, 58, 160, ${0.35 - featherT * 0.08})`
      : `rgba(120, 50, 8, ${0.35 - featherT * 0.08})`;
    ctx.lineWidth = (1.0 - featherT * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(attachX, attachY);
    ctx.quadraticCurveTo(
      (attachX + tipX) / 2 + perpNx * narrowW * 0.15 * side + featherSway * 0.3,
      (attachY + tipY) / 2 + perpNy * narrowW * 0.15,
      tipX,
      tipY,
    );
    ctx.stroke();

    // Flame glow at feather tip
    const tipGlowR = s * (0.02 + (1 - featherT) * 0.015 + atkBurst * 0.01);
    const tipGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, tipGlowR);
    if (blue) {
      tipGlow.addColorStop(0, `rgba(224, 240, 255, ${0.55 + atkBurst * 0.15})`);
      tipGlow.addColorStop(0.4, `rgba(96, 165, 250, ${0.25 + atkBurst * 0.1})`);
      tipGlow.addColorStop(1, "rgba(59, 130, 246, 0)");
    } else {
      tipGlow.addColorStop(0, `rgba(255, 240, 120, ${0.55 + atkBurst * 0.15})`);
      tipGlow.addColorStop(0.4, `rgba(255, 160, 40, ${0.25 + atkBurst * 0.1})`);
      tipGlow.addColorStop(1, "rgba(220, 70, 10, 0)");
    }
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(tipX, tipY, tipGlowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flame fringe along wing edge — more and bigger when attacking
  const fringeCount = 14 + Math.floor(atkBurst * 8);
  const fringeSpeed = 6 + atkBurst * 2;
  for (let fl = 0; fl < fringeCount; fl++) {
    const flameT = fl / fringeCount;
    const edgeX = wingBaseX + side * wingSpread * (0.25 + flameT * 0.75);
    const edgeTopY =
      wingBaseY -
      s * (0.35 + flameT * 0.1) * (1 - flameT * 0.4) +
      flapAngle * s * 0.17 * flameT +
      ripple * flameT;
    const edgeBotY = wingBaseY + s * (0.1 + flameT * 0.12);
    const flameY =
      edgeTopY +
      (edgeBotY - edgeTopY) *
        (0.1 + Math.sin(time * fringeSpeed + fl * 1.5) * 0.12);
    const flameSize =
      s *
      (0.035 + flameT * 0.015 + atkBurst * 0.025) *
      (1 + Math.sin(time * 8 + fl * 2) * 0.3);
    const flameAlpha = 0.7 + atkBurst * 0.2 + Math.sin(time * 7 + fl) * 0.2;

    const fGrad = ctx.createRadialGradient(
      edgeX,
      flameY,
      0,
      edgeX,
      flameY,
      flameSize,
    );
    if (blue) {
      fGrad.addColorStop(0, `rgba(224, 240, 255, ${flameAlpha})`);
      fGrad.addColorStop(0.25, `rgba(147, 197, 253, ${flameAlpha * 0.85})`);
      fGrad.addColorStop(0.55, `rgba(59, 130, 246, ${flameAlpha * 0.5})`);
      fGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
    } else {
      fGrad.addColorStop(
        0,
        `rgba(255, 255, ${210 + Math.floor(atkBurst * 40)}, ${flameAlpha})`,
      );
      fGrad.addColorStop(
        0.25,
        `rgba(255, ${200 + Math.floor(atkBurst * 40)}, 60, ${flameAlpha * 0.85})`,
      );
      fGrad.addColorStop(0.55, `rgba(255, 130, 30, ${flameAlpha * 0.5})`);
      fGrad.addColorStop(1, "rgba(200, 50, 10, 0)");
    }
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.arc(edgeX, flameY, flameSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Trailing ember sparks shed from wing during attack
  if (isAttacking) {
    for (let sp = 0; sp < 5; sp++) {
      const spT = (time * 5 + sp * 0.2) % 1;
      const spBaseT = 0.3 + sp * 0.12;
      const spX =
        wingBaseX +
        side * wingSpread * spBaseT +
        Math.sin(time * 8 + sp * 3) * s * 0.04;
      const spY = wingBaseY + s * (0.15 + spT * 0.4);
      const spAlpha = (1 - spT) * 0.6 * atkBurst;
      const spSize = (1 - spT) * s * 0.015;

      ctx.fillStyle = blue
        ? `rgba(147, 197, 253, ${spAlpha})`
        : `rgba(255, ${180 + Math.floor(sp * 15)}, 40, ${spAlpha})`;
      ctx.beginPath();
      ctx.arc(spX, spY, spSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

// ─── WING FIRE CASCADE (fire flowing from wingtips to head) ─────────────────

function drawWingFireCascade(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  wingFlap: number,
  flamePulse: number,
  blue: boolean = false,
) {
  const flapAngle = wingFlap;
  const wingSpread = s * (1.3 + flapAngle * 0.45);

  for (let side = -1; side <= 1; side += 2) {
    const wingBaseX = x + side * s * 0.14;
    const wingBaseY = y - s * 0.06;
    const wingTipX = wingBaseX + side * wingSpread;
    const wingTipY = wingBaseY - s * 0.55 + flapAngle * s * 0.5;
    const headX = x;
    const headY = y - s * 0.38;

    // Fire orbs along the upper wing edge from tip toward head
    const cascadeCount = 18;
    for (let i = 0; i < cascadeCount; i++) {
      const t = i / (cascadeCount - 1);

      // Path: wingtip -> wing shoulder -> head
      let px: number, py: number;
      if (t < 0.65) {
        const wt = t / 0.65;
        px = wingTipX + (wingBaseX - wingTipX) * wt;
        const topCurveY = wingTipY + (wingBaseY - wingTipY) * wt;
        const archLift = Math.sin(wt * Math.PI) * s * 0.15;
        py = topCurveY - archLift;
      } else {
        const ht = (t - 0.65) / 0.35;
        px = wingBaseX + (headX - wingBaseX) * ht;
        py = wingBaseY + (headY - wingBaseY) * ht - Math.sin(ht * Math.PI) * s * 0.06;
      }

      // Animated drift
      const drift = Math.sin(time * 3 + i * 0.6 + side) * s * 0.012;
      const rise = Math.sin(time * 2.5 + i * 0.4) * s * 0.008;
      px += drift;
      py += rise - s * 0.02;

      // Size tapers toward the head, biggest at wingtip
      const sizeFactor = 1 - t * 0.6;
      const orbSize = s * (0.035 + sizeFactor * 0.025) * (0.8 + flamePulse * 0.2);
      const orbAlpha = (0.5 + flamePulse * 0.2) * (1 - t * 0.45);

      const orbGrad = ctx.createRadialGradient(px, py, 0, px, py, orbSize);
      if (blue) {
        orbGrad.addColorStop(0, `rgba(224, 240, 255, ${orbAlpha})`);
        orbGrad.addColorStop(0.3, `rgba(147, 197, 253, ${orbAlpha * 0.7})`);
        orbGrad.addColorStop(0.6, `rgba(59, 130, 246, ${orbAlpha * 0.35})`);
        orbGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
      } else {
        orbGrad.addColorStop(0, `rgba(255, 255, 200, ${orbAlpha})`);
        orbGrad.addColorStop(0.3, `rgba(255, 200, 60, ${orbAlpha * 0.7})`);
        orbGrad.addColorStop(0.6, `rgba(255, 120, 20, ${orbAlpha * 0.35})`);
        orbGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
      }
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(px, py, orbSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Rising ember sparks along the cascade path
    const sparkCount = 12;
    for (let i = 0; i < sparkCount; i++) {
      const baseT = (i + 0.5) / sparkCount;
      const sparkPhase = (time * 2.5 + i * 0.18) % 1;

      let spx: number, spy: number;
      if (baseT < 0.65) {
        const wt = baseT / 0.65;
        spx = wingTipX + (wingBaseX - wingTipX) * wt;
        spy = wingTipY + (wingBaseY - wingTipY) * wt - Math.sin(wt * Math.PI) * s * 0.15;
      } else {
        const ht = (baseT - 0.65) / 0.35;
        spx = wingBaseX + (headX - wingBaseX) * ht;
        spy = wingBaseY + (headY - wingBaseY) * ht - Math.sin(ht * Math.PI) * s * 0.06;
      }

      spx += Math.sin(time * 4 + i * 1.7 + side * 2) * s * 0.02;
      spy -= sparkPhase * s * 0.12;

      const sparkAlpha = Math.sin(sparkPhase * Math.PI) * 0.55 * (1 - baseT * 0.3);
      const sparkSize = (1.5 + (1 - sparkPhase) * 1.5) * zoom;

      ctx.fillStyle = blue
        ? `rgba(191, 219, 254, ${sparkAlpha})`
        : `rgba(255, ${200 - Math.floor(sparkPhase * 60)}, ${60 - Math.floor(sparkPhase * 40)}, ${sparkAlpha})`;
      ctx.beginPath();
      ctx.arc(spx, spy, sparkSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft glow trail connecting the fire orbs
    const trailGrad = ctx.createLinearGradient(wingTipX, wingTipY, headX, headY);
    if (blue) {
      trailGrad.addColorStop(0, `rgba(96, 165, 250, ${0.12 + flamePulse * 0.06})`);
      trailGrad.addColorStop(0.5, `rgba(59, 130, 246, ${0.06 + flamePulse * 0.03})`);
      trailGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
    } else {
      trailGrad.addColorStop(0, `rgba(255, 180, 50, ${0.12 + flamePulse * 0.06})`);
      trailGrad.addColorStop(0.5, `rgba(255, 120, 20, ${0.06 + flamePulse * 0.03})`);
      trailGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
    }
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = (3 + flamePulse * 2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(wingTipX, wingTipY - s * 0.02);
    ctx.bezierCurveTo(
      wingBaseX + side * wingSpread * 0.4, wingBaseY - s * 0.35 + flapAngle * s * 0.18,
      wingBaseX + side * s * 0.05, wingBaseY - s * 0.15,
      headX, headY,
    );
    ctx.stroke();
  }
}

// ─── TAIL PLUMAGE (grand trailing feathers) ─────────────────────────────────

function drawTailPlumage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  isAttacking: boolean = false,
  atkBurst: number = 0,
  blue: boolean = false,
) {
  const tailBaseY = y + s * 0.22;
  const featherCount = 9 + Math.floor(atkBurst * 5) + (blue ? 4 : 0);
  const spreadMult = 1.15 + atkBurst * 0.7;
  const lenMult = 1.2 + atkBurst * 0.5;
  const swaySpeed = 1.3 + atkBurst * 1.5;
  const swayAmp = 0.04 + atkBurst * 0.03;

  for (let i = 0; i < featherCount; i++) {
    const spread = (i - (featherCount - 1) / 2) * 0.18 * spreadMult;
    const sway = Math.sin(time * swaySpeed + i * 0.5) * s * swayAmp;
    const featherLen =
      s *
      (0.42 +
        Math.abs(spread) * 0.1 -
        Math.abs(i - Math.floor(featherCount / 2)) * 0.015) *
      lenMult;
    const thickness = (3.5 + atkBurst * 1.5 - Math.abs(spread) * 3) * zoom;

    const tipX = x + spread * s * 0.6 + sway;
    const tipY = tailBaseY + featherLen;
    const midX = x + spread * s * 0.35 + sway * 0.6;
    const midY =
      tailBaseY + featherLen * 0.5 + Math.sin(time * 3 + i) * s * 0.015;

    // Feather body
    const fGrad = ctx.createLinearGradient(x, tailBaseY, tipX, tipY);
    if (blue) {
      fGrad.addColorStop(0, "#1e3a8a");
      fGrad.addColorStop(0.15, `rgba(29, 78, 216, 0.95)`);
      fGrad.addColorStop(0.35, "#3b82f6");
      fGrad.addColorStop(0.6, `rgba(96, 165, 250, ${0.85 + atkBurst * 0.1})`);
      fGrad.addColorStop(
        0.85,
        `rgba(147, 197, 253, ${0.6 + flamePulse * 0.25})`,
      );
      fGrad.addColorStop(
        1,
        `rgba(224, 240, 255, ${0.35 + flamePulse * 0.3 + atkBurst * 0.25})`,
      );
    } else {
      fGrad.addColorStop(0, "#b35a10");
      fGrad.addColorStop(0.15, `rgba(230, 126, 34, 0.95)`);
      fGrad.addColorStop(0.35, "#f39c12");
      fGrad.addColorStop(
        0.6,
        `rgba(255, ${136 + Math.floor(atkBurst * 60)}, 0, ${0.85 + atkBurst * 0.1})`,
      );
      fGrad.addColorStop(
        0.85,
        `rgba(255, ${200 + Math.floor(atkBurst * 40)}, ${50 + Math.floor(atkBurst * 60)}, ${0.6 + flamePulse * 0.25})`,
      );
      fGrad.addColorStop(
        1,
        `rgba(255, ${240 + Math.floor(atkBurst * 15)}, ${100 + Math.floor(atkBurst * 80)}, ${0.35 + flamePulse * 0.3 + atkBurst * 0.25})`,
      );
    }

    ctx.strokeStyle = fGrad;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, tailBaseY);
    ctx.bezierCurveTo(
      x + spread * s * 0.2,
      tailBaseY + featherLen * 0.25 + sway * 0.3,
      midX,
      midY,
      tipX,
      tipY,
    );
    ctx.stroke();

    // Feather barb detail
    const barbCount = 4 + Math.floor(atkBurst * 2);
    for (let b = 0; b < barbCount; b++) {
      const t = 0.2 + b * (0.6 / barbCount);
      const bx = x + (tipX - x) * t + sway * t;
      const by = tailBaseY + (tipY - tailBaseY) * t;
      const barbLen = s * (0.025 + atkBurst * 0.01);
      const barbAngle =
        spread * 1.5 + Math.sin(time * 2 + b) * (0.1 + atkBurst * 0.08);

      ctx.strokeStyle = blue
        ? `rgba(59, 130, 246, ${0.3 + atkBurst * 0.15})`
        : `rgba(200, 100, 20, ${0.3 + atkBurst * 0.15})`;
      ctx.lineWidth = (0.6 + atkBurst * 0.3) * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(
        bx + Math.cos(barbAngle + Math.PI / 2) * barbLen,
        by + Math.sin(barbAngle + Math.PI / 2) * barbLen,
      );
      ctx.stroke();
    }

    // Flame tip glow — bigger and brighter when attacking
    const tipGlowR = s * (0.05 + atkBurst * 0.04 + (blue ? 0.02 : 0));
    const tipGlow = ctx.createRadialGradient(
      tipX,
      tipY,
      0,
      tipX,
      tipY,
      tipGlowR,
    );
    if (blue) {
      tipGlow.addColorStop(0, `rgba(224, 240, 255, ${0.9 + flamePulse * 0.1})`);
      tipGlow.addColorStop(
        0.35,
        `rgba(96, 165, 250, ${0.5 + flamePulse * 0.2})`,
      );
      tipGlow.addColorStop(1, "rgba(59, 130, 246, 0)");
    } else {
      tipGlow.addColorStop(
        0,
        `rgba(255, ${240 + Math.floor(atkBurst * 15)}, ${130 + Math.floor(atkBurst * 80)}, ${0.8 + flamePulse * 0.2})`,
      );
      tipGlow.addColorStop(
        0.35,
        `rgba(255, 180, 50, ${0.4 + flamePulse * 0.2 + atkBurst * 0.2})`,
      );
      tipGlow.addColorStop(1, "rgba(255, 100, 20, 0)");
    }
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(tipX, tipY, tipGlowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Extra fire embers shedding from tail during attack
  if (isAttacking) {
    for (let e = 0; e < 8; e++) {
      const ePhase = (time * 4 + e * 0.125) % 1;
      const eAngle = (e / 8) * 0.8 - 0.4;
      const eDist = s * (0.25 + ePhase * 0.3);
      const eX = x + eAngle * s * 0.5 + Math.sin(time * 6 + e * 2) * s * 0.03;
      const eY = tailBaseY + eDist;
      const eAlpha = (1 - ePhase) * 0.5 * atkBurst;
      const eSize = (1 - ePhase) * s * 0.02;

      ctx.fillStyle = blue
        ? `rgba(147, ${197 - Math.floor(ePhase * 40)}, 253, ${eAlpha})`
        : `rgba(255, ${200 - Math.floor(ePhase * 80)}, ${60 - Math.floor(ePhase * 40)}, ${eAlpha})`;
      ctx.beginPath();
      ctx.arc(eX, eY, eSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── CAPE / TRAILING STRAPS ─────────────────────────────────────────────────

function drawCapeStraps(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  blue: boolean = false,
) {
  for (let side = -1; side <= 1; side += 2) {
    const strapX = x + side * s * 0.13;
    const strapTopY = y - s * 0.12;
    const strapBotY = y + s * 0.3;
    const sway = Math.sin(time * 1.8 + side * 0.5) * s * 0.025;

    // Leather strap
    const strapGrad = ctx.createLinearGradient(
      strapX,
      strapTopY,
      strapX + sway,
      strapBotY,
    );
    strapGrad.addColorStop(0, "#6b3a12");
    strapGrad.addColorStop(0.3, "#8b4a18");
    strapGrad.addColorStop(0.7, "#7a4015");
    strapGrad.addColorStop(1, `rgba(90, 45, 12, ${0.4})`);

    ctx.strokeStyle = strapGrad;
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(strapX, strapTopY);
    ctx.quadraticCurveTo(
      strapX + sway * 0.6,
      (strapTopY + strapBotY) / 2,
      strapX + sway,
      strapBotY,
    );
    ctx.stroke();

    // Gold strap edge
    ctx.strokeStyle = `rgba(200, 160, 40, 0.3)`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(strapX - side * 1.2 * zoom, strapTopY);
    ctx.quadraticCurveTo(
      strapX + sway * 0.6 - side * 1.2 * zoom,
      (strapTopY + strapBotY) / 2,
      strapX + sway - side * 1.2 * zoom,
      strapBotY,
    );
    ctx.stroke();

    // Strap end ornament
    const ornY = strapBotY;
    const ornX = strapX + sway;
    ctx.fillStyle = blue
      ? `rgba(96, 165, 250, ${0.5 + flamePulse * 0.2})`
      : `rgba(255, 180, 40, ${0.5 + flamePulse * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(ornX, ornY);
    ctx.lineTo(ornX + side * s * 0.02, ornY + s * 0.025);
    ctx.lineTo(ornX, ornY + s * 0.04);
    ctx.lineTo(ornX - side * s * 0.02, ornY + s * 0.025);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── BODY ───────────────────────────────────────────────────────────────────

function drawBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  breathe: number,
  time: number,
  flamePulse: number,
  zoom: number,
  bodyGlow: number,
  isAttacking: boolean = false,
  atkBurst: number = 0,
  blue: boolean = false,
) {
  const bodyW = s * (0.23 + breathe * 0.002 + atkBurst * 0.015);
  const bodyH = s * (0.31 + breathe * 0.003 + atkBurst * 0.02);

  // Core body — hotter center when attacking
  const bodyGrad = ctx.createRadialGradient(
    x,
    y - s * 0.04,
    s * (0.04 + atkBurst * 0.03),
    x,
    y + s * 0.02,
    s * 0.36,
  );
  if (blue) {
    bodyGrad.addColorStop(0, "#e0f0ff");
    bodyGrad.addColorStop(0.12, "#93c5fd");
    bodyGrad.addColorStop(0.35, "#3b82f6");
    bodyGrad.addColorStop(0.6, "#2563eb");
    bodyGrad.addColorStop(0.8, "#1d4ed8");
    bodyGrad.addColorStop(1, "#1e3a5f");
  } else {
    bodyGrad.addColorStop(0, atkBurst > 0.3 ? "#fffbe8" : "#fff5e0");
    bodyGrad.addColorStop(0.12, atkBurst > 0.3 ? "#ffe090" : "#ffc870");
    bodyGrad.addColorStop(0.35, "#e67e22");
    bodyGrad.addColorStop(0.6, "#cc5500");
    bodyGrad.addColorStop(0.8, "#993d00");
    bodyGrad.addColorStop(1, "#6b2800");
  }

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body rim light — flares up during attack
  ctx.strokeStyle = blue
    ? `rgba(147, 197, 253, ${0.3 + bodyGlow * 0.15 + atkBurst * 0.2})`
    : `rgba(255, ${200 + Math.floor(atkBurst * 40)}, ${100 + Math.floor(atkBurst * 60)}, ${0.25 + bodyGlow * 0.15 + atkBurst * 0.2})`;
  ctx.lineWidth = (1.2 + atkBurst * 0.8) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, -0.5, Math.PI * 0.6);
  ctx.stroke();

  // Layered feather texture — gentle sway during attack
  const featherSwaySpeed = 1.5 + atkBurst * 1.5;
  const featherSwayAmp = 0.003 + atkBurst * 0.003;
  for (let row = 0; row < 8; row++) {
    const rowOffset = Math.sin(time * 2 + row * 0.8) * s * atkBurst * 0.003;
    const rowY = y - s * 0.2 + row * s * 0.055 + rowOffset;
    const rowWidth = s * 0.2 * Math.sin(((row + 0.5) / 8) * Math.PI);
    const feathersInRow = 3 + Math.min(row, 4);

    for (let f = 0; f < feathersInRow; f++) {
      const fx = x - rowWidth + (f / (feathersInRow - 1)) * rowWidth * 2;
      const fWidth = ((rowWidth * 2) / feathersInRow) * 0.6;
      const fHeight = s * (0.025 + atkBurst * 0.005);
      const fSway =
        Math.sin(time * featherSwaySpeed + row * 0.4 + f * 0.7) *
        s *
        featherSwayAmp;

      const shade = (row < 4 ? 0.08 : 0.05) + atkBurst * 0.03;
      ctx.fillStyle = blue
        ? `rgba(30, 64, 175, ${shade + Math.sin(time * 2 + row + f) * 0.025})`
        : `rgba(139, 58, 0, ${shade + Math.sin(time * 2 + row + f) * 0.025})`;
      ctx.beginPath();
      ctx.ellipse(fx + fSway, rowY, fWidth, fHeight, 0, 0, Math.PI);
      ctx.fill();
    }
  }

  // Inner fire core glow — much brighter and pulsing during attack
  const coreRadius = s * (0.19 + atkBurst * 0.07);
  const corePower = bodyGlow + atkBurst * 0.8;
  const innerGlow = ctx.createRadialGradient(
    x,
    y - s * 0.06,
    0,
    x,
    y,
    coreRadius,
  );
  if (blue) {
    innerGlow.addColorStop(0, `rgba(224, 240, 255, ${0.3 * corePower})`);
    innerGlow.addColorStop(0.3, `rgba(147, 197, 253, ${0.2 * corePower})`);
    innerGlow.addColorStop(0.6, `rgba(59, 130, 246, ${0.1 * corePower})`);
    innerGlow.addColorStop(1, `rgba(29, 78, 216, 0)`);
  } else {
    innerGlow.addColorStop(
      0,
      `rgba(255, ${240 + Math.floor(atkBurst * 15)}, ${160 + Math.floor(atkBurst * 60)}, ${0.25 * corePower})`,
    );
    innerGlow.addColorStop(0.3, `rgba(255, 210, 80, ${0.15 * corePower})`);
    innerGlow.addColorStop(0.6, `rgba(255, 150, 30, ${0.08 * corePower})`);
    innerGlow.addColorStop(1, `rgba(255, 100, 0, 0)`);
  }
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.06, coreRadius, coreRadius * 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Attack flash — bright core burst
  if (atkBurst > 0.2) {
    const flashAlpha = atkBurst * 0.35;
    const flashGrad = ctx.createRadialGradient(
      x,
      y - s * 0.04,
      0,
      x,
      y,
      s * 0.14,
    );
    if (blue) {
      flashGrad.addColorStop(0, `rgba(224, 240, 255, ${flashAlpha})`);
      flashGrad.addColorStop(0.4, `rgba(147, 197, 253, ${flashAlpha * 0.5})`);
      flashGrad.addColorStop(1, `rgba(59, 130, 246, 0)`);
    } else {
      flashGrad.addColorStop(0, `rgba(255, 255, 220, ${flashAlpha})`);
      flashGrad.addColorStop(0.4, `rgba(255, 200, 80, ${flashAlpha * 0.5})`);
      flashGrad.addColorStop(1, `rgba(255, 140, 30, 0)`);
    }
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(x, y - s * 0.04, s * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ARMOR PLATES ───────────────────────────────────────────────────────────

function drawArmorPlates(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  gemPulse: number,
  blue: boolean = false,
) {
  // Breast plate
  const breastGrad = ctx.createLinearGradient(
    x - s * 0.12,
    y - s * 0.15,
    x + s * 0.12,
    y + s * 0.08,
  );
  breastGrad.addColorStop(0, "#8a6020");
  breastGrad.addColorStop(0.2, "#c49030");
  breastGrad.addColorStop(0.5, "#daa530");
  breastGrad.addColorStop(0.8, "#c49030");
  breastGrad.addColorStop(1, "#8a6020");

  ctx.fillStyle = breastGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.13, y - s * 0.16);
  ctx.quadraticCurveTo(x - s * 0.16, y - s * 0.02, x - s * 0.08, y + s * 0.06);
  ctx.lineTo(x + s * 0.08, y + s * 0.06);
  ctx.quadraticCurveTo(x + s * 0.16, y - s * 0.02, x + s * 0.13, y - s * 0.16);
  ctx.closePath();
  ctx.fill();

  // Plate border
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Gold trim on plate edge
  ctx.strokeStyle = `rgba(255, 210, 80, 0.4)`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.12, y - s * 0.15);
  ctx.quadraticCurveTo(x - s * 0.15, y - s * 0.02, x - s * 0.07, y + s * 0.055);
  ctx.stroke();

  // Central medallion - Nassau Hall flame emblem
  const medY = y - s * 0.06;
  const medR = s * 0.055;

  // Medallion disc
  const medGrad = ctx.createRadialGradient(x, medY, 0, x, medY, medR);
  medGrad.addColorStop(0, "#ffe080");
  medGrad.addColorStop(0.3, "#daa520");
  medGrad.addColorStop(0.7, "#b8860b");
  medGrad.addColorStop(1, "#8b6914");
  ctx.fillStyle = medGrad;
  ctx.beginPath();
  ctx.arc(x, medY, medR, 0, Math.PI * 2);
  ctx.fill();

  // Medallion ring
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, medY, medR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 120, 0.5)`;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, medY, medR * 0.85, 0, Math.PI * 2);
  ctx.stroke();

  // Flame emblem inside medallion
  const embGlow = 0.6 + gemPulse * 0.4;
  ctx.fillStyle = blue
    ? `rgba(59, 130, 246, ${embGlow})`
    : `rgba(220, 50, 0, ${embGlow})`;
  ctx.beginPath();
  ctx.moveTo(x, medY - medR * 0.65);
  ctx.quadraticCurveTo(
    x + medR * 0.5,
    medY - medR * 0.1,
    x + medR * 0.3,
    medY + medR * 0.45,
  );
  ctx.quadraticCurveTo(
    x,
    medY + medR * 0.2,
    x - medR * 0.3,
    medY + medR * 0.45,
  );
  ctx.quadraticCurveTo(
    x - medR * 0.5,
    medY - medR * 0.1,
    x,
    medY - medR * 0.65,
  );
  ctx.closePath();
  ctx.fill();

  // Inner flame
  ctx.fillStyle = blue
    ? `rgba(147, 197, 253, ${embGlow * 0.8})`
    : `rgba(255, 220, 80, ${embGlow * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(x, medY - medR * 0.35);
  ctx.quadraticCurveTo(
    x + medR * 0.25,
    medY,
    x + medR * 0.12,
    medY + medR * 0.25,
  );
  ctx.quadraticCurveTo(
    x,
    medY + medR * 0.1,
    x - medR * 0.12,
    medY + medR * 0.25,
  );
  ctx.quadraticCurveTo(x - medR * 0.25, medY, x, medY - medR * 0.35);
  ctx.closePath();
  ctx.fill();

  // Engraved wing motifs on breastplate
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = `rgba(180, 140, 40, 0.25)`;
    ctx.lineWidth = 0.7 * zoom;
    for (let w = 0; w < 3; w++) {
      const wx = x + side * (s * 0.04 + w * s * 0.025);
      const wy = medY;
      ctx.beginPath();
      ctx.moveTo(wx, wy - s * 0.02);
      ctx.quadraticCurveTo(wx + side * s * 0.02, wy, wx, wy + s * 0.025);
      ctx.stroke();
    }
  }
}

// ─── HARNESS / CROSS STRAPS ────────────────────────────────────────────────

function drawHarness(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  gemPulse: number,
  blue: boolean = false,
) {
  // X-shaped harness across chest
  for (let side = -1; side <= 1; side += 2) {
    const topX = x + side * s * 0.18;
    const topY = y - s * 0.2;
    const botX = x - side * s * 0.1;
    const botY = y + s * 0.12;

    ctx.strokeStyle = "#5a3010";
    ctx.lineWidth = 2.8 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(botX, botY);
    ctx.stroke();

    // Strap highlight edge
    ctx.strokeStyle = `rgba(120, 80, 20, 0.5)`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(topX + side * 0.5 * zoom, topY);
    ctx.lineTo(botX + side * 0.5 * zoom, botY);
    ctx.stroke();

    // Gold buckle rivets along strap
    for (let r = 0; r < 3; r++) {
      const t = 0.25 + r * 0.25;
      const rx = topX + (botX - topX) * t;
      const ry = topY + (botY - topY) * t;

      const rivetGrad = ctx.createRadialGradient(
        rx - 0.5 * zoom,
        ry - 0.5 * zoom,
        0,
        rx,
        ry,
        s * 0.008,
      );
      rivetGrad.addColorStop(0, "#ffe080");
      rivetGrad.addColorStop(0.5, "#daa520");
      rivetGrad.addColorStop(1, "#8a6020");
      ctx.fillStyle = rivetGrad;
      ctx.beginPath();
      ctx.arc(rx, ry, s * 0.007, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Center buckle where straps cross
  const buckleY = y - s * 0.04;
  const buckleR = s * 0.025;
  const bGrad = ctx.createRadialGradient(x, buckleY, 0, x, buckleY, buckleR);
  bGrad.addColorStop(0, "#ffe080");
  bGrad.addColorStop(0.4, "#daa520");
  bGrad.addColorStop(1, "#8a6020");
  ctx.fillStyle = bGrad;
  ctx.beginPath();
  ctx.arc(x, buckleY, buckleR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Tiny gem in buckle center
  ctx.fillStyle = blue
    ? `rgba(96, 165, 250, ${0.7 + gemPulse * 0.3})`
    : `rgba(255, 80, 20, ${0.7 + gemPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, buckleY, buckleR * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

// ─── SHOULDER PAULDRONS ─────────────────────────────────────────────────────

function drawShoulderPauldrons(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  gemPulse: number,
  blue: boolean = false,
) {
  for (let side = -1; side <= 1; side += 2) {
    const sx = x + side * s * 0.22;
    const sy = y - s * 0.16;

    // Pauldron base plate
    const pGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, s * 0.1);
    pGrad.addColorStop(0, "#c49030");
    pGrad.addColorStop(0.4, "#a07020");
    pGrad.addColorStop(0.7, "#7a5518");
    pGrad.addColorStop(1, "#503810");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.085, s * 0.065, side * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Pauldron border
    ctx.strokeStyle = "#3a2508";
    ctx.lineWidth = 1.4 * zoom;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.085, s * 0.065, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Gold trim line
    ctx.strokeStyle = `rgba(255, 220, 100, 0.35)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.075, s * 0.055, side * 0.4, 0, Math.PI * 2);
    ctx.stroke();

    // Layered scales on pauldron
    for (let sc = 0; sc < 3; sc++) {
      const scY = sy - s * 0.02 + sc * s * 0.022;
      const scX = sx + side * sc * s * 0.012;
      const scW = s * (0.035 - sc * 0.005);
      ctx.fillStyle = `rgba(160, 110, 30, ${0.3 - sc * 0.06})`;
      ctx.beginPath();
      ctx.ellipse(scX, scY, scW, scW * 0.45, side * 0.3, 0, Math.PI);
      ctx.fill();
    }

    // Phoenix eye engraving on pauldron
    const eyeGlow = 0.4 + gemPulse * 0.3;
    ctx.fillStyle = blue
      ? `rgba(96, 165, 250, ${eyeGlow})`
      : `rgba(255, 140, 30, ${eyeGlow})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, s * 0.015, s * 0.01, side * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Flame wisps rising from pauldrons
    for (let w = 0; w < (blue ? 5 : 3); w++) {
      const wPhase = (time * 3 + w * 0.8 + side) % 1;
      const wY = sy - wPhase * s * 0.15;
      const wX = sx + Math.sin(time * 5 + w * 2) * s * 0.025;
      const wAlpha = (1 - wPhase) * 0.5;
      const wSize = (1 - wPhase) * s * 0.025;

      ctx.fillStyle = blue
        ? `rgba(147, 197, 253, ${wAlpha})`
        : `rgba(255, 180, 50, ${wAlpha})`;
      ctx.beginPath();
      ctx.arc(wX, wY, wSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── NECK ───────────────────────────────────────────────────────────────────

function drawNeck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  targetPos?: Position,
  blue: boolean = false,
) {
  const headY = y - s * 0.38;
  // Lean the neck top toward the target, clamped vertically
  let neckLeanX = 0;
  let neckLeanY = 0;
  if (targetPos) {
    let angle = Math.atan2(targetPos.y - headY, targetPos.x - x);
    // Clamp vertical lean to ±45°
    let rel = angle - Math.PI;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    const maxTilt = Math.PI * 0.25;
    rel = Math.max(-maxTilt, Math.min(maxTilt, rel));
    angle = rel + Math.PI;
    neckLeanX = Math.cos(angle) * s * 0.04;
    neckLeanY = Math.sin(angle) * s * 0.02;
  }

  const neckTopY = y - s * 0.32 + neckLeanY;
  const neckTopX = x + neckLeanX;
  const neckGrad = ctx.createLinearGradient(x, y - s * 0.2, neckTopX, neckTopY);
  if (blue) {
    neckGrad.addColorStop(0, "#3b82f6");
    neckGrad.addColorStop(0.4, "#2563eb");
    neckGrad.addColorStop(0.8, "#1d4ed8");
    neckGrad.addColorStop(1, "#1e40af");
  } else {
    neckGrad.addColorStop(0, "#e67e22");
    neckGrad.addColorStop(0.4, "#d4690e");
    neckGrad.addColorStop(0.8, "#c05a08");
    neckGrad.addColorStop(1, "#a04a05");
  }

  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.065, y - s * 0.2);
  ctx.quadraticCurveTo(
    neckTopX - s * 0.03,
    neckTopY + s * 0.06,
    neckTopX - s * 0.055,
    neckTopY,
  );
  ctx.lineTo(neckTopX + s * 0.055, neckTopY);
  ctx.quadraticCurveTo(
    neckTopX + s * 0.03,
    neckTopY + s * 0.06,
    x + s * 0.065,
    y - s * 0.2,
  );
  ctx.closePath();
  ctx.fill();

  // Neck feather texture
  for (let i = 0; i < 4; i++) {
    const t = (i + 1) / 5;
    const ny = y - s * 0.22 - i * s * 0.03 + neckLeanY * t;
    const nx = x + neckLeanX * t;
    const nw = s * 0.05 - i * s * 0.005;
    ctx.strokeStyle = blue
      ? `rgba(30, 64, 175, ${0.2 - i * 0.03})`
      : `rgba(160, 70, 10, ${0.2 - i * 0.03})`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(nx - nw, ny);
    ctx.quadraticCurveTo(nx, ny - s * 0.005, nx + nw, ny);
    ctx.stroke();
  }

  // Gold neck collar/gorget
  const collarY = y - s * 0.2;
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, collarY, s * 0.08, s * 0.025, 0, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 120, 0.4)`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    collarY - 0.8 * zoom,
    s * 0.075,
    s * 0.02,
    0,
    Math.PI,
    Math.PI * 2,
  );
  ctx.stroke();
}

// ─── HELMET + BIRD HEAD (side-profile, ornate, large) ───────────────────────

function drawHelmet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  gemPulse: number,
  isAttacking: boolean,
  attackIntensity: number,
  targetPos?: Position,
  blue: boolean = false,
) {
  const headY = y - s * 0.38;
  const headTilt = isAttacking
    ? Math.sin(attackIntensity * Math.PI) * s * 0.012
    : 0;
  const hx = x + headTilt;

  // Calculate facing angle toward target, clamped to ±45° vertical
  let facingAngle = Math.PI;
  if (targetPos) {
    facingAngle = Math.atan2(targetPos.y - headY, targetPos.x - hx);
  }
  const MAX_TILT = Math.PI * 0.25;
  let headRotation = facingAngle - Math.PI;
  // Normalize to [-PI, PI]
  while (headRotation > Math.PI) headRotation -= Math.PI * 2;
  while (headRotation < -Math.PI) headRotation += Math.PI * 2;
  headRotation = Math.max(-MAX_TILT, Math.min(MAX_TILT, headRotation));

  ctx.save();
  ctx.translate(hx, headY);
  ctx.rotate(headRotation);
  ctx.translate(-hx, -headY);

  // Head size multiplier — large and imposing
  const hs = s * 1.35;

  // ── Back crest feathers (behind head) ──
  const crestCount = blue ? 7 : 6;
  for (let i = 0; i < crestCount; i++) {
    const angle = -Math.PI * 0.55 + i * 0.2;
    const featherLen = hs * (0.14 + i * 0.018);
    const sway = Math.sin(time * 2.5 + i * 1.2) * hs * 0.012;
    const tipX = hx + Math.cos(angle) * featherLen + sway;
    const tipY = headY + Math.sin(angle) * featherLen;

    ctx.strokeStyle = blue
      ? `rgba(37, 99, 235, ${0.4 - i * 0.04})`
      : `rgba(180, 90, 15, ${0.4 - i * 0.04})`;
    ctx.lineWidth = (2.8 - i * 0.3) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(
      hx + Math.cos(angle) * hs * 0.06,
      headY + Math.sin(angle) * hs * 0.04,
    );
    ctx.quadraticCurveTo(
      hx + Math.cos(angle) * featherLen * 0.6 + sway * 0.5,
      headY + Math.sin(angle) * featherLen * 0.6,
      tipX,
      tipY,
    );
    ctx.stroke();

    // Flame tip on back feathers
    const ftGlowR = hs * (blue ? 0.025 : 0.02);
    const ftGlow = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, ftGlowR);
    if (blue) {
      ftGlow.addColorStop(0, `rgba(224, 240, 255, ${0.5 + flamePulse * 0.2})`);
      ftGlow.addColorStop(1, `rgba(59, 130, 246, 0)`);
    } else {
      ftGlow.addColorStop(0, `rgba(255, 200, 60, ${0.4 + flamePulse * 0.2})`);
      ftGlow.addColorStop(1, `rgba(255, 120, 20, 0)`);
    }
    ctx.fillStyle = ftGlow;
    ctx.beginPath();
    ctx.arc(tipX, tipY, ftGlowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Head base — large side-profile oval (wider than tall for side view) ──
  const headW = hs * 0.14;
  const headH = hs * 0.12;
  const headGrad = ctx.createRadialGradient(
    hx - hs * 0.02,
    headY,
    hs * 0.03,
    hx,
    headY,
    headW * 1.2,
  );
  if (blue) {
    headGrad.addColorStop(0, "#e0f0ff");
    headGrad.addColorStop(0.2, "#93c5fd");
    headGrad.addColorStop(0.4, "#3b82f6");
    headGrad.addColorStop(0.65, "#2563eb");
    headGrad.addColorStop(0.85, "#1d4ed8");
    headGrad.addColorStop(1, "#1e3a5f");
  } else {
    headGrad.addColorStop(0, "#ffe0a0");
    headGrad.addColorStop(0.2, "#ffc060");
    headGrad.addColorStop(0.4, "#e67e22");
    headGrad.addColorStop(0.65, "#cc5500");
    headGrad.addColorStop(0.85, "#993d00");
    headGrad.addColorStop(1, "#6b2800");
  }
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(hx, headY, headW, headH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head feather texture — layered fine rows
  for (let row = 0; row < 7; row++) {
    const ry = headY - headH * 0.7 + row * headH * 0.22;
    const rw = headW * 0.9 * Math.sin(((row + 0.5) / 7) * Math.PI);
    ctx.strokeStyle = blue
      ? `rgba(30, 64, 175, ${0.12 + row * 0.015})`
      : `rgba(160, 70, 10, ${0.12 + row * 0.015})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(hx - rw, ry);
    ctx.quadraticCurveTo(hx, ry + hs * 0.003, hx + rw, ry);
    ctx.stroke();
  }

  // ── Helmet armor — ornate forehead plate with side guards ──
  const helmTop = headY - headH * 0.95;
  const helmBot = headY - headH * 0.15;

  const helmGrad = ctx.createLinearGradient(
    hx - headW,
    helmTop,
    hx + headW,
    helmBot,
  );
  helmGrad.addColorStop(0, "#6a4510");
  helmGrad.addColorStop(0.15, "#8a6018");
  helmGrad.addColorStop(0.35, "#c49030");
  helmGrad.addColorStop(0.55, "#daa530");
  helmGrad.addColorStop(0.75, "#c49030");
  helmGrad.addColorStop(1, "#8a6018");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(hx - headW * 1.05, helmBot);
  ctx.quadraticCurveTo(
    hx - headW * 1.15,
    headY - headH * 0.55,
    hx - headW * 0.6,
    helmTop,
  );
  ctx.lineTo(hx + headW * 0.6, helmTop);
  ctx.quadraticCurveTo(
    hx + headW * 1.15,
    headY - headH * 0.55,
    hx + headW * 1.05,
    helmBot,
  );
  ctx.quadraticCurveTo(hx + headW * 0.5, helmBot + hs * 0.01, hx, helmBot);
  ctx.quadraticCurveTo(
    hx - headW * 0.5,
    helmBot + hs * 0.01,
    hx - headW * 1.05,
    helmBot,
  );
  ctx.closePath();
  ctx.fill();

  // Helmet border
  ctx.strokeStyle = "#3a2205";
  ctx.lineWidth = 1.4 * zoom;
  ctx.stroke();

  // Helmet side plates / cheek guards
  for (let side = -1; side <= 1; side += 2) {
    const gpX = hx + side * headW * 0.85;
    const gpY = helmBot + hs * 0.005;
    const gpGrad = ctx.createLinearGradient(
      gpX,
      gpY,
      gpX + side * hs * 0.02,
      gpY + hs * 0.06,
    );
    gpGrad.addColorStop(0, "#a07020");
    gpGrad.addColorStop(0.5, "#8a6018");
    gpGrad.addColorStop(1, "#6a4510");
    ctx.fillStyle = gpGrad;
    ctx.beginPath();
    ctx.moveTo(gpX, gpY);
    ctx.quadraticCurveTo(
      gpX + side * hs * 0.04,
      gpY + hs * 0.03,
      gpX + side * hs * 0.02,
      gpY + hs * 0.065,
    );
    ctx.lineTo(gpX - side * hs * 0.01, gpY + hs * 0.055);
    ctx.quadraticCurveTo(gpX - side * hs * 0.02, gpY + hs * 0.02, gpX, gpY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3a2205";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Gold rivet on cheek guard
    ctx.fillStyle = "#daa520";
    ctx.beginPath();
    ctx.arc(
      gpX + side * hs * 0.015,
      gpY + hs * 0.03,
      hs * 0.006,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Central helmet ridge / crest
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 2.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hx, helmTop);
  ctx.lineTo(hx, helmBot);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 120, 0.35)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(hx + 0.6 * zoom, helmTop + hs * 0.005);
  ctx.lineTo(hx + 0.6 * zoom, helmBot - hs * 0.005);
  ctx.stroke();

  // Ornamental engraved lines on helmet
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 3; i++) {
      const lx = hx + side * (headW * 0.25 + i * headW * 0.2);
      ctx.strokeStyle = `rgba(180, 140, 40, ${0.2 - i * 0.04})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(lx, helmTop + hs * 0.015);
      ctx.quadraticCurveTo(
        lx + side * hs * 0.005,
        (helmTop + helmBot) / 2,
        lx,
        helmBot - hs * 0.005,
      );
      ctx.stroke();
    }
  }

  // ── Crown / brow band ──
  const browY = helmBot;
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    hx,
    browY,
    headW * 1.1,
    hs * 0.02,
    0,
    Math.PI * 0.05,
    Math.PI * 0.95,
  );
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 230, 120, 0.3)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    hx,
    browY - 1 * zoom,
    headW * 1.05,
    hs * 0.015,
    0,
    Math.PI * 0.1,
    Math.PI * 0.9,
  );
  ctx.stroke();

  // Side gems on brow band
  for (let side = -1; side <= 1; side += 2) {
    const sgX = hx + side * headW * 0.7;
    const sgY = browY;
    const sgR = hs * 0.01;
    const sgGrad = ctx.createRadialGradient(sgX, sgY, 0, sgX, sgY, sgR);
    if (blue) {
      sgGrad.addColorStop(0, `rgba(147, 197, 253, ${0.9 + gemPulse * 0.1})`);
      sgGrad.addColorStop(0.5, `rgba(59, 130, 246, 0.8)`);
      sgGrad.addColorStop(1, `rgba(29, 78, 216, 0.5)`);
    } else {
      sgGrad.addColorStop(0, `rgba(255, 120, 30, ${0.9 + gemPulse * 0.1})`);
      sgGrad.addColorStop(0.5, `rgba(200, 50, 10, 0.8)`);
      sgGrad.addColorStop(1, `rgba(120, 20, 0, 0.5)`);
    }
    ctx.fillStyle = sgGrad;
    ctx.beginPath();
    ctx.arc(sgX, sgY, sgR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center crown gem — large pulsing fire gem
  const crownGemR = hs * 0.02;
  const cgX = hx;
  const cgY = browY - hs * 0.003;
  const cgGrad = ctx.createRadialGradient(cgX, cgY, 0, cgX, cgY, crownGemR);
  if (blue) {
    cgGrad.addColorStop(0, `rgba(224, 240, 255, 0.95)`);
    cgGrad.addColorStop(0.25, `rgba(147, 197, 253, ${0.9 + gemPulse * 0.1})`);
    cgGrad.addColorStop(0.6, `rgba(59, 130, 246, 0.85)`);
    cgGrad.addColorStop(1, `rgba(29, 78, 216, 0.6)`);
  } else {
    cgGrad.addColorStop(0, `rgba(255, 240, 150, 0.95)`);
    cgGrad.addColorStop(0.25, `rgba(255, 140, 40, ${0.9 + gemPulse * 0.1})`);
    cgGrad.addColorStop(0.6, `rgba(220, 50, 10, 0.85)`);
    cgGrad.addColorStop(1, `rgba(150, 20, 0, 0.6)`);
  }
  ctx.fillStyle = cgGrad;
  ctx.beginPath();
  ctx.arc(cgX, cgY, crownGemR, 0, Math.PI * 2);
  ctx.fill();
  // Gem halo
  ctx.fillStyle = blue
    ? `rgba(96, 165, 250, ${0.15 + gemPulse * 0.15})`
    : `rgba(255, 200, 80, ${0.12 + gemPulse * 0.12})`;
  ctx.beginPath();
  ctx.arc(cgX, cgY, crownGemR * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // ── EYE — large, fierce raptor eye (side profile = one prominent eye) ──
  const eyeX = hx - headW * 0.35;
  const eyeY = headY + headH * 0.08;
  const eyeW = hs * 0.04;
  const eyeH = hs * 0.032;

  // Eye socket — dark recess
  ctx.fillStyle = `rgba(60, 20, 0, 0.35)`;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeW * 1.3, eyeH * 1.3, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Eye fire glow halo
  const eyeHaloR = hs * (blue ? 0.07 : 0.06);
  const eyeHalo = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeHaloR);
  if (blue) {
    eyeHalo.addColorStop(0, `rgba(147, 197, 253, ${0.4 + gemPulse * 0.3})`);
    eyeHalo.addColorStop(0.4, `rgba(96, 165, 250, ${0.2 + gemPulse * 0.12})`);
    eyeHalo.addColorStop(1, `rgba(59, 130, 246, 0)`);
  } else {
    eyeHalo.addColorStop(0, `rgba(255, 200, 60, ${0.35 + gemPulse * 0.25})`);
    eyeHalo.addColorStop(0.4, `rgba(255, 140, 30, ${0.15 + gemPulse * 0.1})`);
    eyeHalo.addColorStop(1, `rgba(255, 80, 0, 0)`);
  }
  ctx.fillStyle = eyeHalo;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeHaloR, 0, Math.PI * 2);
  ctx.fill();

  // Sclera — bright almond shape
  const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeW);
  if (blue) {
    eyeGrad.addColorStop(0, "#f0f8ff");
    eyeGrad.addColorStop(0.4, "#bfdbfe");
    eyeGrad.addColorStop(0.75, `rgba(96, 165, 250, ${0.85 + gemPulse * 0.15})`);
    eyeGrad.addColorStop(1, `rgba(37, 99, 235, 0.6)`);
  } else {
    eyeGrad.addColorStop(0, "#fffae8");
    eyeGrad.addColorStop(0.4, "#ffe680");
    eyeGrad.addColorStop(0.75, `rgba(255, 160, 40, ${0.85 + gemPulse * 0.15})`);
    eyeGrad.addColorStop(1, `rgba(200, 90, 10, 0.6)`);
  }
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeW, eyeH, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Iris — fierce color
  ctx.fillStyle = blue
    ? `rgba(29, 78, 216, ${0.92 + gemPulse * 0.08})`
    : `rgba(210, 60, 0, ${0.92 + gemPulse * 0.08})`;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, eyeH * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Pupil — vertical slit
  ctx.fillStyle = "#110300";
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeH * 0.15, eyeH * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();

  // Specular highlights
  ctx.fillStyle = `rgba(255, 255, 250, 0.75)`;
  ctx.beginPath();
  ctx.arc(eyeX - eyeW * 0.22, eyeY - eyeH * 0.25, eyeH * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 240, 0.35)`;
  ctx.beginPath();
  ctx.arc(eyeX + eyeW * 0.15, eyeY + eyeH * 0.15, eyeH * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eye outline — bold
  ctx.strokeStyle = `rgba(80, 30, 0, 0.55)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeW, eyeH, -0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Brow ridge above eye
  ctx.strokeStyle = `rgba(120, 50, 5, 0.4)`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(eyeX - eyeW * 1.2, eyeY - eyeH * 1.0);
  ctx.quadraticCurveTo(
    eyeX,
    eyeY - eyeH * 1.5,
    eyeX + eyeW * 1.0,
    eyeY - eyeH * 0.8,
  );
  ctx.stroke();

  // ── BEAK — massive hooked raptor beak, side profile ──
  const beakBaseX = hx - headW * 0.65;
  const beakBaseY = headY + headH * 0.15;
  const beakLen = hs * 0.22;
  const beakTipX = beakBaseX - beakLen;
  const beakTipY = beakBaseY + hs * 0.025;

  // Upper mandible — thick, curved hook
  const ubGrad = ctx.createLinearGradient(
    beakBaseX,
    beakBaseY - hs * 0.02,
    beakTipX,
    beakTipY,
  );
  ubGrad.addColorStop(0, "#dda020");
  ubGrad.addColorStop(0.2, "#cc8800");
  ubGrad.addColorStop(0.5, "#aa7700");
  ubGrad.addColorStop(0.8, "#886600");
  ubGrad.addColorStop(1, "#665000");
  ctx.fillStyle = ubGrad;
  ctx.beginPath();
  ctx.moveTo(beakBaseX, beakBaseY - hs * 0.025);
  ctx.bezierCurveTo(
    beakBaseX - beakLen * 0.3,
    beakBaseY - hs * 0.035,
    beakBaseX - beakLen * 0.7,
    beakBaseY - hs * 0.02,
    beakTipX,
    beakTipY,
  );
  // Hook curve at tip
  ctx.bezierCurveTo(
    beakTipX + hs * 0.01,
    beakTipY + hs * 0.02,
    beakTipX + hs * 0.035,
    beakTipY + hs * 0.015,
    beakBaseX - beakLen * 0.35,
    beakBaseY + hs * 0.01,
  );
  ctx.lineTo(beakBaseX, beakBaseY + hs * 0.005);
  ctx.closePath();
  ctx.fill();

  // Upper beak ridge highlight
  ctx.strokeStyle = `rgba(240, 200, 100, 0.4)`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(beakBaseX - hs * 0.01, beakBaseY - hs * 0.02);
  ctx.bezierCurveTo(
    beakBaseX - beakLen * 0.3,
    beakBaseY - hs * 0.03,
    beakBaseX - beakLen * 0.65,
    beakBaseY - hs * 0.018,
    beakTipX + hs * 0.01,
    beakTipY - hs * 0.003,
  );
  ctx.stroke();

  // Lower mandible
  const lmGrad = ctx.createLinearGradient(
    beakBaseX,
    beakBaseY,
    beakTipX + hs * 0.05,
    beakBaseY + hs * 0.02,
  );
  lmGrad.addColorStop(0, "#bb8810");
  lmGrad.addColorStop(0.5, "#997700");
  lmGrad.addColorStop(1, "#776000");
  ctx.fillStyle = lmGrad;
  ctx.beginPath();
  ctx.moveTo(beakBaseX, beakBaseY + hs * 0.008);
  ctx.bezierCurveTo(
    beakBaseX - beakLen * 0.25,
    beakBaseY + hs * 0.028,
    beakBaseX - beakLen * 0.55,
    beakBaseY + hs * 0.03,
    beakBaseX - beakLen * 0.38,
    beakBaseY + hs * 0.015,
  );
  ctx.lineTo(beakBaseX, beakBaseY + hs * 0.005);
  ctx.closePath();
  ctx.fill();

  // Beak separation line
  ctx.strokeStyle = `rgba(60, 30, 0, 0.35)`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(beakBaseX, beakBaseY + hs * 0.005);
  ctx.bezierCurveTo(
    beakBaseX - beakLen * 0.3,
    beakBaseY + hs * 0.012,
    beakBaseX - beakLen * 0.55,
    beakBaseY + hs * 0.014,
    beakBaseX - beakLen * 0.35,
    beakBaseY + hs * 0.012,
  );
  ctx.stroke();

  // Nostril
  ctx.fillStyle = `rgba(60, 30, 0, 0.45)`;
  ctx.beginPath();
  ctx.ellipse(
    beakBaseX - beakLen * 0.22,
    beakBaseY - hs * 0.012,
    hs * 0.008,
    hs * 0.005,
    -0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Beak outline
  ctx.strokeStyle = `rgba(70, 35, 0, 0.4)`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(beakBaseX, beakBaseY - hs * 0.025);
  ctx.bezierCurveTo(
    beakBaseX - beakLen * 0.3,
    beakBaseY - hs * 0.035,
    beakBaseX - beakLen * 0.7,
    beakBaseY - hs * 0.02,
    beakTipX,
    beakTipY,
  );
  ctx.stroke();

  // ── Cheek feather plume (back of head, flowing) ──
  const cheekCount = blue ? 8 : 7;
  for (let i = 0; i < cheekCount; i++) {
    const angle = Math.PI * 0.3 + i * 0.16;
    const fLen = hs * (0.09 + i * 0.014);
    const sway = Math.sin(time * 2.8 + i * 1.0) * hs * 0.01;
    const tipFX = hx + Math.cos(angle) * fLen + sway;
    const tipFY = headY + Math.sin(angle) * fLen;

    ctx.strokeStyle = blue
      ? `rgba(59, 130, 246, ${0.35 - i * 0.03})`
      : `rgba(200, 100, 20, ${0.35 - i * 0.03})`;
    ctx.lineWidth = (2 - i * 0.2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(hx + headW * 0.5, headY + headH * 0.3);
    ctx.quadraticCurveTo(
      hx + Math.cos(angle) * fLen * 0.5,
      headY + Math.sin(angle) * fLen * 0.5,
      tipFX,
      tipFY,
    );
    ctx.stroke();
  }

  // ── Ornamental face markings ──
  ctx.strokeStyle = blue ? `rgba(30, 64, 175, 0.3)` : `rgba(180, 50, 0, 0.25)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(eyeX - eyeW * 0.8, eyeY + eyeH * 1.2);
  ctx.quadraticCurveTo(
    eyeX - eyeW * 1.5,
    eyeY + eyeH * 2.5,
    eyeX - eyeW * 2.2,
    eyeY + eyeH * 2.0,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(eyeX - eyeW * 0.5, eyeY + eyeH * 1.4);
  ctx.quadraticCurveTo(
    eyeX - eyeW * 1.2,
    eyeY + eyeH * 2.8,
    eyeX - eyeW * 1.8,
    eyeY + eyeH * 2.5,
  );
  ctx.stroke();

  // ── Flaming crest / plume ──
  drawHelmetPlume(ctx, hx, headY, hs, time, zoom, flamePulse, blue);

  ctx.restore();
}

// ─── HELMET PLUME (grand fire plume) ────────────────────────────────────────

function drawHelmetPlume(
  ctx: CanvasRenderingContext2D,
  hx: number,
  headY: number,
  s: number,
  time: number,
  zoom: number,
  flamePulse: number,
  blue: boolean = false,
) {
  const plumeBaseY = headY - s * 0.13;

  // Back plume glow — larger and more dramatic
  const backGlowR = s * (blue ? 0.2 : 0.18);
  const backGlow = ctx.createRadialGradient(
    hx,
    plumeBaseY - s * 0.12,
    0,
    hx,
    plumeBaseY - s * 0.12,
    backGlowR,
  );
  if (blue) {
    backGlow.addColorStop(0, `rgba(96, 165, 250, ${0.25 + flamePulse * 0.15})`);
    backGlow.addColorStop(1, `rgba(59, 130, 246, 0)`);
  } else {
    backGlow.addColorStop(0, `rgba(255, 180, 50, ${0.25 + flamePulse * 0.12})`);
    backGlow.addColorStop(1, `rgba(255, 100, 20, 0)`);
  }
  ctx.fillStyle = backGlow;
  ctx.beginPath();
  ctx.arc(hx, plumeBaseY - s * 0.12, backGlowR, 0, Math.PI * 2);
  ctx.fill();

  // Main plume flames (layered) — taller and grander
  const plumeCount = blue ? 10 : 9;
  for (let i = 0; i < plumeCount; i++) {
    const spread = (i - (plumeCount - 1) / 2) * 0.2;
    const plumeLen = s * (0.18 + (1 - Math.abs(spread) / 0.7) * 0.1);
    const sway = Math.sin(time * 5 + i * 0.9) * s * 0.018;
    const flicker = Math.sin(time * 8 + i * 1.7) * s * 0.012;

    const tipX = hx + spread * s * 0.22 + sway;
    const tipY = plumeBaseY - plumeLen + flicker;

    const flameGrad = ctx.createLinearGradient(hx, plumeBaseY, tipX, tipY);
    if (blue) {
      flameGrad.addColorStop(0, `rgba(29, 78, 216, 0.85)`);
      flameGrad.addColorStop(0.3, `rgba(59, 130, 246, 0.75)`);
      flameGrad.addColorStop(
        0.6,
        `rgba(147, 197, 253, ${0.55 + flamePulse * 0.2})`,
      );
      flameGrad.addColorStop(
        1,
        `rgba(224, 240, 255, ${0.25 + flamePulse * 0.25})`,
      );
    } else {
      flameGrad.addColorStop(0, `rgba(200, 80, 10, 0.85)`);
      flameGrad.addColorStop(0.3, `rgba(230, 126, 34, 0.75)`);
      flameGrad.addColorStop(
        0.6,
        `rgba(255, 180, 50, ${0.55 + flamePulse * 0.2})`,
      );
      flameGrad.addColorStop(
        1,
        `rgba(255, 240, 120, ${0.25 + flamePulse * 0.25})`,
      );
    }

    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(hx + spread * s * 0.08, plumeBaseY);
    ctx.quadraticCurveTo(
      hx + spread * s * 0.16 + sway * 0.6,
      plumeBaseY - plumeLen * 0.5,
      tipX,
      tipY,
    );
    ctx.quadraticCurveTo(
      hx + spread * s * 0.1 - sway * 0.3,
      plumeBaseY - plumeLen * 0.3,
      hx - spread * s * 0.04,
      plumeBaseY,
    );
    ctx.closePath();
    ctx.fill();
  }

  // Hot core plume center — taller
  const corePlumeLen = s * (blue ? 0.24 : 0.22);
  const coreSway = Math.sin(time * 6) * s * 0.01;
  const coreGrad = ctx.createLinearGradient(
    hx,
    plumeBaseY,
    hx + coreSway,
    plumeBaseY - corePlumeLen,
  );
  if (blue) {
    coreGrad.addColorStop(0, `rgba(147, 197, 253, 0.75)`);
    coreGrad.addColorStop(
      0.5,
      `rgba(224, 240, 255, ${0.55 + flamePulse * 0.2})`,
    );
    coreGrad.addColorStop(1, `rgba(191, 219, 254, 0)`);
  } else {
    coreGrad.addColorStop(0, `rgba(255, 220, 100, 0.75)`);
    coreGrad.addColorStop(
      0.5,
      `rgba(255, 255, 200, ${0.55 + flamePulse * 0.2})`,
    );
    coreGrad.addColorStop(1, `rgba(255, 240, 180, 0)`);
  }

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.moveTo(hx - s * 0.018, plumeBaseY);
  ctx.quadraticCurveTo(
    hx + coreSway,
    plumeBaseY - corePlumeLen * 0.6,
    hx + coreSway,
    plumeBaseY - corePlumeLen,
  );
  ctx.quadraticCurveTo(
    hx + coreSway,
    plumeBaseY - corePlumeLen * 0.6,
    hx + s * 0.018,
    plumeBaseY,
  );
  ctx.closePath();
  ctx.fill();

  // Spark particles from plume tip — more particles
  const sparkCount = blue ? 7 : 5;
  for (let sp = 0; sp < sparkCount; sp++) {
    const sparkPhase = (time * 4 + sp * 0.2) % 1;
    const sparkX = hx + Math.sin(time * 7 + sp * 2.5) * s * 0.05;
    const sparkY = plumeBaseY - corePlumeLen + sparkPhase * s * -0.1;
    const sparkAlpha = (1 - sparkPhase) * 0.7;
    const sparkSize = (1.8 - sparkPhase * 0.9) * zoom;

    ctx.fillStyle = blue
      ? `rgba(224, 240, 255, ${sparkAlpha})`
      : `rgba(255, 220, 80, ${sparkAlpha})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── TALONS ─────────────────────────────────────────────────────────────────

function drawTalons(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  zoom: number,
  isAttacking: boolean,
  attackIntensity: number,
) {
  const talonY = y + s * 0.28;
  const talonSpread = isAttacking
    ? s * 0.16 + attackIntensity * s * 0.05
    : s * 0.12;

  for (let side = -1; side <= 1; side += 2) {
    const talonX = x + side * talonSpread;

    // Armored leg with gold band
    const legGrad = ctx.createLinearGradient(
      x + side * s * 0.08,
      y + s * 0.18,
      talonX,
      talonY,
    );
    legGrad.addColorStop(0, "#aa7700");
    legGrad.addColorStop(0.5, "#886600");
    legGrad.addColorStop(1, "#664400");

    ctx.strokeStyle = legGrad;
    ctx.lineWidth = 3 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.08, y + s * 0.18);
    ctx.lineTo(talonX, talonY);
    ctx.stroke();

    // Leg armor band
    const bandY = y + s * 0.22;
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * s * 0.06, bandY);
    ctx.lineTo(x + side * s * 0.12, bandY + s * 0.01);
    ctx.stroke();

    // Talon toes with sharp curved claws
    for (let t = 0; t < 3; t++) {
      const toeAngle = (t - 1) * 0.45 + side * 0.2;
      const toeLen = s * 0.06;
      const grab = isAttacking
        ? Math.sin(attackIntensity * Math.PI) * (0.12 + t * 0.03)
        : 0;
      const clawAngle = Math.PI / 2 + toeAngle + grab;

      // Toe
      ctx.strokeStyle = "#886600";
      ctx.lineWidth = 2 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(talonX, talonY);
      ctx.lineTo(
        talonX + Math.cos(clawAngle) * toeLen,
        talonY + Math.sin(clawAngle) * toeLen,
      );
      ctx.stroke();

      // Sharp claw tip
      const tipX = talonX + Math.cos(clawAngle) * toeLen;
      const tipY = talonY + Math.sin(clawAngle) * toeLen;
      ctx.strokeStyle = "#443300";
      ctx.lineWidth = 1.2 * zoom;
      ctx.beginPath();
      ctx.moveTo(tipX, tipY);
      ctx.lineTo(
        tipX + Math.cos(clawAngle + 0.3) * s * 0.02,
        tipY + Math.sin(clawAngle + 0.3) * s * 0.02,
      );
      ctx.stroke();
    }
  }
}

// ─── FIRE AURA ──────────────────────────────────────────────────────────────

function drawFireAura(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  time: number,
  flamePulse: number,
  isAttacking: boolean,
  zoom: number,
  blue: boolean = false,
) {
  const auraRadius =
    s * (0.7 + flamePulse * 0.15 + (isAttacking ? 0.2 : 0) + (blue ? 0.18 : 0));
  const auraAlpha =
    0.14 + flamePulse * 0.07 + (isAttacking ? 0.1 : 0) + (blue ? 0.08 : 0);

  const auraGrad = ctx.createRadialGradient(x, y, s * 0.12, x, y, auraRadius);
  if (blue) {
    auraGrad.addColorStop(0, `rgba(147, 197, 253, ${auraAlpha})`);
    auraGrad.addColorStop(0.3, `rgba(96, 165, 250, ${auraAlpha * 0.6})`);
    auraGrad.addColorStop(0.6, `rgba(59, 130, 246, ${auraAlpha * 0.3})`);
    auraGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
  } else {
    auraGrad.addColorStop(0, `rgba(255, 210, 90, ${auraAlpha})`);
    auraGrad.addColorStop(0.3, `rgba(255, 150, 40, ${auraAlpha * 0.6})`);
    auraGrad.addColorStop(0.6, `rgba(220, 70, 10, ${auraAlpha * 0.3})`);
    auraGrad.addColorStop(1, "rgba(150, 30, 0, 0)");
  }

  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, auraRadius, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting ember particles
  const emberCount = blue ? 14 : 10;
  for (let i = 0; i < emberCount; i++) {
    const orbitAngle =
      time * (blue ? 3.5 : 2.2) + (i * Math.PI * 2) / emberCount;
    const orbitDist = s * (0.32 + Math.sin(time * 1.3 + i) * 0.1);
    const emberX = x + Math.cos(orbitAngle) * orbitDist;
    const emberY = y + Math.sin(orbitAngle) * orbitDist * 0.6;
    const emberAlpha = 0.55 + Math.sin(time * 5 + i * 2) * 0.25;
    const emberSize =
      (1.8 + Math.sin(time * 4 + i) * 0.6 + (blue ? 0.5 : 0)) * zoom;

    const embGrad = ctx.createRadialGradient(
      emberX,
      emberY,
      0,
      emberX,
      emberY,
      emberSize,
    );
    if (blue) {
      embGrad.addColorStop(0, `rgba(224, 240, 255, ${emberAlpha})`);
      embGrad.addColorStop(1, "rgba(96, 165, 250, 0)");
    } else {
      embGrad.addColorStop(0, `rgba(255, 240, 120, ${emberAlpha})`);
      embGrad.addColorStop(1, "rgba(255, 140, 40, 0)");
    }
    ctx.fillStyle = embGrad;
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Rising cinder sparks
  const cinderCount = blue ? 10 : 7;
  for (let i = 0; i < cinderCount; i++) {
    const cinderPhase = (time * (blue ? 2.5 : 1.5) + i * 0.2) % 1;
    const cinderX = x + Math.sin(time * 2 + i * 1.8) * s * 0.25;
    const cinderY = y + s * 0.3 - cinderPhase * s * 0.8;
    const cinderAlpha = Math.sin(cinderPhase * Math.PI) * (blue ? 0.6 : 0.45);

    ctx.fillStyle = blue
      ? `rgba(147, 197, 253, ${cinderAlpha})`
      : `rgba(255, 200, 60, ${cinderAlpha})`;
    ctx.beginPath();
    ctx.arc(cinderX, cinderY, zoom * (blue ? 1.3 : 1), 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── ATTACK FLARE ───────────────────────────────────────────────────────────

function drawAttackFlare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  attackIntensity: number,
  time: number,
  zoom: number,
  blue: boolean = false,
) {
  const flarePhase = Math.sin(attackIntensity * Math.PI);
  const flareRadius = s * (0.55 + (blue ? 0.15 : 0)) * flarePhase;

  // Bright flash
  const flareGrad = ctx.createRadialGradient(
    x,
    y - s * 0.1,
    0,
    x,
    y - s * 0.1,
    flareRadius,
  );
  if (blue) {
    flareGrad.addColorStop(0, `rgba(224, 240, 255, ${0.7 * flarePhase})`);
    flareGrad.addColorStop(0.2, `rgba(147, 197, 253, ${0.5 * flarePhase})`);
    flareGrad.addColorStop(0.5, `rgba(59, 130, 246, ${0.3 * flarePhase})`);
    flareGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
  } else {
    flareGrad.addColorStop(0, `rgba(255, 255, 230, ${0.65 * flarePhase})`);
    flareGrad.addColorStop(0.2, `rgba(255, 220, 100, ${0.45 * flarePhase})`);
    flareGrad.addColorStop(0.5, `rgba(255, 140, 30, ${0.25 * flarePhase})`);
    flareGrad.addColorStop(1, "rgba(200, 50, 10, 0)");
  }
  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.1, flareRadius, 0, Math.PI * 2);
  ctx.fill();

  // Radial burst lines
  const burstCount = blue ? 14 : 10;
  for (let i = 0; i < burstCount; i++) {
    const angle = (i / burstCount) * Math.PI * 2 + time * (blue ? 6 : 4);
    const lineLen = s * (0.35 + (blue ? 0.1 : 0)) * flarePhase;
    const lineAlpha = flarePhase * (blue ? 0.55 : 0.45);
    const innerR = s * 0.08;

    ctx.strokeStyle = blue
      ? i % 2 === 0
        ? `rgba(147, 197, 253, ${lineAlpha})`
        : `rgba(96, 165, 250, ${lineAlpha * 0.7})`
      : i % 2 === 0
        ? `rgba(255, 200, 60, ${lineAlpha})`
        : `rgba(255, 140, 40, ${lineAlpha * 0.7})`;
    ctx.lineWidth = (i % 2 === 0 ? 2 : 1.2) * zoom;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(angle) * innerR,
      y - s * 0.1 + Math.sin(angle) * innerR,
    );
    ctx.lineTo(
      x + Math.cos(angle) * (innerR + lineLen),
      y - s * 0.1 + Math.sin(angle) * (innerR + lineLen),
    );
    ctx.stroke();
  }
}
