import type { Position } from "../../types";
import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow, getPerformanceSettings, getCachedLinearGradient, getScenePressure } from "../performance";
import { drawArmoredSkirt } from "../troops/troopHelpers";

// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                  MORPH TRANSITION SYSTEM (Normal ↔ Blue Inferno)         ║
// ╚════════════════════════════════════════════════════════════════════════════╝

let _simpleGrad = false;

const BLUE_INFERNO_DURATION_MS = 6000;
const MORPH_DURATION_MS = 1400;

function easeInOutQuart(t: number): number {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function getMorphProgress(abilityEnd: number): number {
  const now = Date.now();
  const abilityStart = abilityEnd - BLUE_INFERNO_DURATION_MS;
  const elapsed = now - abilityStart;
  const remaining = abilityEnd - now;

  if (elapsed < 0) return 0;
  if (remaining < 0) return 0;

  if (elapsed < MORPH_DURATION_MS) {
    return easeInOutQuart(elapsed / MORPH_DURATION_MS);
  }
  if (remaining < MORPH_DURATION_MS) {
    return easeInOutQuart(remaining / MORPH_DURATION_MS);
  }
  return 1.0;
}

function getMorphDirection(abilityEnd: number): "morphIn" | "morphOut" {
  const now = Date.now();
  const remaining = abilityEnd - now;
  if (remaining < MORPH_DURATION_MS) return "morphOut";
  return "morphIn";
}

function drawFireMorphTransition(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, s: number,
  time: number, zoom: number, morphT: number,
  direction: "morphIn" | "morphOut",
) {
  const toBlue = direction === "morphIn";
  const intensity = morphT < 0.5
    ? morphT * 2
    : (1 - morphT) * 2;

  // Fire vortex ring — smooth expanding/contracting
  const vortexR = s * (0.25 + intensity * 0.35 + Math.sin(time * 3) * 0.02);
  const ringRGB = toBlue ? "96,165,250" : "255,160,40";
  ctx.strokeStyle = `rgba(${ringRGB},${intensity * 0.35})`;
  ctx.lineWidth = (1 + intensity * 1.5) * zoom;
  ctx.beginPath();
  ctx.arc(x, y, vortexR, 0, Math.PI * 2);
  ctx.stroke();

  if (intensity > 0.1) {
    const innerRingR = vortexR * 0.6;
    const innerRGB = toBlue ? "147,197,253" : "255,200,80";
    ctx.strokeStyle = `rgba(${innerRGB},${intensity * 0.2})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, innerRingR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Gentle converging fire wisps
  const wispCount = Math.floor(6 + intensity * 8);
  for (let i = 0; i < wispCount; i++) {
    const angle = (i / wispCount) * Math.PI * 2 + time * 0.6;
    const outerR = s * (0.55 + (1 - intensity) * 0.15);
    const innerR = s * (0.55 - intensity * 0.45);
    const ox = x + Math.cos(angle) * outerR;
    const oy = y + Math.sin(angle) * outerR * 0.55;
    const ix = x + Math.cos(angle + intensity * 0.3) * innerR;
    const iy = y + Math.sin(angle + intensity * 0.3) * innerR * 0.55;
    const sway = Math.sin(time * 2.5 + i * 1.2) * s * 0.02 * intensity;

    const fromRGB = toBlue ? "255,140,30" : "59,130,246";
    const toRGB = toBlue ? "59,130,246" : "255,140,30";
    const mixed = lerpColorStr(fromRGB, toRGB, morphT);

    ctx.strokeStyle = `rgba(${mixed},${intensity * 0.4})`;
    ctx.lineWidth = (1.5 + intensity * 2) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.quadraticCurveTo(
      (ox + ix) / 2 + sway, (oy + iy) / 2 + sway,
      ix, iy,
    );
    ctx.stroke();
  }

  // Soft ember particles spiraling in/out
  const emberCount = Math.floor(intensity * 14);
  for (let i = 0; i < emberCount; i++) {
    const phase = (time * 1.2 + i * 0.15) % 1;
    const angle = (i / Math.max(emberCount, 1)) * Math.PI * 2 + time * 0.8;
    const dist = s * (0.45 * (1 - intensity * 0.7) + (1 - phase) * 0.15);
    const ex = x + Math.cos(angle) * dist;
    const ey = y + Math.sin(angle) * dist * 0.55;
    const eAlpha = intensity * Math.sin(phase * Math.PI) * 0.45;

    const emberRGB = toBlue ? "191,219,254" : "255,220,100";
    ctx.fillStyle = `rgba(${emberRGB},${eAlpha})`;
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(time * 1.5 + i * 1.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.01 * zoom, s * 0.004 * zoom, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Smooth radiant flash at crossover point
  if (morphT > 0.35 && morphT < 0.65) {
    const flashT = 1 - Math.abs(morphT - 0.5) / 0.15;
    const flashAlpha = flashT * 0.4;
    const flashGrad = ctx.createRadialGradient(x, y, 0, x, y, s * 0.5);
    if (toBlue) {
      flashGrad.addColorStop(0, `rgba(224,240,255,${flashAlpha})`);
      flashGrad.addColorStop(0.3, `rgba(147,197,253,${flashAlpha * 0.5})`);
      flashGrad.addColorStop(0.6, `rgba(59,130,246,${flashAlpha * 0.2})`);
      flashGrad.addColorStop(1, "rgba(29,78,216,0)");
    } else {
      flashGrad.addColorStop(0, `rgba(255,255,220,${flashAlpha})`);
      flashGrad.addColorStop(0.3, `rgba(255,200,80,${flashAlpha * 0.5})`);
      flashGrad.addColorStop(0.6, `rgba(255,120,20,${flashAlpha * 0.2})`);
      flashGrad.addColorStop(1, "rgba(200,50,10,0)");
    }
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
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

  const morphT = abilityEnd != null ? getMorphProgress(abilityEnd) : -1;

  if (morphT > 0 && morphT < 1) {
    const direction = abilityEnd != null ? getMorphDirection(abilityEnd) : "morphIn" as const;
    const toBlue = direction === "morphIn";

    const fadeOutAlpha = 1 - morphT;
    const fadeInAlpha = morphT;

    if (fadeOutAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = (ctx.globalAlpha ?? 1) * fadeOutAlpha;
      drawNassauForm(ctx, x, y, s, time, zoom, attackPhase, targetPos, !toBlue);
      ctx.restore();
    }

    if (fadeInAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = (ctx.globalAlpha ?? 1) * fadeInAlpha;
      drawNassauForm(ctx, x, y, s, time, zoom, attackPhase, targetPos, toBlue);
      ctx.restore();
    }

    drawFireMorphTransition(ctx, x, y, s, time, zoom, morphT, direction);
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
  const perf = getPerformanceSettings();
  const pressure = getScenePressure();
  _simpleGrad = perf.simplifiedGradients || pressure.forceSimplifiedGradients;

  const isAttacking = attackPhase > 0 || blue;
  const attackIntensity = blue ? Math.max(attackPhase, 0.4) : attackPhase;
  const atkPow = isAttacking ? attackIntensity : 0;
  const atkBurst = Math.sin(atkPow * Math.PI);
  const smoothAtk = atkBurst * atkBurst;
  const blueBoost = blue ? 0.4 : 0;
  const flamePulse =
    Math.sin(time * 3.5) * 0.5 + 0.5 + smoothAtk * 0.25 + blueBoost;
  const wingFlap =
    Math.sin(time * 5.5) * (0.7 + smoothAtk * 0.25 + blueBoost * 0.2);
  const breathe = Math.sin(time * 2.5) * (3 + smoothAtk * 3 + blueBoost * 2.5);
  const hover = Math.sin(time * 3) * s * (0.06 + smoothAtk * 0.02);
  const headBob = Math.sin(time * 3 + 0.8) * s * 0.02;
  const bodyGlow =
    0.6 + Math.sin(time * 2.5) * 0.2 + smoothAtk * 0.25 + blueBoost * 0.25;
  const gemPulse = Math.sin(time * 4) * 0.5 + 0.5;
  const bodyRock = isAttacking
    ? Math.sin(attackIntensity * Math.PI) * s * 0.006
    : 0;

  const cy = y + hover;
  const bx = x + bodyRock;
  const headY = cy + headBob;

  if (blue) {
    drawBlueInfernoAura(ctx, bx, cy, s, time, zoom);
  }

  if (!_simpleGrad) {
    drawHeatDistortion(ctx, bx, cy, s, time, zoom, smoothAtk, blue);
  }
  drawFireTrail(ctx, bx, cy, s, time, flamePulse, zoom, smoothAtk, blue);
  drawTailPlumage(ctx, bx, cy, s, time, zoom, flamePulse, isAttacking, smoothAtk, blue);
  // Both wings render below the body
  drawWings(ctx, bx, cy, s, time, zoom, wingFlap, isAttacking, attackIntensity, "back", blue);
  drawWings(ctx, bx, cy, s, time, zoom, wingFlap, isAttacking, attackIntensity, "front", blue);
  if (!_simpleGrad) {
    drawWingFireCascade(ctx, bx, cy, s, time, zoom, wingFlap, flamePulse, blue);
  }
  // Body and armor render on top of both wings
  drawCapeStraps(ctx, bx, cy, s, time, zoom, flamePulse, blue);
  drawBody(ctx, bx, cy, s, breathe, time, flamePulse, zoom, bodyGlow, isAttacking, smoothAtk, blue);
  drawArmorPlates(ctx, bx, cy, s, time, zoom, flamePulse, gemPulse, blue);
  drawHarness(ctx, bx, cy, s, time, zoom, gemPulse, blue);
  drawArmoredSkirt(ctx, bx, cy, s, zoom, Math.sin(time * 3) * 1.2, breathe, blue
    ? { armorPeak: "#93c5fd", armorHigh: "#3b82f6", armorMid: "#1e40af", armorDark: "#1e3a8a", trimColor: "#bfdbfe" }
    : { armorPeak: "#f0a040", armorHigh: "#c07020", armorMid: "#8a4a10", armorDark: "#5a2a08", trimColor: "#ffd080" },
    { plateCount: 7, widthFactor: 0.52, depthFactor: 0.14, topOffset: 0.14 },
  );
  drawShoulderPauldrons(ctx, bx, cy, s, time, zoom, wingFlap, flamePulse, gemPulse, blue);
  drawNeck(ctx, bx, headY, s, time, zoom, flamePulse, targetPos, blue);
  drawHelmet(ctx, bx, headY, s, time, zoom, flamePulse, gemPulse, isAttacking, attackIntensity, targetPos, blue);
  drawTalons(ctx, bx, cy, s, time, zoom, isAttacking, attackIntensity);
  if (!_simpleGrad) {
    drawFireAura(ctx, bx, cy, s, time, flamePulse, isAttacking, zoom, blue);
  }
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

    if (_simpleGrad) {
      ctx.fillStyle = blue
        ? `rgba(147, 197, 253, ${trailAlpha * 0.7})`
        : `rgba(255, 160, 40, ${trailAlpha * 0.7})`;
    } else {
      const grad = ctx.createRadialGradient(trailX, trailY, 0, trailX, trailY, trailSize);
      if (blue) {
        grad.addColorStop(0, `rgba(224, 240, 255, ${trailAlpha})`);
        grad.addColorStop(0.35, `rgba(96, 165, 250, ${trailAlpha * 0.7})`);
        grad.addColorStop(0.7, `rgba(59, 130, 246, ${trailAlpha * 0.4})`);
        grad.addColorStop(1, "rgba(29, 78, 216, 0)");
      } else {
        grad.addColorStop(0, `rgba(255, ${230 - Math.floor(atkBurst * 40)}, ${120 - Math.floor(atkBurst * 60)}, ${trailAlpha})`);
        grad.addColorStop(0.35, `rgba(255, 160, 40, ${trailAlpha * 0.7})`);
        grad.addColorStop(0.7, `rgba(220, 70, 10, ${trailAlpha * 0.4})`);
        grad.addColorStop(1, "rgba(150, 30, 0, 0)");
      }
      ctx.fillStyle = grad;
    }
    ctx.beginPath();
    ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── WING FEATHER LINE ART HELPERS ──────────────────────────────────────────

function drawFeatherBarbs(
  ctx: CanvasRenderingContext2D,
  baseX: number, baseY: number,
  tipX: number, tipY: number,
  perpNx: number, perpNy: number,
  featherLen: number, vaneWidth: number,
  side: number, zoom: number, blue: boolean,
  alpha: number, barbCount: number,
) {
  if (alpha < 0.02) return;
  ctx.strokeStyle = blue
    ? `rgba(30, 58, 138, ${alpha})`
    : `rgba(100, 40, 5, ${alpha})`;
  ctx.lineWidth = 0.5 * zoom;

  const dx = tipX - baseX;
  const dy = tipY - baseY;

  for (let b = 0; b < barbCount; b++) {
    const t = 0.15 + (b / barbCount) * 0.7;
    const mx = baseX + dx * t;
    const my = baseY + dy * t;
    const barbLen = vaneWidth * (0.6 + (1 - t) * 0.3);

    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(
      mx + perpNx * barbLen * 0.9 * side + dx * 0.06,
      my + perpNy * barbLen * 0.9 + dy * 0.06,
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.lineTo(
      mx - perpNx * barbLen * 0.3 * side + dx * 0.06,
      my - perpNy * barbLen * 0.3 + dy * 0.06,
    );
    ctx.stroke();
  }
}

function drawMembraneFeatherLines(
  ctx: CanvasRenderingContext2D,
  shoulderX: number, shoulderY: number,
  elbowX: number, elbowY: number,
  humCpX: number, humCpY: number,
  innerTrailY: number, flapAngle: number,
  ripple: number, s: number, side: number,
  wingSpread: number, innerRatio: number,
  zoom: number, blue: boolean, atkBurst: number,
) {
  const rowCount = 8;
  ctx.lineWidth = 0.6 * zoom;

  for (let row = 0; row < rowCount; row++) {
    const rowT = (row + 1) / (rowCount + 1);
    const alpha = 0.2 + atkBurst * 0.05 - Math.abs(rowT - 0.5) * 0.12;
    if (alpha < 0.03) continue;

    ctx.strokeStyle = blue
      ? `rgba(30, 64, 175, ${alpha})`
      : `rgba(120, 50, 8, ${alpha})`;

    ctx.beginPath();
    const segments = 10;
    for (let seg = 0; seg <= segments; seg++) {
      const spanT = seg / segments;
      const u = 1 - spanT;
      const boneX = u * u * shoulderX + 2 * u * spanT * humCpX + spanT * spanT * elbowX;
      const boneY = u * u * shoulderY + 2 * u * spanT * humCpY + spanT * spanT * elbowY;
      const innerBotCp1Y = elbowY + s * 0.24 + flapAngle * s * 0.10;
      const innerBotCp2Y = innerTrailY + flapAngle * s * 0.07;
      const trailBotY = spanT * spanT * spanT * elbowY + 3 * spanT * spanT * u * innerBotCp1Y + 3 * spanT * u * u * innerBotCp2Y + u * u * u * innerTrailY;
      const lx = boneX;
      const ly = boneY + (trailBotY - boneY) * rowT;

      if (seg === 0) {
        ctx.moveTo(lx, ly);
      } else {
        ctx.lineTo(lx, ly);
      }
    }
    ctx.stroke();
  }

  // Scalloped edge hints along the inner trailing edge
  const scallops = 6;
  ctx.lineWidth = 0.7 * zoom;
  for (let sc = 0; sc < scallops; sc++) {
    const t1 = sc / scallops;
    const t2 = (sc + 1) / scallops;
    const tMid = (t1 + t2) / 2;

    const u1 = 1 - t1;
    const u2 = 1 - t2;
    const uM = 1 - tMid;

    const bx1 = u1 * u1 * shoulderX + 2 * u1 * t1 * humCpX + t1 * t1 * elbowX;
    const bx2 = u2 * u2 * shoulderX + 2 * u2 * t2 * humCpX + t2 * t2 * elbowX;
    const bxM = uM * uM * shoulderX + 2 * uM * tMid * humCpX + tMid * tMid * elbowX;

    const innerBotCp1Y = elbowY + s * 0.24 + flapAngle * s * 0.10;
    const innerBotCp2Y = innerTrailY + flapAngle * s * 0.07;
    const by1 = t1 * t1 * t1 * elbowY + 3 * t1 * t1 * u1 * innerBotCp1Y + 3 * t1 * u1 * u1 * innerBotCp2Y + u1 * u1 * u1 * innerTrailY;
    const by2 = t2 * t2 * t2 * elbowY + 3 * t2 * t2 * u2 * innerBotCp1Y + 3 * t2 * u2 * u2 * innerBotCp2Y + u2 * u2 * u2 * innerTrailY;
    const byM = tMid * tMid * tMid * elbowY + 3 * tMid * tMid * uM * innerBotCp1Y + 3 * tMid * uM * uM * innerBotCp2Y + uM * uM * uM * innerTrailY;

    const alpha = 0.18 - sc * 0.015;
    ctx.strokeStyle = blue
      ? `rgba(30, 58, 138, ${alpha})`
      : `rgba(100, 40, 5, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(bx1, by1);
    ctx.quadraticCurveTo(bxM, byM - s * 0.025, bx2, by2);
    ctx.stroke();
  }
}

function drawOuterMembraneFeatherLines(
  ctx: CanvasRenderingContext2D,
  elbowX: number, elbowY: number,
  wingTipX: number, wingTipY: number,
  radCpX: number, radCpY: number,
  outerStartX: number, outerStartTopY: number,
  outerStartBotY: number, outerTrailY: number,
  outerSpan: number,
  flapAngle: number, ripple: number,
  s: number, side: number, zoom: number,
  blue: boolean, atkBurst: number,
) {
  const rowCount = 10;
  ctx.lineWidth = 0.6 * zoom;

  for (let row = 0; row < rowCount; row++) {
    const rowT = (row + 1) / (rowCount + 1);
    const alpha = 0.22 + atkBurst * 0.05 - Math.abs(rowT - 0.5) * 0.12;
    if (alpha < 0.03) continue;

    ctx.strokeStyle = blue
      ? `rgba(30, 64, 175, ${alpha})`
      : `rgba(120, 50, 8, ${alpha})`;

    ctx.beginPath();
    const segments = 12;
    for (let seg = 0; seg <= segments; seg++) {
      const spanT = seg / segments;
      const u = 1 - spanT;
      const boneX = u * u * elbowX + 2 * u * spanT * radCpX + spanT * spanT * wingTipX;
      const boneY = u * u * elbowY + 2 * u * spanT * radCpY + spanT * spanT * wingTipY;
      const outerBotCp1Y = elbowY + s * 0.20 + flapAngle * s * 0.38;
      const outerBotCp2Y = outerTrailY + flapAngle * s * 0.16;
      const trailBotY = spanT * spanT * spanT * wingTipY + 3 * spanT * spanT * u * outerBotCp1Y + 3 * spanT * u * u * outerBotCp2Y + u * u * u * outerStartBotY;
      const lx = boneX;
      const ly = boneY + (trailBotY - boneY) * rowT;

      if (seg === 0) {
        ctx.moveTo(lx, ly);
      } else {
        ctx.lineTo(lx, ly);
      }
    }
    ctx.stroke();
  }

  // Scalloped edge hints along the outer trailing edge
  const scallops = 8;
  ctx.lineWidth = 0.7 * zoom;
  for (let sc = 0; sc < scallops; sc++) {
    const t1 = sc / scallops;
    const t2 = (sc + 1) / scallops;
    const tMid = (t1 + t2) / 2;

    const u1 = 1 - t1;
    const u2 = 1 - t2;
    const uM = 1 - tMid;

    const bx1 = u1 * u1 * elbowX + 2 * u1 * t1 * radCpX + t1 * t1 * wingTipX;
    const bx2 = u2 * u2 * elbowX + 2 * u2 * t2 * radCpX + t2 * t2 * wingTipX;
    const bxM = uM * uM * elbowX + 2 * uM * tMid * radCpX + tMid * tMid * wingTipX;

    const outerBotCp1Y = elbowY + s * 0.20 + flapAngle * s * 0.38;
    const outerBotCp2Y = outerTrailY + flapAngle * s * 0.16;
    const by1 = t1 * t1 * t1 * wingTipY + 3 * t1 * t1 * u1 * outerBotCp1Y + 3 * t1 * u1 * u1 * outerBotCp2Y + u1 * u1 * u1 * outerStartBotY;
    const by2 = t2 * t2 * t2 * wingTipY + 3 * t2 * t2 * u2 * outerBotCp1Y + 3 * t2 * u2 * u2 * outerBotCp2Y + u2 * u2 * u2 * outerStartBotY;
    const byM = tMid * tMid * tMid * wingTipY + 3 * tMid * tMid * uM * outerBotCp1Y + 3 * tMid * uM * uM * outerBotCp2Y + uM * uM * uM * outerStartBotY;

    const alpha = 0.20 - sc * 0.012;
    ctx.strokeStyle = blue
      ? `rgba(30, 58, 138, ${alpha})`
      : `rgba(100, 40, 5, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(bx1, by1);
    ctx.quadraticCurveTo(bxM, byM - s * 0.02, bx2, by2);
    ctx.stroke();
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
  const smoothWingAtk = atkBurst * atkBurst;
  const flapAngle =
    wingFlap + (isAttacking ? smoothWingAtk * 0.25 : 0);
  const wingSpread = s * (1.3 + flapAngle * flapAngle * 0.64 + smoothWingAtk * 0.15);
  const side = layer === "back" ? 1 : -1;

  ctx.save();

  // ─── Articulated two-segment joint positions ───
  const shoulderX = x + side * s * 0.14;
  const shoulderY = y - s * 0.06;

  const innerRatio = 0.38;
  const elbowX = shoulderX + side * wingSpread * innerRatio;
  const elbowY = shoulderY - s * 0.12 + flapAngle * s * 0.06 + smoothWingAtk * s * 0.02;

  const wingTipX = elbowX + side * wingSpread * (1 - innerRatio);
  const wingTipY = elbowY - s * 0.22 + flapAngle * s * 0.55 + smoothWingAtk * s * 0.06;

  const ripple = isAttacking
    ? Math.sin(attackIntensity * Math.PI + time * 2) * s * 0.005
    : 0;

  // ─── Wing glow underlay ───
  const glowCx = shoulderX + side * wingSpread * 0.45;
  const glowCy = (shoulderY + wingTipY) * 0.5;
  const glowIntensity =
    0.12 + flapAngle * 0.05 + atkBurst * 0.15 + (blue ? 0.1 : 0);
  const glowR = wingSpread * (0.5 + atkBurst * 0.15);
  const glowGrad = ctx.createRadialGradient(
    glowCx, glowCy, 0, glowCx, glowCy, glowR,
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
  ctx.arc(glowCx, glowCy, glowR, 0, Math.PI * 2);
  ctx.fill();

  // ─── Inner membrane (shoulder → elbow) ───
  const innerTrailY = shoulderY + s * 0.38;
  const innerGrad = ctx.createLinearGradient(
    shoulderX, shoulderY, elbowX, elbowY,
  );
  if (blue) {
    innerGrad.addColorStop(0, "rgba(29, 78, 216, 0.95)");
    innerGrad.addColorStop(0.4, "rgba(59, 130, 246, 0.9)");
    innerGrad.addColorStop(0.8, "rgba(96, 165, 250, 0.85)");
    innerGrad.addColorStop(
      1,
      `rgba(147, 197, 253, ${0.75 + atkBurst * 0.1})`,
    );
  } else {
    innerGrad.addColorStop(0, "rgba(180, 80, 15, 0.95)");
    innerGrad.addColorStop(0.4, "rgba(230, 126, 34, 0.9)");
    innerGrad.addColorStop(
      0.8,
      `rgba(255, ${170 + Math.floor(atkBurst * 40)}, ${60 + Math.floor(atkBurst * 40)}, 0.85)`,
    );
    innerGrad.addColorStop(
      1,
      `rgba(255, ${210 + Math.floor(atkBurst * 30)}, ${90 + Math.floor(atkBurst * 50)}, ${0.75 + atkBurst * 0.1})`,
    );
  }

  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.bezierCurveTo(
    shoulderX + side * wingSpread * innerRatio * 0.35,
    shoulderY - s * (0.55 - flapAngle * 0.10) + ripple,
    shoulderX + side * wingSpread * innerRatio * 0.7,
    elbowY - s * 0.20 + ripple * 0.7,
    elbowX,
    elbowY,
  );
  ctx.bezierCurveTo(
    shoulderX + side * wingSpread * innerRatio * 0.7,
    elbowY + s * 0.24 + flapAngle * s * 0.10,
    shoulderX + side * wingSpread * innerRatio * 0.35,
    innerTrailY + flapAngle * s * 0.07,
    shoulderX,
    innerTrailY,
  );
  ctx.closePath();
  ctx.fill();

  // ─── Outer membrane (elbow → wingtip) ───
  // Overlap inward past elbow to close the seam between inner/outer sections
  const elbowOverlap = side * wingSpread * 0.22;
  const outerStartX = elbowX - elbowOverlap;
  const outerStartTopY = elbowY - s * 0.06;
  const outerTrailY = elbowY + s * 0.30;
  const outerStartBotY = outerTrailY + s * 0.04;
  const outerSpan = wingSpread * (1 - innerRatio) + wingSpread * 0.14;
  const outerGrad = ctx.createLinearGradient(
    elbowX, elbowY, wingTipX, wingTipY,
  );
  if (blue) {
    outerGrad.addColorStop(0, "rgba(59, 130, 246, 0.95)");
    outerGrad.addColorStop(0.3, "rgba(96, 165, 250, 0.92)");
    outerGrad.addColorStop(0.6, "rgba(147, 197, 253, 0.85)");
    outerGrad.addColorStop(
      0.85,
      `rgba(191, 219, 254, ${0.7 + atkBurst * 0.15})`,
    );
    outerGrad.addColorStop(
      1,
      `rgba(224, 240, 255, ${0.55 + atkBurst * 0.2})`,
    );
  } else {
    outerGrad.addColorStop(0, "rgba(230, 126, 34, 0.95)");
    outerGrad.addColorStop(
      0.3,
      `rgba(255, ${170 + Math.floor(atkBurst * 40)}, ${60 + Math.floor(atkBurst * 40)}, 0.92)`,
    );
    outerGrad.addColorStop(
      0.6,
      `rgba(255, ${210 + Math.floor(atkBurst * 30)}, ${90 + Math.floor(atkBurst * 50)}, 0.85)`,
    );
    outerGrad.addColorStop(
      0.85,
      `rgba(255, 240, 150, ${0.7 + atkBurst * 0.15})`,
    );
    outerGrad.addColorStop(
      1,
      `rgba(255, 255, 200, ${0.55 + atkBurst * 0.2})`,
    );
  }

  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(outerStartX, outerStartTopY);
  ctx.bezierCurveTo(
    outerStartX + side * outerSpan * 0.35,
    elbowY - s * (0.40 - flapAngle * 0.18) + ripple * 0.5,
    outerStartX + side * outerSpan * 0.7,
    wingTipY - s * 0.04 + ripple * 0.3,
    wingTipX,
    wingTipY,
  );
  ctx.bezierCurveTo(
    outerStartX + side * outerSpan * 0.85,
    elbowY + s * 0.20 + flapAngle * s * 0.38,
    outerStartX + side * outerSpan * 0.4,
    outerTrailY + flapAngle * s * 0.16,
    outerStartX,
    outerStartBotY,
  );
  ctx.closePath();
  ctx.fill();

  // ─── Elbow joint knuckle ───
  const knR = s * (0.04 + atkBurst * 0.012);
  const knGrad = ctx.createRadialGradient(
    elbowX, elbowY, 0, elbowX, elbowY, knR,
  );
  if (blue) {
    knGrad.addColorStop(
      0,
      `rgba(147, 197, 253, ${0.7 + atkBurst * 0.15})`,
    );
    knGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.6)");
    knGrad.addColorStop(1, "rgba(29, 78, 216, 0.3)");
  } else {
    knGrad.addColorStop(
      0,
      `rgba(255, 210, 100, ${0.7 + atkBurst * 0.15})`,
    );
    knGrad.addColorStop(0.5, "rgba(220, 120, 30, 0.6)");
    knGrad.addColorStop(1, "rgba(160, 70, 10, 0.3)");
  }
  ctx.fillStyle = knGrad;
  ctx.beginPath();
  ctx.arc(elbowX, elbowY, knR, 0, Math.PI * 2);
  ctx.fill();

  // ─── Bone: humerus (shoulder → elbow) ───
  ctx.strokeStyle = blue
    ? `rgba(30, 64, 175, ${0.6 + atkBurst * 0.15})`
    : `rgba(160, 70, 10, ${0.6 + atkBurst * 0.15})`;
  ctx.lineWidth = (3.2 + atkBurst * 0.8) * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY);
  ctx.quadraticCurveTo(
    (shoulderX + elbowX) / 2,
    (shoulderY + elbowY) / 2 - s * 0.06 + ripple * 0.4,
    elbowX,
    elbowY,
  );
  ctx.stroke();

  // ─── Bone: radius (elbow → wingtip) ───
  ctx.strokeStyle = blue
    ? `rgba(30, 64, 175, ${0.55 + atkBurst * 0.12})`
    : `rgba(160, 70, 10, ${0.55 + atkBurst * 0.12})`;
  ctx.lineWidth = (2.8 + atkBurst * 0.6) * zoom;
  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY);
  ctx.quadraticCurveTo(
    (elbowX + wingTipX) / 2,
    (elbowY + wingTipY) / 2 - s * 0.05 + ripple * 0.2,
    wingTipX,
    wingTipY,
  );
  ctx.stroke();

  // ─── Secondary bone (ulna, shoulder → elbow → outer) ───
  ctx.strokeStyle = blue
    ? `rgba(37, 99, 235, ${0.4 + atkBurst * 0.1})`
    : `rgba(140, 60, 8, ${0.4 + atkBurst * 0.1})`;
  ctx.lineWidth = 2.0 * zoom;
  ctx.beginPath();
  ctx.moveTo(shoulderX, shoulderY + s * 0.04);
  ctx.quadraticCurveTo(
    (shoulderX + elbowX) / 2 + side * s * 0.01,
    (shoulderY + elbowY) / 2 + s * 0.02 + ripple * 0.3,
    elbowX,
    elbowY + s * 0.03,
  );
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(elbowX, elbowY + s * 0.03);
  ctx.quadraticCurveTo(
    (elbowX + wingTipX) / 2,
    (elbowY + wingTipY) / 2 + s * 0.02 + ripple * 0.15,
    wingTipX - side * wingSpread * 0.08,
    wingTipY + s * 0.03,
  );
  ctx.stroke();

  // ─── Covert feathers (inner wing: shoulder → elbow) ───
  // Humerus bone control point (must match the drawn bone quadratic curve)
  const humCpX = (shoulderX + elbowX) / 2;
  const humCpY = (shoulderY + elbowY) / 2 - s * 0.06 + ripple * 0.4;

  const covCount = 9;
  for (let f = 0; f < covCount; f++) {
    const fT = (f + 0.5) / covCount;
    const bT = fT * 0.92;

    // Evaluate attachment on the actual bone bezier (not a straight line)
    const bU = 1 - bT;
    const aX = bU * bU * shoulderX + 2 * bU * bT * humCpX + bT * bT * elbowX;
    const aY = bU * bU * shoulderY + 2 * bU * bT * humCpY + bT * bT * elbowY;

    // Bone tangent → perpendicular toward trailing edge
    const htgX = 2 * bU * (humCpX - shoulderX) + 2 * bT * (elbowX - humCpX);
    const htgY = 2 * bU * (humCpY - shoulderY) + 2 * bT * (elbowY - humCpY);
    const htgLen = Math.sqrt(htgX * htgX + htgY * htgY) || 1;
    let hpX = -htgY / htgLen;
    let hpY = htgX / htgLen;
    if (hpY < 0) { hpX = -hpX; hpY = -hpY; }

    const fLen = s * (0.17 + fT * 0.14);
    const fAng = Math.atan2(hpY, hpX) + side * (0.25 + fT * 0.28);
    const fSw = flapAngle * s * 0.006 * fT;
    const tX = aX + Math.cos(fAng) * fLen + fSw;
    const tY = aY + Math.sin(fAng) * fLen;

    const wW = s * (0.04 + (1 - fT) * 0.022);
    const nW = wW * 0.35;
    const pNx = -Math.sin(fAng);
    const pNy = Math.cos(fAng);

    const cG = ctx.createLinearGradient(aX, aY, tX, tY);
    if (blue) {
      cG.addColorStop(0, `rgba(30, 64, 175, ${0.82 - fT * 0.1})`);
      cG.addColorStop(0.4, `rgba(59, 130, 246, ${0.76 - fT * 0.08})`);
      cG.addColorStop(0.75, `rgba(96, 165, 250, ${0.65 - fT * 0.06})`);
      cG.addColorStop(1, `rgba(147, 197, 253, ${0.5 + smoothWingAtk * 0.1})`);
    } else {
      cG.addColorStop(0, `rgba(155, 58, 8, ${0.82 - fT * 0.1})`);
      cG.addColorStop(0.4, `rgba(205, 100, 20, ${0.76 - fT * 0.08})`);
      cG.addColorStop(0.75, `rgba(245, 175, 55, ${0.65 - fT * 0.06})`);
      cG.addColorStop(1, `rgba(255, 215, 95, ${0.5 + smoothWingAtk * 0.1})`);
    }

    ctx.fillStyle = cG;
    ctx.beginPath();
    ctx.moveTo(aX, aY);
    ctx.bezierCurveTo(
      aX + (tX - aX) * 0.3 + pNx * wW * 1.05 * side,
      aY + (tY - aY) * 0.3 + pNy * wW * 1.05,
      aX + (tX - aX) * 0.65 + pNx * wW * 0.7 * side,
      aY + (tY - aY) * 0.65 + pNy * wW * 0.7,
      tX,
      tY,
    );
    ctx.bezierCurveTo(
      aX + (tX - aX) * 0.65 - pNx * nW * 0.35 * side,
      aY + (tY - aY) * 0.65 - pNy * nW * 0.35,
      aX + (tX - aX) * 0.3 - pNx * nW * 0.25 * side,
      aY + (tY - aY) * 0.3 - pNy * nW * 0.25,
      aX,
      aY,
    );
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = blue
      ? `rgba(30, 58, 160, ${0.3 - fT * 0.05})`
      : `rgba(120, 50, 8, ${0.3 - fT * 0.05})`;
    ctx.lineWidth = (1.1 - fT * 0.25) * zoom;
    ctx.beginPath();
    ctx.moveTo(aX, aY);
    ctx.quadraticCurveTo(
      (aX + tX) / 2 + pNx * nW * 0.1 * side,
      (aY + tY) / 2 + pNy * nW * 0.1,
      tX, tY,
    );
    ctx.stroke();

    drawFeatherBarbs(ctx, aX, aY, tX, tY, pNx, pNy, fLen, wW, side, zoom, blue, 0.18 - fT * 0.03, 5);
  }

  // ─── Primary flight feathers (outer wing: elbow → wingtip) ───
  // Radius bone control point (must match the drawn bone quadratic curve)
  const radCpX = (elbowX + wingTipX) / 2;
  const radCpY = (elbowY + wingTipY) / 2 - s * 0.05 + ripple * 0.2;

  // ─── Feather contour lines on inner membrane ───
  drawMembraneFeatherLines(
    ctx, shoulderX, shoulderY, elbowX, elbowY, humCpX, humCpY,
    innerTrailY, flapAngle, ripple, s, side, wingSpread, innerRatio, zoom, blue, atkBurst,
  );

  // ─── Feather contour lines on outer membrane ───
  drawOuterMembraneFeatherLines(
    ctx, elbowX, elbowY, wingTipX, wingTipY, radCpX, radCpY,
    outerStartX, outerStartTopY, outerStartBotY, outerTrailY, outerSpan,
    flapAngle, ripple, s, side, zoom, blue, atkBurst,
  );

  const primCount = 14;
  for (let f = 0; f < primCount; f++) {
    const featherT = (f + 0.5) / primCount;
    const boneT = featherT * 0.92;

    // Evaluate attachment on the actual bone bezier (not a straight line)
    const rU = 1 - boneT;
    const attachX = rU * rU * elbowX + 2 * rU * boneT * radCpX + boneT * boneT * wingTipX;
    const attachY = rU * rU * elbowY + 2 * rU * boneT * radCpY + boneT * boneT * wingTipY;

    // Bone tangent → perpendicular toward trailing edge
    const rtgX = 2 * rU * (radCpX - elbowX) + 2 * boneT * (wingTipX - radCpX);
    const rtgY = 2 * rU * (radCpY - elbowY) + 2 * boneT * (wingTipY - radCpY);
    const rtgLen = Math.sqrt(rtgX * rtgX + rtgY * rtgY) || 1;
    let rpX = -rtgY / rtgLen;
    let rpY = rtgX / rtgLen;
    if (rpY < 0) { rpX = -rpX; rpY = -rpY; }

    const featherLen = s * (0.26 + featherT * 0.30);
    const featherAngle = Math.atan2(rpY, rpX) + side * (0.25 + featherT * 0.45);
    const featherSway = flapAngle * s * 0.01 * featherT;
    const tipX = attachX + Math.cos(featherAngle) * featherLen + featherSway;
    const tipY = attachY + Math.sin(featherAngle) * featherLen;

    const wideW = s * (0.048 + (1 - featherT) * 0.028);
    const narrowW = wideW * 0.35;
    const perpNx = -Math.sin(featherAngle);
    const perpNy = Math.cos(featherAngle);

    const q1 = 0.25;
    const q2 = 0.6;
    const p1x = attachX + (tipX - attachX) * q1 + featherSway * 0.15;
    const p1y = attachY + (tipY - attachY) * q1;
    const p2x = attachX + (tipX - attachX) * q2 + featherSway * 0.3;
    const p2y = attachY + (tipY - attachY) * q2;

    const fGrad = ctx.createLinearGradient(
      attachX, attachY, tipX, tipY,
    );
    if (blue) {
      fGrad.addColorStop(0, `rgba(30, 64, 175, ${0.88 - featherT * 0.1})`);
      fGrad.addColorStop(0.25, `rgba(59, 130, 246, ${0.82 - featherT * 0.08})`);
      fGrad.addColorStop(0.55, `rgba(96, 165, 250, ${0.72 - featherT * 0.06})`);
      fGrad.addColorStop(0.8, `rgba(147, 197, 253, ${0.6 + smoothWingAtk * 0.1})`);
      fGrad.addColorStop(1, `rgba(224, 240, 255, ${0.5 + smoothWingAtk * 0.15})`);
    } else {
      fGrad.addColorStop(0, `rgba(155, 55, 8, ${0.88 - featherT * 0.1})`);
      fGrad.addColorStop(0.25, `rgba(200, 95, 18, ${0.82 - featherT * 0.08})`);
      fGrad.addColorStop(0.55, `rgba(245, 170, 50, ${0.72 - featherT * 0.06})`);
      fGrad.addColorStop(0.8, `rgba(255, 210, 90, ${0.6 + smoothWingAtk * 0.1})`);
      fGrad.addColorStop(1, `rgba(255, 245, 160, ${0.5 + smoothWingAtk * 0.15})`);
    }

    // Wider, more defined vane shape
    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(attachX, attachY);
    ctx.bezierCurveTo(
      p1x + perpNx * wideW * 1.1 * side,
      p1y + perpNy * wideW * 1.1,
      p2x + perpNx * wideW * 0.8 * side,
      p2y + perpNy * wideW * 0.8,
      tipX + perpNx * narrowW * 0.1 * side,
      tipY + perpNy * narrowW * 0.1,
    );
    ctx.lineTo(tipX, tipY);
    ctx.bezierCurveTo(
      p2x - perpNx * narrowW * 0.45 * side,
      p2y - perpNy * narrowW * 0.45,
      p1x - perpNx * narrowW * 0.3 * side,
      p1y - perpNy * narrowW * 0.3,
      attachX,
      attachY,
    );
    ctx.closePath();
    ctx.fill();

    // Leading edge highlight
    const hlAlpha = 0.18 + smoothWingAtk * 0.04 - featherT * 0.05;
    if (hlAlpha > 0.02) {
      ctx.fillStyle = blue
        ? `rgba(191, 219, 254, ${hlAlpha})`
        : `rgba(255, 235, 150, ${hlAlpha})`;
      ctx.beginPath();
      ctx.moveTo(attachX, attachY);
      ctx.bezierCurveTo(
        p1x + perpNx * wideW * 0.8 * side,
        p1y + perpNy * wideW * 0.8,
        p2x + perpNx * wideW * 0.5 * side,
        p2y + perpNy * wideW * 0.5,
        tipX + perpNx * narrowW * 0.05 * side,
        tipY + perpNy * narrowW * 0.05,
      );
      ctx.lineTo(
        p2x + perpNx * wideW * 0.15 * side,
        p2y + perpNy * wideW * 0.15,
      );
      ctx.quadraticCurveTo(
        p1x + perpNx * wideW * 0.2 * side,
        p1y + perpNy * wideW * 0.2,
        attachX,
        attachY,
      );
      ctx.closePath();
      ctx.fill();
    }

    // Rachis (central shaft)
    ctx.strokeStyle = blue
      ? `rgba(30, 58, 160, ${0.35 - featherT * 0.07})`
      : `rgba(120, 50, 8, ${0.35 - featherT * 0.07})`;
    ctx.lineWidth = (1.3 - featherT * 0.3) * zoom;
    ctx.beginPath();
    ctx.moveTo(attachX, attachY);
    ctx.quadraticCurveTo(
      (attachX + tipX) / 2 + perpNx * narrowW * 0.1 * side,
      (attachY + tipY) / 2 + perpNy * narrowW * 0.1,
      tipX,
      tipY,
    );
    ctx.stroke();

    drawFeatherBarbs(ctx, attachX, attachY, tipX, tipY, perpNx, perpNy, featherLen, wideW, side, zoom, blue, 0.22 - featherT * 0.04, 7);

    // Glowing feather tip
    const tipGlowR =
      s * (0.028 + (1 - featherT) * 0.018 + smoothWingAtk * 0.01);
    const tipGlow = ctx.createRadialGradient(
      tipX, tipY, 0, tipX, tipY, tipGlowR,
    );
    if (blue) {
      tipGlow.addColorStop(0, `rgba(224, 240, 255, ${0.5 + smoothWingAtk * 0.12})`);
      tipGlow.addColorStop(0.4, `rgba(96, 165, 250, ${0.2 + smoothWingAtk * 0.08})`);
      tipGlow.addColorStop(1, "rgba(59, 130, 246, 0)");
    } else {
      tipGlow.addColorStop(0, `rgba(255, 245, 130, ${0.5 + smoothWingAtk * 0.12})`);
      tipGlow.addColorStop(0.4, `rgba(255, 160, 40, ${0.2 + smoothWingAtk * 0.08})`);
      tipGlow.addColorStop(1, "rgba(220, 70, 10, 0)");
    }
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(tipX, tipY, tipGlowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── Fire fringe along both wing sections ───
  const fringeCount = 20 + Math.floor(atkBurst * 8);
  for (let fl = 0; fl < fringeCount; fl++) {
    const flameT = fl / fringeCount;

    let edgeX: number;
    let edgeTopY: number;
    let edgeBotY: number;
    if (flameT < innerRatio) {
      const localT = flameT / innerRatio;
      const u = 1 - localT;
      edgeX = u * u * shoulderX + 2 * u * localT * humCpX + localT * localT * elbowX;
      const boneY = u * u * shoulderY + 2 * u * localT * humCpY + localT * localT * elbowY;
      edgeTopY = boneY - s * 0.08 * u + ripple * localT;
      const innerBotCp1Y = elbowY + s * 0.24 + flapAngle * s * 0.10;
      const innerBotCp2Y = innerTrailY + flapAngle * s * 0.07;
      edgeBotY = localT * localT * localT * elbowY + 3 * localT * localT * u * innerBotCp1Y + 3 * localT * u * u * innerBotCp2Y + u * u * u * innerTrailY;
    } else {
      const localT = (flameT - innerRatio) / (1 - innerRatio);
      const u = 1 - localT;
      edgeX = u * u * elbowX + 2 * u * localT * radCpX + localT * localT * wingTipX;
      const boneY = u * u * elbowY + 2 * u * localT * radCpY + localT * localT * wingTipY;
      edgeTopY = boneY - s * 0.04 * u + ripple * u * 0.5;
      const outerBotCp1Y = elbowY + s * 0.20 + flapAngle * s * 0.38;
      const outerBotCp2Y = outerTrailY + flapAngle * s * 0.16;
      edgeBotY = localT * localT * localT * wingTipY + 3 * localT * localT * u * outerBotCp1Y + 3 * localT * u * u * outerBotCp2Y + u * u * u * outerStartBotY;
    }

    const flameY =
      edgeTopY +
      (edgeBotY - edgeTopY) *
        (0.1 + Math.sin(time * 5.5 + fl * 1.2) * 0.1) +
      flapAngle * 0.08 * flameT * s;
    const flameSize =
      s *
      (0.04 + flameT * 0.02 + atkBurst * 0.02) *
      (1 + Math.sin(time * 5.5 + fl * 1.8) * 0.18);
    const flameAlpha =
      0.7 + atkBurst * 0.15 + Math.sin(time * 5.5 + fl * 0.9) * 0.12;

    if (_simpleGrad) {
      ctx.fillStyle = blue
        ? `rgba(147, 197, 253, ${flameAlpha * 0.7})`
        : `rgba(255, 200, 60, ${flameAlpha * 0.7})`;
    } else {
      const ffGrad = ctx.createRadialGradient(edgeX, flameY, 0, edgeX, flameY, flameSize);
      if (blue) {
        ffGrad.addColorStop(0, `rgba(224, 240, 255, ${flameAlpha})`);
        ffGrad.addColorStop(0.25, `rgba(147, 197, 253, ${flameAlpha * 0.85})`);
        ffGrad.addColorStop(0.55, `rgba(59, 130, 246, ${flameAlpha * 0.5})`);
        ffGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
      } else {
        ffGrad.addColorStop(0, `rgba(255, 255, ${210 + Math.floor(atkBurst * 40)}, ${flameAlpha})`);
        ffGrad.addColorStop(0.25, `rgba(255, ${200 + Math.floor(atkBurst * 40)}, 60, ${flameAlpha * 0.85})`);
        ffGrad.addColorStop(0.55, `rgba(255, 130, 30, ${flameAlpha * 0.5})`);
        ffGrad.addColorStop(1, "rgba(200, 50, 10, 0)");
      }
      ctx.fillStyle = ffGrad;
    }
    ctx.beginPath();
    ctx.arc(edgeX, flameY, flameSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // ─── Trailing ember sparks during attack ───
  if (isAttacking) {
    for (let sp = 0; sp < 6; sp++) {
      const spT = (time * 2.5 + sp * 0.17) % 1;
      const onInner = sp < 2;
      const spBoneT = onInner ? 0.3 + sp * 0.3 : 0.2 + (sp - 2) * 0.2;
      const spU = 1 - spBoneT;
      const spBaseX = onInner
        ? spU * spU * shoulderX + 2 * spU * spBoneT * humCpX + spBoneT * spBoneT * elbowX
        : spU * spU * elbowX + 2 * spU * spBoneT * radCpX + spBoneT * spBoneT * wingTipX;
      const spBaseY = onInner
        ? spU * spU * shoulderY + 2 * spU * spBoneT * humCpY + spBoneT * spBoneT * elbowY
        : spU * spU * elbowY + 2 * spU * spBoneT * radCpY + spBoneT * spBoneT * wingTipY;
      const spX =
        spBaseX + Math.sin(time * 3.5 + sp * 2.5) * s * 0.03;
      const spY = spBaseY + s * (0.15 + spT * 0.35);
      const spAlpha = (1 - spT) * 0.5 * smoothWingAtk;
      const spSize = (1 - spT) * s * 0.015;

      ctx.fillStyle = blue
        ? `rgba(147, 197, 253, ${spAlpha})`
        : `rgba(255, ${180 + Math.floor(sp * 12)}, 40, ${spAlpha})`;
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
  const wingSpread = s * (1.3 + flapAngle * flapAngle * 0.64);

  for (let side = -1; side <= 1; side += 2) {
    const wingBaseX = x + side * s * 0.14;
    const wingBaseY = y - s * 0.06;
    const wingTipX = wingBaseX + side * wingSpread;
    const wingTipY = wingBaseY - s * 0.34 + flapAngle * s * 0.61;
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

      if (_simpleGrad) {
        ctx.fillStyle = blue
          ? `rgba(147, 197, 253, ${orbAlpha * 0.6})`
          : `rgba(255, 200, 60, ${orbAlpha * 0.6})`;
      } else {
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
      }
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
  const tailBaseY = y + s * 0.20;
  const featherCount = 11 + Math.floor(atkBurst * 5) + (blue ? 4 : 0);
  const spreadMult = 1.15 + atkBurst * 0.7;
  const lenMult = 1.35 + atkBurst * 0.55;
  const swaySpeed = 4.5 + atkBurst * 2.0;
  const swayAmp = 0.12 + atkBurst * 0.06;
  const flutterSpeed = 5.5 + atkBurst * 2.5;
  const flutterAmp = 0.06 + atkBurst * 0.04;
  const tailIsoRatio = ISO_Y_RATIO * 1.5;

  const centerIdx = (featherCount - 1) / 2;
  const indices: number[] = [];
  for (let i = 0; i < featherCount; i++) indices.push(i);
  indices.sort((a, b) => Math.abs(b - centerIdx) - Math.abs(a - centerIdx));

  for (const i of indices) {
    const norm = centerIdx > 0 ? (i - centerIdx) / centerIdx : 0;
    const absNorm = Math.abs(norm);

    const fanAngle = norm * 0.33 * Math.PI * spreadMult;
    const phaseOffset = i * 0.7;
    const sway = Math.sin(time * swaySpeed + phaseOffset) * s * swayAmp * (0.5 + absNorm * 0.5);
    const flutter = Math.sin(time * flutterSpeed + phaseOffset + 1.2) * s * flutterAmp * (0.4 + absNorm * 0.6);

    const featherLen =
      s * (0.55 + (1 - absNorm) * 0.16 - absNorm * 0.04) * lenMult;

    const rawDx = Math.sin(fanAngle) * featherLen;
    const rawDy = Math.cos(fanAngle) * featherLen;
    const tipX = x + rawDx + sway;
    const tipY = tailBaseY + rawDy * tailIsoRatio + flutter;

    const cp1Sway = sway * 0.3;
    const cp1Flutter = flutter * 0.2;
    const cp1X = x + rawDx * 0.35 + cp1Sway;
    const cp1Y =
      tailBaseY +
      rawDy * 0.35 * tailIsoRatio +
      cp1Flutter +
      Math.sin(time * 4 + i) * s * 0.02;
    const cp2Sway = sway * 0.65;
    const cp2Flutter = flutter * 0.55;
    const cp2X = x + rawDx * 0.65 + cp2Sway;
    const cp2Y =
      tailBaseY +
      rawDy * 0.65 * tailIsoRatio +
      cp2Flutter +
      Math.sin(time * 3.5 + i * 0.7) * s * 0.015;

    const dx = tipX - x;
    const dy = tipY - tailBaseY;
    const shaftLen = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / shaftLen;
    const perpY = dx / shaftLen;

    const midHW =
      s * (0.058 + atkBurst * 0.015 + (1 - absNorm) * 0.012);
    const baseHW = s * (0.028 + atkBurst * 0.008);
    const tipHW = s * 0.008;

    const isLeft = norm < 0;
    const litBoost = isLeft ? 0.12 : 0;
    const shadBoost = isLeft ? 0 : 0.1;

    // --- Filled feather vane ---
    const fGrad = ctx.createLinearGradient(x, tailBaseY, tipX, tipY);
    if (blue) {
      fGrad.addColorStop(0, "#0f2a5c");
      fGrad.addColorStop(0.2, `rgba(29, 78, 216, ${0.92 + litBoost})`);
      fGrad.addColorStop(0.45, `rgba(59, 130, 246, ${0.88 + litBoost})`);
      fGrad.addColorStop(
        0.7,
        `rgba(96, 165, 250, ${0.78 + flamePulse * 0.1})`,
      );
      fGrad.addColorStop(
        0.9,
        `rgba(191, 219, 254, ${0.6 + flamePulse * 0.2})`,
      );
      fGrad.addColorStop(
        1,
        `rgba(224, 240, 255, ${0.4 + flamePulse * 0.3 + atkBurst * 0.2})`,
      );
    } else {
      fGrad.addColorStop(0, "#4a1e00");
      fGrad.addColorStop(0.2, `rgba(180, 80, 15, ${0.92 + litBoost})`);
      fGrad.addColorStop(0.45, `rgba(230, 126, 34, ${0.88 + litBoost})`);
      fGrad.addColorStop(
        0.7,
        `rgba(255, ${160 + Math.floor(atkBurst * 50)}, 30, ${0.78 + flamePulse * 0.1})`,
      );
      fGrad.addColorStop(
        0.9,
        `rgba(255, ${210 + Math.floor(atkBurst * 30)}, ${80 + Math.floor(atkBurst * 50)}, ${0.6 + flamePulse * 0.2})`,
      );
      fGrad.addColorStop(
        1,
        `rgba(255, ${240 + Math.floor(atkBurst * 15)}, ${130 + Math.floor(atkBurst * 60)}, ${0.4 + flamePulse * 0.3 + atkBurst * 0.2})`,
      );
    }

    ctx.fillStyle = fGrad;
    ctx.beginPath();
    ctx.moveTo(
      x + perpX * baseHW,
      tailBaseY + perpY * baseHW,
    );
    ctx.bezierCurveTo(
      cp1X + perpX * midHW * 1.1,
      cp1Y + perpY * midHW * 1.1,
      cp2X + perpX * midHW * 0.8,
      cp2Y + perpY * midHW * 0.8,
      tipX + perpX * tipHW,
      tipY + perpY * tipHW,
    );
    ctx.lineTo(tipX - perpX * tipHW, tipY - perpY * tipHW);
    ctx.bezierCurveTo(
      cp2X - perpX * midHW * 0.55,
      cp2Y - perpY * midHW * 0.55,
      cp1X - perpX * midHW * 0.65,
      cp1Y - perpY * midHW * 0.65,
      x - perpX * baseHW,
      tailBaseY - perpY * baseHW,
    );
    ctx.closePath();
    ctx.fill();

    // --- Lit-side highlight (top-left isometric light) ---
    const hlAlpha = 0.18 + litBoost * 0.5 + atkBurst * 0.08;
    ctx.fillStyle = blue
      ? `rgba(191, 219, 254, ${hlAlpha})`
      : `rgba(255, 220, 120, ${hlAlpha})`;
    ctx.beginPath();
    ctx.moveTo(
      x + perpX * baseHW * 0.5,
      tailBaseY + perpY * baseHW * 0.5,
    );
    ctx.bezierCurveTo(
      cp1X + perpX * midHW * 0.95,
      cp1Y + perpY * midHW * 0.95,
      cp2X + perpX * midHW * 0.6,
      cp2Y + perpY * midHW * 0.6,
      tipX + perpX * tipHW * 0.5,
      tipY + perpY * tipHW * 0.5,
    );
    ctx.lineTo(tipX, tipY);
    ctx.bezierCurveTo(
      cp2X + perpX * midHW * 0.2,
      cp2Y + perpY * midHW * 0.2,
      cp1X + perpX * midHW * 0.3,
      cp1Y + perpY * midHW * 0.3,
      x + perpX * baseHW * 0.15,
      tailBaseY + perpY * baseHW * 0.15,
    );
    ctx.closePath();
    ctx.fill();

    // --- Shadow-side darkening (front-right face) ---
    if (shadBoost > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${shadBoost + atkBurst * 0.03})`;
      ctx.beginPath();
      ctx.moveTo(
        x - perpX * baseHW * 0.3,
        tailBaseY - perpY * baseHW * 0.3,
      );
      ctx.bezierCurveTo(
        cp1X - perpX * midHW * 0.55,
        cp1Y - perpY * midHW * 0.55,
        cp2X - perpX * midHW * 0.45,
        cp2Y - perpY * midHW * 0.45,
        tipX - perpX * tipHW * 0.5,
        tipY - perpY * tipHW * 0.5,
      );
      ctx.lineTo(tipX, tipY);
      ctx.bezierCurveTo(
        cp2X - perpX * midHW * 0.1,
        cp2Y - perpY * midHW * 0.1,
        cp1X - perpX * midHW * 0.15,
        cp1Y - perpY * midHW * 0.15,
        x,
        tailBaseY,
      );
      ctx.closePath();
      ctx.fill();
    }

    // --- Central rachis (shaft) ---
    ctx.strokeStyle = blue
      ? `rgba(15, 40, 120, ${0.4 - absNorm * 0.08})`
      : `rgba(100, 40, 5, ${0.4 - absNorm * 0.08})`;
    ctx.lineWidth = (1.2 + atkBurst * 0.3 - absNorm * 0.4) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, tailBaseY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, tipX, tipY);
    ctx.stroke();

    // --- Eye spot (fire-eye near feather tip) ---
    const eyeFrac = 0.72;
    const eyeX = x + rawDx * eyeFrac + sway * eyeFrac;
    const eyeY = tailBaseY + rawDy * eyeFrac * tailIsoRatio + flutter * eyeFrac;
    const eyeRx =
      s * (0.018 + (1 - absNorm) * 0.008 + atkBurst * 0.006);
    const eyeRy = eyeRx * 0.7;

    const eyeGrad = ctx.createRadialGradient(
      eyeX, eyeY, 0, eyeX, eyeY, eyeRx,
    );
    if (blue) {
      eyeGrad.addColorStop(
        0,
        `rgba(224, 240, 255, ${0.8 + flamePulse * 0.15})`,
      );
      eyeGrad.addColorStop(
        0.35,
        `rgba(147, 197, 253, ${0.65 + flamePulse * 0.1})`,
      );
      eyeGrad.addColorStop(0.6, "rgba(59, 130, 246, 0.5)");
      eyeGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
    } else {
      eyeGrad.addColorStop(
        0,
        `rgba(255, 255, 200, ${0.85 + flamePulse * 0.1})`,
      );
      eyeGrad.addColorStop(
        0.35,
        `rgba(255, 200, 60, ${0.7 + flamePulse * 0.1})`,
      );
      eyeGrad.addColorStop(0.6, "rgba(200, 80, 15, 0.45)");
      eyeGrad.addColorStop(1, "rgba(120, 40, 0, 0)");
    }
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, eyeRx, eyeRy, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = blue
      ? `rgba(224, 240, 255, ${0.9 + flamePulse * 0.1})`
      : `rgba(255, 255, 220, ${0.9 + flamePulse * 0.1})`;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY - eyeRy * 0.15, s * 0.006, 0, Math.PI * 2);
    ctx.fill();

    // --- Barb texture (herringbone, isometrically compressed) ---
    const barbCount = 5 + Math.floor(atkBurst * 2);
    const shaftAngle = Math.atan2(dy, dx);
    for (let b = 0; b < barbCount; b++) {
      const t = 0.15 + b * (0.55 / barbCount);
      const bx = x + dx * t + sway * t;
      const by = tailBaseY + dy * t + flutter * t;
      const barbLen = s * (0.02 + atkBurst * 0.008);
      const barbDir = b % 2 === 0 ? 1 : -1;
      const barbAngle = shaftAngle + Math.PI * 0.5 * barbDir;
      const barbFade = 1 - Math.abs(t - 0.4);

      ctx.strokeStyle = blue
        ? `rgba(59, 130, 246, ${(0.15 + atkBurst * 0.08) * barbFade})`
        : `rgba(180, 90, 20, ${(0.15 + atkBurst * 0.08) * barbFade})`;
      ctx.lineWidth = (0.5 + atkBurst * 0.2) * zoom;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(
        bx + Math.cos(barbAngle) * barbLen,
        by + Math.sin(barbAngle) * barbLen * tailIsoRatio,
      );
      ctx.stroke();
    }

    // --- Flame tip glow ---
    const tipGlowR =
      s *
      (0.04 +
        atkBurst * 0.035 +
        (blue ? 0.015 : 0) +
        (1 - absNorm) * 0.01);
    const tipGlow = ctx.createRadialGradient(
      tipX, tipY, 0, tipX, tipY, tipGlowR,
    );
    if (blue) {
      tipGlow.addColorStop(
        0,
        `rgba(224, 240, 255, ${0.85 + flamePulse * 0.15})`,
      );
      tipGlow.addColorStop(
        0.3,
        `rgba(147, 197, 253, ${0.5 + flamePulse * 0.15})`,
      );
      tipGlow.addColorStop(
        0.6,
        `rgba(59, 130, 246, ${0.2 + flamePulse * 0.1})`,
      );
      tipGlow.addColorStop(1, "rgba(29, 78, 216, 0)");
    } else {
      tipGlow.addColorStop(
        0,
        `rgba(255, ${240 + Math.floor(atkBurst * 15)}, ${150 + Math.floor(atkBurst * 60)}, ${0.8 + flamePulse * 0.2})`,
      );
      tipGlow.addColorStop(
        0.3,
        `rgba(255, 200, 60, ${0.45 + flamePulse * 0.15})`,
      );
      tipGlow.addColorStop(
        0.6,
        `rgba(255, 130, 30, ${0.2 + flamePulse * 0.1})`,
      );
      tipGlow.addColorStop(1, "rgba(200, 50, 10, 0)");
    }
    ctx.fillStyle = tipGlow;
    ctx.beginPath();
    ctx.arc(tipX, tipY, tipGlowR, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Fire embers during attack (isometric orbit) ---
  if (isAttacking) {
    for (let e = 0; e < 10; e++) {
      const ePhase = (time * 4 + e * 0.1) % 1;
      const eAngle = (e / 10) * Math.PI * 0.7 - Math.PI * 0.35;
      const eDist = s * (0.2 + ePhase * 0.35);
      const eX =
        x +
        Math.sin(eAngle) * eDist +
        Math.sin(time * 6 + e * 2) * s * 0.025;
      const eY = tailBaseY + Math.cos(eAngle) * eDist * tailIsoRatio;
      const eAlpha = (1 - ePhase) * 0.5 * atkBurst;
      const eSize = (1 - ePhase) * s * 0.018;

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
  const bodyW = s * (0.24 + breathe * 0.002 + atkBurst * 0.015);
  const bodyH = s * (0.33 + breathe * 0.003 + atkBurst * 0.02);
  const isoBodyD = bodyH * ISO_Y_RATIO;

  // 3-face isometric body construction: top, front-left, front-right
  // Back shadow face (darkest, drawn first)
  const backGrad = ctx.createLinearGradient(x, y - bodyH * 0.5, x, y + bodyH * 0.3);
  if (blue) {
    backGrad.addColorStop(0, "#0f2a5c");
    backGrad.addColorStop(0.5, "#1a3a6e");
    backGrad.addColorStop(1, "#0d1f4a");
  } else {
    backGrad.addColorStop(0, "#4a1e00");
    backGrad.addColorStop(0.5, "#5c2a08");
    backGrad.addColorStop(1, "#3a1500");
  }
  ctx.fillStyle = backGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + isoBodyD * 0.2, bodyW * 0.95, bodyH * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front-right face (darker side)
  const rightGrad = ctx.createLinearGradient(x, y, x + bodyW, y + isoBodyD);
  if (blue) {
    rightGrad.addColorStop(0, "#1d4ed8");
    rightGrad.addColorStop(0.4, "#1e40af");
    rightGrad.addColorStop(1, "#1e3a5f");
  } else {
    rightGrad.addColorStop(0, "#b35f18");
    rightGrad.addColorStop(0.4, "#993d00");
    rightGrad.addColorStop(1, "#6b2800");
  }
  ctx.fillStyle = rightGrad;
  ctx.beginPath();
  ctx.ellipse(x + bodyW * 0.04, y + isoBodyD * 0.08, bodyW * 0.88, bodyH * 0.85, 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Front-left face (mid-tone)
  const leftGrad = ctx.createLinearGradient(x - bodyW, y, x, y + isoBodyD);
  if (blue) {
    leftGrad.addColorStop(0, "#2563eb");
    leftGrad.addColorStop(0.5, "#3b82f6");
    leftGrad.addColorStop(1, "#1d4ed8");
  } else {
    leftGrad.addColorStop(0, "#cc5a0a");
    leftGrad.addColorStop(0.5, "#e67e22");
    leftGrad.addColorStop(1, "#b35f18");
  }
  ctx.fillStyle = leftGrad;
  ctx.beginPath();
  ctx.ellipse(x - bodyW * 0.04, y + isoBodyD * 0.04, bodyW * 0.84, bodyH * 0.82, -0.1, 0, Math.PI * 2);
  ctx.fill();

  // Top face (lightest) — core body with hot center when attacking
  const bodyGrad = ctx.createRadialGradient(
    x,
    y - s * 0.06,
    s * (0.04 + atkBurst * 0.03),
    x,
    y + s * 0.02,
    s * 0.34,
  );
  if (blue) {
    bodyGrad.addColorStop(0, "#e0f0ff");
    bodyGrad.addColorStop(0.1, "#93c5fd");
    bodyGrad.addColorStop(0.3, "#3b82f6");
    bodyGrad.addColorStop(0.55, "#2563eb");
    bodyGrad.addColorStop(0.75, "#1d4ed8");
    bodyGrad.addColorStop(1, "#1e3a5f");
  } else {
    bodyGrad.addColorStop(0, atkBurst > 0.3 ? "#fffbe8" : "#fff5e0");
    bodyGrad.addColorStop(0.1, atkBurst > 0.3 ? "#ffe090" : "#ffc870");
    bodyGrad.addColorStop(0.3, "#e67e22");
    bodyGrad.addColorStop(0.55, "#cc5500");
    bodyGrad.addColorStop(0.75, "#993d00");
    bodyGrad.addColorStop(1, "#6b2800");
  }
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body rim light — top-left highlight for isometric lighting
  ctx.strokeStyle = blue
    ? `rgba(147, 197, 253, ${0.35 + bodyGlow * 0.15 + atkBurst * 0.2})`
    : `rgba(255, ${200 + Math.floor(atkBurst * 40)}, ${100 + Math.floor(atkBurst * 60)}, ${0.3 + bodyGlow * 0.15 + atkBurst * 0.2})`;
  ctx.lineWidth = (1.4 + atkBurst * 0.8) * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, -0.7, Math.PI * 0.55);
  ctx.stroke();

  // Front-right shadow edge for 3D depth
  ctx.strokeStyle = `rgba(0, 0, 0, ${0.15 + atkBurst * 0.05})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y, bodyW, bodyH, 0, Math.PI * 0.3, Math.PI * 0.85);
  ctx.stroke();

  // Layered scalloped feather rows — proper overlapping construction
  const featherSwaySpeed = 1.5 + atkBurst * 1.5;
  const featherSwayAmp = 0.003 + atkBurst * 0.003;
  for (let row = 0; row < 10; row++) {
    const rowOffset = Math.sin(time * 2 + row * 0.8) * s * atkBurst * 0.003;
    const rowY = y - s * 0.25 + row * s * 0.055 + rowOffset;
    const rowWidth = s * 0.22 * Math.sin(((row + 0.5) / 10) * Math.PI);
    const feathersInRow = 4 + Math.min(row, 5);

    for (let f = 0; f < feathersInRow; f++) {
      const fx = x - rowWidth + (f / (feathersInRow - 1)) * rowWidth * 2;
      const fWidth = ((rowWidth * 2) / feathersInRow) * 0.65;
      const fHeight = s * (0.028 + atkBurst * 0.005);
      const fSway =
        Math.sin(time * featherSwaySpeed + row * 0.4 + f * 0.7) *
        s *
        featherSwayAmp;

      // Feather body — darker for lower rows (isometric shadow)
      const isLeft = fx < x;
      const shade = (row < 4 ? 0.09 : row < 7 ? 0.06 : 0.04)
        + atkBurst * 0.03
        + (isLeft ? 0.01 : -0.01);
      ctx.fillStyle = blue
        ? `rgba(30, 64, 175, ${shade + Math.sin(time * 2 + row + f) * 0.02})`
        : `rgba(139, 58, 0, ${shade + Math.sin(time * 2 + row + f) * 0.02})`;
      ctx.beginPath();
      ctx.ellipse(fx + fSway, rowY, fWidth, fHeight, 0, 0, Math.PI);
      ctx.fill();

      // Feather tip highlight — brighter on left (lit) side
      if (isLeft && row > 1 && row < 8) {
        const hlAlpha = 0.06 + atkBurst * 0.02;
        ctx.fillStyle = blue
          ? `rgba(147, 197, 253, ${hlAlpha})`
          : `rgba(255, 200, 80, ${hlAlpha})`;
        ctx.beginPath();
        ctx.ellipse(fx + fSway - fWidth * 0.2, rowY - fHeight * 0.3, fWidth * 0.4, fHeight * 0.5, -0.2, 0, Math.PI);
        ctx.fill();
      }
    }

    // Horizontal feather row edge line for depth
    if (row > 0 && row < 9) {
      ctx.strokeStyle = blue
        ? `rgba(30, 58, 160, ${0.06 + atkBurst * 0.02})`
        : `rgba(120, 50, 5, ${0.06 + atkBurst * 0.02})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(x - rowWidth * 0.9, rowY + s * 0.005);
      ctx.quadraticCurveTo(x, rowY + s * 0.008, x + rowWidth * 0.9, rowY + s * 0.005);
      ctx.stroke();
    }
  }

  // Belly scales — small overlapping scale pattern on lower body
  for (let row = 0; row < 4; row++) {
    const scaleY = y + s * 0.08 + row * s * 0.04;
    const scaleRowW = s * (0.14 - row * 0.025);
    const scalesInRow = 5 - row;
    for (let sc = 0; sc < scalesInRow; sc++) {
      const scX = x - scaleRowW + (sc / Math.max(scalesInRow - 1, 1)) * scaleRowW * 2;
      const scW = s * 0.03;
      const scH = s * 0.018;
      const scShade = 0.12 + row * 0.02;
      ctx.fillStyle = blue
        ? `rgba(59, 130, 246, ${scShade})`
        : `rgba(200, 120, 30, ${scShade})`;
      ctx.beginPath();
      ctx.moveTo(scX, scaleY - scH);
      ctx.quadraticCurveTo(scX + scW, scaleY, scX, scaleY + scH);
      ctx.quadraticCurveTo(scX - scW, scaleY, scX, scaleY - scH);
      ctx.fill();
    }
  }

  // Inner fire core glow — much brighter and pulsing during attack
  const coreRadius = s * (0.2 + atkBurst * 0.07);
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
  // Avian keel breast plate (rounded, keeled like a bird sternum)
  const keelW = s * 0.17;
  const keelTop = y - s * 0.19;
  const keelBot = y + s * 0.14;
  const keelMid = y - s * 0.02;

  const breastGrad = ctx.createRadialGradient(
    x - keelW * 0.15, keelMid - s * 0.04, s * 0.03,
    x, keelMid, keelW * 1.1,
  );
  if (blue) {
    breastGrad.addColorStop(0, "#93c5fd");
    breastGrad.addColorStop(0.2, "#60a5fa");
    breastGrad.addColorStop(0.45, "#3b82f6");
    breastGrad.addColorStop(0.7, "#2563eb");
    breastGrad.addColorStop(1, "#1e40af");
  } else {
    breastGrad.addColorStop(0, "#daa530");
    breastGrad.addColorStop(0.2, "#c49030");
    breastGrad.addColorStop(0.45, "#a07020");
    breastGrad.addColorStop(0.7, "#8a6020");
    breastGrad.addColorStop(1, "#6a4510");
  }

  ctx.fillStyle = breastGrad;
  ctx.beginPath();
  ctx.moveTo(x, keelTop);
  ctx.bezierCurveTo(
    x + keelW * 0.7, keelTop + s * 0.01,
    x + keelW, keelMid - s * 0.06,
    x + keelW * 0.85, keelMid,
  );
  ctx.bezierCurveTo(
    x + keelW * 0.7, keelMid + s * 0.06,
    x + keelW * 0.35, keelBot - s * 0.03,
    x, keelBot,
  );
  ctx.bezierCurveTo(
    x - keelW * 0.35, keelBot - s * 0.03,
    x - keelW * 0.7, keelMid + s * 0.06,
    x - keelW * 0.85, keelMid,
  );
  ctx.bezierCurveTo(
    x - keelW, keelMid - s * 0.06,
    x - keelW * 0.7, keelTop + s * 0.01,
    x, keelTop,
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = blue ? "#1e3a8a" : "#3a2208";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Lit edge highlight (left = lit)
  ctx.strokeStyle = blue ? "rgba(147, 197, 253, 0.35)" : "rgba(255, 220, 100, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - keelW * 0.3, keelTop + s * 0.01);
  ctx.bezierCurveTo(
    x - keelW * 0.8, keelTop + s * 0.04,
    x - keelW * 0.9, keelMid - s * 0.03,
    x - keelW * 0.75, keelMid + s * 0.03,
  );
  ctx.stroke();

  // Shadow edge (right)
  ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + keelW * 0.3, keelTop + s * 0.01);
  ctx.bezierCurveTo(
    x + keelW * 0.8, keelTop + s * 0.04,
    x + keelW * 0.9, keelMid - s * 0.03,
    x + keelW * 0.75, keelMid + s * 0.03,
  );
  ctx.stroke();

  // Feathered contour lines (curved, following keel shape)
  const contourAlpha = 0.2;
  ctx.strokeStyle = blue ? `rgba(30, 58, 138, ${contourAlpha})` : `rgba(90, 58, 16, ${contourAlpha})`;
  ctx.lineWidth = 1 * zoom;
  for (let c = 0; c < 3; c++) {
    const cFrac = 0.3 + c * 0.2;
    const cY = keelTop + (keelBot - keelTop) * cFrac;
    const cHW = keelW * (0.75 - Math.abs(cFrac - 0.5) * 0.5);
    ctx.beginPath();
    ctx.moveTo(x - cHW, cY);
    ctx.quadraticCurveTo(x, cY + s * 0.01, x + cHW, cY);
    ctx.stroke();
  }

  // Trim around neckline (top curve)
  ctx.strokeStyle = blue ? "#60a5fa" : "#daa520";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - keelW * 0.55, keelTop + s * 0.02);
  ctx.quadraticCurveTo(x, keelTop - s * 0.01, x + keelW * 0.55, keelTop + s * 0.02);
  ctx.stroke();

  // Keel ridge (central vertical line)
  ctx.strokeStyle = blue ? "#1e40af" : "#5a3a10";
  ctx.lineWidth = 1.3 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, keelTop + s * 0.03);
  ctx.lineTo(x, keelBot - s * 0.02);
  ctx.stroke();
  ctx.strokeStyle = blue ? "rgba(147, 197, 253, 0.2)" : "rgba(255, 200, 80, 0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.003, keelTop + s * 0.04);
  ctx.lineTo(x - s * 0.003, keelBot - s * 0.03);
  ctx.stroke();

  // Central medallion — Nassau Hall flame emblem (larger, more ornate)
  const medY = y - s * 0.06;
  const medR = s * 0.06;

  // Medallion outer ring
  ctx.strokeStyle = blue ? "#1e3a8a" : "#3a2205";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, medY, medR * 1.15, 0, Math.PI * 2);
  ctx.stroke();

  // Medallion disc
  const medGrad = ctx.createRadialGradient(x - medR * 0.15, medY - medR * 0.15, 0, x, medY, medR);
  if (blue) {
    medGrad.addColorStop(0, "#bfdbfe");
    medGrad.addColorStop(0.25, "#60a5fa");
    medGrad.addColorStop(0.6, "#3b82f6");
    medGrad.addColorStop(0.85, "#2563eb");
    medGrad.addColorStop(1, "#1e40af");
  } else {
    medGrad.addColorStop(0, "#ffe880");
    medGrad.addColorStop(0.25, "#daa520");
    medGrad.addColorStop(0.6, "#b8860b");
    medGrad.addColorStop(0.85, "#8b6914");
    medGrad.addColorStop(1, "#6a5010");
  }
  ctx.fillStyle = medGrad;
  ctx.beginPath();
  ctx.arc(x, medY, medR, 0, Math.PI * 2);
  ctx.fill();

  // Medallion inner ring
  ctx.strokeStyle = blue ? "#1e40af" : "#5a3a10";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, medY, medR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = blue ? "rgba(147, 197, 253, 0.45)" : "rgba(255, 230, 120, 0.45)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.arc(x, medY, medR * 0.88, 0, Math.PI * 2);
  ctx.stroke();

  // Decorative notches around medallion
  for (let n = 0; n < 12; n++) {
    const nAngle = (n / 12) * Math.PI * 2;
    const nX = x + Math.cos(nAngle) * medR * 1.05;
    const nY = medY + Math.sin(nAngle) * medR * 1.05;
    ctx.fillStyle = blue ? "rgba(96, 165, 250, 0.3)" : "rgba(180, 140, 40, 0.3)";
    ctx.beginPath();
    ctx.arc(nX, nY, s * 0.003, 0, Math.PI * 2);
    ctx.fill();
  }

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

  // Flame core sparkle
  ctx.fillStyle = blue
    ? `rgba(224, 240, 255, ${embGlow * 0.6})`
    : `rgba(255, 255, 200, ${embGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(x, medY - medR * 0.15, medR * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Engraved wing motifs on breastplate — more ornate, multiple feather lines
  const motifColor = blue ? [59, 130, 246] : [180, 140, 40];
  for (let side = -1; side <= 1; side += 2) {
    for (let w = 0; w < 4; w++) {
      const wx = x + side * (s * 0.035 + w * s * 0.022);
      const wy = medY;
      const wLen = s * (0.04 - w * 0.004);
      ctx.strokeStyle = `rgba(${motifColor[0]}, ${motifColor[1]}, ${motifColor[2]}, ${0.28 - w * 0.05})`;
      ctx.lineWidth = (0.8 - w * 0.1) * zoom;
      ctx.beginPath();
      ctx.moveTo(wx, wy - wLen);
      ctx.quadraticCurveTo(wx + side * s * 0.022, wy, wx, wy + wLen);
      ctx.stroke();
    }

    const scrollX = x + side * s * 0.08;
    const scrollY = medY + s * 0.035;
    ctx.strokeStyle = `rgba(${motifColor[0]}, ${motifColor[1]}, ${motifColor[2]}, 0.2)`;
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(scrollX, scrollY);
    ctx.quadraticCurveTo(scrollX + side * s * 0.015, scrollY + s * 0.012, scrollX + side * s * 0.005, scrollY + s * 0.02);
    ctx.stroke();
  }

  // Lower keel guard (pointed tail-ward extension)
  const abdY = y + s * 0.11;
  const abdGrad = ctx.createLinearGradient(
    x - s * 0.06, abdY, x + s * 0.06, abdY + s * 0.06,
  );
  if (blue) {
    abdGrad.addColorStop(0, "#1e40af");
    abdGrad.addColorStop(0.3, "#2563eb");
    abdGrad.addColorStop(0.5, "#3b82f6");
    abdGrad.addColorStop(0.7, "#2563eb");
    abdGrad.addColorStop(1, "#1e40af");
  } else {
    abdGrad.addColorStop(0, "#7a5518");
    abdGrad.addColorStop(0.3, "#a07020");
    abdGrad.addColorStop(0.5, "#b08028");
    abdGrad.addColorStop(0.7, "#a07020");
    abdGrad.addColorStop(1, "#7a5518");
  }
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.moveTo(x - s * 0.08, abdY);
  ctx.bezierCurveTo(
    x - s * 0.07, abdY + s * 0.03,
    x - s * 0.02, abdY + s * 0.055,
    x, abdY + s * 0.065,
  );
  ctx.bezierCurveTo(
    x + s * 0.02, abdY + s * 0.055,
    x + s * 0.07, abdY + s * 0.03,
    x + s * 0.08, abdY,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = blue ? "#1e3a8a" : "#3a2208";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();
  ctx.strokeStyle = blue ? "rgba(147, 197, 253, 0.2)" : "rgba(255, 210, 80, 0.2)";
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, abdY + s * 0.01);
  ctx.lineTo(x, abdY + s * 0.055);
  ctx.stroke();
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
  const strapBase = blue ? "#1e3a8a" : "#5a3010";
  const strapHighlight = blue ? "rgba(59, 130, 246, 0.5)" : "rgba(120, 80, 20, 0.5)";
  const rivetPeak = blue ? "#bfdbfe" : "#ffe080";
  const rivetMid = blue ? "#3b82f6" : "#daa520";
  const rivetDark = blue ? "#1e40af" : "#8a6020";

  for (let side = -1; side <= 1; side += 2) {
    const topX = x + side * s * 0.18;
    const topY = y - s * 0.2;
    const botX = x - side * s * 0.1;
    const botY = y + s * 0.12;

    ctx.strokeStyle = strapBase;
    ctx.lineWidth = 2.8 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(botX, botY);
    ctx.stroke();

    ctx.strokeStyle = strapHighlight;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(topX + side * 0.5 * zoom, topY);
    ctx.lineTo(botX + side * 0.5 * zoom, botY);
    ctx.stroke();

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
      rivetGrad.addColorStop(0, rivetPeak);
      rivetGrad.addColorStop(0.5, rivetMid);
      rivetGrad.addColorStop(1, rivetDark);
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
  bGrad.addColorStop(0, rivetPeak);
  bGrad.addColorStop(0.4, rivetMid);
  bGrad.addColorStop(1, rivetDark);
  ctx.fillStyle = bGrad;
  ctx.beginPath();
  ctx.arc(x, buckleY, buckleR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = strapBase;
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
  wingFlap: number,
  flamePulse: number,
  gemPulse: number,
  blue: boolean = false,
) {
  const flapAngle = wingFlap;

  for (let side = -1; side <= 1; side += 2) {
    // Position tracks the wing shoulder joint, lifts/drops with flap
    // Negative flapAngle = wings up → pad moves up (lower Y); positive = wings down → pad drops
    const flapLift = flapAngle * s * 0.10;
    const sx = x + side * s * 0.20;
    const sy = y - s * 0.14 + flapLift;

    // Guard angle tilts to follow wing: sweeps upward from the shoulder
    const guardTilt = -side * (0.35 + flapAngle * 0.25);

    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(guardTilt);
    ctx.scale(side, -1);

    const gL = s * 0.16;
    const gW = s * 0.065;

    // Pointed wing-guard shape (elongated teardrop angled outward)
    ctx.fillStyle = blue
      ? getCachedLinearGradient(ctx, `nassau-guard-flip-blue-${s}`, 0, gW, 0, -gW, [
          [0, "#1e40af"], [0.2, "#2563eb"], [0.5, "#3b82f6"], [0.8, "#2563eb"], [1, "#1e40af"],
        ])
      : getCachedLinearGradient(ctx, `nassau-guard-flip-${s}`, 0, gW, 0, -gW, [
          [0, "#6a4510"], [0.2, "#a07020"], [0.5, "#c49030"], [0.8, "#8a5a18"], [1, "#5a3810"],
        ]);
    ctx.beginPath();
    ctx.moveTo(-gL * 0.3, 0);
    ctx.bezierCurveTo(
      -gL * 0.15, -gW * 0.9,
      gL * 0.3, -gW * 0.7,
      gL * 0.8, -gW * 0.15,
    );
    ctx.lineTo(gL, 0);
    ctx.lineTo(gL * 0.8, gW * 0.15);
    ctx.bezierCurveTo(
      gL * 0.3, gW * 0.7,
      -gL * 0.15, gW * 0.9,
      -gL * 0.3, 0,
    );
    ctx.closePath();
    ctx.fill();

    // Edge outline
    ctx.strokeStyle = blue ? "#1e3a8a" : "#3a2208";
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();

    // Lit edge highlight (after Y-flip, negative Y = visual top in isometric)
    ctx.strokeStyle = blue ? "rgba(147, 197, 253, 0.35)" : "rgba(255, 220, 100, 0.35)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-gL * 0.2, gW * 0.3);
    ctx.bezierCurveTo(
      gL * 0.2, gW * 0.65,
      gL * 0.55, gW * 0.4,
      gL * 0.8, gW * 0.12,
    );
    ctx.stroke();

    // Shadow edge
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(-gL * 0.2, -gW * 0.3);
    ctx.bezierCurveTo(
      gL * 0.2, -gW * 0.65,
      gL * 0.55, -gW * 0.4,
      gL * 0.8, -gW * 0.12,
    );
    ctx.stroke();

    // Overlapping scale plates along guard
    for (let sc = 0; sc < 4; sc++) {
      const scT = (sc + 0.5) / 4;
      const scX = -gL * 0.2 + scT * gL * 0.9;
      const scW = gW * (0.65 - scT * 0.2);
      const scH = gL * 0.08;
      ctx.fillStyle = blue
        ? `rgba(30, 64, 175, ${0.25 - sc * 0.04})`
        : `rgba(100, 70, 20, ${0.25 - sc * 0.04})`;
      ctx.beginPath();
      ctx.ellipse(scX, 0, scH, scW, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central ridge line
    ctx.strokeStyle = blue ? "#1e40af" : "#4a3210";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-gL * 0.25, 0);
    ctx.lineTo(gL * 0.85, 0);
    ctx.stroke();
    ctx.strokeStyle = blue ? "rgba(147, 197, 253, 0.25)" : "rgba(255, 200, 80, 0.25)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(-gL * 0.2, -s * 0.004);
    ctx.lineTo(gL * 0.8, -s * 0.004);
    ctx.stroke();

    // Fire gem at the guard base
    const gemR = s * 0.022;
    const gemGrad = ctx.createRadialGradient(
      -gL * 0.08, 0, 0, -gL * 0.05, 0, gemR,
    );
    if (blue) {
      gemGrad.addColorStop(0, "#bfdbfe");
      gemGrad.addColorStop(0.4, "#60a5fa");
      gemGrad.addColorStop(0.8, "#2563eb");
      gemGrad.addColorStop(1, "#1e3a8a");
    } else {
      gemGrad.addColorStop(0, "#ff8060");
      gemGrad.addColorStop(0.4, "#ee4020");
      gemGrad.addColorStop(0.8, "#cc1810");
      gemGrad.addColorStop(1, "#880000");
    }
    ctx.fillStyle = gemGrad;
    setShadowBlur(ctx, 6 * zoom * gemPulse, blue ? "#3b82f6" : "#ff4400");
    ctx.beginPath();
    ctx.arc(-gL * 0.05, 0, gemR, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    // Gem specular
    ctx.fillStyle = "rgba(255, 240, 230, 0.5)";
    ctx.beginPath();
    ctx.arc(-gL * 0.07, -gemR * 0.3, gemR * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Rivets along the guard
    for (let r = 0; r < 3; r++) {
      const rvX = gL * (0.15 + r * 0.22);
      const rvR = s * 0.007;
      const rvG = ctx.createRadialGradient(
        rvX - rvR * 0.3, -rvR * 0.3, 0, rvX, 0, rvR,
      );
      if (blue) {
        rvG.addColorStop(0, "#bfdbfe");
        rvG.addColorStop(0.5, "#60a5fa");
        rvG.addColorStop(1, "#1e40af");
      } else {
        rvG.addColorStop(0, "#e0b878");
        rvG.addColorStop(0.5, "#c09050");
        rvG.addColorStop(1, "#806030");
      }
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(rvX, 0, rvR, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Flame wisps (drawn in world space, above the guard)
    const wispCount = blue ? 6 : 4;
    for (let w = 0; w < wispCount; w++) {
      const wPhase = (time * 3 + w * 0.6 + side) % 1;
      const wY = sy - wPhase * s * 0.18;
      const wX = sx + Math.sin(time * 5 + w * 2) * s * 0.025;
      const wAlpha = (1 - wPhase) * 0.5;
      const wSize = (1 - wPhase) * s * 0.022;

      const wGrad = ctx.createRadialGradient(wX, wY, 0, wX, wY, wSize);
      if (blue) {
        wGrad.addColorStop(0, `rgba(224, 240, 255, ${wAlpha})`);
        wGrad.addColorStop(0.4, `rgba(96, 165, 250, ${wAlpha * 0.6})`);
        wGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
      } else {
        wGrad.addColorStop(0, `rgba(255, 240, 120, ${wAlpha})`);
        wGrad.addColorStop(0.4, `rgba(255, 160, 40, ${wAlpha * 0.6})`);
        wGrad.addColorStop(1, "rgba(220, 70, 10, 0)");
      }
      ctx.fillStyle = wGrad;
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

  // ── BURNING EYE — blazing raptor eye with fire wisps ──
  const eyeX = hx - headW * 0.35;
  const eyeY = headY + headH * 0.08;
  const eyeW = hs * 0.045;
  const eyeH = hs * 0.036;
  const eyePulse = Math.sin(time * 6) * 0.5 + 0.5;
  const eyeFlicker = Math.sin(time * 14 + 0.3) * 0.3 + 0.7;

  // Deep eye socket recess
  ctx.fillStyle = `rgba(40, 10, 0, 0.5)`;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeW * 1.5, eyeH * 1.5, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Outer fire bloom (large pulsing glow)
  const bloomR = hs * (0.14 + eyePulse * 0.04) * (blue ? 1.15 : 1);
  ctx.save();
  setShadowBlur(ctx, bloomR * 0.6, blue ? "rgba(96, 165, 250, 0.8)" : "rgba(255, 160, 30, 0.8)");
  const bloomGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, bloomR);
  if (blue) {
    bloomGrad.addColorStop(0, `rgba(224, 240, 255, ${0.55 + eyePulse * 0.25})`);
    bloomGrad.addColorStop(0.25, `rgba(147, 197, 253, ${0.35 + eyePulse * 0.15})`);
    bloomGrad.addColorStop(0.55, `rgba(59, 130, 246, ${0.15 + eyePulse * 0.08})`);
    bloomGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
  } else {
    bloomGrad.addColorStop(0, `rgba(255, 255, 200, ${0.55 + eyePulse * 0.25})`);
    bloomGrad.addColorStop(0.25, `rgba(255, 200, 60, ${0.35 + eyePulse * 0.15})`);
    bloomGrad.addColorStop(0.55, `rgba(255, 100, 20, ${0.15 + eyePulse * 0.08})`);
    bloomGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
  }
  ctx.fillStyle = bloomGrad;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, bloomR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Fire wisps streaming from eye
  const wispCount = 5;
  for (let w = 0; w < wispCount; w++) {
    const wPhase = (time * 3.5 + w * 1.3) % 1;
    const wAngle = -0.4 + w * 0.25 + Math.sin(time * 5 + w * 2) * 0.3;
    const wDist = hs * (0.03 + wPhase * 0.10);
    const wx = eyeX + Math.cos(wAngle) * wDist;
    const wy = eyeY + Math.sin(wAngle) * wDist - wPhase * hs * 0.04;
    const wAlpha = (1 - wPhase) * (0.6 + eyePulse * 0.3);
    const wSize = (1 - wPhase) * hs * 0.025;
    const wGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, wSize);
    if (blue) {
      wGrad.addColorStop(0, `rgba(224, 240, 255, ${wAlpha})`);
      wGrad.addColorStop(0.5, `rgba(96, 165, 250, ${wAlpha * 0.5})`);
      wGrad.addColorStop(1, "rgba(59, 130, 246, 0)");
    } else {
      wGrad.addColorStop(0, `rgba(255, 255, 180, ${wAlpha})`);
      wGrad.addColorStop(0.5, `rgba(255, 160, 40, ${wAlpha * 0.5})`);
      wGrad.addColorStop(1, "rgba(255, 80, 0, 0)");
    }
    ctx.fillStyle = wGrad;
    ctx.beginPath();
    ctx.arc(wx, wy, wSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Intense sclera with bloom
  ctx.save();
  setShadowBlur(ctx, eyeW * 2, blue ? "rgba(147, 197, 253, 0.9)" : "rgba(255, 200, 60, 0.9)");
  const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, eyeW);
  if (blue) {
    eyeGrad.addColorStop(0, "#ffffff");
    eyeGrad.addColorStop(0.25, "#e0f0ff");
    eyeGrad.addColorStop(0.55, `rgba(147, 197, 253, ${0.92 + eyeFlicker * 0.08})`);
    eyeGrad.addColorStop(0.8, `rgba(59, 130, 246, ${0.85 + eyePulse * 0.1})`);
    eyeGrad.addColorStop(1, "rgba(29, 78, 216, 0.7)");
  } else {
    eyeGrad.addColorStop(0, "#ffffff");
    eyeGrad.addColorStop(0.25, "#fffae0");
    eyeGrad.addColorStop(0.55, `rgba(255, 220, 80, ${0.92 + eyeFlicker * 0.08})`);
    eyeGrad.addColorStop(0.8, `rgba(255, 140, 30, ${0.85 + eyePulse * 0.1})`);
    eyeGrad.addColorStop(1, "rgba(200, 60, 0, 0.7)");
  }
  ctx.fillStyle = eyeGrad;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeW, eyeH, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Iris — blazing ring
  const irisR = eyeH * 0.65;
  const irisGrad = ctx.createRadialGradient(eyeX, eyeY, irisR * 0.3, eyeX, eyeY, irisR);
  if (blue) {
    irisGrad.addColorStop(0, `rgba(96, 165, 250, ${0.3 + eyeFlicker * 0.2})`);
    irisGrad.addColorStop(0.5, `rgba(29, 78, 216, ${0.9 + eyePulse * 0.1})`);
    irisGrad.addColorStop(1, `rgba(30, 58, 138, 0.95)`);
  } else {
    irisGrad.addColorStop(0, `rgba(255, 180, 40, ${0.3 + eyeFlicker * 0.2})`);
    irisGrad.addColorStop(0.5, `rgba(220, 70, 0, ${0.9 + eyePulse * 0.1})`);
    irisGrad.addColorStop(1, "rgba(150, 30, 0, 0.95)");
  }
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(eyeX, eyeY, irisR, 0, Math.PI * 2);
  ctx.fill();

  // Pupil — vertical slit
  ctx.fillStyle = `rgba(10, 2, 0, ${0.85 + eyeFlicker * 0.1})`;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeH * 0.12, eyeH * 0.50, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hot specular highlights (pulsing)
  ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + eyePulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(eyeX - eyeW * 0.22, eyeY - eyeH * 0.25, eyeH * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 240, ${0.3 + eyePulse * 0.15})`;
  ctx.beginPath();
  ctx.arc(eyeX + eyeW * 0.15, eyeY + eyeH * 0.15, eyeH * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Eye outline with glow
  ctx.save();
  setShadowBlur(ctx, 4 * zoom, blue ? "rgba(96, 165, 250, 0.5)" : "rgba(255, 140, 20, 0.5)");
  ctx.strokeStyle = blue
    ? `rgba(30, 64, 175, ${0.6 + eyePulse * 0.2})`
    : `rgba(180, 60, 0, ${0.6 + eyePulse * 0.2})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.ellipse(eyeX, eyeY, eyeW, eyeH, -0.15, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Brow ridge — heavier
  ctx.strokeStyle = `rgba(120, 50, 5, 0.5)`;
  ctx.lineWidth = 2.0 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(eyeX - eyeW * 1.3, eyeY - eyeH * 1.1);
  ctx.quadraticCurveTo(
    eyeX,
    eyeY - eyeH * 1.6,
    eyeX + eyeW * 1.1,
    eyeY - eyeH * 0.85,
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
  const talonY = y + s * 0.3;
  const talonSpread = isAttacking
    ? s * 0.17 + attackIntensity * s * 0.05
    : s * 0.13;

  for (let side = -1; side <= 1; side += 2) {
    const talonX = x + side * talonSpread;
    const legTopX = x + side * s * 0.09;
    const legTopY = y + s * 0.18;

    // Upper leg (thigh) with muscle definition
    const thighGrad = ctx.createLinearGradient(legTopX, legTopY, talonX, talonY - s * 0.06);
    thighGrad.addColorStop(0, "#bb8800");
    thighGrad.addColorStop(0.3, "#aa7200");
    thighGrad.addColorStop(0.7, "#996600");
    thighGrad.addColorStop(1, "#775000");
    ctx.strokeStyle = thighGrad;
    ctx.lineWidth = 5 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(legTopX, legTopY);
    ctx.quadraticCurveTo(
      legTopX + side * s * 0.03, legTopY + s * 0.06,
      talonX, talonY - s * 0.06,
    );
    ctx.stroke();

    // Scaled leg texture
    ctx.strokeStyle = `rgba(100, 70, 0, 0.25)`;
    ctx.lineWidth = 0.8 * zoom;
    for (let sc = 0; sc < 5; sc++) {
      const t = (sc + 1) / 6;
      const scX = legTopX + (talonX - legTopX) * t;
      const scY = legTopY + (talonY - s * 0.06 - legTopY) * t;
      const scW = s * (0.025 - sc * 0.002);
      ctx.beginPath();
      ctx.moveTo(scX - scW, scY);
      ctx.quadraticCurveTo(scX, scY + s * 0.004, scX + scW, scY);
      ctx.stroke();
    }

    // Armored greave (shin guard)
    const greaveTop = talonY - s * 0.12;
    const greaveBot = talonY - s * 0.01;
    const greaveW = s * 0.05;
    const gG = ctx.createLinearGradient(talonX - greaveW, greaveTop, talonX + greaveW, greaveBot);
    gG.addColorStop(0, "#2a2218");
    gG.addColorStop(0.25, "#4a3a28");
    gG.addColorStop(0.5, "#5a4a38");
    gG.addColorStop(0.75, "#4a3a28");
    gG.addColorStop(1, "#2a2218");
    ctx.fillStyle = gG;
    ctx.beginPath();
    ctx.moveTo(talonX - greaveW, greaveTop);
    ctx.quadraticCurveTo(talonX - greaveW * 1.15, (greaveTop + greaveBot) * 0.5, talonX - greaveW * 0.9, greaveBot);
    ctx.lineTo(talonX + greaveW * 0.9, greaveBot);
    ctx.quadraticCurveTo(talonX + greaveW * 1.15, (greaveTop + greaveBot) * 0.5, talonX + greaveW, greaveTop);
    ctx.closePath();
    ctx.fill();

    // Greave border and gold trim
    ctx.strokeStyle = "#1a1008";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
    ctx.strokeStyle = "#daa520";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(talonX - greaveW * 0.95, greaveTop + s * 0.005);
    ctx.lineTo(talonX + greaveW * 0.95, greaveTop + s * 0.005);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(talonX - greaveW * 0.85, greaveBot - s * 0.005);
    ctx.lineTo(talonX + greaveW * 0.85, greaveBot - s * 0.005);
    ctx.stroke();

    // Greave midline and rivets
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(talonX, greaveTop + s * 0.01);
    ctx.lineTo(talonX, greaveBot - s * 0.01);
    ctx.stroke();

    // Rivets on greave
    for (let r = 0; r < 2; r++) {
      const rvY = greaveTop + s * 0.02 + r * (greaveBot - greaveTop - s * 0.04);
      const rvG = ctx.createRadialGradient(talonX - s * 0.002, rvY - s * 0.002, 0, talonX, rvY, s * 0.007);
      rvG.addColorStop(0, "#f0d860");
      rvG.addColorStop(0.5, "#daa520");
      rvG.addColorStop(1, "#8a7010");
      ctx.fillStyle = rvG;
      ctx.beginPath();
      ctx.arc(talonX, rvY, s * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ankle joint
    const ankleG = ctx.createRadialGradient(talonX, talonY, 0, talonX, talonY, s * 0.035);
    ankleG.addColorStop(0, "#bb9030");
    ankleG.addColorStop(0.5, "#997020");
    ankleG.addColorStop(1, "#775015");
    ctx.fillStyle = ankleG;
    ctx.beginPath();
    ctx.arc(talonX, talonY, s * 0.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5a3a10";
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Talon toes with large sharp curved claws
    for (let t = 0; t < 3; t++) {
      const toeAngle = (t - 1) * 0.5 + side * 0.2;
      const toeLen = s * 0.065;
      const grab = isAttacking
        ? Math.sin(attackIntensity * Math.PI) * (0.15 + t * 0.04)
        : 0;
      const clawAngle = Math.PI / 2 + toeAngle + grab;

      // Toe segment
      const toeGrad = ctx.createLinearGradient(
        talonX, talonY,
        talonX + Math.cos(clawAngle) * toeLen,
        talonY + Math.sin(clawAngle) * toeLen,
      );
      toeGrad.addColorStop(0, "#aa8020");
      toeGrad.addColorStop(0.5, "#997020");
      toeGrad.addColorStop(1, "#775010");
      ctx.strokeStyle = toeGrad;
      ctx.lineWidth = 2.8 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(talonX, talonY);
      ctx.lineTo(
        talonX + Math.cos(clawAngle) * toeLen,
        talonY + Math.sin(clawAngle) * toeLen,
      );
      ctx.stroke();

      // Toe joint bumps
      const jointX = talonX + Math.cos(clawAngle) * toeLen * 0.5;
      const jointY = talonY + Math.sin(clawAngle) * toeLen * 0.5;
      ctx.fillStyle = "#bb9030";
      ctx.beginPath();
      ctx.arc(jointX, jointY, s * 0.008, 0, Math.PI * 2);
      ctx.fill();

      // Large curved claw
      const cBaseX = talonX + Math.cos(clawAngle) * toeLen;
      const cBaseY = talonY + Math.sin(clawAngle) * toeLen;
      const clawLen = s * 0.065;
      const clawCurve = 0.35;

      ctx.save();
      ctx.translate(cBaseX, cBaseY);
      ctx.rotate(clawAngle - Math.PI * 0.15);

      ctx.fillStyle = getCachedLinearGradient(ctx, `nassau-claw-${s}`, 0, 0, 0, clawLen, [
        [0, "#4a4a4a"], [0.2, "#2a2a2a"], [0.6, "#1a1a1a"], [0.9, "#808080"], [1, "#cccccc"],
      ]);

      const cW = s * 0.018;
      ctx.beginPath();
      ctx.moveTo(-cW, 0);
      ctx.quadraticCurveTo(-cW * 0.8, clawLen * 0.5, -cW * 0.15, clawLen * 0.85);
      ctx.quadraticCurveTo(0, clawLen * 1.02, cW * 0.15, clawLen * 0.85);
      ctx.quadraticCurveTo(cW * 0.8, clawLen * 0.5, cW, 0);
      ctx.closePath();
      ctx.fill();

      // Claw spine highlight
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.moveTo(-cW * 0.1, s * 0.005);
      ctx.quadraticCurveTo(-cW * 0.05, clawLen * 0.5, 0, clawLen * 0.88);
      ctx.stroke();

      ctx.restore();
    }

    // Rear talon (hallux)
    const rearAngle = -Math.PI * 0.35 + side * 0.3;
    const rearLen = s * 0.04;
    ctx.strokeStyle = "#886020";
    ctx.lineWidth = 2.2 * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(talonX, talonY);
    ctx.lineTo(
      talonX + Math.cos(rearAngle) * rearLen,
      talonY + Math.sin(rearAngle) * rearLen,
    );
    ctx.stroke();

    // Rear claw
    const rTipX = talonX + Math.cos(rearAngle) * rearLen;
    const rTipY = talonY + Math.sin(rearAngle) * rearLen;
    ctx.fillStyle = "#3a3a3a";
    ctx.beginPath();
    ctx.moveTo(rTipX - s * 0.008, rTipY);
    ctx.quadraticCurveTo(rTipX, rTipY + s * 0.03, rTipX + s * 0.008, rTipY);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── BELT / WAIST ARMOR ─────────────────────────────────────────────────────

function drawBeltArmor(
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
  const beltY = y + s * 0.14;
  const beltHW = s * 0.22;
  const beltH = s * 0.05;
  const vDip = s * 0.04;

  // Belt body — ornate gold-trimmed band
  const beltGrad = ctx.createLinearGradient(x - beltHW, beltY, x + beltHW, beltY);
  beltGrad.addColorStop(0, "#5a3a10");
  beltGrad.addColorStop(0.15, "#8a6020");
  beltGrad.addColorStop(0.3, "#c09040");
  beltGrad.addColorStop(0.5, "#daa050");
  beltGrad.addColorStop(0.7, "#c09040");
  beltGrad.addColorStop(0.85, "#8a6020");
  beltGrad.addColorStop(1, "#5a3a10");
  ctx.fillStyle = beltGrad;
  ctx.beginPath();
  ctx.moveTo(x - beltHW, beltY - beltH * 0.5);
  ctx.lineTo(x + beltHW, beltY - beltH * 0.5);
  ctx.lineTo(x + beltHW, beltY + beltH * 0.5);
  ctx.lineTo(x, beltY + beltH * 0.5 + vDip);
  ctx.lineTo(x - beltHW, beltY + beltH * 0.5);
  ctx.closePath();
  ctx.fill();

  // Belt border
  ctx.strokeStyle = "#1a1008";
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();

  // Gold trim lines
  ctx.strokeStyle = "#daa520";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - beltHW + s * 0.01, beltY - beltH * 0.35);
  ctx.lineTo(x + beltHW - s * 0.01, beltY - beltH * 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - beltHW + s * 0.01, beltY + beltH * 0.3);
  ctx.quadraticCurveTo(x, beltY + beltH * 0.3 + vDip * 0.6, x + beltHW - s * 0.01, beltY + beltH * 0.3);
  ctx.stroke();

  // Belt rivets
  for (let r = 0; r < 5; r++) {
    const t = (r + 0.5) / 5;
    const rvX = x - beltHW + t * beltHW * 2;
    const rvY = beltY;
    const rvG = ctx.createRadialGradient(rvX - s * 0.002, rvY - s * 0.002, 0, rvX, rvY, s * 0.006);
    rvG.addColorStop(0, "#f0d860");
    rvG.addColorStop(0.5, "#daa520");
    rvG.addColorStop(1, "#8a7010");
    ctx.fillStyle = rvG;
    ctx.beginPath();
    ctx.arc(rvX, rvY, s * 0.005, 0, Math.PI * 2);
    ctx.fill();
  }

  // Center buckle gem
  const buckleR = s * 0.025;
  const buckleGrad = ctx.createRadialGradient(x, beltY + vDip * 0.25, 0, x, beltY + vDip * 0.25, buckleR);
  if (blue) {
    buckleGrad.addColorStop(0, `rgba(224, 240, 255, ${0.9 + gemPulse * 0.1})`);
    buckleGrad.addColorStop(0.3, `rgba(96, 165, 250, ${0.85 + gemPulse * 0.1})`);
    buckleGrad.addColorStop(0.7, `rgba(37, 99, 235, 0.8)`);
    buckleGrad.addColorStop(1, `rgba(29, 78, 216, 0.5)`);
  } else {
    buckleGrad.addColorStop(0, `rgba(255, 220, 100, ${0.9 + gemPulse * 0.1})`);
    buckleGrad.addColorStop(0.3, `rgba(255, 140, 30, ${0.85 + gemPulse * 0.1})`);
    buckleGrad.addColorStop(0.7, `rgba(200, 60, 10, 0.8)`);
    buckleGrad.addColorStop(1, `rgba(120, 20, 0, 0.5)`);
  }
  ctx.fillStyle = buckleGrad;
  setShadowBlur(ctx, 6 * zoom * gemPulse, blue ? "#3b82f6" : "#ff6600");
  ctx.beginPath();
  ctx.arc(x, beltY + vDip * 0.25, buckleR, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Gem specular
  ctx.fillStyle = "rgba(255, 255, 240, 0.5)";
  ctx.beginPath();
  ctx.arc(x - buckleR * 0.3, beltY + vDip * 0.25 - buckleR * 0.3, buckleR * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Buckle frame
  ctx.strokeStyle = "#5a3a10";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, beltY + vDip * 0.25, buckleR * 1.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 210, 80, 0.3)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.arc(x, beltY + vDip * 0.25, buckleR * 1.15, 0, Math.PI * 2);
  ctx.stroke();

  // Hanging tasset tabs (short armor plates below belt)
  for (let side = -1; side <= 1; side += 2) {
    for (let tab = 0; tab < 3; tab++) {
      const tabX = x + side * (s * 0.06 + tab * s * 0.055);
      const tabTopY = beltY + beltH * 0.4;
      const tabBotY = tabTopY + s * 0.06;
      const tabW = s * 0.022;
      const sway = Math.sin(time * 1.8 + tab * 0.6 + side * 0.3) * s * 0.002;

      const tabG = ctx.createLinearGradient(tabX - tabW, tabTopY, tabX + tabW, tabBotY);
      tabG.addColorStop(0, "#4a3a28");
      tabG.addColorStop(0.3, "#5a4a38");
      tabG.addColorStop(0.7, "#3a2a18");
      tabG.addColorStop(1, "#2a1a0a");
      ctx.fillStyle = tabG;
      ctx.beginPath();
      ctx.moveTo(tabX - tabW, tabTopY);
      ctx.lineTo(tabX + tabW, tabTopY);
      ctx.lineTo(tabX + tabW * 0.8 + sway, tabBotY);
      ctx.lineTo(tabX, tabBotY + s * 0.008);
      ctx.lineTo(tabX - tabW * 0.8 + sway, tabBotY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1a1008";
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();

      // Gold rivet on tab
      ctx.fillStyle = "#daa520";
      ctx.beginPath();
      ctx.arc(tabX + sway * 0.5, tabTopY + s * 0.015, s * 0.004, 0, Math.PI * 2);
      ctx.fill();
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

  // Isometric aura — elliptical on ground plane
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
  ctx.ellipse(x, y, auraRadius, auraRadius * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting ember particles — isometric orbits using ISO_Y_RATIO
  const emberCount = blue ? 14 : 10;
  for (let i = 0; i < emberCount; i++) {
    const orbitAngle =
      time * (blue ? 3.5 : 2.2) + (i * Math.PI * 2) / emberCount;
    const orbitDist = s * (0.32 + Math.sin(time * 1.3 + i) * 0.1);
    const emberX = x + Math.cos(orbitAngle) * orbitDist;
    const emberY = y + Math.sin(orbitAngle) * orbitDist * ISO_Y_RATIO;
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
  const rawPhase = Math.sin(attackIntensity * Math.PI);
  const flarePhase = rawPhase * rawPhase;
  const flareRadius = s * (0.5 + (blue ? 0.12 : 0)) * flarePhase;

  if (flareRadius < 0.5) return;

  const flareGrad = ctx.createRadialGradient(
    x,
    y - s * 0.1,
    0,
    x,
    y - s * 0.1,
    flareRadius,
  );
  if (blue) {
    flareGrad.addColorStop(0, `rgba(224, 240, 255, ${0.55 * flarePhase})`);
    flareGrad.addColorStop(0.25, `rgba(147, 197, 253, ${0.35 * flarePhase})`);
    flareGrad.addColorStop(0.55, `rgba(59, 130, 246, ${0.18 * flarePhase})`);
    flareGrad.addColorStop(1, "rgba(29, 78, 216, 0)");
  } else {
    flareGrad.addColorStop(0, `rgba(255, 255, 230, ${0.5 * flarePhase})`);
    flareGrad.addColorStop(0.25, `rgba(255, 220, 100, ${0.3 * flarePhase})`);
    flareGrad.addColorStop(0.55, `rgba(255, 140, 30, ${0.15 * flarePhase})`);
    flareGrad.addColorStop(1, "rgba(200, 50, 10, 0)");
  }
  ctx.fillStyle = flareGrad;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.1, flareRadius, 0, Math.PI * 2);
  ctx.fill();

  const burstCount = blue ? 12 : 8;
  for (let i = 0; i < burstCount; i++) {
    const angle = (i / burstCount) * Math.PI * 2 + time * (blue ? 1.8 : 1.2);
    const lineLen = s * (0.3 + (blue ? 0.08 : 0)) * flarePhase;
    const lineAlpha = flarePhase * (blue ? 0.4 : 0.32);
    const innerR = s * 0.08;

    ctx.strokeStyle = blue
      ? i % 2 === 0
        ? `rgba(147, 197, 253, ${lineAlpha})`
        : `rgba(96, 165, 250, ${lineAlpha * 0.6})`
      : i % 2 === 0
        ? `rgba(255, 200, 60, ${lineAlpha})`
        : `rgba(255, 140, 40, ${lineAlpha * 0.6})`;
    ctx.lineWidth = (i % 2 === 0 ? 1.8 : 1) * zoom;
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
