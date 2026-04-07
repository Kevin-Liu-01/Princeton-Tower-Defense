// Princeton Tower Defense - Elemental/Nature Enemy Sprite Functions
// Extracted from enemies/index.ts

import { ISO_Y_RATIO } from "../../constants/isometric";
import type { MapTheme } from "../../types";
import { setShadowBlur, clearShadow } from "../performance";
import {
  drawPulsingGlowRings,
  drawLeafSwirl,
  drawSandDust,
  drawFrostCrystals,
  drawEmberSparks,
  drawShadowWisps,
  drawShiftingSegments,
  drawOrbitingDebris,
  drawAnimatedTendril,
  drawFloatingPiece,
} from "./animationHelpers";
import { drawPathArm, drawPathLegs } from "./darkFantasyHelpers";
import { getRegionMaterials, drawRegionBodyAccent } from "./regionVariants";

export function drawThornwalkerEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const isAttacking = attackPhase > 0;
  const leafPulse = 0.5 + Math.sin(time * 3) * 0.3;
  const heartbeat = Math.sin(time * 4);
  const heartbeatPulse = heartbeat > 0.8 ? (heartbeat - 0.8) * 5 : 0;
  const thornExtend = isAttacking ? attackPhase * 0.6 : 0;

  // Twisted roots gripping the ground
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 3 * zoom;
  for (let r = 0; r < 6; r++) {
    const rootAngle = -Math.PI * 0.85 + r * Math.PI * 0.34;
    const rootWiggle = Math.sin(time * 2 + r) * size * 0.05;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.4);
    ctx.quadraticCurveTo(
      x + Math.cos(rootAngle) * size * 0.3 + rootWiggle,
      y + size * 0.5,
      x + Math.cos(rootAngle) * size * 0.55,
      y + size * 0.55 + Math.sin(time * 3 + r) * size * 0.03
    );
    ctx.stroke();
    // Root knuckles gripping ground
    ctx.fillStyle = bodyColorDark;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(rootAngle) * size * 0.55,
      y + size * 0.55 + Math.sin(time * 3 + r) * size * 0.03,
      size * 0.025,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Root fork splitting at ground level
    const forkX = x + Math.cos(rootAngle) * size * 0.55;
    const forkY = y + size * 0.55 + Math.sin(time * 3 + r) * size * 0.03;
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(forkX, forkY);
    ctx.bezierCurveTo(
      forkX + Math.cos(rootAngle - 0.4) * size * 0.06,
      forkY + size * 0.02,
      forkX + Math.cos(rootAngle - 0.6) * size * 0.1,
      forkY + size * 0.01,
      forkX + Math.cos(rootAngle - 0.7) * size * 0.12,
      forkY + size * 0.04
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(forkX, forkY);
    ctx.bezierCurveTo(
      forkX + Math.cos(rootAngle + 0.4) * size * 0.06,
      forkY + size * 0.025,
      forkX + Math.cos(rootAngle + 0.6) * size * 0.1,
      forkY + size * 0.015,
      forkX + Math.cos(rootAngle + 0.7) * size * 0.12,
      forkY + size * 0.045
    );
    ctx.stroke();
  }

  // Root pulling motion lines
  ctx.strokeStyle = "rgba(22, 101, 52, 0.2)";
  ctx.lineWidth = 1 * zoom;
  for (let pl = 0; pl < 4; pl++) {
    const plAngle = -Math.PI * 0.7 + pl * Math.PI * 0.45;
    const plx = x + Math.cos(plAngle) * size * 0.6;
    const ply = y + size * 0.55;
    ctx.beginPath();
    ctx.moveTo(plx, ply);
    ctx.lineTo(plx + size * 0.08, ply + size * 0.02);
    ctx.stroke();
  }

  // Regeneration healing particles rising
  for (let rp = 0; rp < 8; rp++) {
    const rpPhase = (time * 0.8 + rp * 0.125) % 1;
    const rpx =
      x - size * 0.25 + rp * size * 0.07 + Math.sin(time + rp) * size * 0.05;
    const rpy = y + size * 0.3 - rpPhase * size * 0.8;
    const rpAlpha = Math.sin(rpPhase * Math.PI) * 0.5;
    const rpSize = size * 0.015 + Math.sin(rpPhase * Math.PI) * size * 0.01;
    ctx.fillStyle = `rgba(74, 222, 128, ${rpAlpha})`;
    ctx.beginPath();
    ctx.arc(rpx, rpy, rpSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Regeneration glow aura
  setShadowBlur(ctx, 4 * zoom, "rgba(74, 222, 128, 0.3)");
  ctx.strokeStyle = `rgba(74, 222, 128, ${0.08 + Math.sin(time * 2) * 0.04})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y,
    size * 0.42 + Math.sin(time * 2) * size * 0.03,
    size * 0.52 + Math.sin(time * 2) * size * 0.03,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  clearShadow(ctx);

  // Animated vine tendrils (nature arms)
  for (const side of [-1, 1] as const) {
    drawAnimatedTendril(
      ctx,
      x + side * size * 0.2,
      y - size * 0.1,
      side * -1.2,
      size,
      time,
      zoom,
      {
        color: "#22c55e",
        length: 0.35,
        segments: 10,
        tipColor: "#84cc16",
        tipRadius: 0.018,
        waveAmt: 0.08,
        waveSpeed: 3,
        width: 0.025,
      }
    );
  }

  // Main trunk body
  const trunkGrad = ctx.createLinearGradient(
    x - size * 0.25,
    y,
    x + size * 0.25,
    y
  );
  trunkGrad.addColorStop(0, bodyColorDark);
  trunkGrad.addColorStop(0.5, bodyColor);
  trunkGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y + size * 0.4);
  ctx.quadraticCurveTo(x - size * 0.3, y, x - size * 0.15, y - size * 0.4);
  ctx.quadraticCurveTo(x, y - size * 0.55, x + size * 0.15, y - size * 0.4);
  ctx.quadraticCurveTo(x + size * 0.3, y, x + size * 0.2, y + size * 0.4);
  ctx.closePath();
  ctx.fill();

  // Detailed bark texture with varied lines
  ctx.strokeStyle = "rgba(50, 30, 20, 0.4)";
  ctx.lineWidth = 1 * zoom;
  for (let b = 0; b < 7; b++) {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.15 + b * size * 0.05, y + size * 0.3);
    ctx.quadraticCurveTo(
      x - size * 0.14 + b * size * 0.05 + Math.sin(b * 1.5) * size * 0.02,
      y + size * 0.05,
      x - size * 0.12 + b * size * 0.045,
      y - size * 0.25
    );
    ctx.stroke();
  }
  // Horizontal bark cracks
  ctx.strokeStyle = "rgba(40, 25, 15, 0.3)";
  for (let bc = 0; bc < 4; bc++) {
    const bcy = y - size * 0.15 + bc * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.18 + Math.sin(bc) * size * 0.03, bcy);
    ctx.lineTo(
      x + size * 0.18 - Math.sin(bc + 1) * size * 0.03,
      bcy + size * 0.02
    );
    ctx.stroke();
  }

  // Knotholes in bark
  for (let kh = 0; kh < 3; kh++) {
    const khx = x - size * 0.08 + kh * size * 0.08;
    const khy = y + size * 0.05 + Math.sin(kh * 2.5) * size * 0.12;
    ctx.fillStyle = "rgba(30, 18, 10, 0.6)";
    ctx.beginPath();
    ctx.ellipse(
      khx,
      khy,
      size * 0.025,
      size * 0.035,
      Math.sin(kh) * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Knothole ring
    ctx.strokeStyle = "rgba(60, 40, 25, 0.4)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      khx,
      khy,
      size * 0.03,
      size * 0.04,
      Math.sin(kh) * 0.3,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Moss patches on trunk
  for (let ms = 0; ms < 4; ms++) {
    const msx = x - size * 0.15 + ms * size * 0.1;
    const msy = y + size * 0.05 + Math.sin(ms * 3) * size * 0.15;
    ctx.fillStyle = `rgba(60, 130, 50, ${0.35 + Math.sin(ms * 2) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      msx,
      msy,
      size * 0.04 + Math.sin(ms) * size * 0.01,
      size * 0.025,
      ms * 0.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Moss texture dots
    for (let md = 0; md < 3; md++) {
      ctx.fillStyle = `rgba(50, 150, 40, ${0.3 + md * 0.1})`;
      ctx.beginPath();
      ctx.arc(
        msx + (md - 1) * size * 0.015,
        msy + Math.sin(md) * size * 0.008,
        size * 0.008,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Mushrooms growing on trunk
  for (let mu = 0; mu < 3; mu++) {
    const muSide = mu === 0 ? -1 : mu === 1 ? 1 : -1;
    const muY = y - size * 0.1 + mu * size * 0.18;
    const muX = x + muSide * size * 0.2;
    ctx.save();
    ctx.translate(muX, muY);
    ctx.rotate(muSide * 0.3);
    // Mushroom stem
    ctx.fillStyle = "rgba(210, 190, 160, 0.8)";
    ctx.fillRect(-size * 0.012, 0, size * 0.024, size * 0.05);
    // Mushroom cap
    ctx.fillStyle =
      mu === 2 ? "rgba(200, 80, 80, 0.75)" : "rgba(180, 140, 100, 0.8)";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.04, size * 0.025, 0, Math.PI, 0);
    ctx.fill();
    // Cap spots
    if (mu === 2) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(-size * 0.015, -size * 0.01, size * 0.007, 0, Math.PI * 2);
      ctx.arc(size * 0.01, -size * 0.015, size * 0.005, 0, Math.PI * 2);
      ctx.fill();
    }
    // Mushroom gills
    ctx.strokeStyle = "rgba(150, 120, 80, 0.4)";
    ctx.lineWidth = 0.5 * zoom;
    for (let g = 0; g < 3; g++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.025 + g * size * 0.015, size * 0.003);
      ctx.lineTo(-size * 0.02 + g * size * 0.012, size * 0.015);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Branch-like arms reaching outward with smaller thorns
  for (let arm = -1; arm <= 1; arm += 2) {
    const armAngle = arm * 0.6 + Math.sin(time * 1.5) * 0.1;
    ctx.save();
    ctx.translate(x + arm * size * 0.18, y - size * 0.15);
    ctx.rotate(armAngle);
    // Main branch
    ctx.strokeStyle = bodyColor;
    ctx.lineWidth = 4 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      size * 0.15 * arm,
      -size * 0.05 + Math.sin(time * 2) * size * 0.02,
      size * 0.3 * arm,
      -size * 0.08
    );
    ctx.stroke();
    // Branch bark texture
    ctx.strokeStyle = "rgba(50, 30, 20, 0.3)";
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.05 * arm, -size * 0.01);
    ctx.lineTo(size * 0.2 * arm, -size * 0.05);
    ctx.stroke();
    // Small thorns on branch
    for (let bt = 0; bt < 3; bt++) {
      const btDist = size * 0.08 + bt * size * 0.08;
      ctx.fillStyle = "#2d3a1a";
      ctx.save();
      ctx.translate(btDist * arm, -size * 0.03 - bt * size * 0.015);
      ctx.rotate(arm * -0.8 + bt * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 0.01, size * 0.04);
      ctx.lineTo(0, size * 0.08);
      ctx.lineTo(size * 0.01, size * 0.04);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // Branch sub-branches
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.2 * arm, -size * 0.06);
    ctx.lineTo(
      size * 0.28 * arm,
      -size * 0.15 + Math.sin(time * 3) * size * 0.02
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.25 * arm, -size * 0.07);
    ctx.lineTo(
      size * 0.32 * arm,
      -size * 0.03 + Math.sin(time * 2.5 + 1) * size * 0.02
    );
    ctx.stroke();
    // Leaf cluster at branch shoulder (joint)
    ctx.save();
    ctx.translate(size * 0.11 * arm, -size * 0.035);
    ctx.rotate(arm * 0.55 + Math.sin(time * 2) * 0.08);
    ctx.fillStyle = `rgba(40, 130, 60, ${0.42 + leafPulse * 0.28})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      size * 0.042 * arm,
      -size * 0.03,
      size * 0.08 * arm,
      0
    );
    ctx.quadraticCurveTo(size * 0.04 * arm, size * 0.034, 0, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(25, 85, 38, 0.5)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      size * 0.042 * arm,
      -size * 0.03,
      size * 0.08 * arm,
      0
    );
    ctx.quadraticCurveTo(size * 0.04 * arm, size * 0.034, 0, 0);
    ctx.stroke();
    ctx.restore();
    // Leaf pair at sub-branch fork
    for (const fork of [0.22, 0.28] as const) {
      ctx.save();
      ctx.translate(fork * size * arm, -size * 0.06 - fork * size * 0.04);
      ctx.rotate(arm * 0.9 + fork * 0.6);
      ctx.fillStyle = `rgba(34, 160, 72, ${0.38 + leafPulse * 0.22})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        size * 0.02 * arm,
        -size * 0.035,
        size * 0.06 * arm,
        -size * 0.02,
        size * 0.07 * arm,
        0
      );
      ctx.bezierCurveTo(
        size * 0.05 * arm,
        size * 0.028,
        size * 0.02 * arm,
        size * 0.022,
        0,
        0
      );
      ctx.fill();
      ctx.strokeStyle = "rgba(20, 100, 45, 0.45)";
      ctx.lineWidth = 0.55 * zoom;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // Trunk shoulder leaf clusters at upper curve branch points
  for (const side of [-1, 1] as const) {
    const sx = x + side * size * 0.14;
    const sy = y - size * 0.38;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(side * 0.65 + Math.sin(time * 1.8) * 0.12);
    ctx.fillStyle = `rgba(36, 140, 62, ${0.4 + leafPulse * 0.2})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      side * size * 0.05,
      -size * 0.026,
      side * size * 0.1,
      0
    );
    ctx.quadraticCurveTo(side * size * 0.048, size * 0.03, 0, 0);
    ctx.fill();
    ctx.strokeStyle = "rgba(22, 95, 42, 0.5)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      side * size * 0.05,
      -size * 0.026,
      side * size * 0.1,
      0
    );
    ctx.quadraticCurveTo(side * size * 0.048, size * 0.03, 0, 0);
    ctx.stroke();
    ctx.restore();
  }

  // Thorns protruding (extend during attack)
  ctx.fillStyle = "#2d3a1a";
  for (let t = 0; t < 10; t++) {
    const thornAngle = Math.PI * 0.25 + t * Math.PI * 0.2;
    const thornDist = size * 0.28;
    const tx = x + Math.cos(thornAngle) * thornDist;
    const ty = y - size * 0.15 + Math.sin(thornAngle * 0.5) * size * 0.35;
    const thornLen = size * (0.15 + thornExtend * 0.12);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(thornAngle + Math.PI * 0.5);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size * 0.02, thornLen * 0.55);
    ctx.lineTo(0, thornLen);
    ctx.lineTo(size * 0.02, thornLen * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Dark sap dripping from thorn wounds
  for (let sd = 0; sd < 5; sd++) {
    const sdAngle = Math.PI * 0.35 + sd * Math.PI * 0.25;
    const sdx = x + Math.cos(sdAngle) * size * 0.27;
    const sdy = y - size * 0.1 + Math.sin(sdAngle * 0.5) * size * 0.3;
    const sapDrip = ((time * 1.2 + sd * 0.2) % 1) * size * 0.15;
    const sapAlpha = 1 - ((time * 1.2 + sd * 0.2) % 1);
    ctx.fillStyle = `rgba(40, 30, 10, ${sapAlpha * 0.6})`;
    ctx.beginPath();
    ctx.ellipse(
      sdx,
      sdy + sapDrip,
      size * 0.01,
      size * 0.02 + sapDrip * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Winding vines
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 2.5 * zoom;
  for (let v = 0; v < 3; v++) {
    ctx.beginPath();
    const vStartX = x + (v - 1) * size * 0.15;
    ctx.moveTo(vStartX, y);
    for (let vp = 0; vp < 5; vp++) {
      const vpx = vStartX + Math.sin(time * 2 + v + vp) * size * 0.1;
      const vpy = y - size * 0.1 - vp * size * 0.13;
      ctx.lineTo(vpx, vpy);
    }
    ctx.stroke();
    // Vine body thorns: small triangles along each segment, angled outward from stem
    for (let vp = 0; vp < 5; vp++) {
      const vpx = vStartX + Math.sin(time * 2 + v + vp) * size * 0.1;
      const vpy = y - size * 0.1 - vp * size * 0.13;
      const vpxN = vStartX + Math.sin(time * 2 + v + vp + 1) * size * 0.1;
      const vpyN = y - size * 0.1 - (vp + 1) * size * 0.13;
      const stemAng = Math.atan2(vpyN - vpy, vpxN - vpx);
      const outAng =
        stemAng + (v % 2 === 0 ? 1 : -1) * (Math.PI * 0.42 + vp * 0.08);
      const thLen = size * 0.038 * (1 + thornExtend * 0.35);
      ctx.fillStyle = "#1a2412";
      ctx.save();
      ctx.translate(vpx, vpy);
      ctx.rotate(outAng + Math.PI * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 0.01, thLen * 0.55);
      ctx.lineTo(0, thLen);
      ctx.lineTo(size * 0.01, thLen * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // Leaf clusters at vine joints (bezier leaf outlines)
    for (const vp of [1, 3]) {
      const jx = vStartX + Math.sin(time * 2 + v + vp) * size * 0.1;
      const jy = y - size * 0.1 - vp * size * 0.13;
      const lean = Math.sin(time * 1.5 + v + vp) * 0.35;
      ctx.save();
      ctx.translate(jx, jy);
      ctx.rotate(lean + v * 0.4);
      ctx.fillStyle = `rgba(34, 120, 55, ${0.45 + leafPulse * 0.25})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.045, -size * 0.028, size * 0.09, 0);
      ctx.quadraticCurveTo(size * 0.045, size * 0.032, 0, 0);
      ctx.fill();
      ctx.strokeStyle = "rgba(22, 90, 40, 0.55)";
      ctx.lineWidth = 0.65 * zoom;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.045, -size * 0.028, size * 0.09, 0);
      ctx.quadraticCurveTo(size * 0.045, size * 0.032, 0, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(size * 0.02, -size * 0.008);
      ctx.quadraticCurveTo(size * 0.055, 0, size * 0.02, size * 0.01);
      ctx.stroke();
      ctx.restore();
    }
    // Vine tendrils curling at tips
    const tipX = vStartX + Math.sin(time * 2 + v + 4) * size * 0.1;
    const tipY = y - size * 0.1 - 4 * size * 0.13;
    ctx.strokeStyle = "rgba(34, 197, 94, 0.6)";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(tipX + size * 0.03, tipY, size * 0.03, Math.PI * 0.5, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2.5 * zoom;
  }

  // Leaves with animation
  for (let l = 0; l < 8; l++) {
    const leafAngle = time * 0.5 + l * Math.PI * 0.25;
    const leafDist = size * 0.35 + Math.sin(time * 2 + l) * size * 0.08;
    const lx = x + Math.cos(leafAngle) * leafDist * 0.8;
    const ly = y - size * 0.2 + Math.sin(leafAngle) * leafDist * 0.5;
    const leafScatter = isAttacking ? attackPhase * size * 0.15 : 0;
    ctx.save();
    ctx.translate(
      lx + Math.cos(leafAngle) * leafScatter,
      ly + Math.sin(leafAngle) * leafScatter
    );
    ctx.rotate(
      leafAngle +
        Math.sin(time * 3 + l) * 0.2 +
        (isAttacking ? attackPhase * 2 : 0)
    );
    ctx.fillStyle = `rgba(34, 197, 94, ${leafPulse + 0.3})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.05, -size * 0.04, size * 0.1, 0);
    ctx.quadraticCurveTo(size * 0.05, size * 0.04, 0, 0);
    ctx.fill();
    // Leaf vein
    ctx.strokeStyle = "rgba(22, 101, 52, 0.6)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.08, 0);
    ctx.stroke();
    // Secondary veins
    ctx.beginPath();
    ctx.moveTo(size * 0.04, 0);
    ctx.lineTo(size * 0.06, -size * 0.015);
    ctx.moveTo(size * 0.04, 0);
    ctx.lineTo(size * 0.06, size * 0.015);
    ctx.stroke();
    ctx.restore();
  }

  // Pollen particles drifting in the wind
  for (let pp = 0; pp < 6; pp++) {
    const ppPhase = (time * 0.6 + pp * 0.167) % 1;
    const ppx =
      x -
      size * 0.5 +
      ppPhase * size * 1.2 +
      Math.sin(time * 2 + pp) * size * 0.1;
    const ppy = y - size * 0.4 + Math.sin(time * 1.5 + pp * 2) * size * 0.2;
    const ppAlpha = Math.sin(ppPhase * Math.PI) * 0.4;
    ctx.fillStyle = `rgba(250, 220, 80, ${ppAlpha})`;
    ctx.beginPath();
    ctx.arc(ppx, ppy, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bark texture lines across the face
  ctx.strokeStyle = "rgba(50, 30, 20, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  for (let ft = 0; ft < 3; ft++) {
    const ftx = x - size * 0.04 + ft * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(ftx, y - size * 0.38);
    ctx.bezierCurveTo(
      ftx + size * 0.01,
      y - size * 0.32,
      ftx - size * 0.015,
      y - size * 0.22,
      ftx + size * 0.008,
      y - size * 0.15
    );
    ctx.stroke();
  }

  // Face / head bark grain (curved strokes) and knothole-style eye hollows
  ctx.strokeStyle = "rgba(42, 28, 18, 0.55)";
  ctx.lineWidth = 1 * zoom;
  for (let fb = 0; fb < 5; fb++) {
    const fbx = x - size * 0.14 + fb * size * 0.07;
    ctx.beginPath();
    ctx.moveTo(fbx, y - size * 0.06);
    ctx.quadraticCurveTo(
      fbx + Math.sin(fb * 1.4 + time * 0.5) * size * 0.025,
      y - size * 0.22,
      fbx + size * 0.02,
      y - size * 0.38
    );
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(55, 35, 22, 0.45)";
  ctx.lineWidth = 0.85 * zoom;
  for (let fh = 0; fh < 3; fh++) {
    const fhy = y - size * 0.32 + fh * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.16, fhy);
    ctx.quadraticCurveTo(
      x + Math.sin(fh * 2.1) * size * 0.02,
      fhy - size * 0.025,
      x + size * 0.16,
      fhy + size * 0.015
    );
    ctx.stroke();
  }
  const knotholeEyeRX = size * 0.052;
  const knotholeEyeRY = size * 0.072;
  for (const side of [-1, 1] as const) {
    const kx = x + side * size * 0.08;
    const ky = y - size * 0.25;
    ctx.fillStyle = "rgba(24, 14, 8, 0.88)";
    ctx.beginPath();
    ctx.ellipse(
      kx,
      ky,
      knotholeEyeRX,
      knotholeEyeRY,
      side * 0.12,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = "rgba(72, 48, 30, 0.65)";
    ctx.lineWidth = 1.1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      kx,
      ky,
      knotholeEyeRX + size * 0.008,
      knotholeEyeRY + size * 0.01,
      side * 0.12,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.strokeStyle = "rgba(35, 22, 14, 0.5)";
    ctx.lineWidth = 0.6 * zoom;
    ctx.beginPath();
    ctx.moveTo(kx - knotholeEyeRX * 0.5, ky - knotholeEyeRY * 0.3);
    ctx.quadraticCurveTo(
      kx,
      ky - knotholeEyeRY * 0.15,
      kx + knotholeEyeRX * 0.45,
      ky
    );
    ctx.stroke();
  }

  // Face carved into trunk - Eyes with heartbeat pulsation
  const eyeScale = 1 + heartbeatPulse * 0.3;
  setShadowBlur(ctx, (6 + heartbeatPulse * 6) * zoom, "#84cc16");
  ctx.fillStyle = `rgba(132, 204, 22, ${leafPulse + 0.4 + heartbeatPulse * 0.3})`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08,
    y - size * 0.25,
    size * 0.04 * eyeScale,
    size * 0.06 * eyeScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08,
    y - size * 0.25,
    size * 0.04 * eyeScale,
    size * 0.06 * eyeScale,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);

  // Eye pupils
  ctx.fillStyle = "rgba(10, 40, 5, 0.7)";
  ctx.beginPath();
  ctx.arc(x - size * 0.08, y - size * 0.25, size * 0.02, 0, Math.PI * 2);
  ctx.arc(x + size * 0.08, y - size * 0.25, size * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Brow ridges
  ctx.strokeStyle = "rgba(50, 30, 20, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08,
    y - size * 0.25,
    size * 0.06,
    Math.PI * 1.1,
    Math.PI * 1.9
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.08,
    y - size * 0.25,
    size * 0.06,
    Math.PI * 1.1,
    Math.PI * 1.9
  );
  ctx.stroke();

  // Mouth - jagged opening
  ctx.fillStyle = "#0a0505";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.08);
  ctx.lineTo(x - size * 0.05, y - size * 0.12);
  ctx.lineTo(x, y - size * 0.08);
  ctx.lineTo(x + size * 0.05, y - size * 0.12);
  ctx.lineTo(x + size * 0.1, y - size * 0.08);
  ctx.lineTo(x + size * 0.05, y - size * 0.02);
  ctx.lineTo(x, y - size * 0.06);
  ctx.lineTo(x - size * 0.05, y - size * 0.02);
  ctx.closePath();
  ctx.fill();

  // Inner mouth glow
  ctx.fillStyle = `rgba(74, 222, 128, ${0.15 + Math.sin(time * 3) * 0.1})`;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, y - size * 0.08);
  ctx.lineTo(x - size * 0.03, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.08);
  ctx.lineTo(x + size * 0.03, y - size * 0.1);
  ctx.lineTo(x + size * 0.06, y - size * 0.08);
  ctx.lineTo(x + size * 0.03, y - size * 0.04);
  ctx.lineTo(x, y - size * 0.065);
  ctx.lineTo(x - size * 0.03, y - size * 0.04);
  ctx.closePath();
  ctx.fill();

  // Fireflies / bioluminescent insects orbiting
  for (let ff = 0; ff < 5; ff++) {
    const ffAngle = time * 1.5 + ff * Math.PI * 0.4;
    const ffDist = size * 0.5 + Math.sin(time * 2 + ff * 3) * size * 0.1;
    const ffx = x + Math.cos(ffAngle) * ffDist;
    const ffy = y - size * 0.1 + Math.sin(ffAngle * 1.3 + time) * size * 0.3;
    const ffBlink = Math.sin(time * 8 + ff * 5) > 0.3 ? 0.7 : 0.15;
    setShadowBlur(ctx, 4 * zoom, "rgba(200, 255, 100, 0.5)");
    ctx.fillStyle = `rgba(200, 255, 100, ${ffBlink})`;
    ctx.beginPath();
    ctx.arc(ffx, ffy, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
    // Tiny wing shimmer
    if (ffBlink > 0.5) {
      ctx.fillStyle = "rgba(255, 255, 200, 0.25)";
      ctx.beginPath();
      ctx.ellipse(
        ffx + size * 0.01,
        ffy - size * 0.005,
        size * 0.01,
        size * 0.005,
        0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Flower on top
  ctx.fillStyle = "#f472b6";
  for (let p = 0; p < 5; p++) {
    const petalAngle = p * Math.PI * 0.4 + time * 0.5;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(petalAngle) * size * 0.08,
      y - size * 0.5 + Math.sin(petalAngle) * size * 0.08,
      size * 0.05,
      size * 0.08,
      petalAngle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(x, y - size * 0.5, size * 0.04, 0, Math.PI * 2);
  ctx.fill();
  // Flower pollen burst
  for (let fp = 0; fp < 3; fp++) {
    const fpAngle = time * 2 + fp * Math.PI * 0.67;
    const fpDist = size * 0.06 + Math.sin(time * 4 + fp) * size * 0.03;
    ctx.fillStyle = `rgba(250, 204, 21, ${0.3 + Math.sin(time * 5 + fp) * 0.15})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(fpAngle) * fpDist,
      y - size * 0.5 + Math.sin(fpAngle) * fpDist,
      size * 0.01,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Nature leaf swirl
  drawLeafSwirl(ctx, x, y, size * 0.35, time, zoom, {
    color: "rgba(74, 222, 128, 0.5)",
    colorAlt: "rgba(34, 160, 80, 0.45)",
    count: 5,
    maxAlpha: 0.4,
    speed: 1.2,
  });

  // Floating thorn/leaf shards
  drawShiftingSegments(ctx, x, y - size * 0.1, size, time, zoom, {
    bobAmt: 0.03,
    bobSpeed: 2.5,
    color: "#22c55e",
    colorAlt: "#2d3a1a",
    count: 5,
    orbitRadius: 0.4,
    orbitSpeed: 0.8,
    rotateWithOrbit: true,
    segmentSize: 0.035,
    shape: "shard",
  });

  // Nature orbiting debris
  drawOrbitingDebris(ctx, x, y, size, time, zoom, {
    color: "#84cc16",
    count: 4,
    glowColor: "rgba(132, 204, 22, 0.3)",
    maxRadius: 0.55,
    minRadius: 0.35,
    particleSize: 0.015,
    speed: 1.5,
    trailLen: 2,
  });

  // Thorn glow pulsing on extended thorns
  ctx.save();
  for (let tg = 0; tg < 8; tg++) {
    const tgAngle = Math.PI * 0.25 + tg * Math.PI * 0.22;
    const tgDist = size * 0.32;
    const tgX = x + Math.cos(tgAngle) * tgDist;
    const tgY = y - size * 0.15 + Math.sin(tgAngle * 0.5) * size * 0.35;
    const tgPulse = 0.15 + Math.sin(time * 3 + tg * 1.2) * 0.1;
    const tgGrad = ctx.createRadialGradient(tgX, tgY, 0, tgX, tgY, size * 0.04);
    tgGrad.addColorStop(0, `rgba(132, 204, 22, ${tgPulse})`);
    tgGrad.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = tgGrad;
    ctx.beginPath();
    ctx.arc(tgX, tgY, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Bioluminescent sap glow in knotholes and joints
  ctx.save();
  for (let bs = 0; bs < 4; bs++) {
    const bsX = x - size * 0.1 + bs * size * 0.07;
    const bsY = y + size * 0.05 + Math.sin(bs * 2.5) * size * 0.12;
    const bsPulse = 0.2 + Math.sin(time * 2.5 + bs * 1.5) * 0.15;
    const bsGrad = ctx.createRadialGradient(
      bsX,
      bsY,
      0,
      bsX,
      bsY,
      size * 0.035
    );
    bsGrad.addColorStop(0, `rgba(74, 222, 128, ${bsPulse})`);
    bsGrad.addColorStop(0.6, `rgba(34, 197, 94, ${bsPulse * 0.5})`);
    bsGrad.addColorStop(1, "rgba(22, 101, 52, 0)");
    ctx.fillStyle = bsGrad;
    ctx.beginPath();
    ctx.arc(bsX, bsY, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Floating spore particles drifting
  ctx.save();
  for (let sp = 0; sp < 6; sp++) {
    const spPhase = (time * 0.4 + sp * 0.167) % 1;
    const spX = x + Math.sin(time * 1.1 + sp * 2.1) * size * 0.4;
    const spY = y - size * 0.2 - spPhase * size * 0.4;
    const spAlpha = Math.sin(spPhase * Math.PI) * 0.35;
    const spSize = size * (0.008 + Math.sin(time * 4 + sp) * 0.004);
    ctx.fillStyle = `rgba(200, 255, 100, ${spAlpha})`;
    ctx.beginPath();
    ctx.arc(spX, spY, spSize, 0, Math.PI * 2);
    ctx.fill();
    const spGlowGrad = ctx.createRadialGradient(
      spX,
      spY,
      0,
      spX,
      spY,
      spSize * 3
    );
    spGlowGrad.addColorStop(0, `rgba(132, 204, 22, ${spAlpha * 0.3})`);
    spGlowGrad.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = spGlowGrad;
    ctx.beginPath();
    ctx.arc(spX, spY, spSize * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Root tendrils creeping energy glow
  ctx.save();
  for (let rt = 0; rt < 4; rt++) {
    const rtAngle = -Math.PI * 0.7 + rt * Math.PI * 0.45;
    const rtPulse = 0.2 + Math.sin(time * 2.5 + rt * 1.6) * 0.15;
    const rtStartX = x + Math.cos(rtAngle) * size * 0.3;
    const rtStartY = y + size * 0.45;
    const rtEndX = x + Math.cos(rtAngle) * size * 0.55;
    const rtEndY = y + size * 0.55 + Math.sin(time * 3 + rt) * size * 0.03;
    const rtGrad = ctx.createLinearGradient(rtStartX, rtStartY, rtEndX, rtEndY);
    rtGrad.addColorStop(0, `rgba(74, 222, 128, ${rtPulse * leafPulse})`);
    rtGrad.addColorStop(0.6, `rgba(34, 197, 94, ${rtPulse * leafPulse * 0.5})`);
    rtGrad.addColorStop(1, "rgba(22, 101, 52, 0)");
    ctx.strokeStyle = rtGrad;
    ctx.lineWidth = (2 + rtPulse * 2) * zoom;
    ctx.beginPath();
    ctx.moveTo(rtStartX, rtStartY);
    ctx.quadraticCurveTo(
      (rtStartX + rtEndX) / 2,
      rtStartY + size * 0.05,
      rtEndX,
      rtEndY
    );
    ctx.stroke();
  }
  ctx.restore();

  // Floating pollen/spore cloud with gentle drift
  ctx.save();
  for (let pollen = 0; pollen < 8; pollen++) {
    const pollenPhase = (time * 0.35 + pollen * 0.125) % 1;
    const pollenAngle = time * 0.8 + pollen * Math.PI * 0.25;
    const pollenDist = size * (0.2 + pollenPhase * 0.3);
    const pollenX =
      x +
      Math.cos(pollenAngle) * pollenDist +
      Math.sin(time * 1.5 + pollen) * size * 0.05;
    const pollenY = y - size * 0.1 - pollenPhase * size * 0.4;
    const pollenAlpha = Math.sin(pollenPhase * Math.PI) * 0.3 * leafPulse;
    const pollenSize = size * (0.006 + Math.sin(pollen * 2.1) * 0.003);
    ctx.fillStyle = `rgba(200, 255, 100, ${pollenAlpha})`;
    ctx.beginPath();
    ctx.arc(pollenX, pollenY, pollenSize, 0, Math.PI * 2);
    ctx.fill();
    const pollenGlowGrad = ctx.createRadialGradient(
      pollenX,
      pollenY,
      0,
      pollenX,
      pollenY,
      pollenSize * 3
    );
    pollenGlowGrad.addColorStop(0, `rgba(132, 204, 22, ${pollenAlpha * 0.4})`);
    pollenGlowGrad.addColorStop(1, "rgba(74, 222, 128, 0)");
    ctx.fillStyle = pollenGlowGrad;
    ctx.beginPath();
    ctx.arc(pollenX, pollenY, pollenSize * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Dark magic corruption veins pulsing through bark
  ctx.save();
  for (let dv = 0; dv < 3; dv++) {
    const dvY = y - size * 0.2 + dv * size * 0.15;
    const dvPulse = 0.1 + Math.sin(time * 3.5 + dv * 2) * 0.08;
    const dvGrad = ctx.createLinearGradient(
      x - size * 0.2,
      dvY,
      x + size * 0.2,
      dvY
    );
    dvGrad.addColorStop(0, "rgba(88, 28, 135, 0)");
    dvGrad.addColorStop(0.3, `rgba(88, 28, 135, ${dvPulse})`);
    dvGrad.addColorStop(0.5, `rgba(147, 51, 234, ${dvPulse * 0.8})`);
    dvGrad.addColorStop(0.7, `rgba(88, 28, 135, ${dvPulse})`);
    dvGrad.addColorStop(1, "rgba(88, 28, 135, 0)");
    ctx.strokeStyle = dvGrad;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.2, dvY);
    ctx.quadraticCurveTo(
      x,
      dvY + Math.sin(time * 4 + dv) * size * 0.03,
      x + size * 0.2,
      dvY
    );
    ctx.stroke();
  }
  ctx.restore();

  // Enhanced attack: thorns extend, vines lash forward, leaves scatter
  if (isAttacking) {
    // Vine lash forward
    ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - attackPhase) * 0.8})`;
    ctx.lineWidth = 3 * zoom;
    for (let vl = 0; vl < 3; vl++) {
      const vlAngle = -Math.PI * 0.3 + vl * Math.PI * 0.15;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + Math.cos(vlAngle) * size * 0.4,
        y + Math.sin(vlAngle) * size * 0.4 - size * 0.1,
        x + Math.cos(vlAngle) * size * (0.5 + attackPhase * 0.5),
        y + Math.sin(vlAngle) * size * (0.5 + attackPhase * 0.5)
      );
      ctx.stroke();
      // Vine tip thorn
      const vtx = x + Math.cos(vlAngle) * size * (0.5 + attackPhase * 0.5);
      const vty = y + Math.sin(vlAngle) * size * (0.5 + attackPhase * 0.5);
      ctx.fillStyle = `rgba(45, 58, 26, ${(1 - attackPhase) * 0.8})`;
      ctx.beginPath();
      ctx.moveTo(vtx, vty);
      ctx.lineTo(
        vtx + Math.cos(vlAngle) * size * 0.06,
        vty + Math.sin(vlAngle) * size * 0.06
      );
      ctx.lineTo(
        vtx + Math.cos(vlAngle + 0.3) * size * 0.03,
        vty + Math.sin(vlAngle + 0.3) * size * 0.03
      );
      ctx.closePath();
      ctx.fill();
    }
    // Thorn burst ring
    setShadowBlur(ctx, 6 * zoom, "rgba(34, 197, 94, 0.4)");
    ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - attackPhase) * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.35 + attackPhase * size * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    clearShadow(ctx);
    // Scattered leaf burst
    for (let sl = 0; sl < 6; sl++) {
      const slAngle = sl * Math.PI * 0.333 + time * 2;
      const slDist = size * 0.3 + attackPhase * size * 0.6;
      const slAlpha = (1 - attackPhase) * 0.6;
      ctx.save();
      ctx.translate(
        x + Math.cos(slAngle) * slDist,
        y + Math.sin(slAngle) * slDist
      );
      ctx.rotate(slAngle + attackPhase * 4);
      ctx.fillStyle = `rgba(34, 197, 94, ${slAlpha})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(size * 0.03, -size * 0.025, size * 0.06, 0);
      ctx.quadraticCurveTo(size * 0.03, size * 0.025, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }
}

export function drawSandwormEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  const isAttacking = attackPhase > 0;
  const emergePhase =
    Math.sin(time * 1.5) * 0.1 + 0.6 + (isAttacking ? attackPhase * 0.15 : 0);
  const mouthOpen =
    0.3 + Math.sin(time * 4) * 0.15 + (isAttacking ? attackPhase * 0.3 : 0);
  const bodyWave = Math.sin(time * 2);
  const attackRear = isAttacking ? attackPhase * 0.25 : 0;

  // Ground crack/disturbance effect beneath
  ctx.strokeStyle = `rgba(80, 50, 20, ${0.4 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let crack = 0; crack < 10; crack++) {
    const crackAngle = crack * Math.PI * 0.2 + time * 0.1;
    const crackLen = size * (0.3 + Math.sin(time * 0.7 + crack * 1.3) * 0.15);
    const cx1 = x + Math.cos(crackAngle) * size * 0.15;
    const cy1 = y + size * 0.4 + Math.sin(crackAngle) * size * 0.06;
    const cx2 = x + Math.cos(crackAngle) * crackLen;
    const cy2 = y + size * 0.4 + Math.sin(crackAngle) * crackLen * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx1, cy1);
    ctx.quadraticCurveTo(
      (cx1 + cx2) / 2 + Math.sin(crack * 1.7) * size * 0.05,
      (cy1 + cy2) / 2 + Math.cos(crack * 2.3) * size * 0.03,
      cx2,
      cy2
    );
    ctx.stroke();
  }

  // Sand spray particles erupting around it
  for (let sp = 0; sp < 12; sp++) {
    const sprayPhase = (time * 2 + sp * 0.083) % 1;
    const sprayAngle = (sp * Math.PI * 2) / 12 + time * 0.3;
    const sprayDist = size * (0.35 + sprayPhase * 0.45);
    const sprayY = y + size * 0.35 - sprayPhase * size * 0.5;
    const sprayX = x + Math.cos(sprayAngle) * sprayDist;
    const sprayAlpha = (1 - sprayPhase) * 0.5;
    const spraySize = size * (0.03 + (1 - sprayPhase) * 0.04);
    ctx.fillStyle = `rgba(194, 143, 64, ${sprayAlpha})`;
    ctx.beginPath();
    ctx.arc(sprayX, sprayY, spraySize, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sand disturbance around emergence point
  for (let d = 0; d < 12; d++) {
    const dustAngle = time * 0.5 + (d * Math.PI * 2) / 12;
    const dustDist = size * 0.6 + Math.sin(time * 2 + d) * size * 0.15;
    const dustAlpha = 0.2 + Math.sin(time * 3 + d) * 0.1;
    ctx.fillStyle = `rgba(161, 98, 7, ${dustAlpha})`;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(dustAngle) * dustDist,
      y + size * 0.3 + Math.sin(dustAngle) * dustDist * 0.3,
      size * (0.06 + Math.sin(time * 4 + d) * 0.03),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Burrow hole with deeper detail
  const holeGrad = ctx.createRadialGradient(
    x,
    y + size * 0.4,
    0,
    x,
    y + size * 0.4,
    size * 0.55
  );
  holeGrad.addColorStop(0, "#0d0804");
  holeGrad.addColorStop(0.3, "#1a0f05");
  holeGrad.addColorStop(0.6, "#3d2410");
  holeGrad.addColorStop(1, "rgba(161, 98, 7, 0.2)");
  ctx.fillStyle = holeGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.4,
    size * 0.55,
    size * 0.55 * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Burrow rim texture
  ctx.strokeStyle = "rgba(120, 53, 15, 0.4)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.4,
    size * 0.5,
    size * 0.5 * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Stinger/tail tip visible at the back
  const tailX = x + Math.sin(time * 1.8) * size * 0.12;
  const tailY = y + size * 0.3;
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(tailX - size * 0.08, tailY);
  ctx.quadraticCurveTo(
    tailX - size * 0.15,
    tailY + size * 0.15,
    tailX - size * 0.05,
    tailY + size * 0.25
  );
  ctx.lineTo(tailX, tailY + size * 0.32);
  ctx.lineTo(tailX + size * 0.05, tailY + size * 0.25);
  ctx.quadraticCurveTo(
    tailX + size * 0.15,
    tailY + size * 0.15,
    tailX + size * 0.08,
    tailY
  );
  ctx.closePath();
  ctx.fill();
  // Stinger tip with venom glow
  ctx.fillStyle = `rgba(34, 197, 94, ${0.5 + Math.sin(time * 3) * 0.3})`;
  setShadowBlur(ctx, 6 * zoom, "#22c55e");
  ctx.beginPath();
  ctx.moveTo(tailX - size * 0.03, tailY + size * 0.28);
  ctx.lineTo(tailX, tailY + size * 0.38);
  ctx.lineTo(tailX + size * 0.03, tailY + size * 0.28);
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);

  // Worm body: 8 articulated segments with undulation
  const segmentCount = 8;
  for (let seg = 0; seg < segmentCount; seg++) {
    const segT = seg / (segmentCount - 1);
    const segUndulation = Math.sin(time * 2.5 + seg * 0.8) * size * 0.04;
    const segY =
      y +
      size * 0.3 -
      seg * size * 0.12 * emergePhase -
      attackRear * seg * size * 0.03;
    const segX = x + segUndulation;
    const segWidth = size * (0.38 - seg * 0.015);
    const segHeight = size * 0.07;

    // Segment body fill
    const segGrad = ctx.createLinearGradient(
      segX - segWidth,
      segY,
      segX + segWidth,
      segY
    );
    segGrad.addColorStop(0, bodyColorDark);
    segGrad.addColorStop(0.2, bodyColor);
    segGrad.addColorStop(0.5, bodyColorLight);
    segGrad.addColorStop(0.8, bodyColor);
    segGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = segGrad;
    ctx.beginPath();
    ctx.ellipse(segX, segY, segWidth, segHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armored carapace plate with metallic sheen
    const plateGrad = ctx.createLinearGradient(
      segX - segWidth * 0.7,
      segY - segHeight * 0.8,
      segX + segWidth * 0.7,
      segY + segHeight * 0.3
    );
    plateGrad.addColorStop(0, `rgba(139, 92, 42, ${0.7 + segT * 0.2})`);
    plateGrad.addColorStop(
      0.3,
      `rgba(205, 170, 110, ${0.5 + Math.sin(time * 2 + seg) * 0.15})`
    );
    plateGrad.addColorStop(
      0.5,
      `rgba(245, 222, 179, ${0.3 + Math.sin(time * 3 + seg * 0.5) * 0.2})`
    );
    plateGrad.addColorStop(0.7, "rgba(178, 134, 65, 0.6)");
    plateGrad.addColorStop(1, "rgba(101, 67, 33, 0.8)");
    ctx.fillStyle = plateGrad;
    ctx.beginPath();
    ctx.ellipse(
      segX,
      segY - segHeight * 0.2,
      segWidth * 0.75,
      segHeight * 0.55,
      0,
      Math.PI,
      Math.PI * 2
    );
    ctx.fill();

    // Metallic highlight line on plate
    ctx.strokeStyle = `rgba(255, 240, 200, ${0.2 + Math.sin(time * 2 + seg * 1.2) * 0.15})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      segX,
      segY - segHeight * 0.3,
      segWidth * 0.5,
      segHeight * 0.2,
      0,
      Math.PI * 1.2,
      Math.PI * 1.8
    );
    ctx.stroke();

    // Visible ring segmentation: transverse curved grooves across each segment
    ctx.strokeStyle = `rgba(48, 28, 12, ${0.5 + Math.sin(time * 2.2 + seg * 0.9) * 0.12})`;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      segX,
      segY + segHeight * 0.42,
      segWidth * 0.9,
      segHeight * 0.42,
      0,
      Math.PI * 0.05,
      Math.PI * 0.95
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(
      segX,
      segY - segHeight * 0.05,
      segWidth * 0.82,
      segHeight * 0.36,
      0,
      Math.PI * 1.07,
      Math.PI * 1.93
    );
    ctx.stroke();
    ctx.strokeStyle = `rgba(70, 44, 20, ${0.28 + Math.sin(time * 1.7 + seg) * 0.1})`;
    ctx.lineWidth = 0.75 * zoom;
    ctx.beginPath();
    ctx.moveTo(segX - segWidth * 0.75, segY + segHeight * 0.12);
    ctx.quadraticCurveTo(
      segX + Math.sin(time * 2 + seg) * size * 0.02,
      segY + segHeight * 0.28,
      segX + segWidth * 0.75,
      segY + segHeight * 0.1
    );
    ctx.stroke();

    // Rough skin texture bumps on segment surface
    for (let bump = 0; bump < 4; bump++) {
      const bumpAngle = Math.PI * 0.3 + bump * Math.PI * 0.35;
      const bumpX = segX + Math.cos(bumpAngle) * segWidth * 0.5;
      const bumpY = segY + Math.sin(bumpAngle) * segHeight * 0.4;
      ctx.fillStyle = "rgba(120, 80, 40, 0.35)";
      ctx.beginPath();
      ctx.arc(bumpX, bumpY, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
    }
    // Additional scattered sandy micro-bumps across segment
    for (let bump = 0; bump < 18; bump++) {
      const ba = bump * 2.31 + seg * 1.07;
      const bu = Math.sin(ba * 2.7) * 0.72;
      const bv = Math.cos(ba * 1.9 + seg) * 0.62;
      const bx = segX + bu * segWidth * 0.78;
      const by = segY + bv * segHeight * 0.85;
      const bRad = size * (0.005 + Math.abs(Math.sin(ba * 4.3)) * 0.0045);
      ctx.fillStyle = `rgba(88, 56, 28, ${0.32 + Math.sin(ba * 5 + seg) * 0.18})`;
      ctx.beginPath();
      ctx.arc(bx, by, bRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(200, 170, 120, ${0.12 + Math.abs(Math.cos(ba * 6)) * 0.1})`;
      ctx.beginPath();
      ctx.arc(bx - bRad * 0.35, by - bRad * 0.35, bRad * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dark band between segments with texture
    if (seg < segmentCount - 1) {
      const bandY = segY - segHeight;
      ctx.fillStyle = `rgba(30, 15, 5, ${0.5 + Math.sin(time + seg) * 0.1})`;
      ctx.beginPath();
      ctx.ellipse(
        segX + segUndulation * 0.5,
        bandY,
        segWidth * 0.9,
        size * 0.015,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      // Circumferential ring line between segments
      ctx.strokeStyle = "rgba(80, 50, 25, 0.4)";
      ctx.lineWidth = 0.8 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        segX + segUndulation * 0.5,
        bandY,
        segWidth * 0.82,
        size * 0.008,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      for (let dot = 0; dot < 5; dot++) {
        const dotAngle = (dot * Math.PI) / 5 + Math.PI;
        ctx.fillStyle = "rgba(60, 30, 10, 0.3)";
        ctx.beginPath();
        ctx.arc(
          segX + Math.cos(dotAngle) * segWidth * 0.6,
          bandY + Math.sin(dotAngle) * size * 0.01,
          size * 0.008,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
  }

  // Main body connecting curve overlay
  const bodyGrad = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y
  );
  bodyGrad.addColorStop(0, bodyColorDark);
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.7, bodyColorLight);
  bodyGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGrad;
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.35, y + size * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.42 + bodyWave * size * 0.1,
    y - size * 0.15,
    x - size * 0.22,
    y - size * 0.55 * emergePhase - attackRear * size
  );
  ctx.quadraticCurveTo(
    x,
    y - size * 0.75 * emergePhase - attackRear * size * 1.2,
    x + size * 0.22,
    y - size * 0.55 * emergePhase - attackRear * size
  );
  ctx.quadraticCurveTo(
    x + size * 0.42 - bodyWave * size * 0.1,
    y - size * 0.15,
    x + size * 0.35,
    y + size * 0.3
  );
  ctx.arc(x, y + size * 0.3, size * 0.35, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // Head with detailed maw
  const headY = y - size * 0.45 * emergePhase - attackRear * size * 0.8;
  const headX = x + Math.sin(time * 3) * size * 0.02;

  // Head base
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Head carapace
  const headPlateGrad = ctx.createLinearGradient(
    headX - size * 0.25,
    headY - size * 0.25,
    headX + size * 0.25,
    headY + size * 0.1
  );
  headPlateGrad.addColorStop(0, "rgba(139, 92, 42, 0.6)");
  headPlateGrad.addColorStop(0.4, "rgba(220, 190, 130, 0.4)");
  headPlateGrad.addColorStop(1, "rgba(101, 67, 33, 0.7)");
  ctx.fillStyle = headPlateGrad;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.04, size * 0.24, Math.PI, Math.PI * 2);
  ctx.fill();

  // Multiple glowing red eyes around the maw
  const eyeCount = 6;
  for (let eye = 0; eye < eyeCount; eye++) {
    const eyeAngle = -Math.PI * 0.8 + eye * ((Math.PI * 1.6) / (eyeCount - 1));
    const eyeRadius = size * 0.22;
    const ex = headX + Math.cos(eyeAngle) * eyeRadius;
    const ey = headY + Math.sin(eyeAngle) * eyeRadius * 0.7;
    const eyePulse = 0.6 + Math.sin(time * 5 + eye * 1.2) * 0.3;

    ctx.fillStyle = "#1a0505";
    ctx.beginPath();
    ctx.arc(ex, ey, size * 0.025, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(239, 68, 68, ${eyePulse})`;
    setShadowBlur(ctx, 5 * zoom, "#ef4444");
    ctx.beginPath();
    ctx.arc(ex, ey, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }

  // Circular mouth opening
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.17 * mouthOpen + size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  // Inner mouth glow gradient
  const mawGrad = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    size * 0.15 * mouthOpen + size * 0.04
  );
  mawGrad.addColorStop(0, `rgba(255, 160, 60, ${0.5 + mouthOpen * 0.4})`);
  mawGrad.addColorStop(0.5, `rgba(200, 80, 20, ${0.3 + mouthOpen * 0.2})`);
  mawGrad.addColorStop(1, "rgba(10, 5, 3, 0)");
  ctx.fillStyle = mawGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.15 * mouthOpen + size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  // Concentric gullet rings inside the mouth
  ctx.lineWidth = 1.2 * zoom;
  for (let gr = 0; gr < 3; gr++) {
    const grRadius = (size * 0.1 * mouthOpen + size * 0.03) * (1 - gr * 0.28);
    ctx.strokeStyle = `rgba(180, 80, 30, ${0.35 - gr * 0.08})`;
    ctx.beginPath();
    ctx.arc(headX, headY, grRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Teeth rings (3 concentric)
  for (let ring = 0; ring < 3; ring++) {
    const teethCount = 8 + ring * 4;
    const ringRadius =
      size * 0.14 * mouthOpen + size * 0.05 - ring * size * 0.025;
    const teethColors = ["#f5f5f4", "#d6d3d1", "#a8a29e"];
    ctx.fillStyle = teethColors[ring];
    for (let t = 0; t < teethCount; t++) {
      const toothAngle =
        (t / teethCount) * Math.PI * 2 + time * (2 + ring * 0.5);
      const tx = headX + Math.cos(toothAngle) * ringRadius;
      const ty = headY + Math.sin(toothAngle) * ringRadius;
      const toothLen = size * (0.055 - ring * 0.01);
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(toothAngle + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-size * 0.012, 0);
      ctx.lineTo(0, -toothLen);
      ctx.lineTo(size * 0.012, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Concentric mouth rims (structural circles) and inward-pointing tooth rings
  const outerMouthR = size * 0.17 * mouthOpen + size * 0.06;
  ctx.strokeStyle = "rgba(32, 18, 6, 0.72)";
  ctx.lineWidth = 1 * zoom;
  for (let rim = 0; rim < 3; rim++) {
    const rr = outerMouthR - rim * size * 0.03 * Math.max(0.4, mouthOpen);
    ctx.beginPath();
    ctx.arc(headX, headY, Math.max(size * 0.04, rr), 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let ring = 0; ring < 3; ring++) {
    const innerTeethCount = 10 + ring * 3;
    const innerRingR =
      size * (0.118 - ring * 0.02) * Math.max(0.35, mouthOpen) + size * 0.034;
    const innerColors = ["#ebeae8", "#cfcac6", "#a6a09b"];
    ctx.fillStyle = innerColors[ring];
    for (let it = 0; it < innerTeethCount; it++) {
      const ia =
        (it + 0.5) * ((Math.PI * 2) / innerTeethCount) +
        time * (1.1 + ring * 0.35);
      const ix = headX + Math.cos(ia) * innerRingR;
      const iy = headY + Math.sin(ia) * innerRingR;
      const inward = Math.atan2(headY - iy, headX - ix);
      const iLen = size * (0.048 - ring * 0.009) * Math.max(0.45, mouthOpen);
      ctx.save();
      ctx.translate(ix, iy);
      ctx.rotate(inward);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-size * 0.012, -size * 0.011);
      ctx.bezierCurveTo(
        iLen * 0.35,
        -size * 0.014,
        iLen * 0.72,
        -size * 0.006,
        iLen,
        0
      );
      ctx.bezierCurveTo(
        iLen * 0.72,
        size * 0.006,
        iLen * 0.35,
        size * 0.014,
        -size * 0.012,
        size * 0.011
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Mandibles (4 pincers) with animated open/close and serrated edges
  const mandibleSpread =
    mouthOpen * size * 0.18 + Math.sin(time * 5) * size * 0.03;
  for (let m = 0; m < 4; m++) {
    const mandibleAngle = m * Math.PI * 0.5 + time * 0.5;
    ctx.save();
    ctx.translate(
      headX + Math.cos(mandibleAngle) * (size * 0.2 + mandibleSpread),
      headY + Math.sin(mandibleAngle) * (size * 0.2 + mandibleSpread)
    );
    ctx.rotate(mandibleAngle);

    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.05);
    ctx.quadraticCurveTo(size * 0.18, -size * 0.02, size * 0.22, 0);
    ctx.quadraticCurveTo(size * 0.18, size * 0.02, 0, size * 0.05);
    ctx.quadraticCurveTo(size * 0.1, 0, 0, -size * 0.05);
    ctx.fill();

    // Serrated edge
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1 * zoom;
    for (let serr = 0; serr < 3; serr++) {
      const sx = size * (0.08 + serr * 0.05);
      ctx.beginPath();
      ctx.moveTo(sx, -size * 0.03);
      ctx.lineTo(sx + size * 0.02, -size * 0.045);
      ctx.lineTo(sx + size * 0.04, -size * 0.03);
      ctx.stroke();
    }

    // Mandible tip highlight
    ctx.fillStyle = "rgba(220, 180, 100, 0.4)";
    ctx.beginPath();
    ctx.arc(size * 0.2, 0, size * 0.015, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Acid/drool dripping from maw with green glow
  for (let drip = 0; drip < 5; drip++) {
    const dripPhase = (time * 1.2 + drip * 0.2) % 1;
    const dripAngle = (drip * Math.PI * 2) / 5 + time * 0.3;
    const dripStartX = headX + Math.cos(dripAngle) * size * 0.12;
    const dripStartY = headY + Math.sin(dripAngle) * size * 0.12;
    const dripEndY = dripStartY + dripPhase * size * 0.35;
    const dripAlpha = (1 - dripPhase) * 0.7;

    ctx.strokeStyle = `rgba(74, 222, 128, ${dripAlpha})`;
    setShadowBlur(ctx, 4 * zoom, "#4ade80");
    ctx.lineWidth = size * 0.012 * (1 - dripPhase * 0.6) * 2;
    ctx.beginPath();
    ctx.moveTo(dripStartX, dripStartY);
    ctx.quadraticCurveTo(
      dripStartX + Math.sin(time * 6 + drip) * size * 0.02,
      (dripStartY + dripEndY) / 2,
      dripStartX + Math.sin(time * 4 + drip) * size * 0.03,
      dripEndY
    );
    ctx.stroke();

    ctx.fillStyle = `rgba(74, 222, 128, ${dripAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(
      dripStartX + Math.sin(time * 4 + drip) * size * 0.03,
      dripEndY,
      size * 0.015 * (1 - dripPhase),
      0,
      Math.PI * 2
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // Glowing inner maw
  ctx.fillStyle = `rgba(255, 150, 50, ${0.4 + mouthOpen * 0.5})`;
  setShadowBlur(ctx, 12 * zoom, "#ff9632");
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.1 * mouthOpen, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);

  // Animated tendrils around maw
  for (let i = 0; i < 4; i++) {
    const tendrilAngle =
      -Math.PI * 0.5 + i * Math.PI * 0.4 + Math.sin(time * 1.5) * 0.15;
    drawAnimatedTendril(ctx, headX, headY, tendrilAngle, size, time, zoom, {
      color: bodyColor,
      length: 0.25,
      segments: 7,
      tipColor: "rgba(161, 98, 7, 0.6)",
      tipRadius: 0.012,
      waveAmt: 0.05,
      waveSpeed: 5,
      width: 0.02,
    });
  }

  // Paper scraps being devoured
  for (let p = 0; p < 6; p++) {
    const paperPhase = (time * 2 + p * 0.167) % 1;
    const paperDist = size * (0.7 - paperPhase * 0.6);
    const paperAngle = (p * Math.PI * 2) / 6 + time;
    const px = headX + Math.cos(paperAngle) * paperDist;
    const py =
      headY - size * 0.1 + Math.sin(paperAngle * 0.5) * paperDist * 0.3;
    const paperAlpha = (1 - paperPhase) * 0.7;
    ctx.fillStyle = `rgba(255, 255, 255, ${paperAlpha})`;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 3 + p);
    ctx.fillRect(-size * 0.03, -size * 0.04, size * 0.06, size * 0.08);
    ctx.fillStyle = `rgba(100, 100, 100, ${paperAlpha * 0.5})`;
    ctx.fillRect(-size * 0.02, -size * 0.025, size * 0.04, size * 0.005);
    ctx.fillRect(-size * 0.02, -size * 0.01, size * 0.03, size * 0.005);
    ctx.restore();
  }

  // Swirling sand dust
  drawSandDust(ctx, x, y + size * 0.2, size * 0.4, time, zoom, {
    color: "rgba(217, 159, 60, 0.4)",
    count: 8,
    maxAlpha: 0.3,
    speed: 1.5,
    spread: 1.2,
  });

  // Shifting sand segments
  drawShiftingSegments(ctx, x, y + size * 0.1, size, time, zoom, {
    bobAmt: 0.04,
    bobSpeed: 2,
    color: "rgba(194, 143, 64, 0.6)",
    colorAlt: "rgba(161, 98, 7, 0.5)",
    count: 6,
    orbitRadius: 0.45,
    orbitSpeed: 0.7,
    rotateWithOrbit: false,
    segmentSize: 0.03,
    shape: "circle",
  });

  // Earth-colored orbiting debris
  drawOrbitingDebris(ctx, x, y + size * 0.2, size, time, zoom, {
    color: "#92400e",
    count: 5,
    glowColor: "rgba(161, 98, 7, 0.3)",
    maxRadius: 0.5,
    minRadius: 0.3,
    particleSize: 0.018,
    speed: 1.2,
    trailLen: 2,
  });

  // Attack: ground shockwave ripple + maw flare
  if (isAttacking) {
    for (let wave = 0; wave < 3; wave++) {
      const wavePhase = (attackPhase * 3 + wave * 0.33) % 1;
      const waveRadius = size * (0.4 + wavePhase * 1.2);
      const waveAlpha = (1 - wavePhase) * 0.4 * attackPhase;
      ctx.strokeStyle = `rgba(161, 98, 7, ${waveAlpha})`;
      ctx.lineWidth = (3 - wavePhase * 2) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + size * 0.4,
        waveRadius,
        waveRadius * ISO_Y_RATIO,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    ctx.fillStyle = `rgba(255, 100, 30, ${attackPhase * 0.6})`;
    setShadowBlur(ctx, 15 * zoom, "#ff6420");
    ctx.beginPath();
    ctx.arc(headX, headY, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }

  // ── Enhanced burrowing dust cloud — earth displacement particles ──
  for (let dc = 0; dc < 6; dc++) {
    const dcPhase = (time * 1.8 + dc * 0.167) % 1;
    const dcAngle = (dc / 6) * Math.PI * 2 + time * 0.4;
    const dcX = x + Math.cos(dcAngle) * size * (0.2 + dcPhase * 0.15);
    const dcY = y + size * 0.42 - dcPhase * size * 0.35;
    const dcAlpha = (1 - dcPhase) * 0.45;
    const dcR = size * (0.04 + (1 - dcPhase) * 0.05);
    const dcGrad = ctx.createRadialGradient(dcX, dcY, 0, dcX, dcY, dcR);
    dcGrad.addColorStop(0, `rgba(161, 98, 7, ${dcAlpha})`);
    dcGrad.addColorStop(0.6, `rgba(120, 70, 20, ${dcAlpha * 0.5})`);
    dcGrad.addColorStop(1, "rgba(80, 50, 15, 0)");
    ctx.fillStyle = dcGrad;
    ctx.beginPath();
    ctx.arc(dcX, dcY, dcR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Enhanced glowing maw — pulsing amber radiance ──
  const mawPulse = 0.5 + Math.sin(time * 4.5) * 0.35;
  const mawOuterR = size * 0.25 * mouthOpen + size * 0.08;
  const mawGlow = ctx.createRadialGradient(
    headX,
    headY,
    0,
    headX,
    headY,
    mawOuterR
  );
  mawGlow.addColorStop(0, `rgba(255, 180, 60, ${mawPulse * 0.4})`);
  mawGlow.addColorStop(0.3, `rgba(255, 120, 30, ${mawPulse * 0.25})`);
  mawGlow.addColorStop(0.6, `rgba(200, 80, 10, ${mawPulse * 0.12})`);
  mawGlow.addColorStop(1, "rgba(160, 60, 0, 0)");
  ctx.fillStyle = mawGlow;
  ctx.beginPath();
  ctx.arc(headX, headY, mawOuterR, 0, Math.PI * 2);
  ctx.fill();

  // ── Segmented body shimmer — traveling highlight ripple ──
  const shimmerWormPos = (time * 1.5) % 8;
  for (let seg = 0; seg < 8; seg++) {
    const shimDist = Math.abs(seg - shimmerWormPos);
    const shimAlpha = Math.max(0, 1 - shimDist * 0.5) * 0.3;
    if (shimAlpha > 0.01) {
      const segUndulate = Math.sin(time * 2.5 + seg * 0.8) * size * 0.04;
      const shimSegY =
        y +
        size * 0.3 -
        seg * size * 0.12 * emergePhase -
        attackRear * seg * size * 0.03;
      const shimSegX = x + segUndulate;
      const shimW = size * (0.38 - seg * 0.015);
      const shimH = size * 0.07;
      const shimGrad = ctx.createLinearGradient(
        shimSegX - shimW * 0.3,
        shimSegY - shimH,
        shimSegX + shimW * 0.3,
        shimSegY + shimH * 0.5
      );
      shimGrad.addColorStop(0, "rgba(255, 240, 200, 0)");
      shimGrad.addColorStop(0.4, `rgba(255, 240, 200, ${shimAlpha})`);
      shimGrad.addColorStop(0.6, `rgba(255, 240, 200, ${shimAlpha})`);
      shimGrad.addColorStop(1, "rgba(255, 240, 200, 0)");
      ctx.fillStyle = shimGrad;
      ctx.beginPath();
      ctx.ellipse(
        shimSegX,
        shimSegY,
        shimW * 0.8,
        shimH * 0.7,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // ── Enhanced ground crack pattern — jagged fissures ──
  ctx.lineWidth = 1.2 * zoom;
  for (let gc = 0; gc < 6; gc++) {
    const gcAngle = (gc * Math.PI) / 3 + time * 0.15;
    const gcLen = size * (0.35 + Math.sin(time * 0.9 + gc * 2.1) * 0.12);
    const gcAlpha = 0.3 + Math.sin(time * 1.5 + gc) * 0.1;
    ctx.strokeStyle = `rgba(60, 35, 10, ${gcAlpha})`;
    ctx.beginPath();
    const gcStartX = x + Math.cos(gcAngle) * size * 0.1;
    const gcStartY = y + size * 0.42 + Math.sin(gcAngle) * size * 0.04;
    ctx.moveTo(gcStartX, gcStartY);
    const perpAngle = gcAngle + Math.PI / 2;
    for (let sub = 1; sub <= 3; sub++) {
      const subT = sub / 3;
      const subJag = (sub % 2 === 0 ? 1 : -1) * size * 0.03;
      ctx.lineTo(
        gcStartX +
          Math.cos(gcAngle) * gcLen * subT +
          Math.cos(perpAngle) * subJag,
        gcStartY +
          Math.sin(gcAngle) * gcLen * 0.2 * subT +
          Math.sin(perpAngle) * subJag * 0.3
      );
    }
    ctx.stroke();
  }

  // ── Academic debris — scroll fragments consumed around head ──
  for (let scroll = 0; scroll < 5; scroll++) {
    const scrollPhase = (time * 1.5 + scroll * 0.2) % 1;
    const scrollDist = size * (0.5 - scrollPhase * 0.35);
    const scrollAngle = (scroll / 5) * Math.PI * 2 + time * 1.2;
    const sx = headX + Math.cos(scrollAngle) * scrollDist;
    const sy = headY + Math.sin(scrollAngle) * scrollDist * 0.5 - size * 0.05;
    const scrollAlpha = (1 - scrollPhase) * 0.6;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(time * 2.5 + scroll * 1.3);
    ctx.fillStyle = `rgba(245, 235, 210, ${scrollAlpha})`;
    ctx.fillRect(-size * 0.025, -size * 0.015, size * 0.05, size * 0.03);
    ctx.strokeStyle = `rgba(180, 160, 120, ${scrollAlpha})`;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.arc(-size * 0.025, 0, size * 0.015, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(100, 80, 60, ${scrollAlpha * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.015, -size * 0.006);
    ctx.lineTo(size * 0.02, -size * 0.006);
    ctx.moveTo(-size * 0.015, size * 0.004);
    ctx.lineTo(size * 0.015, size * 0.004);
    ctx.stroke();
    ctx.restore();
  }
}

export function drawFrostlingEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // WINTER BREAK GHOST - Ethereal ice spirit with swirling frost
  const isAttacking = attackPhase > 0;
  const attackIntensity = attackPhase;
  const floatOffset = Math.sin(time * 3) * size * 0.08;
  const shimmer =
    0.6 + Math.sin(time * 5) * 0.3 + (isAttacking ? attackPhase * 0.3 : 0);
  const frostSwirl = time * 2;

  // Ground frost ring that spreads beneath
  ctx.save();
  ctx.translate(x, y + size * 0.5);
  ctx.scale(1, ISO_Y_RATIO);
  const frostRingRadius =
    size *
    (0.4 +
      Math.sin(time * 2) * 0.05 +
      (isAttacking ? attackIntensity * 0.25 : 0));
  const frostRingGrad = ctx.createRadialGradient(
    0,
    0,
    frostRingRadius * 0.5,
    0,
    0,
    frostRingRadius
  );
  frostRingGrad.addColorStop(0, `rgba(186, 230, 253, ${shimmer * 0.25})`);
  frostRingGrad.addColorStop(0.7, `rgba(125, 211, 252, ${shimmer * 0.15})`);
  frostRingGrad.addColorStop(1, "rgba(125, 211, 252, 0)");
  ctx.fillStyle = frostRingGrad;
  ctx.beginPath();
  ctx.arc(0, 0, frostRingRadius, 0, Math.PI * 2);
  ctx.fill();
  // Frost ring crystalline edge
  ctx.strokeStyle = `rgba(224, 242, 254, ${shimmer * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, frostRingRadius * 0.85, 0, Math.PI * 2);
  ctx.stroke();
  // Small ice shard marks on the ring
  for (let i = 0; i < 8; i++) {
    const markAngle = (i / 8) * Math.PI * 2 + time * 0.2;
    const mr = frostRingRadius * 0.85;
    ctx.beginPath();
    ctx.moveTo(Math.cos(markAngle) * mr, Math.sin(markAngle) * mr);
    ctx.lineTo(
      Math.cos(markAngle) * (mr + size * 0.05),
      Math.sin(markAngle) * (mr + size * 0.05)
    );
    ctx.stroke();
  }
  ctx.restore();

  // Ice crystal trail left behind (fading icy particles)
  for (let t = 0; t < 8; t++) {
    const trailPhase = (time * 0.6 + t * 0.12) % 1;
    const trailAlpha = (1 - trailPhase) * 0.35;
    const trailX =
      x - trailPhase * size * 0.3 + Math.sin(time + t * 2.1) * size * 0.08;
    const trailY = y + size * 0.3 + trailPhase * size * 0.15;
    const trailSize = size * 0.025 * (1 - trailPhase);
    ctx.fillStyle = `rgba(224, 242, 254, ${trailAlpha})`;
    ctx.beginPath();
    ctx.moveTo(trailX, trailY - trailSize * 2);
    ctx.lineTo(trailX + trailSize, trailY);
    ctx.lineTo(trailX, trailY + trailSize);
    ctx.lineTo(trailX - trailSize, trailY);
    ctx.closePath();
    ctx.fill();
  }

  // Pale blue aurora/light effect around the body
  const auroraGrad = ctx.createRadialGradient(
    x,
    y + floatOffset - size * 0.1,
    size * 0.15,
    x,
    y + floatOffset,
    size * 0.6
  );
  auroraGrad.addColorStop(0, `rgba(186, 230, 253, ${shimmer * 0.15})`);
  auroraGrad.addColorStop(0.5, `rgba(125, 211, 252, ${shimmer * 0.08})`);
  auroraGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
  ctx.fillStyle = auroraGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + floatOffset,
    size * 0.6,
    size * 0.6 * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Aurora shimmer bands
  for (let a = 0; a < 3; a++) {
    const auroraY = y + floatOffset - size * 0.3 + a * size * 0.15;
    const auroraWave = Math.sin(time * 2 + a * 1.5) * size * 0.1;
    ctx.strokeStyle = `rgba(186, 230, 253, ${shimmer * 0.12})`;
    ctx.lineWidth = (2 + a) * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, auroraY);
    ctx.quadraticCurveTo(
      x + auroraWave,
      auroraY - size * 0.05,
      x + size * 0.4,
      auroraY
    );
    ctx.stroke();
  }

  // Frost trail/aura (more detailed transparency layers)
  for (let t = 0; t < 6; t++) {
    const trailOffset = t * 0.15;
    const trailAlpha = (1 - trailOffset) * 0.2;
    ctx.fillStyle = `rgba(125, 211, 252, ${trailAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.sin(time * 2 - t * 0.3) * size * 0.1,
      y + floatOffset + t * size * 0.08,
      size * (0.35 - t * 0.03),
      size * (0.4 - t * 0.04),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Frostling arms — frost channeling spread
  for (const side of [-1, 1] as const) {
    drawPathArm(
      ctx,
      x + side * size * 0.25,
      y + floatOffset - size * 0.1,
      size,
      time,
      zoom,
      side,
      {
        color: "rgba(186, 230, 253, 0.6)",
        colorDark: "rgba(125, 211, 252, 0.5)",
        elbowAngle: -0.2 + Math.sin(time * 3 + side * 1.2) * 0.15,
        foreLen: 0.14,
        handColor: "rgba(224, 242, 254, 0.7)",
        handRadius: 0.025,
        onWeapon: (wCtx) => {
          if (side === -1) {
            // Left hand: ice shard spear
            const shardH = size * 0.18;
            const shardW = size * 0.035;
            const iceGrad = wCtx.createLinearGradient(0, 0, 0, -shardH);
            iceGrad.addColorStop(0, "rgba(186, 230, 253, 0.9)");
            iceGrad.addColorStop(0.4, "rgba(125, 211, 252, 0.85)");
            iceGrad.addColorStop(0.8, "rgba(56, 189, 248, 0.7)");
            iceGrad.addColorStop(1, "rgba(224, 242, 254, 0.95)");

            wCtx.fillStyle = iceGrad;
            wCtx.beginPath();
            wCtx.moveTo(0, -shardH);
            wCtx.lineTo(-shardW * 0.6, -shardH * 0.6);
            wCtx.lineTo(-shardW, -shardH * 0.15);
            wCtx.lineTo(-shardW * 0.7, shardH * 0.1);
            wCtx.lineTo(shardW * 0.7, shardH * 0.1);
            wCtx.lineTo(shardW, -shardH * 0.15);
            wCtx.lineTo(shardW * 0.6, -shardH * 0.6);
            wCtx.closePath();
            wCtx.fill();

            // Inner frost facet
            wCtx.fillStyle = "rgba(224, 242, 254, 0.4)";
            wCtx.beginPath();
            wCtx.moveTo(0, -shardH * 0.95);
            wCtx.lineTo(-shardW * 0.3, -shardH * 0.4);
            wCtx.lineTo(0, -shardH * 0.1);
            wCtx.lineTo(shardW * 0.3, -shardH * 0.4);
            wCtx.closePath();
            wCtx.fill();

            // Glint at tip
            setShadowBlur(wCtx, 6 * zoom, "rgba(224, 242, 254, 0.9)");
            wCtx.fillStyle = "rgba(255, 255, 255, 0.95)";
            wCtx.beginPath();
            wCtx.arc(0, -shardH * 0.97, size * 0.008, 0, Math.PI * 2);
            wCtx.fill();
            clearShadow(wCtx);

            // Side crystal shards
            for (const cs of [-1, 1] as const) {
              wCtx.fillStyle = "rgba(125, 211, 252, 0.5)";
              wCtx.beginPath();
              wCtx.moveTo(cs * shardW * 0.8, -shardH * 0.25);
              wCtx.lineTo(cs * shardW * 1.6, -shardH * 0.45);
              wCtx.lineTo(cs * shardW * 1, -shardH * 0.5);
              wCtx.closePath();
              wCtx.fill();
            }
          } else {
            // Right hand: frost channeling gesture
            const pulseT = Math.sin(time * 4) * 0.5 + 0.5;
            const coreR = size * (0.025 + pulseT * 0.01);

            // Swirling frost particles
            for (let p = 0; p < 5; p++) {
              const angle = time * 3 + p * ((Math.PI * 2) / 5);
              const orbitR = size * (0.04 + Math.sin(time * 5 + p) * 0.01);
              const px = Math.cos(angle) * orbitR;
              const py = Math.sin(angle) * orbitR - size * 0.03;
              const pAlpha = 0.4 + Math.sin(time * 6 + p * 1.3) * 0.3;

              wCtx.fillStyle = `rgba(186, 230, 253, ${pAlpha})`;
              wCtx.beginPath();
              wCtx.arc(px, py, size * 0.006, 0, Math.PI * 2);
              wCtx.fill();
            }

            // Central ice energy core
            setShadowBlur(wCtx, 8 * zoom, "rgba(125, 211, 252, 0.8)");
            const coreGrad = wCtx.createRadialGradient(
              0,
              -size * 0.03,
              0,
              0,
              -size * 0.03,
              coreR * 2
            );
            coreGrad.addColorStop(
              0,
              `rgba(224, 242, 254, ${0.7 + pulseT * 0.3})`
            );
            coreGrad.addColorStop(0.5, "rgba(125, 211, 252, 0.4)");
            coreGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
            wCtx.fillStyle = coreGrad;
            wCtx.beginPath();
            wCtx.arc(0, -size * 0.03, coreR * 2, 0, Math.PI * 2);
            wCtx.fill();
            clearShadow(wCtx);

            // Frost wisps rising from palm
            for (let w = 0; w < 3; w++) {
              const wispY =
                -size * (0.04 + w * 0.025 + Math.sin(time * 4 + w) * 0.01);
              const wispX = Math.sin(time * 3 + w * 2) * size * 0.015;
              wCtx.strokeStyle = `rgba(186, 230, 253, ${0.3 - w * 0.08})`;
              wCtx.lineWidth = 1 * zoom;
              wCtx.beginPath();
              wCtx.moveTo(wispX, wispY);
              wCtx.quadraticCurveTo(
                wispX + size * 0.01,
                wispY - size * 0.02,
                wispX - size * 0.005,
                wispY - size * 0.035
              );
              wCtx.stroke();
            }
          }
        },
        shoulderAngle:
          side *
          (0.8 +
            (isAttacking ? attackPhase * 0.25 : 0) +
            Math.sin(time * 2.5) * 0.12),
        style: "armored",
        upperLen: 0.16,
        width: 0.04,
      }
    );
  }

  // Frost legs shuffling
  drawPathLegs(ctx, x, y + floatOffset + size * 0.25, size, time, zoom, {
    color: "rgba(186, 230, 253, 0.4)",
    colorDark: "rgba(125, 211, 252, 0.3)",
    footColor: "rgba(224, 242, 254, 0.5)",
    legLen: 0.14,
    shuffle: true,
    strideAmt: 0.2,
    strideSpeed: 3,
    style: "armored",
    width: 0.035,
  });

  // Main ghostly body with enhanced transparency layers
  // Outer transparency layer
  const outerBodyGrad = ctx.createRadialGradient(
    x,
    y + floatOffset,
    size * 0.3,
    x,
    y + floatOffset,
    size * 0.5
  );
  outerBodyGrad.addColorStop(0, `rgba(186, 230, 253, ${shimmer * 0.3})`);
  outerBodyGrad.addColorStop(1, "rgba(125, 211, 252, 0)");
  ctx.fillStyle = outerBodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + floatOffset,
    size * 0.5,
    size * 0.5 * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Main ghostly body
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + floatOffset,
    0,
    x,
    y + floatOffset,
    size * 0.45
  );
  bodyGrad.addColorStop(0, `rgba(255, 255, 255, ${shimmer * 0.9})`);
  bodyGrad.addColorStop(0.4, `rgba(186, 230, 253, ${shimmer * 0.7})`);
  bodyGrad.addColorStop(0.8, `rgba(125, 211, 252, ${shimmer * 0.4})`);
  bodyGrad.addColorStop(1, "rgba(125, 211, 252, 0)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + floatOffset + size * 0.3);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y + floatOffset,
    x - size * 0.2,
    y + floatOffset - size * 0.35
  );
  ctx.quadraticCurveTo(
    x,
    y + floatOffset - size * 0.5,
    x + size * 0.2,
    y + floatOffset - size * 0.35
  );
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y + floatOffset,
    x + size * 0.3,
    y + floatOffset + size * 0.3
  );
  // Wispy bottom
  for (let w = 0; w < 5; w++) {
    const wispX = x + size * 0.3 - w * size * 0.15;
    const wispY =
      y + floatOffset + size * 0.3 + Math.sin(time * 4 + w) * size * 0.08;
    ctx.lineTo(wispX, wispY + size * 0.15);
    ctx.lineTo(wispX - size * 0.075, y + floatOffset + size * 0.3);
  }
  ctx.closePath();
  ctx.fill();

  // Angular facet lines across the body (crystal geometry)
  ctx.strokeStyle = `rgba(200, 240, 255, ${shimmer * 0.25})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22, y + floatOffset - size * 0.1);
  ctx.lineTo(x + size * 0.08, y + floatOffset - size * 0.32);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y + floatOffset - size * 0.05);
  ctx.lineTo(x - size * 0.05, y + floatOffset - size * 0.28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + floatOffset + size * 0.1);
  ctx.lineTo(x + size * 0.18, y + floatOffset - size * 0.12);
  ctx.stroke();

  // Crystalline faceted body: closed polygonal face outlines (cut ice / crystal panels)
  const frostBodyY = y + floatOffset;
  ctx.save();
  ctx.lineJoin = "miter";
  ctx.strokeStyle = `rgba(224, 248, 255, ${shimmer * 0.34})`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, frostBodyY - size * 0.28);
  ctx.lineTo(x + size * 0.05, frostBodyY - size * 0.38);
  ctx.lineTo(x + size * 0.18, frostBodyY - size * 0.22);
  ctx.lineTo(x + size * 0.1, frostBodyY - size * 0.08);
  ctx.lineTo(x - size * 0.08, frostBodyY - size * 0.12);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, frostBodyY + size * 0.02);
  ctx.lineTo(x - size * 0.05, frostBodyY + size * 0.18);
  ctx.lineTo(x + size * 0.12, frostBodyY + size * 0.12);
  ctx.lineTo(x + size * 0.22, frostBodyY - size * 0.02);
  ctx.lineTo(x + size * 0.08, frostBodyY - size * 0.08);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.28, frostBodyY - size * 0.08);
  ctx.lineTo(x - size * 0.22, frostBodyY - size * 0.25);
  ctx.lineTo(x - size * 0.08, frostBodyY - size * 0.2);
  ctx.lineTo(x - size * 0.14, frostBodyY - size * 0.05);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, frostBodyY - size * 0.06);
  ctx.lineTo(x + size * 0.22, frostBodyY - size * 0.24);
  ctx.lineTo(x + size * 0.08, frostBodyY - size * 0.18);
  ctx.lineTo(x + size * 0.14, frostBodyY - size * 0.04);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.06, frostBodyY - size * 0.42);
  ctx.lineTo(x + size * 0.08, frostBodyY - size * 0.44);
  ctx.lineTo(x + size * 0.04, frostBodyY - size * 0.32);
  ctx.lineTo(x - size * 0.04, frostBodyY - size * 0.3);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // Internal fracture lines (lighter, inside the translucent body)
  ctx.strokeStyle = `rgba(224, 250, 255, ${shimmer * 0.18})`;
  ctx.lineWidth = 0.5 * zoom;
  for (let fr = 0; fr < 4; fr++) {
    const frStartX = x - size * 0.12 + fr * size * 0.08;
    const frStartY =
      y + floatOffset - size * 0.2 + Math.sin(fr * 1.8) * size * 0.08;
    ctx.beginPath();
    ctx.moveTo(frStartX, frStartY);
    ctx.lineTo(frStartX + size * 0.06, frStartY + size * 0.12);
    ctx.lineTo(frStartX + size * 0.02, frStartY + size * 0.18);
    ctx.stroke();
  }

  // Internal crystal lattice lines visible through translucent body
  const latticeCx = x;
  const latticeCy = frostBodyY - size * 0.1;
  ctx.strokeStyle = `rgba(200, 245, 255, ${shimmer * 0.16})`;
  ctx.lineWidth = 0.45 * zoom;
  for (let spoke = 0; spoke < 6; spoke++) {
    const sa = (spoke / 6) * Math.PI * 2 + time * 0.12;
    ctx.beginPath();
    ctx.moveTo(latticeCx, latticeCy);
    ctx.lineTo(
      latticeCx + Math.cos(sa) * size * 0.2,
      latticeCy + Math.sin(sa) * size * 0.12
    );
    ctx.stroke();
  }
  for (let tri = 0; tri < 4; tri++) {
    const ta = (tri / 4) * Math.PI * 2 + 0.2;
    const tx = latticeCx + Math.cos(ta) * size * 0.11;
    const ty = latticeCy + Math.sin(ta) * size * 0.07;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(
      tx + Math.cos(ta + 2.1) * size * 0.09,
      ty + Math.sin(ta + 2.1) * size * 0.06
    );
    ctx.lineTo(
      tx + Math.cos(ta - 2.1) * size * 0.09,
      ty + Math.sin(ta - 2.1) * size * 0.06
    );
    ctx.closePath();
    ctx.stroke();
  }
  ctx.strokeStyle = `rgba(186, 230, 253, ${shimmer * 0.12})`;
  ctx.lineWidth = 0.4 * zoom;
  for (let hexRing = 0; hexRing < 3; hexRing++) {
    const hr = size * (0.06 + hexRing * 0.055);
    ctx.beginPath();
    for (let hv = 0; hv <= 6; hv++) {
      const ha = (hv / 6) * Math.PI * 2 - Math.PI / 6;
      const hx = latticeCx + Math.cos(ha) * hr;
      const hy = latticeCy + Math.sin(ha) * hr * ISO_Y_RATIO;
      if (hv === 0) {
        ctx.moveTo(hx, hy);
      } else {
        ctx.lineTo(hx, hy);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Inner body glow (core shine)
  const coreGrad = ctx.createRadialGradient(
    x,
    y + floatOffset - size * 0.1,
    0,
    x,
    y + floatOffset,
    size * 0.2
  );
  coreGrad.addColorStop(0, `rgba(255, 255, 255, ${shimmer * 0.4})`);
  coreGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(x, y + floatOffset - size * 0.1, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Icicle protrusions from shoulders and head
  ctx.fillStyle = `rgba(200, 240, 255, ${shimmer * 0.6})`;
  const iciclePoints = [
    { angle: -0.6, len: 0.1, ox: -size * 0.25, oy: -size * 0.25 },
    { angle: 0.6, len: 0.1, ox: size * 0.25, oy: -size * 0.25 },
    { angle: -0.3, len: 0.08, ox: -size * 0.08, oy: -size * 0.42 },
    { angle: 0.3, len: 0.08, ox: size * 0.08, oy: -size * 0.42 },
    { angle: 0, len: 0.09, ox: 0, oy: -size * 0.48 },
  ];
  for (const ip of iciclePoints) {
    const ipx = x + ip.ox;
    const ipy = y + floatOffset + ip.oy;
    const tipX = ipx + Math.sin(ip.angle) * size * ip.len;
    const tipY = ipy - size * ip.len;
    ctx.beginPath();
    ctx.moveTo(ipx - size * 0.012, ipy);
    ctx.lineTo(tipX, tipY);
    ctx.lineTo(ipx + size * 0.012, ipy);
    ctx.closePath();
    ctx.fill();
  }

  // Icicle fingers/hands reaching outward
  // Left hand
  ctx.save();
  ctx.translate(x - size * 0.3, y + floatOffset + size * 0.05);
  ctx.fillStyle = `rgba(186, 230, 253, ${shimmer * 0.7})`;
  for (let f = 0; f < 4; f++) {
    const fingerAngle = -0.6 + f * 0.25;
    const fingerLen = size * (0.08 + f * 0.01);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      -Math.cos(fingerAngle) * fingerLen,
      -Math.sin(fingerAngle) * fingerLen
    );
    ctx.lineTo(
      -Math.cos(fingerAngle) * fingerLen - size * 0.01,
      -Math.sin(fingerAngle) * fingerLen + size * 0.01
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // Right hand
  ctx.save();
  ctx.translate(x + size * 0.3, y + floatOffset + size * 0.05);
  ctx.fillStyle = `rgba(186, 230, 253, ${shimmer * 0.7})`;
  for (let f = 0; f < 4; f++) {
    const fingerAngle = -0.6 + f * 0.25;
    const fingerLen = size * (0.08 + f * 0.01);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(fingerAngle) * fingerLen,
      -Math.sin(fingerAngle) * fingerLen
    );
    ctx.lineTo(
      Math.cos(fingerAngle) * fingerLen + size * 0.01,
      -Math.sin(fingerAngle) * fingerLen + size * 0.01
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Crystalline ice shards orbiting the body
  for (let c = 0; c < 5; c++) {
    const crystalAngle = frostSwirl + c * Math.PI * 0.4;
    const crystalDist = size * 0.45 + Math.sin(time * 2 + c) * size * 0.1;
    const cx2 = x + Math.cos(crystalAngle) * crystalDist;
    const cy2 = y + floatOffset + Math.sin(crystalAngle) * crystalDist * 0.4;
    const cSize = size * 0.04 + Math.sin(time * 3 + c) * size * 0.01;

    ctx.fillStyle = `rgba(224, 242, 254, ${shimmer})`;
    setShadowBlur(ctx, 3 * zoom, "#bae6fd");
    ctx.beginPath();
    ctx.moveTo(cx2, cy2 - cSize * 2.5);
    ctx.lineTo(cx2 + cSize, cy2 - cSize * 0.5);
    ctx.lineTo(cx2 + cSize * 0.6, cy2 + cSize);
    ctx.lineTo(cx2 - cSize * 0.6, cy2 + cSize);
    ctx.lineTo(cx2 - cSize, cy2 - cSize * 0.5);
    ctx.closePath();
    ctx.fill();
    // Crystal highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${shimmer * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(cx2, cy2 - cSize * 2);
    ctx.lineTo(cx2 + cSize * 0.3, cy2 - cSize * 0.5);
    ctx.lineTo(cx2, cy2);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);
  }

  // Attack: ice shards launch outward + frost burst
  if (isAttacking) {
    for (let s = 0; s < 6; s++) {
      const shardAngle = (s / 6) * Math.PI * 2 + time * 3;
      const shardDist = size * (0.3 + attackIntensity * 0.6);
      const sx = x + Math.cos(shardAngle) * shardDist;
      const sy = y + floatOffset + Math.sin(shardAngle) * shardDist * 0.6;
      const sSize = size * 0.03 * attackIntensity;
      ctx.fillStyle = `rgba(186, 230, 253, ${attackIntensity * 0.7})`;
      setShadowBlur(ctx, 4 * zoom, "#38bdf8");
      ctx.beginPath();
      ctx.moveTo(sx, sy - sSize * 3);
      ctx.lineTo(sx + sSize, sy);
      ctx.lineTo(sx, sy + sSize);
      ctx.lineTo(sx - sSize, sy);
      ctx.closePath();
      ctx.fill();
      clearShadow(ctx);
    }
    // Frost burst ring
    const burstRadius = size * (0.3 + attackIntensity * 0.5);
    ctx.strokeStyle = `rgba(186, 230, 253, ${attackIntensity * 0.5})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.arc(x, y + floatOffset, burstRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Face area
  // Ice crack patterns on face
  ctx.strokeStyle = `rgba(125, 211, 252, ${shimmer * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  // Left crack
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + floatOffset - size * 0.3);
  ctx.lineTo(x - size * 0.12, y + floatOffset - size * 0.22);
  ctx.lineTo(x - size * 0.16, y + floatOffset - size * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.12, y + floatOffset - size * 0.22);
  ctx.lineTo(x - size * 0.08, y + floatOffset - size * 0.17);
  ctx.stroke();
  // Right crack
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y + floatOffset - size * 0.28);
  ctx.lineTo(x + size * 0.12, y + floatOffset - size * 0.2);
  ctx.lineTo(x + size * 0.16, y + floatOffset - size * 0.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.12, y + floatOffset - size * 0.2);
  ctx.lineTo(x + size * 0.09, y + floatOffset - size * 0.14);
  ctx.stroke();

  // Eyes - dark hollows with blue glow
  ctx.fillStyle = `rgba(56, 189, 248, ${shimmer})`;
  setShadowBlur(ctx, 8 * zoom, "#38bdf8");
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y + floatOffset - size * 0.2,
    size * 0.05,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y + floatOffset - size * 0.2,
    size * 0.05,
    size * 0.07,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eye inner glow
  ctx.fillStyle = `rgba(255, 255, 255, ${shimmer * 0.5})`;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1,
    y + floatOffset - size * 0.2,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.1,
    y + floatOffset - size * 0.2,
    size * 0.02,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);

  // Sad/ethereal mouth
  ctx.strokeStyle = `rgba(56, 189, 248, ${shimmer * 0.8})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(
    x,
    y + floatOffset - size * 0.05,
    size * 0.06,
    0.2 * Math.PI,
    0.8 * Math.PI
  );
  ctx.stroke();

  // Frost breath effect (cold mist from mouth)
  const breathActive = Math.sin(time * 3);
  if (breathActive > -0.3) {
    const breathPhase = (breathActive + 0.3) / 1.3;
    ctx.strokeStyle = `rgba(186, 230, 253, ${breathPhase * 0.4})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(x, y + floatOffset + size * 0.02);
    ctx.quadraticCurveTo(
      x + breathPhase * size * 0.2,
      y + floatOffset + size * 0.08,
      x + breathPhase * size * 0.35,
      y + floatOffset + size * 0.15
    );
    ctx.stroke();
    // Additional mist particles
    for (let m = 0; m < 4; m++) {
      const mPhase = breathPhase * (0.5 + m * 0.15);
      const mx = x + mPhase * size * 0.3 + Math.sin(time * 5 + m) * size * 0.03;
      const my =
        y +
        floatOffset +
        size * 0.05 +
        mPhase * size * 0.12 +
        Math.cos(time * 4 + m) * size * 0.02;
      ctx.fillStyle = `rgba(186, 230, 253, ${(1 - mPhase) * 0.25})`;
      ctx.beginPath();
      ctx.arc(mx, my, size * 0.015 * (1 + mPhase), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Floating frost crystals
  drawFrostCrystals(ctx, x, y + floatOffset, size * 0.3, time, zoom, {
    color: "rgba(56, 189, 248, 0.45)",
    count: 4,
    glowColor: "rgba(200, 240, 255, 0.5)",
    maxAlpha: 0.35,
    speed: 1.8,
  });

  // Floating ice crystal shards
  drawShiftingSegments(ctx, x, y + floatOffset, size, time, zoom, {
    bobAmt: 0.03,
    bobSpeed: 3,
    color: "rgba(224, 242, 254, 0.8)",
    colorAlt: "rgba(186, 230, 253, 0.7)",
    count: 6,
    orbitRadius: 0.38,
    orbitSpeed: 1.2,
    rotateWithOrbit: true,
    segmentSize: 0.03,
    shape: "shard",
  });

  // Snowflake particles floating around (detailed 6-pointed)
  for (let s = 0; s < 10; s++) {
    const snowPhase = (time * 0.5 + s * 0.1) % 1;
    const snowX = x + Math.sin(time + s * 2) * size * 0.55;
    const snowY = y - size * 0.6 + snowPhase * size * 1.3;
    const snowAlpha = Math.sin(snowPhase * Math.PI) * 0.7;
    const snowSize = size * 0.015 + Math.sin(time * 2 + s) * size * 0.005;
    ctx.strokeStyle = `rgba(255, 255, 255, ${snowAlpha})`;
    ctx.lineWidth = 1 * zoom;
    // 6-pointed snowflake
    for (let arm = 0; arm < 6; arm++) {
      const aAngle = (arm / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(snowX, snowY);
      ctx.lineTo(
        snowX + Math.cos(aAngle) * snowSize * 2,
        snowY + Math.sin(aAngle) * snowSize * 2
      );
      ctx.stroke();
    }
  }
}

export function drawInfernalEnemy(
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
  region: MapTheme = "grassland"
) {
  const isAttacking = attackPhase > 0;
  const flamePulse =
    0.5 + Math.sin(time * 6) * 0.3 + (isAttacking ? attackPhase * 0.4 : 0);
  const heatWave = Math.sin(time * 4) * size * 0.02;
  const rageShake = isAttacking
    ? Math.sin(attackPhase * Math.PI * 8) * size * 0.02
    : 0;

  const infernalPalettes: Record<
    string,
    {
      flame: string;
      flameGlow: string;
      flameRgb: string;
      ember: string;
      emberGlow: string;
      crackColor: string;
      crackGlow: string;
      hornColor: string;
      hornTip: string;
      wingMembrane: string;
      groundScorch: string;
      auraRgb: string;
    }
  > = {
    desert: {
      auraRgb: "200,140,20",
      crackColor: "#ffc030",
      crackGlow: "rgba(255,192,48,0.6)",
      ember: "#f0c860",
      emberGlow: "rgba(240,200,96,VAL)",
      flame: "#e8a020",
      flameGlow: "rgba(232,160,32,VAL)",
      flameRgb: "232,160,32",
      groundScorch: "rgba(80,50,15,VAL)",
      hornColor: "#2a1a08",
      hornTip: "#ffaa00",
      wingMembrane: "rgba(160,100,20,VAL)",
    },
    grassland: {
      auraRgb: "220,40,20",
      crackColor: "#ff6020",
      crackGlow: "rgba(255,100,30,0.6)",
      ember: "#fb923c",
      emberGlow: "rgba(251,146,60,VAL)",
      flame: "#dc2626",
      flameGlow: "rgba(220,40,20,VAL)",
      flameRgb: "220,60,20",
      groundScorch: "rgba(60,20,10,VAL)",
      hornColor: "#1a0a0a",
      hornTip: "#ff4400",
      wingMembrane: "rgba(180,30,10,VAL)",
    },
    swamp: {
      auraRgb: "80,140,20",
      crackColor: "#80c030",
      crackGlow: "rgba(100,180,30,0.6)",
      ember: "#8ac040",
      emberGlow: "rgba(138,192,64,VAL)",
      flame: "#6aaa20",
      flameGlow: "rgba(100,170,30,VAL)",
      flameRgb: "100,170,30",
      groundScorch: "rgba(30,50,10,VAL)",
      hornColor: "#1a1a0a",
      hornTip: "#88cc22",
      wingMembrane: "rgba(60,100,20,VAL)",
    },
    volcanic: {
      auraRgb: "255,60,0",
      crackColor: "#ff6600",
      crackGlow: "rgba(255,100,0,0.7)",
      ember: "#ffaa00",
      emberGlow: "rgba(255,170,0,VAL)",
      flame: "#ff4400",
      flameGlow: "rgba(255,68,0,VAL)",
      flameRgb: "255,80,0",
      groundScorch: "rgba(80,30,5,VAL)",
      hornColor: "#0a0404",
      hornTip: "#ff6600",
      wingMembrane: "rgba(200,50,0,VAL)",
    },
    winter: {
      auraRgb: "50,130,200",
      crackColor: "#40a0e0",
      crackGlow: "rgba(60,160,220,0.6)",
      ember: "#60c0f0",
      emberGlow: "rgba(96,192,240,VAL)",
      flame: "#3090d0",
      flameGlow: "rgba(48,144,208,VAL)",
      flameRgb: "60,140,200",
      groundScorch: "rgba(20,40,60,VAL)",
      hornColor: "#0a1a2a",
      hornTip: "#44bbff",
      wingMembrane: "rgba(30,80,140,VAL)",
    },
  };
  const pal = infernalPalettes[region] || infernalPalettes.grassland;

  // Heat distortion aura
  const heatGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.9);
  heatGrad.addColorStop(0, `rgba(${pal.auraRgb}, ${flamePulse * 0.3})`);
  heatGrad.addColorStop(0.5, `rgba(${pal.auraRgb}, ${flamePulse * 0.15})`);
  heatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = heatGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.9, size * 0.9 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Scorch cracks on ground
  ctx.strokeStyle = pal.groundScorch.replace(
    "VAL",
    String(0.2 + flamePulse * 0.15)
  );
  ctx.lineWidth = 1 * zoom;
  for (let sc = 0; sc < 6; sc++) {
    const scAngle = (sc * Math.PI) / 3 + 0.2;
    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(scAngle) * size * 0.1,
      y + size * 0.5 + Math.sin(scAngle) * size * 0.03
    );
    ctx.lineTo(
      x + Math.cos(scAngle) * size * 0.45,
      y + size * 0.5 + Math.sin(scAngle) * size * 0.12
    );
    ctx.stroke();
  }

  // Tail with fire tip
  const tailWave = Math.sin(time * 3) * size * 0.08;
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = size * 0.05;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + rageShake, y + size * 0.35 + heatWave);
  ctx.quadraticCurveTo(
    x + size * 0.2 + tailWave + rageShake,
    y + size * 0.5 + heatWave,
    x + size * 0.35 + tailWave * 1.5 + rageShake,
    y + size * 0.4 + heatWave
  );
  ctx.stroke();
  // Demon tail: dorsal ridge (offset spine) and belly segment line
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = size * 0.022;
  ctx.beginPath();
  ctx.moveTo(x + rageShake + size * 0.02, y + size * 0.33 + heatWave);
  ctx.quadraticCurveTo(
    x + size * 0.2 + tailWave + rageShake + size * 0.04,
    y + size * 0.49 + heatWave,
    x + size * 0.35 + tailWave * 1.5 + rageShake + size * 0.025,
    y + size * 0.38 + heatWave
  );
  ctx.stroke();
  ctx.strokeStyle = "rgba(28, 25, 23, 0.85)";
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + rageShake - size * 0.015, y + size * 0.36 + heatWave);
  ctx.quadraticCurveTo(
    x + size * 0.18 + tailWave + rageShake,
    y + size * 0.51 + heatWave,
    x + size * 0.33 + tailWave * 1.45 + rageShake,
    y + size * 0.42 + heatWave
  );
  ctx.stroke();
  for (let tf = 0; tf < 3; tf++) {
    const tipFlameH = size * (0.08 + Math.sin(time * 10 + tf * 2) * 0.04);
    const tipX =
      x + size * 0.35 + tailWave * 1.5 + rageShake + tf * size * 0.015;
    const tipY = y + size * 0.4 + heatWave;
    ctx.fillStyle =
      tf === 0
        ? pal.flameGlow.replace("VAL", String(flamePulse + 0.3))
        : pal.emberGlow.replace("VAL", String(flamePulse + 0.4));
    ctx.beginPath();
    ctx.moveTo(tipX - size * 0.015, tipY);
    ctx.quadraticCurveTo(tipX, tipY - tipFlameH, tipX + size * 0.015, tipY);
    ctx.fill();
  }
  // Barbed tail tip (diamond shape)
  const barbX = x + size * 0.35 + tailWave * 1.5 + rageShake;
  const barbY = y + size * 0.4 + heatWave;
  ctx.fillStyle = "#292524";
  ctx.beginPath();
  ctx.moveTo(barbX, barbY - size * 0.04);
  ctx.lineTo(barbX + size * 0.07, barbY);
  ctx.lineTo(barbX, barbY + size * 0.04);
  ctx.lineTo(barbX - size * 0.03, barbY);
  ctx.closePath();
  ctx.fill();
  // Barb: forward spike and edge definition (pointed tail weapon)
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(barbX + size * 0.06, barbY - size * 0.015);
  ctx.lineTo(barbX + size * 0.13, barbY);
  ctx.lineTo(barbX + size * 0.06, barbY + size * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0c0a09";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(barbX, barbY - size * 0.04);
  ctx.lineTo(barbX + size * 0.07, barbY);
  ctx.lineTo(barbX, barbY + size * 0.04);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Wings (small, bat-like, burning at edges)
  for (let wing = 0; wing < 2; wing++) {
    const wingDir = wing === 0 ? -1 : 1;
    const wingFlap = Math.sin(time * 4 + wing * Math.PI) * 0.15;
    const wingX = x + wingDir * size * 0.3 + rageShake;
    const wingY = y - size * 0.15 + heatWave;

    ctx.save();
    ctx.translate(wingX, wingY);
    ctx.scale(wingDir, 1);
    ctx.rotate(wingFlap);

    ctx.fillStyle = pal.wingMembrane.replace(
      "VAL",
      String(0.7 + flamePulse * 0.2)
    );
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(size * 0.15, -size * 0.25, size * 0.35, -size * 0.15);
    ctx.quadraticCurveTo(size * 0.3, -size * 0.05, size * 0.25, size * 0.05);
    ctx.quadraticCurveTo(size * 0.15, -size * 0.1, size * 0.1, size * 0.02);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Wing bone struts
    ctx.strokeStyle = "#292524";
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size * 0.32, -size * 0.14);
    ctx.moveTo(size * 0.08, -size * 0.02);
    ctx.lineTo(size * 0.25, -size * 0.18);
    ctx.moveTo(size * 0.15, 0);
    ctx.lineTo(size * 0.28, -size * 0.08);
    ctx.stroke();

    // Burning edge flames
    for (let ef = 0; ef < 4; ef++) {
      const edgeT = ef / 3;
      const edgeX = size * (0.1 + edgeT * 0.25);
      const edgeY = -size * (0.05 + Math.sin(edgeT * Math.PI) * 0.15);
      const edgeFlameH = size * (0.06 + Math.sin(time * 8 + ef * 1.5) * 0.03);
      ctx.fillStyle = pal.emberGlow.replace(
        "VAL",
        String(0.5 + Math.sin(time * 7 + ef) * 0.3)
      );
      ctx.beginPath();
      ctx.moveTo(edgeX - size * 0.01, edgeY);
      ctx.quadraticCurveTo(
        edgeX,
        edgeY - edgeFlameH,
        edgeX + size * 0.01,
        edgeY
      );
      ctx.fill();
    }

    ctx.restore();
  }

  // Infernal arms — aggressive fire punching
  for (const side of [-1, 1] as const) {
    drawPathArm(
      ctx,
      x + side * size * 0.32 + rageShake,
      y - size * 0.08 + heatWave,
      size,
      time,
      zoom,
      side,
      {
        color: bodyColorDark,
        colorDark: "#1c1917",
        elbowAngle: 0.4 + Math.sin(time * 5 + side * 1.5) * 0.2,
        foreLen: 0.18,
        handColor: pal.emberGlow.replace("VAL", String(flamePulse)),
        handRadius: 0.03,
        shoulderAngle:
          side *
          (0.6 +
            Math.sin(time * 4 + side * Math.PI) * 0.2 +
            (isAttacking ? attackPhase * 0.6 : 0)),
        style: "armored",
        upperLen: 0.2,
        width: 0.06,
      }
    );
  }

  // Fire-stepping legs
  drawPathLegs(
    ctx,
    x + rageShake,
    y + size * 0.35 + heatWave,
    size,
    time,
    zoom,
    {
      color: bodyColorDark,
      colorDark: "#1c1917",
      footColor: pal.emberGlow.replace("VAL", String(flamePulse * 0.5)),
      legLen: 0.18,
      strideAmt: 0.25,
      strideSpeed: 4,
      style: "armored",
      width: 0.06,
    }
  );

  // Cloven hoof shapes at feet
  for (const hs of [-1, 1] as const) {
    const stride = Math.sin(time * 4 + (hs === 1 ? Math.PI : 0)) * size * 0.06;
    const hoofX = x + hs * size * 0.1 + rageShake + stride;
    const hoofY = y + size * 0.53 + heatWave;
    ctx.fillStyle = "#1c1917";
    ctx.beginPath();
    ctx.moveTo(hoofX - size * 0.025, hoofY - size * 0.02);
    ctx.lineTo(hoofX - size * 0.035, hoofY + size * 0.015);
    ctx.lineTo(hoofX - size * 0.005, hoofY + size * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hoofX + size * 0.025, hoofY - size * 0.02);
    ctx.lineTo(hoofX + size * 0.035, hoofY + size * 0.015);
    ctx.lineTo(hoofX + size * 0.005, hoofY + size * 0.01);
    ctx.closePath();
    ctx.fill();
    // Cloven hoof: toe outlines and central split groove
    ctx.strokeStyle = "#0c0a09";
    ctx.lineWidth = 0.85 * zoom;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(hoofX - size * 0.028, hoofY - size * 0.024);
    ctx.quadraticCurveTo(
      hoofX - size * 0.042,
      hoofY + size * 0.012,
      hoofX - size * 0.012,
      hoofY + size * 0.014
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hoofX + size * 0.028, hoofY - size * 0.024);
    ctx.quadraticCurveTo(
      hoofX + size * 0.042,
      hoofY + size * 0.012,
      hoofX + size * 0.012,
      hoofY + size * 0.014
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hoofX, hoofY - size * 0.03);
    ctx.quadraticCurveTo(
      hoofX - size * 0.006,
      hoofY + size * 0.01,
      hoofX - size * 0.02,
      hoofY + size * 0.016
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hoofX, hoofY - size * 0.03);
    ctx.quadraticCurveTo(
      hoofX + size * 0.006,
      hoofY + size * 0.01,
      hoofX + size * 0.02,
      hoofY + size * 0.016
    );
    ctx.stroke();
    ctx.lineJoin = "miter";
  }

  // Body - cracked obsidian with muscular detail
  const bodyGrad = ctx.createLinearGradient(
    x - size * 0.35,
    y - size * 0.3,
    x + size * 0.35,
    y + size * 0.3
  );
  bodyGrad.addColorStop(0, "#1c1917");
  bodyGrad.addColorStop(0.3, bodyColor);
  bodyGrad.addColorStop(0.7, bodyColorDark);
  bodyGrad.addColorStop(1, "#1c1917");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + rageShake,
    y + heatWave,
    size * 0.35,
    size * 0.4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Cracked skin: warmer fill visible in fissures beneath surface (no glow)
  const emberCrack = `rgba(253, 186, 116, ${0.32 + flamePulse * 0.2})`;
  const emberCrackHot = `rgba(254, 215, 170, ${0.22 + flamePulse * 0.18})`;
  ctx.fillStyle = emberCrack;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1 + rageShake, y - size * 0.34 + heatWave);
  ctx.lineTo(x - size * 0.2 + rageShake, y - size * 0.05 + heatWave);
  ctx.lineTo(x - size * 0.04 + rageShake, y + size * 0.02 + heatWave);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.14 + rageShake, y - size * 0.3 + heatWave);
  ctx.lineTo(x + size * 0.08 + rageShake, y + size * 0.12 + heatWave);
  ctx.lineTo(x + size * 0.22 + rageShake, y + size * 0.3 + heatWave);
  ctx.lineTo(x + size * 0.26 + rageShake, y + size * 0.06 + heatWave);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = emberCrackHot;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.26 + rageShake, y - size * 0.14 + heatWave);
  ctx.lineTo(x + rageShake, y - size * 0.05 + heatWave);
  ctx.lineTo(x + size * 0.24 + rageShake, y - size * 0.13 + heatWave);
  ctx.lineTo(x + size * 0.08 + rageShake, y - size * 0.22 + heatWave);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + rageShake, y + size * 0.08 + heatWave);
  ctx.lineTo(x - size * 0.18 + rageShake, y + size * 0.22 + heatWave);
  ctx.lineTo(x + rageShake, y + size * 0.28 + heatWave);
  ctx.lineTo(x + size * 0.16 + rageShake, y + size * 0.18 + heatWave);
  ctx.closePath();
  ctx.fill();

  // Muscular torso detail
  ctx.strokeStyle = "rgba(30, 20, 15, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + rageShake, y - size * 0.25 + heatWave);
  ctx.lineTo(x + rageShake, y + size * 0.3 + heatWave);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x - size * 0.08 + rageShake,
    y - size * 0.12 + heatWave,
    size * 0.12,
    -0.3,
    Math.PI * 0.6
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.08 + rageShake,
    y - size * 0.12 + heatWave,
    size * 0.12,
    Math.PI * 0.4,
    Math.PI + 0.3
  );
  ctx.stroke();
  for (let ab = 0; ab < 3; ab++) {
    const abY = y + size * ab * 0.1 + heatWave;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.12 + rageShake, abY);
    ctx.quadraticCurveTo(
      x + rageShake,
      abY - size * 0.015,
      x + size * 0.12 + rageShake,
      abY
    );
    ctx.stroke();
  }

  // Lava/magma veins glowing across the body
  ctx.strokeStyle = pal.emberGlow.replace("VAL", String(flamePulse + 0.3));
  setShadowBlur(ctx, 4 * zoom, pal.crackColor);
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1 + rageShake, y - size * 0.35 + heatWave);
  ctx.bezierCurveTo(
    x - size * 0.2,
    y - size * 0.15,
    x - size * 0.08,
    y + size * 0.05,
    x - size * 0.15,
    y + size * 0.3
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15 + rageShake, y - size * 0.3 + heatWave);
  ctx.bezierCurveTo(
    x + size * 0.08,
    y - size * 0.1,
    x + size * 0.18,
    y + size * 0.1,
    x + size * 0.1,
    y + size * 0.35
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3 + rageShake, y - size * 0.1 + heatWave);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.05 + heatWave,
    x + size * 0.25,
    y - size * 0.12 + heatWave
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.25 + rageShake, y + size * 0.15 + heatWave);
  ctx.quadraticCurveTo(
    x,
    y + size * 0.2 + heatWave,
    x + size * 0.28,
    y + size * 0.12 + heatWave
  );
  ctx.stroke();
  for (let bv = 0; bv < 4; bv++) {
    const bvAngle = bv * Math.PI * 0.5 + 0.4;
    const bvX = x + Math.cos(bvAngle) * size * 0.15 + rageShake;
    const bvY = y + Math.sin(bvAngle) * size * 0.15 + heatWave;
    ctx.beginPath();
    ctx.moveTo(bvX, bvY);
    ctx.lineTo(
      bvX + Math.cos(bvAngle + 0.3) * size * 0.1,
      bvY + Math.sin(bvAngle + 0.3) * size * 0.1
    );
    ctx.stroke();
  }
  clearShadow(ctx);

  // Jagged cracked skin lines revealing fire underneath
  ctx.strokeStyle = pal.flameGlow.replace("VAL", String(flamePulse * 0.5));
  ctx.lineWidth = 0.8 * zoom;
  for (let cs = 0; cs < 5; cs++) {
    const csAngle = cs * Math.PI * 0.4 + 0.3;
    const csX = x + Math.cos(csAngle) * size * 0.18 + rageShake;
    const csY = y + Math.sin(csAngle) * size * 0.2 + heatWave;
    ctx.beginPath();
    ctx.moveTo(csX, csY);
    ctx.lineTo(csX + size * 0.03, csY + size * 0.02);
    ctx.lineTo(csX + size * 0.05, csY - size * 0.01);
    ctx.lineTo(csX + size * 0.08, csY + size * 0.015);
    ctx.stroke();
  }

  // Glowing cracks on body (wider)
  ctx.strokeStyle = pal.emberGlow.replace("VAL", String(flamePulse + 0.4));
  setShadowBlur(ctx, 6 * zoom, pal.crackColor);
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.35);
  ctx.lineTo(x - size * 0.15, y);
  ctx.lineTo(x - size * 0.05, y + size * 0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15, y - size * 0.3);
  ctx.lineTo(x + size * 0.1, y + size * 0.1);
  ctx.lineTo(x + size * 0.18, y + size * 0.35);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.1);
  ctx.lineTo(x, y - size * 0.05);
  ctx.lineTo(x + size * 0.25, y - size * 0.12);
  ctx.stroke();
  clearShadow(ctx);

  // Flaming head
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(
    x + rageShake,
    y - size * 0.35 + heatWave,
    size * 0.22,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Fire hair/mane that flickers upward
  for (let f = 0; f < 9; f++) {
    const flameHeight = size * (0.28 + Math.sin(time * 8 + f * 1) * 0.12);
    const flameX = x - size * 0.2 + f * size * 0.05 + rageShake;
    const flameY = y - size * 0.5 + heatWave;
    const flameWobble = Math.sin(time * 10 + f * 2.1) * size * 0.02;

    ctx.fillStyle = pal.flameGlow.replace("VAL", String(flamePulse + 0.3));
    ctx.beginPath();
    ctx.moveTo(flameX, flameY);
    ctx.quadraticCurveTo(
      flameX - size * 0.035 + flameWobble,
      flameY - flameHeight * 0.5,
      flameX + flameWobble * 0.5,
      flameY - flameHeight
    );
    ctx.quadraticCurveTo(
      flameX + size * 0.035 + flameWobble,
      flameY - flameHeight * 0.5,
      flameX,
      flameY
    );
    ctx.fill();

    ctx.fillStyle = pal.emberGlow.replace("VAL", String(flamePulse + 0.4));
    ctx.beginPath();
    ctx.moveTo(flameX, flameY);
    ctx.quadraticCurveTo(
      flameX - size * 0.018 + flameWobble,
      flameY - flameHeight * 0.35,
      flameX + flameWobble * 0.3,
      flameY - flameHeight * 0.65
    );
    ctx.quadraticCurveTo(
      flameX + size * 0.018 + flameWobble,
      flameY - flameHeight * 0.35,
      flameX,
      flameY
    );
    ctx.fill();

    // White-hot core on some flames
    if (f % 3 === 0) {
      ctx.fillStyle = `rgba(255, 255, 220, ${flamePulse * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(flameX, flameY);
      ctx.quadraticCurveTo(
        flameX - size * 0.008,
        flameY - flameHeight * 0.2,
        flameX,
        flameY - flameHeight * 0.35
      );
      ctx.quadraticCurveTo(
        flameX + size * 0.008,
        flameY - flameHeight * 0.2,
        flameX,
        flameY
      );
      ctx.fill();
    }
  }

  // Detailed demon horns (curved, with ridges)
  for (let horn = 0; horn < 2; horn++) {
    const hornDir = horn === 0 ? -1 : 1;
    const hornBaseX = x + hornDir * size * 0.15 + rageShake;
    const hornBaseY = y - size * 0.5 + heatWave;
    const hornTipX = x + hornDir * size * 0.4 + rageShake;
    const hornTipY = y - size * 0.7 + heatWave;
    const hornMidX = x + hornDir * size * 0.3 + rageShake;
    const hornMidY = y - size * 0.72 + heatWave;

    ctx.fillStyle = "#292524";
    ctx.beginPath();
    ctx.moveTo(hornBaseX, hornBaseY);
    ctx.quadraticCurveTo(hornMidX, hornMidY, hornTipX, hornTipY + size * 0.05);
    ctx.quadraticCurveTo(
      hornMidX - hornDir * size * 0.02,
      hornMidY + size * 0.04,
      hornBaseX - hornDir * size * 0.04,
      hornBaseY + size * 0.03
    );
    ctx.closePath();
    ctx.fill();

    // Horn ridges
    ctx.strokeStyle = "rgba(80, 60, 40, 0.6)";
    ctx.lineWidth = 1 * zoom;
    for (let ridge = 0; ridge < 4; ridge++) {
      const t = (ridge + 1) / 5;
      const rx = hornBaseX + (hornTipX - hornBaseX) * t;
      const ry = hornBaseY + (hornTipY + size * 0.025 - hornBaseY) * t;
      const rw = size * 0.03 * (1 - t * 0.6);
      ctx.beginPath();
      ctx.moveTo(rx - hornDir * rw, ry - rw * 0.3);
      ctx.lineTo(rx + hornDir * rw, ry + rw * 0.3);
      ctx.stroke();
    }
    // Deeper groove lines between ridges
    ctx.strokeStyle = "rgba(50, 35, 25, 0.45)";
    ctx.lineWidth = 0.6 * zoom;
    for (let dg = 0; dg < 3; dg++) {
      const dt = (dg + 1.5) / 5;
      const dgx = hornBaseX + (hornTipX - hornBaseX) * dt;
      const dgy = hornBaseY + (hornTipY + size * 0.025 - hornBaseY) * dt;
      const dgw = size * 0.025 * (1 - dt * 0.6);
      ctx.beginPath();
      ctx.moveTo(dgx - hornDir * dgw, dgy - dgw * 0.2);
      ctx.lineTo(dgx + hornDir * dgw, dgy + dgw * 0.2);
      ctx.stroke();
    }

    // Horizontal ridges across horn (perpendicular to outer curve)
    const tipCurveY = hornTipY + size * 0.05;
    ctx.strokeStyle = "rgba(45, 38, 30, 0.82)";
    ctx.lineWidth = 0.95 * zoom;
    for (let hr = 0; hr < 7; hr++) {
      const t = 0.1 + hr * 0.12;
      const mt = 1 - t;
      const px = mt * mt * hornBaseX + 2 * mt * t * hornMidX + t * t * hornTipX;
      const py =
        mt * mt * hornBaseY + 2 * mt * t * hornMidY + t * t * tipCurveY;
      const dx =
        2 * mt * (hornMidX - hornBaseX) + 2 * t * (hornTipX - hornMidX);
      const dy =
        2 * mt * (hornMidY - hornBaseY) + 2 * t * (tipCurveY - hornMidY);
      const dlen = Math.hypot(dx, dy) || 1;
      const nx = -dy / dlen;
      const ny = dx / dlen;
      const hw = size * 0.038 * (1 - t * 0.55);
      ctx.beginPath();
      ctx.moveTo(px + nx * hw, py + ny * hw);
      ctx.lineTo(px - nx * hw, py - ny * hw);
      ctx.stroke();
    }

    // Horn tip glow
    ctx.fillStyle = pal.flameGlow.replace(
      "VAL",
      String(0.4 + Math.sin(time * 5 + horn) * 0.2)
    );
    setShadowBlur(ctx, 4 * zoom, pal.hornTip);
    ctx.beginPath();
    ctx.arc(hornTipX, hornTipY + size * 0.05, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);
  }

  // Glowing eyes with slit pupils
  ctx.fillStyle = pal.emberGlow.replace("VAL", String(flamePulse + 0.5));
  setShadowBlur(ctx, 10 * zoom, pal.flame);
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08 + rageShake,
    y - size * 0.38 + heatWave,
    size * 0.04,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08 + rageShake,
    y - size * 0.38 + heatWave,
    size * 0.04,
    size * 0.05,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.08 + rageShake,
    y - size * 0.38 + heatWave,
    size * 0.012,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.08 + rageShake,
    y - size * 0.38 + heatWave,
    size * 0.012,
    size * 0.04,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);

  // Fanged mouth with more teeth
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.arc(x + rageShake, y - size * 0.28 + heatWave, size * 0.08, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#f5f5f4";
  const fangPositions = [-0.06, -0.03, 0.03, 0.06];
  const fangLengths = [0.09, 0.06, 0.06, 0.09];
  for (let fi = 0; fi < fangPositions.length; fi++) {
    ctx.beginPath();
    ctx.moveTo(
      x + size * (fangPositions[fi] - 0.012) + rageShake,
      y - size * 0.28 + heatWave
    );
    ctx.lineTo(
      x + size * fangPositions[fi] + rageShake,
      y - size * (0.28 - fangLengths[fi]) + heatWave
    );
    ctx.lineTo(
      x + size * (fangPositions[fi] + 0.012) + rageShake,
      y - size * 0.28 + heatWave
    );
    ctx.fill();
  }

  // Clawed arms with fire
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.1);
  ctx.quadraticCurveTo(
    x - size * 0.5,
    y + size * 0.1,
    x - size * 0.45,
    y + size * 0.3
  );
  ctx.lineTo(x - size * 0.35, y + size * 0.25);
  ctx.quadraticCurveTo(
    x - size * 0.4,
    y + size * 0.1,
    x - size * 0.25,
    y - size * 0.05
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.3, y - size * 0.1);
  ctx.quadraticCurveTo(
    x + size * 0.5,
    y + size * 0.1,
    x + size * 0.45,
    y + size * 0.3
  );
  ctx.lineTo(x + size * 0.35, y + size * 0.25);
  ctx.quadraticCurveTo(
    x + size * 0.4,
    y + size * 0.1,
    x + size * 0.25,
    y - size * 0.05
  );
  ctx.fill();

  // Claw fingers (3 per hand)
  for (let hand = 0; hand < 2; hand++) {
    const handDir = hand === 0 ? -1 : 1;
    const handX = x + handDir * size * 0.45;
    const handY = y + size * 0.3;
    for (let claw = 0; claw < 3; claw++) {
      const clawAngle =
        (claw - 1) * 0.3 + (hand === 0 ? Math.PI * 0.6 : Math.PI * 0.4);
      ctx.strokeStyle = bodyColorDark;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(
        handX + Math.cos(clawAngle) * size * 0.08 * handDir,
        handY + Math.sin(clawAngle) * size * 0.08
      );
      ctx.stroke();

      ctx.fillStyle = pal.emberGlow.replace("VAL", String(flamePulse));
      setShadowBlur(ctx, 3 * zoom, pal.crackColor);
      ctx.beginPath();
      ctx.arc(
        handX + Math.cos(clawAngle) * size * 0.08 * handDir,
        handY + Math.sin(clawAngle) * size * 0.08,
        size * 0.018,
        0,
        Math.PI * 2
      );
      ctx.fill();
      clearShadow(ctx);
    }
  }

  // Rising embers/cinders
  for (let e = 0; e < 10; e++) {
    const emberPhase = (time * 1.5 + e * 0.1) % 1;
    const emberX = x + Math.sin(time * 2 + e * 1.8) * size * 0.4;
    const emberY = y + size * 0.3 - emberPhase * size * 1.5;
    const emberAlpha = (1 - emberPhase) * 0.8;
    const emberSize = size * (0.025 - emberPhase * 0.018);

    ctx.fillStyle = pal.emberGlow.replace("VAL", String(emberAlpha));
    setShadowBlur(ctx, 3 * zoom, pal.ember);
    ctx.beginPath();
    ctx.arc(emberX, emberY, emberSize, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    if (emberPhase < 0.7) {
      ctx.strokeStyle = pal.emberGlow.replace("VAL", String(emberAlpha * 0.4));
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(emberX, emberY);
      ctx.lineTo(
        emberX - Math.sin(time * 3 + e) * size * 0.02,
        emberY + size * 0.04
      );
      ctx.stroke();
    }
  }

  // Rising ember sparks
  drawEmberSparks(ctx, x + rageShake, y + heatWave, size * 0.35, time, zoom, {
    color: pal.emberGlow.replace("VAL", "0.55"),
    coreColor: "rgba(255, 240, 180, 0.85)",
    count: 6,
    maxAlpha: 0.45,
    speed: 2,
  });

  // Floating ember segments
  drawShiftingSegments(ctx, x + rageShake, y + heatWave, size, time, zoom, {
    bobAmt: 0.04,
    bobSpeed: 4,
    color: pal.flameGlow.replace("VAL", "0.7"),
    colorAlt: pal.emberGlow.replace("VAL", "0.6"),
    count: 7,
    orbitRadius: 0.4,
    orbitSpeed: 1.5,
    rotateWithOrbit: true,
    segmentSize: 0.03,
    shape: "diamond",
  });

  // Attack: body engulfs in fire, fireball forms between hands
  if (isAttacking) {
    const engulfGrad = ctx.createRadialGradient(x, y, 0, x, y, size * 0.6);
    engulfGrad.addColorStop(0, `rgba(${pal.flameRgb}, ${attackPhase * 0.4})`);
    engulfGrad.addColorStop(0.5, `rgba(${pal.auraRgb}, ${attackPhase * 0.3})`);
    engulfGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = engulfGrad;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.6, size * 0.6 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
    ctx.fill();

    const fireballX = x + rageShake;
    const fireballY = y + size * 0.2 + heatWave;
    const fireballSize = size * 0.12 * attackPhase;

    const fbGrad = ctx.createRadialGradient(
      fireballX,
      fireballY,
      0,
      fireballX,
      fireballY,
      fireballSize
    );
    fbGrad.addColorStop(0, `rgba(255, 255, 200, ${attackPhase})`);
    fbGrad.addColorStop(0.3, `rgba(${pal.flameRgb}, ${attackPhase * 0.9})`);
    fbGrad.addColorStop(0.7, `rgba(${pal.auraRgb}, ${attackPhase * 0.7})`);
    fbGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fbGrad;
    setShadowBlur(ctx, 15 * zoom, pal.ember);
    ctx.beginPath();
    ctx.arc(fireballX, fireballY, fireballSize, 0, Math.PI * 2);
    ctx.fill();
    clearShadow(ctx);

    for (let burst = 0; burst < 8; burst++) {
      const burstAngle = burst * Math.PI * 0.25 + time * 3;
      const burstDist = size * (0.35 + attackPhase * 0.15);
      const burstH =
        size * (0.15 + Math.sin(time * 10 + burst) * 0.06) * attackPhase;
      const bx = x + Math.cos(burstAngle) * burstDist;
      const by = y + Math.sin(burstAngle) * burstDist * 0.8;
      ctx.fillStyle = pal.emberGlow.replace("VAL", String(attackPhase * 0.6));
      ctx.beginPath();
      ctx.moveTo(bx - size * 0.02, by);
      ctx.quadraticCurveTo(bx, by - burstH, bx + size * 0.02, by);
      ctx.fill();
    }
  }

  // Region-specific visual details
  if (region === "swamp") {
    // Toxic gas wisps rising from body
    for (let gw = 0; gw < 5; gw++) {
      const gwPhase = (time * 0.8 + gw * 0.2) % 1;
      const gwX = x + Math.sin(time * 1.5 + gw * 1.3) * size * 0.3;
      const gwY = y - gwPhase * size * 1.2;
      const gwAlpha = (1 - gwPhase) * 0.35;
      const gwSize = size * (0.04 + gwPhase * 0.03);
      ctx.fillStyle = `rgba(100, 170, 30, ${gwAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        gwX,
        gwY,
        gwSize,
        gwSize * 1.5,
        Math.sin(time + gw) * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Green dripping slime from lower body
    for (let ds = 0; ds < 4; ds++) {
      const dripX = x + (ds - 1.5) * size * 0.12 + rageShake;
      const dripLen = size * (0.06 + Math.sin(time * 3 + ds * 1.7) * 0.03);
      const dripY = y + size * 0.35 + heatWave;
      ctx.strokeStyle = `rgba(80, 160, 20, ${0.5 + Math.sin(time * 2 + ds) * 0.2})`;
      ctx.lineWidth = 2 * zoom;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(dripX, dripY);
      ctx.quadraticCurveTo(
        dripX + size * 0.01,
        dripY + dripLen * 0.6,
        dripX - size * 0.005,
        dripY + dripLen
      );
      ctx.stroke();
      ctx.fillStyle = `rgba(100, 180, 30, ${0.6 + Math.sin(time * 4 + ds) * 0.2})`;
      ctx.beginPath();
      ctx.arc(
        dripX - size * 0.005,
        dripY + dripLen,
        size * 0.012,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.lineCap = "butt";
  } else if (region === "desert") {
    // Sand particles drifting around
    for (let sp = 0; sp < 8; sp++) {
      const spPhase = (time * 1.2 + sp * 0.125) % 1;
      const spAngle = sp * Math.PI * 0.25 + time * 0.5;
      const spDist = size * (0.3 + spPhase * 0.4);
      const spX = x + Math.cos(spAngle) * spDist;
      const spY = y + Math.sin(spAngle) * spDist * 0.6 - spPhase * size * 0.2;
      const spAlpha = (1 - spPhase) * 0.5;
      ctx.fillStyle = `rgba(210, 180, 120, ${spAlpha})`;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.01, 0, Math.PI * 2);
      ctx.fill();
    }
    // Heat mirage shimmer below
    ctx.strokeStyle = "rgba(232, 160, 32, 0.15)";
    ctx.lineWidth = 1.5 * zoom;
    for (let hm = 0; hm < 3; hm++) {
      const hmY = y + size * (0.55 + hm * 0.04);
      const hmWave = Math.sin(time * 3 + hm * 2) * size * 0.08;
      ctx.beginPath();
      ctx.moveTo(x - size * 0.35, hmY);
      ctx.quadraticCurveTo(x + hmWave, hmY - size * 0.01, x + size * 0.35, hmY);
      ctx.stroke();
    }
    // Golden flame wisps
    for (let gf = 0; gf < 3; gf++) {
      const gfPhase = (time * 2 + gf * 0.33) % 1;
      const gfX = x + Math.sin(time * 2.5 + gf * 2) * size * 0.25 + rageShake;
      const gfY = y - size * 0.2 - gfPhase * size * 0.5;
      const gfH = size * (0.06 + Math.sin(time * 6 + gf) * 0.02);
      ctx.fillStyle = `rgba(240, 200, 96, ${(1 - gfPhase) * 0.5})`;
      ctx.beginPath();
      ctx.moveTo(gfX - size * 0.01, gfY);
      ctx.quadraticCurveTo(gfX, gfY - gfH, gfX + size * 0.01, gfY);
      ctx.fill();
    }
  } else if (region === "winter") {
    // Frost crystals on horns
    for (let horn = 0; horn < 2; horn++) {
      const hDir = horn === 0 ? -1 : 1;
      const hbX = x + hDir * size * 0.28 + rageShake;
      const hbY = y - size * 0.62 + heatWave;
      for (let fc = 0; fc < 3; fc++) {
        const fcAngle = fc * Math.PI * 0.3 + hDir * 0.5;
        const fcLen = size * (0.03 + Math.sin(time * 2 + fc + horn) * 0.01);
        ctx.strokeStyle = `rgba(150, 220, 255, ${0.5 + Math.sin(time * 3 + fc) * 0.2})`;
        ctx.lineWidth = 1 * zoom;
        ctx.beginPath();
        ctx.moveTo(hbX, hbY);
        ctx.lineTo(
          hbX + Math.cos(fcAngle) * fcLen,
          hbY + Math.sin(fcAngle) * fcLen
        );
        ctx.stroke();
        ctx.fillStyle = "rgba(200, 240, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(
          hbX + Math.cos(fcAngle) * fcLen,
          hbY + Math.sin(fcAngle) * fcLen,
          size * 0.006,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }
    // Ice particle trails
    for (let ip = 0; ip < 6; ip++) {
      const ipPhase = (time * 1 + ip * 0.16) % 1;
      const ipX = x + Math.sin(time * 1.8 + ip * 1.1) * size * 0.35;
      const ipY = y + size * 0.2 - ipPhase * size * 1;
      const ipAlpha = (1 - ipPhase) * 0.55;
      ctx.fillStyle = `rgba(140, 210, 255, ${ipAlpha})`;
      ctx.beginPath();
      ctx.arc(ipX, ipY, size * (0.012 - ipPhase * 0.006), 0, Math.PI * 2);
      ctx.fill();
    }
    // Blue flame flickers at extremities
    for (let bf = 0; bf < 4; bf++) {
      const bfAngle = bf * Math.PI * 0.5 + time * 2;
      const bfX = x + Math.cos(bfAngle) * size * 0.32;
      const bfY = y + Math.sin(bfAngle) * size * 0.25 - size * 0.1;
      const bfH = size * (0.05 + Math.sin(time * 9 + bf * 1.5) * 0.025);
      ctx.fillStyle = `rgba(60, 140, 200, ${0.4 + Math.sin(time * 7 + bf) * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(bfX - size * 0.008, bfY);
      ctx.quadraticCurveTo(bfX, bfY - bfH, bfX + size * 0.008, bfY);
      ctx.fill();
    }
  } else if (region === "volcanic") {
    // Lava drips from body
    for (let ld = 0; ld < 5; ld++) {
      const ldX = x + (ld - 2) * size * 0.1 + rageShake;
      const ldPhase = (time * 1.5 + ld * 0.2) % 1;
      const ldY = y + size * 0.3 + ldPhase * size * 0.25 + heatWave;
      const ldAlpha = (1 - ldPhase) * 0.8;
      ctx.fillStyle = `rgba(255, 100, 0, ${ldAlpha})`;
      setShadowBlur(ctx, 3 * zoom, "#ff6600");
      ctx.beginPath();
      ctx.ellipse(
        ldX,
        ldY,
        size * 0.008,
        size * 0.015 + ldPhase * size * 0.01,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      clearShadow(ctx);
    }
    // Obsidian shard floating debris
    for (let os = 0; os < 6; os++) {
      const osAngle = os * Math.PI * 0.33 + time * 0.6;
      const osDist = size * (0.4 + Math.sin(time * 1.5 + os) * 0.08);
      const osX = x + Math.cos(osAngle) * osDist;
      const osY =
        y +
        Math.sin(osAngle) * osDist * 0.5 -
        size * 0.1 +
        Math.sin(time * 2 + os) * size * 0.03;
      const osRot = time * 2 + os;
      const osSize = size * 0.02;
      ctx.save();
      ctx.translate(osX, osY);
      ctx.rotate(osRot);
      ctx.fillStyle = `rgba(20, 10, 5, ${0.7 + Math.sin(time + os) * 0.15})`;
      ctx.beginPath();
      ctx.moveTo(-osSize, 0);
      ctx.lineTo(0, -osSize * 1.5);
      ctx.lineTo(osSize, 0);
      ctx.lineTo(0, osSize * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(255, 80, 0, ${0.3 + Math.sin(time * 3 + os) * 0.15})`;
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      ctx.restore();
    }
    // Intense ember rain
    for (let er = 0; er < 8; er++) {
      const erPhase = (time * 2 + er * 0.12) % 1;
      const erX = x + Math.sin(time * 1.5 + er * 0.9) * size * 0.5;
      const erY = y - size * 0.6 + erPhase * size * 1.4;
      const erAlpha = Math.sin(erPhase * Math.PI) * 0.7;
      ctx.fillStyle = `rgba(255, 170, 0, ${erAlpha})`;
      setShadowBlur(ctx, 2 * zoom, "#ff8800");
      ctx.beginPath();
      ctx.arc(erX, erY, size * 0.008, 0, Math.PI * 2);
      ctx.fill();
      clearShadow(ctx);
    }
  }
}

export function drawBansheeEnemy(
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
  region: MapTheme = "grassland"
) {
  const isAttacking = attackPhase > 0;
  const floatOffset = Math.sin(time * 2.5) * size * 0.1;
  const screamPhase = Math.sin(time * 8);
  const wailIntensity =
    0.5 + Math.abs(screamPhase) * 0.3 + (isAttacking ? attackPhase * 0.4 : 0);
  const mouthOpen =
    0.3 +
    Math.abs(Math.sin(time * 6)) * 0.4 +
    (isAttacking ? attackPhase * 0.3 : 0);

  let glowHex = "#94a3b8";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    glowHex = rm.magic.primary;
  }

  // Ethereal trail (longer)
  for (let t = 0; t < 10; t++) {
    const trailAlpha = (1 - t * 0.1) * 0.12;
    ctx.fillStyle = `rgba(226, 232, 240, ${trailAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.sin(time * 2 - t * 0.25) * size * 0.1,
      y + floatOffset + t * size * 0.1,
      size * (0.3 - t * 0.018),
      size * (0.35 - t * 0.022),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Enhanced transparency layers for ethereal effect
  for (let layer = 0; layer < 3; layer++) {
    const layerAlpha = (3 - layer) * 0.06;
    const layerOffset = Math.sin(time * 1.5 + layer * 0.8) * size * 0.03;
    ctx.fillStyle = `rgba(203, 213, 225, ${layerAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x + layerOffset,
      y + floatOffset,
      size * (0.4 + layer * 0.05),
      size * (0.5 + layer * 0.06),
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Spectral chains trailing from body
  for (let chain = 0; chain < 2; chain++) {
    const chainDir = chain === 0 ? -1 : 1;
    const chainStartX = x + chainDir * size * 0.2;
    const chainStartY = y + floatOffset + size * 0.15;
    const chainRattle = isAttacking
      ? Math.sin(attackPhase * Math.PI * 12 + chain) * size * 0.04
      : 0;

    ctx.strokeStyle = `rgba(148, 163, 184, ${0.3 + Math.sin(time * 2 + chain) * 0.1})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let link = 0; link < 8; link++) {
      const linkX = chainStartX + chainDir * link * size * 0.06 + chainRattle;
      const linkY =
        chainStartY +
        link * size * 0.04 +
        Math.sin(time * 3 + link * 0.7) * size * 0.02;
      ctx.beginPath();
      ctx.ellipse(
        linkX,
        linkY,
        size * 0.018,
        size * 0.012,
        Math.sin(time * 2 + link) * 0.5,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    const endX = chainStartX + chainDir * 8 * size * 0.06 + chainRattle;
    const endY =
      chainStartY +
      8 * size * 0.04 +
      Math.sin(time * 3 + 8 * 0.7) * size * 0.02;
    ctx.fillStyle = "rgba(100, 116, 139, 0.3)";
    ctx.beginPath();
    ctx.arc(endX, endY, size * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }

  // Enhanced sound wave rings (elliptical, fading)
  if (wailIntensity > 0.5) {
    for (let wave = 0; wave < 5; wave++) {
      const wavePhase = (time * 3 + wave * 0.2) % 1;
      const waveSize = Math.max(0, size * (0.25 + wavePhase * 1));
      if (waveSize <= 0) {
        continue;
      }
      const waveAlpha = (1 - wavePhase) * 0.25 * wailIntensity;
      ctx.strokeStyle = `rgba(226, 232, 240, ${waveAlpha})`;
      ctx.lineWidth = (2.5 - wavePhase * 1.5) * zoom;

      ctx.beginPath();
      ctx.ellipse(
        x,
        y + floatOffset - size * 0.1,
        waveSize,
        waveSize * 0.4,
        0,
        -Math.PI * 0.75,
        -Math.PI * 0.25
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(
        x,
        y + floatOffset - size * 0.1,
        waveSize,
        waveSize * 0.4,
        0,
        Math.PI * 0.25,
        Math.PI * 0.75
      );
      ctx.stroke();
    }
  }

  // Soul wisps being dragged along
  for (let wisp = 0; wisp < 5; wisp++) {
    const wispAngle = (wisp * Math.PI * 2) / 5 + time * 0.5;
    const wispDist = size * (0.5 + Math.sin(time + wisp) * 0.15);
    const wispX = x + Math.cos(wispAngle) * wispDist;
    const wispY =
      y + floatOffset + Math.sin(wispAngle * 0.7) * size * 0.3 + size * 0.1;
    const wispAlpha = 0.2 + Math.sin(time * 3 + wisp * 1.5) * 0.1;

    const wispGrad = ctx.createRadialGradient(
      wispX,
      wispY,
      0,
      wispX,
      wispY,
      size * 0.06
    );
    wispGrad.addColorStop(0, `rgba(200, 210, 230, ${wispAlpha + 0.15})`);
    wispGrad.addColorStop(1, "rgba(200, 210, 230, 0)");
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.arc(wispX, wispY, size * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = `rgba(200, 210, 230, ${wispAlpha * 0.5})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(wispX, wispY);
    ctx.quadraticCurveTo(
      (wispX + x) / 2 + Math.sin(time * 2 + wisp) * size * 0.05,
      (wispY + y + floatOffset) / 2,
      x,
      y + floatOffset
    );
    ctx.stroke();
  }

  // Banshee arms — wailing raised reach
  for (const side of [-1, 1] as const) {
    drawPathArm(
      ctx,
      x + side * size * 0.22,
      y + floatOffset - size * 0.15,
      size,
      time,
      zoom,
      side,
      {
        color: `rgba(226, 232, 240, ${wailIntensity * 0.5})`,
        colorDark: `rgba(203, 213, 225, ${wailIntensity * 0.4})`,
        elbowAngle: -0.3 + Math.sin(time * 2.5 + side * 1.5) * 0.18,
        foreLen: 0.18,
        handColor: `rgba(148, 163, 184, ${wailIntensity * 0.6})`,
        handRadius: 0.02,
        onWeapon: (wCtx) => {
          if (side === -1) {
            // Left hand: spectral chain
            const linkW = size * 0.018;
            const linkH = size * 0.028;
            const linkGap = linkH * 0.85;
            for (let lnk = 0; lnk < 4; lnk++) {
              const chainY = -lnk * linkGap - size * 0.02;
              const chainAlpha = (1 - lnk * 0.22) * wailIntensity * 0.7;
              const sway = Math.sin(time * 3 + lnk * 0.8) * size * 0.008;

              // Ghostly glow per link
              setShadowBlur(
                wCtx,
                (4 - lnk) * zoom,
                `rgba(203, 213, 225, ${chainAlpha})`
              );
              const linkGrad = wCtx.createLinearGradient(
                sway - linkW,
                chainY,
                sway + linkW,
                chainY
              );
              linkGrad.addColorStop(
                0,
                `rgba(148, 163, 184, ${chainAlpha * 0.5})`
              );
              linkGrad.addColorStop(0.5, `rgba(226, 232, 240, ${chainAlpha})`);
              linkGrad.addColorStop(
                1,
                `rgba(148, 163, 184, ${chainAlpha * 0.5})`
              );

              wCtx.strokeStyle = linkGrad;
              wCtx.lineWidth = 1.5 * zoom;
              wCtx.beginPath();
              if (lnk % 2 === 0) {
                wCtx.ellipse(
                  sway,
                  chainY,
                  linkW,
                  linkH * 0.45,
                  0,
                  0,
                  Math.PI * 2
                );
              } else {
                wCtx.ellipse(
                  sway,
                  chainY,
                  linkW * 0.7,
                  linkH * 0.5,
                  Math.PI * 0.15,
                  0,
                  Math.PI * 2
                );
              }
              wCtx.stroke();
            }
            clearShadow(wCtx);

            // Trailing wisp at chain end
            const endY = -4 * linkGap - size * 0.02;
            const endAlpha = 0.15 * wailIntensity;
            wCtx.strokeStyle = `rgba(203, 213, 225, ${endAlpha})`;
            wCtx.lineWidth = 1 * zoom;
            wCtx.beginPath();
            wCtx.moveTo(0, endY);
            wCtx.quadraticCurveTo(
              Math.sin(time * 4) * size * 0.02,
              endY - size * 0.03,
              Math.sin(time * 3) * size * 0.01,
              endY - size * 0.06
            );
            wCtx.stroke();
          } else {
            // Right hand: wailing claw — 3 spectral talons
            for (let t = 0; t < 3; t++) {
              const talonSpread = (t - 1) * 0.25;
              const talonLen = size * (0.1 + t * 0.008);
              const talonAngle = talonSpread + Math.sin(time * 4 + t) * 0.06;
              const talonAlpha = wailIntensity * (0.65 - t * 0.08);

              wCtx.save();
              wCtx.rotate(talonAngle);

              // Talon body gradient
              const tGrad = wCtx.createLinearGradient(0, 0, 0, -talonLen);
              tGrad.addColorStop(0, `rgba(226, 232, 240, ${talonAlpha})`);
              tGrad.addColorStop(
                0.6,
                `rgba(148, 163, 184, ${talonAlpha * 0.7})`
              );
              tGrad.addColorStop(1, `rgba(148, 163, 184, 0)`);

              wCtx.strokeStyle = tGrad;
              wCtx.lineWidth = 2 * zoom;
              wCtx.lineCap = "round";
              wCtx.beginPath();
              wCtx.moveTo(0, 0);
              wCtx.quadraticCurveTo(
                size * 0.01 * (t - 1),
                -talonLen * 0.5,
                size * 0.005 * (t - 1),
                -talonLen
              );
              wCtx.stroke();

              // Trailing wisp behind each talon
              const wispAlpha = talonAlpha * 0.35;
              wCtx.strokeStyle = `rgba(203, 213, 225, ${wispAlpha})`;
              wCtx.lineWidth = 1 * zoom;
              wCtx.beginPath();
              wCtx.moveTo(0, -talonLen * 0.3);
              wCtx.quadraticCurveTo(
                Math.sin(time * 5 + t) * size * 0.015,
                -talonLen * 0.6,
                Math.sin(time * 3.5 + t * 1.2) * size * 0.01,
                -talonLen * 0.85
              );
              wCtx.stroke();

              wCtx.restore();
            }

            // Central glow at base of claws
            setShadowBlur(
              wCtx,
              5 * zoom,
              `rgba(226, 232, 240, ${wailIntensity * 0.4})`
            );
            wCtx.fillStyle = `rgba(226, 232, 240, ${wailIntensity * 0.25})`;
            wCtx.beginPath();
            wCtx.arc(0, -size * 0.01, size * 0.015, 0, Math.PI * 2);
            wCtx.fill();
            clearShadow(wCtx);
          }
        },
        shoulderAngle: side * (-1.1 + Math.sin(time * 2 + side * 0.8) * 0.2),
        style: "ghostly",
        upperLen: 0.2,
        width: 0.035,
      }
    );
  }

  // Animated tendrils below (floating wispy appendages)
  for (let i = 0; i < 3; i++) {
    const tendrilAngle = Math.PI * 0.35 + i * Math.PI * 0.15;
    drawAnimatedTendril(
      ctx,
      x + (i - 1) * size * 0.12,
      y + floatOffset + size * 0.3,
      tendrilAngle,
      size,
      time,
      zoom,
      {
        color: `rgba(203, 213, 225, ${wailIntensity * 0.35})`,
        length: 0.25,
        segments: 8,
        tipColor: `rgba(148, 163, 184, ${wailIntensity * 0.2})`,
        waveAmt: 0.06,
        waveSpeed: 3,
        width: 0.02,
      }
    );
  }

  // Main spectral body
  const bodyGrad = ctx.createRadialGradient(
    x,
    y + floatOffset,
    0,
    x,
    y + floatOffset,
    size * 0.5
  );
  bodyGrad.addColorStop(0, `rgba(255, 255, 255, ${wailIntensity * 0.8})`);
  bodyGrad.addColorStop(0.5, `rgba(226, 232, 240, ${wailIntensity * 0.5})`);
  bodyGrad.addColorStop(1, "rgba(203, 213, 225, 0)");
  ctx.fillStyle = bodyGrad;

  // Flowing dress-like form with tattered ragged edges
  ctx.beginPath();
  ctx.moveTo(x, y + floatOffset - size * 0.5);
  ctx.quadraticCurveTo(
    x - size * 0.35,
    y + floatOffset - size * 0.2,
    x - size * 0.4,
    y + floatOffset + size * 0.2
  );
  const edgeCount = 10;
  for (let edge = 0; edge < edgeCount; edge++) {
    const edgeX = x - size * 0.4 + edge * size * (0.8 / (edgeCount - 1));
    const edgeBase = y + floatOffset + size * 0.5;
    const edgeDip = Math.sin(time * 4 + edge * 1.2) * size * 0.1;
    const raggedExtra =
      edge % 2 === 0
        ? size * 0.08 + Math.sin(time * 3 + edge) * size * 0.04
        : size * 0.02;
    ctx.lineTo(edgeX, edgeBase + edgeDip + raggedExtra);
  }
  ctx.quadraticCurveTo(
    x + size * 0.35,
    y + floatOffset - size * 0.2,
    x,
    y + floatOffset - size * 0.5
  );
  ctx.fill();

  // Secondary ragged hem (inner jagged silhouette)
  ctx.strokeStyle = `rgba(190, 200, 220, ${wailIntensity * 0.28})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.37, y + floatOffset + size * 0.44);
  const hemJags = 15;
  for (let hj = 0; hj <= hemJags; hj++) {
    const hjx = x - size * 0.37 + hj * size * (0.74 / hemJags);
    const hjy =
      y +
      floatOffset +
      size * 0.5 +
      Math.sin(time * 4.8 + hj * 1.55) * size * 0.07 +
      (hj % 4 === 0 ? size * 0.06 : hj % 4 === 2 ? -size * 0.04 : size * 0.015);
    ctx.lineTo(hjx, hjy);
  }
  ctx.stroke();

  // Fabric fold lines on dress body
  ctx.strokeStyle = `rgba(210, 218, 235, ${wailIntensity * 0.22})`;
  ctx.lineWidth = 1 * zoom;
  const foldOffsets = [-size * 0.14, 0, size * 0.14];
  for (let fi = 0; fi < foldOffsets.length; fi++) {
    const fo = foldOffsets[fi];
    ctx.beginPath();
    ctx.moveTo(x + fo * 0.45, y + floatOffset - size * 0.22);
    ctx.quadraticCurveTo(
      x + fo * 0.9,
      y + floatOffset + size * 0.02,
      x + fo * 0.5,
      y + floatOffset + size * 0.36
    );
    ctx.stroke();
  }

  // Tattered robe wisps hanging from edges
  ctx.strokeStyle = `rgba(226, 232, 240, ${wailIntensity * 0.3})`;
  ctx.lineWidth = 1 * zoom;
  for (let rag = 0; rag < 6; rag++) {
    const ragX = x - size * 0.35 + rag * size * 0.14;
    const ragY =
      y +
      floatOffset +
      size * 0.5 +
      Math.sin(time * 4 + rag * 1.2) * size * 0.1;
    const ragLen = size * (0.1 + Math.sin(time * 2 + rag) * 0.04);
    ctx.beginPath();
    ctx.moveTo(ragX, ragY);
    ctx.quadraticCurveTo(
      ragX + Math.sin(time * 5 + rag) * size * 0.03,
      ragY + ragLen * 0.5,
      ragX + Math.sin(time * 3 + rag) * size * 0.04,
      ragY + ragLen
    );
    ctx.stroke();
  }

  // Flowing spectral hair streaming upward
  ctx.fillStyle = `rgba(203, 213, 225, ${wailIntensity * 0.7})`;
  for (let h = 0; h < 7; h++) {
    const hairAngle = -Math.PI * 0.85 + h * Math.PI * 0.28;
    const hairWave = Math.sin(time * 3.5 + h * 0.6) * size * 0.18;
    const hairLen = size * (0.35 + Math.sin(time * 2 + h) * 0.08);

    ctx.beginPath();
    ctx.moveTo(
      x + Math.cos(hairAngle) * size * 0.12,
      y + floatOffset - size * 0.4
    );
    ctx.quadraticCurveTo(
      x + Math.cos(hairAngle) * size * 0.3 + hairWave,
      y + floatOffset - size * 0.55 - hairLen * 0.3,
      x + Math.cos(hairAngle) * size * 0.45 + hairWave * 1.5,
      y + floatOffset - size * 0.45 - hairLen * 0.5
    );
    ctx.quadraticCurveTo(
      x + Math.cos(hairAngle) * size * 0.25 + hairWave * 0.5,
      y + floatOffset - size * 0.5 - hairLen * 0.2,
      x + Math.cos(hairAngle) * size * 0.08,
      y + floatOffset - size * 0.35
    );
    ctx.fill();
  }
  // Individual structural hair strands streaming outward
  ctx.strokeStyle = `rgba(203, 213, 225, ${wailIntensity * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  for (let hs = 0; hs < 6; hs++) {
    const hsAngle = -Math.PI * 0.9 + hs * Math.PI * 0.32;
    const hsWave = Math.sin(time * 4 + hs * 0.9) * size * 0.12;
    const hsBaseX = x + Math.cos(hsAngle) * size * 0.1;
    const hsBaseY = y + floatOffset - size * 0.42;
    ctx.beginPath();
    ctx.moveTo(hsBaseX, hsBaseY);
    ctx.bezierCurveTo(
      hsBaseX + Math.cos(hsAngle) * size * 0.15 + hsWave * 0.5,
      hsBaseY - size * 0.15,
      hsBaseX + Math.cos(hsAngle) * size * 0.3 + hsWave,
      hsBaseY - size * 0.2 - Math.sin(time * 2.5 + hs) * size * 0.06,
      hsBaseX + Math.cos(hsAngle) * size * 0.4 + hsWave * 1.3,
      hsBaseY - size * 0.12
    );
    ctx.stroke();
  }

  // Streaming hair strands (quadratic curves, outward / upward wave)
  ctx.strokeStyle = `rgba(218, 228, 245, ${wailIntensity * 0.42})`;
  ctx.lineWidth = 1.2 * zoom;
  for (let qs = 0; qs < 9; qs++) {
    const qAng = -Math.PI * 0.98 + qs * Math.PI * 0.2;
    const qW =
      Math.sin(time * 5.5 + qs * 0.72) * size * 0.15 +
      Math.cos(time * 3.8 + qs) * size * 0.05;
    const qW2 = Math.sin(time * 4.2 + qs * 1.15) * size * 0.07;
    const sx = x + Math.cos(qAng) * size * 0.1;
    const sy = y + floatOffset - size * 0.4;
    const cx = x + Math.cos(qAng) * size * 0.32 + qW;
    const cy = y + floatOffset - size * 0.62 - qs * size * 0.018 + qW2;
    const ex = x + Math.cos(qAng) * size * 0.55 + qW * 1.35;
    const ey = y + floatOffset - size * 0.46 - Math.abs(qW) * 0.25;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }

  // Hair glow effect
  setShadowBlur(ctx, 4 * zoom, "rgba(226, 232, 240, 0.5)");
  ctx.fillStyle = `rgba(240, 245, 255, ${wailIntensity * 0.2})`;
  for (let hg = 0; hg < 3; hg++) {
    const hgAngle = -Math.PI * 0.6 + hg * Math.PI * 0.3;
    const hgWave = Math.sin(time * 3 + hg) * size * 0.1;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(hgAngle) * size * 0.25 + hgWave,
      y + floatOffset - size * 0.55,
      size * 0.04,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Collarbone V-shaped detail at the neckline
  ctx.strokeStyle = `rgba(180, 190, 210, ${wailIntensity * 0.35})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18, y + floatOffset - size * 0.12);
  ctx.bezierCurveTo(
    x - size * 0.08,
    y + floatOffset - size * 0.15,
    x,
    y + floatOffset - size * 0.18,
    x,
    y + floatOffset - size * 0.16
  );
  ctx.bezierCurveTo(
    x,
    y + floatOffset - size * 0.18,
    x + size * 0.08,
    y + floatOffset - size * 0.15,
    x + size * 0.18,
    y + floatOffset - size * 0.12
  );
  ctx.stroke();

  // Hollow eyes
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.1,
    y + floatOffset - size * 0.25,
    size * 0.06,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.1,
    y + floatOffset - size * 0.25,
    size * 0.06,
    size * 0.08,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Eye glow
  ctx.fillStyle = `rgba(148, 163, 184, ${wailIntensity})`;
  setShadowBlur(ctx, 8 * zoom, glowHex);
  ctx.beginPath();
  ctx.arc(
    x - size * 0.1,
    y + floatOffset - size * 0.26,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.1,
    y + floatOffset - size * 0.26,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);

  // Tear streaks from hollow eyes (glowing)
  for (let eye = 0; eye < 2; eye++) {
    const eyeDir = eye === 0 ? -1 : 1;
    const tearX = x + eyeDir * size * 0.1;
    const tearStartY = y + floatOffset - size * 0.2;

    ctx.strokeStyle = `rgba(148, 163, 184, ${wailIntensity * 0.6})`;
    setShadowBlur(ctx, 3 * zoom, glowHex);
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(tearX, tearStartY);
    ctx.quadraticCurveTo(
      tearX + eyeDir * size * 0.02,
      tearStartY + size * 0.1,
      tearX + eyeDir * size * 0.01,
      tearStartY + size * 0.2
    );
    ctx.stroke();
    clearShadow(ctx);

    for (let td = 0; td < 3; td++) {
      const tdPhase = (time * 1.5 + td * 0.33 + eye * 0.5) % 1;
      const tdY = tearStartY + tdPhase * size * 0.25;
      const tdAlpha = (1 - tdPhase) * wailIntensity * 0.5;
      ctx.fillStyle = `rgba(148, 163, 184, ${tdAlpha})`;
      ctx.beginPath();
      ctx.arc(
        tearX + eyeDir * size * 0.015 * Math.sin(tdPhase * Math.PI),
        tdY,
        size * 0.01 * (1 - tdPhase * 0.5),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Screaming mouth
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + floatOffset - size * 0.08,
    size * 0.1 * mouthOpen,
    size * 0.15 * mouthOpen,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Mouth inner glow
  ctx.fillStyle = `rgba(148, 163, 184, ${wailIntensity * 0.5})`;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + floatOffset - size * 0.08,
    size * 0.05 * mouthOpen,
    size * 0.08 * mouthOpen,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Mouth depth ring
  ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + floatOffset - size * 0.08,
    size * 0.07 * mouthOpen,
    size * 0.11 * mouthOpen,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Teeth inside screaming mouth
  const screamCx = x;
  const screamCy = y + floatOffset - size * 0.08;
  const toothCount = 6;
  const mouthRx = size * 0.1 * mouthOpen;
  const mouthRy = size * 0.15 * mouthOpen;
  ctx.fillStyle = `rgba(241, 245, 249, ${0.5 + mouthOpen * 0.35})`;
  for (let tooth = 0; tooth < toothCount; tooth++) {
    const tx = screamCx + (tooth - (toothCount - 1) / 2) * mouthRx * 0.35;
    const tw = size * 0.012 * Math.max(0.35, mouthOpen);
    ctx.beginPath();
    ctx.moveTo(tx - tw, screamCy - mouthRy * 0.55);
    ctx.lineTo(tx + tw, screamCy - mouthRy * 0.55);
    ctx.lineTo(tx + tw * 0.65, screamCy - mouthRy * 0.2);
    ctx.lineTo(tx - tw * 0.65, screamCy - mouthRy * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tx - tw, screamCy + mouthRy * 0.55);
    ctx.lineTo(tx + tw, screamCy + mouthRy * 0.55);
    ctx.lineTo(tx + tw * 0.65, screamCy + mouthRy * 0.2);
    ctx.lineTo(tx - tw * 0.65, screamCy + mouthRy * 0.2);
    ctx.closePath();
    ctx.fill();
  }

  // Outstretched ghostly hands/arms reaching forward
  ctx.fillStyle = `rgba(226, 232, 240, ${wailIntensity * 0.6})`;
  for (let arm = 0; arm < 2; arm++) {
    const armDir = arm === 0 ? -1 : 1;
    const armWave = Math.sin(time * 3 + arm) * size * 0.1;
    const armReach = isAttacking ? attackPhase * size * 0.1 : 0;

    ctx.beginPath();
    ctx.moveTo(x + armDir * size * 0.25, y + floatOffset);
    ctx.quadraticCurveTo(
      x + armDir * (size * 0.5 + armReach) + armWave,
      y + floatOffset - size * 0.1,
      x + armDir * (size * 0.55 + armReach),
      y + floatOffset - size * 0.25 + Math.sin(time * 4 + arm) * size * 0.05
    );
    ctx.lineTo(
      x + armDir * (size * 0.45 + armReach),
      y + floatOffset - size * 0.2
    );
    ctx.quadraticCurveTo(
      x + armDir * size * 0.35,
      y + floatOffset,
      x + armDir * size * 0.2,
      y + floatOffset + size * 0.05
    );
    ctx.fill();

    // Ghostly fingers (3 per hand)
    const handX = x + armDir * (size * 0.55 + armReach);
    const handY =
      y + floatOffset - size * 0.25 + Math.sin(time * 4 + arm) * size * 0.05;
    ctx.strokeStyle = `rgba(226, 232, 240, ${wailIntensity * 0.4})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let finger = 0; finger < 3; finger++) {
      const fingerAngle =
        (finger - 1) * 0.35 + (arm === 0 ? Math.PI * 0.85 : Math.PI * 0.15);
      const fingerLen =
        size * (0.06 + Math.sin(time * 5 + finger + arm) * 0.02);
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(
        handX + Math.cos(fingerAngle) * fingerLen * armDir,
        handY + Math.sin(fingerAngle) * fingerLen
      );
      ctx.stroke();
    }
  }

  // Floating grade papers
  for (let p = 0; p < 4; p++) {
    const paperAngle = time * 1.5 + p * Math.PI * 0.5;
    const paperDist = size * 0.6 + Math.sin(time * 2 + p) * size * 0.12;
    const px = x + Math.cos(paperAngle) * paperDist;
    const py = y + floatOffset + Math.sin(paperAngle * 0.5) * paperDist * 0.3;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.sin(time * 2 + p) * 0.3);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 3 + p) * 0.2})`;
    ctx.fillRect(-size * 0.04, -size * 0.05, size * 0.08, size * 0.1);
    ctx.fillStyle = "#ef4444";
    ctx.font = `bold ${size * 0.06}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("F", 0, size * 0.02);
    ctx.restore();
  }

  // Spectral shadow wisps
  drawShadowWisps(ctx, x, y + floatOffset, size * 0.3, time, zoom, {
    color: "rgba(148, 163, 184, 0.35)",
    count: 4,
    maxAlpha: 0.28,
    speed: 1.6,
    wispLength: 0.4,
  });

  // Floating ethereal shards
  drawShiftingSegments(ctx, x, y + floatOffset, size, time, zoom, {
    bobAmt: 0.04,
    bobSpeed: 2.5,
    color: "rgba(226, 232, 240, 0.5)",
    colorAlt: "rgba(203, 213, 225, 0.4)",
    count: 5,
    orbitRadius: 0.42,
    orbitSpeed: 1,
    rotateWithOrbit: true,
    segmentSize: 0.025,
    shape: "shard",
  });

  // Attack: wail waves intensify, chains rattle outward, mouth flare
  if (isAttacking) {
    for (let aw = 0; aw < 6; aw++) {
      const awPhase = (attackPhase * 4 + aw * 0.167) % 1;
      const awSize = size * (0.2 + awPhase * 1.5);
      const awAlpha = (1 - awPhase) * 0.4 * attackPhase;
      ctx.strokeStyle = `rgba(226, 232, 240, ${awAlpha})`;
      ctx.lineWidth = (3 - awPhase * 2) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x,
        y + floatOffset - size * 0.08,
        awSize,
        awSize * 0.35,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    const mouthGlowGrad = ctx.createRadialGradient(
      x,
      y + floatOffset - size * 0.08,
      0,
      x,
      y + floatOffset - size * 0.08,
      size * 0.15 * mouthOpen
    );
    mouthGlowGrad.addColorStop(0, `rgba(200, 220, 255, ${attackPhase * 0.7})`);
    mouthGlowGrad.addColorStop(1, "rgba(148, 163, 184, 0)");
    ctx.fillStyle = mouthGlowGrad;
    setShadowBlur(ctx, 12 * zoom, glowHex);
    ctx.beginPath();
    ctx.arc(
      x,
      y + floatOffset - size * 0.08,
      size * 0.15 * mouthOpen,
      0,
      Math.PI * 2
    );
    ctx.fill();
    clearShadow(ctx);

    ctx.fillStyle = `rgba(226, 232, 240, ${attackPhase * 0.15})`;
    ctx.beginPath();
    ctx.arc(
      x,
      y + floatOffset,
      size * (0.5 + attackPhase * 0.3),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  drawRegionBodyAccent(ctx, x, y + floatOffset, size, region, time, zoom);
}

export function drawJuggernautEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ENDOWED CHAIR - Massive armored titan with academic regalia
  const isAttacking = attackPhase > 0;
  const sin2 = Math.sin(time * 2);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin5 = Math.sin(time * 5);
  const cos3 = Math.cos(time * 3);
  const stomp = sin2 * size * 0.02;
  const breathCycle = sin3 * size * 0.012;
  const powerPulse = 0.5 + sin3 * 0.2 + (isAttacking ? attackPhase * 0.3 : 0);
  const runePulse = 0.4 + sin4 * 0.35;
  const groundShake = isAttacking
    ? Math.sin(attackPhase * Math.PI * 6) * size * 0.02
    : 0;
  const heaveSwell = 1 + sin3 * 0.015;
  const attackSlam = isAttacking ? attackPhase ** 2 : 0;

  // ── Ground tremor pool / impact shadow ──
  const tremorRadius = size * (0.7 + sin2 * 0.04 + attackSlam * 0.25);
  const tremorGrad = ctx.createRadialGradient(
    x,
    y + size * 0.52,
    size * 0.05,
    x,
    y + size * 0.52,
    tremorRadius
  );
  tremorGrad.addColorStop(0, `rgba(28, 25, 23, ${0.35 + attackSlam * 0.2})`);
  tremorGrad.addColorStop(0.4, `rgba(68, 64, 60, ${0.2 + attackSlam * 0.15})`);
  tremorGrad.addColorStop(1, "rgba(68, 64, 60, 0)");
  ctx.fillStyle = tremorGrad;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.52,
    tremorRadius,
    tremorRadius * ISO_Y_RATIO,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Tremor ripple rings
  for (let ring = 0; ring < 3; ring++) {
    const ringPhase = (time * 1.5 + ring * 2.1) % (Math.PI * 2);
    const ringExpand = Math.sin(ringPhase) * 0.5 + 0.5;
    const ringR = size * (0.25 + ringExpand * 0.45);
    const ringAlpha = (1 - ringExpand) * (0.12 + attackSlam * 0.1);
    if (ringAlpha > 0.01) {
      ctx.strokeStyle = `rgba(68, 64, 60, ${ringAlpha})`;
      ctx.lineWidth = 1.5 * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x + groundShake,
        y + size * 0.52,
        ringR,
        ringR * ISO_Y_RATIO,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // Ground crack lines radiating outward
  ctx.lineWidth = 2 * zoom;
  for (let crack = 0; crack < 8; crack++) {
    const crackAngle = (crack * Math.PI) / 4 + Math.sin(time * 0.5) * 0.05;
    const crackLen = size * (0.35 + Math.sin(time * 0.8 + crack * 1.3) * 0.08);
    const crackAlpha = 0.25 + attackSlam * 0.2;
    ctx.strokeStyle = `rgba(68, 64, 60, ${crackAlpha})`;
    ctx.beginPath();
    ctx.moveTo(x + groundShake, y + size * 0.5);
    const midX =
      x +
      groundShake +
      Math.cos(crackAngle) * crackLen * 0.5 +
      Math.sin(time + crack) * size * 0.02;
    const midY = y + size * 0.5 + Math.sin(crackAngle) * crackLen * 0.12;
    ctx.quadraticCurveTo(
      midX,
      midY,
      x + groundShake + Math.cos(crackAngle) * crackLen,
      y + size * 0.5 + Math.sin(crackAngle) * size * 0.15
    );
    ctx.stroke();
    // Branch cracks
    if (crack % 2 === 0) {
      ctx.lineWidth = 1 * zoom;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(
        midX + Math.cos(crackAngle + 0.6) * size * 0.1,
        midY + Math.sin(crackAngle + 0.6) * size * 0.05
      );
      ctx.stroke();
      ctx.lineWidth = 2 * zoom;
    }
  }

  // ── Dust / stone particles around feet ──
  for (let p = 0; p < 6; p++) {
    const pPhase = (time * 2.5 + p * 1.05) % (Math.PI * 2);
    const pRise = Math.sin(pPhase) * 0.5 + 0.5;
    const pAlpha = (1 - pRise) * (0.3 + attackSlam * 0.2);
    if (pAlpha > 0.02) {
      const pAngle = (p / 6) * Math.PI * 2 + sin2 * 0.3;
      const pDist = size * (0.35 + pRise * 0.25);
      const pX = x + Math.cos(pAngle) * pDist + groundShake;
      const pY = y + size * 0.45 - pRise * size * 0.2;
      const pSize = size * (0.02 + Math.sin(time + p) * 0.008);
      ctx.fillStyle = `rgba(120, 113, 108, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Attack ground-slam shockwave
  if (isAttacking && attackPhase > 0.3) {
    const shockAlpha = (attackPhase - 0.3) * 1.4;
    const shockR = size * (0.3 + attackPhase * 0.6);
    ctx.strokeStyle = `rgba(212, 175, 55, ${Math.max(0, shockAlpha * 0.4)})`;
    ctx.lineWidth = 3 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      x + groundShake,
      y + size * 0.52,
      shockR,
      shockR * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  // Heavy stomping animated legs
  drawPathLegs(ctx, x + groundShake, y + size * 0.38, size, time, zoom, {
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: "#3f3f46",
    legLen: 0.2,
    phaseOffset: stomp,
    shuffle: false,
    strideAmt: 0.15,
    strideSpeed: 2,
    style: "armored",
    width: 0.07,
  });

  // ── Massive legs with armored greaves ──
  for (let leg = 0; leg < 2; leg++) {
    const legDir = leg === 0 ? -1 : 1;
    const legStomp = leg === 0 ? stomp : -stomp;
    const legX = x + legDir * size * 0.16 + groundShake;
    const legTop = y + size * 0.15 + legStomp;
    const legW = size * 0.18;
    const legH = size * 0.38;

    // Leg base
    const legGrad = ctx.createLinearGradient(
      legX - legW * 0.5,
      legTop,
      legX + legW * 0.5,
      legTop
    );
    legGrad.addColorStop(0, bodyColorDark);
    legGrad.addColorStop(0.5, bodyColor);
    legGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(legX - legW * 0.5, legTop);
    ctx.lineTo(legX - legW * 0.55, legTop + legH);
    ctx.lineTo(legX + legW * 0.55, legTop + legH);
    ctx.lineTo(legX + legW * 0.5, legTop);
    ctx.closePath();
    ctx.fill();

    // Greave plate overlay
    ctx.fillStyle = "#3f3f46";
    ctx.beginPath();
    ctx.moveTo(legX - legW * 0.45, legTop + legH * 0.3);
    ctx.quadraticCurveTo(
      legX,
      legTop + legH * 0.22,
      legX + legW * 0.45,
      legTop + legH * 0.3
    );
    ctx.lineTo(legX + legW * 0.5, legTop + legH * 0.95);
    ctx.lineTo(legX - legW * 0.5, legTop + legH * 0.95);
    ctx.closePath();
    ctx.fill();

    // Greave edge highlight
    ctx.strokeStyle = "rgba(113, 113, 122, 0.4)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(legX - legW * 0.45, legTop + legH * 0.3);
    ctx.quadraticCurveTo(
      legX,
      legTop + legH * 0.22,
      legX + legW * 0.45,
      legTop + legH * 0.3
    );
    ctx.stroke();

    // Knee guard
    ctx.fillStyle = "#52525b";
    ctx.beginPath();
    ctx.ellipse(
      legX,
      legTop + legH * 0.2 + legStomp * 0.3,
      size * 0.12,
      size * 0.08,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Knee rivet
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(
      legX,
      legTop + legH * 0.2 + legStomp * 0.3,
      size * 0.02,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Battle scratch on greave
    ctx.strokeStyle = "rgba(161, 161, 170, 0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(legX + legDir * size * 0.02, legTop + legH * 0.5);
    ctx.lineTo(legX + legDir * size * 0.06, legTop + legH * 0.65);
    ctx.stroke();

    // Greave side seams and knee joint plate line (limb bulk read)
    ctx.strokeStyle = "rgba(48, 48, 55, 0.7)";
    ctx.lineWidth = 1.3 * zoom;
    ctx.beginPath();
    ctx.moveTo(legX - legW * 0.54, legTop + legH * 0.1);
    ctx.lineTo(legX - legW * 0.54, legTop + legH * 0.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(legX + legW * 0.54, legTop + legH * 0.1);
    ctx.lineTo(legX + legW * 0.54, legTop + legH * 0.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(legX - legW * 0.38, legTop + legH * 0.42);
    ctx.quadraticCurveTo(
      legX,
      legTop + legH * 0.48 + legStomp * 0.25,
      legX + legW * 0.38,
      legTop + legH * 0.42
    );
    ctx.stroke();
  }

  // ── Massive armored body (with breathing swell) ──
  const bodyW = size * 0.45 * heaveSwell;
  const bodyGrad = ctx.createLinearGradient(
    x - bodyW,
    y - size * 0.15,
    x + bodyW,
    y + size * 0.15
  );
  bodyGrad.addColorStop(0, "#27272a");
  bodyGrad.addColorStop(0.2, bodyColorDark);
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(0.8, bodyColorDark);
  bodyGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4 * heaveSwell + groundShake, y + size * 0.35);
  ctx.lineTo(
    x - size * 0.46 * heaveSwell + groundShake,
    y - size * 0.1 + breathCycle
  );
  ctx.quadraticCurveTo(
    x + groundShake,
    y - size * 0.38 + breathCycle,
    x + size * 0.46 * heaveSwell + groundShake,
    y - size * 0.1 + breathCycle
  );
  ctx.lineTo(x + size * 0.4 * heaveSwell + groundShake, y + size * 0.35);
  ctx.closePath();
  ctx.fill();

  // Armor plate segments on torso
  ctx.strokeStyle = "rgba(63, 63, 70, 0.6)";
  ctx.lineWidth = 1.5 * zoom;
  // Horizontal plate lines
  for (let seg = 0; seg < 4; seg++) {
    const segY =
      y - size * 0.05 + seg * size * 0.1 + breathCycle * (1 - seg * 0.2);
    const segW = size * (0.38 - seg * 0.03) * heaveSwell;
    ctx.beginPath();
    ctx.moveTo(x - segW + groundShake, segY);
    ctx.quadraticCurveTo(
      x + groundShake,
      segY + size * 0.015,
      x + segW + groundShake,
      segY
    );
    ctx.stroke();
  }
  // Center plate line
  ctx.beginPath();
  ctx.moveTo(x + groundShake, y - size * 0.25 + breathCycle);
  ctx.lineTo(x + groundShake, y + size * 0.32);
  ctx.stroke();

  // Vertical chest seam rivets
  ctx.fillStyle = "#5b5b63";
  for (let vR = 0; vR < 6; vR++) {
    const vRy = y - size * 0.22 + vR * size * 0.09 + breathCycle;
    ctx.beginPath();
    ctx.arc(x + groundShake, vRy, size * 0.011, 0, Math.PI * 2);
    ctx.fill();
  }

  // Armor plate rivets along horizontal seams
  ctx.fillStyle = "#71717a";
  for (let seg = 0; seg < 4; seg++) {
    const rvY =
      y - size * 0.05 + seg * size * 0.1 + breathCycle * (1 - seg * 0.2);
    const rvW = size * (0.35 - seg * 0.03) * heaveSwell;
    for (let rv = 0; rv < 3; rv++) {
      const rvX = x + groundShake + (rv - 1) * rvW * 0.7;
      ctx.beginPath();
      ctx.arc(rvX, rvY, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Belt line and edge rivets
  const beltY = y + size * 0.27 + breathCycle;
  ctx.strokeStyle = "rgba(36, 36, 40, 0.9)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.37 * heaveSwell + groundShake, beltY);
  ctx.quadraticCurveTo(
    x + groundShake,
    beltY + size * 0.022,
    x + size * 0.37 * heaveSwell + groundShake,
    beltY
  );
  ctx.stroke();
  ctx.fillStyle = "#6b6b74";
  for (let bR = 0; bR < 6; bR++) {
    const bRx = x + groundShake + (bR - 2.5) * size * 0.12 * heaveSwell;
    ctx.beginPath();
    ctx.arc(bRx, beltY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Battle damage — dents and scratches on body
  ctx.strokeStyle = "rgba(161, 161, 170, 0.25)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2 + groundShake, y - size * 0.05 + breathCycle);
  ctx.lineTo(x - size * 0.12 + groundShake, y + size * 0.08 + breathCycle);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15 + groundShake, y + breathCycle);
  ctx.lineTo(x + size * 0.22 + groundShake, y + size * 0.12 + breathCycle);
  ctx.stroke();
  // Dent marks
  ctx.strokeStyle = "rgba(82, 82, 91, 0.35)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(
    x - size * 0.18 + groundShake,
    y + size * 0.15 + breathCycle,
    size * 0.03,
    0.3,
    Math.PI * 1.5
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    x + size * 0.25 + groundShake,
    y - size * 0.02 + breathCycle,
    size * 0.025,
    0.8,
    Math.PI * 1.8
  );
  ctx.stroke();

  // ── Glowing rune markings on armor ──
  setShadowBlur(ctx, 6 * zoom, "#d4af37");
  ctx.strokeStyle = `rgba(212, 175, 55, ${runePulse * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  // Left chest rune — angular glyph
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22 + groundShake, y - size * 0.12 + breathCycle);
  ctx.lineTo(x - size * 0.18 + groundShake, y - size * 0.18 + breathCycle);
  ctx.lineTo(x - size * 0.12 + groundShake, y - size * 0.14 + breathCycle);
  ctx.lineTo(x - size * 0.14 + groundShake, y - size * 0.08 + breathCycle);
  ctx.stroke();
  // Right chest rune — angular glyph (mirrored)
  ctx.beginPath();
  ctx.moveTo(x + size * 0.22 + groundShake, y - size * 0.12 + breathCycle);
  ctx.lineTo(x + size * 0.18 + groundShake, y - size * 0.18 + breathCycle);
  ctx.lineTo(x + size * 0.12 + groundShake, y - size * 0.14 + breathCycle);
  ctx.lineTo(x + size * 0.14 + groundShake, y - size * 0.08 + breathCycle);
  ctx.stroke();
  // Center rune — diamond with cross
  ctx.beginPath();
  ctx.moveTo(x + groundShake, y + size * 0.15 + breathCycle);
  ctx.lineTo(x - size * 0.04 + groundShake, y + size * 0.2 + breathCycle);
  ctx.lineTo(x + groundShake, y + size * 0.25 + breathCycle);
  ctx.lineTo(x + size * 0.04 + groundShake, y + size * 0.2 + breathCycle);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + groundShake, y + size * 0.15 + breathCycle);
  ctx.lineTo(x + groundShake, y + size * 0.25 + breathCycle);
  ctx.moveTo(x - size * 0.04 + groundShake, y + size * 0.2 + breathCycle);
  ctx.lineTo(x + size * 0.04 + groundShake, y + size * 0.2 + breathCycle);
  ctx.stroke();
  clearShadow(ctx);

  // ── Academic robe over armor (gold trim) ──
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(
    x - size * 0.36 * heaveSwell + groundShake,
    y - size * 0.05 + breathCycle
  );
  ctx.quadraticCurveTo(
    x + groundShake,
    y + size * 0.1 + breathCycle,
    x + size * 0.36 * heaveSwell + groundShake,
    y - size * 0.05 + breathCycle
  );
  ctx.lineTo(x + size * 0.42 * heaveSwell + groundShake, y + size * 0.42);
  ctx.lineTo(x - size * 0.42 * heaveSwell + groundShake, y + size * 0.42);
  ctx.closePath();
  ctx.fill();
  // Gold trim lines
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 3 * zoom;
  ctx.beginPath();
  ctx.moveTo(
    x - size * 0.36 * heaveSwell + groundShake,
    y - size * 0.05 + breathCycle
  );
  ctx.quadraticCurveTo(
    x + groundShake,
    y + size * 0.1 + breathCycle,
    x + size * 0.36 * heaveSwell + groundShake,
    y - size * 0.05 + breathCycle
  );
  ctx.stroke();
  // Robe vertical gold trim
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + groundShake, y + size * 0.1 + breathCycle);
  ctx.lineTo(x + groundShake, y + size * 0.42);
  ctx.stroke();

  // ── Chest emblem (university seal) ──
  ctx.fillStyle = `rgba(212, 175, 55, ${powerPulse})`;
  ctx.beginPath();
  ctx.arc(
    x + groundShake,
    y + size * 0.05 + breathCycle,
    size * 0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.strokeStyle = "#b8860b";
  ctx.lineWidth = 2 * zoom;
  ctx.stroke();
  // Shield design in emblem
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x + groundShake, y - size * 0.02 + breathCycle);
  ctx.lineTo(x - size * 0.05 + groundShake, y + size * 0.02 + breathCycle);
  ctx.lineTo(x - size * 0.05 + groundShake, y + size * 0.08 + breathCycle);
  ctx.lineTo(x + groundShake, y + size * 0.12 + breathCycle);
  ctx.lineTo(x + size * 0.05 + groundShake, y + size * 0.08 + breathCycle);
  ctx.lineTo(x + size * 0.05 + groundShake, y + size * 0.02 + breathCycle);
  ctx.closePath();
  ctx.fill();
  // Seal glow pulse
  setShadowBlur(ctx, 5 * zoom, "#d4af37");
  ctx.fillStyle = `rgba(212, 175, 55, ${runePulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(
    x + groundShake,
    y + size * 0.05 + breathCycle,
    size * 0.06,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);

  // ── Massive shoulder pauldrons with layered plates ──
  for (let shoulder = 0; shoulder < 2; shoulder++) {
    const sDir = shoulder === 0 ? -1 : 1;
    const sX = x + sDir * size * 0.43 + groundShake;
    const sY = y - size * 0.14 + breathCycle * 0.5;
    const sRot = sDir * -0.3;

    // Base pauldron plate
    const pauldronGrad = ctx.createLinearGradient(
      sX - sDir * size * 0.15,
      sY - size * 0.1,
      sX + sDir * size * 0.15,
      sY + size * 0.1
    );
    pauldronGrad.addColorStop(0, "#52525b");
    pauldronGrad.addColorStop(0.4, "#3f3f46");
    pauldronGrad.addColorStop(1, "#27272a");
    ctx.fillStyle = pauldronGrad;
    ctx.beginPath();
    ctx.ellipse(sX, sY, size * 0.2, size * 0.13, sRot, 0, Math.PI * 2);
    ctx.fill();

    // Upper plate layer
    ctx.fillStyle = "#52525b";
    ctx.beginPath();
    ctx.ellipse(
      sX + sDir * size * 0.02,
      sY - size * 0.03,
      size * 0.15,
      size * 0.08,
      sRot,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Edge highlight
    ctx.strokeStyle = "rgba(161, 161, 170, 0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      sX,
      sY,
      size * 0.2,
      size * 0.13,
      sRot,
      Math.PI * 1.2,
      Math.PI * 1.8
    );
    ctx.stroke();

    // Third overlapping pauldron plate (lower guard)
    ctx.fillStyle = "#3f3f46";
    ctx.beginPath();
    ctx.moveTo(sX - sDir * size * 0.16, sY + size * 0.06);
    ctx.bezierCurveTo(
      sX - sDir * size * 0.08,
      sY + size * 0.1,
      sX + sDir * size * 0.08,
      sY + size * 0.1,
      sX + sDir * size * 0.16,
      sY + size * 0.06
    );
    ctx.bezierCurveTo(
      sX + sDir * size * 0.12,
      sY + size * 0.02,
      sX - sDir * size * 0.12,
      sY + size * 0.02,
      sX - sDir * size * 0.16,
      sY + size * 0.06
    );
    ctx.fill();

    // Spike on pauldron top
    ctx.fillStyle = "#3f3f46";
    ctx.beginPath();
    ctx.moveTo(sX, sY - size * 0.1);
    ctx.lineTo(sX + sDir * size * 0.03, sY - size * 0.2);
    ctx.lineTo(sX + sDir * size * 0.06, sY - size * 0.08);
    ctx.closePath();
    ctx.fill();

    // Pauldron rivets
    ctx.fillStyle = "#d4af37";
    for (let r = 0; r < 4; r++) {
      const rAngle = sRot + (r - 1.5) * 0.5;
      ctx.beginPath();
      ctx.arc(
        sX + Math.cos(rAngle) * size * 0.15,
        sY + Math.sin(rAngle) * size * 0.07,
        size * 0.018,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Pauldron plate rim rivets (outer edge)
    ctx.fillStyle = "#a1a1aa";
    for (let pe = 0; pe < 7; pe++) {
      const peArc = Math.PI * 1.05 + (pe / 6) * Math.PI * 0.75 + sRot * 0.15;
      ctx.beginPath();
      ctx.arc(
        sX + Math.cos(peArc) * size * 0.198,
        sY + Math.sin(peArc) * size * 0.128,
        size * 0.0085,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Extra overlapping pauldron lip (structural rim)
    ctx.strokeStyle = "rgba(30, 30, 34, 0.55)";
    ctx.lineWidth = 1.25 * zoom;
    ctx.beginPath();
    ctx.ellipse(
      sX + sDir * size * 0.02,
      sY + size * 0.02,
      size * 0.17,
      size * 0.11,
      sRot,
      Math.PI * 0.15,
      Math.PI * 0.95
    );
    ctx.stroke();

    // Rune glow on pauldron
    setShadowBlur(ctx, 4 * zoom, "#d4af37");
    ctx.strokeStyle = `rgba(212, 175, 55, ${runePulse * 0.4})`;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - sDir * size * 0.06, sY);
    ctx.lineTo(sX, sY - size * 0.04);
    ctx.lineTo(sX + sDir * size * 0.06, sY);
    ctx.stroke();
    clearShadow(ctx);

    // Battle damage scratch on pauldron
    ctx.strokeStyle = "rgba(161, 161, 170, 0.25)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(sX - sDir * size * 0.08, sY + size * 0.02);
    ctx.lineTo(sX + sDir * size * 0.04, sY - size * 0.04);
    ctx.stroke();
  }

  // ── Ambient effects (drawn behind arms/head) ──

  // Dark metallic glow rings
  drawPulsingGlowRings(ctx, x + groundShake, y, size * 0.4, time, zoom, {
    color: "rgba(212, 175, 55, 0.4)",
    count: 2,
    expansion: 1.2,
    lineWidth: 2,
    maxAlpha: 0.2,
    speed: 1,
  });

  // Floating armor plate segments (diamond shape)
  drawShiftingSegments(ctx, x + groundShake, y, size, time, zoom, {
    bobAmt: 0.025,
    bobSpeed: 1.5,
    color: "#52525b",
    colorAlt: "#3f3f46",
    count: 5,
    orbitRadius: 0.48,
    orbitSpeed: 0.6,
    rotateWithOrbit: true,
    segmentSize: 0.04,
    shape: "diamond",
  });

  // Floating shoulder pieces
  for (const side of [-1, 1] as const) {
    drawFloatingPiece(
      ctx,
      x + side * size * 0.5 + groundShake,
      y - size * 0.18 + breathCycle * 0.3,
      size,
      time,
      side * 1.5,
      {
        bobAmt: 0.015,
        bobSpeed: 2,
        color: "#3f3f46",
        colorEdge: "#27272a",
        height: 0.06,
        rotateAmt: 0.08,
        rotateSpeed: 1.5,
        width: 0.1,
      }
    );
  }

  // Ambient gold energy wisps around body
  for (let w = 0; w < 3; w++) {
    const wPhase = time * 1.8 + w * 2.1;
    const wAngle = wPhase % (Math.PI * 2);
    const wDist = size * (0.35 + cos3 * 0.05);
    const wX = x + Math.cos(wAngle) * wDist + groundShake;
    const wY = y - size * 0.1 + Math.sin(wAngle * 1.3) * size * 0.25;
    const wAlpha = 0.15 + sin4 * 0.1;
    ctx.fillStyle = `rgba(212, 175, 55, ${wAlpha})`;
    ctx.beginPath();
    ctx.arc(wX, wY, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }

  // Funding aura — multi-layered golden/green wealth glow
  const fundingPulse = 0.5 + Math.sin(time * 2.2) * 0.3;
  const fundAuraGrad = ctx.createRadialGradient(
    x + groundShake,
    y,
    size * 0.05,
    x + groundShake,
    y,
    size * 0.65
  );
  fundAuraGrad.addColorStop(0, `rgba(212, 175, 55, ${fundingPulse * 0.15})`);
  fundAuraGrad.addColorStop(0.25, `rgba(190, 165, 40, ${fundingPulse * 0.1})`);
  fundAuraGrad.addColorStop(0.5, `rgba(100, 160, 60, ${fundingPulse * 0.07})`);
  fundAuraGrad.addColorStop(0.75, `rgba(60, 130, 40, ${fundingPulse * 0.04})`);
  fundAuraGrad.addColorStop(1, "rgba(60, 130, 40, 0)");
  ctx.fillStyle = fundAuraGrad;
  ctx.beginPath();
  ctx.arc(x + groundShake, y, size * 0.65, 0, Math.PI * 2);
  ctx.fill();

  // Impact shockwave — pulsing momentum rings
  for (let iRing = 0; iRing < 3; iRing++) {
    const iPhase = (time * 2 + iRing * 0.7) % 1;
    const iR = size * (0.3 + iPhase * 0.4);
    const iAlpha = (1 - iPhase) * 0.18;
    if (iAlpha > 0.01) {
      ctx.strokeStyle = `rgba(212, 175, 55, ${iAlpha})`;
      ctx.lineWidth = (2.5 - iPhase * 1.5) * zoom;
      ctx.beginPath();
      ctx.ellipse(
        x + groundShake,
        y + size * 0.52,
        iR,
        iR * ISO_Y_RATIO,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
  }

  // Armor plate glow — inner power pulse highlights
  const armorGlowPulse = 0.4 + Math.sin(time * 3.5) * 0.3;
  for (let ag = 0; ag < 4; ag++) {
    const agAngle = (ag * Math.PI) / 2 + time * 0.3;
    const agX = x + Math.cos(agAngle) * size * 0.3 + groundShake;
    const agY = y + Math.sin(agAngle) * size * 0.15 + breathCycle;
    const agGrad = ctx.createRadialGradient(agX, agY, 0, agX, agY, size * 0.08);
    agGrad.addColorStop(0, `rgba(212, 175, 55, ${armorGlowPulse * 0.2})`);
    agGrad.addColorStop(0.5, `rgba(212, 175, 55, ${armorGlowPulse * 0.08})`);
    agGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.fillStyle = agGrad;
    ctx.beginPath();
    ctx.arc(agX, agY, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  // Orbiting funding symbols — golden diamond/coin shapes
  for (let coin = 0; coin < 5; coin++) {
    const coinAngle = time * 0.8 + (coin / 5) * Math.PI * 2;
    const coinDist = size * (0.52 + Math.sin(time * 1.5 + coin) * 0.04);
    const coinX = x + Math.cos(coinAngle) * coinDist + groundShake;
    const coinY = y - size * 0.05 + Math.sin(coinAngle * 1.3) * size * 0.2;
    const coinAlpha = 0.5 + Math.sin(time * 3 + coin * 1.2) * 0.2;
    const cs = size * 0.025;
    ctx.save();
    ctx.translate(coinX, coinY);
    ctx.rotate(time * 2 + coin);
    ctx.fillStyle = `rgba(212, 175, 55, ${coinAlpha})`;
    ctx.beginPath();
    ctx.moveTo(0, -cs);
    ctx.lineTo(cs * 0.7, 0);
    ctx.lineTo(0, cs);
    ctx.lineTo(-cs * 0.7, 0);
    ctx.closePath();
    ctx.fill();
    const coinGlowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, cs);
    coinGlowGrad.addColorStop(0, `rgba(255, 230, 150, ${coinAlpha * 0.4})`);
    coinGlowGrad.addColorStop(1, "rgba(255, 230, 150, 0)");
    ctx.fillStyle = coinGlowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, cs, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Steam/exhaust vents from shoulder area
  for (const ventSide of [-1, 1] as const) {
    const ventBaseX = x + ventSide * size * 0.4 + groundShake;
    const ventBaseY = y - size * 0.18 + breathCycle * 0.4;
    for (let puff = 0; puff < 3; puff++) {
      const puffPhase =
        (time * 1.5 + puff * 0.33 + (ventSide === 1 ? 0.5 : 0)) % 1;
      const puffY = ventBaseY - puffPhase * size * 0.3;
      const puffAlpha = (1 - puffPhase) * 0.25;
      const puffR = size * (0.02 + puffPhase * 0.03);
      const puffGrad = ctx.createRadialGradient(
        ventBaseX,
        puffY,
        0,
        ventBaseX,
        puffY,
        puffR
      );
      puffGrad.addColorStop(0, `rgba(180, 180, 180, ${puffAlpha})`);
      puffGrad.addColorStop(0.5, `rgba(150, 150, 150, ${puffAlpha * 0.5})`);
      puffGrad.addColorStop(1, "rgba(120, 120, 120, 0)");
      ctx.fillStyle = puffGrad;
      ctx.beginPath();
      ctx.arc(
        ventBaseX + Math.sin(time * 3 + puff + ventSide) * size * 0.02,
        puffY,
        puffR,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // Juggernaut arms — heavy fist ground-slam ready
  for (const side of [-1, 1] as const) {
    drawPathArm(
      ctx,
      x + side * size * 0.42 + groundShake,
      y - size * 0.12 + breathCycle * 0.5,
      size,
      time,
      zoom,
      side,
      {
        color: bodyColor,
        colorDark: bodyColorDark,
        elbowAngle: 0.6 + Math.sin(time * 2 + side * 1.5) * 0.1,
        foreLen: 0.2,
        handColor: "#52525b",
        handRadius: 0.04,
        onWeapon: (wCtx) => {
          const plateW = size * 0.065;
          const plateH = size * 0.04;

          // Armored knuckle plate with metal gradient
          const plateGrad = wCtx.createLinearGradient(-plateW, 0, plateW, 0);
          plateGrad.addColorStop(0, "#3f3f46");
          plateGrad.addColorStop(0.3, "#71717a");
          plateGrad.addColorStop(0.5, "#a1a1aa");
          plateGrad.addColorStop(0.7, "#71717a");
          plateGrad.addColorStop(1, "#3f3f46");
          wCtx.fillStyle = plateGrad;
          wCtx.beginPath();
          wCtx.roundRect(
            -plateW,
            -plateH * 0.5,
            plateW * 2,
            plateH,
            size * 0.006
          );
          wCtx.fill();

          // Plate edge highlight
          wCtx.strokeStyle = "rgba(161, 161, 170, 0.5)";
          wCtx.lineWidth = 1 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(-plateW * 0.9, -plateH * 0.45);
          wCtx.lineTo(plateW * 0.9, -plateH * 0.45);
          wCtx.stroke();

          // 4 blunt spikes protruding forward
          for (let sp = 0; sp < 4; sp++) {
            const spikeX = -plateW * 0.7 + sp * ((plateW * 2 * 0.7) / 3);
            const spikeH = size * (0.04 + Math.sin(time * 2 + sp) * 0.003);
            const spikeW = size * 0.012;

            const spikeGrad = wCtx.createLinearGradient(
              spikeX,
              0,
              spikeX,
              -spikeH
            );
            spikeGrad.addColorStop(0, "#52525b");
            spikeGrad.addColorStop(0.6, "#71717a");
            spikeGrad.addColorStop(1, "#a1a1aa");
            wCtx.fillStyle = spikeGrad;
            wCtx.beginPath();
            wCtx.moveTo(spikeX, -plateH * 0.4);
            wCtx.lineTo(spikeX - spikeW * 0.5, -plateH * 0.4);
            wCtx.lineTo(spikeX - spikeW * 0.15, -plateH * 0.4 - spikeH);
            wCtx.lineTo(spikeX + spikeW * 0.15, -plateH * 0.4 - spikeH);
            wCtx.lineTo(spikeX + spikeW * 0.5, -plateH * 0.4);
            wCtx.closePath();
            wCtx.fill();
          }

          // Rivets on plate
          wCtx.fillStyle = "#52525b";
          for (let rv = 0; rv < 3; rv++) {
            const rvX = -plateW * 0.6 + rv * plateW * 0.6;
            wCtx.beginPath();
            wCtx.arc(rvX, plateH * 0.15, size * 0.004, 0, Math.PI * 2);
            wCtx.fill();
          }

          // Impact glow when attacking
          if (isAttacking) {
            const impactAlpha = attackPhase * 0.6;
            setShadowBlur(
              wCtx,
              10 * zoom,
              `rgba(212, 175, 55, ${impactAlpha})`
            );
            const impactGrad = wCtx.createRadialGradient(
              0,
              -plateH * 0.3,
              0,
              0,
              -plateH * 0.3,
              size * 0.06
            );
            impactGrad.addColorStop(
              0,
              `rgba(250, 204, 21, ${impactAlpha * 0.8})`
            );
            impactGrad.addColorStop(
              0.5,
              `rgba(212, 175, 55, ${impactAlpha * 0.4})`
            );
            impactGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
            wCtx.fillStyle = impactGrad;
            wCtx.beginPath();
            wCtx.arc(0, -plateH * 0.3, size * 0.06, 0, Math.PI * 2);
            wCtx.fill();
            clearShadow(wCtx);

            // Ground crack hint shadow beneath fist
            wCtx.fillStyle = `rgba(0, 0, 0, ${attackPhase * 0.25})`;
            wCtx.beginPath();
            wCtx.ellipse(
              0,
              plateH * 0.8,
              size * 0.05 * attackPhase,
              size * 0.02 * attackPhase,
              0,
              0,
              Math.PI * 2
            );
            wCtx.fill();
          }
        },
        shoulderAngle:
          side *
          (0.3 +
            Math.sin(time * 1.5 + side) * 0.08 +
            (isAttacking ? attackPhase * 0.5 : 0)),
        style: "armored",
        upperLen: 0.22,
        width: 0.07,
      }
    );
  }

  // ── Powerful arms with gauntlets ──
  for (let arm = 0; arm < 2; arm++) {
    const aDir = arm === 0 ? -1 : 1;
    const armSwing = isAttacking
      ? aDir * attackPhase * size * 0.08
      : sin3 * size * 0.01 * aDir;
    const armX = x + aDir * size * 0.44 + groundShake + armSwing;
    const armTop = y - size * 0.1 + breathCycle * 0.5;
    const armW = size * 0.13;
    const armH = size * 0.36;

    // Upper arm
    const armGrad = ctx.createLinearGradient(
      armX - armW * 0.5,
      armTop,
      armX + armW * 0.5,
      armTop
    );
    armGrad.addColorStop(0, bodyColorDark);
    armGrad.addColorStop(0.5, bodyColor);
    armGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = armGrad;
    ctx.beginPath();
    ctx.roundRect(armX - armW * 0.5, armTop, armW, armH * 0.55, [size * 0.02]);
    ctx.fill();

    // Upper arm plate joint and outer mass lines
    ctx.strokeStyle = "rgba(42, 42, 50, 0.6)";
    ctx.lineWidth = 1.35 * zoom;
    ctx.beginPath();
    ctx.moveTo(armX, armTop + armH * 0.06);
    ctx.quadraticCurveTo(
      armX + aDir * size * 0.025,
      armTop + armH * 0.26,
      armX,
      armTop + armH * 0.5
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(armX - aDir * armW * 0.58, armTop + armH * 0.18);
    ctx.lineTo(armX - aDir * armW * 0.58, armTop + armH * 0.48);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(armX + aDir * armW * 0.58, armTop + armH * 0.18);
    ctx.lineTo(armX + aDir * armW * 0.58, armTop + armH * 0.48);
    ctx.stroke();

    // Forearm armor plate
    ctx.fillStyle = "#3f3f46";
    ctx.beginPath();
    ctx.roundRect(
      armX - armW * 0.55,
      armTop + armH * 0.5,
      armW * 1.1,
      armH * 0.35,
      [size * 0.015]
    );
    ctx.fill();
    // Forearm edge
    ctx.strokeStyle = "rgba(113, 113, 122, 0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(armX - armW * 0.55, armTop + armH * 0.5);
    ctx.lineTo(armX + armW * 0.55, armTop + armH * 0.5);
    ctx.stroke();

    // Forearm side plate seams
    ctx.strokeStyle = "rgba(50, 50, 58, 0.65)";
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(armX - armW * 0.58, armTop + armH * 0.55);
    ctx.lineTo(armX - armW * 0.58, armTop + armH * 0.78);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(armX + armW * 0.58, armTop + armH * 0.55);
    ctx.lineTo(armX + armW * 0.58, armTop + armH * 0.78);
    ctx.stroke();

    // ── Gauntlet / fist detail ──
    const fistX = armX;
    const fistY = armTop + armH * 0.88;
    // Gauntlet base
    ctx.fillStyle = "#52525b";
    ctx.beginPath();
    ctx.roundRect(
      fistX - armW * 0.6,
      fistY - size * 0.02,
      armW * 1.2,
      size * 0.12,
      [size * 0.02]
    );
    ctx.fill();

    // Metal knuckle ridges
    ctx.fillStyle = "#71717a";
    for (let k = 0; k < 3; k++) {
      const kX = fistX - armW * 0.35 + k * armW * 0.35;
      ctx.beginPath();
      ctx.arc(kX, fistY + size * 0.02, size * 0.018, 0, Math.PI * 2);
      ctx.fill();
    }
    // Knuckle highlight
    ctx.strokeStyle = "rgba(161, 161, 170, 0.35)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(fistX - armW * 0.4, fistY + size * 0.015);
    ctx.lineTo(fistX + armW * 0.4, fistY + size * 0.015);
    ctx.stroke();

    // Gauntlet rivet
    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    ctx.arc(fistX, fistY + size * 0.06, size * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Helmeted head ──
  const headY = y - size * 0.35 + breathCycle * 0.6;
  // Neck armor
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.ellipse(
    x + groundShake,
    y - size * 0.22 + breathCycle * 0.5,
    size * 0.12,
    size * 0.06,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Helmet base
  const helmetGrad = ctx.createRadialGradient(
    x + groundShake,
    headY - size * 0.02,
    size * 0.02,
    x + groundShake,
    headY,
    size * 0.24
  );
  helmetGrad.addColorStop(0, "#52525b");
  helmetGrad.addColorStop(0.5, bodyColorDark);
  helmetGrad.addColorStop(1, "#27272a");
  ctx.fillStyle = helmetGrad;
  ctx.beginPath();
  ctx.arc(x + groundShake, headY, size * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Helmet ridge/crest running top-to-back
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.moveTo(x + groundShake, headY - size * 0.24);
  ctx.quadraticCurveTo(
    x + groundShake + size * 0.015,
    headY - size * 0.1,
    x + groundShake,
    headY + size * 0.05
  );
  ctx.quadraticCurveTo(
    x + groundShake - size * 0.015,
    headY - size * 0.1,
    x + groundShake,
    headY - size * 0.24
  );
  ctx.fill();

  // Brow ridge above visor
  ctx.strokeStyle = "#52525b";
  ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.17 + groundShake, headY - size * 0.06);
  ctx.bezierCurveTo(
    x - size * 0.08 + groundShake,
    headY - size * 0.1,
    x + size * 0.08 + groundShake,
    headY - size * 0.1,
    x + size * 0.17 + groundShake,
    headY - size * 0.06
  );
  ctx.stroke();

  // Faceplate with T-shaped visor slit
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15 + groundShake, headY - size * 0.08);
  ctx.lineTo(x + size * 0.15 + groundShake, headY - size * 0.08);
  ctx.lineTo(x + size * 0.12 + groundShake, headY + size * 0.12);
  ctx.lineTo(x - size * 0.12 + groundShake, headY + size * 0.12);
  ctx.closePath();
  ctx.fill();

  // Structural eye slit frame (drawn before glow so eyes render on top)
  ctx.strokeStyle = "#0c0c0f";
  ctx.lineWidth = 1.15 * zoom;
  const slitTop = headY - size * 0.04;
  const slitBot = headY - size * 0.015;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11 + groundShake, slitTop);
  ctx.lineTo(x + size * 0.11 + groundShake, slitTop);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11 + groundShake, slitBot);
  ctx.lineTo(x + size * 0.11 + groundShake, slitBot);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - size * 0.11 + groundShake, slitTop);
  ctx.lineTo(x - size * 0.11 + groundShake, slitBot);
  ctx.moveTo(x + size * 0.11 + groundShake, slitTop);
  ctx.lineTo(x + size * 0.11 + groundShake, slitBot);
  ctx.stroke();

  // Visor horizontal slit
  ctx.fillStyle = `rgba(212, 175, 55, ${runePulse * 0.6 + 0.2})`;
  setShadowBlur(ctx, 8 * zoom, "#d4af37");
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.13 + groundShake,
    headY - size * 0.05,
    size * 0.26,
    size * 0.035,
    [size * 0.01]
  );
  ctx.fill();
  // Visor vertical slit (T shape)
  ctx.beginPath();
  ctx.roundRect(
    x - size * 0.02 + groundShake,
    headY - size * 0.05,
    size * 0.04,
    size * 0.13,
    [size * 0.005]
  );
  ctx.fill();
  clearShadow(ctx);

  // Glowing eye dots behind visor
  ctx.fillStyle = `rgba(255, 230, 150, ${runePulse * 0.7 + 0.3})`;
  setShadowBlur(ctx, 10 * zoom, "#fbbf24");
  ctx.beginPath();
  ctx.arc(
    x - size * 0.065 + groundShake,
    headY - size * 0.03,
    size * 0.022,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.065 + groundShake,
    headY - size * 0.03,
    size * 0.022,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);

  // Helmet cheek guards
  ctx.fillStyle = "#3f3f46";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.18 + groundShake, headY - size * 0.04);
  ctx.lineTo(x - size * 0.22 + groundShake, headY + size * 0.08);
  ctx.lineTo(x - size * 0.14 + groundShake, headY + size * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.18 + groundShake, headY - size * 0.04);
  ctx.lineTo(x + size * 0.22 + groundShake, headY + size * 0.08);
  ctx.lineTo(x + size * 0.14 + groundShake, headY + size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Breathing vent slits on faceplate
  ctx.strokeStyle = "rgba(82, 82, 91, 0.5)";
  ctx.lineWidth = 1 * zoom;
  for (let vent = 0; vent < 3; vent++) {
    const ventY = headY + size * 0.06 + vent * size * 0.02;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.04 + groundShake, ventY);
    ctx.lineTo(x + size * 0.04 + groundShake, ventY);
    ctx.stroke();
  }

  // ── Academic mortarboard on helmet ──
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22 + groundShake, headY - size * 0.2);
  ctx.lineTo(x + size * 0.22 + groundShake, headY - size * 0.2);
  ctx.lineTo(x + size * 0.2 + groundShake, headY - size * 0.24);
  ctx.lineTo(x - size * 0.2 + groundShake, headY - size * 0.24);
  ctx.closePath();
  ctx.fill();
  // Mortarboard brim shadow
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.22 + groundShake, headY - size * 0.2);
  ctx.lineTo(x + size * 0.22 + groundShake, headY - size * 0.2);
  ctx.stroke();

  // Tassel
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 2 * zoom;
  const tasselSwing = sin3 * size * 0.05;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.15 + groundShake, headY - size * 0.21);
  ctx.quadraticCurveTo(
    x + size * 0.25 + groundShake + tasselSwing * 0.5,
    headY - size * 0.1,
    x + size * 0.22 + groundShake + tasselSwing,
    headY
  );
  ctx.stroke();
  // Tassel ball
  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.22 + groundShake + tasselSwing,
    headY,
    size * 0.025,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Tassel strands
  ctx.lineWidth = 1 * zoom;
  for (let ts = 0; ts < 3; ts++) {
    const tsAngle = -0.3 + ts * 0.3;
    ctx.beginPath();
    ctx.moveTo(
      x + size * 0.22 + groundShake + tasselSwing,
      headY + size * 0.02
    );
    ctx.lineTo(
      x +
        size * 0.22 +
        groundShake +
        tasselSwing +
        Math.cos(tsAngle) * size * 0.03,
      headY + size * 0.06 + Math.sin(time * 4 + ts) * size * 0.01
    );
    ctx.stroke();
  }

  // ── Giant ceremonial mace ──
  ctx.save();
  const maceSwing = isAttacking ? -attackPhase * 0.8 : sin3 * 0.05;
  ctx.translate(
    x + size * 0.46 + groundShake,
    y + size * 0.15 + breathCycle * 0.3
  );
  ctx.rotate(0.3 + maceSwing);

  // Mace shaft with wood grain
  const shaftGrad = ctx.createLinearGradient(-size * 0.025, 0, size * 0.025, 0);
  shaftGrad.addColorStop(0, "#78350f");
  shaftGrad.addColorStop(0.3, "#92400e");
  shaftGrad.addColorStop(0.7, "#78350f");
  shaftGrad.addColorStop(1, "#451a03");
  ctx.fillStyle = shaftGrad;
  ctx.fillRect(-size * 0.025, -size * 0.02, size * 0.05, size * 0.42);
  // Shaft grip wrapping
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = 1 * zoom;
  for (let wrap = 0; wrap < 5; wrap++) {
    const wrapY = size * 0.06 + wrap * size * 0.07;
    ctx.beginPath();
    ctx.moveTo(-size * 0.025, wrapY);
    ctx.lineTo(size * 0.025, wrapY + size * 0.02);
    ctx.stroke();
  }

  // Mace head — larger, more ornate
  const maceHeadGrad = ctx.createRadialGradient(
    0,
    -size * 0.1,
    size * 0.02,
    0,
    -size * 0.1,
    size * 0.1
  );
  maceHeadGrad.addColorStop(0, "#fbbf24");
  maceHeadGrad.addColorStop(0.6, "#d4af37");
  maceHeadGrad.addColorStop(1, "#92400e");
  ctx.fillStyle = maceHeadGrad;
  ctx.beginPath();
  ctx.arc(0, -size * 0.1, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // Mace flanges / spikes
  ctx.fillStyle = "#b8860b";
  for (let spike = 0; spike < 8; spike++) {
    const spikeAngle = (spike * Math.PI) / 4;
    const innerR = size * 0.07;
    const outerR = size * 0.14;
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(spikeAngle - 0.15) * innerR,
      -size * 0.1 + Math.sin(spikeAngle - 0.15) * innerR
    );
    ctx.lineTo(
      Math.cos(spikeAngle) * outerR,
      -size * 0.1 + Math.sin(spikeAngle) * outerR
    );
    ctx.lineTo(
      Math.cos(spikeAngle + 0.15) * innerR,
      -size * 0.1 + Math.sin(spikeAngle + 0.15) * innerR
    );
    ctx.fill();
  }

  // Mace center gem
  ctx.fillStyle = `rgba(212, 175, 55, ${powerPulse + 0.3})`;
  ctx.beginPath();
  ctx.arc(0, -size * 0.1, size * 0.03, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ── Attack ground-slam debris ──
  if (isAttacking && attackPhase > 0.2) {
    const debrisAlpha = Math.min(1, (attackPhase - 0.2) * 2);
    for (let d = 0; d < 5; d++) {
      const dAngle = (d / 5) * Math.PI * 2 + time * 3;
      const dDist = size * (0.3 + attackPhase * 0.4);
      const dRise = attackPhase * size * 0.3;
      const dX = x + Math.cos(dAngle) * dDist + groundShake;
      const dY = y + size * 0.45 - dRise + Math.sin(dAngle) * size * 0.08;
      const dSize = size * (0.015 + sin5 * 0.005);
      ctx.fillStyle = `rgba(120, 113, 108, ${debrisAlpha * 0.5})`;
      ctx.beginPath();
      ctx.save();
      ctx.translate(dX, dY);
      ctx.rotate(time * 5 + d);
      ctx.fillRect(-dSize, -dSize, dSize * 2, dSize * 1.5);
      ctx.restore();
    }
  }

  // ── Power aura during attack ──
  if (isAttacking) {
    const auraAlpha = attackPhase * 0.25;
    const auraR = size * (0.55 + attackPhase * 0.3);
    const attackAura = ctx.createRadialGradient(
      x + groundShake,
      y,
      size * 0.1,
      x + groundShake,
      y,
      auraR
    );
    attackAura.addColorStop(0, `rgba(212, 175, 55, ${auraAlpha})`);
    attackAura.addColorStop(0.5, `rgba(184, 134, 11, ${auraAlpha * 0.5})`);
    attackAura.addColorStop(1, "rgba(212, 175, 55, 0)");
    ctx.fillStyle = attackAura;
    ctx.beginPath();
    ctx.arc(x + groundShake, y, auraR, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawAssassinEnemy(
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
  region: MapTheme = "grassland"
) {
  const isAttacking = attackPhase > 0;
  const dashPhase = Math.sin(time * 8) * 0.1;
  const shadowFlicker =
    0.4 + Math.sin(time * 6) * 0.2 + (isAttacking ? attackPhase * 0.4 : 0);
  const lean = Math.sin(time * 4) * 0.1;
  const blurForward = isAttacking ? attackPhase * size * 0.15 : 0;

  let eyeGlowHex = "#a78bfa";
  let bladeLight = "#71717a";
  let bladeMid = "#52525b";
  let bladeDark = "#3f3f46";
  let bladeSilhouette = "#4a4a55";

  const rm = getRegionMaterials(region);
  if (region !== "grassland") {
    eyeGlowHex = rm.magic.primary;
    bladeLight = rm.metal.bright;
    bladeMid = rm.metal.base;
    bladeDark = rm.metal.dark;
    bladeSilhouette = rm.metal.dark;
  }

  // Dark purple/poison aura
  const auraGrad = ctx.createRadialGradient(
    x,
    y,
    size * 0.2,
    x,
    y,
    size * 0.65
  );
  auraGrad.addColorStop(
    0,
    `rgba(88, 28, 135, ${0.08 + Math.sin(time * 3) * 0.04})`
  );
  auraGrad.addColorStop(
    0.5,
    `rgba(59, 7, 100, ${0.05 + Math.sin(time * 2.5) * 0.03})`
  );
  auraGrad.addColorStop(1, "rgba(30, 27, 75, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.65, size * 0.65 * ISO_Y_RATIO, 0, 0, Math.PI * 2);
  ctx.fill();

  // Assassin arms — blades pulled back for strike
  for (const side of [-1, 1] as const) {
    drawPathArm(
      ctx,
      x + side * size * 0.18 + blurForward,
      y - size * 0.05,
      size,
      time,
      zoom,
      side,
      {
        color: bodyColor,
        colorDark: bodyColorDark,
        elbowAngle: 0.6 + Math.sin(time * 7 + side * 2) * 0.15,
        foreLen: 0.14,
        handColor: `rgba(167, 139, 250, ${shadowFlicker})`,
        handRadius: 0.02,
        onWeapon: (wCtx) => {
          // Twin poison daggers — curved blade
          const bladeLen = size * 0.14;
          const bladeW = size * 0.02;
          const curve = size * 0.015 * side;

          // Blade body with dark purple/obsidian gradient
          const bladeGrad = wCtx.createLinearGradient(0, 0, 0, -bladeLen);
          bladeGrad.addColorStop(0, "rgba(30, 27, 75, 0.95)");
          bladeGrad.addColorStop(0.3, "rgba(88, 28, 135, 0.9)");
          bladeGrad.addColorStop(0.7, "rgba(59, 7, 100, 0.85)");
          bladeGrad.addColorStop(1, "rgba(30, 27, 75, 0.7)");

          wCtx.fillStyle = bladeGrad;
          wCtx.beginPath();
          wCtx.moveTo(0, size * 0.005);
          wCtx.quadraticCurveTo(
            -bladeW * 0.8,
            -bladeLen * 0.3,
            -bladeW * 0.3 + curve,
            -bladeLen * 0.85
          );
          wCtx.lineTo(curve * 0.5, -bladeLen);
          wCtx.quadraticCurveTo(
            bladeW * 0.6 + curve * 0.3,
            -bladeLen * 0.6,
            bladeW * 0.4,
            -bladeLen * 0.1
          );
          wCtx.closePath();
          wCtx.fill();

          // Blade edge highlight
          wCtx.strokeStyle = "rgba(167, 139, 250, 0.5)";
          wCtx.lineWidth = 0.8 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(-bladeW * 0.1, 0);
          wCtx.quadraticCurveTo(
            -bladeW * 0.6,
            -bladeLen * 0.35,
            curve * 0.5,
            -bladeLen * 0.97
          );
          wCtx.stroke();

          // Fuller (blood groove) line
          wCtx.strokeStyle = "rgba(88, 28, 135, 0.6)";
          wCtx.lineWidth = 1 * zoom;
          wCtx.beginPath();
          wCtx.moveTo(bladeW * 0.1, -bladeLen * 0.15);
          wCtx.quadraticCurveTo(
            bladeW * 0.05 + curve * 0.2,
            -bladeLen * 0.5,
            curve * 0.3,
            -bladeLen * 0.8
          );
          wCtx.stroke();

          // Cross-guard
          const guardW = size * 0.035;
          const guardH = size * 0.01;
          const guardGrad = wCtx.createLinearGradient(-guardW, 0, guardW, 0);
          guardGrad.addColorStop(0, "#1e1b4b");
          guardGrad.addColorStop(0.5, "#3b0764");
          guardGrad.addColorStop(1, "#1e1b4b");
          wCtx.fillStyle = guardGrad;
          wCtx.beginPath();
          wCtx.roundRect(
            -guardW,
            -guardH * 0.5,
            guardW * 2,
            guardH,
            size * 0.003
          );
          wCtx.fill();

          // Dark gem in cross-guard center
          setShadowBlur(wCtx, 3 * zoom, "rgba(139, 92, 246, 0.6)");
          wCtx.fillStyle = "rgba(139, 92, 246, 0.8)";
          wCtx.beginPath();
          wCtx.arc(0, 0, size * 0.005, 0, Math.PI * 2);
          wCtx.fill();
          clearShadow(wCtx);

          // Venom drips from blade tip
          for (let d = 0; d < 2; d++) {
            const dripPhase = (time * 2 + d * 1.5 + side * 0.7) % 2;
            if (dripPhase < 1.2) {
              const dripY = -bladeLen + dripPhase * size * 0.06;
              const dripAlpha = (1 - dripPhase / 1.2) * 0.7;
              const dripX = curve * 0.5 + Math.sin(time * 3 + d) * size * 0.003;
              wCtx.fillStyle = `rgba(34, 197, 94, ${dripAlpha})`;
              wCtx.beginPath();
              wCtx.ellipse(
                dripX,
                dripY,
                size * 0.004,
                size * 0.006,
                0,
                0,
                Math.PI * 2
              );
              wCtx.fill();
            }
          }

          // Shadow energy trail when attacking
          if (isAttacking) {
            const trailAlpha = attackPhase * 0.4;
            for (let tr = 0; tr < 3; tr++) {
              const trY = -bladeLen * (0.3 + tr * 0.2);
              const trOff = Math.sin(time * 8 + tr * 1.5) * size * 0.01;
              wCtx.strokeStyle = `rgba(88, 28, 135, ${trailAlpha * (1 - tr * 0.25)})`;
              wCtx.lineWidth = (2 - tr * 0.5) * zoom;
              wCtx.beginPath();
              wCtx.moveTo(trOff - size * 0.02, trY);
              wCtx.quadraticCurveTo(
                trOff,
                trY - size * 0.015,
                trOff + size * 0.02,
                trY
              );
              wCtx.stroke();
            }
          }
        },
        shoulderAngle:
          side *
          (0.9 +
            Math.sin(time * 6 + side * Math.PI) * 0.15 +
            (isAttacking ? attackPhase * 0.8 : 0)),
        style: "armored",
        upperLen: 0.15,
        width: 0.04,
      }
    );
  }

  // Agile legs
  drawPathLegs(ctx, x + blurForward, y + size * 0.32, size, time, zoom, {
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: "rgba(30, 27, 75, 0.8)",
    legLen: 0.14,
    strideAmt: 0.35,
    strideSpeed: 8,
    style: "armored",
    width: 0.04,
  });

  // Structural leg wraps — diagonal bandage strokes on each limb
  {
    const legBaseY = y + size * 0.32 + blurForward;
    const stride = Math.sin(time * 8) * size * 0.05;
    ctx.strokeStyle = "rgba(48, 44, 72, 0.75)";
    ctx.lineWidth = 1 * zoom;
    for (const legSide of [-1, 1] as const) {
      const legCx =
        x + blurForward + legSide * size * 0.09 + stride * legSide * 0.6;
      for (let lw = 0; lw < 6; lw++) {
        const ly = legBaseY - size * 0.1 + lw * size * 0.045;
        ctx.beginPath();
        ctx.moveTo(legCx - size * 0.028, ly - legSide * size * 0.018);
        ctx.lineTo(legCx + size * 0.028, ly + legSide * size * 0.05);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(legCx + size * 0.022, ly - legSide * size * 0.01);
        ctx.lineTo(legCx - size * 0.022, ly + legSide * size * 0.04);
        ctx.stroke();
      }
    }
  }

  // === Shadow dash trail — 2 extra deep silhouettes extending the trail ===
  for (let sd = 4; sd >= 3; sd--) {
    const sdAlpha = 0.08 - (sd - 3) * 0.03;
    const sdOffset = (sd + 1) * size * 0.13;
    const sdScale = 1 - sd * 0.05;

    ctx.save();
    ctx.globalAlpha = sdAlpha;
    ctx.translate(x - sdOffset, y + sd * size * 0.012);
    ctx.scale(sdScale, sdScale);
    ctx.fillStyle = "rgba(20, 15, 50, 0.9)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.05, size * 0.18, size * 0.3, lean, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -size * 0.25, size * 0.14, 0, Math.PI * 2);
    ctx.fill();
    // Faint eye embers in distant silhouettes
    ctx.fillStyle = `rgba(139, 92, 246, ${sdAlpha * 2})`;
    ctx.beginPath();
    ctx.arc(-size * 0.04, -size * 0.27, size * 0.012, 0, Math.PI * 2);
    ctx.arc(size * 0.04, -size * 0.27, size * 0.012, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;

  // Shadow clone afterimages (2-3 semi-transparent copies trailing)
  for (let clone = 2; clone >= 0; clone--) {
    const cloneAlpha = (1 - clone * 0.3) * 0.12;
    const cloneOffset = (clone + 1) * size * 0.12;
    const cloneLean = lean + clone * 0.05;
    const cx = x - cloneOffset;
    const cy = y + clone * size * 0.01;

    ctx.save();
    ctx.globalAlpha = cloneAlpha;
    ctx.translate(cx, cy);
    ctx.rotate(cloneLean);

    // Clone body
    ctx.fillStyle = "rgba(30, 27, 75, 0.9)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.05, size * 0.2, size * 0.33, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clone hood
    ctx.fillStyle = "rgba(20, 18, 50, 0.9)";
    ctx.beginPath();
    ctx.arc(0, -size * 0.26, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-size * 0.08, -size * 0.38);
    ctx.lineTo(0, -size * 0.5);
    ctx.lineTo(size * 0.08, -size * 0.38);
    ctx.closePath();
    ctx.fill();

    // Clone eye glints
    ctx.fillStyle = "rgba(167, 139, 250, 0.6)";
    ctx.beginPath();
    ctx.arc(-size * 0.04, -size * 0.28, size * 0.015, 0, Math.PI * 2);
    ctx.arc(size * 0.04, -size * 0.28, size * 0.015, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  // Motion blur/afterimage trail
  for (let trail = 0; trail < 5; trail++) {
    const trailAlpha = (1 - trail * 0.2) * 0.13;
    ctx.fillStyle = `rgba(30, 27, 75, ${trailAlpha})`;
    ctx.beginPath();
    ctx.ellipse(
      x - trail * size * 0.07,
      y,
      size * 0.23,
      size * 0.38,
      lean,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Speed lines trailing behind
  ctx.strokeStyle = `rgba(167, 139, 250, ${shadowFlicker * 0.35})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let line = 0; line < 6; line++) {
    const lineY = y - size * 0.35 + line * size * 0.14;
    const lineLen = size * 0.3 + Math.sin(time * 12 + line * 2.5) * size * 0.15;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.45, lineY);
    ctx.lineTo(
      x - size * 0.45 - lineLen,
      lineY + Math.sin(time * 10 + line) * size * 0.015
    );
    ctx.stroke();
  }

  // === Speed blur streaks — fading horizontal streaks at varying heights ===
  for (let streak = 0; streak < 4; streak++) {
    const streakY = y - size * 0.2 + streak * size * 0.16;
    const streakPhase = (time * 8 + streak * 1.3) % 1;
    const streakLen = size * (0.35 + streakPhase * 0.3);
    const streakAlpha = (1 - streakPhase) * 0.18;
    const streakGrad = ctx.createLinearGradient(
      x - size * 0.4,
      streakY,
      x - size * 0.4 - streakLen,
      streakY
    );
    streakGrad.addColorStop(0, `rgba(88, 28, 135, ${streakAlpha})`);
    streakGrad.addColorStop(1, "rgba(30, 27, 75, 0)");
    ctx.strokeStyle = streakGrad;
    ctx.lineWidth = (2.5 - streak * 0.4) * zoom;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, streakY);
    ctx.lineTo(
      x - size * 0.4 - streakLen,
      streakY + Math.sin(time * 5 + streak * 1.7) * size * 0.01
    );
    ctx.stroke();
  }

  // Smoke bomb particles at feet
  for (let sb = 0; sb < 6; sb++) {
    const sbPhase = (time * 1.5 + sb * 0.167) % 1;
    const sbx =
      x + Math.cos(time * 3 + sb * Math.PI * 0.33) * size * 0.2 * sbPhase;
    const sby = y + size * 0.4 - sbPhase * size * 0.15;
    const sbAlpha = (1 - sbPhase) * 0.25;
    const sbSize = size * 0.03 + sbPhase * size * 0.04;
    ctx.fillStyle = `rgba(50, 40, 80, ${sbAlpha})`;
    ctx.beginPath();
    ctx.arc(sbx, sby, sbSize, 0, Math.PI * 2);
    ctx.fill();
  }
  // Ground smoke layer
  ctx.fillStyle = `rgba(40, 35, 70, ${0.12 + Math.sin(time * 2) * 0.05})`;
  ctx.beginPath();
  ctx.ellipse(x, y + size * 0.43, size * 0.35, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crouched body with forward blur during attack
  ctx.save();
  ctx.translate(x + blurForward, y);
  ctx.rotate(lean + (isAttacking ? -attackPhase * 0.2 : 0));

  const bodyGrad = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
  bodyGrad.addColorStop(0, "rgba(30, 27, 75, 0.9)");
  bodyGrad.addColorStop(0.5, bodyColor);
  bodyGrad.addColorStop(1, "rgba(30, 27, 75, 0.9)");
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.05, size * 0.22, size * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cloak with wind-blown edges
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.1);
  ctx.quadraticCurveTo(
    -size * 0.35,
    size * 0.1,
    -size * 0.3 - Math.sin(time * 5) * size * 0.06,
    size * 0.35
  );
  ctx.lineTo(-size * 0.15, size * 0.38);
  ctx.lineTo(-size * 0.2, size * 0.05);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.22, -size * 0.1);
  ctx.quadraticCurveTo(
    size * 0.35,
    size * 0.1,
    size * 0.3 + Math.sin(time * 5 + 1) * size * 0.05,
    size * 0.35
  );
  ctx.lineTo(size * 0.15, size * 0.38);
  ctx.lineTo(size * 0.2, size * 0.05);
  ctx.closePath();
  ctx.fill();

  // Cloak wind-torn tails
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 2 * zoom;
  for (let ct = 0; ct < 3; ct++) {
    const ctSide = ct < 2 ? -1 : 1;
    const ctY = size * 0.3 + ct * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(ctSide * size * 0.25, ctY);
    ctx.quadraticCurveTo(
      ctSide * (size * 0.32 + Math.sin(time * 6 + ct) * size * 0.04),
      ctY + size * 0.06,
      ctSide * (size * 0.28 + Math.sin(time * 4 + ct) * size * 0.06),
      ctY + size * 0.12
    );
    ctx.stroke();
  }

  // Belt with venom vial
  ctx.strokeStyle = "rgba(80, 70, 60, 0.7)";
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.ellipse(0, size * 0.12, size * 0.2, size * 0.03, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Belt buckle
  ctx.fillStyle = "rgba(120, 100, 80, 0.8)";
  ctx.fillRect(-size * 0.025, size * 0.1, size * 0.05, size * 0.04);
  // Venom vial on belt
  ctx.save();
  ctx.translate(size * 0.12, size * 0.12);
  ctx.rotate(0.2);
  ctx.fillStyle = "rgba(60, 60, 60, 0.8)";
  ctx.fillRect(-size * 0.015, -size * 0.01, size * 0.03, size * 0.06);
  ctx.fillStyle = `rgba(74, 222, 128, ${0.6 + Math.sin(time * 3) * 0.2})`;
  ctx.fillRect(-size * 0.012, size * 0.005, size * 0.024, size * 0.035);
  // Vial cork
  ctx.fillStyle = "rgba(140, 100, 60, 0.8)";
  ctx.fillRect(-size * 0.012, -size * 0.015, size * 0.024, size * 0.01);
  ctx.restore();
  // Second small vial
  ctx.save();
  ctx.translate(-size * 0.1, size * 0.13);
  ctx.rotate(-0.15);
  ctx.fillStyle = "rgba(60, 60, 60, 0.7)";
  ctx.fillRect(-size * 0.012, -size * 0.008, size * 0.024, size * 0.05);
  ctx.fillStyle = `rgba(139, 92, 246, ${0.5 + Math.sin(time * 2.5 + 1) * 0.2})`;
  ctx.fillRect(-size * 0.009, size * 0.005, size * 0.018, size * 0.028);
  ctx.restore();

  // Hood
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.arc(0, -size * 0.28, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  // Hood point
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.42);
  ctx.lineTo(0, -size * 0.55);
  ctx.lineTo(size * 0.1, -size * 0.42);
  ctx.closePath();
  ctx.fill();
  // Hood structural drape — bezier-curved outer cowl and fold shadows
  ctx.fillStyle = "rgba(22, 20, 52, 0.42)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.34);
  ctx.bezierCurveTo(
    -size * 0.32,
    -size * 0.4,
    -size * 0.18,
    -size * 0.52,
    0,
    -size * 0.56
  );
  ctx.bezierCurveTo(
    size * 0.18,
    -size * 0.52,
    size * 0.32,
    -size * 0.4,
    size * 0.2,
    -size * 0.34
  );
  ctx.bezierCurveTo(
    size * 0.1,
    -size * 0.38,
    -size * 0.1,
    -size * 0.38,
    -size * 0.2,
    -size * 0.34
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(55, 48, 110, 0.55)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.17, -size * 0.32);
  ctx.bezierCurveTo(
    -size * 0.1,
    -size * 0.42,
    -size * 0.03,
    -size * 0.44,
    0,
    -size * 0.43
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.17, -size * 0.32);
  ctx.bezierCurveTo(
    size * 0.1,
    -size * 0.42,
    size * 0.03,
    -size * 0.44,
    0,
    -size * 0.43
  );
  ctx.stroke();
  // Hood edge detail
  ctx.strokeStyle = "rgba(50, 45, 100, 0.5)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(0, -size * 0.28, size * 0.18, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();

  // Dark void face with partial visibility
  ctx.fillStyle = "#0a0a0f";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.28, size * 0.12, size * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lower face cloth mask (structural — covers nose/mouth region)
  ctx.fillStyle = "rgba(32, 28, 52, 0.88)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.11, -size * 0.31);
  ctx.bezierCurveTo(
    -size * 0.1,
    -size * 0.2,
    -size * 0.04,
    -size * 0.19,
    0,
    -size * 0.195
  );
  ctx.bezierCurveTo(
    size * 0.04,
    -size * 0.19,
    size * 0.1,
    -size * 0.2,
    size * 0.11,
    -size * 0.31
  );
  ctx.bezierCurveTo(
    size * 0.06,
    -size * 0.27,
    -size * 0.06,
    -size * 0.27,
    -size * 0.11,
    -size * 0.31
  );
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(20, 18, 40, 0.65)";
  ctx.lineWidth = 0.9 * zoom;
  ctx.stroke();

  // Faint face features under hood
  ctx.strokeStyle = "rgba(100, 80, 120, 0.2)";
  ctx.lineWidth = 0.8 * zoom;
  // Nose bridge hint
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.lineTo(size * 0.01, -size * 0.24);
  ctx.stroke();
  // Jaw line
  ctx.beginPath();
  ctx.arc(0, -size * 0.25, size * 0.08, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // Mouth slit
  ctx.strokeStyle = "rgba(80, 60, 100, 0.25)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.22);
  ctx.lineTo(size * 0.03, -size * 0.22);
  ctx.stroke();

  // Mask edge line across lower face
  ctx.strokeStyle = "rgba(40, 35, 55, 0.6)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.09, -size * 0.25);
  ctx.bezierCurveTo(
    -size * 0.04,
    -size * 0.235,
    size * 0.04,
    -size * 0.235,
    size * 0.09,
    -size * 0.25
  );
  ctx.stroke();

  // Ninja wrapping/bandages on lower face
  ctx.strokeStyle = "rgba(60, 55, 70, 0.5)";
  ctx.lineWidth = 1.5 * zoom;
  for (let bw = 0; bw < 3; bw++) {
    ctx.beginPath();
    ctx.arc(
      0,
      -size * 0.26,
      size * 0.08 + bw * size * 0.01,
      Math.PI * 0.25,
      Math.PI * 0.75
    );
    ctx.stroke();
  }
  // Loose bandage end
  ctx.strokeStyle = "rgba(60, 55, 70, 0.4)";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(size * 0.07, -size * 0.22);
  ctx.quadraticCurveTo(
    size * 0.12,
    -size * 0.2,
    size * 0.1 + Math.sin(time * 5) * size * 0.03,
    -size * 0.16
  );
  ctx.stroke();

  // Glowing eyes (calculating, intense)
  ctx.fillStyle = `rgba(167, 139, 250, ${shadowFlicker + 0.4})`;
  setShadowBlur(ctx, 8 * zoom, eyeGlowHex);
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.05,
    -size * 0.3,
    size * 0.03,
    size * 0.015,
    -0.1,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    size * 0.05,
    -size * 0.3,
    size * 0.03,
    size * 0.015,
    0.1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Eye glow trails
  ctx.fillStyle = `rgba(167, 139, 250, ${shadowFlicker * 0.3})`;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.3);
  ctx.quadraticCurveTo(
    -size * 0.12,
    -size * 0.3,
    -size * 0.15 - Math.sin(time * 6) * size * 0.03,
    -size * 0.29
  );
  ctx.quadraticCurveTo(-size * 0.12, -size * 0.31, -size * 0.08, -size * 0.3);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.3);
  ctx.quadraticCurveTo(
    size * 0.12,
    -size * 0.31,
    size * 0.15 + Math.sin(time * 6 + 0.5) * size * 0.03,
    -size * 0.3
  );
  ctx.quadraticCurveTo(size * 0.12, -size * 0.29, size * 0.08, -size * 0.3);
  ctx.fill();
  clearShadow(ctx);

  // === Predator eye glow — intense radial gradient with trailing wisps ===
  const eyeGlowPulse =
    0.35 + Math.sin(time * 5) * 0.15 + (isAttacking ? 0.15 : 0);
  for (const eyeX of [-0.05, 0.05]) {
    const egx = eyeX * size;
    const egy = -size * 0.3;
    const eyeGlowGrad = ctx.createRadialGradient(
      egx,
      egy,
      0,
      egx,
      egy,
      size * 0.1
    );
    eyeGlowGrad.addColorStop(0, `rgba(139, 92, 246, ${eyeGlowPulse})`);
    eyeGlowGrad.addColorStop(0.4, `rgba(139, 92, 246, ${eyeGlowPulse * 0.35})`);
    eyeGlowGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = eyeGlowGrad;
    ctx.beginPath();
    ctx.arc(egx, egy, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Trailing wisp behind each eye
    const trailLen =
      size * (0.14 + Math.sin(time * 4 + (eyeX > 0 ? 1 : 0)) * 0.04);
    const trailGrad = ctx.createLinearGradient(egx, egy, egx - trailLen, egy);
    trailGrad.addColorStop(0, `rgba(139, 92, 246, ${eyeGlowPulse * 0.5})`);
    trailGrad.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.ellipse(
      egx - trailLen * 0.5,
      egy,
      trailLen * 0.5,
      size * 0.015,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();

  // Arms with bandages and poison daggers
  for (let arm = -1; arm <= 1; arm += 2) {
    ctx.save();
    ctx.translate(x + arm * size * 0.18 + blurForward, y - size * 0.05);
    const armRot =
      arm * (0.5 - dashPhase) + (isAttacking ? arm * attackPhase * 0.8 : 0);
    ctx.rotate(armRot);

    // Arm
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-size * 0.04, 0, size * 0.08, size * 0.25);

    // Ninja bandage wraps on arm (spiral strokes)
    ctx.strokeStyle = "rgba(70, 65, 80, 0.5)";
    ctx.lineWidth = 1.2 * zoom;
    for (let bnd = 0; bnd < 6; bnd++) {
      const bndy = size * 0.03 + bnd * size * 0.038;
      ctx.beginPath();
      ctx.moveTo(-size * 0.04, bndy);
      ctx.bezierCurveTo(
        -size * 0.02,
        bndy - size * 0.008,
        size * 0.02,
        bndy + size * 0.008,
        size * 0.04,
        bndy + size * 0.015
      );
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(55, 50, 70, 0.65)";
    ctx.lineWidth = 1 * zoom;
    for (let cr = 0; cr < 4; cr++) {
      const crY = size * 0.04 + cr * size * 0.052;
      ctx.beginPath();
      ctx.moveTo(-size * 0.038, crY);
      ctx.lineTo(size * 0.038, crY + size * 0.065);
      ctx.stroke();
    }

    // Poison dagger blade
    const daggerGrad = ctx.createLinearGradient(0, size * 0.25, 0, size * 0.45);
    daggerGrad.addColorStop(0, bladeLight);
    daggerGrad.addColorStop(0.5, bladeMid);
    daggerGrad.addColorStop(1, bladeDark);
    ctx.fillStyle = daggerGrad;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, size * 0.25);
    ctx.lineTo(0, size * 0.45);
    ctx.lineTo(size * 0.02, size * 0.25);
    ctx.closePath();
    ctx.fill();
    // Curved blade silhouette — hooked edge and sharp point
    ctx.fillStyle = bladeSilhouette;
    ctx.beginPath();
    ctx.moveTo(-size * 0.022, size * 0.252);
    ctx.quadraticCurveTo(-size * 0.045, size * 0.34, -size * 0.012, size * 0.4);
    ctx.lineTo(0, size * 0.468);
    ctx.quadraticCurveTo(size * 0.018, size * 0.38, size * 0.022, size * 0.252);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(210, 210, 220, 0.5)";
    ctx.lineWidth = 0.85 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.02, size * 0.255);
    ctx.quadraticCurveTo(-size * 0.038, size * 0.35, 0, size * 0.455);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.02, size * 0.255);
    ctx.quadraticCurveTo(size * 0.038, size * 0.35, 0, size * 0.455);
    ctx.stroke();
    // Blade edge highlight
    ctx.strokeStyle = "rgba(200, 200, 210, 0.3)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(size * 0.005, size * 0.26);
    ctx.lineTo(0, size * 0.43);
    ctx.stroke();
    // Serrated back-edge on blade
    ctx.strokeStyle = "rgba(100, 100, 110, 0.4)";
    ctx.lineWidth = 0.6 * zoom;
    for (let se = 0; se < 3; se++) {
      const sey = size * 0.28 + se * size * 0.05;
      ctx.beginPath();
      ctx.moveTo(-size * 0.015, sey);
      ctx.lineTo(-size * 0.022, sey + size * 0.015);
      ctx.lineTo(-size * 0.013, sey + size * 0.03);
      ctx.stroke();
    }

    // Dagger crossguard
    ctx.fillStyle = `rgba(167, 139, 250, ${shadowFlicker})`;
    ctx.fillRect(-size * 0.03, size * 0.22, size * 0.06, size * 0.035);
    ctx.fillStyle = "rgba(120, 100, 140, 0.85)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.045, size * 0.228);
    ctx.lineTo(-size * 0.032, size * 0.238);
    ctx.lineTo(-size * 0.038, size * 0.248);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.045, size * 0.228);
    ctx.lineTo(size * 0.032, size * 0.238);
    ctx.lineTo(size * 0.038, size * 0.248);
    ctx.closePath();
    ctx.fill();
    // Dagger handle wrap
    ctx.strokeStyle = "rgba(80, 60, 50, 0.6)";
    ctx.lineWidth = 1 * zoom;
    for (let hw = 0; hw < 3; hw++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.015, size * 0.18 + hw * size * 0.015);
      ctx.lineTo(size * 0.015, size * 0.19 + hw * size * 0.015);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(55, 42, 35, 0.75)";
    for (let hw = 0; hw < 4; hw++) {
      const hy = size * 0.155 + hw * size * 0.014;
      ctx.beginPath();
      ctx.moveTo(-size * 0.012, hy);
      ctx.bezierCurveTo(
        -size * 0.006,
        hy + size * 0.006,
        size * 0.006,
        hy + size * 0.006,
        size * 0.012,
        hy
      );
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(45, 38, 32, 0.9)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.014, size * 0.12);
    ctx.lineTo(size * 0.014, size * 0.12);
    ctx.lineTo(size * 0.01, size * 0.135);
    ctx.lineTo(-size * 0.01, size * 0.135);
    ctx.closePath();
    ctx.fill();

    // Dripping venom from blade
    setShadowBlur(ctx, 3 * zoom, "rgba(74, 222, 128, 0.4)");
    for (let vd = 0; vd < 2; vd++) {
      const vdProgress = (time * 2 + vd * 0.5) % 1;
      const vdy = size * 0.3 + vdProgress * size * 0.15;
      const vdAlpha = (1 - vdProgress) * 0.7;
      ctx.fillStyle = `rgba(74, 222, 128, ${vdAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        size * 0.005 * (vd === 0 ? -1 : 1),
        vdy,
        size * 0.008,
        size * 0.015,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Venom glow on blade
    ctx.fillStyle = `rgba(74, 222, 128, ${0.1 + Math.sin(time * 4 + arm) * 0.05})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.015, size * 0.28);
    ctx.lineTo(0, size * 0.42);
    ctx.lineTo(size * 0.015, size * 0.28);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);

    // === Blade glint — traveling sparkle along the edge ===
    const glintPos = (time * 3 + arm * 0.5) % 1;
    const glintY = size * 0.26 + glintPos * size * 0.16;
    const glintAlpha = Math.sin(glintPos * Math.PI) * 0.85;
    const glintR = size * 0.025;
    const bladeGlint = ctx.createRadialGradient(
      size * 0.008,
      glintY,
      0,
      size * 0.008,
      glintY,
      glintR
    );
    bladeGlint.addColorStop(0, `rgba(255, 255, 255, ${glintAlpha})`);
    bladeGlint.addColorStop(0.35, `rgba(200, 180, 255, ${glintAlpha * 0.4})`);
    bladeGlint.addColorStop(1, "rgba(167, 139, 250, 0)");
    ctx.fillStyle = bladeGlint;
    ctx.beginPath();
    ctx.arc(size * 0.008, glintY, glintR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Calculator/test paper being slashed
  if (isAttacking) {
    const slashPhase = attackPhase;
    ctx.save();
    ctx.translate(x + size * 0.3 + blurForward, y);
    ctx.rotate(slashPhase * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${(1 - slashPhase) * 0.8})`;
    ctx.fillRect(-size * 0.05, -size * 0.06, size * 0.1, size * 0.12);
    // X slash marks
    ctx.strokeStyle = `rgba(239, 68, 68, ${1 - slashPhase})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.moveTo(-size * 0.08, -size * 0.08);
    ctx.lineTo(size * 0.08, size * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.08, -size * 0.08);
    ctx.lineTo(-size * 0.08, size * 0.08);
    ctx.stroke();
    // Venom spray from X slash
    for (let vs = 0; vs < 8; vs++) {
      const vsAngle = vs * Math.PI * 0.25 + slashPhase * 2;
      const vsDist = slashPhase * size * 0.4;
      const vsAlpha = (1 - slashPhase) * 0.5;
      ctx.fillStyle = `rgba(74, 222, 128, ${vsAlpha})`;
      ctx.beginPath();
      ctx.arc(
        Math.cos(vsAngle) * vsDist,
        Math.sin(vsAngle) * vsDist,
        size * 0.015,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.restore();

    // Blur forward effect during attack
    ctx.fillStyle = `rgba(30, 27, 75, ${(1 - slashPhase) * 0.15})`;
    ctx.beginPath();
    ctx.ellipse(
      x + blurForward * 0.5,
      y,
      size * 0.3,
      size * 0.15,
      lean,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // X slash trail in the air
    setShadowBlur(ctx, 6 * zoom, "rgba(167, 139, 250, 0.4)");
    ctx.strokeStyle = `rgba(167, 139, 250, ${(1 - slashPhase) * 0.6})`;
    ctx.lineWidth = 2.5 * zoom;
    const slashCx = x + size * 0.3 + blurForward;
    const slashCy = y;
    const slashSize = size * 0.2 * (1 - slashPhase * 0.3);
    ctx.beginPath();
    ctx.moveTo(slashCx - slashSize, slashCy - slashSize);
    ctx.lineTo(slashCx + slashSize, slashCy + slashSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(slashCx + slashSize, slashCy - slashSize);
    ctx.lineTo(slashCx - slashSize, slashCy + slashSize);
    ctx.stroke();
    clearShadow(ctx);
  }

  // Smoke/shadow particles (enhanced)
  for (let p = 0; p < 6; p++) {
    const particlePhase = (time * 2 + p * 0.167) % 1;
    const px = x - size * 0.25 - particlePhase * size * 0.35;
    const py = y + size * 0.05 + Math.sin(time * 3 + p) * size * 0.12;
    const particleAlpha = (1 - particlePhase) * 0.3;
    const particleSize = size * 0.025 + particlePhase * size * 0.02;
    ctx.fillStyle = `rgba(30, 27, 75, ${particleAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  // === Drifting dark smoke wisps — dissipating behind ===
  for (let wisp = 0; wisp < 5; wisp++) {
    const wispPhase = (time * 1.5 + wisp * 0.35) % 1;
    const wispX =
      x -
      size * 0.2 -
      wispPhase * size * 0.45 +
      Math.cos(time * 2 + wisp * 1.5) * size * 0.08;
    const wispY =
      y +
      Math.sin(time * 2.5 + wisp * 2) * size * 0.12 -
      wispPhase * size * 0.1;
    const wispAlpha = (1 - wispPhase) * 0.22;
    const wispR = Math.max(0.1, size * (0.02 + wispPhase * 0.03));
    const wispGrad = ctx.createRadialGradient(
      wispX,
      wispY,
      0,
      wispX,
      wispY,
      wispR
    );
    wispGrad.addColorStop(0, `rgba(50, 20, 80, ${wispAlpha})`);
    wispGrad.addColorStop(0.5, `rgba(30, 15, 60, ${wispAlpha * 0.4})`);
    wispGrad.addColorStop(1, "rgba(20, 10, 40, 0)");
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.arc(wispX, wispY, wispR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle shadow wisps
  drawShadowWisps(ctx, x, y, size * 0.28, time, zoom, {
    color: "rgba(88, 28, 135, 0.3)",
    count: 3,
    maxAlpha: 0.22,
    speed: 1.8,
    wispLength: 0.35,
  });

  // Floating shadow blade shards
  drawShiftingSegments(ctx, x, y, size, time, zoom, {
    bobAmt: 0.03,
    bobSpeed: 4,
    color: "rgba(30, 27, 75, 0.7)",
    colorAlt: "rgba(167, 139, 250, 0.4)",
    count: 4,
    orbitRadius: 0.35,
    orbitSpeed: 2,
    rotateWithOrbit: true,
    segmentSize: 0.025,
    shape: "shard",
  });

  // Poison mist at ground level
  for (let pm = 0; pm < 4; pm++) {
    const pmPhase = (time * 0.8 + pm * 0.25) % 1;
    const pmx =
      x - size * 0.15 + pm * size * 0.1 + Math.sin(time + pm) * size * 0.05;
    const pmy = y + size * 0.38;
    ctx.fillStyle = `rgba(74, 222, 128, ${Math.sin(pmPhase * Math.PI) * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(
      pmx,
      pmy,
      size * 0.05,
      size * 0.05 * ISO_Y_RATIO,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  drawRegionBodyAccent(ctx, x, y, size, region, time, zoom);
}

export function drawDragonEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  bodyColor: string,
  bodyColorDark: string,
  bodyColorLight: string,
  time: number,
  zoom: number,
  attackPhase: number = 0
) {
  // ANCIENT ALUMNUS - Legendary dragon with Princeton colors, massive and majestic
  const isAttacking = attackPhase > 0;
  const sin2 = Math.sin(time * 2);
  const sin25 = Math.sin(time * 2.5);
  const sin3 = Math.sin(time * 3);
  const sin4 = Math.sin(time * 4);
  const sin10 = Math.sin(time * 10);
  const wingFlap = sin3 * 0.3;
  const breathPulse = 0.5 + sin4 * 0.3 + (isAttacking ? attackPhase * 0.5 : 0);
  const hover = sin2 * size * 0.05;
  const headBob = sin25 * size * 0.02;
  const tailWaveA = Math.sin(time * 1.9) * size * 0.09;
  const tailWaveB = Math.sin(time * 2.7) * size * 0.13;
  const chestGlow = 0.55 + Math.sin(time * 3.4) * 0.35;
  const jawOpen =
    (isAttacking
      ? attackPhase * 0.032
      : 0.012 + Math.max(0, breathPulse - 0.55) * 0.02) * size;
  const shoulderLift = Math.sin(time * 3.2) * size * 0.01;

  // Epic aura/glow
  const auraGrad = ctx.createRadialGradient(
    x,
    y + hover,
    0,
    x,
    y + hover,
    size * 1.2
  );
  auraGrad.addColorStop(0, `rgba(159, 18, 57, ${breathPulse * 0.2})`);
  auraGrad.addColorStop(0.5, `rgba(255, 100, 50, ${breathPulse * 0.1})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(x, y + hover, size * 1.2, 0, Math.PI * 2);
  ctx.fill();

  const drawWing = (side: -1 | 1): void => {
    const wingRotation = side === -1 ? -0.5 + wingFlap : 0.5 - wingFlap;
    ctx.save();
    ctx.translate(x + side * size * 0.3, y - size * 0.12 + hover);
    ctx.rotate(wingRotation);

    const wingGrad = ctx.createLinearGradient(
      0,
      0,
      side * size * 0.85,
      -size * 0.45
    );
    wingGrad.addColorStop(0, bodyColor);
    wingGrad.addColorStop(0.45, bodyColorLight);
    wingGrad.addColorStop(1, bodyColorDark);
    ctx.fillStyle = wingGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      side * size * 0.22,
      -size * 0.44,
      side * size * 0.65,
      -size * 0.56
    );
    ctx.quadraticCurveTo(
      side * size * 0.56,
      -size * 0.38,
      side * size * 0.86,
      -size * 0.3
    );
    ctx.quadraticCurveTo(
      side * size * 0.6,
      -size * 0.14,
      side * size * 0.36,
      0
    );
    ctx.quadraticCurveTo(
      side * size * 0.38,
      size * 0.03,
      side * size * 0.72,
      size * 0.16
    );
    ctx.quadraticCurveTo(side * size * 0.32, size * 0.1, 0, size * 0.1);
    ctx.closePath();
    ctx.fill();

    // Primary wing arm / leading strut (bone from shoulder into wing)
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 3.2 * zoom;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      side * size * 0.22,
      -size * 0.44,
      side * size * 0.65,
      -size * 0.56
    );
    ctx.stroke();
    ctx.lineWidth = 1 * zoom;

    // Membrane shading
    ctx.fillStyle = `rgba(0, 0, 0, 0.12)`;
    ctx.beginPath();
    ctx.moveTo(side * size * 0.12, -size * 0.12);
    ctx.lineTo(side * size * 0.78, -size * 0.24);
    ctx.lineTo(side * size * 0.65, -size * 0.02);
    ctx.lineTo(side * size * 0.25, size * 0.02);
    ctx.closePath();
    ctx.fill();

    // Wing finger bones
    ctx.strokeStyle = bodyColorDark;
    ctx.lineWidth = 2 * zoom;
    const fingerTips = [
      { cpx: 0.22, cpy: -0.44, ex: 0.65, ey: -0.56 },
      { cpx: 0.4, cpy: -0.32, ex: 0.86, ey: -0.3 },
      { cpx: 0.3, cpy: -0.16, ex: 0.36, ey: 0 },
      { cpx: 0.38, cpy: 0.02, ex: 0.72, ey: 0.16 },
    ];
    for (let finger = 0; finger < fingerTips.length; finger++) {
      const tip = fingerTips[finger];
      ctx.beginPath();
      ctx.moveTo(0, size * 0.01 * finger);
      ctx.quadraticCurveTo(
        side * size * tip.cpx,
        size * tip.cpy,
        side * size * tip.ex,
        size * tip.ey
      );
      ctx.stroke();
    }

    // Strut joints at mid-bone bends
    ctx.fillStyle = bodyColorDark;
    for (const tip of fingerTips) {
      ctx.beginPath();
      ctx.arc(
        side * size * tip.cpx * 0.52,
        size * tip.cpy * 0.52,
        size * 0.017,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Thin membrane stretched between finger struts
    const tipPts = fingerTips.map((t) => ({
      px: side * size * t.ex,
      py: size * t.ey,
    }));
    const membraneAnchorX = side * size * 0.05;
    const membraneAnchorY = -size * 0.02;
    ctx.fillStyle = "rgba(22, 10, 10, 0.1)";
    for (let ip = 0; ip < tipPts.length - 1; ip++) {
      ctx.beginPath();
      ctx.moveTo(membraneAnchorX, membraneAnchorY);
      ctx.lineTo(tipPts[ip].px, tipPts[ip].py);
      ctx.lineTo(tipPts[ip + 1].px, tipPts[ip + 1].py);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(12, 6, 6, 0.38)";
    ctx.lineWidth = 0.65 * zoom;
    ctx.beginPath();
    ctx.moveTo(tipPts[0].px, tipPts[0].py);
    for (let ip = 1; ip < tipPts.length; ip++) {
      ctx.lineTo(tipPts[ip].px, tipPts[ip].py);
    }
    ctx.stroke();

    // Wing claw tips at each finger endpoint
    ctx.fillStyle = "#1f1f1f";
    const clawDefs = [
      { dx: 0.03, dy: -0.07, x: 0.65, y: -0.56 },
      { dx: 0.04, dy: -0.06, x: 0.86, y: -0.3 },
      { dx: 0.04, dy: 0.05, x: 0.72, y: 0.16 },
    ];
    for (const cd of clawDefs) {
      const clawX = side * size * cd.x;
      const clawY = size * cd.y;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + side * size * cd.dx, clawY + size * cd.dy);
      ctx.lineTo(clawX - side * size * 0.018, clawY - size * 0.01);
      ctx.closePath();
      ctx.fill();
    }

    // Membrane vein lines from wing bone to membrane edge
    ctx.strokeStyle = `rgba(60, 30, 30, 0.3)`;
    ctx.lineWidth = 0.8 * zoom;
    for (let finger = 0; finger < fingerTips.length - 1; finger++) {
      const tipA = fingerTips[finger];
      const tipB = fingerTips[finger + 1];
      for (let vein = 0; vein < 2; vein++) {
        const vfrac = 0.35 + vein * 0.3;
        const vStartX = side * size * tipA.cpx * vfrac;
        const vStartY = size * tipA.cpy * vfrac;
        const vEndX =
          side * size * (tipA.ex + tipB.ex) * 0.5 * (0.5 + vein * 0.2);
        const vEndY = size * (tipA.ey + tipB.ey) * 0.5 * (0.5 + vein * 0.2);
        ctx.beginPath();
        ctx.moveTo(vStartX, vStartY);
        ctx.bezierCurveTo(
          (vStartX + vEndX) * 0.5 + side * size * 0.04,
          (vStartY + vEndY) * 0.5 - size * 0.03,
          (vStartX + vEndX) * 0.6,
          (vStartY + vEndY) * 0.6,
          vEndX,
          vEndY
        );
        ctx.stroke();
      }
    }

    // Minor membrane tears
    ctx.strokeStyle = `rgba(40, 20, 20, 0.45)`;
    ctx.lineWidth = 1.2 * zoom;
    for (let tear = 0; tear < 3; tear++) {
      const tearBaseX = side * size * (0.4 + tear * 0.12);
      const tearBaseY = -size * (0.08 + tear * 0.07);
      ctx.beginPath();
      ctx.moveTo(tearBaseX, tearBaseY);
      ctx.lineTo(tearBaseX + side * size * 0.05, tearBaseY + size * 0.06);
      ctx.stroke();
    }
    ctx.restore();
  };

  // Powerful stomping animated legs (behind body)
  drawPathLegs(ctx, x, y + size * 0.4 + hover, size, time, zoom, {
    color: bodyColor,
    colorDark: bodyColorDark,
    footColor: "#1c1917",
    legLen: 0.22,
    phaseOffset: shoulderLift,
    strideAmt: 0.2,
    strideSpeed: 2.5,
    style: "armored",
    width: 0.07,
  });

  // Dragon arms — menacing forward claw reach
  for (const side of [-1, 1] as const) {
    drawPathArm(
      ctx,
      x + side * size * 0.35,
      y + size * 0.05 + hover,
      size,
      time,
      zoom,
      side,
      {
        color: bodyColor,
        colorDark: bodyColorDark,
        elbowAngle: 0.3 + Math.sin(time * 2.5 + side * 1.5) * 0.12,
        foreLen: 0.2,
        handColor: "#1c1917",
        handRadius: 0.035,
        shoulderAngle:
          side *
          (0.7 +
            Math.sin(time * 2 + side * 0.5) * 0.1 +
            (isAttacking ? attackPhase * 0.4 : 0)),
        style: "armored",
        upperLen: 0.22,
        width: 0.065,
      }
    );
  }

  // WINGS (behind body)
  drawWing(-1);
  drawWing(1);

  // Tail
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.15, y + size * 0.3 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.5 + tailWaveA,
    y + size * 0.5 + hover,
    x - size * 0.72 + tailWaveB,
    y + size * 0.35 + hover
  );
  ctx.quadraticCurveTo(
    x - size * 0.46 + tailWaveA * 0.7,
    y + size * 0.4 + hover,
    x - size * 0.1,
    y + size * 0.25 + hover
  );
  ctx.fill();
  // Tail spikes (triangular protrusions along tail)
  ctx.fillStyle = bodyColorDark;
  for (let ts = 0; ts < 8; ts++) {
    const tailFrac = ts / 7;
    const tailX =
      x -
      size * 0.14 -
      ts * size * 0.08 +
      Math.sin(time * 2 + ts * 0.5) * size * 0.02;
    const tailY = y + size * 0.36 + ts * size * 0.025 + hover;
    const spikeLen = size * (0.08 - tailFrac * 0.025);
    ctx.beginPath();
    ctx.moveTo(tailX - size * 0.01, tailY);
    ctx.lineTo(tailX, tailY - spikeLen);
    ctx.lineTo(tailX + size * 0.01, tailY);
    ctx.closePath();
    ctx.fill();
    // Spike ridgeline
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(tailX, tailY - spikeLen);
    ctx.stroke();
  }
  // Secondary tail spikes (smaller, staggered along the tail)
  ctx.fillStyle = bodyColorDark;
  for (let tsb = 0; tsb < 7; tsb++) {
    const tailFracB = (tsb + 0.5) / 7;
    const tailXb =
      x -
      size * 0.12 -
      tsb * size * 0.078 +
      Math.sin(time * 2.1 + tsb * 0.6) * size * 0.018;
    const tailYb = y + size * 0.345 + tsb * size * 0.026 + hover;
    const spikeLenB = size * (0.045 - tailFracB * 0.018);
    ctx.beginPath();
    ctx.moveTo(tailXb - size * 0.008, tailYb);
    ctx.lineTo(tailXb + size * 0.022, tailYb - spikeLenB);
    ctx.lineTo(tailXb + size * 0.008, tailYb);
    ctx.closePath();
    ctx.fill();
  }
  // Tail blade fin
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.77 + tailWaveB * 0.2, y + size * 0.32 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.86,
    y + size * 0.25 + hover,
    x - size * 0.8,
    y + size * 0.42 + hover
  );
  ctx.quadraticCurveTo(
    x - size * 0.72,
    y + size * 0.34 + hover,
    x - size * 0.77 + tailWaveB * 0.2,
    y + size * 0.32 + hover
  );
  ctx.fill();

  // Back legs (behind body)
  ctx.fillStyle = bodyColorDark;
  for (const side of [-1, 1]) {
    const legPhase = side === -1 ? 1 : -1;
    const lift = shoulderLift * legPhase;
    ctx.beginPath();
    ctx.moveTo(x + side * size * 0.22, y + size * 0.22 + hover + lift);
    ctx.quadraticCurveTo(
      x + side * size * 0.33,
      y + size * 0.42 + hover + lift,
      x + side * size * 0.28,
      y + size * 0.56 + hover + lift
    );
    ctx.lineTo(x + side * size * 0.18, y + size * 0.52 + hover + lift);
    ctx.quadraticCurveTo(
      x + side * size * 0.16,
      y + size * 0.36 + hover + lift,
      x + side * size * 0.16,
      y + size * 0.24 + hover + lift
    );
    ctx.fill();
  }

  // Main body
  const bodyGradient = ctx.createLinearGradient(
    x - size * 0.4,
    y,
    x + size * 0.4,
    y
  );
  bodyGradient.addColorStop(0, bodyColorDark);
  bodyGradient.addColorStop(0.3, bodyColor);
  bodyGradient.addColorStop(0.7, bodyColorLight);
  bodyGradient.addColorStop(1, bodyColorDark);
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.1 + hover,
    size * 0.4,
    size * 0.35,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Body shoulder shadows for depth
  ctx.fillStyle = `rgba(0, 0, 0, 0.18)`;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.22,
    y + size * 0.03 + hover,
    size * 0.12,
    size * 0.16,
    -0.3,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.22,
    y + size * 0.03 + hover,
    size * 0.12,
    size * 0.16,
    0.3,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Overlapping scale pattern rows on main body
  ctx.strokeStyle = `rgba(0, 0, 0, 0.15)`;
  ctx.lineWidth = 0.7 * zoom;
  for (let sr = 0; sr < 4; sr++) {
    const scaleY = y - size * 0.08 + sr * size * 0.09 + hover;
    const scaleW = size * (0.35 - sr * 0.02);
    for (let sc = 0; sc < 5; sc++) {
      const scaleX = x - scaleW * 0.6 + sc * scaleW * 0.3;
      ctx.beginPath();
      ctx.arc(scaleX, scaleY, size * 0.035, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  }
  // Second layer: overlapping filled scale caps (nested U-arcs)
  ctx.fillStyle = `rgba(0, 0, 0, 0.06)`;
  ctx.strokeStyle = `rgba(0, 0, 0, 0.14)`;
  ctx.lineWidth = 0.45 * zoom;
  for (let sr2 = 0; sr2 < 5; sr2++) {
    const scaleY2 = y - size * 0.03 + sr2 * size * 0.068 + hover;
    for (let sc2 = 0; sc2 < 7; sc2++) {
      const scaleX2 = x - size * 0.3 + sc2 * size * 0.095;
      const rCap = size * 0.024;
      ctx.beginPath();
      ctx.arc(scaleX2, scaleY2, rCap, Math.PI * 1.08, Math.PI * 1.92);
      ctx.lineTo(scaleX2 - rCap * 0.35, scaleY2 + size * 0.006);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // Belly scales
  ctx.fillStyle = bodyColorLight;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.15 + hover,
    size * 0.25,
    size * 0.28,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Scale pattern
  ctx.strokeStyle = bodyColor;
  ctx.lineWidth = 1 * zoom;
  for (let scale = 0; scale < 6; scale++) {
    ctx.beginPath();
    ctx.arc(
      x,
      y - size * 0.12 + scale * size * 0.092 + hover,
      size * (0.21 - scale * 0.012),
      0.3 * Math.PI,
      0.7 * Math.PI
    );
    ctx.stroke();
  }
  // Chest armor plates
  ctx.fillStyle = `rgba(255, 175, 80, ${chestGlow * 0.25})`;
  for (let plate = 0; plate < 3; plate++) {
    const plateY = y + size * (0.04 + plate * 0.09) + hover;
    ctx.beginPath();
    ctx.ellipse(
      x,
      plateY,
      size * (0.18 - plate * 0.03),
      size * 0.03,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Dorsal ridge spikes
  ctx.fillStyle = bodyColorDark;
  for (let ridge = 0; ridge < 8; ridge++) {
    const ridgeX = x - size * 0.25 + ridge * size * 0.08;
    const ridgeY =
      y -
      size * 0.17 +
      hover -
      Math.sin(time * 2.2 + ridge * 0.7) * size * 0.014;
    ctx.beginPath();
    ctx.moveTo(ridgeX, ridgeY);
    ctx.lineTo(ridgeX + size * 0.025, ridgeY - size * (0.09 + ridge * 0.004));
    ctx.lineTo(ridgeX + size * 0.045, ridgeY);
    ctx.closePath();
    ctx.fill();
  }

  // Legs
  ctx.fillStyle = bodyColor;
  // Front left
  ctx.beginPath();
  ctx.moveTo(x - size * 0.31, y + size * 0.18 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.42,
    y + size * 0.43 + hover + shoulderLift,
    x - size * 0.36,
    y + size * 0.56 + hover
  );
  ctx.lineTo(x - size * 0.24, y + size * 0.51 + hover);
  ctx.quadraticCurveTo(
    x - size * 0.24,
    y + size * 0.35 + hover,
    x - size * 0.2,
    y + size * 0.2 + hover
  );
  ctx.fill();
  // Front right
  ctx.beginPath();
  ctx.moveTo(x + size * 0.31, y + size * 0.18 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.42,
    y + size * 0.43 + hover - shoulderLift,
    x + size * 0.36,
    y + size * 0.56 + hover
  );
  ctx.lineTo(x + size * 0.24, y + size * 0.51 + hover);
  ctx.quadraticCurveTo(
    x + size * 0.24,
    y + size * 0.35 + hover,
    x + size * 0.2,
    y + size * 0.2 + hover
  );
  ctx.fill();
  // Knee armor
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.ellipse(
    x - size * 0.33,
    y + size * 0.44 + hover,
    size * 0.06,
    size * 0.07,
    -0.25,
    0,
    Math.PI * 2
  );
  ctx.ellipse(
    x + size * 0.33,
    y + size * 0.44 + hover,
    size * 0.06,
    size * 0.07,
    0.25,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Claws
  ctx.fillStyle = "#1c1917";
  for (const side of [-1, 1]) {
    for (let claw = 0; claw < 3; claw++) {
      const clawX = x + side * (size * 0.36 - claw * size * 0.035);
      const clawY = y + size * (0.56 + claw * 0.01) + hover;
      ctx.beginPath();
      ctx.moveTo(clawX, clawY);
      ctx.lineTo(clawX + side * size * 0.012, clawY + size * 0.05);
      ctx.lineTo(clawX - side * size * 0.016, clawY + size * 0.012);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Neck
  const neckGrad = ctx.createLinearGradient(
    x - size * 0.08,
    y - size * 0.25 + hover,
    x + size * 0.18,
    y - size * 0.46 + hover
  );
  neckGrad.addColorStop(0, bodyColorDark);
  neckGrad.addColorStop(0.55, bodyColor);
  neckGrad.addColorStop(1, bodyColorLight);
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.1, y - size * 0.2 + hover);
  ctx.quadraticCurveTo(
    x,
    y - size * 0.4 + hover + headBob,
    x + size * 0.05,
    y - size * 0.52 + hover + headBob
  );
  ctx.lineTo(x + size * 0.15, y - size * 0.45 + hover + headBob);
  ctx.quadraticCurveTo(
    x + size * 0.1,
    y - size * 0.3 + hover + headBob,
    x + size * 0.1,
    y - size * 0.14 + hover
  );
  ctx.closePath();
  ctx.fill();
  // Neck scale ridges
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.2 * zoom;
  for (let ridge = 0; ridge < 5; ridge++) {
    const ridgeY =
      y - size * 0.24 + ridge * size * 0.06 + hover + headBob * 0.4;
    ctx.beginPath();
    ctx.arc(
      x + size * 0.02,
      ridgeY,
      size * (0.13 - ridge * 0.012),
      0.2 * Math.PI,
      0.78 * Math.PI
    );
    ctx.stroke();
  }

  // Head
  const headGrad = ctx.createRadialGradient(
    x + size * 0.08,
    y - size * 0.56 + hover + headBob,
    0,
    x + size * 0.08,
    y - size * 0.56 + hover + headBob,
    size * 0.23
  );
  headGrad.addColorStop(0, bodyColorLight);
  headGrad.addColorStop(0.45, bodyColor);
  headGrad.addColorStop(1, bodyColorDark);
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.1,
    y - size * 0.55 + hover + headBob,
    size * 0.19,
    size * 0.13,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Skull crest — continuous ridge of spiky points along crown (behind snout horns)
  ctx.fillStyle = bodyColorDark;
  for (let cr = 0; cr < 10; cr++) {
    const t = cr / 9;
    const crestX = x - size * 0.04 + t * size * 0.22;
    const crestBaseY =
      y - size * 0.64 + Math.sin(t * Math.PI) * size * 0.05 + hover + headBob;
    const spikeH = size * (0.035 + (cr % 2) * 0.012);
    ctx.beginPath();
    ctx.moveTo(crestX - size * 0.012, crestBaseY + size * 0.018);
    ctx.lineTo(crestX, crestBaseY - spikeH);
    ctx.lineTo(crestX + size * 0.012, crestBaseY + size * 0.018);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
  ctx.lineWidth = 0.55 * zoom;
  ctx.beginPath();
  for (let cr = 0; cr < 10; cr++) {
    const t = cr / 9;
    const crestX = x - size * 0.04 + t * size * 0.22;
    const crestBaseY =
      y - size * 0.64 + Math.sin(t * Math.PI) * size * 0.05 + hover + headBob;
    if (cr === 0) {
      ctx.moveTo(crestX, crestBaseY - size * 0.02);
    } else {
      ctx.lineTo(crestX, crestBaseY - size * 0.02);
    }
  }
  ctx.stroke();
  // Lower jaw
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(
    x + size * 0.16,
    y - size * 0.49 + hover + headBob + jawOpen * 0.25
  );
  ctx.quadraticCurveTo(
    x + size * 0.3,
    y - size * 0.44 + hover + headBob + jawOpen,
    x + size * 0.34,
    y - size * 0.42 + hover + headBob + jawOpen * 0.9
  );
  ctx.quadraticCurveTo(
    x + size * 0.26,
    y - size * 0.38 + hover + headBob + jawOpen * 0.7,
    x + size * 0.15,
    y - size * 0.43 + hover + headBob + jawOpen * 0.4
  );
  ctx.closePath();
  ctx.fill();
  // Snout
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.58 + hover + headBob);
  ctx.quadraticCurveTo(
    x + size * 0.42,
    y - size * 0.56 + hover + headBob,
    x + size * 0.45,
    y - size * 0.5 + hover + headBob
  );
  ctx.quadraticCurveTo(
    x + size * 0.36,
    y - size * 0.46 + hover + headBob,
    x + size * 0.2,
    y - size * 0.52 + hover + headBob
  );
  ctx.closePath();
  ctx.fill();
  // Snout ridge
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.2, y - size * 0.56 + hover + headBob);
  ctx.lineTo(x + size * 0.4, y - size * 0.52 + hover + headBob);
  ctx.stroke();

  // Nostrils with smoke
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.arc(
    x + size * 0.38,
    y - size * 0.52 + hover + headBob,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.arc(
    x + size * 0.35,
    y - size * 0.54 + hover + headBob,
    size * 0.015,
    0,
    Math.PI * 2
  );
  ctx.fill();
  // Smoke wisps
  if (breathPulse > 0.6) {
    ctx.strokeStyle = `rgba(200, 200, 200, ${(breathPulse - 0.6) * 0.5})`;
    ctx.lineWidth = 1.8 * zoom;
    for (let smoke = 0; smoke < 3; smoke++) {
      const smokePhase = (time * 2 + smoke * 0.33) % 1;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.38, y - size * 0.52 + hover + headBob);
      ctx.quadraticCurveTo(
        x + size * 0.46 + smokePhase * size * 0.1,
        y - size * 0.56 - smokePhase * size * 0.12 + hover + headBob,
        x + size * 0.52 + smokePhase * size * 0.16,
        y - size * 0.62 - smokePhase * size * 0.18 + hover + headBob
      );
      ctx.stroke();
    }
  }

  // Horns (majestic curved horns)
  ctx.fillStyle = "#44403c";
  // Left horn
  ctx.beginPath();
  ctx.moveTo(x - size * 0.03, y - size * 0.62 + hover + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.14,
    y - size * 0.81 + hover + headBob,
    x - size * 0.24,
    y - size * 0.86 + hover + headBob
  );
  ctx.quadraticCurveTo(
    x - size * 0.1,
    y - size * 0.74 + hover + headBob,
    x + size * 0.01,
    y - size * 0.6 + hover + headBob
  );
  ctx.fill();
  // Right horn
  ctx.beginPath();
  ctx.moveTo(x + size * 0.13, y - size * 0.62 + hover + headBob);
  ctx.quadraticCurveTo(
    x + size * 0.28,
    y - size * 0.76 + hover + headBob,
    x + size * 0.38,
    y - size * 0.8 + hover + headBob
  );
  ctx.quadraticCurveTo(
    x + size * 0.24,
    y - size * 0.7 + hover + headBob,
    x + size * 0.16,
    y - size * 0.58 + hover + headBob
  );
  ctx.fill();
  // Horn highlight cuts
  ctx.strokeStyle = "#78716c";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.07, y - size * 0.72 + hover + headBob);
  ctx.lineTo(x - size * 0.16, y - size * 0.8 + hover + headBob);
  ctx.moveTo(x + size * 0.18, y - size * 0.68 + hover + headBob);
  ctx.lineTo(x + size * 0.3, y - size * 0.75 + hover + headBob);
  ctx.stroke();
  // Horn outer curved edges (second ridge for horn mass)
  ctx.strokeStyle = "#292524";
  ctx.lineWidth = 1.1 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2, y - size * 0.84 + hover + headBob);
  ctx.quadraticCurveTo(
    x - size * 0.11,
    y - size * 0.72 + hover + headBob,
    x - size * 0.02,
    y - size * 0.61 + hover + headBob
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + size * 0.34, y - size * 0.78 + hover + headBob);
  ctx.quadraticCurveTo(
    x + size * 0.22,
    y - size * 0.69 + hover + headBob,
    x + size * 0.14,
    y - size * 0.59 + hover + headBob
  );
  ctx.stroke();

  // Crown spikes on head
  ctx.fillStyle = bodyColorDark;
  for (let spike = 0; spike < 5; spike++) {
    const spikeX = x - size * 0.02 + spike * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(spikeX, y - size * 0.62 + hover + headBob);
    ctx.lineTo(
      spikeX + size * 0.016,
      y - size * 0.69 - spike * size * 0.011 + hover + headBob
    );
    ctx.lineTo(spikeX + size * 0.03, y - size * 0.62 + hover + headBob);
    ctx.fill();
  }
  // Cheek spikes
  ctx.fillStyle = bodyColorDark;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.09, y - size * 0.5 + hover + headBob);
  ctx.lineTo(x - size * 0.03, y - size * 0.46 + hover + headBob);
  ctx.lineTo(x + size * 0.06, y - size * 0.58 + hover + headBob);
  ctx.closePath();
  ctx.fill();

  // Eyes (ancient and knowing)
  ctx.fillStyle = "#fbbf24";
  setShadowBlur(ctx, 8 * zoom, "#f59e0b");
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.56 + hover + headBob,
    size * 0.035,
    size * 0.025,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  clearShadow(ctx);
  // Eye socket and brow
  ctx.strokeStyle = bodyColorDark;
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.01, y - size * 0.58 + hover + headBob);
  ctx.quadraticCurveTo(
    x + size * 0.06,
    y - size * 0.62 + hover + headBob,
    x + size * 0.11,
    y - size * 0.57 + hover + headBob
  );
  ctx.stroke();
  // Pupil (slit)
  ctx.fillStyle = "#0a0503";
  ctx.beginPath();
  ctx.ellipse(
    x + size * 0.05,
    y - size * 0.56 + hover + headBob,
    size * 0.01,
    size * 0.02,
    0.2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // Teeth
  ctx.fillStyle = "#f8f8f8";
  for (let tooth = 0; tooth < 4; tooth++) {
    const tx = x + size * (0.23 + tooth * 0.04);
    const ty = y - size * (0.5 - tooth * 0.004) + hover + headBob;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + size * 0.012, ty + size * 0.035 + jawOpen * 0.4);
    ctx.lineTo(tx + size * 0.022, ty);
    ctx.closePath();
    ctx.fill();
  }

  // Fire breath (when attacking)
  if (isAttacking && attackPhase > 0.3) {
    const firePhase = (attackPhase - 0.3) / 0.7;
    const fireLength = size * 0.8 * firePhase;

    // Fire cone
    const fireGrad = ctx.createLinearGradient(
      x + size * 0.4,
      y - size * 0.5 + hover + headBob,
      x + size * 0.4 + fireLength,
      y - size * 0.4 + hover + headBob
    );
    fireGrad.addColorStop(0, `rgba(255, 255, 200, ${firePhase})`);
    fireGrad.addColorStop(0.3, `rgba(255, 200, 50, ${firePhase * 0.9})`);
    fireGrad.addColorStop(0.6, `rgba(255, 100, 0, ${firePhase * 0.7})`);
    fireGrad.addColorStop(1, `rgba(200, 50, 0, 0)`);

    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.4, y - size * 0.52 + hover + headBob);
    ctx.quadraticCurveTo(
      x + size * 0.5 + fireLength * 0.5,
      y - size * 0.7 + hover + headBob,
      x + size * 0.4 + fireLength,
      y - size * 0.4 + sin10 * size * 0.1 + hover + headBob
    );
    ctx.quadraticCurveTo(
      x + size * 0.5 + fireLength * 0.5,
      y - size * 0.3 + hover + headBob,
      x + size * 0.4,
      y - size * 0.48 + hover + headBob
    );
    ctx.fill();

    // Embers around the fire cone
    for (let ember = 0; ember < 7; ember++) {
      const emberPhase = (time * 5 + ember * 0.21) % 1;
      const emberX = x + size * (0.45 + emberPhase * (0.2 + ember * 0.05));
      const emberY =
        y -
        size * 0.5 +
        hover +
        headBob +
        Math.sin(time * 6 + ember) * size * 0.06;
      const emberAlpha = (1 - emberPhase) * firePhase * 0.7;
      ctx.fillStyle = `rgba(255, ${170 - ember * 12}, ${80 - ember * 8}, ${emberAlpha})`;
      ctx.beginPath();
      ctx.arc(emberX, emberY, size * (0.014 + ember * 0.0015), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Arcane chest ring around emblem
  ctx.strokeStyle = `rgba(255, 160, 60, ${chestGlow * 0.35})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.ellipse(
    x,
    y + size * 0.15 + hover,
    size * 0.18,
    size * 0.11,
    0,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  // Princeton "P" emblem on chest
  ctx.fillStyle = `rgba(255, 140, 0, ${breathPulse * 0.8})`;
  ctx.font = `bold ${size * 0.15}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", x, y + size * 0.15 + hover);

  // Dragon ember sparks
  drawEmberSparks(ctx, x, y + hover, size * 0.45, time, zoom, {
    color: "rgba(255, 100, 50, 0.5)",
    coreColor: "rgba(255, 200, 100, 0.8)",
    count: 7,
    maxAlpha: 0.4,
    sparkSize: 0.06,
    speed: 1.5,
  });

  // Floating scale segments
  drawShiftingSegments(ctx, x, y + hover, size, time, zoom, {
    bobAmt: 0.03,
    bobSpeed: 2,
    color: bodyColorLight,
    colorAlt: bodyColor,
    count: 7,
    orbitRadius: 0.5,
    orbitSpeed: 0.8,
    rotateWithOrbit: true,
    segmentSize: 0.035,
    shape: "diamond",
  });

  // Orbiting fire debris
  drawOrbitingDebris(ctx, x, y + hover, size, time, zoom, {
    color: "#fbbf24",
    count: 6,
    glowColor: "rgba(251, 191, 36, 0.4)",
    maxRadius: 0.65,
    minRadius: 0.4,
    particleSize: 0.018,
    speed: 1.8,
    trailLen: 3,
  });

  // ── Wing membrane fire glow — translucent inner fire pulsing with wingbeat ──
  for (const wingSide of [-1, 1] as const) {
    const wingRot = wingSide === -1 ? -0.5 + wingFlap : 0.5 - wingFlap;
    ctx.save();
    ctx.translate(x + wingSide * size * 0.3, y - size * 0.12 + hover);
    ctx.rotate(wingRot);
    const memGlowAlpha =
      0.12 + Math.sin(time * 3.5 + (wingSide === 1 ? Math.PI : 0)) * 0.08;
    const memGrad = ctx.createRadialGradient(
      wingSide * size * 0.3,
      -size * 0.15,
      0,
      wingSide * size * 0.3,
      -size * 0.15,
      size * 0.45
    );
    memGrad.addColorStop(0, `rgba(255, 120, 30, ${memGlowAlpha})`);
    memGrad.addColorStop(0.4, `rgba(255, 80, 20, ${memGlowAlpha * 0.6})`);
    memGrad.addColorStop(0.7, `rgba(200, 40, 10, ${memGlowAlpha * 0.3})`);
    memGrad.addColorStop(1, "rgba(159, 18, 57, 0)");
    ctx.fillStyle = memGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(
      wingSide * size * 0.22,
      -size * 0.44,
      wingSide * size * 0.65,
      -size * 0.56
    );
    ctx.quadraticCurveTo(
      wingSide * size * 0.56,
      -size * 0.38,
      wingSide * size * 0.86,
      -size * 0.3
    );
    ctx.quadraticCurveTo(
      wingSide * size * 0.6,
      -size * 0.14,
      wingSide * size * 0.36,
      0
    );
    ctx.quadraticCurveTo(
      wingSide * size * 0.38,
      size * 0.03,
      wingSide * size * 0.72,
      size * 0.16
    );
    ctx.quadraticCurveTo(wingSide * size * 0.32, size * 0.1, 0, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ── Flame breath buildup — fire orb near mouth/throat ──
  const breathBuild =
    0.3 + Math.sin(time * 3) * 0.2 + (isAttacking ? attackPhase * 0.5 : 0);
  const fbMouthX = x + size * 0.4;
  const fbMouthY = y - size * 0.5 + hover + headBob;
  const fbOrbR = size * 0.06 * breathBuild;
  const fbGrad = ctx.createRadialGradient(
    fbMouthX,
    fbMouthY,
    0,
    fbMouthX,
    fbMouthY,
    fbOrbR
  );
  fbGrad.addColorStop(0, `rgba(255, 255, 200, ${breathBuild * 0.6})`);
  fbGrad.addColorStop(0.3, `rgba(255, 180, 50, ${breathBuild * 0.4})`);
  fbGrad.addColorStop(0.6, `rgba(255, 100, 20, ${breathBuild * 0.25})`);
  fbGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
  ctx.fillStyle = fbGrad;
  ctx.beginPath();
  ctx.arc(fbMouthX, fbMouthY, fbOrbR, 0, Math.PI * 2);
  ctx.fill();

  // ── Scale shimmer — traveling metallic highlight across body ──
  const scaleShimAngle = (time * 1.2) % (Math.PI * 2);
  const scaleShimX = x + Math.cos(scaleShimAngle) * size * 0.25;
  const scaleShimY =
    y + size * 0.1 + hover + Math.sin(scaleShimAngle) * size * 0.2;
  const scaleShimGrad = ctx.createRadialGradient(
    scaleShimX,
    scaleShimY,
    0,
    scaleShimX,
    scaleShimY,
    size * 0.15
  );
  scaleShimGrad.addColorStop(0, "rgba(255, 220, 180, 0.2)");
  scaleShimGrad.addColorStop(0.4, "rgba(255, 200, 150, 0.1)");
  scaleShimGrad.addColorStop(1, "rgba(255, 180, 120, 0)");
  ctx.fillStyle = scaleShimGrad;
  ctx.beginPath();
  ctx.ellipse(
    scaleShimX,
    scaleShimY,
    size * 0.15,
    size * 0.1,
    scaleShimAngle * 0.5,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // ── Orbiting fire embers — 8 glowing ember particles ──
  for (let fe = 0; fe < 8; fe++) {
    const feAngle = time * 1.2 + (fe / 8) * Math.PI * 2;
    const feDist = size * (0.55 + Math.sin(time * 2 + fe * 0.8) * 0.08);
    const feX = x + Math.cos(feAngle) * feDist;
    const feY = y + hover + Math.sin(feAngle * 1.4) * size * 0.3;
    const feAlpha = 0.5 + Math.sin(time * 4 + fe * 1.5) * 0.25;
    const feR = size * (0.015 + Math.sin(time * 5 + fe) * 0.005);
    const feGrad = ctx.createRadialGradient(feX, feY, 0, feX, feY, feR * 2);
    feGrad.addColorStop(0, `rgba(255, 200, 80, ${feAlpha})`);
    feGrad.addColorStop(0.5, `rgba(255, 120, 30, ${feAlpha * 0.5})`);
    feGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
    ctx.fillStyle = feGrad;
    ctx.beginPath();
    ctx.arc(feX, feY, feR * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 240, 180, ${feAlpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(feX, feY, feR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Tail flame trail — glowing embers trailing behind tail ──
  const tailTipX = x - size * 0.72 + tailWaveB;
  const tailTipY = y + size * 0.35 + hover;
  for (let trail = 0; trail < 5; trail++) {
    const trailPhase = (time * 2.5 + trail * 0.2) % 1;
    const trX =
      tailTipX - trail * size * 0.06 + Math.sin(time * 4 + trail) * size * 0.02;
    const trY =
      tailTipY -
      trailPhase * size * 0.15 +
      Math.cos(time * 3 + trail) * size * 0.02;
    const trAlpha = (1 - trailPhase) * 0.4;
    const trR = size * (0.02 + (1 - trailPhase) * 0.015);
    const trGrad = ctx.createRadialGradient(trX, trY, 0, trX, trY, trR);
    trGrad.addColorStop(0, `rgba(255, 180, 60, ${trAlpha})`);
    trGrad.addColorStop(0.5, `rgba(255, 100, 20, ${trAlpha * 0.5})`);
    trGrad.addColorStop(1, "rgba(200, 50, 0, 0)");
    ctx.fillStyle = trGrad;
    ctx.beginPath();
    ctx.arc(trX, trY, trR, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Enhanced eye blaze — intense crimson/gold radial gradient ──
  const eyeBlazeX = x + size * 0.05;
  const eyeBlazeY = y - size * 0.56 + hover + headBob;
  const eyeBlazeIntensity = 0.6 + Math.sin(time * 5) * 0.3;
  const eyeBlazeGrad = ctx.createRadialGradient(
    eyeBlazeX,
    eyeBlazeY,
    0,
    eyeBlazeX,
    eyeBlazeY,
    size * 0.06
  );
  eyeBlazeGrad.addColorStop(
    0,
    `rgba(255, 220, 80, ${eyeBlazeIntensity * 0.6})`
  );
  eyeBlazeGrad.addColorStop(
    0.3,
    `rgba(255, 150, 30, ${eyeBlazeIntensity * 0.35})`
  );
  eyeBlazeGrad.addColorStop(
    0.6,
    `rgba(200, 50, 20, ${eyeBlazeIntensity * 0.15})`
  );
  eyeBlazeGrad.addColorStop(1, "rgba(159, 18, 57, 0)");
  ctx.fillStyle = eyeBlazeGrad;
  ctx.beginPath();
  ctx.arc(eyeBlazeX, eyeBlazeY, size * 0.06, 0, Math.PI * 2);
  ctx.fill();
}
