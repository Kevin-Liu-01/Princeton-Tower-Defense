import { setShadowBlur, clearShadow } from "../performance";
import { ISO_Y_RATIO } from "../../constants/isometric";
import {
  drawPulsingGlowRings,
  drawShiftingSegments,
  drawOrbitingDebris,
  getBreathScale,
  getIdleSway,
  drawArcaneSparkles,
  drawEmberSparks,
} from "./animationHelpers";
import {
  drawPathArm,
  drawPathLegs,
  drawHelmetPlume,
} from "./darkFantasyHelpers";

const TAU = Math.PI * 2;

// ============================================================================
// 1. FRESHMAN — CORRUPTED NEOPHYTE
//    Eldritch tentacle theme with dark green-tinged bronze armor
// ============================================================================

export function drawFreshmanEnemy(
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
  const breath = getBreathScale(time, 1.6, 0.014);
  const sway = getIdleSway(time, 1.2, size * 0.003, size * 0.002);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#a8a070";
  const metalMid = "#7a7258";
  const metalDark = "#4a4838";
  const corruptGreen = "#4ade80";
  const corruptDark = "#1a3a1a";

  const pulseIntensity = 0.5 + Math.sin(time * 4) * 0.3 + attackIntensity * 0.3;
  const runeGlow = 0.6 + Math.sin(time * 5) * 0.4 + attackIntensity * 0.4;
  const corruptionPulse =
    0.4 + Math.sin(time * 7) * 0.3 + attackIntensity * 0.3;

  // === CORRUPTION AURA (behind body) ===
  const auraGrad = ctx.createRadialGradient(
    cx,
    y - bodyBob,
    0,
    cx,
    y - bodyBob,
    size * 0.75,
  );
  auraGrad.addColorStop(0, `rgba(20, 80, 20, ${pulseIntensity * 0.3})`);
  auraGrad.addColorStop(0.4, `rgba(74, 222, 128, ${pulseIntensity * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(cx, y - bodyBob, size * 0.75, size * 0.5, 0, 0, TAU);
  ctx.fill();

  // Void distortion rings
  ctx.strokeStyle = `rgba(0, 20, 0, ${pulseIntensity * 0.25})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const distortPhase = (time * 0.8 + i * 0.4) % 2;
    const distortSize = size * 0.3 + distortPhase * size * 0.35;
    ctx.globalAlpha = 0.35 * (1 - distortPhase / 2);
    ctx.beginPath();
    for (let a = 0; a < TAU; a += 0.2) {
      const r = distortSize + Math.sin(a * 5 + time * 4) * size * 0.03;
      const wx = cx + Math.cos(a) * r;
      const wy = y - bodyBob + Math.sin(a) * r * 0.6;
      if (a === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Eldritch tentacles emerging from ground
  ctx.strokeStyle = `rgba(30, 80, 30, ${corruptionPulse * 0.6})`;
  ctx.lineWidth = 2.5 * zoom;
  for (let i = 0; i < 4; i++) {
    const tentacleAngle =
      -Math.PI * 0.8 + i * Math.PI * 0.4 + Math.sin(time * 2) * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(tentacleAngle) * size * 0.35, y + size * 0.48);
    ctx.quadraticCurveTo(
      cx +
        Math.cos(tentacleAngle) * size * 0.45 +
        Math.sin(time * 3 + i) * size * 0.07,
      y + size * 0.25,
      cx +
        Math.cos(tentacleAngle) * size * 0.3 +
        Math.sin(time * 4 + i) * size * 0.08,
      y + size * 0.1 + Math.sin(time * 5 + i) * size * 0.04,
    );
    ctx.stroke();
    ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse})`;
    ctx.beginPath();
    ctx.arc(
      cx +
        Math.cos(tentacleAngle) * size * 0.3 +
        Math.sin(time * 4 + i) * size * 0.08,
      y + size * 0.1 + Math.sin(time * 5 + i) * size * 0.04,
      size * 0.012,
      0,
      TAU,
    );
    ctx.fill();
  }

  // Floating corruption particles
  for (let i = 0; i < 6; i++) {
    const pAngle = time * 2 + i * Math.PI * 0.33;
    const pDist = size * 0.42 + Math.sin(time * 3 + i) * size * 0.1;
    const px = cx + Math.cos(pAngle) * pDist;
    const py = y - size * 0.1 - bodyBob + Math.sin(pAngle) * pDist * 0.4;
    ctx.fillStyle = `rgba(120, 255, 160, ${0.5 + Math.sin(time * 5 + i) * 0.25})`;
    ctx.beginPath();
    ctx.arc(
      px,
      py,
      size * 0.015 + Math.sin(time * 6 + i) * size * 0.006,
      0,
      TAU,
    );
    ctx.fill();
  }

  // Ground corruption dust kicked up at feet
  for (let i = 0; i < 5; i++) {
    const dustPhase = (time * 1.5 + i * 0.7) % 2;
    const dustX = cx + Math.sin(time * 2 + i * 1.3) * size * 0.25;
    const dustY = y + size * 0.45 - dustPhase * size * 0.12;
    const dustAlpha = (1 - dustPhase / 2) * 0.4;
    ctx.fillStyle = `rgba(74, 222, 128, ${dustAlpha})`;
    ctx.beginPath();
    ctx.arc(
      dustX,
      dustY,
      size * 0.01 + Math.sin(time * 3 + i) * size * 0.004,
      0,
      TAU,
    );
    ctx.fill();
  }
  // Corruption spore motes rising from ground
  for (let i = 0; i < 4; i++) {
    const sporePhase = (time * 0.8 + i * 0.5) % 3;
    const sporeX = cx + Math.sin(time + i * 2.1) * size * 0.2;
    const sporeY = y + size * 0.5 - sporePhase * size * 0.25;
    ctx.fillStyle = `rgba(120, 255, 160, ${(1 - sporePhase / 3) * 0.35})`;
    ctx.beginPath();
    ctx.arc(sporeX, sporeY, size * 0.006, 0, TAU);
    ctx.fill();
  }

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: metalDark,
    trimColor: corruptDark,
    strideSpeed: 3.5,
    strideAmt: 0.22,
    legLen: 0.22,
    width: 0.1,
    footLen: 0.11,
    style: "armored",
  });

  // === TATTERED ROBE HEM ===
  ctx.save();
  ctx.translate(cx, y - size * 0.02 - bodyBob);
  const robeHemGrad = ctx.createLinearGradient(-size * 0.22, 0, size * 0.22, 0);
  robeHemGrad.addColorStop(0, corruptDark);
  robeHemGrad.addColorStop(0.5, "#1a3a1a");
  robeHemGrad.addColorStop(1, corruptDark);
  ctx.fillStyle = robeHemGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.04);
  ctx.lineTo(size * 0.22, -size * 0.04);
  ctx.lineTo(size * 0.2, size * 0.1);
  ctx.lineTo(-size * 0.2, size * 0.1);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 7; i++) {
    const stripX = -size * 0.18 + i * size * 0.06;
    const stripLen = size * 0.04 + Math.sin(time * 2 + i) * size * 0.015;
    ctx.fillStyle = i % 2 === 0 ? "#1a3a1a" : corruptDark;
    ctx.beginPath();
    ctx.moveTo(stripX - size * 0.015, size * 0.08);
    ctx.lineTo(stripX + size * 0.015, size * 0.08);
    ctx.lineTo(stripX + size * 0.01, size * 0.08 + stripLen);
    ctx.lineTo(stripX - size * 0.01, size * 0.08 + stripLen + size * 0.01);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === TATTERED CLOTH ROBE with corrupted tabard ===
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.scale(breath, breath);

  const robeGrad = ctx.createLinearGradient(
    -size * 0.3,
    -size * 0.22,
    size * 0.3,
    size * 0.22,
  );
  robeGrad.addColorStop(0, corruptDark);
  robeGrad.addColorStop(0.3, "#1a3a1a");
  robeGrad.addColorStop(0.5, "#2a4a2a");
  robeGrad.addColorStop(0.7, "#1a3a1a");
  robeGrad.addColorStop(1, corruptDark);
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.26, size * 0.16);
  ctx.bezierCurveTo(
    -size * 0.28, size * 0.06,
    -size * 0.28, -size * 0.06,
    -size * 0.22, -size * 0.2,
  );
  ctx.bezierCurveTo(
    -size * 0.16, -size * 0.24,
    -size * 0.08, -size * 0.26,
    0, -size * 0.27,
  );
  ctx.bezierCurveTo(
    size * 0.08, -size * 0.26,
    size * 0.16, -size * 0.24,
    size * 0.22, -size * 0.2,
  );
  ctx.bezierCurveTo(
    size * 0.28, -size * 0.06,
    size * 0.28, size * 0.06,
    size * 0.26, size * 0.16,
  );
  ctx.closePath();
  ctx.fill();

  // Cloth fold lines
  ctx.strokeStyle = "rgba(0, 20, 0, 0.4)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.18, -size * 0.18);
  ctx.quadraticCurveTo(-size * 0.2, 0, -size * 0.16, size * 0.14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.18, -size * 0.18);
  ctx.quadraticCurveTo(size * 0.2, 0, size * 0.16, size * 0.14);
  ctx.stroke();
  // Tattered tear on robe
  ctx.strokeStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.3})`;
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, size * 0.02);
  ctx.quadraticCurveTo(-size * 0.17, size * 0.05, -size * 0.19, size * 0.08);
  ctx.stroke();

  // Dark green corrupted tabard
  const tabardGrad = ctx.createLinearGradient(
    -size * 0.12,
    -size * 0.2,
    size * 0.12,
    size * 0.15,
  );
  tabardGrad.addColorStop(0, "#0a1a0a");
  tabardGrad.addColorStop(0.3, "#1a3a1a");
  tabardGrad.addColorStop(0.7, "#2a5a2a");
  tabardGrad.addColorStop(1, "#0a1a0a");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.14, size * 0.14);
  ctx.lineTo(-size * 0.14, size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Corruption veins on tabard
  ctx.strokeStyle = `rgba(74, 222, 128, ${pulseIntensity * 0.6})`;
  ctx.lineWidth = 1 * zoom;
  for (let v = 0; v < 3; v++) {
    const vx = -size * 0.06 + v * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(vx, -size * 0.18);
    ctx.quadraticCurveTo(
      vx + Math.sin(time * 2 + v) * size * 0.04,
      0,
      vx,
      size * 0.12,
    );
    ctx.stroke();
  }

  // Eldritch sigil on chest
  ctx.fillStyle = `rgba(120, 255, 160, ${runeGlow * 0.5})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⍟", 0, -size * 0.04);

  // Corruption vein network on cuirass plates
  ctx.strokeStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.35})`;
  ctx.lineWidth = 0.8 * zoom;
  for (const vSide of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(vSide * size * 0.18, -size * 0.15);
    ctx.quadraticCurveTo(
      vSide * size * 0.22 + Math.sin(time * 3 + vSide) * size * 0.02,
      -size * 0.02,
      vSide * size * 0.16,
      size * 0.1,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vSide * size * 0.2, -size * 0.08);
    ctx.lineTo(
      vSide * size * 0.24 + Math.sin(time * 4) * size * 0.01,
      -size * 0.04,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(vSide * size * 0.17, size * 0.02);
    ctx.lineTo(
      vSide * size * 0.21 + Math.sin(time * 5) * size * 0.01,
      size * 0.08,
    );
    ctx.stroke();
  }

  ctx.restore();

  // === CLOTH COWL NECKLINE ===
  ctx.save();
  ctx.translate(cx, y - size * 0.35 - bodyBob);
  const cowlGrad = ctx.createLinearGradient(-size * 0.1, -size * 0.04, size * 0.1, size * 0.04);
  cowlGrad.addColorStop(0, corruptDark);
  cowlGrad.addColorStop(0.5, "#1a3a1a");
  cowlGrad.addColorStop(1, corruptDark);
  ctx.fillStyle = cowlGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.14, size * 0.06, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 20, 0, 0.35)";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.02);
  ctx.quadraticCurveTo(0, size * 0.03, size * 0.08, -size * 0.02);
  ctx.stroke();
  ctx.restore();

  // === CORRUPTION CHAIN AMULET ===
  ctx.strokeStyle = `rgba(168, 160, 112, ${0.7 + Math.sin(time * 2) * 0.15})`;
  ctx.lineWidth = 1.5 * zoom;
  const freshChainY = y - size * 0.32 - bodyBob;
  for (let link = 0; link < 7; link++) {
    const linkAngle = -Math.PI * 0.3 + link * Math.PI * 0.1;
    const linkX = cx + Math.cos(linkAngle) * size * 0.14;
    const linkY =
      freshChainY + Math.sin(linkAngle) * size * 0.03 + link * size * 0.004;
    ctx.beginPath();
    ctx.ellipse(linkX, linkY, size * 0.009, size * 0.006, linkAngle, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.8})`;
  ctx.beginPath();
  ctx.arc(cx, freshChainY + size * 0.055, size * 0.018, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(120, 255, 160, ${runeGlow})`;
  ctx.beginPath();
  ctx.arc(cx, freshChainY + size * 0.055, size * 0.01, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(120, 255, 160, ${runeGlow * 0.6})`;
  ctx.font = `${size * 0.015}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⍟", cx, freshChainY + size * 0.055);

  // === TENTACLE-WRAPPED SHOULDER PADS ===
  for (const side of [-1, 1] as const) {
    const spX = cx + side * size * 0.26;
    const spY = y - size * 0.3 - bodyBob;
    ctx.fillStyle = "#1a3a1a";
    ctx.beginPath();
    ctx.ellipse(spX, spY, size * 0.08, size * 0.05, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.fillStyle = corruptDark;
    ctx.beginPath();
    ctx.ellipse(spX, spY - size * 0.01, size * 0.06, size * 0.035, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = `rgba(30, 80, 30, ${corruptionPulse * 0.7})`;
    ctx.lineWidth = 2 * zoom;
    for (let t = 0; t < 3; t++) {
      const tA = t * 0.8 + time * 2;
      ctx.beginPath();
      ctx.arc(spX, spY, size * 0.04 + t * size * 0.015, tA, tA + 1.2);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(
      spX + side * size * 0.06 + Math.sin(time * 4) * size * 0.01,
      spY - size * 0.04,
      size * 0.008,
      0,
      TAU,
    );
    ctx.fill();
  }

  // === ROPE BELT WITH ELDRITCH PENDANT ===
  const freshBeltY = y - size * 0.04 - bodyBob;
  ctx.strokeStyle = "#3e3225";
  ctx.lineWidth = size * 0.025;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, freshBeltY);
  ctx.quadraticCurveTo(cx, freshBeltY + size * 0.015, cx + size * 0.22, freshBeltY);
  ctx.stroke();
  ctx.fillStyle = "#4a3a28";
  for (let k = 0; k < 5; k++) {
    const kx = cx - size * 0.16 + k * size * 0.08;
    ctx.beginPath();
    ctx.arc(kx, freshBeltY, size * 0.008, 0, TAU);
    ctx.fill();
  }
  ctx.strokeStyle = "#3e3225";
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.05, freshBeltY);
  ctx.quadraticCurveTo(cx + size * 0.06, freshBeltY + size * 0.06, cx + size * 0.04, freshBeltY + size * 0.1);
  ctx.stroke();
  ctx.fillStyle = `rgba(74, 222, 128, ${runeGlow * 0.6})`;
  ctx.beginPath();
  ctx.arc(cx, freshBeltY + size * 0.01, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(120, 255, 160, ${runeGlow})`;
  ctx.font = `${size * 0.018}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⍟", cx, freshBeltY + size * 0.01);

  // === LEFT ARM — corrupted tome ===
  const freshForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: corruptDark,
      upperLen: 0.16,
      foreLen: freshForeLen,
      width: 0.09,
      shoulderAngle: -0.6 + Math.sin(time * 2) * 0.08 + (isAttacking ? -attackIntensity * 0.3 : 0),
      elbowAngle: 0.9 + Math.sin(time * 2.5) * 0.06 + (isAttacking ? -attackIntensity * 0.2 : 0),
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = freshForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Eldritch glow behind tome
        wCtx.fillStyle = `rgba(74, 222, 128, ${runeGlow * 0.2})`;
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.1, 0, TAU);
        wCtx.fill();
        // Corrupted tome cover
        wCtx.fillStyle = "#0a1a0a";
        wCtx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
        wCtx.fillStyle = "#1a3a1a";
        wCtx.fillRect(-size * 0.05, -size * 0.07, size * 0.1, size * 0.14);
        // Corner clasps (all four)
        wCtx.fillStyle = "#3a5a3a";
        wCtx.fillRect(-size * 0.06, -size * 0.08, size * 0.03, size * 0.03);
        wCtx.fillRect(size * 0.03, -size * 0.08, size * 0.03, size * 0.03);
        wCtx.fillRect(-size * 0.06, size * 0.05, size * 0.03, size * 0.03);
        wCtx.fillRect(size * 0.03, size * 0.05, size * 0.03, size * 0.03);
        // Spine detail
        wCtx.fillStyle = "#2a4a2a";
        wCtx.fillRect(-size * 0.062, -size * 0.06, size * 0.012, size * 0.12);
        // Glowing page spread
        wCtx.fillStyle = `rgba(74, 222, 128, ${runeGlow * 0.5})`;
        wCtx.fillRect(-size * 0.04, -size * 0.05, size * 0.08, size * 0.1);
        // Visible page edges
        wCtx.strokeStyle = `rgba(120, 255, 160, ${runeGlow * 0.35})`;
        wCtx.lineWidth = size * 0.003;
        for (let pl = 0; pl < 5; pl++) {
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.03, -size * 0.04 + pl * size * 0.018);
          wCtx.lineTo(size * 0.03, -size * 0.04 + pl * size * 0.018);
          wCtx.stroke();
        }
        // Runic text on pages
        wCtx.fillStyle = `rgba(120, 255, 160, ${runeGlow})`;
        wCtx.font = `${size * 0.04}px serif`;
        wCtx.textAlign = "center";
        wCtx.fillText("ᛟᚨ", 0, -size * 0.01);
        wCtx.font = `${size * 0.028}px serif`;
        wCtx.fillText("ᚱᛏᛗ", 0, size * 0.025);
        // Floating corruption motes from book
        for (let m = 0; m < 3; m++) {
          const mPhase = (time * 3 + m * 0.8) % 1.5;
          wCtx.fillStyle = `rgba(74, 222, 128, ${(1 - mPhase / 1.5) * 0.6})`;
          wCtx.beginPath();
          wCtx.arc(
            Math.sin(time * 5 + m) * size * 0.04,
            -size * 0.05 - mPhase * size * 0.06,
            size * 0.005,
            0,
            TAU,
          );
          wCtx.fill();
        }
      },
    },
  );

  // === RIGHT ARM — writhing tentacle weapon ===
  drawPathArm(
    ctx,
    cx + size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: corruptDark,
      upperLen: 0.16,
      foreLen: freshForeLen,
      width: 0.09,
      shoulderAngle:
        0.5 +
        Math.sin(time * 1.8) * 0.1 +
        (isAttacking ? attackIntensity * 0.4 : 0),
      elbowAngle: 0.3 + Math.sin(time * 2.2) * 0.08,
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = freshForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Tentacle weapon shaft
        wCtx.strokeStyle = "#2a5a2a";
        wCtx.lineWidth = size * 0.02;
        wCtx.beginPath();
        wCtx.moveTo(0, 0);
        wCtx.quadraticCurveTo(
          Math.sin(time * 4) * size * 0.04,
          -size * 0.1,
          Math.sin(time * 3) * size * 0.06,
          -size * 0.2,
        );
        wCtx.stroke();
        // Tentacle tip glow
        wCtx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse})`;
        wCtx.beginPath();
        wCtx.arc(
          Math.sin(time * 3) * size * 0.06,
          -size * 0.2,
          size * 0.02,
          0,
          TAU,
        );
        wCtx.fill();
        // Writhing sub-tendrils
        for (let t = 0; t < 3; t++) {
          const tAngle = time * 5 + (t * TAU) / 3;
          wCtx.strokeStyle = `rgba(74, 222, 128, ${0.5 + Math.sin(time * 4 + t) * 0.3})`;
          wCtx.lineWidth = size * 0.008;
          wCtx.beginPath();
          wCtx.moveTo(Math.sin(time * 3) * size * 0.06, -size * 0.18);
          wCtx.quadraticCurveTo(
            Math.cos(tAngle) * size * 0.06,
            -size * 0.22,
            Math.cos(tAngle) * size * 0.08,
            -size * 0.26,
          );
          wCtx.stroke();
        }
      },
    },
  );

  // === HEAD — Deep hooded cowl with glowing eyes (NOT template helm) ===
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;
  // Shadowed face under cowl
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.arc(headX, headY + size * 0.02, size * 0.13, 0, TAU);
  ctx.fill();
  // Deep hood
  const hoodGrad = ctx.createRadialGradient(headX, headY - size * 0.04, 0, headX, headY, size * 0.22);
  hoodGrad.addColorStop(0, "#1a2a1a");
  hoodGrad.addColorStop(0.5, "#0a1a0a");
  hoodGrad.addColorStop(1, corruptDark);
  ctx.fillStyle = hoodGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.17, headY + size * 0.1);
  ctx.quadraticCurveTo(headX - size * 0.22, headY - size * 0.06, headX - size * 0.14, headY - size * 0.2);
  ctx.quadraticCurveTo(headX, headY - size * 0.28, headX + size * 0.14, headY - size * 0.2);
  ctx.quadraticCurveTo(headX + size * 0.22, headY - size * 0.06, headX + size * 0.17, headY + size * 0.1);
  ctx.quadraticCurveTo(headX, headY + size * 0.04, headX - size * 0.17, headY + size * 0.1);
  ctx.fill();
  // Hood folds
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY - size * 0.2);
  ctx.quadraticCurveTo(headX - size * 0.12, headY - size * 0.04, headX - size * 0.14, headY + size * 0.08);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.08, headY - size * 0.2);
  ctx.quadraticCurveTo(headX + size * 0.12, headY - size * 0.04, headX + size * 0.14, headY + size * 0.08);
  ctx.stroke();
  // Glowing green eyes in shadow
  for (const eSide of [-1, 1]) {
    setShadowBlur(ctx, 6 * zoom, corruptGreen);
    ctx.fillStyle = corruptGreen;
    ctx.beginPath();
    ctx.ellipse(headX + eSide * size * 0.05, headY + size * 0.01, size * 0.018, size * 0.01, 0, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
  }

  // Tentacle tendrils emerging from helm top
  ctx.strokeStyle = `rgba(30, 80, 30, ${corruptionPulse * 0.7})`;
  ctx.lineWidth = 2 * zoom;
  for (let i = 0; i < 5; i++) {
    const tAngle = -Math.PI * 0.3 + i * Math.PI * 0.15;
    ctx.beginPath();
    ctx.moveTo(headX + Math.cos(tAngle) * size * 0.05, headY - size * 0.18);
    ctx.bezierCurveTo(
      headX +
        Math.cos(tAngle) * size * 0.1 +
        Math.sin(time * 4 + i) * size * 0.04,
      headY - size * 0.25,
      headX +
        Math.cos(tAngle + 0.2) * size * 0.12 +
        Math.sin(time * 3 + i) * size * 0.05,
      headY - size * 0.32,
      headX +
        Math.cos(tAngle) * size * 0.1 +
        Math.sin(time * 5 + i) * size * 0.06,
      headY - size * 0.38,
    );
    ctx.stroke();
    ctx.fillStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(
      headX +
        Math.cos(tAngle) * size * 0.1 +
        Math.sin(time * 5 + i) * size * 0.06,
      headY - size * 0.38,
      size * 0.008,
      0,
      TAU,
    );
    ctx.fill();
  }

  // Secondary smaller tendrils between main ones
  ctx.strokeStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.4})`;
  ctx.lineWidth = 1 * zoom;
  for (let i = 0; i < 4; i++) {
    const tAngle2 = -Math.PI * 0.25 + i * Math.PI * 0.17;
    ctx.beginPath();
    ctx.moveTo(
      headX + Math.cos(tAngle2) * size * 0.08,
      headY - size * 0.2,
    );
    ctx.quadraticCurveTo(
      headX +
        Math.cos(tAngle2) * size * 0.12 +
        Math.sin(time * 6 + i) * size * 0.03,
      headY - size * 0.28,
      headX +
        Math.cos(tAngle2) * size * 0.09 +
        Math.sin(time * 7 + i) * size * 0.04,
      headY - size * 0.33,
    );
    ctx.stroke();
  }

  // Pulsing corruption nodes on tentacles
  for (let i = 0; i < 3; i++) {
    const nodeAngle = -Math.PI * 0.2 + i * Math.PI * 0.2;
    const nodeX =
      headX +
      Math.cos(nodeAngle) * size * 0.1 +
      Math.sin(time * 4 + i) * size * 0.03;
    const nodeY = headY - size * 0.26 + Math.cos(time * 3 + i) * size * 0.02;
    ctx.fillStyle = `rgba(74, 222, 128, ${0.3 + Math.sin(time * 6 + i * 2) * 0.2})`;
    ctx.beginPath();
    ctx.arc(nodeX, nodeY, size * 0.01, 0, TAU);
    ctx.fill();
  }

  // === PLUME ===
  drawHelmetPlume(
    ctx,
    headX,
    headY - size * 0.18,
    size,
    time,
    zoom,
    "#2a5a2a",
    "#0a1a0a",
  );

  // === VFX: Ethereal chains ===
  ctx.strokeStyle = `rgba(74, 222, 128, ${corruptionPulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let c = 0; c < 2; c++) {
    const chainSide = c === 0 ? -1 : 1;
    ctx.beginPath();
    for (let link = 0; link < 5; link++) {
      const linkX = cx + chainSide * (size * 0.2 + link * size * 0.05);
      const linkY =
        y -
        size * 0.1 -
        bodyBob +
        Math.sin(time * 4 + link * 0.5) * size * 0.015;
      ctx.arc(linkX, linkY, size * 0.012, 0, TAU);
    }
    ctx.stroke();
  }

  // Floating "F" letter grade
  ctx.save();
  const froshSymY =
    y - size * 0.72 - bodyBob + Math.sin(time * 2.5) * size * 0.03;
  ctx.translate(cx, froshSymY);
  ctx.rotate(Math.sin(time * 1.8) * 0.08);
  const fGlowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.1);
  fGlowGrad.addColorStop(0, `rgba(74, 222, 128, ${runeGlow * 0.4})`);
  fGlowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = fGlowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.1, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(120, 255, 160, ${0.8 + Math.sin(time * 3) * 0.2})`;
  ctx.font = `bold ${size * 0.12}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("F", 0, 0);
  ctx.restore();

  // Pulsing glow rings
  drawPulsingGlowRings(
    ctx,
    cx,
    y - size * 0.1 - bodyBob,
    size * 0.06,
    time,
    zoom,
    {
      color: "rgba(74, 222, 128, 0.5)",
      count: 3,
      speed: 2,
      maxAlpha: 0.35 + (isAttacking ? attackIntensity * 0.3 : 0),
      expansion: 1.8,
    },
  );

  // Floating rune shards
  drawShiftingSegments(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(74, 222, 128, 0.6)",
    colorAlt: "rgba(120, 255, 160, 0.5)",
    count: 5,
    orbitRadius: 0.4,
    segmentSize: 0.025,
    orbitSpeed: 1.2,
    shape: "shard",
  });

  // Eldritch sigil above head
  ctx.save();
  ctx.translate(
    cx,
    y - size * 0.65 - bodyBob + Math.sin(time * 2) * size * 0.02,
  );
  ctx.rotate(time * 0.5);
  setShadowBlur(ctx, 6 * zoom, corruptGreen);
  ctx.strokeStyle = `rgba(74, 222, 128, ${runeGlow * 0.5})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.06, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const angle = (i * TAU) / 3 - Math.PI / 2;
    if (i === 0)
      ctx.moveTo(Math.cos(angle) * size * 0.04, Math.sin(angle) * size * 0.04);
    else
      ctx.lineTo(Math.cos(angle) * size * 0.04, Math.sin(angle) * size * 0.04);
  }
  ctx.closePath();
  ctx.stroke();
  clearShadow(ctx);
  ctx.restore();

  // Visor glow
  setShadowBlur(ctx, 6 * zoom, corruptGreen);
  ctx.fillStyle = corruptGreen;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.06,
      headY + size * 0.01,
      size * 0.01,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);
}

