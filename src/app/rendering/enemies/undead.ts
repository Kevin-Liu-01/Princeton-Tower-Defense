// Princeton Tower Defense - Undead/Dark Enemy Sprite Functions
// Extracted from enemies/index.ts: Specter, Berserker, Golem, Necromancer, Shadow Knight, Cultist, Plaguebearer

import {
  drawRadialAura,
  drawRobeBody,
} from "./helpers";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawAnimatedArm,
  drawAnimatedLegs,
  drawPulsingGlowRings,
  drawShadowWisps,
  drawPoisonBubbles,
  drawShiftingSegments,
  drawOrbitingDebris,
  drawAnimatedTendril,
  drawFloatingPiece,
  drawGlowingEyes,
} from "./animationHelpers";

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

  // --- Animated ghostly tendrils hanging below ---
  for (let td = 0; td < 4; td++) {
    const tendrilAng = Math.PI / 2 + (td - 1.5) * 0.35;
    drawAnimatedTendril(
      ctx,
      x + (td - 1.5) * size * 0.12,
      y + size * 0.3 + phase,
      tendrilAng,
      size,
      time,
      zoom,
      {
        color: `rgba(148, 163, 184, ${flicker * 0.5})`,
        tipColor: `rgba(100, 116, 139, ${flicker * 0.3})`,
        length: 0.35,
        width: 0.025,
        segments: 10,
        waveSpeed: 3 + td * 0.5,
        waveAmt: 0.08,
        tipRadius: 0.01,
      },
    );
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

  // --- Ethereal shadow wisps ---
  drawShadowWisps(ctx, x, y + phase, size * 0.35, time, zoom, {
    color: "rgba(56, 189, 248, 0.35)",
    count: 4,
    speed: 1.2,
    maxAlpha: 0.3,
    wispLength: 0.45,
  });

  // --- Shifting ethereal segments ---
  drawShiftingSegments(ctx, x, y + phase, size, time, zoom, {
    color: `rgba(203, 213, 225, ${flicker * 0.5})`,
    colorAlt: `rgba(148, 163, 184, ${flicker * 0.4})`,
    count: 5,
    orbitRadius: 0.35,
    segmentSize: 0.03,
    orbitSpeed: 1.0,
    bobSpeed: 2.5,
    bobAmt: 0.05,
    shape: "shard",
    rotateWithOrbit: true,
  });

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
  // BLOOD WARDEN - Frenzied berserker channeling demonic rage through cursed blood runes
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const rage =
    Math.sin(time * 14) * 4 * zoom +
    (isAttacking ? attackIntensity * size * 0.25 : 0);
  const breathe = Math.sin(time * 9) * 0.1;
  const armSwing =
    Math.sin(time * 12) * 0.5 +
    (isAttacking ? Math.sin(time * 25) * attackIntensity * 0.8 : 0);
  const bloodPulse = 0.6 + Math.sin(time * 6) * 0.35;
  const runeGlow = 0.5 + Math.sin(time * 4) * 0.4;
  const heartbeat = Math.sin(time * 8);
  const heartbeatSharp = Math.pow(Math.max(0, heartbeat), 3);
  const walkPhase = time * 3.5;
  const leftStep = Math.sin(walkPhase);
  const rightStep = Math.sin(walkPhase + Math.PI);
  const bodyBob = Math.abs(Math.sin(walkPhase)) * size * 0.012;
  const headY = y - size * 0.38 + rage * 0.3 - bodyBob;
  const attackShake = isAttacking
    ? Math.sin(time * 30) * attackIntensity * size * 0.015
    : 0;
  const furyScale = isAttacking ? 1 + attackIntensity * 0.15 : 1;

  // === LAYER 1: GROUND CRACK EFFECTS FROM HEAVY FOOTSTEPS ===
  const leftFootImpact = Math.max(0, -Math.sin(walkPhase - 0.3));
  const rightFootImpact = Math.max(0, -Math.sin(walkPhase + Math.PI - 0.3));
  ctx.strokeStyle = `rgba(80, 10, 10, ${0.35 + bloodPulse * 0.15})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 5; crack++) {
    const crackAngle = (crack * Math.PI) / 2.5 + Math.sin(crack * 2.1) * 0.2;
    const crackAlpha = leftFootImpact > 0.6 ? (leftFootImpact - 0.6) * 2 : 0;
    if (crackAlpha > 0) {
      ctx.globalAlpha = crackAlpha * 0.6;
      ctx.beginPath();
      let cx = x - size * 0.12;
      let cy = y + size * 0.48;
      ctx.moveTo(cx, cy);
      for (let seg = 0; seg < 3; seg++) {
        const bend = Math.sin(crack * 2.7 + seg * 1.5) * 0.25;
        cx += Math.cos(crackAngle + bend) * size * 0.09;
        cy += size * (0.015 + seg * 0.01);
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  }
  for (let crack = 0; crack < 5; crack++) {
    const crackAngle =
      (crack * Math.PI) / 2.5 + Math.sin(crack * 1.8 + 1) * 0.2;
    const crackAlpha =
      rightFootImpact > 0.6 ? (rightFootImpact - 0.6) * 2 : 0;
    if (crackAlpha > 0) {
      ctx.globalAlpha = crackAlpha * 0.6;
      ctx.beginPath();
      let cx = x + size * 0.12;
      let cy = y + size * 0.48;
      ctx.moveTo(cx, cy);
      for (let seg = 0; seg < 3; seg++) {
        const bend = Math.sin(crack * 3.1 + seg * 1.3) * 0.25;
        cx += Math.cos(crackAngle + bend) * size * 0.09;
        cy += size * (0.015 + seg * 0.01);
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;

  // === LAYER 2: BLOOD RAGE POOL BENEATH ===
  const poolGrad = ctx.createRadialGradient(
    x,
    y + size * 0.48,
    0,
    x,
    y + size * 0.48,
    size * 0.55 * furyScale,
  );
  poolGrad.addColorStop(0, `rgba(127, 29, 29, ${0.5 + heartbeatSharp * 0.2})`);
  poolGrad.addColorStop(
    0.35,
    `rgba(185, 28, 28, ${0.3 + heartbeatSharp * 0.15})`,
  );
  poolGrad.addColorStop(
    0.65,
    `rgba(220, 38, 38, ${0.15 + heartbeatSharp * 0.1})`,
  );
  poolGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.48,
    size * 0.55 * furyScale,
    size * 0.18 * furyScale,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Expanding blood rings
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 1.2 + ring * 0.33) % 1;
    const ringRadius = size * (0.2 + ringPhase * 0.4) * furyScale;
    const ringAlpha = (1 - ringPhase) * 0.3;
    ctx.strokeStyle = `rgba(220, 38, 38, ${ringAlpha})`;
    ctx.lineWidth = (1.5 - ringPhase) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + size * 0.48,
      ringRadius,
      ringRadius * 0.32,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // Blood pool surface bubbles
  for (let bub = 0; bub < 4; bub++) {
    const bubPhase = (time * 1.8 + bub * 0.25) % 1;
    const bubScale = Math.sin(bubPhase * Math.PI);
    const bx = x - size * 0.25 + bub * size * 0.17;
    ctx.strokeStyle = `rgba(185, 28, 28, ${bubScale * 0.4})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(
      bx,
      y + size * 0.48,
      size * 0.015 + bubScale * size * 0.012,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // === LAYER 3: BLOOD MIST AURA ===
  for (let mist = 0; mist < 10; mist++) {
    const mistAngle = time * 0.8 + (mist * Math.PI) / 5;
    const mistDist =
      (size * 0.5 + Math.sin(time * 2 + mist) * size * 0.12) * furyScale;
    const mistSize = size * (0.06 + Math.sin(time * 3 + mist * 1.7) * 0.03);
    ctx.fillStyle = `rgba(220, 38, 38, ${bloodPulse * 0.12})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(mistAngle) * mistDist,
      y + Math.sin(mistAngle) * mistDist * 0.5,
      mistSize,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Rage aura with heartbeat pulse
  const rageGrad = ctx.createRadialGradient(
    x,
    y,
    0,
    x,
    y,
    size * 0.85 * furyScale,
  );
  rageGrad.addColorStop(
    0,
    `rgba(220, 38, 38, ${(bloodPulse * 0.4 + heartbeatSharp * 0.2) * furyScale})`,
  );
  rageGrad.addColorStop(
    0.3,
    `rgba(185, 28, 28, ${bloodPulse * 0.3 + heartbeatSharp * 0.12})`,
  );
  rageGrad.addColorStop(
    0.6,
    `rgba(153, 27, 27, ${bloodPulse * 0.15 + heartbeatSharp * 0.06})`,
  );
  rageGrad.addColorStop(0.8, `rgba(127, 29, 29, ${bloodPulse * 0.06})`);
  rageGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = rageGrad;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.85 * furyScale, 0, Math.PI * 2);
  ctx.fill();

  // Rage particles (orbit faster during attack)
  const particleSpeed = isAttacking ? 2.5 : 1.2;
  for (let p = 0; p < 8; p++) {
    const pAngle = time * particleSpeed + (p * Math.PI) / 4;
    const pDist =
      size * (0.45 + Math.sin(time * 3 + p * 1.3) * 0.12) * furyScale;
    const pAlpha = 0.35 + Math.sin(time * 5 + p) * 0.2;
    ctx.fillStyle = `rgba(239, 68, 68, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(pAngle) * pDist,
      y + Math.sin(pAngle) * pDist * 0.45,
      size * 0.018,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Motion blur trails
  ctx.globalAlpha = 0.3;
  for (let i = 1; i < 4; i++) {
    ctx.fillStyle = `rgba(185, 28, 28, ${0.25 - i * 0.07})`;
    ctx.beginPath();
    ctx.ellipse(
      x + i * 8,
      y,
      size * (0.26 - i * 0.04),
      size * (0.36 - i * 0.05),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // === LAYER 4: ATTACK BLOOD SPLATTER ===
  if (isAttacking) {
    for (let splat = 0; splat < 12; splat++) {
      const splatAngle = (splat * Math.PI) / 6 + time * 0.5;
      const splatDist =
        size * (0.3 + attackIntensity * 0.5) *
        (0.5 + Math.sin(time * 8 + splat * 2.1) * 0.5);
      const splatSize =
        size * 0.025 * attackIntensity * (0.5 + Math.sin(splat * 3.7) * 0.5);
      ctx.fillStyle = `rgba(220, 38, 38, ${attackIntensity * 0.5})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(splatAngle) * splatDist + attackShake,
        y + Math.sin(splatAngle) * splatDist * 0.6,
        splatSize,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    // Blood spray arcs from weapons
    ctx.strokeStyle = `rgba(220, 38, 38, ${attackIntensity * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    for (let arc = 0; arc < 3; arc++) {
      const arcAngle = -Math.PI * 0.3 + arc * 0.3 + armSwing;
      const arcDist = size * 0.4 * attackIntensity;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.4, y - size * 0.1);
      ctx.quadraticCurveTo(
        x - size * 0.5 + Math.cos(arcAngle) * arcDist,
        y - size * 0.3 + Math.sin(arcAngle) * arcDist * 0.5,
        x - size * 0.3 + Math.cos(arcAngle + 0.5) * arcDist * 1.3,
        y - size * 0.2 + Math.sin(arcAngle + 0.5) * arcDist * 0.8,
      );
      ctx.stroke();
    }
  }

  // --- Animated stomping legs ---
  drawAnimatedLegs(ctx, x, y + size * 0.25 - bodyBob, size, time, zoom, {
    color: "#991b1b",
    colorDark: "#7f1d1d",
    footColor: "#450a0a",
    strideSpeed: 7,
    strideAmt: 0.4,
    legLen: 0.22,
    width: 0.07,
  });

  // --- Animated berserker arms ---
  drawAnimatedArm(
    ctx, x - size * 0.38, y - size * 0.12 - bodyBob,
    size, time, zoom, -1,
    {
      color: "#b91c1c",
      colorDark: "#7f1d1d",
      swingSpeed: 12,
      swingAmt: 0.6,
      baseAngle: 0.4,
      upperLen: 0.2,
      foreLen: 0.18,
      width: 0.08,
      handColor: "#991b1b",
      handRadius: 0.04,
      elbowBend: 0.5,
      attackExtra: isAttacking ? attackIntensity : 0,
    },
  );
  drawAnimatedArm(
    ctx, x + size * 0.38, y - size * 0.12 - bodyBob,
    size, time, zoom, 1,
    {
      color: "#b91c1c",
      colorDark: "#7f1d1d",
      swingSpeed: 12,
      swingAmt: 0.6,
      baseAngle: 0.4,
      upperLen: 0.2,
      foreLen: 0.18,
      width: 0.08,
      handColor: "#991b1b",
      handRadius: 0.04,
      elbowBend: 0.5,
      phaseOffset: Math.PI,
      attackExtra: isAttacking ? attackIntensity : 0,
    },
  );

  // === LAYER 5: MUSCULAR BODY WITH RUNE TATTOOS AND BATTLE SCARS ===
  const bodyGrad = ctx.createLinearGradient(
    x - size * 0.38,
    y - size * 0.15,
    x + size * 0.38,
    y + size * 0.1,
  );
  bodyGrad.addColorStop(0, "#450a0a");
  bodyGrad.addColorStop(0.2, "#7f1d1d");
  bodyGrad.addColorStop(0.45, "#b91c1c");
  bodyGrad.addColorStop(0.55, "#991b1b");
  bodyGrad.addColorStop(0.8, "#7f1d1d");
  bodyGrad.addColorStop(1, "#450a0a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.38, y + size * 0.42);
  ctx.lineTo(x - size * 0.42, y + size * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.48 - breathe * size,
    y - size * 0.05,
    x - size * 0.44 - breathe * size,
    y - size * 0.14,
  );
  ctx.quadraticCurveTo(x, y - size * 0.48, x + size * 0.44 + breathe * size, y - size * 0.14);
  ctx.quadraticCurveTo(
    x + size * 0.48 + breathe * size,
    y - size * 0.05,
    x + size * 0.42,
    y + size * 0.2,
  );
  ctx.lineTo(x + size * 0.38, y + size * 0.42);
  ctx.closePath();
  ctx.fill();

  // Chest muscle definition
  ctx.strokeStyle = `rgba(69, 10, 10, 0.4)`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3);
  ctx.lineTo(x, y + size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.2);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.18, x - size * 0.3, y - size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.03, y - size * 0.2);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.18, x + size * 0.3, y - size * 0.08);
  ctx.stroke();
  // Ab ridges
  for (let ab = 0; ab < 3; ab++) {
    const abY = y + size * 0.0 + ab * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12, abY);
    ctx.lineTo(x + size * 0.12, abY);
    ctx.stroke();
  }

  // === PULSING RUNE TATTOOS (with heartbeat animation) ===
  const runeAlpha = runeGlow + heartbeatSharp * 0.3;
  ctx.strokeStyle = `rgba(239, 68, 68, ${runeAlpha})`;
  ctx.lineWidth = 2 * zoom;

  // Left chest rune (circle-cross pattern)
  ctx.beginPath();
  ctx.arc(x - size * 0.16, y - size * 0.08, size * 0.055, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.135);
  ctx.lineTo(x - size * 0.16, y - size * 0.025);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.215, y - size * 0.08);
  ctx.lineTo(x - size * 0.105, y - size * 0.08);
  ctx.stroke();

  // Right chest rune (diamond pattern)
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.14);
  ctx.lineTo(x + size * 0.21, y - size * 0.08);
  ctx.lineTo(x + size * 0.16, y - size * 0.02);
  ctx.lineTo(x + size * 0.11, y - size * 0.08);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x + size * 0.16, y - size * 0.08, size * 0.025, 0, Math.PI * 2);
  ctx.stroke();

  // Torso vertical rune lines
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y + size * 0.05);
  ctx.lineTo(x - size * 0.12, y + size * 0.2);
  ctx.lineTo(x - size * 0.06, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y + size * 0.05);
  ctx.lineTo(x + size * 0.12, y + size * 0.2);
  ctx.lineTo(x + size * 0.06, y + size * 0.3);
  ctx.stroke();

  // Spine rune (center back / visible on chest glow)
  ctx.strokeStyle = `rgba(239, 68, 68, ${runeAlpha * 0.6})`;
  ctx.lineWidth = 1 * zoom;
  for (let dot = 0; dot < 5; dot++) {
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.15 + dot * size * 0.1,
      size * 0.012,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  // === ANIMATED VEINS / RAGE VEINS (pulse with heartbeat) ===
  const veinAlpha = 0.25 + heartbeatSharp * 0.45;
  ctx.strokeStyle = `rgba(220, 38, 38, ${veinAlpha})`;
  ctx.lineWidth = 1.2 * zoom;

  // Left shoulder veins
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.12);
  ctx.quadraticCurveTo(x - size * 0.28, y - size * 0.18, x - size * 0.18, y - size * 0.22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.1);
  ctx.quadraticCurveTo(x - size * 0.25, y - size * 0.02, x - size * 0.2, y + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.14);
  ctx.lineTo(x - size * 0.32, y - size * 0.05);
  ctx.stroke();

  // Right shoulder veins
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.12);
  ctx.quadraticCurveTo(x + size * 0.28, y - size * 0.18, x + size * 0.18, y - size * 0.22);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.25, y - size * 0.02, x + size * 0.2, y + size * 0.05);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y - size * 0.14);
  ctx.lineTo(x + size * 0.32, y - size * 0.05);
  ctx.stroke();

  // Chest veins branching from center
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.15);
  ctx.quadraticCurveTo(x - size * 0.08, y - size * 0.2, x - size * 0.15, y - size * 0.17);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.15);
  ctx.quadraticCurveTo(x + size * 0.08, y - size * 0.2, x + size * 0.15, y - size * 0.17);
  ctx.stroke();

  // === BATTLE SCARS AND WOUNDS ===
  ctx.strokeStyle = "rgba(69, 10, 10, 0.6)";
  ctx.lineWidth = 2.5 * zoom;
  // Diagonal chest scar
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.15);
  ctx.lineTo(x + size * 0.1, y + size * 0.2);
  ctx.stroke();
  // Scar highlight (lighter edge)
  ctx.strokeStyle = "rgba(185, 28, 28, 0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.24, y - size * 0.14);
  ctx.lineTo(x + size * 0.11, y + size * 0.21);
  ctx.stroke();

  // Short horizontal gash on right side
  ctx.strokeStyle = "rgba(69, 10, 10, 0.5)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y + size * 0.05);
  ctx.lineTo(x + size * 0.3, y + size * 0.02);
  ctx.stroke();

  // Puncture wound (small filled circle with glow)
  ctx.fillStyle = `rgba(127, 29, 29, ${0.5 + heartbeatSharp * 0.3})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y + size * 0.12, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(220, 38, 38, ${0.3 + heartbeatSharp * 0.2})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y + size * 0.12, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 6: DUAL-WIELDING ARMS WITH WEAPONS ===

  // Left arm - Cursed great axe
  ctx.save();
  ctx.translate(x - size * 0.42 + attackShake, y - size * 0.14 - bodyBob);
  ctx.rotate(-0.55 + armSwing);
  const armGradL = ctx.createLinearGradient(0, 0, 0, size * 0.42);
  armGradL.addColorStop(0, "#b91c1c");
  armGradL.addColorStop(0.5, "#991b1b");
  armGradL.addColorStop(1, "#7f1d1d");
  ctx.fillStyle = armGradL;
  // Upper arm (muscular taper)
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, 0);
  ctx.quadraticCurveTo(-size * 0.14, size * 0.12, -size * 0.1, size * 0.22);
  ctx.lineTo(size * 0.1, size * 0.22);
  ctx.quadraticCurveTo(size * 0.14, size * 0.12, size * 0.12, 0);
  ctx.closePath();
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#991b1b";
  ctx.beginPath();
  ctx.moveTo(-size * 0.09, size * 0.22);
  ctx.lineTo(-size * 0.07, size * 0.42);
  ctx.lineTo(size * 0.07, size * 0.42);
  ctx.lineTo(size * 0.09, size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Arm veins (pulse with heartbeat)
  ctx.strokeStyle = `rgba(220, 38, 38, ${veinAlpha})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.03);
  ctx.quadraticCurveTo(size * 0.04, size * 0.15, 0, size * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.08);
  ctx.lineTo(-size * 0.06, size * 0.25);
  ctx.stroke();

  // Arm rune band
  ctx.strokeStyle = `rgba(239, 68, 68, ${runeAlpha})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.11, size * 0.1);
  ctx.lineTo(size * 0.11, size * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.14);
  ctx.lineTo(size * 0.1, size * 0.14);
  ctx.stroke();

  // Axe handle (wrapped leather)
  ctx.fillStyle = "#292524";
  ctx.fillRect(-size * 0.035, size * 0.38, size * 0.07, size * 0.38);
  // Handle wrapping
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 1 * zoom;
  for (let wrap = 0; wrap < 5; wrap++) {
    const wy = size * 0.4 + wrap * size * 0.065;
    ctx.beginPath();
    ctx.moveTo(-size * 0.035, wy);
    ctx.lineTo(size * 0.035, wy + size * 0.03);
    ctx.stroke();
  }

  // Axe head - massive double-bladed
  ctx.fillStyle = "#52525b";
  ctx.beginPath();
  ctx.moveTo(-size * 0.025, size * 0.62);
  ctx.quadraticCurveTo(-size * 0.12, size * 0.58, -size * 0.2, size * 0.48);
  ctx.quadraticCurveTo(-size * 0.24, size * 0.55, -size * 0.2, size * 0.65);
  ctx.quadraticCurveTo(-size * 0.12, size * 0.68, -size * 0.025, size * 0.66);
  ctx.fill();
  // Axe edge glow
  ctx.strokeStyle = `rgba(220, 38, 38, ${bloodPulse * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.48);
  ctx.quadraticCurveTo(-size * 0.24, size * 0.55, -size * 0.2, size * 0.65);
  ctx.stroke();
  // Blood drip from axe
  const dripY = (time * 2) % 1;
  ctx.fillStyle = `rgba(220, 38, 38, ${(1 - dripY) * 0.6})`;
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.22,
    size * 0.58 + dripY * size * 0.15,
    size * 0.008,
    size * 0.015,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Rune etching on blade
  ctx.strokeStyle = `rgba(239, 68, 68, ${runeAlpha * 0.5})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.55);
  ctx.lineTo(-size * 0.14, size * 0.6);
  ctx.lineTo(-size * 0.1, size * 0.63);
  ctx.stroke();
  ctx.restore();

  // Right arm - War cleaver / second blade
  ctx.save();
  ctx.translate(x + size * 0.42 + attackShake, y - size * 0.14 - bodyBob);
  ctx.rotate(0.55 - armSwing);
  const armGradR = ctx.createLinearGradient(0, 0, 0, size * 0.42);
  armGradR.addColorStop(0, "#b91c1c");
  armGradR.addColorStop(0.5, "#991b1b");
  armGradR.addColorStop(1, "#7f1d1d");
  ctx.fillStyle = armGradR;
  // Upper arm
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, 0);
  ctx.quadraticCurveTo(-size * 0.14, size * 0.12, -size * 0.1, size * 0.22);
  ctx.lineTo(size * 0.1, size * 0.22);
  ctx.quadraticCurveTo(size * 0.14, size * 0.12, size * 0.12, 0);
  ctx.closePath();
  ctx.fill();
  // Forearm
  ctx.fillStyle = "#991b1b";
  ctx.beginPath();
  ctx.moveTo(-size * 0.09, size * 0.22);
  ctx.lineTo(-size * 0.07, size * 0.42);
  ctx.lineTo(size * 0.07, size * 0.42);
  ctx.lineTo(size * 0.09, size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Arm veins
  ctx.strokeStyle = `rgba(220, 38, 38, ${veinAlpha})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, size * 0.03);
  ctx.quadraticCurveTo(-size * 0.04, size * 0.15, 0, size * 0.32);
  ctx.stroke();

  // Arm scar
  ctx.strokeStyle = "rgba(69, 10, 10, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, size * 0.12);
  ctx.lineTo(size * 0.04, size * 0.28);
  ctx.stroke();

  // War cleaver handle
  ctx.fillStyle = "#292524";
  ctx.fillRect(-size * 0.03, size * 0.38, size * 0.06, size * 0.22);
  // Cleaver blade (broad, straight)
  ctx.fillStyle = "#71717a";
  ctx.beginPath();
  ctx.moveTo(size * 0.03, size * 0.55);
  ctx.lineTo(size * 0.18, size * 0.48);
  ctx.lineTo(size * 0.22, size * 0.52);
  ctx.lineTo(size * 0.22, size * 0.72);
  ctx.lineTo(size * 0.18, size * 0.75);
  ctx.lineTo(size * 0.03, size * 0.68);
  ctx.closePath();
  ctx.fill();
  // Cleaver edge highlight
  ctx.strokeStyle = `rgba(200, 200, 210, 0.4)`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.22, size * 0.52);
  ctx.lineTo(size * 0.22, size * 0.72);
  ctx.stroke();
  // Blood stain on blade
  ctx.fillStyle = `rgba(185, 28, 28, 0.5)`;
  ctx.beginPath();
  ctx.moveTo(size * 0.1, size * 0.58);
  ctx.quadraticCurveTo(size * 0.15, size * 0.62, size * 0.12, size * 0.68);
  ctx.quadraticCurveTo(size * 0.08, size * 0.64, size * 0.1, size * 0.58);
  ctx.fill();
  // Blade rune
  ctx.strokeStyle = `rgba(239, 68, 68, ${runeAlpha * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.12, size * 0.54);
  ctx.lineTo(size * 0.15, size * 0.6);
  ctx.lineTo(size * 0.12, size * 0.66);
  ctx.stroke();
  ctx.restore();

  // === LAYER 7: HEAD WITH WAR PAINT ===
  const headGrad = ctx.createRadialGradient(
    x + attackShake,
    headY,
    0,
    x + attackShake,
    headY,
    size * 0.22,
  );
  headGrad.addColorStop(0, "#a8a29e");
  headGrad.addColorStop(0.4, "#8a8178");
  headGrad.addColorStop(0.7, "#78716c");
  headGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(x + attackShake, headY, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Head rage veins (visible on temples)
  ctx.strokeStyle = `rgba(220, 38, 38, ${veinAlpha * 0.8})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + attackShake, headY - size * 0.04);
  ctx.quadraticCurveTo(
    x - size * 0.14 + attackShake,
    headY - size * 0.1,
    x - size * 0.08 + attackShake,
    headY - size * 0.12,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18 + attackShake, headY - size * 0.04);
  ctx.quadraticCurveTo(
    x + size * 0.14 + attackShake,
    headY - size * 0.1,
    x + size * 0.08 + attackShake,
    headY - size * 0.12,
  );
  ctx.stroke();

  // === WAR PAINT (three horizontal blood stripes across face) ===
  ctx.fillStyle = `rgba(185, 28, 28, ${0.65 + heartbeatSharp * 0.15})`;
  // Top stripe across forehead
  ctx.beginPath();
  ctx.ellipse(
    x + attackShake,
    headY - size * 0.1,
    size * 0.16,
    size * 0.018,
    -0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Middle stripe across eyes
  ctx.fillStyle = `rgba(127, 29, 29, ${0.7 + heartbeatSharp * 0.15})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19 + attackShake, headY - size * 0.05);
  ctx.lineTo(x + size * 0.19 + attackShake, headY - size * 0.03);
  ctx.lineTo(x + size * 0.19 + attackShake, headY + size * 0.01);
  ctx.lineTo(x - size * 0.19 + attackShake, headY - size * 0.01);
  ctx.closePath();
  ctx.fill();
  // Lower jaw stripe
  ctx.fillStyle = `rgba(185, 28, 28, ${0.5 + heartbeatSharp * 0.1})`;
  ctx.beginPath();
  ctx.ellipse(
    x + attackShake,
    headY + size * 0.1,
    size * 0.12,
    size * 0.015,
    0.1,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Face rune markings (vertical tribal lines)
  ctx.strokeStyle = `rgba(239, 68, 68, ${runeAlpha})`;
  ctx.lineWidth = 2 * zoom;
  // Left cheek rune
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16 + attackShake, headY - size * 0.06);
  ctx.lineTo(x - size * 0.12 + attackShake, headY + size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14 + attackShake, headY - size * 0.02);
  ctx.lineTo(x - size * 0.18 + attackShake, headY + size * 0.04);
  ctx.stroke();
  // Right cheek rune
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16 + attackShake, headY - size * 0.06);
  ctx.lineTo(x + size * 0.12 + attackShake, headY + size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14 + attackShake, headY - size * 0.02);
  ctx.lineTo(x + size * 0.18 + attackShake, headY + size * 0.04);
  ctx.stroke();
  // Forehead rune (vertical center)
  ctx.beginPath();
  ctx.moveTo(x + attackShake, headY - size * 0.18);
  ctx.lineTo(x + attackShake, headY - size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03 + attackShake, headY - size * 0.14);
  ctx.lineTo(x + size * 0.03 + attackShake, headY - size * 0.14);
  ctx.stroke();

  // Demonic eyes (intense blood glow with rage)
  const eyeSize = size * (0.05 + heartbeatSharp * 0.008);
  ctx.fillStyle = "#fef2f2";
  ctx.beginPath();
  ctx.arc(x - size * 0.08 + attackShake, headY - size * 0.02, eyeSize, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08 + attackShake, headY - size * 0.02, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#dc2626";
  setShadowBlur(ctx, 12 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08 + attackShake,
    headY - size * 0.02,
    size * 0.032,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08 + attackShake,
    headY - size * 0.02,
    size * 0.032,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  // Pupil slits
  ctx.fillStyle = "#450a0a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08 + attackShake,
    headY - size * 0.02,
    size * 0.008,
    size * 0.022,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08 + attackShake,
    headY - size * 0.02,
    size * 0.008,
    size * 0.022,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye brow ridges (furrowed)
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14 + attackShake, headY - size * 0.06);
  ctx.quadraticCurveTo(
    x - size * 0.08 + attackShake,
    headY - size * 0.1,
    x - size * 0.03 + attackShake,
    headY - size * 0.07,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14 + attackShake, headY - size * 0.06);
  ctx.quadraticCurveTo(
    x + size * 0.08 + attackShake,
    headY - size * 0.1,
    x + size * 0.03 + attackShake,
    headY - size * 0.07,
  );
  ctx.stroke();

  // Screaming mouth with fangs
  const mouthOpen = size * (0.055 + Math.abs(rage) * 0.01) + (isAttacking ? attackIntensity * size * 0.02 : 0);
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(
    x + attackShake,
    headY + size * 0.1,
    size * 0.1,
    mouthOpen,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Tongue
  ctx.fillStyle = "#991b1b";
  ctx.beginPath();
  ctx.ellipse(
    x + attackShake,
    headY + size * 0.11,
    size * 0.05,
    mouthOpen * 0.5,
    0,
    0,
    Math.PI,
  );
  ctx.fill();
  // Upper fangs
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08 + attackShake, headY + size * 0.06);
  ctx.lineTo(x - size * 0.06 + attackShake, headY + size * 0.14);
  ctx.lineTo(x - size * 0.04 + attackShake, headY + size * 0.06);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08 + attackShake, headY + size * 0.06);
  ctx.lineTo(x + size * 0.06 + attackShake, headY + size * 0.14);
  ctx.lineTo(x + size * 0.04 + attackShake, headY + size * 0.06);
  ctx.fill();
  // Lower fangs
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05 + attackShake, headY + size * 0.15);
  ctx.lineTo(x - size * 0.035 + attackShake, headY + size * 0.08);
  ctx.lineTo(x - size * 0.02 + attackShake, headY + size * 0.15);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05 + attackShake, headY + size * 0.15);
  ctx.lineTo(x + size * 0.035 + attackShake, headY + size * 0.08);
  ctx.lineTo(x + size * 0.02 + attackShake, headY + size * 0.15);
  ctx.fill();

  // Face scar (across nose/cheek)
  ctx.strokeStyle = "rgba(69, 10, 10, 0.5)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + attackShake, headY + size * 0.02);
  ctx.lineTo(x + size * 0.06 + attackShake, headY - size * 0.06);
  ctx.stroke();

  // === RAGE STEAM / BREATH EFFECT ===
  const breathIntensity = 0.3 + heartbeatSharp * 0.4 + (isAttacking ? attackIntensity * 0.3 : 0);
  for (let steam = 0; steam < 5; steam++) {
    const steamPhase = (time * 2 + steam * 0.2) % 1;
    const steamY = headY + size * 0.08 - steamPhase * size * 0.25;
    const steamX =
      x +
      attackShake +
      Math.sin(time * 6 + steam * 1.5) * size * 0.04 +
      (steam - 2) * size * 0.03;
    const steamAlpha = (1 - steamPhase) * breathIntensity * 0.35;
    const steamSize = size * (0.02 + steamPhase * 0.04);
    ctx.fillStyle = `rgba(220, 38, 38, ${steamAlpha})`;
    ctx.beginPath();
    ctx.arc(steamX, steamY, steamSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Nostril steam wisps (twin plumes)
  for (let plume = 0; plume < 3; plume++) {
    const plumePhase = (time * 2.5 + plume * 0.33) % 1;
    const plumeAlpha = (1 - plumePhase) * breathIntensity * 0.25;
    const plumeRise = plumePhase * size * 0.18;
    // Left nostril
    ctx.fillStyle = `rgba(200, 40, 40, ${plumeAlpha})`;
    ctx.beginPath();
    ctx.arc(
      x - size * 0.03 + attackShake + Math.sin(time * 5 + plume) * size * 0.015,
      headY + size * 0.04 - plumeRise,
      size * (0.012 + plumePhase * 0.02),
      0,
      Math.PI * 2,
    );
    ctx.fill();
    // Right nostril
    ctx.beginPath();
    ctx.arc(
      x + size * 0.03 + attackShake + Math.sin(time * 5 + plume + 1) * size * 0.015,
      headY + size * 0.04 - plumeRise,
      size * (0.012 + plumePhase * 0.02),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === WILD FLAMING HAIR WITH HORNS ===
  ctx.fillStyle = "#991b1b";
  for (let i = 0; i < 11; i++) {
    const hairAngle = -Math.PI * 0.4 + i * Math.PI * 0.08;
    const hairLen = size * (0.22 + Math.sin(time * 10 + i) * 0.06);
    const hairFlicker = Math.sin(time * 12 + i * 2.3) * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(hairAngle) * size * 0.16 + attackShake,
      headY - size * 0.12,
    );
    ctx.quadraticCurveTo(
      x +
        Math.cos(hairAngle) * size * 0.28 +
        hairFlicker +
        attackShake,
      headY - size * 0.28,
      x + Math.cos(hairAngle) * size * 0.22 + attackShake,
      headY - size * 0.12 - hairLen,
    );
    ctx.lineTo(
      x + Math.cos(hairAngle) * size * 0.13 + attackShake,
      headY - size * 0.1,
    );
    ctx.fill();
  }

  // Hair flame tips (brighter)
  ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + heartbeatSharp * 0.2})`;
  for (let tip = 0; tip < 6; tip++) {
    const tipAngle = -Math.PI * 0.3 + tip * Math.PI * 0.12;
    const tipLen = size * (0.08 + Math.sin(time * 14 + tip * 1.7) * 0.04);
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(tipAngle) * size * 0.2 + attackShake,
      headY - size * 0.3 - Math.sin(time * 10 + tip) * size * 0.04,
    );
    ctx.lineTo(
      x + Math.cos(tipAngle) * size * 0.22 + Math.sin(time * 12 + tip) * size * 0.03 + attackShake,
      headY - size * 0.3 - tipLen,
    );
    ctx.lineTo(
      x + Math.cos(tipAngle) * size * 0.18 + attackShake,
      headY - size * 0.28,
    );
    ctx.fill();
  }

  // Demon horns (curved, ridged)
  const hornGrad = ctx.createLinearGradient(0, headY - size * 0.15, 0, headY - size * 0.7);
  hornGrad.addColorStop(0, "#292524");
  hornGrad.addColorStop(0.4, "#1c1917");
  hornGrad.addColorStop(0.8, "#0c0a09");
  hornGrad.addColorStop(1, "#450a0a");
  ctx.fillStyle = hornGrad;
  // Left horn
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12 + attackShake, headY - size * 0.14);
  ctx.quadraticCurveTo(
    x - size * 0.22 + attackShake,
    headY - size * 0.38,
    x - size * 0.18 + attackShake,
    headY - size * 0.52,
  );
  ctx.lineTo(x - size * 0.14 + attackShake, headY - size * 0.48);
  ctx.quadraticCurveTo(
    x - size * 0.17 + attackShake,
    headY - size * 0.32,
    x - size * 0.08 + attackShake,
    headY - size * 0.13,
  );
  ctx.closePath();
  ctx.fill();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12 + attackShake, headY - size * 0.14);
  ctx.quadraticCurveTo(
    x + size * 0.22 + attackShake,
    headY - size * 0.38,
    x + size * 0.18 + attackShake,
    headY - size * 0.52,
  );
  ctx.lineTo(x + size * 0.14 + attackShake, headY - size * 0.48);
  ctx.quadraticCurveTo(
    x + size * 0.17 + attackShake,
    headY - size * 0.32,
    x + size * 0.08 + attackShake,
    headY - size * 0.13,
  );
  ctx.closePath();
  ctx.fill();

  // Horn ridges
  ctx.strokeStyle = "rgba(87, 83, 78, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let ridge = 0; ridge < 4; ridge++) {
    const rt = 0.2 + ridge * 0.18;
    // Left horn ridges
    const lhx =
      x -
      size * (0.12 + rt * 0.06) +
      attackShake;
    const lhy = headY - size * (0.14 + rt * 0.34);
    ctx.beginPath();
    ctx.moveTo(lhx - size * 0.02, lhy);
    ctx.lineTo(lhx + size * 0.02, lhy);
    ctx.stroke();
    // Right horn ridges
    const rhx =
      x +
      size * (0.12 + rt * 0.06) +
      attackShake;
    ctx.beginPath();
    ctx.moveTo(rhx - size * 0.02, lhy);
    ctx.lineTo(rhx + size * 0.02, lhy);
    ctx.stroke();
  }

  // Horn tip glow
  setShadowBlur(ctx, 6 * zoom, "#dc2626");
  ctx.fillStyle = `rgba(220, 38, 38, ${runeAlpha * 0.5})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.18 + attackShake,
    headY - size * 0.52,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.18 + attackShake,
    headY - size * 0.52,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // --- Red rage glow rings ---
  drawPulsingGlowRings(
    ctx, x + attackShake, y - bodyBob, size * 0.4, time, zoom,
    {
      color: "rgba(239, 68, 68, 0.5)",
      count: 3,
      speed: 2.0,
      maxAlpha: 0.4 + (isAttacking ? attackIntensity * 0.3 : 0),
      expansion: 1.5,
      lineWidth: 2,
    },
  );

  // --- Floating blood/dark shards ---
  drawShiftingSegments(
    ctx, x + attackShake, y - bodyBob, size, time, zoom,
    {
      color: "#7f1d1d",
      colorAlt: "#450a0a",
      count: 6,
      orbitRadius: 0.4,
      segmentSize: 0.035,
      orbitSpeed: 2.0,
      bobSpeed: 3.5,
      bobAmt: 0.04,
      shape: "shard",
      rotateWithOrbit: true,
    },
  );

  // === LAYER 8: FOOT IMPACT DUST ===
  if (leftFootImpact > 0.8) {
    ctx.fillStyle = `rgba(120, 30, 30, ${(leftFootImpact - 0.8) * 2.5})`;
    for (let dust = 0; dust < 4; dust++) {
      ctx.beginPath();
      ctx.arc(
        x - size * 0.14 + (dust - 1.5) * size * 0.06,
        y + size * 0.5,
        size * 0.018 * (leftFootImpact - 0.8) * 4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  if (rightFootImpact > 0.8) {
    ctx.fillStyle = `rgba(120, 30, 30, ${(rightFootImpact - 0.8) * 2.5})`;
    for (let dust = 0; dust < 4; dust++) {
      ctx.beginPath();
      ctx.arc(
        x + size * 0.14 + (dust - 1.5) * size * 0.06,
        y + size * 0.5,
        size * 0.018 * (rightFootImpact - 0.8) * 4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
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

  // --- Earth-colored pulsing glow rings ---
  drawPulsingGlowRings(ctx, x, y, size * 0.45, time, zoom, {
    color: "rgba(251, 191, 36, 0.4)",
    count: 3,
    speed: 1.0,
    maxAlpha: 0.35,
    expansion: 1.6,
    lineWidth: 2,
  });

  // --- Floating rock/crystal segments orbiting ---
  drawShiftingSegments(ctx, x, y, size, time, zoom, {
    color: "#78716c",
    colorAlt: "#57534e",
    count: 5,
    orbitRadius: 0.45,
    segmentSize: 0.045,
    orbitSpeed: 0.8,
    bobSpeed: 2,
    bobAmt: 0.05,
    shape: "diamond",
    rotateWithOrbit: true,
  });

  // --- Orbiting stone debris ---
  drawOrbitingDebris(ctx, x, y, size, time, zoom, {
    color: "#a8a29e",
    glowColor: "rgba(251, 191, 36, 0.3)",
    count: 6,
    speed: 1.2,
    particleSize: 0.025,
    minRadius: 0.35,
    maxRadius: 0.55,
    trailLen: 2,
  });

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


  // --- Shuffling animated legs ---
  drawAnimatedLegs(ctx, x, y + size * 0.3 + hover * 0.3, size, time, zoom, {
    color: "#1e1b4b",
    colorDark: "#0a0820",
    footColor: "#312e81",
    strideSpeed: 2.5,
    strideAmt: 0.15,
    legLen: 0.18,
    width: 0.05,
    shuffle: true,
  });

  // --- Spell-casting animated arms ---
  drawAnimatedArm(
    ctx, x - size * 0.35, y - size * 0.25 + hover,
    size, time, zoom, -1,
    {
      color: "#1e1b4b",
      colorDark: "#0a0820",
      swingSpeed: 3,
      swingAmt: 0.3,
      baseAngle: 0.5,
      upperLen: 0.18,
      foreLen: 0.16,
      width: 0.05,
      handColor: "#e8e0d0",
      handRadius: 0.03,
      elbowBend: 0.6,
    },
  );
  drawAnimatedArm(
    ctx, x + size * 0.35, y - size * 0.25 + hover,
    size, time, zoom, 1,
    {
      color: "#1e1b4b",
      colorDark: "#0a0820",
      swingSpeed: 3,
      swingAmt: 0.3,
      baseAngle: 0.5,
      upperLen: 0.18,
      foreLen: 0.16,
      width: 0.05,
      handColor: "#e8e0d0",
      handRadius: 0.03,
      elbowBend: 0.6,
      phaseOffset: Math.PI * 0.5,
    },
  );

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

  // --- Death shadow wisps ---
  drawShadowWisps(ctx, x, y + hover, size * 0.4, time, zoom, {
    color: "rgba(74, 222, 128, 0.35)",
    count: 5,
    speed: 1.5,
    maxAlpha: 0.35,
    wispLength: 0.5,
  });

  // --- Floating skull/bone shards ---
  drawShiftingSegments(ctx, x, y + hover, size, time, zoom, {
    color: "#e8e0d0",
    colorAlt: "#a8a29e",
    count: 5,
    orbitRadius: 0.45,
    segmentSize: 0.04,
    orbitSpeed: 1.2,
    bobSpeed: 2.5,
    bobAmt: 0.05,
    shape: "shard",
    rotateWithOrbit: true,
  });


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

  // --- Marching animated arms ---
  drawAnimatedArm(
    ctx, x - size * 0.35, y - size * 0.18 + stance,
    size, time, zoom, -1,
    {
      color: "#3f3f46",
      colorDark: "#27272a",
      swingSpeed: 5,
      swingAmt: 0.2,
      baseAngle: 0.35,
      upperLen: 0.2,
      foreLen: 0.17,
      width: 0.07,
      handColor: "#52525b",
      handRadius: 0.035,
      elbowBend: 0.45,
    },
  );
  drawAnimatedArm(
    ctx, x + size * 0.35, y - size * 0.18 + stance,
    size, time, zoom, 1,
    {
      color: "#3f3f46",
      colorDark: "#27272a",
      swingSpeed: 5,
      swingAmt: 0.2,
      baseAngle: 0.35,
      upperLen: 0.2,
      foreLen: 0.17,
      width: 0.07,
      handColor: "#52525b",
      handRadius: 0.035,
      elbowBend: 0.45,
      phaseOffset: Math.PI,
    },
  );

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

  // --- Dark shadow wisps ---
  drawShadowWisps(ctx, x, y + stance, size * 0.4, time, zoom, {
    color: "rgba(139, 92, 246, 0.4)",
    count: 4,
    speed: 1.8,
    maxAlpha: 0.35,
    wispLength: 0.45,
  });

  // --- Floating shadow plate segments ---
  drawShiftingSegments(ctx, x, y + stance, size, time, zoom, {
    color: "#3f3f46",
    colorAlt: "#27272a",
    count: 5,
    orbitRadius: 0.42,
    segmentSize: 0.045,
    orbitSpeed: 1.5,
    bobSpeed: 2.5,
    bobAmt: 0.04,
    shape: "diamond",
    rotateWithOrbit: true,
  });
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


  // --- Slow shuffling animated legs ---
  drawAnimatedLegs(ctx, x, y + size * 0.25, size, time, zoom, {
    color: "#2a1810",
    colorDark: "#1a0a05",
    footColor: "#3d1f14",
    strideSpeed: 2,
    strideAmt: 0.12,
    legLen: 0.16,
    width: 0.045,
    shuffle: true,
  });

  // --- Ritual gesture animated arms ---
  drawAnimatedArm(
    ctx, x - size * 0.2, y - size * 0.15,
    size, time, zoom, -1,
    {
      color: bodyColorDark,
      colorDark: "#1a0a05",
      swingSpeed: 2.5,
      swingAmt: 0.25,
      baseAngle: 0.6,
      upperLen: 0.16,
      foreLen: 0.14,
      width: 0.045,
      handColor: "#c4a882",
      handRadius: 0.03,
      elbowBend: 0.5,
    },
  );
  drawAnimatedArm(
    ctx, x + size * 0.2, y - size * 0.15,
    size, time, zoom, 1,
    {
      color: bodyColorDark,
      colorDark: "#1a0a05",
      swingSpeed: 2.5,
      swingAmt: 0.25,
      baseAngle: 0.6,
      upperLen: 0.16,
      foreLen: 0.14,
      width: 0.045,
      handColor: "#c4a882",
      handRadius: 0.03,
      elbowBend: 0.5,
      phaseOffset: Math.PI,
    },
  );

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

  // --- Sickly shadow wisps ---
  drawShadowWisps(ctx, x, y, size * 0.35, time, zoom, {
    color: "rgba(255, 100, 50, 0.3)",
    count: 3,
    speed: 1.5,
    maxAlpha: 0.28,
    wispLength: 0.4,
  });

  // --- Floating ritual symbol shards ---
  drawShiftingSegments(ctx, x, y, size, time, zoom, {
    color: "#7c2d12",
    colorAlt: "#9a3412",
    count: 4,
    orbitRadius: 0.4,
    segmentSize: 0.035,
    orbitSpeed: 1.0,
    bobSpeed: 2,
    bobAmt: 0.04,
    shape: "shard",
    rotateWithOrbit: true,
  });

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

  // --- Shambling animated legs ---
  drawAnimatedLegs(ctx, x, y + size * 0.25, size, time, zoom, {
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: bodyColorDark,
    strideSpeed: 2,
    strideAmt: 0.12,
    legLen: 0.18,
    width: 0.055,
    shuffle: true,
    phaseOffset: 0.5,
  });

  // --- Hunched dripping animated arms ---
  drawAnimatedArm(
    ctx, x - size * 0.36, y - size * 0.08,
    size, time, zoom, -1,
    {
      color: bodyColor,
      colorDark: bodyColorDark,
      swingSpeed: 2,
      swingAmt: 0.15,
      baseAngle: 0.5,
      upperLen: 0.16,
      foreLen: 0.14,
      width: 0.055,
      handColor: bodyColorDark,
      handRadius: 0.03,
      elbowBend: 0.6,
    },
  );
  drawAnimatedArm(
    ctx, x + size * 0.36, y - size * 0.08,
    size, time, zoom, 1,
    {
      color: bodyColor,
      colorDark: bodyColorDark,
      swingSpeed: 2,
      swingAmt: 0.15,
      baseAngle: 0.5,
      upperLen: 0.16,
      foreLen: 0.14,
      width: 0.055,
      handColor: bodyColorDark,
      handRadius: 0.03,
      elbowBend: 0.6,
      phaseOffset: Math.PI,
    },
  );

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

  // --- Toxic plague bubbles ---
  drawPoisonBubbles(ctx, x, y, size * 0.4, time, zoom, {
    color: "rgba(132, 204, 22, 0.45)",
    count: 6,
    speed: 1.3,
    maxAlpha: 0.4,
    spread: 0.9,
  });

  // --- Floating plague cloud pieces ---
  drawShiftingSegments(ctx, x, y, size, time, zoom, {
    color: "rgba(101, 163, 13, 0.6)",
    colorAlt: "rgba(132, 204, 22, 0.5)",
    count: 6,
    orbitRadius: 0.45,
    segmentSize: 0.035,
    orbitSpeed: 0.8,
    bobSpeed: 2,
    bobAmt: 0.05,
    shape: "circle",
    rotateWithOrbit: false,
  });

  // --- Orbiting toxic debris ---
  drawOrbitingDebris(ctx, x, y, size, time, zoom, {
    color: "rgba(200, 255, 50, 0.6)",
    glowColor: "rgba(132, 204, 22, 0.3)",
    count: 5,
    speed: 1.0,
    particleSize: 0.02,
    minRadius: 0.3,
    maxRadius: 0.5,
    trailLen: 3,
  });

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

