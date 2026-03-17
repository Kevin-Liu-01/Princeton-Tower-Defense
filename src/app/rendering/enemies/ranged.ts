import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawRadialAura,
  drawRobeBody,
} from "./helpers";
import {
  drawAnimatedArm,
  drawAnimatedLegs,
  drawPulsingGlowRings,
  drawArcaneSparkles,
  drawShiftingSegments,
  drawOrbitingDebris,
  drawFloatingPiece,
} from "./animationHelpers";

export function drawArcherEnemy(
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
  const stance =
    Math.sin(time * 2.5) * 2.5 * zoom +
    (isAttacking ? attackIntensity * size * 0.12 : 0);
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.5)
    : 0.7 + Math.sin(time * 1.5) * 0.2;
  const drawPull = chargeLevel * 0.6;
  const shadowPulse = 0.6 + Math.sin(time * 4) * 0.4;
  const soulIntensity = isAttacking
    ? 0.7 + attackIntensity * 0.3
    : 0.4 + Math.sin(time * 3.5) * 0.2;

  // Spectral domain ground pool
  const poolGrad = ctx.createRadialGradient(
    x, y + size * 0.48, 0,
    x, y + size * 0.48, size * 0.55,
  );
  poolGrad.addColorStop(0, `rgba(16, 185, 129, ${soulIntensity * 0.3})`);
  poolGrad.addColorStop(0.4, `rgba(5, 150, 105, ${soulIntensity * 0.15})`);
  poolGrad.addColorStop(0.7, `rgba(4, 120, 87, ${soulIntensity * 0.08})`);
  poolGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.55, size * 0.55 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rippling soul rings on ground
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.7 + ring * 0.35) % 1;
    const ringSize = size * (0.18 + ringPhase * 0.35);
    const ringAlpha = (0.35 - ringPhase * 0.3) * soulIntensity;
    ctx.strokeStyle = `rgba(52, 211, 153, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.48, ringSize, ringSize * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Orbiting soul wisps
  for (let w = 0; w < 4; w++) {
    const wispAngle = time * 1.5 + w * Math.PI * 0.5;
    const wispDist = size * 0.48 + Math.sin(time * 2 + w) * size * 0.06;
    const wx = x + Math.cos(wispAngle) * wispDist;
    const wy = y - size * 0.05 + Math.sin(wispAngle) * wispDist * 0.35 + stance * 0.3;
    const wispAlpha = 0.4 + Math.sin(time * 4 + w) * 0.2;

    const wispGlow = ctx.createRadialGradient(wx, wy, 0, wx, wy, size * 0.06);
    wispGlow.addColorStop(0, `rgba(52, 211, 153, ${wispAlpha})`);
    wispGlow.addColorStop(0.5, `rgba(16, 185, 129, ${wispAlpha * 0.4})`);
    wispGlow.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.fillStyle = wispGlow;
    ctx.beginPath();
    ctx.arc(wx, wy, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(167, 243, 208, ${wispAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(wx, wy, size * 0.015, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(52, 211, 153, ${wispAlpha * 0.3})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(
      wx - Math.cos(wispAngle) * size * 0.1,
      wy - Math.sin(wispAngle) * size * 0.04,
    );
    ctx.stroke();
  }

  // Rising soul particles
  for (let p = 0; p < 10; p++) {
    const particlePhase = (time * 0.5 + p * 0.12) % 1;
    const particleAngle = (p * Math.PI) / 5 + time * 0.2;
    const particleDist = size * (0.15 + particlePhase * 0.35);
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y + size * 0.2 - particlePhase * size * 0.7 + stance * 0.2;
    const particleAlpha = (1 - particlePhase) * 0.45 * soulIntensity;
    const particleSize = size * 0.018 * (1 - particlePhase * 0.6);
    ctx.fillStyle = `rgba(52, 211, 153, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Enchanted quiver
  ctx.save();
  ctx.translate(x + size * 0.28, y - size * 0.06 + stance * 0.3);
  ctx.rotate(0.28);
  const quiverGrad = ctx.createLinearGradient(-size * 0.08, -size * 0.4, size * 0.08, -size * 0.4);
  quiverGrad.addColorStop(0, "#1c1917");
  quiverGrad.addColorStop(0.5, "#44403c");
  quiverGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = quiverGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.09, size * 0.1);
  ctx.lineTo(-size * 0.1, -size * 0.38);
  ctx.quadraticCurveTo(0, -size * 0.42, size * 0.1, -size * 0.38);
  ctx.lineTo(size * 0.09, size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.35);
  ctx.lineTo(-size * 0.08, size * 0.08);
  ctx.moveTo(size * 0.08, -size * 0.35);
  ctx.lineTo(size * 0.08, size * 0.08);
  ctx.stroke();
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 1 * zoom;
  for (let stitch = 0; stitch < 4; stitch++) {
    const sy = -size * 0.3 + stitch * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, sy);
    ctx.lineTo(-size * 0.06, sy + size * 0.02);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i++) {
    const arrowX = -size * 0.04 + i * size * 0.025;
    ctx.strokeStyle = "#047857";
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(arrowX, -size * 0.36);
    ctx.lineTo(arrowX, -size * 0.6);
    ctx.stroke();
    ctx.fillStyle = `rgba(52, 211, 153, ${shadowPulse})`;
    ctx.beginPath();
    ctx.moveTo(arrowX, -size * 0.6);
    ctx.lineTo(arrowX - size * 0.015, -size * 0.66);
    ctx.lineTo(arrowX + size * 0.015, -size * 0.66);
    ctx.fill();
  }
  ctx.fillStyle = `rgba(52, 211, 153, ${shadowPulse * 0.6})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.15, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // === ANIMATED LEGS (beneath cloak) ===
  drawAnimatedLegs(ctx, x, y + size * 0.38, size, time, zoom, {
    color: "#064e3b",
    colorDark: "#022c22",
    footColor: "#1c1917",
    strideSpeed: 5,
    strideAmt: 0.3,
    legLen: 0.18,
    width: 0.05,
  });

  // === ANIMATED ARMS ===
  drawAnimatedArm(ctx, x - size * 0.2, y - size * 0.18 + stance, size, time, zoom, -1, {
    color: "#064e3b",
    colorDark: "#022c22",
    handColor: "#d6d3d1",
    swingSpeed: 1.5,
    swingAmt: 0.1,
    baseAngle: 0.6,
    upperLen: 0.18,
    foreLen: 0.16,
    width: 0.055,
  });
  drawAnimatedArm(ctx, x + size * 0.2, y - size * 0.18 + stance, size, time, zoom, 1, {
    color: "#064e3b",
    colorDark: "#022c22",
    handColor: "#d6d3d1",
    swingSpeed: 2.5,
    swingAmt: 0.2,
    baseAngle: 0.4,
    upperLen: 0.17,
    foreLen: 0.14,
    width: 0.05,
    attackExtra: isAttacking ? attackIntensity : 0,
  });

  // Back cloak layer (darker, wider)
  const backCloakGrad = ctx.createLinearGradient(x - size * 0.45, y, x + size * 0.45, y);
  backCloakGrad.addColorStop(0, "#022c22");
  backCloakGrad.addColorStop(0.5, "#064e3b");
  backCloakGrad.addColorStop(1, "#022c22");
  ctx.fillStyle = backCloakGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.46, y + size * 0.58);
  for (let i = 0; i < 9; i++) {
    const waveX = x - size * 0.46 + i * size * 0.115;
    const waveY =
      y + size * 0.58 +
      Math.sin(time * 3.5 + i * 1.1) * size * 0.04 +
      (i % 2) * size * 0.06;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.52, y - size * 0.1 + stance,
    x + size * 0.05, y - size * 0.52 + stance,
  );
  ctx.quadraticCurveTo(
    x - size * 0.52, y - size * 0.1 + stance,
    x - size * 0.46, y + size * 0.58,
  );
  ctx.fill();

  // Front cloak layer
  const cloakGrad = ctx.createLinearGradient(x - size * 0.4, y, x + size * 0.4, y);
  cloakGrad.addColorStop(0, "#022c22");
  cloakGrad.addColorStop(0.3, "#065f46");
  cloakGrad.addColorStop(0.5, "#059669");
  cloakGrad.addColorStop(0.7, "#065f46");
  cloakGrad.addColorStop(1, "#022c22");
  ctx.fillStyle = cloakGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.55);
  for (let i = 0; i < 7; i++) {
    const waveX = x - size * 0.42 + i * size * 0.14;
    const waveY =
      y + size * 0.55 +
      Math.sin(time * 4 + i * 0.9) * size * 0.03 +
      (i % 2) * size * 0.05;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.48, y - size * 0.15 + stance,
    x, y - size * 0.56 + stance,
  );
  ctx.quadraticCurveTo(
    x - size * 0.48, y - size * 0.15 + stance,
    x - size * 0.42, y + size * 0.55,
  );
  ctx.fill();

  // Soul-thread patterns on cloak
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  for (let thread = 0; thread < 5; thread++) {
    const threadX = x - size * 0.18 + thread * size * 0.09;
    ctx.beginPath();
    ctx.moveTo(threadX, y - size * 0.1 + stance * 0.3);
    ctx.bezierCurveTo(
      threadX + Math.sin(time * 2 + thread) * size * 0.04, y + size * 0.1,
      threadX - Math.cos(time * 2 + thread) * size * 0.03, y + size * 0.3,
      threadX + Math.sin(thread) * size * 0.05, y + size * 0.48,
    );
    ctx.stroke();
  }

  // Cloak accent glow lines
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + size * 0.05);
  ctx.quadraticCurveTo(x - size * 0.08, y + size * 0.2, x - size * 0.06, y + size * 0.38);
  ctx.moveTo(x + size * 0.12, y + size * 0.07);
  ctx.quadraticCurveTo(x + size * 0.08, y + size * 0.22, x + size * 0.06, y + size * 0.38);
  ctx.stroke();

  // Spectral leather armor with gradient
  const armorGrad = ctx.createLinearGradient(x - size * 0.22, y, x + size * 0.22, y);
  armorGrad.addColorStop(0, "#451a03");
  armorGrad.addColorStop(0.3, "#78350f");
  armorGrad.addColorStop(0.5, "#92400e");
  armorGrad.addColorStop(0.7, "#78350f");
  armorGrad.addColorStop(1, "#451a03");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.38);
  ctx.lineTo(x - size * 0.22, y - size * 0.18 + stance);
  ctx.quadraticCurveTo(x, y - size * 0.3 + stance, x + size * 0.22, y - size * 0.18 + stance);
  ctx.lineTo(x + size * 0.2, y + size * 0.38);
  ctx.closePath();
  ctx.fill();
  // Armor trim and cross strap
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.18 + stance);
  ctx.quadraticCurveTo(x, y - size * 0.3 + stance, x + size * 0.22, y - size * 0.18 + stance);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.22 + stance);
  ctx.lineTo(x, y + size * 0.32);
  ctx.moveTo(x - size * 0.16, y + size * 0.02);
  ctx.lineTo(x + size * 0.16, y + size * 0.02);
  ctx.stroke();
  // Soul gem on chest
  const gemGlowGrad = ctx.createRadialGradient(
    x, y - size * 0.08 + stance, 0,
    x, y - size * 0.08 + stance, size * 0.04,
  );
  gemGlowGrad.addColorStop(0, `rgba(52, 211, 153, ${shadowPulse})`);
  gemGlowGrad.addColorStop(0.5, `rgba(16, 185, 129, ${shadowPulse * 0.5})`);
  gemGlowGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
  ctx.fillStyle = gemGlowGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.08 + stance, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.11 + stance);
  ctx.lineTo(x - size * 0.02, y - size * 0.08 + stance);
  ctx.lineTo(x, y - size * 0.05 + stance);
  ctx.lineTo(x + size * 0.02, y - size * 0.08 + stance);
  ctx.fill();

  // Face glow aura
  drawRadialAura(ctx, x, y - size * 0.42 + stance, size * 0.22, [
    { offset: 0, color: "rgba(167, 243, 208, 0.2)" },
    { offset: 1, color: "rgba(167, 243, 208, 0)" },
  ]);
  // Face base with gradient
  const faceGrad = ctx.createRadialGradient(
    x, y - size * 0.44 + stance, 0,
    x, y - size * 0.42 + stance, size * 0.18,
  );
  faceGrad.addColorStop(0, "#f5f5f4");
  faceGrad.addColorStop(0.6, "#e7e5e4");
  faceGrad.addColorStop(1, "#d6d3d1");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + stance, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Pointed elven ears with inner detail
  const earGrad = ctx.createLinearGradient(
    x - size * 0.3, y - size * 0.58 + stance,
    x - size * 0.16, y - size * 0.4 + stance,
  );
  earGrad.addColorStop(0, "#e7e5e4");
  earGrad.addColorStop(1, "#d6d3d1");
  ctx.fillStyle = earGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.16, y - size * 0.44 + stance);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.52 + stance, x - size * 0.3, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.48 + stance, x - size * 0.18, y - size * 0.4 + stance);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.44 + stance);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.52 + stance, x + size * 0.3, y - size * 0.58 + stance);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.48 + stance, x + size * 0.18, y - size * 0.4 + stance);
  ctx.fill();
  ctx.strokeStyle = "rgba(168, 162, 158, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.44 + stance);
  ctx.quadraticCurveTo(x - size * 0.22, y - size * 0.5 + stance, x - size * 0.26, y - size * 0.54 + stance);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.44 + stance);
  ctx.quadraticCurveTo(x + size * 0.22, y - size * 0.5 + stance, x + size * 0.26, y - size * 0.54 + stance);
  ctx.stroke();

  // Eye sockets
  ctx.fillStyle = "rgba(4, 120, 87, 0.25)";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + stance, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + stance, size * 0.045, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow gradient
  const eyeGlowGrad = ctx.createRadialGradient(
    x - size * 0.06, y - size * 0.44 + stance, 0,
    x - size * 0.06, y - size * 0.44 + stance, size * 0.06,
  );
  eyeGlowGrad.addColorStop(0, "#34d399");
  eyeGlowGrad.addColorStop(0.4, "rgba(16, 185, 129, 0.6)");
  eyeGlowGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
  ctx.fillStyle = eyeGlowGrad;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.44 + stance, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.44 + stance, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  // Eye cores
  ctx.fillStyle = "#10b981";
  setShadowBlur(ctx, 6 * zoom, "#10b981");
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + stance, size * 0.035, size * 0.028, -0.1, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + stance, size * 0.035, size * 0.028, 0.1, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  // Pupil slits
  ctx.fillStyle = "#022c22";
  ctx.beginPath();
  ctx.ellipse(x - size * 0.06, y - size * 0.44 + stance, size * 0.01, size * 0.022, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.06, y - size * 0.44 + stance, size * 0.01, size * 0.022, 0, 0, Math.PI * 2);
  ctx.fill();
  // Eye highlights
  ctx.fillStyle = "#ecfdf5";
  ctx.beginPath();
  ctx.arc(x - size * 0.07, y - size * 0.45 + stance, size * 0.007, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.45 + stance, size * 0.007, 0, Math.PI * 2);
  ctx.fill();
  // Spectral war paint
  ctx.strokeStyle = `rgba(16, 185, 129, ${shadowPulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.38 + stance);
  ctx.lineTo(x - size * 0.15, y - size * 0.36 + stance);
  ctx.moveTo(x + size * 0.1, y - size * 0.38 + stance);
  ctx.lineTo(x + size * 0.15, y - size * 0.36 + stance);
  ctx.stroke();

  // Ornate hood
  ctx.fillStyle = "rgba(2, 44, 34, 0.75)";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.56 + stance, size * 0.22, 0, Math.PI, true);
  ctx.fill();
  const hoodGrad = ctx.createLinearGradient(
    x - size * 0.22, y - size * 0.7 + stance,
    x + size * 0.22, y - size * 0.5 + stance,
  );
  hoodGrad.addColorStop(0, "#022c22");
  hoodGrad.addColorStop(0.5, "#064e3b");
  hoodGrad.addColorStop(1, "#022c22");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.48 + stance);
  ctx.quadraticCurveTo(
    x - size * 0.28, y - size * 0.62 + stance,
    x, y - size * 0.68 + stance + Math.sin(time * 2) * size * 0.01,
  );
  ctx.quadraticCurveTo(
    x + size * 0.28, y - size * 0.62 + stance,
    x + size * 0.22, y - size * 0.48 + stance,
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse * 0.4})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.56 + stance, size * 0.22, 0.1, Math.PI - 0.1, true);
  ctx.stroke();
  ctx.fillStyle = `rgba(52, 211, 153, ${shadowPulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.64 + stance, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Spectral bow with energy layers (curves LEFT toward target)
  const bowStartAngle = Math.PI * 0.52;
  const bowEndAngle = Math.PI * 1.48;
  ctx.save();
  ctx.translate(x - size * 0.38, y + stance);
  ctx.strokeStyle = `rgba(52, 211, 153, ${(shadowPulse * 0.3 + chargeLevel * 0.15)})`;
  ctx.lineWidth = 8 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.48, bowStartAngle, bowEndAngle);
  ctx.stroke();
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.46, bowStartAngle, bowEndAngle);
  ctx.stroke();
  ctx.strokeStyle = "#34d399";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.44, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();
  ctx.strokeStyle = `rgba(167, 243, 208, ${shadowPulse * 0.6})`;
  ctx.lineWidth = 1 * zoom;
  for (let r = 0; r < 3; r++) {
    const runeAngle = Math.PI * 0.7 + r * Math.PI * 0.3;
    ctx.beginPath();
    ctx.arc(
      Math.cos(runeAngle) * size * 0.46,
      Math.sin(runeAngle) * size * 0.46,
      size * 0.02, 0, Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Soul-string (connects bow tips through pull point)
  ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse})`;
  ctx.lineWidth = 2 * zoom;
  const bowTopX = x - size * 0.38 + Math.cos(bowEndAngle) * size * 0.46;
  const bowTopY = y + stance + Math.sin(bowEndAngle) * size * 0.46;
  const bowBotX = x - size * 0.38 + Math.cos(bowStartAngle) * size * 0.46;
  const bowBotY = y + stance + Math.sin(bowStartAngle) * size * 0.46;
  const pullX = x - size * 0.41 + drawPull * size * 0.35;
  ctx.beginPath();
  ctx.moveTo(bowTopX, bowTopY);
  ctx.lineTo(pullX, y + stance);
  ctx.lineTo(bowBotX, bowBotY);
  ctx.stroke();
  // Charge glow at pull point
  const pullGlowSize = size * (0.015 + chargeLevel * 0.02);
  ctx.fillStyle = `rgba(167, 243, 208, ${0.3 + chargeLevel * 0.5})`;
  ctx.beginPath();
  ctx.arc(pullX, y + stance, pullGlowSize, 0, Math.PI * 2);
  ctx.fill();

  // Nocked arrow (fades in as archer reloads, charge glow builds)
  if (chargeLevel > 0.1) {
    const arrowOpacity = Math.min(1, (chargeLevel - 0.1) / 0.25);
    ctx.save();
    ctx.translate(pullX, y + stance);
    ctx.rotate(Math.PI);
    // Arrow charge aura (grows with charge)
    ctx.strokeStyle = `rgba(52, 211, 153, ${shadowPulse * 0.2 * arrowOpacity + chargeLevel * 0.15})`;
    ctx.lineWidth = (4 + chargeLevel * 4) * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.48, 0);
    ctx.stroke();
    // Arrow shaft
    ctx.strokeStyle = `rgba(4, 120, 87, ${arrowOpacity})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.48, 0);
    ctx.stroke();
    // Arrowhead with charge-dependent glow
    ctx.fillStyle = `rgba(16, 185, 129, ${arrowOpacity})`;
    setShadowBlur(ctx, (4 + chargeLevel * 8) * zoom, "#10b981");
    ctx.beginPath();
    ctx.moveTo(size * 0.48, 0);
    ctx.lineTo(size * 0.55, -size * 0.04);
    ctx.lineTo(size * 0.6, 0);
    ctx.lineTo(size * 0.55, size * 0.04);
    ctx.fill();
    clearShadow(ctx);
    // Fletching
    ctx.fillStyle = `rgba(16, 185, 129, ${shadowPulse * arrowOpacity})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.07, -size * 0.04);
    ctx.lineTo(-size * 0.02, 0);
    ctx.lineTo(-size * 0.07, size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // === SOUL GLOW around bow ===
  drawPulsingGlowRings(ctx, x - size * 0.38, y + stance, size * 0.15, time, zoom, {
    color: "rgba(52, 211, 153, 0.4)",
    count: 3,
    speed: 1.5,
    maxAlpha: 0.35,
    expansion: 1.2,
  });

  // === FLOATING ARROWHEAD SHARDS ===
  drawShiftingSegments(ctx, x, y - size * 0.1, size, time, zoom, {
    color: "#10b981",
    colorAlt: "#34d399",
    count: 5,
    orbitRadius: 0.35,
    segmentSize: 0.03,
    orbitSpeed: 1.2,
    shape: "shard",
  });
}