// ============================================================================
// 2. SOPHOMORE — STORM ACOLYTE
//    Storm/lightning theme with blue-steel armor
// ============================================================================

export function drawSophomoreEnemy(
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
  const breath = getBreathScale(time, 1.5, 0.013);
  const sway = getIdleSway(time, 1.1, size * 0.003, size * 0.002);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#a8b8c8";
  const metalMid = "#708898";
  const metalDark = "#485868";
  const stormBlue = "#60a5fa";

  const magicPulse = 0.6 + Math.sin(time * 4) * 0.4 + attackIntensity * 0.4;
  const stormIntensity = 0.5 + Math.sin(time * 6) * 0.3 + attackIntensity * 0.5;
  const lightningFlash =
    Math.random() > 0.95 || isAttacking
      ? isAttacking
        ? attackIntensity
        : 1
      : 0;

  // === STORM AURA (behind body) ===
  const auraGrad = ctx.createRadialGradient(
    cx,
    y - bodyBob,
    0,
    cx,
    y - bodyBob,
    size * 0.75,
  );
  auraGrad.addColorStop(0, `rgba(59, 130, 246, ${magicPulse * 0.3})`);
  auraGrad.addColorStop(0.4, `rgba(96, 165, 250, ${magicPulse * 0.15})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(cx, y - bodyBob, size * 0.75, size * 0.5, 0, 0, TAU);
  ctx.fill();

  // Storm vortex rings
  for (let ring = 0; ring < 4; ring++) {
    const ringSize = size * 0.3 + ring * size * 0.1;
    ctx.strokeStyle = `rgba(96, 165, 250, ${(0.25 - ring * 0.05) * magicPulse})`;
    ctx.lineWidth = 1.5 * zoom;
    ctx.beginPath();
    ctx.arc(
      cx,
      y - bodyBob,
      ringSize,
      time * 2 + ring,
      time * 2 + ring + Math.PI * 1.5,
    );
    ctx.stroke();
  }

  // Lightning bolts
  if (lightningFlash || Math.sin(time * 15) > 0.85) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + Math.random() * 0.3})`;
    ctx.lineWidth = 1.5 * zoom;
    for (let bolt = 0; bolt < 2; bolt++) {
      const boltAngle = time * 3 + bolt * Math.PI;
      const startX = cx + Math.cos(boltAngle) * size * 0.35;
      const startY =
        y - size * 0.25 - bodyBob + Math.sin(boltAngle) * size * 0.15;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      let bx = startX,
        by = startY;
      for (let seg = 0; seg < 3; seg++) {
        bx += (Math.random() - 0.5) * size * 0.12;
        by += size * 0.07;
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
    }
  }

  // Storm cloud wisps
  for (let w = 0; w < 3; w++) {
    const wispX = cx + Math.sin(time * 1.5 + w * 1.5) * size * 0.3;
    const wispY =
      y - size * 0.5 - bodyBob + Math.cos(time * 1.2 + w) * size * 0.08;
    ctx.fillStyle = `rgba(100, 130, 170, ${0.25 + Math.sin(time * 3 + w) * 0.12})`;
    ctx.beginPath();
    ctx.ellipse(wispX, wispY, size * 0.07, size * 0.035, 0, 0, TAU);
    ctx.fill();
  }

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: metalDark,
    trimColor: "#1e3a5f",
    strideSpeed: 4.5,
    strideAmt: 0.25,
    legLen: 0.22,
    width: 0.1,
    footLen: 0.11,
    style: "armored",
  });

  // === CHAINMAIL SKIRT ===
  ctx.save();
  ctx.translate(cx, y - size * 0.02 - bodyBob);
  ctx.fillStyle = metalMid;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.04);
  ctx.lineTo(size * 0.22, -size * 0.04);
  ctx.lineTo(size * 0.2, size * 0.1);
  ctx.lineTo(-size * 0.2, size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 0.6 * zoom;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const lx = -size * 0.17 + col * size * 0.05 + (row % 2) * size * 0.025;
      const ly = -size * 0.02 + row * size * 0.035;
      ctx.beginPath();
      ctx.ellipse(lx, ly, size * 0.012, size * 0.008, 0, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = metalMid;
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 9; i++) {
    const fx = -size * 0.18 + i * size * 0.045;
    ctx.beginPath();
    ctx.arc(fx, size * 0.1 + size * 0.012, size * 0.008, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();

  // === CHAINMAIL HAUBERK with storm tabard ===
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.scale(breath, breath);

  const haubeGrad = ctx.createLinearGradient(
    -size * 0.3,
    -size * 0.22,
    size * 0.3,
    size * 0.22,
  );
  haubeGrad.addColorStop(0, metalDark);
  haubeGrad.addColorStop(0.3, metalMid);
  haubeGrad.addColorStop(0.5, metalLight);
  haubeGrad.addColorStop(0.7, metalMid);
  haubeGrad.addColorStop(1, metalDark);
  ctx.fillStyle = haubeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.26, size * 0.16);
  ctx.bezierCurveTo(
    -size * 0.28, size * 0.06,
    -size * 0.28, -size * 0.06,
    -size * 0.22, -size * 0.2,
  );
  ctx.bezierCurveTo(
    -size * 0.16, -size * 0.24,
    -size * 0.08, -size * 0.26,
    0, -size * 0.27,
  );
  ctx.bezierCurveTo(
    size * 0.08, -size * 0.26,
    size * 0.16, -size * 0.24,
    size * 0.22, -size * 0.2,
  );
  ctx.bezierCurveTo(
    size * 0.28, -size * 0.06,
    size * 0.28, size * 0.06,
    size * 0.26, size * 0.16,
  );
  ctx.closePath();
  ctx.fill();

  // Chainmail diamond link pattern overlay
  ctx.strokeStyle = "rgba(72, 88, 104, 0.5)";
  ctx.lineWidth = 0.5 * zoom;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 6; col++) {
      const mx = -size * 0.15 + col * size * 0.06 + (row % 2) * size * 0.03;
      const my = -size * 0.18 + row * size * 0.05;
      const nx = mx / (size * 0.24);
      const ny = my / (size * 0.2);
      if (nx * nx + ny * ny < 1) {
        ctx.beginPath();
        ctx.moveTo(mx, my - size * 0.012);
        ctx.lineTo(mx + size * 0.012, my);
        ctx.lineTo(mx, my + size * 0.012);
        ctx.lineTo(mx - size * 0.012, my);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  // Padded gambeson visible at neckline
  ctx.strokeStyle = "#3a4a5a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.16, -size * 0.2);
  ctx.quadraticCurveTo(0, -size * 0.23, size * 0.16, -size * 0.2);
  ctx.stroke();

  // Blue storm tabard
  const tabardGrad = ctx.createLinearGradient(
    -size * 0.12,
    -size * 0.2,
    size * 0.12,
    size * 0.15,
  );
  tabardGrad.addColorStop(0, "#0c1929");
  tabardGrad.addColorStop(0.3, "#1e3a5f");
  tabardGrad.addColorStop(0.7, "#2563eb");
  tabardGrad.addColorStop(1, "#0c1929");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.14, size * 0.14);
  ctx.lineTo(-size * 0.14, size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Lightning emblem on tabard
  ctx.strokeStyle = `rgba(147, 197, 253, ${stormIntensity * 0.7})`;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.03, -size * 0.15);
  ctx.lineTo(size * 0.01, -size * 0.06);
  ctx.lineTo(-size * 0.02, -size * 0.06);
  ctx.lineTo(size * 0.03, size * 0.05);
  ctx.stroke();

  ctx.restore();

  // === PADDED GAMBESON COLLAR ===
  ctx.save();
  ctx.translate(cx, y - size * 0.35 - bodyBob);
  const collarGrad = ctx.createLinearGradient(-size * 0.1, -size * 0.04, size * 0.1, size * 0.04);
  collarGrad.addColorStop(0, "#3a4a5a");
  collarGrad.addColorStop(0.5, "#5a6a7a");
  collarGrad.addColorStop(1, "#3a4a5a");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.13, size * 0.055, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(30, 50, 70, 0.4)";
  ctx.lineWidth = 0.6 * zoom;
  for (let s = 0; s < 5; s++) {
    const stitchX = -size * 0.08 + s * size * 0.04;
    ctx.beginPath();
    ctx.moveTo(stitchX, -size * 0.02);
    ctx.lineTo(stitchX, size * 0.04);
    ctx.stroke();
  }
  ctx.restore();

  // === CHAIN-LINK SHOULDER GUARDS ===
  for (const side of [-1, 1] as const) {
    const spX = cx + side * size * 0.26;
    const spY = y - size * 0.3 - bodyBob;
    ctx.fillStyle = metalMid;
    ctx.beginPath();
    ctx.ellipse(spX, spY, size * 0.065, size * 0.04, side * 0.3, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 0.5 * zoom;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const lx = spX + (c - 1) * size * 0.025 + (r % 2) * size * 0.012;
        const ly = spY + (r - 0.5) * size * 0.02;
        ctx.beginPath();
        ctx.ellipse(lx, ly, size * 0.008, size * 0.005, side * 0.3, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.ellipse(spX, spY, size * 0.065, size * 0.04, side * 0.3, 0, TAU);
    ctx.stroke();
  }

  // Crackling energy arcs between pauldron spikes
  if (stormIntensity > 0.5 || isAttacking) {
    ctx.strokeStyle = `rgba(147, 197, 253, ${stormIntensity * 0.6})`;
    ctx.lineWidth = 1.2 * zoom;
    for (let arc = 0; arc < 3; arc++) {
      const arcPhase = time * 8 + arc * 2.1;
      const arcSide = arc % 2 === 0 ? -1 : 1;
      const startPX = cx + arcSide * size * 0.26;
      const startPY = y - size * 0.32 - bodyBob;
      ctx.beginPath();
      ctx.moveTo(startPX, startPY);
      let arcX = startPX;
      let arcY = startPY;
      for (let seg = 0; seg < 3; seg++) {
        arcX += (Math.sin(arcPhase + seg * 1.7) * size * 0.04) * arcSide;
        arcY -= size * 0.025;
        ctx.lineTo(arcX, arcY);
      }
      ctx.stroke();
    }
    // Spark dots at pauldron tips
    for (const side of [-1, 1]) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() > 0.5 ? 0.8 : 0.3})`;
      ctx.beginPath();
      ctx.arc(
        cx + side * size * 0.26,
        y - size * 0.34 - bodyBob,
        size * 0.006,
        0,
        TAU,
      );
      ctx.fill();
    }
  }

  // === STUDDED LEATHER BELT ===
  const sophBeltY = y - size * 0.04 - bodyBob;
  ctx.fillStyle = "#3e3225";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, sophBeltY - size * 0.015);
  ctx.lineTo(cx + size * 0.22, sophBeltY - size * 0.015);
  ctx.lineTo(cx + size * 0.22, sophBeltY + size * 0.015);
  ctx.lineTo(cx - size * 0.22, sophBeltY + size * 0.015);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#2a2218";
  ctx.lineWidth = 0.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, sophBeltY - size * 0.015);
  ctx.lineTo(cx + size * 0.22, sophBeltY - size * 0.015);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, sophBeltY + size * 0.015);
  ctx.lineTo(cx + size * 0.22, sophBeltY + size * 0.015);
  ctx.stroke();
  ctx.fillStyle = metalMid;
  for (let s = 0; s < 7; s++) {
    const studX = cx - size * 0.18 + s * size * 0.06;
    ctx.beginPath();
    ctx.arc(studX, sophBeltY, size * 0.006, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = metalDark;
  ctx.fillRect(cx - size * 0.02, sophBeltY - size * 0.018, size * 0.04, size * 0.036);
  ctx.fillStyle = metalLight;
  ctx.fillRect(cx - size * 0.015, sophBeltY - size * 0.013, size * 0.03, size * 0.026);
  ctx.fillStyle = metalDark;
  ctx.fillRect(cx - size * 0.01, sophBeltY - size * 0.008, size * 0.02, size * 0.016);

  // Storm-charged belt buckle gem
  const buckleX = cx;
  const buckleY = y - size * 0.04 - bodyBob;
  ctx.fillStyle = `rgba(96, 165, 250, ${magicPulse * 0.7})`;
  ctx.beginPath();
  ctx.arc(buckleX, buckleY, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(219, 234, 254, ${magicPulse * 0.5})`;
  ctx.beginPath();
  ctx.arc(buckleX, buckleY, size * 0.008, 0, TAU);
  ctx.fill();
  // Tiny lightning from buckle
  if (Math.sin(time * 12) > 0.7) {
    ctx.strokeStyle = "rgba(219, 234, 254, 0.6)";
    ctx.lineWidth = 0.8 * zoom;
    for (let bl = 0; bl < 2; bl++) {
      const blAngle = time * 10 + bl * Math.PI;
      ctx.beginPath();
      ctx.moveTo(buckleX, buckleY);
      ctx.lineTo(
        buckleX + Math.cos(blAngle) * size * 0.025,
        buckleY + Math.sin(blAngle) * size * 0.015,
      );
      ctx.stroke();
    }
  }

  // === LEFT ARM — charged orb ===
  const sophForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: "#1e3a5f",
      upperLen: 0.16,
      foreLen: sophForeLen,
      width: 0.09,
      shoulderAngle: -0.7 + Math.sin(time * 3) * 0.06 + (isAttacking ? -attackIntensity * 0.3 : 0),
      elbowAngle: 0.6 + Math.sin(time * 3.5) * 0.08 + (isAttacking ? -attackIntensity * 0.2 : 0),
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = sophForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Charged storm orb
        wCtx.fillStyle = `rgba(59, 130, 246, ${magicPulse * 0.3})`;
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.06, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(147, 197, 253, ${magicPulse * 0.8})`;
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.035, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = "#dbeafe";
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.015, 0, TAU);
        wCtx.fill();
        // Mini lightning arcs
        wCtx.strokeStyle = "#fff";
        wCtx.lineWidth = 1 * zoom;
        for (let l = 0; l < 3; l++) {
          const lA = time * 8 + (l * TAU) / 3;
          wCtx.beginPath();
          wCtx.moveTo(0, 0);
          wCtx.lineTo(Math.cos(lA) * size * 0.04, Math.sin(lA) * size * 0.04);
          wCtx.stroke();
        }
      },
    },
  );

  // === RIGHT ARM — storm staff ===
  drawPathArm(
    ctx,
    cx + size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: "#1e3a5f",
      upperLen: 0.16,
      foreLen: sophForeLen,
      width: 0.09,
      shoulderAngle:
        0.4 +
        Math.sin(time * 2.5) * 0.08 +
        (isAttacking ? attackIntensity * 0.4 : 0),
      elbowAngle: 0.3 + Math.sin(time * 3) * 0.06,
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = sophForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Storm staff shaft
        wCtx.fillStyle = "#3b4a5a";
        wCtx.fillRect(-size * 0.012, -size * 0.25, size * 0.024, size * 0.25);
        // Metal bands on shaft
        wCtx.fillStyle = "#708898";
        wCtx.fillRect(-size * 0.016, -size * 0.08, size * 0.032, size * 0.006);
        wCtx.fillRect(-size * 0.016, -size * 0.15, size * 0.032, size * 0.006);
        wCtx.fillRect(-size * 0.016, -size * 0.2, size * 0.032, size * 0.006);
        // Staff crystal head (larger)
        wCtx.fillStyle = `rgba(59, 130, 246, ${magicPulse * 0.4})`;
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.31);
        wCtx.lineTo(-size * 0.035, -size * 0.25);
        wCtx.lineTo(0, -size * 0.2);
        wCtx.lineTo(size * 0.035, -size * 0.25);
        wCtx.closePath();
        wCtx.fill();
        // Inner crystal facets
        wCtx.fillStyle = `rgba(96, 165, 250, ${magicPulse})`;
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.29);
        wCtx.lineTo(-size * 0.025, -size * 0.25);
        wCtx.lineTo(0, -size * 0.22);
        wCtx.lineTo(size * 0.025, -size * 0.25);
        wCtx.closePath();
        wCtx.fill();
        // Crystal core bright spot
        wCtx.fillStyle = `rgba(219, 234, 254, ${stormIntensity * 0.8})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.255, size * 0.012, 0, TAU);
        wCtx.fill();
        // Staff tip glow halo
        wCtx.fillStyle = `rgba(96, 165, 250, ${stormIntensity * 0.3})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.255, size * 0.04, 0, TAU);
        wCtx.fill();
        // Mini lightning arcs from crystal to nearby space
        wCtx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.sin(time * 10) * 0.3})`;
        wCtx.lineWidth = size * 0.005;
        for (let la = 0; la < 4; la++) {
          const laAngle = time * 7 + (la * TAU) / 4;
          wCtx.beginPath();
          wCtx.moveTo(
            Math.cos(laAngle) * size * 0.02,
            -size * 0.255 + Math.sin(laAngle) * size * 0.02,
          );
          wCtx.lineTo(
            Math.cos(laAngle) * size * 0.055,
            -size * 0.255 + Math.sin(laAngle) * size * 0.04,
          );
          wCtx.stroke();
        }
      },
    },
  );

  // === HEAD — Winged Valkyrie storm helm ===
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;
  const helmAttackGlow = (isAttacking ? attackIntensity : 0) * 0.5;

  // Hair under helm (rear silhouette)
  ctx.fillStyle = "#2a1a08";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY + size * 0.02);
  ctx.quadraticCurveTo(headX, headY - size * 0.14, headX + size * 0.1, headY + size * 0.02);
  ctx.quadraticCurveTo(headX, headY - size * 0.02, headX - size * 0.1, headY + size * 0.02);
  ctx.fill();

  let wingTipLX = headX - size * 0.2;
  let wingTipLY = headY - size * 0.2;
  let wingTipRX = headX + size * 0.2;
  let wingTipRY = headY - size * 0.2;

  // Swept-back wing feathers (metal, behind helm bowl)
  for (const wSide of [-1, 1] as const) {
    const sx = wSide;
    const wingGrad = ctx.createLinearGradient(
      headX + sx * size * 0.06,
      headY - size * 0.1,
      headX + sx * size * 0.28,
      headY - size * 0.24,
    );
    wingGrad.addColorStop(0, metalDark);
    wingGrad.addColorStop(0.35, metalMid);
    wingGrad.addColorStop(0.55, metalLight);
    wingGrad.addColorStop(0.78, metalMid);
    wingGrad.addColorStop(1, metalDark);
    ctx.fillStyle = wingGrad;
    const featherSpecs: [number, number, number, number][] = [
      [0.09, -0.02, 0.2, -0.16],
      [0.1, -0.05, 0.23, -0.19],
      [0.11, -0.08, 0.25, -0.22],
      [0.1, -0.11, 0.22, -0.25],
      [0.08, -0.13, 0.18, -0.27],
    ];
    for (let fi = 0; fi < featherSpecs.length; fi++) {
      const [bx, by, tx, ty] = featherSpecs[fi];
      const bxx = headX + sx * size * bx;
      const byy = headY + size * by;
      const txx = headX + sx * size * tx;
      const tyy = headY + size * ty;
      const perp = size * 0.018 * (1 - fi * 0.12);
      ctx.beginPath();
      ctx.moveTo(bxx, byy);
      ctx.lineTo(bxx + sx * perp, byy - size * 0.02);
      ctx.lineTo(txx, tyy);
      ctx.lineTo(bxx - sx * perp, byy - size * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = metalDark;
      ctx.lineWidth = 0.45 * zoom;
      ctx.stroke();
      if (fi === featherSpecs.length - 1) {
        if (sx < 0) {
          wingTipLX = txx;
          wingTipLY = tyy;
        } else {
          wingTipRX = txx;
          wingTipRY = tyy;
        }
      }
    }
  }

  // Storm crackle between wing tips
  const bridgeAlpha = (0.35 + stormIntensity * 0.35 + helmAttackGlow) * (0.7 + Math.sin(time * 9) * 0.3);
  setShadowBlur(ctx, (5 + helmAttackGlow * 8) * zoom, stormBlue);
  ctx.strokeStyle = `rgba(96, 165, 250, ${bridgeAlpha})`;
  ctx.lineWidth = (1.2 + helmAttackGlow) * zoom;
  ctx.beginPath();
  ctx.moveTo(wingTipLX, wingTipLY);
  const midX = headX;
  const midY = headY - size * 0.2 + Math.sin(time * 11) * size * 0.012;
  ctx.quadraticCurveTo(midX - size * 0.02, midY, wingTipRX, wingTipRY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wingTipLX, wingTipLY);
  ctx.lineTo(midX, midY + size * 0.015);
  ctx.lineTo(wingTipRX, wingTipRY);
  ctx.stroke();
  clearShadow(ctx);

  // Lower jaw / chin (skin, below helm)
  const jawGrad = ctx.createRadialGradient(
    headX,
    headY + size * 0.07,
    0,
    headX,
    headY + size * 0.04,
    size * 0.09,
  );
  jawGrad.addColorStop(0, "#d4b896");
  jawGrad.addColorStop(0.65, "#b09070");
  jawGrad.addColorStop(1, "#8a6a50");
  ctx.fillStyle = jawGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.07, size * 0.08, size * 0.055, 0, 0, TAU);
  ctx.fill();

  // Full iron helm bowl (upper head)
  const helmGrad = ctx.createRadialGradient(
    headX,
    headY - size * 0.06,
    size * 0.02,
    headX,
    headY - size * 0.02,
    size * 0.2,
  );
  helmGrad.addColorStop(0, metalLight);
  helmGrad.addColorStop(0.45, metalMid);
  helmGrad.addColorStop(1, metalDark);
  ctx.fillStyle = helmGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.13, headY + size * 0.06);
  ctx.bezierCurveTo(
    headX - size * 0.15,
    headY - size * 0.08,
    headX - size * 0.12,
    headY - size * 0.18,
    headX,
    headY - size * 0.19,
  );
  ctx.bezierCurveTo(
    headX + size * 0.12,
    headY - size * 0.18,
    headX + size * 0.15,
    headY - size * 0.08,
    headX + size * 0.13,
    headY + size * 0.06,
  );
  ctx.quadraticCurveTo(headX, headY + size * 0.04, headX - size * 0.13, headY + size * 0.06);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Brow ridge (horizontal bar of T)
  ctx.fillStyle = metalMid;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.12, headY - size * 0.04);
  ctx.lineTo(headX + size * 0.12, headY - size * 0.04);
  ctx.lineTo(headX + size * 0.11, headY - size * 0.01);
  ctx.lineTo(headX - size * 0.11, headY - size * 0.01);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();

  // Central storm gem on brow
  setShadowBlur(ctx, (4 + helmAttackGlow * 6) * zoom, stormBlue);
  ctx.fillStyle = stormBlue;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.025, size * 0.014, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(219, 234, 254, ${0.4 + stormIntensity * 0.45 + helmAttackGlow})`;
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.025, size * 0.006, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Nasal guard (vertical bar of T)
  const nasalGrad = ctx.createLinearGradient(headX, headY - size * 0.02, headX, headY + size * 0.1);
  nasalGrad.addColorStop(0, metalLight);
  nasalGrad.addColorStop(0.5, metalMid);
  nasalGrad.addColorStop(1, metalDark);
  ctx.fillStyle = nasalGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.022, headY - size * 0.02);
  ctx.lineTo(headX + size * 0.022, headY - size * 0.02);
  ctx.lineTo(headX + size * 0.016, headY + size * 0.1);
  ctx.lineTo(headX - size * 0.016, headY + size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Eye slits with electric glow
  const slitGlow = 3 + stormIntensity * 4 + helmAttackGlow * 6;
  for (const eSide of [-1, 1]) {
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(
      headX + eSide * size * 0.055,
      headY + size * 0.015,
      size * 0.028,
      size * 0.009,
      0,
      0,
      TAU,
    );
    ctx.fill();
    setShadowBlur(ctx, slitGlow * zoom, stormBlue);
    ctx.fillStyle = `rgba(96, 165, 250, ${0.55 + stormIntensity * 0.35 + helmAttackGlow})`;
    ctx.beginPath();
    ctx.ellipse(
      headX + eSide * size * 0.055,
      headY + size * 0.015,
      size * 0.018,
      size * 0.004,
      0,
      0,
      TAU,
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // Lightning arcs: wing tips ↔ helm crown
  const crownX = headX;
  const crownY = headY - size * 0.17;
  const arcAlpha = 0.45 + stormIntensity * 0.35 + helmAttackGlow;
  if (Math.sin(time * 13) > 0.25 || isAttacking) {
    ctx.strokeStyle = `rgba(147, 197, 253, ${arcAlpha * (0.65 + Math.random() * 0.35)})`;
    ctx.lineWidth = (0.9 + helmAttackGlow) * zoom;
    for (const tip of [
      [wingTipLX, wingTipLY],
      [wingTipRX, wingTipRY],
    ] as const) {
      ctx.beginPath();
      ctx.moveTo(tip[0], tip[1]);
      let ax = tip[0] + (crownX - tip[0]) * 0.35;
      let ay = tip[1] + (crownY - tip[1]) * 0.4 + Math.sin(time * 16) * size * 0.02;
      ctx.lineTo(ax, ay);
      ax += (Math.random() - 0.5) * size * 0.04;
      ay += (crownY - ay) * 0.5;
      ctx.lineTo(ax, ay);
      ctx.lineTo(crownX, crownY);
      ctx.stroke();
    }
    setShadowBlur(ctx, 3 * zoom, stormBlue);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + helmAttackGlow * 0.5})`;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(wingTipLX, wingTipLY);
    ctx.lineTo(crownX, crownY);
    ctx.moveTo(wingTipRX, wingTipRY);
    ctx.lineTo(crownX, crownY);
    ctx.stroke();
    clearShadow(ctx);
  }

  // === VFX ===
  // Massive storm orb (hovering above off-hand)
  const orbX = cx - size * 0.15;
  const orbY = y - size * 0.6 - bodyBob + Math.sin(time * 2) * size * 0.02;
  setShadowBlur(ctx, 8 * zoom, stormBlue);
  ctx.fillStyle = `rgba(96, 165, 250, ${magicPulse * 0.7})`;
  ctx.beginPath();
  ctx.arc(orbX, orbY, size * 0.08, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#dbeafe";
  ctx.beginPath();
  ctx.arc(orbX, orbY, size * 0.03, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Energy rings around orb
  ctx.strokeStyle = `rgba(147, 197, 253, ${magicPulse * 0.6})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 3; i++) {
    const wAngle = time * 5 + i * Math.PI * 0.67;
    ctx.beginPath();
    ctx.arc(
      orbX,
      orbY,
      size * 0.1 + i * size * 0.02,
      wAngle,
      wAngle + Math.PI * 0.5,
    );
    ctx.stroke();
  }

  // Floating storm fragments
  drawShiftingSegments(ctx, cx, y - size * 0.15 - bodyBob, size, time, zoom, {
    color: "rgba(96, 165, 250, 0.5)",
    colorAlt: "rgba(147, 197, 253, 0.4)",
    count: 5,
    orbitRadius: 0.38,
    segmentSize: 0.022,
    orbitSpeed: 2.0,
    shape: "diamond",
  });

  // Visor glow
  setShadowBlur(ctx, 6 * zoom, stormBlue);
  ctx.fillStyle = stormBlue;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.06,
      headY + size * 0.01,
      size * 0.01,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);
}

// ============================================================================
// 3. JUNIOR — SCROLL KNIGHT
//    Floating books/paper theme with parchment-colored leather & brass armor
// ============================================================================

export function drawJuniorEnemy(
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
  const breath = getBreathScale(time, 1.4, 0.012);
  const sway = getIdleSway(time, 0.9, size * 0.003, size * 0.002);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#d8c8a0";
  const metalMid = "#b0a078";
  const metalDark = "#887858";
  const brassAccent = "#c8a850";
  const inkPurple = "#6b21a8";

  const madnessPulse = 0.5 + Math.sin(time * 5) * 0.3 + attackIntensity * 0.4;
  const realityTear = 0.4 + Math.sin(time * 7) * 0.3 + attackIntensity * 0.4;
  const bookFloat =
    Math.sin(time * 2) * 3 + (isAttacking ? attackIntensity * 5 : 0);

  // === PAPER/INK AURA (behind body) ===
  const auraGrad = ctx.createRadialGradient(
    cx,
    y - bodyBob,
    0,
    cx,
    y - bodyBob,
    size * 0.7,
  );
  auraGrad.addColorStop(0, `rgba(139, 92, 246, ${madnessPulse * 0.25})`);
  auraGrad.addColorStop(0.4, `rgba(192, 132, 252, ${madnessPulse * 0.12})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(cx, y - bodyBob, size * 0.7, size * 0.45, 0, 0, TAU);
  ctx.fill();

  // Reality fractures
  ctx.strokeStyle = `rgba(147, 51, 234, ${realityTear * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let f = 0; f < 4; f++) {
    const fAngle = time * 0.5 + f * Math.PI * 0.5;
    const fLen = size * (0.25 + Math.sin(time * 2 + f) * 0.08);
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(fAngle) * size * 0.25,
      y - bodyBob + Math.sin(fAngle) * size * 0.15,
    );
    for (let seg = 0; seg < 3; seg++) {
      ctx.lineTo(
        cx +
          Math.cos(fAngle) * (size * 0.25 + seg * fLen * 0.3) +
          (Math.random() - 0.5) * size * 0.04,
        y - bodyBob + Math.sin(fAngle) * (size * 0.15 + seg * fLen * 0.15),
      );
    }
    ctx.stroke();
  }

  // Floating tomes orbiting
  for (let i = 0; i < 4; i++) {
    const bookAngle = time * 1.2 + i * Math.PI * 0.5;
    const bookDist = size * 0.5 + Math.sin(time * 1.5 + i) * size * 0.06;
    const bx = cx + Math.cos(bookAngle) * bookDist;
    const by =
      y -
      size * 0.08 -
      bodyBob +
      Math.sin(bookAngle) * bookDist * 0.35 +
      bookFloat;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.sin(time * 2.5 + i) * 0.2);
    ctx.fillStyle = ["#2a0a3a", "#0a1a3a", "#3a0a2a", "#1a0a2a"][i];
    ctx.fillRect(-size * 0.05, -size * 0.06, size * 0.1, size * 0.12);
    ctx.fillStyle = "#fef9c3";
    ctx.fillRect(-size * 0.04, -size * 0.05, size * 0.08, size * 0.1);
    ctx.fillStyle = `rgba(220, 180, 255, ${madnessPulse * 0.7})`;
    ctx.font = `${size * 0.04}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(["◈", "⍟", "⌬", "☆"][i], 0, size * 0.01);
    ctx.restore();
  }

  // Floating text fragments
  ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.4})`;
  ctx.font = `${size * 0.035}px serif`;
  for (let t = 0; t < 4; t++) {
    const textX = cx + Math.sin(time * 1.5 + t * 1.2) * size * 0.4;
    const textY =
      y - size * 0.15 - bodyBob + Math.cos(time * 0.8 + t) * size * 0.25;
    ctx.save();
    ctx.translate(textX, textY);
    ctx.rotate(Math.sin(time * 2 + t) * 0.25);
    ctx.fillText(["truth", "KNOW", "see", "∞"][t], 0, 0);
    ctx.restore();
  }

  // Floating ink splatters around body
  for (let i = 0; i < 6; i++) {
    const inkAngle = time * 1.3 + i * TAU / 6;
    const inkDist = size * 0.35 + Math.sin(time * 2 + i) * size * 0.08;
    const inkX = cx + Math.cos(inkAngle) * inkDist;
    const inkY =
      y - size * 0.1 - bodyBob + Math.sin(inkAngle) * inkDist * 0.35;
    const inkSize = size * 0.012 + Math.sin(time * 4 + i) * size * 0.005;
    ctx.fillStyle = `rgba(30, 10, 50, ${0.3 + Math.sin(time * 3 + i) * 0.15})`;
    ctx.beginPath();
    ctx.arc(inkX, inkY, inkSize, 0, TAU);
    ctx.fill();
    // Smaller satellite droplets
    ctx.fillStyle = `rgba(107, 33, 168, ${0.2 + Math.sin(time * 5 + i) * 0.1})`;
    ctx.beginPath();
    ctx.arc(
      inkX + Math.cos(time * 6 + i) * size * 0.015,
      inkY + Math.sin(time * 6 + i) * size * 0.01,
      size * 0.005,
      0,
      TAU,
    );
    ctx.fill();
  }

  // Ink drip trails
  ctx.strokeStyle = `rgba(30, 10, 50, ${0.2 + Math.sin(time * 2) * 0.1})`;
  ctx.lineWidth = 1 * zoom;
  for (let d = 0; d < 3; d++) {
    const dripX = cx + (d - 1) * size * 0.15;
    const dripStartY = y - size * 0.2 - bodyBob;
    const dripPhase = (time * 1.5 + d * 0.8) % 2;
    ctx.beginPath();
    ctx.moveTo(dripX, dripStartY);
    ctx.quadraticCurveTo(
      dripX + Math.sin(time * 3 + d) * size * 0.02,
      dripStartY + dripPhase * size * 0.12,
      dripX,
      dripStartY + dripPhase * size * 0.2,
    );
    ctx.stroke();
  }

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: metalDark,
    trimColor: brassAccent,
    strideSpeed: 5,
    strideAmt: 0.28,
    legLen: 0.22,
    width: 0.1,
    footLen: 0.11,
    style: "armored",
  });

  // === PARCHMENT-STRIP WAIST WRAP ===
  ctx.save();
  ctx.translate(cx, y - size * 0.02 - bodyBob);
  const parchWrapW = size * 0.2;
  const parchStripCount = 7;
  for (let i = 0; i < parchStripCount; i++) {
    const stripAngle = ((i / parchStripCount) - 0.5) * Math.PI * 0.7;
    const sx = Math.sin(stripAngle) * parchWrapW;
    const stripLen = size * (0.1 + Math.sin(time * 2 + i) * 0.015);
    const stripW = size * 0.028;
    const stripSway = Math.sin(time * 3 + i * 1.1) * size * 0.008;
    const stripGrad = ctx.createLinearGradient(sx, 0, sx + stripSway, stripLen);
    stripGrad.addColorStop(0, "#c8a850");
    stripGrad.addColorStop(0.3, "#f0e8c8");
    stripGrad.addColorStop(0.7, "#e8d8b0");
    stripGrad.addColorStop(1, "#d8c8a0");
    ctx.fillStyle = stripGrad;
    ctx.beginPath();
    ctx.moveTo(sx - stripW * 0.5, 0);
    ctx.lineTo(sx + stripW * 0.5, 0);
    ctx.quadraticCurveTo(sx + stripW * 0.4 + stripSway, stripLen * 0.6, sx + stripSway, stripLen);
    ctx.quadraticCurveTo(sx - stripW * 0.4 + stripSway, stripLen * 0.6, sx - stripW * 0.5, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(136, 120, 88, 0.4)";
    ctx.lineWidth = 0.5 * zoom;
    ctx.stroke();
  }
  const wrapBand = ctx.createLinearGradient(-parchWrapW, 0, parchWrapW, 0);
  wrapBand.addColorStop(0, metalDark);
  wrapBand.addColorStop(0.5, "#8b6914");
  wrapBand.addColorStop(1, metalDark);
  ctx.fillStyle = wrapBand;
  ctx.fillRect(-parchWrapW, -size * 0.015, parchWrapW * 2, size * 0.03);
  ctx.restore();

  // === LEATHER JERKIN with parchment tabard ===
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.scale(breath, breath);

  // Leather jerkin body
  const jerkinGrad = ctx.createLinearGradient(
    -size * 0.3, -size * 0.22, size * 0.3, size * 0.22,
  );
  jerkinGrad.addColorStop(0, "#5c3a1e");
  jerkinGrad.addColorStop(0.25, "#7a5230");
  jerkinGrad.addColorStop(0.5, "#8b6914");
  jerkinGrad.addColorStop(0.75, "#7a5230");
  jerkinGrad.addColorStop(1, "#5c3a1e");
  ctx.fillStyle = jerkinGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.24, size * 0.16);
  ctx.bezierCurveTo(
    -size * 0.28, size * 0.06,
    -size * 0.3, -size * 0.06,
    -size * 0.22, -size * 0.2,
  );
  ctx.bezierCurveTo(
    -size * 0.16, -size * 0.24,
    -size * 0.08, -size * 0.26,
    0, -size * 0.27,
  );
  ctx.bezierCurveTo(
    size * 0.08, -size * 0.26,
    size * 0.16, -size * 0.24,
    size * 0.22, -size * 0.2,
  );
  ctx.bezierCurveTo(
    size * 0.3, -size * 0.06,
    size * 0.28, size * 0.06,
    size * 0.24, size * 0.16,
  );
  ctx.closePath();
  ctx.fill();

  // Leather stitching lines
  ctx.strokeStyle = "#4a2e14";
  ctx.lineWidth = 0.8 * zoom;
  ctx.setLineDash([size * 0.012, size * 0.008]);
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.22);
  ctx.lineTo(-size * 0.14, size * 0.14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.14, size * 0.14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.1);
  ctx.quadraticCurveTo(0, -size * 0.06, size * 0.2, -size * 0.1);
  ctx.stroke();
  ctx.setLineDash([]);

  // Leather collar seam
  ctx.strokeStyle = "#4a2e14";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.18);
  ctx.quadraticCurveTo(0, -size * 0.22, size * 0.2, -size * 0.18);
  ctx.stroke();

  // Parchment tabard with ink stains
  const tabardGrad = ctx.createLinearGradient(
    -size * 0.12,
    -size * 0.2,
    size * 0.12,
    size * 0.15,
  );
  tabardGrad.addColorStop(0, "#e8d8b0");
  tabardGrad.addColorStop(0.3, "#f0e8c8");
  tabardGrad.addColorStop(0.7, "#f0e8c8");
  tabardGrad.addColorStop(1, "#d8c8a0");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.14, size * 0.14);
  ctx.lineTo(-size * 0.14, size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Ink stains on tabard
  ctx.fillStyle = "rgba(30, 10, 50, 0.4)";
  ctx.beginPath();
  ctx.ellipse(size * 0.04, -size * 0.05, size * 0.03, size * 0.04, 0.3, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(
    -size * 0.05,
    size * 0.06,
    size * 0.025,
    size * 0.035,
    -0.2,
    0,
    TAU,
  );
  ctx.fill();

  // Arcane symbol on tabard
  ctx.fillStyle = `rgba(147, 51, 234, ${madnessPulse * 0.6})`;
  ctx.font = `${size * 0.07}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("⌬", 0, -size * 0.04);

  ctx.restore();

  // === HIGH LEATHER COLLAR ===
  ctx.save();
  ctx.translate(cx, y - size * 0.35 - bodyBob);
  const collarW = size * 0.2;
  const collarH = size * 0.06;
  const collarGrad = ctx.createLinearGradient(0, -collarH, 0, collarH);
  collarGrad.addColorStop(0, "#5c3a1e");
  collarGrad.addColorStop(0.5, "#7a5230");
  collarGrad.addColorStop(1, "#4a2e14");
  ctx.fillStyle = collarGrad;
  ctx.beginPath();
  ctx.moveTo(-collarW, collarH * 0.5);
  ctx.quadraticCurveTo(-collarW * 0.9, -collarH * 1.2, -collarW * 0.3, -collarH * 1.4);
  ctx.quadraticCurveTo(0, -collarH * 1.6, collarW * 0.3, -collarH * 1.4);
  ctx.quadraticCurveTo(collarW * 0.9, -collarH * 1.2, collarW, collarH * 0.5);
  ctx.quadraticCurveTo(collarW * 0.5, collarH * 0.8, 0, collarH);
  ctx.quadraticCurveTo(-collarW * 0.5, collarH * 0.8, -collarW, collarH * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4a2e14";
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();
  // Brass button clasp
  ctx.fillStyle = brassAccent;
  ctx.beginPath();
  ctx.arc(0, -collarH * 0.5, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 0.5 * zoom;
  ctx.stroke();
  ctx.restore();

  // === SCROLL-TUBE SHOULDER GUARDS ===
  for (const side of [-1, 1] as const) {
    ctx.save();
    const shX = cx + side * size * 0.26;
    const shY = y - size * 0.3 - bodyBob;
    ctx.translate(shX, shY);
    ctx.rotate(side * 0.25);
    const tubeW = size * 0.05;
    const tubeH = size * 0.12;
    // Tube body
    const tubeGrad = ctx.createLinearGradient(-tubeW, 0, tubeW, 0);
    tubeGrad.addColorStop(0, "#5c3a1e");
    tubeGrad.addColorStop(0.3, "#8b6914");
    tubeGrad.addColorStop(0.7, "#7a5230");
    tubeGrad.addColorStop(1, "#5c3a1e");
    ctx.fillStyle = tubeGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, tubeW, tubeH * 0.5, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#4a2e14";
    ctx.lineWidth = 0.7 * zoom;
    ctx.stroke();
    // End caps (brass)
    ctx.fillStyle = brassAccent;
    ctx.beginPath();
    ctx.ellipse(0, -tubeH * 0.48, tubeW * 0.7, size * 0.012, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, tubeH * 0.48, tubeW * 0.7, size * 0.012, 0, 0, TAU);
    ctx.fill();
    // Leather straps
    ctx.strokeStyle = "#4a2e14";
    ctx.lineWidth = size * 0.008;
    ctx.beginPath();
    ctx.moveTo(-tubeW * 0.5, -tubeH * 0.2);
    ctx.lineTo(-tubeW * 1.2, tubeH * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tubeW * 0.5, -tubeH * 0.2);
    ctx.lineTo(tubeW * 1.2, tubeH * 0.3);
    ctx.stroke();
    // Parchment peeking out top
    ctx.fillStyle = "#f0e8c8";
    ctx.beginPath();
    ctx.moveTo(-tubeW * 0.3, -tubeH * 0.5);
    ctx.quadraticCurveTo(0, -tubeH * 0.7, tubeW * 0.3, -tubeH * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // === BOOK-STRAP BANDOLIER BELT ===
  ctx.save();
  ctx.translate(cx, y - size * 0.04 - bodyBob);
  const bandW = size * 0.22;
  // Main leather belt
  ctx.fillStyle = "#4a2e14";
  ctx.fillRect(-bandW, -size * 0.015, bandW * 2, size * 0.03);
  // Diagonal strap across chest
  ctx.strokeStyle = "#5c3a1e";
  ctx.lineWidth = size * 0.018;
  ctx.beginPath();
  ctx.moveTo(-bandW * 0.8, -size * 0.015);
  ctx.lineTo(bandW * 0.4, -size * 0.28);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bandW * 0.8, -size * 0.015);
  ctx.lineTo(-bandW * 0.4, -size * 0.28);
  ctx.stroke();
  // Brass buckle
  ctx.fillStyle = brassAccent;
  ctx.fillRect(-size * 0.02, -size * 0.02, size * 0.04, size * 0.04);
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 0.6 * zoom;
  ctx.strokeRect(-size * 0.02, -size * 0.02, size * 0.04, size * 0.04);
  // Small hanging book pouches
  for (const bSide of [-1, 0.5] as const) {
    const bpX = bSide * bandW * 0.6;
    ctx.fillStyle = "#3a0a2a";
    ctx.fillRect(bpX - size * 0.02, size * 0.015, size * 0.04, size * 0.05);
    ctx.fillStyle = "#fef9c3";
    ctx.fillRect(bpX - size * 0.015, size * 0.02, size * 0.03, size * 0.04);
  }
  ctx.restore();

  // === LEFT ARM — enchanted shield-book ===
  const junForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: brassAccent,
      upperLen: 0.16,
      foreLen: junForeLen,
      width: 0.09,
      shoulderAngle: -0.5 + Math.sin(time * 2) * 0.05 + (isAttacking ? -attackIntensity * 0.3 : 0),
      elbowAngle: 0.8 + Math.sin(time * 2.5) * 0.05 + (isAttacking ? -attackIntensity * 0.2 : 0),
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = junForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Shield-book cover (open book used as shield)
        wCtx.fillStyle = "#3a0a2a";
        wCtx.fillRect(-size * 0.07, -size * 0.08, size * 0.14, size * 0.16);
        // Spine
        wCtx.fillStyle = "#2a0520";
        wCtx.fillRect(-size * 0.072, -size * 0.06, size * 0.012, size * 0.12);
        // Pages with parchment color
        wCtx.fillStyle = "#fef9c3";
        wCtx.fillRect(-size * 0.06, -size * 0.07, size * 0.12, size * 0.14);
        // Page-turning animation (animated page flap)
        const pageFlip = Math.sin(time * 4) * 0.5 + 0.5;
        wCtx.fillStyle = `rgba(254, 249, 195, ${0.6 + pageFlip * 0.3})`;
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.07);
        wCtx.quadraticCurveTo(
          size * 0.04 * pageFlip,
          -size * 0.02,
          0,
          size * 0.07,
        );
        wCtx.lineTo(size * 0.06, size * 0.07);
        wCtx.lineTo(size * 0.06, -size * 0.07);
        wCtx.closePath();
        wCtx.fill();
        // Text lines on visible page
        wCtx.fillStyle = "rgba(30, 10, 50, 0.3)";
        for (let tl = 0; tl < 5; tl++) {
          wCtx.fillRect(
            -size * 0.05,
            -size * 0.05 + tl * size * 0.02,
            size * 0.04 + Math.sin(time * 2 + tl) * size * 0.01,
            size * 0.004,
          );
        }
        // Protective rune glow
        wCtx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.5})`;
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.04, 0, TAU);
        wCtx.fill();
        // Rune symbol on page
        wCtx.fillStyle = `rgba(147, 51, 234, ${madnessPulse * 0.7})`;
        wCtx.font = `${size * 0.035}px serif`;
        wCtx.textAlign = "center";
        wCtx.fillText("⌬", 0, 0);
        // Shield rim (brass) with corner bosses
        wCtx.strokeStyle = brassAccent;
        wCtx.lineWidth = 2 * zoom;
        wCtx.strokeRect(-size * 0.07, -size * 0.08, size * 0.14, size * 0.16);
        wCtx.fillStyle = brassAccent;
        for (const cx2 of [-1, 1]) {
          for (const cy2 of [-1, 1]) {
            wCtx.beginPath();
            wCtx.arc(
              cx2 * size * 0.06,
              cy2 * size * 0.065,
              size * 0.008,
              0,
              TAU,
            );
            wCtx.fill();
          }
        }
      },
    },
  );

  // === RIGHT ARM — quill-blade ===
  drawPathArm(
    ctx,
    cx + size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: brassAccent,
      upperLen: 0.16,
      foreLen: junForeLen,
      width: 0.09,
      shoulderAngle:
        0.6 +
        Math.sin(time * 2.8) * 0.08 +
        (isAttacking ? attackIntensity * 0.5 : 0),
      elbowAngle: 0.3 + Math.sin(time * 3.2) * 0.06,
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = junForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Quill-blade: feather-sword hybrid (main blade)
        wCtx.fillStyle = "#1e1b4b";
        wCtx.beginPath();
        wCtx.moveTo(0, 0);
        wCtx.quadraticCurveTo(
          size * 0.06,
          -size * 0.12,
          size * 0.015,
          -size * 0.28,
        );
        wCtx.quadraticCurveTo(-size * 0.015, -size * 0.15, 0, 0);
        wCtx.fill();
        // Feather barbs along blade
        wCtx.strokeStyle = `rgba(107, 33, 168, 0.5)`;
        wCtx.lineWidth = size * 0.004;
        for (let fb = 0; fb < 6; fb++) {
          const barbY = -size * 0.04 - fb * size * 0.035;
          const barbDir = fb % 2 === 0 ? 1 : -1;
          wCtx.beginPath();
          wCtx.moveTo(0, barbY);
          wCtx.lineTo(
            barbDir * size * 0.035,
            barbY - size * 0.015,
          );
          wCtx.stroke();
        }
        // Quill rachis (central shaft line)
        wCtx.strokeStyle = "#3b0764";
        wCtx.lineWidth = size * 0.005;
        wCtx.beginPath();
        wCtx.moveTo(0, 0);
        wCtx.lineTo(size * 0.01, -size * 0.28);
        wCtx.stroke();
        // Blade edge (metallic)
        wCtx.fillStyle = brassAccent;
        wCtx.beginPath();
        wCtx.moveTo(0, size * 0.01);
        wCtx.lineTo(-size * 0.008, -size * 0.06);
        wCtx.lineTo(size * 0.008, -size * 0.06);
        wCtx.closePath();
        wCtx.fill();
        // Cross-guard with ink-well motif
        wCtx.fillStyle = "#4a3060";
        wCtx.fillRect(-size * 0.02, -size * 0.005, size * 0.04, size * 0.008);
        // Dripping ink (multiple drops)
        for (let dd = 0; dd < 2; dd++) {
          wCtx.fillStyle = `rgba(147, 51, 234, ${madnessPulse * 0.8})`;
          const dripPhase = (time * 3 + dd * 0.5) % 1;
          wCtx.beginPath();
          wCtx.arc(
            dd * size * 0.008 - size * 0.004,
            size * 0.01 + dripPhase * size * 0.06,
            size * 0.008 * (1 - dripPhase * 0.5),
            0,
            TAU,
          );
          wCtx.fill();
        }
        // Ink trail shimmer on blade
        wCtx.fillStyle = `rgba(192, 132, 252, ${0.2 + Math.sin(time * 5) * 0.1})`;
        wCtx.beginPath();
        wCtx.moveTo(size * 0.01, -size * 0.08);
        wCtx.lineTo(size * 0.03, -size * 0.14);
        wCtx.lineTo(size * 0.015, -size * 0.2);
        wCtx.lineTo(size * 0.005, -size * 0.14);
        wCtx.closePath();
        wCtx.fill();
      },
    },
  );

  // === HEAD — Face + tall parchment wizard hat (no plume) ===
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;
  // Face
  const junFaceGrad = ctx.createRadialGradient(headX, headY + size * 0.01, 0, headX, headY, size * 0.14);
  junFaceGrad.addColorStop(0, "#e0c8a8");
  junFaceGrad.addColorStop(0.7, "#c4a880");
  junFaceGrad.addColorStop(1, "#a08060");
  ctx.fillStyle = junFaceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.14, 0, TAU);
  ctx.fill();
  // Scholarly spectacles (round wire frames)
  ctx.strokeStyle = brassAccent;
  ctx.lineWidth = 1.5 * zoom;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.05, headY - size * 0.005, size * 0.025, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = `rgba(192, 132, 252, ${madnessPulse * 0.15})`;
    ctx.fill();
    // Eyes behind lenses
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(headX + eSide * size * 0.05, headY - size * 0.005, size * 0.015, size * 0.012, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = inkPurple;
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.05, headY - size * 0.005, size * 0.007, 0, TAU);
    ctx.fill();
  }
  // Bridge of spectacles
  ctx.strokeStyle = brassAccent;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.025, headY - size * 0.005);
  ctx.lineTo(headX + size * 0.025, headY - size * 0.005);
  ctx.stroke();
  // Slight frown
  ctx.strokeStyle = "#7a5a40";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.03, headY + size * 0.055);
  ctx.quadraticCurveTo(headX, headY + size * 0.06, headX + size * 0.03, headY + size * 0.055);
  ctx.stroke();

  // --- Tall crooked parchment wizard hat (replaces beret + plume) ---
  const brimY = headY - size * 0.13;
  const brimRx = size * 0.27;
  const brimRy = size * 0.056;
  const tipX =
    headX +
    size * 0.072 +
    Math.sin(time * 1.05) * size * 0.026 +
    size * 0.04;
  const tipY = headY - size * 0.45;
  const coneBaseY = brimY - brimRy * 0.35;
  const coneL = headX - size * 0.125;
  const coneR = headX + size * 0.095;

  const hatConeGrad = ctx.createLinearGradient(coneL, coneBaseY, tipX + size * 0.06, tipY);
  hatConeGrad.addColorStop(0, "#d4c49a");
  hatConeGrad.addColorStop(0.35, "#e8dcc0");
  hatConeGrad.addColorStop(0.65, "#c8b078");
  hatConeGrad.addColorStop(1, "#a89868");
  ctx.fillStyle = hatConeGrad;
  ctx.beginPath();
  ctx.moveTo(coneL, coneBaseY);
  ctx.lineTo(tipX - size * 0.012, tipY + size * 0.045);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(tipX + size * 0.018, tipY + size * 0.042);
  ctx.lineTo(coneR, coneBaseY);
  ctx.lineTo(coneL, coneBaseY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(90, 70, 45, 0.35)";
  ctx.lineWidth = 0.9 * zoom;
  ctx.stroke();

  // Parchment shade patches
  ctx.fillStyle = "rgba(184, 160, 110, 0.45)";
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.04, brimY - size * 0.18, size * 0.07, size * 0.11, -0.35, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(248, 236, 200, 0.35)";
  ctx.beginPath();
  ctx.ellipse(headX + size * 0.05, brimY - size * 0.28, size * 0.055, size * 0.09, 0.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(160, 130, 85, 0.3)";
  ctx.beginPath();
  ctx.ellipse(tipX - size * 0.02, tipY + size * 0.08, size * 0.04, size * 0.07, 0.2, 0, TAU);
  ctx.fill();

  // Fold creases
  ctx.strokeStyle = "rgba(100, 80, 55, 0.4)";
  ctx.lineWidth = 0.7 * zoom;
  ctx.beginPath();
  ctx.moveTo(coneL + size * 0.02, coneBaseY - size * 0.02);
  ctx.lineTo(tipX - size * 0.025, tipY + size * 0.06);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.02, coneBaseY - size * 0.04);
  ctx.lineTo(tipX + size * 0.01, tipY + size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(coneR - size * 0.03, coneBaseY);
  ctx.quadraticCurveTo(headX, brimY - size * 0.32, coneL + size * 0.06, brimY - size * 0.22);
  ctx.stroke();

  // Ink stain splotches on hat
  for (let si = 0; si < 5; si++) {
    const sx = headX + Math.sin(si * 2.1 + 0.3) * size * 0.1 + (si - 2) * size * 0.03;
    const sy = brimY - size * (0.12 + si * 0.065);
    ctx.fillStyle = `rgba(91, 33, 182, ${0.12 + (si % 3) * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, size * (0.018 + (si % 2) * 0.006), size * 0.014, si * 0.4, 0, TAU);
    ctx.fill();
  }

  // Wide brim
  const brimGrad = ctx.createRadialGradient(headX - size * 0.06, brimY - brimRy, 0, headX, brimY, brimRx * 1.1);
  brimGrad.addColorStop(0, "#e4d4a8");
  brimGrad.addColorStop(0.55, "#c8a878");
  brimGrad.addColorStop(1, "#9a7a50");
  ctx.fillStyle = brimGrad;
  ctx.beginPath();
  ctx.ellipse(headX, brimY, brimRx, brimRy, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = brassAccent;
  ctx.lineWidth = 1.2 * zoom;
  ctx.stroke();
  ctx.strokeStyle = "rgba(70, 55, 35, 0.45)";
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.ellipse(headX, brimY, brimRx * 0.92, brimRy * 0.88, 0, 0, TAU);
  ctx.stroke();

  // Ink drips from brim
  for (let di = 0; di < 5; di++) {
    const dripX = headX + (di / 4 - 0.5) * brimRx * 1.65;
    const dripPhase = (time * 2.2 + di * 0.37) % 1;
    const dripLen = size * 0.04 + dripPhase * size * 0.07;
    ctx.fillStyle = `rgba(91, 33, 182, ${0.35 + dripPhase * 0.25})`;
    ctx.beginPath();
    ctx.ellipse(dripX, brimY + brimRy * 0.5 + dripLen * 0.5, size * 0.012, dripLen * 0.5, 0, 0, TAU);
    ctx.fill();
  }

  // Quills stuck through hat at angles
  ctx.lineCap = "round";
  for (let qi = 0; qi < 3; qi++) {
    const qAng = -0.85 + qi * 0.55 + Math.sin(time * 0.9 + qi) * 0.08;
    const qx0 = headX + Math.sin(qi * 1.7) * size * 0.08;
    const qy0 = brimY - size * (0.08 + qi * 0.11);
    const qLen = size * (0.14 + qi * 0.04);
    ctx.strokeStyle = "#3a2818";
    ctx.lineWidth = (1.2 + qi * 0.15) * zoom;
    ctx.beginPath();
    ctx.moveTo(qx0 - Math.cos(qAng) * qLen * 0.35, qy0 - Math.sin(qAng) * qLen * 0.35);
    ctx.lineTo(qx0 + Math.cos(qAng) * qLen * 0.65, qy0 + Math.sin(qAng) * qLen * 0.65);
    ctx.stroke();
    ctx.fillStyle = inkPurple;
    ctx.beginPath();
    ctx.moveTo(qx0 + Math.cos(qAng) * qLen * 0.62, qy0 + Math.sin(qAng) * qLen * 0.62);
    ctx.lineTo(
      qx0 + Math.cos(qAng) * qLen * 0.5 + Math.cos(qAng + 0.9) * size * 0.022,
      qy0 + Math.sin(qAng) * qLen * 0.5 + Math.sin(qAng + 0.9) * size * 0.022,
    );
    ctx.lineTo(
      qx0 + Math.cos(qAng) * qLen * 0.5 + Math.cos(qAng - 0.9) * size * 0.022,
      qy0 + Math.sin(qAng) * qLen * 0.5 + Math.sin(qAng - 0.9) * size * 0.022,
    );
    ctx.closePath();
    ctx.fill();
  }
  ctx.lineCap = "butt";

  // Paper cranes orbiting hat tip
  const orbitR = size * 0.1;
  for (let ci = 0; ci < 3; ci++) {
    const orbitA = time * 1.8 + ci * (TAU / 3);
    const cxi = tipX + Math.cos(orbitA) * orbitR;
    const cyi = tipY + Math.sin(orbitA) * orbitR * 0.55 + Math.sin(time * 2.5 + ci) * size * 0.012;
    const cr = size * 0.028;
    ctx.save();
    ctx.translate(cxi, cyi);
    ctx.rotate(orbitA * 0.7 + ci * 0.8);
    ctx.fillStyle = "#f5edd0";
    ctx.strokeStyle = "rgba(90, 70, 50, 0.5)";
    ctx.lineWidth = 0.45 * zoom;
    ctx.beginPath();
    ctx.moveTo(0, -cr);
    ctx.lineTo(cr * 0.85, cr * 0.15);
    ctx.lineTo(0, cr * 0.55);
    ctx.lineTo(-cr * 0.85, cr * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-cr * 0.9, -cr * 0.25);
    ctx.lineTo(0, -cr * 0.05);
    ctx.lineTo(cr * 0.9, -cr * 0.25);
    ctx.stroke();
    ctx.restore();
  }

  // Tip ink glow
  setShadowBlur(ctx, (10 + madnessPulse * 6) * zoom, inkPurple);
  ctx.fillStyle = `rgba(147, 51, 234, ${0.35 + madnessPulse * 0.45})`;
  ctx.beginPath();
  ctx.arc(tipX, tipY, size * 0.038, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.fillStyle = `rgba(255, 255, 255, ${0.12 + madnessPulse * 0.1})`;
  ctx.beginPath();
  ctx.arc(tipX - size * 0.01, tipY - size * 0.01, size * 0.012, 0, TAU);
  ctx.fill();

  // === VFX ===
  // Knowledge tendrils from head
  ctx.strokeStyle = `rgba(147, 51, 234, ${madnessPulse * 0.4})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let i = 0; i < 5; i++) {
    const tAngle = -Math.PI * 0.6 + i * Math.PI * 0.3;
    ctx.beginPath();
    ctx.moveTo(headX + Math.cos(tAngle) * size * 0.15, headY - size * 0.15);
    ctx.bezierCurveTo(
      headX +
        Math.cos(tAngle) * size * 0.25 +
        Math.sin(time * 3 + i) * size * 0.08,
      headY - size * 0.3,
      headX +
        Math.cos(tAngle + 0.2) * size * 0.3 +
        Math.cos(time * 2 + i) * size * 0.06,
      headY - size * 0.4,
      headX + Math.cos(tAngle) * size * 0.35,
      headY - size * 0.45 + Math.sin(time * 4 + i) * size * 0.06,
    );
    ctx.stroke();
  }

  // Arcane glow rings
  drawPulsingGlowRings(
    ctx,
    cx,
    y - size * 0.35 - bodyBob,
    size * 0.08,
    time,
    zoom,
    {
      color: "rgba(192, 132, 252, 0.5)",
      count: 3,
      speed: 1.8,
      maxAlpha: 0.35 + (isAttacking ? attackIntensity * 0.3 : 0),
      expansion: 1.6,
    },
  );

  // Floating crystal pieces
  drawShiftingSegments(ctx, cx, y - size * 0.05 - bodyBob, size, time, zoom, {
    color: "rgba(147, 51, 234, 0.5)",
    colorAlt: "rgba(192, 132, 252, 0.4)",
    count: 6,
    orbitRadius: 0.38,
    segmentSize: 0.025,
    orbitSpeed: 1.5,
    shape: "diamond",
  });

  // Visor glow
  setShadowBlur(ctx, 6 * zoom, inkPurple);
  ctx.fillStyle = `rgba(168, 85, 247, 0.8)`;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.06,
      headY + size * 0.01,
      size * 0.01,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);
}

// ============================================================================
// 4. SENIOR — VOID SCHOLAR
//    Void rift/dark energy theme with obsidian/dark purple armor
// ============================================================================

export function drawSeniorEnemy(
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
  const breath = getBreathScale(time, 1.3, 0.015);
  const sway = getIdleSway(time, 0.8, size * 0.004, size * 0.003);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#8a7898";
  const metalMid = "#5a4868";
  const metalDark = "#3a2848";
  const voidPink = "#f472b6";
  const voidDeep = "#9d174d";

  const powerPulse = 0.5 + Math.sin(time * 3) * 0.3 + attackIntensity * 0.4;
  const floatHeight = Math.sin(time * 1.5) * size * 0.02;
  const auraExpand = isAttacking ? 1 + attackIntensity * 0.3 : 1;
  const powerSurge = isAttacking ? attackIntensity * 0.5 : 0;

  // === VOID AURA (behind body) ===
  // Outer void distortion rings
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = size * (0.7 + ring * 0.2) * auraExpand;
    const ringAlpha = (0.12 - ring * 0.03) * (1 + powerSurge);
    ctx.strokeStyle = `rgba(219, 39, 119, ${ringAlpha})`;
    ctx.lineWidth = (1.5 - ring * 0.3) * zoom;
    ctx.beginPath();
    for (let a = 0; a < TAU; a += 0.12) {
      const wobble = Math.sin(a * 6 + time * 3 + ring) * size * 0.02;
      const rx = cx + Math.cos(a) * (ringSize + wobble);
      const ry = y - bodyBob + Math.sin(a) * (ringSize * 0.5 + wobble * 0.4);
      if (a === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const auraGrad = ctx.createRadialGradient(
    cx,
    y - bodyBob,
    0,
    cx,
    y - bodyBob,
    size * 0.8 * auraExpand,
  );
  auraGrad.addColorStop(
    0,
    `rgba(251, 207, 232, ${(0.3 + powerSurge * 0.2) * powerPulse})`,
  );
  auraGrad.addColorStop(
    0.35,
    `rgba(244, 114, 182, ${(0.2 + powerSurge * 0.15) * powerPulse})`,
  );
  auraGrad.addColorStop(0.7, `rgba(219, 39, 119, ${0.08 * powerPulse})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    y - bodyBob,
    size * 0.8 * auraExpand,
    size * 0.5 * auraExpand,
    0,
    0,
    TAU,
  );
  ctx.fill();

  // Orbiting thesis pages (enhanced storm)
  for (let i = 0; i < 9; i++) {
    const orbitAngle = time * 1.2 + (i * TAU) / 9;
    const orbitDist =
      size * 0.45 +
      Math.sin(time * 2 + i) * size * 0.08 +
      (i % 3) * size * 0.05;
    const pageX = cx + Math.cos(orbitAngle) * orbitDist;
    const pageY =
      y -
      bodyBob +
      Math.sin(orbitAngle) * orbitDist * 0.35 +
      floatHeight +
      Math.sin(time * 3 + i * 0.7) * size * 0.02;
    const pageGlow = 0.35 + Math.sin(time * 4 + i) * 0.15 + powerSurge * 0.2;
    const pageScale = 0.8 + Math.sin(time * 2.5 + i) * 0.2;
    ctx.save();
    ctx.translate(pageX, pageY);
    ctx.rotate(Math.sin(time * 3 + i * 2) * 0.3);
    ctx.scale(pageScale, pageScale);
    // Page background with torn edges
    ctx.fillStyle = `rgba(253, 244, 255, ${pageGlow})`;
    ctx.beginPath();
    ctx.moveTo(-size * 0.03, -size * 0.04);
    ctx.lineTo(size * 0.025, -size * 0.04);
    ctx.lineTo(size * 0.03, -size * 0.035);
    ctx.lineTo(size * 0.03, size * 0.035);
    ctx.lineTo(size * 0.025, size * 0.04);
    ctx.lineTo(-size * 0.03, size * 0.04);
    ctx.closePath();
    ctx.fill();
    // Text lines on pages
    ctx.fillStyle = `rgba(157, 23, 77, ${pageGlow * 0.5})`;
    for (let line = 0; line < 4; line++) {
      ctx.fillRect(
        -size * 0.022,
        -size * 0.03 + line * size * 0.015,
        size * 0.035 + Math.sin(i + line) * size * 0.008,
        size * 0.004,
      );
    }
    // Void glow on some pages
    if (i % 3 === 0) {
      ctx.fillStyle = `rgba(244, 114, 182, ${pageGlow * 0.3})`;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.02, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  // Floating rune symbols
  ctx.font = `${size * 0.06}px serif`;
  ctx.textAlign = "center";
  for (let i = 0; i < 4; i++) {
    const runeAngle = time * 0.8 + (i * Math.PI) / 2;
    const runeDist = size * 0.6 + Math.sin(time * 2.5 + i) * size * 0.04;
    const runeX = cx + Math.cos(runeAngle) * runeDist;
    const runeY =
      y - size * 0.1 - bodyBob + Math.sin(runeAngle) * runeDist * 0.3;
    const runeAlpha = 0.4 + Math.sin(time * 3 + i) * 0.25 + powerSurge * 0.3;
    ctx.fillStyle = `rgba(244, 114, 182, ${runeAlpha})`;
    ctx.fillText(["Σ", "Φ", "Ψ", "Ω"][i], runeX, runeY);
  }

  // === REALITY-FRACTURE CAPE ===
  const senCapeWave = Math.sin(time * 2.5) * size * 0.025;
  const senCapeGrad = ctx.createLinearGradient(
    cx,
    y - size * 0.28 - bodyBob,
    cx + senCapeWave,
    y + size * 0.3 - bodyBob,
  );
  senCapeGrad.addColorStop(0, "#3a1848");
  senCapeGrad.addColorStop(0.4, "#1e0a20");
  senCapeGrad.addColorStop(0.8, "#0a0510");
  senCapeGrad.addColorStop(1, "rgba(10, 5, 16, 0)");
  ctx.fillStyle = senCapeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.18, y - size * 0.25 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.22 + senCapeWave * 0.5,
    y + size * 0.05 - bodyBob,
    cx - size * 0.2 + senCapeWave,
    y + size * 0.3 - bodyBob,
  );
  ctx.lineTo(cx + size * 0.2 + senCapeWave, y + size * 0.28 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.22,
    y + size * 0.05 - bodyBob,
    cx + size * 0.18,
    y - size * 0.25 - bodyBob,
  );
  ctx.closePath();
  ctx.fill();
  // Reality fracture shimmer on cape edges
  ctx.strokeStyle = `rgba(244, 114, 182, ${powerPulse * 0.35})`;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.2 + senCapeWave, y + size * 0.3 - bodyBob);
  for (let fe = 0; fe < 5; fe++) {
    const feX =
      cx -
      size * 0.2 +
      senCapeWave +
      (fe / 4) * size * 0.4;
    const feY =
      y + size * 0.29 - bodyBob + Math.sin(time * 5 + fe) * size * 0.015;
    ctx.lineTo(feX, feY);
  }
  ctx.stroke();

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: metalDark,
    trimColor: voidDeep,
    strideSpeed: 3,
    strideAmt: 0.2,
    legLen: 0.24,
    width: 0.1,
    footLen: 0.11,
    style: "armored",
  });

  // === VOID ROBE HEM ===
  ctx.save();
  ctx.translate(cx, y - size * 0.02 - bodyBob);
  const robeHemW = size * 0.24;
  const robeHemLen = size * 0.16;
  const hemGrad = ctx.createLinearGradient(0, 0, 0, robeHemLen);
  hemGrad.addColorStop(0, "#3a1848");
  hemGrad.addColorStop(0.5, "#1e0a20");
  hemGrad.addColorStop(1, "rgba(10, 5, 16, 0.6)");
  ctx.fillStyle = hemGrad;
  ctx.beginPath();
  ctx.moveTo(-robeHemW, 0);
  for (let w = 0; w <= 8; w++) {
    const wx = -robeHemW + (w / 8) * robeHemW * 2;
    const wy = robeHemLen + Math.sin(time * 3 + w * 0.9) * size * 0.015;
    ctx.lineTo(wx, wy);
  }
  ctx.lineTo(robeHemW, 0);
  ctx.closePath();
  ctx.fill();
  // Cosmic particles at hem edge
  for (let p = 0; p < 10; p++) {
    const px = -robeHemW + (p / 9) * robeHemW * 2;
    const py = robeHemLen + Math.sin(time * 4 + p * 0.7) * size * 0.01;
    const pAlpha = 0.3 + Math.sin(time * 5 + p) * 0.2 + powerSurge * 0.2;
    ctx.fillStyle = `rgba(244, 114, 182, ${pAlpha})`;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.006, 0, TAU);
    ctx.fill();
  }
  // Shimmer across hem fabric
  ctx.strokeStyle = `rgba(138, 120, 152, ${0.15 + powerPulse * 0.15})`;
  ctx.lineWidth = 0.5 * zoom;
  for (let s = 0; s < 3; s++) {
    const sy = size * 0.03 + s * size * 0.035;
    ctx.beginPath();
    ctx.moveTo(-robeHemW * 0.8, sy);
    ctx.quadraticCurveTo(0, sy + size * 0.008, robeHemW * 0.8, sy);
    ctx.stroke();
  }
  ctx.restore();

  // === VOID ROBES with tabard ===
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.scale(breath, breath);

  // Layered void robes body
  const robeGrad = ctx.createLinearGradient(
    -size * 0.3, -size * 0.22, size * 0.3, size * 0.22,
  );
  robeGrad.addColorStop(0, "#1e0a20");
  robeGrad.addColorStop(0.2, "#2d1438");
  robeGrad.addColorStop(0.5, "#3a1848");
  robeGrad.addColorStop(0.8, "#2d1438");
  robeGrad.addColorStop(1, "#1e0a20");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.28, size * 0.18);
  ctx.bezierCurveTo(
    -size * 0.32, size * 0.06,
    -size * 0.34, -size * 0.08,
    -size * 0.26, -size * 0.22,
  );
  ctx.bezierCurveTo(
    -size * 0.2, -size * 0.26,
    -size * 0.1, -size * 0.28,
    0, -size * 0.29,
  );
  ctx.bezierCurveTo(
    size * 0.1, -size * 0.28,
    size * 0.2, -size * 0.26,
    size * 0.26, -size * 0.22,
  );
  ctx.bezierCurveTo(
    size * 0.34, -size * 0.08,
    size * 0.32, size * 0.06,
    size * 0.28, size * 0.18,
  );
  ctx.closePath();
  ctx.fill();

  // Fabric fold lines
  ctx.strokeStyle = `rgba(90, 72, 104, 0.4)`;
  ctx.lineWidth = 0.8 * zoom;
  for (let fold = 0; fold < 3; fold++) {
    const foldX = -size * 0.12 + fold * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(foldX, -size * 0.2);
    ctx.quadraticCurveTo(foldX + size * 0.02, 0, foldX, size * 0.16);
    ctx.stroke();
  }

  // Void shimmer overlay
  const shimmerAlpha = 0.08 + powerPulse * 0.08;
  const shimmerGrad = ctx.createRadialGradient(0, -size * 0.05, 0, 0, -size * 0.05, size * 0.25);
  shimmerGrad.addColorStop(0, `rgba(244, 114, 182, ${shimmerAlpha})`);
  shimmerGrad.addColorStop(0.6, `rgba(157, 23, 77, ${shimmerAlpha * 0.5})`);
  shimmerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = shimmerGrad;
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.05, size * 0.25, size * 0.2, 0, 0, TAU);
  ctx.fill();

  // Collar fold at neckline
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.24, -size * 0.2);
  ctx.quadraticCurveTo(0, -size * 0.24, size * 0.24, -size * 0.2);
  ctx.stroke();

  // Void-purple tabard with glowing seams
  const tabardGrad = ctx.createLinearGradient(
    -size * 0.12,
    -size * 0.22,
    size * 0.12,
    size * 0.16,
  );
  tabardGrad.addColorStop(0, "#1e0a20");
  tabardGrad.addColorStop(0.3, "#3a1848");
  tabardGrad.addColorStop(0.7, "#3a1848");
  tabardGrad.addColorStop(1, "#1e0a20");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.15, size * 0.16);
  ctx.lineTo(-size * 0.15, size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Glowing void seams
  ctx.strokeStyle = `rgba(244, 114, 182, ${powerPulse * 0.5})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, -size * 0.24);
  ctx.lineTo(-size * 0.15, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.15, size * 0.16);
  ctx.stroke();

  // Void sigil
  ctx.fillStyle = `rgba(244, 114, 182, ${powerPulse * 0.6})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Ω", 0, -size * 0.04);

  ctx.restore();

  // === HIGH ROBED COLLAR WITH VOID GEM ===
  ctx.save();
  ctx.translate(cx, y - size * 0.35 - bodyBob);
  const vCollarW = size * 0.22;
  const vCollarH = size * 0.07;
  const vCollarGrad = ctx.createLinearGradient(0, -vCollarH, 0, vCollarH);
  vCollarGrad.addColorStop(0, "#1e0a20");
  vCollarGrad.addColorStop(0.5, "#3a1848");
  vCollarGrad.addColorStop(1, "#2d1438");
  ctx.fillStyle = vCollarGrad;
  ctx.beginPath();
  ctx.moveTo(-vCollarW, vCollarH * 0.5);
  ctx.quadraticCurveTo(-vCollarW * 0.85, -vCollarH * 1.5, -vCollarW * 0.25, -vCollarH * 1.8);
  ctx.quadraticCurveTo(0, -vCollarH * 2, vCollarW * 0.25, -vCollarH * 1.8);
  ctx.quadraticCurveTo(vCollarW * 0.85, -vCollarH * 1.5, vCollarW, vCollarH * 0.5);
  ctx.quadraticCurveTo(vCollarW * 0.5, vCollarH * 0.8, 0, vCollarH);
  ctx.quadraticCurveTo(-vCollarW * 0.5, vCollarH * 0.8, -vCollarW, vCollarH * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(244, 114, 182, ${powerPulse * 0.3})`;
  ctx.lineWidth = 0.7 * zoom;
  ctx.stroke();
  // Void gem clasp
  const gemPulse = 0.6 + Math.sin(time * 4) * 0.3;
  const gemGrad = ctx.createRadialGradient(0, -vCollarH * 0.6, 0, 0, -vCollarH * 0.6, size * 0.02);
  gemGrad.addColorStop(0, `rgba(251, 207, 232, ${gemPulse})`);
  gemGrad.addColorStop(0.5, `rgba(244, 114, 182, ${gemPulse * 0.8})`);
  gemGrad.addColorStop(1, `rgba(157, 23, 77, ${gemPulse * 0.4})`);
  ctx.fillStyle = gemGrad;
  ctx.beginPath();
  ctx.moveTo(0, -vCollarH * 0.6 - size * 0.018);
  ctx.lineTo(size * 0.015, -vCollarH * 0.6);
  ctx.lineTo(0, -vCollarH * 0.6 + size * 0.018);
  ctx.lineTo(-size * 0.015, -vCollarH * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // === FLOATING VOID CRYSTAL CLASPS ===
  for (const side of [-1, 1] as const) {
    ctx.save();
    const cX = cx + side * size * 0.28;
    const cY = y - size * 0.3 - bodyBob;
    const crystalFloat = Math.sin(time * 3 + side * 1.5) * size * 0.01;
    const crystalRot = Math.sin(time * 2 + side) * 0.3;
    ctx.translate(cX, cY + crystalFloat);
    ctx.rotate(crystalRot);
    // Crystal body
    const cSize = size * 0.035;
    const crystGrad = ctx.createLinearGradient(0, -cSize, 0, cSize);
    crystGrad.addColorStop(0, `rgba(251, 207, 232, ${0.7 + powerSurge * 0.3})`);
    crystGrad.addColorStop(0.5, `rgba(244, 114, 182, ${0.8 + powerSurge * 0.2})`);
    crystGrad.addColorStop(1, `rgba(157, 23, 77, 0.9)`);
    ctx.fillStyle = crystGrad;
    ctx.beginPath();
    ctx.moveTo(0, -cSize);
    ctx.lineTo(cSize * 0.6, -cSize * 0.2);
    ctx.lineTo(cSize * 0.5, cSize * 0.5);
    ctx.lineTo(0, cSize);
    ctx.lineTo(-cSize * 0.5, cSize * 0.5);
    ctx.lineTo(-cSize * 0.6, -cSize * 0.2);
    ctx.closePath();
    ctx.fill();
    // Crystal glow
    const cGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, cSize * 2);
    cGlow.addColorStop(0, `rgba(244, 114, 182, ${powerPulse * 0.25})`);
    cGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = cGlow;
    ctx.beginPath();
    ctx.arc(0, 0, cSize * 2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // === CHAIN BELT WITH VOID SHARDS ===
  ctx.save();
  ctx.translate(cx, y - size * 0.04 - bodyBob);
  const chainW = size * 0.24;
  // Dark chain links
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = size * 0.012;
  const chainLinks = 10;
  for (let cl = 0; cl < chainLinks; cl++) {
    const clX = -chainW + (cl / (chainLinks - 1)) * chainW * 2;
    const clY = Math.sin(cl * 0.8) * size * 0.005;
    ctx.beginPath();
    ctx.ellipse(clX, clY, size * 0.015, size * 0.01, 0, 0, TAU);
    ctx.stroke();
  }
  // Dangling void shards
  for (let vs = 0; vs < 5; vs++) {
    const vsX = -chainW * 0.7 + (vs / 4) * chainW * 1.4;
    const vsLen = size * 0.04 + Math.sin(time * 3 + vs) * size * 0.008;
    const vsAlpha = 0.5 + Math.sin(time * 4 + vs * 1.2) * 0.2;
    // Thin chain link
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 0.5 * zoom;
    ctx.beginPath();
    ctx.moveTo(vsX, size * 0.01);
    ctx.lineTo(vsX, size * 0.01 + vsLen * 0.3);
    ctx.stroke();
    // Shard
    const shardGrad = ctx.createLinearGradient(vsX, size * 0.01 + vsLen * 0.2, vsX, size * 0.01 + vsLen);
    shardGrad.addColorStop(0, `rgba(244, 114, 182, ${vsAlpha})`);
    shardGrad.addColorStop(1, `rgba(157, 23, 77, ${vsAlpha * 0.6})`);
    ctx.fillStyle = shardGrad;
    ctx.beginPath();
    ctx.moveTo(vsX, size * 0.01 + vsLen * 0.2);
    ctx.lineTo(vsX + size * 0.008, size * 0.01 + vsLen * 0.6);
    ctx.lineTo(vsX, size * 0.01 + vsLen);
    ctx.lineTo(vsX - size * 0.008, size * 0.01 + vsLen * 0.6);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // === LEFT ARM — void grimoire ===
  const senForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: voidDeep,
      upperLen: 0.16,
      foreLen: senForeLen,
      width: 0.1,
      shoulderAngle: -0.5 + Math.sin(time * 1.8) * 0.06 + (isAttacking ? -attackIntensity * 0.35 : 0),
      elbowAngle: 0.85 + Math.sin(time * 2) * 0.05 + (isAttacking ? -attackIntensity * 0.25 : 0),
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = senForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Void energy halo behind grimoire
        wCtx.fillStyle = `rgba(244, 114, 182, ${powerPulse * 0.15})`;
        wCtx.beginPath();
        wCtx.arc(0, 0, size * 0.1, 0, TAU);
        wCtx.fill();
        // Void grimoire cover
        wCtx.fillStyle = "#1a0a1a";
        wCtx.fillRect(-size * 0.07, -size * 0.09, size * 0.14, size * 0.18);
        // Cover embossing
        wCtx.strokeStyle = `rgba(244, 114, 182, ${powerPulse * 0.4})`;
        wCtx.lineWidth = size * 0.004;
        wCtx.strokeRect(
          -size * 0.065,
          -size * 0.085,
          size * 0.13,
          size * 0.17,
        );
        // Inner pages
        wCtx.fillStyle = "#2a1030";
        wCtx.fillRect(-size * 0.06, -size * 0.08, size * 0.12, size * 0.16);
        // Pulsing void glow emanating from pages
        const grimPulse = 0.3 + Math.sin(time * 5) * 0.2 + powerPulse * 0.3;
        wCtx.fillStyle = `rgba(244, 114, 182, ${grimPulse})`;
        wCtx.fillRect(-size * 0.05, -size * 0.06, size * 0.1, size * 0.12);
        // Void text lines
        wCtx.fillStyle = `rgba(251, 207, 232, ${grimPulse * 0.5})`;
        for (let vl = 0; vl < 4; vl++) {
          wCtx.fillRect(
            -size * 0.035,
            -size * 0.05 + vl * size * 0.022,
            size * 0.07,
            size * 0.004,
          );
        }
        // Void runes (multiple)
        wCtx.fillStyle = `rgba(251, 207, 232, ${powerPulse * 0.8})`;
        wCtx.font = `${size * 0.04}px serif`;
        wCtx.textAlign = "center";
        wCtx.fillText("Ψ", -size * 0.015, -size * 0.01);
        wCtx.font = `${size * 0.03}px serif`;
        wCtx.fillText("Ω", size * 0.02, size * 0.03);
        // Void motes rising from grimoire
        for (let vm = 0; vm < 3; vm++) {
          const vmPhase = (time * 2.5 + vm * 0.6) % 1.5;
          wCtx.fillStyle = `rgba(244, 114, 182, ${(1 - vmPhase / 1.5) * 0.5})`;
          wCtx.beginPath();
          wCtx.arc(
            Math.sin(time * 4 + vm) * size * 0.03,
            -size * 0.06 - vmPhase * size * 0.08,
            size * 0.005,
            0,
            TAU,
          );
          wCtx.fill();
        }
      },
    },
  );

  // === RIGHT ARM — void energy channel ===
  drawPathArm(
    ctx,
    cx + size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: voidDeep,
      upperLen: 0.16,
      foreLen: senForeLen,
      width: 0.1,
      shoulderAngle:
        0.6 +
        Math.sin(time * 2.5) * 0.1 +
        (isAttacking ? attackIntensity * 0.5 : 0),
      elbowAngle: 0.2 + Math.sin(time * 3) * 0.08,
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = senForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Void energy orb (outer glow)
        wCtx.fillStyle = `rgba(157, 23, 77, ${powerPulse * 0.15})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.03, size * 0.09, 0, TAU);
        wCtx.fill();
        // Main orb
        wCtx.fillStyle = `rgba(219, 39, 119, ${powerPulse * 0.3})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.03, size * 0.06, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(244, 114, 182, ${powerPulse * 0.7})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.03, size * 0.035, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(251, 207, 232, ${powerPulse * 0.9})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.03, size * 0.015, 0, TAU);
        wCtx.fill();
        // Void tendrils reaching outward (more, longer)
        for (let t = 0; t < 6; t++) {
          const tA = time * 5 + (t * TAU) / 6;
          const tLen = size * 0.08 + Math.sin(time * 3 + t) * size * 0.03;
          wCtx.strokeStyle = `rgba(244, 114, 182, ${0.35 + Math.sin(time * 3 + t) * 0.2})`;
          wCtx.lineWidth = size * (0.006 - t * 0.0005);
          wCtx.beginPath();
          wCtx.moveTo(0, -size * 0.03);
          wCtx.bezierCurveTo(
            Math.cos(tA) * size * 0.04,
            -size * 0.03 + Math.sin(tA) * size * 0.03,
            Math.cos(tA) * size * 0.07,
            -size * 0.03 + Math.sin(tA) * size * 0.06,
            Math.cos(tA) * tLen,
            -size * 0.03 + Math.sin(tA) * tLen,
          );
          wCtx.stroke();
          // Tendril tip glow
          wCtx.fillStyle = `rgba(251, 207, 232, ${0.3 + Math.sin(time * 4 + t) * 0.15})`;
          wCtx.beginPath();
          wCtx.arc(
            Math.cos(tA) * tLen,
            -size * 0.03 + Math.sin(tA) * tLen,
            size * 0.004,
            0,
            TAU,
          );
          wCtx.fill();
        }
        // Orbiting void sparks around orb
        for (let vs = 0; vs < 3; vs++) {
          const vsA = time * 8 + (vs * TAU) / 3;
          wCtx.fillStyle = `rgba(251, 207, 232, 0.5)`;
          wCtx.beginPath();
          wCtx.arc(
            Math.cos(vsA) * size * 0.05,
            -size * 0.03 + Math.sin(vsA) * size * 0.04,
            size * 0.004,
            0,
            TAU,
          );
          wCtx.fill();
        }
      },
    },
  );

  // === HEAD — Floating arcane void halo + porcelain mask (no plume) ===
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;
  const haloR = size * 0.25;
  const haloCx = headX;
  const haloCy = headY - size * 0.19;
  const haloPulse = powerPulse * (isAttacking ? 1.35 : 1);
  const haloSegCount = 14;
  const segArc = TAU / haloSegCount;

  // Halo: outer void aura
  setShadowBlur(ctx, (10 + attackIntensity * 8) * zoom, voidPink);
  ctx.strokeStyle = `rgba(157, 23, 77, ${0.2 + haloPulse * 0.25})`;
  ctx.lineWidth = size * 0.028 * zoom;
  ctx.beginPath();
  ctx.arc(haloCx, haloCy, haloR, 0, TAU);
  ctx.stroke();
  clearShadow(ctx);

  // Halo: segmented metallic ring (gear / sun disc)
  ctx.lineWidth = Math.max(1, size * 0.011) * zoom;
  for (let s = 0; s < haloSegCount; s++) {
    const a0 = -Math.PI / 2 + s * segArc + segArc * 0.08;
    const a1 = -Math.PI / 2 + (s + 1) * segArc - segArc * 0.08;
    const ringGrad = ctx.createLinearGradient(
      haloCx + Math.cos(a0) * haloR,
      haloCy + Math.sin(a0) * haloR,
      haloCx + Math.cos(a1) * haloR,
      haloCy + Math.sin(a1) * haloR,
    );
    ringGrad.addColorStop(0, metalDark);
    ringGrad.addColorStop(0.5, "#5c4a62");
    ringGrad.addColorStop(1, metalDark);
    ctx.strokeStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(haloCx, haloCy, haloR, a0, a1);
    ctx.stroke();
    // Notch outward (geometric tooth)
    const midA = (a0 + a1) * 0.5;
    const tipR = haloR + size * 0.028;
    ctx.beginPath();
    ctx.moveTo(
      haloCx + Math.cos(a0) * haloR,
      haloCy + Math.sin(a0) * haloR,
    );
    ctx.lineTo(
      haloCx + Math.cos(midA) * tipR,
      haloCy + Math.sin(midA) * tipR,
    );
    ctx.lineTo(
      haloCx + Math.cos(a1) * haloR,
      haloCy + Math.sin(a1) * haloR,
    );
    ctx.stroke();
  }

  // Void energy bridges between segment gaps
  for (let s = 0; s < haloSegCount; s++) {
    const gapMid = -Math.PI / 2 + s * segArc;
    const innerR = haloR - size * 0.018;
    const outerR = haloR + size * 0.012;
    const flow = 0.35 + haloPulse * 0.45 + Math.sin(time * 4 + s) * 0.15;
    setShadowBlur(ctx, (4 + (isAttacking ? 4 : 0)) * zoom, voidPink);
    ctx.strokeStyle = `rgba(244, 114, 182, ${flow})`;
    ctx.lineWidth = size * 0.006 * zoom;
    ctx.beginPath();
    ctx.arc(haloCx, haloCy, (innerR + outerR) * 0.5, gapMid - 0.06, gapMid + 0.06);
    ctx.stroke();
    clearShadow(ctx);
    ctx.fillStyle = `rgba(251, 207, 232, ${flow * 0.35})`;
    ctx.beginPath();
    ctx.arc(
      haloCx + Math.cos(gapMid) * haloR,
      haloCy + Math.sin(gapMid) * haloR,
      size * 0.004,
      0,
      TAU,
    );
    ctx.fill();
  }

  // Small void crystals orbiting the halo ring
  const crystalCount = 5;
  for (let c = 0; c < crystalCount; c++) {
    const orbitA = time * 0.45 + (c * TAU) / crystalCount;
    const cr = haloR + Math.sin(time * 2 + c) * size * 0.012;
    const cX = haloCx + Math.cos(orbitA) * cr;
    const cY = haloCy + Math.sin(orbitA) * cr;
    const cSize = size * 0.014 + (isAttacking ? size * 0.004 : 0);
    setShadowBlur(ctx, 5 * zoom, voidPink);
    const cg = ctx.createRadialGradient(cX, cY, 0, cX, cY, cSize * 2.2);
    cg.addColorStop(0, `rgba(251, 207, 232, ${0.75 + haloPulse * 0.2})`);
    cg.addColorStop(0.45, `rgba(244, 114, 182, ${0.55})`);
    cg.addColorStop(1, "rgba(157, 23, 77, 0)");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(cX, cY - cSize);
    ctx.lineTo(cX + cSize * 0.55, cY - cSize * 0.15);
    ctx.lineTo(cX + cSize * 0.45, cY + cSize * 0.55);
    ctx.lineTo(cX, cY + cSize * 0.65);
    ctx.lineTo(cX - cSize * 0.45, cY + cSize * 0.55);
    ctx.lineTo(cX - cSize * 0.55, cY - cSize * 0.15);
    ctx.closePath();
    ctx.fill();
    clearShadow(ctx);
  }

  // Shadow beneath mask
  ctx.fillStyle = "#0a0008";
  ctx.beginPath();
  ctx.arc(headX, headY + size * 0.01, size * 0.11, 0, TAU);
  ctx.fill();

  // Porcelain mask — smooth, featureless (no mouth)
  const porcelainGrad = ctx.createRadialGradient(
    headX - size * 0.04,
    headY - size * 0.06,
    0,
    headX,
    headY + size * 0.04,
    size * 0.16,
  );
  porcelainGrad.addColorStop(0, "#fffdfb");
  porcelainGrad.addColorStop(0.45, "#f0eae6");
  porcelainGrad.addColorStop(0.85, "#ddd4cf");
  porcelainGrad.addColorStop(1, "#c8bfb8");
  ctx.fillStyle = porcelainGrad;
  ctx.beginPath();
  ctx.ellipse(headX, headY + size * 0.01, size * 0.095, size * 0.125, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(90, 82, 88, 0.35)";
  ctx.lineWidth = 0.9 * zoom;
  ctx.stroke();

  // Thin crack (one side)
  ctx.strokeStyle = `rgba(55, 50, 52, ${0.55 + haloPulse * 0.15})`;
  ctx.lineWidth = 0.85 * zoom;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.07, headY - size * 0.09);
  ctx.lineTo(headX + size * 0.035, headY - size * 0.01);
  ctx.lineTo(headX + size * 0.055, headY + size * 0.06);
  ctx.lineTo(headX + size * 0.02, headY + size * 0.11);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Narrow eye slits + void pink glow
  const slitGlow = (isAttacking ? 9 : 6) * zoom;
  for (const eSide of [-1, 1] as const) {
    const sx = headX + eSide * size * 0.044;
    const sy = headY - size * 0.018;
    setShadowBlur(ctx, slitGlow, voidPink);
    ctx.fillStyle = voidDeep;
    ctx.beginPath();
    ctx.ellipse(sx, sy, size * 0.032, size * 0.007, 0, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    ctx.fillStyle = `rgba(244, 114, 182, ${0.35 + haloPulse * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(sx, sy, size * 0.022, size * 0.004, 0, 0, TAU);
    ctx.fill();
  }

  // Void tendrils dripping from mask bottom
  const maskChinY = headY + size * 0.12;
  for (let t = 0; t < 5; t++) {
    const tBaseX = headX + (t - 2) * size * 0.032;
    const tPhase = time * 3.2 + t * 1.1;
    const dropLen = size * (0.06 + Math.sin(tPhase) * 0.025 + (isAttacking ? 0.02 : 0));
    const sway = Math.sin(tPhase * 1.3) * size * 0.015;
    ctx.strokeStyle = `rgba(157, 23, 77, ${0.45 + haloPulse * 0.25})`;
    ctx.lineWidth = size * (0.005 + (t % 2) * 0.002) * zoom;
    ctx.beginPath();
    ctx.moveTo(tBaseX, maskChinY);
    ctx.bezierCurveTo(
      tBaseX + sway * 0.5,
      maskChinY + dropLen * 0.45,
      tBaseX + sway,
      maskChinY + dropLen * 0.78,
      tBaseX + sway * 1.1,
      maskChinY + dropLen,
    );
    ctx.stroke();
    setShadowBlur(ctx, 3 * zoom, voidPink);
    ctx.fillStyle = `rgba(244, 114, 182, ${0.25 + haloPulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(
      tBaseX + sway * 1.1,
      maskChinY + dropLen,
      size * 0.004,
      0,
      TAU,
    );
    ctx.fill();
    clearShadow(ctx);
  }

  // === VFX ===
  drawOrbitingDebris(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: `rgba(244, 114, 182, 0.55)`,
    glowColor: `rgba(251, 207, 232, 0.25)`,
    count: isAttacking ? 8 : 5,
    speed: isAttacking ? 3 : 2,
    particleSize: 0.015,
    minRadius: 0.35,
    maxRadius: 0.55,
    trailLen: 3,
  });

  drawShiftingSegments(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(219, 39, 119, 0.5)",
    colorAlt: "rgba(244, 114, 182, 0.4)",
    count: 6,
    orbitRadius: 0.42,
    segmentSize: 0.025,
    orbitSpeed: 1.2,
    shape: "shard",
  });

  // Visor glow
  setShadowBlur(ctx, 8 * zoom, voidPink);
  ctx.fillStyle = voidPink;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.06,
      headY + size * 0.01,
      size * 0.012,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Attack: void rift burst
  if (isAttacking) {
    const force = attackPhase;
    const burstR = size * 0.2 + (1 - force) * size * 0.4;
    ctx.strokeStyle = `rgba(244, 114, 182, ${force * 0.35})`;
    ctx.lineWidth = 2 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.3, burstR, burstR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }
}

// ============================================================================
// 5. GRAD STUDENT — ARCANE RESEARCHER
//    Multi-element magic theme with silver/blue mage-knight armor
// ============================================================================

export function drawGradStudentEnemy(
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
  const breath = getBreathScale(time, 1.3, 0.013);
  const sway = getIdleSway(time, 0.8, size * 0.003, size * 0.002);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#c0c8d8";
  const metalMid = "#8898a8";
  const metalDark = "#586878";
  const crystalBlue = "#38bdf8";
  const arcaneGold = "#fbbf24";

  const magicPulse = 0.5 + Math.sin(time * 3.5) * 0.3 + attackIntensity * 0.4;
  const elementCycle = time * 2;
  const floatHeight = Math.sin(time * 1.8) * size * 0.015;

  // Element colors cycling
  const elemColors = [
    `rgba(239, 68, 68, ${0.4 + Math.sin(elementCycle) * 0.2})`,
    `rgba(59, 130, 246, ${0.4 + Math.sin(elementCycle + TAU / 3) * 0.2})`,
    `rgba(34, 197, 94, ${0.4 + Math.sin(elementCycle + (2 * TAU) / 3) * 0.2})`,
    `rgba(168, 85, 247, ${0.4 + Math.sin(elementCycle + (3 * TAU) / 4) * 0.2})`,
  ];

  // === MULTI-ELEMENT AURA (behind body) ===
  const auraGrad = ctx.createRadialGradient(
    cx,
    y - bodyBob,
    0,
    cx,
    y - bodyBob,
    size * 0.75,
  );
  auraGrad.addColorStop(0, `rgba(56, 189, 248, ${magicPulse * 0.25})`);
  auraGrad.addColorStop(0.4, `rgba(139, 92, 246, ${magicPulse * 0.12})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(cx, y - bodyBob, size * 0.75, size * 0.5, 0, 0, TAU);
  ctx.fill();

  // Orbiting element particles
  for (let i = 0; i < 8; i++) {
    const orbitAngle = time * 2.5 + (i * TAU) / 8;
    const orbitDist = size * 0.45 + Math.sin(time * 1.5 + i) * size * 0.06;
    const px = cx + Math.cos(orbitAngle) * orbitDist;
    const py =
      y -
      size * 0.1 -
      bodyBob +
      Math.sin(orbitAngle) * orbitDist * 0.35 +
      floatHeight;
    ctx.fillStyle = elemColors[i % 4];
    ctx.beginPath();
    ctx.arc(
      px,
      py,
      size * 0.015 + Math.sin(time * 4 + i) * size * 0.005,
      0,
      TAU,
    );
    ctx.fill();
  }

  // Arcane research rings
  ctx.strokeStyle = `rgba(56, 189, 248, ${magicPulse * 0.3})`;
  ctx.lineWidth = 1.5 * zoom;
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = size * 0.35 + ring * size * 0.08;
    ctx.beginPath();
    ctx.arc(
      cx,
      y - bodyBob,
      ringSize,
      time * 1.5 + ring,
      time * 1.5 + ring + Math.PI,
    );
    ctx.stroke();
  }

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: metalDark,
    trimColor: crystalBlue,
    strideSpeed: 4,
    strideAmt: 0.24,
    legLen: 0.22,
    width: 0.1,
    footLen: 0.11,
    style: "armored",
  });

  // === ALCHEMIST COAT TAILS ===
  {
    const coatY = y - size * 0.02 - bodyBob;
    const tailSway = Math.sin(time * 2.5) * size * 0.01;
    for (const side of [-1, 1] as const) {
      const tailGrad = ctx.createLinearGradient(
        cx + side * size * 0.04, coatY,
        cx + side * size * 0.12, coatY + size * 0.18,
      );
      tailGrad.addColorStop(0, metalMid);
      tailGrad.addColorStop(0.5, metalDark);
      tailGrad.addColorStop(1, "#3a4a5a");
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      ctx.moveTo(cx + side * size * 0.04, coatY);
      ctx.lineTo(cx + side * size * 0.18, coatY);
      ctx.quadraticCurveTo(
        cx + side * size * 0.2 + tailSway * side,
        coatY + size * 0.1,
        cx + side * size * 0.16 + tailSway * side,
        coatY + size * 0.18,
      );
      ctx.lineTo(cx + side * size * 0.06 + tailSway * side * 0.5, coatY + size * 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = metalDark;
      ctx.lineWidth = 0.8 * zoom;
      ctx.stroke();
    }
  }

  // === PADDED ALCHEMIST VEST ===
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.scale(breath, breath);

  const vestGrad = ctx.createLinearGradient(
    -size * 0.28, -size * 0.22,
    size * 0.28, size * 0.22,
  );
  vestGrad.addColorStop(0, "#4a5568");
  vestGrad.addColorStop(0.2, metalDark);
  vestGrad.addColorStop(0.5, metalMid);
  vestGrad.addColorStop(0.8, metalDark);
  vestGrad.addColorStop(1, "#4a5568");
  ctx.fillStyle = vestGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, size * 0.16);
  ctx.lineTo(-size * 0.26, size * 0.02);
  ctx.lineTo(-size * 0.24, -size * 0.14);
  ctx.quadraticCurveTo(-size * 0.16, -size * 0.22, 0, -size * 0.24);
  ctx.quadraticCurveTo(size * 0.16, -size * 0.22, size * 0.24, -size * 0.14);
  ctx.lineTo(size * 0.26, size * 0.02);
  ctx.lineTo(size * 0.22, size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Vest lapel fold lines
  ctx.strokeStyle = "#3a4a5a";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.08, -size * 0.2);
  ctx.lineTo(-size * 0.1, size * 0.14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.08, -size * 0.2);
  ctx.lineTo(size * 0.1, size * 0.14);
  ctx.stroke();

  // Padded horizontal quilt lines
  ctx.strokeStyle = `rgba(58, 74, 90, 0.5)`;
  ctx.lineWidth = 0.7 * zoom;
  for (let q = 0; q < 4; q++) {
    const qy = -size * 0.1 + q * size * 0.07;
    ctx.beginPath();
    ctx.moveTo(-size * 0.22, qy);
    ctx.quadraticCurveTo(0, qy - size * 0.01, size * 0.22, qy);
    ctx.stroke();
  }

  // Silver/blue tabard with crystal emblem
  const tabardGrad = ctx.createLinearGradient(
    -size * 0.12,
    -size * 0.2,
    size * 0.12,
    size * 0.15,
  );
  tabardGrad.addColorStop(0, "#1e3a5a");
  tabardGrad.addColorStop(0.3, "#2a5070");
  tabardGrad.addColorStop(0.7, "#2a5070");
  tabardGrad.addColorStop(1, "#1e3a5a");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.12, -size * 0.22);
  ctx.lineTo(size * 0.14, size * 0.14);
  ctx.lineTo(-size * 0.14, size * 0.14);
  ctx.closePath();
  ctx.fill();

  // Crystal emblem
  ctx.fillStyle = `rgba(56, 189, 248, ${magicPulse * 0.6})`;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.12);
  ctx.lineTo(-size * 0.04, -size * 0.04);
  ctx.lineTo(0, size * 0.04);
  ctx.lineTo(size * 0.04, -size * 0.04);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // === HIGH BUTTONED COAT COLLAR ===
  {
    const collarY = y - size * 0.35 - bodyBob;
    const collarGrad = ctx.createLinearGradient(
      cx - size * 0.12, collarY - size * 0.04,
      cx + size * 0.12, collarY + size * 0.04,
    );
    collarGrad.addColorStop(0, "#4a5568");
    collarGrad.addColorStop(0.5, metalMid);
    collarGrad.addColorStop(1, "#4a5568");
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.12, collarY + size * 0.04);
    ctx.quadraticCurveTo(cx - size * 0.14, collarY - size * 0.02, cx - size * 0.08, collarY - size * 0.05);
    ctx.quadraticCurveTo(cx, collarY - size * 0.07, cx + size * 0.08, collarY - size * 0.05);
    ctx.quadraticCurveTo(cx + size * 0.14, collarY - size * 0.02, cx + size * 0.12, collarY + size * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = metalDark;
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Collar buttons
    for (let b = 0; b < 3; b++) {
      const bx = cx;
      const by = collarY - size * 0.04 + b * size * 0.025;
      ctx.fillStyle = arcaneGold;
      ctx.beginPath();
      ctx.arc(bx, by, size * 0.006, 0, TAU);
      ctx.fill();
    }
  }

  // === LEATHER SHOULDER STRAPS (with vial holders) ===
  for (const side of [-1, 1] as const) {
    const sx = cx + side * size * 0.22;
    const sy = y - size * 0.3 - bodyBob;
    // Leather strap
    ctx.fillStyle = "#5a4a38";
    ctx.beginPath();
    ctx.moveTo(sx - side * size * 0.06, sy - size * 0.06);
    ctx.lineTo(sx + side * size * 0.02, sy - size * 0.04);
    ctx.lineTo(sx + side * size * 0.04, sy + size * 0.08);
    ctx.lineTo(sx - side * size * 0.04, sy + size * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3e3225";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Strap buckle
    ctx.fillStyle = arcaneGold;
    ctx.fillRect(sx - size * 0.012, sy - size * 0.01, size * 0.024, size * 0.015);
    // Vial holder (small glass vial)
    ctx.fillStyle = `rgba(56, 189, 248, 0.4)`;
    ctx.fillRect(sx + side * size * 0.01, sy + size * 0.02, size * 0.012, size * 0.035);
    ctx.strokeStyle = metalLight;
    ctx.lineWidth = 0.5 * zoom;
    ctx.strokeRect(sx + side * size * 0.01, sy + size * 0.02, size * 0.012, size * 0.035);
    // Vial cap
    ctx.fillStyle = arcaneGold;
    ctx.fillRect(sx + side * size * 0.008, sy + size * 0.015, size * 0.016, size * 0.007);
  }

  // Multi-element gems on each shoulder strap
  const gemColors = ["#ef4444", "#3b82f6", "#fbbf24", "#22c55e"];
  for (const side of [-1, 1] as const) {
    const pGemIdx = side === -1 ? 0 : 2;
    const pGemX = cx + side * size * 0.26;
    const pGemY = y - size * 0.32 - bodyBob;
    // Primary gem
    ctx.fillStyle = `rgba(${side === -1 ? "239, 68, 68" : "251, 191, 36"}, ${magicPulse * 0.7})`;
    ctx.beginPath();
    ctx.arc(pGemX, pGemY, size * 0.012, 0, TAU);
    ctx.fill();
    // Secondary gem (offset)
    ctx.fillStyle = `rgba(${side === -1 ? "59, 130, 246" : "34, 197, 94"}, ${magicPulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(pGemX + side * size * 0.018, pGemY + size * 0.01, size * 0.008, 0, TAU);
    ctx.fill();
    // Gem glow
    ctx.fillStyle = `rgba(255, 255, 255, ${magicPulse * 0.2})`;
    ctx.beginPath();
    ctx.arc(pGemX, pGemY, size * 0.02, 0, TAU);
    ctx.fill();
  }

  // === UTILITY BELT (tool loops, flask pouches) ===
  {
    const beltY = y - size * 0.04 - bodyBob;
    // Main belt strap
    ctx.fillStyle = "#5a4a38";
    ctx.fillRect(cx - size * 0.22, beltY - size * 0.018, size * 0.44, size * 0.036);
    ctx.strokeStyle = "#3e3225";
    ctx.lineWidth = 0.8 * zoom;
    ctx.strokeRect(cx - size * 0.22, beltY - size * 0.018, size * 0.44, size * 0.036);
    // Belt buckle (arcane symbol)
    ctx.fillStyle = arcaneGold;
    ctx.beginPath();
    ctx.arc(cx, beltY, size * 0.02, 0, TAU);
    ctx.fill();
    ctx.fillStyle = crystalBlue;
    ctx.beginPath();
    ctx.arc(cx, beltY, size * 0.01, 0, TAU);
    ctx.fill();
    // Tool loops (left side)
    for (let tl = 0; tl < 2; tl++) {
      const tlx = cx - size * 0.12 - tl * size * 0.06;
      ctx.fillStyle = "#4a3a28";
      ctx.fillRect(tlx - size * 0.01, beltY + size * 0.015, size * 0.02, size * 0.04);
      ctx.strokeStyle = "#3e3225";
      ctx.lineWidth = 0.5 * zoom;
      ctx.strokeRect(tlx - size * 0.01, beltY + size * 0.015, size * 0.02, size * 0.04);
    }
    // Flask pouches (right side)
    for (let fp = 0; fp < 2; fp++) {
      const fpx = cx + size * 0.1 + fp * size * 0.07;
      ctx.fillStyle = "#5a4a38";
      ctx.beginPath();
      ctx.ellipse(fpx, beltY + size * 0.035, size * 0.02, size * 0.025, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#3e3225";
      ctx.lineWidth = 0.5 * zoom;
      ctx.stroke();
      // Flask top peek
      ctx.fillStyle = `rgba(56, 189, 248, 0.35)`;
      ctx.beginPath();
      ctx.arc(fpx, beltY + size * 0.02, size * 0.008, 0, TAU);
      ctx.fill();
    }
  }

  // === LEFT ARM — elemental focus gem ===
  const gradForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: crystalBlue,
      upperLen: 0.16,
      foreLen: gradForeLen,
      width: 0.09,
      shoulderAngle: -0.6 + Math.sin(time * 2) * 0.06 + (isAttacking ? -attackIntensity * 0.3 : 0),
      elbowAngle: 0.7 + Math.sin(time * 2.5) * 0.06 + (isAttacking ? -attackIntensity * 0.2 : 0),
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = gradForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Outer elemental halo
        wCtx.fillStyle = `rgba(56, 189, 248, ${magicPulse * 0.15})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.02, size * 0.07, 0, TAU);
        wCtx.fill();
        // Elemental focus gem (floating multi-color crystal)
        wCtx.fillStyle = `rgba(56, 189, 248, ${magicPulse * 0.3})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.02, size * 0.05, 0, TAU);
        wCtx.fill();
        // Diamond crystal shape (outer)
        wCtx.fillStyle = `rgba(56, 189, 248, ${magicPulse * 0.5})`;
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.07);
        wCtx.lineTo(-size * 0.035, -size * 0.02);
        wCtx.lineTo(0, size * 0.03);
        wCtx.lineTo(size * 0.035, -size * 0.02);
        wCtx.closePath();
        wCtx.fill();
        // Inner crystal facet
        wCtx.fillStyle = `rgba(56, 189, 248, ${magicPulse * 0.9})`;
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.055);
        wCtx.lineTo(-size * 0.025, -size * 0.02);
        wCtx.lineTo(0, size * 0.015);
        wCtx.lineTo(size * 0.025, -size * 0.02);
        wCtx.closePath();
        wCtx.fill();
        // Crystal core highlight
        wCtx.fillStyle = `rgba(255, 255, 255, ${magicPulse * 0.5})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.025, size * 0.01, 0, TAU);
        wCtx.fill();
        // Element color cycling on crystal (larger, more visible)
        for (let e = 0; e < 4; e++) {
          const eA = time * 4 + (e * TAU) / 4;
          const eR = size * 0.03 + Math.sin(time * 3 + e) * size * 0.005;
          wCtx.fillStyle = elemColors[e];
          wCtx.beginPath();
          wCtx.arc(
            Math.cos(eA) * eR,
            -size * 0.02 + Math.sin(eA) * eR * 0.8,
            size * 0.01 + Math.sin(time * 6 + e) * size * 0.003,
            0,
            TAU,
          );
          wCtx.fill();
        }
        // Element cycling ring
        wCtx.strokeStyle = elemColors[Math.floor(time * 2) % 4];
        wCtx.lineWidth = size * 0.004;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.02, size * 0.045, time * 3, time * 3 + Math.PI);
        wCtx.stroke();
      },
    },
  );

  // === RIGHT ARM — research staff ===
  drawPathArm(
    ctx,
    cx + size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: crystalBlue,
      upperLen: 0.16,
      foreLen: gradForeLen,
      width: 0.09,
      shoulderAngle:
        0.4 +
        Math.sin(time * 2.5) * 0.08 +
        (isAttacking ? attackIntensity * 0.4 : 0),
      elbowAngle: 0.3 + Math.sin(time * 3) * 0.06,
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = gradForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Research staff shaft
        wCtx.fillStyle = "#4a5a6a";
        wCtx.fillRect(-size * 0.012, -size * 0.28, size * 0.024, size * 0.28);
        // Staff rune bands with glyphs
        wCtx.strokeStyle = arcaneGold;
        wCtx.lineWidth = 1.5 * zoom;
        for (let b = 0; b < 4; b++) {
          const bandY = -size * 0.05 - b * size * 0.05;
          wCtx.beginPath();
          wCtx.moveTo(-size * 0.018, bandY);
          wCtx.lineTo(size * 0.018, bandY);
          wCtx.stroke();
          // Tiny rune on each band
          wCtx.fillStyle = `rgba(251, 191, 36, ${magicPulse * 0.5})`;
          wCtx.font = `${size * 0.015}px serif`;
          wCtx.textAlign = "center";
          wCtx.fillText(["ᚠ", "ᚢ", "ᚦ", "ᚨ"][b], 0, bandY + size * 0.005);
        }
        // Staff head: arcane ring (larger)
        wCtx.strokeStyle = arcaneGold;
        wCtx.lineWidth = 2.5 * zoom;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.3, size * 0.035, 0, TAU);
        wCtx.stroke();
        // Inner ring
        wCtx.strokeStyle = `rgba(56, 189, 248, ${magicPulse * 0.6})`;
        wCtx.lineWidth = 1 * zoom;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.3, size * 0.025, 0, TAU);
        wCtx.stroke();
        // Crystal in center
        wCtx.fillStyle = `rgba(56, 189, 248, ${magicPulse})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.3, size * 0.017, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(255, 255, 255, ${magicPulse * 0.4})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.3, size * 0.008, 0, TAU);
        wCtx.fill();
        // Floating research rune bands around staff head
        wCtx.strokeStyle = `rgba(251, 191, 36, ${magicPulse * 0.4})`;
        wCtx.lineWidth = 0.8 * zoom;
        for (let rb = 0; rb < 3; rb++) {
          const rbAngle = time * 3 + (rb * TAU) / 3;
          wCtx.beginPath();
          wCtx.arc(
            0,
            -size * 0.3,
            size * 0.045 + rb * size * 0.008,
            rbAngle,
            rbAngle + Math.PI * 0.6,
          );
          wCtx.stroke();
        }
      },
    },
  );

  // === HEAD — Clockwork top hat + orrery (steampunk; no plume) ===
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;
  // Face
  const gradFaceGrad = ctx.createRadialGradient(headX, headY + size * 0.01, 0, headX, headY, size * 0.14);
  gradFaceGrad.addColorStop(0, "#d8c0a0");
  gradFaceGrad.addColorStop(0.7, "#b8a078");
  gradFaceGrad.addColorStop(1, "#987848");
  ctx.fillStyle = gradFaceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.14, 0, TAU);
  ctx.fill();
  // Tired eyes (bags under eyes)
  for (const eSide of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(headX + eSide * size * 0.045, headY - size * 0.01, size * 0.02, size * 0.014, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = crystalBlue;
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.045, headY - size * 0.01, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.045, headY - size * 0.01, size * 0.004, 0, TAU);
    ctx.fill();
    // Eye bags
    ctx.strokeStyle = "rgba(120,90,60,0.3)";
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.045, headY + size * 0.01, size * 0.018, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  const chalkGlow = 0.4 + Math.sin(time * 3) * 0.25 + attackIntensity * 0.3;

  // Tall top hat: brim at brow → crown top at headY - size * 0.35
  const brimY = headY - size * 0.11;
  const hatTopY = headY - size * 0.35;
  const crownW = size * 0.095;
  const bandY = brimY - size * 0.1;

  // Wide brim + brass edge trim
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.ellipse(headX, brimY, size * 0.155, size * 0.048, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1.4 * zoom;
  ctx.beginPath();
  ctx.ellipse(headX, brimY, size * 0.155, size * 0.048, 0, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(201, 162, 39, ${0.35 + chalkGlow * 0.25})`;
  ctx.lineWidth = 0.6 * zoom;
  ctx.beginPath();
  ctx.ellipse(headX, brimY - size * 0.006, size * 0.148, size * 0.042, 0, 0, TAU);
  ctx.stroke();

  // Cylindrical crown body
  const hatGrad = ctx.createLinearGradient(headX - crownW, hatTopY, headX + crownW, brimY);
  hatGrad.addColorStop(0, "#3d4a5c");
  hatGrad.addColorStop(0.45, "#1e293b");
  hatGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = hatGrad;
  ctx.fillRect(headX - crownW, hatTopY, crownW * 2, brimY - hatTopY - size * 0.025);
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(headX - crownW * 0.85, hatTopY, crownW * 0.22, brimY - hatTopY - size * 0.025);

  // Hat band (darker) + brass gear decorations
  ctx.fillStyle = "#0c1220";
  ctx.fillRect(headX - crownW * 1.02, bandY - size * 0.022, crownW * 2.04, size * 0.044);
  ctx.strokeStyle = "#8a7018";
  ctx.lineWidth = 0.8 * zoom;
  ctx.strokeRect(headX - crownW * 1.02, bandY - size * 0.022, crownW * 2.04, size * 0.044);

  const gearPlacements: { ox: number; sc: number; spd: number; teeth: number }[] = [
    { ox: -size * 0.058, sc: 1, spd: 0.85, teeth: 8 },
    { ox: size * 0.012, sc: 0.62, spd: -1.15, teeth: 6 },
    { ox: size * 0.062, sc: 0.48, spd: 1.35, teeth: 7 },
  ];
  for (const gp of gearPlacements) {
    const gx = headX + gp.ox;
    const gy = bandY;
    const gr = size * 0.03 * gp.sc;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(time * gp.spd);
    ctx.fillStyle = "#c9a227";
    ctx.beginPath();
    ctx.arc(0, 0, gr * 0.45, 0, TAU);
    ctx.fill();
    for (let t = 0; t < gp.teeth; t++) {
      const ta = (t / gp.teeth) * TAU;
      ctx.fillStyle = "#b8860b";
      ctx.beginPath();
      ctx.arc(Math.cos(ta) * gr * 0.72, Math.sin(ta) * gr * 0.72, gr * 0.22, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#6b5410";
    ctx.beginPath();
    ctx.arc(0, 0, gr * 0.2, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Crown top cap
  ctx.fillStyle = "#252d3d";
  ctx.beginPath();
  ctx.ellipse(headX, hatTopY, crownW, size * 0.038, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 0.6 * zoom;
  ctx.stroke();

  // Orrery on top: central brass sphere + orbiting bodies (time * 2)
  const orreryY = hatTopY - size * 0.028;
  const orbitPhase = time * 2;
  ctx.fillStyle = "#d4af37";
  ctx.beginPath();
  ctx.arc(headX, orreryY, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 255, 255, ${chalkGlow * 0.35})`;
  ctx.beginPath();
  ctx.arc(headX - size * 0.006, orreryY - size * 0.006, size * 0.006, 0, TAU);
  ctx.fill();

  const orbits: { rad: number; phase: number; col: string; dot: number }[] = [
    { rad: size * 0.055, phase: 0, col: "#94a3b8", dot: 0.014 },
    { rad: size * 0.078, phase: (TAU * 2) / 3, col: "#fbbf24", dot: 0.011 },
    { rad: size * 0.095, phase: TAU / 3, col: crystalBlue, dot: 0.009 },
  ];
  for (const ob of orbits) {
    const ang = orbitPhase + ob.phase;
    const px = headX + Math.cos(ang) * ob.rad;
    const py = orreryY + Math.sin(ang) * ob.rad * 0.42;
    ctx.strokeStyle = "rgba(100, 90, 70, 0.75)";
    ctx.lineWidth = 0.55 * zoom;
    ctx.beginPath();
    ctx.moveTo(headX, orreryY);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.fillStyle = ob.col;
    ctx.beginPath();
    ctx.arc(px, py, size * ob.dot, 0, TAU);
    ctx.fill();
  }

  // Crystal lens embedded in hat front
  const lensY = hatTopY + (brimY - hatTopY) * 0.52;
  setShadowBlur(ctx, 7 * zoom, crystalBlue);
  ctx.fillStyle = `rgba(56, 189, 248, ${magicPulse * 0.55})`;
  ctx.beginPath();
  ctx.ellipse(headX, lensY, size * 0.038, size * 0.05, 0, 0, TAU);
  ctx.fill();
  clearShadow(ctx);
  ctx.strokeStyle = `rgba(201, 162, 39, ${0.7 + chalkGlow * 0.2})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.ellipse(headX, lensY, size * 0.038, size * 0.05, 0, 0, TAU);
  ctx.stroke();
  ctx.fillStyle = `rgba(232, 224, 208, ${chalkGlow * 0.25})`;
  ctx.beginPath();
  ctx.ellipse(headX - size * 0.012, lensY - size * 0.014, size * 0.01, size * 0.008, 0, 0, TAU);
  ctx.fill();

  // Steam wisps (translucent, rising)
  for (let sw = 0; sw < 3; sw++) {
    const drift = Math.sin(time * 1.8 + sw * 1.7) * size * 0.012;
    const rise = (time * 0.35 + sw * 0.9) % 1;
    const wy = hatTopY - rise * size * 0.12 - sw * size * 0.02;
    const wx = headX + (sw - 1) * size * 0.045 + drift;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + (1 - rise) * 0.14 + chalkGlow * 0.06})`;
    ctx.beginPath();
    ctx.arc(wx, wy, size * (0.022 + sw * 0.004), 0, TAU);
    ctx.fill();
  }

  // Thin brass monocle chain → right eye
  const chainStartX = headX + size * 0.1;
  const chainStartY = bandY - size * 0.01;
  const eyeRX = headX + size * 0.045;
  const eyeRY = headY - size * 0.01;
  ctx.strokeStyle = `rgba(201, 162, 39, ${0.75 + chalkGlow * 0.15})`;
  ctx.lineWidth = 0.65 * zoom;
  ctx.setLineDash([size * 0.012, size * 0.008]);
  ctx.beginPath();
  ctx.moveTo(chainStartX, chainStartY);
  ctx.quadraticCurveTo(headX + size * 0.13, headY - size * 0.07, eyeRX, eyeRY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.arc(eyeRX, eyeRY, size * 0.013, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(56, 189, 248, ${magicPulse * 0.45})`;
  ctx.lineWidth = 0.5 * zoom;
  ctx.beginPath();
  ctx.arc(eyeRX, eyeRY, size * 0.009, 0, TAU);
  ctx.stroke();

  // === VFX ===
  drawArcaneSparkles(
    ctx,
    cx,
    y - size * 0.15 - bodyBob,
    size * 0.4,
    time,
    zoom,
    {
      color: "rgba(56, 189, 248, 0.6)",
      count: isAttacking ? 10 : 6,
      speed: 2,
      maxAlpha: 0.5,
      sparkleSize: 0.06,
    },
  );

  drawShiftingSegments(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(56, 189, 248, 0.5)",
    colorAlt: "rgba(139, 92, 246, 0.4)",
    count: 5,
    orbitRadius: 0.38,
    segmentSize: 0.022,
    orbitSpeed: 1.8,
    shape: "diamond",
  });

  // Visor glow
  setShadowBlur(ctx, 8 * zoom, crystalBlue);
  ctx.fillStyle = crystalBlue;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.06,
      headY + size * 0.01,
      size * 0.012,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);
}

// ============================================================================
// 6. PROFESSOR — ELDER ARCANIST
//    Chalk magic/classroom theme with deep blue/gold academic armor
// ============================================================================

export function drawProfessorEnemy(
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
  const breath = getBreathScale(time, 1.2, 0.012);
  const sway = getIdleSway(time, 0.7, size * 0.003, size * 0.002);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#b8a880";
  const metalMid = "#8a7a58";
  const metalDark = "#5a4a38";
  const accentGold = "#fbbf24";
  const chalkWhite = "#e8e0d0";
  const deepBlue = "#1e3a8a";

  const wisdomPulse = 0.5 + Math.sin(time * 2.5) * 0.3 + attackIntensity * 0.4;
  const chalkGlow = 0.4 + Math.sin(time * 3) * 0.25 + attackIntensity * 0.3;

  // === WISDOM AURA (behind body) ===
  const auraGrad = ctx.createRadialGradient(
    cx,
    y - bodyBob,
    0,
    cx,
    y - bodyBob,
    size * 0.8,
  );
  auraGrad.addColorStop(0, `rgba(251, 191, 36, ${wisdomPulse * 0.2})`);
  auraGrad.addColorStop(0.4, `rgba(30, 58, 138, ${wisdomPulse * 0.1})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(cx, y - bodyBob, size * 0.8, size * 0.5, 0, 0, TAU);
  ctx.fill();

  // Wisdom aura inner glow
  const wisdomInnerGrad = ctx.createRadialGradient(
    cx,
    y - size * 0.2 - bodyBob,
    0,
    cx,
    y - size * 0.2 - bodyBob,
    size * 0.45,
  );
  wisdomInnerGrad.addColorStop(
    0,
    `rgba(251, 191, 36, ${wisdomPulse * 0.12})`,
  );
  wisdomInnerGrad.addColorStop(
    0.6,
    `rgba(251, 191, 36, ${wisdomPulse * 0.05})`,
  );
  wisdomInnerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = wisdomInnerGrad;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    y - size * 0.2 - bodyBob,
    size * 0.45,
    size * 0.3,
    0,
    0,
    TAU,
  );
  ctx.fill();

  // Floating chalk equations (more elaborate)
  ctx.fillStyle = `rgba(232, 224, 208, ${chalkGlow * 0.5})`;
  ctx.font = `${size * 0.05}px serif`;
  ctx.textAlign = "center";
  const equations = [
    "∫dx",
    "∇²ψ",
    "E=mc²",
    "ΔS≥0",
    "∂f/∂x",
    "λ=h/p",
    "F=ma",
    "∮B·dl",
  ];
  for (let i = 0; i < 8; i++) {
    const eqAngle = time * 0.8 + (i * TAU) / 8;
    const eqDist =
      size * 0.5 + Math.sin(time * 1.5 + i) * size * 0.06 + (i % 2) * size * 0.08;
    const eqX = cx + Math.cos(eqAngle) * eqDist;
    const eqY = y - size * 0.1 - bodyBob + Math.sin(eqAngle) * eqDist * 0.35;
    const eqAlpha = 0.3 + Math.sin(time * 2 + i) * 0.15;
    ctx.save();
    ctx.translate(eqX, eqY);
    ctx.rotate(Math.sin(time * 2 + i) * 0.15);
    ctx.globalAlpha = eqAlpha;
    ctx.fillText(equations[i], 0, 0);
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // Connecting chalk lines between some equations
  ctx.strokeStyle = `rgba(232, 224, 208, ${chalkGlow * 0.2})`;
  ctx.lineWidth = 0.8 * zoom;
  for (let i = 0; i < 4; i++) {
    const a1 = time * 0.8 + (i * TAU) / 8;
    const a2 = time * 0.8 + ((i + 1) * TAU) / 8;
    const d1 = size * 0.5;
    const d2 = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(
      cx + Math.cos(a1) * d1,
      y - size * 0.1 - bodyBob + Math.sin(a1) * d1 * 0.35,
    );
    ctx.lineTo(
      cx + Math.cos(a2) * d2,
      y - size * 0.1 - bodyBob + Math.sin(a2) * d2 * 0.35,
    );
    ctx.stroke();
  }

  // Chalk dust particles
  drawEmberSparks(ctx, cx, y - size * 0.15 - bodyBob, size * 0.35, time, zoom, {
    color: "rgba(232, 224, 208, 0.5)",
    coreColor: "rgba(251, 191, 36, 0.2)",
    count: isAttacking ? 8 : 5,
    speed: 1.5,
    maxAlpha: 0.4,
    sparkSize: 0.06,
  });

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: metalDark,
    trimColor: accentGold,
    strideSpeed: 3,
    strideAmt: 0.18,
    legLen: 0.24,
    width: 0.1,
    footLen: 0.11,
    style: "armored",
  });

  // === FLOWING ROBE HEM ===
  {
    const hemY = y - size * 0.02 - bodyBob;
    const hemWave = Math.sin(time * 2) * size * 0.012;
    const hemGrad = ctx.createLinearGradient(
      cx, hemY, cx, hemY + size * 0.2,
    );
    hemGrad.addColorStop(0, deepBlue);
    hemGrad.addColorStop(0.4, "#0f1d4a");
    hemGrad.addColorStop(1, "#0a1030");
    ctx.fillStyle = hemGrad;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.24, hemY);
    ctx.quadraticCurveTo(
      cx - size * 0.28 + hemWave, hemY + size * 0.12,
      cx - size * 0.22 + hemWave * 1.5, hemY + size * 0.2,
    );
    ctx.quadraticCurveTo(cx, hemY + size * 0.24 + hemWave, cx + size * 0.22 - hemWave * 1.5, hemY + size * 0.2);
    ctx.quadraticCurveTo(
      cx + size * 0.28 - hemWave, hemY + size * 0.12,
      cx + size * 0.24, hemY,
    );
    ctx.closePath();
    ctx.fill();
    // Gold trim along hem edge
    ctx.strokeStyle = accentGold;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.22 + hemWave * 1.5, hemY + size * 0.2);
    ctx.quadraticCurveTo(cx, hemY + size * 0.24 + hemWave, cx + size * 0.22 - hemWave * 1.5, hemY + size * 0.2);
    ctx.stroke();
  }

  // === LAYERED WIZARD ROBES ===
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.scale(breath, breath);

  // Outer robe layer (midnight blue)
  const robeGrad = ctx.createLinearGradient(
    -size * 0.3, -size * 0.24,
    size * 0.3, size * 0.2,
  );
  robeGrad.addColorStop(0, "#0a1030");
  robeGrad.addColorStop(0.2, "#0f1d4a");
  robeGrad.addColorStop(0.5, deepBlue);
  robeGrad.addColorStop(0.8, "#0f1d4a");
  robeGrad.addColorStop(1, "#0a1030");
  ctx.fillStyle = robeGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.26, size * 0.18);
  ctx.lineTo(-size * 0.28, size * 0.04);
  ctx.quadraticCurveTo(-size * 0.28, -size * 0.12, -size * 0.2, -size * 0.22);
  ctx.quadraticCurveTo(-size * 0.1, -size * 0.27, 0, -size * 0.28);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.27, size * 0.2, -size * 0.22);
  ctx.quadraticCurveTo(size * 0.28, -size * 0.12, size * 0.28, size * 0.04);
  ctx.lineTo(size * 0.26, size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Inner robe fold (lighter blue visible at center opening)
  const innerGrad = ctx.createLinearGradient(
    -size * 0.06, -size * 0.2, size * 0.06, size * 0.16,
  );
  innerGrad.addColorStop(0, "#1e40af");
  innerGrad.addColorStop(1, "#1e3a8a");
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.06, -size * 0.22);
  ctx.lineTo(size * 0.06, -size * 0.22);
  ctx.lineTo(size * 0.08, size * 0.16);
  ctx.lineTo(-size * 0.08, size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Gold robe edge trim (left and right lapel)
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.24);
  ctx.quadraticCurveTo(-size * 0.12, 0, -size * 0.1, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.1, -size * 0.24);
  ctx.quadraticCurveTo(size * 0.12, 0, size * 0.1, size * 0.16);
  ctx.stroke();

  // Arcane star pattern woven into robe
  ctx.fillStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.15})`;
  for (let star = 0; star < 5; star++) {
    const sx = -size * 0.15 + (star % 3) * size * 0.1 + Math.sin(star * 2.1) * size * 0.04;
    const sy = -size * 0.12 + Math.floor(star / 3) * size * 0.14;
    ctx.beginPath();
    ctx.arc(sx, sy, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // Deep blue academic tabard with gold trim
  const tabardGrad = ctx.createLinearGradient(
    -size * 0.12,
    -size * 0.22,
    size * 0.12,
    size * 0.16,
  );
  tabardGrad.addColorStop(0, "#0f1d4a");
  tabardGrad.addColorStop(0.3, deepBlue);
  tabardGrad.addColorStop(0.7, deepBlue);
  tabardGrad.addColorStop(1, "#0f1d4a");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.15, size * 0.16);
  ctx.lineTo(-size * 0.15, size * 0.16);
  ctx.closePath();
  ctx.fill();

  // Gold trim on tabard edges
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, -size * 0.24);
  ctx.lineTo(-size * 0.15, size * 0.16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.15, size * 0.16);
  ctx.stroke();

  // Golden rune emblem
  ctx.fillStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.7})`;
  ctx.font = `${size * 0.08}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Φ", 0, -size * 0.04);

  ctx.restore();

  // === ROBE COLLAR WITH GOLD CLASP ===
  {
    const collarY = y - size * 0.35 - bodyBob;
    // High robe collar
    const collarGrad = ctx.createLinearGradient(
      cx - size * 0.14, collarY - size * 0.06,
      cx + size * 0.14, collarY + size * 0.04,
    );
    collarGrad.addColorStop(0, "#0f1d4a");
    collarGrad.addColorStop(0.5, deepBlue);
    collarGrad.addColorStop(1, "#0f1d4a");
    ctx.fillStyle = collarGrad;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.14, collarY + size * 0.04);
    ctx.quadraticCurveTo(cx - size * 0.16, collarY - size * 0.03, cx - size * 0.1, collarY - size * 0.06);
    ctx.quadraticCurveTo(cx, collarY - size * 0.08, cx + size * 0.1, collarY - size * 0.06);
    ctx.quadraticCurveTo(cx + size * 0.16, collarY - size * 0.03, cx + size * 0.14, collarY + size * 0.04);
    ctx.closePath();
    ctx.fill();
    // Gold trim on collar
    ctx.strokeStyle = accentGold;
    ctx.lineWidth = 1.2 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.1, collarY - size * 0.06);
    ctx.quadraticCurveTo(cx, collarY - size * 0.08, cx + size * 0.1, collarY - size * 0.06);
    ctx.stroke();
    // Central gold clasp
    ctx.fillStyle = accentGold;
    ctx.beginPath();
    ctx.moveTo(cx, collarY - size * 0.04);
    ctx.lineTo(cx - size * 0.015, collarY);
    ctx.lineTo(cx, collarY + size * 0.02);
    ctx.lineTo(cx + size * 0.015, collarY);
    ctx.closePath();
    ctx.fill();
    // Clasp gem
    ctx.fillStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(cx, collarY, size * 0.008, 0, TAU);
    ctx.fill();
  }

  // === GOLDEN TENURE CHAIN NECKLACE ===
  const profChainY = y - size * 0.33 - bodyBob;
  ctx.strokeStyle = `rgba(251, 191, 36, ${0.75 + Math.sin(time * 1.5) * 0.1})`;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.arc(cx, profChainY + size * 0.02, size * 0.12, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  // Chain link detail
  ctx.lineWidth = 1 * zoom;
  for (let cl = 0; cl < 5; cl++) {
    const clAngle = Math.PI * 0.2 + cl * Math.PI * 0.15;
    const clX = cx + Math.cos(clAngle) * size * 0.12;
    const clY = profChainY + size * 0.02 + Math.sin(clAngle) * size * 0.12;
    ctx.beginPath();
    ctx.ellipse(clX, clY, size * 0.006, size * 0.004, clAngle, 0, TAU);
    ctx.stroke();
  }
  // Medallion pendant
  const medY = profChainY + size * 0.12;
  ctx.fillStyle = accentGold;
  ctx.beginPath();
  ctx.arc(cx, medY, size * 0.022, 0, TAU);
  ctx.fill();
  ctx.fillStyle = deepBlue;
  ctx.beginPath();
  ctx.arc(cx, medY, size * 0.015, 0, TAU);
  ctx.fill();
  ctx.fillStyle = accentGold;
  ctx.font = `bold ${size * 0.018}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("T", cx, medY);

  // === CRYSTAL BROOCH CLASPS AT SHOULDERS ===
  for (const side of [-1, 1] as const) {
    const bx = cx + side * size * 0.26;
    const by = y - size * 0.32 - bodyBob;
    // Fabric drape at shoulder
    ctx.fillStyle = deepBlue;
    ctx.beginPath();
    ctx.ellipse(bx, by + size * 0.02, size * 0.06, size * 0.03, side * 0.3, 0, TAU);
    ctx.fill();
    // Crystal brooch outer ring
    ctx.fillStyle = accentGold;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.022, 0, TAU);
    ctx.fill();
    // Crystal gem center
    ctx.fillStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.9})`;
    ctx.beginPath();
    ctx.arc(bx, by, size * 0.014, 0, TAU);
    ctx.fill();
    // Crystal inner highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${wisdomPulse * 0.4})`;
    ctx.beginPath();
    ctx.arc(bx - size * 0.004, by - size * 0.004, size * 0.006, 0, TAU);
    ctx.fill();
    // Radial facet lines
    ctx.strokeStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.5})`;
    ctx.lineWidth = 0.6 * zoom;
    for (let f = 0; f < 4; f++) {
      const fa = (f * TAU) / 4 + time * 0.5;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(fa) * size * 0.014, by + Math.sin(fa) * size * 0.014);
      ctx.lineTo(bx + Math.cos(fa) * size * 0.025, by + Math.sin(fa) * size * 0.025);
      ctx.stroke();
    }
  }

  // === GOLD SASH / CORD BELT ===
  {
    const sashY = y - size * 0.04 - bodyBob;
    // Sash wrap
    const sashGrad = ctx.createLinearGradient(
      cx - size * 0.24, sashY,
      cx + size * 0.24, sashY,
    );
    sashGrad.addColorStop(0, "#d4a010");
    sashGrad.addColorStop(0.3, accentGold);
    sashGrad.addColorStop(0.7, accentGold);
    sashGrad.addColorStop(1, "#d4a010");
    ctx.fillStyle = sashGrad;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.24, sashY - size * 0.015);
    ctx.quadraticCurveTo(cx, sashY - size * 0.025, cx + size * 0.24, sashY - size * 0.015);
    ctx.lineTo(cx + size * 0.24, sashY + size * 0.015);
    ctx.quadraticCurveTo(cx, sashY + size * 0.005, cx - size * 0.24, sashY + size * 0.015);
    ctx.closePath();
    ctx.fill();
    // Hanging sash ends (left side)
    ctx.fillStyle = accentGold;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.06, sashY + size * 0.01);
    ctx.quadraticCurveTo(cx - size * 0.08, sashY + size * 0.06, cx - size * 0.1, sashY + size * 0.1);
    ctx.lineTo(cx - size * 0.06, sashY + size * 0.09);
    ctx.quadraticCurveTo(cx - size * 0.04, sashY + size * 0.05, cx - size * 0.02, sashY + size * 0.01);
    ctx.closePath();
    ctx.fill();
    // Sash knot at center
    ctx.fillStyle = "#d4a010";
    ctx.beginPath();
    ctx.ellipse(cx, sashY, size * 0.02, size * 0.015, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();
  }

  // === LEFT ARM — chalk wand ===
  const profForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: accentGold,
      upperLen: 0.16,
      foreLen: profForeLen,
      width: 0.1,
      shoulderAngle:
        -0.7 +
        Math.sin(time * 1.5) * 0.08 +
        (isAttacking ? -attackIntensity * 0.3 : 0),
      elbowAngle: 0.5 + Math.sin(time * 2) * 0.06,
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = profForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Chalk wand shaft
        wCtx.fillStyle = chalkWhite;
        wCtx.fillRect(-size * 0.008, -size * 0.18, size * 0.016, size * 0.18);
        // Wand grip section
        wCtx.fillStyle = "#c8b880";
        wCtx.fillRect(-size * 0.01, -size * 0.03, size * 0.02, size * 0.04);
        // Gold ferrule
        wCtx.fillStyle = accentGold;
        wCtx.fillRect(-size * 0.01, -size * 0.04, size * 0.02, size * 0.008);
        // Wand tip glow (larger)
        wCtx.fillStyle = `rgba(251, 191, 36, ${chalkGlow * 0.3})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.18, size * 0.025, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(251, 191, 36, ${chalkGlow * 0.7})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.18, size * 0.015, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(255, 255, 255, ${chalkGlow * 0.5})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.18, size * 0.008, 0, TAU);
        wCtx.fill();
        // Chalk dust trailing (more particles)
        for (let d = 0; d < 6; d++) {
          const dPhase = (time * 2 + d * 0.3) % 1.2;
          const dDrift = Math.sin(time * 3 + d * 1.5) * size * 0.025;
          wCtx.fillStyle = `rgba(232, 224, 208, ${(1 - dPhase / 1.2) * 0.45})`;
          wCtx.beginPath();
          wCtx.arc(
            dDrift,
            -size * 0.18 - dPhase * size * 0.08,
            size * 0.005 * (1 - dPhase / 2),
            0,
            TAU,
          );
          wCtx.fill();
        }
        // Chalk writing trace in air
        wCtx.strokeStyle = `rgba(232, 224, 208, ${chalkGlow * 0.3})`;
        wCtx.lineWidth = size * 0.004;
        wCtx.beginPath();
        wCtx.moveTo(0, -size * 0.18);
        wCtx.quadraticCurveTo(
          size * 0.03 * Math.sin(time * 3),
          -size * 0.22,
          size * 0.02 * Math.cos(time * 2),
          -size * 0.25,
        );
        wCtx.stroke();
      },
    },
  );

  // === RIGHT ARM — ancient codex ===
  drawPathArm(
    ctx,
    cx + size * 0.28,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: accentGold,
      upperLen: 0.16,
      foreLen: profForeLen,
      width: 0.1,
      shoulderAngle: 0.4 + Math.sin(time * 2) * 0.06 + (isAttacking ? -attackIntensity * 0.25 : 0),
      elbowAngle: 0.85 + Math.sin(time * 2.5) * 0.05 + (isAttacking ? -attackIntensity * 0.2 : 0),
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = profForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Ancient codex cover (held open)
        wCtx.fillStyle = "#3a2a18";
        wCtx.fillRect(-size * 0.08, -size * 0.06, size * 0.16, size * 0.12);
        // Spine detail
        wCtx.fillStyle = "#2a1a10";
        wCtx.fillRect(-size * 0.082, -size * 0.04, size * 0.012, size * 0.08);
        // Gold corner clasps
        wCtx.fillStyle = accentGold;
        wCtx.fillRect(-size * 0.08, -size * 0.06, size * 0.025, size * 0.025);
        wCtx.fillRect(size * 0.055, -size * 0.06, size * 0.025, size * 0.025);
        wCtx.fillRect(-size * 0.08, size * 0.035, size * 0.025, size * 0.025);
        wCtx.fillRect(size * 0.055, size * 0.035, size * 0.025, size * 0.025);
        // Gold trim border
        wCtx.strokeStyle = accentGold;
        wCtx.lineWidth = size * 0.004;
        wCtx.strokeRect(-size * 0.075, -size * 0.055, size * 0.15, size * 0.11);
        // Glowing pages (dual-page spread)
        wCtx.fillStyle = `rgba(232, 224, 208, ${0.7 + Math.sin(time * 3) * 0.15})`;
        wCtx.fillRect(-size * 0.06, -size * 0.04, size * 0.055, size * 0.08);
        wCtx.fillRect(size * 0.008, -size * 0.04, size * 0.055, size * 0.08);
        // Center binding
        wCtx.fillStyle = "#3a2a18";
        wCtx.fillRect(-size * 0.004, -size * 0.04, size * 0.008, size * 0.08);
        // Text lines on left page
        wCtx.fillStyle = `rgba(30, 58, 138, ${wisdomPulse * 0.5})`;
        for (let l = 0; l < 5; l++) {
          wCtx.fillRect(
            -size * 0.05,
            -size * 0.035 + l * size * 0.014,
            size * 0.04,
            size * 0.004,
          );
        }
        // Arcane diagram on right page
        wCtx.strokeStyle = `rgba(30, 58, 138, ${wisdomPulse * 0.4})`;
        wCtx.lineWidth = size * 0.003;
        wCtx.beginPath();
        wCtx.arc(size * 0.035, -size * 0.005, size * 0.02, 0, TAU);
        wCtx.stroke();
        wCtx.beginPath();
        for (let pt = 0; pt < 5; pt++) {
          const ptA = (pt * TAU) / 5 - Math.PI / 2;
          const ptX = size * 0.035 + Math.cos(ptA) * size * 0.015;
          const ptY = -size * 0.005 + Math.sin(ptA) * size * 0.015;
          if (pt === 0) wCtx.moveTo(ptX, ptY);
          else wCtx.lineTo(ptX, ptY);
        }
        wCtx.closePath();
        wCtx.stroke();
        // Page glow
        wCtx.fillStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.12})`;
        wCtx.fillRect(-size * 0.06, -size * 0.04, size * 0.12, size * 0.08);
      },
    },
  );

  // === HEAD — Grand papal mitre (NOT template helm) ===
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;
  // Distinguished aged face
  const profFaceGrad = ctx.createRadialGradient(headX, headY + size * 0.01, 0, headX, headY, size * 0.14);
  profFaceGrad.addColorStop(0, "#e8d0b0");
  profFaceGrad.addColorStop(0.7, "#c8a880");
  profFaceGrad.addColorStop(1, "#a88060");
  ctx.fillStyle = profFaceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.14, 0, TAU);
  ctx.fill();
  // Wise eyes with gold gleam
  for (const eSide of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(headX + eSide * size * 0.045, headY - size * 0.01, size * 0.02, size * 0.014, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = accentGold;
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.045, headY - size * 0.01, size * 0.008, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.045, headY - size * 0.01, size * 0.004, 0, TAU);
    ctx.fill();
  }
  // Bushy eyebrows
  ctx.fillStyle = "#9ca3af";
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(headX + eSide * size * 0.045, headY - size * 0.03, size * 0.025, size * 0.006, eSide * 0.2, 0, TAU);
    ctx.fill();
  }
  // Short beard
  ctx.fillStyle = "#9ca3af";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.08, headY + size * 0.06);
  ctx.quadraticCurveTo(headX, headY + size * 0.14, headX + size * 0.08, headY + size * 0.06);
  ctx.quadraticCurveTo(headX, headY + size * 0.1, headX - size * 0.08, headY + size * 0.06);
  ctx.fill();
  // Stern mouth
  ctx.strokeStyle = "#8a6a4a";
  ctx.lineWidth = 1.2 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.03, headY + size * 0.05);
  ctx.lineTo(headX + size * 0.03, headY + size * 0.05);
  ctx.stroke();
  // Silver hair (sides)
  ctx.fillStyle = "#b0b8c0";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.13, headY - size * 0.04);
  ctx.quadraticCurveTo(headX - size * 0.16, headY + size * 0.04, headX - size * 0.12, headY + size * 0.08);
  ctx.quadraticCurveTo(headX - size * 0.1, headY + size * 0.02, headX - size * 0.13, headY - size * 0.04);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(headX + size * 0.13, headY - size * 0.04);
  ctx.quadraticCurveTo(headX + size * 0.16, headY + size * 0.04, headX + size * 0.12, headY + size * 0.08);
  ctx.quadraticCurveTo(headX + size * 0.1, headY + size * 0.02, headX + size * 0.13, headY - size * 0.04);
  ctx.fill();

  // —— Grand papal mitre (two-pointed bishop's hat) ——
  const mitreBaseY = headY - size * 0.09;
  const mitrePeakY = headY - size * 0.45;
  const mitreDipY = headY - size * 0.33;
  const mitreHalfW = size * 0.1;
  const peakOut = size * 0.125;
  const mitreNavy = "#0c1a3a";
  const mitreNavyMid = "#152a5c";

  // Lappets (ribbon strips, back/sides)
  for (const lapSide of [-1, 1] as const) {
    const lx = headX + lapSide * size * 0.07;
    ctx.fillStyle = mitreNavy;
    ctx.beginPath();
    ctx.moveTo(lx - lapSide * size * 0.025, mitreBaseY + size * 0.01);
    ctx.lineTo(lx + lapSide * size * 0.04, mitreBaseY + size * 0.24);
    ctx.lineTo(lx - lapSide * size * 0.02, mitreBaseY + size * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = accentGold;
    ctx.lineWidth = 1 * zoom;
    ctx.stroke();
  }

  // Divine authority glow (behind mitre silhouette)
  const divineGrad = ctx.createRadialGradient(
    headX,
    mitrePeakY + size * 0.12,
    0,
    headX,
    mitrePeakY + size * 0.08,
    size * 0.38,
  );
  divineGrad.addColorStop(0, `rgba(251, 191, 36, ${wisdomPulse * 0.28})`);
  divineGrad.addColorStop(0.45, `rgba(251, 191, 36, ${wisdomPulse * 0.1})`);
  divineGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = divineGrad;
  ctx.beginPath();
  ctx.ellipse(headX, mitrePeakY + size * 0.14, size * 0.22, size * 0.36, 0, 0, TAU);
  ctx.fill();

  // Mitre body: splayed peaks + curved cleft between
  const mitreFabricGrad = ctx.createLinearGradient(headX - mitreHalfW, mitrePeakY, headX + mitreHalfW, mitreBaseY);
  mitreFabricGrad.addColorStop(0, mitreNavyMid);
  mitreFabricGrad.addColorStop(0.35, deepBlue);
  mitreFabricGrad.addColorStop(0.65, mitreNavy);
  mitreFabricGrad.addColorStop(1, "#060d1f");
  ctx.fillStyle = mitreFabricGrad;
  ctx.beginPath();
  ctx.moveTo(headX - mitreHalfW, mitreBaseY);
  ctx.quadraticCurveTo(
    headX - mitreHalfW - size * 0.05,
    mitreBaseY - size * 0.18,
    headX - peakOut,
    mitrePeakY,
  );
  ctx.quadraticCurveTo(headX - peakOut * 0.22, mitreDipY - size * 0.02, headX, mitreDipY);
  ctx.quadraticCurveTo(headX + peakOut * 0.22, mitreDipY - size * 0.02, headX + peakOut, mitrePeakY);
  ctx.quadraticCurveTo(
    headX + mitreHalfW + size * 0.05,
    mitreBaseY - size * 0.18,
    headX + mitreHalfW,
    mitreBaseY,
  );
  ctx.quadraticCurveTo(headX, mitreBaseY + size * 0.022, headX - mitreHalfW, mitreBaseY);
  ctx.closePath();
  ctx.fill();

  // Fabric fold shading (metalDark)
  ctx.strokeStyle = metalDark;
  ctx.lineWidth = 1 * zoom;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(headX - mitreHalfW * 0.35, mitreBaseY - size * 0.02);
  ctx.quadraticCurveTo(headX - peakOut * 0.45, mitreDipY + size * 0.02, headX - peakOut * 0.65, mitrePeakY + size * 0.04);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(headX + mitreHalfW * 0.35, mitreBaseY - size * 0.02);
  ctx.quadraticCurveTo(headX + peakOut * 0.45, mitreDipY + size * 0.02, headX + peakOut * 0.65, mitrePeakY + size * 0.04);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Gold band at mitre base
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 2.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - mitreHalfW - size * 0.012, mitreBaseY);
  ctx.quadraticCurveTo(headX, mitreBaseY + size * 0.026, headX + mitreHalfW + size * 0.012, mitreBaseY);
  ctx.stroke();
  ctx.strokeStyle = `rgba(251, 191, 36, ${0.45 + wisdomPulse * 0.35})`;
  ctx.lineWidth = 1 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - mitreHalfW - size * 0.012, mitreBaseY - size * 0.004);
  ctx.quadraticCurveTo(headX, mitreBaseY + size * 0.02, headX + mitreHalfW + size * 0.012, mitreBaseY - size * 0.004);
  ctx.stroke();

  // Gold vertical trim (front face)
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 1.2 * zoom;
  for (const vx of [-0.42, 0, 0.42] as const) {
    ctx.beginPath();
    ctx.moveTo(headX + vx * mitreHalfW, mitreBaseY - size * 0.03);
    ctx.lineTo(headX + vx * peakOut * 0.55, mitreDipY + size * 0.02);
    ctx.stroke();
  }
  // Gold horizontal trim bands
  for (let hb = 0; hb < 3; hb++) {
    const hy = mitreBaseY - size * (0.06 + hb * 0.095);
    const span = mitreHalfW * (0.75 - hb * 0.08);
    ctx.beginPath();
    ctx.moveTo(headX - span, hy);
    ctx.lineTo(headX + span, hy);
    ctx.stroke();
  }

  // Gold embroidered cross / seal (front)
  ctx.strokeStyle = accentGold;
  ctx.lineWidth = 2 * zoom;
  const crossMidY = mitreBaseY - size * 0.1;
  const crossTopY = mitreDipY + size * 0.04;
  ctx.beginPath();
  ctx.moveTo(headX, crossTopY);
  ctx.lineTo(headX, crossMidY + size * 0.06);
  ctx.moveTo(headX - size * 0.045, crossMidY);
  ctx.lineTo(headX + size * 0.045, crossMidY);
  ctx.stroke();
  ctx.strokeStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.85})`;
  ctx.lineWidth = 0.9 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX, crossTopY + size * 0.015);
  ctx.lineTo(headX, crossMidY + size * 0.045);
  ctx.moveTo(headX - size * 0.032, crossMidY);
  ctx.lineTo(headX + size * 0.032, crossMidY);
  ctx.stroke();
  ctx.fillStyle = `rgba(251, 191, 36, ${wisdomPulse * 0.25})`;
  ctx.beginPath();
  ctx.arc(headX, crossMidY, size * 0.028, 0, TAU);
  ctx.fill();

  // Ruby gems (center brow + each peak) with glow
  const rubyR = size * 0.016;
  const rubyCenters: [number, number][] = [
    [headX, mitreBaseY - size * 0.055],
    [headX - peakOut * 0.92, mitrePeakY + size * 0.028],
    [headX + peakOut * 0.92, mitrePeakY + size * 0.028],
  ];
  for (const [rbx, rby] of rubyCenters) {
    setShadowBlur(ctx, 7 * zoom, "#fb7185");
    ctx.fillStyle = "#9f1239";
    ctx.beginPath();
    ctx.arc(rbx, rby, rubyR, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    ctx.fillStyle = `rgba(255, 220, 230, ${wisdomPulse * 0.55})`;
    ctx.beginPath();
    ctx.arc(rbx - rubyR * 0.28, rby - rubyR * 0.28, rubyR * 0.38, 0, TAU);
    ctx.fill();
  }

  // === VFX ===
  drawOrbitingDebris(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(251, 191, 36, 0.5)",
    glowColor: "rgba(232, 224, 208, 0.2)",
    count: isAttacking ? 8 : 5,
    speed: isAttacking ? 3 : 1.8,
    particleSize: 0.012,
    minRadius: 0.35,
    maxRadius: 0.5,
    trailLen: 2,
  });

  drawShiftingSegments(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(251, 191, 36, 0.5)",
    colorAlt: "rgba(232, 224, 208, 0.4)",
    count: 5,
    orbitRadius: 0.4,
    segmentSize: 0.02,
    orbitSpeed: 1.5,
    shape: "diamond",
  });

  // Visor glow
  setShadowBlur(ctx, 8 * zoom, accentGold);
  ctx.fillStyle = accentGold;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.06,
      headY + size * 0.01,
      size * 0.012,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Attack: knowledge burst
  if (isAttacking) {
    const force = attackPhase;
    ctx.strokeStyle = `rgba(251, 191, 36, ${force * 0.3})`;
    ctx.lineWidth = 2 * zoom;
    const burstR = size * 0.15 + (1 - force) * size * 0.35;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.3, burstR, burstR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();
  }
}

