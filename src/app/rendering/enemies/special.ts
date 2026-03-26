import { setShadowBlur, clearShadow } from "../performance";
import { ISO_Y_RATIO } from "../../constants/isometric";
import { drawFaceCircle } from "./helpers";
import {
  drawPulsingGlowRings,
  drawShiftingSegments,
} from "./animationHelpers";
import {
  drawPathArm,
  drawPathLegs,
} from "./darkFantasyHelpers";

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
    const px = x + Math.sin(time * 3.5 + i * 1.0) * size * 0.45;
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
    wingGradL.addColorStop(0, "#0e7490");
    wingGradL.addColorStop(0.3, "#0891b2");
    wingGradL.addColorStop(0.6, "#06b6d4");
    wingGradL.addColorStop(1, "#22d3ee");
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
    ctx.strokeStyle = "#67e8f9";
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
    wingGradR.addColorStop(0, "#0e7490");
    wingGradR.addColorStop(0.3, "#0891b2");
    wingGradR.addColorStop(0.6, "#06b6d4");
    wingGradR.addColorStop(1, "#22d3ee");
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
    ctx.strokeStyle = "#67e8f9";
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
  tailGrad.addColorStop(0, "#0e7490");
  tailGrad.addColorStop(0.5, "#0891b2");
  tailGrad.addColorStop(1, "#22d3ee");
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
      flameY,
    );
    ctx.quadraticCurveTo(
      size * 0.6 + i * size * 0.12,
      flameY + size * 0.08,
      size * 0.5 + i * size * 0.1,
      flameY,
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
    size * 0.48,
  );
  bodyGrad.addColorStop(0, "#155e75");
  bodyGrad.addColorStop(0.4, "#0e7490");
  bodyGrad.addColorStop(0.7, "#0891b2");
  bodyGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.06 + swoop * 0.2,
    size * 0.38,
    size * 0.44,
    0,
    0,
    Math.PI * 2,
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
    size * 0.24,
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
    Math.PI * 2,
  );
  ctx.fill();
  // Feather texture - more detailed
  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(
      x,
      y + size * 0.06 + swoop * 0.2,
      size * 0.09 + i * size * 0.028,
      0.55 * Math.PI,
      0.45 * Math.PI,
      true,
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
    size * 0.28,
  );
  headGrad.addColorStop(0, "#0e7490");
  headGrad.addColorStop(0.6, "#0891b2");
  headGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4 + swoop, size * 0.26, 0, Math.PI * 2);
  ctx.fill();

  // Crown crest feathers (optimized - no shadowBlur)
  ctx.fillStyle = "#67e8f9";
  for (let i = 0; i < 9; i++) {
    const crestAngle = -Math.PI * 0.45 + i * Math.PI * 0.11;
    const crestLen = size * (0.18 + Math.sin(time * 6 + i * 0.8) * 0.04);
    ctx.save();
    ctx.translate(
      x + Math.cos(crestAngle) * size * 0.2,
      y - size * 0.55 + swoop,
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
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.42 + swoop,
    size * 0.072,
    size * 0.055,
    0.15,
    0,
    Math.PI * 2,
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
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.42 + swoop,
    size * 0.022,
    size * 0.045,
    0,
    0,
    Math.PI * 2,
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
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.44 + swoop,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Sharp hooked beak with golden sheen
  const beakGrad = ctx.createLinearGradient(
    x - size * 0.1,
    y - size * 0.35,
    x + size * 0.1,
    y - size * 0.2,
  );
  beakGrad.addColorStop(0, "#f59e0b");
  beakGrad.addColorStop(0.5, "#fbbf24");
  beakGrad.addColorStop(1, "#f59e0b");
  ctx.fillStyle = beakGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.37 + swoop);
  ctx.quadraticCurveTo(
    x - size * 0.1,
    y - size * 0.34 + swoop,
    x - size * 0.06,
    y - size * 0.22 + swoop,
  );
  ctx.lineTo(x, y - size * 0.17 + swoop);
  ctx.lineTo(x + size * 0.06, y - size * 0.22 + swoop);
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y - size * 0.34 + swoop,
    x,
    y - size * 0.37 + swoop,
  );
  ctx.fill();
  // Beak detail
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.37 + swoop);
  ctx.lineTo(x, y - size * 0.19 + swoop);
  ctx.stroke();
  // Beak hook
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.18 + swoop, size * 0.02, 0, Math.PI);
  ctx.fill();

  // Powerful talons with golden claws
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(x + side * size * 0.22, y + size * 0.44 + swoop * 0.1);
    // Feathered leg
    const legGrad = ctx.createLinearGradient(0, -size * 0.18, 0, 0);
    legGrad.addColorStop(0, "#0891b2");
    legGrad.addColorStop(1, "#0e7490");
    ctx.fillStyle = legGrad;
    ctx.fillRect(-size * 0.045, -size * 0.18, size * 0.09, size * 0.18);
    // Leg scales
    ctx.strokeStyle = "#06b6d4";
    ctx.lineWidth = 1 * zoom;
    for (let s = 0; s < 4; s++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.04, -size * 0.15 + s * size * 0.04);
      ctx.lineTo(size * 0.04, -size * 0.13 + s * size * 0.04);
      ctx.stroke();
    }
    // Golden talons (optimized - no shadowBlur)
    ctx.fillStyle = "#fcd34d";
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
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Powerful clawed legs with stomping animation
  drawPathLegs(ctx, x, y + size * 0.38 + swoop * 0.15, size, time, zoom, {
    color: "#0891b2",
    colorDark: "#0e7490",
    footColor: "#fcd34d",
    strideSpeed: 3,
    strideAmt: 0.45,
    legLen: 0.22,
    width: 0.07,
    style: "fleshy",
  });

  // Storm glow rings around body
  drawPulsingGlowRings(ctx, x, y + swoop * 0.2, size * 0.5, time, zoom, {
    color: "rgba(34, 211, 238, 0.5)",
    count: 4,
    speed: 2,
    maxAlpha: 0.35,
    expansion: 1.2,
    lineWidth: 2,
  });

  // Floating storm scale segments (diamond shape)
  drawShiftingSegments(ctx, x, y + swoop * 0.2, size, time, zoom, {
    color: "#22d3ee",
    colorAlt: "#06b6d4",
    count: 8,
    orbitRadius: 0.55,
    segmentSize: 0.04,
    orbitSpeed: 1.8,
    shape: "diamond",
  });
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
  attackPhase: number = 0,
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
      if (a === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
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
      py + Math.sin(shardAngle + Math.PI) * size * 0.04,
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
      y - size * 0.05 + Math.sin(time * 3 + t) * size * 0.05,
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
      handColor: "#c7d2fe",
      shoulderAngle: -0.5 + Math.sin(time * 3) * 0.15,
      elbowAngle: 0.4 + Math.sin(time * 3.5 + 1) * 0.12,
      upperLen: 0.15,
      foreLen: 0.12,
      width: 0.05,
      style: "fleshy",
    },
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
      handColor: "#c7d2fe",
      shoulderAngle: 0.5 + Math.sin(time * 3 + Math.PI) * 0.15,
      elbowAngle: 0.4 + Math.sin(time * 3.5 + 2.5) * 0.12,
      upperLen: 0.15,
      foreLen: 0.12,
      width: 0.05,
      style: "fleshy",
    },
  );

  // Basic walking legs (behind robe)
  drawPathLegs(ctx, x, y + size * 0.42, size, time, zoom, {
    color: "#312e81",
    colorDark: "#1e1b4b",
    footColor: "#0f0d24",
    strideSpeed: 4,
    strideAmt: 0.3,
    legLen: 0.14,
    width: 0.05,
    style: "fleshy",
  });

  // Shadowy robes with flowing tattered edges
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y - size * 0.3,
    x + size * 0.4,
    y + size * 0.3,
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
    y - size * 0.32 + bob * 0.3,
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.32 + bob * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.45,
    y + size * 0.05,
    x - size * 0.38,
    y + size * 0.48,
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
      y + size * 0.4,
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
    size * 0.25,
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
    0,
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
    y + size * 0.02,
  );
  ctx.lineTo(x - size * 0.14, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y - size * 0.22,
    x - size * 0.16,
    y - size * 0.32 + bob * 0.3,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y - size * 0.12,
    x + size * 0.2,
    y + size * 0.02,
  );
  ctx.lineTo(x + size * 0.14, y - size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y - size * 0.22,
    x + size * 0.16,
    y - size * 0.32 + bob * 0.3,
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
    y - size * 0.48 + bob * 0.3,
  );
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y - size * 0.38,
    x + size * 0.22,
    y - size * 0.35 + bob * 0.3,
  );
  ctx.lineTo(x - size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.22,
    y - size * 0.38,
    x - size * 0.15,
    y - size * 0.48 + bob * 0.3,
  );
  ctx.fill();

  // Spectral face emerging from hood shadow
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.03,
    y - size * 0.42 + bob,
    size * 0.02,
    x,
    y - size * 0.4 + bob,
    size * 0.16,
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
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.42 + bob,
    size * 0.04,
    size * 0.035,
    0.1,
    0,
    Math.PI * 2,
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
    y - size * 0.33 + bob,
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
      Math.PI * 2,
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
      Math.PI * 2,
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
        handY + Math.sin(fingerAngle) * size * 0.03,
      );
      ctx.lineTo(
        handX + handSway + Math.cos(fingerAngle) * size * 0.09,
        handY + Math.sin(fingerAngle) * size * 0.06,
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
        size * 0.1,
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
          orbY + Math.sin(arcAngle) * size * 0.07,
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
      size * attackIntensity * 0.5,
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
    speed: 1.5,
    maxAlpha: 0.3,
    expansion: 1.3,
    lineWidth: 1.5,
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
  attackPhase: number = 0,
) {
  size *= 1.7;
  y += size * 0.08;
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const bodyBob = Math.sin(time * 2.5) * size * 0.012;
  const goldPulse = 0.7 + Math.sin(time * 4) * 0.3;
  const wealthAura = 0.5 + Math.sin(time * 3) * 0.3;
  const corruptionPulse = 0.6 + Math.sin(time * 5) * 0.3;

  // Radiant wealth aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.35})`);
  auraGrad.addColorStop(0.4, `rgba(234, 179, 8, ${goldPulse * 0.2})`);
  auraGrad.addColorStop(0.7, `rgba(146, 64, 14, ${goldPulse * 0.08})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.85, size * 0.85 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Golden distortion rings
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 3; i++) {
    const ringPhase = (time * 0.5 + i * 0.4) % 2;
    const ringSize = size * 0.35 + ringPhase * size * 0.35;
    ctx.globalAlpha = 0.5 * (1 - ringPhase / 2);
    ctx.strokeStyle = `rgba(234, 179, 8, ${wealthAura * 0.5})`;
    ctx.beginPath();
    for (let a = 0; a < TAU; a += 0.1) {
      const r = ringSize + Math.sin(a * 5 + time * 3) * size * 0.02;
      const rx = x + Math.cos(a) * r;
      const ry = y + Math.sin(a) * r * 0.55;
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Orbiting treasure
  for (let i = 0; i < 8; i++) {
    const itemAngle = time * 1.0 + i * Math.PI * 0.25;
    const itemDist = size * 0.52 + Math.sin(time * 2.5 + i) * size * 0.08;
    const itemX = x + Math.cos(itemAngle) * itemDist;
    const itemY = y - size * 0.05 + Math.sin(itemAngle) * itemDist * 0.35 - bodyBob * 0.3;
    ctx.save();
    ctx.translate(itemX, itemY);
    ctx.rotate(time * 2.5 + i);
    if (i % 4 === 0) {
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.045, size * 0.032, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1.2 * zoom;
      ctx.stroke();
    } else if (i % 4 === 1) {
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.035);
      ctx.lineTo(size * 0.028, 0);
      ctx.lineTo(0, size * 0.035);
      ctx.lineTo(-size * 0.028, 0);
      ctx.fill();
    } else if (i % 4 === 2) {
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-size * 0.022, -size * 0.032, size * 0.044, size * 0.064);
    } else {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.032);
      ctx.lineTo(size * 0.024, -size * 0.008);
      ctx.lineTo(size * 0.016, size * 0.024);
      ctx.lineTo(-size * 0.016, size * 0.024);
      ctx.lineTo(-size * 0.024, -size * 0.008);
      ctx.fill();
    }
    ctx.restore();
  }

  // ── Grand ermine-lined cape (behind everything) ──
  const capeW1 = Math.sin(time * 1.6) * size * 0.02;
  const capeW2 = Math.sin(time * 2.2 + 0.7) * size * 0.015;
  const capeBot = 0.24;
  const capeGrad = ctx.createLinearGradient(x, y - size * 0.38, x, y + size * (capeBot + 0.06));
  capeGrad.addColorStop(0, "#1a0a2e");
  capeGrad.addColorStop(0.15, "#2d1050");
  capeGrad.addColorStop(0.4, "#3b0764");
  capeGrad.addColorStop(0.6, "#581c87");
  capeGrad.addColorStop(0.8, "#3b0764");
  capeGrad.addColorStop(1, "#1a0a2e");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.36 - bodyBob);
  ctx.bezierCurveTo(
    x - size * 0.36 + capeW1, y - size * 0.05,
    x - size * 0.38 + capeW2, y + size * 0.08,
    x - size * 0.28, y + size * capeBot,
  );
  for (let t = 0; t < 8; t++) {
    const tx = x - size * 0.28 + t * size * 0.07 + Math.sin(time * 2.5 + t * 0.9) * size * 0.01;
    const depth = (t % 2 === 0) ? size * 0.03 : -size * 0.01;
    ctx.lineTo(tx, y + size * capeBot + depth + Math.sin(time * 3 + t * 0.7) * size * 0.012);
  }
  ctx.bezierCurveTo(
    x + size * 0.38 + capeW2 * 0.5, y + size * 0.08,
    x + size * 0.36 + capeW1 * 0.5, y - size * 0.05,
    x + size * 0.22, y - size * 0.36 - bodyBob,
  );
  ctx.closePath();
  ctx.fill();
  // Ermine trim at cape bottom
  ctx.fillStyle = "#f5f0e8";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * capeBot - size * 0.01);
  for (let t = 0; t < 8; t++) {
    const tx = x - size * 0.28 + t * size * 0.07;
    ctx.lineTo(tx, y + size * capeBot + size * 0.025 + ((t % 2 === 0) ? size * 0.01 : 0));
  }
  ctx.lineTo(x + size * 0.28, y + size * capeBot - size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Ermine black spots
  ctx.fillStyle = "#1c1917";
  for (let d = 0; d < 10; d++) {
    const dx = x - size * 0.24 + d * size * 0.055;
    const dy = y + size * capeBot + size * 0.01;
    ctx.beginPath();
    ctx.arc(dx, dy, size * 0.006, 0, TAU);
    ctx.fill();
  }
  // Gold cape border
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.36 - bodyBob);
  ctx.bezierCurveTo(x - size * 0.36, y - size * 0.05, x - size * 0.38, y + size * 0.08, x - size * 0.28, y + size * capeBot);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.36 - bodyBob);
  ctx.bezierCurveTo(x + size * 0.36, y - size * 0.05, x + size * 0.38, y + size * 0.08, x + size * 0.28, y + size * capeBot);
  ctx.stroke();
  // Cape fold lines
  ctx.strokeStyle = "rgba(90, 30, 140, 0.3)";
  ctx.lineWidth = 0.8 * zoom;
  for (let f = 0; f < 3; f++) {
    const fOff = (f - 1) * size * 0.09;
    const fWave = Math.sin(time * 2 + f * 1.4) * size * 0.01;
    ctx.beginPath();
    ctx.moveTo(x + fOff + fWave, y - size * 0.15 - bodyBob);
    ctx.quadraticCurveTo(x + fOff + fWave * 1.5, y + size * 0.02, x + fOff + fWave * 0.5, y + size * 0.18);
    ctx.stroke();
  }

  // ── Legs — tall polished dress boots ──
  drawPathLegs(ctx, x, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: "#1c1917",
    colorDark: "#0d0d0d",
    footColor: "#111111",
    strideSpeed: 2.2,
    strideAmt: 0.24,
    legLen: 0.30,
    width: 0.06,
    style: "armored",
  });

  // ── Magnificent golden robes ──
  const robeGrad = ctx.createLinearGradient(x - size * 0.45, y, x + size * 0.45, y);
  robeGrad.addColorStop(0, "#78350f");
  robeGrad.addColorStop(0.12, "#92400e");
  robeGrad.addColorStop(0.28, "#d97706");
  robeGrad.addColorStop(0.42, "#fbbf24");
  robeGrad.addColorStop(0.5, "#fef3c7");
  robeGrad.addColorStop(0.58, "#fbbf24");
  robeGrad.addColorStop(0.72, "#d97706");
  robeGrad.addColorStop(0.88, "#92400e");
  robeGrad.addColorStop(1, "#78350f");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.42 - bodyBob);
  ctx.quadraticCurveTo(x - size * 0.52, y - size * 0.05, x - size * 0.42, y + size * 0.18);
  for (let i = 0; i < 7; i++) {
    const wX = x - size * 0.42 + i * size * 0.12;
    const wY = y + size * 0.18 + Math.sin(time * 3.5 + i * 1.1) * size * 0.025 + (i % 2) * size * 0.015;
    ctx.lineTo(wX, wY);
  }
  ctx.quadraticCurveTo(x + size * 0.52, y - size * 0.05, x + size * 0.24, y - size * 0.42 - bodyBob);
  ctx.closePath();
  ctx.fill();
  // Robe gold embroidery lines
  ctx.strokeStyle = `rgba(251, 191, 36, ${corruptionPulse * 0.5})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let v = 0; v < 4; v++) {
    const vX = x - size * 0.28 + v * size * 0.19;
    ctx.beginPath();
    ctx.moveTo(vX, y - size * 0.3 - bodyBob * 0.5);
    ctx.bezierCurveTo(vX + Math.sin(time * 1.8 + v) * size * 0.04, y - size * 0.1, vX - Math.cos(time * 2 + v) * size * 0.03, y + size * 0.05, vX + Math.sin(v) * size * 0.05, y + size * 0.16);
    ctx.stroke();
  }
  // Robe ermine hem trim
  ctx.fillStyle = "#f5f0e8";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.16);
  for (let i = 0; i < 7; i++) {
    const wX = x - size * 0.42 + i * size * 0.12;
    ctx.lineTo(wX, y + size * 0.18 + size * 0.025 + Math.sin(time * 3.5 + i * 1.1) * size * 0.015);
  }
  ctx.lineTo(x + size * 0.42, y + size * 0.16);
  ctx.closePath();
  ctx.fill();
  // Ermine black spots on robe hem
  ctx.fillStyle = "#1c1917";
  for (let d = 0; d < 12; d++) {
    const dx = x - size * 0.38 + d * size * 0.065;
    ctx.beginPath();
    ctx.arc(dx, y + size * 0.19, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // Purple velvet inner lining (V-neck visible)
  const innerGrad = ctx.createLinearGradient(x - size * 0.12, y, x + size * 0.12, y);
  innerGrad.addColorStop(0, "#3b0764");
  innerGrad.addColorStop(0.5, "#581c87");
  innerGrad.addColorStop(1, "#3b0764");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.36 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.18 - bodyBob, x + size * 0.14, y - size * 0.36 - bodyBob);
  ctx.lineTo(x + size * 0.1, y + size * 0.08);
  ctx.quadraticCurveTo(x, y + size * 0.14, x - size * 0.1, y + size * 0.08);
  ctx.fill();

  // ── Grand chain of office with Princeton seal ──
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.34 - bodyBob);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.2 - bodyBob, x - size * 0.15, y - size * 0.1 - bodyBob);
  ctx.quadraticCurveTo(x, y + size * 0.02 - bodyBob, x + size * 0.15, y - size * 0.1 - bodyBob);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.2 - bodyBob, x + size * 0.2, y - size * 0.34 - bodyBob);
  ctx.stroke();
  // Chain link details
  ctx.fillStyle = "#fcd34d";
  for (let c = 0; c < 7; c++) {
    const ct = c / 6;
    const cx2 = x - size * 0.18 + ct * size * 0.36;
    const cy2 = y - size * 0.32 + Math.sin(ct * Math.PI) * size * 0.26 - bodyBob;
    ctx.beginPath();
    ctx.arc(cx2, cy2, size * 0.012, 0, TAU);
    ctx.fill();
  }
  // Central medallion
  const medY = y - size * 0.02 - bodyBob;
  ctx.fillStyle = "#fbbf24";
  setShadowBlur(ctx, 6 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(x, medY, size * 0.055, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  // Shield emblem on medallion
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.025, medY - size * 0.03);
  ctx.lineTo(x + size * 0.025, medY - size * 0.03);
  ctx.lineTo(x + size * 0.025, medY + size * 0.01);
  ctx.quadraticCurveTo(x, medY + size * 0.035, x - size * 0.025, medY + size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Chevron on shield
  ctx.strokeStyle = "#f97316";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.015, medY - size * 0.01);
  ctx.lineTo(x, medY + size * 0.01);
  ctx.lineTo(x + size * 0.015, medY - size * 0.01);
  ctx.stroke();

  // ── Ornate gold collar with massive gems ──
  const collarGrad = ctx.createLinearGradient(x - size * 0.22, y - size * 0.38, x + size * 0.22, y - size * 0.2);
  collarGrad.addColorStop(0, "#b8860b");
  collarGrad.addColorStop(0.3, "#fbbf24");
  collarGrad.addColorStop(0.5, "#fef3c7");
  collarGrad.addColorStop(0.7, "#fbbf24");
  collarGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.38 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.26 - bodyBob, x + size * 0.22, y - size * 0.38 - bodyBob);
  ctx.lineTo(x + size * 0.2, y - size * 0.18 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.08 - bodyBob, x - size * 0.2, y - size * 0.18 - bodyBob);
  ctx.fill();
  // Collar filigree
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.30 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.22 - bodyBob, x + size * 0.15, y - size * 0.30 - bodyBob);
  ctx.stroke();
  // Central diamond on collar
  ctx.fillStyle = "#e0f2fe";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.35 - bodyBob);
  ctx.lineTo(x + size * 0.06, y - size * 0.27 - bodyBob);
  ctx.lineTo(x, y - size * 0.17 - bodyBob);
  ctx.lineTo(x - size * 0.06, y - size * 0.27 - bodyBob);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(x - size * 0.015, y - size * 0.29 - bodyBob, size * 0.015, 0, TAU);
  ctx.fill();
  // Side rubies
  ctx.fillStyle = "#ef4444";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * size * 0.14, y - size * 0.29 - bodyBob, size * 0.025, 0, TAU);
    ctx.fill();
  }

  // ── Arms ──
  const armShY = y - size * 0.35 - bodyBob;
  // Left arm — holds a gilded ledger/book
  drawPathArm(ctx, x - size * 0.26, armShY, size, time, zoom, -1, {
    color: "#d97706",
    colorDark: "#92400e",
    handColor: "#fef3c7",
    shoulderAngle: -0.9 + Math.sin(time * 1.5) * 0.06 + (isAttacking ? -attackIntensity * 0.3 : 0),
    elbowAngle: -0.1 + Math.sin(time * 2 + 0.5) * 0.08 + (isAttacking ? -attackIntensity * 0.2 : 0),
    upperLen: 0.2,
    foreLen: 0.18,
    width: 0.06,
    style: "armored",
    onWeapon: (wCtx) => {
      // Gilded ledger book
      const bW = size * 0.08;
      const bH = size * 0.1;
      wCtx.fillStyle = "#7c2d12";
      wCtx.fillRect(-bW * 0.5, -bH, bW, bH);
      wCtx.strokeStyle = "#fbbf24";
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.strokeRect(-bW * 0.5, -bH, bW, bH);
      // Gold clasp
      wCtx.fillStyle = "#fbbf24";
      wCtx.fillRect(-bW * 0.15, -bH * 0.6, bW * 0.3, bH * 0.2);
      // Pages
      wCtx.fillStyle = "#fef9e7";
      wCtx.fillRect(-bW * 0.4, -bH * 0.95, bW * 0.05, bH * 0.9);
      // Gold corner flourishes
      wCtx.fillStyle = "#fbbf24";
      for (const cy of [-bH, 0]) {
        for (const cx2 of [-bW * 0.5, bW * 0.5]) {
          wCtx.beginPath();
          wCtx.arc(cx2, cy, size * 0.008, 0, TAU);
          wCtx.fill();
        }
      }
    },
  });
  // Right arm — holds an ornate golden scepter
  drawPathArm(ctx, x + size * 0.26, armShY, size, time, zoom, 1, {
    color: "#d97706",
    colorDark: "#92400e",
    handColor: "#fef3c7",
    shoulderAngle: -(0.55 + Math.sin(time * 1.5 + Math.PI) * 0.06) + (isAttacking ? -attackIntensity * 0.35 : 0),
    elbowAngle: -0.25 + Math.sin(time * 2 + 2) * 0.05 + (isAttacking ? -attackIntensity * 0.25 : 0),
    upperLen: 0.2,
    foreLen: 0.18,
    width: 0.06,
    style: "armored",
    onWeapon: (wCtx) => {
      // Ornate scepter shaft
      const sW = size * 0.028;
      const sH = size * 0.55;
      const staffGrad = wCtx.createLinearGradient(-sW, 0, sW, 0);
      staffGrad.addColorStop(0, "#92400e");
      staffGrad.addColorStop(0.3, "#fbbf24");
      staffGrad.addColorStop(0.5, "#fef3c7");
      staffGrad.addColorStop(0.7, "#fbbf24");
      staffGrad.addColorStop(1, "#92400e");
      wCtx.fillStyle = staffGrad;
      wCtx.fillRect(-sW, -sH * 0.45, sW * 2, sH);
      // Gold rings along shaft
      wCtx.strokeStyle = "#fcd34d";
      wCtx.lineWidth = 1.5 * zoom;
      for (let i = 0; i < 6; i++) {
        const ry = -sH * 0.4 + i * sH * 0.17;
        wCtx.beginPath();
        wCtx.moveTo(-sW * 1.3, ry);
        wCtx.lineTo(sW * 1.3, ry);
        wCtx.stroke();
      }
      // Crown head with 5 prongs
      wCtx.fillStyle = "#fbbf24";
      wCtx.beginPath();
      wCtx.moveTo(-size * 0.06, -sH * 0.45);
      wCtx.lineTo(-size * 0.05, -sH * 0.45 - size * 0.08);
      wCtx.lineTo(-size * 0.03, -sH * 0.45 - size * 0.04);
      wCtx.lineTo(-size * 0.015, -sH * 0.45 - size * 0.1);
      wCtx.lineTo(0, -sH * 0.45 - size * 0.05);
      wCtx.lineTo(size * 0.015, -sH * 0.45 - size * 0.1);
      wCtx.lineTo(size * 0.03, -sH * 0.45 - size * 0.04);
      wCtx.lineTo(size * 0.05, -sH * 0.45 - size * 0.08);
      wCtx.lineTo(size * 0.06, -sH * 0.45);
      wCtx.closePath();
      wCtx.fill();
      // Jewel orb at top
      const orbY = -sH * 0.45 - size * 0.14;
      wCtx.fillStyle = "#fbbf24";
      setShadowBlur(wCtx, 8 * zoom, "#fbbf24");
      wCtx.beginPath();
      wCtx.arc(0, orbY, size * 0.04, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);
      wCtx.fillStyle = "#7c3aed";
      wCtx.beginPath();
      wCtx.arc(0, orbY, size * 0.025, 0, TAU);
      wCtx.fill();
      wCtx.fillStyle = "rgba(255, 255, 255, 0.45)";
      wCtx.beginPath();
      wCtx.arc(-size * 0.008, orbY - size * 0.008, size * 0.01, 0, TAU);
      wCtx.fill();
      // Bottom pommel
      wCtx.fillStyle = "#fbbf24";
      wCtx.beginPath();
      wCtx.ellipse(0, sH * 0.52, sW * 1.5, sW, 0, 0, TAU);
      wCtx.fill();
    },
  });

  // ── Grand military epaulets with gold tassels ──
  for (const side of [-1, 1]) {
    const epX = x + side * size * 0.24;
    const epY = y - size * 0.36 - bodyBob;
    // Fur pad
    ctx.fillStyle = "#f5f0e8";
    ctx.beginPath();
    ctx.ellipse(epX, epY + size * 0.02, size * 0.075, size * 0.04, side * 0.25, 0, TAU);
    ctx.fill();
    // Gold plate
    const epGrad = ctx.createRadialGradient(epX, epY, 0, epX, epY, size * 0.065);
    epGrad.addColorStop(0, "#fef3c7");
    epGrad.addColorStop(0.4, "#fbbf24");
    epGrad.addColorStop(0.8, "#d97706");
    epGrad.addColorStop(1, "#92400e");
    ctx.fillStyle = epGrad;
    ctx.beginPath();
    ctx.ellipse(epX, epY, size * 0.06, size * 0.038, side * 0.25, 0, TAU);
    ctx.fill();
    // Gold fringe tassels
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1 * zoom;
    for (let t = 0; t < 5; t++) {
      const tAngle = side * (0.4 + t * 0.25);
      const tLen = size * 0.04 + Math.sin(time * 2.5 + t) * size * 0.008;
      ctx.beginPath();
      ctx.moveTo(epX + Math.cos(tAngle) * size * 0.055, epY + Math.sin(tAngle) * size * 0.035);
      ctx.lineTo(epX + Math.cos(tAngle) * size * 0.055 + Math.sin(time * 2 + t) * size * 0.005, epY + Math.sin(tAngle) * size * 0.035 + tLen);
      ctx.stroke();
    }
    // Center jewel
    ctx.fillStyle = "#7c3aed";
    ctx.beginPath();
    ctx.arc(epX, epY, size * 0.013, 0, TAU);
    ctx.fill();
  }

  // ── Distinguished face ──
  drawFaceCircle(ctx, x, y - size * 0.5 - bodyBob, size * 0.24, [
    { offset: 0, color: "#fef9e7" },
    { offset: 0.6, color: "#fef3c7" },
    { offset: 1, color: "#fde68a" },
  ]);

  // Wrinkles of authority
  ctx.strokeStyle = "rgba(180, 140, 100, 0.3)";
  ctx.lineWidth = 1.2 * zoom;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(x + side * size * 0.12, y - size * 0.44 - bodyBob, size * 0.04, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }
  // Furrowed brow
  ctx.strokeStyle = "rgba(160, 120, 80, 0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.58 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.56 - bodyBob, x + size * 0.12, y - size * 0.58 - bodyBob);
  ctx.stroke();

  // Ornate golden monocle
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.52 - bodyBob, size * 0.08, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = `rgba(251, 191, 36, ${goldPulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.52 - bodyBob, size * 0.07, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.beginPath();
  ctx.arc(x + size * 0.08, y - size * 0.54 - bodyBob, size * 0.025, 0, TAU);
  ctx.fill();
  // Monocle chain
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.52 - bodyBob);
  ctx.bezierCurveTo(x + size * 0.24, y - size * 0.42 - bodyBob, x + size * 0.22, y - size * 0.28 - bodyBob, x + size * 0.18, y - size * 0.18 - bodyBob);
  ctx.stroke();

  // Eyes with greed glow
  ctx.fillStyle = "#fef9e7";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.09, y - size * 0.52 - bodyBob, size * 0.045, size * 0.05, 0, 0, TAU);
  ctx.ellipse(x + size * 0.1, y - size * 0.52 - bodyBob, size * 0.04, size * 0.045, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.52 - bodyBob, size * 0.024, 0, TAU);
  ctx.arc(x + size * 0.1, y - size * 0.52 - bodyBob, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.52 - bodyBob, size * 0.01, 0, TAU);
  ctx.arc(x + size * 0.1, y - size * 0.52 - bodyBob, size * 0.009, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 220, 100, ${goldPulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.52 - bodyBob, size * 0.012, 0, TAU);
  ctx.arc(x + size * 0.1, y - size * 0.52 - bodyBob, size * 0.01, 0, TAU);
  ctx.fill();

  // Stern mouth
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.07, y - size * 0.39 - bodyBob);
  ctx.quadraticCurveTo(x, y - size * 0.37 - bodyBob, x + size * 0.07, y - size * 0.39 - bodyBob);
  ctx.stroke();

  // ── Silver-streaked swept-back hair ──
  const hairGrad = ctx.createLinearGradient(x - size * 0.15, y - size * 0.7, x + size * 0.15, y - size * 0.65);
  hairGrad.addColorStop(0, "#6b7280");
  hairGrad.addColorStop(0.3, "#9ca3af");
  hairGrad.addColorStop(0.5, "#d1d5db");
  hairGrad.addColorStop(0.7, "#9ca3af");
  hairGrad.addColorStop(1, "#6b7280");
  ctx.fillStyle = hairGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.66 - bodyBob, size * 0.19, size * 0.1, 0, 0, Math.PI);
  ctx.fill();
  // Individual hair strands
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1 * zoom;
  for (let h = 0; h < 7; h++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.14 + h * size * 0.047, y - size * 0.66 - bodyBob);
    ctx.quadraticCurveTo(
      x - size * 0.12 + h * size * 0.04 + Math.sin(h * 1.2) * size * 0.015,
      y - size * 0.72 - bodyBob,
      x - size * 0.1 + h * size * 0.035,
      y - size * 0.76 - bodyBob,
    );
    ctx.stroke();
  }

  // ── Magnificent top hat ──
  // Brim with gold edge
  ctx.fillStyle = "#0f0f0f";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.72 - bodyBob, size * 0.26, size * 0.065, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2.5 * zoom;
  ctx.stroke();
  // Crown body
  const hatGrad = ctx.createLinearGradient(x - size * 0.17, y - size * 1.05, x + size * 0.17, y - size * 1.05);
  hatGrad.addColorStop(0, "#1c1917");
  hatGrad.addColorStop(0.3, "#374151");
  hatGrad.addColorStop(0.5, "#4b5563");
  hatGrad.addColorStop(0.7, "#374151");
  hatGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = hatGrad;
  ctx.fillRect(x - size * 0.17, y - size * 1.05 - bodyBob, size * 0.34, size * 0.34);
  // Top ellipse
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 1.05 - bodyBob, size * 0.17, size * 0.05, 0, 0, TAU);
  ctx.fill();
  // Silk sheen highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(x - size * 0.05, y - size * 1.02 - bodyBob, size * 0.1, size * 0.28);
  // Jeweled gold band
  const bandGrad = ctx.createLinearGradient(x - size * 0.18, y - size * 0.84, x + size * 0.18, y - size * 0.84);
  bandGrad.addColorStop(0, "#92400e");
  bandGrad.addColorStop(0.3, "#fbbf24");
  bandGrad.addColorStop(0.5, "#fef3c7");
  bandGrad.addColorStop(0.7, "#fbbf24");
  bandGrad.addColorStop(1, "#92400e");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(x - size * 0.18, y - size * 0.84 - bodyBob, size * 0.36, size * 0.065);
  // Gold buckle on band
  ctx.fillStyle = "#fbbf24";
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 1 * zoom;
  ctx.fillRect(x - size * 0.04, y - size * 0.845 - bodyBob, size * 0.08, size * 0.075);
  ctx.strokeRect(x - size * 0.04, y - size * 0.845 - bodyBob, size * 0.08, size * 0.075);
  // Gems flanking buckle
  const gemColors = ["#dc2626", "#059669", "#2563eb"];
  for (let g = 0; g < 3; g++) {
    const gx = x - size * 0.12 + g * size * 0.12;
    if (g === 1) continue;
    ctx.fillStyle = gemColors[g];
    setShadowBlur(ctx, 3 * zoom, gemColors[g]);
    ctx.beginPath();
    ctx.arc(gx, y - size * 0.81 - bodyBob, size * 0.022, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }
  // Center gem on buckle
  ctx.fillStyle = "#7c3aed";
  setShadowBlur(ctx, 4 * zoom, "#7c3aed");
  ctx.beginPath();
  ctx.arc(x, y - size * 0.81 - bodyBob, size * 0.018, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Budget Cuts / Fiery Decree aura
  for (let flame = 0; flame < 3; flame++) {
    const flamePhase = (time * 1.5 + flame * 0.5) % 1.2;
    const flameX = x + Math.sin(time * 2 + flame * 2.1) * size * 0.12;
    const flameY = y + size * 0.3 - flamePhase * size * 0.2;
    const flameAlpha = (1 - flamePhase / 1.2) * 0.2;
    ctx.fillStyle = `rgba(234, 179, 8, ${flameAlpha})`;
    ctx.beginPath();
    ctx.ellipse(flameX, flameY, size * 0.018, size * 0.03, 0, 0, TAU);
    ctx.fill();
  }

  // Golden glow rings around head
  drawPulsingGlowRings(ctx, x, y - size * 0.5 - bodyBob, size * 0.28, time, zoom, {
    color: "rgba(251, 191, 36, 0.4)",
    count: 3,
    speed: 1.0,
    maxAlpha: 0.35,
    expansion: 1.4,
    lineWidth: 1.8,
  });

  // Floating golden segments
  drawShiftingSegments(ctx, x, y - size * 0.6 - bodyBob, size, time, zoom, {
    color: "#fbbf24",
    colorAlt: "#f59e0b",
    count: 5,
    orbitRadius: 0.32,
    segmentSize: 0.03,
    orbitSpeed: 1.0,
    shape: "circle",
  });
}