export function drawMageEnemy(
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
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.3)
    : 0.6 + Math.sin(time * 1.2) * 0.3;
  const float =
    Math.sin(time * 2.5) * 4 * zoom +
    (isAttacking ? attackIntensity * size * 0.15 : 0);
  const magicPulse = 0.6 + Math.sin(time * 4) * 0.4 + chargeLevel * 0.15;
  const orbSpeed = isAttacking ? 4 : 1.5 + chargeLevel * 1.5;

  // Arcane circle on the ground (spins faster as charge builds)
  ctx.save();
  ctx.translate(x, y + size * 0.48);
  ctx.scale(1, ISO_Y_RATIO);
  ctx.rotate(time * (0.5 + chargeLevel * 1.5) + (isAttacking ? time * 2 : 0));
  const circleRadius =
    size * (0.45 + chargeLevel * 0.12 + (isAttacking ? attackIntensity * 0.2 : 0));
  ctx.strokeStyle = `rgba(139, 92, 246, ${magicPulse * (isAttacking ? 0.6 : 0.2)})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, circleRadius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const symbolAngle = (i / 6) * Math.PI * 2;
    const sx = Math.cos(symbolAngle) * circleRadius * 0.85;
    const sy = Math.sin(symbolAngle) * circleRadius * 0.85;
    ctx.fillStyle = `rgba(167, 139, 250, ${magicPulse * 0.5})`;
    ctx.font = `${size * 0.08}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const symbols = ["◇", "△", "○", "☆", "◈", "⬡"];
    ctx.fillText(symbols[i], sx, sy);
  }
  for (let i = 0; i < 3; i++) {
    const lineAngle = (i / 3) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(lineAngle) * circleRadius * 0.7,
      Math.sin(lineAngle) * circleRadius * 0.7,
    );
    ctx.lineTo(
      Math.cos(lineAngle + Math.PI) * circleRadius * 0.7,
      Math.sin(lineAngle + Math.PI) * circleRadius * 0.7,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Trailing magical wisps behind the mage
  for (let w = 0; w < 5; w++) {
    const wispPhase = (time * 0.8 + w * 0.2) % 1;
    const wispAlpha = (1 - wispPhase) * 0.3;
    const wispX =
      x +
      Math.sin(time * 2 + w * 1.3) * size * 0.15 -
      wispPhase * size * 0.1;
    const wispY = y + size * 0.2 + wispPhase * size * 0.3;
    ctx.fillStyle = `rgba(139, 92, 246, ${wispAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      wispX,
      wispY,
      size * 0.04 * (1 - wispPhase),
      size * 0.06 * (1 - wispPhase),
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Magic aura (expands during attack)
  const auraSize =
    size * (0.7 + (isAttacking ? attackIntensity * 0.3 : 0));
  const auraGrad = ctx.createRadialGradient(x, y, 0, x, y, auraSize);
  auraGrad.addColorStop(0, `rgba(139, 92, 246, ${magicPulse * 0.25})`);
  auraGrad.addColorStop(0.6, `rgba(139, 92, 246, ${magicPulse * 0.1})`);
  auraGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y, auraSize, 0, Math.PI * 2);
  ctx.fill();

  // Attack magic burst outward
  if (isAttacking) {
    const burstSize = size * (0.5 + attackIntensity * 0.8);
    const burstGrad = ctx.createRadialGradient(x, y, 0, x, y, burstSize);
    burstGrad.addColorStop(
      0,
      `rgba(167, 139, 250, ${attackIntensity * 0.4})`,
    );
    burstGrad.addColorStop(
      0.5,
      `rgba(139, 92, 246, ${attackIntensity * 0.2})`,
    );
    burstGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(x, y, burstSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating arcane orbs with outer glow
  const orbPositions: { x: number; y: number }[] = [];
  for (let i = 0; i < 3; i++) {
    const orbAngle = time * orbSpeed + i * Math.PI * 0.67;
    const orbX = x + Math.cos(orbAngle) * size * 0.55;
    const orbY = y - size * 0.2 + Math.sin(orbAngle) * size * 0.3;
    orbPositions.push({ x: orbX, y: orbY });
    const orbGlow = 0.6 + Math.sin(time * 3 + i) * 0.3;
    const orbGrad = ctx.createRadialGradient(
      orbX,
      orbY,
      0,
      orbX,
      orbY,
      size * 0.1,
    );
    orbGrad.addColorStop(0, `rgba(167, 139, 250, ${orbGlow})`);
    orbGrad.addColorStop(0.5, `rgba(139, 92, 246, ${orbGlow * 0.4})`);
    orbGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = orbGrad;
    setShadowBlur(ctx, 8 * zoom, "#8b5cf6");
    ctx.beginPath();
    ctx.arc(orbX, orbY, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${orbGlow * 0.6})`;
    ctx.beginPath();
    ctx.arc(orbX, orbY, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }

  // Magical energy crackling between orbs (arc lightning)
  ctx.strokeStyle = `rgba(167, 139, 250, ${magicPulse * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const from = orbPositions[i];
    const to = orbPositions[(i + 1) % 3];
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const segments = 5;
    for (let s = 1; s <= segments; s++) {
      const t = s / segments;
      const midX =
        from.x +
        (to.x - from.x) * t +
        Math.sin(time * 12 + i * 3 + s) * size * 0.04;
      const midY =
        from.y +
        (to.y - from.y) * t +
        Math.cos(time * 10 + i * 2 + s) * size * 0.04;
      ctx.lineTo(midX, midY);
    }
    setShadowBlur(ctx, 4 * zoom, "#a78bfa");
    ctx.stroke();
    clearShadow(ctx);
  }

  // Staff in right hand
  ctx.save();
  ctx.translate(x + size * 0.32, y - size * 0.1 + float);
  ctx.rotate(-0.15 + Math.sin(time * 2) * 0.05);
  ctx.strokeStyle = "#5b3a1a";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.5);
  ctx.lineTo(0, size * 0.4);
  ctx.stroke();
  ctx.strokeStyle = "#4a2d12";
  ctx.lineWidth = 1 * zoom;
  for (let g = 0; g < 4; g++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.01, -size * 0.3 + g * size * 0.15);
    ctx.quadraticCurveTo(
      size * 0.02,
      -size * 0.25 + g * size * 0.15,
      -size * 0.01,
      -size * 0.2 + g * size * 0.15,
    );
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse})`;
  setShadowBlur(ctx, 10 * zoom, "#8b5cf6");
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.6);
  ctx.lineTo(size * 0.05, -size * 0.5);
  ctx.lineTo(0, -size * 0.45);
  ctx.lineTo(-size * 0.05, -size * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${magicPulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.52, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = "#5b3a1a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.45);
  ctx.lineTo(-size * 0.05, -size * 0.5);
  ctx.moveTo(size * 0.03, -size * 0.45);
  ctx.lineTo(size * 0.05, -size * 0.5);
  ctx.stroke();
  ctx.restore();

  // === ANIMATED LEGS (beneath robes) ===
  drawAnimatedLegs(ctx, x, y + size * 0.35, size, time, zoom, {
    color: "#3b0764",
    colorDark: "#2e1065",
    footColor: "#1c1917",
    strideSpeed: 3,
    strideAmt: 0.15,
    legLen: 0.16,
    width: 0.05,
    shuffle: true,
  });

  // === ANIMATED ARMS (mystical gesturing) ===
  drawAnimatedArm(ctx, x - size * 0.18, y - size * 0.2 + float, size, time, zoom, -1, {
    color: "#4c1d95",
    colorDark: "#2e1065",
    handColor: "#e0d4c4",
    swingSpeed: 3,
    swingAmt: 0.35,
    baseAngle: 0.5,
    upperLen: 0.2,
    foreLen: 0.17,
    width: 0.05,
    phaseOffset: 0.5,
  });
  drawAnimatedArm(ctx, x + size * 0.18, y - size * 0.2 + float, size, time, zoom, 1, {
    color: "#4c1d95",
    colorDark: "#2e1065",
    handColor: "#e0d4c4",
    swingSpeed: 3,
    swingAmt: 0.3,
    baseAngle: 0.4,
    upperLen: 0.19,
    foreLen: 0.16,
    width: 0.05,
    phaseOffset: 1.2,
    attackExtra: isAttacking ? attackIntensity : 0,
  });

  // Arcane robes
  const robeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.4,
    x,
    y + size * 0.5,
  );
  robeGrad.addColorStop(0, "#4c1d95");
  robeGrad.addColorStop(0.5, "#6d28d9");
  robeGrad.addColorStop(1, "#3b0764");
  ctx.fillStyle = robeGrad;
  drawRobeBody(ctx, x, size * 0.15, y - size * 0.4 + float, size * 0.4, y + size * 0.5, size * 0.45, y);

  // Robe inner lining visible
  ctx.fillStyle = "#2e1065";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.3 + float);
  ctx.lineTo(x, y + size * 0.2);
  ctx.lineTo(x + size * 0.08, y - size * 0.3 + float);
  ctx.closePath();
  ctx.fill();

  // Tattered robe hem that sways
  ctx.strokeStyle = "#3b0764";
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 9; i++) {
    const hx = x - size * 0.38 + i * size * 0.095;
    ctx.beginPath();
    ctx.moveTo(hx, y + size * 0.48 + Math.sin(time * 5 + i) * 2);
    ctx.lineTo(
      hx + size * 0.03,
      y + size * 0.56 + Math.sin(time * 4 + i) * 3,
    );
    ctx.stroke();
  }

  // Belt with potions/vials
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.05);
  ctx.lineTo(x + size * 0.22, y + size * 0.05);
  ctx.stroke();
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x - size * 0.03, y + size * 0.03, size * 0.06, size * 0.05);
  for (let p = 0; p < 3; p++) {
    const px = x - size * 0.15 + p * size * 0.12;
    const py = y + size * 0.08;
    const vialColors = [
      "rgba(239, 68, 68, 0.7)",
      "rgba(59, 130, 246, 0.7)",
      "rgba(16, 185, 129, 0.7)",
    ];
    ctx.fillStyle = vialColors[p];
    ctx.beginPath();
    ctx.ellipse(
      px,
      py + size * 0.03,
      size * 0.02,
      size * 0.035,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#78716c";
    ctx.fillRect(
      px - size * 0.008,
      py - size * 0.01,
      size * 0.016,
      size * 0.02,
    );
    ctx.fillStyle = "#a16207";
    ctx.fillRect(
      px - size * 0.01,
      py - size * 0.02,
      size * 0.02,
      size * 0.015,
    );
  }

  // Rune patterns on robe
  ctx.strokeStyle = `rgba(167, 139, 250, ${magicPulse})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x, y + size * 0.1 + i * size * 0.08, size * 0.08, 0, Math.PI);
    ctx.stroke();
  }

  // Left sleeve/hand reaching toward book
  ctx.fillStyle = "#4c1d95";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.15 + float);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y - size * 0.2 + float,
    x - size * 0.38,
    y - size * 0.12 + float,
  );
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y - size * 0.05 + float,
    x - size * 0.15,
    y - size * 0.05 + float,
  );
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e0d4c4";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.38,
    y - size * 0.12 + float,
    size * 0.04,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = "#e0d4c4";
  ctx.lineWidth = 1.5 * zoom;
  for (let f = 0; f < 3; f++) {
    const fAngle = -0.3 + f * 0.3;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.38, y - size * 0.12 + float);
    ctx.lineTo(
      x - size * 0.38 - Math.cos(fAngle) * size * 0.04,
      y - size * 0.12 + float - Math.sin(fAngle) * size * 0.04,
    );
    ctx.stroke();
  }

  // Wizard beard
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.28 + float);
  ctx.quadraticCurveTo(x - size * 0.15, y + float, x, y + size * 0.1 + float);
  ctx.quadraticCurveTo(
    x + size * 0.15,
    y + float,
    x + size * 0.1,
    y - size * 0.28 + float,
  );
  ctx.fill();
  // Beard strands
  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 1 * zoom;
  for (let b = 0; b < 5; b++) {
    const bx = x - size * 0.06 + b * size * 0.03;
    ctx.beginPath();
    ctx.moveTo(bx, y - size * 0.15 + float);
    ctx.quadraticCurveTo(
      bx + Math.sin(time * 3 + b) * size * 0.02,
      y + float,
      bx,
      y + size * 0.08 + float,
    );
    ctx.stroke();
  }

  // Face
  ctx.fillStyle = "#e0d4c4";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + float, size * 0.18, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.42 + float);
  ctx.lineTo(x - size * 0.03, y - size * 0.44 + float);
  ctx.moveTo(x + size * 0.03, y - size * 0.44 + float);
  ctx.lineTo(x + size * 0.1, y - size * 0.42 + float);
  ctx.stroke();

  // Glowing eyes
  ctx.fillStyle = "#8b5cf6";
  setShadowBlur(ctx, 6 * zoom, "#8b5cf6");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.37 + float,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.06,
    y - size * 0.37 + float,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${magicPulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.06,
    y - size * 0.37 + float,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.06,
    y - size * 0.37 + float,
    size * 0.015,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Wizard hat with slight curve
  ctx.fillStyle = "#4c1d95";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y - size * 0.5 + float);
  ctx.quadraticCurveTo(
    x - size * 0.05,
    y - size * 0.7 + float,
    x + size * 0.02,
    y - size * 0.95 + float,
  );
  ctx.quadraticCurveTo(
    x + size * 0.08,
    y - size * 0.7 + float,
    x + size * 0.22,
    y - size * 0.5 + float,
  );
  ctx.closePath();
  ctx.fill();
  // Hat brim
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.5 + float,
    size * 0.27,
    size * 0.08,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Mystical rune band on hat
  ctx.strokeStyle = `rgba(167, 139, 250, ${magicPulse})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y - size * 0.55 + float);
  ctx.lineTo(x + size * 0.19, y - size * 0.55 + float);
  ctx.stroke();
  ctx.fillStyle = `rgba(167, 139, 250, ${magicPulse * 0.8})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  const bandRunes = ["◈", "☆", "◇", "△"];
  for (let r = 0; r < 4; r++) {
    ctx.fillText(
      bandRunes[r],
      x - size * 0.12 + r * size * 0.08,
      y - size * 0.53 + float,
    );
  }
  // Glowing hat tip
  ctx.fillStyle = `rgba(167, 139, 250, ${magicPulse})`;
  setShadowBlur(ctx, 8 * zoom, "#a78bfa");
  ctx.beginPath();
  ctx.arc(
    x + size * 0.02,
    y - size * 0.95 + float,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);
  // Star on hat
  ctx.fillStyle = "#fbbf24";
  ctx.font = `${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("★", x, y - size * 0.7 + float);

  // Floating spellbook
  ctx.fillStyle = "#7c2d12";
  ctx.save();
  ctx.translate(
    x - size * 0.35,
    y - size * 0.1 + float + Math.sin(time * 3) * 3,
  );
  ctx.rotate(Math.sin(time * 2) * 0.1);
  ctx.fillRect(-size * 0.1, -size * 0.12, size * 0.2, size * 0.24);
  ctx.fillStyle = "#5b2c10";
  ctx.fillRect(-size * 0.1, -size * 0.12, size * 0.03, size * 0.24);
  ctx.fillStyle = "#fef3c7";
  ctx.fillRect(-size * 0.06, -size * 0.1, size * 0.14, size * 0.2);
  ctx.strokeStyle = "rgba(180, 160, 120, 0.4)";
  ctx.lineWidth = 0.5 * zoom;
  for (let l = 0; l < 5; l++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.04, -size * 0.07 + l * size * 0.035);
    ctx.lineTo(size * 0.06, -size * 0.07 + l * size * 0.035);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(139, 92, 246, ${magicPulse})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.fillText("◈", 0, 0);
  setShadowBlur(ctx, 4 * zoom, `rgba(139, 92, 246, ${magicPulse * 0.5})`);
  ctx.strokeStyle = `rgba(139, 92, 246, ${magicPulse * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(-size * 0.1, -size * 0.12, size * 0.2, size * 0.24);
  clearShadow(ctx);
  ctx.restore();

  // === ARCANE SPARKLES around staff crystal ===
  drawArcaneSparkles(ctx, x + size * 0.32, y - size * 0.52 + float, size * 0.08, time, zoom, {
    color: "rgba(139, 92, 246, 0.6)",
    count: 5,
    speed: 2.5,
    maxAlpha: 0.5,
  });

  // === FLOATING CRYSTAL ORBS ===
  drawShiftingSegments(ctx, x, y - size * 0.15 + float, size, time, zoom, {
    color: "#a78bfa",
    colorAlt: "#8b5cf6",
    count: 4,
    orbitRadius: 0.28,
    segmentSize: 0.035,
    orbitSpeed: 1.8,
    shape: "circle",
  });
}

export function drawCatapultEnemy(
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
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.2)
    : 0.6 + Math.sin(time * 1.0) * 0.3;
  const armAngle =
    Math.sin(time * 1.5) * 0.35 * (1 - chargeLevel * 0.5) +
    (isAttacking ? attackIntensity * 0.8 : -chargeLevel * 0.4);
  const hellGlow = 0.6 + Math.sin(time * 4) * 0.3 + chargeLevel * 0.2;
  const soulWisp = 0.5 + Math.sin(time * 5) * 0.3;
  const fireIntensity = isAttacking
    ? 0.7 + attackIntensity * 0.3
    : 0.3 + chargeLevel * 0.4 + Math.sin(time * 3) * 0.15;

  // Hellfire domain aura
  const fireGrad = ctx.createRadialGradient(
    x, y + size * 0.3, 0,
    x, y + size * 0.3, size * 0.7,
  );
  fireGrad.addColorStop(0, `rgba(220, 38, 38, ${fireIntensity * 0.35})`);
  fireGrad.addColorStop(0.3, `rgba(180, 30, 30, ${fireIntensity * 0.2})`);
  fireGrad.addColorStop(0.6, `rgba(127, 29, 29, ${fireIntensity * 0.1})`);
  fireGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = fireGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.3, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hellfire ripple rings
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.6 + ring * 0.35) % 1;
    const ringSize = size * (0.2 + ringPhase * 0.4);
    const ringAlpha = (0.35 - ringPhase * 0.3) * fireIntensity;
    ctx.strokeStyle = `rgba(220, 38, 38, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.48, ringSize, ringSize * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Rising ember particles
  for (let e = 0; e < 12; e++) {
    const emberPhase = (time * 0.4 + e * 0.1) % 1;
    const emberAngle = (e * Math.PI) / 6 + time * 0.15;
    const emberDist = size * (0.1 + emberPhase * 0.4);
    const ex = x + Math.cos(emberAngle) * emberDist;
    const ey = y + size * 0.2 - emberPhase * size * 0.8;
    const emberAlpha = (1 - emberPhase) * 0.6 * fireIntensity;
    const emberSize = size * 0.015 * (1 - emberPhase * 0.5);
    const emberColors = [
      `rgba(251, 146, 60, ${emberAlpha})`,
      `rgba(220, 38, 38, ${emberAlpha})`,
      `rgba(252, 211, 77, ${emberAlpha})`,
    ];
    ctx.fillStyle = emberColors[e % 3];
    ctx.beginPath();
    ctx.arc(ex, ey, emberSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 6; crack++) {
    const crackAngle = (crack * Math.PI) / 3 - Math.PI * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.48);
    let cx2 = x, cy2 = y + size * 0.48;
    for (let seg = 0; seg < 4; seg++) {
      cx2 += Math.cos(crackAngle + Math.sin(seg * 0.5) * 0.3) * size * 0.1;
      cy2 += size * 0.015;
      ctx.lineTo(cx2 + Math.sin(seg) * size * 0.025, cy2);
    }
    ctx.stroke();
  }

  // === ANIMATED LEGS (crew member stance) ===
  drawAnimatedLegs(ctx, x + size * 0.18, y + size * 0.12, size, time, zoom, {
    color: "#292524",
    colorDark: "#1c1917",
    footColor: "#44403c",
    strideSpeed: 3.5,
    strideAmt: 0.2,
    legLen: 0.16,
    width: 0.055,
  });

  // === ANIMATED ARMS (operating catapult mechanism) ===
  drawAnimatedArm(ctx, x + size * 0.1, y - size * 0.15, size, time, zoom, -1, {
    color: "#292524",
    colorDark: "#1c1917",
    handColor: "#a8a29e",
    swingSpeed: 2,
    swingAmt: 0.25,
    baseAngle: 0.8,
    upperLen: 0.2,
    foreLen: 0.18,
    width: 0.06,
    attackExtra: isAttacking ? attackIntensity * 0.5 : 0,
  });
  drawAnimatedArm(ctx, x + size * 0.26, y - size * 0.15, size, time, zoom, 1, {
    color: "#292524",
    colorDark: "#1c1917",
    handColor: "#a8a29e",
    swingSpeed: 2,
    swingAmt: 0.2,
    baseAngle: 0.5,
    upperLen: 0.18,
    foreLen: 0.16,
    width: 0.055,
    phaseOffset: Math.PI,
  });

  // Demonic bone wheels with detailed rendering
  for (let w = 0; w < 2; w++) {
    const wheelX = w === 0 ? x - size * 0.38 : x + size * 0.38;
    // Wheel fire glow
    const wheelGlow = ctx.createRadialGradient(
      wheelX, y + size * 0.38, 0,
      wheelX, y + size * 0.38, size * 0.22,
    );
    wheelGlow.addColorStop(0, `rgba(220, 38, 38, ${hellGlow * 0.2})`);
    wheelGlow.addColorStop(1, "rgba(220, 38, 38, 0)");
    ctx.fillStyle = wheelGlow;
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    // Outer ring
    const wheelRingGrad = ctx.createRadialGradient(
      wheelX, y + size * 0.38, size * 0.12,
      wheelX, y + size * 0.38, size * 0.18,
    );
    wheelRingGrad.addColorStop(0, "#44403c");
    wheelRingGrad.addColorStop(0.5, "#292524");
    wheelRingGrad.addColorStop(1, "#1c1917");
    ctx.fillStyle = wheelRingGrad;
    ctx.strokeStyle = "#1c1917";
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Bone spokes with rune glow
    ctx.strokeStyle = "#78716c";
    ctx.lineWidth = 3 * zoom;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + time * 0.6;
      ctx.beginPath();
      ctx.moveTo(wheelX, y + size * 0.38);
      ctx.lineTo(
        wheelX + Math.cos(angle) * size * 0.14,
        y + size * 0.38 + Math.sin(angle) * size * 0.14,
      );
      ctx.stroke();
    }
    // Spoke rune dots
    ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.6})`;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 + time * 0.6;
      ctx.beginPath();
      ctx.arc(
        wheelX + Math.cos(angle) * size * 0.08,
        y + size * 0.38 + Math.sin(angle) * size * 0.08,
        size * 0.008, 0, Math.PI * 2,
      );
      ctx.fill();
    }
    // Hub skull
    const hubGrad = ctx.createRadialGradient(
      wheelX, y + size * 0.38, 0,
      wheelX, y + size * 0.38, size * 0.05,
    );
    hubGrad.addColorStop(0, "#d6d3d1");
    hubGrad.addColorStop(0.6, "#a8a29e");
    hubGrad.addColorStop(1, "#78716c");
    ctx.fillStyle = hubGrad;
    ctx.beginPath();
    ctx.arc(wheelX, y + size * 0.38, size * 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
    setShadowBlur(ctx, 3 * zoom, "#dc2626");
    ctx.beginPath();
    ctx.arc(wheelX - size * 0.02, y + size * 0.37, size * 0.012, 0, Math.PI * 2);
    ctx.arc(wheelX + size * 0.02, y + size * 0.37, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
    // Wheel spikes
    ctx.fillStyle = "#1c1917";
    for (let spike = 0; spike < 8; spike++) {
      const spikeAngle = (spike * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(
        wheelX + Math.cos(spikeAngle) * size * 0.15,
        y + size * 0.38 + Math.sin(spikeAngle) * size * 0.15,
      );
      ctx.lineTo(
        wheelX + Math.cos(spikeAngle) * size * 0.22,
        y + size * 0.38 + Math.sin(spikeAngle) * size * 0.22,
      );
      ctx.lineTo(
        wheelX + Math.cos(spikeAngle + 0.1) * size * 0.15,
        y + size * 0.38 + Math.sin(spikeAngle + 0.1) * size * 0.15,
      );
      ctx.fill();
    }
  }

  // Main frame with detailed gradient
  const frameGrad = ctx.createLinearGradient(x - size * 0.45, y, x + size * 0.45, y);
  frameGrad.addColorStop(0, "#1c1917");
  frameGrad.addColorStop(0.15, "#292524");
  frameGrad.addColorStop(0.3, "#44403c");
  frameGrad.addColorStop(0.5, "#57534e");
  frameGrad.addColorStop(0.7, "#44403c");
  frameGrad.addColorStop(0.85, "#292524");
  frameGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = frameGrad;
  ctx.fillRect(x - size * 0.45, y + size * 0.08, size * 0.9, size * 0.24);
  // Frame edge highlight
  ctx.strokeStyle = "#78716c";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(x - size * 0.45, y + size * 0.08, size * 0.9, size * 0.24);
  // Iron bands with runes
  const bandGrad = ctx.createLinearGradient(0, y + size * 0.1, 0, y + size * 0.3);
  bandGrad.addColorStop(0, "#52525b");
  bandGrad.addColorStop(0.5, "#3f3f46");
  bandGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = bandGrad;
  ctx.fillRect(x - size * 0.4, y + size * 0.1, size * 0.1, size * 0.2);
  ctx.fillRect(x + size * 0.3, y + size * 0.1, size * 0.1, size * 0.2);
  ctx.fillRect(x - size * 0.05, y + size * 0.1, size * 0.1, size * 0.2);
  // Glowing runes on bands
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("◆", x - size * 0.35, y + size * 0.22);
  ctx.fillText("◆", x, y + size * 0.22);
  ctx.fillText("◆", x + size * 0.35, y + size * 0.22);
  // Rune glow on frame
  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42, y + size * 0.2);
  ctx.lineTo(x - size * 0.05, y + size * 0.2);
  ctx.moveTo(x + size * 0.05, y + size * 0.2);
  ctx.lineTo(x + size * 0.42, y + size * 0.2);
  ctx.stroke();

  // Throwing arm with hellfire veins
  ctx.save();
  ctx.translate(x, y + size * 0.18);
  ctx.rotate(-0.85 + armAngle);
  const armGrad = ctx.createLinearGradient(0, 0, 0, -size * 0.65);
  armGrad.addColorStop(0, "#44403c");
  armGrad.addColorStop(0.3, "#57534e");
  armGrad.addColorStop(0.5, "#78716c");
  armGrad.addColorStop(0.7, "#57534e");
  armGrad.addColorStop(1, "#44403c");
  ctx.fillStyle = armGrad;
  ctx.fillRect(-size * 0.06, -size * 0.65, size * 0.12, size * 0.65);
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.04, 0);
  ctx.lineTo(-size * 0.04, -size * 0.6);
  ctx.moveTo(size * 0.04, 0);
  ctx.lineTo(size * 0.04, -size * 0.6);
  ctx.stroke();
  // Multiple hellfire veins
  ctx.strokeStyle = `rgba(220, 38, 38, ${hellGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.1);
  ctx.quadraticCurveTo(-size * 0.03, -size * 0.35, 0, -size * 0.55);
  ctx.stroke();
  ctx.strokeStyle = `rgba(251, 146, 60, ${hellGlow * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.02, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.02, -size * 0.3, -size * 0.01, -size * 0.5);
  ctx.stroke();
  // Arm metal cap
  ctx.fillStyle = "#3f3f46";
  ctx.fillRect(-size * 0.08, -size * 0.68, size * 0.16, size * 0.1);
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(0, -size * 0.72, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  // Soul-catching bucket
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.arc(0, -size * 0.64, size * 0.14, 0, Math.PI);
  ctx.fill();
  // Animated soul flames in bucket
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  setShadowBlur(ctx, 10 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(0, -size * 0.6, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Flame tongues
  for (let flame = 0; flame < 4; flame++) {
    const fAngle = (flame * Math.PI) / 2 + time * 3;
    const fDist = size * 0.08 + Math.sin(time * 6 + flame) * size * 0.03;
    const fx = Math.cos(fAngle) * fDist * 0.5;
    const fy = -size * 0.6 - Math.abs(Math.sin(time * 5 + flame * 1.5)) * size * 0.08;
    ctx.fillStyle = `rgba(251, 146, 60, ${hellGlow * 0.6})`;
    ctx.beginPath();
    ctx.moveTo(fx - size * 0.02, -size * 0.58);
    ctx.quadraticCurveTo(fx, fy, fx + size * 0.02, -size * 0.58);
    ctx.fill();
  }
  // Skull projectile with gradient
  const skullGrad = ctx.createRadialGradient(0, -size * 0.58, 0, 0, -size * 0.58, size * 0.07);
  skullGrad.addColorStop(0, "#f5f5f4");
  skullGrad.addColorStop(0.6, "#e7e5e4");
  skullGrad.addColorStop(1, "#a8a29e");
  ctx.fillStyle = skullGrad;
  ctx.beginPath();
  ctx.arc(0, -size * 0.58, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(-size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2);
  ctx.arc(size * 0.02, -size * 0.6, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Skull nose
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.57);
  ctx.lineTo(-size * 0.01, -size * 0.55);
  ctx.lineTo(size * 0.01, -size * 0.55);
  ctx.fill();
  clearShadow(ctx);
  ctx.restore();

  // Soul-chain tension ropes with glow
  ctx.strokeStyle = `rgba(220, 38, 38, ${soulWisp * 0.7})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.22);
  ctx.quadraticCurveTo(x - size * 0.2, y - size * 0.05, x, y - size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.32, y + size * 0.22);
  ctx.quadraticCurveTo(x + size * 0.2, y - size * 0.05, x, y - size * 0.15);
  ctx.stroke();
  // Detailed chain links on both sides
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 1.5 * zoom;
  for (let side = 0; side < 2; side++) {
    const dir = side === 0 ? -1 : 1;
    for (let link = 0; link < 4; link++) {
      const linkX = x + dir * (size * 0.28 - link * size * 0.07);
      const linkY = y + size * 0.15 - link * size * 0.07;
      ctx.beginPath();
      ctx.ellipse(linkX, linkY, size * 0.025, size * 0.015, 0.5 * dir, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  // Chain rune glow
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow * 0.4})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.16, y + size * 0.07, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.16, y + size * 0.07, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // Undead crew member with more detail
  // Body with robes
  const crewRobeGrad = ctx.createLinearGradient(
    x + size * 0.08, y - size * 0.06,
    x + size * 0.28, y - size * 0.06,
  );
  crewRobeGrad.addColorStop(0, "#1c1917");
  crewRobeGrad.addColorStop(0.5, "#292524");
  crewRobeGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = crewRobeGrad;
  ctx.beginPath();
  ctx.ellipse(x + size * 0.18, y - size * 0.06, size * 0.1, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();
  // Skeletal arm reaching toward mechanism
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.1);
  ctx.quadraticCurveTo(x + size * 0.05, y - size * 0.05, x + size * 0.02, y + size * 0.08);
  ctx.stroke();
  // Bony hand
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(x + size * 0.02, y + size * 0.08, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  // Skeletal head with gradient
  const skullHeadGrad = ctx.createRadialGradient(
    x + size * 0.18, y - size * 0.24, 0,
    x + size * 0.18, y - size * 0.24, size * 0.08,
  );
  skullHeadGrad.addColorStop(0, "#d6d3d1");
  skullHeadGrad.addColorStop(0.6, "#a8a29e");
  skullHeadGrad.addColorStop(1, "#78716c");
  ctx.fillStyle = skullHeadGrad;
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.24, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Skull crack
  ctx.strokeStyle = "#78716c";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.16, y - size * 0.3);
  ctx.lineTo(x + size * 0.18, y - size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.22);
  ctx.stroke();
  // Helmet with gradient
  const helmGrad = ctx.createLinearGradient(
    x + size * 0.09, y - size * 0.36,
    x + size * 0.27, y - size * 0.28,
  );
  helmGrad.addColorStop(0, "#3f3f46");
  helmGrad.addColorStop(0.5, "#52525b");
  helmGrad.addColorStop(1, "#3f3f46");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.28, size * 0.09, Math.PI, 0);
  ctx.fill();
  // Helmet spike
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.38);
  ctx.lineTo(x + size * 0.15, y - size * 0.28);
  ctx.lineTo(x + size * 0.21, y - size * 0.28);
  ctx.fill();
  // Glowing eyes with glow aura
  ctx.fillStyle = `rgba(220, 38, 38, ${hellGlow})`;
  setShadowBlur(ctx, 5 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(x + size * 0.16, y - size * 0.25, size * 0.015, 0, Math.PI * 2);
  ctx.arc(x + size * 0.2, y - size * 0.25, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  // Jaw bone
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x + size * 0.18, y - size * 0.2, size * 0.04, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // === FIERY GLOW around soul-fire ===
  drawPulsingGlowRings(ctx, x, y - size * 0.1, size * 0.18, time, zoom, {
    color: "rgba(220, 38, 38, 0.4)",
    count: 3,
    speed: 2,
    maxAlpha: 0.4,
    expansion: 1.5,
  });

  // === FLOATING STONE FRAGMENTS ===
  drawShiftingSegments(ctx, x, y + size * 0.1, size, time, zoom, {
    color: "#78716c",
    colorAlt: "#a8a29e",
    count: 5,
    orbitRadius: 0.4,
    segmentSize: 0.04,
    orbitSpeed: 1.0,
    shape: "diamond",
  });
}

export function drawWarlockEnemy(
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
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.3)
    : 0.6 + Math.sin(time * 1.3) * 0.3;
  const hover =
    Math.sin(time * 2) * 5 * zoom +
    (isAttacking ? attackIntensity * size * 0.2 : chargeLevel * size * 0.05);
  const darkPulse = 0.5 + Math.sin(time * 3) * 0.35 + chargeLevel * 0.15;
  const voidRip = 0.6 + Math.sin(time * 4) * 0.3 + chargeLevel * 0.1;
  const soulDrain = Math.sin(time * (6 + chargeLevel * 3)) > 0.5 ? 1 : 0.6;

  // Reality-tearing void portal beneath
  ctx.save();
  for (let ring = 0; ring < 3; ring++) {
    const ringSize =
      size * (0.3 + ring * 0.15) + Math.sin(time * 2 + ring) * size * 0.05;
    ctx.strokeStyle = `rgba(76, 29, 149, ${voidRip * (0.5 - ring * 0.15)})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x,
      y + size * 0.45,
      ringSize,
      ringSize * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Dark void aura - more intense
  const voidGrad = ctx.createRadialGradient(
    x,
    y,
    size * 0.08,
    x,
    y,
    size * 0.85,
  );
  voidGrad.addColorStop(0, `rgba(88, 28, 135, ${darkPulse * 0.5})`);
  voidGrad.addColorStop(0.3, `rgba(76, 29, 149, ${darkPulse * 0.35})`);
  voidGrad.addColorStop(0.6, `rgba(30, 10, 60, ${darkPulse * 0.2})`);
  voidGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = voidGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.85, size * 0.85 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Captured soul wisps orbiting (faster as charge builds)
  for (let soul = 0; soul < 6; soul++) {
    const soulAngle = time * (1.5 + chargeLevel * 1.5) + (soul * Math.PI) / 3;
    const soulDist = size * 0.5 + Math.sin(time * 2 + soul) * size * 0.08;
    const sx = x + Math.cos(soulAngle) * soulDist;
    const sy = y + Math.sin(soulAngle) * soulDist * 0.4;
    ctx.fillStyle = `rgba(167, 139, 250, ${0.4 + Math.sin(time * 4 + soul) * 0.25})`;
    setShadowBlur(ctx, 6 * zoom, "#a78bfa");
    ctx.beginPath();
    ctx.arc(sx, sy, size * 0.03, 0, Math.PI * 2);
    ctx.fill();
    // Soul trail
    ctx.strokeStyle = `rgba(167, 139, 250, 0.2)`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(
      sx - Math.cos(soulAngle) * size * 0.08,
      sy - Math.sin(soulAngle) * size * 0.03,
    );
    ctx.stroke();
    clearShadow(ctx);
  }

  // Shadow tendrils - more elaborate
  ctx.strokeStyle = `rgba(88, 28, 135, ${darkPulse * 0.7})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 7; i++) {
    const tendrilAngle = time * 0.6 + i * Math.PI * 0.285;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.32);
    let tx = x,
      ty = y + size * 0.32;
    for (let seg = 0; seg < 4; seg++) {
      tx +=
        Math.cos(tendrilAngle + Math.sin(time * 2 + seg) * 0.4) * size * 0.12;
      ty += size * 0.05 + Math.sin(time * 3 + i + seg) * size * 0.03;
      ctx.lineTo(tx, ty);
    }
    ctx.stroke();
  }

  // === ANIMATED LEGS (slow shuffling) ===
  drawAnimatedLegs(ctx, x, y + size * 0.36, size, time, zoom, {
    color: "#1e0a3c",
    colorDark: "#0f0520",
    footColor: "#0a0315",
    strideSpeed: 2,
    strideAmt: 0.12,
    legLen: 0.16,
    width: 0.05,
    shuffle: true,
  });

  // === ANIMATED ARMS (dark channeling) ===
  drawAnimatedArm(ctx, x - size * 0.18, y - size * 0.25 + hover, size, time, zoom, -1, {
    color: "#1e0a3c",
    colorDark: "#0f0520",
    handColor: "#a8a29e",
    swingSpeed: 2,
    swingAmt: 0.3,
    baseAngle: 0.6,
    upperLen: 0.22,
    foreLen: 0.18,
    width: 0.05,
    phaseOffset: 0.3,
  });
  drawAnimatedArm(ctx, x + size * 0.18, y - size * 0.25 + hover, size, time, zoom, 1, {
    color: "#1e0a3c",
    colorDark: "#0f0520",
    handColor: "#a8a29e",
    swingSpeed: 2,
    swingAmt: 0.25,
    baseAngle: 0.5,
    upperLen: 0.2,
    foreLen: 0.17,
    width: 0.05,
    phaseOffset: 1.0,
    attackExtra: isAttacking ? attackIntensity * 0.3 : 0,
  });

  // Dark robes - more tattered and flowing
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.45,
    y,
    x + size * 0.45,
    y,
  );
  robeGrad.addColorStop(0, "#0f0520");
  robeGrad.addColorStop(0.3, "#1e0a3c");
  robeGrad.addColorStop(0.5, "#2d1450");
  robeGrad.addColorStop(0.7, "#1e0a3c");
  robeGrad.addColorStop(1, "#0f0520");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.45, y + size * 0.55);
  for (let i = 0; i < 8; i++) {
    const waveX = x - size * 0.45 + i * size * 0.1125;
    const waveY =
      y +
      size * 0.55 +
      Math.sin(time * 4 + i * 1.2) * size * 0.06 +
      (i % 2) * size * 0.04;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y,
    x + size * 0.18,
    y - size * 0.45 + hover,
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.45 + hover);
  ctx.quadraticCurveTo(x - size * 0.5, y, x - size * 0.45, y + size * 0.55);
  ctx.fill();

  // Void symbols on robe
  ctx.strokeStyle = `rgba(147, 51, 234, ${voidRip * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let sym = 0; sym < 4; sym++) {
    const symX = x - size * 0.2 + sym * size * 0.13;
    const symY = y + size * 0.1 + sym * size * 0.08;
    ctx.beginPath();
    ctx.arc(symX, symY, size * 0.03, 0, Math.PI * 2);
    ctx.moveTo(symX, symY - size * 0.04);
    ctx.lineTo(symX, symY + size * 0.04);
    ctx.stroke();
  }

  // Ancient skull face
  drawRadialAura(ctx, x, y - size * 0.38 + hover, size * 0.2, [
    { offset: 0, color: "#f5f5f4" },
    { offset: 0.6, color: "#e8e0d0" },
    { offset: 1, color: "#d6d3d1" },
  ]);
  // Skull cracks
  ctx.strokeStyle = "#a8a29e";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.5 + hover);
  ctx.lineTo(x - size * 0.08, y - size * 0.42 + hover);
  ctx.lineTo(x - size * 0.03, y - size * 0.35 + hover);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.48 + hover);
  ctx.lineTo(x + size * 0.06, y - size * 0.38 + hover);
  ctx.stroke();
  // Hollow eye sockets
  ctx.fillStyle = "#0f0520";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.4 + hover,
    size * 0.055,
    size * 0.065,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.4 + hover,
    size * 0.055,
    size * 0.065,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Void-fire eyes
  ctx.fillStyle = "#9333ea";
  setShadowBlur(ctx, 12 * zoom, "#9333ea");
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.4 + hover, size * 0.03, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.4 + hover, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  // Skeletal nose hole
  ctx.fillStyle = "#1e0a3c";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.34 + hover);
  ctx.lineTo(x - size * 0.025, y - size * 0.28 + hover);
  ctx.lineTo(x + size * 0.025, y - size * 0.28 + hover);
  ctx.fill();
  // Grinning teeth
  ctx.fillStyle = "#e8e0d0";
  ctx.fillRect(
    x - size * 0.08,
    y - size * 0.26 + hover,
    size * 0.16,
    size * 0.045,
  );
  ctx.strokeStyle = "#1e0a3c";
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.07 + i * size * 0.028, y - size * 0.26 + hover);
    ctx.lineTo(x - size * 0.07 + i * size * 0.028, y - size * 0.215 + hover);
    ctx.stroke();
  }

  // Ornate hood with runes
  ctx.fillStyle = "#0a0315";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.52 + hover,
    size * 0.25,
    size * 0.14,
    0,
    Math.PI,
    0,
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.52 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.3,
    y - size * 0.25 + hover,
    x - size * 0.22,
    y - size * 0.1 + hover,
  );
  ctx.lineTo(x - size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.52 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y - size * 0.25 + hover,
    x + size * 0.22,
    y - size * 0.1 + hover,
  );
  ctx.lineTo(x + size * 0.18, y - size * 0.35 + hover);
  ctx.fill();
  // Hood runes
  ctx.strokeStyle = `rgba(147, 51, 234, ${darkPulse})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.58 + hover, size * 0.06, 0, Math.PI * 2);
  ctx.stroke();

  // Void orb in hand (grows with charge)
  const orbRadius = size * (0.12 + chargeLevel * 0.04);
  ctx.fillStyle = "#4c1d95";
  setShadowBlur(ctx, (12 + chargeLevel * 8) * zoom, "#9333ea");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.35,
    y + size * 0.02 + hover,
    orbRadius,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Dark energy swirls in orb
  ctx.strokeStyle = "#1e0a3c";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.35,
    y + size * 0.02 + hover,
    size * 0.1,
    time * 2,
    time * 2 + Math.PI,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x - size * 0.35,
    y + size * 0.02 + hover,
    size * 0.06,
    time * 3 + Math.PI,
    time * 3 + Math.PI * 2,
  );
  ctx.stroke();
  // Inner glow
  ctx.fillStyle = `rgba(167, 139, 250, ${soulDrain * 0.6})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.35, y + hover, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Skeletal hands holding orb - both sides
  for (const side of [-1, 1]) {
    const handX = x + side * size * 0.28;
    const handY = y + size * 0.08 + hover;
    ctx.fillStyle = "#a8a29e";
    ctx.beginPath();
    ctx.ellipse(handX, handY, size * 0.04, size * 0.025, side * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Bony fingers reaching toward orb
    ctx.strokeStyle = "#d6d3d1";
    ctx.lineWidth = 1.5 * zoom;
    for (let f = 0; f < 3; f++) {
      const fAngle = side * (-0.4 + f * 0.3) + Math.sin(time * 3 + f) * 0.08;
      ctx.beginPath();
      ctx.moveTo(handX + Math.cos(fAngle) * size * 0.03, handY + Math.sin(fAngle) * size * 0.02);
      ctx.lineTo(
        handX + Math.cos(fAngle) * size * 0.07,
        handY + Math.sin(fAngle) * size * 0.04,
      );
      ctx.stroke();
    }
  }

  // Dark mist pooling at robe bottom
  for (let mist = 0; mist < 5; mist++) {
    const mistPhase = (time * 0.5 + mist * 0.3) % 1;
    const mistX = x - size * 0.3 + mist * size * 0.15 + Math.sin(time + mist) * size * 0.05;
    const mistY = y + size * 0.5 + mistPhase * size * 0.1;
    const mistAlpha = (1 - mistPhase) * darkPulse * 0.25;
    ctx.fillStyle = `rgba(88, 28, 135, ${mistAlpha})`;
    ctx.beginPath();
    ctx.ellipse(mistX, mistY, size * 0.08 * (1 + mistPhase), size * 0.03, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack: soul drain vortex
  if (isAttacking) {
    // Expanding void rings
    for (let ring = 0; ring < 3; ring++) {
      const ringPhase = attackIntensity * (1 + ring * 0.15);
      const ringSize = size * (0.2 + ringPhase * 0.6);
      const ringAlpha = (1 - ringPhase) * 0.4;
      ctx.strokeStyle = `rgba(147, 51, 234, ${Math.max(0, ringAlpha)})`;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.arc(x - size * 0.35, y + size * 0.02 + hover, ringSize, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Void beam from orb
    const beamAlpha = attackIntensity * 0.5;
    ctx.strokeStyle = `rgba(167, 139, 250, ${beamAlpha})`;
    ctx.lineWidth = (3 + attackIntensity * 4) * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y + size * 0.02 + hover);
    ctx.lineTo(x - size * 0.35 - size * attackIntensity * 0.8, y + size * 0.02 + hover);
    ctx.stroke();
  }

  // === DARK PURPLE ARCANE SPARKLES ===
  drawArcaneSparkles(ctx, x - size * 0.35, y + size * 0.02 + hover, size * 0.14, time, zoom, {
    color: "rgba(147, 51, 234, 0.55)",
    count: 5,
    speed: 1.8,
    maxAlpha: 0.5,
    sparkleSize: 0.09,
  });

  // === FLOATING DARK ORBS ===
  drawShiftingSegments(ctx, x, y - size * 0.1 + hover, size, time, zoom, {
    color: "#4c1d95",
    colorAlt: "#9333ea",
    count: 5,
    orbitRadius: 0.32,
    segmentSize: 0.035,
    orbitSpeed: 1.5,
    shape: "circle",
  });
}

export function drawCrossbowmanEnemy(
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
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.4)
    : 0.6 + Math.sin(time * 1.2) * 0.25;
  const aim =
    Math.sin(time * 2) * 0.06 + (isAttacking ? attackIntensity * 0.15 : 0);
  const stance = Math.sin(time * 4) * 2.5 * zoom;
  const curseGlow = 0.5 + Math.sin(time * 3) * 0.3 + chargeLevel * 0.15;
  const boltCharge = 0.3 + chargeLevel * 0.5 + Math.sin(time * 5) * 0.2;
  const curseIntensity = isAttacking
    ? 0.7 + attackIntensity * 0.3
    : 0.3 + chargeLevel * 0.4 + Math.sin(time * 3.5) * 0.15;

  // Cursed domain aura
  const curseAura = ctx.createRadialGradient(
    x, y + size * 0.1, 0,
    x, y + size * 0.1, size * (0.55 + chargeLevel * 0.15),
  );
  curseAura.addColorStop(0, `rgba(127, 29, 29, ${curseIntensity * 0.25})`);
  curseAura.addColorStop(0.4, `rgba(100, 20, 20, ${curseIntensity * 0.12})`);
  curseAura.addColorStop(0.7, `rgba(60, 15, 15, ${curseIntensity * 0.06})`);
  curseAura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = curseAura;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.1, size * 0.65, size * 0.65 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Curse rune circles orbiting (speed up as charge builds)
  for (let i = 0; i < 3; i++) {
    const orbitAngle = time * (0.8 + chargeLevel * 1.2) + i * Math.PI * 0.67;
    const orbitDist = size * 0.52 + Math.sin(time * 2 + i) * size * 0.05;
    const ox = x + Math.cos(orbitAngle) * orbitDist;
    const oy = y + Math.sin(orbitAngle) * orbitDist * 0.35;
    const runeAlpha = 0.3 + Math.sin(time * 4 + i * 2) * 0.15;

    const runeGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, size * 0.06);
    runeGlow.addColorStop(0, `rgba(127, 29, 29, ${runeAlpha})`);
    runeGlow.addColorStop(0.5, `rgba(127, 29, 29, ${runeAlpha * 0.4})`);
    runeGlow.addColorStop(1, "rgba(127, 29, 29, 0)");
    ctx.fillStyle = runeGlow;
    ctx.beginPath();
    ctx.arc(ox, oy, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(153, 27, 27, ${runeAlpha * 0.8})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(ox, oy, size * 0.035, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox, oy - size * 0.025);
    ctx.lineTo(ox, oy + size * 0.025);
    ctx.moveTo(ox - size * 0.025, oy);
    ctx.lineTo(ox + size * 0.025, oy);
    ctx.stroke();
  }

  // Curse particles
  for (let p = 0; p < 8; p++) {
    const particlePhase = (time * 0.5 + p * 0.15) % 1;
    const particleAngle = (p * Math.PI) / 4 + time * 0.25;
    const particleDist = size * (0.15 + particlePhase * 0.4);
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y + size * 0.1 - particlePhase * size * 0.6;
    const particleAlpha = (1 - particlePhase) * 0.4 * curseIntensity;
    ctx.fillStyle = `rgba(153, 27, 27, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.012 * (1 - particlePhase * 0.5), 0, Math.PI * 2);
    ctx.fill();
  }

  // Cursed ground pool
  const poolGrad = ctx.createRadialGradient(
    x, y + size * 0.48, 0,
    x, y + size * 0.48, size * 0.45,
  );
  poolGrad.addColorStop(0, `rgba(127, 29, 29, ${curseIntensity * 0.3})`);
  poolGrad.addColorStop(0.5, `rgba(80, 20, 20, ${curseIntensity * 0.15})`);
  poolGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.48, size * 0.45, size * 0.45 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // === ANIMATED LEGS (marching stride) ===
  drawAnimatedLegs(ctx, x, y + size * 0.36, size, time, zoom, {
    color: "#292524",
    colorDark: "#1c1917",
    footColor: "#3f3f46",
    strideSpeed: 5,
    strideAmt: 0.28,
    legLen: 0.18,
    width: 0.06,
  });

  // === ANIMATED ARMS (armored, one aiming) ===
  drawAnimatedArm(ctx, x - size * 0.22, y - size * 0.15 + stance * 0.2, size, time, zoom, -1, {
    color: "#3f3f46",
    colorDark: "#27272a",
    handColor: "#a8a29e",
    swingSpeed: 2,
    swingAmt: 0.15,
    baseAngle: 0.7,
    upperLen: 0.2,
    foreLen: 0.17,
    width: 0.06,
    attackExtra: isAttacking ? attackIntensity * 0.4 : 0,
  });
  drawAnimatedArm(ctx, x + size * 0.22, y - size * 0.15 + stance * 0.2, size, time, zoom, 1, {
    color: "#3f3f46",
    colorDark: "#27272a",
    handColor: "#a8a29e",
    swingSpeed: 4,
    swingAmt: 0.1,
    baseAngle: 0.3,
    upperLen: 0.18,
    foreLen: 0.15,
    width: 0.055,
    phaseOffset: Math.PI * 0.5,
  });

  // Flowing cursed cape
  const capeGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  capeGrad.addColorStop(0, "#1c1917");
  capeGrad.addColorStop(0.3, "#292524");
  capeGrad.addColorStop(0.5, "#3f3f46");
  capeGrad.addColorStop(0.7, "#292524");
  capeGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y + size * 0.52);
  for (let i = 0; i < 6; i++) {
    const waveX = x - size * 0.32 + i * size * 0.128;
    const waveY =
      y + size * 0.52 +
      Math.sin(time * 3 + i * 1.1) * size * 0.03 +
      (i % 2) * size * 0.05;
    ctx.lineTo(waveX, waveY);
  }
  ctx.quadraticCurveTo(
    x + size * 0.42, y + size * 0.05,
    x + size * 0.25, y - size * 0.2 + stance * 0.2,
  );
  ctx.lineTo(x - size * 0.25, y - size * 0.2 + stance * 0.2);
  ctx.quadraticCurveTo(
    x - size * 0.42, y + size * 0.05,
    x - size * 0.32, y + size * 0.52,
  );
  ctx.fill();
  // Cape curse threads
  ctx.strokeStyle = `rgba(127, 29, 29, ${curseGlow * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  for (let thread = 0; thread < 4; thread++) {
    const threadX = x - size * 0.15 + thread * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(threadX, y + size * 0.05);
    ctx.bezierCurveTo(
      threadX + Math.sin(time * 2 + thread) * size * 0.03, y + size * 0.2,
      threadX - Math.cos(time * 2 + thread) * size * 0.02, y + size * 0.35,
      threadX + Math.sin(thread) * size * 0.04, y + size * 0.5,
    );
    ctx.stroke();
  }

  // Heavy cursed armor body
  const armorGrad = ctx.createLinearGradient(x - size * 0.35, y, x + size * 0.35, y);
  armorGrad.addColorStop(0, "#1c1917");
  armorGrad.addColorStop(0.15, "#292524");
  armorGrad.addColorStop(0.3, "#44403c");
  armorGrad.addColorStop(0.5, "#57534e");
  armorGrad.addColorStop(0.7, "#44403c");
  armorGrad.addColorStop(0.85, "#292524");
  armorGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = armorGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.48);
  ctx.lineTo(x - size * 0.38, y - size * 0.12);
  ctx.quadraticCurveTo(x, y - size * 0.38, x + size * 0.38, y - size * 0.12);
  ctx.lineTo(x + size * 0.35, y + size * 0.48);
  ctx.closePath();
  ctx.fill();

  // Spiked pauldrons with gradient
  const pauldronGrad = ctx.createRadialGradient(
    x - size * 0.32, y - size * 0.12 + stance * 0.2, 0,
    x - size * 0.32, y - size * 0.12 + stance * 0.2, size * 0.1,
  );
  pauldronGrad.addColorStop(0, "#71717a");
  pauldronGrad.addColorStop(0.5, "#52525b");
  pauldronGrad.addColorStop(1, "#3f3f46");
  ctx.fillStyle = pauldronGrad;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.32, y - size * 0.12 + stance * 0.2,
    size * 0.1, size * 0.06, -0.3, 0, Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.32, y - size * 0.12 + stance * 0.2,
    size * 0.1, size * 0.06, 0.3, 0, Math.PI * 2,
  );
  ctx.fill();
  // Pauldron edge highlights
  ctx.strokeStyle = "#a1a1aa";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.32, y - size * 0.12 + stance * 0.2,
    size * 0.1, size * 0.06, -0.3, Math.PI, 0,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.32, y - size * 0.12 + stance * 0.2,
    size * 0.1, size * 0.06, 0.3, Math.PI, 0,
  );
  ctx.stroke();
  // Shoulder spikes
  ctx.fillStyle = "#27272a";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y - size * 0.14 + stance * 0.2);
  ctx.lineTo(x - size * 0.42, y - size * 0.28 + stance * 0.2);
  ctx.lineTo(x - size * 0.32, y - size * 0.12 + stance * 0.2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.35, y - size * 0.14 + stance * 0.2);
  ctx.lineTo(x + size * 0.42, y - size * 0.28 + stance * 0.2);
  ctx.lineTo(x + size * 0.32, y - size * 0.12 + stance * 0.2);
  ctx.fill();
  // Pauldron curse runes
  ctx.fillStyle = `rgba(127, 29, 29, ${curseGlow * 0.5})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.32, y - size * 0.12 + stance * 0.2, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.32, y - size * 0.12 + stance * 0.2, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Runed chest plate with improved gradient
  const plateGrad = ctx.createLinearGradient(
    x - size * 0.22, y - size * 0.2,
    x + size * 0.22, y + size * 0.2,
  );
  plateGrad.addColorStop(0, "#52525b");
  plateGrad.addColorStop(0.3, "#71717a");
  plateGrad.addColorStop(0.5, "#a1a1aa");
  plateGrad.addColorStop(0.7, "#71717a");
  plateGrad.addColorStop(1, "#52525b");
  ctx.fillStyle = plateGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + size * 0.22);
  ctx.lineTo(x - size * 0.24, y - size * 0.18);
  ctx.quadraticCurveTo(x, y - size * 0.28, x + size * 0.24, y - size * 0.18);
  ctx.lineTo(x + size * 0.22, y + size * 0.22);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#3f3f46";
  ctx.lineWidth = 2.5 * zoom;
  ctx.stroke();
  // Curse rune pattern on plate
  ctx.strokeStyle = `rgba(127, 29, 29, ${curseGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x, y + size * 0.15);
  ctx.moveTo(x - size * 0.12, y - size * 0.05);
  ctx.lineTo(x + size * 0.12, y - size * 0.05);
  ctx.stroke();
  // Diagonal curse marks
  ctx.strokeStyle = `rgba(127, 29, 29, ${curseGlow * 0.35})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.15);
  ctx.lineTo(x - size * 0.02, y + size * 0.05);
  ctx.moveTo(x + size * 0.1, y - size * 0.15);
  ctx.lineTo(x + size * 0.02, y + size * 0.05);
  ctx.stroke();
  // Skull emblem with glow
  const emblemGlow = ctx.createRadialGradient(
    x, y - size * 0.02, 0,
    x, y - size * 0.02, size * 0.06,
  );
  emblemGlow.addColorStop(0, `rgba(127, 29, 29, ${curseGlow * 0.3})`);
  emblemGlow.addColorStop(1, "rgba(127, 29, 29, 0)");
  ctx.fillStyle = emblemGlow;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.02, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a8a29e";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.02, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.arc(x - size * 0.012, y - size * 0.025, size * 0.008, 0, Math.PI * 2);
  ctx.arc(x + size * 0.012, y - size * 0.025, size * 0.008, 0, Math.PI * 2);
  ctx.fill();

  // Metal rivets with subtle glow
  for (let i = 0; i < 4; i++) {
    const rivetGrad = ctx.createRadialGradient(
      x - size * 0.15 + i * size * 0.1, y - size * 0.12, 0,
      x - size * 0.15 + i * size * 0.1, y - size * 0.12, size * 0.022,
    );
    rivetGrad.addColorStop(0, "#a1a1aa");
    rivetGrad.addColorStop(0.6, "#71717a");
    rivetGrad.addColorStop(1, "#52525b");
    ctx.fillStyle = rivetGrad;
    ctx.beginPath();
    ctx.arc(x - size * 0.15 + i * size * 0.1, y - size * 0.12, size * 0.022, 0, Math.PI * 2);
    ctx.fill();
  }

  // Face under helmet with gradient
  const faceGrad = ctx.createRadialGradient(
    x, y - size * 0.4, 0,
    x, y - size * 0.4, size * 0.15,
  );
  faceGrad.addColorStop(0, "#a1a1aa");
  faceGrad.addColorStop(0.5, "#78716c");
  faceGrad.addColorStop(1, "#57534e");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.4, size * 0.15, 0.35 * Math.PI, 2.65 * Math.PI);
  ctx.fill();

  // Menacing sallet helmet with improved gradient
  const helmGrad = ctx.createLinearGradient(
    x - size * 0.2, y - size * 0.6,
    x + size * 0.2, y - size * 0.35,
  );
  helmGrad.addColorStop(0, "#27272a");
  helmGrad.addColorStop(0.3, "#3f3f46");
  helmGrad.addColorStop(0.5, "#52525b");
  helmGrad.addColorStop(0.7, "#3f3f46");
  helmGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.2, size * 0.14, 0, Math.PI, 0);
  ctx.fill();
  // Helmet edge highlight
  ctx.strokeStyle = "#71717a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.48, size * 0.2, size * 0.14, 0, Math.PI + 0.3, -0.3, true);
  ctx.stroke();
  // Helmet tail
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14, y - size * 0.45);
  ctx.quadraticCurveTo(
    x + size * 0.3, y - size * 0.4,
    x + size * 0.25, y - size * 0.28,
  );
  ctx.lineTo(x + size * 0.12, y - size * 0.38);
  ctx.fill();
  // Horn with gradient
  const hornGrad = ctx.createLinearGradient(x, y - size * 0.72, x, y - size * 0.58);
  hornGrad.addColorStop(0, "#1c1917");
  hornGrad.addColorStop(0.5, "#3f3f46");
  hornGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = hornGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.58);
  ctx.lineTo(x, y - size * 0.72);
  ctx.lineTo(x + size * 0.05, y - size * 0.58);
  ctx.fill();
  // Horn curse rune
  ctx.fillStyle = `rgba(127, 29, 29, ${curseGlow * 0.5})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.63, size * 0.01, 0, Math.PI * 2);
  ctx.fill();
  // Visor with T-slit
  ctx.fillStyle = "#27272a";
  ctx.fillRect(x - size * 0.14, y - size * 0.46, size * 0.28, size * 0.08);
  // T-shaped eye slit with red glow and aura
  const visorGlow = ctx.createRadialGradient(
    x, y - size * 0.43, 0,
    x, y - size * 0.43, size * 0.15,
  );
  visorGlow.addColorStop(0, `rgba(127, 29, 29, ${curseGlow * 0.3})`);
  visorGlow.addColorStop(1, "rgba(127, 29, 29, 0)");
  ctx.fillStyle = visorGlow;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.43, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(127, 29, 29, ${curseGlow})`;
  setShadowBlur(ctx, 6 * zoom, "#7f1d1d");
  ctx.fillRect(x - size * 0.12, y - size * 0.44, size * 0.24, size * 0.025);
  ctx.fillRect(x - size * 0.015, y - size * 0.44, size * 0.03, size * 0.05);
  clearShadow(ctx);

  // Massive siege crossbow with soul mechanism
  ctx.save();
  ctx.translate(x - size * 0.18, y + size * 0.06);
  ctx.rotate(aim);
  // Stock with gradient
  const stockGrad = ctx.createLinearGradient(-size * 0.45, 0, size * 0.05, 0);
  stockGrad.addColorStop(0, "#1c1917");
  stockGrad.addColorStop(0.3, "#292524");
  stockGrad.addColorStop(0.5, "#44403c");
  stockGrad.addColorStop(0.7, "#292524");
  stockGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = stockGrad;
  ctx.fillRect(-size * 0.45, -size * 0.05, size * 0.5, size * 0.1);
  // Stock edge
  ctx.strokeStyle = "#57534e";
  ctx.lineWidth = 1 * zoom;
  ctx.strokeRect(-size * 0.45, -size * 0.05, size * 0.5, size * 0.1);
  // Bone inlays
  ctx.fillStyle = "#a8a29e";
  ctx.fillRect(-size * 0.35, -size * 0.04, size * 0.06, size * 0.08);
  ctx.fillRect(-size * 0.15, -size * 0.04, size * 0.06, size * 0.08);
  // Bone inlay detail
  ctx.strokeStyle = "#78716c";
  ctx.lineWidth = 0.5 * zoom;
  ctx.strokeRect(-size * 0.35, -size * 0.04, size * 0.06, size * 0.08);
  ctx.strokeRect(-size * 0.15, -size * 0.04, size * 0.06, size * 0.08);
  // Metal mechanism
  const mechGrad = ctx.createLinearGradient(-size * 0.48, -size * 0.06, -size * 0.48, size * 0.06);
  mechGrad.addColorStop(0, "#52525b");
  mechGrad.addColorStop(0.5, "#3f3f46");
  mechGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = mechGrad;
  ctx.fillRect(-size * 0.48, -size * 0.06, size * 0.1, size * 0.12);
  // Curse rune on mechanism
  ctx.strokeStyle = `rgba(127, 29, 29, ${boltCharge})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(-size * 0.43, 0, size * 0.025, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.43, -size * 0.015);
  ctx.lineTo(-size * 0.43, size * 0.015);
  ctx.stroke();
  // Bow limbs with better rendering
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, 0);
  ctx.quadraticCurveTo(-size * 0.62, -size * 0.22, -size * 0.52, -size * 0.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, 0);
  ctx.quadraticCurveTo(-size * 0.62, size * 0.22, -size * 0.52, size * 0.4);
  ctx.stroke();
  // Limb inner line
  ctx.strokeStyle = "#44403c";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, 0);
  ctx.quadraticCurveTo(-size * 0.6, -size * 0.2, -size * 0.51, -size * 0.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.45, 0);
  ctx.quadraticCurveTo(-size * 0.6, size * 0.2, -size * 0.51, size * 0.38);
  ctx.stroke();
  // Limb spikes
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(-size * 0.52, -size * 0.4);
  ctx.lineTo(-size * 0.48, -size * 0.5);
  ctx.lineTo(-size * 0.55, -size * 0.42);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-size * 0.52, size * 0.4);
  ctx.lineTo(-size * 0.48, size * 0.5);
  ctx.lineTo(-size * 0.55, size * 0.42);
  ctx.fill();
  // Soul-chain bowstring
  ctx.strokeStyle = `rgba(127, 29, 29, ${boltCharge * 0.8})`;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.52, -size * 0.4);
  ctx.lineTo(-size * 0.18, 0);
  ctx.lineTo(-size * 0.52, size * 0.4);
  ctx.stroke();
  // String energy at pull point
  ctx.fillStyle = `rgba(153, 27, 27, ${boltCharge * 0.5})`;
  ctx.beginPath();
  ctx.arc(-size * 0.18, 0, size * 0.015, 0, Math.PI * 2);
  ctx.fill();
  // Bolt with energy aura
  ctx.strokeStyle = `rgba(127, 29, 29, ${boltCharge * 0.25})`;
  ctx.lineWidth = 8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.62, 0);
  ctx.lineTo(-size * 0.28, 0);
  ctx.stroke();
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(-size * 0.62, -size * 0.018, size * 0.35, size * 0.036);
  // Bolt head with glow
  ctx.fillStyle = `rgba(127, 29, 29, ${boltCharge})`;
  setShadowBlur(ctx, 8 * zoom, "#7f1d1d");
  ctx.beginPath();
  ctx.moveTo(-size * 0.68, 0);
  ctx.lineTo(-size * 0.58, -size * 0.04);
  ctx.lineTo(-size * 0.58, size * 0.04);
  ctx.fill();
  clearShadow(ctx);
  // Bolt fletching
  ctx.fillStyle = "#44403c";
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, 0);
  ctx.lineTo(-size * 0.22, -size * 0.03);
  ctx.lineTo(-size * 0.22, size * 0.03);
  ctx.fill();
  ctx.restore();

  // === MECHANICAL GLOW around crossbow mechanism ===
  drawPulsingGlowRings(ctx, x - size * 0.36, y + size * 0.06, size * 0.12, time, zoom, {
    color: "rgba(127, 29, 29, 0.4)",
    count: 2,
    speed: 1.8,
    maxAlpha: 0.35,
    expansion: 1.3,
  });

  // === FLOATING BOLT TIPS ===
  drawShiftingSegments(ctx, x - size * 0.1, y - size * 0.1, size, time, zoom, {
    color: "#7f1d1d",
    colorAlt: "#991b1b",
    count: 4,
    orbitRadius: 0.3,
    segmentSize: 0.03,
    orbitSpeed: 1.5,
    shape: "shard",
  });
}

export function drawHexerEnemy(
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
  const chargeLevel = isAttacking
    ? Math.max(0, 1 - attackIntensity * 1.3)
    : 0.6 + Math.sin(time * 1.4) * 0.3;
  const sway =
    Math.sin(time * 3) * 3 * zoom +
    (isAttacking ? attackIntensity * size * 0.15 : 0);
  const hexPulse = 0.6 + Math.sin(time * 5) * 0.4 + chargeLevel * 0.15;
  const breathe = Math.sin(time * 2.5) * size * 0.015;
  const curseIntensity = isAttacking
    ? 0.7 + attackIntensity * 0.3
    : 0.3 + chargeLevel * 0.4 + Math.sin(time * 4) * 0.15;
  const hover = Math.sin(time * 2) * size * 0.02;

  // === LAYER 1: CURSE DOMAIN AURA ===
  // Dark magic ground pool
  const poolGrad = ctx.createRadialGradient(
    x,
    y + size * 0.5,
    0,
    x,
    y + size * 0.5,
    size * 0.55,
  );
  poolGrad.addColorStop(0, `rgba(190, 24, 93, ${curseIntensity * 0.35})`);
  poolGrad.addColorStop(0.4, `rgba(131, 24, 67, ${curseIntensity * 0.2})`);
  poolGrad.addColorStop(0.7, `rgba(76, 29, 149, ${curseIntensity * 0.1})`);
  poolGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = poolGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.5, size * 0.55, size * 0.55 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rippling curse rings on ground
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 0.8 + ring * 0.4) % 1;
    const ringSize = size * (0.2 + ringPhase * 0.35);
    const ringAlpha = (0.4 - ringPhase * 0.35) * curseIntensity;
    ctx.strokeStyle = `rgba(190, 24, 93, ${ringAlpha})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y + size * 0.5, ringSize, ringSize * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // === LAYER 2: FLOATING HEX CIRCLES - ORBITAL CURSE RUNES ===
  for (let i = 0; i < 5; i++) {
    const orbitAngle = time * (1.2 + chargeLevel * 1.0) + i * Math.PI * 0.4;
    const orbitDist = size * 0.55 + Math.sin(time * 2 + i) * size * 0.08;
    const orbitX = x + Math.cos(orbitAngle) * orbitDist;
    const orbitY =
      y - size * 0.1 + Math.sin(orbitAngle) * orbitDist * 0.4 + hover;
    const runeSize = size * 0.1 + Math.sin(time * 4 + i * 2) * size * 0.015;

    // Hex rune glow (gradient instead of shadowBlur)
    const runeGlow = ctx.createRadialGradient(
      orbitX,
      orbitY,
      0,
      orbitX,
      orbitY,
      runeSize * 2.5,
    );
    runeGlow.addColorStop(0, `rgba(190, 24, 93, ${hexPulse * 0.5})`);
    runeGlow.addColorStop(0.4, `rgba(190, 24, 93, ${hexPulse * 0.2})`);
    runeGlow.addColorStop(1, "rgba(190, 24, 93, 0)");
    ctx.fillStyle = runeGlow;
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, runeSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Hex circle outer ring
    ctx.strokeStyle = `rgba(236, 72, 153, ${hexPulse * 0.8})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, runeSize, 0, Math.PI * 2);
    ctx.stroke();

    // Inner hex circle
    ctx.strokeStyle = `rgba(190, 24, 93, ${hexPulse})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(orbitX, orbitY, runeSize * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // Hex rune symbol (6-pointed star)
    ctx.fillStyle = `rgba(251, 113, 133, ${hexPulse})`;
    for (let p = 0; p < 6; p++) {
      const starAngle = time * 0.5 + (p * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(orbitX, orbitY);
      ctx.lineTo(
        orbitX + Math.cos(starAngle) * runeSize * 0.5,
        orbitY + Math.sin(starAngle) * runeSize * 0.5,
      );
      ctx.lineTo(
        orbitX + Math.cos(starAngle + Math.PI / 6) * runeSize * 0.25,
        orbitY + Math.sin(starAngle + Math.PI / 6) * runeSize * 0.25,
      );
      ctx.fill();
    }

    // Connecting energy thread to witch
    ctx.strokeStyle = `rgba(190, 24, 93, ${0.15 + Math.sin(time * 3 + i) * 0.1})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(orbitX, orbitY);
    ctx.quadraticCurveTo(
      x + Math.cos(orbitAngle) * orbitDist * 0.5,
      y - size * 0.2 + hover,
      x,
      y - size * 0.15 + hover,
    );
    ctx.stroke();
  }

  // === LAYER 3: CURSE PARTICLES ===
  for (let p = 0; p < 12; p++) {
    const particlePhase = (time * 0.6 + p * 0.15) % 1;
    const particleAngle = (p * Math.PI) / 6 + time * 0.3;
    const particleDist = size * (0.2 + particlePhase * 0.5);
    const px = x + Math.cos(particleAngle) * particleDist;
    const py = y - size * 0.1 - particlePhase * size * 0.4 + hover;
    const particleAlpha = (1 - particlePhase) * 0.5 * curseIntensity;
    const particleSize = size * 0.02 * (1 - particlePhase * 0.5);

    ctx.fillStyle = `rgba(236, 72, 153, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // === ANIMATED LEGS (unsteady gait) ===
  drawAnimatedLegs(ctx, x, y + size * 0.34, size, time, zoom, {
    color: "#6b21a8",
    colorDark: "#4c1d95",
    footColor: "#1a1a2e",
    strideSpeed: 3.5,
    strideAmt: 0.22,
    legLen: 0.16,
    width: 0.045,
    shuffle: true,
    phaseOffset: 0.7,
  });

  // === ANIMATED ARMS (curse-weaving gestures) ===
  drawAnimatedArm(ctx, x - size * 0.16, y - size * 0.2 + sway, size, time, zoom, -1, {
    color: "#9d174d",
    colorDark: "#831843",
    handColor: "#fdf4ff",
    swingSpeed: 4,
    swingAmt: 0.4,
    baseAngle: 0.5,
    upperLen: 0.18,
    foreLen: 0.15,
    width: 0.04,
    phaseOffset: 0.3,
    elbowBend: 0.5,
  });
  drawAnimatedArm(ctx, x + size * 0.16, y - size * 0.2 + sway, size, time, zoom, 1, {
    color: "#9d174d",
    colorDark: "#831843",
    handColor: "#fdf4ff",
    swingSpeed: 4,
    swingAmt: 0.35,
    baseAngle: 0.4,
    upperLen: 0.17,
    foreLen: 0.14,
    width: 0.04,
    phaseOffset: 1.5,
    elbowBend: 0.6,
    attackExtra: isAttacking ? attackIntensity * 0.5 : 0,
  });

  // === LAYER 5: TATTERED DRESS WITH MAGICAL THREADS ===
  const dressGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y,
  );
  dressGrad.addColorStop(0, "#6b21a8");
  dressGrad.addColorStop(0.3, "#9d174d");
  dressGrad.addColorStop(0.5, "#be185d");
  dressGrad.addColorStop(0.7, "#9d174d");
  dressGrad.addColorStop(1, "#6b21a8");
  ctx.fillStyle = dressGrad;
  drawRobeBody(ctx, x, size * 0.18, y - size * 0.32 + sway + breathe, size * 0.4, y + size * 0.52, size * 0.42, y + size * 0.1, {
    count: 8,
    amplitude: size * 0.04,
    time: time,
    speed: 4,
    altAmplitude: size * 0.08,
  });

  // Dress inner shading
  const innerDressGrad = ctx.createLinearGradient(
    x,
    y - size * 0.2,
    x,
    y + size * 0.5,
  );
  innerDressGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  innerDressGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.2)");
  innerDressGrad.addColorStop(1, "rgba(0, 0, 0, 0.4)");
  ctx.fillStyle = innerDressGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.15, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Magical thread patterns on dress
  ctx.strokeStyle = `rgba(236, 72, 153, ${hexPulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  for (let thread = 0; thread < 5; thread++) {
    const threadX = x - size * 0.2 + thread * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(threadX, y - size * 0.1 + sway * 0.3);
    ctx.bezierCurveTo(
      threadX + Math.sin(time * 2 + thread) * size * 0.05,
      y + size * 0.1,
      threadX - Math.cos(time * 2 + thread) * size * 0.04,
      y + size * 0.3,
      threadX + Math.sin(thread) * size * 0.06,
      y + size * 0.48,
    );
    ctx.stroke();
  }

  // Belt with curse gems
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(
    x - size * 0.22,
    y - size * 0.12 + sway * 0.5,
    size * 0.44,
    size * 0.05,
  );
  // Gem centerpiece
  const gemGrad = ctx.createRadialGradient(
    x,
    y - size * 0.1 + sway * 0.5,
    0,
    x,
    y - size * 0.1 + sway * 0.5,
    size * 0.04,
  );
  gemGrad.addColorStop(0, "#fb7185");
  gemGrad.addColorStop(0.5, "#be185d");
  gemGrad.addColorStop(1, "#831843");
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.14 + sway * 0.5);
  ctx.lineTo(x - size * 0.035, y - size * 0.1 + sway * 0.5);
  ctx.lineTo(x, y - size * 0.06 + sway * 0.5);
  ctx.lineTo(x + size * 0.035, y - size * 0.1 + sway * 0.5);
  ctx.fill();

  // === LAYER 6: WILD FLOWING HAIR ===
  // Multiple hair strands for detail
  const hairColors = ["#1a1a2e", "#2d1f3d", "#1e1b4b"];
  for (let strand = 0; strand < 6; strand++) {
    const strandSide = strand < 3 ? -1 : 1;
    const strandOffset = (strand % 3) * 0.1;
    ctx.fillStyle = hairColors[strand % 3];
    ctx.beginPath();
    ctx.moveTo(
      x + strandSide * (size * 0.12 + strandOffset * size),
      y - size * 0.45 + sway,
    );
    ctx.quadraticCurveTo(
      x + strandSide * (size * 0.35 + strandOffset * size * 0.5),
      y - size * 0.25 + Math.sin(time * 3 + strand) * size * 0.05,
      x + strandSide * (size * 0.32 + strandOffset * size * 0.3),
      y + size * 0.15 + Math.sin(time * 2.5 + strand * 0.5) * size * 0.08,
    );
    ctx.quadraticCurveTo(
      x + strandSide * (size * 0.22 + strandOffset * size * 0.2),
      y - size * 0.05,
      x + strandSide * (size * 0.08 + strandOffset * size * 0.1),
      y - size * 0.4 + sway,
    );
    ctx.fill();
  }

  // Hair highlights
  ctx.strokeStyle = "rgba(139, 92, 246, 0.3)";
  ctx.lineWidth = 1 * zoom;
  for (let hl = 0; hl < 4; hl++) {
    const hlSide = hl < 2 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(x + hlSide * size * (0.15 + hl * 0.05), y - size * 0.43 + sway);
    ctx.quadraticCurveTo(
      x + hlSide * size * 0.25,
      y - size * 0.1,
      x + hlSide * size * 0.28,
      y + size * 0.05,
    );
    ctx.stroke();
  }

  // === LAYER 7: PALE FACE WITH DETAILS ===
  // Face glow effect (gradient)
  drawRadialAura(ctx, x, y - size * 0.42 + sway, size * 0.22, [
    { offset: 0, color: "rgba(251, 207, 232, 0.3)" },
    { offset: 1, color: "rgba(251, 207, 232, 0)" },
  ]);

  // Face base
  const faceGrad = ctx.createRadialGradient(
    x,
    y - size * 0.44 + sway,
    0,
    x,
    y - size * 0.4 + sway,
    size * 0.16,
  );
  faceGrad.addColorStop(0, "#fdf4ff");
  faceGrad.addColorStop(0.7, "#f5f5f5");
  faceGrad.addColorStop(1, "#e5e5e5");
  ctx.fillStyle = faceGrad;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.42 + sway, size * 0.16, 0, Math.PI * 2);
  ctx.fill();

  // Cheek shadows
  ctx.fillStyle = "rgba(190, 24, 93, 0.15)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.38 + sway,
    size * 0.04,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.38 + sway,
    size * 0.04,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye sockets (darker)
  ctx.fillStyle = "rgba(88, 28, 135, 0.3)";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.44 + sway,
    size * 0.05,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.44 + sway,
    size * 0.05,
    size * 0.03,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Sinister eyes with glow (gradient instead of shadowBlur)
  const eyeGlow = ctx.createRadialGradient(
    x - size * 0.06,
    y - size * 0.44 + sway,
    0,
    x - size * 0.06,
    y - size * 0.44 + sway,
    size * 0.06,
  );
  eyeGlow.addColorStop(0, "#f472b6");
  eyeGlow.addColorStop(0.4, "rgba(236, 72, 153, 0.6)");
  eyeGlow.addColorStop(1, "rgba(236, 72, 153, 0)");
  ctx.fillStyle = eyeGlow;
  ctx.beginPath();
  ctx.arc(x - size * 0.06, y - size * 0.44 + sway, size * 0.06, 0, Math.PI * 2);
  ctx.arc(x + size * 0.06, y - size * 0.44 + sway, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Eye cores
  ctx.fillStyle = "#be185d";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.06,
    y - size * 0.44 + sway,
    size * 0.035,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.06,
    y - size * 0.44 + sway,
    size * 0.035,
    size * 0.025,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye pupils
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.055,
    y - size * 0.445 + sway,
    size * 0.012,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.055,
    y - size * 0.445 + sway,
    size * 0.012,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye highlights
  ctx.fillStyle = "#fdf4ff";
  ctx.beginPath();
  ctx.arc(
    x - size * 0.07,
    y - size * 0.45 + sway,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.05,
    y - size * 0.45 + sway,
    size * 0.008,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Wicked smile
  ctx.strokeStyle = "#4a1942";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + sway, size * 0.07, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();
  // Smile corners
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.33 + sway);
  ctx.lineTo(x - size * 0.075, y - size * 0.35 + sway);
  ctx.moveTo(x + size * 0.06, y - size * 0.33 + sway);
  ctx.lineTo(x + size * 0.075, y - size * 0.35 + sway);
  ctx.stroke();

  // Nose
  ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.42 + sway);
  ctx.lineTo(x, y - size * 0.37 + sway);
  ctx.stroke();

  // === LAYER 8: ORNATE WITCH HAT ===
  // Hat body
  const hatGrad = ctx.createLinearGradient(
    x - size * 0.2,
    y - size * 0.9 + sway,
    x + size * 0.2,
    y - size * 0.5 + sway,
  );
  hatGrad.addColorStop(0, "#0f0f23");
  hatGrad.addColorStop(0.5, "#1a1a2e");
  hatGrad.addColorStop(1, "#2d2d44");
  ctx.fillStyle = hatGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.54 + sway);
  ctx.quadraticCurveTo(
    x - size * 0.08,
    y - size * 0.72 + sway,
    x + size * 0.12,
    y - size * 0.92 + sway + Math.sin(time * 2) * size * 0.02,
  );
  ctx.lineTo(x + size * 0.2, y - size * 0.54 + sway);
  ctx.closePath();
  ctx.fill();

  // Hat brim
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.54 + sway,
    size * 0.24,
    size * 0.07,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Hat band with rune pattern
  ctx.fillStyle = "#9d174d";
  ctx.fillRect(
    x - size * 0.17,
    y - size * 0.62 + sway,
    size * 0.28,
    size * 0.05,
  );
  // Rune symbols on band
  ctx.fillStyle = "#fb7185";
  for (let r = 0; r < 4; r++) {
    const runeX = x - size * 0.12 + r * size * 0.08;
    ctx.beginPath();
    ctx.arc(runeX, y - size * 0.595 + sway, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hat gem
  const hatGem = ctx.createRadialGradient(
    x + size * 0.08,
    y - size * 0.88 + sway,
    0,
    x + size * 0.08,
    y - size * 0.88 + sway,
    size * 0.04,
  );
  hatGem.addColorStop(0, "#fb7185");
  hatGem.addColorStop(0.5, "#be185d");
  hatGem.addColorStop(1, "#831843");
  ctx.fillStyle = hatGem;
  ctx.beginPath();
  ctx.arc(x + size * 0.1, y - size * 0.85 + sway, size * 0.035, 0, Math.PI * 2);
  ctx.fill();

  // === LAYER 9: CURSE STAFF ===
  // Staff body
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.12 + sway);
  ctx.lineTo(x + size * 0.48, y + size * 0.35);
  ctx.stroke();

  // Staff grip wrapping
  ctx.strokeStyle = "#581c87";
  ctx.lineWidth = 2 * zoom;
  for (let w = 0; w < 5; w++) {
    const wrapY = y + size * 0.1 + w * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.34 - w * 0.02, wrapY);
    ctx.lineTo(x + size * 0.38 - w * 0.02, wrapY + size * 0.03);
    ctx.stroke();
  }

  // Crystal mounting
  ctx.fillStyle = "#1a1a2e";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18, y - size * 0.08 + sway);
  ctx.lineTo(x + size * 0.26, y - size * 0.08 + sway);
  ctx.lineTo(x + size * 0.24, y - size * 0.14 + sway);
  ctx.lineTo(x + size * 0.2, y - size * 0.14 + sway);
  ctx.fill();

  // Hex crystal with glow effect (intensifies with charge)
  const crystalGlow = ctx.createRadialGradient(
    x + size * 0.22,
    y - size * 0.22 + sway,
    0,
    x + size * 0.22,
    y - size * 0.22 + sway,
    size * 0.12,
  );
  crystalGlow.addColorStop(0, `rgba(236, 72, 153, ${hexPulse * 0.6})`);
  crystalGlow.addColorStop(0.5, `rgba(190, 24, 93, ${hexPulse * 0.3})`);
  crystalGlow.addColorStop(1, "rgba(190, 24, 93, 0)");
  ctx.fillStyle = crystalGlow;
  ctx.beginPath();
  ctx.arc(x + size * 0.22, y - size * 0.22 + sway, size * 0.12, 0, Math.PI * 2);
  ctx.fill();

  // Crystal body
  const crystalGrad = ctx.createLinearGradient(
    x + size * 0.18,
    y - size * 0.32 + sway,
    x + size * 0.26,
    y - size * 0.14 + sway,
  );
  crystalGrad.addColorStop(0, "#f472b6");
  crystalGrad.addColorStop(0.3, "#be185d");
  crystalGrad.addColorStop(0.7, "#9d174d");
  crystalGrad.addColorStop(1, "#831843");
  ctx.fillStyle = crystalGrad;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22, y - size * 0.32 + sway);
  ctx.lineTo(x + size * 0.16, y - size * 0.2 + sway);
  ctx.lineTo(x + size * 0.19, y - size * 0.14 + sway);
  ctx.lineTo(x + size * 0.25, y - size * 0.14 + sway);
  ctx.lineTo(x + size * 0.28, y - size * 0.2 + sway);
  ctx.closePath();
  ctx.fill();

  // Crystal inner glow
  ctx.fillStyle = `rgba(251, 113, 133, ${hexPulse})`;
  ctx.beginPath();
  ctx.arc(x + size * 0.22, y - size * 0.21 + sway, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Crystal charge-up glow (visible during charging, bursts on attack)
  if (chargeLevel > 0.3 || isAttacking) {
    const beamAlpha = isAttacking
      ? attackIntensity * 0.8
      : (chargeLevel - 0.3) * 0.4;
    const beamLength = isAttacking
      ? size * 0.28
      : size * 0.1 * chargeLevel;
    ctx.strokeStyle = `rgba(236, 72, 153, ${beamAlpha})`;
    ctx.lineWidth = (2 + (isAttacking ? 2 : chargeLevel) * 2) * zoom;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.22, y - size * 0.32 + sway);
    ctx.lineTo(x + size * 0.22, y - size * 0.32 - beamLength + sway);
    ctx.stroke();
    const particleCount = isAttacking ? 3 : Math.floor(chargeLevel * 2);
    for (let ep = 0; ep < particleCount; ep++) {
      const epAngle = time * 8 + ep * Math.PI * 0.67;
      const epAlpha = isAttacking ? attackIntensity * 0.6 : chargeLevel * 0.3;
      ctx.fillStyle = `rgba(251, 113, 133, ${epAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + size * 0.22 + Math.cos(epAngle) * size * 0.04,
        y - size * 0.32 - beamLength + sway + Math.sin(epAngle) * size * 0.04,
        size * 0.012,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // === LAYER 10: HAND HOLDING STAFF ===
  ctx.fillStyle = "#fdf4ff";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.2,
    y - size * 0.08 + sway,
    size * 0.045,
    size * 0.03,
    -0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  // Fingers
  for (let f = 0; f < 4; f++) {
    ctx.beginPath();
    ctx.ellipse(
      x + size * 0.2 + f * size * 0.015 - size * 0.02,
      y - size * 0.06 + sway,
      size * 0.012,
      size * 0.025,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // === SICKLY GREEN ARCANE SPARKLES around hex crystal ===
  drawArcaneSparkles(ctx, x + size * 0.22, y - size * 0.22 + sway, size * 0.1, time, zoom, {
    color: "rgba(74, 222, 128, 0.5)",
    count: 5,
    speed: 2.5,
    maxAlpha: 0.45,
    sparkleSize: 0.1,
  });

  // === FLOATING HEX SYMBOLS ===
  drawShiftingSegments(ctx, x, y - size * 0.15 + sway, size, time, zoom, {
    color: "#be185d",
    colorAlt: "#ec4899",
    count: 5,
    orbitRadius: 0.35,
    segmentSize: 0.03,
    orbitSpeed: 2.0,
    shape: "diamond",
  });
}
