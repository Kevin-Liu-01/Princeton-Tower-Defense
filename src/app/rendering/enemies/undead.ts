// Princeton Tower Defense - Undead/Dark Enemy Sprite Functions
// Extracted from enemies/index.ts: Specter, Berserker, Golem, Necromancer, Shadow Knight, Cultist, Plaguebearer

import {
  drawRadialAura,
  drawRobeBody,
} from "./helpers";
import { setShadowBlur, clearShadow } from "../performance";

export function drawSpecterEnemy(
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
  // SPECTER - Tormented Soul, Ethereal Horror from Beyond the Veil
  // A terrifying ghostly apparition wreathed in ectoplasmic energy
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const phase =
    Math.sin(time * 2) * 5 * zoom +
    (isAttacking ? attackIntensity * size * 0.2 : 0);
  const flicker = 0.5 + Math.sin(time * 8) * 0.3;
  const waver = Math.sin(time * 4) * 0.1;
  const pulseIntensity = 0.4 + Math.sin(time * 3) * 0.25;
  const distortion = Math.sin(time * 6) * size * 0.02;
  const wailPhase = (time * 2) % 1;

  // === LAYER 1: DIMENSIONAL RIFT / VOID AURA ===
  // Dark void pool beneath
  const voidGrad = ctx.createRadialGradient(
    x,
    y + size * 0.5,
    0,
    x,
    y + size * 0.5,
    size * 0.6,
  );
  voidGrad.addColorStop(0, `rgba(15, 23, 42, ${pulseIntensity * 0.6})`);
  voidGrad.addColorStop(0.3, `rgba(30, 41, 59, ${pulseIntensity * 0.4})`);
  voidGrad.addColorStop(0.6, `rgba(51, 65, 85, ${pulseIntensity * 0.2})`);
  voidGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.6, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Void tendrils reaching up
  ctx.strokeStyle = `rgba(30, 41, 59, ${pulseIntensity * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let t = 0; t < 5; t++) {
    const tendrilAngle = (t * Math.PI) / 2.5 - Math.PI / 4;
    const tendrilPhase = (time * 0.5 + t * 0.3) % 1;
    const tendrilHeight = size * 0.3 * tendrilPhase;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(tendrilAngle) * size * 0.3, y + size * 0.5);
    ctx.quadraticCurveTo(
      x +
        Math.cos(tendrilAngle) * size * 0.25 +
        Math.sin(time * 3 + t) * size * 0.1,
      y + size * 0.3 - tendrilHeight * 0.5,
      x + Math.cos(tendrilAngle) * size * 0.15,
      y + size * 0.5 - tendrilHeight,
    );
    ctx.stroke();
  }

  // === LAYER 2: ETHEREAL TRAIL (MOTION GHOSTS) ===
  for (let i = 0; i < 6; i++) {
    const trailOffset = i * 8;
    const trailAlpha = (0.2 - i * 0.03) * flicker;
    const trailScale = 1 - i * 0.08;

    // Trail body
    const trailGrad = ctx.createRadialGradient(
      x + trailOffset,
      y + i * 4 + phase,
      0,
      x + trailOffset,
      y + i * 4 + phase,
      size * 0.4 * trailScale,
    );
    trailGrad.addColorStop(0, `rgba(148, 163, 184, ${trailAlpha})`);
    trailGrad.addColorStop(0.5, `rgba(100, 116, 139, ${trailAlpha * 0.5})`);
    trailGrad.addColorStop(1, "rgba(100, 116, 139, 0)");
    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.ellipse(
      x + trailOffset,
      y + i * 4 + phase,
      size * 0.3 * trailScale,
      size * 0.4 * trailScale,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === LAYER 3: ECTOPLASMIC PARTICLES ===
  for (let p = 0; p < 15; p++) {
    const particlePhase = (time * 0.7 + p * 0.15) % 1;
    const particleAngle = (p * Math.PI) / 7.5 + time * 0.3;
    const particleDist = size * (0.2 + particlePhase * 0.5);
    const px =
      x +
      Math.cos(particleAngle) * particleDist +
      Math.sin(time * 2 + p) * size * 0.1;
    const py = y - particlePhase * size * 0.6 + phase;
    const particleAlpha = (1 - particlePhase) * 0.5 * pulseIntensity;
    const particleSize = size * 0.025 * (1 - particlePhase * 0.5);

    // Particle glow
    const particleGlow = ctx.createRadialGradient(
      px,
      py,
      0,
      px,
      py,
      particleSize * 3,
    );
    particleGlow.addColorStop(0, `rgba(56, 189, 248, ${particleAlpha * 0.8})`);
    particleGlow.addColorStop(
      0.5,
      `rgba(56, 189, 248, ${particleAlpha * 0.3})`,
    );
    particleGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
    ctx.fillStyle = particleGlow;
    ctx.beginPath();
    ctx.arc(px, py, particleSize * 3, 0, Math.PI * 2);
    ctx.fill();

    // Particle core
    ctx.fillStyle = `rgba(186, 230, 253, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // === LAYER 4: MAIN GHOSTLY FORM (LAYERED FOR DEPTH) ===
  // Outer ethereal shroud
  const outerGrad = ctx.createRadialGradient(
    x,
    y - size * 0.05 + phase,
    0,
    x,
    y + size * 0.1 + phase,
    size * 0.65,
  );
  outerGrad.addColorStop(0, `rgba(203, 213, 225, ${flicker * 0.7})`);
  outerGrad.addColorStop(0.4, `rgba(148, 163, 184, ${flicker * 0.5})`);
  outerGrad.addColorStop(0.7, `rgba(100, 116, 139, ${flicker * 0.2})`);
  outerGrad.addColorStop(1, "rgba(100, 116, 139, 0)");
  ctx.fillStyle = outerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.5);
  // Wavy bottom edge with more detail
  for (let i = 0; i < 10; i++) {
    const waveX = x - size * 0.4 + i * size * 0.08;
    const waveY =
      y +
      size * 0.5 +
      Math.sin(time * 5 + i * 0.8) * size * 0.1 +
      (i % 2) * size * 0.05;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.45,
    y + size * 0.1,
    x + size * 0.3,
    y - size * 0.35 + phase + distortion,
  );
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y - size * 0.55 + phase,
    x,
    y - size * 0.5 + phase,
  );
  ctx.quadraticCurveTo(
    x - size * 0.15,
    y - size * 0.55 + phase,
    x - size * 0.3,
    y - size * 0.35 + phase - distortion,
  );
  ctx.quadraticCurveTo(
    x - size * 0.45,
    y + size * 0.1,
    x - size * 0.4,
    y + size * 0.5,
  );
  ctx.fill();

  // Inner spectral form
  const innerGrad = ctx.createRadialGradient(
    x,
    y - size * 0.1 + phase,
    0,
    x,
    y + phase,
    size * 0.45,
  );
  innerGrad.addColorStop(0, `rgba(241, 245, 249, ${flicker * 0.9})`);
  innerGrad.addColorStop(0.3, `rgba(226, 232, 240, ${flicker * 0.7})`);
  innerGrad.addColorStop(0.6, `rgba(203, 213, 225, ${flicker * 0.4})`);
  innerGrad.addColorStop(1, "rgba(203, 213, 225, 0)");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y + size * 0.35);
  for (let i = 0; i < 7; i++) {
    const waveX = x - size * 0.28 + i * size * 0.09;
    const waveY = y + size * 0.35 + Math.sin(time * 6 + i) * size * 0.06;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.32,
    y,
    x + size * 0.2,
    y - size * 0.35 + phase,
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.45 + phase,
    x - size * 0.2,
    y - size * 0.35 + phase,
  );
  ctx.quadraticCurveTo(x - size * 0.32, y, x - size * 0.28, y + size * 0.35);
  ctx.fill();

  // === LAYER 5: DARK VOID CORE ===
  const voidCore = ctx.createRadialGradient(
    x,
    y - size * 0.05 + phase,
    0,
    x,
    y - size * 0.05 + phase,
    size * 0.22,
  );
  voidCore.addColorStop(0, `rgba(15, 23, 42, ${flicker * 0.8})`);
  voidCore.addColorStop(0.5, `rgba(30, 41, 59, ${flicker * 0.5})`);
  voidCore.addColorStop(1, "rgba(30, 41, 59, 0)");
  ctx.fillStyle = voidCore;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.05 + phase,
    size * 0.18,
    size * 0.25,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Void energy swirls
  ctx.strokeStyle = `rgba(56, 189, 248, ${pulseIntensity * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let swirl = 0; swirl < 3; swirl++) {
    const swirlAngle = time * 2 + swirl * Math.PI * 0.67;
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.05 + phase,
      size * (0.08 + swirl * 0.04),
      swirlAngle,
      swirlAngle + Math.PI * 0.5,
    );
    ctx.stroke();
  }

  // === LAYER 6: SKULL-LIKE FACE (DETAILED) ===
  // Face glow aura
  const faceGlow = ctx.createRadialGradient(
    x,
    y - size * 0.28 + phase,
    0,
    x,
    y - size * 0.28 + phase,
    size * 0.28,
  );
  faceGlow.addColorStop(0, `rgba(248, 250, 252, ${flicker * 0.3})`);
  faceGlow.addColorStop(0.5, `rgba(226, 232, 240, ${flicker * 0.15})`);
  faceGlow.addColorStop(1, "rgba(226, 232, 240, 0)");
  ctx.fillStyle = faceGlow;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + phase, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Skull base
  const skullGrad = ctx.createRadialGradient(
    x,
    y - size * 0.3 + phase,
    0,
    x,
    y - size * 0.25 + phase,
    size * 0.2,
  );
  skullGrad.addColorStop(0, `rgba(248, 250, 252, ${flicker})`);
  skullGrad.addColorStop(0.6, `rgba(226, 232, 240, ${flicker * 0.9})`);
  skullGrad.addColorStop(1, `rgba(203, 213, 225, ${flicker * 0.7})`);
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.28 + phase, size * 0.19, 0, Math.PI * 2);
  ctx.fill();

  // Skull cracks for horror
  ctx.strokeStyle = `rgba(100, 116, 139, ${flicker * 0.5})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.42 + phase);
  ctx.lineTo(x - size * 0.08, y - size * 0.32 + phase);
  ctx.lineTo(x - size * 0.03, y - size * 0.28 + phase);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.4 + phase);
  ctx.lineTo(x + size * 0.08, y - size * 0.3 + phase);
  ctx.stroke();

  // Hollow eye sockets (deep black voids)
  ctx.fillStyle = `rgba(15, 23, 42, ${flicker})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.3 + phase,
    size * 0.055,
    size * 0.07,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.3 + phase,
    size * 0.055,
    size * 0.07,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Soul fire in eyes (gradient glow instead of shadowBlur)
  // Left eye glow
  const leftEyeGlow = ctx.createRadialGradient(
    x - size * 0.08,
    y - size * 0.3 + phase,
    0,
    x - size * 0.08,
    y - size * 0.3 + phase,
    size * 0.08,
  );
  leftEyeGlow.addColorStop(0, `rgba(56, 189, 248, ${flicker})`);
  leftEyeGlow.addColorStop(0.3, `rgba(56, 189, 248, ${flicker * 0.6})`);
  leftEyeGlow.addColorStop(0.6, `rgba(14, 165, 233, ${flicker * 0.3})`);
  leftEyeGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
  ctx.fillStyle = leftEyeGlow;
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.3 + phase, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Right eye glow
  const rightEyeGlow = ctx.createRadialGradient(
    x + size * 0.08,
    y - size * 0.3 + phase,
    0,
    x + size * 0.08,
    y - size * 0.3 + phase,
    size * 0.08,
  );
  rightEyeGlow.addColorStop(0, `rgba(56, 189, 248, ${flicker})`);
  rightEyeGlow.addColorStop(0.3, `rgba(56, 189, 248, ${flicker * 0.6})`);
  rightEyeGlow.addColorStop(0.6, `rgba(14, 165, 233, ${flicker * 0.3})`);
  rightEyeGlow.addColorStop(1, "rgba(14, 165, 233, 0)");
  ctx.fillStyle = rightEyeGlow;
  ctx.beginPath();
  ctx.arc(x + size * 0.08, y - size * 0.3 + phase, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Eye cores (bright center)
  ctx.fillStyle = `rgba(186, 230, 253, ${flicker})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.3 + phase,
    size * 0.028,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.3 + phase,
    size * 0.028,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye flame wisps
  ctx.strokeStyle = `rgba(56, 189, 248, ${flicker * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let eye = 0; eye < 2; eye++) {
    const eyeX = x + (eye === 0 ? -size * 0.08 : size * 0.08);
    for (let wisp = 0; wisp < 2; wisp++) {
      const wispAngle =
        -Math.PI * 0.5 +
        (wisp - 0.5) * 0.5 +
        Math.sin(time * 5 + eye + wisp) * 0.2;
      ctx.beginPath();
      ctx.moveTo(eyeX, y - size * 0.3 + phase);
      ctx.quadraticCurveTo(
        eyeX + Math.cos(wispAngle) * size * 0.04,
        y - size * 0.38 + phase,
        eyeX + Math.cos(wispAngle + 0.3) * size * 0.03,
        y - size * 0.45 + phase + Math.sin(time * 6 + wisp) * size * 0.02,
      );
      ctx.stroke();
    }
  }

  // Nose cavity
  ctx.fillStyle = `rgba(30, 41, 59, ${flicker * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22 + phase);
  ctx.lineTo(x - size * 0.025, y - size * 0.17 + phase);
  ctx.lineTo(x + size * 0.025, y - size * 0.17 + phase);
  ctx.fill();

  // Ghostly mouth (wailing expression)
  const mouthOpen =
    0.08 +
    Math.sin(time * 6) * 0.03 +
    (isAttacking ? attackIntensity * 0.05 : 0);
  ctx.fillStyle = `rgba(15, 23, 42, ${flicker * 0.9})`;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.12 + phase,
    size * 0.07,
    size * mouthOpen,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Mouth inner darkness gradient
  const mouthGrad = ctx.createRadialGradient(
    x,
    y - size * 0.12 + phase,
    0,
    x,
    y - size * 0.12 + phase,
    size * 0.06,
  );
  mouthGrad.addColorStop(0, "rgba(0, 0, 0, 0.8)");
  mouthGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
  ctx.fillStyle = mouthGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.12 + phase,
    size * 0.05,
    size * (mouthOpen - 0.02),
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wail effect (sound waves)
  if (wailPhase < 0.5) {
    const wailAlpha = (0.5 - wailPhase) * 0.4 * flicker;
    ctx.strokeStyle = `rgba(148, 163, 184, ${wailAlpha})`;
    ctx.lineWidth = 1 * zoom;
    for (let wave = 0; wave < 3; wave++) {
      const waveSize = size * (0.1 + wailPhase * 0.3 + wave * 0.08);
      ctx.beginPath();
      ctx.arc(
        x,
        y - size * 0.12 + phase,
        waveSize,
        Math.PI * 0.2,
        Math.PI * 0.8,
      );
      ctx.stroke();
    }
  }

  // === LAYER 7: WISPY ARMS (DETAILED) ===
  // Left arm with ethereal detail
  const armGrad = ctx.createLinearGradient(
    x - size * 0.25,
    y - size * 0.1 + phase,
    x - size * 0.5,
    y + size * 0.35,
  );
  armGrad.addColorStop(0, `rgba(203, 213, 225, ${flicker * 0.7})`);
  armGrad.addColorStop(0.5, `rgba(148, 163, 184, ${flicker * 0.5})`);
  armGrad.addColorStop(1, `rgba(100, 116, 139, ${flicker * 0.2})`);

  ctx.strokeStyle = armGrad;
  ctx.lineWidth = 4 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.08 + phase);
  ctx.bezierCurveTo(
    x - size * 0.45 + Math.sin(time * 3) * size * 0.08,
    y + size * 0.05,
    x - size * 0.5 + Math.cos(time * 2.5) * size * 0.06,
    y + size * 0.2,
    x - size * 0.45 + waver * size,
    y + size * 0.35,
  );
  ctx.stroke();

  // Left arm secondary wisp
  ctx.lineWidth = 2 * zoom;
  ctx.strokeStyle = `rgba(148, 163, 184, ${flicker * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.55 + Math.sin(time * 4) * size * 0.05,
    y + size * 0.25,
    x - size * 0.5,
    y + size * 0.45,
  );
  ctx.stroke();

  // Left hand wisps (fingers)
  ctx.lineWidth = 1.5 * zoom;
  for (let finger = 0; finger < 4; finger++) {
    const fingerAngle = -0.3 + finger * 0.2 + Math.sin(time * 3 + finger) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.45 + waver * size, y + size * 0.35);
    ctx.lineTo(
      x - size * 0.45 + waver * size + Math.cos(fingerAngle) * size * 0.12,
      y + size * 0.35 + Math.sin(fingerAngle + Math.PI * 0.5) * size * 0.1,
    );
    ctx.stroke();
  }

  // Right arm
  ctx.strokeStyle = armGrad;
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y - size * 0.08 + phase);
  ctx.bezierCurveTo(
    x + size * 0.45 - Math.sin(time * 3) * size * 0.08,
    y + size * 0.05,
    x + size * 0.5 - Math.cos(time * 2.5) * size * 0.06,
    y + size * 0.2,
    x + size * 0.45 - waver * size,
    y + size * 0.35,
  );
  ctx.stroke();

  // Right arm secondary wisp
  ctx.lineWidth = 2 * zoom;
  ctx.strokeStyle = `rgba(148, 163, 184, ${flicker * 0.4})`;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y + size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.55 - Math.sin(time * 4) * size * 0.05,
    y + size * 0.25,
    x + size * 0.5,
    y + size * 0.45,
  );
  ctx.stroke();

  // Right hand wisps
  ctx.lineWidth = 1.5 * zoom;
  for (let finger = 0; finger < 4; finger++) {
    const fingerAngle =
      Math.PI - (-0.3 + finger * 0.2 + Math.sin(time * 3 + finger) * 0.1);
    ctx.beginPath();
    ctx.moveTo(x + size * 0.45 - waver * size, y + size * 0.35);
    ctx.lineTo(
      x + size * 0.45 - waver * size + Math.cos(fingerAngle) * size * 0.12,
      y + size * 0.35 + Math.sin(fingerAngle - Math.PI * 0.5) * size * 0.1,
    );
    ctx.stroke();
  }

  // === LAYER 8: CHAINS OF BINDING (DETAILED) ===
  // Left chain
  ctx.strokeStyle = `rgba(71, 85, 105, ${flicker * 0.9})`;
  ctx.lineWidth = 2.5 * zoom;
  const chainStartL = { x: x - size * 0.18, y: y + size * 0.08 + phase };
  for (let link = 0; link < 7; link++) {
    const linkX =
      chainStartL.x -
      link * size * 0.055 +
      Math.sin(time * 2 + link * 0.5) * size * 0.02;
    const linkY =
      chainStartL.y +
      link * size * 0.05 +
      Math.cos(time * 3 + link) * size * 0.01;
    const linkAngle = Math.sin(time + link * 0.3) * 0.3;

    ctx.save();
    ctx.translate(linkX, linkY);
    ctx.rotate(linkAngle);
    ctx.strokeStyle = `rgba(71, 85, 105, ${flicker * (0.9 - link * 0.08)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.025, size * 0.035, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Right chain
  const chainStartR = { x: x + size * 0.18, y: y + size * 0.08 + phase };
  for (let link = 0; link < 7; link++) {
    const linkX =
      chainStartR.x +
      link * size * 0.055 -
      Math.sin(time * 2 + link * 0.5) * size * 0.02;
    const linkY =
      chainStartR.y +
      link * size * 0.05 +
      Math.cos(time * 3 + link) * size * 0.01;
    const linkAngle = -Math.sin(time + link * 0.3) * 0.3;

    ctx.save();
    ctx.translate(linkX, linkY);
    ctx.rotate(linkAngle);
    ctx.strokeStyle = `rgba(71, 85, 105, ${flicker * (0.9 - link * 0.08)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.025, size * 0.035, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Chain shackles on wrists
  ctx.fillStyle = `rgba(51, 65, 85, ${flicker * 0.8})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.32,
    y + size * 0.05 + phase,
    size * 0.04,
    size * 0.025,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.32,
    y + size * 0.05 + phase,
    size * 0.04,
    size * 0.025,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // === LAYER 9: ATTACK EFFECT (SOUL DRAIN) ===
  if (isAttacking) {
    // Soul drain tendrils
    ctx.strokeStyle = `rgba(56, 189, 248, ${attackIntensity * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let tendril = 0; tendril < 5; tendril++) {
      const tendrilAngle = (tendril * Math.PI) / 2.5 - Math.PI / 5;
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.05 + phase);
      ctx.bezierCurveTo(
        x + Math.cos(tendrilAngle) * size * 0.3,
        y + Math.sin(tendrilAngle) * size * 0.2,
        x +
          Math.cos(tendrilAngle) * size * 0.5 +
          Math.sin(time * 8 + tendril) * size * 0.1,
        y + Math.sin(tendrilAngle) * size * 0.3,
        x + Math.cos(tendrilAngle) * size * 0.7,
        y + Math.sin(tendrilAngle) * size * 0.35,
      );
      ctx.stroke();
    }

    // Soul orbs being drained
    for (let orb = 0; orb < 3; orb++) {
      const orbPhase = (attackIntensity + orb * 0.3) % 1;
      const orbDist = size * (0.6 - orbPhase * 0.5);
      const orbAngle = orb * Math.PI * 0.4 + time * 2;
      const orbX = x + Math.cos(orbAngle) * orbDist;
      const orbY = y + Math.sin(orbAngle) * orbDist * 0.5;

      const orbGlow = ctx.createRadialGradient(
        orbX,
        orbY,
        0,
        orbX,
        orbY,
        size * 0.05,
      );
      orbGlow.addColorStop(0, `rgba(186, 230, 253, ${attackIntensity * 0.8})`);
      orbGlow.addColorStop(0.5, `rgba(56, 189, 248, ${attackIntensity * 0.4})`);
      orbGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.fillStyle = orbGlow;
      ctx.beginPath();
      ctx.arc(orbX, orbY, size * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // === LAYER 10: HOOD / SHROUD OVERLAY ===
  // Tattered hood edges
  ctx.strokeStyle = `rgba(100, 116, 139, ${flicker * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.42 + phase);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y - size * 0.25 + phase,
    x - size * 0.32,
    y - size * 0.1 + phase,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.42 + phase);
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y - size * 0.25 + phase,
    x + size * 0.32,
    y - size * 0.1 + phase,
  );
  ctx.stroke();
}

export function drawBerserkerEnemy(
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
  // BLOOD WARDEN - Possessed warrior channeling demonic rage through cursed runes
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const rage =
    Math.sin(time * 14) * 4 * zoom +
    (isAttacking ? attackIntensity * size * 0.25 : 0);
  const breathe = Math.sin(time * 9) * 0.1;
  const armSwing = Math.sin(time * 12) * 0.5;
  const bloodPulse = 0.6 + Math.sin(time * 6) * 0.35;
  const runeGlow = 0.5 + Math.sin(time * 4) * 0.4;

  // Blood mist aura
  for (let mist = 0; mist < 8; mist++) {
    const mistAngle = time * 0.8 + (mist * Math.PI) / 4;
    const mistDist = size * 0.5 + Math.sin(time * 2 + mist) * size * 0.1;
    ctx.fillStyle = `rgba(220, 38, 38, ${bloodPulse * 0.15})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(mistAngle) * mistDist,
      y + Math.sin(mistAngle) * mistDist * 0.5,
      size * 0.08,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Rage aura - more intense
  const rageGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.8);
  rageGrad.addColorStop(0, `rgba(220, 38, 38, ${bloodPulse * 0.4})`);
  rageGrad.addColorStop(0.4, `rgba(185, 28, 28, ${bloodPulse * 0.25})`);
  rageGrad.addColorStop(0.7, `rgba(127, 29, 29, ${bloodPulse * 0.1})`);
  rageGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = rageGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Motion blur effect - more dramatic
  ctx.globalAlpha = 0.35;
  for (let i = 1; i < 4; i++) {
    ctx.fillStyle = `rgba(185, 28, 28, ${0.3 - i * 0.08})`;
    ctx.beginPath();
    ctx.ellipse(
      x + i * 9,
      y,
      size * (0.28 - i * 0.04),
      size * (0.38 - i * 0.05),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;


  // Muscular demonic body with runes
  const bodyGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y,
  );
  bodyGrad.addColorStop(0, "#450a0a");
  bodyGrad.addColorStop(0.3, "#7f1d1d");
  bodyGrad.addColorStop(0.5, "#b91c1c");
  bodyGrad.addColorStop(0.7, "#7f1d1d");
  bodyGrad.addColorStop(1, "#450a0a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.42);
  ctx.lineTo(x - size * 0.45 - breathe * size, y - size * 0.12);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.45,
    x + size * 0.45 + breathe * size,
    y - size * 0.12,
  );
  ctx.lineTo(x + size * 0.38, y + size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Blood rune tattoos on body
  ctx.strokeStyle = `rgba(220, 38, 38, ${runeGlow})`;
  ctx.lineWidth = 2 * zoom;
  // Left rune
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.1);
  ctx.lineTo(x - size * 0.2, y + size * 0.15);
  ctx.lineTo(x - size * 0.3, y + size * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - size * 0.25, y + size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.stroke();
  // Right rune
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.1);
  ctx.lineTo(x + size * 0.2, y + size * 0.15);
  ctx.lineTo(x + size * 0.3, y + size * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y + size * 0.05, size * 0.04, 0, Math.PI * 2);
  ctx.stroke();

  // War paint stripes - blood-soaked
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(x - size * 0.28, y - size * 0.18, size * 0.1, size * 0.4);
  ctx.fillRect(x + size * 0.18, y - size * 0.18, size * 0.1, size * 0.4);

  // Massive demon-touched arms
  // Left arm with cursed axe
  ctx.save();
  ctx.translate(x - size * 0.4, y - size * 0.12);
  ctx.rotate(-0.55 + armSwing);
  const armGrad = ctx.createLinearGradient(0, 0, 0, size * 0.4);
  armGrad.addColorStop(0, "#b91c1c");
  armGrad.addColorStop(1, "#7f1d1d");
  ctx.fillStyle = armGrad;
  ctx.fillRect(-size * 0.1, 0, size * 0.2, size * 0.4);
  // Arm runes
  ctx.strokeStyle = `rgba(220, 38, 38, ${runeGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.05);
  ctx.lineTo(0, size * 0.3);
  ctx.stroke();
  // Cursed great axe
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.035, size * 0.35, size * 0.07, size * 0.35);
  // Axe head with blood glow
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.6);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.55, -size * 0.22, size * 0.45);
  ctx.lineTo(-size * 0.22, size * 0.7);
  ctx.quadraticCurveTo(-size * 0.15, size * 0.65, -size * 0.025, size * 0.65);
  ctx.fill();
  // Blood glow on blade
  ctx.strokeStyle = `rgba(220, 38, 38, ${bloodPulse})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.58);
  ctx.lineTo(-size * 0.18, size * 0.52);
  ctx.stroke();
  ctx.restore();

  // Right arm with spikes
  ctx.save();
  ctx.translate(x + size * 0.4, y - size * 0.12);
  ctx.rotate(0.55 - armSwing);
  ctx.fillStyle = armGrad;
  ctx.fillRect(-size * 0.1, 0, size * 0.2, size * 0.38);
  // Spiked gauntlet
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.12, size * 0.32, size * 0.24, size * 0.1);
  // Spikes
  for (let spike = 0; spike < 3; spike++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.08 + spike * size * 0.08, size * 0.42);
    ctx.lineTo(-size * 0.06 + spike * size * 0.08, size * 0.52);
    ctx.lineTo(-size * 0.04 + spike * size * 0.08, size * 0.42);
    ctx.fill();
  }
  ctx.restore();

  // Fierce demonic head
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.38 + rage * 0.3,
    0,
    x,
    y - size * 0.38 + rage * 0.3,
    size * 0.22,
  );
  headGrad.addColorStop(0, "#a8a29e");
  headGrad.addColorStop(0.6, "#78716c");
  headGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.38 + rage * 0.3, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Face runes
  ctx.strokeStyle = `rgba(220, 38, 38, ${runeGlow})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.42 + rage * 0.3);
  ctx.lineTo(x - size * 0.1, y - size * 0.32 + rage * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.42 + rage * 0.3);
  ctx.lineTo(x + size * 0.1, y - size * 0.32 + rage * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52 + rage * 0.3);
  ctx.lineTo(x, y - size * 0.42 + rage * 0.3);
  ctx.stroke();

  // Demonic eyes (intense blood glow)
  ctx.fillStyle = "#fef2f2";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.4 + rage * 0.3,
    size * 0.05,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.4 + rage * 0.3,
    size * 0.05,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = "#dc2626";
  setShadowBlur(ctx, 10 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.4 + rage * 0.3,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.4 + rage * 0.3,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  // Pupil slits
  ctx.fillStyle = "#450a0a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.4 + rage * 0.3,
    size * 0.008,
    size * 0.02,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.4 + rage * 0.3,
    size * 0.008,
    size * 0.02,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Screaming mouth with fangs
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.28 + rage * 0.3,
    size * 0.1,
    size * 0.06 + Math.abs(rage) * 0.012,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Fanged teeth
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.31 + rage * 0.3);
  ctx.lineTo(x - size * 0.06, y - size * 0.24 + rage * 0.3);
  ctx.lineTo(x - size * 0.04, y - size * 0.31 + rage * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.31 + rage * 0.3);
  ctx.lineTo(x + size * 0.06, y - size * 0.24 + rage * 0.3);
  ctx.lineTo(x + size * 0.04, y - size * 0.31 + rage * 0.3);
  ctx.fill();

  // Wild flaming hair with horns
  ctx.fillStyle = "#991b1b";
  for (let i = 0; i < 9; i++) {
    const hairAngle = -Math.PI * 0.35 + i * Math.PI * 0.087;
    const hairLen = size * (0.25 + Math.sin(time * 10 + i) * 0.05);
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(hairAngle) * size * 0.16,
      y - size * 0.5 + rage * 0.3,
    );
    ctx.quadraticCurveTo(
      x +
        Math.cos(hairAngle) * size * 0.28 +
        Math.sin(time * 10 + i) * size * 0.06,
      y - size * 0.65 + rage * 0.3,
      x + Math.cos(hairAngle) * size * 0.22,
      y - size * 0.5 - hairLen + rage * 0.3,
    );
    ctx.lineTo(
      x + Math.cos(hairAngle) * size * 0.13,
      y - size * 0.48 + rage * 0.3,
    );
    ctx.fill();
  }
  // Small demon horns
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.52 + rage * 0.3);
  ctx.lineTo(x - size * 0.18, y - size * 0.68 + rage * 0.3);
  ctx.lineTo(x - size * 0.08, y - size * 0.5 + rage * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y - size * 0.52 + rage * 0.3);
  ctx.lineTo(x + size * 0.18, y - size * 0.68 + rage * 0.3);
  ctx.lineTo(x + size * 0.08, y - size * 0.5 + rage * 0.3);
  ctx.fill();
}

