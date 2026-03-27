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
  const corruptPulse = 0.6 + Math.sin(time * 5) * 0.3;

  const goldBright = "#fbbf24";
  const goldMid = "#d97706";
  const goldDark = "#92400e";
  const goldPale = "#fef3c7";
  const deepPurple = "#3b0764";
  const royalPurple = "#581c87";
  const darkNavy = "#0c0a20";
  const obsidian = "#0a0a14";

  // === DIVINE AUTHORITY AURA ===
  const auraGrad = ctx.createRadialGradient(x, y - size * 0.1, 0, x, y - size * 0.1, size * 0.9);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.22})`);
  auraGrad.addColorStop(0.35, `rgba(234, 179, 8, ${goldPulse * 0.1})`);
  auraGrad.addColorStop(0.65, `rgba(88, 28, 135, ${goldPulse * 0.06})`);
  auraGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.9, size * 0.65 * ISO_Y_RATIO, 0, 0, TAU);
  ctx.fill();

  // Slow-orbiting golden sigils
  for (let i = 0; i < 6; i++) {
    const sAngle = time * 0.6 + i * TAU / 6;
    const sR = size * 0.55 + Math.sin(time * 1.5 + i * 1.3) * size * 0.06;
    const sx = x + Math.cos(sAngle) * sR;
    const sy = y - size * 0.12 + Math.sin(sAngle) * sR * 0.3;
    const sAlpha = 0.15 + Math.sin(time * 2.5 + i * 1.1) * 0.1;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(time * 1.2 + i);
    setShadowBlur(ctx, 4 * zoom, goldBright);
    ctx.strokeStyle = `rgba(251, 191, 36, ${sAlpha})`;
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
  const mantleGrad = ctx.createLinearGradient(x, y - size * 0.4, x, y + size * 0.32);
  mantleGrad.addColorStop(0, "#2d1050");
  mantleGrad.addColorStop(0.2, deepPurple);
  mantleGrad.addColorStop(0.5, royalPurple);
  mantleGrad.addColorStop(0.75, deepPurple);
  mantleGrad.addColorStop(1, "#1a0a2e");
  ctx.fillStyle = mantleGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.38 - bodyBob);
  ctx.bezierCurveTo(
    x - size * 0.42, y - size * 0.08,
    x - size * 0.44, y + size * 0.1,
    x - size * 0.34, y + size * 0.28,
  );
  for (let t = 0; t < 10; t++) {
    const tx = x - size * 0.34 + t * size * 0.068;
    const billow = Math.sin(time * 1.8 + t * 0.8) * size * 0.015;
    const dip = (t % 2 === 0) ? size * 0.025 : 0;
    ctx.lineTo(tx, y + size * 0.30 + billow + dip);
  }
  ctx.bezierCurveTo(
    x + size * 0.44, y + size * 0.1,
    x + size * 0.42, y - size * 0.08,
    x + size * 0.2, y - size * 0.38 - bodyBob,
  );
  ctx.closePath();
  ctx.fill();

  // Ermine lining band at mantle bottom
  ctx.fillStyle = "#f5f0e8";
  ctx.beginPath();
  for (let t = 0; t < 10; t++) {
    const tx = x - size * 0.34 + t * size * 0.068;
    const billow = Math.sin(time * 1.8 + t * 0.8) * size * 0.015;
    const dip = (t % 2 === 0) ? size * 0.025 : 0;
    if (t === 0) ctx.moveTo(tx, y + size * 0.28 + billow + dip);
    else ctx.lineTo(tx, y + size * 0.28 + billow + dip);
  }
  for (let t = 9; t >= 0; t--) {
    const tx = x - size * 0.34 + t * size * 0.068;
    const billow = Math.sin(time * 1.8 + t * 0.8) * size * 0.015;
    const dip = (t % 2 === 0) ? size * 0.025 : 0;
    ctx.lineTo(tx, y + size * 0.30 + billow + dip + size * 0.025);
  }
  ctx.closePath();
  ctx.fill();
  // Ermine spots
  ctx.fillStyle = "#1a0a0a";
  for (let d = 0; d < 14; d++) {
    const dx = x - size * 0.32 + d * size * 0.048;
    const dy = y + size * 0.30 + Math.sin(time * 1.8 + d * 0.55) * size * 0.008;
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
      x + side * size * 0.42, y - size * 0.08,
      x + side * size * 0.44, y + size * 0.1,
      x + side * size * 0.34, y + size * 0.28,
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
      y + size * 0.22,
    );
    ctx.stroke();
  }

  // === LEGS — heavy gilded war greaves ===
  drawPathLegs(ctx, x, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: "#2a2040",
    colorDark: "#1a1030",
    footColor: goldDark,
    strideSpeed: 2.0,
    strideAmt: 0.18,
    legLen: 0.28,
    width: 0.075,
    style: "armored",
  });

  // === TORSO — heavy ornate plate armor ===
  const torsoTop = y - size * 0.42 - bodyBob;
  const torsoBot = y + size * 0.06 - bodyBob;

  // Base dark plate
  const plateGrad = ctx.createLinearGradient(x - size * 0.22, torsoTop, x + size * 0.22, torsoBot);
  plateGrad.addColorStop(0, "#1a1030");
  plateGrad.addColorStop(0.15, "#2a2048");
  plateGrad.addColorStop(0.4, "#3a2860");
  plateGrad.addColorStop(0.6, "#2a2048");
  plateGrad.addColorStop(0.85, "#1a1030");
  plateGrad.addColorStop(1, "#0e0820");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, torsoTop);
  ctx.quadraticCurveTo(x - size * 0.27, y - size * 0.12 - bodyBob, x - size * 0.2, torsoBot);
  ctx.lineTo(x + size * 0.2, torsoBot);
  ctx.quadraticCurveTo(x + size * 0.27, y - size * 0.12 - bodyBob, x + size * 0.22, torsoTop);
  ctx.closePath();
  ctx.fill();

  // Gold trim edges on breastplate
  ctx.strokeStyle = goldBright;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, torsoTop);
  ctx.quadraticCurveTo(x - size * 0.27, y - size * 0.12 - bodyBob, x - size * 0.2, torsoBot);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, torsoTop);
  ctx.quadraticCurveTo(x + size * 0.27, y - size * 0.12 - bodyBob, x + size * 0.2, torsoBot);
  ctx.stroke();

  // Raised center plate with Princeton shield
  const cpGrad = ctx.createRadialGradient(x, y - size * 0.2 - bodyBob, 0, x, y - size * 0.2 - bodyBob, size * 0.15);
  cpGrad.addColorStop(0, "#3a2860");
  cpGrad.addColorStop(0.6, "#2a1848");
  cpGrad.addColorStop(1, "#1a1030");
  ctx.fillStyle = cpGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, torsoTop + size * 0.04);
  ctx.lineTo(x + size * 0.1, torsoTop + size * 0.04);
  ctx.lineTo(x + size * 0.08, torsoBot - size * 0.02);
  ctx.quadraticCurveTo(x, torsoBot + size * 0.02, x - size * 0.08, torsoBot - size * 0.02);
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
  ctx.quadraticCurveTo(x, embY + size * 0.055, x - size * 0.04, embY + size * 0.015);
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
      ctx.arc(sx, sy, size * 0.015, side > 0 ? 0 : Math.PI, side > 0 ? Math.PI : TAU);
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
    ctx.quadraticCurveTo(pX, skirtY + pH + size * 0.01, pX - pW * 0.4, skirtY + pH);
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
    ctx.arc(buckCX + side * size * 0.004, buckCY - size * 0.005, size * 0.003, 0, TAU);
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
  const gorgetGrad = ctx.createLinearGradient(x - size * 0.24, torsoTop - size * 0.04, x + size * 0.24, torsoTop + size * 0.06);
  gorgetGrad.addColorStop(0, goldDark);
  gorgetGrad.addColorStop(0.2, goldMid);
  gorgetGrad.addColorStop(0.5, goldBright);
  gorgetGrad.addColorStop(0.8, goldMid);
  gorgetGrad.addColorStop(1, goldDark);
  ctx.fillStyle = gorgetGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, torsoTop - size * 0.02);
  ctx.quadraticCurveTo(x - size * 0.18, torsoTop - size * 0.08, x - size * 0.08, torsoTop - size * 0.06);
  ctx.quadraticCurveTo(x, torsoTop + size * 0.02, x + size * 0.08, torsoTop - size * 0.06);
  ctx.quadraticCurveTo(x + size * 0.18, torsoTop - size * 0.08, x + size * 0.24, torsoTop - size * 0.02);
  ctx.lineTo(x + size * 0.22, torsoTop + size * 0.03);
  ctx.quadraticCurveTo(x, torsoTop + size * 0.1, x - size * 0.22, torsoTop + size * 0.03);
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
    ctx.arc(x + side * size * 0.14, torsoTop - size * 0.03, size * 0.01, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // === ARMS ===
  const armShY = y - size * 0.36 - bodyBob;

  // Left arm — gilded tower shield
  drawPathArm(ctx, x - size * 0.26, armShY, size, time, zoom, -1, {
    color: "#2a2048",
    colorDark: "#1a1030",
    handColor: "#5a4878",
    shoulderAngle: -0.7 + Math.sin(time * 1.3) * 0.04 + (isAttacking ? -attackIntensity * 0.2 : 0),
    elbowAngle: -0.2 + Math.sin(time * 1.8 + 0.5) * 0.05 + (isAttacking ? -attackIntensity * 0.15 : 0),
    upperLen: 0.17,
    foreLen: 0.14,
    width: 0.065,
    style: "armored",
    onWeapon: (wCtx) => {
      wCtx.translate(0, size * 0.04);
      wCtx.scale(-1, 1);
      const shW = size * 0.14;
      const shH = size * 0.22;

      // Shield body
      const shGrad = wCtx.createLinearGradient(-shW, -shH * 0.5, shW, shH * 0.5);
      shGrad.addColorStop(0, "#1a1030");
      shGrad.addColorStop(0.3, "#2a2048");
      shGrad.addColorStop(0.5, "#3a2860");
      shGrad.addColorStop(0.7, "#2a2048");
      shGrad.addColorStop(1, "#1a1030");
      wCtx.fillStyle = shGrad;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH);
      wCtx.quadraticCurveTo(shW * 0.6, -shH * 0.8, shW, -shH * 0.3);
      wCtx.quadraticCurveTo(shW * 0.9, shH * 0.3, 0, shH);
      wCtx.quadraticCurveTo(-shW * 0.9, shH * 0.3, -shW, -shH * 0.3);
      wCtx.quadraticCurveTo(-shW * 0.6, -shH * 0.8, 0, -shH);
      wCtx.closePath();
      wCtx.fill();

      // Gold rim
      wCtx.strokeStyle = goldBright;
      wCtx.lineWidth = 1.5 * zoom;
      wCtx.stroke();

      // Shield boss
      const bossGrad = wCtx.createRadialGradient(0, 0, 0, 0, 0, size * 0.03);
      bossGrad.addColorStop(0, goldPale);
      bossGrad.addColorStop(0.5, goldBright);
      bossGrad.addColorStop(1, goldDark);
      wCtx.fillStyle = bossGrad;
      wCtx.beginPath();
      wCtx.arc(0, 0, size * 0.03, 0, TAU);
      wCtx.fill();

      // Gold cross on shield
      wCtx.strokeStyle = goldBright;
      wCtx.lineWidth = 2 * zoom;
      wCtx.beginPath();
      wCtx.moveTo(0, -shH * 0.65);
      wCtx.lineTo(0, shH * 0.65);
      wCtx.stroke();
      wCtx.beginPath();
      wCtx.moveTo(-shW * 0.65, 0);
      wCtx.lineTo(shW * 0.65, 0);
      wCtx.stroke();

      // Corner rivets
      const rivetPositions = [
        { x: 0, y: -shH * 0.7 }, { x: shW * 0.6, y: -shH * 0.15 },
        { x: 0, y: shH * 0.7 }, { x: -shW * 0.6, y: -shH * 0.15 },
      ];
      wCtx.fillStyle = goldMid;
      for (const rv of rivetPositions) {
        wCtx.beginPath();
        wCtx.arc(rv.x, rv.y, size * 0.006, 0, TAU);
        wCtx.fill();
      }
    },
  });

  // Right arm — golden war-mace
  drawPathArm(ctx, x + size * 0.26, armShY, size, time, zoom, 1, {
    color: "#2a2048",
    colorDark: "#1a1030",
    handColor: "#5a4878",
    shoulderAngle: -(0.55 + Math.sin(time * 1.3 + Math.PI) * 0.04) + (isAttacking ? -attackIntensity * 0.5 : 0),
    elbowAngle: -0.35 + Math.sin(time * 1.8 + 2) * 0.03 + (isAttacking ? -attackIntensity * 0.4 : 0),
    upperLen: 0.17,
    foreLen: 0.14,
    width: 0.065,
    style: "armored",
    weaponAngle: -0.5,
    onWeapon: (wCtx) => {
      const sH = size * 0.5;
      const sW = size * 0.016;

      // War-mace shaft
      const shaftGrad = wCtx.createLinearGradient(-sW, 0, sW, 0);
      shaftGrad.addColorStop(0, goldDark);
      shaftGrad.addColorStop(0.3, goldBright);
      shaftGrad.addColorStop(0.5, goldPale);
      shaftGrad.addColorStop(0.7, goldBright);
      shaftGrad.addColorStop(1, goldDark);
      wCtx.fillStyle = shaftGrad;
      wCtx.fillRect(-sW, -sH * 0.35, sW * 2, sH * 0.9);

      // Grip wrap
      wCtx.fillStyle = "#3a1808";
      wCtx.fillRect(-sW * 1.3, -size * 0.02, sW * 2.6, size * 0.1);
      wCtx.strokeStyle = goldBright;
      wCtx.lineWidth = 0.6 * zoom;
      for (let w = 0; w < 6; w++) {
        const wy = -size * 0.015 + w * size * 0.018;
        wCtx.beginPath();
        wCtx.moveTo(-sW * 1.2, wy);
        wCtx.lineTo(sW * 1.2, wy - size * 0.007);
        wCtx.stroke();
      }

      // Gold ring nodes
      wCtx.fillStyle = goldPale;
      for (let r = 0; r < 3; r++) {
        const ry = -sH * 0.1 - r * sH * 0.2;
        wCtx.beginPath();
        wCtx.ellipse(0, ry, sW * 1.8, size * 0.006, 0, 0, TAU);
        wCtx.fill();
      }

      // Mace head — 6-flanged gold/obsidian war head
      const mhY = -sH * 0.35;
      const mhR = size * 0.055;
      for (let f = 0; f < 6; f++) {
        const fAngle = f * TAU / 6 - Math.PI / 2;
        const fR = mhR * 1.4;
        wCtx.fillStyle = f % 2 === 0 ? goldBright : goldMid;
        wCtx.beginPath();
        wCtx.moveTo(0, mhY);
        wCtx.lineTo(
          Math.cos(fAngle - 0.2) * mhR * 0.5,
          mhY + Math.sin(fAngle - 0.2) * mhR * 0.5,
        );
        wCtx.lineTo(
          Math.cos(fAngle) * fR,
          mhY + Math.sin(fAngle) * fR,
        );
        wCtx.lineTo(
          Math.cos(fAngle + 0.2) * mhR * 0.5,
          mhY + Math.sin(fAngle + 0.2) * mhR * 0.5,
        );
        wCtx.closePath();
        wCtx.fill();
      }

      // Mace core
      const coreGrad = wCtx.createRadialGradient(0, mhY, 0, 0, mhY, mhR * 0.5);
      coreGrad.addColorStop(0, goldPale);
      coreGrad.addColorStop(0.5, goldBright);
      coreGrad.addColorStop(1, goldMid);
      wCtx.fillStyle = coreGrad;
      wCtx.beginPath();
      wCtx.arc(0, mhY, mhR * 0.45, 0, TAU);
      wCtx.fill();

      // Glowing amethyst inset
      setShadowBlur(wCtx, 8 * zoom, "#7c3aed");
      wCtx.fillStyle = "#7c3aed";
      wCtx.beginPath();
      wCtx.arc(0, mhY, mhR * 0.2, 0, TAU);
      wCtx.fill();
      clearShadow(wCtx);

      // Bottom pommel
      wCtx.fillStyle = goldBright;
      wCtx.beginPath();
      wCtx.ellipse(0, sH * 0.53, sW * 2, sW * 1.2, 0, 0, TAU);
      wCtx.fill();
    },
  });

  // === MASSIVE LAYERED PAULDRONS ===
  for (const side of [-1, 1]) {
    const epX = x + side * size * 0.24;
    const epY = y - size * 0.38 - bodyBob;

    // Bottom plate
    const p1Grad = ctx.createRadialGradient(epX, epY + size * 0.02, 0, epX, epY + size * 0.02, size * 0.09);
    p1Grad.addColorStop(0, "#3a2860");
    p1Grad.addColorStop(0.6, "#2a2048");
    p1Grad.addColorStop(1, "#1a1030");
    ctx.fillStyle = p1Grad;
    ctx.beginPath();
    ctx.ellipse(epX + side * size * 0.01, epY + size * 0.02, size * 0.09, size * 0.05, side * 0.25, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = goldMid;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();

    // Top plate (overlapping)
    const p2Grad = ctx.createRadialGradient(epX, epY - size * 0.01, 0, epX, epY - size * 0.01, size * 0.075);
    p2Grad.addColorStop(0, goldBright);
    p2Grad.addColorStop(0.4, goldMid);
    p2Grad.addColorStop(1, goldDark);
    ctx.fillStyle = p2Grad;
    ctx.beginPath();
    ctx.ellipse(epX, epY - size * 0.01, size * 0.075, size * 0.045, side * 0.2, 0, TAU);
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
  ctx.quadraticCurveTo(headX, headY + size * 0.14, headX + size * 0.08, headY + size * 0.1);
  ctx.lineTo(headX + size * 0.06, headY + size * 0.06);
  ctx.quadraticCurveTo(headX, headY + size * 0.08, headX - size * 0.06, headY + size * 0.06);
  ctx.closePath();
  ctx.fill();

  // Face — corrupted monstrous visage visible through helm opening
  const faceGrad = ctx.createRadialGradient(headX, headY + size * 0.01, 0, headX, headY + size * 0.01, size * 0.09);
  faceGrad.addColorStop(0, "#4a3060");
  faceGrad.addColorStop(0.4, "#3a1848");
  faceGrad.addColorStop(0.7, "#2a0838");
  faceGrad.addColorStop(1, "#1a0028");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.01, size * 0.09, size * 0.1, 0, 0, TAU);
  ctx.fill();

  // Corruption cracks across face
  ctx.strokeStyle = `rgba(200, 100, 255, ${0.3 + corruptPulse * 0.2})`;
  ctx.lineWidth = 0.6 * zoom;
  for (let c = 0; c < 5; c++) {
    const cStartX = headX + (Math.random() * 2 - 1) * size * 0.05;
    const cAngle = -1.2 + c * 0.6;
    ctx.beginPath();
    ctx.moveTo(headX + Math.cos(cAngle) * size * 0.02, headY + Math.sin(cAngle) * size * 0.02);
    for (let s = 0; s < 3; s++) {
      ctx.lineTo(
        headX + Math.cos(cAngle + s * 0.3) * size * (0.04 + s * 0.02),
        headY + Math.sin(cAngle + s * 0.3) * size * (0.04 + s * 0.02),
      );
    }
    ctx.stroke();
  }

  // Sunken burning eye sockets
  for (const side of [-1, 1]) {
    const eyeX = headX + side * size * 0.04;
    const eyeY = headY - size * 0.01;

    // Deep socket
    ctx.fillStyle = "#0a0014";
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.025, size * 0.02, side * 0.15, 0, TAU);
    ctx.fill();

    // Burning gold-purple iris
    setShadowBlur(ctx, 10 * zoom, goldBright);
    const eyeGrad = ctx.createRadialGradient(eyeX, eyeY, 0, eyeX, eyeY, size * 0.018);
    eyeGrad.addColorStop(0, `rgba(255, 240, 200, ${goldPulse})`);
    eyeGrad.addColorStop(0.3, `rgba(251, 191, 36, ${goldPulse * 0.9})`);
    eyeGrad.addColorStop(0.7, `rgba(180, 80, 255, ${goldPulse * 0.6})`);
    eyeGrad.addColorStop(1, `rgba(60, 0, 100, ${goldPulse * 0.3})`);
    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, size * 0.016, 0, TAU);
    ctx.fill();

    // Vertical slit pupil
    ctx.fillStyle = `rgba(10, 0, 20, ${goldPulse * 0.8})`;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, size * 0.003, size * 0.012, 0, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Jagged fanged maw
  ctx.fillStyle = "#0a0014";
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.055, size * 0.04, size * 0.02, 0, 0, TAU);
  ctx.fill();

  // Upper fangs
  ctx.fillStyle = "#d4c8a0";
  for (let f = 0; f < 4; f++) {
    const fx = headX - size * 0.025 + f * size * 0.017;
    const fH = (f === 1 || f === 2) ? size * 0.025 : size * 0.015;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.004, headY + size * 0.04);
    ctx.lineTo(fx, headY + size * 0.04 + fH);
    ctx.lineTo(fx + size * 0.004, headY + size * 0.04);
    ctx.fill();
  }
  // Lower fangs
  for (let f = 0; f < 3; f++) {
    const fx = headX - size * 0.018 + f * size * 0.018;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.003, headY + size * 0.07);
    ctx.lineTo(fx, headY + size * 0.07 - size * 0.012);
    ctx.lineTo(fx + size * 0.003, headY + size * 0.07);
    ctx.fill();
  }

  // Drool/corruption drip from mouth
  setShadowBlur(ctx, 3 * zoom, "#7c3aed");
  ctx.fillStyle = `rgba(120, 50, 200, ${0.3 + corruptPulse * 0.2})`;
  for (let d = 0; d < 2; d++) {
    const dx = headX + (d - 0.5) * size * 0.03;
    const dLen = size * 0.02 + Math.sin(time * 3 + d * 2) * size * 0.008;
    ctx.beginPath();
    ctx.ellipse(dx, headY + size * 0.075 + dLen * 0.5, size * 0.003, dLen, 0, 0, TAU);
    ctx.fill();
  }
  clearShadow(ctx);

  // === GREAT HELM — ornate golden war-crown helm ===
  const helmY = headY - size * 0.04;

  // Main helm shell
  const helmGrad = ctx.createLinearGradient(headX - size * 0.14, helmY - size * 0.15, headX + size * 0.14, helmY + size * 0.08);
  helmGrad.addColorStop(0, "#1a1030");
  helmGrad.addColorStop(0.15, "#2a2048");
  helmGrad.addColorStop(0.4, "#3a2860");
  helmGrad.addColorStop(0.6, "#2a2048");
  helmGrad.addColorStop(0.85, "#1a1030");
  helmGrad.addColorStop(1, "#0e0820");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, headY + size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.16, helmY - size * 0.06, headX - size * 0.12, helmY - size * 0.14);
  ctx.quadraticCurveTo(headX, helmY - size * 0.2, headX + size * 0.12, helmY - size * 0.14);
  ctx.quadraticCurveTo(headX + size * 0.16, helmY - size * 0.06, headX + size * 0.14, headY + size * 0.04);
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
    ctx.quadraticCurveTo(headX + side * size * 0.12, helmY - size * 0.02, headX + side * size * 0.1, headY + size * 0.04);
    ctx.stroke();
  }

  // Ornate gold crown band integrated into helm
  const crownBandY = helmY - size * 0.08;
  const cbGrad = ctx.createLinearGradient(headX - size * 0.14, crownBandY, headX + size * 0.14, crownBandY);
  cbGrad.addColorStop(0, goldDark);
  cbGrad.addColorStop(0.2, goldBright);
  cbGrad.addColorStop(0.5, goldPale);
  cbGrad.addColorStop(0.8, goldBright);
  cbGrad.addColorStop(1, goldDark);
  ctx.fillStyle = cbGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.14, crownBandY);
  ctx.quadraticCurveTo(headX, crownBandY + size * 0.02, headX + size * 0.14, crownBandY);
  ctx.lineTo(headX + size * 0.13, crownBandY + size * 0.03);
  ctx.quadraticCurveTo(headX, crownBandY + size * 0.05, headX - size * 0.13, crownBandY + size * 0.03);
  ctx.closePath();
  ctx.fill();

  // Crown points rising from helm
  for (let p = 0; p < 7; p++) {
    const px = headX - size * 0.12 + p * size * 0.04;
    const pointH = (p === 3) ? size * 0.08 : (p === 2 || p === 4) ? size * 0.06 : (p === 1 || p === 5) ? size * 0.04 : size * 0.025;
    ctx.fillStyle = goldBright;
    ctx.beginPath();
    ctx.moveTo(px - size * 0.008, crownBandY);
    ctx.lineTo(px, crownBandY - pointH);
    ctx.lineTo(px + size * 0.008, crownBandY);
    ctx.closePath();
    ctx.fill();
  }

  // Gems in crown band
  const helmGems = ["#dc2626", "#059669", "#2563eb", "#7c3aed", "#2563eb", "#059669", "#dc2626"];
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
    const hornGrad = ctx.createLinearGradient(0, 0, side * size * 0.12, -size * 0.18);
    hornGrad.addColorStop(0, goldMid);
    hornGrad.addColorStop(0.4, goldBright);
    hornGrad.addColorStop(0.7, goldMid);
    hornGrad.addColorStop(1, goldDark);
    ctx.fillStyle = hornGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(side * size * 0.06, -size * 0.06, side * size * 0.12, -size * 0.16);
    ctx.quadraticCurveTo(side * size * 0.13, -size * 0.18, side * size * 0.14, -size * 0.22);
    ctx.quadraticCurveTo(side * size * 0.08, -size * 0.1, size * 0.005, size * 0.005);
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
  const mondeGrad = ctx.createRadialGradient(headX, mondeY, 0, headX, mondeY, size * 0.025);
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
  ctx.fillRect(headX - size * 0.003, mondeY - size * 0.04, size * 0.006, size * 0.03);
  ctx.fillRect(headX - size * 0.012, mondeY - size * 0.035, size * 0.024, size * 0.006);

  // Amethyst in monde
  ctx.fillStyle = "#7c3aed";
  ctx.beginPath();
  ctx.arc(headX, mondeY, size * 0.012, 0, TAU);
  ctx.fill();

  // === ATTACK EFFECTS ===
  if (isAttacking) {
    const shockR = size * 0.3 + attackIntensity * size * 0.5;
    ctx.strokeStyle = `rgba(251, 191, 36, ${attackIntensity * 0.5})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.1, shockR, shockR * 0.4, 0, 0, TAU);
    ctx.stroke();

    // Corruption burst from eyes
    for (const side of [-1, 1]) {
      setShadowBlur(ctx, 6 * zoom, "#7c3aed");
      ctx.strokeStyle = `rgba(200, 100, 255, ${attackIntensity * 0.6})`;
      ctx.lineWidth = 1.5 * zoom;
      const beamLen = size * 0.15 * attackIntensity;
      ctx.beginPath();
      ctx.moveTo(headX + side * size * 0.04, headY - size * 0.01);
      ctx.lineTo(headX + side * (size * 0.04 + beamLen), headY - size * 0.01 + beamLen * 0.3);
      ctx.stroke();
      clearShadow(ctx);
    }
  }

  // === AUTHORITY HALO ===
  drawPulsingGlowRings(ctx, headX, helmY - size * 0.06, size * 0.22, time, zoom, {
    color: "rgba(251, 191, 36, 0.3)",
    count: 2,
    speed: 0.7,
    maxAlpha: 0.3,
    expansion: 1.4,
    lineWidth: 1.8,
  });

  // Floating golden motes
  for (let m = 0; m < 6; m++) {
    const mPhase = time * 0.8 + m * TAU / 6;
    const mR = size * 0.4 + Math.sin(time * 1.5 + m * 1.3) * size * 0.06;
    const mx = x + Math.cos(mPhase) * mR;
    const my = y - size * 0.15 + Math.sin(mPhase) * mR * 0.3 - bodyBob;
    const mAlpha = 0.25 + Math.sin(time * 3 + m * 1.7) * 0.15;
    ctx.fillStyle = `rgba(251, 191, 36, ${mAlpha})`;
    ctx.beginPath();
    ctx.arc(mx, my, size * 0.006, 0, TAU);
    ctx.fill();
  }
}
