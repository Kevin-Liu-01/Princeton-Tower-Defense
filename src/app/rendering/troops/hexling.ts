import type { Position } from "../../types";
import { drawAnimatedArm } from "../enemies/animationHelpers";
import { drawRobeBody } from "../enemies/helpers";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawHexPlate,
  drawHexArmorPlate,
  drawGlowingHexGem,
  drawHexChainMail,
  drawOrbitingHexRunes,
  drawGhostlyWisps,
  drawDissolveParticles,
  drawHexEnergyVeins,
  traceHexPath,
} from "./hexHelpers";

export function drawHexlingTroop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  _color: string,
  time: number,
  zoom: number,
  attackPhase: number = 0,
  _targetPos?: Position
) {
  const isAttacking = attackPhase > 0;
  const pulse = 0.72 + Math.sin(time * 4.6) * 0.28;
  const shimmer = 0.56 + Math.sin(time * 5.4) * 0.38;
  const hover = Math.sin(time * 2.4) * size * 0.018;
  const attackGlow = isAttacking ? attackPhase : 0;

  // hex ward pool beneath
  ctx.save();
  ctx.globalAlpha = 0.16 * pulse;
  traceHexPath(ctx, x, y + size * 0.4, size * 0.32);
  const poolGrad = ctx.createRadialGradient(
    x,
    y + size * 0.4,
    0,
    x,
    y + size * 0.4,
    size * 0.32
  );
  poolGrad.addColorStop(0, "rgba(192, 38, 211, 0.5)");
  poolGrad.addColorStop(0.6, "rgba(147, 51, 234, 0.3)");
  poolGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = poolGrad;
  ctx.fill();
  ctx.strokeStyle = `rgba(217, 70, 239, ${0.25 * pulse})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();

  // aura
  const aura = ctx.createRadialGradient(
    x,
    y - size * 0.08,
    0,
    x,
    y - size * 0.08,
    size * 0.55
  );
  aura.addColorStop(0, `rgba(217, 70, 239, ${0.22 * pulse})`);
  aura.addColorStop(0.6, `rgba(147, 51, 234, ${0.12 * pulse})`);
  aura.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.06, size * 0.42, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // orbiting hex orbs (3)
  for (let i = 0; i < 3; i++) {
    const orbAngle = time * 1.5 + i * Math.PI * 0.67;
    const orbX = x + Math.cos(orbAngle) * size * 0.34;
    const orbY = y - size * 0.2 + Math.sin(orbAngle) * size * 0.18 + hover;

    // hex-shaped orb
    setShadowBlur(ctx, 6 * zoom, "#c026d3");
    const orbGrad = ctx.createRadialGradient(
      orbX,
      orbY,
      0,
      orbX,
      orbY,
      size * 0.06
    );
    orbGrad.addColorStop(0, `rgba(244, 114, 182, ${0.9 * pulse})`);
    orbGrad.addColorStop(0.5, `rgba(192, 38, 211, ${0.45 * pulse})`);
    orbGrad.addColorStop(1, "rgba(147, 51, 234, 0)");
    drawHexPlate(ctx, orbX, orbY, size * 0.045, orbGrad);
    clearShadow(ctx);

    // inner hex detail
    ctx.strokeStyle = `rgba(251, 207, 232, ${0.35 * pulse})`;
    ctx.lineWidth = 0.6 * zoom;
    traceHexPath(ctx, orbX, orbY, size * 0.025);
    ctx.stroke();
  }

  // arms with hex vambraces
  drawAnimatedArm(
    ctx,
    x - size * 0.16,
    y - size * 0.19 + hover,
    size,
    time,
    zoom,
    -1,
    {
      baseAngle: 0.52,
      color: "#86198f",
      colorDark: "#701a75",
      elbowBend: 0.48,
      foreLen: 0.15,
      handColor: "#e879f9",
      phaseOffset: 0.2,
      swingAmt: 0.32,
      swingSpeed: 3.8,
      upperLen: 0.18,
      width: 0.04,
    }
  );
  drawAnimatedArm(
    ctx,
    x + size * 0.16,
    y - size * 0.19 + hover,
    size,
    time,
    zoom,
    1,
    {
      attackExtra: attackGlow * 0.4,
      baseAngle: 0.42,
      color: "#86198f",
      colorDark: "#701a75",
      elbowBend: 0.55,
      foreLen: 0.14,
      handColor: "#e879f9",
      phaseOffset: 1.1,
      swingAmt: 0.28,
      swingSpeed: 3.8,
      upperLen: 0.17,
      width: 0.04,
    }
  );

  // spectral hex tail (ghostly lower body - multi-layer)
  // outer glow layer
  const outerTailGrad = ctx.createLinearGradient(
    x,
    y + size * 0.05,
    x,
    y + size * 0.68
  );
  outerTailGrad.addColorStop(0, "rgba(192, 38, 211, 0.2)");
  outerTailGrad.addColorStop(0.5, "rgba(126, 34, 206, 0.1)");
  outerTailGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = outerTailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y + size * 0.08 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.32,
    y + size * 0.38,
    x - size * 0.1,
    y + size * 0.68
  );
  ctx.quadraticCurveTo(x, y + size * 0.6, x + size * 0.1, y + size * 0.68);
  ctx.quadraticCurveTo(
    x + size * 0.32,
    y + size * 0.38,
    x + size * 0.18,
    y + size * 0.08 + hover
  );
  ctx.closePath();
  ctx.fill();

  // core tail layer
  const tailGrad = ctx.createLinearGradient(
    x,
    y - size * 0.02,
    x,
    y + size * 0.6
  );
  tailGrad.addColorStop(0, "rgba(192, 38, 211, 0.75)");
  tailGrad.addColorStop(0.3, "rgba(162, 28, 175, 0.55)");
  tailGrad.addColorStop(0.6, "rgba(126, 34, 206, 0.3)");
  tailGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.13, y + size * 0.1 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.24,
    y + size * 0.36,
    x - size * 0.08,
    y + size * 0.58
  );
  ctx.quadraticCurveTo(x - size * 0.02, y + size * 0.52, x, y + size * 0.6);
  ctx.quadraticCurveTo(
    x + size * 0.02,
    y + size * 0.52,
    x + size * 0.08,
    y + size * 0.58
  );
  ctx.quadraticCurveTo(
    x + size * 0.24,
    y + size * 0.36,
    x + size * 0.13,
    y + size * 0.1 + hover
  );
  ctx.closePath();
  ctx.fill();

  // branching ghostly wisps from tail
  drawGhostlyWisps(ctx, x, y + size * 0.4, size, time, zoom, pulse, {
    baseWidth: 1.8,
    color1: "rgba(217, 70, 239, 0.5)",
    color2: "rgba(147, 51, 234, 0.28)",
    color3: "rgba(88, 28, 135, 0)",
    count: 8,
    curlAmount: 0.07,
    lengthMax: 0.3,
    lengthMin: 0.14,
    speed: 2.8,
    spread: 0.04,
  });

  // secondary wisps - thinner, faster, more ethereal
  drawGhostlyWisps(ctx, x, y + size * 0.35, size, time * 1.3, zoom, pulse, {
    baseWidth: 1,
    color1: "rgba(244, 114, 182, 0.35)",
    color2: "rgba(192, 38, 211, 0.18)",
    color3: "rgba(126, 34, 206, 0)",
    count: 5,
    curlAmount: 0.09,
    lengthMax: 0.38,
    lengthMin: 0.2,
    speed: 3.5,
    spread: 0.06,
  });

  // dissolving hex particles rising from tail
  drawDissolveParticles(
    ctx,
    x,
    y + size * 0.45,
    size,
    time,
    zoom,
    10,
    0.25,
    0.4,
    "rgba(217, 70, 239, 0.5)",
    pulse
  );

  // hex energy veins on tail
  drawHexEnergyVeins(
    ctx,
    x,
    y + size * 0.25 + hover,
    size * 0.18,
    size * 0.22,
    time,
    zoom,
    `rgba(244, 114, 182, ${0.2 + pulse * 0.15})`,
    pulse,
    3
  );

  // hex chainmail on body
  ctx.save();
  ctx.globalAlpha = 0.25;
  drawHexChainMail(
    ctx,
    x,
    y + size * 0.05 + hover,
    size * 0.22,
    size * 0.1,
    size * 0.02,
    "rgba(217, 70, 239, 0.5)",
    zoom
  );
  ctx.globalAlpha = 1;
  ctx.restore();

  // robe body with enhanced gradient
  const robeGrad = ctx.createLinearGradient(
    x,
    y - size * 0.35,
    x,
    y + size * 0.5
  );
  robeGrad.addColorStop(0, "#86198f");
  robeGrad.addColorStop(0.35, "#a21caf");
  robeGrad.addColorStop(0.65, "#86198f");
  robeGrad.addColorStop(1, "#581c87");
  ctx.fillStyle = robeGrad;
  drawRobeBody(
    ctx,
    x,
    size * 0.15,
    y - size * 0.34 + hover,
    size * 0.35,
    y + size * 0.48,
    size * 0.38,
    y
  );

  // hex energy veins on robe body
  drawHexEnergyVeins(
    ctx,
    x,
    y - size * 0.05 + hover,
    size * 0.2,
    size * 0.28,
    time,
    zoom,
    `rgba(244, 114, 182, ${0.22 + pulse * 0.15})`,
    pulse,
    3
  );

  // robe side seam accents
  for (let side = -1; side <= 1; side += 2) {
    ctx.strokeStyle = `rgba(217, 70, 239, ${0.18 + pulse * 0.1})`;
    ctx.lineWidth = 0.7 * zoom;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.1, y - size * 0.2 + hover);
    ctx.quadraticCurveTo(
      x + side * size * 0.14,
      y + size * 0.05,
      x + side * size * 0.12,
      y + size * 0.3
    );
    ctx.stroke();
  }

  // hex armor breastplate
  const breastGrad = ctx.createRadialGradient(
    x,
    y - size * 0.1 + hover,
    0,
    x,
    y - size * 0.1 + hover,
    size * 0.12
  );
  breastGrad.addColorStop(0, "#a855f7");
  breastGrad.addColorStop(0.5, "#7e22ce");
  breastGrad.addColorStop(1, "#581c87");
  drawHexPlate(
    ctx,
    x,
    y - size * 0.1 + hover,
    size * 0.11,
    breastGrad,
    `rgba(217, 70, 239, ${0.5 + shimmer * 0.2})`,
    1.2 * zoom
  );

  // inner hex detail on breastplate
  ctx.strokeStyle = `rgba(251, 207, 232, ${0.3 + shimmer * 0.2})`;
  ctx.lineWidth = 0.7 * zoom;
  traceHexPath(ctx, x, y - size * 0.1 + hover, size * 0.065);
  ctx.stroke();

  // breastplate gem
  drawGlowingHexGem(
    ctx,
    x,
    y - size * 0.1 + hover,
    size * 0.025,
    "#f0abfc",
    "#c026d3",
    pulse,
    zoom
  );

  // hex wing-fins (angular crystal wing motifs)
  for (let side = -1; side <= 1; side += 2) {
    const wingX = x + side * size * 0.17;
    const wingY = y - size * 0.16 + hover;

    ctx.fillStyle = `rgba(217, 70, 239, ${0.28 + pulse * 0.15})`;
    ctx.beginPath();
    ctx.moveTo(wingX, wingY);
    ctx.lineTo(wingX + side * size * 0.12, wingY - size * 0.14);
    ctx.lineTo(wingX + side * size * 0.08, wingY - size * 0.04);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(192, 38, 211, ${0.22 + pulse * 0.12})`;
    ctx.beginPath();
    ctx.moveTo(wingX + side * size * 0.04, wingY + size * 0.02);
    ctx.lineTo(wingX + side * size * 0.15, wingY - size * 0.06);
    ctx.lineTo(wingX + side * size * 0.1, wingY + size * 0.05);
    ctx.closePath();
    ctx.fill();

    // hex shoulder plate
    drawHexArmorPlate(
      ctx,
      x + side * size * 0.16,
      y - size * 0.18 + hover,
      size * 0.05,
      "#7e22ce",
      "#a855f7",
      "#581c87",
      `rgba(217, 70, 239, ${0.5 + shimmer * 0.2})`,
      zoom
    );
  }

  // single large hex eye (cyclops-style hex mage)
  ctx.fillStyle = "#fdf2f8";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.34 + hover, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  // hex eye socket
  const eyeSocketGrad = ctx.createRadialGradient(
    x,
    y - size * 0.35 + hover,
    0,
    x,
    y - size * 0.35 + hover,
    size * 0.06
  );
  eyeSocketGrad.addColorStop(0, "#f0abfc");
  eyeSocketGrad.addColorStop(0.5, "#c026d3");
  eyeSocketGrad.addColorStop(1, "#86198f");
  traceHexPath(ctx, x, y - size * 0.35 + hover, size * 0.055);
  ctx.fillStyle = eyeSocketGrad;
  ctx.fill();

  // pupil
  ctx.fillStyle = "#2a123f";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.35 + hover, size * 0.028, 0, Math.PI * 2);
  ctx.fill();

  // eye shine
  ctx.fillStyle = "#fdf2f8";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.01,
    y - size * 0.36 + hover,
    size * 0.01,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // hex eye glow
  setShadowBlur(ctx, 5 * zoom * pulse, "#d946ef");
  ctx.strokeStyle = `rgba(217, 70, 239, ${0.4 + pulse * 0.25})`;
  ctx.lineWidth = 1 * zoom;
  traceHexPath(ctx, x, y - size * 0.35 + hover, size * 0.06);
  ctx.stroke();
  clearShadow(ctx);

  // hex crown spikes
  for (let i = 0; i < 3; i++) {
    const spikeX = x + (i - 1) * size * 0.06;
    const spikeY = y - size * 0.44 + hover;
    ctx.fillStyle = `rgba(192, 38, 211, ${0.5 + shimmer * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(spikeX - size * 0.015, y - size * 0.37 + hover);
    ctx.lineTo(spikeX, spikeY - i * size * 0.015);
    ctx.lineTo(spikeX + size * 0.015, y - size * 0.37 + hover);
    ctx.closePath();
    ctx.fill();
  }

  // hex rune cross on torso
  ctx.strokeStyle = `rgba(251, 113, 133, ${0.55 + pulse * 0.2})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.08 + hover);
  ctx.lineTo(x + size * 0.18, y - size * 0.08 + hover);
  ctx.moveTo(x, y - size * 0.2 + hover);
  ctx.lineTo(x, y + size * 0.18 + hover);
  ctx.stroke();

  // orbiting hex rune sigils
  drawOrbitingHexRunes(
    ctx,
    x,
    y - size * 0.15 + hover,
    4,
    size * 0.26,
    0.45,
    size * 0.024,
    `rgba(244, 114, 182, ${0.55 + pulse * 0.2})`,
    time,
    2.5,
    pulse,
    zoom
  );

  // floating hex crystal shards
  for (let i = 0; i < 3; i++) {
    const shardAngle = time * 2.5 + i * Math.PI * 0.67;
    const shardX = x + Math.cos(shardAngle) * size * 0.22;
    const shardY =
      y - size * 0.28 + hover + Math.sin(shardAngle * 1.3) * size * 0.06;
    ctx.save();
    ctx.translate(shardX, shardY);
    ctx.rotate(shardAngle + Math.PI * 0.25);

    const shardGrad = ctx.createLinearGradient(
      -size * 0.02,
      -size * 0.04,
      size * 0.02,
      size * 0.04
    );
    shardGrad.addColorStop(0, `rgba(244, 114, 182, ${0.55 + pulse * 0.2})`);
    shardGrad.addColorStop(1, `rgba(192, 38, 211, ${0.4 + pulse * 0.15})`);

    drawHexPlate(
      ctx,
      0,
      0,
      size * 0.025,
      shardGrad,
      `rgba(251, 207, 232, ${0.3 * pulse})`,
      0.5 * zoom
    );
    ctx.restore();
  }

  // attack hex burst
  if (isAttacking) {
    const burstR = size * (0.35 + attackGlow * 0.2);
    setShadowBlur(ctx, 10 * zoom, "#d946ef");
    traceHexPath(ctx, x, y - size * 0.1, burstR);
    ctx.strokeStyle = `rgba(217, 70, 239, ${0.4 * attackGlow})`;
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();

    traceHexPath(ctx, x, y - size * 0.1, burstR * 0.7);
    ctx.strokeStyle = `rgba(244, 114, 182, ${0.3 * attackGlow})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.stroke();
    clearShadow(ctx);
  }
}