export function drawGolemEnemy(
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
  // NASSAU LION COLOSSUS - Animated stone lion guardian, awakened from Nassau Hall
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const sin2 = Math.sin(time * 2);
  const sin25 = Math.sin(time * 2.5);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin5 = Math.sin(time * 5);
  const sin6 = Math.sin(time * 6);
  const prowl =
    sin3 * 3 * zoom + (isAttacking ? attackIntensity * size * 0.2 : 0);
  const breathe = sin2 * size * 0.02;
  const crackGlow = 0.5 + sin3 * 0.35;
  const maneFlow = sin4 * 0.08;
  const tailSwish = sin5 * 0.3;
  const eyeIntensity = 0.7 + sin6 * 0.3;
  const jawShift =
    sin25 * size * 0.008 + (isAttacking ? attackIntensity * size * 0.012 : 0);

  // Ancient power aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${crackGlow * 0.25})`);
  auraGrad.addColorStop(0.4, `rgba(217, 119, 6, ${crackGlow * 0.15})`);
  auraGrad.addColorStop(0.7, `rgba(180, 83, 9, ${crackGlow * 0.08})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Ground cracks from weight
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = (crack * Math.PI) / 3 + Math.sin(crack * 1.7) * 0.1;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.45);
    let cx = x;
    let cy = y + size * 0.45;
    for (let seg = 0; seg < 3; seg++) {
      const bend = Math.sin(crack * 2.3 + seg * 1.9) * 0.22;
      cx += Math.cos(crackAngle + bend) * size * 0.1;
      cy += size * (0.02 + seg * 0.012);
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(crackAngle + 0.65) * size * 0.08,
      cy + Math.sin(crackAngle + 0.65) * size * 0.05,
    );
    ctx.stroke();
  }


  // Tail (behind body)
  ctx.save();
  ctx.translate(x + size * 0.35, y + size * 0.15);
  ctx.rotate(tailSwish);
  const tailGrad = ctx.createLinearGradient(0, 0, size * 0.4, 0);
  tailGrad.addColorStop(0, "#78716c");
  tailGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = tailGrad;
  const tailWave = Math.sin(time * 6) * size * 0.03;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.04);
  ctx.quadraticCurveTo(
    size * 0.25,
    -size * 0.08 + tailWave,
    size * 0.4,
    -size * 0.02,
  );
  ctx.quadraticCurveTo(size * 0.25, size * 0.02 + tailWave, 0, size * 0.04);
  ctx.fill();
  // Tail tuft (stone carved)
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  for (let t = 0; t < 5; t++) {
    const tuftAngle = -Math.PI * 0.3 + t * Math.PI * 0.15;
    ctx.moveTo(size * 0.38, 0);
    ctx.quadraticCurveTo(
      size * 0.45 + Math.cos(tuftAngle) * size * 0.08,
      Math.sin(tuftAngle) * size * 0.06,
      size * 0.5 + Math.cos(tuftAngle) * size * 0.1,
      Math.sin(tuftAngle) * size * 0.1,
    );
  }
  ctx.fill();
  ctx.restore();

  // Back legs
  ctx.fillStyle = "#57534e";
  // Left back leg
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.2);
  ctx.lineTo(x - size * 0.28, y + size * 0.45 + prowl * 0.3);
  ctx.lineTo(x - size * 0.35, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.22, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.15, y + size * 0.2);
  ctx.fill();
  // Right back leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + size * 0.2);
  ctx.lineTo(x + size * 0.28, y + size * 0.45 - prowl * 0.15);
  ctx.lineTo(x + size * 0.35, y + size * 0.48 - prowl * 0.15);
  ctx.lineTo(x + size * 0.22, y + size * 0.48 - prowl * 0.15);
  ctx.lineTo(x + size * 0.15, y + size * 0.2);
  ctx.fill();
  // Paw details
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.3, y + size * 0.45 + prowl * 0.3);
  ctx.moveTo(x - size * 0.28, y + size * 0.48 + prowl * 0.3);
  ctx.lineTo(x - size * 0.26, y + size * 0.45 + prowl * 0.3);
  ctx.stroke();

  // Massive lion body
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + size * 0.05,
    0,
    x,
    y + size * 0.05,
    size * 0.45,
  );
  bodyGrad.addColorStop(0, "#a8a29e");
  bodyGrad.addColorStop(0.4, "#78716c");
  bodyGrad.addColorStop(0.8, "#57534e");
  bodyGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.08 + breathe,
    size * 0.4,
    size * 0.32,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Stone texture on body
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.5 * zoom;
  for (let tex = 0; tex < 5; tex++) {
    const texX = x - size * 0.25 + tex * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(texX, y - size * 0.1 + breathe);
    ctx.quadraticCurveTo(
      texX + size * 0.03,
      y + size * 0.05 + breathe,
      texX - size * 0.02,
      y + size * 0.2 + breathe,
    );
    ctx.stroke();
  }
  // Chiseled panel seams
  ctx.lineWidth = 1.2 * zoom;
  for (let seam = 0; seam < 4; seam++) {
    const seamY = y - size * 0.02 + seam * size * 0.1 + breathe;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.26, seamY);
    ctx.quadraticCurveTo(
      x,
      seamY + size * 0.02,
      x + size * 0.24,
      seamY - size * 0.01,
    );
    ctx.stroke();
  }

  // Glowing rune veins across body
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.6})`;
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.05 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.1,
    y + size * 0.1 + breathe,
    x + size * 0.15,
    y - size * 0.02 + breathe,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.15 + breathe);
  ctx.lineTo(x + size * 0.2, y + size * 0.2 + breathe);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y + size * 0.04 + breathe);
  ctx.quadraticCurveTo(
    x - size * 0.05,
    y - size * 0.05 + breathe,
    x + size * 0.22,
    y + size * 0.06 + breathe,
  );
  ctx.stroke();
  clearShadow(ctx);

  // Front legs (powerful, lion-like)
  ctx.fillStyle = "#78716c";
  // Left front leg
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.08);
  ctx.lineTo(x - size * 0.38, y + size * 0.35 + prowl);
  ctx.lineTo(x - size * 0.45, y + size * 0.48 + prowl);
  ctx.lineTo(x - size * 0.3, y + size * 0.48 + prowl);
  ctx.lineTo(x - size * 0.26, y - size * 0.08);
  ctx.fill();
  // Right front leg
  ctx.beginPath();
  ctx.moveTo(x + size * 0.32, y - size * 0.08);
  ctx.lineTo(x + size * 0.38, y + size * 0.35 - prowl * 0.5);
  ctx.lineTo(x + size * 0.45, y + size * 0.48 - prowl * 0.5);
  ctx.lineTo(x + size * 0.3, y + size * 0.48 - prowl * 0.5);
  ctx.lineTo(x + size * 0.26, y - size * 0.08);
  ctx.fill();
  // Stone paws with claws
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.375,
    y + size * 0.48 + prowl,
    size * 0.08,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.375,
    y + size * 0.48 - prowl * 0.5,
    size * 0.08,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Shoulder armor ridges
  ctx.fillStyle = "#6b6560";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.28,
    y + size * 0.03,
    size * 0.1,
    size * 0.07,
    -0.35,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.28,
    y + size * 0.03,
    size * 0.1,
    size * 0.07,
    0.35,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.28, y + size * 0.03, size * 0.06, -1.6, 1.3);
  ctx.arc(x + size * 0.28, y + size * 0.03, size * 0.06, 1.9, 4.7);
  ctx.stroke();
  // Claws (glowing)
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow})`;
  for (let paw = 0; paw < 2; paw++) {
    const pawX = paw === 0 ? x - size * 0.375 : x + size * 0.375;
    const pawY =
      paw === 0 ? y + size * 0.48 + prowl : y + size * 0.48 - prowl * 0.5;
    for (let claw = 0; claw < 4; claw++) {
      ctx.beginPath();
      ctx.moveTo(pawX - size * 0.06 + claw * size * 0.04, pawY + size * 0.02);
      ctx.lineTo(pawX - size * 0.065 + claw * size * 0.04, pawY + size * 0.06);
      ctx.lineTo(pawX - size * 0.055 + claw * size * 0.04, pawY + size * 0.02);
      ctx.fill();
    }
  }

  // Magnificent stone mane
  ctx.fillStyle = "#57534e";
  for (let layer = 0; layer < 3; layer++) {
    for (let m = 0; m < 10; m++) {
      const maneAngle = -Math.PI * 0.72 + m * Math.PI * 0.14;
      const maneLen =
        size * (0.19 + layer * 0.055) +
        Math.sin(time * 4 + m * 0.8) * size * 0.02;
      const maneX = x + Math.cos(maneAngle) * size * (0.22 + layer * 0.03);
      const maneY = y - size * 0.35 + Math.sin(maneAngle) * size * 0.1;
      const maneTwist = Math.sin(time * 3 + m * 0.9 + layer * 0.5) * 0.05;
      ctx.save();
      ctx.translate(maneX, maneY);
      ctx.rotate(maneAngle + Math.PI * 0.5 + maneFlow + maneTwist);
      ctx.beginPath();
      ctx.moveTo(-size * 0.03, 0);
      ctx.quadraticCurveTo(-size * 0.04, maneLen * 0.5, -size * 0.02, maneLen);
      ctx.quadraticCurveTo(0, maneLen * 1.1, size * 0.02, maneLen);
      ctx.quadraticCurveTo(size * 0.04, maneLen * 0.5, size * 0.03, 0);
      ctx.fill();
      ctx.restore();
    }
  }
  // Glowing veins in mane
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let v = 0; v < 6; v++) {
    const vAngle = -Math.PI * 0.5 + v * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(vAngle) * size * 0.15, y - size * 0.38);
    ctx.lineTo(
      x + Math.cos(vAngle) * size * 0.35,
      y - size * 0.5 + Math.sin(time * 3 + v) * size * 0.03,
    );
    ctx.stroke();
  }

  // Majestic lion head
  const headGrad = ctx.createRadialGradient(
    x,
    y - size * 0.35,
    0,
    x,
    y - size * 0.35,
    size * 0.25,
  );
  headGrad.addColorStop(0, "#a8a29e");
  headGrad.addColorStop(0.5, "#78716c");
  headGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.35, size * 0.22, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // Cheek plates
  ctx.fillStyle = "#6b6560";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.15,
    y - size * 0.34,
    size * 0.07,
    size * 0.09,
    -0.45,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.15,
    y - size * 0.34,
    size * 0.07,
    size * 0.09,
    0.45,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Brow ridge
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.18, size * 0.06, 0, 0, Math.PI);
  ctx.fill();

  // Stone-carved muzzle
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.28, size * 0.12, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.32);
  ctx.lineTo(x - size * 0.04, y - size * 0.26);
  ctx.lineTo(x + size * 0.04, y - size * 0.26);
  ctx.fill();

  // Ferocious glowing eyes
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.42,
    size * 0.05,
    size * 0.04,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.42,
    size * 0.05,
    size * 0.04,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Glowing irises
  ctx.fillStyle = `rgba(251, 191, 36, ${eyeIntensity})`;
  setShadowBlur(ctx, 12 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(x - size * 0.09, y - size * 0.42, size * 0.035, 0, Math.PI * 2);
  ctx.arc(x + size * 0.09, y - size * 0.42, size * 0.035, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  // Slit pupils
  ctx.fillStyle = "#0f0a00";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.09,
    y - size * 0.42,
    size * 0.01,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.09,
    y - size * 0.42,
    size * 0.01,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Runed eye ridges
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.35})`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.43);
  ctx.lineTo(x - size * 0.05, y - size * 0.46);
  ctx.moveTo(x + size * 0.15, y - size * 0.43);
  ctx.lineTo(x + size * 0.05, y - size * 0.46);
  ctx.stroke();

  // Snarling mouth with stone fangs
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.22 + jawShift,
    size * 0.09,
    size * 0.045,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  // Lower jaw slab
  ctx.fillStyle = "#57534e";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.18 + jawShift,
    size * 0.11,
    size * 0.03,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  // Upper fangs
  ctx.fillStyle = "#e7e5e4";
  for (let fang = 0; fang < 2; fang++) {
    const fangX = fang === 0 ? x - size * 0.05 : x + size * 0.05;
    ctx.beginPath();
    ctx.moveTo(fangX - size * 0.015, y - size * 0.22 + jawShift);
    ctx.lineTo(fangX, y - size * 0.15 + jawShift);
    ctx.lineTo(fangX + size * 0.015, y - size * 0.22 + jawShift);
    ctx.fill();
  }
  // Teeth
  ctx.fillStyle = "#d6d3d1";
  for (let tooth = 0; tooth < 6; tooth++) {
    ctx.beginPath();
    ctx.arc(
      x - size * 0.05 + tooth * size * 0.02,
      y - size * 0.21 + jawShift,
      size * 0.008,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Stone ears
  ctx.fillStyle = "#78716c";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.48);
  ctx.lineTo(x - size * 0.22, y - size * 0.62);
  ctx.lineTo(x - size * 0.1, y - size * 0.52);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.48);
  ctx.lineTo(x + size * 0.22, y - size * 0.62);
  ctx.lineTo(x + size * 0.1, y - size * 0.52);
  ctx.fill();
  // Ear interior carvings
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.5);
  ctx.lineTo(x - size * 0.18, y - size * 0.57);
  ctx.moveTo(x + size * 0.15, y - size * 0.5);
  ctx.lineTo(x + size * 0.18, y - size * 0.57);
  ctx.stroke();

  // Whisker-like carved channels
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 1 * zoom;
  for (const side of [-1, 1]) {
    for (let whisker = 0; whisker < 3; whisker++) {
      const startX = x + side * size * 0.08;
      const startY = y - size * (0.3 - whisker * 0.03);
      const endX = x + side * size * (0.2 + whisker * 0.06);
      const endY = y - size * (0.32 - whisker * 0.05);
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(
        x + side * size * (0.14 + whisker * 0.03),
        y - size * (0.34 - whisker * 0.05),
        endX,
        endY,
      );
      ctx.stroke();
    }
  }

  // Ancient Nassau rune on forehead
  ctx.save();
  ctx.fillStyle = `rgba(251, 191, 36, ${crackGlow})`;
  setShadowBlur(ctx, 10 * zoom, "#fbbf24");
  ctx.font = `bold ${size * 0.1}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ℜ", x, y - size * 0.5);
  clearShadow(ctx);
  ctx.restore();
  // Forehead runic frame
  ctx.strokeStyle = `rgba(251, 191, 36, ${crackGlow * 0.5})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.065, y - size * 0.545);
  ctx.lineTo(x - size * 0.09, y - size * 0.5);
  ctx.lineTo(x - size * 0.065, y - size * 0.455);
  ctx.moveTo(x + size * 0.065, y - size * 0.545);
  ctx.lineTo(x + size * 0.09, y - size * 0.5);
  ctx.lineTo(x + size * 0.065, y - size * 0.455);
  ctx.stroke();

  // Weathering and moss patches
  ctx.fillStyle = "#4d7c0f";
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.32,
    y + size * 0.05,
    size * 0.04,
    size * 0.025,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.28,
    y + size * 0.12,
    size * 0.035,
    size * 0.02,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.05,
    y - size * 0.55,
    size * 0.025,
    size * 0.015,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.12,
    y - size * 0.15,
    size * 0.03,
    size * 0.018,
    0.15,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  // Dust particles being kicked up
  for (let dust = 0; dust < 6; dust++) {
    const dustPhase = (time * 2 + dust * 0.4) % 1.5;
    const dustX =
      x -
      size * 0.4 +
      dust * size * 0.16 +
      Math.sin(time * 3 + dust) * size * 0.05;
    const dustY = y + size * 0.5 - dustPhase * size * 0.15;
    ctx.fillStyle = `rgba(168, 162, 158, ${(1 - dustPhase / 1.5) * 0.4})`;
    ctx.beginPath();
    ctx.arc(dustX, dustY, size * 0.015 * (1 - dustPhase / 2), 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawNecromancerEnemy(
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
  // LICH SOVEREIGN - Ancient undead king commanding legions of the dead
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const hover =
    Math.sin(time * 2) * 5 * zoom +
    (isAttacking ? attackIntensity * size * 0.2 : 0);
  const deathPulse = 0.5 + Math.sin(time * 3) * 0.35;
  const soulBurn = 0.6 + Math.sin(time * 5) * 0.3;
  const phylacteryGlow = 0.7 + Math.sin(time * 4) * 0.25;

  // Death domain - rippling dark energy
  for (let ring = 0; ring < 4; ring++) {
    const ringSize =
      size * (0.35 + ring * 0.12) +
      Math.sin(time * 2 + ring * 0.5) * size * 0.04;
    ctx.strokeStyle = `rgba(74, 222, 128, ${deathPulse * (0.4 - ring * 0.08)})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + size * 0.48,
      ringSize,
      ringSize * 0.25,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Death aura - more intense
  const deathGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  deathGrad.addColorStop(0, `rgba(30, 27, 75, ${deathPulse * 0.5})`);
  deathGrad.addColorStop(0.3, `rgba(15, 10, 46, ${deathPulse * 0.35})`);
  deathGrad.addColorStop(0.6, `rgba(10, 10, 30, ${deathPulse * 0.2})`);
  deathGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = deathGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Floating skull spirits - more detailed
  for (let i = 0; i < 5; i++) {
    const spiritAngle = time * 1.2 + i * Math.PI * 0.4;
    const spiritDist = size * 0.58 + Math.sin(time * 2 + i) * size * 0.08;
    const spiritX = x + Math.cos(spiritAngle) * spiritDist;
    const spiritY = y - size * 0.08 + Math.sin(spiritAngle) * spiritDist * 0.35;
    // Skull glow
    ctx.fillStyle = `rgba(74, 222, 128, ${0.15 + Math.sin(time * 4 + i) * 0.1})`;
    ctx.beginPath();
    ctx.arc(spiritX, spiritY, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    // Skull
    ctx.fillStyle = `rgba(200, 200, 200, ${0.5 + Math.sin(time * 4 + i) * 0.25})`;
    ctx.beginPath();
    ctx.arc(spiritX, spiritY, size * 0.065, 0, Math.PI * 2);
    ctx.fill();
    // Skull eyes
    ctx.fillStyle = `rgba(74, 222, 128, ${soulBurn})`;
    setShadowBlur(ctx, 4 * zoom, "#4ade80");
    ctx.beginPath();
    ctx.arc(
      spiritX - size * 0.018,
      spiritY - size * 0.012,
      size * 0.014,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      spiritX + size * 0.018,
      spiritY - size * 0.012,
      size * 0.014,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    clearShadow(ctx);
    // Soul trail
    ctx.strokeStyle = `rgba(74, 222, 128, 0.2)`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(spiritX, spiritY);
    ctx.lineTo(
      spiritX - Math.cos(spiritAngle) * size * 0.1,
      spiritY - Math.sin(spiritAngle) * size * 0.04,
    );
    ctx.stroke();
  }


  // Dark robes with soul threads
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.42,
    y,
    x + size * 0.42,
    y,
  );
  robeGrad.addColorStop(0, "#0a0820");
  robeGrad.addColorStop(0.3, "#1e1b4b");
  robeGrad.addColorStop(0.5, "#312e81");
  robeGrad.addColorStop(0.7, "#1e1b4b");
  robeGrad.addColorStop(1, "#0a0820");
  ctx.fillStyle = robeGrad;
  drawRobeBody(ctx, x, size * 0.18, y - size * 0.45 + hover, size * 0.42, y + size * 0.55, size * 0.45, y, {
    count: 6,
    amplitude: size * 0.05,
    time: time,
    speed: 5,
    altAmplitude: size * 0.03,
  });

  // Soul threads on robe
  ctx.strokeStyle = `rgba(74, 222, 128, ${deathPulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let thread = 0; thread < 5; thread++) {
    const threadX = x - size * 0.25 + thread * size * 0.125;
    ctx.beginPath();
    ctx.moveTo(threadX, y - size * 0.3 + hover * 0.2);
    ctx.bezierCurveTo(
      threadX + Math.sin(time * 2 + thread) * size * 0.05,
      y,
      threadX - Math.cos(time * 2 + thread) * size * 0.04,
      y + size * 0.2,
      threadX + Math.sin(thread) * size * 0.06,
      y + size * 0.45,
    );
    ctx.stroke();
  }

  // Bone decorations on robe - more elaborate
  ctx.fillStyle = "#e8e0d0";
  for (let i = 0; i < 4; i++) {
    const boneY = y - size * 0.15 + i * size * 0.14 + hover * 0.5;
    ctx.beginPath();
    ctx.ellipse(x, boneY, size * 0.04, size * 0.018, 0, 0, Math.PI * 2);
    ctx.fill();
    // Small skulls between bones
    if (i < 3) {
      ctx.beginPath();
      ctx.arc(x, boneY + size * 0.07, size * 0.025, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.arc(
        x - size * 0.008,
        boneY + size * 0.065,
        size * 0.005,
        0,
        Math.PI * 2,
      );
      ctx.arc(
        x + size * 0.008,
        boneY + size * 0.065,
        size * 0.005,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#e8e0d0";
    }
  }

  // Crown of souls around head
  for (let crown = 0; crown < 6; crown++) {
    const crownAngle = (crown * Math.PI) / 3 - Math.PI / 2;
    ctx.fillStyle = `rgba(74, 222, 128, ${soulBurn * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(crownAngle) * size * 0.2,
      y - size * 0.5 + hover + Math.sin(crownAngle) * size * 0.08,
    );
    ctx.lineTo(
      x + Math.cos(crownAngle) * size * 0.28,
      y -
        size * 0.62 +
        hover +
        Math.sin(crownAngle) * size * 0.1 +
        Math.sin(time * 4 + crown) * size * 0.02,
    );
    ctx.lineTo(
      x + Math.cos(crownAngle + 0.15) * size * 0.2,
      y - size * 0.5 + hover + Math.sin(crownAngle + 0.15) * size * 0.08,
    );
    ctx.fill();
  }

  // Skeletal face - more detailed lich skull
  drawRadialAura(ctx, x, y - size * 0.45 + hover, size * 0.18, [
    { offset: 0, color: "#f5f5f4" },
    { offset: 0.6, color: "#e8e0d0" },
    { offset: 1, color: "#d6d3d1" },
  ]);
  // Skull cracks
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.58 + hover);
  ctx.lineTo(x - size * 0.04, y - size * 0.48 + hover);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.55 + hover);
  ctx.lineTo(x + size * 0.1, y - size * 0.45 + hover);
  ctx.stroke();

  // Hollow eye sockets
  ctx.fillStyle = "#0a0820";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07,
    y - size * 0.47 + hover,
    size * 0.045,
    size * 0.055,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.07,
    y - size * 0.47 + hover,
    size * 0.045,
    size * 0.055,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Soul-fire eyes
  ctx.fillStyle = "#4ade80";
  setShadowBlur(ctx, 12 * zoom, "#4ade80");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.47 + hover,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.47 + hover,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Skeletal nose hole
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4 + hover);
  ctx.lineTo(x - size * 0.025, y - size * 0.35 + hover);
  ctx.lineTo(x + size * 0.025, y - size * 0.35 + hover);
  ctx.fill();

  // Grinning teeth
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(
    x - size * 0.08,
    y - size * 0.33 + hover,
    size * 0.16,
    size * 0.04,
  );
  ctx.strokeStyle = "#1e1b4b";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.07 + i * size * 0.028, y - size * 0.33 + hover);
    ctx.lineTo(x - size * 0.07 + i * size * 0.028, y - size * 0.29 + hover);
    ctx.stroke();
  }

  // Ornate hood with soul gems
  ctx.fillStyle = "#050414";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.55 + hover,
    size * 0.24,
    size * 0.12,
    0,
    Math.PI,
    0,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.55 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y - size * 0.32 + hover,
    x - size * 0.22,
    y - size * 0.15 + hover,
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.24, y - size * 0.55 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y - size * 0.32 + hover,
    x + size * 0.22,
    y - size * 0.15 + hover,
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  // Soul gem on hood
  ctx.fillStyle = `rgba(74, 222, 128, ${phylacteryGlow})`;
  setShadowBlur(ctx, 6 * zoom, "#4ade80");
  ctx.beginPath();
  ctx.arc(x, y - size * 0.62 + hover, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Skull-topped staff with phylactery
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.22 + hover);
  ctx.lineTo(x - size * 0.45, y + size * 0.48);
  ctx.stroke();
  // Bone rings on staff
  ctx.fillStyle = "#a8a29e";
  ctx.fillRect(
    x - size * 0.465,
    y - size * 0.1 + hover,
    size * 0.05,
    size * 0.04,
  );
  ctx.fillRect(x - size * 0.465, y + size * 0.15, size * 0.05, size * 0.04);
  ctx.fillRect(x - size * 0.465, y + size * 0.35, size * 0.05, size * 0.04);
  // Large staff skull
  ctx.fillStyle = "#e8e0d0";
  ctx.beginPath();
  ctx.arc(x - size * 0.4, y - size * 0.32 + hover, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Skull eyes (glowing intensely)
  ctx.fillStyle = "#4ade80";
  setShadowBlur(ctx, 8 * zoom, "#4ade80");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.43,
    y - size * 0.33 + hover,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x - size * 0.37,
    y - size * 0.33 + hover,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Phylactery crystal above skull
  ctx.fillStyle = `rgba(74, 222, 128, ${phylacteryGlow})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y - size * 0.42 + hover);
  ctx.lineTo(x - size * 0.36, y - size * 0.48 + hover);
  ctx.lineTo(
    x - size * 0.4,
    y - size * 0.56 + hover + Math.sin(time * 5) * size * 0.02,
  );
  ctx.lineTo(x - size * 0.44, y - size * 0.48 + hover);
  ctx.fill();
  clearShadow(ctx);
}
export function drawShadowKnightEnemy(
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
  // DOOM CHAMPION - Fallen paladin corrupted by void, wielding soul-drinking blade
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase; // Linear decay from 1 (attack start) to 0
  const walkPhase = time * 2.5;
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.015;
  const leftLegPhase = Math.sin(walkPhase);
  const rightLegPhase = Math.sin(walkPhase + Math.PI);
  const leftThighAngle = leftLegPhase * 0.25;
  const rightThighAngle = rightLegPhase * 0.25;
  const leftKneeBend = Math.max(0, -leftLegPhase) * 0.35;
  const rightKneeBend = Math.max(0, -rightLegPhase) * 0.35;
  const armSwingAngle = Math.sin(walkPhase) * 0.12;
  const stance =
    bodyBob + (isAttacking ? attackIntensity * size * 0.18 : 0);
  const darkPulse = 0.5 + Math.sin(time * 4) * 0.35;
  const capeWave = Math.sin(time * 5) * 0.18;
  const voidGlow = 0.6 + Math.sin(time * 6) * 0.3;
  const soulDrain = 0.5 + Math.sin(time * 3) * 0.4;

  // Void corruption spreading from feet
  for (let corrupt = 0; corrupt < 6; corrupt++) {
    const corruptAngle = (corrupt * Math.PI) / 3 + time * 0.2;
    ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.48);
    let cx = x,
      cy = y + size * 0.48;
    for (let seg = 0; seg < 3; seg++) {
      cx += Math.cos(corruptAngle + (Math.random() - 0.5) * 0.5) * size * 0.12;
      cy += size * 0.025;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  // Dark aura - more intense
  const shadowGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.85);
  shadowGrad.addColorStop(0, `rgba(24, 24, 27, ${darkPulse * 0.45})`);
  shadowGrad.addColorStop(0.4, `rgba(39, 39, 42, ${darkPulse * 0.3})`);
  shadowGrad.addColorStop(0.7, `rgba(24, 24, 27, ${darkPulse * 0.15})`);
  shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shadowGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Void particles orbiting
  for (let particle = 0; particle < 8; particle++) {
    const particleAngle = time * 1.5 + (particle * Math.PI) / 4;
    const particleDist =
      size * 0.55 + Math.sin(time * 2 + particle) * size * 0.08;
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y + Math.sin(particleAngle) * particleDist * 0.4;
    ctx.fillStyle = `rgba(139, 92, 246, ${0.4 + Math.sin(time * 4 + particle) * 0.2})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }


  // Articulated armored legs with heavy deliberate stride
  const thighLen = size * 0.18;
  const shinLen = size * 0.16;

  // Left leg
  ctx.save();
  ctx.translate(x - size * 0.13, y + size * 0.2 + stance);
  ctx.rotate(leftThighAngle);
  const leftThighGrad = ctx.createLinearGradient(0, 0, 0, thighLen);
  leftThighGrad.addColorStop(0, "#3f3f46");
  leftThighGrad.addColorStop(0.5, "#27272a");
  leftThighGrad.addColorStop(1, "#18181b");
  ctx.fillStyle = leftThighGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.lineTo(-size * 0.055, thighLen);
  ctx.lineTo(size * 0.055, thighLen);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#52525b";
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(leftKneeBend);
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.04, shinLen);
  ctx.lineTo(size * 0.04, shinLen);
  ctx.lineTo(size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.045, shinLen * 0.3);
  ctx.lineTo(size * 0.045, shinLen * 0.3);
  ctx.stroke();
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(
    size * 0.01,
    shinLen + size * 0.01,
    size * 0.065,
    size * 0.03,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  ctx.restore();

  // Right leg
  ctx.save();
  ctx.translate(x + size * 0.13, y + size * 0.2 + stance);
  ctx.rotate(rightThighAngle);
  const rightThighGrad = ctx.createLinearGradient(0, 0, 0, thighLen);
  rightThighGrad.addColorStop(0, "#3f3f46");
  rightThighGrad.addColorStop(0.5, "#27272a");
  rightThighGrad.addColorStop(1, "#18181b");
  ctx.fillStyle = rightThighGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, 0);
  ctx.lineTo(-size * 0.055, thighLen);
  ctx.lineTo(size * 0.055, thighLen);
  ctx.lineTo(size * 0.06, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#52525b";
  ctx.beginPath();
  ctx.arc(0, thighLen, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.translate(0, thighLen);
  ctx.rotate(rightKneeBend);
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, 0);
  ctx.lineTo(-size * 0.04, shinLen);
  ctx.lineTo(size * 0.04, shinLen);
  ctx.lineTo(size * 0.05, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.045, shinLen * 0.3);
  ctx.lineTo(size * 0.045, shinLen * 0.3);
  ctx.stroke();
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.01,
    shinLen + size * 0.01,
    size * 0.065,
    size * 0.03,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();
  ctx.restore();

  // Ground impact dust when foot lands
  const leftFootDown = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rightFootDown = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  if (leftFootDown > 0.8) {
    ctx.fillStyle = `rgba(82, 82, 91, ${(leftFootDown - 0.8) * 2})`;
    for (let dust = 0; dust < 3; dust++) {
      ctx.beginPath();
      ctx.arc(
        x - size * 0.15 + (dust - 1) * size * 0.06,
        y + size * 0.52,
        size * 0.02 * (leftFootDown - 0.8) * 4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  if (rightFootDown > 0.8) {
    ctx.fillStyle = `rgba(82, 82, 91, ${(rightFootDown - 0.8) * 2})`;
    for (let dust = 0; dust < 3; dust++) {
      ctx.beginPath();
      ctx.arc(
        x + size * 0.15 + (dust - 1) * size * 0.06,
        y + size * 0.52,
        size * 0.02 * (rightFootDown - 0.8) * 4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Tattered cape with void tendrils
  const capeGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y,
  );
  capeGrad.addColorStop(0, "#0a0a0b");
  capeGrad.addColorStop(0.5, "#18181b");
  capeGrad.addColorStop(1, "#0a0a0b");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.28 + stance);
  ctx.quadraticCurveTo(
    x - size * 0.45 - capeWave * size,
    y + size * 0.22,
    x - size * 0.38,
    y + size * 0.55,
  );
  for (let i = 0; i < 6; i++) {
    const jagX = x - size * 0.38 + i * size * 0.152;
    const jagY =
      y +
      size * 0.55 +
      (i % 2) * size * 0.08 +
      Math.sin(time * 5 + i * 1.2) * size * 0.04;
    ctx.lineTo(jagX, jagY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.45 + capeWave * size,
    y + size * 0.22,
    x + size * 0.28,
    y - size * 0.28 + stance,
  );
  ctx.fill();
  // Void tendrils on cape
  ctx.strokeStyle = `rgba(139, 92, 246, ${voidGlow * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let tendril = 0; tendril < 4; tendril++) {
    const tendrilX = x - size * 0.25 + tendril * size * 0.17;
    ctx.beginPath();
    ctx.moveTo(tendrilX, y + size * 0.1);
    ctx.bezierCurveTo(
      tendrilX + Math.sin(time * 2 + tendril) * size * 0.05,
      y + size * 0.25,
      tendrilX - Math.cos(time * 2 + tendril) * size * 0.04,
      y + size * 0.4,
      tendrilX + Math.sin(tendril) * size * 0.06,
      y + size * 0.5,
    );
    ctx.stroke();
  }

  // Armored body - more elaborate
  const armorGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y,
    x + size * 0.35,
    y,
  );
  armorGrad.addColorStop(0, "#18181b");
  armorGrad.addColorStop(0.2, "#27272a");
  armorGrad.addColorStop(0.35, "#3f3f46");
  armorGrad.addColorStop(0.5, "#52525b");
  armorGrad.addColorStop(0.65, "#3f3f46");
  armorGrad.addColorStop(0.8, "#27272a");
  armorGrad.addColorStop(1, "#18181b");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.33, y + size * 0.38);
  ctx.lineTo(x - size * 0.38, y - size * 0.18 + stance);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.4 + stance,
    x + size * 0.38,
    y - size * 0.18 + stance,
  );
  ctx.lineTo(x + size * 0.33, y + size * 0.38);
  ctx.closePath();
  ctx.fill();

  // Armor details and trim
  ctx.strokeStyle = "#0a0a0b";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3 + stance);
  ctx.lineTo(x, y + size * 0.25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.06 + stance);
  ctx.lineTo(x + size * 0.28, y - size * 0.06 + stance);
  ctx.stroke();
  // Void runes on armor
  ctx.strokeStyle = `rgba(139, 92, 246, ${darkPulse * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  // Central rune
  ctx.beginPath();
  ctx.arc(x, y + size * 0.08, size * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.02);
  ctx.lineTo(x, y + size * 0.14);
  ctx.moveTo(x - size * 0.04, y + size * 0.08);
  ctx.lineTo(x + size * 0.04, y + size * 0.08);
  ctx.stroke();

  // Massive shoulder pauldrons with spikes
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.35,
    y - size * 0.18 + stance,
    size * 0.14,
    size * 0.1,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.35,
    y - size * 0.18 + stance,
    size * 0.14,
    size * 0.1,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Void gem on left pauldron
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  setShadowBlur(ctx, 4 * zoom, "#8b5cf6");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.35,
    y - size * 0.18 + stance,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  // Multiple spikes on pauldrons
  ctx.fillStyle = "#1c1917";
  for (let spike = 0; spike < 2; spike++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.38 - spike * size * 0.05, y - size * 0.22 + stance);
    ctx.lineTo(
      x - size * 0.44 - spike * size * 0.06,
      y - size * 0.4 - spike * size * 0.05 + stance,
    );
    ctx.lineTo(x - size * 0.34 - spike * size * 0.05, y - size * 0.2 + stance);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.38 + spike * size * 0.05, y - size * 0.22 + stance);
    ctx.lineTo(
      x + size * 0.44 + spike * size * 0.06,
      y - size * 0.4 - spike * size * 0.05 + stance,
    );
    ctx.lineTo(x + size * 0.34 + spike * size * 0.05, y - size * 0.2 + stance);
    ctx.fill();
  }

  // Menacing helmet
  const helmGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y - size * 0.55,
    x + size * 0.2,
    y - size * 0.35,
  );
  helmGrad.addColorStop(0, "#27272a");
  helmGrad.addColorStop(0.5, "#3f3f46");
  helmGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.43 + stance, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  // Helmet visor
  ctx.fillStyle = "#18181b";
  ctx.fillRect(
    x - size * 0.16,
    y - size * 0.5 + stance,
    size * 0.32,
    size * 0.14,
  );
  // T-shaped visor slit
  ctx.fillStyle = "#0a0a0b";
  ctx.fillRect(
    x - size * 0.14,
    y - size * 0.47 + stance,
    size * 0.28,
    size * 0.04,
  );
  ctx.fillRect(
    x - size * 0.02,
    y - size * 0.47 + stance,
    size * 0.04,
    size * 0.1,
  );
  // Glowing eyes behind visor
  ctx.fillStyle = `rgba(139, 92, 246, ${darkPulse + 0.4})`;
  setShadowBlur(ctx, 10 * zoom, "#8b5cf6");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.44 + stance,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.07,
    y - size * 0.44 + stance,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  // Large horns
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(
    x - size * 0.2,
    y - size * 0.7 + stance,
    x - size * 0.25,
    y - size * 0.8 + stance,
  );
  ctx.quadraticCurveTo(
    x - size * 0.18,
    y - size * 0.7 + stance,
    x - size * 0.1,
    y - size * 0.58 + stance,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(
    x + size * 0.2,
    y - size * 0.7 + stance,
    x + size * 0.25,
    y - size * 0.8 + stance,
  );
  ctx.quadraticCurveTo(
    x + size * 0.18,
    y - size * 0.7 + stance,
    x + size * 0.1,
    y - size * 0.58 + stance,
  );
  ctx.fill();
  // Crown spikes
  ctx.fillStyle = "#27272a";
  for (let crown = 0; crown < 5; crown++) {
    const crownAngle = -Math.PI * 0.4 + crown * Math.PI * 0.2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(crownAngle) * size * 0.18,
      y - size * 0.55 + stance + Math.sin(crownAngle) * size * 0.05,
    );
    ctx.lineTo(
      x + Math.cos(crownAngle) * size * 0.22,
      y - size * 0.65 + stance,
    );
    ctx.lineTo(
      x + Math.cos(crownAngle + 0.1) * size * 0.18,
      y - size * 0.55 + stance + Math.sin(crownAngle + 0.1) * size * 0.05,
    );
    ctx.fill();
  }

  // Soul-drinking sword
  ctx.save();
  ctx.translate(x + size * 0.4, y + size * 0.02 + stance);
  ctx.rotate(0.35 - armSwingAngle);
  // Blade with void corruption
  const bladeGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.65);
  bladeGrad.addColorStop(0, "#27272a");
  bladeGrad.addColorStop(0.5, "#3f3f46");
  bladeGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 0.05, -size * 0.55);
  ctx.lineTo(0, -size * 0.68);
  ctx.lineTo(size * 0.05, -size * 0.55);
  ctx.closePath();
  ctx.fill();
  // Void energy flowing on blade
  ctx.strokeStyle = `rgba(139, 92, 246, ${soulDrain})`;
  setShadowBlur(ctx, 8 * zoom, "#8b5cf6");
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.bezierCurveTo(
    -size * 0.02,
    -size * 0.25,
    size * 0.02,
    -size * 0.4,
    0,
    -size * 0.58,
  );
  ctx.stroke();
  clearShadow(ctx);
  // Blade runes
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.015, 0, Math.PI * 2);
  ctx.arc(0, -size * 0.35, size * 0.015, 0, Math.PI * 2);
  ctx.arc(0, -size * 0.5, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Ornate crossguard
  ctx.fillStyle = "#52525b";
  ctx.fillRect(-size * 0.1, -size * 0.025, size * 0.2, size * 0.05);
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  ctx.beginPath();
  ctx.arc(-size * 0.08, 0, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.08, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Grip
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.025, 0, size * 0.05, size * 0.14);
  // Pommel gem
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  setShadowBlur(ctx, 4 * zoom, "#8b5cf6");
  ctx.beginPath();
  ctx.arc(0, size * 0.16, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  // Shield (left arm) with skull emblem - swings opposite to sword
  ctx.save();
  ctx.translate(0, armSwingAngle * size * 0.25);
  const shieldGrad = ctx.createLinearGradient(
    x - size * 0.55,
    y,
    x - size * 0.35,
    y,
  );
  shieldGrad.addColorStop(0, "#27272a");
  shieldGrad.addColorStop(0.5, "#3f3f46");
  shieldGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = shieldGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y - size * 0.12 + stance);
  ctx.lineTo(x - size * 0.55, y - size * 0.08 + stance);
  ctx.lineTo(x - size * 0.55, y + size * 0.22 + stance);
  ctx.lineTo(x - size * 0.44, y + size * 0.35 + stance);
  ctx.lineTo(x - size * 0.38, y + size * 0.22 + stance);
  ctx.closePath();
  ctx.fill();
  // Shield border
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Skull emblem with glow
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.465,
    y + size * 0.08 + stance,
    size * 0.06,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(139, 92, 246, ${voidGlow})`;
  setShadowBlur(ctx, 4 * zoom, "#8b5cf6");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.48,
    y + size * 0.07 + stance,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x - size * 0.45,
    y + size * 0.07 + stance,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();
}

// ============================================================================
// NEW ENEMY SPRITES
// ============================================================================

export function drawCultistEnemy(
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
  // FINALS WEEK CULTIST - Hooded figure with glowing runes and forbidden coffee
  const isAttacking = attackPhase > 0;
  const sway = Math.sin(time * 3) * 2 * zoom;
  const chant = Math.sin(time * 8) * 0.3;
  const runeGlow =
    0.5 + Math.sin(time * 4) * 0.3 + (isAttacking ? attackPhase * 0.4 : 0);
  const attackIntensity = attackPhase;

  // Ritual circle beneath feet (pentagram with symbols, rotates slowly)
  ctx.save();
  ctx.translate(x, y + size * 0.44);
  ctx.scale(1, 0.35);
  ctx.rotate(time * 0.3);
  const ritualRadius =
    size * (0.5 + (isAttacking ? attackIntensity * 0.15 : 0));
  ctx.strokeStyle = `rgba(255, 100, 50, ${runeGlow * (isAttacking ? 0.6 : 0.2)})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, ritualRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, ritualRadius * 0.75, 0, Math.PI * 2);
  ctx.stroke();
  // Pentagram
  for (let i = 0; i < 5; i++) {
    const pAngle1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const pAngle2 = ((i + 2) / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(pAngle1) * ritualRadius * 0.7,
      Math.sin(pAngle1) * ritualRadius * 0.7,
    );
    ctx.lineTo(
      Math.cos(pAngle2) * ritualRadius * 0.7,
      Math.sin(pAngle2) * ritualRadius * 0.7,
    );
    ctx.stroke();
  }
  // Symbols around circle
  ctx.fillStyle = `rgba(255, 150, 80, ${runeGlow * 0.4})`;
  ctx.font = `${size * 0.07}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const circleSymbols = ["⛧", "☽", "☉", "⚝", "△", "◈"];
  for (let i = 0; i < 6; i++) {
    const sAngle = (i / 6) * Math.PI * 2;
    ctx.fillText(
      circleSymbols[i],
      Math.cos(sAngle) * ritualRadius * 0.9,
      Math.sin(sAngle) * ritualRadius * 0.9,
    );
  }
  ctx.restore();

  // Dark aura
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  auraGrad.addColorStop(0, `rgba(124, 45, 18, ${runeGlow * 0.3})`);
  auraGrad.addColorStop(0.5, `rgba(80, 20, 10, ${runeGlow * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Attack: dark energy pulse radiates outward
  if (isAttacking) {
    const pulseSize = size * (0.5 + attackIntensity * 1.0);
    const pulseGrad = ctx.createRadialGradient(x, y, 0, x, y, pulseSize);
    pulseGrad.addColorStop(
      0,
      `rgba(255, 80, 30, ${attackIntensity * 0.35})`,
    );
    pulseGrad.addColorStop(
      0.6,
      `rgba(124, 45, 18, ${attackIntensity * 0.15})`,
    );
    pulseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = pulseGrad;
    ctx.beginPath();
    ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Smoke/incense wisps rising around the cultist
  for (let w = 0; w < 6; w++) {
    const smokePhase = (time * 0.4 + w * 0.17) % 1;
    const smokeAlpha = (1 - smokePhase) * 0.2;
    const smokeX =
      x +
      Math.sin(time * 1.5 + w * 1.7) * size * 0.3 +
      Math.cos(time * 0.8 + w) * size * 0.05;
    const smokeY = y + size * 0.3 - smokePhase * size * 0.8;
    ctx.fillStyle = `rgba(80, 40, 20, ${smokeAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      smokeX,
      smokeY,
      size * 0.03 * (1 + smokePhase * 0.5),
      size * 0.05 * (1 + smokePhase * 0.5),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }


  // Dark energy chains/tendrils wrapping around the body
  ctx.strokeStyle = `rgba(100, 30, 10, ${runeGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let c = 0; c < 3; c++) {
    const chainOffset = time * 1.2 + c * Math.PI * 0.67;
    ctx.beginPath();
    for (let seg = 0; seg < 8; seg++) {
      const t = seg / 7;
      const cx2 =
        x +
        Math.sin(chainOffset + t * Math.PI * 3) *
          size *
          (0.15 + t * 0.1);
      const cy2 = y - size * 0.3 + t * size * 0.7;
      if (seg === 0) {
        ctx.moveTo(cx2, cy2);
      } else {
        ctx.lineTo(cx2, cy2);
      }
    }
    ctx.stroke();
  }

  // Tattered robes (outer layer)
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.3,
    y,
    x + size * 0.3,
    y,
  );
  robeGrad.addColorStop(0, "#2a1810");
  robeGrad.addColorStop(0.5, bodyColor);
  robeGrad.addColorStop(1, "#2a1810");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.45);
  ctx.lineTo(x - size * 0.35 + sway * 0.5, y + size * 0.4);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.5 + chant * 2,
    x + size * 0.35 - sway * 0.5,
    y + size * 0.4,
  );
  ctx.closePath();
  ctx.fill();

  // Robe inner lining visible (slightly lighter)
  ctx.fillStyle = "#3d1f14";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.35);
  ctx.lineTo(x - size * 0.12, y + size * 0.25);
  ctx.lineTo(x + size * 0.04, y + size * 0.25);
  ctx.lineTo(x + size * 0.05, y - size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Animated robe billowing effect (shoulder folds)
  ctx.strokeStyle = "#1a0a05";
  ctx.lineWidth = 1 * zoom;
  for (let f = 0; f < 3; f++) {
    const foldY = y - size * 0.2 + f * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.25 + sway * 0.3, foldY);
    ctx.quadraticCurveTo(
      x - size * 0.1 + Math.sin(time * 3 + f) * size * 0.03,
      foldY + size * 0.04,
      x,
      foldY,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.25 - sway * 0.3, foldY);
    ctx.quadraticCurveTo(
      x + size * 0.1 + Math.sin(time * 3 + f + 1) * size * 0.03,
      foldY + size * 0.04,
      x,
      foldY,
    );
    ctx.stroke();
  }

  // Ragged hem with more tattered detail
  ctx.strokeStyle = "#1a0a05";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 9; i++) {
    const hx = x - size * 0.33 + i * size * 0.083;
    ctx.beginPath();
    ctx.moveTo(hx, y + size * 0.4 + Math.sin(time * 5 + i) * 2);
    ctx.lineTo(
      hx + size * 0.03,
      y + size * 0.5 + Math.sin(time * 4 + i) * 3,
    );
    ctx.stroke();
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(hx + size * 0.015, y + size * 0.45 + Math.sin(time * 6 + i) * 2);
      ctx.lineTo(
        hx + size * 0.045,
        y + size * 0.54 + Math.sin(time * 3.5 + i) * 2,
      );
      ctx.stroke();
    }
  }

  // Hood (hunched posture - slightly forward leaning)
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(
    x + sway * 0.2,
    y - size * 0.25,
    size * 0.25,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Hood point/peak
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15 + sway * 0.2, y - size * 0.42);
  ctx.lineTo(x + sway * 0.2, y - size * 0.55);
  ctx.lineTo(x + size * 0.15 + sway * 0.2, y - size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Hood opening (dark void)
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.ellipse(
    x + sway * 0.2,
    y - size * 0.25,
    size * 0.15,
    size * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Candlelight glow from within the hood
  const candleFlicker = 0.4 + Math.sin(time * 15) * 0.15 + Math.sin(time * 23) * 0.1;
  const candleGrad = ctx.createRadialGradient(
    x + sway * 0.2,
    y - size * 0.3,
    0,
    x + sway * 0.2,
    y - size * 0.25,
    size * 0.18,
  );
  candleGrad.addColorStop(
    0,
    `rgba(255, 180, 80, ${candleFlicker * 0.25})`,
  );
  candleGrad.addColorStop(1, "rgba(255, 100, 30, 0)");
  ctx.fillStyle = candleGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + sway * 0.2,
    y - size * 0.25,
    size * 0.15,
    size * 0.18,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Glowing eyes in hood (with dark circles - sleep deprived)
  ctx.fillStyle = `rgba(30, 10, 5, ${runeGlow * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06 + sway * 0.2,
    y - size * 0.27,
    size * 0.04,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.06 + sway * 0.2,
    y - size * 0.27,
    size * 0.04,
    size * 0.035,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(255, 100, 50, ${runeGlow})`;
  setShadowBlur(ctx, 6 * zoom, "#ff6432");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06 + sway * 0.2,
    y - size * 0.28,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.06 + sway * 0.2,
    y - size * 0.28,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Hands with dark energy tendrils emerging from sleeves
  // Left hand/sleeve
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.38,
    y - size * 0.15,
    x - size * 0.4,
    y - size * 0.05,
  );
  ctx.quadraticCurveTo(
    x - size * 0.38,
    y + size * 0.02,
    x - size * 0.2,
    y,
  );
  ctx.closePath();
  ctx.fill();
  // Left hand
  ctx.fillStyle = "#c4a882";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.4,
    y - size * 0.05,
    size * 0.035,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Dark energy tendrils from left hand
  ctx.strokeStyle = `rgba(200, 60, 20, ${runeGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let t = 0; t < 3; t++) {
    const tAngle = -0.8 + t * 0.4 + Math.sin(time * 4 + t) * 0.2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y - size * 0.05);
    ctx.quadraticCurveTo(
      x - size * 0.4 - Math.cos(tAngle) * size * 0.08,
      y - size * 0.05 - Math.sin(tAngle) * size * 0.06,
      x - size * 0.4 - Math.cos(tAngle) * size * 0.14,
      y - size * 0.05 - Math.sin(tAngle) * size * 0.1,
    );
    setShadowBlur(ctx, 3 * zoom, "#ff4020");
    ctx.stroke();
    clearShadow(ctx);
  }
  // Right hand/sleeve
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y - size * 0.15,
    x + size * 0.37,
    y - size * 0.08,
  );
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y + size * 0.02,
    x + size * 0.2,
    y,
  );
  ctx.closePath();
  ctx.fill();

  // Floating forbidden book
  ctx.save();
  ctx.translate(x + size * 0.35, y - size * 0.05 + Math.sin(time * 2.5) * 3);
  ctx.rotate(Math.sin(time * 2) * 0.2);
  ctx.fillStyle = "#1a0a05";
  ctx.fillRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.2);
  ctx.fillStyle = `rgba(255, 120, 50, ${runeGlow})`;
  ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
  ctx.strokeStyle = `rgba(255, 180, 100, ${runeGlow})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.06);
  ctx.lineTo(0, size * 0.04);
  ctx.moveTo(-size * 0.03, -size * 0.02);
  ctx.lineTo(size * 0.03, -size * 0.02);
  ctx.stroke();
  // Extra rune details on book
  ctx.beginPath();
  ctx.arc(0, -size * 0.01, size * 0.025, 0, Math.PI * 2);
  ctx.stroke();
  // Book glow
  setShadowBlur(ctx, 5 * zoom, `rgba(255, 120, 50, ${runeGlow * 0.5})`);
  ctx.strokeStyle = `rgba(255, 120, 50, ${runeGlow * 0.3})`;
  ctx.strokeRect(-size * 0.08, -size * 0.1, size * 0.16, size * 0.2);
  clearShadow(ctx);
  ctx.restore();

  // Glowing runes floating around (flare brighter during attack)
  for (let i = 0; i < 4; i++) {
    const runeAngle = time * 1.5 + i * Math.PI * 0.5;
    const runeDist = size * 0.5;
    const rx = x + Math.cos(runeAngle) * runeDist;
    const ry = y - size * 0.1 + Math.sin(runeAngle) * runeDist * 0.4;
    const runeAlpha =
      runeGlow *
      (0.4 + Math.sin(time * 3 + i) * 0.2) *
      (isAttacking ? 1.5 : 1);
    ctx.fillStyle = `rgba(255, 150, 80, ${Math.min(runeAlpha, 1)})`;
    if (isAttacking) {
      setShadowBlur(ctx, 6 * zoom, "#ff8040");
    }
    ctx.font = `bold ${size * 0.12}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const runes = ["☉", "☽", "⚝", "⛧"];
    ctx.fillText(runes[i], rx, ry);
    if (isAttacking) {
      clearShadow(ctx);
    }
  }

  // Glowing coffee cup (forbidden caffeine)
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.05);
  ctx.fillStyle = "#3a2820";
  ctx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.14);
  // Cup handle
  ctx.strokeStyle = "#3a2820";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(size * 0.06, 0, size * 0.03, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Coffee liquid
  ctx.fillStyle = "#2a1408";
  ctx.fillRect(-size * 0.05, -size * 0.06, size * 0.1, size * 0.1);
  // Steam
  ctx.strokeStyle = `rgba(255, 200, 150, ${0.3 + Math.sin(time * 6) * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  for (let s = 0; s < 3; s++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.02 + s * size * 0.03, -size * 0.08);
    ctx.quadraticCurveTo(
      -size * 0.02 +
        s * size * 0.03 +
        Math.sin(time * 4 + s) * size * 0.02,
      -size * 0.14,
      -size * 0.02 + s * size * 0.03,
      -size * 0.18,
    );
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPlaguebearerEnemy(
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
  const coughCycle = Math.sin(time * 1.5) > 0.85 ? 1 : 0;
  const coughJerk = coughCycle * Math.sin(time * 20) * 0.03;
  const bloat =
    1 +
    Math.sin(time * 2) * 0.05 +
    (isAttacking ? attackPhase * 0.15 : 0) +
    coughJerk;
  const dripPhase = (time * 2) % 1;
  const toxicPulse = 0.5 + Math.sin(time * 3) * 0.3;
  const sweatPhase = (time * 3) % 1;
  const convulse = isAttacking ? Math.sin(time * 15) * attackPhase : 0;

  // Outer toxic cloud layer (large, faint, expands during attack)
  for (let c = 0; c < 7; c++) {
    const cloudAngle = time * 0.5 + c * Math.PI * 0.28;
    const expandMult = isAttacking ? 1 + attackPhase * 1.5 : 1;
    const cloudDist =
      (size * 0.75 + Math.sin(time * 0.8 + c * 2) * size * 0.2) * expandMult;
    const cx = x + Math.cos(cloudAngle) * cloudDist;
    const cy = y + Math.sin(cloudAngle) * cloudDist * 0.5;
    const cloudR =
      (size * 0.18 + Math.sin(time * 2 + c) * size * 0.05) * expandMult;
    ctx.fillStyle = `rgba(101, 163, 13, ${0.08 + Math.sin(time + c) * 0.04})`;
    ctx.beginPath();
    ctx.arc(cx, cy, cloudR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Inner toxic cloud layer (smaller, brighter)
  for (let c = 0; c < 5; c++) {
    const cloudAngle = time * 0.8 + c * Math.PI * 0.4;
    const expandMult = isAttacking ? 1 + attackPhase * 2 : 1;
    const cloudDist =
      (size * 0.55 + Math.sin(time + c) * size * 0.12) * expandMult;
    const cx = x + Math.cos(cloudAngle) * cloudDist;
    const cy = y + Math.sin(cloudAngle) * cloudDist * 0.5;
    const cloudR =
      (size * 0.12 + Math.sin(time * 3 + c) * size * 0.03) * expandMult;
    ctx.fillStyle = `rgba(132, 204, 22, ${0.15 + Math.sin(time * 2 + c) * 0.08})`;
    ctx.beginPath();
    ctx.arc(cx, cy, cloudR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro toxic particles drifting in clouds
  for (let p = 0; p < 8; p++) {
    const pAngle = time * 1.2 + p * Math.PI * 0.25;
    const pDist = size * 0.5 + Math.sin(time * 2 + p) * size * 0.25;
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle) * pDist * 0.4;
    ctx.fillStyle = `rgba(200, 255, 50, ${0.2 + Math.sin(time * 4 + p) * 0.1})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wispy cloud tendrils connecting outer clouds
  ctx.strokeStyle = `rgba(101, 163, 13, ${0.06 + Math.sin(time) * 0.03})`;
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 4; w++) {
    const wAngle1 = time * 0.5 + w * Math.PI * 0.5;
    const wAngle2 = wAngle1 + Math.PI * 0.28;
    const wd = size * 0.7;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(wAngle1) * wd, y + Math.sin(wAngle1) * wd * 0.5);
    ctx.quadraticCurveTo(
      x + Math.cos((wAngle1 + wAngle2) * 0.5) * wd * 0.5,
      y + Math.sin((wAngle1 + wAngle2) * 0.5) * wd * 0.3 - size * 0.1,
      x + Math.cos(wAngle2) * wd,
      y + Math.sin(wAngle2) * wd * 0.5,
    );
    ctx.stroke();
  }

  // Toxic puddle shadow
  const puddleGrad = ctx.createRadialGradient(
    x,
    y + size * 0.45,
    0,
    x,
    y + size * 0.45,
    size * 0.5,
  );
  puddleGrad.addColorStop(0, "rgba(101, 163, 13, 0.45)");
  puddleGrad.addColorStop(0.4, "rgba(80, 140, 10, 0.3)");
  puddleGrad.addColorStop(0.7, "rgba(50, 80, 10, 0.2)");
  puddleGrad.addColorStop(1, "rgba(0, 0, 0, 0.15)");
  ctx.fillStyle = puddleGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.45,
    size * 0.5,
    size * 0.17,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Puddle bubbles
  for (let pb = 0; pb < 3; pb++) {
    const bubblePhase = (time * 1.5 + pb * 0.33) % 1;
    const bubbleScale = Math.sin(bubblePhase * Math.PI);
    const bx = x - size * 0.2 + pb * size * 0.2;
    ctx.strokeStyle = `rgba(150, 200, 50, ${bubbleScale * 0.4})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(
      bx,
      y + size * 0.45,
      size * 0.02 + bubbleScale * size * 0.015,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Tattered hospital gown (back layer)
  ctx.fillStyle = "rgba(200, 210, 220, 0.4)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.36, y - size * 0.12);
  ctx.lineTo(x - size * 0.4, y + size * 0.36);
  ctx.lineTo(x - size * 0.15, y + size * 0.42);
  ctx.lineTo(x, y + size * 0.36);
  ctx.lineTo(x + size * 0.15, y + size * 0.42);
  ctx.lineTo(x + size * 0.4, y + size * 0.36);
  ctx.lineTo(x + size * 0.36, y - size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Gown fold lines
  ctx.strokeStyle = "rgba(170, 180, 190, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  for (let gf = 0; gf < 4; gf++) {
    const gfx = x - size * 0.2 + gf * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(gfx, y - size * 0.05);
    ctx.quadraticCurveTo(
      gfx + Math.sin(gf) * size * 0.03,
      y + size * 0.15,
      gfx - size * 0.01,
      y + size * 0.35,
    );
    ctx.stroke();
  }

  // Tattered bottom edges
  ctx.strokeStyle = "rgba(160, 170, 180, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let t = 0; t < 6; t++) {
    const tx = x - size * 0.32 + t * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(tx, y + size * 0.34 + Math.sin(t * 1.5) * size * 0.03);
    ctx.lineTo(
      tx + size * 0.03,
      y + size * 0.44 + Math.sin(time * 3 + t) * size * 0.02,
    );
    ctx.lineTo(tx + size * 0.07, y + size * 0.36);
    ctx.stroke();
  }

  // Gown stain spots
  for (let s = 0; s < 4; s++) {
    ctx.fillStyle = `rgba(101, 163, 13, ${0.15 + s * 0.04})`;
    ctx.beginPath();
    ctx.arc(
      x - size * 0.2 + s * size * 0.13,
      y + size * 0.08 + Math.sin(s + 1) * size * 0.07,
      size * 0.035 + Math.sin(s * 2) * size * 0.01,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Bloated body with cough convulsions
  ctx.save();
  ctx.translate(x, y);
  if (coughCycle > 0) {
    ctx.translate(
      Math.sin(time * 25) * size * 0.02,
      Math.sin(time * 30) * size * 0.015,
    );
  }
  if (isAttacking) {
    ctx.translate(
      convulse * size * 0.03,
      Math.sin(time * 18) * attackPhase * size * 0.02,
    );
  }

  const bodyGrad = ctx.createRadialGradient(
    0,
    0,
    size * 0.1,
    0,
    0,
    size * 0.45 * bloat,
  );
  bodyGrad.addColorStop(0, bodyColorLight);
  bodyGrad.addColorStop(0.6, bodyColor);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    0,
    0,
    size * 0.4 * bloat,
    size * 0.45 * bloat,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Infected veins on exposed skin
  ctx.strokeStyle = "rgba(40, 100, 20, 0.55)";
  ctx.lineWidth = 1.5 * zoom;
  for (let v = 0; v < 8; v++) {
    const vAngle = v * Math.PI * 0.25 + 0.3;
    const vx1 = Math.cos(vAngle) * size * 0.15;
    const vy1 = Math.sin(vAngle) * size * 0.18;
    const vx2 = Math.cos(vAngle) * size * 0.35 * bloat;
    const vy2 = Math.sin(vAngle) * size * 0.38 * bloat;
    ctx.beginPath();
    ctx.moveTo(vx1, vy1);
    ctx.quadraticCurveTo(
      vx1 + Math.sin(vAngle * 3) * size * 0.06,
      vy1 + Math.cos(vAngle * 2) * size * 0.06,
      vx2,
      vy2,
    );
    ctx.stroke();
    if (v % 2 === 0) {
      const bx = (vx1 + vx2) * 0.6;
      const by = (vy1 + vy2) * 0.6;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(
        bx + Math.cos(vAngle + 0.5) * size * 0.08,
        by + Math.sin(vAngle + 0.5) * size * 0.08,
      );
      ctx.stroke();
    }
  }

  // Pulsing vein highlights
  ctx.strokeStyle = `rgba(80, 180, 30, ${0.15 + Math.sin(time * 4) * 0.1})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let pv = 0; pv < 4; pv++) {
    const pvAngle = pv * Math.PI * 0.5 + 0.6;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(pvAngle) * size * 0.18,
      Math.sin(pvAngle) * size * 0.2,
    );
    ctx.quadraticCurveTo(
      Math.cos(pvAngle) * size * 0.25 + Math.sin(pvAngle * 2) * size * 0.04,
      Math.sin(pvAngle) * size * 0.28,
      Math.cos(pvAngle) * size * 0.32 * bloat,
      Math.sin(pvAngle) * size * 0.35 * bloat,
    );
    ctx.stroke();
  }

  // Open sores/wounds with green glow
  for (let w = 0; w < 5; w++) {
    const wAngle = w * Math.PI * 0.4 + 0.8;
    const wDist = size * 0.25 * bloat;
    const wx = Math.cos(wAngle) * wDist;
    const wy = Math.sin(wAngle) * wDist * 0.85;
    setShadowBlur(ctx, 5 * zoom, "rgba(101, 200, 13, 0.6)");
    ctx.fillStyle = "rgba(80, 40, 30, 0.8)";
    ctx.beginPath();
    ctx.ellipse(wx, wy, size * 0.05, size * 0.03, wAngle, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(130, 200, 30, ${0.5 + Math.sin(time * 3 + w) * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(wx, wy, size * 0.035, size * 0.02, wAngle, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
    // Wound seepage
    const seepLen = size * 0.04 + Math.sin(time * 2 + w) * size * 0.02;
    ctx.strokeStyle = `rgba(130, 200, 30, ${0.3 + Math.sin(time * 3 + w) * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx, wy + size * 0.03);
    ctx.lineTo(wx + Math.sin(w) * size * 0.01, wy + size * 0.03 + seepLen);
    ctx.stroke();
  }

  // Corrupted red cross on chest
  ctx.strokeStyle = `rgba(220, 50, 50, ${0.6 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, 0);
  ctx.lineTo(size * 0.08, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.08);
  ctx.lineTo(0, size * 0.08);
  ctx.stroke();
  // Corruption drips from cross
  ctx.strokeStyle = `rgba(101, 163, 13, ${0.4 + Math.sin(time * 4) * 0.15})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let cd = 0; cd < 3; cd++) {
    const cdx = -size * 0.05 + cd * size * 0.05;
    const cdDrip = ((time * 1.5 + cd * 0.3) % 1) * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(cdx, size * 0.08);
    ctx.lineTo(cdx, size * 0.08 + cdDrip);
    ctx.stroke();
  }

  ctx.restore();

  // Boils and pustules
  for (let b = 0; b < 8; b++) {
    const boilAngle = b * Math.PI * 0.25 + 0.5;
    const boilDist = size * 0.3 * bloat;
    const bx = x + Math.cos(boilAngle) * boilDist;
    const by = y + Math.sin(boilAngle) * boilDist * 0.8;
    const boilSize = size * (0.04 + Math.sin(time * 4 + b) * 0.012);
    ctx.fillStyle = `rgba(180, 200, 50, ${0.7 + Math.sin(time * 3 + b) * 0.2})`;
    ctx.beginPath();
    ctx.arc(bx, by, boilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 150, 0.5)";
    ctx.beginPath();
    ctx.arc(
      bx - boilSize * 0.3,
      by - boilSize * 0.3,
      boilSize * 0.4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Dripping ooze
  for (let d = 0; d < 6; d++) {
    const dripX = x - size * 0.3 + d * size * 0.12;
    const dripProgress = (dripPhase + d * 0.17) % 1;
    const dripY = y + size * 0.3 + dripProgress * size * 0.35;
    const dripAlpha = 1 - dripProgress;
    ctx.fillStyle = `rgba(150, 200, 50, ${dripAlpha * 0.8})`;
    ctx.beginPath();
    ctx.ellipse(
      dripX,
      dripY,
      size * 0.025,
      size * 0.05 + dripProgress * size * 0.03,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Sweat drops flying off
  for (let sw = 0; sw < 5; sw++) {
    const swAngle =
      -Math.PI * 0.5 + sw * Math.PI * 0.2 - Math.PI * 0.2;
    const swProgress = (sweatPhase + sw * 0.2) % 1;
    const swDist = size * 0.3 + swProgress * size * 0.45;
    const swx = x + Math.cos(swAngle) * swDist;
    const swy =
      y -
      size * 0.3 +
      Math.sin(swAngle) * swDist * 0.5 +
      swProgress * size * 0.15;
    const swAlpha = (1 - swProgress) * 0.7;
    ctx.fillStyle = `rgba(180, 220, 255, ${swAlpha})`;
    ctx.beginPath();
    ctx.moveTo(swx, swy - size * 0.025);
    ctx.quadraticCurveTo(
      swx + size * 0.015,
      swy,
      swx,
      swy + size * 0.02,
    );
    ctx.quadraticCurveTo(
      swx - size * 0.015,
      swy,
      swx,
      swy - size * 0.025,
    );
    ctx.fill();
  }

  // Hood/head covering
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 * bloat, size * 0.23, 0, Math.PI * 2);
  ctx.fill();
  // Hood rim detail
  ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y - size * 0.35 * bloat,
    size * 0.23,
    Math.PI * 0.15,
    Math.PI * 0.85,
  );
  ctx.stroke();

  // Face mask (medical, askew)
  ctx.save();
  ctx.translate(x, y - size * 0.32 * bloat);
  ctx.rotate(0.15);
  ctx.fillStyle = "rgba(180, 210, 230, 0.85)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.02);
  ctx.quadraticCurveTo(
    -size * 0.14,
    size * 0.06,
    -size * 0.1,
    size * 0.1,
  );
  ctx.lineTo(size * 0.1, size * 0.1);
  ctx.quadraticCurveTo(
    size * 0.14,
    size * 0.06,
    size * 0.12,
    -size * 0.02,
  );
  ctx.closePath();
  ctx.fill();
  // Mask pleats
  ctx.strokeStyle = "rgba(140, 170, 190, 0.6)";
  ctx.lineWidth = 0.8 * zoom;
  for (let mp = 0; mp < 3; mp++) {
    const mpy = size * 0.01 + mp * size * 0.028;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, mpy);
    ctx.lineTo(size * 0.1, mpy);
    ctx.stroke();
  }
  // Mask stain
  ctx.fillStyle = "rgba(101, 163, 13, 0.25)";
  ctx.beginPath();
  ctx.arc(size * 0.03, size * 0.05, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  // Ear loops
  ctx.strokeStyle = "rgba(180, 210, 230, 0.7)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, 0);
  ctx.quadraticCurveTo(
    -size * 0.2,
    size * 0.02,
    -size * 0.18,
    -size * 0.06,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.12, -size * 0.02);
  ctx.quadraticCurveTo(size * 0.2, 0, size * 0.18, -size * 0.08);
  ctx.stroke();
  ctx.restore();

  // Sickly glowing eyes
  ctx.fillStyle = `rgba(200, 255, 100, ${toxicPulse + 0.3})`;
  setShadowBlur(ctx, 8 * zoom, "#c8ff64");
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.38,
    size * 0.04,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.38,
    size * 0.04,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Bloodshot lines in eyes
  ctx.strokeStyle = "rgba(200, 50, 50, 0.5)";
  ctx.lineWidth = 0.5 * zoom;
  for (let eye = -1; eye <= 1; eye += 2) {
    const ex = x + eye * size * 0.08;
    const ey = y - size * 0.38;
    for (let bl = 0; bl < 3; bl++) {
      const blAngle =
        bl * Math.PI * 0.33 - Math.PI * 0.5 + eye * 0.3;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(
        ex + Math.cos(blAngle) * size * 0.035,
        ey + Math.sin(blAngle) * size * 0.02,
      );
      ctx.stroke();
    }
  }

  // Bags under eyes
  ctx.strokeStyle = "rgba(80, 60, 80, 0.35)";
  ctx.lineWidth = 1 * zoom;
  for (let eye = -1; eye <= 1; eye += 2) {
    ctx.beginPath();
    ctx.arc(
      x + eye * size * 0.08,
      y - size * 0.365,
      size * 0.035,
      Math.PI * 0.1,
      Math.PI * 0.9,
    );
    ctx.stroke();
  }

  // Thermometer sticking out of mouth
  ctx.save();
  ctx.translate(x + size * 0.02, y - size * 0.28 * bloat);
  ctx.rotate(0.4 + Math.sin(time * 2) * 0.05);
  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(-size * 0.01, 0, size * 0.02, size * 0.18);
  // Thermometer bulb
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(0, size * 0.18, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  // Mercury line
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-size * 0.005, size * 0.06, size * 0.01, size * 0.12);
  // Temperature marks
  ctx.strokeStyle = "rgba(100, 100, 100, 0.4)";
  ctx.lineWidth = 0.5 * zoom;
  for (let tm = 0; tm < 4; tm++) {
    const tmy = size * 0.04 + tm * size * 0.035;
    ctx.beginPath();
    ctx.moveTo(size * 0.01, tmy);
    ctx.lineTo(size * 0.02, tmy);
    ctx.stroke();
  }
  ctx.restore();

  // Biohazard symbol on chest (behind red cross)
  ctx.strokeStyle = `rgba(255, 255, 100, ${toxicPulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  for (let h = 0; h < 3; h++) {
    const hazAngle = -Math.PI / 2 + (h * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(hazAngle) * size * 0.12,
      y + Math.sin(hazAngle) * size * 0.12,
      size * 0.06,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Arms with tissue box
  ctx.fillStyle = bodyColor;
  ctx.fillRect(
    x - size * 0.48,
    y - size * 0.05,
    size * 0.16,
    size * 0.28,
  );
  ctx.fillRect(
    x + size * 0.32,
    y - size * 0.05,
    size * 0.16,
    size * 0.28,
  );
  // Veins on arms
  ctx.strokeStyle = "rgba(40, 100, 20, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let arm = -1; arm <= 1; arm += 2) {
    const armX = arm < 0 ? x - size * 0.42 : x + size * 0.38;
    ctx.beginPath();
    ctx.moveTo(armX, y);
    ctx.quadraticCurveTo(
      armX + size * 0.02 * arm,
      y + size * 0.1,
      armX,
      y + size * 0.2,
    );
    ctx.stroke();
    // Secondary vein branch
    ctx.beginPath();
    ctx.moveTo(armX, y + size * 0.08);
    ctx.lineTo(
      armX + size * 0.04 * arm,
      y + size * 0.15,
    );
    ctx.stroke();
  }

  // Tissue box
  ctx.fillStyle = "#f5f5f4";
  ctx.fillRect(
    x - size * 0.15,
    y + size * 0.05,
    size * 0.3,
    size * 0.18,
  );
  ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(
    x - size * 0.15,
    y + size * 0.05,
    size * 0.3,
    size * 0.18,
  );
  ctx.fillStyle = "#a3e635";
  ctx.fillRect(
    x - size * 0.12,
    y + size * 0.08,
    size * 0.24,
    size * 0.12,
  );
  // Tissue sticking out
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.05);
  ctx.quadraticCurveTo(
    x + size * 0.06,
    y - size * 0.02,
    x + size * 0.02,
    y - size * 0.1 + Math.sin(time * 5) * size * 0.02,
  );
  ctx.quadraticCurveTo(
    x - size * 0.04,
    y - size * 0.02,
    x,
    y + size * 0.05,
  );
  ctx.fill();
  // Second tissue
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y + size * 0.05);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y,
    x - size * 0.03,
    y - size * 0.05 + Math.sin(time * 4 + 1) * size * 0.015,
  );
  ctx.quadraticCurveTo(
    x - size * 0.01,
    y + size * 0.01,
    x - size * 0.04,
    y + size * 0.05,
  );
  ctx.fill();

  // Coughing effect: particles burst from mouth area
  if (coughCycle > 0) {
    for (let cp = 0; cp < 8; cp++) {
      const cpAngle =
        -Math.PI * 0.15 + Math.sin(time * 20 + cp * 3) * 0.35;
      const cpDist =
        size * 0.2 + ((time * 8 + cp * 0.35) % 1) * size * 0.45;
      const cpAlpha = Math.max(
        0,
        0.6 - ((time * 8 + cp * 0.35) % 1),
      );
      ctx.fillStyle = `rgba(150, 200, 50, ${cpAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(cpAngle) * cpDist,
        y - size * 0.3 + Math.sin(cpAngle) * cpDist,
        size * 0.02 + cpAlpha * size * 0.015,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Cough mist
    ctx.fillStyle = `rgba(132, 204, 22, ${0.12 + Math.sin(time * 15) * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(
      x + size * 0.15,
      y - size * 0.3,
      size * 0.12,
      size * 0.06,
      -0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Enhanced attack: convulse, toxins spray outward, expanding ring
  if (isAttacking) {
    // Toxin spray burst
    for (let sp = 0; sp < 12; sp++) {
      const spAngle = sp * Math.PI * 0.167 + time * 3;
      const spDist = size * 0.3 + attackPhase * size * 0.9;
      const spAlpha = (1 - attackPhase) * 0.5;
      ctx.fillStyle = `rgba(132, 204, 22, ${spAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(spAngle) * spDist,
        y + Math.sin(spAngle) * spDist * 0.6,
        size * 0.04 + attackPhase * size * 0.03,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Expanding toxic ring
    setShadowBlur(ctx, 10 * zoom, "#84cc16");
    ctx.strokeStyle = `rgba(132, 204, 22, ${(1 - attackPhase) * 0.6})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3 + attackPhase * size, 0, Math.PI * 2);
    ctx.stroke();
    // Inner ring
    ctx.strokeStyle = `rgba(200, 255, 50, ${(1 - attackPhase) * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      size * 0.2 + attackPhase * size * 0.7,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    clearShadow(ctx);
    // Convulsion shockwave lines
    for (let sw = 0; sw < 6; sw++) {
      const swAngle = sw * Math.PI * 0.333;
      const swLen = size * 0.15 + attackPhase * size * 0.4;
      ctx.strokeStyle = `rgba(150, 200, 50, ${(1 - attackPhase) * 0.4})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(swAngle) * size * 0.35,
        y + Math.sin(swAngle) * size * 0.35,
      );
      ctx.lineTo(
        x + Math.cos(swAngle) * (size * 0.35 + swLen),
        y + Math.sin(swAngle) * (size * 0.35 + swLen),
      );
      ctx.stroke();
    }
  }
}

