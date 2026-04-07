import { ISO_Y_RATIO } from "../../constants/isometric";
import type { MapTheme } from "../../types";
import { setShadowBlur, clearShadow } from "../performance";
import { drawPulsingGlowRings, drawShiftingSegments } from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";
import { drawFaceCircle } from "./helpers";
import { getRegionMaterials, drawRegionBodyAccent } from "./regionVariants";

const TAU = Math.PI * 2;

export function drawMascotEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  isFlying: boolean,
  attackPhase: number = 0,
  region: MapTheme = "grassland"
) {
  // TEMPEST GRIFFIN - Elemental chaos beast with storm wings and lightning breath
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const swoop =
    Math.sin(time * 4) * 5 * zoom +
    (isAttacking ? attackIntensity * size * 0.2 : 0);
  const wingFlap = Math.sin(time * 12) * 0.55;
  const stormPulse = 0.6 + Math.sin(time * 6) * 0.4;
  const lightningFlash = Math.sin(time * 15) > 0.7 ? 1 : 0.3;

  let costumeMain = "#0891b2";
  let costumeDark = "#0e7490";
  let costumeDeep = "#155e75";
  let costumeLight = "#06b6d4";
  let costumeBright = "#22d3ee";
  let costumeAccent = "#67e8f9";
  let beakBase = "#f59e0b";
  let beakBright = "#fbbf24";
  let beakDark = "#d97706";
  let clawColor = "#fcd34d";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    costumeMain = rm.cloth.base;
    costumeDark = rm.cloth.dark;
    costumeDeep = rm.cloth.dark;
    costumeLight = rm.cloth.light;
    costumeBright = rm.cloth.trim;
    costumeAccent = rm.cloth.trim;
    beakBase = rm.metal.base;
    beakBright = rm.metal.bright;
    beakDark = rm.metal.dark;
    clawColor = rm.metal.accent;
  }

  // Storm cloud aura
  ctx.save();
  for (let cloud = 0; cloud < 5; cloud++) {
    const cloudAngle = time * 0.5 + cloud * Math.PI * 0.4;
    const cloudDist = size * 0.6 + Math.sin(time * 2 + cloud) * size * 0.1;
    const cx = x + Math.cos(cloudAngle) * cloudDist;
    const cy = y - size * 0.1 + Math.sin(cloudAngle) * cloudDist * 0.4;
    ctx.fillStyle = `rgba(55, 65, 81, ${0.3 - cloud * 0.05})`;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.05, cy - size * 0.03, size * 0.07, 0, Math.PI * 2);
    ctx.arc(cx - size * 0.04, cy + size * 0.02, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Lightning bolts in aura
  if (lightningFlash > 0.5) {
    setShadowBlur(ctx, 8 * zoom, "#67e8f9");
    ctx.strokeStyle = `rgba(103, 232, 249, ${lightningFlash})`;
    ctx.lineWidth = 2 * zoom;
    for (let bolt = 0; bolt < 3; bolt++) {
      const boltAngle = time * 2 + bolt * Math.PI * 0.67;
      ctx.beginPath();
      let bx = x + Math.cos(boltAngle) * size * 0.3;
      let by = y + Math.sin(boltAngle) * size * 0.25;
      ctx.moveTo(bx, by);
      for (let seg = 0; seg < 3; seg++) {
        bx += (Math.random() - 0.5) * size * 0.15;
        by += size * 0.08;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
    clearShadow(ctx);
  }

  // Blazing chaos aura - more intense
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(34, 211, 238, ${stormPulse * 0.4})`);
  auraGrad.addColorStop(0.3, `rgba(6, 182, 212, ${stormPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(8, 145, 178, ${stormPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spectral fire particles (optimized - no shadowBlur in loop)
  for (let i = 0; i < 12; i++) {
    const particlePhase = (time * 2.5 + i * 0.25) % 1.5;
    const px = x + Math.sin(time * 3.5 + i * 1) * size * 0.45;
    const py = y + size * 0.25 - particlePhase * size * 0.6;
    ctx.fillStyle = `rgba(100, 230, 255, ${(1 - particlePhase / 1.5) * 0.8})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.035 * (1 - particlePhase / 2), 0, Math.PI * 2);
    ctx.fill();
  }

  // Magnificent storm wings
  if (isFlying) {
    // Left wing - feathered with lightning veins
    ctx.save();
    ctx.translate(x - size * 0.28, y - size * 0.12 + swoop * 0.3);
    ctx.rotate(-0.45 - wingFlap);
    const wingGradL = ctx.createLinearGradient(0, 0, -size * 0.9, 0);
    wingGradL.addColorStop(0, costumeDark);
    wingGradL.addColorStop(0.3, costumeMain);
    wingGradL.addColorStop(0.6, costumeLight);
    wingGradL.addColorStop(1, costumeBright);
    ctx.fillStyle = wingGradL;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-size * 0.35, -size * 0.45, -size * 0.8, -size * 0.3);
    ctx.lineTo(-size * 0.9, -size * 0.18);
    ctx.lineTo(-size * 0.72, -size * 0.06);
    ctx.lineTo(-size * 0.85, size * 0.06);
    ctx.lineTo(-size * 0.62, size * 0.1);
    ctx.lineTo(-size * 0.68, size * 0.22);
    ctx.lineTo(-size * 0.4, size * 0.15);
    ctx.quadraticCurveTo(-size * 0.18, size * 0.18, 0, size * 0.12);
    ctx.closePath();
    ctx.fill();
    // Wing feather details with lightning
    ctx.strokeStyle = costumeAccent;
    ctx.lineWidth = 2 * zoom;
    for (let f = 0; f < 6; f++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.12 - f * size * 0.13, size * 0.06);
      ctx.lineTo(-size * 0.22 - f * size * 0.15, -size * 0.18);
      ctx.stroke();
    }
    // Lightning veins on wing
    ctx.strokeStyle = `rgba(165, 243, 252, ${lightningFlash * 0.6})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, 0);
    ctx.lineTo(-size * 0.35, -size * 0.1);
    ctx.lineTo(-size * 0.5, -size * 0.08);
    ctx.lineTo(-size * 0.65, -size * 0.15);
    ctx.stroke();
    ctx.restore();

    // Right wing
    ctx.save();
    ctx.translate(x + size * 0.28, y - size * 0.12 + swoop * 0.3);
    ctx.rotate(0.45 + wingFlap);
    const wingGradR = ctx.createLinearGradient(0, 0, size * 0.9, 0);
    wingGradR.addColorStop(0, costumeDark);
    wingGradR.addColorStop(0.3, costumeMain);
    wingGradR.addColorStop(0.6, costumeLight);
    wingGradR.addColorStop(1, costumeBright);
    ctx.fillStyle = wingGradR;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.35, -size * 0.45, size * 0.8, -size * 0.3);
    ctx.lineTo(size * 0.9, -size * 0.18);
    ctx.lineTo(size * 0.72, -size * 0.06);
    ctx.lineTo(size * 0.85, size * 0.06);
    ctx.lineTo(size * 0.62, size * 0.1);
    ctx.lineTo(size * 0.68, size * 0.22);
    ctx.lineTo(size * 0.4, size * 0.15);
    ctx.quadraticCurveTo(size * 0.18, size * 0.18, 0, size * 0.12);
    ctx.closePath();
    ctx.fill();
    // Wing feather details
    ctx.strokeStyle = costumeAccent;
    ctx.lineWidth = 2 * zoom;
    for (let f = 0; f < 6; f++) {
      ctx.beginPath();
      ctx.moveTo(size * 0.12 + f * size * 0.13, size * 0.06);
      ctx.lineTo(size * 0.22 + f * size * 0.15, -size * 0.18);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Storm tail with lightning
  ctx.save();
  ctx.translate(x + size * 0.28, y + size * 0.22 + swoop * 0.2);
  ctx.rotate(Math.sin(time * 5) * 0.35);
  // Tail base
  const tailGrad = ctx.createLinearGradient(0, 0, size * 0.6, 0);
  tailGrad.addColorStop(0, costumeDark);
  tailGrad.addColorStop(0.5, costumeMain);
  tailGrad.addColorStop(1, costumeBright);
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.04);
  ctx.quadraticCurveTo(size * 0.35, -size * 0.08, size * 0.55, 0);
  ctx.quadraticCurveTo(size * 0.35, size * 0.08, 0, size * 0.04);
  ctx.fill();
  // Tail flames (optimized - no shadowBlur in loop)
  for (let i = 0; i < 4; i++) {
    const flameY = Math.sin(time * 8 + i * 1.2) * size * 0.06;
    ctx.fillStyle = `rgba(150, 240, 255, ${0.8 - i * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(size * 0.5 + i * size * 0.1, flameY);
    ctx.quadraticCurveTo(
      size * 0.6 + i * size * 0.12,
      flameY - size * 0.1,
      size * 0.68 + i * size * 0.14,
      flameY
    );
    ctx.quadraticCurveTo(
      size * 0.6 + i * size * 0.12,
      flameY + size * 0.08,
      size * 0.5 + i * size * 0.1,
      flameY
    );
    ctx.fill();
  }
  ctx.restore();

  // Powerful leonine body with armored scales
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + swoop * 0.2,
    0,
    x,
    y + swoop * 0.2,
    size * 0.48
  );
  bodyGrad.addColorStop(0, costumeDeep);
  bodyGrad.addColorStop(0.4, costumeDark);
  bodyGrad.addColorStop(0.7, costumeMain);
  bodyGrad.addColorStop(1, costumeLight);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.06 + swoop * 0.2,
    size * 0.38,
    size * 0.44,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Scale pattern
  ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      const sx = x - size * 0.2 + col * size * 0.1 + (row % 2) * size * 0.05;
      const sy = y - size * 0.1 + row * size * 0.12 + swoop * 0.2;
      ctx.beginPath();
      ctx.arc(sx, sy, size * 0.04, 0.5 * Math.PI, 1.5 * Math.PI);
      ctx.stroke();
    }
  }

  // Chest feathers with luminescence
  const chestGrad = ctx.createRadialGradient(
    x,
    y - size * 0.08 + swoop * 0.2,
    0,
    x,
    y - size * 0.08 + swoop * 0.2,
    size * 0.24
  );
  chestGrad.addColorStop(0, "#cffafe");
  chestGrad.addColorStop(0.5, "#a5f3fc");
  chestGrad.addColorStop(1, "#67e8f9");
  ctx.fillStyle = chestGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.08 + swoop * 0.2,
    size * 0.2,
    size * 0.25,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Feather texture - more detailed
  ctx.strokeStyle = costumeBright;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(
      x,
      y + size * 0.06 + swoop * 0.2,
      size * 0.09 + i * size * 0.028,
      0.55 * Math.PI,
      0.45 * Math.PI,
      true
    );
    ctx.stroke();
  }

  // Majestic eagle head with crest
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.4 + swoop,
    0,
    x,
    y - size * 0.4 + swoop,
    size * 0.28
  );
  headGrad.addColorStop(0, costumeDark);
  headGrad.addColorStop(0.6, costumeMain);
  headGrad.addColorStop(1, costumeLight);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + swoop, size * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Crown crest feathers (optimized - no shadowBlur)
  ctx.fillStyle = costumeAccent;
  for (let i = 0; i < 9; i++) {
    const crestAngle = -Math.PI * 0.45 + i * Math.PI * 0.11;
    const crestLen = size * (0.18 + Math.sin(time * 6 + i * 0.8) * 0.04);
    ctx.save();
    ctx.translate(
      x + Math.cos(crestAngle) * size * 0.2,
      y - size * 0.55 + swoop
    );
    ctx.rotate(crestAngle + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.035, -crestLen);
    ctx.lineTo(0, -crestLen * 1.1);
    ctx.lineTo(size * 0.035, -crestLen);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Fierce glowing eyes (optimized - no shadowBlur)
  ctx.fillStyle = "#fef9c3";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.42 + swoop,
    size * 0.072,
    size * 0.055,
    -0.15,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.42 + swoop,
    size * 0.072,
    size * 0.055,
    0.15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Predator slit pupils
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y - size * 0.42 + swoop,
    size * 0.022,
    size * 0.045,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.42 + swoop,
    size * 0.022,
    size * 0.045,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Lightning reflection in eyes
  ctx.fillStyle = `rgba(103, 232, 249, ${lightningFlash * 0.5})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.12,
    y - size * 0.44 + swoop,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.44 + swoop,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Sharp hooked beak with golden sheen
  const beakGrad = ctx.createLinearGradient(
    x - size * 0.1,
    y - size * 0.35,
    x + size * 0.1,
    y - size * 0.2
  );
  beakGrad.addColorStop(0, beakBase);
  beakGrad.addColorStop(0.5, beakBright);
  beakGrad.addColorStop(1, beakBase);
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.37 + swoop);
  ctx.quadraticCurveTo(
    x - size * 0.1,
    y - size * 0.34 + swoop,
    x - size * 0.06,
    y - size * 0.22 + swoop
  );
  ctx.lineTo(x, y - size * 0.17 + swoop);
  ctx.lineTo(x + size * 0.06, y - size * 0.22 + swoop);
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y - size * 0.34 + swoop,
    x,
    y - size * 0.37 + swoop
  );
  ctx.fill();
  // Beak detail
  ctx.strokeStyle = beakDark;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.37 + swoop);
  ctx.lineTo(x, y - size * 0.19 + swoop);
  ctx.stroke();
  // Beak hook
  ctx.fillStyle = beakDark;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18 + swoop, size * 0.02, 0, Math.PI);
  ctx.fill();

  // Powerful talons with golden claws
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.22, y + size * 0.44 + swoop * 0.1);
    // Feathered leg
    const legGrad = ctx.createLinearGradient(0, -size * 0.18, 0, 0);
    legGrad.addColorStop(0, costumeMain);
    legGrad.addColorStop(1, costumeDark);
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.045, -size * 0.18, size * 0.09, size * 0.18);
    // Leg scales
    ctx.strokeStyle = costumeLight;
    ctx.lineWidth = 1 * zoom;
    for (let s = 0; s < 4; s++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.04, -size * 0.15 + s * size * 0.04);
      ctx.lineTo(size * 0.04, -size * 0.13 + s * size * 0.04);
      ctx.stroke();
    }
    // Golden talons (optimized - no shadowBlur)
    ctx.fillStyle = clawColor;
    for (let t = 0; t < 3; t++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.045 + t * size * 0.045, 0);
      ctx.lineTo(-size * 0.055 + t * size * 0.055, size * 0.14);
      ctx.lineTo(-size * 0.02 + t * size * 0.045, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  // Blazing trail effect (for flying) - more dramatic
  if (isFlying) {
    ctx.globalAlpha = 0.5;
    for (let t = 1; t < 5; t++) {
      ctx.fillStyle = `rgba(34, 211, 238, ${0.35 - t * 0.07})`;
      ctx.beginPath();
      ctx.ellipse(
        x + t * 7,
        y + t * 5 + swoop * 0.2,
        size * 0.28 - t * size * 0.045,
        size * 0.34 - t * size * 0.06,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Powerful clawed legs with stomping animation
  drawPathLegs(ctx, x, y + size * 0.38 + swoop * 0.15, size, time, zoom, {
    color: costumeMain,
    colorDark: costumeDark,
    footColor: clawColor,
    legLen: 0.22,
    strideAmt: 0.45,
    strideSpeed: 3,
    style: "fleshy",
    width: 0.07,
  });

  // Storm glow rings around body
  drawPulsingGlowRings(ctx, x, y + swoop * 0.2, size * 0.5, time, zoom, {
    color: "rgba(34, 211, 238, 0.5)",
    count: 4,
    expansion: 1.2,
    lineWidth: 2,
    maxAlpha: 0.35,
    speed: 2,
  });

  // Floating storm scale segments (diamond shape)
  drawShiftingSegments(ctx, x, y + swoop * 0.2, size, time, zoom, {
    color: costumeBright,
    colorAlt: costumeLight,
    count: 8,
    orbitRadius: 0.55,
    orbitSpeed: 1.8,
    segmentSize: 0.04,
    shape: "diamond",
  });

  drawRegionBodyAccent(ctx, x, y + swoop * 0.2, size, region, time, zoom);
}

export function drawDefaultEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const bob =
    Math.sin(time * 4) * 3 * zoom +
    (isAttacking ? attackIntensity * size * 0.1 : 0);
  const voidPulse = 0.5 + Math.sin(time * 5) * 0.3;
  const corruptionWave = Math.sin(time * 3) * 0.15;
  const breathe = Math.sin(time * 2) * 0.02;
  const eyeFlicker = 0.7 + Math.sin(time * 8) * 0.3;
  const runeGlow = 0.4 + Math.sin(time * 3.5) * 0.4;
  size *= 1.3;

  // Void distortion ripples
  ctx.strokeStyle = `rgba(55, 48, 163, ${voidPulse * 0.25})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const ripPhase = (time * 0.7 + i * 0.4) % 2;
    const ripSize = size * 0.3 + ripPhase * size * 0.35;
    ctx.globalAlpha = 0.35 * (1 - ripPhase / 2);
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += 0.12) {
      const r = ripSize + Math.sin(a * 6 + time * 3) * size * 0.03;
      const wx = x + Math.cos(a) * r;
      const wy = y + Math.sin(a) * r * 0.6;
      if (a === 0) {
        ctx.moveTo(wx, wy);
      } else {
        ctx.lineTo(wx, wy);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Dark void aura - layered
  for (let layer = 2; layer >= 0; layer--) {
    const layerSize = size * (0.7 + layer * 0.15);
    const layerAlpha = voidPulse * 0.12 * (1 - layer * 0.25);
    const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
    auraGrad.addColorStop(0, `rgba(55, 48, 163, ${layerAlpha * 0.6})`);
    auraGrad.addColorStop(0.4, `rgba(67, 56, 202, ${layerAlpha})`);
    auraGrad.addColorStop(0.7, `rgba(30, 27, 75, ${layerAlpha * 0.5})`);
    auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(x, y, layerSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating void shards with trails
  for (let i = 0; i < 8; i++) {
    const shardAngle = time * 1.8 + i * Math.PI * 0.25;
    const shardDist = size * 0.4 + Math.sin(time * 2.5 + i) * size * 0.1;
    const px = x + Math.cos(shardAngle) * shardDist;
    const py = y - size * 0.05 + Math.sin(shardAngle) * shardDist * 0.45;
    // Trail
    ctx.strokeStyle = `rgba(99, 102, 241, ${0.15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(
      px + Math.cos(shardAngle + Math.PI) * size * 0.07,
      py + Math.sin(shardAngle + Math.PI) * size * 0.04
    );
    ctx.stroke();
    // Shard
    const shardPulse = 0.5 + Math.sin(time * 4 + i * 1.2) * 0.3;
    ctx.fillStyle = `rgba(129, 140, 248, ${shardPulse})`;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 3 + i);
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.025);
    ctx.lineTo(size * 0.015, 0);
    ctx.lineTo(0, size * 0.025);
    ctx.lineTo(-size * 0.015, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Void tendrils reaching from below
  ctx.strokeStyle = `rgba(30, 27, 75, ${0.5 + corruptionWave * 0.3})`;
  ctx.lineWidth = 3 * zoom;
  for (let t = 0; t < 5; t++) {
    const tendrilAngle =
      -Math.PI * 0.8 + t * Math.PI * 0.4 + Math.sin(time * 1.5) * 0.08;
    const tendrilSway = Math.sin(time * 2.5 + t * 1.3) * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tendrilAngle) * size * 0.3, y + size * 0.42);
    ctx.quadraticCurveTo(
      x + Math.cos(tendrilAngle + tendrilSway) * size * 0.45,
      y + size * 0.15,
      x + Math.cos(tendrilAngle + tendrilSway * 1.5) * size * 0.35,
      y - size * 0.05 + Math.sin(time * 3 + t) * size * 0.05
    );
    ctx.stroke();
  }

  // Default arms — walking swing with character
  drawPathArm(
    ctx,
    x - size * 0.2,
    y - size * 0.28 + bob * 0.3,
    size,
    time,
    zoom,
    -1,
    {
      color: "#3730a3",
      colorDark: "#1e1b4b",
      elbowAngle: 0.4 + Math.sin(time * 3.5 + 1) * 0.12,
      foreLen: 0.12,
      handColor: "#c7d2fe",
      shoulderAngle: -0.5 + Math.sin(time * 3) * 0.15,
      style: "fleshy",
      upperLen: 0.15,
      width: 0.05,
    }
  );
  drawPathArm(
    ctx,
    x + size * 0.2,
    y - size * 0.28 + bob * 0.3,
    size,
    time,
    zoom,
    1,
    {
      color: "#3730a3",
      colorDark: "#1e1b4b",
      elbowAngle: 0.4 + Math.sin(time * 3.5 + 2.5) * 0.12,
      foreLen: 0.12,
      handColor: "#c7d2fe",
      shoulderAngle: 0.5 + Math.sin(time * 3 + Math.PI) * 0.15,
      style: "fleshy",
      upperLen: 0.15,
      width: 0.05,
    }
  );

  // Basic walking legs (behind robe)
  drawPathLegs(ctx, x, y + size * 0.42, size, time, zoom, {
    color: "#312e81",
    colorDark: "#1e1b4b",
    footColor: "#0f0d24",
    legLen: 0.14,
    strideAmt: 0.3,
    strideSpeed: 4,
    style: "fleshy",
    width: 0.05,
  });

  // Shadowy robes with flowing tattered edges
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y - size * 0.3,
    x + size * 0.4,
    y + size * 0.3
  );
  robeGrad.addColorStop(0, "#1e1b4b");
  robeGrad.addColorStop(0.2, "#312e81");
  robeGrad.addColorStop(0.5, "#3730a3");
  robeGrad.addColorStop(0.8, "#312e81");
  robeGrad.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.48);
  // Tattered flowing bottom
  for (let i = 0; i <= 8; i++) {
    const jagX = x - size * 0.38 + i * size * 0.095;
    const jagY =
      y +
      size * 0.48 +
      Math.sin(time * 3.5 + i * 1.1) * size * 0.03 +
      (i % 2) * size * 0.04;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.45,
    y + size * 0.05,
    x + size * 0.18,
    y - size * 0.32 + bob * 0.3
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.32 + bob * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.45,
    y + size * 0.05,
    x - size * 0.38,
    y + size * 0.48
  );
  ctx.closePath();
  ctx.fill();

  // Robe surface texture - void veins
  ctx.strokeStyle = `rgba(99, 102, 241, ${runeGlow * 0.35})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let v = 0; v < 4; v++) {
    const veinX = x - size * 0.25 + v * size * 0.17;
    ctx.beginPath();
    ctx.moveTo(veinX, y - size * 0.2 + bob * 0.2);
    ctx.bezierCurveTo(
      veinX + Math.sin(time * 2 + v) * size * 0.05,
      y + size * 0.05,
      veinX - Math.cos(time * 2 + v) * size * 0.04,
      y + size * 0.2,
      veinX + Math.sin(v) * size * 0.06,
      y + size * 0.4
    );
    ctx.stroke();
  }

  // Arcane rune sigils on robe
  ctx.strokeStyle = `rgba(129, 140, 248, ${runeGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  const runePositions = [
    { rx: -0.12, ry: 0.05 },
    { rx: 0.12, ry: 0.1 },
    { rx: -0.05, ry: 0.25 },
    { rx: 0.08, ry: 0.32 },
  ];
  for (let r = 0; r < runePositions.length; r++) {
    const rp = runePositions[r];
    const runeX = x + rp.rx * size;
    const runeY = y + rp.ry * size + bob * 0.15;
    const runeSize = size * 0.035;
    ctx.beginPath();
    ctx.arc(runeX, runeY, runeSize, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(runeX - runeSize * 0.7, runeY);
    ctx.lineTo(runeX + runeSize * 0.7, runeY);
    ctx.moveTo(runeX, runeY - runeSize * 0.7);
    ctx.lineTo(runeX, runeY + runeSize * 0.7);
    ctx.stroke();
  }

  // Front center seam with arcane glow
  ctx.strokeStyle = `rgba(99, 102, 241, ${voidPulse * 0.6})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.25 + bob * 0.3);
  ctx.lineTo(x, y + size * 0.4);
  ctx.stroke();

  // Deep hood with inner shadow
  const hoodGrad = ctx.createRadialGradient(
    x,
    y - size * 0.38 + bob * 0.3,
    size * 0.05,
    x,
    y - size * 0.38 + bob * 0.3,
    size * 0.25
  );
  hoodGrad.addColorStop(0, "#0f0d24");
  hoodGrad.addColorStop(0.5, "#1e1b4b");
  hoodGrad.addColorStop(1, "#312e81");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.35 + bob * 0.3,
    size * 0.22,
    size * 0.15,
    0,
    Math.PI,
    0
  );
  ctx.fill();
  // Hood sides draping down
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.28,
    y - size * 0.12,
    x - size * 0.2,
    y + size * 0.02
  );
  ctx.lineTo(x - size * 0.14, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y - size * 0.22,
    x - size * 0.16,
    y - size * 0.32 + bob * 0.3
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y - size * 0.12,
    x + size * 0.2,
    y + size * 0.02
  );
  ctx.lineTo(x + size * 0.14, y - size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y - size * 0.22,
    x + size * 0.16,
    y - size * 0.32 + bob * 0.3
  );
  ctx.fill();

  // Hood peak
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.48 + bob * 0.3);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.58 + bob * 0.3,
    x + size * 0.15,
    y - size * 0.48 + bob * 0.3
  );
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y - size * 0.38,
    x + size * 0.22,
    y - size * 0.35 + bob * 0.3
  );
  ctx.lineTo(x - size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.22,
    y - size * 0.38,
    x - size * 0.15,
    y - size * 0.48 + bob * 0.3
  );
  ctx.fill();

  // Spectral face emerging from hood shadow
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.03,
    y - size * 0.42 + bob,
    size * 0.02,
    x,
    y - size * 0.4 + bob,
    size * 0.16
  );
  faceGrad.addColorStop(0, "#e0e7ff");
  faceGrad.addColorStop(0.5, "#c7d2fe");
  faceGrad.addColorStop(0.8, "#a5b4fc");
  faceGrad.addColorStop(1, "#6366f1");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + bob, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Spectral face markings
  ctx.strokeStyle = `rgba(99, 102, 241, ${runeGlow * 0.5})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52 + bob);
  ctx.lineTo(x, y - size * 0.46 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.35 + bob);
  ctx.lineTo(x - size * 0.12, y - size * 0.3 + bob);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.35 + bob);
  ctx.lineTo(x + size * 0.12, y - size * 0.3 + bob);
  ctx.stroke();

  // Hollow glowing eyes with void depth
  ctx.fillStyle = "#0f0d24";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.42 + bob,
    size * 0.04,
    size * 0.035,
    -0.1,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.42 + bob,
    size * 0.04,
    size * 0.035,
    0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Inner eye glow
  setShadowBlur(ctx, 6 * zoom, "#6366f1");
  ctx.fillStyle = `rgba(99, 102, 241, ${eyeFlicker})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.42 + bob, size * 0.022, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.42 + bob, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(199, 210, 254, ${eyeFlicker * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.42 + bob, size * 0.008, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.42 + bob, size * 0.008, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Spectral mouth - thin ethereal line
  ctx.strokeStyle = `rgba(67, 56, 202, ${0.5 + Math.sin(time * 6) * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.33 + bob);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.31 + bob,
    x + size * 0.04,
    y - size * 0.33 + bob
  );
  ctx.stroke();

  // Skeletal hands emerging from sleeves with void energy
  for (const side of [-1, 1]) {
    const handX = x + side * size * 0.32;
    const handY = y + size * 0.08 + bob * 0.4;
    const handSway = Math.sin(time * 2.5 + side) * size * 0.02;

    // Sleeve opening
    ctx.fillStyle = "#1e1b4b";
    ctx.beginPath();
    ctx.ellipse(
      handX + handSway,
      handY - size * 0.05,
      size * 0.08,
      size * 0.06,
      side * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Pale bony hand
    ctx.fillStyle = "#c7d2fe";
    ctx.beginPath();
    ctx.ellipse(
      handX + handSway,
      handY,
      size * 0.05,
      size * 0.04,
      side * 0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Fingers
    ctx.strokeStyle = "#a5b4fc";
    ctx.lineWidth = 2 * zoom;
    for (let f = 0; f < 3; f++) {
      const fingerAngle =
        side * (0.3 + f * 0.25) + Math.sin(time * 3 + f) * 0.1;
      ctx.beginPath();
      ctx.moveTo(
        handX + handSway + Math.cos(fingerAngle) * size * 0.04,
        handY + Math.sin(fingerAngle) * size * 0.03
      );
      ctx.lineTo(
        handX + handSway + Math.cos(fingerAngle) * size * 0.09,
        handY + Math.sin(fingerAngle) * size * 0.06
      );
      ctx.stroke();
    }

    // Void energy between hands
    if (side === 1) {
      const orbX = x;
      const orbY = y + size * 0.08 + bob * 0.4;
      const orbPulse = 0.6 + Math.sin(time * 4) * 0.4;
      const orbGrad = ctx.createRadialGradient(
        orbX,
        orbY,
        0,
        orbX,
        orbY,
        size * 0.1
      );
      orbGrad.addColorStop(0, `rgba(165, 180, 252, ${orbPulse})`);
      orbGrad.addColorStop(0.4, `rgba(99, 102, 241, ${orbPulse * 0.7})`);
      orbGrad.addColorStop(1, "rgba(55, 48, 163, 0)");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
      // Orb core
      ctx.fillStyle = `rgba(224, 231, 255, ${orbPulse * 0.9})`;
      ctx.beginPath();
      ctx.arc(orbX, orbY, size * 0.03, 0, Math.PI * 2);
      ctx.fill();
      // Mini lightning arcs in orb
      ctx.strokeStyle = `rgba(165, 180, 252, ${orbPulse * 0.7})`;
      ctx.lineWidth = 1 * zoom;
      for (let arc = 0; arc < 4; arc++) {
        const arcAngle = time * 5 + arc * Math.PI * 0.5;
        ctx.beginPath();
        ctx.moveTo(orbX, orbY);
        ctx.lineTo(
          orbX + Math.cos(arcAngle) * size * 0.07,
          orbY + Math.sin(arcAngle) * size * 0.07
        );
        ctx.stroke();
      }
    }
  }

  // Orbiting arcane symbols
  for (let s = 0; s < 4; s++) {
    const symAngle = time * 1.2 + s * Math.PI * 0.5;
    const symDist = size * 0.52 + Math.sin(time * 2 + s) * size * 0.06;
    const symX = x + Math.cos(symAngle) * symDist;
    const symY = y - size * 0.1 + Math.sin(symAngle) * symDist * 0.35;
    const symAlpha = 0.3 + Math.sin(time * 3 + s * 1.5) * 0.2;
    ctx.strokeStyle = `rgba(129, 140, 248, ${symAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.save();
    ctx.translate(symX, symY);
    ctx.rotate(time * 2 + s);
    const symR = size * 0.03;
    ctx.beginPath();
    ctx.moveTo(-symR, -symR);
    ctx.lineTo(symR, -symR);
    ctx.lineTo(symR, symR);
    ctx.lineTo(-symR, symR);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, symR * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Attack: void eruption with energy blast
  if (isAttacking) {
    // Expanding void ring
    const ringSize = attackIntensity * size * 0.8;
    const ringAlpha = (1 - attackIntensity) * 0.5;
    ctx.strokeStyle = `rgba(99, 102, 241, ${ringAlpha})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, ringSize, 0, Math.PI * 2);
    ctx.stroke();

    // Void bolts from hands
    ctx.strokeStyle = `rgba(165, 180, 252, ${attackIntensity * 0.7})`;
    ctx.lineWidth = 2.5 * zoom;
    for (let bolt = 0; bolt < 6; bolt++) {
      const boltAngle = (bolt / 6) * Math.PI * 2 + time * 4;
      const boltLen = size * (0.3 + attackIntensity * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.08);
      let bx = x + Math.cos(boltAngle) * boltLen * 0.3;
      let by = y + size * 0.08 + Math.sin(boltAngle) * boltLen * 0.3;
      ctx.lineTo(bx, by);
      bx += Math.cos(boltAngle + 0.3) * boltLen * 0.4;
      by += Math.sin(boltAngle + 0.3) * boltLen * 0.4;
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Central energy burst
    const burstGrad = ctx.createRadialGradient(
      x,
      y + size * 0.08,
      0,
      x,
      y + size * 0.08,
      size * attackIntensity * 0.5
    );
    burstGrad.addColorStop(0, `rgba(199, 210, 254, ${attackIntensity * 0.5})`);
    burstGrad.addColorStop(0.5, `rgba(99, 102, 241, ${attackIntensity * 0.3})`);
    burstGrad.addColorStop(1, "rgba(55, 48, 163, 0)");
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.08, size * attackIntensity * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Simple pulsing glow ring
  drawPulsingGlowRings(ctx, x, y - size * 0.1, size * 0.4, time, zoom, {
    color: "rgba(99, 102, 241, 0.4)",
    count: 2,
    expansion: 1.3,
    lineWidth: 1.5,
    maxAlpha: 0.3,
    speed: 1.5,
  });
}

// ============================================================================
// NEW ENEMY TYPES - Fantasy-style detailed sprites
// ============================================================================

export function drawTrusteeEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const bodyBob = Math.sin(time * 2.5) * size * 0.012;
  const goldPulse = 0.7 + Math.sin(time * 4) * 0.3;
  const corruptPulse = 0.6 + Math.sin(time * 5) * 0.3;

  const goldBright = "#fbbf24";
  const goldMid = "#d97706";
  const goldDark = "#92400e";
  const goldPale = "#fef3c7";
  const deepPurple = "#3b0764";
  const royalPurple = "#581c87";
  const darkNavy = "#0c0a20";
  const obsidian = "#0a0a14";

  // === HELLFIRE CORRUPTION AURA ===
  // Outer dark corruption ring
  const darkAura = ctx.createRadialGradient(
    x,
    y - size * 0.1,
    size * 0.4,
    x,
    y - size * 0.1,
    size * 1
  );
  darkAura.addColorStop(0, "rgba(0,0,0,0)");
  darkAura.addColorStop(0.5, `rgba(40,10,60,${goldPulse * 0.08})`);
  darkAura.addColorStop(0.75, `rgba(80,20,20,${goldPulse * 0.05})`);
  darkAura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = darkAura;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 1, size * 0.7 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Inner hellfire aura
  const auraGrad = ctx.createRadialGradient(
    x,
    y - size * 0.1,
    0,
    x,
    y - size * 0.1,
    size * 0.7
  );
  auraGrad.addColorStop(0, `rgba(255, 100, 30, ${goldPulse * 0.15})`);
  auraGrad.addColorStop(0.2, `rgba(251, 191, 36, ${goldPulse * 0.12})`);
  auraGrad.addColorStop(0.45, `rgba(180, 40, 80, ${goldPulse * 0.08})`);
  auraGrad.addColorStop(0.7, `rgba(80, 10, 60, ${goldPulse * 0.04})`);
  auraGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.1,
    size * 0.7,
    size * 0.5 * ISO_Y_RATIO,
    0,
    0,
    TAU
  );
  ctx.fill();

  // Ground hellfire cracks emanating from base
  setShadowBlur(ctx, 4 * zoom, "#ff4020");
  for (let c = 0; c < 8; c++) {
    const cAngle = (c * TAU) / 8 + Math.sin(time * 0.5 + c) * 0.15;
    const cLen = size * 0.3 + Math.sin(time * 1.8 + c * 1.7) * size * 0.08;
    const cAlpha = 0.12 + Math.sin(time * 2.5 + c * 0.9) * 0.06;
    ctx.strokeStyle = `rgba(255, 80, 20, ${cAlpha})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.1);
    for (let s = 1; s <= 4; s++) {
      const sf = s / 4;
      const jx = Math.sin(time * 1.5 + c * 2.3 + s * 1.7) * size * 0.015;
      ctx.lineTo(
        x + Math.cos(cAngle) * cLen * sf + jx,
        y + size * 0.1 + Math.sin(cAngle) * cLen * sf * ISO_Y_RATIO
      );
    }
    ctx.stroke();
  }
  clearShadow(ctx);

  // Slow-orbiting demonic sigils
  for (let i = 0; i < 8; i++) {
    const sAngle = time * 0.5 + (i * TAU) / 8;
    const sR = size * 0.55 + Math.sin(time * 1.5 + i * 1.3) * size * 0.06;
    const sx = x + Math.cos(sAngle) * sR;
    const sy = y - size * 0.12 + Math.sin(sAngle) * sR * 0.3;
    const sAlpha = 0.15 + Math.sin(time * 2.5 + i * 1.1) * 0.1;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(time * 1.2 + i);
    setShadowBlur(ctx, 6 * zoom, i % 2 === 0 ? "#ff4020" : goldBright);
    ctx.strokeStyle =
      i % 2 === 0
        ? `rgba(255, 80, 30, ${sAlpha})`
        : `rgba(251, 191, 36, ${sAlpha})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.02);
    ctx.lineTo(size * 0.015, 0);
    ctx.lineTo(0, size * 0.02);
    ctx.lineTo(-size * 0.015, 0);
    ctx.closePath();
    ctx.stroke();
    clearShadow(ctx);
    ctx.restore();
  }

  // === GRAND ERMINE CORONATION MANTLE (behind body) ===
  const mantleGrad = ctx.createLinearGradient(
    x,
    y - size * 0.4,
    x,
    y + size * 0.32
  );
  mantleGrad.addColorStop(0, "#2d1050");
  mantleGrad.addColorStop(0.2, deepPurple);
  mantleGrad.addColorStop(0.5, royalPurple);
  mantleGrad.addColorStop(0.75, deepPurple);
  mantleGrad.addColorStop(1, "#1a0a2e");
  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.38 - bodyBob);
  ctx.bezierCurveTo(
    x - size * 0.42,
    y - size * 0.08,
    x - size * 0.44,
    y + size * 0.1,
    x - size * 0.34,
    y + size * 0.28
  );
  for (let t = 0; t < 10; t++) {
    const tx = x - size * 0.34 + t * size * 0.068;
    const billow = Math.sin(time * 1.8 + t * 0.8) * size * 0.015;
    const dip = t % 2 === 0 ? size * 0.025 : 0;
    ctx.lineTo(tx, y + size * 0.3 + billow + dip);
  }
  ctx.bezierCurveTo(
    x + size * 0.44,
    y + size * 0.1,
    x + size * 0.42,
    y - size * 0.08,
    x + size * 0.2,
    y - size * 0.38 - bodyBob
  );
  ctx.closePath();
  ctx.fill();

  // Ermine lining band at mantle bottom
  ctx.fillStyle = "#f5f0e8";
  ctx.beginPath();
  for (let t = 0; t < 10; t++) {
    const tx = x - size * 0.34 + t * size * 0.068;
    const billow = Math.sin(time * 1.8 + t * 0.8) * size * 0.015;
    const dip = t % 2 === 0 ? size * 0.025 : 0;
    if (t === 0) {
      ctx.moveTo(tx, y + size * 0.28 + billow + dip);
    } else {
      ctx.lineTo(tx, y + size * 0.28 + billow + dip);
    }
  }
  for (let t = 9; t >= 0; t--) {
    const tx = x - size * 0.34 + t * size * 0.068;
    const billow = Math.sin(time * 1.8 + t * 0.8) * size * 0.015;
    const dip = t % 2 === 0 ? size * 0.025 : 0;
    ctx.lineTo(tx, y + size * 0.3 + billow + dip + size * 0.025);
  }
  ctx.closePath();
  ctx.fill();
  // Ermine spots
  ctx.fillStyle = "#1a0a0a";
  for (let d = 0; d < 14; d++) {
    const dx = x - size * 0.32 + d * size * 0.048;
    const dy = y + size * 0.3 + Math.sin(time * 1.8 + d * 0.55) * size * 0.008;
    ctx.beginPath();
    ctx.arc(dx, dy + size * 0.015, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // Mantle gold border trim
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.5 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.2, y - size * 0.38 - bodyBob);
    ctx.bezierCurveTo(
      x + side * size * 0.42,
      y - size * 0.08,
      x + side * size * 0.44,
      y + size * 0.1,
      x + side * size * 0.34,
      y + size * 0.28
    );
    ctx.stroke();
  }

  // Mantle inner fold highlights
  ctx.strokeStyle = `rgba(130, 60, 200, 0.2)`;
  ctx.lineWidth = 0.8 * zoom;
  for (let f = 0; f < 3; f++) {
    const fOff = (f - 1) * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x + fOff, y - size * 0.12 - bodyBob);
    ctx.quadraticCurveTo(
      x + fOff + Math.sin(time * 1.5 + f) * size * 0.015,
      y + size * 0.06,
      x + fOff,
      y + size * 0.22
    );
    ctx.stroke();
  }

  // === DEVIL WINGS — massive tattered bat wings ===
  for (const side of [-1, 1]) {
    ctx.save();
    const wingX = x + side * size * 0.18;
    const wingY = y - size * 0.3 - bodyBob;
    ctx.translate(wingX, wingY);

    const wingFlap =
      Math.sin(time * 2.5 + (side === 1 ? 0 : Math.PI * 0.3)) * 0.12;
    const wingSpread = isAttacking ? 1.15 : 1;
    ctx.scale(side, 1);
    ctx.rotate(wingFlap);

    // Wing membrane — dark purple-black with veins
    const memGrad = ctx.createLinearGradient(
      0,
      0,
      size * 0.55 * wingSpread,
      -size * 0.2
    );
    memGrad.addColorStop(0, "rgba(30,10,50,0.9)");
    memGrad.addColorStop(0.3, "rgba(50,15,80,0.85)");
    memGrad.addColorStop(0.6, "rgba(25,8,40,0.75)");
    memGrad.addColorStop(1, "rgba(15,5,25,0.5)");
    ctx.fillStyle = memGrad;

    // 4-finger bat wing silhouette
    ctx.beginPath();
    ctx.moveTo(0, 0);
    // First bone
    ctx.quadraticCurveTo(
      size * 0.12,
      -size * 0.25,
      size * 0.2 * wingSpread,
      -size * 0.42
    );
    // Scallop between 1st and 2nd finger
    ctx.quadraticCurveTo(
      size * 0.25 * wingSpread,
      -size * 0.3,
      size * 0.32 * wingSpread,
      -size * 0.38
    );
    // Second finger
    ctx.quadraticCurveTo(
      size * 0.36 * wingSpread,
      -size * 0.28,
      size * 0.42 * wingSpread,
      -size * 0.32
    );
    // Scallop between 2nd and 3rd
    ctx.quadraticCurveTo(
      size * 0.44 * wingSpread,
      -size * 0.2,
      size * 0.5 * wingSpread,
      -size * 0.22
    );
    // Third finger
    ctx.quadraticCurveTo(
      size * 0.52 * wingSpread,
      -size * 0.12,
      size * 0.55 * wingSpread,
      -size * 0.08
    );
    // Trailing edge back to body
    ctx.quadraticCurveTo(size * 0.42, size * 0.06, size * 0.2, size * 0.12);
    ctx.quadraticCurveTo(size * 0.08, size * 0.1, 0, size * 0.05);
    ctx.closePath();
    ctx.fill();

    // Wing bone struts
    ctx.strokeStyle = "#2a1040";
    ctx.lineWidth = 2.5 * zoom;
    ctx.lineCap = "round";
    const boneEnds = [
      {
        cx: size * 0.12,
        cy: -size * 0.25,
        ex: size * 0.2 * wingSpread,
        ey: -size * 0.42,
      },
      {
        cx: size * 0.2,
        cy: -size * 0.18,
        ex: size * 0.32 * wingSpread,
        ey: -size * 0.38,
      },
      {
        cx: size * 0.25,
        cy: -size * 0.12,
        ex: size * 0.42 * wingSpread,
        ey: -size * 0.32,
      },
      {
        cx: size * 0.3,
        cy: -size * 0.06,
        ex: size * 0.55 * wingSpread,
        ey: -size * 0.08,
      },
    ];
    for (const b of boneEnds) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(b.cx, b.cy, b.ex, b.ey);
      ctx.stroke();
    }
    ctx.lineCap = "butt";

    // Bone highlight
    ctx.strokeStyle = "rgba(100,60,140,0.3)";
    ctx.lineWidth = 1 * zoom;
    for (const b of boneEnds) {
      ctx.beginPath();
      ctx.moveTo(size * 0.02, -size * 0.01);
      ctx.quadraticCurveTo(b.cx * 0.95, b.cy * 0.95, b.ex * 0.95, b.ey * 0.95);
      ctx.stroke();
    }

    // Vein network in membrane
    ctx.strokeStyle = "rgba(80,30,120,0.2)";
    ctx.lineWidth = 0.6 * zoom;
    for (let v = 0; v < 6; v++) {
      const t = 0.2 + v * 0.12;
      const vx1 = size * 0.08 + v * size * 0.06;
      const vy1 = -size * 0.05 - v * size * 0.04;
      const vx2 = vx1 + size * 0.08;
      const vy2 = vy1 - size * 0.06 + Math.sin(time * 1.5 + v) * size * 0.01;
      ctx.beginPath();
      ctx.moveTo(vx1, vy1);
      ctx.quadraticCurveTo(vx1 + size * 0.04, vy1 - size * 0.04, vx2, vy2);
      ctx.stroke();
    }

    // Tattered holes in membrane (corruption damage)
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    for (let h = 0; h < 3; h++) {
      const hx = size * 0.15 + h * size * 0.12;
      const hy = -size * 0.12 - h * size * 0.05;
      ctx.beginPath();
      ctx.ellipse(
        hx,
        hy,
        size * 0.012 + h * size * 0.004,
        size * 0.008,
        h * 0.5,
        0,
        TAU
      );
      ctx.fill();
    }

    // Wing claw hooks at finger tips
    ctx.fillStyle = goldDark;
    const clawTips = [
      { x: size * 0.2 * wingSpread, y: -size * 0.42 },
      { x: size * 0.32 * wingSpread, y: -size * 0.38 },
      { x: size * 0.42 * wingSpread, y: -size * 0.32 },
    ];
    for (const ct of clawTips) {
      ctx.beginPath();
      ctx.moveTo(ct.x, ct.y);
      ctx.lineTo(ct.x + size * 0.012, ct.y - size * 0.02);
      ctx.lineTo(ct.x + size * 0.004, ct.y + size * 0.005);
      ctx.closePath();
      ctx.fill();
    }

    // Purple-gold energy pulsing along wing edges
    const edgeAlpha = 0.15 + Math.sin(time * 3 + (side === 1 ? 0 : 1.5)) * 0.1;
    setShadowBlur(ctx, 4 * zoom, `rgba(180,80,255,${edgeAlpha})`);
    ctx.strokeStyle = `rgba(200,120,255,${edgeAlpha})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.2 * wingSpread, -size * 0.42);
    ctx.quadraticCurveTo(
      size * 0.25 * wingSpread,
      -size * 0.3,
      size * 0.32 * wingSpread,
      -size * 0.38
    );
    ctx.quadraticCurveTo(
      size * 0.36 * wingSpread,
      -size * 0.28,
      size * 0.42 * wingSpread,
      -size * 0.32
    );
    ctx.quadraticCurveTo(
      size * 0.44 * wingSpread,
      -size * 0.2,
      size * 0.5 * wingSpread,
      -size * 0.22
    );
    ctx.stroke();
    clearShadow(ctx);

    ctx.restore();
  }

  // === LEGS — heavy gilded war greaves ===
  drawPathLegs(ctx, x, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: "#2a2040",
    colorDark: "#1a1030",
    footColor: goldDark,
    legLen: 0.28,
    strideAmt: 0.18,
    strideSpeed: 2,
    style: "armored",
    width: 0.075,
  });

  // === TORSO — heavy ornate plate armor ===
  const torsoTop = y - size * 0.42 - bodyBob;
  const torsoBot = y + size * 0.06 - bodyBob;

  // Base dark plate
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.22,
    torsoTop,
    x + size * 0.22,
    torsoBot
  );
  plateGrad.addColorStop(0, "#1a1030");
  plateGrad.addColorStop(0.15, "#2a2048");
  plateGrad.addColorStop(0.4, "#3a2860");
  plateGrad.addColorStop(0.6, "#2a2048");
  plateGrad.addColorStop(0.85, "#1a1030");
  plateGrad.addColorStop(1, "#0e0820");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, torsoTop);
  ctx.quadraticCurveTo(
    x - size * 0.27,
    y - size * 0.12 - bodyBob,
    x - size * 0.2,
    torsoBot
  );
  ctx.lineTo(x + size * 0.2, torsoBot);
  ctx.quadraticCurveTo(
    x + size * 0.27,
    y - size * 0.12 - bodyBob,
    x + size * 0.22,
    torsoTop
  );
  ctx.closePath();
  ctx.fill();

  // Gold trim edges on breastplate
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, torsoTop);
  ctx.quadraticCurveTo(
    x - size * 0.27,
    y - size * 0.12 - bodyBob,
    x - size * 0.2,
    torsoBot
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, torsoTop);
  ctx.quadraticCurveTo(
    x + size * 0.27,
    y - size * 0.12 - bodyBob,
    x + size * 0.2,
    torsoBot
  );
  ctx.stroke();

  // Raised center plate with Princeton shield
  const cpGrad = ctx.createRadialGradient(
    x,
    y - size * 0.2 - bodyBob,
    0,
    x,
    y - size * 0.2 - bodyBob,
    size * 0.15
  );
  cpGrad.addColorStop(0, "#3a2860");
  cpGrad.addColorStop(0.6, "#2a1848");
  cpGrad.addColorStop(1, "#1a1030");
  ctx.fillStyle = cpGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, torsoTop + size * 0.04);
  ctx.lineTo(x + size * 0.1, torsoTop + size * 0.04);
  ctx.lineTo(x + size * 0.08, torsoBot - size * 0.02);
  ctx.quadraticCurveTo(
    x,
    torsoBot + size * 0.02,
    x - size * 0.08,
    torsoBot - size * 0.02
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = goldMid;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Shield emblem on breastplate
  const embY = y - size * 0.2 - bodyBob;
  ctx.fillStyle = darkNavy;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, embY - size * 0.05);
  ctx.lineTo(x + size * 0.04, embY - size * 0.05);
  ctx.lineTo(x + size * 0.04, embY + size * 0.015);
  ctx.quadraticCurveTo(
    x,
    embY + size * 0.055,
    x - size * 0.04,
    embY + size * 0.015
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Chevron on breastplate shield
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.025, embY - size * 0.015);
  ctx.lineTo(x, embY + size * 0.02);
  ctx.lineTo(x + size * 0.025, embY - size * 0.015);
  ctx.stroke();

  // Gold filigree scrollwork on armor panels
  ctx.strokeStyle = `rgba(251, 191, 36, ${0.25 + corruptPulse * 0.15})`;
  ctx.lineWidth = 0.7 * zoom;
  for (const side of [-1, 1]) {
    for (let s = 0; s < 3; s++) {
      const sx = x + side * size * (0.12 + s * 0.03);
      const sy = torsoTop + size * 0.08 + s * size * 0.1;
      ctx.beginPath();
      ctx.arc(
        sx,
        sy,
        size * 0.015,
        side > 0 ? 0 : Math.PI,
        side > 0 ? Math.PI : TAU
      );
      ctx.stroke();
    }
  }

  // Rivets along breastplate edges
  ctx.fillStyle = goldMid;
  for (const side of [-1, 1]) {
    for (let r = 0; r < 5; r++) {
      const rY = torsoTop + size * 0.06 + r * size * 0.07;
      const rX = x + side * size * 0.19;
      ctx.beginPath();
      ctx.arc(rX, rY, size * 0.005, 0, TAU);
      ctx.fill();
    }
  }

  // === ARMORED SKIRT / FAULD ===
  const skirtY = torsoBot;
  for (let p = 0; p < 5; p++) {
    const pX = x - size * 0.16 + p * size * 0.08;
    const pW = size * 0.065;
    const pH = size * 0.1 + Math.sin(time * 2 + p * 0.8) * size * 0.01;
    const pGrad = ctx.createLinearGradient(pX, skirtY, pX, skirtY + pH);
    pGrad.addColorStop(0, "#2a2048");
    pGrad.addColorStop(0.5, "#1a1030");
    pGrad.addColorStop(1, "#0e0820");
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.moveTo(pX - pW * 0.5, skirtY);
    ctx.lineTo(pX + pW * 0.5, skirtY);
    ctx.lineTo(pX + pW * 0.4, skirtY + pH);
    ctx.quadraticCurveTo(
      pX,
      skirtY + pH + size * 0.01,
      pX - pW * 0.4,
      skirtY + pH
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = goldMid;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
  }

  // === ORNATE WAR BELT ===
  const beltY = torsoBot - size * 0.015;
  ctx.fillStyle = "#2a1808";
  ctx.fillRect(x - size * 0.21, beltY, size * 0.42, size * 0.035);
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(x - size * 0.21, beltY, size * 0.42, size * 0.035);

  // Belt skull buckle
  const buckCX = x;
  const buckCY = beltY + size * 0.0175;
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.arc(buckCX, buckCY, size * 0.02, 0, TAU);
  ctx.fill();
  ctx.fillStyle = darkNavy;
  ctx.beginPath();
  ctx.arc(buckCX, buckCY - size * 0.003, size * 0.012, 0, TAU);
  ctx.fill();
  // Tiny skull face
  ctx.fillStyle = goldPale;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      buckCX + side * size * 0.004,
      buckCY - size * 0.005,
      size * 0.003,
      0,
      TAU
    );
    ctx.fill();
  }
  ctx.fillStyle = goldPale;
  ctx.beginPath();
  ctx.moveTo(buckCX - size * 0.003, buckCY + size * 0.003);
  ctx.lineTo(buckCX + size * 0.003, buckCY + size * 0.003);
  ctx.lineTo(buckCX + size * 0.002, buckCY + size * 0.006);
  ctx.lineTo(buckCX - size * 0.002, buckCY + size * 0.006);
  ctx.fill();

  // Belt gem studs
  for (let g = 0; g < 4; g++) {
    for (const side of [-1, 1]) {
      const gx = x + side * (size * 0.05 + g * size * 0.04);
      ctx.fillStyle = g % 2 === 0 ? "#7c3aed" : "#dc2626";
      ctx.beginPath();
      ctx.arc(gx, buckCY, size * 0.006, 0, TAU);
      ctx.fill();
    }
  }

  // === GOLD GORGET (high collar armor) ===
  const gorgetGrad = ctx.createLinearGradient(
    x - size * 0.24,
    torsoTop - size * 0.04,
    x + size * 0.24,
    torsoTop + size * 0.06
  );
  gorgetGrad.addColorStop(0, goldDark);
  gorgetGrad.addColorStop(0.2, goldMid);
  gorgetGrad.addColorStop(0.5, goldBright);
  gorgetGrad.addColorStop(0.8, goldMid);
  gorgetGrad.addColorStop(1, goldDark);
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, torsoTop - size * 0.02);
  ctx.quadraticCurveTo(
    x - size * 0.18,
    torsoTop - size * 0.08,
    x - size * 0.08,
    torsoTop - size * 0.06
  );
  ctx.quadraticCurveTo(
    x,
    torsoTop + size * 0.02,
    x + size * 0.08,
    torsoTop - size * 0.06
  );
  ctx.quadraticCurveTo(
    x + size * 0.18,
    torsoTop - size * 0.08,
    x + size * 0.24,
    torsoTop - size * 0.02
  );
  ctx.lineTo(x + size * 0.22, torsoTop + size * 0.03);
  ctx.quadraticCurveTo(
    x,
    torsoTop + size * 0.1,
    x - size * 0.22,
    torsoTop + size * 0.03
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = goldDark;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();

  // Gorget gem studs
  for (const side of [-1, 1]) {
    ctx.fillStyle = "#dc2626";
    setShadowBlur(ctx, 3 * zoom, "#dc2626");
    ctx.beginPath();
    ctx.arc(
      x + side * size * 0.14,
      torsoTop - size * 0.03,
      size * 0.01,
      0,
      TAU
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // === ARMS ===
  const armShY = y - size * 0.36 - bodyBob;

  // Left arm — massive demonic tower shield
  drawPathArm(ctx, x - size * 0.26, armShY, size, time, zoom, -1, {
    color: "#2a2048",
    colorDark: "#1a1030",
    elbowAngle:
      -0.2 +
      Math.sin(time * 1.8 + 0.5) * 0.05 +
      (isAttacking ? -attackIntensity * 0.15 : 0),
    foreLen: 0.14,
    handColor: "#5a4878",
    onWeapon: (wCtx) => {
      wCtx.translate(0, size * 0.02);
      wCtx.scale(-1, 1);
      const shW = size * 0.18;
      const shH = size * 0.28;

      // Shield body — dark obsidian tower shield
      const shGrad = wCtx.createLinearGradient(
        -shW,
        -shH * 0.5,
        shW,
        shH * 0.5
      );
      shGrad.addColorStop(0, "#0a0014");
      shGrad.addColorStop(0.2, "#1a1030");
      shGrad.addColorStop(0.4, "#2a1848");
      shGrad.addColorStop(0.6, "#1a1030");
      shGrad.addColorStop(0.8, "#0a0014");
      shGrad.addColorStop(1, "#050008");
      wCtx.fillStyle = shGrad;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH);
      wCtx.quadraticCurveTo(shW * 0.6, -shH * 0.85, shW, -shH * 0.3);
      wCtx.quadraticCurveTo(shW * 0.95, shH * 0.3, 0, shH);
      wCtx.quadraticCurveTo(-shW * 0.95, shH * 0.3, -shW, -shH * 0.3);
      wCtx.quadraticCurveTo(-shW * 0.6, -shH * 0.85, 0, -shH);
      wCtx.closePath();
      wCtx.fill();

      // Gold-and-corruption rim
      wCtx.strokeStyle = goldBright;
      wCtx.lineWidth = 2 * zoom;
      wCtx.stroke();

      // Inner corruption line rim
      wCtx.strokeStyle = `rgba(180,60,255,${0.3 + corruptPulse * 0.15})`;
      wCtx.lineWidth = 0.8 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH * 0.92);
      wCtx.quadraticCurveTo(shW * 0.5, -shH * 0.78, shW * 0.9, -shH * 0.25);
      wCtx.quadraticCurveTo(shW * 0.85, shH * 0.25, 0, shH * 0.92);
      wCtx.quadraticCurveTo(-shW * 0.85, shH * 0.25, -shW * 0.9, -shH * 0.25);
      wCtx.quadraticCurveTo(-shW * 0.5, -shH * 0.78, 0, -shH * 0.92);
      wCtx.stroke();

      // Demonic face on shield — large skull/demon visage
      // Brow ridge
      wCtx.strokeStyle = goldDark;
      wCtx.lineWidth = 2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(-shW * 0.5, -shH * 0.15);
      wCtx.quadraticCurveTo(-shW * 0.3, -shH * 0.3, 0, -shH * 0.25);
      wCtx.quadraticCurveTo(shW * 0.3, -shH * 0.3, shW * 0.5, -shH * 0.15);
      wCtx.stroke();

      // Eye sockets
      for (const es of [-1, 1]) {
        wCtx.fillStyle = "#050010";
        wCtx.beginPath();
        wCtx.ellipse(
          es * shW * 0.22,
          -shH * 0.12,
          shW * 0.12,
          shH * 0.07,
          es * 0.15,
          0,
          TAU
        );
        wCtx.fill();

        // Burning eye within
        const seAlpha = 0.5 + corruptPulse * 0.3;
        setShadowBlur(wCtx, 6 * zoom, `rgba(255,80,30,${seAlpha})`);
        const seGrad = wCtx.createRadialGradient(
          es * shW * 0.22,
          -shH * 0.12,
          0,
          es * shW * 0.22,
          -shH * 0.12,
          shW * 0.08
        );
        seGrad.addColorStop(0, `rgba(255,220,100,${seAlpha})`);
        seGrad.addColorStop(0.4, `rgba(255,80,20,${seAlpha * 0.8})`);
        seGrad.addColorStop(1, `rgba(100,10,0,0)`);
        wCtx.fillStyle = seGrad;
        wCtx.beginPath();
        wCtx.ellipse(
          es * shW * 0.22,
          -shH * 0.12,
          shW * 0.08,
          shH * 0.05,
          0,
          0,
          TAU
        );
        wCtx.fill();
        clearShadow(wCtx);
      }

      // Nasal bone / nose cavity
      wCtx.fillStyle = "#0a0014";
      wCtx.beginPath();
      wCtx.moveTo(0, -shH * 0.04);
      wCtx.lineTo(shW * 0.04, shH * 0.06);
      wCtx.lineTo(-shW * 0.04, shH * 0.06);
      wCtx.closePath();
      wCtx.fill();

      // Fanged jaw
      wCtx.fillStyle = "#050010";
      wCtx.beginPath();
      wCtx.ellipse(0, shH * 0.16, shW * 0.3, shH * 0.08, 0, 0, TAU);
      wCtx.fill();
      // Teeth
      wCtx.fillStyle = goldPale;
      for (let t = 0; t < 7; t++) {
        const tx = -shW * 0.2 + t * shW * 0.067;
        const tH =
          t === 0 || t === 6
            ? shH * 0.04
            : t === 2 || t === 4
              ? shH * 0.06
              : shH * 0.035;
        wCtx.beginPath();
        wCtx.moveTo(tx - shW * 0.015, shH * 0.1);
        wCtx.lineTo(tx, shH * 0.1 + tH);
        wCtx.lineTo(tx + shW * 0.015, shH * 0.1);
        wCtx.fill();
      }

      // Corruption veins across shield face
      wCtx.strokeStyle = `rgba(120,40,200,${0.2 + corruptPulse * 0.1})`;
      wCtx.lineWidth = 0.6 * zoom;
      for (let v = 0; v < 5; v++) {
        const va = -1.5 + v * 0.75;
        wCtx.beginPath();
        wCtx.moveTo(Math.cos(va) * shW * 0.2, Math.sin(va) * shH * 0.15);
        wCtx.quadraticCurveTo(
          Math.cos(va + 0.3) * shW * 0.5,
          Math.sin(va + 0.3) * shH * 0.4,
          Math.cos(va + 0.6) * shW * 0.7,
          Math.sin(va + 0.6) * shH * 0.55
        );
        wCtx.stroke();
      }

      // Spikes at shield edges
      wCtx.fillStyle = goldBright;
      const spikePositions = [
        { a: -Math.PI / 2, x: 0, y: -shH },
        { a: 0.2, x: shW * 0.85, y: -shH * 0.1 },
        { a: Math.PI - 0.2, x: -shW * 0.85, y: -shH * 0.1 },
        { a: Math.PI / 2, x: 0, y: shH * 0.9 },
      ];
      for (const sp of spikePositions) {
        wCtx.save();
        wCtx.translate(sp.x, sp.y);
        wCtx.rotate(sp.a);
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.006);
        wCtx.lineTo(size * 0.025, 0);
        wCtx.lineTo(0, size * 0.006);
        wCtx.closePath();
        wCtx.fill();
        wCtx.restore();
      }

      // Gold skull-and-chain studs at cardinals
      wCtx.fillStyle = goldMid;
      for (const rv of spikePositions) {
        wCtx.beginPath();
        wCtx.arc(rv.x * 0.65, rv.y * 0.65, size * 0.008, 0, TAU);
        wCtx.fill();
      }
    },
    shoulderAngle:
      -0.7 +
      Math.sin(time * 1.3) * 0.04 +
      (isAttacking ? -attackIntensity * 0.2 : 0),
    style: "armored",
    upperLen: 0.17,
    width: 0.065,
  });

  // Right arm — massive hellfire war-axe
  drawPathArm(ctx, x + size * 0.26, armShY, size, time, zoom, 1, {
    color: "#2a2048",
    colorDark: "#1a1030",
    elbowAngle:
      -0.35 +
      Math.sin(time * 1.8 + 2) * 0.03 +
      (isAttacking ? -attackIntensity * 0.4 : 0),
    foreLen: 0.14,
    handColor: "#5a4878",
    onWeapon: (wCtx) => {
      const sH = size * 0.6;
      const sW = size * 0.018;

      // Haft — dark iron with obsidian inlays
      const haftGrad = wCtx.createLinearGradient(-sW, 0, sW, 0);
      haftGrad.addColorStop(0, "#1a0a18");
      haftGrad.addColorStop(0.3, "#3a2040");
      haftGrad.addColorStop(0.5, "#4a2858");
      haftGrad.addColorStop(0.7, "#3a2040");
      haftGrad.addColorStop(1, "#1a0a18");
      wCtx.fillStyle = haftGrad;
      wCtx.fillRect(-sW, -sH * 0.4, sW * 2, sH);

      // Leather grip wrapping
      wCtx.fillStyle = "#2a1008";
      wCtx.fillRect(-sW * 1.4, -size * 0.02, sW * 2.8, size * 0.12);
      wCtx.strokeStyle = goldDark;
      wCtx.lineWidth = 0.6 * zoom;
      for (let w = 0; w < 8; w++) {
        const wy = -size * 0.015 + w * size * 0.015;
        wCtx.beginPath();
        wCtx.moveTo(-sW * 1.3, wy);
        wCtx.lineTo(sW * 1.3, wy - size * 0.006);
        wCtx.stroke();
      }

      // Gold ring separators along haft
      wCtx.fillStyle = goldBright;
      for (let r = 0; r < 4; r++) {
        const ry = -sH * 0.08 - r * sH * 0.12;
        wCtx.beginPath();
        wCtx.ellipse(0, ry, sW * 2, size * 0.005, 0, 0, TAU);
        wCtx.fill();
      }

      // Rune carvings on haft
      wCtx.strokeStyle = `rgba(180,80,255,${0.3 + corruptPulse * 0.2})`;
      wCtx.lineWidth = 0.5 * zoom;
      for (let r = 0; r < 3; r++) {
        const ry = -sH * 0.15 - r * sH * 0.1;
        wCtx.beginPath();
        wCtx.moveTo(-sW * 0.5, ry - size * 0.006);
        wCtx.lineTo(sW * 0.5, ry + size * 0.003);
        wCtx.moveTo(0, ry - size * 0.008);
        wCtx.lineTo(0, ry + size * 0.005);
        wCtx.stroke();
      }

      // === AXE HEAD — jagged double-bladed hellfire greataxe ===
      const axY = -sH * 0.4;
      const bladeW = size * 0.12;
      const bladeH = size * 0.16;

      for (const bSide of [-1, 1]) {
        // Blade body — curved, jagged-edged
        const blGrad = wCtx.createLinearGradient(
          0,
          axY - bladeH * 0.5,
          bSide * bladeW,
          axY
        );
        blGrad.addColorStop(0, "#1a0a18");
        blGrad.addColorStop(0.3, "#3a1848");
        blGrad.addColorStop(0.6, "#5a2870");
        blGrad.addColorStop(0.85, "#2a1040");
        blGrad.addColorStop(1, "#0a0010");
        wCtx.fillStyle = blGrad;
        wCtx.beginPath();
        wCtx.moveTo(0, axY - bladeH * 0.5);
        wCtx.quadraticCurveTo(
          bSide * bladeW * 0.3,
          axY - bladeH * 0.55,
          bSide * bladeW * 0.7,
          axY - bladeH * 0.35
        );
        // Jagged cutting edge
        wCtx.lineTo(bSide * bladeW * 0.85, axY - bladeH * 0.25);
        wCtx.lineTo(bSide * bladeW * 0.95, axY - bladeH * 0.15);
        wCtx.lineTo(bSide * bladeW, axY);
        wCtx.lineTo(bSide * bladeW * 0.95, axY + bladeH * 0.15);
        wCtx.lineTo(bSide * bladeW * 0.85, axY + bladeH * 0.25);
        wCtx.quadraticCurveTo(
          bSide * bladeW * 0.5,
          axY + bladeH * 0.4,
          0,
          axY + bladeH * 0.5
        );
        wCtx.closePath();
        wCtx.fill();

        // Blade edge sharpness highlight
        wCtx.strokeStyle = `rgba(200,160,255,0.4)`;
        wCtx.lineWidth = 0.8 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(bSide * bladeW * 0.7, axY - bladeH * 0.35);
        wCtx.lineTo(bSide * bladeW * 0.85, axY - bladeH * 0.25);
        wCtx.lineTo(bSide * bladeW * 0.95, axY - bladeH * 0.15);
        wCtx.lineTo(bSide * bladeW, axY);
        wCtx.lineTo(bSide * bladeW * 0.95, axY + bladeH * 0.15);
        wCtx.lineTo(bSide * bladeW * 0.85, axY + bladeH * 0.25);
        wCtx.stroke();

        // Serrated notches along the cutting edge
        wCtx.fillStyle = "#0a0010";
        for (let n = 0; n < 4; n++) {
          const ny = axY - bladeH * 0.2 + n * bladeH * 0.12;
          const nx = bSide * bladeW * (0.88 + Math.sin(n * 1.5) * 0.06);
          wCtx.beginPath();
          wCtx.moveTo(nx, ny - size * 0.005);
          wCtx.lineTo(nx + bSide * size * 0.008, ny);
          wCtx.lineTo(nx, ny + size * 0.005);
          wCtx.closePath();
          wCtx.fill();
        }

        // Hellfire glow from within the blade
        const fireAlpha = 0.15 + corruptPulse * 0.15;
        setShadowBlur(wCtx, 6 * zoom, `rgba(255,100,30,${fireAlpha})`);
        wCtx.strokeStyle = `rgba(255,140,40,${fireAlpha})`;
        wCtx.lineWidth = 1 * zoom;
        wCtx.beginPath();
        wCtx.moveTo(bSide * bladeW * 0.2, axY - bladeH * 0.3);
        wCtx.quadraticCurveTo(
          bSide * bladeW * 0.5,
          axY,
          bSide * bladeW * 0.2,
          axY + bladeH * 0.3
        );
        wCtx.stroke();

        // Inner lava cracks
        wCtx.strokeStyle = `rgba(255,80,20,${fireAlpha * 0.8})`;
        wCtx.lineWidth = 0.5 * zoom;
        for (let c = 0; c < 3; c++) {
          const cy = axY - bladeH * 0.15 + c * bladeH * 0.15;
          wCtx.beginPath();
          wCtx.moveTo(bSide * bladeW * 0.15, cy);
          wCtx.lineTo(bSide * bladeW * (0.4 + c * 0.08), cy + size * 0.005);
          wCtx.stroke();
        }
        clearShadow(wCtx);
      }

      // Central axe eye — glowing skull boss
      const eyeGrad = wCtx.createRadialGradient(0, axY, 0, 0, axY, size * 0.03);
      eyeGrad.addColorStop(0, goldPale);
      eyeGrad.addColorStop(0.4, goldBright);
      eyeGrad.addColorStop(0.7, goldDark);
      eyeGrad.addColorStop(1, "#1a0a18");
      wCtx.fillStyle = eyeGrad;
      wCtx.beginPath();
      wCtx.arc(0, axY, size * 0.03, 0, TAU);
      wCtx.fill();

      // Skull face on axe boss
      wCtx.fillStyle = "#0a0010";
      for (const es of [-1, 1]) {
        wCtx.beginPath();
        wCtx.arc(es * size * 0.008, axY - size * 0.005, size * 0.005, 0, TAU);
        wCtx.fill();
      }
      setShadowBlur(wCtx, 4 * zoom, "#ff4020");
      wCtx.fillStyle = `rgba(255,60,30,${0.5 + corruptPulse * 0.3})`;
      for (const es of [-1, 1]) {
        wCtx.beginPath();
        wCtx.arc(es * size * 0.008, axY - size * 0.005, size * 0.003, 0, TAU);
        wCtx.fill();
      }
      clearShadow(wCtx);
      wCtx.fillStyle = "#0a0010";
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.004, axY + size * 0.008);
      wCtx.lineTo(size * 0.004, axY + size * 0.008);
      wCtx.lineTo(size * 0.002, axY + size * 0.014);
      wCtx.lineTo(-size * 0.002, axY + size * 0.014);
      wCtx.fill();

      // Hellfire dripping from axe head (animated)
      setShadowBlur(wCtx, 5 * zoom, "#ff6020");
      for (let d = 0; d < 4; d++) {
        const dx = -bladeW * 0.6 + d * bladeW * 0.4;
        const dPhase = (time * 2.5 + d * 1.3) % 1;
        const dy = axY + bladeH * 0.3 + dPhase * size * 0.06;
        const dAlpha = (1 - dPhase) * 0.6;
        wCtx.fillStyle = `rgba(255,100,30,${dAlpha})`;
        wCtx.beginPath();
        wCtx.ellipse(
          dx,
          dy,
          size * 0.004,
          size * 0.008 + dPhase * size * 0.006,
          0,
          0,
          TAU
        );
        wCtx.fill();
      }
      clearShadow(wCtx);

      // Bottom pommel — spiked
      wCtx.fillStyle = goldDark;
      wCtx.beginPath();
      wCtx.ellipse(0, sH * 0.58, sW * 2.2, sW * 1.4, 0, 0, TAU);
      wCtx.fill();
      wCtx.fillStyle = goldBright;
      wCtx.beginPath();
      wCtx.moveTo(0, sH * 0.58);
      wCtx.lineTo(size * 0.005, sH * 0.58 + size * 0.02);
      wCtx.lineTo(-size * 0.005, sH * 0.58 + size * 0.02);
      wCtx.closePath();
      wCtx.fill();
    },
    shoulderAngle:
      -(0.55 + Math.sin(time * 1.3 + Math.PI) * 0.04) +
      (isAttacking ? -attackIntensity * 0.5 : 0),
    style: "armored",
    upperLen: 0.17,
    weaponAngle: -0.5,
    width: 0.065,
  });

  // === MASSIVE LAYERED PAULDRONS ===
  for (const side of [-1, 1]) {
    const epX = x + side * size * 0.24;
    const epY = y - size * 0.38 - bodyBob;

    // Bottom plate
    const p1Grad = ctx.createRadialGradient(
      epX,
      epY + size * 0.02,
      0,
      epX,
      epY + size * 0.02,
      size * 0.09
    );
    p1Grad.addColorStop(0, "#3a2860");
    p1Grad.addColorStop(0.6, "#2a2048");
    p1Grad.addColorStop(1, "#1a1030");
    ctx.fillStyle = p1Grad;
    ctx.beginPath();
    ctx.ellipse(
      epX + side * size * 0.01,
      epY + size * 0.02,
      size * 0.09,
      size * 0.05,
      side * 0.25,
      0,
      TAU
    );
    ctx.fill();
    ctx.strokeStyle = goldMid;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Top plate (overlapping)
    const p2Grad = ctx.createRadialGradient(
      epX,
      epY - size * 0.01,
      0,
      epX,
      epY - size * 0.01,
      size * 0.075
    );
    p2Grad.addColorStop(0, goldBright);
    p2Grad.addColorStop(0.4, goldMid);
    p2Grad.addColorStop(1, goldDark);
    ctx.fillStyle = p2Grad;
    ctx.beginPath();
    ctx.ellipse(
      epX,
      epY - size * 0.01,
      size * 0.075,
      size * 0.045,
      side * 0.2,
      0,
      TAU
    );
    ctx.fill();
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();

    // Spike on pauldron
    ctx.fillStyle = goldBright;
    ctx.beginPath();
    ctx.moveTo(epX + side * size * 0.04, epY - size * 0.02);
    ctx.lineTo(epX + side * size * 0.08, epY - size * 0.06);
    ctx.lineTo(epX + side * size * 0.05, epY + size * 0.005);
    ctx.closePath();
    ctx.fill();

    // Amethyst centerpiece
    ctx.fillStyle = "#7c3aed";
    setShadowBlur(ctx, 4 * zoom, "#7c3aed");
    ctx.beginPath();
    ctx.arc(epX, epY - size * 0.01, size * 0.015, 0, TAU);
    ctx.fill();
    clearShadow(ctx);

    // Gold tassels hanging from pauldron
    ctx.strokeStyle = goldBright;
    ctx.lineWidth = 1 * zoom;
    for (let t = 0; t < 4; t++) {
      const tAngle = side * (0.5 + t * 0.25);
      const tLen = size * 0.04 + Math.sin(time * 2.5 + t * 0.9) * size * 0.006;
      const stX = epX + Math.cos(tAngle) * size * 0.07;
      const stY = epY + Math.sin(tAngle) * size * 0.045;
      ctx.beginPath();
      ctx.moveTo(stX, stY);
      ctx.lineTo(stX + Math.sin(time * 2 + t) * size * 0.003, stY + tLen);
      ctx.stroke();
    }
  }

  // === HEAD — monstrous face in ornate great helm ===
  const headX = x;
  const headY = y - size * 0.5 - bodyBob;

  // Armored neck guard
  ctx.fillStyle = "#2a2048";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY + size * 0.1);
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.14,
    headX + size * 0.08,
    headY + size * 0.1
  );
  ctx.lineTo(headX + size * 0.06, headY + size * 0.06);
  ctx.quadraticCurveTo(
    headX,
    headY + size * 0.08,
    headX - size * 0.06,
    headY + size * 0.06
  );
  ctx.closePath();
  ctx.fill();

  // Face — corrupted demonic visage visible through helm opening
  const faceGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.01,
    0,
    headX,
    headY + size * 0.01,
    size * 0.09
  );
  faceGrad.addColorStop(0, "#5a1040");
  faceGrad.addColorStop(0.25, "#4a0838");
  faceGrad.addColorStop(0.5, "#3a0028");
  faceGrad.addColorStop(0.75, "#2a0020");
  faceGrad.addColorStop(1, "#1a0018");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.01, size * 0.09, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Burning corruption cracks radiating from center — deterministic
  for (let c = 0; c < 8; c++) {
    const cAngle = (c * TAU) / 8 + Math.sin(time * 1.5 + c * 0.7) * 0.1;
    const crackAlpha = 0.3 + corruptPulse * 0.25;
    ctx.strokeStyle = `rgba(255, 80, 30, ${crackAlpha * 0.6})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX, headY + size * 0.01);
    for (let s = 1; s <= 4; s++) {
      const jitter = Math.sin(time * 2 + c * 3.7 + s * 2.1) * size * 0.005;
      ctx.lineTo(
        headX + Math.cos(cAngle + s * 0.1) * size * (0.015 * s) + jitter,
        headY + size * 0.01 + Math.sin(cAngle + s * 0.1) * size * (0.015 * s)
      );
    }
    ctx.stroke();
    // Glow layer
    setShadowBlur(ctx, 3 * zoom, "#ff4020");
    ctx.strokeStyle = `rgba(255, 120, 40, ${crackAlpha * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    clearShadow(ctx);
  }

  // Sunken burning eye sockets — larger and more intense
  for (const side of [-1, 1]) {
    const eyeX = headX + side * size * 0.04;
    const eyeY = headY - size * 0.01;

    // Deep shadowed socket
    ctx.fillStyle = "#050008";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.028, size * 0.022, side * 0.15, 0, TAU);
    ctx.fill();

    // Hellfire iris — intense burning
    setShadowBlur(ctx, 14 * zoom, "#ff4020");
    const eyeGrad = ctx.createRadialGradient(
      eyeX,
      eyeY,
      0,
      eyeX,
      eyeY,
      size * 0.02
    );
    eyeGrad.addColorStop(0, `rgba(255, 255, 200, ${goldPulse})`);
    eyeGrad.addColorStop(0.2, `rgba(255, 200, 60, ${goldPulse * 0.95})`);
    eyeGrad.addColorStop(0.4, `rgba(255, 80, 20, ${goldPulse * 0.8})`);
    eyeGrad.addColorStop(0.7, `rgba(180, 30, 0, ${goldPulse * 0.5})`);
    eyeGrad.addColorStop(1, `rgba(60, 0, 0, 0)`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.02, 0, TAU);
    ctx.fill();

    // Vertical slit pupil
    ctx.fillStyle = `rgba(10, 0, 0, ${goldPulse * 0.85})`;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.003, size * 0.014, 0, 0, TAU);
    ctx.fill();

    // Trailing fire wisps from eyes
    const wispAlpha = 0.25 + goldPulse * 0.2;
    for (let w = 0; w < 3; w++) {
      const wLen = size * 0.02 + w * size * 0.012;
      const wAngle = side * 0.4 + Math.sin(time * 4 + w * 1.5) * 0.2;
      ctx.strokeStyle = `rgba(255, 120, 30, ${wispAlpha * (1 - w * 0.25)})`;
      ctx.lineWidth = (1.2 - w * 0.3) * zoom;
      ctx.beginPath();
      ctx.moveTo(eyeX + side * size * 0.02, eyeY);
      ctx.quadraticCurveTo(
        eyeX + side * (size * 0.03 + wLen * 0.5),
        eyeY - size * 0.01 + Math.sin(time * 5 + w) * size * 0.005,
        eyeX + side * (size * 0.025 + wLen),
        eyeY - size * 0.015 + Math.sin(time * 3 + w * 2) * size * 0.008
      );
      ctx.stroke();
    }
    clearShadow(ctx);
  }

  // Gaping maw — wider, more menacing
  ctx.fillStyle = "#050008";
  ctx.beginPath();
  ctx.ellipse(
    headX,
    headY + size * 0.055,
    size * 0.05,
    size * 0.025,
    0,
    0,
    TAU
  );
  ctx.fill();

  // Inner glow from maw
  setShadowBlur(ctx, 5 * zoom, "#ff2000");
  const mawGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.055,
    0,
    headX,
    headY + size * 0.055,
    size * 0.035
  );
  mawGrad.addColorStop(0, `rgba(255,80,20,${0.3 + corruptPulse * 0.2})`);
  mawGrad.addColorStop(0.5, `rgba(120,20,0,${0.15 + corruptPulse * 0.1})`);
  mawGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = mawGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.055, size * 0.04, size * 0.02, 0, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Upper fangs — larger and more jagged
  ctx.fillStyle = "#e8dcc0";
  for (let f = 0; f < 6; f++) {
    const fx = headX - size * 0.035 + f * size * 0.014;
    const fH =
      f === 1 || f === 4
        ? size * 0.03
        : f === 2 || f === 3
          ? size * 0.022
          : size * 0.014;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.004, headY + size * 0.035);
    ctx.lineTo(fx, headY + size * 0.035 + fH);
    ctx.lineTo(fx + size * 0.004, headY + size * 0.035);
    ctx.fill();
  }
  // Lower fangs
  ctx.fillStyle = "#d4c8a0";
  for (let f = 0; f < 5; f++) {
    const fx = headX - size * 0.028 + f * size * 0.014;
    const fH = f === 1 || f === 3 ? size * 0.018 : size * 0.01;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.003, headY + size * 0.075);
    ctx.lineTo(fx, headY + size * 0.075 - fH);
    ctx.lineTo(fx + size * 0.003, headY + size * 0.075);
    ctx.fill();
  }

  // Drool/corruption + hellfire drips from mouth
  for (let d = 0; d < 3; d++) {
    const dx = headX + (d - 1) * size * 0.025;
    const dPhase = (time * 2.2 + d * 1.8) % 1;
    const dLen = size * 0.015 + dPhase * size * 0.025;
    const dAlpha = (1 - dPhase) * 0.5;
    setShadowBlur(ctx, 3 * zoom, "#ff4020");
    ctx.fillStyle = `rgba(255, 60, 20, ${dAlpha * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(
      dx,
      headY + size * 0.08 + dLen,
      size * 0.003,
      size * 0.006 + dPhase * size * 0.004,
      0,
      0,
      TAU
    );
    ctx.fill();
    ctx.fillStyle = `rgba(120, 50, 200, ${dAlpha * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(
      dx + size * 0.005,
      headY + size * 0.082 + dLen * 0.8,
      size * 0.002,
      size * 0.005,
      0,
      0,
      TAU
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // === GREAT HELM — ornate golden war-crown helm ===
  const helmY = headY - size * 0.04;

  // Main helm shell
  const helmGrad = ctx.createLinearGradient(
    headX - size * 0.14,
    helmY - size * 0.15,
    headX + size * 0.14,
    helmY + size * 0.08
  );
  helmGrad.addColorStop(0, "#1a1030");
  helmGrad.addColorStop(0.15, "#2a2048");
  helmGrad.addColorStop(0.4, "#3a2860");
  helmGrad.addColorStop(0.6, "#2a2048");
  helmGrad.addColorStop(0.85, "#1a1030");
  helmGrad.addColorStop(1, "#0e0820");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, headY + size * 0.04);
  ctx.quadraticCurveTo(
    headX - size * 0.16,
    helmY - size * 0.06,
    headX - size * 0.12,
    helmY - size * 0.14
  );
  ctx.quadraticCurveTo(
    headX,
    helmY - size * 0.2,
    headX + size * 0.12,
    helmY - size * 0.14
  );
  ctx.quadraticCurveTo(
    headX + size * 0.16,
    helmY - size * 0.06,
    headX + size * 0.14,
    headY + size * 0.04
  );
  ctx.closePath();
  ctx.fill();

  // Gold trim on helm
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Visor slit (where eyes glow through)
  ctx.fillStyle = "#050010";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.09, headY - size * 0.01);
  ctx.lineTo(headX + size * 0.09, headY - size * 0.01);
  ctx.lineTo(headX + size * 0.07, headY + size * 0.015);
  ctx.lineTo(headX - size * 0.07, headY + size * 0.015);
  ctx.closePath();
  ctx.fill();

  // Nasal guard
  ctx.fillStyle = goldBright;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.012, helmY - size * 0.12);
  ctx.lineTo(headX + size * 0.012, helmY - size * 0.12);
  ctx.lineTo(headX + size * 0.008, headY + size * 0.04);
  ctx.lineTo(headX - size * 0.008, headY + size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Cheek guard ridges
  ctx.strokeStyle = goldMid;
  ctx.lineWidth = 1 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(headX + side * size * 0.06, helmY - size * 0.1);
    ctx.quadraticCurveTo(
      headX + side * size * 0.12,
      helmY - size * 0.02,
      headX + side * size * 0.1,
      headY + size * 0.04
    );
    ctx.stroke();
  }

  // Ornate gold crown band integrated into helm
  const crownBandY = helmY - size * 0.08;
  const cbGrad = ctx.createLinearGradient(
    headX - size * 0.14,
    crownBandY,
    headX + size * 0.14,
    crownBandY
  );
  cbGrad.addColorStop(0, goldDark);
  cbGrad.addColorStop(0.2, goldBright);
  cbGrad.addColorStop(0.5, goldPale);
  cbGrad.addColorStop(0.8, goldBright);
  cbGrad.addColorStop(1, goldDark);
  ctx.fillStyle = cbGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, crownBandY);
  ctx.quadraticCurveTo(
    headX,
    crownBandY + size * 0.02,
    headX + size * 0.14,
    crownBandY
  );
  ctx.lineTo(headX + size * 0.13, crownBandY + size * 0.03);
  ctx.quadraticCurveTo(
    headX,
    crownBandY + size * 0.05,
    headX - size * 0.13,
    crownBandY + size * 0.03
  );
  ctx.closePath();
  ctx.fill();

  // Crown points rising from helm
  for (let p = 0; p < 7; p++) {
    const px = headX - size * 0.12 + p * size * 0.04;
    const pointH =
      p === 3
        ? size * 0.08
        : p === 2 || p === 4
          ? size * 0.06
          : p === 1 || p === 5
            ? size * 0.04
            : size * 0.025;
    ctx.fillStyle = goldBright;
    ctx.beginPath();
    ctx.moveTo(px - size * 0.008, crownBandY);
    ctx.lineTo(px, crownBandY - pointH);
    ctx.lineTo(px + size * 0.008, crownBandY);
    ctx.closePath();
    ctx.fill();
  }

  // Gems in crown band
  const helmGems = [
    "#dc2626",
    "#059669",
    "#2563eb",
    "#7c3aed",
    "#2563eb",
    "#059669",
    "#dc2626",
  ];
  for (let g = 0; g < 7; g++) {
    const gx = headX - size * 0.12 + g * size * 0.04;
    ctx.fillStyle = helmGems[g];
    setShadowBlur(ctx, 3 * zoom, helmGems[g]);
    ctx.beginPath();
    ctx.arc(gx, crownBandY + size * 0.015, size * 0.007, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Swept-back horn decorations
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(headX + side * size * 0.12, helmY - size * 0.06);
    const hornGrad = ctx.createLinearGradient(
      0,
      0,
      side * size * 0.12,
      -size * 0.18
    );
    hornGrad.addColorStop(0, goldMid);
    hornGrad.addColorStop(0.4, goldBright);
    hornGrad.addColorStop(0.7, goldMid);
    hornGrad.addColorStop(1, goldDark);
    ctx.fillStyle = hornGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      side * size * 0.06,
      -size * 0.06,
      side * size * 0.12,
      -size * 0.16
    );
    ctx.quadraticCurveTo(
      side * size * 0.13,
      -size * 0.18,
      side * size * 0.14,
      -size * 0.22
    );
    ctx.quadraticCurveTo(
      side * size * 0.08,
      -size * 0.1,
      size * 0.005,
      size * 0.005
    );
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = goldDark;
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
    ctx.restore();
  }

  // Monde (orb) at helm apex
  const mondeY = crownBandY - size * 0.1;
  setShadowBlur(ctx, 10 * zoom, goldBright);
  const mondeGrad = ctx.createRadialGradient(
    headX,
    mondeY,
    0,
    headX,
    mondeY,
    size * 0.025
  );
  mondeGrad.addColorStop(0, goldPale);
  mondeGrad.addColorStop(0.5, goldBright);
  mondeGrad.addColorStop(1, goldMid);
  ctx.fillStyle = mondeGrad;
  ctx.beginPath();
  ctx.arc(headX, mondeY, size * 0.025, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Cross on monde
  ctx.fillStyle = goldPale;
  ctx.fillRect(
    headX - size * 0.003,
    mondeY - size * 0.04,
    size * 0.006,
    size * 0.03
  );
  ctx.fillRect(
    headX - size * 0.012,
    mondeY - size * 0.035,
    size * 0.024,
    size * 0.006
  );

  // Amethyst in monde
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.arc(headX, mondeY, size * 0.012, 0, TAU);
  ctx.fill();

  // === ATTACK EFFECTS — hellfire eruption ===
  if (isAttacking) {
    // Ground shockwave — concentric rings
    for (let ring = 0; ring < 3; ring++) {
      const ringDelay = ring * 0.1;
      const ringPhase = Math.min(1, attackIntensity * 1.5 - ringDelay);
      if (ringPhase > 0) {
        const shockR = size * 0.2 + ringPhase * size * 0.5 + ring * size * 0.12;
        ctx.strokeStyle = `rgba(255, 80, 20, ${(1 - ringPhase * 0.6) * attackIntensity * 0.4})`;
        ctx.lineWidth = (3 - ring) * zoom;
        ctx.beginPath();
        ctx.ellipse(x, y + size * 0.1, shockR, shockR * 0.35, 0, 0, TAU);
        ctx.stroke();
      }
    }

    // Hellfire eye beams
    for (const side of [-1, 1]) {
      setShadowBlur(ctx, 12 * zoom, "#ff4020");
      const beamLen = size * 0.25 * attackIntensity;
      const beamWid = size * 0.008 * attackIntensity;

      // Outer glow
      ctx.strokeStyle = `rgba(255, 60, 20, ${attackIntensity * 0.5})`;
      ctx.lineWidth = (beamWid + 2) * zoom;
      ctx.beginPath();
      ctx.moveTo(headX + side * size * 0.04, headY - size * 0.01);
      ctx.quadraticCurveTo(
        headX + side * (size * 0.04 + beamLen * 0.5),
        headY - size * 0.01 + beamLen * 0.15 + Math.sin(time * 8) * size * 0.01,
        headX + side * (size * 0.04 + beamLen),
        headY - size * 0.01 + beamLen * 0.3
      );
      ctx.stroke();

      // Inner bright core
      ctx.strokeStyle = `rgba(255, 220, 100, ${attackIntensity * 0.7})`;
      ctx.lineWidth = beamWid * zoom;
      ctx.stroke();
      clearShadow(ctx);
    }

    // Hellfire ground eruption particles
    setShadowBlur(ctx, 6 * zoom, "#ff4020");
    for (let p = 0; p < 8; p++) {
      const pAngle = (p * TAU) / 8 + time * 3;
      const pDist = size * 0.25 + attackIntensity * size * 0.3;
      const px = x + Math.cos(pAngle) * pDist;
      const py = y + size * 0.1 + Math.sin(pAngle) * pDist * 0.35;
      const pRise = Math.sin(time * 5 + p * 1.3) * size * 0.04;
      const pAlpha =
        attackIntensity * (0.3 + Math.sin(time * 4 + p * 2) * 0.15);
      ctx.fillStyle = `rgba(255, 100, 20, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py - pRise, size * 0.008, 0, TAU);
      ctx.fill();
    }
    clearShadow(ctx);

    // Wing flare during attack
    ctx.fillStyle = `rgba(255, 60, 20, ${attackIntensity * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.2, size * 0.7, size * 0.4, 0, 0, TAU);
    ctx.fill();
  }

  // === CORRUPTED AUTHORITY HALO — double ring, gold and hellfire ===
  drawPulsingGlowRings(
    ctx,
    headX,
    helmY - size * 0.06,
    size * 0.22,
    time,
    zoom,
    {
      color: "rgba(255, 80, 20, 0.35)",
      count: 2,
      expansion: 1.5,
      lineWidth: 2,
      maxAlpha: 0.35,
      speed: 0.8,
    }
  );
  drawPulsingGlowRings(
    ctx,
    headX,
    helmY - size * 0.06,
    size * 0.18,
    time,
    zoom,
    {
      color: "rgba(251, 191, 36, 0.25)",
      count: 2,
      expansion: 1.3,
      lineWidth: 1.5,
      maxAlpha: 0.25,
      speed: 0.6,
    }
  );

  // Floating hellfire + corruption embers
  for (let m = 0; m < 10; m++) {
    const mPhase = time * 0.7 + (m * TAU) / 10;
    const mR = size * 0.35 + Math.sin(time * 1.5 + m * 1.3) * size * 0.08;
    const mx = x + Math.cos(mPhase) * mR;
    const my =
      y -
      size * 0.15 +
      Math.sin(mPhase) * mR * 0.3 -
      bodyBob -
      Math.sin(time * 2.5 + m) * size * 0.02;
    const mAlpha = 0.25 + Math.sin(time * 3 + m * 1.7) * 0.15;
    if (m % 3 === 0) {
      setShadowBlur(ctx, 4 * zoom, "#ff4020");
      ctx.fillStyle = `rgba(255, 80, 20, ${mAlpha})`;
    } else if (m % 3 === 1) {
      setShadowBlur(ctx, 3 * zoom, "#7c3aed");
      ctx.fillStyle = `rgba(160, 60, 240, ${mAlpha * 0.7})`;
    } else {
      setShadowBlur(ctx, 3 * zoom, goldBright);
      ctx.fillStyle = `rgba(251, 191, 36, ${mAlpha})`;
    }
    ctx.beginPath();
    ctx.arc(
      mx,
      my,
      size * (0.004 + Math.sin(time * 4 + m * 2.3) * 0.002),
      0,
      TAU
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // Rising smoke/soul wisps from body
  for (let s = 0; s < 4; s++) {
    const sPhase = (time * 0.8 + s * 0.5) % 2;
    const sRise = sPhase * size * 0.15;
    const sAlpha = Math.max(0, 0.15 - sPhase * 0.075);
    const sx = x + Math.sin(time * 1.2 + s * 2.5) * size * 0.08;
    ctx.fillStyle = `rgba(60, 20, 80, ${sAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      sx,
      y - size * 0.3 - sRise - bodyBob,
      size * 0.015 + sPhase * size * 0.008,
      size * 0.008 + sPhase * size * 0.005,
      0,
      0,
      TAU
    );
    ctx.fill();
  }
}
