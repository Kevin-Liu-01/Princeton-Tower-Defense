import type { Position } from "../../types";
import { drawAnimatedArm } from "../enemies/animationHelpers";
import {
  drawHexPlate,
  drawHexArmorPlate,
  drawGlowingHexGem,
  drawHexChainMail,
  drawGhostlyWisps,
  drawDissolveParticles,
  drawHexScaleArmor,
  drawHexEnergyVeins,
  traceHexPath,
  hexVertices,
} from "./hexHelpers";

export function drawRowingTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  _targetPos?: Position,
) {
  const breathe = Math.sin(time * 2.6) * 0.45;
  const isAttacking = attackPhase > 0;
  const pull = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  const sway = Math.sin(time * 1.8) * size * 0.018;
  const shimmer = 0.56 + Math.sin(time * 5.2) * 0.38;
  const auraPulse = 0.72 + Math.sin(time * 4.2) * 0.2;

  ctx.save();

  // hex ward circle beneath
  ctx.save();
  ctx.globalAlpha = 0.15 * auraPulse;
  traceHexPath(ctx, x, y + size * 0.38, size * 0.34);
  const poolGrad = ctx.createRadialGradient(x, y + size * 0.38, 0, x, y + size * 0.38, size * 0.34);
  poolGrad.addColorStop(0, "rgba(139, 92, 246, 0.5)");
  poolGrad.addColorStop(0.6, "rgba(109, 40, 217, 0.3)");
  poolGrad.addColorStop(1, "rgba(76, 29, 149, 0)");
  ctx.fillStyle = poolGrad;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  // aura
  const aura = ctx.createRadialGradient(x, y - size * 0.02, 0, x, y - size * 0.02, size * 0.52);
  aura.addColorStop(0, `rgba(216, 180, 254, ${0.22 * auraPulse})`);
  aura.addColorStop(0.55, `rgba(147, 51, 234, ${0.15 * auraPulse})`);
  aura.addColorStop(1, "rgba(76, 29, 149, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.01, size * 0.48, size * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  // spectral lower body (ghostly below waist)
  const lowerGrad = ctx.createLinearGradient(x, y + size * 0.18, x, y + size * 0.65);
  lowerGrad.addColorStop(0, "rgba(91, 33, 182, 0.65)");
  lowerGrad.addColorStop(0.3, "rgba(76, 29, 149, 0.45)");
  lowerGrad.addColorStop(0.6, "rgba(59, 7, 100, 0.2)");
  lowerGrad.addColorStop(1, "rgba(46, 16, 101, 0)");
  ctx.fillStyle = lowerGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.18);
  ctx.quadraticCurveTo(x - size * 0.3, y + size * 0.38, x - size * 0.15, y + size * 0.56);
  ctx.quadraticCurveTo(x - size * 0.06, y + size * 0.5, x, y + size * 0.62);
  ctx.quadraticCurveTo(x + size * 0.06, y + size * 0.5, x + size * 0.15, y + size * 0.56);
  ctx.quadraticCurveTo(x + size * 0.3, y + size * 0.38, x + size * 0.2, y + size * 0.18);
  ctx.closePath();
  ctx.fill();

  // wispy tendrils from lower body
  drawGhostlyWisps(ctx, x, y + size * 0.42, size, time, zoom, auraPulse, {
    count: 6,
    color1: "rgba(124, 58, 237, 0.5)",
    color2: "rgba(91, 33, 182, 0.3)",
    color3: "rgba(59, 7, 100, 0)",
    baseWidth: 2.4,
    lengthMin: 0.15,
    lengthMax: 0.28,
    spread: 0.055,
    speed: 2.0,
    curlAmount: 0.055,
  });

  // dissolving particles from spectral hem
  drawDissolveParticles(ctx, x, y + size * 0.48, size, time, zoom, 7, 0.2, 0.3, "rgba(167, 139, 250, 0.45)", auraPulse);

  // arms with hex gauntlets
  drawAnimatedArm(ctx, x - size * 0.16, y - size * 0.18 + sway, size, time, zoom, -1, {
    color: "#8b5cf6",
    colorDark: "#5b21b6",
    handColor: "#c4b5fd",
    swingSpeed: 3.2,
    swingAmt: 0.22,
    baseAngle: 0.46,
    upperLen: 0.18,
    foreLen: 0.16,
    width: 0.045,
    phaseOffset: 0.25,
    elbowBend: 0.45,
  });
  drawAnimatedArm(ctx, x + size * 0.16, y - size * 0.18 + sway, size, time, zoom, 1, {
    color: "#8b5cf6",
    colorDark: "#5b21b6",
    handColor: "#c4b5fd",
    swingSpeed: 3.2,
    swingAmt: 0.18,
    baseAngle: 0.34,
    upperLen: 0.18,
    foreLen: 0.18,
    width: 0.045,
    phaseOffset: 1.0,
    elbowBend: 0.52,
    attackExtra: pull * 0.35,
  });

  // armored torso with hex-plate segments
  const torsoGrad = ctx.createLinearGradient(x - size * 0.26, y - size * 0.28, x + size * 0.26, y + size * 0.24);
  torsoGrad.addColorStop(0, "#2e1065");
  torsoGrad.addColorStop(0.2, "#3e1a80");
  torsoGrad.addColorStop(0.5, color);
  torsoGrad.addColorStop(0.8, "#3e1a80");
  torsoGrad.addColorStop(1, "#2e1065");
  ctx.fillStyle = torsoGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.19, y - size * 0.22 + sway);
  ctx.lineTo(x + size * 0.19, y - size * 0.22 + sway);
  ctx.lineTo(x + size * 0.25, y + size * 0.1 + breathe * 0.5);
  ctx.lineTo(x + size * 0.16, y + size * 0.3);
  ctx.lineTo(x - size * 0.16, y + size * 0.3);
  ctx.lineTo(x - size * 0.25, y + size * 0.1 + breathe * 0.5);
  ctx.closePath();
  ctx.fill();

  // hex scale armor overlay on torso
  drawHexScaleArmor(ctx, x, y + size * 0.02 + sway * 0.5, size * 0.32, size * 0.3, size * 0.04, `rgba(91, 33, 182, 0.6)`, `rgba(167, 139, 250, 0.35)`, zoom, shimmer);

  // hex energy veins on torso
  drawHexEnergyVeins(ctx, x, y + size * 0.02, size * 0.24, size * 0.32, time, zoom, `rgba(192, 132, 252, ${0.25 + auraPulse * 0.15})`, auraPulse, 3);

  // hex plate segments on torso (central emblems)
  drawHexPlate(ctx, x, y - size * 0.08 + sway, size * 0.11, `rgba(91, 33, 182, ${0.45 + shimmer * 0.2})`, `rgba(192, 132, 252, ${0.4 + shimmer * 0.2})`, 1 * zoom);
  drawHexPlate(ctx, x, y + size * 0.08, size * 0.09, `rgba(91, 33, 182, ${0.38 + shimmer * 0.15})`, `rgba(167, 139, 250, ${0.35 + shimmer * 0.15})`, 0.8 * zoom);

  // hex rivet line
  ctx.fillStyle = `rgba(192, 132, 252, ${0.5 + shimmer * 0.2})`;
  for (let rv = 0; rv < 3; rv++) {
    const rvY = y - size * 0.16 + rv * size * 0.1 + sway * (1 - rv * 0.3);
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.arc(x + side * size * 0.16, rvY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // center hex emblem on chest
  drawGlowingHexGem(ctx, x, y - size * 0.08 + sway, size * 0.03, "#c084fc", "#7c3aed", auraPulse, zoom);

  // belt with hex buckle
  ctx.fillStyle = "#1a0e2e";
  ctx.fillRect(x - size * 0.17, y + size * 0.2 + breathe * 0.5, size * 0.34, size * 0.05);
  drawHexPlate(ctx, x, y + size * 0.225 + breathe * 0.5, size * 0.025, `rgba(192, 132, 252, ${0.6 + shimmer * 0.2})`, `rgba(233, 213, 255, ${0.4 + shimmer * 0.2})`, 0.8 * zoom);

  // hex chainmail peek below belt
  ctx.save();
  ctx.globalAlpha = 0.28;
  drawHexChainMail(ctx, x, y + size * 0.28, size * 0.26, size * 0.06, size * 0.02, "rgba(192, 132, 252, 0.5)", zoom);
  ctx.globalAlpha = 1;
  ctx.restore();

  // hex pauldrons
  for (let side = -1; side <= 1; side += 2) {
    drawHexArmorPlate(
      ctx,
      x + side * size * 0.22,
      y - size * 0.14 + sway,
      size * 0.07,
      "#4c2882",
      "#8b5cf6",
      "#2e1065",
      `rgba(192, 132, 252, ${0.55 + shimmer * 0.2})`,
      zoom,
    );

    // pauldron hex rivets
    const pVerts = hexVertices(x + side * size * 0.22, y - size * 0.14 + sway, size * 0.055);
    ctx.fillStyle = `rgba(233, 213, 255, ${0.35 + shimmer * 0.2})`;
    for (const [vx, vy] of pVerts) {
      ctx.beginPath();
      ctx.arc(vx, vy, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // head
  ctx.fillStyle = "#f5e9ff";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.33 + sway * 0.8, size * 0.095, 0, Math.PI * 2);
  ctx.fill();

  // hex-shaped helm
  const helmGrad = ctx.createLinearGradient(x - size * 0.12, y - size * 0.45, x + size * 0.12, y - size * 0.2);
  helmGrad.addColorStop(0, "#3e2d6e");
  helmGrad.addColorStop(0.3, "#5b3d9e");
  helmGrad.addColorStop(0.5, "#7c5abf");
  helmGrad.addColorStop(0.7, "#5b3d9e");
  helmGrad.addColorStop(1, "#3e2d6e");
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11, y - size * 0.34 + sway * 0.8);
  ctx.quadraticCurveTo(x, y - size * 0.48 + sway * 0.6, x + size * 0.11, y - size * 0.34 + sway * 0.8);
  ctx.lineTo(x + size * 0.08, y - size * 0.18 + sway * 0.8);
  ctx.lineTo(x - size * 0.08, y - size * 0.18 + sway * 0.8);
  ctx.closePath();
  ctx.fill();

  // hex visor opening
  ctx.fillStyle = "#0e0a18";
  ctx.beginPath();
  ctx.roundRect(x - size * 0.085, y - size * 0.355 + sway * 0.8, size * 0.17, size * 0.03, size * 0.008);
  ctx.fill();

  // eye glow through visor
  ctx.fillStyle = `rgba(192, 132, 252, ${0.5 + shimmer * 0.35})`;
  ctx.beginPath();
  ctx.arc(x - size * 0.03, y - size * 0.34 + sway * 0.8, size * 0.01, 0, Math.PI * 2);
  ctx.arc(x + size * 0.03, y - size * 0.34 + sway * 0.8, size * 0.01, 0, Math.PI * 2);
  ctx.fill();

  // helm hex crest gem
  drawGlowingHexGem(ctx, x, y - size * 0.43 + sway * 0.65, size * 0.022, "#a78bfa", "#7c3aed", shimmer, zoom);

  // helm trim
  ctx.strokeStyle = `rgba(192, 132, 252, ${0.5 + shimmer * 0.2})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.32 + sway * 0.8);
  ctx.quadraticCurveTo(x, y - size * 0.42 + sway * 0.6, x + size * 0.1, y - size * 0.32 + sway * 0.8);
  ctx.stroke();

  // hex-oar weapon
  ctx.save();
  ctx.translate(x + size * 0.33, y - size * 0.01 + breathe * 0.45);
  ctx.rotate(-1.04 + pull * 0.55);

  // shaft
  const shaftGrad = ctx.createLinearGradient(0, -size * 0.58, 0, size * 0.1);
  shaftGrad.addColorStop(0, "#4c1d95");
  shaftGrad.addColorStop(0.5, "#7c3aed");
  shaftGrad.addColorStop(1, "#2e1065");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.016, -size * 0.58, size * 0.032, size * 0.72);

  // hex wrap bands on shaft
  ctx.strokeStyle = `rgba(192, 132, 252, ${0.4 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  for (let band = 0; band < 4; band++) {
    const bY = -size * 0.2 + band * size * 0.12;
    traceHexPath(ctx, 0, bY, size * 0.02);
    ctx.stroke();
  }

  // hex blade at top
  const bladeGrad = ctx.createLinearGradient(-size * 0.08, -size * 0.72, size * 0.08, -size * 0.56);
  bladeGrad.addColorStop(0, "#5b3d9e");
  bladeGrad.addColorStop(0.5, "#a78bfa");
  bladeGrad.addColorStop(1, "#5b3d9e");
  drawHexPlate(ctx, 0, -size * 0.66, size * 0.065, bladeGrad, `rgba(192, 132, 252, ${0.5 + shimmer * 0.2})`, 1 * zoom);

  // blade hex gem
  drawGlowingHexGem(ctx, 0, -size * 0.66, size * 0.022, "#e9d5ff", "#a855f7", auraPulse, zoom);

  ctx.restore();

  // hex shield on left side
  ctx.save();
  ctx.translate(x - size * 0.3, y + size * 0.04 + breathe * 0.5);
  ctx.rotate(-0.26);

  const shieldGrad = ctx.createRadialGradient(0, -size * 0.02, size * 0.02, 0, 0, size * 0.16);
  shieldGrad.addColorStop(0, "#7c3aed");
  shieldGrad.addColorStop(0.6, "#4c1d95");
  shieldGrad.addColorStop(1, "#2a0e52");

  // hex shield body
  drawHexPlate(ctx, 0, 0, size * 0.14, shieldGrad, `rgba(192, 132, 252, ${0.6 + shimmer * 0.2})`, 1.8 * zoom);

  // inner hex ring
  ctx.strokeStyle = `rgba(233, 213, 255, ${0.4 + shimmer * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  traceHexPath(ctx, 0, 0, size * 0.1);
  ctx.stroke();

  // shield hex emblem
  drawGlowingHexGem(ctx, 0, 0, size * 0.03, "#c084fc", "#7c3aed", auraPulse, zoom);

  // shield rivets at vertices
  const shieldVerts = hexVertices(0, 0, size * 0.12);
  ctx.fillStyle = `rgba(233, 213, 255, ${0.45 + shimmer * 0.2})`;
  for (const [vx, vy] of shieldVerts) {
    ctx.beginPath();
    ctx.arc(vx, vy, size * 0.008, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // floating hex motes
  for (let i = 0; i < 4; i++) {
    const moteAngle = time * 2.4 + i * 1.57;
    const mx = x + Math.cos(moteAngle) * size * 0.28;
    const my = y - size * 0.26 + Math.sin(moteAngle * 1.2) * size * 0.08;
    ctx.fillStyle = `rgba(233, 213, 255, ${0.45 + Math.sin(time * 4 + i) * 0.18})`;
    traceHexPath(ctx, mx, my, size * 0.012);
    ctx.fill();
  }

  ctx.restore();
}
