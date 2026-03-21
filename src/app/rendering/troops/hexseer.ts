import { setShadowBlur, clearShadow } from "../performance";
import { drawRobeBody } from "../enemies/helpers";
import { drawAnimatedArm } from "../enemies/animationHelpers";
import type { Position } from "../../types";
import {
  drawHexPlate,
  drawHexArmorPlate,
  drawGlowingHexGem,
  drawHexChainMail,
  drawOrbitingHexRunes,
  drawGhostlyWisps,
  drawDissolveParticles,
  drawHexEnergyVeins,
  drawHexScaleArmor,
  traceHexPath,
  hexVertices,
} from "./hexHelpers";

export function drawHexseerTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  _targetPos?: Position,
) {
  const isAttacking = attackPhase > 0;
  const pulse = 0.76 + Math.sin(time * 5.1) * 0.24;
  const shimmer = 0.56 + Math.sin(time * 5.6) * 0.38;
  const hover = Math.sin(time * 2.1) * size * 0.022;
  const charge = isAttacking ? attackPhase : 0.35 + Math.sin(time * 1.7) * 0.15;

  // grand hex ward circle beneath
  ctx.save();
  ctx.globalAlpha = 0.2 * pulse;
  traceHexPath(ctx, x, y + size * 0.45, size * 0.5);
  const poolGrad = ctx.createRadialGradient(x, y + size * 0.45, 0, x, y + size * 0.45, size * 0.5);
  poolGrad.addColorStop(0, "rgba(244, 114, 182, 0.4)");
  poolGrad.addColorStop(0.4, "rgba(190, 24, 93, 0.25)");
  poolGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = poolGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.3 * pulse})`;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // inner hex ring in ward
  traceHexPath(ctx, x, y + size * 0.45, size * 0.35);
  ctx.strokeStyle = `rgba(190, 24, 93, ${0.2 * pulse})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // grand aura
  const pool = ctx.createRadialGradient(x, y + size * 0.45, 0, x, y + size * 0.45, size * 0.62);
  pool.addColorStop(0, `rgba(244, 114, 182, ${0.22 * pulse})`);
  pool.addColorStop(0.45, `rgba(190, 24, 93, ${0.13 * pulse})`);
  pool.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.45, size * 0.52, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // orbiting hex rune sigils (6 for Hexseer - more than others)
  drawOrbitingHexRunes(
    ctx, x, y - size * 0.12, 6, size * 0.44, 0.42,
    size * 0.042, `rgba(244, 114, 182, ${0.65 + pulse * 0.25})`,
    time, 1.15, pulse, zoom,
  );

  // arms with hex armored gauntlets
  drawAnimatedArm(ctx, x - size * 0.18, y - size * 0.21 + hover, size, time, zoom, -1, {
    color: "#be185d",
    colorDark: "#9d174d",
    handColor: "#f9a8d4",
    swingSpeed: 3.6,
    swingAmt: 0.36,
    baseAngle: 0.5,
    upperLen: 0.18,
    foreLen: 0.15,
    width: 0.04,
    phaseOffset: 0.3,
    elbowBend: 0.55,
  });
  drawAnimatedArm(ctx, x + size * 0.18, y - size * 0.21 + hover, size, time, zoom, 1, {
    color: "#be185d",
    colorDark: "#9d174d",
    handColor: "#f9a8d4",
    swingSpeed: 3.8,
    swingAmt: 0.32,
    baseAngle: 0.38,
    upperLen: 0.17,
    foreLen: 0.14,
    width: 0.04,
    phaseOffset: 1.35,
    elbowBend: 0.65,
    attackExtra: charge * 0.5,
  });

  // spectral trail - outer ethereal glow layer
  const outerTrailGrad = ctx.createLinearGradient(x, y + size * 0.05, x, y + size * 0.82);
  outerTrailGrad.addColorStop(0, "rgba(190, 24, 93, 0.15)");
  outerTrailGrad.addColorStop(0.4, "rgba(126, 34, 206, 0.08)");
  outerTrailGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = outerTrailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.08 + hover);
  ctx.quadraticCurveTo(x - size * 0.38, y + size * 0.45, x - size * 0.12, y + size * 0.82);
  ctx.quadraticCurveTo(x, y + size * 0.7, x + size * 0.12, y + size * 0.82);
  ctx.quadraticCurveTo(x + size * 0.38, y + size * 0.45, x + size * 0.2, y + size * 0.08 + hover);
  ctx.closePath();
  ctx.fill();

  // spectral trail - core layer
  const trailGrad = ctx.createLinearGradient(x, y - size * 0.02, x, y + size * 0.75);
  trailGrad.addColorStop(0, "rgba(190, 24, 93, 0.65)");
  trailGrad.addColorStop(0.3, "rgba(162, 28, 140, 0.5)");
  trailGrad.addColorStop(0.6, "rgba(126, 34, 206, 0.28)");
  trailGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = trailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.14, y + size * 0.1 + hover);
  ctx.quadraticCurveTo(x - size * 0.28, y + size * 0.42, x - size * 0.1, y + size * 0.72);
  ctx.quadraticCurveTo(x - size * 0.03, y + size * 0.62, x, y + size * 0.75);
  ctx.quadraticCurveTo(x + size * 0.03, y + size * 0.62, x + size * 0.1, y + size * 0.72);
  ctx.quadraticCurveTo(x + size * 0.28, y + size * 0.42, x + size * 0.14, y + size * 0.1 + hover);
  ctx.closePath();
  ctx.fill();

  // inner bright trail core
  const innerTrailGrad = ctx.createLinearGradient(x, y + size * 0.1, x, y + size * 0.55);
  innerTrailGrad.addColorStop(0, "rgba(244, 114, 182, 0.3)");
  innerTrailGrad.addColorStop(0.5, "rgba(190, 24, 93, 0.15)");
  innerTrailGrad.addColorStop(1, "rgba(126, 34, 206, 0)");
  ctx.fillStyle = innerTrailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y + size * 0.12 + hover);
  ctx.quadraticCurveTo(x - size * 0.14, y + size * 0.35, x - size * 0.04, y + size * 0.55);
  ctx.quadraticCurveTo(x, y + size * 0.5, x + size * 0.04, y + size * 0.55);
  ctx.quadraticCurveTo(x + size * 0.14, y + size * 0.35, x + size * 0.08, y + size * 0.12 + hover);
  ctx.closePath();
  ctx.fill();

  // grand ghostly wisps from spectral trail (most elaborate)
  drawGhostlyWisps(ctx, x, y + size * 0.45, size, time, zoom, pulse, {
    count: 9,
    color1: "rgba(244, 114, 182, 0.55)",
    color2: "rgba(190, 24, 93, 0.3)",
    color3: "rgba(88, 28, 135, 0)",
    baseWidth: 2.5,
    lengthMin: 0.18,
    lengthMax: 0.38,
    spread: 0.042,
    speed: 2.2,
    curlAmount: 0.065,
  });

  // secondary wisps - fast ethereal tendrils
  drawGhostlyWisps(ctx, x, y + size * 0.38, size, time * 1.4, zoom, pulse, {
    count: 6,
    color1: "rgba(251, 207, 232, 0.35)",
    color2: "rgba(244, 114, 182, 0.18)",
    color3: "rgba(190, 24, 93, 0)",
    baseWidth: 1.0,
    lengthMin: 0.22,
    lengthMax: 0.42,
    spread: 0.058,
    speed: 3.8,
    curlAmount: 0.1,
  });

  // tertiary wisps - slow, wide, ghostly backdrop
  drawGhostlyWisps(ctx, x, y + size * 0.5, size, time * 0.6, zoom, pulse, {
    count: 4,
    color1: "rgba(126, 34, 206, 0.25)",
    color2: "rgba(88, 28, 135, 0.12)",
    color3: "rgba(59, 7, 100, 0)",
    baseWidth: 3.0,
    lengthMin: 0.25,
    lengthMax: 0.4,
    spread: 0.08,
    speed: 1.2,
    curlAmount: 0.04,
  });

  // hex dissolve particles (most)
  drawDissolveParticles(ctx, x, y + size * 0.5, size, time, zoom, 14, 0.28, 0.45, "rgba(244, 114, 182, 0.5)", pulse);

  // hex energy veins on spectral trail
  drawHexEnergyVeins(ctx, x, y + size * 0.3 + hover, size * 0.2, size * 0.28, time, zoom, `rgba(244, 114, 182, ${0.2 + pulse * 0.12})`, pulse, 4);

  // hex chainmail on torso
  ctx.save();
  ctx.globalAlpha = 0.28;
  drawHexChainMail(ctx, x, y + size * 0.02 + hover, size * 0.28, size * 0.14, size * 0.022, "rgba(244, 114, 182, 0.5)", zoom);
  ctx.globalAlpha = 1;
  ctx.restore();

  // ornate robe body with rich gradient
  const robeGrad = ctx.createLinearGradient(x - size * 0.42, y, x + size * 0.42, y);
  robeGrad.addColorStop(0, "#7e22ce");
  robeGrad.addColorStop(0.25, "#9d174d");
  robeGrad.addColorStop(0.5, "#f472b6");
  robeGrad.addColorStop(0.75, "#9d174d");
  robeGrad.addColorStop(1, "#7e22ce");
  ctx.fillStyle = robeGrad;
  drawRobeBody(
    ctx, x, size * 0.18, y - size * 0.34 + hover, size * 0.4,
    y + size * 0.52, size * 0.42, y + size * 0.1,
    { count: 9, amplitude: size * 0.035, time, speed: 3.8, altAmplitude: size * 0.07 },
  );

  // hex scale armor overlay on robe
  drawHexScaleArmor(ctx, x, y - size * 0.02 + hover, size * 0.3, size * 0.28, size * 0.035, "rgba(190, 24, 93, 0.45)", `rgba(244, 114, 182, 0.25)`, zoom, shimmer);

  // hex energy veins on robe body
  drawHexEnergyVeins(ctx, x, y + size * 0.04 + hover, size * 0.24, size * 0.3, time, zoom, `rgba(244, 114, 182, ${0.25 + pulse * 0.18})`, pulse, 5);

  // robe panel accents - glowing seams
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = `rgba(244, 114, 182, ${0.2 + pulse * 0.12})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.13, y - size * 0.2 + hover);
    ctx.quadraticCurveTo(x + side * size * 0.18, y + size * 0.08, x + side * size * 0.16, y + size * 0.38);
    ctx.stroke();
  }

  // center robe accent line
  ctx.strokeStyle = `rgba(251, 207, 232, ${0.15 + pulse * 0.1})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.18 + hover);
  ctx.lineTo(x, y + size * 0.35);
  ctx.stroke();

  // hex armor breastplate (larger, more ornate for seer)
  const breastGrad = ctx.createRadialGradient(x, y - size * 0.12 + hover, 0, x, y - size * 0.12 + hover, size * 0.15);
  breastGrad.addColorStop(0, "#f472b6");
  breastGrad.addColorStop(0.4, "#be185d");
  breastGrad.addColorStop(1, "#9d174d");
  drawHexPlate(ctx, x, y - size * 0.12 + hover, size * 0.14, breastGrad, `rgba(244, 114, 182, ${0.55 + shimmer * 0.2})`, 1.4 * zoom);

  // inner hex detail
  ctx.strokeStyle = `rgba(251, 207, 232, ${0.35 + shimmer * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  traceHexPath(ctx, x, y - size * 0.12 + hover, size * 0.09);
  ctx.stroke();

  // breastplate center gem
  drawGlowingHexGem(ctx, x, y - size * 0.12 + hover, size * 0.032, "#fda4af", "#f472b6", pulse, zoom);

  // grand hex pauldrons
  for (let side = -1; side <= 1; side += 2) {
    drawHexArmorPlate(
      ctx,
      x + side * size * 0.22,
      y - size * 0.2 + hover,
      size * 0.075,
      "#9d174d",
      "#f472b6",
      "#7e22ce",
      `rgba(244, 114, 182, ${0.55 + shimmer * 0.2})`,
      zoom,
    );

    // pauldron spikes
    const pX = x + side * size * 0.22;
    const pY = y - size * 0.2 + hover;
    ctx.fillStyle = `rgba(190, 24, 93, ${0.5 + shimmer * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(pX + side * size * 0.06, pY - size * 0.03);
    ctx.lineTo(pX + side * size * 0.12, pY - size * 0.06);
    ctx.lineTo(pX + side * size * 0.06, pY + size * 0.01);
    ctx.closePath();
    ctx.fill();

    // pauldron hex rivet ring
    const pVerts = hexVertices(pX, pY, size * 0.058);
    ctx.fillStyle = `rgba(251, 207, 232, ${0.35 + shimmer * 0.15})`;
    for (const [vx, vy] of pVerts) {
      ctx.beginPath();
      ctx.arc(vx, vy, size * 0.006, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // hex arc decorations
  ctx.strokeStyle = `rgba(255, 241, 242, ${0.36 + pulse * 0.22})`;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31 + hover, size * 0.18, Math.PI * 0.18, Math.PI * 0.82);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - size * 0.31 + hover, size * 0.27, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();

  // head
  ctx.fillStyle = "#fff1f2";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + hover, size * 0.105, 0, Math.PI * 2);
  ctx.fill();

  // hex tiara/crown
  const tiaraVerts = hexVertices(x, y - size * 0.44 + hover, size * 0.06);
  const crownGrad = ctx.createLinearGradient(x - size * 0.06, y - size * 0.5, x + size * 0.06, y - size * 0.38);
  crownGrad.addColorStop(0, "#be185d");
  crownGrad.addColorStop(0.5, "#f472b6");
  crownGrad.addColorStop(1, "#be185d");

  // crown spikes from hex vertices
  for (let i = 0; i < 3; i++) {
    const [vx, vy] = tiaraVerts[i];
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(vx - size * 0.015, y - size * 0.4 + hover);
    ctx.lineTo(vx, vy - size * 0.02);
    ctx.lineTo(vx + size * 0.015, y - size * 0.4 + hover);
    ctx.closePath();
    ctx.fill();
  }

  // hex crown base band
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.6 + shimmer * 0.2})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.4 + hover);
  ctx.lineTo(x + size * 0.08, y - size * 0.4 + hover);
  ctx.stroke();

  // crown center gem
  drawGlowingHexGem(ctx, x, y - size * 0.42 + hover, size * 0.02, "#fda4af", "#f472b6", pulse, zoom);

  // eyes
  ctx.fillStyle = "#2a123f";
  ctx.beginPath();
  ctx.arc(x - size * 0.028, y - size * 0.35 + hover, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.028, y - size * 0.35 + hover, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // hex third eye mark
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.45 + charge * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  traceHexPath(ctx, x, y - size * 0.37 + hover, size * 0.014);
  ctx.stroke();

  // mouth mark
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.55 + charge * 0.18})`;
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.045, y - size * 0.3 + hover);
  ctx.lineTo(x, y - size * 0.27 + hover);
  ctx.lineTo(x + size * 0.045, y - size * 0.3 + hover);
  ctx.stroke();

  // grand hex staff
  ctx.save();
  ctx.translate(x + size * 0.26, y - size * 0.1 + hover);
  ctx.rotate(-0.08 + Math.sin(time * 1.8) * 0.05);

  // staff shaft
  ctx.strokeStyle = "#4a1d35";
  ctx.lineWidth = 2.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.44);
  ctx.lineTo(0, size * 0.34);
  ctx.stroke();

  // hex wrap bands on staff
  ctx.strokeStyle = `rgba(244, 114, 182, ${0.4 + shimmer * 0.15})`;
  ctx.lineWidth = 1 * zoom;
  for (let band = 0; band < 5; band++) {
    const bY = -size * 0.1 + band * size * 0.1;
    traceHexPath(ctx, 0, bY, size * 0.018);
    ctx.stroke();
  }

  // grand hex gem at staff top
  const gemR = size * 0.065;
  const staffGemGrad = ctx.createRadialGradient(0, -size * 0.5, 0, 0, -size * 0.5, gemR);
  staffGemGrad.addColorStop(0, `rgba(255, 241, 242, ${0.95 * pulse})`);
  staffGemGrad.addColorStop(0.35, `rgba(244, 114, 182, ${0.85 * pulse})`);
  staffGemGrad.addColorStop(0.7, `rgba(190, 24, 93, ${0.5 * pulse})`);
  staffGemGrad.addColorStop(1, `rgba(126, 34, 206, ${0.2 * pulse})`);

  setShadowBlur(ctx, 12 * zoom * pulse, "#f472b6");
  drawHexPlate(ctx, 0, -size * 0.5, gemR, staffGemGrad, `rgba(244, 114, 182, ${0.6 + pulse * 0.3})`, 1.2 * zoom);
  clearShadow(ctx);

  // inner hex detail on gem
  ctx.strokeStyle = `rgba(255, 241, 242, ${0.3 + pulse * 0.3})`;
  ctx.lineWidth = 0.6 * zoom;
  traceHexPath(ctx, 0, -size * 0.5, gemR * 0.55);
  ctx.stroke();

  // gem core sparkle
  ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + pulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.5, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // staff hex cradle arms (prongs holding the gem)
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = `rgba(74, 29, 53, ${0.7 + shimmer * 0.15})`;
    ctx.lineWidth = 1.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.44);
    ctx.quadraticCurveTo(side * size * 0.04, -size * 0.48, side * size * 0.025, -size * 0.55);
    ctx.stroke();
  }

  ctx.restore();

  // spectral flowing ribbons with wispy fade
  for (let i = 0; i < 5; i++) {
    const ribbonSwing = Math.sin(time * 2.1 + i * 1.25) * size * 0.045;
    const ribbonSwing2 = Math.cos(time * 1.6 + i * 0.9) * size * 0.03;
    const ribbonX = x + (i - 2) * size * 0.07;
    const ribbonLen = size * (0.5 + (i % 3) * 0.08);

    const ribbonGrad = ctx.createLinearGradient(ribbonX, y + size * 0.18, ribbonX, y + size * 0.18 + ribbonLen);
    ribbonGrad.addColorStop(0, `rgba(244, 114, 182, ${0.35 + charge * 0.15})`);
    ribbonGrad.addColorStop(0.5, `rgba(190, 24, 93, ${0.2 + charge * 0.08})`);
    ribbonGrad.addColorStop(1, "rgba(126, 34, 206, 0)");

    ctx.strokeStyle = ribbonGrad;
    ctx.lineWidth = (2.2 - (i % 3) * 0.4) * zoom;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(ribbonX, y + size * 0.18 + hover);
    ctx.quadraticCurveTo(
      ribbonX + ribbonSwing, y + size * 0.32,
      ribbonX + ribbonSwing2, y + size * 0.46,
    );
    ctx.quadraticCurveTo(
      ribbonX + ribbonSwing * 1.2, y + size * 0.55,
      ribbonX - ribbonSwing * 0.6 + ribbonSwing2, y + size * 0.18 + ribbonLen,
    );
    ctx.stroke();

    // hex marks along ribbons
    for (let h = 0; h < 2; h++) {
      const markT = 0.3 + h * 0.3;
      const hexMarkX = ribbonX + ribbonSwing * markT;
      const hexMarkY = y + size * (0.24 + markT * 0.28) + hover;
      ctx.strokeStyle = `rgba(251, 207, 232, ${(0.15 + charge * 0.08) * (1 - markT * 0.5)})`;
      ctx.lineWidth = 0.5 * zoom;
      traceHexPath(ctx, hexMarkX, hexMarkY, size * 0.008);
      ctx.stroke();
    }
  }

  // attack hex burst
  if (isAttacking) {
    const burstR = size * (0.45 + charge * 0.25);
    setShadowBlur(ctx, 15 * zoom, "#f472b6");

    // outer hex burst
    traceHexPath(ctx, x, y - size * 0.12, burstR);
    ctx.strokeStyle = `rgba(244, 114, 182, ${0.35 * charge})`;
    ctx.lineWidth = 2.2 * zoom;
    ctx.stroke();

    // middle hex burst
    traceHexPath(ctx, x, y - size * 0.12, burstR * 0.7);
    ctx.strokeStyle = `rgba(251, 207, 232, ${0.25 * charge})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();

    // inner glow fill
    const burstGrad = ctx.createRadialGradient(x, y - size * 0.12, 0, x, y - size * 0.12, burstR);
    burstGrad.addColorStop(0, `rgba(255, 241, 242, ${0.18 * charge})`);
    burstGrad.addColorStop(0.45, `rgba(244, 114, 182, ${0.12 * charge})`);
    burstGrad.addColorStop(1, "rgba(190, 24, 93, 0)");
    traceHexPath(ctx, x, y - size * 0.12, burstR);
    ctx.fillStyle = burstGrad;
    ctx.fill();

    clearShadow(ctx);
  }
}
