import { setShadowBlur, clearShadow } from "../performance";
import {
  drawFaceCircle,
} from "./helpers";

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
  }

  // Blazing chaos aura - more intense
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(34, 211, 238, ${stormPulse * 0.4})`);
  auraGrad.addColorStop(0.3, `rgba(6, 182, 212, ${stormPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(8, 145, 178, ${stormPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
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

  // Shadow pool beneath
  const poolGrad = ctx.createRadialGradient(
    x, y + size * 0.45, size * 0.05,
    x, y + size * 0.45, size * 0.5,
  );
  poolGrad.addColorStop(0, `rgba(30, 27, 75, ${voidPulse * 0.4})`);
  poolGrad.addColorStop(0.6, `rgba(55, 48, 163, ${voidPulse * 0.15})`);
  poolGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.5, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

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
    const tendrilAngle = -Math.PI * 0.8 + t * Math.PI * 0.4 + Math.sin(time * 1.5) * 0.08;
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

  // Shadowy robes with flowing tattered edges
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4, y - size * 0.3,
    x + size * 0.4, y + size * 0.3,
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
      y + size * 0.48 +
      Math.sin(time * 3.5 + i * 1.1) * size * 0.03 +
      (i % 2) * size * 0.04;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.45, y + size * 0.05,
    x + size * 0.18, y - size * 0.32 + bob * 0.3,
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.32 + bob * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.45, y + size * 0.05,
    x - size * 0.38, y + size * 0.48,
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
      veinX + Math.sin(time * 2 + v) * size * 0.05, y + size * 0.05,
      veinX - Math.cos(time * 2 + v) * size * 0.04, y + size * 0.2,
      veinX + Math.sin(v) * size * 0.06, y + size * 0.4,
    );
    ctx.stroke();
  }

  // Arcane rune sigils on robe
  ctx.strokeStyle = `rgba(129, 140, 248, ${runeGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  const runePositions = [
    { rx: -0.12, ry: 0.05 }, { rx: 0.12, ry: 0.1 },
    { rx: -0.05, ry: 0.25 }, { rx: 0.08, ry: 0.32 },
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
    x, y - size * 0.38 + bob * 0.3, size * 0.05,
    x, y - size * 0.38 + bob * 0.3, size * 0.25,
  );
  hoodGrad.addColorStop(0, "#0f0d24");
  hoodGrad.addColorStop(0.5, "#1e1b4b");
  hoodGrad.addColorStop(1, "#312e81");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.ellipse(
    x, y - size * 0.35 + bob * 0.3,
    size * 0.22, size * 0.15, 0, Math.PI, 0,
  );
  ctx.fill();
  // Hood sides draping down
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(x - size * 0.28, y - size * 0.12, x - size * 0.2, y + size * 0.02);
  ctx.lineTo(x - size * 0.14, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.22, x - size * 0.16, y - size * 0.32 + bob * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(x + size * 0.28, y - size * 0.12, x + size * 0.2, y + size * 0.02);
  ctx.lineTo(x + size * 0.14, y - size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.22, x + size * 0.16, y - size * 0.32 + bob * 0.3);
  ctx.fill();

  // Hood peak
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.48 + bob * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.58 + bob * 0.3, x + size * 0.15, y - size * 0.48 + bob * 0.3);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.38, x + size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.lineTo(x - size * 0.22, y - size * 0.35 + bob * 0.3);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.38, x - size * 0.15, y - size * 0.48 + bob * 0.3);
  ctx.fill();

  // Spectral face emerging from hood shadow
  const faceGrad = ctx.createRadialGradient(
    x - size * 0.03, y - size * 0.42 + bob, size * 0.02,
    x, y - size * 0.4 + bob, size * 0.16,
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
    x - size * 0.06, y - size * 0.42 + bob,
    size * 0.04, size * 0.035, -0.1, 0, Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.06, y - size * 0.42 + bob,
    size * 0.04, size * 0.035, 0.1, 0, Math.PI * 2,
  );
  ctx.fill();
  // Inner eye glow
  ctx.fillStyle = `rgba(99, 102, 241, ${eyeFlicker})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.42 + bob, size * 0.022, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.42 + bob, size * 0.022, 0, Math.PI * 2);
  ctx.fill();
  // Eye core bright point
  ctx.fillStyle = `rgba(199, 210, 254, ${eyeFlicker * 0.8})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.42 + bob, size * 0.008, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.42 + bob, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Spectral mouth - thin ethereal line
  ctx.strokeStyle = `rgba(67, 56, 202, ${0.5 + Math.sin(time * 6) * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.33 + bob);
  ctx.quadraticCurveTo(x, y - size * 0.31 + bob, x + size * 0.04, y - size * 0.33 + bob);
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
      handX + handSway, handY - size * 0.05,
      size * 0.08, size * 0.06, side * 0.3, 0, Math.PI * 2,
    );
    ctx.fill();

    // Pale bony hand
    ctx.fillStyle = "#c7d2fe";
    ctx.beginPath();
    ctx.ellipse(
      handX + handSway, handY,
      size * 0.05, size * 0.04, side * 0.2, 0, Math.PI * 2,
    );
    ctx.fill();

    // Fingers
    ctx.strokeStyle = "#a5b4fc";
    ctx.lineWidth = 2 * zoom;
    for (let f = 0; f < 3; f++) {
      const fingerAngle = side * (0.3 + f * 0.25) + Math.sin(time * 3 + f) * 0.1;
      ctx.beginPath();
      ctx.moveTo(handX + handSway + Math.cos(fingerAngle) * size * 0.04, handY + Math.sin(fingerAngle) * size * 0.03);
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
        orbX, orbY, 0,
        orbX, orbY, size * 0.1,
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
      x, y + size * 0.08, 0,
      x, y + size * 0.08, size * attackIntensity * 0.5,
    );
    burstGrad.addColorStop(0, `rgba(199, 210, 254, ${attackIntensity * 0.5})`);
    burstGrad.addColorStop(0.5, `rgba(99, 102, 241, ${attackIntensity * 0.3})`);
    burstGrad.addColorStop(1, "rgba(55, 48, 163, 0)");
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(x, y + size * 0.08, size * attackIntensity * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
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
  // MAMMON'S CHOSEN - Corruption incarnate with gold-blood veins and wealth magic
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const float =
    Math.sin(time * 1.5) * 5 * zoom +
    (isAttacking ? attackIntensity * size * 0.15 : 0);
  const goldPulse = 0.7 + Math.sin(time * 4) * 0.3;
  const wealthAura = 0.5 + Math.sin(time * 3) * 0.3;
  const corruptionPulse = 0.6 + Math.sin(time * 5) * 0.3;
  const greedAura = 0.5 + Math.sin(time * 2.5) * 0.4;

  // Golden corruption tendrils reaching outward
  ctx.save();
  for (let tendril = 0; tendril < 6; tendril++) {
    const tendrilAngle = (tendril * Math.PI) / 3 + time * 0.2;
    ctx.strokeStyle = `rgba(251, 191, 36, ${wealthAura * 0.4})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y);
    let tx = x,
      ty = y;
    for (let seg = 0; seg < 4; seg++) {
      tx +=
        Math.cos(tendrilAngle + Math.sin(time * 2 + seg) * 0.3) * size * 0.15;
      ty +=
        Math.sin(tendrilAngle + Math.sin(time * 2 + seg) * 0.3) * size * 0.12;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }
  ctx.restore();

  // Golden reality distortion field - more elaborate
  ctx.strokeStyle = `rgba(234, 179, 8, ${wealthAura * 0.6})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const ringPhase = (time * 0.6 + i * 0.35) % 2;
    const ringSize = size * 0.4 + ringPhase * size * 0.4;
    ctx.globalAlpha = 0.6 * (1 - ringPhase / 2);
    ctx.beginPath();
    // Irregular ring shape
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const r = ringSize + Math.sin(a * 5 + time * 3) * size * 0.03;
      const rx = x + Math.cos(a) * r;
      const ry = y + Math.sin(a) * r * 0.6;
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Radiant wealth aura with corruption undertones
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.95);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${goldPulse * 0.45})`);
  auraGrad.addColorStop(0.3, `rgba(234, 179, 8, ${goldPulse * 0.3})`);
  auraGrad.addColorStop(0.6, `rgba(146, 64, 14, ${goldPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.95, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting treasure - elaborate display of wealth with magical auras
  for (let i = 0; i < 10; i++) {
    const itemAngle = time * 1.2 + i * Math.PI * 0.2;
    const itemDist = size * 0.58 + Math.sin(time * 2.5 + i) * size * 0.1;
    const itemX = x + Math.cos(itemAngle) * itemDist;
    const itemY =
      y - size * 0.05 + Math.sin(itemAngle) * itemDist * 0.38 + float * 0.25;
    ctx.save();
    ctx.translate(itemX, itemY);
    ctx.rotate(time * 2.5 + i);
    if (i % 4 === 0) {
      // Ancient gold coin with skull (optimized - no shadowBlur)
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.055, size * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1.5 * zoom;
      ctx.stroke();
      ctx.fillStyle = "#78350f";
      ctx.beginPath();
      ctx.arc(0, -size * 0.005, size * 0.015, 0, Math.PI * 2);
      ctx.fill();
    } else if (i % 4 === 1) {
      // Ruby gem (optimized - no shadowBlur)
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.045);
      ctx.lineTo(size * 0.035, 0);
      ctx.lineTo(0, size * 0.045);
      ctx.lineTo(-size * 0.035, 0);
      ctx.fill();
      ctx.fillStyle = "#fca5a5";
      ctx.beginPath();
      ctx.arc(-size * 0.008, -size * 0.012, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    } else if (i % 4 === 2) {
      // Emerald (optimized - no shadowBlur)
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-size * 0.028, -size * 0.04, size * 0.056, size * 0.08);
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(-size * 0.015, -size * 0.028, size * 0.015, size * 0.022);
    } else {
      // Sapphire (optimized - no shadowBlur)
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.04);
      ctx.lineTo(size * 0.03, -size * 0.01);
      ctx.lineTo(size * 0.02, size * 0.03);
      ctx.lineTo(-size * 0.02, size * 0.03);
      ctx.lineTo(-size * 0.03, -size * 0.01);
      ctx.fill();
    }
    ctx.restore();
  }


  // Magnificent golden robes with purple velvet lining and corruption veins
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.5,
    y,
    x + size * 0.5,
    y,
  );
  robeGrad.addColorStop(0, "#78350f");
  robeGrad.addColorStop(0.15, "#92400e");
  robeGrad.addColorStop(0.3, "#d97706");
  robeGrad.addColorStop(0.45, "#fbbf24");
  robeGrad.addColorStop(0.55, "#fcd34d");
  robeGrad.addColorStop(0.7, "#fbbf24");
  robeGrad.addColorStop(0.85, "#d97706");
  robeGrad.addColorStop(1, "#78350f");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.52, y + size * 0.58);
  // Dramatically flowing bottom with tendrils
  for (let i = 0; i < 8; i++) {
    const waveX = x - size * 0.52 + i * size * 0.13;
    const waveY =
      y +
      size * 0.58 +
      Math.sin(time * 4 + i * 1.1) * size * 0.04 +
      (i % 2) * size * 0.025;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.6,
    y - size * 0.1,
    x + size * 0.25,
    y - size * 0.42 + float,
  );
  ctx.lineTo(x - size * 0.25, y - size * 0.42 + float);
  ctx.quadraticCurveTo(
    x - size * 0.6,
    y - size * 0.1,
    x - size * 0.52,
    y + size * 0.58,
  );
  ctx.fill();

  // Gold-blood veins on robe
  ctx.strokeStyle = `rgba(251, 191, 36, ${corruptionPulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let v = 0; v < 5; v++) {
    const veinX = x - size * 0.35 + v * size * 0.175;
    ctx.beginPath();
    ctx.moveTo(veinX, y - size * 0.3 + float * 0.1);
    ctx.bezierCurveTo(
      veinX + Math.sin(time * 2 + v) * size * 0.06,
      y,
      veinX - Math.cos(time * 2 + v) * size * 0.04,
      y + size * 0.2,
      veinX + Math.sin(v) * size * 0.08,
      y + size * 0.45,
    );
    ctx.stroke();
  }

  // Purple velvet inner lining with ornate pattern
  const innerGrad = ctx.createLinearGradient(
    x - size * 0.15,
    y,
    x + size * 0.15,
    y,
  );
  innerGrad.addColorStop(0, "#3b0764");
  innerGrad.addColorStop(0.5, "#581c87");
  innerGrad.addColorStop(1, "#3b0764");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17, y - size * 0.36 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + float,
    x + size * 0.17,
    y - size * 0.36 + float,
  );
  ctx.lineTo(x + size * 0.14, y + size * 0.35);
  ctx.quadraticCurveTo(x, y + size * 0.45, x - size * 0.14, y + size * 0.35);
  ctx.fill();

  // Ornate gold collar with massive gems - more elaborate
  const collarGrad = ctx.createLinearGradient(
    x - size * 0.22,
    y - size * 0.35,
    x + size * 0.22,
    y - size * 0.1,
  );
  collarGrad.addColorStop(0, "#b8860b");
  collarGrad.addColorStop(0.3, "#fbbf24");
  collarGrad.addColorStop(0.5, "#fcd34d");
  collarGrad.addColorStop(0.7, "#fbbf24");
  collarGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.36 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.22 + float,
    x + size * 0.22,
    y - size * 0.36 + float,
  );
  ctx.lineTo(x + size * 0.2, y - size * 0.12 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.02 + float,
    x - size * 0.2,
    y - size * 0.12 + float,
  );
  ctx.fill();
  // Collar filigree
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.28 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.18 + float,
    x + size * 0.15,
    y - size * 0.28 + float,
  );
  ctx.stroke();
  // Central diamond (optimized - no shadowBlur)
  ctx.fillStyle = "#f0f9ff";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32 + float);
  ctx.lineTo(x + size * 0.08, y - size * 0.22 + float);
  ctx.lineTo(x, y - size * 0.1 + float);
  ctx.lineTo(x - size * 0.08, y - size * 0.22 + float);
  ctx.fill();
  // Diamond inner gleam
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.02,
    y - size * 0.24 + float,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Side rubies (optimized - no shadowBlur)
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.14,
    y - size * 0.26 + float,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.14,
    y - size * 0.26 + float,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Distinguished aged face with corruption hints
  drawFaceCircle(ctx, x, y - size * 0.5 + float, size * 0.24, [
    { offset: 0, color: "#fef9e7" },
    { offset: 0.6, color: "#fef3c7" },
    { offset: 1, color: "#fde68a" },
  ]);

  // Gold-blood veins on face
  ctx.strokeStyle = `rgba(251, 191, 36, ${greedAura * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.55 + float);
  ctx.quadraticCurveTo(
    x - size * 0.12,
    y - size * 0.45 + float,
    x - size * 0.18,
    y - size * 0.38 + float,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.55 + float);
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.45 + float,
    x + size * 0.18,
    y - size * 0.38 + float,
  );
  ctx.stroke();

  // Wrinkles of experience and greed
  ctx.strokeStyle = "rgba(180, 140, 100, 0.35)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.13,
    y - size * 0.44 + float,
    size * 0.045,
    0.3,
    Math.PI - 0.3,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.13,
    y - size * 0.44 + float,
    size * 0.045,
    0.3,
    Math.PI - 0.3,
  );
  ctx.stroke();

  // Ornate golden monocle with magic lens
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.11,
    y - size * 0.52 + float,
    size * 0.09,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  // Monocle lens with gold gleam
  ctx.fillStyle = `rgba(251, 191, 36, ${goldPulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    x + size * 0.11,
    y - size * 0.52 + float,
    size * 0.08,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.09,
    y - size * 0.54 + float,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Ornate gold chain
  ctx.strokeStyle = "#d97706";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.52 + float);
  ctx.bezierCurveTo(
    x + size * 0.28,
    y - size * 0.42 + float,
    x + size * 0.26,
    y - size * 0.28 + float,
    x + size * 0.22,
    y - size * 0.18 + float,
  );
  ctx.stroke();

  // Piercing calculating eyes with greed glow
  ctx.fillStyle = "#fef9e7";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.52 + float,
    size * 0.05,
    size * 0.055,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.11,
    y - size * 0.52 + float,
    size * 0.045,
    size * 0.05,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Gold-touched irises
  ctx.fillStyle = "#b8860b";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.09,
    y - size * 0.52 + float,
    size * 0.028,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.11,
    y - size * 0.52 + float,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Pupils with gold gleam
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.09,
    y - size * 0.52 + float,
    size * 0.012,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.11,
    y - size * 0.52 + float,
    size * 0.01,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Eye gleam (greed - optimized no shadowBlur)
  ctx.fillStyle = `rgba(255, 220, 100, ${goldPulse})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.09,
    y - size * 0.52 + float,
    size * 0.014,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.11,
    y - size * 0.52 + float,
    size * 0.012,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Cruel mouth
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.38 + float);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.35 + float,
    x + size * 0.08,
    y - size * 0.38 + float,
  );
  ctx.stroke();

  // Silver streaked hair/receding hairline
  ctx.fillStyle = "#6b7280";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.68 + float,
    size * 0.18,
    size * 0.08,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  ctx.strokeStyle = "#9ca3af";
  ctx.lineWidth = 1.5 * zoom;
  for (let h = 0; h < 5; h++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12 + h * size * 0.06, y - size * 0.68 + float);
    ctx.lineTo(
      x - size * 0.1 + h * size * 0.05 + Math.sin(h) * size * 0.02,
      y - size * 0.75 + float,
    );
    ctx.stroke();
  }

  // Magnificent top hat with jeweled band - even more elaborate
  ctx.fillStyle = "#0f0f0f";
  // Brim with gold edge
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.72 + float,
    size * 0.26,
    size * 0.07,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Crown
  const hatGrad = ctx.createLinearGradient(
    x - size * 0.17,
    y - size * 1.0,
    x + size * 0.17,
    y - size * 1.0,
  );
  hatGrad.addColorStop(0, "#1c1917");
  hatGrad.addColorStop(0.5, "#374151");
  hatGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = hatGrad;
  ctx.fillRect(
    x - size * 0.17,
    y - size * 1.0 + float,
    size * 0.34,
    size * 0.3,
  );
  // Top
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 1.0 + float,
    size * 0.17,
    size * 0.05,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Jeweled gold band
  const bandGrad = ctx.createLinearGradient(
    x - size * 0.18,
    y - size * 0.82,
    x + size * 0.18,
    y - size * 0.82,
  );
  bandGrad.addColorStop(0, "#b8860b");
  bandGrad.addColorStop(0.5, "#fbbf24");
  bandGrad.addColorStop(1, "#b8860b");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(
    x - size * 0.18,
    y - size * 0.82 + float,
    size * 0.36,
    size * 0.07,
  );
  // Gems on band - larger and more elaborate
  ctx.fillStyle = "#dc2626";
  setShadowBlur(ctx, 4 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1,
    y - size * 0.785 + float,
    size * 0.028,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = "#059669";
  setShadowBlur(ctx, 4 * zoom, "#10b981");
  ctx.beginPath();
  ctx.arc(x, y - size * 0.785 + float, size * 0.028, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = "#2563eb";
  setShadowBlur(ctx, 4 * zoom, "#3b82f6");
  ctx.beginPath();
  ctx.arc(
    x + size * 0.1,
    y - size * 0.785 + float,
    size * 0.028,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Ornate staff of wealth (scepter) - more elaborate
  ctx.save();
  ctx.translate(x - size * 0.5, y - size * 0.15 + float);
  ctx.rotate(-0.22 + Math.sin(time * 2.2) * 0.06);
  // Staff body (ebony with gold inlay)
  const staffBodyGrad = ctx.createLinearGradient(
    -size * 0.035,
    0,
    size * 0.035,
    0,
  );
  staffBodyGrad.addColorStop(0, "#1c1917");
  staffBodyGrad.addColorStop(0.5, "#374151");
  staffBodyGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = staffBodyGrad;
  ctx.fillRect(-size * 0.035, -size * 0.45, size * 0.07, size * 0.9);
  // Gold spiral inlay
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.035, -size * 0.4 + i * size * 0.09);
    ctx.lineTo(size * 0.035, -size * 0.35 + i * size * 0.09);
    ctx.stroke();
  }
  // Gold rings
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(-size * 0.045, -size * 0.45, size * 0.09, size * 0.04);
  ctx.fillRect(-size * 0.045, size * 0.35, size * 0.09, size * 0.04);
  // Crown top with elaborate design
  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.moveTo(-size * 0.09, -size * 0.45);
  ctx.lineTo(-size * 0.07, -size * 0.58);
  ctx.lineTo(-size * 0.03, -size * 0.52);
  ctx.lineTo(0, -size * 0.62);
  ctx.lineTo(size * 0.03, -size * 0.52);
  ctx.lineTo(size * 0.07, -size * 0.58);
  ctx.lineTo(size * 0.09, -size * 0.45);
  ctx.closePath();
  ctx.fill();
  // Legendary gem - soul-capturing
  ctx.fillStyle = "#fbbf24";
  setShadowBlur(ctx, 15 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(0, -size * 0.68, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Inner glow
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.arc(-size * 0.025, -size * 0.7, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Swirling souls inside gem
  ctx.strokeStyle = `rgba(120, 53, 15, ${corruptionPulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.68, size * 0.05, time * 4, time * 4 + Math.PI);
  ctx.stroke();
  clearShadow(ctx);
  ctx.restore();
}