// ============================================================================
// 7. DEAN — SOVEREIGN MAGISTRATE
//    Authority/decree theme with gold-trimmed ceremonial plate armor
// ============================================================================

export function drawDeanEnemy(
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
  const breath = getBreathScale(time, 1.1, 0.012);
  const sway = getIdleSway(time, 0.6, size * 0.003, size * 0.002);
  const cx = x + sway.dx;
  const bodyBob = sway.dy;

  const metalLight = "#d8c898";
  const metalMid = "#b0a070";
  const metalDark = "#887850";
  const imperialGold = "#f59e0b";
  const royalPurple = "#7c3aed";
  const authorityRed = "#dc2626";

  const authorityPulse = 0.5 + Math.sin(time * 2) * 0.3 + attackIntensity * 0.5;
  const auraExpand = isAttacking ? 1 + attackIntensity * 0.3 : 1;
  const crownGlow = 0.6 + Math.sin(time * 3) * 0.3 + attackIntensity * 0.4;

  // === AUTHORITY AURA (behind body) ===
  const auraGrad = ctx.createRadialGradient(
    cx,
    y - bodyBob,
    0,
    cx,
    y - bodyBob,
    size * 0.85 * auraExpand,
  );
  auraGrad.addColorStop(0, `rgba(245, 158, 11, ${authorityPulse * 0.25})`);
  auraGrad.addColorStop(0.3, `rgba(124, 58, 237, ${authorityPulse * 0.12})`);
  auraGrad.addColorStop(0.6, `rgba(220, 38, 38, ${authorityPulse * 0.06})`);
  auraGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.ellipse(
    cx,
    y - bodyBob,
    size * 0.85 * auraExpand,
    size * 0.55 * auraExpand,
    0,
    0,
    TAU,
  );
  ctx.fill();

  // Authority decree rings
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = size * (0.4 + ring * 0.15) * auraExpand;
    ctx.strokeStyle = `rgba(245, 158, 11, ${(0.2 - ring * 0.05) * authorityPulse})`;
    ctx.lineWidth = (2 - ring * 0.5) * zoom;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      y - bodyBob,
      ringSize,
      ringSize * 0.5,
      0,
      time * 0.5 + ring,
      time * 0.5 + ring + Math.PI * 1.5,
    );
    ctx.stroke();
  }

  // Floating decree scrolls (more detailed, 5 scrolls)
  for (let i = 0; i < 5; i++) {
    const scrollAngle = time * 0.8 + (i * TAU) / 5;
    const scrollDist =
      size * 0.5 +
      Math.sin(time * 1.5 + i) * size * 0.06 +
      (i % 2) * size * 0.06;
    const sx = cx + Math.cos(scrollAngle) * scrollDist;
    const sy =
      y -
      size * 0.1 -
      bodyBob +
      Math.sin(scrollAngle) * scrollDist * 0.3 +
      Math.sin(time * 2.5 + i) * size * 0.02;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(Math.sin(time * 2 + i) * 0.2);
    // Scroll body
    ctx.fillStyle = `rgba(254, 249, 195, ${0.5 + Math.sin(time * 3 + i) * 0.2})`;
    ctx.fillRect(-size * 0.04, -size * 0.035, size * 0.08, size * 0.07);
    // Top curl
    ctx.fillStyle = "#e8d8a0";
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.035, size * 0.045, size * 0.008, 0, 0, TAU);
    ctx.fill();
    // Text lines (more detailed)
    ctx.fillStyle = `rgba(120, 53, 15, ${0.3 + Math.sin(time * 2 + i) * 0.1})`;
    for (let tl = 0; tl < 4; tl++) {
      ctx.fillRect(
        -size * 0.03,
        -size * 0.025 + tl * size * 0.012,
        size * 0.05 + Math.sin(i + tl) * size * 0.01,
        size * 0.004,
      );
    }
    // Gold header bar
    ctx.fillStyle = `rgba(245, 158, 11, ${authorityPulse * 0.5})`;
    ctx.fillRect(-size * 0.035, -size * 0.03, size * 0.07, size * 0.006);
    // Wax seal with glow
    ctx.fillStyle = authorityRed;
    ctx.beginPath();
    ctx.arc(size * 0.02, size * 0.025, size * 0.011, 0, TAU);
    ctx.fill();
    // Seal glow
    ctx.fillStyle = `rgba(220, 38, 38, ${authorityPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(size * 0.02, size * 0.025, size * 0.018, 0, TAU);
    ctx.fill();
    // Seal stamp detail
    ctx.fillStyle = `rgba(252, 165, 165, ${authorityPulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(size * 0.02, size * 0.025, size * 0.005, 0, TAU);
    ctx.fill();
    // Ribbon from seal
    ctx.strokeStyle = authorityRed;
    ctx.lineWidth = size * 0.004;
    ctx.beginPath();
    ctx.moveTo(size * 0.02, size * 0.035);
    ctx.quadraticCurveTo(
      size * 0.025,
      size * 0.05,
      size * 0.015,
      size * 0.055,
    );
    ctx.stroke();
    ctx.restore();
  }

  // === CAPE (behind body, larger with purple lining) ===
  const capeWave = Math.sin(time * 3) * size * 0.025;
  // Cape outer (purple)
  const capeGrad = ctx.createLinearGradient(
    cx,
    y - size * 0.32 - bodyBob,
    cx + capeWave,
    y + size * 0.42 - bodyBob,
  );
  capeGrad.addColorStop(0, royalPurple);
  capeGrad.addColorStop(0.3, "#5b21b6");
  capeGrad.addColorStop(0.7, "#3b0764");
  capeGrad.addColorStop(1, "#1a0330");
  ctx.fillStyle = capeGrad;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.24, y - size * 0.3 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.3 + capeWave * 0.5,
    y + size * 0.08 - bodyBob,
    cx - size * 0.26 + capeWave,
    y + size * 0.42 - bodyBob,
  );
  ctx.lineTo(cx + size * 0.26 + capeWave, y + size * 0.4 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.3,
    y + size * 0.08 - bodyBob,
    cx + size * 0.24,
    y - size * 0.3 - bodyBob,
  );
  ctx.closePath();
  ctx.fill();
  // Cape inner lining (visible at edges)
  ctx.fillStyle = `rgba(245, 158, 11, 0.15)`;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, y - size * 0.28 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.25 + capeWave * 0.5,
    y + size * 0.05 - bodyBob,
    cx - size * 0.24 + capeWave,
    y + size * 0.38 - bodyBob,
  );
  ctx.lineTo(cx - size * 0.26 + capeWave, y + size * 0.42 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.28 + capeWave * 0.5,
    y + size * 0.06 - bodyBob,
    cx - size * 0.24,
    y - size * 0.3 - bodyBob,
  );
  ctx.closePath();
  ctx.fill();
  // Gold trim on cape edges (both sides + bottom)
  ctx.strokeStyle = imperialGold;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.26 + capeWave, y + size * 0.42 - bodyBob);
  ctx.lineTo(cx + size * 0.26 + capeWave, y + size * 0.4 - bodyBob);
  ctx.stroke();
  // Side gold trim
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.24, y - size * 0.3 - bodyBob);
  ctx.quadraticCurveTo(
    cx - size * 0.3 + capeWave * 0.5,
    y + size * 0.08 - bodyBob,
    cx - size * 0.26 + capeWave,
    y + size * 0.42 - bodyBob,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.24, y - size * 0.3 - bodyBob);
  ctx.quadraticCurveTo(
    cx + size * 0.3,
    y + size * 0.08 - bodyBob,
    cx + size * 0.26 + capeWave,
    y + size * 0.4 - bodyBob,
  );
  ctx.stroke();
  // Cape embroidery detail (small fleur-de-lis pattern)
  ctx.fillStyle = `rgba(245, 158, 11, ${0.2 + Math.sin(time * 2) * 0.05})`;
  ctx.font = `${size * 0.03}px serif`;
  ctx.textAlign = "center";
  for (let ce = 0; ce < 3; ce++) {
    const ceY = y - size * 0.05 + ce * size * 0.12 - bodyBob;
    ctx.fillText("⚜", cx, ceY);
  }

  // === ARMORED LEGS ===
  drawPathLegs(ctx, cx, y + size * 0.1 - bodyBob, size, time, zoom, {
    color: metalMid,
    colorDark: metalDark,
    footColor: metalDark,
    trimColor: imperialGold,
    strideSpeed: 2.5,
    strideAmt: 0.15,
    legLen: 0.24,
    width: 0.1,
    footLen: 0.12,
    style: "armored",
  });

  // === ORNATE CEREMONIAL ARMOR SKIRT (heraldic panels) ===
  {
    const skirtY = y - size * 0.02 - bodyBob;
    const panelCount = 7;
    const skirtW = size * 0.26;
    const skirtH = size * 0.17;
    for (let p = 0; p < panelCount; p++) {
      const panelAngle = ((p - (panelCount - 1) / 2) / (panelCount - 1)) * Math.PI * 0.6;
      const px = cx + Math.sin(panelAngle) * skirtW;
      const py = skirtY + Math.abs(Math.sin(panelAngle)) * size * 0.02;
      const pw = size * 0.08;
      const panelGrad = ctx.createLinearGradient(px, py, px, py + skirtH);
      panelGrad.addColorStop(0, metalMid);
      panelGrad.addColorStop(0.5, p % 2 === 0 ? metalLight : metalMid);
      panelGrad.addColorStop(1, metalDark);
      ctx.fillStyle = panelGrad;
      ctx.beginPath();
      ctx.moveTo(px - pw * 0.5, py);
      ctx.lineTo(px + pw * 0.5, py);
      ctx.lineTo(px + pw * 0.45, py + skirtH);
      ctx.lineTo(px - pw * 0.45, py + skirtH);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = metalDark;
      ctx.lineWidth = 0.7 * zoom;
      ctx.stroke();
      // Heraldic detail on alternating panels
      if (p % 2 === 0) {
        ctx.fillStyle = `rgba(245, 158, 11, 0.3)`;
        ctx.beginPath();
        ctx.moveTo(px, py + size * 0.03);
        ctx.lineTo(px - size * 0.015, py + size * 0.06);
        ctx.lineTo(px, py + size * 0.09);
        ctx.lineTo(px + size * 0.015, py + size * 0.06);
        ctx.closePath();
        ctx.fill();
      }
    }
    // Gold band at top of skirt
    ctx.fillStyle = imperialGold;
    ctx.fillRect(cx - skirtW, skirtY - size * 0.01, skirtW * 2, size * 0.018);
  }

  // === WIDE ORNATE CEREMONIAL CUIRASS ===
  ctx.save();
  ctx.translate(cx, y - size * 0.18 - bodyBob);
  ctx.scale(breath, breath);

  const cuirassGrad = ctx.createLinearGradient(
    -size * 0.36, -size * 0.26,
    size * 0.36, size * 0.26,
  );
  cuirassGrad.addColorStop(0, metalDark);
  cuirassGrad.addColorStop(0.12, metalMid);
  cuirassGrad.addColorStop(0.3, metalLight);
  cuirassGrad.addColorStop(0.5, "#f0e0c0");
  cuirassGrad.addColorStop(0.7, metalLight);
  cuirassGrad.addColorStop(0.88, metalMid);
  cuirassGrad.addColorStop(1, metalDark);
  ctx.fillStyle = cuirassGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.34, size * 0.22);
  ctx.bezierCurveTo(-size * 0.38, size * 0.12, -size * 0.4, -size * 0.02, -size * 0.36, -size * 0.16);
  ctx.bezierCurveTo(-size * 0.32, -size * 0.24, -size * 0.22, -size * 0.3, -size * 0.1, -size * 0.33);
  ctx.quadraticCurveTo(0, -size * 0.35, size * 0.1, -size * 0.33);
  ctx.bezierCurveTo(size * 0.22, -size * 0.3, size * 0.32, -size * 0.24, size * 0.36, -size * 0.16);
  ctx.bezierCurveTo(size * 0.4, -size * 0.02, size * 0.38, size * 0.12, size * 0.34, size * 0.22);
  ctx.closePath();
  ctx.fill();

  // Engraved border line (top neckline)
  ctx.strokeStyle = imperialGold;
  ctx.lineWidth = 1.8 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.24);
  ctx.quadraticCurveTo(0, -size * 0.3, size * 0.3, -size * 0.24);
  ctx.stroke();
  // Engraved border line (waist)
  ctx.beginPath();
  ctx.moveTo(-size * 0.32, size * 0.06);
  ctx.quadraticCurveTo(0, size * 0.1, size * 0.32, size * 0.06);
  ctx.stroke();
  // Vertical engraving lines (decorative ribs)
  ctx.strokeStyle = `rgba(245, 158, 11, 0.25)`;
  ctx.lineWidth = 0.8 * zoom;
  for (let v = -2; v <= 2; v++) {
    const vx = v * size * 0.1;
    ctx.beginPath();
    ctx.moveTo(vx, -size * 0.26);
    ctx.lineTo(vx * 1.05, size * 0.18);
    ctx.stroke();
  }

  // Royal purple/gold tabard
  const tabardGrad = ctx.createLinearGradient(
    -size * 0.13,
    -size * 0.24,
    size * 0.13,
    size * 0.18,
  );
  tabardGrad.addColorStop(0, "#3b0764");
  tabardGrad.addColorStop(0.3, royalPurple);
  tabardGrad.addColorStop(0.7, royalPurple);
  tabardGrad.addColorStop(1, "#3b0764");
  ctx.fillStyle = tabardGrad;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.15, size * 0.18);
  ctx.lineTo(-size * 0.15, size * 0.18);
  ctx.closePath();
  ctx.fill();

  // Gold trim on tabard
  ctx.strokeStyle = imperialGold;
  ctx.lineWidth = 2 * zoom;
  ctx.beginPath();
  ctx.moveTo(-size * 0.13, -size * 0.24);
  ctx.lineTo(-size * 0.15, size * 0.18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size * 0.13, -size * 0.24);
  ctx.lineTo(size * 0.15, size * 0.18);
  ctx.stroke();

  // University seal emblem
  ctx.fillStyle = imperialGold;
  ctx.beginPath();
  ctx.arc(0, -size * 0.04, size * 0.04, 0, TAU);
  ctx.fill();
  ctx.fillStyle = royalPurple;
  ctx.beginPath();
  ctx.arc(0, -size * 0.04, size * 0.025, 0, TAU);
  ctx.fill();
  ctx.fillStyle = imperialGold;
  ctx.font = `bold ${size * 0.03}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("P", 0, -size * 0.04);

  ctx.restore();

  // === ORNATE JEWELED GORGET WITH FUR TRIM ===
  {
    const gY = y - size * 0.35 - bodyBob;
    // Fur trim (underneath gorget)
    ctx.fillStyle = "#d4c4a8";
    for (let f = 0; f < 12; f++) {
      const fAngle = Math.PI * 0.15 + (f * Math.PI * 0.7) / 12;
      const fx = cx + Math.cos(fAngle) * size * 0.15;
      const fy = gY + size * 0.02 + Math.sin(fAngle) * size * 0.04;
      ctx.beginPath();
      ctx.ellipse(fx, fy, size * 0.018, size * 0.012, fAngle + Math.sin(time * 2 + f) * 0.1, 0, TAU);
      ctx.fill();
    }
    // Gorget metal band
    const gorgetGrad = ctx.createLinearGradient(
      cx - size * 0.16, gY - size * 0.04,
      cx + size * 0.16, gY + size * 0.04,
    );
    gorgetGrad.addColorStop(0, metalDark);
    gorgetGrad.addColorStop(0.3, metalLight);
    gorgetGrad.addColorStop(0.5, "#f0e0c0");
    gorgetGrad.addColorStop(0.7, metalLight);
    gorgetGrad.addColorStop(1, metalDark);
    ctx.fillStyle = gorgetGrad;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.14, gY + size * 0.04);
    ctx.quadraticCurveTo(cx - size * 0.16, gY - size * 0.02, cx - size * 0.1, gY - size * 0.05);
    ctx.quadraticCurveTo(cx, gY - size * 0.07, cx + size * 0.1, gY - size * 0.05);
    ctx.quadraticCurveTo(cx + size * 0.16, gY - size * 0.02, cx + size * 0.14, gY + size * 0.04);
    ctx.closePath();
    ctx.fill();
    // Gold engraving lines on gorget
    ctx.strokeStyle = imperialGold;
    ctx.lineWidth = 0.8 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.1, gY - size * 0.04);
    ctx.quadraticCurveTo(cx, gY - size * 0.06, cx + size * 0.1, gY - size * 0.04);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.12, gY + size * 0.01);
    ctx.quadraticCurveTo(cx, gY - size * 0.01, cx + size * 0.12, gY + size * 0.01);
    ctx.stroke();
    // Central jewel
    ctx.fillStyle = authorityRed;
    ctx.beginPath();
    ctx.arc(cx, gY - size * 0.01, size * 0.015, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(220, 38, 38, ${authorityPulse * 0.5})`;
    ctx.beginPath();
    ctx.arc(cx, gY - size * 0.01, size * 0.022, 0, TAU);
    ctx.fill();
    // Side jewels
    for (const side of [-1, 1] as const) {
      ctx.fillStyle = imperialGold;
      ctx.beginPath();
      ctx.arc(cx + side * size * 0.07, gY - size * 0.02, size * 0.008, 0, TAU);
      ctx.fill();
    }
  }

  // === MASSIVE CEREMONIAL PAULDRONS ===
  for (const side of [-1, 1] as const) {
    const px = cx + side * size * 0.32;
    const py = y - size * 0.3 - bodyBob;
    // Outer pauldron shell (larger than standard)
    const pauldGrad = ctx.createRadialGradient(
      px - side * size * 0.02, py - size * 0.02, size * 0.01,
      px, py, size * 0.1,
    );
    pauldGrad.addColorStop(0, "#f0e0c0");
    pauldGrad.addColorStop(0.3, metalLight);
    pauldGrad.addColorStop(0.7, metalMid);
    pauldGrad.addColorStop(1, metalDark);
    ctx.fillStyle = pauldGrad;
    ctx.beginPath();
    ctx.moveTo(px - side * size * 0.06, py + size * 0.06);
    ctx.quadraticCurveTo(px - side * size * 0.1, py - size * 0.02, px - side * size * 0.06, py - size * 0.07);
    ctx.quadraticCurveTo(px, py - size * 0.1, px + side * size * 0.06, py - size * 0.07);
    ctx.quadraticCurveTo(px + side * size * 0.1, py - size * 0.01, px + side * size * 0.06, py + size * 0.06);
    ctx.closePath();
    ctx.fill();
    // Pauldron edge trim
    ctx.strokeStyle = imperialGold;
    ctx.lineWidth = 1.5 * zoom;
    ctx.stroke();
    // Engraved ridge lines
    ctx.strokeStyle = `rgba(245, 158, 11, 0.3)`;
    ctx.lineWidth = 0.7 * zoom;
    for (let r = 0; r < 3; r++) {
      const ry = py - size * 0.04 + r * size * 0.03;
      ctx.beginPath();
      ctx.moveTo(px - side * size * 0.05, ry);
      ctx.quadraticCurveTo(px, ry - size * 0.01, px + side * size * 0.05, ry);
      ctx.stroke();
    }
    // Central pauldron gem
    ctx.fillStyle = royalPurple;
    ctx.beginPath();
    ctx.arc(px, py - size * 0.02, size * 0.014, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(124, 58, 237, ${authorityPulse * 0.6})`;
    ctx.beginPath();
    ctx.arc(px, py - size * 0.02, size * 0.02, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${authorityPulse * 0.3})`;
    ctx.beginPath();
    ctx.arc(px - size * 0.004, py - size * 0.024, size * 0.005, 0, TAU);
    ctx.fill();
  }

  // === JEWELED CEREMONIAL BELT WITH SIGNET BUCKLE ===
  {
    const beltY = y - size * 0.04 - bodyBob;
    // Wide belt band
    const beltGrad = ctx.createLinearGradient(
      cx - size * 0.28, beltY,
      cx + size * 0.28, beltY,
    );
    beltGrad.addColorStop(0, "#3e2a15");
    beltGrad.addColorStop(0.3, "#5a3e20");
    beltGrad.addColorStop(0.5, "#6a4e30");
    beltGrad.addColorStop(0.7, "#5a3e20");
    beltGrad.addColorStop(1, "#3e2a15");
    ctx.fillStyle = beltGrad;
    ctx.fillRect(cx - size * 0.28, beltY - size * 0.022, size * 0.56, size * 0.044);
    // Gold trim top and bottom
    ctx.strokeStyle = imperialGold;
    ctx.lineWidth = 1 * zoom;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.28, beltY - size * 0.022);
    ctx.lineTo(cx + size * 0.28, beltY - size * 0.022);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.28, beltY + size * 0.022);
    ctx.lineTo(cx + size * 0.28, beltY + size * 0.022);
    ctx.stroke();
    // Large signet buckle
    ctx.fillStyle = imperialGold;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.035, beltY - size * 0.03);
    ctx.lineTo(cx + size * 0.035, beltY - size * 0.03);
    ctx.lineTo(cx + size * 0.04, beltY);
    ctx.lineTo(cx + size * 0.035, beltY + size * 0.03);
    ctx.lineTo(cx - size * 0.035, beltY + size * 0.03);
    ctx.lineTo(cx - size * 0.04, beltY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 0.8 * zoom;
    ctx.stroke();
    // Signet seal inset
    ctx.fillStyle = royalPurple;
    ctx.beginPath();
    ctx.arc(cx, beltY, size * 0.018, 0, TAU);
    ctx.fill();
    ctx.fillStyle = imperialGold;
    ctx.font = `bold ${size * 0.02}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("P", cx, beltY);
    // Side jewels on belt
    for (const side of [-1, 1] as const) {
      for (let j = 0; j < 2; j++) {
        const jx = cx + side * (size * 0.1 + j * size * 0.08);
        ctx.fillStyle = j === 0 ? authorityRed : imperialGold;
        ctx.beginPath();
        ctx.arc(jx, beltY, size * 0.008, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.beginPath();
        ctx.arc(jx - size * 0.002, beltY - size * 0.002, size * 0.003, 0, TAU);
        ctx.fill();
      }
    }
  }

  // === LEFT ARM — decree scroll ===
  const deanForeLen = 0.14;
  drawPathArm(
    ctx,
    cx - size * 0.3,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    -1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: imperialGold,
      upperLen: 0.16,
      foreLen: deanForeLen,
      width: 0.1,
      shoulderAngle: -0.5 + Math.sin(time * 1.5) * 0.06 + (isAttacking ? -attackIntensity * 0.35 : 0),
      elbowAngle: 0.7 + Math.sin(time * 2) * 0.05 + (isAttacking ? -attackIntensity * 0.25 : 0),
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = deanForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Decree scroll (partially unfurled)
        wCtx.fillStyle = "#f5f0d0";
        wCtx.fillRect(-size * 0.04, -size * 0.1, size * 0.08, size * 0.15);
        // Top roll with gold ends
        wCtx.fillStyle = "#e8d8a0";
        wCtx.beginPath();
        wCtx.ellipse(0, -size * 0.1, size * 0.05, size * 0.012, 0, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = imperialGold;
        wCtx.beginPath();
        wCtx.ellipse(
          -size * 0.05,
          -size * 0.1,
          size * 0.006,
          size * 0.014,
          0,
          0,
          TAU,
        );
        wCtx.fill();
        wCtx.beginPath();
        wCtx.ellipse(
          size * 0.05,
          -size * 0.1,
          size * 0.006,
          size * 0.014,
          0,
          0,
          TAU,
        );
        wCtx.fill();
        // Bottom roll
        wCtx.fillStyle = "#e8d8a0";
        wCtx.beginPath();
        wCtx.ellipse(0, size * 0.05, size * 0.05, size * 0.012, 0, 0, TAU);
        wCtx.fill();
        // Decree text lines (more elaborate)
        wCtx.fillStyle = `rgba(120, 53, 15, ${0.5 + Math.sin(time * 3) * 0.2})`;
        for (let l = 0; l < 6; l++) {
          wCtx.fillRect(
            -size * 0.03,
            -size * 0.085 + l * size * 0.02,
            size * 0.05 + Math.sin(l * 1.5) * size * 0.01,
            size * 0.004,
          );
        }
        // Illuminated capital letter
        wCtx.fillStyle = `rgba(245, 158, 11, ${0.6 + Math.sin(time * 2) * 0.2})`;
        wCtx.font = `bold ${size * 0.025}px serif`;
        wCtx.textAlign = "center";
        wCtx.fillText("D", -size * 0.025, -size * 0.065);
        // Wax seal with glowing P
        wCtx.fillStyle = `rgba(220, 38, 38, ${0.3 + crownGlow * 0.2})`;
        wCtx.beginPath();
        wCtx.arc(size * 0.02, size * 0.03, size * 0.02, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = authorityRed;
        wCtx.beginPath();
        wCtx.arc(size * 0.02, size * 0.03, size * 0.013, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(252, 165, 165, ${crownGlow * 0.6})`;
        wCtx.beginPath();
        wCtx.arc(size * 0.02, size * 0.03, size * 0.007, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = imperialGold;
        wCtx.font = `${size * 0.012}px serif`;
        wCtx.fillText("P", size * 0.02, size * 0.033);
      },
    },
  );

  // === RIGHT ARM — scepter of office ===
  drawPathArm(
    ctx,
    cx + size * 0.3,
    y - size * 0.22 - bodyBob,
    size,
    time,
    zoom,
    1,
    {
      color: metalMid,
      colorDark: metalDark,
      handColor: metalDark,
      trimColor: imperialGold,
      upperLen: 0.16,
      foreLen: deanForeLen,
      width: 0.1,
      shoulderAngle:
        0.5 +
        Math.sin(time * 2) * 0.08 +
        (isAttacking ? attackIntensity * 0.5 : 0),
      elbowAngle: 0.2 + Math.sin(time * 2.5) * 0.06,
      style: "armored",
      onWeapon: (wCtx) => {
        const handY = deanForeLen * size;
        wCtx.translate(0, handY * 0.6);
        // Scepter shaft
        const scepterGrad = wCtx.createLinearGradient(
          -size * 0.01,
          0,
          size * 0.01,
          0,
        );
        scepterGrad.addColorStop(0, metalDark);
        scepterGrad.addColorStop(0.5, imperialGold);
        scepterGrad.addColorStop(1, metalDark);
        wCtx.fillStyle = scepterGrad;
        wCtx.fillRect(-size * 0.012, -size * 0.3, size * 0.024, size * 0.3);
        // Cross-guards
        wCtx.fillStyle = imperialGold;
        wCtx.fillRect(-size * 0.025, -size * 0.24, size * 0.05, size * 0.008);
        // Authority gem at top (pulsing more dramatically)
        wCtx.fillStyle = `rgba(220, 38, 38, ${crownGlow * 0.25})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.32, size * 0.035, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(220, 38, 38, ${crownGlow * 0.8})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.32, size * 0.022, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(252, 165, 165, ${crownGlow * 0.6})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.32, size * 0.012, 0, TAU);
        wCtx.fill();
        wCtx.fillStyle = `rgba(255, 255, 255, ${crownGlow * 0.3})`;
        wCtx.beginPath();
        wCtx.arc(0, -size * 0.32, size * 0.005, 0, TAU);
        wCtx.fill();
        // Pulsing gem rays
        wCtx.strokeStyle = `rgba(252, 165, 165, ${crownGlow * 0.3})`;
        wCtx.lineWidth = size * 0.003;
        for (let gr = 0; gr < 4; gr++) {
          const grA = time * 3 + (gr * TAU) / 4;
          wCtx.beginPath();
          wCtx.moveTo(
            Math.cos(grA) * size * 0.015,
            -size * 0.32 + Math.sin(grA) * size * 0.015,
          );
          wCtx.lineTo(
            Math.cos(grA) * size * 0.03,
            -size * 0.32 + Math.sin(grA) * size * 0.025,
          );
          wCtx.stroke();
        }
        // Gold crown finial
        wCtx.fillStyle = imperialGold;
        wCtx.beginPath();
        wCtx.moveTo(-size * 0.018, -size * 0.3);
        wCtx.lineTo(-size * 0.025, -size * 0.34);
        wCtx.lineTo(-size * 0.008, -size * 0.32);
        wCtx.lineTo(0, -size * 0.36);
        wCtx.lineTo(size * 0.008, -size * 0.32);
        wCtx.lineTo(size * 0.025, -size * 0.34);
        wCtx.lineTo(size * 0.018, -size * 0.3);
        wCtx.closePath();
        wCtx.fill();
      },
    },
  );

  // === HEAD — Jeweled imperial crown over bald head (NOT template helm) ===
  const headY = y - size * 0.52 - bodyBob;
  const headX = cx;
  // Stern authoritative face
  const deanFaceGrad = ctx.createRadialGradient(headX, headY + size * 0.01, 0, headX, headY, size * 0.15);
  deanFaceGrad.addColorStop(0, "#f0dcc0");
  deanFaceGrad.addColorStop(0.7, "#d0b090");
  deanFaceGrad.addColorStop(1, "#b09070");
  ctx.fillStyle = deanFaceGrad;
  ctx.beginPath();
  ctx.arc(headX, headY, size * 0.15, 0, TAU);
  ctx.fill();
  // Commanding eyes
  for (const eSide of [-1, 1]) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(headX + eSide * size * 0.05, headY - size * 0.015, size * 0.022, size * 0.016, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = imperialGold;
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.05, headY - size * 0.015, size * 0.01, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(headX + eSide * size * 0.05, headY - size * 0.015, size * 0.005, 0, TAU);
    ctx.fill();
  }
  // Heavy brow
  ctx.fillStyle = "#8a7a68";
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.1, headY - size * 0.03);
  ctx.quadraticCurveTo(headX, headY - size * 0.05, headX + size * 0.1, headY - size * 0.03);
  ctx.quadraticCurveTo(headX, headY - size * 0.035, headX - size * 0.1, headY - size * 0.03);
  ctx.fill();
  // Stern set jaw
  ctx.strokeStyle = "#9a7a58";
  ctx.lineWidth = 1.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.06, headY + size * 0.06);
  ctx.lineTo(headX + size * 0.06, headY + size * 0.06);
  ctx.stroke();
  // Bald head with noble bearing
  ctx.fillStyle = "#e0c8a0";
  ctx.beginPath();
  ctx.arc(headX, headY - size * 0.06, size * 0.12, Math.PI, TAU);
  ctx.fill();

  // —— Grand imperial war crown (tall, imposing) ——
  const crownBaseY = headY - size * 0.08;
  const crownTopY = headY - size * 0.38;

  // Crown base band — thick gold with jeweled inlay
  const bandGrad = ctx.createLinearGradient(headX - size * 0.18, crownBaseY, headX + size * 0.18, crownBaseY);
  bandGrad.addColorStop(0, "#8a6a20");
  bandGrad.addColorStop(0.2, imperialGold);
  bandGrad.addColorStop(0.5, "#fde68a");
  bandGrad.addColorStop(0.8, imperialGold);
  bandGrad.addColorStop(1, "#8a6a20");
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.moveTo(headX - size * 0.17, crownBaseY + size * 0.02);
  ctx.lineTo(headX + size * 0.17, crownBaseY + size * 0.02);
  ctx.lineTo(headX + size * 0.16, crownBaseY - size * 0.03);
  ctx.lineTo(headX - size * 0.16, crownBaseY - size * 0.03);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6a4a10";
  ctx.lineWidth = 1 * zoom;
  ctx.stroke();

  // Jeweled insets in band
  const bandGems = [authorityRed, royalPurple, imperialGold, royalPurple, authorityRed];
  for (let bg = 0; bg < 5; bg++) {
    const bgX = headX - size * 0.12 + bg * size * 0.06;
    ctx.fillStyle = bandGems[bg];
    ctx.globalAlpha = 0.7 + crownGlow * 0.3;
    ctx.beginPath();
    ctx.ellipse(bgX, crownBaseY - size * 0.005, size * 0.008, size * 0.006, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Crown body — 7 tall fleur-de-lis points rising from band
  const crownPoints = 7;
  for (let cp = 0; cp < crownPoints; cp++) {
    const t = cp / (crownPoints - 1);
    const cpX = headX - size * 0.14 + t * size * 0.28;
    const ptH = cp === 3 ? size * 0.3 : (cp === 1 || cp === 5) ? size * 0.22 : size * 0.18;
    const ptTop = crownBaseY - size * 0.03 - ptH;

    // Point body
    const ptGrad = ctx.createLinearGradient(cpX, crownBaseY - size * 0.03, cpX, ptTop);
    ptGrad.addColorStop(0, imperialGold);
    ptGrad.addColorStop(0.5, "#fde68a");
    ptGrad.addColorStop(1, imperialGold);
    ctx.fillStyle = ptGrad;
    ctx.beginPath();
    ctx.moveTo(cpX - size * 0.015, crownBaseY - size * 0.03);
    ctx.quadraticCurveTo(cpX - size * 0.018, ptTop + ptH * 0.3, cpX - size * 0.008, ptTop + size * 0.01);
    ctx.quadraticCurveTo(cpX, ptTop - size * 0.005, cpX + size * 0.008, ptTop + size * 0.01);
    ctx.quadraticCurveTo(cpX + size * 0.018, ptTop + ptH * 0.3, cpX + size * 0.015, crownBaseY - size * 0.03);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8a6a20";
    ctx.lineWidth = 0.6 * zoom;
    ctx.stroke();

    // Gem at each point tip
    const gemColor = cp === 3 ? authorityRed : (cp % 2 === 0 ? royalPurple : imperialGold);
    const gemR = cp === 3 ? size * 0.01 : size * 0.006;
    setShadowBlur(ctx, 4 * zoom, gemColor);
    ctx.fillStyle = gemColor;
    ctx.beginPath();
    ctx.arc(cpX, ptTop + size * 0.015, gemR, 0, TAU);
    ctx.fill();
    clearShadow(ctx);
    // Gem highlight
    ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(time * 4 + cp) * 0.2})`;
    ctx.beginPath();
    ctx.arc(cpX + size * 0.002, ptTop + size * 0.012, gemR * 0.4, 0, TAU);
    ctx.fill();
  }

  // Cross atop center point
  const crossY = crownTopY - size * 0.04;
  ctx.fillStyle = imperialGold;
  ctx.fillRect(headX - size * 0.003, crossY - size * 0.03, size * 0.006, size * 0.04);
  ctx.fillRect(headX - size * 0.015, crossY - size * 0.015, size * 0.03, size * 0.006);
  setShadowBlur(ctx, 6 * zoom, imperialGold);
  ctx.fillStyle = `rgba(251, 191, 36, ${crownGlow * 0.8})`;
  ctx.beginPath();
  ctx.arc(headX, crossY - size * 0.01, size * 0.008, 0, TAU);
  ctx.fill();
  clearShadow(ctx);

  // Divine authority radiance from crown
  const radianceAlpha = crownGlow * 0.15 + (isAttacking ? attackIntensity * 0.15 : 0);
  const radianceGrad = ctx.createRadialGradient(headX, crownBaseY - size * 0.15, 0, headX, crownBaseY - size * 0.15, size * 0.35);
  radianceGrad.addColorStop(0, `rgba(251, 191, 36, ${radianceAlpha})`);
  radianceGrad.addColorStop(0.5, `rgba(245, 158, 11, ${radianceAlpha * 0.5})`);
  radianceGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = radianceGrad;
  ctx.beginPath();
  ctx.arc(headX, crownBaseY - size * 0.15, size * 0.35, 0, TAU);
  ctx.fill();

  // Floating divine motes around crown
  for (let m = 0; m < 4; m++) {
    const mAngle = time * 1.2 + m * TAU / 4;
    const mDist = size * 0.22 + Math.sin(time * 2 + m) * size * 0.02;
    const mx = headX + Math.cos(mAngle) * mDist;
    const my = crownBaseY - size * 0.15 + Math.sin(mAngle) * mDist * 0.3;
    ctx.fillStyle = `rgba(251, 191, 36, ${0.3 + Math.sin(time * 3 + m) * 0.15})`;
    ctx.beginPath();
    ctx.arc(mx, my, size * 0.004, 0, TAU);
    ctx.fill();
  }

  // === VFX ===
  drawOrbitingDebris(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(245, 158, 11, 0.5)",
    glowColor: "rgba(251, 191, 36, 0.2)",
    count: isAttacking ? 10 : 6,
    speed: isAttacking ? 3 : 1.5,
    particleSize: 0.014,
    minRadius: 0.35,
    maxRadius: 0.55,
    trailLen: 3,
  });

  drawShiftingSegments(ctx, cx, y - size * 0.1 - bodyBob, size, time, zoom, {
    color: "rgba(245, 158, 11, 0.5)",
    colorAlt: "rgba(124, 58, 237, 0.4)",
    count: 6,
    orbitRadius: 0.42,
    segmentSize: 0.025,
    orbitSpeed: 1.2,
    shape: "diamond",
  });

  // Pulsing authority rings
  drawPulsingGlowRings(
    ctx,
    cx,
    y - size * 0.1 - bodyBob,
    size * 0.1,
    time,
    zoom,
    {
      color: "rgba(245, 158, 11, 0.4)",
      count: 3,
      speed: 1.5,
      maxAlpha: 0.3 + (isAttacking ? attackIntensity * 0.3 : 0),
      expansion: 2.0,
    },
  );

  // Visor glow
  setShadowBlur(ctx, 10 * zoom, imperialGold);
  ctx.fillStyle = imperialGold;
  for (const eSide of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      headX + eSide * size * 0.06,
      headY + size * 0.01,
      size * 0.012,
      0,
      TAU,
    );
    ctx.fill();
  }
  clearShadow(ctx);

  // Attack: authority decree shockwave
  if (isAttacking) {
    const force = attackPhase;
    const burstR = size * 0.2 + (1 - force) * size * 0.5;
    ctx.strokeStyle = `rgba(245, 158, 11, ${force * 0.35})`;
    ctx.lineWidth = 2.5 * zoom;
    ctx.beginPath();
    ctx.ellipse(cx, y + size * 0.3, burstR, burstR * ISO_Y_RATIO, 0, 0, TAU);
    ctx.stroke();

    // Authority runes in burst
    ctx.fillStyle = `rgba(251, 191, 36, ${force * 0.3})`;
    ctx.font = `${size * 0.05}px serif`;
    ctx.textAlign = "center";
    for (let r = 0; r < 6; r++) {
      const rAngle = (r / 6) * TAU + time * 2;
      const rDist = burstR * 0.7;
      ctx.fillText(
        "⚜",
        cx + Math.cos(rAngle) * rDist,
        y + size * 0.3 + Math.sin(rAngle) * rDist * ISO_Y_RATIO,
      );
    }
  }
}
