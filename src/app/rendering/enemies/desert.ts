// Desert region enemy sprites

import { ISO_Y_RATIO } from "../../constants/isometric";
import { setShadowBlur, clearShadow } from "../performance";
import { drawRadialAura } from "./helpers";
import {
  drawSandDust,
  drawShiftingSegments,
  drawAnimatedTendril,
  drawFloatingPiece,
} from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";

// =====================================================
// DESERT REGION TROOPS
// =====================================================

export function drawNomadEnemy(
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
  const walk = Math.sin(time * 4) * 0.08;
  const robeSway = Math.sin(time * 2.5) * 0.06;
  const cloakBillow = Math.sin(time * 3) * 0.04;
  const runeGlow = 0.5 + Math.sin(time * 3) * 0.5;
  const windDir = Math.sin(time * 1.2) * 0.15;
  const sandstormReady = 0.3 + Math.sin(time * 2) * 0.3;
  const attackSwing = isAttacking ? Math.sin(attackPhase * Math.PI) : 0;
  size *= 1.35;

  // Heat shimmer/mirage effect around body
  ctx.save();
  ctx.globalAlpha = 0.08 + Math.sin(time * 6) * 0.04;
  for (let shimmer = 0; shimmer < 3; shimmer++) {
    const shimmerOffset = Math.sin(time * 8 + shimmer * 2.5) * size * 0.03;
    const shimmerY = y - size * 0.3 + shimmer * size * 0.25;
    ctx.fillStyle = `rgba(255, 200, 100, 0.1)`;
    ctx.beginPath();
    ctx.ellipse(
      x + shimmerOffset, shimmerY,
      size * (0.5 + Math.sin(time * 5 + shimmer) * 0.05),
      size * 0.08, 0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Sand swirl effect at feet
  ctx.save();
  for (let swirl = 0; swirl < 12; swirl++) {
    const swirlAngle = time * 3 + swirl * (Math.PI * 2 / 12);
    const swirlDist = size * (0.2 + swirl * 0.025 + Math.sin(time * 2 + swirl) * 0.05);
    const swirlY = y + size * 0.42 + Math.sin(swirlAngle * 0.3) * size * 0.03;
    const swirlAlpha = 0.25 - swirl * 0.015;
    ctx.fillStyle = `rgba(194, 154, 108, ${swirlAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(swirlAngle) * swirlDist,
      swirlY, size * 0.04, size * 0.02,
      swirlAngle, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Heat distortion wavering effect around feet
  ctx.save();
  for (let hd = 0; hd < 4; hd++) {
    const hdY = y + size * 0.3 + hd * size * 0.06;
    const hdWave = Math.sin(time * 7 + hd * 1.8) * size * 0.04;
    const hdAlpha = 0.04 - hd * 0.008;
    ctx.fillStyle = `rgba(255, 220, 150, ${hdAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + hdWave, hdY,
      size * (0.35 - hd * 0.04), size * 0.025,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Sandstorm shroud visual (sand swirling around when ability ready)
  ctx.save();
  for (let ss = 0; ss < 16; ss++) {
    const ssAngle = time * 4 + ss * (Math.PI * 2 / 16);
    const ssHeight = Math.sin(time * 2 + ss * 0.7) * size * 0.4;
    const ssDist = size * (0.35 + Math.sin(time * 3 + ss) * 0.1);
    const ssAlpha = sandstormReady * 0.3 * (0.5 + Math.sin(time * 5 + ss) * 0.5);
    ctx.fillStyle = `rgba(194, 154, 108, ${ssAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(ssAngle) * ssDist,
      y + ssHeight,
      size * (0.03 + Math.sin(ss) * 0.015),
      size * (0.015 + Math.sin(ss * 1.3) * 0.008),
      ssAngle, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  // Sandstorm veil
  const veilGrad = ctx.createRadialGradient(x, y, size * 0.2, x, y, size * 0.7);
  veilGrad.addColorStop(0, "rgba(194, 154, 108, 0)");
  veilGrad.addColorStop(0.6, `rgba(194, 154, 108, ${sandstormReady * 0.06})`);
  veilGrad.addColorStop(1, "rgba(194, 154, 108, 0)");
  ctx.fillStyle = veilGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sandstorm aura around feet
  ctx.fillStyle = `rgba(194, 154, 108, ${0.15 + Math.sin(time * 5) * 0.08})`;
  for (let dust = 0; dust < 6; dust++) {
    const dustAngle = time * 2 + dust * 1.05;
    const dustDist = size * (0.3 + Math.sin(time * 4 + dust) * 0.1);
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(dustAngle) * dustDist,
      y + size * 0.35 + Math.sin(dustAngle * 0.5) * size * 0.05,
      size * 0.06, 0, Math.PI * 2,
    );
    ctx.fill();
  }


  // Armored legs visible beneath robe — path-based for depth
  drawPathLegs(ctx, x, y + size * 0.25, size, time, zoom, {
    color: "#5c4a3a",
    colorDark: "#3d2e22",
    footColor: "#2a1f16",
    strideSpeed: 4,
    strideAmt: 0.25,
    legLen: 0.2,
    width: 0.04,
    style: 'armored',
  });

  // Nomad arms — scimitar guard stance
  drawPathArm(ctx, x - size * 0.28, y - size * 0.15, size, time, zoom, -1, {
    color: "#8b7355",
    colorDark: "#5c4a3a",
    handColor: "#6b5a48",
    shoulderAngle: -0.5 + Math.sin(time * 2) * 0.06,
    elbowAngle: 0.8 + Math.sin(time * 2.5 + 0.5) * 0.08,
    upperLen: 0.14,
    foreLen: 0.12,
    width: 0.04,
    style: 'armored',
  });
  drawPathArm(ctx, x + size * 0.28, y - size * 0.15, size, time, zoom, 1, {
    color: "#8b7355",
    colorDark: "#5c4a3a",
    handColor: "#6b5a48",
    shoulderAngle: 0.7 + Math.sin(time * 2.2) * 0.08 + (isAttacking ? 0.5 : 0),
    elbowAngle: 0.3 + Math.sin(time * 2.8 + 1.5) * 0.1,
    upperLen: 0.14,
    foreLen: 0.12,
    width: 0.04,
  });

  // Outer flowing robe layer with wind
  ctx.fillStyle = `rgba(${bodyColorDark.slice(1).match(/../g)?.map(h => parseInt(h, 16)).join(", ") || "40,30,20"}, 0.4)`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.42 + windDir * size, y + size * 0.42);
  ctx.quadraticCurveTo(
    x - size * 0.55 + windDir * size * 2, y + size * 0.15,
    x - size * 0.38 + windDir * size, y - size * 0.15,
  );
  ctx.quadraticCurveTo(
    x - size * 0.48 + windDir * size * 1.5, y + size * 0.2,
    x - size * 0.42 + windDir * size, y + size * 0.42,
  );
  ctx.fill();
  // Right side flowing cloth
  ctx.beginPath();
  ctx.moveTo(x + size * 0.42 + windDir * size, y + size * 0.42);
  ctx.quadraticCurveTo(
    x + size * 0.52 + windDir * size * 1.5, y + size * 0.2,
    x + size * 0.38 + windDir * size, y - size * 0.1,
  );
  ctx.quadraticCurveTo(
    x + size * 0.5 + windDir * size, y + size * 0.25,
    x + size * 0.42 + windDir * size, y + size * 0.42,
  );
  ctx.fill();

  // Main tattered flowing robe — layered bezier draping
  const robeGrad = ctx.createLinearGradient(
    x - size * 0.4, y - size * 0.4,
    x + size * 0.3, y + size * 0.4,
  );
  robeGrad.addColorStop(0, bodyColorDark);
  robeGrad.addColorStop(0.4, bodyColor);
  robeGrad.addColorStop(0.8, bodyColorDark);
  robeGrad.addColorStop(1, "#1a1510");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y + size * 0.4);
  ctx.bezierCurveTo(
    x - size * 0.52 + cloakBillow * size, y + size * 0.22,
    x - size * 0.48 + cloakBillow * size * 0.5, y - size * 0.05,
    x - size * 0.35, y - size * 0.25,
  );
  ctx.bezierCurveTo(
    x - size * 0.3, y - size * 0.4,
    x - size * 0.2, y - size * 0.52 + robeSway * size,
    x, y - size * 0.55,
  );
  ctx.bezierCurveTo(
    x + size * 0.2, y - size * 0.52 + robeSway * size,
    x + size * 0.3, y - size * 0.4,
    x + size * 0.35, y - size * 0.25,
  );
  ctx.bezierCurveTo(
    x + size * 0.48 - cloakBillow * size * 0.5, y - size * 0.05,
    x + size * 0.52 - cloakBillow * size, y + size * 0.22,
    x + size * 0.4, y + size * 0.4,
  );
  ctx.bezierCurveTo(
    x + size * 0.25, y + size * 0.44 + walk * size,
    x + size * 0.08, y + size * 0.42,
    x, y + size * 0.4,
  );
  ctx.bezierCurveTo(
    x - size * 0.08, y + size * 0.42,
    x - size * 0.25, y + size * 0.44 - walk * size,
    x - size * 0.4, y + size * 0.4,
  );
  ctx.fill();

  // Tattered robe edges
  ctx.fillStyle = bodyColorDark;
  for (let tatter = 0; tatter < 7; tatter++) {
    const tatterX = x - size * 0.35 + tatter * size * 0.12;
    const tatterLen = size * (0.06 + Math.sin(tatter * 1.5) * 0.03);
    const tatterSway = Math.sin(time * 4 + tatter * 0.8) * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(tatterX - size * 0.02, y + size * 0.38);
    ctx.lineTo(tatterX + tatterSway, y + size * 0.38 + tatterLen);
    ctx.lineTo(tatterX + size * 0.02, y + size * 0.38);
    ctx.fill();
  }

  // Sand trailing from cloak edges
  for (let st = 0; st < 5; st++) {
    const stPhase = (time * 1.2 + st * 0.4) % 1;
    const stBaseX = x - size * 0.35 + st * size * 0.16 + windDir * size * st * 0.03;
    const stY = y + size * 0.38 + stPhase * size * 0.25;
    const stDrift = Math.sin(time * 3 + st * 1.2) * size * 0.03 + windDir * size * stPhase * 0.2;
    const stSize = size * (0.012 + Math.sin(st) * 0.005) * (1 - stPhase * 0.6);
    const stAlpha = (1 - stPhase) * 0.5;
    ctx.fillStyle = `rgba(194, 154, 108, ${stAlpha})`;
    ctx.beginPath();
    ctx.ellipse(stBaseX + stDrift, stY, stSize, stSize * 2, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Desert patterns/embroidery on robes
  ctx.strokeStyle = `rgba(194, 154, 108, ${0.3 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  // Zigzag border pattern along robe edge
  ctx.beginPath();
  for (let zz = 0; zz < 10; zz++) {
    const zzX = x - size * 0.3 + zz * size * 0.065;
    const zzY = y + size * 0.32;
    if (zz === 0) ctx.moveTo(zzX, zzY);
    else ctx.lineTo(zzX, zz % 2 === 0 ? zzY : zzY - size * 0.04);
  }
  ctx.stroke();
  // Diamond embroidery on chest
  ctx.strokeStyle = `rgba(251, 191, 36, ${runeGlow * 0.35})`;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.15);
  ctx.lineTo(x + size * 0.05, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.05);
  ctx.lineTo(x - size * 0.05, y - size * 0.1);
  ctx.closePath();
  ctx.stroke();
  // Smaller diamond below
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + size * 0.035, y + size * 0.035);
  ctx.lineTo(x, y + size * 0.07);
  ctx.lineTo(x - size * 0.035, y + size * 0.035);
  ctx.closePath();
  ctx.stroke();

  // Multiple robe fold lines for depth
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1.5 * zoom;
  for (let fold = 0; fold < 4; fold++) {
    const foldX = x - size * 0.2 + fold * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(foldX, y - size * 0.2 + fold * size * 0.05);
    ctx.quadraticCurveTo(
      foldX + size * 0.02, y + size * 0.1,
      foldX - size * 0.01, y + size * 0.38,
    );
    ctx.stroke();
  }

  // Ancient rune markings on robe (glowing)
  ctx.strokeStyle = `rgba(251, 191, 36, ${runeGlow * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.1);
  ctx.lineTo(x - size * 0.25, y + size * 0.05);
  ctx.lineTo(x - size * 0.15, y + size * 0.05);
  ctx.lineTo(x - size * 0.2, y + size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y);
  ctx.lineTo(x + size * 0.2, y + size * 0.1);
  ctx.lineTo(x + size * 0.1, y + size * 0.08);
  ctx.moveTo(x + size * 0.18, y + size * 0.05);
  ctx.arc(x + size * 0.15, y + size * 0.05, size * 0.03, 0, Math.PI * 2);
  ctx.stroke();

  // Inner robe layer — tapered bezier tunic shape
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.35);
  ctx.bezierCurveTo(
    x - size * 0.22, y - size * 0.2,
    x - size * 0.24, y + size * 0.1,
    x - size * 0.18, y + size * 0.3,
  );
  ctx.bezierCurveTo(
    x - size * 0.1, y + size * 0.35,
    x + size * 0.1, y + size * 0.35,
    x + size * 0.18, y + size * 0.3,
  );
  ctx.bezierCurveTo(
    x + size * 0.24, y + size * 0.1,
    x + size * 0.22, y - size * 0.2,
    x + size * 0.15, y - size * 0.35,
  );
  ctx.bezierCurveTo(
    x + size * 0.08, y - size * 0.38,
    x - size * 0.08, y - size * 0.38,
    x - size * 0.15, y - size * 0.35,
  );
  ctx.fill();

  // Jewelry/amulets - necklace with ancient desert artifact
  ctx.strokeStyle = "#d4a520";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.25);
  ctx.quadraticCurveTo(x, y - size * 0.18, x + size * 0.15, y - size * 0.25);
  ctx.stroke();
  // Central amulet pendant
  ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + runeGlow * 0.3})`;
  setShadowBlur(ctx, 4 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.2);
  ctx.lineTo(x + size * 0.03, y - size * 0.15);
  ctx.lineTo(x, y - size * 0.1);
  ctx.lineTo(x - size * 0.03, y - size * 0.15);
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);
  // Gem in amulet center
  ctx.fillStyle = `rgba(220, 38, 38, ${0.8 + Math.sin(time * 3) * 0.2})`;
  ctx.beginPath();
  ctx.arc(x, y - size * 0.15, size * 0.012, 0, Math.PI * 2);
  ctx.fill();

  // Arm bracers/bangles
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(x - size * 0.32, y + size * 0.02, size * 0.05, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - size * 0.32, y + size * 0.08, size * 0.045, 0, Math.PI * 2);
  ctx.stroke();

  // Sword hand visible
  ctx.fillStyle = "#2a2520";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.32, y + size * 0.05,
    size * 0.08, size * 0.06, -0.3, 0, Math.PI * 2,
  );
  ctx.fill();

  // Curved scimitar
  const swordAngle = isAttacking ? -1.2 + attackSwing * 2.5 : -0.8 + Math.sin(time * 2) * 0.1;
  const swordBaseX = x - size * 0.32;
  const swordBaseY = y + size * 0.05;
  ctx.save();
  ctx.translate(swordBaseX, swordBaseY);
  ctx.rotate(swordAngle);
  // Blade — curved scimitar with fuller
  const bladeGrad = ctx.createLinearGradient(0, 0, size * 0.06, -size * 0.4);
  bladeGrad.addColorStop(0, "#a0a0a0");
  bladeGrad.addColorStop(0.4, "#d0d0d0");
  bladeGrad.addColorStop(0.7, "#c0c0c0");
  bladeGrad.addColorStop(1, "#b0b0b0");
  ctx.fillStyle = bladeGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(
    size * 0.02, -size * 0.1,
    size * 0.04, -size * 0.25,
    size * 0.08, -size * 0.38,
  );
  ctx.bezierCurveTo(
    size * 0.1, -size * 0.42,
    size * 0.12, -size * 0.43,
    size * 0.1, -size * 0.41,
  );
  ctx.bezierCurveTo(
    size * 0.08, -size * 0.39,
    size * 0.06, -size * 0.36,
    size * 0.04, -size * 0.32,
  );
  ctx.bezierCurveTo(
    size * 0.02, -size * 0.2,
    size * 0.01, -size * 0.1,
    0, 0,
  );
  ctx.fill();
  // Blade edge highlight
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.01, -size * 0.02);
  ctx.bezierCurveTo(
    size * 0.03, -size * 0.15,
    size * 0.05, -size * 0.28,
    size * 0.09, -size * 0.4,
  );
  ctx.stroke();
  // Blade fuller groove
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.015, -size * 0.04);
  ctx.bezierCurveTo(
    size * 0.03, -size * 0.15,
    size * 0.045, -size * 0.26,
    size * 0.07, -size * 0.36,
  );
  ctx.stroke();
  // Crossguard
  ctx.fillStyle = "#d4a520";
  ctx.beginPath();
  ctx.rect(-size * 0.04, -size * 0.02, size * 0.08, size * 0.025);
  ctx.fill();
  // Handle
  ctx.fillStyle = "#4a2810";
  ctx.beginPath();
  ctx.rect(-size * 0.015, 0, size * 0.03, size * 0.08);
  ctx.fill();
  // Handle wrap
  ctx.strokeStyle = "#8b6914";
  ctx.lineWidth = 1 * zoom;
  for (let hw = 0; hw < 4; hw++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.015, size * 0.01 + hw * size * 0.018);
    ctx.lineTo(size * 0.015, size * 0.02 + hw * size * 0.018);
    ctx.stroke();
  }
  // Pommel
  ctx.fillStyle = "#d4a520";
  ctx.beginPath();
  ctx.arc(0, size * 0.09, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Deep hood casting darkness — sculpted drape with peak
  const hoodGrad = ctx.createLinearGradient(x, y - size * 0.65, x, y - size * 0.25);
  hoodGrad.addColorStop(0, bodyColor);
  hoodGrad.addColorStop(0.4, bodyColorDark);
  hoodGrad.addColorStop(1, "#0a0805");
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, y - size * 0.3);
  ctx.bezierCurveTo(
    x - size * 0.36, y - size * 0.42,
    x - size * 0.38, y - size * 0.58,
    x - size * 0.15, y - size * 0.68,
  );
  ctx.bezierCurveTo(
    x - size * 0.08, y - size * 0.73 + robeSway * size * 0.5,
    x + size * 0.08, y - size * 0.73 + robeSway * size * 0.5,
    x + size * 0.15, y - size * 0.68,
  );
  ctx.bezierCurveTo(
    x + size * 0.38, y - size * 0.58,
    x + size * 0.36, y - size * 0.42,
    x + size * 0.28, y - size * 0.3,
  );
  ctx.bezierCurveTo(
    x + size * 0.2, y - size * 0.24,
    x + size * 0.1, y - size * 0.21,
    x, y - size * 0.2,
  );
  ctx.bezierCurveTo(
    x - size * 0.1, y - size * 0.21,
    x - size * 0.2, y - size * 0.24,
    x - size * 0.28, y - size * 0.3,
  );
  ctx.fill();

  // Hood drape fold lines
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.68);
  ctx.bezierCurveTo(
    x - size * 0.08, y - size * 0.55,
    x - size * 0.12, y - size * 0.42,
    x - size * 0.2, y - size * 0.3,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05, y - size * 0.68);
  ctx.bezierCurveTo(
    x + size * 0.08, y - size * 0.55,
    x + size * 0.12, y - size * 0.42,
    x + size * 0.2, y - size * 0.3,
  );
  ctx.stroke();

  // Hood edge detail
  ctx.strokeStyle = bodyColorLight;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.32);
  ctx.quadraticCurveTo(x, y - size * 0.22, x + size * 0.25, y - size * 0.32);
  ctx.stroke();

  // Face wrapping/scarf covering lower face — sculpted oval
  ctx.fillStyle = "#050505";
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.52);
  ctx.bezierCurveTo(
    x + size * 0.1, y - size * 0.5,
    x + size * 0.15, y - size * 0.44,
    x + size * 0.14, y - size * 0.38,
  );
  ctx.bezierCurveTo(
    x + size * 0.13, y - size * 0.3,
    x + size * 0.06, y - size * 0.28,
    x, y - size * 0.28,
  );
  ctx.bezierCurveTo(
    x - size * 0.06, y - size * 0.28,
    x - size * 0.13, y - size * 0.3,
    x - size * 0.14, y - size * 0.38,
  );
  ctx.bezierCurveTo(
    x - size * 0.15, y - size * 0.44,
    x - size * 0.1, y - size * 0.5,
    x, y - size * 0.52,
  );
  ctx.fill();

  // Face scarf wrapping (only eyes visible)
  const scarfGrad = ctx.createLinearGradient(
    x - size * 0.15, y - size * 0.38,
    x + size * 0.15, y - size * 0.3,
  );
  scarfGrad.addColorStop(0, bodyColor);
  scarfGrad.addColorStop(0.5, bodyColorLight);
  scarfGrad.addColorStop(1, bodyColor);
  ctx.fillStyle = scarfGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.18, y - size * 0.35, x - size * 0.16, y - size * 0.3);
  ctx.quadraticCurveTo(x, y - size * 0.27, x + size * 0.16, y - size * 0.3);
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.35, x + size * 0.15, y - size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Scarf fold lines
  ctx.strokeStyle = "rgba(0,0,0,0.2)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.37);
  ctx.quadraticCurveTo(x, y - size * 0.34, x + size * 0.1, y - size * 0.37);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y - size * 0.33);
  ctx.quadraticCurveTo(x, y - size * 0.3, x + size * 0.12, y - size * 0.33);
  ctx.stroke();

  // Trailing scarf end blowing in wind
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.36);
  ctx.quadraticCurveTo(
    x + size * 0.25 + windDir * size, y - size * 0.38,
    x + size * 0.3 + windDir * size * 1.5, y - size * 0.32,
  );
  ctx.quadraticCurveTo(
    x + size * 0.28 + windDir * size, y - size * 0.3,
    x + size * 0.15, y - size * 0.32,
  );
  ctx.fill();

  // Glowing eyes from the void - only visible part of face
  ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + runeGlow * 0.3})`;
  setShadowBlur(ctx, 12 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.07, y - size * 0.43,
    size * 0.035, size * 0.025, -0.1, 0, Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.07, y - size * 0.43,
    size * 0.035, size * 0.025, 0.1, 0, Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Eye glow trail effect
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow * 0.15})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.04, y - size * 0.43);
  ctx.quadraticCurveTo(
    x - size * 0.15, y - size * 0.44,
    x - size * 0.22 + windDir * size, y - size * 0.42,
  );
  ctx.quadraticCurveTo(x - size * 0.15, y - size * 0.42, x - size * 0.04, y - size * 0.43);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.1, y - size * 0.43);
  ctx.quadraticCurveTo(
    x + size * 0.18, y - size * 0.44,
    x + size * 0.25 + windDir * size, y - size * 0.42,
  );
  ctx.quadraticCurveTo(x + size * 0.18, y - size * 0.42, x + size * 0.1, y - size * 0.43);
  ctx.fill();

  // Faint skull-like features in the darkness (above scarf)
  ctx.strokeStyle = `rgba(50, 40, 30, ${0.4 + Math.sin(time * 2) * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.4);
  ctx.lineTo(x, y - size * 0.395);
  ctx.lineTo(x + size * 0.03, y - size * 0.4);
  ctx.stroke();

  // Ornate cursed staff with skull (no longer in sword hand, carried on back)
  ctx.strokeStyle = "#3d2914";
  ctx.lineWidth = 4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y - size * 0.35);
  ctx.lineTo(x + size * 0.35, y + size * 0.45);
  ctx.stroke();

  // Staff wood grain
  ctx.strokeStyle = "#2a1a0a";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.29, y - size * 0.2);
  ctx.lineTo(x + size * 0.32, y + size * 0.1);
  ctx.moveTo(x + size * 0.31, y);
  ctx.lineTo(x + size * 0.34, y + size * 0.3);
  ctx.stroke();

  // Skull ornament on staff
  ctx.fillStyle = "#d4c9a8";
  ctx.beginPath();
  ctx.arc(x + size * 0.28, y - size * 0.45, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.47, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.31, y - size * 0.47, size * 0.025, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow})`;
  setShadowBlur(ctx, 6 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(x + size * 0.25, y - size * 0.47, size * 0.012, 0, Math.PI * 2);
  ctx.arc(x + size * 0.31, y - size * 0.47, size * 0.012, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = "#c4b998";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.28, y - size * 0.4,
    size * 0.05, size * 0.03, 0, 0, Math.PI,
  );
  ctx.fill();

  // Swirling sand dust
  drawSandDust(ctx, x, y, size * 0.4, time, zoom, {
    color: "rgba(251, 191, 36, 0.45)",
    count: 8,
    speed: 1.8,
    maxAlpha: 0.35,
    spread: 1.2,
  });

  // Floating sand crystal shards
  drawShiftingSegments(ctx, x, y - size * 0.1, size, time, zoom, {
    color: "#c2986c",
    colorAlt: "#d4a520",
    count: 5,
    orbitRadius: 0.4,
    segmentSize: 0.03,
    orbitSpeed: 1.0,
    shape: "shard",
  });

  // Wind-blown sand particles
  for (let wp = 0; wp < 12; wp++) {
    const wpX = x + Math.sin(time * 2 + wp * 1.3) * size * 0.6 + windDir * size * wp * 0.05;
    const wpY = y + Math.cos(time * 1.5 + wp * 0.9) * size * 0.4;
    const wpAlpha = 0.3 + Math.sin(time * 4 + wp) * 0.2;
    const wpSize = size * (0.008 + Math.sin(wp * 2.1) * 0.006);
    ctx.fillStyle = `rgba(210, 180, 140, ${wpAlpha})`;
    ctx.beginPath();
    ctx.arc(wpX, wpY, wpSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Floating sand/dust particles (larger)
  ctx.fillStyle = `rgba(194, 154, 108, ${0.5 + Math.sin(time * 2) * 0.3})`;
  for (let p = 0; p < 8; p++) {
    const pAngle = time * 1.5 + p * 0.8;
    const pDist = size * (0.4 + Math.sin(time * 2 + p) * 0.15);
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + Math.sin(pAngle * 0.6) * size * 0.3;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden dust trail behind
  ctx.save();
  for (let gd = 0; gd < 6; gd++) {
    const gdPhase = (time * 0.7 + gd * 0.167) % 1;
    const gdX = x - size * 0.1 + Math.sin(time + gd * 2) * size * 0.15;
    const gdY = y + size * 0.35 + Math.cos(time * 0.8 + gd) * size * 0.05;
    const gdAlpha = (1 - gdPhase) * 0.3;
    const gdSize = size * (0.02 + gdPhase * 0.03);
    const gdGrad = ctx.createRadialGradient(gdX, gdY, 0, gdX, gdY, gdSize);
    gdGrad.addColorStop(0, `rgba(251, 191, 36, ${gdAlpha})`);
    gdGrad.addColorStop(1, "rgba(194, 154, 108, 0)");
    ctx.fillStyle = gdGrad;
    ctx.beginPath();
    ctx.arc(gdX, gdY, gdSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Rune glow shimmer on blade
  ctx.save();
  const bladeGlowAlpha = 0.15 + runeGlow * 0.2;
  const bladeGlowGrad = ctx.createRadialGradient(
    x - size * 0.3, y - size * 0.1, 0,
    x - size * 0.3, y - size * 0.1, size * 0.2,
  );
  bladeGlowGrad.addColorStop(0, `rgba(251, 191, 36, ${bladeGlowAlpha})`);
  bladeGlowGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
  ctx.fillStyle = bladeGlowGrad;
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.1, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Desert wind sand ribbon trails
  ctx.save();
  for (let ribbon = 0; ribbon < 3; ribbon++) {
    const ribbonPhase = (time * 0.8 + ribbon * 0.33) % 1;
    const ribbonY = y - size * 0.2 + ribbon * size * 0.15;
    const ribbonAlpha = (1 - ribbonPhase) * 0.15 * sandstormReady;
    const ribbonLen = size * 0.5 * ribbonPhase;
    const ribbonGrad = ctx.createLinearGradient(
      x - ribbonLen * 0.5 + windDir * size * 2, ribbonY,
      x + ribbonLen * 0.5 + windDir * size * 2, ribbonY,
    );
    ribbonGrad.addColorStop(0, "rgba(194, 154, 108, 0)");
    ribbonGrad.addColorStop(0.3, `rgba(217, 178, 128, ${ribbonAlpha})`);
    ribbonGrad.addColorStop(0.7, `rgba(194, 154, 108, ${ribbonAlpha})`);
    ribbonGrad.addColorStop(1, "rgba(194, 154, 108, 0)");
    ctx.strokeStyle = ribbonGrad;
    ctx.lineWidth = (2 + Math.sin(ribbon * 1.5) * 1) * zoom;
    ctx.beginPath();
    ctx.moveTo(x - ribbonLen * 0.5 + windDir * size * 2, ribbonY);
    ctx.quadraticCurveTo(
      x + windDir * size + Math.sin(time * 3 + ribbon) * size * 0.06, ribbonY - size * 0.04,
      x + ribbonLen * 0.5 + windDir * size * 2, ribbonY + Math.sin(time * 2 + ribbon) * size * 0.03,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Golden dust aura around weapon area
  ctx.save();
  const dustPulse = 0.15 + runeGlow * 0.15;
  const dustGrad = ctx.createRadialGradient(
    x - size * 0.3, y - size * 0.05, 0,
    x - size * 0.3, y - size * 0.05, size * 0.2,
  );
  dustGrad.addColorStop(0, `rgba(251, 191, 36, ${dustPulse * 0.4})`);
  dustGrad.addColorStop(0.5, `rgba(217, 119, 6, ${dustPulse * 0.2})`);
  dustGrad.addColorStop(1, "rgba(194, 154, 108, 0)");
  ctx.fillStyle = dustGrad;
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.05, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Attack: sword slash arc and sand explosion
  if (isAttacking) {
    // Sword slash arc trail
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${attackSwing * 0.6})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    const slashCenterX = x - size * 0.32;
    const slashCenterY = y + size * 0.05;
    const slashRadius = size * 0.4;
    const slashStart = swordAngle - 0.5;
    const slashEnd = swordAngle + 0.5;
    ctx.arc(slashCenterX, slashCenterY, slashRadius, slashStart, slashEnd);
    ctx.stroke();

    // Secondary slash glow
    ctx.strokeStyle = `rgba(251, 191, 36, ${attackSwing * 0.4})`;
    ctx.lineWidth = 5 * zoom;
    ctx.beginPath();
    ctx.arc(slashCenterX, slashCenterY, slashRadius * 0.95, slashStart + 0.1, slashEnd - 0.1);
    ctx.stroke();
    ctx.restore();

    // Sand explosion burst
    for (let burst = 0; burst < 12; burst++) {
      const burstAngle = (burst / 12) * Math.PI * 2 + time * 2;
      const burstDist = attackPhase * size * (0.3 + Math.sin(burst * 1.5) * 0.15);
      const burstAlpha = (1 - attackPhase) * 0.5;
      ctx.fillStyle = `rgba(194, 154, 108, ${burstAlpha})`;
      ctx.beginPath();
      ctx.arc(
        x + Math.cos(burstAngle) * burstDist,
        y + Math.sin(burstAngle) * burstDist,
        size * (0.02 + Math.sin(burst) * 0.01),
        0, Math.PI * 2,
      );
      ctx.fill();
    }

    // Sand shockwave ring (isometric ground ellipse)
    const shockR = attackPhase * size * 0.6;
    ctx.strokeStyle = `rgba(194, 154, 108, ${(1 - attackPhase) * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(x, y, shockR, shockR * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Swarm speed: afterimage trail (fading body copies behind)
  ctx.save();
  for (let ai = 0; ai < 3; ai++) {
    const aiOffset = (ai + 1) * size * 0.12 + Math.sin(time * 5 + ai) * size * 0.02;
    const aiScale = 1 - (ai + 1) * 0.12;
    const aiAlpha = [0.15, 0.10, 0.06][ai];
    ctx.globalAlpha = aiAlpha;
    ctx.fillStyle = "#a16207";
    ctx.beginPath();
    ctx.ellipse(
      x + aiOffset, y + ai * size * 0.02,
      size * 0.18 * aiScale, size * 0.28 * aiScale,
      0, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Swarm speed: sand kick particles spraying behind
  ctx.save();
  for (let sk = 0; sk < 5; sk++) {
    const skPhase = (time * 4 + sk * 0.6) % 1.5;
    const skX = x + size * 0.15 + skPhase * size * 0.2;
    const skY = y + size * 0.35 - skPhase * size * 0.1 + Math.sin(time * 6 + sk * 2) * size * 0.03;
    const skAlpha = Math.max(0, 0.25 - skPhase * 0.15);
    const skR = size * 0.015 * (1 - skPhase * 0.4);
    ctx.fillStyle = `rgba(194, 154, 108, ${skAlpha})`;
    ctx.beginPath();
    ctx.arc(skX, skY, skR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawScorpionEnemy(
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
  // GIANT SCORPION - Ancient armored desert predator with venomous stinger
  const isAttacking = attackPhase > 0;
  const legWave = Math.sin(time * 6);
  const tailSway = Math.sin(time * 2.5) * 0.25;
  const clawSnap = isAttacking ? Math.sin(attackPhase * Math.PI * 3) * 0.4 : 0;
  const breathe = Math.sin(time * 2) * 0.02;
  const venomDrip = (time * 2) % 1;
  size *= 1.5; // Larger size


  // Disturbed sand around creature
  ctx.fillStyle = "rgba(139, 119, 89, 0.3)";
  for (let sand = 0; sand < 8; sand++) {
    const sandAngle = sand * (Math.PI / 4) + time * 0.3;
    const sandDist = size * (0.5 + Math.sin(time * 2 + sand) * 0.08);
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(sandAngle) * sandDist,
      y + size * 0.32 + Math.sin(sandAngle * 0.5) * size * 0.05,
      size * 0.08,
      size * 0.03,
      sandAngle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Armored segmented legs (4 on each side) with tetrapod crawling gait
  // Arachnid gait: legs 0,2 on left move with legs 1,3 on right (and vice versa)
  const legAngles = [-0.55, -0.2, 0.15, 0.5];
  const legLengths = [0.38, 0.42, 0.42, 0.36];
  const crawlSpeed = time * 5;
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 4; leg++) {
      // Tetrapod gait: alternate phase based on leg index + side
      const gaitOffset = ((leg % 2) ^ (side === 1 ? 1 : 0)) ? 0 : Math.PI;
      const stride = Math.sin(crawlSpeed + gaitOffset);
      const liftPhase = Math.max(0, stride);
      const pushPhase = Math.max(0, -stride);
      const legAngle = legAngles[leg];
      const legLen = legLengths[leg];

      const legBaseX = x + side * (size * 0.12 + leg * size * 0.08);
      const legBaseY = y + size * 0.02 + leg * size * 0.05;

      // Mid-joint arches upward during lift, flattens during push
      const midSpreadX = side * size * 0.2;
      const midSpreadY = legAngle * size * 0.15;
      const liftHeight = liftPhase * size * 0.1;
      const legMidX = legBaseX + midSpreadX + side * stride * size * 0.03;
      const legMidY = legBaseY + midSpreadY - size * 0.04 - liftHeight;

      // Foot sweeps forward on lift, backward on push (crawling motion)
      const footStride = stride * size * 0.06;
      const endSpreadX = side * size * legLen;
      const endSpreadY = legAngle * size * 0.35;
      const legEndX = legBaseX + endSpreadX + footStride * legAngle;
      const legEndY = legBaseY + endSpreadY + size * 0.2 - liftPhase * size * 0.04 - footStride * 0.3;

      // Leg segments with gradient
      const legGrad = ctx.createLinearGradient(legBaseX, legBaseY, legEndX, legEndY);
      legGrad.addColorStop(0, bodyColor);
      legGrad.addColorStop(1, bodyColorDark);

      ctx.strokeStyle = legGrad;
      ctx.lineWidth = 5 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(legBaseX, legBaseY);
      ctx.lineTo(legMidX, legMidY);
      ctx.lineTo(legEndX, legEndY);
      ctx.stroke();

      // Leg joints (larger when lifting)
      ctx.fillStyle = bodyColorDark;
      ctx.beginPath();
      ctx.arc(legMidX, legMidY, size * (0.03 + liftPhase * 0.008), 0, Math.PI * 2);
      ctx.fill();

      // Leg spikes/hairs
      ctx.strokeStyle = "#1a1510";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(legMidX, legMidY);
      ctx.lineTo(legMidX + side * size * 0.04, legMidY - size * 0.06);
      ctx.stroke();

      // Foot shadow only when grounded (push phase)
      const groundAlpha = 0.12 * (1 - liftPhase);
      ctx.fillStyle = `rgba(0, 0, 0, ${groundAlpha})`;
      ctx.beginPath();
      ctx.ellipse(legEndX, legEndY + size * 0.01, size * 0.025, size * 0.01, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Rear body segment (abdomen) — overlapping armor plates
  const abdomenGrad = ctx.createRadialGradient(
    x, y + size * 0.08, 0,
    x, y + size * 0.08, size * 0.38,
  );
  abdomenGrad.addColorStop(0, bodyColorLight);
  abdomenGrad.addColorStop(0.5, bodyColor);
  abdomenGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = abdomenGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4 - breathe * size, y + size * 0.08);
  ctx.bezierCurveTo(
    x - size * 0.42, y - size * 0.1,
    x - size * 0.2, y - size * 0.2,
    x, y - size * 0.18,
  );
  ctx.bezierCurveTo(
    x + size * 0.2, y - size * 0.2,
    x + size * 0.42, y - size * 0.1,
    x + size * 0.4 + breathe * size, y + size * 0.08,
  );
  ctx.bezierCurveTo(
    x + size * 0.42, y + size * 0.22,
    x + size * 0.22, y + size * 0.32,
    x, y + size * 0.3 + breathe * size,
  );
  ctx.bezierCurveTo(
    x - size * 0.22, y + size * 0.32,
    x - size * 0.42, y + size * 0.22,
    x - size * 0.4 - breathe * size, y + size * 0.08,
  );
  ctx.fill();

  // Abdomen armor plate segments — curved overlapping lines
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (let plate = 0; plate < 5; plate++) {
    const plateY = y - size * 0.1 + plate * size * 0.08;
    const plateW = size * (0.38 - plate * 0.02 - Math.abs(plate - 2) * 0.01);
    ctx.beginPath();
    ctx.moveTo(x - plateW, plateY);
    ctx.bezierCurveTo(
      x - plateW * 0.5, plateY - size * 0.015,
      x + plateW * 0.5, plateY - size * 0.015,
      x + plateW, plateY,
    );
    ctx.stroke();
  }

  // Thorax/middle segment — armored bezier carapace with ridged outline
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.32, y - size * 0.1);
  ctx.bezierCurveTo(
    x - size * 0.34, y - size * 0.22,
    x - size * 0.15, y - size * 0.3,
    x, y - size * 0.28,
  );
  ctx.bezierCurveTo(
    x + size * 0.15, y - size * 0.3,
    x + size * 0.34, y - size * 0.22,
    x + size * 0.32, y - size * 0.1,
  );
  ctx.bezierCurveTo(
    x + size * 0.34, y + size * 0.02,
    x + size * 0.18, y + size * 0.1,
    x, y + size * 0.08,
  );
  ctx.bezierCurveTo(
    x - size * 0.18, y + size * 0.1,
    x - size * 0.34, y + size * 0.02,
    x - size * 0.32, y - size * 0.1,
  );
  ctx.fill();
  // Thorax center ridge
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28);
  ctx.bezierCurveTo(x - size * 0.01, y - size * 0.15, x + size * 0.01, y - size * 0.02, x, y + size * 0.08);
  ctx.stroke();

  // Chitin shine/gleam highlights
  const gleamPhase = Math.sin(time * 2.5) * 0.5 + 0.5;
  ctx.fillStyle = `rgba(255, 250, 230, ${gleamPhase * 0.35})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12, y + size * 0.02,
    size * 0.06, size * 0.12,
    -0.3, 0, Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(255, 245, 220, ${gleamPhase * 0.25})`;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.15, y - size * 0.08,
    size * 0.05, size * 0.08,
    0.4, 0, Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${gleamPhase * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08, y - size * 0.15,
    size * 0.03, size * 0.02,
    -0.5, 0, Math.PI * 2,
  );
  ctx.fill();

  // Head/carapace with armored plates
  const headGrad = ctx.createLinearGradient(
    x,
    y - size * 0.35,
    x,
    y - size * 0.1,
  );
  headGrad.addColorStop(0, bodyColorDark);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.4);
  ctx.bezierCurveTo(
    x + size * 0.18, y - size * 0.38,
    x + size * 0.28, y - size * 0.3,
    x + size * 0.28, y - size * 0.22,
  );
  ctx.bezierCurveTo(
    x + size * 0.28, y - size * 0.12,
    x + size * 0.15, y - size * 0.06,
    x, y - size * 0.08,
  );
  ctx.bezierCurveTo(
    x - size * 0.15, y - size * 0.06,
    x - size * 0.28, y - size * 0.12,
    x - size * 0.28, y - size * 0.22,
  );
  ctx.bezierCurveTo(
    x - size * 0.28, y - size * 0.3,
    x - size * 0.18, y - size * 0.38,
    x, y - size * 0.4,
  );
  ctx.fill();

  // Head armor ridges
  ctx.strokeStyle = "#1a1510";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y - size * 0.32);
  ctx.lineTo(x, y - size * 0.25);
  ctx.lineTo(x + size * 0.15, y - size * 0.32);
  ctx.stroke();

  // Mandibles — curved pincer jaws
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.35);
  ctx.bezierCurveTo(
    x - size * 0.1, y - size * 0.38,
    x - size * 0.14, y - size * 0.42,
    x - size * 0.12, y - size * 0.44,
  );
  ctx.bezierCurveTo(
    x - size * 0.1, y - size * 0.43,
    x - size * 0.06, y - size * 0.4,
    x - size * 0.05, y - size * 0.38,
  );
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.08, y - size * 0.35);
  ctx.bezierCurveTo(
    x + size * 0.1, y - size * 0.38,
    x + size * 0.14, y - size * 0.42,
    x + size * 0.12, y - size * 0.44,
  );
  ctx.bezierCurveTo(
    x + size * 0.1, y - size * 0.43,
    x + size * 0.06, y - size * 0.4,
    x + size * 0.05, y - size * 0.38,
  );
  ctx.closePath();
  ctx.fill();

  // Massive crushing pincers — articulated segments
  // Left pincer arm with joint bulge
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25, y - size * 0.15);
  ctx.bezierCurveTo(
    x - size * 0.32, y - size * 0.16,
    x - size * 0.38, y - size * 0.19,
    x - size * 0.42, y - size * 0.22,
  );
  // Joint bulge
  ctx.bezierCurveTo(
    x - size * 0.44, y - size * 0.24,
    x - size * 0.46, y - size * 0.27,
    x - size * 0.5, y - size * 0.3,
  );
  ctx.lineTo(x - size * 0.45, y - size * 0.35);
  ctx.bezierCurveTo(
    x - size * 0.42, y - size * 0.3,
    x - size * 0.38, y - size * 0.26,
    x - size * 0.35, y - size * 0.23,
  );
  ctx.bezierCurveTo(
    x - size * 0.3, y - size * 0.2,
    x - size * 0.26, y - size * 0.18,
    x - size * 0.22, y - size * 0.18,
  );
  ctx.fill();
  // Pincer arm joint dot
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x - size * 0.42, y - size * 0.22, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Left claw with serrated edges
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.5, y - size * 0.3);
  ctx.lineTo(x - size * 0.55 - clawSnap * size * 0.12, y - size * 0.42);
  ctx.lineTo(x - size * 0.58 - clawSnap * size * 0.1, y - size * 0.5);
  ctx.lineTo(x - size * 0.52, y - size * 0.42);
  ctx.lineTo(x - size * 0.48 + clawSnap * size * 0.08, y - size * 0.35);
  ctx.lineTo(x - size * 0.45, y - size * 0.35);
  ctx.closePath();
  ctx.fill();
  // Claw serrations
  ctx.fillStyle = "#1a1510";
  for (let serr = 0; serr < 3; serr++) {
    ctx.beginPath();
    ctx.moveTo(
      x - size * 0.52 - clawSnap * size * 0.06,
      y - size * 0.38 - serr * size * 0.04,
    );
    ctx.lineTo(
      x - size * 0.55 - clawSnap * size * 0.06,
      y - size * 0.4 - serr * size * 0.04,
    );
    ctx.lineTo(
      x - size * 0.52 - clawSnap * size * 0.06,
      y - size * 0.42 - serr * size * 0.04,
    );
    ctx.fill();
  }

  // Right pincer arm with joint bulge
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.25, y - size * 0.15);
  ctx.bezierCurveTo(
    x + size * 0.32, y - size * 0.16,
    x + size * 0.38, y - size * 0.19,
    x + size * 0.42, y - size * 0.22,
  );
  ctx.bezierCurveTo(
    x + size * 0.44, y - size * 0.24,
    x + size * 0.46, y - size * 0.27,
    x + size * 0.5, y - size * 0.3,
  );
  ctx.lineTo(x + size * 0.45, y - size * 0.35);
  ctx.bezierCurveTo(
    x + size * 0.42, y - size * 0.3,
    x + size * 0.38, y - size * 0.26,
    x + size * 0.35, y - size * 0.23,
  );
  ctx.bezierCurveTo(
    x + size * 0.3, y - size * 0.2,
    x + size * 0.26, y - size * 0.18,
    x + size * 0.22, y - size * 0.18,
  );
  ctx.fill();
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(x + size * 0.42, y - size * 0.22, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  // Right claw
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y - size * 0.3);
  ctx.lineTo(x + size * 0.55 + clawSnap * size * 0.12, y - size * 0.42);
  ctx.lineTo(x + size * 0.58 + clawSnap * size * 0.1, y - size * 0.5);
  ctx.lineTo(x + size * 0.52, y - size * 0.42);
  ctx.lineTo(x + size * 0.48 - clawSnap * size * 0.08, y - size * 0.35);
  ctx.lineTo(x + size * 0.45, y - size * 0.35);
  ctx.closePath();
  ctx.fill();
  // Claw serrations
  ctx.fillStyle = "#1a1510";
  for (let serr = 0; serr < 3; serr++) {
    ctx.beginPath();
    ctx.moveTo(
      x + size * 0.52 + clawSnap * size * 0.06,
      y - size * 0.38 - serr * size * 0.04,
    );
    ctx.lineTo(
      x + size * 0.55 + clawSnap * size * 0.06,
      y - size * 0.4 - serr * size * 0.04,
    );
    ctx.lineTo(
      x + size * 0.52 + clawSnap * size * 0.06,
      y - size * 0.42 - serr * size * 0.04,
    );
    ctx.fill();
  }

  // Articulated segmented tail curving upward
  let tailX = x + size * 0.05;
  let tailY = y + size * 0.2;
  const tailSegments = 7;
  for (let seg = 0; seg < tailSegments; seg++) {
    const segProgress = seg / tailSegments;
    const segSize = size * (0.12 - seg * 0.012);
    const tailCurve = Math.pow(segProgress, 1.5) * Math.PI * 0.6;
    const segSway = tailSway * (1 + seg * 0.15);

    tailX += Math.cos(tailCurve + segSway) * size * 0.08;
    tailY -= Math.sin(tailCurve + segSway) * size * 0.1;

    drawRadialAura(ctx, tailX, tailY, segSize, [
      { offset: 0, color: bodyColorLight },
      { offset: 0.6, color: bodyColor },
      { offset: 1, color: bodyColorDark },
    ]);

    // Segment armor lines
    if (seg > 0) {
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.arc(tailX, tailY, segSize * 0.8, 0, Math.PI);
      ctx.stroke();
    }
  }

  // Venomous stinger bulb
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(
    tailX + size * 0.05,
    tailY - size * 0.03,
    size * 0.08,
    size * 0.06,
    0.5,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Deadly stinger — curved barbed point
  const stingerGrad = ctx.createLinearGradient(
    tailX + size * 0.08, tailY,
    tailX + size * 0.2, tailY - size * 0.15,
  );
  stingerGrad.addColorStop(0, "#4a1a1a");
  stingerGrad.addColorStop(0.5, "#7c2d12");
  stingerGrad.addColorStop(1, "#0a0505");
  ctx.fillStyle = stingerGrad;
  ctx.beginPath();
  ctx.moveTo(tailX + size * 0.08, tailY - size * 0.02);
  ctx.bezierCurveTo(
    tailX + size * 0.11, tailY - size * 0.06,
    tailX + size * 0.14, tailY - size * 0.12,
    tailX + size * 0.2, tailY - size * 0.22,
  );
  ctx.bezierCurveTo(
    tailX + size * 0.18, tailY - size * 0.18,
    tailX + size * 0.15, tailY - size * 0.1,
    tailX + size * 0.12, tailY - size * 0.05,
  );
  ctx.bezierCurveTo(
    tailX + size * 0.1, tailY - size * 0.01,
    tailX + size * 0.09, tailY + size * 0.01,
    tailX + size * 0.08, tailY + size * 0.02,
  );
  ctx.closePath();
  ctx.fill();
  // Stinger barb notch
  ctx.strokeStyle = "#3a0a0a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(tailX + size * 0.14, tailY - size * 0.1);
  ctx.lineTo(tailX + size * 0.16, tailY - size * 0.08);
  ctx.stroke();

  // Venom drip glow
  ctx.fillStyle = `rgba(34, 197, 94, ${0.7 + Math.sin(time * 4) * 0.3})`;
  setShadowBlur(ctx, 8 * zoom, "#22c55e");
  ctx.beginPath();
  ctx.arc(
    tailX + size * 0.19,
    tailY - size * 0.18 + venomDrip * size * 0.05,
    size * 0.025,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Dripping venom
  if (venomDrip > 0.3) {
    ctx.fillStyle = `rgba(34, 197, 94, ${(1 - venomDrip) * 0.8})`;
    ctx.beginPath();
    ctx.ellipse(
      tailX + size * 0.19,
      tailY - size * 0.1 + venomDrip * size * 0.15,
      size * 0.015,
      size * 0.03,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Extended venom drip trail from stinger
  for (let vd = 0; vd < 3; vd++) {
    const vdPhase = (time * 1.5 + vd * 0.6) % 1;
    const vdY = tailY - size * 0.15 + vdPhase * size * 0.3;
    const vdX = tailX + size * 0.19 + Math.sin(time * 2 + vd) * size * 0.01;
    const vdSize = size * (0.018 - vdPhase * 0.01);
    const vdAlpha = (1 - vdPhase) * 0.6;
    ctx.fillStyle = `rgba(34, 197, 94, ${vdAlpha})`;
    ctx.beginPath();
    ctx.ellipse(vdX, vdY, vdSize * 0.6, vdSize, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const vpAlpha = 0.2 + Math.sin(time * 2) * 0.1;
  ctx.fillStyle = `rgba(34, 197, 94, ${vpAlpha})`;
  ctx.beginPath();
  ctx.ellipse(
    tailX + size * 0.15, y + size * 0.32,
    size * 0.06, size * 0.06 * ISO_Y_RATIO, 0, 0, Math.PI * 2,
  );
  ctx.fill();

  // Multiple glowing eyes (8 eyes like a real scorpion)
  ctx.fillStyle = "#1a0505";
  // Central pair
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.28, size * 0.04, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.28, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Side pairs
  ctx.beginPath();
  ctx.arc(x - size * 0.15, y - size * 0.24, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x + size * 0.15, y - size * 0.24, size * 0.025, 0, Math.PI * 2);
  ctx.arc(x - size * 0.18, y - size * 0.2, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.18, y - size * 0.2, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Eye glow
  ctx.fillStyle = `rgba(220, 38, 38, ${0.6 + Math.sin(time * 3) * 0.3})`;
  setShadowBlur(ctx, 6 * zoom, "#dc2626");
  ctx.beginPath();
  ctx.arc(x - size * 0.05, y - size * 0.28, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.05, y - size * 0.28, size * 0.02, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Attack stance venom spray
  if (isAttacking && attackPhase > 0.5) {
    ctx.fillStyle = `rgba(34, 197, 94, ${(attackPhase - 0.5) * 0.5})`;
    for (let spray = 0; spray < 5; spray++) {
      const sprayAngle =
        -Math.PI * 0.3 + spray * 0.15 + Math.sin(time * 10) * 0.1;
      const sprayDist = (attackPhase - 0.5) * 2 * size * 0.4;
      ctx.beginPath();
      ctx.arc(
        tailX + size * 0.2 + Math.cos(sprayAngle) * sprayDist,
        tailY - size * 0.2 + Math.sin(sprayAngle) * sprayDist,
        size * 0.02,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Animated tail tendril overlay
  drawAnimatedTendril(ctx, tailX + size * 0.08, tailY - size * 0.02, -0.8, size, time, zoom, {
    color: bodyColorDark,
    tipColor: "rgba(34, 197, 94, 0.7)",
    length: 0.15,
    width: 0.025,
    segments: 6,
    waveSpeed: 5,
    waveAmt: 0.03,
    tipRadius: 0.012,
  });

  // Scorpion pincers — raised threatening claws
  drawPathArm(ctx, x - size * 0.25, y - size * 0.15, size, time, zoom, -1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    shoulderAngle: 0.6 + Math.sin(time * 2.5) * 0.12 + (isAttacking ? 0.6 : 0),
    elbowAngle: -0.5 + Math.sin(time * 3 + 0.5) * 0.15,
    upperLen: 0.12,
    foreLen: 0.1,
    width: 0.04,
    handColor: bodyColorDark,
    handRadius: 0.03,
    style: 'armored',
  });
  drawPathArm(ctx, x + size * 0.25, y - size * 0.15, size, time, zoom, 1, {
    color: bodyColor,
    colorDark: bodyColorDark,
    shoulderAngle: -0.6 + Math.sin(time * 2.5 + Math.PI) * 0.12 + (isAttacking ? -0.6 : 0),
    elbowAngle: -0.5 + Math.sin(time * 3 + 2) * 0.15,
    upperLen: 0.12,
    foreLen: 0.1,
    width: 0.04,
    handColor: bodyColorDark,
    handRadius: 0.03,
    elbowBend: -0.3,
    attackExtra: isAttacking ? 0.6 : 0,
  });

  // Swirling sand particles
  drawSandDust(ctx, x, y, size * 0.35, time, zoom, {
    color: "rgba(245, 158, 11, 0.4)",
    count: 7,
    speed: 2.2,
    maxAlpha: 0.3,
    spread: 1.0,
  });

  // Floating chitin segments (diamond shape)
  drawShiftingSegments(ctx, x, y - size * 0.05, size, time, zoom, {
    color: bodyColor,
    colorAlt: bodyColorDark,
    count: 6,
    orbitRadius: 0.45,
    segmentSize: 0.035,
    orbitSpeed: 1.2,
    shape: "diamond",
  });

  // Venom glow on stinger tip
  ctx.save();
  const venomPulse = 0.5 + Math.sin(time * 4) * 0.5;
  const stingerGlowX = x + Math.sin(tailSway) * size * 0.15;
  const stingerGlowY = y - size * 0.35;
  const venomGrad = ctx.createRadialGradient(stingerGlowX, stingerGlowY, 0, stingerGlowX, stingerGlowY, size * 0.12);
  venomGrad.addColorStop(0, `rgba(34, 197, 94, ${venomPulse * 0.5})`);
  venomGrad.addColorStop(0.5, `rgba(74, 222, 128, ${venomPulse * 0.25})`);
  venomGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
  ctx.fillStyle = venomGrad;
  ctx.beginPath();
  ctx.arc(stingerGlowX, stingerGlowY, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Heat shimmer distortion on armored body
  ctx.save();
  ctx.globalAlpha = 0.06 + Math.sin(time * 7) * 0.03;
  for (let hs = 0; hs < 3; hs++) {
    const hsOffset = Math.sin(time * 9 + hs * 2) * size * 0.02;
    const hsY = y - size * 0.1 + hs * size * 0.12;
    ctx.fillStyle = "rgba(255, 200, 100, 0.08)";
    ctx.beginPath();
    ctx.ellipse(x + hsOffset, hsY, size * 0.35, size * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // Sand particle swirl at base
  ctx.save();
  for (let sp = 0; sp < 8; sp++) {
    const spAngle = time * 2.5 + sp * (Math.PI * 2 / 8);
    const spDist = size * (0.35 + Math.sin(time * 1.5 + sp) * 0.08);
    const spY = y + size * 0.3 + Math.sin(spAngle * 0.4) * size * 0.03;
    const spAlpha = 0.2 + Math.sin(time * 3 + sp) * 0.1;
    ctx.fillStyle = `rgba(194, 154, 108, ${spAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(spAngle) * spDist, spY,
      size * 0.03, size * 0.015, spAngle, 0, Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();

  // Venom drip trail from stinger
  ctx.save();
  for (let vd = 0; vd < 3; vd++) {
    const vdPhase = (venomDrip + vd * 0.33) % 1;
    const vdX = x + Math.sin(tailSway) * size * 0.15 + Math.sin(vd * 1.8) * size * 0.03;
    const vdY = y - size * 0.35 + vdPhase * size * 0.3;
    const vdAlpha = (1 - vdPhase) * 0.5;
    const vdSize = size * 0.02 * (1 - vdPhase * 0.6);
    const vdGrad = ctx.createRadialGradient(vdX, vdY, 0, vdX, vdY, vdSize);
    vdGrad.addColorStop(0, `rgba(34, 197, 94, ${vdAlpha})`);
    vdGrad.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = vdGrad;
    ctx.beginPath();
    ctx.ellipse(vdX, vdY, vdSize * 0.6, vdSize, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Burrowing sand eruption puffs at feet
  ctx.save();
  for (let bp = 0; bp < 4; bp++) {
    const bpPhase = (time * 1.2 + bp * 0.25) % 1;
    const bpAngle = bp * Math.PI * 0.5 + time * 0.8;
    const bpX = x + Math.cos(bpAngle) * size * 0.25;
    const bpY = y + size * 0.3;
    const bpAlpha = (1 - bpPhase) * 0.2;
    const bpSize = size * (0.03 + bpPhase * 0.05);
    const bpGrad = ctx.createRadialGradient(bpX, bpY - bpPhase * size * 0.08, 0, bpX, bpY - bpPhase * size * 0.08, bpSize);
    bpGrad.addColorStop(0, `rgba(194, 154, 108, ${bpAlpha})`);
    bpGrad.addColorStop(1, "rgba(139, 119, 89, 0)");
    ctx.fillStyle = bpGrad;
    ctx.beginPath();
    ctx.arc(bpX, bpY - bpPhase * size * 0.08, bpSize, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawScarabEnemy(
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
  // SACRED SCARAB - Cursed undying beetle infused with dark pharaonic magic
  const isAttacking = attackPhase > 0;
  const legScuttle = Math.sin(time * 12) * 0.25;
  const wingFlutter = Math.sin(time * 15) * 0.15;
  const runeGlow = 0.5 + Math.sin(time * 3) * 0.5;
  const shimmer = 0.7 + Math.sin(time * 8) * 0.3;
  const hoverFloat = Math.sin(time * 4) * size * 0.03;
  size *= 1.8; // Much larger size

  // Mystical aura
  const auraGrad = ctx.createRadialGradient(
    x,
    y + hoverFloat,
    0,
    x,
    y + hoverFloat,
    size * 0.7,
  );
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${runeGlow * 0.15})`);
  auraGrad.addColorStop(0.5, `rgba(217, 119, 6, ${runeGlow * 0.08})`);
  auraGrad.addColorStop(1, "rgba(180, 83, 9, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y + hoverFloat, size * 0.7, size * 0.7 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();


  // Articulated legs with joints (3 pairs)
  for (let side = -1; side <= 1; side += 2) {
    for (let leg = 0; leg < 3; leg++) {
      const legPhase = legScuttle + leg * 0.8;
      const legBaseX = x + side * (size * 0.08 + leg * size * 0.08);
      const legBaseY = y + size * 0.05 + hoverFloat;
      const legMidX = legBaseX + side * size * 0.15;
      const legMidY = legBaseY + size * 0.08 + Math.sin(legPhase) * size * 0.04;
      const legEndX = legMidX + side * size * 0.12;
      const legEndY = y + size * 0.25;

      // Leg segments
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 3 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(legBaseX, legBaseY);
      ctx.lineTo(legMidX, legMidY);
      ctx.lineTo(legEndX, legEndY);
      ctx.stroke();

      // Leg joints
      ctx.fillStyle = "#1a1510";
      ctx.beginPath();
      ctx.arc(legMidX, legMidY, size * 0.02, 0, Math.PI * 2);
      ctx.fill();

      // Leg spines
      ctx.strokeStyle = "#0a0805";
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(legMidX, legMidY);
      ctx.lineTo(legMidX + side * size * 0.03, legMidY - size * 0.04);
      ctx.stroke();

      // Clawed feet
      ctx.fillStyle = "#0a0805";
      ctx.beginPath();
      ctx.moveTo(legEndX, legEndY);
      ctx.lineTo(legEndX + side * size * 0.03, legEndY + size * 0.02);
      ctx.lineTo(legEndX + side * size * 0.01, legEndY + size * 0.04);
      ctx.fill();
    }
  }

  // Sand dust particles kicked up by legs
  for (let sd = 0; sd < 8; sd++) {
    const sdPhase = (time * 2 + sd * 0.5) % 1;
    const sdSide = sd < 4 ? -1 : 1;
    const sdLeg = sd % 4;
    const sdBaseX = x + sdSide * (size * 0.15 + sdLeg * size * 0.08);
    const sdX = sdBaseX + Math.sin(time * 3 + sd) * size * 0.04;
    const sdY = y + size * 0.25 - sdPhase * size * 0.12;
    const sdSize = size * (0.01 + Math.sin(sd * 1.7) * 0.005) * (1 - sdPhase);
    const sdAlpha = (1 - sdPhase) * 0.4;
    ctx.fillStyle = `rgba(194, 154, 108, ${sdAlpha})`;
    ctx.beginPath();
    ctx.arc(sdX, sdY, sdSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Main carapace with iridescent sheen — bezier shell shape
  const shellGrad = ctx.createRadialGradient(
    x - size * 0.1, y - size * 0.1 + hoverFloat, 0,
    x, y + hoverFloat, size * 0.38,
  );
  shellGrad.addColorStop(0, bodyColorLight);
  shellGrad.addColorStop(0.3, bodyColor);
  shellGrad.addColorStop(0.7, bodyColorDark);
  shellGrad.addColorStop(1, "#1a1510");
  ctx.fillStyle = shellGrad;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.28 + hoverFloat);
  ctx.bezierCurveTo(
    x + size * 0.2, y - size * 0.28 + hoverFloat,
    x + size * 0.38, y - size * 0.15 + hoverFloat,
    x + size * 0.38, y + hoverFloat,
  );
  ctx.bezierCurveTo(
    x + size * 0.38, y + size * 0.15 + hoverFloat,
    x + size * 0.25, y + size * 0.28 + hoverFloat,
    x, y + size * 0.28 + hoverFloat,
  );
  ctx.bezierCurveTo(
    x - size * 0.25, y + size * 0.28 + hoverFloat,
    x - size * 0.38, y + size * 0.15 + hoverFloat,
    x - size * 0.38, y + hoverFloat,
  );
  ctx.bezierCurveTo(
    x - size * 0.38, y - size * 0.15 + hoverFloat,
    x - size * 0.2, y - size * 0.28 + hoverFloat,
    x, y - size * 0.28 + hoverFloat,
  );
  ctx.fill();

  // Wing case split line (center seam)
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.26 + hoverFloat);
  ctx.bezierCurveTo(
    x + size * 0.005, y - size * 0.1 + hoverFloat,
    x - size * 0.005, y + size * 0.1 + hoverFloat,
    x, y + size * 0.26 + hoverFloat,
  );
  ctx.stroke();

  // Shell texture ridges radiating from center
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1 * zoom;
  for (let ridge = 0; ridge < 4; ridge++) {
    const ridgeSpread = (ridge + 1) * 0.07;
    for (let side = -1; side <= 1; side += 2) {
      ctx.beginPath();
      ctx.moveTo(x + side * size * 0.02, y - size * 0.2 + hoverFloat + ridge * size * 0.04);
      ctx.bezierCurveTo(
        x + side * size * ridgeSpread, y - size * 0.1 + hoverFloat,
        x + side * size * (ridgeSpread + 0.03), y + size * 0.05 + hoverFloat,
        x + side * size * ridgeSpread, y + size * 0.18 + hoverFloat - ridge * size * 0.03,
      );
      ctx.stroke();
    }
  }

  // Hieroglyph-like markings on shell
  ctx.strokeStyle = `rgba(251, 191, 36, ${runeGlow * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  // Eye of Horus style mark (left wing)
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y - size * 0.05 + hoverFloat);
  ctx.lineTo(x - size * 0.12, y - size * 0.05 + hoverFloat);
  ctx.lineTo(x - size * 0.12, y + size * 0.02 + hoverFloat);
  ctx.moveTo(x - size * 0.15, y - size * 0.02 + hoverFloat);
  ctx.lineTo(x - size * 0.22, y + size * 0.04 + hoverFloat);
  ctx.stroke();
  // Ankh-like mark (right wing)
  ctx.beginPath();
  ctx.arc(x + size * 0.15, y - size * 0.06 + hoverFloat, size * 0.025, 0, Math.PI * 2);
  ctx.moveTo(x + size * 0.15, y - size * 0.035 + hoverFloat);
  ctx.lineTo(x + size * 0.15, y + size * 0.04 + hoverFloat);
  ctx.moveTo(x + size * 0.12, y + hoverFloat);
  ctx.lineTo(x + size * 0.18, y + hoverFloat);
  ctx.stroke();

  // Wing cases — bezier elytra shapes with natural insect contour
  ctx.fillStyle = bodyColorDark;
  for (const wingSide of [-1, 1] as const) {
    const wOff = wingSide * wingFlutter * size;
    const wCx = x + wingSide * size * 0.1 + wOff;
    const wRx = size * 0.18;
    const wRy = size * 0.24;
    ctx.beginPath();
    ctx.moveTo(wCx, y - wRy + hoverFloat);
    ctx.bezierCurveTo(
      wCx + wingSide * wRx * 0.6, y - wRy * 0.95 + hoverFloat,
      wCx + wingSide * wRx * 1.15, y - wRy * 0.4 + hoverFloat,
      wCx + wingSide * wRx, y + hoverFloat,
    );
    ctx.bezierCurveTo(
      wCx + wingSide * wRx * 0.9, y + wRy * 0.6 + hoverFloat,
      wCx + wingSide * wRx * 0.3, y + wRy + hoverFloat,
      wCx, y + wRy + hoverFloat,
    );
    ctx.bezierCurveTo(
      wCx - wingSide * wRx * 0.25, y + wRy * 0.85 + hoverFloat,
      wCx - wingSide * wRx * 0.4, y + wRy * 0.3 + hoverFloat,
      wCx - wingSide * wRx * 0.15, y - wRy * 0.5 + hoverFloat,
    );
    ctx.bezierCurveTo(
      wCx - wingSide * wRx * 0.05, y - wRy * 0.85 + hoverFloat,
      wCx + wingSide * wRx * 0.1, y - wRy * 0.98 + hoverFloat,
      wCx, y - wRy + hoverFloat,
    );
    ctx.fill();
  }

  // Glowing hieroglyphic runes on wings
  ctx.strokeStyle = `rgba(251, 191, 36, ${runeGlow * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  // Left wing runes
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15 - wingFlutter * size, y - size * 0.1 + hoverFloat);
  ctx.lineTo(x - size * 0.1 - wingFlutter * size, y + hoverFloat);
  ctx.lineTo(x - size * 0.18 - wingFlutter * size, y + size * 0.1 + hoverFloat);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x - size * 0.12 - wingFlutter * size,
    y - size * 0.05 + hoverFloat,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  // Right wing runes
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15 + wingFlutter * size, y - size * 0.1 + hoverFloat);
  ctx.lineTo(x + size * 0.1 + wingFlutter * size, y + hoverFloat);
  ctx.lineTo(x + size * 0.18 + wingFlutter * size, y + size * 0.1 + hoverFloat);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.12 + wingFlutter * size,
    y - size * 0.05 + hoverFloat,
    size * 0.03,
    0,
    Math.PI * 2,
  );
  ctx.stroke();

  // Translucent wings visible beneath
  if (wingFlutter > 0.05) {
    ctx.fillStyle = `rgba(200, 180, 140, ${wingFlutter * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(
      x - size * 0.2,
      y + hoverFloat,
      size * 0.25,
      size * 0.3,
      -0.2,
      0,
      Math.PI * 2,
    );
    ctx.ellipse(
      x + size * 0.2,
      y + hoverFloat,
      size * 0.25,
      size * 0.3,
      0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  // Armored head with horn
  const headGrad = ctx.createLinearGradient(
    x,
    y - size * 0.45 + hoverFloat,
    x,
    y - size * 0.25 + hoverFloat,
  );
  headGrad.addColorStop(0, bodyColorDark);
  headGrad.addColorStop(0.5, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y - size * 0.33 + hoverFloat,
    size * 0.16,
    size * 0.12,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Head crest/horn — curved rhinoceros-beetle style
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.4 + hoverFloat);
  ctx.bezierCurveTo(
    x - size * 0.06, y - size * 0.48 + hoverFloat,
    x - size * 0.02, y - size * 0.56 + hoverFloat,
    x, y - size * 0.58 + hoverFloat,
  );
  ctx.bezierCurveTo(
    x + size * 0.02, y - size * 0.56 + hoverFloat,
    x + size * 0.06, y - size * 0.48 + hoverFloat,
    x + size * 0.08, y - size * 0.4 + hoverFloat,
  );
  ctx.lineTo(x + size * 0.05, y - size * 0.38 + hoverFloat);
  ctx.bezierCurveTo(
    x + size * 0.03, y - size * 0.45 + hoverFloat,
    x - size * 0.03, y - size * 0.45 + hoverFloat,
    x - size * 0.05, y - size * 0.38 + hoverFloat,
  );
  ctx.closePath();
  ctx.fill();
  // Horn ridge line
  ctx.strokeStyle = "#2a2510";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.56 + hoverFloat);
  ctx.lineTo(x, y - size * 0.42 + hoverFloat);
  ctx.stroke();

  // Ornate antennae with fan-like tips
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.08, y - size * 0.4 + hoverFloat);
  ctx.quadraticCurveTo(
    x - size * 0.12,
    y - size * 0.5 + hoverFloat,
    x - size * 0.18,
    y - size * 0.52 + hoverFloat,
  );
  ctx.moveTo(x + size * 0.08, y - size * 0.4 + hoverFloat);
  ctx.quadraticCurveTo(
    x + size * 0.12,
    y - size * 0.5 + hoverFloat,
    x + size * 0.18,
    y - size * 0.52 + hoverFloat,
  );
  ctx.stroke();

  // Antenna fan tips
  ctx.fillStyle = bodyColor;
  for (let fan = 0; fan < 3; fan++) {
    const fanAngle = -0.4 + fan * 0.2;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18, y - size * 0.52 + hoverFloat);
    ctx.lineTo(
      x - size * 0.18 + Math.cos(fanAngle) * size * 0.06,
      y - size * 0.52 + hoverFloat + Math.sin(fanAngle) * size * 0.06,
    );
    ctx.lineTo(
      x - size * 0.18 + Math.cos(fanAngle + 0.1) * size * 0.04,
      y - size * 0.52 + hoverFloat + Math.sin(fanAngle + 0.1) * size * 0.04,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + size * 0.18, y - size * 0.52 + hoverFloat);
    ctx.lineTo(
      x + size * 0.18 + Math.cos(-fanAngle) * size * 0.06,
      y - size * 0.52 + hoverFloat + Math.sin(-fanAngle) * size * 0.06,
    );
    ctx.lineTo(
      x + size * 0.18 + Math.cos(-fanAngle - 0.1) * size * 0.04,
      y - size * 0.52 + hoverFloat + Math.sin(-fanAngle - 0.1) * size * 0.04,
    );
    ctx.fill();
  }

  // Compound eyes with magical glow
  ctx.fillStyle = "#0a0805";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.35 + hoverFloat,
    size * 0.05,
    size * 0.04,
    -0.2,
    0,
    Math.PI * 2,
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.35 + hoverFloat,
    size * 0.05,
    size * 0.04,
    0.2,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Eye glow
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow})`;
  setShadowBlur(ctx, 8 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.35 + hoverFloat,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.arc(
    x + size * 0.08,
    y - size * 0.35 + hoverFloat,
    size * 0.02,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  clearShadow(ctx);

  // Mandibles
  ctx.fillStyle = "#1a1510";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.28 + hoverFloat);
  ctx.lineTo(x - size * 0.08, y - size * 0.22 + hoverFloat);
  ctx.lineTo(x - size * 0.02, y - size * 0.25 + hoverFloat);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.05, y - size * 0.28 + hoverFloat);
  ctx.lineTo(x + size * 0.08, y - size * 0.22 + hoverFloat);
  ctx.lineTo(x + size * 0.02, y - size * 0.25 + hoverFloat);
  ctx.fill();

  // Iridescent shimmer highlights
  ctx.fillStyle = `rgba(255, 240, 200, ${shimmer * 0.4})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.12,
    y - size * 0.08 + hoverFloat,
    size * 0.06,
    size * 0.1,
    -0.4,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.fillStyle = `rgba(200, 255, 220, ${shimmer * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.08,
    y + size * 0.05 + hoverFloat,
    size * 0.04,
    size * 0.08,
    0.3,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // Iridescent color-shifting shell overlay
  const iriPhase = time * 0.8;
  const iriR = Math.round(180 + Math.sin(iriPhase) * 50);
  const iriG = Math.round(160 + Math.sin(iriPhase + 2.1) * 60);
  const iriB = Math.round(100 + Math.sin(iriPhase + 4.2) * 80);
  ctx.fillStyle = `rgba(${iriR}, ${iriG}, ${iriB}, ${shimmer * 0.2})`;
  ctx.beginPath();
  ctx.ellipse(x, y + hoverFloat, size * 0.35, size * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  const bandX = x + Math.sin(time * 1.5) * size * 0.2;
  const bandAlpha = 0.15 + Math.sin(time * 3) * 0.08;
  ctx.fillStyle = `rgba(255, 255, 240, ${bandAlpha})`;
  ctx.beginPath();
  ctx.ellipse(bandX, y + hoverFloat, size * 0.05, size * 0.22, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Floating magical particles
  ctx.fillStyle = `rgba(251, 191, 36, ${runeGlow * 0.7})`;
  for (let p = 0; p < 6; p++) {
    const pAngle = time * 2 + p * 1.05;
    const pDist = size * (0.45 + Math.sin(time * 3 + p) * 0.1);
    const px = x + Math.cos(pAngle) * pDist;
    const py = y + hoverFloat + Math.sin(pAngle * 0.7) * size * 0.2;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // Attack burst effect
  if (isAttacking) {
    ctx.strokeStyle = `rgba(251, 191, 36, ${attackPhase * 0.6})`;
    ctx.lineWidth = 2 * zoom;
    for (let ray = 0; ray < 8; ray++) {
      const rayAngle = ray * (Math.PI / 4) + time * 3;
      const rayLen = attackPhase * size * 0.4;
      ctx.beginPath();
      ctx.moveTo(
        x + Math.cos(rayAngle) * size * 0.3,
        y + hoverFloat + Math.sin(rayAngle) * size * 0.2,
      );
      ctx.lineTo(
        x + Math.cos(rayAngle) * (size * 0.3 + rayLen),
        y + hoverFloat + Math.sin(rayAngle) * (size * 0.2 + rayLen * 0.6),
      );
      ctx.stroke();
    }
  }

  // Armored scuttling appendages — path-based with chitin plates
  drawPathLegs(ctx, x, y + size * 0.15 + hoverFloat, size, time, zoom, {
    color: bodyColorDark,
    colorDark: "#0a0805",
    footColor: "#1a1510",
    strideSpeed: 12,
    strideAmt: 0.2,
    legLen: 0.12,
    width: 0.03,
    shuffle: true,
    style: 'armored',
  });

  // Mandible animations (animated tendrils)
  drawAnimatedTendril(ctx, x - size * 0.05, y - size * 0.28 + hoverFloat, -1.8, size, time, zoom, {
    color: "#1a1510",
    tipColor: bodyColorDark,
    length: 0.1,
    width: 0.02,
    segments: 4,
    waveSpeed: 6,
    waveAmt: 0.02,
    tipRadius: 0.01,
  });
  drawAnimatedTendril(ctx, x + size * 0.05, y - size * 0.28 + hoverFloat, -1.3, size, time, zoom, {
    color: "#1a1510",
    tipColor: bodyColorDark,
    length: 0.1,
    width: 0.02,
    segments: 4,
    waveSpeed: 6,
    waveAmt: 0.02,
    tipRadius: 0.01,
  });

  // Emerald/gold sand dust
  drawSandDust(ctx, x, y + hoverFloat, size * 0.35, time, zoom, {
    color: "rgba(52, 211, 153, 0.4)",
    count: 9,
    speed: 2.0,
    maxAlpha: 0.3,
    spread: 1.3,
  });
  drawSandDust(ctx, x, y + hoverFloat, size * 0.25, time, zoom, {
    color: "rgba(251, 191, 36, 0.35)",
    count: 5,
    speed: 1.5,
    maxAlpha: 0.25,
    spread: 0.9,
    particleSize: 0.04,
  });

  // Floating wing case segments
  drawShiftingSegments(ctx, x, y + hoverFloat, size, time, zoom, {
    color: bodyColor,
    colorAlt: bodyColorLight,
    count: 5,
    orbitRadius: 0.42,
    segmentSize: 0.035,
    orbitSpeed: 1.5,
    shape: "shard",
  });

  // Floating wing case accent pieces
  drawFloatingPiece(ctx, x - size * 0.35, y - size * 0.05 + hoverFloat, size, time, 0, {
    width: 0.08,
    height: 0.05,
    color: bodyColorDark,
    colorEdge: "#1a1510",
    bobSpeed: 3,
    bobAmt: 0.025,
  });
  drawFloatingPiece(ctx, x + size * 0.35, y - size * 0.05 + hoverFloat, size, time, Math.PI, {
    width: 0.08,
    height: 0.05,
    color: bodyColorDark,
    colorEdge: "#1a1510",
    bobSpeed: 3,
    bobAmt: 0.025,
  });

  // Mystical golden rune particles orbiting scarab
  ctx.save();
  for (let rp = 0; rp < 6; rp++) {
    const rpAngle = time * 1.5 + rp * Math.PI * 0.333;
    const rpDist = size * (0.3 + Math.sin(time * 2 + rp * 1.5) * 0.08);
    const rpX = x + Math.cos(rpAngle) * rpDist;
    const rpY = y + hoverFloat - size * 0.05 + Math.sin(rpAngle * 0.7) * size * 0.15;
    const rpAlpha = 0.3 + Math.sin(time * 4 + rp * 2) * 0.2;
    const rpGrad = ctx.createRadialGradient(rpX, rpY, 0, rpX, rpY, size * 0.025);
    rpGrad.addColorStop(0, `rgba(251, 191, 36, ${rpAlpha})`);
    rpGrad.addColorStop(1, `rgba(217, 119, 6, 0)`);
    ctx.fillStyle = rpGrad;
    ctx.beginPath();
    ctx.arc(rpX, rpY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Heat shimmer haze rising from scarab shell
  ctx.save();
  for (let hz = 0; hz < 4; hz++) {
    const hzWave = Math.sin(time * 8 + hz * 2.2) * size * 0.03;
    const hzY = y + hoverFloat - size * 0.15 - hz * size * 0.08;
    const hzAlpha = 0.04 - hz * 0.008;
    ctx.fillStyle = `rgba(255, 220, 150, ${hzAlpha})`;
    ctx.beginPath();
    ctx.ellipse(x + hzWave, hzY, size * (0.25 - hz * 0.04), size * 0.02, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Ancient golden hieroglyph projections orbiting
  ctx.save();
  for (let hg = 0; hg < 4; hg++) {
    const hgAngle = time * 0.8 + hg * Math.PI * 0.5;
    const hgDist = size * (0.35 + Math.sin(time * 1.5 + hg) * 0.05);
    const hgX = x + Math.cos(hgAngle) * hgDist;
    const hgY = y + hoverFloat - size * 0.1 + Math.sin(hgAngle * 0.6) * size * 0.12;
    const hgAlpha = 0.12 + Math.sin(time * 3 + hg * 2) * 0.08;
    ctx.strokeStyle = `rgba(251, 191, 36, ${hgAlpha})`;
    ctx.lineWidth = 1 * zoom;
    const hgSize = size * 0.04;
    ctx.beginPath();
    ctx.moveTo(hgX - hgSize, hgY);
    ctx.lineTo(hgX, hgY - hgSize);
    ctx.lineTo(hgX + hgSize, hgY);
    ctx.lineTo(hgX, hgY + hgSize);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hgX - hgSize * 0.5, hgY);
    ctx.lineTo(hgX + hgSize * 0.5, hgY);
    ctx.moveTo(hgX, hgY - hgSize * 0.5);
    ctx.lineTo(hgX, hgY + hgSize * 0.5);
    ctx.stroke();
  }
  ctx.restore();

  // Sand particle wake trail at base
  ctx.save();
  for (let wake = 0; wake < 6; wake++) {
    const wakePhase = (time * 0.5 + wake * 0.167) % 1;
    const wakeX = x + (wake - 2.5) * size * 0.08 + Math.sin(time + wake) * size * 0.02;
    const wakeY = y + size * 0.35 + hoverFloat + wakePhase * size * 0.06;
    const wakeAlpha = (1 - wakePhase) * 0.2;
    ctx.fillStyle = `rgba(194, 154, 108, ${wakeAlpha})`;
    ctx.beginPath();
    ctx.ellipse(wakeX, wakeY, size * 0.02, size * 0.01, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Golden sand swirl trail
  ctx.save();
  for (let gs = 0; gs < 5; gs++) {
    const gsPhase = (time * 0.6 + gs * 0.2) % 1;
    const gsX = x + Math.sin(time * 1.8 + gs * 2.5) * size * 0.2;
    const gsY = y + size * 0.35 + hoverFloat;
    const gsAlpha = (1 - gsPhase) * 0.25;
    ctx.fillStyle = `rgba(251, 191, 36, ${gsAlpha})`;
    ctx.beginPath();
    ctx.arc(gsX + gsPhase * size * 0.15, gsY, size * 0.015 * (1 - gsPhase), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Swarm speed: blur streaks behind body
  ctx.save();
  for (let bs = 0; bs < 3; bs++) {
    const bsAlpha = [0.12, 0.08, 0.05][bs];
    const bsOff = (bs + 1) * size * 0.1 + Math.sin(time * 6 + bs * 1.5) * size * 0.015;
    ctx.strokeStyle = `rgba(251, 191, 36, ${bsAlpha})`;
    ctx.lineWidth = (2 - bs * 0.5) * zoom;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.2 + bsOff, y + hoverFloat + (bs - 1) * size * 0.06);
    ctx.lineTo(x + size * 0.45 + bsOff, y + hoverFloat + (bs - 1) * size * 0.06);
    ctx.stroke();
  }
  ctx.restore();

  // Swarm speed: scurrying leg blur (rapid-motion ghost legs)
  ctx.save();
  for (let lb = 0; lb < 4; lb++) {
    const lbSide = lb < 2 ? -1 : 1;
    const lbIdx = lb % 2;
    const lbPhase = Math.sin(time * 18 + lb * 1.8);
    const lbX = x + lbSide * (size * 0.15 + lbIdx * size * 0.08) + lbPhase * size * 0.02;
    const lbY = y + size * 0.2 + hoverFloat;
    ctx.globalAlpha = 0.12 + lbPhase * 0.04;
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(lbX, lbY);
    ctx.lineTo(lbX + lbSide * size * 0.04, lbY + size * 0.06 + lbPhase * size * 0.02);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}
